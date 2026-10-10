import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { REVIEW_FIELDS, REVIEW_MAX_DRAFT_BYTES } from './ui13/review-contract.mjs';
const base = process.env.UI_REBUILD_URL ?? 'http://127.0.0.1:5215';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const out = resolve(process.env.UI_REBUILD_OUT ?? '.artifacts/ui13/browser');
await mkdir(out, { recursive: true });
const browser = await chromium.launch(),
  context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'vi-VN',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    acceptDownloads: true,
  });
const errors = [],
  writes = [],
  external = [],
  checks = [],
  journeys = [];
await context.route(
  (url) => url.origin !== base,
  (route) => {
    external.push(route.request().url());
    return route.abort();
  },
);
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(e.message));
page.on('request', (r) => {
  if (!['GET', 'HEAD'].includes(r.method())) writes.push({ url: r.url(), method: r.method() });
});
page.on('dialog', (d) => d.accept());
async function go(query = '') {
  await page.goto(base + '/' + query);
  await expect(page.locator('#recipe-grid article')).toHaveCount(
    query.includes('policy=photo') ? 4 : 24,
  );
  await page.evaluate(() => document.fonts.ready);
}
async function enlarge() {
  await page.evaluate(() => {
    const elements = [...document.querySelectorAll('body *')].filter(
      (el) => !['SCRIPT', 'STYLE'].includes(el.tagName),
    );
    const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
    elements.forEach((el, i) => (el.style.fontSize = `${sizes[i] * 2}px`));
  });
}
async function shot(name, synthetic = false) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    broken: [...document.images]
      .filter((el) => el.complete && !el.naturalWidth)
      .map((el) => el.getAttribute('src')),
    clipped: [...document.querySelectorAll('.badge,.card h3,.field label,.dialog-head h2,button')]
      .filter((el) => {
        const b = el.getBoundingClientRect();
        return (
          b.width &&
          b.height &&
          (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)
        );
      })
      .map((el) => ({
        text: el.textContent.trim().slice(0, 140),
        width: el.clientWidth,
        scrollWidth: el.scrollWidth,
        height: el.clientHeight,
        scrollHeight: el.scrollHeight,
      })),
  }));
  const violations = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  ).violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
  checks.push({ name, synthetic, ...layout, violations });
  await page.screenshot({ path: resolve(out, name + '.png') });
  assert.equal(layout.scrollWidth, layout.width, name);
  assert.deepEqual(layout.broken, [], name);
  assert.deepEqual(layout.clipped, [], name);
  assert.deepEqual(violations, [], name);
  console.log(name, 'PASS');
}
async function open(id = 'gl-05') {
  const button = page.locator(`[data-recipe-id="${id}"] button`);
  await button.click();
  await expect(page.locator('#review-dialog')).toBeVisible();
  return button;
}
async function exportDraft() {
  const download = page.waitForEvent('download');
  await page.locator('#export-draft').click();
  const file = await download;
  return JSON.parse(await readFile(await file.path(), 'utf8'));
}
async function upload(value, name = 'draft.json') {
  await page.locator('#import-file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)),
  });
}
try {
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await go();
    await shot(`board-${width}`);
    await page.locator('#assets-title').scrollIntoViewIfNeeded();
    await shot(`assets-${width}`);
    await open();
    await page.locator('#candidateAssetId').selectOption('asset-02');
    await shot(`dialog-${width}`);
    await page.keyboard.press('Escape');
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await go();
    await enlarge();
    await shot(`board-${width}-text2`, true);
    await open();
    await page.locator('#candidateAssetId').selectOption('asset-02');
    await shot(`dialog-${width}-text2`, true);
    await page.keyboard.press('Escape');
  }
  for (const [width, height, text2] of [
    [390, 420, false],
    [768, 420, false],
    [320, 420, true],
  ]) {
    await page.setViewportSize({ width, height });
    await go();
    if (text2) await enlarge();
    await shot(`board-${width}-${height}${text2 ? '-text2' : ''}`, text2);
    await open();
    await page.locator('#candidateAssetId').selectOption('asset-02');
    await shot(`dialog-${width}-${height}${text2 ? '-text2' : ''}`, text2);
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await go();
  await page.locator('#search').fill('kim chi');
  await expect(page.locator('#recipe-grid article')).toHaveCount(1);
  assert(new URL(page.url()).searchParams.get('q') === 'kim chi');
  await page.locator('#policy').selectOption('photo');
  await expect(page.locator('#recipe-grid article')).toHaveCount(1);
  await page.locator('#search').fill('khong-co-mon-nao');
  await expect(page.locator('#empty')).toBeVisible();
  await page.locator('#empty-reset').click();
  await expect(page.locator('#recipe-grid article')).toHaveCount(24);
  await expect(page.locator('#search')).toBeFocused();
  await page.locator('#policy').selectOption('wrong');
  await expect(page.locator('#recipe-grid article')).toHaveCount(4);
  await page.locator('#reset-filters').click();
  journeys.push('search-no-diacritics-filter-empty-reset-URL');
  const trigger = await open();
  await expect(page.locator('#close-dialog')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#cancel-review')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#close-dialog')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  journeys.push('native-dialog-Tab-trap-Escape-focus-return');
  await page.goto(base + '/?policy=photo&recipe=gl-05');
  await expect(page.locator('#review-dialog')).toBeVisible();
  await expect(page.locator('#dialog-title')).toContainText('kim chi');
  await page.locator('#close-dialog').click();
  await expect(page.locator('#recipe-grid article')).toHaveCount(4);
  journeys.push('recipe-deep-link-keeps-policy');
  await page.locator('#reset-filters').click();
  await open();
  await page.locator('#decision').selectOption('owner_reviewed');
  await page.locator('#save-review').click();
  await expect(page.locator('#form-error')).not.toHaveText('');
  await expect(page.locator('#candidateAssetId')).toBeFocused();
  await page.keyboard.press('Escape');
  const initial = await exportDraft();
  assert.equal(initial.records.find((r) => r.recipeId === 'gl-05').decision, 'pending');
  journeys.push('incomplete-human-claim-does-not-save');
  await open();
  await page.locator('#candidateAssetId').selectOption('asset-02');
  await page.locator('#decision').selectOption('candidate');
  const literal = '<img src=x onerror=alert(1)> Ghi chú thử nghiệm';
  await page.locator('#notes').fill(literal);
  await page.locator('#save-review').click();
  await expect(page.locator('#review-dialog')).not.toBeVisible();
  await expect(page.locator('[data-recipe-id="gl-05"] button')).toBeFocused();
  const candidate = await exportDraft();
  assert.equal(candidate.promotionAuthorized, false);
  assert.equal(candidate.records.find((r) => r.recipeId === 'gl-05').notes, literal);
  journeys.push('candidate-save-export-native-download-full-notes-no-promotion');
  await upload('not-json');
  await expect(page.locator('#feedback')).toContainText('Không nhập');
  assert.deepEqual(await exportDraft(), candidate);
  const cross = structuredClone(candidate);
  cross.datasetId = 'f'.repeat(64);
  await upload(cross);
  await expect(page.locator('#feedback')).toContainText('không thuộc');
  assert.deepEqual(await exportDraft(), candidate);
  const bad = structuredClone(candidate);
  bad.records[0].candidateAssetId = '../../private.jpg';
  await upload(bad);
  await expect(page.locator('#feedback')).toContainText('tám asset');
  assert.deepEqual(await exportDraft(), candidate);
  journeys.push('invalid-JSON-cross-dataset-path-import-atomic');
  await page.reload();
  await expect(page.locator('#recipe-grid article')).toHaveCount(24);
  const reloaded = await exportDraft();
  assert(reloaded.records.every((r) => r.decision === 'pending'));
  await upload(candidate);
  await expect(page.locator('#feedback')).toContainText('Đã nhập đủ');
  await open();
  await expect(page.locator('#notes')).toHaveValue(literal);
  assert.equal(await page.locator('#review-dialog img[src=x]').count(), 0);
  await page.keyboard.press('Escape');
  assert.deepEqual(await exportDraft(), candidate);
  journeys.push('memory-only-reload-import-roundtrip-inert-markup');
  const largeDraft = structuredClone(candidate);
  for (const record of largeDraft.records) {
    for (const field of REVIEW_FIELDS.filter(
      (key) => !['recipeId', 'decision', 'candidateAssetId', 'reviewedAt'].includes(key),
    ))
      record[field] = 'N'.repeat(2000);
  }
  assert(Buffer.byteLength(JSON.stringify(largeDraft)) > 256000);
  await upload(largeDraft);
  await expect(page.locator('#feedback')).toContainText('Đã nhập đủ');
  const largeExport = await exportDraft();
  assert.deepEqual(largeExport, largeDraft);
  await page.reload();
  await expect(page.locator('#recipe-grid article')).toHaveCount(24);
  await upload(largeExport);
  await expect(page.locator('#feedback')).toContainText('Đã nhập đủ');
  assert.deepEqual(await exportDraft(), largeDraft);
  await page.locator('#import-file').setInputFiles({
    name: 'oversized.json',
    mimeType: 'application/json',
    buffer: Buffer.alloc(REVIEW_MAX_DRAFT_BYTES + 1, ' '),
  });
  await expect(page.locator('#feedback')).toContainText('vượt 3 MiB');
  assert.deepEqual(await exportDraft(), largeDraft);
  await upload(candidate);
  await expect(page.locator('#feedback')).toContainText('Đã nhập đủ');
  journeys.push('maximum-length-draft-roundtrip-oversized-import-atomic');
  const claim = structuredClone(candidate),
    record = claim.records.find((r) => r.recipeId === 'gl-05');
  Object.assign(record, {
    decision: 'owner_reviewed',
    creator: 'Synthetic test creator',
    source: 'Synthetic fixture source',
    rights: 'Synthetic fixture permission',
    subjectNotes: 'Fixture subject claim only',
    cropNotes: 'Fixture crop review',
    reviewer: 'Fixture reviewer',
    reviewedAt: '2026-10-11',
  });
  await upload(claim);
  await expect(page.locator('#feedback')).toContainText('chưa cấp quyền');
  const claimed = await exportDraft();
  assert.equal(claimed.promotionAuthorized, false);
  await page.locator('#decision-filter').selectOption('owner_reviewed');
  await expect(page.locator('#recipe-grid article')).toHaveCount(1);
  await shot('synthetic-human-claim', true);
  journeys.push('complete-human-claim-structural-only-no-promotion');
  assert.equal((await context.request.get(base + '/.env')).status(), 404);
  assert.equal((await context.request.get(base + '/api/v1/inventory')).status(), 404);
  assert.equal((await context.request.post(base + '/')).status(), 405);
  journeys.push('server-allowlist-read-only-no-domain-route');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await go();
  await shot('board-normal-motion');
  journeys.push('normal-and-reduced-motion');
  assert.deepEqual(errors, []);
  assert.deepEqual(writes, []);
  assert.deepEqual(external, []);
  console.log(
    `PASS ${checks.length} snapshots / ${journeys.length} journeys; no browser writes/external requests/pageerrors`,
  );
} finally {
  await writeFile(
    resolve(out, 'checks.json'),
    JSON.stringify(
      {
        checks,
        journeys,
        errors,
        writes,
        external,
        limits: [
          'synthetic local browser data and human-claim fixture; no catalog promotion or licensing approval',
          'computed font enlargement is not native zoom/device certification',
          'server POST405 probe is an intentional rejected test request, separately from browser writes',
        ],
      },
      null,
      2,
    ) + '\n',
  );
  await browser.close();
}
