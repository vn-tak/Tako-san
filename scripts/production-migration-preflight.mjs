import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { captureRecipeMedia } from './production-media-preservation.mjs';
import {
  APPROVED_BATCHES_REGISTRY,
  CATALOG_RELEASE_MANIFEST,
  PRODUCTION_D1,
  classifyPreLedger,
  loadRuntimeCatalogPipeline,
  verifyCatalogAtTip,
  verifyRuntimeCatalogContent,
} from './d1-migration-check.mjs';

const PRE_TIP = '0038_auth_onboarding_completion.sql';
const MIGRATION = '0039_meal_composition_v2.sql';
const SHA = /^[a-f0-9]{40}$/;
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

/** 0039 adds composition tables; it must never mutate an already unverified catalog. */
export async function verifyProductionMigrationPreflight({
  manifest,
  ledger,
  catalog,
  runtimeCatalog,
  media,
  mediaSchema,
  pipeline,
  release = readJson(CATALOG_RELEASE_MANIFEST),
  registry = readJson(APPROVED_BATCHES_REGISTRY),
} = {}) {
  if (!SHA.test(manifest?.sha || '') || manifest.mainSha !== manifest.sha ||
      manifest.database?.name !== PRODUCTION_D1.name || manifest.database?.id !== PRODUCTION_D1.id ||
      manifest.cloudflare?.databaseName !== PRODUCTION_D1.name || manifest.cloudflare?.databaseId !== PRODUCTION_D1.id ||
      manifest.migration !== MIGRATION || manifest.expectedPreTip !== PRE_TIP ||
      JSON.stringify(manifest.chain) !== JSON.stringify([MIGRATION])) {
    throw new Error('Production 0039 preflight requires exact-main identity and the single reviewed migration');
  }
  const currentLedger = classifyPreLedger(manifest, ledger);
  if (!manifest.preLedger ||
      JSON.stringify(currentLedger) !== JSON.stringify(manifest.preLedger)) {
    throw new Error('Production migration ledger changed during catalog preflight');
  }
  const catalogProof = verifyCatalogAtTip(release, currentLedger.tip, catalog, registry);
  const mediaCapture = captureRecipeMedia({ catalog, media, schema: mediaSchema, pipeline });
  const runtimeProof = await verifyRuntimeCatalogContent({
    release, registry, tip: currentLedger.tip, statements: runtimeCatalog, pipeline,
  });
  if (!catalogProof.releaseComplete || !runtimeProof.releaseComplete) {
    throw new Error('Production 0039 preflight requires the complete reviewed catalog');
  }
  return {
    status: 'PASS',
    readOnly: true,
    tip: currentLedger.tip,
    releaseId: runtimeProof.releaseId,
    recipeCount: runtimeProof.actualRecipes,
    hydrationFailureCount: runtimeProof.hydrationFailureCount,
    runtimeFingerprint: runtimeProof.runtimeFingerprint,
    recipeMedia: catalogProof.recipeMedia,
    mediaCapture,
    checkedAt: runtimeProof.checkedAt,
  };
}

async function main() {
  const [manifestFile, ledgerFile, catalogFile, runtimeFile, mediaFile, mediaSchemaFile] = process.argv.slice(2);
  if (process.argv.length !== 8) throw new Error('Expected manifest, ledger, catalog, runtime catalog, media and media schema');
  const manifest = readJson(manifestFile);
  const pipeline = await loadRuntimeCatalogPipeline();
  try {
    manifest.preMigrationCatalog = await verifyProductionMigrationPreflight({
      manifest,
      ledger: readJson(ledgerFile),
      catalog: readJson(catalogFile),
      runtimeCatalog: readJson(runtimeFile),
      media: readJson(mediaFile),
      mediaSchema: readJson(mediaSchemaFile),
      pipeline,
    });
    manifest.preMigrationMedia = manifest.preMigrationCatalog.mediaCapture;
    writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Production catalog verified before 0039: ${manifest.preMigrationCatalog.recipeCount} recipes`);
  } finally {
    await pipeline.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error('Production 0039 catalog preflight failed; migration must not proceed');
    process.exitCode = 1;
  });
}
