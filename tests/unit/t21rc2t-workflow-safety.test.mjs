import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import {
  T21RC2T_PUBLIC_FILENAME,
  T21RC2T_PUBLIC_DIRECTORY,
} from '../../scripts/t21rc2t-production-files.mjs';

const require = createRequire(import.meta.url);
const { load } = createRequire(require.resolve('eslint/package.json'))('js-yaml');
const workflowPath = '.github/workflows/production-d1-t21rc2t-identity-topology.yml';
const workflowText = readFileSync(workflowPath, 'utf8');
const workflow = load(workflowText);
const events = workflow.on ?? workflow.true;
const dispatchInputs = events.workflow_dispatch.inputs;
const steps = workflow.jobs.capture.steps;
const stepIndex = (command) => steps.findIndex((step) => step.run === command);
const step = (command) => steps.find((entry) => entry.run === command);

function immutableActionRefs(document) {
  const refs = [];
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    if (Object.hasOwn(node, 'uses')) {
      if (typeof node.uses !== 'string') throw new Error('T21RC2T_MUTABLE_ACTION');
      if (!node.uses.startsWith('./')) {
        if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[a-f0-9]{40}$/.test(node.uses)) {
          throw new Error('T21RC2T_MUTABLE_ACTION');
        }
        refs.push(node.uses);
      }
    }
    Object.values(node).forEach(visit);
  };
  visit(document);
  return refs;
}

describe('T21R-C2T production workflow authority boundary', () => {
  it('exposes only immutable ref, reviewed SHA, and explicit read-only confirmation inputs', () => {
    expect(Object.keys(dispatchInputs).sort()).toEqual([
      'confirm_t21rc2t_read_only_diagnostic', 'ref', 'reviewed_sha',
    ]);
    expect(dispatchInputs.ref.type).toBe('string');
    expect(dispatchInputs.reviewed_sha.type).toBe('string');
    expect(dispatchInputs.confirm_t21rc2t_read_only_diagnostic).toMatchObject({
      type: 'boolean', required: true, default: false,
    });
    expect(workflow.permissions).toEqual({ contents: 'read', actions: 'read' });
    expect(workflow.concurrency).toMatchObject({ group: 'frigo-deploy-production', 'cancel-in-progress': false });
  });

  it('gates first and requires the protected production Environment only in the dependent job', () => {
    expect(workflow.jobs.gate.environment).toBeUndefined();
    expect(workflow.jobs.capture.needs).toBe('gate');
    expect(workflow.jobs.capture.environment).toBe('production');
    expect(workflow.jobs.gate.outputs).toEqual({ candidate_sha: '${{ steps.gate.outputs.candidate_sha }}' });
    expect(Object.keys(workflow.jobs.gate.outputs)).toEqual(['candidate_sha']);
    expect(steps.some((entry) => entry.name?.includes('normal independent production Environment approval'))).toBe(true);
  });

  it('reauthorizes before the only Cloudflare credential step and gives no production credentials to later work', () => {
    const approve = step('node scripts/t21rc2t-production-approval.mjs approve');
    const capture = step('node scripts/t21rc2t-production-capture.mjs capture');
    const aggregate = step('node scripts/t21rc2t-production-receipt.mjs aggregate');
    const recheck = step('node scripts/t21rc2t-production-approval.mjs recheck');
    const validate = step('node scripts/t21rc2t-production-receipt.mjs validate');
    expect(approve).toBeDefined();
    expect(Object.keys(approve.env)).not.toContain('CLOUDFLARE_API_TOKEN');
    expect(Object.keys(capture.env)).toEqual(expect.arrayContaining([
      'GH_TOKEN', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID',
    ]));
    for (const entry of [aggregate, recheck, validate]) {
      expect(Object.keys(entry.env ?? {})).not.toContain('CLOUDFLARE_API_TOKEN');
      expect(Object.keys(entry.env ?? {})).not.toContain('CLOUDFLARE_ACCOUNT_ID');
    }
    expect(recheck.env).toEqual({ GH_TOKEN: '${{ github.token }}' });
    expect(validate.env).toBeUndefined();
    expect(stepIndex('node scripts/t21rc2t-production-approval.mjs approve'))
      .toBeLessThan(stepIndex('node scripts/t21rc2t-production-capture.mjs capture'));
  });

  it('orders capture, aggregate, final recheck, validation, one success-only artifact, and always cleanup', () => {
    const captureIndex = stepIndex('node scripts/t21rc2t-production-capture.mjs capture');
    const aggregateIndex = stepIndex('node scripts/t21rc2t-production-receipt.mjs aggregate');
    const recheckIndex = stepIndex('node scripts/t21rc2t-production-approval.mjs recheck');
    const validateIndex = stepIndex('node scripts/t21rc2t-production-receipt.mjs validate');
    const uploadIndex = steps.findIndex((entry) => entry.uses?.startsWith('actions/upload-artifact@'));
    const cleanupIndex = stepIndex('node scripts/t21rc2t-production-capture.mjs cleanup');
    const uploads = steps.filter((entry) => entry.uses?.startsWith('actions/upload-artifact@'));
    expect(captureIndex).toBeGreaterThanOrEqual(0);
    expect(captureIndex).toBeLessThan(aggregateIndex);
    expect(aggregateIndex).toBeLessThan(recheckIndex);
    expect(recheckIndex).toBeLessThan(validateIndex);
    expect(validateIndex).toBeLessThan(uploadIndex);
    expect(uploadIndex).toBeLessThan(cleanupIndex);
    expect(uploads).toHaveLength(1);
    expect(uploads[0].if).toBe('success()');
    expect(uploads[0].with.path).toBe(
      `\${{ runner.temp }}/${T21RC2T_PUBLIC_DIRECTORY}/${T21RC2T_PUBLIC_FILENAME}`,
    );
    expect(uploads[0].with.path).not.toMatch(/[?*\[\]]/);
    expect(uploads[0].with['if-no-files-found']).toBe('error');
    expect(steps[cleanupIndex].if).toBe('always()');
  });

  it('pins every external Action to a full lowercase commit and contains no mutating production command', () => {
    const refs = immutableActionRefs(workflow);
    expect(refs).toHaveLength(6);
    expect(new Set(refs).size).toBe(4);
    expect(() => immutableActionRefs(load(workflowText.replace(
      /actions\/checkout@[a-f0-9]{40}/,
      'actions/checkout@main',
    )))).toThrow('T21RC2T_MUTABLE_ACTION');
    expect(workflowText).not.toMatch(/wrangler\s+d1\s+migrations\s+apply|wrangler\s+deploy|\b(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX)\b/i);
    expect(workflowText).toContain('node scripts/t21rc2t-production-capture.mjs cleanup');
  });
});
