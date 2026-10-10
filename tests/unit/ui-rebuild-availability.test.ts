import { describe, expect, it } from 'vitest';
import {
  evaluateRecipeMatch,
  rankRecipes,
  type Recipe,
  type RecipeScoringContext,
} from '@frigo/recipes';

const recipe: Recipe = {
  id: 'quantity-proof',
  slug: 'quantity-proof',
  title: 'Eggs',
  description: '',
  cuisine: 'vietnamese',
  cookTimeMinutes: 10,
  servings: 2,
  difficulty: 'easy',
  imageUrl: '',
  tags: [],
  steps: [],
  ingredients: [{ ingredientId: 'CHICKEN_EGG', name: 'Eggs', requiredQuantity: 4, unit: 'piece' }],
};
const egg = (
  quantity: number,
  id = 'eggs',
): RecipeScoringContext['inventory'][number] & { id: string } => ({
  id,
  ingredientId: 'CHICKEN_EGG',
  quantity,
  unit: 'piece',
  freshness: 'fresh',
});

describe('UI rebuild: quantity proof before no-buy claims', () => {
  it('keeps type match at 100% but rejects 2 eggs for a 4-egg dish', () => {
    const result = evaluateRecipeMatch(recipe, { inventory: [egg(2)] });
    expect(result.matchPercentage).toBe(100);
    expect(result.canCookWithoutBuying).toBe(false);
    expect(result.missingRequiredIngredients).toHaveLength(1);
    expect(rankRecipes([recipe], { inventory: [egg(2)], onlyNoBuyNeeded: true })).toEqual([]);
  });
  it('sums compatible lots instead of taking the last one', () => {
    expect(
      evaluateRecipeMatch(recipe, { inventory: [egg(2, 'a'), egg(2, 'b')] }).canCookWithoutBuying,
    ).toBe(true);
  });
  it('does not count duplicated lot IDs twice or trust conflicting duplicates', () => {
    expect(evaluateRecipeMatch(recipe, { inventory: [egg(2), egg(2)] }).canCookWithoutBuying).toBe(
      false,
    );
    expect(evaluateRecipeMatch(recipe, { inventory: [egg(2), egg(4)] }).canCookWithoutBuying).toBe(
      false,
    );
  });
  it('does not infer equivalent contents from a contextual pack label', () => {
    const packs: Recipe = { ...recipe, ingredients: [{ ...recipe.ingredients[0], unit: 'pack' }] };
    expect(
      evaluateRecipeMatch(packs, { inventory: [{ ...egg(4), unit: 'pack' }] }).canCookWithoutBuying,
    ).toBe(false);
  });
  it('does not double-spend stock between repeated required lines', () => {
    const repeated: Recipe = {
      ...recipe,
      ingredients: [recipe.ingredients[0], recipe.ingredients[0]],
    };
    expect(evaluateRecipeMatch(repeated, { inventory: [egg(4)] }).canCookWithoutBuying).toBe(false);
  });
  it('ignores optional shortages and preserves exact physical conversion', () => {
    const physical: Recipe = {
      ...recipe,
      ingredients: [
        { ingredientId: 'PORK_BELLY', name: 'Pork', requiredQuantity: 300, unit: 'g' },
        { ...recipe.ingredients[0], isOptional: true },
      ],
    };
    expect(
      evaluateRecipeMatch(physical, {
        inventory: [{ ingredientId: 'PORK_BELLY', quantity: 0.3, unit: 'kg', freshness: 'fresh' }],
      }).canCookWithoutBuying,
    ).toBe(true);
  });
});
