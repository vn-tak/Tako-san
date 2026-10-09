import { describe, it, expect } from 'vitest';
import { evaluateRecipeMatch, rankRecipes, ALL_RECIPES } from '../../packages/recipes/src/index';

describe('Recipe Engine - Deterministic Matching & Scoring', () => {
  it('should rank recipes based on inventory availability', () => {
    // Inventory with Eggs and Tomatoes
    const context = {
      inventory: [
        {
          ingredientId: 'CHICKEN_EGG',
          quantity: 4,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'TOMATO',
          quantity: 3,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'SCALLION',
          quantity: 1,
          unit: 'bunch' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'COOKING_OIL',
          quantity: 50,
          unit: 'ml' as const,
          freshness: 'fresh' as const,
        },
      ],
      preferredCuisines: ['vietnamese' as const],
    };

    const ranked = rankRecipes(ALL_RECIPES, context);
    expect(ranked.length).toBeGreaterThan(0);

    // Top recipe should match available ingredients
    const top = ranked[0];
    expect(top.matchPercentage).toBe(100);
    // Type coverage does not establish the contents of a contextual bunch.
    expect(top.canCookWithoutBuying).toBe(false);
    expect(
      evaluateRecipeMatch(top.recipe, context).ingredientAvailability?.some(
        (item) => item.unit === 'bunch' && item.status === 'unresolved',
      ),
    ).toBe(true);
  });

  it('should correctly prioritize ingredients marked as expiring (Expiry Priority)', () => {
    // Pork belly is expiring, Eggs are fresh
    const contextWithExpiring = {
      inventory: [
        {
          ingredientId: 'PORK_BELLY',
          quantity: 400,
          unit: 'g' as const,
          freshness: 'expiring' as const,
        },
        {
          ingredientId: 'CHICKEN_EGG',
          quantity: 4,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'TOMATO',
          quantity: 4,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'GARLIC',
          quantity: 1,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'FISH_SAUCE',
          quantity: 50,
          unit: 'ml' as const,
          freshness: 'fresh' as const,
        },
      ],
    };

    const porkRecipe = ALL_RECIPES.find((r) => r.slug === 'thit-kho-trung')!;
    const evaluatedPork = evaluateRecipeMatch(porkRecipe, contextWithExpiring);
    expect(evaluatedPork.expiringIngredientsUsed).toContain('Thịt ba chỉ');
    expect(evaluatedPork.score).toBeGreaterThan(70);
  });

  it('should filter strictly with "Không mua thêm gì" (onlyNoBuyNeeded)', () => {
    // User only has Eggs and Tomatoes, missing pork belly
    const context = {
      inventory: [
        {
          ingredientId: 'CHICKEN_EGG',
          quantity: 2,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'TOMATO',
          quantity: 2,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'SCALLION',
          quantity: 1,
          unit: 'bunch' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'COOKING_OIL',
          quantity: 20,
          unit: 'ml' as const,
          freshness: 'fresh' as const,
        },
      ],
      onlyNoBuyNeeded: true,
    };

    const results = rankRecipes(ALL_RECIPES, context);
    for (const res of results) {
      expect(res.canCookWithoutBuying).toBe(true);
      expect(res.missingRequiredIngredients.length).toBe(0);
    }
  });

  it('does not treat incompatible inventory units as recipe coverage', () => {
    const recipe = ALL_RECIPES.find((r) => r.slug === 'thit-kho-trung')!;
    const result = evaluateRecipeMatch(recipe, {
      inventory: [
        {
          ingredientId: 'PORK_BELLY',
          quantity: 2,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
        {
          ingredientId: 'CHICKEN_EGG',
          quantity: 4,
          unit: 'piece' as const,
          freshness: 'fresh' as const,
        },
      ],
    });

    expect(
      result.missingRequiredIngredients.some((item) => item.ingredientId === 'PORK_BELLY'),
    ).toBe(true);
    expect(result.canCookWithoutBuying).toBe(false);
  });
});
