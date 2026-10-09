# UI03 — Discovery API và media đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI03_LOCAL_VERIFIED_REVIEW_REQUIRED`. Người dùng yêu cầu tiếp tục
một đợt rebuild Tako-san. UI03 hoàn tất phạm vi local; toàn hệ thống và brand final
còn theo roadmap. Packet `docs/ai/tasks/UI03-discovery-api-media.md`, ADR-046.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553; UI02 base
`87cfbdf1b2e1164f3cb9a122d8613ed52d140c3b`, canonical base
`27d47b056455a57df811199cd7e9c32a84cbffe5`. Checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Implementation đã kiểm chứng và commit `dbba0535f66b585ff3bdedb27894ee72b57872d1`.
Documentation checkpoint theo sau; checkout Frigo cũ giữ nguyên. Không push/PR/merge/deploy.

**Actual changes:** Additive authenticated `/recipe-discovery`: strict household
stock, một routed recipe authority, shared Zod card/page contract, search có/không
dấu + ingredient/tag/description, hard cuisine/category/region/time/no-buy trước
ranking/page. Stable ID tie-break;24catalog/3Home summaries, detail tải riêng.
Cursor ràng page/filter/pageSize/user/household/catalog source+fingerprint/stock;
changed409 có explicit restart giữ filter, invalid400 có recovery, unfenced URL
clamp dữ liệu hiện tại. Scoped invalidation/session fence, labelled device/static71
offline và source witness; HTTP503/contract failure không fallback. URL/history/
detail-return/pager/resetfocus; pending/refetch không lộ rows cũ; debounce250ms.
T14D static-reader audit bổ sung đúng offline client dưới ADR-046; guard unknown0
và Worker authority constraints giữ nguyên. Architecture/domain docs đã cập nhật.

Media presentation quarantine429generic “Delicious!”,59unreviewed Unsplash,
6wrong-dish/missing paths;6matching local global mappings giữ compatibility.
Rawcatalog/migrations/release fingerprints giữ nguyên, ready canonical hero ưu tiên,
failure không trở về ảnh đã quarantine. Placeholder grid80px sau visual review,
alt trung thực. Report500D1/71static/46URL/21reusegroups;8mapped local hashes/bytes/
dimensions,13physical files contact-sheet review,500fresh hero rows pending. Không
claim photo provenance/license hoặc production R2 coverage.3/6allowed files vượt
60KiB và436px masters chưa cóvariants/DPR2quality; còn content media workstream.

**Verification:** Final full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0;266files/6468tests PASS,0FAIL,321.24s; lint/typecheck/migration-smoke/build PASS.
Focused7files/163tests PASS; authority+client2files/20tests PASS. Final browser15axe/
layout checks ở320/390/768/1024/1440,17PNG,0violations/overflow/brokenimages/pageerrors;
12journeys, full21page/500unique cover. Evidence20files manifest hashes verified.
Runtime/test/script23file SHA256 unchanged after final gate. Build main454.93kB/
gzip126.63; Home11.74/4.28; Recipes9.72/3.84; không claim JS bundle reduction.
Local same fixture legacy500full1.081.667bytes→24summary14.194bytes (-98,69%raw),
gzip tính local130.990→3.010 (-97,70%); không phải latency/CWV/production transfer.
Logs `.artifacts/ui03/full-check-first.log`, `full-check-final.log`, `focused-final.log`,
`authority-focused.log`, `browser-final.log`; report `docs/ui-rebuild/round-3/VERIFICATION.md`.
Preview ownPID34259 đã dừng trước full gate; không còn preview do task này giữ.

**Failures/recovery:** Full đầu6467PASS/1FAIL do offline client mới chưa khai báo
trong static-reader allowlist; thêm đúng reader + audit addendum, giữ unknown0
assertion. Focused ban đầu25FAIL/25PASS do fixture secret ngắn22APIcases và3schema
cases có no-buy/missing mâu thuẫn; sửa đúng fixture. Tiếp2FAIL vì test dùng sai bảng
category và route mount; tiếp1FAIL vì nhầm coverage100% với đủ lượng (2of4eggs).
Sửa expectation đúng contract, vẫn no-buyfalse/missing1 và quantity regressions.
Typecheck nutrition legacy và fixture KV type sửa; browser selector Home gồm nav
và PATCH version field sửa đúng existing contract. Không bỏ test/giảm assertion,
nới timeout/config hoặc suppression để đạt gate. Chi tiết trong VERIFICATION.

**Database/operational state:** Chỉ synthetic local Worker/SQLite, local inventory
PATCH và fresh migration replay. Không schema/dependencies/payment/unrelated auth/
infrastructure/production flags/remote D1/R2/credentials changes. Remote schema/Week
gates skipped; UI03 không thay thế T20 certification/deployment status bên dưới.
Server còn hydrate/evaluate fullcatalog; cursor không lưu historical snapshot;
canonical media/catalog TTL giữ behavior hiện hành. Chưa hosted CI/device/Safari/
screen-reader/usability QA; nhận diện hiện tại vẫn là prototype.

**Next action:** Review verified branch/source và hosted CI theo quy trình repo.
UI04: packet+ADR cho scan/review/editor vertical slice: upload→draft→sửa canonical
mapping/quantity/unit/expiry/source→explicit confirm→inventory, giữ session/offline/
revision/idempotency và dữ liệu uncertainty. Adopt shared controls/state/header/
brand prototype; browser/test matrix trước completion. Sau đó cooking/planner/
shopping/remaining routes, brand final/PWA/OG/avatar/icons/motion. Media batch ưu
tiên30–50 món cần source/license/subject QA, thumbnails/hero variants và canonical
promotion; không dùng illustration để giả photo coverage. Roadmap cụ thể tại
`docs/ui-rebuild/round-3/FOUNDATION.md`. Không deploy trong continuation UI này.

---

# UI02 — Đợt Home và discovery hoàn tất local — 2026-10-10 JST

**Task/status:** `UI02_LOCAL_VERIFIED_REVIEW_REQUIRED`; tiếp tục một milestone theo
chỉ thị người dùng. Canonical `vn-tak/Tako-san`; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Base UI01 `1533d98`; implementation verified
`11080d8a7a05614b37e85cf12f6f888addd15df0`. Không push/deploy.

| Hạng mục | Trạng thái / bằng chứng |
| --- | --- |
| Home canonical/Week authority theo flag | Local PASS; household keys, future/current/past/error/no-plan |
| T20 titles/revision/family/unplanned | Local PASS; pending/500/missing/mismatch không dùng V1,404/UI-off compatibility |
| Shared scoped shell/header/heading | Local PASS; Home/tủ/catalog/detail, nav/Scan/default routes giữ contract |
| URL filters + client24paging | Local PASS; whole-result accent search, reload/back/reset/page/detail-return focus |
| Mobile filter disclosure + desktop layout | Local PASS;21axe/layout checks320–1440,23screens,0violation/overflow/pageerror |
| Repository gates |264files/6429tests PASS; lint/typecheck/migrations/build PASS |
| Lightweight API + server pagination | NEXT:UI03; API hiện vẫn tải full recommendation |
| Photo mapping/provenance + finalbrand/motion/remaining screens | TODO; ảnh legacy dùng chung, prototype chưa phủ PWA/OG/email/etc. |
| Independent review/hosted CI/device/usability/release | Chưa thực hiện; local verification không chứng nhận release |

**Checks/failures:** Focused6files/157tests PASS; final bounded2worker `pnpm check`
exit0,326.64s. Full đầu12FAIL do Router/test fixture, đã sửa setup/expectations
đúng giao diện, giữ actual-data/security assertions. Không tăng timeout/giảm test.
Commands/evidence/failures: `docs/ui-rebuild/round-2/VERIFICATION.md`;
implementation/next slice: `docs/ui-rebuild/round-2/FOUNDATION.md`.

**Boundary/next:** Không đổi schema/dependencies/payment/auth/infrastructure/remote
state. Local preview đã dừng. UI03 cần packet/ADR cho list DTO/cursor, tiếp đó audit
và thay ảnh lệch món. T20 rollout/certification và các checkpoint phía sau giữ
trạng thái riêng; full UI rebuild chưa hoàn thành.

---

# UI01 — Đợt đầu rebuild Tako-san đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI01_LOCAL_VERIFIED_REVIEW_REQUIRED`. Người dùng đã yêu cầu bắt
đầu rebuild ngày2026-10-09. Full rebuild còn trong roadmap; không claim hoàn tất.

**Repository/source:** Canonical `vn-tak/Tako-san@27d47b056455a57df811199cd7e9c32a84cbffe5`.
Nhánh `codex/ui-rebuild-foundation`, checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.
Implementation `716fa9aabfca9bb2bce77963b57ed80fef07153f`; documentation checkpoint theo sau.

| Hạng mục | Trạng thái / bằng chứng |
| --- | --- |
| Quantity/no-buy/shortfall dùng T02; draft/offline nhiều lot | Local PASS; cần4/có2 mua2, contextual unresolved, không double-spend |
| Inventory no-results/reset/focus | Local PASS; phân biệt với tủ thật sự trống |
| Recipe detail responsive + neutral image fallback | Local PASS;320–1440px, keyboard/reduced-motion |
| Palette/font/logo prototype scoped | Local PASS;9WOFF2/OFL/Vietnamese glyphs, board trong `docs/ui-rebuild` |
| Repository gates |262files/6380tests PASS; lint/typecheck/migrations/build PASS |
| Actual browser |12 axe checks:0violation/overflow/pageerror; local shopping201 |
| Home canonical planner + shared shell/header | NEXT: UI02, giữ flag/Week compatibility |
| URL filters + summary DTO/pagination24 | TODO: ADR/task riêng, regression toàn catalog |
| Brand final/motion kit/toàn bộ màn/device/usability | TODO theo `docs/ui-rebuild/REBUILD_PLAN.md` |
| Independent review/hosted CI/release | Chưa thực hiện; không push/deploy |

**Executed checks/failures:** Exact final `pnpm check` với Node24, telemetryoff,
Vitest tối đa2worker và TMPDIR=/private/tmp; exit0. Ban đầu5FAIL gồm contextual
fixture, historical Git objects thiếu và Wrangler timeout; lượt sau1timeout.
Đã phục hồi object đúng hash, cập nhật assertion đúng contract, giảm concurrency
qua env; không đổi timeout/config/historical tests. Commands/logs:
`docs/ui-rebuild/VERIFICATION.md`, `.artifacts/ui-rebuild/full-check-bounded.log`.

**Boundary:** Chỉ local synthetic preview/migration smoke; preview đã dừng. Không
schema/dependencies/payment/auth/infrastructure/remote data/flag mutation.
Trạng thái T20 phía sau vẫn giữ nguyên, không được UI01 chứng nhận thêm.
Packet `docs/ai/tasks/UI01-ui-rebuild-foundation.md`, ADR-044, handoff đã cập nhật.

---

# T20 fixture staging: sửa tương thích timestamp trước rollout — 2026-10-09 JST

**Task/status:** `T20_STAGING_CERTIFICATION_REQUIRED` /
`T20_PRODUCTION_READINESS_BLOCKED`. PR61 đã merge theo operator continuation;
phát hiện blocker ở công cụ certification trước khi dispatch fixture hoặc deploy.

**Repository/source:** `vn-tak/Tako-san`, ID1385308553, main
`23065108be8e72951c289445cd2c537b87f18f4c`. PR61 normal merge head
`b789d7986c9a4e74e86840f8026a1fcb1b91985f`; parents5dfab234/b789d798,
merge/head tree `6d35cda4f7393456b6bf3c24be7875d238e1f69b` khớp.
Main CI `37851106419` SUCCESS, 259files/6361tests; CI green vẫn bỏ sót
fixture defect dưới đây. Nhánh sửa riêng `codex/t20-fixture-schema-contract`.

**Finding/fix:** P1 staging certification: fixture SQL dùng `datetime('now')`,
vi phạm CHECK `updated_at IS strftime('%Y-%m-%dT%H:%M:%fZ', updated_at)` của
migration0021. Test cũ dùng bảng tối giản không có CHECK nên bỏ sót.
Sửa đúng một expression thành UTC ISO `strftime(..., 'now')`; không đổi migration,
policy values, bindings, workflow guards, auth/runtime hoặc production data.
Thêm4 regression chạy prepare/audit với full migration chain bằng SqliteD1,
kiểm chứng timestamp, stored policy, insert1, audit0, duplicate prepare reject,
stock/event snapshot không đổi và FK check. Auth records trong tests chỉ là local
SQLite fixtures; workflow remote vẫn chỉ nhận normally registered verified owner.

**Verification:** Before4FAIL/23PASS, cả4 lỗi đúng CHECK timestamp. After27/27PASS,
failed0. Lượt full đầu có6365PASS nhưng2suitefail do hai file tạm ignored bị Vitest nhận
nhầm test. Đã đổi tên file tạm, giữ nguyên test config/assertions. Lượt rerun
`CI=true TMPDIR=/private/tmp pnpm check` exit0:259files/6365tests,0FAIL,
127.52s suite; lint/typecheck/migration-smoke/build PASS. Remote schema/Week
gates skipped có chủ đích; không claim hosted certification. Implementation
`4fb0ff8bb4143328bd1e20d4091e65d29efc95d1`; documentation checkpoint theo sau.
Private logs: `.wrangler/t20-rollout/20261009/schema-contract-before.log`,
`schema-contract-after.log`, `schema-contract-full-check.log`,
`schema-contract-full-check-clean.log`. Prod audit0high/critical,2moderate hiện hữu;
không đổi dependencies, không claim repo-wide tooling audit PASS.
45 hosted journeys chưa chạy; final-source readiness phải rerun sau source mới.

**Operational evidence:** Staging read-only readiness `37850099945` SUCCESS cho
main5dfab234 trước merge: D1500/ledger39/ID-order-fingerprint/provenance/integrity
match. Public serving baseline6f6eaaab ở cả hai môi trường, production T20false.
Năm normal accounts còn dùng được qua GET-only preflight. Không deploy Worker,
insert remote policy, production D1/R2 mutation, replay0039 hoặc failed scan.
Harness ignored thêm source/unique journey và đủ45 HTTP observation gates;
local rejection guards10/10PASS. Không dùng10 guard fixtures làm hosted PASS.

**Next action:** Review/CI final repair head, normal merge khi operator cho phép;
pin exact-main CI/SHA, final-source staging D1 read-only readiness, staging
shadow→1→5→25→D1, prepare fixed policy cho test households,45 hosted journeys
và audit stock/events. Chỉ sau `STAGING_CERTIFIED` mới production cùng source;
normal reviewer `vn-taphoanhatung` duyệt từng Environment run, không bypass.
Không reapply0039 hoặc thay catalog. Rollback theo `T20_RELEASE_READINESS.md`,
giữ additive schema/composition records. Production enablement chưa thực hiện.

---

# T20 implementation hoàn tất local; chờ review và chứng nhận staging — 2026-10-09 JST

**Task/status:** `T20_CODE_COMPLETE_REVIEW_REQUIRED` / `T20_TEST_VERIFIED` (local).
`T20_STAGING_CERTIFICATION_REQUIRED` / `T20_PRODUCTION_READINESS_BLOCKED`.
Checkpoint này thay thế current-state/next-action cũ; các mục phía sau giữ lịch sử.

**Repository/source:** Repo API xác nhận `vn-tak/Tako-san`, ID `1385308553`,
main/base `6f6eaaab518cf2430de225d0be73d695b40706e4`, protected/strict validate.
Nhánh riêng `codex/t20-production-completion`; implementation
`12fe6fc44370188d02812f449cee4052dbb57364`. Documentation checkpoint theo sau;
reviewer phải kiểm tra final PR head và hosted CI chính head đó. Push/PR dùng
canonical repo rõ ràng, không dùng tên owner cũ trong origin làm authority.
PR20/29 overlap historical docs; không sửa nhánh của họ.

**Actual production baseline:** Rollout D1 trước takeover đã SUCCESS qua
[Deploy37789673028](https://github.com/vn-tak/Tako-san/actions/runs/37789673028),
source6f6eaaab, Worker `f92df570-6cb0-43de-bfa6-a4c7bd7f07d8`, D1/500/schema39,
release `rel-bd00a4f53fcaeee4`, no fallback, T20 server/UI=false. Staging baseline
source cùng6f6eaaab/D1/500/schema39/T20true theo Deploy37782346206. Public read-only
proof xác nhận source/catalog/database/config; production readiness degraded chỉ
bởi intentional `CONFIG_RECIPE_CATALOG_D1_AUTHORITY` warning. Các status shadow,
provider/canary pending trong lịch sử không còn là next-action hiện tại. Receipt
baseline không phải chứng nhận T20 head mới. Không replay recovery/0039/AI scan.

**PR:** [#60](https://github.com/vn-tak/Tako-san/pull/60), chờ independent review.

**Actual changes:** P1 composition pending/500/offline/missing không hiển thị
anchor V1 stale; loading/error/retry rõ, giữ404 server-off/familyV1, unknown-slot
unavailable. Parent chia sẻ canonical query với composer. P1 release draft thêm
production planner UI/Worker prerequisite derive từ normalized T20 decision,
guard cả staging/production; không đổi runtime flags/config. Assisted có action
regenerate_unlocked preview/apply qua API hiện có; typed errors vi/en, untracked
shopping/week explicit, touch controls≥44px. Domain/scoring/authority/service/DB,
schema/migrations/dependencies, physical inventory, auth và PayOS không đổi.
ADR-043 ghi quyết định, compatibility và rollback.

**Verification:** Node24.16.0/pnpm10.33.2. Final
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp pnpm check`
exit0:258/258files,6338/6338tests,143.70s, no reported skip/failure;
lint/typecheck/migration-smoke/build PASS. Remote schema/Week parity skipped
có chủ đích. Baseline6315PASS/1Wrangler timeout, isolated32PASS; không sửa timeout.
Browser sequential T20on42/off3/UI-on-server-off3 PASS tại390/768/1280, retries0;
Manual4/save/reload, Assisted2, Auto3, shopping100g/single subtraction,
restrictions10/20/forbidden/dietary/nutrition, D1-only detail/cooking,200/409,
UI canonical reload/500retry/cache404 rollback, untracked, keyboard/focus/axe0/targets≥44px.
Production true/true và false/false local builds + actual build-record CLI guards
PASS; local flag manifest fixtures không phải approved release manifest.
Hosted CI full final head và PR URL/result được ghi trong PR release evidence;
checkpoint này chưa giả một run chưa chạy. Sau merge vẫn cần exact-main CI riêng.

**Performance/security:** Composer byte-identical base;200 samples71/320/500,
median0.452/0.428/0.490ms,124expansions/scores,3options;320pool cap giữ nguyên.
Worker20 samples:picker46.30ms median/48.79p95,14–15SQL;Auto191.44/225.95ms,29SQL;
local wall time, không hosted CPU/SLA/cost. Tenancy/CSRF/revision/locks/hard
restrictions full suite PASS. Prod dependency audit0high/critical,2moderate; full
audit tooling dev2critical/16high hiện hữu, cần maintenance review riêng,
không claim repo-wide security PASS. Private ignored evidence giữ ở
`.wrangler/t20-completion/20261008/`, không publish raw sessions/credentials.

**Deferred:** Whole-week V2 Auto OPTIONAL_EXTENSION; tuần7 ngày hiện dùng V1
anchors + V2 per-slot đã verified. Leftovers/per-component servings/role-curation/
drag-and-drop/real prices theo rationale trong audit, không mở rộng schema/engine.
No known unresolved P0/P1 implementation sau own-review; independent review chưa có.

**Readiness/next action:** Ma trận28 capability và defects/evidence:
`docs/ai/T20_TAKEOVER_AUDIT.md`; release/rollback packet:
`docs/ai/T20_RELEASE_READINESS.md`; task:`docs/ai/tasks/T20-production-completion.md`.
Reviewer kiểm tra final PR head/hosted validate. Operator merge qua protection,
pin exact-main CI, review staging deploy plan và normal-session A–I certification.
Chỉ khi staging source mới certified mới xin production enablement approval riêng.
CODE_COMPLETE/TEST_VERIFIED local không là STAGING_CERTIFIED/PRODUCTION_READY;
PRODUCTION_ENABLED vẫn false. Không tự merge/approve/dispatch/deploy/migrate,
đổi protected flags/secrets/data hoặc xoá composition records để rollback.

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
[Production shadow diagnostic](scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).
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
[Production shadow diagnostic](scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

**Next action:** Obtain sanitized historical `ai_usage` + matching `scan_terminal`
metadata via Cloudflare Logs for the window above. The restricted CLI received 403;
operator was asked to provide metadata, without credentials or receipt content.
Then isolate the cause, add a meaningful regression and the smallest justified fix,
normal review/CI/merge and validation of any changed final source before a distinct
provider validation. Promote 1/5/25/D1 only after the provider gate passes. Never
replay migration 0039 or recovery `37536969564`, or bypass Environment review.

All preceding checkpoints below are historical.

---

# Post-media staging complete and production 0039 applied - 2026-10-08 JST

**State:** Production rollout remains incomplete. PR58 merged normally as
0c77720334d7154b25e81d6e6823ab804619adce from reviewed head
82ce0cd8eb8188c475126fd5a88c2ff063ac25f9; main/reviewed tree equality is
e122e554581afafcc7a2f6a37ff2377a3a56d5a2. Exact-main CI37686743768 is SUCCESS.
Staging has completed the full final-source progression. Normally approved
migration37689543237 applied only0039, independently audited PASS. Production
ledger is now39/0039. Do not replay migration or recovery37536969564 (APPLIED).

**Production:** Guarded workflow preflight proved500 recipes, hydration/fingerprint
and valid operational media before the Time Travel bookmark and apply. Post-ledger,
unchanged aggregates, FK[], quick_check=ok, catalog/runtime and schema gate PASS.
Actual media rows500/ready500, zero operational anomalies. Full18-column metadata
SHA256e12c0bd9871406bd3477d304f345308fb5e912f85712f41cdbbb617e21792e0c and media
schema SHA2560503f30babe7efb858c02bb118b097c7610d3c834954c3cfb6912b76dca1feb6
are preserved. This is observed non-atomic metadata evidence; R2 bytes are
NOT_REVERIFIED. Normal reviewer vn-taphoanhatung, actor vn-tak, attempt1; both
actual ZIP digests, provenance and extracted bytes PASS. Root reverified both
archive byte digests/extractions before accepting root-reviewed-summary.json.

**Worker baseline:** Public readiness at2026-10-07T21:57:04Z independently confirms
old136cb6ff3d2921eac237c7b106b37ab5ee12a13f, static/0/cutoverfalse/globalstatic,
config/database/queue healthy and fallbacknull. No new production Worker upload or
provider scan. Email delivery remains unverified. User-data retention certification
is excluded by user authorization; payment/PayOS/auth/infrastructure unchanged.

**Executed hosted checks:** Final-head PR CI37685662053 SUCCESS; exact-main
CI37686743768 SUCCESS,255files/6309tests PASS411.90s and all14steps SUCCESS,
including lint/typecheck/migration-smoke/build. Staging shadow37687850533 ->
canary1 37688177602 ->canary5 37688484213 ->canary25 37688778057 ->D1 37689066860
all SUCCESS. Every phase proves schema39/T20server+UItrue, exact source/CI,
actual twoZIPs,3readiness/assets pairs, hosted+independent public smoke and skipped
production job. Final staging Worker054c2688-07d9-41e4-84f1-84c18b972de6;
public500ordered IDs, fingerprintf8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37
and imported detail15fields MATCH (5GETs/3readinessguards/0writes). No retry or
source edit during staging. Historical local full-suite/hash-pin and concurrent
Vite/build failures remain documented below; this checkpoint does not claim a
new full local run. Independent operator controls migration46/certification32/
ZIP+receipt23/freeze+dispatch26 PASS,0actualproduction requests in controls.

**Evidence:** /private/tmp/takosan-post-media-staging-prep/staging-progression-receipt.json
SHA25606f384a28f57314a5598516f94abbd54f4861c540f2a39e9e82f3d46b54ce0e0;
/private/tmp/takosan-post-media-migration-37689543237/independent-audit.json;
/private/tmp/takosan-post-media-migration-37689543237/root-reviewed-summary.json;
/private/tmp/takosan-post-media-production-prep/root-exact-main-ci-proof.json;
/private/tmp/takosan-post-media-production-prep/operator-activation-proof.json;
/private/tmp/takosan-post-media-production-prep/post-migration-production-static-baseline-independent.json.
Private raw rows, credentials and rollback bookmark values are not reproduced.

**Next:** Read-only certification37693128721 has gateSUCCESS and is waiting for
normal production Environment review byvn-taphoanhatung (CLIvn-tak cannot approve).
No Worker upload in this certification. After completedSUCCESS, collect/audit real
artifacts linked to migration37689543237, then freeze actual media counts/proofs.
Deploy frozen0c777/T20false through production shadow, exactly one synthetic scan,
1/5/25/D1; normal independent review is required separately for every production
run. Audit receipts/liveassets/smoke before promotion. Finally verify public500
content and mobile/desktop UI, finalize production packet and checkpoint actual
outcome. Never redispatch an existing intent or bypass Environment reviews.
This documentation checkpoint is kept separate so the frozen release HEAD/tree
can remain unchanged while release operations continue.

All preceding checkpoints below are historical.

---

# Post-media gate implementation and verification - 2026-10-08 JST

**State:** Implementationdf2347caf414537c287e11defae0b87f8377cec7/tree
7350e86740d246ace03ddb0bd86de522025d03d5 exactly matches independent reviewed
complete tree. Draft PR58 is open. Production remains old healthy static136cb6ff;
ledger38/0038 and recoveryAPPLIED. No production mutation/deploy/provider scan.

**Changes:** Complete0038/0039 catalogs require19 safe aggregates, valid active
hero coverage and actual domain metadata; historical pending-only gates remain.
Generic verification and 0039 preflight validate immutable0035 schema definitions.
The preflight privately reads all18media columns, validates actual rows through
the real mapper/auditor and recomputes coverage/uniqueness. It binds the rowcount
and full metadata/schema SHA256 before migration; post0039 must preserve them.
Only aggregate counts/digests are uploaded. No runtime/config/applied migration,
dependency/credential/Environment policy or protected payment/auth change.

**Review:** Two independent reviews report no remaining concrete blocker after
fixing stale aggregate acceptance of a newly invalid private row. Source review
and actual CLI controls PASS. This proves persisted metadata and observed
non-atomic preservation, not fresh R2 bytes. ADR042 records these limits.

**Executed checks:** Node24 focused5files/98tests PASS40.23s; core migration114/114
PASS4.60s and officialNode22.23.3 114/114PASS4.67s. Independent Node22 surrounding
4files/97tests PASS38.42s plus24controls PASS. Lint, typecheck, migration smoke,
actionlint1.7.12/four release workflows, syntax/diff checks PASS. Full Node24 suite
with canonicalTMPDIR/CI=true/metricsfalse/maxWorkers2:254files PASS/1failed,
6308tests PASS/1failed,356.58s. Its sole failure is the unchanged old reviewed
SHA256 pin for d1-readonly-query.mjs; adding two reviewed fixed singleSELECT modes
changes that fingerprint. Independent execution-path review confirms unchanged
schema/catalog/runtime behavior and mutation guards. The pin is intentionally
updated to reviewed9d43f62c25561423c6b4c00d611a262a82387dce724c6756274d1db9cfc4deb3;
focused certification/query safety checks2files/68tests PASS6.45s after repin.
No assertion or mutation guard is removed; full local PASS is not claimed.

**Build:** An initial build run during active Vite loaders failed the existing
service-worker token guard; retained log records that failure. After all test/CLI
loaders exited, the exact same build command PASS serially without source changes.
Concurrent output mutation is the observed limitation, not an application repair.

**Evidence:** /private/tmp/takosan-post-media-final-independent-source-review.json;
/private/tmp/takosan-catalog-preflight-diagnostic-audit-prep/media-surrounding-review/independent-controls.json;
/private/tmp/takosan-post-media-full-test.log;
/private/tmp/takosan-post-media-build-serial.log.

**Next:** Complete repin safety checks, final documentation/tree review and
final-head PR58 hosted CI. Merge normally only after green CI, prove reviewed/main
tree equality and exact-main CI, freeze final source. Full final-source staging
shadow/1/5/25/D1, guarded0039 and protected production certification precede
T20=false production shadow, one synthetic scan and1/5/25/D1. Each production
run requires normal independent Environment review. Production release incomplete.

All preceding checkpoints below are historical.

---

# Post-media migration gate repair - 2026-10-08 JST

**State:** Production release is incomplete. Normally approved read-only diagnostic
37681758263 completed with an intentional catalog gate rejection. Independent
actual artifact/API audit PASS: five ZIP digests and extracted bytes, exact main
282e564faaa7c608fa5617f65bb48d453d8e2fcd, successful CI37680537546 and normal
reviewer vn-taphoanhatung. The final main fence and sanitized uploads succeeded.
No production mutation occurred. Ledger remains38/0038; recovery37536969564 is
APPLIED and must not be replayed.

**Confirmed cause:** Runtime PASS proves500 recipes,0 hydration failures and
fingerprint f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
Catalog order0..499, IDs/slugs, provenance, ingredient/step/order coverage and
repeat-capture stability PASS. The old gate rejects media_ready=500 and
recipes_without_pending_hero=500 because it encodes the historical pre-media
rollout condition. These counts do not yet prove per-recipe ready hero coverage,
valid metadata or current R2 bytes. The earlier missing-pending hypothesis is
superseded by this actual evidence; no ready media reset/delete is authorized.

**Decision:** ADR-042 preserves historical pending-only seed/catchup gates and
adds fail-closed operational media checks only for complete0038/0039 catalogs.
Require active hero coverage, closed vocabulary/identity/version, exact ready
key/MIME/dimensions/hash/length, no orphan or duplicate ready role. Guarded0039
must preserve a private ordered full metadata capture by count/SHA256 across the
additive migration. Receipts publish only aggregate counts/hashes. This is metadata
and preservation proof, not a fresh R2 object-byte verification.

**Staging:** Source282e shadow37681762795 and canary1%37682153382 SUCCESS,
with protected500/fingerprint/schema39/T20=true, four ZIP digests/extracted bytes,
six paired readiness/assets observations and public smoke PASS. Current staging
Worker51d78f0a-cf93-4990-af98-d9719d556b23. Stages5/25/D1 were not executed;
this partial packet does not certify the future patched source. No production
operation/provider smoke followed. User-data retention certification is excluded.

**Evidence:** /private/tmp/takosan-production-catalog-preflight-independent/takosan-production-receipts-catalog-preflight-37681758263/independent-audit.json;
/private/tmp/takosan-catalog-preflight-staging-prep/partial-staging-receipt.json
SHA2566b305423e9916821ad9aea7aa97675b94bd7a06b7e9d6abe0e31d099be3f2558.

**Next:** Implement/review/test the bounded media policy repair on
codex/post-media-migration-gate, normal PR/final-head CI/merge/exact-main CI,
then certify actual production media before guarded0039. Certify final-source
staging shadow/1/5/25/D1 and production schema/catalog before T20=false production
shadow, one synthetic provider scan,1/5/25/D1. Every production run retains normal
independent Environment review; no bypass or blind retry.

All preceding checkpoints below are historical.

---

# Catalog preflight diagnostics merged - 2026-10-08 JST

**State:** Production release remains incomplete. PR57 was merged normally at
2026-10-07T20:14:43Z as282e564faaa7c608fa5617f65bb48d453d8e2fcd. Its parents are
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6 and reviewed head
0745bfc3f8ceaf0ed4bc79e41fb0635a991058d4; merge/reviewed complete-tree equality
9a8a01ecb9fe17339adab314e2743985d87c7e71 verified. Final-head CI37625628744
SUCCESS:254files/6198tests247.54s, lint, typecheck, migration smoke and build.
Exact-main CI37680537546 SUCCESS:254files/6198tests414.81s and all release gates.
Current main282e and frozen release identity were rechecked before dispatch.
Local full-suite failures remain documented in the preceding checkpoint; hosted
full-suite success does not change that recorded local limitation.

**Prior production diagnosis:** Normally approved37616546408 SUCCESS proves500
physical/hydrated V1 recipes, zero hydration failures,2702matching ingredient/order
rows and stable observed non-atomic snapshots at ledger38/0038. It does not prove
live full runtime fingerprint, complete ordered IDs/slugs or pending hero/media
invariants. Missing0039 in that diagnostic's baseline is expected and does not
explain the preflight failure of migration37615237481. Recovery is alreadyAPPLIED;
no replay, blind migration retry or rollback followed.

**Implementation:** Reviewed3d043ec9156841b7f6b0e5b3a7068670b40c932d adds sanitized
read-only preflight diagnostics with unchanged catalog/runtime verifiers, complete
38-prefix ledger fencing, repeated successful snapshots and fixed error enums.
Failed queries cannot reuse stale JSON. Only safe aggregates/counts/hashes are
published. The final main fence executes after rejected diagnosis. Runtime,
config, migrations, credentials, dependencies and Environment policy are unchanged.

**Local investigation:** The exact historical recovery plan was recompiled from
a8fa0324bb609274cc07a5c4b079e7ee4633fd83 with original SQL SHA
e5a58960baa4b8e1f4cae8be94985dd03cf4e9acf03c274b38fb310ce79f28c0.
Four local controls PASS: recovery preserves recipe_media, so missing/duplicate
pending heroes can survive an APPLIED V1 catalog with500hydrated recipes and exact
runtime fingerprint while verifyCatalogAtTip rejects it. Runtime order is restored
from1000..1499 to0..499 by the same plan. This is a source/local hypothesis only;
live media state still requires the new protected read-only diagnostic.

**Preparation:** Fresh local-only pinned282e catalog source proof PASS:769source
files,500canonical recipes, expected fingerprint and ordered-ID/detail hashes;
production/public requests0. A separate five-stage staging packet is prepared with
previous969d/d1/0/Workerb7b0, preserving all old evidence. Independent previous
staging paired readiness/service-worker proof PASS3observations at20:17:44Z.
Staging shadow37681762795 dispatched once with T20=true/shadow0/rollback=true
from969dD1; source release gateSUCCESS, stagingin_progress, productionSKIPPED.
Remaining1/5/25/D1 stages require each prior stage complete proof.

**Production:** Readiness at2026-10-07T20:18:48.830Z remains healthy old136cb6ff /
static/0%/cutoverfalse, configOK/databaseOK. No new provider smoke submitted.
User-data retention certification remains excluded by operator instruction.

**Evidence:** /private/tmp/takosan-catalog-preflight-production-prep/pr57-merge-proof.json;
/private/tmp/takosan-catalog-preflight-local-source-root.json;
/private/tmp/takosan-recovery-catalog-compatibility-audit.json;
/private/tmp/takosan-catalog-preflight-staging-prep/preparation-receipt.json.

**Protected diagnostic:** Run37681758263 dispatched once at2026-10-07T20:24:30Z
for frozen282e/mainCI37680537546. GateSUCCESS; diagnoseWAITING. GitHub API
current_user_can_approve=false, required reviewervn-taphoanhatung. Normal review
requested; no bypass or Environment setting change. New helper can intentionally
mark the runFAILED while publishing a sanitized rejected catalog/runtime receipt;
that is evidence to interpret, not permission to retry migration.

**Next:** Obtain required independent vn-taphoanhatung approval for37681758263. Audit its complete catalog/runtime receipts
before selecting a bounded repair or retry. Complete same-source staging proof,
guarded0039 and protected certification before productionT20=false shadow, one
synthetic provider smoke,1/5/25/D1. Each production run retains normal review.

All preceding checkpoints below are historical.

---

# Catalog preflight diagnostic implementation - 2026-10-07 JST

**State:** Production release remains incomplete. Production diagnostic
37616546408 completed SUCCESS at 2026-10-07T12:17:44Z on main
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6 with normal independent approval by
vn-taphoanhatung. Five actual artifact ZIP digests and extracted JSON bytes PASS
in independent audit. Ledger stays 38 / 0038; 500 physical and hydrated recipes,
0 hydration failures, 2702 ingredients and matching order rows, exact historical
V1 ingredient lines/positions and stable observed non-atomic snapshots are proven.
The missing 0039 diagnostic baseline is expected and does not explain migration
37615237481's catalog preflight failure. T21R-B fingerprintVerified proves the
target V1 source, not the live full runtime fingerprint. Live ordered IDs/slugs,
media invariants and full runtime fingerprint remain unproven. Recovery is already
APPLIED; no recovery replay, blind migration retry or rollback is justified.

**Changes:** Implementation 3d043ec9156841b7f6b0e5b3a7068670b40c932d, tree
c79bda74d06d7b0637eb034b3057e2df1eecf636, adds a read-only catalog preflight
receipt to the existing protected diagnostic workflow. The helper reuses unchanged
verifyCatalogAtTip and verifyRuntimeCatalogContent at exact ledger 38, requires
repeat successful catalog/runtime captures and an unchanged complete ledger, and
reports independent PASS/REJECTED/NOT_EVALUATED checks. Only 13 numeric/null
aggregates, counts, hashes and fixed reason enums are uploaded; raw rows and
exception messages stay private. Failed captures cannot reuse stale JSON. Stable
non-atomic consistency is claimed only when ledger and both snapshot comparisons
PASS. The final main fence runs even after a rejected diagnostic. No production
write, runtime/migration/config/dependency or Environment-policy change.

**Verification:** Final helper tests 38/38 PASS under Node 24.16; final exact
Node 22.23.3 focused tests 3 files / 58 tests PASS (35.73s). Independent final
review of implementation/tree reports no remaining finding. Actual CLI controls
7/7 and exact workflow-shell stale JSON/provider-failure controls 5/5 PASS, with
0 production calls; official Node 22 CLI controls 4/4 PASS. Final lint, typecheck, migration smoke, build, script
syntax, actionlint 1.7.12 and diff checks PASS. Default local full suite returned 3 failed
files / 12 failed / 6186 passed (179.65s): untouched capture tests compare
uncanonical macOS /var temp paths with real /private/var paths, and the local
Wrangler prefix test timed out under default concurrent workers. No tests were
weakened. Independent focused3files/125tests PASS4.58s with canonical TMPDIR
and maxWorkers=2; the two capture files reproduce the same11 failures with the
uncanonical default TMPDIR even with two workers. All eight involved source/test
files are byte-identical between969d and the implementation. Exact resource
bottleneck of the concurrency-sensitive Wrangler timeout was not profiled. Full
canonical-TMPDIR/maxWorkers=2 regression completed 253 passed / 1 failed files,
6197 passed / 1 failed tests (328.71s). The remaining unchanged local Wrangler
catchup test took33.993s and timed out at its existing5s bound; it passed1.745s
in focused verification. All new38tests passed in both full runs. Draft PR57
CI37624949372 is pending; no local full-suite PASS is claimed.
One actionlint invocation used a nonexistent certify filename; corrected to the
actual production-certify.yml and all four affected release workflows PASS.

**Production:** Public readiness at 2026-10-07T12:53:19.214Z remains healthy old
Worker 136cb6ff3d2921eac237c7b106b37ab5ee12a13f / static / 0% / cutover false,
config OK and database OK. No new provider smoke submitted. Staging969d completed
its full shadow/1/5/25/D1 proof; that packet cannot certify a future main SHA.

**Evidence:** /private/tmp/takosan-production-receipts-diagnostics-37616546408/
independent-audit.json; /private/tmp/takosan-production-catalog-preflight-review-final.json;
/private/tmp/takosan-production-catalog-preflight-cli-control/audit-results.json;
/private/tmp/takosan-production-catalog-preflight-workflow-control/audit-results.json.
Raw runner-local production rows were not exported or published.

**Next:** Finish the CI/environmental diagnosis and documentation checkpoint,
require final-head hosted CI on draft PR57, then normal merge and exact-main CI. Freeze the new main SHA and run
one normally approved protected read-only diagnostic to identify the rejected
catalog/runtime check. Repair only proven defects, then certify final-source
staging, guarded0039 and production schema/catalog before T20=false production
shadow, one synthetic provider smoke, canary1/5/25 and D1. Normal independent
production review remains required per run. User-data retention certification is
excluded by operator instruction. Do not claim production completion yet.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Production preflight stopped; staging verified - 2026-10-07 JST

**State:** Production release is incomplete. PR #56 merged normally as
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6. Reviewed head ca5df79 and merge have
complete-tree equality 7c0cecd8e06657c570f5ce161cc5430ab8d9cd56. Final-head CI
37613292017 and exact-main CI 37614255604 SUCCESS; hosted main ran 253 files /
6,160 tests, lint, typecheck, migration smoke and build. Release source stays
frozen at 969d1d.

**Migration:** Run 37615237481 was approved normally by vn-taphoanhatung and its
frozen-toolchain/exact-SHA gate passed. Production identity and ledger 38 / 0038
were verified, then Require healthy current catalog before migration 0039 FAILED.
Bookmark, baseline, plan, apply and every post-check were SKIPPED; this run did
not apply 0039 or upload a Worker. No recovery replay or catalog rollback followed.
Both candidate/receipt artifact ZIP digests and extracted manifest bytes PASS in
root and independent audit. The sanitized receipt lacks the specific preflight
failure reason and raw query outputs, so the cause remains UNKNOWN. Prior inspect
APPLIED proves recovered rows/shape/counts, not complete runtime/media release proof.

**Reproduction:** The actual failure manifest plus fresh immutable 0038 V1 local
SELECT evidence passed the same verifier and exact four-argument CLI under
Node 24.16.0 and independently checksum-verified official Node 22.23.3. Both report
500 recipes, 0 hydration failures and fingerprint
f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
No argv, serialization or Node-version failure reproduced. These fixtures do not
certify live D1 and do not justify a blind migration retry.

**Staging 969d:** Completed shadow 37615155277, 1% 37615530432, 5% 37615915508,
25% 37616295460 and D1 37616679405. All five normal runs SUCCESS with production
jobs SKIPPED; 10 actual artifact ZIP digests/extracted bytes, protected authority
500/fingerprint/schema 39/T20 true, 15 paired readiness/service-worker observations
and public smoke PASS. Final public 500 ordered IDs, runtime fingerprint and
imported detail (15 fields, 6 ingredients, 5 steps) PASS via 3 readiness guards /
5 GET requests. Final Worker b7b0a495-d933-4698-950c-a8d0918b20c4. Root independent
offline packet, archives and previous-authority progression audit PASS. A temporary
root assertion initially expected previousDeployment in staging; staging records
previousRecipeAuthority, so the assertion was corrected to that actual schema
before PASS. This certifies staging only.
Packet: /private/tmp/takosan-migration-gate-staging-prep/staging-progression-receipt.json
SHA256: ac9933239ac080c04fc7057e96b8c8adffe97ecae0cdfb3e42ec27a2ebf4366f.

**Next protected run:** Read-only diagnostics 37616546408 was dispatched once at
2026-10-07T11:48:03Z for frozen 969d / main CI 37614255604. Its source gate SUCCESS;
GitHub API currently reports WAITING, approvals [], required production reviewer
vn-taphoanhatung and CLI current_user_can_approve=false. Normal review is requested;
do not bypass or change Environment settings. Read the new runtime, order, lineage
and V1-comparison receipts to isolate the preflight failure before choosing a repair.
Do not infer live hydration or media state from a successful local replay.

**Production:** Public readiness at 2026-10-07T11:50:46Z reports healthy old Worker
136cb6ff3d2921eac237c7b106b37ab5ee12a13f, static / 0%, cutover false, config OK and
database OK. No new provider scan has been submitted. Production migration,
certification, shadow, provider smoke, canary 1/5/25 and D1 remain required after
the failure is resolved. Keep T20 server/UI false in production and preserve normal
approval on every run. User-data retention certification remains excluded by
operator instruction.

**Evidence:** /private/tmp/takosan-migration-failure-37615237481/ and
/private/tmp/takosan-production-receipts-migration-failure-37615237481/;
independent Node 22 fixture proof at
/private/tmp/takosan-production-receipts-node22-control/.
Production schema/deploy verifiers remain prepared for 969d / main CI 37614255604
at /private/tmp/takosan-migration-gate-production-prep/. Final packet assembler
now checks smoke chronology before canary, fixture/terminal/readiness identity and
final D1 content chronology. Syntax and 12 isolated controls PASS (1 valid,
11 rejecting invalid cases); production requests 0, actual production packet not
written. These are preparation checks until actual migration, certification and
deployment receipts exist.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Production migration gate toolchain - 2026-10-07 JST

**State:** Production release remains incomplete. Protected inspection37611067522
verified the prior catalog recovery APPLIED at ledger38, so no recovery replay or
catalog rollback followed. New migration37612433689 failed in its credential-free
source gate:ERR_MODULE_NOT_FOUND for the top-level TypeScript import in
scripts/d1-migration-check.mjs. Migrate was SKIPPED; no new D1 write or Worker upload.
Main remains5b12ab71acd84beec62be967c950b12d596c88d7 while the small fix is reviewed.

**Change:** Branch codex/migration-gate-toolchain adds pinned pnpm setup10 and
pnpm install --frozen-lockfile before the production migration gate. The already
locked TypeScript dependency is now available on a fresh runner. No package,
lockfile, runtime, migration, production credentials or Environment policy changes.
Other deploy/certify source gates import only Node built-ins and do not share the
failure. This supersedes the previous checkpoint's next action to use unchanged
5b12 migration tooling.

**Verification:** actionlint1.7.12 and git diff --check PASS. Node24.16 focused
migration/preflight/release/runtime-proof tests4files/304tests PASS3.85s. Isolated
fresh checkout reproduced missing TypeScript before dependency install. Frozen
install completed, module import and offline candidate proof then PASS with the
explicit tested origin/main SHA:only0039,34pinned hashes. The initial local clone
inherited a different main ref and its ancestry check failed; that fixture ref was
corrected only in the private temporary clone, then the candidate check passed.
No live GitHub/Cloudflare gate was substituted by this local test. Exact-main5b12
CI37609952250 previously PASS253files/6160tests405.12s and full local gates were
already complete before this workflow-only change. New final-head/main CI is pending.

**Evidence:** Third applied receipt and normal approval retained at
/private/tmp/takosan-import-confirmation-production-inspect-37611067522/;
ZIPsha0af10c60605257478364f1a799bc3ca6fa03035a905b993efbd8d9eae3bda6c2,
receiptshaf9b5cdd37759074d151e5a985789e0dcca50b61625ca6683cfb4b39e829d2464.
No provider-terminal conclusion:UNKNOWN_NO_CURSOR; this is not full runtime release
certification. StaticWorker1a47f7f7/old136cb6ff remains unchanged at ledger38.

**Historical staging5b12:** Fully verified shadow37610975655,1%37611499034,
5%37611883708,25%37612247160,D137612639137; T20true/schema39/fingerprint/500recipes.
Ten actual artifactZIP digests and byte comparisons, five protected authority
proofs, fifteen publicreadiness/SWpairs and publicsmokes PASS. Final500ordered IDs,
15runtime fields and imported detail content PASS. FinalWorker
4f94b705-8d85-4d9c-89cc-7aea610b8872. PacketSHA256
c8650ab043a1dedf9cb24b2c0d18ad3e6aba1f0e466a3d9b331c516930ce8ccf at
/private/tmp/takosan-import-confirmation-staging-prep/staging-progression-receipt.json.
This packet cannot certify the newly merged workflow source.

**Next:** Review/merge the minimal fix normally and require final-head/exact-main
hosted CI. Freeze the resulting main SHA, rerun its full five-stage staging proof,
then dispatch intentional0039 with normal independent vn-taphoanhatung review.
Migration preflight must independently verify complete ordered V1/provenance/five-
query hydration/fingerprint before bookmark/apply. Verify exact39/schema/FK/quick/
catalog receipt, protected read-only certification and final staging before
productionT20false shadow/one synthetic provider smoke/1/5/25/D1. Every protected
run retains normal review; no bypass. User-data retention certification remains
excluded by operator instruction. Production deployment is incomplete.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Import confirmation implementation - 2026-10-07 JST

**State:** Production release remains incomplete. Recovery37536969564 was normally
approved and has ATTEMPTED_COMPLETION_UNCONFIRMED at BOOKMARK_AND_IMPORT, without
importFailure or provider code. This supersedes any earlier claim that all incidents
are absent; its exact namespace has not yet been inspected remotely. No subsequent
retry/rollback/0039/application deployment has occurred.

**Changes:** Branch codex/production-import-json-confirmation adds a strict pinned
Wrangler file-import stdout parser and a third sealed SELECT-only inspector for
37536969564/a8fa. Historical incident definitions and compiler bytes are preserved.
The runner saves and repeats the third capture, and requires absent/stable/all-eight
primary guards/no failed reads before any future restore pin/bookmark/import. Query
JSON remains strict. Unknown completion retains sanitized OUTPUT_UNCONFIRMED and
never starts an automatic rollback. Marker observations are not full catalog
certification or provider-terminal evidence; UNKNOWN_NO_CURSOR/retryAuthorized=false
remain explicit. No runtime, migration, payment/auth or Environment policy change.

**Evidence:** Root independently reproduced the third plan receipt exactly against
the retained production artifact:296/36 statements and both SQL hashes PASS.
Implementation checkpoint244a43b includes the final reviewed source. Root final
runner/auth/parser focused3files/194tests PASS36.51s (runner75/auth13/parser106);
inspector163/163 PASS44.27s. Lint, typecheck, migration smoke, build, actionlint1.7.12,
script syntax and diff checks PASS. Both independent reviews report no remaining
blocker after tightening contradictory optional metadata. The first exploratory
full suite was deliberately stopped(exit143) for that final code/test change;
it is not claimed PASS or a regression failure. Full final-source suite PASS:
253files/6160tests,341.60s,Node24.16,maxWorkers2. Hosted final-head/main CI remains pending.
Inspector's first focused attempt had one fixture-only rollback guard failure; it
was corrected by separating drift and real rollback cases, then163/163 PASS.
No live database completion follows from these local tests.

**Next:** Finish parser tightening, full gates and independent final review; publish
and merge a normal PR, require exact-main CI and dispatch one protected inspect-import
with its final reviewed implementation head. Obtain normal vn-taphoanhatung review,
retain sanitized evidence and choose action from the actual third incident. Applied
requires independent complete V1/provenance/runtime proof before0039; absent requires
all stable guards plus separately reviewed intentional recovery; partial/blocked
requires an incident decision. Re-certify the newly merged source through staging
shadow/1/5/25/D1 T20=true, then guarded0039/full production certification and same-source
production T20=false shadow, one synthetic provider smoke,1/5/25/D1. a8fa staging proof
cannot certify a new source. User-data retention checks remain excluded by operator.

Report: recipe-catalog/PRODUCTION_IMPORT_CONFIRMATION_20261007.md.
All preceding checkpoints below are historical.

---

# Protected import inspection verified - 2026-10-07 JST

**State:** Production remains incomplete. Protected read-only inspect37531433145
completed SUCCESS with normal independent vn-taphoanhatung approval; this supersedes
the prior WAITING/pending-approval state. Release main remains frozen at
`a8fa0324bb609274cc07a5c4b079e7ee4633fd83`; reviewed PR54 head796097d,
complete-tree equality and exact-mainCI37530420360 are verified. Latest catalog
import remains provider-terminal UNKNOWN_NO_CURSOR, but no recovery commit is
observed in repeated stable primary captures. No production mutation was executed.

**Receipt:** statusINSPECTED_IMPORT_READ_ONLY/phaseCOMPLETE/mutations0,
ledger38/0038 unchanged; original and latest recovery namespaces objects0.
Latest failed incident37491535308:9 successful strict-primary observations,
failed0/blockers0, eight guards MATCH and bounded old catalog MATCH. Current V2
preflight:8 successful strict-primary observations/failed0/blockers0/all8MATCH.
Original sealed incident37384670328 still has its two known schema/FK query
failures and one legacy blocker;15 successful observations are primary. These
failures are retained honestly and are covered by the independent corrected V2
preflight; original terminal state is not certified. Both incident captures are
OBSERVED_STABLE_NON_ATOMIC. Old static100% Worker deployment/version/modules/bindings
are unchanged:1a47f7f7-3d74-4801-b26a-b91f39c7942e,
moduleSHA5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1.

Artifact11446940708 ZIP digest verified
`95cb8d80285da703cf5247929c109a94387e5da6aca0613f0346f6ad0e995424`.
Sanitized receipt SHA256 `294fe872124f5b4c6f74f8593b2fb11838f8d424e7fde7d4539d39981008fd2f`;
receipt and normal approval are in
`/private/tmp/takosan-production-v2-inspect-37531433145/`.
Root and independent reviewer both classify latest observations as ABSENT,
not import completion/retry/write-permission/release certification.
First temporary root verifier incorrectly required zero failed reads in the
sealed original inspector, rejected its two known legacy query failures; corrected
verifier explicitly retains those failures and separately requires exact latest
and corrected strict-primary zero-failure proofs. Final verification PASS.

**Credentials:** effectiveAPI_TOKEN/globalKeyPrecedencefalse; ACCOUNT token
verificationACTIVE/HTTP200 after user-token endpoint401/1000. Account/database
identity GETsHTTP200 and SELECT1 primarytrue prove read access. Token metadata
GET403/9109 leaves D1 Edit/account resource/deny/IP/TTL policy UNKNOWN and
writeAuthorizationUNKNOWN. Account-owned tokens officially support D1; pinned
Wrangler3.114.17 uses the same Bearer path for query/import. Token kind alone
is not evidence for prior10000. No credential values were read or published.

**Cloudflare console observation:** existing Chrome session is authenticated to
the same account and frigo-db binding. Named `tako-san-production-deploy` account
token is Active, recently used, and the account-policy D1 filter shows Read=1,
Edit=0. This is direct policy evidence for that named deployment token; the
aggregate receipt intentionally contains no token identifier, so name/activity
correlation is not an exact secret-to-token identity proof. No permissions were
changed at this initial observation. User then explicitly confirmed adding only
D1 Edit. Existing token policy was saved once:13 permissions versus12 before,
D1 Read retained and D1 Write added. Reopening the persisted token verifies
Read=1/Edit=1/Active. Existing entire-account resource, no expiry and all-IP policy
are unchanged; no other permission, token rotation, secret value or GitHub secret
was changed. The current receipt's writeAuthorization remains UNKNOWN; console
name/activity correlation is not an exact secret mapping or HTTP write certificate.
Evidence: cloudflare-console-scope-change.json beside the sanitized receipt.

**Recovery dispatch:** new intentional guarded restore-v1 run37536969564
https://github.com/vn-tak/Tako-san/actions/runs/37536969564, dispatched once at
2026-10-06T21:53:09Z on frozena8fa/reviewed796. Main/CI/full-tree gate SUCCESS;
normal review byvn-taphoanhatung is API-verified approved. The run completed
FAILURE atBOOKMARK_AND_IMPORT, statusIMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED,
importOutcomeATTEMPTED_COMPLETION_UNCONFIRMED. All fresh original/latest/current
preflights passed; current eight guards strict-primaryMATCH/failed0/blockers0.
Worker1a47f7f7 static100% was verified without redeployment (methodalready-static).
PreLedger38, bytes7409664; bookmark
0000018f-00000000-000050fc-4d329b2c830ec0bde6b059beb46b6150,
captured2026-10-06T21:56:58.499Z. No importFailure field or retained provider code
is present, and no post-import catalog/ledger/health/finalWorker certification.
Artifact11446718824 ZIP digest independently verified
ac8f45e104d4c0a9a06f59b8afb6af988aefc3c106169b9af23d1dafe84febe6.
Receipt SHA256a484b5256be675df15154b0c59eb102358d4d602fe1728db8fc5946ebe2caab7,
under/private/tmp/takosan-production-guarded-restore-37536969564/.
Root offline exact planPASS: guardVersion2,
SQLSHAe5a58960baa4b8e1f4cae8be94985dd03cf4e9acf03c274b38fb310ce79f28c0,
rollbackSHAba48a606a1694ec87a3af22fc01a640f0653344335ebd21bd260cdbefd4fdcee;
expected500/2702 ingredients/2064steps/2702positions.

**Confirmed parser defect:** Independent offline replay of verbatim pinned
Wrangler3.114.17 Handler/execute/import/spinner functions with mocked provider
responsesPASS, no network/productionmutation. Both successful upload and cached
init paths return nonempty all-success arrays but prepend spinner stdout even
under --json/loggerLevelerror. Full stdoutJSON.parse fails; --command query control
is cleanJSON. Runner's file-import parser therefore rejects legitimate successful
output. This explains a possible post-success parse failure and the missing
importFailure field; actual production import commit remains UNCONFIRMED until
inspection of this exact new repair prefix. No blind retry/rollback/0039.

**Next:** review and publish a narrowly validated file-import output parser and a
third sealed read-only inspector for37536969564, preserving both old incident
inspections. Use normal PR/mainCI/productionreview, then independently inspect
objects/markers/live+archive+target/primary/ledger/static proofs before choosing any
mutation. Current inspector only seals the two older incidents and cannot certify
this new outcome. Only proceed to guarded0039 after V1 catalog/integrity proof at38.
After guarded0039 and full
production read-only certification, deploy the same release T20server+UIfalse:
shadow, one synthetic live provider smoke, then1/5/25/D1 with normal approvals.
Final-SHA staging five-stage progression/public500 proof is COMPLETE, packet
SHA256a4a852df3464c243bc6d07cdb96d47cbea713288a7a81e4199fd1f7f5a5156f4.
Production validators are prepared under/private/tmp/takosan-final-production-prep/;
synthetic validator fixtures are not production evidence. Remote main stays frozen;
this documentation checkpoint is local/unpublished. No0039/new application/AI smoke/
production canary or D1 completion is claimed.

---

# PR54 merged forensics checkpoint - 2026-10-07 JST

**State:** Production deployment is incomplete. Latest restore37491535308 was
normally approved byvn-taphoanhatung and failed with unconfirmed import completion.
It is not waiting for review. Provider terminal remainsUNKNOWN_NO_CURSOR. User
requests production recovery/migration/deploy and excludes user-data retention;
normal independent production Environment approval remains mandatory.

**Published:** PR54 https://github.com/vn-tak/Tako-san/pull/54 merged normally at
2026-10-06T20:57:58Z to a8fa0324bb609274cc07a5c4b079e7ee4633fd83.
Executable86bfec959584f6a194543ec12470b956e5c951ff; reviewed finalhead
796097d9c1e2db4972151376449873c1ef60419f. Local Git proves reviewedhead ancestry
and identical complete tree0bdbdec8542b3304c7f6d11447b844bbf5945043 at main.
All12paths independently reviewed, no concrete blocker. Historical migrations,
PayOS/payment/billing, application runtime and unrelated auth remain unmodified.

**Checks:** Full credential-free Node24 suite252files/5993testsPASS489.06s/exit0,
no skipped. Earlier full5992PASS/1FAIL492.44s remains recorded: existing Wrangler
catch-up test5273ms exceeded unchanged5000ms limit; isolated32/32PASS2.85s and
full-recheck Wrangler787ms. No toolversion/timeout/test/protection was weakened.
Lint/typecheck/migration smoke/build/actionlint/syntax/diffPASS. Final PR hosted
CI37529365966 SUCCESS252files/5993tests390.11s/all gates; initial headCI37528405327
SUCCESS252/5993/373.17s. Exact-main CI37530420360 SUCCESS252files/5993tests368.10s/all gates.
Root reverified live maina8fa and dispatched consolidated inspect-import37531433145
exactmain/reviewed796097d once. Source gate SUCCESS; approval reported; API
verification pending. No remote inspection completion or production recovery is
claimed. Finala8fa staging shadow/1/5/25/D1 at hardening089ae/T20server+UItrue is
complete with hosted and independent receipt/readiness/SW/smoke/content proof.
Staging operations made no production access or tracked source edits. Credential-free
workflow registration37530420366 SUCCESS (echo only, no production access).

**Next:** Freeze remote maina8fa. Await API-verified normal approval and completion
of consolidated protected inspect-import37531433145 onmain/reviewed796097d.
It reads both fixed incidents, corrected guards and bounded credential evidence,
requires unchanged ledger38 and old static100% Worker before/after; no retry/release
authority. Actual D1 import state and effective Cloudflare write grant remain
unconfirmed. Final-SHA staging shadow/1/5/25/D1,T20server+UItrue is now certified.
Current Deploy workflow is manual workflow_dispatch only; the DEPLOYMENT.md
automatic-staging description is historical and must not drive operations. New
production0039/application/AI smoke/canary/D1 success is not claimed.

**Staging final a8fa:** COMPLETE and independently verified at frozen main
`a8fa0324bb609274cc07a5c4b079e7ee4633fd83`, approved hardening
`089ae329ebba2ba38659c030266068aeace9b8a8`, exact-main CI `37530420360`.
Every stage is first-attempt SUCCESS, release/staging SUCCESS and production
SKIPPED; schema 39/0039, T20 server+UI=true. Manifest, build-flag gate and upload
command agree. Protected D1 probe is ready/500, fingerprint
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`, release
`rel-bd00a4f53fcaeee4`, fallback=null. Hosted and independent public smoke PASS
at every stage; readiness and SW have three consecutive exact-SHA pairs.

| Stage | Run | Previous Protected State | Hosted Wait / Independent Wait |
| --- | --- | --- | --- |
| shadow/0/cutover=false/global=static | [37531528831](https://github.com/vn-tak/Tako-san/actions/runs/37531528831) | 4092/d1/0, ancestor; rollback=true | 15153 ms / 7733 ms |
| canary/1/cutover=true/global=mixed | [37531812833](https://github.com/vn-tak/Tako-san/actions/runs/37531812833) | a8fa/shadow/0; rollback=false | 14949 ms / 7608 ms |
| canary/5/cutover=true/global=mixed | [37532189153](https://github.com/vn-tak/Tako-san/actions/runs/37532189153) | a8fa/canary/1; rollback=false | 7680 ms / 7703 ms |
| canary/25/cutover=true/global=mixed | [37532527218](https://github.com/vn-tak/Tako-san/actions/runs/37532527218) | a8fa/canary/5; rollback=false | 29871 ms / 7671 ms |
| d1/0/cutover=true/global=d1 | [37532897461](https://github.com/vn-tak/Tako-san/actions/runs/37532897461) | a8fa/canary/25; rollback=false | 14734 ms / 7791 ms |

SW at every final-SHA stage is HTTP200/JavaScript/no-store/exact a8fa, SHA256
`5056dccadfb9c387399c972531bb36419a2fdf2b6b810b7f190f85f3857e7f0f`.
Checks use unchanged defaults: 90000 ms deadline, 3000 ms interval, 15000 ms
request timeout and three consecutive pairs. No retry or check/bound/source change.

Final D1 Worker `805d6281-bd61-44ba-9501-ff8d53ed17d3`.
Artifact `11444883305`, `release-staging-37532897461-1`, digest
`c5023768cd1a97243348141de9f98f20bf8d4b36b807aec140c4c09786d425bb`.
Receipt `/private/tmp/takosan-final-staging-d1-37532897461/release-manifest.json`,
SHA256 `3e4261cf14a5267fc167ba7c92b923561067a36d79229f45d0dc23531bd98974`.
Full progression packet (all five artifacts/Workers/receipt hashes/logs/proofs):
`/private/tmp/takosan-final-staging-prep/staging-progression-receipt.json`, SHA256
`a4a852df3464c243bc6d07cdb96d47cbea713288a7a81e4199fd1f7f5a5156f4`.

Independent final public catalog proof PASS at `2026-10-06T21:20:59.787Z`:
767 local source blobs match final SHA; canonical sourceDigest
`4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5`.
Five credential-free GETs with three exact-SHA/D1 readiness guards prove public
list HTTP200/count500, ordered IDs MATCH and all 15 runtime-field fingerprint
MATCH. Imported detail `imp-199ff78d3d8c8ab3` is HTTP200, full runtime canonical
and list parity MATCH (six ingredients/five steps). Additive media fields are
outside this runtime fingerprint. Root independently read the content proof PASS.
Evidence `/private/tmp/takosan-final-staging-d1-37532897461/public-catalog-content-proof.json`.
Live main remains a8fa; all five runs are completed SUCCESS. No further staging
dispatch is required. This proves staging; no production completion is claimed.

Protected production inspect `37531433145`: **approval reported; API verification pending**. User reports approval; root's latest API still shows source gate SUCCESS,
recover WAITING/approvals[]/current_user_can_approve=false, required reviewer
`vn-taphoanhatung`. Remote inspection outcome remains unverified. No D1 mutation,
0039 or production application deployment follows from staging proof or approval
report alone; wait for the authorized protected inspection result and its evidence.

This local evidence update is unpublished to preserve the frozen release SHA.
Prior pending-main/restore-WAITING sections are historical and superseded here.

---

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
Full unchanged recheck252files/5993testsPASS489.06s/exit0/no skipped.
Wrangler case passes787ms in the full recheck. Independent final-tree review at
e768acfe7c3f953fba4121818707589a3d7841d2 found no concrete blocker across12paths.
PR54 hosted CI is still running; exact-final-head and exact-main CI and new remote
inspection success are not claimed. Documentation now records the actual final
local result; the next documentation checkpoint remains subject to hosted CI.

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

# Production guard V2 published checkpoint - 2026-10-07 JST

**State:** Production release is incomplete. PR53 merged normally at
4092d4ca2dacee8bb01da484aae93592e9bd94da on 2026-10-06T15:40:10Z.
Reviewed final head6e45d824363c24c8b63b629eefce8252e8f16a6f and merged main share
complete treef97f89682665fcd9a3e5dd2888f8443ea76a1b2d; ancestry and equality were
verified. Exact-main CI37489453830 SUCCESS: 251 files / 5873 tests PASS
(380.38s), lint, typecheck, migration smoke and build PASS. Credential-free
registration37489453876 SUCCESS. Main is held fixed for release evidence.
Operator authorizes recovery/migration/deploy and confirms no real users;
user-data retention certification is excluded. Normal required production review
by vn-taphoanhatung remains; CLIvn-tak cannot supply that review.

**Implementation:** Executable4aeb7988c0ec2d44e1f8fbaa7e74eb9224e4cb11 implements
strict internal inventory, materialized application-FK scanning, case-folded
FK/trigger and original-prefix coverage, sealed original inspection compiler,
eight strict-primary preflight guards, repeated original/new observations and
original static100% Worker checks before any new guarded recovery. File import
and rollback require nonempty all-success JSON; ambiguous completion stays unknown.
Independent exact-final-tree review found no concrete remaining blocker.

**Checks:** Local compiler48/helper74/runner53/approval13 PASS; independent
compiler+helper122PASS29.39s and runner+auth66PASS15.35s. Full Node24 suite
251files/5873tests PASS487.54s/exit0; lint/typecheck/migration smoke/serial build/
syntax/diff PASS. Real local workerd D1 restore296/rollback36 PASS,500hydrated/
failures0/exact V1 fingerprint, rollback6720lines/order0/ledger38/FK0. PR53 hosted
CI37488555229 SUCCESS,251files/5873tests/283.24s and all gates. Earlier failed
fixture/harness attempts are documented in the report and are not production proof.

**Production proof:** Previously approved inspect37460946708 SUCCESS proves
stable observed old catalog, original repair objects0, no observed commit,
primary availability at observation times, ledger38/0038 and unchanged original
static100% Worker. Only incoming-FK original schema predicate fails; no retained
remote error/terminal cursor. Original provider terminal state UNKNOWN_NO_CURSOR.
A fresh public curl GET reports readinessok, commit136cb6ff..., healthy DB/queue,
static0/cutoverfalse/globalSourcestatic/fallbacknull. Python urllib GET was403;
public curl success is health evidence, not protected catalog certification.
A mistaken GET to /api/v1/ready returned 401; corrected public
/api/v1/health/ready GET confirmed the same healthy static old-source state.
Corrected inspect37490593680 SUCCESS with normal vn-taphoanhatung review:
mutations0, repeated OBSERVED_STABLE_NON_ATOMIC captures, original repair objects0,
NO_RECOVERY_COMMIT_OBSERVED, primary availability at observations, ledger38 before/
after and exact original static100% Worker/module unchanged. Corrected V2 preflight
GUARDED_PREFLIGHT_MATCH: eight guards MATCH, strict-primary8, failed0, blockers0.
Original provider terminal remains UNKNOWN_NO_CURSOR, retryAuthorized=false.
New intentional guarded restore37491535308 dispatched once at frozen4092 /
reviewed6e45. Source/main/full-tree/CI gate SUCCESS; recover waits for required
production review; API current_user_can_approve=false and approvals empty.
No recovery success, 0039 or new production application is claimed.

**Staging:** Same frozen4092 / hardening089ae / T20 server+UItrue sequence
completed: shadow37490615290 -> canary1 37491302867 -> canary5 37491745113 ->
fresh canary25 37493006431 -> D1 37493357178, all SUCCESS with protected500/exact
V1 fingerprint/no fallback, three paired readiness/SW observations and hosted+
independent public smoke PASS. Final Worker dc22aad4-fe86-4a6d-84de-50abc545731e,
schema39/0039, globalSource=d1. Independent public list has exact500 IDs/order/
runtime fingerprint; D1-only detail HTTP200/full runtime content MATCH.
Initial25 run37492174560 remains FAILED after upload and SW fetch rejection;
unknown cause, no post-deploy certification. Default-bounds live proof and fresh
same25 dispatch resolved the verification gap without changing code/checks/bounds.

**Next:** Required normal vn-taphoanhatung review of restore37491535308
([run](https://github.com/vn-tak/Tako-san/actions/runs/37491535308)) is the external
blocker: source gate SUCCESS, recover WAITING, approvals empty and CLI vn-tak cannot
approve. Await review; the runner then freshly repeats original/corrected proofs
before any mutation. Require V1_CATALOG_CERTIFIED_STATIC,500 hydrated/exact
fingerprint, ledger38/integrity before guarded0039, then production read-only
certification, same4092 production T20false shadow, one synthetic live AI smoke and
production1/5/25/D1. Staging is complete. Keep remote main frozen4092; this local
unpublished documentation checkpoint must not become the release ref.

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
Prior sections remain historical. This local evidence checkpoint is not pushed
while the release source is frozen.

---

# Production corrected recovery guard checkpoint - 2026-10-06 JST

**State:** Production release remains incomplete. User authorizes recovery,
migration and deployment and confirms no real users; user-data retention
certification is excluded. Normal independent production Environment review
remains required. Current main is 660521b41cd0a71e1d2ce88806e2b7d041b30155.
PR52 reviewed head 9a659fade16fee293fff1a634938fb23be6b7903 merged normally;
complete tree equality/ancestry and exact-main CI37459993796 SUCCESS were verified.

**Remote proof:** Normally approved inspect37460946708 SUCCESS, mutations0,
two identical OBSERVED_STABLE_NON_ATOMIC captures, exact original recovery prefix
objects0, no recovery commit observed, primary reads not blocked at observations.
Canonical ledger38/0038 and original static100% Worker/version/module are unchanged.
Seven table shapes and active triggers MATCH; incoming_foreign_keys QUERY_FAILED
is the only failing original schema predicate. Other six pre-mutation guards MATCH.
Original provider terminal state remains UNKNOWN_NO_CURSOR; this proof does not
certify a retry or release. Artifact11411598439 digest
7d5915c219622e800fcf8d56f143c271f8a4e2e267c34f41f74d37093bf9b2a0.

**Staging:** Exact660 shadow37461272700 SUCCESS, T20 server/UI=true, protected
D1ready500/exact fingerprint, three paired readiness/SW observations and smoke.
Worker7dc92d32-e796-4f6e-a298-70a62ad97e85; artifact11412347814 digest
f41ef63adbc728d0972348483f920feb4bd20172df463a839cabed4019c49478.
No staging canaries dispatched; a new final main requires a fresh shadow sequence.

**Changes:** Branch codex/production-recovery-fk-guard adds guardVersion2
RESTORE_V1. Exact D1 internal inventory is checked before a materialized
application-table incoming-FK scan; unknown internal objects/schema and unknown
application references remain fail-closed. Original f4b6a4d SQL remains sealed
INSPECTION_ONLY and cannot be selected by the restore compiler. Read-only
inspect-import also evaluates two corrected eight-guard preflights. Restore
requires repeated identical original no-commit/primary/old-catalog proof,
strict-primary corrected preflights, exact original static100% Worker and fresh
main/normal approval before pin/bookmark/import. Import/rollback use --json;
file-command errors publish only bounded status/numeric provider codes.

**Checks:** Final credential-free Node24 focused compiler48/helper74/runner53/
approval13 PASS; compiler+helper independently122/122PASS29.39s and runner+auth
66/66PASS15.35s. Independent review found and fixed uppercase FK/trigger target
coverage and original recovery-prefix visibility; fresh review found no further
concrete blocker. Lint/typecheck/migration smoke/syntax/diff and serial build PASS.
Final credential-free Node24 full suite251files/5873tests PASS,487.54s/exit0.
Executable checkpoint4aeb7988c0ec2d44e1f8fbaa7e74eb9224e4cb11. Actual Miniflare/workerd D1 atomic restore
296statements PASS,500hydrated/failures0/exact V1 fingerprint; rollback36 PASS,
6720lines/order0/ledger38/FK0. Fixture includes documented _cf_KV seeded privately
via immutable local SQLite prefix. Initial combined Wrangler seed failed
SQLITE_TOOBIG; first direct fixture replay failed FK, two harness setups failed
module/persistence discovery. None reached production or proves the remote error.
Wrangler optional update cache was refreshed from an actual npm registry response;
no source/test/timeout/tool version edits. No new remote mutation.

**Next:** Publish the validated, independently reviewed PR,
require green final-head CI, merge normally and require exact-main CI/tree equality.
Dispatch corrected inspect-import first and obtain normal vn-taphoanhatung review.
Only all eight hosted guards MATCH with strict-primary observations permits a
separately approved intentional new V2 recovery. Require live V1/static/500/exact
fingerprint/ledger38/integrity before guarded0039, read-only certification, final-SHA
staging shadow/1/5/25/D1 T20=true, production same-SHA T20=false shadow, one live
synthetic AI smoke and production1/5/25/D1. No final production success is claimed.

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
Earlier checkpoint sections are historical.

---

# Production interrupted-import inspection checkpoint - 2026-10-06 JST

**State:** Release incomplete. Normally approved diagnostics 37450399162 SUCCESS
at f2b00023ccb9a706d17ebe71321c0364a948ca75. Repeated reads show ledger38/0038,
500 version2 recipes,6720 ingredient lines,0 order rows,0 hydrated recipes and
500 missing_ingredient_position failures. This diagnostic success does not certify
release or settle recovery37384670328 provider completion. No blind retry,
rollback,0039 or promotion. User authorizes production release and confirms no
real users; user-data preservation certification is excluded.

**Changes:** PR51 final d70d644e5d4e953ebe02894a28cf8fe4c110006e passed hosted
CI37453365335 and merged normally at2026-10-06T11:25:37Z. Current main
 d2108588e4dfbccba6dbe75ab5fd0005330ae38d has identical complete reviewed tree;
exact-main CI37456321861 SUCCESS (250files/5736tests/288.01s plus all gates),
registration37456321763 SUCCESS with no
production access. New inspect-import operation under implementation on
codex/production-import-inspection is fixed to failed recovery37384670328.
It reads exact repair objects and compiler-derived pre-mutation guard booleans,
re-proves original static100% Worker/ledger before and after and compares two
aggregate captures. No SQL file import, pin, rollback or migration path runs.
Existing normal independent Environment approval/full-reviewed-tree/CI gates
remain. Hypotheses about protected internal-table PRAGMA or completion parsing
are unproved; recovery compiler and mutation behavior are unchanged.

**Checks:** Initial focused runner/auth43 had42PASS/1FAIL: real-helper guard
parser rejected exact_0038_ledger digit label; fixed parser and added regression.
Root focused3files71PASS (runner31/helper27/auth13),18.05s; helper final tests
still finishing. pnpm lint,typecheck,check:migrations,build,changed-file ESLint,
helper/test syntax and diff PASS. Full suite/independent final review pending.
No new remote inspection dispatch or production mutation has run.

**Production:** Last verified pin is old-source136cb6ff/static0/false,100%
version1a47f7f7-3d74-4801-b26a-b91f39c7942e with module sha256
5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1.
Recovery37384670328 lost import completion after this pin/bookmark; no automatic
rollback or post-import certification ran. Exact repair objects and provider
blocking status still need inspection. Cloudflare import poll requires the lost
at_bookmark; Time Travel bookmark is not an equivalent cursor. Successful primary
SELECTs can prove no blocking import at observation times, not a terminal reason.

**Next:** Finish bounded helper/tests/full repository gates and independent
review; publish PR, final-head CI, normal merge and exact-main CI. Dispatch one
inspect-import, freeze main and obtain normal reviewer vn-taphoanhatung approval.
Use actual proof to resolve recovery safely. Require independently certified
V1/static/ledger38/500/exact fingerprint/integrity before0039, then final-SHA
staging shadow/1/5/25/D1 T20true and production sameSHA T20false, shadow, one
corrected live synthetic AI proof and production canaries. Production is not
complete; no corrected live AI success is claimed.

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
Earlier checkpoint sections are historical.

---

# Production asset convergence checkpoint - 2026-10-06 JST

**State:** Release incomplete. Remote main stays
f2b00023ccb9a706d17ebe71321c0364a948ca75 while read-only diagnostics 37450399162
waits for the required production reviewer vn-taphoanhatung. Recovery 37384670328
was normally approved and FAILED with import completion unconfirmed after a
successful static pin. CLI vn-tak cannot approve. No blind retry, rollback or
migration is authorized by this ambiguous result. The operator authorizes release
and confirms no real users; user-data preservation certification is excluded.

**Changes:** Executable a9f1c81582677d4b40806c388d27892edeec1f44 pairs exact
readiness/approved authority with same-origin /sw.js before counting each of three
consecutive observations. Only an otherwise-valid SW with a different canonical
full SHA retries. The existing 90-second shared budget includes request/body time;
no request starts at zero budget. The 256 KiB body limit, HTTP/MIME/no-store/syntax/
strict BUILD_ID/SW marker checks and sanitized errors fail closed. CLI writes a
separate deployedAssets proof; original deployed shape/workflow/smoke are unchanged.

**Checks:** New assets RED 43 fail; final focused 331 PASS, independently rerun by
root. First full suite FAILED: 249 files / 5735 tests PASS, one unrelated catch-up
Wrangler test exceeded unchanged 5000 ms timeout; exit 1 / 512.97 seconds. Isolated
unchanged suite 32 PASS in 3.04 seconds (Wrangler case 919 ms). Cause unproven; no
test/timeout edits. Final full rerun without parallel Wrangler/build: 250 files /
5736 tests PASS, exit 0 / 490.18 seconds. Serial build, lint, typecheck, migration
smoke, syntax and diff PASS. Root reviewed frozen source/tests with no concrete
blocker. A first additional review attempt was unavailable; the later independent
frozen review completed with no blockers,331/331PASS (2.06s), ESLint/diff PASS and
all three file hashes matching the freeze. Shape/BUILD_ID and observed bytes are
proved, not semantic SW execution or complete HTML/JS bundle content.
PR51 head 93e3db2004c518af7694edd4db89e918510c5d72 passed hosted CI37452057402:
250files/5736tests (198.73s), lint/typecheck/migration smoke/build. PR remains OPEN
and held while diagnostics waits. This new documentation-only checkpoint still
needs final-head hosted CI; exact merged-main CI remains required after merge.
Local isolated recovery SQL probes did not complete (exit143/137); they provide no
import outcome or remote-cause proof. No credentials/remote mutation were used.

**Remote:** Staging 37384738093 FAILED after Worker publication and three exact
readiness observations: /sw.js had not embedded expected f2b. Failed body not
retained, actual prior SHA unknown. Protected authority step did not run; no new
recipeAuthority proof/canary exists. Later public SW/smoke converged. New native
CLI public GET-only rehearsal PASS at 2026-10-06T10:25:27.065Z: three exact pairs /
7907 ms. Separate /tmp manifest preserves the original artifact. This does not
certify protected 500/fingerprint or turn the failed workflow into a success.

**Production:** Recovery proved ledger 38/0038 and 7409664 database bytes, cloned
modules/runtime/bindings/assets, changed only three catalog variables to static/
0/false and confirmed 100% version 1a47f7f7-3d74-4801-b26a-b91f39c7942e.
Bookmark captured. Import then failed at BOOKMARK_AND_IMPORT with
IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED /
ATTEMPTED_COMPLETION_UNCONFIRMED; no post-import certification or automatic rollback
ran. D1 commit state is unknown. Public readiness remains old 136cb6ff, healthy DB/
queue, static/0/false with fallback null. No 0039/new production application yet.
Artifact 11405412106 digest:
0963a326ff12c085ce62737096928dbb6d669485a432865cf5a31deaca9bea45.

**Next:** Obtain normal review for read-only 37450399162, inspect stable catalog/
ledger and resolve the unknown import state from evidence. Keep main fixed during
pending operations. Require independently certified V1/static/ledger 38/500/exact
fingerprint/integrity before 0039. Publish the validated asset PR; require final-head
hosted CI, merge after pending operations finish, then exact merged-main CI. Freeze
final SHA and restage shadow/1/5/25/D1 with T20=true. Production same SHA, T20=false:
guarded 0039, read-only certification, shadow, live synthetic AI, then 1/5/25/D1.
Normal production Environment approvals remain. No corrected live AI success claimed.

**Report:** [PRODUCTION_ASSET_CONVERGENCE_20261006.md](recipe-catalog/PRODUCTION_ASSET_CONVERGENCE_20261006.md).
Earlier checkpoint sections are historical, including previous waiting/in-progress claims.

---

# Production f2b rollout checkpoint - 2026-10-06 JST

**State:** Release incomplete; recovery37384670328 waits for normal independent
production Environment review by vn-taphoanhatung. Its exact-main/full-tree/CI
gate succeeded. CLIvn-tak cannot approve it. Main is frozen at
f2b00023ccb9a706d17ebe71321c0364a948ca75; merged PR50 final head
3f38acaca216bf8a6e6f0345b42129ae0a707623 is an ancestor with identical complete
tree0e5586fc77149c68633e7886b96c4579245a3801. Do not advance remote main while
recovery is pending/running. Operator authorizes production release/no real users;
user-data preservation certification is excluded.

**Changes:** Capacity414f449 uses verified query meta.size_after with the original
strict100MiB bound and fails before any pin/import if invalid. Worker API
compatibilityca91a1f validates observed annotations/AI project/runtime assets;
strict inheritance/module equivalence/full asset configuration equivalence before
traffic and after deployment remain enforced. Documentation checkpoint3f38aca.
PR50 merged normally at2026-10-05T22:39:23Z; no bypass or squash/rebase merge.

**Checks:** Final full local command (credentials removed)
TMPDIR=/private/tmp TZ=UTC WRANGLER_SEND_METRICS=false pnpm exec vitest run
--maxWorkers=1:249 files/5692 tests PASS, exit0,495.85s. Serial pnpm build PASS.
Final lint/typecheck/migration smoke/syntax/diff PASS. Capacity20/20 and observed
metadata51/51 PASS, independently rerun; no concrete release review blockers.
Hosted final-head CI37383072785 and exact-main CI37383852019 PASS, each249/5692
plus lint/typecheck/migration smoke/build. Main-push registration37383852122
succeeded with only the registration echo. Earlier capacity-only suite was
intentionally cancelled, exit130; initial concurrent build failure was followed
by standalone PASS without source changes, cause unproven.

**Remote:** Recovery37379695824 stopped before Worker pin/catalog mutation;
approved inspect37381283540 completed read-only and revealed the actual metadata
compatibility differences. Production still old136cb6ff, ledger38, D1 configured
but static fallback CATALOG_DIAGNOSTICS; DB/queue healthy. No V1 import/0039/new
production application yet. New f2b staging shadow37384738093 is in progress,
pairedT20true, intentional rollback=true from healthy prior b33 D1. Dedicated
staging agent owns shadow/1/5/25/D1; root owns all production operations.

**Live AI:** Corrected code remains unproved on production. Prepared script
/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py now
requires exact merged-main SHA, production shadow/0/cutoverfalse/globalstatic/
fallbacknull before guest/scan and after terminal ready. Offline syntax/17 guard
cases/DTO/unit fixture checks PASS. Scriptsha256
54933151ea09afaece4cc2cf4e7ed922e2ac7a313c8a27bd8e8a1d89b7c1d546.
No live invocation of corrected code yet. Exactly one synthetic upload, bounded
polls, no ambiguous-submit retry, sanitized evidence and logout remain required.

**Next:** Obtain actual approval for37384670328, verify its receipt rather than
assuming chat confirmation. Require V1_CATALOG_CERTIFIED_STATIC, old-source
static100%, ledger38,500/exact V1 fingerprint/integrity before guarded0039.
Then production read-only certification; finish f2b staging shadow/1/5/25/D1;
production samef2b shadow/T20false, live synthetic AI proof, then1/5/25/D1. Every
normal production Environment gate remains. Local rollout documentation is on a
separate branch; remote main must remain f2b until all pending operations finish.

**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Earlier checkpoints are historical.

---

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
**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Earlier checkpoint sections are historical.

---

# Production replacement candidate checkpoint - 2026-10-06 JST

State: production release incomplete. Current main remains
`cd66bb86ca7c440b606fb8672e89428800df33c2`. PR49 carries AI correction `e7d7db1`
and Worker metadata compatibility correction `1ed5733`. The operator authorizes
production release and confirms no real users; user-data preservation certification
is excluded.

Changes: static-pin now accepts Cloudflare's documented informational metadata
`hasPreview` and `modified_on` alongside legacy `has_preview`. Unknown fields
still fail before mutation. Exact deployed source/runtime/bindings/assets,
module equivalence and approval/freshness fences remain enforced. AI repair
preserves the complete default/custom extraction task/schema; its role in the
observed live INVALID_RESPONSE remains unproven.

Checks: metadata regression red 3 failures / 20 passes; final focused suite
24 PASS, independently rerun. Combined recovery/AI targeted validation five files /
70 PASS. Lint, typecheck, migration smoke, production build, syntax and diff PASS.
Full combined candidate suite: 249 files / 5653 PASS, exit 0, 514.45s,
unchanged timeouts, one worker, UTC and canonical macOS temp path.

Remote: recovery37334212154 intentionally CANCELLED at 2026-10-05T20:49:15Z,
recover job steps empty, approvals/pending deployments empty. It executed no
Worker/catalog/migration mutation and no longer requires review. Staging canary1
37370418398 FAILURE before steps; annotation: "The job was not acquired by Runner
of type hosted even after multiple attempts". Staging remains healthy shadow
on cd66/T20true; production remains old 136cb6ff/static fallback/ledger38. Actual
catalog recovery,0039 and new production application deployment remain pending.
The earlier normal disposable guest/synthetic scan failed INVALID_RESPONSE;
logout revoked its session. Corrected live provider readiness is still unproven.

External gate: GitHub Actions incident remains active; latest 20:47:22Z update
reports degraded availability. PR49 prior-head CI37371504325 failed before steps at 20:58:30Z with the
same hosted-runner assignment annotation. Final-head hosted CI and exact merged-main
push CI remain required after publication; resolve their current IDs from PR49.

Next: require green hosted CI on the final PR49 head, merge with a merge commit,
require exact-main push CI and freeze the new main. New recovery attempt1 must bind ref to
that main and reviewed_sha to the final merged PR49 head, preserving ancestry
and complete tree equality. Fresh normal production Environment review is needed
only when that new run exists. Require V1_CATALOG_CERTIFIED_STATIC before guarded
0039; full production certification follows 0039. Restage the final SHA through
shadow/1/5/25/D1, paired T20true. Production uses T20false, same immutable SHA,
shadow/live non-PII AI proof before 1/5/25/D1 promotion. Do not reuse the cancelled
run or old reviewed implementation head.

Runner-local final-candidate smoke is prepared at
`/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py`.
Static syntax and fixture hash PASS; it has not been executed. Require explicit
production SHA and the deployed corrected shadow before its one synthetic scan.

Report: [PRODUCTION_RELEASE_BLOCKERS_20261006.md](recipe-catalog/PRODUCTION_RELEASE_BLOCKERS_20261006.md).
Older checkpoints follow and their pending-run claims are historical.

---

# Production release and AI retry checkpoint - 2026-10-06 JST

Current GitHub main `cd66bb86ca7c440b606fb8672e89428800df33c2` has green exact-main
push CI37333194384:248 files /5640 tests plus lint/typecheck/migration smoke/build.
PR48 is merged. Actions registration375554736 is active; push registration run
37333194265 succeeded with only register running and gate/recover skipped.

Reviewed recovery dispatch37334212154 passed its complete-tree/main/CI gate and
is waiting for normal production Environment review by `vn-taphoanhatung`.
CLI actor `vn-tak` cannot approve it. No production catalog recovery,0039
migration or application deployment has occurred. Do not advance main while
this run is pending: its mutation fences require exact current main.

Staging0039 certification37331557226 and runtime readiness37331892983 succeeded
(certify-only39 ledger/FK0/500 hydrated/exact V1 fingerprint). Staging Deploy
shadow37334571659 succeeded atcd66 with paired T20=true, D1 ready500/no fallback,
exact SHA smoke and version223b8b47-5439-49b9-b089-e444e7a97174. Same-SHA canary
progression is in progress; production T20 remains deliberately off.

Actual live non-PII production receipt smoke on old136cb6ff accepted one synthetic
image202, then terminal INVALID_RESPONSE/attempt1/items0. Request IDs
24145b6c-8390-4e73-8337-a0beb6e52771 (acceptance) and
ba031f71-6c8c-4070-ac7d-ad0347c1c574 (terminal), support hash096080ad9e97.
One disposable guest/session/scan was created through normal APIs; logout200
revoked the session. No email/OTP, security bypass or secret extraction.
Provider availability/receipt accuracy remain uncertified. Staging mock does
not prove live provider behavior. Production AI/config and image preprocessing
are unchanged from the deployed Worker in the prior candidate.

Executable AI correction `e7d7db1` preserves the full default/custom extraction
prompt while adding repair feedback on same-model retry and multimodal escalation.
The source bug is independently reproduced: default retry lost task/schema.
It can undermine recovery; its causation of the live failure is unproven.
Regression red4 failed/3 passed; correction and adjacent AI/provider/router
checks5 files/81 PASS. Lint/typecheck/migration smoke/build/diff PASS; full local
suite249 files/5647 PASS (513.76s), unchanged timeouts. Independent review finds no blockers; input governance includes
repair feedback and bounds calls. No AI model/provider/quality/security policy
change. Publish as a separate reviewed fix, hold merge while recovery is pending,
then verify real provider behavior before declaring production release complete.

Next: complete normal review of recovery37334212154, inspect aggregate receipt
and any unsupported provider metadata before further operation. Require V1 catalog
certification, then guarded0039. Merge green AI correction only after the pending
recovery completes or is intentionally replaced; stage the final immutable SHA
through shadow/canary/D1 and deploy production through the normal Environment gates.
Report: [PRODUCTION_AI_REPAIR_20261006.md](scan/PRODUCTION_AI_REPAIR_20261006.md).
PR49 is open for the AI correction; no auto-merge and main remainscd66.
Staging canary1 run37370418398 and hosted AI CI37370993436 are queued with no
runner/deploy attempt. GitHub Status confirms an Actions incident affecting
hosted runner assignment/start times (19:11:58UTC start;20:39:27UTC update).
External wait has no ETA; do not redispatch duplicate runs or weaken gates.
Recovery37334212154 still waits for required reviewer; deployment is incomplete.

Older sections are historical.

---

# Recovery workflow registration checkpoint - 2026-10-05 UTC

Executable recovery `7f59afa`, registration remediation `aea900d`.
PR46 and47 are merged; current main080b78b has green exact-main push CI37330231950.
Full local recheck and hosted recovery CI each pass248 files /5639 tests.

Actual recovery dispatch is blocked before run creation: GitHub Actions workflow
index/web/GET and CLI/REST dispatch return404 for the new dispatch-only recovery
file, despite its presence on default main and valid actionlint schema. No run,
production approval, Worker change or D1 mutation was performed. The provider
registration cause is unresolved; invalid source syntax is not evidenced.

Minimal remediation adds a main-push registration job containing only echo, with
no checkout, production Environment, secret reference or production tool. The
production gate now explicitly requires workflow_dispatch/main/confirmtrue;
recover still depends on that gate and all authorization checks reject push.
Actionlint1.7.12, lint, diff check and13 approval tests PASS; independent review
finds no blockers. Full hosted PR/main CI remains required before dispatch.

Staging0039 certification37331557226 SUCCESS at080b78b: already-present39 ledger,
no migration applied, FK0/quick_checkok/schema gate/T20 constraints/aggregate
checks pass. Runtime readiness is pending. Staging application Deploy is held
until the final main SHA and green CI; production remains old136cb6ff static
fallback, ledger38. Next: merge green registration checkpoint, require green
exact-main CI, verify Actions registration, then reviewed restore-v1 plus normal
independent production Environment approval. Catalog/migration/deploy mutations0.

Earlier checkpoint status is historical.

---

# Production V1 catalog recovery checkpoint - 2026-10-05 UTC

Executable checkpoint `7f59afa` on `codex/production-v1-recovery` starts from
merged guard PR #45 / main `603c4404bebd53fce711b47c9d5cef9b30ce2bfa`.
Exact-main guard CI [37320114700](https://github.com/vn-tak/Tako-san/actions/runs/37320114700)
succeeded. User confirms no real users; user-data retention certification is
excluded. Source restoration uses certified V1, without assigning ambiguous
positions to the live ingredient population or claiming proven corruption.

Independent implementation reviews found no remaining blockers. The recovery
workflow binds the final merged PR head to the complete exact-main tree and CI,
normal independent production Environment approval and the shared production lock.
It first clones the exact old Worker source/runtime/bindings/assets with only
catalog static/0/cutover=false, then imports one atomic generated catalog batch.
Unknown provider metadata stops before mutation. Lost import response records an
unknown outcome requiring inspection; it never blindly retries or rolls back.
Catalog-only archive rollback requires the unchanged generated target and the
same pinned static Worker. Historical migrations and unrelated tables are intact.

Validation: targeted four suites / 56 tests PASS; lint, typecheck, migration
smoke, production build, syntax and diff checks PASS. Actual local workerd D1
restore and rollback PASS with pinned Wrangler 3.114.17: restore hydrates 500
recipes at fingerprint `f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`,
ledger38/FK0, archive6720; rollback restores6720/order0/FK0. A local compound
SELECT parser limit was reproduced and fixed by using VALUES. Full-suite result
first run: 5638 PASS / one unchanged Wrangler timeout; narrow recheck32 PASS.
Full recheck248 files /5639 PASS (522.82s). Hosted final-head CI
37327411648 also248 /5639 PASS, lint/typecheck/migration smoke/build PASS.
PR46 merged at9fbaffa; exact-main push CI is pending before remote execution.

Production still serves the old Worker `136cb6ff3d2921eac237c7b106b37ab5ee12a13f`
on static fallback, ledger38/0038/order0/hydration0. Remote recovery, migration
and new application deployment counts remain0. Next: merge green recovery PR,
require exact-main CI, run protected recovery and retain aggregate evidence;
then guarded0039, staging and production Deploy with immutable release inputs.
Report: [PRODUCTION_V1_CATALOG_RECOVERY.md](recipe-catalog/PRODUCTION_V1_CATALOG_RECOVERY.md).
Earlier sections are historical and their open-PR claims are superseded.

---

# Production release readiness - 2026-10-05 UTC

- [x] Verify GitHub CLI `vn-tak`, merged/reviewed PR #44 and exact-main CI.
- [x] Dispatch and complete protected SELECT-only topology run37316530751; verify
  independent Environment approval and aggregate artifact digest.
- [x] Fence uploads with fresh hosted main/CI and prevent rollback before upload.
- [x] Fence0039 with shared production lock, unchanged ledger, complete V1
  hydration/fingerprint proof before bookmark/apply and fresh main/CI before apply.
- [x] Full local suite244 files/5,583 PASS; targeted5/418 PASS; lint/typecheck/
  migration smoke/build/diff PASS; executable checkpoint81255c1.
- [ ] Complete independently reviewed archived V1 restore and rollback rehearsal.
- [ ] Pin existing Worker to static before any restore; verify exact code/assets.
- [ ] Certify recovered catalog, apply0039, stage/deploy immutable current main
  and verify exact active SHA, traffic and actual served authority.

Production repair/migration/deploy counts remain0. Existing static fallback
serves; failed setup run37304008220 was not rerun. Future C2T reruns require a
fresh review for modified release-check bytes.
Report: [PRODUCTION_RELEASE_GUARDS_20261005.md](recipe-catalog/PRODUCTION_RELEASE_GUARDS_20261005.md).
Historical task status follows.

---

# T21R-C2T-P1 invalid Action pin remediation — 2026-10-05 UTC

- [x] Fetch exact live main `b3fd7baf9c25ae195bdc6f52ed9ca27f34cef455` and create a
  fresh isolated thread-derived branch; no concurrent work absorbed.
- [x] Verify failed run `37304008220` / attempt 1 stopped at capture **Set up job**;
  classify `T21RC2T_CAPTURE_BLOCKED_ACTION_PIN_INVALID`, not diagnostic evidence.
- [x] Prove old pnpm pin HTTP 404; dereference upstream annotated `v4.3.0` tag to
  `b906affcce14559ad1aafd4ab0e942779e9f58b1`; verify other three pins exist and leave them unchanged.
- [x] Replace only the pnpm action ref, preserving version/comment/install semantics.
- [x] Reproduce old 5/5 green blind spot; harden exact-ref assertions, obtain the
  expected red result, add offline old-pin rejection regression, then verify green.
- [x] Narrow suite 3 files / 62 PASS; established C2T+C2 14 / 539 PASS
  (C2T 6/119, unchanged C2 8/420); full Vitest 243 / 5,548 PASS.
- [x] Lint/typecheck/local migration smoke/build/diff checks PASS; one-pin-only
  workflow comparison and zero changes across all 73 C2 bound specifications.
- [x] Record the verified implementation checkpoint and exact evidence/checks in
  the separate report and required three AI checkpoint documents.
- [x] Publish [PR #44](https://github.com/vn-tak/Tako-san/pull/44), confirmed
  draft/open/unmerged with no auto-merge; subscribe to updates and inspect
  initial hosted CI/reviews (CI in progress; no human reviews/unresolved threads).
- [ ] Fresh human independent review by `vn-taphoanhatung` of the final draft PR
  head; old review `5412451575` does not cover the new workflow/test bytes.

**Status:** `T21RC2T_P1_FIXED_READY_FOR_INDEPENDENT_REVIEW`.
PR must remain draft/open/unmerged; no self approval, ready conversion or merge.
All P1 production operation counts 0; failed run never rerun. Corruption NOT
PROVEN; repair needs more evidence; 0039 relevance NONE; 0039/deploy NOT AUTHORIZED;
T21G NOT READY. Next: STOP for fresh independent review; the subscribed update
loop will resume for settled hosted checks or feedback.
Report: [`T21RC2T_P1_ACTION_PIN_REMEDIATION.md`](recipe-catalog/T21RC2T_P1_ACTION_PIN_REMEDIATION.md).

---

# T21R-C2T privacy-safe identity topology implementation — 2026-10-05 UTC

- [x] Exact live-main/checkout/repository hard gate from certified PR #42; verify
  exact-main CI 37261145409 / job 111608452594 / attempt 1 / push / SUCCESS.
- [x] Fresh isolated branch and separate C2T approval/capture/workflow; preserve
  all C2 bytes, exact SELECTs and certified two-capture envelope; new SQL 0.
- [x] Independent 119-spec review closure, including all 73 C2 paths, complete
  source/artifact/import graphs and absent optional configuration introductions.
- [x] Real V1/V2 source verification and derived V2 formula lineage 4,233/4,233
  occurrences and 1,395 distinct IDs; no production lineage claim.
- [x] Candidate/competition, semantic/multiplicity, 65-residual, conservative
  two-sided shape and anonymous per-recipe distributions; no invented conversion.
- [x] Closed aggregate receipt, complementary K5 suppression, private exact
  accounting/recomputation, fixed errors, restrictive raw storage, success-only
  literal artifact and always cleanup; no individual/hash/vector disclosure.
- [x] Required synthetic 500/2,702/6,720/6,766, 65/6/59 and adversarial corpus;
  alias/context separation and exact-witness accounting audit regressions.
- [x] Focused 14 files / 538 PASS (new C2T 6/118, unchanged C2 8/420).
- [x] Full UTC single-worker Vitest 243 files / 5,547 PASS, exit 0, 626.96 seconds;
  lint/typecheck/local SQLite migration smoke/build/syntax/diff PASS.
- [x] Code checkpoint `f191b48`; draft
  [PR #43](https://github.com/vn-tak/Tako-san/pull/43) opened and auto-fix
  subscription enabled. Final documentation-inclusive SHA and exact-head hosted
  CI result are anchored in that PR, not in a self-referential document hash.
- [ ] Independent T21R-C2T-R review by `vn-taphoanhatung` of the final frozen
  PR head after current-head CI success. No implementation self-approval.

Status `T21RC2T_IMPLEMENTED_READY_FOR_INDEPENDENT_REVIEW` is implementation only.
Keep PR DRAFT/unmerged. Production operations 0; corruption NOT PROVEN;
repair REPAIR_NEEDS_MORE_EVIDENCE; 0039 relevance NONE/application NOT AUTHORIZED;
deploy NOT AUTHORIZED; T21G NOT READY. No C2/C4I rerun or Environment approval.
Design/check/failure evidence:
`recipe-catalog/T21RC2T_IDENTITY_TOPOLOGY_DIAGNOSTIC.md`.

---

# T21R-C2F semantic drift / ingredient identity forensic — 2026-10-05 UTC

- [x] Verify run 37202777157 attempt 1, artifact 11304380358 digest, execution and
  reviewed SHAs, five source digests and offline authority-proof reproduction.
- [x] Trace capture → classifier → aggregate → receipt. Prove every count relation,
  the 65 residual and the drift mapping with no unexplained residual.
- [x] Explain the 2,702 target ambiguity (recipe-scoped unresolved identity) with
  bounds and offline controls; pre/post-C2S comparison (26 targets changed).
- [x] ING_ENR origin, authority and bridge audit; production vs V1 and committed V2;
  runtime gate and impact; 0039 relevance NONE.
- [x] Report, evidence matrix and C2T privacy-safe diagnostic design (not dispatched).
- [ ] Independent review of the report. Separately authorize and review C2T before
  any remediation or release-authority decision.

Production operations 0. Repair NOT_AUTHORIZED (REPAIR_NEEDS_MORE_EVIDENCE); 0039 and
deploy NOT AUTHORIZED; T21G_NOT_READY.
Report: `recipe-catalog/T21RC2F_SEMANTIC_DRIFT_IDENTITY_FORENSIC.md`.

---

# T21R-C2S schema boundary — 2026-10-04 UTC

- [x] Verify repository 1385308553 and fetched exact main
  `b9bc66acfe660329103c08be1f5cff90ed175aba`; no rebase or unrelated integration.
- [x] Preserve latest source run 37158525748 schema-stage evidence and UNKNOWN
  production/V1 relation, without production rows/logs/credentials or reruns.
- [x] Prove original-main schema-only failure for exact witness plus unresolved
  or cross-ID competitor; aggregate/digest PASS. Fix classifier candidate publication
  without weakening schema, ambiguity or existing exact-tuple compatibility.
- [x] Actual-validator-only static schema fingerprint, explicit allowlists,
  reference/conditional/contains mapping, deterministic unknown fallback,
  caller/accessor redaction and credential-free real classify-CLI regression.
- [x] All production/target classes; malformed/duplicate/bridge/conflict/taint
  corpus; 500 recipes / 2702 targets with 2702, 3002 and 8106 production rows;
  target-only and 2702-candidate structures.
- [x] Final focused 8 files / 420 PASS; UTC single-worker full 237 files / 5429 PASS;
  lint/typecheck/local migration smoke/build/diff PASS. Initial full-shell timeout
  and test-harness/overbroad-guard failures recorded and recovered without weakening.
- [x] 73-entry closure retained; old reviewed `95b1746819c4690d267985ce55cb0ba673373a95`
  rejects; capture/SQL/C4I/workflow/V1/runtime untouched.
- [x] Code checkpoint `946a7be`; draft PR #41 published and auto-fix subscription
  enabled. Exact docs-inclusive head and fresh CI receipt are anchored in the PR.
- [ ] Independent review of the exact final head after attempt-1 PR CI SUCCESS.
  Any automated branch change requires a new frozen head and new review authority.

Production operations and secret/token changes 0; token read-only proof false/
scope UNKNOWN; repair NOT_AUTHORIZED; 0039/deploy STOPPED; T21G_NOT_READY.
No merge or C2/C4I rerun. Report:
`recipe-catalog/T21RC2S_SCHEMA_BOUNDARY_FORENSIC.md`.

---

# T21R-C2D classification diagnostics — 2026-10-03 UTC

- [x] Fetch and verify certified main `78313ab`; metadata-only inspection of
  run 37135187427, with production/V1 relation UNKNOWN after classification failure.
- [x] Six sanitized stage categories; separate schema/aggregate/digest validation;
  reconstruct only fixed code/stage in the existing failure receipt, no failure upload.
- [x] Reproduce/fix uncaptured-parent summary contradiction and aggregate validator
  gaps (recipe-local references, status, drift/conflict indexes); no schema relaxation.
- [x] Closed enum/shape/numeric audit and offline certified authority 500/2702;
  divergence/extreme/malformed/duplicate/key/privacy regressions.
- [x] Focused 6 files / 375 PASS; old C2 reviewed binding rejects, C4I unchanged.
- [x] Final lint/typecheck/migration smoke/build/diff PASS; UTC single-worker
  full Vitest 235 files / 5384 PASS.
- [ ] Fresh exact-head attempt-1 hosted PR CI; record head/run/job/count receipt.
- [ ] Independent security review; no merge, C2/C4I rerun or repair authorization.

Report: `recipe-catalog/T21RC2D_CLASSIFICATION_DIAGNOSTICS.md`.

---

# T21R-C4L Wrangler parsed-stdout remediation — 2026-10-03 UTC

- [x] Verify main `0e6342f`; confirm 3.114.17 logger/whoami/list/execute source.
- [x] C4I and C2 parsed-stdout commands use `WRANGLER_LOG='log'`; stdio piped,
  no command/SQL/validation/dependency/workflow change.
- [x] Regressions: C4I whoami + d1 list, C2 whoami + d1 list + d1 execute,
  raw-output leakage; all fail against old `error` code.
- [x] Old C4I `a0c1cfd` / C2 `93c4055` bindings reject the remediated head.
- [x] Correct historical interpretation of runs 37124563415, 37128183771,
  37084988593; account secret correctness UNVERIFIED_PENDING_FIXED_C4I.
- [ ] Independent review of exact head covering both C4I and C2 surfaces.
- [ ] Protected merge, exact-main CI, then separately authorized fresh C4I.

Report: `recipe-catalog/T21RC4L_WRANGLER_PARSED_STDOUT_REMEDIATION.md`.

---

# T21R-C4I separate Cloudflare identity diagnostic — 2026-10-03 JST

- [x] Verify exact certified main `7cd58968c3b4c0f7936c75d74b6965d229b57c69` and repository
  ID 1385308553; create isolated C4I worktree, preserve unrelated original change.
- [x] Confirm failed run 37084988593 gate/approval/capture/skip/cleanup metadata;
  preserve zero-SQL proof separately from possible historical metadata calls.
- [x] Add separate manual/main/attempt-1 production workflow with certified pins,
  contents-read only and shared production concurrency lock; no artifact or SQL.
- [x] Implement A–H safe categories, early stops, strict config, fixed whoami/list
  argv, stdout/stderr capture, null-sink debug logging and allowlisted receipt.
- [x] Preserve every existing C2 byte / all 73 bound entries; real-Git additions
  pass and an existing workflow-byte mutation rejects. No closure weakening.
- [x] Focused 308/308 (61 C4I + 247 C2); lint/types/local migrations/build/syntax/diff
  PASS. UTC full 232 files / 5,271 tests / zero skips / exit 0 PASS (494.41s).
- [x] Record initial full 5,269 PASS / 2 FAIL under inherited PDT and unchanged
  32/32 timezone recheck in UTC; no Week/auth/assertion change. Record setup failures.
- [x] Publish normal code checkpoint `81646b0e6389fe61ea04db5892dec8ee597693f9`, exact tested
  tree, preserving local source `dfad66da7706bf315e4b0e27b0e471b9ce71cb83`. Completion docs
  follow; final docs-inclusive SHA/tree and clean local/remote equality external.
- [ ] Independent review before any PR or protected integration.
- [ ] Separately authorized metadata-only attempt with normal production approval;
  no diagnostic run, secret/token edit, C2 rerun or SQL is authorized here.

`T21RC4I_IMPLEMENTATION_READY_FOR_REVIEW`; identity diagnostic NOT_RUN, token
scope UNKNOWN / read-only-unproven. C2 reviewed SHA 93c4055 remains eligible only
with future-main byte equivalence and all existing gates. No PR/merge/dispatch/
approval/Cloudflare call/production SQL/mutation/0039/deploy by this implementation.
T21G_NOT_READY, repair NOT_AUTHORIZED, 0039/deploy STOPPED, delivery UNCONFIGURED.
Report: `recipe-catalog/T21RC4I_CLOUDFLARE_IDENTITY_DIAGNOSTIC.md`.

---

# T21R-C3 dispatch readiness and dependency hardening — 2026-10-03 JST

- [x] Resolve `vn-tak/Tako-san` to stable ID `1385308553`; exact base main
  `0d4fe89b7ccc72e013aafe53665059d0e62bd3b4`, PR36 merged, reviewed head
  `63739c56`, exact-main push CI `37008867187` SUCCESS; isolated C3 branch.
- [x] Verify official upstream version refs, peeled commits and releases;
  pin four Action dependencies / six uses; preserve workflow semantics and CI.
- [x] Reject mutable/tag/branch/short/uppercase refs, appended/job-level actions;
  prove a pin-only delta still fails the existing 73-entry review binding.
- [x] Bind transferred current repository name in gate/receipt; reject former
  authorization names while preserving certified V1 historical target metadata.
- [x] Audit production Environment metadata without mutation: expected reviewer
  present; self-review prevention false, bypass available true, branch policy null.
- [x] Record SELECT-only path separately from UNKNOWN Cloudflare credential
  scope; no Cloudflare introspection, credential provisioning or production read.
- [x] Document future distinct feature/main SHA pair, exact-main CI, attempt 1,
  normal approval, privacy, 0038/0039 boundaries and explicit abort conditions.
- [x] Focused 556/556; guarded AI/local-D1 128/128; full single-worker 230 files /
  5,210 tests / zero skips PASS. Lint/types/local migrations/build/syntax/diff PASS.
  One-line synthetic AI response fixes proven test egress; no assertion weakening.
- [x] Recheck the exact published code checkpoint: C2 4 files / 247 PASS,
  11.39 seconds using existing Vitest after the old scratch pnpm path was absent.
  No dependency, assertion, timeout or test-selection change.
- [x] Resolve publication access: earlier CLI credential unavailable; first workflow
  blob write via `takovn2` returned 403 `Resource not accessible by integration`.
  Earlier connections did not list a `vn-tak` installation. Current `vn-tak`
  profile/owner `335007142`, installation `167341024` and actual writes verified.
  Publish through this connection using normal GitData feature-ref creation,
  preserve original local history and verify exact tree/head equality. Remote
  code checkpoint `e49c60a176cec80593e8b8644d058341cfeca720` has the tested tree.
- [x] Create normal feature ref at that code checkpoint, without force or PR.
- [x] Obtain explicit approval for all five documentation files and destination
  public `vn-tak/Tako-san`: user confirmation on 2026-10-03 JST includes completion
  status updates. Earlier automatic-review metadata rejections are recorded in
  the report; no alternate transport was used to bypass them.
- [x] Publish the approved documentation checkpoint after the tested code SHA
  through a normal feature-ref update. Preserve original local history and
  executable bytes; report final local/remote SHA and tree equality externally.
- [ ] Independently review the final normally published C3 head before opening
  any PR. Then protected merge and exact post-merge current-main push CI.
- [ ] Separately authorized operator capture/risk decision and new normal
  production Environment approval. No production action is authorized by C3.

`T21RC3_IMPLEMENTATION_READY_FOR_REVIEW`; code, local checks and approved
documentation publication complete. Token scope remains an unresolved operator
item. C3 hosted CI has not run.
No PR/merge, production dispatch/approval/read/write/SQL/restore/0039/deploy.
T21G_NOT_READY, repair NOT_AUTHORIZED, 0039/deploy STOPPED, row delivery
UNCONFIGURED. Scoped evidence and failure history:
`recipe-catalog/T21RC3_PRODUCTION_DISPATCH_READINESS.md`.

---

# T21R-C2 PR #36 hosted CI-history correction — 2026-10-02 UTC

- [x] Verify PR36 OPEN, head `3e1bb60b`, failed run `37002486858` / job
  `110823126447`; actual checkout `fetch-depth: 1`, fetched synthetic merge
  `db7728d0203089e8f35897f2fff2f2e35437e026`, failure `T21RC2_LEDGER_CHANGED` in setup.
- [x] Resolve certified-main 0038 blob and exact 39 repository migrations;
  existing helper returns the exact first 38 production names. No ledger drift.
- [x] Reproduce missing historical-object error in an offline throwaway shallow
  clone; full-history helper succeeds. No tests fetch Git or substitute authority.
- [x] CI checkout full history and static regression; other CI/runtime/production
  guards/versions and 73-entry review-bound closure unchanged.
- [x] C2 229 and focused 538 PASS; lint/types/local migration smoke/build PASS.
  Full single-worker 230 files / 5,192 PASS (701.72 seconds), syntax/diff PASS.
  Exact command list and limitations are in the scoped report.

**Publication/review handoff:** One narrow normal-push commit after `3e1bb60b`,
not a history rewrite. Confirm new-head hosted PR CI via the actual provider
run/job; if it fails, stop and report INCOMPLETE, do not expand fixes. Prior review
is invalidated by the bound CI change; independent delta review/renewed PR
approval required. No merge or production/Cloudflare/approval/apply/deploy;
`T21G_NOT_READY`, repair NOT_AUTHORIZED, 0039/deploy STOPPED, delivery UNCONFIGURED.
Report: `recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# T21R-C2 review-binding remediation — 2026-10-02 UTC

- [x] Verify reviewed local/remote head `8d8028f3`, base main `51881845`, clean
  same branch `codex/t21rc2-protected-production-row-read`; no history rewrite.
- [x] Trace direct imports, Vite SSR evaluation, canonical sources/configs and
  ledger reads; bind 73 explicit path entries without shrinking the proposed 14.
- [x] Gate requires reviewed ancestry plus byte-equivalent closure and distinct
  SHAs; capture independent authorization and final recheck enforce the same guard.
- [x] Real-Git merge/docs-only pass; all bound changes fail. A–L plus missing
  required file, auto-config addition, migration addition and execution-point tests PASS.
- [x] Success receipt explicitly distinguishes fixed SELECT path from unknown
  token permissions; input cannot override fields. Failure/privacy unchanged.
- [x] Focused 537/537, C2 228/228, full 230 files / 5,191 PASS; lint/typecheck/
  local migration smoke/build/syntax/diff PASS. Initial new-test helper errors fixed,
  no timeout/assertion reduced. Scoped agent review found no material delta issue.
- [ ] Independently review the one normally published remediation commit after
  `8d8028f3`; no self-approval, PR opening, merge or production preparation.

`T21RC2_REMEDIATION_READY_FOR_REVIEW`; normal push authorized after final checks,
not independent review approval. No production/Cloudflare/approval/apply/deploy
operations or workflow/classifier/T19/T20 changes. Delivery `UNCONFIGURED`,
`T21G_NOT_READY`; repair/0039/deploy STOPPED. Full bound list/check evidence:
`recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# T21R-C2 protected production row-read implementation — 2026-10-02 UTC

- [x] Start `codex/t21rc2-protected-production-row-read` exactly at certified
  `518818458a354c5e180da52ae9bb73c9d3c1af78`; repository `1385308553` / `vn-tako4/Tako-san`,
  exact-main CI `36972970904` SUCCESS. Exclude and preserve old local `9542e112`.
- [x] Implement dispatch-only workflow, minimal permissions, production
  Environment, hardened full-SHA/current-main/ancestor/CI gate and fresh main checks.
- [x] Normal reviewer `vn-taphoanhatung`; reject skipped/bypass/wrong/self
  approval and reruns. Use real GitHub API record shape, not invented approval IDs.
- [x] Pin account/database/config; fixed SELECT executable guard; exact reviewed
  38-name ledger, four counts, two certified rosters and two-read non-atomic digest.
- [x] Reuse original classifier/schema; private runner-temp capture/manifest/logs,
  restrictive modes, safe errors/failure receipt and exact success-only aggregate upload.
- [x] C2 146/146, combined focused 455/455 and full 230 files / 5,109 PASS;
  lint/typecheck/local migration smoke/build/syntax/diff PASS. Failure resolutions
  retain assertions/timeouts; independent agent review found no material defect.
- [x] Normally publish executable checkpoint `ad7b3012`; provider/local SHA
  equality verified, main unchanged. Completion docs follow; no force push or PR.
- [ ] Independent human implementation/query/privacy/approval/stability review.
- [ ] Any separately authorized production read, normal Environment approval,
  live evidence receipt or secure row delivery. None authorized/executed here.

`T21RC2_IMPLEMENTATION_READY_FOR_REVIEW`; no production/Cloudflare operations,
no T19/T20/0039/runtime/dependency edits, no merge. `ROW_LEVEL_DELIVERY=UNCONFIGURED`,
`T21G_NOT_READY`, repair/0039/deploy STOPPED. Exact checks/failures/options:
`recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# T21R-C P1-only remediation — 2026-10-02 UTC

- [x] Verify published reviewed head `32ab51d`, unchanged main and clean tracked
  tree; preserve `.context/`. Repository `1385308553` / `vn-tako4/Tako-san`.
- [x] Make exact tuple/membership satisfaction gates explicit; preserve balanced,
  deficient and mixed duplicate semantics with A1–A3 tests.
- [x] Prevent bridge rewrite of direct V1 IDs; B1–B3 tests preserve non-V1 bridges.
- [x] T21R-C 57/57 and focused 73/73 PASS; lint/typecheck/local migration smoke/
  build/syntax/formatting/diff PASS; old assertions retained.
- [x] Required full single-worker suite PASS: 226 files / 4,963 tests; one
  appended remediation checkpoint and normal push authorized for delta review.
- [ ] Independent delta review; no self-approval, PR, merge or production preparation.

Schema/taxonomy/authority/runtime/workflows/dependencies unchanged; production
operations 0. `T21G_NOT_READY`; 0039/repair/deploy STOPPED.

---

# T21R-C protected row-level reconciliation evidence — 2026-10-02 UTC

- [x] Verify repository `1385308553`, main/source `a828b6354e29d89268a3d11c874158eb5ecb997c`, run
  `36943692146/1`, exact-main CI `36933387793`, four sanitized artifacts and hashes.
- [x] Accept read-only aggregates for review; separately record admin-bypass
  exception and actual approval history `skipped` by `vn-tako4`.
- [x] Implement deterministic offline occurrence/multiset classification,
  exact accounting, explicit unknown/review populations, per-recipe summaries,
  drift/conflict evidence, private physical handles and no fuzzy/position authority.
- [x] Close false-absence cases for mixed duplicates, incomplete captures and
  alternate-ID conflicts; 51 focused T21R-C tests plus 16 regressions PASS.
- [x] Closed JSON schema, real-source offline CLIs, syntax/formatting/Ajv,
  lint/typecheck/local migration smoke/build/diff PASS; no dependencies upgraded.
- [x] Design fixed SELECTs, independent counts, two-read non-atomic stability,
  0038 ledger/main/normal-review guards, private artifact audience and T19/T20 risks.
- [x] Final unchanged one-worker full suite PASS: 226 files / 4,957 tests.
  Verified implementation checkpoint `ec24101`; two-worker timeout retained
  in the report. No assertion or timeout was weakened.
- [ ] Independent human review; governance/privacy/operator decision before any
  additional read. No dispatch, push, PR, merge or production operation authorized.

`T21RC_OFFLINE_DESIGN_READY`; `T21G_NOT_READY`; V1 remains authority.
0039, repair and production deploy STOPPED. Local only; not pushed or PR-opened.
Report: `recipe-catalog/T21RC_ROW_LEVEL_RECONCILIATION_DESIGN.md`.

---

# Production V2 existing_canonical_id review fail-closed — 2026-09-30

- [x] existing_canonical_id + any review (object or `{}`) has no bridge authority.
- [x] existing_canonical_id + review=null + distinct sourceId still bridges.
- [x] Hostile tests for non-null review, empty review, same-id, null sourceId.
- [ ] Hosted CI on new head; independent approval. Do not merge or dispatch production diagnostics.

---

# Production V2 lineage reviewed-reconciliation contract — 2026-09-30

- [x] Strict reviewed reconciliation: basis + evidenceReference, ING_ENR_ only.
- [x] existing_canonical_id requires non-empty distinct sourceId; null sourceId does not bridge.
- [x] Recipe-id set match is required for authoritative subset.
- [x] Hostile tests: empty/wrong review, wrong ID type, valid reviewed bridge, null sourceId, valid existing, provisional, duplicate_alias, ambiguous/invalid, recipe-id drift, privacy.
- [ ] Hosted CI on new head; independent approval. Do not merge or dispatch production diagnostics.

---

# Production V2 catalog lineage diagnostic remediation — 2026-09-30

- [x] Remove causal overclaim from missing-line metadata; use classified vs causally explained.
- [x] Stop ID-omitting content matches from granting authoritative lineage; provisional reconciliation has no authority.
- [x] Separate relative canonical order from runtime position; detect position holes; `runtimePositionAuthority=false`.
- [x] Add hostile unit tests for the three boundaries and keep artifact privacy.
- [ ] Hosted CI on the remediating head; independent review. Do not merge with unresolved P1. Do not dispatch production diagnostics from this PR.

---

# Production V2 catalog lineage diagnostic — 2026-09-30

- [x] Verify main `252096cccf602d07d6e33067024c5df2d6ba8a3e` and protected diagnostic `36653466481` (V1 lineage rejected; 6720/0/0 hydrated).
- [x] Add runner-local V2 semantic comparison to the existing read-only production workflow; no extra D1 query.
- [x] Cover exact match, 6720-style subset/missing, production-only, drift, duplicates, ambiguity, normalization, runtime quantity, recipe-id drift, malformed input, CLI privacy.
- [ ] Obtain hosted PR CI and independent review; protected merge; new exact-main CI.
- [ ] Dispatch Environment-approved read-only diagnostics on the new main SHA and inspect the V2 lineage artifact. Keep 0039 and repair STOPPED.

---

# Production catalog lineage diagnostic — 2026-09-30

- [x] Derive historical 0038 baseline locally: 500 recipes, 2,702 ingredient lines and 2,702 explicit positions; compare against protected production aggregate 6,720/0 without assuming why they differ.
- [x] Add runner-local, sanitized V1 ingredient-line comparison to the existing read-only production workflow; leave its remote SELECTs, identity gate and Environment approval unchanged.
- [x] Earlier head `fe1d2e5` passed local full check and hosted CI `36630071407` (221 files / 4,823 tests). Earlier Wrangler-startup timeout attempts and interrupted-worker attempt were not green.
- [x] Open PR #28 from implementation `cd25370`; merge PR #27 into main `e7c74a0` and preserve its STOP packet in this branch.
- [x] Add an actual CLI regression test: it failed before fixing the missing `writeFileSync` import, then focused tests passed 15/15.
- [x] Updated local `WRANGLER_SEND_METRICS=false pnpm check` PASS (typecheck, lint, full Vitest, migration smoke, build); independent read-only diff review found no additional issue.
- [ ] Push resolved merge and obtain new hosted CI and GitHub review for PR #28; only then merge it, obtain new exact-main CI and production Environment approval for a read-only run.
- [ ] Use that receipt to identify V1 exact matches and unresolved rows; prove any V2 lineage and all required positions separately before designing a production repair. Migration 0039 remains STOPPED.

---

# Production ingredient-order recovery STOP — 2026-09-29

- [x] PR #26 merged as `d0c6702`; exact-main CI `36576510231` SUCCESS; protected read-only run `36577380500` SUCCESS with sanitized diagnostic `BLOCKED`.
- [x] Confirmed 6,720 ingredient rows, zero position rows, 500 affected recipes and 0/500 hydrated; production ledger remains 38/0038.
- [x] Prepared documentation-only STOP packet and passed local `WRANGLER_SEND_METRICS=false pnpm check` (types, lint, tests, migration smoke, build).
- [ ] Prove exact live ingredient identity and reviewed position source per row through a separate read-only gate; determine V1/enrichment/mixed state and investigate regression provenance.
- [ ] Review a separate preflighted, recoverable catalog repair only after all positions are evidenced; then recertify authority. Migration 0039 and rollout remain STOPPED. See `recipe-catalog/PRODUCTION_INGREDIENT_ORDER_RECOVERY_PACKET.md`.

---

# Production D1 order-coverage validation — 2026-09-29

- [x] Final `WRANGLER_SEND_METRICS=false pnpm check` PASS: typecheck, lint, 220 files / 4,816 tests, migration smoke and build. Initial unfiltered run had one local Wrangler startup timeout; focused rerun and full rerun passed.
- [ ] Push reviewable follow-up PR, obtain hosted CI and independent review, then protected merge/exact-main CI before another Environment-approved read-only diagnostic.
- [ ] Keep migration 0039 and production rollout blocked until order coverage and fallback cause are proven and recovery is reviewed.

---

# Production D1 order-coverage follow-up — 2026-09-29

- [x] PR #25 merged as `baf9a069f89f9544407c827448671ecea4c56b5a`; exact-main CI `36571635467` PASS. GitHub API shows no independent review record.
- [x] Environment-approved read-only diagnostic `36572487026` PASS: ledger 38/38 through 0038, missing only 0039; 500 physical recipes, 0 hydrated, 500 `missing_ingredient_position` failures. No production mutation.
- [x] Add count-only order-coverage query to the diagnostic and validate a sanitized aggregate; focused 3-file/71-test suite PASS.
- [ ] Complete full local gates, hosted PR CI and independent review before merging the follow-up. A new main SHA needs new exact-main CI and production Environment approval for another read-only run.
- [ ] Investigate order coverage from the new receipt; prepare a reviewed, recovery-safe catalog repair only after root cause proof. Treat 0039 as a separate migration blocker. No production rollout while fallback persists.

---

# Production D1 identity gate verification — 2026-09-29

- [x] Account-identity repair: focused 6/6 and full local `pnpm check` 220 files / 4,814 tests, lint, typecheck, migration smoke and build PASS; diff check PASS.
- [ ] Push PR #25 updated head, await hosted CI and independent review before protected merge.
- [ ] After merge/exact-main CI, dispatch only the read-only diagnostic via production Environment approval. Migration and deploy remain stopped.

---

# Production D1 diagnostic continuation — 2026-09-29

- [x] Recheck PR #25 at `d2e481e`: hosted CI `36567679646` PASS; no review and no merge.
- [x] Fresh public readiness: production still degraded with `CATALOG_DIAGNOSTICS` fallback; staging still D1/500 with no fallback.
- [x] Match Cloudflare `whoami` account to configured account before the new workflow's first D1 read; focused tests 6/6 PASS.
- [ ] Run full local gates and hosted CI on the updated PR head; obtain independent GitHub review before protected merge.
- [ ] After merge, exact-main CI and production Environment approval precede read-only diagnosis. Migration and deployment stay stopped at the independent ledger/fallback blockers.

---

# Production D1 diagnostic PR checkpoint — 2026-09-29

- [x] PR #25 opened from implementation commit `ad30b7efeac7a4db71665a318fb4869396e4ce98`; hosted CI run `36566901147` PASS on that head.
- [x] Final local `pnpm check` PASS on implementation head: 220 files / 4,813 tests, migration smoke, lint, typecheck, build.
- [ ] Verify hosted CI on the final documentation checkpoint head and obtain independent review before protected merge.
- [ ] After merge, require exact-main CI and production Environment approval for read-only diagnosis. Keep 0039 migration and production rollout stopped while ledger and D1 fallback blockers remain.

---

# Unified production release train — 2026-09-29

- [x] Fresh production Environment read-only run `36563767379`: Worker/deployment/DB identity verified; ledger lacks `0039_meal_composition_v2.sql`; certification stops before recipe rows.
- [x] Create isolated checkout and read-only diagnostic workflow plus sanitized failure-code receipt; correct migration post-apply runtime proof to use guarded SELECTs.
- [x] Prepare `docs/ai/recipe-catalog/PRODUCTION_0039_MIGRATION_PACKET.md` with exact plan, Time Travel recovery and compatibility/rollback boundaries; no migration dispatched.
- [x] Local gates: lint, typecheck, 305 focused tests, migration smoke, build, final full 220-file/4,812-test suite and diff check PASS. Initial sparse-fixture/typecheck failures and a parallel Wrangler timeout cleared after expanding checkout and rerunning.
- [ ] Review the workflow and packet independently; obtain hosted PR CI and normal protected merge. Any new main SHA invalidates old exact-SHA certification.
- [ ] Dispatch the diagnostic only after merge/exact-main CI and production Environment approval; determine hydration code counts and repair the independent D1 fallback.
- [ ] Recheck the full production ledger and exact Wrangler plan; satisfy every packet precondition before considering 0039 migration. Keep production rollout stopped while fallback or migration mismatch remains.

---

# Scan/OCR continuation board — 2026-09-29

- [x] PR #22 independent exact-head review and normal merge: head `439451afeb81aee732c3e7d13acaf0a194b1e70e`, main `94056d29ed00a1000e65eb8e1348384638bc02af`.
- [x] Exact-main CI `36476834182` / `109112533990`: lint, typecheck, 216 files / 4,804 tests, migration smoke, build PASS.
- [x] Official staging deploy `36477693577`: served exact merge SHA; DB/Queue ready, AI mock, recipe canary 1%, T20 true. Production job skipped.
- [x] Staging quota API: five scans reached ready and quota 5/5; sixth returned 429 `SCAN_QUOTA_EXCEEDED`; same-key replay, mismatched bytes/MIME 409, and guest tenancy checked. [ ] Direct D1 ledger and safe staging fault injection remain unverified.
- [x] Synthetic fixture generator, source-first manifest, 16 preprocessing variants, scorer and tests. Local Apple Vision baseline 16/16 variants at 100% names, quantity/unit, prices and totals; 194-512 ms. [ ] Real Qwen non-production certification blocked by configuration; do not infer provider metrics from Apple Vision.
- [x] Follow-up local focused tests 28/28 and full `pnpm check` PASS; canonical alias and trusted CORS request ID regressions added. [ ] Obtain follow-up PR exact-head hosted CI and independent review before merging.
- [ ] Original four QA images and independent `qa/ocr/expected.json` remain unavailable: `LIVE_OCR_CERTIFICATION_BLOCKED_DATASET_UNAVAILABLE`. Paths/schema: `qa/ocr/README.md`. Production: `NOT_READY_FOR_PRODUCTION`; do not deploy.

---

# Historical task board — Scan/OCR/AI quota remediation (2026-09-28)

- [x] Reproduce guest five-scan quota and frontend error masking; implement fenced async consume/release, idempotency, queue retry/reconciliation, tenant isolation, support IDs, server quota snapshot, Vietnamese canonical matching, and private OCR harness.
- [x] Review PR #22; fix replay after queue-intent persistence fails before a job exists. Verify replay gives `SCAN_FAILED`/503, quota stays released, and no second message is sent.
- [x] Final local `pnpm check`: 216 files / 4,804 tests, typecheck, lint, migration smoke, build. Initial unrelated timeout passed focused rerun and full rerun.
- [x] Read-only staging health/ready 200 at main SHA `12348efd...`, DB and Queue ok, AI mock. Record that main-only release gating prevents deploying PR #22 to staging.
- [x] Implementation head `45b6115` passed hosted CI run `36437178487`; final PR head CI must stay green.
- [ ] Obtain independent review and operator-led staging certification after a valid main release. Do not merge or deploy production in this task.
- [ ] Operator supplies four original PII-safe QA images and independent `qa/ocr/expected.json`; run private live OCR and preprocessing certification. Until then: `LIVE_OCR_CERTIFICATION_BLOCKED_DATASET_UNAVAILABLE`.

---

# Task board — T19-R0 staging D1 runtime readiness certifier (2026-09-27)

**Status: `T19_STAGING_D1_RUNTIME_READINESS_FIX_READY_FOR_REVIEW`.** Remote D1 mutation: NO.

- [x] Branch from exact main `e35df74b`.
- [x] Read-only certifier reusing `assessD1Readiness`.
- [x] Staging-only `workflow_dispatch` workflow (no deploy / migrations apply).
- [x] Tests A–O / focused 31/31; `pnpm check` PASS.
- [ ] Independent review + merge (not by an agent).
- [ ] After merge + exact-main CI: operator dispatch Staging D1 Runtime Readiness.
- [ ] Only if receipt status is `STAGING_D1_RUNTIME_READINESS_CERTIFIED` may T19 advance to shadow.

---

# Task board — T20 live hard-time repair (2026-09-27)

- [x] PR #17 merged at `9d64178`; exact-main CI `36306274814` SUCCESS and staging Deploy `36306554840` SUCCESS with T20/planner true, static/0; production SKIPPED.
- [x] Live User A/B registered; Manual, UI, Assisted, Auto, ownership, revision, shopping and static 71-recipe API checks passed on isolated A plan.
- [x] Reproduce B's hard-time plan HTTP 500 at caps 10 and 20; verify no B plan persisted; isolate strict T05 unplanned-slot projection ZodError locally.
- [x] Patch explicit T05 projection and T20 slot-scoped time policies; focused integration 4/4, lint, typecheck, migration smoke and staging-style build PASS.
- [x] Canonical-clone full `pnpm check` PASS; reviewed diff and opened PR #18 on exact main `9d64178`.
- [ ] Hosted exact-head CI on final documentation checkpoint; review/merge PR #18.
- [ ] Merge after review, require exact-main CI, deploy only staging with T20=true/static/0, then repeat LIVE hard-time Manual/Assisted/Auto/save/swap rejection and unchanged-state checks.
- [ ] Obtain approved read-only staging D1 PRAGMA/ledger/catalog health and Worker smoke-window logs; do not certify without them.
- [ ] Clean isolated test records only when safe. No production/T19/0040 mutation.

---

# Task board — T20 live staging planner prerequisite PR #17 (2026-09-27)

- [x] Deploy run `36305024017` succeeded on exact main `b44e935`, T20=true/static/0, production skipped; live health matched.
- [x] Create registered staging test User A and User B; retain opaque IDs and private mode-0600 sessions.
- [x] Reproduce live 401 for unauthenticated picker and 404 `MEAL_PLANNER_DISABLED` for authenticated picker.
- [x] Obtain operator authorization for staging-only parent planner flags.
- [x] Implement staging Worker/UI planner flags and fail-closed T20 release prerequisite on PR #17; local focused/lint/typecheck/build/migration gates pass.
- [ ] Hosted exact-head CI and independent review/merge PR #17.
- [ ] Exact-main CI; explicit staging-only Deploy with T20=true/static/0 and production=false.
- [ ] Full live UI/API, Manual, hard restriction, simple food, swap, Assisted, Auto, role, concurrency, ownership, shopping, D1 health and Worker error certification.
- [ ] Clean isolated test records if safe; preserve production/T19/0040 boundary.

---

# Task board — T20 staging account fix PR #16 (2026-09-27)

- [x] Push implementation branch and open PR #16 against exact main `dff7446855964d9fc60008c370ef656371652a13`.
- [x] Fix staging test Turnstile pairing; require token and explicit Siteverify success; keep production verification unchanged.
- [x] Remove automatic Deploy trigger so a merge cannot turn currently enabled staging T20 off; retain manual exact-main release gates.
- [x] Hosted PR CI `36299373601` SUCCESS on implementation `ef5ebd8`: 208 files / 4,725 tests, lint, typecheck, migration smoke, build.
- [ ] Verify CI on the final documentation checkpoint head.
- [ ] Independent review and merge PR #16; then exact-main CI and explicit staging dispatch with T20=true/static/0.
- [ ] Create two registered staging test users and perform full LIVE T20 certification. No accounts or plans created yet.

---

# Task board — T20 staging account fix (2026-09-27)

- [x] Confirm canonical main `dff7446855964d9fc60008c370ef656371652a13`, live staging SHA, and registration 403 `TURNSTILE_FAILED`.
- [x] Verify official test pair with Siteverify; inspect staging site key and verifier.
- [x] Commit exact staging test-key pairing with fail-closed token/provider behavior (`027c628`); add unit and registration/OTP coverage.
- [x] Canonical clone `pnpm check` PASS: 208 files / 4,724 tests, lint, typecheck, migration smoke, build.
- [x] Inspect deploy gate: requires reviewed main SHA and exact-head hosted CI; automatic main push staging deploy defaults T20 to false.
- [ ] Review/publish the branch without pushing main directly or turning T20 off.
- [ ] Resolve safe staging-only release sequence preserving T20=true; then create User A/B and execute full LIVE T20 certification.

---

# Task board — T20-R1 staging release observability (2026-09-27)

- [x] Re-fetch main `0b2e0a17578bdc744427944b90db5b76bdbfe33c`; branch
  `feat/t20-staging-release-observability`.
- [x] Confirm root cause: no staging `previousRecipeAuthority`; wait helper
  cannot classify previous-Worker evidence (run `36285175574`).
- [x] Staging pre-deploy capture + proof; three-class bounded convergence;
  strict evidence fetch; production preflight unchanged.
- [x] Tests A–L, workflow order contract, real-Git CLI, mutation checks.
- [ ] Independent review + merge (not by an agent).
- [ ] After merge + exact-main CI: flag-OFF staging Deploy re-prove.
- [ ] Only then: separate T20=true staging rollout.

---

# Task board — T20 staging rollout preflight (2026-09-27)

- [x] Re-fetch main `0b2e0a17578bdc744427944b90db5b76bdbfe33c`; exact-main CI
  `36284857635` SUCCESS.
- [x] Confirm 0039 authority run `36287079403` / artifact `10919819859` /
  `STAGING_0039_CERTIFIED` (recipes 500, T20 schema PASS, drift none).
- [x] Confirm Worker+UI T20 flags OFF and paired in Deploy.
- [x] T20 runtime/code audit + focused 120 tests + full Vitest 208/4654,
  lint, typecheck, migration smoke, build PASS.
- [x] Known Deploy observability on this SHA still present (`36285175574`).
- [ ] Do **not** operator-dispatch T20 staging enablement until recipe-authority
  commit identity matches `0b2e0a17…`.
- [ ] Production T20: not authorized.

---

# Task board — Staging D1 0033→0038 historical catch-up

## Catch-up PR (2026-09-26)

- [x] Re-fetch `takovn1/Tako-san` (id `1385308553`); confirm `main` `8147dde`,
  exact-main CI `36274587084` SUCCESS, no existing catch-up branch/PR.
- [x] Owner-transfer audit of active `.github/`, `scripts/`, Wrangler configs:
  operational paths already use `GITHUB_REPOSITORY`; catch-up rejects stale
  `tako-vn2` / wrong repository id.
- [x] Prefix-isolated one-step catch-up checker + workflow. 0039 not applied.
  Existing 0039 workflow unchanged.
- [x] Local replay 0033–0038 certified (59/71/71/101/500/500).
- [x] Implementation commit `718abef` pushed.
- [x] Review remediation: full pre-state checkpoint certification before
  every mutation, apply-gate, required repository id, precise bookmark
  contract (`f14fcb4`, `50e973c`; Vitest 208 / 4,654 PASS).
- [ ] Independent PR review + merge.
- [ ] After merge, operator-authorized RUN A–E (0034…0038), one per workflow run.
- [ ] Only after `STAGING_0038_CERTIFIED` and recipes=500: existing 0039 workflow.

---

# Task board — Recipe Content Refresh V2 / T20 release gate

## PR #11 remediation — current gate (2026-09-27)

- [x] Rebuild 500-recipe canonical research source from the original ZIP with
  explicit provisional ingredient identities, source verification state and
  per-recipe runtime exclusion reasons.
- [x] Separate provisional runtime fingerprint from null final release
  fingerprint; derive four typed release blockers and a fail-closed release
  assertion/CLI. Source validation remains independent.
- [x] Local final checks passed and implementation checkpoint `1f77902` is
  committed; source check passes, release check fails with four typed blockers,
  import check and full `pnpm check` pass.
- [x] Push PR #11 at `dea13cd`, update its description and verify hosted CI
  `36268138066` SUCCESS on that exact head (204 files / 4,597 tests).
- [ ] Verify hosted CI on the final documentation receipt head; keep PR open
  for independent review.
- [ ] Hoplite reconciliation of required ingredient loss, reviewed ingredient
  authority, source content and nutrition evidence before final release
  projection, fingerprint, or generated 0040.

## Historical T20 board (unchanged)

**Latest (2026-09-26):** PR #9 merged at `cb22cfb`; exact-main CI green.
Local Cloudflare login and read-only staging D1 name/ID match are now verified;
staging 0039 still awaits the reviewed workflow and its remote gates. The
section below is the live board; older entries are history.

## T20 staging identity and 0039 workflow — live gate, 2026-09-26 UTC

- [x] Main `cb22cfb` exact-head CI `36240577660` validate SUCCESS (202 files /
  4,574 tests, lint, typecheck, migration smoke, build). Automatic deploy
  `36240842196` release/staging SUCCESS, production SKIPPED; flag-OFF/static
  staging deploy is not T20 certification.
- [x] `git fetch --all --prune`, `git diff --check`, `pnpm check:migrations`
  PASS. Staging migration tooling contract suites: 3 files / 63 tests PASS;
  targeted ESLint PASS. Initial test parser/JSONC failures corrected.
  `pnpm check` PASS (203 files / 4,580 tests, lint, typecheck, migration smoke,
  build) on `9635ad6`; hosted PR #10 `36241921150` validate SUCCESS.
- [x] Independent review P2 gaps in staging workflow FK cascade check and
  preflight SQL allowlist fixed; 3 files / 63 tests plus targeted ESLint PASS
  after fix. Require exact-head hosted CI on follow-up docs/review-fix commit.
- [x] Owner-approved device OAuth (`pnpm dlx wrangler@4.119.0 login --device
  --browser=false --scopes account:read user:read d1:write`) succeeded without
  changing repo dependencies. `CI=true pnpm exec wrangler whoami` authenticated;
  read-only `wrangler d1 list --json` and `d1 info frigo-db-staging-v3
  --config wrangler.staging.jsonc --json` match the unique live staging name/ID
  to config and packet Phase B; packet Section 0 ID is different and must not
  be used. No ledger/schema read or remote writes were performed.
- [ ] Confirm the staging Environment credential and identity independently
  within PR #10's reviewed, exact-main read-only preflight. Local OAuth does
  not prove GitHub staging Environment access or authorize production changes.
- [ ] Review PR #10 staging-only workflow, merge via maintainer on `main`,
  rerun exact-main CI;
  only then dispatch from main using the staging Environment and exact SHA.
  Do not use the production D1 workflow for staging.
- [ ] Certify live D1 identity, ledger, bookmark, FK/quick checks, catalog and
  0039; then D1 500/T20-OFF deploy + smoke, V2-ON deploy + full staging E2E.
  No remote staging D1 read/write or T20 enablement was done in this task.
- [ ] T20 production release requires a separately authorized task;
  `production_migration=NO`, `production_deploy=NO`,
  `production_enablement=NO` here.

**Latest (2026-09-26):** PR #8 merged at `662a065`, exact-main CI green;
PR #9 is synced with `main` and docs head `cffd959` passed hosted CI.
The next section is the live board; older entries are historical.

## T20 PR #9 C8–C10 certification — live gate, 2026-09-26 UTC

- [x] PR #8 merged at `662a065`; exact-main hosted CI run `36237334354`
  validate SUCCESS. Deploy run `36237637195` release/staging SUCCESS,
  production SKIPPED; this is not T20 staging certification.
- [x] C8 `8814701`: merge `origin/main` into PR #9 preserving C5/C6/C7;
  retarget PR #9 to `main`; `merge-base HEAD origin/main = 662a065`.
  Diff contains only T20 hardening/tests/docs, with no migration, deploy
  config, auth/payment, T19 authority or PR #8 duplicate runtime changes.
- [x] Post-sync C9 focused: T20/T19 10 files / 112 tests PASS; no regression
  fix required. `git diff --check origin/main...HEAD`, `pnpm typecheck`,
  `pnpm lint` PASS.
- [x] C10 post-sync `pnpm check` PASS: 202 files / 4,574 tests, typecheck,
  lint, migration smoke and build. Hosted C8 head `8814701` CI run
  `36238249061` / job `108393884945` SUCCESS (same 202 / 4,574).
- [x] Docs checkpoint `cffd959`: exact-head hosted run `36239282586` /
  validate job `108396637996` SUCCESS (lint, typecheck, Vitest, migration
  smoke, build). Focused C5/C6 suites on this head: 2 files / 24 tests PASS.
  PR #9 OPEN, MERGEABLE/CLEAN, zero unresolved review threads at this check.
- [ ] Maintainer merge of PR #9 only after this further docs-only receipt
  passes its own exact-head hosted CI and live review/mergeability check;
  update PR body with final evidence. Do not merge PR #9 in this task.
- [ ] T20 staging certification still pending; keep paired T20 flags OFF.
  No staging D1 migration or production mutation in this task.

## T20 PR #8 → #9 chain — live gate, 2026-09-26 UTC

- [x] C5 P1 same-slot prefix safety `ab83d35`; affected later meals `5c6835e`;
  V1 family/reviewed-evidence precision `6c68d8d`. Injected reviewed
  substitution tests cover ADD, SWAP, PATCH reorder, PUT save, cross-slot and
  V1 family; rejected writes keep revision and state, safe/unaffected edits pass.
- [x] C6 P2 404/409 precedence `092d67b`, concurrent slot-add race
  `869f035`; stale PATCH and Auto, true missing slot/component, and existing
  torn-read winner/fence cases pass.
- [x] C7 code freeze `869f035`: `pnpm check` PASS (202 files / 4,574 tests,
  typecheck, lint, migration smoke, build); focused T20/T19 10 files / 112
  tests PASS; `git diff --check origin/main...HEAD` PASS. Expected-red
  regressions and two interrupted superseded full runs are not release gates.
- [ ] C1 PR #8 normal merge and exact-main CI: #8 OPEN at `16c5aae`,
  MERGEABLE/CLEAN, zero unresolved threads, hosted `validate` `36233377483`
  SUCCESS. `main` `bf57451` last CI `36221190222` FAILED. No agent merge.
- [ ] PR #9 sync to merged `main`, retarget from #8 branch, then require
  exact-head hosted CI SUCCESS, zero unresolved reviews, mergeable, normal
  maintainer merge and exact-main CI SUCCESS. Stacked PR #9 has no hosted CI.
- [ ] Staging identity/ledger and 0039 migration/deploy certification require
  separately verified authorized staging access. No staging or production
  migration/deploy/enablement occurred; both T20 flags remain OFF.

## T20 PR #8 CI fix — lock/regenerate race, 2026-09-26 UTC

- [x] Final PR #8 merge-readiness audit: current main `bf57451`, reviewed
  head `5b0a6b9`, hosted `validate` `36226026618` SUCCESS; MERGEABLE/CLEAN,
  zero unresolved review threads; fresh focused T20 suites 37/37 PASS and
  `git diff --check origin/main...HEAD` PASS. No new migration/configuration
  change in #8. This is merge readiness, not T20 production certification.
- [ ] Maintainer merges PR #8 normally (agents cannot merge protected main),
  verifies exact-main CI, retargets stacked PR #9 to main and certifies it.
  No staging D1 migration/deploy or production mutation in this pass.

---

PR #8 hosted `validate` run `36225377465` failed 1/4554:
`competing lock/regenerate` got `[200, 404]`. Regenerate won; the losing PATCH
targeted the unlocked legacy component, which the winning regenerate replaced.
Test-only fix (`754fb2e`): the race
now targets the locked rice component, which regenerate preserves by ID, so the
loser always reaches the revision fence (409 `PLAN_REVISION_CONFLICT`); final
state asserted for both winners. Executed: flows file 5/5 runs PASS (16 tests);
throwaway sequential regenerate-then-stale-PATCH check PASS (409, rice still
locked; not committed); `pnpm typecheck` PASS; eslint on the file PASS.

Follow-up finding (production code NOT changed, per scope): `MealCompositionService.load`
reads the plan row and `readPlanCompositions` in separate awaits. A stale
component edit can pass `assertRevision` on the old row, then read a newer
composition and fail with 404 `COMPONENT_NOT_FOUND` before the fenced write.
Writes remain revision-fenced (no data loss); only the error classification is
wrong. Next: reclassify to `PLAN_REVISION_CONFLICT` when the plan revision
moved (or read row + compositions in one batch), with a regression test.

---

# T20 post-merge CI fix + picker cuisine filter, 2026-09-26 UTC

Branch `fix/t20-postmerge-ci-picker-cuisine` from main `bf57451` (PR #7 merge).
- `87c8e64` (test-only): main CI run `36221190222` failed at
  `tests/integration/t20-meal-composition-flows.test.ts:177` because the
  add/remove race can legitimately be won by DELETE (empty composition) while
  the test assumed `components[0]`. The combined race is split into three
  independent cases; each asserts exactly one 200 + one typed 409
  (`PLAN_REVISION_CONFLICT`; auto-apply losing to a save may be the documented
  `PROPOSAL_STALE`) and a final state matching the winner. DELETE-wins refills
  at the current revision; lock/regenerate and save/auto-apply start from a
  deterministic sequential setup. No production logic changed.
- `65084fc`: T20 picker `cuisine` query (strict enum of existing `CuisineType`
  values), filtered server-side on stored recipe cuisine together with role/q/
  kind; simple foods have no cuisine and are excluded when the filter is set.
  UI: labelled cuisine select and filtered empty state with Clear filters.
  Candidate authority, hard restrictions, composer, shopping, T19 unchanged.

Executed: focused `vitest run` of t20-meal-composer-ui, t20-roles-picker-shopping,
t20-meal-composition-flows, t20-meal-composition-http: 4 files / 37 tests PASS;
flows file 6/6 repeated runs PASS; DELETE-first sequence verified with a
throwaway sequential test (not committed). `pnpm typecheck`, lint PASS.
`pnpm check` on `65084fc`: typecheck, lint PASS; vitest 4,552 PASS / 2 FAIL —
`tests/unit/d1-readonly-query.test.mjs` and
`tests/unit/production-certify-workflow.test.mjs` hit the 5 s default timeout in
this sandbox (both PASS with `--testTimeout=60000`, ~6.2 s each; unrelated to
T20). Because the script stops at tests, `pnpm check:migrations`
(`migration-smoke=ok`) and `pnpm build` (`✓ built in 10.45s`) were run
separately: PASS. `git diff --check origin/main...HEAD` PASS. The running-app
UI check was not performed (the T20 UI flag stays off here). Nothing merged,
deployed or migrated; production D1 not accessed; no T20 flags enabled.

Next: open a PR from this branch, confirm hosted `validate` is green (it should
no longer flake at the old line 177), then run a flag-enabled local visual check
of the picker cuisine select before any T20 release.

---

# T20 PR #7 — final merge audit, 2026-09-26 UTC

**No code change needed.** Reviewed head `6882ba3` / main `136cb6f`:
hosted `validate` run `36217584128` SUCCESS, MERGEABLE/CLEAN and no review
comments; PR diff check PASS. Focused `pnpm exec vitest run
tests/unit/composition-flags.test.mjs tests/integration/d1-schema-gate.test.ts
tests/unit/t20-composer-candidates.test.ts tests/unit/t20-meal-composition.test.ts`
PASS (4 files / 46 tests). Previously `pnpm check` on application head
`0b465d5` PASS (201 files / 4,549 tests, migration smoke, build); reviewed
head differs only in docs. No remote D1 checks or production mutations run here.

Next: verify exact-head CI for this docs-only receipt; user decides merge.
D1 operator applies 0039 before deployment; release owner enables the paired
default-off flags only after migration. These are deployment-only follow-ups.

---

# T20 PR #7 — remaining P2 budget items, 2026-09-26 UTC

**Status: `T20_PR7_READY_FOR_FINAL_REVIEW`.** Reviewed main
`136cb6f`; prior head `a337a2b` has hosted `validate` SUCCESS (run
`36216083854`). The final-pass
head `0b465d5` removes a stray EOF blank line from the PR diff, with no logic
change. Full PR diff check now PASS; application-head `validate` SUCCESS (run
`36216675722`), handoff head `d7aef32` `validate` SUCCESS (run `36217199489`,
MERGEABLE/CLEAN, no review comments).
Implementation checkpoints: `e3aef74` (P2-1) and `4f60157` (P2-2).

| Item | Implementation | Proof |
| --- | --- | --- |
| P2-1 total candidate pool ≤ 320 | Ranked recipes; eligible simple foods reserve slots in the same cap; multi-role fair quota then global-rank backfill | `t20-composer-candidates.test.ts`: 3 PASS; 320 recipes + foods, rare roles, deep favorite, reverse catalog, hard filters, determinism |
| P2-2 scoring operations ≤ budget | Check before `scoreComposition`, stop/cached frontier on exhaustion, no hidden output scoring | `t20-meal-composition.test.ts`: 17 PASS; 1/3/0 limits, locks and hard compatibility |

Focused cross-layer regressions (Manual T03, Assisted/Auto, family shopping,
substitutions, feature flags, T19): 6 files / 68 tests PASS before the last
zero-budget test. `pnpm typecheck`, `git diff --check`: PASS. Full `pnpm check`
PASS: typecheck, lint, 201 Vitest files / 4,549 tests, migration smoke
(`migration-smoke=ok`) and build (`✓ built in 6.64s`). Remote schema and
Week parity skipped locally. Independent focused review: no new P0/P1/P2.
Final-pass `pnpm typecheck`: PASS; focused `pnpm exec vitest run
tests/unit/t20-composer-candidates.test.ts tests/unit/t20-meal-composition.test.ts
tests/integration/t20-meal-composition-http.test.ts`: 3 files / 23 tests PASS;
`git diff --check origin/main...HEAD`: PASS (initial EOF whitespace warning
fixed in `0b465d5`). `pnpm check` PASS: typecheck, lint, 201 test files /
4,549 tests, `migration-smoke=ok`, build (`✓ built in 6.72s`); remote schema
and Week parity skipped locally. Independent code and release audits:
no new P0/P1/P2 or merge blockers. Deployment requires 0039 on target D1;
the paired Worker/UI flag defaults off and needs a release-owner opt-in after
migration. Final narrow check: `pnpm exec vitest run
tests/unit/composition-flags.test.mjs tests/integration/d1-schema-gate.test.ts
tests/unit/t20-composer-candidates.test.ts tests/unit/t20-meal-composition.test.ts`
PASS (4 files / 46 tests); `git diff --check origin/main...HEAD` PASS. No
implementation change in this final audit.
**Next:** verify CI on the exact PR head immediately before a user-authorized
merge. No merge/deploy/production D1 mutation authorized here.
No merge, deploy, production migration/data change, flag enablement or T19
authority change.

---

# Tako-san T20 PR #7 review remediation (4 × P1 + candidate-cap P2) - 2026-09-26 UTC

**Status: `T20_REVIEW_P1_REMEDIATED` — local `pnpm check` PASS (200 files /
4,541 tests); PR #7 hosted `validate` run `36210020774` SUCCESS on head
`424be56` (MERGEABLE, CLEAN; this docs-only commit gets its own run). Production untouched: no
deploy, no D1 migration, T19 authority unchanged (d1/0/cutover=true, 500).**

`branch=feat/t20-meal-composition-v2` (PR #7), review base head `febeb1f`; implementation commit `2e4f878`.

Fixed (review findings on PR #7; the earlier "P1 = 0" claim was wrong):
- P1 Manual hard safety: T03 `evaluateHardRestrictions` extracted from
  `evaluateRankingEligibility` (behaviour unchanged) is the single definition.
  New `packages/recipes/src/composition/restrictions.ts` judges every component a
  Manual mutation adds (add/swap/replace, and Assisted/Auto apply) on the same
  T02 candidate (slot inventory, planner substitution policy, server evidence
  provider) that Auto ranks: dietary/allergen unknown, time unknown/over, hard
  nutrition unknown/conflict, forbidden (incl. used substitutes), never-recommend
  → 422 `HARD_CONSTRAINT_CONFLICT`. Simple foods use the same function in Auto,
  Manual and picker (Auto previously ignored time/nutrition for simple foods).
  No manual override model.
- P1 V1 family meals: composition routes (Manual/Assist/Auto) return 422
  `LEGACY_FAMILY_COMPOSITION_UNSUPPORTED` up front; the UI keeps V1 "Swap meal"
  and shows no composer for family slots. Family slots are now projected
  (`legacy_family`, exact T04 variant identity), so composed-plan shopping no
  longer drops their demand (it silently did before); an unresolvable variant is
  409 `COMPOSITION_REVALIDATION_REQUIRED`.
- P1 shopping substitution authority: `EvaluationScope` requires
  `substitutions/approvedSubstitutionIds/activeConstraints`, built by
  `evaluationScope(context)` from the same planning context as the planner and
  Auto. (The production context still supplies empty lists — no reviewed registry.)
- P1 flags: `deploy.yml` input `meal_composition_v2_enabled` (default false) →
  `release-check.mjs gate` normalizes once (manifest `mealCompositionV2Enabled`)
  → Build `VITE_MEAL_COMPOSITION_V2_ENABLED` + Worker `--var
  MEAL_COMPOSITION_V2_ENABLED` in staging and production; `scripts/composition-flags.mjs
  verify` fails unless server/UI/manifest/compiled value (`dist/composition-flags.json`,
  written by a Vite build plugin outside `dist/client`) agree. Wrangler configs
  default `"false"`. Production build moved to its own step after local gates.
  UI falls back to V1 controls when the composition API 404s (mismatch).
- P2 candidate bias: all role-matching recipes are generated and ranked; the 320
  cap applies after ranking with a per-role quota (no catalog-order truncation).
- Preview: `PREVIEW_MEAL_COMPOSITION_V2_SERVER=false` drills the UI-on/server-off
  mismatch in the isolated preview.

Checks executed (local, Node 24.19):
- `pnpm check` PASS: typecheck (app + worker), lint, Vitest **200 files / 4,541
  tests** (612.9 s), `migration-smoke=ok`, build.
- New suites: `tests/unit/t20-composition-safety.test.ts` (13),
  `tests/integration/t20-legacy-family-and-safety.test.ts` (5),
  `tests/unit/composition-flags.test.mjs` (17), +4 UI cases in
  `tests/unit/t20-meal-composer-ui.test.tsx`. Verified to fail on the old code:
  all 5 integration cases and the 2 UI family/mismatch cases.
- Browser (isolated preview, synthetic data, agent-browser, 390×844): flags on →
  composer shown, V1 swap hidden, Manual add of rice persisted; UI on/server off →
  compositions 404, V1 "Đổi món" shown, no composer. Family slot not browser-tested
  (static preview catalog has no families; covered by jsdom + HTTP tests).
- `deploy.yml` not executed on GitHub Actions (only parsed and unit-tested).

Remaining debt (not blocking): picker still lists recipes with
`constraintState: unknown` when safety is requested (server rejects on save);
role heuristics (staple 0 / dessert 0 in catalog); per-component servings.

Next: operator merge decision on PR #7 (not merged by the agent). After merge,
production Deploy fails closed until 0039 is applied through *Production D1
migration* (`expected_pre_tip=0038_auth_onboarding_completion.sql`,
`migration=0039_meal_composition_v2.sql`); staging D1 needs 0039 before its flag
is enabled. Automatic staging deploys ship the flag off. Then dispatch Deploy with
`meal_composition_v2_enabled=true` (see `DEPLOYMENT.md`).

---

# Tako-san T20 Meal Composition V2 - 2026-09-25 UTC

**Status: `T20_CODE_COMPLETE` — local gates PASS; PR #7 hosted CI `validate`
run `36197958265` SUCCESS on implementation head `0db541da8619fdf03f21bc4fb93d081fa335a0d5` (MERGEABLE,
CLEAN; this docs-only commit gets its own PR-head run). T19: `T19_COMPLETE_OPERATOR_ACCEPTED`. Production
untouched: recipe authority d1/0/cutover=true, 500 recipes; no T20 deploy; no
production D1 migration.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`
`starting_main=136cb6ff3d2921eac237c7b106b37ab5ee12a13f`
`branch=feat/t20-meal-composition-v2`

Implemented (ADR-031, `MEAL_COMPOSITION_V2.md`):
- T20A: additive migration `0039_meal_composition_v2.sql`
  (`generated_meal_plan_compositions`, `generated_meal_plan_components`,
  `recipe_role_assignments`; partial unique indexes for one dish per meal);
  domain model, closed role enum, deterministic role rules with provenance,
  nine bounded simple foods, flexible meal profiles, V1 read-time projection.
- T20B: server-authoritative Manual builder API (add/remove/swap/lock/role/
  reorder/replace) sharing the plan `revision` behind a batch fence; picker
  (summary DTOs, role/kind/text filters, stable offset cursor, ≤ 24/page).
- T20C/D: Assisted (complete / regenerate unlocked) and Auto (top ≤ 3) on one
  bounded, deterministic beam search; suggestions never write; apply recomputes
  and requires the same option ID; locks are domain-enforced.
- T20E: all components of all meals projected against one running T04
  inventory projection, then unchanged T05 aggregation (single subtraction).
- T20F: composed week cards, meal composer, picker bottom sheet/dialog,
  suggestion panels; vi/en; lock `aria-pressed`, one polite live region, focus
  restoration, Escape cancels without mutation.
- V1: unedited slots read as `main / legacy_v1`; V1 schemas unchanged; V1 swap
  on a composed slot is 409 `COMPOSITION_MANAGED_SLOT`; V1 regenerate keeps
  locked components; V1 shopping projects components. Flag off = pre-T20.
- Flags: `MEAL_COMPOSITION_V2_ENABLED` (server) and
  `VITE_MEAL_COMPOSITION_V2_ENABLED` (UI), both default off, independent of T19.
- Preview: `PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs`
  opts the isolated preview into V2 (default off keeps the T06B browser suite).

Role distribution on the 500-recipe D1 release (pinned test): main 362, side
87, soup 70, vegetable 37, simple_food 7, staple 0, dessert 0; unclassified 0,
invalid 0, duplicates 0, contradictions 0, review-required 0.

Checks executed (local, Node 24.19, sqlite3):
- `pnpm check` PASS: typecheck, lint, Vitest **197 files / 4,502 tests**
  (725.9 s), `migration-smoke=ok`, build. T20 suites: 6 files / 48 tests; T19
  authority suites (split 11, persistence 18, observability 19) PASS;
  d1-schema-gate 9 PASS.
- Earlier full run: 4,496/4,497 with one unrelated 5 s timeout in
  `production-certify-workflow.test.mjs` under parallel load; that file passed
  48/48 in isolation and in the final `pnpm check`.
- Browser (isolated preview, synthetic data, agent-browser): 375×812, 390×844,
  768×1024, 1280×900 — plan generation, V1 cards, composer, Auto options and
  accept, picker keyboard focus/Escape return, no horizontal overflow, no
  unnamed controls.

Not done / deferred: leftovers (T20B/T21), per-component servings, role review
tooling and AI-assisted offline role proposals, picker ingredient/cuisine
filters, whole-week Auto, price-aware scoring. `tests/fixtures/migration-sha256.json`
gets the 0039 hash only after the migration is applied (fixture policy).

Next: independent review of PR #7 (not merged by the agent); require exact-head
hosted `validate` on the final head.
Rollout (separately authorized): apply 0039 to staging then production D1 (the
schema gate fails closed on a 0038 ledger), then enable both flags. Do not change
T19 recipe authority.

---

# Historical T19 operator closure / T20 unlocked - 2026-09-25 UTC

**Status: `T19_COMPLETE_OPERATOR_ACCEPTED`. T20: `UNLOCKED`.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`
`main_baseline=136cb6ff3d2921eac237c7b106b37ab5ee12a13f` (PR #6 merge)

T19 closure was accepted by the operator based on the successful final D1
deployment, the rollback proof, the final restoration, exact-main CI, the
existing production read-only certification and runtime release evidence.
The evidence below is operator-reported for runs on the same main SHA; this
agent did not re-run or re-read those production runs in this task.

- Exact-main CI `36149295615` SUCCESS; current-main staging `36149849086`
  SUCCESS.
- Production sequence: shadow `36150427552`, canary-1 `36151130515`,
  canary-5 `36152198646`, canary-25 `36153116467`, first d1 `36153948951`
  (all SUCCESS).
- Rollback proof `36154980456` SUCCESS (d1 → shadow): PASS.
- Final restore: canary-1 `36167843671`, canary-5 `36176092421`, canary-25
  `36176824421`, final d1 `36183890785` (all SUCCESS): PASS.
- Final production authority: `mode=d1`, `percent=0`, `cutover=true`,
  `source=d1`, served recipes `500`, release `rel-bd00a4f53fcaeee4`,
  `fallback=null`, runtime fingerprint `f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.

**The final post-rollout read-only recertification was waived by the
operator. No post-final-D1 certification run occurred; do not invent a PASS
receipt for it.**

T20 (Meal Composition V2) is unlocked and implemented on
`feat/t20-meal-composition-v2`; see the T20 section above this one once it is
recorded. T20 must not change production recipe authority (d1/0/true, 500).

---

# Historical T19 same-SHA promotion convergence fix - 2026-09-25 UTC

**Status: `TAKOSAN_D1_PROMOTION_CONVERGENCE_FIX_IN_REVIEW`. Production at
`canary-25` on `a3e1614`; d1 attempt rolled back. T19 incomplete, T20
blocked.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [done] Rollout on `a3e1614`: shadow `36140227253`, canary-1
  `36141391948`, canary-5 `36142331814`, canary-25 `36143861402` SUCCESS.
- [evidence] d1 `36144837880`: commit-only readiness wait passed at attempt
  1 while the canary-25 version still answered; smoke failed on mode;
  restore retried and recorded `restored` (step SUCCESS).
- [done] Readiness wait now requires the approved authority state and 3
  consecutive matches; authority proof polls only the pre-deploy state;
  both bounded, all other mismatches fail closed. Workflow YAML unchanged.
  `pnpm check` PASS (191 files / 4,453 tests).
- [next] Merge → new-main CI → staging → certification → shadow on the new
  SHA (rollback checkbox on) → canary 1 → 5 → 25 → d1 → rollback proof →
  final d1.

---

# Historical T19 legacy-Worker bootstrap fix - 2026-09-25 UTC

**Status: `TAKOSAN_PRODUCTION_BOOTSTRAP_FIX_IN_REVIEW`. Production Worker
unchanged (pre-T19). T19 incomplete, T20 blocked.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [evidence] Deploy `36133649176` missing token; `36134994434` preflight
  401 from legacy Worker. No production deploy step ran.
- [done] Classified legacy 401 via the snapshotted Worker's `GIT_COMMIT`
  (ancestor + lacks route), not via body code (legacy returns
  `TOKEN_INVALID` with Bearer). Restore handles the same case. Tests +8;
  `pnpm check` PASS (191 files / 4,440 tests).
- [next] Merge PR → new-main CI → staging PASS → read-only certification
  → shadow bootstrap on the new SHA → canary 1 → 5 → 25 → d1 → rollback
  proof → final d1.

---

# Historical T19 production certification PASS / rollout - 2026-09-25 UTC

**Status: `TAKOSAN_PRODUCTION_SHADOW_DISPATCH_REQUIRED`. T19 incomplete,
T20 blocked. Production Worker unchanged (pre-T19 `4677ebbabbb580b9045423350da719acaf8f5742`).**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [done] PR #4 merged; main `860380887350d4ab93e4d5e66a0fa4e074397608`, implementation identical to
  `399ec9b`. CI `36131217435` PASS.
- [done] Staging `36131763935` PASS on new SHA (static/0, 71, no fallback).
- [done] Production read-only certification `36132078167` PASS: ledger 0038,
  500/500 catalog + runtime fingerprint, FK/quick_check ok, rollback baseline
  `aada9b9d-93f9-4db5-97a6-d5c4741a67e7` / `4677ebbabbb580b9045423350da719acaf8f5742`.
- [done] D1 migration not required (ledger already at repository tip).
- [blocked] Production shadow bootstrap dispatch: agent HTTP 403. Owner must
  dispatch; reviewer approves.
- [next] shadow (bootstrap checkbox on) → canary 1 → 5 → 25 → d1 → rollback
  proof d1→shadow (checkbox on) → shadow → canary 1 → 5 → 25 → d1 final;
  same SHA throughout, no main merges. Inspect each receipt before the next.

---

# Historical T19 exact patch handoff - 2026-09-25 UTC

**Status: `TAKOSAN_WORKFLOW_WRITE_PERMISSION_BLOCKED`; implementation patch
prepared for authorized reviewer but not published. T19/T20 BLOCKED.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [done] Exported exact implementation commit `399ec9b` as a single-commit
  patch covering six files (two workflows, D1 query helper, safety tests,
  sandbox sqlite3 setup); no preceding documentation commits included.
  `git diff --check 399ec9b^ 399ec9b` PASS and `git apply --check -`
  against an isolated `origin/main` archive PASS.
- [blocked] GitHub App workflow-file write gate persists. No remote branch
  or PR published; main remains `f933f222df992768534283b38d32b358498563d2`. Production certification
  `36101940395` FAIL, no new production activity by this handoff.
- [next] Authorized maintainer applies exact patch, runs checks, opens PR;
  after review/merge require new-main CI, new-SHA staging and a separately
  approved production read-only certification. No T20.

---

# Historical T19 workflow publication gate - 2026-09-25 UTC

**Status: `TAKOSAN_WORKFLOW_WRITE_PERMISSION_BLOCKED`; local repair tested,
not published. Production certification FAIL, T19/T20 BLOCKED, no production
mutation by this patch.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [done] Local implementation checkpoint `399ec9b`; docs checkpoint
  `17ab64c`. `pnpm check` PASS (lint, typecheck, 191 files / 4,432 tests,
  migration smoke, build). See historical section below for root-cause and
  exact run `36101940395` evidence.
- [blocked] `git push origin HEAD:hoplite/stymphalos-a3bdf6c6` was remote
  rejected: GitHub App lacks `workflows` permission for
  `.github/workflows/deploy.yml`. Credential active and repository ID matches.
  No remote branch/PR, no main move; docs or code must not be published
  separately to bypass workflow-file controls.
- [next] Restore an authorized workflow-file write route (integration
  permission grant, or authorized maintainer publishes the tested patch),
  open PR for review, merge normally; then require exact-new-main CI,
  new-SHA staging PASS and owner/reviewer-approved read-only production
  certification PASS. Do not attempt D1 migration, rollout, or T20 yet.
- [checks] `credential_control status`; denied explicit-ref push;
  `git ls-remote` target ref absent; `gh pr list` empty; remote main GET
  still `f933f222df992768534283b38d32b358498563d2`. No new remote job run by the agent.

---

# Historical T19 read-only certification query repair - 2026-09-25 UTC

**Status: `T19_PRODUCTION_READ_ONLY_CERTIFICATION_BLOCKED`; old-main staging
PASS, production cert FAILURE, T19 and T20 BLOCKED. No production mutation by
this repair.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [evidence] Owner run `36101940395` at `f933f222df992768534283b38d32b358498563d2`: gate, post-approval
  exact-main and production identity/rollback baseline PASS; remote D1 schema
  gate PASS (exact 0001–0038 ledger and foreign keys). Following Wrangler
  `--file schema-gate.sql` exited 1; receipt has no production certification
  PASS, catalog/runtime/integrity evidence. The exit cause is not proven.
- [done] Audited pinned Wrangler 3.114.17: remote `--file` routes to D1
  `/import` and cannot return SELECT rows; `--command` routes to `/query`.
  Replaced the three certification `--file` calls with a guarded fixed-name
  helper: 1 schema + 2 catalog + 5 runtime SELECTs, exact JSON checks and no
  partial output. Changed existing Deploy runtime proof to use the same
  query path; protected gates and D1 verifier code unchanged.
- [done] Focused 5 files / 260 tests PASS; `pnpm check` PASS: lint,
  typecheck, 191 test files / 4,432 tests, migration smoke and build. Diff
  check PASS. `check:migrations` initially failed due missing sqlite3 CLI;
  committed `.hoplite/setup.sh` makes prerequisite durable,
  `sandbox_control setup` PASS and standalone `pnpm check:migrations`
  PASS (`migration-smoke=ok`). Implementation checkpoint `399ec9b`.
- [blocked] Production certification is **not** PASS. No promotion or T20.
- [next] Review/merge repair PR, verify exact-new-main hosted CI and
  **new-SHA** staging PASS, then owner dispatches new read-only production
  certification with required production reviewer and inspect its complete
  PASS artifact. Do not rerun failed jobs of old run as a substitute.

---

# Historical T19 staging PASS / certification task board - 2026-09-25 UTC

**Status: `TAKOSAN_OWNER_TRANSFER_CONTROL_PLANE_MISMATCH`: Actions dispatch
HTTP 403. Staging `PASS`; production certification `NOT STARTED`;
T19 and T20 `BLOCKED`. Production unchanged.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [evidence] Historical Deploy `36018964086` rerun attempt 2 skipped every
  job, no artifact/deploy; reason for event-gate mismatch not yet proven.
- [done] Owner manually dispatched reviewed Deploy `36092413084` against
  exact main `f933f222df992768534283b38d32b358498563d2`. Release/staging SUCCESS, production SKIPPED.
  Staging preflight (formerly Cloudflare code 10000), build, CI recheck,
  deploy, exact-SHA smoke and authority proof all SUCCESS.
- [done] Verified receipt `release-staging-36092413084-1`: staging deployed
  exact SHA, `static/0/cutover=false`, source `static`, 71 served recipes,
  release `rel-bd00a4f53fcaeee4`, fallback null; hosted smoke confirms readiness
  and database `ok`. D1 readiness `not_evaluated` in static mode; no
  production D1 claim. Main and CI `36018278513` still match.
- [blocked] Production Read-Only Certification workflow active, production
  reviewer `vn-taphoanhatung` still required. Attempted exact-main dispatch
  using the approved full SHA/hardening SHA from staging receipt, but GitHub
  installation rejected it with HTTP 403. No certification run or mutation.
- [next] Owner dispatches **Production Read-Only Certification** from `main`
  via GitHub UI: full `ref` = `sha`, `hardened_sha` = `hardenedSha` in
  `release-manifest.json` from artifact `release-staging-36092413084-1`;
  confirm read-only = true. Respect required reviewer approval and require
  full PASS/production unchanged receipt before any D1 migration or rollout.
  No T20.
- [checks] Run/attempt/job/artifact GETs; candidate/staging artifact download
  and safe-field inspection; bounded hosted staging smoke/authority log;
  `git fetch origin --prune --quiet`, main/CI API checks, production
  Environment and certification workflow GETs; attempted cert dispatch
  (HTTP 403). No local application tests (code and workflows unchanged).

---

# Historical T19 staging retry task board - 2026-09-25 UTC

**Status: `TAKOSAN_OWNER_TRANSFER_CONTROL_PLANE_MISMATCH` (GitHub Actions
rerun denied; owner-reported secret update unverified). T19: `BLOCKED`;
T20: `BLOCKED`. Production unchanged.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [reported] Owner says dedicated staging Cloudflare token was set in the
  GitHub staging Environment. `gh secret list --env staging` still gives HTTP
  403 to this installation; no token value, type or update time verified.
- [done] Fetched unchanged `origin/main=f933f222df992768534283b38d32b358498563d2`, canonical ID
  `1385308553`, hosted CI `36018278513` `validate` SUCCESS, and exact-main
  Deploy `36018964086` event `workflow_run`, attempt 1, release SUCCESS,
  staging FAILURE (code 10000), production SKIPPED. Deploy YAML unchanged.
- [blocked] `gh run rerun 36018964086 -R tako-vn1/Tako-san` was refused:
  `Resource not accessible by integration`. Attempt remains 1; no staging or
  production deploy occurred. Read-only Cloudflare OAuth cannot list Worker
  secret metadata; do not use ad-hoc deploy or unrelated main commits.
- [next] Owner uses **Re-run jobs → Re-run all jobs** on
  `https://github.com/tako-vn1/Tako-san/actions/runs/36018964086` to recreate
  the release artifact for new attempt. After initiation, verify all staging
  jobs and exact-SHA authority/smoke evidence. Do not start production or T20
  before staging PASS.
- [checks] `git fetch origin --prune --quiet`, `git diff origin/main --
  .github/workflows/deploy.yml` (no diff), repository/main/CI/deploy API GETs,
  `gh secret list -R tako-vn1/Tako-san --env staging` (403), `gh run rerun
  36018964086 -R tako-vn1/Tako-san` (denied), read-only Wrangler whoami and
  Worker secret-list probe (denied). No local tests (no code changes).

---

# Historical T19 Cloudflare login task board - 2026-09-25 UTC

**Status: `TAKOSAN_STAGING_CLOUDFLARE_TOKEN_REQUIRED`. T19: `BLOCKED`;
T20: `BLOCKED`. No staging/production mutation performed.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [blocked] After owner authorized the agent to act, `credential_control
  rotate` issued a fresh GitHub installation credential but staging secret
  metadata and Actions-policy GETs still return HTTP 403. Cloudflare `whoami`
  still reports only read-only OAuth scopes, no local API token is available,
  main remains `f933f222df992768534283b38d32b358498563d2`, and last Deploy is failure `36018964086`.
  No token/secret mutation or workflow dispatch attempted. Grant the actual
  Cloudflare API Tokens Write and GitHub Environment Secrets write permissions
  via approved integrations, or securely provision the token and staging secret
  in provider UIs; do not share a value in chat.
- [done] Owner-approved Cloudflare device login with temporary Wrangler
  `4.119.0`: `pnpm dlx wrangler@4.119.0 login --device --browser=false
  --scopes user:read account:read` succeeded. Sanitized `whoami` verified
  deployment account ID `ef250a88911fd24073cb73d1c07e0218`; actual granted scopes are
  `user:read`, `account:read`, `offline_access`.
- [blocked] Wrangler OAuth does not offer Cloudflare `API Tokens Write`, which
  `POST /user/tokens` requires. Do not store temporary OAuth access tokens as
  GitHub CI credentials. Managed GitHub App cannot administer Environment
  secrets. Its `gh api user` 403 does not mean the owner lacks a browser login;
  previous `TAKOSAN_GITHUB_LOGIN_REQUIRED` wording below was too strong.
- [evidence] Main remains `f933f222df992768534283b38d32b358498563d2` (`f933f22`) by GitHub commits API;
  exact-main CI `36018278513` passed but staging Deploy `36018964086`
  failed on Cloudflare code `10000` before deployment. Worker and staging D1
  identity have not been proven remotely in this read-only session.
- [checks] `pnpm dlx wrangler@4.119.0 --version`, `login --help`,
  `login --scopes-list`, device login, sanitized `whoami`,
  `gh api repos/tako-vn1/Tako-san/commits/main --jq .sha`, `gh auth status`,
  `git status --short --branch`, `git diff --check` and assertions for current
  T19 identities, blockers and historical records in all three docs; no local
  tests (no code changed).
- [next] Owner creates a durable staging Cloudflare API token with only the
  account-scoped Worker-scripts write access required by reviewed preflight
  and deploy, and securely updates **only** the GitHub `staging` Environment
  `CLOUDFLARE_API_TOKEN` in the UI (never paste it in chat). Verify the token
  and staging identity, rerun reviewed exact-main staging Deploy, then proceed
  only on PASS. Production and T20 stay gated.

---

# Historical T19 owner-transfer task board - 2026-09-24 UTC

**Status: `TAKOSAN_GITHUB_LOGIN_REQUIRED`; staging also requires
`TAKOSAN_STAGING_CLOUDFLARE_TOKEN_REQUIRED`. T19: `BLOCKED`;
T20: `BLOCKED`. No production mutation in this takeover.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- [done] Verified owner transfer from `vn-tako4/Tako-san`: numeric ID and Git
  history preserved, origin already points to `tako-vn1/Tako-san`. `git fetch
  origin --prune` and the commits API confirm `main=f933f222df992768534283b38d32b358498563d2` (`f933f22`).
- [done] PR #1-#3 and exact-main CI `36018278513` belong to the same repository
  ID. CI `validate` SUCCESS: 190 files / 4,415 tests, ESLint, typecheck,
  migration smoke and build. `main` is protected with required `validate`.
- [done] Checked Environments: `staging` exists; `production` still requires
  reviewer `vn-taphoanhatung`, whose permission is `write`; visible rulesets
  and branch rules return `[]`.
- [blocked] `gh auth status` shows installation account `x-access-token`, not
  owner user `tako-vn1`; `gh api user --jq .login` fails HTTP 403. Do not
  log out the managed installation credential. Owner-approved browser login is
  needed in an authorized CLI context.
- [blocked] Installation GETs for Actions/allowed-actions/workflow-token policy,
  complete branch protection, repository/environment variable and secret names,
  and webhooks return HTTP 403; app installation lookup returns HTTP 401. Re-audit
  these owner-transfer controls with authorized owner access. Secret names are
  not currently verified by this credential.
- [blocked] Latest Deploy `36018964086` at `f933f222df992768534283b38d32b358498563d2`: release SUCCESS,
  staging FAILURE on read-only Worker-secret lookup (Cloudflare code `10000`),
  production SKIPPED. Build/deploy/smoke skipped. Last successful staging Deploy
  `36009510442` is for older SHA `d6204d91b1849bf98df89c1c590e74395c494c89`; do not claim current-main
  staging certification.
- [blocked] No Cloudflare token or Wrangler OAuth session is available locally.
  No staging token was replaced; account/Worker/D1 remote identity not verified.
  Obtain a dedicated durable least-privilege token and replace **only** staging
  Environment `CLOUDFLARE_API_TOKEN` after identity checks.
- [checks] Read-only `gh auth status`, `git remote -v`, `git fetch origin
  --prune`, `gh api user --jq .login` (403), repository/commit/branch/
  Environment/reviewer/rules/policy/variable/secret-name GETs (restrictions
  above), `gh run view` for CI `36018278513` and Deploy `36018964086` with
  logs/jobs, `gh run list --workflow Deploy`, local config/release manifest and
  `git status --short`. `git diff --check` and `python3` current-identity,
  blocker and historical-record assertions passed for all three docs. No local
  test/build (no application code change).
- [next] Verify owner CLI account and inaccessible controls; repair only staging
  token, rerun reviewed exact-main staging path, require PASS. Only then run
  gated production read-only certification and follow approved T19 rollout.
  Never start T20 before `T19_COMPLETE`; do not create a cosmetic docs-only PR.

---

# Historical pre-transfer T19 release control - 2026-09-25

**Status: `TAKOSAN_STAGING_BLOCKED`. Exact-main CI: `GREEN`.
Production: `UNTOUCHED`.
T20: `BLOCKED`.**

- [done] Canonical repository verified as `vn-tako4/Tako-san` (ID `1385308553`).
- [done] PR #1 merged reviewed head
  `0899c49a28906d09f1a51b8afe2c72e09c860f18` into `main` as
  `d6204d91b1849bf98df89c1c590e74395c494c89`.
- [done] PR-head CI run `36007943241` passed protected context `validate`.
- [done] Exact-main CI run `36009002161` exists as a real GitHub Actions
  `push/main` run for `d6204d91` and passed lint, typecheck, 190 files / 4,415
  tests, migration smoke and build.
- [done] Classified the reported zero-run defect as a stale post-merge
  observation: CI was created four seconds after the human merge. Workflow state,
  triggers, Actions policy, skip semantics and branch protection are correct; no
  CI or repository-setting repair was required.
- [done] Automatic Deploy run `36009510442` followed exact-main CI. Release and
  staging succeeded; production was skipped. Exact deployed SHA `d6204d91`, mode
  `static`, canary `0`, cutover `false`, source `static`, 71 served recipes and
  null fallback were recorded.
- [done] Current operational docs corrected without changing application,
  workflow, migration or release code.
- [done] Docs recovery PR #2 merged `2002dfd2` as `a86ed095`;
  exact-main CI `36016668591` passed and automatic Deploy `36017207468` was
  created through `workflow_run`.
- [blocked] Deploy `36017207468`: release SUCCESS, production SKIPPED, staging
  failed closed before build/deploy because Cloudflare rejected the stored GitHub
  `CLOUDFLARE_API_TOKEN` with authentication code `10000`. No `a86ed095`
  deployment occurred; live staging remains healthy on `d6204d91`.
- [evidence] All three staging secret names remain present. The local Wrangler
  OAuth session can refresh and list the existing Worker `RELEASE_VERIFY_TOKEN`,
  isolating the failure to the static OAuth access-token snapshot stored in
  GitHub rather than a missing Worker secret.
- [next] Provision a durable least-privilege Cloudflare API token and replace only
  the staging Environment `CLOUDFLARE_API_TOKEN`, then repeat the reviewed staging
  path.
- [follow-up] Existing dependency audit and `usehoplite` App-side zero-check-run
  behavior remain separate.
- [blocked] Production Read-Only Certification, production deploy/D1/secrets/
  traffic/rollback and T20 require separate explicit authorization.
- [next] Independent remote review of the exact-main state; do not start rollout
  automatically.

---

# Historical T19 production read-only certification workflow - 2026-09-23

**Status: `T19_V2_PRODUCTION_CERT_WORKFLOW_PR_PENDING`. Production: `UNTOUCHED`.**

- [done] Re-resolved repository `1368281478` / `vn-tako4/Frigo-dev`; main
  `a4b5d726` and exact-main CI `35817133131` PASS.
- [done] Staging certified: Deploy `35817440484`, attempt 2, release/staging
  SUCCESS, production SKIPPED; exact-main static authority, 71 recipes, no fallback.
- [done] Dedicated manual, approval-gated read-only certification workflow;
  reused reviewed verifiers, guarded SQL, sanitized-only artifacts, rollback
  baseline reads, final main/ledger/Worker rechecks. No application/tooling change.
- [done] Focused 236/236 tests, lint/typecheck, local config check, migration smoke
  (after existing sqlite setup repair), build, diff/shell syntax checks. Local
  full suite exceeded 600 seconds (exit 124); hosted full-suite CI remains required.
- [blocked] Publication: GitHub App lacks `workflows` permission; push rejected,
  PR creation failed because no remote head branch exists. Implementation is
  retained locally at `aee4e2e`. Operator must authorize Workflows write for this
  installation before publication can resume; no credentials in chat.
- [pending] Narrow PR, exact-head hosted CI/review, maintainer merge, new main CI,
  production Environment approval and actual read-only certification.
- [not-started] Production rollout, cross-flow, rollback proof, final D1 restoration.
- [not-started] T20 (blocked until `T19_COMPLETE`).

See `CURRENT_STATE.md` for exact checks, limitations and next action.

---

# Release-secret provisioning receipt - 2026-09-23

**Status: `T19_V2_RELEASE_SECRET_PROVISIONING_BLOCKED`. Production: `UNTOUCHED`.**

- [done] Repository ID `1368281478` = `vn-tako4/Frigo-dev`; main `c0c8e82`
  unchanged; exact-main CI `35815588844` PASS; deploy.yml secret contract
  confirmed (staging: `STAGING_RELEASE_VERIFY_TOKEN` + Worker
  `RELEASE_VERIFY_TOKEN`; production: `RELEASE_VERIFY_TOKEN` + Worker
  `RELEASE_VERIFY_TOKEN`).
- [blocked] Staging: run `35815905652` failed before deployment; GitHub
  effective `STAGING_RELEASE_VERIFY_TOKEN` MISSING (runtime env evidence),
  Cloudflare secrets PRESENT, Worker secret UNKNOWN. Operator must provision the
  staging pair through authorized controls; this installation cannot.
- [not-started] Staging certification, production identity/D1 certification,
  production token pair, rollout, cross-flow, rollback proof.
- [not-started] T20 (blocked until `T19_COMPLETE`).

---


# Current takeover receipt - 2026-09-23

**Status: `T19_V2_CODE_COMPLETE_PRODUCTION_BLOCKED`. Production: `UNTOUCHED`.**
Repository ID `1368281478` is `vn-tako4/Frigo-dev`. Application PR #53 merged
normally at `03005fcbc39ab3c964393d2091f726088a4be5d0`; exact-head PR CI
`35810551334` and exact-main CI `35810986000` both PASS (189 files / 4,367 tests).
Integration reviewed head is `dbf32547a07fbc767e044365866a2bdfc4264cd8`; the
original recovery branch remains immutable at `0a04209e512d19293ed56a19d3fd51eb29ffefcd`.

Rechecked after the external merge: main remains `03005fc` and preserves the
exact recovered checkpoint. PR #54 carries this documentation-only handoff;
the application must not be reconstructed or republished as another PR.
Production D1 certification is blocked: this workspace has no Cloudflare API
token and `pnpm wrangler whoami` reports unauthenticated. Earlier takeover
evidence recorded missing GitHub verification secrets. Current repository and
Environment secret/variable listings return HTTP 403, so their present contents
cannot be independently verified here; Worker-side presence remains unverified.
Automatic staging run `35811338820` failed BEFORE deployment on the missing
staging verification secret; its production job was skipped. No deployment,
migration, secret change, rollout or rollback was performed.

See `docs/ai/recipe-catalog/T19_V2_TAKEOVER_AUDIT.md` for evidence and operator
steps. Provision the release prerequisites, certify production read-only, then
use the reviewed rollout workflow and prove rollback. T19 is NOT complete;
T20 remains blocked. Earlier pending/publication-blocked claims below are
historical and superseded by this receipt.

---


# Frigo / Takosan current task board — 2026-09-22

## T19 V2 — recipe authority cutover (integration 2026-09-22)

- [done] Reproduced the split-authority defect on unmodified main (planner D1-only recipe under static; 404 detail/cook).
- [done] Fenced the planner to `resolveRecipeAuthority` (`projectPlannerCatalogOnAuthority`); alternatives/swap/regenerate authority-clean; fingerprint scoped to the visible universe; stored plan authority identity + `CATALOG_AUTHORITY_CHANGED`.
- [done] Cross-flow D1-only recipe test (planner → swap → shopping → detail → cook start/complete), all-mode matrix incl. D1-fallback-together and authority spoofing.
- [done] Release state machine `static|shadow|canary{1,2,5,25}|d1` with derived cutover; deploy workflow certifies `wrangler.jsonc` binding, Cloudflare/D1 identity, ledger, catalog identity/duplicates/order, FK and quick_check read-only; requires ref == current main; rejects backwards SHAs and stale/skipped/reverse transitions; explicit rollback/bootstrap intent; binding proof for previous and deployed versions; API rollback with full proof on failure or cancellation; staging fail-closed.
- [done] Public sanitized `recipeAuthority` readiness + protected `/health/recipe-authority` release evidence (strict Bearer token, no PII); canary and shadow probes exercise D1 truthfully.
- [done] Verified repository ID `1368281478`, current main `a3b1564`, and immutable original remote head `0a04209`; application checkpoint `558be74` is its ancestor.
- [done] Integrated `558be74` onto `feat/t19-recipe-authority-cutover-v2-integration` from current main, retaining PR #52's newer documentation truth.
- [done] Planner content and steps come from the authority snapshot in every mode; static reads no D1 planner rows; d1 enrichment (families, classifications, provenance, nutrition) is fenced to the visible universe and degrades to the authority-only projection on failure; unused D1 `recipe_steps` read removed.
- [done] Current-tree verification: full Vitest 189 files / 4,364 tests PASS; focused matrix 13 files / 356 PASS (+23 snapshot/persistence after the last cleanup); release-check 155, D1 certification 32, Worker rollback 10 PASS; lint, both typechecks, migration smoke, 500-recipe import check (`rel-bd00a4f53fcaeee4`), build and diff check PASS.
- [done] Two independent review passes; all findings fixed (see `T19_V2_WIP_HANDOFF.md`). Historical doc sections restored after an intermediate formatting pass.
- [blocked] Publication of the integration branch: GitHub App credential lacks `workflows` permission (push rejected; workflow changes NOT stripped, no partial branch). Recovery artifacts `.artifacts/t19-current-safe-stop.bundle` / `.patch` are workspace-only. Owner push with a capable credential is the unblock. Status `T19_V2_APPLICATION_INTEGRATED_CI_PENDING` (safe stop 2026-09-23).
- [pending] Exact-head hosted CI/review, normal merge, exact-main certification.
- [pending] Read-only production identity/ledger/catalog certification, required release-token provisioning, staged rollout (shadow → canary 1 → 5 → 25 → d1), representative flows and rollback proof. Production remains untouched.
- [historical] PR #52 and safe-stop publication records remain evidence; the original branch stays immutable.
- [not-started] T20 Meal Composition V2 (blocked until `T19_COMPLETE`).

## Google Safari profile recovery + registration-only Turnstile

- [done] Reproduced normal-profile failure and private/clean-profile success in
  WebKit; isolated the failure before backend OAuth at the service-worker/GIS
  request boundary.
- [done] Changed the PWA worker to bypass all cross-origin requests and reject
  same-origin uncached network failures without returning null.
- [done] Kept Turnstile mandatory for registration only; removed repeat widgets
  and tokens from login, forgot-password and resend.
- [done] Retained auth rate limiting, resend cooldown, CSRF and OTP security;
  blocked arbitrary register/login resend mail to unknown or verified accounts.
- [done] Focused 124/124, full Vitest 185 files / 4242 tests, lint, typecheck,
  migration smoke, build and diff check PASS.
- [done] Built-candidate WebKit smoke with active service worker: first GIS load
  blocked, retry recovered Google, warning cleared; CAPTCHA frames login 0 /
  registration 1.
- [next] Push branch, open PR, wait for exact-head hosted CI, merge/deploy, then
  run production WebKit and readiness smoke. No migration or configuration
  mutation required.

## T18E — `T18E_OTP_TEST_RECIPIENT_REQUIRED` (2026-09-22)

- [done] Verified stable repository ID, exact base/production `66627ff`, and
  created/pushed `feat/t18e-otp-email-delivery-recovery` without rebasing or
  touching concurrent Google work.
- [done] Confirmed `SEND_EMAIL` binding present; subsequently provisioned the
  operator-supplied `RESEND_API_KEY` as a production Worker secret without
  printing, storing, or committing its value. API authentication PASS.
- [blocked] Current sender authorization and production failure category remain
  UNKNOWN: available Cloudflare OAuth lacks stored Observability/Email Sending
  scope. No root cause was fabricated.
- [done] Hardened Workers Email -> Resend -> fail-closed routing, sanitized
  Resend/Cloudflare classification and structured diagnostics, and unexpected
  exception invalidation.
- [done] Readiness now separates provider configuration from delivery
  verification without sending email.
- [done] Certified registration, failure invalidation, fallback, resend
  recovery, forgot-password anti-enumeration, verify/single-use/expiry,
  Turnstile and no-production-leak contracts.
- [done] Focused 165/165; full Vitest 185 files / 4238 tests; lint, typecheck,
  migration smoke and build PASS. No migration or workflow change.
- [done] Review-only [PR #50](https://github.com/vn-tako1/Frigo-dev/pull/50)
  opened; hosted validate `35685553412` passed on `eec404a`; PR was
  `MERGEABLE` / `CLEAN`.
- [next] Require fresh exact-head CI after the final docs receipt; do not merge
  or deploy.
- [done] Operator completed the DNS correction; Resend reports
  `tungjpstore.net`, DKIM, and both SPF-purpose records as verified.
- [blocked] Verify the fixed sender in Cloudflare Email Service and supply an
  authorized test inbox before real delivery can be certified. See
  `T18E_OTP_DELIVERY_RECOVERY.md`.

## T18D — `T18D_READY_FOR_REVIEW` (2026-09-22)

- [done] Stable-ID/base gate; CI #151/staging #53 success, production skipped;
  branch pushed from exact `07ace57241f8270b2458610979c709bb69b9a65a`; implementation freeze `d3ef61c`.
- [done] Four original findings and **seven** additional scoped P2s fixed;
  independent review open P0/P1/P2 = **0/0/0**; two P3 observations deferred.
- [done] 27-screen semantic review: **14 PASS / 13 PASS_WITH_NOTE / 0 FAIL**.
- [done] Focused browser **14/14 PASS in 42.8s**, strict axe violations **0**; final
  repository logs pass with **185 files / 4226 tests in 333.25s**.
- [done] Settled full matrix: **349 PASS / 5 intentional skips / 0 FAIL**,
  354 cases in 23.3m; all **84 T18D cases PASS**. Strict axe violations **0**
  across 162 canonical checks. Duplicate breakpoint instances alone skipped;
  log `.hoplite/artifacts/t18d/final/matrix-settled.log`, artifacts under
  `.hoplite/artifacts/t18d/final/matrix-settled/`. The prior run stopped near
  case 158 on pre-settle scan-review opacity/receipt enable sampling; parent
  patched a 350ms wait after async CTA enable, with no axe/token changes.
- [done] Fresh style residuals **39/0**, contrast **33/33**, lint/typecheck and
  `git diff --check` PASS after test-only settle correction.
- [done] Review-only [PR #49](https://github.com/vn-tako1/Frigo-dev/pull/49)
  OPEN; publication checkpoint `fe1b5d4` pushed. Auto-fix enabled, auto-merge off.
- [next] Hosted CI/review settlement; initial `validate` IN_PROGRESS in run
  `35677663372` at 01:57 UTC, no unresolved threads then.
  No merge/deploy. VoiceOver/NVDA NOT PERFORMED. See
  `T18D_HUMAN_STYLE_A11Y_REVIEW.md` for exact evidence.

## Historical T18C receipt

**Previous: T18C_READY_FOR_REVIEW**, application freeze `6f8f6f4`.

- [done] Existing branch/repository ID `1368281478` preserved; matching upstream,
  unchanged base, pre-existing workspace settings excluded.
- [done] Supplied source verified; 27/27 direct comparisons with fresh six-width
  evidence. **2 PASS / 25 PASS_WITH_DOCUMENTED_DIFFERENCE**, no unresolved P0/P1/P2.
- [done] Browser **379 PASS / 11 intentional skips / 390 unique**; 162 canonical
  + 449 regression screenshot files; zero strict axe violations or overflow.
  Five unfinished cases recovered after outer timeouts; full manifest reconciled.
- [done] Serial final `pnpm lint`, `pnpm typecheck`, `pnpm test` (**184/4222**),
  `pnpm check:migrations`, `pnpm build`, style residuals (**39/0**), contrast
  (**33/33**), worktree and base-to-HEAD `git diff --check` PASS.
- [done] Preserve baseline, failed Home zoom run, interrupted contention logs
  and final evidence separately. No test timeout/coverage weakening.
- [done] Review-only [PR #48](https://github.com/vn-tako/Frigo-dev/pull/48)
  opened from published checkpoint `321824d`; CI/review auto-fix enabled,
  auto-merge disabled. No merge conflict or initial review feedback.
- [done] Hosted `validate` SUCCESS on `289d80a`, run `35578662531`; no review
  feedback/unresolved threads; `MERGEABLE` / `CLEAN`. Final release audit found
  no introduced migration/configuration action. Style/contrast/diff rechecks PASS.
- [pending] Owner merge permission after latest-head CI stays green; this
  readiness receipt changes docs only. Human VoiceOver/NVDA not performed.
  Auto-merge remains disabled. No merge, deploy or T18D.

See `T18C_VISUAL_CERTIFICATION.md`, `HANDOFF.md`, and
`.hoplite/artifacts/t18c/EVIDENCE.md` for exact checks, failures and next action.

## Historical continuation checkpoints (superseded)

- [done] Final combined run exposed Home 1024px/200%-text P2 (46px overflow):
  **378 passed / 11 intentional skips / 1 failed**. Rem-based wrapping fix plus
  unchanged zoom gate and new region-stacking check: **12/12 focused PASS**.
- [in progress] Preserve failed run, regenerate all 390 cases in isolated
  viewport groups and repeat full repository gates after the Home correction.

- [done] Final unfiltered repository gates on `b024b0d`: **184 files / 4222
  tests**, lint/typecheck/migration smoke/build/diff-check; style 39/0,
  contrast 33/33. Evidence: `repository-gates.zip`.
- [in progress] Finish final six-viewport browser run and post-fix visual review,
  then publish review-only PR. No merge/deploy/T18D.

- [done] Explicit 44px native target bounds; unchanged strict gate plus keyboard
  and flag-off checks: 14 PASS / 1 intentional project skip. Final rerun next.

- [done] Independent review P2: remove inert non-recipe Week title buttons;
  regression 2 red → 5 green, flag-off routed browser 1 PASS, re-review clear.
- [in progress] Restart final gates and 390 browser cases after that correction;
  preserve interrupted 384-case attempt as non-final evidence.

- [done] Close evidenced keyboard/checked-state gaps in inventory, recipes,
  shopping, shell and legacy Week controls; focused units 37/37, browser
  12/12 plus sibling-action follow-up 1/1, typecheck/ESLint/diff PASS.
- [in progress] Fresh full gates and unfiltered 384-case browser certification;
  final artifacts remain separate from the immutable baseline.

- [done] Direct approved-source comparison of 27 identities and evidence-led
  keyboard, semantic and responsive corrections; no protected business change.
- [done] Focused browser gates 43 passed/5 intentional skips, 18 passed,
  supplemental boundary 1 passed; fresh typecheck passed. Logs retained in
  `.hoplite/artifacts/t18c/fix-verification.zip`.
- [pending] Final combined browser/matrix, native gates, screenshot review,
  certification report and review-only PR. No final readiness claim yet.

## T18C — final redesign certification — SAFE PAUSE (2026-09-21)

**STATUS: `T18C_PAUSED_SAFE`** — implementation halted by owner instruction;
all valid work committed/pushed; resume per
[T18C_WIP_HANDOFF.md](T18C_WIP_HANDOFF.md).

- **IN PROGRESS:** 27/27 identities baselined at six widths (route/overflow/nav
  162/162); 11 identities have applied semantic fixes awaiting the rerun.
- **BLOCKED:** Direct approved Takosan OS source absent; 0/27 boards compared.
  Reconstructed registry and legacy Frigo kit cannot certify visual parity.
- **Next:** Baseline checkpoint, evidence-led semantic corrections, final
  responsive/state/a11y/gate runs and durable screenshot/report publication.
  [Registry and findings](T18C_VISUAL_CERTIFICATION.md). No merge/deploy/T18D.

## T18B — payment authority unification — `T18B_READY_FOR_REVIEW` (2026-09-21)

- [done] Final review P1 fixed from exact HEAD `0926222`: current price table
  governs new offers only; persisted issued intent governs status, signed
  callback matching, replay and entitlement. Operational prices unchanged.
  Strict persisted structure/expiry/status, client amount isolation and atomic
  once-per-order grants retained. New price-change/malformed-row regressions:
  focused **151/151**, including **65** server payment tests; full `pnpm test`
  **183 files / 4217 PASS**, browser six-width **48/48**, lint/typecheck/migration
  smoke/build/diff checks PASS. Exact commands, failures/recovery and new-head
  publication boundary are recorded in the T18B report.
- [done] Repository ID/main/clean tree/hosted CI/overlapping PR gates; branch
  `feat/t18b-payment-authority` from `13ff3f22082fc0601a81b90c96edded4741194ac`.
- [done] Audit and ADR-029; retained server prices 49000 monthly / 499000 annual
  VND. One server contract now drives metadata, intent and verified PayOS QR.
- [done] Atomic idempotent webhook grants, provider failure handling, owned
  status reads, retired shared-secret grants and client/session anti-tampering.
- [done] Checkpoints `2aba91a`, `c00ea9f`, `1cef30b`, `1aabd32` pushed;
  PR #47 OPEN with CI/review auto-fix, auto-merge disabled.
- [done] Focused 121/121, browser 48/48 plus final error-state 4/4, style/checkout 38/38;
  lint/typecheck/migration smoke/build/diff check PASS. No remaining security findings.
- [done] Full rerun **183 files / 4185 tests PASS**, after correcting the first
  run's semantic-style failure in source without weakening coverage.
- [done] Readiness follow-up: CI `35554499704` passed at `2d6ff5a`, no review
  threads. Fixed exact-origin VietQR CSP and retired-secret readiness warning;
  new CSP regression red then green, focused 104/104, browser 48/48 under real
  image policy, lint/typecheck/migration smoke/build/header parity/full-diff check
  PASS. New-head CI is independently verified on the PR before merge readiness.
- [limit] No real payment or live-provider certification. Provider setup and
  callback delivery are separately authorized release prerequisites. No merge,
  deploy, remote D1, new migration or unrelated protected-code change.
- [next] Owner review/merge permission once final-head CI is green; no local blocker.
  See [T18B audit and evidence](T18B_PAYMENT_AUTHORITY_REPORT.md).

## T18A — auth resend expiry contract — `T18A_READY_FOR_REVIEW` (2026-09-21)

- [done] Verified repository ID `1368281478`, exact main `51d0d3755d83b64185066228d98f44ab7bad5e3c`,
  hosted main CI and absence of overlapping auth PRs; preserved unrelated
  platform settings and created `feat/t18a-auth-resend-expiry-contract`.
- [done] Server contract `88096cb7fbea8e3b95f5627ff5a46e8c3d34b462` and client
  integration `47c3a3391e086caf2760b61ee4e2bfacd331cacf` committed/pushed;
  explicit security fixtures `53f9fefdc9d935bb736a37cdcd9f5b0d0479685e` pushed.
- [done] TTL storage/response parity, register/login/forgot-password purpose
  behavior, malformed/failed/offline resend truth, refresh and stale-response
  isolation covered. Review found no actionable security issue.
- [done] Final auth/security 300/300, full Vitest 180 files/4117 tests, browser
  42/42; lint, typecheck, migration smoke, build, `git diff --check` passed.
  Browser launch dependency fixed; initial full-suite time budget exhausted,
  extended final full run passed with two workers and no filters.
- [done] New PR #46 OPEN with auto-fix subscription; no merge/deploy. Billing,
  payment UI/behavior, migrations and non-auth Worker diffs zero.
- [next] Final-head hosted CI and human review only; no local blockers.
  See [exact evidence and next action](T18A_AUTH_RESEND_EXPIRY_REPORT.md).
  Do not revisit T17B history or fold in the T18B payment mismatch.

## Current T17B — contract reconciliation — `T17B_COMPLETE` (2026-09-20)

- [done] Rebuilt from exact main `858759f` on
  `feat/t17b-contract-reconciliation`; application HEAD `0f358f2`, certification
  checkpoint `00594eb`; did not modify PR #44 or the old branch.
- [done] Route-owned onboarding screens 04–06 with direct load, refresh,
  Back/Forward, native input semantics, a client-only `today`/`week`/`both`
  planning goal on screen 06 (never sent to `/preferences`; `week` →
  `/week/setup`), unclamped household size (stored `7` round-trips as `7`,
  shown as "5+"), a review of server-stored preferences, and
  server-confirmed completion for authenticated sessions. The existing
  offline-guest path intentionally completes locally. Exactly seven cuisine and
  nine restriction chips are visible, both with `other`; stored values outside
  those chips (including `italian` and `vegetarian`) and independent spicy level
  round-trip unchanged.
- [done] Hardened `/auth/verify` context ownership, shape, expiry truth,
  nullable delivery truth, failed-replacement cleanup, route/cancel/identity
  cleanup, verification-exit loading reset, stale async handling, and credential
  non-persistence while preserving server authority and guest transfer.
- [done] Reconciled the 27-screen registry to reviewer-verified contracts and
  concrete multi-field proof; clean six-width certification **18/18 PASS**.
- [done] Final gates: focused auth **102/102**, verify/onboarding **39/39**,
  full Vitest **180 files/4087**, T13 **60/60**, clean T17 **216 pass/6
  intentional skips**, automated accessibility **12/12 across six viewports**,
  residual **43/43 allowlisted/0 unjustified**, contrast **33/33**, plus
  lint/typecheck/migrations/build/whitespace PASS.
- [done] Added settled OTP and onboarding evidence; clean source and validated
  232-entry/180-PNG ZIP paths and hash are in `docs/ai/T17_UI_V2_REPORT.md`.
- [done] Preserved boundaries: zero `src/worker`, protected payment, migration,
  production-infrastructure, staging-deployment, or deployed-production-state
  change. The intended frontend auth/onboarding behavior changes are documented
  above.
- [done] Corrective documentation review and checks passed: whitespace,
  required markers, protected zero-diff boundaries, and full ZIP/manifest/hash
  revalidation. The first ad hoc manifest check used the wrong command-field
  name; the corrected check passed with no artifact defect.
- [done] Restored the repository-owned Preview settings after inference changed
  them, ran the isolated `security-preview.mjs` path at exact remote checkpoint
  `f901b02`, and verified screens 04–06 at 390x844 with supported synthetic
  reset/login. The initial inferred `pnpm dev` path lacked the isolated API and
  guest creation returned 500; the recovered Preview was ready and the verified
  onboarding flow reported no page errors.
- [done] Opened replacement PR #45 against exact main `858759f` from remote
  checkpoint `f901b02`; the auto-fix CI/review loop is enabled. PR #44 remains
  untouched. This publication receipt changes documentation only.
- [done] Final merge-readiness receipt: publication head `1cacd0b` is
  `MERGEABLE / CLEAN`; hosted validate run `35532565549` passed; reviews, review
  comments, conversation comments, and unresolved human feedback are empty.
  The local pass reran focused auth/onboarding/session tests **74/74**,
  changed-file ESLint, typecheck, ZIP integrity/hash, protected-boundary checks,
  and `git diff --check` successfully.
- [done] Post-review fix `56fc01b`: restored screen 06 planning goal
  (`primary-goal` radios, client-only, `week` → `/week/setup`) and removed the
  household-size clamp. Reran focused 87/87, Vitest 180 files/4094, registry
  18/18, full T17 216/6/0, lint/typecheck/migrations/build/diff-check PASS;
  worker/migration/payment diffs 0.
- [limit] `PRE-EXISTING PROTECTED AUTH-CONTRACT BLOCKER`: registration returns
  `expiresInMinutes: 10`; resend returns no fresh expiry. The client records
  unknown, and a server/API owner must resolve the contract separately.
- [limit] `PRE-EXISTING PROTECTED PAYMENT-AUTHORITY BLOCKER`: frontend/VietQR
  prices are `599000`/`79000`, server payment-intent authority is
  `499000`/`49000`, and the QR amount is frontend-prop-owned. A separately
  authorized payment owner should align all three; T17B made no payment change.
- [next] PR #45 is ready for the authorized user's merge decision when the
  documentation-only readiness checkpoint retains green/CLEAN exact-head
  provider status. Direct board comparison and the NVDA/VoiceOver walkthrough
  remain pending; neither has a named assignee or tracking issue in this
  repository. No deployment is authorized by T17B.

## Previous T17 — Takosan UI V2 redesign — `T17_PARTIAL` (2026-09-19)

- [done] Baseline gates on live main `769d08597563f816ef9c1dd9523fdafb687de3e2`: lint, typecheck, vitest 178 files / 4046 tests, migration smoke (sqlite3 CLI installed per repo setup), build — all PASS; branch `feat/t17-takosan-ui-v2` created; `main` untouched.
- [done] Audit recorded in `docs/ai/T17_UI_V2_AUDIT.md` (routes, migration map, Frigo leaks, phone wrappers, Week/Planner + settings + notification overlap, fake-flow survey).
- [done] Semantic design system: `--semantic-*` tokens + tailwind `semantic-*` family, kit type/radius/shadow scales, `motion@13.4.0` with reduced-motion provider, shared primitives (Page/PageHeader/Switch/SettingsRow/StatusBadge/UnavailableState/…).
- [done] AppShell V2: bottom nav / 80px rail / 256px sidebar from one navigation model, immersive-only hiding, real links + `aria-current`; legacy `BottomNav` retired with migrated equivalent test.
- [done] Settings IA split (screens 19-26) on real server contracts; inbox/preferences separated; fabricated household invite/join/QR and privacy export/delete fakes replaced with honest unavailable states.
- [done] Planner canonical (flag-gated) with param-preserving Week redirects; onboarding step routes; phone-width emulation removed from 20+ shell pages; fixed CTAs clear the nav/rail/sidebar; Landing/Auth h1 fixes.
- [done] Brand cleanup: zero `emerald-*`, zero user-visible "Frigo Plus"; VietQRModal copy rebranded presentation-only.
- [done] Gates after implementation: lint PASS, typecheck PASS, `pnpm test` 178/4046 PASS, `pnpm check:migrations` PASS, `pnpm build` PASS, T17 Playwright **33/33 PASS** at 390/768/1440.
- [done] PayOS/payment zero application change certified: `git diff 769d085 -- src/worker` empty; payment path diff presentation-only.
- [limit] `T17_COMPLETE` not claimed. Remaining: AuthPage (930 lines) decomposition, per-screen motion/semantic-token migration, visual matrix at 360/430/1024 + state classes + canonical screenshots, full a11y pass. Exact list in `docs/ai/T17_UI_V2_REPORT.md`.
- [safety] No merge, deploy, D1/migration, PayOS, Inventory Truth, OCR/AI, recipe-authority, or planning-algorithm change. Production untouched.

### T17 continuation 2 (same day)

- [done] AuthPage decomposed into `features/auth/*` components with mode-presence transition; security semantics byte-compatible (Turnstile single-use tokens, GSI retry/width, DEC-012 deferred transfer, private-session capture); auth suites **11/11 PASS**.
- [done] No-op animation utilities retired (zero `animate-in`/`zoom-in-95`/`slide-in-from-*` remain); overlay/toast/step entrances now use reduced-motion-safe utilities.
- [done] T17 visual suite extended to all six certification widths; canonical screenshots of 17 surfaces captured at 390/768/1440; destructive-dialog focus and empty-inbox honesty asserted.
- [done] Real 360px `/shopping` horizontal overflow found by the matrix and fixed (`min-w-0` on quick-add controls).
- [done] Gates after continuation: lint PASS, typecheck PASS, vitest **178/4046 PASS**, migration smoke PASS, build PASS, T17 Playwright **42/42 PASS** at certified widths (full matrix green).
- [limit] Still `T17_PARTIAL`: per-screen `transition-all`/motion-primitive migration, semantic-token migration of legacy-styled pages (Home/Inventory/Recipes/Week fallbacks/scan/cooking), partial state-class matrix, and human design review of screenshots.
- [safety] Worker/PayOS diff zero; `main` untouched; production untouched.

### T17 continuation 3 (same day)

- [done] All 86 `transition-all` utilities replaced with the scoped `transition-tap` token (explicit property list; zero remain).
- [done] Motion stories: cooking-step directional Slide, inventory AnimatePresence/layout keyed by server identity, scan crossfade verified reduced-motion-safe.
- [done] State-class matrix: bottom sheet, honest offline banner (browser events), 200% text zoom survival added to the T17 suite.
- [done] Real 200% zoom overflow defects found and fixed (nav min-content, Profile/Home truncation, RecipeCard/IngredientRow wrapping, inventory search `min-w-0`); probed clean at 390/360 desktop + mobile emulation.
- [done] Gates: lint PASS, typecheck PASS, vitest 178/4046 PASS, migration smoke PASS, build PASS; T17 matrix green (two test-code defects fixed test-only and re-verified 12/12 at all six widths).
- [limit] Still `T17_PARTIAL`: 856 `slate-*` sites on legacy pages (kit permits `takosan-*` brand aliases), human screenshot review pending, T13 Playwright suite never run in this environment.
- [safety] No product-code change after the full-suite run; worker/PayOS diff zero; production untouched.

### T17 continuation 4 — full-diff code review (same day)

### T17 continuation 5 — release preparation (same day)

- [done] P1: kebab-case Tailwind `semantic` keys — 25/28 semantic utilities were compiling to nothing; guard test added; built-CSS audit 28/28.
- [done] Fresh canonical screenshots at 390/768/1440 inspected; T17 suite 51/51 at those widths; vitest 178/4047; lint/typecheck/build PASS.
- [done] PR opened `feat/t17-takosan-ui-v2 → main` with verification evidence; CI hosted tracked.
- [operator] Merge → main CI → staging auto-deploy → manual production dispatch (`DEPLOYMENT.md` §Production gate). Agent does not deploy (rule 19).

- [done] 4b second pass: FoodPreferences no longer flips onboarding client-side; per-nav indicator `layoutId`; dev-OTP autofill is a `<button>`.
- [done] First local T13 Playwright run: 54/60 → **60/60** (logout test target `/profile`→`/me`; presentation test's fake-onboarding shim replaced by the real flow — pre-existing failure confirmed on base).
- [done] Full T17 matrix: 360 16/16; other widths 82 pass + 2 by-design skips; one test-only `networkidle` stall fixed and re-verified 12/12 at all six widths.

- [done] Reviewed all 76 changed files against base `769d085` for routing, tenancy, honesty, a11y, motion and fixed-layer defects.
- [done] Fixed P1: unscoped query keys on new settings pages (tenancy leak risk) → scoped `queryKeys` + invalidate-after-write; offline planning save falsely reporting success → pending-sync state; offline planning read hanging → unavailable state.
- [done] Fixed P2: TopBar hub detection/legacy nav targets; `/scan/*` review workspaces wrongly immersive + ReceiptReview CTA/nav collision; auth label/OTP/reveal/autocomplete a11y; Switch `aria-describedby` + transform thumb; BottomCTA/StickyActions under the mobile nav.
- [done] Fixed P3: fabricated household status badge; inventory row enter/exit motion. Test-only: screenshot spec `networkidle` stall.
- [done] Gates: lint PASS, typecheck PASS, vitest 178/4046 PASS, migrations PASS, build PASS, focused UI/auth 65/65, T17 regressions re-verified 6/6. Worker diff 0.
- [limit] Still `T17_PARTIAL`: 856 `slate-*` sites, human screenshot review, T13 Playwright local run.

## Current T16 follow-up — PWA cache and Google recovery deployed (2026-09-19)

- [done] Confirmed live `/auth` and `/sw.js` were edge-cache hits and production still served fixed cache `takosan-pwa-v2`; repository path mismatch was `/sw.js` registration versus `/service-worker.js` header rule.
- [done] Added release-SHA Service Worker cache/version injection, SHA-qualified registration with bypassed update cache, load/online/foreground checks, prior-release eviction, best-effort one-time navigation of stale open clients after claim, and fetch-lifetime-safe cache writes.
- [done] Corrected effective cache policy: HTML and `/sw.js` no-store; hashed `/assets/*` explicitly unsets the global header and is one-year immutable; manifest retains its intended one-hour policy.
- [done] Hardened Google GIS rendering with a numeric clamped width and an explicit retry-script failure/referrer path; added blocked-script -> successful-retry coverage.
- [done] Extended protected deploy smoke to wait for exact-SHA readiness first, then verify `/auth`, `/sw.js`, hashed-asset cache headers and the exact SHA embedded in `sw.js`.
- [done] Independent release review findings were remediated. Local Wrangler effective-header check passed; two-release Chromium check showed no extra clean-install document request and exactly one update navigation, new controller/cache only.
- [limit] Closed, suspended, or browser-blocked legacy tabs cannot be forced by a deployment; reload/reopen/navigation is the reliable recovery boundary. Awaiting same-client navigation during activation was rejected because it deadlocks the document fetch.
- [done] Gates PASS: focused **116 tests / 3 files**, full **178 files / 4046 tests**, lint, typecheck, migration smoke, production build, shell syntax and diff check.
- [done] PR #42 head `54dd81b...` passed CI `35415335137`, merged as main `6a016f1...`; exact-main CI `35415536459` and staging Deploy `35415763483` passed.
- [done] Protected production Deploy `35415843682` passed on Worker `2f228dc9-d97b-4eb1-8cff-9a0f2df3b51c`, D1 38/0038, recipe `shadow/0/false`.
- [done] Live verification: exact readiness SHA, `/auth` and `/sw.js` no-store, exact SHA embedded in the worker, hashed asset immutable, clean Google popup, exact-SHA controller and sole matching cache.
- [pending] Manual real-inbox OTP receipt only; do not record or expose the OTP value.
- [safety] No migration, D1/R2/customer-data mutation, PayOS/payment change, Canary activation, full D1 cutover, Inventory Truth change or Week change.

## Current T15C-D — production 1% Canary certification — safe stop (2026-09-19)

- [done] Resolved repository ID `1368281478`, fetched exact main `347b536950cf54d25a2d6a880c3c2cb3d8c8f329`, verified clean tree and merged PR #38/#39, and created `codex/t15c-production-canary-1pct` from canonical main.
- [done] Verified exact-main CI `35409762462` and automatic staging Deploy `35409964105`: SUCCESS, staging `static/0/false`, production SKIPPED.
- [done] Fresh baseline PASS: frozen install, recipe seed/import, typecheck, lint, migrations through 0038, build, full Vitest **178 files / 4044 tests**, diff check.
- [done] Public production audit: Worker `6c336889-680d-4cc3-b03b-1007849aa738` / SHA `b41aa468...`; readiness config-valid, DB/queue/email OK; recipe authority receipt `shadow/0/false`; 5/5 lists = 71 and D1-only samples remain 404.
- [blocked] Mandatory operator-owned INCLUDE + EXCLUDE household pair was not supplied. Local Wrangler is unauthenticated, so the fresh direct D1/tail certification and cohort secret provisioning are unavailable. No customer IDs were inspected and no production mutation occurred.
- [status] `T15C_D_BLOCKED_AUTHORIZED_TEST_HOUSEHOLDS_UNAVAILABLE`; final production remains `shadow/0/false`. Receipt: `docs/ai/recipe-catalog/T15C_D_PRODUCTION_1PCT_CANARY_CERTIFICATION.md`.
- [done] Receipt commit `16958c6...` passed CI `35410893001`; PR #40 merged as `763d7e9...`; exact-main CI `35411093064` and automatic staging Deploy `35411300235` passed with `static/0/false` and production skipped.
- [next] Supply both authorized household IDs privately and authenticate the Cloudflare operator session; then repeat D1 certification, provision hashed secrets, prove retained-secret Shadow, run only 1% protected Canary, certify both cohorts/E2E, and rollback to Shadow. No 2%, 5%, full D1, media, or T14G.

## Current T15C-C — authorized canary test cohort mechanism (dormant) — 2026-09-19

- [done] `packages/recipes/src/recipe-canary-cohort.ts` + `src/worker/services/recipe-authority.ts`: server-side override for operator-owned test households — `RECIPE_CATALOG_TEST_COHORT_ENABLED` / `RECIPE_CATALOG_TEST_INCLUDE` / `RECIPE_CATALOG_TEST_EXCLUDE` (Worker secrets; SHA-256 digests of `recipe-catalog-test-cohort:<householdId>`, never raw IDs). Precedence exclude > include > deterministic FNV bucket; disabled by default; canary+cutover only; zero effect in static/shadow/d1 or without a tenant; every malformed/half-applied shape fails closed in canary mode (`CONFIG_RECIPE_CATALOG_TEST_COHORT` fatal; static + loud diagnostic at request time). **R1 remediation:** cohort variables are inert in static/shadow/d1 (rollback = single mode change, no secret cleanup — P1 resolved) and an active cohort requires BOTH an include and an exclude household (`TEST_COHORT_PAIR_REQUIRED` — P2 resolved). Request input cannot reach it. `fnv1a32`/`recipeCanaryBucket`/thresholds unchanged.
- [done] Tests: 25 unit + 4 HTTP (request-control attempts, guest, static/shadow) + workflow/wrangler/manifest guardrail; no migration, no workflow change.
- [status] `T15C_AUTHORIZED_TEST_COHORT_READY` — NOT `T15C_CANARY_COMPLETE`. Production still `shadow / 0 / false`; no deploy/config/D1/R2 change. Receipt: `docs/ai/recipe-catalog/T15C_AUTHORIZED_TEST_COHORT.md`. Previous safe stops (T15C-B, `T15C_PRODUCTION_CANARY_SAFE_STOP.md`) remain valid history.
- [next] Operator supplies the two authorized households → digests as production secrets → T15C-B 1% canary through the protected workflow (separate authorization).
## Current T15C — production Canary safe stop (authorized cohort unavailable) — 2026-09-18

- [done] Fresh audit on canonical main `b41aa4682481447795350fc1a9eeb1e80887bd0e` (resolved by repository ID 1368281478): seed/import/typecheck/lint/check:migrations(0038)/build PASS; full `pnpm test` 176 files / 4008 tests PASS.
- [done] Read-only public production audit: readiness commit == main `b41aa468…`, database ok, 5/5 catalog reads = 71 deterministic, legacy IDs 200, D1-only IDs 404. Latest production Deploy receipt 35404106102 = `shadow / 0 / false` on that exact SHA (helper convergence 2 attempts).
- [stop] No operator-owned inside-1%/outside-1% production test cohort and no Cloudflare credentials in this environment; no customer IDs inspected; no dispatch/approval/D1/R2/config change. Classification `T15C_CANARY_BLOCKED_AUTHORIZED_COHORT_UNAVAILABLE`. Receipt: `docs/ai/recipe-catalog/T15C_PRODUCTION_CANARY_SAFE_STOP.md`.
- [next] Operator provides both authorized cohorts + read-only CF credentials + Environment reviewer; resume at exactly 1% via the protected `deploy.yml`; no widening beyond the 1→2→5 ladder, no `d1`, no media/R2, no T14G.

## Current T16 follow-up — OTP sender and guest account gate release candidate — 2026-09-19

- [done] Reproduced the production email-provider failure through the real Cloudflare Email Service binding: sender `no-reply@frigo.tungjpstore.net` is unauthorized because the subdomain is not onboarded separately.
- [done] Proved the onboarded apex sender path: `no-reply@tungjpstore.net` was accepted by the same binding and returned a provider `messageId`; real OTP inbox receipt remains pending.
- [done] Changed the transactional sender to the onboarded apex and sanitized the known provider error as `sender_not_verified`; no recipient, OTP, subject, or provider exception text is retained in logs.
- [done] Hardened resend: optional KV cooldown failure no longer blocks recovery, failed delivery clears the cooldown best-effort, unexpected failures return `503 OTP_RESEND_UNAVAILABLE`, and the frontend requires a fresh Turnstile token for each resend.
- [done] Added guest account gates: guest `/plus` hides prices and payment UI, presents an explicit login CTA, and preserves `/plus` through a safe local `returnTo`; the guest profile upgrade CTA points to the same auth flow.
- [done] Preserved authenticated Plus behavior and left PayOS, billing, checkout, payment webhooks and settlement untouched.
- [done] Added regression coverage for the apex sender, provider-error sanitization, KV outage, Turnstile token renewal, guest Plus gate, guest profile CTA, and authenticated Plus visibility.
- [done] Application/test checkpoint committed as `31006994849ee9f6d78ae6114f82d77d41efc784`.
- [done] Local gates: focused **86 tests / 4 files**, full `pnpm test` **176 files / 4008 tests**, lint, typecheck, migration smoke, build and diff check PASS.
- [done] Browser checks at 390x844 and 1440x1000: guest pricing/payment absent, auth CTA correct, auth accessible to guests, `returnTo=%2Fplus` retained, authenticated prices unchanged.
- [pending] Commit/push, exact-head hosted CI, merge, exact-main CI, and protected production deploy with recipe authority fixed at `shadow/0/false`.
- [pending] After deploy, perform one normal-browser OTP request/resend and confirm actual email receipt without exposing the code. Provider acceptance alone is not delivery certification.
- [safety] No migration, D1 write, recipe authority/canary change, Inventory Truth change, Week change, or production infrastructure redesign.

## Current T16 — production + CSP hotfix deployed; OTP receipt pending — 2026-09-19

- [done] Replaced the landing/auth/onboarding loop with one funnel: guest or account on landing; returning accounts enter the app; new accounts complete three preference-only steps once.
- [done] Added migration `0038_auth_onboarding_completion.sql`; `/me` and auth responses expose server-authoritative onboarding state; preferences and completion persist in one D1 batch.
- [done] Migrated OTP delivery to structured Cloudflare Email Service with Resend fallback, sanitized errors, honest 503 responses, and production invalidation of undelivered OTPs.
- [done] Unified Google client ID through `/config` and backend audience validation; retained signed-credential-only production auth and added a real GIS reload state.
- [done] Added/updated auth, email, migration, and UI tests. Full gates pass: lint, typecheck, migration smoke, build, **174 files / 4002 tests**, seed/import checks, local schema gate through 0038, diff check.
- [done with limits] Browser-sized pass at 390x844 and 1440x900 verified landing, three onboarding steps, offline guest completion, registration query entry, and no horizontal overflow. Local GIS reached Google but loopback origin is not authorized; Vite proxy mutation CSRF cannot represent the deployed same-origin path, while direct Worker and integration checks pass.
- [known audit debt] UX audit remains repo-wide FAIL: repository 19 issues / 686 warnings / 47 passed; `src/web/pages` 6 unrelated existing issues / 303 warnings / 15 passed. No T16 landing/auth/onboarding blocker was reported by the audit.
- [done] PR #34 merged as main `d6c981b1a67001b807f03166109f661bc753728c`; PR CI `35385363064` and exact-main CI `35385844667` succeeded.
- [done] Production D1 run `35386276549` applied 0038 only; ledger 38/tip 0038, bookmark `000000d3-00000000-000050ea-709daab542439d8e8fab731b65dab714`, FK/quick-check/drift/media/catalog gates passed.
- [done] Production Deploy `35386532369` succeeded on Worker `c0161a22-1987-42dd-99c4-0a5874d4fadb`, exact main SHA, with recipe authority preserved at `shadow/0/false`; rollback Worker is `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`.
- [done] Production browser smoke at mobile/desktop passed landing, Google provider launch, guest session, reload-safe onboarding, preference persistence, cookie security, and responsive width.
- [done] CSP hotfix `79dfca6483d90fcf33380acfe33f880c1e6ff7a5` permits only the observed Google Fonts/GSI and Cloudflare Insights origins; no wildcard or script `unsafe-inline`. Full local gates remain 174 files / 4002 tests plus focused CSP 3/3.
- [done] PR #35 head `c14a3755d95ddae316d5e6636ef85f9784ac4a54` passed CI `35388666150`, merged as `0cb5d2c08fa24479ecce6b4c4e5f73b31a920ff5`, and exact-main CI `35388963509` passed.
- [done] Production hotfix Deploy `35389274233` succeeded on Worker `e8164168-9566-475b-b0fa-7508368bf3e7`; exact SHA and `shadow/0/false` verified, D1 stayed at 38/0038, and previous Worker `c0161a22-1987-42dd-99c4-0a5874d4fadb` remains the rollback reference.
- [done with limit] Independent mobile/desktop verification found no CSP console violations, loaded Google fonts/GSI, one Google frame, no overflow, and 71 Shadow/static recipes. Cloudflare Insights was policy-allowed but unreachable from the verification network.
- [limit] Real OTP receipt is not certified: automated headed/headless Chrome displayed Turnstile but did not yield a token, no forgot-password request was sent, and the existing account prevents using that address as a new-registration proof.
- [next] In a normal user browser, complete Turnstile on Forgot password for the existing account, submit once, and confirm message receipt without sharing or logging the OTP. No code/deploy action is otherwise pending.

## Current T15C-B — merged control plane; safe stop before production Canary — 2026-09-18

- [done] Merged PR #32 with expected head `a7b3d23f2ad8b48203328116d0e35425390d2127` as `a6e81cd89b9e4c6b923cfc39947b01faf44ff5f3`; PR head ancestor and tree delta 0 files.
- [done] Exact-head PR CI `35344089103` SUCCESS; unresolved review threads `0`; exact-main CI `35347246583` / job `105606601599` SUCCESS.
- [done] Automatic Deploy `35347579284`: release/staging SUCCESS, production SKIPPED; staging Worker `12623f3b-ac64-4255-9fbf-c429b6225e1d`, exact merge SHA, `static/0/false`.
- [done] Read-only production recheck: Shadow/static Worker `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`, SHA `88e8b54d…`, five 71-count checks, legacy 200, reviewed D1-only 404; D1 500 READY.
- [stop] No authorized operator-owned inside/outside 1% cohorts were available; no customer households were inspected and no Canary dispatch/approval was attempted. Classification `T15C_B_AUTHORIZED_TEST_COHORT_UNAVAILABLE`.
- [next] Operator must provide both authorized cohorts. Resume only with exactly 1%; do not widen, enable full D1, populate media/R2, start T14G, or touch Inventory Truth/T09/T11/PayOS/auth. Receipt: `docs/ai/recipe-catalog/T15C_B_AUTHORIZED_COHORT_SAFE_STOP.md`.

## Current T15C-A — bounded canary control plane — 2026-09-18

- [done] Re-verified repository `1368281478` / `frigo-6/Frigo-dev`, main `88e8b54d…`, PR #31 exact head and docs-only tree; exact-head CI `35338372250` SUCCESS.
- [done] Merged PR #31 with expected-head guard as `6f589d0201499a3729d343e42ccb6d19fdff217a`; post-merge CI `35340599941` SUCCESS.
- [done] Automatic Deploy `35340976739`: release/staging SUCCESS, production SKIPPED; automatic staging policy remained STATIC.
- [done] Closed PR #29 without merge with supersession comment.
- [done] Audited existing runtime canary: deterministic household FNV-1a assignment, readiness-gated D1, static fallback, 30s TTL / 5m stale grace; runtime left unchanged.
- [done] Branch `codex/t15c-canary-control-plane` from certified main; implemented bounded `static|shadow|canary` release policy, 0/1/2/5 choices, derived cutover, immutable manifest fields, and validated Wrangler propagation.
- [done] Focused 121/121; full 173 files / 3995 tests; seed/import/lint/typecheck/check:migrations/build/diff-check PASS. No migration or production action.
- [done] Opened Canary wiring PR #32; implementation/receipt head `44c1e80b…` and later docs checkpoint `642b4f8b…` each passed exact-head CI. The authoritative final head/CI receipt is posted on the PR after the last docs commit because a commit cannot contain its own hash.
- [in review] PR #32 remains OPEN; require the PR receipt to show final exact-head CI SUCCESS and zero unresolved review threads, then stop for independent review. Do not merge or activate canary.

## Current T15B-SHADOW — production Shadow certified; stop before canary — 2026-09-18

- [done] PR #30 merged as `88e8b54de121125866b2ff813e56e33277decf1c`; PR head `ad3e1d1656418aaf495b130443d6514926b8bdca` is an ancestor and tree delta is 0 files. Exact-main CI `35336548833` SUCCESS.
- [done] Automatic staging Deploy `35336830786` SUCCESS: staging Worker `580acb76-a006-4c0a-b991-618ebde07e88`, STATIC authority, exact SHA, 71 recipes; production skipped.
- [done] Production Shadow Deploy `35337110268` SUCCESS: release `105574386006`, production `105574426707`, required Environment approval, Worker `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`, exact-SHA convergence 1 attempt / 574 ms.
- [done] Live Shadow certification: 5/5 catalog reads served 71, legacy IDs 200, five D1-only IDs 404; tail diagnostics show Shadow/static, D1 500 hydrated, release `rel-bd00a4f53fcaeee4`, readiness `ready`, zero drift/order/hydration errors, zero Shadow errors.
- [done] Durable receipt added at `docs/ai/recipe-catalog/T15B_SHADOW_CERTIFICATION.md`; rollback Worker `ab8ff038-2aaa-468b-a9de-8c5d94f14052` retained and static config rollback documented.
- [stop] Do not enable canary/full D1/cutover, write media/R2, start T14G, alter Inventory Truth/T09/T11, or merge stale PR #29. Classification `T15B_SHADOW_COMPLETE`.

## Previous T15B-PRE checkpoint — STATIC certified; SHADOW wiring PR ready — superseded 2026-09-18

- [done] Re-verified canonical repository `1368281478` / `frigo-6/Frigo-dev`, main `0fe2cf071693208f6c642d8cbd994f5a79b5a2cf`, and PR #29 remained unmerged.
- [done] Re-read immutable migration receipt run `35329772751`: D1 tip 0037, 500 catalog, release `rel-bd00a4f53fcaeee4`, schema gate PASS, FK `[]`, quick check `ok`, media 500 pending/0 ready.
- [done] Static production Deploy `35333517052`: required reviewer approval, production SUCCESS, Worker `ab8ff038-2aaa-468b-a9de-8c5d94f14052`, exact SHA convergence PASS, live user-facing count 71 across five repeated checks.
- [done] Rollback evidence retained: previous Worker `56979cb5-e1a8-4241-8a4c-2432d41cc439`; rollback contract is `RECIPE_CATALOG_MODE=static`.
- [ready for review] No approved existing Shadow config path was present. PR #30 adds minimal `static|shadow` workflow/config plumbing and tests; implementation head `97aff50d…` exact CI `35335079345` SUCCESS. Require independent review and final docs-head CI. Do not merge or activate in this task.
- [not started] Shadow activation/certification, canary, full D1, media/R2, T14G. T09/T11 and Inventory Truth unchanged.

## Current T14F — T14F_DEVELOPMENT_COMPLETE (T14F-A/B/C certified; production untouched)

- [done] T14F-C: 0037 promoted byte-identical (`68e52e6d…`; 0036 `04228788…` unchanged), shipped manifest 500 / 2 batches (`rel-bd00a4f53fcaeee4`), `ALL_RECIPES` 71.
- [done] Replay fresh 0001→0037 / 0036→0037 / 0034→…→0037 PASS; D1 readiness READY 500; static/shadow/canary/full-D1 PASS; reader 5 statements, no N+1; user flows incl. Batch B VN/CN/JP/KR/TH/IT PASS; T09/T11 unchanged.
- [done] Closure gates (safe stop `44c0ad38…` resolved): lint, build, full test **171 files / 3913 tests**, typecheck, migration smoke, seed/import checks, diff check — PASS.
- [done] Closure blocker fixed forward-only `8c6080aa…` (tests only): real-D1 suites now recycle workerd before its 1 MiB statement cache overflows on the 0001→0037 replay (cloudflare/workerd#5977). Hosted validate on `44c0ad38…` had failed exactly there.
- [done] Second closure blocker fixed forward-only (test config only): docs-only heads passed 171/3913 on hosted CI but exited 1 on a vitest-worker `onTaskUpdate` birpc timeout starved by long synchronous SqliteD1 suites; `tests/helpers/vitest-event-loop-yield.ts` (setupFiles) yields once per test.
- [done] Hosted exact-final-head validate SUCCESS + `T14F_FINAL_CERTIFIED_HEAD` bound in the PR #25 final certification receipt. PR #25 ready for review, **unmerged**.
- [next] **STOP.** Merge = separate decision after independent review. Production rollout, media population and T14G = separate authorization. Production does not contain 500 recipes.
- [P3] Unpaginated `GET /recipes` ≈ 780 KB at 500 recipes — T14G scope, not release-blocking for development certification.

## Historical T14F — T14F_B_SCALE_BATCH_CERTIFIED

- [done] T14F-A pilot certified at `b0150d0…` (routing fix, 171/3911).
- [done] T14F-B resumed: ingredient preflight + 399-concept matrix committed.
- [done] **399 records authored** (`t14f-scale-399-v1`); factory 399/399 publishable, 0 hard dups, 0 unresolved; QA `ok` 0 findings.
- [done] Deterministic double compile (byte-identical) with hashes; candidate-500 (71+30+399=500) composition verified; shipped 101 manifest + 0036 unchanged; 0037 absent.
- [done] Full gates: seed/import/typecheck/lint/migrations/build/test (171 files / 3911) PASS.
- [next] **T14F-C only under separate authorization**: promote 0037 from the artifact, regenerate shipped 500 manifest, 500-authority certification. Do NOT start here.
- [not started] 0037 promotion, 500 shipped manifest, production/media/T14G. PR #25 draft/unmerged.

- [done] Verified repository ID 1368281478, unchanged main, forward-only branch and inherited
  test-only `8079a37`; PR #25 remains draft/unmerged. Preserved timestamp fix `486409c…`.
- [done] Reproduced 5/7 pre-fix routing failure and strict 71/101 COUNT_DRIFT fallback.
  `2ee6f5cc…` verifies generated legacy release, actual sources/diagnostics, cache and cleanup.
- [done] Routing 8/8, growth 21/21, combined 29/29 twice; non-isolated 29/29; subsystem 383/383.
  Seed/import/typecheck/lint/migration smoke/build/full test/diff PASS: **171 files / 3911 tests**.
- [done] Implementation CI **35223589293 / 105209475052 SUCCESS**. Final exact-head
  [receipt](https://github.com/frigo-4/Frigo-dev/pull/25#issuecomment-5714709031) must bind the
  documentation SHA and hosted SUCCESS before it is accepted as the T14F-B base.
- [done] Pilot 30 / release 101 / static 71 / migrations unchanged; complete 101/order 0..100;
  reader 5/no N+1, imported HTTP flows and inventory regressions PASS.
- [next] **STOP**; await separate T14F-B authorization, using only the final certified SHA.
  Exact commands/hashes and receipt protocol: `recipe-catalog/T14F_NEXT_HANDOFF.md`.
- [not started] Ingredient scale preflight, Batch B 399, 0037, 500 release, media population,
  T14G; no production write/deploy/authority switch. Overall T14F is not complete.

## Historical entries (not current T14F status)

## T14F — WIP safe stop — 2026-09-17 (branch `feat/t14f-recipe-catalog-500`, unpushed→pushed checkpoint; pilot NOT certified)

- [done] Pilot 30 (`t14f-pilot-30-v1`) authored, reviewed, T14E-compiled; `0036` promoted byte-identical;
  manifest 101/1 batch; static 71 unchanged; 0001–0035 untouched.
- [done] Safe-stop verification: typecheck, `check:migrations`, seed check, import check, `git diff --check`
  PASS; handoff `docs/ai/recipe-catalog/T14F_WIP_HANDOFF.md`.
- [open, blocker for pilot certification] focused growth suites 20/21: `production forward path
  0034 → 0035 → growth` fails when both growth suites run together, passes alone — fix test isolation
  WITHOUT regenerating data/0036.
- [not done] lint, build, full `pnpm test`, bundle accounting, pilot QA report, Batch B (399), 0037,
  final 500 manifest, PR. Do NOT merge; do NOT start T14G; no production action.

## T14E — merged + main certified — 2026-09-17 (PR #23 → main `f7a55408…`; production untouched; T14F not started)

- [done] PR #23 merged by normal merge (`f7a5540841db27be31cdab9e0c2010cd92bc3861`); `ba1a45d4…` and `7b4edcc8…` in main ancestry;
  tree delta PR head → main = 0; exact-head main validate SUCCESS (run 35182568280 / job 105077715190).
- [done, fresh on exact merge SHA] install, seed check ×3, import check (71/0), typecheck, lint, `migration-smoke=ok` (35, no 0036),
  build, `pnpm test` 169 files / 3889 tests, focused 88, regression 275 + 160, `git diff --check` clean.
- [done] `recipe-catalog/T14E_MERGE_RECEIPT.md`; `T14E_NEXT_HANDOFF.md` finalized (T14F prerequisites, chunking evaluation, release strategy).
- [not done, by design] 0036, real recipe growth, media population, production D1/R2/deploy, authority activation, T14F.
- [next] T14F starts ONLY from `T14E_FINAL_CANONICAL_MAIN` (docs-closure merge SHA). Production 0035 + T14D deploy still
  `PENDING_OPERATOR` per `recipe-catalog/T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`.

## T14E remediation — 2026-09-17 (P1 nutrition evidence, P2 immutable batch hash, P3 manifest telemetry; PR #23 unmerged)

- [done, local-verified] evidence preserved + persisted as ADR-004 profiles; `canonicalBatchProjection` covers all reviewed metadata;
  `RELEASE_MANIFEST_INVALID` error classification; `tests/unit/recipe-import-provenance.test.ts` (11); 169 files / 3889 tests.
- [next] independent re-review of PR #23 → merge → `T14E_FINAL_CANONICAL_MAIN` → T14F per `recipe-catalog/T14E_NEXT_HANDOFF.md`.

## T14E — Bulk Recipe Import Factory + Release Manifest — 2026-09-17 (development complete; PR open, NOT merged)

- [done, local-verified] import factory module + CLI + output policy; 71-recipe Catalog Release Manifest committed and checked;
  manifest-driven growth-ready readiness (legacy baseline protected); synthetic expanded-release READY proof; 500/5000 scale.
- [not done — by design] 0036, real recipes, media population, production/Cloudflare action, authority activation, T14F.
- [next] independent review of the T14E PR → merge → freeze `T14E_FINAL_CANONICAL_MAIN` → T14F per `recipe-catalog/T14E_NEXT_HANDOFF.md`.
  Production debt unchanged (operator dispatch pending).

## T14C/T14D OPS — Production D1 Migration workflow — 2026-09-17 (MERGED main 6910a7b4…; production NOT yet mutated)

- [done] PR #21: `production-d1-migrate.yml` (manual, fail-closed, production Environment) + `d1-migration-check.mjs` (+17 tests);
  schema gate reduced to 5 compound terms (D1 limit); docs. Exact-head validate SUCCESS (35168563076). App tree unchanged.
- [done] local rehearsal of the full migration path on a fresh local D1 (0034→0035: 71/71/0, FK [], quick_check ok, drift none, gate PASS).
- [blocked — dispatch] operator must dispatch `Production D1 Migration` (ref 6910a7b4…, pre 0034, 0035, confirm=true) then
  `Deploy` production (ref 6910a7b4…, hardened bb504cce…, confirm_production=true). Inputs: `recipe-catalog/T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`.
- [not started] shadow/canary/d1 activation; media population; T14E.

## T14D — Recipe Catalog Authority Cutover — 2026-09-16 (MERGED main bb504cce…; T14D_MAIN_CERTIFIED; rollout DEFERRED)

- [done] PR #19 merged (normal merge, head f2831805… in ancestry); main exact-head CI SUCCESS (35157739716);
  local certification 163/3801; receipt `recipe-catalog/T14D_MERGE_RECEIPT.md`; handoff `T14D_NEXT_HANDOFF.md`.
- [deferred — OPS] 0035 production apply, deploy, shadow → canary → d1 progression (config-only, human-controlled).
- [not started] T14E bulk import; media population.

## T14D — Recipe Catalog Authority Cutover — 2026-09-16 (development receipt; PR #19 — merged, see above)

- [done, local-verified] authority snapshot abstraction + static/D1 providers (T14B-B hydration reused); fingerprint +
  strict readiness; modes static|shadow|canary|d1 with cutover fence; deterministic household canary; bounded cache;
  fallbacks + diagnostics; all runtime readers migrated (unknown = 0, guarded); HTTP parity static/d1/canary.
- [not done — by design] production deploy, enabling shadow/canary/d1 in production, T14C 0035 rollout, T14E, media population.
- [next] Independent review → merge → OPS sequence (0035 → deploy static → shadow → canary → d1, config-only).

## T14C — Recipe Media Layer — 2026-09-16 (MERGED to main 3a1e6be6…; production rollout pending operator)

- [done] PR #17 merged (normal merge, head 7b37325f… in ancestry); main exact-head CI SUCCESS
  (35147336385); local certification 161/3776; automatic staging deploy SUCCESS (35147682739).
- [blocked — credentials] production D1 backup + 0035 apply + production deploy + smoke; runbook in
  `recipe-catalog/T14C_MERGE_RECEIPT.md`. Production remains 0034 / Worker 4ed98514….
- [not started] T14C_FINAL_COMPLETION.md, T14C_NEXT_HANDOFF.md (after rollout); media population; T14D; T14E.

## T14C — Recipe Media Layer — 2026-09-16 (development; PR #17 — merged, see above)

- [done, local-verified] 0035 + `recipe_media` schema/invariants/seed; catalog (no N+1) + resolver;
  secure same-origin media route; additive API `media.hero`; frontend resolver on 7 surfaces;
  schema gate/smoke/seed-check extended; 0034 pinned; ADR-025; design doc.
- [not done — by design] media population (71 assets), global prompts (0/12), thumbnail seeding,
  production 0035 apply, deployment. T14D/T14E not started.
- [done, local-verified] independent-review remediation: R2-verified promotion (existence/MIME/size/SHA-256),
  exact SQL storage-key CHECK, `content_length` required for ready; 0035 regenerated (no 0036).
- [next] Independent re-review of PR #17; then rollout: backup → apply 0035 → deploy → populate separately.

## T14B-B — COMPLETE 2026-09-16 (production D1 0034 applied; Worker deployed)

- [done] Cloudflare identity verified (account `ef250a88…0218`, D1 `frigo-db` `f975ec39-…`); ledger 33→34;
  backup exported (SHA-256 `ab082dd4…343c`); `0034` applied; catalog/ordinal/integrity/schema-gate certified.
- [done] GitHub env secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` (staging+production), production
  required reviewer, `STAGING_URL`/`PRODUCTION_URL` vars; Deploy runs 35101845374 (staging) and
  35102115354 (production) SUCCESS; Worker `56979cb5-…` serves `4ed98514…`; smoke green.
- [not started] T14C recipe media layer — handoff `recipe-catalog/T14C_HANDOFF.md`; branch
  `feat/t14c-recipe-media-layer` from the frozen `T14C_CANONICAL_BASE_MAIN`. T14D/T14E not started.

## T14B-B — MERGED 2026-09-16; production rollout BLOCKED (existing OPS secret)

- [done] PR #14 merged → main `c7455160bfc8d279d38bc7ca4c0751542012a3c5`; main CI validate SUCCESS
  (run 35072991882); fresh main gates green (157 files / 3704 tests). Receipt:
  `recipe-catalog/T14B_B_MERGE_RECEIPT.md`.
- [blocked-OPS] Apply 0034 to production `frigo-db` (`pnpm wrangler d1 migrations apply frigo-db
  --remote` after ledger read + backup), verify 71/71/385 + integrity; set `CLOUDFLARE_API_TOKEN` /
  `CLOUDFLARE_ACCOUNT_ID` in the GitHub staging/production environments; dispatch Deploy. Auto
  Deploy run 35073197948 failed on the missing staging token (not a code failure).
- [not started] T14C handoff/implementation — only after rollout closes. T14D/T14E not started.

## Historical — T14B-B remediation FINAL (review-ready)

- [done, local-verified] Persisted canonical `runtime_order`; explicit ingredient positions
  (`recipe_runtime_ingredient_order`); hydrator/static catalog order parity; shadow `orderDrift`;
  migration fingerprint manifest (`tests/fixtures/migration-sha256.json`, 33/33 pinned from
  `c1c1c14a…`); 0034 re-rendered and adopted (checkpoint `d9130b69…`).
- [done] `recipe-d1-runtime-parity` rewritten on actual `D1RuntimeRecipeCatalog` output (no
  reordering): strict-equal list, recommendation, tie-sensitive ranking, planner tie fixture,
  >5-alternative swap regression + executed swap, shadow health; reversed-catalog negative
  controls; mutation check fails 8/11 with an ID-sorting hydrator (`19b144a5`).
- [done] Docs: category = typed open non-empty string, region = closed vocabulary; ADR-024,
  design doc, handoff, PR #14 body updated.
- [next] Maintainer review + protected merge of PR #14 after fresh exact-head hosted `validate`
  (recorded in the PR body). Do not enable shadow in production; no deploy.
- [not started] T14C media · T14D authority cutover · T14E bulk import.

## T14B-B — D1 catalog parity, runtime view & shadow — 2026-09-16 (READY FOR REVIEW)

- [done] Fresh baseline verified: main `c1c1c14a…`, protected, 33 migrations, 71/59/12, D1 59.
- [done] Goal A: `0034` seeds `gl-01..gl-12` (stable IDs) → D1 complete 71, staticOnly `[]`.
- [done] Goal B: fail-closed `hydrateRuntimeRecipes` → 71 `RuntimeRecipe` strict-equal to static.
- [done] Goal C: `recipe_runtime_fields` (typed category/region, legacy nutrition compat);
  image URL legacy-compat only; steps/tags lossless; provenance legacy/unverified/1.
- [done] Goal D: `compareRuntimeCatalogs` + `RECIPE_CATALOG_MODE=shadow` diagnostics; no d1 mode.
- [done] Goal E: recommendation/planner/regenerate/swap/cooking/snapshot compatibility proved.
- [done] Full gates: lint, typecheck, build, migration smoke, seed check, 157 files / 3697 tests.
- [done] Independent review findings (shadow cost bound, description default, Inventory Truth
  test scope) fixed in `0284a96c`.
- [next] PR #14: exact-head hosted `validate`, maintainer review of ADR-024, protected merge.
- [not started] T14C media · T14D authority cutover · T14E bulk import.

## Current T14 integration refresh — 2026-09-15 UTC

- [done] Canonical main before the final docs-only receipt is
  `a165474a623a8130c9a9ed4f1df096b3ac3b3ae9`, verified in `vn-clo/Frigo-dev`
  (ID `1368281478`). Final tip is recorded in the receipt PR's post-merge comment.
- [done] PR #9 Auth/OCR production merge `911db7f` and PR #10 docs-only
  receipt preserved; deployed Worker recorded as `20bc1f35-6ffe-4085-ba79-d54a0b53da71`.
- [done] PR #9/#10 left recipe architecture and migrations unchanged; this
  integration preserves runtime authority while adding the accepted safety library.
- [done] T14A docs semantically reconciled on current main; fresh frozen install,
  lint, typecheck, test (151 files / 3633 tests), migration smoke, build and diff
  check pass; application diff empty and all 33 migration hashes unchanged.
- [done] T14A exact-head hosted run `35034318031` passed on `e916d292`;
  PR #11 merged normally as `fbd14c771070e1b5594532648d79fb60c891747d`.
- [done] Accepted T14B-A delta from PR #8 reconciled on resulting new main;
  PR #12 exact head `3e393741` passed hosted run `35035112092` and all local
  gates (154 files / 3676 tests), merged as `a165474a` through protected flow.
- [done] All 15 accepted functional paths, PR #9 protected files, 33 migration
  hashes and Inventory Truth authority preserved; renderer leaves tree clean.
- [finalization] Publish this docs-only merge receipt, then record final main /
  `T14B_B_BASE_MAIN` in its post-merge comment. Integration prerequisites ready.
- [done] Preserve Auth/OCR ADR-022; renumber imported recipe ADR to ADR-023
  without changing its accepted architecture.
- [not started] T14B-B. No migration 0034, data parity write or authority switch.
- [deferred] Media to T14C; runtime remains static `ALL_RECIPES` (71/59/12).
- [OPS blocked] Deploy `35035612637`: release success, staging missing-token
  failure, production skipped; main CI `35035415271` passed. Not a T14 regression.
- [historical PR] #4 remains open; recommend CLOSE_ARCHIVE, never merge here.
- Checks and next action: `recipe-catalog/T14_INTEGRATION_REFRESH.md`.

# Historical task boards — superseded as current status

Prior “T14 not started”, production baseline and PR #4 merge recommendations
below are retained historical evidence, not instructions for this integration.

## Auth/OCR production hardening — 2026-09-16

- [done] Remove credential-less Google fallback and keep production sign-in
  bound to a real Google Identity Services credential.
- [done] Make GIS initialization resilient to the async script-load race and
  show an explicit retry/unavailable state.
- [done] Add staged OCR pending UX to upload, fridge review and receipt review
  without changing server status or inventory authority.
- [done] Add auth and scan-processing regression tests; focused `54/54` and
  full `3632/3632` Vitest pass.
- [done] Run lint, typecheck, migration smoke, build and diff check.
- [next] Run browser auth/OCR smoke against the exact PR head, obtain hosted CI
  and review, then decide separately whether a production deploy is authorized.

## Production rollout receipt — COMPLETE

- [done] Production D1 migration applied and verified at `0001`-`0033`.
- [done] Pre-migration SQL export recorded (SHA-256
  `378c023b15c159d140162e6eb74bbf2ad584e7b699c72384379119defe6dec6a`).
- [done] Compatibility Worker `64ee9ed1` deployed before schema cutover.
- [done] Canonical Worker `e6b91956484589c088e6d04a9835b3e59a2eb786` deployed
  and readiness verified on the production custom domain.
- [done] Remote schema gate, build, lint, typecheck and full Vitest `3630/3630`
  passed; smoke covered health, readiness, recipes, PWA manifest and auth
  boundaries.
- [blocked] PR #4 must receive hosted CI/review and be merged so the deployed
  compatibility bridge is reachable from canonical `main`.

## Canonical consolidation finalization

- [done] Application integration frozen at
  `5f6853d0ed11415871dca0fd31d4981d60518310`.
- [done] Independent remediation completed; `e34ed167` is historical and
  superseded.
- [done] Canonical promotion branch published as
  `canonical/5f6853d-promotion-ci`.
- [done] Main protection enabled: strict `validate`, no force-push or branch
  deletion, admin enforcement; approval count zero under the recorded waiver.
- [done] PR #2 opened against `main`.
- [done] Hosted CI run `34968469709` passed on pre-docs head `c8acd0aa`.
- [done] Final reviewed head `7ede92c...` passed exact PR CI run `34972891435`.
- [done] History-preserving merge commit `a5cfb14cfd5840be23eb16b26a3689f5e2d6e805` created by PR #2.
- [done] Merge tree matches reviewed head; required source lineage is preserved.
- [done] Post-merge main CI run `34973522150` passed.
- [done] Automatic Deploy workflow made no deployment: staging unconfigured,
  production skipped.
- [in progress] Publish this docs-only post-merge receipt through a separate PR.
- [done] Maintainer accepted external technical review for final head `7ede92c...`
  with P0/P1/P2 = 0; native collaborator approval may be waived only for this
  consolidation.
- [done] Production rollout completed through D1 `0033` and canonical Worker
  `e6b9195`; PR #4 compatibility bridge remains a follow-up.
- [not started] T14.

# Historical production integration remediation — 2026-09-15

## Historical canonical-promotion task — superseded as current authority

- Canonical repository plan: `docs/integration/CANONICAL_REPOSITORY_CONSOLIDATION_PLAN.md`.
- Production rollout plan (separate): `docs/integration/SAFE_PRODUCTION_MERGER_PLAN.md`.
- Promotion branch: `canonical/5f6853d-promotion` at `f48e830`.
- Archive pointer: `archive/pre-canonical-consolidation` at `d1b06732`.
- PR: `vn-dlo/Frigo-dev#1`, base `main`, head `canonical/5f6853d-promotion`.
- Production frontend/platform branches are represented by later production
  lineage; do not cherry-pick `fafe1cc`, `2052932` or `089c406` again.
- Qwen source `da41686` is not in production `main`; integrate it only after the
  compatibility release, from its frozen source SHA.
- Migration numbering decision: preserve production `0001`-`0023`; map the ten
  certified T08-T13 migrations to `0024`-`0033`; no other collision found.
- Release blocker: old production confirmation writes only `is_confirmed`, but
  canonical `0032` requires matching `review_state`; current integrated code
  also cannot run before the evidence columns exist.
- Next production-rollout task: build/test/review a pre/post-0032 compatibility
  release directly from production `05423f2`. After it is independently merged
  and deployed by an authorized operator, run three independently gated trains:
  Qwen/runtime, T08-T13 plus bridge, then Takosan brand-only. Do not deploy
  `f26003b` as-is; repository promotion is governed separately by the canonical
  consolidation plan.
- Fresh audit: source/ancestry/path/migration hashes reverified; both unsafe
  schema orders reproduced with SQLite; docs-only `git diff --check` PASS.
  Full application gates were not rerun because no code/schema changed.
- Hosted exact-head CI has not reported; branch protection is unavailable to the
  current `WRITE` account. Do not merge until hosted CI and admin protection/
  no-deploy controls are reviewed.
- No merge, deploy, remote D1, production resource or PayOS action authorized.

## Historical candidate remediation — superseded as next-action authority

- Reviewed candidate `e34ed16777166407acf67b2c76d733d89c7d64ca` is
  superseded. Remediation commit is `5f6853d` on top of `231d1e7`.
- Qwen production runtime, certified T13 Inventory Truth, hardened Takosan, and
  the additive byte-identical `0024`-`0033` migration bridge are integrated.
- Fixed: protected payment UI restored to production base; real Qwen runtime is
  composed in the queue integration test; truthful missing/0/.11/.9 confidence;
  prior typed runtime error retained; brand tests exclude payment scope.
- Intentional auth difference: certified T13 DEC-012 guest transfer deferral.
- PASS: focused `41/41`; brand `16/16`; full Vitest `3630/3630` (149 files),
  lint, typecheck, migration smoke, build, diff check and browser `60/60`.
- Retained failure evidence: affected matrix first ran `300/302`; both failures
  were over-broad brand assertions against the protected payment files.
- Two intermediate typechecks rejected incorrect `fetch` spy annotations; the
  final typed `MockInstance` form passes typecheck and focused `57/57`.
- Access READY: production `ADMIN`, Frigo-dev `WRITE`, both heads unchanged;
  local `origin` is unrelated `Tungjpstore/yaji`, so publish only to an explicit
  verified production target if separately authorized.
- P3-1/P3-2 deliberately preserved. Hosted exact-candidate CI is absent.
- Next: independently review immutable remediation SHA `5f6853d`. Do not
  merge/deploy/apply remote migrations.

# Takosan brand branch board — 2026-09-14 (independent of T13 board below)

- **TAKOSAN BRAND MIGRATION — application checkpoint `e37ee28` published** on
  `hoplite/megara-hyblaia-6b723eb2` from base `897102b`. Not T13 remediation, not
  T14. T13 freeze `32ddbb4` and main `d1b0673` unchanged.
- Done: kit assets installed, PWA icons generated, brand contract, tokens,
  typography, PWA/HTML metadata, SW cache bump, Landing/Onboarding/Auth/chrome/
  empty+success states, copy rename, 9 branding tests. Gates: Vitest 3480/139,
  browser 60/60, QA matrix clean.
- Next: brand review of the checkpoint; on acceptance remove legacy
  `public/frigo/{brand,app-icons,illustrations}`; maintainer decision on domain.
  No merge/deploy/remote D1/PayOS.

# Frigo task board

## Active integration work (2026-09-15)

- Production + Qwen runtime + certified T13 + hardened Takosan consolidation:
  **IN PROGRESS** on `integration/t13-takosan-qwen`.
- Fixed base: `05423f2ad675006a4c7913e696f1979b3fcaae59`; bridge migration
  range planned as production `0024`-`0033` while preserving production `0023`.
- Current checkpoint: repository/source identity, common ancestry, divergence
  classes, preservation matrix, and migration map recorded under
  `docs/integration/`.
- Next action: integrate Qwen lineage, then resolve T13/Takosan semantically and
  run the local release-candidate matrix. Do not merge/deploy/apply remote D1.
## Current board — T13R certified freeze, 2026-09-14

- **T13 REMEDIATION CERTIFIED — READY FOR INDEPENDENT FINAL REVIEW #2.** Repo
  `vn-blo/Frigo-dev`, ID 1368281478; branch `hoplite/delos-f0bb1d04`;
  **T13R_APPLICATION_FREEZE `32ddbb4f2bb636fdcf201e9ca99c4689d3655477`** (remote
  == local, verified). Main `d1b06732…` unchanged. Rejected `7b7bb69…` **DO NOT
  RELEASE**.
- Freeze = `7e68e3b` application tree + two test/fixture-only commits (`bd2f5f3`
  fixture collision fix after a 3 failed/51 passed browser run; `32ddbb4` new
  P2-B browser reopen spec, RED at `7b7bb69`). Application/migrations/deps/harness
  config byte-identical to `7e68e3b`.
- Blockers P0/P1/blocking P2 **0/0/0**; AC1–AC14 **all PASS**; roadmap rows all
  **DONE**. Gates (pre-freeze and clean detached): full **3471/138**, T13R-A
  **45/5**, T13R-B **171/7**, real D1 **92/5**, browser **60/60**, 32 migrations
  (0031/0032 unchanged, 0033 absent), fresh + legacy populated real D1 replay,
  schema gate, writer/reader UNKNOWN 0/0, diff-check, detached porcelain EMPTY.
  **NO HOSTED CI FOR THE EXACT FREEZE.**
- Next: **INDEPENDENT T13 FINAL REVIEW #2** of `32ddbb4` and its docs head. No
  merge/deploy/remote D1/PayOS/T14/reconciliation. Details:
  [T13R_FINAL_CERTIFICATION.md](inventory-truth/t13/T13R_FINAL_CERTIFICATION.md).

## Historical board — T13R-A complete, 2026-09-13 (superseded)

- **T13R-A COMPLETE — READY FOR T13R-B.** Branch
  `hoplite/oropos-eb2d4886--t13r-a-data-integrity-ownership`;
  application checkpoint `fc0f9c5`; docs head follows. Main `d1b06732…`
  unchanged. Rejected freeze `7b7bb69…` still **DO NOT RELEASE**. This is not a
  final T13 freeze.
- FIXED with red→green permanent tests: P1-1 async evidence, P1-2 canonical
  rename, P1-3 lot-bound draft, P1-4 receipt ownership, P2-A raw evidence
  completeness, P2-B confirmed expiry round-trip. New additive migration
  `0032_scan_evidence_completeness.sql` (32 total; 0031 byte-identical).
- Gates: lint/typecheck/build PASS; **3423/137** full; **45/5** focused T13R-A;
  **92/5** real local D1; **42/42** browser; migration smoke, fresh + legacy
  populated 0031→0032 local D1, schema gate PASS. Writer/reader authority sets
  unchanged from the freeze.
- Next: **T13R-B** — Cloudflare fridge confidence fabrication, inventory
  conflict/refetch UX, Home estimated-expiry qualifier, NULL opened-state truth —
  then a new application freeze and independent recertification. No merge/
  deploy/remote D1/PayOS/T14/reconciliation.

## Historical board — T13R-A safe stop, 2026-09-13T15:50:34Z (superseded)

- **T13R-A CHECKPOINTED, IMPLEMENTATION NOT STARTED.** Branch
  `hoplite/oropos-eb2d4886--t13r-a-data-integrity-ownership` at audit commit
  `b9735b4` (also remote on `hoplite/oropos-eb2d4886`, verified equal). Main
  `d1b06732…` unchanged. Rejected freeze `7b7bb69…` remains **DO NOT RELEASE**.
- All target findings **NOT STARTED**: P1-1 async evidence, P1-2 canonical rename,
  P1-3 lot-bound draft, P1-4 receipt ownership, P2-A raw evidence completeness,
  P2-B confirmed expiry round-trip. No 0032; 31 migrations unchanged.
- `git diff --check` PASS; no code changed, so typecheck/scoped lint/tests are
  intentionally not run. `.hoplite/settings.json` overlay preserved uncommitted.
- Next: implement T13R-A findings one at a time with red/green regressions per
  [T13R_A_REMEDIATION.md](inventory-truth/t13/T13R_A_REMEDIATION.md). T13R-B
  blockers (Cloudflare confidence, conflict UX, Home estimates, opened-state
  truth) remain deferred. No merge/deploy/remote D1/PayOS/T14/reconciliation.

## Current board — T13 independent review failed, 2026-09-13

- **T13 BLOCKED — INDEPENDENT FINAL REVIEW FAILED.** Exact freeze
  `7b7bb695ee597a46cf4022a2c534e2fea374be5d`; reviewed docs head
  `4fcbc96b5a5d4b3cea2c2ad0bdb5682b1866891a`; numeric repo ID 1368281478.
- Fresh gates passed: **3372/132** full, **194/10** focused, **92/5** local D1,
  **36/36** browser, lint/typecheck/build, 31-migration smoke/replay, populated
  legacy upgrade, local schema and diff checks. No hosted exact-freeze results.
- Review found **4 P1 and 6 blocking P2** defects despite those green gates.
  Original AC4/6/10/12 fail; AC9/11 remain partial. R5/R7/R8 and
  U4/U7/U8/U12/U13 are not closed. Do not treat the old DONE table as approval.
- Read [T13_INDEPENDENT_FINAL_REVIEW.md](release/T13_INDEPENDENT_FINAL_REVIEW.md)
  for reproducible findings, evidence boundaries and retained failed probes.
- Next task, not started here: **new T13 remediation branch**, confirmed blockers
  only, new application freeze, independent recertification. Reconciliation,
  merge, deploy, remote D1, PayOS and T14 remain prohibited.
- Application/permanent tests/migrations/harness remain unchanged; this review
  only updates audit/status documents. Earlier board sections are historical.

## Current board — T13 complete, 2026-09-13

- **T13 COMPLETE — STOP for INDEPENDENT T13 FINAL REVIEW.** Repo
  `vn-ca1/Frigo-dev`, ID 1368281478; branch
  `hoplite/mende-26679a14--browser-harness-final-cert`.
- Published/fetched application freeze:
  `7b7bb695ee597a46cf4022a2c534e2fea374be5d`. Separate browser-proven U7 fix:
  `47b10e25d6853a9bc4f9dfcf2e83bc01ba330bf2`. Final checkpoint is docs-only.
- Original **AC1–AC14 PASS**. **R3/R4/R5/R6/R7/R8/R11 and
  U1/U4/U6/U7/U8/U12/U13/U14 DONE**, including both review editors and existing-lot
  metadata edits. Current matrices: [T13 TEST_MATRIX](inventory-truth/t13/TEST_MATRIX.md).
- Pre-freeze and detached full: **3372 tests / 132 files**; browser **36/36** before
  and after freeze at 360/390/430. Focused **194/10**; T08 **130/2**, T09 **1259/17**,
  T10 **98/6**, T11 **39/2**, T12 **22/3**, T13/T13B **271/12**; real D1 **92/5**.
  Static/build/migration/legacy/fresh local replay/schema/diff gates PASS; clean
  detached status EMPTY. Writer/reader UNKNOWN 0/0; 31 migrations, unchanged 0031/no 0032.
- Resolved certification interference: first detached browser 35/36 under concurrent
  source-writing tests; unchanged complete browser suite passed 36/36 serially.
  Exact checks/failures: [T13B_FINAL_HARDENING](inventory-truth/t13/T13B_FINAL_HARDENING.md).
- **NO HOSTED GITHUB CI STATUS FOR T13B_APPLICATION_FREEZE**. No merge/deploy/remote
  D1/PayOS/T14/reconciliation. Main remains
  `d1b06732f8a80db4e77986df31ff28d9f04641fa`.
- Only next task: **INDEPENDENT T13 FINAL REVIEW**. All board sections below are
  historical checkpoints, not current blockers or authorization to resume other work.

## Current board — fresh-session Preview safe-stop, 2026-09-13

- **T13 NOT COMPLETE — BROWSER VERIFICATION BLOCKED.** Fresh metadata: `vn-ca1/Frigo-dev`,
  ID 1368281478; main remains `d1b06732f8a80db4e77986df31ff28d9f04641fa` and the
  prior continuation/current fresh-thread start is `a9b5904aeba0fc7e4d649165770a4e86701312a2`.
  The required `2334a6f -> c37a9b8 -> f845d04 -> fd32aa8 -> a9b5904` lineage and empty
  `fd32aa8..a9b5904` non-doc delta were reverified with a clean starting worktree.
- BLOCKED: all three schema-valid managed Preview attempts (`preview`, 120 seconds,
  promotion `preview:3000`) failed before starting `scripts/security-preview.mjs`:
  `Preview port must be a currently discovered HTTP listener owned by the managed preview run`.
  Only browser processes were listening. No settings edit, alternate server, or workaround.
- NOT RUN in this fresh session: flows A–I, 360/390/430 checks, viewport-emulation
  capability, focused/full suite, typecheck, lint, build, D1/migration-replay/schema and
  authority audits. Historical 176/9 and 26 hardening/adoption results are not current
  certification; current full counts are unestablished.
- Fresh checks: migration integrity PASS (31, unchanged 0031, no 0032),
  `git diff --check` PASS. Platform report recorded. Docs-only WIP publication target:
  `hoplite/mende-26679a14`; prior continuation branch preserved.
- NEXT: repair the supported managed Preview interface; resume all mandatory WIP flows,
  then establish the real baseline and complete AC/roadmap, freeze, and certification gates.
  No application freeze/final docs head, merge, deploy, remote D1, PayOS, or T14 work.

## Current board — confirmed UX fixed; browser gate blocked, 2026-09-13 12:40 UTC

- New branch: `hoplite/kos-9d39545d--t13b-b-final-certification`, exact f845d04 base.
- Saved/published WIP: `fd32aa8deaee7df454245591015780c59f909352`; old WIP/main preserved.
- Confirmed-review P3: completed wording, real read-only header/controls, no confirm
  CTA/manual addition, working `Xem tủ lạnh` navigation; A/B/A terminal state retained.
- PASS: 176/176 tests in 9 files (26 hardening), typecheck/scoped lint/diff check.
- BLOCKED: one fresh Preview startup reproduced the platform promotion-schema error;
  no supported existing server available. Owner's stop-before-freeze rule applied.
- NOT RUN: browser/mobile flows, actual current full baseline, final AC/roadmap/source
  audits, application freeze, detached full/D1/migration/schema certification, final docs.
- NEXT: unblock Preview, complete all nine flows, measure current full runtime counts
  (not obsolete 3177/124), then follow the freeze/certification gates in the WIP handoff.
- **T13 NOT COMPLETE.** No settings commit, merge, deployment, remote D1 or PayOS change.

## T13B-B continuation — 2026-09-13, BLOCKED_FINAL_VERIFICATION

- Repository transfer verified: `vn-ca1/Frigo-dev`, ID 1368281478; exact recovered
  WIP/guarded main/rescue refs and ancestry passed before edits.
- Branch `hoplite/kos-9d39545d--t13b-b-final-hardening`; published WIP
  `c37a9b8d7afc66507052bbc8f1e8a24fdc896e8d`, not application freeze.
- P1 route/store mismatch and private-session race: fixed. P2 safe fridge domain
  errors/refetch and confirmed-review remount truthfulness: fixed. 23 regressions.
- PASS: final focused 173 tests/9 files; T13B-A backend 1122/17; typecheck, scoped
  lint, operator syntax, diff check. Writer/reader UNKNOWN 0/0; 31 unchanged migrations.
- BLOCKER: managed Preview's required promotion argument prevents initial startup.
  Reported platform fault; fresh browser flows and widths remain unverified.
- NEXT: unblock managed Preview, complete all browser/AC/roadmap gates, then create
  application freeze and run clean detached/full/D1/migration/schema/build gates.
  Only afterwards update final T13 documents and create final docs HEAD.
- **T13 NOT COMPLETE.** No main merge, production deploy, remote D1 or PayOS change.
  See `inventory-truth/t13/T13B_B_WIP_HANDOFF.md` for exact commands/failures/lineage.

## Current authoritative board — T13B-B quota stop, 2026-09-13

- WIP implemented: receipt/fridge full review, truthful evidence/confidence, explicit
  persisted rejection, adoption operator CLI, two truth-presentation fixes and tests.
- Focused combined preflight: **109/109, 6 files PASS**. No final full-suite freeze.
- SAVED: WIP `a8cefd13505bc6b45dd11f45a6323539deb60f93` was published/fetched with
  equality after initial repository-access failures. Public numeric metadata still
  returns 404. Base discrepancy is recorded, not repaired by reset/rebase.
- PENDING: interrupted review, affected browser rerun, original AC/roadmap matrix,
  final authority audits, full/D1/lint/typecheck/build/migration/schema/freeze gates.
- Next: wait for explicit resumption authorization, then reverify identity/base and
  continue from saved WIP. Details: [WIP handoff](inventory-truth/t13/T13B_B_WIP_HANDOFF.md).

## Current authoritative board — T13B-A / T13B-B split, 2026-09-13

- **T13B-A COMPLETE — READY FOR T13B-B**, backend-only. Prior T13 completion
  statements below do not certify the remaining Part B scope.
- Application/test continuation checkpoint:
  `c31567ec7dfa8f95808c20c834b327cbb3425f9c`; branch
  `hoplite/megara-hyblaia-888f1514`; base `3458c6cb971f5d96fce8eda3abc3d708437ce713`.
  Checkpoint pushed/fetched with equality verified; docs follow separately.
- DONE: separate adopted receipt purchase lots; unchanged older lot provenance;
  exact new purchase facts; preserved fridge CORRECT semantics; production
  raw/confirmed correction metadata in the existing command/event fingerprint;
  retained OCR T10 rawName; atomic rollback and concurrent/response-loss replay.
- PASS: focused **1,122/1,122 / 17 files**, real D1 **92/92 / 5 files**, typecheck,
  scoped ESLint, diff/scope/ancestry checks. Four pre-fix negative controls fail as
  expected. Initial event-envelope and race failures were corrected; exact commands
  and iteration failures are in `inventory-truth/t13/T13B_A_HANDOFF.md`.
- Migrations **31**, all unchanged; no 0032. Writer UNKNOWN **0**; canonical
  reader UNKNOWN **0**. Main `d1b0673` unchanged, nothing merged/deployed.
- NEXT: Part B ReceiptReviewPage/ScanResultPage UX, adoption product/operator path,
  final matrix and full verification. **NOT RUN — DEFERRED TO T13B-B FINAL
  VERIFICATION:** full suite/lint/build, dedicated migration smoke/schema/upgrade
  matrix, browser/mobile checks and final certification. Preserve DEC-016 and the
  backend checkpoint; do not rewrite T13 or begin from main.

## Current authoritative board — T13 Receipt/Vision Truth & Inventory UX V2, 2026-09-13

- **T13 COMPLETE on branch `hoplite/lindos-0368e413`; NOT merged to main.** Freeze
  `ad342703fb31a2b97d2798f1161fb83d4d0ed090`; base `578f705`; `origin/main` still `d1b0673`.
- Docs: `docs/ai/inventory-truth/t13/` (README, RECEIPT_VISION_TRUTH, UX_V2, AUTHORITY_MAP,
  TEST_MATRIX, CONTINUATION).
- All 14 acceptance criteria covered by permanent tests. Full suite 3,177/124 files; real D1
  81/81; lint/typecheck/build/migrations(31)/schema gate/diff-check PASS from a clean
  detached worktree at the freeze SHA with an empty status.
- Authority unchanged: one writer (T09). One new write statement, to
  `inventory_observations` (evidence). Writer/reader audits UNKNOWN = 0.
- P3 notes from the roadmap audit are now CLOSED: inferred expiry no longer persists as
  `KNOWN`; the Cloudflare provider no longer fabricates confidence/merchant/date/price.
- 7 defects found by browser verification (not by the green suite) are fixed with regression
  tests; see `docs/ai/inventory-truth/t13/CONTINUATION.md`.
- OPEN follow-ups retained: `MEAL_PLANNER_AUTHORITY_CUTOVER`; AuthPage raw error text (P3).
- NEW follow-ups: viewport emulation was unavailable in the sandbox, so the 360/390/430
  check is a computed overflow probe rather than a visual check; the reconciliation
  accept (CORRECT/MOVE) path was exercised via tests/API but not via a UI click, because
  seeded preview data yields no actionable verdict.
- Main NOT merged; nothing deployed; remote D1 NOT touched; PayOS untouched.

## Current authoritative board — Roadmap reconciliation / gap audit, 2026-09-12

- Audit of RC `64c5501` against the original T08–T12 roadmap COMPLETE: mismatch CONFIRMED;
  **T13 REQUIRED**. Receipt: `docs/ai/release/INVENTORY_TRUTH_ROADMAP_RECONCILIATION.md`.
- T13 defined (not implemented): `docs/ai/release/T13_PROPOSED_SCOPE.md` — Receipt/Vision
  Truth & Inventory UX V2 (RECEIPT provenance, purchase facts, truthful expiry kind, raw-vs-
  confirmed evidence, observation integration or DEC, UX endpoints, detail/edit/move/
  reconciliation UX, adoption path, error-code UX). 14 acceptance criteria. Starting point =
  this audit's docs HEAD (`ROADMAP_AUDIT_HEAD` in HANDOFF), not main.
- P3 notes for T13 (no release blocker): inferred expiry persisted as `KNOWN`; CF provider
  fabricated defaults; `FINAL_WRITER_MAP` scan changed-payload wording; outbox permanent-409
  head-of-line block (pre-existing).
- Owner decision pending: merge `64c5501` before T13 (release management) vs run T13 on the
  train first. This audit does not authorize either.
- OPEN follow-ups retained: `MEAL_PLANNER_AUTHORITY_CUTOVER`; AuthPage raw error text (P3).
- Main NOT merged; production/staging NOT deployed; remote D1 NOT touched; PayOS untouched.

## Current authoritative board — Final re-certification, 2026-09-12

- RC `64c5501` independently re-certified (technical): all gates PASS from a clean
  exact-SHA checkout; no P0/P1/P2. Receipt: `docs/ai/release/INVENTORY_TRUTH_RECERTIFICATION.md`.
- NEXT (separate task): ROADMAP RECONCILIATION / GAP AUDIT before any main integration.
- OPEN follow-ups: `MEAL_PLANNER_AUTHORITY_CUTOVER` (before enabling `MEAL_PLANNER_ENABLED`
  for adopted households); P3 UX note — AuthPage shows raw `err.message` for generic auth
  errors (pre-existing on main).
- Main NOT merged; production/staging NOT deployed; remote D1 NOT touched; PayOS untouched.

## Current authoritative board — Final RC targeted remediation, 2026-09-12

- D3 P1 CLOSED at app freeze `64c5501ab0110658718b3752bd84e537f0854e12` (client
  deferral flow + 7 new tests; server DEC-012 unchanged). D1 P2 CLOSED (main blob of
  `.hoplite/settings.json` restored). D2 P2 DOCUMENTED (SAFE_DEFERRED in T11/T12 maps).
- Clean-checkout gates: 3,092/3,092 (120 files); real D1 70/70; T09 654 / T10 98 /
  T11 39 / T12 22; lint/typecheck/build/migrations(30)/schema/diff-check PASS; status empty.
- FOLLOW-UP (must land before `MEAL_PLANNER_ENABLED` is enabled for adopted
  households): **MEAL_PLANNER_AUTHORITY_CUTOVER** — route `loadMealPlanningSnapshot`
  inventory reads through T11 read authority / `fetchHouseholdInventoryFromDb`.
- Next: re-certification of `64c5501` as the release candidate; main NOT merged;
  production/staging NOT deployed; remote D1 NOT touched; PayOS untouched.

## Current authoritative board — Final Release Integration Review, 2026-09-12

- Review of RC `d15600186c3e73faba011eb690ac6cd70e8d3d2d` from docs HEAD `5cb4caa`
  complete: **RELEASE CANDIDATE NOT READY** (0 P0, 1 P1, 2 P2). Evidence in
  `docs/ai/release/INVENTORY_TRUTH_RELEASE_CERTIFICATION.md` (+ ANCESTRY, CHANGE_MANIFEST).
- Certified PASS: lineage, main divergence (main still `d1b0673`), task survival,
  architecture invariant, reader/writer audits, migration chain (sqlite + real D1),
  legacy upgrade simulation, clean-checkout gates (3,085/3,085; real D1 70/70; all
  static gates), smoke matrix, concurrency/idempotency/tenancy/fail-closed/cache,
  API compatibility, dependency/config (no change).
- OPEN — D3 (P1): guest→email registration dead-ends with `409
  INVENTORY_TRANSFER_DEFERRED` in the shipped web client. Next: client-only successor
  fix on the T12 branch (explicit “continue without transfer” retry), test, re-run gates.
- OPEN — D1 (P2): restore main blob of `.hoplite/settings.json` on the T12 branch.
- OPEN — D2 (P2): document `meal-planning-snapshot.ts` reader as SAFE_DEFERRED in the
  T11/T12 maps; cut it over to read authority before enabling `MEAL_PLANNER_ENABLED`.
- Main NOT merged; production/staging NOT deployed; remote D1 NOT touched; PayOS untouched.

## Current authoritative board — T12 runtime verification, 2026-09-12

- Review findings P1/P2 closed at new freeze `d15600186c3e73faba011eb690ac6cd70e8d3d2d` (`22f675d` superseded):
  real-D1 T12 suite (8), route-level suite (5), explicit STALE_SNAPSHOT race
  classification, adopted-cook replay-first fix.
- 3,085 full/119 files; 70 real D1; all gates PASS from clean exact-SHA checkout.
- No migration; no new writers; PayOS untouched; PR tooling not used.
- Remaining P0/P1: NONE. Main NOT merged; production NOT deployed; Final
  Release Integration Review NOT started.

## Historical board — first T12 freeze (superseded)

- T12 CLOSED-LOOP COMPLETE at freeze `22f675d1cca76d05c93ebb2ed40bbaea11a72238`: closed-loop suite (9), authority
  maps (UNKNOWN readers/writers = 0), alias tightening. 3,072 full/117 files;
  62 real D1; all gates PASS. **T08–T12 release train COMPLETE.**
- Remaining P0/P1: NONE. P3: bounded legacy compatibility for non-adopted
  households (removal conditions documented in FINAL_AUTHORITY_MAP.md).
- Main NOT merged; production NOT deployed; PayOS untouched; no post-T12 task.

## Historical T11 board — read authority hardening (superseded by T12)

- Findings A–F closed (real-D1 proof, adopted-empty, MOVE/DISCARD/FEFO races,
  activeCount, display aliases, freshness fail-closed) → VERIFIED from a clean
  published checkout. New freeze `c15c9a81fc4367b3506a7e2693798ebe1424b0a9`; `657201f` superseded.
- 3,063 full/116 files; 62 real local-D1; all static/30-migration/schema gates PASS.
- No migration; no new writers; PayOS untouched; PR #3 left alone (no PR tooling).
  Main NOT merged; production NOT deployed; T12 NOT STARTED.
- Remaining P0/P1: NONE. Verdict: **T11 COMPLETE — READY FOR INDEPENDENT REVIEW.**

## Historical T11 board — first freeze (superseded)

- Canonical read authority: REPRODUCED the dual-truth risk (all product reads
  funnelled through the `inventory_items` projection + 1h KV cache) → CUT OVER
  (`fetchHouseholdInventoryFromDb` authority-backed for adopted households; KV
  bypassed; fail-closed; legacy path preserved behind the adoption gate) →
  VERIFIED from a clean published checkout.
- Read consumer audit: production UNKNOWN = 0 (READ_CONSUMER_MAP.md).
- Application freeze: `657201f3a12f18dd96cc96adeac0dd1d3b75e6f4` (PR #3; corrective `4553b8a`).
- 3,041 full/115 files; 51 real local-D1; lint/typecheck/build/30-migration
  smoke/local schema/diff PASS; clean exact-SHA checkout repeats all.
- No migration; PayOS untouched. Main NOT merged; production NOT deployed;
  T12 NOT STARTED.
- Remaining P0/P1: NONE. Verdict: **T11 COMPLETE — READY FOR INDEPENDENT REVIEW.**

## Historical T10 board — observation claim fence (superseded)

- Concurrency P1 (competing decisions on one OPEN observation): REPRODUCED (silent zero-row
  UPDATE; trigger-dependent; double commit without trigger) → FIXED (in-batch changes() claim
  guard, atomic loser rollback, `OBSERVATION_VERSION_CONFLICT`, twin replay preserved) →
  VERIFIED from a clean published checkout.
- New application freeze: `7393edcd4fb9cc8bb4df2a06628fb5dc57f8607b`; `4c414fa` superseded.
- 3,024 full/114 files; T10 focused 98/98; T09 focused 323/323; 51 real local-D1;
  lint/typecheck/build/30-migration smoke/local schema/diff PASS; clean exact-SHA checkout repeats all.
- No migration; PayOS untouched; no PR created/updated. Main NOT merged; T11 NOT STARTED.
- Remaining P0/P1: NONE. Verdict: **T10 PASS — READY FOR INDEPENDENT REVIEW**.

## Historical T10 board — composition fix 4c414fa (superseded)

- Multi-field composition P1: REPRODUCED (2–3 CORRECT per lot; expiry-only verdict on mixed
  claims) → FIXED (single merged CORRECT + ≤1 MOVE; boundary invariant; T09 atomic compose)
  → VERIFIED from a clean published checkout.
- New application freeze: `4c414fa7eb33329ee12936c0899644af67e48f07`, published/fetched, local == remote.
  Previous `6c28858` superseded.
- 3,009 full/113 files; T10 focused 78/78; 49 real local-D1; lint/typecheck/build/
  30-migration smoke/local schema/diff PASS; clean exact-SHA checkout repeats all.
- No migration; historical migrations untouched. Main NOT merged; production NOT deployed;
  remote D1 NOT touched. T11 NOT STARTED.
- Remaining P0/P1: NONE. Verdict: **T10 COMPLETE — READY FOR INDEPENDENT REVIEW**.
  Receipt: `inventory-truth/t10/VERIFICATION.md`.

## Historical T10 board — initial freeze 6c28858 (superseded)

- T10A source audit: COMPLETE (`inventory-truth/t10/OBSERVATION_SOURCE_MAP.md`).
- T10B domain contracts: COMPLETE (categorical evidence, deterministic identity, pure planner).
- T10C persistence: COMPLETE (additive 0030; evidence never mutates inventory; smoke + schema gate require 0030).
- T10D reconciliation planner: COMPLETE (9 verdicts; exact quantities; no name matching; expiry precedence).
- T10E decision authority: COMPLETE (T09 CORRECT/MOVE composition, one atomic batch, receipt replay, idempotency).
- T10F concurrency/tenancy/corruption matrix: COMPLETE (F1–F5 races, real-D1 trigger battery).
- T10G verification/freeze/handoff: COMPLETE.
- Application freeze: `6c28858acd0627d2d602998107c2e260c5e4f0d5`, published/fetched,
  local == remote == clean-checkout SHA. Full 2,990/112; focused 1,097/19; real D1 49/49;
  lint/typecheck/build/migration/schema/diff PASS from the clean checkout (empty status).
- Remaining P0/P1: NONE. Verdict: **T10 COMPLETE — READY FOR INDEPENDENT REVIEW**.
- T11: NOT STARTED. T12: NOT STARTED.
- Next: independent review of PR #2. No merge of main, no deploy, no remote D1, no PayOS.
  Full receipt: `inventory-truth/t10/VERIFICATION.md`.

## Historical T09 board — FEFO v2 backfill compatibility (train-merged internally; main merge remains human-gated)

- Final FEFO backfill P1: REPRODUCED → FIXED (additive 0029 + executor mapping fix)
  → VERIFIED from a clean published checkout.
- New final application freeze: `bf391c5fdcdd9e9c2f2257db515815e082cb4381`, published/fetched, local == remote.
- 1,237 focused/15 files; 2,926 full/108; 44 real local-D1; lint/typecheck/build/
  29-migration smoke/local schema/diff PASS; clean exact-SHA checkout repeats all.
- Native equal-ID FEFO, PATCH, replay, concurrency, adoption and writer-fence
  suites unchanged and PASS. Historical migrations 0023-0028 untouched.
- Remaining P0/P1: NONE. Verdict: **READY FOR FINAL MAIN MERGE REVIEW**.
- Next: external main-merge review. No merge/deploy/remote D1/PayOS/T10 by this agent.
  Full receipt: `inventory-truth/t09/FINAL_PATCH_VERIFICATION.md`.

## Historical backfill compatibility board — superseded by bf391c5

- Backfilled manual PATCH P1: REPRODUCED → FIXED → VERIFIED, no migration.
- Final application freeze: `df73bc035c2938b6fd082c57f6bca89a82d8e443`, published/fetched.
- 619 focused/nine files; 2,910 full/107; 42 real local-D1; all static/build/schema
  gates PASS. Exact fetched-source clean checkout repeats full suite and every gate PASS.
- **NOT READY FOR MAIN**: shared v2 FEFO equal-ID SQL restriction remains P1.
- Next: separately authorize FEFO compatibility/schema work. No T10/merge/deploy.
  Full receipt: `inventory-truth/t09/FINAL_PATCH_VERIFICATION.md`.

## Historical PATCH parity board — superseded by df73bc0

- Final targeted PATCH fixes A/storage and B/category: REPRODUCED, FIXED, VERIFIED.
- Published application freeze: `e796f695bdb4228853992cdedc4e3cecf3437adb`.
- Fresh gates: 515 focused/six files; 2,865 full/106; 40 isolated local-D1;
  lint/typecheck/build/28-migration smoke/local schema/diff PASS.
- **NOT READY FOR MAIN**: inherited P1 backfilled-lot PATCH mapping refusal remains.
- Next: separately scoped mapping compatibility authorization, then main review.
  No merge/deployment/remote D1/PayOS/T10 work. Exact evidence:
  `inventory-truth/t09/FINAL_PATCH_VERIFICATION.md`.

## Historical evidence — all prior freeze/readiness claims below are superseded

## T09 F/G/H complete — 2026-09-11

Independent-review follow-up `27427383d61930ea1b67ccbc1d69bb1cc069f931` is published: adopted PATCH retries now replay retained receipt evidence before stale-version rejection; altered reuse conflicts and a new key retains CAS. Fresh full suite: 2,838 tests / 105 files PASS (165.25s); lint, typecheck, migration smoke and build PASS. Next action remains external review; do not start T10.

T09F = COMPLETE; T09G = COMPLETE; T09H = COMPLETE (freeze/evidence, no main merge).
Application freeze `9bf9ac0fe7b5e0d39615f39ae5cc30f84569af2f` published/fetched on **hoplite/kydonia-2785bb72**
(successor of the read-only base `hoplite/kos-2a686759` at `aa44d2a2f80ea33fd4b328aba906660c0129051e`);
local/remote equality PASS. Full gates at this checkpoint: **2,837 tests / 105 files PASS** (155s), including the new 19-test adoption suite, 9-test G concurrency matrix and rewritten 14-test writer-fence suite; 38 isolated real local-D1 tests PASS; lint PASS; typecheck PASS; build PASS; 28-migration smoke PASS; local D1 schema gate PASS (0028 required).
All writers classified in `inventory-truth/t09/WRITER_MAP.md` (no UNKNOWN). DEC-012
intact. Next decision belongs to the external review; do not start T10 from here.

## Historical board — 2026-09-11 (superseded)

Published F safety/preparation checkpoint: `aa43e069edbff7843e9eb7532ff386b27be96a17`.
Pure adoption planner and writer/retry safety are verified, not full F completion.
Fresh PASS: 1,347 focused / 19 files; 2,808 full / 103; lint/typecheck/build;
27-migration replay; 38 actual local-D1 tests; diff/protected-path checks.
Next: atomic adoption receipt/activation authority → functional manual/scan/
shopping/cook adapters → G matrix → H freeze/review. No freeze/readiness claim.

Same T09 task, canonical repository **vn-2d/frigo-dev**. Writable successor
**hoplite/kos-2a686759** directly from interrupted F `66858c5`; previous
continuation `hoplite/orchemenos-e002591e` is read-only. Transfer/ancestry and
fresh 2,685-test / 99-file baseline plus all static/build/migration gates PASS.
A–E COMPLETE; F IN_PROGRESS; G/H NOT_STARTED. Current authority:
`inventory-truth/t09/CONTINUATION.md`. Previous owners are historical provenance.
Frozen D base remains `811f7e8463303e010199741d66f88ab8a817212d`.

The following E/guest-only verification is retained pre-recovery history.
A–E complete; E atomic multi-effect FEFO published/fetched at
`9bd1e6bc000cd2e94121469babb1a5eb63a5047f`, equality/ancestry PASS. F–H not complete.
Successor docs 8bf32ed4e41ed3341215c6376e0c13ef13043616
published/fetched before E. Latest post-fence: 1,172 focused / 11 files and
static/build/migration gates PASS; final full rerun 2,659 / 98 files PASS. Earlier
1,170 focused / 2,657 full results predate this fence. Scoped E review has no
remaining P1/P2 findings. F guest transfer SAFE-DEFERRED (143 focused auth/guest/
outbox tests PASS; full 2,685 / 99 and all static/build/migration gates PASS);
explicit adoption and other writers remain pending. See `inventory-truth/t09/VERIFICATION.md` and
`inventory-truth/t09/CONTINUATION.md`; no main/production/PayOS/T10 work or readiness claim.

## Historical T09D checkpoint (2026-09-10)

IN_PROGRESS in vn-2b/frigo-dev on hoplite/euhesperides-d77023a5, exact T08 base
8f8788c1a0c9e486657751ef3875a5baa5334dec. Publication-first and A/B published;
C internal native persistence/schema and real local D1 proof implemented. No HTTP
or legacy-writer cutover. Latest gates/failures are in t09/VERIFICATION.md.
Published C 13133b3: 507 focused and 1,994 full tests PASS, static/build/local
migration gates PASS, remote-source 507 PASS.
D receipt/event/poststate authority verified locally: 1,031 focused / 2,518 full,
static/build and 26-migration/local schema PASS. D b036b25 published/fetched;
remote-source 1,031 tests and typecheck PASS. Next: E/F;
G/H acceptance and final T09 readiness remain pending.
See inventory-truth/TASK_BOARD.md and t09/REVIEW_INDEX.md.
No production reconciliation, legacy/main synchronization or T10 in this task.

## Completed release work

- T01-T07: COMPLETE.
- T01 ✅
- T02 ✅
- T03 ✅
- T04 ✅
- T05 ✅
- T06A ✅
- T06B ✅
- T07 ✅
- Release Integration ✅
- Release Publication ✅
- Main Integration ✅
- Main CI ✅

| Task | Status | Evidence |
| --- | --- | --- |
| T01 Domain/data foundation | COMPLETE | Preserved foundation and hardening lineage |
| T02 Recipe engine | COMPLETE | `0051276` / `ef13acd` in the merged release |
| T03 Ranking/personalization | COMPLETE | `01f9d87` / `3592de9` |
| T04 Weekly planner | COMPLETE | `ebd538b` |
| T05 Shopping/budget/waste | COMPLETE | `4f3f539` / `899b6d7` |
| T06A Backend/API/trust/persistence | COMPLETE | `9f420c0` / `ca60ced` / `c46330c` |
| T06B Frontend/UX/AI presentation/E2E | COMPLETE | `0fc78a4` / `6d4e873` |
| T07 Final hardening | COMPLETE | Final application SHA `0b20061e` |
| Release Integration | ✅ COMPLETE | Application integration in main at `23ef51d` |
| Release Publication | ✅ COMPLETE | Release docs published |
| Main Integration | ✅ COMPLETE | Main merge SHA `23ef51d6ec12a5a3e319a2d941dca39d2775cb9d` |
| Main CI | ✅ PASS | Run `34396319671` |

## T08 independent branch work — explicitly authorized 2026-09-09

- T08A Audit: complete; dependency map in `inventory-truth/MASTER_CONTEXT.md`.
- T08B–E Domain/persistence/backfill/projection/parity: implemented and locally verified.
- T08F Verification/handoff: COMPLETE. User approved `hoplite/xanthos-7d942897`
  instead of the original feature name (DEC-006); trusted publish/fetch confirmed
  fb00f46 and the docs-only final receipt follows it on the same branch.
- Verified code: `dd2ecc6f7066250dfdc5214a3d6c356e1479b61e`.
- Fresh final-session PASS: 130 focused tests, 1,617 full tests / 89 files,
  lint/typecheck/build, 23-migration replay/local schema and diff checks.
  Prior local D1 apply passed 23/23. Source unchanged since dd2ecc6.
- Remaining T08 work: none; final report `inventory-truth/T08_VERIFICATION.md`.
  Cross-account checkout: `origin/hoplite/xanthos-7d942897`. T09–T12 not started.
- Full checklist/failures/next action: `inventory-truth/TASK_BOARD.md`,
  `inventory-truth/VERIFICATION.md`, `inventory-truth/CURRENT_STATE.md`.

## Independent production/release work (not authorized by T08)

- Production Reconciliation ✅ COMPLETE - post-cutover verified
- Production DB Migration ✅ COMPLETE - `frigo-db` ledger `0001`-`0023`
- Controlled Production Deployment ✅ COMPLETE - Worker SHA `bdb0dda0`
- OCR production recovery (maintenance) ✅ COMPLETE - deployed and verified
- Planner Rollout ⏳

Do not invent T08. OCR recovery is a bounded maintenance candidate, not a new
product task or a production deployment. Planner rollout remains separately
authorized work.
The original release packet did not authorize T08; the separate user-authorized
T08 packet now governs only its isolated branch. Production work remains pending
and must be separately authorized; this branch does not perform or update it.

GitHub source of truth: main.
Deployed application SHA: `bdb0dda0b1123c4fd940058091e3cb285d5e8eb8`.
Post-deployment GitHub `main` changes are documentation-only receipt merges; the
OCR candidate is merged and deployed at 100% traffic.
Current `github-frigo/main`: `db2377fd9f63d1be38ce3882c6d8173e0bf9e497`;
the `codex/ocr-production-recovery` branch was merged via PR #17 and its code is
deployed in production.
Release Integration: COMPLETE.
Main Integration: COMPLETE.
PRE_CLEANUP_MAIN_HEAD: `41d2de6bc76331322cc63e8038432b0b02f60da1`.
APPLICATION INTEGRATION: complete in main at `23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`.
Production reconciliation: COMPLETE - schema/code/health/traffic verified.
Production DB migration: COMPLETE - exact ledger `0001` through `0023`.
Production deployment: COMPLETE - version `df7225c9-6f20-4206-9f16-573de6a69c43`.
Planner rollout: NOT STARTED.

## OCR image optimization maintenance (2026-09-13)

- Browser preprocessing candidate: **IMPLEMENTED LOCALLY, NOT DEPLOYED**.
- Scope: in-memory resize cap (2,000 px), JPEG quality 0.82, smaller-output
  guard, cancellation/session fencing and FileReader fallback.
- Evidence: 11/11 focused privacy/image tests pass; sample receipt conversion
  measured 81.9% smaller at unchanged 1,086x1,448 dimensions.
- Gate: run browser/device OCR recall and latency smoke before committing or
  promoting; do not alter PayOS, schema or provider secrets.
OCR recovery status: COMPLETE - DEPLOYED AND VERIFIED.
Next task: monitor OCR quality/latency and schedule the separate React Router upgrade.

## Frozen release evidence

- PRODUCTION_APPLICATION_BASE_SHA:
  `23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`.
- Verified application SHA: `0b20061e7dc7405df68b18a18da4166e09494ecd`.
- Verified release head: `0420807968538f61b669569d064c404f67032174`.
- Previous final-head CI: `34405307196 SUCCESS`.
- Previous release deploy workflow: `34396457582 SUCCESS`.
- Full: **1,487 tests / 87 files PASS**; focused: **819 tests / 40 files PASS**.
- D1: **23 / 23 migrations PASS**; upgrade **0020 -> 0023 PASS**.
- Existing rows preserved: **776 rows / 58 tables**.
- Browser: **264 assertions / 36 phases PASS**.
- Payment-adjacent: **82 tests / 7 files PASS**.
- Previous docs-cleanup deploy workflow `34405457796`: packaging completed; staging was not
  provisioned and no staging deploy occurred. The current production cutover was
  completed directly with Wrangler OAuth because GitHub production configuration
  is not provisioned.

## PR #8 metadata and archival branches

PR #8 METADATA: `MERGED`, `isDraft=false`, merged and closed at
`2026-09-09T19:38:59Z`, merge commit `23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`.
Application integration is complete in main at `23ef51d`; do not merge PR #8 or
kirrha again. Kirrha remains archival documentation-only divergence.

## Protected areas

PayOS/payment code untouched.

No real payment performed.

Local production source checkout is untouched; the production D1 schema was
updated only through the approved additive migrations.

The OCR recovery worktree is separate from the production checkout. It adds the
unapplied candidate migration `0023_scan_request_fingerprint.sql` locally and
has not changed remote D1, production secrets or Worker traffic.

## Production cutover receipt (2026-09-10)

- Worker readiness: `status=degraded`, `environment=production`, full commit
  `bdb0dda0b1123c4fd940058091e3cb285d5e8eb8`; active version
  `df7225c9-6f20-4206-9f16-573de6a69c43` at 100%.
- Landing/liveness/readiness smoke passed; readiness database/queue/AI/email are
  healthy/configured and only `CONFIG_PLUS_GRANT_SECRET_MISSING` remains as a
  warning.
- Remote D1 exact ledger is `0001`-`0023`; schema gate passes and FK violations are `0`.
- Strict Week reconciliation passes 2/2 plans with 0 orphans and 0 mismatches.
- Preserved counts: users 28, households 28, inventory items 13, recipes 59,
  meal plans 2, scan queue jobs 15, sessions 2 and auth OTPs 0.
- Backup export is retained at
  `.artifacts/frigo-db-pre-main-d1b0673-20260910T205627Z.sql` with
  SHA-256 `000c9cb88d6045afb19cca6ce3e1caa308b20ffa214dbb2cddfca0cb78d722eb`.
- CORS allows the exact trusted origin and emits no ACAO for path-bearing,
  localhost or arbitrary origins. No planner flag, PayOS/payment path or secret
  value was changed. The separate T08 `xanthos` branch contains
  application/migration changes and is not part of authoritative `main`.
- Follow-up: test and schedule the React Router `>=7.18.0` upgrade for the two
  moderate production dependency advisories; do not patch it ad hoc in this
  receipt-only cutover.

## OCR production-recovery candidate (2026-09-12)

| Area | Candidate state | Release boundary |
| --- | --- | --- |
| Provider/model | Qwen `qwen3.7-flash` via DashScope international (`QWEN_BASE_URL`/`QWEN_MODEL`) is primary for vision, receipt OCR, chat and ranking; Groq is disabled unless `GROQ_FALLBACK_ENABLED=true`; Cloudflare vision fallback is opt-in via `CLOUDFLARE_VISION_FALLBACK`; DeepSeek requires `DEEPSEEK_FALLBACK_ENABLED=true` and GLM requires `GLM_FALLBACK_ENABLED=true` | Deployed at 100%; readiness `ai=configured` |
| Output quality | Zod validation plus rejection of generic/placeholder labels and confidence below `0.6`; empty usable output is `AI_SCAN_NO_USABLE_ITEMS` | OCR remains untrusted draft data and requires review/confirmation |
| Queue failures | Typed permanent `MODEL_NOT_FOUND`/auth/permission/license/schema/invalid-response/quality failures; bounded retries for `REQUEST_TIMEOUT`/`NETWORK_ERROR`/`RATE_LIMITED`/`UPSTREAM_ERROR` | Existing lease, idempotency, tenant fencing, max attempts and DLQ remain authoritative |
| Schema/data | Additive `0023_scan_request_fingerprint.sql`; no backfill or inventory/auth/Week/PayOS change | Local and remote D1 cover `0001`-`0023`; Worker deploy remains pending |
| Verification | Local/hosted gates PASS; live Qwen `qwen3.7-flash` smoke HTTP 200; D1 `0023` applied and gated; Worker version `df7225c9-6f20-4206-9f16-573de6a69c43` readiness HTTP 200 at 100% traffic | Monitor quality/latency; only `CONFIG_PLUS_GRANT_SECRET_MISSING` remains as a warning |

Candidate commits `ec87aec` and `56968ba` were merged through PR #17. Local and
hosted validation, live Qwen smoke, migration, deployment and readiness receipts
are complete; continue monitoring OCR quality and latency.

## Qwen-only runtime / cost governance candidate (2026-09-13)

| Area | Status | Evidence / next action |
| --- | --- | --- |
| Task taxonomy and logical role routing | IMPLEMENTED LOCALLY | `packages/ai/src/model-governance.ts`, `task-runtime.ts`; routing coverage is included in the full 1,606-test gate |
| Qwen-only Worker composition | IMPLEMENTED LOCALLY | scan HTTP, queue and explanation use shared config; production vars set `AI_QWEN_ONLY=true`; legacy adapters are not constructed on this path |
| Budgets, structured validation and escalation | IMPLEMENTED LOCALLY | bounded attempts/calls/tokens, Zod parse, quality gate, repair and model-capability fallback tests pass |
| Cost/usage telemetry | IMPLEMENTED LOCALLY | `AIUsageLedger`, non-PII Worker usage logs, provider usage parsing, and shadow budget reservation |
| Golden fixtures / offline harness | IMPLEMENTED LOCALLY | `tests/fixtures/ai-golden.json`; `pnpm ai:eval -- --dry-run` PASS with no live request |
| Local application checkpoint | `21c442d` | `pnpm check` PASS: 1,606 tests / 95 files, lint/typecheck/migrations/build PASS |
| Dependency audit | FOLLOW-UP REQUIRED | `pnpm audit --prod` reports two moderate `react-router` advisories; test the separate `>=7.18.0` upgrade |
| Production deployment | NOT AUTHORIZED | Do not deploy; obtain review, benchmark and hosted CI evidence first |

The candidate branch is based on canonical main SHA
`05423f2ad675006a4c7913e696f1979b3fcaae59`; canonical main and production
remain untouched. Reasoning and judge roles are disabled by default, and the
rolling `qwen3.7-flash` alias is canary-only.

## Qwen candidate recertification and publication checkpoint (2026-09-13)

- Review result: **NO CONCRETE CODE DEFECT FOUND**. Retry ownership is bounded
  by `QwenTaskRuntime`; operation token/call budgets are cumulative; production
  Qwen-only composition fails closed; structured output, quality gates,
  telemetry and Worker AbortSignal handling remain intact. Legacy providers are
  retained only for explicit compatibility paths.
- Focused command: `pnpm vitest run tests/unit/ai-runtime-governance.test.ts tests/unit/ai-router.test.ts tests/unit/qwen-provider.test.ts tests/unit/config-validation.test.ts tests/unit/meal-planning-explanation.test.ts tests/unit/scan-privacy.test.tsx tests/integration/scan-queue-retry-policy.test.ts tests/integration/scan-async-canary.test.ts` - **119 tests / 8 files PASS**.
- Full command: `pnpm check` - **1,606 tests / 95 files PASS**; lint,
  typecheck, migration replay and production build PASS. Remote D1 schema and
  Week parity checks were intentionally skipped without release flags.
- Offline command: `pnpm ai:eval -- --dry-run` - PASS; six fixture cases,
  no live Alibaba/Qwen request. `git diff --check` - PASS.
- Audit command: `pnpm audit --prod` - FAIL with two pre-existing moderate
  `react-router` advisories, patched upstream at `>=7.18.0`; no dependency
  upgrade is in this candidate.
- Documentation updated in `docs/ai/CURRENT_STATE.md`,
  `docs/ai/HANDOFF.md` and `docs/ai/QWEN_RUNTIME.md` to state the pending
  post-unification T08-T12 Inventory Truth recertification and the unchanged
  production boundary. Local `main` remains `f6a48a1`; canonical main remains
  `github-frigo/main` at `05423f2`.
- Publication status: **PUBLISHED FOR REVIEW** to `github-frigo` with a normal
  non-force push; `git ls-remote` verified the published branch SHA matches the
  local candidate, and canonical `main` remains unchanged at `05423f2`.
  GitHub reported the repository relocation notice to `Tungjpstore/Frigo`, but
  the push completed successfully. Next action is code review or a separately
  authorized benchmark. Do not merge, deploy, migrate remotely or alter
  production.

## Qwen pre-unification hardening checkpoint (2026-09-13)

- Application implementation/publication SHA: `f8468eaa7d7fed3cbcf5ac7e780eca07ad3d71e4`;
  remote branch verification passed before this documentation checkpoint.
- Final pre-documentation branch head (including the scheduler-failure
  regression test) is `a145ef5`; this documentation checkpoint follows it.
- **OCR capability:** centralized model capabilities prevent unsupported
  `response_format`/`enable_thinking` on rolling `qwen-vl-ocr`; OCR remains
  prompt-JSON plus application parsing, normalization, Zod and quality gates.
- **Pricing:** Singapore low-context estimates are versioned
  `estimate-2026-09-sg-low-context`; judge pricing is retained only as a
  planning estimate. `estimatedCostUsd` remains non-authoritative.
- **Image guard:** decoded raw base64/data URL payloads are rejected before
  provider calls at 5 MiB defaults (`AI_MAX_IMAGE_BYTES` and
  `AI_MAX_OCR_IMAGE_BYTES`, bounded 64 KiB-20 MiB). Remote URLs remain an
  upstream storage/upload responsibility.
- **Shadow lifecycle:** `backgroundExecutor` is optional and Worker HTTP routes
  pass `executionCtx.waitUntil`; queue processing safely skips shadow without an
  executor. Shadow remains off by default and retains budget reservation;
  scheduler invocation failures cannot fail the primary response.
- **Evidence:** focused **134/134 tests across 8 files PASS**; full
  `pnpm check` **1,623 tests / 95 files PASS** with lint/typecheck/migrations/
  build green; offline AI eval and diff check pass. `pnpm audit --prod` still
  reports the two known moderate React Router advisories.
- **Boundary:** canonical `main` and production are unchanged; no live Qwen
  benchmark, deploy, remote migration, secret update, PayOS/payment change or
  T08-T12 import. T08-T12 remains pending U01/U02. After normal publication,
  verify the branch SHA and request review before any release action.
## Historical canonical promotion attempts (superseded by PR #2)

- [historical] PR #1 exact-head hosted CI: GitHub reported no checks and rejected
  workflow dispatch because Actions is disabled for the current user.
- [historical] Main protection/admin review: the earlier CLI identity had push only;
  branch protection endpoint is unavailable (`404`) and no rulesets were
  observed.
- [done] Re-pushed promotion head after an empty, tree-neutral retrigger commit
  `ae1689c1f5525262da3478137b402692e4e4ed45`.
- [resolved] Repository owner `vn-dlo` authenticated, Actions enabled, and main
  protection configured; PR #2 replaced the stale PR #1 attempt.
- [done] Authenticated `gh` as `vn-dlo`; confirmed repository admin/maintain
  permission and enabled main protection with required `validate` status.
- [historical] Exact-head CI remained absent after owner-authored tree-neutral
  trigger `6ec7ff08ef258ef2ca95fb5d24b581b939ef1c92`.
- [done] Owner-visible PR #2 exact-head CI run `34968012294` passed all hosted
  validation steps on `8eb6d2b8d54e5e2fd08c0a11acd9f57a1e068b24`.
- [current gate] PR #2 still needs one independent approving review before merge.

## Auth/OAuth production hardening follow-up (2026-09-16)

- [done] Isolate Safari/Google GIS blank popup to Worker COOP precedence.
- [done] Use `same-origin-allow-popups` for SPA documents and retain
  `same-origin` for `/api/*` responses.
- [done] Add regression coverage; focused `17/17`, lint, typecheck and diff
  check pass.
- [done] Published through PR #9 and deployed Worker version
  `20bc1f35-6ffe-4085-ba79-d54a0b53da71` to 100% of the custom domain.
- [done] Post-deploy smoke, health/readiness and SPA/API COOP header checks
  pass. Only the pre-existing `CONFIG_PLUS_GRANT_SECRET_MISSING` warning
  remains.
## T18C continuation checkpoint — 2026-09-21

- [done] Authorized renamed repository `1368281478` / `vn-tako/Frigo-dev`;
  exact `b8447e85` base and `2e770f8` handoff verified, existing branch resumed,
  upstream corrected; unrelated workspace settings preserved.
- [done] Fresh fixed-tree matrix: 6 passed; 162 screenshots/strict axe audits,
  zero violations and horizontal overflow. Baseline archive unchanged.
- [done] Owner-supplied approved OS ZIP recovered and checksum-verified;
  see `T18C_SOURCE_PROVENANCE.md`. Reference unavailability is superseded.
- [in progress] Direct board comparison and source-led presentation findings;
  full T17 regressions, final fixes/evidence/gates/PR remain pending.
- **T18C_PARTIAL**; no merge/deploy/T18D. VoiceOver/NVDA NOT PERFORMED.

---

# T20 production-readiness track — 2026-09-26 UTC

- [ ] C1 exact-main green baseline: blocked until open, green PR #8 at
  `5b0a6b9` is merged by a maintainer; `main` is `bf57451`, CI `36221190222`
  failed in Vitest. PR #8 local `pnpm check` PASS; not exact-main evidence.
- [x] C2 concurrency semantics: `762015f` pushed; six deterministic stale-read
  tests cover PATCH/regenerate, DELETE, swap, save, Auto apply, valid 404,
  winner state and exactly one revision bump (focused 22/22 PASS).
- [x] C3 cuisine picker runtime: `bc92346` and `c555443` pushed; picker filters,
  stale-page guard and 390/768/1280 browser smoke PASS (focused 19/19 PASS).
- [x] Deep audit P2: `fb4416e` pushed; same-slot substitution safety uses the
  T02 chronological inventory prefix; regression rejects forbidden substitute
  without changing revision (focused 33/33 PASS).
- [x] C4 branch-local code gate: `fb4416e` `pnpm check` PASS (202 files, 4,562
  tests, migrations, build); T19/T20 focused 80/80 PASS. Documentation receipt
  follows in a separate checkpoint. No known unfixed in-scope P0/P1/P2.
- [ ] PR #9 exact-head hosted CI and merge, exact-main CI: PR #9 is stacked on
  PR #8 and CI's pull_request filter is main/master only. Retarget after #8
  merges, then certify; do not bypass or direct-push main.
- [ ] Staging migration 0039 / flag-off deploy / flag-on smoke: STOP SAFE until
  authorized staging access proves target identity and ledger. Local Cloudflare
  credentials absent; GitHub staging secrets cannot be listed (403). No remote
  migration/deploy/enablement occurred. Production mutation not authorized.
# Runtime Ingredient Model V2 — active review candidate (2026-09-27)

- [x] Certify PR #11 merge on exact main `8687ff9`: hosted CI `36269257668`
  SUCCESS, 204 files / 4,597 tests, migration smoke and build.
- [ ] Certify staging 0039: reviewed workflow `36269963768` failed before D1
  identity/ledger on Cloudflare authentication error 10000. Apply step skipped;
  no bookmark or remote schema proof. Fix the staging Environment credential
  through authorized controls, then retry the reviewed workflow; no ad-hoc SQL.
- [ ] Production OOB and media/R2 snapshots: not started because exact remote
  identity/credentials are unavailable. Read-only only after proof.
- [x] Create `codex/runtime-ingredient-model-v2` from certified main; map V1
  consumers, add ADR-033, separate V2 quantity channels and fail-closed V1
  projection/ingredient-promotion helpers. No live cutover or DB migration.
- [x] Deterministic audit/queues: 6,766 rows; 2,860 excluded review-required
  and 169 already-projected conversion-review rows; zero newly certified
  transformations. Source hash pinned and package unchanged.
- [x] Full local regression PASS after audit hardening (`pnpm check`, 206 files /
  4,615 tests; focused 3 files / 35 tests; source/import/audit checks,
  typecheck, lint, migration smoke and build).
- [x] Focused PR #12 opened and hosted implementation-head CI `36271741260`
  SUCCESS on `e321122` (206 files / 4,615 tests, smoke and build).
- [ ] Push final documentation receipt and require its exact-head CI. Release
  gate remains expected-red; no 0040/final
  manifest/T20 enablement.

---

# T21R-B offline semantic snapshot — 2026-10-01

- [x] Pin certified V1 target release/fingerprint and recompose approved batches.
- [x] Build offline ingredient multiset comparator with strict bridge, malformed,
  duplicate and position-unknown handling; 8/8 focused tests PASS.
- [x] Validate against local 0038 replay: 500 recipes / 2,702 exact ingredient
  tuples / zero unmatched; full controlled Vitest 4,898/4,898 PASS.
- [ ] Review and integrate the comparator into a protected runner-local read
  workflow with an explicit consistency/provenance receipt. Current five SELECTs
  are not transactionally pinned; existing aggregate artifacts lack raw rows.
- [ ] Obtain exact-main CI and production Environment approval before any new
  read-only production dispatch. No dispatch or repair is authorized here.
- [ ] T21G design remains blocked on individual row evidence, T20 impact,
  bounded blast radius and isolated rehearsal; 0039/deploy stay stopped.

Implementation checkpoint: `5dd9990` on
`codex/t21rb-offline-semantic-snapshot`, based on T21R-A `6bcef891`.

---

# T21R-B protected diagnostic integration — 2026-10-02 JST

- [x] Integrate the offline certified-V1 ingredient comparator into the existing
  manual, production-Environment-gated read-only diagnostic workflow.
- [x] Reobserve all five catalog SELECT results, require equal ordered result
  arrays and three matching 0038-prefix ledgers; label only
  `OBSERVED_STABLE_NON_ATOMIC`.
- [x] Bind repository/D1/candidate/V1-manifest identity, prior diagnostic and
  order-coverage evidence; upload allowlisted counts/flags only after the final
  exact-main check. Raw rows and content digests are not uploaded.
- [x] Fail closed on invalid raw optional bits, contradictory comparator flags,
  incomplete captures, capture drift and inconsistent coverage. Focused 23/23,
  first controlled full Vitest 4,906/4,906, lint, typecheck, migration smoke,
  build and syntax checks PASS. Implementation checkpoint: `90569fa`.
- [ ] Obtain independent review, protected merge and exact-main CI before an
  operator-approved read-only production Environment dispatch. No dispatch in
  this task and no V1-relative production count yet.
- [ ] T21G remains blocked pending individual row evidence, T20 impact, bounded
  blast radius and isolated rehearsal. 0039 and production deploy remain stopped.

---

# T21R-B protected integration merge — 2026-10-02 JST

- [x] Publish and independently review PR #33 at exact head `0b28b48`;
  hosted `validate` run `36931130799` SUCCESS.
- [x] Merge through protected main as `483e054`; exact-main `validate` run
  `36931887016` SUCCESS. See
  `recipe-catalog/T21RB_PROTECTED_INTEGRATION_MERGE_RECEIPT.md`.
- [ ] No production diagnostic dispatch yet. A separate operator decision must
  select an exact current-main SHA and approve the manual read-only workflow.
- [ ] Review sanitized V1 counts, unresolved rows and T20 impact before a
  protected row-evidence path or T21G design. `T21G_NOT_READY`; repair, 0039
  and production deploy remain stopped.
