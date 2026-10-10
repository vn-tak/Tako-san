// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { MealPlanDtoSchema, PlanShoppingDtoSchema, type MealPlanDto } from '../../packages/domain/src/meal-planning-api';
import type { MoneyDto } from '../../packages/domain/src/meal-shopping-api';
import { PlannerPage } from '../../src/web/pages/PlannerPage';
import { PlannerWeek } from '../../src/web/features/planner/PlannerWeek';
import { PlannerMeal } from '../../src/web/features/planner/PlannerMeal';
import { PlannerShopping, ShoppingResult } from '../../src/web/features/planner/PlannerShopping';
import { FreshnessNotice, PlannerError, PlannerShell } from '../../src/web/features/planner/PlannerShell';
import { usePlanner } from '../../src/web/features/planner/usePlanner';
import { plannerCopy as copy, type PlannerLocale } from '../../src/web/features/planner/copy';
import { budgetStatusLabel, plannerConclusionLabel, plannerCopy, plannerStatusLabel, reasonLabel } from '../../src/web/features/planner/presentation';
import { queryKeys } from '../../src/web/lib/queryKeys';
import { mealPlanningApi } from '../../src/web/services/meal-planning';
import { ApiError } from '../../src/web/services/http';

type Shopping = z.infer<typeof PlanShoppingDtoSchema>;
const id = '11111111-1111-4111-8111-111111111111';
const date = '2030-01-07';
const instant = `${date}T08:00:00.000Z`;
const slotId = `${date}:dinner:0`;
const quantity = (value: string) => ({ value, unit: 'g' as const });
const money = (minorAmount: string): MoneyDto => ({ currency: 'JPY', minorAmount });

function planFixture(update?: (plan: MealPlanDto) => void): MealPlanDto {
  const plan = MealPlanDtoSchema.parse({
    schemaVersion: 1, id, householdId: 'house-ui', revision: 4, createdAt: instant, updatedAt: instant,
    intent: { startDate: date, horizonDays: 1, utcOffsetMinutes: 0, defaultServings: 2,
      mode: 'shopping_allowed', slots: [{ date, mealType: 'dinner' }] },
    result: {
      status: 'feasible', conclusion: 'feasible',
      planningReference: { instant, localDate: date, utcOffsetMinutes: 0 },
      meals: [{ slotId, date, mealType: 'dinner', time: '18:00', instant: `${date}T18:00:00.000Z`, servings: 2,
        candidateId: 'candidate-ui', source: { kind: 'recipe', id: 'recipe-ui', version: 1, variantId: null },
        title: 'Ginger chicken', cuisine: null, prepTimeMinutes: null, cookTimeMinutes: 25,
        instructions: ['Prepare the measured ingredients.', 'Cook until ready.'],
        requirements: [{ ingredientId: 'CHICKEN_BREAST', optional: false, status: 'satisfied',
          required: quantity('520'), covered: quantity('520'), missing: quantity('0'), reasons: [] }],
        reasons: ['USES_EXPIRING_INGREDIENTS'], safetyAssessment: 'not_requested', projectedConsumption: [] }],
      unplannedSlots: [], search: { exhaustive: true, plannerExhaustive: true, recipeExhaustive: true,
        truncated: false, limitReasons: [], incompleteReasons: [], rejections: [] }, diagnostics: [],
    },
    freshness: { status: 'fresh', reasons: [], checkedAt: instant, requiresRevalidationBeforeConsumption: true },
  });
  update?.(plan);
  return MealPlanDtoSchema.parse(plan);
}

function shoppingFixture(update?: (response: Shopping) => void): Shopping {
  const provenance = [{ slotId, date, candidateId: 'candidate-ui', sourceLineIndices: [0],
    shortageType: 'missing', quantity: quantity('520') }];
  const response = PlanShoppingDtoSchema.parse({
    schemaVersion: 1, planId: id, planRevision: 4, priceAsOf: instant,
    requiresPriceRevalidation: true, catalogStatus: 'available',
    result: {
      schemaVersion: 1, id: 'shopping-ui', mealPlanId: id, currency: 'JPY', currencyMinorDigits: 0,
      priceSnapshot: { id: 'reviewed-test-prices', asOf: instant, requiresRevalidationBeforeAcceptance: true },
      planner: { status: 'feasible', conclusion: 'feasible', truncated: false,
        limitReasons: [], incompleteReasons: [], unplannedSlots: [] },
      shoppingCompleteness: 'complete', shoppingStatus: 'fulfilled',
      requirements: [{ id: 'chicken-demand', ingredientId: 'CHICKEN_BREAST', required: quantity('520'),
        knownRequired: quantity('520'), status: 'known', optional: false, sourceMealSlots: provenance, unresolvedCount: 0 }],
      optionalRequirements: [], unresolvedRequirements: [],
      purchaseLines: [{ requirementId: 'chicken-demand', ingredientId: 'CHICKEN_BREAST', required: quantity('520'),
        sourceMealSlots: provenance, selectedPackages: [{ purchaseOptionId: 'chicken-300', productId: null,
          retailerId: null, packageContent: quantity('300'), packageCount: 2, unitPrice: money('2410'),
          lineCost: money('4820'), availability: 'available', expiry: null }],
        purchased: quantity('600'), surplus: quantity('80'), knownCost: money('4820'), totalCost: money('4820'),
        unknownPricePackageCount: 0, bestKnownCompleteCost: money('4820'), provenMinimumCost: money('4820'),
        reasons: ['LOWEST_KNOWN_COST', 'PURCHASE_SURPLUS'] }],
      cost: { knownCost: money('4820'), totalCost: money('4820'), status: 'known', unknownCostItemCount: 0,
        bestKnownCompleteCost: money('4820'), minimumCost: money('4820'), provenKnownCostLowerBound: money('4820') },
      budget: { status: 'within_budget', selectedKnownGap: money('0'), knownRemaining: money('1180'),
        provenGap: money('0'), replanRecommended: false,
        largestKnownCostDrivers: [{ ingredientId: 'CHICKEN_BREAST', knownCost: money('4820') }],
        ingredientsWithNoCheaperKnownOption: ['CHICKEN_BREAST'], unknownPriceRequirementIds: [] },
      existingInventoryRemainder: [], purchaseSurplus: [{ requirementId: 'chicken-demand', ingredientId: 'CHICKEN_BREAST',
        purchaseOptionId: 'chicken-300', quantity: quantity('80'), risk: { status: 'unknown', confidence: 'unknown',
          expiryDate: null, expiryKind: 'unknown', unusableAtHorizon: false, certainWasteQuantity: null } }],
      wasteSummary: { existingAtRiskLotCount: 0, purchaseAtRiskSurplusCount: 0, unknownRiskItemCount: 1,
        assessedItemCount: 0, coverage: 0, certainWasteQuantity: null },
      optimization: { exhaustive: true, searchExhaustive: true, truncated: false, limitReasons: [], incompleteReasons: [],
        proofScope: 'supplied_comparable_catalog_per_ingredient_package_cost' }, diagnostics: [],
    },
  });
  update?.(response);
  return PlanShoppingDtoSchema.parse(response);
}

const clients: QueryClient[] = [];
function render(ui: ReactNode, initial?: { current?: MealPlanDto | null; shopping?: Shopping }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  clients.push(client);
  if (initial && 'current' in initial) client.setQueryData(queryKeys.currentMealPlanningPlan(), initial.current);
  if (initial?.shopping) client.setQueryData([...queryKeys.mealPlanningShopping(id), 4, 'VND', '', 'hard'], initial.shopping);
  return renderToStaticMarkup(<QueryClientProvider client={client}><StaticRouter location="/planner">{ui}</StaticRouter></QueryClientProvider>);
}

function Week({ plan = planFixture(), locale = 'en', busy = null }: { plan?: MealPlanDto; locale?: PlannerLocale; busy?: string | null }) {
  const model = usePlanner(plan.id, false);
  return <PlannerWeek plan={plan} model={{ ...model, busy }} locale={locale} />;
}
function Meal({ plan = planFixture(), locale = 'en', selectedSlot = slotId }: { plan?: MealPlanDto; locale?: PlannerLocale; selectedSlot?: string }) {
  const model = usePlanner(plan.id, false);
  return <PlannerMeal plan={plan} slotId={selectedSlot} model={model} locale={locale} />;
}
function ShoppingView({ plan = planFixture(), busy = null, error = null }: { plan?: MealPlanDto; busy?: string | null; error?: unknown }) {
  const model = usePlanner(plan.id, false);
  return <PlannerShopping plan={plan} model={{ ...model, busy, error }} locale="en" />;
}
function contains(html: string, text: string) {
  expect(html).toContain(renderToStaticMarkup(<>{text}</>));
}
function costSummary(html: string) {
  const section = html.match(/<section\b[^>]*>[\s\S]*?<\/section>/)?.[0];
  expect(section).toBeDefined();
  return section!;
}

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: () => null });
});
afterEach(() => {
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('planner shell and route states', () => {
  it('announces loading without showing an empty plan or generation action', () => {
    const html = render(<PlannerPage />);
    contains(html, copy.vi.loading);
    expect(html).toContain('role="status"');
    expect(html).not.toContain(copy.vi.emptyText);
  });

  it('offers setup only after a confirmed empty current-plan lookup', () => {
    const html = render(<PlannerPage />, { current: null });
    contains(html, copy.vi.emptyText);
    expect(html).toContain('href="/planner/new"');
    expect(html).not.toContain(copy.vi.loading);
  });

  it.each(['vi', 'en'] as const)('labels %s navigation and links the saved list without a Week redirect loop', (locale) => {
    const html = render(<PlannerShell plan={planFixture()} locale={locale} setLocale={vi.fn()}>Content</PlannerShell>);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(`aria-label="${copy[locale].week}"`);
    expect(html).toContain(`href="/planner/${id}/shopping"`);
    expect(html).toContain('href="/shopping"');
    expect(html).not.toContain('href="/week"');
    contains(html, copy[locale].planNote);
  });

  it.each(['PLAN_REVALIDATION_REQUIRED', 'PLAN_REVISION_CONFLICT', 'SWAP_NOT_FEASIBLE'] as const)('renders actionable %s without raw server details', (code) => {
    const error = new ApiError('http', `HTTP 409: ${JSON.stringify({ code, error: 'PRIVATE SQL failure' })}`, 409);
    const html = render(<PlannerError error={error} locale="en" onRetry={vi.fn()} />);
    expect(html).toContain('role="alert"');
    contains(html, plannerCopy.en.errors[code]);
    contains(html, copy.en.retry);
    expect(html).not.toMatch(/409|PRIVATE SQL/);
  });

  it('explains rate limiting without starting a retry loop', () => {
    const retry = vi.fn();
    const html = render(<PlannerError error={new ApiError('http', 'HTTP 429: rate limit', 429)} locale="en" onRetry={retry} />);
    contains(html, plannerCopy.en.errors.rateLimited);
    expect(retry).not.toHaveBeenCalled();
  });

  it.each(['stale_inventory', 'planning_time_elapsed'] as const)('offers recovery for %s as a text status', (reason) => {
    const plan = planFixture((value) => { value.freshness.status = 'requires_revalidation'; value.freshness.reasons = [reason]; });
    const html = render(<FreshnessNotice plan={plan} locale="en" />);
    contains(html, copy.en.staleTitle);
    contains(html, reason === 'planning_time_elapsed' ? copy.en.historical : copy.en.staleText);
    expect(html).toContain('role="status"');
    expect(html).toContain('href="/planner/new"');
    expect(html).not.toContain(reason);
  });
});

describe('weekly planner semantic rendering', () => {
  it.each(['vi', 'en'] as const)('renders the complete %s meal in a linked mobile-safe card', (locale) => {
    const html = render(<Week locale={locale} />);
    contains(html, plannerStatusLabel('feasible', locale));
    expect(html).toContain('<h3 class=');
    contains(html, 'Ginger chicken');
    expect(html).toContain(`href="/planner/${id}/meal/${encodeURIComponent(slotId)}"`);
    contains(html, `2 ${copy[locale].people}`);
    contains(html, `25 ${copy[locale].minutes}`);
    contains(html, copy[locale].available);
    contains(html, reasonLabel('USES_EXPIRING_INGREDIENTS', locale));
    expect(html).toContain('data-testid="plan-revision">4<');
    expect(html).not.toMatch(/<table|USES_EXPIRING_INGREDIENTS/);
  });

  it.each(['partial', 'infeasible', 'search_limited', 'incomplete'] as const)('preserves %s status and proof distinctions', (status) => {
    const plan = planFixture((value) => {
      value.result.status = status;
      value.result.conclusion = status === 'infeasible' ? 'proven_infeasible' : 'no_plan_found_without_proof';
      if (status !== 'partial') value.result.meals = [];
      value.intent.slots.push({ ...value.intent.slots[0], mealType: 'lunch' });
      value.result.unplannedSlots = [{ slotId: `${date}:lunch:0`, date, mealType: 'lunch', reasons: ['NO_CANDIDATES_FOR_SLOT'] }];
    });
    const html = render(<Week plan={plan} />);
    contains(html, plannerStatusLabel(status, 'en'));
    contains(html, plannerConclusionLabel(plan.result.conclusion, 'en'));
    contains(html, copy.en.unplanned);
    contains(html, reasonLabel('NO_CANDIDATES_FOR_SLOT', 'en'));
    expect(html).toContain('role="status"');
    expect(html).toContain('href="/planner/new"');
    expect(html).not.toMatch(/no_plan_found_without_proof|proven_infeasible|NO_CANDIDATES_FOR_SLOT/);
  });

  it('discloses truncated search and its limit without claiming optimality', () => {
    const plan = planFixture((value) => {
      value.result.search.exhaustive = false;
      value.result.search.plannerExhaustive = false;
      value.result.search.truncated = true;
      value.result.search.limitReasons = ['CANDIDATE_LIMIT_PER_SLOT'];
    });
    const html = render(<Week plan={plan} />);
    contains(html, copy.en.limited);
    contains(html, reasonLabel('CANDIDATE_LIMIT_PER_SLOT', 'en'));
    expect(html).toMatch(/<details[^>]*><summary/);
    expect(html).not.toContain('CANDIDATE_LIMIT_PER_SLOT');
  });

  it('keeps rejected-alternative diagnostics separate from selected meal reasons', () => {
    const plan = planFixture((value) => {
      value.result.search.rejections = [{ slotId, code: 'ALLERGEN_CONFLICT', count: 3 }];
    });
    const html = render(<Week plan={plan} />);
    const details = html.slice(html.indexOf('<details'));
    contains(details, copy.en.rejectionNote);
    contains(details, reasonLabel('ALLERGEN_CONFLICT', 'en'));
    expect(html.slice(0, html.indexOf('<details'))).not.toContain(reasonLabel('ALLERGEN_CONFLICT', 'en'));
  });

  it('does not present an inventory-only eligibility rejection as a confirmed shopping shortage', () => {
    const plan = planFixture((value) => {
      value.result.search.rejections = [{ slotId, code: 'CANDIDATE_MODE', count: 1 }];
    });
    const html = render(<Week plan={plan} />);
    contains(html, 'Not confirmed cookable from current stock in inventory-only mode');
    expect(html).not.toContain('The recipe needs shopping');
  });

  it.each(['missing', 'partial', 'unresolved'] as const)('distinguishes %s required ingredients without client shortage arithmetic', (status) => {
    const plan = planFixture((value) => {
      Object.assign(value.result.meals[0].requirements[0], { status, covered: quantity('120'), missing: status === 'unresolved' ? null : quantity('400') });
    });
    const html = render(<Week plan={plan} />);
    contains(html, status === 'unresolved' ? copy.en.quantityReview : copy.en.needsShopping);
    expect(html).not.toContain(copy.en.available);
  });

  it('does not make an optional missing ingredient a required-shopping failure', () => {
    const plan = planFixture((value) => {
      value.result.meals[0].requirements.push({ ingredientId: 'CORIANDER', optional: true, status: 'missing',
        required: quantity('5'), covered: quantity('0'), missing: quantity('5'), reasons: ['unavailable'] });
    });
    const html = render(<Week plan={plan} />);
    contains(html, copy.en.available);
    expect(html).not.toContain(copy.en.needsShopping);
  });

  it('announces regeneration and disables repeated actions while busy', () => {
    const html = render(<Week busy="regenerate" />);
    contains(html, copy.en.generating);
    expect(html).toContain('role="status"');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*Regenerate plan/);
  });
});

describe('meal detail semantics', () => {
  it.each(['vi', 'en'] as const)('renders %s quantities, instructions, feedback and the return link', (locale) => {
    const html = render(<Meal locale={locale} />);
    expect(html).toContain(`href="/planner/${id}"`);
    contains(html, copy[locale].back);
    contains(html, '520 g');
    expect(html).toContain('<ol ');
    contains(html, 'Prepare the measured ingredients.');
    for (const action of ['swap', 'liked', 'disliked', 'cooked', 'skipped'] as const) contains(html, copy[locale][action]);
    contains(html, copy[locale].cookedNote);
    contains(html, copy[locale].nutrition);
    contains(html, copy[locale].safety);
    expect(html).not.toMatch(/0 kcal|Inventory updated|dangerouslySetInnerHTML|<dialog/);
  });

  it('shows the authoritative missing amount rather than subtracting on the client', () => {
    const plan = planFixture((value) => {
      Object.assign(value.result.meals[0].requirements[0], { status: 'partial', covered: quantity('120'), missing: quantity('400') });
    });
    const html = render(<Meal plan={plan} />);
    contains(html, `${copy.en.missing}: 400 g`);
    contains(html, `${copy.en.covered}: 120 g`);
  });

  it('does not convert unresolved quantity into zero or a fabricated shortage', () => {
    const plan = planFixture((value) => {
      Object.assign(value.result.meals[0].requirements[0], { status: 'unresolved', covered: quantity('0'), missing: null, reasons: ['context_required'] });
    });
    const html = render(<Meal plan={plan} />);
    contains(html, copy.en.unresolved);
    expect(html).not.toContain(`${copy.en.missing}:`);
    expect(html).not.toMatch(/Still needed: (0|520) g/);
  });

  it('keeps unknown cooking time, absent instructions and unknown nutrition explicit', () => {
    const plan = planFixture((value) => { value.result.meals[0].cookTimeMinutes = null; value.result.meals[0].instructions = []; });
    const html = render(<Meal plan={plan} />);
    contains(html, copy.en.unknownTime);
    contains(html, copy.en.noInstructions);
    contains(html, copy.en.nutrition);
    expect(html).not.toMatch(/0 kcal|0 min/);
  });

  it('offers a back link for a slot absent from the current revision', () => {
    const html = render(<Meal selectedSlot="old-slot" />);
    contains(html, copy.en.mealUnavailable);
    expect(html).toContain(`href="/planner/${id}"`);
    expect(html).not.toContain(copy.en.swap);
  });

  it('escapes catalog text and has deterministic explanations without an AI call', () => {
    const explain = vi.spyOn(mealPlanningApi, 'explanation');
    const plan = planFixture((value) => {
      value.result.meals[0].title = '<img src=x onerror=alert(1)>';
      value.result.meals[0].instructions = ['<script>bad()</script>'];
    });
    const html = render(<Meal plan={plan} />);
    contains(html, plan.result.meals[0].title);
    contains(html, plan.result.meals[0].instructions[0]);
    contains(html, reasonLabel('USES_EXPIRING_INGREDIENTS', 'en'));
    expect(html).not.toMatch(/<img|<script/);
    expect(explain).not.toHaveBeenCalled();
  });
});

describe('shopping, budget and uncertainty rendering', () => {
  it.each(['vi', 'en'] as const)('renders %s known complete cost, labelled checklist and package data', (locale) => {
    const html = render(<ShoppingResult response={shoppingFixture()} locale={locale} />);
    const summary = costSummary(html);
    contains(summary, copy[locale].completeTotal);
    contains(html, '2 × 300 g');
    contains(html, `${copy[locale].surplus}: 80 g`);
    expect(html).toMatch(/<label[^>]*><input type="checkbox"/);
    contains(html, copy[locale].checklistNote);
    expect(html).not.toContain('checked=""');
  });

  it.each([
    ['0', '¥0'], ['4820', '¥4,820'],
    ['9007199254740993123456789', '¥9,007,199,254,740,993,123,456,789'],
  ])('renders exact authoritative JPY total %s, not a recomputed package sum', (minorAmount, expected) => {
    const response = shoppingFixture((value) => { value.result.cost.knownCost = money(minorAmount); value.result.cost.totalCost = money(minorAmount); });
    const summary = costSummary(render(<ShoppingResult response={response} locale="en" />));
    contains(summary, expected);
    expect(response.result.cost.totalCost?.minorAmount).toBe(minorAmount);
  });

  it('shows ¥4,820 only as known subtotal when two requirements lack prices', () => {
    const response = shoppingFixture((value) => {
      Object.assign(value.result.cost, { status: 'partial', totalCost: null, unknownCostItemCount: 2, minimumCost: null, bestKnownCompleteCost: null });
      value.result.budget.status = 'unknown';
      value.result.budget.knownRemaining = null;
    });
    const summary = costSummary(render(<ShoppingResult response={response} locale="en" />));
    contains(summary, copy.en.knownTotal);
    contains(summary, '¥4,820');
    contains(summary, `2 ${copy.en.unknownPrices}`);
    contains(summary, budgetStatusLabel('unknown', 'en'));
    expect(summary).not.toContain(copy.en.completeTotal);
    expect(summary).not.toContain('¥0');
  });

  it('does not call complete prices a whole-plan total for a partial plan', () => {
    const response = shoppingFixture((value) => { value.result.shoppingCompleteness = 'partial'; value.result.planner.status = 'partial'; });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(costSummary(html), copy.en.knownTotal);
    contains(html, copy.en.shoppingPartial);
    expect(costSummary(html)).not.toContain(copy.en.completeTotal);
  });

  it('does not confuse fully known prices with confirmed purchase availability', () => {
    const response = shoppingFixture((value) => {
      value.result.shoppingStatus = 'unknown';
      value.result.purchaseLines[0].selectedPackages[0].availability = 'unknown';
    });
    const summary = costSummary(render(<ShoppingResult response={response} locale="en" />));
    contains(summary, '¥4,820');
    contains(summary, 'Purchase availability unknown');
    expect(summary).not.toContain(plannerCopy.en.shopping.fulfilled);
  });

  it.each(['within_budget', 'over_budget', 'unknown', 'not_configured'] as const)('labels budget %s explicitly rather than by color', (status) => {
    const response = shoppingFixture((value) => { value.result.budget.status = status; value.result.budget.selectedKnownGap = money(status === 'over_budget' ? '420' : '0'); });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(html, budgetStatusLabel(status, 'en'));
    expect(html).not.toContain(`>${status}<`);
    if (status === 'over_budget') contains(html, `${copy.en.gap}: ¥420`);
    else expect(html).not.toContain(copy.en.gap);
  });

  it('keeps wholly unknown prices distinct from a known free purchase', () => {
    const response = shoppingFixture((value) => {
      Object.assign(value.result.cost, { status: 'unknown', knownCost: money('0'), totalCost: null, unknownCostItemCount: 1 });
      Object.assign(value.result.purchaseLines[0].selectedPackages[0], { unitPrice: null, lineCost: null });
      value.result.budget.status = 'unknown';
      value.catalogStatus = 'reviewed_catalog_unavailable';
    });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(costSummary(html), copy.en.priceUnavailable);
    contains(html, plannerCopy.en.ui.unknownPrice);
    contains(html, copy.en.noPrices);
    expect(costSummary(html)).not.toContain('¥0');
  });

  it.each(['NO_PURCHASE_OPTION', 'NO_PURCHASE_FOUND_WITHOUT_PROOF'] as const)('explains %s rather than treating it as a missing price alone', (code) => {
    const response = shoppingFixture((value) => {
      value.result.purchaseLines = [];
      value.result.unresolvedRequirements = [{ requirementId: 'chicken-demand', code }];
      value.result.shoppingStatus = code === 'NO_PURCHASE_OPTION' ? 'unfulfillable' : 'unknown';
      Object.assign(value.result.cost, { knownCost: money('0'), totalCost: null, status: 'unknown', unknownCostItemCount: 1 });
    });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(html, reasonLabel(code, 'en'));
    expect(html).not.toContain(`>${code}<`);
  });

  it('keeps unknown demand and optional requirements separate from confirmed quantities', () => {
    const response = shoppingFixture((value) => {
      Object.assign(value.result.requirements[0], { status: 'unresolved', required: null, unresolvedCount: 1 });
      value.result.purchaseLines = [];
      value.result.optionalRequirements = [{ ...value.result.requirements[0], id: 'optional-demand', ingredientId: 'CORIANDER', optional: true }];
      value.result.shoppingCompleteness = 'partial';
    });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(html, plannerCopy.en.ui.unknownQuantity);
    contains(html, copy.en.unresolved);
    contains(html, copy.en.optional);
    contains(html, 'Optional items are not included in suggested purchases or the budget.');
    expect(html).not.toContain(`${copy.en.required}: 0 g`);
  });

  it('calls surplus projected remainder and displays unknown waste risk', () => {
    const html = render(<ShoppingResult response={shoppingFixture()} locale="en" />);
    contains(html, `${copy.en.surplus}: 80 g`);
    contains(html, copy.en.wasteUnknown);
    contains(html, copy.en.wasteNote);
    contains(html, plannerCopy.en.waste.unknown);
    expect(html).not.toMatch(/80 g wasted|80 g waste|certain waste: 80/);
  });

  it.each(['at_risk', 'no_dated_risk_in_horizon'] as const)('keeps dated risk %s separate from unknown coverage', (status) => {
    const response = shoppingFixture((value) => {
      value.result.purchaseSurplus[0].risk.status = status;
      value.result.wasteSummary.assessedItemCount = 1;
      value.result.wasteSummary.unknownRiskItemCount = 0;
      value.result.wasteSummary.purchaseAtRiskSurplusCount = status === 'at_risk' ? 1 : 0;
    });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(html, status === 'at_risk' ? copy.en.wasteAtRisk : copy.en.wasteNone);
    expect(html).not.toContain(copy.en.wasteUnknown);
  });

  it('discloses optimizer limits without claiming the cheapest possible combination', () => {
    const response = shoppingFixture((value) => {
      Object.assign(value.result.optimization, { exhaustive: false, searchExhaustive: false, truncated: true,
        limitReasons: ['OPTION_LIMIT'], incompleteReasons: ['OPTION_LIMIT'] });
    });
    const html = render(<ShoppingResult response={response} locale="en" />);
    contains(costSummary(html), copy.en.bestKnown);
    contains(html, reasonLabel('OPTION_LIMIT', 'en'));
    expect(html).not.toMatch(/cheapest possible|proven cheapest|OPTION_LIMIT|additional information not yet supported/i);
  });

  it('labels drivers as known costs without implying unknown-price lines were compared', () => {
    const html = render(<ShoppingResult response={shoppingFixture()} locale="en" />);
    contains(html, 'Largest known costs');
    expect(html).not.toMatch(/Most expensive ingredients|most expensive overall/i);
  });

  it('labels currency and budget inputs and announces shopping computation', () => {
    const html = render(<ShoppingView busy="shopping" />);
    expect(html).toMatch(/<label[^>]*>Currency<select/);
    expect(html).toMatch(/<label[^>]*>Budget \(optional\)<input/);
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain('<fieldset disabled=""');
    contains(html, copy.en.optimizing);
    expect(html).toContain('role="status"');
  });

  it('renders a cached shopping result only for the current usable revision', () => {
    const html = render(<ShoppingView />, { shopping: shoppingFixture() });
    expect(html).toContain('data-testid="shopping-result"');
    contains(html, copy.en.completeTotal);
  });

  it.each(['stale', 'revision', 'busy', 'error'] as const)('hides a cached shopping result when %s makes it non-authoritative', (state) => {
    const plan = planFixture((value) => {
      if (state === 'stale') { value.freshness.status = 'requires_revalidation'; value.freshness.reasons = ['stale_inventory']; }
      if (state === 'revision') value.revision = 5;
    });
    const html = render(<ShoppingView plan={plan} busy={state === 'busy' ? 'regenerate' : null}
      error={state === 'error' ? new Error('failed') : null} />, { shopping: shoppingFixture() });
    expect(html).not.toContain('data-testid="shopping-result"');
  });
});
