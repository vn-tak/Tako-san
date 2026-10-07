import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  APPROVED_BATCHES_REGISTRY,
  CATALOG_RELEASE_MANIFEST,
  PRODUCTION_D1,
  RUNTIME_CATALOG_READ_STATEMENT_COUNT,
  RECIPE_MEDIA_OPERATIONAL_AGGREGATES,
  baselineQuery,
  catalogQuery,
  classifyPreLedger,
  expectedCatalogAtTip,
  parseWranglerJsonc,
  loadRuntimeCatalogPipeline,
  runtimeCatalogQuery,
  runtimeCatalogQueries,
  validateMigrationCandidate,
  verifyBaselinePreserved,
  verifyApprovedBatchRegistry,
  verifyCatalogAtTip,
  verifyCloudflareIdentity,
  verifyHealth,
  verifyMigrationPlan,
  verifyProductionWranglerConfig,
  verifyRuntimeCatalogContent,
  verifyPostLedger,
  verifyRecipeMediaSeed,
  verifyRecipeMediaOperational,
} from '../../scripts/d1-migration-check.mjs';
import { readFileSync } from 'node:fs';
import { prepareRecipeContentRead } from '../../packages/db/src/recipe-content';
import { SqliteD1 } from '../helpers/sqlite-d1';

const ok = (results) => [{ success: true, results }];
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

describe('production Wrangler JSONC D1 source gate', () => {
  const valid = `{
    // Comments and trailing commas are valid JSONC.
    "d1_databases": [{
      "binding": "DB",
      "database_name": "frigo-db",
      "database_id": "f975ec39-b2c8-4a2a-80e1-0366054599d3",
      "migrations_dir": "migrations",
    }],
  }`;

  it('accepts the exact production binding from a commented JSONC source', () => {
    expect(parseWranglerJsonc(valid)).toMatchObject({ d1_databases: [{ binding: 'DB' }] });
    expect(verifyProductionWranglerConfig({ text: valid })).toMatchObject({
      bindingCount: 1,
      binding: {
        binding: 'DB',
        database_name: 'frigo-db',
        database_id: PRODUCTION_D1.id,
      },
    });
  });

  it('rejects a missing, duplicate, or wrong production D1 binding', () => {
    expect(() => verifyProductionWranglerConfig({ text: '{}' })).toThrow('exactly one');
    expect(() =>
      verifyProductionWranglerConfig({
        text: valid.replace(
          '"migrations_dir": "migrations",',
          '"migrations_dir": "migrations"\n    }, {"binding":"DB","database_name":"frigo-db","database_id":"f975ec39-b2c8-4a2a-80e1-0366054599d3"',
        ),
      }),
    ).toThrow('exactly one');
    for (const field of ['binding', 'database_name', 'database_id']) {
      const wrong = valid.replace(
        field === 'binding'
          ? '"DB"'
          : field === 'database_name'
            ? '"frigo-db"'
            : '"f975ec39-b2c8-4a2a-80e1-0366054599d3"',
        field === 'binding' ? '"OTHER"' : field === 'database_name' ? '"other-db"' : '"wrong-id"',
      );
      expect(() => verifyProductionWranglerConfig({ text: wrong })).toThrow('binding mismatch');
    }
  });

  it('rejects duplicate JSONC property keys instead of accepting the last value', () => {
    expect(() =>
      verifyProductionWranglerConfig({
        text: valid.replace('"database_id": "f975ec39-b2c8-4a2a-80e1-0366054599d3",', '"database_id": "wrong",\n      "database_id": "f975ec39-b2c8-4a2a-80e1-0366054599d3",'),
      }),
    ).toThrow('duplicate property database_id');
  });
});

describe('production D1 migration candidate gate (local Git only)', () => {
  let cwd, preSha, candidateSha, laterSha, unmergedSha;
  const git = (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const migration = (name, sql) => writeFileSync(path.join(cwd, 'migrations', name), sql);
  const pin = (entries) =>
    writeFileSync(
      path.join(cwd, 'tests/fixtures/migration-sha256.json'),
      JSON.stringify({ migrations: entries }),
    );
  const check = (overrides = {}) =>
    validateMigrationCandidate({
      cwd,
      ref: candidateSha,
      expectedPreTip: '0001_base.sql',
      migration: '0002_media.sql',
      ...overrides,
    });

  beforeAll(() => {
    cwd = mkdtempSync(path.join(tmpdir(), 'frigo-d1-migrate-'));
    git('init', '-b', 'main');
    git('config', 'user.email', 'd1-test@example.invalid');
    git('config', 'user.name', 'D1 fixture');
    git('config', 'commit.gpgsign', 'false');
    mkdirSync(path.join(cwd, 'migrations'));
    mkdirSync(path.join(cwd, 'tests/fixtures'), { recursive: true });
    const base = 'CREATE TABLE fixture (id TEXT);\n';
    migration('0001_base.sql', base);
    pin({ '0001_base.sql': sha256(base) });
    git('add', '.');
    git('commit', '-m', 'Base');
    preSha = git('rev-parse', 'HEAD');
    migration('0002_media.sql', 'CREATE TABLE media (id TEXT);\n');
    git('add', '.');
    git('commit', '-m', 'Media');
    candidateSha = git('rev-parse', 'HEAD');
    migration('0003_later.sql', 'CREATE TABLE later (id TEXT);\n');
    git('add', '.');
    git('commit', '-m', 'Later');
    laterSha = git('rev-parse', 'HEAD');
    git('update-ref', 'refs/remotes/origin/main', laterSha);
    git('commit', '--allow-empty', '-m', 'Unmerged');
    unmergedSha = git('rev-parse', 'HEAD');
  });
  afterAll(() => rmSync(cwd, { recursive: true, force: true }));

  it('accepts the exact candidate whose tip is the requested migration and whose predecessor is expected_pre_tip', () => {
    expect(check()).toMatchObject({
      sha: candidateSha,
      migration: '0002_media.sql',
      expectedPreTip: '0001_base.sql',
      chain: ['0002_media.sql'],
      pinnedCount: 1,
      schema: { count: 2, version: '0002_media.sql' },
    });
  });

  it('accepts a multi-step chain: every migration after expected_pre_tip through the tip, in order', () => {
    expect(check({ ref: laterSha, migration: '0003_later.sql' })).toMatchObject({
      chain: ['0002_media.sql', '0003_later.sql'],
      schema: { count: 3, version: '0003_later.sql' },
    });
    expect(
      check({ ref: laterSha, expectedPreTip: '0002_media.sql', migration: '0003_later.sql' }),
    ).toMatchObject({ chain: ['0003_later.sql'] });
  });

  it.each(['main', 'HEAD', 'refs/tags/v1', 'abc1234', '--help'])(
    'rejects non-SHA ref %s',
    (ref) => {
      expect(() => check({ ref })).toThrow('full immutable SHA');
    },
  );

  it('rejects a candidate outside main', () => {
    expect(() => check({ ref: unmergedSha })).toThrow('not contained in main');
  });

  it('rejects a candidate whose tip is a later, unexpected migration', () => {
    expect(() => check({ ref: laterSha })).toThrow('unexpected later migration');
  });

  it('rejects a mismatched expected_pre_tip and malformed migration names', () => {
    expect(() => check({ expectedPreTip: '0001_other.sql' })).toThrow(
      'not part of the candidate migration history',
    );
    expect(() => check({ migration: 'media.sql' })).toThrow('canonical NNNN_name.sql');
    expect(() => check({ ref: preSha, migration: '0001_base.sql' })).toThrow('nothing to apply');
    expect(() =>
      check({ ref: laterSha, expectedPreTip: '0003_later.sql', migration: '0003_later.sql' }),
    ).toThrow('nothing to apply');
  });

  it('rejects a candidate where a pinned historical migration was edited', () => {
    migration('0001_base.sql', 'CREATE TABLE fixture (id TEXT, extra TEXT);\n');
    git('add', '.');
    git('commit', '-m', 'Edit history');
    const edited = git('rev-parse', 'HEAD');
    git('update-ref', 'refs/remotes/origin/main', edited);
    expect(() =>
      check({ ref: edited, expectedPreTip: '0002_media.sql', migration: '0003_later.sql' }),
    ).toThrow('differs from its pinned hash');
    git('update-ref', 'refs/remotes/origin/main', laterSha);
  });
});

describe('production D1 evidence verification', () => {
  const manifest = {
    migration: '0035_recipe_media_layer.sql',
    schema: {
      migrations: [
        { name: '0033_a.sql' },
        { name: '0034_b.sql' },
        { name: '0035_recipe_media_layer.sql' },
      ],
    },
  };
  const ledger = (...names) => ok(names.map((name) => ({ name })));

  it('pins the production database identity and requires d1 list agreement', () => {
    const list = [
      { name: 'frigo-db-staging', uuid: 'other' },
      { name: PRODUCTION_D1.name, uuid: PRODUCTION_D1.id },
    ];
    expect(
      verifyCloudflareIdentity({
        list,
        info: { name: PRODUCTION_D1.name, uuid: PRODUCTION_D1.id },
      }),
    ).toMatchObject({ databaseId: PRODUCTION_D1.id, infoCrossCheck: 'match' });
    expect(verifyCloudflareIdentity({ list, info: null })).toMatchObject({
      infoCrossCheck: 'unavailable',
    });
    expect(() =>
      verifyCloudflareIdentity({ list: [{ name: 'frigo-db', uuid: 'wrong' }], info: null }),
    ).toThrow('mismatch in d1 list');
    expect(() =>
      verifyCloudflareIdentity({ list, info: { name: 'frigo-db', uuid: 'wrong' } }),
    ).toThrow('mismatch in d1 info');
  });

  it('classifies the pre-ledger as apply, certify, or stop (single migration)', () => {
    expect(classifyPreLedger(manifest, ledger('0034_b.sql', '0033_a.sql'))).toMatchObject({
      mode: 'apply',
      count: 2,
      tip: '0034_b.sql',
    });
    expect(
      classifyPreLedger(
        manifest,
        ledger('0033_a.sql', '0034_b.sql', '0035_recipe_media_layer.sql'),
      ),
    ).toMatchObject({ mode: 'certify', count: 3 });
    expect(() => classifyPreLedger(manifest, ledger('0033_a.sql'))).toThrow('stop and reconcile');
    try {
      classifyPreLedger(manifest, ledger('0033_a.sql'));
      throw new Error('expected classifyPreLedger to throw');
    } catch (error) {
      expect(error.message).toBe(
        'Migration ledger is neither at the expected pre-tip nor exactly at the candidate migration; stop and reconcile',
      );
      expect(error.message).not.toMatch(/Production migration ledger/);
    }

    expect(() =>
      classifyPreLedger(
        manifest,
        ledger('0033_a.sql', '0034_b.sql', '0035_recipe_media_layer.sql', '0036_x.sql'),
      ),
    ).toThrow('stop and reconcile');
    expect(() => classifyPreLedger(manifest, [])).toThrow('one successful result');
  });

  it('classifies a multi-step chain: apply only from exactly expected_pre_tip, certify only at the full history', () => {
    const names = ['0034_a.sql', '0035_b.sql', '0036_c.sql', '0037_d.sql'];
    const chained = {
      migration: '0037_d.sql',
      chain: ['0035_b.sql', '0036_c.sql', '0037_d.sql'],
      schema: { migrations: names.map((name) => ({ name })) },
    };
    expect(classifyPreLedger(chained, ledger('0034_a.sql'))).toMatchObject({
      mode: 'apply',
      tip: '0034_a.sql',
      chain: ['0035_b.sql', '0036_c.sql', '0037_d.sql'],
    });
    expect(classifyPreLedger(chained, ledger(...names))).toMatchObject({
      mode: 'certify',
      tip: '0037_d.sql',
      chain: [],
    });
    // Partially applied chain (tip 0035 or 0036) is neither state → stop; the operator must re-dispatch with the true pre-tip.
    expect(() => classifyPreLedger(chained, ledger('0034_a.sql', '0035_b.sql'))).toThrow(
      'stop and reconcile',
    );
    expect(() =>
      classifyPreLedger(chained, ledger('0034_a.sql', '0035_b.sql', '0036_c.sql')),
    ).toThrow('stop and reconcile');
    expect(() => classifyPreLedger(chained, ledger(...names, '0038_future.sql'))).toThrow(
      'stop and reconcile',
    );
  });

  it('requires the post-ledger to equal the candidate manifest exactly', () => {
    expect(
      verifyPostLedger(manifest, ledger('0033_a.sql', '0034_b.sql', '0035_recipe_media_layer.sql')),
    ).toEqual({ count: 3, tip: '0035_recipe_media_layer.sql' });
    expect(() => verifyPostLedger(manifest, ledger('0033_a.sql', '0034_b.sql'))).toThrow('differs');
  });

  it('accepts only a plan of exactly the pinned chain, in order (or none when certifying)', () => {
    const plan =
      'Migrations to be applied:\n┌──────────────────────────────┐\n│ Name                         │\n│ 0035_recipe_media_layer.sql  │\n└──────────────────────────────┘\n';
    expect(
      verifyMigrationPlan(plan, { migration: '0035_recipe_media_layer.sql', mode: 'apply' }),
    ).toEqual({ planned: ['0035_recipe_media_layer.sql'] });
    expect(() =>
      verifyMigrationPlan(`${plan}│ 0036_next.sql │\n`, {
        migration: '0035_recipe_media_layer.sql',
        mode: 'apply',
      }),
    ).toThrow('exactly');
    expect(() =>
      verifyMigrationPlan('✅ No migrations to apply!', {
        migration: '0035_recipe_media_layer.sql',
        mode: 'apply',
      }),
    ).toThrow('exactly');
    expect(
      verifyMigrationPlan('✅ No migrations to apply!', {
        migration: '0035_recipe_media_layer.sql',
        mode: 'certify',
      }),
    ).toEqual({ planned: [] });
    expect(() =>
      verifyMigrationPlan(plan, { migration: '0035_recipe_media_layer.sql', mode: 'certify' }),
    ).toThrow('empty migration plan');
    const chain = [
      '0035_recipe_media_layer.sql',
      '0036_recipe_catalog_pilot.sql',
      '0037_recipe_catalog_scale.sql',
    ];
    const chainPlan = `Migrations to be applied:\n${chain.map((name) => `│ ${name} │`).join('\n')}\n`;
    expect(
      verifyMigrationPlan(chainPlan, { migration: chain.at(-1), chain, mode: 'apply' }),
    ).toEqual({ planned: chain });
    expect(() =>
      verifyMigrationPlan(`│ ${chain[0]} │\n│ ${chain[2]} │\n`, {
        migration: chain.at(-1),
        chain,
        mode: 'apply',
      }),
    ).toThrow('exactly');
    expect(() =>
      verifyMigrationPlan(`│ ${chain[1]} │\n│ ${chain[0]} │\n│ ${chain[2]} │\n`, {
        migration: chain.at(-1),
        chain,
        mode: 'apply',
      }),
    ).toThrow('exactly');
    expect(() =>
      verifyMigrationPlan(`${chainPlan}│ 0038_future.sql │\n`, {
        migration: chain.at(-1),
        chain,
        mode: 'apply',
      }),
    ).toThrow('exactly');
  });

  it('detects any aggregate drift and requires clean health pragmas', () => {
    const pre = ok([{ users: 5, recipes: 71 }]);
    expect(verifyBaselinePreserved(pre, ok([{ users: 5, recipes: 71 }]))).toMatchObject({
      drift: 'none',
    });
    expect(() => verifyBaselinePreserved(pre, ok([{ users: 4, recipes: 71 }]))).toThrow(
      'drift detected in users',
    );
    // Catalog-growth chains may grow the catalog tables only; users/inventory/legacy id prefixes never move.
    const growthPre = ok([
      {
        users: 5,
        inventory_lots: 9,
        recipes: 71,
        recipe_runtime_fields: 71,
        recipes_vn: 59,
        recipes_global: 12,
      },
    ]);
    expect(() =>
      verifyBaselinePreserved(
        growthPre,
        ok([
          {
            users: 5,
            inventory_lots: 9,
            recipes: 500,
            recipe_runtime_fields: 500,
            recipes_vn: 59,
            recipes_global: 12,
          },
        ]),
      ),
    ).toThrow('drift detected in recipes, recipe_runtime_fields');
    expect(
      verifyBaselinePreserved(
        growthPre,
        ok([
          {
            users: 5,
            inventory_lots: 9,
            recipes: 500,
            recipe_runtime_fields: 500,
            recipes_vn: 59,
            recipes_global: 12,
          },
        ]),
        { catalogGrowth: true },
      ),
    ).toMatchObject({ drift: 'none', catalogGrowth: ['recipes', 'recipe_runtime_fields'] });
    expect(() =>
      verifyBaselinePreserved(
        growthPre,
        ok([
          {
            users: 5,
            inventory_lots: 8,
            recipes: 500,
            recipe_runtime_fields: 500,
            recipes_vn: 59,
            recipes_global: 12,
          },
        ]),
        { catalogGrowth: true },
      ),
    ).toThrow('drift detected in inventory_lots');
    expect(() =>
      verifyBaselinePreserved(
        growthPre,
        ok([
          {
            users: 5,
            inventory_lots: 9,
            recipes: 500,
            recipe_runtime_fields: 500,
            recipes_vn: 58,
            recipes_global: 13,
          },
        ]),
        { catalogGrowth: true },
      ),
    ).toThrow('drift detected in recipes_vn, recipes_global');
    expect(verifyHealth({ foreignKeys: ok([]), quickCheck: ok([{ quick_check: 'ok' }]) })).toEqual({
      foreignKeyCheck: '[]',
      quickCheck: 'ok',
    });
    expect(() =>
      verifyHealth({ foreignKeys: ok([{ table: 'x' }]), quickCheck: ok([{ quick_check: 'ok' }]) }),
    ).toThrow('violation');
    expect(() =>
      verifyHealth({
        foreignKeys: ok([]),
        quickCheck: ok([{ quick_check: '*** in database main ***' }]),
      }),
    ).toThrow('quick_check');
  });

  it('requires exactly one pending hero v1 slot per recipe, zero ready, and the 0035 schema contract', () => {
    const summary = (over = {}) =>
      ok([
        {
          total: 71,
          hero: 71,
          thumbnail: 0,
          pending: 71,
          ready: 0,
          rejected: 0,
          superseded: 0,
          ...over,
        },
      ]);
    const slots = (missing = 0) => ok([{ recipes_without_exact_hero_v1_pending: missing }]);
    const table =
      "CREATE TABLE recipe_media (id TEXT PRIMARY KEY NOT NULL, recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE, role TEXT NOT NULL CHECK (role IN ('hero', 'thumbnail')), version INTEGER NOT NULL CHECK (typeof(version) = 'integer' AND version >= 1), status TEXT NOT NULL CHECK (status IN ('pending', 'ready', 'rejected', 'superseded')), UNIQUE (recipe_id, role, version), CHECK (storage_key IS NULL OR (storage_key = 'recipes/' || recipe_id || '/' || role || '/v' || version || '.webp')))";
    const schema = (
      names = [
        'idx_recipe_media_current_ready',
        'idx_recipe_media_recipe_role_status',
        'idx_recipe_media_content_hash',
        'trg_recipe_media_ready_immutable_update',
      ],
    ) =>
      ok([
        { type: 'table', name: 'recipe_media', sql: table },
        ...names.map((name) => ({
          type: name.startsWith('trg') ? 'trigger' : 'index',
          name,
          sql: '',
        })),
      ]);
    expect(
      verifyRecipeMediaSeed({ summary: summary(), slots: slots(), schema: schema(), recipes: 71 }),
    ).toMatchObject({ rows: 71, hero: 71, pending: 71, ready: 0, storageKeyContract: 'exact' });
    expect(() =>
      verifyRecipeMediaSeed({
        summary: summary({ ready: 1, pending: 70 }),
        slots: slots(),
        schema: schema(),
        recipes: 71,
      }),
    ).toThrow('seed mismatch');
    expect(() =>
      verifyRecipeMediaSeed({ summary: summary(), slots: slots(1), schema: schema(), recipes: 71 }),
    ).toThrow('seed mismatch');
    expect(() =>
      verifyRecipeMediaSeed({ summary: summary(), slots: slots(), schema: schema(), recipes: 72 }),
    ).toThrow('seed mismatch');
    expect(() =>
      verifyRecipeMediaSeed({
        summary: summary(),
        slots: slots(),
        schema: schema(['idx_recipe_media_current_ready']),
        recipes: 71,
      }),
    ).toThrow('is missing');
  });

  it('builds a counts-only baseline query (no row projection)', () => {
    const query = baselineQuery();
    expect(query).toMatch(/^SELECT \(SELECT COUNT\(\*\) FROM users\) AS users/);
    expect(query).toContain("WHERE id LIKE 'gl-%') AS recipes_global");
    expect(query).not.toMatch(/SELECT \*|LIMIT/);
  });
});

describe('production catalog certification against the shipped release manifest (T15A)', () => {
  const release = JSON.parse(readFileSync(CATALOG_RELEASE_MANIFEST, 'utf8'));
  const registry = JSON.parse(readFileSync(APPROVED_BATCHES_REGISTRY, 'utf8'));
  const expected = (tip, rel = release, reg = registry) => expectedCatalogAtTip(rel, tip, reg);
  const verify = (tip, statements) => verifyCatalogAtTip(release, tip, statements, registry);
  const catalog = (
    recipes,
    over = {},
    identities = release.orderedRecipeIds.slice(0, recipes).map((id, runtime_order) => ({
      id,
      slug: `slug-${runtime_order}`,
      runtime_order,
    })),
  ) => [
    {
      success: true,
      results: [
        {
          recipes,
          duplicate_recipe_ids: 0,
          duplicate_slugs: 0,
          runtime_fields: recipes,
          order_min: 0,
          order_max: recipes - 1,
          order_distinct: recipes,
          recipes_without_runtime_fields: 0,
          recipes_without_ingredients: 0,
          recipes_without_steps: 0,
          ingredients_without_order: 0,
          media_ready: 0,
          recipes_without_pending_hero: 0,
          ...over,
        },
      ],
    },
    { success: true, results: identities },
  ];

  it('derives the expected catalog for each ledger tip from legacy + approved batches (one source of truth)', () => {
    expect(release).toMatchObject({
      releaseId: 'rel-bd00a4f53fcaeee4',
      legacyBaselineCount: 71,
      expectedRecipeCount: 500,
    });
    expect(registry.batches.map((b) => b.migration)).toEqual([
      '0036_recipe_catalog_pilot.sql',
      '0037_recipe_catalog_scale.sql',
    ]);
    expect(release.approvedImportBatches.map((b) => b.batchId)).toEqual(
      registry.batches.map((b) => b.batchId),
    );
    expect(expected('0034_global_recipe_catalog_parity.sql')).toMatchObject({
      recipes: 71,
      appliedBatches: 0,
      releaseComplete: false,
    });
    expect(expected('0035_recipe_media_layer.sql')).toMatchObject({
      recipes: 71,
      appliedBatches: 0,
      releaseComplete: false,
    });
    expect(expected('0036_recipe_catalog_pilot.sql')).toMatchObject({
      recipes: 101,
      appliedBatches: 1,
      releaseComplete: false,
    });
    expect(expected('0037_recipe_catalog_scale.sql')).toMatchObject({
      recipes: 500,
      appliedBatches: 2,
      totalBatches: 2,
      releaseComplete: true,
    });
    expect(() => expected('main')).toThrow('canonical migration tip');
    expect(() =>
      expected('0037_recipe_catalog_scale.sql', { ...release, expectedRecipeCount: 501 }),
    ).toThrow('disagrees');
    expect(() =>
      expected('0036_recipe_catalog_pilot.sql', {
        ...release,
        approvedImportBatches: [{ ...release.approvedImportBatches[0], releaseBaseCount: 70 }],
      }),
    ).toThrow('does not continue');
    expect(() =>
      expected('0037_recipe_catalog_scale.sql', release, { batches: registry.batches.slice(0, 1) }),
    ).toThrow('not registered');
    expect(() =>
      expected('0037_recipe_catalog_scale.sql', release, {
        batches: registry.batches.map((b) => ({ ...b, recipeCount: b.recipeCount + 1 })),
      }),
    ).toThrow('not registered');
  });

  it('certifies tip 0037 only with exactly 500 complete recipes in order 0..499 and no ready media', () => {
    expect(verify('0037_recipe_catalog_scale.sql', catalog(500))).toMatchObject({
      recipes: 500,
      actualRecipes: 500,
      appliedBatches: 2,
      releaseComplete: true,
      orderedRecipeIdsSha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      expectedRuntimeFingerprint: release.expectedRuntimeFingerprint,
      mediaReady: 0,
    });
    expect(verify('0036_recipe_catalog_pilot.sql', catalog(101))).toMatchObject({
      recipes: 101,
      actualRecipes: 101,
    });
    expect(verify('0035_recipe_media_layer.sql', catalog(71))).toMatchObject({ recipes: 71 });
  });

  it('fails closed when the database does not hold the catalog its ledger tip promises', () => {
    expect(() => verify('0037_recipe_catalog_scale.sql', catalog(101))).toThrow(
      'recipes 101 != 500',
    );
    expect(() => verify('0036_recipe_catalog_pilot.sql', catalog(71))).toThrow('recipes 71 != 101');
    expect(() =>
      verify('0037_recipe_catalog_scale.sql', catalog(500, { runtime_fields: 499 })),
    ).toThrow('runtime_fields 499 != 500');
    expect(() =>
      verify(
        '0037_recipe_catalog_scale.sql',
        catalog(500, { order_max: 500, order_distinct: 500 }),
      ),
    ).toThrow('runtime_order');
    expect(() =>
      verify('0037_recipe_catalog_scale.sql', catalog(500, { order_distinct: 499 })),
    ).toThrow('runtime_order');
    expect(() =>
      verify('0037_recipe_catalog_scale.sql', catalog(500, { duplicate_slugs: 1 })),
    ).toThrow('duplicate_slugs=1');
    expect(() =>
      verify(
        '0037_recipe_catalog_scale.sql',
        catalog(
          500,
          {},
          release.orderedRecipeIds.slice(0, 500).map((id, runtime_order) => ({
            id: runtime_order === 17 ? 'wrong-recipe-id' : id,
            slug: `slug-${runtime_order}`,
            runtime_order,
          })),
        ),
      ),
    ).toThrow('ordered_recipe_id[17]');
    expect(() =>
      verify(
        '0037_recipe_catalog_scale.sql',
        catalog(
          500,
          {},
          release.orderedRecipeIds.slice(0, 500).map((id, runtime_order) => ({
            id,
            slug: runtime_order < 2 ? 'duplicate-slug' : `slug-${runtime_order}`,
            runtime_order,
          })),
        ),
      ),
    ).toThrow('duplicate recipe slugs');
    expect(() =>
      verify('0037_recipe_catalog_scale.sql', catalog(500, { recipes_without_ingredients: 1 })),
    ).toThrow('recipes_without_ingredients=1');
    expect(() =>
      verify('0037_recipe_catalog_scale.sql', catalog(500, { recipes_without_pending_hero: 3 })),
    ).toThrow('recipes_without_pending_hero=3');
    expect(() => verify('0037_recipe_catalog_scale.sql', catalog(500, { media_ready: 1 }))).toThrow(
      'media_ready=1',
    );
    expect(() => verify('0037_recipe_catalog_scale.sql', [])).toThrow('two successful results');
  });

  it('builds a bounded catalog certification query with exact identity/order but no recipe prose', () => {
    const query = catalogQuery();
    expect(query).toMatch(/^SELECT \(SELECT COUNT\(\*\) FROM recipes\) AS recipes/);
    expect(query).toContain('AS recipes_without_pending_hero');
    expect(query).toContain('SELECT r.id, r.slug, f.runtime_order');
    expect(query).toContain('ORDER BY f.runtime_order, r.id');
    expect(query).not.toMatch(/SELECT \*|LIMIT|title|description|instruction/);
  });
});

describe('pre-deploy runtime catalog content certification', () => {
  const statements = () =>
    Array.from({ length: RUNTIME_CATALOG_READ_STATEMENT_COUNT }, () => ({
      success: true,
      results: [],
    }));
  const fakeReleaseId = `rel-${sha256('{"batches":[],"legacyBaselineFingerprint":"legacy-fingerprint"}').slice(0, 16)}`;
  const release = {
    schemaVersion: 1,
    releaseId: fakeReleaseId,
    legacyBaselineCount: 1,
    legacyBaselineFingerprint: 'legacy-fingerprint',
    expectedRecipeCount: 1,
    orderedRecipeIds: ['recipe-1'],
    expectedRuntimeFingerprint: 'runtime-fingerprint',
    approvedImportBatches: [],
  };
  const registry = { batches: [] };
  const recipe = { id: 'recipe-1', title: 'Original content' };

  it('generates exactly the five SELECTs from the production content reader', () => {
    const queries = runtimeCatalogQueries(prepareRecipeContentRead);
    expect(queries).toHaveLength(RUNTIME_CATALOG_READ_STATEMENT_COUNT);
    expect(queries.every((query) => /^\s*SELECT\b/i.test(query))).toBe(true);
    expect(queries).toEqual([
      expect.stringContaining('FROM recipes ORDER BY id'),
      expect.stringContaining('FROM recipe_ingredients'),
      expect.stringContaining('FROM recipe_steps'),
      expect.stringContaining('SELECT DISTINCT recipe_id FROM recipe_nutrition'),
      expect.stringContaining('FROM recipe_runtime_fields'),
    ]);
    expect(runtimeCatalogQuery(prepareRecipeContentRead).split(';')).toHaveLength(
      RUNTIME_CATALOG_READ_STATEMENT_COUNT + 1,
    );
  });

  it('uses map → hydrate → fingerprint and records the certified content identity', async () => {
    const calls = [];
    const result = await verifyRuntimeCatalogContent({
      release,
      registry,
      tip: '0001_catalog.sql',
      statements: statements(),
      pipeline: {
        mapRecipeContentRead: (input) => {
          calls.push(['map', input.length]);
          return { snapshot: true };
        },
        hydrateRuntimeRecipes: (snapshot) => {
          calls.push(['hydrate', snapshot.snapshot]);
          return { recipes: [recipe], failures: [], classifications: [] };
        },
        fingerprintRecipes: async (recipes) => {
          calls.push(['fingerprint', recipes.length]);
          return 'runtime-fingerprint';
        },
      },
    });
    expect(calls).toEqual([
      ['map', 5],
      ['hydrate', true],
      ['fingerprint', 1],
    ]);
    expect(result).toMatchObject({
      actualRecipes: 1,
      contentReadStatementCount: 5,
      hydrationFailureCount: 0,
      runtimeFingerprint: 'runtime-fingerprint',
      approvedBatchIds: [],
      approvedBatchHashes: [],
    });
  });

  it('rejects a content mutation even when IDs and runtime order remain unchanged', async () => {
    await expect(
      verifyRuntimeCatalogContent({
        release,
        registry,
        tip: '0001_catalog.sql',
        statements: statements(),
        pipeline: {
          mapRecipeContentRead: () => ({ snapshot: true }),
          hydrateRuntimeRecipes: () => ({
            recipes: [{ ...recipe, title: 'Tampered content' }],
            failures: [],
            classifications: [],
          }),
          fingerprintRecipes: async () => 'tampered-fingerprint',
        },
      }),
    ).rejects.toThrow('content fingerprint drift');
  });

  it('rejects runtime count and ordered-ID drift before fingerprinting', async () => {
    const pipeline = (recipes) => ({
      mapRecipeContentRead: () => ({ snapshot: true }),
      hydrateRuntimeRecipes: () => ({ recipes, failures: [], classifications: [] }),
      fingerprintRecipes: async () => 'runtime-fingerprint',
    });
    await expect(
      verifyRuntimeCatalogContent({
        release,
        registry,
        tip: '0001_catalog.sql',
        statements: statements(),
        pipeline: pipeline([]),
      }),
    ).rejects.toThrow('recipe count');
    await expect(
      verifyRuntimeCatalogContent({
        release,
        registry,
        tip: '0001_catalog.sql',
        statements: statements(),
        pipeline: pipeline([{ ...recipe, id: 'recipe-2' }]),
      }),
    ).rejects.toThrow('IDs/order drift');
  });

  it('rejects hydration failures and malformed Wrangler statement output', async () => {
    await expect(
      verifyRuntimeCatalogContent({
        release,
        registry,
        tip: '0001_catalog.sql',
        statements: statements(),
        pipeline: {
          mapRecipeContentRead: () => ({ snapshot: true }),
          hydrateRuntimeRecipes: () => ({
            recipes: [],
            failures: [{ id: 'recipe-1', code: 'runtime_contract_violation' }],
            classifications: [],
          }),
          fingerprintRecipes: async () => 'unused',
        },
      }),
    ).rejects.toThrow('hydration failed');
    await expect(
      verifyRuntimeCatalogContent({
        release,
        registry,
        tip: '0001_catalog.sql',
        statements: statements().slice(0, 4),
        pipeline: {
          mapRecipeContentRead: () => ({ snapshot: true }),
          hydrateRuntimeRecipes: () => ({ recipes: [recipe], failures: [], classifications: [] }),
          fingerprintRecipes: async () => 'runtime-fingerprint',
        },
      }),
    ).rejects.toThrow('exactly 5 statement results');
  });

  it('rejects tampered approved batch hashes and source provenance before reading remote content', () => {
    const releaseOnDisk = JSON.parse(readFileSync(CATALOG_RELEASE_MANIFEST, 'utf8'));
    const registryOnDisk = JSON.parse(readFileSync(APPROVED_BATCHES_REGISTRY, 'utf8'));
    expect(
      verifyApprovedBatchRegistry(releaseOnDisk, registryOnDisk).map((batch) => batch.batchId),
    ).toEqual(registryOnDisk.batches.map((batch) => batch.batchId));
    const provenanceTampered = {
      ...releaseOnDisk,
      approvedImportBatches: releaseOnDisk.approvedImportBatches.map((batch, index) =>
        index === 0 ? { ...batch, sourceReference: 'tampered provenance' } : batch,
      ),
    };
    expect(() => expectedCatalogAtTip(provenanceTampered, '0037_recipe_catalog_scale.sql', registryOnDisk)).toThrow(
      'source provenance',
    );
    const hashTampered = {
      ...releaseOnDisk,
      approvedImportBatches: releaseOnDisk.approvedImportBatches.map((batch, index) =>
        index === 0 ? { ...batch, batchHash: '0'.repeat(64) } : batch,
      ),
    };
    expect(() => expectedCatalogAtTip(hashTampered, '0037_recipe_catalog_scale.sql', registryOnDisk)).toThrow(
      'migration identity',
    );
    expect(() =>
      expectedCatalogAtTip(
        { ...releaseOnDisk, releaseId: 'rel-0000000000000000' },
        '0037_recipe_catalog_scale.sql',
        registryOnDisk,
      ),
    ).toThrow('does not match approved batch identity');
  });
});

describe('operational recipe media at complete 0038 and 0039 catalogs', () => {
  const release = JSON.parse(readFileSync(CATALOG_RELEASE_MANIFEST, 'utf8'));
  const registry = JSON.parse(readFileSync(APPROVED_BATCHES_REGISTRY, 'utf8'));
  const tips = ['0038_auth_onboarding_completion.sql', '0039_meal_composition_v2.sql'];
  const firstId = release.orderedRecipeIds[0];
  let db, cliDirectory;
  const capture = () => catalogQuery().split(';').map((query) => db.execute(query));
  const schema = () => ok(db.query("SELECT type, name, sql FROM sqlite_master WHERE tbl_name = 'recipe_media' ORDER BY type, name"));
  const verify = (tip = tips[0], statements = capture()) => verifyCatalogAtTip(release, tip, statements, registry);
  const operational = (catalog = capture(), objects = schema()) => verifyRecipeMediaOperational({ catalog, schema: objects, recipes: 500 });
  const ready = (count = 500) => db.seed(`
    UPDATE recipe_media SET status = 'ready', source_type = 'generated',
      storage_key = 'recipes/' || recipe_id || '/hero/v1.webp', mime_type = 'image/webp',
      width = 1200, height = 800, content_length = 42, content_hash = '${'a'.repeat(64)}'
    WHERE recipe_id IN (SELECT recipe_id FROM recipe_runtime_fields WHERE runtime_order < ${count});
  `);
  const readyOne = (overrides = {}) => {
    const values = {
      status: 'ready', source_type: 'generated', storage_key: `recipes/${firstId}/hero/v1.webp`,
      mime_type: 'image/webp', width: 1200, height: 800, content_length: 42, content_hash: 'a'.repeat(64),
      ...overrides,
    };
    db.execute(`UPDATE recipe_media SET ${Object.keys(values).map((key) => `${key} = ?`).join(', ')} WHERE recipe_id = ?`, [...Object.values(values), firstId]);
  };
  const insertVersion = (role = 'hero', status = 'pending', version = 2, recipeId = firstId) => {
    const filled = status === 'ready';
    db.execute('INSERT INTO recipe_media (id, recipe_id, role, version, status, source_type, storage_key, mime_type, width, height, content_length, content_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      `${recipeId}_media_${role}_v${version}`, recipeId, role, version, status,
      filled ? 'generated' : null, filled ? `recipes/${recipeId}/${role}/v${version}.webp` : null,
      filled ? 'image/webp' : null, filled ? 1200 : null, filled ? 800 : null, filled ? 42 : null, filled ? 'a'.repeat(64) : null,
    ]);
  };
  const cliVerify = (tip, includeCatalog = true) => {
    const save = (name, value) => {
      const file = path.join(cliDirectory, name);
      writeFileSync(file, JSON.stringify(value));
      return file;
    };
    const manifestFile = save('manifest.json', { preLedger: { chain: [] }, preBaseline: { recipes: 500 }, postLedger: { count: Number(tip.slice(0, 4)), tip } });
    const evidence = [
      save('baseline.json', ok([{ recipes: 500 }])), save('fk.json', ok([])), save('quick.json', ok([{ quick_check: 'ok' }])),
      save('summary.json', ok(db.query("SELECT COUNT(*) AS total, SUM(role = 'hero') AS hero, SUM(role = 'thumbnail') AS thumbnail, SUM(status = 'pending') AS pending, SUM(status = 'ready') AS ready, SUM(status = 'rejected') AS rejected, SUM(status = 'superseded') AS superseded FROM recipe_media"))),
      save('slots.json', ok([{ recipes_without_exact_hero_v1_pending: 500 }])), save('schema.json', schema()),
      ...(includeCatalog ? [save('catalog.json', capture())] : []),
    ];
    execFileSync(process.execPath, ['scripts/d1-migration-check.mjs', 'verify', manifestFile, ...evidence], { stdio: ['ignore', 'pipe', 'pipe'] });
    return JSON.parse(readFileSync(manifestFile, 'utf8'));
  };
  beforeAll(() => {
    db = new SqliteD1({ through: tips[0] });
    cliDirectory = mkdtempSync(path.join(tmpdir(), 'frigo-media-operational-cli-'));
  });
  beforeEach(() => db.seed('PRAGMA ignore_check_constraints = OFF; SAVEPOINT media_gate_control; PRAGMA defer_foreign_keys = ON;'));
  afterEach(() => db.seed('ROLLBACK TO media_gate_control; RELEASE media_gate_control; PRAGMA defer_foreign_keys = OFF; PRAGMA ignore_check_constraints = OFF;'));
  afterAll(() => { db.close(); rmSync(cliDirectory, { recursive: true }); });

  it.each(tips)('accepts the historical pending seed at operational tip %s', (tip) => {
    expect(verify(tip)).toMatchObject({ mediaReady: 0, recipeMedia: { policy: 'OPERATIONAL_READY_OR_PENDING', rows: 500, ready: 0, r2Availability: 'NOT_REVERIFIED' } });
    expect(operational()).toMatchObject({ rows: 500, ready: 0, storageKeyContract: 'exact' });
  });
  it.each(tips)('accepts 500 ready heroes without changing metadata at %s', (tip) => {
    ready();
    const before = db.query('SELECT id, status, storage_key, content_hash FROM recipe_media ORDER BY id');
    expect(verify(tip)).toMatchObject({ mediaReady: 500, recipeMedia: { rows: 500, ready: 500 } });
    expect(operational()).toMatchObject({ ready: 500 });
    expect(db.query('SELECT id, status, storage_key, content_hash FROM recipe_media ORDER BY id')).toEqual(before);
  });
  it('accepts a mixed ready and pending rollout', () => {
    ready(250);
    expect(verify()).toMatchObject({ mediaReady: 250, recipeMedia: { rows: 500, ready: 250 } });
  });
  it('accepts a pending successor alongside the current ready hero', () => {
    ready(); insertVersion();
    expect(verify()).toMatchObject({ recipeMedia: { rows: 501, ready: 500 } });
  });
  it('accepts a valid ready thumbnail while requiring each recipe hero', () => {
    ready(); insertVersion('thumbnail', 'ready');
    expect(verify()).toMatchObject({ recipeMedia: { rows: 501, ready: 501 } });
  });
  it.each([['image/webp', 'webp'], ['image/avif', 'avif'], ['image/jpeg', 'jpg'], ['image/png', 'png']])('accepts trusted %s metadata', (mime, extension) => {
    readyOne({ mime_type: mime, storage_key: `recipes/${firstId}/hero/v1.${extension}`, content_length: 0 });
    expect(verify()).toMatchObject({ mediaReady: 1 });
  });
  it('keeps 0037 pending-only rather than allowing media rollout at historical import tips', () => {
    ready();
    expect(() => verify('0037_recipe_catalog_scale.sql')).toThrow('media_ready=500');
  });
  it('does not extend operational policy to an unknown future tip', () => {
    ready();
    expect(() => verify('0040_future.sql')).toThrow('media_ready=500');
  });
  it('keeps catalog capture at exactly two read-only statements with 19 aggregate fields', () => {
    const queries = catalogQuery().split(';');
    expect(queries).toHaveLength(2);
    expect(queries.every((query) => query.trim().startsWith('SELECT '))).toBe(true);
    expect(Object.keys(capture()[0].results[0])).toHaveLength(19);
  });
  it('requires active hero coverage when a recipe has only rejected media', () => {
    db.execute("UPDATE recipe_media SET status = 'rejected' WHERE recipe_id = ?", [firstId]);
    expect(() => verify()).toThrow('recipes_without_active_hero=1');
  });
  it('rejects a missing hero even if a valid thumbnail exists', () => {
    db.execute('DELETE FROM recipe_media WHERE recipe_id = ?', [firstId]);
    insertVersion('thumbnail', 'ready');
    expect(() => verify()).toThrow('recipes_without_active_hero=1');
  });
  it('rejects multiple pending heroes when no ready hero exists', () => {
    insertVersion();
    expect(() => verify()).toThrow('recipes_without_active_hero=1');
  });
  it.each(['hero', 'thumbnail'])('rejects duplicate current ready %s roles despite valid metadata', (role) => {
    ready(); db.seed('DROP INDEX idx_recipe_media_current_ready;');
    if (role === 'thumbnail') insertVersion(role, 'ready', 2);
    insertVersion(role, 'ready', 3);
    expect(capture()[0].results[0].media_duplicate_ready_roles).toBe(1);
    expect(() => verify()).toThrow();
  });
  it('rejects orphan media rows even when all real recipes have valid heroes', () => {
    insertVersion('hero', 'ready', 1, 'orphan-recipe');
    expect(() => verify()).toThrow('media_orphan_rows=1');
  });
  it('loads the actual domain media mapper and validator through the runtime pipeline', async () => {
    readyOne();
    const pipeline = await loadRuntimeCatalogPipeline();
    try {
      const row = db.query('SELECT id, recipe_id, role, version, status, source_type, storage_key, mime_type, width, height, content_length, content_hash, source_reference, generator_provider, generator_model, prompt_hash, created_at, updated_at FROM recipe_media WHERE recipe_id = ?', firstId)[0];
      const record = pipeline.mapRecipeMediaRow(row);
      expect(record).not.toBeNull();
      expect(pipeline.auditReadyRecipeMediaRecord(record)).toEqual([]);
      expect(pipeline.isCanonicalRecipeIdShape(firstId)).toBe(true);
      expect(pipeline.isCanonicalRecipeIdShape('good-id\0bad')).toBe(false);
      expect(pipeline.isRecipeMediaMimeType('image/svg+xml')).toBe(false);
      expect(pipeline.isSha256Hex(`${'a'.repeat(64)}\0`)).toBe(false);
      expect(pipeline.isTrustedRecipeMediaStorageKey(record.storageKey, record.recipeId, record.role, record.version, record.mimeType)).toBe(true);
      expect(pipeline.mapRecipeMediaRow({ ...row, version: 1000001 })).toBeNull();
    } finally {
      await pipeline.close();
    }
  });
  it.each([
    ['storage_key', null], ['mime_type', null], ['width', null], ['height', null], ['content_length', null], ['content_hash', null],
    ['storage_key', `recipes/${firstId}/hero/v1.jpeg`], ['mime_type', 'image/svg+xml'], ['width', 0], ['height', -1], ['width', 1.5],
    ['content_length', -1], ['content_length', 1.5], ['content_hash', 'A'.repeat(64)], ['content_hash', 'a'.repeat(63)], ['content_hash', 'g'.repeat(64)], ['content_hash', `${'a'.repeat(64)}\0`],
  ])('rejects incomplete or malformed ready %s=%s using real SQL aggregates', (field, value) => {
    db.seed('PRAGMA ignore_check_constraints = ON;');
    readyOne({ [field]: value });
    expect(capture()[0].results[0].media_invalid_ready_metadata).toBe(1);
    expect(() => verify()).toThrow(/media_invalid_(ready_)?metadata=1/);
  });
  it.each([
    ['id', ''], ['role', 'other'], ['status', 'unknown'], ['source_type', 'unknown'], ['source_type', new Uint8Array([1])],
    ['version', 0], ['version', 1.5], ['version', 1000001], ['recipe_id', 'Bad-ID'], ['recipe_id', '-bad'], ['recipe_id', 'bad--id'], ['recipe_id', 'a'.repeat(65)], ['recipe_id', 'good-id\0bad'],
    ['created_at', ''], ['updated_at', ''], ['prompt_hash', 'broken'], ['source_reference', ''], ['generator_provider', ''], ['generator_model', ''],
  ])('rejects malformed common metadata %s=%s instead of coercing it', (field, value) => {
    db.seed('PRAGMA ignore_check_constraints = ON;');
    db.execute(`UPDATE recipe_media SET ${field} = ? WHERE recipe_id = ?`, [value, firstId]);
    expect(capture()[0].results[0].media_invalid_metadata).toBe(1);
    expect(() => verify()).toThrow();
  });
  it.each(RECIPE_MEDIA_OPERATIONAL_AGGREGATES)('rejects missing operational aggregate %s', (field) => {
    const catalog = capture(); delete catalog[0].results[0][field];
    expect(() => verify(tips[0], catalog)).toThrow(`aggregate ${field} is invalid`);
  });
  it.each([null, -1, 1.5, '0', Number.MAX_SAFE_INTEGER + 1])('rejects invalid aggregate type/value %s', (value) => {
    const catalog = capture(); catalog[0].results[0].media_invalid_ready_metadata = value;
    expect(() => verify(tips[0], catalog)).toThrow('aggregate media_invalid_ready_metadata is invalid');
  });
  it('rejects inconsistent total and ready counts', () => {
    const catalog = capture(); catalog[0].results[0].media_ready = 501;
    expect(() => verify(tips[0], catalog)).toThrow('totals are inconsistent');
  });
  it('rejects extra aggregate rows rather than selecting the first', () => {
    const catalog = capture(); catalog[0].results.push({ ...catalog[0].results[0] });
    expect(() => verify(tips[0], catalog)).toThrow('exactly one row');
    expect(() => operational(catalog)).toThrow('two successful catalog results');
  });
  it.each(['recipe_media', 'idx_recipe_media_current_ready', 'idx_recipe_media_recipe_role_status', 'idx_recipe_media_content_hash', 'trg_recipe_media_ready_immutable_update'])('requires immutable schema definition for %s', (name) => {
    const objects = schema(); objects[0].results.find((object) => object.name === name).sql += ' -- changed';
    expect(() => operational(capture(), objects)).toThrow(`schema object ${name} differs`);
  });
  it('rejects a same-name nonunique ready index', () => {
    db.seed("DROP INDEX idx_recipe_media_current_ready; CREATE INDEX idx_recipe_media_current_ready ON recipe_media(recipe_id, role) WHERE status = 'ready';");
    expect(() => operational()).toThrow('schema object idx_recipe_media_current_ready differs');
  });
  it('rejects a same-name no-op immutability trigger', () => {
    db.seed('DROP TRIGGER trg_recipe_media_ready_immutable_update; CREATE TRIGGER trg_recipe_media_ready_immutable_update BEFORE UPDATE ON recipe_media BEGIN SELECT 1; END;');
    expect(() => operational()).toThrow('schema object trg_recipe_media_ready_immutable_update differs');
  });
  it.each(tips)('generic verify CLI accepts ready media at %s using mandatory catalog evidence', (tip) => {
    ready();
    expect(cliVerify(tip)).toMatchObject({ aggregateDrift: 'none', recipeMedia: { rows: 500, ready: 500, policy: 'OPERATIONAL_READY_OR_PENDING' } });
  });
  it('generic modern verify CLI fails closed without catalog evidence', () => {
    ready(); expect(() => cliVerify(tips[1], false)).toThrow();
  });
  it('generic 0037 verify CLI retains the strict seed check', () => {
    ready(); expect(() => cliVerify('0037_recipe_catalog_scale.sql')).toThrow();
  });
});
