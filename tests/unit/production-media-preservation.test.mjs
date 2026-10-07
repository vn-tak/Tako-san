import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SqliteD1 } from '../helpers/sqlite-d1';
import { mapRecipeMediaRow } from '../../packages/db/src/recipe-media';
import { auditReadyRecipeMediaRecord, isCanonicalRecipeIdShape, isRecipeMediaMimeType,
  isSha256Hex, isTrustedRecipeMediaStorageKey } from '../../packages/recipes/src/recipe-media';
import { APPROVED_BATCHES_REGISTRY, CATALOG_RELEASE_MANIFEST, catalogQuery, verifyCatalogAtTip } from '../../scripts/d1-migration-check.mjs';
import {
  captureRecipeMedia, recipeMediaQuery, recipeMediaSchemaQuery, verifyRecipeMediaPreserved,
} from '../../scripts/production-media-preservation.mjs';

const tip = '0038_auth_onboarding_completion.sql';
const release = JSON.parse(readFileSync(CATALOG_RELEASE_MANIFEST, 'utf8'));
const registry = JSON.parse(readFileSync(APPROVED_BATCHES_REGISTRY, 'utf8'));
const ok = (results) => ({ success: true, results });
const pipeline = { mapRecipeMediaRow, auditReadyRecipeMediaRecord, isCanonicalRecipeIdShape, isRecipeMediaMimeType, isSha256Hex, isTrustedRecipeMediaStorageKey };
let db;
function evidence() {
  return {
    pipeline,
    catalog: catalogQuery().split(';').map((sql) => ok(db.query(sql))),
    media: [ok(db.query(recipeMediaQuery()))],
    schema: [ok(db.query(recipeMediaSchemaQuery()))],
  };
}
function populateReady() {
  db.seed(`UPDATE recipe_media SET status = 'ready', source_type = 'generated',
    storage_key = 'recipes/' || recipe_id || '/hero/v1.webp', mime_type = 'image/webp',
    width = 1024, height = 768, content_length = 1234, content_hash = '${'a'.repeat(64)}',
    source_reference = 'private-source-reference', generator_provider = 'private-provider',
    generator_model = 'private-model', prompt_hash = '${'b'.repeat(64)}'`);
}
beforeEach(() => { db = new SqliteD1({ through: tip }); });
afterEach(() => db.close());

describe('0039 recipe media metadata preservation', () => {
  it.each(['pending', 'ready'])('preserves the complete real %s metadata projection across immutable 0039', (state) => {
    if (state === 'ready') populateReady();
    const captured = evidence();
    const changes = db.query('SELECT total_changes() AS count')[0].count;
    const before = captureRecipeMedia(captured);
    expect(before).toMatchObject({
      status: 'MEDIA_METADATA_CAPTURE_PASS', rows: 500, ready: state === 'ready' ? 500 : 0,
      r2Availability: 'NOT_REVERIFIED', captureConsistency: 'OBSERVED_NON_ATOMIC',
    });
    expect(db.query('SELECT total_changes() AS count')[0].count).toBe(changes);
    db.seed(readFileSync('migrations/0039_meal_composition_v2.sql', 'utf8'));
    const post = evidence();
    expect(verifyCatalogAtTip(release, '0039_meal_composition_v2.sql', post.catalog, registry).releaseComplete).toBe(true);
    expect(verifyRecipeMediaPreserved({ before, ...post })).toMatchObject({
      status: 'MEDIA_METADATA_PRESERVED', metadataSha256: before.metadataSha256,
      schemaSha256: before.schemaSha256, beforeMetadataSha256: before.metadataSha256,
    });
    expect(JSON.stringify(before)).not.toMatch(/private-source|private-provider|private-model|storage_key|generator_model|prompt_hash/);
  });

  it('rejects a same-count valid metadata edit that preserves catalog authority', () => {
    populateReady();
    const before = captureRecipeMedia(evidence());
    db.seed("UPDATE recipe_media SET generator_model = 'changed-model' WHERE id = (SELECT id FROM recipe_media ORDER BY id LIMIT 1)");
    const post = evidence();
    expect(captureRecipeMedia(post).rows).toBe(before.rows);
    expect(() => verifyRecipeMediaPreserved({ before, ...post })).toThrow(/changed across/);
  });

  it('rejects an extra valid pending successor, even while active ready heroes remain valid', () => {
    populateReady();
    const before = captureRecipeMedia(evidence());
    db.seed("INSERT INTO recipe_media(id,recipe_id,role,version,status) SELECT id || '_successor',recipe_id,role,2,'pending' FROM recipe_media ORDER BY id LIMIT 1");
    const post = evidence();
    expect(captureRecipeMedia(post).rows).toBe(501);
    expect(() => verifyRecipeMediaPreserved({ before, ...post })).toThrow(/changed across/);
  });

  it('rejects a schema change even when metadata is byte-identical and the required schema remains present', () => {
    const before = captureRecipeMedia(evidence());
    db.seed('CREATE INDEX extra_recipe_media_index ON recipe_media(updated_at)');
    const post = evidence();
    expect(captureRecipeMedia(post).metadataSha256).toBe(before.metadataSha256);
    expect(() => verifyRecipeMediaPreserved({ before, ...post })).toThrow(/changed across/);
  });

  it('rejects actual invalid private metadata after a valid aggregate capture', () => {
    const captured = evidence();
    db.seed('UPDATE recipe_media SET version = 1000001 WHERE id = (SELECT id FROM recipe_media ORDER BY id LIMIT 1)');
    captured.media = [ok(db.query(recipeMediaQuery()))];
    expect(captured.catalog[0].results[0].media_invalid_metadata).toBe(0);
    expect(() => captureRecipeMedia(captured)).toThrow(/actual domain validation/);
  });

  it('recomputes hero coverage from private rows after a valid aggregate capture', () => {
    const captured = evidence();
    db.seed("UPDATE recipe_media SET status = 'rejected' WHERE id = (SELECT id FROM recipe_media ORDER BY id LIMIT 1)");
    captured.media = [ok(db.query(recipeMediaQuery()))];
    expect(captured.catalog[0].results[0].recipes_without_active_hero).toBe(0);
    expect(() => captureRecipeMedia(captured)).toThrow(/active hero/);
  });

  it.each(['missing', 'duplicate', 'reversed', 'extra-field', 'unsafe-number', 'wrong-owner', 'count-drift'])('rejects %s private capture evidence', (kind) => {
    const captured = evidence();
    if (kind === 'missing') captured.media = [];
    if (kind === 'duplicate') captured.media[0].results[1] = structuredClone(captured.media[0].results[0]);
    if (kind === 'reversed') captured.media[0].results.reverse();
    if (kind === 'extra-field') captured.media[0].results[0].secret = 'must-not-leak';
    if (kind === 'unsafe-number') captured.media[0].results[0].width = Number.MAX_SAFE_INTEGER + 1;
    if (kind === 'wrong-owner') captured.media[0].results[0].recipe_id = 'unknown-recipe';
    if (kind === 'count-drift') captured.media[0].results.pop();
    expect(() => captureRecipeMedia(captured)).toThrow();
  });

  it.each([undefined, {}, { status: 'MEDIA_METADATA_CAPTURE_PASS', rows: 500, ready: 0 }])('fails closed without a complete pre-migration digest', (before) => {
    expect(() => verifyRecipeMediaPreserved({ before, ...evidence() })).toThrow(/pre-migration/);
  });
});
