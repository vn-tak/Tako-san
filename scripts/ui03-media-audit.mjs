import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const out = resolve('.artifacts/ui03/media-mapping.json');
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
});
let db;
try {
  const { SqliteD1 } = await vite.ssrLoadModule('/tests/helpers/sqlite-d1.ts');
  const { ALL_RECIPES } = await vite.ssrLoadModule('/packages/recipes/src/data.ts');
  const { legacyRecipeImageIssue } = await vite.ssrLoadModule(
    '/packages/recipes/src/legacy-media-policy.ts',
  );
  db = new SqliteD1();
  const rows = db.query(
    'SELECT id, title, image_url AS imageUrl, source_type AS recipeSourceType, source_reference AS recipeSourceReference FROM recipes ORDER BY id',
  );
  const staticRows = ALL_RECIPES.map(({ id, title, imageUrl }) => ({ id, title, imageUrl }));
  const urls = [...new Set([...rows, ...staticRows].map((row) => row.imageUrl))].sort();
  const assets = [];
  for (const url of urls) {
    const canonicalRecipes = rows.filter((row) => row.imageUrl === url).map((row) => row.id);
    const staticRecipes = staticRows.filter((row) => row.imageUrl === url).map((row) => row.id);
    let local = null;
    if (url?.startsWith('/frigo/')) {
      const path = resolve(`public${url}`);
      try {
        const bytes = await readFile(path);
        const metadata = await sharp(bytes).metadata();
        local = {
          path: `public${url}`,
          bytes: (await stat(path)).size,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
        };
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        local = { path: `public${url}`, missing: true };
      }
    }
    assets.push({
      url,
      canonicalRecipeIds: canonicalRecipes,
      staticRecipeIds: staticRecipes,
      local,
      imageProvenance:
        'unverified: no per-image source/license/provider evidence established by this audit',
      remoteBytesChecked: false,
    });
  }
  const classify = (row) => ({ ...row, presentationIssue: legacyRecipeImageIssue(row) });
  const canonical = rows.map(classify);
  const staticCatalog = staticRows.map(classify);
  const issueCounts = (list) =>
    list.reduce((counts, row) => {
      const issue = row.presentationIssue ?? 'allowed_legacy_mapping';
      counts[issue] = (counts[issue] ?? 0) + 1;
      return counts;
    }, {});
  const localAssets = assets.filter((asset) => asset.local?.sha256);
  const duplicateHashes = [...new Set(localAssets.map((asset) => asset.local.sha256))].flatMap(
    (sha256) => {
      const same = localAssets.filter((asset) => asset.local.sha256 === sha256);
      return same.length > 1 ? [{ sha256, urls: same.map((asset) => asset.url) }] : [];
    },
  );
  const report = {
    schemaVersion: 1,
    localFreshMigrationsOnly: true,
    remoteReadsOrWrites: false,
    summary: {
      canonicalCount: rows.length,
      staticCount: staticRows.length,
      urls: assets.length,
      canonicalIssues: issueCounts(canonical),
      staticIssues: issueCounts(staticCatalog),
      mediaStates: db.query(
        'SELECT status, COUNT(*) AS count FROM recipe_media GROUP BY status ORDER BY status',
      ),
      urlReuseGroups: assets.filter((asset) => asset.canonicalRecipeIds.length > 1).length,
      duplicateLocalByteHashes: duplicateHashes.length,
    },
    limitations: [
      'Fresh local D1 replay is not production state.',
      'Recipe source metadata is not image provenance.',
      'Remote Unsplash image bytes/depictions/licenses were not fetched or verified.',
      'Allowed local mappings have plausible subject correspondence, not verified photo licensing or source.',
      'Ready media metadata proves serving integrity; content approval still belongs to the operator.',
    ],
    duplicateHashes,
    assets,
    canonical,
    staticCatalog,
  };
  await mkdir(resolve('.artifacts/ui03'), { recursive: true });
  await writeFile(out, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary));
  console.log(out);
} finally {
  db?.close();
  await vite.close();
}
