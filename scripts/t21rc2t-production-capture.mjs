#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PRODUCTION_D1, verifyProductionWranglerConfigFile } from './d1-migration-check.mjs';
import { reviewedLedgerNames, T21RC2_SELECTS, captureT21RC2Snapshot, assertFixedProductionSelect,
  verifyT21RC2CloudflareIdentity } from './t21rc2-production-capture.mjs';
import { loadCertifiedV1Authority } from './t21r-v1-authority.mjs';
import { safeT21RC2Error } from './t21rc2-production-files.mjs';
import {
  authorizeT21RC2TProductionRun,
  requireImmutableT21RC2TAuthorizationMatch,
  requireStoredT21RC2TAuthorization,
} from './t21rc2t-production-approval.mjs';
import {
  cleanupT21RC2TFiles,
  privateDirectory,
  readT21RC2TPrivateJson,
  safeT21RC2TError,
  t21rc2tError,
  validateCaptureBinding,
  writeT21RC2TPrivateJson,
} from './t21rc2t-production-files.mjs';

export const T21RC2T_SELECTS = Object.freeze({ ...T21RC2_SELECTS });
export const T21RC2T_EXPECTED_PRODUCTION_COUNTS = Object.freeze({ recipeCount: 500, ingredientOccurrenceCount: 6720 });
export const T21RC2T_LEDGER_COUNT = 38;
export const T21RC2T_LEDGER_TIP = '0038_auth_onboarding_completion.sql';
const MAX_QUERY_BUFFER = 64 * 1024 * 1024;
const MAX_IDENTITY_BUFFER = 4 * 1024 * 1024;
const MUTATING_SQL = /\b(INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX|load_extension|writefile|readfile)\b/i;

const fail = (condition, code = 'T21RC2T_CAPTURE_REJECTED') => {
  if (!condition) throw t21rc2tError(code);
};

export function assertT21RC2TFixedProductionSelect(sql) {
  try {
    fail(typeof sql === 'string' && /^SELECT\b/.test(sql) && !MUTATING_SQL.test(sql)
      && Object.values(T21RC2T_SELECTS).includes(sql), 'T21RC2T_QUERY_REJECTED');
    assertFixedProductionSelect(sql);
    return sql;
  } catch {
    throw t21rc2tError('T21RC2T_QUERY_REJECTED');
  }
}

function wranglerEnvironment(env, cwd) {
  const { GH_TOKEN, GITHUB_TOKEN, ...cloudflareEnv } = env;
  return {
    ...cloudflareEnv,
    WRANGLER_SEND_METRICS: 'false',
    WRANGLER_LOG: 'log',
    WRANGLER_LOG_PATH: path.join(privateDirectory(env, cwd), 'wrangler.log'),
  };
}

function outputText(value) {
  return Buffer.isBuffer(value) ? value.toString('utf8') : value;
}

export function executeT21RC2TFixedProductionSelect(name, {
  execute = execFileSync,
  cwd = process.cwd(),
  env = process.env,
} = {}) {
  try {
    fail(typeof name === 'string' && Object.hasOwn(T21RC2T_SELECTS, name), 'T21RC2T_QUERY_REJECTED');
    const sql = assertT21RC2TFixedProductionSelect(T21RC2T_SELECTS[name]);
    verifyProductionWranglerConfigFile(path.join(cwd, 'wrangler.jsonc'));
    const raw = execute('pnpm', [
      'wrangler', 'd1', 'execute', PRODUCTION_D1.name, '--remote', '--yes', '--json',
      '--config', 'wrangler.jsonc', '--command', sql,
    ], {
      cwd,
      env: wranglerEnvironment(env, cwd),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: MAX_QUERY_BUFFER,
    });
    const statements = JSON.parse(outputText(raw));
    fail(Array.isArray(statements) && statements.length === 1
      && statements[0]?.success === true && Array.isArray(statements[0].results)
      && statements[0].truncated !== true && statements[0].has_more !== true
      && statements[0].meta?.truncated !== true && statements[0].meta?.has_more !== true
      && !statements[0].meta?.cursor && !statements[0].meta?.next_page
      && !statements[0].result_info?.cursor
      && (statements[0].meta?.changes === undefined || statements[0].meta.changes === 0)
      && (statements[0].meta?.rows_written === undefined || statements[0].meta.rows_written === 0),
    'T21RC2T_QUERY_FAILED');
    return statements[0].results;
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_QUERY_REJECTED') {
      throw t21rc2tError('T21RC2T_QUERY_REJECTED');
    }
    throw t21rc2tError('T21RC2T_QUERY_FAILED');
  }
}

export function verifyT21RC2TCloudflareIdentity({ accountId, whoami, list }) {
  try {
    const identity = verifyT21RC2CloudflareIdentity({ accountId, whoami, list });
    return { name: identity.name, id: identity.id, accountVerified: identity.accountVerified };
  } catch {
    throw t21rc2tError('T21RC2T_IDENTITY_REJECTED');
  }
}

export function proveT21RC2TCloudflareIdentity({
  execute = execFileSync,
  env = process.env,
  cwd = process.cwd(),
} = {}) {
  try {
    fail(typeof env.CLOUDFLARE_API_TOKEN === 'string' && env.CLOUDFLARE_API_TOKEN.length > 0
      && /^[0-9a-f]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID ?? ''), 'T21RC2T_IDENTITY_REJECTED');
    verifyProductionWranglerConfigFile(path.join(cwd, 'wrangler.jsonc'));
    const options = {
      cwd,
      env: wranglerEnvironment(env, cwd),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: MAX_IDENTITY_BUFFER,
    };
    const whoami = outputText(execute('pnpm', ['wrangler', 'whoami'], options));
    const list = JSON.parse(outputText(execute('pnpm', [
      'wrangler', 'd1', 'list', '--json', '--config', 'wrangler.jsonc',
    ], options)));
    return verifyT21RC2TCloudflareIdentity({ accountId: env.CLOUDFLARE_ACCOUNT_ID, whoami, list });
  } catch {
    throw t21rc2tError('T21RC2T_IDENTITY_REJECTED');
  }
}

export function validateT21RC2TProductionCounts({ input, capture } = {}) {
  try {
    const expected = T21RC2T_EXPECTED_PRODUCTION_COUNTS;
    fail(input?.recipeIds?.length === expected.recipeCount
      && input?.occurrences?.length === expected.ingredientOccurrenceCount
      && input?.captureCounts?.recipeCount === expected.recipeCount
      && input?.captureCounts?.ingredientOccurrenceCount === expected.ingredientOccurrenceCount
      && capture?.counts?.recipeCount === expected.recipeCount
      && capture?.counts?.ingredientOccurrenceCount === expected.ingredientOccurrenceCount);
    return true;
  } catch {
    throw t21rc2tError('T21RC2T_CAPTURE_REJECTED');
  }
}

export async function captureT21RC2TStableSnapshot(options = {}) {
  try {
    return await captureT21RC2Snapshot(options);
  } catch (error) {
    throw mapCaptureError(error);
  }
}

function mapCaptureError(error) {
  const t21rc2tCode = safeT21RC2TError(error);
  if (t21rc2tCode !== 'T21RC2T_CAPTURE_REJECTED') return t21rc2tError(t21rc2tCode);
  const code = safeT21RC2Error(error);
  const mapped = {
    T21RC2_LEDGER_CHANGED: 'T21RC2T_LEDGER_CHANGED',
    T21RC2_RECIPE_ROSTER_CHANGED: 'T21RC2T_RECIPE_ROSTER_CHANGED',
    T21RC2_PRODUCTION_SNAPSHOT_UNSTABLE: 'T21RC2T_SNAPSHOT_UNSTABLE',
    T21RC2_QUERY_REJECTED: 'T21RC2T_QUERY_REJECTED',
    T21RC2_QUERY_FAILED: 'T21RC2T_QUERY_FAILED',
    T21RC2_IDENTITY_REJECTED: 'T21RC2T_IDENTITY_REJECTED',
    T21RC2_PRIVATE_PATH_REJECTED: 'T21RC2T_PRIVATE_PATH_REJECTED',
  };
  return t21rc2tError(mapped[code] ?? 'T21RC2T_CAPTURE_REJECTED');
}

export async function captureT21RC2TProduction({
  env = process.env,
  cwd = process.cwd(),
  execute = execFileSync,
  fetchImpl = fetch,
  authorize = authorizeT21RC2TProductionRun,
  loadAuthority = loadCertifiedV1Authority,
  loadLedger = reviewedLedgerNames,
  proveIdentity = proveT21RC2TCloudflareIdentity,
  readSelect = executeT21RC2TFixedProductionSelect,
} = {}) {
  let storedAuthorization;
  let freshAuthorization;
  try {
    storedAuthorization = readT21RC2TPrivateJson('authorization.json', env, cwd);
    requireStoredT21RC2TAuthorization(storedAuthorization, env);
    freshAuthorization = await authorize({ env, cwd, execute, fetchImpl, requireApproval: true });
    requireStoredT21RC2TAuthorization(freshAuthorization, env);
    requireImmutableT21RC2TAuthorizationMatch(storedAuthorization, freshAuthorization, 'T21RC2T_RECHECK_REJECTED');
  } catch {
    throw t21rc2tError('T21RC2T_RECHECK_REJECTED');
  }

  let authority;
  let expectedLedger;
  try {
    authority = await loadAuthority(cwd);
    fail(Array.isArray(authority?.targetRecipes) && authority.targetRecipes.length === 500);
    expectedLedger = loadLedger(cwd, freshAuthorization.mainSha);
    fail(Array.isArray(expectedLedger) && expectedLedger.length === T21RC2T_LEDGER_COUNT
      && expectedLedger.at(-1) === T21RC2T_LEDGER_TIP);
  } catch (error) {
    throw mapCaptureError(error);
  }

  let database;
  try {
    database = proveIdentity({ execute, env, cwd });
  } catch {
    throw t21rc2tError('T21RC2T_IDENTITY_REJECTED');
  }
  let result;
  result = await captureT21RC2TStableSnapshot({
    read: (name) => readSelect(name, { execute, cwd, env }),
    expectedRecipeIds: authority.targetRecipes.map((recipe) => recipe.id),
    expectedLedger,
    authorityProof: authority.authorityProof,
    authorization: freshAuthorization,
    database,
    store: (name, value) => writeT21RC2TPrivateJson(name, value, env, cwd),
  });

  try {
    validateCaptureBinding({
      input: result.input,
      capture: result.capture,
      authorization: freshAuthorization,
    });
    validateT21RC2TProductionCounts(result);
    writeT21RC2TPrivateJson('classifier-input.json', result.input, env, cwd);
    writeT21RC2TPrivateJson('capture-verified.json', result.capture, env, cwd);
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_CAPTURE_REJECTED'
      || safeT21RC2TError(error) === 'T21RC2T_PRIVATE_PATH_REJECTED') throw error;
    throw t21rc2tError('T21RC2T_CAPTURE_REJECTED');
  }
  return { capture: result.capture };
}

export async function runT21RC2TProductionCaptureCommand(command, options = {}) {
  if (command === 'cleanup') return cleanupT21RC2TFiles(options.env ?? process.env, options.cwd ?? process.cwd());
  if (command !== 'capture') throw t21rc2tError('T21RC2T_QUERY_REJECTED');
  return captureT21RC2TProduction(options);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.umask(0o077);
  try {
    if (process.argv.length !== 3 || !['capture', 'cleanup'].includes(process.argv[2])) {
      throw t21rc2tError('T21RC2T_QUERY_REJECTED');
    }
    await runT21RC2TProductionCaptureCommand(process.argv[2]);
    console.log('t21rc2t=capture-step-complete');
  } catch (error) {
    console.error(`t21rc2t=${safeT21RC2TError(error)}`);
    process.exitCode = 1;
  }
}
