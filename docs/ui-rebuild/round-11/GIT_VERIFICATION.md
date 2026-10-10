# UI11 - Verified local Git checkpoint

Verified on 2026-10-11 JST (2026-10-10 15:02:47 UTC).
Canonical origin: https://github.com/vn-tak/Tako-san.git.
Checkout: /Users/tunbee27/Documents/Tako-san-ui-rebuild.
Branch: codex/ui-rebuild-foundation.

## Implementation identity

- Base: `13cef9f8e6dc72549071426ad98df70e0d16f4a4`.
- Implementation: `74adf20db00f77c63ba47085362c621b56e050fc`.
- Implementation tree: `eafa2eab4e570f130670f0ea1b70fc92217f659e`.
- Parent equals the recorded base; worktree immediately after implementation was clean.
- Implementation and staged `git diff --check` passed.

## Git-object verification

One `git cat-file --batch` process read each implementation blob by `commit:path`.
For every record, blob length and SHA256 matched the frozen receipt and the exact
worktree bytes. Duplicate paths were checked for consistent receipts before reading.

- 160 frozen source/test/script/config/font/asset records verified.
- 271 archived evidence payloads verified.
- 99 public Takosan asset/font records verified, including the legacy kit.
- 480 unique Git blobs verified across these groups and the manifest.
- 56 archived log receipts matched their recorded archive bytes/SHA256; original
  raw bytes/SHA256 remain separately recorded in log-receipts.json.

Manifest: `evidence/manifest.json`, 55,364 bytes, SHA256
`42892dfeaaa814df6203eb470ecd1f35850dbd6d3d7af69ec5a4976eec9c61bc`.
The manifest excludes itself and mutable prose reports. This receipt belongs to
that prose layer and does not change any frozen source/evidence payload.

## Boundaries and operational state

The base-to-implementation protected-path diff is empty for src/worker, packages,
migrations, public, src/web/services, src/web/stores, src/web/App.tsx,
src/web/lib/sync.ts, src/web/lib/private-session.ts, PaymentPage.tsx, package.json,
pnpm-lock.yaml, vite.config.ts and wrangler.toml. The archived lifecycle proof
separately restores the five explicit presentation patches to base bytes and
checks AppLayout scope/immersive definitions.

Owned local preview ports 5206, 8906, 5207 and 8907 had no listening process at
verification. No push, PR, merge, deployment or remote database/media write occurred.

## Validation and next action

Final local pnpm check passed: 285 files / 6,685 tests, typecheck, lint, local
migration smoke and builds. Focused checks passed 255 tests. Accepted browser
matrix: 115 Planner ON snapshots plus 24 OFF, 17 journeys, seven aliases and
19 passing E2E checks (five existing once-only skips). See VERIFICATION.md for
exact commands, retained failures and synthetic/device distinctions.

Generic UX audit remains FAIL (154 files / 30 issues / 977 warnings / 85 checks);
41 dependency advisories remain with the lock unchanged. Inner recipe badges,
media coverage, owner/device/Safari/native zoom/screen reader/usability/CWV and
hosted/release checks remain open. This checkpoint does not certify the whole UI
rebuild or final brand approval.

The following documentation checkpoint records this verified implementation hash;
it does not record its own hash. UI12 starts with the route/state/media audit in
`docs/ai/tasks/UI12-route-visual-media.md`. No UI12 runtime work started in UI11.
