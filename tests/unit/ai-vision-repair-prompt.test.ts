import { afterEach, describe, expect, it, vi } from 'vitest';
import { QwenTaskRuntime } from '../../packages/ai/src';

function response(content: unknown): Response {
  return new Response(JSON.stringify({
    choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }],
  }), { headers: { 'Content-Type': 'application/json' } });
}

const extracted = {
  items: [{ raw_name: 'Tomato', estimated_quantity: 2, unit: 'piece', confidence: 0.95 }],
};
const imageBase64OrUrl = 'data:image/jpeg;base64,AQI=';
const tasks = ['receipt_ocr', 'label_ocr', 'fridge_image_analysis'] as const;

type VisionRequest = {
  model: string;
  messages: Array<{ content: Array<{ type: string; text?: string; image_url?: { url: string } }> }>;
};

function requestBody(init?: RequestInit): VisionRequest {
  return JSON.parse(String(init?.body)) as VisionRequest;
}

function prompt(body: VisionRequest): string {
  return body.messages[0].content.find(part => part.type === 'text')?.text || '';
}

afterEach(() => vi.restoreAllMocks());

describe('Vision repair prompts', () => {
  it.each(tasks)('keeps the default extraction task and schema when repairing %s', async (task) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response('{not-json'))
      .mockResolvedValueOnce(response(extracted));
    const runtime = new QwenTaskRuntime({ qwenApiKey: 'test-key', qwenOnly: true });

    const result = await runtime.generate({ task, input: { imageBase64OrUrl } });
    expect(result.attempts).toBe(2);
    const bodies = fetchMock.mock.calls.map(([, init]) => requestBody(init));
    const original = prompt(bodies[0]);
    expect(original).toContain('"raw_name"');
    expect(original).toContain('"estimated_quantity"');
    expect(original).toContain('JSON');
    expect(prompt(bodies[1])).toContain(original);
    expect(prompt(bodies[1])).toContain('Repair only these validation failures:');
    expect(prompt(bodies[1])).toContain('INVALID_RESPONSE');
    expect(bodies[1].messages[0].content.find(part => part.type === 'image_url')?.image_url?.url)
      .toBe(imageBase64OrUrl);
    expect(bodies[1].model).toBe(bodies[0].model);
  });

  it('keeps receipt instructions and schema during multimodal escalation', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response('{not-json'))
      .mockResolvedValueOnce(response('{still-not-json'))
      .mockResolvedValueOnce(response(extracted));
    const runtime = new QwenTaskRuntime({ qwenApiKey: 'test-key', qwenOnly: true });

    const result = await runtime.generate({ task: 'receipt_ocr', input: { imageBase64OrUrl } });
    expect(result.attempts).toBe(3);
    const bodies = fetchMock.mock.calls.map(([, init]) => requestBody(init));
    expect(bodies.map(body => body.model)).toEqual(['qwen-vl-ocr', 'qwen-vl-ocr', 'qwen3.8-flash']);
    expect(prompt(bodies[2])).toContain(prompt(bodies[0]));
    expect(prompt(bodies[2])).toContain('"total_price_vnd"');
    expect(prompt(bodies[2])).toContain('Repair only these validation failures:');
    expect(prompt(bodies[2])).toContain('INVALID_RESPONSE');
  });

  it.each(tasks)('preserves an explicit extraction prompt when repairing %s', async (task) => {
    const promptOverride = 'Extract only visible food into JSON with items, raw_name, estimated_quantity, unit and confidence.';
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response('{not-json'))
      .mockResolvedValueOnce(response(extracted));
    const runtime = new QwenTaskRuntime({ qwenApiKey: 'test-key', qwenOnly: true });

    await runtime.generate({ task, input: { imageBase64OrUrl, promptOverride } });
    const bodies = fetchMock.mock.calls.map(([, init]) => requestBody(init));
    expect(prompt(bodies[0])).toBe(promptOverride);
    expect(prompt(bodies[1])).toContain(promptOverride);
    expect(prompt(bodies[1])).toContain('INVALID_RESPONSE');
  });
});
