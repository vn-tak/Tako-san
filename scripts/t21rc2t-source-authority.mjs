import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { loadCertifiedV1Authority } from './t21r-v1-authority.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function reject() {
  const error = new Error('T21RC2T_TOPOLOGY_REJECTED');
  error.code = error.message;
  throw error;
}

function v1Projection(recipes) {
  return recipes.map((recipe) => ({ id: recipe.id, ingredients: recipe.ingredients.map((ingredient) => ({
    ingredientId: ingredient.ingredientId, name: ingredient.name,
    requiredQuantity: ingredient.requiredQuantity, unit: ingredient.unit, isOptional: ingredient.isOptional === true,
  })) }));
}

export async function loadTopologyAuthorities(root = process.cwd()) {
  let vite;
  try {
    const v1 = await loadCertifiedV1Authority(root);
    vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent',
      optimizeDeps: { noDiscovery: true, include: [] } });
    const refresh = await vite.ssrLoadModule('/packages/recipes/src/refresh/index.ts');
    const { normalizeIngredientAlias } = await vite.ssrLoadModule('/packages/domain/src/foundation.ts');
    const directory = path.join(root, 'data/recipe-refresh/v2');
    const manifest = refresh.RefreshSourceManifestSchema.parse(JSON.parse(readFileSync(path.join(directory, 'manifest.json'), 'utf8')));
    const expectedIds = v1.releaseManifest.orderedRecipeIds;
    if (manifest.baseReleaseId !== v1.releaseManifest.releaseId || manifest.recipeCount !== 500
        || JSON.stringify(manifest.orderedRecipeIds) !== JSON.stringify(expectedIds)) reject();
    const recipeFiles = readdirSync(path.join(directory, 'recipes')).filter((name) => name.endsWith('.json')).sort();
    const expectedFiles = ['exceptions.json', 'ingredient-reconciliation.json', 'nutrition-evidence.json', ...recipeFiles.map((name) => `recipes/${name}`)].sort();
    if (recipeFiles.length !== 500 || JSON.stringify(manifest.fileHashes.map((entry) => entry.path).sort()) !== JSON.stringify(expectedFiles)) reject();
    const actualHashes = manifest.fileHashes.map((entry) => {
      if (!/^(?:exceptions\.json|ingredient-reconciliation\.json|nutrition-evidence\.json|recipes\/[A-Za-z0-9][A-Za-z0-9_-]*\.json)$/.test(entry.path)) reject();
      const hash = sha256(readFileSync(path.join(directory, entry.path)));
      if (hash !== entry.sha256) reject();
      return { path: entry.path, sha256: hash };
    });
    if (await refresh.fingerprintRefreshArtifact(actualHashes) !== manifest.canonicalArtifactSha256) reject();
    const sources = recipeFiles.map((name) => refresh.RefreshRecipeSchema.parse(JSON.parse(readFileSync(path.join(directory, 'recipes', name), 'utf8'))));
    refresh.assertRefreshCatalog(sources, expectedIds);
    const sourcesById = new Map(sources.map((recipe) => [recipe.identity.id, recipe]));
    const v2Recipes = expectedIds.map((id) => {
      const source = sourcesById.get(id);
      return { id, ingredients: source.ingredients.map((ingredient) => ({
        ingredientId: ingredient.canonicalIngredientId, name: ingredient.sourceName,
        requiredQuantity: ingredient.quantity.kind === 'measured' ? ingredient.quantity.amount : null,
        unit: ingredient.quantity.kind === 'measured' ? ingredient.quantity.unit : null,
        isOptional: ingredient.optional,
      })) };
    });
    if (v2Recipes.reduce((n, recipe) => n + recipe.ingredients.length, 0) !== 6766) reject();
    return { recipeIds: [...expectedIds].sort(), targetRecipes: v1Projection(v1.targetRecipes), v2Recipes,
      canonicalIngredientIds: v1.canonicalIngredientIds, reconciliation: v1.reconciliation,
      authorityProof: v1.authorityProof, conceptKey: refresh.ingredientConceptKey, normalizeName: normalizeIngredientAlias };
  } catch { reject(); }
  finally {
    if (vite) { try { await vite.close(); } catch { reject(); } }
  }
}
