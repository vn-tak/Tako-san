# UI11 - Local verification

Canonical vn-tak/Tako-san, checkout Tako-san-ui-rebuild,
branch codex/ui-rebuild-foundation, base13cef9f8e6dc72549071426ad98df70e0d16f4a4.
Local isolated Worker/in-memory SQLite with synthetic login/data, ports5206/8906
Planner ON and5207/8907 OFF. External API fetch blocked; browser off-origin blocked,
service workers blocked. No production provider credentials or remote writes.

## Executed checks

Node24 PATH=/opt/homebrew/opt/node@24/bin:$PATH. Chromium headless shell1243,
Playwright1.63,axe4.10.2; existing lock/config unchanged.

- Initial existing focused3files/40tests PASS1.82s. New focused initially2 assertions
  failed from attribute order,70passed; corrected assertions. Expanded1suite failed
  from eager KitchenHeader auth import in a pure route-scope unit; header moved
  to review pages, keeping AppLayout scope import pure. Recovery10files/172PASS10.39s,
  frozen10files/172PASS7.43s. Border-box observer recovery2files/32PASS1.25s.
- Typecheck and lint executed successfully in standalone runs; final full required.
- Restoring only explicit action marker/header JSX patches reproduces base bytes
  exactly for InventoryPage,RecipeDetailPage,ScanResultPage,ReceiptReviewPage and
  primitives. AppLayout scope/immersive declarations exact; App.tsx/protected
  paths byte-identical. lifecycle-proof.json retains records.
- 160 source/test/script/config/font/asset hashes frozen before recovered final full.
  One E2E boundary fixture now expects112px instead of80px at640/767; assertions
  and other checks retained. No timeout/config weakened.

Focused command:
`NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui11-navigation.test.tsx tests/unit/ui11-shell-measurement.test.tsx tests/unit/ui07-brand-shell.test.tsx tests/unit/ui08-onboarding-navigation.test.tsx tests/unit/takosan-brand.test.tsx tests/unit/ui08-route-scope.test.tsx tests/unit/ui09-route-scope.test.tsx tests/unit/ui10-week-routes.test.tsx tests/unit/ui02-presentation.test.ts tests/unit/t18c-keyboard-controls.test.tsx`
An extra guessed nonexistent ui04-scan-review path in the frozen invocation is
not counted as a test suite; actual executed count remains10files/172. Existing
scan/cooking/inventory/security suites are also required by final full.

Full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
Preliminary runs interrupted exit130 for direct visual action-label and padding
observer findings; none count as PASS. First completed full exit1:285files,6621PASS/53FAIL,6674 collected tests and
one suite not loaded,354.73s. Three receipt/privacy fixture mocks still targeted
unused TopBar; new KitchenHeader then pulled auth store/Link through intentionally
partial mocked dependencies. These fixtures now mock KitchenHeader presentation
only, preserving every receipt command/poll/privacy assertion; real chrome is
covered by UI11 tests/browser. Seven fridge confirmed-state assertions now query
header.review-heading instead of the first header. Recovery6files/115PASS2.28s; final focused14files/255PASS6.34s;
no runtime change or snapshot regeneration needed. Recovered completed full exit1:285files/6684PASS/1FAIL/6685total,389.92s.
The unchanged staging-d1-catchup-check Wrangler-local case timed out5000ms (same
residual as UI10); all UI11/scan/privacy/domain tests passed. Standalone reproduction32tests had31PASS/1timeout,50.01s. Wrangler debug
milestones locate46.44s between config flags and update banner, before local D1
execution. CLI source awaits updateCheck before that banner; local D1 then completes
in about300ms. CI/debug reproduction32PASS3.41s,affected test976ms,unchanged source/
dependency/config/timeout. This isolates update-check startup delay; network/cache
variability remains. A newly launched full was interrupted130 to diagnose this
standalone failure; final full rerun PASS (details recorded next). Three interrupted full attempts
and two completed failed full runs remain archived.

## Running-app evidence

Accepted Planner ON:115 checked snapshots/16journeys plus one public-entry PNG.
Home,stock list/detail/edit,photo+receipt review,recipe,Planner,shopping,account,
preferences/planning settings across320/360/390/430/768/1024/1440. Additional computed
text x2 at320/768,short390x420/768x420,combined320x420text2; applicable axe0,
horizontal overflow0, broken image0, navigation label overlap/clipping0 and one rendered brand
lockup. Actual bar height81px at360+,about88.6 at320,about237.4 at text x2.
No hidden labels or reduced fonts. Short viewport releases sticky header/actions.

Real local journeys: keyboard five-root navigation and header Scan,inventory add
sheet Enter/Tab/Escape/focus-return,detail edit/cancel,recipe Cook to immersive,
focused shopping/edit/settings/review controls clear measured chrome; text2 field
focus clears chrome; short rail Scan scrolls into view; normal/reduced motion.
Every field of the returned inventory JSON matches before/after and zero domain
mutations during read/navigation. Signed-out public entry loads320 without overflow.

Synthetic checks explicitly separate: actual computed-font doubling,34px nav
padding simulates safe-area contribution,dispatching offline/online events exercises
banner layout while transport remains local online. Border-box observer receives
padding-only height changes. These do not certify native zoom,hardware insets,
virtual keyboard or offline durability.

Retained failed rounds: transient session h1,missing select/input selectors,HMR
keyboard interruption and screenshots captured before4 scan rows,sticky fieldset
Save overlap,compressed recipe/scan labels,padding change mismatch30px. Final browser
waits complete route and4rows before screenshot. Logs/checks/baseline/failure images
remain; successful frozen source differs only as explicitly documented.

Planner OFF accepted:24snapshots/1journey, seven widths plus computed x2 and
short/combined states. Local API planner returns404 and full inventory JSON stays
identical; zero read/navigation writes. ON alias script:7real browser redirects,
no Week write/pageerror. Existing keyboard/clearance/boundary E2E:19PASS/5SKIP39.6s
across six projects. Five skips are existing once-only breakpoint duplication;
actual639/640/767/1024 boundary runs once and passes. The initial boundary test
failed after shell assertions because it still demanded a mascot removed in UI08.
Its public-entry segment now asserts real logo/h1/no-nav and stacked heading/actions/
flow at640/767, retaining geometry coverage. It changes tests only; supplementary
post-E2E type/lint PASS covers this update during full run. The initial failed E2E
log is retained; Playwright cleared its failed screenshot on recovery. Final
successful screenshot artifacts and report are archived; no timeout was weakened.

## Review and limits

Fresh guideline source and INTERFACE_REVIEW record resolved/residual findings.
Generic UX accepted audit:154files/30issues/977warnings/85checks,exit1/STATUS FAIL.
Earlier audit980warnings; final fixture recovery977. The added measurement fixture has a named aria-label input; the heuristic still
flags it as no label. Existing test/payment fixtures and hero/social-proof warnings
are not whole-product findings. Dependency audit exit1:41advisories
(4low/19moderate/16high/2critical),lock unchanged. Do not report whole-repo UX PASS.

Recipe badges remain cramped at text x2 and missing catalog images use honest
placeholders. Expanded mobile nav/Scan header and scrolling rail need owner/device/
thumb-reach/usability assessment. Legacy six-cell kit remains outside migrated scope.
Week durable queueWrite/replay,inventory fallback/queued metadata receipts and
historical export domain remain separate. Safari/native zoom/screen-reader speech/
virtual keyboard/CWV/hosted CI/brand approval/release unverified.

No push/PR/merge/deploy,remote schema/apply,backend/packages/services/stores/schema/
public/dependencies/auth protocol/payment/production flags/config change.


Wrangler environment diagnosis: update-check caches latest version for3600s under
os.tmpdir(), so the default macOS temp path and full gate TMPDIR=/private/tmp have
different caches. Default-path CI/debug PASS did not warm the expired full-gate
cache. Exact-env standalone first31PASS/1timeout17.87s naturally refreshed that
cache through Wrangler's own metadata lookup; no cache file/dependency/source was
edited. Exact-env recovery32PASS3.77s,affected test1206ms; full outcome PASS recorded next. This is
pre-command package-version discovery, not a remote D1 command or schema mutation.


## Final gate and checkpoint

Final full command unchanged,exit0:285files/6685tests PASS,0FAIL,Vitest344.71s.
Type/lint/migration smoke,Vite2.97s and Worker TypeScript build PASS. Wrangler
catch-up suite32PASS2711ms inside full. No timeout/config/source/dependency change
for the startup recovery. All160frozen source hashes match after full. Build
verification expanded from prior51rebuild/font files to all99public/takosan files,
including legacy kit: every built file matches source bytes. Remote schema/Week
parity were skipped by unchanged default gates; no release artifact is certified.

Implementation `74adf20db00f77c63ba47085362c621b56e050fc` verified on
2026-10-11 JST with one git cat-file --batch process: 160 source records, 271
evidence payloads and 99 public asset records, 480 unique blobs, all match
worktree bytes and recorded SHA256. Manifest 55364 bytes, SHA256
`42892dfeaaa814df6203eb470ecd1f35850dbd6d3d7af69ec5a4976eec9c61bc`.
All 56 archive log receipts match. Protected base-to-implementation diff empty;
tree clean immediately after implementation; staged/implementation diff-check PASS.
Owned ports 5206/8906/5207/8907 closed. GIT_VERIFICATION.md records the receipt;
the following documentation checkpoint does not include its own hash.
