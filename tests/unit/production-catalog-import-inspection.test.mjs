import { execFileSync } from 'node:child_process';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { compileRecipeCatalogRecovery, loadCertifiedRecoverySource } from '../../scripts/recipe-catalog-recovery.mjs';
import { inspectCatalogImport, ORIGINAL_IMPORT_REPAIR_ID } from '../../scripts/production-catalog-import-inspection.mjs';

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const prefix = `catalog_recovery_${ORIGINAL_IMPORT_REPAIR_ID}`;
const privateText = 'private fixture O\'Brien receipt 927';
let source;
let plan;
let db;
let calls;

beforeAll(async () => {
  source = await loadCertifiedRecoverySource({ sha });
  plan = compileRecipeCatalogRecovery({ source, repairId: ORIGINAL_IMPORT_REPAIR_ID });
}, 30000);
beforeEach(() => {
  db = new SqliteD1({ through: '0038_auth_onboarding_completion.sql' });
  db.seed('CREATE TABLE d1_migrations (name TEXT PRIMARY KEY)');
  for (const name of db.migrations) db.execute('INSERT INTO d1_migrations VALUES (?)', [name]);
  db.seed('DELETE FROM recipe_runtime_ingredient_order; UPDATE recipes SET version = 2');
  const recipe = db.query('SELECT id FROM recipes ORDER BY id LIMIT 1')[0].id;
  const ingredient = db.query('SELECT id FROM ingredients ORDER BY id LIMIT 1')[0].id;
  for (let i = 0; i < 4018; i++) {
    db.execute('INSERT INTO recipe_ingredients VALUES (?, ?, ?, ?, 1, \'g\', 0)',
      [`inspection_extra_${i}`, recipe, ingredient, privateText]);
  }
  calls = [];
});
afterEach(() => db.close());

function query(sql, meta = { served_by_primary: true, served_by: 'private-provider-id' }) {
  calls.push(sql);
  const result = db.execute(sql);
  return [{ ...result, meta: { ...result.meta, ...meta } }];
}
const inspect = (over = {}) => inspectCatalogImport({ source, plan, query, ...over });
const liveCount = () => db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n;
const schemaNames = () => db.query('SELECT name FROM sqlite_schema ORDER BY name');
async function apply() { await db.batch(plan.statements.map((sql) => db.prepare(sql))); }
function assertClosed(receipt) {
  expect(receipt).toMatchObject({ certification: 'NOT_A_RELEASE_CERTIFICATION', readOnly: true,
    mutations: 0, productionMutations: [], providerImportState: 'UNKNOWN_NO_CURSOR', retryAuthorized: false });
  const json = JSON.stringify(receipt);
  for (const secret of [privateText, 'private-provider-id', 'inspection_extra_', 'CHECK constraint',
    'CREATE TABLE', 'CREATE TRIGGER', 'source_private_value']) expect(json).not.toContain(secret);
  for (const sql of calls) {
    const unquoted = sql.replace(/'(?:[^']|'')*'/g, "''");
    expect(unquoted).toMatch(/^SELECT /);
    expect(unquoted).not.toMatch(/;|--|\/\*|\b(?:INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|ATTACH|COMMIT|BEGIN)\b/i);
    expect(Buffer.byteLength(sql)).toBeLessThanOrEqual(100000);
  }
}

describe('fixed production import incident SELECT-only inspection', () => {
  it('observes no original repair objects and all seven original guards against the certified SQLite source', async () => {
    const before = schemaNames();
    const receipt = await inspect();
    expect(receipt.status).toBe('NO_RECOVERY_COMMIT_OBSERVED');
    expect(receipt.inventory).toMatchObject({ objectCount: 0, tableCount: 0, triggerCount: 0,
      expectedObjectCount: 58, missingObjectCount: 58, unexpectedObjectCount: 0, exact: false });
    expect(receipt.preMutationGuards).toHaveLength(7);
    expect(receipt.preMutationGuards.every((guard) => guard.result === 'MATCH')).toBe(true);
    expect(receipt.preMutationGuards.map((guard) => guard.label)).toContain('exact_0038_ledger');
    expect(receipt.blockers).toEqual([]);
    expect(receipt.providerBlockingEvidence).toBe('IMPORT_NOT_BLOCKING_AT_PRIMARY_OBSERVATIONS');
    expect(calls).toHaveLength(8);
    expect(liveCount()).toBe(6720); expect(schemaNames()).toEqual(before);
    assertClosed(receipt);
  });

  it('supports asynchronous query injection', async () => {
    const receipt = await inspect({ query: async (sql) => query(sql) });
    expect(receipt.status).toBe('NO_RECOVERY_COMMIT_OBSERVED');
    assertClosed(receipt);
  });

  it('splits a protected incoming-FK query error without omitting system objects or leaking the error', async () => {
    db.seed('CREATE TABLE _cf_KV (key TEXT PRIMARY KEY, value BLOB)');
    const receipt = await inspect({ query: (sql) => {
      if (sql.includes('FROM sqlite_schema s JOIN pragma_foreign_key_list(s.name)')) {
        calls.push(sql); throw new Error('not authorized _cf_KV source_private_value');
      }
      return query(sql);
    } });
    expect(receipt.status).toBe('NO_RECOVERY_COMMIT_OBSERVED');
    expect(receipt.preMutationGuards[0].result).toBe('QUERY_FAILED');
    expect(receipt.schemaChecks).toHaveLength(9);
    expect(receipt.schemaChecks.slice(0, 8).every((check) => check.result === 'MATCH')).toBe(true);
    expect(receipt.schemaChecks[8]).toEqual({ label: 'incoming_foreign_keys', result: 'QUERY_FAILED' });
    expect(receipt.blockers).toContain('GUARD_KNOWN_SCHEMA_AND_REFERENCES_QUERY_FAILED');
    expect(receipt.providerBlockingEvidence).toBe('IMPORT_NOT_BLOCKING_AT_PRIMARY_OBSERVATIONS');
    expect(calls.some((sql) => sql.includes("name NOT LIKE '_cf_%'"))).toBe(false);
    assertClosed(receipt);
  });

  it.each([
    ['table shape', 'ALTER TABLE recipe_steps ADD COLUMN unreviewed TEXT', 'table_shape_recipe_steps'],
    ['active trigger', 'CREATE TRIGGER inspection_drift AFTER UPDATE ON recipes BEGIN SELECT 1; END', 'active_triggers'],
    ['incoming reference', 'CREATE TABLE inspection_child (recipe_id TEXT REFERENCES recipes(id))', 'incoming_foreign_keys'],
  ])('classifies %s mismatch from original schema predicates', async (_label, sql, label) => {
    db.seed(sql);
    const receipt = await inspect();
    expect(receipt.schemaChecks.find((check) => check.label === label)?.result).toBe('MISMATCH');
    expect(receipt.preMutationGuards[0].result).toBe('MISMATCH');
    assertClosed(receipt);
  });

  it('observes an exact applied marker and shape-safe archive/target/live counts without certifying a release', async () => {
    await apply();
    const before = schemaNames();
    const receipt = await inspect();
    expect(receipt.status).toBe('ORIGINAL_RECOVERY_APPLIED_MARKER_OBSERVED');
    expect(receipt.inventory).toMatchObject({ objectCount: 58, tableCount: 16, triggerCount: 42,
      matchedObjectCount: 58, missingObjectCount: 0, unexpectedObjectCount: 0, exact: true });
    expect(receipt.repairStatus).toEqual({ rows: 1, exactIdentityRows: 1, appliedRows: 1, rolledBackRows: 0 });
    expect(receipt.guard).toEqual({ rows: 25, distinctLabels: 25, approvedPassingRows: 25, invalidRows: 0 });
    expect(receipt.aggregates.archive.recipe_ingredients.rows).toBe(6720);
    expect(receipt.aggregates.target.recipe_ingredients.rows).toBe(2702);
    expect(receipt.aggregates.live.recipe_ingredients.rows).toBe(2702);
    expect(receipt.aggregates.live.recipes).toEqual({ rows: 500, v1Rows: 500, v2Rows: 0, otherVersionRows: 0 });
    expect(receipt.objectSchemaChecks.every((check) => check.result === 'MATCH')).toBe(true);
    expect(schemaNames()).toEqual(before); expect(liveCount()).toBe(2702);
    assertClosed(receipt);
  });

  it('keeps partial exact known objects blocked but reads only their validated aggregates', async () => {
    db.seed(plan.statements[0]);
    const targetCreate = plan.statements.find((sql) => sql.startsWith(`CREATE TABLE ${plan.targetTables.recipes} `));
    db.seed(targetCreate);
    const receipt = await inspect();
    expect(receipt.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.inventory.objectCount).toBe(2);
    expect(receipt.blockers).toContain('PARTIAL_RECOVERY_OBJECTS');
    expect(receipt.aggregates.target.recipes.rows).toBe(0);
    expect(receipt.guard.rows).toBe(0);
    expect(receipt.repairStatus).toBeNull();
    expect(liveCount()).toBe(6720);
    assertClosed(receipt);
  });

  it('rejects an extra recovery-prefix object despite the complete 58 known objects', async () => {
    await apply();
    db.seed(`CREATE TABLE ${prefix}_unreviewed (secret TEXT)`);
    const receipt = await inspect();
    expect(receipt.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.inventory).toMatchObject({ objectCount: 59, matchedObjectCount: 58, unexpectedObjectCount: 1, exact: false });
    expect(receipt.blockers).toContain('UNEXPECTED_RECOVERY_OBJECTS');
    expect(calls.some((sql) => sql.includes(`FROM ${prefix}_unreviewed`))).toBe(false);
    assertClosed(receipt);
  });

  it('does not read guard values when its known object name has a malformed table shape', async () => {
    db.seed(`CREATE TABLE ${prefix}_guard (label TEXT, ok TEXT)`);
    db.seed(`INSERT INTO ${prefix}_guard VALUES ('source_private_value', 'source_private_value')`);
    const receipt = await inspect();
    expect(receipt.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.guard).toBeNull();
    expect(receipt.objectSchemaChecks.find((check) => check.label === `${prefix}_guard`)?.result).toBe('MISMATCH');
    expect(calls.some((sql) => sql.includes(`FROM ${prefix}_guard`))).toBe(false);
    assertClosed(receipt);
  });

  it('does not query a known name with the wrong object type', async () => {
    db.seed(`CREATE VIEW ${prefix}_guard AS SELECT 'source_private_value' AS label, 1 AS ok`);
    const receipt = await inspect();
    expect(receipt.inventory).toMatchObject({ objectCount: 1, matchedObjectCount: 0, unexpectedObjectCount: 1 });
    expect(receipt.guard).toBeNull();
    expect(calls.some((sql) => sql.includes(`FROM ${prefix}_guard`))).toBe(false);
    assertClosed(receipt);
  });

  it('rejects modified evidence-trigger SQL even with exact object names and types', async () => {
    await apply();
    const name = `${plan.archiveTables.recipes}_insert`;
    db.seed(`DROP TRIGGER ${name}; CREATE TRIGGER ${name} BEFORE INSERT ON ${plan.archiveTables.recipes} BEGIN SELECT 1; END`);
    const receipt = await inspect();
    expect(receipt.inventory.exact).toBe(true);
    expect(receipt.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.objectSchemaChecks.find((check) => check.label === 'recovery_trigger_definitions')?.result).toBe('MISMATCH');
    assertClosed(receipt);
  });

  it('does not trust an applied status row with a different source identity', async () => {
    await apply();
    db.seed(`UPDATE ${prefix}_status SET source_digest = 'source_private_value'`);
    const receipt = await inspect();
    expect(receipt.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.repairStatus).toEqual({ rows: 1, exactIdentityRows: 0, appliedRows: 0, rolledBackRows: 0 });
    expect(receipt.blockers).toContain('RECOVERY_STATUS_IDENTITY_UNPROVEN');
    assertClosed(receipt);
  });

  it.each([undefined, false, 'true', 1])('does not infer a primary observation from metadata %s', async (primary) => {
    const receipt = await inspect({ query: (sql) => query(sql, { served_by_primary: primary, served_by: 'private-provider-id' }) });
    expect(receipt.providerBlockingEvidence).toBe('UNPROVEN');
    expect(receipt.blockers).toContain('PRIMARY_OBSERVATION_UNPROVEN');
    assertClosed(receipt);
  });

  it.each([
    ['malformed wrapper', {}], ['failed statement', [{ success: false, results: [] }]],
    ['extra row', [{ success: true, results: [{}, {}] }]],
    ['private row', [{ success: true, results: [{ source_private_value: 'source_private_value' }] }]],
  ])('fails closed and emits sanitized inventory failure for %s', async (_label, value) => {
    const receipt = await inspect({ query: () => value });
    expect(receipt.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.blockers).toEqual(['OBJECT_INVENTORY_QUERY_FAILED']);
    expect(receipt.inventory).toBeNull();
    assertClosed(receipt);
  });

  it('sanitizes thrown callback text and does not start any other observation', async () => {
    let attempts = 0;
    const receipt = await inspect({ query: () => { attempts++; throw new Error('source_private_value private rows'); } });
    expect(attempts).toBe(1); expect(receipt.queryObservations.failed).toBe(1);
    assertClosed(receipt);
  });

  it.each([
    ['different repair ID', () => compileRecipeCatalogRecovery({ source, repairId: 't21_v1_other_incident' })],
    ['different SQL', () => ({ ...plan, sql: `${plan.sql}\nSELECT 1;` })],
    ['mutated statements with original SQL', () => ({ ...plan, statements: ['DELETE FROM recipes', ...plan.statements.slice(1)] })],
    ['different digest', () => ({ ...plan, receipt: { ...plan.receipt, sourceDigest: '0'.repeat(64) } })],
  ])('rejects %s before the query trust boundary', async (_label, candidate) => {
    await expect(inspect({ plan: candidate() })).rejects.toThrow('IMPORT_INSPECTION_SOURCE_REJECTED');
    expect(calls).toHaveLength(0); expect(liveCount()).toBe(6720);
  });

  it('rejects a cloned uncertified source before queries', async () => {
    await expect(inspect({ source: structuredClone(source) })).rejects.toThrow('IMPORT_INSPECTION_SOURCE_REJECTED');
    expect(calls).toHaveLength(0);
  });
});
