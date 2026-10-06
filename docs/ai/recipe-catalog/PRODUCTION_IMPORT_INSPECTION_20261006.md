# Latest V2 import failure and read-only forensics - 2026-10-07 JST

Production deployment remains incomplete. User authorizes production recovery,
migration and deployment and confirms no real users; user-data retention
certification is excluded. Required normal production Environment approval remains.

Restore run37491535308 was approved normally by vn-taphoanhatung and completed
with FAILURE at2026-10-06T20:12:42Z. GitHub API independently confirms approval;
this run is no longer waiting. Source/main/full-tree/CI gates and fresh eight
strict-primary V2 guards passed. Receipt status is
IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED atBOOKMARK_AND_IMPORT,
importOutcomeATTEMPTED_COMPLETION_UNCONFIRMED, COMMAND_FAILED/exit1/provider10000.
No post-import ledger/catalog/runtime/finalWorker/rollback certification exists.

Failed batch source4092d4ca2dacee8bb01da484aae93592e9bd94da,
repairIdt21_v1_37491535308, SQL SHA256
75c8207ec177972c6cac92007a2c8f165a94ce39d7f03ea7973446aedcd4f441,
rollback SHA25626b9a034f3bab9697d6ccb8fd3253e2701a34ba3b6b6cb1b9d3c4f5fb2393825.
SourceDigest4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5,
guardVersion2/26rows, expectedobjects58/16tables/42triggers. PreLedger38/0038,
capacity7409664bytes. Bookmark
00000189-00000000-000050fc-8b4f0b48127dff432a85bd253c342de2,
captured2026-10-06T20:12:34.364Z. Artifact11442016163 digest
132ed6a0431356953cf696dbad594deba81e684ce260f4ee99c7dd3e189fe849.
Sanitized receipt remains privately available at
/private/tmp/takosan-production-v2-restore-37491535308/catalog-recovery-receipt.json.

Pinned Wrangler3.114.17 file import uses init/upload/ingest/poll. Code10000 alone
cannot identify which stage failed or prove that no write occurred. A successful
SELECT proves read access only; Cloudflare D1 requires D1:Edit for HTTP writes.
Token verification proves token state, not effective D1 write authorization.
References: https://developers.cloudflare.com/d1/platform/release-notes/ and
https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/.

The original37384670328 inspection cannot inspect this new prefix or26guardrows.
Branchcodex/production-v2-import-forensics extends read-only inspect-import with
sealed latest-incident source/SQL/rollback identity, repeated aggregate captures,
and bounded credential/HTTP evidence. Provider terminal state staysUNKNOWN_NO_CURSOR;
retryAuthorizedfalse. No write/import permission test, automatic recovery,0039 or
production application deployment is performed by this inspection.

Prior4092 staging shadow/1/5/25/D1 sequence is complete; the first25 run remains
failed and the fresh25 succeeds. Final staging D1run37493357178 proves500/exact
fingerprint/schema39/globald1/T20server+UItrue. A newly merged inspector mainSHA
requires fresh exact-main CI/tree binding and final-SHA staging proof for release.
Fresh public production readiness after the failed import ishealthy/static0/
cutoverfalse/globalstatic/fallbacknull/old136cb6ff; this does not settle D1 state.

Validation checkpoint (local, new implementation): independent peer review finds
no concrete blocker. Helper117/117PASS26.77s, credential70/70PASS508ms;
runner+approval initial69/69PASS17.83s. After adding the latest-incident restore
fence, runner+approval72PASS/1FAIL18.24s because an existing test expected the
later recoveryPreflight receipt after the new fence stopped earlier. The corrected
test requires the exact earlier phase, latest INSPECTION_BLOCKED, internal-inventory
MISMATCH and absence of later preflight; targetedrecheck1PASS/59skipped3.71s.
Helper's first117suite111PASS/6FAIL was a Python test harness authorizer teardown
issue, fixed without changing queries or safety policy; final117PASS. All skipped
counts here belong only to the targeted recheck, not a final verification waiver.
Final source lint/typecheck/migration smoke/build/actionlint1.7.12/diffPASS.
Executable checkpoint 86bfec959584f6a194543ec12470b956e5c951ff.
First full credential-free Node24 single-worker suite:252files/5992PASS/1FAIL
(492.44s); only existing staging-d1-catchup-check Wrangler test exceeded unchanged
5000ms limit at5273ms. Isolated unchanged file32/32PASS2.85s, Wrangler885ms.
Full recheck is running. No final full-suite/head/main CI or new remote inspection
success is claimed yet. Draft PR CI may run in parallel; merge remains gated.

New recovery orchestration also requires two stable inspections for the latest
fixed incident and zero repair objects/no observed commit/primary old-catalog bound
before any future pin/import. Applied or partial latest markers block replacement.
The diagnostic remains non-atomic and never infers terminal import or write grants.

Only published normal-reviewed code may access protected production secrets.
Next: finish focused and full mandatory validation, independent review, normal PR
merge, exact-mainCI; dispatch one consolidated protected read-only inspection.
Inspect latest marker/archive/target/live data and credential evidence before a
separately reviewed recovery decision. Do not blind retry, rollback or apply0039.

Previous sections are historical; their restore-WAITING statements are superseded.

---

# Published V2 recovery checkpoint - 2026-10-07 JST

PR53 final6e45d824363c24c8b63b629eefce8252e8f16a6f passed hosted
CI37488555229:251files/5873tests/283.24s,lint/typecheck/migration smoke/build.
Independent review covered all14changedfiles and exactfinal tree; no concrete
remaining blocker. PR53 merged normally at4092d4ca2dacee8bb01da484aae93592e9bd94da
on2026-10-06T15:40:10Z. Git independently verified ancestry and identical complete
treef97f89682665fcd9a3e5dd2888f8443ea76a1b2d. Registration37489453876 SUCCESS,
no production access. Exact-main CI37489453830 SUCCESS: 251 files / 5873 tests
PASS (380.38s), lint/typecheck/migration smoke/build PASS. Main stays frozen.

Corrected inspect37490593680 SUCCESS, normal vn-taphoanhatung review confirmed
both by API and authorization receipt. Source4092/reviewed6e45/PR53/CI37489453830.
Repeated original and corrected captures are OBSERVED_STABLE_NON_ATOMIC. Original
repair objects0, NO_RECOVERY_COMMIT_OBSERVED, primary availability at observations,
old catalog guards MATCH except the original incoming-FK SELECT failure.
Corrected preflight GUARDED_PREFLIGHT_MATCH: all eight guards MATCH/primarytrue,
failed0, blockers0. Canonical ledger38/0038 before/after; exact original100% static
version1a47f7f7-3d74-4801-b26a-b91f39c7942e/deployment41054fb9.../module5079c954...
unchanged. Original provider terminal UNKNOWN_NO_CURSOR/retryAuthorized=false.
Artifact11425077939 digest65f8b690d5b9aa1023782a009cdb306e80ded8b3a553a019d8d6f713671be3b7.
Receipt sha256fdf53e7d87a3b49e3d9720d776417ff36a9dfb5eaef5aeebddc3156eb13f80fe,
at /private/tmp/takosan-production-v2-inspect-37490593680/.

New intentional guarded restore37491535308 dispatched once at4092/reviewed6e45.
Source/main/full-tree/CI gate SUCCESS; recover waits for fresh required normal
review. API confirms vn-taphoanhatung/current_user_can_approve=false/approvals empty.
No recovery/import completion, 0039 or new production application is claimed.

Staging shadow37490615290 SUCCESS at4092/hardening089ae/shadow0/T20serverUItrue,
intentional rollbackconfirmationtrue. Protected500/exact V1 fingerprint, schema39,
three paired readiness/SW observations and hosted+independent smoke PASS.
Worker487b9511-ffbd-4dcf-bf61-476accef63be, SWfdd49e0895ac9b4093ec90ee029bb0108c3ae1d48342d71b9c09c7281fcce1b1.
Artifact11425960366 digest19d17d0586f63eb7ade42c82370c808bb8d2b2bbc408741d72ff7217b0531216.
Canary1 run37491302867 SUCCESS/VERIFIED: same4092/T20true/canary1/cutovertrue/
globalmixed/protected500/exactfingerprint/nofallback; paired readiness/SW three
consecutive observations and hosted+independent smoke PASS.
Worker01d47a91-5446-40e4-8dba-cad4b0c5df07. Artifact11425787328 digest
f7935341b57ab4027053d3607b737c770d458e15f40b4b99e2bd139639562692.
Root independently verified shadow/canary1/canary5 receipt fields.
Canary5 run37491745113 SUCCESS: exact4092/T20true/canary5/cutovertrue/globalmixed,
protected500/exactfingerprint/nofallback, paired assets and smoke PASS.
Worker7b63766d-43e9-42e4-bb98-ab2a4ae0efc2; artifact11426450116 digest
4b68c4855828d104c7ba231a1bf60827ca42ca807b018edf1aef87bbc6dbe148.

Initial canary25 run37492174560 FAILED after successful Worker publication
(d802a1ba-303b-4260-881d-5a3e1d01e883). Attempt1 saw previous same4092/canary5;
attempt2 readiness matched approved4092/canary25, then service-worker fetch threw
sanitized 'Service worker request failed'. Raw cause is unavailable; no specific
network/TLS/redirect/timeout or HTTP/body/identity error is proved. Artifact
11425273993 digest970184adfaea725aa45275458a9e1973a8f8764f807008db6bcaee12ee5c1d1f.
Failed receipt has previous authority only; deployed/assets/protectedauthority absent.
This run remains failed; D1 promotion was held at this failure checkpoint.

Independent live default-bounds paired readiness/SW proof PASS3/3 (7770ms),
SW HTTP200/JavaScript/no-store/exact4092/fdd49e...; public smoke PASS at livecanary25.
Read-only independent review confirms the failure is the intentionally fail-closed
SW fetch path; same-SHA/same25 redispatch is valid idempotent certification. No
source, test, policy, timeout or bound changes. One fresh canary25 run37493006431
was dispatched at4092/T20true/hardening089ae/rollbackfalse and completed SUCCESS.
It captured protected same4092/canary25 before upload and passed all original
post-deploy checks, independent three-pair readiness/SW and smoke. Root verified
receipt fields independently. Worker177c306e-8704-4d59-a88e-ee40c7c36ac1.
Artifact11427120019 digestf6e59680b66caced202a525c1985a44a4406d923591187846ad09a868d9442cd.
Keep original failed run and fresh run separate.

Final staging D1 run37493357178 SUCCESS and independently verified: exact4092/
hardening089ae/T20serverUItrue/39migrationmanifest/previous25->d1, protected actual
and globalSource=d1/ready500/exactfingerprint/nofallback. Hosted verifier observed
eight healthy known previous25 polls, then three paired readiness/SW observations
(11 attempts /36715ms) under unchanged bounds. Independent verifier3/3 PASS8305ms,
SWfdd49e.../HTTP200/JS/no-store/exact4092; public smoke PASS. Worker
dc22aad4-fe86-4a6d-84de-50abc545731e. Public GET recipe list HTTP200/count500,
ordered IDs and full runtime fingerprint MATCH; D1-only detail imp-199ff78d3d8c8ab3
HTTP200/full runtime fields MATCH. Root independently verified final hosted receipt.
Artifact11425934412 digestf52c5662c8ecf84d45fb07ece9f93b5083d25a0989f23f89d94aafdf5372acce.
Receipt /private/tmp/takosan-staging-d1-37493357178/release-manifest.json,
sha25686db04ff1ca4a81272bf4813b851766ada0f016fe3b69995ba24b133b760a2ba.
All final-SHA staging stages complete; no further staging dispatch is needed.

Required normal review of production restore37491535308 remains the external
blocker. Final API check: source gate SUCCESS/recoverWAITING/approvals[]/
current_user_can_approve=false/reviewervn-taphoanhatung. No restore/import completion,
0039, new production application, live synthetic AI success or production canary
is claimed. Keep remote main4092 frozen; local documentation checkpoint is unpublished.

Fresh public health GET /api/v1/health/ready confirms statusok, DB/queuehealthy,
old-source136cb6ff/static0/cutoverfalse/fallbacknull. Mistaken /api/v1/ready GET
returned401 and an empty-body JSON parse failed; corrected endpoint GET succeeded.
This is public health, not protected D1 certification.

Next: obtain required normal review of restore37491535308; require live certifiedV1/static/
500/exact fingerprint/ledger38/integrity before guarded0039, read-only certification,
then productionshadow/T20false/one synthetic AI smoke and1/5/25/D1.

Local logs: /tmp/takosan-guard-v2-hosted-main-ci.log,
/tmp/takosan-guard-v2-main-ci-watch.log, /tmp/takosan-4092-inspect-complete.log.
Independent continuation review verifies all inspect receipt fields and reports
no concrete blocker for the separately approved new restore. Synthetic smoke script
54933151... and fixture06707251... independently reviewed; invocation remains pending
until exact4092 productionshadow/T20false Deploy receipt. Script checks readiness,
not T20 flags; retain Deploy flag proof first. No physical model/accuracy claim.
This checkpoint is unpublished during freeze.

---

# Executed inspection and corrected guard V2 - 2026-10-06 JST

## Actual hosted results

PR52 final9a659fade16fee293fff1a634938fb23be6b7903 merged normally at main
660521b41cd0a71e1d2ce88806e2b7d041b30155. PR CI37458261832 and exact-main
CI37459993796 SUCCESS with251files/5774tests and all gates. Full tree equality
and ancestry independently verified. Registration37459993811 was credential-free.

[Inspect37460946708](https://github.com/vn-tak/Tako-san/actions/runs/37460946708)
completed SUCCESS after normal independent vn-taphoanhatung approval. This remains
read-only diagnostic success: mutations0, repeated OBSERVED_STABLE_NON_ATOMIC
captures, original repair prefix objects0, NO_RECOVERY_COMMIT_OBSERVED,
IMPORT_NOT_BLOCKING_AT_PRIMARY_OBSERVATIONS, canonical38/0038ledger before/after.
The exact original static100% version1a47f7f7-3d74-4801-b26a-b91f39c7942e and
module SHA2565079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1
remain unchanged. Fifteen successful primary queries, two failed, zero nonprimary
or unknown-primary results. Seven table shapes and active triggers MATCH;
only incoming_foreign_keys QUERY_FAILED. Other six pre-mutation guards MATCH.
Provider terminal state is still UNKNOWN_NO_CURSOR; retryAuthorized=false.
Artifact11411598439 digest
7d5915c219622e800fcf8d56f143c271f8a4e2e267c34f41f74d37093bf9b2a0.

[Staging37461272700](https://github.com/vn-tak/Tako-san/actions/runs/37461272700)
completed SUCCESS for exact660 shadow0/cutoverfalse/T20server+UItrue. Protected
500/exact fingerprint, three paired readiness/SW observations (four attempts,
11364ms) and smoke PASS. Worker7dc92d32-e796-4f6e-a298-70a62ad97e85.
SW SHA256b70b77490e85d9ef1a1534ba3c6d4003d3768005cbf65c0bfa8d0fa42b246e85.
Artifact11412347814 digest
f41ef63adbc728d0972348483f920feb4bd20172df463a839cabed4019c49478.
No staging canaries or production promotion ran. A new final main must restart
staging shadow progression on that same immutable SHA.

## Corrected recovery decision

The original incoming-FK query visits protected D1 names before filtering rows.
A credential-free SQLite authorizer reproduction rejects that query against the
documented _cf_KV table. Materializing application table names first avoids that
protected PRAGMA call while preserving full detection of application references.
This local reproduction matches the observed SELECT failure; the remote error
was not retained. It is not a recovered provider terminal error for the original
atomic import.

GuardVersion2 first checks every case-insensitive _cf_ name or tbl_name against
an exact approved tuple/DDL. Only the documented unquoted _cf_KV table WITHOUT
ROWID is accepted, or none in a local fixture. ASCII formatting/case normalization
preserves token boundaries. Unknown names/types/attachments/schema variants fail
before FK PRAGMA. All other tables are materialized then scanned; full projected
FK rows are compared in both directions, so unknown application FKs still block.
The same guards protect rollback. Historical migrations are untouched.

The original compiler is sealed to source-only INSPECTION_ONLY, retaining exact
f4b6a4d05abfaff9f50a73063edc577e4b4e3ece9ff0f3a84b911e2ae2b42797 SQL and
e2ab4ab3e5f010ceb3ae29d952f6bab3a77441efea502e9c1706bc3e0efce43c rollback
hashes. The restore compiler rejects that reserved ID and emits only guardVersion2
RESTORE_V1. New inspect-import also captures two corrected eight-guard preflights.
Canonical plan/source/hash binding and strict-primary metadata are required;
unknown inventory skips schema/FK inspection and remains BLOCKED.

A separately approved new restore requires repeated stable original no-commit,
primary availability and bounded old-catalog observations, repeated corrected
GUARDED_PREFLIGHT_MATCH, the exact original static100% Worker and fresh main/normal
approval before pin/bookmark/import. The receipt records intentional new V2 recovery
and original UNKNOWN_NO_CURSOR. These observations do not exclude future queued
provider work. Atomic guards and independent post-import V1 certification remain.
No blind original SQL retry, Time Travel restore or approval bypass is introduced.

File import/rollback now request --json and require a nonempty all-success array
before marking provider completion. Pinned Wrangler returns that array only after
its import poll reports complete.
Failure evidence retains only category, bounded exit status and up to four numeric
provider codes; raw errors/SQL/private rows remain excluded. Ambiguous completion
still stops without an automatic rollback or release claim.

## Current validation

Final compiler48/helper74/runner53/approval13 PASS on credential-free Node24.19.0.
Independent compiler+helper122/122PASS29.39s; runner+approval66/66PASS15.35s.
Lint/typecheck/migration smoke/syntax/diff and serial build PASS. Final full suite
251files/5873tests PASS,487.54s/exit0 on credential-free Node24. Executable
checkpoint4aeb7988c0ec2d44e1f8fbaa7e74eb9224e4cb11. Independent review fixed three concrete case-insensitive
SQLite identifier gaps: upper FK targets, upper trigger parents, and upper/mixed
original recovery prefix coverage. Prefix coverage folds case while expected
object identity/schema remains strict. No further concrete blocker in fresh review.
Original sealed SQL/source hashes remain exact. Compiler/helper early fixture
failures involved AUTOINCREMENT/sqlite_sequence, Node24 defensive SQLite, and an
index targeting a nonexistent fixture column; corrected fixtures preserve guards.
Initial runner integration45PASS/2FAIL was the fixture SQL splitter omitting later
catalogQuery SELECTs; corrected without weakening runtime guards.

Actual workerd/Miniflare local D1 atomic batch PASS:296restorestatements,
500hydrated/failures0/exact V1 fingerprint,36rollbackstatements restoring
6720ingredientrows/order0/ledger38/FK0. The isolated synthetic fixture was seeded
via the same immutable local SQLite prefix plus documented _cf_KV. Proof stays at
/private/tmp/takosan-guard-v2-workerd/proof.json. This tests generated batch and
real workerd D1 naming/constraints; it is not hosted import/production proof.
Initial combined Wrangler seed exceeded statement limit SQLITE_TOOBIG; first
direct combined fixture replay failed FK; two harness setup attempts failed module
and persistence discovery. These local failures reached no recovery/production
mutation. Optional Wrangler update cache was refreshed with a verified live npm
registry version response; no test timeout/source/tool version change.
No corrected hosted inspect or new production mutation has been dispatched yet.

Local gates and independent review are complete. Publish the PR, require green
final-head hosted CI, merge normally with exact-main CI, then
inspect corrected guards on hosted D1 under the normal reviewer gate. All eight
MATCH is required before intentional new V2 recovery. V1 live certification precedes
0039, final-SHA staging T20true shadow/1/5/25/D1, production same-SHA T20false shadow,
one synthetic live AI smoke and production1/5/25/D1. Release remains incomplete.

Earlier sections below are historical checkpoints.

---

# Production interrupted-import inspection - 2026-10-06 JST

## Observed production state

Normally approved read-only diagnostics
[37450399162](https://github.com/vn-tak/Tako-san/actions/runs/37450399162)
completed successfully at exact main
f2b00023ccb9a706d17ebe71321c0364a948ca75. All reads and the final main check passed.
This is diagnostic success, not release certification.

The repeated non-atomic captures show ledger 38 / 0038, no 0039, 500 recipes
(all version 2), 6720 ingredient lines, zero ingredient-order rows, 4938 steps,
289 linked nutrition rows and 500 runtime-field rows. Hydration has zero valid
recipes and 500 missing_ingredient_position failures. V1 semantic parity is
false (26 exact tuples; 6694 production-only and 2676 source-only tuples).
The source fingerprint verification is offline and does not certify live D1.

This does not settle the provider transaction from failed recovery
[37384670328](https://github.com/vn-tak/Tako-san/actions/runs/37384670328).
That operation confirmed the static pin and captured a Time Travel bookmark,
then lost import completion. No post-import certification or automatic rollback
ran. Never blind retry, rollback, migrate or promote using this observation.

Sanitized artifacts for 37450399162:

| Evidence | Artifact | SHA256 |
| --- | --- | --- |
| Diagnostic counts | 11409391979 | a0834810cc28783e4154149cdca7b234af4c68927d5ef45fc4f3d49194a7f101 |
| Certified V1 comparison | 11409531930 | ddfeb1eb1ffc853d628837c278cd5fcbd8943538a8c87bccf0533457237ceef8 |
| Historical lineage | 11409566730 | 47f7f4efd593022110292eb568f2f156866b7748dfb47a6a656e456375966241 |
| V2 lineage | 11409686744 | 266354362900289b7ab2ea8ba40604822319f872a1b618ffb702bfbaa0efd9ac |

## Asset convergence merge

[PR51](https://github.com/vn-tak/Tako-san/pull/51) final published head
d70d644e5d4e953ebe02894a28cf8fe4c110006e passed
[37453365335](https://github.com/vn-tak/Tako-san/actions/runs/37453365335),
including 250 files / 5736 tests, lint, typecheck, migration smoke and build.
It merged normally after diagnostics completed, at 2026-10-06T11:25:37Z.
Main is d2108588e4dfbccba6dbe75ab5fd0005330ae38d. Git confirms complete tree
equality with the reviewed head. Exact-main CI 37456321861 SUCCESS: 250 files /
5736 tests, 288.01 seconds, lint, typecheck, migration smoke and build.
Registration-only 37456321763 succeeded and performed no production operation.
The separate local evidence commit 8e507d8 remains on the prior asset branch.

## Bounded investigation

The new inspect-import operation is fixed to recovery 37384670328. It adds no
arbitrary SQL argument and retains exact-main CI, full reviewed-tree equality,
one merged implementation PR, dispatch attempt one by vn-tak and normal
independent production Environment approval by vn-taphoanhatung.

It independently re-proves the existing static 100% Worker, exact pin version
1a47f7f7-3d74-4801-b26a-b91f39c7942e and module SHA256
5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1 before and after
its SELECTs. The canonical 38-name ledger is also checked before and after.
Two matching aggregate inspections establish OBSERVED_STABLE_NON_ATOMIC only.

The helper recompiles the exact original repair ID and verifies SQL/source
hashes before reading its exact recovery prefix. It inspects known object
identity/schema, bounded counts and status identity; raw production rows and
provider error messages are excluded. When no repair objects exist it evaluates
the original pre-mutation guard expressions as SELECTs, including a bounded
schema-condition breakdown. The generated restore/rollback SQL is never sent or
written by this operation. It cannot pin, import, migrate or rollback.

## Provider-state limits and hypotheses

The public Cloudflare import API has POST actions init, ingest and poll. Poll
requires the current import at_bookmark cursor, which the failed wrapper did
not preserve. The Time Travel bookmark is a restoration point and is not a
proved substitute. No cursor-free import-status history endpoint is documented.

Cloudflare documents that imports block D1 for their duration. Repeated primary
SELECT observations can prove that no import blocks those reads at those times;
absent repair objects and the old shape prove no recovery commit was observed.
They do not establish a terminal provider failure reason or certify a retry.
The receipt preserves this limit and does not infer completion from workflow
success. References:
[Cloudflare API schema](https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json)
and [Cloudflare import response schema](https://raw.githubusercontent.com/cloudflare/cloudflare-python/main/src/cloudflare/types/d1/database_import_response.py).

The exact compiled SQL matches the failed receipt: 295 statements,
1,107,444 bytes, maximum statement 25,532 bytes, no explicit transaction wrapper.
It fits the documented query/file size limits. A possible schema guard issue is
its dynamic pragma_foreign_key_list scan visiting protected D1 internal tables;
this is an offline hypothesis requiring the read-only remote result. Another
possible boundary is Wrangler completion-response parsing. Neither is a proved
cause; the guard and mutation implementation remain unchanged.

## Validation and next action

Initial focused runner/authorization run FAILED 42 PASS / 1 FAIL: the real helper
parser excluded digits from exact_0038_ledger. Corrected the parser and added its
regression. Root focused run PASS: 3 files / 71 tests (runner31, helper27, auth13),
18.05 seconds, exit0. Helper final tests are still finishing. pnpm lint, typecheck,
check:migrations and build PASS; changed-file ESLint, helper/test syntax and diff
PASS. Full suite and final independent review remain pending.
No inspect-import dispatch,
production recovery, 0039 migration or new application deployment has run.
Finish focused regression/integrity/privacy tests and all repository gates;
independently review the frozen diff, publish a reviewed PR, require final-head
CI, merge normally and require exact-main CI. Then dispatch inspect-import once,
freeze main and obtain its normal independent production review.

Use the resulting proof to choose the smallest recovery action. Require live
V1/static/ledger/integrity/fingerprint certification before guarded 0039, then
final-source staging shadow/1/5/25/D1 with T20=true and production same source
with T20=false. Production shadow and one corrected live synthetic AI proof
precede production canaries. The operator's no-real-users instruction excludes
user-data preservation certification; payment/auth scope remains unchanged.
