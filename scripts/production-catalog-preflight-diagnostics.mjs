import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  APPROVED_BATCHES_REGISTRY,
  CATALOG_RELEASE_MANIFEST,
  PRODUCTION_D1,
  classifyPreLedger,
  loadRuntimeCatalogPipeline,
  verifyCatalogAtTip,
  verifyRuntimeCatalogContent,
} from './d1-migration-check.mjs';
import { migrationManifest } from './release-check.mjs';

const PRE_TIP = '0038_auth_onboarding_completion.sql';
const MIGRATION = '0039_meal_composition_v2.sql';
const SHA = /^[a-f0-9]{40}$/;
const AGGREGATES = [
  'recipes', 'duplicate_recipe_ids', 'duplicate_slugs', 'runtime_fields',
  'order_min', 'order_max', 'order_distinct', 'recipes_without_runtime_fields',
  'recipes_without_ingredients', 'recipes_without_steps', 'ingredients_without_order',
  'media_ready', 'recipes_without_pending_hero', 'media_total',
  'recipes_without_active_hero', 'media_orphan_rows', 'media_duplicate_ready_roles',
  'media_invalid_metadata', 'media_invalid_ready_metadata',
];
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const capturedJson = (file) => {
  try { return readJson(file); } catch { return undefined; }
};

function rows(value, count) {
  if (!Array.isArray(value) || value.length !== count ||
      value.some((statement) => statement?.success !== true || !Array.isArray(statement.results))) return null;
  return value.map((statement) => statement.results);
}

function aggregateCounts(catalogRows) {
  if (!catalogRows || catalogRows[0].length !== 1) return null;
  const row = catalogRows[0][0];
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
  if (AGGREGATES.some((key) => {
    const orderBound = key === 'order_min' || key === 'order_max';
    return !(orderBound && row[key] === null) &&
      (!Number.isSafeInteger(row[key]) || (!orderBound && row[key] < 0));
  })) return null;
  return Object.fromEntries(AGGREGATES.map((key) => [key, row[key]]));
}

function runtimeReason(error) {
  const message = error instanceof Error ? error.message : '';
  for (const [prefix, code] of [
    ['Runtime catalog hydration failed', 'HYDRATION_REJECTED'],
    ['Runtime catalog content mapping failed', 'CONTENT_MAPPING_REJECTED'],
    ['Runtime catalog recipe count', 'RECIPE_COUNT_MISMATCH'],
    ['Runtime catalog IDs/order drift', 'RECIPE_IDS_OR_ORDER_MISMATCH'],
    ['Runtime catalog fingerprint failed', 'FINGERPRINT_FAILED'],
    ['Runtime catalog content fingerprint drift', 'FINGERPRINT_MISMATCH'],
  ]) {
    if (message.startsWith(prefix)) return code;
  }
  return 'RUNTIME_PROOF_REJECTED';
}

/** Diagnose the unchanged migration checks; never copy raw rows or exception text into receipts. */
export async function inspectProductionCatalogPreflight({
  manifest, ledgerBefore, ledgerAfter, catalogFirst, catalogRepeat, runtimeFirst,
  runtimeRepeat, pipeline, cwd = process.cwd(),
  release = readJson(CATALOG_RELEASE_MANIFEST), registry = readJson(APPROVED_BATCHES_REGISTRY),
}) {
  if (!SHA.test(manifest?.sha || '') || manifest.mainSha !== manifest.sha ||
      manifest.requestedRef !== manifest.sha || manifest.ci?.headSha !== manifest.sha ||
      manifest.repository?.toLowerCase() !== 'vn-tak/tako-san' || manifest.environment !== 'production' ||
      manifest.cloudflare?.databaseName !== PRODUCTION_D1.name || manifest.cloudflare?.databaseId !== PRODUCTION_D1.id ||
      JSON.stringify(manifest.schema) !== JSON.stringify(migrationManifest(cwd, manifest.sha))) {
    throw new Error('Exact-main production catalog diagnostic identity is incomplete');
  }
  if (manifest.schema.count !== 39 || manifest.schema.version !== MIGRATION ||
      manifest.schema.migrations[37]?.name !== PRE_TIP) {
    throw new Error('Production catalog diagnosis requires the reviewed 0038 prefix');
  }
  const checks = Object.fromEntries([
    'catalogCapture', 'runtimeCapture', 'ledger', 'catalogStable', 'runtimeStable', 'catalog', 'runtime',
  ].map((name) => [name, 'NOT_EVALUATED']));
  const receipt = {
    schemaVersion: 1, status: 'CATALOG_PREFLIGHT_DIAGNOSTIC_BLOCKED',
    certification: 'NOT_A_RELEASE_CERTIFICATION', readOnly: true, productionMutations: [],
    captureConsistency: 'STABILITY_NOT_PROVEN', repository: 'vn-tak/Tako-san',
    candidateSha: manifest.sha, database: PRODUCTION_D1, checkedAt: new Date().toISOString(),
    checks, catalogAggregates: null, catalogProof: null, runtimeProof: null,
    reasons: { catalog: null, runtime: null },
  };
  const firstCatalogRows = rows(catalogFirst, 2), repeatCatalogRows = rows(catalogRepeat, 2);
  const firstRuntimeRows = rows(runtimeFirst, 5), repeatRuntimeRows = rows(runtimeRepeat, 5);
  checks.catalogCapture = firstCatalogRows && repeatCatalogRows &&
    firstCatalogRows[0].length === 1 && repeatCatalogRows[0].length === 1 ? 'PASS' : 'REJECTED';
  checks.runtimeCapture = firstRuntimeRows && repeatRuntimeRows ? 'PASS' : 'REJECTED';
  receipt.catalogAggregates = aggregateCounts(repeatCatalogRows);
  try {
    const candidate = { ...manifest, chain: [MIGRATION] };
    const before = classifyPreLedger(candidate, ledgerBefore), after = classifyPreLedger(candidate, ledgerAfter);
    if (before.count !== 38 || before.tip !== PRE_TIP || JSON.stringify(before) !== JSON.stringify(after)) {
      throw new Error('Ledger changed or is not the reviewed prefix');
    }
    checks.ledger = 'PASS';
    receipt.ledger = { count: before.count, tip: before.tip };
  } catch {
    checks.ledger = 'REJECTED';
  }
  for (const [name, first, repeat, capture] of [
    ['catalogStable', firstCatalogRows, repeatCatalogRows, checks.catalogCapture],
    ['runtimeStable', firstRuntimeRows, repeatRuntimeRows, checks.runtimeCapture],
  ]) {
    if (capture === 'PASS') checks[name] = JSON.stringify(first) === JSON.stringify(repeat) ? 'PASS' : 'REJECTED';
  }
  if (checks.ledger === 'PASS' && checks.catalogStable === 'PASS' && checks.runtimeStable === 'PASS') {
    receipt.captureConsistency = 'OBSERVED_STABLE_NON_ATOMIC';
  }
  if (checks.ledger === 'PASS' && checks.catalogStable === 'PASS') {
    try {
      if (!receipt.catalogAggregates) throw new Error('Malformed catalog aggregate evidence');
      const proof = verifyCatalogAtTip(release, PRE_TIP, catalogRepeat, registry);
      if (!proof.releaseComplete) throw new Error('Reviewed catalog release is incomplete');
      checks.catalog = 'PASS';
      receipt.catalogProof = { recipeCount: proof.actualRecipes, orderedRecipeIdsSha256: proof.orderedRecipeIdsSha256 };
    } catch {
      checks.catalog = 'REJECTED';
      receipt.reasons.catalog = receipt.catalogAggregates ? 'CATALOG_PROOF_REJECTED' : 'MALFORMED_AGGREGATE_EVIDENCE';
    }
  }
  if (checks.ledger === 'PASS' && checks.runtimeStable === 'PASS') {
    try {
      const proof = await verifyRuntimeCatalogContent({ release, registry, tip: PRE_TIP, statements: runtimeRepeat, pipeline, cwd });
      checks.runtime = 'PASS';
      receipt.runtimeProof = {
        recipeCount: proof.actualRecipes, hydrationFailureCount: proof.hydrationFailureCount,
        runtimeFingerprint: proof.runtimeFingerprint,
      };
    } catch (error) {
      checks.runtime = 'REJECTED';
      receipt.reasons.runtime = runtimeReason(error);
    }
  }
  if (Object.values(checks).every((result) => result === 'PASS')) receipt.status = 'CATALOG_PREFLIGHT_DIAGNOSTIC_PASS';
  return receipt;
}

async function main() {
  const [manifestFile, beforeFile, afterFile, catalogFirstFile, catalogRepeatFile, runtimeFirstFile, runtimeRepeatFile, receiptFile] = process.argv.slice(2);
  if (process.argv.length !== 10) throw new Error('Expected manifest, ledger pair, catalog pair, runtime pair and receipt');
  const pipeline = await loadRuntimeCatalogPipeline();
  try {
    const receipt = await inspectProductionCatalogPreflight({
      manifest: readJson(manifestFile), ledgerBefore: capturedJson(beforeFile), ledgerAfter: capturedJson(afterFile),
      catalogFirst: capturedJson(catalogFirstFile), catalogRepeat: capturedJson(catalogRepeatFile),
      runtimeFirst: capturedJson(runtimeFirstFile), runtimeRepeat: capturedJson(runtimeRepeatFile), pipeline,
    });
    writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(`Production catalog preflight diagnosis: ${receipt.status}; ${JSON.stringify(receipt.checks)}`);
    if (receipt.status !== 'CATALOG_PREFLIGHT_DIAGNOSTIC_PASS') process.exitCode = 1;
  } finally {
    await pipeline.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error('Production catalog preflight diagnosis could not produce complete sanitized evidence');
    process.exitCode = 1;
  });
}
