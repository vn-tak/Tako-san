import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5216';
assert.equal(new URL(base).hostname, '127.0.0.1');
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui14/baseline');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const result = {
  browser: browser.version(),
  stage: process.env.UI14_STAGE ?? 'baseline',
  environment: {
    productionBuild: true,
    isolatedSyntheticWorker: true,
    externalHtmlRemoved: true,
    gzip: 'preview text assets only; local policy is not hosted compression evidence',
    cache: 'CDP enabled, no browser request routing; warm is same-context same-route reload',
    viewport: { width: 390, height: 844 },
    cpuRate: 4,
    network: { latencyMs: 60, downloadBytesPerSecond: 200000, uploadBytesPerSecond: 96000 },
    observations:
      'document metrics are local lab observations, not field CWV/INP; SPA ready is measured independently',
  },
  fixtureBootstrap:
    'Each context uses real local cookie login and PATCH completeOnboarding before measurement; excluded from domain-write counters',
  samples: [],
  transitions: [],
  errors: [],
  domainWrites: [],
  external: [],
};
const routes = [
  ['home', '/', '.home-workspace'],
  ['discovery', '/recipes', '.discovery-grid > a'],
  ['detail', '/recipes/kimchi-fried-rice', '.recipe-overview'],
];
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
async function observe(context) {
  const page = await context.newPage();
  page.on('pageerror', (error) => result.errors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== base)
      result.external.push(request.url());
    if (url.pathname.startsWith('/api/') && !['GET', 'HEAD'].includes(request.method()))
      result.domainWrites.push({ path: url.pathname, method: request.method() });
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
  await cdp.send('Network.setBlockedURLs', { urls: ['https://*'] });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 60,
    downloadThroughput: 200000,
    uploadThroughput: 96000,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const network = [];
  cdp.on('Network.responseReceived', (event) =>
    network.push({
      url: event.response.url,
      status: event.response.status,
      fromDiskCache: event.response.fromDiskCache,
      fromServiceWorker: event.response.fromServiceWorker,
      mimeType: event.response.mimeType,
      encodedDataLength: event.response.encodedDataLength,
    }),
  );
  return { page, cdp, network };
}
async function ready(page, name, selector) {
  await expect(page.locator(selector).first()).toBeVisible();
  if (name === 'home') await expect(page.locator('.kitchen-recipe-card').first()).toBeVisible();
  await expect(page.locator('#kitchen-main h1')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.images]
      .filter((image) => {
        const box = image.getBoundingClientRect();
        return box.width && box.height && box.top < innerHeight && box.bottom > 0;
      })
      .every((image) => image.complete),
  );
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
async function snapshot(page) {
  return page.evaluate(() => {
    const entries = performance
      .getEntriesByType('resource')
      .filter((entry) => new URL(entry.name).origin === location.origin);
    const resource = entries.map((entry) => ({
      path: new URL(entry.name).pathname,
      initiator: entry.initiatorType,
      start: entry.startTime,
      duration: entry.duration,
      transfer: entry.transferSize,
      encoded: entry.encodedBodySize,
      decoded: entry.decodedBodySize,
    }));
    const navigation = performance.getEntriesByType('navigation')[0];
    const seen = new Map();
    for (const r of resource) seen.set(r.path, r);
    return {
      readyMs: performance.now(),
      navigation: navigation
        ? {
            domContentLoaded: navigation.domContentLoadedEventEnd,
            load: navigation.loadEventEnd,
            transfer: navigation.transferSize,
          }
        : null,
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      lcp: window.__ui14.lcp.at(-1) ?? null,
      cls: window.__ui14.shifts.filter((s) => !s.recentInput).reduce((sum, s) => sum + s.value, 0),
      shifts: window.__ui14.shifts,
      longTasks: window.__ui14.longTasks,
      events: window.__ui14.events,
      resources: resource,
      requests: resource.length,
      uniqueRequests: seen.size,
      transfer: resource.reduce((sum, r) => sum + r.transfer, 0),
      encoded: resource.reduce((sum, r) => sum + r.encoded, 0),
      jsTransfer: resource
        .filter((r) => r.path.endsWith('.js'))
        .reduce((sum, r) => sum + r.transfer, 0),
      fontRequests: resource.filter((r) => r.path.endsWith('.woff2')),
      imageRequests: resource.filter((r) => /\.(svg|png|webp|jpg)$/.test(r.path)),
      motion: {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        active: document
          .getAnimations()
          .map((a) => ({ playState: a.playState, duration: a.effect?.getTiming().duration })),
      },
    };
  });
}
try {
  for (let run = 1; run <= Number(process.env.UI14_RUNS ?? 3); run++) {
    for (const [name, path, selector] of routes) {
      const context = await browser.newContext({
        viewport: result.environment.viewport,
        locale: 'vi-VN',
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      });
      const before = await prepare(context);
      const { page, network } = await observe(context);
      for (const cache of ['cold', 'warm']) {
        network.length = 0;
        await page.goto(base + path);
        await ready(page, name, selector);
        const sample = { run, name, path, cache, ...(await snapshot(page)), network: [...network] };
        result.samples.push(sample);
        assert(sample.imageRequests.every((r) => r.path.startsWith('/')));
        console.log(
          run,
          name,
          cache,
          'ready',
          sample.readyMs.toFixed(0),
          'ms; JS transfer',
          sample.jsTransfer,
          'bytes; CLS',
          sample.cls.toFixed(4),
        );
      }
      assert.deepEqual(
        await page.evaluate(async () => (await fetch('/api/v1/inventory')).json()),
        before,
      );
      await context.close();
    }
  }
  const context = await browser.newContext({
    viewport: result.environment.viewport,
    locale: 'vi-VN',
    reducedMotion: 'no-preference',
    serviceWorkers: 'block',
  });
  const before = await prepare(context);
  const { page } = await observe(context);
  await page.goto(base);
  await ready(page, 'home', '.home-workspace');
  const start = await page.evaluate(() => performance.now());
  await page.locator('nav[aria-label="Điều hướng chính"]:visible a[href="/recipes"]').click();
  await ready(page, 'discovery', '.discovery-grid > a');
  result.transitions.push({
    from: 'home',
    to: 'discovery',
    transitionMs: await page.evaluate((start) => performance.now() - start, start),
    ...(await snapshot(page)),
  });
  const detail = page
    .locator('.discovery-grid > a')
    .filter({ has: page.locator('[data-recipe-media=photo]') })
    .first();
  const href = await detail.getAttribute('href');
  assert(href);
  const detailStart = await page.evaluate(() => performance.now());
  await detail.click();
  await ready(page, 'detail', '.recipe-overview');
  result.transitions.push({
    from: 'discovery',
    to: href,
    transitionMs: await page.evaluate((start) => performance.now() - start, detailStart),
    ...(await snapshot(page)),
  });
  await page.screenshot({ path: resolve(out, 'detail-390.png') });
  assert.deepEqual(
    await page.evaluate(async () => (await fetch('/api/v1/inventory')).json()),
    before,
  );
  await context.close();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.domainWrites, []);
  assert.deepEqual(result.external, []);
  console.log(
    'PASS local production-build performance journeys; inventory unchanged; measured domain writes zero',
  );
} finally {
  await writeFile(resolve(out, 'performance.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
}
