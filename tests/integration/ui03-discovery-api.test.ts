import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gzipSync } from 'node:zlib';
import type { Env, AuthContext } from '../../src/worker/types';
import { authMiddleware } from '../../src/worker/middleware/auth';
import { recipeRoutes } from '../../src/worker/routes/recipes';
import { resetRecipeAuthorityCacheForTests } from '../../src/worker/services/recipe-authority';
import { discoverRecipes } from '../../src/worker/services/recipe-discovery';
import {
  DiscoveryQuerySchema,
  DiscoveryPageSchema,
} from '../../packages/recipes/src/discovery-contract';
import { createRecipeAuthoritySnapshot } from '../../packages/recipes/src/recipe-authority';
import { signJwt } from '../../src/worker/utils/jwt';
import { SqliteD1, type SqliteStatementEvent } from '../helpers/sqlite-d1';
import { ALL_RECIPES, evaluateRecipeMatch, type Recipe } from '@frigo/recipes';

const auth = { userId: 'ui03-user', householdId: 'ui03-house', isGuest: false };
const secret = 'ui03-local-test-secret-with-at-least-thirty-two-characters';
const app = new Hono<{ Bindings: Env; Variables: { auth: AuthContext } }>();
app.use('*', authMiddleware);
app.route('/', recipeRoutes);
let db: SqliteD1;
let token: string;
let statements: SqliteStatementEvent[];
const env = () =>
  ({
    DB: db,
    ENVIRONMENT: 'test',
    JWT_SECRET: secret,
    RECIPE_CATALOG_MODE: 'd1',
    RECIPE_CATALOG_CUTOVER_ENABLED: 'true',
  }) as unknown as Env;
async function request(
  query = '',
  overrides: Partial<Env> = {},
  headers: Record<string, string> = {},
) {
  return app.fetch(
    new Request(`https://ui03.local/recipe-discovery${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${token}`, ...headers },
    }),
    { ...env(), ...overrides },
  );
}
async function page(query = '', overrides: Partial<Env> = {}) {
  const response = await request(query, overrides);
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  return DiscoveryPageSchema.parse(await response.json());
}
beforeEach(async () => {
  statements = [];
  db = new SqliteD1({
    hooks: {
      beforeStatement: (event) => {
        statements.push(event);
      },
    },
  });
  db.seed(`INSERT INTO users(id) VALUES ('ui03-user'), ('ui03-other');
    INSERT INTO households(id, name, created_by) VALUES ('ui03-house', 'UI03', 'ui03-user'), ('ui03-other-house', 'Other', 'ui03-other');
    INSERT INTO household_members(id, household_id, user_id, role) VALUES ('ui03-member', 'ui03-house', 'ui03-user', 'owner'), ('ui03-other-member', 'ui03-other-house', 'ui03-other', 'owner');
    INSERT INTO inventory_items(id, household_id, ingredient_id, name, quantity, unit, category, storage, freshness, data_source)
      VALUES ('ui03-eggs', 'ui03-house', 'CHICKEN_EGG', 'Trứng gà', 2, 'piece', 'egg', 'fridge', 'fresh', 'manual'),
      ('ui03-rice', 'ui03-other-house', 'RICE', 'Gạo', 1000, 'g', 'grain', 'pantry', 'fresh', 'manual');`);
  token = await signJwt(
    {
      sub: auth.userId,
      hid: auth.householdId,
      typ: 'access',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    secret,
  );
  resetRecipeAuthorityCacheForTests();
});
afterEach(() => {
  db.close();
  vi.restoreAllMocks();
  resetRecipeAuthorityCacheForTests();
});

describe('UI03 authenticated discovery', () => {
  it('24 summaries stay under100KiB; Home3 and detail remain separate; media reads only selected IDs', async () => {
    const response = await request();
    const raw = await response.text();
    expect(response.status).toBe(200);
    const data = DiscoveryPageSchema.parse(JSON.parse(raw));
    expect(data.total).toBe(500);
    expect(data.items).toHaveLength(24);
    expect(Buffer.byteLength(raw)).toBeLessThan(100 * 1024);
    expect(raw).not.toMatch(
      /"ingredients"|"steps"|"nutrition"|"storageKey"|"ingredientAvailability"|"householdId"/,
    );
    const mediaReads = statements.filter((event) => event.sql.includes('FROM recipe_media'));
    expect(mediaReads).toHaveLength(1);
    expect(
      mediaReads[0].bindings.filter((value) => data.items.some((item) => item.recipe.id === value)),
    ).toHaveLength(24);
    const home = await page('pageSize=3');
    expect(home.items).toHaveLength(3);
    expect(home.items).toEqual(data.items.slice(0, 3));
    const detail = await app.fetch(
      new Request(`https://ui03.local/recipes/${data.items[0].recipe.slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      env(),
    );
    const body = (await detail.json()) as { recipe: Recipe };
    expect(body.recipe.ingredients.length).toBeGreaterThan(0);
    expect(body.recipe.steps.length).toBeGreaterThan(0);
    console.log(
      JSON.stringify({
        summaryBytes: Buffer.byteLength(raw),
        gzipBytes: gzipSync(raw).length,
        items: data.items.length,
      }),
    );
  });
  it('all21 pages cover500 unique recipes in identical deterministic order on reload', async () => {
    const first = await page();
    const ids = first.items.map((item) => item.recipe.id);
    let current = first;
    while (current.nextCursor) {
      current = await page(`page=${current.page + 1}&cursor=${current.nextCursor}`);
      ids.push(...current.items.map((item) => item.recipe.id));
    }
    expect(ids).toHaveLength(500);
    expect(new Set(ids).size).toBe(500);
    const again = await page(`page=2&cursor=${first.nextCursor}`);
    expect(again.items.map((item) => item.recipe.id)).toEqual(ids.slice(24, 48));
    expect((await page('page=9999')).page).toBe(21);
  });
  it('search reaches a recipe beyondpage1, supports Vietnamese accents and ingredient names', async () => {
    const first = await page();
    const later = await page('page=12');
    const title = later.items[0].recipe.title;
    expect(first.items.some((item) => item.recipe.title === title)).toBe(false);
    const exact = await page(`q=${encodeURIComponent(title)}`);
    const plain = title.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd');
    expect(
      (await page(`q=${encodeURIComponent(plain)}`)).items.map((item) => item.recipe.id),
    ).toEqual(exact.items.map((item) => item.recipe.id));
    expect(exact.items.some((item) => item.recipe.title === title)).toBe(true);
    expect((await page('q=trung')).total).toBeGreaterThan(0);
    expect((await page('q=khongcomonnaoday')).total).toBe(0);
  });
  it.each(['japanese', 'korean', 'italian'])(
    'cuisine%s is a hard whole-catalog filter with maxTime20',
    async (cuisine) => {
      const data = await page(`cuisine=${cuisine}&maxTime=20`);
      expect(data.total).toBeGreaterThan(0);
      expect(
        data.items.every(
          (item) => item.recipe.cuisine === cuisine && item.recipe.cookTimeMinutes <= 20,
        ),
      ).toBe(true);
    },
  );
  it('category/region compose with search and exact quantity no-buy', async () => {
    const data = await page('category=mon_canh&region=nam');
    const catalog = db.query<{ id: string }>(
      "SELECT recipe_id AS id FROM recipe_runtime_fields WHERE category='mon_canh' AND region IN ('nam','toan_quoc')",
    );
    expect(data.total).toBe(catalog.length);
    const recipe: Recipe = {
      ...ALL_RECIPES[0],
      id: 'ui03-egg',
      slug: 'ui03-egg',
      title: 'Trứng',
      cookTimeMinutes: 10,
      ingredients: [
        { ingredientId: 'CHICKEN_EGG', name: 'Trứng gà', requiredQuantity: 4, unit: 'piece' },
      ],
    };
    const snapshot = await createRecipeAuthoritySnapshot('static', [recipe]);
    const query = DiscoveryQuerySchema.parse({ noBuy: true });
    expect((await discoverRecipes(env(), auth, snapshot, query)).total).toBe(0);
    const missing = await discoverRecipes(env(), auth, snapshot, DiscoveryQuerySchema.parse({}));
    expect(missing.items[0]).toMatchObject({
      canCookWithoutBuying: false,
      missingRequiredIngredientCount: 1,
      matchPercentage: 100, // Ingredient coverage stays distinct from enough quantity.
    });
    db.seed("UPDATE inventory_items SET quantity=4, version=version+1 WHERE id='ui03-eggs'");
    expect(
      (await discoverRecipes(env(), auth, snapshot, query)).items[0].canCookWithoutBuying,
    ).toBe(true);
  });
  it('stock/version changes reject cursor409 and unfenced restart computes new results', async () => {
    const first = await page();
    db.seed("UPDATE inventory_items SET quantity=3, version=version+1 WHERE id='ui03-eggs'");
    const stale = await request(`page=2&cursor=${first.nextCursor}`);
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ code: 'DISCOVERY_SNAPSHOT_CHANGED' });
    expect((await page()).snapshot).not.toBe(first.snapshot);
  });
  it('actual catalog source/filter/page-size/household changes reject cursors instead of mixing snapshots', async () => {
    const first = await page();
    for (const query of ['cuisine=japanese&', 'pageSize=3&']) {
      const stale = await request(`${query}page=2&cursor=${first.nextCursor}`);
      expect(stale.status).toBe(409);
    }
    expect(
      (await request(`page=2&cursor=${first.nextCursor}`, { RECIPE_CATALOG_MODE: 'static' }))
        .status,
    ).toBe(409);
    token = await signJwt(
      {
        sub: 'ui03-other',
        hid: 'ui03-other-house',
        typ: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret,
    );
    expect((await request(`page=2&cursor=${first.nextCursor}`)).status).toBe(409);
  });
  it.each([
    'page=0',
    'page=01',
    'page=1e3',
    'pageSize=25',
    'maxTime=0',
    'noBuy=yes',
    'cuisine=bad',
    'extra=1',
    'cursor=broken',
  ])('rejects malformed query%s', async (query) => {
    const response = await request(query);
    expect(response.status).toBe(400);
  });
  it('rejects cursor target-page mismatch400', async () => {
    const first = await page();
    const response = await request(`page=3&cursor=${first.nextCursor}`);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'DISCOVERY_CURSOR_INVALID' });
  });
  it('uses strict stock reads: D1 read failure503 despite populated legacy KV', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    db.hooks.beforeStatement = (event) => {
      if (event.sql.includes('FROM inventory_items')) throw new Error('D1 unavailable');
    };
    const get = vi
      .fn()
      .mockResolvedValue([{ ingredientId: 'CHICKEN_EGG', quantity: 100, unit: 'piece' }]);
    const response = await request('', { CACHE: { get } as unknown as Env['CACHE'] });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'DATABASE_UNAVAILABLE' });
    expect(get).not.toHaveBeenCalled();
  });
  it('requires authentication, membership and expected session owner', async () => {
    const anonymous = await app.fetch(new Request('https://ui03.local/recipe-discovery'), env());
    expect(anonymous.status).toBe(401);
    expect(
      (
        await request(
          '',
          {},
          {
            'X-Frigo-Expected-User-Id': 'ui03-other',
            'X-Frigo-Expected-Household-Id': 'ui03-other-house',
          },
        )
      ).status,
    ).toBe(403);
    token = await signJwt(
      {
        sub: 'ui03-user',
        hid: 'ui03-other-house',
        typ: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret,
    );
    expect((await request()).status).toBe(403);
  });
  it('old recommendations still return full content and use unchanged legacy ranker', async () => {
    const response = await app.fetch(
      new Request('https://ui03.local/recommendations', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      { ...env(), RECIPE_CATALOG_MODE: 'static' },
    );
    const json = (await response.json()) as {
      recommendations: Array<{ recipe: Recipe; matchPercentage: number }>;
    };
    expect(json.recommendations).toHaveLength(71);
    const expected = evaluateRecipeMatch(ALL_RECIPES[0], {
      inventory: [
        {
          id: 'ui03-eggs',
          ingredientId: 'CHICKEN_EGG',
          quantity: 2,
          unit: 'piece',
          freshness: 'fresh',
        },
      ],
    });
    expect(
      json.recommendations.find((item) => item.recipe.id === expected.recipe.id)?.matchPercentage,
    ).toBe(expected.matchPercentage);
    expect(
      json.recommendations.every(
        (item) => item.recipe.ingredients.length && item.recipe.steps.length,
      ),
    ).toBe(true);
  });
});
