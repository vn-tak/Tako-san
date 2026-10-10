# UI10 - Week: giao diện rõ ràng và đúng hành vi

Canonical repository `vn-tak/Tako-san`; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, branch
`codex/ui-rebuild-foundation`. Base `3c018d7778a780f5759d967e62d58440e4e08c2d`.
ADR-053 và packet UI10 định nghĩa phạm vi. Đây là đợt local trong chương trình
xây lại toàn hệ thống; chưa có phê duyệt thương hiệu từ chủ dự án hay bản phát hành.

## Đánh giá thẳng thắn về luồng cũ

Week cũ khiến người dùng tưởng có quyền kiểm soát nhiều hơn khả năng thực tế.
Chọn lịch từng ngày không vào payload; cài đặt báo đã lưu dù chỉ ở bộ nhớ; chọn
ưu tiên để tạo lại không chuyển ưu tiên đó đi. Sao chép báo thành công trước khi
thiết bị xác nhận. Những vấn đề này ảnh hưởng trực tiếp đến niềm tin và cần giải
quyết cùng với nhận diện, typography và bố cục.

| Vấn đề có bằng chứng | Ảnh hưởng | Hành vi sau UI10 |
| --- | --- | --- |
| Lịch từng ngày không được gửi | Lựa chọn của người dùng không có hiệu lực | Bỏ bước không được hỗ trợ, còn bốn bước thực sự |
| Settings báo lưu rồi tự chuyển trang | Người dùng hiểu nhầm đã lưu vào plan hoặc server | Ghi rõ bản nháp trong phiên, nút áp dụng và trở về tường minh |
| Regenerate nhận ưu tiên nhưng bỏ qua | Tạo plan khác kỳ vọng mà không cho xem lại | Link về setup để xem lại trước khi tạo |
| Null budget bị đổi thành 750.000đ | Mất lựa chọn không giới hạn | Giữ null; chỉ undefined dùng mặc định |
| Copy báo thành công trước Promise | Receipt sai khi bị từ chối quyền hoặc clipboard lỗi | Chờ writeText; lỗi nhận focus trong dialog |
| Completion bỏ pendingSync | UI có thể nói đã nhập khi máy chủ chưa xác nhận | Truyền signal hiện có; phản hồi chờ đồng bộ thận trọng |

Setup hiện có bốn bước: bữa ăn, ngân sách, một đến ba ưu tiên, tần suất đi chợ.
Quay lại giữ lựa chọn. Bước cuối có nội dung kiểm tra và nút tạo rõ ràng. Không
thêm API lịch từng ngày; tần suất có trong payload nhưng chưa chứng minh có lịch
chuyến đi chợ tự động. Stage nằm trong bộ nhớ, reload không khôi phục tiến trình.

Settings chỉ sửa thiết lập lần tạo tiếp theo trong phiên. Reload đặt lại bản nháp;
plan hiện tại không đổi. Dashboard đưa về setup để xem lại, không dùng những lựa
chọn tạo lại mà backend không nhận được.

## Nhận diện và hệ thống giao diện

Sáu trang và bốn component Week dùng `WeekWorkspace`, KitchenHeader/heading và
nhận diện UI07: Be Vietnam Pro đã cấp phép, pine/coral/ink/canvas, lockup và symbol
hiện có. Không tạo thêm hướng thương hiệu, font hoặc pose trong đợt này. Desktop
có một lockup ở sidebar; mobile/tablet dùng lockup ở header. Header, chiều rộng
khung đọc, bề mặt, buttons và thông báo cùng ngôn ngữ với các luồng đã migrate.

Khung đọc tối đa 1120px; setup/settings 800px. Board ngày có hai cột khi đủ rộng,
một cột trên mobile. Thumbnail nhỏ giúp quét thực đơn, giảm các khối placeholder
lặp lại. Tên món là Link mở chi tiết; đổi món là button riêng. Ăn ngoài, linh hoạt,
bỏ qua và bữa không có recipe được thể hiện đúng trạng thái, không giả có hướng dẫn.
Các ngày trống/dữ liệu thiếu có nội dung rõ. Một h1 mỗi trang, back link tường minh,
body 14px, nhãn lựa chọn chính 16px, controls 48px; radio/checkbox là native.

Chi tiết món ưu tiên thời gian, phần ăn, nguyên liệu và nhu cầu mua thêm. Native
buttons với aria-pressed chuyển nội dung công thức. Cách nấu thiếu có phản hồi
riêng; dinh dưỡng thiếu là dấu —, không thành 0. Availability, tận dụng tủ, chi phí
và nguy cơ bỏ phí đều là dự kiến theo kế hoạch, không thành lượng đã dùng.

## Responsive, accessibility và motion

Ảnh và browser checks bao phủ 320/390/768/1024/1440px; viewport ngắn 390x420;
computed text x2 tại 320px; tên món/nguyên liệu dài synthetic. Không dùng CSS giấu
tràn ngang để che vấn đề. Text x2 đã phát hiện line-height sát, step labels chật và
nút heading bị ép thành cột chữ. Đã sửa line-height tương đối, grid auto-fit theo
em, min-width/wrap và cho action xuống hàng. Native zoom chưa được kiểm chứng.

Dialog đổi món/chia sẻ giữ useModalFocus: trap, Escape và trả focus. Khung 100dvh,
max-height, scroll, overscroll và safe-area cho phép tiếp cận controls trên màn
hình ngắn. Có thêm ảnh export sau cuộn và assertion controls trong viewport.
Motion chỉ dùng reveal 180ms bằng opacity/transform; reduced motion tắt trang trí.
Generation nói đang chờ kết quả thực, không dựng progress hay thời gian giả.

Clipboard chờ writeText; thất bại/unsupported đưa focus vào phản hồi an toàn trong
dialog. Hủy native share báo đã đóng bảng chia sẻ. Epoch chặn receipt sau khi đóng/
mở lại. Hai hàm tạo nội dung export giữ AST của bản trước theo compatibility.

61 snapshots / 11 nhóm hành trình đạt: không có unexpected pageerror, applicable
axe violation, horizontal overflow hoặc ảnh lỗi trong matrix đã chạy. T18C native
keyboard đạt sáu projects. Axe 0 không chứng minh toàn app đạt accessibility; cần
screen reader, Safari, native zoom, thiết bị thật và kiểm usability riêng.

## Đi chợ và ranh giới dữ liệu

Đánh dấu nguyên liệu là lựa chọn, không nhập kho. Nút xác nhận nói rõ số nguyên
liệu được gửi; khóa thao tác khi gửi, giữ snapshot tên/số lượng và focus phản hồi.
Lifecycle chặn receipt sau khi rời route; session fencing giữ nguyên. Store chỉ
truyền optional pendingSync từ receipt hiện có. Pending nói máy chủ chưa xác nhận;
không suy ra từ navigator.onLine và không hứa dữ liệu đã vào durable outbox.

Worker local xác nhận tạo/đọc/đổi món/check không làm đổi toàn inventory JSON.
Import thật chỉ chọn một nguyên liệu: thêm đúng một row, đúng quantity/unit, giữ
mọi field của năm row cũ; reload readback nhất quán. Pending receipt được mô phỏng
chỉ để kiểm presentation, không chứng minh offline persistence hoặc replay safety.
Bắt đầu nấu vẫn đi `/cook/:slug`, không có đường deduction thay thế trong UI10.

App.tsx/routes/guards byte-identical. AppLayout nhận đúng Week route families.
Planner-on giữ bảy aliases; generating đi `/planner`, settings đi
`/settings/planning`. Services/backend/packages/schema/migrations/dependencies/
public assets/auth/payments/production flags không đổi. Store chỉ có hai replacement
được phép; generation effect giữ AST ngoài mapping ngân sách.

## Asset, rủi ro còn lại và đợt tiếp theo

Catalog còn nhiều công thức thiếu ảnh và dùng placeholder có sẵn. Đây là khoảng
trống media thật; không thể coi bộ asset đã hoàn chỉnh. Export còn domain lịch sử
`frigo.tungjpstore.net` theo contract giữ generator; chưa thay toàn bộ dấu vết cũ.
Global nav mobile sáu cells vẫn chật khi phóng chữ; tablet labels nhỏ/truncated.
UI11 đã có packet audit nav/header/shell/fixed offsets và yêu cầu ADR-054 trước
runtime, giữ năm destinations, Scan, flags và immersive semantics.

Generic UX audit cuối vẫn FAIL: 151 files, 29 issues, 968 warnings, 82 checks đạt;
lượt trước có 970 warnings. Heuristic quét cả test fixtures và đòi social proof/hero
animation không phù hợp một số flow; báo cáo giữ nguyên kết quả, không coi là
whole-repo UX PASS. Dependency audit có 41 advisories (4 low, 19 moderate,
16 high, 2 critical), lockfile nguyên; cần remediation riêng.

Week queueWrite chưa chứng minh durable receipt và optimistic replay có rủi ro
cộng lượng lặp; inventory fallback-any-error/queued metadata receipt còn là domain
follow-up. Owner brand approval, thiết bị thật/Safari/native zoom/screen reader/
usability/CWV và hosted release chưa được kiểm chứng. VERIFICATION.md giữ số liệu
thực thi, failures/recovery, source/evidence và các checkpoint đã xác minh.

## Checkpoint local đã xác minh

Implementation checkpoint:
`89bddf821ea4f74d639f0779febd78606bdf617f`.
Đã đối chiếu Git objects/worktree: 143 source hashes và 144 evidence payloads
khớp bytes/SHA256. Manifest: 29760 bytes, SHA256
`7ac94d4590e8c449ca4a1046e330871db4ce650bfda80329625595ac4d5618ab`.
Protected-path diff từ base đến implementation rỗng; tree sạch ngay sau commit;
`git diff --check` PASS. Documentation checkpoint theo sau, không ghi hash của chính nó.
