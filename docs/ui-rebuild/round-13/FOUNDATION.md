# UI13 - Bộ duyệt nội dung ảnh của Tako-san

2026-10-11 JST. Canonical `vn-tak/Tako-san`, checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, branch `codex/ui-rebuild-foundation`.
Base `5da802735c318c56505bed85a133b049728afb39`. ADR-056 ghi trước triển khai.
Implementation: `021220bbcb883360ba79b8101ff9586a67ebc4ae`.

## Kết quả và mục đích

Một bảng duyệt HTML độc lập cho 24 món ưu tiên và tám ảnh gốc đã có trong repo.
Nó biến khoảng trống nội dung sau UI12 thành một quy trình có thể dùng: tìm/lọc
món → xem ảnh đang hiển thị → thử ảnh đề xuất và crop → ghi nguồn/quyền/đúng món →
giữ quyết định trong phiên → tải JSON → nhập lại để tiếp tục. Dùng nhận diện UI07:
logo vector Tako-san, font local, nền giấy, xanh pine và coral.

Ảnh theo resolver hiện tại và ảnh người duyệt đề xuất được trình bày riêng. Bốn
món có ảnh hiện được policy cho phép; 20 món hiện thiếu ảnh phù hợp. Tám file gốc
đều chưa có bằng chứng tác giả, nguồn và quyền sử dụng. Chọn ảnh hoặc nhập đủ
trường không xác nhận những thông tin đó là đúng. Bản nháp ban đầu giữ cả 24 món
ở trạng thái chờ duyệt, không tự chọn ứng viên, luôn `promotionAuthorized=false`.

Bảng thể hiện khung 4:3 đang dùng, khung hero 16:9 thử nghiệm và khung gốc bằng CSS.
Không tạo bitmap mới hoặc variants. Bảy ảnh món chỉ rộng 432–436px; viền trắng/góc
bo có sẵn trong nhiều bitmap làm crop thiếu đồng nhất. Đây là vấn đề nội dung
thương hiệu cần bản gốc tốt hơn và biên bản nguồn/quyền, không thể giải quyết chỉ
bằng đổi màu card. Đánh giá từng ảnh trong [ASSET_REVIEW.md](ASSET_REVIEW.md).

## Công cụ và dữ liệu

`scripts/ui13-media-review.mjs` tạo dataset, bản nháp ban đầu và HTML theo cách
xác định; kiểm lại 24 món bằng catalog static/resolver thực và tám hash ảnh gốc.
Dataset ràng buộc ba input UI12 bằng SHA256. UI12 là snapshot quan sát local, không
phải traffic hay analytics production. Fresh UI13 media audit khớp mapping UI12.
Dataset ID: `a7049ac803bec5094eea69a98ffef5185f32945b2f1adb0d88169bb0dcb4fce6`.

Validator dùng chung ở Node/trình duyệt kiểm đủ 24 mã món duy nhất, tham chiếu ảnh
trong allowlist, trạng thái, ngày thật và các trường nguồn/tác giả/quyền/đúng món/
crop/người duyệt. Claim có biên bản vẫn là khai báo của con người. JSON sai, sai
dataset, thiếu/trùng món hoặc đường dẫn giả không thay bản nháp đang có. Notes
hiển thị qua textContent/value. Nhập bị chậm không được ghi đè lần nhập hoặc lần
lưu review mới hơn. Giới hạn nhập 3 MiB đủ cho mọi draft hợp lệ, kể cả ký tự được
JSON escape; lỗi giới hạn 256 KB ban đầu đã được phát hiện và sửa trước commit.

Preview chỉ bind `127.0.0.1:5215`, GET/HEAD cho board và assets đã liệt kê; POST
trả 405, domain API không tồn tại. CSP ràng buộc script hash và assets local, không
cho connect. Có thể mở HTML trực tiếp khi giữ vị trí trong checkout. Draft lưu
trong bộ nhớ của phiên; tải JSON mới giữ được ngoài phiên, reload về bản nháp mới.
Đóng/Escape bỏ các sửa chưa giữ trong dialog, trả focus về nút mở.

## Kiểm chứng và giới hạn

Chi tiết lệnh, kết quả thật, ảnh và các lượt lỗi ở [VERIFICATION.md](VERIFICATION.md).
Source/protected/public được đối chiếu SHA256; Đã đối chiếu 494 unique Git blobs với 383 source records, 263 evidence
payloads và manifest; [Git receipt](GIT_VERIFICATION.md). Documentation checkpoint
ghi verified implementation, không ghi hash của chính nó. UI14 chỉ là packet audit hiệu năng/motion đã chuẩn bị.

Đợt này hoàn tất công cụ duyệt local, không hoàn tất toàn bộ hệ thống hoặc phê
chuẩn thương hiệu. Thiết bị thật, Safari, native zoom, screen reader, usability,
CWV và hosted release còn mở. Không đổi app-domain runtime, media resolver,
public assets, schema hoặc quyền ảnh. Hướng sử dụng và lệnh ở [README.md](README.md).
