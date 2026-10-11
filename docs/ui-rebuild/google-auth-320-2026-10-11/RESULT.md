# Google Sign-In responsive follow-up - 2026-10-11 JST

Status: IMPLEMENTED_VALIDATION_PENDING. Not deployed.

## Problem and change

The configured Vietnamese Google button at /auth produced a 330px iframe on a
320px viewport, yielding root scrollWidth 325. A fresh actual-production probe
reproduced this. The provider option signin_with produces the correct sign-in
label and a 300px iframe on the same viewport. No overflow clipping is used.
A second probe narrowed a 1440px page to 320px without reloading: the provider
kept its original width, yielding root scrollWidth 370 despite the shorter label.

AuthPage now renders signin_with and watches the host width with ResizeObserver,
with a window-resize fallback. It re-renders only when the effective 200..400px
button width changes. The observer and listener are removed on auth-mode change,
retry, or unmount; callbacks delivered after cleanup do nothing. GIS initialization
and the signed credential callback are retained; width changes do not initialize
authentication again.

Canonical repository: vn-tak/Tako-san. Base main and current production:
13f8c9eb2190e0520bdde5edb9889b64fda5b691. Branch codex/auth-google-responsive.
The previous UI01-UI14 rollout completed at run 38095649957, Worker
5d0d2ad7-e6bc-43a4-aa26-f95e21f9a8b7, all-household D1/500, Planner/T20 enabled.

## Verification boundaries

The browser harness overlays local production-build bytes on the production
origin in an isolated Chromium context. It fetches the actual public Google
configuration and mounts the real remote Vietnamese provider iframe. Hosted
source is unchanged. All API mutations are blocked; no authentication submit,
account creation, OTP request, household mutation, or Google account flow is run.

The harness checks asynchronous iframe sizing and full document/body width,
actual button/text bounds, axe, images, Tab/Shift+Tab into and out of the iframe,
password visibility, forgot-password return, register-to-login return, resize
without reload, blocked provider followed by actual retry, and missing-provider
configuration. Six initial widths: 320/360/390/768/1024/1440. Application text x2
and short height420 at320/768; provider typography remains under Google's control.
Real devices, Safari, screen readers, hosted authentication, OTP delivery and
provider text enlargement remain unverified.

## Checks and failures

Focused auth checks: 5 files / 53 tests PASS, including the existing session,
OTP delivery and guest-transfer fences and two new resize lifecycle cases.
Typecheck, full ESLint, paired-flags production Vite/Worker build and local SQLite
migration smoke PASS. No remote migration is run.

Initial full test run: 286 passed / 2 failed files; 6733 passed / 11 failed tests.
All failures were T21RC2/T21RC2T temporary-path assertions comparing macOS /var
with its real /private/var path. With TMPDIR=/private/tmp, the same two files
passed all93tests without source changes. Full canonical suite then failed one existing staging Wrangler startup test at
its5second timeout (287files/6743tests passed). A full rerun limited to2workers
is in progress without changing test timeouts or application code. The initial failure is retained rather than reported as green.

Browser harness correction1: Google returns decomposed Vietnamese in the label;
the initial composed-text selector timed out. It now uses the button role and
normalizes the label to NFC before asserting the sign-in text. Correction2: the
forgot-password return label includes "man hinh"; the selector now matches the
actual label. Neither failure required application changes. Text-enlargement
capture scrolls the provider into view before capture and excludes provider-owned
DOM from application text scaling. A resize capture also raced iframe replacement; the harness now treats a
detached frame as a settling state and still requires the replacement button and
exact final bounds. Final PASS:18checks, all applicable axe/overflow/image checks
zero, APIwrites0/pageerrors0. Keyboard focus ring and the provider under enlarged
application text were visually inspected. Retained first failures are evidence
of harness correction, not green runtime checks.

Scope proof compares the signed credential callback byte-for-byte with main and
confirms worker/services/stores/auth-components/packages/migrations/public/assets,
dependencies, Wrangler configuration and release policy are unchanged.

## Release plan

Use normal protected PR merge and successful exact-main CI. The current policy
requires every new SHA to restart authority in shadow, then same-SHA canary
1/2/5/25 and D1, first on staging. Production requires the existing reviewer
vn-taphoanhatung for every run; no bypass. Shadow temporarily serves71static
recipes, and cohorts restore D1 until all-household500. Keep Planner/T20 paired
true. Retain baseline and per-stage Worker recovery receipts; current-main gates
constrain old-source redeploy. No policy, dependency, payment, catalog import,
credentials or migrations are part of this follow-up.


## Exact executed commands

All commands ran from /Users/tunbee27/Documents/Tako-san-google-responsive.
Node24 is selected with PATH=/opt/homebrew/opt/node@24/bin:$PATH.

```sh
pnpm install --frozen-lockfile --offline
pnpm exec vitest run tests/unit/auth-google-credential.test.tsx tests/unit/auth-funnel-ui.test.tsx tests/unit/auth-verify-route.test.tsx tests/unit/auth-resend-turnstile.test.tsx tests/unit/auth-guest-transfer-deferred.test.tsx
VITE_MEAL_PLANNER_ENABLED=true VITE_MEAL_COMPOSITION_V2_ENABLED=true GIT_COMMIT=google-responsive-local pnpm build
pnpm typecheck
pnpm lint
pnpm check:migrations
pnpm test
TMPDIR=/private/tmp pnpm exec vitest run tests/unit/t21rc2-production-capture.test.mjs tests/unit/t21rc2t-production-capture.test.mjs
TMPDIR=/private/tmp pnpm test
TMPDIR=/private/tmp pnpm exec vitest run --maxWorkers=2
pnpm exec vite preview --host 127.0.0.1 --port 5232 --strictPort
node scripts/google-auth-responsive-check.mjs
pnpm exec eslint src/web/pages/AuthPage.tsx tests/unit/auth-google-credential.test.tsx scripts/google-auth-responsive-check.mjs
pnpm exec prettier --check scripts/google-auth-responsive-check.mjs tests/unit/auth-google-credential.test.tsx
node --check scripts/google-auth-responsive-check.mjs
git diff --check
```

Evidence: EVIDENCE_MANIFEST.json binds numeric receipts, representative screenshots,
initial failures and raw compressed logs. The provider script is tracked for
future checks. Production baseline health was saved with curl; Python urllib's
initial request received403 and did not capture a baseline. Public metadata is
not a protected served-catalog proof; release-workflow receipts must prove D1.
