# UI04 verification - local evidence

Repository: canonical `vn-tak/Tako-san` (ID1385308553).
Checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.
Branch `codex/ui-rebuild-foundation`; base `cf607e4f402aecd0964b2f730bb2c9e1c6b17b0d`.
Date2026-10-10JST. Node24.16.0; existing lockfile and dependencies retained.

## Focused checks

With `PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage`:

```sh
pnpm exec vitest run tests/unit/ui04-scan-offline.test.ts tests/unit/ui04-camera-lifecycle.test.tsx tests/unit/ui02-presentation.test.ts tests/unit/t13b-fridge-review.test.tsx tests/unit/t13b-fridge-hardening.test.tsx tests/unit/t13b-receipt-review.test.tsx tests/unit/t13r-a-receipt-ownership.test.tsx tests/unit/scan-ui-quota.test.tsx tests/unit/scan-processing-state.test.tsx tests/unit/scan-privacy.test.tsx tests/unit/receipt-review-polling.test.tsx tests/unit/scans.test.ts tests/integration/t13b-review-roundtrip.test.tsx
```

Final focused: 13 files / 188 tests PASS, 3.48s, log
`.artifacts/ui04/focused-final.log`. Nullable test-only assertion corrected earlier;
Earlier `pnpm exec vitest run tests/unit/ui04-scan-offline.test.ts`1 file/10 tests PASS,761ms,
log `offline-final.log` (before later source refinements). Final focused includes all10
offline regressions and the later image-input cancellation regression;
full gate follows the final source, including zero-import pendingSync semantics.
Tests preserve server/session/household/raw/expiry/price/rejection/conflict checks.
New meaningful coverage: accepted invalid quantity including programmatic submit,
invalid discarded draft rejection, pendingSync UX and queued-draft cleanup on leaving, explicitly bound source image,
request time not advancing stages, canceled delayed image read on mode switch,
camera opened/late-stream cleanup, offline
accepted-only imports, quantity validation before partial mutation, stable retry,
all-rejected imports 0 with pendingSync false and estimate qualifier in outbox/local expiry presentation.

## Actual browser

Start isolated local Worker/SQLite/Vite, AI mock, no production credentials:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage WRANGLER_SEND_METRICS=false PORT=5197 PREVIEW_API_PORT=8897 PREVIEW_APP_URL=http://127.0.0.1:5197 PREVIEW_T20_D1=true PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
```

Run harness:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui04-browser-check.mjs
```

Final exit0; 29 axe/layout checks, 51 PNG, 8 journey groups, 0 WCAG2A/AA/2.1AA axe
violations/overflow/brokenimages/pageerrors. Service worker blocked, outbound
network aborted. `evidence/browser-observations.json` gives exact states, URL,
field font/heights, motion and results. Be Vietnam Pro loaded, inputs≥16px/44px;
reduced motion disables processing effects. All 52 evidence payload files have verified
SHA256/size in manifest. Screenshots of mobile/desktop/expanded source/pending-sync
visually inspected; mobile guide was reduced after the first screenshot review.

| Matrix / journey | Evidence |
| --- | --- |
| Photo and receipt review320/390/768/1024/1440 |10 checks, native forms and navigation fit |
| Camera denied and receipt mode390, desktop1440 | Gallery reachable; no real camera access claim |
| Synthetic64px image upload with held response | After3s still sending; no false queue/validation advance; matching receipt image preview |
| Real local Worker photo confirmation |Fractional 1.5, freezer, supplied 2030-12-31, blank rejected row, manual 0.25 pack; persisted rejection and confirmed reopen |
| Repeat synthetic image in another mode | Same file selected again, new photo route, matching photo source preview |
| Manual sheet | Labelled dialog, Escape and trigger focus restored |
| Real local Worker receipt confirmation |Fractional 0.25, freezer, supplied expiry, reject/restore, OCR evidence and prices; confirmed reopen |
| Synthetic lifecycle states | Pending→failed; mismatched receipt hides private row; empty review disables confirm |
| Synthetic lost-confirm-response | Outbox/pendingSync shown; edits and repeated confirm disabled; committed SPA navigation to inventory then return triggers a fresh server read and confirmed read-only review |
| Low-height390×420 | In-flow action; no simulated keyboard claim |
|320px enlarged text | Actual computed font sizes doubled individually; no compounded percentage inheritance or horizontal overflow |

320px is a reflow-equivalent width for1280/400%; no actual browser zoom, iOS/Android
keyboard, safe-area device, Safari, physical camera, screen-reader or usability test.
Server and source-bound images here are synthetic local fixtures. Real AI OCR
accuracy/provider latency/quota certification and remote D1/R2 state not measured.

Own preview PIDs 37064, 89197, 40560 and 92179 stopped with SIGTERM before their full gates; browser closed in
finally. Final browser source includes queued-draft cleanup, duplicate receipt-error removal and zero-import sync semantics.

## Failures and repairs

- First typecheck: `ReviewValues` permits blank quantity; spreading it into old
  numeric-only draft caused TS2345. Draft now models `number | ''`; no0fallback.
- First focused:124 PASS / 7 FAIL, all confirmed header expectations. Shared heading
  lacked terminal read-only subtitle; restored it in the actual UI, retained tests.
- Next focused:1 FAIL after hiding redundant ready banner also hid the empty-ready
  message. Retained the useful empty state; no test removal.
- First browser reached14 checks then selected a wrapping select label containing
  option text, rather than just 'Bảo quản'. Added explicit accessible names to
  shared controls and used exact combobox names in harness.
- Second browser encountered malformed JSX from a scripted banner wrap; fixed the
  extra closing brace before continuing. No config/suppression/timeout workaround.
- Third browser completed25 checks then artificial font override overflowed. Its
  inherited200% rule multiplied font sizes across parent/child; changed to doubling
  each element's original computed size. Added min-width/wrapping in header and
  flexible action heights. Final enlarged text layout PASS.
- Native quantity0 became valid with min0 even though app guard correctly blocked
  it. Set native min to Number.MIN_VALUE, preserving any representable positive
  quantity and rejecting0; retained native checkValidity regression.
- First full gate stopped at TS18047: new service test read `result.importedItemsCount`
  from nullable service union. Assert exact object via toMatchObject;1 file/10 tests
  passed, then reran full gate. No runtime or validation relaxation.
- Final source reread: mode switch could leave an unfinished private image read
  active; native file input also retained its value. Cancel on mode/new image and
  clear input value. New component regression and repeat browser upload of the
  same synthetic file pass; final full gate rerun after this change.
- Post-gate lifecycle reread: pending notice was local while the ready draft stayed
  in the store after leaving review. Added session/scan-fenced unmount cleanup;
  regression asserts cleared draft and browser SPA return rehydrates confirmed
  server state. Final full gate rerun after this concrete source change.
- SPA return browser initially failed: the URL had changed to inventory while
  its lazy screen had not committed, so immediate return retained the mounted
  review. Harness now requires the actual inventory heading before returning;
  it still asserts a fresh server read and confirmed read-only state. Complete
  29-check runs pass, including the final source. No weakened assertion/timeout.
- Final presentation reread removed the receipt page's duplicate inline error;
  shared ReviewFields supplies the single validation alert. Focused188 and final
  browser29 checks rerun after that source change.
- Last offline semantics reread: after skipping every rejected synthetic row,
  importedItemsCount was0 and no operation was queued, yet pendingSync remained
  true. Return pendingSync false for zero imports; existing all-rejected regression
  now asserts success/count0/no pending operation. Focused188, browser29 and full
  gates rerun after the fix. Prior full6490PASS/321.06s retained in
  `full-check-before-zero-import-fix.log`.
- Static UX skill diagnostic executed:126 files, 28 issues, 834 warnings, 68 checks;
  prints STATUS:FAIL although exits0. Includes test-source/legacy protected files
  and heuristic suggestions for invented social proof/discounts. This is not an
  accessibility/usability pass and is not used to justify unrelated edits. Actual
  browser axe/layout remains the evidence for UI04's tested states. Log
  `.artifacts/ui04/static-ux-audit.log` retained.

## Full repository gate

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Full before final input refinement: exit0, 268 files / 6489 tests PASS, 333.84s;
lint/typecheck/migration smoke/build PASS (`full-check-before-input-fix.log`).
Before queued-draft cleanup: full exit0,268files/6490tests,323.64s
(`full-check-before-pending-cleanup.log`). After cleanup/SPA return and receipt
error cleanup: full exit0,268files/6490tests,321.06s
(`full-check-before-zero-import-fix.log`).

Final gate on the final source (including zero-import sync semantics): exit0,
268 files / 6490 tests PASS, 0FAIL, Vitest duration 324.11s. Typecheck,
lint, fresh migration smoke and Vite/Worker build PASS. Log
`.artifacts/ui04/full-check-final.log`; initial failed gate `full-check-first.log`.
Main455.38kB/gzip126.78; Scan13.26/5.09; photo review13.49/4.91; receipt review13.53/4.63.
These are local build sizes, not CWV/production-transfer or a bundle-reduction claim.

Runtime/tests/scripts 19 files SHA256 frozen before final gate and unchanged after
execution and before implementation commit. All52 evidence payload SHA256/size
verified again after final browser; preview92179 and both preview ports stopped.
Full diff (including untracked components/tests/script/docs/evidence) reviewed;
protected runtime paths unchanged. No dependencies/config/migrations/flags/
Worker/payment/auth/Week-command changes. No remote gates or deploy authorized.
Production release and independent/hosted review remain separate.

Targeted Prettier 18 files PASS; final input/script refinement 3 files PASS; final receipt/harness formatting 2 files unchanged; final service/offline-test 2 files unchanged. git diff --check PASS. Existing global CSS
import style retained; protected path review finds no Worker/auth/payment/schema/
config/lockfile changes. Final source image checks cover both receipt and photo.
