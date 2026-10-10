# UI08 - Kiểm chứng hồ sơ và luồng bắt đầu

Canonical `vn-tak/Tako-san`, branch `codex/ui-rebuild-foundation`, base
`7f82edca63353a10b4f7b2919026c12b65d44963`. Packet UI08-account-entry, ADR-051.
Status: UI08_LOCAL_VERIFIED_REVIEW_REQUIRED. Implementation checkpoint
`5ad78191295fabe4a8b2accd14e134452e203788` đã được đối chiếu Git objects và worktree.
Tài liệu này ghi hash implementation đã kiểm chứng, không ghi hash của chính nó.

## Kiểm thử tập trung

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui08-account.test.tsx tests/unit/ui08-route-scope.test.tsx tests/unit/ui08-onboarding-navigation.test.tsx tests/unit/ui07-brand-shell.test.tsx tests/unit/auth-funnel-ui.test.tsx tests/unit/onboarding-contract.test.tsx tests/unit/auth-verify-route.test.tsx tests/unit/auth-google-credential.test.tsx tests/unit/auth-guest-transfer-deferred.test.tsx tests/unit/auth-resend-turnstile.test.tsx
```

Frozen PASS10files/121tests,7.30s;37new và84existing. Preferences giữ unknown
vocabulary/size7, lock khi lưu, lỗi focus, success mất khi chỉnh, pendingSync khác
server-save, offline planning không dựng mặc định. Local notification bool/key,
storage failure; cache success/error và không xóa local pending proof. Scope
routes/protected routes, one h1, return link và fallback status. Existing auth
OTP/GSI/resend/guest-transfer/onboarding regressions giữ. App guard tests thực tế
cả3goal, rejected completion, no-goal onboardedHome và flag-offWeek destination;
mock boot verifier/destination reader, không gọi backend/providers.

## Chromium thật, dữ liệu local cô lập

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5201 PREVIEW_API_PORT=8901 PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell UI_REBUILD_OUT=.artifacts/ui08/browser-frozen node scripts/ui08-browser-check.mjs
```

PASS106checks/107PNG/13journey groups,0pageerrors. Mỗi checked snapshot: applicable
axe WCAG2A/AA/2.1AA0, overflow0, brokenassets0, Be Vietnam Pro và đúng một lockup.
Guest enlarged profile có screenshot+axe/overflow riêng trong journeys, nên106
checks/107PNG; không nhập nhầm số lượt. Matrix320/390/768/1024/1440; account8routes,
landing/login/register/verify-missing/forgot, onboarding3steps; OTP undelivered
synthetic metadata tại320/1440. Textcomputed×2 tại320 cho entry/onboarding/account/
OTP và guest profile; không phải zoom native/device. Short390×420 install dialog
nằm trọn viewport; no-preference profile và reduced matrix, input>=16px/48px,
switch>=44px và nằm trong container. FullPage chụp nav fixed ở vị trí viewport;
nav xuất hiện giữa ảnh dài là cách capture, không phải nav chèn giữa nội dung.

Hành trình: keyboard reveal/giữ auth fields; chọn household3/cuisineJapan, back giữ
draft, server-completed onboarding; keyboardprofile→food, save/reload/back; planning
save/reload không generate; switchSpace/local reload; install/logout cancelEscape,
restorefocus; inbox loading/empty/error/recovery; food/planning saveerrorfocus/retry;
completed-onboarding guard; inventoryJSON trước/sau bằng nhau; newguest từ landing,
failedcompletion giữweek goal, retry qua /week/setup→/planner/new; guest profile
320text×2 và upgrade href giữ đúng. Synthetic delivery metadata/500/empty/loading
chỉ exercise trạng thái UI; real retry đọc/ghi local Worker/in-memorySQLite.

Provider outbound và browser remote requests bị chặn, SW bị block. Preview ép
planner enabled; flag-off chỉ integrationApp test, chưa browser legacyWeek QA.
Owned preview PID6439 đã dừng trước full gate;5201/8901 không còn listener.
Không production credentials/remoteDB/R2/provider/migrations/deploy.

## Các lỗi phát hiện và cách sửa

- Focused đầu114PASS/1FAIL: test chuỗi dựa vào thứ tự attributes của Link. Đổi
  expectation về back anchor thật; giữ href/name/h1 assertion, không sửa runtime.
- Typecheck lần sau thất bại StaticRouter test thiếu location bắt buộc; thêm route
  /me/preferences. Recovery typecheck PASS, giữ typecheckconfig.
- Browser đầu contrast giữa mode fade: Motion dùng JS nên getAnimations() chưa đủ;
  poll computed opacity của auth shell trước axe, không bỏ rule contrast.
- Browser second click vào native sr-only radio bị label intercept. Keyboardfocus+
  Space đúng hành vi người dùng; checked assertion giữ.
- Browser third phát hiện onboarding goals text×2 tràn389px trên320. Phần text của
  summary/goal flex cần min-width0; sửa CSS và reverify enlarged toàn bộ.
- Fourth harness dùng tênback exact thiếu ký tự mũi tên; sửa selector theo tên thật.
- Fifth103checks/10journeys PASS. Bổ sung loading/saveerror và actualguest drill.
- Sixth106checks pass nhưng guest journey timeout: harness dự đoán sai /planner/setup;
  route thật là /planner/new. Probe riêng còn xác nhận runtime lỗi: flagtrue,
  finish→/week/setup→Home; direct alias→/planner/new. App onboarded guard thắng
  điều hướngweek. Addendumpacket+ADR trước sửa guard, sixApp tests và frozen
  browser chứng minh retry giữ đích. AuthPage/services/store/protocol không đổi.
- Guest profile enlarged cần max-width của account link layout để tên upgrade
  xuống dòng; giữ nguyên Plus link JSX/target, không sửa payment screens.

Logs failures giữ nguyên nội dung, archive bỏ ANSI/whitespace cuối dòng và escape
NUL nếu có; receipt ghi raw/archive bytes/SHA256. Không trộn ảnh cũ vào finalmatrix.
Ảnh đã xem trực tiếp: entry montage, account montage, final contact-sheet,
profile desktop/mobile, shortdialog và enlargednotification context.

## Guidelines, heuristic và dependency

Fresh vercel-labs web-interface-guidelines source lưu ở evidence. Scoped review:
link thật/named icon buttons, label/native selection, explicitdimensions/translate=no,
focus/live status, wrapping/maxheights/safearea, motionreduce, formnames và tắt
spellcheck email/OTP. Storage/save/cache feedback có căn cứ. Không claim đáp ứng
mọi rule toànrepo: existing unsaved draft navigation warning, global errors/session
loading, legacyWeek/ingredient detail và bottom-nav density cần packet tiếp.

`ux_audit.py` frozen138files:29issues,907warnings,77passedchecks,STATUSFAIL dù exit0. Regex
bao gồm test/CSS/metadata và gợi ý socialproof số liệu không có thật; không thêm
fake proof hay animation để qua nó. Frozen907warnings được giữ trong log.
`pnpm audit --audit-level high`: exit1,41vulnerabilities (4low/19moderate/16high/2critical)
trong lockfile hiện hữu. Package/lock không thay. Đây là check dependency phụ,
không được trình bày như audit security PASS; remediation packet riêng.

## Full gate, source và checkpoint

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Full đầu exit1:4filesFAIL/4testsFAIL,273filesPASS/6584testsPASS,6588collected;
395.82s. Ba expectation cũ cần cập nhật theo scope UI08 (landing kit/copy, /me
negative scope, inbox copy+bell button chuyển link); giữ brand/authority/no-fake
assertions. Wrangler local prefix test timeout5000ms (suite32.75s), như rủi ro
UI06 đã ghi. Không đổi test timeout/config. Isolated recovery130tests/4files PASS4.69s ở
môi trường gốc; Wrangler local prefix1453ms/suite3388ms. Chưa chứng minh nguyên
nhân startup32s đầu. Full thứ hai exit0:277files/6588tests PASS,0FAIL; Vitest381.00s. Typecheck,
lint, migration smoke, Vite3.40s + Worker TypeScript build PASS.
Freeze đầu92source/script/test/asset/font/contract/config hashes nguyên vẹn.
Thêm3test suites sửa stale expectations thành95hashes trước full thứ hai. Protected
path receipt xác nhận Worker/packages/migrations/services/stores/public/payment/
config/dependencies và authprotocol modules không đổi. App đúng hai replacements
cho completed-onboarding intent; Plus link JSX/target cùng bytes khi bỏ indentation.
Onboarding chỉ asset/classes đổi; logic completion vẫn server-authoritative.
Full diff gồm untracked được đọc, diff-check sạch trước full. Build trước commit
dùng base releaseID, không phải artifactrelease. Git objects tại implementation
`5ad78191295fabe4a8b2accd14e134452e203788` khớp 95 source hashes và 137 evidence payloads
cả bytes/SHA256; worktree cũng khớp. Manifest 27451 bytes có SHA256
`ed8d92de9d00fc901b76f338ab145f98365f1deed7754407344b6ad5b4b831b7`, cùng bytes trong
Git. Protected-path diff từ base tới implementation rỗng; App đúng hai replacements,
Plus link giữ JSX/target; staged diff-check PASS và tree sạch sau commit.
Dist 51 public asset/font files cùng byte với nguồn đã khóa; không
đổi export hay preload/font policy ở UI08.

Brand owner/device/Safari/OS install/real Google/OTP/zoom/screenreader/usability/CWV/
hosted/release chưa được chứng minh. Digital direction và local phạm viUI08 không
phải toàn hệ thống hoàn tất hay productionready. NextUI09: FOUNDATION.md.
