# Correlated scan telemetry and validation repair candidate - 2026-10-08 JST

This update supersedes the historical log-access blocker. Production stays on
frozen main0c777203, shadow/0%/T20false; no canary or new provider scan was run.

## Retrieved historical evidence

The deprecated Observability MCP authenticated with read scopes but rejected four
otherwise retrieved events because its response schema required absent outcome and
requestId fields. Empty aggregate responses from that server are not evidence that
historical logs were missing. The official replacement API MCP authenticated after
operator authorization with exactly `user:read`, `offline_access`, `account:read`,
`workers-observability.read`, `workers-observability-telemetry.write`. It grants no
Worker Scripts or D1 writes. These scopes belong to a separate OAuth application;
the deployment token was not changed. Credentials remain private and ignored.

Official endpoint/schema search preceded API execution. GET/accounts verified the
certified account hash. POST telemetry/query used `dry=true`, `view=events`, frigo,
10:41:50-10:42:40 UTC, ai_usage|scan_terminal, limit20. The response returned four
events; account/dry/timeframe validated. MCP response SHA256:
`8dd58a9ad6b5d3c9b3e6243aa3b8029216e9fe3c1498e94d1af74101c0369733`.
The follow-up query added the exact private requestId and returned seven events.
All four diagnostic events match certified account/service/shadow Worker version,
requestId and traceId; truncated=false. Terminal support hash matches b6db841cbed9.
Correlation uses identifiers, not time proximity. Request hash:
`1c190208bbb73874bde8b54aa57b22adbe3c7c6be020ab0d7d747fda15322a92`;
trace hash `3da4065f73408c96dfa807a3126749e2a5f99502cc3c420090f41262c662e1dd`.

| Provider attempt | Physical model | Failure | Input / output tokens | Latency ms |
| --- | --- | --- | --- | --- |
| 1 | qwen-vl-ocr | SCHEMA_VALIDATION | 945 / 611 | 4480 |
| 2 | qwen-vl-ocr | SCHEMA_VALIDATION | 970 / 611 | 6600 |
| 3 | qwen3.8-flash | INVALID_RESPONSE | 1023 / 2 | 2121 |

Terminal timestamp10:42:31.400UTC, receipt/failed/INVALID_RESPONSE/nonretryable,
queue attempt1/max3, latency14535ms. Two OCR calls successfully passed envelope
and content parsing but rejected ReceiptScanResultSchema; no auth/model/transport
failure is observed in these calls. Escalation INVALID_RESPONSE still does not
identify its parsing branch. Seven invocation events include the queue failure but
no schema issue metadata. Equal token counts do not prove equal content.

## Bounded candidate

Existing receipt validation wraps the Zod cause in a generic schema error. The
retry feedback repeats that generic message and omits the actual rejected fields.
This is a concrete feedback/diagnostic gap confirmed by source and regression.
The candidate reports fixed schema paths and Zod codes, deduplicated and capped8,
and includes them in existing bounded scan repair feedback. No raw provider values,
error messages, enum received values, field names outside the schema allowlist,
item indexes, images or credentials are emitted. Worker logging revalidates the
allowlist. Fixed parsing stages distinguish invalid_envelope, empty_content,
unparseable_content and empty_items without changing public error classification.

The candidate retains default/custom task/schema prompts, provider policy, max3
calls, token ceilings, fail-closed schema/quality checks and queue fencing. Only
scan/vision tasks receive the additional repair information. No guessed model,
token-cap or permissive schema change. Live receipt success remains unproven.

Executed from production-readiness worktree using Node24:

```sh
node .wrangler/production-evidence/20261008/search-telemetry-api.mjs
node .wrangler/production-evidence/20261008/query-scan-api-mcp.mjs
node .wrangler/production-evidence/20261008/query-scan-invocation.mjs
node .wrangler/production-evidence/20261008/certify-scan-telemetry.mjs
TMPDIR=/private/tmp TZ=UTC WRANGLER_SEND_METRICS=false pnpm exec vitest run tests/unit/ai-scan-failure-diagnostics.test.ts tests/unit/ai-vision-repair-prompt.test.ts tests/unit/ai-runtime-governance.test.ts tests/unit/qwen-provider.test.ts tests/unit/ai-provider-recovery.test.ts tests/unit/ai-router.test.ts tests/unit/scan-request-correlation.test.ts tests/integration/scan-queue-retry-policy.test.ts tests/integration/scan-queue-fencing.test.ts --maxWorkers=1
```

Query/correlation PASS; final focused9files/109tests PASS4.75s. Initial regression
failed module import before its creation, then all6 assertions failed against a
no-op diagnostic module. Initial typecheck/lint/diff PASS. Full suite/final checks
are pending. This turn has zero production writes, Worker changes or provider
submissions. Original failed scan must not be replayed. Required next action is
reviewed/validated new-source release, then a distinct non-PII validation; only its
passing provider gate permits canary progression. Applied0039/recovery stay applied.

Earlier checkpoint follows as historical evidence.

---

# Production shadow and failed AI scan checkpoint - 2026-10-08 JST

Status: production rollout incomplete; shadow healthy; provider gate failed;
historical telemetry access blocked. This checkpoint supersedes earlier claims
that PR58, certification or the new production shadow were still pending.

## Release and live state

Repository `vn-tak/Tako-san`; frozen main/source
`0c77720334d7154b25e81d6e6823ab804619adce`; exact-main CI
[37686743768](https://github.com/vn-tak/Tako-san/actions/runs/37686743768) SUCCESS.
The previous documentation checkpoint recorded complete final-source staging
shadow/1/5/25/D1 (37687850533/37688177602/37688484213/37688778057/37689066860).
Its private progression packet is now missing; those detailed operator checks are
historical observations, not fresh recovered staging byte proofs.

Production migration [37689543237](https://github.com/vn-tak/Tako-san/actions/runs/37689543237)
applied only `0039_meal_composition_v2.sql`, ledger 38 -> 39. Production certification
[37693128721](https://github.com/vn-tak/Tako-san/actions/runs/37693128721) PASS,
read-only. Production shadow
[37763248411](https://github.com/vn-tak/Tako-san/actions/runs/37763248411) SUCCESS,
including hosted 255 files / 6309 tests (438.75s), lint/typecheck/migration-smoke/build.
All three recovered runs are attempt 1, exact source, normally approved by
`vn-taphoanhatung`, different from dispatch actor `vn-tak`. Current Environment
policy prevent_self_review is false; actual approvals are independent. No bypass
or policy change occurred. Earlier assumptions requiring that policy flag to be
true were corrected in the local recovery collector, not in GitHub configuration.

Shadow Worker `f9c44422-4667-41bf-835e-51d5ce12787b`; deployment
`7f2f522f-c9cf-4762-9022-3435ae7e6e38`; verified DB binding
`f975ec39-b2c8-4a2a-80e1-0366054599d3`. Current serving state is shadow, 0%,
cutover false, global static; the protected shadow probe successfully reads D1.
T20 server/UI flags false. No production canary dispatched. Operator excludes
user-data retention certification because there are no real users.

Six new public GETs independently verified three readiness/assets pairs through
`2026-10-08T11:48:52.379Z`: exact source, DB/queue healthy, config OK, fallback null,
service-worker SHA256
`9b44e7d279a4630866695a3dde761e4f046d9a8c5cbb8ba0abd034c18c320b18`.
AI configured is configuration evidence only. Email delivery remains unverified.

## Recovered archive and domain proofs

The original `/private/tmp/takosan-*` evidence and helpers disappeared during a
session interruption. The operator explicitly authorized recovery and diagnosis.
Only hosted artifacts/logs were recovered; original scan receipt/fixture and
operator-wrapper/control bytes are unavailable. New local recovery files live
under `.wrangler/production-evidence/20261008` in the production-readiness worktree,
are ignored by Git and remain private. Never label recovered history as original
byte proof or claim vanished executable hashes were reverified.

The GET-only collector downloaded real ZIP bytes, matched API sizes/digests and
workflow_run repository/run/source provenance, required exactly one expected JSON
entry, checked extracted byte equality and exact CI/run/attempt/normal approval.
Migration manifests have no workflowRunId: their binding uses verified archive
workflow_run provenance, artifact names and manifest source/CI/migration fields.
Completed recovery proofs use exclusive creation and cannot be overwritten.

| Run / artifact | ZIP SHA256 | Extracted JSON SHA256 |
| --- | --- | --- |
| 37689543237 candidate | `b97b7c947cf15c1d07999bb670f95ed2698eb706934cea440205e7c601504c49` | `4eb873ae44dd199b09afadb6e38328d3e07e1a7f60cb3b16141906f37106aa1d` |
| 37689543237 receipt | `b13ce52be0a79bad2e92cf0d49d37238451425b7e89d5cedb1e5af3468987354` | `51f5b87e5c25b87ee4c4e165ba1356d99ab8d41e0b41e154229684f28a68fb22` |
| 37693128721 candidate | `ab5ef81ca47eeee7ae61b59c0c5f3ba9e875cca97f9f89eef74b09a06cdc9aec` | `05e39d0ffb43502a6d5708d78b7f55b768165871d6fa6bb912d28a16fd3d535e` |
| 37693128721 receipt | `cc3c5efb7ceafb602e3519c01ecd7cb579ea1da254845baa8c23b58fb99b8ae0` | `98b502e1cc8ba4d77b7814aa01f74e10c00476012dc62dd01d230a9cf1f47b71` |
| 37763248411 candidate | `a2ad6432f02a92d1b07d95e4b8df490f72542ba181cd46966b368b35eb0f1045` | `1628a35f823225af7ef315f68caf6cccc74ea09302ebc16a9a9c2897a460bec4` |
| 37763248411 receipt | `eea03b62dcb15ab0cc224a7f20c927f0137817e52459b4a866ab7723845a4f78` | `bdda39b9ee6eccb3c7a95a415318822a120d1906db311124b0c2e6cf016e31cc` |

Cross-receipt assertions PASS: same source/CI/DB, exact canonical ledger39,
500 physical/hydrated recipes, hydration failures0, operational media500/ready500,
zero invalid/orphan/duplicate/no-active-hero counts, FK[] and quick_check=ok.
Runtime fingerprint:
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.
Migration's pre/post metadata and schema digests match:
`e12c0bd9871406bd3477d304f345308fb5e912f85712f41cdbbb617e21792e0c` and
`0503f30babe7efb858c02bb118b097c7610d3c834954c3cfb6912b76dca1feb6`.
This proves observed non-atomic metadata preservation, not fresh R2 object bytes.
No recovery replay, migration replay or database restoration was performed.

Executed Node24 commands, from the production-readiness worktree:

```sh
node .wrangler/production-evidence/20261008/recover-github-evidence.mjs shadow
node .wrangler/production-evidence/20261008/recover-github-evidence.mjs certification
node .wrangler/production-evidence/20261008/recover-github-evidence.mjs migration
node .wrangler/production-evidence/20261008/verify-recovered-chain.mjs
node .wrangler/production-evidence/20261008/verify-live-shadow.mjs
```

All three collectors and chain/live checks completed PASS after correcting two
collector assumptions: actual self-review policy and absent migration workflowRunId.
The collector failures are retained in private history. No full local suite was
rerun for this documentation-only checkpoint; earlier test/build failures remain
recorded and hosted success does not erase them. An initial local hosted-count
validator failed because gh represented ANSI as caret sequences; normalizing both
forms verified the unchanged 255/6309/438.75s output. This was a validator failure,
not another application-test run or a hosted test failure.

## Failed synthetic provider validation

Exactly one scan was submitted after verified shadow on 2026-10-08:
10:41:55.807696-10:42:33.651903 UTC (19:41:55-19:42:33 JST).
Guest bootstrap200, submission202, four status polls, terminal failed /
INVALID_RESPONSE / queue attempt1 / max3 / items0; logout200. Support hash
`b6db841cbed9`. Fixture SHA256
`06707251296d2fd155bc6b73474fc08eccd4334b740ff50e07a4a0e11bf15fa9`;
expected eight items / 333000 VND. These values were recovered from the preceding
conversation observation. Original scan receipt and fixture bytes are gone and
cannot be reverified; extraction accuracy is uncertified. The private history
marker says originalReceiptAvailable=false/originalReceiptBytesReverified=false,
submittedScans=1/resubmissionPermitted=false. Do not replay this scan.

Source inspection confirms INVALID_RESPONSE can represent an invalid JSON envelope,
empty content, non-JSON/unparseable vision content or empty receipt items. Generic
scan error mapping can also use it. Schema/model/access errors have separate codes.
One queue attempt can contain up to three provider calls: OCR twice followed by
controlled multimodal escalation. Usage is captured before response-content parsing;
`ai_usage` includes model/attempt/tokens/status/failureCode, and `scan_terminal`
includes the support hash/queue attempts/error code. Neither logs raw provider
content or an exact response-parsing branch. Historical metadata may narrow the
cause without proving a precise parsing failure.

The earlier prompt repair `e7d7db1` preserves original task/schema on retries,
proved by local tests, but this live result still fails. No speculative model,
endpoint, token-cap, parsing, retry or config change was made. OCR custom JSON
prompts are documented by Alibaba; message order or a 2048 output cap is not a
confirmed cause merely because those settings exist.

## Cloudflare log access result

Restricted Wrangler OAuth login succeeded after the operator completed the renewed
link. Scopes are account:read, workers_tail:read and offline_access. Account ID
matched certification hash
`2f03cbab60435748ca6e6d278fd0c2c66ba3fb71d9a3bf3cc1bbf8a4fa702b5d`.
Credentials were used privately for authentication and were not printed/published.

Executed `node .wrangler/production-evidence/20261008/query-scan-telemetry.mjs`:
POST `/accounts/{accountId}/workers/observability/telemetry/query`, dry=true,
view=events/limit100; filter service=frigo and ai_usage|scan_terminal;
timeframe 10:41:50-10:42:40 UTC. This performs a log query without saving results,
not a Worker/D1 mutation. It returned HTTP403, success=false, API code10000,
response233 bytes/SHA256
`ec1ce23212b4bdd8ba0a57465d5ec266c8d72ffb56750aa5f34a955b227de9f4`.
No events were retrieved. A 403 is an authorization result, not proof of missing logs
or the AI failure cause. No token or OAuth scope was expanded.

The [official query endpoint](https://developers.cloudflare.com/api/resources/workers/subresources/observability/subresources/telemetry/methods/query/)
requires Workers Observability Write despite the read-only diagnostic purpose.
The operator was asked to obtain sanitized ai_usage and scan_terminal metadata
from the frigo Observability Logs window above (matching support hash). Do not
request secrets, provider content, user images or unrelated service/user logs.

## Exact continuation

1. Inspect sanitized historical metadata for the failed scan. Validate service,
   timeframe, terminal support hash and invocation correlation before associating
   usage with this scan; ai_usage itself has no scan identifier.
2. Separate observed provider failures from hypotheses. If metadata still cannot
   distinguish parsing branches, design bounded safe diagnostics before changing
   behavior; never use a guessed model/token/parser repair to force a pass.
3. A justified source fix needs a meaningful deterministic regression, relevant
   checks, normal review/CI/merge and a frozen new main. Any changed final source
   must receive the required staging and production checks before a distinct
   provider validation. Recreate/review missing operators if needed; vanished
   control receipts cannot certify newly created executable wrappers.
4. Only a passing provider gate permits production 1/5/25/D1, with separate normal
   Environment approvals and verified receipts/assets/readiness after each phase.
   Migration0039 and recovery37536969564 are already APPLIED: never replay them.
5. Keep documentation checkpoints separate from main while the release remains
   frozen. Update the actual outcome and limitations before claiming completion.
