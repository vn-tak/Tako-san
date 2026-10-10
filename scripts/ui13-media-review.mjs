import { createHash } from 'node:crypto';
import { createServer as httpServer } from 'node:http';
import { readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import {
  createReviewDraft,
  validateReviewDataset,
  validateReviewDraft,
} from './ui13/review-contract.mjs';
const repo = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(repo, 'docs/ui-rebuild/round-13');
const base = '5da802735c318c56505bed85a133b049728afb39';
const paths = {
  plan: 'docs/ui-rebuild/round-12/evidence/media-plan.json',
  mapping: 'docs/ui-rebuild/round-12/evidence/media-mapping.json',
  demand: 'docs/ui-rebuild/round-12/evidence/route-audit-recovered/recipe-demand.json',
};
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const read = (path) => readFile(resolve(repo, path));
const command = process.argv[2] ?? 'check';
const [planBytes, mappingBytes, demandBytes] = await Promise.all(Object.values(paths).map(read));
const plan = JSON.parse(planBytes),
  mapping = JSON.parse(mappingBytes),
  demand = JSON.parse(demandBytes).data;

async function buildDataset() {
  const vite = await createServer({
    root: repo,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { resolveRecipeImage } = await vite.ssrLoadModule('/src/web/lib/recipe-media.ts');
    const { ALL_RECIPES } = await vite.ssrLoadModule('/packages/recipes/src/data.ts');
    const assets = plan.localAssets.map((asset, index) => ({
      assetId: `asset-${String(index + 1).padStart(2, '0')}`,
      url: asset.url,
      ...asset.local,
      rightsStatus: 'unknown',
      creator: null,
      sourceEvidence: null,
      licenseEvidence: null,
      label: {
        'delicious-meal.png': 'Minh họa chung',
        'kimchi-fried-rice.webp': 'Cơm chiên kim chi',
        'mapo-tofu.webp': 'Đậu phụ Mapo',
        'oyakodon.webp': 'Cơm gà trứng Oyakodon',
        'pad-krapow.webp': 'Thịt băm xào lá quế',
        'pasta-pomodoro.webp': 'Mì sốt cà chua Pomodoro',
        'tomato-egg-stir-fry.webp': 'Cà chua xào trứng',
        'dau-phu-sot-ca-chua.webp': 'Đậu phụ sốt cà chua',
      }[asset.url.split('/').at(-1)],
      staticRecipeIds: asset.staticRecipeIds,
    }));
    const recipes = plan.priorityRecipes.map((priority) => {
      const recipe = demand.items.find((item) => item.recipe.id === priority.recipeId)?.recipe;
      const current = ALL_RECIPES.find((item) => item.id === priority.recipeId);
      if (
        !recipe ||
        !current ||
        current.title !== recipe.title ||
        current.slug !== recipe.slug ||
        current.imageUrl !== recipe.imageUrl
      )
        throw new Error(`Pinned demand no longer matches static recipe ${priority.recipeId}`);
      const image = resolveRecipeImage(recipe);
      const asset = assets.find((asset) => asset.url === image.src);
      if (image.source !== 'placeholder' && (!asset || image.source !== 'legacy_static'))
        throw new Error('Unexpected non-local resolver output');
      return {
        ...priority,
        description: recipe.description,
        subjectBrief: `Brief tham khảo từ tên và mô tả, cần đối chiếu công thức gốc. Chụp đúng món “${recipe.title}”. Chi tiết cần đối chiếu: ${recipe.description} Không thay bằng món có nguyên liệu hoặc cách nấu khác.`,
        legacyUrl: recipe.imageUrl,
        current: { source: image.source, assetId: asset?.assetId ?? null, url: asset?.url ?? null },
      };
    });
    const sources = Object.entries(paths).map(([kind, path], index) => ({
      kind,
      path,
      sha256: sha([planBytes, mappingBytes, demandBytes][index]),
    }));
    const raw = {
      schemaVersion: 1,
      base,
      observation:
        'UI12 local discovery snapshot, rechecked against current static catalog/resolver; not production analytics',
      promotionAuthorized: false,
      sources,
      catalogSummary: mapping.summary,
      recipes,
      assets,
    };
    return { ...raw, datasetId: sha(JSON.stringify(raw)) };
  } finally {
    await vite.close();
  }
}
async function verifyFiles(dataset) {
  const issues = validateReviewDataset(dataset);
  if (issues.length) throw new Error(issues.join('\n'));
  for (const asset of dataset.assets) {
    const path = await realpath(resolve(repo, asset.path));
    if (!path.startsWith((await realpath(resolve(repo, 'public'))) + '/'))
      throw new Error('Asset escaped public root');
    const bytes = await readFile(path);
    if (bytes.length !== asset.bytes || sha(bytes) !== asset.sha256)
      throw new Error(`Asset hash changed: ${asset.path}`);
  }
}
async function html(dataset) {
  const [template, fonts, client, contract] = await Promise.all([
    read('scripts/ui13/board.html'),
    read('src/web/styles/kitchen-fonts.css'),
    read('scripts/ui13/board-client.mjs'),
    read('scripts/ui13/review-contract.mjs'),
  ]);
  const script = contract.toString().replace(/^export /gm, '') + '\n' + client.toString();
  const data = JSON.stringify(dataset)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
  return template
    .toString()
    .replace('/*__FONTS_CSS__*/', fonts.toString().replaceAll('url(/', 'url(../../../public/'))
    .replace('"__REVIEW_DATA__"', data)
    .replace('__REVIEW_SCRIPT__', script);
}
if (command === 'build' || command === 'check') {
  const dataset = await buildDataset();
  await verifyFiles(dataset);
  const outputs = {
    'review-data.json': JSON.stringify(dataset, null, 2) + '\n',
    'review-draft.json': JSON.stringify(createReviewDraft(dataset), null, 2) + '\n',
    'media-review.html': await html(dataset),
  };
  for (const [name, content] of Object.entries(outputs)) {
    if (command === 'build') await writeFile(resolve(output, name), content);
    else if ((await readFile(resolve(output, name), 'utf8')) !== content)
      throw new Error(`Generated file drift: ${name}`);
  }
  console.log(
    `PASS ${command}: ${dataset.recipes.length} recipes / ${dataset.assets.length} byte-verified originals / ${dataset.recipes.filter((r) => r.current.assetId).length} permitted current photos; dataset ${dataset.datasetId}`,
  );
} else if (command === 'validate') {
  const dataset = JSON.parse(await readFile(resolve(output, 'review-data.json'), 'utf8'));
  await verifyFiles(dataset);
  const draft = JSON.parse(
    await readFile(resolve(process.argv[3] ?? resolve(output, 'review-draft.json')), 'utf8'),
  );
  const issues = validateReviewDraft(draft, dataset);
  if (issues.length) throw new Error(JSON.stringify(issues, null, 2));
  console.log(
    'PASS complete review draft; evidence fields are human claims, not verified licensing or promotion permission',
  );
} else if (command === 'serve') {
  const dataset = JSON.parse(await readFile(resolve(output, 'review-data.json'), 'utf8'));
  await verifyFiles(dataset);
  const board = await readFile(resolve(output, 'media-review.html'));
  const script = /<script id="review-code">([\s\S]*?)<\/script>/.exec(board.toString())[1];
  const allowed = new Map([['/', { bytes: board, type: 'text/html; charset=utf-8' }]]);
  for (const name of ['review-data.json', 'review-draft.json'])
    allowed.set('/' + name, {
      bytes: await readFile(resolve(output, name)),
      type: 'application/json',
    });
  const fonts = (await read('src/web/styles/kitchen-fonts.css'))
    .toString()
    .matchAll(/url\((\/[^)]+)\)/g);
  const publicUrls = [
    '/takosan/rebuild/lockup.svg',
    ...dataset.assets.map((asset) => asset.url),
    ...[...fonts].map((match) => match[1]),
  ];
  for (const url of publicUrls)
    allowed.set('/public' + url, {
      bytes: await read('public' + url),
      type: url.endsWith('.woff2')
        ? 'font/woff2'
        : url.endsWith('.svg')
          ? 'image/svg+xml'
          : url.endsWith('.png')
            ? 'image/png'
            : 'image/webp',
    });
  const server = httpServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Read-only preview');
      return;
    }
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    const item = allowed.get(path);
    if (!item) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': item.type,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': `default-src 'none'; script-src 'sha256-${createHash('sha256').update(script).digest('base64')}'; img-src 'self'; style-src 'unsafe-inline'; font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'none'`,
    });
    response.end(request.method === 'HEAD' ? undefined : item.bytes);
  });
  server.listen(Number(process.env.UI13_PORT ?? 5215), '127.0.0.1', () =>
    console.log(`UI13 read-only board http://127.0.0.1:${server.address().port}`),
  );
  process.once('SIGINT', () => server.close());
  process.once('SIGTERM', () => server.close());
} else throw new Error('Use build, check, validate [draft.json], or serve');
