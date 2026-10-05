import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  assertRefreshCatalog,
  fingerprintRefreshArtifact,
  RefreshRecipeSchema,
  RefreshSourceManifestSchema,
} from '../../packages/recipes/src/refresh/index.ts';
import { ingredientConceptKey } from '../../packages/recipes/src/refresh/normalize.ts';
import { loadCertifiedV1Authority } from '../../scripts/t21r-v1-authority.mjs';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export const makeIngredient = (ingredientId, name, requiredQuantity = 1, unit = 'g', isOptional = false) => ({
  ingredientId, name, requiredQuantity, unit, isOptional,
});

export const makeRecipe = (id, ingredients = []) => ({ id, ingredients });

export const makeTargetIngredient = (recipeId, ingredientId, name, requiredQuantity = 1, unit = 'g', isOptional = false) => ({
  recipeId, ...makeIngredient(ingredientId, name, requiredQuantity, unit, isOptional),
});

export const makeProductionRow = ({
  id, recipeId, ingredientId, name, requiredQuantity = 1, unit = 'g', isOptional = 0,
}) => ({
  id,
  recipe_id: recipeId,
  ingredient_id: ingredientId,
  name,
  required_quantity: requiredQuantity,
  unit,
  is_optional: isOptional,
});

export function makeGeneratedIngredientId(name) {
  const concept = ingredientConceptKey(name);
  return `ING_ENR_${sha256(`source-name:${concept}`).slice(0, 16).toUpperCase()}`;
}

export function makeMismatchedIngredientId(name) {
  const generated = makeGeneratedIngredientId(name);
  const suffix = generated.at(-1) === '0' ? '1' : '0';
  return `${generated.slice(0, -1)}${suffix}`;
}

function recipesFromRows(recipeIds, rows) {
  const grouped = new Map(recipeIds.map((id) => [id, []]));
  for (const { recipeId, ...ingredient } of rows) {
    if (!grouped.has(recipeId)) throw new Error('T21RC2T_FIXTURE_REJECTED');
    grouped.get(recipeId).push(ingredient);
  }
  return recipeIds.map((id) => makeRecipe(id, grouped.get(id)));
}

export function makeTopologyInput({
  recipeIds = ['recipe-1'],
  productionRows = [],
  targets = [],
  v2 = [],
  targetRecipes,
  v2Recipes,
  canonicalIngredientIds = [],
  reconciliation = [],
} = {}) {
  return {
    recipeIds,
    productionRows,
    targetRecipes: targetRecipes ?? recipesFromRows(recipeIds, targets),
    v2Recipes: v2Recipes ?? recipesFromRows(recipeIds, v2),
    canonicalIngredientIds,
    reconciliation,
  };
}

export async function loadCertifiedCatalogs(root = process.cwd()) {
  const authority = await loadCertifiedV1Authority(root);
  const dataRoot = path.resolve(root, 'data/recipe-refresh/v2');
  const manifest = RefreshSourceManifestSchema.parse(JSON.parse(readFileSync(path.join(dataRoot, 'manifest.json'), 'utf8')));
  const recipeRoot = path.join(dataRoot, 'recipes');
  const files = readdirSync(recipeRoot).filter((name) => name.endsWith('.json')).sort();
  const sourceById = new Map(files.map((name) => {
    const recipe = RefreshRecipeSchema.parse(JSON.parse(readFileSync(path.join(recipeRoot, name), 'utf8')));
    return [recipe.identity.id, recipe];
  }));
  const sourceRecipes = manifest.orderedRecipeIds.map((id) => sourceById.get(id));
  if (sourceRecipes.some((recipe) => !recipe)) throw new Error('T21RC2T_FIXTURE_AUTHORITY_REJECTED');
  assertRefreshCatalog(sourceRecipes, manifest.orderedRecipeIds);

  const fileHashes = manifest.fileHashes.map(({ path: relativePath }) => ({
    path: relativePath,
    sha256: sha256(readFileSync(path.join(dataRoot, relativePath))),
  }));
  if (JSON.stringify(fileHashes) !== JSON.stringify(manifest.fileHashes)
      || await fingerprintRefreshArtifact(fileHashes) !== manifest.canonicalArtifactSha256
      || JSON.stringify(authority.releaseManifest.orderedRecipeIds) !== JSON.stringify(manifest.orderedRecipeIds)) {
    throw new Error('T21RC2T_FIXTURE_AUTHORITY_REJECTED');
  }

  const v2Recipes = sourceRecipes.map((recipe) => makeRecipe(recipe.identity.id, recipe.ingredients.map((ingredient) => ({
    ingredientId: ingredient.canonicalIngredientId,
    name: ingredient.sourceName,
    requiredQuantity: ingredient.quantity.runtime?.amount ?? null,
    unit: ingredient.quantity.runtime?.unit ?? null,
    isOptional: ingredient.optional,
  }))));
  return {
    recipeIds: authority.releaseManifest.orderedRecipeIds,
    targetRecipes: authority.targetRecipes,
    v2Recipes,
    v2SourceRecipes: sourceRecipes,
    canonicalIngredientIds: authority.canonicalIngredientIds,
    reconciliation: authority.reconciliation,
    releaseManifest: authority.releaseManifest,
    v2Manifest: manifest,
    authorityProof: authority.authorityProof,
  };
}

export function makeForensicScaleInput(catalogs) {
  const { recipeIds, v2Recipes: committedV2 } = catalogs;
  if (recipeIds.length !== 500 || committedV2.reduce((count, recipe) => count + recipe.ingredients.length, 0) !== 6766) {
    throw new Error('T21RC2T_SCALE_FIXTURE_REJECTED');
  }

  const targetRows = Array.from({ length: 2702 }, (_, index) => makeTargetIngredient(
    recipeIds[index % recipeIds.length],
    `V1_TARGET_${String(index).padStart(4, '0')}`,
    `scale target concept ${index}`,
    1 + (index % 17),
    'g',
    index % 11 === 0,
  ));
  const targetRecipes = recipesFromRows(recipeIds, targetRows);
  const productionRows = [];
  let physicalId = 0;
  const addProduction = (recipeId, ingredientId, name, requiredQuantity, unit = 'g', isOptional = false) => {
    productionRows.push(makeProductionRow({
      id: `scale-occurrence-${String(physicalId++).padStart(5, '0')}`,
      recipeId,
      ingredientId,
      name,
      requiredQuantity,
      unit,
      isOptional: isOptional ? 1 : 0,
    }));
  };

  for (const target of targetRows.slice(0, 26)) {
    addProduction(target.recipeId, target.ingredientId, target.name, target.requiredQuantity, target.unit, target.isOptional);
  }

  const driftGroups = [
    ...Array.from({ length: 3 }, () => ({ kind: 'membershipPlusContent', size: 2 })),
    ...Array.from({ length: 28 }, () => ({ kind: 'namePlusSemantics', size: 2 })),
    { kind: 'namePlusSemantics', size: 3 },
  ];
  let driftTargetIndex = 26;
  for (const [groupIndex, group] of driftGroups.entries()) {
    const target = targetRows[driftTargetIndex++];
    for (let occurrence = 0; occurrence < group.size; occurrence++) {
      const name = group.kind === 'membershipPlusContent' ? target.name : `${target.name} variant ${occurrence + 1}`;
      addProduction(target.recipeId, target.ingredientId, name, target.requiredQuantity + groupIndex + occurrence + 1, target.unit, target.isOptional);
    }
  }
  for (let index = 0; index < 1728; index++) {
    const target = targetRows[driftTargetIndex + index];
    addProduction(target.recipeId, target.ingredientId, target.name, target.requiredQuantity + 100, target.unit, target.isOptional);
  }

  for (let index = 0; index < 649; index++) {
    const target = targetRows[index];
    const targetRecipeIndex = recipeIds.indexOf(target.recipeId);
    const recipeId = recipeIds[(targetRecipeIndex + 1) % recipeIds.length];
    addProduction(recipeId, target.ingredientId, `scale known canonical ${index}`, 1);
  }

  const conflictStart = driftTargetIndex + 1728;
  for (let index = 0; index < 20; index++) {
    const target = targetRows[conflictStart + index];
    addProduction(target.recipeId, makeGeneratedIngredientId(target.name), target.name, target.requiredQuantity, target.unit, target.isOptional);
  }
  for (let index = 0; index < 4232; index++) {
    const recipeId = recipeIds[index % recipeIds.length];
    const name = `scale enrichment ${index}`;
    addProduction(recipeId, makeGeneratedIngredientId(name), name, 1 + (index % 13));
  }

  const v2Id = (ingredientId) => ingredientId.startsWith('ING_ENR_')
    ? ingredientId
    : `V2_AUTH_${sha256(`fixture-v2:${ingredientId}`).slice(0, 16).toUpperCase()}`;
  const v2Recipes = committedV2.map((recipe) => makeRecipe(recipe.id, recipe.ingredients.map((ingredient) => makeIngredient(
    v2Id(ingredient.ingredientId),
    ingredient.name,
    ingredient.requiredQuantity,
    ingredient.unit,
    ingredient.isOptional,
  ))));

  return makeTopologyInput({
    recipeIds,
    productionRows,
    targetRecipes,
    v2Recipes,
    canonicalIngredientIds: targetRows.map((target) => target.ingredientId),
  });
}
