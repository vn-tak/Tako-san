# Production D1 and Worker API compatibility - 2026-10-06 JST

Release remains incomplete. Operator authorizes production recovery, migration and
release and confirms no real users; user-data preservation certification is excluded.
Normal independent GitHub production Environment approval remains required.

## Observed production evidence

PR49 merged at b33bd5a772d3ba165a6134751137c78482678186 with final head
6f5cd543e5b13dc2da32344975b8b48c55043baf. Hosted PR CI37373658595 attempt2
and exact-main CI37378906656 succeeded:249 files/5653 tests and all other gates.

Recovery37379695824 passed exact-main/full-tree/CI authorization and normal
vn-taphoanhatung approval. It stopped at OFFLINE_PLAN_AND_PRE_LEDGER after D1
identity and canonical38/0038 ledger verification, before Worker inspection/pin,
bookmark or catalog import. Receipt cannot expose the exact sanitized subprocess
cause. The page_count PRAGMA operation is independently incompatible with D1's
restricted PRAGMA contract; its causation of that live failure remains unproven.
Artifact11373786998 digest:
sha256:d0566283ce8969f7c741fd96fb994558892ff06a3188c10a7283bfe6003015a4.

Approved inspect37381283540 is read-only, status INSPECTED_READ_ONLY, mutations0,
authorityVerifiedtrue and latestEqualsActivetrue. Active100%Worker version
1fe3fdae-0ffc-4f83-acb7-4aaecb3ea9c0 still serves source136cb6ff, D1 configured
but static fallback CATALOG_DIAGNOSTICS. Database and queue are healthy.
The actual response schema is UNSUPPORTED_METADATA under the old helper because
it adds top-level annotations, AI binding project:string and script_runtime.assets.
Asset runtime fields include base_path, parsed headers, html_handling,
not_found_handling, raw_headers, raw_run_worker_first and serve_directly.
No private configuration values or production catalog rows are published.
Artifact11375730428 digest:
sha256:8dd5b0de738265cd83fd11e49470898fdd302fb62185de7441c14f4eae71f810.

## Bounded corrections

Capacity executable414f449 uses meta.size_after from the existing successful,
verified canonical ledger query. It accepts only a positive safe integer strictly
below100MiB. Missing/invalid/at-limit metadata produces PRE_IMPORT_CAPACITY /
CAPACITY_METADATA_INVALID and stops before Worker inspection, pin, bookmark or
import. There is no weaker fallback or additional unsupported PRAGMA request.
[Cloudflare Query API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/)
and [D1 return object](https://developers.cloudflare.com/d1/worker-api/return-object/)
describe size_after as database bytes. Pinned Wrangler3.114.17 preserves the query
response metadata in --json. Remote presence is still to be proved by the next run.

Worker executable ca91a1f accepts only observed supported metadata and validates the
asset runtime shape. Complete runtime assets and AI binding fields remain part of
stableResources equivalence, checked after upload before changing traffic and again
after deployment. Unknown fields and changed asset routing/headers still stop.
Strict named-binding inheritance preserves bindings/secrets including AI project.
No secret value is extracted or supplied to a replacement binding.

Pinned Wrangler3.114.17 copyWorkerVersionWithNewSecrets clones existing modules
with keep_assets:true and assets:undefined (compiled cli.js around150335-150430).
This correction follows that retention contract instead of inventing a multipart
mapping for internal base_path/parsed-header fields. Asset configuration is compared
in full before the new version can receive traffic. This proves observed runtime
configuration equivalence; it does not assert an unavailable asset content digest.
Exact old Worker source/module hashes, latest-active equality, full-tree/fresh-main
fences, approval policy, static authority proof and catalog-only rollback remain.

## Verification

Capacity red16fail/4pass; corrected20/20PASS with independent rerun. Four recovery
suites75PASS; lint/typecheck/migration smoke/diff PASS. Initial build run concurrently
with tests failed because the Service Worker build token was absent; standalone
pnpm build then succeeded without a source change. The concurrency cause is not
proven. Build and tests are serialized in subsequent validation.
Observed metadata red11FAIL/40PASS; green51/51PASS, independently rerun. Final
lint/typecheck/migration smoke/syntax/diff PASS; independent reviews find no
blocking findings. Capacity-only fullsuite intentionally cancelled exit130 after
26 completed files/1593 tests because real inspect required another source fix;
not a full PASS. Frozen final candidate fullsuite is running and build follows
serially. Final-head hosted CI and exact merged-main CI remain required.

## Release continuation

Staging b33/T20true completed shadow37379785022, canary1 37380051888, canary5
37380383487, canary25 37380656192 and D1 37381006320 with exact V1 500/no fallback.
A new SHA must restart shadow with confirm_recipe_catalog_rollback=true.

Merge the final reviewed compatibility head through a merge commit after hosted
CI; require exact merged-main push CI and freeze main. New restore-v1 attempt1
must bind that main and the final merged PR head (different SHA, ancestor, complete
identical tree) and receive a fresh normal production approval. Require
V1_CATALOG_CERTIFIED_STATIC, old-source static100%, ledger38 and exact500/fingerprint
before0039. Then guarded migration0039, production read-only certification,
new-SHA staging shadow/1/5/25/D1, production T20false shadow, corrected live
non-PII AI proof and production1/5/25/D1. No corrected live AI execution has occurred.

