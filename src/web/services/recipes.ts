import {
  ALL_RECIPES,
  rankRecipes,
  evaluateRecipeMatch,
  type Recipe,
  type RecipeMatchResult,
  type RecipeScoringContext,
} from '@frigo/recipes';
import { getPendingOps } from '../lib/sync';
import type { CookingDeduction } from '../lib/cooking-review';
import type { StandardUnit } from '@frigo/domain';
import { projectCookingInventory } from '../lib/cooking-projection';
import { privateCacheKey, currentPrivateScope } from '../lib/private-session';
import {
  ApiError,
  fetchJson,
  isOffline,
  queueWrite,
  getHouseholdId,
  createClientItemId,
  guardPrivateSession,
} from './http';
import { inventoryApi } from './inventory';

export const recipesApi = {
  getRecommendations: async (params?: {
    noBuy?: boolean;
    cuisine?: string;
    category?: string;
    region?: string;
    maxTime?: number;
  }) => {
    const assertCurrent = guardPrivateSession();
    try {
      const query = new URLSearchParams();
      if (params?.noBuy) query.set('noBuy', 'true');
      if (params?.cuisine) query.set('cuisine', params.cuisine);
      if (params?.category) query.set('category', params.category);
      if (params?.region) query.set('region', params.region);
      if (params?.maxTime) query.set('maxTime', String(params.maxTime));

      const res = await fetchJson<{ recommendations: RecipeMatchResult[] }>(
        `/recommendations?${query.toString()}`,
      );
      assertCurrent();
      return res.recommendations;
    } catch (err) {
      assertCurrent();
      if (!isOffline(err)) throw err;
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      let target = ALL_RECIPES;
      if (params?.category) {
        target = target.filter((r) => r.category === params.category);
      }
      if (params?.region) {
        target = target.filter((r) => r.region === params.region || r.region === 'toan_quoc');
      }
      return rankRecipes(target, {
        inventory,
        onlyNoBuyNeeded: params?.noBuy,
        maxCookTimeMinutes: params?.maxTime,
        preferredCuisines: params?.cuisine ? (params.cuisine.split(',') as any) : undefined,
      });
    }
  },

  getRecipeById: async (id: string) => {
    const assertCurrent = guardPrivateSession();
    try {
      const result = await fetchJson<{ recipe: Recipe; match: RecipeMatchResult }>(
        `/recipes/${encodeURIComponent(id)}`,
      );
      assertCurrent();
      return result;
    } catch (err) {
      assertCurrent();
      if (!isOffline(err)) throw err;
      const recipe = ALL_RECIPES.find((r) => r.id === id || r.slug === id);
      if (!recipe) throw err;
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      const match = evaluateRecipeMatch(recipe, { inventory });
      return { recipe, match };
    }
  },

  completeCooking: async (
    recipeId: string,
    deductions: CookingDeduction[],
    commandId = createClientItemId('cook'),
    stockBeforeAttempt?: RecipeScoringContext['inventory'],
  ) => {
    const assertCurrent = guardPrivateSession();
    const hhId = getHouseholdId();
    const scope = currentPrivateScope();
    const path = `/recipes/${encodeURIComponent(recipeId)}/cook/complete`;
    const init = {
      method: 'POST',
      body: JSON.stringify({ deductions, commandId }),
      headers: { 'Idempotency-Key': commandId },
    };
    const queued = () =>
      getPendingOps().find(
        (op) =>
          op.dedupeKey === `cooking:${commandId}` &&
          op.userId === scope.userId &&
          op.householdId === scope.householdId,
      );
    const prior = queued();
    if (prior) {
      if (prior.body !== init.body || prior.path !== path)
        throw new ApiError('http', 'HTTP 409: {"code":"IDEMPOTENCY_CONFLICT"}', 409);
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      return { success: true as const, inventory, pendingSync: true };
    }
    // Capture pre-command stock: a lost response may already have committed remotely.
    const baseline = stockBeforeAttempt ?? (await inventoryApi.getInventory());
    assertCurrent();
    try {
      const res = await fetchJson<{
        success: boolean;
        inventory: Array<{
          id: string;
          ingredientId: string;
          quantity: number;
          unit: StandardUnit;
        }>;
      }>(path, init);
      assertCurrent();
      if (
        res?.success !== true ||
        !Array.isArray(res.inventory) ||
        !res.inventory.every(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.ingredientId === 'string' &&
            typeof item.quantity === 'number' &&
            Number.isFinite(item.quantity) &&
            item.quantity >= 0 &&
            ['g', 'kg', 'ml', 'l', 'piece', 'pack', 'bunch', 'slice'].includes(item.unit),
        )
      )
        throw new Error('Cooking response could not be confirmed');
      localStorage.setItem(privateCacheKey('inventory', hhId), JSON.stringify(res.inventory));
      return { ...res, pendingSync: false };
    } catch (err) {
      assertCurrent();
      if (!isOffline(err)) throw err;
      const concurrent = queued();
      if (concurrent) {
        if (concurrent.body !== init.body || concurrent.path !== path)
          throw new ApiError('http', 'HTTP 409: {"code":"IDEMPOTENCY_CONFLICT"}', 409);
        const inventory = await inventoryApi.getInventory();
        assertCurrent();
        return { success: true as const, inventory, pendingSync: true };
      }
      queueWrite(path, 'POST', init.body, 'Hoàn tất bữa nấu', `cooking:${commandId}`, init.headers);
      if (!queued()) throw new Error('Cooking operation could not be saved locally');
      const updated = projectCookingInventory(
        baseline.filter((lot): lot is typeof lot & { id: string } => typeof lot.id === 'string'),
        deductions,
      );
      localStorage.setItem(privateCacheKey('inventory', hhId), JSON.stringify(updated));
      return { success: true as const, inventory: updated, pendingSync: true };
    }
  },
};
