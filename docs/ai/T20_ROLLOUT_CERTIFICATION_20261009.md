# T20 — Bằng chứng rollout và chứng nhận 2026-10-09

## Trạng thái hiện hành

`T20_PRODUCTION_SHADOW_VERIFIED_CANARY_1_RUNNING`.
Source/main `27d47b056455a57df811199cd7e9c32a84cbffe5`; approved hardening
`8b7b254ddcc9e0a36989a2c8c3add6ad3d776ee9`; repo `vn-tak/Tako-san`, ID `1385308553`.
Operator cho phép merge PR #62 và tiếp tục rollout theo gates chuẩn. Operator
response không thay GitHub code review hoặc approval của Environment.

| Readiness | Kết quả |
| --- | --- |
| CODE_COMPLETE | true theo scope core/audit |
| TEST_VERIFIED | true |
| STAGING_CERTIFIED | true |
| PRODUCTION_READY | true theo source/schema/catalog/gates đã đạt |
| PRODUCTION_ENABLED | true, paired T20/planner đã bật ở shadow |
| PRODUCTION_ROLLOUT_COMPLETE | false, còn 1/5/25% và D1 |
| PRODUCTION_FUNCTIONAL_SMOKE | false, năm journeys chưa chạy |

Main-push CI [37853046693](https://github.com/vn-tak/Tako-san/actions/runs/37853046693)
SUCCESS: 259 files / 6.365 tests, 0 FAIL, suite 429.15s; lint/typecheck/migration
smoke/build PASS. PR #62 chỉ sửa fixture timestamp và thêm real-schema regressions;
không đổi runtime/schema/dependencies. PR #63 head `825d5a4` có CI validate PASS;
CI đó không chứng nhận head documentation mới. Giữ PR #63 chưa merge trong rollout.

## Deployment stages

| Environment | Stage | Kết quả | GitHub run |
| --- | --- | --- | --- |
| staging | shadow 0% | PASS | [37854154953](https://github.com/vn-tak/Tako-san/actions/runs/37854154953) |
| staging | canary 1% | PASS | [37854379595](https://github.com/vn-tak/Tako-san/actions/runs/37854379595) |
| staging | canary 5% | PASS | [37854606958](https://github.com/vn-tak/Tako-san/actions/runs/37854606958) |
| staging | canary 25% | PASS | [37854792161](https://github.com/vn-tak/Tako-san/actions/runs/37854792161) |
| staging | D1 | PASS | [37855017250](https://github.com/vn-tak/Tako-san/actions/runs/37855017250) |
| production | shadow 0% | PASS | [37858608953](https://github.com/vn-tak/Tako-san/actions/runs/37858608953) |
| production | canary 1% | APPROVED_RUNNING | [37922994678](https://github.com/vn-tak/Tako-san/actions/runs/37922994678) |
| production | canary 5% | CHƯA DISPATCH | — |
| production | canary 25% | CHƯA DISPATCH | — |
| production | D1 | CHƯA DISPATCH | — |

Mỗi stage PASS có hai artifact ZIP digests/manifests/source/CI được đối chiếu và
ba live source/service-worker asset observations. Production shadow được
`vn-taphoanhatung` approve bình thường. Worker mới
`eb6a181f-e4d7-4697-8737-bb9db292714c`, previous rollback target
`f92df570-6cb0-43de-bfa6-a4c7bd7f07d8`; deployed 100% version và certified D1
binding khớp. Ledger 39/tip 0039, 500 hydrated recipes, hydration failures 0,
500 ready media, FK check `[]` và quick_check `ok`.

Các phần trăm là catalog authority routing theo workflow hiện hữu. T20/planner
paired true từ shadow; global catalog shadow=static/0%/cutover false, protected
D1 probe chứng nhận đủ 500 recipes/fingerprint. Catalog release
`rel-bd00a4f53fcaeee4`, fingerprint
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.

## Staging certification

Final-source D1 readiness [37853983168](https://github.com/vn-tak/Tako-san/actions/runs/37853983168)
PASS: ledger 39, ID/order/legacy/fingerprint/provenance/integrity khớp, hydration 0.
Browser 36/36 PASS (24.1 min) + restricted 9/9 PASS (2.7 min), 0 FAIL/skip/retry,
ở 390/768/1280px. Manual/A11y/keyboard/axe, Assisted hai actions/locks, Auto ba
options, shopping 100g, hard time 10/20, D1-only detail/cooking/shopping reads,
200/409 concurrency, tenancy, untracked và frontend recovery/rollback đều đạt.

45 HTTP windows riêng biệt, status passed, cùng source; unexplained Worker 5xx 0.
Synthetic 500/404 là browser interception. Flag-off/no-schema evidence là local
integration/browser/build; actual staging flags paired on trong journeys.
Wall time gồm network/throttle giữ rate limit, không phải Worker CPU/SLA benchmark.

| Policy | Prepare: một insert | Audit: không ghi | Stock/events trước-sau |
| --- | --- | --- | --- |
| none | 37855296480 | 37858233428 | Khớp counts/hashes |
| forbidden | 37855367431 | 37858300518 | Khớp counts/hashes |
| dietary | 37855441990 | 37858367077 | Khớp counts/hashes |
| nutrition | 37855512801 | 37858464407 | Khớp counts/hashes |

Actual Playwright reporter paths được đối chiếu theo configDir, giữ nguyên bytes/
checksums gốc. Sessions/accounts/raw inventory/events/screenshots giữ private
ignored; chỉ publish aggregate.

## Production normal session và giới hạn smoke

Hai Chromium attempts 10/20 phút trước timeout; attempt 3 đã capture registered
normal UI session private 0600. Read-only profile/inventory preflight PASS,
stock 0 item. GET plans/current và GET picker trả JSON 200 trên shadow source mới;
chưa ghi plan hoặc stock. Probe GET plans ban đầu không có GET route nên trả SPA
HTML 200; đã sửa probe sau khi đọc routes, không sửa API/runtime. Probe
`/composition-flags.json` trước đó cũng trả SPA HTML; compiled flag evidence
đến từ workflow build guard/manifest.

Discovery chọn đúng năm journeys, chưa thực thi. Reporter `--list` được giữ riêng
với checksum; expected 0/skipped 5 không được tính là hosted PASS. Smoke sau D1:
Manual/A11y, Assisted, Auto, D1-only reads và concurrency, mobile 390px, retries 0.
Snapshot stock production hiện rỗng; HTTP equality không chứng nhận nonempty
stock hoặc inventory event ledger. Staging 220g/event invariance có receipt riêng.
Production chưa có restricted fixtures/cross-household second account. Cooking
chỉ đọc; không consume stock hoặc gửi provider scan.

## Scope, rollback và next action

Ma trận 28 capability/fixes/compatibility/deferred: `T20_TAKEOVER_AUDIT.md`.
Whole-week V2 Auto, leftovers, per-component servings, role curation, drag-and-drop
và real-price scoring giữ OPTIONAL/DEFERRED theo rationale. Prod dependency audit:
0 high/critical, hai moderate; dev tooling có hai critical/16 high hiện hữu.
Không đổi dependencies hoặc claim repo-wide security PASS. Local Worker Auto
median 191.44/p95 225.95ms/29 SQL không phải hosted CPU/SLA.

Run canary 1% `37922994678` đã được `vn-taphoanhatung` approve bình thường;
job production đang chạy Local gates. Sau proof PASS mới dispatch 5% → 25% → D1, từng lượt có approval
riêng. Normal-session production smoke chỉ sau năm production stage proofs PASS.
Main/source vẫn pin `27d47b05`; không merge PR #63 giữa chuỗi. Không redispatch/
rerun workflow hiện có hoặc replay 0039/recovery/import/failed scan. Rollback qua
workflow/reviewer chuẩn, giữ ledger 39/composition records/stock; paired T20/planner
false với catalog state được `validateRecipeCatalogTransition` chấp nhận.

Continuation kiểm tra JSON checkpoint và syntax của dispatch/observer/smoke scripts
PASS; `git diff --check` PASS. Không chạy lại fixtures/journeys đã certified hoặc
full local runtime suite cho checkpoint chỉ sửa docs. CI trên head PR mới phải
được xác minh riêng sau push.
