# Production scan telemetry recovered; bounded validation repair candidate - 2026-10-08 JST

**Task/status:** Production rollout remains INCOMPLETE. Frozen deployed source/main
is `0c77720334d7154b25e81d6e6823ab804619adce`; shadow Worker
`f9c44422-4667-41bf-835e-51d5ce12787b` remains shadow/0%/cutover false,
global static, T20 false. Migration 37689543237 APPLIED only0039 and certification
37693128721 PASS. No canary dispatched; never replay0039 or recovery37536969564.
Operator excludes user-data retention certification because no real users exist.

**Confirmed telemetry:** The operator completed separately scoped Cloudflare API
MCP OAuth, including telemetry-query permission. Bounded `dry=true` queries retrieved
four scan events and seven events from the same invocation, verified against account
hash, Worker version, service, 50-second window, support hash `b6db841cbed9`, request
and trace IDs. OCR attempts1/2 on qwen-vl-ocr each returned SCHEMA_VALIDATION,
611 output tokens; escalation attempt3 on qwen3.8-flash returned INVALID_RESPONSE,
2 output tokens. This supersedes the previous log-access blocker. Schema fields and
escalation parsing branch were not logged; equal token counts do not prove equal
content. The original scan/fixture bytes remain missing and the scan was not replayed.

**Candidate changes:** On `codex/ai-scan-validation-diagnostics`, propagate only
fixed schema field paths and Zod codes (deduplicated, maximum8) into existing bounded
scan repair feedback and `ai_usage`; emit fixed invalid-envelope/empty-content/
unparseable-content/empty-items stages. Revalidate the diagnostic allowlist at Worker
logging. Unknown field names, item indexes, Zod messages/received values and raw
provider content are excluded. Public error codes, validation/quality gates, provider
models, token/call limits, queue fencing, payments and auth are unchanged. This fixes
lost actionable schema feedback and missing diagnostic precision, not a proved live
receipt-schema root cause. No live provider success is claimed.

**Checks:** Initial regression import failed before module creation; with a no-op
module, all6 regression assertions failed as expected. Initial focused6files/87tests
PASS. Final focused9files/109tests PASS4.75s, including adversarial log redaction,
bounded/deduplicated paths, repair prompts, provider stages and queue retry/fencing.
Initial `pnpm typecheck`, `pnpm lint`, `git diff --check` PASS. Full suite and final
checks are running; results must be recorded before publishing/merging the candidate.
No production write, Worker change or new scan occurred in this diagnostic continuation.

**Checkpoint/source:** Detailed evidence and continuation:
[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).
The former documentation checkpoint is `a29af19`; credentials/raw telemetry remain
ignored under `.wrangler/production-evidence/20261008`. Do not publish raw logs,
account IDs, receipt data or OAuth tokens. R2 bytes and email delivery remain unverified.

**Next action:** Finish checks and source review, normal PR/exact-head CI/merge and
exact-main CI, then revalidate the frozen new source through protected deployment
and a distinct non-PII provider validation. Original failed scan must not be replayed.
If validation still fails, use the new correlated diagnostics to isolate a smallest
justified fix. Only a passing provider gate permits production1/5/25/D1, each with
normal independent Environment approval. No review bypass or migration replay.

All preceding checkpoints below are historical.

---

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
[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

**Next action:** Obtain sanitized historical `ai_usage` + matching `scan_terminal`
metadata via Cloudflare Logs for the window above. The restricted CLI received 403;
operator was asked to provide metadata, without credentials or receipt content.
Then isolate the cause, add a meaningful regression and the smallest justified fix,
normal review/CI/merge and validation of any changed final source before a distinct
provider validation. Promote 1/5/25/D1 only after the provider gate passes. Never
replay migration 0039 or recovery `37536969564`, or bypass Environment review.

All preceding checkpoints below are historical.

---

# AI release checkpoint - 2026-10-06 JST

AI repair e7d7db1 merged in PR49/mainb33bd5a; its final-head hosted CI and
exact-main CI both PASS249/5653. Stagingb33/T20true completed shadow/1/5/25/D1
but mock AI cannot certify production Qwen. Actual approved recovery failed
before mutation and read-only inspect exposed further Worker API compatibility
requirements. Capacity414f449 and metadata/assetsca91a1f are separate narrow
release corrections. [Current release evidence](../recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Corrected application has not been deployed to production or live AI tested.
Existing synthetic smoke remains unexecuted until exact final merged-main
production shadow is deployed. Earlier checkpoint statuses are historical.

---

# Current release checkpoint - 2026-10-06 JST

The AI correction now shares PR49 with Worker metadata compatibility fix
`1ed5733`. Full combined validation: 249 files / 5653 PASS, 514.45s, unchanged
timeouts; lint/typecheck/migration smoke/build also PASS. Recovery37334212154
was intentionally cancelled before recover steps to replace its known metadata
incompatibility. It no longer awaits review. Staging canary and prior-head PR CI
failed before steps because GitHub could not assign hosted runners.

Require final-head hosted CI and exact merge-commit main CI, then a fresh recovery
run and normal Environment review. Final live smoke is prepared with an explicit
SHA fence but has not been executed. Actual corrected provider readiness remains
unproven. [Replacement sequence](../recipe-catalog/PRODUCTION_RELEASE_BLOCKERS_20261006.md).
The earlier publication/pending-run narrative is historical.

---

# Production live scan failure and repair prompt correction

Status: source defect corrected; actual live provider/scan readiness remains
unproven. Operator authorizes production release and confirms no real users.

## Live evidence

Normal production guest bootstrap200, one synthetic non-PII receipt accepted202,
terminal failed INVALID_RESPONSE after about22s, queue attempt1/max3, items0.
Worker136cb6ff; accept request24145b6c-8390-4e73-8337-a0beb6e52771, terminal
ba031f71-6c8c-4070-ac7d-ad0347c1c574, support hash096080ad9e97.
Fixture digest06707251296d2fd155bc6b73474fc08eccd4334b740ff50e07a4a0e11bf15fa9.
Logout200 revoked the disposable guest session. No email/OTP, security bypass,
secret extraction, user receipt, historical dataset or second scan was used.
Sanitized receipt stays local at
`/private/tmp/takosan-provider-smoke-20261006/sanitized-receipt.json`.

ReadinessAIconfigured and stagingmock do not prove Qwen availability. Public scan
status has no verified physical model identity. Queue attempt1 can contain multiple
provider calls. INVALID_RESPONSE narrows to malformed/empty provider-success
content, unparseable content or empty receipt items; schema mismatch and model
access errors use different codes. Which case occurred remains unproven without
sanitized provider usage/error telemetry. Original receipt accuracy is uncertified.

## Reproduction and correction

Executable checkpoint `e7d7db1`. When no promptOverride is supplied (normal scan),
QwenProvider chooses the complete default task/schema. QwenTaskRuntime's repair
path previously constructed promptOverride from an empty string and error text,
so attempts2/3 discarded those original instructions. A mocked real request
capture reproduces initial632-character receipt prompt then128-character retry
with neither extraction task nor schema. Custom overrides already survived.

Carry repair feedback separately in internal QwenCallOptions. Provider composes
its original default/custom prompt then appends that feedback. Same-model retry
and receipt multimodal escalation keep the schema and image. First attempt,
provider/model selection, validation/quality gates, budgets and attempt limits
are unchanged. Existing governance includes feedback in the input budget before
each call; generated error detail and maxCalls/maxAttempts are bounded.

## Executed checks

- Red reproduction: `TMPDIR=/private/tmp TZ=UTC pnpm exec vitest run tests/unit/ai-vision-repair-prompt.test.ts --maxWorkers=1`:4 failures/3 passes, exposing default receipt/label/fridge and escalation instruction loss.
- Green: same regression plus ai-runtime-governance, qwen-provider, ai-provider-recovery and ai-router suites:5 files/81 PASS.
- Lint/typecheck/migration smoke/build/diff PASS. Full local suite249 files/5647 PASS (513.76s), unchanged timeouts.
- Independent source/contract review: no blockers. No live call of the corrected bundle has occurred.

This corrects a proved source bug; it does not claim the live scan failure is
resolved. Hold main stable for pending recovery37334212154, require green hosted
PR/main CI for the correction, then repeat an approved non-PII live smoke on the
exact corrected release before promoting production authority.

## Publication and operational gates

PR49 is open; main stayscd66 for pending recovery37334212154. The independent
production Environment reviewer `vn-taphoanhatung` must approve that actual run.
Staging shadow37334571659 is healthy, exactcd66/T20true/500 D1-ready/no fallback.
Canary1 run37370418398 and AI PR CI37370993436 are queued before runner assignment.
[GitHub Actions incident](https://stspg.io/c11dc9nb1zdq) started19:11:58UTC;
20:39:27UTC update confirms job failures and hosted-runner/start delays, no ETA.
No duplicate dispatch, main advancement or production application deploy occurred.
Production remains old136cb6ff; actual live provider readiness remains unresolved.
