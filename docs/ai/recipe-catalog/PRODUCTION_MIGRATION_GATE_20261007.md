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

