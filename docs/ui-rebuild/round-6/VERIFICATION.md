# UI06 verification — local synthetic evidence

Canonical `vn-tak/Tako-san`, branch `codex/ui-rebuild-foundation`, base
`e584cf0bc8c5ab5c62b0896157c06f7bd511886b`. Packet UI06-planner-shopping.md,
ADR-049. Implementation checkpoint: `c441e194b0fe861fc1e3f81747e6346c30266f09`.
Status `UI06_LOCAL_VERIFIED_REVIEW_REQUIRED`. Final full gate exit0, sau hai lần
FAIL được ghi riêng bên dưới; local review/device/hosted/release còn mở.

## Focused checks đã thực thi

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui06-shopping.test.ts tests/unit/ui06-planner-lifecycle.test.tsx tests/unit/meal-planning-client.test.ts tests/unit/meal-shopping-dto.test.ts tests/unit/week-query-sync.test.ts tests/unit/sync.test.ts tests/integration/t20-roles-picker-shopping.test.ts tests/integration/shopping-command-race.test.ts
```

PASS 8 files / 151 tests, 7.06 s; `.artifacts/ui06/focused-final.log`.
UI06 có 9 shopping tests và 2 lifecycle tests mới: positive/fractional/blank,
không GET bổ sung che commit, dedupe stable ID, server/device/pending overlay,
check/delete không sống lại, storage rejection không giả queued, session/response
validation, badge sau replay và thứ tự thay đổi khi đã queued. Planner kiểm tra
single flight và callback cũ sau đổi pathname không nhận/navigate vào màn mới.
Các regressions client/DTO/Week/sync/role/race hiện có giữ nguyên assertions.
Typecheck/lint cuối độc lập PASS trước full gate; `.artifacts/ui06/{typecheck-final,lint-final}.log`.
Runtime chỉnh cuối sau focused là CSS đọc/phóng chữ và browser assertions.
Sau full failure chỉ sửa setup và route/footer assertions của bốn test files;
full gate cuối chạy trên source và tests đã freeze lại.

## Preview và browser commands

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5198 PREVIEW_API_PORT=8898 PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5199 PREVIEW_API_PORT=8899 PREVIEW_MEAL_COMPOSITION_V2=false node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5200 PREVIEW_API_PORT=8900 PREVIEW_MEAL_COMPOSITION_V2=true PREVIEW_MEAL_COMPOSITION_V2_SERVER=false node scripts/security-preview.mjs
```

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui06-browser-check.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH UI_REBUILD_URL=http://127.0.0.1:5199 UI06_VARIANT=v1 PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui06-browser-check.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH UI_REBUILD_URL=http://127.0.0.1:5200 UI06_VARIANT=mismatch PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node scripts/ui06-browser-check.mjs
```

| Cấu hình thực thi cuối | Axe/layout checks | Journey groups | PNG | Kết quả |
| --- | ---: | ---: | ---: | --- |
| V2 frontend/server bật | 41 | 9 | 65 | PASS |
| V1 frontend tắt | 9 | 6 | 13 | PASS |
| V2 frontend bật/server tắt | 9 | 6 | 13 | PASS, fallback giữ V1 |
| Tổng, các nhóm có lặp giữa cấu hình | 59 | 21 | 91 | 0 axe violations, overflow, broken images, page errors |

Local Chromium, vi-VN, Asia/Tokyo, service workers và external browser requests
blocked; synthetic preview Worker/in-memory SQLite. V2 đủ 320/390/768/1024/1440
cho setup/board/meal/planner shopping/saved list; hai cấu hình fallback kiểm tra
320 px và các trạng thái/dialog 390 px. V2 bổ sung 390×420, doubled computed font
320 px, normal/reduced motion, empty/read error/partial/stale/budget error và
picker filtered empty/mutation error. Đây không phải zoom browser thực hoặc QA
thiết bị. Snapshot đợi font và animation.finished, không bỏ contrast assertions.

Real Worker sinh plan 7 bữa, V2 thêm Cơm trắng, composition 2 món/revision 2 giữ
qua reload. Bỏ proposal giữ revision 2. Keyboard Tab ở modal, Escape/return focus;
403 synthetic cho add hiện alert được focus trong picker và chưa thêm món, retry
sau khi bỏ mock thành công. Stale khóa shopping, budget invalid focus, read500
vẫn là lỗi. Checkbox recommendation reset qua reload đúng tính chất tạm.
Saved add0.125kg/check/delete chạy Worker thật: dismiss không xóa, confirm xóa.
Offline125.5g có entry outbox thật và device status; khi cho GET online nhưng chặn
POST replay, server list cũ không che dòng pending. SPA late generate không kéo
người dùng khỏi shopping. JSON inventory trước/sau bằng nhau ở cả ba cấu hình.
Alias Week bật giữ decoded plan/slot IDs. Browser harness ghi observations đầy đủ.

Logs cuối `.artifacts/ui06/{browser-v2-final3,browser-v1-final2,browser-mismatch-final2}.log`.
Screenshots cuối được xem trực tiếp: board1440, setup320, saved list/shopping1440,
picker lỗi/empty390, delete dialog390, short390 và enlarged form320. Rà theo
web-design-guidelines trong scope labels, semantic controls, focus, dimensions,
error feedback, text wrap, motion và nguồn dữ liệu. Không claim toàn repo UX,
screen-reader hoặc usability PASS.

## Full repository gate

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

PASS exit0:272 files/6533 tests,0FAIL,Vitest331.63s. Typecheck/lint/migration
smoke/build PASS; migration-smoke=ok,Vite2.88s. Main458.37kB/gzip127.74kB,
PlannerPage83.28/24.10kB,ShoppingPage7.73/3.31kB. Đây là số build local,không phải
CWV hoặc chứng nhận latency. Log `.artifacts/ui06/full-check-final.log` và bản
đã lưu `evidence/logs/full-check-final.log`. Full cuối dùng command gốc sau recovery,
không thêm DNS option,đổi timeout/config hay bỏ test.

21 runtime/test/script hashes freeze trước full gate trong `evidence/frozen-source.json`.
Own preview PIDs92812/93730/93746 dừng trước gate; kiểm tra không còn LISTEN tại
5198/5199/5200 và8898/8899/8900. Không đổi preview scripts/config hoặc timeout.

## Failures, phát hiện và sửa

- Typecheck ban đầu TS2345: `document.body.append(host)` xung đột Cloudflare/DOM
  typings. Dùng appendChild; không đổi lifecycle assertions.
- Browser selector ban đầu giả định copy khác. Sửa theo copy thật: Chọn món,
  Hoàn thiện bữa này, Bỏ qua, Xoá bộ lọc. Alias normalize dấu `:` encoded/raw;
  so sánh decoded pathname, vẫn assert đúng plan/slot IDs.
- Playwright check() trên controlled checkbox trả trước round trip. Dùng click
  rồi chờ checked class lưu thực; không bỏ kiểm tra server/dismiss-delete.
- Reload khi reconnect tự flush outbox hiện có, làm kỳ vọng pending sai. Harness
  giữ POST replay blocked và mở GET để kiểm tra pending overlay đúng điều kiện.
- Unroute read-error mock dùng callback mới nên không gỡ đúng. Lưu cùng function
  reference cho route/unroute; source hành vi đọc lỗi không thay.
- Axe normal-motion snapshot bắt vào opacity giữa reveal220ms nên báo contrast.
  Đợi animation.finished rồi đo; không đổi màu hoặc bỏ contrast test.
- Xem screenshot phát hiện amount/unit quá hẹp dù document không overflow: thêm
  container một cột; delete dialog có max-height/scroll theo viewport.
- Rà picker phát hiện mutation error sau modal và tìm kiếm thất bại vẫn báo tìm.
  Đưa alert/focus vào picker, sửa trạng thái pending theo currentError; retry và
  số thành phần được browser assert.
- Sau PASS browser lần trước, xem enlarged320 phát hiện description dùng fixed
  line-height bị chồng dòng, heading link ép thành dải hẹp và button fixed height.
  Scoped CSS đổi line-height tương đối, header/action wrap, button height auto.
  Browser thêm assertions description >=1.5×font, action ở sau heading và width
  >=140px, button scrollHeight<=clientHeight. Cả ba cấu hình chạy lại PASS cuối.

Các logs các lần đầu/second/third/fourth/fifth/frozen vẫn tại `.artifacts/ui06`.
Không làm yếu assertions, nới timeout hoặc bỏ regression để qua kiểm tra.

- Full gate đầu exit1: 4 files fail/268 pass (272), 9 tests fail/6458 pass
  (6467 collected), 333.85 s; một suite planner-ui không collect vì header mới
  import auth store yêu cầu localStorage trước beforeEach. Thêm jsdom environment
  cho render suite. 8 test fail vì jsdom chưa có scrollIntoView: stub API chỉ
  trong hai test files planner-hook/t07-planner-ui, giữ production focus/scroll
  và mọi request/retry/session/revision assertions. Test UI02 còn coi /planner
  ngoài kitchen scope: chuyển vào accepted routes UI06 và thêm negative tests
  /planner-old,/shopping-old,/week. Shell render assertions đổi footer từ /week
  sang /shopping, đồng thời assert không còn href /week theo ADR-049.
- Recovery command (same Node24/NODE_OPTIONS):
  `pnpm exec vitest run tests/unit/planner-ui.test.tsx tests/unit/planner-hook.test.tsx tests/unit/t07-planner-ui.test.tsx tests/unit/ui02-presentation.test.ts tests/unit/ui06-shopping.test.ts tests/unit/ui06-planner-lifecycle.test.tsx`
  PASS 6 files/174 tests,3.03 s; `.artifacts/ui06/recovery-focused.log`.
  Không đổi runtime sau browser PASS; 17 hashes từ lần freeze đầu đối chiếu nguyên
  vẹn, freeze thêm bốn test files thành21 rồi chạy lại full gate. Log failure
  `.artifacts/ui06/full-check-first.log` giữ nguyên; không nới config/timeout.

- Full gate thứ hai exit1: 271 files PASS/1 FAIL,6532 tests PASS/1 FAIL
  (6533 collected),372.14 s. Existing staging-d1-catchup-check.test.mjs:169
  `pnpm wrangler d1 migrations list --local` vượt test timeout5000ms; không có
  UI06 test fail. Log `.artifacts/ui06/full-check-second.log`.
- Isolated lần đầu cùng môi trường cũng FAIL31PASS/1FAIL,23.23 s; chính local CLI
  test mất20799ms. Wrangler--version chạy0.637s; public npm metadata HTTP200 trong
  0.634325s. Rà package CLI: banner chờ update-check trước local migrations.
  Cache update được chính CLI ghi; không sửa cache/dependencies/config. Chưa đủ
  bằng chứng gán nguyên nhân cho IPv6, registry hoặc tải máy.
- Diagnostic isolated với NODE_OPTIONS thêm--dns-result-order=ipv4first:
  32PASS3.11s,test944ms. Chạy lại cùng môi trường ban đầu bỏ option này:
  `PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/staging-d1-catchup-check.test.mjs`
  32PASS3.26s,test945ms. Đây là bằng chứng startup dao động, không chứng minh IPv6
  là nguyên nhân. Logs wrangler-focused.log/wrangler-ipv4.log/
  wrangler-focused-final.log và wrangler-startup-observation.json. Source freeze
  nguyên vẹn; full gate thứ ba dùng đúng command ban đầu,không IPv4 option,
  không nới timeout hay bỏ test. Cả các lần full FAIL đều dừng trước migration/build.

## Evidence và giới hạn

Evidence gồm ba thư mục `v2`, `v1`, `mismatch`, observations và source freeze;
107 payload files (91PNG,3observations,1source freeze,12logs/diagnostic receipts)
plus manifest đã đối chiếu SHA256+bytes sau full gate.21source hashes giữ nguyên.
Các browser-tested runtime/script files không đổi sau browser PASS. Báo cáo này ghi kết quả
local; chưa có hosted CI, release hay nghiệm thu bộ nhận diện final.

Không Worker/schema/migration/dependency/config/production flag/payment/auth/
infrastructure/remoteDB/R2/provider/credentials/push/PR/merge/deploy. Planner
preview ép flag planner bật; chưa browser QA presentation legacy Week khi tắt.
Existing Week/unit/integration regression giữ tương thích, không chứng nhận
flag-off UX. Private form/uncertain ID và recommendation ticks chỉ memory;
beforeunload không bảo đảm mọi navigation. SourceRecipeTitle có thể là recipe ID.
Chưa device/Safari/OS keyboard/actual zoom/screen-reader/usability/CWV/hosted QA.

## Diff và checkpoint

Implementation `c441e194b0fe861fc1e3f81747e6346c30266f09` đã đối chiếu 21 source/
test/script hashes và107 evidence payloads ở cả Git objects và working tree;
manifest cũng giữ nguyên. Checkpoint theo sau chỉ sửa Markdown để ghi verified
hash và kết quả review, không thay runtime/tests/evidence. Full normalized source
diff và bốn recovery test patches đã đọc; allowlist giữ mọi protected path.

`git diff --cached --check` ở implementation báo11 whitespace warnings trong
raw captured logs (trailing spaces/new blank line at EOF); commit đã tạo trước
khi tách kiểm tra này. Giữ nguyên bytes của logs để manifest chứng minh đúng
output thực. Không claim toàn diff whitespace PASS. Command kiểm tra source/docs
với ngoại lệ duy nhất cho raw logs:
`git diff e584cf0bc8c5ab5c62b0896157c06f7bd511886b c441e194b0fe861fc1e3f81747e6346c30266f09 --check -- . ':(exclude)docs/ui-rebuild/round-6/evidence/logs'`
exit0. Syntax `node --check scripts/ui06-browser-check.mjs` PASS. Hai lần full
FAIL, isolated FAIL và full PASS vẫn có log riêng; không amend implementation.
