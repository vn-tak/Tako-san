import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { T21RC2_REVIEW_BOUND_PATHS } from './t21rc2-production-approval.mjs';
import {
  readT21RC2TPrivateJson,
  safeT21RC2TError,
  t21rc2tError,
  writeT21RC2TPrivateJson,
} from './t21rc2t-production-files.mjs';

export const T21RC2T_REPOSITORY_ID = 1385308553;
export const T21RC2T_REPOSITORY = 'vn-tak/Tako-san';
export const T21RC2T_EXPECTED_ACTOR = 'vn-tak';
export const T21RC2T_EXPECTED_REVIEWER = 'vn-taphoanhatung';
export const T21RC2T_WORKFLOW_PATH = '.github/workflows/production-d1-t21rc2t-identity-topology.yml';

export const T21RC2T_REQUIRED_REVIEW_FILES = Object.freeze([
  T21RC2T_WORKFLOW_PATH,
  'scripts/t21rc2t-production-approval.mjs',
  'scripts/t21rc2t-production-files.mjs',
  'scripts/t21rc2t-production-capture.mjs',
  'scripts/t21rc2t-source-authority.mjs',
  'scripts/t21rc2t-identity-topology.mjs',
  'scripts/t21rc2t-production-receipt.mjs',
  'tests/unit/t21rc2t-production-approval.test.mjs',
  'tests/unit/t21rc2t-production-capture.test.mjs',
  'tests/unit/t21rc2t-workflow-safety.test.mjs',
  'tests/unit/t21rc2t-production-receipt.test.mjs',
  'tests/unit/t21rc2t-identity-topology.test.mjs',
  'tests/unit/t21rc2t-privacy.test.mjs',
  'tests/helpers/t21rc2t-fixtures.mjs',
  'docs/ai/recipe-catalog/T21RC2T_IDENTITY_TOPOLOGY_DIAGNOSTIC.md',
  'docs/ai/recipe-catalog/T21RC2T_IDENTITY_TOPOLOGY_RECEIPT_SCHEMA.json',
  '.github/workflows/ci.yml',
  '.github/workflows/production-d1-t21rc-row-reconciliation.yml',
  'scripts/t21rc2-production-approval.mjs',
  'scripts/t21rc2-production-capture.mjs',
  'scripts/t21rc2-production-files.mjs',
  'scripts/t21rc2-production-receipt.mjs',
  'scripts/t21rc-row-reconciliation.mjs',
  'scripts/t21rb-v1-semantic.mjs',
  'scripts/t21r-v1-authority.mjs',
  'scripts/release-check.mjs',
  'scripts/d1-migration-check.mjs',
  'scripts/recipe-refresh-v2.mjs',
  'scripts/runtime-ingredient-v2-audit.mjs',
  'docs/ai/recipe-catalog/T21RC_ROW_RECONCILIATION_SCHEMA.json',
  'docs/ai/recipe-catalog/T21RA_RUNTIME_CANONICAL_TARGET.json',
  'wrangler.jsonc',
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.ts',
  'tsconfig.json',
  'data/recipe-import/approved-batches.json',
  'data/recipe-import/t14f/pilot-30.jsonl',
  'data/recipe-import/t14f/scale-399.jsonl',
  'data/recipe-refresh/v2/ingredient-reconciliation.json',
  'packages/recipes/src/data.ts',
  'packages/recipes/src/catalog-fingerprint.ts',
  'packages/recipes/src/runtime-recipe.ts',
  'packages/recipes/src/import/catalog-release.current.json',
  'packages/recipes/src/import/index.ts',
  'packages/recipes/src/import/ingredients.ts',
  'packages/recipes/src/refresh/index.ts',
  'packages/domain/src/index.ts',
  'packages/domain/src/foundation.ts',
]);

export const T21RC2T_REVIEW_BOUND_DIRECTORIES = Object.freeze([
  'migrations',
  'data/recipe-import',
  'data/recipe-refresh/v2',
  'artifacts/recipe-refresh-v2',
  'packages/recipes/src',
  'packages/domain/src',
]);

export const T21RC2T_OPTIONAL_REVIEW_BOUND_PATHS = Object.freeze([
  '.npmrc',
  '.pnpmfile.cjs',
  'pnpm-workspace.yaml',
  '.gitattributes',
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.cjs',
  'vite.config.mts',
  'vite.config.cts',
  'postcss.config.js',
  'postcss.config.mjs',
  'postcss.config.cjs',
  'postcss.config.ts',
  'tailwind.config.js',
  'tailwind.config.ts',
  '.postcssrc',
  '.postcssrc.json',
  '.postcssrc.yaml',
  '.postcssrc.yml',
  '.postcssrc.js',
  '.postcssrc.cjs',
  'vitest.config.js',
  'vitest.config.ts',
  'tsconfig.build.json',
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
  '.env.test',
  '.env.test.local',
  '.dev.vars',
  '.dev.vars.local',
  'scripts/lib',
]);

const C2_OPTIONAL_REVIEW_BOUND_PATHS = new Set([
  '.npmrc', '.pnpmfile.cjs', 'pnpm-workspace.yaml', '.gitattributes',
  'vite.config.js', 'vite.config.mjs', 'vite.config.cjs', 'vite.config.mts', 'vite.config.cts',
  '.env', '.env.local', '.env.development', '.env.development.local',
]);
const C2_REQUIRED_REVIEW_BOUND_FILES = T21RC2_REVIEW_BOUND_PATHS.filter((file) =>
  file !== 'migrations' && !C2_OPTIONAL_REVIEW_BOUND_PATHS.has(file));

export const T21RC2T_REVIEW_BOUND_REQUIRED_FILES = Object.freeze([...new Set([
  ...T21RC2T_REQUIRED_REVIEW_FILES,
  ...C2_REQUIRED_REVIEW_BOUND_FILES,
])]);

export const T21RC2T_REVIEW_BOUND_PATHS = Object.freeze([
  ...new Set([
    ...T21RC2_REVIEW_BOUND_PATHS,
    ...T21RC2T_REVIEW_BOUND_REQUIRED_FILES,
    ...T21RC2T_REVIEW_BOUND_DIRECTORIES,
    ...T21RC2T_OPTIONAL_REVIEW_BOUND_PATHS,
  ]),
]);

const API_VERSION = '2026-03-10';
const API_BASE = `https://api.github.com/repos/${T21RC2T_REPOSITORY}`;
const FULL_SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const GITHUB_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const MAX_CI_RUNS = 1000;
const PAGE_SIZE = 100;
const AUTHORIZATION_FIELDS = Object.freeze([
  'schemaVersion', 'repositoryId', 'repository', 'workflowPath', 'mainSha', 'reviewedSha',
  'runId', 'runAttempt', 'actor', 'triggeringActor', 'ci', 'approval',
]);
const CI_FIELDS = Object.freeze(['id', 'attempt', 'headSha']);
const APPROVAL_FIELDS = Object.freeze([
  'environment', 'state', 'reviewer', 'actor', 'triggeringActor', 'historySha256', 'policySha256',
]);

const canonicalJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
};
const sha256 = (value) => createHash('sha256').update(canonicalJson(value)).digest('hex');
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => isRecord(value)
  && Object.keys(value).sort().join('\0') === [...keys].sort().join('\0');
const reject = (code = 'T21RC2T_GATE_REJECTED') => { throw t21rc2tError(code); };
const fail = (condition, code = 'T21RC2T_GATE_REJECTED') => { if (!condition) reject(code); };

function normalizeLogin(value, code = 'T21RC2T_GATE_REJECTED') {
  fail(typeof value === 'string' && GITHUB_LOGIN.test(value), code);
  return value.toLowerCase();
}

function normalizeId(value, code = 'T21RC2T_GATE_REJECTED') {
  if (Number.isSafeInteger(value) && value > 0) return String(value);
  fail(typeof value === 'string' && /^[1-9][0-9]*$/.test(value), code);
  return value;
}

function safeInteger(value, code = 'T21RC2T_GATE_REJECTED') {
  const number = Number(normalizeId(value, code));
  fail(Number.isSafeInteger(number) && number > 0, code);
  return number;
}

function gitOutput(execute, cwd, args, code = 'T21RC2T_GATE_REJECTED') {
  try {
    const value = execute('git', args, {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15_000,
    });
    const output = Buffer.isBuffer(value) ? value.toString('utf8') : value;
    const text = typeof output === 'string' ? output.trim() : '';
    fail(FULL_SHA.test(text), code);
    return text;
  } catch {
    reject(code);
  }
}

function parseTreeEntries(text) {
  fail(typeof text === 'string');
  return text.split('\0').filter(Boolean).map((entry) => {
    const tab = entry.indexOf('\t');
    fail(tab > 0 && !/[\r\n\0]/.test(entry.slice(tab + 1)), 'T21RC2T_REVIEW_BINDING_REJECTED');
    const metadata = entry.slice(0, tab);
    const file = entry.slice(tab + 1);
    fail(/^100(?:644|755) blob [a-f0-9]{40}$/.test(metadata), 'T21RC2T_REVIEW_BINDING_REJECTED');
    return file;
  });
}

export function assertReviewedExecutionClosure(reviewedSha, executionSha, { cwd = process.cwd(), execute = execFileSync } = {}) {
  const code = 'T21RC2T_REVIEW_BINDING_REJECTED';
  try {
    fail(FULL_SHA.test(reviewedSha ?? '') && FULL_SHA.test(executionSha ?? '') && reviewedSha !== executionSha, code);
    const options = { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15_000 };
    for (const sha of [reviewedSha, executionSha]) {
      const resolved = execute('git', ['rev-parse', '--verify', '--end-of-options', `${sha}^{commit}`], options).trim();
      fail(resolved === sha, code);
    }
    execute('git', ['merge-base', '--is-ancestor', reviewedSha, executionSha], options);

    const tree = execute('git', [
      'ls-tree', '-r', '-z', '--full-tree', reviewedSha, '--', ...T21RC2T_REVIEW_BOUND_PATHS,
    ], options);
    const reviewedFiles = new Set(parseTreeEntries(Buffer.isBuffer(tree) ? tree.toString('utf8') : tree));
    fail(T21RC2T_REVIEW_BOUND_REQUIRED_FILES.every((file) => reviewedFiles.has(file)), code);
    fail(T21RC2T_REVIEW_BOUND_DIRECTORIES.every((directory) =>
      [...reviewedFiles].some((file) => file.startsWith(`${directory}/`))), code);

    execute('git', [
      'diff', '--quiet', '--no-ext-diff', '--no-textconv', reviewedSha, executionSha,
      '--', ...T21RC2T_REVIEW_BOUND_PATHS,
    ], options);
    execute('git', [
      'diff', '--quiet', '--no-ext-diff', '--no-textconv', executionSha,
      '--', ...T21RC2T_REVIEW_BOUND_PATHS,
    ], options);
    const worktreeChanges = execute('git', [
      'status', '--porcelain=v1', '--untracked-files=all', '--ignored=matching',
      '--', ...T21RC2T_REVIEW_BOUND_PATHS,
    ], options);
    fail(typeof worktreeChanges === 'string' && worktreeChanges.trim() === '', code);
  } catch {
    reject(code);
  }
}

export function validateT21RC2TReleaseSource({ ref, reviewedSha, cwd = process.cwd(), execute = execFileSync } = {}) {
  try {
    fail(FULL_SHA.test(ref ?? '') && FULL_SHA.test(reviewedSha ?? '') && reviewedSha !== ref,
      'T21RC2T_REVIEW_BINDING_REJECTED');
    const releaseSha = gitOutput(execute, cwd,
      ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`], 'T21RC2T_REVIEW_BINDING_REJECTED');
    const mainSha = gitOutput(execute, cwd,
      ['rev-parse', '--verify', '--end-of-options', 'refs/remotes/origin/main^{commit}'],
      'T21RC2T_GATE_REJECTED');
    fail(releaseSha === ref && mainSha === ref, 'T21RC2T_GATE_REJECTED');
    return { sha: releaseSha, mainSha, reviewedSha };
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_REVIEW_BINDING_REJECTED') {
      reject('T21RC2T_REVIEW_BINDING_REJECTED');
    }
    reject('T21RC2T_GATE_REJECTED');
  }
}

function validateRunMetadata({ run, ref, runId, runAttempt, actor, triggeringActor }) {
  fail(isRecord(run));
  fail(normalizeId(run.id) === runId);
  fail(runAttempt === '1' && String(run.run_attempt) === '1');
  fail(FULL_SHA.test(run.head_sha ?? '') && run.head_sha === ref);
  fail(run.head_branch === 'main' && run.event === 'workflow_dispatch');
  fail(run.path === T21RC2T_WORKFLOW_PATH);
  fail(isRecord(run.repository) && run.repository.full_name === T21RC2T_REPOSITORY
    && normalizeId(run.repository.id) === String(T21RC2T_REPOSITORY_ID));
  fail(isRecord(run.head_repository) && run.head_repository.full_name === T21RC2T_REPOSITORY
    && normalizeId(run.head_repository.id) === String(T21RC2T_REPOSITORY_ID));
  fail(normalizeLogin(run.actor?.login) === actor);
  fail(normalizeLogin(run.triggering_actor?.login) === triggeringActor);
}

function validateActionEnvironment(env, { requireToken = false } = {}) {
  fail(isRecord(env));
  fail(env.GITHUB_EVENT_NAME === 'workflow_dispatch');
  fail(env.GITHUB_REF === 'refs/heads/main');
  fail(FULL_SHA.test(env.GITHUB_SHA ?? '') && env.GITHUB_SHA === env.RELEASE_REF);
  fail(env.GITHUB_RUN_ATTEMPT === '1');
  fail(env.CONFIRM_T21RC2T_READ_ONLY_DIAGNOSTIC === 'true');
  if (requireToken) {
    fail(typeof env.GH_TOKEN === 'string' && env.GH_TOKEN.length > 0 && env.GH_TOKEN.trim() === env.GH_TOKEN);
  }
  return {
    repositoryId: env.GITHUB_REPOSITORY_ID,
    repository: env.GITHUB_REPOSITORY,
    ref: env.RELEASE_REF,
    reviewedSha: env.REVIEWED_SHA,
    confirmation: env.CONFIRM_T21RC2T_READ_ONLY_DIAGNOSTIC,
    actor: env.GITHUB_ACTOR,
    triggeringActor: env.GITHUB_TRIGGERING_ACTOR,
    runId: env.GITHUB_RUN_ID,
    runAttempt: env.GITHUB_RUN_ATTEMPT,
  };
}

function validateCiRuns(runs, { sha }) {
  fail(Array.isArray(runs));
  const matching = runs.filter((run) => isRecord(run)
    && run.head_sha === sha
    && run.head_branch === 'main'
    && run.event === 'push'
    && run.path === '.github/workflows/ci.yml'
    && run.repository?.full_name === T21RC2T_REPOSITORY
    && normalizeId(run.repository?.id) === String(T21RC2T_REPOSITORY_ID)
    && run.head_repository?.full_name === T21RC2T_REPOSITORY
    && normalizeId(run.head_repository?.id) === String(T21RC2T_REPOSITORY_ID));
  const activityTime = (run) => Date.parse(run.updated_at || run.run_started_at || run.created_at) || 0;
  const latest = matching.sort((left, right) =>
    activityTime(right) - activityTime(left)
      || safeInteger(right.id) - safeInteger(left.id)
      || safeInteger(right.run_attempt) - safeInteger(left.run_attempt))[0];
  fail(latest && latest.status === 'completed' && latest.conclusion === 'success');
  return {
    id: safeInteger(latest.id),
    attempt: safeInteger(latest.run_attempt),
    headSha: latest.head_sha,
  };
}

export function validateT21RC2TGate({
  ref,
  reviewedSha,
  confirmation,
  repositoryId,
  repository,
  actor,
  triggeringActor,
  runId,
  runAttempt,
  run,
  mainSha,
  ciRuns,
  cwd = process.cwd(),
  execute = execFileSync,
  sourceValidator = validateT21RC2TReleaseSource,
} = {}) {
  try {
    fail(FULL_SHA.test(ref ?? '') && FULL_SHA.test(reviewedSha ?? '') && FULL_SHA.test(mainSha ?? ''));
    fail(ref === mainSha);
    fail(reviewedSha !== ref, 'T21RC2T_REVIEW_BINDING_REJECTED');
    fail(confirmation === true || confirmation === 'true');
    fail(normalizeId(repositoryId) === String(T21RC2T_REPOSITORY_ID));
    fail(repository === T21RC2T_REPOSITORY);
    const normalizedActor = normalizeLogin(actor);
    const normalizedTriggeringActor = normalizeLogin(triggeringActor);
    fail(normalizedActor === T21RC2T_EXPECTED_ACTOR && normalizedTriggeringActor === T21RC2T_EXPECTED_ACTOR);
    const normalizedRunId = normalizeId(runId);
    fail(runAttempt === '1');
    validateRunMetadata({
      run, ref, runId: normalizedRunId, runAttempt,
      actor: normalizedActor, triggeringActor: normalizedTriggeringActor,
    });
    fail(typeof sourceValidator === 'function');
    const source = sourceValidator({ ref, reviewedSha, cwd, execute });
    fail(source?.sha === ref && source?.mainSha === mainSha && source?.reviewedSha === reviewedSha);
    assertReviewedExecutionClosure(reviewedSha, ref, { cwd, execute });
    const ci = validateCiRuns(ciRuns, { sha: ref });
    fail(ci.headSha === mainSha);
    return {
      schemaVersion: 1,
      repositoryId: T21RC2T_REPOSITORY_ID,
      repository: T21RC2T_REPOSITORY,
      workflowPath: T21RC2T_WORKFLOW_PATH,
      mainSha,
      reviewedSha,
      runId: normalizedRunId,
      runAttempt: '1',
      actor: normalizedActor,
      triggeringActor: normalizedTriggeringActor,
      ci,
    };
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_REVIEW_BINDING_REJECTED') {
      reject('T21RC2T_REVIEW_BINDING_REJECTED');
    }
    reject('T21RC2T_GATE_REJECTED');
  }
}

function bypassFlagSet(record) {
  return Object.entries(record).some(([key, value]) => {
    if (!/bypass/i.test(key)) return false;
    return value !== false && value !== null && value !== undefined && value !== 0 && value !== '';
  });
}

function normalizeEnvironmentPolicy(environment) {
  fail(isRecord(environment), 'T21RC2T_APPROVAL_REJECTED');
  fail(environment.name === 'production', 'T21RC2T_APPROVAL_REJECTED');
  const environmentId = normalizeId(environment.id, 'T21RC2T_APPROVAL_REJECTED');
  fail(typeof environment.can_admins_bypass === 'boolean', 'T21RC2T_APPROVAL_REJECTED');
  fail(Array.isArray(environment.protection_rules), 'T21RC2T_APPROVAL_REJECTED');

  const protectionRules = environment.protection_rules.map((rule) => {
    fail(isRecord(rule) && typeof rule.type === 'string', 'T21RC2T_APPROVAL_REJECTED');
    fail(!bypassFlagSet(rule), 'T21RC2T_APPROVAL_REJECTED');
    const id = normalizeId(rule.id, 'T21RC2T_APPROVAL_REJECTED');
    if (rule.type === 'required_reviewers') {
      fail(typeof rule.prevent_self_review === 'boolean', 'T21RC2T_APPROVAL_REJECTED');
      fail(Array.isArray(rule.reviewers) && rule.reviewers.length === 1, 'T21RC2T_APPROVAL_REJECTED');
      const entry = rule.reviewers[0];
      fail(isRecord(entry) && entry.type === 'User' && isRecord(entry.reviewer), 'T21RC2T_APPROVAL_REJECTED');
      const login = normalizeLogin(entry.reviewer.login, 'T21RC2T_APPROVAL_REJECTED');
      fail(login === T21RC2T_EXPECTED_REVIEWER, 'T21RC2T_APPROVAL_REJECTED');
      return {
        id, type: rule.type, preventSelfReview: rule.prevent_self_review,
        reviewers: [{ type: 'User', id: normalizeId(entry.reviewer.id, 'T21RC2T_APPROVAL_REJECTED'), login }],
      };
    }
    if (rule.type === 'wait_timer') {
      fail(Number.isSafeInteger(rule.wait_timer) && rule.wait_timer >= 0, 'T21RC2T_APPROVAL_REJECTED');
      return { id, type: rule.type, waitTimer: rule.wait_timer };
    }
    if (rule.type === 'branch_policy') return { id, type: rule.type };
    reject('T21RC2T_APPROVAL_REJECTED');
  });
  fail(protectionRules.filter((rule) => rule.type === 'required_reviewers').length === 1,
    'T21RC2T_APPROVAL_REJECTED');

  const branchPolicy = environment.deployment_branch_policy;
  if (branchPolicy !== null) {
    fail(isRecord(branchPolicy)
      && typeof branchPolicy.protected_branches === 'boolean'
      && typeof branchPolicy.custom_branch_policies === 'boolean', 'T21RC2T_APPROVAL_REJECTED');
  }
  return {
    id: environmentId,
    name: 'production',
    canAdminsBypass: environment.can_admins_bypass,
    protectionRules: protectionRules.sort((left, right) => {
      const a = canonicalJson(left);
      const b = canonicalJson(right);
      return a < b ? -1 : a > b ? 1 : 0;
    }),
    deploymentBranchPolicy: branchPolicy === null ? null : {
      protectedBranches: branchPolicy.protected_branches,
      customBranchPolicies: branchPolicy.custom_branch_policies,
    },
  };
}

function validateApprovalHistory(history, environmentId, reviewerId, actor, triggeringActor) {
  fail(Array.isArray(history) && history.length === 1, 'T21RC2T_APPROVAL_REJECTED');
  const approval = history[0];
  fail(isRecord(approval) && !bypassFlagSet(approval), 'T21RC2T_APPROVAL_REJECTED');
  fail(approval.state === 'approved', 'T21RC2T_APPROVAL_REJECTED');
  fail(isRecord(approval.user) && approval.user.type === 'User', 'T21RC2T_APPROVAL_REJECTED');
  const reviewer = normalizeLogin(approval.user.login, 'T21RC2T_APPROVAL_REJECTED');
  const observedReviewerId = normalizeId(approval.user.id, 'T21RC2T_APPROVAL_REJECTED');
  fail(reviewer === T21RC2T_EXPECTED_REVIEWER && observedReviewerId === reviewerId,
    'T21RC2T_APPROVAL_REJECTED');
  fail(reviewer !== actor && reviewer !== triggeringActor, 'T21RC2T_APPROVAL_REJECTED');
  fail(Array.isArray(approval.environments) && approval.environments.length === 1,
    'T21RC2T_APPROVAL_REJECTED');
  const [approvedEnvironment] = approval.environments;
  fail(isRecord(approvedEnvironment), 'T21RC2T_APPROVAL_REJECTED');
  const approvedEnvironmentId = normalizeId(approvedEnvironment.id, 'T21RC2T_APPROVAL_REJECTED');
  fail(approvedEnvironmentId === environmentId && approvedEnvironment.name === 'production',
    'T21RC2T_APPROVAL_REJECTED');
  return {
    state: 'approved',
    reviewer: { id: observedReviewerId, login: reviewer, type: 'User' },
    environment: { id: approvedEnvironmentId, name: 'production' },
  };
}

export function validateT21RC2TProductionApproval({ history, environment, actor, triggeringActor } = {}) {
  try {
    const normalizedActor = normalizeLogin(actor, 'T21RC2T_APPROVAL_REJECTED');
    const normalizedTriggeringActor = normalizeLogin(triggeringActor, 'T21RC2T_APPROVAL_REJECTED');
    fail(normalizedActor === T21RC2T_EXPECTED_ACTOR
      && normalizedTriggeringActor === T21RC2T_EXPECTED_ACTOR, 'T21RC2T_APPROVAL_REJECTED');
    const policy = normalizeEnvironmentPolicy(environment);
    const reviewerId = policy.protectionRules.find((rule) => rule.type === 'required_reviewers').reviewers[0].id;
    const historyProof = validateApprovalHistory(
      history, policy.id, reviewerId, normalizedActor, normalizedTriggeringActor,
    );
    return {
      environment: 'production',
      state: 'approved',
      reviewer: T21RC2T_EXPECTED_REVIEWER,
      actor: normalizedActor,
      triggeringActor: normalizedTriggeringActor,
      historySha256: sha256(historyProof),
      policySha256: sha256(policy),
    };
  } catch {
    reject('T21RC2T_APPROVAL_REJECTED');
  }
}

function validateStoredApproval(approval, actor, triggeringActor) {
  fail(isRecord(approval), 'T21RC2T_APPROVAL_REJECTED');
  fail(approval.environment === 'production' && approval.state === 'approved'
    && approval.reviewer === T21RC2T_EXPECTED_REVIEWER, 'T21RC2T_APPROVAL_REJECTED');
  fail(normalizeLogin(approval.actor, 'T21RC2T_APPROVAL_REJECTED') === actor
    && normalizeLogin(approval.triggeringActor, 'T21RC2T_APPROVAL_REJECTED') === triggeringActor,
  'T21RC2T_APPROVAL_REJECTED');
  fail(approval.reviewer !== actor && approval.reviewer !== triggeringActor
    && SHA256.test(approval.historySha256 ?? '') && SHA256.test(approval.policySha256 ?? ''),
  'T21RC2T_APPROVAL_REJECTED');
}

export function requireStoredT21RC2TAuthorization(authorization, env = process.env) {
  try {
    fail(exactKeys(authorization, AUTHORIZATION_FIELDS) && authorization.schemaVersion === 1);
    const action = validateActionEnvironment(env);
    const actor = normalizeLogin(action.actor);
    const triggeringActor = normalizeLogin(action.triggeringActor);
    fail(actor === T21RC2T_EXPECTED_ACTOR && triggeringActor === T21RC2T_EXPECTED_ACTOR);
    fail(normalizeId(action.repositoryId) === String(T21RC2T_REPOSITORY_ID)
      && action.repository === T21RC2T_REPOSITORY);
    fail(normalizeId(authorization.repositoryId) === String(T21RC2T_REPOSITORY_ID)
      && authorization.repository === T21RC2T_REPOSITORY);
    fail(authorization.workflowPath === T21RC2T_WORKFLOW_PATH);
    fail(FULL_SHA.test(authorization.mainSha ?? '') && authorization.mainSha === action.ref
      && authorization.mainSha === env.GITHUB_SHA);
    fail(FULL_SHA.test(authorization.reviewedSha ?? '') && authorization.reviewedSha === action.reviewedSha
      && authorization.reviewedSha !== authorization.mainSha, 'T21RC2T_REVIEW_BINDING_REJECTED');
    fail(authorization.runId === normalizeId(action.runId)
      && authorization.runAttempt === '1' && authorization.runAttempt === action.runAttempt);
    fail(normalizeLogin(authorization.actor) === actor
      && normalizeLogin(authorization.triggeringActor) === triggeringActor);
    fail(exactKeys(authorization.ci, CI_FIELDS)
      && safeInteger(authorization.ci.id) > 0
      && safeInteger(authorization.ci.attempt) > 0
      && FULL_SHA.test(authorization.ci.headSha ?? '')
      && authorization.ci.headSha === authorization.mainSha);
    fail(exactKeys(authorization.approval, APPROVAL_FIELDS), 'T21RC2T_APPROVAL_REJECTED');
    validateStoredApproval(authorization.approval, actor, triggeringActor);
    return authorization;
  } catch (error) {
    if (safeT21RC2TError(error) === 'T21RC2T_REVIEW_BINDING_REJECTED') {
      reject('T21RC2T_REVIEW_BINDING_REJECTED');
    }
    reject('T21RC2T_GATE_REJECTED');
  }
}

export function requireImmutableT21RC2TAuthorizationMatch(original, fresh, code = 'T21RC2T_RECHECK_REJECTED') {
  try {
    const fields = [
      'schemaVersion', 'repositoryId', 'repository', 'workflowPath', 'mainSha', 'reviewedSha',
      'runId', 'runAttempt', 'actor', 'triggeringActor',
    ];
    fail(isRecord(original) && isRecord(fresh)
      && fields.every((field) => original[field] === fresh[field]), code);
    fail(canonicalJson(original.ci) === canonicalJson(fresh.ci)
      && canonicalJson(original.approval) === canonicalJson(fresh.approval), code);
  } catch {
    reject(code);
  }
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
  };
}

async function getGitHubJson(fetchImpl, url, token, code = 'T21RC2T_GATE_REJECTED') {
  try {
    const response = await fetchImpl(url, {
      method: 'GET', headers: githubHeaders(token),
      signal: AbortSignal.timeout(15_000), redirect: 'error',
    });
    fail(response && response.status === 200 && response.ok === true && response.redirected !== true, code);
    const length = response.headers?.get?.('content-length');
    if (length !== null && length !== undefined) {
      fail(/^\d+$/.test(length) && Number(length) <= MAX_RESPONSE_BYTES, code);
    }
    fail(typeof response.text === 'function', code);
    const text = await response.text();
    fail(Buffer.byteLength(text, 'utf8') <= MAX_RESPONSE_BYTES, code);
    return { body: JSON.parse(text), response };
  } catch {
    reject(code);
  }
}

async function fetchCurrentMainSha(fetchImpl, token) {
  const { body } = await getGitHubJson(fetchImpl, `${API_BASE}/commits/main`, token);
  fail(isRecord(body) && FULL_SHA.test(body.sha ?? ''));
  return body.sha;
}

function hasNextPage(response) {
  const link = response.headers?.get?.('link');
  return typeof link === 'string' && /;\s*rel\s*=\s*"?next"?/i.test(link);
}

function ciRunsUrl(sha, page) {
  const url = new URL(`${API_BASE}/actions/workflows/ci.yml/runs`);
  url.searchParams.set('event', 'push');
  url.searchParams.set('branch', 'main');
  url.searchParams.set('head_sha', sha);
  url.searchParams.set('per_page', String(PAGE_SIZE));
  url.searchParams.set('page', String(page));
  return url.href;
}

async function fetchCompleteCiRuns(fetchImpl, sha, token) {
  try {
    const runs = [];
    let total;
    let pageCount;
    for (let page = 1; page <= (pageCount ?? 1); page += 1) {
      const { body, response } = await getGitHubJson(
        fetchImpl, ciRunsUrl(sha, page), token, 'T21RC2T_GATE_REJECTED',
      );
      fail(isRecord(body) && Array.isArray(body.workflow_runs)
        && Number.isSafeInteger(body.total_count) && body.total_count >= 0);
      if (total === undefined) {
        total = body.total_count;
        fail(total <= MAX_CI_RUNS);
        pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
      } else {
        fail(body.total_count === total);
      }
      const expectedLength = Math.min(PAGE_SIZE, Math.max(0, total - ((page - 1) * PAGE_SIZE)));
      fail(body.workflow_runs.length === expectedLength && hasNextPage(response) === (page < pageCount));
      runs.push(...body.workflow_runs);
    }
    fail(runs.length === total);
    const ids = runs.map((run) => normalizeId(run?.id));
    fail(new Set(ids).size === ids.length);
    return runs;
  } catch {
    reject('T21RC2T_GATE_REJECTED');
  }
}

async function fetchApprovalHistory(fetchImpl, runId, token) {
  const url = new URL(`${API_BASE}/actions/runs/${encodeURIComponent(runId)}/approvals`);
  url.searchParams.set('per_page', String(PAGE_SIZE));
  url.searchParams.set('page', '1');
  const { body, response } = await getGitHubJson(
    fetchImpl, url.href, token, 'T21RC2T_APPROVAL_REJECTED',
  );
  fail(Array.isArray(body) && body.length < PAGE_SIZE && !hasNextPage(response), 'T21RC2T_APPROVAL_REJECTED');
  return body;
}

export async function authorizeT21RC2TProductionRun({
  env = process.env,
  cwd = process.cwd(),
  fetchImpl = fetch,
  execute = execFileSync,
  requireApproval = true,
  sourceValidator = validateT21RC2TReleaseSource,
} = {}) {
  let action;
  try {
    action = validateActionEnvironment(env, { requireToken: true });
    fail(typeof fetchImpl === 'function' && typeof execute === 'function'
      && typeof sourceValidator === 'function');
    fail(FULL_SHA.test(action.ref ?? '') && FULL_SHA.test(action.reviewedSha ?? ''));
    fail(action.confirmation === 'true');
    fail(normalizeId(action.repositoryId) === String(T21RC2T_REPOSITORY_ID));
    fail(action.repository === T21RC2T_REPOSITORY);
    fail(normalizeLogin(action.actor) === T21RC2T_EXPECTED_ACTOR
      && normalizeLogin(action.triggeringActor) === T21RC2T_EXPECTED_ACTOR);
    normalizeId(action.runId);
  } catch {
    reject('T21RC2T_GATE_REJECTED');
  }

  const token = env.GH_TOKEN;
  const localMainSha = gitOutput(execute, cwd, [
    'rev-parse', '--verify', '--end-of-options', 'refs/remotes/origin/main^{commit}',
  ]);
  const remoteMainSha = await fetchCurrentMainSha(fetchImpl, token);
  fail(remoteMainSha === action.ref && remoteMainSha === localMainSha);

  const runUrl = `${API_BASE}/actions/runs/${encodeURIComponent(normalizeId(action.runId))}`;
  const { body: run } = await getGitHubJson(fetchImpl, runUrl, token);
  const ciRuns = await fetchCompleteCiRuns(fetchImpl, action.ref, token);
  const gate = validateT21RC2TGate({ ...action, run, mainSha: remoteMainSha, ciRuns, cwd, execute, sourceValidator });
  if (!requireApproval) return gate;

  try {
    const [environmentResult, history] = await Promise.all([
      getGitHubJson(fetchImpl, `${API_BASE}/environments/production`, token, 'T21RC2T_APPROVAL_REJECTED'),
      fetchApprovalHistory(fetchImpl, gate.runId, token),
    ]);
    const approval = validateT21RC2TProductionApproval({
      history,
      environment: environmentResult.body,
      actor: gate.actor,
      triggeringActor: gate.triggeringActor,
    });
    return { ...gate, approval };
  } catch {
    reject('T21RC2T_APPROVAL_REJECTED');
  }
}

export async function runT21RC2TApprovalCommand(command, {
  env = process.env,
  cwd = process.cwd(),
  fetchImpl = fetch,
  execute = execFileSync,
  sourceValidator = validateT21RC2TReleaseSource,
} = {}) {
  const common = { env, cwd, fetchImpl, execute, sourceValidator };
  if (command === 'gate') {
    const gate = await authorizeT21RC2TProductionRun({ ...common, requireApproval: false });
    fail(typeof env.GITHUB_OUTPUT === 'string' && path.isAbsolute(env.GITHUB_OUTPUT));
    fail(FULL_SHA.test(gate.mainSha));
    try {
      appendFileSync(env.GITHUB_OUTPUT, `candidate_sha=${gate.mainSha}\n`);
    } catch {
      reject('T21RC2T_GATE_REJECTED');
    }
    return { candidateSha: gate.mainSha };
  }

  if (command === 'approve') {
    const authorization = await authorizeT21RC2TProductionRun({ ...common, requireApproval: true });
    requireStoredT21RC2TAuthorization(authorization, env);
    writeT21RC2TPrivateJson('authorization.json', authorization, env, cwd);
    return authorization;
  }

  if (command === 'recheck') {
    let original;
    try {
      original = readT21RC2TPrivateJson('authorization.json', env, cwd);
      requireStoredT21RC2TAuthorization(original, env);
    } catch {
      reject('T21RC2T_RECHECK_REJECTED');
    }
    let fresh;
    try {
      fresh = await authorizeT21RC2TProductionRun({ ...common, requireApproval: true });
    } catch {
      reject('T21RC2T_RECHECK_REJECTED');
    }
    try {
      requireStoredT21RC2TAuthorization(fresh, env);
      requireImmutableT21RC2TAuthorizationMatch(original, fresh);
      writeT21RC2TPrivateJson('authorization-final.json', fresh, env, cwd);
    } catch {
      reject('T21RC2T_RECHECK_REJECTED');
    }
    return fresh;
  }

  reject('T21RC2T_GATE_REJECTED');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.umask(0o077);
  runT21RC2TApprovalCommand(process.argv[2]).catch((error) => {
    console.error(`t21rc2t=${safeT21RC2TError(error)}`);
    process.exitCode = 1;
  });
}
