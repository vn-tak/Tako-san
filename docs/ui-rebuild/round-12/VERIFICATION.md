# UI12 - Kiểm chứng local

2026-10-11 JST. Base `f7a27c16ef460b19322d3a463dc74dc09fa48ade`.
Implementation: `03e16c78850b061784dc2e9a01323bd7e74b65f3`.
Runtime cuối và bằng chứng đã đóng băng; Git-object receipt ở
[GIT_VERIFICATION.md](GIT_VERIFICATION.md):374source/349evidence/257public records,
724unique blobs khớp bytes/SHA256;39log receipts/7rawgzip verified.

## Gate thực thi

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Exit0;286files/6702tests PASS, Vitest352.41s. Typecheck frontend/Worker, ESLint,
local migration smoke và Vite build2.92s/WorkerTS đều PASS. Remote schema và remote
Week parity skipped theo gate mặc định. Không đổi timeout để đạt kết quả.
Log đọc được ở `evidence/logs/ui12-full-check.log`; raw bytes/SHA256 có receipt.
Terminal whitespace được normalize cho Git diff-check; các raw log có thay đổi
được giữ nguyên qua gzip trong `evidence/raw-logs/`.

Focused command, cùng Node24:

```sh
pnpm exec vitest run tests/unit/ui12-recipe-media.test.tsx tests/unit/recipe-media-presentation.test.ts tests/unit/ui02-surfaces.test.tsx tests/unit/ui-rebuild-surfaces.test.tsx tests/unit/ui11-shell-measurement.test.tsx tests/unit/ui11-navigation.test.tsx tests/unit/t18c-keyboard-controls.test.tsx
```

7files/86PASS2.43s;17case mới cho load/fallback/missing/reset/late events, title,
coverage và anchor modifiers/default legacy. Initial existing4files/37PASS3.99s.
Typecheck/lint initial exit0; final frozen changed TSX/tests/scripts ESLint exit0.
Có React Router future-flag warnings từ fixture cũ; không thay auth/router flags.

## Real browser

Preview local dùng `scripts/security-preview.mjs`, Planner ON5212/8912 và
OFF5213/8913 chạy tuần tự; exact-base archive độc lập5214/8914. Dữ liệu synthetic,
local SQLite; service worker blocked và external requests aborted trong harness.
Không dùng production credential. Tái chạy bằng môi trường local tương đương:

```sh
PORT=5212 PREVIEW_API_PORT=8912 PREVIEW_MEAL_PLANNER_ENABLED=true node scripts/security-preview.mjs
UI_REBUILD_URL=http://127.0.0.1:5212 UI_REBUILD_OUT=.artifacts/ui12/browser-on node scripts/ui12-browser-check.mjs
UI_REBUILD_URL=http://127.0.0.1:5212 UI_REBUILD_OUT=.artifacts/ui12/states node scripts/ui12-state-check.mjs
# Dừng preview ON trước khi dùng preview OFF.
PORT=5213 PREVIEW_API_PORT=8913 PREVIEW_MEAL_PLANNER_ENABLED=false node scripts/security-preview.mjs
UI12_FLAG=off UI_REBUILD_URL=http://127.0.0.1:5213 UI_REBUILD_OUT=.artifacts/ui12/browser-off node scripts/ui12-browser-check.mjs
```

`PORT`, `PREVIEW_API_PORT`, `PREVIEW_MEAL_PLANNER_ENABLED` đã được đối chiếu
trong script. Helper supplemental/baseline và contact sheets được lưu cùng evidence
để trace việc chụp/đo. Local preview flags không thay đổi config production.

| Matrix được chấp nhận | Số mẫu | Journeys |
| --- | ---: | ---: |
| Planner ON, browser-on-recovered | 167 | 17 |
| Planner OFF, browser-off | 24 | 1 |
| State faults, states-first | 13 | 8 |
| Supplemental, route-audit-recovered | 14 | Không cộng vào26journeys trên |

Tổng218structured cases. Mười final visual rechecks và10valid base samples là
đối chiếu bổ sung, không cộng vào218. 47route declarations là inventory mã nguồn,
không phải47trang độc lập đã được chứng nhận. Public PNG thêm ở main matrix không
phải checked snapshot. Không chạy bộ runner E2E riêng trong UI12;19E2E UI11 là
kết quả lịch sử, không được cộng lại.

320/360/390/430/768/1024/1440px; computed font x2 tại320/768, short390x420/768x420,
combined320x420x2. Applicable axe0, overflow0, broken images0, unexpected pageerror0,
recipe clipping0 trong mẫu chấp nhận. Main/off/state chạy axe;12registered
supplemental chạy axe, public landing/login supplemental chỉ render/overflow.
Normal-motion Home và reduced-motion captures thực thi; chưa đo frame time/CWV.

Tabs arrows/Home/End, Enter card/back giữ context, pagination focus, năm roots/
Scan/dialog Escape-return, Cook immersive và controls tránh chrome được kiểm tra.
State proof: pending→500→actual Retry→success;404→catalog;search empty→reset;
tên/mô tả dài; nutrition unknown;inventory500 khóa Cook đến retry thành công;
canonical→permitted legacy→HTML missing. Synthetic fault routes không chứng nhận
server durability hoặc photo provenance.

Inventory response JSON bằng nhau trước/sau, zero domain writes trong các hành
trình read/navigation. `writes` mỗi harness có1PATCH preferences từ onboarding
fixture trước điểm đo; preview reset là endpoint thử nghiệm riêng. Không gọi toàn
bộ phiên là zero network writes. Synthetic offline banner và safe-area padding
không phải test offline outbox/thiết bị notch thật.

## Integrity và phạm vi

374source/test/script/config/public records khớp frozen SHA256 sau full;777Git
blobs của archive baseline khớp base. Ba page có96normalized executable/handler
records không đổi. Protected diff từ base rỗng, bao gồm real `wrangler.jsonc`,
`wrangler.staging.jsonc`, `.github`, Tailwind/PostCSS config và media resolver.

257public files được kiểm sau build:256byte-identical. `public/sw.js` qua transform
đã có sẵn trong Vite: `__TAKOSAN_BUILD_ID__`→`local`; output khớp chính xác với phép
thay đó, không phải byte-identical. Cả257source assets/public đều không đổi.
Assertion đầu yêu cầu mọi257build bytes khớp thất bại ởsw.js; kiểm tra Vite plugin
xác nhận đây là transform dự kiến, không sửa source/config để né assertion.

Owned previews đã dừng;5212/8912/5213/8913/5214/8914 đóng tại integrity check.
No backend/package/schema/migration/service/store/dependency/public/payment/auth
protocol/productionconfig change. No push/PR/merge/deploy/remote DB/R2/media write.

## Các lượt lỗi và phục hồi

- Baseline blank/504 Outdated Optimize Dep: media SSR audit và preview dùng cùng
  optimizer cache. Dừng/restart sau media audit phục hồi; không chỉnh app/config.
- Python edit batch dừng vì marker ingredient heading không khớp. Đọc đúng marker,
  hoàn tất bounded presentation; không đổi domain callbacks.
- Main first harness chọn cả pagination nav làm primary. Selector chính xác
  `nav[aria-label="Điều hướng chính"]` phục hồi167PASS.
- Supplemental first bắt h1 transient của session guard. Count waits cho trạng
  thái thực phục hồi14PASS; không nới assertion.
- Baseline ảnh ban đầu bị lần iterate ghi đè. Giữ log; dựng baseline đúng base qua
  Git archive. Python tarfile filter không hỗ trợ; sau đó thiếu migrations làm
  preview fail và thiếu Tailwind/PostCSS tạo unstyled captures. `base-verified/`
  và `baseline/` không phải accepted baseline. `base-configured/` mới hợp lệ,
  source777verified; isolated cacheDir chỉ phục vụ harness.
- Intermediate line-height/count clipping được lưu, sửa trước final geometry.
  Quick asset inspection lỗi None.local được sửa; không phải gate product.

Staged diff-check đầu báo trailing whitespace/blank EOF trong terminal logs;
normalize chỉ archived text, giữ exact raw gzip và cập nhật raw/archive receipts.
Source/runtime không đổi.

Những shell assertion/inspection failures không có raw log riêng được ghi rõ ở
đây; không ngụ ý mọi thao tác đều có log. 39log có raw/archive byte/SHA256 receipts, gồm35log ban đầu và4log
lifecycle/sheet/frozen-format/final-lint. Evidence chưa bị chỉnh ảnh bằng AI.

## Audit còn mở

Generic UX skill: FAIL157files/31issues/989warnings/86passedchecks. Heuristic scan
có fixture/CSS/protected payment và gợi ý social proof không thích hợp; không sửa
máy móc hoặc gọi toàn repo UX PASS. Dependency audit41advisories:4low/19moderate/
16high/2critical; lockfile giữ nguyên. License/source/subject/crop chưa duyệt,
owner approval, Safari/real device/native zoom/screen reader/virtual keyboard/
usability/CWV/hosted release còn mở. Domain Week outbox/replay và inventory
fallback/queued receipt là các packet riêng. Local green không chứng nhận release.
