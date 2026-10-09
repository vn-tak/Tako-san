# T20 — Bằng chứng rollout và chứng nhận 2026-10-09

## Trạng thái hiện hành

`T20_PRODUCTION_ROLLOUT_COMPLETE_FUNCTIONAL_SMOKE_PASS`.
Repo `vn-tak/Tako-san`, ID `1385308553`; source/main
`27d47b056455a57df811199cd7e9c32a84cbffe5`, approved hardening
`8b7b254ddcc9e0a36989a2c8c3add6ad3d776ee9`.
Operator cho phép merge PR #62 và tiếp tục rollout theo gates chuẩn.
Operator response không thay GitHub code review hoặc Environment approval.

| Readiness | Kết quả |
| --- | --- |
| CODE_COMPLETE | true theo scope core/audit |
| TEST_VERIFIED | true |
| STAGING_CERTIFIED | true |
| PRODUCTION_READY | true theo source/schema/catalog/gates đã đạt |
| PRODUCTION_ENABLED | true, paired T20/planner bật từ shadow |
| PRODUCTION_ROLLOUT_COMPLETE | true |
| PRODUCTION_FUNCTIONAL_SMOKE | true, năm journeys riêng biệt đã verified |

Main-push CI [37853046693](https://github.com/vn-tak/Tako-san/actions/runs/37853046693)
SUCCESS: 259 files / 6.365 tests, 0 FAIL, suite 429.15s;
lint/typecheck/local migration smoke/build PASS. PR #62 sửa fixture timestamp
và thêm real-schema regressions; không đổi runtime/schema/dependencies.

PR #63 chỉ cập nhật documentation/evidence, giữ chưa merge để main/runtime
vẫn pin source đã rollout. CI trước tại head `ce5347a`, run
[37924572351](https://github.com/vn-tak/Tako-san/actions/runs/37924572351), SUCCESS;
không dùng kết quả đó cho bản chứng nhận cuối. CI của head cuối được xác minh
trực tiếp trên [PR #63](https://github.com/vn-tak/Tako-san/pull/63) sau push.

## Deployment stages

| Environment | Stage | Kết quả | GitHub run |
| --- | --- | --- | --- |
| staging | shadow 0% | PASS | [37854154953](https://github.com/vn-tak/Tako-san/actions/runs/37854154953) |
| staging | canary 1% | PASS | [37854379595](https://github.com/vn-tak/Tako-san/actions/runs/37854379595) |
| staging | canary 5% | PASS | [37854606958](https://github.com/vn-tak/Tako-san/actions/runs/37854606958) |
| staging | canary 25% | PASS | [37854792161](https://github.com/vn-tak/Tako-san/actions/runs/37854792161) |
| staging | D1 | PASS | [37855017250](https://github.com/vn-tak/Tako-san/actions/runs/37855017250) |
| production | shadow 0% | PASS | [37858608953](https://github.com/vn-tak/Tako-san/actions/runs/37858608953) |
| production | canary 1% | PASS | [37922994678](https://github.com/vn-tak/Tako-san/actions/runs/37922994678) |
| production | canary 5% | PASS | [37925128348](https://github.com/vn-tak/Tako-san/actions/runs/37925128348) |
| production | canary 25% | PASS | [37926336793](https://github.com/vn-tak/Tako-san/actions/runs/37926336793) |
| production | D1 | PASS | [37927374014](https://github.com/vn-tak/Tako-san/actions/runs/37927374014) |

Mỗi stage PASS được đối chiếu hai artifact ZIP digests/manifests/source/CI
và ba live source/service-worker asset observations. Cả năm production runs
được `vn-taphoanhatung` approve bình thường, attempt 1, không bypass.
Final Worker `8626c077-b424-4b1f-b484-068216a9de8a`; previous Worker
`91d38980-61c1-44f8-af0e-cb4dd55b5848`. Deployed version và D1 binding khớp.
Ledger 39/tip 0039, 500 hydrated recipes, hydration failures 0, 500 ready media,
FK check `[]` và quick_check `ok` ở từng stage.

Các phần trăm điều khiển catalog routing; T20/planner paired true từ shadow.
Catalog cuối: configured/global source D1, cutover true, fallback null;
release `rel-bd00a4f53fcaeee4`, fingerprint
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.
Không replay 0039 hoặc recovery/import catalog trong chuỗi này.

## Staging certification

Final-source D1 readiness [37853983168](https://github.com/vn-tak/Tako-san/actions/runs/37853983168)
PASS: ledger 39, ID/order/legacy/fingerprint/provenance/integrity khớp,
hydration failures 0. Browser 36/36 PASS (24.1 min) + restricted 9/9 PASS
(2.7 min), 0 FAIL/skip/retry, tại 390/768/1280px.

Manual/A11y/keyboard/axe, Assisted hai actions/locks, Auto ba options,
shopping 100g, hard time 10/20, D1-only detail/cooking/shopping reads,
200/409 concurrency, tenancy, untracked và frontend recovery/rollback đều đạt.
45 HTTP windows riêng biệt, đúng source, unexplained Worker 5xx 0.
Synthetic 500/404 là browser interception. Flag-off/no-schema evidence là
local integration/browser/build; actual staging flags paired on trong journeys.
Wall time gồm network/throttle, không phải hosted Worker CPU/SLA benchmark.

| Policy | Prepare: một insert | Audit: không ghi | Stock/events trước-sau |
| --- | --- | --- | --- |
| none | 37855296480 | 37858233428 | Khớp counts/hashes |
| forbidden | 37855367431 | 37858300518 | Khớp counts/hashes |
| dietary | 37855441990 | 37858367077 | Khớp counts/hashes |
| nutrition | 37855512801 | 37858464407 | Khớp counts/hashes |

Playwright reporter paths được đối chiếu theo configDir; giữ nguyên bytes và
checksums. Sessions/accounts/raw inventory/events/screenshots giữ private ignored.

## Production normal session và smoke

Hai Chromium login attempts trước timeout; attempt 3 capture registered normal
UI session private 0600. Fresh GET-only profile/inventory preflight và wrapper
kiểm tra lại principal/session/source/D1 trước smoke đều PASS, stock 0 item.

Các probe discovery ban đầu được giữ riêng: GET plans không có route và
`/composition-flags.json` trả SPA HTML 200. Probe được sửa sau khi đọc routes;
không sửa API/runtime. Compiled flags được chứng nhận từ build guard/manifest.
Reporter `--list` không được tính là hosted PASS.

| Journey | Bằng chứng production |
| --- | --- |
| Manual/A11y | PASS: bốn món, autosave/reload, keyboard picker, reorder/role/swap/remove, responsive và axe |
| Assisted | PASS: complete/regenerate preview/apply giữ locked main và các ngày khác |
| Auto | PASS: ba bounded deterministic options, giải thích, chỉ ghi khi accept |
| D1-only | PASS: cùng recipe qua planner, detail, cooking và shopping reads |
| Concurrency | PASS qua continuation: competing edits 200/409, revision tăng một, canonical winner giữ nguyên, stale reload/apply bị chặn |

Initial five-test run: **4 PASS / 1 FAIL**. Concurrency chưa thực hiện race vì
local observer helper tự gọi đệ quy. Đây là lỗi harness; reports/API/stock
windows và checksums ban đầu được giữ nguyên, không sửa để biến lượt này thành PASS.

Helper được regression RED (tái hiện recursion) / GREEN (cả hai tab đăng ký
response callbacks, HTTP 5xx vào shared evidence). Read-only inspection xác minh
plan concurrency vẫn revision 1, một unlocked component, chưa có competing writes.
Targeted continuation dùng lại đúng plan đó: **1/1 PASS**, 39.4s;
không tạo lại plan hoặc chạy lại bốn journeys đã PASS.

Kết quả tổng hợp: năm journeys riêng biệt verified; browser time 331.2s,
Playwright automatic retries 0, một targeted harness continuation.
Không mô tả initial run là clean 5/5. Cả hai concurrency contexts dùng 390px,
serviceWorkers blocked, được observe và guard inventory/cooking/scan mutations.
Năm successful HTTP windows không có unexplained Worker 5xx;
HTTP inventory snapshots trước/sau khớp, item counts 0.

Production event ledger chưa query, chưa chạy restricted fixtures hoặc second
household trên production. Stock rỗng không chứng nhận nonempty stock/event
invariance; staging có receipt riêng. Cooking chỉ đọc, không consume stock
hoặc gửi provider scan.

## Readiness stability window

Sau smoke PASS, sáu GET public readiness observations từ
`2026-10-09T12:30:14.161Z` đến `2026-10-09T12:35:14.201Z`,
window duration 301,536ms, đều HTTP 200, đúng source/environment,
configured/global source D1 và fallback null.

Status cả sáu lần là `degraded`, chỉ có warning hiện hữu
`CONFIG_RECIPE_CATALOG_D1_AUTHORITY`. Code chủ động cảnh báo khi canary/D1
phục vụ nội dung cho người dùng và cutover fence hợp lệ
(`src/worker/config/validation.ts`). Không thay guard hoặc xoá warning để có
status `ok`. Receipt `PRODUCTION_READINESS_STABILITY_WINDOW_PASS` chỉ chứng nhận
cửa sổ public readiness này; không chứng nhận full Worker log/error-rate audit,
performance SLA hoặc thời gian ngoài cửa sổ.

## Scope và rollback

Ma trận 28 capabilities: [takeover audit](T20_TAKEOVER_AUDIT.md).
Core Manual/Assisted/Auto per-slot và weekly editing đã verified.
Whole-week V2 Auto, leftovers, per-component servings, offline role curation,
real-price scoring và drag-and-drop giữ OPTIONAL/DEFERRED theo rationale.
Không gọi các extension này là đã triển khai.

Dependency audit hiện hữu: production 0 high/critical, hai moderate;
dev tooling hai critical/16 high. Không đổi dependencies hoặc claim repo-wide
security PASS. Local Worker Auto median 191.44/p95 225.95ms/29 SQL không phải
hosted CPU/SLA. Không còn known unresolved P0/P1 trong scope core đã chứng nhận.

Rollback qua reviewed workflow và normal Environment reviewer, paired
T20/planner false, giữ source/catalog state được
`validateRecipeCatalogTransition` chấp nhận. Giữ ledger 39/composition records/
physical stock. Không mặc định dispatch SHA cũ qua forward transition guard.
Failed deploy có workflow restore exact previous Worker riêng.

Local flag-off transition checks dùng raw `previousRecipeAuthority` receipts
PASS cho các state có evidence; không thực hiện hosted rollback. Probe đầu dùng
compact manifest summary thiếu raw endpoint bị guard từ chối đúng, sau đó probe
được sửa để dùng raw evidence; không đổi runtime hoặc guard.

## Hồ sơ bàn giao

[Public aggregate](T20_PRODUCTION_EVIDENCE_20261009.json) chứa source/CI,
run/Worker IDs, artifact digests, integrity counts, smoke history/report hashes
và sáu stability observations. Không chứa private sessions, account IDs,
raw inventory/events hoặc screenshots. Original staging/production report
checksums được đối chiếu lại trước final publication.

Continuation chỉ sửa tám documentation/evidence files; `git diff --check`,
JSON parsing/schema assertions/sanitization PASS. Không chạy lại fixtures/journeys
đã certified hoặc full local runtime suite cho thay đổi docs. CI hosted của
final PR head kiểm tra lint/typecheck/tests/migration smoke/build riêng.

Core T20 production rollout và functional certification đã hoàn tất.
PR #63 giữ reviewable/unmerged; CI của đúng head cuối và independent documentation
review được theo dõi tại PR. Không cần production dispatch thêm, replay journeys,
0039/recovery/import hoặc failed AI scan.
