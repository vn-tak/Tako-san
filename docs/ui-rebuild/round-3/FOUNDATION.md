# UI03 — Discovery nhẹ hơn và ảnh món ăn trung thực

Canonical repo: `vn-tak/Tako-san`; tiếp từ UI02 `87cfbdf` tại checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Packet: `../../ai/tasks/UI03-discovery-api-media.md`; ADR-046. Đây là một milestone
local của rebuild, không phải hoàn tất toàn hệ thống hay bộ nhận diện cuối cùng.

## Kết quả thực tế

Home nhận3 thẻ gợi ý; catalog nhận24. API discovery riêng trả thông tin dùng cho
thẻ và số nguyên liệu cần kiểm tra. Nguyên liệu, hướng dẫn, nutrition và bằng chứng
lot không nằm trong list; recipe detail tiếp tục tải riêng. API cũ giữ payload và
các consumer chưa migrate. Cùng recipe authority static/D1, household guard và
quantity arithmetic của UI01; lỗi đọc kho không thành kho trống hoặc cache cũ.

Tìm kiếm có/không dấu theo tên món, mô tả, tag và tên nguyên liệu; ẩm thực, cách
nấu, vùng miền, thời gian và không mua thêm lọc toàn catalog trước phân trang.
Thứ tự theo score/coverage/time, rồi stable ID khi hòa điểm. Cursor của link trước/
sau gắn với trang, bộ lọc, page size, nguồn/fingerprint catalog và kho của household.
Kho/catalog đổi →409 → giải thích ngắn + nút tải từ trang đầu, giữ bộ lọc. Direct
link không cursor đọc dữ liệu hiện tại và clamp trang. Reload/back/return từ detail
và focus vẫn được kiểm tra. Search debounce250ms; request cũ không ghi đè kết quả mới.

Offline có nhãn nguồn trên thiết bị, dùng static71 và kho local theo session. Không
đổi503 hoặc lỗi contract thành offline fallback. Khi đổi từ server sang device hoặc
ngược lại, cursor cũ yêu cầu restart; không ghép hai catalog thành một danh sách.

## Bằng chứng payload và responsive

Cùng local Worker, catalog500 và inventory fixture của preview:

| Payload | JSON trước nén | Gzip tính local |
| --- | ---: | ---: |
| Legacy recommendations,500 món full | 1.081.667 bytes | 130.990 bytes |
| Discovery trang đầu,24 món | 14.194 bytes | 3.010 bytes |

Giảm98,69% raw JSON và97,70% gzip tính local cho first request tương ứng. Đây là
so payload500 full với24 summary; không phải benchmark cùng số item hoặc latency/
CWV/production transfer. API integration fixture khác:14.117 raw /2.937 gzip.
Duyệt21trang cover500 ID duy nhất, không mất/trùng; Home chỉ3 summary. Media metadata
chỉ đọc IDs của trang trả về. Server vẫn hydrate/read catalog và chấm candidate
trên mỗi request; chưa phải database keyset pagination hoặc tối ưu CPU/ranking cache.
Authority D1 giữ TTL/readiness/fallback hiện hành; cursor so với snapshot thực sự
được authority chọn, không tuyên bố nhìn thấy mọi DB edit ngay lập tức.

15states được axe/layout/reduced-motion kiểm tra tại320/390/768/1024/1440px,17PNG:
0violation,0overflow,0broken-image,0pageerror trong ma trận đã chạy. Screenshot review
phát hiện placeholder4:3 đẩy tên món xuống dưới fold mobile; grid đổi sang hàng80px
có icon/nhãn thiếu ảnh. Photo card giữ ảnh khi có mapping được phép. Header/filter/
results/empty/error/offline/stale-link giữ typography và palette prototype UI01/02.

## Audit mapping ảnh — phát hiện thẳng thắn

Fresh replay500 công thức, rollback static71,46URL,21 nhóm URL được dùng nhiều món.
Có8file local được catalog tham chiếu đã hash và đo kích thước; contact sheet
review13file hiện hữu, gồm5file chưa được catalog dùng. Không có duplicate byte hash
trong tập URL dùng thực tế. URL reuse và duplicate bytes là hai bằng chứng khác nhau.
500hero metadata đều pending trong fresh replay; không phải chứng nhận production R2.

| Nhóm | Số món | Cách xử lý presentation |
| --- | ---: | --- |
| Illustration “Delicious!” tô mì chung cho món import |429| Placeholder trung tính; giữ artwork làm illustration khi đúng ngữ cảnh |
| Legacy Unsplash chưa có review/provenance chứng minh đúng món |59| Tạm quarantine; không kết luận từng ảnh sai khi chưa xem bytes |
| Mapping global sai món hoặc file không tồn tại |6| Quarantine chính xác theo ID+URL cũ |
| Local global có subject correspondence phù hợp |6| Giữ compatibility; chưa claim license/provider provenance đã xác minh |

6mapping lỗi: Kimbap/Tokbokki→kimchi fried rice; Chawanmushi→Oyakodon;
Green Curry→Pad Krapow; Bolognese→carbonara.webp không tồn tại; Chinese tomato egg→
ảnh đậu phụ sốt cà. Không thay bằng một ảnh “gần giống”, không tạo ảnh mới hay sửa
rawcatalog/applied migrations/release fingerprint. Canonical ready hero vẫn ưu tiên;
ảnh canonical lỗi chỉ fallback vào legacy được phép hoặc placeholder, có alt trung
thực. Tổng494/500 mapping legacy cần xử lý/review, chưa phải494ảnh mới đã có.

Contact sheet của13file, mapping đủ từng ID/URL/bytes/dimensions/hash và giới hạn
provenance: `evidence/legacy-contact-sheet.png`, `evidence/media-mapping.json`.
Nguồn recipe/import/generation không được dùng thay nguồn ảnh. Remote Unsplash không
fetch/download/verify; không dùng dữ liệu riêng tư hoặc provider để lấp chỗ trống.

## Tiếp theo

UI04: scan/review/editor như một vertical slice riêng. Inspect toàn vòng upload →
draft review → sửa quantity/unit/expiry/canonical mapping → confirm → inventory và
session/offline conflict. Record packet/ADR trước thay cấu trúc; dùng cùng header,
component controls/state/brand prototype; giữ explicit user confirmation và mọi
trường uncertainty/source/expiry. Sau đó cooking/planner/shopping/remaining screens.

Ảnh món ăn là content workstream: review/license6 local, tạo hoặc chọn master cho
30–50 món ưu tiên, thumbnail/hero variants và media promotion theo quy trình có QA.
Brand final/PWA/OG/avatar/icon/export/motion chưa hoàn tất; avatar xanh trong preview
là fixture hiện tại, không phải tài sản đã đồng bộ nhận diện. Device/Safari/screen-
reader/usability và hosted CI/release vẫn cần gate riêng. Không push/deploy UI03.

## Asset budget còn lại

8file được catalog tham chiếu tổng650.210bytes; illustration chung216.750bytes
đã bị ngừng dùng như recipe photo. Sáu ảnh global được phép có52.622–65.846bytes,
436px ngang. 3/6 ảnh vượt mục tiêu60KiB của roadmap; chưa có thumbnail/hero variants,
`srcset` hay provenance/licensing chứng nhận. Dùng master này trên card desktop
DPR2 không đủ mật độ pixel; chưa coi media budget và chất lượng ảnh đã hoàn tất.
Chi tiết từng URL/file/hash/dimensions trong mapping JSON.5ảnh local khác có trên
contact sheet nhưng chưa được catalog chọn; không tự remap khi chưa review món.
