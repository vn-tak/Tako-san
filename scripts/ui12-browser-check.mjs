import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5212';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
const off = process.env.UI12_FLAG === 'off';
const out = resolve(process.env.UI_REBUILD_OUT ?? `.artifacts/ui12/browser-${off ? 'off' : 'on'}`);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'vi-VN',
  reducedMotion: 'reduce',
  serviceWorkers: 'block',
});
await context.route(
  (url) => url.origin !== base,
  (route) => route.abort(),
);
const page = await context.newPage();
const checks = [],
  journeys = [],
  errors = [],
  writes = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('request', (r) => {
  if (!['GET', 'HEAD'].includes(r.method()) && new URL(r.url()).pathname.startsWith('/api/v1/'))
    writes.push({ path: new URL(r.url()).pathname, method: r.method() });
});
async function get(path) {
  return page.evaluate(async (path) => {
    const r = await fetch(`/api/v1${path}`);
    return { status: r.status, data: await r.json() };
  }, path);
}
async function go(path) {
  await page.goto(`${base}${path}`);
  await page.locator('.kitchen-header').waitFor();
  await expect(page.locator('#kitchen-main h1')).toHaveCount(1);
  if (path.startsWith('/scan/') && path.includes('receipt-review'))
    await expect(page.getByTestId('receipt-line')).toHaveCount(4);
  else if (path.startsWith('/scan/'))
    await expect(page.locator('[data-scan-item-id]')).toHaveCount(4);
  if (path === '/settings/planning')
    await page.getByRole('button', { name: 'Lưu cài đặt', exact: true }).waitFor();
  if (path === '/me/preferences') await page.locator('.account-editor').waitFor();

  if (path === '/recipes') await page.locator('.discovery-grid > a').first().waitFor();
  if (path.startsWith('/recipes/')) await page.locator('.recipe-overview').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kitchen-navigation=persistent]');
    const nav = document.querySelector('.kitchen-bottom-nav');
    return (
      !root ||
      Math.abs(
        parseFloat(root.style.getPropertyValue('--kitchen-nav-height')) -
          nav.getBoundingClientRect().height,
      ) < 1
    );
  });
}
async function enlarge() {
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll('.takosan-rebuild *')];
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => (el.style.fontSize = `${sizes[i] * 2}px`));
  });
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kitchen-navigation=persistent]');
    return (
      !root ||
      Math.abs(
        parseFloat(root.style.getPropertyValue('--kitchen-nav-height')) -
          document.querySelector('.kitchen-bottom-nav').getBoundingClientRect().height,
      ) < 1
    );
  });
}
async function shot(name, { publicPage = false, immersive = false, synthetic = false } = {}) {
  await page.evaluate(() => {
    for (const im of document.images) im.loading = 'eager';
  });
  await page.waitForFunction(() => [...document.images].every((im) => im.complete));
  await page.waitForFunction(() => !document.querySelector('[data-recipe-media=loading]'));
  const layout = await page.evaluate(() => {
    const box = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
    };
    const visible = (el) => {
      const b = box(el);
      return b.width > 0 && b.height > 0;
    };
    const nav = [...document.querySelectorAll('nav[aria-label="Điều hướng chính"]')].find(visible);
    const links = nav
      ? [...nav.querySelectorAll('a')].map((el) => {
          const label =
            el.querySelector('.kitchen-nav-label') ?? el.querySelector('.kitchen-scan-link span');
          return {
            text: el.textContent.trim(),
            href: el.getAttribute('href'),
            current: el.getAttribute('aria-current'),
            box: box(el),
            label: label ? box(label) : null,
            clipped: label
              ? label.scrollWidth > label.clientWidth + 1 ||
                label.scrollHeight > label.clientHeight + 1
              : false,
          };
        })
      : [];
    const overlaps = [];
    for (let i = 0; i < links.length; i++)
      for (let j = i + 1; j < links.length; j++) {
        const a = links[i].label,
          b = links[j].label;
        if (
          a &&
          b &&
          Math.min(a.right, b.right) > Math.max(a.x, b.x) + 1 &&
          Math.min(a.bottom, b.bottom) > Math.max(a.y, b.y) + 1
        )
          overlaps.push([links[i].text, links[j].text]);
      }
    const root = document.querySelector('[data-kitchen-navigation=persistent]');
    const bottom = document.querySelector('.kitchen-bottom-nav');
    const bottomBox = bottom ? box(bottom) : null;
    const actions = [...document.querySelectorAll('[data-kitchen-action], .review-actions')]
      .filter(visible)
      .map((el) => ({ box: box(el), position: getComputedStyle(el).position }));
    return {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      h1: document.querySelectorAll('h1').length,
      broken: [...document.images]
        .filter((im) => im.complete && !im.naturalWidth)
        .map((im) => im.getAttribute('src')),
      lockups: [...document.querySelectorAll('.kitchen-brand-link, .kitchen-sidebar-brand')].filter(
        visible,
      ).length,
      nav: nav ? box(nav) : null,
      links,
      overlaps,
      bottom: bottomBox,
      actions,
      offset: root ? parseFloat(root.style.getPropertyValue('--kitchen-nav-height')) : null,
      header: document.querySelector('.kitchen-header')
        ? box(document.querySelector('.kitchen-header'))
        : null,
      scan: [...document.querySelectorAll('.kitchen-scan-link')].filter(visible).map(box),
      recipeClipping: [
        ...document.querySelectorAll(
          '.recipe-badges > span, .recipe-facts > span, .recipe-tabs button, .recipe-nutrition-grid p, .ingredient-availability-row p, .kitchen-recipe-card h2, .kitchen-recipe-card h3, .kitchen-recipe-readiness, .kitchen-recipe-facts span, .recipe-media-missing span',
        ),
      ]
        .filter(visible)
        .filter(
          (el) => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2,
        )
        .map((el) => ({ text: el.textContent.trim(), className: el.className })),
      media: [...document.querySelectorAll('[data-recipe-media]')].map((el) => ({
        state: el.dataset.recipeMedia,
        height: el.getBoundingClientRect().height,
      })),
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  });
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) }));
  checks.push({ name, path: new URL(page.url()).pathname, synthetic, ...layout, violations });
  await page.screenshot({ path: resolve(out, `${name}.png`) });
  assert.equal(layout.scrollWidth, layout.width, `${name}: overflow`);
  assert.equal(layout.h1, 1, `${name}: headings`);
  assert.deepEqual(layout.broken, [], `${name}: assets`);
  assert.deepEqual(layout.recipeClipping, [], `${name}: recipe text clipping`);
  assert.deepEqual(violations, [], `${name}: axe ${JSON.stringify(violations)}`);
  if (!publicPage && !immersive) {
    assert.equal(layout.lockups, 1, `${name}: brand`);
    assert.deepEqual(layout.overlaps, [], `${name}: labels`);
    assert(
      layout.links.every((l) => !l.clipped),
      `${name}: clipped`,
    );
    assert.equal(
      layout.links.filter((l) => l.href !== '/scan' && l.text).length,
      5,
      `${name}: roots`,
    );
    if (layout.width < 640) {
      assert(layout.scan.length === 1 && layout.scan[0].height >= 44, `${name}: scan access`);
      assert(Math.abs(layout.offset - layout.bottom.height) < 1, `${name}: measured nav`);
      assert(
        layout.links.every((l) => l.box.bottom <= layout.bottom.bottom + 1),
        `${name}: links escape nav`,
      );
      for (const action of layout.actions)
        if (['fixed', 'sticky'].includes(action.position))
          assert(action.box.bottom <= layout.bottom.y + 1, `${name}: action overlaps nav`);
    }
  }
  if (immersive) assert.equal(layout.nav, null, `${name}: immersive`);
  console.log(
    `${name}: roots${layout.links.length} overlap${layout.overlaps.length} axe${violations.length} width${layout.scrollWidth}`,
  );
}
async function checkFocus(selector, name) {
  const field = page.locator(selector).last();
  await field.focus();
  await expect
    .poll(() =>
      field.evaluate((el) => {
        const b = el.getBoundingClientRect(),
          style = document.documentElement.style;
        const top = parseFloat(style.scrollPaddingTop) || 0,
          bottom = innerHeight - (parseFloat(style.scrollPaddingBottom) || 0);
        return b.top >= top - 1 && b.bottom <= bottom + 1;
      }),
    )
    .toBe(true);
  journeys.push({ kind: name, selector });
}
try {
  await page.goto(`${base}/__preview`);
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL(off ? /week$/ : /planner$/);
  await page.goto(`${base}/onboarding`);
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu với Takosan', exact: true }).click();
  await page.waitForURL(`${base}/`);
  if (!off) await page.evaluate(() => fetch('/__preview/t13-scans', { method: 'POST' }));
  const before = await get('/inventory');
  assert.equal(before.status, 200);
  const writeStart = writes.length;
  const routes = off
    ? [
        ['week', '/week'],
        ['week-setup', '/week/setup'],
      ]
    : [
        ['home', '/'],
        ['stock', '/fridge'],
        ['detail', '/ingredients/preview-stock-egg'],
        ['review', '/scan/t13b-preview-fridge/review'],
        ['receipt', '/scan/receipt-review?scanId=t13b-preview-receipt'],
        ['recipe', '/recipes/thit-kho-trung'],
        ['recipes', '/recipes'],
        ['photo', '/recipes/pasta-pomodoro'],
        ['notifications', '/notifications'],
        ['privacy', '/settings/privacy'],
        ['planner', '/planner'],
        ['shopping', '/shopping'],
        ['account', '/me'],
        ['preferences', '/me/preferences'],
        ['planning-settings', '/settings/planning'],
      ];
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [name, path] of routes) {
      await go(path);
      await shot(`${name}-${width}`);
    }
  }
  for (const [width, height, text] of [
    [320, 844, true],
    [768, 844, true],
    [390, 420, false],
    [768, 420, false],
    [320, 420, true],
  ]) {
    await page.setViewportSize({ width, height });
    const cases = off
      ? routes
      : routes.filter(([name]) =>
          [
            'stock',
            'review',
            'recipe',
            'recipes',
            'photo',
            'shopping',
            'preferences',
            'planning-settings',
          ].includes(name),
        );
    for (const [name, path] of cases) {
      await go(path);
      if (text) await enlarge();
      await shot(`${name}-${width}-${height}${text ? '-text2' : ''}`, { synthetic: text });
    }
  }
  if (!off) {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await go('/recipes/thit-kho-trung');
      for (const name of ['Cách nấu', 'Dinh dưỡng']) {
        await page.getByRole('tab', { name, exact: true }).click();
        await shot(`panel-${name === 'Cách nấu' ? 'steps' : 'nutrition'}-${width}`);
      }
    }
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const name of ['Cách nấu', 'Dinh dưỡng']) {
        await go('/recipes/thit-kho-trung');
        await page.getByRole('tab', { name, exact: true }).click();
        await enlarge();
        await shot(`panel-${name === 'Cách nấu' ? 'steps' : 'nutrition'}-text2-${width}`, {
          synthetic: true,
        });
      }
    }
    await page.setViewportSize({ width: 320, height: 844 });
    await go('/recipes/thit-kho-trung');
    await page.getByRole('tab', { name: 'Cách nấu', exact: true }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Dinh dưỡng', exact: true })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Dinh dưỡng', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.keyboard.press('Home');
    await expect(page.getByRole('tab', { name: 'Cách nấu', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Nguyên liệu', exact: true })).toBeFocused();
    journeys.push({ kind: 'recipe-tabs-native-Home-End-arrows' });
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await go(off ? '/week/setup' : '/shopping');
  if (!off) {
    await checkFocus('[name=shopping-name]', 'keyboard-shopping-name');
    await checkFocus('[name=shopping-unit]', 'keyboard-shopping-unit');
    await go('/fridge');
    const add = page.getByRole('button', { name: 'Thêm nguyên liệu', exact: true });
    await add.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(add).toBeFocused();
    journeys.push({ kind: 'inventory-dialog-keyboard-Escape-focus-return' });
    await go('/ingredients/preview-stock-egg');
    const edit = page.getByRole('button', { name: 'Sửa thông tin nguyên liệu', exact: true });
    await edit.click();
    await shot('stock-edit-320');
    await checkFocus('.stock-detail-body input', 'stock-edit-fields-clear-chrome');
    await page.getByRole('button', { name: 'Hủy', exact: true }).click();
    await expect(edit).toBeFocused();
    journeys.push({ kind: 'stock-edit-cancel-no-write' });
    await go('/shopping');
    const nav = page.locator('.kitchen-bottom-nav');
    await nav.locator('a').first().focus();
    for (let i = 1; i < 5; i++) {
      await page.keyboard.press('Tab');
      await expect(nav.locator('a').nth(i)).toBeFocused();
    }
    await page.keyboard.press('Enter');
    await page.waitForURL(`${base}/me`);
    await page.getByRole('heading', { name: 'Hồ sơ', exact: true }).waitFor();
    journeys.push({ kind: 'five-root-keyboard-navigation' });
    await page.locator('.kitchen-header-scan').focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(`${base}/scan`);
    await expect(page.locator('#kitchen-main h1')).toHaveCount(1);
    await expect(page.locator('nav')).toHaveCount(0);
    await shot('scan-immersive-320', { immersive: true });
    journeys.push({ kind: 'mobile-header-Scan-keyboard-access' });
    await go('/recipes/thit-kho-trung');
    await page.locator('.kitchen-recipe-action button').click();
    await page.waitForURL(`${base}/cook/thit-kho-trung`);
    await expect(page.locator('#kitchen-main h1')).toHaveCount(1);
    await expect(page.locator('nav')).toHaveCount(0);
    await shot('cook-immersive-320', { immersive: true });
    journeys.push({ kind: 'recipe-cook-action-immersive-no-consumption' });
    for (const [path, selector] of [
      ['/settings/planning', 'main button[role=switch]'],
      ['/me/preferences', 'main button[aria-pressed]'],
      ['/scan/t13b-preview-fridge/review', '.review-input'],
    ]) {
      await go(path);
      await checkFocus(selector, `focus-clears-actions-${path}`);
    }
    await go('/shopping');
    await enlarge();
    await checkFocus('[name=shopping-unit]', 'text2-shopping-field-clear-chrome');
    await shot('shopping-text2-focus');
    await go('/shopping');
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('.kitchen-banner-slot > div')).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          parseFloat(
            document
              .querySelector('[data-kitchen-navigation]')
              .style.getPropertyValue('--kitchen-banner-height'),
          ),
        ),
      )
      .toBeGreaterThan(0);
    await shot('synthetic-offline-banner', { synthetic: true });
    await checkFocus('[name=shopping-unit]', 'offline-banner-field-clear-chrome');
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.locator('.kitchen-banner-slot > div')).toHaveCount(0);
    await go('/shopping');
    await page.locator('.kitchen-bottom-nav').evaluate((el) => (el.style.paddingBottom = '34px'));
    await expect
      .poll(() =>
        page.evaluate(() =>
          Math.abs(
            parseFloat(
              document
                .querySelector('[data-kitchen-navigation]')
                .style.getPropertyValue('--kitchen-nav-height'),
            ) - document.querySelector('.kitchen-bottom-nav').getBoundingClientRect().height,
          ),
        ),
      )
      .toBeLessThan(1);
    await shot('synthetic-safe-area-320', { synthetic: true });
    await page.setViewportSize({ width: 768, height: 420 });
    await go('/shopping');
    const rail = page.locator('.kitchen-sidebar');
    await rail.locator('.kitchen-scan-link').focus();
    await expect(rail.locator('.kitchen-scan-link')).toBeInViewport();
    await shot('rail-short-scan-focus');
    journeys.push({ kind: 'short-tablet-rail-scroll-Scan-focus' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 390, height: 844 });
    await go('/');
    await shot('home-normal-motion');
    const after = await get('/inventory');
    assert.deepEqual(after, before);
    assert.equal(writes.length, writeStart, 'read-only navigation must not submit commands');
    journeys.push({ kind: 'read-only-all-inventory-JSON-equality-zero-writes' });
    const guest = await browser.newContext({
      viewport: { width: 320, height: 844 },
      serviceWorkers: 'block',
    });
    await guest.route(
      (url) => url.origin !== base,
      (route) => route.abort(),
    );
    const publicTab = await guest.newPage();
    await publicTab.goto(`${base}/landing`);
    await expect(publicTab.locator('h1')).toHaveCount(1);
    assert.equal(await publicTab.evaluate(() => document.documentElement.scrollWidth), 320);
    await publicTab.screenshot({ path: resolve(out, 'public-landing-320.png') });
    await guest.close();
    journeys.push({ kind: 'signed-out-public-entry-preserved' });
  } else {
    assert.equal((await get('/meal-planning/plans')).status, 404);
    assert.deepEqual(await get('/inventory'), before);
    assert.equal(writes.length, writeStart);
    journeys.push({ kind: 'flag-off-Week-nav-local-no-inventory-write' });
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${checks.length} snapshots / ${journeys.length} journeys`);
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ base, flag: off ? 'off' : 'on', checks, journeys, errors, writes }, null, 2) +
      '\n',
  );
  await browser.close();
}
