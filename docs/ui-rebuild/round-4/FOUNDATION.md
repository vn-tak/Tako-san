# UI04 - Quét, kiểm tra và xác nhận vào tủ

Canonical `vn-tak/Tako-san`, nhánh local `codex/ui-rebuild-foundation`, base
`cf607e4f402aecd0964b2f730bb2c9e1c6b17b0d`. Packet
`docs/ai/tasks/UI04-scan-review.md`; ADR-047. Đợt này tiếp nối UI01–UI03.

## Kết quả giao diện

Luồng ảnh nguyên liệu và hóa đơn dùng chung heading, tóm tắt, trường sửa, khu vực
ảnh nguồn và thanh xác nhận. Giữ pine/coral/warm canvas, Be Vietnam Pro và shell
prototype Tako-san. `/scan` vẫn là workspace riêng; review vẫn có navigation.
Desktop chia tóm tắt/ảnh nguồn và form thành hai cột; mobile cuộn một cột. Mẹo chụp
thu gọn bằng native details để camera và nút thư viện nằm cao hơn. Có chọn ảnh khác
sau lỗi; camera không sẵn sàng vẫn tải ảnh được.

Trường nhập 16px, cao 48px; tất cả 8 đơn vị có nhãn Việt và giá trị wire giữ nguyên.
Xóa lượng giữ ô trống, nhập 0 vẫn hiện0 và báo lỗi, không thay thành 1. Hạn dùng do
người dùng cung cấp, ước tính3/7 ngày và chưa rõ vẫn tách biệt. Thu nhỏ viewport
chiều cao≤520px đưa action về document flow; sticky action ở màn cao giữ khoảng
navigation. Font/overflow đã kiểm tra ở320/390/768/1024/1440; xem VERIFICATION.

## Đánh giá và sửa cụ thể

| Vấn đề đã xác minh trong source | Thay đổi UI04 |
| --- | --- |
| Photo/receipt form lệch cách trình bày; chữ nhỏ, wire unit code | `ReviewFields` dùng chung; nhãn rõ, input16px, lỗi trực tiếp tại dòng |
| Scan tự chuyển queue/AI/validation theo450/1100/2200ms | Bỏ timer giả; chỉ hiện request đang gửi, queued/processing từ DTO |
| Review có tóm tắt và banner lặp, camera nằm thấp trên mobile | Bỏ banner trùng ở ready có dữ liệu; tips mở rộng, camera h48dvh có giới hạn |
| Dòng photo bị từ chối vẫn tham gia native validation | Disabled fields; gửi ID+rejected, server hydrate evidence của dòng |
| Programmatic submit có thể bypass native validation | Guard accepted name/quantity/date trước confirmation; manual add guardquantity |
| Photo confirm bỏ qua pendingSync | Giữ feedback chờ đồng bộ, khóa sửa và xóa draft đã queue khi rời review; quay lại tải server |
| Synthetic offline import nhận cả dòng rejected, lượng lỗi thành 1 | Bỏ qua rejected; validate mọi accepted quantity trước mọi local mutation; import0 không báo pendingSync |
| Offline estimate bị rơi qualifier | Giữ expiryEstimated trong outbox và kind/date trong local projection |
| Camera cleanup dùng stream cũ từ closure; read ảnh còn chờ khi đổi mode | Effect sở hữu stream đã mở; dừng khi đổi camera/unmount, cả late response; hủy read và reset file input khi đổi mode |
| Ảnh trong store chưa gắn scan ID; receipt lookup ảnh dùng rawName sai tham số | Bind ảnh khi upload trả về; chỉ preview matching ready/confirmed; sửa ingredient lookup |

Raw AI/OCR, confidence (kể cả0hoặc thiếu), giá và ngày mua không được tính lại từ
các chỉnh sửa. Không có số liệu0để thay giá thiếu. Review confirmed chỉ xem, báo
hạn dùng đã xác nhận đúng evidence server. Nút Week shopping của hóa đơn giữ nguyên.
Session/route fencing, quota/retry keys, optimistic revisions, conflict refetch,
idempotent inventory command và Week compatibility không thay authority.

## Những việc đã ưu tiên

Lỗi đưa dòng bị từ chối vào stock offline và biến lượng lỗi thành 1 được ưu tiên
trước vì làm thay đổi dữ liệu tủ. Tiếp theo là feedback đồng bộ, quyền xem ảnh
nguồn và vòng đời camera/read ảnh. Cuối cùng là typography, bố cục, đơn vị và
motion. Chưa có thử nghiệm người dùng để kết luận giao diện này nhanh hơn; các
kết luận ở đây dựa trên source, thao tác browser và kiểm tra dữ liệu local.

## Giới hạn phải giữ rõ

Ảnh nguồn chỉ nằm trong memory của phiên upload và chỉ hiện khi đã bind đúng ID;
reload/deep link không tải lại ảnh riêng tư. Không tạo persistence/read path mới.
Receipt có metadata/evidence khác photo nên lifecycle/confirm handlers vẫn riêng;
shared component chỉ nhận editable fields, không sở hữu command.

Chưa có picker đổi canonical mapping. Worker hiện đối chiếu tên theo existing
normalizer rồi có thể giữ canonical mapping cũ của scan nếu tên mới không khớp.
Đợt này không bảo đảm rằng sửa sang tên chưa biết sẽ xóa mapping đó. Cần một
packet/ADR riêng cho quyền sửa/remap, ambiguous/unmapped và source evidence trước
khi bổ sung picker; không thêm một static catalog authority để làm giao diện đẹp.

Không thêm ảnh món/mascot mới hay xuất brand kit final; chỉ dùng asset hiện hữu,
sửa lookup ảnh nguyên liệu và scoped wordmark. Brand, icon/PWA/OG và content media
vẫn theo roadmap. Chưa đo conversion, usability, CWV hay độ chính xác OCR/provider.
Không claim ảnh thật/camera thật/Safari/device/screen-reader đã chứng nhận.

## Kiểm chứng và tiếp theo

188 tests tập trung qua 13 files, gồm 10 offline regressions trên source cuối.
Standalone offline10 đã chạy ở vòng trước sau sửa nullable test assertion. Chromium local: 29 axe/layout checks, 51 PNG, 8 nhóm journey,
0 axe/overflow/brokenimage/pageerror; ảnh full và viewport trong `evidence/`.
Full repo gate exit0: 268 files/6490 tests PASS (Vitest 324.11s), lint/typecheck/
migration smoke/build PASS;19source hashes giữ nguyên và52evidence payload verified.
Implementation hash trong VERIFICATION và docs/ai/HANDOFF. Không push/PR/merge/deploy hay remote DB/R2 writes.

UI05 tiếp theo: kiểm tra và rebuild luồng chuẩn bị → nấu từng bước/timer → sửa
lượng đã dùng → explicit complete → inventory; tiếp tục giữ multiple compatible
lots, command/revision/idempotency/session/offline và quantity arithmetic UI01.
Planner/composer/shopping/settings/remaining routes, canonical remap editor,
brand final, media batches và QA thiết bị vẫn là các hạng mục riêng còn mở.
