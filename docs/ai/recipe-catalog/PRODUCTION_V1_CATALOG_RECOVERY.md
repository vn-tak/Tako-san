## API compatibility continuation - 2026-10-06 JST

Capacity executable414f449 and observed Worker response executableca91a1f
correct the D1 capacity query and bounded annotations/AI project/runtime assets
compatibility. Actual approved inspect37381283540 exposed those shapes read-only.
Recovery37379695824 stopped before any Worker/catalog mutation. Complete asset
runtime equivalence remains required before traffic and after deployment. See
[PRODUCTION_D1_API_COMPATIBILITY_20261006.md](PRODUCTION_D1_API_COMPATIBILITY_20261006.md)
for exact runs/artifacts/checks and the fresh final-main release sequence.
Earlier pending/no-remote statements below are historical.

---

# Bounded production V1 catalog recovery

Status: preparation and rehearsal; no remote catalog mutation performed.
Operator requests production release and confirms there are no real users.
User-data preservation certification is excluded. ADR-041 defines the narrow
catalog source replacement; existing production Environment approval remains.

## Source and reason

Protected diagnostic run37316530751 succeeded after independent production
approval. Its verified aggregate receipt shows500 recipes/6720 live ingredient
lines,4252 ING_ENR lines with no ID overlap with committed V2 and no current
formula matches. Canonical V1 target2702 lines remain ambiguous. This is evidence
against assigning historical order to current live lines, not proof of corruption.

Use existing certified V1 `rel-bd00a4f53fcaeee4`,500 recipes/2702 lines/2064 steps,
fingerprint `f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.
The compiler replays hash-verified migrations only in local SQLite and independently
certifies their runtime against the reviewed release. No historical migration is
replayed remotely or edited. V2 enrichment remains outside this release authority.

## Execution boundary

Production operations remain manual-only. A main-push job containing only echo
registers the workflow, without checkout, production Environment or secrets.
The production gate explicitly rejects non-dispatch events.
Manual workflow `Production Catalog V1 Recovery` exposes only `inspect`,
`static-pin`, `restore-v1`. Dispatch current-main exact SHA and the final merged
implementation PR head whose complete tree equals main. The gate verifies repo/run/
actor/attempt-one, full-tree ancestry/equality and exact-main hosted CI. Normal
production Environment approval by `vn-taphoanhatung`, independently from dispatch
actor `vn-tak`, is checked before credentials are used and at mutation fences.
The workflow shares `frigo-deploy-production` with migration and deployment.

`restore-v1` first inspects and pins the old Worker
`136cb6ff3d2921eac237c7b106b37ab5ee12a13f` static/0/cutover=false. It copies the
exact downloaded module bytes and keeps old compatibility/runtime/settings,
all inherited bindings/secrets and assets. It verifies module digests and100%
traffic on the resulting version. No current-main/T20 bundle is uploaded, so
ADR-031's0039 prerequisite is unchanged. Assets use the documented Cloudflare
`keep_assets:true` contract; no asset content digest is claimed if the API does
not expose one. Unknown provider metadata or a latest/active mismatch stops clone.
Only this pre-catalog helper can restore the old Worker on verification failure.

Then verify pinned production D1 `frigo-db`/
`f975ec39-b2c8-4a2a-80e1-0366054599d3`, exact38 canonical ledger/0038 and capacity.
Require DB below100MiB so bounded catalog archive/target copies fit the minimum
500MiB D1 limit. Capture a fresh Time Travel bookmark, reauthorize and prove static
routing again immediately before the single generated SQL import.

The one atomic D1 import checks known schema/triggers/incoming FKs,500 canonical
recipe IDs/6720 lines/order0, foreign keys and rollback-compatible live units/
quantities. It creates immutable lossless copies of all seven touched catalog
relations and a trusted V1 target. Storage types, BLOB and large integers stay
inside SQLite; no raw catalog archive is returned through JSON or public artifacts.

Unlink recipe nutrition before restoring V1 version1, update recipe parents in
place and replace recipe ingredients/steps/runtime fields/order/classifications/
nutrition from V1. Shared ingredients, ingredient nutrition, nutrition profiles,
media and other tables are outside the operation. V1 linked nutrition is0;
unknown nutrition remains unknown. No user-data retention checks are required.

After import, separately certify ledger unchanged, FK/quick_check,500 hydrated
recipes, exact IDs/order and runtime fingerprint, then prove old Worker still
serves static. If certification fails, restore only the immutable catalog archive
and only while active catalog still equals generated target; retain static routing.
If provider completion is ambiguous, inspect before further action. Time Travel
restore is an operator incident fallback, never an automatic whole-DB rollback.

## Rehearsal and limitations

Tests exercise real SQLite constraints and transactions, exact V1 hydration,
lossless archive, nutrition unlink ordering, schema/ledger/ID/count drift,
slug permutations, repeat-operation rejection, late batch failure, rollback,
concurrent edits, and orchestration failure before/after import. Provider tests
cover module/binding/settings equivalence, freshness, bounded static pin and
rollback before any catalog write. The same generated batch is additionally
rehearsed against local workerd D1 when available. Actual commands/counts are in
the current checkpoint and PR; local rehearsal is not remote execution evidence.

The unknown historical catalog writer is not identified by the receipt. All repo
catalog import tools remain offline, and this operation holds the production
workflow lock. No active external catalog writer may run during the import and
certification window. D1 import temporarily makes the database unavailable and
restores its original state on import failure; the static catalog remains selected,
but unrelated DB requests can be briefly unavailable during that import.

## Release sequence

1. Merge green reviewed recovery implementation and require green exact-main CI.
2. Dispatch `restore-v1` (or inspect first if provider metadata needs examination),
   complete normal production Environment review, retain sanitized receipt.
3. Require `V1_CATALOG_CERTIFIED_STATIC`; production ledger must still be38/0038.
4. Dispatch existing `Production D1 Migration` with exact current main,
   expected_pre_tip0038, migration0039, intentional production confirmation.
   Its new preflight independently recertifies V1 before applying.
5. Stage and deploy the exact immutable release through `Deploy`. Pair T20 server/
   UI flags, preserve normal catalog static/shadow/canary/D1 progression, and
   verify active100%version, schema, exact SHA, fingerprint and smoke.

No recovery receipt alone authorizes0039, new application deployment, T20 or a
catalog authority promotion. Record actual run IDs, artifacts/bookmarks and active
version at each stage rather than converting offline evidence into deployed status.

## Executed validation at executable checkpoint 7f59afa

- `TMPDIR=/private/tmp TZ=UTC pnpm exec vitest run tests/unit/recipe-catalog-recovery.test.mjs tests/unit/production-catalog-static-pin.test.mjs tests/unit/production-catalog-recovery-approval.test.mjs tests/unit/production-catalog-recovery-runner.test.mjs --maxWorkers=1`: four files / 56 PASS.
- `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`, script syntax and `git diff --check`: PASS.
- Full single-worker suite: 247 files PASS / one file failed; 5638 tests PASS / one existing Wrangler subprocess test exceeded the unchanged5000ms test limit (535.32s total). Narrow recheck of `staging-d1-catchup-check.test.mjs`: one file /32 PASS, Wrangler case1254ms. Full recheck248 files /5639 PASS (522.82s). Hosted final-head CI37327411648 also248 /5639 PASS, lint/typecheck/migration smoke/build PASS. PR46 merged at9fbaffa; exact-main push CI is pending before remote execution.
- Actual workerd D1 rehearsal with pinned Wrangler3.114.17 `d1 execute --local --file`: restore and rollback PASS. Independent hydration500/failures0/exact V1 fingerprint, ledger38/FK0, archive6720; rollback active6720/order0/statusROLLED_BACK/FK0. Logs and generated rehearsal batches stay local at `/private/tmp/takosan-recovery-local-rehearsal/`.
- Two independent implementation reviews: no remaining blocking findings. Provider API metadata compatibility remains a production inspection prerequisite; local mocks are not proof of the deployed provider shape.

No remote catalog repair, migration or new application deployment has occurred.

## Registration checkpoint aea900d

The initial new dispatch-only file remained absent from the Actions workflow index
and web; GET and CLI/REST dispatch404 despite default-main blob and actionlint
validation. No recovery run or production mutation was created. Registration-only
main push is a bounded workaround, not a diagnosed provider root cause.
Actionlint1.7.12, lint, diff check and13 approval tests PASS; independent review
reports no blockers. Hosted PR/main CI and successful registration are still required.
