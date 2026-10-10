import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5217';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));

const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui14/browser');
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
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((a) => a.effect?.getTiming().iterations !== Infinity);
    await Promise.all(finite.map((a) => a.finished.catch(() => {})));
  });
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
async function prepare(context) {
  const bootstrap = await context.newPage();
  await bootstrap.goto(base + '/__preview');
  await bootstrap
    .getByRole('button', { name: 'Đăng nhập tài khoản thử nghiệm', exact: true })
    .click();
  await bootstrap.waitForURL(base + '/__preview/ready');
  const setup = await bootstrap.evaluate(async () => {
    const me = await fetch('/api/v1/me');
    const data = await me.json();
    if (!me.ok) throw new Error('Fixture browser session not verified');
    const user = data.user;
    const complete = await fetch('/api/v1/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Frigo-Expected-User-Id': user.id,
        'X-Frigo-Expected-Household-Id': user.household.id,
      },
      body: JSON.stringify({
        completeOnboarding: true,
        householdSize: 2,
        spicyLevel: 'medium',
        favoriteCuisines: [],
        dietaryRestrictions: [],
      }),
    });
    if (!complete.ok) throw new Error('Fixture preference bootstrap failed');
    const inventory = await fetch('/api/v1/inventory');
    if (!inventory.ok) throw new Error('Fixture inventory read failed');
    return { user, inventory: await inventory.json() };
  });
  const { user } = setup;
  assert(user.id && user.household.id && !user.isGuest);
  await bootstrap.close();
  await context.addInitScript((user) => {
    localStorage.setItem('frigo_user_id', user.id);
    localStorage.setItem('frigo_household_id', user.household.id);
    localStorage.setItem('frigo_email', user.email);
    localStorage.setItem('frigo_display_name', user.displayName);
    localStorage.setItem('frigo_is_guest', 'false');
    localStorage.setItem('frigo_onboarded', 'true');
    window.__ui14 = { shifts: [], longTasks: [], lcp: [], events: [] };
    for (const type of ['layout-shift', 'longtask', 'largest-contentful-paint', 'event']) {
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (type === 'layout-shift')
              window.__ui14.shifts.push({
                start: entry.startTime,
                value: entry.value,
                recentInput: entry.hadRecentInput,
                sources: entry.sources.map((s) => ({
                  tag: s.node?.tagName,
                  className: String(s.node?.className ?? '').slice(0, 120),
                })),
              });
            if (type === 'longtask')
              window.__ui14.longTasks.push({ start: entry.startTime, duration: entry.duration });
            if (type === 'largest-contentful-paint')
              window.__ui14.lcp.push({
                start: entry.startTime,
                size: entry.size,
                tag: entry.element?.tagName,
                className: String(entry.element?.className ?? '').slice(0, 120),
              });
            if (type === 'event')
              window.__ui14.events.push({
                name: entry.name,
                start: entry.startTime,
                duration: entry.duration,
                interactionId: entry.interactionId,
              });
          }
        }).observe({
          type,
          buffered: true,
          ...(type === 'event' ? { durationThreshold: 16 } : {}),
        });
      } catch {
        /* Browser may not support every lab entry type. */
      }
    }
  }, user);
  return setup.inventory;
}
try {
  const before = await prepare(context);
  const writeStart = writes.length;
  const routes = [
    ['home', '/'],
    ['discovery', '/recipes'],
    ['detail', '/recipes/kimchi-fried-rice'],
  ];
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [name, path] of routes) {
      await go(path);
      if (name === 'home') await page.locator('.kitchen-recipe-card').first().waitFor();
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
    for (const [name, path] of routes) {
      await go(path);
      if (name === 'home') await page.locator('.kitchen-recipe-card').first().waitFor();
      if (text) await enlarge();
      await shot(`${name}-${width}-${height}${text ? '-text2' : ''}`, { synthetic: text });
    }
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const label of ['Cách nấu', 'Nguyên liệu', 'Dinh dưỡng']) {
      await go('/recipes/kimchi-fried-rice');
      await page.getByRole('tab', { name: label, exact: true }).click();
      await enlarge();
      await shot(`panel-${label}-${width}-text2`, { synthetic: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/fridge', '/week', '/shopping', '/me', '/settings/app']) {
    await go(path);
    await shot(`family-${path.replaceAll('/', '-')}`);
  }
  await go('/recipes/kimchi-fried-rice');
  await page.getByRole('tab', { name: 'Cách nấu', exact: true }).focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Dinh dưỡng', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Cách nấu', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Nguyên liệu', exact: true })).toBeFocused();
  await checkFocus('#recipe-detail-tab-ingredients', 'tabs-clear-chrome');
  journeys.push({ kind: 'recipe-tabs-Home-End-arrow' });
  await go('/');
  const nav = page.locator('.kitchen-bottom-nav');
  await nav.locator('a').first().focus();
  for (let i = 1; i < 5; i++) {
    await page.keyboard.press('Tab');
    await expect(nav.locator('a').nth(i)).toBeFocused();
  }
  await page.keyboard.press('Enter');
  await page.waitForURL(base + '/me');
  journeys.push({ kind: 'five-roots-native-keyboard' });
  await go('/recipes');
  await page.locator('#recipe-search').fill('kim chi');
  await expect(page.locator('.discovery-grid > a')).toHaveCount(1);
  const card = page.locator('.discovery-grid > a').first();
  const href = await card.getAttribute('href');
  assert(href?.includes('kimchi'));
  await card.focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(base + href);
  await page.locator('.recipe-overview').waitFor();
  await page.goBack();
  await expect(page.locator('#recipe-search')).toHaveValue('kim chi');
  await page.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc', exact: true }).click();
  await expect(page.locator('.discovery-grid > a')).toHaveCount(24);
  journeys.push({ kind: 'filter-native-link-Enter-back-reset' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [name, path] of routes) {
    await go(path);
    await shot(`${name}-normal-motion-390`);
  }
  const resources = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((r) => new URL(r.name).pathname),
  );
  assert(
    !resources.some((p) => /\/(react|motion|legacy-nav-indicator)-/.test(p)),
    'Kitchen requested optional motion engine',
  );
  journeys.push({ kind: 'kitchen-engine-not-requested', resources });
  assert.deepEqual((await get('/inventory')).data, before);
  assert.deepEqual(writes.slice(writeStart), []);
  assert.deepEqual(errors, []);
  console.log(
    `PASS UI14 ${checks.length} snapshots / ${journeys.length} journey checks; read-only inventory unchanged`,
  );
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ checks, journeys, errors, writes, bootstrapWritesExcluded: true }, null, 2) +
      '\n',
  );
  await browser.close();
}
