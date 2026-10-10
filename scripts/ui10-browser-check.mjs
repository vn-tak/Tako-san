import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5204';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui10/browser');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 320, height: 844 },
  locale: 'vi-VN',
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
});
await context.route(
  (url) => url.origin !== base,
  (route) => route.abort(),
);
const page = await context.newPage();
const checks = [],
  journeys = [],
  errors = [],
  commands = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => {
  if (request.method() !== 'GET' && new URL(request.url()).pathname.startsWith('/api/v1/week'))
    commands.push({
      path: new URL(request.url()).pathname,
      method: request.method(),
      body: request.postDataJSON(),
    });
});
async function get(path) {
  return page.evaluate(async (path) => {
    const response = await fetch(path);
    return { status: response.status, data: await response.json() };
  }, `/api/v1${path}`);
}
async function stock() {
  const result = await get('/inventory');
  assert.equal(result.status, 200);
  return result.data;
}
async function shot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    for (const image of document.images) image.loading = 'eager';
  });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    ),
  );
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1Count: document.querySelectorAll('h1').length,
    brokenImages: [...document.images]
      .filter((img) => img.complete && !img.naturalWidth)
      .map((img) => img.getAttribute('src')),
    font: getComputedStyle(document.querySelector('main')).fontFamily,
    dialog: document.querySelector('[role="dialog"]')
      ? {
          height: document.querySelector('[role="dialog"]').getBoundingClientRect().height,
          viewport: innerHeight,
          scroll: document.querySelector('[role="dialog"]').scrollHeight,
        }
      : null,
  }));
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }));
  checks.push({ name, path: new URL(page.url()).pathname, ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: !layout.dialog });
  console.log(
    `${name}: overflow=${layout.scrollWidth - layout.width}; axe=${violations.length}; broken=${layout.brokenImages.length}`,
  );
  assert.equal(layout.h1Count, 1);
  assert.equal(layout.scrollWidth, layout.width);
  assert.deepEqual(layout.brokenImages, []);
  assert.deepEqual(violations, []);
}
async function enlarge(selector = 'main') {
  await page.evaluate((selector) => {
    const elements = [...document.querySelectorAll(`${selector} *`)];
    const sizes = elements.map((element) => parseFloat(getComputedStyle(element).fontSize));
    elements.forEach((element, index) => {
      element.style.fontSize = `${sizes[index] * 2}px`;
    });
  }, selector);
}
async function board(url) {
  await page.goto(url);
  await page.getByRole('heading', { name: 'Bữa ăn từng ngày', exact: true }).waitFor();
}
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/week$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  const disabled = await get('/meal-planning/plans');
  assert.equal(disabled.status, 404);
  assert.equal(disabled.data.code, 'MEAL_PLANNER_DISABLED');
  journeys.push({ kind: 'real-planner-off', server: disabled });
  const before = await stock();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(`${base}/week`);
    await page.getByRole('heading', { name: 'Chưa có thực đơn tuần', exact: true }).waitFor();
    await shot(`empty-${width}`);
    await page.goto(`${base}/week/setup`);
    await page.getByRole('heading', { name: /những bữa nào/ }).waitFor();
    await shot(`setup-${width}`);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/week/setup`);
  await page.getByRole('radio', { name: /Người đi làm/ }).press('Space');
  await expect(page.getByRole('radio', { name: /Người đi làm/ })).toBeChecked();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).press('Enter');
  await page.getByRole('radio', { name: 'Không giới hạn ngân sách', exact: true }).press('Space');
  await shot('budget-unlimited-320');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).press('Enter');
  await page.getByRole('checkbox', { name: 'Tiết kiệm chi phí', exact: true }).press('Space');
  await page.getByRole('checkbox', { name: 'Ưu tiên nấu nhanh', exact: true }).press('Space');
  await expect(
    page.getByRole('checkbox', { name: 'Ăn đa dạng, đổi món', exact: true }),
  ).toBeDisabled();
  await shot('priorities-320');
  await page.getByRole('button', { name: 'Bước trước', exact: true }).click();
  await expect(
    page.getByRole('radio', { name: 'Không giới hạn ngân sách', exact: true }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Bước trước', exact: true }).click();
  await expect(page.getByRole('radio', { name: /Người đi làm/ })).toBeChecked();
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('radio', { name: /2 lần \/ tuần/ }).press('Space');
  await shot('frequency-review-320');
  let releaseGenerate;
  let heldGenerate;
  const gate = new Promise((done) => {
    releaseGenerate = done;
  });
  await page.route('**/api/v1/week/plans', async (route) => {
    if (route.request().method() === 'POST') {
      heldGenerate = route.request().postDataJSON();
      await gate;
    }
    await route.continue();
  });
  await page.getByRole('button', { name: 'Tạo thực đơn tuần', exact: true }).press('Enter');
  await page.getByRole('heading', { name: /Đang lên thực đơn/ }).waitFor();
  await shot('generating-320');
  assert.equal(heldGenerate.budgetTargetVnd, null);
  assert.deepEqual(heldGenerate.priorities, ['use_fridge', 'budget', 'quick']);
  assert.equal(heldGenerate.shoppingFrequency, 'twice');
  assert(!Object.hasOwn(heldGenerate, 'schedule'));
  releaseGenerate();
  await page.waitForURL(/\/week\/(?!generating$|setup$)[^/]+$/);
  const planUrl = page.url();
  const planId = new URL(planUrl).pathname.split('/').at(-1);
  await page.unroute('**/api/v1/week/plans');
  await page.getByRole('heading', { name: 'Bữa ăn từng ngày', exact: true }).waitFor();
  const generated = (await get(`/week/plans/${planId}`)).data.plan;
  assert.equal(generated.budget.targetVnd, null);
  assert.deepEqual(await stock(), before);
  journeys.push({
    kind: 'real-four-stage-generation-and-back-retention',
    payload: heldGenerate,
    planId,
    stockUnchanged: true,
  });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await board(planUrl);
    await shot(`board-${width}`);
  }
  const slot = generated.days.flatMap((day) => day.slots).find((slot) => slot.recipe);
  const mealUrl = `${planUrl}/meal/${slot.id}`;
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(mealUrl);
    await page.getByRole('heading', { name: slot.recipe.title, exact: true }).waitFor();
    await shot(`meal-${width}`);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(mealUrl);
  await page.getByRole('button', { name: 'Cách nấu', exact: true }).click();
  await shot('meal-steps-320');
  await page.getByRole('button', { name: 'Dinh dưỡng', exact: true }).click();
  await shot('meal-nutrition-320');
  assert.equal(
    await page.getByRole('link', { name: 'Bắt đầu nấu', exact: true }).getAttribute('href'),
    `/cook/${slot.recipe.slug}`,
  );
  const swapUrl = `**/api/v1/week/plans/${planId}/meals/${slot.id}/swap`;
  await page.route(swapUrl, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'UI10_SYNTHETIC_SWAP_FAILURE' }),
    }),
  );
  await page.getByRole('button', { name: 'Đổi món', exact: true }).click();
  await page.getByRole('dialog').getByRole('alert').waitFor();
  await shot('swap-error-320');
  await page.unroute(swapUrl);
  await page.getByRole('dialog').getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Chọn món / })
    .first()
    .waitFor();
  await shot('swap-options-320');
  await page.setViewportSize({ width: 390, height: 420 });
  await shot('swap-short-390');
  await page.keyboard.press('Shift+Tab');
  assert(
    await page.getByRole('dialog').evaluate((dialog) => dialog.contains(document.activeElement)),
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Đổi món', exact: true })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Đổi món', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Chọn món / })
    .first()
    .click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  const swapped = (await get(`/week/plans/${planId}`)).data.plan;
  assert.notEqual(
    swapped.days.flatMap((day) => day.slots).find((entry) => entry.id === slot.id).recipe.id,
    slot.recipe.id,
  );
  assert.deepEqual(await stock(), before);
  journeys.push({
    kind: 'real-meal-tabs-and-swap',
    syntheticAlternativeFailure: true,
    stockUnchanged: true,
    cookingLink: `/cook/${slot.recipe.slug}`,
  });
  await board(planUrl);
  await page.getByRole('button', { name: 'Chia sẻ thực đơn', exact: true }).click();
  await shot('export-390');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((_done, reject) => {
            window.ui10RejectCopy = reject;
          }),
      },
    }),
  );
  await page.getByRole('button', { name: 'Sao chép thực đơn', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toContainText('Đã sao chép');
  await shot('export-copy-pending-390');
  await page.evaluate(() => window.ui10RejectCopy(new Error('UI10_PRIVATE_CLIPBOARD_FAILURE')));
  await page.getByRole('dialog').getByRole('alert').waitFor();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeFocused();
  await shot('export-copy-error-390');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.ui10CopiedText = text;
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Sao chép thực đơn', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Đã sao chép thực đơn.');
  assert((await page.evaluate(() => window.ui10CopiedText)).includes('THỰC ĐƠN TUẦN'));
  await shot('export-copy-success-390');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Chia sẻ thực đơn', exact: true })).toBeFocused();
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('Cancelled', 'AbortError');
      },
    }),
  );
  await page.getByRole('button', { name: 'Chia sẻ thực đơn', exact: true }).click();
  await page.getByRole('button', { name: 'Chia sẻ trên thiết bị', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Bạn đã đóng bảng chia sẻ.');
  await shot('export-share-cancel-390');
  await page.keyboard.press('Escape');
  journeys.push({
    kind: 'synthetic-clipboard-receipts-and-native-share-cancellation',
    keyboardTrapEscapeReturn: true,
  });
  await page.goto(`${planUrl}/settings`);
  await page.getByRole('radio', { name: 'Không giới hạn ngân sách', exact: true }).waitFor();
  await expect(page.getByRole('radio', { name: '750.000 ₫', exact: true })).toBeChecked();
  const settingsBefore = commands.length;
  await page.getByRole('radio', { name: '500.000 ₫', exact: true }).check();
  await page.getByRole('button', { name: 'Áp dụng vào bản nháp', exact: true }).click();
  await shot('settings-session-draft-390');
  assert.equal(commands.length, settingsBefore);
  await page.getByRole('link', { name: 'Xem lại trước khi tạo mới', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByRole('radio', { name: '500.000 ₫', exact: true })).toBeChecked();
  assert.deepEqual((await get(`/week/plans/${planId}`)).data.plan, swapped);
  await page.reload();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByRole('radio', { name: '750.000 ₫', exact: true })).toBeChecked();
  journeys.push({
    kind: 'settings-memory-draft-only',
    currentPlanUnchanged: true,
    noCommands: true,
    reloadResets: true,
  });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(`${planUrl}/shopping`);
    await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).waitFor();
    await shot(`shopping-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${planUrl}/shopping`);
  await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Nhập 0 nguyên liệu đã chọn vào tủ', exact: true }),
  ).toBeDisabled();
  const firstItem = page.locator('.week-shopping-item').first();
  await firstItem.click();
  await expect(firstItem).toHaveAttribute('aria-pressed', 'true');
  await expect
    .poll(
      async () =>
        (await get(`/week/plans/${planId}`)).data.plan.shoppingItems.filter((item) => item.checked)
          .length,
    )
    .toBe(1);
  assert.deepEqual(await stock(), before);
  await shot('shopping-active-one-390');
  const completeUrl = `**/api/v1/week/plans/${planId}/shopping/complete`;
  await page.route(completeUrl, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'UI10_SYNTHETIC_IMPORT_FAILURE' }),
    }),
  );
  await page
    .getByRole('button', { name: 'Nhập 1 nguyên liệu đã chọn vào tủ', exact: true })
    .click();
  await expect(page.getByRole('alert')).toBeFocused();
  await shot('shopping-import-error-390');
  assert.deepEqual(await stock(), before);
  await page.unroute(completeUrl);
  const selectedPlan = (await get(`/week/plans/${planId}`)).data.plan;
  const selected = selectedPlan.shoppingItems.filter((item) => item.checked);
  assert.equal(selected.length, 1);
  await page
    .getByRole('button', { name: 'Nhập 1 nguyên liệu đã chọn vào tủ', exact: true })
    .click();
  await page.getByRole('heading', { name: 'Đã nhập nguyên liệu vào tủ.', exact: true }).waitFor();
  await shot('shopping-import-confirmed-390');
  const importCommand = commands
    .filter((command) => command.path.endsWith('/shopping/complete'))
    .at(-1);
  assert.equal(importCommand.body.items.length, 1);
  assert.equal(importCommand.body.items[0].ingredientId, selected[0].ingredientId);
  const after = await stock();
  assert.notDeepEqual(after, before);
  for (const item of before.items)
    assert.deepEqual(
      after.items.find((row) => row.id === item.id),
      item,
    );
  const added = after.items.filter((row) => !before.items.some((item) => item.id === row.id));
  assert.equal(added.length, 1);
  assert.equal(added[0].ingredientId, selected[0].ingredientId);
  assert.equal(added[0].quantity, selected[0].recommendedPurchaseQuantity);
  assert.equal(added[0].unit, selected[0].unit);
  journeys.push({
    kind: 'real-selected-only-shopping-import',
    syntheticFirstFailure: true,
    selected: selected.map(({ ingredientId, recommendedPurchaseQuantity, unit }) => ({
      ingredientId,
      recommendedPurchaseQuantity,
      unit,
    })),
    before,
    after,
    command: importCommand,
  });
  await page.reload();
  await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).waitFor();
  await shot('shopping-import-readback-390');
  assert.deepEqual(await stock(), after);
  await page.route(completeUrl, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ success: true, pendingSync: true, importedItemsCount: 1 }),
    }),
  );
  await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).click();
  if ((await page.locator('.week-shopping-item').first().getAttribute('aria-pressed')) !== 'true')
    await page.locator('.week-shopping-item').first().click();
  await expect(
    page.getByRole('button', { name: 'Nhập 1 nguyên liệu đã chọn vào tủ', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Nhập 1 nguyên liệu đã chọn vào tủ', exact: true })
    .click();
  await page
    .getByRole('heading', { name: 'Yêu cầu nhập đang chờ đồng bộ.', exact: true })
    .waitFor();
  await shot('shopping-synthetic-pending-receipt-390');
  assert.deepEqual(await stock(), after);
  await page.unroute(completeUrl);
  journeys.push({
    kind: 'synthetic-pending-receipt-presentation-only',
    noOfflineDurabilityClaim: true,
    stockUnchanged: true,
  });
  // Enlarge actual computed text, including the dialog, without changing the domain data.
  await page.setViewportSize({ width: 320, height: 844 });
  await board(planUrl);
  await enlarge();
  await shot('board-text2-320');
  await page.getByRole('button', { name: 'Chia sẻ thực đơn', exact: true }).click();
  await enlarge('[role="dialog"]');
  await shot('export-text2-320');
  await page
    .getByRole('button', { name: 'Sao chép thực đơn', exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('button', { name: 'Sao chép thực đơn', exact: true }),
  ).toBeInViewport();
  await shot('export-text2-controls-320');
  await page.keyboard.press('Escape');
  await page.goto(mealUrl);
  await page.getByRole('button', { name: 'Dinh dưỡng', exact: true }).click();
  await enlarge();
  await shot('nutrition-text2-320');
  await page.goto(`${planUrl}/shopping`);
  await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).waitFor();
  await enlarge();
  await shot('shopping-text2-320');
  await page.goto(`${base}/week/setup`);
  await page.getByRole('heading', { name: /những bữa nào/ }).waitFor();
  await enlarge();
  await shot('setup-text2-320');
  await page.goto(`${planUrl}/meal/missing-meal`);
  await expect(page.getByRole('status')).toContainText('Không tìm thấy thông tin món ăn');
  await shot('meal-missing-320');
  const planReadUrl = `**/api/v1/week/plans/${planId}`;
  await page.route(planReadUrl, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'UI10_SYNTHETIC_PLAN_READ_FAILURE' }),
    }),
  );
  await page.goto(planUrl);
  await page.getByRole('alert').waitFor();
  await shot('board-read-error-320');
  await page.unroute(planReadUrl);
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('heading', { name: 'Bữa ăn từng ngày', exact: true }).waitFor();
  assert.deepEqual(await stock(), after);
  journeys.push({
    kind: 'missing-meal-and-synthetic-plan-read-error',
    realRetryRecovery: true,
    stockUnchanged: true,
  });
  const currentRead = (await get(`/week/plans/${planId}`)).data.plan;
  const syntheticLong = structuredClone(currentRead);
  const longSlot = syntheticLong.days
    .flatMap((day) => day.slots)
    .find((entry) => entry.id === slot.id);
  longSlot.recipe.title = 'Món ăn với tên dài để kiểm tra khả năng đọc trên màn hình nhỏ '.repeat(
    4,
  );
  delete longSlot.recipe.nutrition;
  longSlot.recipe.steps = [];
  for (const ingredient of longSlot.ingredients)
    ingredient.name += ' tên nguyên liệu rất dài không được cắt mất thông tin '.repeat(3);
  for (const item of syntheticLong.shoppingItems)
    item.name += ' tên nguyên liệu rất dài '.repeat(4);
  const readUrl = `**/api/v1/week/plans/${planId}`;
  await page.route(readUrl, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ plan: syntheticLong }),
    }),
  );
  await page.goto(mealUrl);
  await page.getByRole('button', { name: 'Dinh dưỡng', exact: true }).waitFor();
  await enlarge();
  await shot('meal-long-text2-320');
  await page.getByRole('button', { name: 'Dinh dưỡng', exact: true }).click();
  await expect(page.locator('.week-nutrition')).toContainText('—');
  await shot('nutrition-unknown-320');
  await page.getByRole('button', { name: 'Cách nấu', exact: true }).click();
  await expect(page.locator('#week-recipe-content')).toContainText('Chưa có hướng dẫn');
  await shot('steps-empty-320');
  await page.getByRole('button', { name: 'Đổi món', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Chọn món / })
    .first()
    .waitFor();
  await enlarge('[role="dialog"]');
  await shot('swap-long-title-text2-320');
  await page.keyboard.press('Escape');
  await page.goto(`${planUrl}/shopping`);
  await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).waitFor();
  await enlarge();
  await shot('shopping-long-text2-320');
  await page.unroute(readUrl);
  assert.deepEqual(await stock(), after);
  journeys.push({ kind: 'synthetic-long-content-and-unknown-nutrition', noInventoryWrite: true });
  await page.route('**/api/v1/week/plans', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'UI10_SYNTHETIC_GENERATION_FAILURE' }),
        })
      : route.continue(),
  );
  await page.goto(`${base}/week/generating`);
  await page.getByRole('heading', { name: 'Chưa tạo được thực đơn.', exact: true }).waitFor();
  await shot('generation-error-320');
  await page.getByRole('button', { name: 'Quay lại thiết lập', exact: true }).click();
  await page.unroute('**/api/v1/week/plans');
  assert.deepEqual(await stock(), after);
  journeys.push({
    kind: 'synthetic-generation-failure',
    explicitReturn: true,
    stockUnchanged: true,
  });
  await page.setViewportSize({ width: 390, height: 420 });
  await page.goto(`${planUrl}/settings`);
  await page.getByRole('button', { name: 'Áp dụng vào bản nháp', exact: true }).waitFor();
  await shot('settings-short-390');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await board(planUrl);
  await page.getByRole('button', { name: 'Chia sẻ thực đơn', exact: true }).click();
  await shot('export-normal-motion-1440');
  await page.keyboard.press('Escape');
  journeys.push({
    kind: 'responsive-short-computed-text-and-motion',
    widths: [320, 390, 768, 1024, 1440],
    short: [390, 420],
    doubledComputedText: true,
    normalAndReduced: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    `PASS ${checks.length} snapshots / ${journeys.length} journeys / ${errors.length} unexpected page errors`,
  );
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ base, checks, journeys, errors }, null, 2),
  );
  await browser.close();
}
