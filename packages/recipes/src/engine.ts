import { Recipe, RecipeScoringContext, RecipeMatchResult, RecipeIngredient } from './types';
import { tryConvertUnit, type InventoryAvailabilityIndex } from '@frigo/domain';
import { createRecipeAvailabilityIndex, evaluateRecipeAvailability } from './legacy-availability';

export function evaluateRecipeMatch(
  recipe: Recipe,
  context: RecipeScoringContext,
  index?: InventoryAvailabilityIndex,
): RecipeMatchResult {
  const ingredientAvailability = evaluateRecipeAvailability(recipe, context.inventory, index);
  const requiredIngredients = recipe.ingredients.filter((i) => !i.isOptional);
  const totalRequired = requiredIngredients.length;
  const requiredAvailability = ingredientAvailability.filter((item) => !item.isOptional);
  // Type coverage remains distinct from proof of enough stock for this dish.
  const matchedRequired = requiredIngredients.filter((ingredient) =>
    context.inventory.some(
      (item) =>
        item.ingredientId === ingredient.ingredientId &&
        item.quantity > 0 &&
        item.freshness !== 'out_of_stock' &&
        tryConvertUnit(item.quantity, item.unit, ingredient.unit) !== null,
    ),
  ).length;
  const sufficientQtyCount = requiredAvailability.filter(
    (item) => item.status === 'satisfied',
  ).length;
  const missingRequiredIngredients: RecipeIngredient[] = requiredIngredients.filter(
    (_item, index) => requiredAvailability[index].status !== 'satisfied',
  );
  const expiringIngredientsUsed = requiredAvailability
    .filter((item) =>
      item.lotsUsed.some((lot) => lot.freshness === 'expiring' || lot.freshness === 'use_soon'),
    )
    .map((item) => item.name);

  // Calculate Match %
  const matchPercentage =
    totalRequired > 0 ? Math.round((matchedRequired / totalRequired) * 100) : 100;

  // 1. Availability Score (35%)
  const availabilityScore = (matchedRequired / (totalRequired || 1)) * 35;

  // 2. Expiry Priority Score (25%)
  let expiryScore = 0;
  if (expiringIngredientsUsed.length > 0) {
    // Proportional to how many expiring ingredients are rescued
    const ratio = Math.min(1, expiringIngredientsUsed.length / 2);
    expiryScore = ratio * 25;
  }

  // 3. Cuisine Preference Score (15%)
  let cuisineScore = 0;
  if (context.preferredCuisines && context.preferredCuisines.length > 0) {
    if (context.preferredCuisines.includes(recipe.cuisine)) {
      cuisineScore = 15;
    }
  } else {
    // Neutral fallback
    cuisineScore = 10;
  }

  // 4. Cooking Time Score (10%)
  let timeScore = 0;
  if (context.maxCookTimeMinutes) {
    timeScore =
      recipe.cookTimeMinutes <= context.maxCookTimeMinutes
        ? 10
        : Math.max(0, 10 - (recipe.cookTimeMinutes - context.maxCookTimeMinutes));
  } else {
    timeScore = recipe.cookTimeMinutes <= 25 ? 10 : 7;
  }

  // 5. Quantity Fit Score (10%)
  const quantityScore = (sufficientQtyCount / (totalRequired || 1)) * 10;

  // 6. Cooking History Score (5%)
  let historyScore = 5;
  if (context.recentCookedRecipeIds && context.recentCookedRecipeIds.includes(recipe.id)) {
    historyScore = 1; // Minor penalty to encourage recipe variety
  }

  const totalScore = Math.min(
    100,
    Math.round(
      availabilityScore + expiryScore + cuisineScore + timeScore + quantityScore + historyScore,
    ),
  );

  const canCookWithoutBuying = missingRequiredIngredients.length === 0;

  return {
    recipe,
    score: totalScore,
    matchPercentage,
    availableIngredientCount: matchedRequired,
    missingRequiredIngredients,
    expiringIngredientsUsed,
    canCookWithoutBuying,
    ingredientAvailability,
  };
}

export function rankRecipes(recipes: Recipe[], context: RecipeScoringContext): RecipeMatchResult[] {
  const index = createRecipeAvailabilityIndex(recipes, context.inventory);
  const evaluated = recipes.map((recipe) => {
    // List responses keep the existing summary payload; detail owns per-lot evidence.
    const { ingredientAvailability: _availability, ...summary } = evaluateRecipeMatch(
      recipe,
      context,
      index,
    );
    return summary;
  });

  let filtered = evaluated;
  if (context.onlyNoBuyNeeded) {
    filtered = filtered.filter((item) => item.canCookWithoutBuying);
  }

  // Sort descending by score, then by matchPercentage, then by cookTime asc
  return filtered.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return a.recipe.cookTimeMinutes - b.recipe.cookTimeMinutes;
  });
}
