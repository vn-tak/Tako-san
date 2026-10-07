const MAX_OUTPUT_BYTES = 65_536;
const BOOKMARK = /^[A-Za-z0-9._:-]{1,256}$/;
const COMPLETION_KEYS = ['results', 'success', 'finalBookmark', 'meta'];
const SUMMARY_KEYS = ['Total queries executed', 'Rows read', 'Rows written', 'Database size (MB)'];
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const nonnegativeNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const exactKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length
  && keys.every((key) => Object.hasOwn(value, key));
const reject = () => { throw new Error('CATALOG_IMPORT_OUTPUT_REJECTED'); };

function completionJson(stdout) {
  if (typeof stdout !== 'string' || Buffer.byteLength(stdout) > MAX_OUTPUT_BYTES) reject();
  if (/^[\x20\t\r\n]*\[/.test(stdout)) return stdout;
  for (const colored of [false, true]) {
    const glyph = (value) => colored ? `\x1b[90m${value}\x1b[39m` : value;
    const left = glyph('\u251c');
    const bar = glyph('\u2502');
    const header = `${left} Checking if file needs uploading\n${bar}\n`;
    if (!stdout.startsWith(header)) continue;
    let remaining = stdout.slice(header.length);
    const uploading = `${left} \u{1f300} Uploading `;
    if (remaining.startsWith(uploading)) {
      const newline = remaining.indexOf('\n', uploading.length);
      if (newline === -1) reject();
      const filename = remaining.slice(uploading.length, newline);
      if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(filename)) reject();
      const finished = `\n${bar} \u{1f300} Uploading complete.\n${bar}\n`;
      if (!remaining.startsWith(finished, newline)) reject();
      remaining = remaining.slice(newline + finished.length);
    }
    if (!remaining.startsWith('[')) reject();
    return remaining;
  }
  reject();
}

function rejectDuplicateKeys(json) {
  const tokens = [...json.matchAll(/"(?:\\.|[^"\\])*"|[{}\[\]:,]/g)].map((match) => match[0]);
  const stack = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token === '{') stack.push(new Set());
    else if (token === '[') stack.push(null);
    else if (token === '}' || token === ']') stack.pop();
    else if (token.startsWith('"') && tokens[index + 1] === ':') {
      const key = JSON.parse(token);
      const keys = stack.at(-1);
      if (!keys || keys.has(key)) reject();
      keys.add(key);
    }
  }
}

function requireCompletion(value) {
  // Pinned Wrangler emits one summary only after its import poll reports complete.
  if (!Array.isArray(value) || value.length !== 1) reject();
  const result = value[0];
  if (!exactKeys(result, COMPLETION_KEYS) || result.success !== true
      || typeof result.finalBookmark !== 'string' || !BOOKMARK.test(result.finalBookmark)
      || !Array.isArray(result.results) || result.results.length !== 1 || !isObject(result.meta)) reject();
  const summary = result.results[0];
  const meta = result.meta;
  if (!exactKeys(summary, SUMMARY_KEYS) || !count(summary['Total queries executed'])
      || summary['Total queries executed'] < 1 || !count(meta.rows_read) || !count(meta.rows_written)
      || !count(meta.size_after) || meta.size_after < 1 || !nonnegativeNumber(meta.duration)
      || summary['Rows read'] !== meta.rows_read || summary['Rows written'] !== meta.rows_written
      || summary['Database size (MB)'] !== (meta.size_after / 1e6).toFixed(2)) reject();
  for (const key of ['changes', 'last_row_id', 'total_attempts']) {
    if (Object.hasOwn(meta, key) && !count(meta[key])) reject();
  }
  for (const key of ['changed_db', 'served_by_primary']) {
    if (Object.hasOwn(meta, key) && typeof meta[key] !== 'boolean') reject();
  }
  // Validate known D1 metadata while allowing additional provider metadata fields.
  for (const key of ['served_by', 'served_by_region', 'served_by_colo']) {
    if (Object.hasOwn(meta, key) && typeof meta[key] !== 'string') reject();
  }
  if (Object.hasOwn(meta, 'timings') && (!isObject(meta.timings)
      || !Object.hasOwn(meta.timings, 'sql_duration_ms') || !nonnegativeNumber(meta.timings.sql_duration_ms))) reject();
  if (['errors', 'error', 'status', 'failed', 'failure'].some((key) => Object.hasOwn(meta, key))
      || (Object.hasOwn(meta, 'success') && meta.success !== true)) reject();
  return value;
}

/** Accepts only pinned non-TTY import progress followed by one verified completion summary. */
export function parseCatalogImportOutput(stdout) {
  try {
    const json = completionJson(stdout);
    const result = JSON.parse(json);
    rejectDuplicateKeys(json);
    return requireCompletion(result);
  } catch { reject(); }
}
