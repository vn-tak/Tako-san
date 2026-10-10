import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5201';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui08/browser');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'vi-VN', reducedMotion: 'reduce', serviceWorkers: 'block' });
await context.route((url) => url.origin !== base, (route) => route.abort());
const page = await context.newPage();
const checks = [], journeys = [], errors = [];
page.on('pageerror', (error) => errors.push(error.message));
async function settle() {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('.auth-workspace > div').evaluateAll((nodes) => nodes.every((node) => Number(getComputedStyle(node).opacity) >= .999))).toBe(true);
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {}))));
}
async function snapshot(name, { full = false, synthetic = false } = {}) {
  await settle();
  await expect.poll(() => page.evaluate(() => [...document.images].every((im) => im.complete && im.naturalWidth > 0))).toBe(true);
  const layout = await page.evaluate(() => {
    const visible = (el) => !!(el.getBoundingClientRect().width && el.getBoundingClientRect().height);
    const brands = [...document.images].filter((im) => im.src.endsWith('/takosan/rebuild/lockup.svg') && visible(im));
    const switches = [...document.querySelectorAll('button[role=switch]')].map((el) => {
      const b = el.getBoundingClientRect(), parent = el.parentElement.getBoundingClientRect();
      return { width: b.width, height: b.height, contained: b.right <= parent.right + 1 && b.left >= parent.left - 1 };
    });
    const inputs = [...document.querySelectorAll('input:not(.sr-only)')].map((el) => ({ size: parseFloat(getComputedStyle(el).fontSize), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily, logoCount: brands.length, switches, inputs, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  });
  assert(layout.scrollWidth <= layout.width, `${name}: overflow ${JSON.stringify(layout)}`);
  assert.equal(layout.logoCount, 1, `${name}: brand ownership ${JSON.stringify(layout)}`);
  assert(layout.font.includes('Be Vietnam Pro'));
  for (const sw of layout.switches) assert(sw.width >= 44 && sw.height >= 44 && sw.contained, `${name}: switch ${JSON.stringify(sw)}`);
  for (const input of layout.inputs) assert(input.size >= 16 && input.height >= 48);
  const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) }));
  checks.push({ name, route: new URL(page.url()).pathname, synthetic, ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: full });
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  console.log(`${name}: axe0 / overflow0 / assets0`);
}
async function goto(path) { await page.goto(`${base}${path}`); await settle(); }
async function enlarge() {
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll('.takosan-rebuild *')];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, index) => { el.style.fontSize = `${sizes[index] * 2}px`; });
  });
}
try {
  const widths = [320, 390, 768, 1024, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const [route, name] of [['/landing', 'landing'], ['/auth', 'login'], ['/auth?mode=register', 'register'], ['/auth/verify', 'verify-missing']]) {
      await goto(route); await snapshot(`${name}-${width}`, { full: width === 390 || width === 1440 });
    }
    await goto('/auth');
    await page.getByRole('button', { name: 'Quên mật khẩu?' }).click();
    await snapshot(`forgot-${width}`);
  }
  // Synthetic tab metadata exercises OTP geometry without a provider/code claim.
  await page.evaluate(() => sessionStorage.setItem('frigo_auth_verify_context', JSON.stringify({ email: 'ui08-long-address@example.test', resendAvailableAt: Date.now() + 30000, delivered: false, expiresAt: null, owner: { userId: '', householdId: '' } })));
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await goto('/auth/verify');
    await expect(page.getByRole('textbox', { name: 'Chữ số 1 của 6' })).toBeVisible();
    await snapshot(`otp-undelivered-${width}`, { synthetic: true });
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await goto('/auth/verify'); await enlarge(); await snapshot('otp-enlarged-320', { synthetic: true, full: true });
  await page.evaluate(() => sessionStorage.removeItem('frigo_auth_verify_context'));
  for (const [route, label] of [['/landing', 'landing'], ['/auth', 'login']]) {
    await goto(route); await enlarge(); await snapshot(`${label}-enlarged-320`, { full: true });
  }
  await goto('/auth');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('ui08@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('local-test-only');
  await page.getByRole('button', { name: 'Hiện mật khẩu' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Đăng ký tài khoản', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('ui08@example.test');
  journeys.push({ kind: 'keyboard-reveal-and-retained-auth-fields', providerRequest: false });

  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const [step, label] of [['household', 'household'], ['preferences', 'food'], ['goals', 'goal']]) {
      await goto(`/onboarding/${step}`); await snapshot(`onboarding-${label}-${width}`, { full: width === 390 });
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  for (const step of ['household', 'preferences', 'goals']) {
    await goto(`/onboarding/${step}`); await enlarge(); await snapshot(`onboarding-${step}-enlarged-320`, { full: true });
  }
  await goto('/onboarding/household');
  await page.getByRole('radio', { name: '3 người', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('radio', { name: '3 người', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Nhật Bản', exact: true }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.getByTestId('onboarding-preference-review')).toContainText('3 người');
  await expect(page.getByTestId('onboarding-preference-review')).toContainText('Nhật Bản');
  await page.getByRole('button', { name: /Quay lại/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Nhật Bản', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  const inventory = await page.evaluate(async () => (await fetch('/api/v1/inventory')).json());
  journeys.push({ kind: 'real-onboarding-draft-back-and-server-completion', householdSize: 3, cuisine: 'japanese' });

  const accountRoutes = [['/me', 'profile'], ['/me/preferences', 'preferences'], ['/me/household', 'family'], ['/settings/app', 'app-settings'], ['/settings/planning', 'planning-settings'], ['/settings/notifications', 'notification-settings'], ['/settings/privacy', 'privacy'], ['/notifications', 'inbox']];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const [route, label] of accountRoutes) {
      await goto(route);
      if (route === '/me/preferences' || route === '/settings/planning') await page.getByRole('button', { name: route === '/me/preferences' ? 'Lưu sở thích' : 'Lưu cài đặt', exact: true }).waitFor();
      await snapshot(`${label}-${width}`, { full: width === 390 });
    }
  }
  await goto('/me');
  await page.getByRole('link', { name: /Sở thích & hạn chế/ }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/me\/preferences$/);
  await page.getByRole('button', { name: 'Ít cay', exact: true }).click();
  await page.getByRole('button', { name: 'Lưu sở thích', exact: true }).click();
  await expect(page.getByRole('status', { name: '' }).filter({ hasText: 'Đã lưu sở thích.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Ít cay', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Quay lại', exact: true }).focus();
  await page.keyboard.press('Enter'); await page.waitForURL(/\/me$/);
  journeys.push({ kind: 'keyboard-profile-food-save-server-reload-back' });
  await goto('/settings/planning');
  await page.getByRole('button', { name: '500k VND', exact: true }).click();
  await page.getByRole('button', { name: 'Lưu cài đặt', exact: true }).click();
  await expect(page.locator('[role=status]').filter({ hasText: 'Đã lưu cài đặt lập thực đơn.' })).toBeVisible();
  await page.reload(); await expect(page.getByRole('button', { name: '500k VND', exact: true })).toHaveAttribute('aria-pressed', 'true');
  journeys.push({ kind: 'planning-default-save-server-reload-no-generation' });
  await goto('/settings/notifications');
  const pref = page.getByRole('switch', { name: 'Nhắc đi chợ', exact: true });
  await pref.focus(); await page.keyboard.press('Space');
  await expect(pref).toHaveAttribute('aria-checked', 'false');
  await page.reload(); await expect(pref).toHaveAttribute('aria-checked', 'false');
  journeys.push({ kind: 'keyboard-local-notification-intent-reload' });
  await goto('/settings/app');
  await page.getByRole('button', { name: 'Cài đặt lên màn hình chính', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await snapshot('install-help-dialog');
  await page.keyboard.press('Escape'); await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cài đặt lên màn hình chính', exact: true })).toBeFocused();
  journeys.push({ kind: 'install-help-escape-focus-restored', actualOSInstall: false });
  await goto('/me');
  await page.getByRole('button', { name: 'Đăng xuất khỏi tài khoản', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible(); await snapshot('logout-dialog');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Đăng xuất khỏi tài khoản', exact: true })).toBeFocused();
  journeys.push({ kind: 'logout-dialog-cancel-preserves-session' });

  let releaseLoading;
  const loadingGate = new Promise((resolve) => { releaseLoading = resolve; });
  await page.route('**/api/v1/notifications', async (route) => { await loadingGate; await route.continue(); });
  await goto('/notifications'); await expect(page.getByText('Đang tải thông báo…', { exact: true })).toBeVisible();
  await snapshot('inbox-loading', { synthetic: true });
  releaseLoading();
  await expect(page.getByText('Đang tải thông báo…', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/v1/notifications');
  for (const [path, endpoint, saveLabel] of [['/me/preferences', '**/api/v1/preferences', 'Lưu sở thích'], ['/settings/planning', '**/api/v1/week/preferences', 'Lưu cài đặt']]) {
    await goto(path); await page.getByRole('button', { name: saveLabel, exact: true }).waitFor();
    await page.route(endpoint, (route) => route.request().method() === 'PATCH' ? route.fulfill({ status: 500, json: { error: 'Synthetic save failure' } }) : route.continue());
    await page.getByRole('button', { name: saveLabel, exact: true }).click();
    await expect(page.locator('[role=alert]')).toBeFocused();
    await snapshot(`${path === '/me/preferences' ? 'food' : 'planning'}-save-error`, { synthetic: true });
    await page.unroute(endpoint);
    await page.getByRole('button', { name: saveLabel, exact: true }).click();
    await expect(page.locator('[role=status]').filter({ hasText: path === '/me/preferences' ? 'Đã lưu sở thích.' : 'Đã lưu cài đặt lập thực đơn.' })).toBeVisible();
  }
  journeys.push({ kind: 'synthetic-loading-and-save-errors-focus-real-retry' });

  await page.route('**/api/v1/notifications', (route) => route.fulfill({ status: 200, json: { notifications: [] } }));
  await goto('/notifications'); await expect(page.getByText(/Không có thông báo để hiển thị/)).toBeVisible();
  await snapshot('inbox-empty', { synthetic: true });
  await page.unroute('**/api/v1/notifications');
  await page.route('**/api/v1/notifications', (route) => route.fulfill({ status: 500, json: { error: 'Không tải được thông báo thử nghiệm.' } }));
  await goto('/notifications'); await expect(page.locator('[role=alert]')).toBeVisible({ timeout: 15000 });
  await snapshot('inbox-error', { synthetic: true });
  await page.unroute('**/api/v1/notifications');
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.locator('[role=alert]')).toHaveCount(0); await snapshot('inbox-recovered');
  journeys.push({ kind: 'synthetic-inbox-empty-error-real-recovery' });

  await page.setViewportSize({ width: 320, height: 844 });
  for (const [route, label] of accountRoutes) {
    await goto(route);
    if (route === '/me/preferences' || route === '/settings/planning') await page.getByRole('button', { name: route === '/me/preferences' ? 'Lưu sở thích' : 'Lưu cài đặt', exact: true }).waitFor();
    await enlarge(); await snapshot(`${label}-enlarged-320`, { full: true });
  }
  await page.setViewportSize({ width: 390, height: 420 });
  await goto('/settings/app');
  await page.getByRole('button', { name: 'Cài đặt lên màn hình chính', exact: true }).click();
  await snapshot('install-dialog-short-390');
  const dialog = await page.getByRole('alertdialog').boundingBox(); assert(dialog.y >= 0 && dialog.y + dialog.height <= 420);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await goto('/me'); await snapshot('profile-normal-motion');
  await goto('/onboarding'); await page.waitForURL(`${base}/`);
  journeys.push({ kind: 'completed-onboarding-guard' });
  const after = await page.evaluate(async () => (await fetch('/api/v1/inventory')).json());
  assert.deepEqual(after, inventory); journeys.push({ kind: 'inventory-unchanged-by-account-actions' });
  // Separate browser starts the actual guest funnel; no seeded account state.
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'vi-VN', serviceWorkers: 'block', reducedMotion: 'reduce' });
  await guestContext.route((url) => url.origin !== base, (route) => route.abort());
  const guestPage = await guestContext.newPage();
  guestPage.on('pageerror', (error) => errors.push(error.message));
  await guestPage.goto(`${base}/landing`);
  await guestPage.getByRole('button', { name: 'Dùng thử Takosan ngay', exact: true }).click();
  await guestPage.waitForURL(/onboarding\/household$/);
  await guestPage.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await guestPage.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  const weekGoal = guestPage.getByRole('radio');
  await weekGoal.nth(1).focus(); await guestPage.keyboard.press('Space');
  await guestPage.route('**/api/v1/preferences', (route) => route.request().method() === 'PATCH' ? route.fulfill({ status: 500, json: { error: 'Synthetic onboarding failure' } }) : route.continue());
  await guestPage.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await expect(guestPage.locator('[role=alert]')).toContainText('Chưa thể lưu sở thích');
  assert(new URL(guestPage.url()).pathname === '/onboarding/goals');
  await expect(weekGoal.nth(1)).toBeChecked();
  await guestPage.unroute('**/api/v1/preferences');
  await guestPage.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await guestPage.waitForURL(/planner\/new$/);
  journeys.push({ kind: 'real-guest-entry-onboarding-failure-retained-goal-retry-week-alias', legacyFlagOff: false });
  await guestPage.setViewportSize({ width: 320, height: 844 });
  await guestPage.goto(`${base}/me`); await guestPage.locator('h1').waitFor();
  await guestPage.evaluate(() => {
    const elements = [...document.querySelectorAll('.takosan-rebuild *')];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, index) => { el.style.fontSize = `${sizes[index] * 2}px`; });
  });
  const guestOverflow = await guestPage.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(guestOverflow, false);
  await expect(guestPage.getByRole('link', { name: 'Đăng nhập để nâng cấp', exact: true })).toHaveAttribute('href', '/auth?mode=login&returnTo=%2Fplus');
  const guestAxe = (await new AxeBuilder({ page: guestPage }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
  assert.equal(guestAxe.length, 0);
  await guestPage.screenshot({ path: resolve(out, 'guest-profile-enlarged-320.png'), fullPage: true });
  journeys.push({ kind: 'guest-profile-enlarged-320', overflow: false, axeViolations: 0, upgradeHref: '/auth?mode=login&returnTo=%2Fplus' });
  await guestContext.close();
  assert.equal(errors.length, 0, `page errors: ${JSON.stringify(errors)}`);
} finally {
  await writeFile(resolve(out, 'checks.json'), JSON.stringify({ base, checks, journeys, errors }, null, 2) + '\n');
  await browser.close();
}
console.log(`UI08 ${checks.length} checks / ${journeys.length} journeys / ${errors.length} page errors`);
