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
- Lint/typecheck/migration smoke/build/diff PASS. Full local suite is running at publication; record final result before release.
- Independent source/contract review: no blockers. No live call of the corrected bundle has occurred.

This corrects a proved source bug; it does not claim the live scan failure is
resolved. Hold main stable for pending recovery37334212154, require green hosted
PR/main CI for the correction, then repeat an approved non-PII live smoke on the
exact corrected release before promoting production authority.
