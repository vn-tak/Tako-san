import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5198';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const variant = process.env.UI06_VARIANT ?? 'v2';
const out = resolve(process.env.UI_REBUILD_OUT ?? `.artifacts/ui06/browser-${variant}`);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'vi-VN',
  timezoneId: 'Asia/Tokyo',
  serviceWorkers: 'block',
  reducedMotion: 'reduce',
});
await context.route(
  (url) => url.origin !== base,
  (route) => route.abort(),
);
const page = await context.newPage();
const checks = [],
  journeys = [],
  errors = [];
page.on('pageerror', (error) => errors.push(error.message));
async function api(path, method = 'GET', body) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const r = await fetch(path, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
          'X-Frigo-Expected-User-Id': localStorage.getItem('frigo_user_id'),
          'X-Frigo-Expected-Household-Id': localStorage.getItem('frigo_household_id'),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, data: await r.json() };
    },
    { path, method, body },
  );
}
async function snapshot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll('.planning-day')].flatMap((el) =>
        el.getAnimations().map((animation) => animation.finished.catch(() => {})),
      ),
    ),
  );
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    font: getComputedStyle(document.querySelector('.takosan-rebuild') ?? document.body).fontFamily,
    inputs: [
      ...document.querySelectorAll(
        '.planning-workspace input:not([type=checkbox]), .planning-workspace select, .shopping-add-form input, .shopping-add-form select',
      ),
    ].map((el) => ({
      font: parseFloat(getComputedStyle(el).fontSize),
      height: el.getBoundingClientRect().height,
    })),
    columns: document.querySelector('.planning-day-board')
      ? getComputedStyle(document.querySelector('.planning-day-board')).gridTemplateColumns
      : null,
    brokenImages: [...document.images]
      .filter((im) => im.complete && !im.naturalWidth)
      .map((im) => im.src),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    animations: [...document.querySelectorAll('.planning-day')].map(
      (el) => getComputedStyle(el).animationName,
    ),
  }));
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((n) => n.target),
  }));
  checks.push({ name, url: page.url(), ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  if (name.endsWith('-390') || name.endsWith('-1440'))
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
  assert(layout.width <= layout.viewport, `${name}: overflow ${layout.width}/${layout.viewport}`);
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  assert.deepEqual(layout.brokenImages, [], `${name}: broken images`);
  assert(layout.font.includes('Be Vietnam Pro') || name.startsWith('week-'), `${name}: font`);
  assert(
    layout.inputs.every((input) => input.font >= 16 && input.height >= 44),
    `${name}: inputs ${JSON.stringify(layout.inputs)}`,
  );
  if (layout.reduced) assert(layout.animations.every((name) => name === 'none'));
  console.log(`${variant}/${name}: axe0 overflow0 broken0 fields16`);
}
async function login() {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(`${base}/planner`);
  await expect(page.getByRole('heading', { name: 'Một tuần ngon bắt đầu từ đây' })).toBeVisible();
}
const prefix = '/api/v1/meal-planning/plans';
let plan;
try {
  await login();
  await snapshot('planner-empty-390');
  const stockBefore = await api('/api/v1/inventory');
  const start = '2030-01-07';
  const dates = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.parse(start) + i * 86400000).toISOString().slice(0, 10),
  );
  const created = await api(prefix, 'POST', {
    startDate: start,
    horizonDays: 7,
    defaultServings: 2,
    mode: 'shopping_allowed',
    utcOffsetMinutes: 540,
    slots: dates.map((date) => ({ date, mealType: 'dinner' })),
  });
  assert.equal(created.status, 200, JSON.stringify(created.data));
  plan = created.data;
  const meal = plan.result.meals[0];
  assert(meal, 'Expected real planned meal');
  const board = `/planner/${plan.id}`;
  const mealPath = `${board}/meal/${encodeURIComponent(meal.slotId)}`;
  const shoppingPath = `${board}/shopping`;
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/planner/new`);
    await expect(page.getByRole('button', { name: 'Tạo thực đơn', exact: true })).toBeVisible();
    await snapshot(`planner-setup-${width}`);
    await page.goto(`${base}${board}`);
    await expect(page.locator('[data-testid=planned-meal]')).toHaveCount(plan.result.meals.length);
    if (variant === 'v2')
      await expect(page.locator('.planning-meal-card h3').first()).toContainText(meal.title);
    await snapshot(`planner-board-${width}`);
    await page.goto(`${base}${mealPath}`);
    await expect(
      page.getByRole('heading', {
        name: variant === 'v2' ? 'Các món trong bữa' : meal.title,
        exact: true,
      }),
    ).toBeVisible();
    await snapshot(`planner-meal-${width}`);
    await page.goto(`${base}${shoppingPath}`);
    await page.getByRole('button', { name: 'Lập danh sách đi chợ', exact: true }).click();
    await expect(page.getByTestId('shopping-result')).toBeVisible();
    await snapshot(`planner-shopping-${width}`);
    if (variant !== 'v2') break;
  }
  await page.getByTestId('shopping-result').getByRole('checkbox').first().check();
  await page.reload();
  await page.getByRole('button', { name: 'Lập danh sách đi chợ', exact: true }).click();
  await expect(page.getByTestId('shopping-result').getByRole('checkbox').first()).not.toBeChecked();
  journeys.push({ kind: 'recommendation-checks-view-local', resetOnReload: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/week/${plan.id}/shopping`);
  await page.waitForURL(`${base}${shoppingPath}`);
  await page.goto(`${base}/week/${plan.id}/meal/${encodeURIComponent(meal.slotId)}`);
  await page.waitForURL((url) => decodeURIComponent(url.pathname) === decodeURIComponent(mealPath));
  journeys.push({ kind: 'week-aliases', planId: plan.id, slotId: meal.slotId });
  if (variant === 'v2') {
    await page.getByRole('button', { name: 'Thêm món', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Chọn món', exact: true });
    await expect(dialog.getByRole('searchbox')).toBeFocused();
    await dialog.getByRole('combobox', { name: 'Vai trò', exact: true }).selectOption('staple');
    await expect(dialog.getByRole('button', { name: /^Chọn:/ }).first()).toBeVisible();
    await snapshot('composer-picker-390');
    await page.keyboard.press('Tab');
    assert(
      await dialog.evaluate((node) => node.contains(document.activeElement)),
      'Picker Tab stays inside',
    );
    await dialog.getByRole('searchbox').fill('zzzz-no-match-ui06');
    await expect(dialog.getByRole('button', { name: 'Xoá bộ lọc', exact: true })).toBeVisible();
    await snapshot('composer-picker-empty-390');
    await dialog.getByRole('button', { name: 'Xoá bộ lọc', exact: true }).click();
    await expect(dialog.getByRole('button', { name: /^Chọn:/ }).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Thêm món', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Thêm món', exact: true }).click();
    await dialog.getByRole('combobox', { name: 'Vai trò', exact: true }).selectOption('staple');
    await dialog.getByRole('searchbox').fill('Cơm trắng');
    await expect(dialog.getByRole('button', { name: /^Chọn:/ })).toHaveCount(1);
    const componentWrite = (url) => url.pathname.endsWith('/components');
    await page.route(componentWrite, (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Synthetic forbidden', code: 'FORBIDDEN' }),
          })
        : route.continue(),
    );
    await dialog.getByRole('button', { name: /^Chọn:/ }).click();
    await expect(dialog.getByRole('alert')).toBeFocused();
    await expect(page.locator('.planning-component-row')).toHaveCount(1);
    await snapshot('composer-mutation-error-390');
    await page.unroute(componentWrite);
    await dialog.getByRole('button', { name: /^Chọn:/ }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('.planning-component-row')).toHaveCount(2);
    await snapshot('composer-saved-390');
    const after = await api(
      `${prefix}/${plan.id}/slots/${encodeURIComponent(meal.slotId)}/composition`,
    );
    assert.equal(after.status, 200);
    assert.equal(after.data.composition.components.length, 2);
    await page.reload();
    await expect(page.locator('.planning-component-row')).toHaveCount(2);
    journeys.push({
      kind: 'composition-save-reload',
      revision: after.data.planRevision,
      components: after.data.composition.components.map((item) => ({
        kind: item.kind,
        locked: item.locked,
      })),
    });
    await page.getByRole('button', { name: 'Hoàn thiện bữa này', exact: true }).click();
    await expect(page.locator('.planning-suggestions')).toBeVisible();
    await snapshot('composer-proposal-390');
    await page
      .locator('.planning-suggestions')
      .getByRole('button', { name: 'Bỏ qua', exact: true })
      .click();
    const unchanged = await api(
      `${prefix}/${plan.id}/slots/${encodeURIComponent(meal.slotId)}/composition`,
    );
    assert.equal(unchanged.data.planRevision, after.data.planRevision);
    journeys.push({
      kind: 'proposal-explicit-accept-only',
      before: after.data.planRevision,
      afterDismiss: unchanged.data.planRevision,
    });
  }
  if (variant === 'v2') {
    const planRead = (url) => url.pathname.endsWith(`/plans/${plan.id}`);
    const partial = structuredClone(plan);
    const removed = partial.result.meals.pop();
    partial.result.status = 'partial';
    partial.result.conclusion = 'no_plan_found_without_proof';
    partial.result.unplannedSlots.push({
      slotId: removed.slotId,
      date: removed.date,
      mealType: removed.mealType,
      reasons: ['SAFETY_UNKNOWN'],
    });
    await page.route(planRead, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(partial),
      }),
    );
    await page.goto(`${base}${board}`);
    await expect(page.locator('.planning-unplanned')).toHaveCount(1);
    await snapshot('planner-partial-390');
    await page.unroute(planRead);
    const stale = structuredClone(plan);
    stale.freshness.status = 'requires_revalidation';
    stale.freshness.reasons = ['stale_inventory'];
    await page.route(planRead, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(stale) }),
    );
    await page.goto(`${base}${shoppingPath}`);
    await expect(page.getByRole('heading', { name: 'Thực đơn cần được cập nhật' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Lập danh sách đi chợ', exact: true }),
    ).toBeDisabled();
    await snapshot('planner-stale-390');
    await page.unroute(planRead);
    await page.goto(`${base}${shoppingPath}`);
    await page.getByRole('textbox', { name: 'Ngân sách (không bắt buộc)' }).fill('-1');
    await page.getByRole('button', { name: 'Lập danh sách đi chợ', exact: true }).click();
    await expect(page.locator('#budget-error')).toBeFocused();
    await snapshot('shopping-budget-invalid-390');
    journeys.push({
      kind: 'partial-stale-validation',
      unplanned: 1,
      staleDisablesShopping: true,
      budgetErrorFocus: true,
    });
  }
  // Read failures never masquerade as an empty plan.
  const failedPlanRead = (url) => url.pathname.endsWith(`/plans/${plan.id}`);
  await page.route(failedPlanRead, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Synthetic unavailable', code: 'DATABASE_UNAVAILABLE' }),
    }),
  );
  await page.goto(`${base}${board}`);
  await expect(page.getByRole('alert').first()).toBeVisible();
  await snapshot('planner-read-error-390');
  await page.unroute(failedPlanRead);
  // Saved list: positive fractional quantity, confirmation, online persistence and actual queue.
  await page.goto(`${base}/shopping`);
  await expect(page.getByRole('heading', { name: 'Danh sách đang trống' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Tên nguyên liệu' }).fill('Gạo cho bữa nhà');
  await page.getByRole('spinbutton', { name: 'Số lượng' }).fill('0.125');
  await page.getByRole('combobox', { name: 'Đơn vị', exact: true }).selectOption('kg');
  await page.getByRole('button', { name: 'Thêm vào danh sách', exact: true }).click();
  await expect(page.locator('.shopping-saved-row')).toHaveCount(1);
  await expect(page.locator('.shopping-row-quantity')).toHaveText('0,125 kg');
  for (const width of [320, 390, 768, 1024, 1440]) {
    if (variant !== 'v2' && width !== 320) break;
    await page.setViewportSize({ width, height: 900 });
    await snapshot(`saved-shopping-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('checkbox', { name: /Gạo cho bữa nhà/ }).click();
  await expect(page.locator('.shopping-saved-row')).toHaveClass(/is-checked/);
  await page.getByRole('button', { name: 'Xóa khỏi danh sách: Gạo cho bữa nhà' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await snapshot('shopping-delete-dialog-390');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Xóa khỏi danh sách: Gạo cho bữa nhà' }),
  ).toBeFocused();
  assert.equal((await api('/api/v1/shopping-list')).data.items.length, 1);
  await page.getByRole('button', { name: 'Xóa khỏi danh sách: Gạo cho bữa nhà' }).click();
  await page.getByRole('button', { name: 'Xóa món', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Danh sách đang trống' })).toBeVisible();
  journeys.push({
    kind: 'saved-fractional-check-delete',
    persistedQuantity: 0.125,
    noDeleteOnDismiss: true,
  });
  const listMatcher = (url) => url.pathname.startsWith('/api/v1/shopping-list');
  await page.route(listMatcher, (route) => route.abort('internetdisconnected'));
  await page.getByRole('textbox', { name: 'Tên nguyên liệu' }).fill('Nấm chờ đồng bộ');
  await page.getByRole('spinbutton', { name: 'Số lượng' }).fill('125.5');
  await page.getByRole('combobox', { name: 'Đơn vị', exact: true }).selectOption('g');
  await page.getByRole('button', { name: 'Thêm vào danh sách', exact: true }).click();
  await expect(page.locator('.shopping-pending-label')).toHaveText('Chờ đồng bộ');
  const queue = await page.evaluate(() => JSON.parse(localStorage.getItem('frigo_sync_outbox_v1')));
  assert(
    queue.some(
      (op) =>
        op.method === 'POST' &&
        op.path === '/shopping-list/items' &&
        JSON.parse(op.body).quantity === 125.5,
    ),
  );
  await expect(page.getByText('Đang xem danh sách trên thiết bị.', { exact: false })).toBeVisible();
  await snapshot('shopping-offline-390');
  await page.unroute(listMatcher);
  // Keep replay blocked while online GET proves pending projection survives a stale server list.
  await page.route(listMatcher, (route) =>
    route.request().method() === 'GET' ? route.continue() : route.abort('internetdisconnected'),
  );
  await page.reload();
  await expect(page.locator('.shopping-saved-row')).toHaveCount(1);
  await expect(page.locator('.shopping-pending-label')).toBeVisible();
  journeys.push({
    kind: 'durable-offline-projection',
    operations: queue.map((op) => ({ method: op.method, path: op.path })),
    overlayOnServerRead: true,
  });
  // A late generation response cannot navigate a screen abandoned through SPA navigation.
  await page.goto(`${base}/planner/new`);
  let release;
  const barrier = new Promise((resolve) => {
    release = resolve;
  });
  let started;
  const dispatched = new Promise((resolve) => {
    started = resolve;
  });
  const generation = (url) => url.pathname === '/api/v1/meal-planning/plans';
  await page.route(generation, async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    started();
    await barrier;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(plan),
    });
  });
  await page.getByRole('button', { name: 'Tạo thực đơn', exact: true }).click();
  await dispatched;
  await page.getByRole('link', { name: 'Danh sách mua sắm đã lưu' }).click();
  await expect(page.getByRole('heading', { name: 'Mua đủ cho bữa ngon.' })).toBeVisible();
  release();
  await page.unroute(generation);
  await expect(page).toHaveURL(`${base}/shopping`);
  journeys.push({ kind: 'late-generation-spa', stayedOnShopping: true });
  if (variant === 'v2') {
    await page.goto(`${base}${board}`);
    await expect(page.locator('.planning-day-board')).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => {
      const entries = [...document.querySelectorAll('.planning-workspace *')].map((el) => [
        el,
        parseFloat(getComputedStyle(el).fontSize),
      ]);
      for (const [el, size] of entries) el.style.fontSize = `${size * 2}px`;
    });
    await snapshot('planner-text-enlarged-320');
    await page.goto(`${base}/shopping`);
    await page
      .getByRole('textbox', { name: 'Tên nguyên liệu' })
      .fill('Tên nguyên liệu dài cần đọc hết trong danh sách');
    await page.getByRole('spinbutton', { name: 'Số lượng' }).fill('125.5');
    await page.evaluate(() => {
      const entries = [...document.querySelectorAll('.shopping-workspace *')].map((el) => [
        el,
        parseFloat(getComputedStyle(el).fontSize),
      ]);
      for (const [el, size] of entries) el.style.fontSize = `${size * 2}px`;
    });
    const enlargedShopping = await page.evaluate(() => {
      const heading = document.querySelector('.kitchen-page-heading');
      const description = heading.querySelector(':scope > div > div');
      const action = heading.querySelector(':scope > a');
      const button = document.querySelector('.shopping-add-form button[type=submit]');
      const style = getComputedStyle(description);
      return {
        descriptionFont: parseFloat(style.fontSize),
        descriptionLineHeight: parseFloat(style.lineHeight),
        headingBottom: heading.firstElementChild.getBoundingClientRect().bottom,
        actionTop: action.getBoundingClientRect().top,
        actionWidth: action.getBoundingClientRect().width,
        buttonHeight: button.clientHeight,
        buttonContentHeight: button.scrollHeight,
      };
    });
    assert(enlargedShopping.descriptionLineHeight >= enlargedShopping.descriptionFont * 1.5);
    assert(enlargedShopping.actionTop >= enlargedShopping.headingBottom);
    assert(enlargedShopping.actionWidth >= 140);
    assert(enlargedShopping.buttonContentHeight <= enlargedShopping.buttonHeight);
    await snapshot('shopping-text-enlarged-320');
    checks.at(-1).enlargedShopping = enlargedShopping;
    await page.getByRole('textbox', { name: 'Tên nguyên liệu' }).fill('');
    await page.setViewportSize({ width: 390, height: 420 });
    await page.goto(`${base}/shopping`);
    await page
      .getByRole('button', { name: 'Thêm vào danh sách', exact: true })
      .scrollIntoViewIfNeeded();
    await snapshot('shopping-short-390');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${base}${board}`);
    await expect(page.locator('.planning-day-board')).toBeVisible();
    await snapshot('planner-motion-390');
  }
  const stockAfter = await api('/api/v1/inventory');
  assert.deepEqual(
    stockAfter.data,
    stockBefore.data,
    'Planning/shopping checks must not mutate inventory',
  );
  journeys.push({
    kind: 'inventory-unchanged',
    stockBefore: stockBefore.data,
    stockAfter: stockAfter.data,
  });
  assert.deepEqual(errors, []);
  console.log(
    `PASS ${variant}: ${checks.length} axe/layout checks, ${journeys.length} journey groups, no page errors`,
  );
} finally {
  await writeFile(
    resolve(out, 'browser-observations.json'),
    JSON.stringify({ variant, syntheticLocalOnly: true, checks, journeys, errors }, null, 2),
  );
  await browser.close();
}
