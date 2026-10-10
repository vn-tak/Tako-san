# UI14 - Verification and failure record

2026-10-11 JST; canonical vn-tak/Tako-san; base
`f3a09f2a7beb548fbd4bc9ef8ae932a092dd3827`. No push/PR/merge/deploy or remote DB/media
operation. All preview state is synthetic, isolated and local.

## Accepted checks actually executed

- Fixed baseline and after production builds: Node24, both Planner flags false,
  BUILD_TIMESTAMP=2026-10-10T21:30:00.000Z, `pnpm build`, exit0. Pin all382 baseline /
  387 after file bytes and hashes. Full-check build below uses its own timestamp;
  accepted performance measures use pinned copies, not a changed dist.
- `UI_REBUILD_OUT=.artifacts/ui14/baseline-accepted node scripts/ui14-performance-check.mjs`
  and same command with URL5217/STAGEafter/OUTafter-accepted: each exit0,18 samples
  (3runs×3routes×cold/warm), plus2exploratory single-sample SPA transitions. Actual
  browser153.0.8010.12; throttling/cache/bootstrap details in PERFORMANCE/data.
- `node docs/ui-rebuild/round-14/evidence/analyze-performance.mjs`: exit0. Raw entry
  463601→336308; gzip6 129276→87619. Cold transferred JS savings41650/41650/41652B;
  kitchen requests no optional engine, warm JS transfer0. Source-map entry loses
  full projection/drag graph. Local timing/CLS limits retained.
- Focused Vitest: `pnpm exec vitest run tests/unit/ui14-deferred-nav.test.tsx
tests/unit/ui12-recipe-media.test.tsx tests/integration/frontend-ui-integration.test.tsx`:
  PASS3files/56tests/3.17s;5new meaningful cases for pending links/static state,
  concurrent identities/shared promise, import failure/remount, abandoned receipt,
  StrictMode/current prop. Full check reruns these after appendChild correction.
- Browser final `UI_REBUILD_OUT=.artifacts/ui14/browser-settled node scripts/ui14-browser-check.mjs`:
  PASS50snapshots/5journey checks. Sevenwidths320/360/390/430/768/1024/1440;
  Home/discovery/detail, computed textx2 at320/768, short390×420/768×420,
  combined320×420x2;3detail panels at320/768 textx2; stock/Week/shopping/account/
  settings family smoke; normal-motion snapshots of3recipe routes. Tabs Home/End/
  Arrow, native roots Tab/Enter, filter→card Enter→Back→reset, focus clear chrome.
  Final applicable axe/overflow/broken images/nav overlap/recipe clipping/pageerrors0.
  Snapshot work waits finite Animation.finished; animation-time failure retained.
- Actual isolated legacy component fixture uses unchanged production components,
  MemoryRouter and same MotionProvider; no application payment/auth route visited.
  `UI_REBUILD_OUT=.artifacts/ui14/legacy-final node scripts/ui14-legacy-check.mjs`:
  PASS4journeys, chunk delayed/failed × normal/reduced. Immediate aria-hidden static
  highlight, native keyboard links work while blocked, one chunk request, loaded
  normal animation, failure remains usable. Reduced projection settles after first
  frame; do not claim zero spatial frames.
- Exact Git baseline component frame probe:
  `UI14_LEGACY_BASELINE=true node scripts/ui14-legacy-preview.mjs`, then
  `node scripts/ui14-motion-probe.mjs`: PASS2normal/reduced probes. Baseline and after
  reduced both first-frame translate3d(-189px,0,0), nextframe none. No new regression.
- Combined short supplemental `node .artifacts/ui14/short-probe.mjs`: PASS3tabs above
  nav after waiting shell ResizeObserver measurement +twoRAF. Source archived at
  evidence/short-probe.mjs. Nav237.375px; header136.1875px; document2538px. Scroll and
  focus work, poor reading area retained as UI15 finding. First probe FAIL preserved.
- Full configured command (Node24 PATH):
  `CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2
VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`:
  **PASS exit0;288files/6742tests;Vitest370.67s;typecheck/full lint/local migration
  smoke/Vite3.74s/Worker TypeScript PASS.** Remote schema and Week gates skipped by
  default. No separate hosted/browser-project E2E runner result claimed.
- Final targeted ESLint exit0 and Prettier check PASS for new runtime/test/fixture/
  harness/analysis code. Existing App/navigation/helper formatting intentionally
  retained, with exact narrow diff. Fresh guideline retrieval and React heuristic
  exit0; React0critical/0warnings is a limited static helper, not bundle acceptance.
- Fresh dependency audit41advisories:4low/19moderate/16high/2critical; audit exit1.
  Generic UX wholefolder167/41issues/1181warnings/90checks FAIL; scoped src/web108/
  23issues/734warnings/54checks FAIL. Raw results retained, no whole-product UX PASS.

Measured performance and final read journeys: inventory JSON before/after equal;
zero measured browser domain writes/external requests/pageerrors. Browser geometry
fixture setup cookie login/preferences PATCH are excluded and recorded separately.
Failed optional chunk requests are deliberate probes, not external/domain writes.

## Failed attempts and recovery

1. Initial performance APIRequestContext login303 then /me401 due browser-cookie
   context; recovered with actual browser login and verified cookie/user bootstrap.
   Auth protocol unchanged. Initial incorrect detail slug/selectors corrected from
   actual repo data before accepted runs.
2. Smoke baseline-second passes but SPA elapsed field was overwritten by document
   snapshot readyMs; fixed to distinct transitionMs before accepted three-run data.
   Keep smoke as historical evidence, don't use its transition time.
3. Browser-first filter "kimchi" yields0; correct UI search "kim chi" yields1.
   Harness change only; query/API/search semantics unchanged.
4. Full-first exits2: document.body.append overloaded by combined Worker/DOM types
   in new jsdom test. Replace append with appendChild, recovered full6742PASS.
5. Legacy-first strict locator selected both colored parent and decorative child.
   Use span.absolute to identify intended indicator. Legacy-recovered asserts no
   transformed frame at all, fails on1frame. Pin original navigation/provider from
   base Git via isolated fixture; identical1frame proves old behavior. Final asserts
   prompt settling plus policy/native navigation; not disabling reduced checks.
6. Browser-final mid-fade Home axe color-contrast FAIL; settled view geometry was
   clean. Final harness waits finite Animation.finished, retains failed screenshot/
   targets and reports transition contrast as residual. No runtime CSS change.
7. Short-first focus check FAIL: text expansion raced shell nav-height observation.
   Recovered waits measured nav equals real border-box before focusing. Geometry
   and screenshots retained, no artificial CSS fix or disabled obstruction check.
8. Lighthouse CLI unavailable; no score claimed and no dependency installed.
   Read-only searches of nonexistent historical filenames and shell glob produced
   inspection misses; actual existing source was read. Not application failures.

## Integrity and checkpoint protocol

396 source/test/script/config/generated/public records frozen and match after full
checks. New evidence utilities outside freeze are included in final payload manifest.
App bytes match base after reversing only provider import. Existing motion helper
source exact; all protected paths diffempty; public257 originals unchanged. Build
256 exact copies +one existing SW build-ID transform; not257byteidentical copies.

Owned previews stopped;5216/5217/5218/5219closed.41raw log/data receipts and4exact
raw gzip containers for baseline/after entry/maps archived. Final manifest excludes
mutable narrative docs, itself and later Git receipt. Source/build/evidence hashes
and the implementation commit are checked by a single sequential git cat-file
--batch before the documentation checkpoint. See GIT_VERIFICATION for final proof.

Device/Safari/nativezoom/keyboard/screenreader/usability/hostedCWV/real auth and
owner brand/photo rights remain open. Test success is not deployment authorization.
