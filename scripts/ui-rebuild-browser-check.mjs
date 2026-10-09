import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5197';
assert(
  ['127.0.0.1', 'localhost'].includes(new URL(base).hostname),
  'Synthetic checks require the local security preview',
);
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui-rebuild');
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
page.on('pageerror', (error) => errors.push(error.message));
async function snapshot(name) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily,
    noMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    revealAnimations: [...document.querySelectorAll('.animate-fade-in')].map(
      (element) => getComputedStyle(element).animationName,
    ),
  }));
  assert(layout.documentWidth <= layout.viewport, `${name}: horizontal overflow`);
  assert(layout.font.includes('Be Vietnam Pro'), `${name}: font missing`);
  assert(
    layout.revealAnimations.every((animation) => animation === 'none'),
    `${name}: reveal animation persists under reduced motion`,
  );
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const violations = axe.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }));
  observations.push({ name, url: page.url(), ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  console.log(`${name}: overflow 0, axe 0`);
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
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(`${base}/inventory`);
    await page.getByTestId('inventory-row').first().waitFor();
    await snapshot(`inventory-${width}`);
    await page.goto(`${base}/recipes/thit-kho-trung`);
    await page.locator('[data-availability="partial"]').first().waitFor();
    await snapshot(`recipe-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/inventory`);
  await page.getByTestId('inventory-row').first().waitFor();
  await page
    .getByRole('textbox', { name: 'Tìm nguyên liệu trong tủ' })
    .fill('không có nguyên liệu này');
  await page.getByRole('heading', { name: 'Không tìm thấy nguyên liệu phù hợp' }).waitFor();
  assert.equal(await page.getByText('Tủ lạnh đang trống', { exact: true }).count(), 0);
  await snapshot('inventory-no-results-390');
  await page.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc' }).click();
  await page.getByTestId('inventory-row').first().waitFor();
  assert.equal(
    await page
      .getByRole('textbox', { name: 'Tìm nguyên liệu trong tủ' })
      .evaluate((input) => document.activeElement === input),
    true,
    'Search reset must return keyboard focus',
  );
  await page.goto(`${base}/recipes/thit-kho-trung`);
  await page.locator('[data-availability="partial"]').first().waitFor();
  const row = page
    .locator('.ingredient-availability-row')
    .filter({ has: page.getByText(/^Trứng gà/) });
  assert.match(await row.innerText(), /Thiếu 2 cái/);
  const shoppingResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/v1/shopping-list/items' &&
      response.request().method() === 'POST',
  );
  await row.getByRole('button', { name: /^Mua phần thiếu: Trứng gà/ }).click();
  const response = await shoppingResponse;
  const posted = response.request().postDataJSON();
  assert.equal(posted.quantity, 2);
  assert.equal(response.ok(), true);
  observations.push({
    name: 'egg-shortfall-shopping',
    quantity: posted.quantity,
    unit: posted.unit,
    status: response.status(),
  });
  await page.getByRole('tab', { name: 'Cách nấu' }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(
    await page.getByRole('tab', { name: 'Nguyên liệu' }).getAttribute('aria-selected'),
    'true',
  );
  await context.route(
    (url) =>
      url.pathname.startsWith('/api/v1/recipe-media/') ||
      url.pathname.startsWith('/frigo/recipes/'),
    (route) => route.abort(),
  );
  await page.reload();
  await page.locator('.recipe-cover img[src="/takosan/recipe-placeholder.svg"]').waitFor();
  await snapshot('recipe-neutral-fallback-390');
  assert.deepEqual(errors, []);
} finally {
  await writeFile(
    resolve(out, 'browser-observations.json'),
    JSON.stringify({ base, syntheticLocalOnly: true, observations, errors }, null, 2) + '\n',
  );
  await browser.close();
}
