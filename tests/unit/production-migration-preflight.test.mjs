import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeMediaRow } from '../../packages/db/src/recipe-media';
import { auditReadyRecipeMediaRecord, isCanonicalRecipeIdShape, isRecipeMediaMimeType,
  isSha256Hex, isTrustedRecipeMediaStorageKey } from '../../packages/recipes/src/recipe-media';
import { mapRecipeContentRead, prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { hydrateRuntimeRecipes } from '../../packages/recipes/src/runtime-hydration';
import { fingerprintRecipes } from '../../packages/recipes/src/catalog-fingerprint';
import {
  PRODUCTION_D1,
  catalogQuery,
  classifyPreLedger,
} from '../../scripts/d1-migration-check.mjs';
import { verifyProductionMigrationPreflight } from '../../scripts/production-migration-preflight.mjs';
import { recipeMediaQuery, recipeMediaSchemaQuery } from '../../scripts/production-media-preservation.mjs';
import { migrationManifest } from '../../scripts/release-check.mjs';

const require = createRequire(import.meta.url);
const { load } = createRequire(require.resolve('eslint/package.json'))('js-yaml');
const workflow = load(readFileSync('.github/workflows/production-d1-migrate.yml', 'utf8'));
const tip = '0038_auth_onboarding_completion.sql';
const migration = '0039_meal_composition_v2.sql';
const sha = 'a'.repeat(40);
const schema = migrationManifest(process.cwd(), execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim());
const ok = (results) => ({ success: true, results });
const ledger = (names) => [ok(names.map((name) => ({ name })))];
const pipeline = { mapRecipeContentRead, hydrateRuntimeRecipes, fingerprintRecipes, mapRecipeMediaRow, auditReadyRecipeMediaRecord, isCanonicalRecipeIdShape, isRecipeMediaMimeType, isSha256Hex, isTrustedRecipeMediaStorageKey };
let db;
let manifest;

async function evidence(overrides = {}) {
  return {
    manifest,
    ledger: ledger(db.migrations),
    catalog: catalogQuery().split(';').map((sql) => ok(db.query(sql))),
    runtimeCatalog: await db.batch(prepareRecipeContentRead(db)),
    media: [ok(db.query(recipeMediaQuery()))],
    mediaSchema: [ok(db.query(recipeMediaSchemaQuery()))],
    pipeline,
    ...overrides,
  };
}

beforeEach(() => {
  db = new SqliteD1({ through: tip });
  manifest = {
    sha, mainSha: sha, database: PRODUCTION_D1,
    cloudflare: { databaseName: PRODUCTION_D1.name, databaseId: PRODUCTION_D1.id },
    migration, expectedPreTip: tip, chain: [migration], schema,
  };
  manifest.preLedger = classifyPreLedger(manifest, ledger(db.migrations));
});
afterEach(() => db.close());

describe('production 0039 migration preflight', () => {
  it('certifies the real V1 catalog at 0038 without applying 0039 or changing data', async () => {
    const changes = db.query('SELECT total_changes() AS count')[0].count;
    const proof = await verifyProductionMigrationPreflight(await evidence());
    expect(proof).toMatchObject({
      status: 'PASS', readOnly: true, tip, recipeCount: 500, hydrationFailureCount: 0,
      runtimeFingerprint: 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37',
    });
    expect(JSON.stringify(proof)).not.toContain('orderedRecipeIds');
    expect(db.query("SELECT name FROM sqlite_master WHERE name = 'generated_meal_plan_compositions'")).toEqual([]);
    expect(db.query('SELECT total_changes() AS count')[0].count).toBe(changes);
  });

  it('certifies already-ready heroes and records a private metadata digest before mutation', async () => {
    db.seed(`UPDATE recipe_media SET status = 'ready', storage_key = 'recipes/' || recipe_id || '/hero/v1.webp',
      mime_type = 'image/webp', width = 1024, height = 768, content_length = 1234,
      content_hash = '${'a'.repeat(64)}'`);
    const proof = await verifyProductionMigrationPreflight(await evidence());
    expect(proof.recipeMedia).toMatchObject({ ready: 500, recipesWithoutActiveHero: 0 });
    expect(proof.mediaCapture).toMatchObject({ status: 'MEDIA_METADATA_CAPTURE_PASS', rows: 500, ready: 500,
      r2Availability: 'NOT_REVERIFIED' });
    expect(proof.mediaCapture.metadataSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(proof)).not.toMatch(/storage_key|content_hash|recipes\//);
  });

  it('rejects current invalid private metadata even after valid catalog aggregates', async () => {
    const captured = await evidence();
    db.seed('UPDATE recipe_media SET version = 1000001 WHERE id = (SELECT id FROM recipe_media ORDER BY id LIMIT 1)');
    captured.media = [ok(db.query(recipeMediaQuery()))];
    await expect(verifyProductionMigrationPreflight(captured)).rejects.toThrow(/actual domain validation/);
  });

  it('stops on the production failure of missing ingredient-order rows', async () => {
    db.seed('DELETE FROM recipe_runtime_ingredient_order');
    await expect(verifyProductionMigrationPreflight(await evidence())).rejects.toThrow(/ingredients_without_order/);
  });

  it('rejects non-contiguous ingredient positions despite complete order coverage', async () => {
    db.seed('UPDATE recipe_runtime_ingredient_order SET position = position + 100');
    await expect(verifyProductionMigrationPreflight(await evidence())).rejects.toThrow(/hydration failed/);
  });

  it('rejects changed semantic ingredient content even when order and counts are complete', async () => {
    db.seed("UPDATE recipe_ingredients SET required_quantity = required_quantity + 1 WHERE id = (SELECT id FROM recipe_ingredients ORDER BY id LIMIT 1)");
    await expect(verifyProductionMigrationPreflight(await evidence())).rejects.toThrow(/fingerprint drift/);
  });

  it('rejects a ledger advance during read-only capture', async () => {
    await expect(verifyProductionMigrationPreflight(await evidence({
      ledger: ledger(schema.migrations.map(({ name }) => name)),
    }))).rejects.toThrow(/ledger changed/);
  });

  it('also certifies a complete 0039 ledger without authorizing another apply', async () => {
    db.close();
    db = new SqliteD1();
    manifest.preLedger = classifyPreLedger(manifest, ledger(db.migrations));
    expect(manifest.preLedger.mode).toBe('certify');
    expect(await verifyProductionMigrationPreflight(await evidence())).toMatchObject({ status: 'PASS', tip: migration });
  });

  it.each([
    ['stale main', { mainSha: 'b'.repeat(40) }],
    ['wrong database', { database: { name: PRODUCTION_D1.name, id: 'other' } }],
    ['wrong active binding', { cloudflare: { databaseName: PRODUCTION_D1.name, databaseId: 'other' } }],
    ['multiple migrations', { chain: [tip, migration] }],
    ['wrong pre-tip', { expectedPreTip: '0037_recipe_catalog_scale.sql' }],
  ])('rejects %s before catalog certification', async (_label, replacement) => {
    await expect(verifyProductionMigrationPreflight(await evidence({
      manifest: { ...manifest, ...replacement },
    }))).rejects.toThrow(/exact-main identity/);
  });

  it('rejects incomplete runtime SELECT evidence', async () => {
    await expect(verifyProductionMigrationPreflight(await evidence({
      runtimeCatalog: [ok([])],
    }))).rejects.toThrow(/exactly 5/);
  });
});

describe('production migration workflow ordering', () => {
  it('shares the deployment lock and requires successful catalog preflight before mutation', () => {
    expect(workflow.concurrency).toEqual({ group: 'frigo-deploy-production', 'cancel-in-progress': false });
    const steps = workflow.jobs.migrate.steps;
    const preflight = steps.find((step) => step.id === 'catalog_preflight');
    const apply = steps.find((step) => step.name === 'Apply the pinned chain through the Wrangler ledger');
    expect(preflight.if).toBe("inputs.migration == '0039_meal_composition_v2.sql'");
    expect(preflight.run).toContain('node scripts/d1-readonly-query.mjs catalog');
    expect(preflight.run).toContain('node scripts/d1-readonly-query.mjs runtime-catalog');
    expect(preflight.run).toContain('node scripts/d1-readonly-query.mjs media');
    expect(preflight.run).toContain('node scripts/d1-readonly-query.mjs media-schema');
    expect(preflight.run).toContain('node scripts/production-migration-preflight.mjs migration-manifest.json preflight-ledger.json catalog.json runtime-catalog.json media.json media-schema.json');
    expect(preflight.run).not.toMatch(/migrations apply|time-travel info|wrangler deploy/);
    expect(apply.if).toBe("steps.pre_ledger.outputs.mode == 'apply' && (inputs.migration != '0039_meal_composition_v2.sql' || steps.catalog_preflight.outcome == 'success')");
    const stepIndex = (name) => steps.findIndex((step) => step.name === name);
    expect(stepIndex('Production pre-ledger (read-only)')).toBeLessThan(steps.indexOf(preflight));
    expect(steps.indexOf(preflight)).toBeLessThan(stepIndex('Capture D1 Time Travel rollback bookmark'));
    expect(stepIndex('Capture D1 Time Travel rollback bookmark')).toBeLessThan(steps.indexOf(apply));
    const initialFence = steps.find((step) => step.name === 'Recheck candidate after environment approval');
    const finalFence = steps.find((step) => step.name === 'Recheck current main and CI immediately before migration 0039');
    for (const fence of [initialFence, finalFence]) {
      expect(fence.env.GH_TOKEN).toBe('${{ github.token }}');
      expect(fence.run).toContain('await hostedCi(manifest.sha, manifest.repository)');
      expect(fence.run).toContain('await requireCurrentHostedMain({ sha: manifest.sha, repository: manifest.repository })');
      expect(fence.run.indexOf('await hostedCi(')).toBeLessThan(fence.run.indexOf('await requireCurrentHostedMain('));
      expect(fence.run).toContain('manifest.repository !== process.env.GITHUB_REPOSITORY');
    }
    expect(steps.indexOf(initialFence)).toBeLessThan(steps.indexOf(preflight));
    expect(steps.indexOf(finalFence)).toBe(steps.indexOf(apply) - 1);
    expect(finalFence.if).toBe("inputs.migration == '0039_meal_composition_v2.sql' && steps.pre_ledger.outputs.mode == 'apply'");
    expect(workflow.jobs.migrate.environment).toBe('production');
    const preservation = steps.find((step) => step.name === 'Require unchanged media metadata across migration 0039');
    expect(preservation.if).toBe("inputs.migration == '0039_meal_composition_v2.sql'");
    expect(preservation.run).toContain('node scripts/production-media-preservation.mjs verify migration-manifest.json catalog.json media.json media-schema.json');
    expect(steps.indexOf(preservation)).toBeGreaterThan(stepIndex('Production schema gate (read-only)'));
    expect(steps.indexOf(preservation)).toBeLessThan(steps.length - 1);
    expect(steps.at(-1).with.path).toBe('migration-manifest.json');
  });
});
