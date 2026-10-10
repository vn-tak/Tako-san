import { describe, expect, it } from 'vitest';
import { MealPlanDtoSchema } from '../../packages/domain/src/meal-planning-api';
import {
  calendarLabel,
  presentCanonicalHome,
  presentLegacyHome,
  type CompositionEvidence,
} from '../../src/web/lib/home-plan';
import { isKitchenSurface } from '../../src/web/components/layout/AppLayout';
import {
  filterDiscoveryResults,
  pageDiscoveryResults,
  readDiscoveryFilters,
  resetDiscoveryFilters,
  updateDiscoveryFilters,
} from '../../src/web/lib/recipe-discovery';
import { hookPlan } from '../helpers/planner-hook-fixtures';
import { discoveryRecipes, homeComposition, homeWeekPlan } from '../helpers/ui02-fixtures';

const now = new Date('2030-01-01T16:00:00Z');
describe('Home canonical presentation', () => {
  it('keeps tomorrow distinct and links to canonical slot detail', () => {
    const plan = hookPlan();
    const view = presentCanonicalHome(plan, now, { kind: 'ready', data: homeComposition(plan) });
    expect(calendarLabel(view.meal!.date, view.today)).toBe('Ngày mai');
    expect(view.meal).toMatchObject({
      dishes: ['Canh rau', 'Cơm'],
      state: 'ready',
      cookTimeMinutes: null,
    });
    expect(view.meal!.href).toBe(`/planner/${plan.id}/meal/2030-01-02%3Adinner%3A0`);
    expect(view.planned).toBe(1);
    expect(view.budgetText).toBeUndefined();
  });
  it('uses the plan fixed offset across midnight, rather than the device date', () => {
    const plan = hookPlan();
    plan.intent.utcOffsetMinutes = 540;
    const view = presentCanonicalHome(plan, now, { kind: 'legacy' });
    expect(view.today).toBe('2030-01-02');
    expect(calendarLabel(view.meal!.date, view.today)).toBe('Hôm nay');
  });
  it.each(['pending', 'error', 'mismatch'] as const)('withholds V1 during %s', (kind) => {
    const view = presentCanonicalHome(hookPlan(), now, { kind });
    expect(view.meal!.dishes).toEqual([]);
    expect(view.meal!.state).toBe(kind === 'pending' ? 'pending' : 'error');
    expect(view.planned).toBeNull();
  });
  it.each([-1, 1])('rejects composition from another revision (%s)', (difference) => {
    const plan = hookPlan(2);
    const data = homeComposition(plan);
    data.planRevision += difference;
    const view = presentCanonicalHome(plan, now, { kind: 'ready', data });
    expect(view.meal!.state).toBe('error');
    expect(view.meal!.dishes).toEqual([]);
  });
  it('rejects missing slots or another plan even with the same revision', () => {
    const plan = hookPlan();
    const missing = homeComposition(plan);
    missing.compositions = [];
    const other = homeComposition(plan);
    other.planId = '8195b083-ddb7-462d-90c3-1e3c83cbb59c';
    for (const data of [missing, other]) {
      expect(presentCanonicalHome(plan, now, { kind: 'ready', data }).meal!.state).toBe('error');
    }
  });
  it('an edited originally unplanned slot uses V2 while an empty V2 stays empty', () => {
    const plan = hookPlan();
    plan.result.meals = [];
    expect(
      presentCanonicalHome(plan, now, { kind: 'ready', data: homeComposition(plan) }).meal!.dishes,
    ).toEqual(['Canh rau', 'Cơm']);
    const empty = presentCanonicalHome(plan, now, {
      kind: 'ready',
      data: homeComposition(plan, []),
    });
    expect(empty.meal!.state).toBe('empty');
    expect(empty.planned).toBe(0);
  });
  it('uses family anchors only with explicit V1 projection, never an empty V2', () => {
    const plan = hookPlan();
    plan.result.meals[0].source = {
      kind: 'family',
      id: 'family',
      version: 1,
      variantId: 'exact-variant',
    };
    const data = homeComposition(plan, []);
    data.compositions[0].source = 'v1_projection';
    expect(presentCanonicalHome(plan, now, { kind: 'ready', data }).meal!.dishes).toEqual([
      'Dinner revision 1',
    ]);
    expect(presentCanonicalHome(plan, now, { kind: 'ready', data }).planned).toBe(1);
    data.compositions[0].source = 'v2';
    expect(presentCanonicalHome(plan, now, { kind: 'ready', data }).meal!.state).toBe('empty');
  });
  it('retains legacy compatibility when composition is explicitly unavailable', () => {
    expect(presentCanonicalHome(hookPlan(), now, { kind: 'legacy' }).meal!.dishes).toEqual([
      'Dinner revision 1',
    ]);
  });
  it('does not mistake a past plan for no plan', () => {
    const view = presentCanonicalHome(hookPlan(), new Date('2030-01-03T00:00:00Z'), {
      kind: 'legacy',
    });
    expect(view.id).toBe(hookPlan().id);
    expect(view.meal).toBeNull();
    expect(view.planned).toBe(1);
  });
  it('selects current windows and preserves explicitly late breakfast appointments', () => {
    const original = hookPlan();
    const plan = MealPlanDtoSchema.parse({
      ...original,
      intent: {
        ...original.intent,
        slots: [
          { date: '2030-01-02', mealType: 'breakfast', time: '15:30' },
          { date: '2030-01-02', mealType: 'dinner', time: '18:00' },
        ],
      },
    });
    const evidence: CompositionEvidence = { kind: 'ready', data: homeComposition(plan) };
    expect(
      presentCanonicalHome(plan, new Date('2030-01-02T14:00:00Z'), evidence).meal!.mealType,
    ).toBe('breakfast');
    expect(
      presentCanonicalHome(plan, new Date('2030-01-02T16:00:00Z'), evidence).meal!.mealType,
    ).toBe('dinner');
  });
  it('keeps stock freshness review separate from meal titles', () => {
    const plan = hookPlan();
    plan.freshness.status = 'requires_revalidation';
    expect(presentCanonicalHome(plan, now, { kind: 'legacy' }).requiresReview).toBe(true);
  });
});

describe('discovery URL and whole-result paging', () => {
  it('rejects unsupported enums, unsafe page values and bounds search text', () => {
    const view = readDiscoveryFilters(
      new URLSearchParams(
        `cuisine=bad&category=bad&region=bad&page=-5&noBuy=1&maxTime=999&q=${'a'.repeat(200)}`,
      ),
    );
    expect(view).toEqual({
      q: 'a'.repeat(160),
      cuisine: null,
      category: null,
      region: null,
      page: 1,
      noBuy: false,
      fast: false,
    });
    for (const page of ['0', '1.5', 'Infinity', '10000', '01'])
      expect(readDiscoveryFilters(new URLSearchParams({ page })).page).toBe(1);
  });
  it('restores deep-linked filters and resets page while preserving unrelated params', () => {
    const params = new URLSearchParams(
      'q=canh&cuisine=vietnamese&region=bac&category=mon_canh&noBuy=true&maxTime=20&page=3&origin=home',
    );
    expect(readDiscoveryFilters(params)).toMatchObject({
      q: 'canh',
      cuisine: 'vietnamese',
      noBuy: true,
      fast: true,
      page: 3,
    });
    const updated = updateDiscoveryFilters(params, { q: 'Đậu đỏ' });
    expect(updated.has('page')).toBe(false);
    expect(updated.get('origin')).toBe('home');
    expect(resetDiscoveryFilters(params).toString()).toBe('origin=home');
  });
  it('caps every page at24 and clamps out-of-range after filters', () => {
    const recipes = discoveryRecipes(55);
    expect(pageDiscoveryResults(recipes, 1).items).toHaveLength(24);
    expect(pageDiscoveryResults(recipes, 2).items[0].recipe.id).toBe('recipe-24');
    expect(pageDiscoveryResults(recipes, 9999)).toMatchObject({ page: 3, pages: 3, offset: 48 });
    expect(pageDiscoveryResults([], 5)).toMatchObject({ page: 1, pages: 1, items: [] });
  });
  it('searches accent-insensitive ingredients outside the firstpage', () => {
    const filters = readDiscoveryFilters(new URLSearchParams('q=dau+do'));
    expect(
      filterDiscoveryResults(discoveryRecipes(), filters).map((item) => item.recipe.id),
    ).toEqual(['recipe-50']);
  });
  it('combines filters, accepts national regions and retains no-buy quantity evidence', () => {
    const filters = readDiscoveryFilters(
      new URLSearchParams('noBuy=true&maxTime=20&cuisine=vietnamese&region=nam&category=mon_canh'),
    );
    expect(filterDiscoveryResults(discoveryRecipes(), filters)).toHaveLength(28);
    filters.cuisine = 'japanese';
    expect(filterDiscoveryResults(discoveryRecipes(), filters)).toEqual([]);
  });
  it.each(['/plus', '/me/unrelated', '/settings', '/auth/login', '/planner-old', '/shopping-old', '/week', '/recipes-old', '/inventory/x/other'])(
    'does not scope the new shell onto %s',
    (route) => expect(isKitchenSurface(route)).toBe(false),
  );
  it.each([
    '/',
    '/fridge',
    '/inventory/',
    '/recipes',
    '/recipes/thit-kho',
    '/scan',
    '/scan/x/review',
    '/scan/receipt-review',
    '/planner',
    '/planner/new',
    '/planner/plan-id',
    '/planner/plan-id/meal/slot-id',
    '/planner/plan-id/shopping',
    '/shopping',
  ])('scopes the migrated route %s', (route) => expect(isKitchenSurface(route)).toBe(true));
});

describe('Home Week compatibility', () => {
  it('keeps future Week, exact meal destination and estimated budget', () => {
    const view = presentLegacyHome(homeWeekPlan(), new Date(2030, 0, 1, 16));
    expect(view.meal!.date).toBe('2030-01-02');
    expect(view.meal!.href).toBe('/week/week-plan/meal/week-meal');
    expect(view.budgetText).toContain('Ước tính');
    expect(view.href).toBe('/week/week-plan');
  });
  it.each(['COOKED', 'SKIPPED'] as const)(
    'does not promote a completed %s meal as upcoming',
    (status) => {
      const plan = homeWeekPlan();
      plan.days[0].slots[0].status = status;
      expect(presentLegacyHome(plan, new Date(2030, 0, 1, 16)).meal).toBeNull();
    },
  );
});
