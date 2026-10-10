import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5202';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui09/browser');
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
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
});
await context.route(
  (url) => url.origin !== base,
  (route) => route.abort(),
);
context.setDefaultTimeout(20000);
context.setDefaultNavigationTimeout(20000);
const page = await context.newPage();
const checks = [],
  journeys = [],
  errors = [],
  expectedFaults = [],
  mutations = [];
page.on('pageerror', (error) =>
  (error.message.includes('UI09_SYNTHETIC_RENDER_FAILURE') ? expectedFaults : errors).push(
    error.message,
  ),
);
page.on('request', (request) => {
  const url = new URL(request.url());
  if (url.pathname.startsWith('/api/') && !['GET', 'HEAD'].includes(request.method()))
    mutations.push({ path: url.pathname, method: request.method() });
});
async function snapshot(name, { synthetic = false } = {}) {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    ),
  );
  for (const im of await page.locator('img[loading=lazy]').all()) await im.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() => [...document.images].every((im) => im.complete && im.naturalWidth > 0)),
    )
    .toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  const layout = await page.evaluate(() => {
    const visible = (el) =>
      !!(el.getBoundingClientRect().width && el.getBoundingClientRect().height);
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily,
      h1Count: document.querySelectorAll('h1').length,
      logoCount: [...document.images].filter(
        (im) => im.src.endsWith('/takosan/rebuild/lockup.svg') && visible(im),
      ).length,
      inputs: [
        ...document.querySelectorAll('.stock-detail-body input, .stock-detail-body select'),
      ].map((el) => ({
        height: el.getBoundingClientRect().height,
        font: parseFloat(getComputedStyle(el).fontSize),
      })),
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  });
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((n) => n.target),
    summaries: nodes.map((n) => n.failureSummary),
  }));
  checks.push({ name, route: new URL(page.url()).pathname, synthetic, ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  assert(layout.scrollWidth <= layout.width, `${name}: overflow ${JSON.stringify(layout)}`);
  assert.equal(layout.h1Count, 1, name);
  assert.equal(layout.logoCount, 1, name);
  assert(layout.font.includes('Be Vietnam Pro'));
  for (const input of layout.inputs) assert(input.height >= 48 && input.font >= 16, name);
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  console.log(`${name}: axe0 / overflow0 / assets0`);
}
async function goto(path) {
  await page.goto(`${base}${path}`);
  await page.locator('.stock-detail-workspace, .system-status-page').first().waitFor();
}
async function enlarge() {
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll('.takosan-rebuild *')];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => {
      el.style.fontSize = `${sizes[i] * 2}px`;
    });
  });
}
async function getJson(path) {
  return page.evaluate(async (path) => {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`Local GET ${r.status}`);
    return r.json();
  }, path);
}
async function control(path) {
  return page.evaluate(async (path) => {
    const r = await fetch(`/__preview/${path}`, { method: 'POST' });
    if (!r.ok) throw new Error(`Local control ${r.status}`);
    return r.json();
  }, path);
}
const edit = () => page.getByRole('button', { name: 'Sửa thông tin nguyên liệu', exact: true });
const settleDetail = () => page.getByTestId('lot-expiry').waitFor();
const observationsURL = (url) => url.pathname === '/api/v1/inventory/observations';
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  // Compatibility detail before the isolated household adopts canonical lots.
  await goto('/inventory/preview-stock-egg');
  await edit().waitFor();
  await snapshot('legacy-detail-390');
  const token = (await context.cookies()).find(
    (cookie) => cookie.name === '__Host-frigo_session',
  )?.value;
  assert(token);
  const adopted = await new Promise((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      [
        'scripts/inventory-adopt.mjs',
        '--base-url',
        `${base}/api/v1`,
        '--origin',
        base,
        '--household',
        'planner-preview-household',
        '--session-stdin',
        '--apply',
      ],
      { stdio: ['pipe', 'pipe', 'pipe'], env: { PATH: process.env.PATH } },
    );
    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      assert(!output.includes(token));
      resolvePromise({ code, output });
    });
    child.stdin.end(token);
  });
  assert.equal(adopted.code, 0, adopted.output);
  journeys.push({ kind: 'real-local-canonical-adoption', code: adopted.code });
  const before = await getJson('/api/v1/inventory');
  const mutationStart = mutations.length;
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await goto('/fridge/preview-stock-egg');
    await settleDetail();
    await snapshot(`canonical-detail-${width}`);
    await edit().click();
    await snapshot(`canonical-edit-${width}`);
    await page.getByRole('button', { name: 'Hủy', exact: true }).click();
    await goto('/inventory-reconciliation');
    await page.getByRole('heading', { name: 'Không có mục nào cần đối chiếu' }).waitFor();
    await snapshot(`reconciliation-empty-${width}`);
  }
  for (const alias of ['ingredients', 'inventory']) {
    await goto(`/${alias}/preview-stock-egg`);
    await settleDetail();
    await snapshot(`detail-alias-${alias}`);
  }
  assert.deepEqual(await getJson('/api/v1/inventory'), before);
  assert.equal(mutations.length, mutationStart);
  journeys.push({ kind: 'read-only-matrix-preserves-inventory-and-zero-mutations' });
  await page.setViewportSize({ width: 320, height: 844 });
  await goto('/fridge/preview-stock-egg');
  await settleDetail();
  await enlarge();
  await snapshot('detail-enlarged-320');
  await goto('/fridge/preview-stock-egg');
  await settleDetail();
  await edit().click();
  await enlarge();
  await snapshot('edit-enlarged-320');
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  const longLotURL = (url) => url.pathname === '/api/v1/inventory/lots/preview-stock-egg';
  const longLot = (await getJson('/api/v1/inventory/lots/preview-stock-egg')).lot;
  await page.route(longLotURL, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        lot: {
          ...longLot,
          name: 'Nguyên liệu với tên dài để kiểm tra khả năng đọc và xuống dòng trên màn hình nhỏ',
          lotId: 'long-local-lot-id-'.repeat(10),
        },
      }),
    }),
  );
  await goto('/fridge/preview-stock-egg');
  await settleDetail();
  await enlarge();
  await snapshot('detail-long-content-enlarged-320', { synthetic: true });
  await page.unroute(longLotURL);
  await page.setViewportSize({ width: 390, height: 420 });
  await goto('/fridge/preview-stock-egg');
  await settleDetail();
  await edit().click();
  await snapshot('edit-short-390');
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 844 });
  await goto('/fridge/ui09-missing');
  await page.getByText('Không tìm thấy nguyên liệu này trong tủ.', { exact: true }).waitFor();
  await snapshot('detail-not-found');
  const lotsURL = (url) => url.pathname.startsWith('/api/v1/inventory/lots/');
  let release;
  await page.route(lotsURL, async (route) => {
    await new Promise((yes) => {
      release = yes;
    });
    await route.continue();
  });
  await goto('/fridge/preview-stock-egg');
  await page.getByRole('status').filter({ hasText: 'Đang tải nguyên liệu' }).waitFor();
  await snapshot('detail-loading', { synthetic: true });
  release();
  await settleDetail();
  await page.unroute(lotsURL);
  // A held metadata request checks locking; it remains a real local Worker write.
  await edit().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Tên nguyên liệu')).toBeFocused();
  await page.getByLabel('Tên nguyên liệu').fill('Trứng UI09 chưa lưu');
  let warningSeen = false;
  page.once('dialog', async (dialog) => {
    warningSeen = dialog.type() === 'beforeunload';
    await dialog.dismiss();
  });
  await page.reload({ timeout: 5000 }).catch(() => {});
  assert(warningSeen);
  await expect(page.getByLabel('Tên nguyên liệu')).toHaveValue('Trứng UI09 chưa lưu');
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(edit()).toBeFocused();
  await edit().click();
  await expect(page.getByLabel('Tên nguyên liệu')).toHaveValue(
    before.items.find((item) => item.id === 'preview-stock-egg').name,
  );
  await page.getByLabel('Tên nguyên liệu').fill('Trứng gà UI09');
  let releaseSave;
  let patch;
  const patchURL = (url) => url.pathname === '/api/v1/inventory/preview-stock-egg';
  await page.route(patchURL, async (route) => {
    if (route.request().method() !== 'PATCH') return route.continue();
    patch = route.request().postDataJSON();
    await new Promise((yes) => {
      releaseSave = yes;
    });
    await route.continue();
  });
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.getByLabel('Tên nguyên liệu')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Hủy', exact: true })).toBeDisabled();
  await snapshot('metadata-saving', { synthetic: true });
  releaseSave();
  await edit().waitFor();
  await expect(edit()).toBeFocused();
  await page.unroute(patchURL);
  assert.deepEqual(Object.keys(patch).sort(), ['name', 'version']);
  const saved = await getJson('/api/v1/inventory/lots/preview-stock-egg');
  assert.equal(saved.lot.name, 'Trứng gà UI09');
  const after = await getJson('/api/v1/inventory');
  // inventoryVersion is the household revision attached to every DTO by the Worker.
  const itemFacts = ({ inventoryVersion: _householdRevision, ...facts }) => facts;
  assert.deepEqual(
    after.items.filter((item) => item.id !== 'preview-stock-egg').map(itemFacts),
    before.items.filter((item) => item.id !== 'preview-stock-egg').map(itemFacts),
  );
  assert(after.items.every((item) => item.inventoryVersion === after.items[0].inventoryVersion));
  assert(after.items[0].inventoryVersion > before.items[0].inventoryVersion);
  assert.equal(
    saved.lot.quantity,
    before.items.find((item) => item.id === 'preview-stock-egg').quantity,
  );
  journeys.push({
    kind: 'keyboard-edit-cancel-beforeunload-lock-real-save',
    patchFields: Object.keys(patch),
    otherItemFactsUnchanged: true,
    householdRevisionBefore: before.items[0].inventoryVersion,
    householdRevisionAfter: after.items[0].inventoryVersion,
  });
  // Safe synthetic rejection, then retry the retained draft against the real API.
  await edit().click();
  await page.getByLabel('Tên nguyên liệu').fill('Trứng gà đã kiểm tra');
  await page.route(patchURL, (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'UI09_SYNTHETIC_FAILURE' }),
        })
      : route.continue(),
  );
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByLabel('Tên nguyên liệu')).toHaveValue('Trứng gà đã kiểm tra');
  await snapshot('metadata-save-error', { synthetic: true });
  await page.unroute(patchURL);
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await edit().waitFor();
  await page.reload();
  await settleDetail();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Trứng gà đã kiểm tra', exact: true }),
  ).toBeVisible();
  journeys.push({ kind: 'retained-error-draft-real-retry-reload' });
  await control('t13r-b-fail-inventory-reads');
  await goto('/fridge/ui09-read-error');
  await page.getByRole('alert').waitFor();
  await snapshot('detail-read-error', { synthetic: true });
  await control('t13r-b-restore-inventory-reads');
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByText('Không tìm thấy nguyên liệu này trong tủ.', { exact: true }).waitFor();
  journeys.push({ kind: 'synthetic-read-error-real-recovery' });
  await control('t13-reconciliation');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await goto('/inventory-reconciliation');
    await page.getByTestId('reconciliation-item').first().waitFor();
    await snapshot(`reconciliation-records-${width}`);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await goto('/inventory-reconciliation');
  await page.getByTestId('reconciliation-item').first().waitFor();
  await enlarge();
  await snapshot('reconciliation-enlarged-320');
  await goto('/inventory-reconciliation');
  await page.getByTestId('reconciliation-item').first().waitFor();
  const longObservations = await getJson('/api/v1/inventory/observations?status=OPEN');
  await page.route(observationsURL, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...longObservations,
        observations: longObservations.observations.map((observation) => ({
          ...observation,
          rawName: 'Ghi nhận nguyên liệu với tên rất dài để kiểm tra nội dung không bị cắt',
          reasons: [...observation.reasons, 'UNKNOWN_REASON_CODE_'.repeat(12)],
        })),
      }),
    }),
  );
  await goto('/inventory-reconciliation');
  await page.getByTestId('reconciliation-item').first().waitFor();
  await enlarge();
  await snapshot('reconciliation-long-content-enlarged-320', { synthetic: true });
  await page.unroute(observationsURL);
  await goto('/inventory-reconciliation');
  await page.getByTestId('reconciliation-item').first().waitFor();
  const egg = page
    .getByTestId('reconciliation-item')
    .filter({ hasText: 'Trứng kiểm kê thử nghiệm' });
  const decisionURL = (url) => url.pathname.endsWith('/decision');
  await page.route(decisionURL, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'UI09_SYNTHETIC_FAILURE' }),
    }),
  );
  await egg.getByRole('button', { name: 'Áp dụng', exact: true }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await snapshot('reconciliation-decision-error', { synthetic: true });
  await page.unroute(decisionURL);
  const accepted = page.waitForResponse(
    (r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/decision'),
  );
  await egg.getByRole('button', { name: 'Áp dụng', exact: true }).click();
  assert.equal((await accepted).status(), 201);
  await expect(egg).toHaveCount(0);
  assert.equal((await getJson('/api/v1/inventory/lots/preview-stock-egg')).lot.quantity, 5);
  const tofuBefore = (await getJson('/api/v1/inventory/lots/preview-stock-tofu')).lot;
  await page
    .getByTestId('reconciliation-item')
    .filter({ hasText: 'Đậu phụ kiểm kê thử nghiệm' })
    .getByRole('button', { name: 'Bỏ qua', exact: true })
    .click();
  await page.getByRole('heading', { name: 'Không có mục nào cần đối chiếu' }).waitFor();
  assert.deepEqual((await getJson('/api/v1/inventory/lots/preview-stock-tofu')).lot, tofuBefore);
  journeys.push({
    kind: 'real-proposal-apply-and-dismiss-after-synthetic-error',
    eggQuantity: 5,
    tofuUnchanged: true,
  });
  let releaseObservations;
  await page.route(observationsURL, async (route) => {
    await new Promise((yes) => {
      releaseObservations = yes;
    });
    await route.continue();
  });
  await goto('/inventory-reconciliation');
  await page.getByRole('status').filter({ hasText: 'Đang tải mục' }).waitFor();
  await snapshot('reconciliation-loading', { synthetic: true });
  releaseObservations();
  await page.getByRole('heading', { name: 'Không có mục nào cần đối chiếu' }).waitFor();
  await page.unroute(observationsURL);
  await page.route(observationsURL, (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
  );
  await goto('/inventory-reconciliation');
  await page.getByRole('alert').waitFor();
  await snapshot('reconciliation-read-error', { synthetic: true });
  await page.unroute(observationsURL);
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('heading', { name: 'Không có mục nào cần đối chiếu' }).waitFor();
  journeys.push({ kind: 'reconciliation-loading-error-real-retry' });
  // Session effects remain real. Only the /me transport is held/rejected here.
  const meURL = (url) => url.pathname === '/api/v1/me';
  let releaseMe;
  await page.route(meURL, async (route) => {
    await new Promise((yes) => {
      releaseMe = yes;
    });
    await route.continue();
  });
  await page.goto(`${base}/fridge`);
  await page.getByRole('heading', { name: 'Đang kiểm tra phiên…' }).waitFor();
  await snapshot('session-verifying', { synthetic: true });
  releaseMe();
  await page.locator('.kitchen-header').waitFor();
  await page.unroute(meURL);
  await page.route(meURL, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(`${base}/fridge`);
    await page.getByRole('heading', { name: 'Chưa xác minh được phiên' }).waitFor();
    await snapshot(`session-error-${width}`, { synthetic: true });
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}/fridge`);
  await page.getByRole('heading', { name: 'Chưa xác minh được phiên' }).waitFor();
  await enlarge();
  await snapshot('session-error-enlarged-320', { synthetic: true });
  await page.unroute(meURL);
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.locator('.kitchen-header').waitFor();
  journeys.push({ kind: 'session-verification-blocks-private-content-and-real-retry' });
  await page.evaluate(async () => {
    const { useAuthStore } = await import('/src/web/stores/useAuthStore.ts');
    useAuthStore.setState({ logoutStatus: 'pending' });
  });
  await page.getByRole('heading', { name: 'Đang đăng xuất…' }).waitFor();
  await snapshot('logout-pending', { synthetic: true });
  await page.evaluate(async () => {
    const { useAuthStore } = await import('/src/web/stores/useAuthStore.ts');
    useAuthStore.setState({
      logoutStatus: 'error',
      logoutError: 'Chưa xác nhận được việc thu hồi phiên thử nghiệm.',
    });
  });
  await page.getByRole('heading', { name: 'Chưa xác nhận đăng xuất' }).waitFor();
  await snapshot('logout-error', { synthetic: true });
  await page.evaluate(async () => {
    const { useAuthStore } = await import('/src/web/stores/useAuthStore.ts');
    useAuthStore.setState({ logoutStatus: 'idle', logoutError: null });
  });
  await page.locator('.kitchen-header').waitFor();
  // A rejected lazy import exercises the real application error boundary.
  const moduleURL = (url) => url.pathname === '/src/web/pages/IngredientDetailPage.tsx';
  await page.route(moduleURL, (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: 'throw new Error("UI09_SYNTHETIC_RENDER_FAILURE");',
    }),
  );
  await page.goto(`${base}/fridge/preview-stock-egg`);
  await page.getByRole('heading', { name: 'Không thể mở trang này' }).waitFor();
  await snapshot('application-render-error', { synthetic: true });
  await enlarge();
  await snapshot('application-error-enlarged-320', { synthetic: true });
  await page.unroute(moduleURL);
  await page.getByRole('button', { name: 'Tải lại', exact: true }).click();
  await settleDetail();
  journeys.push({
    kind: 'synthetic-lazy-import-error-real-boundary-and-reload',
    expectedFaultCount: expectedFaults.length,
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await snapshot('detail-normal-motion');
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(
    `PASS ${checks.length} snapshots / ${journeys.length} journeys / ${errors.length} unexpected page errors`,
  );
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ base, checks, journeys, errors, expectedFaults, mutations }, null, 2),
  );
  await browser.close();
}
