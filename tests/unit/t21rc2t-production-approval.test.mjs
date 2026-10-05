import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { T21RC2_REVIEW_BOUND_PATHS } from '../../scripts/t21rc2-production-approval.mjs';
import {
  assertReviewedExecutionClosure,
  authorizeT21RC2TProductionRun,
  requireStoredT21RC2TAuthorization,
  runT21RC2TApprovalCommand,
  T21RC2T_EXPECTED_ACTOR,
  T21RC2T_EXPECTED_REVIEWER,
  T21RC2T_OPTIONAL_REVIEW_BOUND_PATHS,
  T21RC2T_REVIEW_BOUND_DIRECTORIES,
  T21RC2T_REVIEW_BOUND_PATHS,
  T21RC2T_REVIEW_BOUND_REQUIRED_FILES,
  T21RC2T_REQUIRED_REVIEW_FILES,
  validateT21RC2TGate,
  validateT21RC2TProductionApproval,
} from '../../scripts/t21rc2t-production-approval.mjs';
import {
  cleanupT21RC2TFiles,
  readT21RC2TPrivateJson,
  safeT21RC2TError,
  t21rc2tError,
} from '../../scripts/t21rc2t-production-files.mjs';

const REPOSITORY = 'vn-tak/Tako-san';
const REPOSITORY_ID = 1385308553;
const C2T_ONLY = new Set(T21RC2T_REQUIRED_REVIEW_FILES.filter((file) => /t21rc2t|T21RC2T/.test(file)));
let temporaryRoot;
let closureRepo;
let gateRepo;
let legacyRepo;

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function addFiles(cwd, files) {
  for (const file of files) {
    const fullPath = path.join(cwd, file);
    mkdirSync(path.dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, `fixture:${file}\n`);
  }
  for (const directory of T21RC2T_REVIEW_BOUND_DIRECTORIES) {
    const fullPath = path.join(cwd, directory, 'closure-marker.json');
    mkdirSync(path.dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, `fixture:${directory}\n`);
  }
}

function createGitFixture({ includeC2T = true } = {}) {
  const cwd = mkdtempSync(path.join(temporaryRoot, 'repo-'));
  git(cwd, ['init', '--quiet', '-b', 'main']);
  git(cwd, ['config', 'user.email', 't21rc2t-test@example.invalid']);
  git(cwd, ['config', 'user.name', 'T21RC2T offline test']);
  addFiles(cwd, T21RC2T_REVIEW_BOUND_REQUIRED_FILES.filter((file) => includeC2T || !C2T_ONLY.has(file)));
  git(cwd, ['add', '--all']);
  git(cwd, ['commit', '--quiet', '-m', includeC2T ? 'C2T reviewed bytes' : 'prior C2 reviewed bytes']);
  const reviewedSha = git(cwd, ['rev-parse', 'HEAD']);
  if (!includeC2T) {
    addFiles(cwd, T21RC2T_REVIEW_BOUND_REQUIRED_FILES.filter((file) => C2T_ONLY.has(file)));
    git(cwd, ['add', '--all']);
    git(cwd, ['commit', '--quiet', '-m', 'add independent C2T bytes']);
  } else {
    writeFileSync(path.join(cwd, 'unbound.txt'), 'not authority\n');
    git(cwd, ['add', '--all']);
    git(cwd, ['commit', '--quiet', '-m', 'unbound change']);
  }
  const executionSha = git(cwd, ['rev-parse', 'HEAD']);
  git(cwd, ['update-ref', 'refs/remotes/origin/main', executionSha]);
  return { cwd, reviewedSha, executionSha };
}

function ciRun(sha, changes = {}) {
  return {
    id: 540,
    run_attempt: 1,
    head_sha: sha,
    head_branch: 'main',
    event: 'push',
    path: '.github/workflows/ci.yml',
    repository: { id: REPOSITORY_ID, full_name: REPOSITORY },
    head_repository: { id: REPOSITORY_ID, full_name: REPOSITORY },
    status: 'completed',
    conclusion: 'success',
    updated_at: '2026-10-05T12:00:00Z',
    ...changes,
  };
}

function gateRun(sha, changes = {}) {
  return {
    id: 9001,
    run_attempt: 1,
    head_sha: sha,
    head_branch: 'main',
    event: 'workflow_dispatch',
    path: '.github/workflows/production-d1-t21rc2t-identity-topology.yml',
    repository: { id: REPOSITORY_ID, full_name: REPOSITORY },
    head_repository: { id: REPOSITORY_ID, full_name: REPOSITORY },
    actor: { login: T21RC2T_EXPECTED_ACTOR },
    triggering_actor: { login: T21RC2T_EXPECTED_ACTOR },
    ...changes,
  };
}

function validGateInput(repo = gateRepo, overrides = {}) {
  const { reviewedSha, executionSha, cwd } = repo;
  return {
    ref: executionSha,
    reviewedSha,
    confirmation: true,
    repositoryId: String(REPOSITORY_ID),
    repository: REPOSITORY,
    actor: T21RC2T_EXPECTED_ACTOR,
    triggeringActor: T21RC2T_EXPECTED_ACTOR,
    runId: '9001',
    runAttempt: '1',
    run: gateRun(executionSha),
    mainSha: executionSha,
    ciRuns: [ciRun(executionSha)],
    cwd,
    ...overrides,
  };
}

function approvalEnvironment(overrides = {}) {
  return {
    id: 811,
    name: 'production',
    can_admins_bypass: false,
    protection_rules: [{
      id: 812,
      type: 'required_reviewers',
      prevent_self_review: true,
      reviewers: [{ type: 'User', reviewer: { id: 913, login: T21RC2T_EXPECTED_REVIEWER } }],
    }],
    deployment_branch_policy: null,
    ...overrides,
  };
}

function approvalHistory(overrides = {}) {
  return [{
    state: 'approved',
    user: { id: 913, type: 'User', login: T21RC2T_EXPECTED_REVIEWER },
    environments: [{ id: 811, name: 'production' }],
    ...overrides,
  }];
}

function githubResponse(body, link = null) {
  const text = JSON.stringify(body);
  return {
    status: 200,
    ok: true,
    redirected: false,
    headers: { get: (name) => name === 'content-length' ? String(Buffer.byteLength(text)) : name === 'link' ? link : null },
    text: async () => text,
  };
}

function apiFixture(repo, {
  approval,
  ci = [ciRun(repo.executionSha)],
  runChanges = {},
  approvalCalls,
  environment = approvalEnvironment(),
} = {}) {
  const requests = [];
  const fetchImpl = async (input, options) => {
    const url = new URL(input);
    requests.push({ url, options });
    if (url.pathname.endsWith('/commits/main')) return githubResponse({ sha: repo.executionSha });
    if (url.pathname.endsWith('/actions/runs/9001')) return githubResponse(gateRun(repo.executionSha, runChanges));
    if (url.pathname.endsWith('/actions/workflows/ci.yml/runs')) {
      return githubResponse({ total_count: ci.length, workflow_runs: ci });
    }
    if (url.pathname.endsWith('/environments/production')) return githubResponse(environment);
    if (url.pathname.endsWith('/actions/runs/9001/approvals')) {
      const index = approvalCalls ? approvalCalls.count++ : 0;
      return githubResponse(approval ? approval(index) : approvalHistory());
    }
    throw new Error('unexpected private API response marker');
  };
  return { fetchImpl, requests };
}

function actionEnv(repo, runnerTemp) {
  return {
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_SHA: repo.executionSha,
    GITHUB_REPOSITORY_ID: String(REPOSITORY_ID),
    GITHUB_REPOSITORY: REPOSITORY,
    GITHUB_ACTOR: T21RC2T_EXPECTED_ACTOR,
    GITHUB_TRIGGERING_ACTOR: T21RC2T_EXPECTED_ACTOR,
    GITHUB_RUN_ID: '9001',
    GITHUB_RUN_ATTEMPT: '1',
    RELEASE_REF: repo.executionSha,
    REVIEWED_SHA: repo.reviewedSha,
    CONFIRM_T21RC2T_READ_ONLY_DIAGNOSTIC: 'true',
    GH_TOKEN: 'offline-test-token',
    RUNNER_TEMP: runnerTemp,
    GITHUB_OUTPUT: path.join(runnerTemp, 'github-output'),
  };
}

beforeAll(() => {
  temporaryRoot = mkdtempSync(path.join(tmpdir(), 't21rc2t-approval-'));
  closureRepo = createGitFixture();
  gateRepo = createGitFixture();
  legacyRepo = createGitFixture({ includeC2T: false });
});

afterAll(() => {
  rmSync(temporaryRoot, { recursive: true, force: true });
});

describe('T21R-C2T independent reviewed-byte closure', () => {
  it('accepts a distinct reviewed ancestor when every bound byte is unchanged', () => {
    expect(T21RC2T_REVIEW_BOUND_PATHS).toEqual(expect.arrayContaining(T21RC2_REVIEW_BOUND_PATHS));
    expect(() => assertReviewedExecutionClosure(
      closureRepo.reviewedSha, closureRepo.executionSha, { cwd: closureRepo.cwd },
    )).not.toThrow();
  });

  it('rejects changes to C2T-bound bytes and introduction of absent config or generator paths', () => {
    const changedRepo = createGitFixture();
    const changedFile = path.join(changedRepo.cwd, 'scripts/t21rc2t-production-files.mjs');
    writeFileSync(changedFile, 'changed bound bytes\n');
    git(changedRepo.cwd, ['add', '--all']);
    git(changedRepo.cwd, ['commit', '--quiet', '-m', 'change C2T binding']);
    const changedSha = git(changedRepo.cwd, ['rev-parse', 'HEAD']);
    expect(() => assertReviewedExecutionClosure(changedRepo.reviewedSha, changedSha, { cwd: changedRepo.cwd }))
      .toThrow('T21RC2T_REVIEW_BINDING_REJECTED');

    const optionalRepo = createGitFixture();
    expect(T21RC2T_OPTIONAL_REVIEW_BOUND_PATHS).toContain('.npmrc');
    writeFileSync(path.join(optionalRepo.cwd, '.npmrc'), 'registry=https://registry.example.invalid\n');
    git(optionalRepo.cwd, ['add', '--all']);
    git(optionalRepo.cwd, ['commit', '--quiet', '-m', 'introduce absent optional config']);
    const optionalSha = git(optionalRepo.cwd, ['rev-parse', 'HEAD']);
    expect(() => assertReviewedExecutionClosure(optionalRepo.reviewedSha, optionalSha, { cwd: optionalRepo.cwd }))
      .toThrow('T21RC2T_REVIEW_BINDING_REJECTED');

    const generatorRepo = createGitFixture();
    expect(T21RC2T_OPTIONAL_REVIEW_BOUND_PATHS).toContain('scripts/lib');
    const generatorPath = path.join(generatorRepo.cwd, 'scripts/lib/enrichment-generator.mjs');
    mkdirSync(path.dirname(generatorPath), { recursive: true });
    writeFileSync(generatorPath, 'export const introducedAfterReview = true;\n');
    git(generatorRepo.cwd, ['add', '--all']);
    git(generatorRepo.cwd, ['commit', '--quiet', '-m', 'introduce generator dependency']);
    const generatorSha = git(generatorRepo.cwd, ['rev-parse', 'HEAD']);
    expect(() => assertReviewedExecutionClosure(generatorRepo.reviewedSha, generatorSha, { cwd: generatorRepo.cwd }))
      .toThrow('T21RC2T_REVIEW_BINDING_REJECTED');

    const c2DependencyRepo = createGitFixture();
    const sharedPath = path.join(c2DependencyRepo.cwd, 'scripts/release-check.mjs');
    writeFileSync(sharedPath, 'modified shared C2 dependency\n');
    git(c2DependencyRepo.cwd, ['add', '--all']);
    git(c2DependencyRepo.cwd, ['commit', '--quiet', '-m', 'change shared C2 dependency']);
    const sharedSha = git(c2DependencyRepo.cwd, ['rev-parse', 'HEAD']);
    expect(() => assertReviewedExecutionClosure(c2DependencyRepo.reviewedSha, sharedSha, { cwd: c2DependencyRepo.cwd }))
      .toThrow('T21RC2T_REVIEW_BINDING_REJECTED');

    const untrackedRepo = createGitFixture();
    writeFileSync(path.join(untrackedRepo.cwd, '.env.production'), 'UNTRACKED_OVERRIDE=true\n');
    expect(() => assertReviewedExecutionClosure(
      untrackedRepo.reviewedSha, untrackedRepo.executionSha, { cwd: untrackedRepo.cwd },
    )).toThrow('T21RC2T_REVIEW_BINDING_REJECTED');
  });

  it('rejects a prior C2 review SHA that predates every C2T-bound byte', () => {
    expect(() => assertReviewedExecutionClosure(
      legacyRepo.reviewedSha, legacyRepo.executionSha, { cwd: legacyRepo.cwd },
    )).toThrow('T21RC2T_REVIEW_BINDING_REJECTED');
  });

  it('rejects identical SHAs, non-ancestors and malformed object IDs', () => {
    expect(() => assertReviewedExecutionClosure(
      closureRepo.reviewedSha, closureRepo.reviewedSha, { cwd: closureRepo.cwd },
    )).toThrow('T21RC2T_REVIEW_BINDING_REJECTED');
    expect(() => assertReviewedExecutionClosure(
      'a'.repeat(40), closureRepo.executionSha, { cwd: closureRepo.cwd },
    )).toThrow('T21RC2T_REVIEW_BINDING_REJECTED');
    expect(() => assertReviewedExecutionClosure('not-a-sha', closureRepo.executionSha, { cwd: closureRepo.cwd }))
      .toThrow('T21RC2T_REVIEW_BINDING_REJECTED');
  });
});

describe('T21R-C2T exact-main and exact-main push CI gate', () => {
  it('accepts only current main with the independent reviewer ancestor and exact successful push CI', () => {
    const result = validateT21RC2TGate(validGateInput());
    expect(result).toMatchObject({
      repositoryId: REPOSITORY_ID,
      repository: REPOSITORY,
      mainSha: gateRepo.executionSha,
      reviewedSha: gateRepo.reviewedSha,
      actor: T21RC2T_EXPECTED_ACTOR,
      triggeringActor: T21RC2T_EXPECTED_ACTOR,
      ci: { headSha: gateRepo.executionSha, id: 540, attempt: 1 },
    });
    expect(result).not.toHaveProperty('approval');
  });

  it.each([
    ['wrong repository id', () => ({ repositoryId: '1385308554' })],
    ['wrong repository name', () => ({ repository: 'other/repository' })],
    ['wrong dispatch actor', () => ({ actor: 'other-user' })],
    ['wrong triggering actor', () => ({ triggeringActor: 'other-user' })],
    ['wrong confirmation', () => ({ confirmation: false })],
    ['wrong workflow event', (repo) => ({ run: gateRun(repo.executionSha, { event: 'push' }) })],
    ['wrong workflow path', (repo) => ({ run: gateRun(repo.executionSha, { path: '.github/workflows/old-c2.yml' }) })],
    ['wrong run repository', (repo) => ({ run: gateRun(repo.executionSha, { repository: { id: 7, full_name: 'other/repository' } }) })],
    ['run SHA differs from current main', (repo) => ({ run: gateRun(repo.reviewedSha) })],
    ['no exact successful CI', () => ({ ciRuns: [] })],
    ['failed latest exact CI', (repo) => ({ ciRuns: [ciRun(repo.executionSha, { conclusion: 'failure' })] })],
    ['wrong CI event', (repo) => ({ ciRuns: [ciRun(repo.executionSha, { event: 'workflow_dispatch' })] })],
    ['wrong CI workflow', (repo) => ({ ciRuns: [ciRun(repo.executionSha, { path: '.github/workflows/deploy.yml' })] })],
    ['wrong CI repository identity', (repo) => ({ ciRuns: [ciRun(repo.executionSha, { repository: { id: 17, full_name: REPOSITORY } })] })],
    ['main input differs from current main', (repo) => ({ ref: repo.reviewedSha })],
  ])('fails closed for %s', (_name, overrides) => {
    expect(() => validateT21RC2TGate(validGateInput(gateRepo, overrides(gateRepo))))
      .toThrow('T21RC2T_GATE_REJECTED');
  });

  it('treats a reviewed SHA equal to execution SHA as a review-binding failure', () => {
    expect(() => validateT21RC2TGate(validGateInput(gateRepo, { reviewedSha: gateRepo.executionSha })))
      .toThrow('T21RC2T_REVIEW_BINDING_REJECTED');
  });
});

describe('T21R-C2T normal production Environment approval', () => {
  it('accepts only the configured independent User reviewer and returns digests', () => {
    const approval = validateT21RC2TProductionApproval({
      history: approvalHistory(),
      environment: approvalEnvironment(),
      actor: T21RC2T_EXPECTED_ACTOR,
      triggeringActor: T21RC2T_EXPECTED_ACTOR,
    });
    expect(approval).toMatchObject({
      environment: 'production',
      state: 'approved',
      reviewer: T21RC2T_EXPECTED_REVIEWER,
      actor: T21RC2T_EXPECTED_ACTOR,
      triggeringActor: T21RC2T_EXPECTED_ACTOR,
    });
    expect(approval.historySha256).toMatch(/^[a-f0-9]{64}$/);
    expect(approval.policySha256).toMatch(/^[a-f0-9]{64}$/);
    expect(approval).not.toHaveProperty('id');
  });

  it('accepts configured bypass/self-review availability only when the independent reviewer actually approves', () => {
    const baseline = validateT21RC2TProductionApproval({
      history: approvalHistory(),
      environment: approvalEnvironment(),
      actor: T21RC2T_EXPECTED_ACTOR,
      triggeringActor: T21RC2T_EXPECTED_ACTOR,
    });
    const adminsCanBypass = validateT21RC2TProductionApproval({
      history: approvalHistory(),
      environment: approvalEnvironment({ can_admins_bypass: true }),
      actor: T21RC2T_EXPECTED_ACTOR,
      triggeringActor: T21RC2T_EXPECTED_ACTOR,
    });
    const selfReviewCanBeConfigured = validateT21RC2TProductionApproval({
      history: approvalHistory(),
      environment: approvalEnvironment({
        protection_rules: [{ ...approvalEnvironment().protection_rules[0], prevent_self_review: false }],
      }),
      actor: T21RC2T_EXPECTED_ACTOR,
      triggeringActor: T21RC2T_EXPECTED_ACTOR,
    });
    expect(adminsCanBypass.state).toBe('approved');
    expect(selfReviewCanBeConfigured.state).toBe('approved');
    expect(adminsCanBypass.policySha256).not.toBe(baseline.policySha256);
    expect(selfReviewCanBeConfigured.policySha256).not.toBe(baseline.policySha256);
  });

  it.each([
    ['skipped history', { history: approvalHistory({ state: 'skipped' }) }],
    ['rejected history', { history: approvalHistory({ state: 'rejected' }) }],
    ['wrong reviewer', { history: approvalHistory({ user: { id: 913, type: 'User', login: 'other-user' } }) }],
    ['wrong reviewer id', { history: approvalHistory({ user: { id: 914, type: 'User', login: T21RC2T_EXPECTED_REVIEWER } }) }],
    ['wrong environment id', { history: approvalHistory({ environments: [{ id: 900, name: 'production' }] }) }],
    ['wrong environment name', { history: approvalHistory({ environments: [{ id: 811, name: 'staging' }] }) }],
    ['bypass marker', { history: approvalHistory({ admin_bypass: true }) }],
    ['explicit bypass history', { history: approvalHistory({ bypass_reason: 'administrator' }) }],
    ['missing bypass policy evidence', { environment: approvalEnvironment({ can_admins_bypass: undefined }) }],
    ['missing self-review policy evidence', { environment: approvalEnvironment({
      protection_rules: [{ ...approvalEnvironment().protection_rules[0], prevent_self_review: undefined }],
    }) }],
    ['reviewer is not a User', { environment: approvalEnvironment({
      protection_rules: [{ ...approvalEnvironment().protection_rules[0], reviewers: [{
        type: 'Team', reviewer: { id: 913, login: T21RC2T_EXPECTED_REVIEWER },
      }] }],
    }) }],
    ['multiple approval records', { history: [...approvalHistory(), ...approvalHistory()] }],
    ['self approval by workflow actor', { actor: T21RC2T_EXPECTED_REVIEWER }],
    ['self approval by triggering actor', { triggeringActor: T21RC2T_EXPECTED_REVIEWER }],
  ])('rejects %s without exposing source context', (_name, overrides) => {
    expect(() => validateT21RC2TProductionApproval({
      history: overrides.history ?? approvalHistory(),
      environment: overrides.environment ?? approvalEnvironment(),
      actor: overrides.actor ?? T21RC2T_EXPECTED_ACTOR,
      triggeringActor: overrides.triggeringActor ?? T21RC2T_EXPECTED_ACTOR,
    })).toThrow('T21RC2T_APPROVAL_REJECTED');
  });
});

describe('T21R-C2T fresh reauthorization and output privacy', () => {
  it('writes only the safe exact SHA to GITHUB_OUTPUT and stores no GitHub token', async () => {
    const runnerTemp = mkdtempSync(path.join(temporaryRoot, 'runner-'));
    const env = actionEnv(gateRepo, runnerTemp);
    const { fetchImpl, requests } = apiFixture(gateRepo);
    try {
      const result = await runT21RC2TApprovalCommand('gate', {
        env, cwd: gateRepo.cwd, fetchImpl,
      });
      expect(result).toEqual({ candidateSha: gateRepo.executionSha });
      expect(readFileSync(env.GITHUB_OUTPUT, 'utf8')).toBe(`candidate_sha=${gateRepo.executionSha}\n`);
      expect(requests.every(({ options }) => options.method === 'GET')).toBe(true);
      expect(requests.some(({ url }) => url.pathname.includes('/actions/workflows/ci.yml/runs'))).toBe(true);
    } finally {
      cleanupT21RC2TFiles(env, gateRepo.cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('rechecks current main, CI and the same approval after Environment approval', async () => {
    const runnerTemp = mkdtempSync(path.join(temporaryRoot, 'runner-'));
    const env = actionEnv(gateRepo, runnerTemp);
    const { fetchImpl, requests } = apiFixture(gateRepo);
    try {
      const initial = await runT21RC2TApprovalCommand('approve', {
        env, cwd: gateRepo.cwd, fetchImpl,
      });
      expect(requireStoredT21RC2TAuthorization(initial, env)).toBe(initial);
      expect(readT21RC2TPrivateJson('authorization.json', env, gateRepo.cwd)).toEqual(initial);
      expect(JSON.stringify(initial)).not.toContain(env.GH_TOKEN);

      const final = await runT21RC2TApprovalCommand('recheck', {
        env, cwd: gateRepo.cwd, fetchImpl,
      });
      expect(final).toEqual(initial);
      expect(readT21RC2TPrivateJson('authorization-final.json', env, gateRepo.cwd)).toEqual(initial);
      expect(requests.filter(({ url }) => url.pathname.endsWith('/commits/main'))).toHaveLength(2);
      expect(requests.filter(({ url }) => url.pathname.endsWith('/environments/production'))).toHaveLength(2);
    } finally {
      cleanupT21RC2TFiles(env, gateRepo.cwd);
      rmSync(runnerTemp, { recursive: true, force: true });
    }
  });

  it('rejects changed approval, moved main and changed exact-main CI on recheck', async () => {
    for (const failure of ['approval', 'main', 'ci', 'policy']) {
      const runnerTemp = mkdtempSync(path.join(temporaryRoot, 'runner-'));
      const env = actionEnv(gateRepo, runnerTemp);
      let api = apiFixture(gateRepo);
      await runT21RC2TApprovalCommand('approve', { env, cwd: gateRepo.cwd, fetchImpl: api.fetchImpl });

      if (failure === 'approval') {
        api = apiFixture(gateRepo, {
          approval: () => approvalHistory({ state: 'skipped' }),
        });
      } else if (failure === 'main') {
        api = apiFixture(gateRepo);
        const originalFetch = api.fetchImpl;
        api.fetchImpl = async (url, options) => {
          const parsed = new URL(url);
          if (parsed.pathname.endsWith('/commits/main')) {
            return githubResponse({ sha: gateRepo.reviewedSha });
          }
          return originalFetch(url, options);
        };
      } else {
        api = apiFixture(gateRepo, failure === 'ci'
          ? { ci: [ciRun(gateRepo.executionSha, { conclusion: 'failure' })] }
          : { environment: approvalEnvironment({ can_admins_bypass: true }) });
      }
      try {
        await expect(runT21RC2TApprovalCommand('recheck', {
          env, cwd: gateRepo.cwd, fetchImpl: api.fetchImpl,
        })).rejects.toThrow('T21RC2T_RECHECK_REJECTED');
        expect(() => readT21RC2TPrivateJson('authorization-final.json', env, gateRepo.cwd))
          .toThrow('T21RC2T_PRIVATE_PATH_REJECTED');
      } finally {
        cleanupT21RC2TFiles(env, gateRepo.cwd);
        rmSync(runnerTemp, { recursive: true, force: true });
      }
    }
  });

  it('keeps malicious errors and accessor failures inside the fixed allowlist', () => {
    const privateMarker = 'PRIVATE_UPSTREAM_ERROR_MARKER';
    const error = {};
    Object.defineProperty(error, 'code', { get: () => { throw new Error(privateMarker); } });
    expect(safeT21RC2TError(error)).toBe('T21RC2T_CAPTURE_REJECTED');
    expect(safeT21RC2TError(new Error(privateMarker))).toBe('T21RC2T_CAPTURE_REJECTED');
    expect(t21rc2tError(privateMarker).message).toBe('T21RC2T_CAPTURE_REJECTED');
  });

  it('maps hostile fetch failures to a fixed gate code', async () => {
    const env = actionEnv(gateRepo, temporaryRoot);
    await expect(authorizeT21RC2TProductionRun({
      env,
      cwd: gateRepo.cwd,
      fetchImpl: async () => { throw new Error('PRIVATE_FETCH_FAILURE_MARKER'); },
    })).rejects.toThrow('T21RC2T_GATE_REJECTED');
  });
});
