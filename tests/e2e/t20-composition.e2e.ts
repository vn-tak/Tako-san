import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { MealPlanDtoSchema, PlanShoppingDtoSchema, type MealPlanDto } from '../../packages/domain/src/meal-planning-api';
import { PlanCompositionsDtoSchema, SlotCompositionDtoSchema, PickerPageDtoSchema, AutoOptionsDtoSchema } from '../../packages/domain/src/meal-composition-api';

const prefix = '/api/v1/meal-planning/plans';
const date = '2030-01-07';
const days = Array.from({ length: 7 }, (_, index) => new Date(Date.parse(date) + index * 86400_000).toISOString().slice(0, 10));
const slotPath = (plan: MealPlanDto, slotId = `${date}:dinner:0`) => `${prefix}/${plan.id}/slots/${encodeURIComponent(slotId)}`;
const mealURL = (plan: MealPlanDto, slotId = `${date}:dinner:0`) => `/planner/${plan.id}/meal/${encodeURIComponent(slotId)}`;

async function call(page: Page, path: string, method = 'GET', data?: unknown) {
  const result = await page.evaluate(async ({ path, method, data }) => {
    const response = await fetch(path, { method, credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: data === undefined ? undefined : JSON.stringify(data) });
    return { status: response.status, body: await response.text() };
  }, { path, method, data });
  return { status: () => result.status, text: async () => result.body,
    json: async () => JSON.parse(result.body) as Record<string, unknown> };
}
async function create(page: Page, options: { days?: number; cap?: number } = {}) {
  const response = await call(page, prefix, 'POST', { startDate: date, horizonDays: 7, defaultServings: 2, mode: 'shopping_allowed',
    slots: days.slice(0, options.days ?? 7).map((value) => ({ date: value, mealType: 'dinner', ...(options.cap ? { hardMaxTimeMinutes: options.cap } : {}) })) });
  expect(response.status(), await response.text()).toBe(200);
  return MealPlanDtoSchema.parse(await response.json());
}
async function canonical(page: Page, plan: MealPlanDto, slotId = `${date}:dinner:0`) {
  const response = await call(page, `${slotPath(plan, slotId)}/composition`);
  expect(response.status()).toBe(200);
  return SlotCompositionDtoSchema.parse(await response.json());
}
async function empty(page: Page, plan: MealPlanDto) {
  const response = await call(page, `${slotPath(plan)}/composition`, 'PUT', { revision: plan.revision, components: [] });
  expect(response.status(), await response.text()).toBe(200);
  const saved = SlotCompositionDtoSchema.parse(await response.json());
  return { ...plan, revision: saved.planRevision };
}
async function open(page: Page, plan: MealPlanDto) {
  await page.goto(mealURL(plan));
  await expect(page.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
}
async function fit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function add(page: Page, role: string, kind: 'recipe' | 'simple_food', id?: string) {
  const response = await call(page, `/api/v1/meal-planning/compositions/picker?role=${role}&kind=${kind}&limit=24`);
  const items = PickerPageDtoSchema.parse(await response.json()).items;
  const item = items.find((entry) => entry.kind === kind && (!id || entry.id === id));
  expect(item).toBeDefined();
  await page.getByRole('button', { name: 'Add dish', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Choose a dish' });
  await dialog.getByRole('combobox', { name: 'Role', exact: true }).selectOption(role);
  // Search uses the actual authority title, while English simple foods have a translated display.
  await dialog.getByRole('searchbox').fill(item!.title);
  await expect(dialog.getByRole('button', { name: /^Choose:/ })).toHaveCount(1);
  const saved = page.waitForResponse((res) => res.url().endsWith('/components') && res.request().method() === 'POST');
  await dialog.getByRole('button', { name: /^Choose:/ }).click();
  expect((await saved).status()).toBe(200);
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add dish', exact: true })).toBeEnabled();
  await fit(page);
}
async function rowAction(page: Page, componentId: string, name: RegExp) {
  const row = page.locator(`[id="component-${componentId}"]`);
  await row.locator('summary').click();
  await row.getByRole('button', { name }).click();
  await expect(page.getByRole('button', { name: 'Add dish', exact: true })).toBeEnabled();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/__preview');
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL('**/planner');
  await page.getByRole('combobox', { name: 'Language' }).selectOption('en');
});

test('A/I: Manual four dishes, autosave/reload, keyboard picker, reorder, role, swap/remove, responsive and axe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const initialState = await (await call(page, '/__preview/state')).json();
  const plan = await empty(page, await create(page));
  await open(page, plan);
  const trigger = page.getByRole('button', { name: 'Add dish', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('searchbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await add(page, 'main', 'recipe');
  await add(page, 'staple', 'simple_food', 'sf-steamed-rice');
  await add(page, 'vegetable', 'simple_food', 'sf-sliced-cucumber');
  await add(page, 'side', 'simple_food', 'sf-boiled-egg');
  let saved = await canonical(page, plan);
  expect(saved.composition.components).toHaveLength(4);
  expect(saved.composition.components.every((component) => component.locked)).toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
  expect((await canonical(page, plan)).composition).toEqual(saved.composition);
  const rice = saved.composition.components.find((entry) => entry.simpleFoodId === 'sf-steamed-rice')!;
  await rowAction(page, rice.id, /^Move up:/);
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(saved.planRevision + 1);
  saved = await canonical(page, plan);
  expect(saved.composition.components[0].id).toBe(rice.id);
  await page.locator(`[id="component-${rice.id}"] summary`).click();
  await page.getByRole('combobox', { name: 'Role: Steamed rice' }).selectOption('simple_food');
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(saved.planRevision + 1);
  saved = await canonical(page, plan);
  expect(saved.composition.components[0].role).toBe('simple_food');
  const egg = saved.composition.components.find((entry) => entry.simpleFoodId === 'sf-boiled-egg')!;
  await rowAction(page, egg.id, /^Swap dish:/);
  await page.getByRole('dialog').getByRole('combobox', { name: 'Role', exact: true }).selectOption('simple_food');
  await page.getByRole('dialog').getByRole('searchbox').fill('Sữa tươi');
  await page.getByRole('dialog').getByRole('button', { name: 'Choose: Fresh milk', exact: true }).click();
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(saved.planRevision + 1);
  saved = await canonical(page, plan);
  expect(saved.composition.components.find((entry) => entry.id === egg.id)?.simpleFoodId).toBe('sf-fresh-milk');
  await rowAction(page, egg.id, /^Remove dish:/);
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(saved.planRevision + 1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
  expect((await canonical(page, plan)).composition.components).toHaveLength(3);
  await page.screenshot({ path: `.wrangler/t20-completion/browser-on/manual-${page.viewportSize()!.width}.png`, fullPage: true });
  const axe = await new AxeBuilder({ page }).include('main').analyze();
  expect(axe.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([]);
  await fit(page);
  const smallTargets = await page.locator('[aria-labelledby="composition-heading"]').evaluate((node) =>
    [...node.querySelectorAll('button, a, select, summary')].filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44);
    }).map((element) => ({ tag: element.tagName, name: element.textContent, height: element.getBoundingClientRect().height })));
  expect(smallTargets).toEqual([]);
  const finalState = await (await call(page, '/__preview/state')).json();
  expect(finalState.inventory).toEqual(initialState.inventory);
  expect(finalState.inventoryEventCount).toBe(initialState.inventoryEventCount);
});

test('B/I: Assisted complete and regenerate preview/apply preserve locked main and other days', async ({ page }) => {
  const plan = await empty(page, await create(page));
  await open(page, plan);
  await add(page, 'main', 'recipe');
  const before = await canonical(page, plan);
  const other = await canonical(page, plan, `${days[1]}:dinner:0`);
  await page.getByRole('button', { name: 'Complete this meal', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Takosan suggestion' })).toBeVisible();
  expect((await canonical(page, plan)).planRevision).toBe(before.planRevision);
  await page.getByRole('button', { name: 'Use this suggestion', exact: true }).click();
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(before.planRevision + 1);
  const completed = await canonical(page, plan);
  expect(completed.composition.missingRoles).toEqual([]);
  const main = before.composition.components[0];
  expect(completed.composition.components.find((entry) => entry.id === main.id)).toMatchObject({ recipeId: main.recipeId, locked: true });
  await page.getByRole('button', { name: 'Suggest new unlocked dishes', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Takosan suggestion' })).toBeVisible();
  expect((await canonical(page, plan)).planRevision).toBe(completed.planRevision);
  await page.getByRole('button', { name: 'Use this suggestion', exact: true }).click();
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(completed.planRevision + 1);
  const regenerated = await canonical(page, plan);
  expect(regenerated.composition.components.find((entry) => entry.id === main.id)).toMatchObject({ recipeId: main.recipeId, locked: true });
  const identities = (dto: typeof other) => dto.composition.components.map(({ id, kind, recipeId, simpleFoodId, role, locked }) => ({ id, kind, recipeId, simpleFoodId, role, locked }));
  expect(identities(await canonical(page, plan, `${days[1]}:dinner:0`))).toEqual(identities(other));
  await page.goto(`/planner/${plan.id}`);
  await expect(page.getByTestId('planned-meal')).toHaveCount(7);
  await expect(page.getByRole('list', { name: 'Dishes in this meal' }).first()).toBeVisible();
  await fit(page);
});

test('C/I: Auto returns three bounded deterministic explainable options, writes only after accept', async ({ page }) => {
  const plan = await empty(page, await create(page));
  await open(page, plan);
  const response = page.waitForResponse((res) => res.url().endsWith('/auto') && res.request().method() === 'POST');
  await page.getByRole('button', { name: 'Let Takosan build the meal', exact: true }).click();
  const result = AutoOptionsDtoSchema.parse(await (await response).json());
  expect(result.options).toHaveLength(3);
  expect(result.budget.partialsExplored).toBeLessThanOrEqual(1200);
  expect(result.budget.scoringOperations).toBeLessThanOrEqual(2400);
  for (const option of result.options) {
    expect(option.explanations.length).toBeGreaterThan(0);
    expect(Number.isFinite(option.score.total)).toBe(true);
  }
  expect((await canonical(page, plan)).planRevision).toBe(plan.revision);
  const again = await call(page, `${slotPath(plan)}/auto`, 'POST', { revision: plan.revision });
  expect(AutoOptionsDtoSchema.parse(await again.json()).options).toEqual(result.options);
  await page.getByRole('button', { name: 'Use this suggestion', exact: true }).first().click();
  await expect.poll(async () => (await canonical(page, plan)).planRevision).toBe(plan.revision + 1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
  expect((await canonical(page, plan)).composition.mode).toBe('auto');
  await fit(page);
});

test('D: one running weekly inventory projection: rice 160 + 160 - 220 = 100g; stock unchanged', async ({ page }) => {
  const state = await (await call(page, '/__preview/state')).json();
  const plan = await create(page);
  let revision = plan.revision;
  for (const day of days) {
    const response = await call(page, `${slotPath(plan, `${day}:dinner:0`)}/composition`, 'PUT', { revision,
      components: day <= days[1] ? [{ target: { kind: 'simple_food', simpleFoodId: 'sf-steamed-rice' }, role: 'staple', locked: true }] : [] });
    expect(response.status(), await response.text()).toBe(200);
    revision = SlotCompositionDtoSchema.parse(await response.json()).planRevision;
  }
  await page.goto(`/planner/${plan.id}/shopping`);
  const response = page.waitForResponse((res) => res.url().endsWith('/shopping') && res.request().method() === 'POST');
  await page.getByRole('button', { name: 'Prepare shopping list', exact: true }).click();
  const dto = PlanShoppingDtoSchema.parse(await (await response).json());
  const rice = dto.result.requirements.find((entry) => entry.ingredientId === 'RICE');
  expect(rice?.required).toMatchObject({ value: '100', unit: 'g' });
  await expect(page.getByTestId('shopping-result')).toContainText('100');
  expect((await (await call(page, '/__preview/state')).json()).inventory).toEqual(state.inventory);
  await fit(page);
});

for (const cap of [10, 20]) {
test(`E: slot hard time ${cap} rejects unsafe Manual/Auto with no saved mutation`, async ({ page }) => {
  const plan = await create(page, { days: 1, cap });
  const before = await canonical(page, plan);
  const rejected = await call(page, `${slotPath(plan)}/components`, 'POST', { revision: before.planRevision,
    target: { kind: 'simple_food', simpleFoodId: 'sf-steamed-rice' }, role: 'staple' });
  expect(rejected.status()).toBe(422);
  expect((await canonical(page, plan)).planRevision).toBe(before.planRevision);
  const generated = await call(page, `${slotPath(plan)}/auto`, 'POST', { revision: before.planRevision });
  expect(generated.status()).toBe(200);
  const options = AutoOptionsDtoSchema.parse(await generated.json());
  expect(options.options.every((option) => !option.components.some((component) => component.simpleFoodId === 'sf-steamed-rice'))).toBe(true);
  await open(page, plan);
  await page.getByRole('button', { name: 'Add dish', exact: true }).click();
  await page.getByRole('dialog').getByRole('searchbox').fill('Cơm trắng');
  // Picker is a catalog summary; the trusted slot context is enforced when adding.
  const selected = page.waitForResponse((res) => res.url().endsWith('/components') && res.request().method() === 'POST');
  await page.getByRole('dialog').getByRole('button', { name: 'Choose: Steamed rice' }).click();
  expect((await selected).status()).toBe(422);
  await expect(page.getByRole('alert').last()).toBeVisible();
  expect((await canonical(page, plan)).planRevision).toBe(before.planRevision);
});
}

test('F: D1-only recipe resolves consistently through planner, detail, cooking and shopping reads', async ({ page }) => {
  const plan = await empty(page, await create(page));
  const id = 'imp-26a36c69306143bc';
  const response = await call(page, `${slotPath(plan)}/components`, 'POST', { revision: plan.revision, target: { kind: 'recipe', recipeId: id }, role: 'main' });
  expect(response.status(), await response.text()).toBe(200);
  await open(page, plan);
  const component = (await canonical(page, plan)).composition.components[0];
  expect(component.recipeId).toBe(id);
  await page.locator(`[id="component-${component.id}"] summary`).click();
  await page.getByRole('link', { name: 'View recipe', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/recipes/id/${id}`));
  await expect(page.getByRole('heading', { name: component.title, exact: true }).first()).toBeVisible();
  await open(page, plan);
  await page.locator(`[id="component-${component.id}"] summary`).click();
  await page.getByRole('link', { name: 'Cook this dish', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/cooking/${id}`));
  await expect(page.getByRole('heading', { name: component.title, exact: true }).first()).toBeVisible();
  const shopping = await call(page, `${prefix}/${plan.id}/shopping`, 'POST', { revision: (await canonical(page, plan)).planRevision, currency: 'VND' });
  expect(shopping.status(), await shopping.text()).toBe(200);
});

test('G: two sessions submit competing edits; stale write conflicts and canonical winner survives', async ({ page, browser }) => {
  const plan = await create(page);
  await open(page, plan);
  const context = await browser.newContext({ storageState: await page.context().storageState() });
  const other = await context.newPage();
  try {
    await other.goto(new URL(mealURL(plan), page.url()).href);
    await expect(other.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
    const before = await canonical(page, plan);
    const component = before.composition.components[0];
    const path = `${slotPath(plan)}/components/${encodeURIComponent(component.id)}`;
    const responses = await Promise.all([call(page, path, 'PATCH', { revision: before.planRevision, locked: true }),
      call(other, path, 'PATCH', { revision: before.planRevision, locked: true })]);
    expect(responses.map((response) => response.status()).sort()).toEqual([200, 409]);
    const latest = await canonical(page, plan);
    expect(latest.planRevision).toBe(before.planRevision + 1);
    expect(latest.composition.components[0].locked).toBe(true);
    const conflict = other.waitForResponse((response) => response.request().method() === 'PATCH' && response.url().includes('/components/'));
    await other.getByRole('button', { name: `Lock dish: ${component.title}`, exact: true }).click();
    expect((await conflict).status()).toBe(409);
    await expect(other.getByRole('button', { name: `Unlock dish: ${component.title}`, exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect((await canonical(page, plan)).planRevision).toBe(latest.planRevision);
    const staleProposal = await call(other, `${slotPath(plan)}/assist/apply`, 'POST', {
      revision: before.planRevision, action: 'regenerate_unlocked', proposalId: 'f'.repeat(32) });
    expect(staleProposal.status()).toBe(409);
    expect((await canonical(page, plan)).composition).toEqual(latest.composition);
  } finally { await context.close(); }
});

test('load failure and retry never substitute a stale V1 anchor on week or meal', async ({ page }) => {
  const plan = await empty(page, await create(page));
  await open(page, plan);
  await add(page, 'staple', 'simple_food', 'sf-steamed-rice');
  const source = plan.result.meals[0].title;
  let failing = true;
  await page.route('**/compositions', async (route) => failing
    ? route.fulfill({ status: 500, json: { error: 'Synthetic preview failure', code: 'PREVIEW_FAILURE' } }) : route.continue());
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: source, exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Swap meal', exact: true })).toHaveCount(0);
  failing = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
  const all = await call(page, `${prefix}/${plan.id}/compositions`);
  expect(PlanCompositionsDtoSchema.parse(await all.json()).compositions[0].components).toHaveLength(1);
});


for (const restriction of ['forbidden', 'dietary', 'nutrition']) {
  test(`E: ${restriction} household rejects Manual and Auto fails closed without saving`, async ({ page }) => {
    const plan = await empty(page, await create(page, { days: 1 }));
    const configured = await call(page, `/__preview/t20/restrictions/${restriction}`, 'POST');
    expect(configured.status()).toBe(200);
    const before = await canonical(page, plan);
    const response = await call(page, `${slotPath(plan)}/auto`, 'POST', { revision: before.planRevision });
    expect(response.status()).toBe(200);
    const options = AutoOptionsDtoSchema.parse(await response.json());
    if (restriction === 'forbidden') {
      expect(options.options.every((option) => !option.components.some((item) => ['sf-steamed-rice', 'sf-boiled-egg'].includes(item.simpleFoodId ?? '')))).toBe(true);
    } else expect(options.options.every((option) => option.components.length === 0)).toBe(true);
    expect((await canonical(page, plan)).planRevision).toBe(before.planRevision);
    const mutation = await call(page, `${slotPath(plan)}/components`, 'POST', { revision: before.planRevision,
      target: { kind: 'simple_food', simpleFoodId: 'sf-steamed-rice' }, role: 'staple' });
    expect(mutation.status()).toBe(422);
    expect((await mutation.json()).code).toBe('HARD_CONSTRAINT_CONFLICT');
    await open(page, plan);
    await page.getByRole('button', { name: 'Add dish', exact: true }).click();
    await page.getByRole('dialog').getByRole('searchbox').fill('Cơm trắng');
    // Unsafe simple foods are omitted at the household picker boundary, before a user can choose.
    await expect(page.getByRole('dialog').getByText('No dishes match the current filters.', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Choose: Steamed rice', exact: true })).toHaveCount(0);
    expect((await canonical(page, plan)).planRevision).toBe(before.planRevision);
  });
}

test('D: untracked fruit remains explicit in shopping and week summaries', async ({ page }) => {
  const plan = await empty(page, await create(page));
  await open(page, plan);
  await add(page, 'dessert', 'simple_food', 'sf-seasonal-fruit');
  await page.goto(`/planner/${plan.id}/shopping`);
  await expect(page.getByRole('region', { name: 'Not tracked in inventory' })).toContainText('Seasonal fruit');
  await expect(page.getByRole('region', { name: 'Not tracked in inventory' })).toContainText('does not calculate quantities');
  await page.getByRole('link', { name: /^Seasonal fruit/ }).click();
  await expect(page.getByRole('heading', { name: 'Dishes in this meal' })).toBeVisible();
  await page.goto(`/planner/${plan.id}`);
  await expect(page.getByTestId('planned-meal').first()).toContainText('Not tracked in inventory');
});


test('H: a warm V2 week cache gives way to V1 when server composition routes turn off', async ({ page }) => {
  const plan = await empty(page, await create(page));
  await open(page, plan);
  await add(page, 'staple', 'simple_food', 'sf-steamed-rice');
  const response = page.waitForResponse((item) => item.url().endsWith('/compositions') && item.status() === 404);
  await page.route('**/compositions', (route) => route.fulfill({ status: 404, json: { error: 'Not found' } }));
  await page.getByRole('link', { name: 'Back to meals', exact: true }).click();
  await response;
  await expect(page.getByTestId('planned-meal').first().getByRole('heading', { name: plan.result.meals[0].title, exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Dishes in this meal' })).toHaveCount(0);
  await expect(page.getByTestId('planned-meal').first()).not.toContainText('Steamed rice');
  await expect(page.getByRole('button', { name: 'Regenerate plan', exact: true })).toBeEnabled();
});
