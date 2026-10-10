import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5205';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui10/aliases');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const context = await browser.newContext({
  serviceWorkers: 'block',
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
await context.route(
  (url) => url.origin !== base,
  (route) => route.abort(),
);
const page = await context.newPage();
const checks = [],
  errors = [],
  writes = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => {
  if (
    !['GET', 'HEAD'].includes(request.method()) &&
    new URL(request.url()).pathname.startsWith('/api/v1/week')
  )
    writes.push({ path: new URL(request.url()).pathname, method: request.method() });
});
try {
  await page.goto(`${base}/__preview`);
  await page
    .getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập', exact: true })
    .click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  for (const [source, destination] of [
    ['/week', '/planner'],
    ['/week/setup', '/planner/new'],
    ['/week/generating', '/planner'],
    ['/week/plan-a', '/planner/plan-a'],
    ['/week/plan-a/meal/meal-a', '/planner/plan-a/meal/meal-a'],
    ['/week/plan-a/shopping', '/planner/plan-a/shopping'],
    ['/week/plan-a/settings', '/settings/planning'],
  ]) {
    await page.goto(`${base}${source}`);
    await page.waitForURL(`${base}${destination}`);
    await expect(page.locator('h1')).toHaveCount(1);
    checks.push({ source, destination, actual: new URL(page.url()).pathname });
    await page.screenshot({ path: resolve(out, `alias-${checks.length}.png`), fullPage: true });
  }
  assert.deepEqual(writes, []);
  assert.deepEqual(errors, []);
  console.log(`PASS ${checks.length} real-browser aliases; no Week writes or page errors`);
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ base, checks, writes, errors }, null, 2),
  );
  await browser.close();
}
