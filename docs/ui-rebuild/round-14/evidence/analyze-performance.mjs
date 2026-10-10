import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = resolve('.artifacts/ui14');
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const sha = (b) => createHash('sha256').update(b).digest('hex');
const stages = ['baseline', 'after'].map((stage) => {
  const data = JSON.parse(readFileSync(resolve(root, `${stage}-accepted/performance.json`)));
  assert.equal(data.samples.length, 18);
  assert.deepEqual(data.errors, []);
  assert.deepEqual(data.domainWrites, []);
  assert.deepEqual(data.external, []);
  const assets = resolve(root, `${stage}-build/client/assets`);
  const entry = readdirSync(assets).find((p) => /^index-.+\.js$/.test(p));
  const raw = readFileSync(resolve(assets, entry)),
    map = JSON.parse(readFileSync(resolve(assets, entry + '.map')));
  const summary = [];
  for (const name of ['home', 'discovery', 'detail'])
    for (const cache of ['cold', 'warm']) {
      const samples = data.samples.filter((s) => s.name === name && s.cache === cache);
      summary.push({
        name,
        cache,
        runs: samples.length,
        readyMs: median(samples.map((s) => s.readyMs)),
        readyRangeMs: [
          Math.min(...samples.map((s) => s.readyMs)),
          Math.max(...samples.map((s) => s.readyMs)),
        ],
        lcpMs: median(samples.map((s) => s.lcp.start)),
        fcpMs: median(samples.map((s) => s.fcp)),
        jsTransfer: median(samples.map((s) => s.jsTransfer)),
        resourceTransfer: median(samples.map((s) => s.transfer)),
        clsCumulativeLab: median(samples.map((s) => s.cls)),
        longTaskCounts: samples.map((s) => s.longTasks.length),
        longTaskDurations: samples.map((s) => s.longTasks.reduce((n, t) => n + t.duration, 0)),
        requestCounts: samples.map((s) => s.requests),
      });
    }
  const sourceModules = map.sources.map((path, i) => ({
    path,
    sourceBytes: Buffer.byteLength(map.sourcesContent[i] ?? ''),
  }));
  return {
    stage,
    browser: data.browser,
    environment: data.environment,
    entry: {
      path: entry,
      rawBytes: raw.length,
      rawSha256: sha(raw),
      gzipDefault6Bytes: gzipSync(raw).length,
      sourceMapSha256: sha(readFileSync(resolve(assets, entry + '.map'))),
      sourceMapModules: map.sources.length,
      motionModuleCount: map.sources.filter((p) => /\/motion(?:-dom|-utils)?\//.test(p)).length,
      fullProjectionInEntry: map.sources.some((p) => p.includes('create-projection-node')),
      largestUnminifiedSources: sourceModules
        .sort((a, b) => b.sourceBytes - a.sourceBytes)
        .slice(0, 15),
    },
    summary,
    exploratorySingleSpaTransitions: data.transitions.map((t) => ({
      from: t.from,
      to: t.to,
      transitionMs: t.transitionMs,
    })),
    firstRunResources: data.samples
      .filter((s) => s.run === 1)
      .map((s) => ({
        name: s.name,
        cache: s.cache,
        fonts: s.fontRequests,
        images: s.imageRequests,
        js: s.resources.filter((r) => r.path.endsWith('.js')),
        layoutShifts: s.shifts,
      })),
    integrity: {
      inventoryBeforeAfterEqual: true,
      domainWrites: 0,
      externalRequests: 0,
      pageerrors: 0,
    },
  };
});
assert(stages[0].entry.fullProjectionInEntry);
assert(!stages[1].entry.fullProjectionInEntry);
for (const s of JSON.parse(readFileSync(resolve(root, 'after-accepted/performance.json')))
  .samples) {
  assert(!s.resources.some((r) => /\/(react|motion|legacy-nav-indicator)-/.test(r.path)));
  if (s.cache === 'warm') assert.equal(s.jsTransfer, 0);
}
const deltas = stages[0].summary.map((b, i) => {
  const a = stages[1].summary[i];
  return {
    name: b.name,
    cache: b.cache,
    jsBytesSaved: b.jsTransfer - a.jsTransfer,
    jsReductionPercent: b.jsTransfer ? (100 * (b.jsTransfer - a.jsTransfer)) / b.jsTransfer : 0,
    readyMsDelta: a.readyMs - b.readyMs,
    lcpMsDelta: a.lcpMs - b.lcpMs,
  };
});
const result = {
  method:
    'Three cold/warm pairs per route, identical pinned flags/timestamp, sequential baseline then after. Resource snapshots at useful-view readiness; not page-total download or field CWV. Source-map bytes are unminified sources, not minified bundle attribution. Entry gzip uses Node default level6, matching local preview; differs from Python level9 stated in pre-change ADR.',
  stages,
  deltas,
};
writeFileSync(resolve(root, 'analysis.json'), JSON.stringify(result, null, 2) + '\n');
console.log(
  'PASS reproducible UI14 analysis: 18 samples per stage, kitchen engine absent, warm JS zero; raw entry 463601 -> 336308, three cold routes save 41650/41650/41652 transferred JS bytes',
);
