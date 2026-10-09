# T20 — Chứng nhận staging bằng tài khoản bình thường

Ngày 2026-10-09 JST. PR60 đã merge thành
`5dfab234247dcbee1339decf39b6a7d999869c11`; CI main-push37845102901 SUCCESS.
Operator cho phép merge PR60 và rollout theo các gate chuẩn; đây không phải
GitHub review độc lập hay approval Environment production.

## Hai điều kiện phát hiện khi thực thi

1. `validateRecipeCatalogTransition` trong `scripts/release-check.mjs` yêu cầu
   SHA mới bắt đầu lại ở shadow trước canary1/5/25/D1. Input d1 trực tiếp ở packet
   trước sẽ bị guard từ chối. Giữ nguyên guard này; staging phải chứng nhận đủ
   chuỗi trên cùng SHA, production vẫn cần normal Environment review mỗi lượt.
   Không import catalog, sửa migration, đổi fingerprint hay bypass gate.
2. Household hard policies dùng `household_ranking_preferences`, khác legacy
   `/preferences`. Không có HTTP API để tạo các policy này. Không thể coi thử
   payload client hoặc local browser fixture là chứng nhận hosted staging.

## Công cụ fixture giới hạn staging

Workflow `T20 Staging Restricted Household Fixture` chỉ dispatch từ main với
`confirm_staging_fixture=true`, exact-main CI PASS, source staging đúng SHA,
D1/no fallback và binding database staging
`7854298a-20f5-46aa-9cbf-917079c2a3dd` / `frigo-db-staging-v3`.

Đầu vào chỉ có `userId`, `householdId`, email reserved `t20-cert-<uuid>@example.com`
và policy enum. Các hộ phải được tạo qua register → OTP → session bình thường.
SQL kiểm tra account verified, hộ khớp principal và membership owner. Một insert
chỉ áp dụng khi chưa có policy; không upsert/overwrite. Caller không gửi SQL,
policy values, database ID, origin hoặc secrets tùy ý. Policies cố định:

- none: baseline không hard household restriction.
- forbidden: RICE và CHICKEN_EGG.
- dietary: vegetarian.
- nutrition: proteinG hard max80; unknown evidence phải fail closed.

`prepare` chèn một policy cho hộ mới, quan sát hash tồn kho và sự kiện trước/sau,
chặn nếu thay đổi. `audit` chỉ đọc để so sánh sau journeys. Aggregate receipt chỉ
chứa SHA/CI, database identity, policy, household hash, counts/hashes và số writes.
Cookies/password/OTP/raw inventory/events không được upload. Không cấp session,
đổi auth, catalog, migration, Worker, secrets hay production.

## Thứ tự chứng nhận

Pin SHA cuối sau khi merge tooling và CI main-push PASS. Deploy staging lần lượt
shadow →1% →5% →25% →D1 qua Deploy hiện có, T20true và plannertrue. Verify checksum
artifact, source, build flags và runtime fingerprint sau từng lượt.

Chuẩn bị baseline hộ thử và ba restricted households. Tạo plan và empty composition
qua API bình thường trước khi insert policy. `prepare` lưu baseline inventory/event
hash. Chạy hosted browser A–I trên mobile390/tablet768/desktop1280, hai sessions
cùng hộ để kiểm tra200/409 và hộ khác để kiểm tra403/404. `audit` sau journeys phải
khớp baseline hashes/counts; shopping/planning không consume stock.

Local flag-off/no-schema và browser flag drills giữ receipt riêng. Synthetic500 và
404 do browser intercept phải ghi rõ là frontend failure tests, không phải lỗi
Worker thật hoặc chứng nhận đã tắt flags trên staging. Không thay flags staging
trong lúc các journeys đang chạy.

Chỉ khi receipt source cuối và mọi gate đạt mới request production workflow;
reviewer `vn-taphoanhatung` duyệt Environment bình thường. Không dùng quyền admin
để bypass. Không chạy lại scan AI thất bại hoặc migration0039.

## Sửa contract timestamp trước lần prepare đầu tiên

Migration0021 yêu cầu updated_at ở UTC ISO với mili giây. Fixture dùng
strftime đúng format, được kiểm tra prepare/audit cả bốn policy trên toàn bộ
migration chain bằng SqliteD1. Không sửa constraint/migration để chấp nhận format
sai. Lỗi datetime cũ tái hiện4FAIL trước,27/27 focused tests PASS sau sửa.
Không có remote fixture write hay deploy nào trước khi tìm và sửa lỗi này.

## Kết quả thực thi trên source cuối — 2026-10-09 JST

`STAGING_CERTIFIED`, source `27d47b056455a57df811199cd7e9c32a84cbffe5`,
hardening head operator đã duyệt `8b7b254ddcc9e0a36989a2c8c3add6ad3d776ee9`.
PR62 normal merge; exact-main CI37853046693 SUCCESS,259files/6365tests.
Final-source D1 readiness37853983168 SUCCESS:ledger39/0039,D1500,hydration0,
ID/order/legacy/fingerprint/provenance/integrity match.

Staging shadow37854154953 →1%37854379595 →5%37854606958 →25%37854792161
→D137855017250 đều PASS. Mỗi stage verify hai ZIP artifact digests/source/manifests
và ba live readiness/service-worker assets observations. Cuối chuỗi D1/cutovertrue,
T20/planner pairedtrue, release rel-bd00a4f53fcaeee4, fingerprint
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.

Browser36/36 normal journeys PASS24.1min; restricted9/9 PASS2.7min,
0FAIL/0skip/0retry,390/768/1280. Tất cả45 HTTP windows đúng source, unique,
statuspassed và unexplainedWorker5xx0. Manual/A11y/axe, Assisted2 actions/locks,
Auto3options/preview-no-write, shopping100g, time10/20, D1-only detail/cooking
reads,200/409, tenancy và frontend failure/rollback đều đạt. Synthetic500/404
được ghi rõ; không thực sự tắt hosted flags trong lúc test.

|Policy|Prepare run (1 insert)|Audit run (0 writes)|Stock/events trước-sau|
|---|---|---|---|
|none|37855296480|37858233428|Khớp counts/hashes|
|forbidden|37855367431|37858300518|Khớp counts/hashes|
|dietary|37855441990|37858367077|Khớp counts/hashes|
|nutrition|37855512801|37858464407|Khớp counts/hashes|

Staging receipt aggregate được lưu private ignored tại
`.wrangler/t20-rollout/20261009/staging-functional-certification.json`.
Playwright reporter resolve relative paths theo config directory; collector đọc
đúng report thực tại đường dẫn nested, giữ nguyên bytes và checksum, không sửa
report hoặc rerun journeys. Không upload private accounts/cookies/screenshots.
Báo cáo public: `T20_ROLLOUT_CERTIFICATION_20261009.md`.

Production shadow37858608953 đã dispatch sau certification theo authorization;
GitHub Environment đang chờ vn-taphoanhatung duyệt, CLIvn-tak không được duyệt.
Chưa deploy hoặc certify production T20. Private production browser session
chưa capture; hai cửa sổ login10/20min đã hết hạn. Sau protected rollout phải
normal-login smoke5journeys và inventory HTTP snapshot comparison; production
inventory event ledger chưa được query. Không dùng staging PASS thay production.

## Production shadow đã đạt — continuation 2026-10-09 JST

Staging certification45/45 và4stock/event audits vẫn PASS trên source27d47b05.
Production shadow37858608953 đã approved bởi vn-taphoanhatung, workflow/artifact/
live3proofPASS; Worker eb6a181f-e4d7-4697-8737-bb9db292714c,ledger39,D1500,
hydration0/media500/binding/FK/quickcheckmatch. PairedT20/plannertrue đã bật ở
shadow; production canary1run37922994678 đã approved và đang chạy.
Registered normal browser session đã capture ở attempt3; read-onlypreflightPASS.
Actual production5browserjourneys chưa chạy; báo cáo hiện hành trong
`T20_ROLLOUT_CERTIFICATION_20261009.md` thay các nhãn pending/login cũ.
