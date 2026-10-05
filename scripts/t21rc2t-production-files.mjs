import {
  constants,
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  lstatSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const T21RC2T_ERROR_CODES = Object.freeze([
  'T21RC2T_GATE_REJECTED',
  'T21RC2T_REVIEW_BINDING_REJECTED',
  'T21RC2T_APPROVAL_REJECTED',
  'T21RC2T_IDENTITY_REJECTED',
  'T21RC2T_QUERY_REJECTED',
  'T21RC2T_QUERY_FAILED',
  'T21RC2T_CAPTURE_REJECTED',
  'T21RC2T_LEDGER_CHANGED',
  'T21RC2T_RECIPE_ROSTER_CHANGED',
  'T21RC2T_SNAPSHOT_UNSTABLE',
  'T21RC2T_TOPOLOGY_REJECTED',
  'T21RC2T_RECEIPT_SCHEMA_REJECTED',
  'T21RC2T_ACCOUNTING_REJECTED',
  'T21RC2T_RECHECK_REJECTED',
  'T21RC2T_PRIVATE_PATH_REJECTED',
]);

export const T21RC2T_PRIVATE_FILES = Object.freeze([
  'authorization.json',
  'authorization-final.json',
  'capture-a.json',
  'capture-b.json',
  'capture-observations.json',
  'capture-verified.json',
  'classifier-input.json',
]);

export const T21RC2T_PRIVATE_DIRECTORY = 't21rc2t-private';
export const T21RC2T_PUBLIC_DIRECTORY = 't21rc2t-public';
export const T21RC2T_PUBLIC_FILENAME = 't21rc2t-public-receipt.json';
const PRIVATE_FILE_SET = new Set(T21RC2T_PRIVATE_FILES);
const DEFAULT_ERROR = 'T21RC2T_CAPTURE_REJECTED';
const SHA256 = /^[a-f0-9]{64}$/;
const AUTHORIZATION_FIELDS = Object.freeze([
  'schemaVersion', 'repositoryId', 'repository', 'workflowPath', 'mainSha', 'reviewedSha',
  'runId', 'runAttempt', 'actor', 'triggeringActor', 'ci', 'approval',
]);
const CAPTURE_FIELDS = Object.freeze([
  'schemaVersion', 'status', 'database', 'ledger', 'counts', 'authorityProof',
  'authorizationSha256', 'snapshotDigestSha256',
]);
const INPUT_FIELDS = Object.freeze(['captureCounts', 'occurrences', 'recipeIds']);
const ROW_FIELDS = Object.freeze([
  'id', 'recipe_id', 'ingredient_id', 'name', 'required_quantity', 'unit', 'is_optional',
]);

export function t21rc2tError(code) {
  const safeCode = T21RC2T_ERROR_CODES.includes(code) ? code : DEFAULT_ERROR;
  const error = new Error(safeCode);
  error.code = safeCode;
  return error;
}

export function safeT21RC2TError(error) {
  try {
    const code = error?.code;
    return T21RC2T_ERROR_CODES.includes(code) ? code : DEFAULT_ERROR;
  } catch {
    return DEFAULT_ERROR;
  }
}

function fail(condition, code = 'T21RC2T_CAPTURE_REJECTED') {
  if (!condition) throw t21rc2tError(code);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, keys) {
  return isRecord(value) && Object.keys(value).sort().join('\0') === [...keys].sort().join('\0');
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function digest(value) {
  return createHash('sha256').update(stable(value)).digest('hex');
}

function privateRoot(env = process.env, cwd = process.cwd()) {
  try {
    fail(typeof env.RUNNER_TEMP === 'string' && path.isAbsolute(env.RUNNER_TEMP), 'T21RC2T_PRIVATE_PATH_REJECTED');
    const temp = realpathSync(env.RUNNER_TEMP);
    const workspace = realpathSync(cwd);
    const relative = path.relative(workspace, temp);
    const isInsideWorkspace = relative === '' || (relative !== '..'
      && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
    fail(!isInsideWorkspace, 'T21RC2T_PRIVATE_PATH_REJECTED');
    return temp;
  } catch {
    throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  }
}

export function runnerPaths(env = process.env, cwd = process.cwd()) {
  const temp = privateRoot(env, cwd);
  return {
    privateDirectory: path.join(temp, T21RC2T_PRIVATE_DIRECTORY),
    publicDirectory: path.join(temp, T21RC2T_PUBLIC_DIRECTORY),
    publicReceipt: path.join(temp, T21RC2T_PUBLIC_DIRECTORY, T21RC2T_PUBLIC_FILENAME),
  };
}

function ensureDirectory(directory) {
  try {
    mkdirSync(directory, { mode: 0o700 });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  }
  try {
    const stat = lstatSync(directory);
    fail(stat.isDirectory() && !stat.isSymbolicLink() && (stat.mode & 0o077) === 0,
      'T21RC2T_PRIVATE_PATH_REJECTED');
  } catch {
    throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  }
  return directory;
}

export function privateDirectory(env = process.env, cwd = process.cwd()) {
  return ensureDirectory(runnerPaths(env, cwd).privateDirectory);
}

export function publicDirectory(env = process.env, cwd = process.cwd()) {
  return ensureDirectory(runnerPaths(env, cwd).publicDirectory);
}

function writeExclusive(file, value) {
  let descriptor;
  try {
    const serialized = JSON.stringify(value);
    fail(typeof serialized === 'string', 'T21RC2T_PRIVATE_PATH_REJECTED');
    descriptor = openSync(file, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    writeFileSync(descriptor, `${serialized}\n`);
  } catch {
    throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  } finally {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
      }
    }
  }
}

export function writeT21RC2TPrivateJson(name, value, env = process.env, cwd = process.cwd()) {
  if (!PRIVATE_FILE_SET.has(name)) throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  writeExclusive(path.join(privateDirectory(env, cwd), name), value);
}

export function readT21RC2TPrivateJson(name, env = process.env, cwd = process.cwd()) {
  if (!PRIVATE_FILE_SET.has(name)) throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  try {
    const file = path.join(privateDirectory(env, cwd), name);
    const stat = lstatSync(file);
    fail(stat.isFile() && !stat.isSymbolicLink() && (stat.mode & 0o077) === 0,
      'T21RC2T_PRIVATE_PATH_REJECTED');
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  }
}

export function writeT21RC2TPublicReceipt(receipt, env = process.env, cwd = process.cwd()) {
  publicDirectory(env, cwd);
  const file = runnerPaths(env, cwd).publicReceipt;
  writeExclusive(file, receipt);
  return file;
}

export function readT21RC2TPublicReceipt(env = process.env, cwd = process.cwd()) {
  try {
    const file = runnerPaths(env, cwd).publicReceipt;
    const stat = lstatSync(file);
    fail(stat.isFile() && !stat.isSymbolicLink() && (stat.mode & 0o077) === 0,
      'T21RC2T_PRIVATE_PATH_REJECTED');
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
  }
}

function normalizeAuthorization(authorization) {
  fail(exactKeys(authorization, AUTHORIZATION_FIELDS));
  fail(authorization.schemaVersion === 1 && authorization.repositoryId === 1385308553
    && authorization.repository === 'vn-tak/Tako-san'
    && authorization.workflowPath === '.github/workflows/production-d1-t21rc2t-identity-topology.yml');
  fail(/^[a-f0-9]{40}$/.test(authorization.mainSha ?? '')
    && /^[a-f0-9]{40}$/.test(authorization.reviewedSha ?? '')
    && authorization.mainSha !== authorization.reviewedSha);
  fail(typeof authorization.runId === 'string' && /^[1-9][0-9]*$/.test(authorization.runId)
    && authorization.runAttempt === '1' && authorization.actor === 'vn-tak'
    && authorization.triggeringActor === 'vn-tak');
  fail(exactKeys(authorization.ci, ['id', 'attempt', 'headSha'])
    && Number.isSafeInteger(authorization.ci.id) && authorization.ci.id > 0
    && Number.isSafeInteger(authorization.ci.attempt) && authorization.ci.attempt > 0
    && authorization.ci.headSha === authorization.mainSha);
  fail(exactKeys(authorization.approval, [
    'environment', 'state', 'reviewer', 'actor', 'triggeringActor', 'historySha256', 'policySha256',
  ]) && authorization.approval.environment === 'production'
    && authorization.approval.state === 'approved'
    && authorization.approval.reviewer === 'vn-taphoanhatung'
    && authorization.approval.actor === authorization.actor
    && authorization.approval.triggeringActor === authorization.triggeringActor
    && authorization.approval.reviewer !== authorization.actor
    && authorization.approval.reviewer !== authorization.triggeringActor
    && SHA256.test(authorization.approval.historySha256)
    && SHA256.test(authorization.approval.policySha256));
  return authorization;
}

export function validateCaptureBinding({ input, capture, authorization, finalAuthorization, requireFinalAuthorization = false } = {}) {
  try {
    normalizeAuthorization(authorization);
    fail(exactKeys(input, INPUT_FIELDS) && Array.isArray(input.recipeIds)
      && Array.isArray(input.occurrences) && exactKeys(input.captureCounts, ['recipeCount', 'ingredientOccurrenceCount']));
    fail(exactKeys(capture, CAPTURE_FIELDS) && capture.schemaVersion === 1
      && capture.status === 'OBSERVED_STABLE_NON_ATOMIC');
    fail(exactKeys(capture.database, ['name', 'id', 'accountVerified'])
      && capture.database.name === 'frigo-db' && capture.database.id === 'f975ec39-b2c8-4a2a-80e1-0366054599d3'
      && capture.database.accountVerified === true);
    fail(exactKeys(capture.ledger, ['count', 'tip', 'namesSha256'])
      && capture.ledger.count === 38
      && capture.ledger.tip === '0038_auth_onboarding_completion.sql'
      && SHA256.test(capture.ledger.namesSha256));
    fail(exactKeys(capture.counts, ['recipeCount', 'ingredientOccurrenceCount'])
      && Number.isSafeInteger(capture.counts.recipeCount) && capture.counts.recipeCount >= 0
      && Number.isSafeInteger(capture.counts.ingredientOccurrenceCount) && capture.counts.ingredientOccurrenceCount >= 0);
    fail(exactKeys(capture.authorityProof, [
      'canonicalTargetSha256', 'releaseManifestSha256', 'approvedBatchesSha256',
      'canonicalRegistrySourceSha256', 'reconciliationSha256', 'releaseId',
      'runtimeFingerprint', 'reviewedBridgeCount',
    ]));
    for (const name of [
      'canonicalTargetSha256', 'releaseManifestSha256', 'approvedBatchesSha256',
      'canonicalRegistrySourceSha256', 'reconciliationSha256', 'runtimeFingerprint',
    ]) fail(SHA256.test(capture.authorityProof[name]));
    fail(typeof capture.authorityProof.releaseId === 'string'
      && Number.isSafeInteger(capture.authorityProof.reviewedBridgeCount)
      && capture.authorityProof.reviewedBridgeCount >= 0);
    fail(input.recipeIds.every((id) => typeof id === 'string')
      && new Set(input.recipeIds).size === input.recipeIds.length);
    fail(input.occurrences.every((row) => exactKeys(row, ROW_FIELDS)
      && Object.values(row).every((value) => value === null
        || ['string', 'number', 'boolean'].includes(typeof value))
      && Object.values(row).every((value) => typeof value !== 'number' || Number.isFinite(value))));
    fail(input.captureCounts.recipeCount === input.recipeIds.length
      && input.captureCounts.ingredientOccurrenceCount === input.occurrences.length
      && stable(input.captureCounts) === stable(capture.counts));
    fail(capture.authorizationSha256 === digest(authorization)
      && SHA256.test(capture.authorizationSha256)
      && capture.snapshotDigestSha256 === digest(input)
      && SHA256.test(capture.snapshotDigestSha256));

    if (requireFinalAuthorization) {
      try {
        fail(finalAuthorization !== undefined, 'T21RC2T_RECHECK_REJECTED');
        normalizeAuthorization(finalAuthorization);
        fail(stable(finalAuthorization) === stable(authorization), 'T21RC2T_RECHECK_REJECTED');
      } catch {
        throw t21rc2tError('T21RC2T_RECHECK_REJECTED');
      }
    } else if (finalAuthorization !== undefined) {
      normalizeAuthorization(finalAuthorization);
      fail(stable(finalAuthorization) === stable(authorization), 'T21RC2T_RECHECK_REJECTED');
    }
    return true;
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_RECHECK_REJECTED') throw t21rc2tError('T21RC2T_RECHECK_REJECTED');
    throw t21rc2tError('T21RC2T_CAPTURE_REJECTED');
  }
}

export function readT21RC2TCapture({ env = process.env, cwd = process.cwd(), requireFinalAuthorization = false } = {}) {
  try {
    const input = readT21RC2TPrivateJson('classifier-input.json', env, cwd);
    const capture = readT21RC2TPrivateJson('capture-verified.json', env, cwd);
    const authorization = readT21RC2TPrivateJson('authorization.json', env, cwd);
    let finalAuthorization;
    if (requireFinalAuthorization) {
      try {
        finalAuthorization = readT21RC2TPrivateJson('authorization-final.json', env, cwd);
      } catch {
        throw t21rc2tError('T21RC2T_RECHECK_REJECTED');
      }
    }
    validateCaptureBinding({ input, capture, authorization, finalAuthorization, requireFinalAuthorization });
    return { input, capture, authorization, ...(finalAuthorization ? { finalAuthorization } : {}) };
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_RECHECK_REJECTED') throw t21rc2tError('T21RC2T_RECHECK_REJECTED');
    throw t21rc2tError('T21RC2T_CAPTURE_REJECTED');
  }
}

export function cleanupT21RC2TFiles(env = process.env, cwd = process.cwd()) {
  const paths = runnerPaths(env, cwd);
  for (const directory of [paths.privateDirectory, paths.publicDirectory]) {
    try {
      const stat = lstatSync(directory);
      if (stat.isSymbolicLink()) {
        rmSync(directory, { force: true });
      } else {
        fail(stat.isDirectory(), 'T21RC2T_PRIVATE_PATH_REJECTED');
        rmSync(directory, { recursive: true, force: true });
      }
    } catch (error) {
      if (safeT21RC2TError(error) === 'T21RC2T_PRIVATE_PATH_REJECTED') throw error;
      let code;
      try {
        code = error?.code;
      } catch {
        throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
      }
      if (code !== 'ENOENT') throw t21rc2tError('T21RC2T_PRIVATE_PATH_REJECTED');
    }
  }
}
