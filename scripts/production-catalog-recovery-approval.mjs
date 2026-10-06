import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { hostedCi, requireCurrentHostedMain } from './release-check.mjs';
import { validateProductionApproval } from './t21rc2-production-approval.mjs';

export const RECOVERY_REPOSITORY = 'vn-tak/Tako-san';
export const RECOVERY_REPOSITORY_ID = 1385308553;
export const RECOVERY_WORKFLOW = '.github/workflows/production-catalog-recovery.yml';
const SHA = /^[a-f0-9]{40}$/;
const OPERATIONS = ['inspect', 'inspect-import', 'static-pin', 'restore-v1'];
const reject = () => { throw new Error('PRODUCTION_CATALOG_RECOVERY_AUTHORIZATION_REJECTED'); };
const requireProof = (condition) => { if (!condition) reject(); };

export function verifyRecoveryImplementation(pulls, implementationSha) {
  requireProof(Array.isArray(pulls) && SHA.test(implementationSha));
  const merged = pulls.filter((pull) => pull.state === 'closed' && pull.merged_at &&
    pull.head?.sha === implementationSha && pull.head?.repo?.id === RECOVERY_REPOSITORY_ID &&
    pull.base?.ref === 'main' && pull.base?.repo?.id === RECOVERY_REPOSITORY_ID);
  requireProof(merged.length === 1 && Number.isSafeInteger(merged[0].number));
  return { pullRequest: merged[0].number, implementationSha, mergedInto: 'main' };
}

export function verifyRecoveryRun(run, env) {
  requireProof(OPERATIONS.includes(env.RECOVERY_OPERATION) && env.CONFIRM_CATALOG_RECOVERY === 'true');
  requireProof(env.GITHUB_EVENT_NAME === 'workflow_dispatch' && env.GITHUB_REF === 'refs/heads/main' &&
    SHA.test(env.RELEASE_REF || '') && env.GITHUB_SHA === env.RELEASE_REF &&
    SHA.test(env.REVIEWED_SHA || '') && env.REVIEWED_SHA !== env.RELEASE_REF &&
    env.GITHUB_REPOSITORY === RECOVERY_REPOSITORY && String(env.GITHUB_REPOSITORY_ID) === String(RECOVERY_REPOSITORY_ID) &&
    env.GITHUB_ACTOR === 'vn-tak' && env.GITHUB_TRIGGERING_ACTOR === 'vn-tak' &&
    env.GITHUB_RUN_ATTEMPT === '1' && /^[1-9][0-9]*$/.test(env.GITHUB_RUN_ID || ''));
  requireProof(run.id === Number(env.GITHUB_RUN_ID) && run.run_attempt === 1 &&
    run.head_sha === env.RELEASE_REF && run.head_branch === 'main' && run.event === 'workflow_dispatch' &&
    run.path === RECOVERY_WORKFLOW && run.repository?.id === RECOVERY_REPOSITORY_ID &&
    run.repository?.full_name === RECOVERY_REPOSITORY && run.head_repository?.id === RECOVERY_REPOSITORY_ID &&
    run.head_repository?.full_name === RECOVERY_REPOSITORY && run.actor?.login === 'vn-tak' &&
    run.triggering_actor?.login === 'vn-tak');
}

export async function authorizeRecovery({
  env = process.env, cwd = process.cwd(), fetchImpl = fetch, execute = execFileSync,
  readCi = hostedCi, requireApproval = true,
} = {}) {
  const token = env.GH_TOKEN;
  requireProof(typeof token === 'string' && token.length > 0);
  const api = `https://api.github.com/repos/${RECOVERY_REPOSITORY}`;
  const get = async (suffix) => {
    const response = await fetchImpl(`${api}${suffix}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(30_000), redirect: 'error',
    });
    requireProof(response.ok);
    return { body: await response.json(), next: response.headers.get('link')?.includes('rel="next"') };
  };
  const all = async (suffix) => {
    const rows = [];
    for (let page = 1; page <= 20; page += 1) {
      const result = await get(`${suffix}${suffix.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      requireProof(Array.isArray(result.body));
      rows.push(...result.body);
      if (!result.next) return rows;
    }
    reject();
  };
  const run = (await get(`/actions/runs/${env.GITHUB_RUN_ID}`)).body;
  verifyRecoveryRun(run, env);
  const git = (...args) => execute('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  requireProof(git('rev-parse', 'HEAD') === env.RELEASE_REF &&
    git('rev-parse', 'refs/remotes/origin/main') === env.RELEASE_REF &&
    git('status', '--porcelain', '--untracked-files=no') === '');
  execute('git', ['merge-base', '--is-ancestor', env.REVIEWED_SHA, env.RELEASE_REF], { cwd, stdio: 'pipe' });
  execute('git', ['diff', '--quiet', '--no-ext-diff', '--no-textconv', env.REVIEWED_SHA, env.RELEASE_REF, '--'], { cwd, stdio: 'pipe' });
  const pulls = await all(`/commits/${env.REVIEWED_SHA}/pulls`);
  const implementation = verifyRecoveryImplementation(pulls, env.REVIEWED_SHA);
  let approval;
  if (requireApproval) {
    const [environment, history] = await Promise.all([
      get('/environments/production'), all(`/actions/runs/${env.GITHUB_RUN_ID}/approvals`),
    ]);
    approval = validateProductionApproval({
      environment: environment.body, history, actor: env.GITHUB_ACTOR, triggeringActor: env.GITHUB_TRIGGERING_ACTOR,
    });
  }
  const ci = await readCi(env.RELEASE_REF, RECOVERY_REPOSITORY);
  const main = await requireCurrentHostedMain({ sha: env.RELEASE_REF, repository: RECOVERY_REPOSITORY, token, fetchImpl });
  return {
    schemaVersion: 1, mainSha: main.headSha, reviewedSha: env.REVIEWED_SHA,
    operation: env.RECOVERY_OPERATION, runId: env.GITHUB_RUN_ID, runAttempt: 1,
    repository: RECOVERY_REPOSITORY, implementation, ci, ...(approval ? { approval } : {}),
  };
}

async function main() {
  const command = process.argv[2];
  requireProof(['gate', 'approve', 'recheck'].includes(command));
  const proof = await authorizeRecovery({ requireApproval: command !== 'gate' });
  if (command === 'gate') {
    requireProof(typeof process.env.GITHUB_OUTPUT === 'string');
    appendFileSync(process.env.GITHUB_OUTPUT, `candidate_sha=${proof.mainSha}\n`);
  } else {
    if (command === 'recheck') {
      const previous = JSON.parse(readFileSync('catalog-recovery-authorization.json', 'utf8'));
      for (const key of ['mainSha', 'reviewedSha', 'operation', 'runId', 'runAttempt', 'repository', 'implementation', 'approval']) {
        requireProof(JSON.stringify(previous[key]) === JSON.stringify(proof[key]));
      }
    }
    writeFileSync('catalog-recovery-authorization.json', `${JSON.stringify(proof, null, 2)}\n`, { mode: 0o600 });
  }
  console.log('Production catalog recovery authorization verified');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('PRODUCTION_CATALOG_RECOVERY_AUTHORIZATION_REJECTED'); process.exitCode = 1; });
}
