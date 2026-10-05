import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { ingredientConceptKey } from '../../packages/recipes/src/refresh/normalize.ts';
import { normalizeIngredientAlias } from '../../packages/domain/src/foundation.ts';
import { aggregateIdentityTopology, assertTopologyAccounting } from '../../scripts/t21rc2t-identity-topology.mjs';
import { createPublicReceipt, serializePublicReceipt, validatePublicReceipt, validatePublicReceiptSchema } from '../../scripts/t21rc2t-production-receipt.mjs';

const normalizers = { conceptKey: ingredientConceptKey, normalizeName: normalizeIngredientAlias };
const marker = 'UNMISTAKABLE_PRIVATE_C2T_847293';
const total = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);

function fixture(count = 1) {
  const ingredients = Array.from({ length: count }, (_, n) => ({ ingredientId: `SYNTHETIC_${n}`, name: `Synthetic ${n}`, requiredQuantity: n + 1, unit: 'g' }));
  const targetRecipes = [{ id: 'synthetic', ingredients }];
  return { recipeIds: ['synthetic'], targetRecipes, v2Recipes: structuredClone(targetRecipes), productionRows: ingredients.map((ingredient, n) => ({
    id: `physical-${n}`, recipe_id: 'synthetic', ingredient_id: ingredient.ingredientId, name: ingredient.name,
    required_quantity: ingredient.requiredQuantity, unit: ingredient.unit, is_optional: 0,
  })) };
}

function raw(input = fixture()) { return aggregateIdentityTopology(input, normalizers); }
function expectSafeFailure(run, code) {
  let failure;
  try { run(); } catch (error) { failure = error; }
  expect(failure).toBeInstanceOf(Error);
  expect(failure.message).toBe(code);
  expect(failure.code).toBe(code);
  expect(failure.cause).toBeUndefined();
  expect(JSON.stringify(failure)).not.toContain(marker);
}

describe('C2T aggregate privacy', () => {
  it.each(['recipe', 'ingredient', 'name', 'physical', 'quantity', 'unit', 'candidateKey'])('does not publish the injected %s marker or its identity digests', (field) => {
    const input = fixture();
    const row = input.productionRows[0];
    let secret = marker;
    if (field === 'recipe') {
      input.recipeIds[0] = marker; row.recipe_id = marker; input.targetRecipes[0].id = marker; input.v2Recipes[0].id = marker;
    } else if (field === 'ingredient') {
      row.ingredient_id = marker; input.targetRecipes[0].ingredients[0].ingredientId = marker; input.v2Recipes[0].ingredients[0].ingredientId = marker;
    } else if (field === 'name') row.name = marker;
    else if (field === 'physical') row.id = marker;
    else if (field === 'quantity') { row.required_quantity = 847293.112233; secret = String(row.required_quantity); }
    else if (field === 'unit') row.unit = marker;
    const options = field === 'candidateKey' ? { ...normalizers, conceptKey: () => marker } : normalizers;
    const stdout = vi.spyOn(process.stdout, 'write'), stderr = vi.spyOn(process.stderr, 'write');
    try {
      const aggregate = aggregateIdentityTopology(input, options), receipt = createPublicReceipt(aggregate);
      validatePublicReceipt(receipt, aggregate);
      const bytes = serializePublicReceipt(receipt);
      for (const value of [secret, marker, createHash('sha256').update(secret).digest('hex'), createHash('sha256').update(`source-name:${ingredientConceptKey(secret)}`).digest('hex').slice(0, 16).toUpperCase()]) expect(bytes).not.toContain(value);
      expect(stdout).not.toHaveBeenCalled(); expect(stderr).not.toHaveBeenCalled();
      expect(bytes).not.toMatch(/\b[0-9a-f]{64}\b|ING_ENR_[0-9A-F]{16}/);
    } finally { stdout.mockRestore(); stderr.mockRestore(); }
  });

  it.each([1, 2, 3, 4])('suppresses the whole partition for a %i bucket, including complementary zeros', (count) => {
    const receipt = createPublicReceipt(raw(fixture(count)));
    const histogram = receipt.histograms.identityPopulations;
    expect(Object.values(histogram.buckets)).toEqual(['SUPPRESSED', 'SUPPRESSED', 'SUPPRESSED']);
    expect(histogram.suppressedBucketCount).toBe(3);
    expect(histogram.total).toBe('SUPPRESSED');
    expect(histogram.suppressedOccurrenceTotal).toBe('SUPPRESSED');
  });

  it('keeps zero and >=5 buckets only when no rare bucket exists', () => {
    const histogram = createPublicReceipt(raw(fixture(5))).histograms.identityPopulations;
    expect(histogram.buckets).toEqual({ v1Id: 5, ingEnr: 0, otherId: 0 });
    expect(histogram.total).toBe(5); expect(histogram.suppressedBucketCount).toBe(0);
  });

  it('hides a large complementary bucket as well as its rare neighbor', () => {
    const input = fixture(5);
    input.productionRows.push({ ...input.productionRows[0], id: 'extra', ingredient_id: 'ING_ENR_0000000000000000', name: 'Different enrichment' });
    const histogram = createPublicReceipt(raw(input)).histograms.identityPopulations;
    expect(Object.values(histogram.buckets).every((value) => value === 'SUPPRESSED')).toBe(true);
    expect(histogram.suppressedOccurrenceTotal).toBe(6);
    expect(histogram.total).toBe(6);
  });

  it('keeps exact private accounting despite suppression and rejects loss hidden inside it', () => {
    const aggregate = raw(), receipt = createPublicReceipt(aggregate);
    expect(validatePublicReceipt(receipt, aggregate)).toBe(true);
    aggregate.histograms.targetCandidateCardinality.one++;
    expectSafeFailure(() => validatePublicReceipt(receipt, aggregate), 'T21RC2T_ACCOUNTING_REJECTED');
    expectSafeFailure(() => validatePublicReceipt(receipt), 'T21RC2T_ACCOUNTING_REJECTED');
  });

  it('rejects an omitted exact-witness competition breakdown before receipt creation', () => {
    const aggregate = raw();
    expect(aggregate.histograms.productionClassification.EXACT_V1_MATCH).toBe(1);
    aggregate.histograms.exactWitnessCompetition.noCompetitor = 0;
    expectSafeFailure(() => assertTopologyAccounting(aggregate), 'T21RC2T_ACCOUNTING_REJECTED');
    expectSafeFailure(() => createPublicReceipt(aggregate), 'T21RC2T_ACCOUNTING_REJECTED');
  });

  it('counts repository concept aliases as equal keys rather than context-only matches', () => {
    const input = fixture();
    input.targetRecipes[0].ingredients[0].name = 'cu rieng';
    input.productionRows[0].ingredient_id = 'ING_ENR_0000000000000000';
    input.productionRows[0].name = 'riềng';
    expect(ingredientConceptKey('cu rieng')).toBe(ingredientConceptKey('riềng'));
    expect(normalizeIngredientAlias('cu rieng')).not.toBe(normalizeIngredientAlias('riềng'));
    const aggregate = raw(input);
    expect(aggregate.histograms.targetWithoutSameIdNameMatch.sameNormalizedKeyOnly).toBe(1);
    expect(aggregate.histograms.targetWithoutSameIdNameMatch.contextCompatibleOnly).toBe(0);
  });

  it('keeps unequal context-compatible keys and mixed concept keys separately accounted', () => {
    const input = fixture(), name = 'Synthetic context';
    input.targetRecipes[0].ingredients[0].name = name;
    input.productionRows[0].ingredient_id = 'ING_ENR_0000000000000000';
    input.productionRows[0].name = `${name} variant`;
    expect(ingredientConceptKey(name)).not.toBe(ingredientConceptKey(`${name} variant`));
    expect(raw(input).histograms.targetWithoutSameIdNameMatch.contextCompatibleOnly).toBe(1);
    input.productionRows.push({ ...input.productionRows[0], id: 'second', ingredient_id: 'ING_ENR_1111111111111111', name });
    expect(raw(input).histograms.targetWithoutSameIdNameMatch.mixedKeys).toBe(1);
  });

  it('rejects a schema-valid receipt that does not match private recomputation', () => {
    const aggregate = raw(fixture(5)), receipt = createPublicReceipt(aggregate);
    receipt.distributions.productionMinusV2.max = 12;
    expect(validatePublicReceiptSchema(receipt)).toBe(true);
    expectSafeFailure(() => validatePublicReceipt(receipt, aggregate), 'T21RC2T_ACCOUNTING_REJECTED');
  });

  it('emits only fixed error codes when normalizers throw private upstream output', () => {
    expectSafeFailure(() => aggregateIdentityTopology(fixture(), { ...normalizers, conceptKey: () => { throw new Error(marker); } }), 'T21RC2T_TOPOLOGY_REJECTED');
    expectSafeFailure(() => assertTopologyAccounting({ [marker]: marker }), 'T21RC2T_ACCOUNTING_REJECTED');
  });

  it('rejects accessors without invoking them or their private errors', () => {
    const input = fixture(), getter = vi.fn(() => { throw new Error(marker); });
    Object.defineProperty(input.productionRows[0], 'name', { get: getter, enumerable: true });
    expectSafeFailure(() => aggregateIdentityTopology(input, normalizers), 'T21RC2T_TOPOLOGY_REJECTED');
    expect(getter).not.toHaveBeenCalled();
    const receipt = createPublicReceipt(raw());
    Object.defineProperty(receipt, 'histograms', { get: getter, enumerable: true });
    expectSafeFailure(() => serializePublicReceipt(receipt), 'T21RC2T_RECEIPT_SCHEMA_REJECTED');
    expect(getter).not.toHaveBeenCalled();
  });
});

describe('C2T closed receipt schema', () => {
  it('closes every object definition and has no array, individual digest, or free string schema', () => {
    const schema = JSON.parse(readFileSync(new URL('../../docs/ai/recipe-catalog/T21RC2T_IDENTITY_TOPOLOGY_RECEIPT_SCHEMA.json', import.meta.url), 'utf8'));
    function visit(node) {
      if (node && typeof node === 'object') {
        if (node.type === 'object') expect(node.additionalProperties).toBe(false);
        expect(node.type).not.toBe('array');
        if (node.type === 'string') expect(node.enum || node.const).toBeDefined();
        expect(node.pattern).toBeUndefined();
        for (const value of Object.values(node)) visit(value);
      }
    }
    visit(schema);
  });

  it('rejects a private extra field at every public object boundary', () => {
    const original = createPublicReceipt(raw(fixture(5))), paths = [];
    function visit(node, path = []) {
      if (node && typeof node === 'object') {
        paths.push(path);
        for (const [field, value] of Object.entries(node)) visit(value, [...path, field]);
      }
    }
    visit(original);
    expect(paths.length).toBeGreaterThan(100);
    for (const path of paths) {
      const receipt = structuredClone(original), object = path.reduce((node, field) => node[field], receipt);
      object[marker] = marker;
      expectSafeFailure(() => validatePublicReceiptSchema(receipt), 'T21RC2T_RECEIPT_SCHEMA_REJECTED');
    }
  });

  it.each([true, -1, 0.5, 1, 4, 10000001, NaN, Infinity, marker, [marker], { value: marker }])('rejects an unsafe bucket value %j without reflecting it', (value) => {
    const receipt = createPublicReceipt(raw(fixture(5)));
    receipt.histograms.identityPopulations.buckets.v1Id = value;
    expectSafeFailure(() => validatePublicReceiptSchema(receipt), 'T21RC2T_RECEIPT_SCHEMA_REJECTED');
  });

  it.each(['total', 'suppressedBucketCount', 'suppressedOccurrenceTotal'])('rejects inconsistent suppression metadata %s', (field) => {
    const receipt = createPublicReceipt(raw());
    receipt.histograms.identityPopulations[field] = 0;
    expectSafeFailure(() => validatePublicReceiptSchema(receipt), 'T21RC2T_RECEIPT_SCHEMA_REJECTED');
  });

  it('serializes deterministic canonical bytes without timestamps or salts', () => {
    const aggregate = raw(fixture(5)), a = createPublicReceipt(aggregate), b = createPublicReceipt(aggregate);
    expect(serializePublicReceipt(a)).toBe(serializePublicReceipt(b));
    expect(total(aggregate.histograms.targetCandidateCardinality)).toBe(5);
    expect(serializePublicReceipt(a)).not.toMatch(/timestamp|salt|digest|sha256/i);
  });
});
