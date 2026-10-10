# UI06 — Thực đơn, chọn món và đi chợ Tako-san

Source chuẩn: `vn-tak/Tako-san`, checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`,
nhánh `codex/ui-rebuild-foundation`; base `e584cf0bc8c5ab5c62b0896157c06f7bd511886b`.
Implementation `c441e194b0fe861fc1e3f81747e6346c30266f09` đã đối chiếu source/evidence.
Packet `docs/ai/tasks/UI06-planner-shopping.md`, ADR-049. Đợt này xây lại phần
trình bày của `/planner`, setup, board, meal, composer/picker và `/shopping` đã lưu.
Trạng thái nghiệm thu và các lệnh thực thi nằm trong [VERIFICATION.md](VERIFICATION.md).
Bộ nhận diện vẫn ở mức prototype; chưa hoàn tất toàn hệ thống.

## Đánh giá thẳng từ source và giao diện

| Vấn đề trước UI06 | Tác động thực tế | Xử lý trong đợt này |
| --- | --- | --- |
| Planner dùng một feed dọc cả trên desktop | Khó so sánh các ngày, lãng phí chiều rộng khi lên thực đơn | Day board 1/2/3 cột theo chiều rộng container |
| Header, card, setup và shopping chưa cùng nhịp thị giác của các đợt trước | Người dùng có cảm giác chuyển sang một sản phẩm khác | Dùng cùng KitchenHeader, pine/coral/warm canvas, Be Vietnam Pro |
| Footer “Legacy Week” quay về chính planner khi flag bật | Liên kết tạo vòng lặp thay vì mở đích hứa hẹn | Đổi thành đích thật `/shopping` đã lưu; giữ route/alias Week |
| Form thêm món có state số lượng nhưng không có ô để nhập | Mỗi món mặc định 1; không thể ghi đúng 0,125 kg hay 125,5 g | Ô tên/lượng/đơn vị, số thập phân dương, tám đơn vị wire hiện có |
| Picker cắt tên, số kết quả chỉ ở vùng đọc màn hình | Khó phân biệt món và biết bộ lọc còn bao nhiêu lựa chọn | Cho tên xuống dòng, hiện số kết quả và reset khi không khớp |
| Tải tìm món thất bại vẫn có thể hiện đang tìm | Người dùng chờ một thao tác đã kết thúc bằng lỗi | Trạng thái lỗi và retry đúng, không tiếp tục báo tìm kiếm |
| Lỗi thêm món nằm phía sau modal | Không thấy lý do thao tác thất bại, focus có thể rời vùng đang mở | Hiện lỗi và đưa focus vào alert bên trong picker |
| Async planner tồn tại qua đổi subroute | Kết quả cũ có thể điều hướng hoặc được nhận vào màn đã bỏ | Workspace remount theo pathname; dùng mounted/session guards sẵn có |
| Check/xóa saved list không trả trạng thái queued; GET có thể che thay đổi đang chờ | “Đã lưu” dễ bị hiểu là server đã nhận; dòng vừa thêm biến mất khi refresh | Receipt server/device, pendingSync đã kiểm chứng và overlay outbox theo thứ tự |
| Input planner 14 px, nút có chiều cao cố định, form hẹp | Khó nhập trên mobile, dễ cắt/chồng nội dung khi phóng chữ | Field >=16 px, button >=48 px và co giãn theo nội dung, lượng/đơn vị tách hàng |

Không cần thay framework hay dựng planner thứ hai để giải quyết các vấn đề này.
Giới hạn có ý nghĩa nằm ở việc giữ thông tin thật và điều khiển vòng đời UI; đổi
màu đơn thuần sẽ không sửa được pendingSync, lỗi sau modal hay callback muộn.

## Luồng sau khi xây lại

1. `/planner/new`: chọn ngày, số ngày, số người, bữa mỗi ngày và chế độ nguyên liệu.
   Khối ngữ cảnh cho biết tổng số bữa và ý định; chính sách/timezone trong details.
   Invalid form được focus và cuộn vào vùng nhìn thấy.
2. Board: ngày có tiêu đề rõ, từng bữa cho biết tên hoặc thành phần, số người,
   thời gian và thiếu/không chắc/untracked theo DTO. Partial và slot chưa xếp vẫn
   có lý do; chưa biết không được trình bày thành đủ hoặc an toàn.
3. Meal/composer: giữ V1, V2, revision, lock, hard constraints, proposal và bước
   chấp nhận riêng. Mở picker có search/role/cuisine, count, empty/reset, focus
   trap/Escape/return; lỗi mutation nằm ngay trong dialog. Bỏ đề xuất không đổi plan.
4. Planner shopping: form ngân sách, giá đã biết/chưa biết và danh sách nhu cầu
   có phân cấp riêng. Plan stale khóa lập danh sách. Checkbox khuyến nghị là nhắc
   việc tạm trên màn, tải lại sẽ reset; không ghi mua hàng hoặc trừ kho.
5. Saved shopping: nhập lượng dương và đơn vị, thêm, đánh dấu, xác nhận xóa.
   Server/device và chờ đồng bộ có thông báo riêng. Đánh dấu chỉ đổi danh sách;
   thêm thực phẩm vào kho vẫn qua quét/nhập và explicit confirm hiện có.

Query snapshot của saved list có suffix riêng để không đưa envelope vào các
consumer đang đọc array. API facade cũ vẫn trả array. Pending POST/PATCH/DELETE
đúng user/household được chiếu lên server/cache theo thứ tự; POST cùng client ID
không thêm hai dòng, DELETE chờ không bị GET làm sống lại, thao tác mới của cùng
món đi sau thao tác cũ đang queued. Chỉ báo queued sau khi kiểm tra entry thật đã
persist. Không có GET bổ sung trong service sau mutation làm che kết quả đã commit.

Sau lỗi chưa xác nhận được, thêm món giữ cùng ID và payload cho retry; khóa sửa
đến khi retry được nhận hoặc known 400 cho phép sửa. Identity này chỉ ở memory.
Cảnh báo beforeunload có giới hạn nền tảng và không giữ draft qua reload/SPA exit.
Server có thể đã commit dù client mất response; queued không chứng minh server
chưa nhận. Khi quay lại planner, đọc server/query cache cho plan đã lưu.

## UI, responsive, asset và motion

Một hướng thị giác nối với UI01–UI05: nền ấm có radial gradient nhẹ, chữ pine,
coral làm điểm nhấn, card nền sáng, viền mảnh. Dữ liệu ngày/bữa có trật tự như sổ
bếp; desktop dùng board, mobile giữ trình tự dọc. Không dùng ảnh món giả để lấp
chỗ trống, không thêm dependency, bitmap hay asset mới trong UI06. Wordmark/font
và icon Lucide dùng tài sản hiện có; mascot và bộ logo final vẫn cần đợt riêng.

Container 550 px chuyển board sang hai cột, 780 px sang ba cột và tách form/ngữ
cảnh, shopping summary/demand, saved form/list. Form quantity/unit xuống một cột
khi container <=380 px. Header/action wrap thay vì ép liên kết thành một dải hẹp.
Description dùng line-height tương đối; nút tăng chiều cao khi nhãn xuống dòng.
Delete dialog giới hạn theo 100dvh và cuộn được. Ma trận thực tế gồm 320/390/768/
1024/1440, 390×420 và gấp đôi computed font tại 320 px; xem evidence.

Motion chính: reveal ngày 220 ms, delay 40/80 ms cho hai ngày tiếp theo, dịch 6 px.
Chỉ chạy khi prefers-reduced-motion cho phép; snapshot đợi animation kết thúc.
Không tạo tiến độ giả, không phát motion để thay thế feedback. Keyboard, labels,
error focus, field dimensions và contrast được kiểm tra trong ma trận Chromium.
Axe PASS không thay thế thử đọc bằng người hoặc screen reader.

Một số ảnh cuối để xem trực tiếp: [board desktop](evidence/v2/planner-board-1440-viewport.png),
[setup mobile](evidence/v2/planner-setup-320.png), [saved shopping desktop](evidence/v2/saved-shopping-1440-viewport.png),
[picker lỗi](evidence/v2/composer-mutation-error-390-viewport.png),
[form phóng chữ](evidence/v2/shopping-text-enlarged-320.png).

## Nhận diện: tiến bộ nhưng chưa đủ để gọi là final

Các luồng cốt lõi đang có hệ màu/chữ/bố cục thống nhất hơn; riêng cảm giác thương
hiệu vẫn dựa vào prototype wordmark và bạch tuộc. Desktop còn lặp wordmark ở sidebar
và header; mobile navigation vẫn giữ cấu trúc tương thích của đợt trước. Những điểm
này cần giải quyết khi chốt shell/brand, thay vì tiếp tục thêm một phong cách mới
vào từng màn. Tên hiển thị đang dùng Takosan trong asset/copy; dự án là Tako-san.
Chưa có phê duyệt nghiên cứu cho cách viết tên hoặc persona.

UI07 nên ưu tiên bộ nhận diện số: vector wordmark/symbol/micro mark, lockup sáng/
tối/một màu, clearspace/min-size, icon/PWA/OG và brand usage. Kiểm tra ở kích thước
16/24/32 và trên chính các màn đã xây; sau đó đồng bộ remaining surfaces theo
inventory route/asset thật. Giữ trục “Ăn đủ. Mua đủ. Dùng hết.” và không hứa AI bảo
đảm kết quả. Mascot cần vai trò và cảnh có ích, không chỉ thêm nhiều pose trang trí.

## Giới hạn nghiệm thu

Legacy Week khi planner tắt giữ presentation cũ; preview hiện có ép planner bật,
UI06 chỉ kiểm chứng alias khi bật và regressions Week hiện hữu. Account/settings/
notifications/onboarding/landing/auth presentation chưa được nghiệm thu trong
packet này. Canonical remap editor, media variants/content và final brand còn mở.
Source recipe title từ backend có thể là ID; chưa đổi contract/backend để tự
bịa tên. Form và checkbox planner chỉ view-local.

Chưa thử thiết bị thật, Safari, bàn phím OS, zoom browser thực, screen reader,
usability, CWV hay hosted flags. Chỉ synthetic local Worker/in-memory SQLite;
không sửa server/schema/migration/dependency/production flag/payment/auth/infra,
không remote DB/R2/provider/credentials/push/PR/merge/deploy. Không có chứng nhận
production từ kết quả local. Báo cáo kiểm chứng nêu cả failures và sửa đổi.

## Kế hoạch UI07 đủ để bắt đầu

| Thứ tự | Hạng mục | Điều kiện nghiệm thu |
| --- | --- | --- |
| 1 | Inventory asset thật: master SVG, aliases, font/license, generated icon và manifest/OG callers | Từng nơi dùng có source, kích thước và owner; không nhầm repo Frigo cũ |
| 2 | Vector symbol/wordmark/micro, horizontal/stacked/symbol-only và một màu | Đọc rõ 16/24/32 px, sáng/tối; không đổi identifier kỹ thuật; nêu tên hiển thị đang dùng |
| 3 | Brand rules: proportions, clearspace/min-size, palette/contrast, typography và voice | Có trang usage với đúng/sai, không gắn “final approved” khi chưa review |
| 4 | PWA/favicon/maskable/iOS/OG từ master và alias tương thích | Sinh lại xác định, kiểm tra alpha/safe zone/crop, không sửa auth hoặc build flags |
| 5 | Đồng bộ shell của các core routes | Desktop chỉ một lockup có chủ đích, mobile không bị ép navigation; brand asset không broken |
| 6 | Evidence và handoff | Browser mobile/desktop, reduced motion, light/dark asset contexts, contrast và full gate trên source đã chốt |

Tách riêng phần trình bày tài khoản/settings/notifications và legacy Week sau khi
kiểm kê caller; không gom thêm domain commands hay sửa payment vào đợt brand.
Mascot chỉ triển khai các cảnh có tác vụ cụ thể và kiểm chứng kích thước sử dụng;
tránh vẽ nhiều ảnh trước khi silhouette và micro mark được xem trong giao diện.
