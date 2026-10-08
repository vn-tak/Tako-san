import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { AutoOptionsDtoSchema, PickerPageDtoSchema } from '../../packages/domain/src/meal-composition-api';
import { MealPlanDtoSchema } from '../../packages/domain/src/meal-planning-api';
import { quietLogs, T20Harness, T20_INTENT } from '../helpers/t20-composition-harness';

vi.mock('../../src/worker/services/email', () => ({ sendEmail: vi.fn(), buildOtpEmail: vi.fn() }));
let harness: T20Harness | undefined;
afterEach(() => { harness?.close(); vi.restoreAllMocks(); });

it('500-recipe Worker generation/picker stay bounded in SQL, payload and search; generation never writes', async () => {
  quietLogs();
  const h = harness = new T20Harness();
  await h.seedHousehold('t20-performance');
  const created = await h.call('t20-performance', 'POST', '/meal-planning/plans', T20_INTENT);
  expect(created.status).toBe(200);
  const plan = MealPlanDtoSchema.parse(created.json);
  const slot = plan.result.meals[0].slotId;
  const requests = [
    { name: 'picker', method: 'GET', path: '/meal-planning/compositions/picker?role=main&limit=24', body: undefined },
    { name: 'auto', method: 'POST', path: `/meal-planning/plans/${plan.id}/slots/${encodeURIComponent(slot)}/auto`, body: { revision: plan.revision } },
  ];
  const evidence = [];
  let limiterClock = Date.now();
  vi.spyOn(Date, 'now').mockImplementation(() => limiterClock);
  for (const request of requests) {
    const timings: number[] = [], queries: number[] = [], payloads: number[] = [];
    for (let index = 0; index < 23; index++) {
      // Keep the real limiter active, but sample each call in a separate minute window.
      limiterClock += 61_000;
      let statements = 0;
      h.db.hooks.beforeStatement = () => { statements++; };
      h.db.hooks.beforeBatch = (batch) => { statements += batch.length; };
      const started = performance.now();
      const response = await h.call('t20-performance', request.method, request.path, request.body);
      const elapsed = performance.now() - started;
      expect(response.status).toBe(200);
      expect(statements).toBeLessThan(100); // Hydration batches; a 500-row N+1 would violate this.
      if (request.name === 'auto') {
        const result = AutoOptionsDtoSchema.parse(response.json);
        expect(result.options.length).toBeLessThanOrEqual(3);
        expect(result.budget.scoringOperations).toBeLessThanOrEqual(2400);
        expect(result.budget.partialsExplored).toBeLessThanOrEqual(1200);
      } else expect(PickerPageDtoSchema.parse(response.json).items).toHaveLength(24);
      if (index >= 3) { timings.push(elapsed); queries.push(statements); payloads.push(Buffer.byteLength(JSON.stringify(response.json))); }
    }
    timings.sort((a, b) => a - b);
    // The periodic sessions_v2 last_seen heartbeat adds one statement; catalog reads stay bounded.
    expect(Math.max(...queries) - Math.min(...queries)).toBeLessThanOrEqual(1);
    evidence.push({ endpoint: request.name, samples: timings.length, medianMs: timings[10], p95Ms: timings[18], maxMs: timings[19],
      statementsPerRequest: { min: Math.min(...queries), max: Math.max(...queries) }, maxPayloadBytes: Math.max(...payloads), authorityCacheResetEachRequest: true, limiterWindow: 'one minute per independent sample' });
  }
  expect(h.db.query('SELECT revision FROM generated_meal_plans WHERE id = ?', plan.id)[0].revision).toBe(plan.revision);
  expect(h.db.query('SELECT count(*) AS count FROM generated_meal_plan_compositions')[0].count).toBe(0);
  if (process.env.T20_BENCHMARK_OUT) {
    const file = process.env.T20_BENCHMARK_OUT;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ node: process.version, catalog: 500, database: 'real local SQLite D1 adapter',
      evidence, note: 'Local Worker wall time includes SQL, hydration and safety. Not hosted CPU time or SLA.' }, null, 2), { mode: 0o600 });
  }
}, 30_000);
