import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { validateFixture, fixtureQueries, POLICIES, run } from '../../scripts/t20-staging-fixtures.mjs';
const fixture = { userId: 'usr_1791494252635_a5ge6', householdId: 'hh_usr_1791494252635_a5ge6',
  email: 't20-cert-01234567-89ab-4cde-8fab-0123456789ab@example.com', policy: 'forbidden' };

describe('bounded staging T20 certification fixtures', () => {
  it.each(Object.keys(POLICIES))('accepts the fixed %s policy without caller-controlled SQL', policy => {
    const queries = fixtureQueries({ ...fixture, policy });
    expect(queries.insert.sql).toMatch(/^INSERT INTO household_ranking_preferences/);
    expect(queries.insert.sql).toContain('NOT EXISTS');
    expect(queries.insert.sql).toContain("a.is_verified = 1");
    expect(queries.insert.sql).toContain("m.role = 'owner'");
    expect(queries.insert.params[0]).toBe(JSON.stringify({ version: 1, values: POLICIES[policy] }));
    expect(queries.insert.sql).not.toMatch(/\b(UPDATE|DELETE|REPLACE|DROP|ALTER|CREATE)\b/);
  });
  it.each([
    { ...fixture, householdId: 'hh_other' },
    { ...fixture, userId: "usr_1791494252635_a5ge6'; DELETE FROM recipes" },
    { ...fixture, email: 'real.user@example.com' },
    { ...fixture, policy: 'arbitrary' },
    { ...fixture, sql: 'UPDATE recipes' },
    { ...fixture, databaseId: 'production' },
    null,
  ])('rejects non-certification identities and untrusted fields', input => {
    expect(() => validateFixture(input)).toThrow();
  });
  it('keeps credentials inside staging Environment and has no migration/deploy/user-provisioning steps', () => {
    const require = createRequire(import.meta.url);
    const { load } = require(require.resolve('js-yaml', { paths: [require.resolve('eslint/package.json')] }));
    const workflow = load(readFileSync('.github/workflows/t20-staging-fixture.yml', 'utf8'));
    expect(workflow.jobs.fixture.environment).toBe('staging');
    expect(workflow.jobs.fixture.if).toContain("github.ref == 'refs/heads/main'");
    expect(workflow.jobs.fixture.steps.filter(step => step.run).map(step => step.run)).toEqual(['pnpm install --frozen-lockfile', 'node scripts/t20-staging-fixtures.mjs']);
    expect(workflow.permissions).toEqual({ contents: 'read', actions: 'read' });
    expect(workflow.concurrency['cancel-in-progress']).toBe(false);
    expect(workflow.jobs.fixture.steps.at(-1).with.path).toBe('t20-staging-fixture-receipt.json');
    expect(readFileSync('scripts/t20-staging-fixtures.mjs', 'utf8')).not.toMatch(/\/auth\/(register|verify-otp)|migrations apply|secret put/);
  });
});


it.each([
  {GITHUB_REPOSITORY:'vn-tak/Tako-san',GITHUB_REPOSITORY_ID:'1385308553',GITHUB_REF:'refs/heads/main',T20_FIXTURE_ENVIRONMENT:'production',CONFIRM_STAGING_FIXTURE:'true'},
  {GITHUB_REPOSITORY:'vn-tak/Tako-san',GITHUB_REPOSITORY_ID:'1385308553',GITHUB_REF:'refs/heads/feature',T20_FIXTURE_ENVIRONMENT:'staging',CONFIRM_STAGING_FIXTURE:'true'},
  {GITHUB_REPOSITORY:'vn-tak/Tako-san',GITHUB_REPOSITORY_ID:'1385308553',GITHUB_REF:'refs/heads/main',T20_FIXTURE_ENVIRONMENT:'staging',CONFIRM_STAGING_FIXTURE:'false'},
  {GITHUB_REPOSITORY:'vn-tak/Tako-san',GITHUB_REPOSITORY_ID:'1',GITHUB_REF:'refs/heads/main',T20_FIXTURE_ENVIRONMENT:'staging',CONFIRM_STAGING_FIXTURE:'true'},
])('rejects the wrong environment, branch, confirmation or repo before remote access', async env => {
  let calls=0;
  await expect(run({ref:'a'.repeat(40),fixtureJson:JSON.stringify(fixture),env,fetchJson:async()=>{calls++;return{};},requireMain:async()=>{calls++;}})).rejects.toThrow();
  expect(calls).toBe(0);
});

it.each([
  ['verified owner', 1, 'owner', fixture.email, null, 1],
  ['unverified account', 0, 'owner', fixture.email, null, 0],
  ['non-owner', 1, 'member', fixture.email, null, 0],
  ['different account email', 1, 'owner', 'other@example.com', null, 0],
  ['existing user policy', 1, 'owner', fixture.email, '{"version":1,"values":{}}', 0],
])('SQL changes only a fresh verified test owner: %s', async (_name, verified, role, email, existing, expectedChanges) => {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`CREATE TABLE households(id TEXT PRIMARY KEY, created_by TEXT);
      CREATE TABLE auth_accounts(user_id TEXT, email TEXT, is_verified INTEGER);
      CREATE TABLE household_members(household_id TEXT, user_id TEXT, role TEXT);
      CREATE TABLE household_ranking_preferences(household_id TEXT PRIMARY KEY, values_json TEXT, updated_at TEXT);`);
    db.prepare('INSERT INTO households VALUES(?,?)').run(fixture.householdId, fixture.userId);
    db.prepare('INSERT INTO auth_accounts VALUES(?,?,?)').run(fixture.userId,email,verified);
    db.prepare('INSERT INTO household_members VALUES(?,?,?)').run(fixture.householdId,fixture.userId,role);
    if(existing) db.prepare('INSERT INTO household_ranking_preferences VALUES(?,?,?)').run(fixture.householdId,existing,'2026-10-08');
    const { insert, stored } = fixtureQueries(fixture);
    expect(Number(db.prepare(insert.sql).run(...insert.params).changes)).toBe(expectedChanges);
    const policy = db.prepare('SELECT values_json FROM household_ranking_preferences WHERE household_id=?').get(fixture.householdId)?.values_json;
    expect(policy).toBe(existing ?? (expectedChanges ? stored : undefined));
    expect(Number(db.prepare(insert.sql).run(...insert.params).changes)).toBe(0);
  } finally { db.close(); }
});

it.each(['prepare', 'audit'])('pins every remote call to the staging database and reports bounded writes for %s', async operation => {
  const { execFileSync } = await import('node:child_process');
  const { STAGING_D1 } = await import('../../scripts/staging-d1-runtime-readiness-check.mjs');
  const ref = execFileSync('git', ['rev-parse','HEAD'], {encoding:'utf8'}).trim();
  const queries = fixtureQueries(fixture);
  let stored = operation === 'audit' ? queries.stored : null;
  const calls = [];
  const result = await run({ref,operation,fixtureJson:JSON.stringify(fixture),
    env:{GITHUB_REPOSITORY:'vn-tak/Tako-san',GITHUB_REPOSITORY_ID:'1385308553',GITHUB_REF:'refs/heads/main',T20_FIXTURE_ENVIRONMENT:'staging',CONFIRM_STAGING_FIXTURE:'true',GH_TOKEN:'test-github-token',CLOUDFLARE_API_TOKEN:'test-cf-token',CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32)},
    requireMain:async input=>{expect(input.sha).toBe(ref);},
    fetchJson:async (url,options={})=>{
      calls.push({url,...options});
      if(url.startsWith('https://api.github.com/')) return {workflow_runs:[{id:1,run_attempt:1,head_sha:ref,head_branch:'main',event:'push',path:'.github/workflows/ci.yml',repository:{full_name:'vn-tak/Tako-san'},head_repository:{full_name:'vn-tak/Tako-san'},status:'completed',conclusion:'success'}]};
      if(url.startsWith('https://frigo-staging.')) { expect(url).toBe('https://frigo-staging.tungbipdz.workers.dev/api/v1/health/ready'); return {commit:ref,recipeAuthority:{configuredMode:'d1',globalSource:'d1',fallbackReason:null}}; }
      expect(url).toContain(`/d1/database/${STAGING_D1.id}`);
      expect(url).not.toContain('f975ec39-b2c8-4a2a-80e1-0366054599d3');
      if(!url.endsWith('/query')) return {success:true,result:{uuid:STAGING_D1.id,name:STAGING_D1.name}};
      const input=JSON.parse(options.body);
      if(input.sql===queries.inspect.sql) return {success:true,result:[{success:true,results:[{id:fixture.householdId,values_json:stored}]}]};
      if(input.sql===queries.insert.sql) {stored=queries.stored;return {success:true,result:[{success:true,meta:{changes:1},results:[]}]};}
      expect(input.sql).toMatch(/^SELECT/);
      expect(input.params).toEqual([fixture.householdId]);
      return {success:true,result:[{success:true,results:[{id:'fixed',value:1}]}]};
    }});
  expect(result.writes).toBe(operation==='prepare'?1:0);
  expect(result.productionWrites).toBe(0);
  expect(JSON.stringify(result)).not.toContain(fixture.email);
  expect(JSON.stringify(result)).not.toContain('test-cf-token');
  expect(calls.filter(call=>call.body&&JSON.parse(call.body).sql.startsWith('INSERT'))).toHaveLength(operation==='prepare'?1:0);
});
it.each(Object.keys(POLICIES))('prepares and audits %s using the complete applied D1 schema', async policy => {
  const { execFileSync } = await import('node:child_process');
  const { SqliteD1 } = await import('../helpers/sqlite-d1.ts');
  const { STAGING_D1 } = await import('../../scripts/staging-d1-runtime-readiness-check.mjs');
  const db = new SqliteD1();
  try {
    const target = { ...fixture, policy };
    db.execute('INSERT INTO users (id, email) VALUES (?, ?)', [target.userId, target.email]);
    db.execute('INSERT INTO households (id, name, created_by) VALUES (?, ?, ?)', [target.householdId, 'T20 certification', target.userId]);
    db.execute('INSERT INTO household_members (id, household_id, user_id, role) VALUES (?, ?, ?, ?)', ['fixture-member', target.householdId, target.userId, 'owner']);
    db.execute('INSERT INTO auth_accounts (id, user_id, email, is_verified) VALUES (?, ?, ?, ?)', ['fixture-auth', target.userId, target.email, 1]);
    const ref = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const context = {
      ref, fixtureJson: JSON.stringify(target),
      env: { GITHUB_REPOSITORY: 'vn-tak/Tako-san', GITHUB_REPOSITORY_ID: '1385308553', GITHUB_REF: 'refs/heads/main', T20_FIXTURE_ENVIRONMENT: 'staging', CONFIRM_STAGING_FIXTURE: 'true', GH_TOKEN: 'test-github-token', CLOUDFLARE_API_TOKEN: 'test-cf-token', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32) },
      requireMain: async input => { expect(input.sha).toBe(ref); },
      fetchJson: async (url, options = {}) => {
        if (url.startsWith('https://api.github.com/')) return { workflow_runs: [{ id: 1, run_attempt: 1, head_sha: ref, head_branch: 'main', event: 'push', path: '.github/workflows/ci.yml', repository: { full_name: 'vn-tak/Tako-san' }, head_repository: { full_name: 'vn-tak/Tako-san' }, status: 'completed', conclusion: 'success' }] };
        if (url.startsWith('https://frigo-staging.')) return { commit: ref, recipeAuthority: { configuredMode: 'd1', globalSource: 'd1', fallbackReason: null } };
        expect(url).toContain(`/d1/database/${STAGING_D1.id}`);
        if (!url.endsWith('/query')) return { success: true, result: { uuid: STAGING_D1.id, name: STAGING_D1.name } };
        const query = JSON.parse(options.body);
        return { success: true, result: [db.execute(query.sql, query.params)] };
      },
    };
    const prepared = await run({ ...context, operation: 'prepare' });
    expect(prepared.writes).toBe(1);
    const stored = db.query('SELECT values_json, updated_at FROM household_ranking_preferences WHERE household_id = ?', target.householdId)[0];
    expect(stored.values_json).toBe(fixtureQueries(target).stored);
    expect(stored.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const audited = await run({ ...context, operation: 'audit' });
    expect(audited.writes).toBe(0);
    expect(audited.inventory).toEqual(prepared.inventory);
    await expect(run({ ...context, operation: 'prepare' })).rejects.toThrow('Existing household policy');
    expect(db.query('PRAGMA foreign_key_check')).toEqual([]);
  } finally { db.close(); }
});
