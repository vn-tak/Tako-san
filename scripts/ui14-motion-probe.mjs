import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5219';
assert.equal(new URL(base).hostname, '127.0.0.1');
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui14/motion-baseline');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const checks = [];
try {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion,
      serviceWorkers: 'block',
    });
    const page = await context.newPage();
    await page.goto(base);
    await expect(page.locator('[data-fixture-path]')).toHaveText('/recipes');
    await page.locator('nav[aria-label="Điều hướng chính"]:visible a[href="/"]').click();
    await expect(page.locator('[data-fixture-path]')).toHaveText('/');
    await page.evaluate(async () => {
      for (let i = 0; i < 24; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    const frames = await page.evaluate(async () => {
      document.querySelector('nav.sm\\:hidden a[href="/recipes"]').click();
      const samples = [];
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
    if (reducedMotion === 'reduce')
      assert(
        frames
          .slice(2)
          .flat()
          .every((t) => t === 'none'),
      );
    else assert(frames.flat().filter((t) => t !== 'none').length > 1);
    checks.push({
      reducedMotion,
      frames,
      firstFrameTransforms: frames[0].filter((t) => t !== 'none'),
      settledBySecondFrame: frames
        .slice(2)
        .flat()
        .every((t) => t === 'none'),
    });
    await context.close();
  }
  console.log('PASS pinned baseline legacy normal/reduced frame probe');
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify({ base, browser: browser.version(), checks }, null, 2) + '\n',
  );
  await browser.close();
}
