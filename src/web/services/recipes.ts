import { ALL_RECIPES, rankRecipes, evaluateRecipeMatch, type Recipe, type RecipeMatchResult } from '@frigo/recipes';
import { projectCookingInventory } from '../lib/cooking-projection';
import { privateCacheKey } from '../lib/private-session';
import { fetchJson, isOffline, queueWrite, getHouseholdId, createClientItemId, guardPrivateSession } from './http';
import { inventoryApi } from './inventory';

export const recipesApi = {
  getRecommendations: async (params?: { noBuy?: boolean; cuisine?: string; category?: string; region?: string; maxTime?: number }) => {
    const assertCurrent = guardPrivateSession();
    try {
      const query = new URLSearchParams();
      if (params?.noBuy) query.set('noBuy', 'true');
      if (params?.cuisine) query.set('cuisine', params.cuisine);
      if (params?.category) query.set('category', params.category);
      if (params?.region) query.set('region', params.region);
      if (params?.maxTime) query.set('maxTime', String(params.maxTime));

      const res = await fetchJson<{ recommendations: RecipeMatchResult[] }>(`/recommendations?${query.toString()}`);
      assertCurrent();
      return res.recommendations;
    } catch (err) {
      assertCurrent();
      if (!isOffline(err)) throw err;
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      let target = ALL_RECIPES;
      if (params?.category) {
        target = target.filter(r => r.category === params.category);
      }
      if (params?.region) {
        target = target.filter(r => r.region === params.region || r.region === 'toan_quoc');
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
      const result = await fetchJson<{ recipe: Recipe; match: RecipeMatchResult }>(`/recipes/${encodeURIComponent(id)}`);
      assertCurrent();
      return result;
    } catch (err) {
      assertCurrent();
      if (!isOffline(err)) throw err;
      const recipe = ALL_RECIPES.find(r => r.id === id || r.slug === id);
      if (!recipe) throw err;
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      const match = evaluateRecipeMatch(recipe, { inventory });
      return { recipe, match };
    }
  },

  completeCooking: async (recipeId: string, deductions: any[], commandId = createClientItemId('cook')) => {
    const assertCurrent = guardPrivateSession();
    const hhId = getHouseholdId();
    const path = `/recipes/${recipeId}/cook/complete`;
    const init = {
      method: 'POST',
      body: JSON.stringify({ deductions, commandId }),
      headers: { 'Idempotency-Key': commandId },
    };
    try {
      const res = await fetchJson<any>(path, init);
      assertCurrent();
      if (res && res.inventory) {
        localStorage.setItem(privateCacheKey('inventory', hhId), JSON.stringify(res.inventory));
      }
      return res;
    } catch (err) {
      assertCurrent();
      if (!isOffline(err)) throw err;
      queueWrite(
        path,
        'POST',
        init.body,
        'Hoàn tất bữa nấu',
        `cooking:${commandId}`,
        init.headers
      );
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      const updated = projectCookingInventory(inventory, deductions);
      localStorage.setItem(privateCacheKey('inventory', hhId), JSON.stringify(updated));
      return { success: true, inventory: updated, pendingSync: true };
    }
  },
};
