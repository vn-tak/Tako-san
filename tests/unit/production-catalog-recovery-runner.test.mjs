import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeContentRead, prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { hydrateRuntimeRecipes } from '../../packages/recipes/src/runtime-hydration';
import { fingerprintRecipes } from '../../packages/recipes/src/catalog-fingerprint';
import { inspectCatalogImport, inspectRecoveryPreflight } from '../../scripts/production-catalog-import-inspection.mjs';
import { compileOriginalCatalogImportInspection, loadCertifiedRecoverySource } from '../../scripts/recipe-catalog-recovery.mjs';
import { requirePinnedStaticWorker, runCatalogRecovery, verifyRecoveryLedger } from '../../scripts/production-catalog-recovery-runner.mjs';

const cwd = process.cwd();
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const fingerprint = 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37';
const capacityBytes = 8 * 1024 * 1024;
let source;
let incidentSource;
let db;
let files;
let events;
let sqlCommands;
let preLedgerMeta;
let failPost;
let mutateStatic;
let inspections;
let loseImportResponse;
const env = { RECOVERY_OPERATION: 'restore-v1', GITHUB_RUN_ID: '99' };
const staticProof = { deployment: { versionId: '1a47f7f7-3d74-4801-b26a-b91f39c7942e', percentage: 100 }, configuredMode: 'static',
  cutoverEnabled: false, canaryPercent: 0, authorityVerified: true, compatibilityCode: 'SUPPORTED',
  modules: { sha256: '5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1' } };

beforeAll(async () => {
  source = await loadCertifiedRecoverySource({ sha });
  incidentSource = await loadCertifiedRecoverySource({ sha: '4092d4ca2dacee8bb01da484aae93592e9bd94da' });
}, 30000);
beforeEach(() => {
  db = new SqliteD1({ through: '0038_auth_onboarding_completion.sql' });
  db.seed('CREATE TABLE d1_migrations (name TEXT PRIMARY KEY)');
  for (const name of db.migrations) db.execute('INSERT INTO d1_migrations VALUES (?)', [name]);
  db.seed('DELETE FROM recipe_runtime_ingredient_order; UPDATE recipes SET version = 2;');
  const recipeId = db.query('SELECT id FROM recipes ORDER BY id LIMIT 1')[0].id;
  const ingredientId = db.query('SELECT id FROM ingredients ORDER BY id LIMIT 1')[0].id;
  for (let i = 0; i < 4018; i++) db.execute("INSERT INTO recipe_ingredients VALUES (?, ?, ?, 'unreviewed', 1, 'g', 0)", [`extra_${i}`, recipeId, ingredientId]);
  files = mkdtempSync(path.join(os.tmpdir(), 'catalog-recovery-runner-'));
  events = []; sqlCommands = []; preLedgerMeta = { size_after: capacityBytes, served_by_primary: true };
  failPost = false; mutateStatic = false; inspections = 0; loseImportResponse = false;
});
afterEach(() => db.close());

function options(extra = {}) {
  return {
    operation: 'restore-v1', env, cwd,
    authorize: async () => { events.push('authorize'); return { mainSha: sha }; },
    loadSource: async ({ sha: requested }) => requested === incidentSource.sha ? incidentSource : source,
    diagnoseCredentials: async ({ databaseId }) => {
      expect(databaseId).toBe('f975ec39-b2c8-4a2a-80e1-0366054599d3');
      events.push('credential-diagnosis');
      return { readOnly: true, mutations: 0, writeAuthorization: 'UNKNOWN', retryAuthorized: false };
    },
    loadPipeline: async () => ({
      queries: prepareRecipeContentRead({ prepare: (sql) => sql }), mapRecipeContentRead,
      hydrateRuntimeRecipes, fingerprintRecipes, close: async () => {},
    }),
    worker: {
      inspectProductionCatalogWorker: async () => {
        inspections++; events.push('inspect');
        return inspections === 4 && mutateStatic ? { ...staticProof, configuredMode: 'd1' } : staticProof;
      },
      pinProductionCatalogStatic: async ({ expectedVersionId, beforeMutation }) => {
        expect(expectedVersionId).toBe(staticProof.deployment.versionId);
        await beforeMutation(); events.push('pin'); return { status: 'static-verified', versionId: staticProof.deployment.versionId, modules: staticProof.modules };
      },
    },
    execute: (_cmd, args) => {
      if (args[2] === 'list') return JSON.stringify([{ name: 'frigo-db', uuid: 'f975ec39-b2c8-4a2a-80e1-0366054599d3' }]);
      if (args[2] === 'time-travel') { events.push('bookmark'); return JSON.stringify({ bookmark: 'fixture-bookmark' }); }
      if (args.includes('--file')) {
        expect(args).toContain('--json');
        const file = args[args.indexOf('--file') + 1];
        const kind = file.endsWith('rollback.sql') ? 'rollback' : 'import';
        events.push(kind);
        db.seed('BEGIN IMMEDIATE');
        try { db.seed(readFileSync(path.join(files, path.basename(file)), 'utf8')); db.seed('COMMIT'); }
        catch (error) { db.seed('ROLLBACK'); throw error; }
        if (loseImportResponse && kind === 'import') throw new Error('response lost after commit');
        return JSON.stringify([{ success: true, results: [] }]);
      }
      const sql = args[args.indexOf('--command') + 1];
      sqlCommands.push(sql);
      if (/pragma_page_(?:count|size)/i.test(sql)) throw new Error('Remote D1 pragma not supported');
      if (sql.startsWith('SELECT name FROM d1_migrations')) events.push('ledger');
      if (failPost && events.includes('import') && sql === 'PRAGMA quick_check') throw new Error('provider/private row text');
      const parts = !/;/.test(sql.replace(/'(?:''|[^'])*'/g, ' ')) ? [sql] : sql.split(';').filter((s) => s.trim());
      const statements = parts.map((s) => ({ ...db.execute(s), meta: { served_by_primary: true } }));
      if (sql.startsWith('SELECT name FROM d1_migrations') && !events.includes('import')) statements[0].meta = preLedgerMeta;
      return JSON.stringify(statements);
    },
    ...extra,
  };
}
// Generated SQL/receipts go to a private temp directory while source paths remain the real repo.
async function run(extra = {}) {
  const base = options(extra);
  // The runner's cwd serves both source and generated files; use a temp directory with source symlinks.
  for (const entry of ['wrangler.jsonc', 'packages', 'data', 'migrations']) {
    if (!existsSync(path.join(files, entry))) symlinkSync(path.join(cwd, entry), path.join(files, entry));
  }
  return runCatalogRecovery({ ...base, cwd: files });
}

describe('bounded production recovery orchestration', () => {
  it('pins static and captures a bookmark before one import, then certifies real V1 hydration', async () => {
    const receipt = await run();
    expect(receipt.status).toBe('V1_CATALOG_CERTIFIED_STATIC');
    expect(receipt.capacity.beforeBytes).toBe(capacityBytes);
    expect(receipt.runtime).toMatchObject({ actualRecipes: 500, hydrationFailureCount: 0, runtimeFingerprint: fingerprint });
    expect(events.indexOf('pin')).toBeLessThan(events.indexOf('bookmark'));
    expect(events.indexOf('bookmark')).toBeLessThan(events.indexOf('import'));
    expect(events.filter((e) => e === 'import')).toHaveLength(1);
    expect(events.slice(0, events.indexOf('pin')).filter((e) => e === 'ledger')).toHaveLength(1);
    expect(receipt.recoveryDecision).toBe('INTENTIONAL_NEW_GUARDED_RECOVERY_V2');
    expect(receipt.originalImportTerminalState).toBe('UNKNOWN_NO_CURSOR');
    expect(receipt.plan).toMatchObject({ guardVersion: 2, purpose: 'RESTORE_V1' });
    expect(receipt.recoveryPreflight.status).toBe('GUARDED_PREFLIGHT_MATCH');
    expect(sqlCommands.some((sql) => /pragma_page_(?:count|size)/i.test(sql))).toBe(false);
    expect(events).not.toContain('rollback');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(2702);
    expect(db.query('SELECT count(1) AS n FROM d1_migrations')[0].n).toBe(38);
  });
  it.each([
    ['missing metadata', undefined],
    ['missing size', {}],
    ['string size', { size_after: String(capacityBytes) }],
    ['null size', { size_after: null }],
    ['boolean size', { size_after: true }],
    ['zero size', { size_after: 0 }],
    ['negative size', { size_after: -1 }],
    ['fractional size', { size_after: 1.5 }],
    ['exactly 100 MiB', { size_after: 100 * 1024 * 1024 }],
    ['above 100 MiB', { size_after: 100 * 1024 * 1024 + 1 }],
    ['unsafe integer size', { size_after: Number.MAX_SAFE_INTEGER + 1 }],
  ])('rejects %s before Worker inspection, pinning or import without a fallback', async (_label, meta) => {
    preLedgerMeta = meta;
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    expect(events.filter((e) => e === 'ledger')).toHaveLength(1);
    expect(events).not.toContain('inspect'); expect(events).not.toContain('pin');
    expect(events).not.toContain('bookmark'); expect(events).not.toContain('import');
    expect(sqlCommands.some((sql) => /pragma_page_(?:count|size)/i.test(sql))).toBe(false);
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt).toMatchObject({ status: 'STOPPED', phase: 'PRE_IMPORT_CAPACITY',
      failureCode: 'CAPACITY_METADATA_INVALID', preLedger: { count: 38, tip: '0038_auth_onboarding_completion.sql' } });
    expect(receipt.capacity).toBeUndefined();
    expect(receipt.worker).toBeUndefined();
    expect(receipt.importOutcome).toBeUndefined();
    expect(JSON.stringify(receipt)).not.toContain('size_after');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
  });
  it('accepts the last integer below the 100 MiB bound', async () => {
    preLedgerMeta = { size_after: 100 * 1024 * 1024 - 1, served_by_primary: true };
    const receipt = await run();
    expect(receipt.status).toBe('V1_CATALOG_CERTIFIED_STATIC');
    expect(receipt.capacity.beforeBytes).toBe(100 * 1024 * 1024 - 1);
    expect(receipt.runtime).toMatchObject({ actualRecipes: 500, hydrationFailureCount: 0, runtimeFingerprint: fingerprint });
    expect(sqlCommands.some((sql) => /pragma_page_(?:count|size)/i.test(sql))).toBe(false);
  });
  it('rejects a changed ledger before evaluating its capacity, pinning or importing', async () => {
    db.execute("UPDATE d1_migrations SET name = '0000_wrong.sql' WHERE name = ?", [source.ledger[0]]);
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    expect(events).not.toContain('pin'); expect(events).not.toContain('import');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.phase).toBe('OFFLINE_PLAN_AND_PRE_LEDGER');
    expect(receipt.capacity).toBeUndefined();
  });
  it('rejects D1 routing becoming active after the bookmark, before import', async () => {
    mutateStatic = true;
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    expect(events).toContain('bookmark'); expect(events).not.toContain('import');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
  });
  it('restores the catalog archive if independent verification fails and keeps static routing', async () => {
    failPost = true;
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    expect(events).toContain('rollback');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
    expect(db.query('SELECT count(1) AS n FROM recipe_runtime_ingredient_order')[0].n).toBe(0);
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('ROLLED_BACK_STATIC');
    expect(JSON.stringify(receipt)).not.toContain('provider/private row text');
  });
  it('records an unknown outcome when import committed but the provider response was lost', async () => {
    loseImportResponse = true;
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(2702);
    expect(events).not.toContain('rollback');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED');
    expect(receipt.importOutcome).toBe('ATTEMPTED_COMPLETION_UNCONFIRMED');
  });
  it('rejects a different version, module bytes or unsupported/unverified static evidence', () => {
    const pinned = { versionId: staticProof.deployment.versionId, modules: staticProof.modules };
    expect(() => requirePinnedStaticWorker(staticProof, pinned)).not.toThrow();
    for (const change of [
      { authorityVerified: false }, { compatibilityCode: 'UNSUPPORTED_METADATA' },
      { deployment: { versionId: 'different-static', percentage: 100 } },
      { deployment: { ...staticProof.deployment, percentage: 99 } }, { modules: { sha256: 'b'.repeat(64) } },
    ]) expect(() => requirePinnedStaticWorker({ ...staticProof, ...change }, pinned)).toThrow();
  });
  it('has no mutation path in inspect mode', async () => {
    const receipt = await run({ operation: 'inspect', env: { ...env, RECOVERY_OPERATION: 'inspect' } });
    expect(receipt.status).toBe('INSPECTED_READ_ONLY');
    expect(events).not.toContain('pin'); expect(events).not.toContain('import'); expect(events).not.toContain('bookmark');
  });
  const importEnv = { ...env, RECOVERY_OPERATION: 'inspect-import' };
  const originalProof = { ...staticProof,
    deployment: { versionId: '1a47f7f7-3d74-4801-b26a-b91f39c7942e', percentage: 100 },
    modules: { sha256: '5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1' } };
  function inspectionOptions(extra = {}) {
    return { operation: 'inspect-import', env: importEnv,
      worker: { inspectProductionCatalogWorker: async () => { events.push('inspect'); return originalProof; } },
      inspectImport: async ({ source: actualSource, plan, query }) => {
        expect(actualSource).toBe(source);
        expect(plan.receipt.repairId).toBe('t21_v1_37384670328');
        expect(plan.receipt.sqlSha256).toBe('f4b6a4d05abfaff9f50a73063edc577e4b4e3ece9ff0f3a84b911e2ae2b42797');
        query('SELECT count(1) AS n FROM recipe_ingredients');
        events.push('inspection');
        return { mutations: 0, providerImportState: 'UNKNOWN_NO_CURSOR', ingredientRows: 6720 };
      }, ...extra };
  }
  it('inspects the exact failed import twice between identical static pin and ledger proofs', async () => {
    const receipt = await run(inspectionOptions());
    expect(receipt).toMatchObject({ status: 'INSPECTED_IMPORT_READ_ONLY', mutations: 0,
      releaseCertification: 'NOT_A_RELEASE_CERTIFICATION', snapshotConsistency: 'OBSERVED_STABLE_NON_ATOMIC' });
    expect(events.filter((e) => e === 'inspection')).toHaveLength(2);
    expect(events.filter((e) => e === 'authorize')).toHaveLength(2);
    expect(events).not.toContain('pin'); expect(events).not.toContain('import');
    expect(events).not.toContain('bookmark'); expect(events).not.toContain('rollback');
    expect(sqlCommands.every((sql) => sql.startsWith('SELECT '))).toBe(true);
    expect(existsSync(path.join(files, 'catalog-recovery-generated.sql'))).toBe(false);
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
  });
  it('executes the real compiler-derived helper through the readonly runner without changing catalog rows', async () => {
    const receipt = await run(inspectionOptions({ inspectImport: inspectCatalogImport }));
    expect(receipt.status).toBe('INSPECTED_IMPORT_READ_ONLY');
    expect(receipt.importInspection.mutations).toBe(0);
    expect(events).not.toContain('pin'); expect(events).not.toContain('import');
    expect(events).not.toContain('bookmark'); expect(events).not.toContain('rollback');
    expect(sqlCommands.every((sql) => sql.startsWith('SELECT '))).toBe(true);
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
    expect(db.query('SELECT count(1) AS n FROM recipe_runtime_ingredient_order')[0].n).toBe(0);
  });
  it('loads the latest failed batch from its fixed historical source and repeats its inspection', async () => {
    const seen = [];
    const receipt = await run(inspectionOptions({
      inspectLatestImport: async ({ source: actual, plan, query }) => {
        expect(actual).toBe(incidentSource);
        expect(plan.receipt).toMatchObject({ sourceSha: incidentSource.sha,
          repairId: 't21_v1_37491535308', guardVersion: 2,
          sqlSha256: '75c8207ec177972c6cac92007a2c8f165a94ce39d7f03ea7973446aedcd4f441' });
        seen.push(actual.sha); query('SELECT 1 AS ok');
        return { readOnly: true, mutations: 0, retryAuthorized: false,
          providerImportState: 'UNKNOWN_NO_CURSOR' };
      },
    }));
    expect(seen).toEqual([incidentSource.sha, incidentSource.sha]);
    expect(receipt.latestSnapshotConsistency).toBe('OBSERVED_STABLE_NON_ATOMIC');
    expect(receipt.credentialDiagnostics.writeAuthorization).toBe('UNKNOWN');
    expect(receipt.credentialReadProbe).toEqual({ result: 'READ_SUCCEEDED', servedByPrimary: true });
    expect(events.filter((e) => e === 'credential-diagnosis')).toHaveLength(1);
    expect(receipt.latestImportInspection.retryAuthorized).toBe(false);
    assertStoppedBeforeMutation();
  });
  it('preserves unknown state and stops on changing latest incident observations', async () => {
    let observed = 0;
    await expect(run(inspectionOptions({ inspectLatestImport: async () => ({ observed: observed++ }) })))
      .rejects.toThrow('RECOVERY_STOPPED');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('STOPPED');
    expect(receipt.latestSnapshotConsistency).toBeUndefined();
    expect(receipt.releaseCertification).toBe('NOT_A_RELEASE_CERTIFICATION');
    assertStoppedBeforeMutation();
  });
  it('saves bounded credential diagnosis even when D1 identity fails', async () => {
    await expect(run(inspectionOptions({ execute: () => { throw new Error('private credential failure'); } })))
      .rejects.toThrow('RECOVERY_STOPPED');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.credentialDiagnostics.writeAuthorization).toBe('UNKNOWN');
    expect(JSON.stringify(receipt)).not.toContain('private credential failure');
    expect(receipt.latestImportInspection).toBeUndefined();
    assertStoppedBeforeMutation();
  });
  it('stops inspection before querying D1 if the original pinned Worker has changed', async () => {
    await expect(run(inspectionOptions({ worker: {
      inspectProductionCatalogWorker: async () => ({ ...staticProof, modules: { sha256: 'b'.repeat(64) } }),
    } }))).rejects.toThrow('RECOVERY_STOPPED');
    expect(sqlCommands).toEqual([]);
    expect(events).not.toContain('inspection'); expect(events).not.toContain('import');
  });
  it.each(['DELETE FROM recipes', 'SELECT 1; DELETE FROM recipes', 'SELECT 1 -- hidden',
    'SELECT load_extension(1)', 'SELECT count(1) FROM pragma_database_list'])
  ('rejects unsafe SQL submitted through the readonly inspection adapter: %s', async (sql) => {
    await expect(run(inspectionOptions({ inspectImport: async ({ query }) => query(sql) })))
      .rejects.toThrow('RECOVERY_STOPPED');
    expect(sqlCommands).not.toContain('DELETE FROM recipes');
    expect(db.query('SELECT count(1) AS n FROM recipes')[0].n).toBe(500);
  });
  it('rejects unstable import inspection observations without a mutation or certification', async () => {
    let n = 0;
    await expect(run(inspectionOptions({ inspectImport: async () => ({ n: n++ }) })))
      .rejects.toThrow('RECOVERY_STOPPED');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('STOPPED'); expect(receipt.snapshotConsistency).toBeUndefined();
    expect(receipt.releaseCertification).toBe('NOT_A_RELEASE_CERTIFICATION');
    expect(events).not.toContain('import'); expect(events).not.toContain('rollback');
  });
  it('rejects stale main or approval at the final authorization check', async () => {
    let n = 0;
    await expect(run(inspectionOptions({ authorize: async () => {
      if (n++) throw new Error('main changed');
      return { mainSha: sha };
    } }))).rejects.toThrow('RECOVERY_STOPPED');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('STOPPED');
    expect(receipt.releaseCertification).toBe('NOT_A_RELEASE_CERTIFICATION');
    expect(events).not.toContain('import'); expect(events).not.toContain('pin');
  });
  it('rejects a changed final Worker pin after readonly inspection', async () => {
    let n = 0;
    await expect(run(inspectionOptions({ worker: {
      inspectProductionCatalogWorker: async () => n++ ? { ...staticProof, modules: { sha256: 'b'.repeat(64) } } : originalProof,
    } }))).rejects.toThrow('RECOVERY_STOPPED');
    expect(events.filter((e) => e === 'inspection')).toHaveLength(2);
    expect(events).not.toContain('import'); expect(events).not.toContain('pin');
  });

  function assertStoppedBeforeMutation() {
    for (const event of ['pin', 'bookmark', 'import', 'rollback']) expect(events).not.toContain(event);
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
    expect(existsSync(path.join(files, 'catalog-recovery-generated.sql'))).toBe(false);
  }
  it('never routes the sealed original inspection plan to a mutation', async () => {
    await expect(run({ compile: ({ source }) => compileOriginalCatalogImportInspection({ source }) }))
      .rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
    expect(sqlCommands).toEqual([]);
  });
  it.each([
    ['partial original objects', { inventory: { objectCount: 1 } }],
    ['observed original commit', { status: 'RECOVERY_COMMIT_OBSERVED' }],
    ['unproved primary availability', { providerBlockingEvidence: 'BLOCKING_STATE_UNKNOWN' }],
    ['old catalog no longer matches', { preMutationGuards: [{ label: 'bounded_observed_catalog', result: 'MISMATCH' }] }],
  ])('stops new recovery when %s', async (_label, change) => {
    await expect(run({ inspectImport: async (args) => ({ ...await inspectCatalogImport(args), ...change }) }))
      .rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it.each([
    ['latest recovery objects', { inventory: { objectCount: 1 } }],
    ['latest applied marker', { status: 'LATEST_V2_RECOVERY_APPLIED_MARKER_OBSERVED' }],
    ['latest unproved primary availability', { providerBlockingEvidence: 'BLOCKING_STATE_UNKNOWN' }],
  ])('stops a new recovery when inspection observes %s', async (_label, change) => {
    await expect(run({ inspectLatestImport: async () => ({ status: 'NO_RECOVERY_COMMIT_OBSERVED',
      inventory: { objectCount: 0 }, providerBlockingEvidence: 'IMPORT_NOT_BLOCKING_AT_PRIMARY_OBSERVATIONS',
      preMutationGuards: [{ label: 'bounded_observed_catalog', result: 'MATCH' }], ...change }) }))
      .rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('stops a new recovery when latest incident observations change', async () => {
    let observed = 0;
    await expect(run({ inspectLatestImport: async () => ({ status: 'NO_RECOVERY_COMMIT_OBSERVED',
      inventory: { objectCount: 0 }, providerBlockingEvidence: 'IMPORT_NOT_BLOCKING_AT_PRIMARY_OBSERVATIONS',
      preMutationGuards: [{ label: 'bounded_observed_catalog', result: 'MATCH' }], observed: observed++ }) }))
      .rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('stops new recovery on changing original observations', async () => {
    let observation = 0;
    await expect(run({ inspectImport: async (args) => ({ ...await inspectCatalogImport(args), observation: observation++ }) }))
      .rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });

  it('sees uppercase original recovery objects and refuses a new import', async () => {
    db.seed('CREATE TABLE CATALOG_RECOVERY_T21_V1_37384670328_GUARD (label TEXT, ok INTEGER)');
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.originalImportInspection.inventory.objectCount).toBe(1);
    expect(receipt.originalImportInspection.status).not.toBe('NO_RECOVERY_COMMIT_OBSERVED');
  });
  it('protects populated child references with an uppercase SQLite target name', async () => {
    db.seed('CREATE TABLE uppercase_catalog_reference (line_id TEXT REFERENCES RECIPE_INGREDIENTS(id) ON DELETE CASCADE)');
    db.seed('INSERT INTO uppercase_catalog_reference SELECT id FROM recipe_ingredients ORDER BY id LIMIT 1');
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
    expect(db.query('SELECT count(1) AS n FROM uppercase_catalog_reference')[0].n).toBe(1);
  });
  it('detects an added trigger attached to an uppercase catalog table name', async () => {
    db.seed('CREATE TRIGGER uppercase_catalog_trigger AFTER DELETE ON RECIPE_INGREDIENTS BEGIN SELECT 1; END');
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('rejects an unknown D1 internal object before any pin or import', async () => {
    db.seed('CREATE TABLE _cf_unapproved (id TEXT)');
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.phase).toBe('LATEST_INTERRUPTED_IMPORT_PREFLIGHT');
    expect(receipt.latestImportInspection.status).toBe('INSPECTION_BLOCKED');
    expect(receipt.latestImportInspection.blockers).toContain('GUARD_APPROVED_INTERNAL_INVENTORY_MISMATCH');
    expect(receipt.recoveryPreflight).toBeUndefined();
    expect(receipt.recoveryDecision).toBeUndefined();
  });
  it('retains detection of incoming recipe references from an unknown application table', async () => {
    db.seed('CREATE TABLE additional_recipe_reference (recipe_id TEXT REFERENCES recipes(id))');
    await expect(run()).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it.each([false, undefined])('rejects corrected preflight without strict primary metadata: %s', async (primary) => {
    await expect(run({ inspectPreflight: (args) => inspectRecoveryPreflight({ ...args,
      query: (sql) => args.query(sql).map((row) => ({ ...row, meta: { served_by_primary: primary } })),
    }) })).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('rejects changing corrected preflights before any mutation', async () => {
    let observation = 0;
    await expect(run({ inspectPreflight: async (args) => ({ ...await inspectRecoveryPreflight(args), observation: observation++ }) }))
      .rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('rechecks the original Worker immediately before pinning', async () => {
    let n = 0;
    await expect(run({ worker: {
      ...options().worker,
      inspectProductionCatalogWorker: async () => ++n === 3 ? { ...staticProof, configuredMode: 'd1' } : staticProof,
    } })).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('rechecks main and normal approval after the corrected preflight', async () => {
    let n = 0;
    await expect(run({ authorize: async () => {
      if (n++) throw new Error('main or approval changed');
      return { mainSha: sha };
    } })).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('records only numeric provider codes and bounded exit status on file import failure', async () => {
    const execute = options().execute;
    await expect(run({ execute: (cmd, args, settings) => {
      if (args.includes('--file')) {
        const error = new Error('private provider token');
        error.status = 1;
        error.stderr = 'private provider token, [code: 10021], [code: 10021]';
        error.stdout = JSON.stringify({ error: { text: 'private provider token', code: 7500 } });
        throw error;
      }
      return execute(cmd, args, settings);
    } })).rejects.toThrow('RECOVERY_STOPPED');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED');
    expect(receipt.importFailure).toEqual({ category: 'COMMAND_FAILED', exitStatus: 1, providerCodes: [10021, 7500] });
    expect(JSON.stringify(receipt)).not.toContain('private provider token');
    expect(events).not.toContain('rollback');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(6720);
  });

  it.each(['malformed json', '[]', '[{"success":false}]'])
  ('does not claim success or rollback on an unproved file response: %s', async (response) => {
    const execute = options().execute;
    await expect(run({ execute: (cmd, args, settings) => {
      const result = execute(cmd, args, settings);
      return args.includes('--file') ? response : result;
    } })).rejects.toThrow('RECOVERY_STOPPED');
    expect(db.query('SELECT count(1) AS n FROM recipe_ingredients')[0].n).toBe(2702);
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.status).toBe('IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED');
    expect(receipt.importOutcome).toBe('ATTEMPTED_COMPLETION_UNCONFIRMED');
    expect(events).not.toContain('rollback');
  });
  it('keeps a timed-out import outcome unknown without inventing an exit status', async () => {
    const execute = options().execute;
    await expect(run({ execute: (cmd, args, settings) => {
      if (args.includes('--file')) {
        const error = new Error('private command');
        error.code = 'ETIMEDOUT'; error.status = null;
        throw error;
      }
      return execute(cmd, args, settings);
    } })).rejects.toThrow('RECOVERY_STOPPED');
    const receipt = JSON.parse(readFileSync(path.join(files, 'catalog-recovery-receipt.json'), 'utf8'));
    expect(receipt.importFailure).toEqual({ category: 'TIMED_OUT', providerCodes: [] });
    expect(events).not.toContain('rollback');
  });
  it('rejects changing corrected preflight observations in read-only inspect mode', async () => {
    let observation = 0;
    await expect(run(inspectionOptions({ inspectPreflight: async (args) => ({
      ...await inspectRecoveryPreflight(args), observation: observation++,
    }) }))).rejects.toThrow('RECOVERY_STOPPED');
    assertStoppedBeforeMutation();
  });
  it('requires exactly the full canonical38 ledger, rejecting gaps and duplicates', () => {
    expect(verifyRecoveryLedger([{ success: true, results: source.ledger.map((name) => ({ name })) }], source.ledger).count).toBe(38);
    expect(() => verifyRecoveryLedger([{ success: true, results: [] }], source.ledger)).toThrow();
    expect(() => verifyRecoveryLedger([{ success: true, results: source.ledger.map(() => ({ name: source.ledger[0] })) }], source.ledger)).toThrow();
  });
});
