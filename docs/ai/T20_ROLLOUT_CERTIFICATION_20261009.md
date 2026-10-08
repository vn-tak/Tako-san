# T20 — Bằng chứng rollout và chứng nhận 2026-10-09

**Task/status:** `T20_STAGING_CERTIFIED_PRODUCTION_ROLLOUT_PENDING`. Checkpoint lúc 2026-10-08T23:18:19.930Z.

**Repository/source:** vn-tak/Tako-san, ID1385308553, main/source đã pin `27d47b056455a57df811199cd7e9c32a84cbffe5`, reviewed hardening head `8b7b254ddcc9e0a36989a2c8c3add6ad3d776ee9`. PR62 normal merge theo operator authorization “Cho phép PR #62 và tiếp tục rollout”; không gọi operator response là GitHub code review hay Environment approval. Main-push CI [37853046693](https://github.com/vn-tak/Tako-san/actions/runs/37853046693) SUCCESS:259files/6365tests,0FAIL; lint/typecheck/local migration smoke/build PASS. Main CI suite429.15s. Không thay dependencies/runtime/schema trong PR62.

**Verification:** Final-source staging D1 readiness [37853983168](https://github.com/vn-tak/Tako-san/actions/runs/37853983168) SUCCESS:ledger39/tip0039,D1500,hydration0,ID/order/legacy/fingerprint/provenance/integrity match. Stage proofs đối chiếu artifact ZIP digests/manifests/source/CI, paired flags và ba lần live source/service-worker assets; chi tiết `T20_ROLLOUT_CERTIFICATION_20261009.md`. Hosted staging45/45PASS,0FAIL/0skip tại390/768/1280; fixed policies none/forbidden/dietary/nutrition được prepare/audit bằng workflow staging giới hạn; inventory/event snapshots khớp và unexplainedWorker5xx0. Production functional smoke chưa PASS.

**Readiness:** CODE_COMPLETE=true; TEST_VERIFIED=true; STAGING_CERTIFIED=true; PRODUCTION_READY=true; PRODUCTION_ENABLED=false; PRODUCTION_FUNCTIONAL_SMOKE=false. Các nhãn chỉ áp dụng scope/evidence ghi rõ; không lấy deploy success làm product completion.

**Isolation/rollback:** Paired T20/planner flags qua reviewed Deploy workflow, production bắt buộc reviewer vn-taphoanhatung mỗi run; không bypass. Không recovery/import/replay0039/failed AI scan, đổi secrets/bindings/PayOS/auth hoặc inventory write. Rollback paired T20false/plannerfalse trên cùng reviewed source, giữ catalogD1/ledger39/composition records; dùng workflow và reviewer chuẩn trong `T20_RELEASE_READINESS.md`. Private sessions/logs/screenshots giữ ignored, chỉ publish aggregate.

**Next action:** Run production shadow 37858608953 đang qua release gate/chờ Environment reviewer vn-taphoanhatung; https://github.com/vn-tak/Tako-san/actions/runs/37858608953 . Sau approval, collect artifact/live proof rồi 1/5/25/D1 cùng source. Chưa có private session production: cả hai cửa sổ Chromium login đã hết hạn, không có session được capture; cần đăng nhập đúng cửa sổ kiểm thử khi operator tiếp tục. Không redispatch run hoặc fixtures/journeys đã certified.


## Deployment stages

|Environment|Stage|Kết quả|GitHub run|
|---|---|---|---|
|staging|shadow-0|PASS|[37854154953](https://github.com/vn-tak/Tako-san/actions/runs/37854154953)|
|staging|canary-1|PASS|[37854379595](https://github.com/vn-tak/Tako-san/actions/runs/37854379595)|
|staging|canary-5|PASS|[37854606958](https://github.com/vn-tak/Tako-san/actions/runs/37854606958)|
|staging|canary-25|PASS|[37854792161](https://github.com/vn-tak/Tako-san/actions/runs/37854792161)|
|staging|d1-0|PASS|[37855017250](https://github.com/vn-tak/Tako-san/actions/runs/37855017250)|
|production|shadow-0|CHƯA THỰC HIỆN|—|
|production|canary-1|CHƯA THỰC HIỆN|—|
|production|canary-5|CHƯA THỰC HIỆN|—|
|production|canary-25|CHƯA THỰC HIỆN|—|
|production|d1-0|CHƯA THỰC HIỆN|—|

## Giới hạn bằng chứng

Ma trận28capability, fixes và deferred classification ở `T20_TAKEOVER_AUDIT.md`; whole-week V2 Auto, leftovers, per-component servings, role curation, drag-and-drop và real-price scoring giữ OPTIONAL/DEFERRED theo rationale. Staging synthetic500/404 là browser interception, không phải Worker failure/hosted flag-off drill. Actual staging flags luôn pairedon trong journeys. Flag-off/no-schema evidence là local integration/browser/build. Production smoke giới hạn5journeys/mobile390 bằng tài khoản đăng nhập bình thường; không có production restricted fixture hoặc cross-household second account. Cooking chỉ đọc, không consume stock; không gửi provider scan. Production event-ledger invariance không được chứng nhận bằng HTTP stock equality.

Prod dependency audit0high/critical,2moderate hiện hữu; tooling audit dev2critical/16high hiện hữu được ghi trong audit, không đổi dependencies hoặc claim repository-wide security PASS. Benchmark local Worker Auto median191.44/p95225.95ms/29SQL từ implementation audit, không phải hosted CPU/SLA.

## Run production đã khởi tạo

[Production shadow37858608953](https://github.com/vn-tak/Tako-san/actions/runs/37858608953)
đã dispatch sau staging certification; release job SUCCESS, production job waiting.
GitHub API xác nhận required reviewer vn-taphoanhatung và
current_user_can_approve=false cho CLIvn-tak. Bảng “CHƯA THỰC HIỆN” chỉ kết quả
deployment/proof chưa đạt, không có nghĩa chưa dispatch. Production source phục vụ
chưa thay đổi tại checkpoint; T20 production vẫn chưa được chứng nhận/enabled.

## Thời gian và audit thực

Main hosted suite36PASS/0skip/0flaky:1443891.551ms (24.1min).
Restricted hosted suite9PASS/0skip/0flaky:159774.608ms (2.7min).
Đây là wall time browser journeys qua mạng, có compute throttle giữ rate limit,
không phải Worker CPU benchmark. HTTP windows45unique/statuspassed cùng source,
5xx bất thường0. Synthetic failure tests được đánh dấu rõ.

Prepare/audit runs: none37855296480/37858233428;
forbidden37855367431/37858300518; dietary37855441990/37858367077;
nutrition37855512801/37858464407. Mỗi prepare1policy insert, audit0write;
stock/event counts và hashes của từng hộ khớp. Không publish raw household IDs,
session tokens, OTP/password, inventories/events hoặc screenshots.

Hai production Chromium login attempts timeout10/20min, chưa capture registered
session. Không claim production smoke PASS hoặc dùng cookie từ browser khác.
Session sẽ được nhận qua normal UI khi operator đăng nhập cửa sổ kiểm thử mới.

## Kiểm tra public production tại checkpoint

Read-only health API trả200/JSON, source đang phục vụ vẫn
`6f6eaaab518cf2430de225d0be73d695b40706e4`, environmentproduction,
catalogModed1 và fallbackReasonnull. Probe `/composition-flags.json` trả SPA HTML
nên JSON parse thất bại; không dùng probe này làm bằng chứng compiled flags.
Bằng chứng build flags là pre-upload guard và release manifest của workflow;
production browser/routes mới chưa được kiểm thử. Không thay runtime để thêm
endpoint chẩn đoán cho probe này.
