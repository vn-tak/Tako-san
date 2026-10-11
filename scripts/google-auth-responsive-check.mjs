import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Overlay local build bytes in an isolated browser on the authorized provider origin.
// This leaves the hosted application unchanged and never submits authentication.
const origin = process.env.GOOGLE_UI_ORIGIN ?? 'https://frigo.tungjpstore.net';
const local = process.env.GOOGLE_UI_LOCAL_ORIGIN ?? 'http://127.0.0.1:5232';
const hosted = process.env.GOOGLE_UI_MODE === 'hosted';
const expectedSha = process.env.GOOGLE_UI_SHA;
const out = resolve(process.env.GOOGLE_UI_OUT ?? '.artifacts/google-responsive/browser');
assert.equal(new URL(origin).origin, origin);
assert.equal(new URL(origin).protocol, 'https:');
assert(['127.0.0.1', 'localhost'].includes(new URL(local).hostname));
if (hosted) assert.match(expectedSha ?? '', /^[a-f0-9]{40}$/);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const observations = [];
const errors = [];
const overlayAssets = new Map();
let blockedWrites = 0;
let blockProvider = false;
let blockConfig = false;
let configReads = 0;
let failure;
const context = await browser.newContext({
  viewport: { width: 320, height: 844 },
  locale: 'vi-VN',
  timezoneId: 'Asia/Tokyo',
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
});
context.on('page', (page) => page.on('pageerror', (error) => errors.push(error.message)));
context.on('request', (request) => {
  const url = new URL(request.url());
  if (url.origin === origin && url.pathname.startsWith('/api/')) {
    assert(['GET', 'HEAD', 'OPTIONS'].includes(request.method()), 'API write attempted');
  }
});
await context.route(
  () => true,
  async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (blockProvider && url.hostname === 'accounts.google.com') return route.abort();
    if (url.origin !== origin) return route.continue();
    if (url.pathname.startsWith('/api/')) {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
        blockedWrites++;
        return route.abort();
      }
      if (url.pathname === '/api/v1/config') {
        configReads++;
        if (blockConfig) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ googleClientId: null, turnstileSiteKey: null }),
          });
        }
      }
      return route.continue();
    }
    if (hosted) return route.continue();
    const response = await context.request.get(local + url.pathname + url.search);
    assert.equal(response.status(), 200, `Local asset ${url.pathname}`);
    const body = await response.body();
    overlayAssets.set(url.pathname, createHash('sha256').update(body).digest('hex'));
    return route.fulfill({
      status: 200,
      contentType: response.headers()['content-type'],
      headers: {
        'cache-control': 'no-store',
        'cross-origin-opener-policy': 'same-origin-allow-popups',
      },
      body,
    });
  },
);
const page = await context.newPage();
const frameLocator = () => page.locator('iframe[src*="accounts.google.com/gsi/button"]');
const provider = () =>
  page.frames().find((frame) => frame.url().includes('accounts.google.com/gsi/button'));
async function settledProvider() {
  await frameLocator().waitFor({ timeout: 20_000 });
  await expect
    .poll(
      async () => {
        const frame = provider();
        if (!frame || frame.isDetached()) return false;
        try {
          return await frame.getByRole('button', { name: /Google/ }).isVisible();
        } catch (error) {
          if (frame.isDetached()) return false;
          throw error;
        }
      },
      { timeout: 20_000 },
    )
    .toBe(true);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const frame = document.querySelector('iframe[src*="accounts.google.com/gsi/button"]');
          const host = frame?.parentElement?.parentElement;
          if (!frame || !host) return false;
          return (
            Math.abs(
              frame.getBoundingClientRect().width -
                (Math.min(400, Math.max(200, Math.floor(host.getBoundingClientRect().width))) + 20),
            ) < 2
          );
        }),
      { timeout: 10_000 },
    )
    .toBe(true);
  await page.waitForTimeout(700);
}
async function snapshot(name, hasProvider = true) {
  await page.evaluate(() => document.fonts.ready);
  if (hasProvider) {
    await settledProvider();
    await frameLocator().scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
  }
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    rootWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    frame:
      document
        .querySelector('iframe[src*="accounts.google.com/gsi/button"]')
        ?.getBoundingClientRect()
        .toJSON() ?? null,
    brokenImages: [...document.images].filter((image) => image.complete && !image.naturalWidth)
      .length,
  }));
  let widget = null;
  if (hasProvider) {
    widget = await provider()
      .getByRole('button', { name: /Google/ })
      .evaluate((button) => ({
        label: button.textContent,
        focus: button === document.activeElement,
        bounds: button.getBoundingClientRect().toJSON(),
        text: [...button.querySelectorAll('span')]
          .filter((span) => !span.childElementCount && span.getBoundingClientRect().width > 0)
          .map((span) => ({
            value: span.textContent,
            width: span.clientWidth,
            scrollWidth: span.scrollWidth,
          })),
      }));
    assert(widget.label.normalize('NFC').includes('Đăng nhập'), `${name}: provider sign-in label`);
    assert(
      widget.text.every((text) => text.scrollWidth <= text.width + 1),
      `${name}: provider text clipped`,
    );
    assert(
      layout.frame.left >= 0 && layout.frame.right <= layout.viewport,
      `${name}: iframe bounds`,
    );
    assert(layout.frame.left + widget.bounds.left >= 0, `${name}: button left`);
    assert(layout.frame.left + widget.bounds.right <= layout.viewport, `${name}: button right`);
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const violations = axe.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }));
  observations.push({ name, ...layout, widget, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  if (name.startsWith('text2'))
    await frameLocator().screenshot({ path: resolve(out, `${name}-widget.png`) });
  assert(
    layout.rootWidth <= layout.viewport && layout.bodyWidth <= layout.viewport,
    `${name}: horizontal overflow`,
  );
  assert.equal(layout.brokenImages, 0, `${name}: broken images`);
  assert.deepEqual(violations, [], `${name}: axe violations`);
  console.log(
    `PASS ${name}: width ${layout.rootWidth}/${layout.viewport}, iframe ${layout.frame?.width ?? 'unavailable'}, axe0`,
  );
}
try {
  if (hosted) {
    const ready = await context.request.get(origin + '/api/v1/health/ready');
    assert.equal(ready.status(), 200);
    const health = await ready.json();
    assert.equal(health.commit, expectedSha);
    observations.push({
      name: 'hosted-source',
      commit: health.commit,
      catalog: health.recipeAuthority.configuredMode,
    });
  }
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(origin + '/auth');
    await snapshot(`auth-${width}`);
  }
  for (const width of [320, 390, 768, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await snapshot(`resize-to-${width}-${observations.length}`);
  }
  await page.goto(origin + '/auth?provider=google');
  await settledProvider();
  await page.getByRole('button', { name: 'Đăng ký tài khoản', exact: true }).focus();
  await page.keyboard.press('Tab');
  const button = provider().getByRole('button', { name: /Google/ });
  assert(
    await button.evaluate((element) => element === document.activeElement),
    'Tab enters provider button',
  );
  await snapshot('google-keyboard-focus-320');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  assert(
    await button.evaluate((element) => element === document.activeElement),
    'Shift+Tab returns to provider',
  );
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Đăng ký tài khoản', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Hiện mật khẩu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ẩn mật khẩu', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Quên mật khẩu?', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quên mật khẩu', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Quay lại.*đăng nhập/ }).click();
  await snapshot('forgot-to-login-320');
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 420 });
    await page.goto(origin + '/auth');
    await settledProvider();
    // Enlarge application text. The cross-origin provider retains its own typography.
    await page.evaluate(() => {
      const frame = document.querySelector('iframe[src*="accounts.google.com/gsi/button"]');
      const providerHost = frame?.parentElement?.parentElement;
      for (const element of document.querySelectorAll('.auth-page, .auth-page :not(iframe)')) {
        if (providerHost?.contains(element)) continue;
        element.dataset.originalFont = getComputedStyle(element).fontSize;
      }
      for (const element of document.querySelectorAll('[data-original-font]')) {
        element.style.fontSize = `${Number.parseFloat(element.dataset.originalFont) * 2}px`;
      }
    });
    await snapshot(`text2-short-${width}`);
  }
  blockProvider = true;
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(origin + '/auth');
  const retry = page.getByRole('button', { name: 'Tải lại Google Sign-In', exact: true });
  await retry.waitFor({ timeout: 15_000 });
  await snapshot('google-load-failed-320', false);
  blockProvider = false;
  await retry.click();
  await snapshot('google-retry-320');
  await page.getByRole('button', { name: 'Đăng ký tài khoản', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tạo tài khoản Takosan' })).toBeVisible();
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await snapshot('register-to-login-320');
  blockConfig = true;
  await page.goto(origin + '/auth');
  await page.getByText(/Google Sign-In chưa được cấu hình/).waitFor();
  assert.equal(await frameLocator().count(), 0);
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
  await snapshot('google-unconfigured-320', false);
  assert.equal(blockedWrites, 0);
  assert.deepEqual(errors, []);
} catch (error) {
  failure = String(error);
  await page.screenshot({ path: resolve(out, 'failure.png'), fullPage: true });
  const frame = provider();
  observations.push({
    name: 'failure-provider',
    label: frame ? await frame.locator('[role=button]').allTextContents() : [],
  });
  throw error;
} finally {
  await context.close();
  await browser.close();
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify(
      {
        status: failure ? 'FAIL' : 'PASS',
        scope: hosted
          ? 'Hosted public UI, no sign-in submitted'
          : 'Local build overlaid on production origin in an isolated browser, hosted bytes unchanged',
        origin,
        local,
        hosted,
        expectedSha,
        observations,
        errors,
        blockedWrites,
        configReads,
        overlayAssets: Object.fromEntries(overlayAssets),
        sourceHash: createHash('sha256')
          .update(await readFile('src/web/pages/AuthPage.tsx'))
          .digest('hex'),
        failure,
        exclusions: [
          'real sign-in/OTP delivery',
          'real devices/Safari',
          'provider text zoom',
          'authenticated household journeys',
        ],
      },
      null,
      2,
    ) + '\n',
  );
}
console.log(`PASS ${observations.length} checks; API writes0; pageerrors0`);
