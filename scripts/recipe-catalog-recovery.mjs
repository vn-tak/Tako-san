import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { migrationManifest } from './release-check.mjs';
import { loadCertifiedV1Authority } from './t21r-v1-authority.mjs';

const TIP = '0038_auth_onboarding_completion.sql';
const FINGERPRINT = 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37';
const RELEASE = 'rel-bd00a4f53fcaeee4';
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const certifiedSources = new WeakSet();
export const RECOVERY_TABLES = freeze({
  recipes: ['id', 'slug', 'title', 'description', 'cuisine', 'cook_time_minutes', 'servings',
    'difficulty', 'image_url', 'tags', 'created_at', 'family_id', 'prep_time_minutes',
    'source_type', 'source_reference', 'verification_state', 'version'],
  recipe_ingredients: ['id', 'recipe_id', 'ingredient_id', 'name', 'required_quantity', 'unit', 'is_optional'],
  recipe_steps: ['id', 'recipe_id', 'step_number', 'instruction', 'tip', 'timer_minutes'],
  recipe_runtime_fields: ['recipe_id', 'runtime_order', 'category', 'region',
    'legacy_calories', 'legacy_protein_g', 'legacy_fat_g', 'legacy_carb_g'],
  recipe_runtime_ingredient_order: ['recipe_ingredient_id', 'recipe_id', 'position'],
  recipe_classifications: ['recipe_id', 'kind', 'tag'],
  recipe_nutrition: ['recipe_id', 'recipe_version', 'nutrition_profile_id'],
});
const tableNames = Object.keys(RECOVERY_TABLES);
const recipeFields = RECOVERY_TABLES.recipes.filter((field) => field !== 'created_at');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const digest = (value) => sha256(JSON.stringify(value));
const plainRows = (rows) => rows.map((row) => ({ ...row }));

function literal(value) {
  if (value === null) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && !value.includes('\0')) return `'${value.replaceAll("'", "''")}'`;
  throw new Error('Recovery source contains an unsupported SQL value');
}
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function columns(table, includeCreatedAt = true) {
  return table === 'recipes' && !includeCreatedAt ? recipeFields : RECOVERY_TABLES[table];
}
function select(table, from = table, includeCreatedAt = true) {
  return `SELECT ${columns(table, includeCreatedAt).join(', ')} FROM ${from}`;
}
function typedSelect(table, from, includeCreatedAt = true) {
  const fields = columns(table, includeCreatedAt);
  return `SELECT ${[...fields, ...fields.map((field) => `typeof(${field})`)].join(', ')} FROM ${from}`;
}
function equalRows(table, left, right, includeCreatedAt = true) {
  const a = typedSelect(table, left, includeCreatedAt);
  const b = typedSelect(table, right, includeCreatedAt);
  return `(SELECT count(1) FROM ${left}) = (SELECT count(1) FROM ${right})
    AND NOT EXISTS (${a} EXCEPT ${b}) AND NOT EXISTS (${b} EXCEPT ${a})`;
}
function valuesQuery(fields, rows) {
  if (!rows.length) return `SELECT ${fields.map((field) => `NULL AS "${field}"`).join(', ')} WHERE 0`;
  const values = rows.map((row) => `(${fields.map((field) => literal(row[field])).join(', ')})`).join(', ');
  return `SELECT ${fields.map((field, index) => `column${index + 1} AS "${field}"`).join(', ')} FROM (VALUES ${values})`;
}
function identicalQuery(actual, expected) {
  return `NOT EXISTS (${actual} EXCEPT ${expected}) AND NOT EXISTS (${expected} EXCEPT ${actual})`;
}
function insertChunks(table, fields, rows) {
  const statements = [];
  let chunk = [];
  let bytes = 0;
  const emit = () => {
    if (chunk.length) statements.push(`INSERT INTO ${table} (${fields.join(', ')}) VALUES\n${chunk.join(',\n')}`);
    chunk = []; bytes = 0;
  };
  for (const row of rows) {
    const tuple = `(${fields.map((field) => literal(row[field])).join(', ')})`;
    const length = Buffer.byteLength(tuple);
    if (length > 80000) throw new Error('Recovery source row exceeds the bounded D1 statement limit');
    if (chunk.length >= 50 || bytes + length > 80000) emit();
    chunk.push(tuple); bytes += length;
  }
  emit();
  return statements;
}
function immutable(table) {
  return ['INSERT', 'UPDATE', 'DELETE'].map((operation) =>
    `CREATE TRIGGER ${table}_${operation.toLowerCase()} BEFORE ${operation} ON ${table}
      BEGIN SELECT RAISE(ABORT, 'Immutable catalog recovery evidence'); END`);
}

/** Replays immutable SQL locally and independently checks it against the certified runtime release. */
export async function loadCertifiedRecoverySource({ sha, cwd = process.cwd() }) {
  if (!SHA.test(sha ?? '')) throw new Error('Recovery source requires an exact Git SHA');
  const schema = migrationManifest(cwd, sha);
  if (schema.count !== 39 || schema.migrations[37]?.name !== TIP
      || schema.migrations[38]?.name !== '0039_meal_composition_v2.sql') {
    throw new Error('Recovery source requires the reviewed 0038 historical prefix');
  }
  const authority = await loadCertifiedV1Authority(cwd);
  if (authority.releaseManifest.releaseId !== RELEASE
      || authority.releaseManifest.expectedRuntimeFingerprint !== FINGERPRINT) {
    throw new Error('Recovery source is not the certified V1 release');
  }
  const db = new DatabaseSync(':memory:');
  let vite;
  try {
    db.exec('PRAGMA foreign_keys = ON');
    for (const migration of schema.migrations.slice(0, 38)) {
      const bytes = readFileSync(path.join(cwd, 'migrations', migration.name));
      if (!HASH.test(migration.sha256) || sha256(bytes) !== migration.sha256) {
        throw new Error('Immutable recovery migration source hash drift');
      }
      db.exec(bytes.toString('utf8'));
    }
    vite = await createServer({ root: cwd, server: { middlewareMode: true }, appType: 'custom',
      logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] } });
    const { prepareRecipeContentRead, mapRecipeContentRead } = await vite.ssrLoadModule('/packages/db/src/recipe-content.ts');
    const { hydrateRuntimeRecipes } = await vite.ssrLoadModule('/packages/recipes/src/runtime-hydration.ts');
    const { fingerprintRecipes } = await vite.ssrLoadModule('/packages/recipes/src/catalog-fingerprint.ts');
    const statements = prepareRecipeContentRead({ prepare: (sql) => sql });
    const hydration = hydrateRuntimeRecipes(mapRecipeContentRead(statements.map((sql) =>
      ({ success: true, results: db.prepare(sql).all() }))));
    if (hydration.recipes.length !== 500 || hydration.failures.length
        || await fingerprintRecipes(hydration.recipes) !== FINGERPRINT
        || db.prepare('PRAGMA foreign_key_check').all().length) {
      throw new Error('Historical source fails independent certified V1 hydration');
    }
    const tables = Object.fromEntries(tableNames.map((table) => [table,
      plainRows(db.prepare(`${select(table, table, false)} ORDER BY ${columns(table, false).join(', ')}`).all())]));
    if (tables.recipe_ingredients.length !== 2702 || tables.recipe_steps.length !== 2064
        || tables.recipe_runtime_ingredient_order.length !== 2702 || tables.recipe_nutrition.length
        || tables.recipes.some((recipe) => recipe.version !== 1)) {
      throw new Error('Recovery source has unexpected V1 version or linked nutrition');
    }
    const tableInfo = Object.fromEntries(tableNames.map((table) => [table,
      plainRows(db.prepare(`PRAGMA table_xinfo(${table})`).all())]));
    for (const table of tableNames) {
      if (JSON.stringify(tableInfo[table].map((column) => column.name)) !== JSON.stringify(RECOVERY_TABLES[table])) {
        throw new Error('Recovery source has an unreviewed table shape');
      }
    }
    const triggers = plainRows(db.prepare(`SELECT name, tbl_name, sql FROM sqlite_schema
      WHERE type = 'trigger' AND tbl_name IN (${tableNames.map(literal).join(', ')}) ORDER BY name`).all());
    const incomingFks = plainRows(db.prepare(`SELECT s.name, f.id, f.seq, f."table", f."from", f."to",
      f.on_update, f.on_delete, f.match FROM sqlite_schema s JOIN pragma_foreign_key_list(s.name) f
      WHERE s.type = 'table' AND f."table" IN (${tableNames.map(literal).join(', ')})
      ORDER BY s.name, f.id, f.seq`).all());
    const source = freeze({ schemaVersion: 1, sha, ledger: schema.migrations.slice(0, 38).map(({ name }) => name),
      releaseId: RELEASE, fingerprint: FINGERPRINT, authorityProof: authority.authorityProof,
      tables, tableInfo, triggers, incomingFks,
      sourceDigest: digest({ tables, tableInfo, triggers, incomingFks }),
    });
    certifiedSources.add(source);
    return source;
  } finally {
    await vite?.close();
    db.close();
  }
}

/** Compiles SQL only. No connector, subprocess, remote executor or production write path exists here. */
export function compileRecipeCatalogRecovery({ source, repairId, expectedIngredientRows = 6720 }) {
  if (!certifiedSources.has(source)) throw new Error('Recovery compiler requires its certified immutable local source');
  if (!/^[a-z][a-z0-9_]{7,48}$/.test(repairId ?? '')) throw new Error('Recovery ID must be a bounded SQL identifier');
  if (expectedIngredientRows !== 6720) throw new Error('Recovery compiler is bounded to the observed 6720-line state');
  const prefix = `catalog_recovery_${repairId}`;
  const archiveTables = Object.fromEntries(tableNames.map((table) => [table, `${prefix}_archive_${table}`]));
  const targetTables = Object.fromEntries(tableNames.map((table) => [table, `${prefix}_target_${table}`]));
  const guard = `${prefix}_guard`;
  const status = `${prefix}_status`;
  const restore = [`CREATE TABLE ${guard} (label TEXT NOT NULL, ok INTEGER NOT NULL CHECK (ok = 1))`];
  const rollback = [`CREATE TABLE ${prefix}_rollback_guard (label TEXT NOT NULL, ok INTEGER NOT NULL CHECK (ok = 1))`];
  const check = (output, label, condition, guardTable = guard) => output.push(
    `INSERT INTO ${guardTable} (label, ok) SELECT ${literal(label)}, CASE WHEN ${condition} THEN 1 ELSE 0 END`);
  const rcheck = (label, condition) => check(rollback, label, condition, `${prefix}_rollback_guard`);
  const schemaConditions = [];
  for (const table of tableNames) {
    const fields = ['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk', 'hidden'];
    schemaConditions.push(identicalQuery(`SELECT ${fields.map((field) => `"${field}"`).join(', ')}
      FROM pragma_table_xinfo(${literal(table)})`, valuesQuery(fields, source.tableInfo[table])));
  }
  schemaConditions.push(identicalQuery(`SELECT name, tbl_name, sql FROM sqlite_schema WHERE type = 'trigger'
    AND tbl_name IN (${tableNames.map(literal).join(', ')})`, valuesQuery(['name', 'tbl_name', 'sql'], source.triggers)));
  const fkFields = ['name', 'id', 'seq', 'table', 'from', 'to', 'on_update', 'on_delete', 'match'];
  schemaConditions.push(identicalQuery(`SELECT s.name, f.id, f.seq, f."table", f."from", f."to",
    f.on_update, f.on_delete, f.match FROM sqlite_schema s JOIN pragma_foreign_key_list(s.name) f
    WHERE s.type = 'table' AND f."table" IN (${tableNames.map(literal).join(', ')})`, valuesQuery(fkFields, source.incomingFks)));
  const ledgerQuery = `SELECT name FROM d1_migrations`;
  const ledgerExpected = valuesQuery(['name'], source.ledger.map((name) => ({ name })));
  const ledgerCondition = `(SELECT count(1) FROM d1_migrations) = 38 AND ${identicalQuery(ledgerQuery, ledgerExpected)}`;
  const schemaCondition = schemaConditions.join(' AND ');
  check(restore, 'known_schema_and_references', schemaCondition);
  check(restore, 'exact_0038_ledger', ledgerCondition);
  check(restore, 'foreign_keys_enabled_and_clean',
    `(SELECT foreign_keys FROM pragma_foreign_keys) = 1 AND NOT EXISTS (SELECT 1 FROM pragma_foreign_key_check)`);
  check(restore, 'bounded_observed_catalog', `(SELECT count(1) FROM recipes) = 500
    AND (SELECT count(1) FROM recipe_ingredients) = ${expectedIngredientRows}
    AND (SELECT count(1) FROM recipe_runtime_ingredient_order) = 0`);
  for (const table of tableNames) {
    const fields = columns(table, false);
    restore.push(`CREATE TABLE ${targetTables[table]} AS SELECT ${fields.join(', ')} FROM ${table} WHERE 0`);
    restore.push(...insertChunks(targetTables[table], fields, source.tables[table]));
    restore.push(...immutable(targetTables[table]));
  }
  check(restore, 'exact_target_recipe_ids', identicalQuery('SELECT id FROM recipes', `SELECT id FROM ${targetTables.recipes}`));
  check(restore, 'required_target_ingredient_registry', `NOT EXISTS (SELECT 1 FROM ${targetTables.recipe_ingredients} l
    LEFT JOIN ingredients i ON i.id = l.ingredient_id WHERE i.id IS NULL)`);
  check(restore, 'nutrition_versions_consistent', `NOT EXISTS (SELECT 1 FROM recipe_nutrition n LEFT JOIN recipes r
    ON r.id = n.recipe_id AND r.version = n.recipe_version WHERE r.id IS NULL)`);
  check(restore, 'original_ingredients_reinsertable', `NOT EXISTS (SELECT 1 FROM recipe_ingredients
    WHERE required_quantity IS NULL OR NOT (required_quantity > 0 AND required_quantity < 1e308)
    OR is_optional IS NULL OR is_optional NOT IN (0, 1)
    OR unit IS NULL OR unit NOT IN (SELECT code FROM measurement_units))`);
  for (const table of tableNames) {
    restore.push(`CREATE TABLE ${archiveTables[table]} AS ${select(table)} WHERE 0`);
    restore.push(`INSERT INTO ${archiveTables[table]} (${columns(table).join(', ')}) ${select(table)}`);
    check(restore, `lossless_archive_${table}`, equalRows(table, table, archiveTables[table]));
    restore.push(...immutable(archiveTables[table]));
  }
  const switchCatalog = (output, data, includeCreatedAt) => {
    // Unlink versioned nutrition first; update recipe parents so customer FKs never cascade.
    output.push('DELETE FROM recipe_nutrition', 'DELETE FROM recipe_runtime_ingredient_order',
      'DELETE FROM recipe_ingredients', 'DELETE FROM recipe_steps', 'DELETE FROM recipe_runtime_fields',
      'DELETE FROM recipe_classifications');
    // Temporary unique slugs handle permutations without deleting or replacing recipe parents.
    output.push(`UPDATE recipes SET slug = ${literal(`${prefix}-`)} || id`);
    const fields = columns('recipes', includeCreatedAt).filter((field) => field !== 'id');
    output.push(`UPDATE recipes SET ${fields.map((field) =>
      `${field} = (SELECT t.${field} FROM ${data.recipes} t WHERE t.id = recipes.id)`).join(',\n')}`);
    for (const table of tableNames.filter((table) => table !== 'recipes')) {
      output.push(`INSERT INTO ${table} (${columns(table).join(', ')}) ${select(table, data[table])}`);
    }
  };
  const safeTemporarySlugs = `NOT EXISTS (SELECT 1 FROM recipes WHERE substr(slug, 1, ${prefix.length + 1}) = ${literal(`${prefix}-`)})`;
  check(restore, 'temporary_slug_namespace_unused', safeTemporarySlugs);
  switchCatalog(restore, targetTables, false);
  for (const table of tableNames) {
    check(restore, `exact_target_${table}`, equalRows(table, table, targetTables[table], false));
  }
  check(restore, 'original_parent_timestamps', identicalQuery('SELECT id, created_at FROM recipes',
    `SELECT id, created_at FROM ${archiveTables.recipes}`));
  check(restore, 'post_ledger_and_foreign_keys', `${ledgerCondition} AND NOT EXISTS (SELECT 1 FROM pragma_foreign_key_check)`);
  restore.push(`CREATE TABLE ${status} (repair_id TEXT PRIMARY KEY, source_digest TEXT NOT NULL,
    runtime_fingerprint TEXT NOT NULL, state TEXT NOT NULL CHECK (state IN ('APPLIED', 'ROLLED_BACK')))`);
  restore.push(`INSERT INTO ${status} VALUES (${literal(repairId)}, ${literal(source.sourceDigest)}, ${literal(FINGERPRINT)}, 'APPLIED')`);
  rcheck('exact_recovery_identity', `(SELECT count(1) FROM ${status}) = 1 AND EXISTS (SELECT 1 FROM ${status}
    WHERE repair_id = ${literal(repairId)} AND source_digest = ${literal(source.sourceDigest)}
    AND runtime_fingerprint = ${literal(FINGERPRINT)} AND state = 'APPLIED')`);
  rcheck('unchanged_0038_schema_and_ledger', `${schemaCondition} AND ${ledgerCondition}
    AND (SELECT foreign_keys FROM pragma_foreign_keys) = 1 AND NOT EXISTS (SELECT 1 FROM pragma_foreign_key_check)`);
  for (const table of tableNames) rcheck(`unchanged_target_${table}`, equalRows(table, table, targetTables[table], false));
  rcheck('unchanged_parent_timestamps', identicalQuery('SELECT id, created_at FROM recipes',
    `SELECT id, created_at FROM ${archiveTables.recipes}`));
  rcheck('temporary_slug_namespace_unused', safeTemporarySlugs);
  switchCatalog(rollback, archiveTables, true);
  for (const table of tableNames) rcheck(`exact_archive_${table}`, equalRows(table, table, archiveTables[table]));
  rcheck('post_ledger_and_foreign_keys', `${ledgerCondition} AND NOT EXISTS (SELECT 1 FROM pragma_foreign_key_check)`);
  rollback.push(`UPDATE ${status} SET state = 'ROLLED_BACK' WHERE repair_id = ${literal(repairId)} AND state = 'APPLIED'`);
  const sql = restore.map((statement) => `${statement};`).join('\n\n') + '\n';
  const rollbackSql = rollback.map((statement) => `${statement};`).join('\n\n') + '\n';
  if ([...restore, ...rollback].some((statement) => Buffer.byteLength(statement) > 100000)) {
    throw new Error('Recovery SQL statement exceeds the D1 100KB query limit');
  }
  return { statements: restore, rollbackStatements: rollback, sql, rollbackSql, archiveTables, targetTables,
    receipt: {
      schemaVersion: 1, status: 'OFFLINE_PLAN_ONLY', remoteExecutionAuthorized: false, repairId,
      sourceSha: source.sha, historicalTip: TIP, releaseId: RELEASE, runtimeFingerprint: FINGERPRINT,
      sourceDigest: source.sourceDigest, sqlSha256: sha256(sql), rollbackSqlSha256: sha256(rollbackSql),
      expectedBefore: { recipes: 500, ingredientRows: 6720, orderRows: 0, ledgerRows: 38 },
      expectedAfter: { recipes: 500, ingredientRows: 2702, steps: 2064, orderRows: 2702, linkedNutrition: 0 },
      atomicExecutionRequired: true, rawProductionRowsInOutput: false,
      prerequisites: ['approved V1 active catalog replacement', 'verified static production routing',
        'catalog writers frozen', 'fresh exact-main identity and ledger proof',
        'one confirmed atomic D1 import or batch', 'private archive retention and capacity check',
        'independent post-import hydration and fingerprint proof'],
    },
  };
}

async function cli() {
  const [sha, repairId, sqlFile, rollbackFile, receiptFile] = process.argv.slice(2);
  if (!sha || !repairId || !sqlFile || !rollbackFile || !receiptFile || process.argv.length !== 7) {
    throw new Error('Usage: node scripts/recipe-catalog-recovery.mjs <exact-sha> <repair-id> <sql-file> <rollback-file> <receipt-file>');
  }
  const plan = compileRecipeCatalogRecovery({ source: await loadCertifiedRecoverySource({ sha }), repairId });
  writeFileSync(sqlFile, plan.sql);
  writeFileSync(rollbackFile, plan.rollbackSql);
  writeFileSync(receiptFile, JSON.stringify(plan.receipt, null, 2) + '\n');
  process.stdout.write(JSON.stringify(plan.receipt, null, 2) + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  cli().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
