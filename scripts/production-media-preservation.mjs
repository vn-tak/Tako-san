import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadRuntimeCatalogPipeline, verifyRecipeMediaOperational } from './d1-migration-check.mjs';

const COLUMNS = [
  'id', 'recipe_id', 'role', 'version', 'status', 'source_type', 'storage_key', 'mime_type',
  'width', 'height', 'content_length', 'content_hash', 'source_reference',
  'generator_provider', 'generator_model', 'prompt_hash', 'created_at', 'updated_at',
];
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function recipeMediaQuery() {
  return `SELECT ${COLUMNS.join(', ')} FROM recipe_media ORDER BY id;\n`;
}

export function recipeMediaSchemaQuery() {
  return "SELECT type, name, sql FROM sqlite_master WHERE tbl_name = 'recipe_media' ORDER BY type, name;\n";
}

function capturedRows(value) {
  if (!Array.isArray(value) || value.length !== 1 || value[0]?.success !== true ||
      !Array.isArray(value[0].results)) throw new Error('Incomplete media capture');
  return value[0].results;
}

/** Hash the complete private metadata projection; only the count/digest leaves the runner. */
export function captureRecipeMedia({ catalog, media, schema, pipeline }) {
  for (const name of ['mapRecipeMediaRow', 'auditReadyRecipeMediaRecord', 'isCanonicalRecipeIdShape',
    'isRecipeMediaMimeType', 'isSha256Hex', 'isTrustedRecipeMediaStorageKey']) {
    if (typeof pipeline?.[name] !== 'function') throw new Error('Real recipe media validation pipeline required');
  }
  if (!Array.isArray(catalog) || catalog.length !== 2 || catalog[0]?.success !== true ||
      catalog[1]?.success !== true || !Array.isArray(catalog[0].results) ||
      catalog[0].results.length !== 1 || !Array.isArray(catalog[1].results)) {
    throw new Error('Incomplete catalog evidence for media capture');
  }
  const aggregate = catalog[0].results[0];
  const policy = verifyRecipeMediaOperational({ catalog, schema, recipes: aggregate.recipes });
  const rows = capturedRows(media);
  const recipes = new Set(catalog[1].results.map((row) => row.id));
  if (recipes.size !== aggregate.recipes || rows.length !== policy.rows ||
      rows.filter((row) => row.status === 'ready').length !== policy.ready) {
    throw new Error('Media capture count changed');
  }
  let previous = null;
  const versions = new Set(), readyRoles = new Set();
  const heroes = new Map([...recipes].map((id) => [id, { ready: 0, pending: 0 }]));
  const projection = rows.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row) ||
        Object.keys(row).length !== COLUMNS.length || COLUMNS.some((key) => !Object.hasOwn(row, key)) ||
        typeof row.id !== 'string' || !row.id || (previous !== null && Buffer.compare(Buffer.from(previous), Buffer.from(row.id)) >= 0) ||
        !recipes.has(row.recipe_id) || COLUMNS.some((key) => {
          const value = row[key];
          return value !== null && typeof value !== 'string' &&
            !(typeof value === 'number' && Number.isSafeInteger(value));
        })) throw new Error('Malformed or unordered media capture');
    const record = pipeline.mapRecipeMediaRow(row);
    const numeric = new Set(['version', 'width', 'height', 'content_length']);
    if (!record || !pipeline.isCanonicalRecipeIdShape(row.recipe_id) ||
        COLUMNS.some((key) => row[key] !== null && (numeric.has(key)
          ? !Number.isSafeInteger(row[key]) : typeof row[key] !== 'string')) ||
        ['id', 'recipe_id', 'created_at', 'updated_at'].some((key) => !row[key]) ||
        ['source_reference', 'generator_provider', 'generator_model'].some((key) => row[key] !== null && !row[key]) ||
        ['width', 'height'].some((key) => row[key] !== null && row[key] <= 0) ||
        (row.content_length !== null && row.content_length < 0) ||
        ['content_hash', 'prompt_hash'].some((key) => row[key] !== null && !pipeline.isSha256Hex(row[key])) ||
        (row.mime_type !== null && !pipeline.isRecipeMediaMimeType(row.mime_type)) ||
        (row.storage_key !== null && !pipeline.isTrustedRecipeMediaStorageKey(
          row.storage_key, row.recipe_id, row.role, row.version, row.mime_type)) ||
        (record.status === 'ready' && pipeline.auditReadyRecipeMediaRecord(record).length !== 0)) {
      throw new Error('Private media capture failed actual domain validation');
    }
    const identity = JSON.stringify([record.recipeId, record.role, record.version]);
    if (versions.has(identity)) throw new Error('Duplicate private media version');
    versions.add(identity);
    if (record.status === 'ready') {
      const role = JSON.stringify([record.recipeId, record.role]);
      if (readyRoles.has(role)) throw new Error('Duplicate private ready media role');
      readyRoles.add(role);
    }
    if (record.role === 'hero' && ['pending', 'ready'].includes(record.status)) {
      heroes.get(record.recipeId)[record.status] += 1;
    }
    previous = row.id;
    return COLUMNS.map((key) => row[key]);
  });
  if ([...heroes.values()].some(({ ready, pending }) => ready !== 1 && !(ready === 0 && pending === 1))) {
    throw new Error('Private media capture has no unique active hero');
  }
  const schemaRows = capturedRows(schema);
  const schemaProjection = schemaRows.map((row) => {
    if (!row || Object.keys(row).length !== 3 ||
        ['type', 'name', 'sql'].some((key) => !Object.hasOwn(row, key)) ||
        typeof row.type !== 'string' || typeof row.name !== 'string' ||
        (row.sql !== null && typeof row.sql !== 'string')) throw new Error('Malformed media schema capture');
    return [row.type, row.name, row.sql];
  }).sort((a, b) => Buffer.compare(Buffer.from(JSON.stringify(a)), Buffer.from(JSON.stringify(b))));
  return {
    status: 'MEDIA_METADATA_CAPTURE_PASS', rows: rows.length, ready: policy.ready,
    metadataSha256: digest(projection), schemaSha256: digest(schemaProjection),
    r2Availability: 'NOT_REVERIFIED', captureConsistency: 'OBSERVED_NON_ATOMIC',
  };
}

export function verifyRecipeMediaPreserved({ before, catalog, media, schema, pipeline }) {
  if (before?.status !== 'MEDIA_METADATA_CAPTURE_PASS' ||
      !Number.isSafeInteger(before.rows) || before.rows < 0 ||
      !Number.isSafeInteger(before.ready) || before.ready < 0 ||
      !/^[a-f0-9]{64}$/.test(before.metadataSha256 || '') ||
      !/^[a-f0-9]{64}$/.test(before.schemaSha256 || '')) {
    throw new Error('Missing pre-migration media capture');
  }
  const after = captureRecipeMedia({ catalog, media, schema, pipeline });
  if (['rows', 'ready', 'metadataSha256', 'schemaSha256'].some((key) => before[key] !== after[key])) {
    throw new Error('Recipe media changed across migration 0039');
  }
  return { ...after, status: 'MEDIA_METADATA_PRESERVED', beforeMetadataSha256: before.metadataSha256 };
}

async function main() {
  const [command, manifestFile, catalogFile, mediaFile, schemaFile] = process.argv.slice(2);
  if (command === 'query' && process.argv.length === 3) return process.stdout.write(recipeMediaQuery());
  if (command === 'schema-query' && process.argv.length === 3) return process.stdout.write(recipeMediaSchemaQuery());
  if (command !== 'verify' || process.argv.length !== 7) throw new Error('Expected media query or preservation verification');
  const manifest = readJson(manifestFile);
  if (manifest.migration !== '0039_meal_composition_v2.sql' ||
      manifest.postLedger?.tip !== manifest.migration || manifest.catalog?.releaseComplete !== true ||
      manifest.health?.foreignKeyCheck !== '[]' || manifest.health?.quickCheck !== 'ok') {
    throw new Error('Post-migration catalog and integrity proof required');
  }
  const pipeline = await loadRuntimeCatalogPipeline();
  try {
    manifest.recipeMediaPreservation = verifyRecipeMediaPreserved({
      pipeline, before: manifest.preMigrationMedia, catalog: readJson(catalogFile),
      media: readJson(mediaFile), schema: readJson(schemaFile),
    });
    writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log('Recipe media metadata preserved across migration 0039');
  } finally { await pipeline.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error('Production media preservation failed; rollout must stop');
    process.exitCode = 1;
  });
}
