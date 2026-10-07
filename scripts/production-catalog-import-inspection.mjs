import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { compileOriginalCatalogImportInspection, compileRecipeCatalogRecovery, RECOVERY_TABLES } from './recipe-catalog-recovery.mjs';

export const ORIGINAL_IMPORT_REPAIR_ID = 't21_v1_37384670328';
export const LATEST_V2_IMPORT_INCIDENT = Object.freeze({
  runId: '37491535308', sourceSha: '4092d4ca2dacee8bb01da484aae93592e9bd94da',
  repairId: 't21_v1_37491535308', guardVersion: 2,
  sqlSha256: '75c8207ec177972c6cac92007a2c8f165a94ce39d7f03ea7973446aedcd4f441',
  rollbackSqlSha256: '26b9a034f3bab9697d6ccb8fd3253e2701a34ba3b6b6cb1b9d3c4f5fb2393825',
  sourceDigest: '4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5',
  runtimeFingerprint: 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37',
});
export const FIXED_V2_IMPORT_INCIDENT_37536969564 = Object.freeze({
  runId: '37536969564', sourceSha: 'a8fa0324bb609274cc07a5c4b079e7ee4633fd83',
  repairId: 't21_v1_37536969564', guardVersion: 2,
  sqlSha256: 'e5a58960baa4b8e1f4cae8be94985dd03cf4e9acf03c274b38fb310ce79f28c0',
  rollbackSqlSha256: 'ba48a606a1694ec87a3af22fc01a640f0653344335ebd21bd260cdbefd4fdcee',
  sourceDigest: '4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5',
  runtimeFingerprint: 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37',
});
const RUN_ID = '37384670328';
const PREFIX = `catalog_recovery_${ORIGINAL_IMPORT_REPAIR_ID}`;
const SQL_HASH = 'f4b6a4d05abfaff9f50a73063edc577e4b4e3ece9ff0f3a84b911e2ae2b42797';
const SOURCE_DIGEST = '4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5';
const FINGERPRINT = 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37';
const GUARD_LABELS = ['known_schema_and_references', 'exact_0038_ledger',
  'foreign_keys_enabled_and_clean', 'bounded_observed_catalog', 'nutrition_versions_consistent',
  'original_ingredients_reinsertable', 'temporary_slug_namespace_unused'];
const PREFLIGHT_GUARD_LABELS = ['approved_internal_inventory', ...GUARD_LABELS];
const META_FIELDS = ['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk', 'hidden'];
const hash = (value) => createHash('sha256').update(value).digest('hex');
const literal = (value) => value === null ? 'NULL' : typeof value === 'number' ? String(value)
  : `'${value.replaceAll("'", "''")}'`;
const stopped = () => new Error('IMPORT_INSPECTION_SOURCE_REJECTED');
const preflightStopped = () => new Error('RECOVERY_PREFLIGHT_SOURCE_REJECTED');
const latestStopped = () => new Error('LATEST_IMPORT_INSPECTION_SOURCE_REJECTED');
const fixed37536969564Stopped = () => new Error('FIXED_V2_IMPORT_37536969564_INSPECTION_SOURCE_REJECTED');
const queryObservations = () => ({ successful: 0, failed: 0, primaryTrue: 0, primaryFalse: 0, primaryUnknown: 0 });
const incidentIdentity = () => ({ runId: RUN_ID, repairId: ORIGINAL_IMPORT_REPAIR_ID, sqlSha256: SQL_HASH,
  sourceDigest: SOURCE_DIGEST, runtimeFingerprint: FINGERPRINT });

// Split generated predicates without interpreting quoted trigger SQL or nested subqueries.
function topLevelTerms(sql) {
  const terms = [];
  let depth = 0;
  let quote;
  let start = 0;
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (quote) {
      if (char === quote) {
        if (sql[i + 1] === quote) i++;
        else quote = undefined;
      }
    } else if (char === "'" || char === '"') quote = char;
    else if (char === '(') depth++;
    else if (char === ')') { if (--depth < 0) throw stopped(); }
    else if (depth === 0 && sql.slice(i, i + 5) === ' AND ') {
      terms.push(sql.slice(start, i)); start = i + 5; i += 4;
    }
  }
  if (quote || depth !== 0) throw stopped();
  terms.push(sql.slice(start));
  return terms;
}

function guardStatements(plan, prefix = PREFIX) {
  const start = `INSERT INTO ${prefix}_guard (label, ok) SELECT '`;
  return plan.statements.filter((sql) => sql.startsWith(start)).map((sql) => {
    const tail = sql.slice(start.length);
    const match = /^([a-z0-9_]+)', CASE WHEN ([\s\S]+) THEN 1 ELSE 0 END$/.exec(tail);
    if (!match) throw stopped();
    return { label: match[1], predicate: match[2] };
  });
}

function approvedPlan(source, plan) {
  try {
    const canonical = compileOriginalCatalogImportInspection({ source });
    if (source.sourceDigest !== SOURCE_DIGEST || source.fingerprint !== FINGERPRINT
        || canonical.receipt.sqlSha256 !== SQL_HASH || hash(canonical.sql) !== SQL_HASH
        || plan?.sql !== canonical.sql || JSON.stringify(plan.statements) !== JSON.stringify(canonical.statements)
        || plan.receipt?.repairId !== ORIGINAL_IMPORT_REPAIR_ID
        || plan.receipt?.purpose !== 'INSPECTION_ONLY' || plan.receipt?.guardVersion !== 1
        || plan.receipt?.sourceDigest !== SOURCE_DIGEST || plan.receipt?.runtimeFingerprint !== FINGERPRINT
        || plan.receipt?.sqlSha256 !== SQL_HASH
        || `${plan.statements.map((sql) => `${sql};`).join('\n\n')}\n` !== plan.sql) throw stopped();
    return canonical;
  } catch { throw stopped(); }
}

function approvedLatestPlan(source, plan) {
  return approvedFixedV2Plan(source, plan, LATEST_V2_IMPORT_INCIDENT, latestStopped);
}

function approvedFixedV2Plan(source, plan, incident, rejected) {
  try {
    if (incident !== LATEST_V2_IMPORT_INCIDENT && incident !== FIXED_V2_IMPORT_INCIDENT_37536969564) throw rejected();
    const canonical = compileRecipeCatalogRecovery({ source, repairId: incident.repairId });
    if (source.sha !== incident.sourceSha || source.sourceDigest !== incident.sourceDigest
        || source.fingerprint !== incident.runtimeFingerprint
        || canonical.receipt.guardVersion !== incident.guardVersion || canonical.receipt.purpose !== 'RESTORE_V1'
        || canonical.receipt.sqlSha256 !== incident.sqlSha256
        || canonical.receipt.rollbackSqlSha256 !== incident.rollbackSqlSha256
        || hash(canonical.sql) !== incident.sqlSha256 || hash(canonical.rollbackSql) !== incident.rollbackSqlSha256
        || plan?.sql !== canonical.sql || plan?.rollbackSql !== canonical.rollbackSql
        || JSON.stringify(plan?.statements) !== JSON.stringify(canonical.statements)
        || JSON.stringify(plan?.rollbackStatements) !== JSON.stringify(canonical.rollbackStatements)
        || JSON.stringify(plan?.archiveTables) !== JSON.stringify(canonical.archiveTables)
        || JSON.stringify(plan?.targetTables) !== JSON.stringify(canonical.targetTables)
        || JSON.stringify(plan?.receipt) !== JSON.stringify(canonical.receipt)) throw rejected();
    return canonical;
  } catch { throw rejected(); }
}

function approvedRecoveryPlan(source, plan) {
  try {
    const canonical = compileRecipeCatalogRecovery({ source, repairId: plan?.receipt?.repairId });
    if (source.sourceDigest !== SOURCE_DIGEST || source.fingerprint !== FINGERPRINT
        || canonical.receipt.purpose !== 'RESTORE_V1' || canonical.receipt.guardVersion !== 2
        || canonical.receipt.sourceSha !== source.sha || canonical.receipt.sourceDigest !== SOURCE_DIGEST
        || canonical.receipt.runtimeFingerprint !== FINGERPRINT
        || hash(canonical.sql) !== canonical.receipt.sqlSha256
        || plan?.sql !== canonical.sql || JSON.stringify(plan.statements) !== JSON.stringify(canonical.statements)
        || JSON.stringify(plan.receipt) !== JSON.stringify(canonical.receipt)
        || `${plan.statements.map((sql) => `${sql};`).join('\n\n')}\n` !== plan.sql) throw preflightStopped();
    const guards = guardStatements(canonical, `catalog_recovery_${canonical.receipt.repairId}`);
    const selected = PREFLIGHT_GUARD_LABELS.map((label) => guards.filter((guard) => guard.label === label));
    if (guards.length !== 26 || selected.some((matches) => matches.length !== 1)) throw preflightStopped();
    return { canonical, guards: selected.map(([guard]) => guard) };
  } catch { throw preflightStopped(); }
}

async function observePreflightGuard(query, observations, guard) {
  try {
    const sql = `SELECT CASE WHEN ${guard.predicate} THEN 1 ELSE 0 END AS ok`;
    if (Buffer.byteLength(sql) > 100000) throw new Error();
    const value = await query(sql);
    if (!Array.isArray(value) || value.length !== 1 || value[0]?.success !== true
        || !Array.isArray(value[0].results) || value[0].results.length !== 1) throw new Error();
    const row = value[0].results[0];
    if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).length !== 1
        || !Object.hasOwn(row, 'ok') || ![0, 1].includes(row.ok)) throw new Error();
    observations.successful++;
    const primary = value[0].meta?.served_by_primary;
    if (primary === true) observations.primaryTrue++;
    else if (primary === false) observations.primaryFalse++;
    else observations.primaryUnknown++;
    return { label: guard.label, result: row.ok === 1 ? 'MATCH' : 'MISMATCH',
      servedByPrimary: typeof primary === 'boolean' ? primary : null };
  } catch {
    observations.failed++;
    return { label: guard.label, result: 'QUERY_FAILED', servedByPrimary: null };
  }
}

/** Checks current compiler guards using SELECTs; the result never authorizes an import retry. */
export async function inspectRecoveryPreflight({ source, plan, query }) {
  const { canonical, guards } = approvedRecoveryPlan(source, plan);
  if (typeof query !== 'function') throw preflightStopped();
  const { repairId, sourceSha, sqlSha256, sourceDigest, runtimeFingerprint, purpose, guardVersion } = canonical.receipt;
  const receipt = {
    schemaVersion: 1, operation: 'inspect-recovery-preflight', status: 'BLOCKED',
    certification: 'NOT_A_RELEASE_CERTIFICATION', readOnly: true, mutations: 0, productionMutations: [],
    providerImportState: 'UNKNOWN_NO_CURSOR', retryAuthorized: false,
    incident: incidentIdentity(), repairId, sourceSha, sqlSha256, sourceDigest, runtimeFingerprint, purpose, guardVersion,
    preMutationGuards: [], blockers: [], queryObservations: queryObservations(),
  };
  for (const guard of guards) {
    const inventory = receipt.preMutationGuards[0];
    const result = guard.label === 'known_schema_and_references'
      && (inventory.result !== 'MATCH' || inventory.servedByPrimary !== true)
      ? { label: guard.label, result: 'NOT_EVALUATED', servedByPrimary: null }
      : await observePreflightGuard(query, receipt.queryObservations, guard);
    receipt.preMutationGuards.push(result);
    if (result.result !== 'MATCH') receipt.blockers.push(`GUARD_${guard.label.toUpperCase()}_${result.result}`);
    if (result.result !== 'NOT_EVALUATED' && result.servedByPrimary !== true) {
      receipt.blockers.push('PRIMARY_OBSERVATION_UNPROVEN');
    }
  }
  receipt.blockers = [...new Set(receipt.blockers)];
  if (receipt.preMutationGuards.every((guard) => guard.result === 'MATCH' && guard.servedByPrimary === true)) {
    receipt.status = 'GUARDED_PREFLIGHT_MATCH';
  }
  return receipt;
}

function expectedObjects(plan) {
  const result = [];
  for (const sql of plan.statements) {
    const table = /^CREATE TABLE ([a-z0-9_]+)\b/.exec(sql);
    const trigger = /^CREATE TRIGGER ([a-z0-9_]+) BEFORE (?:INSERT|UPDATE|DELETE) ON ([a-z0-9_]+)\b/.exec(sql);
    if (table) result.push({ name: table[1], type: 'table', table: table[1], sql });
    if (trigger) result.push({ name: trigger[1], type: 'trigger', table: trigger[2], sql });
  }
  if (result.length !== 58 || result.filter((item) => item.type === 'table').length !== 16
      || new Set(result.map((item) => item.name)).size !== 58) throw stopped();
  return result;
}

function expectedTableInfo(source, objects) {
  const db = new DatabaseSync(':memory:');
  try {
    for (const [table, fields] of Object.entries(source.tableInfo)) {
      db.exec(`CREATE TABLE ${table} (${fields.map((field) => `"${field.name}" ${field.type}`).join(', ')})`);
    }
    const result = {};
    for (const object of objects.filter((item) => item.type === 'table')) {
      db.exec(object.sql);
      result[object.name] = db.prepare(`PRAGMA table_xinfo(${object.name})`).all().map((row) => ({ ...row }));
    }
    return result;
  } finally { db.close(); }
}

function shapePredicate(table, info) {
  const fields = META_FIELDS.map((field) => `"${field}"`).join(', ');
  const actual = `SELECT ${fields} FROM pragma_table_xinfo(${literal(table)})`;
  const expected = `SELECT ${META_FIELDS.map((field, index) => `column${index + 1} AS "${field}"`).join(', ')}
    FROM (VALUES ${info.map((row) => `(${META_FIELDS.map((field) => literal(row[field])).join(', ')})`).join(', ')})`;
  return `NOT EXISTS (${actual} EXCEPT ${expected}) AND NOT EXISTS (${expected} EXCEPT ${actual})`;
}

function inventorySql(objects, prefix = PREFIX) {
  const matches = objects.map((object) => `(name = ${literal(object.name)} AND type = ${literal(object.type)} AND tbl_name = ${literal(object.table)})`);
  const present = objects.map((object, index) => `CASE WHEN EXISTS (SELECT 1 FROM sqlite_schema
    WHERE ${matches[index]}) THEN 1 ELSE 0 END AS object_${index}`);
  return `SELECT count(1) AS objectCount,
    coalesce(sum(CASE WHEN type = 'table' THEN 1 ELSE 0 END), 0) AS tableCount,
    coalesce(sum(CASE WHEN type = 'trigger' THEN 1 ELSE 0 END), 0) AS triggerCount,
    coalesce(sum(CASE WHEN ${matches.join(' OR ')} THEN 1 ELSE 0 END), 0) AS matchedObjectCount,
    ${present.join(',\n    ')}
    FROM sqlite_schema WHERE lower(substr(name, 1, ${prefix.length})) = ${literal(prefix)}`;
}

/** Reads only aggregate SELECTs for the sealed original incident. */
export async function inspectCatalogImport({ source, plan, query }) {
  return inspectApprovedCatalogImport({ source, approved: approvedPlan(source, plan), query });
}

/** Reconstructs the exact failed V2 bytes; marker observations never certify a release or retry. */
export async function inspectLatestCatalogImport({ source, plan, query }) {
  if (typeof query !== 'function') throw latestStopped();
  return inspectApprovedCatalogImport({ source, approved: approvedLatestPlan(source, plan), query,
    incident: LATEST_V2_IMPORT_INCIDENT, latest: true });
}

/** Observes only the sealed bytes of run 37536969564, whose provider import outcome is unconfirmed. */
export async function inspectFixedV2Import37536969564({ source, plan, query }) {
  if (typeof query !== 'function') throw fixed37536969564Stopped();
  const incident = FIXED_V2_IMPORT_INCIDENT_37536969564;
  return inspectApprovedCatalogImport({ source,
    approved: approvedFixedV2Plan(source, plan, incident, fixed37536969564Stopped), query, incident, latest: true,
    appliedMarkerStatus: 'FIXED_V2_RECOVERY_37536969564_APPLIED_MARKER_OBSERVED',
    rolledBackMarkerStatus: 'FIXED_V2_RECOVERY_37536969564_ROLLED_BACK_MARKER_OBSERVED' });
}

async function inspectApprovedCatalogImport({ source, approved, query, incident = incidentIdentity(), latest = false,
  appliedMarkerStatus = 'LATEST_V2_RECOVERY_APPLIED_MARKER_OBSERVED',
  rolledBackMarkerStatus = 'LATEST_V2_RECOVERY_ROLLED_BACK_MARKER_OBSERVED' }) {
  if (typeof query !== 'function') throw stopped();
  const prefix = `catalog_recovery_${incident.repairId}`;
  const guardCount = latest ? 26 : 25;
  const restoreObjects = expectedObjects(approved);
  const rollbackCreate = latest ? approved.rollbackStatements.filter((sql) =>
    sql.startsWith(`CREATE TABLE ${prefix}_rollback_guard `)) : [];
  if (latest && rollbackCreate.length !== 1) throw latestStopped();
  const objects = latest ? [...restoreObjects, { name: `${prefix}_rollback_guard`, type: 'table',
    table: `${prefix}_rollback_guard`, sql: rollbackCreate[0] }] : restoreObjects;
  const shapes = expectedTableInfo(source, objects);
  const guards = guardStatements(approved, prefix);
  const rollbackGuards = latest ? guardStatements({ statements: approved.rollbackStatements }, `${prefix}_rollback`) : [];
  const selectedGuards = (latest ? PREFLIGHT_GUARD_LABELS : GUARD_LABELS)
    .map((label) => guards.find((guard) => guard.label === label));
  if (selectedGuards.some((guard) => !guard) || guards.length !== guardCount) throw stopped();
  const receipt = {
    schemaVersion: 1, operation: 'inspect-import', status: 'INSPECTION_BLOCKED',
    certification: 'NOT_A_RELEASE_CERTIFICATION', readOnly: true, mutations: 0, productionMutations: [],
    providerImportState: 'UNKNOWN_NO_CURSOR', providerBlockingEvidence: 'UNPROVEN', retryAuthorized: false,
    incident: { ...incident },
    inventory: null, preMutationGuards: [], schemaChecks: [], objectSchemaChecks: [],
    aggregates: { live: {}, archive: {}, target: {} }, guard: null, repairStatus: null,
    ...(latest ? { rollbackGuard: null } : {}),
    blockers: [], queryObservations: queryObservations(),
  };
  const observations = receipt.queryObservations;
  const select = async (sql, keys, booleanKeys = []) => {
    try {
      if (!sql.startsWith('SELECT ') || Buffer.byteLength(sql) > 100000) throw new Error();
      const value = await query(sql);
      if (!Array.isArray(value) || value.length !== 1 || value[0]?.success !== true
          || !Array.isArray(value[0].results) || value[0].results.length !== 1) throw new Error();
      const row = value[0].results[0];
      if (!row || typeof row !== 'object' || Array.isArray(row)
          || Object.keys(row).length !== keys.length
          || keys.some((key) => !Object.hasOwn(row, key) || !Number.isSafeInteger(row[key]) || row[key] < 0)
          || booleanKeys.some((key) => row[key] > 1)) throw new Error();
      observations.successful++;
      const primary = value[0].meta?.served_by_primary;
      if (primary === true) observations.primaryTrue++;
      else if (primary === false) observations.primaryFalse++;
      else observations.primaryUnknown++;
      return Object.fromEntries(keys.map((key) => [key, row[key]]));
    } catch { observations.failed++; return null; }
  };
  const check = async (label, predicate) => {
    const row = await select(`SELECT CASE WHEN ${predicate} THEN 1 ELSE 0 END AS ok`, ['ok'], ['ok']);
    return { label, result: row ? row.ok ? 'MATCH' : 'MISMATCH' : 'QUERY_FAILED' };
  };
  const finish = () => {
    if (observations.primaryTrue >= 2
        && observations.primaryFalse === 0 && observations.primaryUnknown === 0) {
      receipt.providerBlockingEvidence = 'IMPORT_NOT_BLOCKING_AT_PRIMARY_OBSERVATIONS';
    }
    if (observations.primaryFalse || observations.primaryUnknown) receipt.blockers.push('PRIMARY_OBSERVATION_UNPROVEN');
    if (latest && (observations.primaryFalse || observations.primaryUnknown || observations.failed)) {
      receipt.status = 'INSPECTION_BLOCKED';
      if (observations.failed) receipt.blockers.push('QUERY_OBSERVATIONS_INCOMPLETE');
    }
    receipt.blockers = [...new Set(receipt.blockers)];
    return receipt;
  };
  const inventoryKeys = ['objectCount', 'tableCount', 'triggerCount', 'matchedObjectCount', ...objects.map((_, index) => `object_${index}`)];
  const inventory = await select(inventorySql(objects, prefix), inventoryKeys, objects.map((_, index) => `object_${index}`));
  if (!inventory) { receipt.blockers.push('OBJECT_INVENTORY_QUERY_FAILED'); return finish(); }
  const matched = objects.filter((_, index) => inventory[`object_${index}`] === 1);
  if (inventory.matchedObjectCount !== matched.length || inventory.objectCount < matched.length
      || inventory.tableCount + inventory.triggerCount > inventory.objectCount) {
    receipt.blockers.push('OBJECT_INVENTORY_INCONSISTENT'); return finish();
  }
  const rollbackPresent = latest && matched.some((object) => object.name === `${prefix}_rollback_guard`);
  const restoreMatched = matched.filter((object) => object.name !== `${prefix}_rollback_guard`).length;
  receipt.inventory = { objectCount: inventory.objectCount, tableCount: inventory.tableCount,
    triggerCount: inventory.triggerCount, expectedObjectCount: 58, matchedObjectCount: matched.length,
    missingObjectCount: 58 - restoreMatched, unexpectedObjectCount: inventory.objectCount - matched.length,
    exact: restoreMatched === 58 && inventory.objectCount === matched.length,
    ...(latest ? { expectedRestoreObjects: 58, canonicalRollbackGuardObserved: rollbackPresent } : {}) };
  if (receipt.inventory.unexpectedObjectCount) receipt.blockers.push('UNEXPECTED_RECOVERY_OBJECTS');
  if (inventory.objectCount && !receipt.inventory.exact) receipt.blockers.push('PARTIAL_RECOVERY_OBJECTS');

  for (const guard of selectedGuards) {
    const result = latest ? await observePreflightGuard(query, observations, guard)
      : await check(guard.label, guard.predicate);
    receipt.preMutationGuards.push(result);
    if (latest && guard.label === 'approved_internal_inventory'
        && (result.result !== 'MATCH' || result.servedByPrimary !== true)) {
      // Reserved inventory is established before any schema PRAGMA, including FK checks.
      for (const skipped of selectedGuards.slice(1)) receipt.preMutationGuards.push({
        label: skipped.label, result: 'NOT_EVALUATED', servedByPrimary: null,
      });
      if (result.result !== 'MATCH') receipt.blockers.push(`GUARD_${guard.label.toUpperCase()}_${result.result}`);
      if (result.servedByPrimary !== true) receipt.blockers.push('PRIMARY_OBSERVATION_UNPROVEN');
      return finish();
    }
  }
  const schemaGuard = selectedGuards.find((guard) => guard.label === 'known_schema_and_references');
  if (receipt.preMutationGuards.find((guard) => guard.label === schemaGuard.label).result !== 'MATCH') {
    const terms = topLevelTerms(schemaGuard.predicate);
    if (terms.length !== 18) throw stopped();
    const labels = [...Object.keys(RECOVERY_TABLES).map((table) => `table_shape_${table}`), 'active_triggers', 'incoming_foreign_keys'];
    for (let i = 0; i < labels.length; i++) {
      receipt.schemaChecks.push(await check(labels[i], terms.slice(i * 2, i * 2 + 2).join(' AND ')));
    }
  }
  for (const guard of receipt.preMutationGuards) {
    if (guard.result !== 'MATCH') receipt.blockers.push(`GUARD_${guard.label.toUpperCase()}_${guard.result}`);
  }
  if (inventory.objectCount === 0) {
    if (receipt.preMutationGuards.find((guard) => guard.label === 'bounded_observed_catalog').result === 'MATCH') {
      receipt.status = 'NO_RECOVERY_COMMIT_OBSERVED';
    }
    return finish();
  }

  const liveShapes = {};
  for (const table of Object.keys(RECOVERY_TABLES)) {
    const result = await check(`live_${table}`, shapePredicate(table, source.tableInfo[table]));
    liveShapes[table] = result.result === 'MATCH';
    receipt.objectSchemaChecks.push(result);
  }
  const valid = new Set();
  for (const object of matched.filter((item) => item.type === 'table')) {
    const result = await check(object.name, shapePredicate(object.name, shapes[object.name]));
    receipt.objectSchemaChecks.push(result);
    if (result.result === 'MATCH') valid.add(object.name);
  }
  if (rollbackPresent) {
    const object = objects.at(-1);
    const result = await check('rollback_guard_definition', `EXISTS (SELECT 1 FROM sqlite_schema
      WHERE name = ${literal(object.name)} AND type = 'table' AND tbl_name = ${literal(object.table)}
      AND sql = ${literal(object.sql)})`);
    receipt.objectSchemaChecks.push(result);
    if (result.result !== 'MATCH') valid.delete(object.name);
  }
  const definitions = matched.filter((item) => item.type === 'trigger');
  if (definitions.length) {
    const predicate = definitions.map((item) => `EXISTS (SELECT 1 FROM sqlite_schema WHERE name = ${literal(item.name)}
      AND type = 'trigger' AND tbl_name = ${literal(item.table)} AND sql = ${literal(item.sql)})`).join(' AND ');
    const result = await check('recovery_trigger_definitions', predicate);
    receipt.objectSchemaChecks.push(result);
  }
  for (const result of receipt.objectSchemaChecks) {
    if (result.result !== 'MATCH') receipt.blockers.push('RECOVERY_OR_LIVE_SCHEMA_UNPROVEN');
  }
  for (const table of Object.keys(RECOVERY_TABLES)) {
    for (const [kind, name] of [['live', table], ['archive', approved.archiveTables[table]], ['target', approved.targetTables[table]]]) {
      if (kind === 'live' ? !liveShapes[table] : !valid.has(name)) continue;
      const versionFields = table === 'recipes' ? [
        "coalesce(sum(CASE WHEN version = 1 THEN 1 ELSE 0 END), 0) AS v1Rows",
        "coalesce(sum(CASE WHEN version = 2 THEN 1 ELSE 0 END), 0) AS v2Rows",
        "coalesce(sum(CASE WHEN version IS NULL OR version NOT IN (1, 2) THEN 1 ELSE 0 END), 0) AS otherVersionRows",
      ] : [];
      const keys = ['rows', ...(versionFields.length ? ['v1Rows', 'v2Rows', 'otherVersionRows'] : [])];
      const result = await select(`SELECT count(1) AS rows${versionFields.length ? `, ${versionFields.join(', ')}` : ''} FROM ${name}`, keys);
      if (result) receipt.aggregates[kind][table] = result;
      else receipt.blockers.push('CATALOG_AGGREGATE_QUERY_FAILED');
    }
  }
  if (valid.has(`${prefix}_guard`)) {
    const labels = guards.map((guard) => literal(guard.label)).join(', ');
    receipt.guard = await select(`SELECT count(1) AS rows, count(DISTINCT label) AS distinctLabels,
      coalesce(sum(CASE WHEN label IN (${labels}) AND ok = 1 THEN 1 ELSE 0 END), 0) AS approvedPassingRows,
      coalesce(sum(CASE WHEN label NOT IN (${labels}) OR label IS NULL OR ok IS NULL OR ok <> 1 THEN 1 ELSE 0 END), 0) AS invalidRows
      FROM ${prefix}_guard`, ['rows', 'distinctLabels', 'approvedPassingRows', 'invalidRows']);
    if (!receipt.guard || receipt.guard.rows !== guardCount || receipt.guard.distinctLabels !== guardCount
        || receipt.guard.approvedPassingRows !== guardCount || receipt.guard.invalidRows !== 0) receipt.blockers.push('RECOVERY_GUARD_INCOMPLETE');
  }
  if (latest && valid.has(`${prefix}_rollback_guard`)) {
    const labels = rollbackGuards.map((guard) => literal(guard.label)).join(', ');
    receipt.rollbackGuard = await select(`SELECT count(1) AS rows, count(DISTINCT label) AS distinctLabels,
      coalesce(sum(CASE WHEN label IN (${labels}) AND ok = 1 THEN 1 ELSE 0 END), 0) AS approvedPassingRows,
      coalesce(sum(CASE WHEN label NOT IN (${labels}) OR label IS NULL OR ok IS NULL OR ok <> 1 THEN 1 ELSE 0 END), 0) AS invalidRows
      FROM ${prefix}_rollback_guard`, ['rows', 'distinctLabels', 'approvedPassingRows', 'invalidRows']);
    if (!receipt.rollbackGuard || receipt.rollbackGuard.rows !== rollbackGuards.length
        || receipt.rollbackGuard.distinctLabels !== rollbackGuards.length
        || receipt.rollbackGuard.approvedPassingRows !== rollbackGuards.length
        || receipt.rollbackGuard.invalidRows !== 0) receipt.blockers.push('ROLLBACK_GUARD_INCOMPLETE');
  }
  if (valid.has(`${prefix}_status`)) {
    const identity = `repair_id = ${literal(incident.repairId)} AND source_digest = ${literal(incident.sourceDigest)} AND runtime_fingerprint = ${literal(incident.runtimeFingerprint)}`;
    receipt.repairStatus = await select(`SELECT count(1) AS rows,
      coalesce(sum(CASE WHEN ${identity} THEN 1 ELSE 0 END), 0) AS exactIdentityRows,
      coalesce(sum(CASE WHEN ${identity} AND state = 'APPLIED' THEN 1 ELSE 0 END), 0) AS appliedRows,
      coalesce(sum(CASE WHEN ${identity} AND state = 'ROLLED_BACK' THEN 1 ELSE 0 END), 0) AS rolledBackRows
      FROM ${prefix}_status`, ['rows', 'exactIdentityRows', 'appliedRows', 'rolledBackRows']);
    if (!receipt.repairStatus || receipt.repairStatus.rows !== 1 || receipt.repairStatus.exactIdentityRows !== 1
        || receipt.repairStatus.appliedRows + receipt.repairStatus.rolledBackRows !== 1) receipt.blockers.push('RECOVERY_STATUS_IDENTITY_UNPROVEN');
  }
  if (receipt.inventory.exact && receipt.objectSchemaChecks.every((check) => check.result === 'MATCH')
      && receipt.guard?.rows === guardCount && receipt.guard.distinctLabels === guardCount
      && receipt.guard.approvedPassingRows === guardCount && receipt.guard.invalidRows === 0
      && receipt.repairStatus?.rows === 1 && receipt.repairStatus.exactIdentityRows === 1) {
    if (receipt.repairStatus.appliedRows === 1) {
      if (!latest) receipt.status = 'ORIGINAL_RECOVERY_APPLIED_MARKER_OBSERVED';
      else {
        const targetCountsMatch = Object.keys(RECOVERY_TABLES).every((table) =>
          receipt.aggregates.live[table]?.rows === source.tables[table].length
          && receipt.aggregates.target[table]?.rows === source.tables[table].length);
        const archiveCountsMatch = receipt.aggregates.archive.recipes?.rows === approved.receipt.expectedBefore.recipes
          && receipt.aggregates.archive.recipe_ingredients?.rows === approved.receipt.expectedBefore.ingredientRows
          && receipt.aggregates.archive.recipe_runtime_ingredient_order?.rows === approved.receipt.expectedBefore.orderRows;
        const currentGuardsMatch = receipt.preMutationGuards.every((guard) => guard.result === 'MATCH'
          || (guard.label === 'bounded_observed_catalog' && guard.result === 'MISMATCH'));
        if (targetCountsMatch && archiveCountsMatch && currentGuardsMatch && !rollbackPresent) {
          receipt.status = appliedMarkerStatus;
          receipt.blockers = receipt.blockers.filter((blocker) => blocker !== 'GUARD_BOUNDED_OBSERVED_CATALOG_MISMATCH');
        } else receipt.blockers.push('APPLIED_MARKER_CATALOG_COUNTS_UNPROVEN');
      }
    }
    if (receipt.repairStatus.rolledBackRows === 1) {
      if (!latest) receipt.status = 'ORIGINAL_RECOVERY_ROLLED_BACK_MARKER_OBSERVED';
      else {
        const restoredCountsMatch = Object.keys(RECOVERY_TABLES).every((table) =>
          receipt.aggregates.live[table]?.rows === receipt.aggregates.archive[table]?.rows
          && receipt.aggregates.target[table]?.rows === source.tables[table].length);
        if (rollbackPresent && receipt.rollbackGuard?.rows === rollbackGuards.length
            && receipt.rollbackGuard.distinctLabels === rollbackGuards.length
            && receipt.rollbackGuard.approvedPassingRows === rollbackGuards.length
            && receipt.rollbackGuard.invalidRows === 0 && restoredCountsMatch
            && receipt.preMutationGuards.every((guard) => guard.result === 'MATCH')) {
          receipt.status = rolledBackMarkerStatus;
        } else receipt.blockers.push('ROLLED_BACK_MARKER_CATALOG_COUNTS_UNPROVEN');
      }
    }
  }
  receipt.blockers = [...new Set(receipt.blockers)];
  return finish();
}
