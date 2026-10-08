# Production shadow verified; AI diagnosis blocked on historical logs - 2026-10-08 JST

**Task/status:** Production rollout INCOMPLETE. Frozen release/main is
`0c77720334d7154b25e81d6e6823ab804619adce`, exact-main CI `37686743768`
SUCCESS. Migration `37689543237` APPLIED only 0039; read-only certification
`37693128721` PASS; production shadow `37763248411` SUCCESS. Each received
normal independent Environment approval by `vn-taphoanhatung`. No canary run
has been dispatched. T20 server/UI remain false; user-data retention certification
is excluded by the operator's instruction.

**Actual production:** Worker `f9c44422-4667-41bf-835e-51d5ce12787b`, deployment
`7f2f522f-c9cf-4762-9022-3435ae7e6e38`, shadow/0%/cutover false/global static.
Schema 39, 500 hydrated recipes, zero hydration failures, 500 valid ready media;
FK clean and quick_check ok. Three new public readiness/service-worker pairs
PASS through `2026-10-08T11:48:52.379Z`: exact source/assets, healthy DB/queue,
config OK, no fallback. Shadow's hosted gates passed 255 files / 6309 tests
(438.75s). Email delivery and current R2 object bytes remain unverified.

**AI blocker:** One synthetic scan on this shadow release was accepted 202 and
ended FAILED / INVALID_RESPONSE / queue attempt 1 / max 3 / items 0, support hash
`b6db841cbed9`, at 10:41:55-10:42:33 UTC (19:41:55-19:42:33 JST). Logout was 200.
Its original fixture/receipt bytes disappeared during session interruption.
Recovered conversation history is explicitly labelled and cannot certify original
receipt bytes or accuracy. Do not resubmit this scan. No confirmed live root cause
or new AI behavior change: malformed envelope, empty content, unparseable content
and empty items can share this code; queue attempt 1 can include multiple provider
calls. Historical `ai_usage` and `scan_terminal` are needed before selecting a fix.

**Recovery/checks:** Re-downloaded all six GitHub candidate/receipt ZIPs; verified
API digests, archive provenance, exact extracted JSON bytes, run/attempt/SHA/CI,
normal approvals, and cross-receipt catalog/media/ledger/Worker invariants.
Account identity matched the certified hash after successful restricted CLI login.
One bounded historical log query (frigo only, 50 seconds, dry=true) was rejected
HTTP 403 / API 10000. Official endpoint requires Workers Observability Write;
OAuth has only account:read/workers_tail:read/offline_access. No scope expansion,
new provider submission, database write, Worker change or Environment bypass.
Original operator wrappers/control receipts and staging private packet are missing;
previous observations remain historical, not newly reverified executable evidence.

**Checkpoint/source:** This documentation stays on `codex/post-media-rollout-evidence`,
separate from frozen production main. Implementation remains reviewed `df2347ca`,
merged via PR58/main `0c777203`. Previous local test/hash-pin and concurrent build
failures are preserved below; no new full local suite is claimed for this docs edit.
Detailed digests, executed recovery commands and restart instructions:
[Production shadow diagnostic](../scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

**Next action:** Obtain sanitized historical `ai_usage` + matching `scan_terminal`
metadata via Cloudflare Logs for the window above. The restricted CLI received 403;
operator was asked to provide metadata, without credentials or receipt content.
Then isolate the cause, add a meaningful regression and the smallest justified fix,
normal review/CI/merge and validation of any changed final source before a distinct
provider validation. Promote 1/5/25/D1 only after the provider gate passes. Never
replay migration 0039 or recovery `37536969564`, or bypass Environment review.

All preceding checkpoints below are historical.

---

# Production D1 0038 to 0039 migration packet

## 2026-09-29 catalog order STOP (newer evidence)

PR #26 merged as `d0c670289534c33187181b2eb7192c05a2962e22`; exact-main CI `36576510231` passed. The protected read-only run `36577380500` succeeded, but its sanitized diagnosis remains `BLOCKED`: 6,720 recipe ingredient rows, zero ingredient-order rows, 500/500 recipes missing positions and 0/500 hydrated. The ledger still has 38 entries through 0038. See `PRODUCTION_INGREDIENT_ORDER_RECOVERY_PACKET.md` for the evidence boundary and required recovery design. **Do not dispatch 0039** while catalog hydration and authority fail; this migration does not rebuild ingredient order. No production migration, restore, deployment or flag change was performed.

Status: PREPARED, NOT AUTHORIZED TO APPLY. Production D1 and Worker are unchanged by this packet.

## Evidence and scope

- Candidate baseline: `8072e0fea9f8f3588426969007dda06cadbbfbb7`, exact-main CI run `36491414297` SUCCESS. A later main SHA invalidates this candidate and requires fresh CI and staging evidence.
- Read-only production certification run `36563767379` proved the active Worker version and deployment, production `DB` binding to `frigo-db` (`f975ec39-b2c8-4a2a-80e1-0366054599d3`), then stopped at a missing `0039_meal_composition_v2.sql` ledger entry. The raw ledger artifact was not retained. Re-read the complete ledger in the gated migration workflow; do not infer it solely from this failure.
- Current public readiness reports configured D1/0/cutover true with `globalSource=static` and `fallbackReason=CATALOG_DIAGNOSTICS`. This is an independent blocker. Migration 0039 adds T20 tables and indexes; it does not repair recipe content or hydration.
- At the candidate SHA, migration 0039 has SHA-256 `24407e61f1aac2b3430bc5cef7a6d1c76d57a39f6314915c4915fc7209e777d5`. It adds `generated_meal_plan_compositions`, `generated_meal_plan_components`, and `recipe_role_assignments`, plus two partial unique indexes. Existing rows/tables are not rewritten.

## Preconditions before any dispatch

1. Obtain a fresh sanitized read-only diagnostic receipt for the active production D1: exact database identity, full ledger names/count, 500 physical recipes, hydrated count, failure-code counts. Resolve `CATALOG_DIAGNOSTICS` separately; do not claim the migration fixes it.
2. Review this migration's exact SQL and pinned historical hashes; prove the previous Worker at `136cb6ff3d2921eac237c7b106b37ab5ee12a13f` runs against the additive schema. Keep T20 Worker and UI flags false until a separately certified release.
3. Freeze a final main SHA with exact-main CI, full staging regression, fresh staging D1 readiness, and a reviewed production release manifest. If the SHA changes, regenerate this packet's candidate fields.
4. Confirm the production Environment reviewer gate, Cloudflare credential names present, identity proof, Time Travel recovery access, and the existing exact Worker rollback path. Do not record secret values or private rows.
5. Only after these conditions, the reviewed `Production D1 Migration` workflow may be dispatched on `main` with `ref=<final exact-main SHA>`, `expected_pre_tip=0038_auth_onboarding_completion.sql`, `migration=0039_meal_composition_v2.sql`, `confirm_production_migration=true`. A ledger other than exactly 38 canonical entries through 0038, or already exactly 39 through 0039, is a STOP. Never apply an inferred or extra migration chain.

## Workflow proof and recovery

- Gate checks current-main ancestry, exact SHA, migration tip, pinned hashes and successful hosted CI. The production Environment approval precedes remote access. Identity verifies the account and D1 name/ID before the ledger read.
- Re-read the full ledger. Capture a fresh D1 Time Travel bookmark before mutation and retain it in the sanitized workflow receipt. Capture counts-only baseline. `wrangler d1 migrations list --remote` must show exactly 0039 pending; any other plan is a STOP.
- Apply only through the reviewed Wrangler migration workflow. Certification-only mode applies nothing when the complete ledger is already present. Verify post-ledger exactly 39/tip 0039; unchanged pre/post aggregates, foreign keys clean, quick_check ok, recipe media and catalog proof, 500 hydrated recipes, and release fingerprint match.
- On failed post-check, stop rollout and preserve the Worker state. Review the captured bookmark, D1 write activity since capture, and blast radius before any Time Travel restore; a restore can discard later user writes and requires a separate operator decision. Code rollback uses the recorded previous Worker version/deployment, with T20 flags false. D1 schema is not automatically reversed.
- Run a fresh read-only production certification and protected authority check after migration and any independent catalog repair. No production shadow/canary promotion while fallback, count, fingerprint, Worker identity, or rollback proof fails.

No production migration or deployment was dispatched while preparing this packet.

## 2026-09-29 read-only diagnostic update

Protected run `36572487026` at merged main `baf9a069f89f9544407c827448671ecea4c56b5a` confirmed the production ledger has exactly 38 entries through 0038, with only 0039 missing. It also found 500 physical recipes but zero hydrated: all 500 fail with `missing_ingredient_position`. The 2026-09-25 certification run `36150184637` previously reported 500 hydrated and zero failures. Do not infer why positions are missing from the failure category alone. A separately reviewed read-only order-coverage aggregate must distinguish absent mapping rows, join mismatch and other drift before a catalog recovery plan is proposed. The 0039 migration remains STOPPED, even though its ledger precondition appears to match, because the independent catalog fallback precondition fails. This diagnostic is not release certification and grants no permission for migration, restore, flag change or deployment.
