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
