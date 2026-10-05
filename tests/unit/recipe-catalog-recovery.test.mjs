import { execFileSync } from 'node:child_process';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeContentRead, prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { hydrateRuntimeRecipes } from '../../packages/recipes/src/runtime-hydration';
import { fingerprintRecipes } from '../../packages/recipes/src/catalog-fingerprint';
import { prepareRankingNutritionRead, createRankingEvidenceProviderFromNutritionRows } from '../../packages/db/src/ranking-nutrition';
import {
  RECOVERY_TABLES, loadCertifiedRecoverySource, compileRecipeCatalogRecovery,
} from '../../scripts/recipe-catalog-recovery.mjs';

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const tip = '0038_auth_onboarding_completion.sql';
const repairId = 't21_v1_restore_rehearsal';
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
  db.seed("CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, applied_at TEXT NOT NULL DEFAULT '2026-10-05')");
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
      atomicExecutionRequired: true, rawProductionRowsInOutput: false,
      expectedAfter: { recipes: 500, ingredientRows: 2702, steps: 2064, orderRows: 2702, linkedNutrition: 0 } });
    expect(plan.receipt.prerequisites).toContain('verified static production routing');
    expect(plan.sql).not.toMatch(/BEGIN TRANSACTION|COMMIT|INSERT OR REPLACE|DELETE FROM recipes|DROP TABLE/);
    expect(plan.sql).not.toContain('live_extra_');
    expect(Math.max(...plan.statements.map((sql) => Buffer.byteLength(sql)))).toBeLessThan(100000);
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
    const before = catalog();
    await expect(apply([...plan.statements, 'INSERT INTO recipes (id) VALUES (NULL)'])).rejects.toThrow();
    expect(catalog()).toEqual(before);
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
