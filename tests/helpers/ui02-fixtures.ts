import type { RecipeMatchResult } from '@frigo/recipes';
import { PlanCompositionsDtoSchema } from '../../packages/domain/src/meal-composition-api';
import { hookPlan } from './planner-hook-fixtures';

export function homeComposition(plan = hookPlan(), titles = ['Canh rau', 'Cơm']) {
  return PlanCompositionsDtoSchema.parse({
    schemaVersion: 1,
    planId: plan.id,
    planRevision: plan.revision,
    compositions: plan.intent.slots.map((slot) => ({
      slotId: `${slot.date}:${slot.mealType}:${slot.sequence}`,
      date: slot.date,
      mealType: slot.mealType,
      servings: 2,
      source: 'v2',
      mode: 'manual',
      components: titles.map((title, ordinal) => ({
        id: `dish-${ordinal}`,
        kind: 'recipe',
        role: 'main',
        ordinal,
        locked: true,
        provenance: 'manual',
        recipeId: `recipe-${ordinal}`,
        simpleFoodId: null,
        title,
        permittedRoles: ['main'],
        cookable: true,
        resolvable: true,
        cookTimeMinutes: 10,
        createdRevision: 1,
        updatedRevision: plan.revision,
        projection: null,
      })),
      missingRoles: [],
      recommendedRoles: [],
      warnings: [],
    })),
  });
}

export function discoveryRecipes(count = 55): RecipeMatchResult[] {
  return Array.from({ length: count }, (_, index) => ({
    recipe: {
      id: `recipe-${index}`,
      slug: `mon-${index}`,
      title: `Món ${index}`,
      description: 'Bữa cơm mỗi ngày',
      cuisine: index % 2 ? 'japanese' : 'vietnamese',
      cookTimeMinutes: index % 2 ? 30 : 10,
      servings: 2,
      difficulty: 'easy',
      imageUrl: '',
      tags: ['gia đình'],
      category: 'mon_canh',
      region: 'toan_quoc',
      ingredients: [
        {
          ingredientId: `INGREDIENT_${index}`,
          name: index === 50 ? 'Đậu đỏ' : 'Rau',
          requiredQuantity: 100,
          unit: 'g',
        },
      ],
      steps: [{ stepNumber: 1, instruction: 'Nấu chín' }],
    },
    matchPercentage: 50,
    availableIngredientCount: 0,
    score: 50,
    expiringIngredientsUsed: [],
    canCookWithoutBuying: index % 2 === 0,
    missingRequiredIngredients:
      index % 2 === 0
        ? []
        : [{ ingredientId: `INGREDIENT_${index}`, name: 'Rau', requiredQuantity: 100, unit: 'g' }],
  }));
}

export function homeWeekPlan(): import('@frigo/domain').MealPlan {
  const date = '2030-01-02';
  return {
    id: 'week-plan',
    householdId: 'house-a',
    startDate: date,
    endDate: date,
    status: 'ACTIVE',
    days: [
      {
        id: 'day',
        planId: 'week-plan',
        date,
        dayOfWeek: 3,
        dayNameVi: 'Thứ tư',
        dayType: 'cooking',
        slots: [
          {
            id: 'week-meal',
            dayId: 'day',
            planId: 'week-plan',
            date,
            dayOfWeek: 3,
            slotType: 'dinner',
            status: 'PLANNED',
            recipe: discoveryRecipes(1)[0].recipe,
            servings: 2,
            source: 'AUTO',
            availabilityPercent: 50,
            incrementalCostVnd: 0,
            rescuedExpiringIngredients: [],
            badges: [],
            ingredients: [],
          },
        ],
      },
    ],
    budget: {
      targetVnd: 100000,
      estimatedMinVnd: 40000,
      estimatedMaxVnd: 60000,
      status: 'UNDER',
      displayText: 'Ước tính',
    },
    utilization: {
      utilizationPercent: 50,
      plannedItemsCount: 1,
      totalUsableItemsCount: 2,
      highPriorityUsedCount: 0,
    },
    wasteRisk: { level: 'LOW', expiringItemsCount: 0, rescuedItemsCount: 0, displayText: '' },
    shoppingItems: [],
    priorities: [],
    shoppingFrequency: 'once',
    createdAt: '2030-01-01T00:00:00Z',
    updatedAt: '2030-01-01T00:00:00Z',
  };
}
