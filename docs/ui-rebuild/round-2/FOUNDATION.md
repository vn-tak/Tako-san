# UI02 — Home và khám phá công thức

Ngày thực hiện: 2026-10-10 JST. Repository: `vn-tak/Tako-san`.
Checkout: `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.
Nhánh: `codex/ui-rebuild-foundation`; bắt đầu từ checkpoint UI01 `1533d98`.
Đây là đợt thứ hai của roadmap, chưa phải bộ nhận diện hoặc rebuild toàn hệ thống hoàn tất.

## Thay đổi đã xây

Home ưu tiên bữa sắp tới, nguyên liệu nên dùng sớm và ba gợi ý công thức. Header,
heading, font Be Vietnam Pro, màu xanh pine/coral và nền ấm dùng chung với tủ lạnh,
catalog và chi tiết. Rail/sidebar dùng logo prototype tại các route đã chuyển đổi.
Giữ mô hình điều hướng và nút Scan hiện có; các route khác tiếp tục dùng kit hiện tại.

Home chọn cùng nguồn với Planner theo `VITE_MEAL_PLANNER_ENABLED`: canonical
meal-planning khi bật, Week khi tắt. Dùng client đã validate và query key có user/
household; không có request Week song song khi canonical bật. Thực đơn ngày mai,
không có thực đơn, lịch đã qua, đang tải và lỗi là những trạng thái riêng.

Bữa V2 được mô tả bằng các component hiện tại, kể cả slot vốn chưa được generation
xếp món. Pending, 500/offline, thiếu slot hoặc lệch revision không hiển thị title V1.
Chỉ composition UI tắt hoặc API 404 cho phép compatibility V1. Family variant giữ
anchor khi server trả `source=v1_projection`; V2 rỗng vẫn là bữa chưa có món.
Nút chính mở chi tiết bữa có thẩm quyền. Không dùng một anchor để đại diện bữa
nhiều món hoặc chạy cooking trực tiếp. Retry nhắm ID/revision trả về mới nhất.

Ngày của canonical plan dùng `intent.utcOffsetMinutes`, cập nhật mỗi phút và khi
cửa sổ lấy lại focus. Chọn bữa trong các cửa sổ sáng trước 11h/trưa trước 16h/tối
trước 24h, rồi bữa ngày sau. Giờ explicit còn ở tương lai được giữ kể cả khi ngoài
cửa sổ mặc định; các slot được sắp theo ngày/giờ/sequence. Week giữ semantics cũ,
bỏ qua bữa đã nấu/bỏ qua và mở đúng route chi tiết Week.

Expiry known/estimated/unknown phân biệt cả chữ và tone; không đồng nhất ngày
ước tính với ngày đã biết. Không suy diễn allergy/expiry/current-stock hoặc budget từ projection của plan.
Đếm bữa từ composition hợp lệ đầy đủ; dữ liệu chưa xác nhận không thành 0 bữa.
Nguyên liệu không có expiry provenance vẫn ghi chưa rõ hạn dùng. Chưa đánh dấu
use-soon không đồng nghĩa không có đồ hết hạn.

## Discovery và responsive

Bộ lọc và phân trang dùng URL: `q`, `cuisine`, `category`, `region`, `noBuy`,
`maxTime=20`, `page`. Validate enum/page, giới hạn search 160 ký tự; giữ tham số
khác khi sửa/reset. Thay bộ lọc trả về trang 1; search dùng replace history,
select/toggle/pager dùng navigation history. Trang vượt giới hạn được clamp sau
khi query thành công, không làm mất page khi đang tải.

Mỗi trang tối đa 24 thẻ. Search toàn bộ tập kết quả nhận được, gồm title, description,
tag và nguyên liệu, hỗ trợ tiếng Việt có/không dấu. Page/search không tạo request
recommendation riêng; thay filter API vẫn dùng query key hiện có. Chi tiết giữ
`discoveryReturn` trong router state; back link khôi phục đúng filters/page.
Công thức mở từ Home có back link về Home. Detail chỉ chấp nhận root hoặc
đường dẫn `/recipes?…` làm return target, không nhận URL ngoài ứng dụng.
Native links giữ Cmd/Ctrl/middle click. Reset trả focus về search; phân trang
chuyển focus đến heading kết quả. Skip link vào main có kiểm tra bàn phím.

Sau review screenshot, bộ lọc phụ thu trong native details trên mobile/tablet,
mở sẵn từ 1280px. Ô tìm kiếm luôn hiển thị; summary báo số filter đang dùng.
Điều này đưa công thức lên gần đầu trang hơn. Grid 1 cột dưới 480px, 2 cột từ 480px,
3 cột từ 1600px; sidebar bộ lọc từ 1280px. Home 2 cột từ 900px. Các control >=44px,
search/select 16px, heading hỗ trợ tên dài. Không thêm motion mới; giữ animation
hiện có và reduced-motion. Ảnh RecipeCard bổ sung kích thước intrinsic.

**Giới hạn hiệu năng:** Đây là phân trang phía client. API vẫn trả toàn bộ
recommendation DTO gồm dữ liệu chi tiết; fixture có 500 công thức. Không tuyên bố
response nhỏ hơn hoặc server pagination đã hoàn thành. Endpoint list nhỏ và
cursor ổn định là phần kế tiếp.

## Nhận xét thẳng từ hình ảnh chạy thật

Home dùng nền sáng, viền coral và hệ chữ rõ để ưu tiên bữa sắp tới. Mobile có
khoảng thở và tiêu đề xuống dòng; desktop chia vùng làm việc theo độ rộng màn hình.

Asset vẫn là điểm yếu đáng kể. Preview dùng catalog hiện tại cho thấy nhiều món
khác nhau có cùng ảnh tô mì hoạt hình “Delicious!”. Resolver hiện có vẫn chấp
nhận URL legacy hợp lệ; neutral fallback chỉ xử lý ảnh thiếu/lỗi. UI02 không
thay metadata/catalog/media contract và không chứng nhận ảnh đúng món.
Các placeholder trung tính tốt hơn ảnh lỗi nhưng vẫn làm trang thiếu sức hấp dẫn.
Avatar thử nghiệm thuộc fixture; không dùng nó để đánh giá avatar production.

Logo octopus/wordmark vẫn là prototype UI01; PWA, OG, email, empty-state, icon và
mascot ở các route khác chưa được chuyển toàn bộ. Header desktop còn lặp logo
với sidebar. Độ nhận biết thương hiệu, Safari/device thật, screen reader và
usability với người dùng chưa được kiểm chứng. Axe local không thay thế các việc đó.

## Đợt kế tiếp đề xuất: UI03

| Phần | Việc cụ thể | Điều kiện nghiệm thu |
| --- | --- | --- |
| API list | DTO chỉ mang ID/slug/title/time/servings/image summary + quantity evidence cần thiết; detail tải riêng | Request đầu<=24; response/schema có budget đo được |
| Server paging | Query/filter/ranking/cursor thống nhất với catalog authority và household inventory | Không lặp/mất món qua trang; search ngoài trang đầu; revision/scope đúng |
| Asset inventory | Xuất mapping recipe→URL/hash/provenance; phát hiện reuse lệch món | URL/hashes có nguồn, lỗi/ảnh generic được đánh dấu rõ |
| Media batch đầu | Chốt hướng ảnh món thật; thay các ảnh dùng chung gây hiểu nhầm bằng ảnh đúng món hoặc placeholder | Không tạo ảnh sai để lấp slot; crop mobile/desktop; licence/hash/budget |
| Shell còn lại | Migrate scan/review/editor/cooking/planner/shopping theo từng vertical slice | Giữ command/revision/confirm/lock/proposal semantics |
| Brand và motion | Micro-symbol, PWA/OG/empty-state/mascot, feedback có mục đích | Bộ export nhất quán; reduced-motion/keyboard; brand/usability round |

UI03 cần task packet và ADR riêng cho DTO/cursor trước khi đổi server contract.
Không được gộp đổi schema hoặc production rollout vào một đợt trang trí UI.

## Evidence

`VERIFICATION.md` ghi command/kết quả/lỗi và phạm vi local. `evidence/` có 23 ảnh
và JSON từ 21 lượt axe/layout, các luồng URL và Home/Planner. Không dùng dữ liệu
production hoặc private media. Trạng thái T20 deployment/certification hiện hữu
không được đợt UI này thay thế.
