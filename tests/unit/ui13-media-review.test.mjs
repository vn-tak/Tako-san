import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  REVIEW_FIELDS,
  REVIEW_MAX_DRAFT_BYTES,
  createReviewDraft,
  validateReviewDataset,
  validateReviewDraft,
} from '../../scripts/ui13/review-contract.mjs';
const dataset = JSON.parse(
  readFileSync(new URL('../../docs/ui-rebuild/round-13/review-data.json', import.meta.url), 'utf8'),
);
const review = () => createReviewDraft(dataset);
const validClaim = (record) =>
  Object.assign(record, {
    decision: 'owner_reviewed',
    candidateAssetId: 'asset-02',
    creator: 'Example creator',
    source: 'Synthetic fixture source receipt',
    rights: 'Synthetic fixture permission receipt',
    subjectNotes: 'Human claim fixture, not approval',
    cropNotes: 'Fixture checked both crop ratios',
    reviewer: 'Fixture reviewer',
    reviewedAt: '2026-10-11',
  });
describe('UI13 local review draft boundaries', () => {
  it('keeps every unknown record pending and promotion unauthorized', () => {
    const draft = review();
    expect(validateReviewDraft(draft, dataset)).toEqual([]);
    expect(draft.records).toHaveLength(24);
    expect(draft.records.every((r) => r.decision === 'pending')).toBe(true);
    expect(draft.promotionAuthorized).toBe(false);
  });
  it('refuses a cross-dataset import without guessing matches', () => {
    const draft = review();
    draft.datasetId = 'f'.repeat(64);
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it.each(['promotionAuthorized', 'extra'])('does not accept the %s authority override', (key) => {
    const draft = review();
    draft[key] = true;
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it('requires each expected recipe exactly once', () => {
    const draft = review();
    draft.records[1] = structuredClone(draft.records[0]);
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it('rejects missing records rather than dropping review state', () => {
    const draft = review();
    draft.records.pop();
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it('rejects an unknown recipe and unknown field', () => {
    const draft = review();
    draft.records[0].recipeId = 'outside';
    draft.records[0].publish = true;
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it.each([
    '../../private.png',
    'https://example.test/photo.jpg',
    'javascript:alert(1)',
    'asset-99',
  ])('refuses asset reference %s', (value) => {
    const draft = review();
    draft.records[0].candidateAssetId = value;
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it('cannot mark a candidate without choosing a known asset', () => {
    const draft = review();
    draft.records[0].decision = 'candidate';
    expect(
      validateReviewDraft(draft, dataset).some((issue) => issue.field === 'candidateAssetId'),
    ).toBe(true);
  });
  it('requires evidence fields for an owner-reviewed claim', () => {
    const draft = review();
    draft.records[0].decision = 'owner_reviewed';
    expect(validateReviewDraft(draft, dataset).map((r) => r.field)).toEqual(
      expect.arrayContaining([
        'candidateAssetId',
        'creator',
        'source',
        'rights',
        'subjectNotes',
        'cropNotes',
        'reviewer',
        'reviewedAt',
      ]),
    );
  });
  it.each(['creator', 'source', 'rights', 'subjectNotes', 'cropNotes', 'reviewer', 'reviewedAt'])(
    'rejects a claim missing %s',
    (field) => {
      const draft = review();
      validClaim(draft.records[0]);
      draft.records[0][field] = ' ';
      expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
    },
  );
  it('accepts a complete claim as data while leaving promotion false and originals unknown', () => {
    const draft = review();
    validClaim(draft.records[0]);
    expect(validateReviewDraft(draft, dataset)).toEqual([]);
    expect(draft.promotionAuthorized).toBe(false);
    expect(dataset.assets.every((asset) => asset.rightsStatus === 'unknown')).toBe(true);
  });
  it.each(['2026-02-30', '2026-13-01', 'not-a-date'])('rejects impossible date %s', (date) => {
    const draft = review();
    validClaim(draft.records[0]);
    draft.records[0].reviewedAt = date;
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it('requires a rejection reason and safely rejects non-string notes', () => {
    const draft = review();
    draft.records[0].decision = 'rejected';
    draft.records[0].notes = 0;
    expect(() => validateReviewDraft(draft, dataset)).not.toThrow();
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
  });
  it('retains literal markup in notes for text-only rendering', () => {
    const draft = review();
    draft.records[0].notes = '<img src=x onerror=alert(1)>';
    expect(validateReviewDraft(draft, dataset)).toEqual([]);
    expect(draft.records[0].notes).toContain('<img');
  });
  it('can reimport a complete maximum-length draft including JSON escape expansion', () => {
    const draft = review();
    for (const record of draft.records) {
      for (const field of REVIEW_FIELDS.filter(
        (key) => !['recipeId', 'decision', 'candidateAssetId', 'reviewedAt'].includes(key),
      ))
        record[field] = '\u0000'.repeat(2000);
      record.reviewedAt = '2026-10-11';
    }
    expect(validateReviewDraft(draft, dataset)).toEqual([]);
    const encoded = JSON.stringify(draft, null, 2) + '\n';
    expect(Buffer.byteLength(encoded)).toBeGreaterThan(256000);
    expect(Buffer.byteLength(encoded)).toBeLessThan(REVIEW_MAX_DRAFT_BYTES);
    expect(validateReviewDraft(JSON.parse(encoded), dataset)).toEqual([]);
  });
  it('rejects oversized fields and missing shapes', () => {
    const draft = review();
    draft.records[0].notes = 'x'.repeat(2001);
    expect(validateReviewDraft(draft, dataset)).not.toEqual([]);
    expect(validateReviewDraft(null, dataset)).not.toEqual([]);
    expect(validateReviewDraft({ ...draft, records: null }, dataset)).not.toEqual([]);
  });
});
describe('UI13 immutable local dataset constraints', () => {
  it('has 24 distinct recipes/8 assets/4 permitted current photos', () => {
    expect(validateReviewDataset(dataset)).toEqual([]);
    expect(dataset.recipes.filter((r) => r.current.assetId)).toHaveLength(4);
  });
  it.each([
    'public/../private.webp',
    'public/frigo/../../private.webp',
    '/private.webp',
    'public/frigo/%2e%2e/private.webp',
  ])('rejects unsafe original path %s', (path) => {
    const bad = structuredClone(dataset);
    bad.assets[0].path = path;
    expect(validateReviewDataset(bad)).not.toEqual([]);
  });
  it('rejects substituted URL, duplicate ID and fabricated rights state', () => {
    const bad = structuredClone(dataset);
    bad.assets[0].url = 'https://example.test/image';
    bad.assets[0].rightsStatus = 'approved';
    bad.assets[1].assetId = bad.assets[0].assetId;
    expect(validateReviewDataset(bad)).not.toEqual([]);
  });
  it('rejects current preview that bypasses resolver into remote imagery', () => {
    const bad = structuredClone(dataset);
    bad.recipes[0].current.source = 'legacy_external';
    expect(validateReviewDataset(bad)).not.toEqual([]);
  });
});
