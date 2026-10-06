import { afterEach, describe, expect, it, vi } from 'vitest';
import { collectCloudflareCredentialDiagnostics } from '../../scripts/production-cloudflare-credential-diagnostics.mjs';

const accountId = 'abababababababababababababababab';
const databaseId = '12345678-abcd-4567-8901-123456789abc';
const tokenId = 'cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd';
const privateText = 'private fixture credential diagnostic SELECT secret 729';
const credentials = { CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_API_TOKEN: 'fake-token-private729',
  CLOUDFLARE_API_KEY: 'fake-global-key-private729', CLOUDFLARE_EMAIL: 'private729@example.invalid' };
const tokenEnv = { CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_API_TOKEN: credentials.CLOUDFLARE_API_TOKEN };
const api = 'https://api.cloudflare.com/client/v4';
const accountPath = `/accounts/${accountId}`;
const databasePath = `${accountPath}/d1/database/${databaseId}`;
const tokenPath = `/user/tokens/${tokenId}`;
const now = () => Date.parse('2026-10-07T00:00:00Z');
const reply = (result, status = 200, extra = {}) => new Response(JSON.stringify({ success: true, result, errors: [], ...extra }), { status });
const denied = (code = 10000, status = 403) => reply(null, status, { success: false,
  errors: [{ code, message: privateText, documentation_url: 'https://private.invalid/token729' }] });

function fakeApi(routes = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const path = url.slice(api.length);
    if (Object.hasOwn(routes, path)) {
      const configured = routes[path];
      return typeof configured === 'function' ? configured(url, options) : configured;
    }
    if (path === accountPath) return reply({ id: accountId, name: privateText });
    if (path === databasePath) return reply({ uuid: databaseId, name: privateText });
    if (path === '/user/tokens/verify') return reply({ id: tokenId, status: 'active', name: privateText });
    if (path === tokenPath) return denied();
    throw new Error(`${privateText} unexpected ${url}`);
  };
  return { calls, fetchImpl };
}
async function collect(options = {}, routes = {}) {
  const mock = fakeApi(routes);
  const receipt = await collectCloudflareCredentialDiagnostics({ env: tokenEnv, databaseId, now, ...options,
    fetchImpl: options.fetchImpl ?? mock.fetchImpl });
  return { receipt, calls: mock.calls };
}
function assertSanitized(receipt, calls = []) {
  expect(receipt).toMatchObject({ schemaVersion: 1, readOnly: true, mutations: 0,
    certification: 'NOT_A_RELEASE_CERTIFICATION', retryAuthorized: false, writeAuthorization: 'UNKNOWN' });
  const serialized = JSON.stringify(receipt);
  for (const value of [accountId, databaseId, tokenId, privateText, api, 'https://private.invalid',
    credentials.CLOUDFLARE_API_TOKEN, credentials.CLOUDFLARE_API_KEY, credentials.CLOUDFLARE_EMAIL,
    '203.0.113.0/24', 'policy-private729', 'permission-private729', 'D1 Edit', 'D1 Write']) {
    expect(serialized).not.toContain(value);
  }
  for (const { url, options } of calls) {
    expect(url.startsWith(`${api}/`)).toBe(true);
    expect(options.method).toBe('GET');
    expect(options.redirect).toBe('error');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(options).not.toHaveProperty('body');
    expect(url).not.toMatch(/\/import|\/query|\/raw|\/whoami|\/tokens$|\/permission_groups/);
  }
}
afterEach(() => { vi.useRealTimers(); });

describe('bounded production Cloudflare credential diagnosis', () => {
  it.each(Array.from({ length: 8 }, (_, bits) => [Boolean(bits & 1), Boolean(bits & 2), Boolean(bits & 4)]))
  ('follows Wrangler precedence for token=%s key=%s email=%s', async (hasToken, hasKey, hasEmail) => {
    const env = { CLOUDFLARE_ACCOUNT_ID: accountId,
      ...(hasToken ? { CLOUDFLARE_API_TOKEN: credentials.CLOUDFLARE_API_TOKEN } : {}),
      ...(hasKey ? { CLOUDFLARE_API_KEY: credentials.CLOUDFLARE_API_KEY } : {}),
      ...(hasEmail ? { CLOUDFLARE_EMAIL: credentials.CLOUDFLARE_EMAIL } : {}) };
    const { receipt, calls } = await collect({ env });
    const global = hasKey && hasEmail;
    expect(receipt.credentialPresence).toEqual({ apiToken: hasToken, accountId: true, globalKey: hasKey, email: hasEmail });
    expect(receipt.effectiveCredential).toBe(global ? 'GLOBAL_KEY_EMAIL' : hasToken ? 'API_TOKEN' : 'NONE');
    expect(receipt.globalKeyPrecedence).toBe(global);
    if (global) {
      expect(calls).toHaveLength(2);
      expect(receipt.tokenVerification.kind).toBe('NOT_APPLICABLE');
      for (const call of calls) {
        expect(call.options.headers['X-Auth-Key']).toBe(credentials.CLOUDFLARE_API_KEY);
        expect(call.options.headers['X-Auth-Email']).toBe(credentials.CLOUDFLARE_EMAIL);
        expect(call.options.headers).not.toHaveProperty('Authorization');
      }
    } else if (hasToken) {
      expect(calls).toHaveLength(4);
      expect(calls.every((call) => call.options.headers.Authorization === `Bearer ${credentials.CLOUDFLARE_API_TOKEN}`)).toBe(true);
      expect(receipt.tokenVerification.status).toBe('ACTIVE');
    } else { expect(calls).toHaveLength(0); expect(receipt.inputStatus).toBe('NO_CREDENTIALS'); }
    assertSanitized(receipt, calls);
  });

  it('supports Wrangler deprecated credential aliases without copying their values to evidence', async () => {
    const { receipt, calls } = await collect({ env: { CF_ACCOUNT_ID: accountId, CF_API_TOKEN: credentials.CLOUDFLARE_API_TOKEN,
      CF_API_KEY: credentials.CLOUDFLARE_API_KEY, CF_EMAIL: credentials.CLOUDFLARE_EMAIL } });
    expect(receipt.effectiveCredential).toBe('GLOBAL_KEY_EMAIL');
    expect(receipt.account.result).toBe('SUCCESS'); expect(receipt.database.result).toBe('SUCCESS');
    assertSanitized(receipt, calls);
  });

  it.each(['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_KEY', 'CLOUDFLARE_EMAIL', 'CLOUDFLARE_ACCOUNT_ID'])
  ('keeps canonical empty %s ahead of its deprecated alias', async (name) => {
    const alias = { CLOUDFLARE_API_TOKEN: 'CF_API_TOKEN', CLOUDFLARE_API_KEY: 'CF_API_KEY',
      CLOUDFLARE_EMAIL: 'CF_EMAIL', CLOUDFLARE_ACCOUNT_ID: 'CF_ACCOUNT_ID' }[name];
    const env = { [name]: '', [alias]: credentials[name] };
    const { receipt, calls } = await collect({ env });
    expect(receipt.credentialPresence[{ CLOUDFLARE_API_TOKEN: 'apiToken', CLOUDFLARE_API_KEY: 'globalKey',
      CLOUDFLARE_EMAIL: 'email', CLOUDFLARE_ACCOUNT_ID: 'accountId' }[name]]).toBe(false);
    expect(calls).toHaveLength(0); assertSanitized(receipt);
  });

  it.each(['has whitespace', 'fake\nInjected: header', 'x'.repeat(4097)])
  ('blocks malformed effective token before any request', async (value) => {
    const { receipt, calls } = await collect({ env: { ...tokenEnv, CLOUDFLARE_API_TOKEN: value } });
    expect(receipt.inputStatus).toBe('INVALID_CREDENTIALS'); expect(calls).toHaveLength(0);
    assertSanitized(receipt);
  });

  it('does not fall back from a malformed global credential pair to a valid API token', async () => {
    const { receipt, calls } = await collect({ env: { ...credentials, CLOUDFLARE_EMAIL: 'private\nInjected' } });
    expect(receipt.effectiveCredential).toBe('GLOBAL_KEY_EMAIL');
    expect(receipt.inputStatus).toBe('INVALID_CREDENTIALS'); expect(calls).toHaveLength(0);
    assertSanitized(receipt);
  });

  it.each([undefined, 'https://private.invalid/account', `${accountId}/tokens`, `${accountId}?x=1`])
  ('never embeds invalid account identifiers in a URL', async (value) => {
    const { receipt, calls } = await collect({ env: { ...tokenEnv, CLOUDFLARE_ACCOUNT_ID: value } });
    expect(receipt.account.result).toBe('NOT_REQUESTED'); expect(receipt.database.result).toBe('NOT_REQUESTED');
    expect(calls.every((call) => call.url.startsWith(`${api}/user/tokens/`))).toBe(true);
    expect(receipt.policy.accountAllowResource).toBe('UNKNOWN'); assertSanitized(receipt, calls);
  });

  it.each([undefined, 'https://private.invalid/database', `${databaseId}/import`, `${databaseId}?x=1`])
  ('never embeds invalid database identifiers in a URL', async (value) => {
    const { receipt, calls } = await collect({ databaseId: value });
    expect(receipt.inputStatus).toBe('INVALID_DATABASE_ID'); expect(receipt.database.result).toBe('NOT_REQUESTED');
    expect(calls.some((call) => call.url.includes('/d1/'))).toBe(false); assertSanitized(receipt, calls);
  });

  it('does not convert an active token or successful database GET into a write grant', async () => {
    const { receipt, calls } = await collect();
    expect(receipt.account).toEqual({ result: 'SUCCESS', httpStatus: 200, providerCodes: [] });
    expect(receipt.database.result).toBe('SUCCESS'); expect(receipt.tokenVerification.status).toBe('ACTIVE');
    expect(receipt.policy.request).toEqual({ result: 'AUTHORIZATION_ERROR', httpStatus: 403, providerCodes: [10000] });
    expect(receipt.policy.metadata).toBe('UNKNOWN'); expect(receipt.policy.d1EditAllow).toBe('UNKNOWN');
    assertSanitized(receipt, calls);
  });

  it('uses only the verified account-token ID after Wrangler code1000 type detection', async () => {
    const accountTokenPath = `${accountPath}/tokens/${tokenId}`;
    const { receipt, calls } = await collect({}, {
      '/user/tokens/verify': denied(1000, 400),
      [`${accountPath}/tokens/verify`]: reply({ id: tokenId, status: 'active' }),
      [accountTokenPath]: denied(),
    });
    expect(receipt.tokenVerification.kind).toBe('ACCOUNT'); expect(receipt.tokenVerification.status).toBe('ACTIVE');
    expect(receipt.tokenVerification.checks.map((check) => check.kind)).toEqual(['USER', 'ACCOUNT']);
    expect(calls.some((call) => call.url === `${api}${accountTokenPath}`)).toBe(true);
    expect(calls.some((call) => call.url === `${api}${tokenPath}`)).toBe(false); assertSanitized(receipt, calls);
  });

  it('does not guess account token type or call metadata on an authentication failure', async () => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': denied() });
    expect(receipt.tokenVerification.kind).toBe('UNKNOWN'); expect(receipt.tokenVerification.status).toBe('UNKNOWN');
    expect(receipt.tokenVerification.checks).toHaveLength(1);
    expect(calls.filter((call) => call.url.includes('/tokens/'))).toHaveLength(1); assertSanitized(receipt, calls);
  });

  it.each(['disabled', 'expired', 'private unknown status'])
  ('does not request metadata when token status is %s', async (status) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': reply({ id: tokenId, status }) });
    expect(receipt.tokenVerification.status).toBe(['disabled', 'expired'].includes(status) ? status.toUpperCase() : 'UNKNOWN');
    expect(receipt.policy.request.result).toBe('NOT_REQUESTED');
    expect(calls.some((call) => call.url === `${api}${tokenPath}`)).toBe(false); assertSanitized(receipt, calls);
  });

  it('keeps malformed or omitted verified token IDs private and does not request a guessed ID', async () => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': reply({ id: '../private/token729', status: 'active' }) });
    expect(receipt.tokenVerification.status).toBe('ACTIVE'); expect(receipt.policy.request.result).toBe('NOT_REQUESTED');
    expect(calls).toHaveLength(3); assertSanitized(receipt, calls);
  });

  it('rejects policy metadata for a different token and identity responses for different resources', async () => {
    const { receipt, calls } = await collect({}, {
      [tokenPath]: reply({ id: accountId, policies: [] }),
      [accountPath]: reply({ id: tokenId }), [databasePath]: reply({ uuid: privateText }),
    });
    expect(receipt.policy.request.result).toBe('IDENTITY_MISMATCH');
    expect(receipt.policy.metadata).toBe('UNKNOWN'); expect(receipt.account.result).toBe('IDENTITY_MISMATCH');
    expect(receipt.database.result).toBe('IDENTITY_MISMATCH'); assertSanitized(receipt, calls);
  });

  it('publishes only observed policy enums even for explicit edit/account/IP/time metadata', async () => {
    const metadata = { id: tokenId, name: privateText, creator_email_at_creation: credentials.CLOUDFLARE_EMAIL,
      condition: { request_ip: { in: ['203.0.113.0/24'] } }, not_before: '2026-10-01T00:00:00Z', expires_on: '2026-11-01T00:00:00Z',
      policies: [{ id: 'policy-private729', effect: 'allow', permission_groups: [{ id: 'permission-private729', name: 'D1 Edit' }],
        resources: { [`com.cloudflare.api.account.${accountId}`]: '*' } },
      { effect: 'deny', permission_groups: [{ name: 'D1 Write' }], resources: { 'com.cloudflare.api.account.*': '*' } }] };
    const { receipt, calls } = await collect({}, { [tokenPath]: reply(metadata) });
    expect(receipt.policy).toMatchObject({ metadata: 'OBSERVED', d1EditAllow: 'OBSERVED', d1EditDeny: 'OBSERVED',
      accountAllowResource: 'OBSERVED', allAccountsAllowResource: 'NOT_OBSERVED', ipRestriction: 'OBSERVED',
      timeBounds: { expiresOn: 'FUTURE', notBefore: 'PAST_OR_PRESENT' } });
    assertSanitized(receipt, calls);
  });

  it('recognizes named D1 Write and all-account resource observations without inferring an effective grant', async () => {
    const { receipt, calls } = await collect({}, { [tokenPath]: reply({ id: tokenId,
      policies: [{ effect: 'allow', permission_groups: [{ name: 'D1 Write' }], resources: { 'com.cloudflare.api.account.*': '*' } }] }) });
    expect(receipt.policy.d1EditAllow).toBe('OBSERVED'); expect(receipt.policy.allAccountsAllowResource).toBe('OBSERVED');
    expect(receipt.policy.accountAllowResource).toBe('NOT_OBSERVED'); assertSanitized(receipt, calls);
  });

  it.each([{}, { policies: null }, { policies: [{ effect: 'allow', permission_groups: [{ id: tokenId }], resources: {} }] },
    { policies: [{ effect: 'private', permission_groups: [], resources: {} }] }, { policies: Array.from({ length: 129 }, () => ({})) }])
  ('keeps unavailable or invalid permission policy evidence UNKNOWN', async (extra) => {
    const { receipt, calls } = await collect({}, { [tokenPath]: reply({ id: tokenId, ...extra }) });
    expect(receipt.policy.metadata).toBe('OBSERVED'); expect(receipt.policy.d1EditAllow).toBe('UNKNOWN');
    expect(receipt.policy.accountAllowResource).toBe('UNKNOWN'); assertSanitized(receipt, calls);
  });

  it('records no named D1 Edit in complete observed policy metadata without making a denial certification', async () => {
    const { receipt, calls } = await collect({}, { [tokenPath]: reply({ id: tokenId,
      policies: [{ effect: 'allow', permission_groups: [{ name: 'D1 Read' }], resources: { [`com.cloudflare.api.account.${accountId}`]: '*' } }] }) });
    expect(receipt.policy.d1EditAllow).toBe('NOT_OBSERVED'); expect(receipt.policy.ipRestriction).toBe('UNKNOWN');
    expect(receipt.policy.timeBounds).toEqual({ expiresOn: 'UNKNOWN', notBefore: 'UNKNOWN' }); assertSanitized(receipt, calls);
  });

  it.each([
    ['2026-10-08T00:00:00Z', 'FUTURE'], ['2026-10-07T00:00:00Z', 'PAST_OR_PRESENT'],
    ['2026-10-06T00:00:00Z', 'PAST_OR_PRESENT'], ['private malformed date', 'UNKNOWN'],
  ])('bounds token time metadata for %s', async (boundary, classification) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': reply({ id: tokenId, status: 'active',
      expires_on: boundary, not_before: boundary }) });
    expect(receipt.tokenVerification.timeBounds).toEqual({ expiresOn: classification, notBefore: classification });
    expect(receipt.policy.timeBounds).toEqual({ expiresOn: 'UNKNOWN', notBefore: 'UNKNOWN' }); assertSanitized(receipt, calls);
  });

  it('never parses codes out of private messages, URLs, token IDs, or success messages', async () => {
    const errors = [10000, '10000', -1, 1.2, '123456789', '12private', null, {}, '2001', 3002, 4003, 5004]
      .map((code) => ({ code, message: `${privateText} [code: 9999]` }));
    const { receipt, calls } = await collect({}, {
      '/user/tokens/verify': reply(null, 403, { success: false, errors,
        messages: [{ code: 9999, message: privateText }], token_id: '4444' }),
    });
    expect(receipt.tokenVerification.checks[0].providerCodes).toEqual([10000, 2001, 3002, 4003]); assertSanitized(receipt, calls);
    const active = await collect({}, { '/user/tokens/verify': reply({ id: tokenId, status: 'active' }, 200,
      { messages: [{ code: 10000, message: 'This API Token is valid and active' }] }) });
    expect(active.receipt.tokenVerification.checks[0].providerCodes).toEqual([]); assertSanitized(active.receipt, active.calls);
  });

  it.each([401, 403, 500])('sanitizes HTTP %s without echoing raw provider text', async (status) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': denied(10000, status) });
    expect(receipt.tokenVerification.checks[0]).toMatchObject({ httpStatus: status,
      result: status === 500 ? 'HTTP_ERROR' : 'AUTHORIZATION_ERROR', providerCodes: [10000] }); assertSanitized(receipt, calls);
  });

  it('handles provider failure on HTTP200 without certifying a token', async () => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': denied(10000, 200) });
    expect(receipt.tokenVerification.checks[0].result).toBe('PROVIDER_REJECTED');
    expect(receipt.tokenVerification.status).toBe('UNKNOWN'); assertSanitized(receipt, calls);
  });

  it.each([null, [], { success: 'true', result: { id: tokenId } }, { success: true, result: null }])
  ('rejects invalid provider envelope without serializing it', async (body) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': new Response(JSON.stringify(body)) });
    expect(receipt.tokenVerification.checks[0].result).toBe('INVALID_RESPONSE'); assertSanitized(receipt, calls);
  });

  it('sanitizes malformed JSON and fetch failures independently from successful database/account reads', async () => {
    const { receipt, calls } = await collect({}, {
      '/user/tokens/verify': () => { throw new Error(`${privateText} ${credentials.CLOUDFLARE_API_TOKEN}`); },
      [accountPath]: new Response(`<html>${privateText}</html>`),
    });
    expect(receipt.tokenVerification.checks[0].result).toBe('REQUEST_FAILED');
    expect(receipt.account.result).toBe('INVALID_RESPONSE'); expect(receipt.database.result).toBe('SUCCESS'); assertSanitized(receipt, calls);
  });

  it.each([301, 302, 307])('rejects HTTP redirect %s and never reads its location/body', async (status) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': new Response(privateText,
      { status, headers: { location: 'https://private.invalid/steal729' } }) });
    expect(receipt.tokenVerification.checks[0]).toMatchObject({ result: 'REDIRECT_REJECTED', httpStatus: status, providerCodes: [] });
    expect(calls).toHaveLength(3); assertSanitized(receipt, calls);
  });

  it('rejects an already followed response returned by an injected fetch implementation', async () => {
    const response = reply({ id: tokenId, status: 'active' });
    Object.defineProperty(response, 'redirected', { value: true });
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': response });
    expect(receipt.tokenVerification.checks[0].result).toBe('REDIRECT_REJECTED'); assertSanitized(receipt, calls);
  });

  it.each([true, false])('enforces the 64KiB body limit with declared length=%s', async (declared) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': new Response('x'.repeat(65_537),
      declared ? { headers: { 'content-length': '65537' } } : {}) });
    expect(receipt.tokenVerification.checks[0].result).toBe('BODY_SIZE_LIMIT'); assertSanitized(receipt, calls);
  });

  it('terminates a fetch that ignores abort within15seconds and keeps the error private', async () => {
    vi.useFakeTimers();
    const mock = fakeApi({ '/user/tokens/verify': () => new Promise(() => {}) });
    const pending = collectCloudflareCredentialDiagnostics({ env: tokenEnv, databaseId, now, fetchImpl: mock.fetchImpl });
    await vi.advanceTimersByTimeAsync(14_999);
    let settled = false; void pending.then(() => { settled = true; });
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const receipt = await pending;
    expect(receipt.tokenVerification.checks[0]).toMatchObject({ result: 'TIMED_OUT', httpStatus: null });
    expect(mock.calls.find((call) => call.url.endsWith('/verify')).options.signal.aborted).toBe(true);
    assertSanitized(receipt, mock.calls);
  });

  it('includes response body consumption in the same15second deadline', async () => {
    vi.useFakeTimers();
    const body = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')); } });
    const mock = fakeApi({ '/user/tokens/verify': new Response(body) });
    const pending = collectCloudflareCredentialDiagnostics({ env: tokenEnv, databaseId, now, fetchImpl: mock.fetchImpl });
    await vi.advanceTimersByTimeAsync(15_000);
    const receipt = await pending;
    expect(receipt.tokenVerification.checks[0]).toMatchObject({ result: 'TIMED_OUT', httpStatus: 200 });
    assertSanitized(receipt, mock.calls);
  });

  it.each(['AbortError', 'TimeoutError'])('sanitizes fetch %s as timeout', async (name) => {
    const { receipt, calls } = await collect({}, { '/user/tokens/verify': () => {
      const error = new Error(privateText); error.name = name; throw error;
    } });
    expect(receipt.tokenVerification.checks[0].result).toBe('TIMED_OUT'); assertSanitized(receipt, calls);
  });
});

describe('unknown evidence boundaries', () => {
  it.each([null, [], 'private invalid environment'])('rejects malformed environment without requests', async (env) => {
    const { receipt, calls } = await collect({ env });
    expect(receipt.inputStatus).toBe('INVALID_ENVIRONMENT'); expect(calls).toHaveLength(0); assertSanitized(receipt);
  });

  it('keeps unfamiliar nested resource policies UNKNOWN instead of interpreting a missing account grant', async () => {
    const { receipt, calls } = await collect({}, { [tokenPath]: reply({ id: tokenId,
      policies: [{ effect: 'allow', permission_groups: [{ name: 'D1 Edit' }],
        resources: { [`com.cloudflare.api.account.${accountId}`]: { private_resource: '*' } } }] }) });
    expect(receipt.policy.d1EditAllow).toBe('OBSERVED'); expect(receipt.policy.accountAllowResource).toBe('UNKNOWN');
    expect(receipt.policy.allAccountsAllowResource).toBe('UNKNOWN'); assertSanitized(receipt, calls);
  });

  it('accepts a numeric observation time and keeps failed clock observations unknown', async () => {
    const value = { id: tokenId, status: 'active', expires_on: '2026-10-08T00:00:00Z' };
    const numeric = await collect({ now: now() }, { '/user/tokens/verify': reply(value) });
    expect(numeric.receipt.tokenVerification.timeBounds.expiresOn).toBe('FUTURE');
    const failed = await collect({ now: () => { throw new Error(privateText); } }, { '/user/tokens/verify': reply(value) });
    expect(failed.receipt.tokenVerification.timeBounds.expiresOn).toBe('UNKNOWN'); assertSanitized(failed.receipt, failed.calls);
  });
});
