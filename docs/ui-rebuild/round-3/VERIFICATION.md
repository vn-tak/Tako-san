# UI03 local verification — 2026-10-10 JST

Source: canonical `vn-tak/Tako-san`, base `87cfbdf1b2e1164f3cb9a122d8613ed52d140c3b`.
Local checkout/branch recorded in FOUNDATION/task packet. Node24.16.0, pnpm10.33.2.
Existing frozen dependencies, no package/lockfile changes. Implementation hash is
recorded in the documentation checkpoint after committing verified source.

## Executed focused and browser checks

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui03-discovery.test.ts tests/integration/ui03-discovery-api.test.ts tests/unit/ui02-surfaces.test.tsx tests/unit/ui02-presentation.test.ts tests/integration/frontend-ui-integration.test.tsx tests/unit/recipe-media-presentation.test.ts tests/unit/client-session.test.ts
```

Final:7files/163tests PASS,0FAIL,4.41s; `.artifacts/ui03/focused-final.log`.
Covers21page/500unique coverage, deterministic tie ordering, search pastpage1,
accent/ingredient search, hard filters, exact no-buy/duplicate-demand/context units,
strict inventory503/KV bypass, legacy API compatibility, source/filter/page-size/
stock/household cursor409, malformed400, no-auth401/owner/membership403, session
race, scoped invalidation, offline/device label and neutral/canonical media fallback.
Mounted URL/history/detail-return/focus/stale-recovery/old-response cases retained.

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage WRANGLER_SEND_METRICS=false PORT=5197 PREVIEW_API_PORT=8897 PREVIEW_APP_URL=http://127.0.0.1:5197 PREVIEW_T20_D1=true PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui03-browser-check.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH node scripts/ui03-media-audit.mjs
```

Final browser exit0;15actual axe/layout checks,17PNG,0violations/overflow/brokenimages/
pageerrors. Service worker blocked, external network aborted, reduced motion enabled.
Local real Worker/SQLite/cookie user, catalog500; no remote data/credentials.
12journeys: Home3, all500 unique, page reload, detail/back, accent search beyond24,
filters reload, real local inventory PATCH→cursor409→restart/focus, direct page clamp,
empty,503no-fallback, device source and invalid-link recovery.
Final `.artifacts/ui03/browser-final.log`; data/measurements in
`evidence/browser-observations.json`. Source media audit output copied into evidence;
13local assets visually reviewed via contact sheet;8mapped existing files have
bytes/dimensions/SHA256 in the report. One referenced file is missing. URL reuse
and duplicate hashes are recorded separately.
Screenshots reviewed for mobile and desktop; compact neutral media revised after
initial first-card title fell below fold. Final browser and focused tests rerun.
Preview own PID34259 stopped before full gate; no server left running by this task.

## Failures and repairs

- First typecheck: legacy card nutrition access incompatible with summary DTO.
  Keep nutrition only when legacy recipe actually has that field; no fake zero.
- Initial focused25FAIL/25PASS:22API cases used a too-short test JWT secret, rejected
  by existing auth configuration;3schema/client tests found contradictory legacy
  fixture `canCookWithoutBuying=false` with zero missing lines. Corrected test
  fixtures/secret; did not relax validation/auth/quantity assertions.
- Next focused128PASS/2FAIL: test queried nonexistent category columns on
  `recipe_classifications` instead of runtime presentation fields; mounted route
  defaulted to `/` while expectation was `/recipes`. Corrected setup to real schema/
  route. Next162PASS/1FAIL expected quantity satisfaction in `matchPercentage`;
  existing contract is ingredient coverage:2of4eggs still100%coverage but no-buyfalse.
  Corrected expectation, retaining missing1/no-buyfalse and exact quantity tests.
- Typecheck found test cast to global KVNamespace incompatible with Env import.
  Use `Env['CACHE']` at fixture boundary. No runtime/capability change.
- Browser first: Home section contained2navigation links beyond3recipe cards.
  Restrict selector to recipe links. Second: local PATCH used expectedVersion;
  actual legacy contract requires version. Corrected harness, preserving mandatory
  precondition and optimistic mutation behavior. Third full browser PASS. After
  compact placeholder refinement, final full browser PASS again.
- Existing static renderer emits expected React useLayoutEffect warnings. No
  warnings/assertions suppressed, timeout raised, tests removed or dependency changed.

## Full repository gate

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

First full gate: typecheck/lint PASS;265files/6467tests PASS,1FAIL (266files/6468total),
323.82s. The T14D unknown-static-reader guard found the new explicitly designed
browser offline service missing from its allowlist. Added that exact frontend
reader and an authority-audit addendum referencing ADR-046. Guard expectation
`unknown readers=0`, Worker authority constraints and client503/session/source
assertions are unchanged. Focused authority/client2files/20tests PASS,1.13s:
`pnpm exec vitest run tests/unit/recipe-catalog-authority.test.ts tests/unit/ui03-discovery.test.ts`
with Node24 and NODE_OPTIONS=--no-experimental-webstorage;
`.artifacts/ui03/authority-focused.log`. No runtime source changes after browser verification.
Final full gate exit0:266files/6468tests PASS,0FAIL,321.24s. Typecheck, lint,
migration smoke and build PASS. Runtime/test/script23file SHA256 manifest verified
unchanged after the final run (`.artifacts/ui03/final-source-sha256.json`). Final
build main454.93kB/gzip126.63kB; Home11.74/gzip4.28; Recipes9.72/gzip3.84. These
are build sizes, not field performance. Main grows5.99kB raw/1.99kB gzip from UI02;
summary/paging validation is additive and the legacy offline bank remains bundled.
No claim of overall JS bundle reduction. Remote schema/Week gates skipped.
Includes typecheck, lint, full Vitest, migration smoke and production asset build.
Logs `.artifacts/ui03/full-check-first.log` and `.artifacts/ui03/full-check-final.log`. Remote schema/Week gates are not enabled.

## Limits

No CWV/production latency/bandwidth or D1 CPU benchmark; gzip computed from raw JSON
locally. All500 catalog content still participates in ranking. Local media report
is fresh migration replay, not current production coverage. Six allowed legacy
mappings are not license/provenance certification. No hosted CI, physical device,
Safari/VoiceOver/NVDA or usability run. Raw catalog/payment/auth/commands/schema/
flags/infra unchanged. Review/CI/release and full brand/remaining routes remain open.

Verified implementation: `dbba0535f66b585ff3bdedb27894ee72b57872d1`.
Only documentation follows the final full gate and this implementation commit.
