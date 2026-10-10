# UI12 - Kế hoạch ảnh cho Tako-san

2026-10-11 JST. Kết quả audit local; không phải thống kê production hoặc xác nhận
quyền sử dụng. Chi tiết machine-readable: `evidence/media-plan.json` và
`evidence/media-mapping.json`; không thay catalog mapping trong UI12.

## Hiện trạng

| Loại mapping canonical local | Số món | Xử lý |
| --- | ---: | --- |
| Legacy fallback được policy cho phép | 6 | Giữ compatibility; duyệt nguồn/crop trước promotion |
| Sai món hoặc thiếu file | 6 | Không lấy ảnh có vẻ tương tự để lấp chỗ trống |
| Minh họa chung | 429 | Giữ missing trung thực; lập danh sách theo demand thực |
| Photo chưa duyệt | 59 | Kiểm chứng đúng món, tác giả, license và variant |

Tổng500canonical,71static,46URLs,500media rows pending,21nhóm tái dùng URL.
8ảnhlocal có byte hash,0duplicate local hashes; không kết luận ảnh remote trùng
hoặc hợp pháp từ kiểm tra file local. 494mapping cần review/correction khác với
500media rows chưa được promote.

## Thứ tự thực hiện

1. Dùng24món đầu discovery local làm bộ review đầu. Ba món đầu cũng hiện ở Home;
   ưu tiên vì đang trực tiếp chi phối hành trình, không phải giả định traffic.
2. Làm bảng duyệt có ID/slug/tên, source URL/path, chủ thể cần có, nguồn/quyền dùng,
   current mapping và crop card/hero. Không tự đánh dấu approved từ HTTP200/hash.
3. Chủ dự án xác nhận nguồn hoặc cung cấp license/chỉ thị tạo ảnh phù hợp. Nếu dùng
   ảnh tạo, lưu rõ provenance và duyệt đúng món; không gắn nó thành ảnh tư liệu.
4. Chỉ với tập đã duyệt: tạo variants theo contract hiện có, ghi kích thước/format/
   hash/crop và test fallback/accessibility. Promotion vào mapping/media storage
   phải có packet riêng, không thay resolver/tenancy/auth trong đợt ảnh.
5. Đo LCP/bytes trên network/thiết bị phù hợp sau khi có nội dung thật; rà thẻ trộn
   photo/missing để tránh lưới lệch khó đọc. Giữ neutral missing cho món chưa duyệt.

## Acceptance của bộ duyệt

24recipe records trace được tới local demand;8local asset records có hash. Mỗi
candidate có creator/source/license hoặc generation provenance, subject review,
hero/card crop,variant dimensions/hash và người duyệt. Pending/unknown phải hiện
rõ. Không promotion tự động, không credentials/remote write hoặc đổi thương hiệu
chỉ để bù ảnh thiếu. UI13 packet định nghĩa bộ review local tiếp theo.
