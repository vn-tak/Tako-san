# UI10 - Kiểm chứng local

Repository: `vn-tak/Tako-san`; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, branch
`codex/ui-rebuild-foundation`; base `3c018d7778a780f5759d967e62d58440e4e08c2d`.
Implementation checkpoint chưa tạo; chỉ ghi hash sau khi đã đối chiếu Git objects.
Không có push, PR, merge, deploy hay remote migration.

## Kiểm tra tập trung

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui10-week-presentation.test.tsx tests/unit/ui10-week-routes.test.tsx tests/unit/week-query-sync.test.ts tests/unit/week-route-serialization.test.ts tests/unit/week-shopping-route-policy.test.ts tests/unit/week-reconciliation.test.ts tests/unit/week-planner.test.ts tests/integration/week-core-flow.test.ts tests/integration/frontend-ui-integration.test.tsx tests/unit/ui08-onboarding-navigation.test.tsx tests/unit/t18c-keyboard-controls.test.tsx
```

11 files / 192 tests PASS trong 7.18s: 34 test mới, 158 test hiện có. Setup kiểm
quay lại giữ lựa chọn, giới hạn 1-3 ưu tiên, xác nhận tạo và không gửi lịch từng ngày.
Generation kiểm null/undefined, StrictMode chỉ một command, thiếu identity, reset
session và lỗi. Settings không gọi API, không thay currentPlan, giữ nguyên trang
sau apply và có link trở về tường minh.

Clipboard chờ kết quả thật, lỗi/không hỗ trợ nhận focus; receipt cũ bị bỏ sau khi
đóng/mở lại. Hủy native share không báo đã chia sẻ. Shopping giữ selection, phân
biệt pendingSync với server receipt và focus phản hồi lỗi/hoàn tất. Hai test store
kiểm pass-through true/false; các test private key, ordering, rollback và invalidation
hiện có vẫn chạy. Actual App guards kiểm 7 route khi bật và tắt planner.

T18C chuyển assertion sang Link/radio/checkbox native theo giao diện mới, giữ nguyên
payload. Shopping chỉ còn một summary giá thực nên assertion đổi từ hai lần sang
một lần, vẫn cấm giá demo. Typecheck/lint trên mã giao diện đã đóng băng PASS;
`node --check` cho hai browser script PASS.

## Bộ kiểm tra toàn dự án và phục hồi

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Lượt preliminary (`ui10-full-check.log`) bị dừng để sửa lỗi heading CTA bị ép thành
cột chữ ở text x2; không được tính PASS. Lượt kế tiếp (`ui10-full-check-final.log`)
exit 1: 283 files, 6642 tests PASS / 7 FAIL, tổng 6649; Vitest 525.94s. Type/lint
đạt nhưng pipeline dừng trước migration/build.

Sáu lỗi nằm trong UI02/UI07/UI08/UI09 tests còn kỳ vọng `/week` và `/week/setup`
chưa được migrate. Reproduction riêng xác nhận cả sáu; test Wrangler cùng lượt đạt.
Cập nhật bốn file theo ADR-053: giữ negative coverage bằng `/week-old` và
`/week/plan/other`, thêm bốn positive cases cho `/week` và `/week/setup`. Không xóa
kiểm tra protected routes hay điều chỉnh implementation để né hành vi được chấp nhận.

Lỗi thứ bảy là test Wrangler local list migrations vượt timeout 5000ms trong lượt
full. Test nguyên trạng đạt khi chạy reproduction và recovery; ở recovery, case
Wrangler mất 1163ms. Chưa chứng minh chính xác nguyên nhân biến động thời gian.
Giữ nguyên timeout, configuration, staging/migration test và runtime được bảo vệ.

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm exec vitest run tests/unit/ui02-presentation.test.ts tests/unit/ui07-brand-shell.test.tsx tests/unit/ui08-route-scope.test.tsx tests/unit/ui09-route-scope.test.tsx tests/unit/staging-d1-catchup-check.test.mjs
```

Reproduction exit 1: 6 FAIL / 118 PASS, 5 files, 6.89s. Recovery exit 0:
5 files / 128 tests PASS, 5.55s. Log và bytes/SHA256 được lưu riêng.

Lượt full sau recovery (`ui10-full-check-recovered.log`) exit 0: 283 files /
6653 tests PASS, 0 FAIL; Vitest 393.63s. Typecheck, ESLint, migration smoke,
Vite 3.12s và Worker TypeScript build PASS. Remote schema/Week parity không chạy.
Không nới timeout/config. Browser evidence ứng với runtime cuối: recovery chỉ
cập nhật test assertions. Bốn positive cases mới đưa chênh lệch so với base lên
38 tests; 34 test mới thuộc focused suite, bốn test thêm ở route adoption.

Sau full, 143 source hashes vẫn khớp. 51 public asset/font files trong
`dist/client` byte-identical với source và baseline UI09. Local build dùng release
identity của base trước commit; không coi là release artifact.

## Browser và nguồn dữ liệu

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5204 PREVIEW_API_PORT=8904 PREVIEW_MEAL_PLANNER_ENABLED=false node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell UI_REBUILD_OUT=.artifacts/ui10/browser-verified node scripts/ui10-browser-check.mjs
```

61 snapshots / 11 nhóm hành trình PASS. Không có pageerror ngoài dự kiến, horizontal
overflow, ảnh lỗi hay vi phạm axe thuộc WCAG 2A/AA/2.1AA; mỗi snapshot có một h1.
Kiểm 320/390/768/1024/1440px, viewport ngắn 390x420, cỡ chữ computed x2 tại 320px,
chuỗi dài synthetic, normal/reduced motion. Axe 0 chỉ có nghĩa những rule áp dụng
trong các snapshot này đạt; không chứng nhận toàn ứng dụng về accessibility.

11 nhóm hành trình: planner-off thật trả 404/MEAL_PLANNER_DISABLED; setup bốn bước
và tạo thật; meal/tabs/swap thật; clipboard/share synthetic; settings memory draft;
nhập kho selected-only thật; pending receipt synthetic; missing meal/read failure
synthetic rồi retry thật; chuỗi dài/unknown synthetic; generation failure synthetic;
responsive/short/text/motion. Lỗi mô phỏng được ghi riêng, không thành bằng chứng
server hay offline durability.

Ảnh dialog chụp viewport, trang chụp fullPage. Thanh nav cố định nằm ở tọa độ viewport
trong fullPage là đặc điểm screenshot, không phải nav được chèn vào flow. Export
text x2 có thêm ảnh sau scrollIntoView và assertion controls nằm trong viewport.
Đã xem trực tiếp ảnh typography, controls, wrap và hai contact sheets.

Preview dùng Worker thật với SQLite trong bộ nhớ và household/session synthetic.
External fetch bị chặn; browser chặn request khác origin và service worker. Không
sử dụng credential provider, tồn kho production hay remote DB.

Generation gửi budget null, ba priorities và shoppingFrequency twice; server plan
giữ target null. Quay lại giữ chọn; payload không có schedule/daySchedule. Tạo,
đọc, reload, tabs, swap và check shopping giữ toàn inventory JSON. Cooking link
vẫn `/cook/:slug`; không gọi deduction trong audit này. Tần suất được truyền/lưu
trong kế hoạch; browser không chứng minh có lịch chuyến đi chợ tự động.

Import thật chọn đúng một nguyên liệu; POST items.length=1, ingredientId đúng
snapshot. Inventory thêm đúng một row, quantity/unit bằng
recommendedPurchaseQuantity/unit; mọi field của năm row cũ giữ nguyên. Readback
sau reload nhất quán. Synthetic 500 trước đó không viết stock, giữ selection và
focus lỗi. Synthetic pending receipt chỉ kiểm store/page/copy, stock nguyên;
không mô phỏng durable queue hay replay.

Settings apply không phát Week command, current plan server JSON không đổi. SPA
quay setup giữ 500000; reload đặt lại 750000. Null trong settings được kiểm bởi
component tests. Full-page navigation trước bước settings đã reset memory; không
diễn giải thành mất một durable save. Export không lộ exception detail; Escape,
focus trap và focus return đã tương tác bằng bàn phím.

## Aliases và native keyboard

Preview riêng bật planner tại 5205/8905; `ui10-planner-alias-check.mjs` kiểm bảy
aliases thật, không có Week write hay pageerror. Generating đi `/planner`, settings
đi `/settings/planning`; các aliases có params giữ đúng params. ID không tồn tại
chỉ kiểm routing, không chứng minh đọc plan thành công. Actual App unit tests bổ
sung cả hai trạng thái flag.

T18C setup E2E chạy sáu projects PASS trong 15.1s:
360/390/430/768/1024/1440px. Space/Enter điều khiển radio/checkbox, qua bốn bước và
thấy nút tạo tường minh; chưa bấm tạo. Preview bật planner nhưng intercept frontend
feature=false để kiểm fallback setup; không gọi generation. Temporary config chỉ
định local URL, executable và artifact paths, giữ timeout/projects/rules của repo.
Config, report và 12 screenshots đã lưu. Config repo không đổi.

## Các lỗi khác và cách phục hồi

Initial typecheck bị syntax do script cắt vào effect return, đã khôi phục đầy đủ.
TS2774 navigator.share và RecipeStep.title được sửa theo type contract;
document.body append ambiguity đổi thành appendChild. Initial focused có
172 PASS / 1 FAIL vì DOMException không instanceof Error; kiểm cả DOMException.
Alias expectations sai được đối chiếu App thật; mock module path sửa đúng.

Browser initial lấy nhầm ID generating vì wait regex quá rộng; wait đã chặt hơn.
Lượt hai chờ lazy images ngoài viewport nên dừng owned process; eager loading chỉ
áp dụng ở screenshot harness. Lượt ba phát hiện p mô tả trong dl, sửa thành dd.
Lượt bốn settings fixture đòi null sau reload, sửa theo memory default; lượt năm
pending fixture toggle nhầm item đã checked, sửa chỉ toggle khi cần. Các lượt sau
58 rồi 61 screenshots đạt. Direct visual review phát hiện line-height sát,
step labels chật và heading action ép chữ; sửa line-height tương đối, auto-fit theo
em và heading wrap. 61 ảnh cuối chụp trên runtime cuối; ảnh lỗi ban đầu được giữ.

AST proof ban đầu dùng scanner không rescan template literal nên so sánh sai;
chuyển structural AST. Generation effect giống ngoài mapping budget, hai export
text generators giống; App routes/guards byte-identical. Store exact bytes ngoài
hai replacement được phép; protected-path diff rỗng.

## Review, giới hạn và evidence

Fresh Web Interface Guidelines lưu tại `evidence/web-interface-guidelines.md`;
review trong INTERFACE_REVIEW.md. Native controls, Links, focus/live error, image
dimensions/lazy, modal overscroll/safe areas, Intl/font, reduced motion và wrap được
đối chiếu source/browser. Tab, setup stage, shopping filter/mode vẫn ephemeral;
reload không khôi phục view state. Domain lịch sử còn trong export generator theo
compatibility contract. Nav mobile sáu cells với label 11px vẫn chật: UI11.

Generic UX audit chạy lại sau recovery bằng
`python3 /Users/tunbee27/.codex/skills/frontend-design/scripts/ux_audit.py .`:
151 files, 29 issues, 968 warnings, 82 passed checks, exit 1 / STATUS FAIL;
lượt trước có 970 warnings. Nhiều heuristic quét cả fixtures hoặc đòi
social proof/hero animation không liên quan. Không sửa máy móc hay gọi toàn repo
UX PASS. Dependency audit exit 1: 41 advisories (4 low, 19 moderate, 16 high,
2 critical), lockfile nguyên; cần remediation riêng.

Recipe catalog còn thiếu ảnh/placeholder. Week queueWrite durability và repeated
optimistic projection, inventory canonical fallback-any-error/queued metadata
receipts vẫn là follow-up domain riêng. Owner brand approval, thiết bị thật,
Safari/native zoom/screen reader/usability/CWV và hosted release chưa kiểm chứng.

143 source/test/script/asset/font/config hashes frozen; bốn test route sau recovery
đã cập nhật hash, không đổi runtime snapshot. Evidence giữ ảnh gốc, hai contact
sheets, reports, source/protected/lifecycle/store receipts và logs có raw/archive
SHA256 (40 log receipts). Build assets và source đã đối chiếu sau full. Manifest
sẽ giữ payload bytes/SHA256, không tự chứa hash; phải đối chiếu Git blobs với source
và payload rồi mới ghi implementation hash trong documentation checkpoint.
Local QA không phải release artifact hoặc chứng nhận production.
