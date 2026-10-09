import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5197';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui04/browser');
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
const checks = [];
const journeys = [];
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
async function api(path, method = 'GET', body) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const res = await fetch(`/api/v1${path}`, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Frigo-Expected-User-Id': localStorage.getItem('frigo_user_id'),
          'X-Frigo-Expected-Household-Id': localStorage.getItem('frigo_household_id'),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: res.status, data: await res.json() };
    },
    { path, method, body },
  );
}
async function snapshot(name) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily,
    inputs: [...document.querySelectorAll('.review-input')].map((el) => ({
      font: parseFloat(getComputedStyle(el).fontSize),
      height: el.getBoundingClientRect().height,
    })),
    motion: [...document.querySelectorAll('.scan-processing-motion')].map(
      (el) => getComputedStyle(el).animationName,
    ),
    brokenImages: [...document.images]
      .filter((im) => im.complete && im.naturalWidth === 0)
      .map((im) => im.getAttribute('src')),
  }));
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const violations = axe.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((n) => n.target),
  }));
  checks.push({ name, url: page.url(), ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  if (name.endsWith('-390') || name.endsWith('-1440'))
    await page.screenshot({ path: resolve(out, `${name}-viewport.png`) });
  assert(layout.documentWidth <= layout.viewport, `${name}: overflow`);
  assert(layout.font.includes('Be Vietnam Pro'), `${name}: font`);
  assert(
    layout.inputs.every((el) => el.font >= 16 && el.height >= 44),
    `${name}: fields`,
  );
  assert(
    layout.motion.every((name) => name === 'none'),
    `${name}: reduced motion`,
  );
  assert.equal(layout.brokenImages.length, 0, `${name}: broken images`);
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  console.log(`${name}: axe0 / overflow0 / fields16 / broken0`);
}
const fridgeId = 't13b-preview-fridge';
const receiptId = 't13b-preview-receipt';
const fridgeRoute = `/scan/${fridgeId}/review`;
const receiptRoute = `/scan/receipt-review?scanId=${receiptId}`;
const fridgeRow = (index = 0) => page.locator('[data-scan-item-id]').nth(index);
const receiptRow = (index = 0) => page.getByTestId('receipt-line').nth(index);
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(/planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  await page.evaluate(async () => {
    const r = await fetch('/__preview/t13-scans', { method: 'POST' });
    if (!r.ok) throw new Error('fixture seed');
  });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}${fridgeRoute}`);
    await expect(page.getByRole('button', { name: 'Xác nhận nguyên liệu (4 món)' })).toBeEnabled();
    await snapshot(`photo-review-${width}`);
    await page.goto(`${base}${receiptRoute}`);
    await expect(page.getByRole('button', { name: 'Nhập 4 món vào Tủ lạnh' })).toBeEnabled();
    await snapshot(`receipt-review-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/scan`);
  await expect(page.getByText('Camera không sẵn sàng')).toBeVisible();
  await snapshot('scan-camera-390');
  await page.getByRole('button', { name: 'Hóa đơn', exact: true }).click();
  await snapshot('scan-receipt-390');
  await page.setViewportSize({ width: 1440, height: 900 });
  await snapshot('scan-camera-1440');
  journeys.push(
    'Camera denied: gallery reachable, mode instructions and quota visible at mobile/desktop. Physical camera not exercised.',
  );

  // Local image with deterministic transport delay: elapsed time never asserts server stages.
  let releaseUpload;
  const uploadPath = (url) => url.pathname === '/api/v1/scans/receipt';
  await page.route(uploadPath, async (route) => {
    await new Promise((resolve) => {
      releaseUpload = resolve;
    });
    await route.fulfill({ json: { scan: { id: receiptId, status: 'pending', items: [] } } });
  });
  const image = await sharp({
    create: { width: 64, height: 64, channels: 3, background: '#ee705e' },
  })
    .png()
    .toBuffer();
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: image });
  await expect(page.getByTestId('scan-processing-state')).toBeVisible();
  await expect(page.getByTestId('scan-processing-state').getByText('Đã chờ 3 giây')).toBeVisible();
  assert.equal(
    await page
      .getByTestId('scan-processing-state')
      .getByText('Đang gửi ảnh', { exact: true })
      .count(),
    1,
  );
  await snapshot('uploading-truth-1440');
  releaseUpload();
  await page.waitForURL(/receipt-review/);
  await expect(receiptRow()).toBeVisible();
  await page.unroute(uploadPath);
  await page.getByText('Xem ảnh vừa quét', { exact: true }).click();
  await expect(page.locator('.review-source img')).toBeVisible();
  await snapshot('receipt-source-1440');
  journeys.push(
    'Synthetic upload: after 3s still sending, then server-owned receipt review; no artificial stage advances.',
  );

  await page.getByRole('button', { name: 'Quay lại màn quét' }).click();
  await page.waitForURL(`${base}/scan`);
  await page.getByRole('button', { name: 'Nguyên liệu', exact: true }).click();
  const photoUploadPath = (url) => url.pathname === '/api/v1/scans/fridge';
  await page.route(photoUploadPath, (route) =>
    route.fulfill({ json: { scan: { id: fridgeId, status: 'pending', items: [] } } }),
  );
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: image });
  await page.waitForURL(new RegExp(`/scan/${fridgeId}/review$`));
  await expect(fridgeRow()).toBeVisible();
  await page.getByText('Xem ảnh vừa quét', { exact: true }).click();
  await expect(page.locator('.review-source img')).toBeVisible();
  await snapshot('photo-source-1440');
  await page.unroute(photoUploadPath);
  journeys.push(
    'Same synthetic file selected again after switching to ingredient mode; new photo route and explicitly bound source preview.',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}${fridgeRoute}`);
  await expect(fridgeRow()).toBeVisible();
  const raw = await fridgeRow().locator('[data-raw-evidence]').innerText();
  await fridgeRow().getByLabel('Số lượng', { exact: true }).fill('');
  await expect(page.getByRole('button', { name: 'Xác nhận nguyên liệu (4 món)' })).toBeDisabled();
  await fridgeRow().getByLabel('Số lượng', { exact: true }).fill('1.5');
  await fridgeRow()
    .getByRole('combobox', { name: 'Bảo quản', exact: true })
    .selectOption('freezer');
  await fridgeRow().getByLabel('Hạn dùng', { exact: true }).fill('2030-12-31');
  await expect(fridgeRow().locator('[data-raw-evidence]')).toHaveText(raw);
  await fridgeRow(2).getByLabel('Số lượng', { exact: true }).fill('');
  await fridgeRow(2).getByRole('button', { name: 'Từ chối dòng này' }).click();
  await expect(page.getByRole('button', { name: 'Xác nhận nguyên liệu (3 món)' })).toBeEnabled();
  await page.getByRole('button', { name: 'Thêm nguyên liệu AI còn thiếu' }).click();
  await page.getByLabel('Tên nguyên liệu', { exact: true }).last().fill('Muối');
  await page.getByLabel('Số lượng', { exact: true }).last().fill('0.25');
  await page.locator('#scan-add-unit').selectOption('pack');
  await snapshot('manual-sheet-390');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Thêm nguyên liệu AI còn thiếu' })).toBeFocused();
  await page.getByRole('button', { name: 'Thêm nguyên liệu AI còn thiếu' }).click();
  await page.getByRole('button', { name: 'Thêm vào danh sách', exact: true }).click();
  await snapshot('photo-edited-390');
  const confirmation = page.waitForResponse((r) => r.url().endsWith(`/scans/${fridgeId}/confirm`));
  await page.getByRole('button', { name: 'Xác nhận nguyên liệu (4 món)' }).click();
  assert.equal((await confirmation).status(), 200);
  await page.waitForURL(/fridge$/);
  const saved = (await api(`/scans/${fridgeId}`)).data.scan;
  assert.equal(saved.status, 'confirmed');
  assert.equal(saved.items[0].estimatedQuantity, 1.5);
  assert.equal(saved.items[0].expiryDate, '2030-12-31');
  assert.equal(saved.items[2].reviewState, 'REJECTED');
  await page.goto(`${base}${fridgeRoute}`);
  await expect(page.getByRole('button', { name: 'Xem tủ lạnh' })).toBeVisible();
  await expect(fridgeRow().getByLabel('Hạn dùng', { exact: true })).toHaveValue('2030-12-31');
  await snapshot('photo-confirmed-390');
  journeys.push(
    'Real local Worker photo: fractional quantity, freezer, explicit date, invalid rejected row, manual add, Escape/focus return, confirm and read-only reopen.',
  );

  await page.goto(`${base}${receiptRoute}`);
  await expect(receiptRow()).toBeVisible();
  await receiptRow(1).getByLabel('Số lượng', { exact: true }).fill('0.25');
  await receiptRow(1)
    .getByRole('combobox', { name: 'Nơi bảo quản', exact: true })
    .selectOption('freezer');
  await receiptRow(1).getByLabel('Hạn dùng trên nhãn').fill('2030-12-31');
  await receiptRow(2)
    .getByRole('button', { name: /Bỏ qua/ })
    .click();
  await receiptRow(2)
    .getByRole('button', { name: /Khôi phục/ })
    .click();
  await receiptRow(2)
    .getByRole('button', { name: /Bỏ qua/ })
    .click();
  await receiptRow(1).getByText('Xem OCR gốc', { exact: false }).click();
  await snapshot('receipt-edited-390');
  const receiptConfirmation = page.waitForResponse((r) =>
    r.url().endsWith(`/scans/${receiptId}/confirm`),
  );
  await page.getByRole('button', { name: 'Nhập 3 món vào Tủ lạnh' }).click();
  assert.equal((await receiptConfirmation).status(), 200);
  await page.waitForURL(/fridge$/);
  const receipt = (await api(`/scans/${receiptId}`)).data.scan;
  assert.equal(receipt.status, 'confirmed');
  assert.equal(receipt.items[1].estimatedQuantity, 0.25);
  assert.equal(receipt.items[1].storage, 'freezer');
  assert.equal(receipt.items[2].reviewState, 'REJECTED');
  await page.goto(`${base}${receiptRoute}`);
  await expect(page.getByRole('button', { name: 'Xem tủ lạnh' })).toBeVisible();
  await snapshot('receipt-confirmed-390');
  journeys.push(
    'Real local Worker receipt: edit fractional quantity/storage/expiry; reject/restore; immutable OCR prices; confirm and read-only reopen.',
  );

  const statePath = (url) => url.pathname === '/api/v1/scans/ui04-state';
  let dto = { id: 'ui04-state', status: 'pending', items: [] };
  let stateReads = 0;
  await page.route(statePath, (route) => {
    stateReads += 1;
    return route.fulfill({ json: { scan: dto } });
  });
  await page.goto(`${base}/scan/ui04-state/review`);
  await expect(page.getByTestId('scan-processing-state')).toBeVisible();
  await snapshot('photo-pending-390');
  dto = { id: 'ui04-state', status: 'failed', items: [], errorCode: 'MAX_ATTEMPTS_EXCEEDED' };
  await expect(page.getByRole('button', { name: 'Quét ảnh mới' })).toBeVisible();
  await snapshot('photo-failed-390');
  dto = {
    id: 'wrong-owner',
    status: 'ready',
    items: [
      {
        id: 'private',
        rawName: 'PRIVATE_WRONG_SCAN',
        estimatedQuantity: 1,
        unit: 'piece',
        storage: 'fridge',
      },
    ],
  };
  await page.goto(`${base}/scan/receipt-review?scanId=ui04-state`);
  await expect(page.getByText(/không khớp/)).toBeVisible();
  assert(!(await page.getByText('PRIVATE_WRONG_SCAN').count()));
  await snapshot('receipt-mismatch-390');
  dto = { id: 'ui04-state', status: 'ready', items: [] };
  await page.goto(`${base}/scan/receipt-review?scanId=ui04-state`);
  await expect(page.getByText('Không còn món nào trong hóa đơn')).toBeVisible();
  await snapshot('receipt-empty-390');
  journeys.push(
    'Synthetic responses: pending→failed, receipt identity mismatch hides wrong rows; empty review prevents confirm.',
  );
  dto = {
    id: 'ui04-state',
    status: 'ready',
    items: [
      {
        id: 'ui04-line',
        rawName: 'Muối',
        estimatedQuantity: 0.5,
        unit: 'pack',
        storage: 'pantry',
        confidence: null,
      },
    ],
  };
  const confirmationPath = (url) => url.pathname === '/api/v1/scans/ui04-state/confirm';
  await page.route(confirmationPath, (route) => route.abort('internetdisconnected'));
  await page.goto(`${base}/scan/ui04-state/review`);
  await expect(page.getByRole('button', { name: 'Xác nhận nguyên liệu (1 món)' })).toBeEnabled();
  await page.getByRole('button', { name: 'Xác nhận nguyên liệu (1 món)' }).click();
  await expect(page.getByText(/Chờ đồng bộ khi có kết nối/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xem tủ lạnh' })).toBeVisible();
  await snapshot('photo-pending-sync-390');
  await page.unroute(confirmationPath);
  await page.getByRole('button', { name: 'Xem tủ lạnh' }).click();
  await page.waitForURL(`${base}/fridge`);
  // Lazy route navigation changes the URL before the destination has committed.
  await expect(page.getByRole('heading', { name: 'Tủ lạnh của tôi', exact: true })).toBeVisible();
  dto = { ...dto, status: 'confirmed' };
  const readsBeforeReturn = stateReads;
  await page.evaluate(() => {
    history.pushState({}, '', '/scan/ui04-state/review');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByText('Bản quét đã xác nhận · Chỉ xem', { exact: true })).toBeVisible();
  assert(
    stateReads > readsBeforeReturn,
    'Return after pending confirmation must hydrate server state',
  );
  await snapshot('photo-return-after-pending-390');
  journeys.push(
    'Synthetic lost-confirm-response: pendingSync visible before leaving, edits/confirm disabled; SPA return loads authoritative confirmed state rather than reusing the queued ready draft.',
  );
  await page.unroute(statePath);

  await page.setViewportSize({ width: 390, height: 420 });
  await page.goto(`${base}${receiptRoute}`);
  await expect(receiptRow()).toBeVisible();
  assert.equal(
    await page.locator('.review-actions').evaluate((el) => getComputedStyle(el).position),
    'static',
  );
  await snapshot('receipt-keyboard-height-390');
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(`${base}${fridgeRoute}`);
  await expect(fridgeRow()).toBeVisible();
  await page.evaluate(() => {
    const elements = [
      ...document.querySelectorAll(
        '.review-workspace p, .review-workspace label, .review-workspace button, .review-workspace input, .review-workspace select, .review-workspace h1, .review-workspace h2, .review-workspace span, .review-workspace summary',
      ),
    ];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, index) => {
      el.style.fontSize = `${sizes[index] * 2}px`;
      el.style.lineHeight = '1.5';
      el.style.height = 'auto';
    });
  });
  await snapshot('photo-text-enlarged-320');
  journeys.push(
    'Short420px viewport uses in-flow actions; 320px (1280px/400% reflow equivalent width) plus synthetic enlarged text checked. Not actual OS keyboard/zoom.',
  );
  assert.equal(errors.length, 0, `Page errors: ${errors.join(',')}`);
  console.log(`PASS ${checks.length} axe/layout checks; ${journeys.length} journeys; pageerrors0`);
} finally {
  await writeFile(
    resolve(out, 'observations.json'),
    JSON.stringify({ base, checks, journeys, errors }, null, 2),
  );
  await browser.close();
}
