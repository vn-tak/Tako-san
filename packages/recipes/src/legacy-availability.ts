import {
  buildInventoryAvailability,
  createAvailabilitySession,
  type IngredientAvailability,
  type InventoryAvailabilityIndex,
} from '@frigo/domain';
import type { Recipe, RecipeScoringContext } from './types';

export interface RecipeIngredientAvailability extends IngredientAvailability {
  name: string;
  isOptional: boolean;
}

/** Quantity evidence only; expiry and dietary eligibility stay with their existing policies. */
export function createRecipeAvailabilityIndex(
  recipes: readonly Pick<Recipe, 'ingredients'>[],
  inventory: RecipeScoringContext['inventory'],
): InventoryAvailabilityIndex {
  const realIds = new Set(inventory.flatMap((item) => (item.id ? [item.id] : [])));
  const rows = inventory.map((item, index) => {
    let id = item.id ?? `legacy-row-${index}`;
    while (!item.id && realIds.has(id)) id = `_${id}`;
    return {
      id,
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unit: item.unit,
      freshness: item.freshness,
    };
  });
  return buildInventoryAvailability(rows, {
    ingredientIds: [
      ...new Set(recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.ingredientId))),
    ],
    // No expiry dates are projected, so this reference date cannot alter stock.
    asOfDate: '1970-01-01',
  });
}

export function evaluateRecipeAvailability(
  recipe: Recipe,
  inventory: RecipeScoringContext['inventory'],
  index = createRecipeAvailabilityIndex([recipe], inventory),
): RecipeIngredientAvailability[] {
  const session = createAvailabilitySession(index);
  const result: RecipeIngredientAvailability[] = [];
  for (const optional of [false, true]) {
    recipe.ingredients.forEach((ingredient, line) => {
      if (Boolean(ingredient.isOptional) !== optional) return;
      result[line] = {
        ...session.take(ingredient),
        name: ingredient.name,
        isOptional: optional,
      };
    });
  }
  return result;
}
