#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { T21RC2T_HISTOGRAM_BUCKETS, aggregateIdentityTopology, assertTopologyAccounting, assertForensicTopologyContract } from './t21rc2t-identity-topology.mjs';
import { loadTopologyAuthorities } from './t21rc2t-source-authority.mjs';
import { requireStoredT21RC2TAuthorization } from './t21rc2t-production-approval.mjs';
import { readT21RC2TCapture, readT21RC2TPublicReceipt, writeT21RC2TPublicReceipt, runnerPaths, safeT21RC2TError, t21rc2tError } from './t21rc2t-production-files.mjs';

const SUPPRESSED = 'SUPPRESSED';
let schemaValidator;

function reject(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function publicData(value, depth = 0) {
  if (depth > 12) reject('T21RC2T_RECEIPT_SCHEMA_REJECTED');
  if (value === null || ['string', 'boolean'].includes(typeof value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) reject('T21RC2T_RECEIPT_SCHEMA_REJECTED');
  const result = {};
  for (const field of Reflect.ownKeys(value).sort()) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (typeof field !== 'string' || !Object.hasOwn(descriptor, 'value') || field === '__proto__') reject('T21RC2T_RECEIPT_SCHEMA_REJECTED');
    result[field] = publicData(descriptor.value, depth + 1);
  }
  return result;
}

function serialize(value) {
  return `${JSON.stringify(publicData(value))}\n`;
}

function suppressPartition(counts) {
  const keys = Object.keys(counts), values = Object.values(counts);
  const total = values.reduce((a, b) => a + b, 0);
  const hidden = values.some((n) => n > 0 && n < 5);
  const safeTotal = total > 0 && total < 5 ? SUPPRESSED : total;
  return {
    buckets: Object.fromEntries(keys.map((name) => [name, hidden ? SUPPRESSED : counts[name]])),
    total: safeTotal,
    suppressedBucketCount: hidden ? keys.length : 0,
    suppressedOccurrenceTotal: hidden ? safeTotal : 0,
  };
}

export function validatePublicReceiptSchema(receipt) {
  try {
    const safe = publicData(receipt);
    if (!schemaValidator) {
      const require = createRequire(import.meta.url);
      const Ajv = createRequire(require.resolve('eslint/package.json'))('ajv');
      const schema = JSON.parse(readFileSync(new URL('../docs/ai/recipe-catalog/T21RC2T_IDENTITY_TOPOLOGY_RECEIPT_SCHEMA.json', import.meta.url), 'utf8'));
      schemaValidator = new Ajv({ allErrors: false, jsonPointers: true }).compile(schema);
    }
    if (!schemaValidator(safe)) reject('T21RC2T_RECEIPT_SCHEMA_REJECTED');
    for (const [name, keys] of Object.entries(T21RC2T_HISTOGRAM_BUCKETS)) {
      const histogram = safe.histograms[name], values = Object.values(histogram.buckets);
      if (histogram.suppressedBucketCount === 0) {
        if (values.includes(SUPPRESSED) || histogram.suppressedOccurrenceTotal !== 0
            || histogram.total !== values.reduce((a, b) => a + b, 0)) reject('T21RC2T_RECEIPT_SCHEMA_REJECTED');
      } else if (histogram.suppressedBucketCount !== keys.length || values.some((n) => n !== SUPPRESSED)
          || histogram.suppressedOccurrenceTotal !== histogram.total) reject('T21RC2T_RECEIPT_SCHEMA_REJECTED');
    }
    return true;
  } catch { reject('T21RC2T_RECEIPT_SCHEMA_REJECTED'); }
}

export function createPublicReceipt(raw, { stability = 'OFFLINE_ONLY' } = {}) {
  assertTopologyAccounting(raw);
  try {
    const p = raw.populations;
    const receipt = {
      schemaVersion: 1, diagnostic: 'T21RC2T', scope: 'AGGREGATE_ONLY', stability,
      suppression: 'WHOLE_PARTITION_K5', accounting: 'PRIVATE_RECOMPUTATION_REQUIRED',
      queryPathSelectOnly: true, tokenScopeReadOnlyProven: false,
      dataCorruption: 'NOT_PROVEN', repair: 'REPAIR_NEEDS_MORE_EVIDENCE',
      migration0039: 'NOT_AUTHORIZED', deploy: 'NOT_AUTHORIZED', t21g: 'NOT_READY',
      populations: { recipeCount: p.recipeCount, productionOccurrenceCount: p.productionOccurrenceCount,
        targetOccurrenceCount: p.targetOccurrenceCount, v2OccurrenceCount: p.v2OccurrenceCount },
      histograms: Object.fromEntries(Object.entries(T21RC2T_HISTOGRAM_BUCKETS).map(([name]) => [name, suppressPartition(raw.histograms[name])])),
      distributions: Object.fromEntries(['productionMinusV1', 'productionMinusV2', 'v2MinusV1'].map((name) => {
        const stats = raw.distributions[name];
        return [name, Object.fromEntries(['min', 'max', 'median', 'p90', 'p95', 'p99'].map((field) => [field, stats[field]]))];
      })),
    };
    validatePublicReceiptSchema(receipt);
    return receipt;
  } catch { reject('T21RC2T_RECEIPT_SCHEMA_REJECTED'); }
}

export function serializePublicReceipt(receipt) {
  try {
    validatePublicReceiptSchema(receipt);
    return serialize(receipt);
  } catch { reject('T21RC2T_RECEIPT_SCHEMA_REJECTED'); }
}

export function validatePublicReceipt(receipt, raw, { stability = 'OFFLINE_ONLY', requireForensic = false } = {}) {
  validatePublicReceiptSchema(receipt);
  assertTopologyAccounting(raw);
  if (requireForensic) assertForensicTopologyContract(raw);
  try {
    if (serialize(receipt) !== serialize(createPublicReceipt(raw, { stability }))) reject('T21RC2T_ACCOUNTING_REJECTED');
    return true;
  } catch { reject('T21RC2T_ACCOUNTING_REJECTED'); }
}

export async function runT21RC2TReceiptCommand(command, {
  env = process.env, cwd = process.cwd(), loadAuthority = loadTopologyAuthorities,
  readCapture = readT21RC2TCapture, readReceipt = readT21RC2TPublicReceipt,
  writeReceipt = writeT21RC2TPublicReceipt, verifyForensic = assertForensicTopologyContract,
} = {}) {
  try {
    if (!['aggregate', 'validate'].includes(command) || env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_ACCOUNT_ID) throw t21rc2tError('T21RC2T_QUERY_REJECTED');
    const observed = readCapture({ env, cwd, requireFinalAuthorization: command === 'validate' });
    requireStoredT21RC2TAuthorization(observed.authorization, env);
    const authority = await loadAuthority(cwd);
    const proof = authority.authorityProof, capturedProof = observed.capture.authorityProof;
    if (Object.keys(proof).sort().join(',') !== Object.keys(capturedProof).sort().join(',')
        || Object.keys(proof).some((field) => proof[field] !== capturedProof[field])
        || JSON.stringify([...observed.input.recipeIds].sort()) !== JSON.stringify([...authority.recipeIds].sort())) throw t21rc2tError('T21RC2T_CAPTURE_REJECTED');
    const raw = aggregateIdentityTopology({ recipeIds: observed.input.recipeIds, productionRows: observed.input.occurrences,
      targetRecipes: authority.targetRecipes, v2Recipes: authority.v2Recipes,
      canonicalIngredientIds: authority.canonicalIngredientIds, reconciliation: authority.reconciliation }, authority);
    verifyForensic(raw);
    const stability = 'OBSERVED_STABLE_NON_ATOMIC';
    if (command === 'aggregate') {
      const receipt = createPublicReceipt(raw, { stability });
      writeReceipt(JSON.parse(serializePublicReceipt(receipt)), env, cwd);
    } else {
      const receipt = readReceipt(env, cwd);
      validatePublicReceipt(receipt, raw, { stability });
      if (readFileSync(runnerPaths(env, cwd).publicReceipt, 'utf8') !== serializePublicReceipt(receipt)) throw t21rc2tError('T21RC2T_ACCOUNTING_REJECTED');
    }
    return true;
  } catch (error) { throw t21rc2tError(safeT21RC2TError(error)); }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 3) throw t21rc2tError('T21RC2T_QUERY_REJECTED');
    await runT21RC2TReceiptCommand(process.argv[2]);
  } catch (error) {
    process.stderr.write(`${safeT21RC2TError(error)}\n`);
    process.exitCode = 1;
  }
}
