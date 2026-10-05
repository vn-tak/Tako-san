import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { verifyRecipeAuthorityEvidence } from './release-check.mjs';
import { authorizeRecovery } from './production-catalog-recovery-approval.mjs';

export const PRODUCTION_CATALOG_WORKER_SHA = '136cb6ff3d2921eac237c7b106b37ab5ee12a13f';
export const PRODUCTION_CATALOG_D1_ID = 'f975ec39-b2c8-4a2a-80e1-0366054599d3';
export const PRODUCTION_CATALOG_ORIGIN = 'https://frigo.tungjpstore.net';
const API = 'https://api.cloudflare.com/client/v4';
const FLAGS = Object.freeze({
  RECIPE_CATALOG_MODE: 'static',
  RECIPE_CATALOG_D1_CANARY_PERCENT: '0',
  RECIPE_CATALOG_CUTOVER_ENABLED: 'false',
});
const RELEASE_PROOF = Object.freeze({
  schemaVersion: 1, releaseId: 'rel-bd00a4f53fcaeee4', legacyBaselineCount: 71,
  legacyBaselineFingerprint: '9ae153e64d34b30d72bb985d4070d8e210201219c0e8f8998ce8f99057fc7c3f',
  expectedRecipeCount: 500,
  expectedRuntimeFingerprint: 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37',
});
const VERSION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const BINDING_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/;
const MAX_CONTENT_BYTES = 16 * 1024 * 1024;
const MAX_JSON_BYTES = 2 * 1024 * 1024;
const BINDING_FIELDS = {
  plain_text: ['name', 'type', 'text'],
  json: ['name', 'type', 'json'],
  secret_text: ['name', 'type'],
  secret_key: ['name', 'type', 'algorithm', 'format', 'usages'],
  d1: ['name', 'type', 'id', 'database_id', 'database_name'],
  r2_bucket: ['name', 'type', 'bucket_name', 'jurisdiction'],
  kv_namespace: ['name', 'type', 'namespace_id'],
  queue: ['name', 'type', 'queue_name', 'queue_id', 'delivery_delay'],
  ai: ['name', 'type'],
  assets: ['name', 'type'],
  send_email: ['name', 'type', 'destination_address', 'allowed_destination_addresses', 'allowed_sender_addresses'],
  version_metadata: ['name', 'type'],
};

export class ProductionCatalogPinError extends Error {
  constructor(code, proof) {
    super(`Production catalog static pin failed (${code})`);
    this.name = 'ProductionCatalogPinError';
    this.code = code;
    if (proof) this.proof = proof;
  }
}
const fail = (code) => { throw new ProductionCatalogPinError(code); };
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
function onlyKeys(value, keys, code = 'UNSUPPORTED_METADATA') {
  if (!isObject(value) || Object.keys(value).some((key) => !keys.includes(key))) fail(code);
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
const digest = (value) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const same = (a, b) => digest(a) === digest(b);
const validId = (id) => typeof id === 'string' && VERSION_ID.test(id);
function safeField(value) {
  return /^[A-Za-z_][A-Za-z0-9_.-]{0,127}$/.test(value) ? value : '[unsupported-field-name]';
}
function shape(value, depth = 0) {
  if (depth > 10) return 'nested';
  if (value === null) return 'null';
  if (Array.isArray(value)) return { type: 'array', items: [...new Map(value.map((v) => {
    const s = shape(v, depth + 1);
    return [JSON.stringify(s), s];
  })).values()].slice(0, 20) };
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().slice(0, 100).map((key) => [safeField(key), shape(value[key], depth + 1)]));
  return typeof value;
}
function inputs(options) {
  const env = options.env ?? process.env;
  options = {
    ...options,
    accountId: options.accountId ?? env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: options.apiToken ?? env.CLOUDFLARE_API_TOKEN,
    releaseVerifyToken: options.releaseVerifyToken ?? env.RELEASE_VERIFY_TOKEN,
  };
  if (!/^[a-f0-9]{32}$/i.test(options.accountId ?? '')
      || typeof options.apiToken !== 'string' || !options.apiToken || /\s/.test(options.apiToken)
      || options.apiToken.length > 4096) fail('INVALID_INPUT');
  if (options.scriptName !== undefined && options.scriptName !== 'frigo') fail('INVALID_INPUT');
  return { ...options, scriptName: 'frigo', fetchImpl: options.fetchImpl ?? fetch, deadlineAt: Date.now() + 180_000 };
}
async function boundedBody(response, limit) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) fail('PROVIDER_SIZE_LIMIT');
  const reader = response.body?.getReader();
  if (!reader) fail('INVALID_PROVIDER_RESPONSE');
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); fail('PROVIDER_SIZE_LIMIT'); }
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    if (error instanceof ProductionCatalogPinError) throw error;
    fail('PROVIDER_REQUEST_FAILED');
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, length);
}
function client(options) {
  const root = `${API}/accounts/${options.accountId}/workers/scripts/frigo`;
  return async (path, { method = 'GET', body, raw = false } = {}) => {
    if (Date.now() >= options.deadlineAt) fail('DEADLINE_EXCEEDED');
    if (!['GET', 'POST'].includes(method)
        || !(/^\/deployments$|^\/script-settings$|^\/versions(?:\?deployable=true)?$|^\/versions\/[A-Za-z0-9._-]+$|^\/content\/v2\?version=[A-Za-z0-9._-]+$|^\/versions\?bindings_inherit=strict&excludeScript=true$/).test(path)
        || (method === 'POST' && !['/deployments', '/versions?bindings_inherit=strict&excludeScript=true'].includes(path))) fail('UNSUPPORTED_REQUEST');
    let response;
    try {
      response = await options.fetchImpl(`${root}${path}`, {
        method, body, redirect: 'error', signal: AbortSignal.timeout(Math.min(15_000, options.deadlineAt - Date.now())),
        headers: {
          Authorization: `Bearer ${options.apiToken}`, Accept: raw ? 'multipart/form-data' : 'application/json',
          ...(typeof body === 'string' ? { 'Content-Type': 'application/json' } : {}),
        },
      });
    } catch { fail('PROVIDER_REQUEST_FAILED'); }
    if (!response.ok) fail('PROVIDER_REQUEST_FAILED');
    if (raw) return response;
    let envelope;
    try {
      envelope = JSON.parse((await boundedBody(response, MAX_JSON_BYTES)).toString('utf8'));
    } catch { fail('INVALID_PROVIDER_RESPONSE'); }
    if (envelope?.success !== true || envelope.result === undefined) fail('INVALID_PROVIDER_RESPONSE');
    return envelope.result;
  };
}
function stableDeployment(result) {
  const deployment = result?.deployments?.[0];
  if (!validId(deployment?.id) || deployment.strategy !== 'percentage'
      || deployment.versions?.length !== 1 || !validId(deployment.versions[0]?.version_id)
      || deployment.versions[0].percentage !== 100) fail('UNSTABLE_DEPLOYMENT');
  return { deploymentId: deployment.id, versionId: deployment.versions[0].version_id, percentage: 100 };
}
async function snapshot(api) {
  const deployment = stableDeployment(await api('/deployments'));
  const versions = await api('/versions');
  const settings = await api('/script-settings');
  if (!Array.isArray(versions?.items) || !validId(versions.items[0]?.id) || !isObject(settings)) fail('INVALID_PROVIDER_RESPONSE');
  return { deployment, versions: versions.items.slice(0, 20), latestVersionId: versions.items[0].id, settings };
}
function bindingValue(bindings, name) {
  const binding = bindings.find((b) => b.name === name);
  if (binding?.type !== 'plain_text') fail('WORKER_BINDING_MISMATCH');
  return binding.text;
}
function checkedVersion(version, expectedId) {
  onlyKeys(version, ['id', 'number', 'metadata', 'resources']);
  if (version.id !== expectedId) fail('VERSION_ID_MISMATCH');
  onlyKeys(version.resources, ['bindings', 'script', 'script_runtime', 'assets']);
  onlyKeys(version.metadata ?? {}, ['created_on', 'source', 'author_email', 'author_id', 'annotations', 'has_preview']);
  const resources = version.resources;
  onlyKeys(resources.script, ['etag', 'handlers', 'named_handlers', 'last_deployed_from', 'placement_mode', 'placement_status']);
  onlyKeys(resources.script_runtime, ['compatibility_date', 'compatibility_flags', 'limits', 'usage_model', 'migration_tag', 'exports']);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(resources.script_runtime.compatibility_date ?? '')
      || !Array.isArray(resources.script_runtime.compatibility_flags)
      || resources.script_runtime.compatibility_flags.some((v) => typeof v !== 'string')
      || (resources.script_runtime.migration_tag !== undefined && resources.script_runtime.migration_tag !== '')
      || (resources.script_runtime.exports !== undefined && Object.keys(resources.script_runtime.exports).length)
      || ![undefined, 'off', 'smart'].includes(resources.script.placement_mode)) fail('UNSUPPORTED_RUNTIME');
  if (!Array.isArray(resources.bindings)) fail('UNSUPPORTED_BINDINGS');
  const names = new Set();
  for (const binding of resources.bindings) {
    if (!BINDING_NAME.test(binding?.name ?? '') || names.has(binding.name)
        || !Object.hasOwn(BINDING_FIELDS, binding.type)) fail('UNSUPPORTED_BINDINGS');
    onlyKeys(binding, BINDING_FIELDS[binding.type], 'UNSUPPORTED_BINDINGS');
    names.add(binding.name);
    if (Object.hasOwn(FLAGS, binding.name) && binding.type !== 'plain_text') fail('UNSUPPORTED_BINDINGS');
  }
  if (bindingValue(resources.bindings, 'GIT_COMMIT') !== PRODUCTION_CATALOG_WORKER_SHA
      || bindingValue(resources.bindings, 'ENVIRONMENT') !== 'production') fail('WORKER_SOURCE_MISMATCH');
  const database = resources.bindings.find((b) => b.name === 'DB');
  if (database?.type !== 'd1' || (database.id ?? database.database_id) !== PRODUCTION_CATALOG_D1_ID
      || (database.id !== undefined && database.database_id !== undefined && database.id !== database.database_id)) fail('D1_BINDING_MISMATCH');
  if (resources.bindings.filter((b) => b.type === 'assets').length !== 1
      || !resources.bindings.some((b) => b.type === 'assets' && b.name === 'ASSETS')) fail('ASSETS_BINDING_MISMATCH');
  return version;
}
function checkedSettings(settings) {
  onlyKeys(settings, ['logpush', 'tail_consumers', 'observability', 'tags']);
  return settings;
}
function stableResources(version) {
  const { script, bindings, ...rest } = version.resources;
  const { last_deployed_from: _client, ...scriptConfig } = script;
  return {
    ...rest, script: scriptConfig,
    bindings: bindings.filter((b) => !Object.hasOwn(FLAGS, b.name)).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
function isStatic(version) {
  return Object.entries(FLAGS).every(([name, text]) => version.resources.bindings.some((b) => b.name === name && b.type === 'plain_text' && b.text === text));
}
async function modules(api, versionId) {
  const response = await api(`/content/v2?version=${versionId}`, { raw: true });
  if (!response.headers.get('content-type')?.startsWith('multipart/form-data')) fail('UNSUPPORTED_MODULE_FORMAT');
  const entrypoint = response.headers.get('cf-entrypoint');
  let form;
  try {
    const bytes = await boundedBody(response, MAX_CONTENT_BYTES + 1024 * 1024);
    form = await new Response(bytes, { headers: response.headers }).formData();
  } catch (error) {
    if (error instanceof ProductionCatalogPinError) throw error;
    fail('INVALID_MODULE_RESPONSE');
  }
  const result = [];
  const names = new Set();
  let size = 0;
  for (const [name, part] of form.entries()) {
    if (typeof part === 'string' || !/^[A-Za-z0-9_][A-Za-z0-9_./-]{0,199}$/.test(name)
        || name.split('/').includes('..') || names.has(name) || name === '__STATIC_CONTENT_MANIFEST'
        || !['application/javascript+module', 'text/javascript+module', 'application/javascript', 'text/javascript', 'application/wasm', 'text/plain', 'application/octet-stream', 'application/source-map'].includes(part.type)) fail('UNSUPPORTED_MODULE_FORMAT');
    names.add(name);
    const bytes = Buffer.from(await part.arrayBuffer());
    size += bytes.length;
    if (size > MAX_CONTENT_BYTES) fail('MODULE_SIZE_LIMIT');
    result.push({ name, type: part.type, bytes, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  if (!names.has(entrypoint) || !result.length) fail('INVALID_MODULE_RESPONSE');
  result.sort((a, b) => a.name.localeCompare(b.name));
  return { entrypoint, parts: result, digest: digest({ entrypoint, parts: result.map(({ name, type, sha256 }) => ({ name, type, sha256 })) }) };
}
function moduleProof(content) {
  return { entrypoint: content.entrypoint, sha256: content.digest, parts: content.parts.map(({ name, type, sha256 }) => ({ name, type, sha256 })) };
}
function uploadForm(version, content) {
  const runtime = version.resources.script_runtime;
  const metadata = {
    main_module: content.entrypoint,
    bindings: [
      ...version.resources.bindings.filter((b) => !Object.hasOwn(FLAGS, b.name)).map((b) => ({ name: b.name, type: 'inherit' })),
      ...Object.entries(FLAGS).map(([name, text]) => ({ name, type: 'plain_text', text })),
    ],
    compatibility_date: runtime.compatibility_date,
    compatibility_flags: runtime.compatibility_flags,
    ...(runtime.limits !== undefined ? { limits: runtime.limits } : {}),
    ...(runtime.usage_model !== undefined ? { usage_model: runtime.usage_model } : {}),
    ...(version.resources.script.placement_mode === 'smart' ? { placement: { mode: 'smart' } } : {}),
    keep_assets: true,
    annotations: { 'workers/message': 'Preserve deployed source and assets; pin catalog static before V1 recovery', 'workers/commit_sha': PRODUCTION_CATALOG_WORKER_SHA },
  };
  const form = new FormData();
  form.set('metadata', JSON.stringify(metadata));
  for (const part of content.parts) form.set(part.name, new Blob([part.bytes], { type: part.type }), part.name);
  return form;
}
async function fence(api, original, expectedLatest, beforeMutation, mutation) {
  try { await beforeMutation(mutation); } catch { fail('RELEASE_FENCE_FAILED'); }
  const fresh = await snapshot(api);
  if (!same(fresh.deployment, original.deployment) || fresh.latestVersionId !== expectedLatest
      || !same(fresh.settings, original.settings)) fail('CONCURRENT_WORKER_CHANGE');
}
async function workerJson(options, path, authenticated = false) {
  if (Date.now() >= options.deadlineAt) fail('DEADLINE_EXCEEDED');
  let response;
  try {
    response = await options.fetchImpl(`${PRODUCTION_CATALOG_ORIGIN}${path}`, {
      redirect: 'error', signal: AbortSignal.timeout(Math.min(15_000, options.deadlineAt - Date.now())),
      headers: { Accept: 'application/json', ...(authenticated ? { Authorization: `Bearer ${options.releaseVerifyToken}` } : {}) },
    });
    if (!response.ok) fail('WORKER_VERIFICATION_FAILED');
    return JSON.parse((await boundedBody(response, MAX_JSON_BYTES)).toString('utf8'));
  } catch { fail('WORKER_VERIFICATION_FAILED'); }
}
async function verifyStaticHealth(options) {
  const authority = await workerJson(options, '/api/v1/health/recipe-authority', true);
  const ready = await workerJson(options, '/api/v1/health/ready');
  if (ready.commit !== PRODUCTION_CATALOG_WORKER_SHA || ready.environment !== 'production'
      || !['ok', 'degraded'].includes(ready.status)
      || !isObject(ready.recipeAuthority)
      || ['configuredMode', 'cutoverEnabled', 'canaryPercent', 'globalSource', 'fallbackReason', 'releaseId', 'expectedRecipeCount']
        .some((key) => ready.recipeAuthority[key] !== authority[key])) fail('WORKER_VERIFICATION_FAILED');
  try {
    return verifyRecipeAuthorityEvidence({
      sha: PRODUCTION_CATALOG_WORKER_SHA, environment: 'production', recipeCatalogMode: 'static',
      recipeCatalogCanaryPercent: 0, recipeCatalogCutoverEnabled: false,
    }, authority, options.release);
  } catch { fail('WORKER_VERIFICATION_FAILED'); }
}
function baseProof(original, version, content) {
  return {
    schemaVersion: 1, sourceSha: PRODUCTION_CATALOG_WORKER_SHA,
    previousVersion: original.deployment.versionId,
    originalDeployment: original.deployment,
    originalLatestVersionId: original.latestVersionId,
    immutableResourcesSha256: digest(stableResources(version)),
    scriptSettingsSha256: digest(original.settings), modules: moduleProof(content),
    changedBindingNames: Object.keys(FLAGS), catalogRestoreStarted: false,
  };
}

/** Read-only schema inspection deliberately excludes every binding and setting value. */
export async function inspectProductionCatalogWorker(options = {}) {
  const resolved = inputs(options);
  const api = client(resolved);
  const current = await snapshot(api);
  const version = await api(`/versions/${current.deployment.versionId}`);
  const content = await modules(api, current.deployment.versionId);
  let compatibilityCode = 'SUPPORTED';
  try { checkedVersion(version, current.deployment.versionId); checkedSettings(current.settings); }
  catch (error) { compatibilityCode = error instanceof ProductionCatalogPinError ? error.code : 'UNSUPPORTED_METADATA'; }
  let served = { authorityVerified: false, authorityCode: 'WORKER_VERIFICATION_FAILED' };
  try {
    if (typeof resolved.releaseVerifyToken !== 'string' || resolved.releaseVerifyToken.length < 32) fail('INVALID_INPUT');
    const authority = await workerJson(resolved, '/api/v1/health/recipe-authority', true);
    const ready = await workerJson(resolved, '/api/v1/health/ready');
    const bindings = version.resources?.bindings;
    if (!Array.isArray(bindings)) fail('UNSUPPORTED_BINDINGS');
    const configuredMode = bindingValue(bindings, 'RECIPE_CATALOG_MODE');
    const percentText = bindingValue(bindings, 'RECIPE_CATALOG_D1_CANARY_PERCENT');
    const cutoverText = bindingValue(bindings, 'RECIPE_CATALOG_CUTOVER_ENABLED');
    if (!['static', 'shadow', 'canary', 'd1'].includes(configuredMode)
        || !/^(?:0|[1-9][0-9]?|100)$/.test(percentText) || !['true', 'false'].includes(cutoverText)) fail('WORKER_BINDING_MISMATCH');
    const canaryPercent = Number(percentText);
    const cutoverEnabled = cutoverText === 'true';
    if (bindingValue(bindings, 'GIT_COMMIT') !== PRODUCTION_CATALOG_WORKER_SHA
        || bindingValue(bindings, 'ENVIRONMENT') !== 'production'
        || authority.schemaVersion !== 1 || authority.commit !== PRODUCTION_CATALOG_WORKER_SHA
        || authority.environment !== 'production' || ready.commit !== PRODUCTION_CATALOG_WORKER_SHA
        || ready.environment !== 'production' || !['ok', 'degraded'].includes(ready.status)
        || authority.configuredMode !== configuredMode || authority.canaryPercent !== canaryPercent
        || authority.cutoverEnabled !== cutoverEnabled || !isObject(ready.recipeAuthority)
        || ['configuredMode', 'cutoverEnabled', 'canaryPercent', 'globalSource', 'fallbackReason', 'releaseId', 'expectedRecipeCount']
          .some((key) => ready.recipeAuthority[key] !== authority[key])) fail('WORKER_VERIFICATION_FAILED');
    if (configuredMode === 'static') {
      verifyRecipeAuthorityEvidence({ sha: PRODUCTION_CATALOG_WORKER_SHA, environment: 'production',
        recipeCatalogMode: 'static', recipeCatalogCanaryPercent: 0, recipeCatalogCutoverEnabled: false }, authority, RELEASE_PROOF);
    }
    const fresh = await snapshot(api);
    if (!same(fresh.deployment, current.deployment) || !same(fresh.settings, current.settings)
        || fresh.latestVersionId !== current.latestVersionId) fail('CONCURRENT_WORKER_CHANGE');
    served = { configuredMode, cutoverEnabled, canaryPercent, authorityVerified: true };
  } catch (error) {
    served.authorityCode = error instanceof ProductionCatalogPinError ? error.code : 'WORKER_VERIFICATION_FAILED';
  }
  return {
    ...served, schemaVersion: 1, mode: 'inspect', mutations: 0,
    deployment: current.deployment, latestVersionId: current.latestVersionId,
    latestEqualsActive: current.latestVersionId === current.deployment.versionId,
    compatibilityCode, versionSchema: shape(version), scriptSettingsSchema: shape(current.settings),
    bindingSchema: Array.isArray(version?.resources?.bindings) ? version.resources.bindings.map((b) => ({
      name: BINDING_NAME.test(b?.name ?? '') ? b.name : '[unsupported-binding-name]',
      type: Object.hasOwn(BINDING_FIELDS, b?.type ?? '') ? b.type : 'unsupported', fields: shape(b),
    })) : [], modules: moduleProof(content),
    assetProofAvailable: isObject(version?.resources?.assets) && Object.keys(version.resources.assets).length > 0,
    checkedAt: new Date().toISOString(),
  };
}

/** This helper ends before any D1 write; its only rollback restores the original Worker version. */
export async function pinProductionCatalogStatic(options = {}) {
  const resolved = inputs(options);
  if (!resolved.release) {
    try {
      resolved.release = JSON.parse(execFileSync('git', ['show', `${PRODUCTION_CATALOG_WORKER_SHA}:packages/recipes/src/import/catalog-release.current.json`],
        { cwd: options.cwd ?? process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
    } catch { fail('INVALID_SOURCE_RELEASE'); }
  }
  if (!validId(resolved.expectedVersionId) || resolved.catalogRestoreStarted !== false
      || typeof resolved.beforeMutation !== 'function' || !resolved.release
      || typeof resolved.releaseVerifyToken !== 'string' || resolved.releaseVerifyToken.length < 32) fail('INVALID_INPUT');
  const attempts = resolved.healthAttempts ?? 13;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 13
      || Object.entries(RELEASE_PROOF).some(([key, value]) => resolved.release[key] !== value)) fail('INVALID_INPUT');
  const api = client(resolved);
  const original = await snapshot(api);
  if (original.deployment.versionId !== resolved.expectedVersionId) fail('ACTIVE_VERSION_MISMATCH');
  checkedSettings(original.settings);
  const version = checkedVersion(await api(`/versions/${original.deployment.versionId}`), original.deployment.versionId);
  const content = await modules(api, version.id);
  const proof = baseProof(original, version, content);
  const baselineHealth = await workerJson(resolved, '/api/v1/health/recipe-authority', true);
  if (baselineHealth?.schemaVersion !== 1 || baselineHealth.commit !== PRODUCTION_CATALOG_WORKER_SHA
      || baselineHealth.environment !== 'production') fail('WORKER_SOURCE_MISMATCH');
  let targetVersionId = version.id;
  let deploymentAttempted = false;
  let targetContent = content;
  try {
    if (isStatic(version)) {
      proof.method = 'already-static';
      await fence(api, original, original.latestVersionId, resolved.beforeMutation, 'verify-static');
    } else {
      // Existing versions are reusable only if assets and secrets have immutable identity proof.
      const canReuse = isObject(version.resources.assets)
        && typeof version.resources.assets.id === 'string'
        && !version.resources.bindings.some((b) => ['secret_text', 'secret_key'].includes(b.type));
      let candidate;
      if (canReuse) {
        for (const item of original.versions) {
          if (item.id === version.id || !validId(item.id)) continue;
          let detail;
          try { detail = checkedVersion(await api(`/versions/${item.id}`), item.id); }
          catch (error) { if (error.code === 'PROVIDER_REQUEST_FAILED') throw error; continue; }
          if (!isStatic(detail) || !same(stableResources(version), stableResources(detail))) continue;
          const candidateContent = await modules(api, item.id);
          if (candidateContent.digest === content.digest) { candidate = detail; targetContent = candidateContent; break; }
        }
      }
      if (candidate) {
        targetVersionId = candidate.id;
        proof.method = 'reuse-equivalent-version';
        proof.assets = { method: 'immutable-provider-identity', sha256: digest(version.resources.assets) };
      } else {
        if (original.latestVersionId !== version.id) fail('LATEST_VERSION_MISMATCH');
        await fence(api, original, version.id, resolved.beforeMutation, 'upload');
        const uploaded = await api('/versions?bindings_inherit=strict&excludeScript=true', { method: 'POST', body: uploadForm(version, content) });
        if (!validId(uploaded?.id) || uploaded.id === version.id) fail('INVALID_PROVIDER_RESPONSE');
        targetVersionId = uploaded.id;
        proof.method = 'clone-deployed-version';
        proof.assets = { method: 'cloudflare-keep-assets-from-latest-version', sourceVersionId: version.id };
      }
      proof.targetVersionId = targetVersionId;
      const target = checkedVersion(await api(`/versions/${targetVersionId}`), targetVersionId);
      targetContent = await modules(api, targetVersionId);
      if (!isStatic(target) || !same(stableResources(version), stableResources(target))
          || targetContent.digest !== content.digest) fail('CLONE_EQUIVALENCE_FAILED');
      await fence(api, original, candidate ? original.latestVersionId : targetVersionId, resolved.beforeMutation, 'deploy');
      deploymentAttempted = true;
      const deployed = await api('/deployments', {
        method: 'POST', body: JSON.stringify({ strategy: 'percentage', versions: [{ version_id: targetVersionId, percentage: 100 }] }),
      });
      if (!validId(deployed?.id)) fail('INVALID_PROVIDER_RESPONSE');
      proof.targetDeploymentId = deployed.id;
    }
    let authority;
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (Date.now() >= resolved.deadlineAt) fail('DEADLINE_EXCEEDED');
      try { authority = await verifyStaticHealth(resolved); break; }
      catch { if (attempt + 1 === attempts) fail('WORKER_VERIFICATION_FAILED'); }
      if (Date.now() + 5_000 >= resolved.deadlineAt) fail('DEADLINE_EXCEEDED');
      await (resolved.wait ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))))(5_000);
    }
    const after = await snapshot(api);
    if (after.deployment.versionId !== targetVersionId || !same(after.settings, original.settings)) fail('POST_DEPLOYMENT_MISMATCH');
    const finalVersion = checkedVersion(await api(`/versions/${targetVersionId}`), targetVersionId);
    const finalContent = await modules(api, targetVersionId);
    if (!isStatic(finalVersion) || !same(stableResources(version), stableResources(finalVersion))
        || finalContent.digest !== content.digest) fail('POST_DEPLOYMENT_MISMATCH');
    proof.targetVersionId = targetVersionId;
    proof.versionId = targetVersionId;
    proof.deployment = after.deployment;
    proof.authority = authority;
    proof.status = 'static-verified';
    proof.checkedAt = new Date().toISOString();
    return proof;
  } catch (error) {
    const code = error instanceof ProductionCatalogPinError ? error.code : 'PIN_FAILED';
    proof.status = 'failed';
    proof.failureCode = code;
    if (deploymentAttempted) {
      try {
        // No force retry: a secret rotation or concurrent deployment makes automatic rollback unsafe.
        const fresh = await snapshot(api);
        if (fresh.deployment.versionId === version.id && same(fresh.settings, original.settings)) {
          proof.rollback = { status: 'original-active', ...fresh.deployment };
        } else {
          if (fresh.deployment.versionId !== targetVersionId || !same(fresh.settings, original.settings)
              || fresh.latestVersionId !== targetVersionId) fail('ROLLBACK_PRECONDITION_FAILED');
          const target = checkedVersion(await api(`/versions/${targetVersionId}`), targetVersionId);
          if (!same(stableResources(version), stableResources(target))) fail('ROLLBACK_PRECONDITION_FAILED');
          try { await resolved.beforeMutation('rollback'); } catch { fail('RELEASE_FENCE_FAILED'); }
          const freshAgain = await snapshot(api);
          if (!same(fresh, freshAgain)) fail('CONCURRENT_WORKER_CHANGE');
          await api('/deployments', { method: 'POST', body: JSON.stringify({ strategy: 'percentage', versions: [{ version_id: version.id, percentage: 100 }] }) });
          const restored = await snapshot(api);
          if (restored.deployment.versionId !== version.id || !same(restored.settings, original.settings)) fail('ROLLBACK_VERIFICATION_FAILED');
          const restoredVersion = checkedVersion(await api(`/versions/${version.id}`), version.id);
          const restoredContent = await modules(api, version.id);
          if (!same(stableResources(version), stableResources(restoredVersion)) || restoredContent.digest !== content.digest) fail('ROLLBACK_VERIFICATION_FAILED');
          proof.rollback = { status: 'original-restored-before-catalog-write', ...restored.deployment };
        }
      } catch { proof.rollback = { status: 'failed-closed', code: 'ROLLBACK_NOT_PROVEN' }; }
    }
    throw new ProductionCatalogPinError(code, proof);
  }
}

function cliArgs(argv) {
  const [mode, ...args] = argv;
  if (!['inspect', 'pin'].includes(mode) || args.length % 2) fail('INVALID_INPUT');
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--out', '--expected-version'].includes(args[i]) || Object.hasOwn(values, args[i]) || !args[i + 1]) fail('INVALID_INPUT');
    values[args[i]] = args[i + 1];
  }
  if (!values['--out'] || (mode === 'pin' && !values['--expected-version'])) fail('INVALID_INPUT');
  return { mode, output: values['--out'], expectedVersionId: values['--expected-version'] };
}
async function main() {
  const args = cliArgs(process.argv.slice(2));
  const options = { accountId: process.env.CLOUDFLARE_ACCOUNT_ID, apiToken: process.env.CLOUDFLARE_API_TOKEN };
  let proof;
  try {
    if (args.mode === 'inspect') proof = await inspectProductionCatalogWorker(options);
    else {
      const release = JSON.parse(execFileSync('git', ['show', `${PRODUCTION_CATALOG_WORKER_SHA}:packages/recipes/src/import/catalog-release.current.json`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
      proof = await pinProductionCatalogStatic({
        ...options, expectedVersionId: args.expectedVersionId, catalogRestoreStarted: false,
        release, releaseVerifyToken: process.env.RELEASE_VERIFY_TOKEN,
        beforeMutation: async () => {
          await authorizeRecovery();
        },
      });
    }
  } catch (error) {
    if (error instanceof ProductionCatalogPinError && error.proof) writeFileSync(args.output, `${JSON.stringify(error.proof, null, 2)}\n`, { mode: 0o600 });
    throw error;
  }
  writeFileSync(args.output, `${JSON.stringify(proof, null, 2)}\n`, { mode: 0o600 });
  console.log(`Production catalog ${args.mode} proof saved`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof ProductionCatalogPinError ? error.message : 'Production catalog static pin failed (CLI_FAILED)');
    process.exitCode = 1;
  });
}
