# Catalog preflight diagnostic implementation - 2026-10-07 JST

**State:** Production release remains incomplete. Production diagnostic
37616546408 completed SUCCESS at 2026-10-07T12:17:44Z on main
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6 with normal independent approval by
vn-taphoanhatung. Five actual artifact ZIP digests and extracted JSON bytes PASS
in independent audit. Ledger stays 38 / 0038; 500 physical and hydrated recipes,
0 hydration failures, 2702 ingredients and matching order rows, exact historical
V1 ingredient lines/positions and stable observed non-atomic snapshots are proven.
The missing 0039 diagnostic baseline is expected and does not explain migration
37615237481's catalog preflight failure. T21R-B fingerprintVerified proves the
target V1 source, not the live full runtime fingerprint. Live ordered IDs/slugs,
media invariants and full runtime fingerprint remain unproven. Recovery is already
APPLIED; no recovery replay, blind migration retry or rollback is justified.

**Changes:** Implementation 3d043ec9156841b7f6b0e5b3a7068670b40c932d, tree
c79bda74d06d7b0637eb034b3057e2df1eecf636, adds a read-only catalog preflight
receipt to the existing protected diagnostic workflow. The helper reuses unchanged
verifyCatalogAtTip and verifyRuntimeCatalogContent at exact ledger 38, requires
repeat successful catalog/runtime captures and an unchanged complete ledger, and
reports independent PASS/REJECTED/NOT_EVALUATED checks. Only 13 numeric/null
aggregates, counts, hashes and fixed reason enums are uploaded; raw rows and
exception messages stay private. Failed captures cannot reuse stale JSON. Stable
non-atomic consistency is claimed only when ledger and both snapshot comparisons
PASS. The final main fence runs even after a rejected diagnostic. No production
write, runtime/migration/config/dependency or Environment-policy change.

**Verification:** Final helper tests 38/38 PASS under Node 24.16; final exact
Node 22.23.3 focused tests 3 files / 58 tests PASS (35.73s). Independent final
review of implementation/tree reports no remaining finding. Actual CLI controls
7/7 and exact workflow-shell stale JSON/provider-failure controls 5/5 PASS, with
0 production calls; official Node 22 CLI controls 4/4 PASS. Final lint, typecheck, migration smoke, build, script
syntax, actionlint 1.7.12 and diff checks PASS. Default local full suite returned 3 failed
files / 12 failed / 6186 passed (179.65s): untouched capture tests compare
uncanonical macOS /var temp paths with real /private/var paths, and the local
Wrangler prefix test timed out under default concurrent workers. No tests were
weakened. Independent focused3files/125tests PASS4.58s with canonical TMPDIR
and maxWorkers=2; the two capture files reproduce the same11 failures with the
uncanonical default TMPDIR even with two workers. All eight involved source/test
files are byte-identical between969d and the implementation. Exact resource
bottleneck of the concurrency-sensitive Wrangler timeout was not profiled. Full
final regression with TMPDIR=/private/tmp and maxWorkers=2 is running.
One actionlint invocation used a nonexistent certify filename; corrected to the
actual production-certify.yml and all four affected release workflows PASS.

**Production:** Public readiness at 2026-10-07T12:53:19.214Z remains healthy old
Worker 136cb6ff3d2921eac237c7b106b37ab5ee12a13f / static / 0% / cutover false,
config OK and database OK. No new provider smoke submitted. Staging969d completed
its full shadow/1/5/25/D1 proof; that packet cannot certify a future main SHA.

**Evidence:** /private/tmp/takosan-production-receipts-diagnostics-37616546408/
independent-audit.json; /private/tmp/takosan-production-catalog-preflight-review-final.json;
/private/tmp/takosan-production-catalog-preflight-cli-control/audit-results.json;
/private/tmp/takosan-production-catalog-preflight-workflow-control/audit-results.json.
Raw runner-local production rows were not exported or published.

**Next:** Finish local gates and the documentation checkpoint, publish a normal
PR and require final-head/exact-main hosted CI. Freeze the new main SHA and run
one normally approved protected read-only diagnostic to identify the rejected
catalog/runtime check. Repair only proven defects, then certify final-source
staging, guarded0039 and production schema/catalog before T20=false production
shadow, one synthetic provider smoke, canary1/5/25 and D1. Normal independent
production review remains required per run. User-data retention certification is
excluded by operator instruction. Do not claim production completion yet.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Production preflight stopped; staging verified - 2026-10-07 JST

**State:** Production release is incomplete. PR #56 merged normally as
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6. Reviewed head ca5df79 and merge have
complete-tree equality 7c0cecd8e06657c570f5ce161cc5430ab8d9cd56. Final-head CI
37613292017 and exact-main CI 37614255604 SUCCESS; hosted main ran 253 files /
6,160 tests, lint, typecheck, migration smoke and build. Release source stays
frozen at 969d1d.

**Migration:** Run 37615237481 was approved normally by vn-taphoanhatung and its
frozen-toolchain/exact-SHA gate passed. Production identity and ledger 38 / 0038
were verified, then Require healthy current catalog before migration 0039 FAILED.
Bookmark, baseline, plan, apply and every post-check were SKIPPED; this run did
not apply 0039 or upload a Worker. No recovery replay or catalog rollback followed.
Both candidate/receipt artifact ZIP digests and extracted manifest bytes PASS in
root and independent audit. The sanitized receipt lacks the specific preflight
failure reason and raw query outputs, so the cause remains UNKNOWN. Prior inspect
APPLIED proves recovered rows/shape/counts, not complete runtime/media release proof.

**Reproduction:** The actual failure manifest plus fresh immutable 0038 V1 local
SELECT evidence passed the same verifier and exact four-argument CLI under
Node 24.16.0 and independently checksum-verified official Node 22.23.3. Both report
500 recipes, 0 hydration failures and fingerprint
f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
No argv, serialization or Node-version failure reproduced. These fixtures do not
certify live D1 and do not justify a blind migration retry.

**Staging 969d:** Completed shadow 37615155277, 1% 37615530432, 5% 37615915508,
25% 37616295460 and D1 37616679405. All five normal runs SUCCESS with production
jobs SKIPPED; 10 actual artifact ZIP digests/extracted bytes, protected authority
500/fingerprint/schema 39/T20 true, 15 paired readiness/service-worker observations
and public smoke PASS. Final public 500 ordered IDs, runtime fingerprint and
imported detail (15 fields, 6 ingredients, 5 steps) PASS via 3 readiness guards /
5 GET requests. Final Worker b7b0a495-d933-4698-950c-a8d0918b20c4. Root independent
offline packet, archives and previous-authority progression audit PASS. A temporary
root assertion initially expected previousDeployment in staging; staging records
previousRecipeAuthority, so the assertion was corrected to that actual schema
before PASS. This certifies staging only.
Packet: /private/tmp/takosan-migration-gate-staging-prep/staging-progression-receipt.json
SHA256: ac9933239ac080c04fc7057e96b8c8adffe97ecae0cdfb3e42ec27a2ebf4366f.

**Next protected run:** Read-only diagnostics 37616546408 was dispatched once at
2026-10-07T11:48:03Z for frozen 969d / main CI 37614255604. Its source gate SUCCESS;
GitHub API currently reports WAITING, approvals [], required production reviewer
vn-taphoanhatung and CLI current_user_can_approve=false. Normal review is requested;
do not bypass or change Environment settings. Read the new runtime, order, lineage
and V1-comparison receipts to isolate the preflight failure before choosing a repair.
Do not infer live hydration or media state from a successful local replay.

**Production:** Public readiness at 2026-10-07T11:50:46Z reports healthy old Worker
136cb6ff3d2921eac237c7b106b37ab5ee12a13f, static / 0%, cutover false, config OK and
database OK. No new provider scan has been submitted. Production migration,
certification, shadow, provider smoke, canary 1/5/25 and D1 remain required after
the failure is resolved. Keep T20 server/UI false in production and preserve normal
approval on every run. User-data retention certification remains excluded by
operator instruction.

**Evidence:** /private/tmp/takosan-migration-failure-37615237481/ and
/private/tmp/takosan-production-receipts-migration-failure-37615237481/;
independent Node 22 fixture proof at
/private/tmp/takosan-production-receipts-node22-control/.
Production schema/deploy verifiers remain prepared for 969d / main CI 37614255604
at /private/tmp/takosan-migration-gate-production-prep/. Final packet assembler
now checks smoke chronology before canary, fixture/terminal/readiness identity and
final D1 content chronology. Syntax and 12 isolated controls PASS (1 valid,
11 rejecting invalid cases); production requests 0, actual production packet not
written. These are preparation checks until actual migration, certification and
deployment receipts exist.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Production migration gate toolchain - 2026-10-07 JST

**State:** Production release remains incomplete. Protected inspection37611067522
verified the prior catalog recovery APPLIED at ledger38, so no recovery replay or
catalog rollback followed. New migration37612433689 failed in its credential-free
source gate:ERR_MODULE_NOT_FOUND for the top-level TypeScript import in
scripts/d1-migration-check.mjs. Migrate was SKIPPED; no new D1 write or Worker upload.
Main remains5b12ab71acd84beec62be967c950b12d596c88d7 while the small fix is reviewed.

**Change:** Branch codex/migration-gate-toolchain adds pinned pnpm setup10 and
pnpm install --frozen-lockfile before the production migration gate. The already
locked TypeScript dependency is now available on a fresh runner. No package,
lockfile, runtime, migration, production credentials or Environment policy changes.
Other deploy/certify source gates import only Node built-ins and do not share the
failure. This supersedes the previous checkpoint's next action to use unchanged
5b12 migration tooling.

**Verification:** actionlint1.7.12 and git diff --check PASS. Node24.16 focused
migration/preflight/release/runtime-proof tests4files/304tests PASS3.85s. Isolated
fresh checkout reproduced missing TypeScript before dependency install. Frozen
install completed, module import and offline candidate proof then PASS with the
explicit tested origin/main SHA:only0039,34pinned hashes. The initial local clone
inherited a different main ref and its ancestry check failed; that fixture ref was
corrected only in the private temporary clone, then the candidate check passed.
No live GitHub/Cloudflare gate was substituted by this local test. Exact-main5b12
CI37609952250 previously PASS253files/6160tests405.12s and full local gates were
already complete before this workflow-only change. New final-head/main CI is pending.

**Evidence:** Third applied receipt and normal approval retained at
/private/tmp/takosan-import-confirmation-production-inspect-37611067522/;
ZIPsha0af10c60605257478364f1a799bc3ca6fa03035a905b993efbd8d9eae3bda6c2,
receiptshaf9b5cdd37759074d151e5a985789e0dcca50b61625ca6683cfb4b39e829d2464.
No provider-terminal conclusion:UNKNOWN_NO_CURSOR; this is not full runtime release
certification. StaticWorker1a47f7f7/old136cb6ff remains unchanged at ledger38.

**Historical staging5b12:** Fully verified shadow37610975655,1%37611499034,
5%37611883708,25%37612247160,D137612639137; T20true/schema39/fingerprint/500recipes.
Ten actual artifactZIP digests and byte comparisons, five protected authority
proofs, fifteen publicreadiness/SWpairs and publicsmokes PASS. Final500ordered IDs,
15runtime fields and imported detail content PASS. FinalWorker
4f94b705-8d85-4d9c-89cc-7aea610b8872. PacketSHA256
c8650ab043a1dedf9cb24b2c0d18ad3e6aba1f0e466a3d9b331c516930ce8ccf at
/private/tmp/takosan-import-confirmation-staging-prep/staging-progression-receipt.json.
This packet cannot certify the newly merged workflow source.

**Next:** Review/merge the minimal fix normally and require final-head/exact-main
hosted CI. Freeze the resulting main SHA, rerun its full five-stage staging proof,
then dispatch intentional0039 with normal independent vn-taphoanhatung review.
Migration preflight must independently verify complete ordered V1/provenance/five-
query hydration/fingerprint before bookmark/apply. Verify exact39/schema/FK/quick/
catalog receipt, protected read-only certification and final staging before
productionT20false shadow/one synthetic provider smoke/1/5/25/D1. Every protected
run retains normal review; no bypass. User-data retention certification remains
excluded by operator instruction. Production deployment is incomplete.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

