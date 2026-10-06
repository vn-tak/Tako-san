import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Script } from 'node:vm';
import { RELEASE_PROPAGATION_PENDING, verifyDeployedRelease } from './release-check.mjs';

// Worker readiness and static assets can converge separately after deployment. The CLI requires
// consecutive pairs of exact readiness and /sw.js identities within one deadline. Only a healthy
// different canonical release SHA is propagation pending; malformed identities fail immediately.
export const DEFAULT_DEADLINE_MS = 90_000;
export const DEFAULT_INTERVAL_MS = 3_000;
export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
export const MAX_SERVICE_WORKER_BYTES = 256 * 1024;
// Edge/network blips while the new version settles; anything past this count is a real outage.
export const MAX_TRANSIENT_FAILURES = 3;
export const DEFAULT_REQUIRED_CONSECUTIVE = 3;

const short = (sha) => (typeof sha === 'string' && sha.length >= 8 ? sha.slice(0, 8) : 'unknown');

async function verifyServiceWorker(response, expectedSha) {
  if (response.status !== 200) throw new Error(`Service worker returned HTTP ${response.status}`);
  const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (!['text/javascript', 'application/javascript'].includes(contentType)) throw new Error('Service worker content type is not JavaScript');
  const cacheTokens = (response.headers.get('cache-control') ?? '').split(',').map((value) => value.trim().toLowerCase());
  if (!cacheTokens.includes('no-store')) throw new Error('Service worker Cache-Control lacks no-store');
  if (!response.body) throw new Error('Service worker body is missing');
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      let chunk;
      try { chunk = await reader.read(); }
      catch { throw new Error('Service worker body could not be read'); }
      const { done, value } = chunk;
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SERVICE_WORKER_BYTES) {
        void reader.cancel().catch(() => {});
        throw new Error('Service worker body exceeds 256 KiB');
      }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  const bytes = Buffer.concat(chunks);
  const text = bytes.toString('utf8');
  if (/<(?:!doctype|html|head|body)\b/i.test(text)) throw new Error('Service worker response contains HTML');
  try { new Script(text, { filename: 'service-worker-release-probe.js' }); }
  catch { throw new Error('Service worker JavaScript is malformed'); }
  const declarations = [...text.matchAll(/^[ \t]*const[ \t]+BUILD_ID[ \t]*=.*$/gm)];
  const identity = declarations.length === 1 ? /^const BUILD_ID = '([a-f0-9]{40})';\r?$/.exec(declarations[0][0]) : null;
  // The generated BUILD_ID is the first executable line; a declaration inside a comment cannot prove it.
  const prefix = declarations.length === 1 ? text.slice(0, declarations[0].index) : '';
  if (!identity || prefix.split(/\r?\n/).some((line) => line.trim() && !line.trimStart().startsWith('//'))) {
    throw new Error('Service worker BUILD_ID is not a single canonical full Git SHA declaration');
  }
  for (const marker of ['const CACHE_NAME = `takosan-pwa-${BUILD_ID}`;',
    "self.addEventListener('install',", "self.addEventListener('activate',", "self.addEventListener('fetch',"]) {
    if (!text.includes(marker)) throw new Error('Service worker required marker is missing');
  }
  if (identity[1] !== expectedSha) {
    const error = new Error('Service worker assets do not identify the approved release');
    error.code = RELEASE_PROPAGATION_PENDING;
    error.observedSha = identity[1];
    error.observedAsset = true;
    throw error;
  }
  return { sha: identity[1], sha256: createHash('sha256').update(bytes).digest('hex'),
    httpStatus: 200, cacheNoStore: true };
}

export async function waitForDeployedRelease(manifest, {
  url, fetch: fetchImpl = globalThis.fetch, now = Date.now, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  deadlineMs = DEFAULT_DEADLINE_MS, intervalMs = DEFAULT_INTERVAL_MS, requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, log = console.log,
  requiredConsecutive = DEFAULT_REQUIRED_CONSECUTIVE, verifyAssets = false,
}) {
  const origin = new URL(url);
  if (origin.protocol !== 'https:' || origin.origin !== url) throw new Error('Deployment URL must be an exact HTTPS origin');
  if ([deadlineMs, intervalMs, requestTimeoutMs, requiredConsecutive].some((value) => !Number.isSafeInteger(value) || value <= 0)) {
    throw new Error('Deployment wait bounds must be positive safe integers');
  }
  const readiness = new URL('/api/v1/health/ready', origin);
  const assetUrl = new URL('/sw.js', origin);
  const startedAt = now();
  let attempt = 0;
  let transientFailures = 0;
  let consecutive = 0;
  const deadlineError = () => new Error(`Readiness${verifyAssets ? ' and service worker assets' : ''} did not identify release ${short(manifest.sha)} within ${deadlineMs} ms (${attempt} attempts); the deployed version must be inspected by an operator`);
  const remaining = () => deadlineMs - (now() - startedAt);
  const requestSignal = () => {
    const budget = remaining();
    if (budget <= 0) throw deadlineError();
    return AbortSignal.timeout(Math.min(requestTimeoutMs, budget));
  };
  for (;;) {
    const signal = requestSignal();
    attempt += 1;
    let body;
    try {
      const response = await fetchImpl(readiness, { signal, redirect: 'error' });
      if (response.status >= 500 || response.status === 429) {
        transientFailures += 1;
        if (transientFailures > MAX_TRANSIENT_FAILURES) throw new Error(`Readiness endpoint kept failing (HTTP ${response.status})`);
        log(`attempt ${attempt}: readiness HTTP ${response.status}; transient ${transientFailures}/${MAX_TRANSIENT_FAILURES}, retrying`);
      } else if (!response.ok) {
        throw new Error(`Readiness endpoint returned HTTP ${response.status}`);
      } else {
        body = await response.json();
      }
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error('Readiness response is not valid JSON');
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError' || error?.code === 'ECONNRESET' || error?.name === 'TypeError') {
        transientFailures += 1;
        if (transientFailures > MAX_TRANSIENT_FAILURES) throw new Error(`Readiness endpoint unreachable after ${transientFailures} attempts`);
        log(`attempt ${attempt}: readiness request failed (${error.name}); transient ${transientFailures}/${MAX_TRANSIENT_FAILURES}, retrying`);
      } else {
        throw error;
      }
    }
    if (remaining() < 0) throw deadlineError();
    if (body !== undefined) {
      try {
        const deployed = verifyDeployedRelease(manifest, body);
        let assets;
        if (verifyAssets) {
          const assetSignal = requestSignal();
          let response;
          try {
            response = await fetchImpl(assetUrl, {
              method: 'GET', signal: assetSignal, redirect: 'error', cache: 'no-store',
              headers: { Accept: 'text/javascript, application/javascript', 'Cache-Control': 'no-cache' },
            });
          } catch { throw new Error('Service worker request failed'); }
          assets = await verifyServiceWorker(response, manifest.sha);
          if (remaining() < 0) throw deadlineError();
        }
        consecutive += 1;
        log(`attempt ${attempt}: readiness${verifyAssets ? ' and service worker assets' : ''} identifies release ${short(deployed.sha)} in ${deployed.environment} (${consecutive}/${requiredConsecutive})`);
        if (consecutive >= requiredConsecutive) {
          return { ...deployed, attempts: attempt, waitedMs: now() - startedAt,
            ...(assets ? { assets: { ...assets, consecutiveObservations: consecutive } } : {}) };
        }
      } catch (error) {
        if (error?.code !== RELEASE_PROPAGATION_PENDING) throw error;
        consecutive = 0;
        if (error.observedAsset) {
          log(`attempt ${attempt}: service worker observed_sha=${short(error.observedSha)}, expected_sha=${short(manifest.sha)}; asset propagation pending, retrying`);
        } else {
          log(`attempt ${attempt}: healthy ${manifest.environment} endpoint still serves a previous version, observed_sha=${short(error.observedSha)}${error.observedState ? ` observed_state=${error.observedState}` : ''}, expected_sha=${short(manifest.sha)}; propagation pending, retrying`);
        }
      }
    } else {
      consecutive = 0;
    }
    if (remaining() < intervalMs) throw deadlineError();
    await sleep(intervalMs);
  }
}

async function main() {
  const [file = 'release-manifest.json'] = process.argv.slice(2);
  const url = process.env.APP_SMOKE_URL;
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  const { assets, ...deployed } = await waitForDeployedRelease(manifest, { url, verifyAssets: true });
  manifest.deployed = deployed;
  manifest.deployedAssets = assets;
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Deployed release ${manifest.deployed.sha} and service worker assets verified in ${manifest.deployed.environment} after ${manifest.deployed.attempts} attempt(s)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : 'Deployed release wait failed'); process.exitCode = 1; });
}
