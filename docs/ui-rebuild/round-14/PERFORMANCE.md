# UI14 - Hiệu năng frontend và motion của Tako-san

2026-10-11 JST. Canonical `vn-tak/Tako-san`, checkout `Tako-san-ui-rebuild`, branch
`codex/ui-rebuild-foundation`. Base `f3a09f2a7beb548fbd4bc9ef8ae932a092dd3827`.

## Kết luận từ số đo

Motion engine đang được tải sớm dù Home, discovery và detail dùng indicator tĩnh.
UI14 tách provider nhẹ và trì hoãn indicator legacy. Entry giảm 127,293 bytes raw
(27.5%); gzip Node level6 giảm 129,276 → 87,619 bytes (32.2%). Tổng JavaScript thực
tải trong ba trang giảm 41,650–41,652 bytes, tức 17.3–18.4%. Gzip Python level9
128,900 trong ADR ban đầu là phép nén khác, không dùng làm số transfer trình duyệt.

| Trang, cold   | JS trước → sau (bytes transfer) | Giảm  | Content-ready median trước → sau | LCP lab median trước → sau |
| ------------- | ------------------------------- | ----- | -------------------------------- | -------------------------- |
| Home          | 240,255 → 198,605               | 17.3% | 3,546 → 3,330 ms                 | 2,372 → 2,188 ms           |
| Discovery     | 226,429 → 184,779               | 18.4% | 2,848 → 2,625 ms                 | 2,552 → 2,312 ms           |
| Detail kimchi | 234,569 → 192,917               | 17.8% | 4,029 → 3,813 ms                 | 4,000 → 3,784 ms           |

| Trang, warm | Content-ready trước → sau | LCP lab trước → sau | JS transfer |
| ----------- | ------------------------- | ------------------- | ----------- |
| Home        | 1,353 → 1,336 ms          | 376 → 372 ms        | 0 → 0 bytes |
| Discovery   | 633 → 600 ms              | 520 → 508 ms        | 0 → 0 bytes |
| Detail      | 2,012 → 2,000 ms          | 1,984 → 1,972 ms    | 0 → 0 bytes |

Số transfer là bằng chứng mạnh nhất của cải tiến. Timing giảm khoảng 216–223 ms
trong thử nghiệm cold; ba lần đo cùng máy chưa chứng minh cải tiến ngoài thực tế.
Warm gần như giữ nguyên. SPA single-sample Home→discovery 433→451 ms, discovery→detail
465→446 ms: không kết luận SPA nhanh hơn. Motion chỉ được chuyển sang lúc cần,
không bị xóa khỏi toàn ứng dụng hoặc làm giảm toàn bộ tổng build tương ứng.

## Phương pháp và giới hạn

Production build pin bytes trước/sau, cùng timestamp `2026-10-10T21:30:00.000Z`,
hai Planner flags false. Chromium153.0.8010.12, 390×844, CPU4x, latency60ms,
download200,000 B/s, upload96,000 B/s; service worker blocked. Ba context cold độc
lập mỗi route, sau đó cùng context cache warm. CDP cache enabled, không dùng
Playwright request routing trong phép đo vì routing làm vô hiệu hóa cache.

Preview bind loopback, unchanged Worker/SQLite fixture trong bộ nhớ, không provider
credentials, Worker fetch ngoài bị chặn. Login cookie qua browser và PATCH hoàn
thành onboarding trước khi đo; ghi rõ setup writes bị loại khỏi counter. Browser
đo chỉ đọc, inventory JSON trước/sau khớp, zero domain writes/external/pageerrors.

HTML helper chỉ dùng local bỏ Google Fonts/GSI. Production index/config vẫn giữ
nguyên. Gzip text và cache policy do preview mô phỏng; asset/API requests tuần tự
trong preview. Public assets `no-cache` ở preview khác `no-cache,no-store` trong
production headers. Đặc biệt fonts warm transfer0 chỉ đúng cache local này. HTTPS,
CDN, auth thật, Google resources, service worker, Safari và thiết bị không được đo.
Đây không phải hosted CWV, field INP hoặc chứng nhận đạt Core Web Vitals.

Content-ready là hiện nội dung route, fonts.ready, ảnh đang trong viewport complete
và hai RAF; không dùng sleep/networkidle. Resource snapshot tại thời điểm này,
không phải tổng download cả trang sau scroll. LCP là observer entry cuối trước
snapshot; CLS là tổng shift không recentInput, không phải CLS session-window chuẩn.
Events/longtasks raw được giữ, không gọi chúng là field INP. Source-map sourceBytes
là code chưa minify, không phải tỷ lệ đóng góp chính xác vào minified bundle.

## Những vấn đề còn lại, theo mức ảnh hưởng

1. **Entry vẫn lớn vì offline catalog/domain được import sớm.** Sau tối ưu còn
   336KB raw entry, cùng React/query/icons chunks. Recipe bank và Zod là nguồn lớn
   trong source map; `services/recipes.ts` import ALL_RECIPES để fallback offline.
   Tách import này cần packet domain riêng, bảo toàn fallback/tenancy/availability;
   không làm trong UI14. Các route pages đã lazy; chuyển framework không giải quyết
   nguyên nhân import này.
2. **Fonts và ảnh chiếm phần đáng kể.** Home cold có chín WOFF2, 144,632 bytes
   transfer; detail tám ở readiness, 130,720 bytes. Font400/700 bắt đầu khoảng1.2s
   sau tối ưu; weight600 bắt đầu khoảng2.1s. Không tự xóa weight/subset vì tiếng Việt
   và UI07 typography. Home spinach105,308 bytes, kimchi64,202 bytes; detail kimchi
   khởi động khoảng2.2s. Warm public ảnh vẫn tải lại trong local no-cache policy.
   Cache/preload/srcset cần audit riêng; quyền nguồn/crop UI13 chưa được giải quyết.
3. **Home còn thay đổi layout khi data vào.** Tổng shift lab khoảng0.01765 trước và
   sau, nguồn là các SECTION của workspace; warm cũng có nên không quy hết cho font.
   Discovery0; detail cold khoảng0.000046. Không claim tối ưu motion đã sửa CLS.
4. **Normal fade có contrast thấp trong lúc xuất hiện.** Axe chạy giữa fade Home
   báo color-contrast; sau `Animation.finished` toàn50 snapshots sạch. Đây là khác
   biệt trạng thái thực, không sửa test bằng tắt axe. Nên đánh giá fade nội dung
   chính trong packet motion/khả năng đọc; current CSS không đổi trong UI14.
5. **Màn rất ngắn/chữ lớn còn khó dùng.** 320×420 textx2, nav chuyển hai hàng và
   chiếm khoảng237px, header khoảng135px; người dùng cần cuộn nhiều để đọc món.
   Không overflow/clipping nhưng geometry PASS không đồng nghĩa usability tốt.
   Probe bổ sung xác nhận ba tabs có thể focus/scroll rõ phía trên nav.
6. **Legacy reduced motion vẫn có một frame projection.** Baseline pinned và sau
   đều transform `translate3d(-189px,0,0)` ở frame đầu rồi none frame tiếp. Policy
   `reducedMotion=user` giữ nguyên; chưa gọi là loại bỏ mọi spatial frame. Normal
   animation nhiều frame, failure/pending giữ static highlight và native links.

Long task Home cold trước [1,0,1], sau [0,0,0]; discovery trước [1,0,1], sau
[0,1,0]; detail trước [2,2,1], sau [1,2,1]. Mẫu nhỏ và CPU nhân tạo; detail vẫn có
main-thread work, không khẳng định loại bỏ jank toàn ứng dụng.

## Hướng tiếp theo

UI15 ưu tiên short viewport/text lớn và khả năng đọc trong motion: kiểm tra khoảng
trống cho nội dung, keyboard focus và trạng thái fade trước/sau. Giữ UI07 paper/pine/
coral, mascot và font, tránh mở thêm một hướng nhận diện khi chưa có review chủ dự án.
Đợt domain-delivery và hosted cache/auth/CWV cần packet riêng. Bộ duyệt ảnh UI13
vẫn dùng được độc lập; kết quả hiệu năng không phê duyệt nguồn/quyền ảnh.

Dữ liệu: `evidence/analysis.json`, `evidence/baseline/performance.json`,
`evidence/after/performance.json`, build/hash receipts và failures trong evidence.
