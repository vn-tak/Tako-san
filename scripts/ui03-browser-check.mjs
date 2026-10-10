import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5197';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Local preview required');
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui03/browser');
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
const observations = [];
const errors = [];
const apiReads = [];
const recipePhotos = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => {
  const path = new URL(request.url()).pathname;
  if (path.startsWith('/api/v1/')) apiReads.push({ path, query: new URL(request.url()).search });
  if (
    path === '/frigo/illustrations/delicious-meal.png' ||
    request.url().includes('images.unsplash.com')
  )
    recipePhotos.push(request.url());
});
async function snapshot(name) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily,
    animations: [...document.querySelectorAll('.animate-fade-in')].map(
      (element) => getComputedStyle(element).animationName,
    ),
    cards: document.querySelectorAll('.discovery-grid > a').length,
    brokenImages: [...document.images]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
  }));
  assert(layout.documentWidth <= layout.viewport, `${name}: overflow`);
  assert(layout.font.includes('Be Vietnam Pro'), `${name}: font`);
  assert(
    layout.animations.every((value) => value === 'none'),
    `${name}: reduced motion`,
  );
  assert.equal(layout.brokenImages.length, 0, `${name}: broken images`);
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
  console.log(`${name}: overflow0 / axe0 / broken0`);
}
async function localApi(path, method = 'GET', body, key) {
  return page.evaluate(
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
      const raw = await response.text();
      return { status: response.status, data: JSON.parse(raw), raw };
    },
    { path, method, body, key },
  );
}
const grid = () => page.getByTestId('recipe-discovery-grid');
const titles = () => grid().locator('h3').allTextContents();
const discoveryPath = (url) => url.pathname === '/api/v1/recipe-discovery';
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  await page
    .getByTestId('t18c-home-recommendations')
    .locator('a[href^="/recipes/"]')
    .nth(2)
    .waitFor();
  assert.equal(
    await page.getByTestId('t18c-home-recommendations').locator('a[href^="/recipes/"]').count(),
    3,
  );
  await snapshot('home-summary-390');
  const full = await localApi('/recommendations');
  const initial = await localApi('/recipe-discovery');
  assert.equal(initial.status, 200);
  assert.equal(initial.data.total, 500);
  assert.equal(initial.data.items.length, 24);
  assert(Buffer.byteLength(initial.raw) < 100 * 1024);
  assert(!/"ingredients"|"steps"|"nutrition"|"ingredientAvailability"/.test(initial.raw));
  const ids = initial.data.items.map((item) => item.recipe.id);
  let current = initial.data;
  while (current.nextCursor) {
    const response = await localApi(
      `/recipe-discovery?page=${current.page + 1}&cursor=${current.nextCursor}`,
    );
    assert.equal(response.status, 200);
    current = response.data;
    ids.push(...current.items.map((item) => item.recipe.id));
  }
  assert.equal(ids.length, 500);
  assert.equal(new Set(ids).size, 500);
  observations.push({
    name: 'network-catalog',
    legacyBytes: Buffer.byteLength(full.raw),
    legacyGzipBytes: gzipSync(full.raw).length,
    summaryBytes: Buffer.byteLength(initial.raw),
    summaryGzipBytes: gzipSync(initial.raw).length,
    pages: current.pages,
    uniqueRecipes: new Set(ids).size,
    note: 'Raw JSON and locally computed gzip sizes; not wire-compression or latency measurements.',
  });
  apiReads.length = 0;
  recipePhotos.length = 0;
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}/recipes`);
    await grid().locator('a').nth(23).waitFor();
    assert.equal(await grid().locator('a').count(), 24);
    assert.equal(
      await page.locator('.discovery-filter-panel').evaluate((element) => element.open),
      width >= 1280,
    );
    await snapshot(`discovery-${width}`);
  }
  assert(
    !apiReads.some(
      (request) =>
        request.path === '/api/v1/recommendations' || /^\/api\/v1\/recipes\//.test(request.path),
    ),
    'List must not fetch legacy list or detail',
  );
  assert.deepEqual(recipePhotos, [], 'Quarantined recipe images must not be requested');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/recipes`);
  await grid().locator('a').nth(23).waitFor();
  const page1Titles = await titles();
  const next = page.getByRole('link', { name: 'Tiếp', exact: true });
  const nextHref = await next.getAttribute('href');
  assert(nextHref.includes('cursor=v1.2.'));
  await next.click();
  await page.waitForURL(/page=2/);
  await grid().locator('a').nth(23).waitFor();
  const page2Titles = await titles();
  assert(page2Titles.every((title) => !page1Titles.includes(title)));
  assert.equal(
    await page
      .locator('#recipes-results-heading')
      .evaluate((element) => element === document.activeElement),
    true,
  );
  const page2Url = page.url();
  await page.reload();
  await grid().locator('a').nth(23).waitFor();
  assert.deepEqual(await titles(), page2Titles);
  await snapshot('discovery-page2-390');
  await grid().locator('a').first().click();
  await page.locator('.recipe-intro h1').waitFor();
  const detailRequest = apiReads.findLast((request) => /^\/api\/v1\/recipes\//.test(request.path));
  assert(detailRequest, 'Detail must load separately');
  const back = page.getByRole('link', { name: 'Quay lại', exact: true });
  assert.equal(
    await back.getAttribute('href'),
    new URL(page2Url).pathname + new URL(page2Url).search,
  );
  await snapshot('detail-neutral-390');
  await back.click();
  await grid().locator('a').nth(23).waitFor();
  assert.deepEqual(await titles(), page2Titles);
  const searchTitle = page2Titles[0];
  const plain = searchTitle
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd');
  await page.getByRole('searchbox').fill(plain);
  await grid().getByRole('heading', { name: searchTitle, exact: true }).waitFor();
  assert(!new URL(page.url()).searchParams.has('cursor'));
  assert(!new URL(page.url()).searchParams.has('page'));
  await page.reload();
  await grid().getByRole('heading', { name: searchTitle, exact: true }).waitFor();
  await snapshot('discovery-search-390');
  await page.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc', exact: true }).click();
  await grid().locator('a').nth(23).waitFor();
  assert.equal(
    await page.getByRole('searchbox').evaluate((element) => element === document.activeElement),
    true,
  );
  await page.locator('.discovery-filter-panel > summary').click();
  await page.locator('select[name="cuisine"]').selectOption('japanese');
  await page.getByRole('button', { name: 'Tối đa 20 phút', exact: true }).click();
  await grid().locator('a').first().waitFor();
  await page.reload();
  await grid().locator('a').first().waitFor();
  const filtered = await localApi('/recipe-discovery?cuisine=japanese&maxTime=20');
  assert(
    filtered.data.items.every(
      (item) => item.recipe.cuisine === 'japanese' && item.recipe.cookTimeMinutes <= 20,
    ),
  );
  await snapshot('discovery-filtered-390');
  await page.goto(page2Url);
  await grid().locator('a').nth(23).waitFor();
  const inventory = await localApi('/inventory');
  const lot = inventory.data.items[0];
  const mutation = await localApi(
    `/inventory/${encodeURIComponent(lot.id)}`,
    'PATCH',
    {
      quantity: lot.quantity + 1,
      version: lot.version,
    },
    `ui03-local-${Date.now()}`,
  );
  assert(mutation.status < 300, mutation.raw);
  await page.reload();
  await page.getByRole('heading', { name: 'Danh sách món cần tải lại' }).waitFor();
  assert.equal(await grid().count(), 0);
  await snapshot('discovery-snapshot-changed-390');
  await page.getByRole('button', { name: 'Tải lại từ trang đầu', exact: true }).click();
  await grid().locator('a').nth(23).waitFor();
  assert(!new URL(page.url()).searchParams.has('cursor'));
  assert.equal(
    await page
      .locator('#recipes-results-heading')
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.goto(`${base}/recipes?page=9999`);
  await grid().locator('a').first().waitFor();
  await page.waitForURL(/page=21/);
  assert.equal(await grid().locator('a').count(), 20);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/recipes?q=khongcomonnaoday`);
  await page.getByRole('heading', { name: 'Không tìm thấy món phù hợp' }).waitFor();
  await snapshot('discovery-empty-320');
  await context.route(discoveryPath, (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Chưa kiểm tra được nguyên liệu trong tủ',
        code: 'DATABASE_UNAVAILABLE',
      }),
    }),
  );
  await page.goto(`${base}/recipes`);
  await page.getByRole('button', { name: 'Thử lại', exact: true }).waitFor();
  assert.equal(await grid().count(), 0);
  await snapshot('discovery-read-error-320');
  await context.unroute(discoveryPath);
  await page.evaluate(() => localStorage.setItem('frigo_guest_offline', 'true'));
  await page.goto(`${base}/recipes`);
  await grid().locator('a').nth(23).waitFor();
  await page
    .getByText('Đang dùng công thức và nguyên liệu lưu trên thiết bị.', { exact: false })
    .waitFor();
  await snapshot('discovery-offline-320');
  await page.evaluate(() => localStorage.removeItem('frigo_guest_offline'));
  await page.goto(`${base}/recipes?cursor=broken&page=2`);
  await page.getByRole('heading', { name: 'Danh sách món cần tải lại' }).waitFor();
  await snapshot('discovery-invalid-link-320');
  assert.deepEqual(errors, []);
  observations.push({
    name: 'journeys',
    passed: [
      'Home3-summary',
      'all500-unique',
      'server-page-reload',
      'catalog-detail-return',
      'accent-search-beyond24',
      'filter-reload',
      'inventory-change409-restart',
      'deep-link-clamp',
      'empty',
      '503-no-fallback',
      'offline-source',
      'invalid-link-recovery',
    ],
  });
} finally {
  await writeFile(
    resolve(out, 'browser-observations.json'),
    JSON.stringify({ base, syntheticLocalOnly: true, observations, errors }, null, 2) + '\n',
  );
  await browser.close();
}
