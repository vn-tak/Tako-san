# UI12 - Luồng công thức và nội dung responsive

2026-10-11 JST. Canonical `vn-tak/Tako-san`; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Base `f7a27c16ef460b19322d3a463dc74dc09fa48ade`. ADR-055 ghi trước runtime.
Implementation: `03e16c78850b061784dc2e9a01323bd7e74b65f3`.

## Kết quả

Đã triển khai một đợt lớn, liền mạch từ Trang chủ → khám phá món → chi tiết công
thức. Bộ nhận diện UI07 và shell UI11 tiếp tục được dùng chung. Thẻ món hiện đầy
đủ tên, mô tả, thời gian, khẩu phần và tách rõ tỷ lệ loại nguyên liệu với lượng đủ
để nấu. Chi tiết, tab, nguyên liệu, dinh dưỡng và bộ lọc đọc được khi chữ lớn hoặc
màn hình thấp. Ảnh lỗi chuyển qua fallback được resolver cho phép rồi dừng ở một
khối HTML có nhãn; không để ảnh hỏng hoặc vòng lặp tải lại.

Implementation và724unique Git blobs đã đối chiếu với source/evidence; receipt
[GIT_VERIFICATION.md](GIT_VERIFICATION.md). Documentation checkpoint ghi verified
implementation,không ghi hash của chính nó.

Phạm vi local này hoàn tất kiểm tra, chưa hoàn tất toàn bộ roadmap hay phê duyệt
thương hiệu. Báo cáo kiểm tra và các giới hạn: [VERIFICATION.md](VERIFICATION.md).

## Đánh giá thẳng thắn

Vấn đề còn lớn nhất với cảm nhận thương hiệu là nội dung ảnh. Nhận diện mới đã
được áp dụng nhưng những món đầu danh sách vẫn thiếu ảnh thực sự phù hợp. Một
placeholder lớn không giúp người dùng lựa chọn món, và ảnh đẹp sai món còn gây
hiểu nhầm hơn. Đợt này làm trạng thái thiếu ảnh gọn và trung thực; chất lượng nội
dung cần một bước duyệt nguồn, quyền sử dụng, đúng món và crop riêng.

Cảm giác lỗi thời trước đợt này cũng đến từ chữ nhỏ, nhãn toàn chữ hoa, thông tin
bị cắt và các ô có chiều cao cố định. Đây là vấn đề hệ thống trình bày, không chỉ
logo/màu. Thay đổi đã tập trung vào nhịp đọc và khả năng hoàn thành tác vụ. Chưa
có cơ sở từ thử nghiệm người dùng để tuyên bố hướng thương hiệu đã đạt mục tiêu.

## Bằng chứng trước/sau

Baseline được dựng lại từ đúng base trong checkout tạm độc lập: 777 Git blobs
runtime/config/public được đối chiếu. Mười mẫu 320px dùng cùng bộ đo cho Home,
discovery và ba panel chi tiết, chữ thường và computed text x2. Không dùng các ảnh
archive thiếu Tailwind/PostCSS làm bằng chứng sản phẩm.

| Mẫu 320px | Base: phần tử có clipping | UI12 |
| --- | ---: | ---: |
| Chi tiết / chữ thường | 0 | 0 |
| Chi tiết / chữ x2 | 30 | 0 |
| Cách nấu / chữ x2 | 11 | 0 |
| Dinh dưỡng / chữ thường | 1 | 0 |
| Dinh dưỡng / chữ x2 | 21 | 0 |
| Khám phá / thường, x2 | 18, 109 | 0, 0 |
| Trang chủ / thường, x2 | 5, 18 | 0, 0 |

Đây là số phần tử DOM có scroll/client geometry lệch, không phải số lỗi độc lập;
baseline bao gồm một số line-clamp có chủ ý. Ảnh trực tiếp xác nhận badge, tab và
nhãn dinh dưỡng thực sự chồng/cắt khi chữ lớn. Khối thiếu ảnh ở chi tiết từ216px
xuống82px thường/118px chữ x2. Ảnh full-page có thể đặt sticky chrome tại vị trí
capture; ảnh viewport và số đo trong matrix là căn cứ chính cho chrome.

## Frontend và UX

- `RecipeCard` có `kitchen` opt-in ở Home/discovery. Mặc định và JSX legacy giữ
  nguyên; anchor giữ Enter, Cmd/Ctrl/Shift/Alt click và đường dẫn thật.
- `RecipeMedia` nhận `ResolvedRecipeImage`; không đọc raw URL hay thay resolver.
  Identity title/src/fallback sở hữu vòng đời riêng, chặn late events của ảnh cũ.
  Width/height thật, lazy ở thẻ và eager ở detail; HTML missing không fetch ảnh giả.
- `kitchen-recipes.css` dùng line-height không đơn vị, controls intrinsic, wrap và
  em-based grids. Nutrition/tab/bộ lọc tự giảm số cột; overview/filter về luồng
  trang khi chiều cao<=600px. Sticky filters dùng số đo header/banner UI11.
- CTA, query, mutation, retry, shopping aggregation, availability, guard và cooking
  handlers giữ nguyên. 96 normalized declaration/handler records của ba page
  khớp base; protected diff rỗng. Đây là proof có phạm vi, không proof mọi hành vi.
- Hover nhẹ, focus theo nền tảng UI07, reduced-motion và touch-action rõ. Không thêm
  vòng lặp trang trí; kiểm tra cả reduced và một mẫu Home normal-motion.

## Media và kế hoạch tiếp

Re-audit SQLite cục bộ mới:500canonical/71static/46URLs;6mapping legacy được phép,
6sai món/thiếu file,429minh họa chung,59photo chưa duyệt. Tất cả500media rows local
pending;21nhóm dùng chung URL;8file ảnh local,0nhóm trùng hash local. Không suy ra
production hay giấy phép từ các số này.

[MEDIA_PLAN.md](MEDIA_PLAN.md) và `evidence/media-plan.json` chứa24món đầu discovery
local, ba món đầu cũng là gợi ý Home, cùng checklist nguồn/quyền/crop/variant.
Ưu tiên theo luồng quan sát được, chưa phải analytics. Packet tiếp: UI13 media
provenance/review, tạo bản duyệt cụ thể trước bất kỳ promotion nào.

## Bằng chứng để xem

- [Mobile journey](evidence/journey-mobile.png): ảnh viewport thật của sáu trạng thái.
- [Desktop/tablet](evidence/responsive-desktop.png): crop ảnh viewport tại1440/768.
- [So sánh chữ lớn](evidence/text-enlargement-comparison.png): crop full-page,
  đọc cùng số đo `base-configured/checks.json` và `final-visual/checks.json`.
- [Interface review](INTERFACE_REVIEW.md), [route coverage](ROUTE_COVERAGE.md),
  source freeze, lifecycle proof, log receipts và manifest trong `evidence/`.

Dependencies còn41advisories; UX heuristic vẫn FAIL. Device/Safari/native zoom,
screen reader, bàn phím ảo, usability, CWV và hosted release chưa được chứng nhận.
Không push/PR/merge/deploy hoặc remote DB/media write.
