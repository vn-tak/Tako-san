import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5203';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui09/week-audit');
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
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
async function shot(name) {
  await page.evaluate(() => document.fonts.ready);
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
    font: getComputedStyle(document.querySelector('main') ?? document.body).fontFamily,
    brokenImages: [...document.images]
      .filter((im) => im.complete && !im.naturalWidth)
      .map((im) => im.getAttribute('src')),
  }));
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((n) => n.target),
  }));
  checks.push({ name, path: new URL(page.url()).pathname, ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  console.log(`${name}: overflow=${layout.scrollWidth - layout.width} / axe=${violations.length}`);
}
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(`${base}/week`);
    await page
      .getByRole('button', { name: 'Lên thực đơn tuần ngay', exact: true })
      .waitFor()
      .catch(() =>
        page
          .getByRole('button', { name: /thực đơn/ })
          .first()
          .waitFor(),
      );
    await shot(`week-home-${width}`);
    await page.goto(`${base}/week/setup`);
    await page.getByRole('heading', { name: /Bạn muốn Takosan/ }).waitFor();
    await shot(`week-setup-${width}`);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/week/setup`);
  await page.getByRole('heading', { name: /Bạn muốn Takosan/ }).waitFor();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await shot('week-budget-320');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await shot('week-schedule-320');
  await page.getByRole('button', { name: 'Ăn ngoài', exact: true }).first().click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await shot('week-priorities-320');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await shot('week-frequency-320');
  let generatePayload;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/v1/week/plans')
      generatePayload = request.postDataJSON();
  });
  const disabled = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meal-planning/plans');
    return { status: r.status, body: await r.json() };
  });
  assert.equal(disabled.status, 404);
  assert.equal(disabled.body.code, 'MEAL_PLANNER_DISABLED');
  journeys.push({
    kind: 'server-and-browser-planner-disabled',
    status: disabled.status,
    code: disabled.body.code,
  });
  const stockBefore = await page.evaluate(async () => (await fetch('/api/v1/inventory')).json());
  await page.getByRole('button', { name: 'Tạo thực đơn tuần ngay', exact: true }).click();
  await expect.poll(() => generatePayload).toBeTruthy();
  await page.waitForURL(/\/week\/[^/]+$/);
  await page
    .getByRole('button', { name: /Đi chợ|Danh sách mua/ })
    .first()
    .waitFor();
  await shot('week-generated-board-320');
  assert(!Object.hasOwn(generatePayload, 'daySchedules'));
  assert(!Object.hasOwn(generatePayload, 'dayTypes'));
  journeys.push({
    kind: 'real-flag-off-week-generation-ignores-unsent-schedule',
    payloadKeys: Object.keys(generatePayload),
    scheduleSelected: 'first day eat_out',
    stockBefore,
  });
  const planId = new URL(page.url()).pathname.split('/').at(-1);
  const actualPlan = await page.evaluate(
    async (id) => (await fetch(`/api/v1/week/plans/${id}`)).json(),
    planId,
  );
  journeys.at(-1).returnedFirstDayType = actualPlan.plan.days[0].dayType;
  assert.notEqual(actualPlan.plan.days[0].dayType, 'eat_out');
  await page.goto(`${base}/week/${planId}/shopping`);
  await page.getByRole('button', { name: 'Bắt đầu đi chợ', exact: true }).waitFor();
  await shot('week-shopping-320');
  await page.goto(`${base}/week/${planId}/settings`);
  await page.getByRole('button', { name: 'Lưu thiết lập', exact: true }).waitFor();
  await shot('week-settings-320');
  await page.goto(`${base}/week/setup`);
  await page.getByRole('heading', { name: /Bạn muốn Takosan/ }).waitFor();
  await page.evaluate(() => {
    const es = [...document.querySelectorAll('main *')];
    const sizes = es.map((el) => parseFloat(getComputedStyle(el).fontSize));
    es.forEach((el, i) => {
      el.style.fontSize = `${sizes[i] * 2}px`;
    });
  });
  await shot('week-setup-enlarged-320');
  const stockAfter = await page.evaluate(async () => (await fetch('/api/v1/inventory')).json());
  assert.deepEqual(stockAfter, stockBefore);
  journeys.at(-1).stockBefore = undefined;
  journeys.at(-1).stockUnchanged = true;
  console.log(
    `AUDIT ${checks.length}screens; no whole-Week PASS claim;${errors.length}page errors`,
  );
} finally {
  await writeFile(
    resolve(out, 'audit.json'),
    JSON.stringify({ base, checks, journeys, errors }, null, 2),
  );
  await browser.close();
}
