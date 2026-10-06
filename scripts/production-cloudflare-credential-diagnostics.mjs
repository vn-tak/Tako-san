const API = 'https://api.cloudflare.com/client/v4';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 65_536;
const MAX_PROVIDER_CODES = 4;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const present = (value) => typeof value === 'string' && value.length > 0;
const validAccount = (value) => typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value);
const validDatabase = (value) => typeof value === 'string'
  && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
const validCredential = (value) => present(value) && value.length <= 4096 && !/[\s\x00-\x1f\x7f]/.test(value);
const outcome = (result = 'NOT_REQUESTED', httpStatus = null, providerCodes = []) => ({ result, httpStatus, providerCodes });
const unknownBounds = () => ({ expiresOn: 'UNKNOWN', notBefore: 'UNKNOWN' });
const unknownPolicy = () => ({ request: outcome(), metadata: 'UNKNOWN', d1EditAllow: 'UNKNOWN',
  d1EditDeny: 'UNKNOWN', accountAllowResource: 'UNKNOWN', allAccountsAllowResource: 'UNKNOWN',
  ipRestriction: 'UNKNOWN', timeBounds: unknownBounds() });
const envValue = (env, name, alias) => Object.hasOwn(env, name) ? env[name] : env[alias];

class DiagnosticFailure extends Error {
  constructor(result) { super('CLOUDFLARE_DIAGNOSTIC_FAILED'); this.result = result; }
}

function providerCodes(envelope) {
  const codes = [];
  for (const error of Array.isArray(envelope?.errors) ? envelope.errors.slice(0, 32) : []) {
    const code = error?.code;
    if ((typeof code === 'number' || typeof code === 'string') && /^[0-9]{1,8}$/.test(String(code))) {
      const number = Number(code);
      if (Number.isSafeInteger(number) && !codes.includes(number)) codes.push(number);
    }
    if (codes.length === MAX_PROVIDER_CODES) break;
  }
  return codes;
}

async function readEnvelope(response, signal) {
  const declared = response.headers?.get('content-length');
  if (declared !== null && declared !== undefined && /^[0-9]+$/.test(declared)
      && Number(declared) > MAX_BODY_BYTES) throw new DiagnosticFailure('BODY_SIZE_LIMIT');
  const reader = response.body?.getReader();
  if (!reader) throw new DiagnosticFailure('INVALID_RESPONSE');
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, { once: true });
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) throw new DiagnosticFailure('INVALID_RESPONSE');
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) { cancel(); throw new DiagnosticFailure('BODY_SIZE_LIMIT'); }
      chunks.push(Buffer.from(value));
    }
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
  let envelope;
  try { envelope = JSON.parse(Buffer.concat(chunks, length).toString('utf8')); }
  catch { throw new DiagnosticFailure('INVALID_RESPONSE'); }
  if (!isObject(envelope)) throw new DiagnosticFailure('INVALID_RESPONSE');
  return envelope;
}

function readOnlyClient(fetchImpl, headers) {
  return async (path) => {
    const controller = new AbortController();
    let timer;
    let httpStatus = null;
    let codes = [];
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort(); reject(new DiagnosticFailure('TIMED_OUT'));
      }, REQUEST_TIMEOUT_MS);
    });
    try {
      const request = async () => {
        const response = await fetchImpl(`${API}${path}`, {
          method: 'GET', redirect: 'error', signal: controller.signal, headers,
        });
        if (!Number.isInteger(response?.status) || response.status < 100 || response.status > 599) {
          throw new DiagnosticFailure('INVALID_RESPONSE');
        }
        httpStatus = response.status;
        if (response.redirected || (httpStatus >= 300 && httpStatus < 400)) {
          throw new DiagnosticFailure('REDIRECT_REJECTED');
        }
        const envelope = await readEnvelope(response, controller.signal);
        codes = providerCodes(envelope);
        if (httpStatus < 200 || httpStatus >= 300) {
          return { request: outcome([401, 403].includes(httpStatus) ? 'AUTHORIZATION_ERROR' : 'HTTP_ERROR', httpStatus, codes) };
        }
        if (envelope.success === false) return { request: outcome('PROVIDER_REJECTED', httpStatus, codes) };
        if (envelope.success !== true || !isObject(envelope.result)
            || (Array.isArray(envelope.errors) && envelope.errors.length > 0)) {
          throw new DiagnosticFailure('INVALID_RESPONSE');
        }
        return { request: outcome('SUCCESS', httpStatus, codes), data: envelope.result };
      };
      return await Promise.race([request(), deadline]);
    } catch (error) {
      const result = error instanceof DiagnosticFailure ? error.result
        : ['AbortError', 'TimeoutError'].includes(error?.name) ? 'TIMED_OUT' : 'REQUEST_FAILED';
      return { request: outcome(result, httpStatus, codes) };
    } finally { clearTimeout(timer); controller.abort(); }
  };
}

function timeBounds(data, timestamp) {
  const classify = (value) => {
    if (typeof value !== 'string' || value.length > 40
        || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
        || !Number.isFinite(timestamp)) return 'UNKNOWN';
    const boundary = Date.parse(value);
    return !Number.isFinite(boundary) ? 'UNKNOWN' : boundary > timestamp ? 'FUTURE' : 'PAST_OR_PRESENT';
  };
  return { expiresOn: classify(data?.expires_on), notBefore: classify(data?.not_before) };
}

function observedPolicies(data, accountId, timestamp) {
  const evidence = unknownPolicy();
  evidence.metadata = 'OBSERVED';
  evidence.timeBounds = timeBounds(data, timestamp);
  const restrictions = data.condition?.request_ip;
  if (isObject(restrictions) && ['in', 'not_in'].some((key) => Array.isArray(restrictions[key])
      && restrictions[key].length > 0 && restrictions[key].length <= 128
      && restrictions[key].every((value) => typeof value === 'string' && value.length <= 128))) {
    evidence.ipRestriction = 'OBSERVED';
  }
  if (!Array.isArray(data.policies) || data.policies.length > 128
      || data.policies.some((policy) => !isObject(policy) || !['allow', 'deny'].includes(policy.effect)
        || !Array.isArray(policy.permission_groups) || policy.permission_groups.length > 128
        || policy.permission_groups.some((group) => !isObject(group) || typeof group.name !== 'string'
          || group.name.length > 120))) return evidence;
  const editPolicies = data.policies.filter((policy) => policy.permission_groups
    .some((group) => ['D1 Edit', 'D1 Write'].includes(group.name)));
  evidence.d1EditAllow = editPolicies.some((policy) => policy.effect === 'allow') ? 'OBSERVED' : 'NOT_OBSERVED';
  evidence.d1EditDeny = editPolicies.some((policy) => policy.effect === 'deny') ? 'OBSERVED' : 'NOT_OBSERVED';
  const allow = editPolicies.filter((policy) => policy.effect === 'allow');
  if (allow.some((policy) => !isObject(policy.resources) || Object.keys(policy.resources).length > 128)) return evidence;
  const resource = (key) => {
    if (allow.some((policy) => policy.resources[key] === '*')) return 'OBSERVED';
    if (allow.some((policy) => Object.values(policy.resources).some((value) => typeof value !== 'string'))) return 'UNKNOWN';
    return 'NOT_OBSERVED';
  };
  evidence.accountAllowResource = validAccount(accountId) ? resource(`com.cloudflare.api.account.${accountId}`) : 'UNKNOWN';
  evidence.allAccountsAllowResource = resource('com.cloudflare.api.account.*');
  return evidence;
}

async function tokenEvidence(api, accountId, timestamp) {
  const verification = { kind: 'UNKNOWN', checks: [], status: 'UNKNOWN', timeBounds: unknownBounds() };
  let token = await api('/user/tokens/verify');
  verification.checks.push({ kind: 'USER', ...token.request });
  let kind = 'USER';
  if (token.request.result !== 'SUCCESS' && token.request.providerCodes.includes(1000) && validAccount(accountId)) {
    kind = 'ACCOUNT';
    token = await api(`/accounts/${encodeURIComponent(accountId)}/tokens/verify`);
    verification.checks.push({ kind: 'ACCOUNT', ...token.request });
  }
  const policy = unknownPolicy();
  if (token.request.result !== 'SUCCESS' || !['active', 'disabled', 'expired'].includes(token.data?.status)) {
    return { verification, policy };
  }
  verification.kind = kind;
  verification.status = token.data.status.toUpperCase();
  verification.timeBounds = timeBounds(token.data, timestamp);
  if (verification.status !== 'ACTIVE' || !validAccount(token.data.id)) return { verification, policy };
  // Inspect only the verified token itself; never list other tokens or permission groups.
  const base = kind === 'USER' ? '/user' : `/accounts/${encodeURIComponent(accountId)}`;
  const metadata = await api(`${base}/tokens/${encodeURIComponent(token.data.id)}`);
  policy.request = metadata.request;
  if (metadata.request.result !== 'SUCCESS') return { verification, policy };
  if (metadata.data.id !== token.data.id) {
    policy.request = outcome('IDENTITY_MISMATCH', metadata.request.httpStatus); return { verification, policy };
  }
  return { verification, policy: { ...observedPolicies(metadata.data, accountId, timestamp), request: metadata.request } };
}

async function identityEvidence(api, path, field, expected) {
  const result = await api(path);
  if (result.request.result === 'SUCCESS'
      && (typeof result.data[field] !== 'string' || result.data[field].toLowerCase() !== expected.toLowerCase())) {
    return outcome('IDENTITY_MISMATCH', result.request.httpStatus);
  }
  return result.request;
}

/** Produces aggregate credential evidence without certifying write permission or import completion. */
export async function collectCloudflareCredentialDiagnostics({ env = {}, fetchImpl = fetch, databaseId, now = Date.now } = {}) {
  const validEnvironment = isObject(env);
  if (!validEnvironment) env = {};
  const apiToken = envValue(env, 'CLOUDFLARE_API_TOKEN', 'CF_API_TOKEN');
  const accountId = envValue(env, 'CLOUDFLARE_ACCOUNT_ID', 'CF_ACCOUNT_ID');
  const globalKey = envValue(env, 'CLOUDFLARE_API_KEY', 'CF_API_KEY');
  const email = envValue(env, 'CLOUDFLARE_EMAIL', 'CF_EMAIL');
  const globalKeyPrecedence = present(globalKey) && present(email);
  const effectiveCredential = globalKeyPrecedence ? 'GLOBAL_KEY_EMAIL' : present(apiToken) ? 'API_TOKEN' : 'NONE';
  const receipt = {
    schemaVersion: 1, readOnly: true, mutations: 0, certification: 'NOT_A_RELEASE_CERTIFICATION',
    retryAuthorized: false, writeAuthorization: 'UNKNOWN',
    credentialPresence: { apiToken: present(apiToken), accountId: present(accountId), globalKey: present(globalKey), email: present(email) },
    effectiveCredential, globalKeyPrecedence, inputStatus: 'VALID',
    tokenVerification: { kind: effectiveCredential === 'GLOBAL_KEY_EMAIL' ? 'NOT_APPLICABLE' : 'UNKNOWN',
      checks: [], status: 'UNKNOWN', timeBounds: unknownBounds() },
    account: outcome(), database: outcome(), policy: unknownPolicy(),
  };
  if (!validEnvironment) { receipt.inputStatus = 'INVALID_ENVIRONMENT'; return receipt; }
  if (effectiveCredential === 'NONE') { receipt.inputStatus = 'NO_CREDENTIALS'; return receipt; }
  if (typeof fetchImpl !== 'function' || (globalKeyPrecedence ? !validCredential(globalKey) || !validCredential(email) : !validCredential(apiToken))) {
    receipt.inputStatus = 'INVALID_CREDENTIALS'; return receipt;
  }
  if (!validAccount(accountId)) receipt.inputStatus = present(accountId) ? 'INVALID_ACCOUNT_ID' : 'MISSING_ACCOUNT_ID';
  else if (!validDatabase(databaseId)) receipt.inputStatus = 'INVALID_DATABASE_ID';
  const headers = { Accept: 'application/json', ...(globalKeyPrecedence
    ? { 'X-Auth-Key': globalKey, 'X-Auth-Email': email } : { Authorization: `Bearer ${apiToken}` }) };
  const api = readOnlyClient(fetchImpl, headers);
  let timestamp;
  try { timestamp = typeof now === 'function' ? now() : now; } catch { timestamp = NaN; }
  const access = validAccount(accountId) ? Promise.all([
    identityEvidence(api, `/accounts/${encodeURIComponent(accountId)}`, 'id', accountId),
    validDatabase(databaseId) ? identityEvidence(api, `/accounts/${encodeURIComponent(accountId)}/d1/database/${encodeURIComponent(databaseId)}`, 'uuid', databaseId) : outcome(),
  ]) : Promise.resolve([outcome(), outcome()]);
  const [identities, token] = await Promise.all([
    access, effectiveCredential === 'API_TOKEN' ? tokenEvidence(api, accountId, timestamp) : null,
  ]);
  [receipt.account, receipt.database] = identities;
  if (token) { receipt.tokenVerification = token.verification; receipt.policy = token.policy; }
  return receipt;
}
