// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_RECIPES, type Recipe } from '@frigo/recipes';
import { webcrypto } from 'node:crypto';
import { discoveryApi } from '../../src/web/services/recipe-discovery';
import { ApiError } from '../../src/web/services/http';
import { privateCacheKey } from '../../src/web/lib/private-session';
import { queryKeys } from '../../src/web/lib/queryKeys';
import { queryClient } from '../../src/web/lib/query-client';
import { invalidateInventoryDependents } from '../../src/web/lib/query-invalidation';
import {
  DiscoveryPageSchema,
  DiscoveryQuerySchema,
} from '../../packages/recipes/src/discovery-contract';
import {
  discoverySnapshot,
  rankDiscovery,
  selectDiscoveryPage,
} from '../../packages/recipes/src/discovery';
import {
  resolveRecipeImage,
  recipeImageErrorHandler,
  RECIPE_IMAGE_PLACEHOLDER,
} from '../../src/web/lib/recipe-media';
import { legacyRecipeImageIssue } from '../../packages/recipes/src/legacy-media-policy';
import {
  readDiscoveryFilters,
  updateDiscoveryFilters,
  resetDiscoveryFilters,
} from '../../src/web/lib/recipe-discovery';
import { discoveryFixture } from '../helpers/ui03-fixtures';
import { discoveryRecipes } from '../helpers/ui02-fixtures';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('frigo_user_id', 'user-a');
  localStorage.setItem('frigo_household_id', 'house-a');
  vi.stubGlobal('crypto', webcrypto);
});
afterEach(() => {
  queryClient.clear();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
const response = () => discoveryFixture(discoveryRecipes(), { pageSize: 3 });

describe('UI03 deterministic discovery', () => {
  it('score ties sort by stable ID regardless of input order', () => {
    const recipes = discoveryRecipes(3).map((match) => ({
      ...match.recipe,
      cuisine: 'vietnamese' as const,
      cookTimeMinutes: 10,
    }));
    const query = DiscoveryQuerySchema.parse({});
    expect(rankDiscovery(recipes, [], query).map((match) => match.recipe.id)).toEqual(
      rankDiscovery([...recipes].reverse(), [], query).map((match) => match.recipe.id),
    );
  });
  it('quantity availability combines compatible lots, reserves duplicate demands and never assumes bunch mass', () => {
    const base: Recipe = {
      ...ALL_RECIPES[0],
      id: 'test',
      slug: 'test',
      ingredients: [
        { ingredientId: 'CHICKEN_EGG', name: 'Trứng', requiredQuantity: 4, unit: 'piece' },
      ],
    };
    const query = DiscoveryQuerySchema.parse({ noBuy: true });
    expect(
      rankDiscovery(
        [base],
        [{ id: 'a', ingredientId: 'CHICKEN_EGG', quantity: 2, unit: 'piece' }],
        query,
      ),
    ).toHaveLength(0);
    const inventory = ['a', 'b'].map((id) => ({
      id,
      ingredientId: 'CHICKEN_EGG',
      quantity: 2,
      unit: 'piece' as const,
    }));
    expect(rankDiscovery([base], inventory, query)).toHaveLength(1);
    expect(
      rankDiscovery(
        [{ ...base, ingredients: [...base.ingredients, ...base.ingredients] }],
        inventory,
        query,
      ),
    ).toHaveLength(0);
    expect(
      rankDiscovery(
        [
          {
            ...base,
            ingredients: [
              { ingredientId: 'SCALLION', name: 'Hành lá', requiredQuantity: 1, unit: 'bunch' },
            ],
          },
        ],
        [{ ingredientId: 'SCALLION', quantity: 100, unit: 'g' }],
        query,
      ),
    ).toHaveLength(0);
  });
  it('witness ignores inventory row order/page and normalized accent search but binds versions and full catalog identity', async () => {
    const input = {
      source: 'server:d1',
      catalogFingerprint: 'a'.repeat(64),
      userId: 'user-a',
      householdId: 'house-a',
      inventory: [
        { id: 'b', ingredientId: 'RICE', quantity: 10, unit: 'g' as const },
        { id: 'a', ingredientId: 'RICE', quantity: 20, unit: 'g' as const },
      ],
      query: DiscoveryQuerySchema.parse({ q: 'Đậu đỏ' }),
    };
    const witness = await discoverySnapshot(input);
    expect(
      await discoverySnapshot({
        ...input,
        inventory: [...input.inventory].reverse(),
        query: { ...input.query, q: 'dau do', page: 2 },
      }),
    ).toBe(witness);
    expect(await discoverySnapshot({ ...input, catalogFingerprint: 'b'.repeat(64) })).not.toBe(
      witness,
    );
    expect(
      await discoverySnapshot({
        ...input,
        inventory: [...input.inventory, { ...input.inventory[0], id: 'c' }],
      }),
    ).not.toBe(witness);
    const ranked = rankDiscovery(ALL_RECIPES, [], DiscoveryQuerySchema.parse({}));
    expect(() =>
      selectDiscoveryPage(
        ranked,
        DiscoveryQuerySchema.parse({ page: 2, cursor: `v1.2.${witness}` }),
        'b'.repeat(64),
      ),
    ).toThrow('DISCOVERY_SNAPSHOT_CHANGED');
  });
  it('filter changes/reset drop cursor; page links preserve non-filter URL context', () => {
    const params = new URLSearchParams('q=trung&page=2&cursor=v1.2.aaa&origin=home');
    expect(updateDiscoveryFilters(params, { q: 'rau' }).has('cursor')).toBe(false);
    expect(updateDiscoveryFilters(params, { page: 1 }).has('cursor')).toBe(false);
    expect(resetDiscoveryFilters(params).toString()).toBe('origin=home');
    expect(
      readDiscoveryFilters(updateDiscoveryFilters(params, { page: 3, cursor: 'next' })).cursor,
    ).toBe('next');
  });
  it('strict response rejects hidden full details, inconsistent counts or duplicate rows', () => {
    const good = response();
    expect(DiscoveryPageSchema.safeParse(good).success).toBe(true);
    expect(DiscoveryPageSchema.safeParse({ ...good, total: 0 }).success).toBe(false);
    expect(
      DiscoveryPageSchema.safeParse({
        ...good,
        items: [good.items[0], good.items[0], good.items[2]],
      }).success,
    ).toBe(false);
    expect(
      DiscoveryPageSchema.safeParse({
        ...good,
        items: [
          { ...good.items[0], recipe: { ...good.items[0].recipe, ingredients: [] } },
          ...good.items.slice(1),
        ],
      }).success,
    ).toBe(false);
  });
});

describe('UI03 client/session/source integrity', () => {
  it('validates summary response and sends cookie/expected-owner headers', async () => {
    const mock = vi.fn().mockResolvedValue(json(response()));
    vi.stubGlobal('fetch', mock);
    expect((await discoveryApi.getRecipeDiscovery({ pageSize: 3 })).items).toHaveLength(3);
    const [path, init] = mock.mock.calls[0];
    expect(path).toContain('/api/v1/recipe-discovery?');
    const headers = new Headers(init.headers);
    expect(init.credentials).toBe('include');
    expect(headers.get('X-Frigo-Expected-User-Id')).toBe('user-a');
    expect(headers.get('X-Frigo-Expected-Household-Id')).toBe('house-a');
  });
  it('rejects old household response arriving after scope switch', async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise<Response>((done) => {
          resolve = done;
        }),
      ),
    );
    const pending = discoveryApi.getRecipeDiscovery({ pageSize: 3 });
    localStorage.setItem('frigo_household_id', 'house-b');
    resolve(json(response()));
    await expect(pending).rejects.toMatchObject({ kind: 'auth' });
  });
  it('rejects server response with wrong page size/source without offline substitution', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ...response(), source: 'device' })));
    await expect(discoveryApi.getRecipeDiscovery({ pageSize: 3 })).rejects.toThrow('không hợp lệ');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(response())));
    await expect(discoveryApi.getRecipeDiscovery()).rejects.toThrow('không hợp lệ');
  });
  it('keeps HTTP503 as an error and never substitutes local stock', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ code: 'DATABASE_UNAVAILABLE' }, 503)));
    await expect(discoveryApi.getRecipeDiscovery()).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('offline device results are scoped, paged and source-fenced on reconnect', async () => {
    localStorage.setItem(
      privateCacheKey('inventory'),
      JSON.stringify([
        { id: 'rice', ingredientId: 'RICE', quantity: 500, unit: 'g', freshness: 'fresh' },
      ]),
    );
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const device = await discoveryApi.getRecipeDiscovery();
    expect(device.source).toBe('device');
    expect(device.total).toBe(71);
    expect(device.items).toHaveLength(24);
    const next = await discoveryApi.getRecipeDiscovery({ page: 2, cursor: device.nextCursor! });
    expect(next.items).toHaveLength(24);
    expect(next.snapshot).toBe(device.snapshot);
    expect(
      next.items.every((item) => !device.items.some((prior) => prior.recipe.id === item.recipe.id)),
    ).toBe(true);
    localStorage.setItem(privateCacheKey('inventory'), '[]');
    await expect(
      discoveryApi.getRecipeDiscovery({ page: 2, cursor: device.nextCursor! }),
    ).rejects.toMatchObject({ code: 'DISCOVERY_SNAPSHOT_CHANGED' });
  });
  it('inventory-dependent invalidation includes all discovery pages but remains scope fenced', async () => {
    const a = queryKeys.recipeDiscovery({ page: 2 });
    queryClient.setQueryData(a, response());
    localStorage.setItem('frigo_household_id', 'house-b');
    const b = queryKeys.recipeDiscovery({ pageSize: 3 });
    queryClient.setQueryData(b, response());
    await invalidateInventoryDependents();
    expect(queryClient.getQueryState(a)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(b)?.isInvalidated).toBe(true);
  });
  it('malformed cursor is a recoverable client400 without a network call', async () => {
    vi.stubGlobal('fetch', vi.fn());
    await expect(discoveryApi.getRecipeDiscovery({ cursor: 'broken' })).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('UI03 truthful recipe images', () => {
  it('quarantines generic and exact known mismatches, preserving future corrected paths', () => {
    expect(
      resolveRecipeImage({ id: 'imported', imageUrl: '/frigo/illustrations/delicious-meal.png' })
        .source,
    ).toBe('placeholder');
    for (const id of ['gl-07', 'gl-08', 'gl-09', 'gl-10', 'gl-11', 'gl-12']) {
      const recipe = ALL_RECIPES.find((item) => item.id === id)!;
      expect(legacyRecipeImageIssue(recipe)).toBe('wrong_dish_or_missing_file');
      expect(resolveRecipeImage(recipe).source).toBe('placeholder');
      expect(resolveRecipeImage({ ...recipe, imageUrl: '/future-reviewed.webp' }).source).toBe(
        'legacy_static',
      );
    }
    expect(
      ALL_RECIPES.filter((recipe) => legacyRecipeImageIssue(recipe) === 'unreviewed_photo'),
    ).toHaveLength(59);
  });
  it('ready canonical media overrides quarantine and failed canonical cannot fall to wrong dish', () => {
    const resolved = resolveRecipeImage({
      id: 'gl-07',
      imageUrl: '/frigo/recipes/global/kimchi-fried-rice.webp',
      media: {
        hero: {
          source: 'canonical_r2',
          url: '/api/v1/recipe-media/gl-07/hero/2',
          width: 640,
          height: 480,
          version: 2,
        },
      },
    });
    expect(resolved.source).toBe('canonical_r2');
    expect(resolved.fallbackSrc).toBe(RECIPE_IMAGE_PLACEHOLDER);
    const image = document.createElement('img');
    image.src = resolved.src;
    recipeImageErrorHandler(resolved.fallbackSrc)({ currentTarget: image });
    expect(image.getAttribute('src')).toBe(RECIPE_IMAGE_PLACEHOLDER);
    expect(image.alt).toBe('Chưa có ảnh món ăn');
  });
});
