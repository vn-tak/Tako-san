import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5212';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui12/states');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 320, height: 844 },
  locale: 'vi-VN',
  serviceWorkers: 'block',
  reducedMotion: 'reduce',
});
await context.route(
  (url) => url.origin !== base,
  (route) => route.abort(),
);
const page = await context.newPage(),
  checks = [],
  journeys = [],
  errors = [],
  writes = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('request', (r) => {
  if (new URL(r.url()).pathname.startsWith('/api/v1/') && !['GET', 'HEAD'].includes(r.method()))
    writes.push({ method: r.method(), path: new URL(r.url()).pathname });
});
const get = (path) =>
  page.evaluate(async (path) => {
    const r = await fetch(`/api/v1${path}`);
    return { status: r.status, data: await r.json() };
  }, path);
async function enlarge() {
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('.takosan-rebuild *')],
      sizes = els.map((el) => parseFloat(getComputedStyle(el).fontSize));
    els.forEach((el, i) => (el.style.fontSize = `${sizes[i] * 2}px`));
  });
}
async function shot(name, synthetic = false) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach((el) => (el.loading = 'eager'));
  });
  await page.waitForFunction(() =>
    [...document.images].every((im) => im.complete && im.naturalWidth),
  );
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: document.querySelectorAll('h1').length,
    clipped: [
      ...document.querySelectorAll(
        '.recipe-page p,.recipe-page button,.recipe-badges span,.recipe-nutrition-grid p',
      ),
    ]
      .filter(
        (el) =>
          el.getBoundingClientRect().width &&
          el.getBoundingClientRect().height &&
          (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2),
      )
      .map((el) => el.textContent.trim()),
    media: [...document.querySelectorAll('[data-recipe-media]')].map(
      (el) => el.dataset.recipeMedia,
    ),
  }));
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
  checks.push({ name, synthetic, ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  assert.equal(layout.width, layout.scrollWidth, name);
  assert.equal(layout.h1, 1, name);
  assert.deepEqual(layout.clipped, [], name);
  assert.deepEqual(violations, [], name);
  console.log(name, 'PASS');
}
let release;
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  const before = await get('/inventory'),
    writeStart = writes.length;
  const original = (await get('/recipes/thit-kho-trung')).data;
  const longRecipe = {
    ...original,
    recipe: {
      ...original.recipe,
      id: 'ui12-state',
      slug: 'ui12-state',
      title:
        'Công thức có tên rất dài để kiểm tra cách trình bày nguyên liệu và dinh dưỡng trên màn hình nhỏ',
      description: original.recipe.description.repeat(3),
      nutrition: null,
      media: null,
    },
  };
  let phase = 'pending';
  const pending = new Promise((resolve) => (release = resolve));
  const endpoint = (url) => url.pathname === '/api/v1/recipes/ui12-state';
  await page.route(endpoint, async (route) => {
    if (phase === 'pending') await pending;
    if (phase === 'error')
      return route.fulfill({ status: 500, json: { error: 'UI12 synthetic read failure' } });
    return route.fulfill({ status: 200, json: longRecipe });
  });
  await page.goto(`${base}/recipes/ui12-state`);
  await page.getByText('Đang tải công thức…', { exact: true }).waitFor();
  await shot('recipe-loading', true);
  phase = 'error';
  release();
  await page.getByRole('alert').filter({ hasText: 'Không tải được dữ liệu' }).waitFor();
  await shot('recipe-error', true);
  await enlarge();
  await shot('recipe-error-text2', true);
  phase = 'ready';
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('heading', { name: longRecipe.recipe.title, exact: true }).waitFor();
  journeys.push({ kind: 'recipe-pending-error-real-retry-success', synthetic: true });
  // Reload to clear synthetic font styles while keeping the same route response.
  await page.goto(`${base}/recipes/ui12-state`);
  await page.locator('.recipe-overview').waitFor();
  await shot('recipe-long-title', true);
  await page.getByRole('tab', { name: 'Dinh dưỡng', exact: true }).click();
  await expect(
    page.getByText('Món này chưa có thông tin dinh dưỡng.', { exact: true }),
  ).toBeVisible();
  await shot('recipe-nutrition-unknown', true);
  await enlarge();
  await shot('recipe-long-unknown-text2', true);
  await page.goto(`${base}/recipes/ui12-does-not-exist`);
  await page.getByRole('heading', { name: 'Không tìm thấy công thức này', exact: true }).waitFor();
  await shot('recipe-404');
  await enlarge();
  await shot('recipe-404-text2', true);
  await page.getByRole('button', { name: 'Xem tất cả công thức', exact: true }).click();
  await page.waitForURL(`${base}/recipes`);
  await page.locator('.discovery-grid > a').first().waitFor();
  journeys.push({ kind: '404-return-to-catalog' });
  await page.goto(`${base}/recipes?q=khongcomonnay-ui12`);
  await page.getByText('Không tìm thấy món phù hợp', { exact: true }).waitFor();
  await shot('discovery-empty');
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await page.locator('.discovery-grid > a').first().waitFor();
  journeys.push({ kind: 'search-empty-reset-real-results' });
  await page.goto(`${base}/recipes?cuisine=japanese`);
  await page.locator('.discovery-grid > a').first().waitFor();
  await page.locator('.discovery-grid > a').first().focus();
  await page.keyboard.press('Enter');
  await page.locator('.recipe-overview').waitFor();
  await expect(page.getByRole('link', { name: 'Quay lại', exact: true })).toHaveAttribute(
    'href',
    '/recipes?cuisine=japanese',
  );
  await page.getByRole('link', { name: 'Quay lại', exact: true }).click();
  await page.waitForURL(`${base}/recipes?cuisine=japanese`);
  journeys.push({ kind: 'native-card-Enter-filtered-detail-back' });
  await page.goto(`${base}/recipes`);
  await page.locator('.discovery-grid > a').first().waitFor();
  await page.getByRole('link', { name: 'Tiếp', exact: true }).click();
  await page.waitForURL(/page=2/);
  await expect(page.locator('#recipes-results-heading')).toBeFocused();
  journeys.push({ kind: 'native-pagination-results-focus' });
  await page.goto(`${base}/recipes/thit-kho-trung`);
  await page.locator('.recipe-overview').waitFor();
  await page.evaluate(() => fetch('/__preview/t13r-b-fail-inventory-reads', { method: 'POST' }));
  await page.reload();
  await page.getByRole('alert').waitFor();
  await expect(page.locator('.kitchen-recipe-action button')).toBeDisabled();
  await expect(page.getByText('Chưa kiểm tra được lượng trong tủ', { exact: true })).toBeVisible();
  await shot('inventory-read-error');
  await page.evaluate(() => fetch('/__preview/t13r-b-restore-inventory-reads', { method: 'POST' }));
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.locator('.kitchen-recipe-action button')).toBeEnabled();
  journeys.push({ kind: 'inventory-error-disabled-Cook-retry-no-invented-stock', synthetic: true });
  const global = (await get('/recipes/pasta-pomodoro')).data;
  let photoMode = 'canonical';
  const withMedia = {
    ...global,
    recipe: {
      ...global.recipe,
      media: {
        hero: {
          url: '/api/v1/recipe-media/ui12/hero/2',
          source: 'canonical_r2',
          version: 2,
          width: 1200,
          height: 800,
        },
      },
    },
  };
  await page.route(
    (url) => url.pathname === '/api/v1/recipes/pasta-pomodoro',
    (route) => route.fulfill({ json: withMedia }),
  );
  await page.route(
    (url) => url.pathname === '/api/v1/recipe-media/ui12/hero/2',
    async (route) => {
      if (photoMode === 'canonical') {
        const r = await route.fetch({ url: `${base}/frigo/recipes/global/pasta-pomodoro.webp` });
        return route.fulfill({ response: r });
      }
      return route.fulfill({ status: 404, body: '' });
    },
  );
  await page.route(
    (url) => url.pathname === '/frigo/recipes/global/pasta-pomodoro.webp',
    (route) =>
      photoMode === 'missing' ? route.fulfill({ status: 404, body: '' }) : route.continue(),
  );
  for (const mode of ['canonical', 'fallback', 'missing']) {
    photoMode = mode;
    await page.goto(`${base}/recipes/pasta-pomodoro`);
    await page.locator('.recipe-overview').waitFor();
    await expect(page.locator('.recipe-cover')).toHaveAttribute(
      'data-recipe-media',
      mode === 'missing' ? 'missing' : 'photo',
    );
    await shot(`media-${mode}`, true);
  }
  journeys.push({
    kind: 'canonical-photo-to-allowed-legacy-to-HTML-missing-no-loop',
    synthetic: true,
  });
  const after = await get('/inventory');
  assert.deepEqual(after, before);
  assert.equal(writes.length, writeStart);
  assert.deepEqual(errors, []);
  journeys.push({ kind: 'all-inventory-JSON-equal-zero-domain-writes' });
  console.log(`PASS ${checks.length} states / ${journeys.length} journeys`);
} finally {
  release?.();
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ checks, journeys, errors, writes }, null, 2) + '\n',
  );
  await browser.close();
}
