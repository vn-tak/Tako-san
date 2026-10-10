import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5218';
assert.equal(new URL(base).hostname, '127.0.0.1');
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui14/legacy');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const checks = [],
  errors = [];
try {
  for (const reduced of ['no-preference', 'reduce']) {
    for (const mode of ['delayed', 'failed']) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: reduced,
        serviceWorkers: 'block',
      });
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(e.message));
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const chunks = [];
      await context.route(/legacy-nav-indicator-.*\.js$/, async (route) => {
        chunks.push(route.request().url());
        if (mode === 'failed') await route.abort('failed');
        else {
          await gate;
          await route.continue();
        }
      });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-fixture-path]')).toHaveText('/recipes');
      await expect(page.locator('[data-fixture-policy]')).toHaveText('user');
      const nav = page.locator('nav[aria-label="Điều hướng chính"]:visible');
      const highlight = nav.locator('a[aria-current=page] span.absolute.bg-semantic-success-soft');
      await expect(highlight).toBeVisible();
      assert.equal(await highlight.getAttribute('aria-hidden'), 'true');
      const background = await highlight.evaluate((el) => getComputedStyle(el).backgroundColor);
      assert.notEqual(background, 'rgba(0, 0, 0, 0)');
      await nav.locator('a[href="/"]').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-fixture-path]')).toHaveText('/');
      await expect(nav.locator('a[href="/"]')).toHaveAttribute('aria-current', 'page');
      await expect.poll(() => chunks.length).toBe(1);
      if (mode === 'delayed') {
        const response = page.waitForResponse(
          (r) => r.url().includes('/legacy-nav-indicator-') && r.ok(),
        );
        release();
        await response;
        // A second native link transition exercises the loaded shared-layout indicator.
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      }
      const frames = await page.evaluate(async () => {
        const samples = [];
        document.querySelector('nav.sm\\:hidden a[href="/recipes"]').click();
        for (let i = 0; i < 24; i++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          samples.push(
            [...document.querySelectorAll('span.absolute.bg-semantic-success-soft')].map(
              (el) => el.style.transform || 'none',
            ),
          );
        }
        return samples;
      });
      await expect(page.locator('[data-fixture-path]')).toHaveText('/recipes');
      const transforms = frames.flat().filter((t) => t !== 'none');
      if (reduced === 'no-preference' && mode === 'delayed')
        assert(transforms.length > 1, 'Loaded normal-motion indicator should animate');
      if (reduced === 'reduce')
        assert(
          frames
            .slice(2)
            .flat()
            .every((t) => t === 'none'),
          'Reduced motion must settle layout transforms by the second frame',
        );
      assert.equal(chunks.length, 1, 'Shared/rejected optional request must not loop');
      await page.screenshot({ path: resolve(out, `${mode}-${reduced}.png`) });
      checks.push({
        mode,
        reduced,
        chunks,
        background,
        transforms,
        frames,
        linksWorkWhilePendingOrFailed: true,
        policy: 'user',
      });
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS four isolated actual legacy component journeys: pending/failure, native keyboard, shared request, normal/reduced policy',
  );
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify(
      {
        browser: browser.version(),
        isolatedComponentFixture: true,
        applicationPaymentAuthRoutesExercised: false,
        checks,
        errors,
      },
      null,
      2,
    ) + '\n',
  );
  await browser.close();
}
