# Production D1 recovery compatibility checkpoint - 2026-10-06 JST

**State:** Release incomplete. PR49 merged normally at
`b33bd5a772d3ba165a6134751137c78482678186`; its final implementation head is
`6f5cd543e5b13dc2da32344975b8b48c55043baf`. Hosted PR CI37373658595 attempt2
and exact-main push CI37378906656 succeeded, each249 files/5653 tests plus
lint/typecheck/migration smoke/build. Registration-only37378906661 succeeded.
The operator authorizes recovery/migration/production deployment and confirms
no real users; user-data preservation certification is excluded.

**Remote evidence:** Recovery37379695824 was approved normally by
`vn-taphoanhatung` but failed at OFFLINE_PLAN_AND_PRE_LEDGER after verifying
identity and canonical38/0038 ledger. No Worker pin, catalog import or migration
ran. Artifact11373786998 has digest
`sha256:d0566283ce8969f7c741fd96fb994558892ff06a3188c10a7283bfe6003015a4`.
Read-only inspect37381283540 completed successfully after normal independent
approval. Status INSPECTED_READ_ONLY, mutations0, authorityVerifiedtrue,
latestEqualsActivetrue, active100%version1fe3fdae-0ffc-4f83-acb7-4aaecb3ea9c0,
compatibilityCode UNSUPPORTED_METADATA. Artifact11375730428 has digest
`sha256:8dd5b0de738265cd83fd11e49470898fdd302fb62185de7441c14f4eae71f810`.
Its safe schema reveals top-level annotations, AI binding project:string and
script_runtime.assets. Actual asset configuration values remain private.
Production still serves136cb6ff/d1-configured/static fallback with ledger38;
database and queue healthy. Catalog recovery/0039/new application remain pending.

**Changes:** Executable capacity checkpoint414f449 replaces unsupported page
PRAGMAs with meta.size_after from the already verified ledger query. Missing,
invalid or >=100MiB metadata stops before Worker inspection/pin/bookmark/import.
Cloudflare query metadata documents database bytes; pinned Wrangler3.114.17
retains this metadata. Actual production metadata availability is still unproven.
Worker executable ca91a1f accepts observed bounded annotations/AI project/runtime
assets. Full asset runtime equivalence is checked before traffic and after deploy;
unknown fields and changed behavior remain rejected.

**Staging:** Exactb33/T20true completed shadow37379785022, canary1 37380051888,
canary5 37380383487, canary25 37380656192, D1 37381006320. All succeeded with
500 recipes/exact V1 fingerprint/no fallback, paired flags and smoke. Final
Worker e3fceba8-ce27-4ef9-8e04-f76ce463b4c4; artifact11375060434 digest
`sha256:4d114b0700564a3d4325cfc3cad30880baa1ce301bb2c8ef9c4cf9bdc5df9c7d`.
A changed release must restart shadow with intentional catalog rollback=true.

**Checks/failures:** Capacity regression red16failed/4passed; green20/20PASS,
independently rerun. Four recovery suites75PASS, lint/typecheck/migration smoke
and diff PASS. Initial concurrent build failed with missing Service Worker build
token; standalone pnpm build passed (no source change). Cause is unproven; serialize
build with tests. Observed metadata regression red11fail/40pass; green51/51PASS and independent
rerun. Final lint/typecheck/migration smoke/syntax/diff PASS; independent reviews
find no blockers. Initial capacity-only fullsuite intentionally cancelled exit130
after26 files/1593 tests because the real inspect required another source fix;
that is not a full PASS. Frozen final candidate fullsuite is running; build follows
serially. Hosted final-head and exact merged-main CI remain required.

**Next:** Complete full local validation and the serial build, require green
final-head hosted PR CI, merge with a merge commit, then
require green exact-main CI and freeze main. Bind new restore-v1 attempt1 to that
main and its final PR head (ancestor/different SHA/identical complete tree), obtain
fresh normal production approval. Require V1_CATALOG_CERTIFIED_STATIC/ledger38/
500/exactfingerprint before guarded0039 and read-only certification. Restage the
same new SHA shadow/1/5/25/D1 T20true. Production shadow T20false, then live synthetic
AI proof before same-SHA1/5/25/D1. Existing unexecuted live smoke is
/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py.
**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Earlier checkpoint sections are historical.

---

# Production release blockers and replacement candidate

Status: fixes validated locally; production release remains incomplete.
Operator authorizes release and confirms no real users. User-data preservation
certification is excluded. Executable checkpoints: AI prompt correction
`e7d7db1`, Worker metadata compatibility `1ed5733`.

## Confirmed recovery API incompatibility

Cloudflare's GET Worker Version metadata documents optional `hasPreview` and
`modified_on`. The recovery static-pin validator accepted legacy `has_preview`
but rejected these documented fields as UNSUPPORTED_METADATA. That safe stop
occurs before upload, and can prevent recovery on a legitimate response.

The correction adds only these two informational keys. Unknown metadata still
fails before mutation. Worker source SHA, D1 identity, runtime/settings/bindings,
retained assets, downloaded module hashes, latest/active version checks and
normal independent Environment approval remain enforced.

Evidence: [Cloudflare GET Version](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/versions/methods/get/)
and [Cloudflare TypeScript SDK](https://github.com/cloudflare/cloudflare-typescript/blob/main/src/resources/workers/scripts/versions.ts).
Both were read without authenticated Cloudflare access. Actual production
metadata compatibility remains to be established by the protected runner.

## Executed validation

- Red regression before the source correction: 23 tests, 3 failed / 20 passed.
  Documented preview, modification timestamp and combined fields were rejected.
- Final focused static-pin suite: 24 / 24 PASS. Includes both preview spellings,
  their coexistence, read-only inspection, exact clone module hashes and rejection
  of unknown metadata alongside recognized fields. Independent reviewer reran it.
- `env -u CLOUDFLARE_API_TOKEN -u CLOUDFLARE_ACCOUNT_ID TMPDIR=/private/tmp TZ=UTC WRANGLER_SEND_METRICS=false pnpm exec vitest run tests/unit/recipe-catalog-recovery.test.mjs tests/unit/production-catalog-static-pin.test.mjs tests/unit/production-catalog-recovery-approval.test.mjs tests/unit/production-catalog-recovery-runner.test.mjs tests/unit/ai-vision-repair-prompt.test.ts --maxWorkers=1`: five files / 70 PASS.
- `pnpm lint`, `pnpm typecheck`, credential-free `pnpm check:migrations` and
  `pnpm build`, script syntax and `git diff --check`: PASS.
- `env -u CLOUDFLARE_API_TOKEN -u CLOUDFLARE_ACCOUNT_ID TMPDIR=/private/tmp TZ=UTC WRANGLER_SEND_METRICS=false pnpm exec vitest run --maxWorkers=1`: full combined executable candidate 249 files / 5653 PASS, exit 0, 514.45s, unchanged timeouts. Logs use `/tmp/takosan-release-blockers-` filenames.
- Independent metadata and release-sequencing review: no concrete blocker in fix.

The AI source defect and failed live synthetic receipt are recorded in
[PRODUCTION_AI_REPAIR_20261006.md](../scan/PRODUCTION_AI_REPAIR_20261006.md).
The correction preserves task/schema during retry; the actual live provider
failure's cause and corrected live readiness remain unproven.

## Remote execution checkpoint

Recovery run37334212154 was intentionally cancelled at 2026-10-05T20:49:15Z to
replace its known incompatible implementation. Its gate succeeded, but the
recover job was waiting for review with no steps, and completed cancelled with
no steps. Approval history and pending deployments are empty. This run executed
no Worker upload, catalog mutation or migration. It is no longer awaiting review.

Staging canary1 run37370418398 failed at 20:47:57Z before any release steps.
GitHub annotation: "The job was not acquired by Runner of type hosted even after
multiple attempts". No upload or deployment occurred. Staging still serves
healthy shadow on cd66bb86ca7c440b606fb8672e89428800df33c2, paired T20=true.

GitHub Status still reports [Actions degraded performance](https://stspg.io/c11dc9nb1zdq),
latest 20:47:22Z update confirming degraded availability. Prior-head PR49 CI
37371504325 failed before steps at 20:58:30Z with the same runner assignment
annotation. Final hosted CI remains mandatory; local results do not substitute for it. Main remains
cd66bb86ca7c440b606fb8672e89428800df33c2. Production public readiness at 20:48:24Z
reports old 136cb6ff/static fallback/CATALOG_DIAGNOSTICS, database and queue healthy.
No production catalog recovery,0039 or new application deployment has occurred.

## Replacement release sequence

1. Finalize PR49 with both confirmed blocker corrections and green final-head CI.
   Merge using a merge commit, preserving the original PR head ancestry. Require
   green push CI on the resulting exact main SHA, then freeze main during rollout.
2. Dispatch a new recovery attempt1 as vn-tak on main with ref=<exact merged main>,
   reviewed_sha=<final merged PR49 head>, operation=restore-v1 and
   confirm_catalog_recovery=true. Those SHAs must differ, preserve ancestry and
   have identical complete trees. Obtain fresh normal production Environment
   review by vn-taphoanhatung; the cancelled run's approval is not reusable.
3. Require V1_CATALOG_CERTIFIED_STATIC, old Worker pinned static at100%, ledger38,
   hydrated500 and exact V1 fingerprint before any 0039 operation.
4. Restart final-SHA staging shadow/T20true, then1/5/25/D1 with receipts. Existing
   staging remains shadow; inspect current authority before any rollback flag.
5. Run production-d1-migrate.yml with ref=<same main>,
   expected_pre_tip=0038_auth_onboarding_completion.sql,
   migration=0039_meal_composition_v2.sql and confirm_production_migration=true.
   Require normal Environment review, preflight, bookmark and post-certification.
   Full production-certify.yml follows 0039 because its schema gate requires it.
6. Deploy production same-SHA shadow/0/cutoverfalse, T20false,
   hardened_sha=089ae329ebba2ba38659c030266068aeace9b8a8 and intentional production
   confirmation. Prove a live non-PII scan on corrected code before promotion.
   Promote1/5/25/D1/0 only after each exact SHA/Worker/schema/authority smoke passes.

Runner-local live smoke is prepared at
`/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py`.
Static syntax and synthetic fixture hash PASS; no script execution or live API
call occurred. It requires an explicit full production SHA, verifies readiness
before guest/scan and after ready, submits once, checks the fixture's eight
items/quantity/units and total 333000, and logs out. Evidence is confined to that
known synthetic fixture; model identity and historical accuracy remain unproved.

Next action: require GitHub-hosted final-head CI on PR49, then execute the
replacement sequence. No production
Environment approval is currently pending after the cancellation.
