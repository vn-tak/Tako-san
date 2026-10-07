import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInContext, createContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { parseCatalogImportOutput } from '../../scripts/production-catalog-import-output.mjs';

const require = createRequire(import.meta.url);
const vendor = readFileSync(require.resolve('wrangler'), 'utf8');
const header = '\u251c Checking if file needs uploading\n\u2502\n';
const upload = '\u251c \u{1f300} Uploading fixture.sql\n\u2502 \u{1f300} Uploading complete.\n\u2502\n';
const privateText = 'private provider credential source 729';
const completion = () => [{
  success: true,
  results: [{ 'Total queries executed': 296, 'Rows read': 500, 'Rows written': 2702, 'Database size (MB)': '8.00' }],
  finalBookmark: 'fixture-bookmark',
  meta: { duration: 1.25, rows_read: 500, rows_written: 2702, size_after: 8_000_000 },
}];
const serialize = (value = completion()) => JSON.stringify(value, null, 2);

function vendorSlice(start, end) {
  const first = vendor.indexOf(start);
  const last = vendor.indexOf(end, first);
  if (first === -1 || last <= first) throw new Error('Pinned vendor fixture changed');
  return vendor.slice(first, last);
}

async function vendorStdout(kind, colored = false) {
  const code = [
    vendorSlice('var logRaw = ', 'var format6 = '),
    vendorSlice('var spinnerFrames = ', '// src/is-ci.ts'),
    vendorSlice('var Handler4 = ', 'async function executeLocally('),
    vendorSlice('async function executeRemotely(', 'async function d1ApiPost('),
  ].join('\n');
  let stdout = '';
  const stages = [];
  const etag = 'a'.repeat(32);
  const gray = value => colored ? `\x1b[90m${value}\x1b[39m` : value;
  const logger = { loggerLevel: 'log', log(value) {
    if (this.loggerLevel === 'log') stdout += `${value}\n`;
  }, warn() {}, table() {} };
  const terminal = { success: true, status: 'complete', messages: [], result: {
    num_queries: 296, final_bookmark: 'fixture-bookmark', meta: completion()[0].meta,
  } };
  const context = createContext({
    __name: value => value,
    stdout: { write(value) { stdout += value; } },
    process: { stdin: { isTTY: false }, stdout: { isTTY: false } },
    logger, dim: value => value, gray, white: value => value, brandColor: value => value,
    leftT: gray('\u251c'), grayBar: gray('\u2502'), shapes: { bar: '\u2502' },
    setInterval, clearTimeout, logUpdate2: () => {},
    source_default: { gray, dim: value => value },
    printWranglerBanner: async () => { logger.log('banner'); },
    readConfig: () => ({}), checkForSQLiteBinary: async () => {},
    requireAuth: async () => 'abababababababababababababababab',
    getDatabaseByNameOrBinding: async () => ({ uuid: '12345678-abcd-4567-8901-123456789abc' }),
    readableRelative: value => value, configFileName: () => 'offline-config',
    import_md5_file: { default: async () => etag },
    import_fs9: { promises: { stat: async () => ({ size: 9 }) }, createReadStream: () => 'mock-stream' },
    import_undici9: { fetch: async () => {
      stages.push('SIGNED_UPLOAD_PUT');
      return { status: 200, headers: { get: () => etag } };
    } },
    d1ApiPost: async (_account, _db, action, body) => {
      stages.push(action === 'query' ? 'QUERY_POST' : body.action.toUpperCase());
      if (action === 'query') return [{ success: true, results: [{ ok: 1 }] }];
      if (body.action === 'init') return kind === 'cached' ? terminal : {
        success: true, upload_url: 'https://offline.invalid/signed', filename: 'fixture.sql',
      };
      if (body.action === 'ingest') return { success: true, status: 'active', messages: [], at_bookmark: 'offline-cursor' };
      if (body.action === 'poll') return terminal;
      throw new Error('Unexpected offline vendor request');
    },
    logResult: () => {}, UserError: Error, APIError: Error, JsonFriendlyFatalError: Error,
    createFatalError: message => new Error(message), confirm: async () => true,
  });
  runInContext(code, context);
  context.fixtureArgs = { remote: true, database: 'fixture', yes: true, json: true,
    ...(kind === 'query' ? { command: 'SELECT 1 AS ok' } : { file: '/offline/fixture.sql' }) };
  await runInContext('Handler4(fixtureArgs)', context);
  return { stdout, stages };
}

function assertRejected(stdout) {
  try {
    parseCatalogImportOutput(stdout);
    throw new Error('Parser accepted unproved completion');
  } catch (error) {
    expect(error.message).toBe('CATALOG_IMPORT_OUTPUT_REJECTED');
    expect(error.message).not.toContain(privateText);
  }
}

describe('pinned Wrangler file-import stdout contract', () => {
  it.each([false, true])('accepts verbatim vendor upload progress with color=%s', async (colored) => {
    expect(require('wrangler/package.json').version).toBe('3.114.17');
    const result = await vendorStdout('upload', colored);
    expect(result.stages).toEqual(['INIT', 'SIGNED_UPLOAD_PUT', 'INGEST', 'POLL']);
    expect(() => JSON.parse(result.stdout)).toThrow();
    expect(parseCatalogImportOutput(result.stdout)).toEqual(completion());
  });

  it.each([false, true])('accepts verbatim vendor cached-import progress with color=%s', async (colored) => {
    const result = await vendorStdout('cached', colored);
    expect(result.stages).toEqual(['INIT']);
    expect(() => JSON.parse(result.stdout)).toThrow();
    expect(parseCatalogImportOutput(result.stdout)).toEqual(completion());
  });

  it('keeps the query stdout control clean and refuses it as import completion', async () => {
    const result = await vendorStdout('query');
    expect(result.stages).toEqual(['QUERY_POST']);
    expect(JSON.parse(result.stdout)).toEqual([{ success: true, results: [{ ok: 1 }] }]);
    assertRejected(result.stdout);
  });

  it.each(['', ' \t\r\n'])('accepts only completion JSON when progress is absent, with whitespace=%j', (whitespace) => {
    expect(parseCatalogImportOutput(`${whitespace}${serialize()}${whitespace}`)).toEqual(completion());
  });

  it('accepts a provider filename independent of the local SQL basename', () => {
    const providerUpload = upload.replace('fixture.sql', '12345678-abcd-4567-8901-123456789abc_a0123.sql');
    expect(parseCatalogImportOutput(header + providerUpload + serialize())).toEqual(completion());
  });

  it('accepts additional typed D1 metadata without changing the verified summary', () => {
    const value = completion();
    Object.assign(value[0].meta, { changed_db: true, changes: 2702, last_row_id: 0,
      served_by_primary: true, served_by_region: 'APAC', total_attempts: 1 });
    expect(parseCatalogImportOutput(serialize(value))).toEqual(value);
  });
});

describe('fail-closed import framing', () => {
  it.each([
    ['arbitrary prefix', () => `${privateText}\n${serialize()}`],
    ['arbitrary text after valid progress', () => `${header}${privateText}\n${serialize()}`],
    ['trailing noise', () => `${header}${serialize()}\n${privateText}`],
    ['second JSON array', () => `${header}${serialize()}\n${serialize()}`],
    ['JSON error then completion', () => `${JSON.stringify({ error: privateText })}\n${serialize()}`],
    ['repeated initial progress', () => `${header}${header}${serialize()}`],
    ['upload without initial progress', () => `${upload}${serialize()}`],
    ['repeated upload progress', () => `${header}${upload}${upload}${serialize()}`],
    ['missing upload completion', () => `${header}\u251c \u{1f300} Uploading fixture.sql\n${serialize()}`],
    ['wrong completion message', () => `${header}${upload.replace('complete.', 'failed.')} ${serialize()}`],
    ['progress between JSON tokens', () => `${header}${serialize().replace('"success": true', `"success": true\n${upload}`)}`],
    ['unknown ANSI escape', () => `${header.replace('\u251c', '\x1b[31m\u251c\x1b[39m')}${serialize()}`],
    ['incomplete ANSI wrapper', () => `${header.replace('\u251c', '\x1b[90m\u251c')}${serialize()}`],
    ['mixed color grammar', () => `${header.replace('\u251c', '\x1b[90m\u251c\x1b[39m')}${serialize()}`],
    ['CRLF progress outside pinned grammar', () => `${header.replaceAll('\n', '\r\n')}${serialize()}`],
    ['oversized output', () => ' '.repeat(65_537)],
  ])('rejects %s without publishing stdout', (_label, candidate) => { assertRejected(candidate()); });

  it.each(['../fixture.sql', '/private/fixture.sql', 'file with spaces.sql', 'file\nprivate.sql',
    'file\x1b[0m.sql', 'x'.repeat(257), ''])('rejects unbounded or unsafe upload filename %j', (filename) => {
    assertRejected(header + upload.replace('fixture.sql', filename) + serialize());
  });

  it.each([undefined, null, {}, [], Buffer.from('[]'), '', 'not JSON', '['])
  ('rejects non-output or malformed output %j', (value) => { assertRejected(value); });

  it('rejects duplicate success keys even when the last one says true', () => {
    assertRejected(serialize().replace('"success": true', '"success": false, "success": true'));
  });

  it('rejects an escaped duplicate key rather than trusting JSON override semantics', () => {
    assertRejected(serialize().replace('"success": true', '"success": false, "\\u0073uccess": true'));
  });

  it('rejects duplicate nested aggregate keys', () => {
    assertRejected(serialize().replace('"rows_written": 2702', '"rows_written": 0, "rows_written": 2702'));
  });
});

describe('provider completion evidence', () => {
  it.each([
    ['empty array', value => { value.length = 0; }],
    ['multiple completion entries', value => { value.push(structuredClone(value[0])); }],
    ['failed entry', value => { value[0].success = false; }],
    ['truthy string success', value => { value[0].success = 'true'; }],
    ['omitted final bookmark', value => { delete value[0].finalBookmark; }],
    ['private whitespace bookmark', value => { value[0].finalBookmark = privateText; }],
    ['oversized bookmark', value => { value[0].finalBookmark = 'x'.repeat(257); }],
    ['empty bookmark', value => { value[0].finalBookmark = ''; }],
    ['missing summary', value => { value[0].results = []; }],
    ['multiple summary rows', value => { value[0].results.push(value[0].results[0]); }],
    ['query-style row', value => { value[0].results = [{ ok: 1 }]; }],
    ['extra top-level errors', value => { value[0].errors = [privateText]; }],
    ['extra top-level provider status', value => { value[0].status = 'error'; }],
    ['extra summary field', value => { value[0].results[0].private = privateText; }],
    ['missing meta', value => { delete value[0].meta; }],
    ['array meta', value => { value[0].meta = []; }],
    ['zero queries', value => { value[0].results[0]['Total queries executed'] = 0; }],
    ['fractional queries', value => { value[0].results[0]['Total queries executed'] = 1.5; }],
    ['unsafe queries', value => { value[0].results[0]['Total queries executed'] = Number.MAX_SAFE_INTEGER + 1; }],
    ['mismatched read count', value => { value[0].results[0]['Rows read'] = 499; }],
    ['mismatched write count', value => { value[0].results[0]['Rows written'] = 0; }],
    ['mismatched database size', value => { value[0].results[0]['Database size (MB)'] = '7.00'; }],
    ['numeric size summary', value => { value[0].results[0]['Database size (MB)'] = 8; }],
    ['negative duration', value => { value[0].meta.duration = -1; }],
    ['null duration', value => { value[0].meta.duration = null; }],
    ['non-finite duration', value => { value[0].meta.duration = Infinity; }],
    ['negative row count', value => { value[0].meta.rows_read = -1; }],
    ['fractional write count', value => { value[0].meta.rows_written = 1.5; }],
    ['unsafe write count', value => { value[0].meta.rows_written = Number.MAX_SAFE_INTEGER + 1; }],
    ['string row count', value => { value[0].meta.rows_read = '500'; }],
    ['zero database size', value => { value[0].meta.size_after = 0; }],
    ['string database size', value => { value[0].meta.size_after = '8000000'; }],
    ['meta failure', value => { value[0].meta.success = false; }],
    ['meta provider error', value => { value[0].meta.error = privateText; }],
    ['meta provider errors', value => { value[0].meta.errors = []; }],
    ['invalid optional changes', value => { value[0].meta.changes = -1; }],
    ['invalid optional changed flag', value => { value[0].meta.changed_db = 'true'; }],
    ['invalid optional primary flag', value => { value[0].meta.served_by_primary = 1; }],
  ])('rejects %s', (_label, alter) => {
    const value = completion();
    alter(value);
    assertRejected(header + upload + serialize(value));
  });

  it('rejects a raw provider import object even when it says complete', () => {
    assertRejected(JSON.stringify({ success: true, status: 'complete', result: completion()[0] }));
  });

  it('accepts zero row writes when a real completion summary agrees', () => {
    const value = completion();
    value[0].meta.duration = 0;
    value[0].meta.rows_written = 0;
    value[0].results[0]['Rows written'] = 0;
    expect(parseCatalogImportOutput(serialize(value))).toEqual(value);
  });
});

describe('recognized optional D1 metadata', () => {
  it('accepts typed known metadata and preserves additional provider fields', () => {
    const value = completion();
    Object.assign(value[0].meta, { served_by: 'fixture-provider', served_by_colo: 'NRT',
      served_by_region: 'APAC', timings: { sql_duration_ms: 0, provider_clock: 'fixture' },
      success: true, provider_revision: { generation: 2 } });
    expect(parseCatalogImportOutput(serialize(value))).toEqual(value);
  });

  it.each([
    ['error status', { status: 'error' }],
    ['undocumented complete status', { status: 'complete' }],
    ['null status', { status: null }],
    ['failed flag', { failed: true }],
    ['false undocumented failed flag', { failed: false }],
    ['failure object', { failure: { message: privateText } }],
    ['null failure', { failure: null }],
    ['invalid provider location', { served_by: 1 }],
    ['nested provider location', { served_by: { error: privateText } }],
    ['invalid region', { served_by_region: { error: privateText } }],
    ['null region', { served_by_region: null }],
    ['invalid colo', { served_by_colo: ['NRT'] }],
    ['null colo', { served_by_colo: null }],
    ['null timings', { timings: null }],
    ['array timings', { timings: [] }],
    ['missing SQL duration', { timings: {} }],
    ['negative SQL duration', { timings: { sql_duration_ms: -1 } }],
    ['string SQL duration', { timings: { sql_duration_ms: '1' } }],
    ['null SQL duration', { timings: { sql_duration_ms: null } }],
    ['nonfinite SQL duration', { timings: { sql_duration_ms: Infinity } }],
    ['invalid attempt count', { total_attempts: 1.5 }],
    ['negative last row ID', { last_row_id: -1 }],
  ])('rejects %s without disclosing provider output', (_label, metadata) => {
    const value = completion();
    Object.assign(value[0].meta, metadata);
    assertRejected(header + upload + serialize(value));
  });
});
