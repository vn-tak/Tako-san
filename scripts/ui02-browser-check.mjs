import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5197';
assert(
  ['127.0.0.1', 'localhost'].includes(new URL(base).hostname),
  'Local synthetic preview required',
);
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui02/browser');
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
const errors = [];
const observations = [];
page.on('pageerror', (error) => errors.push(error.message));
async function snapshot(name) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily,
    revealAnimations: [...document.querySelectorAll('.animate-fade-in')].map(
      (element) => getComputedStyle(element).animationName,
    ),
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
  }));
  assert(layout.documentWidth <= layout.viewport, `${name}: horizontal overflow`);
  assert(layout.font.includes('Be Vietnam Pro'), `${name}: font`);
  assert(
    layout.revealAnimations.every((animation) => animation === 'none'),
    `${name}: reduced motion`,
  );
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const violations = axe.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }));
  observations.push({ name, url: page.url(), ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  if (name === 'discovery-390' || name === 'discovery-1440')
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  console.log(`${name}: overflow0 / axe0`);
}
async function localApi(path, method = 'GET', body, key) {
  const result = await page.evaluate(
    async ({ path, method, body, key }) => {
      const response = await fetch(`/api/v1${path}`, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Frigo-Expected-User-Id': localStorage.getItem('frigo_user_id'),
          'X-Frigo-Expected-Household-Id': localStorage.getItem('frigo_household_id'),
          ...(key ? { 'Idempotency-Key': key } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: response.status, data: await response.json() };
    },
    { path, method, body, key },
  );
  assert(result.status < 300, `${method} ${path}: ${JSON.stringify(result)}`);
  return result.data;
}
const primary = () => page.getByTestId('t18c-home-primary');
const grid = () => page.getByTestId('recipe-discovery-grid');
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  await primary().getByRole('heading', { name: 'Chưa có thực đơn hiện tại' }).waitFor();
  await snapshot('home-no-plan-390');
  const tomorrow = new Date(Date.now() + 9 * 3600000 + 86400000).toISOString().slice(0, 10);
  const plan = await localApi(
    '/meal-planning/plans',
    'POST',
    {
      startDate: tomorrow,
      defaultServings: 2,
      utcOffsetMinutes: 540,
      mode: 'shopping_allowed',
      slots: [{ date: tomorrow, mealType: 'dinner' }],
    },
    `ui02_${Date.now()}`,
  );
  const slotId = `${tomorrow}:dinner:0`;
  const componentPath = `/meal-planning/plans/${plan.id}/slots/${encodeURIComponent(slotId)}/components`;
  const first = await localApi(componentPath, 'POST', {
    revision: plan.revision,
    target: { kind: 'simple_food', simpleFoodId: 'sf-steamed-rice' },
    role: 'staple',
    locked: true,
  });
  const added = await localApi(componentPath, 'POST', {
    revision: first.planRevision,
    target: { kind: 'simple_food', simpleFoodId: 'sf-boiled-egg' },
    role: 'simple_food',
    locked: true,
  });
  const titles = added.composition.components.map((item) => item.title);
  const compPath = `/api/v1/meal-planning/plans/${plan.id}/compositions`;
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(base);
    await primary().getByText(titles.at(-1), { exact: true }).waitFor();
    assert.match(await primary().innerText(), /Thực đơn bắt đầu ngày mai/);
    for (const title of titles) assert((await primary().innerText()).includes(title));
    assert.equal(
      await primary().getByRole('link', { name: 'Xem bữa ăn' }).getAttribute('href'),
      `/planner/${plan.id}/meal/${encodeURIComponent(slotId)}`,
    );
    await snapshot(`home-${width}`);
    await page.goto(`${base}/recipes`);
    await grid().locator('a').first().waitFor();
    assert.equal(await grid().locator('a').count(), 24);
    assert.equal(
      await page.locator('.discovery-filter-panel').evaluate((element) => element.open),
      width >= 1280,
    );
    await snapshot(`discovery-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/planner/${plan.id}/meal/${encodeURIComponent(slotId)}`);
  for (const title of titles) await page.getByText(title, { exact: true }).first().waitFor();
  observations.push({
    name: 'home-planner-authority',
    planId: plan.id,
    planRevision: added.planRevision,
    titles,
    localWorker: true,
  });
  await page.goto(base);
  await primary().getByText(titles.at(-1), { exact: true }).waitFor();
  await page
    .getByTestId('t18c-home-recommendations')
    .locator('a[href^="/recipes/"]')
    .first()
    .click();
  await page.locator('.recipe-intro h1').waitFor();
  assert.equal(
    await page.getByRole('link', { name: 'Quay lại', exact: true }).getAttribute('href'),
    '/',
  );
  await page.getByRole('link', { name: 'Quay lại', exact: true }).click();
  await page.waitForURL(`${base}/`);
  observations.push({ name: 'home-recipe-return', returnTo: '/', nativeBackLink: true });
  await page.goto(`${base}/recipes`);
  await grid().locator('a').first().waitFor();
  const firstTitle = await grid().locator('h3').first().innerText();
  await page.getByRole('link', { name: 'Tiếp', exact: true }).click();
  await page.waitForURL(/page=2/);
  assert.equal(await grid().locator('a').count(), 24);
  assert.notEqual(await grid().locator('h3').first().innerText(), firstTitle);
  assert.equal(
    await page
      .locator('#recipes-results-heading')
      .evaluate((element) => element === document.activeElement),
    true,
  );
  const laterTitle = await grid().locator('h3').first().innerText();
  await page.reload();
  await grid().locator('a').first().waitFor();
  assert.equal(await grid().locator('h3').first().innerText(), laterTitle);
  await grid().locator('a').first().click();
  await page.locator('.recipe-intro h1').waitFor();
  assert.equal(
    await page.getByRole('link', { name: 'Quay lại', exact: true }).getAttribute('href'),
    '/recipes?page=2',
  );
  await page.getByRole('link', { name: 'Quay lại', exact: true }).click();
  await page.waitForURL(/page=2/);
  await grid().locator('a').first().waitFor();
  await page.getByRole('searchbox', { name: 'Tìm món hoặc nguyên liệu' }).fill(laterTitle);
  await page.getByRole('heading', { name: `Kết quả cho “${laterTitle}”` }).waitFor();
  assert.equal(new URL(page.url()).searchParams.has('page'), false);
  assert((await grid().innerText()).includes(laterTitle));
  await page.reload();
  await grid().locator('a').first().waitFor();
  assert.equal(await page.getByRole('searchbox').inputValue(), laterTitle);
  await page.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc' }).click();
  assert.equal(
    await page.getByRole('searchbox').evaluate((element) => element === document.activeElement),
    true,
  );
  await grid().locator('a').first().waitFor();
  await page.locator('.discovery-filter-panel > summary').click();
  await page.getByRole('combobox', { name: 'Ẩm thực' }).selectOption('japanese');
  await page.waitForURL(/cuisine=japanese/);
  await grid().locator('a').first().waitFor();
  await page.reload();
  await grid().locator('a').first().waitFor();
  await page.locator('.discovery-filter-panel > summary').click();
  assert.equal(await page.getByRole('combobox', { name: 'Ẩm thực' }).inputValue(), 'japanese');
  await page.goBack();
  await page.waitForURL(`${base}/recipes`);
  observations.push({
    name: 'discovery-url-journey',
    clientPageSize: 24,
    reload: true,
    detailReturn: true,
    searchLaterPage: true,
    resetFocus: true,
    categoricalHistory: true,
  });

  const composition = await localApi(`/meal-planning/plans/${plan.id}/compositions`);
  let release;
  const gate = new Promise((done) => {
    release = done;
  });
  const compositionUrl = (url) => url.pathname === compPath;
  const pending = async (route) => {
    await gate;
    await route.fulfill({ json: composition });
  };
  await page.route(compositionUrl, pending);
  await page.goto(base);
  await primary().getByRole('heading', { name: 'Đang tải các món trong bữa…' }).waitFor();
  for (const title of titles)
    assert.equal(await primary().getByText(title, { exact: true }).count(), 0);
  await snapshot('home-composition-pending-390');
  release();
  await primary().getByText(titles.at(-1), { exact: true }).waitFor();
  await page.unroute(compositionUrl, pending);
  for (const scenario of ['500', 'missing', 'mismatch', '404']) {
    const intercept = (route) =>
      route.fulfill(
        scenario === '500' || scenario === '404'
          ? { status: Number(scenario), json: { code: 'SYNTHETIC_CHECK' } }
          : {
              json:
                scenario === 'missing'
                  ? { ...composition, compositions: [] }
                  : { ...composition, planRevision: composition.planRevision + 1 },
            },
      );
    await page.route(compositionUrl, intercept);
    await page.goto(base);
    if (scenario === '404') {
      const anchor = plan.result.meals[0];
      assert(anchor, '404 compatibility case needs a V1 anchor');
      await primary().getByRole('heading', { name: anchor.title, exact: true }).waitFor();
    } else {
      await primary()
        .getByRole('heading', { name: 'Chưa kiểm tra được các món trong bữa' })
        .waitFor();
      for (const title of titles)
        assert.equal(await primary().getByText(title, { exact: true }).count(), 0);
    }
    await snapshot(`home-composition-${scenario}-390`);
    await page.unroute(compositionUrl, intercept);
  }
  await page.goto(base);
  await primary().getByText(titles.at(-1), { exact: true }).waitFor();
  await page.reload();
  await primary().getByText(titles.at(-1), { exact: true }).waitFor();
  await page.keyboard.press('Tab');
  assert.equal(
    await page
      .getByRole('link', { name: 'Đến nội dung chính' })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.keyboard.press('Enter');
  assert.equal(
    await page.locator('#kitchen-main').evaluate((element) => element === document.activeElement),
    true,
  );
  await page.goto(`${base}/inventory`);
  await page.getByTestId('inventory-row').first().waitFor();
  await page.setViewportSize({ width: 320, height: 844 });
  await snapshot('inventory-header-320');
  await page.goto(`${base}/recipes/thit-kho-trung`);
  await page.locator('.recipe-intro h1').waitFor();
  await snapshot('detail-header-320');
  await page.goto(base);
  await primary().getByText(titles.at(-1), { exact: true }).waitFor();
  await page.evaluate(() => {
    document.querySelector('.home-meal-title').textContent =
      'Bữa cơm gia đình với rau củ theo mùa và những món ăn có tên rất dài để kiểm tra khả năng xuống dòng trên màn hình nhỏ';
  });
  await snapshot('home-long-title-320');
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const todayPlan = await localApi(
    '/meal-planning/plans',
    'POST',
    {
      startDate: today,
      defaultServings: 2,
      utcOffsetMinutes: 540,
      mode: 'shopping_allowed',
      slots: [{ date: today, mealType: 'dinner' }],
    },
    `ui02_today_${Date.now()}`,
  );
  await page.goto(base);
  await primary().getByText('Bữa tối · Hôm nay', { exact: true }).waitFor();
  await primary()
    .getByRole('heading', { name: todayPlan.result.meals[0].title, exact: true })
    .waitFor();
  await snapshot('home-today-320');
  await page.goto(`${base}/recipes?q=khongcomonnaokhopmotchuoidayratdai`);
  await page.getByRole('heading', { name: 'Không tìm thấy món phù hợp' }).waitFor();
  await snapshot('discovery-empty-320');
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  assert.equal(
    await page.getByRole('searchbox').evaluate((element) => element === document.activeElement),
    true,
  );
  assert.deepEqual(errors, []);
} finally {
  await writeFile(
    resolve(out, 'browser-observations.json'),
    JSON.stringify({ base, syntheticLocalOnly: true, observations, errors }, null, 2) + '\n',
  );
  await browser.close();
}
