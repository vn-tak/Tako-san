# Deployment asset convergence - 2026-10-06 JST

## State and evidence

Production release is incomplete. Remote main remains
`f2b00023ccb9a706d17ebe71321c0364a948ca75`. PR50 final reviewed head
`3f38acaca216bf8a6e6f0345b42129ae0a707623` is merged with identical full tree
and verified ancestry. Local, hosted PR and exact-main validation passed
249 files / 5692 tests, lint, typecheck, migration smoke and build.

Recovery [37384670328](https://github.com/vn-tak/Tako-san/actions/runs/37384670328)
passed exact-main/full-tree/CI and normal independent approval by vn-taphoanhatung.
It proved ledger 38/0038 and capacity 7409664 bytes, cloned deployed modules/runtime/
bindings/assets and changed only three catalog variables to static/0/false. New
version `1a47f7f7-3d74-4801-b26a-b91f39c7942e`, deployment
`41054fb9-4045-4bde-9cbb-0bb0479e017b`, is verified static at 100%. Source stays
136cb6ff; module digest stays
5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1.
Bookmark `00000182-00000000-000050fc-42d96fe01cee7de1e4b9af2d9d816c64` was captured.

The import call failed at BOOKMARK_AND_IMPORT with
IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED and
ATTEMPTED_COMPLETION_UNCONFIRMED. The wrapper intentionally discarded provider
stderr; the exact error/cause and whether D1 committed remain unknown. No post-import
certification or automatic rollback ran. Never blindly retry import or rollback.
Artifact 11405412106 digest:
`sha256:0963a326ff12c085ce62737096928dbb6d669485a432865cf5a31deaca9bea45`.
Receipt:
`/private/tmp/takosan-production-recovery-37384670328-1/catalog-recovery-receipt.json`.

Read-only diagnostics [37450399162](https://github.com/vn-tak/Tako-san/actions/runs/37450399162)
was dispatched on exact f2b with hardening 089ae329ebba2ba38659c030266068aeace9b8a8,
passed its gate, and waits for the normal production Environment reviewer. Keep
remote main frozen during this read-only operation. No 0039/new production bundle
has run. User-data preservation certification is excluded by the no-real-users
instruction; catalog rollback and normal Environment approval remain required.

## Actual staging failure

Exact f2b shadow/0/T20=true run
[37384738093](https://github.com/vn-tak/Tako-san/actions/runs/37384738093)
passed release gate, build, paired flags and prior-authority transition. Wrangler
published Worker `d2300ddb-361f-4b8c-871d-6013596fb27a`. Readiness identified
exact f2b/shadow/0 three times. At 2026-10-05T22:49:19Z, about 9 seconds after
publication, post-deploy smoke failed because `/sw.js` did not embed the expected
full SHA. The failed response body was not retained; its actual SHA is unknown.
The protected authority step did not run. The manifest lacks the new
`recipeAuthority` proof, so this run does not certify shadow and no canary was
dispatched. Production job was skipped.

At 22:49:54Z, read-only GET observed exact f2b in `/sw.js` and one manual full
read-only smoke passed. Root independently confirmed exact f2b/no-store. This
proves later public convergence, not the missing protected 500/fingerprint proof
or successful workflow completion. Production remained old 136cb6ff with static
fallback CATALOG_DIAGNOSTICS and ledger 38.

Artifact `release-staging-37384738093-1`, id 11378310004:
`sha256:9012c42808e2360e56dba8408ac72d12ff5ac04dfab1199dec2730c2640ab244`.
Candidate artifact 11376144841:
`sha256:561e4e6f2e81e6f4fff5d26466118db081a59c584af5576d9947b050b3d4e701`.
Paired T20=true is confirmed from the successful flag-step log, not only requested
manifest flags. Original downloaded receipt is preserved at
`/private/tmp/takosan-staging-f2b0002-shadow-37384738093/release-manifest.json`.

## Correction

Executable commit `a9f1c81582677d4b40806c388d27892edeec1f44` changes only
`scripts/wait-for-deployed-release.mjs` and its two unit suites. The deploy CLI
requires three consecutive pairs of valid exact readiness/approved authority and
same-origin `/sw.js` with the exact SHA. Only an otherwise valid service worker
with a different canonical lowercase 40-character SHA is retried as propagation
pending. Readiness keeps its existing bounded transient/authority policy.

Both requests and body reads share the existing 90-second deadline; each request
is clipped to the remaining budget and none starts at zero budget. The SW body is
stream-bounded to 256 KiB, requires HTTP 200, JavaScript MIME and the exact
no-store cache token, rejects HTML/malformed syntax, and requires a single strict
first-executable BUILD_ID declaration plus existing SW markers. `node:vm` Script
only parses; downloaded code is never executed. Transport/body errors emit fixed
messages. No cache-busting, mutation, redeploy or dependency was added.

CLI persists the asset SHA/content SHA256/HTTP/cache/consecutive proof separately
as `deployedAssets`, preserving the original `deployed` receipt shape. Workflow,
post-deploy smoke and build behavior are unchanged. The old deadline test now
expects requests starting at t=0..87 seconds (30), then stops at 90 seconds;
the former zero-budget request at t=90 is prohibited, not allowed a longer wait.

## Executed validation

- RED: 43/43 initial new asset tests failed before the implementation; log
  `/tmp/takosan-asset-convergence-red.log`.
- Final implementation-agent focused run: 3 files / 331 tests PASS, exit 0,
  2.39 seconds. Existing wait 29, assets 44, release-check 258. An intermediate
  run had 70 PASS / 2 FAIL; corrected deadline and invalid-authority fixtures.
- Root independently reviewed the frozen source/tests and reran the same focused
  suites: 331 PASS, exit 0, 2.43 seconds. No concrete release blocker found.
  An additional review agent was unavailable due to its service usage limit;
  it supplied no final frozen review. Do not count that failed attempt as approval.
- `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, helper/test syntax and
  `git diff --check` PASS.
- First full credential-free local suite FAILED: 249 files / 5735 tests PASS,
  one staging-d1-catchup Wrangler case exceeded unchanged 5000 ms timeout; exit 1,
  512.97 seconds. No source/timeout modification. Log
  `/tmp/takosan-asset-convergence-full.log`.
- Isolated unchanged catch-up suite: 32 PASS, exit 0, 3.04 seconds; the Wrangler
  case took 919 ms. Cause is unproven; no code/timeout edits.
- Final full rerun without parallel Wrangler/build: 250 files / 5736 tests PASS,
  exit 0, 490.18 seconds. Log `/tmp/takosan-asset-convergence-full-recheck.log`.
- Serial `pnpm build` PASS, exit 0. Log
  `/tmp/takosan-asset-convergence-build.log`.
- Native CLI public GET-only rehearsal against current f2b staging PASS at
  2026-10-06T10:25:27.065Z: three exact pairs, 7907 ms, asset SHA256
  `7b4a1677045508289e3a3cde42ac60c571984c44e2d711f176a9d92ad0b9744a`.
  Used a separate `/tmp/takosan-asset-wait-public-rehearsal.json` copy, leaving
  the original artifact unchanged. This is not a deploy or protected catalog
  certification and does not convert failed run 37384738093 into a success.

## Published candidate and additional evidence

[PR51](https://github.com/vn-tak/Tako-san/pull/51) head
`93e3db2004c518af7694edd4db89e918510c5d72` passed hosted CI
[37452057402](https://github.com/vn-tak/Tako-san/actions/runs/37452057402):
250 files / 5736 tests, 198.73 seconds, lint, typecheck, migration smoke and build.
It remains OPEN; no merge while diagnostics 37450399162 is pending/running.
The following documentation-only update still needs final-head hosted CI;
implementation a9f1c81 is unchanged.

Additional credential-free local probe compiled exact f2b/recovery37384670328 SQL:
`f4b6a4d05abfaff9f50a73063edc577e4b4e3ece9ff0f3a84b911e2ae2b42797`, 295 statements,
matching the actual receipt. A small local Wrangler SELECT of pragma_foreign_keys
returned 1. A full isolated local Wrangler seed operation did not complete and was
terminated, exit143. A second native Miniflare probe seeded synthetic500/6720/0
using SQLite, then did not obtain the local D1 binding; terminated, exit137 before
batch. No recovery import result was obtained. These incomplete local probes do
not explain the remote error and do not justify retry or certify production.
No production credential, remote mutation or repository code change was used.
Logs remain `/tmp/takosan-recovery-probe-seed.log` and
`/tmp/takosan-recovery-probe-native-batch.log`.

## Continuation

Finish current f2b read-only diagnosis and resolve the unknown import state from
stable catalog/ledger and repair identity evidence. Never blind retry or rollback.
Require
V1_CATALOG_CERTIFIED_STATIC / old-source static 100% / ledger 38 / 500 / exact
V1 fingerprint / integrity before guarded 0039. Complete full local and hosted
PR validation for the asset candidate, then merge only after pending production
operations finish and require green exact merged-main CI. Freeze that final SHA.

Restage final immutable main through shadow / 1 / 5 / 25 / D1 with T20=true and
protected authority/smoke at every step. Current f2b staging shadow cannot supply
a successful workflow/protected proof. Production uses the same final SHA with
T20=false: guarded 0039, read-only certification, shadow, one live synthetic AI
smoke, then canary 1 / 5 / 25 / D1. Every normal production Environment approval
remains. No corrected candidate production deployment or live AI success exists.
