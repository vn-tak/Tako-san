# UI05 verification - local synthetic evidence

Source: canonical vn-tak/Tako-san; branch codex/ui-rebuild-foundation; base edf2e9a.
Packet UI05-cooking.md and ADR-048. Status UI05_LOCAL_VERIFIED_REVIEW_REQUIRED.
Implementation checkpoint: `IMPLEMENTATION_HASH_PENDING`; verified hash recorded
in the documentation checkpoint after the coherent implementation commit.

## Executed focused and browser checks

Focused command (Node24, NODE_OPTIONS=--no-experimental-webstorage):
`pnpm exec vitest run tests/unit/ui05-cooking-state.test.ts tests/unit/ui05-cooking-voice.test.ts tests/unit/cooking-store.test.ts tests/unit/ui-rebuild-cooking.test.ts tests/unit/cooking-route-allocation.test.ts tests/unit/sync.test.ts tests/integration/t19-cooking-hard-restrictions.test.ts`
7files/70tests PASS,6.36s. Final log `.artifacts/ui05/focused-final.log`.

Browser command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui05-browser-check.mjs`
32axe/layout checks,55PNG,12journey groups,0axe/overflow/brokenimages/pageerrors.
Local security preview only, Chromium, vi-VN, Asia/Tokyo, service workers blocked;
external browser requests blocked. Matrix320/390/768/1024/1440,390x420 and doubled
computed text at320px. Evidence browser-observations.json has actual observations,
Worker response/remaining stock and command replay; manifest binds bytes/SHA256.
Normal step reveal and reduced-motion variants both inspected. Final browser log
`.artifacts/ui05/browser-final.log`. Screenshots visually inspected at mobile and
desktop, timer, pending status and enlarged text.

Real local Worker completion used125.5g of PORK_BELLY against250g+0.5kg compatible
stock; remaining624.5g. Same-key replay returns idempotentReplay and leaves every
lot/version unchanged. Mock boundaries cover503ambiguous retry with identical
payload/key,409insufficient inventory, failed/successful authoritative refresh,
late completion after SPA navigation, offline queue and hard safety rejection.
Actual local outbox exists before pendingSync feedback. Speech mocks exercise
multiple next/back/repeat/current timer/error/stopped callback. Playwright clock
checks elapsed time, pause/resume/expiry focus/aria-disabled and reset/live regions.
Other journeys: route alias/change, pending prior command recovery, empty steps,
missing recipe, no draft, explicit exit dialog and short viewport action reach.

## Full repository gate

Final command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`

PASS exit0:270files/6514tests,0FAIL;Vitest342.45s. Typecheck/lint/migration smoke/
build PASS. migration-smoke=ok; Vite build2.86s. Main456.42kB/gzip127.13kB;
CookingMode15.13/5.28kB. These are local build figures, not CWV/latency claims.
Log `.artifacts/ui05/full-check-final.log`.16runtime/test/script SHA256 values were
captured before gate and verified unchanged after final full success.57payload
files plus manifest were checked for matching bytes/SHA256. Own final preview PID40036 was stopped before this final full run;
previous own preview PIDs44846/45917 were also stopped.

## Failures and corrections

- Initial typecheck: error-message array inferred string-literal union. Explicit
  Array<string|null> fixed it. A scripted edit left the old availability import
  and added a stock argument to finishCompletion; corrected both actual errors.
- Initial focused tests2FAIL: recipe-demand helper requires positive quantities,
  but actual use must support0. Use strict session peek forzero/blank and take for
  positive amounts. Subsequent import typo caused13FAIL; corrected without changing
  any stock/conversion assertions. Final meaningful tests retain all regressions.
- Browser harness used an assumed fridge heading, dialog instead of alertdialog,
  assumed recipe-list heading and uppercase Trứng versus actual lower-case trứng;
  selectors were corrected to actual repository copy/semantics. No timeout increase.
- Bare dev-module import after HMR resolved another store instance and reported
  Draft lost; own preview restarted to clear HMR module timestamps. Frozen-source
  final run uses one module graph. This is test harness/dev-server evidence, not a
  production store persistence claim. SPA navigation is tested explicitly; a full
  document reload intentionally cannot preserve the in-memory draft.
- Visual inspection of320px doubled text found narrow numeric input despite no
  document overflow. Container query puts input/unit above +/- so125.5 remains
  legible; repeat browser matrix passed. Motion/readability QA complements axe.
- Supplemental frontend skill UX heuristic audit:128files/28issues/846warnings,
  72passed checks,printsFAIL/exit1. Includes test/CSS false positives, legacy and
  protected auth/payment surfaces; no claim of whole-repo static UX pass. Scoped
  web-design-guidelines review fetched fresh upstream rules; final cooking controls
  have labels,focus,dimensions,semantic navigation,local error copy and reduced
  motion. Existing deliberate disabled-invalid-confirm semantics remain.

- First full gate: typecheck/lint PASS,270files/6514tests with1FAIL/6513PASS,
  Vitest340.29s; combined command exit1 before migration/build. The existing
  `staging-d1-catchup-check.test.mjs:169` local Wrangler prefix-list check timed out
  at5000ms. No source/config/timeout/assertion changed. Isolated rerun of the same
  file32/32PASS,3.22s; that test955ms. The second full run was interrupted for a newly observed focus issue.
  Mutation errors were above the viewport after confirming at the bottom of the
  ingredient list. Focus now moves to the error; browser asserts focus and
  viewport visibility for503/409/safety failures. Focused/browser checks and full gate rerun after this source change with a
  refreshed frozen manifest; final full PASS270files/6514tests. Logs `full-check-first.log`, `wrangler-focused.log`, `full-check-interrupted.log`.

## Operational limits

No push/PR/merge/deploy or remote DB/R2/provider/credentials access. No schema,
migrations,dependency/config/production flags,Worker inventory command,tenancy,
PayOS/payment/auth/infrastructure changes. Local tests preserve safety/lot/revision/
idempotency/Week authority; this is not a production certification or final brand.
Private drafts/ambiguous keys remain in-memory; browser unload warning is limited
by the platform. Device Safari/actual zoom/keyboard/screen-reader/usability/CWV,
provider speech accuracy and background alarms remain unverified.
