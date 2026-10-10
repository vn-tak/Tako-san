import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { generateBrand, ICON_SIZES, BRAND_COLORS } from '../../scripts/generate-takosan-brand.mjs';

const root = resolve(import.meta.dirname, '../..');
const committed = resolve(root, 'public/takosan/rebuild');
const publicFile = (path) => resolve(root, 'public', path.replace(/^\//, ''));

describe('UI07 reproducible digital brand', () => {
  it('regenerates every committed export byte-identically without external kit/fonts', async () => {
    const out = await mkdtemp(resolve(tmpdir(), 'takosan-ui07-'));
    const names = await generateBrand(out);
    expect(names.length).toBe(36);
    for (const name of names) {
      expect(await readFile(resolve(out, name)), name).toEqual(await readFile(resolve(committed, name)));
    }
  });

  it('exports expected opaque PNG dimensions, including separate optical micro', async () => {
    for (const size of ICON_SIZES) {
      const meta = await sharp(resolve(committed, `app-icons/icon-${size}.png`)).metadata();
      expect([meta.width, meta.height, meta.hasAlpha], String(size)).toEqual([size, size, false]);
    }
    const og = await sharp(resolve(committed, 'og.png')).metadata();
    expect([og.width, og.height, og.hasAlpha]).toEqual([1200, 630, false]);
    const micro = await readFile(resolve(committed, 'symbol-micro.svg'), 'utf8');
    const standard = await readFile(resolve(committed, 'symbol.svg'), 'utf8');
    expect(micro).not.toContain('stroke=');
    expect(micro).toContain('r="3.2"');
    expect(standard).toContain('stroke-linecap="round"');
  });

  it('keeps every foreground pixel inside the maskable 80% safe circle, with an opaque full-bleed background', async () => {
    const path = resolve(committed, 'app-icons/icon-maskable-512.png');
    const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
    expect([info.width, info.height, info.channels]).toEqual([512, 512, 3]);
    const background = [247, 243, 236];
    let foreground = 0, maxRadius = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const offset = (y * info.width + x) * 3;
      const painted = background.some((color, channel) => Math.abs(data[offset + channel] - color) > 3);
      if (painted) {
        foreground++;
        maxRadius = Math.max(maxRadius, Math.hypot(x + 0.5 - 256, y + 0.5 - 256));
      }
    }
    expect(foreground).toBeGreaterThan(10000);
    expect(maxRadius).toBeLessThanOrEqual(204.8);
    for (const offset of [0, (512 * 512 - 1) * 3]) expect([...data.slice(offset, offset + 3)]).toEqual(background);
  });

  it('has no external/font/script SVG dependencies; monochrome variants use knockout eyes', async () => {
    const vectors = ['lockup', 'wordmark', 'stacked', 'symbol', 'symbol-micro'];
    for (const name of vectors) for (const suffix of ['', '-reverse', '-mono', '-mono-reverse']) {
      const content = await readFile(resolve(committed, `${name}${suffix}.svg`), 'utf8');
      expect(content).not.toMatch(/<(text|image|script|foreignObject)|href=|url\(/i);
      expect(content).toMatch(/width="[\d.]+" height="[\d.]+" viewBox=/);
      const colors = [...content.matchAll(/(?:fill|stroke)="(#[a-f\d]{6})"/ig)].map((m) => m[1]);
      if (suffix.includes('mono')) {
        expect(new Set(colors)).toEqual(new Set([suffix.endsWith('reverse') ? BRAND_COLORS.canvas : BRAND_COLORS.pine]));
        if (name !== 'wordmark') expect(content).toContain('fill-rule="evenodd"');
      }
    }
  });

  it('manifest, browser links and precache resolve while keeping legacy compatibility assets', async () => {
    const manifest = JSON.parse(await readFile(resolve(root, 'public/manifest.json'), 'utf8'));
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith('/takosan/rebuild/app-icons/')).toBe(true);
      const meta = await sharp(publicFile(icon.src)).metadata();
      expect(icon.sizes).toBe(`${meta.width}x${meta.height}`);
    }
    const html = await readFile(resolve(root, 'index.html'), 'utf8');
    expect(html).toContain('https://frigo.tungjpstore.net/takosan/rebuild/og.png');
    expect(html).toContain('og:image:alt');
    const sw = await readFile(resolve(root, 'public/sw.js'), 'utf8');
    for (const name of ['lockup.svg', 'symbol.svg', 'app-icons/favicon.svg', 'app-icons/icon-192.png', 'app-icons/icon-512.png']) {
      expect(sw).toContain(`/takosan/rebuild/${name}`);
    }
    for (const path of ['/takosan/brand/takosan-logo-horizontal-primary.svg', '/takosan/brand/takosan-og.png', '/takosan/app-icons/icon-512.png', '/takosan/mascot/takosan-fridge.svg', '/frigo/brand/wordmark.png']) {
      expect((await readFile(publicFile(path))).length).toBeGreaterThan(0);
    }
  });
});
