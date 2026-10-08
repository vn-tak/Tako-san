import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { requireCurrentHostedMain, requireSuccessfulCi } from './release-check.mjs';
import { pinnedStagingDatabase, STAGING_D1 } from './staging-d1-runtime-readiness-check.mjs';

const REPOSITORY = 'vn-tak/Tako-san';
const ORIGIN = 'https://frigo-staging.tungbipdz.workers.dev';
export const POLICIES = Object.freeze({
  none: {},
  forbidden: { forbiddenIngredientIds: ['RICE', 'CHICKEN_EGG'] },
  dietary: { requiredDietaryTags: ['vegetarian'] },
  nutrition: { mealNutritionTargets: [{ nutrient: 'proteinG', max: 80, hard: true }] },
});

export function validateFixture(value) {
  assert(value && typeof value === 'object' && !Array.isArray(value), 'Fixture request required');
  assert.deepEqual(Object.keys(value).sort(), ['email', 'householdId', 'policy', 'userId']);
  assert.match(value.userId, /^usr_[0-9]{13}_[a-z0-9]{5}$/);
  assert.equal(value.householdId, `hh_${value.userId}`);
  assert.match(value.email, /^t20-cert-[a-f0-9-]{36}@example\.com$/);
  assert(Object.hasOwn(POLICIES, value.policy), 'Unknown fixture policy');
  return value;
}

// Only a fresh verified certification household can receive a fixture. No upsert,
// arbitrary SQL, catalog mutation, auth mutation or production target is supported.
export function fixtureQueries(raw) {
  const fixture = validateFixture(raw);
  const stored = JSON.stringify({ version: 1, values: POLICIES[fixture.policy] });
  const where = `h.id = ? AND h.created_by = ? AND a.user_id = ? AND a.email = ? AND a.is_verified = 1
    AND m.user_id = ? AND m.role = 'owner'`;
  const params = [fixture.householdId, fixture.userId, fixture.userId, fixture.email, fixture.userId];
  const joined = `households h JOIN auth_accounts a ON a.user_id = h.created_by
    JOIN household_members m ON m.household_id = h.id`;
  return {
    inspect: { sql: `SELECT h.id, p.values_json FROM ${joined}
      LEFT JOIN household_ranking_preferences p ON p.household_id = h.id WHERE ${where}`, params },
    insert: { sql: `INSERT INTO household_ranking_preferences (household_id, values_json, updated_at)
      SELECT h.id, ?, datetime('now') FROM ${joined} WHERE ${where}
      AND NOT EXISTS (SELECT 1 FROM household_ranking_preferences p WHERE p.household_id = h.id)`,
    params: [stored, ...params] },
    stored,
  };
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(30_000) });
  assert(response.ok, `Remote request failed: HTTP ${response.status}`);
  return response.json();
}

export async function run({ ref, fixtureJson, operation = 'prepare', env = process.env, fetchJson = jsonFetch, requireMain = requireCurrentHostedMain }) {
  assert(['prepare', 'audit'].includes(operation), 'Unknown fixture operation');
  assert.equal(env.GITHUB_REPOSITORY, REPOSITORY);
  assert.equal(env.GITHUB_REPOSITORY_ID, '1385308553');
  assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.equal(env.T20_FIXTURE_ENVIRONMENT, 'staging');
  assert.equal(env.CONFIRM_STAGING_FIXTURE, 'true');
  assert.match(ref ?? '', /^[a-f0-9]{40}$/);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), ref);
  assert.deepEqual(pinnedStagingDatabase(), STAGING_D1);
  const fixture = validateFixture(JSON.parse(fixtureJson));
  await requireMain({ sha: ref, repository: REPOSITORY, token: env.GH_TOKEN });
  const headers = { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json' };
  const runs = await fetchJson(`https://api.github.com/repos/${REPOSITORY}/actions/workflows/ci.yml/runs?branch=main&event=push&head_sha=${ref}&per_page=100`, { headers });
  const ci = requireSuccessfulCi(runs.workflow_runs, { sha: ref, repository: REPOSITORY });
  const readiness = await fetchJson(`${ORIGIN}/api/v1/health/ready`);
  assert.equal(readiness.commit, ref);
  assert.equal(readiness.recipeAuthority.configuredMode, 'd1');
  assert.equal(readiness.recipeAuthority.globalSource, 'd1');
  assert.equal(readiness.recipeAuthority.fallbackReason, null);
  assert.match(env.CLOUDFLARE_ACCOUNT_ID ?? '', /^[a-f0-9]{32}$/);
  assert(env.CLOUDFLARE_API_TOKEN, 'Staging Cloudflare credential required');
  const target = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${STAGING_D1.id}`;
  const cfHeaders = { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' };
  const identity = await fetchJson(target, { headers: cfHeaders });
  assert.equal(identity.success, true);
  assert.equal(identity.result.uuid, STAGING_D1.id);
  assert.equal(identity.result.name, STAGING_D1.name);
  const query = async (request) => {
    const response = await fetchJson(`${target}/query`, { method: 'POST', headers: cfHeaders, body: JSON.stringify(request) });
    assert.equal(response.success, true, 'D1 request failed');
    assert.equal(response.result.length, 1);
    assert.equal(response.result[0].success, true);
    return response.result[0];
  };
  const queries = fixtureQueries(fixture);
  const before = await query(queries.inspect);
  assert.equal(before.results.length, 1, 'Verified certification household not found');
  const observe = async () => {
    const stock = await query({ sql: 'SELECT id, ingredient_id, quantity, unit, version, updated_at FROM inventory_items WHERE household_id = ? ORDER BY id LIMIT 251', params: [fixture.householdId] });
    const events = await query({ sql: 'SELECT id, event_type, metadata FROM inventory_events WHERE household_id = ? ORDER BY id LIMIT 251', params: [fixture.householdId] });
    assert(stock.results.length <= 250 && events.results.length <= 250, 'Certification household observation bound exceeded');
    return { stockCount: stock.results.length, eventCount: events.results.length,
      stockHash: createHash('sha256').update(JSON.stringify(stock.results)).digest('hex'),
      eventHash: createHash('sha256').update(JSON.stringify(events.results)).digest('hex') };
  };
  const inventory = await observe();
  if (operation === 'prepare') {
    assert.equal(before.results[0].values_json, null, 'Existing household policy must never be overwritten');
    await requireMain({ sha: ref, repository: REPOSITORY, token: env.GH_TOKEN });
    const inserted = await query(queries.insert);
    assert.equal(inserted.meta.changes, 1, 'Fixture insert was not applied exactly once');
    const after = await query(queries.inspect);
    assert.equal(after.results.length, 1);
    assert.equal(after.results[0].values_json, queries.stored);
    assert.deepEqual(await observe(), inventory, 'Fixture changed physical stock or inventory events');
  } else {
    assert.equal(before.results[0].values_json, queries.stored, 'Audit policy differs from prepared fixture');
  }
  return { status: operation === 'prepare' ? 'T20_STAGING_FIXTURE_CREATED' : 'T20_STAGING_FIXTURE_AUDITED', sha: ref, ci, database: STAGING_D1,
    policy: fixture.policy, operation, inventory,
    householdHash: createHash('sha256').update(fixture.householdId).digest('hex'),
    writes: operation === 'prepare' ? 1 : 0, catalogWrites: 0, authWrites: 0, productionWrites: 0, checkedAt: new Date().toISOString() };

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const receipt = await run({ ref: process.env.FIXTURE_REF, fixtureJson: process.env.FIXTURE_JSON, operation: process.env.FIXTURE_OPERATION });
    writeFileSync('t20-staging-fixture-receipt.json', JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt));
  } catch {
    console.error('T20 staging fixture gate failed; no automatic retry or arbitrary database repair is permitted.');
    process.exitCode = 1;
  }
}
