import { createHash } from 'node:crypto';
import { PRODUCTION_CLASSES, TARGET_CLASSES, reconcileIngredientOccurrences } from './t21rc-row-reconciliation.mjs';

const cardinality = ['zero', 'one', 'two', 'three', 'four', 'five', 'sixToTen', 'elevenToTwenty', 'aboveTwenty'];
const multiplicity = ['one', 'two', 'three', 'four', 'fivePlus'];
const delta = ['atMostMinusTen', 'minusNineToMinusFive', 'minusFourToMinusTwo', 'minusOne', 'zero', 'plusOne', 'plusTwoToPlusFour', 'plusFiveToPlusNine', 'atLeastPlusTen'];
const shape = ['exact', 'contentEquivalentDifferentId', 'contentEquivalentSameId', 'idMatchContentDifferent', 'only', 'unresolved'];
export const T21RC2T_HISTOGRAM_BUCKETS = Object.freeze(Object.fromEntries(Object.entries({
  identityPopulations: ['v1Id', 'ingEnr', 'otherId'],
  productionClassification: PRODUCTION_CLASSES,
  targetClassification: TARGET_CLASSES,
  generatorFormulaOccurrences: ['match', 'mismatch'],
  generatorFormulaDistinctIds: ['allOccurrencesMatch', 'someMismatch'],
  v2GeneratorFormulaOccurrences: ['match', 'mismatch'],
  v2GeneratorFormulaDistinctIds: ['allOccurrencesMatch', 'someMismatch'],
  productionIngEnrDistinctIdLineage: ['shared', 'productionOnly'],
  v2IngEnrDistinctIdLineage: ['shared', 'v2Only'],
  productionIngEnrOccurrenceLineage: ['shared', 'productionOnly'],
  v2IngEnrOccurrenceLineage: ['shared', 'v2Only'],
  targetCandidateCardinality: cardinality,
  targetCandidateOrigins: ['none', 'v1Only', 'ingEnrOnly', 'mixedV1IngEnr', 'other'],
  targetCrossIdConflict: ['absent', 'present'],
  targetWithoutSameIdNameCandidates: ['zero', 'one', 'two', 'threeToFour', 'fivePlus'],
  targetWithoutSameIdNameMatch: ['none', 'sameNormalizedKeyOnly', 'contextCompatibleOnly', 'mixedKeys'],
  exactWitnessCompetition: ['noCompetitor', 'oneIngEnrCompetitor', 'multipleIngEnrCompetitors', 'crossIdConflict', 'otherCompetitor'],
  ingEnrSemanticTopology: ['plausibleReplacement', 'sameIdWitnessCompetitor', 'multiplePlausibleTargets', 'noPlausibleV1Concept'],
  ingEnrContentBeyondV1: ['representedInV1', 'notRepresentedInV1'],
  v1IdAcrossRecipeMultiplicity: multiplicity,
  ingEnrIdAcrossRecipeMultiplicity: multiplicity,
  v1IdPerRecipeMultiplicity: multiplicity,
  ingEnrIdPerRecipeMultiplicity: multiplicity,
  otherIdPerRecipeMultiplicity: multiplicity,
  crossIdConceptMultiplicity: multiplicity,
  exactDuplicateLikeMultiplicity: multiplicity,
  sameRecipeConceptIdentity: ['singleId', 'differentIds'],
  sameRecipeConceptContent: ['singleContent', 'contentVariants', 'unresolvedContent'],
  sameRecipeContentIdentity: ['singleId', 'differentIds'],
  sameRecipeIdentityContent: ['singleContent', 'contentVariants', 'unresolvedContent'],
  sameIdResidualGroups: ['two', 'three', 'fourPlus', 'one'],
  sameIdResidualRows: ['two', 'three', 'fourPlus', 'one'],
  sameIdResidualDrift: ['membershipPlusContent', 'namePlusSemantics', 'other'],
  sameIdResidualGroupMembership: ['allRowsResidual', 'someRowsNotResidual'],
  productionVsV2Shape: shape,
  v2VsProductionShape: shape,
  perRecipeTopology: ['empty', 'v1Only', 'ingEnrOnly', 'mixedV1IngEnr', 'otherIdentity'],
  perRecipeProductionCount: cardinality,
  perRecipeV1Count: cardinality,
  perRecipeV2Count: cardinality,
  perRecipeV1IdCount: cardinality,
  perRecipeIngEnrCount: cardinality,
  perRecipeSameIdDriftCount: cardinality,
  perRecipeCrossIdConflictCount: cardinality,
  productionMinusV1: delta,
  productionMinusV2: delta,
  v2MinusV1: delta,
  driftUnitRelation: ['sameUnit', 'strictMassConversion', 'strictVolumeConversion', 'countToMass', 'massToCount', 'nonConvertible', 'multipleRows'],
  driftConvertedQuantity: ['equal', 'different'],
  driftSameUnitQuantityRatio: ['belowHalf', 'halfToBelowOne', 'equal', 'aboveOneToTwo', 'aboveTwo'],
}).map(([name, keys]) => [name, Object.freeze([...keys])])));

const zero = (keys) => Object.fromEntries(keys.map((key) => [key, 0]));
const key = (...values) => JSON.stringify(values);
const sum = (values) => values.reduce((total, n) => total + n, 0);
const population = (row, v1Ids) => v1Ids.has(row.ingredientId) ? 'v1Id' : row.ingredientId.startsWith('ING_ENR_') ? 'ingEnr' : 'otherId';
const identityKey = (row) => key(row.recipeId, row.ingredientId);
const rawTuple = (row) => key(row.recipeId, row.ingredientId, row.name, row.quantity, row.unit, row.optional);
const countBucket = (n) => n <= 5 ? cardinality[n] : n <= 10 ? 'sixToTen' : n <= 20 ? 'elevenToTwenty' : 'aboveTwenty';
const multBucket = (n) => n <= 4 ? multiplicity[n - 1] : 'fivePlus';
const residualBucket = (n) => n === 1 ? 'one' : n === 2 ? 'two' : n === 3 ? 'three' : 'fourPlus';
const deltaBucket = (n) => n <= -10 ? delta[0] : n <= -5 ? delta[1] : n <= -2 ? delta[2] : n === -1 ? delta[3] : n === 0 ? delta[4] : n === 1 ? delta[5] : n <= 4 ? delta[6] : n <= 9 ? delta[7] : delta[8];

function reject(code = 'T21RC2T_TOPOLOGY_REJECTED') {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function dataOnly(value, budget = { nodes: 0 }, depth = 0) {
  if (++budget.nodes > 1_000_000 || depth > 24) reject();
  if (value === null || ['string', 'boolean'].includes(typeof value)) return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (typeof value !== 'object' || (!Array.isArray(value) && ![null, Object.prototype].includes(Object.getPrototypeOf(value)))) reject();
  for (const field of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (typeof field !== 'string' || !Object.hasOwn(descriptor, 'value')) reject();
    dataOnly(descriptor.value, budget, depth + 1);
  }
}

function groups(rows, signature) {
  const result = new Map();
  for (const row of rows) {
    const signatureKey = signature(row);
    if (!result.has(signatureKey)) result.set(signatureKey, []);
    result.get(signatureKey).push(row);
  }
  return result;
}

function decimal(value, shift = 0) {
  const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e');
  const [integer, fraction = ''] = mantissa.split('.');
  let coefficient = BigInt(integer + fraction);
  let power = Number(exponent) - fraction.length + shift;
  while (coefficient !== 0n && coefficient % 10n === 0n) { coefficient /= 10n; power++; }
  return { coefficient, power, signature: `${coefficient}e${power}` };
}

function ratioBucket(actual, expected) {
  const a = decimal(actual), b = decimal(expected);
  const power = Math.min(a.power, b.power);
  const numerator = a.coefficient * 10n ** BigInt(a.power - power);
  const denominator = b.coefficient * 10n ** BigInt(b.power - power);
  return numerator * 2n < denominator ? 'belowHalf' : numerator < denominator ? 'halfToBelowOne'
    : numerator === denominator ? 'equal' : numerator <= denominator * 2n ? 'aboveOneToTwo' : 'aboveTwo';
}

function quantitySignature(row) {
  if (row.quantity === null || row.unit === null) return null;
  const unit = row.unit === 'kg' ? 'g' : row.unit === 'l' ? 'ml' : row.unit;
  return key(decimal(row.quantity, ['kg', 'l'].includes(row.unit) ? 3 : 0).signature, unit);
}

function normalizedContent(row) {
  const quantity = quantitySignature(row);
  return quantity === null ? null : key(row.recipeId, row.normalizedName, quantity, row.optional);
}

function contextualMatch(a, b) {
  if (!a.concept || !b.concept) return false;
  return a.concept === b.concept || ` ${a.concept} `.includes(` ${b.concept} `) || ` ${b.concept} `.includes(` ${a.concept} `);
}

function decorate(row, conceptKey, normalizeName) {
  const normalizedName = normalizeName(row.name), concept = conceptKey(row.name);
  if (typeof normalizedName !== 'string' || typeof concept !== 'string' || normalizedName.length > 1000 || concept.length > 1000) reject();
  return { ...row, normalizedName, concept };
}

function flatten(recipes, recipeIds, conceptKey, normalizeName) {
  if (!Array.isArray(recipes) || recipes.length !== recipeIds.size || new Set(recipes.map((recipe) => recipe.id)).size !== recipes.length) reject();
  return recipes.flatMap((recipe) => {
    if (!recipeIds.has(recipe.id) || !Array.isArray(recipe.ingredients)) reject();
    return recipe.ingredients.map((ingredient) => decorate({
      recipeId: recipe.id, ingredientId: ingredient.ingredientId, name: ingredient.name,
      quantity: ingredient.requiredQuantity ?? null, unit: ingredient.unit ?? null, optional: ingredient.isOptional === true,
    }, conceptKey, normalizeName));
  });
}

function validLine(row) {
  return typeof row.ingredientId === 'string' && /^[A-Z][A-Z0-9_]{0,99}$/.test(row.ingredientId)
    && typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 300
    && (row.quantity === null || (typeof row.quantity === 'number' && Number.isFinite(row.quantity) && row.quantity > 0))
    && (row.unit === null || (typeof row.unit === 'string' && row.unit.trim().length > 0 && row.unit.length <= 50));
}

function statistics(values) {
  const sorted = [...values].sort((a, b) => a - b), n = sorted.length;
  const percentile = (p) => sorted[Math.max(0, Math.ceil(n * p) - 1)] ?? 0;
  return {
    min: sorted[0] ?? 0, max: sorted.at(-1) ?? 0,
    median: n ? (sorted[Math.floor((n - 1) / 2)] + sorted[Math.floor(n / 2)]) / 2 : 0,
    p90: percentile(0.90), p95: percentile(0.95), p99: percentile(0.99),
  };
}

function compareShape(production, v2) {
  const result = { production: zero(shape), v2: zero(shape) };
  const p = new Set(production), v = new Set(v2);
  const pair = (left, right, category) => {
    const n = Math.min(left.length, right.length);
    for (let i = 0; i < n; i++) { p.delete(left[i]); v.delete(right[i]); }
    result.production[category] += n; result.v2[category] += n;
  };
  const unresolved = (left, right) => {
    for (const row of left) p.delete(row);
    for (const row of right) v.delete(row);
    result.production.unresolved += left.length; result.v2.unresolved += right.length;
  };
  let right = groups(v, rawTuple);
  for (const [signature, left] of groups(p, rawTuple)) pair(left, right.get(signature) ?? [], 'exact');
  right = groups([...v].filter((row) => normalizedContent(row) !== null), normalizedContent);
  for (const [signature, left] of groups([...p].filter((row) => normalizedContent(row) !== null), normalizedContent)) {
    const candidates = right.get(signature) ?? [];
    if (!candidates.length) continue;
    if (new Set(left.map((row) => row.ingredientId)).size === 1 && new Set(candidates.map((row) => row.ingredientId)).size === 1) {
      pair(left, candidates, left[0].ingredientId === candidates[0].ingredientId ? 'contentEquivalentSameId' : 'contentEquivalentDifferentId');
    } else unresolved(left, candidates);
  }
  right = groups(v, identityKey);
  for (const [signature, left] of groups(p, identityKey)) {
    const candidates = right.get(signature) ?? [];
    if (!candidates.length) continue;
    if (left.length === 1 && candidates.length === 1) pair(left, candidates, 'idMatchContentDifferent');
    else unresolved(left, candidates);
  }
  result.production.only = p.size; result.v2.only = v.size;
  return result;
}

export function aggregateIdentityTopology(input, { conceptKey, normalizeName } = {}) {
  try {
    dataOnly(input);
    if (typeof conceptKey !== 'function' || typeof normalizeName !== 'function') reject();
    const { recipeIds, productionRows, targetRecipes, v2Recipes, canonicalIngredientIds = [], reconciliation = [] } = input;
    if (!Array.isArray(recipeIds) || recipeIds.length === 0 || recipeIds.length > 10_000
        || recipeIds.some((id) => typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(id))
        || new Set(recipeIds).size !== recipeIds.length || !Array.isArray(productionRows)) reject();
    const roster = new Set(recipeIds);
    const v1 = flatten(targetRecipes, roster, conceptKey, normalizeName), v2 = flatten(v2Recipes, roster, conceptKey, normalizeName);
    const physicalIds = new Set();
    const production = productionRows.map((row) => {
      if (Object.keys(row).sort().join(',') !== 'id,ingredient_id,is_optional,name,recipe_id,required_quantity,unit'
          || !roster.has(row.recipe_id) || typeof row.id !== 'string' || !row.id.trim() || row.id.length > 500
          || physicalIds.has(row.id) || ![0, 1].includes(row.is_optional)) reject();
      physicalIds.add(row.id);
      return decorate({ recipeId: row.recipe_id, ingredientId: row.ingredient_id, name: row.name,
        quantity: row.required_quantity, unit: row.unit, optional: row.is_optional === 1 }, conceptKey, normalizeName);
    });
    if ([...production, ...v1, ...v2].some((row) => !validLine(row))
        || production.length + v1.length + v2.length > 100_000 || production.length * v1.length > 100_000_000) reject();
    const v1Ids = new Set(v1.map((row) => row.ingredientId));
    const h = Object.fromEntries(Object.entries(T21RC2T_HISTOGRAM_BUCKETS).map(([name, keys]) => [name, zero(keys)]));
    const inc = (name, bucket, n = 1) => { h[name][bucket] += n; };
    const byRecipe = groups(production, (row) => row.recipeId), v1ByRecipe = groups(v1, (row) => row.recipeId), v2ByRecipe = groups(v2, (row) => row.recipeId);
    const byIdentity = groups(production, identityKey), v1ByIdentity = groups(v1, identityKey);
    const productionIngEnr = production.filter((row) => population(row, v1Ids) === 'ingEnr');
    const v2IngEnr = v2.filter((row) => row.ingredientId.startsWith('ING_ENR_'));
    const productionIngIds = new Set(productionIngEnr.map((row) => row.ingredientId)), v2IngIds = new Set(v2IngEnr.map((row) => row.ingredientId));
    for (const row of production) inc('identityPopulations', population(row, v1Ids));
    const formula = (rows, occurrenceHistogram, idHistogram) => {
      for (const bag of groups(rows, (row) => row.ingredientId).values()) {
        let mismatch = false;
        for (const row of bag) {
          const expected = `ING_ENR_${createHash('sha256').update(`source-name:${row.concept}`).digest('hex').slice(0, 16).toUpperCase()}`;
          const matches = row.ingredientId === expected;
          inc(occurrenceHistogram, matches ? 'match' : 'mismatch'); mismatch ||= !matches;
        }
        inc(idHistogram, mismatch ? 'someMismatch' : 'allOccurrencesMatch');
      }
    };
    formula(productionIngEnr, 'generatorFormulaOccurrences', 'generatorFormulaDistinctIds');
    formula(v2IngEnr, 'v2GeneratorFormulaOccurrences', 'v2GeneratorFormulaDistinctIds');
    for (const id of productionIngIds) inc('productionIngEnrDistinctIdLineage', v2IngIds.has(id) ? 'shared' : 'productionOnly');
    for (const id of v2IngIds) inc('v2IngEnrDistinctIdLineage', productionIngIds.has(id) ? 'shared' : 'v2Only');
    for (const row of productionIngEnr) inc('productionIngEnrOccurrenceLineage', v2IngIds.has(row.ingredientId) ? 'shared' : 'productionOnly');
    for (const row of v2IngEnr) inc('v2IngEnrOccurrenceLineage', productionIngIds.has(row.ingredientId) ? 'shared' : 'v2Only');

    const manifest = reconcileIngredientOccurrences({ targetRecipes, productionRows, productionRecipeIds: recipeIds,
      canonicalIngredientIds, reconciliation, captureCounts: { recipeCount: recipeIds.length, ingredientOccurrenceCount: productionRows.length } });
    const evidenceByKey = new Map(manifest.production.map((row) => [row.occurrenceKey, row]));
    for (const row of manifest.production) inc('productionClassification', row.classification);
    for (const target of manifest.target) {
      inc('targetClassification', target.classification);
      const candidates = target.candidateProductionOccurrenceKeys.map((candidate) => evidenceByKey.get(candidate));
      inc('targetCandidateCardinality', countBucket(candidates.length));
      const origins = new Set(candidates.map((row) => row.identityPopulation));
      inc('targetCandidateOrigins', !candidates.length ? 'none' : [...origins].some((origin) => !['V1_ID', 'UNREVIEWED_ING_ENR'].includes(origin)) ? 'other'
        : origins.size > 1 ? 'mixedV1IngEnr' : origins.has('V1_ID') ? 'v1Only' : 'ingEnrOnly');
      const conflict = candidates.some((row) => row.classification === 'ID_CONFLICT_REVIEW_REQUIRED' || row.reviewReason === 'ALTERNATE_IDENTITY_CONTENT_CONFLICT');
      inc('targetCrossIdConflict', conflict ? 'present' : 'absent');
      if (candidates.some((row) => row.classification === 'EXACT_V1_MATCH' && row.productionIngredientId === target.targetIngredientId)) {
        const competitors = candidates.filter((row) => row.classification !== 'EXACT_V1_MATCH');
        const ing = competitors.filter((row) => row.identityPopulation === 'UNREVIEWED_ING_ENR').length;
        inc('exactWitnessCompetition', conflict ? 'crossIdConflict' : competitors.length === 0 ? 'noCompetitor'
          : competitors.length !== ing ? 'otherCompetitor' : ing === 1 ? 'oneIngEnrCompetitor' : 'multipleIngEnrCompetitors');
      }
    }
    for (const target of v1) {
      if (byIdentity.has(identityKey(target))) continue;
      const candidates = (byRecipe.get(target.recipeId) ?? []).filter((row) => population(row, v1Ids) === 'ingEnr' && contextualMatch(target, row));
      inc('targetWithoutSameIdNameCandidates', candidates.length === 0 ? 'zero' : candidates.length === 1 ? 'one' : candidates.length === 2 ? 'two' : candidates.length <= 4 ? 'threeToFour' : 'fivePlus');
      const exact = candidates.filter((row) => row.concept === target.concept).length;
      inc('targetWithoutSameIdNameMatch', !candidates.length ? 'none' : exact === candidates.length ? 'sameNormalizedKeyOnly' : exact === 0 ? 'contextCompatibleOnly' : 'mixedKeys');
    }
    const v1Content = new Set(v1.map(normalizedContent).filter((signature) => signature !== null));
    for (const row of productionIngEnr) {
      const plausible = (v1ByRecipe.get(row.recipeId) ?? []).filter((target) => contextualMatch(row, target));
      inc('ingEnrSemanticTopology', plausible.length === 0 ? 'noPlausibleV1Concept' : plausible.length > 1 ? 'multiplePlausibleTargets'
        : byIdentity.has(identityKey(plausible[0])) ? 'sameIdWitnessCompetitor' : 'plausibleReplacement');
      inc('ingEnrContentBeyondV1', normalizedContent(row) !== null && v1Content.has(normalizedContent(row)) ? 'representedInV1' : 'notRepresentedInV1');
    }

    for (const bag of groups(production, (row) => row.ingredientId).values()) {
      const origin = population(bag[0], v1Ids);
      if (origin !== 'otherId') inc(origin === 'v1Id' ? 'v1IdAcrossRecipeMultiplicity' : 'ingEnrIdAcrossRecipeMultiplicity', multBucket(new Set(bag.map((row) => row.recipeId)).size));
    }
    for (const bag of byIdentity.values()) {
      const origin = population(bag[0], v1Ids);
      inc(origin === 'v1Id' ? 'v1IdPerRecipeMultiplicity' : origin === 'ingEnr' ? 'ingEnrIdPerRecipeMultiplicity' : 'otherIdPerRecipeMultiplicity', multBucket(bag.length));
      inc('sameRecipeIdentityContent', bag.some((row) => normalizedContent(row) === null) ? 'unresolvedContent'
        : new Set(bag.map(normalizedContent)).size === 1 ? 'singleContent' : 'contentVariants');
    }
    for (const bag of groups(production, (row) => key(row.recipeId, row.concept || row.normalizedName)).values()) {
      const differentIds = new Set(bag.map((row) => row.ingredientId)).size > 1;
      inc('sameRecipeConceptIdentity', differentIds ? 'differentIds' : 'singleId');
      inc('sameRecipeConceptContent', bag.some((row) => normalizedContent(row) === null) ? 'unresolvedContent'
        : new Set(bag.map(normalizedContent)).size === 1 ? 'singleContent' : 'contentVariants');
      if (differentIds) inc('crossIdConceptMultiplicity', multBucket(bag.length));
    }
    for (const bag of groups(production.filter((row) => normalizedContent(row) !== null), normalizedContent).values()) {
      inc('sameRecipeContentIdentity', new Set(bag.map((row) => row.ingredientId)).size > 1 ? 'differentIds' : 'singleId');
    }
    for (const bag of groups(production, rawTuple).values()) inc('exactDuplicateLikeMultiplicity', multBucket(bag.length));

    const residual = manifest.production.filter((row) => row.classification === 'SAME_ID_CONTENT_DRIFT' && row.confidence === 'REVIEW_REQUIRED'
      && (byIdentity.get(key(row.recipeId, row.productionIngredientId))?.length ?? 0) > 1);
    const residualGroups = groups(residual, (row) => key(row.recipeId, row.productionIngredientId));
    let weightedResidualRows = 0;
    for (const [signature, bag] of residualGroups) {
      inc('sameIdResidualGroups', residualBucket(bag.length)); inc('sameIdResidualRows', residualBucket(bag.length), bag.length);
      weightedResidualRows += bag.length;
      inc('sameIdResidualGroupMembership', bag.length === byIdentity.get(signature).length ? 'allRowsResidual' : 'someRowsNotResidual');
    }
    for (const row of residual) inc('sameIdResidualDrift', row.driftKind === 'membership_plus_content' ? 'membershipPlusContent' : row.driftKind === 'name_plus_semantics' ? 'namePlusSemantics' : 'other');

    const compared = compareShape(production, v2);
    h.productionVsV2Shape = compared.production; h.v2VsProductionShape = compared.v2;
    const differences = { productionMinusV1: [], productionMinusV2: [], v2MinusV1: [] };
    const evidenceByRecipe = groups(manifest.production, (row) => row.recipeId);
    for (const recipeId of [...roster].sort()) {
      const p = byRecipe.get(recipeId) ?? [], a = v1ByRecipe.get(recipeId) ?? [], b = v2ByRecipe.get(recipeId) ?? [], evidence = evidenceByRecipe.get(recipeId) ?? [];
      const v1Count = p.filter((row) => population(row, v1Ids) === 'v1Id').length, ingCount = p.filter((row) => population(row, v1Ids) === 'ingEnr').length;
      inc('perRecipeTopology', p.length === 0 ? 'empty' : v1Count + ingCount !== p.length ? 'otherIdentity' : v1Count && ingCount ? 'mixedV1IngEnr' : v1Count ? 'v1Only' : 'ingEnrOnly');
      for (const [name, count] of Object.entries({ perRecipeProductionCount: p.length, perRecipeV1Count: a.length, perRecipeV2Count: b.length,
        perRecipeV1IdCount: v1Count, perRecipeIngEnrCount: ingCount,
        perRecipeSameIdDriftCount: evidence.filter((row) => row.classification === 'SAME_ID_CONTENT_DRIFT').length,
        perRecipeCrossIdConflictCount: evidence.filter((row) => row.classification === 'ID_CONFLICT_REVIEW_REQUIRED' || row.reviewReason === 'ALTERNATE_IDENTITY_CONTENT_CONFLICT').length })) inc(name, countBucket(count));
      for (const [name, difference] of Object.entries({ productionMinusV1: p.length - a.length, productionMinusV2: p.length - b.length, v2MinusV1: b.length - a.length })) {
        differences[name].push(difference); inc(name, deltaBucket(difference));
      }
    }
    const driftIdentities = new Set(manifest.production.filter((row) => row.classification === 'SAME_ID_CONTENT_DRIFT').map((row) => key(row.recipeId, row.productionIngredientId)));
    const countUnits = new Set(['piece', 'pack', 'bunch', 'slice', 'clove', 'tbsp', 'tsp', 'serving']);
    for (const signature of driftIdentities) {
      const live = byIdentity.get(signature), targets = v1ByIdentity.get(signature) ?? [];
      if (live.length !== 1 || targets.length !== 1) { inc('driftUnitRelation', 'multipleRows', manifest.production.filter((row) => row.classification === 'SAME_ID_CONTENT_DRIFT' && key(row.recipeId, row.productionIngredientId) === signature).length); continue; }
      const [row] = live, [target] = targets;
      const units = new Set([row.unit, target.unit]);
      const relation = row.unit === target.unit ? 'sameUnit' : [...units].every((unit) => ['g', 'kg'].includes(unit)) ? 'strictMassConversion'
        : [...units].every((unit) => ['ml', 'l'].includes(unit)) ? 'strictVolumeConversion' : countUnits.has(target.unit) && ['g', 'kg'].includes(row.unit) ? 'countToMass'
          : ['g', 'kg'].includes(target.unit) && countUnits.has(row.unit) ? 'massToCount' : 'nonConvertible';
      inc('driftUnitRelation', relation);
      if (relation === 'sameUnit') inc('driftSameUnitQuantityRatio', ratioBucket(row.quantity, target.quantity));
      if (['strictMassConversion', 'strictVolumeConversion'].includes(relation)) inc('driftConvertedQuantity', quantitySignature(row) === quantitySignature(target) ? 'equal' : 'different');
    }
    const result = { populations: { recipeCount: recipeIds.length, productionOccurrenceCount: production.length, targetOccurrenceCount: v1.length, v2OccurrenceCount: v2.length },
      histograms: h, distributions: Object.fromEntries(Object.entries(differences).map(([name, values]) => [name, statistics(values)])),
      accounting: { weightedResidualRows } };
    assertTopologyAccounting(result);
    return result;
  } catch { reject(); }
}

export function assertTopologyAccounting(raw) {
  try {
    dataOnly(raw);
    if (Object.keys(raw).sort().join(',') !== 'accounting,distributions,histograms,populations'
        || Object.keys(raw.histograms).sort().join(',') !== Object.keys(T21RC2T_HISTOGRAM_BUCKETS).sort().join(',')
        || Object.keys(raw.populations).sort().join(',') !== 'productionOccurrenceCount,recipeCount,targetOccurrenceCount,v2OccurrenceCount'
        || Object.values(raw.populations).some((n) => !Number.isSafeInteger(n) || n < 0 || n > 100_000)
        || Object.keys(raw.distributions).sort().join(',') !== 'productionMinusV1,productionMinusV2,v2MinusV1'
        || Object.keys(raw.accounting).join(',') !== 'weightedResidualRows') reject();
    const { histograms: h, populations: p } = raw;
    for (const stats of Object.values(raw.distributions)) {
      if (Object.keys(stats).sort().join(',') !== 'max,median,min,p90,p95,p99'
          || Object.values(stats).some((n) => typeof n !== 'number' || !Number.isFinite(n) || Math.abs(n) > 100_000)
          || ['min', 'max', 'p90', 'p95', 'p99'].some((name) => !Number.isInteger(stats[name]))
          || !Number.isInteger(stats.median * 2) || stats.min > stats.median || stats.median > stats.max
          || stats.min > stats.p90 || stats.p90 > stats.p95 || stats.p95 > stats.p99 || stats.p99 > stats.max) reject();
    }
    for (const [name, keys] of Object.entries(T21RC2T_HISTOGRAM_BUCKETS)) {
      if (Object.keys(h[name]).sort().join(',') !== [...keys].sort().join(',')
          || Object.values(h[name]).some((n) => !Number.isSafeInteger(n) || n < 0 || n > 10_000_000)) reject();
    }
    const total = (name) => sum(Object.values(h[name]));
    const equal = (a, b) => { if (a !== b) reject(); };
    equal(total('identityPopulations'), p.productionOccurrenceCount);
    equal(total('productionClassification'), p.productionOccurrenceCount);
    equal(total('targetClassification'), p.targetOccurrenceCount);
    equal(total('exactWitnessCompetition'), h.productionClassification.EXACT_V1_MATCH);
    for (const name of ['targetCandidateCardinality', 'targetCandidateOrigins', 'targetCrossIdConflict']) equal(total(name), p.targetOccurrenceCount);
    equal(total('targetWithoutSameIdNameCandidates'), total('targetWithoutSameIdNameMatch'));
    for (const name of ['generatorFormulaOccurrences', 'productionIngEnrOccurrenceLineage', 'ingEnrSemanticTopology', 'ingEnrContentBeyondV1']) equal(total(name), h.identityPopulations.ingEnr);
    equal(total('generatorFormulaDistinctIds'), total('productionIngEnrDistinctIdLineage'));
    equal(total('v2GeneratorFormulaDistinctIds'), total('v2IngEnrDistinctIdLineage'));
    equal(total('v2GeneratorFormulaOccurrences'), total('v2IngEnrOccurrenceLineage'));
    equal(h.productionIngEnrDistinctIdLineage.shared, h.v2IngEnrDistinctIdLineage.shared);
    equal(total('sameIdResidualRows'), total('sameIdResidualDrift'));
    equal(total('sameIdResidualRows'), raw.accounting.weightedResidualRows);
    equal(h.sameIdResidualRows.one, h.sameIdResidualGroups.one);
    equal(h.sameIdResidualRows.two, 2 * h.sameIdResidualGroups.two);
    equal(h.sameIdResidualRows.three, 3 * h.sameIdResidualGroups.three);
    if (h.sameIdResidualRows.fourPlus < 4 * h.sameIdResidualGroups.fourPlus) reject();
    equal(total('sameIdResidualGroups'), total('sameIdResidualGroupMembership'));
    equal(total('productionVsV2Shape'), p.productionOccurrenceCount);
    equal(total('v2VsProductionShape'), p.v2OccurrenceCount);
    for (const name of shape.slice(0, 4)) equal(h.productionVsV2Shape[name], h.v2VsProductionShape[name]);
    for (const name of ['perRecipeTopology', 'perRecipeProductionCount', 'perRecipeV1Count', 'perRecipeV2Count', 'perRecipeV1IdCount', 'perRecipeIngEnrCount', 'perRecipeSameIdDriftCount', 'perRecipeCrossIdConflictCount', ...Object.keys(raw.distributions)]) equal(total(name), p.recipeCount);
    equal(total('driftUnitRelation'), h.productionClassification.SAME_ID_CONTENT_DRIFT);
    equal(total('driftSameUnitQuantityRatio'), h.driftUnitRelation.sameUnit);
    equal(total('driftConvertedQuantity'), h.driftUnitRelation.strictMassConversion + h.driftUnitRelation.strictVolumeConversion);
    return true;
  } catch { reject('T21RC2T_ACCOUNTING_REJECTED'); }
}

export function assertForensicTopologyContract(raw) {
  try {
    assertTopologyAccounting(raw);
    const p = raw.populations, h = raw.histograms;
    if (p.recipeCount !== 500 || p.targetOccurrenceCount !== 2702 || p.productionOccurrenceCount !== 6720 || p.v2OccurrenceCount !== 6766
        || h.identityPopulations.v1Id !== 2468 || h.identityPopulations.ingEnr !== 4252 || h.identityPopulations.otherId !== 0
        || h.productionClassification.EXACT_V1_MATCH !== 26 || h.productionClassification.SAME_ID_CONTENT_DRIFT !== 1793
        || h.productionClassification.PRODUCTION_ONLY_KNOWN_ID !== 649 || h.productionClassification.ID_CONFLICT_REVIEW_REQUIRED !== 20
        || h.productionClassification.AMBIGUOUS !== 4232 || h.targetClassification.AMBIGUOUS !== 2702
        || sum(Object.values(h.sameIdResidualRows)) !== 65 || h.sameIdResidualDrift.membershipPlusContent !== 6
        || h.sameIdResidualDrift.namePlusSemantics !== 59 || h.sameIdResidualDrift.other !== 0
        || sum(Object.values(h.v2GeneratorFormulaOccurrences)) !== 4233 || h.v2GeneratorFormulaOccurrences.match !== 4233) reject();
    return true;
  } catch { reject('T21RC2T_TOPOLOGY_REJECTED'); }
}
