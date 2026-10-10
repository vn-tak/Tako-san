import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const BRAND_COLORS = { coral: '#EE705E', pine: '#245D49', ink: '#202C28', canvas: '#F7F3EC' };
export const ICON_SIZES = [16, 24, 32, 48, 64, 128, 180, 192, 256, 512];
const inner = (svg) => svg.replace(/^<svg[^>]+>/, '').replace(/<\/svg>\s*$/, '');
const svg = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>\n`;

/** Reads committed vector masters; never downloads a kit or relies on system fonts. */
export async function generateBrand(out = resolve(root, 'public/takosan/rebuild')) {
  await mkdir(resolve(out, 'app-icons'), { recursive: true });
  const master = async (name) => readFile(resolve(root, 'public/takosan/rebuild/masters', `${name}.svg`), 'utf8');
  const [symbol, micro, word, motto, tagline] = await Promise.all(
    ['symbol', 'symbol-micro', 'wordmark', 'motto', 'tagline'].map(master),
  );
  const monoSymbol = (source, color) => {
    // Cut out the eyes from the silhouette so the one-color mark needs no second ink.
    const silhouette = source.match(/<path d="([^"]+)"/)[1];
    const eyes = source.includes('kitchen-micro')
      ? 'M20.8 30a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0M36.8 30a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0'
      : 'M22.5 30a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M36.5 30a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0';
    return `<path fill="${color}" fill-rule="evenodd" d="${silhouette}${eyes}"/>`;
  };
  const variants = {
    '': { mark: inner(symbol), micro: inner(micro), word: inner(word) },
    '-reverse': { mark: inner(symbol), micro: inner(micro), word: inner(word).replaceAll(BRAND_COLORS.ink, BRAND_COLORS.canvas) },
    '-mono': { mark: monoSymbol(symbol, BRAND_COLORS.pine), micro: monoSymbol(micro, BRAND_COLORS.pine), word: inner(word).replaceAll(BRAND_COLORS.ink, BRAND_COLORS.pine) },
    '-mono-reverse': { mark: monoSymbol(symbol, BRAND_COLORS.canvas), micro: monoSymbol(micro, BRAND_COLORS.canvas), word: inner(word).replaceAll(BRAND_COLORS.ink, BRAND_COLORS.canvas) },
  };
  const outputs = {};
  for (const [suffix, v] of Object.entries(variants)) {
    outputs[`symbol${suffix}.svg`] = svg(64, 64, v.mark);
    outputs[`symbol-micro${suffix}.svg`] = svg(64, 64, v.micro);
    outputs[`wordmark${suffix}.svg`] = svg(208, 48, v.word);
    outputs[`lockup${suffix}.svg`] = svg(300, 72,
      `<g transform="translate(0 4)">${v.mark}</g><g transform="translate(82 12)">${v.word}</g>`);
    outputs[`stacked${suffix}.svg`] = svg(240, 176,
      `<g transform="translate(64 0) scale(1.75)">${v.mark}</g><g transform="translate(16 120)">${v.word}</g>`);
  }
  outputs['app-icons/favicon.svg'] = svg(64, 64, inner(micro));
  outputs['app-icons/icon-master.svg'] = svg(512, 512,
    `<rect width="512" height="512" fill="${BRAND_COLORS.canvas}"/><g transform="translate(48 48) scale(6.5)">${inner(symbol)}</g>`);
  outputs['app-icons/maskable-master.svg'] = svg(512, 512,
    `<rect width="512" height="512" fill="${BRAND_COLORS.canvas}"/><g transform="translate(64 64) scale(6)">${inner(symbol)}</g>`);
  outputs['og.svg'] = svg(1200, 630,
    `<rect width="1200" height="630" fill="${BRAND_COLORS.canvas}"/>`
    + `<path d="M784 0H1200V630H984C866 568 772 475 772 336C772 225 839 126 784 0Z" fill="#E9F1EA"/>`
    + `<g transform="translate(72 60) scale(1.4)">${inner(outputs['lockup.svg'])}</g>`
    + `<g transform="translate(72 235)">${inner(motto)}</g>`
    + `<g transform="translate(826 190) scale(4.5)">${inner(symbol)}</g>`
    + `<g transform="translate(72 544)">${inner(tagline)}</g>`);
  for (const [name, content] of Object.entries(outputs)) await writeFile(resolve(out, name), content);
  const png = { compressionLevel: 9, adaptiveFiltering: false, palette: false };
  for (const size of ICON_SIZES) {
    const source = size < 32
      ? svg(64, 64, `<rect width="64" height="64" fill="${BRAND_COLORS.canvas}"/>${inner(micro)}`)
      : outputs['app-icons/icon-master.svg'];
    await sharp(Buffer.from(source)).resize(size, size).flatten({ background: BRAND_COLORS.canvas })
      .png(png).toFile(resolve(out, `app-icons/icon-${size}.png`));
  }
  await sharp(Buffer.from(outputs['app-icons/maskable-master.svg']))
    .flatten({ background: BRAND_COLORS.canvas }).png(png).toFile(resolve(out, 'app-icons/icon-maskable-512.png'));
  await sharp(Buffer.from(outputs['og.svg']))
    .flatten({ background: BRAND_COLORS.canvas }).png(png).toFile(resolve(out, 'og.png'));
  return [...Object.keys(outputs), ...ICON_SIZES.map((size) => `app-icons/icon-${size}.png`), 'app-icons/icon-maskable-512.png', 'og.png'];
}
