# UI09 - Chi tiết nguyên liệu, đối chiếu và trạng thái hệ thống

Canonical `vn-tak/Tako-san`; checkout `Tako-san-ui-rebuild`, branch
`codex/ui-rebuild-foundation`, base `dbcabb7648e7f4ee9595f5ae430f0d7b50e80f0b`.
Packet UI09-stock-detail-states, ADR-052. Đây là đợt kế tiếp của hệ thống nhận diện
UI07 đã có, không phân tích nhầm checkout Frigo cũ. Phạm vi là chi tiết nguyên
liệu/aliases, đối chiếu và lớp trình bày session/render-error. Week được audit
thật khi planner tắt; chưa triển khai lại Week ở UI09.

## Đánh giá thẳng thắn và thay đổi

| Mảng | Vấn đề trước UI09 | Kết quả trong phạm vi UI09 |
| --- | --- | --- |
| Nhận diện | Detail và đối chiếu còn font/khung cũ; lỗi hệ thống không có nhận diện | Be Vietnam Pro, lockup bạch tuộc UI07, pine/coral/canvas; một logo hiển thị, một h1 |
| Luồng đọc | Nhãn nhỏ, metadata lẫn với hành động, món liên quan dễ bị hiểu là đủ đồ để nấu | Lượng/hạn/vị trí trước provenance và edit; nói rõ món có nguyên liệu này và cần mở để kiểm tra |
| Luồng sửa | Không chuyển/khôi phục focus; có thể chỉnh/hủy trong khi đang gửi | Focus tên khi mở, lỗi khi thất bại, trigger khi đóng; fieldset khóa trong khi lưu |
| Trạng thái tải | Canonical lỗi và legacy đang tải có thể bị trình bày như không tìm thấy | Giữ loading trong khi fallback pending; giữ nguyên nguồn dữ liệu và retry hiện hữu |
| Đối chiếu | Tên/evidence bị cắt, chữ10–12px, actions dồn sít | Article/h2 và Ghi nhận/Kết luận/Khác biệt; nội dung wrap, hai actions rõ ràng, error focus |
| Responsive | Chữ phóng lớn gây intrinsic grid overflow và tên/action bị chật | minmax(0,1fr), min-width0, badge/action wrap, line-height theo cỡ chữ; fields16px/48px |
| Motion | Trạng thái tồn kho không cần thêm hiệu ứng trang trí | Fade180ms trong scope, reduced-motion bỏ fade; trạng thái hệ thống tĩnh |
| Asset | Có nhiều lớp kit tồn tại trong repo | Tái sử dụng UI07, không thêm pose/font/asset; ảnh công thức giữ fallback, không dựng ảnh món giả |

Workspace tối đa880px, một cột đọc; facts/editor chuyển hai cột từ600px.
Desktop dùng sidebar đã có; mobile/tablet dùng kitchen header và back thật về
/fridge cho cả deep link. SystemStatusPage tự sở hữu main/brand, h1 và aria-busy;
SessionBoundary tiếp tục chặn private content đến khi xác minh thành công.

Cảnh báo rời document chỉ đăng ký khi draft dirty hoặc save pending. Inline copy
nói rõ Hủy/rời trang bỏ chỉnh sửa; SPA navigation vẫn không có blocker. Trình duyệt
quyết định có hiện beforeunload hay không. Không ghi thêm private draft vào storage.

## Những chỗ chưa tốt được giữ công khai

Danh sách món liên quan vẫn có thể dài17 món; UI09 không phân trang hay dựng API
mới. Nhiều ảnh công thức hiện là fallback trong catalog. Nhãn cuisine/unit vẫn
dùng wire vocabulary ở vài chỗ, cần cải thiện presentation/i18n đồng bộ ở đợt sau.
Mã và phiên bản lô vẫn hiển thị để giữ provenance hiện hữu; mức ưu tiên thông tin
này cần usability review. Không suy diễn mức độ an toàn thực phẩm từ hạn chưa rõ.

Canonical-lot query hiện fallback cho mọi error, không riêng unadopted/404; có thể
che khuất lỗi authority bằng projection/cache. Đây là rủi ro domain có sẵn; UI09
không đổi policy. Metadata service có thể trả về kết quả queue và page đóng editor
mà không có receipt riêng cho người dùng; không claim UI09 đã giải quyết offline
save. Nguồn truth/optimistic versions/dirty PATCH/conflict refetch giữ nguyên.

Global mobile nav có sáu mục; nhãn chật và chồng nhau khi doubled text320. Đây là
vấn đề thật còn lại, dù page không tràn ngang và axe sampled bằng0. Không gọi toàn
hệ thống UX đạt chuẩn. UI11 cần kiểm tra mật độ nav, reflow, chiều cao dự trữ và
keyboard/native zoom trên các workflow. Nav cố định xuất hiện giữa ảnh fullPage
ở vị trí viewport là cơ chế chụp; chữ nav chồng nhau ở enlarged là vấn đề riêng.

## Week: vấn đề hành vi nghiêm trọng hơn vẻ ngoài

Audit real local Worker với `PREVIEW_MEAL_PLANNER_ENABLED=false`, default giữ true.
API planner trả404/MEAL_PLANNER_DISABLED.16 ảnh,2 nhóm hành trình,0pageerror;
axe/overflow bằng0 trong mẫu được đọc, không chứng minh cả Week dùng tốt.
Font vẫn Nunito, supplied/mascot cũ, copy nhỏ và fixed action bars cạnh global nav.

1. Chọn ngày đầu “Ăn ngoài”, payload không có lịch từng ngày; plan trả `cooking`.
   WeekSetupPage:29/38/80 cho thấy daySchedules/skipDetailedSchedule không được gửi.
   Đây là lời hứa giao diện không hoạt động, ưu tiên sửa trước cosmetic redesign.
2. WeekSettingsPage:16 chỉ updateSetupDraft; :22 quay về sau800ms, vẫn báo “Đã lưu”.
   useWeekStore:120 chỉ set memory. Không có durable hoặc update-plan evidence.
3. WeekDashboardPage:40 bỏ `_priorityFocus`, điều hướng generating. Nhấn ưu tiên
   có thể tạo lại bằng draft khác với ý định người dùng.
4. WeekGeneratingPage:31 dùng `budgetTargetVnd ?? 750000`, biến null/unlimited thành
   ngân sách750000. Phát hiện từ source; chưa browser kiểm null trong UI09.
5. WeekExportModal:93/101 không await clipboard nhưng báo copied; lỗi bị bỏ qua.
6. WeekShoppingPage:106 dùng completion store; store:268 bỏ pendingSync từ service.
   Page có thể nói đã nhập vào tủ cả khi chờ sync. Service còn rủi ro durable queue
   receipt và optimistic replay; cần packet domain riêng, không tự sửa backend.

Inventory trước/sau Week generation/read bằng nhau.16 ảnh audit nằm riêng với
ảnh UI09, không trộn nhận diện/criteria vào một kết quả PASS.

## Kế hoạch tiếp theo đã chốt

UI10 packet `docs/ai/tasks/UI10-week-compatibility.md`: sáu pages và bốn Week
components. Bốn bước setup có tác dụng thật; settings diễn đạt đúng bản nháp trong
phiên; regenerate đi qua review setup; giữ null budget; clipboard await/error;
completion truyền pendingSync có sẵn. Shared identity, desktop day board và mobile
stacked days, dialogs/short viewport/reduced motion, quantity/price uncertainty.
Giữ service/commands/outbox/Week dual-write; ADR-053 trước runtime. Không tự thêm
per-day payload hoặc preferences API.

UI11 dự kiến xử lý navigation toàn hệ thống và các hở reflow/focus sau adoption.
Các packet domain inventory/Week offline, remediation41 dependency advisories,
owner brand/usability/device/Safari/screen-reader/CWV/hosted release là việc riêng.
UI09 local checkpoint không đồng nghĩa rebuild toàn hệ thống hoặc đã triển khai.

Xem `VERIFICATION.md` và `contact-sheet.png`; `week-audit-contact-sheet.png` là
bằng chứng giao diện Week cũ. Mọi ảnh/data thuộc local preview cô lập.
