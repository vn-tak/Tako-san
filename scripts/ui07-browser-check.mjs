import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5201';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui07/browser');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'vi-VN', serviceWorkers: 'block', reducedMotion: 'reduce' });
await context.route((url) => url.origin !== base, (route) => route.abort());
const page = await context.newPage();
const checks = [], errors = [], journeys = [];
page.on('pageerror', (error) => errors.push(error.message));
async function snapshot(name, branded = true) {
  if (branded) await page.locator('.kitchen-header, .cooking-header, .cooking-review-header').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));
  for (const image of await page.locator('img[loading=lazy]').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((im) => im.complete && im.naturalWidth > 0)).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => [...document.images].every((im) => im.complete && im.naturalWidth > 0))).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  const layout = await page.evaluate(() => {
    const visible = (el) => !!(el.getBoundingClientRect().width && el.getBoundingClientRect().height);
    const brands = [...document.images].filter((im) => im.src.endsWith('/takosan/rebuild/lockup.svg') && visible(im));
    const logo = document.querySelector('.kitchen-brand-link');
    const actions = [...document.querySelectorAll('.kitchen-icon-link')].filter(visible).map((el) => ({ label: el.getAttribute('aria-label'), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, logoCount: brands.length, brandWidths: brands.map((im) => im.getBoundingClientRect().width), hiddenHeaderLink: logo ? !visible(logo) : null, actions, broken: [...document.images].filter((im) => !im.naturalWidth).map((im) => im.src), font: getComputedStyle(document.querySelector('.takosan-rebuild') ?? document.body).fontFamily, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  });
  assert(layout.scrollWidth <= layout.width, `${name}: overflow ${JSON.stringify(layout)}`);
  assert.equal(layout.broken.length, 0, `${name}: broken images`);
  if (branded) {
    assert.equal(layout.logoCount, 1, `${name}: visible lockups ${JSON.stringify(layout)}`);
    assert(layout.font.includes('Be Vietnam Pro'));
    for (const action of layout.actions) assert(action.width >= 44 && action.height >= 44, `${name}: touch target`);
    if (layout.hiddenHeaderLink !== null) assert.equal(layout.hiddenHeaderLink, layout.width >= 1024);
  }
  const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((n) => n.target) }));
  checks.push({ name, url: page.url(), ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`) });
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  console.log(`${name}: axe0 / overflow0 / assets0`);
}
try {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/docs/ui-rebuild/round-7/brand-preview.html`);
    await snapshot(`brand-sheet-${width}`, false);
    await page.screenshot({ path: resolve(out, `brand-sheet-${width}-full.png`), fullPage: true });
  }
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  const inventory = await page.evaluate(async () => (await fetch('/api/v1/inventory')).json());
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const [route, label] of [['/', 'home'], ['/fridge', 'fridge'], ['/recipes', 'recipes'], ['/planner', 'planner'], ['/shopping', 'shopping'], ['/recipes/thit-kho-trung', 'recipe']]) {
      await page.goto(`${base}${route}`);
      await page.locator('.kitchen-header').waitFor();
      await page.locator('h1').first().waitFor();
      await snapshot(`${label}-${width}`);
    }
  }
  // Keyboard: hidden desktop header logo must not retain a tab stop; mobile home link navigates.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/shopping`);
  await page.locator('.kitchen-header').waitFor();
  const homeLinks = page.getByRole('link', { name: 'Takosan — Trang chủ', exact: true });
  await expect(homeLinks).toHaveCount(1);
  await homeLinks.focus();
  const focus = await homeLinks.evaluate((el) => ({ outline: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth }));
  assert(focus.outline !== 'none' && parseFloat(focus.width) >= 2);
  await page.keyboard.press('Enter');
  await page.waitForURL(`${base}/`);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/shopping`);
  await page.getByRole('link', { name: 'Takosan — Trang chủ', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(`${base}/`);
  journeys.push({ kind: 'desktop-and-mobile-keyboard-home', focus });
  await page.goto(`${base}/shopping`);
  await page.locator('h1').waitFor();
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll('.takosan-rebuild *')];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => el.style.fontSize = `${sizes[i] * 2}px`);
  });
  await snapshot('shopping-enlarged-text-320');
  await page.setViewportSize({ width: 390, height: 420 });
  await page.goto(`${base}/shopping`);
  await snapshot('shopping-short-390');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/planner`);
  await page.locator('.kitchen-header').waitFor();
  await snapshot('planner-normal-motion-390');
  // Actual immersive workflow retains logo at desktop without sidebar.
  await page.goto(`${base}/recipes/thit-kho-trung`);
  await page.getByRole('button', { name: /Bắt đầu nấu/ }).click();
  await page.waitForURL(/\/cook\//);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('.cooking-header').waitFor();
    await snapshot(`cooking-immersive-${width}`);
    assert.equal(await page.locator('nav:visible').count(), 0);
  }
  journeys.push({ kind: 'immersive-retains-brand', route: new URL(page.url()).pathname });
  while (await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).count())
    await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).click();
  await page.getByRole('button', { name: 'Hoàn thành nấu', exact: true }).click();
  await page.locator('.cooking-review-header').waitFor();
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await snapshot(`cooking-review-${width}`);
    assert.equal(await page.locator('nav:visible').count(), 0);
  }
  journeys.push({ kind: 'review-retains-brand-no-command', route: new URL(page.url()).pathname });
  const manifestResponse = await context.request.get(`${base}/manifest.json`);
  assert.equal(manifestResponse.status(), 200);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.theme_color, '#245D49');
  for (const icon of manifest.icons) {
    const response = await context.request.get(`${base}${icon.src}`);
    assert.equal(response.status(), 200);
    assert(response.headers()['content-type'].includes('image/png'));
  }
  const metadata = await page.locator('head link[rel=icon], head link[rel=apple-touch-icon]').evaluateAll((links) => links.map((el) => el.getAttribute('href')));
  assert(metadata.every((href) => href.startsWith('/takosan/rebuild/app-icons/')));
  for (const href of metadata) assert.equal((await context.request.get(`${base}${href}`)).status(), 200);
  assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), 'https://frigo.tungjpstore.net/takosan/rebuild/og.png');
  assert.equal((await context.request.get(`${base}/takosan/rebuild/og.png`)).status(), 200);
  journeys.push({ kind: 'metadata-local-asset-serving', icons: manifest.icons.length, browserIconLinks: metadata.length });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/me`);
  await page.locator('nav img[src="/takosan/brand/takosan-logo-horizontal-primary.svg"]:visible').waitFor();
  assert.equal(await page.locator('[data-kitchen-navigation=persistent]').count(), 0);
  journeys.push({ kind: 'legacy-account-sidebar-compatibility', fullUXAudit: false });
  const after = await page.evaluate(async () => (await fetch('/api/v1/inventory')).json());
  assert.deepEqual(after, inventory);
  journeys.push({ kind: 'no-inventory-command', equal: true });
  assert.deepEqual(errors, []);
} finally {
  await writeFile(resolve(out, 'observations.json'), JSON.stringify({ checks, journeys, pageErrors: errors }, null, 2) + '\n');
  await browser.close();
}
console.log(`PASS ${checks.length} checks / ${journeys.length} journeys / 0 page errors`);
