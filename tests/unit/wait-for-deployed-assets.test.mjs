import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_TRANSIENT_FAILURES, waitForDeployedRelease } from '../../scripts/wait-for-deployed-release.mjs';

const sha = 'a'.repeat(40);
const priorSha = 'b'.repeat(40);
const url = 'https://frigo-staging.example.workers.dev';
const manifest = { sha, environment: 'staging', recipeCatalogMode: 'shadow',
  recipeCatalogCanaryPercent: 0, recipeCatalogCutoverEnabled: false };
const source = readFileSync('public/sw.js', 'utf8');
const sw = (buildId = sha) => source.replace('__TAKOSAN_BUILD_ID__', buildId);
const ready = (over = {}) => ({ kind: 'ready', body: { commit: sha, environment: 'staging',
  status: 'ok', services: { database: 'ok' }, config: { ok: true },
  recipeAuthority: { configuredMode: 'shadow', canaryPercent: 0, cutoverEnabled: false }, ...over } });
const asset = (body = sw(), over = {}) => ({ kind: 'asset', body, ...over });
const pairs = (count = 3) => Array.from({ length: count }, () => [ready(), asset()]).flat();
const oldPairs = (count) => Array.from({ length: count }, () => [ready(), asset(sw(priorSha))]).flat();

function harness(responses, over = {}) {
  let clock = 0;
  const calls = [];
  const logs = [];
  const fetch = async (input, init) => {
    const path = new URL(input).pathname;
    calls.push({ path, init });
    const next = responses.shift();
    if (!next) throw new Error('Harness exhausted');
    expect(path).toBe(next.kind === 'ready' ? '/api/v1/health/ready' : '/sw.js');
    clock += next.elapsedMs ?? 0;
    if (next.error) throw next.error;
    return new Response(next.kind === 'ready' ? JSON.stringify(next.body) : next.body, {
      status: next.status ?? 200,
      headers: next.kind === 'ready' ? { 'content-type': 'application/json' } : {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate', ...next.headers,
      },
    });
  };
  return { calls, logs, clock: () => clock, options: {
    url, fetch, now: () => clock, sleep: async (ms) => { clock += ms; },
    verifyAssets: true, deadlineMs: 90_000, intervalMs: 3_000,
    log: (message) => logs.push(message), ...over,
  } };
}

afterEach(() => vi.restoreAllMocks());

describe('paired Worker and service-worker release convergence', () => {
  it('reproduces staging run 37384738093: exact readiness can precede asset propagation', async () => {
    const h = harness([...oldPairs(2), ...pairs()]);
    const proof = await waitForDeployedRelease(manifest, h.options);
    expect(proof).toMatchObject({ sha, environment: 'staging', attempts: 5, waitedMs: 12_000,
      assets: { sha, sha256: createHash('sha256').update(sw()).digest('hex'), httpStatus: 200,
        cacheNoStore: true, consecutiveObservations: 3 } });
    expect(h.calls).toHaveLength(10);
    const requests = h.calls.filter((call) => call.path === '/sw.js');
    for (const { init } of requests) {
      expect(init.redirect).toBe('error'); expect(init.cache).toBe('no-store');
      expect(init.headers['Cache-Control']).toBe('no-cache');
      expect(init.method).toBe('GET'); expect(init.signal).toBeInstanceOf(AbortSignal);
    }
    expect(h.logs.filter((line) => line.includes('asset propagation pending'))).toHaveLength(2);
    expect(h.logs.join('\n')).not.toContain(priorSha);
    expect(h.logs.join('\n')).not.toContain(sw());
    expect(JSON.stringify(proof)).not.toContain('STATIC_PRECACHE');
  });

  it('resets consecutive pairs when a valid older asset appears between exact matches', async () => {
    const h = harness([...pairs(2), ready(), asset(sw(priorSha)), ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).resolves.toMatchObject({ attempts: 6,
      assets: { consecutiveObservations: 3 } });
  });

  it('cannot use stale readiness when the Worker changes while assets converge', async () => {
    const h = harness([...pairs(2), ready({ commit: priorSha }), ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).resolves.toMatchObject({ attempts: 6 });
    expect(h.calls.map((call) => call.path)).toEqual([
      '/api/v1/health/ready', '/sw.js', '/api/v1/health/ready', '/sw.js',
      '/api/v1/health/ready', '/api/v1/health/ready', '/sw.js',
      '/api/v1/health/ready', '/sw.js', '/api/v1/health/ready', '/sw.js',
    ]);
  });

  it('resets consecutive pairs on the existing bounded readiness transient policy', async () => {
    const h = harness([...pairs(2), { ...ready(), status: 503 }, ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).resolves.toMatchObject({ attempts: 6 });
    const failed = harness(Array.from({ length: MAX_TRANSIENT_FAILURES + 1 }, () => ({ ...ready(), status: 503 })));
    await expect(waitForDeployedRelease(manifest, failed.options)).rejects.toThrow('kept failing');
    expect(failed.calls.some((call) => call.path === '/sw.js')).toBe(false);
  });

  it.each([
    ['wrong environment', { environment: 'production' }],
    ['contradictory authority', { recipeAuthority: { configuredMode: 'd1', canaryPercent: 0, cutoverEnabled: false } }],
    ['unhealthy Worker', { status: 'unhealthy' }],
    ['malformed Worker identity', { commit: 'main' }],
  ])('stops on %s after prior exact pairs', async (_label, over) => {
    const h = harness([...pairs(2), ready(over)]);
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow();
    expect(h.calls).toHaveLength(5);
  });

  it.each([
    ['missing', source.replace("const BUILD_ID = '__TAKOSAN_BUILD_ID__';", '')],
    ['unbuilt placeholder', source],
    ['short SHA', sw(sha.slice(0, 8))],
    ['uppercase SHA', sw(sha.toUpperCase())],
    ['branch name', sw('main')],
    ['double-quoted identity', sw().replace(`const BUILD_ID = '${sha}';`, `const BUILD_ID = "${sha}";`)],
    ['duplicate identity', `${sw()}\nconst BUILD_ID = '${sha}';`],
    ['identity in a line comment', sw().replace(`const BUILD_ID = '${sha}';`, `// const BUILD_ID = '${sha}';`)],
    ['identity in a block comment', sw().replace(`const BUILD_ID = '${sha}';`, `/*\nconst BUILD_ID = '${sha}';\n*/`)],
    ['missing cache marker', sw().replace('const CACHE_NAME = `takosan-pwa-${BUILD_ID}`;', '')],
    ['missing install marker', sw().replace("self.addEventListener('install',", "self.addEventListener('unreviewed',")],
    ['missing activate marker', sw().replace("self.addEventListener('activate',", "self.addEventListener('unreviewed',")],
    ['missing fetch marker', sw().replace("self.addEventListener('fetch',", "self.addEventListener('unreviewed',")],
    ['HTML response', `<html><script>${sw()}</script></html>`],
    ['malformed JavaScript', `${sw()}\nconst = ;`],
  ])('fails closed on %s instead of treating it as propagation', async (_label, body) => {
    const h = harness([ready(), asset(body), ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow('Service worker');
    expect(h.calls).toHaveLength(2); expect(h.clock()).toBe(0);
  });

  it('never executes JavaScript while validating it', async () => {
    const text = `${sw()}\nglobalThis.__takosanProbeExecuted = true;`;
    new Script(text);
    const h = harness(Array.from({ length: 3 }, () => [ready(), asset(text)]).flat());
    await expect(waitForDeployedRelease(manifest, h.options)).resolves.toMatchObject({ assets: { sha } });
    expect(globalThis.__takosanProbeExecuted).toBeUndefined();
  });

  it.each([201, 204, 301, 401, 403, 404, 429, 503])('does not retry service-worker HTTP %s', async (status) => {
    const h = harness([ready(), asset(status === 204 ? null : sw(), { status }), ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow(`Service worker returned HTTP ${status}`);
    expect(h.calls).toHaveLength(2); expect(h.clock()).toBe(0);
  });

  it.each([
    ['HTML MIME', { 'content-type': 'text/html' }],
    ['missing MIME', { 'content-type': '' }],
    ['missing no-store', { 'cache-control': 'no-cache, must-revalidate' }],
    ['misleading cache token', { 'cache-control': 'x-no-store' }],
  ])('stops immediately for %s', async (_label, headers) => {
    const h = harness([ready(), asset(sw(), { headers }), ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow('Service worker');
    expect(h.calls).toHaveLength(2);
  });

  it('bounds the response stream even without Content-Length', async () => {
    const h = harness([ready(), asset(`${sw()}\n// ${'x'.repeat(256 * 1024)}`), ...pairs()]);
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow('Service worker body exceeds');
    expect(h.calls).toHaveLength(2);
  });

  it('fails within the shared deadline if otherwise valid old assets never converge', async () => {
    const h = harness(oldPairs(40));
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow('within 90000 ms');
    expect(h.clock()).toBe(90_000); expect(h.calls).toHaveLength(60);
  });

  it('clips the asset request timeout to the budget left by prior pairs and readiness', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    const h = harness([...oldPairs(29), { ...ready(), elapsedMs: 2_000 }, asset()], { requiredConsecutive: 1 });
    await expect(waitForDeployedRelease(manifest, h.options)).resolves.toMatchObject({ waitedMs: 89_000 });
    expect(timeout.mock.calls.slice(-2).map(([ms]) => ms)).toEqual([3_000, 1_000]);
    expect(h.calls).toHaveLength(60);
  });

  it('rejects late exact assets even if the transport ignores its abort signal', async () => {
    const h = harness([...oldPairs(29), { ...ready(), elapsedMs: 2_000 }, asset(sw(), { elapsedMs: 1_001 })], { requiredConsecutive: 1 });
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow('within 90000 ms');
    expect(h.calls).toHaveLength(60);
  });

  it('does not fetch assets after readiness exhausts the deadline even if its transport ignores abort', async () => {
    const h = harness([{ ...ready(), elapsedMs: 90_001 }, asset()], { requiredConsecutive: 1 });
    await expect(waitForDeployedRelease(manifest, h.options)).rejects.toThrow('within 90000 ms');
    expect(h.calls).toHaveLength(1);
  });

  it('sanitizes service-worker request failures without retrying or logging arbitrary transport text', async () => {
    const sensitive = 'private-transport-fixture=do-not-log';
    const h = harness([ready(), asset(null, { error: new TypeError(sensitive) }), ...pairs()]);
    const error = await waitForDeployedRelease(manifest, h.options).catch((failure) => failure);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Service worker request failed');
    expect(String(error)).not.toContain(sensitive);
    expect(h.logs.join('\n')).not.toContain(sensitive);
    expect(h.calls).toHaveLength(2);
  });

  it('sanitizes body-read failures while retaining the asset request abort signal', async () => {
    const sensitive = 'private-body-fixture=do-not-log';
    const controller = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    const h = harness([ready(), asset(), ...pairs()], { requiredConsecutive: 1 });
    const fetch = h.options.fetch;
    h.options.fetch = async (input, init) => {
      const response = await fetch(input, init);
      if (new URL(input).pathname !== '/sw.js') return response;
      Object.defineProperty(response, 'body', { value: new ReadableStream({
        start(streamController) {
          init.signal.addEventListener('abort', () => {
            streamController.error(Object.assign(new Error(sensitive), { name: 'AbortError' }));
          }, { once: true });
          queueMicrotask(() => controller.abort());
        },
      }) });
      return response;
    };
    const error = await waitForDeployedRelease(manifest, h.options).catch((failure) => failure);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Service worker body could not be read');
    expect(String(error)).not.toContain(sensitive);
    expect(h.logs.join('\n')).not.toContain(sensitive);
    expect(h.calls).toHaveLength(2);
    expect(h.calls[1].init.signal).toBe(controller.signal);
    expect(controller.signal.aborted).toBe(true);
  });

  it('the deployed CLI hardcodes asset verification before persisting its receipt', () => {
    const runner = readFileSync('scripts/wait-for-deployed-release.mjs', 'utf8');
    const smoke = readFileSync('scripts/post-deploy-smoke.sh', 'utf8');
    expect(runner).toContain('waitForDeployedRelease(manifest, { url, verifyAssets: true })');
    expect(runner.indexOf('manifest.deployedAssets = assets')).toBeLessThan(runner.indexOf('writeFileSync(file'));
    expect(smoke).toContain('deployed SHA is not embedded in /sw.js');
    expect(smoke).toContain("const BUILD_ID = '${EXPECTED_RELEASE_SHA}';");
  });
});
