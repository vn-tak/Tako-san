import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { QwenTaskRuntime } from '../../packages/ai/src';
import type { AIUsageLog } from '../../packages/ai/src/schemas';
import { failureDiagnostics, sanitizeFailureDiagnostics } from '../../packages/ai/src/failure-diagnostics';
import { createAISchemaError } from '../../packages/ai/src/errors';
import { logAIUsage } from '../../src/worker/config/ai';

function response(content: unknown): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }] }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
const valid = { items: [{ raw_name: 'Tomato', estimated_quantity: 2, unit: 'piece', confidence: 0.95 }] };
afterEach(() => vi.restoreAllMocks());

describe('Scan failure diagnostics', () => {
  it('repairs the actual rejected schema fields without repeating receipt values', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response({ items: [{ raw_name: 'PRIVATE_RECEIPT_VALUE', estimated_quantity: 0, unit: 'PRIVATE_UNIT' }] }))
      .mockResolvedValueOnce(response(valid));
    const logs: AIUsageLog[] = [];
    const runtime = new QwenTaskRuntime({ qwenApiKey: 'test-key', qwenOnly: true }, log => logs.push(log));
    await runtime.generate({ task: 'receipt_ocr', input: { imageBase64OrUrl: 'AQI=' } });
    expect(logs[0]).toMatchObject({ failureCode: 'SCHEMA_VALIDATION', validationIssues: [
      { path: 'items[].estimated_quantity', code: 'too_small' },
      { path: 'items[].unit', code: 'invalid_enum_value' },
    ] });
    const repair = String(fetchMock.mock.calls[1]?.[1]?.body);
    expect(repair).toContain('items[].estimated_quantity');
    expect(repair).toContain('items[].unit');
    expect(repair).not.toContain('PRIVATE_RECEIPT_VALUE');
    expect(repair).not.toContain('PRIVATE_UNIT');
    expect(logs[1]).not.toHaveProperty('validationIssues');
    const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    logAIUsage(logs[0]);
    expect(JSON.parse(String(consoleMock.mock.calls[0][0]))).toMatchObject({ validationIssues: logs[0].validationIssues });
    expect(JSON.stringify(consoleMock.mock.calls)).not.toContain('PRIVATE_');
  });

  it('deduplicates and bounds issues, masking unknown keys and all Zod messages', () => {
    const issues: z.ZodIssue[] = Array.from({ length: 20 }, (_, i) => ({
      code: 'invalid_type', expected: 'number', received: 'string',
      path: ['items', i, 'estimated_quantity'], message: 'PRIVATE_MESSAGE',
    }));
    issues.push({ code: 'custom', path: ['PRIVATE_KEY'], message: 'PRIVATE_MESSAGE' });
    const result = failureDiagnostics(createAISchemaError('Qwen', 'schema failed', 'qwen-vl-ocr', new z.ZodError(issues)));
    expect(result.validationIssues).toEqual([
      { path: 'items[].estimated_quantity', code: 'invalid_type' }, { path: '$other', code: 'custom' },
    ]);
    expect(JSON.stringify(result)).not.toContain('PRIVATE_');
    const many = new z.ZodError(Array.from({ length: 30 }, (_, i) => ({
      code: 'custom', path: ['items', i, ['raw_name', 'estimated_quantity', 'unit', 'confidence', 'storage', 'category', 'canonical_id', 'unit_price_vnd', 'total_price_vnd'][i % 9]], message: 'PRIVATE_MESSAGE',
    })));
    expect(failureDiagnostics(many).validationIssues).toHaveLength(8);
  });

  it('rejects untrusted diagnostic fields at the Worker logging boundary', () => {
    const diagnostics = { failureStage: 'PRIVATE_STAGE', validationIssues: [
      { path: 'PRIVATE_PATH', code: 'custom', message: 'PRIVATE_MESSAGE' },
      { path: 'items[].unit', code: 'PRIVATE_CODE' },
      { path: 'items[].unit', code: 'invalid_enum_value', received: 'PRIVATE_VALUE' },
    ] };
    expect(sanitizeFailureDiagnostics(diagnostics)).toEqual({
      validationIssues: [{ path: 'items[].unit', code: 'invalid_enum_value' }],
    });
    const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    logAIUsage({ ...diagnostics } as unknown as AIUsageLog);
    expect(JSON.stringify(consoleMock.mock.calls)).not.toContain('PRIVATE_');
  });

  it.each([
    ['invalid envelope', () => new Response('{bad-envelope', { headers: { 'Content-Type': 'application/json' } }), 'invalid_envelope'],
    ['empty content', () => response(''), 'empty_content'],
    ['unparseable content', () => response('PRIVATE_NOT_JSON'), 'unparseable_content'],
    ['empty items', () => response({ items: [] }), 'empty_items'],
  ])('distinguishes %s while preserving retries and the public error code', async (_name, reply, stage) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => reply());
    const logs: AIUsageLog[] = [];
    const runtime = new QwenTaskRuntime({ qwenApiKey: 'test-key', qwenOnly: true }, log => logs.push(log));
    await expect(runtime.generate({ task: 'receipt_ocr', input: { imageBase64OrUrl: 'AQI=' } }))
      .rejects.toMatchObject({ code: 'INVALID_RESPONSE', retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(logs).toHaveLength(3);
    expect(logs.every(log => log.failureStage === stage)).toBe(true);
    expect(JSON.stringify(logs)).not.toContain('PRIVATE_');
  });
});
