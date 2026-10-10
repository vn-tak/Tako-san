# UI13 - Bộ duyệt ảnh món của Tako-san

Mở [media-review.html](media-review.html) trực tiếp trên trình duyệt từ checkout.
Ảnh, font và logo lấy từ repo; HTML cần giữ vị trí tương đối với `public/`.
Hoặc chạy preview chỉ đọc từ thư mục gốc repo:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH node scripts/ui13-media-review.mjs serve
```

Mở `http://127.0.0.1:5215`. Preview chỉ bind localhost, cho GET/HEAD với board và
assets trong allowlist. Không có domain API. Ctrl+C để dừng.

## Cách dùng

1. Tìm hoặc lọc món; chọn **Duyệt ảnh và crop**. Ảnh đang hiển thị và đề xuất được
   trình bày riêng.
2. Chọn một trong tám ảnh gốc để so sánh khung 4:3, 16:9 thử nghiệm và khung gốc.
   Nếu chưa có ảnh đúng món, giữ chờ duyệt và ghi brief cần bổ sung.
3. Ghi nguồn, tác giả, quyền, đúng món, crop, người và ngày duyệt. Trạng thái có biên
   bản yêu cầu đủ trường; JSON hợp lệ chỉ kiểm cấu trúc, không xác nhận license.
4. **Giữ trong bản nháp** chỉ lưu trong phiên. Tải JSON để giữ ngoài phiên và kiểm
   tra tệp đã được lưu. Reload về bản nháp mới; nhập JSON đã tải để tiếp tục.
   File sai không thay dữ liệu đang có. Export luôn đủ 24 món dù đang lọc.

Mỗi trường tối đa 2.000 ký tự; file nhập tối đa 3 MiB, đủ cho mọi bản nháp hợp lệ
kể cả JSON escape. Đóng hoặc Escape bỏ sửa chưa giữ trong dialog và trả focus.
Các review đã giữ vẫn còn trong phiên. Trình duyệt có thể cảnh báo khi rời trang
có thay đổi; không dựa vào cảnh báo đó để giữ dữ liệu.

Nguồn và quyền của tám ảnh gốc vẫn chưa rõ. Claim có biên bản của người duyệt
không phải ảnh đã được hệ thống xác minh. Bảng không áp dụng ảnh vào catalog.

## Tạo và kiểm tra

Dùng Node 24 và dependencies đã có trong repo:

```sh
node scripts/ui13-media-review.mjs build
node scripts/ui13-media-review.mjs check
node scripts/ui13-media-review.mjs validate
node scripts/ui13-media-review.mjs validate /absolute/path/to/exported-draft.json
pnpm exec vitest run tests/unit/ui13-media-review.test.mjs
```

`build` tạo lại HTML, dataset và bản nháp ban đầu, ghi đè `review-draft.json`.
Giữ các bản người dùng export riêng. `check` kiểm output xác định và hash của tám
ảnh gốc; `validate` kiểm draft với dataset, không xác nhận quyền sử dụng. Sửa
source trong `scripts/ui13/`, không sửa trực tiếp HTML đã tạo.

Khi preview đang chạy, ở terminal khác:

```sh
node scripts/ui13-browser-check.mjs
```

[Đánh giá từng ảnh](ASSET_REVIEW.md), [kết quả và giới hạn kiểm chứng](VERIFICATION.md),
[kế hoạch](PLAN.md). Dataset dựa trên snapshot UI12 được đối chiếu catalog/resolver
local hiện tại; không phải analytics production hoặc phê chuẩn thương hiệu.
