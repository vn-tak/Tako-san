import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ingredientConceptKey } from '../../packages/recipes/src/refresh/normalize.ts';
import { normalizeIngredientAlias } from '../../packages/domain/src/foundation.ts';
import { PRODUCTION_D1 } from '../../scripts/d1-migration-check.mjs';
import { captureDigest } from '../../scripts/t21rc2-production-capture.mjs';
import { runT21RC2TReceiptCommand, serializePublicReceipt } from '../../scripts/t21rc2t-production-receipt.mjs';
import { cleanupT21RC2TFiles, readT21RC2TPublicReceipt, runnerPaths, writeT21RC2TPrivateJson } from '../../scripts/t21rc2t-production-files.mjs';
import { T21RC2T_WORKFLOW_PATH } from '../../scripts/t21rc2t-production-approval.mjs';

const roots = [];
const marker = 'UNMISTAKABLE_PRIVATE_RECEIPT_847293';
const mainSha = 'b'.repeat(40), reviewedSha = 'a'.repeat(40);
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

function setup() {
  const root = mkdtempSync(path.join(os.tmpdir(), 't21rc2t-receipt-')); roots.push(root);
  const env = {
    RUNNER_TEMP: root, GITHUB_OUTPUT: path.join(root, 'github-output'),
    GITHUB_REPOSITORY_ID: '1385308553', GITHUB_REPOSITORY: 'vn-tak/Tako-san',
    GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', GITHUB_SHA: mainSha,
    RELEASE_REF: mainSha, REVIEWED_SHA: reviewedSha, CONFIRM_T21RC2T_READ_ONLY_DIAGNOSTIC: 'true',
    GITHUB_ACTOR: 'vn-tak', GITHUB_TRIGGERING_ACTOR: 'vn-tak', GITHUB_RUN_ID: '100', GITHUB_RUN_ATTEMPT: '1',
  };
  const authorization = {
    schemaVersion: 1, repositoryId: 1385308553, repository: 'vn-tak/Tako-san', workflowPath: T21RC2T_WORKFLOW_PATH,
    mainSha, reviewedSha, runId: '100', runAttempt: '1', actor: 'vn-tak', triggeringActor: 'vn-tak',
    ci: { id: 101, attempt: 1, headSha: mainSha },
    approval: { environment: 'production', state: 'approved', reviewer: 'vn-taphoanhatung', actor: 'vn-tak',
      triggeringActor: 'vn-tak', historySha256: 'c'.repeat(64), policySha256: 'd'.repeat(64) },
  };
  const authorityProof = Object.fromEntries(['canonicalTargetSha256', 'releaseManifestSha256', 'approvedBatchesSha256',
    'canonicalRegistrySourceSha256', 'reconciliationSha256', 'runtimeFingerprint'].map((field) => [field, 'e'.repeat(64)]));
  authorityProof.releaseId = 'synthetic-offline'; authorityProof.reviewedBridgeCount = 0;
  const targetRecipes = [{ id: 'synthetic', ingredients: [{ ingredientId: 'SYNTHETIC', name: marker, requiredQuantity: 1, unit: 'g', isOptional: false }] }];
  const input = { recipeIds: ['synthetic'], occurrences: [{ id: marker, recipe_id: 'synthetic', ingredient_id: 'SYNTHETIC',
    name: marker, required_quantity: 1, unit: 'g', is_optional: 0 }], captureCounts: { recipeCount: 1, ingredientOccurrenceCount: 1 } };
  const capture = { schemaVersion: 1, status: 'OBSERVED_STABLE_NON_ATOMIC', database: { ...PRODUCTION_D1, accountVerified: true },
    ledger: { count: 38, tip: '0038_auth_onboarding_completion.sql', namesSha256: 'f'.repeat(64) },
    counts: input.captureCounts, authorityProof, authorizationSha256: captureDigest(authorization), snapshotDigestSha256: captureDigest(input) };
  for (const [name, value] of Object.entries({ 'authorization.json': authorization, 'classifier-input.json': input, 'capture-verified.json': capture })) writeT21RC2TPrivateJson(name, value, env);
  const authority = { recipeIds: ['synthetic'], targetRecipes, v2Recipes: structuredClone(targetRecipes), canonicalIngredientIds: [], reconciliation: [],
    authorityProof, conceptKey: ingredientConceptKey, normalizeName: normalizeIngredientAlias };
  const options = { env, loadAuthority: vi.fn(async () => authority), verifyForensic: vi.fn(() => true) };
  return { env, authorization, capture, authority, options, paths: runnerPaths(env) };
}

describe('C2T private capture to public receipt', () => {
  it('aggregates, independently reopens after recheck, and validates deterministic safe bytes', async () => {
    const f = setup();
    await expect(runT21RC2TReceiptCommand('aggregate', f.options)).resolves.toBe(true);
    expect(statSync(f.paths.privateDirectory).mode & 0o077).toBe(0);
    expect(statSync(f.paths.publicReceipt).mode & 0o077).toBe(0);
    expect(readFileSync(f.paths.publicReceipt, 'utf8')).not.toContain(marker);
    expect(existsSync(f.env.GITHUB_OUTPUT)).toBe(false);
    writeT21RC2TPrivateJson('authorization-final.json', f.authorization, f.env);
    await expect(runT21RC2TReceiptCommand('validate', f.options)).resolves.toBe(true);
    expect(f.options.loadAuthority).toHaveBeenCalledTimes(2);
    expect(f.options.verifyForensic).toHaveBeenCalledTimes(2);
    expect(readFileSync(f.paths.publicReceipt, 'utf8')).toBe(serializePublicReceipt(readT21RC2TPublicReceipt(f.env)));
    cleanupT21RC2TFiles(f.env);
    expect(existsSync(f.paths.privateDirectory)).toBe(false);
    expect(existsSync(f.paths.publicReceipt)).toBe(false);
  });

  it('cannot publish without the real production forensic contract by default', async () => {
    const f = setup();
    const { verifyForensic, ...options } = f.options;
    await expect(runT21RC2TReceiptCommand('aggregate', options)).rejects.toThrow('T21RC2T_TOPOLOGY_REJECTED');
    expect(verifyForensic).not.toHaveBeenCalled();
    expect(existsSync(f.paths.publicReceipt)).toBe(false);
  });

  it('rejects missing final authorization and a changed final main authority', async () => {
    const f = setup();
    await runT21RC2TReceiptCommand('aggregate', f.options);
    await expect(runT21RC2TReceiptCommand('validate', f.options)).rejects.toThrow(/^T21RC2T_(CAPTURE|RECHECK)_REJECTED$/);
    writeT21RC2TPrivateJson('authorization-final.json', { ...f.authorization, mainSha: 'c'.repeat(40), ci: { ...f.authorization.ci, headSha: 'c'.repeat(40) } }, f.env);
    await expect(runT21RC2TReceiptCommand('validate', f.options)).rejects.toThrow('T21RC2T_RECHECK_REJECTED');
  });

  it('rejects a fresh source proof or roster different from capture', async () => {
    const f = setup();
    f.authority.authorityProof = { ...f.authority.authorityProof, reconciliationSha256: 'f'.repeat(64) };
    await expect(runT21RC2TReceiptCommand('aggregate', f.options)).rejects.toThrow('T21RC2T_CAPTURE_REJECTED');
    f.authority.authorityProof = f.capture.authorityProof;
    f.authority.recipeIds = ['different-synthetic'];
    await expect(runT21RC2TReceiptCommand('aggregate', f.options)).rejects.toThrow('T21RC2T_CAPTURE_REJECTED');
    expect(existsSync(f.paths.publicReceipt)).toBe(false);
  });

  it('rejects schema-valid aggregate mutation and non-canonical stored bytes', async () => {
    const f = setup();
    await runT21RC2TReceiptCommand('aggregate', f.options);
    writeT21RC2TPrivateJson('authorization-final.json', f.authorization, f.env);
    const bytes = readFileSync(f.paths.publicReceipt, 'utf8'), receipt = JSON.parse(bytes);
    receipt.distributions.productionMinusV2.max = 12;
    writeFileSync(f.paths.publicReceipt, `${JSON.stringify(receipt)}\n`);
    await expect(runT21RC2TReceiptCommand('validate', f.options)).rejects.toThrow('T21RC2T_ACCOUNTING_REJECTED');
    writeFileSync(f.paths.publicReceipt, ` ${bytes}`);
    await expect(runT21RC2TReceiptCommand('validate', f.options)).rejects.toThrow('T21RC2T_ACCOUNTING_REJECTED');
  });

  it.each(['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'])('rejects %s before evidence or source access', async (name) => {
    const readCapture = vi.fn();
    await expect(runT21RC2TReceiptCommand('aggregate', { env: { [name]: marker }, readCapture })).rejects.toThrow('T21RC2T_QUERY_REJECTED');
    expect(readCapture).not.toHaveBeenCalled();
  });

  it('does not echo upstream errors or raw output into exceptions, stdout or stderr', async () => {
    const f = setup(), stdout = vi.spyOn(process.stdout, 'write'), stderr = vi.spyOn(process.stderr, 'write');
    try {
      const error = { code: marker, message: marker, stdout: marker, stderr: marker, cause: new Error(marker) };
      let rejected;
      try { await runT21RC2TReceiptCommand('aggregate', { ...f.options, loadAuthority: async () => { throw error; } }); } catch (caught) { rejected = caught; }
      expect(rejected.message).toBe('T21RC2T_CAPTURE_REJECTED');
      expect(rejected.cause).toBeUndefined(); expect(JSON.stringify(rejected)).not.toContain(marker);
      expect(stdout).not.toHaveBeenCalled(); expect(stderr).not.toHaveBeenCalled();
      expect(existsSync(f.paths.publicReceipt)).toBe(false); expect(existsSync(f.env.GITHUB_OUTPUT)).toBe(false);
    } finally { stdout.mockRestore(); stderr.mockRestore(); }
  });

  it('the actual CLI prints only its fixed code for private extra input', () => {
    const result = spawnSync(process.execPath, ['scripts/t21rc2t-production-receipt.mjs', 'aggregate', marker], { encoding: 'utf8' });
    expect(result.status).toBe(1); expect(result.stdout).toBe('');
    expect(result.stderr).toBe('T21RC2T_QUERY_REJECTED\n');
    expect(JSON.stringify(result)).not.toContain(marker);
  });
});
