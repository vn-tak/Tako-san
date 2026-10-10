> Historical audit snapshot before UI01 implementation. Findings describe
> `vn-tak/Tako-san@27d47b0` as inspected on 2026-10-09. Current implementation and
> remaining work are tracked in [FOUNDATION.md](FOUNDATION.md) and
> [VERIFICATION.md](VERIFICATION.md); original audit evidence remains linked below.

# Audit giao diện và nhận diện Tako-san

Ngày khảo sát: 09/10/2026, JST. Đây là báo cáo đánh giá và đề xuất; giao diện ứng dụng chưa được sửa.

## 1. Kết luận chính

**Tako-san cần một đợt thiết kế lại có hệ thống.** Vấn đề nằm ở cả cách tổ chức công việc, độ tin cậy của thông tin và ngôn ngữ thị giác. Thay logo hoặc đổi màu riêng lẻ sẽ để nguyên phần lớn trải nghiệm hiện tại.

Nhận xét thẳng về thương hiệu: bộ hiện tại dễ mến nhưng chưa đủ sắc nét và trưởng thành cho một trợ lý bếp được dùng hằng ngày. Wordmark nét bo tròn, mascot đầu bếp, Nunito, nền kem, pill và card mềm cùng xuất hiện dày; chúng khiến sản phẩm có cảm giác minh họa nhiều hơn cảm giác một công cụ nấu ăn đáng tin. Ảnh thực phẩm lại dùng nhiều phong cách khác nhau nên thương hiệu chưa có một tổng thể thống nhất. Đây là nhận định thiết kế, không phải kết quả khảo sát thị trường.

**Nên giữ tên Tako-san và tài sản nhận biết là bạch tuộc, rồi thiết kế lại cách thể hiện.** Frontend hiện có nền tảng tốt để thực hiện việc đó: router, query, giới hạn phiên/hộ gia đình, semantic token, shell thích ứng, dialog và reduced motion đã tồn tại. Không có cơ sở để đề xuất viết lại toàn bộ nền tảng từ đầu.

## 2. Xác minh đúng dự án

| Nguồn | Bằng chứng hiện tại | Cách sử dụng trong báo cáo |
| --- | --- | --- |
| Repo người dùng chỉ định | [vn-tak/Tako-san](https://github.com/vn-tak/Tako-san), repository ID `1385308553` | Nguồn chuẩn |
| `main` | `27d47b056455a57df811199cd7e9c32a84cbffe5` | Snapshot cố định để đọc code và chạy preview |
| Production | [frigo.tungjpstore.net](https://frigo.tungjpstore.net) | GET trang public, không đăng nhập hay tạo dữ liệu |
| `/api/v1/health/ready` | HTTP 200, `commit` đúng `27d47b0`, catalog `d1`, `expectedRecipeCount: 500` | Xác nhận Worker đang chạy đúng SHA; số 500 là cấu hình kỳ vọng, không phải phép đếm trực tiếp DB |
| `/sw.js` | HTTP 200, `BUILD_ID` đúng SHA trên | Xác nhận danh tính service worker; không thay thế kiểm tra tất cả bundle |
| Snapshot audit | 685 file được đối chiếu đúng Git blob hash | Mã UI, package, script preview, migration và public asset |
| Workspace `/Documents/frigo` | Checkout cũ, được dùng để lưu báo cáo | Không dùng giao diện Frigo cũ làm bằng chứng cho Tako-san |

Các owner cũ xuất hiện trong remote và tài liệu lịch sử không thay thế repo được người dùng xác nhận. Nhận xét ban đầu dựa trên checkout Frigo đã được loại khỏi báo cáo này.

Bằng chứng máy đọc được: [source-provenance.json](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/source-provenance.json), [production-public-release.json](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/production-public-release.json).

### Phạm vi kiểm tra thực tế

- Production: landing và auth tại 390/1440 px; chỉ GET, không tạo guest, đăng nhập, tải ảnh hoặc ghi vào production.
- Preview A: cùng source chuẩn, hộ thử nghiệm, catalog static 71, planner bật, composition V2 tắt; khảo sát nhiều màn tại 360/390/430/768/1024/1440 px.
- Preview B: cùng source chuẩn, hộ thử nghiệm, catalog D1 500 công thức, planner và composition V2 bật; tạo thực đơn, xem bữa, mở picker, lập danh sách mua và đi qua bước hoàn tất nấu.
- Preview chặn mạng ngoài; ảnh ngoài thất bại có chủ đích. Nunito được nạp từ font fixture cục bộ để giữ hình thức gần giao diện thật.
- 19 lần axe với nhóm WCAG 2 A/AA và 2.1 AA không ghi nhận vi phạm ở các trạng thái được chọn. Không có overflow ngang trong 57 ảnh thuộc ma trận chính và các ảnh luồng D1 bổ sung.
- Đây không phải chứng nhận accessibility toàn hệ thống: chưa kiểm tra VoiceOver/NVDA, thiết bị iOS/Android thật, bàn phím ảo, mọi trạng thái auth/OTP, mọi tình huống offline, lỗi và race condition.
- Flag planner/composition của phiên production đã đăng nhập chưa được xác minh. Các lỗi phụ thuộc flag được ghi rõ là xảy ra khi flag bật trong preview.
- Không chạy lint/typecheck/build/toàn bộ unit suite trong đợt audit tài liệu; không ghi nhận các suite đó là đã pass.

## 3. Các vấn đề ưu tiên

P1 = cần xử lý trước khi coi luồng cốt lõi đã đáng tin. P2 = ảnh hưởng trải nghiệm thường xuyên hoặc chất lượng thiết kế. Đây là ưu tiên cho đợt xây lại, không phải mọi hàng đều là lỗi lập trình.

### F01 — P1: “Có nguyên liệu” đang bị diễn đạt thành “đủ nguyên liệu”

Tái hiện: món thịt kho trứng cần **4 trứng**, tủ có **2 trứng**. Tab nguyên liệu vẫn tô xanh, gắn dấu tích cho trứng và không có nút mua phần thiếu. Người dùng có thể hiểu rằng không cần mua thêm.

[RecipeDetailPage.tsx:291](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/RecipeDetailPage.tsx#L291) chỉ kiểm tra `quantity > 0`. Engine [engine.ts:18](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/packages/recipes/src/engine.ts#L18) đếm lượng đủ riêng nhưng [engine.ts:88](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/packages/recipes/src/engine.ts#L88) tính `canCookWithoutBuying` từ danh sách thiếu chủng loại/đơn vị, chưa bao gồm trường hợp có nhưng thiếu lượng. Vì vậy rủi ro còn lan đến bộ lọc “Không mua thêm gì” và badge “Đủ 100%”.

Hướng sửa: một contract dùng chung phân biệt đủ / thiếu lượng / chưa quy đổi được / chưa có; thể hiện `Cần 4 · Có 2 · Mua thêm 2`. Không giải quyết bằng cách đổi màu đơn thuần. Lượng ghi vào shopping phải là phần thiếu sau quy đổi và tính khẩu phần.

Bằng chứng: [ảnh lượng thiếu](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/screenshots/recipe-insufficient-quantity-390.png), [focused-observations.json](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/focused-observations.json).

### F02 — P1, khi planner bật: Home và planner đọc hai nguồn kế hoạch

Preview đã có một thực đơn 7 bữa bắt đầu ngày mai. Planner hiển thị đủ 7 bữa, nhưng Home vẫn báo “Chưa có thực đơn tuần này”. GET `/week/current` trả `plan: null`; GET `/meal-planning/plans/current` trả kế hoạch 7 bữa.

[HomePage.tsx:77](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/HomePage.tsx#L77) dùng query Week cũ; planner dùng API kế hoạch mới. Đây là sự lệch giữa hai luồng thật, không phải Home dùng số liệu giả. Trường hợp hôm nay chưa có bữa cũng cần được phân biệt với chưa có kế hoạch.

Hướng sửa: Home đọc nguồn canonical tương ứng flag, qua một presentation adapter; vẫn giữ alias và compatibility Week. Hiển thị “Thực đơn bắt đầu ngày mai” khi phù hợp. Chưa xác nhận lỗi này trong một hộ production đã đăng nhập.

Bằng chứng: [home-plan-observations.json](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/home-plan-observations.json), [Home sau khi tạo kế hoạch](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/screenshots/d1-home-after-plan-390.png).

### F03 — P1 về quy mô: danh sách công thức render cả 500 món

Trong preview D1, một lần mở trang công thức có **500 thẻ**, **502 ảnh trong main**, tài liệu cao khoảng **77.433 px** ở viewport desktop của phép đo. API recommendations trả khoảng **1.073.447 byte JSON chưa nén**, bao gồm dữ liệu công thức đầy đủ. Lazy loading ảnh không giảm số DOM và dữ liệu JSON.

[RecipesPage.tsx:287](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/RecipesPage.tsx#L287) map toàn bộ danh sách. Đây là vấn đề có cơ sở đo trên dữ liệu 500, nhưng chưa phải kết luận về LCP/INP production.

Hướng sửa: list DTO gọn, phân trang ổn định theo bộ lọc, tải 24 món đầu rồi “Xem thêm”; chỉ tải steps/ingredients đầy đủ khi xem chi tiết. Không đưa toàn bộ 500 công thức vào một feed mặc định. Virtualization chỉ thêm nếu phép đo sau phân trang vẫn yêu cầu.

Bằng chứng: [catalog-render-observations.json](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/catalog-render-observations.json).

### F04 — P1 trong trường hợp ảnh lỗi: fallback món ăn gây hiểu nhầm

[recipe-media.ts:13](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/lib/recipe-media.ts#L13) dùng ảnh **thịt kho trứng** làm placeholder chung. Khi ảnh ngoài không tải được trong preview, rau muống xào, canh chua và nhiều món khác đều mang hình thịt kho.

Không khẳng định toàn bộ ảnh production đang sai: mạng ngoài của preview bị chặn. Điều đã xác nhận là **đường fallback hiện tại có thể thể hiện sai món khi ảnh thiếu hoặc lỗi**. Alt mô tả tên món cũng không làm ảnh thay thế trở nên đúng.

Hướng sửa: placeholder trung tính, ghi “Chưa có ảnh món này”; không gán ảnh một món khác. Ảnh thật cần provenance và mapping đúng recipe ID/version. Giữ cơ chế canonical media đang có.

Bằng chứng: [recipe detail khi ảnh lỗi](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/screenshots/recipe-detail-1440.png).

### F05 — P2: kết quả tìm kiếm rỗng bị báo thành tủ lạnh rỗng

Tủ đang có 5 nguyên liệu. Nhập `zzzzzz`, màn hình báo “Tủ lạnh đang trống” và mời chụp tủ lạnh. [InventoryPage.tsx:231](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/InventoryPage.tsx#L231) dùng `filteredItems.length === 0` cho cả hai tình huống.

Hướng sửa: tách kho chưa có dữ liệu / không khớp tìm kiếm / danh mục rỗng / tải lỗi. Với tìm kiếm, giữ query và CTA “Xóa tìm kiếm”, không hướng người dùng nhập thêm hàng.

### F06 — P2: bộ lọc và truy vấn công thức mất khi tải lại

Chọn ≤20 phút, tìm `canh`: URL vẫn `/recipes`. Reload làm search rỗng và nút thời gian trở về `aria-pressed=false`. [RecipesPage.tsx:17](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/RecipesPage.tsx#L17) lưu mọi filter bằng state tại component.

Hướng sửa: query, category, region, cuisine, maxTime và noBuy nằm trong URL; back từ chi tiết giữ bộ lọc và vị trí cuộn. Query key được sinh từ cùng bộ tham số đã chuẩn hóa.

### F07 — P2: desktop chỉ được kéo rộng ở một số màn

Có shell tablet/desktop thật, không phải ứng dụng bị khóa vào khung điện thoại. Tuy nhiên nhiều nội dung vẫn dùng cấu trúc mobile kéo ngang:

- Featured recipe đo được khoảng **1.152 × 540 px** trong lượt kiểm tra desktop, khiến phần lớn viewport đầu bị một món chiếm.
- Recipe detail có ảnh cao cố định **224 px** trên vùng nội dung rộng, thành một dải crop ngang; hướng dẫn vẫn 12 px và dòng quá dài.
- Inventory mỗi hàng kéo gần toàn chiều rộng trong khi dữ liệu cốt lõi nằm ở hai đầu.
- Planner hiển thị chuỗi card ngày dài; không tận dụng desktop để đối chiếu lịch, món và phần cần mua.
- Có logo ở sidebar và lặp lại trong TopBar.

Nguồn: [RecipeCard.tsx:109](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/components/common/RecipeCard.tsx#L109), [RecipeDetailPage.tsx:146](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/RecipeDetailPage.tsx#L146).

Hướng sửa: thiết kế riêng cấu trúc desktop theo công việc; kiểm soát aspect ratio, chiều dài dòng, mật độ và cột phụ, không chỉ thêm breakpoint đổi width.

### F08 — P2: review AI đúng về dữ liệu nhưng quá nặng về thao tác

Review 4 nguyên liệu có chiều cao khoảng **2.337 px** ở 390 px; mỗi hàng luôn mở tên, lượng, đơn vị, bảo quản, hạn và các lựa chọn ước tính. Màn hóa đơn lại dùng nhãn/đơn vị khác. Người dùng phải đọc và cuộn nhiều trước khi hiểu hàng nào thực sự cần sửa.

Điểm tốt: có chỉnh sửa trước xác nhận, có độ tin cậy thấp/chưa rõ, có hạn ước tính và từ chối hàng. Không nên bỏ các đảm bảo này để làm UI ngắn hơn.

Hướng sửa: tóm tắt tất cả hàng, ưu tiên mở hàng cần xem lại, một editor theo hàng; giữ rõ lượng/hạn đang là ước tính. Desktop có ảnh nguồn bên trái và danh sách review bên phải. Không tự xác nhận thay người dùng.

### F09 — P2: navigation và bộ lọc quá nhiều lựa chọn cùng lúc

Mobile thực tế có **6 affordance**: Home, tủ, quét, công thức, thực đơn, tôi; scan tuy không được khai báo là IA root vẫn chiếm một vị trí trên thanh. Nhãn 11 px, với scan nhô lên cạnh các CTA cố định. Không có overflow trong mẫu kiểm tra, nhưng người dùng phải phân biệt quá nhiều điểm đến trên một hàng.

Recipes có rail 11 danh mục cộng rail thời gian/no-buy/vùng/ẩm thực; scrollbar bị ẩn. Một phần tùy chọn nằm ngoài màn và thiếu tín hiệu rõ về những bộ lọc đang áp dụng.

Hướng sửa: 5 điểm đến chính, quét là action ở Home/tủ; hai filter nhanh và một nút “Bộ lọc”. Trình bày filter đã chọn, số kết quả, reset dễ chạm. Kiểm chứng việc tìm quét trong usability test trước khi bỏ nút trung tâm.

### F10 — P2: thông điệp sản phẩm lộ nhiều chi tiết triển khai

Hộ gia đình nói “Chưa có API… trên máy chủ”, “không hiển thị luồng giả”; onboarding nói về máy chủ xác nhận và thiết bị; planner nói về độ lệch múi giờ, dữ liệu Week cũ và thuật toán đã xét. Các câu này cố giữ tính trung thực nhưng bắt người dùng đọc cơ chế kỹ thuật để làm việc đơn giản.

Landing production lại nói “chuẩn xác”, “tức thì”, “món ăn tối ưu ngay”, mạnh hơn luồng thực tế vốn cần review và có giới hạn dữ liệu.

Hướng sửa: diễn đạt khả năng bằng việc người dùng làm được; giải thích kỹ thuật chuyển vào trợ giúp khi cần. Giữ các cảnh báo ảnh hưởng quyết định: chưa rõ lượng, chưa đủ dữ liệu dị ứng, giá chưa được xác minh. Landing mô tả “Nhận gợi ý, kiểm tra rồi lưu”.

Nguồn: [FamilySharingPage.tsx:51](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/FamilySharingPage.tsx#L51), [LandingPage.tsx:45](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/LandingPage.tsx#L45).

### F11 — P2: nhận diện cũ vẫn xuất hiện qua avatar và hình hoàn tất

Session có avatar mặc định `/icons/favicon.svg`, đang là biểu tượng tủ lạnh xanh cũ; vì có `avatarUrl`, TopBar/Home không dùng fallback Tako-san. Luồng nấu hiện tại còn dùng minh họa `FRIGO_ASSETS.illustrations['delicious-meal']`; màn hoàn tất legacy dùng mascot Tako-san. Hai cách kết thúc không cùng nhận diện.

Nguồn: [auth.ts:234](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/worker/routes/auth.ts#L234), [CookingModePage.tsx:256](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/pages/CookingModePage.tsx#L256).

Tên `Frigo Preview` trong ảnh là tên tài khoản fixture, không được coi là tên thương hiệu hiện tại. Các identifier như `@frigo/domain`, cookie và cache key cũng không tự động là lỗi branding; đổi chúng có thể phá compatibility.

Hướng sửa: lập manifest asset/brand để thống nhất điểm tiếp xúc. Xử lý alias asset mặc định trước; không đổi giao thức auth chỉ để dọn tên.

### F12 — P2: số lượng và đơn vị khó đọc khi đi chợ

Preview shopping hiện `116.6666666666667 g`, `1.3333333333333333 cái`, `133.33333333333334 ml`; tủ/review khác lại hiện `piece`, `bunch`. [presentation.ts:710](https://github.com/vn-tak/Tako-san/blob/27d47b056455a57df811199cd7e9c32a84cbffe5/src/web/features/planner/presentation.ts#L710) in raw value; inventory hiển thị raw unit.

Hướng sửa: format số và dịch đơn vị chung. Giữ giá trị tính toán chính xác ở domain; lượng hiển thị được làm tròn có dấu xấp xỉ khi cần. Lượng cần dùng và số gói/quả cần mua là hai khái niệm riêng; không tự đổi 3,5 quả thành 4 quả nếu chưa có quy tắc mua phù hợp.

## 4. Audit nhận diện, UI và asset

![Bộ nhận diện và asset hiện tại](/Users/tunbee27/Documents/frigo/docs/takosan-ui-audit-2026-10-09/screenshots/brand-and-assets.png)

### Tên, logo và wordmark

Contract hiện ghi `Takosan`, wordmark thể hiện `TAKOSAN`; người dùng gọi dự án Tako-san. Trước khi xuất brand kit mới cần thống nhất cách viết được dùng trong UI, logo, metadata và tài liệu. Báo cáo này không tự đổi tên.

Logo SVG hiện rất nhẹ, đã có horizontal/stacked/white/micro. Nền tảng định dạng đúng. Điểm yếu là wordmark vẽ nét bo tròn đồng đều, độ cá tính chủ yếu do độ “cute”, quan hệ kích thước chữ và symbol chưa tạo cảm giác tinh chỉnh. Mũ đầu bếp, lá, má, mắt và xúc tu nhiều chi tiết so với kích thước navbar/favicon. Micro đã tồn tại, cần đánh giá sử dụng đúng nơi thay vì tạo thêm hàng loạt PNG.

### Mascot

Mascot bạch tuộc có giá trị ghi nhớ; loại bỏ toàn bộ sẽ mất tài sản nhận biết đang có. Tuy vậy nhiều pose chủ yếu giữ tư thế chính diện rồi thay đồ vật nhỏ. Tủ lạnh ở tay mascot khó đọc khi thu nhỏ; cảm giác giống vật cầm tay hơn một tình huống bếp.

Nên giảm tần suất xuất hiện trong workspace dữ liệu, dành mascot cho onboarding, hướng dẫn quét, empty state và hoàn thành. Làm lại pose bằng cử chỉ/biểu cảm thực sự khác nhau; giữ quy tắc silhouette và kích thước tối thiểu.

### Typography

Nunito được dùng cho cả heading và body, tạo sự đồng nhất nhưng làm mọi cấp nội dung đều mềm. Nhiều thông tin 10–13 px: metadata, badge, mô tả, hướng dẫn nấu ở detail. Ở màn nấu immersive chữ lớn hơn và hợp ngữ cảnh; nên giữ ưu điểm đó.

Vấn đề chính là phân cấp và độ đọc, không phải cứ dùng Nunito là lỗi thời. Có thể thay sang cặp display có cá tính và UI sans rõ nét; phải kiểm tra dấu tiếng Việt, số/đơn vị, tên món dài, font fallback và reflow.

### Màu sắc và surface

Hiện có coral `#FF7B6B`, green `#2E7D5B`, navy `#1F2937`, cream `#FFF8F3`, mint `#DFF4E6`, yellow `#FFC857`. Bộ màu đủ thân thiện, nhưng gần như mọi chức năng đều trở thành card trắng/kem và pill xanh. Coral có ở mascot nhưng ít tham gia cấu trúc thương hiệu; green đồng thời là action, selected, success và thông tin “có nguyên liệu”.

Nên giữ một màu action rõ; tách màu trạng thái khỏi màu thương hiệu. Dùng khoảng trắng, đường phân tách và typography để nhóm thông tin; giảm card lồng card, bóng và capsule. Thêm ảnh thực phẩm đúng món để tạo cảm giác ngon miệng, thay vì để mascot chịu toàn bộ cảm xúc sản phẩm.

### Icon

Có icon SVG Tako-san và Lucide. Cùng tồn tại không nhất thiết sai; hiện các nét, proportions và cách đặt trong ô nền khác nhau theo màn. Một số icon bị dùng như trang trí cạnh đoạn text rất nhỏ nên không cải thiện khả năng quét mắt.

Nên chọn một grammar nét và kích thước; dùng SVG/component, không quay lại icon raster. Emoji/flag có thể giữ ở nội dung phù hợp nhưng không dùng làm bộ icon điều hướng chính.

### Ảnh nguyên liệu và món ăn

Hiện có mascot 2D phẳng, nguyên liệu 3D bóng, nguyên liệu mới gần ảnh thật, ảnh món chụp và minh họa bát đồ ăn có mặt. Chúng không có một art direction chung. Asset ức gà còn có mảnh màu cam bị cắt ở mép trên, xuất hiện trên cả bảng asset và hàng inventory.

Ảnh món nên đúng món, ánh sáng/đạo cụ/crop nhất quán, đủ rõ ở thumbnail. Nguyên liệu cần một phong cách cutout duy nhất; có generic trung tính khi chưa map canonical. Không dùng ảnh trông “có vẻ đúng” để che thiếu dữ liệu.

### Dung lượng asset

| Nhóm | Đo trên source chuẩn | Ý nghĩa |
| --- | ---: | --- |
| Toàn bộ `public` | 205 file; 26.438.005 byte ≈25,21 MiB | Dung lượng thư mục, không phải tải đầu trang |
| Raster / SVG | 166 / 36 | Cần manifest và QA định dạng |
| `public/takosan` | 167.734 byte ≈164 KiB | Bộ SVG nhận diện nhẹ, có thể kế thừa pipeline |
| Board tham khảo `public/frigo/reference` | 6.699.864 byte ≈6,39 MiB | Nên chuyển khỏi public khi đã kiểm tra caller/compatibility |
| Một số PNG nguyên liệu 512×512 | ~200–480 KB/ảnh | Quá lớn so với ô hiển thị thường 40–96 px; cần biến thể đúng kích thước |

Không khẳng định tất cả file được download hoặc precache. Đo network theo route trước khi đặt mục tiêu giảm tải. Không xóa đường dẫn cũ nếu còn trong API, cache hoặc recipe media.

## 5. Luồng người dùng và kiến trúc thông tin

Vòng lặp giá trị nên rõ: **biết đang có gì → chọn bữa → bổ sung phần thiếu → nấu → xác nhận lượng đã dùng**. Hiện các chức năng đã có, nhưng chuyển giao thông tin giữa chúng chưa luôn nhất quán.

| Luồng | Điều đang làm tốt | Ma sát chính | Thiết kế lại cần đạt |
| --- | --- | --- | --- |
| Landing → dùng thử | Lời hứa dễ hiểu, không bắt tạo tài khoản ngay | Mascot lớn, ít bằng chứng sản phẩm, cam kết AI quá mạnh | Một ví dụ quét → review → món thật; CTA rõ |
| Auth → onboarding | Input có label, bước onboarding có URL, lưu có xác nhận | Nhiều copy kỹ thuật; bước goals dài; “Quay lại” chỉ cao ~20 px | Giải thích lợi ích, ít quyết định bắt buộc, resume đúng draft |
| Tủ → thêm/quét → review | Có manual add, camera fallback, review trước lưu | Hàng review rất dài, đơn vị lệch, nhiều thanh cố định | Có summary từng hàng và editor theo nhu cầu |
| Tủ → tìm kiếm | Search/category hoạt động | Empty state sai ngữ cảnh | Reset đúng query, giữ dữ liệu kho |
| Công thức → chi tiết | Có deep link slug/ID, tabs thực, lỗi/404 | Filter mất, ảnh fallback sai, “đủ” thiếu semantics lượng | Search có thể phục hồi; đủ/thiếu/chưa rõ nhất quán |
| Chi tiết → nấu → hoàn tất | Immersive, chữ lớn, timer, xác nhận trước trừ, lỗi completion có thông báo | Detail khó đọc; completion art cũ và danh sách nhiều lượng 0 | Preflight phần thiếu; tóm tắt lượng thực tế, confirm rõ |
| Lập tuần → đổi/thêm món | Có revision, picker, suggestion cần accept | Header lớn lặp lại; ba nút Thêm món, nhiều hành động cạnh nhau | Một action chính theo trạng thái; workspace bữa rõ |
| Thực đơn → đi chợ | Phân biệt giá chưa biết và nhu cầu chưa rõ | Các cảnh báo dày; số raw; checkbox chỉ lưu lần xem | Dễ nhìn phần cần mua, chỉ báo nơi lưu danh sách |
| Đi chợ trực tiếp `/shopping` | Luồng riêng có danh sách | Người dùng khó hiểu quan hệ với đi chợ của planner | Cùng quy tắc UI, phân biệt danh sách lưu và bản đề xuất |
| Profile → gia đình/settings | Khả năng chưa có được nói thật | Hộ gia đình thành nhiều hộp báo chưa hỗ trợ | Trang gọn theo capability; trợ giúp có nghĩa với người dùng |

Đánh dấu đã nấu trong planner và xác nhận trừ nguyên liệu trong cooking là hai thao tác khác nhau hiện nay. Thiết kế mới phải diễn đạt rõ và không tự hợp nhất chúng thành một mutation.

## 6. Nhận xét theo nhóm màn

| Nhóm màn | Đánh giá cụ thể | Ưu tiên thiết kế |
| --- | --- | --- |
| Home | Header thân thiện; khối bữa/đồ dùng sớm và gợi ý có dữ liệu. Empty planner được ưu tiên quá mạnh, danh sách món phía dưới lặp vai trò catalog | Tập trung “bữa tiếp theo” và hành động dùng thực phẩm; xử lý canonical plan trước |
| Inventory/detail/reconciliation | Hàng inventory rõ tên và lượng; đối chiếu là chức năng nâng cao. Thanh “Xem bằng chứng” xuất hiện sớm làm luồng cơ bản giống công cụ kiểm tra dữ liệu | Giảm mật độ metadata; đưa đối chiếu vào nhóm tác vụ phụ; edit panel desktop |
| Scan | Immersive có fallback khi camera không sẵn sàng. Ba loại quét và hạn mức có mặt | Hướng dẫn chụp theo mode, trạng thái permission rõ, laser chỉ khi cần |
| Scan/receipt review | Dữ liệu gốc, confidence và editable field đầy đủ | Chung component review, nội dung ngắn theo trạng thái, không đánh đồng hạn nhãn và hạn ước tính |
| Recipes | Có category/cuisine/region/time/no-buy, error/empty state đúng cho món | URL filter, pagination, ảnh đúng và hierarchy mới |
| Recipe detail | Tabs có ARIA và arrow navigation; có lượng cần và lượng trong tủ | Desktop 2 cột, mobile đọc rõ, thiếu lượng có CTA |
| Cooking/complete | Chữ lớn, step progress, timer và exit confirm phù hợp lúc nấu | Giữ một bước chính; highlight timer; sửa art và presentation lượng |
| Planner setup | Input ngày/số người/bữa và trạng thái busy có thật | Dùng preference mặc định đã lưu khi contract cho phép; ít thuật ngữ, tóm tắt trước tạo |
| Planner week | Có status, bữa chưa xếp, revision và giới hạn thuật toán | Mobile agenda; desktop board tuần, summary shopping cạnh lịch |
| Composer/picker | Tìm theo vai trò/ẩm thực, keyboard dialog, accept suggestion rõ | Giảm action cạnh tranh; thumbnails đúng hoặc trung tính; thao tác swap dễ tìm |
| Shopping | Không bịa giá, trạng thái thiếu nguồn giá có lý do | Đặt danh sách thực phẩm trước diagnostics; format lượng; persistence rõ |
| Notifications/profile | Có inbox thật và nhóm cài đặt riêng | Giữ phân tách inbox/preference; thứ tự theo việc dùng thường xuyên |
| Household/privacy/app settings | Component Page/Surface khá nhất quán, capability chưa có không giả lập | Ngắn gọn, từ ngữ người dùng, một hệ header/spacing thống nhất |
| Auth/OTP/recovery | Auth public đã xem; phần còn lại đọc code có state machine | Regression riêng cho copy, focus, error và resume; chưa kiểm tra đủ runtime trong đợt này |
| Week legacy và Plus | Route/compatibility còn trong source | Week cần matrix flag/alias. Plus/payment là vùng bảo vệ, chưa audit giao dịch và chưa đề xuất sửa |

## 7. Responsive và accessibility

| Viewport đã kiểm tra | Hiện trạng | Thiết kế mục tiêu |
| --- | --- | --- |
| 360/390/430 | Không tràn ngang trong mẫu; nav 6 vị trí, nhiều nhãn 11 px, CTA cố định | 5 destination, chữ nội dung 16 px, ít rail ngang, safe area và keyboard |
| 768 | Có rail 80 px, nội dung tăng bề rộng | Hai cột khi đủ chỗ; form không kéo dài; editor có vùng riêng |
| 1024 | Sidebar 256 px bắt đầu hiện, làm giảm canvas đáng kể | Breakpoint theo chiều rộng nội dung; rail có thể hợp lý hơn khi canvas hẹp |
| 1440 | Có canvas rộng; một số trang tận dụng hai cột, một số chỉ stretch | Recipe/catalog/weekly planner có composition desktop riêng |
| 200% zoom, landscape, màn hình thấp | Chưa kiểm tra toàn ma trận trong đợt này | Bắt buộc trước release, cả reflow và text zoom |

Các điểm đã làm tốt cần giữ: link điều hướng thật, `aria-current`, tab semantic, modal được đặt tên, Escape đóng manual add, motion provider tôn trọng thiết lập người dùng, input form chính có label.

Công cụ đo target bằng bounding box cho radio/checkbox 1×1 và switch 52×32 sẽ tạo false positive: radio có label lớn; switch có pseudo-element mở rộng hit area lên 44 px. Không tính chúng thành lỗi. Những target thực cần cải thiện là “Quay lại” onboarding và “Xóa tất cả lọc” (~16–20 px chiều cao). Placeholder search nên có label rõ và ổn định; không gọi đây là vi phạm axe đã phát hiện.

19 axe pass không chứng minh đọc dễ, hierarchy tốt, flow đúng hay thao tác thuận tiện. Các lỗi F01/F02/F05/F06 đều có thể tồn tại trong giao diện pass axe.

## 8. Motion

Hiện đã có token 80/140/220/320 ms, motion provider, indicator điều hướng, animation thêm/bớt inventory, chuyển bước cooking/auth, sheet/dialog và fade CSS. Trong preview reduced motion, cả Home và scan không còn animation đang chạy ở thời điểm đo; laser được gate bằng `motion-safe`.

Điểm cần nâng chất lượng: nhiều page chỉ fade toàn khối; mascot chủ yếu ảnh tĩnh; animation chưa giúp nhiều cho chuyển giao dữ liệu sau scan, thay món, cập nhật lượng. Laser còn chạy ở trạng thái camera unavailable mặc định trong preview, là trang trí ít hữu ích.

Nên ưu tiên motion báo thay đổi cụ thể: hàng vừa thêm, số lượng vừa cập nhật, món thay thế vừa lưu, timer đạt mốc. Chỉ có một animation mở đầu thương hiệu ngắn; không khiến thao tác phụ thuộc việc chờ animation. Tất cả vẫn có trạng thái text và reduced motion.

## 9. Frontend: giữ nền tảng, thay hệ thống trình bày

Source chuẩn có 79 file TSX, khoảng 14.229 dòng. Đây là kích thước để lập kế hoạch, không phải chỉ số chất lượng. Stack hiện là React 18, TypeScript, Vite 6, Tailwind 3, React Query, Zustand, React Router và Motion; không phải Next.js/Tailwind 4.

Điểm tốt: route lazy/Suspense, error boundary, private session reset, query key/invalidation, layer API riêng, brand contract, semantic token, mobile/rail/sidebar cùng model, state component và version/idempotency ở nhiều mutation. Không có `transition-all` trong TSX được khảo sát.

Khoảng trống quan trọng: Page/PageHeader/Surface tồn tại song song với TopBar và page container riêng; planner có shell/copy riêng; quantity/availability/asset/empty state chưa dùng cùng semantics. API facade vẫn nhập catalog static cho offline, nên kế hoạch nâng hiệu năng phải xét cả offline authority, không chỉ cắt bundle tùy tiện.

Đề xuất giữ domain/API/security contract, mở rộng list API ở mức cần thiết, tạo presentation adapter và component contract thống nhất. Thay từng vertical slice, giữ route/alias/query invalidation. Không migration framework, thay state library hoặc đổi database trong scope này.

## 10. Giới hạn và cách đọc kết luận

Đánh giá thẩm mỹ được gắn rõ là nhận định chuyên môn; chưa có dữ liệu conversion, retention, heatmap hay phỏng vấn người dùng để chứng minh “cũ” làm giảm doanh thu. Không chấm một điểm tổng giả chính xác.

Có thể kết luận với bằng chứng hiện tại: nền móng kỹ thuật khá; presentation và IA chưa nhất quán; một số luồng còn biểu diễn sai dữ liệu; brand kit và content asset chưa đủ thống nhất để tạo dấu ấn. Phạm vi authenticated production vẫn cần một lượt xác nhận riêng bằng tài khoản thử nghiệm được phép sử dụng, đặc biệt flag, camera, mail/OTP và dữ liệu thực. Các ảnh synthetic không được gắn nhãn là ảnh tài khoản production.

Kế hoạch thực hiện, thiết kế mục tiêu và nghiệm thu: [REBUILD_PLAN.md](REBUILD_PLAN.md).
