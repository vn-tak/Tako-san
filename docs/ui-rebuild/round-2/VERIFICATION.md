# UI02 — Verification

Repository `vn-tak/Tako-san`; branch `codex/ui-rebuild-foundation`.
Base checkpoint `1533d98`; local checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.
Node24/pnpm, dependencies giữ nguyên từ frozen-lockfile UI01. Không thêm package.

## Focused checks

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec vitest run tests/unit/ui02-surfaces.test.tsx tests/unit/ui02-presentation.test.ts tests/unit/ui-rebuild-surfaces.test.tsx tests/unit/takosan-brand.test.tsx tests/unit/planner-hook.test.tsx
```

Focused before mobile filter-panel change:5 files / 122 tests PASS, 0 FAIL,
2.75s. Full repository gate sau panel change bao gồm các tests này; kết quả ở
checkpoint cuối. Log `.artifacts/ui02/focused-final.log`.
Final focused including origin return and legacy integration:6 files / 157 tests
PASS, 0 FAIL,2.57s; `.artifacts/ui02/focused-with-integration.log`.

49 tests UI02 gồm35 presentation/URL/route/Week và14 mounted query/Home/discovery.
Fixture canonical/composition được parse qua schema thật. Existing planner 48,
UI01surfaces 7, brand 19 giữ nguyên assertions trừ heading detail h2→h1.
Coverage: fixed-offset midnight, today/tomorrow/past, pending/error/missing/revision,
V2-filled unplanned, empty V2 / family V1, query-source flags,404 only fallback, disabled
composition retry, changed plan retry, same-revision recovery, deep link/pageclamp/
24 items/ingredient search beyondpage 1/reset focus/detail return/history/loading.

## Browser

Preview, chỉ local Worker + synthetic in-memory SQLite/D1:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage WRANGLER_SEND_METRICS=false PORT=5197 PREVIEW_API_PORT=8897 PREVIEW_APP_URL=http://127.0.0.1:5197 PREVIEW_T20_D1=true PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
```

Final browser command:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell UI_REBUILD_OUT=docs/ui-rebuild/round-2/evidence node scripts/ui02-browser-check.mjs
```

Exit0.21 axe/layout checks,23 screenshots: Home/catalog320/390/768/1024/1440,
no-plan, pending/500/missing/mismatch/404composition, inventory/detailheader320,
longtitle320, today320, emptycatalog320. Cả 21: 0 axe WCAG 2A/AA/2.1 AA violation,
0 horizontal overflow,0 completed broken image; tổng 0 page error. Be Vietnam Pro loaded,
reveal animations none under reduced-motion. Network external bị chặn, SW disabled.

Real local Worker tạo plan ngày mai, thêm cơm và trứng bằng revision-fenced
commands; Home và Planner cùng hiển thị các component. Plan hôm nay được tạo
riêng. Error cases dùng request interception cục bộ, bỏ interception bằng đúng
predicate trước recovery; không sửa productionflag/server. Không coi simulated
failure là bằng chứng hosted. Longtitle là DOM text fixture, không sửa recipe data.

Catalog500 recipes: 24 cards/page, next/reload restores page 2, keyboardfocusheading,
detail back link giữ page 2, search món ngoàipage 1, queryreload/resetfocus,
cuisinehistory/reload và empty/reset PASS. Home→recipe→Home giữ native back link. Native filter panel collapsed trên
320–1024px, mở sẵn 1440px; mobile panel mở/đóng trong journey. Skip link Tab/Enter PASS.
Screenshot mobile đã review và cải thiện: filter panel không còn chiếm phần lớn
màn đầu; tên gợi ý Home hỗ trợ2dòng. Đã view trực tiếp Home 320/1440, discovery
390/1440viewport và detail320. Các ảnh dài đầy đủ nằm trong evidence.

Evidence JSON: `evidence/browser-observations.json`.
Logs: `.artifacts/ui02/browser-final.log`, `.artifacts/ui02/preview.log`.
Preview đã dừng bằng SIGTERM đúng PID của đợt này trước fullcheck.

## Full repository gate

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Kết quả final được ghi trong checkpoint bên dưới sau khi command kết thúc.
Failed first full log: `.artifacts/ui02/full-check.log`.
Final full log: `.artifacts/ui02/full-check-final.log`.
Remote schema/Week checks không bật; không deploy.

## Failures and corrections

- Invocation đầu `pnpm test -- <path>` không lọc Vitest như mong đợi, bắt đầu
  full suite với concurrency mặc định. Đã dừng parent và các child PID thuộc lần đó; không dùng
  partial output để claim PASS. Chuyển focused sang `pnpm exec vitest run <paths>`.
- Focused đầu:69 PASS / 2 FAIL. Test Home chỉ chờ dòng “ngày mai”, sớm hơn composition;
  sửa wait đến món đã tải. Link React Router có pathname `/recipes?page=2`, sửa
  expectation đúng href thay vì chỉ query. Không đổi product để làm test xanh.
- Typecheck fixture thiếu `score`/`expiringIngredientsUsed`, dùng freshness enum
  không tồn tại. Bổ sung đúng interface/enum; không cast hoặc weaken schema.
- Lần đổi error heading h2→h1 bỏ sót closing tag, làm một focused suite không
  transform và preview dependency-scan báo lỗi. Sửa thẻ đóng tương ứng, chạy lại119 PASS,
  sau thêm Week regressions122 PASS và browserfinal0 page error. Giữ lỗi cũ trong log.
- Review harness phát hiện pending interception dùng predicate khác khi unroute;
  sửa cùng reference và rerun. Review ảnh thúc đẩy compact mobile filter panel;
  rerun toàn bộ21 browser checks sau thay đổi.

- Full gate đầu:264 files, 6417 PASS / 12 FAIL; 328.41s. 11 legacy static-render cases thiếu
  Router sau khi Home/Header dùng Link; thêm provider trong helper, gắn flag off rõ
  cho Week cases, cập nhật text/presentation expectations và exact Week meal href,
  vẫn giữ mọi dữ liệu thật/budget/expiry/error/security assertions. Một Home→detail
  fixture có ingredientID sai chuẩn; đổi sang canonical ID uppercase. Không đổi
  validator. Focused với integration sau sửa:6files/157PASS, 0 FAIL,2.57s.
- Review cuối phát hiện back từ recipe mở trên Home về catalog. Truyền origin Home và
  whitelist root trong detail; thêm mounted regression và browserjourney. Thay đổi
  này được gate toàn repo trên mã cuối kiểm lại. Known/estimated expiry giữ màu phân biệt theo
  data-kind; unknown vẫn trung tính. Static-markup tests có useLayoutEffect warning
  từ React Router; không suppress warning và không suy ra app có SSR.

## Limits

API còn tải toàn bộ recommendation; phân trang client 24 không phải server pagination.
Ảnh legacy hợp lệ có thể vẫn sai món/dùng chung; neutral fallback chỉ xử lý thiếu/
lỗi. Logo/assets/motion/toàn bộscreen migration chưa hoàn tất. Không đo Core Web
Vitals trên production, Safari/device thật, screen reader/usability/brand recognition.
Không thay PayOS/payment/billing/checkout/webhooks, auth, infrastructure, migrations,
dependencies hoặc flags. Không remote D1/R2 write, push/PR/merge/deploy/credentials.

Review theo Web Interface Guidelines: navigation dùng link, actions dùng button,
label/heading/focus/skip link, image dimensions, URL state, native filter disclosure,
reduced-motion và text dài được kiểm tra trên những file đã đổi. Evidence chỉ áp
dụng các màn/state đã chạy. Manifest tại `evidence/manifest.json` lưu byte/hash của
23 screenshot và JSON, khoảng18.5MB; đây là tài liệu QA, không phải asset runtime.

## Final checkpoint — 2026-10-10 JST

Full command ở trên exit0.264 test files / **6429 tests PASS**,0FAIL; Vitest
326.64s. Typecheck, ESLint, migration smoke (`migration-smoke=ok`) và build đều
PASS. Remote schema và Week parity skipped theo scope local. Build Vite2.79s,
Worker tsc PASS. Home route11.52kB/gzip4.21kB; Recipes9.28kB/gzip3.80kB;
main index448.94kB/gzip124.64kB. Đây là số đo build, không phải LCP/INP hoặc
production performance. Không tuyên bố bundle toàn app hay payload API đã tối ưu.

Final browser exit0:21selectedaxe checks,23PNG,0violation/overflow/pageerror,
3journeys ghi trongJSON (Home↔Planner, Home→recipe→Home, discoveryURL). Targeted
Prettier PASS cho18file source/test/harness; `git diff --check` PASS.
Lỗi fullgate đầu và các lần sửa vẫn được ghi ở trên; không bỏ test hoặc tăng timeout.
Implementation checkpoint hash được ghi vào CURRENT_STATE/HANDOFF sau khi commit.
