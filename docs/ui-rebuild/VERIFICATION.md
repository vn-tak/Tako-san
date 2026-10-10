# UI01 verification record

Local verification on 2026-10-09 JST. Repository `vn-tak/Tako-san`, canonical
base `27d47b056455a57df811199cd7e9c32a84cbffe5`, branch
`codex/ui-rebuild-foundation`, checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.
Node 24.16.0 and pnpm 10.33.2; dependencies installed with the existing frozen lockfile.

## Final repository gates

Executed from the checkout above:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

| Gate | Actual result |
| --- | --- |
| `pnpm typecheck` | PASS, web and Worker TypeScript |
| `pnpm lint` | PASS |
| `pnpm test` | 262 files / 6,380 tests PASS, 0 failed; 324.07s suite |
| `pnpm check:migrations` | PASS, `migration-smoke=ok` |
| `pnpm build` | PASS, Vite and Worker TypeScript |
| Remote schema / Week reconciliation | SKIPPED by the existing check script |

Authoritative local log: `.artifacts/ui-rebuild/full-check-bounded.log`, exit 0.
The environment variables limit local Vitest concurrency; they do not alter tests,
timeouts, assertions, repository configuration or release guards. Wrangler telemetry
is disabled to avoid network delay in a test that invokes its local D1 CLI.
After the final browser-harness assertions, `pnpm lint` passed again; log
`.artifacts/ui-rebuild/browser-harness-lint.log`.

Focused checks also passed: 7 files / 46 tests for availability, cooking,
recipe/media/brand/store before the final navigation regressions; the updated
surface suite then passed 7/7, and passed 7/7 again after formatting only.
Its two new cases verify shopping success both before
and after navigation stays with the originating recipe. The full final suite
includes all of them. Logs: `focused-final.log`, `shopping-route-regression-final.log`,
`shopping-route-regression-formatted.log`. Targeted Prettier checks also passed.

## Failures investigated

The first full run had 259 passed / 3 failed files, 6,373 passed / 5 failed tests:

- A catalog-growth fixture previously inferred enough stock from four `bunch`
  labels. The accepted T02 contract requires contextual unit evidence. The test
  now asserts no-buy false, the precise required contextual line, and detail
  `SCALLION` evidence with `unresolved` / null shortfall. Its ranking, catalog,
  planner and cooking assertions remain. No catalog content was changed.
- Three historical review-boundary cases could not read blobs from this partial
  clone through their temporary Git object alternates. Required objects were
  restored by hash from existing local Git caches. The historical tests were
  left intact and passed 54/54 (`historical-object-check.log`). The redundant
  background fetch was interrupted after local hydration; its early-EOF exit
  was not a successful fetch. No older checkout source files were edited.
- The local Wrangler migration-list test exceeded its existing 5-second timeout.
  It passed 32/32 in isolation with telemetry disabled (`wrangler-isolated.log`).
  A subsequent normal-concurrency full run still had 6,377 passes and that one
  timeout. The final bounded-concurrency full run passed every test, including
  the Wrangler invocation in 973ms, with its timeout and assertions unchanged.

Earlier logs are retained locally as `full-check.log`, `focused-repair.log` and
`full-check-final.log`. Their names do not establish success; the bounded log is
this milestone's final full-gate result.

## Actual browser evidence

The final harness ran against the real React app and the repository's isolated
Worker/SQLite security preview. The data is synthetic and local. The harness
rejects non-loopback hosts, blocks requests to external origins and disables
service workers. Preview flags select the 500-recipe D1 fixture and T20 composition;
they do not describe authenticated production flags.

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage WRANGLER_SEND_METRICS=false PORT=5197 PREVIEW_API_PORT=8897 PREVIEW_APP_URL=http://127.0.0.1:5197 PREVIEW_T20_D1=true PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell UI_REBUILD_OUT=docs/ui-rebuild/evidence node scripts/ui-rebuild-browser-check.mjs
```

Actual final results, exit 0:

- Inventory and recipe detail at 320, 390, 768, 1024 and 1440px: document width
  never exceeds viewport width; computed font is Be Vietnam Pro.
- 12 selected axe checks for WCAG 2 A/AA and 2.1 AA: 0 violations. These include
  filtered inventory and forced neutral image fallback. No page errors.
- Reduced-motion preference active; CSS reveal animations compute to `none`.
- Search reset restores inventory rows and returns focus to the search input.
  Keyboard ArrowRight activates the next recipe tab.
- Recipe needs four eggs / stock has two: shopping POST carries quantity 2,
  unit `piece`, and the local server returns HTTP 201.
- Forced canonical/legacy image failures end at the neutral plate SVG. External
  media is intentionally blocked; this is not evidence of broken live photos.

Machine-readable evidence: [browser-observations.json](evidence/browser-observations.json).
12 app screenshots are adjacent; stdout is `.artifacts/ui-rebuild/browser-final.log`.

The standalone brand board was also rendered at 1100 and 390px: no horizontal
overflow, no broken images, and four actual Latin/Vietnamese font faces loaded.
See [brand-observations.json](evidence/brand-observations.json),
[desktop board](evidence/brand-1100.png) and [mobile board](evidence/brand-390.png).
App desktop/mobile and brand board screenshots were visually inspected.

## Assets and contrast

| Combination | Measured contrast |
| --- | --- |
| White on pine `#245D49` | 7.67:1 |
| Ink `#202C28` on canvas `#F7F3EC` | 13.07:1 |
| Muted `#606963` on canvas | 5.13:1 |
| Ink on coral `#EE705E` | 4.90:1 |

Nine self-hosted WOFF2 files total 141,932 bytes, with Latin, Latin extended and
Vietnamese subsets at 400/600/700. Vietnamese sample glyph coverage was checked
at all three weights. License, hashes, sources and measurements are retained in
[asset-provenance.json](asset-provenance.json) and `public/takosan/fonts/OFL.txt`.
The symbol and outlined wordmark are a prototype. The wordmark derives from
Be Vietnam Pro Bold with adjusted spacing; this is not a finalized bespoke logo.

## Limits and continuation

This is the first rebuild milestone. Home, shared shell/header, URL filters,
catalog pagination, inventory editor, scan, cooking screens, planner, shopping,
full brand assets and the motion kit remain in the roadmap. Existing global
navigation and portal styling can still show the current identity during migration.

Quantity evidence is not an expiry/allergy guarantee. Server cooking, FEFO,
idempotency, session/revision, tenancy and Week remain under their existing
contracts. Payment/auth/infrastructure, schema/migrations, dependencies and
production data are not modified by this branch.

Real iOS/Android/Safari, virtual keyboard, zoom/reflow, screen readers, every
motion/error/offline state, user recognition/usability, independent review and
hosted CI remain outstanding. Local success does not certify T20 staging or
production readiness. No remote release action is part of this checkpoint.

Next: implement the flag-aware Home planner adapter and shared responsive header
while preserving Week behavior; then define the lightweight recipe-list contract,
URL filters and stable 24-item pagination in a separate ADR/task packet.
