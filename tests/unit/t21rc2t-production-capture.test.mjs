import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_D1 } from '../../scripts/d1-migration-check.mjs';
import { captureDigest, T21RC2_SELECTS } from '../../scripts/t21rc2-production-capture.mjs';
import {
  assertT21RC2TFixedProductionSelect,
  captureT21RC2TProduction,
  captureT21RC2TStableSnapshot,
  executeT21RC2TFixedProductionSelect,
  proveT21RC2TCloudflareIdentity,
  validateT21RC2TProductionCounts,
  verifyT21RC2TCloudflareIdentity,
  T21RC2T_EXPECTED_PRODUCTION_COUNTS,
  T21RC2T_LEDGER_TIP,
  T21RC2T_SELECTS,
} from '../../scripts/t21rc2t-production-capture.mjs';
import {
  cleanupT21RC2TFiles,
  privateDirectory,
  publicDirectory,
  readT21RC2TCapture,
  readT21RC2TPrivateJson,
  readT21RC2TPublicReceipt,
  safeT21RC2TError,
  validateCaptureBinding,
  writeT21RC2TPrivateJson,
  writeT21RC2TPublicReceipt,
} from '../../scripts/t21rc2t-production-files.mjs';

const ACCOUNT_ID = Array.from({ length: 32 }, (_, index) => '0123456789abcdef'[index % 16]).join('');
const TEST_AUTHORIZATION = Object.freeze({
  schemaVersion: 1,
  repositoryId: 1385308553,
  repository: 'vn-tak/Tako-san',
  workflowPath: '.github/workflows/production-d1-t21rc2t-identity-topology.yml',
  mainSha: 'a'.repeat(40),
  reviewedSha: 'b'.repeat(40),
  runId: '901',
  runAttempt: '1',
  actor: 'vn-tak',
  triggeringActor: 'vn-tak',
  ci: { id: 700, attempt: 1, headSha: 'a'.repeat(40) },
  approval: {
    environment: 'production', state: 'approved', reviewer: 'vn-taphoanhatung',
    actor: 'vn-tak', triggeringActor: 'vn-tak',
    historySha256: 'c'.repeat(64), policySha256: 'd'.repeat(64),
  },
});
const AUTHORITY_PROOF = Object.freeze({
  canonicalTargetSha256: 'a'.repeat(64),
  releaseManifestSha256: 'b'.repeat(64),
  approvedBatchesSha256: 'c'.repeat(64),
  canonicalRegistrySourceSha256: 'd'.repeat(64),
  reconciliationSha256: 'e'.repeat(64),
  releaseId: 'offline-fixture-release',
  runtimeFingerprint: 'f'.repeat(64),
  reviewedBridgeCount: 0,
});

function runnerFixture() {
  const runnerTemp = mkdtempSync(path.join(tmpdir(), 't21rc2t-capture-'));
  return { runnerTemp, env: { RUNNER_TEMP: runnerTemp }, cwd: process.cwd() };
}

function ledgerRows(count = 38) {
  return Array.from({ length: count }, (_, index) => ({
    name: index === 37 ? T21RC2T_LEDGER_TIP : `${String(index + 1).padStart(4, '0')}_fixture_${index + 1}.sql`,
  }));
}

function occurrence(changes = {}) {
  return {
    id: 'PRIVATE_PHYSICAL_ROW_MARKER',
    recipe_id: 'recipe-one',
    ingredient_id: 'ING_TEST',
    name: 'PRIVATE_INGREDIENT_NAME_MARKER',
    required_quantity: 2.5,
    unit: 'g',
    is_optional: 0,
    ...changes,
  };
}

function captureFixture({ mutateSecondRead, ledger = ledgerRows(), rosterChanges, countChanges } = {}) {
  let ledgerRead = 0;
  let countRead = 0;
  let rosterRead = 0;
  let occurrenceRead = 0;
  const stored = new Map();
  const read = (name) => {
    if (name === 'ledger') {
      ledgerRead += 1;
      return ledger;
    }
    if (name === 'counts') {
      countRead += 1;
      if (countChanges && countRead >= countChanges.at) return [{ recipe_count: 1, ingredient_occurrence_count: 2 }];
      return [{ recipe_count: 1, ingredient_occurrence_count: 1 }];
    }
    if (name === 'roster') {
      rosterRead += 1;
      if (rosterChanges && rosterRead >= rosterChanges.at) return [{ id: 'other-recipe' }];
      return [{ id: 'recipe-one' }];
    }
    if (name === 'occurrences') {
      occurrenceRead += 1;
      return [occurrence(mutateSecondRead && occurrenceRead > 1 ? { required_quantity: 9 } : {})];
    }
    throw new Error('UNREACHABLE_QUERY_MARKER');
  };
  const options = {
    read,
    expectedRecipeIds: ['recipe-one'],
    expectedLedger: ledgerRows().map((row) => row.name),
    authorityProof: AUTHORITY_PROOF,
    authorization: TEST_AUTHORIZATION,
    database: { name: PRODUCTION_D1.name, id: PRODUCTION_D1.id, accountVerified: true },
    store: (name, value) => stored.set(name, value),
  };
  return { options, stored, readCounts: () => ({ ledgerRead, countRead, rosterRead, occurrenceRead }) };
}

function actionEnvironment(runnerTemp) {
  return {
    ...runnerFixtureBase(runnerTemp),
  };
}

function runnerFixtureBase(runnerTemp) {
  return {
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_SHA: TEST_AUTHORIZATION.mainSha,
    GITHUB_REPOSITORY_ID: '1385308553',
    GITHUB_REPOSITORY: 'vn-tak/Tako-san',
    GITHUB_RUN_ID: '901',
    GITHUB_RUN_ATTEMPT: '1',
    GITHUB_ACTOR: 'vn-tak',
    GITHUB_TRIGGERING_ACTOR: 'vn-tak',
    RELEASE_REF: TEST_AUTHORIZATION.mainSha,
    REVIEWED_SHA: TEST_AUTHORIZATION.reviewedSha,
    CONFIRM_T21RC2T_READ_ONLY_DIAGNOSTIC: 'true',
    RUNNER_TEMP: runnerTemp,
  };
}

function expectedCapture(input = {
  recipeIds: ['recipe-one'],
  occurrences: [occurrence()],
  captureCounts: { recipeCount: 1, ingredientOccurrenceCount: 1 },
}) {
  return {
    schemaVersion: 1,
    status: 'OBSERVED_STABLE_NON_ATOMIC',
    database: { name: 'frigo-db', id: 'f975ec39-b2c8-4a2a-80e1-0366054599d3', accountVerified: true },
    ledger: { count: 38, tip: T21RC2T_LEDGER_TIP, namesSha256: '1'.repeat(64) },
    counts: { recipeCount: input.recipeIds.length, ingredientOccurrenceCount: input.occurrences.length },
    authorityProof: AUTHORITY_PROOF,
    authorizationSha256: captureDigest(TEST_AUTHORIZATION),
    snapshotDigestSha256: captureDigest(input),
  };
}

describe('T21R-C2T fixed read-only capture envelope', () => {
  it('reuses the exact four certified C2 SELECTs and rejects any query variation', () => {
    expect(T21RC2T_SELECTS).toEqual(T21RC2_SELECTS);
    expect(Object.keys(T21RC2T_SELECTS).sort()).toEqual(['counts', 'ledger', 'occurrences', 'roster']);
    for (const sql of Object.values(T21RC2T_SELECTS)) {
      expect(assertT21RC2TFixedProductionSelect(sql)).toBe(sql);
    }
    for (const sql of [
      'SELECT id FROM recipes WHERE id = "user-input";',
      'SELECT id FROM recipes; DELETE FROM recipes;',
      'PRAGMA table_info(recipes);',
      'SELECT writefile("/tmp/x", "x");',
      'SELECT readfile("/tmp/x");',
      'SELECT load_extension("extension");',
      'UPDATE recipe_ingredients SET name = "x";',
      'INSERT INTO recipes(id) VALUES ("x");',
      'DELETE FROM recipes;',
      'CREATE TABLE attacker(id);',
      'ATTACH DATABASE "x" AS attacker;',
      'VACUUM;',
      'REINDEX;',
    ]) {
      expect(() => assertT21RC2TFixedProductionSelect(sql)).toThrow('T21RC2T_QUERY_REJECTED');
    }
  });

  it('executes only a fixed SELECT through argv and strips GitHub tokens from Wrangler env', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    const calls = [];
    const execute = (binary, args, options) => {
      calls.push({ binary, args, options });
      return JSON.stringify([{ success: true, results: [{ count: 1 }], meta: { changes: 0, rows_written: 0 } }]);
    };
    try {
      const rows = executeT21RC2TFixedProductionSelect('counts', {
        execute,
        cwd,
        env: { ...env, GH_TOKEN: 'PRIVATE_GH_TOKEN', GITHUB_TOKEN: 'PRIVATE_GITHUB_TOKEN' },
      });
      expect(rows).toEqual([{ count: 1 }]);
      expect(calls).toHaveLength(1);
      expect(calls[0].binary).toBe('pnpm');
      expect(calls[0].args.slice(0, 6)).toEqual(['wrangler', 'd1', 'execute', 'frigo-db', '--remote', '--yes']);
      expect(calls[0].args.at(-1)).toBe(T21RC2T_SELECTS.counts);
      expect(calls[0].args.at(-2)).toBe('--command');
      expect(calls[0].options.env).not.toHaveProperty('GH_TOKEN');
      expect(calls[0].options.env).not.toHaveProperty('GITHUB_TOKEN');
      expect(calls[0].options.env.WRANGLER_LOG_PATH).toBe(path.join(privateDirectory(env, cwd), 'wrangler.log'));
      expect(() => executeT21RC2TFixedProductionSelect('arbitrary', { execute, cwd, env }))
        .toThrow('T21RC2T_QUERY_REJECTED');
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('turns upstream execution and JSON errors into fixed query codes', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    try {
      expect(() => executeT21RC2TFixedProductionSelect('ledger', {
        execute: () => { throw new Error('PRIVATE_WRANGLER_OUTPUT_MARKER'); }, cwd, env,
      })).toThrow('T21RC2T_QUERY_FAILED');
      expect(() => executeT21RC2TFixedProductionSelect('ledger', {
        execute: () => 'PRIVATE_WRANGLER_OUTPUT_MARKER', cwd, env,
      })).toThrow('T21RC2T_QUERY_FAILED');
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('rejects 0039 in the observed ledger, roster drift, count drift, and A/B instability', async () => {
    const with0039 = ledgerRows();
    with0039.push({ name: '0039_meal_composition_v2.sql' });
    await expect(captureT21RC2TStableSnapshot(captureFixture({ ledger: with0039 }).options))
      .rejects.toThrow('T21RC2T_LEDGER_CHANGED');

    await expect(captureT21RC2TStableSnapshot(captureFixture({ rosterChanges: { at: 1 } }).options))
      .rejects.toThrow('T21RC2T_RECIPE_ROSTER_CHANGED');

    await expect(captureT21RC2TStableSnapshot(captureFixture({ countChanges: { at: 2 } }).options))
      .rejects.toThrow('T21RC2T_CAPTURE_REJECTED');

    const unstable = captureFixture({ mutateSecondRead: true });
    await expect(captureT21RC2TStableSnapshot(unstable.options)).rejects.toThrow('T21RC2T_SNAPSHOT_UNSTABLE');
    expect(unstable.readCounts().occurrenceRead).toBe(2);
  });

  it('preserves the validated private classifier-input and capture-proof binding', async () => {
    const fixture = captureFixture();
    const result = await captureT21RC2TStableSnapshot(fixture.options);
    expect(fixture.stored.has('capture-a.json')).toBe(true);
    expect(fixture.stored.has('capture-b.json')).toBe(true);
    expect(fixture.stored.has('capture-observations.json')).toBe(true);
    expect(result.capture.status).toBe('OBSERVED_STABLE_NON_ATOMIC');
    expect(validateCaptureBinding({
      input: result.input,
      capture: result.capture,
      authorization: TEST_AUTHORIZATION,
    })).toBe(true);
    expect(() => validateCaptureBinding({
      input: { ...result.input, captureCounts: { recipeCount: 1, ingredientOccurrenceCount: 2 } },
      capture: result.capture,
      authorization: TEST_AUTHORIZATION,
    })).toThrow('T21RC2T_CAPTURE_REJECTED');
  });
});

describe('T21R-C2T production identity and forensic count contract', () => {
  it('validates account plus exact production D1 identity without persisting identity output', () => {
    const whoami = `Cloudflare account ${ACCOUNT_ID}`;
    const list = [{ name: PRODUCTION_D1.name, uuid: PRODUCTION_D1.id }];
    expect(verifyT21RC2TCloudflareIdentity({ accountId: ACCOUNT_ID, whoami, list })).toEqual({
      name: PRODUCTION_D1.name, id: PRODUCTION_D1.id, accountVerified: true,
    });
    expect(() => verifyT21RC2TCloudflareIdentity({ accountId: ACCOUNT_ID, whoami: 'wrong account', list }))
      .toThrow('T21RC2T_IDENTITY_REJECTED');
    expect(() => verifyT21RC2TCloudflareIdentity({
      accountId: ACCOUNT_ID, whoami, list: [{ name: PRODUCTION_D1.name, uuid: 'wrong-database' }],
    })).toThrow('T21RC2T_IDENTITY_REJECTED');
  });

  it('pipes Wrangler identity output into the verifier and confines logs to the private directory', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    const calls = [];
    const execute = (binary, args, options) => {
      calls.push({ binary, args, options });
      if (args[1] === 'whoami') return `account ${ACCOUNT_ID}`;
      return JSON.stringify([{ name: PRODUCTION_D1.name, uuid: PRODUCTION_D1.id }]);
    };
    try {
      const result = proveT21RC2TCloudflareIdentity({
        execute,
        cwd,
        env: {
          ...env,
          GH_TOKEN: 'PRIVATE_GH_TOKEN',
          GITHUB_TOKEN: 'PRIVATE_GITHUB_TOKEN',
          CLOUDFLARE_API_TOKEN: 'PRIVATE_CF_TOKEN',
          CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
        },
      });
      expect(result.accountVerified).toBe(true);
      expect(calls.map(({ args }) => args.slice(1, 3))).toEqual([
        ['whoami'],
        ['d1', 'list'],
      ]);
      expect(calls.every(({ options }) => options.stdio[1] === 'pipe' && options.stdio[2] === 'pipe')).toBe(true);
      expect(calls.every(({ options }) => !Object.hasOwn(options.env, 'GH_TOKEN')
        && !Object.hasOwn(options.env, 'GITHUB_TOKEN'))).toBe(true);
      expect(calls.every(({ options }) => options.env.WRANGLER_LOG_PATH.startsWith(privateDirectory(env, cwd)))).toBe(true);
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('returns fixed identity errors for malformed credentials and hostile CLI output', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    try {
      expect(() => proveT21RC2TCloudflareIdentity({
        cwd, env: { ...env, CLOUDFLARE_API_TOKEN: 'PRIVATE', CLOUDFLARE_ACCOUNT_ID: 'wrong' },
      })).toThrow('T21RC2T_IDENTITY_REJECTED');
      expect(() => proveT21RC2TCloudflareIdentity({
        cwd,
        env: { ...env, CLOUDFLARE_API_TOKEN: 'PRIVATE', CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID },
        execute: () => { throw new Error('PRIVATE_CLOUDFLARE_OUTPUT_MARKER'); },
      })).toThrow('T21RC2T_IDENTITY_REJECTED');
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('fails closed on any forensic production count drift', () => {
    const input = {
      recipeIds: Array.from({ length: 500 }, (_, index) => `recipe-${index}`),
      occurrences: new Array(6720),
      captureCounts: { recipeCount: 500, ingredientOccurrenceCount: 6720 },
    };
    const capture = { counts: { recipeCount: 500, ingredientOccurrenceCount: 6720 } };
    expect(validateT21RC2TProductionCounts({ input, capture })).toBe(true);
    expect(T21RC2T_EXPECTED_PRODUCTION_COUNTS).toEqual({ recipeCount: 500, ingredientOccurrenceCount: 6720 });
    expect(() => validateT21RC2TProductionCounts({
      input: { ...input, occurrences: new Array(6719), captureCounts: { ...input.captureCounts, ingredientOccurrenceCount: 6719 } },
      capture: { counts: { recipeCount: 500, ingredientOccurrenceCount: 6719 } },
    })).toThrow('T21RC2T_CAPTURE_REJECTED');
  });

  it('reauthorizes before identity and cannot query after an identity failure', async () => {
    const { runnerTemp, cwd } = runnerFixture();
    const env = actionEnvironment(runnerTemp);
    const calls = [];
    writeT21RC2TPrivateJson('authorization.json', TEST_AUTHORIZATION, env, cwd);
    try {
      await expect(captureT21RC2TProduction({
        env,
        cwd,
        authorize: async () => { calls.push('reauthorize'); return TEST_AUTHORIZATION; },
        loadAuthority: async () => {
          calls.push('load-authority');
          return { targetRecipes: Array.from({ length: 500 }, (_, index) => ({ id: `recipe-${index}` })) };
        },
        loadLedger: () => { calls.push('ledger'); return ledgerRows().map((row) => row.name); },
        proveIdentity: () => { calls.push('identity'); throw new Error('PRIVATE_IDENTITY_FAILURE_MARKER'); },
        readSelect: () => { calls.push('production-select'); return []; },
      })).rejects.toThrow('T21RC2T_IDENTITY_REJECTED');
      expect(calls).toEqual(['reauthorize', 'load-authority', 'ledger', 'identity']);
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });
});

describe('T21R-C2T runner-local evidence lifecycle', () => {
  it('stores authorization and capture only under restrictive runner-local directories', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    try {
      writeT21RC2TPrivateJson('authorization.json', TEST_AUTHORIZATION, env, cwd);
      expect(readT21RC2TPrivateJson('authorization.json', env, cwd)).toEqual(TEST_AUTHORIZATION);
      expect((lstatSync(privateDirectory(env, cwd)).mode & 0o777).toString(8)).toBe('700');
      expect((lstatSync(path.join(privateDirectory(env, cwd), 'authorization.json')).mode & 0o777).toString(8)).toBe('600');
      expect(() => writeT21RC2TPrivateJson('arbitrary.json', {}, env, cwd))
        .toThrow('T21RC2T_PRIVATE_PATH_REJECTED');
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('rejects workspace-local runner storage and does not follow a private-directory symlink', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    const outside = mkdtempSync(path.join(tmpdir(), 't21rc2t-outside-'));
    const marker = path.join(outside, 'keep.txt');
    writeFileSync(marker, 'do not remove');
    try {
      expect(() => privateDirectory({ RUNNER_TEMP: cwd }, cwd)).toThrow('T21RC2T_PRIVATE_PATH_REJECTED');
      symlinkSync(outside, path.join(runnerTemp, 't21rc2t-private'));
      expect(() => privateDirectory(env, cwd)).toThrow('T21RC2T_PRIVATE_PATH_REJECTED');
      cleanupT21RC2TFiles(env, cwd);
      expect(readFileSync(marker, 'utf8')).toBe('do not remove');
    } finally {
      rmSync(runnerTemp, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it('reads a capture only after digest binding and writes one fixed public filename', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    const input = {
      recipeIds: ['recipe-one'],
      occurrences: [occurrence()],
      captureCounts: { recipeCount: 1, ingredientOccurrenceCount: 1 },
    };
    const capture = expectedCapture(input);
    try {
      writeT21RC2TPrivateJson('authorization.json', TEST_AUTHORIZATION, env, cwd);
      writeT21RC2TPrivateJson('classifier-input.json', input, env, cwd);
      writeT21RC2TPrivateJson('capture-verified.json', capture, env, cwd);
      expect(readT21RC2TCapture({ env, cwd })).toEqual({ input, capture, authorization: TEST_AUTHORIZATION });
      writeT21RC2TPrivateJson('authorization-final.json', TEST_AUTHORIZATION, env, cwd);
      expect(readT21RC2TCapture({ env, cwd, requireFinalAuthorization: true }).finalAuthorization)
        .toEqual(TEST_AUTHORIZATION);

      const publicReceipt = { schemaVersion: 1, status: 'PUBLIC_SAFE_FIXTURE' };
      const file = writeT21RC2TPublicReceipt(publicReceipt, env, cwd);
      expect(file).toBe(path.join(runnerTemp, 't21rc2t-public', 't21rc2t-public-receipt.json'));
      expect(readT21RC2TPublicReceipt(env, cwd)).toEqual(publicReceipt);
      expect((lstatSync(publicDirectory(env, cwd)).mode & 0o777).toString(8)).toBe('700');

      expect(() => readT21RC2TCapture({
        env,
        cwd,
        requireFinalAuthorization: true,
      })).not.toThrow();
      expect(() => writeT21RC2TPublicReceipt({ changed: true }, env, cwd))
        .toThrow('T21RC2T_PRIVATE_PATH_REJECTED');
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('maps accessors and malformed private files to fixed errors without source details', () => {
    const { runnerTemp, env, cwd } = runnerFixture();
    const hostile = {};
    Object.defineProperty(hostile, 'status', { get: () => { throw new Error('PRIVATE_ACCESSOR_MARKER'); } });
    try {
      expect(() => validateCaptureBinding({ input: hostile, capture: hostile, authorization: hostile }))
        .toThrow('T21RC2T_CAPTURE_REJECTED');
      writeT21RC2TPrivateJson('authorization.json', {}, env, cwd);
      expect(() => readT21RC2TCapture({ env, cwd })).toThrow('T21RC2T_CAPTURE_REJECTED');
      expect(safeT21RC2TError({ get code() { throw new Error('PRIVATE_CODE_MARKER'); } }))
        .toBe('T21RC2T_CAPTURE_REJECTED');
    } finally {
      cleanupT21RC2TFiles(env, cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });
});
