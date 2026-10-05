import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeContentRead, prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { hydrateRuntimeRecipes } from '../../packages/recipes/src/runtime-hydration';
import { fingerprintRecipes } from '../../packages/recipes/src/catalog-fingerprint';
import { loadCertifiedRecoverySource } from '../../scripts/recipe-catalog-recovery.mjs';
import { requirePinnedStaticWorker, runCatalogRecovery, verifyRecoveryLedger } from '../../scripts/production-catalog-recovery-runner.mjs';

const cwd = process.cwd();
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const fingerprint = 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37';
const capacityBytes = 8 * 1024 * 1024;
let source;
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
const staticProof = { deployment: { versionId: 'old-active' }, configuredMode: 'static',
  cutoverEnabled: false, canaryPercent: 0, authorityVerified: true, compatibilityCode: 'SUPPORTED', modules: { sha256: 'a'.repeat(64) } };

beforeAll(async () => { source = await loadCertifiedRecoverySource({ sha }); }, 30000);
beforeEach(() => {
  db = new SqliteD1({ through: '0038_auth_onboarding_completion.sql' });
  db.seed('CREATE TABLE d1_migrations (name TEXT PRIMARY KEY)');
  for (const name of db.migrations) db.execute('INSERT INTO d1_migrations VALUES (?)', [name]);
  db.seed('DELETE FROM recipe_runtime_ingredient_order; UPDATE recipes SET version = 2;');
  const recipeId = db.query('SELECT id FROM recipes ORDER BY id LIMIT 1')[0].id;
  const ingredientId = db.query('SELECT id FROM ingredients ORDER BY id LIMIT 1')[0].id;
  for (let i = 0; i < 4018; i++) db.execute("INSERT INTO recipe_ingredients VALUES (?, ?, ?, 'unreviewed', 1, 'g', 0)", [`extra_${i}`, recipeId, ingredientId]);
  files = mkdtempSync(path.join(os.tmpdir(), 'catalog-recovery-runner-'));
  events = []; sqlCommands = []; preLedgerMeta = { size_after: capacityBytes };
  failPost = false; mutateStatic = false; inspections = 0; loseImportResponse = false;
});
afterEach(() => db.close());

function options(extra = {}) {
  return {
    operation: 'restore-v1', env, cwd,
    authorize: async () => { events.push('authorize'); return { mainSha: sha }; },
    loadSource: async () => source,
    loadPipeline: async () => ({
      queries: prepareRecipeContentRead({ prepare: (sql) => sql }), mapRecipeContentRead,
      hydrateRuntimeRecipes, fingerprintRecipes, close: async () => {},
    }),
    worker: {
      inspectProductionCatalogWorker: async () => {
        inspections++; events.push('inspect');
        return inspections === 2 && mutateStatic ? { ...staticProof, configuredMode: 'd1' } : staticProof;
      },
      pinProductionCatalogStatic: async ({ expectedVersionId, beforeMutation }) => {
        expect(expectedVersionId).toBe('old-active');
        await beforeMutation(); events.push('pin'); return { status: 'static-verified', versionId: 'old-active', modules: { sha256: 'a'.repeat(64) } };
      },
    },
    execute: (_cmd, args) => {
      if (args[2] === 'list') return JSON.stringify([{ name: 'frigo-db', uuid: 'f975ec39-b2c8-4a2a-80e1-0366054599d3' }]);
      if (args[2] === 'time-travel') { events.push('bookmark'); return JSON.stringify({ bookmark: 'fixture-bookmark' }); }
      if (args.includes('--file')) {
        const file = args[args.indexOf('--file') + 1];
        const kind = file.endsWith('rollback.sql') ? 'rollback' : 'import';
        events.push(kind);
        db.seed('BEGIN IMMEDIATE');
        try { db.seed(readFileSync(path.join(files, path.basename(file)), 'utf8')); db.seed('COMMIT'); }
        catch (error) { db.seed('ROLLBACK'); throw error; }
        if (loseImportResponse && kind === 'import') throw new Error('response lost after commit');
        return 'atomic import completed';
      }
      const sql = args[args.indexOf('--command') + 1];
      sqlCommands.push(sql);
      if (/pragma_page_(?:count|size)/i.test(sql)) throw new Error('Remote D1 pragma not supported');
      if (sql.startsWith('SELECT name FROM d1_migrations')) events.push('ledger');
      if (failPost && events.includes('import') && sql === 'PRAGMA quick_check') throw new Error('provider/private row text');
      const statements = sql.split(';').filter((s) => s.trim()).map((s) => db.execute(s));
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
    preLedgerMeta = { size_after: 100 * 1024 * 1024 - 1 };
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
    const pinned = { versionId: 'old-active', modules: { sha256: 'a'.repeat(64) } };
    expect(() => requirePinnedStaticWorker(staticProof, pinned)).not.toThrow();
    for (const change of [
      { authorityVerified: false }, { compatibilityCode: 'UNSUPPORTED_METADATA' },
      { deployment: { versionId: 'different-static' } }, { modules: { sha256: 'b'.repeat(64) } },
    ]) expect(() => requirePinnedStaticWorker({ ...staticProof, ...change }, pinned)).toThrow();
  });
  it('has no mutation path in inspect mode', async () => {
    const receipt = await run({ operation: 'inspect', env: { ...env, RECOVERY_OPERATION: 'inspect' } });
    expect(receipt.status).toBe('INSPECTED_READ_ONLY');
    expect(events).not.toContain('pin'); expect(events).not.toContain('import'); expect(events).not.toContain('bookmark');
  });
  it('requires exactly the full canonical38 ledger, rejecting gaps and duplicates', () => {
    expect(verifyRecoveryLedger([{ success: true, results: source.ledger.map((name) => ({ name })) }], source.ledger).count).toBe(38);
    expect(() => verifyRecoveryLedger([{ success: true, results: [] }], source.ledger)).toThrow();
    expect(() => verifyRecoveryLedger([{ success: true, results: source.ledger.map(() => ({ name: source.ledger[0] })) }], source.ledger)).toThrow();
  });
});
