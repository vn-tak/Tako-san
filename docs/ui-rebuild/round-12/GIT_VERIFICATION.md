# UI12 - Verified local Git checkpoint

2026-10-11 JST; verified UTC `2026-10-10T20:29:32.571038+00:00`.
Canonical origin: https://github.com/vn-tak/Tako-san.git.
Checkout: /Users/tunbee27/Documents/Tako-san-ui-rebuild.
Branch: codex/ui-rebuild-foundation.

## Implementation identity

- Base: `f7a27c16ef460b19322d3a463dc74dc09fa48ade`.
- Implementation: `03e16c78850b061784dc2e9a01323bd7e74b65f3`.
- Implementation tree: `6ddf5d108e989b04b8a18661bd331fad4a524fd7`.
- Parent equals the recorded base; worktree immediately after implementation was clean.
- Staged and implementation `git diff --check` passed.

## Git-object verification

One `git cat-file --batch` process read each implementation blob by `commit:path`
with sequential header/size/body reads. Duplicate records were checked for
consistency. Every blob size/SHA256 matched the frozen record and worktree bytes.

- 374 frozen source/test/script/config/public records verified.
- 349 archived evidence payloads verified.
- 257 public source records verified; these are included in the374.
- 724 unique implementation blobs verified including the manifest.
- 39 log receipts verified against raw and archived bytes/SHA256.
- 7 normalized terminal logs retain exact raw content in deterministic gzip;
  decompression and packed/raw hashes were verified. Other logs match raw bytes.

Manifest: `evidence/manifest.json`, 71,599 bytes, SHA256
`3c7ff61129ff0d14dd9e04c1053567b3e891d438821a7c118f3cb4716bb66e02`.
It excludes itself, mutable prose outside evidence and this following receipt.
The documentation checkpoint changes no frozen source or evidence payload.

## Protected and asset integrity

Base-to-implementation protected diff is empty for backend/packages/migrations/
public/services/stores, App routes/guards, media resolver, sync/private-session,
payment UI, dependencies/lock and actual Vite/Wrangler/.github/Tailwind/PostCSS
configuration. Exact paths are in GIT_VERIFICATION.json/lifecycle-proof.json.

96 normalized page executable/handler records and the legacy RecipeCard JSX tail
match base. Baseline777Git blobs were previously verified in the isolated archive.
257public files were checked after build:256exact copies plus sw.js matching the
existing build-ID token→local replacement. This is not a claim of257identical
build files or a proof of every possible domain behavior.

## Executed gates and limits

Full local pnpm check exit0:286files/6702tests,352.41s,type/lint/migration smoke,
Vite2.92s/WorkerTS PASS. Focused7files/86testsPASS. Main167ON/17journeys,24OFF/1,
13states/8,14supplemental=218structured browser cases; no separate UI12E2E runner.
Applicable axe/overflow/brokenimages/pageerrors/newrecipeclipping0. InventoryJSON
unchanged and zero domain writes in read slices; synthetic onboardingPATCH is
separately classified. Detailed evidence, failed attempts and coverage limits:
VERIFICATION.md and ROUTE_COVERAGE.md.

Owned previews stopped and5212/8912/5213/8913/5214/8914 closed at verification.
No push/PR/merge/deploy, remote DB/media or protected authority change. GenericUX
FAIL157/31/989/86 and41dependencyadvisories remain; source/license/subject/crop,
brandowner/device/Safari/nativezoom/screenreader/keyboard/usability/CWV/hostedrelease
are not certified. UI13 media review is the next local packet; no UI13 runtime.

This documentation checkpoint records the verified implementation hash and does
not record its own hash. Machine-readable receipt: GIT_VERIFICATION.json.
