# UI07 — Bộ nhận diện số của Tako-san

Canonical `vn-tak/Tako-san`; checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`,
branch `codex/ui-rebuild-foundation`, base `3c593d941fb6ffa1fefffb7c4c5050c6be4e34b7`.
Packet `docs/ai/tasks/UI07-brand-kit.md`, ADR-050. Hướng số cần chủ dự án review;
không suy ra phê duyệt thương hiệu cuối từ kiểm tra local.

## Đánh giá thẳng thắn và thay đổi

Bộ nhận diện cũ có cá tính nhưng khó dùng ở kích thước nhỏ: mũ đầu bếp, lá, má,
ánh mắt và nhiều nét cong cạnh tranh trong một symbol. Micro cũ vẫn giữ mũ/lá và
hầu hết hình học, nên chưa giải quyết triệt để độ đọc nhỏ. Chữ in hoa có khoảng
cách rộng, tạo cảm giác bảng hiệu; prototype UI01 lại dùng chữ thường và một
symbol khác. Trước UI07, icon ứng dụng/OG và core screens không cùng một bộ.

UI07 hoàn thiện hướng kitchen đã dùng ở UI01–UI06. Symbol có đầu bo, tay cuộn,
mắt và nụ cười đơn giản. Micro 16–24 px bỏ nét tay cuộn/nụ cười, mắt lớn hơn và
silhouette gọn hơn; từ 32 px dùng bản đầy đủ. Chữ thường Be Vietnam Pro Bold
được xuất từ chính WOFF2 trong repo thành nét vector, giữ tên hiển thị Takosan.
Tako-san vẫn là tên dự án/repo; không đổi identifier kỹ thuật hoặc domain.

Hệ thống có horizontal 300×72, stacked 240×176, wordmark 208×48, symbol/micro
64×64; mỗi loại có màu, bản đảo, một màu pine và một màu canvas. Bản một màu
khoét mắt khỏi silhouette, không cần thêm mực nền. Không có SVG text/image,
script, external href hoặc font hệ thống trong các export. Logo giữ tĩnh.
Motto “Ăn đủ. Mua đủ. Dùng hết.” giữ trục sản phẩm thay vì quảng cáo AI chắc chắn.

Điểm cần nói rõ: đây vẫn là một hướng thiết kế chưa thử nhận diện với người dùng.
Silhouette mới thiên về người bạn, chưa tự giải thích tính năng tủ lạnh. Cần copy/
ngữ cảnh sản phẩm để làm việc đó. Mascot mũ/lá của màn cũ còn tồn tại; không gọi
đây là thương hiệu đồng bộ toàn hệ thống hoặc một bộ mascot đã hoàn thiện.

## Asset, typography và nguồn gốc

Inventory thực tế `asset-inventory.json`: 117 file, gồm 41 file hướng mới với
171543 bytes (5 master + 36 export), 9 WOFF2 và OFL, supplied/legacy art giữ lại.
Hệ mới nằm tại `public/takosan/rebuild`; không xóa/ghi đè `/takosan/brand`,
`/takosan/app-icons`, mascot/UI icons hoặc Frigo content/compatibility paths.
Hai đường dẫn prototype rebuild/lockup và symbol được thay bằng export mới.
Không dùng ảnh AI, stock photo hoặc thêm dependency vào package/lockfile.

Font từ `@fontsource/be-vietnam-pro@5.2.6`, inherited UI01; hash đối chiếu với
inventory cũ. Copyright The Be Vietnam Pro Project Authors, SIL OFL 1.1 ở
`public/takosan/fonts/OFL.txt`. `scripts/ui07-outline-masters.py` trích glyph từ
latin/vietnamese/latin-ext; fonttools4.60.1/brotli1.2.0/zopfli0.2.3.post1 chỉ trong
venv `.artifacts/ui07-font-tools`. Master outline lưu sẵn nên export thông thường
không cần Python. Nunito/Google Fonts của remaining surfaces giữ nguyên cho đến
packet chuyển màn; không claim toàn app tự lưu font.

```sh
pnpm brand:icons
```

Sinh 36 export từ masters trong repo bằng pinned sharp0.33.5. Test sinh vào temp
folder rồi so từng byte với committed exports. Explicit `pnpm brand:icons <kit-dir>`
vẫn đi nhánh resize supplied kit như trước; archive kit nguồn không có trong
checkout nên không claim đã chạy lại nhánh đó bằng original external kit.

PNG regular 16/24/32/48/64/128/180/192/256/512; micro được chọn cho 16/24. Icon
regular/iOS có nền đặc canvas, chưa bo sẵn góc. Maskable512 nền đặc full bleed,
artwork vừa vùng tròn đường kính80% (test từng pixel foreground, kể cả antialias).
OG1200×630 từ vector gồm lockup, motto và tagline có dấu; không phụ thuộc font
máy. OG URL giữ hostname hiện hữu, thêm image alt và bỏ copy “chuẩn xác”.

## Màu và nguyên tắc dùng

Pine `#245D49`, coral `#EE705E`, ink `#202C28`, canvas `#F7F3EC`; giữ palette
và semantic scope của kitchen, không thay global palette/payment. Tỷ lệ tương
phản được đo trong evidence: white/pine, ink/canvas, muted/canvas, ink/coral.
Coral là accent, không dùng white text nhỏ. Brand chrome theme là pine; page
canvas sáng. Variants tối chỉ là ngữ cảnh asset, không phải dark mode toàn app.

Clearspace tối thiểu16 units (¼ symbol64). Horizontal>=128px, wordmark>=112px,
stacked>=144px, standard symbol>=32px, micro16/24. Giữ tỷ lệ, không shadow/glow/
phụ kiện. Named navigation link chứa decorative alt rỗng; logo độc lập có tên.
Trang [brand usage](brand-preview.html) trình bày kích thước thật, raster16 phóng8,
light/dark/one-color, crop tròn/vuông bo, safe circle, đúng/sai, font/license/voice.
Crop browser chưa chứng minh OS launcher cài thực tế.

## Đồng bộ frontend và giới hạn chuyển đổi

| Caller | Trạng thái sau UI07 |
| --- | --- |
| KitchenHeader / core Home, Fridge, Recipes/detail, Planner, Shopping | New lockup; named home link, back/actions giữ; dimensions300×72, mobile128px |
| RailSidebar trên core routes | Standard32 ở tablet; desktop horizontal150px; dimensions có prop riêng, fallback kit712×218 |
| AppLayout persistent desktop>=1024 | Sidebar giữ một lockup; header ẩn home-link/logo khỏi layout/tab và hiện motto |
| CookingModePage / CookingReview | New128px lockup, tỷ lệ đúng; immersive không chịu rule ẩn header |
| index.html / manifest / SW static precache | New favicon/icons/OG/theme; old required icons/logos vẫn precache; lifecycle/policy giữ |
| TAKOSAN_BRAND, generic Header/TopBar, landing/auth/onboarding/account/settings/notifications/Week | Supplied kit còn là compatibility contract; presentation/font chưa chuyển |
| PayOS/checkout/payment, backend/schema/domain/data | Không sửa |

Mobile không thêm chuyển động logo. Navigation và existing task motion giữ,
normal/reduced được kiểm tra. Cấu trúc route, flags, stock authority, scan review,
planner/Week compatibility, request/auth/session/revision/idempotency không đổi.
Core page screenshot cho thấy desktop bớt lặp và logo mobile đọc rõ hơn; bottom
navigation sáu vị trí vẫn là giới hạn IA/tap-density đã biết, chưa redesign UI07.

## Kế hoạch UI08

1. Inventory đúng remaining routes/callers: account/settings/notifications/family,
   landing/auth/onboarding, fallback và legacy Week khi planner flag tắt. Tách
   payment/protected UI, không đưa auth protocol vào thay đổi presentation.
2. Lập packet+ADR cho chuyển shell/font/assets của remaining screens; giữ hành vi
   form/session/onboarding/preferences và navigation. Chọn mascot chỉ cho trạng
   thái có ích; không vẽ thêm pose trước khi có nhiệm vụ cụ thể.
3. Chuyển account/settings/notifications trước: form đọc rõ, error/loading/empty,
   disclosure và touch targets; rồi funnel vào sản phẩm với identity thống nhất.
4. Kiểm thử flag-off Week bằng harness hỗ trợ đúng flag hoặc build riêng; preview
   hiện tại ép planner bật, không dùng làm bằng chứng cho đường tắt flag.
5. QA keyboard/enlarged text/320–1440/reduced motion; device/Safari/OS install/
   screen-reader/usability và brand owner review là gate riêng trước release.

Giữ typography/màu UI07, không đưa một phong cách khác vào mỗi màn. Canonical
mapping editor/media quality/hosted scraper/production rollout vẫn phạm vi riêng.
