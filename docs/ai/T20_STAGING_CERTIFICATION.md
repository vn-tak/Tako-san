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
