# Production release guards and current diagnostic evidence - 2026-10-05 UTC

Status: locally validated implementation checkpoint `81255c1`. Production recovery, migration and
application deployment have not run in this task. The existing production Worker
still serves static fallback while configured for D1.

## Verified hosted evidence

- Repository `vn-tak/Tako-san`; GitHub CLI active account `vn-tak`.
- PR #44 is merged and independently approved by `vn-taphoanhatung` on
  `089ae329ebba2ba38659c030266068aeace9b8a8` (review `5414445860`).
- Current main `b00eb1356b641602244dae09dcf2c0061b9544a0`; exact-main CI
  [37311349308](https://github.com/vn-tak/Tako-san/actions/runs/37311349308)
  succeeded (243 files / 5,548 tests).
- Fresh protected SELECT-only topology run
  [37316530751](https://github.com/vn-tak/Tako-san/actions/runs/37316530751)
  succeeded. Its production Environment approval came from `vn-taphoanhatung`.
  The failed setup run `37304008220` was not rerun.
- Artifact `11347714770`, digest
  `sha256:8f51ed149a148d6c03199f4fd067d2df1551efd221f14b8c05865501e03deca8`,
  was downloaded and verified. Only the closed aggregate receipt was published.

Production has 500 recipes / 6,720 ingredient occurrences, including 4,252
ING_ENR occurrences with zero current-generator ID matches and zero distinct IDs
shared with the committed V2 source. All 2,702 canonical V1 target lines remain
ambiguous. There are no exact duplicate production occurrences. These findings
exclude safely assigning historical V1 positions to the current live lines.
They do not prove data corruption or identify the writer.

Public readiness observed at 2026-10-05T13:32:33Z reports Worker
`136cb6ff3d2921eac237c7b106b37ab5ee12a13f`, database/queue ready, configured
D1/cutover true/percent 0, actual `globalSource=static`, and
`fallbackReason=CATALOG_DIAGNOSTICS`. The recorded production ledger is exactly
38 through `0038_auth_onboarding_completion.sql`; order rows and hydrated recipes
are zero. Migration 0039 is additive composition storage and cannot fix this.
Restoring catalog health would automatically activate D1 on that old Worker;
explicitly pin static routing before any catalog replacement.

## Guard implementation

`release-check.mjs` reads live GitHub main and requires exact candidate equality.
Deployment repeats fresh CI/main proof immediately before uploading after its
preflights. Failure before any upload no longer invokes Worker rollback.

The production migration workflow shares the production deployment lock. For
0039 it refreshes main/CI after Environment approval and immediately before
apply, proves the complete existing V1 catalog and runtime fingerprint before
capturing a bookmark or applying, and rechecks the entire unchanged ledger.
Missing order, invalid positions, drift, identity/chain changes or a stale main
stop the operation. Existing historical migrations are untouched.

The C4I test fixture now resolves Git's object directory instead of assuming
`.git` is a directory, allowing the same historical checks in isolated worktrees.

## Executed local validation

- `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`: PASS.
- Targeted release/migration/C2/C2T/C4I: 5 files / 418 tests PASS, canonical macOS
  temp path and UTC, 2026-10-05T13:39Z.
- Full suite with one worker: 244 files / 5,583 tests PASS, 510.05 seconds.
  The earlier two-worker run had 5,582 PASS / 1 FAIL because an existing
  Wrangler subprocess exceeded its 5-second timeout under contention.
  Canonical `TMPDIR=/private/tmp TZ=UTC` and one worker resolved the local
  environment issue; no timeout, assertion or safety gate was weakened.
- `git diff --check`: PASS at guard inspection.
- Production dependency audit: high/critical 0; two moderate advisories.
  Full development audit reports 14 high findings in the existing toolchain.
  No speculative toolchain upgrade is included in catalog recovery.

## Next operation

Prepare a separately reviewed bounded restore of immutable V1, archive all live
catalog rows, preserve recipe parent IDs and user references, and rehearse restore
and rollback before remote mutation. Clear stale nutrition associations only as
part of the reviewed archived source transition. Certify catalog before 0039;
then deploy immutable current main through the established staging/production
workflow and verify the exact active SHA and served authority. Updating the
review-bound release-check bytes requires a fresh review for future C2T reruns;
the completed clean-main diagnostic remains valid evidence.
