import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeContentRead, prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { hydrateRuntimeRecipes } from '../../packages/recipes/src/runtime-hydration';
import { fingerprintRecipes } from '../../packages/recipes/src/catalog-fingerprint';
import { PRODUCTION_D1, catalogQuery } from '../../scripts/d1-migration-check.mjs';
import { migrationManifest } from '../../scripts/release-check.mjs';
import { inspectProductionCatalogPreflight } from '../../scripts/production-catalog-preflight-diagnostics.mjs';

const tip = '0038_auth_onboarding_completion.sql';
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const schema = migrationManifest(process.cwd(), sha);
const fingerprint = 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37';
const orderedIdsSha256 = '0ebfb0cc764fedc65509a391f2f3d23f49b306ceff27901dd504145dfb925d45';
const aggregateKeys = [
  'recipes', 'duplicate_recipe_ids', 'duplicate_slugs', 'runtime_fields',
  'order_min', 'order_max', 'order_distinct', 'recipes_without_runtime_fields',
  'recipes_without_ingredients', 'recipes_without_steps', 'ingredients_without_order',
  'media_ready', 'recipes_without_pending_hero', 'media_total',
  'recipes_without_active_hero', 'media_orphan_rows', 'media_duplicate_ready_roles',
  'media_invalid_metadata', 'media_invalid_ready_metadata',
];
const checkKeys = [
  'catalogCapture', 'runtimeCapture', 'ledger', 'catalogStable', 'runtimeStable', 'catalog', 'runtime',
];
const pipeline = { mapRecipeContentRead, hydrateRuntimeRecipes, fingerprintRecipes };
const ok = (results) => ({ success: true, results });
const ledger = (names) => [ok(names.map((name) => ({ name })))];
let db;
let manifest;

async function evidence(overrides = {}) {
  const catalog = catalogQuery().split(';').map((sql) => ok(db.query(sql)));
  const runtime = await db.batch(prepareRecipeContentRead(db));
  return {
    manifest,
    ledgerBefore: ledger(db.migrations),
    ledgerAfter: ledger(db.migrations),
    catalogFirst: structuredClone(catalog),
    catalogRepeat: structuredClone(catalog),
    runtimeFirst: structuredClone(runtime),
    runtimeRepeat: structuredClone(runtime),
    pipeline,
    ...overrides,
  };
}

function expectBlocked(receipt) {
  expect(receipt).toMatchObject({
    status: 'CATALOG_PREFLIGHT_DIAGNOSTIC_BLOCKED',
    certification: 'NOT_A_RELEASE_CERTIFICATION',
    readOnly: true,
    productionMutations: [],
  });
  expect(Object.keys(receipt.checks).sort()).toEqual([...checkKeys].sort());
  expect(Object.values(receipt.checks).every((status) => ['PASS', 'REJECTED', 'NOT_EVALUATED'].includes(status))).toBe(true);
}

beforeEach(() => {
  db = new SqliteD1({ through: tip });
  manifest = {
    repository: 'vn-tak/Tako-san', environment: 'production', requestedRef: sha, sha, mainSha: sha,
    database: PRODUCTION_D1,
    cloudflare: { databaseName: PRODUCTION_D1.name, databaseId: PRODUCTION_D1.id },
    schema,
    ci: {
      id: 37614255604, attempt: 1, headSha: sha,
      url: 'https://github.com/vn-tak/Tako-san/actions/runs/37614255604',
    },
  };
});
afterEach(() => db.close());

describe('production catalog preflight diagnostics using the real 0038 catalog', () => {
  it('proves both existing gates at 0038 without applying 0039 or changing database content', async () => {
    const captured = await evidence();
    const inputBefore = JSON.stringify(captured);
    const changesBefore = db.query('SELECT total_changes() AS count')[0].count;

    const receipt = await inspectProductionCatalogPreflight(captured);

    expect(receipt).toMatchObject({
      status: 'CATALOG_PREFLIGHT_DIAGNOSTIC_PASS',
      captureConsistency: 'OBSERVED_STABLE_NON_ATOMIC',
      certification: 'NOT_A_RELEASE_CERTIFICATION',
      readOnly: true,
      productionMutations: [],
      catalogProof: { recipeCount: 500, orderedRecipeIdsSha256: orderedIdsSha256 },
      runtimeProof: { recipeCount: 500, hydrationFailureCount: 0, runtimeFingerprint: fingerprint },
    });
    expect(receipt.checks).toEqual(Object.fromEntries(checkKeys.map((key) => [key, 'PASS'])));
    expect(Object.keys(receipt.catalogAggregates).sort()).toEqual([...aggregateKeys].sort());
    expect(receipt.catalogAggregates).toMatchObject({
      recipes: 500, runtime_fields: 500, order_min: 0, order_max: 499, order_distinct: 500,
      media_ready: 0, recipes_without_pending_hero: 0,
    });
    expect(Object.keys(receipt.catalogProof).sort()).toEqual(['orderedRecipeIdsSha256', 'recipeCount']);
    expect(Object.keys(receipt.runtimeProof).sort()).toEqual(['hydrationFailureCount', 'recipeCount', 'runtimeFingerprint']);
    expect(JSON.stringify(captured)).toBe(inputBefore);
    expect(db.query('SELECT total_changes() AS count')[0].count).toBe(changesBefore);
    expect(db.query("SELECT name FROM sqlite_master WHERE name = 'generated_meal_plan_compositions'")).toEqual([]);
  });

  it('accepts 500 already-ready heroes while keeping the receipt aggregate-only', async () => {
    db.seed(`UPDATE recipe_media SET status = 'ready', storage_key = 'recipes/' || recipe_id || '/hero/v1.webp',
      mime_type = 'image/webp', width = 1024, height = 768, content_length = 1234,
      content_hash = '${'a'.repeat(64)}'`);
    const receipt = await inspectProductionCatalogPreflight(await evidence());
    expect(receipt.status).toBe('CATALOG_PREFLIGHT_DIAGNOSTIC_PASS');
    expect(receipt.catalogAggregates).toMatchObject({ media_total: 500, media_ready: 500,
      recipes_without_pending_hero: 500, recipes_without_active_hero: 0,
      media_invalid_metadata: 0, media_invalid_ready_metadata: 0 });
    expect(receipt.runtimeProof.runtimeFingerprint).toBe(fingerprint);
    expect(JSON.stringify(receipt)).not.toMatch(/storage_key|image\/webp|content_hash/);
  });

  it.each(['media_total', 'recipes_without_active_hero', 'media_orphan_rows',
    'media_duplicate_ready_roles', 'media_invalid_metadata', 'media_invalid_ready_metadata'])(
    'rejects missing operational aggregate %s without fallback to the stale policy', async (key) => {
      const captured = await evidence();
      delete captured.catalogFirst[0].results[0][key];
      delete captured.catalogRepeat[0].results[0][key];
      const receipt = await inspectProductionCatalogPreflight(captured);
      expectBlocked(receipt);
      expect(receipt.catalogAggregates).toBeNull();
      expect(receipt.reasons.catalog).toBe('MALFORMED_AGGREGATE_EVIDENCE');
    });

  it('rejects a missing pending hero even though all recipes hydrate and the runtime fingerprint matches', async () => {
    db.seed('DELETE FROM recipe_media WHERE id = (SELECT id FROM recipe_media ORDER BY id LIMIT 1)');
    const captured = await evidence();
    const hydration = hydrateRuntimeRecipes(mapRecipeContentRead(captured.runtimeFirst));
    expect(hydration.recipes).toHaveLength(500);
    expect(hydration.failures).toEqual([]);
    expect(await fingerprintRecipes(hydration.recipes)).toBe(fingerprint);

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ catalog: 'REJECTED', runtime: 'PASS' });
    expect(receipt.captureConsistency).toBe('OBSERVED_STABLE_NON_ATOMIC');
    expect(receipt.catalogAggregates.recipes_without_pending_hero).toBe(1);
  });

  it('rejects gapped recipe order despite complete hydration and an unchanged ordered runtime payload', async () => {
    db.seed('UPDATE recipe_runtime_fields SET runtime_order = runtime_order + 1000');
    const captured = await evidence();
    const hydration = hydrateRuntimeRecipes(mapRecipeContentRead(captured.runtimeFirst));
    expect(hydration.recipes).toHaveLength(500);
    expect(hydration.failures).toEqual([]);
    expect(await fingerprintRecipes(hydration.recipes)).toBe(fingerprint);

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ catalog: 'REJECTED', runtime: 'PASS' });
    expect(receipt.captureConsistency).toBe('OBSERVED_STABLE_NON_ATOMIC');
    expect(receipt.catalogAggregates).toMatchObject({ order_min: 1000, order_max: 1499, order_distinct: 500 });
  });

  it('rejects semantic step drift that leaves ingredient lineage, counts and hydration valid', async () => {
    db.seed("UPDATE recipe_steps SET instruction = instruction || ' PRIVATE_STEP_DRIFT' WHERE id = (SELECT id FROM recipe_steps ORDER BY id LIMIT 1)");
    const captured = await evidence();
    const hydration = hydrateRuntimeRecipes(mapRecipeContentRead(captured.runtimeFirst));
    expect(hydration.recipes).toHaveLength(500);
    expect(hydration.failures).toEqual([]);

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ catalog: 'PASS', runtime: 'REJECTED' });
    expect(receipt.captureConsistency).toBe('OBSERVED_STABLE_NON_ATOMIC');
    expect(receipt.reasons.runtime).toBe('FINGERPRINT_MISMATCH');
    expect(JSON.stringify(receipt)).not.toContain('PRIVATE_STEP_DRIFT');
  });

  it('rejects missing ingredient positions and never emits hydration row identifiers', async () => {
    const privateRecipeId = db.query('SELECT recipe_id FROM recipe_runtime_ingredient_order ORDER BY recipe_id LIMIT 1')[0].recipe_id;
    db.seed('DELETE FROM recipe_runtime_ingredient_order');

    const receipt = await inspectProductionCatalogPreflight(await evidence());

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ catalog: 'REJECTED', runtime: 'REJECTED' });
    expect(receipt.captureConsistency).toBe('OBSERVED_STABLE_NON_ATOMIC');
    expect(receipt.reasons.runtime).toBe('HYDRATION_REJECTED');
    expect(receipt.catalogAggregates.ingredients_without_order).toBe(2702);
    expect(JSON.stringify(receipt)).not.toContain(privateRecipeId);
  });

  it('rejects changed aggregate and identity snapshots before certifying the catalog', async () => {
    const captured = await evidence();
    captured.catalogRepeat[0].results[0].recipes_without_pending_hero = 1;
    captured.catalogRepeat[1].results[0].slug += '-stale';

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks.catalogStable).toBe('REJECTED');
    expect(receipt.captureConsistency).toBe('STABILITY_NOT_PROVEN');
    expect(receipt.checks.catalog).toBe('NOT_EVALUATED');
  });

  it('rejects changed runtime reads even if each read individually remains hydratable', async () => {
    const captured = await evidence();
    captured.runtimeRepeat[2].results[0].instruction += ' PRIVATE_CHANGED_SNAPSHOT';
    expect(hydrateRuntimeRecipes(mapRecipeContentRead(captured.runtimeRepeat)).recipes).toHaveLength(500);

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks.runtimeStable).toBe('REJECTED');
    expect(receipt.captureConsistency).toBe('STABILITY_NOT_PROVEN');
    expect(receipt.checks.runtime).toBe('NOT_EVALUATED');
    expect(JSON.stringify(receipt)).not.toContain('PRIVATE_CHANGED_SNAPSHOT');
  });

  it.each([
    ['ledger advancement', (names) => [...names, '0039_meal_composition_v2.sql']],
    ['missing historical migration', (names) => names.slice(1)],
    ['duplicate migration', (names) => [...names, names[0]]],
    ['unexpected migration', (names) => [...names.slice(0, -1), '0038_private_unreviewed.sql']],
  ])('blocks %s and does not evaluate either catalog gate', async (_label, changedNames) => {
    const captured = await evidence();
    captured.ledgerAfter = ledger(changedNames(db.migrations));

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ ledger: 'REJECTED', catalog: 'NOT_EVALUATED', runtime: 'NOT_EVALUATED' });
    expect(receipt.captureConsistency).toBe('STABILITY_NOT_PROVEN');
    expect(JSON.stringify(receipt)).not.toContain('private_unreviewed');
  });

  it('rejects an unchanged 0039 ledger because this diagnostic is scoped to the pre-migration 0038 state', async () => {
    const advanced = ledger(schema.migrations.map(({ name }) => name));
    const captured = await evidence({ ledgerBefore: advanced, ledgerAfter: structuredClone(advanced) });

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ ledger: 'REJECTED', catalog: 'NOT_EVALUATED', runtime: 'NOT_EVALUATED' });
    expect(receipt.captureConsistency).toBe('STABILITY_NOT_PROVEN');
  });

  it.each([
    ['catalog missing', (captured) => { captured.catalogFirst = null; }, 'catalogCapture'],
    ['catalog statement missing', (captured) => { captured.catalogRepeat.pop(); }, 'catalogCapture'],
    ['catalog failed statement', (captured) => { captured.catalogFirst[0].success = false; }, 'catalogCapture'],
    ['multiple aggregate rows', (captured) => { captured.catalogFirst[0].results.push({ ...captured.catalogFirst[0].results[0] }); }, 'catalogCapture'],
    ['runtime missing', (captured) => { captured.runtimeFirst = null; }, 'runtimeCapture'],
    ['runtime statement missing', (captured) => { captured.runtimeRepeat.pop(); }, 'runtimeCapture'],
    ['runtime failed statement', (captured) => { captured.runtimeFirst[1].success = false; }, 'runtimeCapture'],
  ])('retains a sanitized blocked receipt for %s', async (_label, corrupt, check) => {
    const captured = await evidence();
    corrupt(captured);

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks[check]).toBe('REJECTED');
    expect(receipt.captureConsistency).toBe('STABILITY_NOT_PROVEN');
  });

  it.each(['0', Number.MAX_SAFE_INTEGER + 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects a malformed known aggregate value %s without coercing it', async (value) => {
      const captured = await evidence();
      captured.catalogFirst[0].results[0].order_min = value;
      captured.catalogRepeat[0].results[0].order_min = value;

      const receipt = await inspectProductionCatalogPreflight(captured);

      expectBlocked(receipt);
      expect(receipt.checks).toMatchObject({ catalogCapture: 'PASS', catalog: 'REJECTED' });
      expect(receipt.catalogAggregates).toBeNull();
      expect(receipt.reasons.catalog).toBe('MALFORMED_AGGREGATE_EVIDENCE');
    },
  );

  it('retains null order extrema while rejecting an empty runtime order range', async () => {
    const captured = await evidence();
    for (const catalog of [captured.catalogFirst, captured.catalogRepeat]) {
      catalog[0].results[0].order_min = null;
      catalog[0].results[0].order_max = null;
    }

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ catalogCapture: 'PASS', catalog: 'REJECTED' });
    expect(receipt.catalogAggregates).toMatchObject({ order_min: null, order_max: null });
    expect(receipt.reasons.catalog).toBe('CATALOG_PROOF_REJECTED');
  });

  it('retains negative order bounds as evidence while rejecting the invalid recipe order range', async () => {
    const captured = await evidence();
    for (const catalog of [captured.catalogFirst, captured.catalogRepeat]) {
      catalog[0].results[0].order_min = -1;
      catalog[0].results[0].order_max = 498;
    }

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks).toMatchObject({ catalogCapture: 'PASS', catalog: 'REJECTED' });
    expect(receipt.catalogAggregates).toMatchObject({ order_min: -1, order_max: 498 });
    expect(receipt.reasons.catalog).toBe('CATALOG_PROOF_REJECTED');
  });

  it('rejects negative count fields instead of exposing an impossible aggregate', async () => {
    const captured = await evidence();
    for (const catalog of [captured.catalogFirst, captured.catalogRepeat]) {
      catalog[0].results[0].recipes = -1;
    }

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks.catalog).toBe('REJECTED');
    expect(receipt.catalogAggregates).toBeNull();
    expect(receipt.reasons.catalog).toBe('MALFORMED_AGGREGATE_EVIDENCE');
  });

  it.each([
    ['stale main', { mainSha: 'b'.repeat(40) }],
    ['mutable requested reference', { requestedRef: 'main' }],
    ['wrong repository', { repository: 'private/unreviewed' }],
    ['non-production environment', { environment: 'staging' }],
    ['wrong database binding', { cloudflare: { databaseName: PRODUCTION_D1.name, databaseId: 'other' } }],
    ['wrong database name', { cloudflare: { databaseName: 'other', databaseId: PRODUCTION_D1.id } }],
    ['wrong exact-SHA CI', { ci: { id: 37614255604, attempt: 1, headSha: 'b'.repeat(40) } }],
    ['unreviewed migration tip', { schema: { ...schema, version: tip, migrations: schema.migrations.slice(0, 38) } }],
    ['migration content hash drift', { schema: { ...schema, sha256: 'b'.repeat(64) } }],
  ])('rejects %s before issuing a receipt', async (_label, replacement) => {
    const captured = await evidence({ manifest: { ...manifest, ...replacement } });

    await expect(inspectProductionCatalogPreflight(captured)).rejects.toThrow();
  });

  it('drops unknown row, provider and manifest fields from a successful diagnostic receipt', async () => {
    const captured = await evidence();
    captured.manifest.privateNotes = 'PRIVATE_MANIFEST_NOTES';
    for (const catalog of [captured.catalogFirst, captured.catalogRepeat]) {
      catalog[0].results[0].privateProviderError = 'PRIVATE_CATALOG_ROW';
      catalog[0].meta = { privateProviderError: 'PRIVATE_CATALOG_METADATA' };
      catalog[1].results[0].privateComment = 'PRIVATE_CATALOG_IDENTITY';
    }
    for (const runtime of [captured.runtimeFirst, captured.runtimeRepeat]) {
      runtime[0].results[0].privateComment = 'PRIVATE_RUNTIME_ROW';
      runtime[0].meta = { privateProviderError: 'PRIVATE_RUNTIME_METADATA' };
    }

    const receipt = await inspectProductionCatalogPreflight(captured);

    expect(receipt.status).toBe('CATALOG_PREFLIGHT_DIAGNOSTIC_PASS');
    expect(Object.keys(receipt.catalogAggregates).sort()).toEqual([...aggregateKeys].sort());
    expect(JSON.stringify(receipt)).not.toContain('PRIVATE_');
    expect(JSON.stringify(receipt)).not.toContain('privateProviderError');
    expect(JSON.stringify(receipt)).not.toContain('orderedRecipeIds"');
    expect(JSON.stringify(receipt)).not.toContain(captured.runtimeFirst[0].results[0].title);
  });

  it('ignores provider timing metadata when comparing otherwise identical read snapshots', async () => {
    const captured = await evidence();
    captured.catalogFirst[0].meta = { duration: 1 };
    captured.catalogRepeat[0].meta = { duration: 99 };
    captured.runtimeFirst[0].meta = { duration: 2 };
    captured.runtimeRepeat[0].meta = { duration: 100 };

    const receipt = await inspectProductionCatalogPreflight(captured);

    expect(receipt.status).toBe('CATALOG_PREFLIGHT_DIAGNOSTIC_PASS');
    expect(receipt.checks).toMatchObject({ catalogStable: 'PASS', runtimeStable: 'PASS' });
    expect(JSON.stringify(receipt)).not.toContain('duration');
  });

  it('keeps provider or pipeline exception messages out of blocked receipts', async () => {
    const captured = await evidence({
      pipeline: {
        ...pipeline,
        fingerprintRecipes: async () => { throw new Error('PRIVATE_PROVIDER_SECRET_AND_RAW_ROWS'); },
      },
    });

    const receipt = await inspectProductionCatalogPreflight(captured);

    expectBlocked(receipt);
    expect(receipt.checks.runtime).toBe('REJECTED');
    expect(receipt.reasons.runtime).toBe('FINGERPRINT_FAILED');
    expect(JSON.stringify(receipt)).not.toContain('PRIVATE_PROVIDER_SECRET');
  });
});
