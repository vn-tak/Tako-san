import { performance } from 'node:perf_hooks';
import { beforeAll, describe, expect, it } from 'vitest';
import { normalizeIngredientAlias } from '../../packages/domain/src/foundation.ts';
import { ingredientConceptKey } from '../../packages/recipes/src/refresh/normalize.ts';
import {
  aggregateIdentityTopology,
  assertForensicTopologyContract,
  assertTopologyAccounting,
  T21RC2T_HISTOGRAM_BUCKETS,
} from '../../scripts/t21rc2t-identity-topology.mjs';
import {
  createPublicReceipt,
  serializePublicReceipt,
  validatePublicReceipt,
} from '../../scripts/t21rc2t-production-receipt.mjs';
import {
  loadCertifiedCatalogs,
  makeForensicScaleInput,
  makeGeneratedIngredientId,
  makeIngredient,
  makeMismatchedIngredientId,
  makeProductionRow,
  makeTargetIngredient,
  makeTopologyInput,
} from '../helpers/t21rc2t-fixtures.mjs';

const aggregate = (input) => aggregateIdentityTopology(input, {
  conceptKey: ingredientConceptKey,
  normalizeName: normalizeIngredientAlias,
});

const permutation = (input) => ({
  ...input,
  recipeIds: [...input.recipeIds].reverse(),
  productionRows: [...input.productionRows].reverse(),
  targetRecipes: [...input.targetRecipes].reverse().map((recipe) => ({
    ...recipe,
    ingredients: [...recipe.ingredients].reverse(),
  })),
  v2Recipes: [...input.v2Recipes].reverse().map((recipe) => ({
    ...recipe,
    ingredients: [...recipe.ingredients].reverse(),
  })),
  canonicalIngredientIds: [...input.canonicalIngredientIds].reverse(),
  reconciliation: [...input.reconciliation].reverse(),
});

describe('T21RC2T offline identity topology', () => {
  it('keeps pure V1 witnesses in aggregate-only output', () => {
    const input = makeTopologyInput({
      recipeIds: ['private-recipe-001'],
      targets: [makeTargetIngredient('private-recipe-001', 'V1_PRIVATE_INGREDIENT', 'private ingredient name', 4, 'g')],
      productionRows: [makeProductionRow({
        id: 'private-row-001', recipeId: 'private-recipe-001', ingredientId: 'V1_PRIVATE_INGREDIENT',
        name: 'private ingredient name', requiredQuantity: 4, unit: 'g',
      })],
    });
    const raw = aggregate(input);
    const serialized = JSON.stringify(raw);

    expect(raw.populations).toEqual({ recipeCount: 1, productionOccurrenceCount: 1, targetOccurrenceCount: 1, v2OccurrenceCount: 0 });
    expect(raw.histograms.productionClassification.EXACT_V1_MATCH).toBe(1);
    expect(raw.histograms.targetClassification.SATISFIED_EXACT).toBe(1);
    expect(Object.keys(raw.histograms)).toEqual(Object.keys(T21RC2T_HISTOGRAM_BUCKETS));
    expect(assertTopologyAccounting(raw)).toBe(true);
    expect(serialized).not.toContain('private-recipe-001');
    expect(serialized).not.toContain('V1_PRIVATE_INGREDIENT');
    expect(serialized).not.toContain('private ingredient name');
  });

  it('separates enrichment lineage, formula matches, cross-ID conflicts, and known IDs', () => {
    const pureEnrichmentId = makeGeneratedIngredientId('miso trắng');
    const mixedCompetitorId = makeGeneratedIngredientId('white rice addition');
    const garlicEnrichmentId = makeGeneratedIngredientId('garlic');
    const productionOnlyId = makeGeneratedIngredientId('production only');
    const mismatchId = makeMismatchedIngredientId('wrong formula');
    const riềngId = makeGeneratedIngredientId('riềng');
    const riềngMismatchId = makeMismatchedIngredientId('riềng băm');
    const v2OnlyId = makeGeneratedIngredientId('v2 only');
    const recipeIds = [
      'pure-enrichment', 'mixed-witness', 'same-concept-conflict', 'known-only',
      'production-only-enrichment', 'formula-mismatch', 'same-concept-different-id', 'v2-only',
    ];
    const input = makeTopologyInput({
      recipeIds,
      targets: [
        makeTargetIngredient('mixed-witness', 'V1_MIXED', 'white rice', 1, 'g'),
        makeTargetIngredient('same-concept-conflict', 'V1_GARLIC', 'garlic', 1, 'g'),
      ],
      productionRows: [
        makeProductionRow({ id: 'pure-enrichment-row', recipeId: 'pure-enrichment', ingredientId: pureEnrichmentId, name: 'miso trắng', requiredQuantity: 2 }),
        makeProductionRow({ id: 'mixed-exact-row', recipeId: 'mixed-witness', ingredientId: 'V1_MIXED', name: 'white rice', requiredQuantity: 1 }),
        makeProductionRow({ id: 'mixed-competitor-row', recipeId: 'mixed-witness', ingredientId: mixedCompetitorId, name: 'white rice addition', requiredQuantity: 1 }),
        makeProductionRow({ id: 'cross-id-row', recipeId: 'same-concept-conflict', ingredientId: garlicEnrichmentId, name: 'garlic', requiredQuantity: 1 }),
        makeProductionRow({ id: 'known-id-row', recipeId: 'known-only', ingredientId: 'KNOWN_CANONICAL', name: 'registry only', requiredQuantity: 1 }),
        makeProductionRow({ id: 'production-only-enr-row', recipeId: 'production-only-enrichment', ingredientId: productionOnlyId, name: 'production only', requiredQuantity: 1 }),
        makeProductionRow({ id: 'formula-mismatch-row', recipeId: 'formula-mismatch', ingredientId: mismatchId, name: 'wrong formula', requiredQuantity: 1 }),
        makeProductionRow({ id: 'concept-id-one', recipeId: 'same-concept-different-id', ingredientId: riềngId, name: 'riềng', requiredQuantity: 1 }),
        makeProductionRow({ id: 'concept-id-two', recipeId: 'same-concept-different-id', ingredientId: riềngMismatchId, name: 'riềng băm', requiredQuantity: 2 }),
      ],
      v2: [
        { recipeId: 'pure-enrichment', ...makeIngredient(pureEnrichmentId, 'miso trắng', 2, 'g') },
        { recipeId: 'v2-only', ...makeIngredient(v2OnlyId, 'v2 only', 1, 'g') },
      ],
      canonicalIngredientIds: ['KNOWN_CANONICAL'],
    });
    const raw = aggregate(input);

    expect(raw.histograms.identityPopulations).toEqual({ v1Id: 1, ingEnr: 7, otherId: 1 });
    expect(raw.histograms.productionClassification).toMatchObject({
      EXACT_V1_MATCH: 1,
      ID_CONFLICT_REVIEW_REQUIRED: 1,
      PRODUCTION_ONLY_KNOWN_ID: 1,
      AMBIGUOUS: 6,
    });
    expect(raw.histograms.targetClassification.AMBIGUOUS).toBe(2);
    expect(raw.histograms.targetCandidateOrigins.mixedV1IngEnr).toBe(1);
    expect(raw.histograms.targetCrossIdConflict.present).toBe(1);
    expect(raw.histograms.generatorFormulaOccurrences).toEqual({ match: 5, mismatch: 2 });
    expect(raw.histograms.v2GeneratorFormulaOccurrences).toEqual({ match: 2, mismatch: 0 });
    expect(raw.histograms.productionIngEnrDistinctIdLineage).toMatchObject({ shared: 1, productionOnly: 6 });
    expect(raw.histograms.v2IngEnrDistinctIdLineage).toMatchObject({ shared: 1, v2Only: 1 });
    expect(raw.histograms.sameRecipeConceptIdentity.differentIds).toBe(1);
    expect(raw.histograms.crossIdConceptMultiplicity.two).toBe(1);
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('distinguishes same-ID multirow drift, exact duplicate-like tuples, and legitimate repeats', () => {
    const recipeIds = ['same-id-multirow', 'exact-duplicate', 'cross-recipe-a', 'cross-recipe-b', 'repeated-quantity'];
    const targets = [
      makeTargetIngredient('same-id-multirow', 'V1_SALT', 'salt', 10, 'g'),
      makeTargetIngredient('exact-duplicate', 'V1_PEPPER', 'pepper', 3, 'g'),
      makeTargetIngredient('cross-recipe-a', 'V1_SHARED', 'shared spice', 5, 'g'),
      makeTargetIngredient('cross-recipe-b', 'V1_SHARED', 'shared spice', 5, 'g'),
      makeTargetIngredient('repeated-quantity', 'V1_RICE', 'rice', 10, 'g'),
      makeTargetIngredient('repeated-quantity', 'V1_RICE', 'rice', 20, 'g'),
    ];
    const productionRows = [
      makeProductionRow({ id: 'multirow-a', recipeId: 'same-id-multirow', ingredientId: 'V1_SALT', name: 'salt', requiredQuantity: 11 }),
      makeProductionRow({ id: 'multirow-b', recipeId: 'same-id-multirow', ingredientId: 'V1_SALT', name: 'salt', requiredQuantity: 12 }),
      makeProductionRow({ id: 'duplicate-a', recipeId: 'exact-duplicate', ingredientId: 'V1_PEPPER', name: 'pepper', requiredQuantity: 3 }),
      makeProductionRow({ id: 'duplicate-b', recipeId: 'exact-duplicate', ingredientId: 'V1_PEPPER', name: 'pepper', requiredQuantity: 3 }),
      makeProductionRow({ id: 'cross-recipe-a-row', recipeId: 'cross-recipe-a', ingredientId: 'V1_SHARED', name: 'shared spice', requiredQuantity: 5 }),
      makeProductionRow({ id: 'cross-recipe-b-row', recipeId: 'cross-recipe-b', ingredientId: 'V1_SHARED', name: 'shared spice', requiredQuantity: 5 }),
      makeProductionRow({ id: 'repeat-10g', recipeId: 'repeated-quantity', ingredientId: 'V1_RICE', name: 'rice', requiredQuantity: 10 }),
      makeProductionRow({ id: 'repeat-20g', recipeId: 'repeated-quantity', ingredientId: 'V1_RICE', name: 'rice', requiredQuantity: 20 }),
    ];
    const raw = aggregate(makeTopologyInput({ recipeIds, targets, productionRows }));

    expect(raw.histograms.productionClassification).toMatchObject({
      EXACT_V1_MATCH: 4,
      SAME_ID_CONTENT_DRIFT: 2,
      DUPLICATE_SEMANTIC_OCCURRENCE: 2,
    });
    expect(raw.histograms.sameIdResidualGroups.two).toBe(1);
    expect(raw.histograms.sameIdResidualRows.two).toBe(2);
    expect(raw.histograms.v1IdAcrossRecipeMultiplicity).toMatchObject({ one: 3, two: 1 });
    expect(raw.histograms.v1IdPerRecipeMultiplicity).toMatchObject({ one: 2, two: 3 });
    expect(raw.histograms.sameRecipeIdentityContent).toMatchObject({ singleContent: 3, contentVariants: 2 });
    expect(raw.histograms.sameRecipeConceptContent).toMatchObject({ singleContent: 3, contentVariants: 2 });
    expect(raw.histograms.exactDuplicateLikeMultiplicity).toMatchObject({ one: 6, two: 1 });
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('accounts for zero-to-many candidates, exact-witness competition, and normalized/context keys', () => {
    const recipeIds = [
      'candidate-zero', 'candidate-one', 'candidate-two', 'candidate-five', 'exact-no-competitor',
      'exact-one-competitor', 'exact-many-competitors', 'exact-cross-id-conflict',
      'name-normalized', 'name-context', 'name-mixed', 'candidate-unrelated', 'same-concept-different-id',
    ];
    const targets = [
      makeTargetIngredient('candidate-zero', 'V1_ZERO', 'zero target', 1),
      makeTargetIngredient('candidate-one', 'V1_ONE', 'candidate one', 1),
      makeTargetIngredient('candidate-two', 'V1_TWO', 'candidate two', 1),
      makeTargetIngredient('candidate-five', 'V1_FIVE', 'candidate five', 1),
      makeTargetIngredient('exact-no-competitor', 'V1_EXACT_ZERO', 'exact zero', 1),
      makeTargetIngredient('exact-one-competitor', 'V1_EXACT_ONE', 'exact one', 1),
      makeTargetIngredient('exact-many-competitors', 'V1_EXACT_MANY', 'exact many', 1),
      makeTargetIngredient('exact-cross-id-conflict', 'V1_EXACT_CONFLICT', 'exact conflict', 1),
      makeTargetIngredient('name-normalized', 'V1_NORMALIZED', '  ＣＨＩＣＫＥＮ   BREAST ', 1),
      makeTargetIngredient('name-context', 'V1_CONTEXT', 'riềng (băm)', 1),
      makeTargetIngredient('name-mixed', 'V1_MIXED_KEYS', 'tỏi', 1),
      makeTargetIngredient('candidate-unrelated', 'V1_UNRELATED', 'unrelated target', 1),
    ];
    const productionRows = [];
    const addEnrichment = (recipeId, suffix, name, requiredQuantity = 2) => {
      productionRows.push(makeProductionRow({
        id: `candidate-${suffix}`,
        recipeId,
        ingredientId: makeGeneratedIngredientId(name),
        name,
        requiredQuantity,
      }));
    };
    addEnrichment('candidate-one', 'one', 'candidate one');
    for (let index = 0; index < 2; index++) addEnrichment('candidate-two', `two-${index}`, 'candidate two');
    for (let index = 0; index < 5; index++) addEnrichment('candidate-five', `five-${index}`, 'candidate five');

    productionRows.push(makeProductionRow({ id: 'exact-zero', recipeId: 'exact-no-competitor', ingredientId: 'V1_EXACT_ZERO', name: 'exact zero', requiredQuantity: 1 }));
    productionRows.push(makeProductionRow({ id: 'exact-one', recipeId: 'exact-one-competitor', ingredientId: 'V1_EXACT_ONE', name: 'exact one', requiredQuantity: 1 }));
    addEnrichment('exact-one-competitor', 'one-competitor', 'unrelated one');
    productionRows.push(makeProductionRow({ id: 'exact-many', recipeId: 'exact-many-competitors', ingredientId: 'V1_EXACT_MANY', name: 'exact many', requiredQuantity: 1 }));
    addEnrichment('exact-many-competitors', 'many-a', 'unrelated many a');
    addEnrichment('exact-many-competitors', 'many-b', 'unrelated many b');
    productionRows.push(makeProductionRow({ id: 'exact-conflict', recipeId: 'exact-cross-id-conflict', ingredientId: 'V1_EXACT_CONFLICT', name: 'exact conflict', requiredQuantity: 1 }));
    addEnrichment('exact-cross-id-conflict', 'cross-id', 'exact conflict', 1);

    addEnrichment('name-normalized', 'normalized', 'chicken breast');
    addEnrichment('name-context', 'context', 'riềng');
    addEnrichment('name-mixed', 'mixed-a', 'tỏi');
    addEnrichment('name-mixed', 'mixed-b', 'tỏi băm', 3);
    productionRows.push(makeProductionRow({ id: 'same-concept-a', recipeId: 'same-concept-different-id', ingredientId: 'ING_ENR_CONCEPT_A', name: 'gừng', requiredQuantity: 1 }));
    productionRows.push(makeProductionRow({ id: 'same-concept-b', recipeId: 'same-concept-different-id', ingredientId: 'ING_ENR_CONCEPT_B', name: 'gừng băm', requiredQuantity: 2 }));

    const raw = aggregate(makeTopologyInput({ recipeIds, targets, productionRows }));

    expect(raw.histograms.targetCandidateCardinality).toMatchObject({ zero: 2, one: 4, two: 4, three: 1, five: 1 });
    expect(raw.histograms.targetCandidateOrigins).toMatchObject({ none: 2, v1Only: 1, ingEnrOnly: 6, mixedV1IngEnr: 3 });
    expect(raw.histograms.targetCrossIdConflict).toEqual({ absent: 11, present: 1 });
    expect(raw.histograms.exactWitnessCompetition).toMatchObject({
      noCompetitor: 1,
      oneIngEnrCompetitor: 1,
      multipleIngEnrCompetitors: 1,
      crossIdConflict: 1,
    });
    expect(raw.histograms.targetWithoutSameIdNameCandidates).toMatchObject({ zero: 2, one: 3, two: 2, fivePlus: 1 });
    expect(raw.histograms.targetWithoutSameIdNameMatch).toMatchObject({
      none: 2,
      sameNormalizedKeyOnly: 6,
      contextCompatibleOnly: 0,
      mixedKeys: 0,
    });
    expect(raw.histograms.sameRecipeConceptIdentity.differentIds).toBe(2);
    expect(raw.histograms.crossIdConceptMultiplicity.two).toBe(2);
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('counts only strict mass/volume conversions and never assigns piece weights', () => {
    const recipeIds = ['mass-equal', 'mass-different', 'volume-equal', 'piece-to-mass', 'mass-to-piece', 'piece-nonconvertible'];
    const targets = [
      makeTargetIngredient('mass-equal', 'V1_MASS_EQUAL', 'flour', 500, 'g'),
      makeTargetIngredient('mass-different', 'V1_MASS_DIFFERENT', 'rice', 500, 'g'),
      makeTargetIngredient('volume-equal', 'V1_VOLUME_EQUAL', 'water', 1000, 'ml'),
      makeTargetIngredient('piece-to-mass', 'V1_PIECE_MASS', 'onion', 1, 'piece'),
      makeTargetIngredient('mass-to-piece', 'V1_MASS_PIECE', 'carrot', 200, 'g'),
      makeTargetIngredient('piece-nonconvertible', 'V1_PIECE_OTHER', 'egg', 1, 'piece'),
    ];
    const productionRows = [
      makeProductionRow({ id: 'mass-equal-row', recipeId: 'mass-equal', ingredientId: 'V1_MASS_EQUAL', name: 'flour', requiredQuantity: 0.5, unit: 'kg' }),
      makeProductionRow({ id: 'mass-different-row', recipeId: 'mass-different', ingredientId: 'V1_MASS_DIFFERENT', name: 'rice', requiredQuantity: 1, unit: 'kg' }),
      makeProductionRow({ id: 'volume-equal-row', recipeId: 'volume-equal', ingredientId: 'V1_VOLUME_EQUAL', name: 'water', requiredQuantity: 1, unit: 'l' }),
      makeProductionRow({ id: 'piece-to-mass-row', recipeId: 'piece-to-mass', ingredientId: 'V1_PIECE_MASS', name: 'onion', requiredQuantity: 200, unit: 'g' }),
      makeProductionRow({ id: 'mass-to-piece-row', recipeId: 'mass-to-piece', ingredientId: 'V1_MASS_PIECE', name: 'carrot', requiredQuantity: 1, unit: 'piece' }),
      makeProductionRow({ id: 'piece-nonconvertible-row', recipeId: 'piece-nonconvertible', ingredientId: 'V1_PIECE_OTHER', name: 'egg', requiredQuantity: 2, unit: 'slice' }),
    ];
    const raw = aggregate(makeTopologyInput({ recipeIds, targets, productionRows }));

    expect(raw.histograms.driftUnitRelation).toMatchObject({
      strictMassConversion: 2,
      strictVolumeConversion: 1,
      countToMass: 1,
      massToCount: 1,
      nonConvertible: 1,
    });
    expect(raw.histograms.driftConvertedQuantity).toEqual({ equal: 2, different: 1 });
    expect(raw.histograms.driftUnitRelation.multipleRows).toBe(0);
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('pairs production/V2 shapes as conservative multisets and leaves competing matches unresolved', () => {
    const recipeIds = ['shape-exact', 'shape-cross-id', 'shape-id-drift', 'shape-ambiguous', 'shape-production-only', 'shape-v2-only', 'shape-duplicate'];
    const productionRows = [
      makeProductionRow({ id: 'shape-exact-row', recipeId: 'shape-exact', ingredientId: 'V1_SHAPE_EXACT', name: 'salt', requiredQuantity: 1 }),
      makeProductionRow({ id: 'shape-cross-row', recipeId: 'shape-cross-id', ingredientId: 'ING_ENR_SHAPE_P', name: 'pepper', requiredQuantity: 2 }),
      makeProductionRow({ id: 'shape-id-drift-row', recipeId: 'shape-id-drift', ingredientId: 'ING_ENR_SAME', name: 'rice', requiredQuantity: 1 }),
      makeProductionRow({ id: 'shape-ambiguous-row', recipeId: 'shape-ambiguous', ingredientId: 'ING_ENR_AMBIG_P', name: 'ambiguous payload', requiredQuantity: 3 }),
      makeProductionRow({ id: 'shape-production-only-row', recipeId: 'shape-production-only', ingredientId: 'ING_ENR_ONLY_P', name: 'production only shape', requiredQuantity: 4 }),
      ...Array.from({ length: 3 }, (_, index) => makeProductionRow({
        id: `shape-duplicate-${index}`, recipeId: 'shape-duplicate', ingredientId: 'ING_ENR_DUP', name: 'same tuple', requiredQuantity: 5,
      })),
    ];
    const v2 = [
      { recipeId: 'shape-exact', ...makeIngredient('V1_SHAPE_EXACT', 'salt', 1) },
      { recipeId: 'shape-cross-id', ...makeIngredient('ING_ENR_SHAPE_V', 'pepper', 2) },
      { recipeId: 'shape-id-drift', ...makeIngredient('ING_ENR_SAME', 'rice', 2) },
      { recipeId: 'shape-ambiguous', ...makeIngredient('ING_ENR_AMBIG_A', 'ambiguous payload', 3) },
      { recipeId: 'shape-ambiguous', ...makeIngredient('ING_ENR_AMBIG_B', 'ambiguous payload', 3) },
      { recipeId: 'shape-v2-only', ...makeIngredient('ING_ENR_ONLY_V2', 'V2-only shape', 6) },
      { recipeId: 'shape-duplicate', ...makeIngredient('ING_ENR_DUP', 'same tuple', 5) },
      { recipeId: 'shape-duplicate', ...makeIngredient('ING_ENR_DUP', 'same tuple', 5) },
    ];
    const raw = aggregate(makeTopologyInput({ recipeIds, productionRows, v2 }));

    expect(raw.histograms.productionVsV2Shape).toEqual({
      exact: 3,
      contentEquivalentDifferentId: 1,
      contentEquivalentSameId: 0,
      idMatchContentDifferent: 1,
      only: 2,
      unresolved: 1,
    });
    expect(raw.histograms.v2VsProductionShape).toEqual({
      exact: 3,
      contentEquivalentDifferentId: 1,
      contentEquivalentSameId: 0,
      idMatchContentDifferent: 1,
      only: 1,
      unresolved: 2,
    });
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('reports every per-recipe delta bucket and order statistic', () => {
    const recipeIds = ['delta-a', 'delta-b', 'delta-c'];
    const targets = [
      makeTargetIngredient('delta-a', 'V1_A', 'a target'),
      makeTargetIngredient('delta-b', 'V1_B1', 'b target one'),
      makeTargetIngredient('delta-b', 'V1_B2', 'b target two'),
      makeTargetIngredient('delta-b', 'V1_B3', 'b target three'),
      makeTargetIngredient('delta-c', 'V1_C1', 'c target one'),
      makeTargetIngredient('delta-c', 'V1_C2', 'c target two'),
    ];
    const productionRows = [
      makeProductionRow({ id: 'delta-a-v1', recipeId: 'delta-a', ingredientId: 'V1_A', name: 'a target' }),
      makeProductionRow({ id: 'delta-a-known', recipeId: 'delta-a', ingredientId: 'KNOWN_DELTA', name: 'known addition' }),
      makeProductionRow({ id: 'delta-b-enr', recipeId: 'delta-b', ingredientId: 'ING_ENR_DELTA', name: 'unresolved addition' }),
    ];
    const v2 = [
      { recipeId: 'delta-b', ...makeIngredient('V2_B1', 'b v2 one') },
      { recipeId: 'delta-b', ...makeIngredient('V2_B2', 'b v2 two') },
      ...Array.from({ length: 4 }, (_, index) => ({ recipeId: 'delta-c', ...makeIngredient(`V2_C${index}`, `c v2 ${index}`) })),
    ];
    const raw = aggregate(makeTopologyInput({
      recipeIds, targets, productionRows, v2, canonicalIngredientIds: ['KNOWN_DELTA'],
    }));

    expect(raw.histograms.productionMinusV1).toMatchObject({ plusOne: 1, minusFourToMinusTwo: 2 });
    expect(raw.histograms.productionMinusV2).toMatchObject({ plusTwoToPlusFour: 1, minusOne: 1, minusFourToMinusTwo: 1 });
    expect(raw.histograms.v2MinusV1).toMatchObject({ minusOne: 2, plusTwoToPlusFour: 1 });
    expect(raw.distributions).toEqual({
      productionMinusV1: { min: -2, max: 1, median: -2, p90: 1, p95: 1, p99: 1 },
      productionMinusV2: { min: -4, max: 2, median: -1, p90: 2, p95: 2, p99: 2 },
      v2MinusV1: { min: -1, max: 2, median: -1, p90: 2, p95: 2, p99: 2 },
    });
    for (const histogram of [raw.histograms.productionMinusV1, raw.histograms.productionMinusV2, raw.histograms.v2MinusV1]) {
      expect(Object.values(histogram).reduce((sum, count) => sum + count, 0)).toBe(recipeIds.length);
    }
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('derives the 65-row residual as 6 membership-plus-content and 59 name-plus-semantics rows', () => {
    const recipeIds = Array.from({ length: 32 }, (_, index) => `residual-${index}`);
    const targets = [];
    const productionRows = [];
    let physicalIndex = 0;
    const addDrift = (target, name, quantity) => productionRows.push(makeProductionRow({
      id: `residual-physical-${physicalIndex++}`,
      recipeId: target.recipeId,
      ingredientId: target.ingredientId,
      name,
      requiredQuantity: quantity,
      unit: target.unit,
    }));

    for (let groupIndex = 0; groupIndex < 32; groupIndex++) {
      const target = makeTargetIngredient(recipeIds[groupIndex], `V1_RESIDUAL_${groupIndex}`, `residual target ${groupIndex}`, 10, 'g');
      targets.push(target);
      const size = groupIndex === 31 ? 3 : 2;
      const membershipPlusContent = groupIndex < 3;
      for (let occurrence = 0; occurrence < size; occurrence++) {
        const name = membershipPlusContent ? target.name : `${target.name} variant ${occurrence + 1}`;
        addDrift(target, name, 11 + groupIndex + occurrence);
      }
    }
    const raw = aggregate(makeTopologyInput({ recipeIds, targets, productionRows }));

    expect(raw.accounting.weightedResidualRows).toBe(65);
    expect(raw.histograms.sameIdResidualRows).toEqual({ one: 0, two: 62, three: 3, fourPlus: 0 });
    expect(raw.histograms.sameIdResidualGroups).toEqual({ one: 0, two: 31, three: 1, fourPlus: 0 });
    expect(raw.histograms.sameIdResidualDrift).toEqual({ membershipPlusContent: 6, namePlusSemantics: 59, other: 0 });
    expect(raw.histograms.sameIdResidualGroupMembership).toEqual({ allRowsResidual: 32, someRowsNotResidual: 0 });
    expect(assertTopologyAccounting(raw)).toBe(true);
  });
});

describe('T21RC2T committed offline source and deterministic scale', () => {
  let catalogs;

  beforeAll(async () => {
    catalogs = await loadCertifiedCatalogs();
  }, 30_000);

  it('loads certified V1 and committed Refresh V2 and derives all 4,233 generator matches', () => {
    const targets = catalogs.targetRecipes.flatMap((recipe) => recipe.ingredients);
    const sourceEnrichment = catalogs.v2SourceRecipes.flatMap((recipe) => recipe.ingredients)
      .filter((ingredient) => ingredient.canonicalIngredientId.startsWith('ING_ENR_'));
    const formulaMatches = sourceEnrichment.filter((ingredient) => ingredient.canonicalIngredientId === makeGeneratedIngredientId(ingredient.sourceName));

    expect(catalogs.authorityProof.releaseId).toBe(catalogs.releaseManifest.releaseId);
    expect(catalogs.recipeIds).toHaveLength(500);
    expect(targets).toHaveLength(2702);
    expect(catalogs.v2Recipes.reduce((count, recipe) => count + recipe.ingredients.length, 0)).toBe(6766);
    expect(sourceEnrichment).toHaveLength(4233);
    expect(formulaMatches).toHaveLength(4233);
  });

  it('aggregates actual certified V1 and committed V2 inputs without production evidence', () => {
    const input = makeTopologyInput({
      recipeIds: catalogs.recipeIds,
      targetRecipes: catalogs.targetRecipes,
      v2Recipes: catalogs.v2Recipes,
      canonicalIngredientIds: catalogs.canonicalIngredientIds,
      reconciliation: catalogs.reconciliation,
    });
    const raw = aggregate(input);

    expect(raw.populations).toEqual({
      recipeCount: 500,
      productionOccurrenceCount: 0,
      targetOccurrenceCount: 2702,
      v2OccurrenceCount: 6766,
    });
    expect(raw.histograms.v2GeneratorFormulaOccurrences).toEqual({ match: 4233, mismatch: 0 });
    expect(assertTopologyAccounting(raw)).toBe(true);
  });

  it('bounds the exact forensic-scale input and produces a permutation-stable aggregate', () => {
    const input = makeForensicScaleInput(catalogs);
    expect(input.recipeIds).toHaveLength(500);
    expect(input.targetRecipes.reduce((count, recipe) => count + recipe.ingredients.length, 0)).toBe(2702);
    expect(input.productionRows).toHaveLength(6720);
    expect(input.v2Recipes.reduce((count, recipe) => count + recipe.ingredients.length, 0)).toBe(6766);

    const reversed = permutation(input);
    const rssBefore = process.memoryUsage().rss;
    const started = performance.now();
    const raw = aggregate(input);
    const reversedRaw = aggregate(reversed);
    const elapsedMs = performance.now() - started;
    const rssGrowth = Math.max(0, process.memoryUsage().rss - rssBefore);
    const receipt = createPublicReceipt(raw);
    const reversedReceipt = createPublicReceipt(reversedRaw);
    const serializedReceipt = serializePublicReceipt(receipt);

    expect(elapsedMs).toBeLessThan(60_000);
    expect(rssGrowth).toBeLessThan(768 * 1024 * 1024);
    expect(JSON.stringify(raw)).toBe(JSON.stringify(reversedRaw));
    expect(JSON.stringify(raw).length).toBeLessThan(100_000);
    expect(serializedReceipt).toBe(serializePublicReceipt(reversedReceipt));
    expect(validatePublicReceipt(receipt, raw, { requireForensic: true })).toBe(true);
    expect(validatePublicReceipt(reversedReceipt, reversedRaw, { requireForensic: true })).toBe(true);
    expect(serializedReceipt).not.toContain('scale target concept');
    expect(serializedReceipt).not.toContain('scale enrichment');
    expect(raw.populations).toEqual({
      recipeCount: 500,
      productionOccurrenceCount: 6720,
      targetOccurrenceCount: 2702,
      v2OccurrenceCount: 6766,
    });
    expect(raw.histograms.identityPopulations).toEqual({ v1Id: 2468, ingEnr: 4252, otherId: 0 });
    expect(raw.histograms.productionClassification).toMatchObject({
      EXACT_V1_MATCH: 26,
      SAME_ID_CONTENT_DRIFT: 1793,
      PRODUCTION_ONLY_KNOWN_ID: 649,
      ID_CONFLICT_REVIEW_REQUIRED: 20,
      AMBIGUOUS: 4232,
    });
    expect(raw.histograms.targetClassification.AMBIGUOUS).toBe(2702);
    expect(raw.histograms.v2GeneratorFormulaOccurrences).toEqual({ match: 4233, mismatch: 0 });
    expect(raw.histograms.sameIdResidualRows).toEqual({ one: 0, two: 62, three: 3, fourPlus: 0 });
    expect(raw.histograms.sameIdResidualDrift).toEqual({ membershipPlusContent: 6, namePlusSemantics: 59, other: 0 });
    expect(assertTopologyAccounting(raw)).toBe(true);
    expect(assertForensicTopologyContract(raw)).toBe(true);
  }, 60_000);
});
