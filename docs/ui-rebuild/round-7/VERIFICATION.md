# UI07 — Kiểm chứng local bộ nhận diện số

Canonical `vn-tak/Tako-san`, branch `codex/ui-rebuild-foundation`, base
`3c593d941fb6ffa1fefffb7c4c5050c6be4e34b7`. Packet UI07-brand-kit, ADR-050.
Status `UI07_LOCAL_VERIFIED_REVIEW_REQUIRED`. Implementation checkpoint:
`94b9ae3f889781e58999c3fe3a21a0f265d3a5cb`;71frozenhashes và66evidencepayloads+manifest
đã đối chiếu Git objects và working tree. Documentation checkpoint theo sau.

## Focused / export / source

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui07-brand-exports.test.mjs tests/unit/ui07-brand-shell.test.tsx tests/unit/takosan-brand.test.tsx tests/unit/ui02-presentation.test.ts
```

Bản frozen PASS4files/82tests,1.18s: 18 tests UI07 mới,64 regression existing.
Log `evidence/logs/focused-frozen.log`. Bao gồm regenerate36exports từng byte,
opaque dimensions PNG/OG, optical micro, self-contained SVG, knockout one-color,
maskable foreground pixel nằm trong safe circle, metadata/precache resolve,
legacy path và shell layout-mode/accessibility contracts. SSR render tests dùng
Node, không claim screen reader/browser từ test render.

71 source/asset/test/script/preview/inventory/font+OFL hashes frozen trước full
check; `evidence/source-freeze.json`. 76 retained compatibility/font/license files
trong inventory đã đối chiếu với Git objects tại base: giữ nguyên bytes. 41 file
hướng mới gồm5masters và36export,171543bytes. Default generator chạy thành công
không external kit. Explicit-kit branch source giữ behavior cũ; chưa có original
external kit để chạy lại toàn bộ nhánh này. Không thêm package dependencies.

`node --check` cả generate-takosan-brand.mjs, generate-takosan-icons.mjs và
ui07-browser-check.mjs PASS; Python compile của outline script PASS. First system/
bundled Python thiếu fontTools; tạo venv ignored local và chạy extraction thành
công, không sửa Python hoặc pnpm lockfile. Font hashes/OFL giữ theo UI01. Python playwright_runner helper báo Playwright
chưa cài; dùng repository JavaScript Playwright runner thực tế, không suy ra PASS
từ helper unavailable.

## Browser chạy thực tế

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5201 PREVIEW_API_PORT=8901 PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui07-browser-check.mjs
```

Bản frozen PASS41axe/layout/brandchecks,45browserPNG,6journey groups,0axe violations/
horizontal overflow/brokenimages/pageerrors. `evidence/observations.json` và
`evidence/logs/browser-frozen.log`. Browser matrix:

- Brand usage sheet320/390/768/1440, full-page và viewport; light/dark/mono,
  optical16/24/32, pixelated16×8, circle/squircle/safe crop, font/license/voice.
- Home/Fridge/Recipes/Planner/Shopping/Recipe detail tại320/390/768/1024/1440,
  Be Vietnam Pro loaded; đúng1horizontal lockup visible mỗi core page.
- Persistent desktop header link display:none và không xuất hiện trong accessible
  role locator/tab; sidebar home focus2px và Enter về home. Mobile home Enter cũng
  điều hướng đúng, back/notification/account targets>=44px.
- Saved shopping doubled computed text320 và390×420; normal-motion planner390.
  Brand giữ tĩnh, reduced motion mặc định ở matrix. Không claim actual browser zoom.
- Preparation -> actual cooking steps -> actual-use review,320/1440; immersive
  không navigation, giữ1logo và đúng tỷ lệ, không gửi completion command.
- Manifest3icons/browser4iconlinks/OG assets HTTP200, MIMEPNG; head href/content
  trỏ kit mới; account desktop vẫn kit cũ. Account chỉ compatibility check, chưa
  fullUX/axe nghiệm thu. JSON inventory trước/sau bằng nhau.

Actual synthetic Worker/in-memory SQLite; browser external requests và SW bị chặn.
Không fake app state để tạo screenshot. Preview đã dừng owned PID52186 trước full
gate; ports5201/8901 đóng. Preview ép planner bật, không chứng minh flag-off Week.
Browser mask crops không phải OS install QA; chưa hosted scraper/social cache QA.

Screenshot được xem trực tiếp: brand sheet1440full, home1440, shopping320,
enlarged320, cooking320, review1440, contact montage. Review cuối tăng maskable
artwork từ scale4.5/offset112 thành scale6/offset64 để hình không quá nhỏ trong
launcher; chạy lại focused và browser trước freeze. Maskable final max foreground
radius185.3227px < safe204.8px,65371pixels,3channels/opaque. Contrast white/pine7.67,
ink/canvas13.07,muted/canvas5.13,ink/coral4.90,canvas/pine6.94; measurements lưu JSON.

## Failures và xử lý, không giấu gate

- Focused đầu81PASS/1FAIL: test compatibility đoán sai `/frigo/brand/frigo-wordmark.svg`;
  inventory thật chỉ có `wordmark.png`. Sửa test theo file thật, không tạo alias giả.
  SSR suite đầu dùng jsdom gây useLayoutEffect warnings; switched Node vì store
  đã mock, StaticRouter/renderToStaticMarkup không cần DOM. Runtime không sửa.
- Browser harness ba lần đầu treo trước snapshot vì chờ decode() của lazy OG;
  local probe xác nhận route/fonts/eager assets loaded. Scroll tới lazy image rồi
  poll complete/naturalWidth trước reset scroll; bỏ decode promise không bounded.
  Owned harness PIDs52569/52679/52766 được dừng; logs/diagnostic retained.
- Browser fourth phát hiện color-contrast label `.ink > span` trên dark preview;
  sửa `.ink .label` thành canvas, không bỏ contrast assertion.
- Fifth snapshot short viewport chạy trước lazy route mount, count0/fontNunito;
  harness chờ actual header trước snapshot. Runtime không đổi vì failure này.
- Sixth39checks/3journeys PASS; thêm review+metadata+legacyaccount, final41/6PASS;
  sau visual mask-size adjustment, frozen41/6PASS lại trên master/export mới.

Raw log files tại `.artifacts/ui07`; archive trim trailing whitespace per line và
trailing blank lines; raw NUL duy nhất trong full log được escape thành literal\u0000 để Git diff-check sạch. `evidence/log-receipts.json` giữ raw
bytes/SHA256 và archive bytes/SHA256; failures/content không bị xóa. Empty stalled
logs có receipt riêng, diagnostic giải thích. Observations/screenshots là bản
frozen cuối; không trộn screenshots giữa source khác nhau.

## UX / guideline review

Đã fetch fresh web-interface-guidelines từ vercel-labs vào local; source archived
ở evidence/logs. Scoped review KitchenHeader/AppLayout/RailSidebar brand/Cooking
logo/preview/master/metadata: named links, decorative alt, explicit dimensions,
translate=no, focus/back/actions, text wrap, no extra motion, correct assets.
Dark preview contrast finding đã sửa và browser chứng minh. Theme chrome pine là
brand chrome intentional; page nền canvas. Chưa thêm font preload cho whole app
vì remaining surfaces vẫn Nunito, không claim font-performance/CWV.

Frontend skill `ux_audit.py` chạy132files,29issues/878warnings/75passedchecks,
STATUSFAIL dù script exit0; report retained, không claim whole-repo UX PASS. Đây
là regex heuristic bao gồm test/CSS: ví dụ đo link metadata thành8navitems, test
fixture thiếu label, CSS thành form. Không dùng checklist đó để tự thêm social
proof/price anchoring/animation vào sản phẩm. Actual axe/render/static review mới
là bằng chứng scope này; generic unresolved findings cần triage theo remaining
route packet và bảo vệ payment. Không có usability/screen-reader certification.

## Full gate / diff / checkpoint

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

PASS exit0:274files/6551tests,0FAIL,Vitest334.66s; typecheck/lint/migration-smoke/
Vite build + Worker TypeScript build PASS. `evidence/logs/full-check-final.log`.
Một full run duy nhất ở UI07, không nới test timeout/config hoặc bỏ regressions.
Wrangler local CLI regression từng dao động ở UI06 cũng PASS trong run này.

Build dùng source frozen trước implementation commit; release build ID được Vite
lấy từ base HEAD khi gate chạy. Chưa rebuild/deploy từ documentation HEAD hoặc
claim đây là artifact release. `dist/client` kiểm tra đủ36export và assets bytes
khớp source; SW build-ID token đã thay và precache mới nằm trong built output.

Read toàn source/test/script diff và new masters/preview, allowlist paths giữ
protected paths. Source hashes/inventory và evidence manifest đối chiếu sau gate;
Git diff-check source/docs/evidence PASS với logs normalization được ghi rõ.
Implementation `94b9ae3f889781e58999c3fe3a21a0f265d3a5cb` đã verified; documentation
checkpoint chỉ đổi Markdown để ghi hash, không thay runtime/tests/evidence.
Không amend hoặc thay source sau full PASS.

Protected paths: không Worker/packages/schema/migrations/payment/auth protocol/
production flags/dependencies/config/infra/remoteDB/R2/provider/credentials. SW
chỉ static precache, giữ lifecycle/fetch policy; namespace/domain không đổi.
No push/PR/merge/deploy. Local PASS không phải production readiness.

## Next action

UI08 remaining account/settings/notifications/family và funnel presentation;
packet/ADR và route/asset inventory trước code. Giữ UI07 direction, compatibility
flags/domain/session/commands; payment vẫn protected. Legacy Week flag-off cần
đường preview/build thật. Device/Safari/OS launcher/keyboard/screen-reader/usability,
owner brand review và hosted/release riêng; detailed sequence ở FOUNDATION.md.
