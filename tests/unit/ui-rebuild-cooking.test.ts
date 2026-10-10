// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { recipesApi } from '../../src/web/services/recipes';
import { useCookingStore } from '../../src/web/stores/useCookingStore';
import type { Recipe } from '@frigo/recipes';

const stock = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock('../../src/web/services/inventory', () => ({ inventoryApi: { getInventory: stock.read } }));
const inventory = [
  {
    id: 'a',
    ingredientId: 'PORK_BELLY',
    quantity: 250,
    unit: 'g' as const,
    freshness: 'fresh' as const,
  },
  {
    id: 'b',
    ingredientId: 'PORK_BELLY',
    quantity: 0.5,
    unit: 'kg' as const,
    freshness: 'fresh' as const,
  },
];
const recipe: Recipe = {
  id: 'pork',
  slug: 'pork',
  title: 'Pork',
  description: '',
  cuisine: 'vietnamese',
  cookTimeMinutes: 10,
  servings: 2,
  difficulty: 'easy',
  imageUrl: '',
  tags: [],
  steps: [],
  ingredients: [{ ingredientId: 'PORK_BELLY', name: 'Pork', requiredQuantity: 500, unit: 'g' }],
};
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('frigo_user_id', 'user');
  localStorage.setItem('frigo_household_id', 'household');
  stock.read.mockResolvedValue(inventory);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
});
afterEach(() => {
  vi.unstubAllGlobals();
  useCookingStore.getState().resetCooking();
});
it('drafts and projects 500g once across two lots when cooking is queued offline', async () => {
  useCookingStore.getState().startCooking(recipe, inventory);
  const draft = useCookingStore.getState().deductions;
  expect(draft[0]).toMatchObject({
    currentQuantity: 750,
    quantityDeducted: 500,
    remainingQuantity: 250,
  });
  const result = await recipesApi.completeCooking(recipe.id, draft, 'multi-lot-cook');
  expect(result.pendingSync).toBe(true);
  expect(result.inventory).toEqual([{ ...inventory[1], quantity: 0.25, pendingSync: true }]);
  expect(inventory[0].quantity).toBe(250);
  expect(inventory[1].quantity).toBe(0.5);
});
it('does not project a guessed conversion for contextual stock', async () => {
  const contextual = [{ ...inventory[0], quantity: 2, unit: 'pack' as const }];
  stock.read.mockResolvedValue(contextual);
  useCookingStore.getState().startCooking(recipe, contextual);
  const draft = useCookingStore.getState().deductions;
  expect(draft[0].quantityDeducted).toBe(0);
  const result = await recipesApi.completeCooking(recipe.id, draft, 'unresolved-cook');
  expect(result.inventory).toEqual(contextual);
});
it('never projects an already queued key twice or accepts a changed queued payload', async () => {
  useCookingStore.getState().startCooking(recipe, inventory);
  const draft = useCookingStore.getState().deductions;
  const first = await recipesApi.completeCooking(recipe.id, draft, 'once-only-cook');
  stock.read.mockResolvedValue(first.inventory);
  const second = await recipesApi.completeCooking(recipe.id, draft, 'once-only-cook');
  expect(second.inventory).toEqual(first.inventory);
  await expect(
    recipesApi.completeCooking(
      recipe.id,
      [{ ...draft[0], quantityDeducted: 100 }],
      'once-only-cook',
    ),
  ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
});
it('projects captured pre-command stock when a response is lost after the server changes stock', async () => {
  useCookingStore.getState().startCooking(recipe, inventory);
  const draft = useCookingStore.getState().deductions;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async () => {
      stock.read.mockResolvedValue([{ ...inventory[1], quantity: 0.25 }]);
      throw new TypeError('Response lost after commit');
    }),
  );
  const result = await recipesApi.completeCooking(
    recipe.id,
    draft,
    'lost-response-cook',
    inventory,
  );
  expect(result.inventory).toEqual([{ ...inventory[1], quantity: 0.25, pendingSync: true }]);
});
it('treats unreadable or malformed success bodies as uncertain failures rather than server success', async () => {
  for (const body of [
    { success: true },
    { inventory },
    { success: false, inventory },
    { success: true, inventory: [null] },
    { success: true, inventory: [{ ...inventory[0], quantity: -1 }] },
  ]) {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    );
    await expect(recipesApi.completeCooking(recipe.id, [], 'malformed-response')).rejects.toThrow(
      /confirmed/,
    );
  }
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.reject(new TypeError('Body lost')) }),
  );
  await expect(recipesApi.completeCooking(recipe.id, [], 'body-loss')).rejects.toThrow('Body lost');
});
it('does not claim pendingSync if the outbox cannot be persisted', async () => {
  const original = Storage.prototype.setItem;
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
    this: Storage,
    key,
    value,
  ) {
    if (key === 'frigo_sync_outbox_v1') throw new Error('Quota');
    original.call(this, key, value);
  });
  try {
    await expect(recipesApi.completeCooking(recipe.id, [], 'storage-failed-cook')).rejects.toThrow(
      /saved locally/,
    );
  } finally {
    spy.mockRestore();
  }
});

it('concurrent same-key network failures keep one outbox operation and project use once', async () => {
  useCookingStore.getState().startCooking(recipe, inventory);
  const draft = useCookingStore.getState().deductions;
  const readCache = () => {
    const cached = localStorage.getItem('frigo_cache_v2:user:household:inventory');
    return Promise.resolve(cached ? JSON.parse(cached) : inventory);
  };
  stock.read.mockImplementation(readCache);
  let failFirst!: (error: Error) => void;
  let failSecond!: (error: Error) => void;
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            failFirst = reject;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            failSecond = reject;
          }),
      ),
  );
  const first = recipesApi.completeCooking(recipe.id, draft, 'concurrent-cook', inventory);
  const second = recipesApi.completeCooking(recipe.id, draft, 'concurrent-cook', inventory);
  failFirst(new TypeError('offline'));
  const firstResult = await first;
  failSecond(new TypeError('offline'));
  const secondResult = await second;
  expect(secondResult.inventory).toEqual(firstResult.inventory);
  expect(secondResult.inventory).toEqual([{ ...inventory[1], quantity: 0.25, pendingSync: true }]);
  const queued = JSON.parse(localStorage.getItem('frigo_sync_outbox_v1')!);
  expect(queued).toHaveLength(1);
});
