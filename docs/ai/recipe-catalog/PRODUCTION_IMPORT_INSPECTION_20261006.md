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
