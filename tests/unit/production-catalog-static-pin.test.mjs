import { describe, expect, it, vi } from 'vitest';
import { inspectProductionCatalogWorker, pinProductionCatalogStatic, PRODUCTION_CATALOG_D1_ID, PRODUCTION_CATALOG_WORKER_SHA } from '../../scripts/production-catalog-static-pin.mjs';

const release = {
  schemaVersion: 1, releaseId: 'rel-bd00a4f53fcaeee4', legacyBaselineCount: 71,
  legacyBaselineFingerprint: '9ae153e64d34b30d72bb985d4070d8e210201219c0e8f8998ce8f99057fc7c3f',
  expectedRecipeCount: 500, expectedRuntimeFingerprint: 'f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37',
};
const env = { CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_API_TOKEN: 'never-log-api-token', RELEASE_VERIFY_TOKEN: 'never-log-release-token'.repeat(3) };
const flagNames = ['RECIPE_CATALOG_MODE', 'RECIPE_CATALOG_D1_CANARY_PERCENT', 'RECIPE_CATALOG_CUTOVER_ENABLED'];
function worker(id = 'original', mode = 'd1') {
  return { id, number: 1, metadata: { created_on: '2026-10-05', source: 'api' }, resources: {
    bindings: [
      { name: 'GIT_COMMIT', type: 'plain_text', text: PRODUCTION_CATALOG_WORKER_SHA },
      { name: 'ENVIRONMENT', type: 'plain_text', text: 'production' },
      { name: 'DB', type: 'd1', id: PRODUCTION_CATALOG_D1_ID },
      { name: 'ASSETS', type: 'assets' }, { name: 'SESSION_SECRET', type: 'secret_text' },
      { name: 'QWEN_BASE_URL', type: 'plain_text', text: 'https://provider.invalid' },
      ...flagNames.map((name, i) => ({ name, type: 'plain_text', text: i === 0 ? mode : i === 1 ? '0' : mode === 'd1' ? 'true' : 'false' })),
    ],
    script: { etag: 'same-code', handlers: ['fetch', 'queue', 'scheduled'], placement_mode: 'off' },
    script_runtime: { compatibility_date: '2024-11-01', compatibility_flags: ['nodejs_compat'], usage_model: 'standard', limits: { cpu_ms: 100 } },
  } };
}
function authority(mode = 'static') {
  return {
    schemaVersion: 1, environment: 'production', commit: PRODUCTION_CATALOG_WORKER_SHA,
    configuredMode: mode, cutoverEnabled: mode === 'd1', canaryPercent: 0,
    releaseId: release.releaseId, expectedRecipeCount: 500, expectedRuntimeFingerprint: release.expectedRuntimeFingerprint,
    selectedSource: mode === 'static' ? 'static' : 'd1', actualSource: mode === 'static' ? 'static' : 'd1',
    globalSource: mode === 'static' ? 'static' : 'd1', fallbackReason: null,
    d1Readiness: mode === 'static' ? 'not_evaluated' : 'ready', d1ReadinessCode: null,
    servedRecipeCount: mode === 'static' ? 71 : 500,
    servedFingerprint: mode === 'static' ? release.legacyBaselineFingerprint : release.expectedRuntimeFingerprint,
    fingerprintMatchesRelease: mode !== 'static',
  };
}
function provider(result) { return new Response(JSON.stringify({ success: true, result }), { headers: { 'content-type': 'application/json' } }); }
function content(bytes = 'export default { fetch() { return new Response("old-source"); } }') {
  const form = new FormData();
  form.set('index.js', new Blob([bytes], { type: 'application/javascript+module' }), 'index.js');
  form.set('index.js.map', new Blob(['{"version":3}'], { type: 'application/source-map' }), 'index.js.map');
  return new Response(form, { headers: { 'cf-entrypoint': 'index.js' } });
}
function harness({ staticAtStart = false, mutateClone, mutateOriginal, afterSnapshot, failures = 0, rejectDeploy = false, rejectRollback = false, changedContent = false, mismatchedPublic = false } = {}) {
  let active = 'original'; let latest = 'original'; let deploymentId = 'initial-deployment';
  let healthFailures = failures; let snapshots = 0; let deployed = false;
  const versions = new Map([['original', worker('original', staticAtStart ? 'static' : 'd1')]]);
  mutateOriginal?.(versions.get('original'));
  const settings = { logpush: false, tail_consumers: null, tags: ['production'], observability: { enabled: true, logs: { enabled: true, invocation_logs: true } } };
  const fetchImpl = vi.fn(async (url, init = {}) => {
    const path = new URL(url).pathname;
    if (url.startsWith('https://frigo.tungjpstore.net')) {
      let mode = active === 'pinned' || staticAtStart ? 'static' : 'd1';
      if (active === 'pinned' && healthFailures-- > 0) mode = 'd1';
      const value = authority(mode);
      return new Response(JSON.stringify(path.endsWith('recipe-authority') ? value : {
        status: 'ok', commit: value.commit, environment: value.environment, recipeAuthority: mismatchedPublic ? { ...value, canaryPercent: 5 } : value,
      }), { headers: { 'content-type': 'application/json' } });
    }
    if (path.endsWith('/deployments')) {
      if (init.method === 'POST') {
        const id = JSON.parse(init.body).versions[0].version_id;
        if ((id === 'pinned' && rejectDeploy) || (id === 'original' && rejectRollback)) return new Response('never-log-provider-error', { status: 400 });
        active = id; deployed = id === 'pinned'; deploymentId = `deployment-${id}`;
        return provider({ id: deploymentId });
      }
      snapshots++;
      afterSnapshot?.({ snapshots, deployed, changeActive: (id) => { active = id; deploymentId = `deployment-${id}`; }, changeLatest: (id) => { latest = id; } });
      return provider({ deployments: [{ id: deploymentId, strategy: 'percentage', versions: [{ version_id: active, percentage: 100 }] }] });
    }
    if (path.endsWith('/script-settings')) return provider(settings);
    if (path.endsWith('/versions')) {
      if (init.method === 'POST') {
        const metadata = JSON.parse(init.body.get('metadata'));
        const clone = structuredClone(versions.get('original')); clone.id = 'pinned';
        clone.resources.bindings = clone.resources.bindings.filter((b) => !flagNames.includes(b.name)).concat(metadata.bindings.filter((b) => flagNames.includes(b.name)));
        mutateClone?.(clone);
        versions.set('pinned', clone); latest = 'pinned'; return provider({ id: 'pinned' });
      }
      return provider({ items: [{ id: latest }, ...[...versions.keys()].filter((id) => id !== latest).map((id) => ({ id }))] });
    }
    if (path.endsWith('/content/v2')) return content(changedContent && new URL(url).searchParams.get('version') === 'pinned' ? 'different deployed module' : undefined);
    const id = path.split('/').at(-1);
    if (versions.has(id)) return provider(versions.get(id));
    throw new Error('Unexpected request');
  });
  const beforeMutation = vi.fn(async () => {}); const wait = vi.fn(async () => {});
  return { options: { env, fetchImpl, beforeMutation, expectedVersionId: 'original', catalogRestoreStarted: false, release, healthAttempts: 1, wait }, fetchImpl, beforeMutation, wait, versions };
}
const posts = (h) => h.fetchImpl.mock.calls.filter(([, init]) => init.method === 'POST');

describe('production catalog Worker static pin', () => {
  it('inspects read-only and exposes static flags only after bindings and both health endpoints agree', async () => {
    const h = harness({ staticAtStart: true });
    const proof = await inspectProductionCatalogWorker(h.options);
    expect(proof).toMatchObject({ mode: 'inspect', mutations: 0, configuredMode: 'static', cutoverEnabled: false, canaryPercent: 0, authorityVerified: true, compatibilityCode: 'SUPPORTED' });
    expect(posts(h)).toEqual([]);
    const text = JSON.stringify(proof);
    for (const secret of [env.CLOUDFLARE_API_TOKEN, env.RELEASE_VERIFY_TOKEN, 'https://provider.invalid', env.CLOUDFLARE_ACCOUNT_ID]) expect(text).not.toContain(secret);
    expect(proof.modules.parts).toHaveLength(2);
  });
  it('withholds static flags when public health disagrees with protected authority', async () => {
    const h = harness({ staticAtStart: true, mismatchedPublic: true });
    const proof = await inspectProductionCatalogWorker(h.options);
    expect(proof).toMatchObject({ authorityVerified: false, authorityCode: 'WORKER_VERIFICATION_FAILED' });
    expect(proof.configuredMode).toBeUndefined();
    expect(posts(h)).toEqual([]);
  });
  it('clones exact deployed bytes, strictly inherits named bindings/secrets, and changes only three flags', async () => {
    const h = harness();
    const proof = await pinProductionCatalogStatic(h.options);
    expect(proof).toMatchObject({ status: 'static-verified', previousVersion: 'original', versionId: 'pinned', catalogRestoreStarted: false, method: 'clone-deployed-version', assets: { sourceVersionId: 'original' } });
    const [upload, deploy] = posts(h);
    expect(upload[0]).toContain('bindings_inherit=strict&excludeScript=true');
    const metadata = JSON.parse(upload[1].body.get('metadata'));
    expect(metadata).toMatchObject({ keep_assets: true, compatibility_date: '2024-11-01', compatibility_flags: ['nodejs_compat'], usage_model: 'standard', limits: { cpu_ms: 100 } });
    expect(metadata.bindings.find((b) => b.name === 'SESSION_SECRET')).toEqual({ name: 'SESSION_SECRET', type: 'inherit' });
    expect(metadata.bindings.filter((b) => b.type !== 'inherit')).toEqual(flagNames.map((name, i) => ({ name, type: 'plain_text', text: ['static', '0', 'false'][i] })));
    expect(await upload[1].body.get('index.js').text()).toContain('old-source');
    expect(await upload[1].body.get('index.js.map').text()).toBe('{"version":3}');
    expect(JSON.parse(deploy[1].body)).toEqual({ strategy: 'percentage', versions: [{ version_id: 'pinned', percentage: 100 }] });
    expect(h.beforeMutation.mock.calls.map(([phase]) => phase)).toEqual(['upload', 'deploy']);
    expect(h.fetchImpl.mock.calls.some(([url]) => url.includes('deployable=true'))).toBe(false);
  });
  it('verifies an already static Worker without uploading or deploying', async () => {
    const h = harness({ staticAtStart: true });
    expect(await pinProductionCatalogStatic(h.options)).toMatchObject({ status: 'static-verified', method: 'already-static', versionId: 'original' });
    expect(posts(h)).toEqual([]);
  });
  it.each([
    ['wrong source', (w) => { w.resources.bindings[0].text = 'b'.repeat(40); }, 'WORKER_SOURCE_MISMATCH'],
    ['wrong D1', (w) => { w.resources.bindings[2].id = 'another-database'; }, 'D1_BINDING_MISMATCH'],
    ['unknown runtime', (w) => { w.resources.script_runtime.unreviewed = true; }, 'UNSUPPORTED_METADATA'],
    ['unknown secret value', (w) => { w.resources.bindings.find((b) => b.type === 'secret_text').text = 'secret-value'; }, 'UNSUPPORTED_BINDINGS'],
  ])('fails closed before mutation for %s', async (_, mutateOriginal, code) => {
    const h = harness({ mutateOriginal });
    await expect(pinProductionCatalogStatic(h.options)).rejects.toMatchObject({ code });
    expect(posts(h)).toEqual([]);
  });
  it('returns only field schema for unsupported live metadata', async () => {
    const h = harness({ mutateOriginal: (w) => { w.resources.new_resource = { credential: 'do-not-disclose' }; } });
    const proof = await inspectProductionCatalogWorker(h.options);
    expect(proof.compatibilityCode).toBe('UNSUPPORTED_METADATA');
    expect(proof.versionSchema.resources.new_resource).toEqual({ credential: 'string' });
    expect(JSON.stringify(proof)).not.toContain('do-not-disclose');
    expect(posts(h)).toEqual([]);
  });
  it('rejects a stale latest version before upload', async () => {
    const h = harness({ afterSnapshot: ({ snapshots, changeLatest }) => { if (snapshots === 2) changeLatest('rotated'); } });
    await expect(pinProductionCatalogStatic(h.options)).rejects.toMatchObject({ code: 'CONCURRENT_WORKER_CHANGE' });
    expect(posts(h)).toEqual([]);
  });
  it('rejects a concurrent deployment immediately before changing traffic', async () => {
    const h = harness({ afterSnapshot: ({ snapshots, changeActive }) => { if (snapshots === 3) changeActive('other'); } });
    await expect(pinProductionCatalogStatic(h.options)).rejects.toMatchObject({ code: 'CONCURRENT_WORKER_CHANGE' });
    expect(posts(h)).toHaveLength(1);
  });
  it('rejects clone changes to code configuration or secrets before deployment', async () => {
    const h = harness({ mutateClone: (w) => { w.resources.bindings = w.resources.bindings.filter((b) => b.name !== 'SESSION_SECRET'); } });
    await expect(pinProductionCatalogStatic(h.options)).rejects.toMatchObject({ code: 'CLONE_EQUIVALENCE_FAILED' });
    expect(posts(h)).toHaveLength(1);
  });
  it('rejects changed module bytes before deployment', async () => {
    const h = harness({ changedContent: true });
    await expect(pinProductionCatalogStatic(h.options)).rejects.toMatchObject({ code: 'CLONE_EQUIVALENCE_FAILED' });
    expect(posts(h)).toHaveLength(1);
  });
  it('allows bounded eventual health propagation without another mutation', async () => {
    const h = harness({ failures: 4 });
    const proof = await pinProductionCatalogStatic({ ...h.options, healthAttempts: 13 });
    expect(proof.status).toBe('static-verified');
    expect(h.wait).toHaveBeenCalledTimes(2);
    expect(posts(h)).toHaveLength(2);
  });
  it('restores only the original Worker after failed verification before any catalog write', async () => {
    const h = harness({ failures: 20 });
    const failure = await pinProductionCatalogStatic(h.options).catch((error) => error);
    expect(failure).toMatchObject({ code: 'WORKER_VERIFICATION_FAILED', proof: { catalogRestoreStarted: false, rollback: { status: 'original-restored-before-catalog-write', versionId: 'original' } } });
    expect(posts(h)).toHaveLength(3);
    expect(posts(h).at(-1)[0]).not.toContain('force');
    expect(h.beforeMutation.mock.calls.map(([phase]) => phase)).toEqual(['upload', 'deploy', 'rollback']);
  });
  it('never rolls back over a concurrent production change', async () => {
    const h = harness({ failures: 20, afterSnapshot: ({ deployed, snapshots, changeActive }) => { if (deployed && snapshots >= 4) changeActive('other'); } });
    const failure = await pinProductionCatalogStatic(h.options).catch((error) => error);
    expect(failure.proof.rollback).toMatchObject({ status: 'failed-closed' });
    expect(posts(h)).toHaveLength(2);
  });
  it('rejects use after catalog restore or an invalid release before mutation', async () => {
    const h = harness();
    await expect(pinProductionCatalogStatic({ ...h.options, catalogRestoreStarted: true })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(pinProductionCatalogStatic({ ...h.options, release: { ...release, expectedRecipeCount: 499 } })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    expect(posts(h)).toEqual([]);
  });
  it('sanitizes thrown provider details without force-retrying a rejected deployment', async () => {
    const h = harness({ rejectDeploy: true });
    const failure = await pinProductionCatalogStatic(h.options).catch((error) => error);
    expect(failure.code).toBe('PROVIDER_REQUEST_FAILED');
    expect(failure.proof.rollback.status).toBe('original-active');
    expect(String(failure)).not.toContain('never-log');
    expect(posts(h)).toHaveLength(2);
  });
});
