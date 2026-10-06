import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeContentRead, prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { hydrateRuntimeRecipes } from '../../packages/recipes/src/runtime-hydration';
import { fingerprintRecipes } from '../../packages/recipes/src/catalog-fingerprint';
import { prepareRankingNutritionRead, createRankingEvidenceProviderFromNutritionRows } from '../../packages/db/src/ranking-nutrition';
import {
  RECOVERY_TABLES, RECOVERY_INTERNAL_TABLE_DDL, loadCertifiedRecoverySource,
  compileRecipeCatalogRecovery, compileOriginalCatalogImportInspection,
} from '../../scripts/recipe-catalog-recovery.mjs';

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const tip = '0038_auth_onboarding_completion.sql';
const repairId = 't21_v1_restore_rehearsal';
const documentedInternalSql = `${RECOVERY_INTERNAL_TABLE_DDL}; INSERT INTO _cf_KV VALUES ('proof', X'0011FF')`;
let source;
let plan;
let db;

async function apply(statements = plan.statements) {
  const execute = db.execute;
  db.execute = function (sql, bindings) {
    try { return execute.call(this, sql, bindings); }
    catch (error) { error.message += `; statement: ${sql.slice(0, 180)}`; throw error; }
  };
  try { return await db.batch(statements.map((sql) => db.prepare(sql))); }
  finally { db.execute = execute; }
}
function snapshot(table) {
  const fields = db.query(`PRAGMA table_info(${table})`).map((row) => row.name);
  return db.query(`SELECT ${fields.map((field) => `quote(${field}) AS "${field}", typeof(${field}) AS "type_${field}"`).join(', ')}
    FROM ${table} ORDER BY ${fields.join(', ')}`);
}
const catalog = () => Object.fromEntries(Object.keys(RECOVERY_TABLES).map((table) => [table, snapshot(table)]));
const recoveryObjects = () => db.query("SELECT name FROM sqlite_schema WHERE name LIKE 'catalog_recovery_%' ORDER BY name");
async function hydration() {
  return hydrateRuntimeRecipes(mapRecipeContentRead(await db.batch(prepareRecipeContentRead(db))));
}
function observedState() {
  db.seed("CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, applied_at TEXT NOT NULL DEFAULT '2026-10-05')");
  for (const name of db.migrations) db.execute('INSERT INTO d1_migrations (name) VALUES (?)', [name]);
  db.seed("DELETE FROM recipe_runtime_ingredient_order; UPDATE recipes SET version = 2, title = title || ' unreviewed', prep_time_minutes = 1");
  db.seed("INSERT INTO ingredients (id, name_vi, name_en, category) VALUES ('ING_ENR_REHEARSAL', 'Unreviewed', 'Unreviewed', 'spice')");
  db.seed("UPDATE recipe_ingredients SET required_quantity = required_quantity + 0.125, name = 'O''Brien \"unreviewed\"'");
  const ids = db.query('SELECT id FROM recipes ORDER BY id').map((row) => row.id);
  db.seed(`INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, name, required_quantity, unit, is_optional) VALUES
    ${Array.from({ length: 4018 }, (_, index) =>
      `('live_extra_${index}', '${ids[index % ids.length]}', 'ING_ENR_REHEARSAL', 'Original enrichment ${index}', ${index + 0.25}, 'g', ${index % 2})`).join(',\n')}`);
  db.seed("UPDATE recipe_steps SET instruction = 'Original enrichment', tip = NULL");
  db.seed("UPDATE recipe_runtime_fields SET legacy_calories = 99999 WHERE legacy_calories IS NOT NULL");
  db.seed("DELETE FROM recipe_classifications; INSERT INTO recipe_classifications SELECT id, 'dietary', 'unreviewed_dietary' FROM recipes");
  db.seed("INSERT INTO nutrition_profiles (id, basis_quantity, basis_unit, source_type, source_reference, energy_kcal) VALUES ('live_profile', 1, 'serving', 'estimated', 'rehearsal:unreviewed', 9999)");
  db.seed("INSERT INTO ingredient_nutrition VALUES ('ING_ENR_REHEARSAL', 'live_profile'); INSERT INTO recipe_nutrition SELECT id, version, 'live_profile' FROM recipes");
  // Exercise SQLite storage classes that a JSON/JavaScript archive would lose or round.
  db.seed("UPDATE recipes SET description = X'0001FF' WHERE id = 'gl-01'; UPDATE recipe_steps SET timer_minutes = 9223372036854775800 WHERE id = (SELECT id FROM recipe_steps ORDER BY id LIMIT 1)");
}

// Python exposes SQLite's authorizer, which models D1's reserved-name PRAGMA rejection.
function authorizedRecovery(statementSets, extraSql = RECOVERY_INTERNAL_TABLE_DDL) {
  const input = {
    migrations: source.ledger.map((name) => ({ name, sql: readFileSync(path.join('migrations', name), 'utf8') })),
    statementSets, extraSql, tables: RECOVERY_TABLES,
  };
  const script = `
import json, sqlite3, sys
payload = json.load(sys.stdin)
connection = sqlite3.connect(':memory:')
connection.execute('PRAGMA foreign_keys = ON')
for migration in payload['migrations']:
    connection.executescript(migration['sql'])
connection.execute('CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, applied_at TEXT NOT NULL)')
connection.executemany('INSERT INTO d1_migrations (name, applied_at) VALUES (?, ?)', [(m['name'], 'offline') for m in payload['migrations']])
connection.execute('DELETE FROM recipe_runtime_ingredient_order')
recipe_id, ingredient_id = connection.execute('SELECT recipe_id, ingredient_id FROM recipe_ingredients ORDER BY id LIMIT 1').fetchone()
connection.executemany('INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, name, required_quantity, unit, is_optional) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [('offline_extra_' + str(i), recipe_id, ingredient_id, 'Offline', 1, 'g', 0) for i in range(4018)])
connection.commit()
connection.executescript(payload['extraSql'])
connection.commit()
expected_tables = sorted(row[0] for row in connection.execute("SELECT name FROM sqlite_schema WHERE type = 'table' AND name <> '_cf_KV'"))
def catalog_snapshot():
    return {table: connection.execute('SELECT ' + ', '.join(fields) + ' FROM ' + table + ' ORDER BY ' + ', '.join(fields)).fetchall()
        for table, fields in payload['tables'].items()}
original = catalog_snapshot()
visited = []
def authorize(action, first, second, database, context):
    if action == sqlite3.SQLITE_PRAGMA and first.lower() == 'foreign_key_list':
        visited.append(second)
        if second and second.lower().startswith('_cf_'):
            return sqlite3.SQLITE_DENY
    return sqlite3.SQLITE_OK
connection.set_authorizer(authorize)
phases = []
for statements in payload['statementSets']:
    visited.clear()
    before = catalog_snapshot()
    error = None
    failed_statement = None
    connection.execute('BEGIN IMMEDIATE')
    try:
        for index, statement in enumerate(statements):
            connection.execute(statement).fetchall()
        connection.commit()
    except sqlite3.DatabaseError as failure:
        error = str(failure)
        failed_statement = index
        connection.rollback()
    phases.append({
        'ok': error is None, 'error': error, 'failedStatement': failed_statement,
        'visited': sorted(set(visited)), 'foreignKeyCalls': len(visited),
        'unchanged': catalog_snapshot() == before, 'matchesOriginal': catalog_snapshot() == original,
        'recoveryObjects': connection.execute("SELECT count(1) FROM sqlite_schema WHERE name LIKE 'catalog_recovery_%'").fetchone()[0],
        'ingredientRows': connection.execute('SELECT count(1) FROM recipe_ingredients').fetchone()[0],
    })
print(json.dumps({'expectedTables': expected_tables, 'phases': phases}))
connection.close()
`;
  return JSON.parse(execFileSync('python3', ['-c', script], {
    input: JSON.stringify(input), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
    env: { PATH: process.env.PATH ?? '/usr/bin:/bin' },
  }));
}

beforeAll(async () => {
  source = await loadCertifiedRecoverySource({ sha });
  plan = compileRecipeCatalogRecovery({ source, repairId });
}, 30000);
beforeEach(() => {
  db = new SqliteD1({ through: tip });
  observedState();
});
afterEach(() => db.close());

describe('offline certified V1 recovery compiler', () => {
  it('accepts only an internally certified immutable source and the bounded observed shape', async () => {
    expect(source.ledger).toHaveLength(38);
    expect(source.tables.recipes).toHaveLength(500);
    expect(source.tables.recipe_ingredients).toHaveLength(2702);
    expect(source.tables.recipe_steps).toHaveLength(2064);
    expect(Object.isFrozen(source.tables.recipes[0])).toBe(true);
    expect(Object.isFrozen(RECOVERY_TABLES.recipes)).toBe(true);
    expect(plan.sql).not.toContain('UNION ALL');
    expect(() => compileRecipeCatalogRecovery({ source: structuredClone(source), repairId })).toThrow(/certified immutable/);
    expect(() => compileRecipeCatalogRecovery({ source, repairId: 'inject; DROP TABLE recipes' })).toThrow(/bounded SQL identifier/);
    expect(() => compileRecipeCatalogRecovery({ source, repairId, expectedIngredientRows: 2702 })).toThrow(/6720/);
    await expect(loadCertifiedRecoverySource({ sha: 'HEAD' })).rejects.toThrow(/exact Git SHA/);
    expect(plan.receipt).toMatchObject({ status: 'OFFLINE_PLAN_ONLY', remoteExecutionAuthorized: false,
      purpose: 'RESTORE_V1', guardVersion: 2,
      internalObjectPolicy: 'EXACT_CF_KV_DOCUMENTED_WITHOUT_ROWID_OR_NONE',
      atomicExecutionRequired: true, rawProductionRowsInOutput: false,
      expectedAfter: { recipes: 500, ingredientRows: 2702, steps: 2064, orderRows: 2702, linkedNutrition: 0 } });
    expect(plan.receipt.approvedInternalDdlSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(plan.receipt.prerequisites).toContain('verified static production routing');
    expect(plan.sql).not.toMatch(/BEGIN TRANSACTION|COMMIT|INSERT OR REPLACE|DELETE FROM recipes|DROP TABLE/);
    expect(plan.sql).not.toContain('live_extra_');
    expect(Math.max(...plan.statements.map((sql) => Buffer.byteLength(sql)))).toBeLessThan(100000);
  });

  it('seals the historical recipe to the exact failed incident and never selects it for a restore', () => {
    const original = compileOriginalCatalogImportInspection({ source, repairId, purpose: 'RESTORE_V1', expectedIngredientRows: 1 });
    expect(original.receipt).toMatchObject({
      repairId: 't21_v1_37384670328', purpose: 'INSPECTION_ONLY', guardVersion: 1,
      sqlSha256: 'f4b6a4d05abfaff9f50a73063edc577e4b4e3ece9ff0f3a84b911e2ae2b42797',
      rollbackSqlSha256: 'e2ab4ab3e5f010ceb3ae29d952f6bab3a77441efea502e9c1706bc3e0efce43c',
      sourceDigest: '4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5',
    });
    expect(original.statements).toHaveLength(295);
    expect(original.sql).not.toContain('approved_internal_inventory');
    expect(() => compileOriginalCatalogImportInspection({ source: structuredClone(source) })).toThrow(/certified immutable/);
    expect(() => compileRecipeCatalogRecovery({ source, repairId: original.receipt.repairId })).toThrow(/reserved for inspection/);
    const attemptedLegacy = compileRecipeCatalogRecovery({ source, repairId, inspectionOnly: true,
      legacy: true, purpose: 'INSPECTION_ONLY', guardVersion: 1 });
    expect(attemptedLegacy.sql).toBe(plan.sql);
    expect(attemptedLegacy.receipt).toMatchObject({ purpose: 'RESTORE_V1', guardVersion: 2 });
    expect(plan.statements[1]).toContain("SELECT 'approved_internal_inventory'");
  });

  it('restores all 500 certified recipes from 6720 unreviewed lines and keeps a lossless immutable archive', async () => {
    const before = catalog();
    const timestamps = db.query('SELECT id, created_at FROM recipes ORDER BY id');
    const ledger = snapshot('d1_migrations');
    const registry = snapshot('ingredients');
    const profiles = snapshot('nutrition_profiles');
    const ingredientNutrition = snapshot('ingredient_nutrition');
    const media = snapshot('recipe_media');
    expect(db.query('SELECT count(1) AS total FROM recipe_runtime_ingredient_order')).toEqual([{ total: 0 }]);
    await apply();
    for (const table of Object.keys(RECOVERY_TABLES)) expect(snapshot(plan.archiveTables[table])).toEqual(before[table]);
    expect(db.query('SELECT id, created_at FROM recipes ORDER BY id')).toEqual(timestamps);
    expect(snapshot('d1_migrations')).toEqual(ledger);
    expect(snapshot('ingredients')).toEqual(registry);
    expect(snapshot('nutrition_profiles')).toEqual(profiles);
    expect(snapshot('ingredient_nutrition')).toEqual(ingredientNutrition);
    expect(snapshot('recipe_media')).toEqual(media);
    const restored = await hydration();
    expect(restored.failures).toEqual([]);
    expect(restored.recipes).toHaveLength(500);
    expect(await fingerprintRecipes(restored.recipes)).toBe(source.fingerprint);
    expect(db.query('PRAGMA foreign_key_check')).toEqual([]);
    expect(db.query('SELECT DISTINCT version FROM recipes')).toEqual([{ version: 1 }]);
    expect(db.query('SELECT count(1) AS total FROM recipe_classifications')).toEqual([{ total: 858 }]);
    expect(db.query('SELECT count(1) AS total FROM recipe_nutrition')).toEqual([{ total: 0 }]);
    expect(db.query(`SELECT state FROM catalog_recovery_${repairId}_status`)).toEqual([{ state: 'APPLIED' }]);
    for (const table of [plan.archiveTables.recipes, plan.targetTables.recipes]) {
      expect(() => db.seed(`DELETE FROM ${table}`)).toThrow(/Immutable catalog recovery evidence/);
      expect(() => db.seed(`UPDATE ${table} SET title = 'changed'`)).toThrow(/Immutable catalog recovery evidence/);
      expect(() => db.seed(`INSERT INTO ${table} SELECT ${Object.keys(source.tables.recipes[0]).join(', ')}${table === plan.archiveTables.recipes ? ', created_at' : ''} FROM recipes LIMIT 1`))
        .toThrow(/Immutable catalog recovery evidence/);
    }
  });

  it.each([
    ['documented spelling', RECOVERY_INTERNAL_TABLE_DDL],
    ['ASCII whitespace and keyword case', 'create table _cf_KV\n(\n key\ttext primary\tkey ,\r\n value\tBLOB\n)\nwithout\trowid'],
    ['long whitespace runs', `CREATE TABLE _cf_KV${' '.repeat(2048)}( key TEXT PRIMARY KEY , value BLOB ) WITHOUT ROWID`],
  ])('preserves the approved internal table during complete restore and rollback: %s', async (_label, ddl) => {
    db.seed(`${ddl}; INSERT INTO _cf_KV VALUES ('proof', X'0011FF')`);
    const before = catalog();
    const internal = snapshot('_cf_KV');
    await apply();
    expect(snapshot('_cf_KV')).toEqual(internal);
    const restored = await hydration();
    expect(restored.failures).toEqual([]);
    expect(await fingerprintRecipes(restored.recipes)).toBe(source.fingerprint);
    await apply(plan.rollbackStatements);
    expect(catalog()).toEqual(before);
    expect(snapshot('_cf_KV')).toEqual(internal);
  });

  it('reproduces the original D1 authorization failure and visits every application table with the corrected restore and rollback', () => {
    const original = compileOriginalCatalogImportInspection({ source });
    const failed = authorizedRecovery([original.statements]).phases[0];
    expect(failed).toMatchObject({ ok: false, error: 'not authorized', failedStatement: 1,
      unchanged: true, matchesOriginal: true, recoveryObjects: 0, ingredientRows: 6720 });
    expect(failed.visited).toContain('_cf_KV');
    const corrected = authorizedRecovery([plan.statements, plan.rollbackStatements]);
    expect(corrected.expectedTables).toContain('d1_migrations');
    expect(corrected.expectedTables).toContain('sqlite_sequence');
    for (const phase of corrected.phases) {
      expect(phase.ok).toBe(true);
      expect(phase.visited.some((name) => name.toLowerCase().startsWith('_cf_'))).toBe(false);
      expect(phase.visited).toEqual(expect.arrayContaining(corrected.expectedTables));
      expect(phase.foreignKeyCalls).toBeGreaterThanOrEqual(corrected.expectedTables.length * 2);
    }
    expect(corrected.phases[0]).toMatchObject({ matchesOriginal: false, ingredientRows: 2702 });
    expect(corrected.phases[1]).toMatchObject({ matchesOriginal: true, ingredientRows: 6720 });
  });

  it.each(['recipe_ingredients', 'RECIPE_INGREDIENTS'])
  ('keeps unknown application foreign keys to %s visible under the same D1 authorization policy', (parent) => {
    const checked = authorizedRecovery([plan.statements], `${RECOVERY_INTERNAL_TABLE_DDL};
      CREATE TABLE unreviewed_child (line_id TEXT REFERENCES ${parent}(id) ON DELETE CASCADE);
      INSERT INTO unreviewed_child SELECT id FROM recipe_ingredients ORDER BY id LIMIT 1`);
    expect(checked.phases[0]).toMatchObject({ ok: false, failedStatement: 2,
      unchanged: true, matchesOriginal: true, recoveryObjects: 0 });
    expect(checked.phases[0].error).toMatch(/CHECK constraint failed/);
    expect(checked.phases[0].visited).toContain('unreviewed_child');
    expect(checked.phases[0].visited).not.toContain('_cf_KV');
  });

  it('detects an uppercase incoming FK before a cascade can delete customer rows', async () => {
    db.seed(`${RECOVERY_INTERNAL_TABLE_DDL}; CREATE TABLE customer_lines (
      line_id TEXT REFERENCES RECIPE_INGREDIENTS(id) ON DELETE CASCADE
    ); INSERT INTO customer_lines VALUES ('live_extra_0')`);
    expect(db.query('PRAGMA foreign_key_list(customer_lines)')[0].table).toBe('RECIPE_INGREDIENTS');
    const before = catalog();
    const customerRows = snapshot('customer_lines');
    await expect(apply()).rejects.toThrow('known_schema_and_references');
    expect(catalog()).toEqual(before);
    expect(snapshot('customer_lines')).toEqual(customerRows);
    expect(recoveryObjects()).toEqual([]);
  });

  it('detects a trigger attached using an uppercase catalog name before it can change other data', async () => {
    db.seed(`${RECOVERY_INTERNAL_TABLE_DDL}; CREATE TABLE customer_evidence (id INTEGER);
      INSERT INTO customer_evidence VALUES (1);
      CREATE TRIGGER uppercase_parent_trigger AFTER UPDATE ON RECIPES BEGIN DELETE FROM customer_evidence; END`);
    expect(db.query("SELECT tbl_name FROM sqlite_schema WHERE name = 'uppercase_parent_trigger'"))
      .toEqual([{ tbl_name: 'RECIPES' }]);
    const before = catalog();
    const customerRows = snapshot('customer_evidence');
    await expect(apply()).rejects.toThrow('known_schema_and_references');
    expect(catalog()).toEqual(before);
    expect(snapshot('customer_evidence')).toEqual(customerRows);
    expect(recoveryObjects()).toEqual([]);
  });

  it.each([
    ['unknown reserved table', 'CREATE TABLE _cf_extra (id TEXT)'],
    ['unknown reserved table beside approved storage', `${documentedInternalSql}; CREATE TABLE _cf_extra (id TEXT)`],
    ['case-variant reserved name', 'CREATE TABLE _CF_extra (id TEXT)'],
    ['lowercase storage name', 'CREATE TABLE _cf_kv (key TEXT PRIMARY KEY, value BLOB) WITHOUT ROWID'],
    ['uppercase storage name', 'CREATE TABLE _CF_KV (key TEXT PRIMARY KEY, value BLOB) WITHOUT ROWID'],
    ['reserved view', 'CREATE VIEW _cf_extra AS SELECT 1 AS id'],
    ['storage name on a view', 'CREATE VIEW _cf_KV AS SELECT 1 AS id'],
    ['reserved index', 'CREATE INDEX _cf_recipes_index ON recipes(slug)'],
    ['reserved trigger', 'CREATE TRIGGER _cf_recipes_trigger AFTER UPDATE ON recipes BEGIN SELECT 1; END'],
    ['ordinary named attached index', `${documentedInternalSql}; CREATE INDEX internal_attached_index ON _cf_KV(value)`],
    ['ordinary named attached trigger', `${documentedInternalSql}; CREATE TRIGGER internal_attached_trigger AFTER INSERT ON _cf_KV BEGIN SELECT 1; END`],
    ['rowid storage table', 'CREATE TABLE _cf_KV (key TEXT PRIMARY KEY, value BLOB)'],
    ['extra internal column', 'CREATE TABLE _cf_KV (key TEXT PRIMARY KEY, value BLOB, extra TEXT) WITHOUT ROWID'],
    ['extra internal constraint', 'CREATE TABLE _cf_KV (key TEXT PRIMARY KEY, value BLOB NOT NULL) WITHOUT ROWID'],
    ['quoted internal identifier', 'CREATE TABLE "_cf_KV" (key TEXT PRIMARY KEY, value BLOB) WITHOUT ROWID'],
    ['split TEXT type tokens', 'CREATE TABLE _cf_KV (key TE XT PRIMARY KEY, value BLOB) WITHOUT ROWID'],
    ['split BLOB type tokens', 'CREATE TABLE _cf_KV (key TEXT PRIMARY KEY, value BL OB) WITHOUT ROWID'],
    ['unexpected declared type', 'CREATE TABLE _cf_KV (key BLOB PRIMARY KEY, value BLOB) WITHOUT ROWID'],
  ])('rejects %s before evaluating any foreign-key PRAGMA or changing catalog data', async (_label, sql) => {
    db.seed(sql);
    const before = catalog();
    const execute = db.execute;
    let foreignKeyStatements = 0;
    db.execute = function (statement, bindings) {
      if (statement.includes('pragma_foreign_key_list')) foreignKeyStatements += 1;
      return execute.call(this, statement, bindings);
    };
    try { await expect(apply()).rejects.toThrow('approved_internal_inventory'); }
    finally { db.execute = execute; }
    expect(foreignKeyStatements).toBe(0);
    expect(catalog()).toEqual(before);
    expect(recoveryObjects()).toEqual([]);
  });

  it('stops unknown protected objects before FK calls with the D1 authorizer enabled', () => {
    const checked = authorizedRecovery([plan.statements], `${RECOVERY_INTERNAL_TABLE_DDL}; CREATE TABLE _cf_unreviewed (id TEXT)`);
    expect(checked.phases[0]).toMatchObject({ ok: false, failedStatement: 1, foreignKeyCalls: 0,
      unchanged: true, matchesOriginal: true, recoveryObjects: 0 });
    expect(checked.phases[0].error).toMatch(/CHECK constraint failed/);
  });

  it('rejects a protected metadata row lacking DDL without evaluating any FK PRAGMA', () => {
    const before = catalog();
    const statement = plan.statements[1];
    const select = statement.slice(statement.indexOf("SELECT 'approved_internal_inventory'"));
    expect(select).not.toContain('pragma_foreign_key_list');
    const rows = db.query(`WITH sqlite_schema(name, type, tbl_name, sql) AS (
      VALUES ('_cf_KV', 'table', '_cf_KV', NULL)
    ) ${select} AS ok`);
    expect(rows[0].ok).toBe(0);
    expect(catalog()).toEqual(before);
    expect(recoveryObjects()).toEqual([]);
  });

  it('clears versioned enrichment so shared ingredient profiles and stale versions cannot authorize nutrition', async () => {
    await apply();
    const rows = (await db.batch(prepareRankingNutritionRead(db)))[0].results;
    expect(rows).toHaveLength(500);
    expect(rows.every((row) => row.recipe_version === 1 && row.profile_id === null)).toBe(true);
    const provider = createRankingEvidenceProviderFromNutritionRows(rows);
    const candidate = (version) => ({ id: `c${version}`, source: { catalog: 'd1', kind: 'recipe', sourceId: 'gl-01', version },
      requirements: [{ ingredientId: 'ING_ENR_REHEARSAL', substitutions: [] }] });
    expect(provider([candidate(1), candidate(2)])).toEqual([]);
    expect(snapshot(plan.archiveTables.recipe_nutrition)).toHaveLength(500);
  });

  it('rolls every archive and catalog change back when a later statement fails', async () => {
    db.seed(documentedInternalSql);
    const before = catalog();
    const internal = snapshot('_cf_KV');
    await expect(apply([...plan.statements, 'INSERT INTO recipes (id) VALUES (NULL)'])).rejects.toThrow();
    expect(catalog()).toEqual(before);
    expect(snapshot('_cf_KV')).toEqual(internal);
    expect(recoveryObjects()).toEqual([]);
  });

  it.each([
    ['ledger advanced', "INSERT INTO d1_migrations (name) VALUES ('0039_meal_composition_v2.sql')"],
    ['missing ledger entry', "DELETE FROM d1_migrations WHERE name = '0001_initial_schema.sql'"],
    ['line count changed', "DELETE FROM recipe_ingredients WHERE id = 'live_extra_0'"],
    ['order present', "INSERT INTO recipe_runtime_ingredient_order VALUES ('live_extra_0', (SELECT recipe_id FROM recipe_ingredients WHERE id = 'live_extra_0'), 0)"],
    ['unknown catalog column', 'ALTER TABLE recipe_steps ADD COLUMN unreviewed TEXT'],
    ['unknown child FK', 'CREATE TABLE unreviewed_child (line_id TEXT REFERENCES recipe_ingredients(id) ON DELETE CASCADE)'],
    ['unexpected active trigger', "CREATE TRIGGER unreviewed_trigger AFTER UPDATE ON recipes BEGIN DELETE FROM recipe_steps; END"],
  ])('fails closed and leaves no partial archive when %s', async (_label, sql) => {
    db.seed(sql);
    const before = catalog();
    await expect(apply()).rejects.toThrow(/CHECK constraint failed/);
    expect(catalog()).toEqual(before);
    expect(recoveryObjects()).toEqual([]);
  });

  it.each([
    ['an ingredient that cannot be safely reinserted', 'trg_recipe_ingredients_foundation_update', "UPDATE recipe_ingredients SET unit = 'unsupported' WHERE id = 'live_extra_0'", 'original_ingredients_reinsertable'],
    ['a nutrition link with a stale version', 'trg_recipe_nutrition_version_update', "UPDATE recipe_nutrition SET recipe_version = 1 WHERE recipe_id = 'gl-01'", 'nutrition_versions_consistent'],
  ])('rejects %s before touching the live catalog', async (_label, trigger, sql, guard) => {
    db.seed(`DROP TRIGGER ${trigger}`);
    db.seed(sql);
    db.seed(source.triggers.find((row) => row.name === trigger).sql);
    const before = catalog();
    await expect(apply()).rejects.toThrow(guard);
    expect(catalog()).toEqual(before);
    expect(recoveryObjects()).toEqual([]);
  });

  it('rejects a different 500-recipe ID set despite the same row counts', async () => {
    db.seed('PRAGMA foreign_keys = OFF');
    db.seed("UPDATE recipes SET id = 'foreign_recipe' WHERE id = 'gl-01'");
    for (const table of ['recipe_ingredients', 'recipe_steps', 'recipe_runtime_fields', 'recipe_nutrition', 'recipe_classifications', 'recipe_media']) {
      db.seed(`UPDATE ${table} SET recipe_id = 'foreign_recipe' WHERE recipe_id = 'gl-01'`);
    }
    db.seed('PRAGMA foreign_keys = ON');
    expect(db.query('PRAGMA foreign_key_check')).toEqual([]);
    const before = catalog();
    await expect(apply()).rejects.toThrow(/CHECK constraint failed/);
    expect(catalog()).toEqual(before);
    expect(recoveryObjects()).toEqual([]);
  });

  it('restores the complete original archive atomically without changing shared profiles', async () => {
    const before = catalog();
    const profiles = snapshot('nutrition_profiles');
    await apply();
    await apply(plan.rollbackStatements);
    expect(catalog()).toEqual(before);
    expect(snapshot('nutrition_profiles')).toEqual(profiles);
    expect(db.query('PRAGMA foreign_key_check')).toEqual([]);
    expect(db.query(`SELECT state FROM catalog_recovery_${repairId}_status`)).toEqual([{ state: 'ROLLED_BACK' }]);
    await expect(apply(plan.rollbackStatements)).rejects.toThrow();
    expect(catalog()).toEqual(before);
  });

  it('refuses rollback after an unknown reserved object appears and keeps the applied catalog and archive intact', async () => {
    db.seed(documentedInternalSql);
    await apply();
    db.seed('CREATE TABLE _cf_new_unreviewed (id TEXT)');
    const after = catalog();
    const objects = recoveryObjects();
    const archive = snapshot(plan.archiveTables.recipe_ingredients);
    await expect(apply(plan.rollbackStatements)).rejects.toThrow('approved_internal_inventory');
    expect(catalog()).toEqual(after);
    expect(recoveryObjects()).toEqual(objects);
    expect(snapshot(plan.archiveTables.recipe_ingredients)).toEqual(archive);
    expect(db.query(`SELECT state FROM catalog_recovery_${repairId}_status`)).toEqual([{ state: 'APPLIED' }]);
  });

  it('refuses rollback after a catalog edit and preserves that edit', async () => {
    await apply();
    db.seed("UPDATE recipe_ingredients SET required_quantity = required_quantity + 1 WHERE id = 'gl-01_ing_1'");
    const edited = catalog();
    await expect(apply(plan.rollbackStatements)).rejects.toThrow(/CHECK constraint failed/);
    expect(catalog()).toEqual(edited);
    expect(db.query(`SELECT state FROM catalog_recovery_${repairId}_status`)).toEqual([{ state: 'APPLIED' }]);
    expect(db.query(`SELECT name FROM sqlite_schema WHERE name = 'catalog_recovery_${repairId}_rollback_guard'`)).toEqual([]);
  });

  it('handles a live slug permutation through temporary unique slugs and reverses it exactly', async () => {
    db.seed("UPDATE recipes SET slug = 'test_temp' WHERE id = 'gl-01'; UPDATE recipes SET slug = 'pasta-pomodoro' WHERE id = 'gl-02'; UPDATE recipes SET slug = 'mapo-tofu' WHERE id = 'gl-01'");
    const before = catalog();
    await apply();
    expect(db.query("SELECT slug FROM recipes WHERE id = 'gl-01'")).toEqual([{ slug: 'pasta-pomodoro' }]);
    await apply(plan.rollbackStatements);
    expect(catalog()).toEqual(before);
  });

  it('refuses a repeat restore and keeps the first successful archive intact', async () => {
    await apply();
    const after = catalog();
    const archive = snapshot(plan.archiveTables.recipe_ingredients);
    await expect(apply()).rejects.toThrow();
    expect(catalog()).toEqual(after);
    expect(snapshot(plan.archiveTables.recipe_ingredients)).toEqual(archive);
  });
});
