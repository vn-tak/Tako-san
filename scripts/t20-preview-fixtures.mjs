// Imported only by the isolated Node preview. No remote database or provider is used.
import { PREVIEW_HOUSEHOLD_ID } from './planner-preview-fixtures.mjs';

export function seedT20Preview(db) {
  db.execute(`INSERT INTO inventory_items
    (id, household_id, ingredient_id, name, quantity, unit, category, storage, version)
    VALUES (?, ?, 'RICE', 'Gạo', 220, 'g', 'grain', 'pantry', 1)`,
  ['t20-preview-rice', PREVIEW_HOUSEHOLD_ID]);
}

export function t20RestrictionFixture(db, request) {
  if (request.method !== 'POST') return null;
  const cases = {
    forbidden: { forbiddenIngredientIds: ['RICE', 'CHICKEN_EGG'] },
    dietary: { requiredDietaryTags: ['vegetarian'] },
    nutrition: { mealNutritionTargets: [{ nutrient: 'proteinG', max: 80, hard: true }] },
  };
  const name = new URL(request.url).pathname.replace('/__preview/t20/restrictions/', '');
  if (!Object.hasOwn(cases, name)) return null;
  db.execute(`INSERT INTO household_ranking_preferences (household_id, values_json, updated_at)
    VALUES (?, ?, ?) ON CONFLICT(household_id) DO UPDATE SET values_json = excluded.values_json, updated_at = excluded.updated_at`,
  [PREVIEW_HOUSEHOLD_ID, JSON.stringify({ version: 1, values: cases[name] }), new Date().toISOString()]);
  return Response.json({ fixture: name }, { headers: { 'Cache-Control': 'no-store' } });
}
