import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5197';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui05/browser');
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
await context.addInitScript(() => {
  class Recognition {
    start() {
      window.__voice = this;
    }
    stop() {
      window.__stoppedVoice = this;
    }
  }
  window.SpeechRecognition = Recognition;
  window.__spoken = [];
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
    }
  };
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      cancel() {},
      getVoices: () => [],
      speak(u) {
        window.__spoken.push(u.text);
      },
    },
  });
});
const page = await context.newPage();
const checks = [],
  journeys = [],
  errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const recipePath = '/recipes/thit-kho-trung';
const cookPath = '/cook/thit-kho-trung';
const postPath = (url) => url.pathname.endsWith('/cook/complete');
async function api(path, method = 'GET', body) {
  return page.evaluate(
    async ({ path, method, body }) => {
      const r = await fetch(`/api/v1${path}`, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Frigo-Expected-User-Id': localStorage.getItem('frigo_user_id'),
          'X-Frigo-Expected-Household-Id': localStorage.getItem('frigo_household_id'),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: r.status, data: await r.json() };
    },
    { path, method, body },
  );
}
async function store(action, args) {
  return page.evaluate(
    async ({ action, args }) => {
      const { useCookingStore } = await import('/src/web/stores/useCookingStore.ts');
      const state = useCookingStore.getState();
      if (action === 'read')
        return {
          step: state.currentStepIndex,
          attempt: state.attempt,
          runId: state.runId,
          running: state.isTimerRunning,
        };
      return state[action](...(args ?? []));
    },
    { action, args },
  );
}
async function snapshot(name) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    font: getComputedStyle(document.querySelector('.takosan-rebuild')).fontFamily,
    fields: [...document.querySelectorAll('.cooking-use-controls input')].map((el) => ({
      font: parseFloat(getComputedStyle(el).fontSize),
      height: el.getBoundingClientRect().height,
    })),
    motion: [...document.querySelectorAll('.cooking-step')].map(
      (el) => getComputedStyle(el).animationName,
    ),
    brokenImages: [...document.images]
      .filter((im) => im.complete && !im.naturalWidth)
      .map((im) => im.src),
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
  assert(layout.width <= layout.viewport, `${name}: overflow`);
  assert(layout.font.includes('Be Vietnam Pro'), `${name}: font`);
  assert(
    layout.fields.every((f) => f.font >= 16 && f.height >= 44),
    `${name}: inputs`,
  );
  assert(
    layout.motion.every((m) => m === 'none'),
    `${name}: reduced motion`,
  );
  assert.equal(violations.length, 0, `${name}: ${JSON.stringify(violations)}`);
  assert.deepEqual(layout.brokenImages, []);
  console.log(`${name}: axe0 / overflow0 / fields16 / broken0`);
}
async function start() {
  await store('resetCooking');
  await page.goto(`${base}${recipePath}`);
  await page.getByRole('button', { name: /^Bắt đầu nấu/ }).click();
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 1');
}
async function completeSteps() {
  while (await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).count())
    await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).click();
  await page.getByRole('button', { name: 'Hoàn thành nấu', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Món ăn hoàn tất', exact: true })).toBeFocused();
}
async function say(text, stopped = false) {
  await page.evaluate(
    ({ text, stopped }) => {
      const recognition = stopped ? window.__stoppedVoice : window.__voice;
      recognition.onresult({ results: [[{ transcript: text }]] });
    },
    { text, stopped },
  );
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
  for (const item of [
    { id: 'ui05-pork-a', quantity: 250, unit: 'g' },
    { id: 'ui05-pork-b', quantity: 0.5, unit: 'kg' },
  ]) {
    const r = await api('/inventory', 'POST', {
      ...item,
      name: 'Thịt ba chỉ',
      category: 'meat',
      storage: 'fridge',
    });
    assert.equal(r.status, 201, JSON.stringify(r));
    assert.equal(r.data.item.ingredientId, 'PORK_BELLY');
  }
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await start();
    await snapshot(`cooking-${width}`);
    await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).click();
    await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).click();
    await page.getByRole('button', { name: /^Bật hẹn giờ/ }).click();
    await snapshot(`timer-${width}`);
    await completeSteps();
    await snapshot(`actual-use-${width}`);
  }
  journeys.push(
    'Preparation -> steps -> timer -> shared review at five viewports; no command sent before confirmation.',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await start();
  await page.getByRole('button', { name: 'Bật trợ lý rảnh tay' }).click();
  await say('tiếp');
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 2');
  await say('tiếp');
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 3');
  await say('lùi');
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 2');
  await say('đọc lại');
  assert.match(await page.evaluate(() => window.__spoken.at(-1)), /Ướp thịt/);
  await say('tiếp');
  await say('hẹn giờ');
  await expect(page.getByTestId('cooking-countdown')).toBeVisible();
  await page.evaluate(() => window.__voice.onerror({ error: 'not-allowed' }));
  await expect(page.getByRole('button', { name: 'Bật trợ lý rảnh tay' })).toBeVisible();
  await expect(page.getByTestId('cooking-listening-status')).toContainText('Không thể nghe');
  await snapshot('voice-error-390');
  journeys.push(
    'Mocked speech: next twice, back from current step, repeat correct current instruction, timer current step, permission error -> manual controls.',
  );

  await page.clock.install();
  await page.getByRole('button', { name: 'Đặt lại hẹn giờ' }).click();
  await page.getByRole('button', { name: 'Tạm dừng hẹn giờ' }).focus();
  const live = await page.getByTestId('cooking-timer-status').textContent();
  await page.clock.runFor(2000);
  await expect(page.getByTestId('cooking-countdown')).toHaveText('07:58');
  assert.equal(await page.getByTestId('cooking-timer-status').textContent(), live);
  assert.equal(
    await page
      .getByTestId('cooking-countdown')
      .evaluate((el) => Boolean(el.closest('[aria-live], [role=status]'))),
    false,
  );
  await page.getByRole('button', { name: 'Tạm dừng hẹn giờ' }).click();
  await page.clock.runFor(10000);
  await expect(page.getByTestId('cooking-countdown')).toHaveText('07:58');
  await page.getByRole('button', { name: 'Tiếp tục hẹn giờ' }).click();
  await page.getByRole('button', { name: 'Tạm dừng hẹn giờ' }).focus();
  await page.clock.fastForward(478000);
  const expired = page.getByRole('button', { name: 'Hẹn giờ đã kết thúc', exact: true });
  await expect(expired).toHaveAttribute('aria-disabled', 'true');
  await expect(expired).toBeFocused();
  await expired.press('Space');
  await expired.press('Enter');
  await expect(page.getByTestId('cooking-countdown')).toHaveText('00:00');
  assert.equal((await store('read')).running, false);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Đặt lại hẹn giờ' })).toBeFocused();
  await snapshot('timer-expired-390');
  await page.getByRole('button', { name: 'Đặt lại hẹn giờ' }).click();
  await expect(page.getByTestId('cooking-timer-status')).toContainText('Đã đặt lại');
  await completeSteps();
  await say('tiếp', true);
  await expect(page.getByRole('heading', { name: 'Món ăn hoàn tất', exact: true })).toBeVisible();
  journeys.push(
    'Clock: countdown is not live, pause/resume, elapsed background fast-forward, expiry running false, focus retained/keyboard no-op, reset and stopped voice on review.',
  );
  const pork = page.getByRole('spinbutton', { name: 'Lượng đã dùng: Thịt ba chỉ', exact: true });
  await pork.fill('');
  await expect(page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' })).toBeDisabled();
  await pork.fill('751');
  await expect(pork).toHaveAttribute('aria-invalid', 'true');
  await pork.fill('125.5');
  await expect(page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' })).toBeEnabled();
  await snapshot('actual-use-fractional-390');
  await page.setViewportSize({ width: 390, height: 420 });
  await snapshot('actual-use-short-390');
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll('.cooking-review *')].map((el) => [
      el,
      parseFloat(getComputedStyle(el).fontSize),
    ]);
    sizes.forEach(([el, size]) => (el.style.fontSize = `${size * 2}px`));
  });
  await snapshot('actual-use-text-enlarged-320');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    history.pushState({}, '', '/fridge');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Tủ lạnh của tôi' })).toBeVisible();
  await page.evaluate(() =>
    import('/src/web/stores/useCookingStore.ts').then(({ useCookingStore }) => {
      history.pushState({}, '', '/cooking/complete');
      window.dispatchEvent(new PopStateEvent('popstate'));
      if (!useCookingStore.getState().runId) throw new Error('Draft lost');
    }),
  );
  await expect(pork).toHaveValue('125.5');
  let posted;
  const responseWait = page.waitForResponse((response) => postPath(new URL(response.url())));
  await page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' }).click();
  const response = await responseWait;
  assert.equal(response.status(), 200);
  posted = response.request().postDataJSON();
  assert.equal(posted.deductions[0].quantityDeducted, 125.5);
  assert.equal(response.request().headers()['idempotency-key'], posted.commandId);
  await expect(
    page.getByRole('heading', { name: 'Đã cập nhật tủ lạnh', exact: true }),
  ).toBeFocused();
  await snapshot('completion-server-390');
  const beforeReplay = await api('/inventory');
  const replay = await api('/recipes/vn-kho-01/cook/complete', 'POST', posted);
  assert.equal(replay.status, 200);
  assert.equal(replay.data.idempotentReplay, true);
  const afterReplay = await api('/inventory');
  assert.deepEqual(afterReplay.data.items, beforeReplay.data.items);
  const porkStock = afterReplay.data.items.filter((lot) => lot.ingredientId === 'PORK_BELLY');
  assert.equal(
    porkStock.reduce((sum, lot) => sum + lot.quantity * (lot.unit === 'kg' ? 1000 : 1), 0),
    624.5,
  );
  journeys.push({
    name: 'Real local Worker: 125.5g deducted across compatible g/kg stock; remaining624.5g; same-key replay changes no lot/version.',
    commandId: posted.commandId,
    status: response.status(),
    replay: replay.data.idempotentReplay,
    stock: porkStock,
  });
  await page.getByRole('link', { name: 'Xem Tủ lạnh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tủ lạnh của tôi' })).toBeVisible();
  assert.equal((await store('read')).runId, null);

  await start();
  await completeSteps();
  const attempts = [];
  await page.route(postPath, (route) => {
    attempts.push(route.request().postDataJSON());
    return route.fulfill({
      status: attempts.length === 1 ? 503 : 200,
      json:
        attempts.length === 1
          ? { code: 'DATABASE_UNAVAILABLE' }
          : { success: true, inventory: afterReplay.data.items },
    });
  });
  await page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa xác nhận');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('alert')).toBeInViewport();
  await expect(pork).toBeDisabled();
  await snapshot('completion-uncertain-390');
  await page.evaluate(() => {
    history.pushState({}, '', '/cook/gl-03');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Cần kiểm tra lần nấu trước' })).toBeVisible();
  await snapshot('cooking-previous-request-390');
  await page.getByRole('link', { name: 'Kiểm tra yêu cầu trước' }).click();
  await expect(page.getByRole('button', { name: 'Thử lại cùng yêu cầu' })).toBeVisible();
  await page.getByRole('button', { name: 'Thử lại cùng yêu cầu' }).click();
  await expect(
    page.getByRole('heading', { name: 'Đã cập nhật tủ lạnh', exact: true }),
  ).toBeVisible();
  assert.deepEqual(attempts[0], attempts[1]);
  await page.unroute(postPath);
  journeys.push(
    '503 ambiguity locks input; explicit retry sends identical command ID and payload.',
  );

  await start();
  await completeSteps();
  await page.route(postPath, (route) =>
    route.fulfill({ status: 409, json: { code: 'INSUFFICIENT_INVENTORY' } }),
  );
  await page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' }).click();
  await expect(page.getByRole('alert')).toContainText('không đủ');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('alert')).toBeInViewport();
  const stockPath = (url) => url.pathname === '/api/v1/inventory';
  await page.route(stockPath, (route) =>
    route.fulfill({ status: 503, json: { code: 'UNAVAILABLE' } }),
  );
  await page.getByRole('button', { name: 'Tải lại lượng trong tủ để kiểm tra' }).click();
  await expect(page.locator('.cooking-feedback')).toContainText('Chưa tải lại');
  await expect(pork).toBeDisabled();
  await snapshot('completion-refresh-failed-390');
  await page.unroute(stockPath);
  await page.getByRole('button', { name: 'Tải lại lượng trong tủ để kiểm tra' }).click();
  await expect(pork).toBeEnabled();
  await expect(page.locator('.cooking-feedback')).toContainText('Đã tải lại');
  await page.unroute(postPath);
  journeys.push(
    'Known409 rejected: failed authoritative refresh keeps amount locked; successful refresh retains actual-use intent and reopens review.',
  );

  let release;
  await page.route(postPath, async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: { success: true, inventory: afterReplay.data.items } });
  });
  await page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' }).click();
  await expect(page.getByText('Đang gửi yêu cầu hoàn tất…')).toBeVisible();
  await page.evaluate(() => {
    history.pushState({}, '', '/fridge');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Tủ lạnh của tôi' })).toBeVisible();
  release();
  await expect.poll(async () => (await store('read')).attempt?.status).toBe('saved');
  assert(new URL(page.url()).pathname === '/fridge');
  await page.unroute(postPath);
  journeys.push(
    'Late completion after SPA navigation updates only its own run; does not navigate the closed review.',
  );

  await start();
  await completeSteps();
  await page.route(postPath, (route) => route.abort());
  await page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' }).click();
  await expect(
    page.getByRole('heading', { name: 'Đã lưu trên thiết bị', exact: true }),
  ).toBeFocused();
  await expect(pork).toBeDisabled();
  await snapshot('completion-pending-sync-390');
  assert(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('frigo_sync_outbox_v1')).some((op) =>
        op.path.endsWith('/cook/complete'),
      ),
    ),
  );
  await page.unroute(postPath);
  journeys.push(
    'Aborted completion queues real existing outbox; locked pending-sync feedback makes no server-success claim.',
  );
  await store('resetCooking');
  await page.goto(`${base}/cooking/complete`);
  await expect(page.getByRole('heading', { name: 'Không có món ăn đang hoàn tất' })).toBeVisible();
  await snapshot('completion-no-draft-390');

  await page.route(
    (url) => url.pathname === '/api/v1/recipes/empty-recipe',
    async (route) => {
      const result = await api('/recipes/thit-kho-trung');
      await route.fulfill({
        json: {
          ...result.data,
          recipe: { ...result.data.recipe, id: 'empty-recipe', slug: 'empty-recipe', steps: [] },
        },
      });
    },
  );
  await page.goto(`${base}/cook/empty-recipe`);
  await expect(page.getByRole('heading', { name: 'Công thức chưa có bước nấu' })).toBeVisible();
  await snapshot('cooking-empty-steps-390');
  await page.getByRole('button', { name: 'Kiểm tra lượng thực dùng' }).click();
  await expect(page.getByRole('heading', { name: 'Món ăn hoàn tất', exact: true })).toBeVisible();
  await store('resetCooking');
  await page.goto(`${base}/cooking/vn-kho-01`);
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 1');
  await snapshot('cooking-id-alias-390');
  await page.getByRole('button', { name: 'Thoát chế độ nấu' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Thoát chế độ nấu' })).toBeFocused();
  journeys.push(
    'Direct completion no-draft, empty recipe steps, ID route alias, exit dialog Escape/focus.',
  );
  await start();
  await completeSteps();
  await page.route(postPath, (route) =>
    route.fulfill({ status: 422, json: { code: 'HARD_CONSTRAINT_CONFLICT' } }),
  );
  await page.getByRole('button', { name: 'Xác nhận & Cập nhật tủ lạnh' }).click();
  await expect(page.getByRole('alert')).toContainText('ràng buộc ăn uống');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('alert')).toBeInViewport();
  await snapshot('completion-restricted-390');
  await page.getByRole('link', { name: 'Kết thúc và chọn món khác' }).click();
  await expect(
    page.getByRole('heading', { name: 'Chọn món cho căn bếp của bạn', exact: true }),
  ).toBeVisible();
  assert.equal((await store('read')).runId, null);
  await page.unroute(postPath);
  journeys.push(
    'Known safety rejection locks old amount; explicit end-and-choose action clears only rejected cooking run, sends no further command.',
  );

  await start();
  await page.getByRole('button', { name: 'Bật trợ lý rảnh tay' }).click();
  await say('tiếp');
  await page.evaluate(() => {
    history.pushState({}, '', '/cooking/gl-03');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 1');
  await expect(page.locator('.cooking-context h1')).toHaveText('Cà chua xào trứng Trung Hoa');
  await say('tiếp', true);
  await expect(page.locator('.cooking-step h2')).toHaveText('Bước 1');
  await snapshot('cooking-route-change-390');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  assert.notEqual(
    await page.locator('.cooking-step').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  await page.screenshot({ path: resolve(out, 'cooking-motion-normal-390.png'), fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  journeys.push(
    'SPA recipe route change starts correct recipe at step1, stops prior voice and ignores old callback. Normal step reveal present, reduced-motion variant disables it.',
  );

  await store('resetCooking');
  await page.goto(`${base}/cook/nonexistent-ui05`);
  await expect(page.getByRole('alert')).toBeVisible();
  await snapshot('cooking-recipe-error-390');
  await start();
  await page.setViewportSize({ width: 390, height: 420 });
  await page.getByRole('button', { name: 'Bước tiếp theo', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Bước tiếp theo', exact: true })).toBeInViewport();
  await snapshot('cooking-short-390');
  journeys.push(
    'Missing recipe has visible retry/error recovery; step action reachable at390x420 without fixed overlay.',
  );
  assert.deepEqual(errors, []);
} finally {
  await writeFile(
    resolve(out, 'browser-observations.json'),
    JSON.stringify({ base, syntheticLocalOnly: true, checks, journeys, errors }, null, 2) + '\n',
  );
  await browser.close();
}
