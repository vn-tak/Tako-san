import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';

// Synthetic stress catalog matching the existing bounded-search fixture; not a CPU SLA.
const vite = await createServer({ server: { middlewareMode: true } });
try {
  const { composeMeal, COMPOSITION_BUDGET } = await vite.ssrLoadModule('/packages/recipes/src/composition/composer.ts');
  const roles = ['main', 'side', 'vegetable', 'soup', 'staple', 'dessert'];
  const file = 'packages/recipes/src/composition/composer.ts';
  const source = readFileSync(file, 'utf8');
  const base = execFileSync('git', ['show', `6f6eaaab518cf2430de225d0be73d695b40706e4:${file}`], { encoding: 'utf8' });
  assert.equal(source, base, 'Composer changed: rerun a genuine base comparison before claiming unchanged algorithm');
  const results = [];
  for (const size of [71, 320, 500]) {
    const candidates = Array.from({ length: size }, (_, index) => {
      const id = `r${String(index).padStart(3, '0')}`;
      return { key: `recipe:${id}`, kind: 'recipe', id, title: id, roles: [roles[index % 6]],
        traits: index % 6 === 3 ? ['brothy'] : [], dominantIngredientId: `protein-${index % 9}`,
        preference: (index % 17) / 17, coverage: (index % 5) / 4, missingIngredientIds: [],
        inventoryIngredientIds: [`${id}-ing`], ingredientIds: [`${id}-ing`], cookMinutes: 20 };
    });
    const run = () => composeMeal({ mealType: 'dinner', fixed: [], rolesToFill: ['main', 'vegetable', 'soup', 'staple'], candidates, variant: 0, maxOptions: 3 });
    const expected = JSON.stringify(run());
    for (let warm = 0; warm < 20; warm++) run();
    const samples = [];
    const memory = process.memoryUsage().heapUsed;
    const cpu = process.cpuUsage();
    for (let sample = 0; sample < 200; sample++) {
      const started = performance.now();
      const result = run();
      samples.push(performance.now() - started);
      assert.equal(JSON.stringify(result), expected);
      assert.ok(result.budget.partialsExplored <= COMPOSITION_BUDGET.maxPartials);
      assert.ok(result.budget.scoringOperations <= COMPOSITION_BUDGET.maxScoringOperations);
    }
    samples.sort((a, b) => a - b);
    results.push({ datasetCandidates: size, samples: samples.length, medianMs: samples[100], p95Ms: samples[189],
      p99Ms: samples[197], maxMs: samples[199], cpuMicros: process.cpuUsage(cpu),
      heapDeltaBytes: process.memoryUsage().heapUsed - memory, budget: run().budget, options: run().options.length });
  }
  console.log(JSON.stringify({ node: process.version, platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model,
    comparison: 'Base and final composer source byte-identical; no algorithm/scoring change',
    composerSHA256: createHash('sha256').update(source).digest('hex'), results,
    limits: COMPOSITION_BUDGET, note: 'Pure domain stress; 500 bypasses pool builder for stress only. Production pool still capped at 320. Heap delta includes GC; no cost or production latency inference.' }, null, 2));
} finally { await vite.close(); }
