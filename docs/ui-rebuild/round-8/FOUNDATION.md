# UI08 - Hồ sơ, cài đặt và luồng bắt đầu

Canonical `vn-tak/Tako-san`, checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`,
branch `codex/ui-rebuild-foundation`; base `7f82edca63353a10b4f7b2919026c12b65d44963`.
Packet `docs/ai/tasks/UI08-account-entry.md`, ADR-051. Đợt này triển khai trên dự án
Tako-san, không dựa vào checkout Frigo cũ. Nhận diện kế thừa UI07: pine/coral,
canvas ấm, Be Vietnam Pro tự host, bạch tuộc và wordmark outlined.

## Đánh giá thẳng từ source và giao diện

| Vấn đề trước UI08 | Hệ quả | Thay đổi |
| --- | --- | --- |
| Profile gom sáu dòng ngang nhau, tên/mô tả truncate | Khó hiểu nơi cần đến; mất thông tin trên màn nhỏ | Hai nhóm bữa ăn–gia đình và ứng dụng–dữ liệu; liên kết thật, chữ xuống dòng |
| Mô tả 10–12px và nút cao cố định | Khó đọc, chữ phóng lớn có thể chồng/cắt | Mô tả14px, hành động16px, chiều cao tối thiểu48px theo nội dung |
| Account, auth, onboarding dùng kit/font khác core | Thương hiệu đứt đoạn giữa tác vụ | Scope route rõ; cùng lockup, font, chrome và cấp bậc chữ |
| Landing hứa nhận diện tức thì, chuẩn xác, tính món tối ưu | Tạo kỳ vọng sai về AI/scan | Thể hiện quét → kiểm tra → lưu → chọn món; nói rõ kết quả có thể cần sửa |
| Notification switches chỉ có localStorage writer | UI hứa lọc/gửi theo lịch không có consumer | Ghi rõ chỉ lưu mong muốn, chưa lọc hộp hoặc gửi theo lịch |
| Copy email nhắc nhở phủ định cả email xác thực | Người dùng dễ hiểu sai luồng OTP | Phân biệt nhắc bữa ăn và email xác thực tài khoản |
| Family/privacy kể API chưa triển khai và dữ liệu mẫu | Ngôn ngữ nội bộ gây tải nhận thức | Nói rõ khả năng hiện có và giới hạn, không hiện nút/mã mời giả |
| Privacy hứa không có thông tin cá nhân gửi AI | Không bảo đảm được với ảnh người dùng gửi | Giải thích ảnh/nội dung được xử lý, đề nghị che thông tin không cần thiết |
| Xóa cache không có pending/error và lời hứa offline mọi lúc | Lỗi storage không có hồi đáp, kỳ vọng ngoại tuyến quá rộng | Busy/success/error thật; nói rõ tính năng cần máy chủ vẫn cần mạng |
| Success lưu preferences tồn tại sau khi chỉnh lại | Bản mới chưa lưu nhưng trang vẫn nói đã lưu | Xóa success khi draft đổi, khóa form khi request lưu đang chạy, focus lỗi |
| Guard onboarding luôn về Home dù mục tiêu tuần | Hai điều hướng cạnh tranh, chọn tuần không tới setup | Guard dùng cùng primaryGoal và /week/setup như finish; alias hiện hữu tới /planner/new |
| Size7 không chọn nút5+ trong food editor | Hiển thị không phản ánh dữ liệu đã đọc | Bucket5+ selected, giữ nguyên7 khi chưa chọn lại |

Tên tài khoản “Frigo Preview” và avatar trong ảnh là dữ liệu giả của isolated
preview hiện hữu, không phải tên sản phẩm. Product lockup/copy đã là Takosan.
Không đổi tên tài khoản do người dùng cung cấp để che quá trình chuyển đổi.

Không có dữ liệu đo với người dùng thật để chấm điểm hài lòng, nhận diện hay tăng
conversion. Đánh giá ở đây là kiểm tra source, khả năng thật và render/interaction
local; không phải nghiên cứu thương hiệu hay chứng nhận usability.

## Hệ thống giao diện sau đợt này

`AccountPage` ghép KitchenHeader và KitchenPageHeading vào một cột đọc tối đa800px.
Mobile có logo/header và bottom nav; tablet có rail; desktop sidebar giữ một
lockup và header hiện motto. Mỗi trang có một h1, back destination rõ về Hồ sơ
(inbox về Home), các hành động thông báo/tài khoản vẫn là liên kết thật.

Profile có dải coral nhẹ ở tài khoản và danh sách phân nhóm; nội dung dài xuống
dòng. Form food/planning vẫn dùng primitives/handlers hiện hữu. Các switch có
vùng48×52px, mô tả có thể co; hàng ảnh/summary giữ icon và phần chữ có min-width0.
Dialog cài đặt/đăng xuất giới hạn theo100dvh và cuộn khi cần. Trạng thái không
khả dụng vẫn thành thật, không giả mời hộ, danh sách thành viên, export hay xóa.

Landing dùng slogan lớn và chuỗi ba bước, CTA dùng thử và vào tài khoản rõ.
Desktop đặt chuỗi tác vụ cạnh nội dung; mobile đọc theo thứ tự nội dung → CTA →
cách dùng. AuthShell thay chrome/layout, fields16px và52px, reveal target nằm
trong field; OTP sáu cột co tại320px. Onboarding giữ ba URL/draft, chọn native
radio/checkbox và tổng kết trước lưu. RouteFallback dùng symbol mới và live status.

## Asset, motion và ranh giới

Không thêm ảnh raster/pose/font/dependency. Reuse UI07 lockup300×72, hiển thị150px
trên entry;128px trên kitchen mobile; symbol64 cho route load. Lucide là task
icons. Mascot fridge của kit cũ được bỏ khỏi landing vì kể một lời hứa scan sai;
không xóa asset hay đổi contract cũ. Kết quả pending không có phần trăm giả.

Auth giữ Slide hiện hữu; onboarding giữ reveal theo bước; scope reduced-motion
bỏ CSS reveal/spinner và MotionProvider hiện hữu quản lý motion. Kiểm chứng
opacity khi chuyển mode phải chờ animation JS hoàn tất, không đo contrast lúc
nội dung còn đang fade. Không thêm logo loop hay animation trang trí.

AuthPage/services/store/security/Worker/schema/flags nguyên bytes. App.tsx chỉ
đổi guard hoàn tất onboarding theo primaryGoal trong bộ nhớ để tránh Home thắng
điều hướng khi chọn tuần; các guard khác giữ. Onboarding logic/request/completion/navigation nguyên vẹn; chỉ asset/class
đổi. Plus link JSX và target giữ, payment routes/components không sửa. Parent
account font/tokens là phạm vi presentation; không tuyên bố payment CTA rendering
trong trang hồ sơ hoàn toàn cùng pixel với bản cũ. LogoutDialog/ConfirmDialog giữ
logic và thẩm quyền; CSS dialog chỉ nằm trong account-body, không ảnh hưởng Plus.

Food/planning wire DTO, key và server authority giữ; không phát sinh plan hay sửa
stock từ settings. Notification key cũ giữ theo user; chỉ nhận boolean hợp lệ,
không claim persist nếu storage lỗi. Chưa bổ sung consumer/kênh notification.
Inbox service cũ có thể trả[] khi offline; empty copy không khẳng định hộ thật sự
không có nhắc nhở. Read provenance chính xác cần packet riêng nếu thay service.

## Tiếp theo: UI09

1. Inventory ingredient detail/reconciliation, legacy Week, global errors và các
   alias chưa chuyển; map caller/flag/service/test trước sửa.
2. Tạo packet+ADR cho từng nhóm. Legacy Week cần preview thật có planner tắt ở
   frontend và server, giữ default preview hiện hữu và routing/dual-write.
3. Chuyển typography/brand/layout của các màn đó; thống nhất lỗi/rỗng/tải, không
   mở rộng auth/payment/domain authority vì mục tiêu giao diện.
4. Rà navigation sáu mục, tránh density trên320px; cần quyết định IA có bằng chứng
   trước thay đổi cấu trúc chính. Bổ sung warning draft chưa lưu vào packet phù hợp.
5. Kiểm thử Safari/thiết bị thật, OS install, zoom thật, screen reader, tốc độ/CWV,
   brand owner/usability và rollout hosted trước release. Kiểm tra local chưa thay
   các gate này. Lockfile advisory cần đợt dependency riêng, không sửa UI08.
