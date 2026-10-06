import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  authorizeRecovery, RECOVERY_REPOSITORY, RECOVERY_REPOSITORY_ID,
  RECOVERY_WORKFLOW, verifyRecoveryImplementation, verifyRecoveryRun,
} from '../../scripts/production-catalog-recovery-approval.mjs';

const reviewedSha = 'a'.repeat(40);
const mainSha = 'b'.repeat(40);
const pull = {
  number: 46, state: 'closed', merged_at: '2026-10-05T00:00:00Z',
  head: { sha: reviewedSha, repo: { id: RECOVERY_REPOSITORY_ID } },
  base: { ref: 'main', repo: { id: RECOVERY_REPOSITORY_ID } },
};
const env = {
  GH_TOKEN: 'fixture-token', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main',
  GITHUB_SHA: mainSha, RELEASE_REF: mainSha, REVIEWED_SHA: reviewedSha,
  GITHUB_REPOSITORY: RECOVERY_REPOSITORY, GITHUB_REPOSITORY_ID: String(RECOVERY_REPOSITORY_ID),
  GITHUB_ACTOR: 'vn-tak', GITHUB_TRIGGERING_ACTOR: 'vn-tak', GITHUB_RUN_ATTEMPT: '1',
  GITHUB_RUN_ID: '77', RECOVERY_OPERATION: 'restore-v1', CONFIRM_CATALOG_RECOVERY: 'true',
};
const run = {
  id: 77, run_attempt: 1, head_sha: mainSha, head_branch: 'main', event: 'workflow_dispatch',
  path: RECOVERY_WORKFLOW, repository: { id: RECOVERY_REPOSITORY_ID, full_name: RECOVERY_REPOSITORY },
  head_repository: { id: RECOVERY_REPOSITORY_ID, full_name: RECOVERY_REPOSITORY },
  actor: { login: 'vn-tak' }, triggering_actor: { login: 'vn-tak' },
};

describe('independent bounded recovery authorization', () => {
  it('binds the exact final implementation head of one merged main PR', () => {
    expect(verifyRecoveryImplementation([pull], reviewedSha)).toEqual({
      pullRequest: 46, implementationSha: reviewedSha, mergedInto: 'main',
    });
    expect(() => verifyRecoveryImplementation([pull, pull], reviewedSha)).toThrow();
  });
  it.each([
    { ...pull, state: 'open' }, { ...pull, merged_at: null },
    { ...pull, head: { ...pull.head, sha: mainSha } },
    { ...pull, base: { ...pull.base, ref: 'other' } },
    { ...pull, base: { ...pull.base, repo: { id: 99 } } },
  ])('rejects unmerged, stale, non-main or foreign PR', (candidate) => {
    expect(() => verifyRecoveryImplementation([candidate], reviewedSha)).toThrow();
  });
  it('requires main dispatch attempt one by the independent operator', () => {
    expect(() => verifyRecoveryRun(run, env)).not.toThrow();
    expect(() => verifyRecoveryRun(run, { ...env, RECOVERY_OPERATION: 'inspect-import' })).not.toThrow();
    for (const change of [
      { GITHUB_RUN_ATTEMPT: '2' }, { GITHUB_REF: 'refs/heads/other' }, { GITHUB_SHA: reviewedSha },
      { GITHUB_ACTOR: 'vn-taphoanhatung' }, { GITHUB_TRIGGERING_ACTOR: 'vn-taphoanhatung' },
      { RECOVERY_OPERATION: 'arbitrary-sql' }, { CONFIRM_CATALOG_RECOVERY: 'false' },
    ]) expect(() => verifyRecoveryRun(run, { ...env, ...change })).toThrow();
    expect(() => verifyRecoveryRun({ ...run, path: '.github/workflows/other.yml' }, env)).toThrow();
    expect(() => verifyRecoveryRun({ ...run, head_sha: reviewedSha }, env)).toThrow();
  });
  it('uses real Git to reject changes after review, even when the new main CI passed', async () => {
    const cwd = mkdtempSync(path.join(os.tmpdir(), 'catalog-recovery-review-'));
    const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
    git('init', '--quiet', '--initial-branch=main');
    git('config', 'user.email', 'fixture@example.test'); git('config', 'user.name', 'Fixture');
    writeFileSync(path.join(cwd, 'operation.mjs'), 'export const value = 1;\n');
    git('add', 'operation.mjs'); git('commit', '--quiet', '-m', 'reviewed');
    const reviewed = git('rev-parse', 'HEAD');
    writeFileSync(path.join(cwd, 'operation.mjs'), 'export const value = 2;\n');
    git('add', 'operation.mjs'); git('commit', '--quiet', '-m', 'changed after review');
    const current = git('rev-parse', 'HEAD'); git('update-ref', 'refs/remotes/origin/main', current);
    const freshEnv = { ...env, GITHUB_SHA: current, RELEASE_REF: current, REVIEWED_SHA: reviewed };
    const fetchImpl = async (url) => {
      expect(url).toContain('/actions/runs/77');
      return new Response(JSON.stringify({ ...run, head_sha: current }), { status: 200 });
    };
    await expect(authorizeRecovery({ env: freshEnv, cwd, fetchImpl, requireApproval: false })).rejects.toThrow();
  });
  it('requires the normal independent production approval before credentials can be used', async () => {
    const environment = { id: 801, name: 'production', can_admins_bypass: true,
      protection_rules: [{ id: 802, type: 'required_reviewers', prevent_self_review: false,
        reviewers: [{ type: 'User', reviewer: { id: 803, login: 'vn-taphoanhatung' } }] }],
      deployment_branch_policy: { protected_branches: false, custom_branch_policies: false } };
    const approved = { state: 'approved', user: { id: 803, type: 'User', login: 'vn-taphoanhatung' },
      environments: [{ id: 801, name: 'production' }], comment: 'private comment must not enter receipt' };
    const fixture = (history) => ({ env, execute: (_cmd, args) => args[0] === 'rev-parse' ? mainSha : '',
      readCi: async () => ({ headSha: mainSha }), fetchImpl: async (url) => {
        const body = url.includes('/approvals') ? history
          : url.includes('/environments/production') ? environment
            : url.includes('/actions/runs/') ? run
              : url.includes('/commits/') ? [pull]
                : { ref: 'refs/heads/main', object: { type: 'commit', sha: mainSha } };
        return new Response(JSON.stringify(body));
      } });
    const proof = await authorizeRecovery(fixture([approved]));
    expect(proof.approval).toMatchObject({ environment: 'production', state: 'approved', reviewer: 'vn-taphoanhatung' });
    expect(JSON.stringify(proof)).not.toContain('private comment');
    await expect(authorizeRecovery(fixture([]))).rejects.toThrow();
    await expect(authorizeRecovery(fixture([{ ...approved, admin_bypass: true }]))).rejects.toThrow();
    await expect(authorizeRecovery(fixture([{ ...approved, user: { ...approved.user, login: 'vn-tak' } }]))).rejects.toThrow();
  });
  it('checks hosted main last after fresh CI', async () => {
    const events = [];
    const execute = (_command, args) => {
      if (args[0] === 'rev-parse') return mainSha;
      return '';
    };
    const fetchImpl = async (url, options) => {
      expect(options.redirect).toBe('error');
      expect(options.headers.Authorization).toBe('Bearer fixture-token');
      events.push(url);
      const value = url.includes('/actions/runs/') ? run
        : url.includes('/commits/') ? [pull]
          : { ref: 'refs/heads/main', object: { type: 'commit', sha: mainSha } };
      return new Response(JSON.stringify(value), { status: 200 });
    };
    const proof = await authorizeRecovery({ env, execute, fetchImpl, requireApproval: false,
      readCi: async () => { events.push('ci'); return { headSha: mainSha }; } });
    expect(proof.mainSha).toBe(mainSha);
    expect(events.slice(-2)).toEqual(['ci', `https://api.github.com/repos/${RECOVERY_REPOSITORY}/git/ref/heads/main`]);
    await expect(authorizeRecovery({ env, execute, requireApproval: false, readCi: async () => ({ headSha: mainSha }),
      fetchImpl: async (url, options) => url.endsWith('/git/ref/heads/main')
        ? new Response(JSON.stringify({ ref: 'refs/heads/main', object: { type: 'commit', sha: reviewedSha } }))
        : fetchImpl(url, options) })).rejects.toThrow();
  });
});


describe('production recovery workflow boundaries', () => {
  const workflow = readFileSync('.github/workflows/production-catalog-recovery.yml', 'utf8');
  it('uses normal production approval and the shared deployment lock with least privileges', () => {
    expect(workflow).toContain('environment: production');
    expect(workflow).toContain('options: [inspect, inspect-import, static-pin, restore-v1]');
    expect(workflow).toContain('group: frigo-deploy-production');
    expect(workflow).toContain('cancel-in-progress: false');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('pull-requests: read');
    expect(workflow).not.toMatch(/contents: write|actions: write|pull_request_target/);
    expect(workflow.indexOf('production-catalog-recovery-approval.mjs approve')).toBeLessThan(
      workflow.indexOf('production-catalog-recovery-runner.mjs'));
  });
  it('registers on main push without credentials and keeps the production gate dispatch-only', () => {
    const registration = workflow.slice(workflow.indexOf('  register:'), workflow.indexOf('  gate:'));
    expect(registration).toContain("if: github.event_name == 'push'");
    expect(registration).not.toMatch(/environment:|secrets\.|checkout|node scripts|wrangler/);
    expect(workflow).toContain("if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main' && inputs.confirm_catalog_recovery == true");
    expect(workflow).toContain('    needs: gate');
    expect(() => verifyRecoveryRun({ ...run, event: 'push' }, { ...env, GITHUB_EVENT_NAME: 'push' })).toThrow();
  });
  it('publishes only named aggregate proofs and keeps generated SQL private', () => {
    const artifact = workflow.slice(workflow.indexOf('Save aggregate recovery'), workflow.indexOf('Clear private generated SQL'));
    expect(artifact).toContain('catalog-recovery-authorization.json');
    expect(artifact).toContain('catalog-recovery-receipt.json');
    expect(artifact).not.toContain('.sql');
    expect(workflow).not.toMatch(/wrangler deploy|migrations apply|d1 export/);
    expect(workflow).toContain('pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1');
  });
});
