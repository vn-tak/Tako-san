# UI09 - Kiểm chứng local và giới hạn

Canonical `vn-tak/Tako-san`, branch `codex/ui-rebuild-foundation`, base
`dbcabb7648e7f4ee9595f5ae430f0d7b50e80f0b`. Packet UI09-stock-detail-states,
ADR-052. Status: UI09_LOCAL_VERIFIED_REVIEW_REQUIRED. Implementation checkpoint
`251e42ad9efd5b84e87171c69f9fc1bfb3e9b463` đã đối chiếu Git objects/worktree. Tài liệu ghi hash
implementation đã kiểm chứng, không ghi hash của chính documentation checkpoint.

## Tests tập trung

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH NODE_OPTIONS=--no-experimental-webstorage pnpm exec vitest run tests/unit/ui09-stock-detail.test.tsx tests/unit/ui09-reconciliation.test.tsx tests/unit/ui09-system-states.test.tsx tests/unit/ui09-route-scope.test.tsx tests/unit/t13b-inventory-detail.test.tsx tests/unit/t13r-a-lot-draft-ownership.test.tsx tests/unit/ui02-presentation.test.ts tests/unit/ui08-route-scope.test.tsx tests/integration/frontend-ui-integration.test.tsx tests/unit/client-session.test.ts tests/integration/frontend-security-integration.test.ts
```

Frozen11files/223tests PASS3.99s:27new/196existing. New5detail tests kiểm pending
fallback, one versioned dirty save, disabled controls, cancel/return focus,
safe retained-error draft, beforeunload chỉ dirty.4reconciliation tests giữ opaque
server proposals/version, MOVE/CORRECT/DISMISS, unsupported disabled và errorfocus.
4session tests giữ private-content blocking, explicit retry và logout authority.
14route/layout cases giữ aliases và protected/legacy negatives. Existing T13
ownership/expiry/provenance và frontend/session/security suites không bị nới lỏng.
Expanded focused trước đó11files/223tests PASS5.41s. Lượt frozen đầu filter dùng
ba tên file không tồn tại, chỉ chạy8files/159tests PASS5.38s; không gọi đó là đủ
coverage. Rerun đúng danh sách11files đạt223. Không đổi test config/timeout.
Typecheck initial/expanded PASS; lint expanded/final PASS. Full gate chứa cả type
và lint sau source freeze. Scripts mới còn được `node --check` thực thi PASS.

## Browser thật: nguồn và hành trình

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5202 PREVIEW_API_PORT=8902 node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell UI_REBUILD_OUT=.artifacts/ui09/browser-frozen node scripts/ui09-browser-check.mjs
```

Frozen49snapshots/9journey groups,49originalPNG,0unexpected pageerrors.
Hai expected errors thuộc lazy-import fault `UI09_SYNTHETIC_RENDER_FAILURE`, được
lưu riêng; không che lỗi ứng dụng khác. Matrix320/390/768/1024/1440 cho canonical
detail/editor, reconciliation empty/records và session-error; legacy trước adopt,
/ingredients/:id và /inventory/:id aliases. Doubled computed text320 cho detail,
editor, reconciliation, session/render error và synthetic tên/mã/reasons rất dài.
Short390x420 editor; reduced matrix và normal-motion detail. Các snapshot có một
h1, một lockup hiển thị, Be Vietnam Pro, fields>=16px/48px, overflow ngang0,
broken images0 và applicable axe WCAG2A/AA/2.1AA0.

Axe0/overflow0 không chứng minh chữ nav không chồng nhau. Xem ảnh enlarged phát
hiện global six-item nav chật; giữ vấn đề này trong FOUNDATION/UI11. Form/record
wrap đọc được; native select có thể rút gọn selected option ở text×2. OS/native
zoom/Safari/screen-reader chưa kiểm. FullPage nav ở vị trí viewport trong ảnh dài
là cách chụp; không phải nav được chèn vào flow.

9 nhóm hành trình: canonical adopt thật bằng CLI/sessionstdin; readonly matrix
inventory JSON equality và zero browser mutations; keyboard edit/cancel,
beforeunload dismiss giữ draft, held real save khóa fields/cancel; rejected save
synthetic giữ draft rồi real retry/reload; injected readerror và real recovery;
real reconciliation apply/dismiss sau simulated rejection; loading/readerror/retry
đối chiếu; real session verification transport hold/error/retry chặn privatechild;
rejected lazy import chạy AppErrorBoundary thật rồi reload thành công.
Logout pending/error chỉ set store synthetic để kiểm presentation; không claim
đã kiểm việc thu hồi session máy chủ qua hai ảnh đó.

Metadata PATCH chỉ name/version, quantity giữ. InventoryDTO gắn household
inventoryVersion vào mọi item; vì vậy sau mutation nó đổi trên cả snapshot.
So sánh mọi field khác của các item không được sửa vẫn bằng nhau: lotVersion,
legacyversion,updatedAt,quantity,unit,name,expiry,provenance. Household revision
được kiểm riêng cùng một giá trị trên mọi dòng và tăng sau write. Không bỏ
updatedAt hoặc lotVersion để làm test đạt. Bằng chứng authority: Worker
inventoryReadItemToApi:431 và lotDetailDto:94; readInventorySummary giữ shared
version. Read-only snapshots vẫn so sánh toànJSON, không loại field.
Apply proposal thật đưa egg quantity về5; dismiss tofu giữ toàn bộ lot DTO.
Canonical adoption/metadata/reconciliation chỉ trên household preview cô lập.
Browser outbound bị chặn, SW block; Worker/in-memorySQLite không provider,
production credentials/remoteDB/R2/migration/deploy. Owned previews PID13063/13334
đã dừng trước full gate;5202/8902/5203/8903 không còn listener.

## Week flag-off audit riêng

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH PORT=5203 PREVIEW_API_PORT=8903 PREVIEW_MEAL_PLANNER_ENABLED=false node scripts/security-preview.mjs
PATH=/opt/homebrew/opt/node@24/bin:$PATH PLAYWRIGHT_EXECUTABLE_PATH=/Users/tunbee27/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell UI_REBUILD_OUT=.artifacts/ui09/week-audit-frozen node scripts/ui09-week-audit.mjs
```

16screens/2journey groups/0pageerrors; sampled axe/overflow0. Home/setup ở320/390/
768/1440, các bước budget/schedule/priorities/frequency320, generated board,
shopping/settings320 và enlargedsetup320. Font Nunito/legacykit; không UI09
certification. GET planner404/MEAL_PLANNER_DISABLED chứng minh server flagfalse,
frontend /week thực sự dùng Week. Chọn firstday eat_out, payload không có lịch
ngày, returnedFirstDayType=cooking; inventory toànJSON trước/sau generation/read
bằng nhau. Không audit xong swap/import/export hoặc mọi lỗi Week. Findings source
khác và packetUI10 ở FOUNDATION; chưa thay đổi bất kỳ Week runtime nào.

## Failure và recovery

- Initial browser: detail text×2 overflow332/320. Sửa grid intrinsic minimum,
  status-nowrap và text line-height. Lượt sau detail đạt.
- Second browser: editor text×2 overflow354/320. Fieldset dùng minmax(0,1fr),
  children min-width0, actions wrap; lượt sau editor đạt.
- Third: harness đoán fixture “Trứng gà” nhưng API là “Trứng”. Dùng actual snapshot.
  Matcher route/unroute phải cùng function identity; sửa helper, không runtime.
- Fourth: full item equality sai do shared inventoryVersion20→22. Source và diff
  chứng minh chỉ household revision thay đổi; giữ toàn bộ other-item facts checks.
- Fifth:46snapshots/9journeys PASS. Expanded frozen49 bổ sung long text/reasons/IDs
  và short viewport; timeout cụ thể cho cancelled reload để tránh chờ vô hạn.
- Week initial: harness chờ sai endpoint `/week/generate`; actual `/week/plans`.
  Audit second15screens/1journey,final và frozen16screens/2journeys hoàn tất.
- Focused expanded: một suite import lỗi localStorage trong Node. Mock auth store
  theo route suite khác;10files/209tests đạt nhưng1suiteFAIL. Corrected11/223PASS.
- Staged diff-check phát hiện dòng trống cuối9logfiles; normalize archive cuối
  file, cập nhật raw/archive receipts và manifest rồi kiểm lại.
- Evidence helper: sửa tên CSS path không tồn tại; dùng Prettier-normalized tokens
  để phân biệt formatting parentheses/trailing commas với logic. Montage đợi
  Week ảnh ghi xong trước khi tạo. Không thay gate hay runtime để che lỗi.

Failure logs và failed checkJSON/overflowPNG giữ riêng. Archive logs chỉ bỏ ANSI,
whitespace cuối dòng/dòng trống cuối file và escape NUL; receipts raw/archiveSHA256/bytes ghi rõ.
Ảnh đã xem trực tiếp: final contact sheet, detail390/1440, reconciliation390,
render-error320, Week schedule320/Week audit montage, enlarged long-content crops,
editor390 và editor text×2 fields/actions. Contact sheet có crop vùng form để không
nhầm ảnh đầu trang với evidence editor.49 originalPNG giữ trọn fullPage.

## Heuristic và dependencies

Fresh web-interface-guidelines source lưu trong logs. Review scoped: named links/
buttons, native labels/inputnames/autocomplete, explicit image dimensions/decorative
alt, heading landmarks, error/status/busy, focus return/locking, wrapping/control
sizes và reduced motion. Không claim toànrepo compliant.
Generic ux_audit.py:146files/29issues/945warnings/80passedchecks,STATUSFAIL.
Regex quét cả tests/CSS/metadata và đề nghị socialproof không có căn cứ; không thêm
số liệu/người dùng giả hoặc animation vô ích để đạt script. Global-nav/Week issues
thật được ghi riêng. `pnpm audit --audit-level high` exit1:41vulnerabilities,
4low/19moderate/16high/2critical. Package/lockfile giữ nguyên; audit này không đạt,
cần remediation riêng. Local pnpm check không bao gồm dependency audit.

## Full gate và checkpoint

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Full gate exit0:281files/6615tests PASS,0FAIL; Vitest370.01s. Typecheck,lint,
migration-smoke=ok,Vite3.27s và Worker TypeScript build PASS. Một full run; không
đổi timeout/config hoặc expectations sau sourcefreeze. Các ERR_SQLITE_ERROR và
synthetic provider/limiter warnings trong log thuộc tests lỗi mong đợi; kết quả
Vitest đầy đủ281/6615 đạt.
125 source/test/script/asset/font/config hashes frozen. Protected-path diff rỗng
cho Worker/packages/migrations/public/services/stores/payment/authmodules/
dependencies/config. App routes/guards và SessionBoundary effects token-equivalent;
queries/mutation callbacks/draftbaseline/ownership/submit và reconciliation decision
callbacks equivalent sau chuẩn hóa formatter. Chỉ imports/JSX system presentation
được đổi; preview-only plannerfalse switch giữ defaulttrue. Sourcefreeze/protected
receipt được lưu;125frozenhashes giữ nguyên sau full,51builtpublicasset/font files
byte-identical.115evidencepayloads+manifest và28raw/archive log receipts được lưu.
Git objects tại `251e42ad9efd5b84e87171c69f9fc1bfb3e9b463` khớp125sourcehashes và
115evidencepayloads cả bytes/SHA256; source-freeze và manifest cũng khớp Git/worktree.
Manifest22931bytes/SHA256 `014f5028428232f32d99eab7648813471636b71059f204131550c9daa2bca34f`. Protected-path
diff từ base đến implementation rỗng; staged diff-check PASS; tree sạch sau commit. Build trước commit dùng base
releaseID; không phải artifact release hoặc hosted verification.

Owner brand/device/Safari/OS/nativezoom/screen-reader/usability/CWV/hosted/release
chưa được chứng minh. Beforeunload không chặn SPA; inventory fallback và queued
metadata receipt chưa sửa. Toàn hệ thống/Week/navigation chưa hoàn tất. Không push,
PR, merge, remote migration/deploy. Next packet: UI10-week-compatibility.
