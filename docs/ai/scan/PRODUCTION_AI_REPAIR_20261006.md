# Production rollout complete - 2026-10-08 JST

**Task/status:** PRODUCTION_RELEASE_COMPLETE. Production is deployed and final
verification has passed at 2026-10-08T14:30:05.305Z. No pending run or approval.
Public application: [Takosan](https://frigo.tungjpstore.net).

**Source/change:** Frozen main and deployed source
`6f6eaaab518cf2430de225d0be73d695b40706e4`; normal [PR59](https://github.com/vn-tak/Tako-san/pull/59)
merge, implementation `648dbd32010363712f219d25ca0b5109db37c3d3`.
The reviewed fix preserves bounded, deduplicated fixed schema paths/Zod codes in
scan repair feedback and sanitized logs, and records fixed parsing stages.
Provider models, schema/quality gates, call/token budgets and queue policy remain
unchanged. Source review was self-review; independent code review is not claimed.
This final checkpoint changes documentation only.

**Actual production:** [Deploy101 / run37789673028](https://github.com/vn-tak/Tako-san/actions/runs/37789673028)
SUCCESS, Worker `f92df570-6cb0-43de-bfa6-a4c7bd7f07d8`, deployment
`274b145a-d41d-462f-a97d-c4c993b94dcd`. Recipe authority is `d1`, global source
`d1`, canary percent0, cutover enabled, T20 server/UI false. Schema39;
500 physical/hydrated recipes, zero hydration failures, media500/ready500,
FK[] and quick_check=ok, no fallback. Runtime fingerprint:
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.
Applied0039 (migration37689543237) and recovery37536969564 remain APPLIED.
User-data retention certification is excluded by operator authorization.

| Stage | Staging Run | Production Run | Actual Proof |
| --- | --- | --- | --- |
| Shadow 0% | [37781071862](https://github.com/vn-tak/Tako-san/actions/runs/37781071862) | [37782664023](https://github.com/vn-tak/Tako-san/actions/runs/37782664023) | PASS |
| Canary 1% | [37781412721](https://github.com/vn-tak/Tako-san/actions/runs/37781412721) | [37784465213](https://github.com/vn-tak/Tako-san/actions/runs/37784465213) | PASS |
| Canary 5% | [37781697963](https://github.com/vn-tak/Tako-san/actions/runs/37781697963) | [37786352966](https://github.com/vn-tak/Tako-san/actions/runs/37786352966) | PASS |
| Canary 25% | [37782044271](https://github.com/vn-tak/Tako-san/actions/runs/37782044271) | [37788079550](https://github.com/vn-tak/Tako-san/actions/runs/37788079550) | PASS |
| Full D1 | [37782346206](https://github.com/vn-tak/Tako-san/actions/runs/37782346206) | [37789673028](https://github.com/vn-tak/Tako-san/actions/runs/37789673028) | PASS |

**Deployment evidence:** All10 stages PASS on the same frozen source. Aggregate
verification rehashed20 actual ZIP archives and their20 extracted JSON files
(40 digest checks), checked30 separately requested readiness/service-worker pairs,
and verified the same production D1 and exact previous-Worker rollback chain.
All5 production runs had normal independent Environment approval by
`vn-taphoanhatung`; no bypass. T20 is enabled only in staging.
Service-worker SHA256:
`6a0af02b38a9c35d75fcd43ab75c0790d30ebf613d1b7e3297d1ad78d87b092a`.
Aggregate proof: `complete-production-release-audit.json`, SHA256
`521474fe037bd02d937c28d24c8c99923bac7b0c400409ad0404283bc6c660d8`.

**Executed gates:** Exact-main CI37780227955 PASS256files/6316tests308.04s;
final-head CI37778968273 PASS256files/6316tests424.01s. All5 production deployments
re-ran full hosted gates with256files/6316tests each; final D1 tests414.93s.
Hosted lint/typecheck/migration-smoke/build all PASS. Earlier local focused tests
9files/109tests and `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`,
`pnpm build` PASS. Earlier local full `pnpm test` with Node24, CI=true,
TMPDIR=/private/tmp and maxWorkers2:255files/6315tests PASS,1 unchanged5s Wrangler
staging-startup timeout,348.06s. Isolated unchanged rerun32/32 PASS3.31s,
startup1099ms. Hosted success does not erase that local failure. No local full
suite was rerun for this final documentation-only checkpoint.

**AI provider proof:** Exactly one distinct synthetic scan on the new shadow,
support `be56b53e3b17`, accepted202 and terminalready;6/6 names, quantities,
units, unit prices, line totals and total138000VND match. Queue attempt1/max3,
logout200; no inventory confirmation. Correlated Cloudflare telemetry proves
qwen-vl-ocr first-attempt success (1311input/454output tokens,4089ms), terminal
latency5284ms, no repair/escalation. Fixture SHA256:
`8a47ba31ff70f9ee544c96e8772b64edb4dcce2b3a1de85ee1ebada624ab8cd4`.
The historical failed scan `b6db841cbed9` was not replayed. Its exact schema
defect and original receipt accuracy remain unproved; successful new input does
not certify all receipts or repair branches.

**Final public/UI proof:** PASS500 ordered recipe IDs and exact runtime
fingerprint; all500 canonical media GETs PASS with zero failures,
61128744 total bytes. SHA256 of bytes equals ETag;
length/MIME/decoded dimensions and cache/security headers match the contract.
This verifies public served bytes; direct R2 bucket API inspection and image
relevance remain unverified. Final normal guest recipe search and imported
recipe detail PASS mobile390x844 and desktop1365x900:500 recommendations,
actual canonical image loaded, detail matches public list, no overflow/page
errors/server failures, logout200. The successful final check used2 guest
sessions; one earlier session was logged out after the selector failure below.
No inventory/cooking/payment/provider mutation was requested by these UI checks.
Anonymous landing/auth rendering and reduced-motion input visibility also PASS;
the official Google iframe rendered on mobile/desktop. Actual Google sign-in
and email delivery remain unverified.

**Readiness policy/operator corrections:** Final readiness is HTTP200,
`status=degraded`, database/queue=ok, config.ok=true, no fallback. The sole issue
is `CONFIG_RECIPE_CATALOG_D1_AUTHORITY` / severitywarning: intentional policy
from ADR-026, `src/worker/config/validation.ts:149` and
`tests/unit/recipe-catalog-authority.test.ts:136`. Final checks require exactly
this issue; they do not accept arbitrary degraded warnings. An initial operator
check wrongly expected statusok; its failure and three consistent fresh readings
are preserved. The first imported-detail selector matched both h1/h2; the corrected
check requires the visible primary h1 and retains all data/image/logout checks.
The partial screenshot is preserved. Earlier English Google iframe-title and
during-deploy textbox waits also failed; subsequent normal/reduced-motion checks
passed. These were operator check corrections; no application change was made.

**Evidence/limits:** Private receipts, hashes, responses, telemetry, screenshots,
operator scripts and continuation remain ignored under
`.wrangler/production-evidence/20261008`. Final proof files are
`complete-production-release-audit.json`,
`production-6f6eaaab518cf2430de225d0be73d695b40706e4-final-public-catalog-media-proof.json`,
`production-6f6eaaab518cf2430de225d0be73d695b40706e4-final-recipe-ui-proof.json` and
`final-operator-contract-corrections.json`.
Original staging private/operator packets disappeared; those original observations
remain historical. All10 new-source stages now have actual verified archives.
Payments/PayOS and unrelated authentication/infrastructure remain unchanged.

**Next action:** Rollout complete for this source; D1 serves all households and
T20 remains false. Do not replay recovery37536969564, migration0039 or either
existing AI scan. Future source changes require normal PR/main CI/staging/release
gates. Google sign-in/email delivery and broader receipt accuracy require separate
validation before claims about those flows.

**Documentation checkpoint:** Publish these6 canonical records on
`codex/ai-scan-rollout-evidence`, separate from frozen source. Previous checkpoint
`c541e9ef4157e0a9dcac7113c072867cf7625432`; its bytes are preserved below. Restore
clean `codex/ai-scan-validation-release` at frozen main after publication.

[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

All preceding checkpoints below are historical.

---

# Production rollout checkpoint - 2026-10-08 JST

**Task/status:** PRODUCTION_D1_APPROVED_GATES_RUNNING; rollout INCOMPLETE.
Frozen main/source 6f6eaaab518cf2430de225d0be73d695b40706e4, implementation648dbd32010363712f219d25ca0b5109db37c3d3,
normal PR59 merge; exact-main CI37780227955 PASS256files/6316tests308.04s.

**Actual production:** run37788079550, Workerf0da227b-a737-4b59-aef4-c8ad66ac63c7,
canary/25%/cutovertrue/globalmixed/T20false.
Schema39,500 hydrated recipes, zero hydration failures, media500/ready500,
FK[]/quick_check=ok, no fallback. Runtime fingerprint
f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
Applied0039 (migration37689543237) and recovery37536969564 remain APPLIED.
User-data retention certification is excluded by operator authorization.

| Stage | Run | Actual Proof |
| --- | --- | --- |
| shadow-0 | [37782664023](https://github.com/vn-tak/Tako-san/actions/runs/37782664023) | PASS |
| canary-1 | [37784465213](https://github.com/vn-tak/Tako-san/actions/runs/37784465213) | PASS |
| canary-5 | [37786352966](https://github.com/vn-tak/Tako-san/actions/runs/37786352966) | PASS |
| canary-25 | [37788079550](https://github.com/vn-tak/Tako-san/actions/runs/37788079550) | PASS |

**Checks/evidence:** 4 production stages, 16 rehashed ZIP/JSON digests,
12 independent readiness/assets pairs; same D1/source/CI, normal independent
Environment approvals and exact previous-Worker rollback chain PASS. Service-worker
SHA2566a0af02b38a9c35d75fcd43ab75c0790d30ebf613d1b7e3297d1ad78d87b092a.
Final-source staging shadow37781071862/1%37781412721/5%37781697963/
25%37782044271/D137782346206 all PASS; T20 enabled only in staging.

One distinct scan PASSbe56b53e3b17, accepted202, ready,6/6 items/quantities/units/
prices and total138000VND match, logout200, no inventory confirmation. Correlated
Cloudflare telemetry proves qwen-vl-ocr success on attempt1 (1311input/454output,
4089ms), no repair/escalation. Original b6db841cbed9 scan was not replayed.
Production anonymous landing/auth rendering PASS mobile/desktop; official Google
iframe rendered on both; reduced-motion input visibility PASS. Initial operator
English-title selector timed out against localized title; another textbox wait
failed during deploy. Both failures are preserved; subsequent inspected normal
and reduced-motion checks passed. No product fix was inferred from those waits.

**Limits:** Historical exact schema defect and original receipt accuracy remain
unproved. Successful new receipt does not certify every image or repair branch.
Current R2 object bytes and actual Google sign-in/email delivery remain unverified.
Earlier local full suite had1 unchanged5s Wrangler startup timeout:255files/
6315tests PASS,1failed348.06s; isolated32/32PASS3.31s, startup1099ms.
Focused9files/109tests and local lint/typecheck/migration/build PASS; hosted full
success does not erase the local timeout. Source review is self-review; independent
code review is not claimed. Payments/PayOS/auth and applied migrations are unchanged.

**Next action:** Wait for approved run37789673028; collect actual artifacts and live
proof after SUCCESS before the next stage. Each production run requires a separate
normal Environment review by vn-taphoanhatung.

**Checkpoint:** Keep this documentation on codex/ai-scan-rollout-evidence,
separate from frozen source. Exact receipts/hashes, private responses/telemetry,
operator scripts and continuation live ignored under
.wrangler/production-evidence/20261008. Restore clean source branch
codex/ai-scan-validation-release after publishing.

[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

All preceding checkpoints below are historical.

---

# Production rollout checkpoint - 2026-10-08 JST

**Task/status:** PRODUCTION_CANARY_25_APPROVED_GATES_RUNNING; rollout INCOMPLETE.
Frozen main/source 6f6eaaab518cf2430de225d0be73d695b40706e4, implementation648dbd32010363712f219d25ca0b5109db37c3d3,
normal PR59 merge; exact-main CI37780227955 PASS256files/6316tests308.04s.

**Actual production:** run37786352966, Worker426db3b9-2db3-45a8-94c5-b9b7e330a61b,
canary/5%/cutovertrue/globalmixed/T20false.
Schema39,500 hydrated recipes, zero hydration failures, media500/ready500,
FK[]/quick_check=ok, no fallback. Runtime fingerprint
f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
Applied0039 (migration37689543237) and recovery37536969564 remain APPLIED.
User-data retention certification is excluded by operator authorization.

| Stage | Run | Actual Proof |
| --- | --- | --- |
| shadow-0 | [37782664023](https://github.com/vn-tak/Tako-san/actions/runs/37782664023) | PASS |
| canary-1 | [37784465213](https://github.com/vn-tak/Tako-san/actions/runs/37784465213) | PASS |
| canary-5 | [37786352966](https://github.com/vn-tak/Tako-san/actions/runs/37786352966) | PASS |

**Checks/evidence:** 3 production stages, 12 rehashed ZIP/JSON digests,
9 independent readiness/assets pairs; same D1/source/CI, normal independent
Environment approvals and exact previous-Worker rollback chain PASS. Service-worker
SHA2566a0af02b38a9c35d75fcd43ab75c0790d30ebf613d1b7e3297d1ad78d87b092a.
Final-source staging shadow37781071862/1%37781412721/5%37781697963/
25%37782044271/D137782346206 all PASS; T20 enabled only in staging.

One distinct scan PASSbe56b53e3b17, accepted202, ready,6/6 items/quantities/units/
prices and total138000VND match, logout200, no inventory confirmation. Correlated
Cloudflare telemetry proves qwen-vl-ocr success on attempt1 (1311input/454output,
4089ms), no repair/escalation. Original b6db841cbed9 scan was not replayed.
Production anonymous landing/auth rendering PASS mobile/desktop; official Google
iframe rendered on both; reduced-motion input visibility PASS. Initial operator
English-title selector timed out against localized title; another textbox wait
failed during deploy. Both failures are preserved; subsequent inspected normal
and reduced-motion checks passed. No product fix was inferred from those waits.

**Limits:** Historical exact schema defect and original receipt accuracy remain
unproved. Successful new receipt does not certify every image or repair branch.
Current R2 object bytes and actual Google sign-in/email delivery remain unverified.
Earlier local full suite had1 unchanged5s Wrangler startup timeout:255files/
6315tests PASS,1failed348.06s; isolated32/32PASS3.31s, startup1099ms.
Focused9files/109tests and local lint/typecheck/migration/build PASS; hosted full
success does not erase the local timeout. Source review is self-review; independent
code review is not claimed. Payments/PayOS/auth and applied migrations are unchanged.

**Next action:** Wait for approved run37788079550; collect actual artifacts and live
proof after SUCCESS before the next stage. Each production run requires a separate
normal Environment review by vn-taphoanhatung.

**Checkpoint:** Keep this documentation on codex/ai-scan-rollout-evidence,
separate from frozen source. Exact receipts/hashes, private responses/telemetry,
operator scripts and continuation live ignored under
.wrangler/production-evidence/20261008. Restore clean source branch
codex/ai-scan-validation-release after publishing.

[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

All preceding checkpoints below are historical.

---

# Production shadow and distinct provider gate PASS - 2026-10-08 JST

**Task/status:** PRODUCTION_CANARY_1_APPROVED_GATES_RUNNING; rollout INCOMPLETE.
Frozen source/main is 6f6eaaab518cf2430de225d0be73d695b40706e4; implementation 648dbd32010363712f219d25ca0b5109db37c3d3,
normally merged by PR59. Exact-main CI37780227955 PASS (256 files / 6316 tests,
308.04s). Production canary1 run37784465213 has normal independent Environment
approval by vn-taphoanhatung and is running local gates. No canary upload is claimed
at this checkpoint. Production5/25/D1 are not dispatched. Do not redispatch canary1.

**Actual production:** Shadow run37782664023 SUCCESS, source 6f6eaaab518cf2430de225d0be73d695b40706e4,
Worker e6c0bd6b-df45-488c-863d-70c012c4e943, shadow/0%/cutover false/global static/T20 false.
Actual candidate/receipt ZIP digests, provenance and extracted JSON/source/run/CI
assertions PASS; 3 independent readiness/service-worker pairs PASS. D1 ledger39,
500 physical/hydrated recipes, hydration failures0, media500/ready500, FK[] and
quick_check=ok. Runtime fingerprint f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37;
service-worker SHA256 6a0af02b38a9c35d75fcd43ab75c0790d30ebf613d1b7e3297d1ad78d87b092a.
Applied migration37689543237 (only0039) and recovery37536969564 MUST NOT be replayed.
Operator excludes user-data retention certification; payments/auth are unchanged.

**Live provider evidence:** Exactly one distinct non-PII scan accepted202,
2026-10-08T13:26:34.115Z to 2026-10-08T13:26:57.782Z, support be56b53e3b17,
terminal ready/error null/queue attempt1/max3. All6 items match expected names,
quantities, units, unit prices, line totals and overall138000VND; logout200.
Fixture SHA256 8a47ba31ff70f9ee544c96e8772b64edb4dcce2b3a1de85ee1ebada624ab8cd4. No inventory confirmation.
Original failed scan b6db841cbed9 was not replayed; its missing bytes and exact
historical schema defect remain unproved. This success certifies the new fixture
on this release; it does not prove every historical receipt or repair branch.

Bounded dry=true telemetry query matched certified account/service/Worker and
support/request/trace. Two diagnostic events/four invocation events: qwen-vl-ocr
succeeded on provider attempt1, input1311/output454 tokens, latency4089ms;
no repair/escalation occurred. Terminal latency5284ms. No source change or second
scan was used to obtain this PASS. OAuth/logs and receipt responses remain private.

**Checks and staging:** Shadow hosted gates PASS256files/6316tests,412.76s,
plus lint/typecheck/migration smoke/build. New-source staging shadow37781071862,
canary1 37781412721, canary5 37781697963, canary25 37782044271 and D1 37782346206
all PASS, T20 enabled only in staging, actual artifacts and 3 live pairs per stage.
Production landing/auth navigation passed headless Chromium mobile390x844 and
desktop1365x900: logo loaded, no overflow/pageerror/first-party asset failures,
zero mutations. Four screenshots visually inspected; desktop auth capture includes
the transient Google loading state. This is not a completed Google sign-in/email
verification. Earlier local full-suite 1 unchanged Wrangler5s startup timeout is
retained:255files/6315tests PASS,1failed348.06s; isolated32/32PASS3.31s.
Focused9files/109tests and final local lint/typecheck/migration/build PASS.
Self-review is not independent code review. Current R2 object bytes and email
delivery remain unverified at this checkpoint.

**Next action:** Wait for approved canary1 run37784465213; require SUCCESS and
actual artifacts/source/CI/approval/catalog/readiness/assets proofs before5%,
then25%, thenD1. Each production run requires normal independent Environment
review. No bypass, migration replay, scan replay, or concurrent deploy.

**Checkpoint:** Evidence docs stay on codex/ai-scan-rollout-evidence, separate
from frozen source. Ignored private evidence and continuation are under
.wrangler/production-evidence/20261008. Restore clean source branch
codex/ai-scan-validation-release after publication.

[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

All preceding checkpoints below are historical.

---

# New AI release merged and main CI verified - 2026-10-08 JST

**Task/status:** `PRODUCTION_SHADOW_REVIEW_REQUIRED`; production rollout INCOMPLETE.
[PR59](https://github.com/vn-tak/Tako-san/pull/59) merged normally as
`6f6eaaab518cf2430de225d0be73d695b40706e4` at 2026-10-08T12:54:09Z. Reviewed head
`bc4a1cdfb567610e339e35d4845a993bfb0a6534` and merged main have identical tree
`1473bb07c6e95f7478a68c880ea31e2e3cd5c1d8`. No unresolved review threads,
admin bypass or direct main push. Source/release review was self-review; no
independent code-review claim. Final-head CI 37778968273 SUCCESS, 256 files / 6316 tests,
424.01s; exact-main CI 37780227955 SUCCESS, 256 files / 6316 tests, 308.04s, with lint,
typecheck, migration smoke and build. This new SHA is the frozen release source.

**Actual production:** Still old source 0c777203, shadow Worker f9c44422,
shadow / 0% / cutover false / global static / T20 false. Main merge is not a deployment.
Applied 0039 / migration 37689543237 and recovery 37536969564 must not be replayed.
Certification 37693128721 and shadow 37763248411 recovered artifacts remain valid
historical proofs. Operator excludes user-data retention certification.

**AI evidence/change:** Historical MCP telemetry is recovered and correlated to
support b6db841cbed9, certified account/service/Worker and request/trace IDs:
OCR twice SCHEMA_VALIDATION / 611 output tokens, escalation INVALID_RESPONSE / 2 output tokens.
The merged 648dbd3 implementation supplies capped 8 / deduplicated fixed schema
paths/codes to scan repair and logs, plus four fixed parse-failure stages.
It retains schema/quality validation, models, budgets and queue policy. Exact
historical schema fields remain unavailable; no live provider repair claim.
Original failed scan/fixture was not replayed. Raw telemetry/OAuth remain private.

**New-source staging:** T20 remains enabled in staging; shadow transition explicitly
confirmed the prior staging D1 downgrade. Each completed step has actual ZIP digests,
extracted JSON/source/run/CI verification, 500 D1-ready recipes, no fallback and 3
independent readiness/service-worker pairs. Progress at this checkpoint:

| Stage | Run | Status |
| --- | --- | --- |
| shadow-0 | 37781071862 | PASS |
| canary-1 | 37781412721 | PASS |
| canary-5 | 37781697963 | PASS |
| canary-25 | 37782044271 | PASS |
| d1-0 | 37782346206 | PASS |


**Remaining gate:** Production shadow [run 37782664023](https://github.com/vn-tak/Tako-san/actions/runs/37782664023) has passed the release/main-CI job and requires normal independent production Environment approval by `vn-taphoanhatung`. It has not uploaded a Worker. CLI `vn-tak` is not an eligible reviewer; no bypass or Environment policy change. Next: review this actual run, verify its receipt/Worker/catalog/readiness/assets, then execute the distinct prepared provider validation.

Only a passing provider validation on this new shadow permits production 1/5/25/D1,
with separate normal Environment approvals. Prepared distinct non-PII fixture:
6 items / 138000 VND, SHA256
`8a47ba31ff70f9ee544c96e8772b64edb4dcce2b3a1de85ee1ebada624ab8cd4`;
not submitted. Its bytes were visually inspected and arithmetic ground truth PASS.
New operator 5 provider and 11 dispatch controls PASS entirely offline. Collector
end-to-end PASS on the actual approved old shadow. Operator self-review is not
independent review. New wrappers are not the vanished originals. Original receipt
accuracy, R2 object bytes and email delivery remain unverified.

**Local checks/limits:** Focused 9 files / 109 tests PASS. Full local 255 files / 6315 tests
PASS with 1 unchanged 5s staging-Wrangler startup timeout, 348.06s; isolated unchanged
32 tests PASS, 3.31s / startup 1099ms. Final lint/typecheck/migration/build PASS. Hosted
full success does not erase that local failure. No relaxed timeout/assertion.

**Checkpoint:** This evidence lives on `codex/ai-scan-rollout-evidence`, separate
from frozen main. Detailed history:
[Production shadow diagnostic](PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md). Private continuation and proofs
remain ignored at `.wrangler/production-evidence/20261008`. Restore the clean
`codex/ai-scan-validation-release` source branch after publishing evidence.

All preceding checkpoints below are historical.

---

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
Final `pnpm typecheck`, `pnpm lint`, migration smoke and build PASS. Full suite
with Node24/TMPDIR=/private/tmp/CI=true/maxWorkers2:255files PASS/1failed,
6315tests PASS/1failed348.06s; the unchanged local Wrangler staging-startup test
exceeded its5s timeout. Isolated unchanged rerun32/32PASS3.31s, actual Wrangler
case1099ms. No full local PASS is claimed. Source/release self-review found no
remaining concrete issue; it is not independent review. Public provider success
still requires new-release validation. Implementation checkpoint `648dbd32010363712f219d25ca0b5109db37c3d3`.
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
