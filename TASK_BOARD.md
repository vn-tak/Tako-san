# UI07 — Bộ nhận diện số đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI07_LOCAL_VERIFIED_REVIEW_REQUIRED`. Packet
`docs/ai/tasks/UI07-brand-kit.md`, ADR-050. Local digital identity milestone hoàn
thành; chủ dự án review, remaining surfaces/device/hosted/release vẫn mở.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, branch `codex/ui-rebuild-foundation`,
base `3c593d941fb6ffa1fefffb7c4c5050c6be4e34b7`. Implementation checkpoint sẽ được
đối chiếu và ghi trong documentation checkpoint theo sau; Frigo cũ giữ nguyên.

**Actual changes:** Hoàn thiện kitchen direction pine/coral/ink/canvas và Be
Vietnam Pro: simple octopus/symbol, micro16/24, standard32+, outlined lowercase
wordmark, horizontal/stacked, light/reverse/one-color. 5masters+36exports=41files,
171543bytes. Regular16/24/32/48/64/128/180/192/256/512, opaque iOS/PWA/maskable512,
OG1200×630 có chữ Việt đã outline. Default pnpm brand:icons đọc repo masters;
explicit external-kit mode giữ branch cũ, chưa rerun original archive ngoài repo.
Font/OFL hiện hữu nguyên bytes; extraction tool chỉ venv ignored, không dependency.
Giữ spelling Takosan, project/repo Tako-san, technical IDs và hostname hiện hữu.

Core contract/header/rail/cooking dùng bộ mới, dimensions đúng. Persistent desktop
>=1024 chỉ sidebar horizontal lockup, header motto và hidden link không tab stop;
mobile/tablet/immersive giữ brand. Metadata/manifest/precache dùng paths mới, cache
lifecycle/fetch policy giữ. TAKOSAN_BRAND/supplied/legacy/mascot/UIicons giữ cho
remaining routes;76files đối chiếu Git base nguyên bytes. Brand usage/inventory/
voice/motion/clearspace/minsizes và UI08 plan ở round-7 FOUNDATION/preview.

**Verification:** Frozen focused4files/82tests PASS1.18s (18new/64existing).
Browser41checks/45PNG/6journey groups,0axe/overflow/brokenimages/pageerrors;320/390/
768/1024/1440,390×420,doubledcomputedtext320,normal/reduced motion;light/dark/mono,
optical sizes/crops;keyboardhome,immersive steps/review,metadata serving và legacy
account sidebar. Inventory JSON unchanged. Maskable max185.3227px<safe204.8px,
65371foregroundpixels/opaque;white/pine7.67,ink/canvas13.07,muted/canvas5.13,
ink/coral4.90.71source/asset/test/script/preview/inventory/font/OFL hashes frozen.
Full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0:274files/6551tests PASS,0FAIL,Vitest334.66s;type/lint/migration-smoke/Vite+
Worker TS build PASS. One full run; no timeout/config weakened. Export/dist bytes,
SW token/precache and full diff/protected allowlist checked; evidence hashed.
Reports `docs/ui-rebuild/round-7/{FOUNDATION,VERIFICATION}.md`.

**Failures/recovery:** Initial focused81PASS/1FAIL guessed absent legacy SVG; fix
expectation to real wordmark.png. SSR Node removes jsdom useLayoutEffect warnings.
Python system/bundled lacked fontTools; ignored venv extraction succeeds. Three
browser harness hangs waiting lazydecode; bounded complete/naturalWidth polling
fix. Dark preview label contrast fixed. Short screenshot before route mount fixed
by waiting actual header. Final visual increases maskable artwork scale4.5->6;
focused/browser rerun before freeze/full. Generic ux_audit132files/29issues/
878warnings/75checks STATUSFAIL despite exit0; regex includes tests/CSS/metadata,
no whole-repo UX PASS claimed. Python browser helper unavailable; repo JS Playwright
executed. Logs retained with normalization+raw/archive receipts, NUL escaped.

**Database/operational state:** Synthetic local Worker/in-memory SQLite only;
preview PID52186 stopped before full,ports5201/8901 closed. No Worker/schema/domain/
migrations/payment/auth protocol/production flags/dependencies/config/infra/
remoteDB/R2/provider/credentials/push/PR/merge/deploy. Build from frozen working
tree before commit uses base release-ID; no claimed release artifact. Preview
forces planner on, no flag-off Week browser QA. Final owner-approved identity,
mascot-system/adoption,device/Safari/OSlauncher/keyboard/actualzoom/screen-reader/
usability/CWV/hosted/socialscraper/release remain. Dark asset contexts not appdarkmode.

**Next action:** UI08 inventory+packet+ADR for account/settings/notifications/
family, landing/auth/onboarding/fallback and legacy Week flag-off. Transition
presentation/font/brand within existing session/preferences/domain contracts;
mascot only for useful tasks. Keep UI07 direction and payment boundary. Verify
flag-off through real preview/build path; device/owner/usability/hosted release
remain separate. Detailed execution sequence in round-7 FOUNDATION.md.

---

# UI06 — Thực đơn và danh sách mua sắm đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI06_LOCAL_VERIFIED_REVIEW_REQUIRED`. Packet
`docs/ai/tasks/UI06-planner-shopping.md`, ADR-049. Hoàn tất phạm vi local planner,
composer và shopping. Bộ nhận diện cuối và toàn hệ thống vẫn theo roadmap.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, branch `codex/ui-rebuild-foundation`,
base `e584cf0bc8c5ab5c62b0896157c06f7bd511886b`. Implementation checkpoint:
`c441e194b0fe861fc1e3f81747e6346c30266f09`. Hash đã đối chiếu với Git objects; documentation checkpoint theo sau. Checkout Frigo cũ giữ nguyên.

**Actual changes:** Planner và saved shopping dùng KitchenHeader, pine/coral,
warm canvas và Be Vietnam Pro. Board 1/2/3 cột theo container; setup có form và
ngữ cảnh, shopping tách summary/nhu cầu. Controls >=48px, fields >=16px; amount/
unit xuống một cột khi hẹp, header/action wrap, line-height và nút theo nội dung
khi phóng chữ. Day reveal hỗ trợ reduced motion; dialog xóa có confirm và scroll
limit. Picker hiện đủ tên/count/empty/reset, kết thúc pending khi search lỗi và
hiện/focus mutation error trong modal.

Planner workspace theo pathname chặn callback cũ nhận kết quả hoặc điều hướng;
server/query cache giữ plan đã lưu. Giữ V1/V2/404 fallback, revision, proposal,
hard constraints và Week contract. Saved form hỗ trợ lượng thập phân dương,
blank invalid, tám đơn vị; uncertain retry giữ ID/payload, known400 cho sửa.
Typed snapshot server/device dùng suffix riêng, giữ facade trả array. Overlay
owned outbox POST/PATCH/DELETE theo thứ tự, dedupe ID, không làm sống lại dòng xóa;
lệnh mới của cùng món đi sau lệnh queued. Kiểm tra persist trước khi báo pendingSync;
toggle/delete trả receipt, service không GET bổ sung sau commit. Planner ticks
chỉ view-local; planning/checks không sửa stock. Form/uncertain ID chỉ memory.

**Verification:** Final command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0: 272 files/6533 tests PASS,0FAIL,Vitest331.63s;typecheck/lint/migration smoke/
build PASS. Focused8files/151tests PASS7.06s; recovery6files/174tests PASS3.03s;
unchanged-environment Wrangler isolated32tests PASS3.26s (local CLI test945ms).
Browser V2:41checks/65PNG/9journeys; V1 và server-mismatch mỗi9checks/13PNG/6journeys.
Tổng59checks/91PNG/21journey groups (có lặp giữa cấu hình),0axe/overflow/brokenimages/
pageerrors. Matrix320/390/768/1024/1440,390×420,doubled text320,normal/reduced motion.
Real Worker7meals,composition2/revision2 giữ qua reload,proposal dismiss không đổi;
0.125kg saved/check/delete,outbox125.5g,SPA late result và inventory JSON unchanged.
Week aliases giữ decoded IDs.21source/test/script hashes và107evidence payloads+
manifest đối chiếu bytes/SHA256. Reports `docs/ui-rebuild/round-6/{FOUNDATION,VERIFICATION}.md`.

**Failures/recovery:** Lifecycle append TS2345 sửa appendChild. Browser giả định
copy/encodedcolon/controlled checkbox/unroute-reference/offline auto-replay được
sửa theo hành vi thật; axe đợi animation.finished thay vì opacity giữa reveal.
Visual review sửa amount hẹp,description chồng/action ép/nút fixed height khi
phóng chữ; thêm assertions geometry. Picker lỗi ẩn được đưa vào modal.
Full đầu:4filesFAIL,9testsFAIL/6458PASS/6467collected,333.85s; render suite chưa
storage,jsdom thiếu scrollIntoView và UI02 negative /planner đã lỗi thời. Sửa
setup test và route/footer expectations theo ADR, giữ authority/session/retry
assertions. Recovery174PASS;17files từ freeze đầu nguyên vẹn,freeze thêm4tests.
Full thứ hai:1FAIL/6532PASS372.14s; existing Wrangler local prefix test timeout5s.
Isolated đầu31PASS/1FAIL23.23s,test20799ms; diagnosticIPv4 32PASS3.11s, sau đó
môi trường gốc32PASS3.26s/test945ms. Chưa chứng minh nguyên nhân startup; CLI tự
viết update cache, không sửa cache/config/dependency. Full cuối dùng command gốc.
Không nới timeout, bỏ regression hoặc claim whole-repo UX/usability PASS.

**Database/operational state:** Synthetic local Worker/in-memory SQLite only.
Own previews PIDs92812/93730/93746 stopped before gate;5198–5200/8898–8900 closed.
No Worker/schema/migrations/dependencies/config/production flags/payment/auth/infra/
remoteDB/R2/provider/credentials/push/PR/merge/deploy. Preview ép planner bật;
legacy Week flag-off presentation vẫn cũ và chưa browser QA. Beforeunload có giới
hạn nền tảng; recipe source title có thể là ID. Chưa physical-device/Safari/OS
keyboard/actualzoom/screen-reader/usability/CWV/hosted QA. Finalbrand/icon/PWA/OG/
mascot chưa nghiệm thu; local PASS không phải production certification.

**Next action:** UI07 ưu tiên bộ nhận diện số: đọc asset/alias/font/manifest thật,
lập packet+ADR; vector wordmark/symbol/micro16/24/32, lockup sáng/tối/một màu,
clearspace/min-size, icon/PWA/OG và brand usage. Kiểm chứng trên shell/core screens,
xử lý wordmark lặp sidebar/header; giữ tên Tako-san và trục ăn/mua/dùng. Sau đó
remaining account/settings/notifications/onboarding/auth presentation và legacy
matrix; canonical remap/media/device/usability/hosted/release vẫn riêng. Không
đưa payment/checkout hoặc auth protocol vào scope mặc định.

---

# UI05 — Bếp nấu và lượng thực dùng đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI05_LOCAL_VERIFIED_REVIEW_REQUIRED`. Packet
`docs/ai/tasks/UI05-cooking.md`, ADR-048. Hoàn tất milestone local; brand kit cuối
và toàn hệ thống vẫn theo roadmap.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553, checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`,
base `edf2e9a7978c04fc62443e7b3e52d2ae2d895756`. Implementation checkpoint:
`cef5acb5a21964fb58d4886fb58ffd098e54fe89`. Hash implementation được đối chiếu trong checkpoint tài liệu này; Frigo cũ giữ nguyên.

**Actual changes:** Preparation UI01 giữ quantity/no-buy/shortfall; cooking/mobile-
desktop dùng pine/coral/warm canvas, Be Vietnam Pro và prototype wordmark đúng bộ.
Step/timer/manual+voice có responsive và reduced motion; shared CookingReview cho
explicit actual-use confirm. Number16px/48px, fractional/blank/zero, strict shared
stock reservation cho dòng trùng/mixed units; không đoán package mass. Container
hẹp chuyển input/unit và +/- thành hai hàng để số không bị ép khi phóng chữ.

Immutable payload/key từ confirm đầu, single flight, uncertain retry cùng yêu cầu;
known rejection chỉ mở lại sau authoritative stock read, giữ lượng thực dùng để
kiểm tra; safety rejection có explicit chọn món khác. Success/queued tách biệt,
outbox persistence kiểm chứng, projection trước attempt và same/concurrent key
không trừ local hai lần. Run/session/route/recognition fences; current-step voice,
owned feedback timeout, late results không reset run mới/điều hướng màn đã đóng.
Timer deadline/pause/resume,0runningfalse, một alert/generation, không live mỗigiây;
expired button giữ focus/aria-disabled, reset announce lại. Empty/no-draft/missing
recipe/pending prior run có recovery; mutation error focus đưa thông báo vào viewport.

**Verification:** Final full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0;270files/6514tests PASS,0FAIL,Vitest342.45s;
lint/typecheck/migration smoke/build PASS.
Focused7files/70tests PASS,6.36s. Browser32axe/layout checks tại320/390/768/1024/
1440,55PNG,12journey groups,0axe/overflow/brokenimages/pageerrors. Local Worker
125.5g against250g+0.5kg, remaining624.5g; same-key replay giữ mọi lot/version.
Mock errors/voice, clock, SPA late response/route, empty/error/short viewport/
enlarged text/motion; actual outbox queue.57evidence payloads+manifest bytes/SHA256
verified;16runtime/test/script hashes frozen and verified after gate. Logs
`.artifacts/ui05/{focused-final,browser-final,full-check-final}.log`; reports
`docs/ui-rebuild/round-5/{FOUNDATION,VERIFICATION}.md`.

**Failures/recovery:** Positive-only demand helper không nhận0: strict peek cho
zero/blank, take cho positive; typed-message/import/script argument lỗi sửa theo
contract, không đổi stock/conversion assertions. Browser selector giả định heading/
role/case sửa đúng source; HMR dev bare import sinh khác store instance: own preview
restart/frozen graph. Visual review thêm container rộng hơn cho input, rồi phát
hiện error trên viewport khi confirm dưới cùng: error focus và browser assertions.
Full đầu270files:6513PASS/1FAIL,340.29s vì existing Wrangler local list timeout5000ms;
isolated32/32PASS3.22s/test955ms. Full thứ hai ngắt có chủ đích để sửa focus; full
cuối chạy sau source/hash/browser/focused mới. Không nới timeout/config/assertion.
Supplemental UX heuristic128files/28issues/846warnings/72checks printsFAIL(exit1),
gồm legacy/test/CSS/protected surfaces; không claim whole static UX/usability pass.

**Database/operational state:** Synthetic local Worker/SQLite only. Own previews
PID44846/45917/40036 stopped before final gate. No migrations/schema/dependencies/
config/production flags/Worker/payment/auth/infrastructure/remoteDB/R2/provider/
credentials/push/PR/merge/deploy. In-memory draft/ambiguous key mất khi reload;
beforeunload tùy browser. Numeric inputs giữ exact stock decimal tail thay vì tự
làm tròn tăng. Chưa physical device/Safari/OS keyboard/actual zoom/screen-reader/
usability/CWV/real speech/background alarm QA. Brand/media chưa final; local gates
không chứng nhận production hoặc toàn bộ rebuild.

**Next action:** UI06: đọc planner/composer/shopping/remaining route source, lập
packet+ADR theo flags và Week contract; rebuild planning→shopping vertical slice,
error/empty/partial states, responsive/browser/full gates. Canonical remap editor,
brand final/PWA/OG/icon/mascot,media variants/content,device/usability/hosted review
và release vẫn cần đợt riêng; operator chưa cho phép publish/deploy.

---

# UI04 — Luồng quét và review đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI04_LOCAL_VERIFIED_REVIEW_REQUIRED`. Tiếp tục rebuild Tako-san
trong phạm vi packet `docs/ai/tasks/UI04-scan-review.md`, ADR-047. Milestone local
hoàn tất; toàn bộ hệ thống và bộ nhận diện cuối vẫn còn các hạng mục trong roadmap.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553, base
`cf607e4f402aecd0964b2f730bb2c9e1c6b17b0d`; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Implementation đã kiểm chứng và commit `85b86442257ae9573701c2df6107cd5e509cdade`.
Documentation checkpoint theo sau; checkout Frigo cũ giữ nguyên.

**Actual changes:** Scan → review → sửa → explicit confirm → inventory dùng cùng
ReviewHeading/Summary, ReviewFields, source preview gắn đúng scan ID và responsive
kitchen-scan CSS. Pine/coral/warm canvas và Be Vietnam Pro giữ identity prototype;
camera workspace riêng, review có navigation. Desktop hai cột, mobile một cột,
input16px/48px, 8 đơn vị, short viewport dùng action trong document flow. Camera
fallback thư viện, tips details và chọn ảnh khác sau lỗi. Không còn timer giả
queue/AI/validation; upload đang gửi, pending/processing theo DTO. Reduced motion
và status announcement không đọc elapsed mỗi giây.

Accepted fields kiểm tra tên/lượng hữu hạn >0≤10000/ngày trước programmatic submit;
blank không thành0/1. Dòng photo rejected disabled và gửi ID+rejected để server giữ
evidence gốc. Offline synthetic import bỏ rejected, validate toàn bộ accepted
quantity trước mutation, import0 không báo pendingSync, giữ expiryEstimated và
UNKNOWN/KNOWN/ESTIMATED projection.
Photo pendingSync có feedback, khóa sửa/confirm; rời review xóa queued ready draft
trong đúng session/scan, quay lại hydrate trạng thái máy chủ. Camera effect dừng
đúng stream và late response; đổi mode/new image hủy image read, reset input cho
chọn lại cùng file. Source ảnh chỉ memory và bind đúng ID từ upload response;
không tự nhận ảnh cũ khi hydrate. Receipt ingredient lookup đúng rawName/canonical.
Raw AI/OCR, confidence0/unknown, giá/ngày mua, quota/retry, ownership/session,
conflict/refetch, inventory revisions/idempotency và Week shortcut giữ contract.

**Verification:** Final full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0; 268files/6490tests PASS,0FAIL,Vitest 324.11s;
lint/typecheck/migration smoke/build PASS. Focused13files/188tests PASS,3.48s.
Final Chromium local29axe/layout checks tại320/390/768/1024/1440,51PNG,8journey
groups;0axe/overflow/brokenimages/pageerrors. Worker local confirm/reopen kiểm tra
fractional edit, rejection, expiry, OCR evidence; mocked pending/failed/mismatch/
empty/lost response và SPA return tải server. Source images synthetic64px, gallery
same-file reselection, sheet Escape/focus, reduced motion,390×420 và320px text
phóng đôi.52evidence payloads/manifest SHA256+bytes verified;19runtime/test/script
hashes unchanged after final full gate. Logs `.artifacts/ui04/focused-final.log`,
`browser-final.log`, `full-check-final.log`; report
`docs/ui-rebuild/round-4/VERIFICATION.md` và `FOUNDATION.md`.

**Failures/recovery:** ReviewValues blank type/confirmed heading/empty-ready state
và select accessible names sửa đúng UI contract; scripted JSX typo sửa. Synthetic
200% inherited text test nhân font nhiều lần, đổi sang gấp đôi từng computed size;
layout wrapping/height sửa và browser PASS. Native0validation dùng Number.MIN_VALUE.
Full đầu TS18047 test nullable union sửa assertion; sau full6489PASS phát hiện
mode image-read race và thêm regression, full6490PASS. Reread tiếp queued draft
còn editable khi rời review, thêm session-fenced cleanup. SPA browser failure do
quay lại sau URL change trước khi lazy inventory screen commit; harness chờ heading
thực rồi vẫn assert fresh server read/read-only. Bỏ duplicate receipt error alert;
import0 không có lệnh nhưng vẫn báo pendingSync sửa đúng false, bổ sung assertion
ở regression all-rejected. Focused/browser/full cuối chạy sau tất cả source changes.
Static UX skill audit
126files/28issues/834warnings/68checks printsFAIL dù exit0; heuristic/legacy/tests
và protected scope, không claim UX/usability pass. Không bỏ test, nới assertion,
config hoặc timeout để qua gate; chi tiết failures trong VERIFICATION.

**Database/operational state:** Chỉ synthetic local Worker/SQLite, confirm/inventory
commands và migration replay local. Không schema/migrations/dependencies/config/
production flags/Worker/payment/unrelated auth/infrastructure/remote D1/R2/provider/
credential changes. Remote gates skipped; không push/PR/merge/deploy. Own preview
PID92179 đã dừng trước full gate cuối; không còn preview do milestone này giữ.
Canonical remap picker chưa xây: normalizer có thể giữ mapping scan cũ nếu tên mới
không khớp, giới hạn này ghi rõ; source image chưa persist. Chưa physical camera,
Safari/OS keyboard/actual zoom/screen-reader/usability/CWV/provider accuracy QA.
Brand kit và media content chưa final; local gates không chứng nhận production.

**Next action:** UI05: đọc cooking/preparation/complete source, lập packet+ADR và
rebuild chuẩn bị → từng bước/timer → sửa lượng thực dùng → explicit complete →
inventory. Giữ multi-compatible-lot allocation, revision/idempotency/session/offline
và quantity arithmetic UI01, browser/contract/full gates trước checkpoint. Sau đó
planner/composer/shopping/remaining routes, canonical remap editor, brand final/
PWA/OG/icon/mascot, media variants/content và device/usability/release review.

---

# UI03 — Discovery API và media đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI03_LOCAL_VERIFIED_REVIEW_REQUIRED`. Người dùng yêu cầu tiếp tục
một đợt rebuild Tako-san. UI03 hoàn tất phạm vi local; toàn hệ thống và brand final
còn theo roadmap. Packet `docs/ai/tasks/UI03-discovery-api-media.md`, ADR-046.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553; UI02 base
`87cfbdf1b2e1164f3cb9a122d8613ed52d140c3b`, canonical base
`27d47b056455a57df811199cd7e9c32a84cbffe5`. Checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Implementation đã kiểm chứng và commit `dbba0535f66b585ff3bdedb27894ee72b57872d1`.
Documentation checkpoint theo sau; checkout Frigo cũ giữ nguyên. Không push/PR/merge/deploy.

**Actual changes:** Additive authenticated `/recipe-discovery`: strict household
stock, một routed recipe authority, shared Zod card/page contract, search có/không
dấu + ingredient/tag/description, hard cuisine/category/region/time/no-buy trước
ranking/page. Stable ID tie-break;24catalog/3Home summaries, detail tải riêng.
Cursor ràng page/filter/pageSize/user/household/catalog source+fingerprint/stock;
changed409 có explicit restart giữ filter, invalid400 có recovery, unfenced URL
clamp dữ liệu hiện tại. Scoped invalidation/session fence, labelled device/static71
offline và source witness; HTTP503/contract failure không fallback. URL/history/
detail-return/pager/resetfocus; pending/refetch không lộ rows cũ; debounce250ms.
T14D static-reader audit bổ sung đúng offline client dưới ADR-046; guard unknown0
và Worker authority constraints giữ nguyên. Architecture/domain docs đã cập nhật.

Media presentation quarantine429generic “Delicious!”,59unreviewed Unsplash,
6wrong-dish/missing paths;6matching local global mappings giữ compatibility.
Rawcatalog/migrations/release fingerprints giữ nguyên, ready canonical hero ưu tiên,
failure không trở về ảnh đã quarantine. Placeholder grid80px sau visual review,
alt trung thực. Report500D1/71static/46URL/21reusegroups;8mapped local hashes/bytes/
dimensions,13physical files contact-sheet review,500fresh hero rows pending. Không
claim photo provenance/license hoặc production R2 coverage.3/6allowed files vượt
60KiB và436px masters chưa cóvariants/DPR2quality; còn content media workstream.

**Verification:** Final full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0;266files/6468tests PASS,0FAIL,321.24s; lint/typecheck/migration-smoke/build PASS.
Focused7files/163tests PASS; authority+client2files/20tests PASS. Final browser15axe/
layout checks ở320/390/768/1024/1440,17PNG,0violations/overflow/brokenimages/pageerrors;
12journeys, full21page/500unique cover. Evidence20files manifest hashes verified.
Runtime/test/script23file SHA256 unchanged after final gate. Build main454.93kB/
gzip126.63; Home11.74/4.28; Recipes9.72/3.84; không claim JS bundle reduction.
Local same fixture legacy500full1.081.667bytes→24summary14.194bytes (-98,69%raw),
gzip tính local130.990→3.010 (-97,70%); không phải latency/CWV/production transfer.
Logs `.artifacts/ui03/full-check-first.log`, `full-check-final.log`, `focused-final.log`,
`authority-focused.log`, `browser-final.log`; report `docs/ui-rebuild/round-3/VERIFICATION.md`.
Preview ownPID34259 đã dừng trước full gate; không còn preview do task này giữ.

**Failures/recovery:** Full đầu6467PASS/1FAIL do offline client mới chưa khai báo
trong static-reader allowlist; thêm đúng reader + audit addendum, giữ unknown0
assertion. Focused ban đầu25FAIL/25PASS do fixture secret ngắn22APIcases và3schema
cases có no-buy/missing mâu thuẫn; sửa đúng fixture. Tiếp2FAIL vì test dùng sai bảng
category và route mount; tiếp1FAIL vì nhầm coverage100% với đủ lượng (2of4eggs).
Sửa expectation đúng contract, vẫn no-buyfalse/missing1 và quantity regressions.
Typecheck nutrition legacy và fixture KV type sửa; browser selector Home gồm nav
và PATCH version field sửa đúng existing contract. Không bỏ test/giảm assertion,
nới timeout/config hoặc suppression để đạt gate. Chi tiết trong VERIFICATION.

**Database/operational state:** Chỉ synthetic local Worker/SQLite, local inventory
PATCH và fresh migration replay. Không schema/dependencies/payment/unrelated auth/
infrastructure/production flags/remote D1/R2/credentials changes. Remote schema/Week
gates skipped; UI03 không thay thế T20 certification/deployment status bên dưới.
Server còn hydrate/evaluate fullcatalog; cursor không lưu historical snapshot;
canonical media/catalog TTL giữ behavior hiện hành. Chưa hosted CI/device/Safari/
screen-reader/usability QA; nhận diện hiện tại vẫn là prototype.

**Next action:** Review verified branch/source và hosted CI theo quy trình repo.
UI04: packet+ADR cho scan/review/editor vertical slice: upload→draft→sửa canonical
mapping/quantity/unit/expiry/source→explicit confirm→inventory, giữ session/offline/
revision/idempotency và dữ liệu uncertainty. Adopt shared controls/state/header/
brand prototype; browser/test matrix trước completion. Sau đó cooking/planner/
shopping/remaining routes, brand final/PWA/OG/avatar/icons/motion. Media batch ưu
tiên30–50 món cần source/license/subject QA, thumbnails/hero variants và canonical
promotion; không dùng illustration để giả photo coverage. Roadmap cụ thể tại
`docs/ui-rebuild/round-3/FOUNDATION.md`. Không deploy trong continuation UI này.

---

# UI02 — Đợt Home và discovery hoàn tất local — 2026-10-10 JST

**Task/status:** `UI02_LOCAL_VERIFIED_REVIEW_REQUIRED`; tiếp tục một milestone theo
chỉ thị người dùng. Canonical `vn-tak/Tako-san`; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Base UI01 `1533d98`; implementation verified
`11080d8a7a05614b37e85cf12f6f888addd15df0`. Không push/deploy.

| Hạng mục | Trạng thái / bằng chứng |
| --- | --- |
| Home canonical/Week authority theo flag | Local PASS; household keys, future/current/past/error/no-plan |
| T20 titles/revision/family/unplanned | Local PASS; pending/500/missing/mismatch không dùng V1,404/UI-off compatibility |
| Shared scoped shell/header/heading | Local PASS; Home/tủ/catalog/detail, nav/Scan/default routes giữ contract |
| URL filters + client24paging | Local PASS; whole-result accent search, reload/back/reset/page/detail-return focus |
| Mobile filter disclosure + desktop layout | Local PASS;21axe/layout checks320–1440,23screens,0violation/overflow/pageerror |
| Repository gates |264files/6429tests PASS; lint/typecheck/migrations/build PASS |
| Lightweight API + server pagination | NEXT:UI03; API hiện vẫn tải full recommendation |
| Photo mapping/provenance + finalbrand/motion/remaining screens | TODO; ảnh legacy dùng chung, prototype chưa phủ PWA/OG/email/etc. |
| Independent review/hosted CI/device/usability/release | Chưa thực hiện; local verification không chứng nhận release |

**Checks/failures:** Focused6files/157tests PASS; final bounded2worker `pnpm check`
exit0,326.64s. Full đầu12FAIL do Router/test fixture, đã sửa setup/expectations
đúng giao diện, giữ actual-data/security assertions. Không tăng timeout/giảm test.
Commands/evidence/failures: `docs/ui-rebuild/round-2/VERIFICATION.md`;
implementation/next slice: `docs/ui-rebuild/round-2/FOUNDATION.md`.

**Boundary/next:** Không đổi schema/dependencies/payment/auth/infrastructure/remote
state. Local preview đã dừng. UI03 cần packet/ADR cho list DTO/cursor, tiếp đó audit
và thay ảnh lệch món. T20 rollout/certification và các checkpoint phía sau giữ
trạng thái riêng; full UI rebuild chưa hoàn thành.

---

# UI01 — Đợt đầu rebuild Tako-san đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI01_LOCAL_VERIFIED_REVIEW_REQUIRED`. Người dùng đã yêu cầu bắt
đầu rebuild ngày2026-10-09. Full rebuild còn trong roadmap; không claim hoàn tất.

**Repository/source:** Canonical `vn-tak/Tako-san@27d47b056455a57df811199cd7e9c32a84cbffe5`.
Nhánh `codex/ui-rebuild-foundation`, checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.
Implementation `716fa9aabfca9bb2bce77963b57ed80fef07153f`; documentation checkpoint theo sau.

| Hạng mục | Trạng thái / bằng chứng |
| --- | --- |
| Quantity/no-buy/shortfall dùng T02; draft/offline nhiều lot | Local PASS; cần4/có2 mua2, contextual unresolved, không double-spend |
| Inventory no-results/reset/focus | Local PASS; phân biệt với tủ thật sự trống |
| Recipe detail responsive + neutral image fallback | Local PASS;320–1440px, keyboard/reduced-motion |
| Palette/font/logo prototype scoped | Local PASS;9WOFF2/OFL/Vietnamese glyphs, board trong `docs/ui-rebuild` |
| Repository gates |262files/6380tests PASS; lint/typecheck/migrations/build PASS |
| Actual browser |12 axe checks:0violation/overflow/pageerror; local shopping201 |
| Home canonical planner + shared shell/header | NEXT: UI02, giữ flag/Week compatibility |
| URL filters + summary DTO/pagination24 | TODO: ADR/task riêng, regression toàn catalog |
| Brand final/motion kit/toàn bộ màn/device/usability | TODO theo `docs/ui-rebuild/REBUILD_PLAN.md` |
| Independent review/hosted CI/release | Chưa thực hiện; không push/deploy |

**Executed checks/failures:** Exact final `pnpm check` với Node24, telemetryoff,
Vitest tối đa2worker và TMPDIR=/private/tmp; exit0. Ban đầu5FAIL gồm contextual
fixture, historical Git objects thiếu và Wrangler timeout; lượt sau1timeout.
Đã phục hồi object đúng hash, cập nhật assertion đúng contract, giảm concurrency
qua env; không đổi timeout/config/historical tests. Commands/logs:
`docs/ui-rebuild/VERIFICATION.md`, `.artifacts/ui-rebuild/full-check-bounded.log`.

**Boundary:** Chỉ local synthetic preview/migration smoke; preview đã dừng. Không
schema/dependencies/payment/auth/infrastructure/remote data/flag mutation.
Trạng thái T20 phía sau vẫn giữ nguyên, không được UI01 chứng nhận thêm.
Packet `docs/ai/tasks/UI01-ui-rebuild-foundation.md`, ADR-044, handoff đã cập nhật.

---

# T20 implementation hoàn tất local; chờ review và chứng nhận staging — 2026-10-09 JST

**Task/status:** `T20_CODE_COMPLETE_REVIEW_REQUIRED` / `T20_TEST_VERIFIED` (local).
`T20_STAGING_CERTIFICATION_REQUIRED` / `T20_PRODUCTION_READINESS_BLOCKED`.
Checkpoint này thay thế current-state/next-action cũ; các mục phía sau giữ lịch sử.

**Repository/source:** Repo API xác nhận `vn-tak/Tako-san`, ID `1385308553`,
main/base `6f6eaaab518cf2430de225d0be73d695b40706e4`, protected/strict validate.
Nhánh riêng `codex/t20-production-completion`; implementation
`12fe6fc44370188d02812f449cee4052dbb57364`. Documentation checkpoint theo sau;
reviewer phải kiểm tra final PR head và hosted CI chính head đó. Push/PR dùng
canonical repo rõ ràng, không dùng tên owner cũ trong origin làm authority.
PR20/29 overlap historical docs; không sửa nhánh của họ.

**Actual production baseline:** Rollout D1 trước takeover đã SUCCESS qua
[Deploy37789673028](https://github.com/vn-tak/Tako-san/actions/runs/37789673028),
source6f6eaaab, Worker `f92df570-6cb0-43de-bfa6-a4c7bd7f07d8`, D1/500/schema39,
release `rel-bd00a4f53fcaeee4`, no fallback, T20 server/UI=false. Staging baseline
source cùng6f6eaaab/D1/500/schema39/T20true theo Deploy37782346206. Public read-only
proof xác nhận source/catalog/database/config; production readiness degraded chỉ
bởi intentional `CONFIG_RECIPE_CATALOG_D1_AUTHORITY` warning. Các status shadow,
provider/canary pending trong lịch sử không còn là next-action hiện tại. Receipt
baseline không phải chứng nhận T20 head mới. Không replay recovery/0039/AI scan.

**PR:** [#60](https://github.com/vn-tak/Tako-san/pull/60), chờ independent review.

**Actual changes:** P1 composition pending/500/offline/missing không hiển thị
anchor V1 stale; loading/error/retry rõ, giữ404 server-off/familyV1, unknown-slot
unavailable. Parent chia sẻ canonical query với composer. P1 release draft thêm
production planner UI/Worker prerequisite derive từ normalized T20 decision,
guard cả staging/production; không đổi runtime flags/config. Assisted có action
regenerate_unlocked preview/apply qua API hiện có; typed errors vi/en, untracked
shopping/week explicit, touch controls≥44px. Domain/scoring/authority/service/DB,
schema/migrations/dependencies, physical inventory, auth và PayOS không đổi.
ADR-043 ghi quyết định, compatibility và rollback.

**Verification:** Node24.16.0/pnpm10.33.2. Final
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp pnpm check`
exit0:258/258files,6338/6338tests,143.70s, no reported skip/failure;
lint/typecheck/migration-smoke/build PASS. Remote schema/Week parity skipped
có chủ đích. Baseline6315PASS/1Wrangler timeout, isolated32PASS; không sửa timeout.
Browser sequential T20on42/off3/UI-on-server-off3 PASS tại390/768/1280, retries0;
Manual4/save/reload, Assisted2, Auto3, shopping100g/single subtraction,
restrictions10/20/forbidden/dietary/nutrition, D1-only detail/cooking,200/409,
UI canonical reload/500retry/cache404 rollback, untracked, keyboard/focus/axe0/targets≥44px.
Production true/true và false/false local builds + actual build-record CLI guards
PASS; local flag manifest fixtures không phải approved release manifest.
Hosted CI full final head và PR URL/result được ghi trong PR release evidence;
checkpoint này chưa giả một run chưa chạy. Sau merge vẫn cần exact-main CI riêng.

**Performance/security:** Composer byte-identical base;200 samples71/320/500,
median0.452/0.428/0.490ms,124expansions/scores,3options;320pool cap giữ nguyên.
Worker20 samples:picker46.30ms median/48.79p95,14–15SQL;Auto191.44/225.95ms,29SQL;
local wall time, không hosted CPU/SLA/cost. Tenancy/CSRF/revision/locks/hard
restrictions full suite PASS. Prod dependency audit0high/critical,2moderate; full
audit tooling dev2critical/16high hiện hữu, cần maintenance review riêng,
không claim repo-wide security PASS. Private ignored evidence giữ ở
`.wrangler/t20-completion/20261008/`, không publish raw sessions/credentials.

**Deferred:** Whole-week V2 Auto OPTIONAL_EXTENSION; tuần7 ngày hiện dùng V1
anchors + V2 per-slot đã verified. Leftovers/per-component servings/role-curation/
drag-and-drop/real prices theo rationale trong audit, không mở rộng schema/engine.
No known unresolved P0/P1 implementation sau own-review; independent review chưa có.

**Readiness/next action:** Ma trận28 capability và defects/evidence:
`docs/ai/T20_TAKEOVER_AUDIT.md`; release/rollback packet:
`docs/ai/T20_RELEASE_READINESS.md`; task:`docs/ai/tasks/T20-production-completion.md`.
Reviewer kiểm tra final PR head/hosted validate. Operator merge qua protection,
pin exact-main CI, review staging deploy plan và normal-session A–I certification.
Chỉ khi staging source mới certified mới xin production enablement approval riêng.
CODE_COMPLETE/TEST_VERIFIED local không là STAGING_CERTIFIED/PRODUCTION_READY;
PRODUCTION_ENABLED vẫn false. Không tự merge/approve/dispatch/deploy/migrate,
đổi protected flags/secrets/data hoặc xoá composition records để rollback.

---

# Production scan telemetry recovered; bounded validation repair candidate - 2026-10-08 JST

**Task/status:** Production rollout remains INCOMPLETE. Frozen deployed source/main
is `0c77720334d7154b25e81d6e6823ab804619adce`; shadow Worker
`f9c44422-4667-41bf-835e-51d5ce12787b` remains shadow/0%/cutover false,
global static, T20 false. Migration 37689543237 APPLIED only0039 and certification
37693128721 PASS. No canary dispatched; never replay0039 or recovery37536969564.
Operator excludes user-data retention certification because no real users exist.

**Confirmed telemetry:** The operator completed separately scoped Cloudflare API
MCP OAuth, including telemetry-query permission. Bounded `dry=true` queries retrieved
four scan events and seven events from the same invocation, verified against account
hash, Worker version, service, 50-second window, support hash `b6db841cbed9`, request
and trace IDs. OCR attempts1/2 on qwen-vl-ocr each returned SCHEMA_VALIDATION,
611 output tokens; escalation attempt3 on qwen3.8-flash returned INVALID_RESPONSE,
2 output tokens. This supersedes the previous log-access blocker. Schema fields and
escalation parsing branch were not logged; equal token counts do not prove equal
content. The original scan/fixture bytes remain missing and the scan was not replayed.

**Candidate changes:** On `codex/ai-scan-validation-diagnostics`, propagate only
fixed schema field paths and Zod codes (deduplicated, maximum8) into existing bounded
scan repair feedback and `ai_usage`; emit fixed invalid-envelope/empty-content/
unparseable-content/empty-items stages. Revalidate the diagnostic allowlist at Worker
logging. Unknown field names, item indexes, Zod messages/received values and raw
provider content are excluded. Public error codes, validation/quality gates, provider
models, token/call limits, queue fencing, payments and auth are unchanged. This fixes
lost actionable schema feedback and missing diagnostic precision, not a proved live
receipt-schema root cause. No live provider success is claimed.

**Checks:** Initial regression import failed before module creation; with a no-op
module, all6 regression assertions failed as expected. Initial focused6files/87tests
PASS. Final focused9files/109tests PASS4.75s, including adversarial log redaction,
bounded/deduplicated paths, repair prompts, provider stages and queue retry/fencing.
Final `pnpm typecheck`, `pnpm lint`, migration smoke and build PASS. Full suite
with Node24/TMPDIR=/private/tmp/CI=true/maxWorkers2:255files PASS/1failed,
6315tests PASS/1failed348.06s; the unchanged local Wrangler staging-startup test
exceeded its5s timeout. Isolated unchanged rerun32/32PASS3.31s, actual Wrangler
case1099ms. No full local PASS is claimed. Source/release self-review found no
remaining concrete issue; it is not independent review. Public provider success
still requires new-release validation. Implementation checkpoint `648dbd32010363712f219d25ca0b5109db37c3d3`.
No production write, Worker change or new scan occurred in this diagnostic continuation.

**Checkpoint/source:** Detailed evidence and continuation:
[Production shadow diagnostic](docs/ai/scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).
The former documentation checkpoint is `a29af19`; credentials/raw telemetry remain
ignored under `.wrangler/production-evidence/20261008`. Do not publish raw logs,
account IDs, receipt data or OAuth tokens. R2 bytes and email delivery remain unverified.

**Next action:** Finish checks and source review, normal PR/exact-head CI/merge and
exact-main CI, then revalidate the frozen new source through protected deployment
and a distinct non-PII provider validation. Original failed scan must not be replayed.
If validation still fails, use the new correlated diagnostics to isolate a smallest
justified fix. Only a passing provider gate permits production1/5/25/D1, each with
normal independent Environment approval. No review bypass or migration replay.

All preceding checkpoints below are historical.

---

# Production shadow verified; AI diagnosis blocked on historical logs - 2026-10-08 JST

**Task/status:** Production rollout INCOMPLETE. Frozen release/main is
`0c77720334d7154b25e81d6e6823ab804619adce`, exact-main CI `37686743768`
SUCCESS. Migration `37689543237` APPLIED only 0039; read-only certification
`37693128721` PASS; production shadow `37763248411` SUCCESS. Each received
normal independent Environment approval by `vn-taphoanhatung`. No canary run
has been dispatched. T20 server/UI remain false; user-data retention certification
is excluded by the operator's instruction.

**Actual production:** Worker `f9c44422-4667-41bf-835e-51d5ce12787b`, deployment
`7f2f522f-c9cf-4762-9022-3435ae7e6e38`, shadow/0%/cutover false/global static.
Schema 39, 500 hydrated recipes, zero hydration failures, 500 valid ready media;
FK clean and quick_check ok. Three new public readiness/service-worker pairs
PASS through `2026-10-08T11:48:52.379Z`: exact source/assets, healthy DB/queue,
config OK, no fallback. Shadow's hosted gates passed 255 files / 6309 tests
(438.75s). Email delivery and current R2 object bytes remain unverified.

**AI blocker:** One synthetic scan on this shadow release was accepted 202 and
ended FAILED / INVALID_RESPONSE / queue attempt 1 / max 3 / items 0, support hash
`b6db841cbed9`, at 10:41:55-10:42:33 UTC (19:41:55-19:42:33 JST). Logout was 200.
Its original fixture/receipt bytes disappeared during session interruption.
Recovered conversation history is explicitly labelled and cannot certify original
receipt bytes or accuracy. Do not resubmit this scan. No confirmed live root cause
or new AI behavior change: malformed envelope, empty content, unparseable content
and empty items can share this code; queue attempt 1 can include multiple provider
calls. Historical `ai_usage` and `scan_terminal` are needed before selecting a fix.

**Recovery/checks:** Re-downloaded all six GitHub candidate/receipt ZIPs; verified
API digests, archive provenance, exact extracted JSON bytes, run/attempt/SHA/CI,
normal approvals, and cross-receipt catalog/media/ledger/Worker invariants.
Account identity matched the certified hash after successful restricted CLI login.
One bounded historical log query (frigo only, 50 seconds, dry=true) was rejected
HTTP 403 / API 10000. Official endpoint requires Workers Observability Write;
OAuth has only account:read/workers_tail:read/offline_access. No scope expansion,
new provider submission, database write, Worker change or Environment bypass.
Original operator wrappers/control receipts and staging private packet are missing;
previous observations remain historical, not newly reverified executable evidence.

**Checkpoint/source:** This documentation stays on `codex/post-media-rollout-evidence`,
separate from frozen production main. Implementation remains reviewed `df2347ca`,
merged via PR58/main `0c777203`. Previous local test/hash-pin and concurrent build
failures are preserved below; no new full local suite is claimed for this docs edit.
Detailed digests, executed recovery commands and restart instructions:
[Production shadow diagnostic](docs/ai/scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

**Next action:** Obtain sanitized historical `ai_usage` + matching `scan_terminal`
metadata via Cloudflare Logs for the window above. The restricted CLI received 403;
operator was asked to provide metadata, without credentials or receipt content.
Then isolate the cause, add a meaningful regression and the smallest justified fix,
normal review/CI/merge and validation of any changed final source before a distinct
provider validation. Promote 1/5/25/D1 only after the provider gate passes. Never
replay migration 0039 or recovery `37536969564`, or bypass Environment review.

All preceding checkpoints below are historical.

---

# Post-media staging complete and production 0039 applied - 2026-10-08 JST

**State:** Production rollout remains incomplete. PR58 merged normally as
0c77720334d7154b25e81d6e6823ab804619adce from reviewed head
82ce0cd8eb8188c475126fd5a88c2ff063ac25f9; main/reviewed tree equality is
e122e554581afafcc7a2f6a37ff2377a3a56d5a2. Exact-main CI37686743768 is SUCCESS.
Staging has completed the full final-source progression. Normally approved
migration37689543237 applied only0039, independently audited PASS. Production
ledger is now39/0039. Do not replay migration or recovery37536969564 (APPLIED).

**Production:** Guarded workflow preflight proved500 recipes, hydration/fingerprint
and valid operational media before the Time Travel bookmark and apply. Post-ledger,
unchanged aggregates, FK[], quick_check=ok, catalog/runtime and schema gate PASS.
Actual media rows500/ready500, zero operational anomalies. Full18-column metadata
SHA256e12c0bd9871406bd3477d304f345308fb5e912f85712f41cdbbb617e21792e0c and media
schema SHA2560503f30babe7efb858c02bb118b097c7610d3c834954c3cfb6912b76dca1feb6
are preserved. This is observed non-atomic metadata evidence; R2 bytes are
NOT_REVERIFIED. Normal reviewer vn-taphoanhatung, actor vn-tak, attempt1; both
actual ZIP digests, provenance and extracted bytes PASS. Root reverified both
archive byte digests/extractions before accepting root-reviewed-summary.json.

**Worker baseline:** Public readiness at2026-10-07T21:57:04Z independently confirms
old136cb6ff3d2921eac237c7b106b37ab5ee12a13f, static/0/cutoverfalse/globalstatic,
config/database/queue healthy and fallbacknull. No new production Worker upload or
provider scan. Email delivery remains unverified. User-data retention certification
is excluded by user authorization; payment/PayOS/auth/infrastructure unchanged.

**Executed hosted checks:** Final-head PR CI37685662053 SUCCESS; exact-main
CI37686743768 SUCCESS,255files/6309tests PASS411.90s and all14steps SUCCESS,
including lint/typecheck/migration-smoke/build. Staging shadow37687850533 ->
canary1 37688177602 ->canary5 37688484213 ->canary25 37688778057 ->D1 37689066860
all SUCCESS. Every phase proves schema39/T20server+UItrue, exact source/CI,
actual twoZIPs,3readiness/assets pairs, hosted+independent public smoke and skipped
production job. Final staging Worker054c2688-07d9-41e4-84f1-84c18b972de6;
public500ordered IDs, fingerprintf8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37
and imported detail15fields MATCH (5GETs/3readinessguards/0writes). No retry or
source edit during staging. Historical local full-suite/hash-pin and concurrent
Vite/build failures remain documented below; this checkpoint does not claim a
new full local run. Independent operator controls migration46/certification32/
ZIP+receipt23/freeze+dispatch26 PASS,0actualproduction requests in controls.

**Evidence:** /private/tmp/takosan-post-media-staging-prep/staging-progression-receipt.json
SHA25606f384a28f57314a5598516f94abbd54f4861c540f2a39e9e82f3d46b54ce0e0;
/private/tmp/takosan-post-media-migration-37689543237/independent-audit.json;
/private/tmp/takosan-post-media-migration-37689543237/root-reviewed-summary.json;
/private/tmp/takosan-post-media-production-prep/root-exact-main-ci-proof.json;
/private/tmp/takosan-post-media-production-prep/operator-activation-proof.json;
/private/tmp/takosan-post-media-production-prep/post-migration-production-static-baseline-independent.json.
Private raw rows, credentials and rollback bookmark values are not reproduced.

**Next:** Read-only certification37693128721 has gateSUCCESS and is waiting for
normal production Environment review byvn-taphoanhatung (CLIvn-tak cannot approve).
No Worker upload in this certification. After completedSUCCESS, collect/audit real
artifacts linked to migration37689543237, then freeze actual media counts/proofs.
Deploy frozen0c777/T20false through production shadow, exactly one synthetic scan,
1/5/25/D1; normal independent review is required separately for every production
run. Audit receipts/liveassets/smoke before promotion. Finally verify public500
content and mobile/desktop UI, finalize production packet and checkpoint actual
outcome. Never redispatch an existing intent or bypass Environment reviews.
This documentation checkpoint is kept separate so the frozen release HEAD/tree
can remain unchanged while release operations continue.

All preceding checkpoints below are historical.

---

# Post-media gate implementation and verification - 2026-10-08 JST

**State:** Implementationdf2347caf414537c287e11defae0b87f8377cec7/tree
7350e86740d246ace03ddb0bd86de522025d03d5 exactly matches independent reviewed
complete tree. Draft PR58 is open. Production remains old healthy static136cb6ff;
ledger38/0038 and recoveryAPPLIED. No production mutation/deploy/provider scan.

**Changes:** Complete0038/0039 catalogs require19 safe aggregates, valid active
hero coverage and actual domain metadata; historical pending-only gates remain.
Generic verification and 0039 preflight validate immutable0035 schema definitions.
The preflight privately reads all18media columns, validates actual rows through
the real mapper/auditor and recomputes coverage/uniqueness. It binds the rowcount
and full metadata/schema SHA256 before migration; post0039 must preserve them.
Only aggregate counts/digests are uploaded. No runtime/config/applied migration,
dependency/credential/Environment policy or protected payment/auth change.

**Review:** Two independent reviews report no remaining concrete blocker after
fixing stale aggregate acceptance of a newly invalid private row. Source review
and actual CLI controls PASS. This proves persisted metadata and observed
non-atomic preservation, not fresh R2 bytes. ADR042 records these limits.

**Executed checks:** Node24 focused5files/98tests PASS40.23s; core migration114/114
PASS4.60s and officialNode22.23.3 114/114PASS4.67s. Independent Node22 surrounding
4files/97tests PASS38.42s plus24controls PASS. Lint, typecheck, migration smoke,
actionlint1.7.12/four release workflows, syntax/diff checks PASS. Full Node24 suite
with canonicalTMPDIR/CI=true/metricsfalse/maxWorkers2:254files PASS/1failed,
6308tests PASS/1failed,356.58s. Its sole failure is the unchanged old reviewed
SHA256 pin for d1-readonly-query.mjs; adding two reviewed fixed singleSELECT modes
changes that fingerprint. Independent execution-path review confirms unchanged
schema/catalog/runtime behavior and mutation guards. The pin is intentionally
updated to reviewed9d43f62c25561423c6b4c00d611a262a82387dce724c6756274d1db9cfc4deb3;
focused certification/query safety checks2files/68tests PASS6.45s after repin.
No assertion or mutation guard is removed; full local PASS is not claimed.

**Build:** An initial build run during active Vite loaders failed the existing
service-worker token guard; retained log records that failure. After all test/CLI
loaders exited, the exact same build command PASS serially without source changes.
Concurrent output mutation is the observed limitation, not an application repair.

**Evidence:** /private/tmp/takosan-post-media-final-independent-source-review.json;
/private/tmp/takosan-catalog-preflight-diagnostic-audit-prep/media-surrounding-review/independent-controls.json;
/private/tmp/takosan-post-media-full-test.log;
/private/tmp/takosan-post-media-build-serial.log.

**Next:** Complete repin safety checks, final documentation/tree review and
final-head PR58 hosted CI. Merge normally only after green CI, prove reviewed/main
tree equality and exact-main CI, freeze final source. Full final-source staging
shadow/1/5/25/D1, guarded0039 and protected production certification precede
T20=false production shadow, one synthetic scan and1/5/25/D1. Each production
run requires normal independent Environment review. Production release incomplete.

All preceding checkpoints below are historical.

---

# Post-media migration gate repair - 2026-10-08 JST

**State:** Production release is incomplete. Normally approved read-only diagnostic
37681758263 completed with an intentional catalog gate rejection. Independent
actual artifact/API audit PASS: five ZIP digests and extracted bytes, exact main
282e564faaa7c608fa5617f65bb48d453d8e2fcd, successful CI37680537546 and normal
reviewer vn-taphoanhatung. The final main fence and sanitized uploads succeeded.
No production mutation occurred. Ledger remains38/0038; recovery37536969564 is
APPLIED and must not be replayed.

**Confirmed cause:** Runtime PASS proves500 recipes,0 hydration failures and
fingerprint f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
Catalog order0..499, IDs/slugs, provenance, ingredient/step/order coverage and
repeat-capture stability PASS. The old gate rejects media_ready=500 and
recipes_without_pending_hero=500 because it encodes the historical pre-media
rollout condition. These counts do not yet prove per-recipe ready hero coverage,
valid metadata or current R2 bytes. The earlier missing-pending hypothesis is
superseded by this actual evidence; no ready media reset/delete is authorized.

**Decision:** ADR-042 preserves historical pending-only seed/catchup gates and
adds fail-closed operational media checks only for complete0038/0039 catalogs.
Require active hero coverage, closed vocabulary/identity/version, exact ready
key/MIME/dimensions/hash/length, no orphan or duplicate ready role. Guarded0039
must preserve a private ordered full metadata capture by count/SHA256 across the
additive migration. Receipts publish only aggregate counts/hashes. This is metadata
and preservation proof, not a fresh R2 object-byte verification.

**Staging:** Source282e shadow37681762795 and canary1%37682153382 SUCCESS,
with protected500/fingerprint/schema39/T20=true, four ZIP digests/extracted bytes,
six paired readiness/assets observations and public smoke PASS. Current staging
Worker51d78f0a-cf93-4990-af98-d9719d556b23. Stages5/25/D1 were not executed;
this partial packet does not certify the future patched source. No production
operation/provider smoke followed. User-data retention certification is excluded.

**Evidence:** /private/tmp/takosan-production-catalog-preflight-independent/takosan-production-receipts-catalog-preflight-37681758263/independent-audit.json;
/private/tmp/takosan-catalog-preflight-staging-prep/partial-staging-receipt.json
SHA2566b305423e9916821ad9aea7aa97675b94bd7a06b7e9d6abe0e31d099be3f2558.

**Next:** Implement/review/test the bounded media policy repair on
codex/post-media-migration-gate, normal PR/final-head CI/merge/exact-main CI,
then certify actual production media before guarded0039. Certify final-source
staging shadow/1/5/25/D1 and production schema/catalog before T20=false production
shadow, one synthetic provider scan,1/5/25/D1. Every production run retains normal
independent Environment review; no bypass or blind retry.

All preceding checkpoints below are historical.

---

# Catalog preflight diagnostics merged - 2026-10-08 JST

**State:** Production release remains incomplete. PR57 was merged normally at
2026-10-07T20:14:43Z as282e564faaa7c608fa5617f65bb48d453d8e2fcd. Its parents are
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6 and reviewed head
0745bfc3f8ceaf0ed4bc79e41fb0635a991058d4; merge/reviewed complete-tree equality
9a8a01ecb9fe17339adab314e2743985d87c7e71 verified. Final-head CI37625628744
SUCCESS:254files/6198tests247.54s, lint, typecheck, migration smoke and build.
Exact-main CI37680537546 SUCCESS:254files/6198tests414.81s and all release gates.
Current main282e and frozen release identity were rechecked before dispatch.
Local full-suite failures remain documented in the preceding checkpoint; hosted
full-suite success does not change that recorded local limitation.

**Prior production diagnosis:** Normally approved37616546408 SUCCESS proves500
physical/hydrated V1 recipes, zero hydration failures,2702matching ingredient/order
rows and stable observed non-atomic snapshots at ledger38/0038. It does not prove
live full runtime fingerprint, complete ordered IDs/slugs or pending hero/media
invariants. Missing0039 in that diagnostic's baseline is expected and does not
explain the preflight failure of migration37615237481. Recovery is alreadyAPPLIED;
no replay, blind migration retry or rollback followed.

**Implementation:** Reviewed3d043ec9156841b7f6b0e5b3a7068670b40c932d adds sanitized
read-only preflight diagnostics with unchanged catalog/runtime verifiers, complete
38-prefix ledger fencing, repeated successful snapshots and fixed error enums.
Failed queries cannot reuse stale JSON. Only safe aggregates/counts/hashes are
published. The final main fence executes after rejected diagnosis. Runtime,
config, migrations, credentials, dependencies and Environment policy are unchanged.

**Local investigation:** The exact historical recovery plan was recompiled from
a8fa0324bb609274cc07a5c4b079e7ee4633fd83 with original SQL SHA
e5a58960baa4b8e1f4cae8be94985dd03cf4e9acf03c274b38fb310ce79f28c0.
Four local controls PASS: recovery preserves recipe_media, so missing/duplicate
pending heroes can survive an APPLIED V1 catalog with500hydrated recipes and exact
runtime fingerprint while verifyCatalogAtTip rejects it. Runtime order is restored
from1000..1499 to0..499 by the same plan. This is a source/local hypothesis only;
live media state still requires the new protected read-only diagnostic.

**Preparation:** Fresh local-only pinned282e catalog source proof PASS:769source
files,500canonical recipes, expected fingerprint and ordered-ID/detail hashes;
production/public requests0. A separate five-stage staging packet is prepared with
previous969d/d1/0/Workerb7b0, preserving all old evidence. Independent previous
staging paired readiness/service-worker proof PASS3observations at20:17:44Z.
Staging shadow37681762795 dispatched once with T20=true/shadow0/rollback=true
from969dD1; source release gateSUCCESS, stagingin_progress, productionSKIPPED.
Remaining1/5/25/D1 stages require each prior stage complete proof.

**Production:** Readiness at2026-10-07T20:18:48.830Z remains healthy old136cb6ff /
static/0%/cutoverfalse, configOK/databaseOK. No new provider smoke submitted.
User-data retention certification remains excluded by operator instruction.

**Evidence:** /private/tmp/takosan-catalog-preflight-production-prep/pr57-merge-proof.json;
/private/tmp/takosan-catalog-preflight-local-source-root.json;
/private/tmp/takosan-recovery-catalog-compatibility-audit.json;
/private/tmp/takosan-catalog-preflight-staging-prep/preparation-receipt.json.

**Protected diagnostic:** Run37681758263 dispatched once at2026-10-07T20:24:30Z
for frozen282e/mainCI37680537546. GateSUCCESS; diagnoseWAITING. GitHub API
current_user_can_approve=false, required reviewervn-taphoanhatung. Normal review
requested; no bypass or Environment setting change. New helper can intentionally
mark the runFAILED while publishing a sanitized rejected catalog/runtime receipt;
that is evidence to interpret, not permission to retry migration.

**Next:** Obtain required independent vn-taphoanhatung approval for37681758263. Audit its complete catalog/runtime receipts
before selecting a bounded repair or retry. Complete same-source staging proof,
guarded0039 and protected certification before productionT20=false shadow, one
synthetic provider smoke,1/5/25/D1. Each production run retains normal review.

All preceding checkpoints below are historical.

---

# Catalog preflight diagnostic implementation - 2026-10-07 JST

**State:** Production release remains incomplete. Production diagnostic
37616546408 completed SUCCESS at 2026-10-07T12:17:44Z on main
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6 with normal independent approval by
vn-taphoanhatung. Five actual artifact ZIP digests and extracted JSON bytes PASS
in independent audit. Ledger stays 38 / 0038; 500 physical and hydrated recipes,
0 hydration failures, 2702 ingredients and matching order rows, exact historical
V1 ingredient lines/positions and stable observed non-atomic snapshots are proven.
The missing 0039 diagnostic baseline is expected and does not explain migration
37615237481's catalog preflight failure. T21R-B fingerprintVerified proves the
target V1 source, not the live full runtime fingerprint. Live ordered IDs/slugs,
media invariants and full runtime fingerprint remain unproven. Recovery is already
APPLIED; no recovery replay, blind migration retry or rollback is justified.

**Changes:** Implementation 3d043ec9156841b7f6b0e5b3a7068670b40c932d, tree
c79bda74d06d7b0637eb034b3057e2df1eecf636, adds a read-only catalog preflight
receipt to the existing protected diagnostic workflow. The helper reuses unchanged
verifyCatalogAtTip and verifyRuntimeCatalogContent at exact ledger 38, requires
repeat successful catalog/runtime captures and an unchanged complete ledger, and
reports independent PASS/REJECTED/NOT_EVALUATED checks. Only 13 numeric/null
aggregates, counts, hashes and fixed reason enums are uploaded; raw rows and
exception messages stay private. Failed captures cannot reuse stale JSON. Stable
non-atomic consistency is claimed only when ledger and both snapshot comparisons
PASS. The final main fence runs even after a rejected diagnostic. No production
write, runtime/migration/config/dependency or Environment-policy change.

**Verification:** Final helper tests 38/38 PASS under Node 24.16; final exact
Node 22.23.3 focused tests 3 files / 58 tests PASS (35.73s). Independent final
review of implementation/tree reports no remaining finding. Actual CLI controls
7/7 and exact workflow-shell stale JSON/provider-failure controls 5/5 PASS, with
0 production calls; official Node 22 CLI controls 4/4 PASS. Final lint, typecheck, migration smoke, build, script
syntax, actionlint 1.7.12 and diff checks PASS. Default local full suite returned 3 failed
files / 12 failed / 6186 passed (179.65s): untouched capture tests compare
uncanonical macOS /var temp paths with real /private/var paths, and the local
Wrangler prefix test timed out under default concurrent workers. No tests were
weakened. Independent focused3files/125tests PASS4.58s with canonical TMPDIR
and maxWorkers=2; the two capture files reproduce the same11 failures with the
uncanonical default TMPDIR even with two workers. All eight involved source/test
files are byte-identical between969d and the implementation. Exact resource
bottleneck of the concurrency-sensitive Wrangler timeout was not profiled. Full
canonical-TMPDIR/maxWorkers=2 regression completed 253 passed / 1 failed files,
6197 passed / 1 failed tests (328.71s). The remaining unchanged local Wrangler
catchup test took33.993s and timed out at its existing5s bound; it passed1.745s
in focused verification. All new38tests passed in both full runs. Draft PR57
CI37624949372 is pending; no local full-suite PASS is claimed.
One actionlint invocation used a nonexistent certify filename; corrected to the
actual production-certify.yml and all four affected release workflows PASS.

**Production:** Public readiness at 2026-10-07T12:53:19.214Z remains healthy old
Worker 136cb6ff3d2921eac237c7b106b37ab5ee12a13f / static / 0% / cutover false,
config OK and database OK. No new provider smoke submitted. Staging969d completed
its full shadow/1/5/25/D1 proof; that packet cannot certify a future main SHA.

**Evidence:** /private/tmp/takosan-production-receipts-diagnostics-37616546408/
independent-audit.json; /private/tmp/takosan-production-catalog-preflight-review-final.json;
/private/tmp/takosan-production-catalog-preflight-cli-control/audit-results.json;
/private/tmp/takosan-production-catalog-preflight-workflow-control/audit-results.json.
Raw runner-local production rows were not exported or published.

**Next:** Finish the CI/environmental diagnosis and documentation checkpoint,
require final-head hosted CI on draft PR57, then normal merge and exact-main CI. Freeze the new main SHA and run
one normally approved protected read-only diagnostic to identify the rejected
catalog/runtime check. Repair only proven defects, then certify final-source
staging, guarded0039 and production schema/catalog before T20=false production
shadow, one synthetic provider smoke, canary1/5/25 and D1. Normal independent
production review remains required per run. User-data retention certification is
excluded by operator instruction. Do not claim production completion yet.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Production preflight stopped; staging verified - 2026-10-07 JST

**State:** Production release is incomplete. PR #56 merged normally as
969d1d3735b85913c9b1dfe6ae4df2eba40e98b6. Reviewed head ca5df79 and merge have
complete-tree equality 7c0cecd8e06657c570f5ce161cc5430ab8d9cd56. Final-head CI
37613292017 and exact-main CI 37614255604 SUCCESS; hosted main ran 253 files /
6,160 tests, lint, typecheck, migration smoke and build. Release source stays
frozen at 969d1d.

**Migration:** Run 37615237481 was approved normally by vn-taphoanhatung and its
frozen-toolchain/exact-SHA gate passed. Production identity and ledger 38 / 0038
were verified, then Require healthy current catalog before migration 0039 FAILED.
Bookmark, baseline, plan, apply and every post-check were SKIPPED; this run did
not apply 0039 or upload a Worker. No recovery replay or catalog rollback followed.
Both candidate/receipt artifact ZIP digests and extracted manifest bytes PASS in
root and independent audit. The sanitized receipt lacks the specific preflight
failure reason and raw query outputs, so the cause remains UNKNOWN. Prior inspect
APPLIED proves recovered rows/shape/counts, not complete runtime/media release proof.

**Reproduction:** The actual failure manifest plus fresh immutable 0038 V1 local
SELECT evidence passed the same verifier and exact four-argument CLI under
Node 24.16.0 and independently checksum-verified official Node 22.23.3. Both report
500 recipes, 0 hydration failures and fingerprint
f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.
No argv, serialization or Node-version failure reproduced. These fixtures do not
certify live D1 and do not justify a blind migration retry.

**Staging 969d:** Completed shadow 37615155277, 1% 37615530432, 5% 37615915508,
25% 37616295460 and D1 37616679405. All five normal runs SUCCESS with production
jobs SKIPPED; 10 actual artifact ZIP digests/extracted bytes, protected authority
500/fingerprint/schema 39/T20 true, 15 paired readiness/service-worker observations
and public smoke PASS. Final public 500 ordered IDs, runtime fingerprint and
imported detail (15 fields, 6 ingredients, 5 steps) PASS via 3 readiness guards /
5 GET requests. Final Worker b7b0a495-d933-4698-950c-a8d0918b20c4. Root independent
offline packet, archives and previous-authority progression audit PASS. A temporary
root assertion initially expected previousDeployment in staging; staging records
previousRecipeAuthority, so the assertion was corrected to that actual schema
before PASS. This certifies staging only.
Packet: /private/tmp/takosan-migration-gate-staging-prep/staging-progression-receipt.json
SHA256: ac9933239ac080c04fc7057e96b8c8adffe97ecae0cdfb3e42ec27a2ebf4366f.

**Next protected run:** Read-only diagnostics 37616546408 was dispatched once at
2026-10-07T11:48:03Z for frozen 969d / main CI 37614255604. Its source gate SUCCESS;
GitHub API currently reports WAITING, approvals [], required production reviewer
vn-taphoanhatung and CLI current_user_can_approve=false. Normal review is requested;
do not bypass or change Environment settings. Read the new runtime, order, lineage
and V1-comparison receipts to isolate the preflight failure before choosing a repair.
Do not infer live hydration or media state from a successful local replay.

**Production:** Public readiness at 2026-10-07T11:50:46Z reports healthy old Worker
136cb6ff3d2921eac237c7b106b37ab5ee12a13f, static / 0%, cutover false, config OK and
database OK. No new provider scan has been submitted. Production migration,
certification, shadow, provider smoke, canary 1/5/25 and D1 remain required after
the failure is resolved. Keep T20 server/UI false in production and preserve normal
approval on every run. User-data retention certification remains excluded by
operator instruction.

**Evidence:** /private/tmp/takosan-migration-failure-37615237481/ and
/private/tmp/takosan-production-receipts-migration-failure-37615237481/;
independent Node 22 fixture proof at
/private/tmp/takosan-production-receipts-node22-control/.
Production schema/deploy verifiers remain prepared for 969d / main CI 37614255604
at /private/tmp/takosan-migration-gate-production-prep/. Final packet assembler
now checks smoke chronology before canary, fixture/terminal/readiness identity and
final D1 content chronology. Syntax and 12 isolated controls PASS (1 valid,
11 rejecting invalid cases); production requests 0, actual production packet not
written. These are preparation checks until actual migration, certification and
deployment receipts exist.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Production migration gate toolchain - 2026-10-07 JST

**State:** Production release remains incomplete. Protected inspection37611067522
verified the prior catalog recovery APPLIED at ledger38, so no recovery replay or
catalog rollback followed. New migration37612433689 failed in its credential-free
source gate:ERR_MODULE_NOT_FOUND for the top-level TypeScript import in
scripts/d1-migration-check.mjs. Migrate was SKIPPED; no new D1 write or Worker upload.
Main remains5b12ab71acd84beec62be967c950b12d596c88d7 while the small fix is reviewed.

**Change:** Branch codex/migration-gate-toolchain adds pinned pnpm setup10 and
pnpm install --frozen-lockfile before the production migration gate. The already
locked TypeScript dependency is now available on a fresh runner. No package,
lockfile, runtime, migration, production credentials or Environment policy changes.
Other deploy/certify source gates import only Node built-ins and do not share the
failure. This supersedes the previous checkpoint's next action to use unchanged
5b12 migration tooling.

**Verification:** actionlint1.7.12 and git diff --check PASS. Node24.16 focused
migration/preflight/release/runtime-proof tests4files/304tests PASS3.85s. Isolated
fresh checkout reproduced missing TypeScript before dependency install. Frozen
install completed, module import and offline candidate proof then PASS with the
explicit tested origin/main SHA:only0039,34pinned hashes. The initial local clone
inherited a different main ref and its ancestry check failed; that fixture ref was
corrected only in the private temporary clone, then the candidate check passed.
No live GitHub/Cloudflare gate was substituted by this local test. Exact-main5b12
CI37609952250 previously PASS253files/6160tests405.12s and full local gates were
already complete before this workflow-only change. New final-head/main CI is pending.

**Evidence:** Third applied receipt and normal approval retained at
/private/tmp/takosan-import-confirmation-production-inspect-37611067522/;
ZIPsha0af10c60605257478364f1a799bc3ca6fa03035a905b993efbd8d9eae3bda6c2,
receiptshaf9b5cdd37759074d151e5a985789e0dcca50b61625ca6683cfb4b39e829d2464.
No provider-terminal conclusion:UNKNOWN_NO_CURSOR; this is not full runtime release
certification. StaticWorker1a47f7f7/old136cb6ff remains unchanged at ledger38.

**Historical staging5b12:** Fully verified shadow37610975655,1%37611499034,
5%37611883708,25%37612247160,D137612639137; T20true/schema39/fingerprint/500recipes.
Ten actual artifactZIP digests and byte comparisons, five protected authority
proofs, fifteen publicreadiness/SWpairs and publicsmokes PASS. Final500ordered IDs,
15runtime fields and imported detail content PASS. FinalWorker
4f94b705-8d85-4d9c-89cc-7aea610b8872. PacketSHA256
c8650ab043a1dedf9cb24b2c0d18ad3e6aba1f0e466a3d9b331c516930ce8ccf at
/private/tmp/takosan-import-confirmation-staging-prep/staging-progression-receipt.json.
This packet cannot certify the newly merged workflow source.

**Next:** Review/merge the minimal fix normally and require final-head/exact-main
hosted CI. Freeze the resulting main SHA, rerun its full five-stage staging proof,
then dispatch intentional0039 with normal independent vn-taphoanhatung review.
Migration preflight must independently verify complete ordered V1/provenance/five-
query hydration/fingerprint before bookmark/apply. Verify exact39/schema/FK/quick/
catalog receipt, protected read-only certification and final staging before
productionT20false shadow/one synthetic provider smoke/1/5/25/D1. Every protected
run retains normal review; no bypass. User-data retention certification remains
excluded by operator instruction. Production deployment is incomplete.

Report: recipe-catalog/PRODUCTION_MIGRATION_GATE_20261007.md.
All preceding checkpoints below are historical.

---

# Import confirmation implementation - 2026-10-07 JST

**State:** Production release remains incomplete. Recovery37536969564 was normally
approved and has ATTEMPTED_COMPLETION_UNCONFIRMED at BOOKMARK_AND_IMPORT, without
importFailure or provider code. This supersedes any earlier claim that all incidents
are absent; its exact namespace has not yet been inspected remotely. No subsequent
retry/rollback/0039/application deployment has occurred.

**Changes:** Branch codex/production-import-json-confirmation adds a strict pinned
Wrangler file-import stdout parser and a third sealed SELECT-only inspector for
37536969564/a8fa. Historical incident definitions and compiler bytes are preserved.
The runner saves and repeats the third capture, and requires absent/stable/all-eight
primary guards/no failed reads before any future restore pin/bookmark/import. Query
JSON remains strict. Unknown completion retains sanitized OUTPUT_UNCONFIRMED and
never starts an automatic rollback. Marker observations are not full catalog
certification or provider-terminal evidence; UNKNOWN_NO_CURSOR/retryAuthorized=false
remain explicit. No runtime, migration, payment/auth or Environment policy change.

**Evidence:** Root independently reproduced the third plan receipt exactly against
the retained production artifact:296/36 statements and both SQL hashes PASS.
Implementation checkpoint244a43b includes the final reviewed source. Root final
runner/auth/parser focused3files/194tests PASS36.51s (runner75/auth13/parser106);
inspector163/163 PASS44.27s. Lint, typecheck, migration smoke, build, actionlint1.7.12,
script syntax and diff checks PASS. Both independent reviews report no remaining
blocker after tightening contradictory optional metadata. The first exploratory
full suite was deliberately stopped(exit143) for that final code/test change;
it is not claimed PASS or a regression failure. Full final-source suite PASS:
253files/6160tests,341.60s,Node24.16,maxWorkers2. Hosted final-head/main CI remains pending.
Inspector's first focused attempt had one fixture-only rollback guard failure; it
was corrected by separating drift and real rollback cases, then163/163 PASS.
No live database completion follows from these local tests.

**Next:** Finish parser tightening, full gates and independent final review; publish
and merge a normal PR, require exact-main CI and dispatch one protected inspect-import
with its final reviewed implementation head. Obtain normal vn-taphoanhatung review,
retain sanitized evidence and choose action from the actual third incident. Applied
requires independent complete V1/provenance/runtime proof before0039; absent requires
all stable guards plus separately reviewed intentional recovery; partial/blocked
requires an incident decision. Re-certify the newly merged source through staging
shadow/1/5/25/D1 T20=true, then guarded0039/full production certification and same-source
production T20=false shadow, one synthetic provider smoke,1/5/25/D1. a8fa staging proof
cannot certify a new source. User-data retention checks remain excluded by operator.

Report: recipe-catalog/PRODUCTION_IMPORT_CONFIRMATION_20261007.md.
All preceding checkpoints below are historical.

---

# Protected import inspection verified - 2026-10-07 JST

**State:** Production remains incomplete. Protected read-only inspect37531433145
completed SUCCESS with normal independent vn-taphoanhatung approval; this supersedes
the prior WAITING/pending-approval state. Release main remains frozen at
`a8fa0324bb609274cc07a5c4b079e7ee4633fd83`; reviewed PR54 head796097d,
complete-tree equality and exact-mainCI37530420360 are verified. Latest catalog
import remains provider-terminal UNKNOWN_NO_CURSOR, but no recovery commit is
observed in repeated stable primary captures. No production mutation was executed.

**Receipt:** statusINSPECTED_IMPORT_READ_ONLY/phaseCOMPLETE/mutations0,
ledger38/0038 unchanged; original and latest recovery namespaces objects0.
Latest failed incident37491535308:9 successful strict-primary observations,
failed0/blockers0, eight guards MATCH and bounded old catalog MATCH. Current V2
preflight:8 successful strict-primary observations/failed0/blockers0/all8MATCH.
Original sealed incident37384670328 still has its two known schema/FK query
failures and one legacy blocker;15 successful observations are primary. These
failures are retained honestly and are covered by the independent corrected V2
preflight; original terminal state is not certified. Both incident captures are
OBSERVED_STABLE_NON_ATOMIC. Old static100% Worker deployment/version/modules/bindings
are unchanged:1a47f7f7-3d74-4801-b26a-b91f39c7942e,
moduleSHA5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1.

Artifact11446940708 ZIP digest verified
`95cb8d80285da703cf5247929c109a94387e5da6aca0613f0346f6ad0e995424`.
Sanitized receipt SHA256 `294fe872124f5b4c6f74f8593b2fb11838f8d424e7fde7d4539d39981008fd2f`;
receipt and normal approval are in
`/private/tmp/takosan-production-v2-inspect-37531433145/`.
Root and independent reviewer both classify latest observations as ABSENT,
not import completion/retry/write-permission/release certification.
First temporary root verifier incorrectly required zero failed reads in the
sealed original inspector, rejected its two known legacy query failures; corrected
verifier explicitly retains those failures and separately requires exact latest
and corrected strict-primary zero-failure proofs. Final verification PASS.

**Credentials:** effectiveAPI_TOKEN/globalKeyPrecedencefalse; ACCOUNT token
verificationACTIVE/HTTP200 after user-token endpoint401/1000. Account/database
identity GETsHTTP200 and SELECT1 primarytrue prove read access. Token metadata
GET403/9109 leaves D1 Edit/account resource/deny/IP/TTL policy UNKNOWN and
writeAuthorizationUNKNOWN. Account-owned tokens officially support D1; pinned
Wrangler3.114.17 uses the same Bearer path for query/import. Token kind alone
is not evidence for prior10000. No credential values were read or published.

**Cloudflare console observation:** existing Chrome session is authenticated to
the same account and frigo-db binding. Named `tako-san-production-deploy` account
token is Active, recently used, and the account-policy D1 filter shows Read=1,
Edit=0. This is direct policy evidence for that named deployment token; the
aggregate receipt intentionally contains no token identifier, so name/activity
correlation is not an exact secret-to-token identity proof. No permissions were
changed at this initial observation. User then explicitly confirmed adding only
D1 Edit. Existing token policy was saved once:13 permissions versus12 before,
D1 Read retained and D1 Write added. Reopening the persisted token verifies
Read=1/Edit=1/Active. Existing entire-account resource, no expiry and all-IP policy
are unchanged; no other permission, token rotation, secret value or GitHub secret
was changed. The current receipt's writeAuthorization remains UNKNOWN; console
name/activity correlation is not an exact secret mapping or HTTP write certificate.
Evidence: cloudflare-console-scope-change.json beside the sanitized receipt.

**Recovery dispatch:** new intentional guarded restore-v1 run37536969564
https://github.com/vn-tak/Tako-san/actions/runs/37536969564, dispatched once at
2026-10-06T21:53:09Z on frozena8fa/reviewed796. Main/CI/full-tree gate SUCCESS;
normal review byvn-taphoanhatung is API-verified approved. The run completed
FAILURE atBOOKMARK_AND_IMPORT, statusIMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED,
importOutcomeATTEMPTED_COMPLETION_UNCONFIRMED. All fresh original/latest/current
preflights passed; current eight guards strict-primaryMATCH/failed0/blockers0.
Worker1a47f7f7 static100% was verified without redeployment (methodalready-static).
PreLedger38, bytes7409664; bookmark
0000018f-00000000-000050fc-4d329b2c830ec0bde6b059beb46b6150,
captured2026-10-06T21:56:58.499Z. No importFailure field or retained provider code
is present, and no post-import catalog/ledger/health/finalWorker certification.
Artifact11446718824 ZIP digest independently verified
ac8f45e104d4c0a9a06f59b8afb6af988aefc3c106169b9af23d1dafe84febe6.
Receipt SHA256a484b5256be675df15154b0c59eb102358d4d602fe1728db8fc5946ebe2caab7,
under/private/tmp/takosan-production-guarded-restore-37536969564/.
Root offline exact planPASS: guardVersion2,
SQLSHAe5a58960baa4b8e1f4cae8be94985dd03cf4e9acf03c274b38fb310ce79f28c0,
rollbackSHAba48a606a1694ec87a3af22fc01a640f0653344335ebd21bd260cdbefd4fdcee;
expected500/2702 ingredients/2064steps/2702positions.

**Confirmed parser defect:** Independent offline replay of verbatim pinned
Wrangler3.114.17 Handler/execute/import/spinner functions with mocked provider
responsesPASS, no network/productionmutation. Both successful upload and cached
init paths return nonempty all-success arrays but prepend spinner stdout even
under --json/loggerLevelerror. Full stdoutJSON.parse fails; --command query control
is cleanJSON. Runner's file-import parser therefore rejects legitimate successful
output. This explains a possible post-success parse failure and the missing
importFailure field; actual production import commit remains UNCONFIRMED until
inspection of this exact new repair prefix. No blind retry/rollback/0039.

**Next:** review and publish a narrowly validated file-import output parser and a
third sealed read-only inspector for37536969564, preserving both old incident
inspections. Use normal PR/mainCI/productionreview, then independently inspect
objects/markers/live+archive+target/primary/ledger/static proofs before choosing any
mutation. Current inspector only seals the two older incidents and cannot certify
this new outcome. Only proceed to guarded0039 after V1 catalog/integrity proof at38.
After guarded0039 and full
production read-only certification, deploy the same release T20server+UIfalse:
shadow, one synthetic live provider smoke, then1/5/25/D1 with normal approvals.
Final-SHA staging five-stage progression/public500 proof is COMPLETE, packet
SHA256a4a852df3464c243bc6d07cdb96d47cbea713288a7a81e4199fd1f7f5a5156f4.
Production validators are prepared under/private/tmp/takosan-final-production-prep/;
synthetic validator fixtures are not production evidence. Remote main stays frozen;
this documentation checkpoint is local/unpublished. No0039/new application/AI smoke/
production canary or D1 completion is claimed.

---

# PR54 merged forensics checkpoint - 2026-10-07 JST

**State:** Production deployment is incomplete. Latest restore37491535308 was
normally approved byvn-taphoanhatung and failed with unconfirmed import completion.
It is not waiting for review. Provider terminal remainsUNKNOWN_NO_CURSOR. User
requests production recovery/migration/deploy and excludes user-data retention;
normal independent production Environment approval remains mandatory.

**Published:** PR54 https://github.com/vn-tak/Tako-san/pull/54 merged normally at
2026-10-06T20:57:58Z to a8fa0324bb609274cc07a5c4b079e7ee4633fd83.
Executable86bfec959584f6a194543ec12470b956e5c951ff; reviewed finalhead
796097d9c1e2db4972151376449873c1ef60419f. Local Git proves reviewedhead ancestry
and identical complete tree0bdbdec8542b3304c7f6d11447b844bbf5945043 at main.
All12paths independently reviewed, no concrete blocker. Historical migrations,
PayOS/payment/billing, application runtime and unrelated auth remain unmodified.

**Checks:** Full credential-free Node24 suite252files/5993testsPASS489.06s/exit0,
no skipped. Earlier full5992PASS/1FAIL492.44s remains recorded: existing Wrangler
catch-up test5273ms exceeded unchanged5000ms limit; isolated32/32PASS2.85s and
full-recheck Wrangler787ms. No toolversion/timeout/test/protection was weakened.
Lint/typecheck/migration smoke/build/actionlint/syntax/diffPASS. Final PR hosted
CI37529365966 SUCCESS252files/5993tests390.11s/all gates; initial headCI37528405327
SUCCESS252/5993/373.17s. Exact-main CI37530420360 SUCCESS252files/5993tests368.10s/all gates.
Root reverified live maina8fa and dispatched consolidated inspect-import37531433145
exactmain/reviewed796097d once. Source gate SUCCESS; approval reported; API
verification pending. No remote inspection completion or production recovery is
claimed. Finala8fa staging shadow/1/5/25/D1 at hardening089ae/T20server+UItrue is
complete with hosted and independent receipt/readiness/SW/smoke/content proof.
Staging operations made no production access or tracked source edits. Credential-free
workflow registration37530420366 SUCCESS (echo only, no production access).

**Next:** Freeze remote maina8fa. Await API-verified normal approval and completion
of consolidated protected inspect-import37531433145 onmain/reviewed796097d.
It reads both fixed incidents, corrected guards and bounded credential evidence,
requires unchanged ledger38 and old static100% Worker before/after; no retry/release
authority. Actual D1 import state and effective Cloudflare write grant remain
unconfirmed. Final-SHA staging shadow/1/5/25/D1,T20server+UItrue is now certified.
Current Deploy workflow is manual workflow_dispatch only; the DEPLOYMENT.md
automatic-staging description is historical and must not drive operations. New
production0039/application/AI smoke/canary/D1 success is not claimed.

**Staging final a8fa:** COMPLETE and independently verified at frozen main
`a8fa0324bb609274cc07a5c4b079e7ee4633fd83`, approved hardening
`089ae329ebba2ba38659c030266068aeace9b8a8`, exact-main CI `37530420360`.
Every stage is first-attempt SUCCESS, release/staging SUCCESS and production
SKIPPED; schema 39/0039, T20 server+UI=true. Manifest, build-flag gate and upload
command agree. Protected D1 probe is ready/500, fingerprint
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`, release
`rel-bd00a4f53fcaeee4`, fallback=null. Hosted and independent public smoke PASS
at every stage; readiness and SW have three consecutive exact-SHA pairs.

| Stage | Run | Previous Protected State | Hosted Wait / Independent Wait |
| --- | --- | --- | --- |
| shadow/0/cutover=false/global=static | [37531528831](https://github.com/vn-tak/Tako-san/actions/runs/37531528831) | 4092/d1/0, ancestor; rollback=true | 15153 ms / 7733 ms |
| canary/1/cutover=true/global=mixed | [37531812833](https://github.com/vn-tak/Tako-san/actions/runs/37531812833) | a8fa/shadow/0; rollback=false | 14949 ms / 7608 ms |
| canary/5/cutover=true/global=mixed | [37532189153](https://github.com/vn-tak/Tako-san/actions/runs/37532189153) | a8fa/canary/1; rollback=false | 7680 ms / 7703 ms |
| canary/25/cutover=true/global=mixed | [37532527218](https://github.com/vn-tak/Tako-san/actions/runs/37532527218) | a8fa/canary/5; rollback=false | 29871 ms / 7671 ms |
| d1/0/cutover=true/global=d1 | [37532897461](https://github.com/vn-tak/Tako-san/actions/runs/37532897461) | a8fa/canary/25; rollback=false | 14734 ms / 7791 ms |

SW at every final-SHA stage is HTTP200/JavaScript/no-store/exact a8fa, SHA256
`5056dccadfb9c387399c972531bb36419a2fdf2b6b810b7f190f85f3857e7f0f`.
Checks use unchanged defaults: 90000 ms deadline, 3000 ms interval, 15000 ms
request timeout and three consecutive pairs. No retry or check/bound/source change.

Final D1 Worker `805d6281-bd61-44ba-9501-ff8d53ed17d3`.
Artifact `11444883305`, `release-staging-37532897461-1`, digest
`c5023768cd1a97243348141de9f98f20bf8d4b36b807aec140c4c09786d425bb`.
Receipt `/private/tmp/takosan-final-staging-d1-37532897461/release-manifest.json`,
SHA256 `3e4261cf14a5267fc167ba7c92b923561067a36d79229f45d0dc23531bd98974`.
Full progression packet (all five artifacts/Workers/receipt hashes/logs/proofs):
`/private/tmp/takosan-final-staging-prep/staging-progression-receipt.json`, SHA256
`a4a852df3464c243bc6d07cdb96d47cbea713288a7a81e4199fd1f7f5a5156f4`.

Independent final public catalog proof PASS at `2026-10-06T21:20:59.787Z`:
767 local source blobs match final SHA; canonical sourceDigest
`4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5`.
Five credential-free GETs with three exact-SHA/D1 readiness guards prove public
list HTTP200/count500, ordered IDs MATCH and all 15 runtime-field fingerprint
MATCH. Imported detail `imp-199ff78d3d8c8ab3` is HTTP200, full runtime canonical
and list parity MATCH (six ingredients/five steps). Additive media fields are
outside this runtime fingerprint. Root independently read the content proof PASS.
Evidence `/private/tmp/takosan-final-staging-d1-37532897461/public-catalog-content-proof.json`.
Live main remains a8fa; all five runs are completed SUCCESS. No further staging
dispatch is required. This proves staging; no production completion is claimed.

Protected production inspect `37531433145`: **approval reported; API verification pending**. User reports approval; root's latest API still shows source gate SUCCESS,
recover WAITING/approvals[]/current_user_can_approve=false, required reviewer
`vn-taphoanhatung`. Remote inspection outcome remains unverified. No D1 mutation,
0039 or production application deployment follows from staging proof or approval
report alone; wait for the authorized protected inspection result and its evidence.

This local evidence update is unpublished to preserve the frozen release SHA.
Prior pending-main/restore-WAITING sections are historical and superseded here.

---

# Latest V2 import failure and read-only forensics - 2026-10-07 JST

Production deployment remains incomplete. User authorizes production recovery,
migration and deployment and confirms no real users; user-data retention
certification is excluded. Required normal production Environment approval remains.

Restore run37491535308 was approved normally by vn-taphoanhatung and completed
with FAILURE at2026-10-06T20:12:42Z. GitHub API independently confirms approval;
this run is no longer waiting. Source/main/full-tree/CI gates and fresh eight
strict-primary V2 guards passed. Receipt status is
IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED atBOOKMARK_AND_IMPORT,
importOutcomeATTEMPTED_COMPLETION_UNCONFIRMED, COMMAND_FAILED/exit1/provider10000.
No post-import ledger/catalog/runtime/finalWorker/rollback certification exists.

Failed batch source4092d4ca2dacee8bb01da484aae93592e9bd94da,
repairIdt21_v1_37491535308, SQL SHA256
75c8207ec177972c6cac92007a2c8f165a94ce39d7f03ea7973446aedcd4f441,
rollback SHA25626b9a034f3bab9697d6ccb8fd3253e2701a34ba3b6b6cb1b9d3c4f5fb2393825.
SourceDigest4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5,
guardVersion2/26rows, expectedobjects58/16tables/42triggers. PreLedger38/0038,
capacity7409664bytes. Bookmark
00000189-00000000-000050fc-8b4f0b48127dff432a85bd253c342de2,
captured2026-10-06T20:12:34.364Z. Artifact11442016163 digest
132ed6a0431356953cf696dbad594deba81e684ce260f4ee99c7dd3e189fe849.
Sanitized receipt remains privately available at
/private/tmp/takosan-production-v2-restore-37491535308/catalog-recovery-receipt.json.

Pinned Wrangler3.114.17 file import uses init/upload/ingest/poll. Code10000 alone
cannot identify which stage failed or prove that no write occurred. A successful
SELECT proves read access only; Cloudflare D1 requires D1:Edit for HTTP writes.
Token verification proves token state, not effective D1 write authorization.
References: https://developers.cloudflare.com/d1/platform/release-notes/ and
https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/.

The original37384670328 inspection cannot inspect this new prefix or26guardrows.
Branchcodex/production-v2-import-forensics extends read-only inspect-import with
sealed latest-incident source/SQL/rollback identity, repeated aggregate captures,
and bounded credential/HTTP evidence. Provider terminal state staysUNKNOWN_NO_CURSOR;
retryAuthorizedfalse. No write/import permission test, automatic recovery,0039 or
production application deployment is performed by this inspection.

Prior4092 staging shadow/1/5/25/D1 sequence is complete; the first25 run remains
failed and the fresh25 succeeds. Final staging D1run37493357178 proves500/exact
fingerprint/schema39/globald1/T20server+UItrue. A newly merged inspector mainSHA
requires fresh exact-main CI/tree binding and final-SHA staging proof for release.
Fresh public production readiness after the failed import ishealthy/static0/
cutoverfalse/globalstatic/fallbacknull/old136cb6ff; this does not settle D1 state.

Validation checkpoint (local, new implementation): independent peer review finds
no concrete blocker. Helper117/117PASS26.77s, credential70/70PASS508ms;
runner+approval initial69/69PASS17.83s. After adding the latest-incident restore
fence, runner+approval72PASS/1FAIL18.24s because an existing test expected the
later recoveryPreflight receipt after the new fence stopped earlier. The corrected
test requires the exact earlier phase, latest INSPECTION_BLOCKED, internal-inventory
MISMATCH and absence of later preflight; targetedrecheck1PASS/59skipped3.71s.
Helper's first117suite111PASS/6FAIL was a Python test harness authorizer teardown
issue, fixed without changing queries or safety policy; final117PASS. All skipped
counts here belong only to the targeted recheck, not a final verification waiver.
Final source lint/typecheck/migration smoke/build/actionlint1.7.12/diffPASS.
Executable checkpoint 86bfec959584f6a194543ec12470b956e5c951ff.
First full credential-free Node24 single-worker suite:252files/5992PASS/1FAIL
(492.44s); only existing staging-d1-catchup-check Wrangler test exceeded unchanged
5000ms limit at5273ms. Isolated unchanged file32/32PASS2.85s, Wrangler885ms.
Full unchanged recheck252files/5993testsPASS489.06s/exit0/no skipped.
Wrangler case passes787ms in the full recheck. Independent final-tree review at
e768acfe7c3f953fba4121818707589a3d7841d2 found no concrete blocker across12paths.
PR54 hosted CI is still running; exact-final-head and exact-main CI and new remote
inspection success are not claimed. Documentation now records the actual final
local result; the next documentation checkpoint remains subject to hosted CI.

New recovery orchestration also requires two stable inspections for the latest
fixed incident and zero repair objects/no observed commit/primary old-catalog bound
before any future pin/import. Applied or partial latest markers block replacement.
The diagnostic remains non-atomic and never infers terminal import or write grants.

Only published normal-reviewed code may access protected production secrets.
Next: finish focused and full mandatory validation, independent review, normal PR
merge, exact-mainCI; dispatch one consolidated protected read-only inspection.
Inspect latest marker/archive/target/live data and credential evidence before a
separately reviewed recovery decision. Do not blind retry, rollback or apply0039.

Previous sections are historical; their restore-WAITING statements are superseded.

---

# Production guard V2 published checkpoint - 2026-10-07 JST

**State:** Production release is incomplete. PR53 merged normally at
4092d4ca2dacee8bb01da484aae93592e9bd94da on 2026-10-06T15:40:10Z.
Reviewed final head6e45d824363c24c8b63b629eefce8252e8f16a6f and merged main share
complete treef97f89682665fcd9a3e5dd2888f8443ea76a1b2d; ancestry and equality were
verified. Exact-main CI37489453830 SUCCESS: 251 files / 5873 tests PASS
(380.38s), lint, typecheck, migration smoke and build PASS. Credential-free
registration37489453876 SUCCESS. Main is held fixed for release evidence.
Operator authorizes recovery/migration/deploy and confirms no real users;
user-data retention certification is excluded. Normal required production review
by vn-taphoanhatung remains; CLIvn-tak cannot supply that review.

**Implementation:** Executable4aeb7988c0ec2d44e1f8fbaa7e74eb9224e4cb11 implements
strict internal inventory, materialized application-FK scanning, case-folded
FK/trigger and original-prefix coverage, sealed original inspection compiler,
eight strict-primary preflight guards, repeated original/new observations and
original static100% Worker checks before any new guarded recovery. File import
and rollback require nonempty all-success JSON; ambiguous completion stays unknown.
Independent exact-final-tree review found no concrete remaining blocker.

**Checks:** Local compiler48/helper74/runner53/approval13 PASS; independent
compiler+helper122PASS29.39s and runner+auth66PASS15.35s. Full Node24 suite
251files/5873tests PASS487.54s/exit0; lint/typecheck/migration smoke/serial build/
syntax/diff PASS. Real local workerd D1 restore296/rollback36 PASS,500hydrated/
failures0/exact V1 fingerprint, rollback6720lines/order0/ledger38/FK0. PR53 hosted
CI37488555229 SUCCESS,251files/5873tests/283.24s and all gates. Earlier failed
fixture/harness attempts are documented in the report and are not production proof.

**Production proof:** Previously approved inspect37460946708 SUCCESS proves
stable observed old catalog, original repair objects0, no observed commit,
primary availability at observation times, ledger38/0038 and unchanged original
static100% Worker. Only incoming-FK original schema predicate fails; no retained
remote error/terminal cursor. Original provider terminal state UNKNOWN_NO_CURSOR.
A fresh public curl GET reports readinessok, commit136cb6ff..., healthy DB/queue,
static0/cutoverfalse/globalSourcestatic/fallbacknull. Python urllib GET was403;
public curl success is health evidence, not protected catalog certification.
A mistaken GET to /api/v1/ready returned 401; corrected public
/api/v1/health/ready GET confirmed the same healthy static old-source state.
Corrected inspect37490593680 SUCCESS with normal vn-taphoanhatung review:
mutations0, repeated OBSERVED_STABLE_NON_ATOMIC captures, original repair objects0,
NO_RECOVERY_COMMIT_OBSERVED, primary availability at observations, ledger38 before/
after and exact original static100% Worker/module unchanged. Corrected V2 preflight
GUARDED_PREFLIGHT_MATCH: eight guards MATCH, strict-primary8, failed0, blockers0.
Original provider terminal remains UNKNOWN_NO_CURSOR, retryAuthorized=false.
New intentional guarded restore37491535308 dispatched once at frozen4092 /
reviewed6e45. Source/main/full-tree/CI gate SUCCESS; recover waits for required
production review; API current_user_can_approve=false and approvals empty.
No recovery success, 0039 or new production application is claimed.

**Staging:** Same frozen4092 / hardening089ae / T20 server+UItrue sequence
completed: shadow37490615290 -> canary1 37491302867 -> canary5 37491745113 ->
fresh canary25 37493006431 -> D1 37493357178, all SUCCESS with protected500/exact
V1 fingerprint/no fallback, three paired readiness/SW observations and hosted+
independent public smoke PASS. Final Worker dc22aad4-fe86-4a6d-84de-50abc545731e,
schema39/0039, globalSource=d1. Independent public list has exact500 IDs/order/
runtime fingerprint; D1-only detail HTTP200/full runtime content MATCH.
Initial25 run37492174560 remains FAILED after upload and SW fetch rejection;
unknown cause, no post-deploy certification. Default-bounds live proof and fresh
same25 dispatch resolved the verification gap without changing code/checks/bounds.

**Next:** Required normal vn-taphoanhatung review of restore37491535308
([run](https://github.com/vn-tak/Tako-san/actions/runs/37491535308)) is the external
blocker: source gate SUCCESS, recover WAITING, approvals empty and CLI vn-tak cannot
approve. Await review; the runner then freshly repeats original/corrected proofs
before any mutation. Require V1_CATALOG_CERTIFIED_STATIC,500 hydrated/exact
fingerprint, ledger38/integrity before guarded0039, then production read-only
certification, same4092 production T20false shadow, one synthetic live AI smoke and
production1/5/25/D1. Staging is complete. Keep remote main frozen4092; this local
unpublished documentation checkpoint must not become the release ref.

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](docs/ai/recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
Prior sections remain historical. This local evidence checkpoint is not pushed
while the release source is frozen.

---

# Production corrected recovery guard checkpoint - 2026-10-06 JST

**State:** Production release remains incomplete. User authorizes recovery,
migration and deployment and confirms no real users; user-data retention
certification is excluded. Normal independent production Environment review
remains required. Current main is 660521b41cd0a71e1d2ce88806e2b7d041b30155.
PR52 reviewed head 9a659fade16fee293fff1a634938fb23be6b7903 merged normally;
complete tree equality/ancestry and exact-main CI37459993796 SUCCESS were verified.

**Remote proof:** Normally approved inspect37460946708 SUCCESS, mutations0,
two identical OBSERVED_STABLE_NON_ATOMIC captures, exact original recovery prefix
objects0, no recovery commit observed, primary reads not blocked at observations.
Canonical ledger38/0038 and original static100% Worker/version/module are unchanged.
Seven table shapes and active triggers MATCH; incoming_foreign_keys QUERY_FAILED
is the only failing original schema predicate. Other six pre-mutation guards MATCH.
Original provider terminal state remains UNKNOWN_NO_CURSOR; this proof does not
certify a retry or release. Artifact11411598439 digest
7d5915c219622e800fcf8d56f143c271f8a4e2e267c34f41f74d37093bf9b2a0.

**Staging:** Exact660 shadow37461272700 SUCCESS, T20 server/UI=true, protected
D1ready500/exact fingerprint, three paired readiness/SW observations and smoke.
Worker7dc92d32-e796-4f6e-a298-70a62ad97e85; artifact11412347814 digest
f41ef63adbc728d0972348483f920feb4bd20172df463a839cabed4019c49478.
No staging canaries dispatched; a new final main requires a fresh shadow sequence.

**Changes:** Branch codex/production-recovery-fk-guard adds guardVersion2
RESTORE_V1. Exact D1 internal inventory is checked before a materialized
application-table incoming-FK scan; unknown internal objects/schema and unknown
application references remain fail-closed. Original f4b6a4d SQL remains sealed
INSPECTION_ONLY and cannot be selected by the restore compiler. Read-only
inspect-import also evaluates two corrected eight-guard preflights. Restore
requires repeated identical original no-commit/primary/old-catalog proof,
strict-primary corrected preflights, exact original static100% Worker and fresh
main/normal approval before pin/bookmark/import. Import/rollback use --json;
file-command errors publish only bounded status/numeric provider codes.

**Checks:** Final credential-free Node24 focused compiler48/helper74/runner53/
approval13 PASS; compiler+helper independently122/122PASS29.39s and runner+auth
66/66PASS15.35s. Independent review found and fixed uppercase FK/trigger target
coverage and original recovery-prefix visibility; fresh review found no further
concrete blocker. Lint/typecheck/migration smoke/syntax/diff and serial build PASS.
Final credential-free Node24 full suite251files/5873tests PASS,487.54s/exit0.
Executable checkpoint4aeb7988c0ec2d44e1f8fbaa7e74eb9224e4cb11. Actual Miniflare/workerd D1 atomic restore
296statements PASS,500hydrated/failures0/exact V1 fingerprint; rollback36 PASS,
6720lines/order0/ledger38/FK0. Fixture includes documented _cf_KV seeded privately
via immutable local SQLite prefix. Initial combined Wrangler seed failed
SQLITE_TOOBIG; first direct fixture replay failed FK, two harness setups failed
module/persistence discovery. None reached production or proves the remote error.
Wrangler optional update cache was refreshed from an actual npm registry response;
no source/test/timeout/tool version edits. No new remote mutation.

**Next:** Publish the validated, independently reviewed PR,
require green final-head CI, merge normally and require exact-main CI/tree equality.
Dispatch corrected inspect-import first and obtain normal vn-taphoanhatung review.
Only all eight hosted guards MATCH with strict-primary observations permits a
separately approved intentional new V2 recovery. Require live V1/static/500/exact
fingerprint/ledger38/integrity before guarded0039, read-only certification, final-SHA
staging shadow/1/5/25/D1 T20=true, production same-SHA T20=false shadow, one live
synthetic AI smoke and production1/5/25/D1. No final production success is claimed.

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](docs/ai/recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
Earlier checkpoint sections are historical.

---

# Production interrupted-import inspection checkpoint - 2026-10-06 JST

**State:** Release incomplete. Normally approved diagnostics 37450399162 SUCCESS
at f2b00023ccb9a706d17ebe71321c0364a948ca75. Repeated reads show ledger38/0038,
500 version2 recipes,6720 ingredient lines,0 order rows,0 hydrated recipes and
500 missing_ingredient_position failures. This diagnostic success does not certify
release or settle recovery37384670328 provider completion. No blind retry,
rollback,0039 or promotion. User authorizes production release and confirms no
real users; user-data preservation certification is excluded.

**Changes:** PR51 final d70d644e5d4e953ebe02894a28cf8fe4c110006e passed hosted
CI37453365335 and merged normally at2026-10-06T11:25:37Z. Current main
 d2108588e4dfbccba6dbe75ab5fd0005330ae38d has identical complete reviewed tree;
exact-main CI37456321861 SUCCESS (250files/5736tests/288.01s plus all gates),
registration37456321763 SUCCESS with no
production access. New inspect-import operation under implementation on
codex/production-import-inspection is fixed to failed recovery37384670328.
It reads exact repair objects and compiler-derived pre-mutation guard booleans,
re-proves original static100% Worker/ledger before and after and compares two
aggregate captures. No SQL file import, pin, rollback or migration path runs.
Existing normal independent Environment approval/full-reviewed-tree/CI gates
remain. Hypotheses about protected internal-table PRAGMA or completion parsing
are unproved; recovery compiler and mutation behavior are unchanged.

**Checks:** Initial focused runner/auth43 had42PASS/1FAIL: real-helper guard
parser rejected exact_0038_ledger digit label; fixed parser and added regression.
Root focused3files71PASS (runner31/helper27/auth13),18.05s; helper final tests
still finishing. pnpm lint,typecheck,check:migrations,build,changed-file ESLint,
helper/test syntax and diff PASS. Full suite/independent final review pending.
No new remote inspection dispatch or production mutation has run.

**Production:** Last verified pin is old-source136cb6ff/static0/false,100%
version1a47f7f7-3d74-4801-b26a-b91f39c7942e with module sha256
5079c954a1905d6a72beb38828f3621833fdb0c57d57a4d93f371ed49cd4eca1.
Recovery37384670328 lost import completion after this pin/bookmark; no automatic
rollback or post-import certification ran. Exact repair objects and provider
blocking status still need inspection. Cloudflare import poll requires the lost
at_bookmark; Time Travel bookmark is not an equivalent cursor. Successful primary
SELECTs can prove no blocking import at observation times, not a terminal reason.

**Next:** Finish bounded helper/tests/full repository gates and independent
review; publish PR, final-head CI, normal merge and exact-main CI. Dispatch one
inspect-import, freeze main and obtain normal reviewer vn-taphoanhatung approval.
Use actual proof to resolve recovery safely. Require independently certified
V1/static/ledger38/500/exact fingerprint/integrity before0039, then final-SHA
staging shadow/1/5/25/D1 T20true and production sameSHA T20false, shadow, one
corrected live synthetic AI proof and production canaries. Production is not
complete; no corrected live AI success is claimed.

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](docs/ai/recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
Earlier checkpoint sections are historical.

---

# Production asset convergence checkpoint - 2026-10-06 JST

**State:** Release incomplete. Remote main stays
f2b00023ccb9a706d17ebe71321c0364a948ca75 while read-only diagnostics 37450399162
waits for the required production reviewer vn-taphoanhatung. Recovery 37384670328
was normally approved and FAILED with import completion unconfirmed after a
successful static pin. CLI vn-tak cannot approve. No blind retry, rollback or
migration is authorized by this ambiguous result. The operator authorizes release
and confirms no real users; user-data preservation certification is excluded.

**Changes:** Executable a9f1c81582677d4b40806c388d27892edeec1f44 pairs exact
readiness/approved authority with same-origin /sw.js before counting each of three
consecutive observations. Only an otherwise-valid SW with a different canonical
full SHA retries. The existing 90-second shared budget includes request/body time;
no request starts at zero budget. The 256 KiB body limit, HTTP/MIME/no-store/syntax/
strict BUILD_ID/SW marker checks and sanitized errors fail closed. CLI writes a
separate deployedAssets proof; original deployed shape/workflow/smoke are unchanged.

**Checks:** New assets RED 43 fail; final focused 331 PASS, independently rerun by
root. First full suite FAILED: 249 files / 5735 tests PASS, one unrelated catch-up
Wrangler test exceeded unchanged 5000 ms timeout; exit 1 / 512.97 seconds. Isolated
unchanged suite 32 PASS in 3.04 seconds (Wrangler case 919 ms). Cause unproven; no
test/timeout edits. Final full rerun without parallel Wrangler/build: 250 files /
5736 tests PASS, exit 0 / 490.18 seconds. Serial build, lint, typecheck, migration
smoke, syntax and diff PASS. Root reviewed frozen source/tests with no concrete
blocker. A first additional review attempt was unavailable; the later independent
frozen review completed with no blockers,331/331PASS (2.06s), ESLint/diff PASS and
all three file hashes matching the freeze. Shape/BUILD_ID and observed bytes are
proved, not semantic SW execution or complete HTML/JS bundle content.
PR51 head 93e3db2004c518af7694edd4db89e918510c5d72 passed hosted CI37452057402:
250files/5736tests (198.73s), lint/typecheck/migration smoke/build. PR remains OPEN
and held while diagnostics waits. This new documentation-only checkpoint still
needs final-head hosted CI; exact merged-main CI remains required after merge.
Local isolated recovery SQL probes did not complete (exit143/137); they provide no
import outcome or remote-cause proof. No credentials/remote mutation were used.

**Remote:** Staging 37384738093 FAILED after Worker publication and three exact
readiness observations: /sw.js had not embedded expected f2b. Failed body not
retained, actual prior SHA unknown. Protected authority step did not run; no new
recipeAuthority proof/canary exists. Later public SW/smoke converged. New native
CLI public GET-only rehearsal PASS at 2026-10-06T10:25:27.065Z: three exact pairs /
7907 ms. Separate /tmp manifest preserves the original artifact. This does not
certify protected 500/fingerprint or turn the failed workflow into a success.

**Production:** Recovery proved ledger 38/0038 and 7409664 database bytes, cloned
modules/runtime/bindings/assets, changed only three catalog variables to static/
0/false and confirmed 100% version 1a47f7f7-3d74-4801-b26a-b91f39c7942e.
Bookmark captured. Import then failed at BOOKMARK_AND_IMPORT with
IMPORT_OUTCOME_UNKNOWN_STATIC_OPERATOR_INSPECTION_REQUIRED /
ATTEMPTED_COMPLETION_UNCONFIRMED; no post-import certification or automatic rollback
ran. D1 commit state is unknown. Public readiness remains old 136cb6ff, healthy DB/
queue, static/0/false with fallback null. No 0039/new production application yet.
Artifact 11405412106 digest:
0963a326ff12c085ce62737096928dbb6d669485a432865cf5a31deaca9bea45.

**Next:** Obtain normal review for read-only 37450399162, inspect stable catalog/
ledger and resolve the unknown import state from evidence. Keep main fixed during
pending operations. Require independently certified V1/static/ledger 38/500/exact
fingerprint/integrity before 0039. Publish the validated asset PR; require final-head
hosted CI, merge after pending operations finish, then exact merged-main CI. Freeze
final SHA and restage shadow/1/5/25/D1 with T20=true. Production same SHA, T20=false:
guarded 0039, read-only certification, shadow, live synthetic AI, then 1/5/25/D1.
Normal production Environment approvals remain. No corrected live AI success claimed.

**Report:** [PRODUCTION_ASSET_CONVERGENCE_20261006.md](docs/ai/recipe-catalog/PRODUCTION_ASSET_CONVERGENCE_20261006.md).
Earlier checkpoint sections are historical, including previous waiting/in-progress claims.

---

# Production f2b rollout checkpoint - 2026-10-06 JST

**State:** Release incomplete; recovery37384670328 waits for normal independent
production Environment review by vn-taphoanhatung. Its exact-main/full-tree/CI
gate succeeded. CLIvn-tak cannot approve it. Main is frozen at
f2b00023ccb9a706d17ebe71321c0364a948ca75; merged PR50 final head
3f38acaca216bf8a6e6f0345b42129ae0a707623 is an ancestor with identical complete
tree0e5586fc77149c68633e7886b96c4579245a3801. Do not advance remote main while
recovery is pending/running. Operator authorizes production release/no real users;
user-data preservation certification is excluded.

**Changes:** Capacity414f449 uses verified query meta.size_after with the original
strict100MiB bound and fails before any pin/import if invalid. Worker API
compatibilityca91a1f validates observed annotations/AI project/runtime assets;
strict inheritance/module equivalence/full asset configuration equivalence before
traffic and after deployment remain enforced. Documentation checkpoint3f38aca.
PR50 merged normally at2026-10-05T22:39:23Z; no bypass or squash/rebase merge.

**Checks:** Final full local command (credentials removed)
TMPDIR=/private/tmp TZ=UTC WRANGLER_SEND_METRICS=false pnpm exec vitest run
--maxWorkers=1:249 files/5692 tests PASS, exit0,495.85s. Serial pnpm build PASS.
Final lint/typecheck/migration smoke/syntax/diff PASS. Capacity20/20 and observed
metadata51/51 PASS, independently rerun; no concrete release review blockers.
Hosted final-head CI37383072785 and exact-main CI37383852019 PASS, each249/5692
plus lint/typecheck/migration smoke/build. Main-push registration37383852122
succeeded with only the registration echo. Earlier capacity-only suite was
intentionally cancelled, exit130; initial concurrent build failure was followed
by standalone PASS without source changes, cause unproven.

**Remote:** Recovery37379695824 stopped before Worker pin/catalog mutation;
approved inspect37381283540 completed read-only and revealed the actual metadata
compatibility differences. Production still old136cb6ff, ledger38, D1 configured
but static fallback CATALOG_DIAGNOSTICS; DB/queue healthy. No V1 import/0039/new
production application yet. New f2b staging shadow37384738093 is in progress,
pairedT20true, intentional rollback=true from healthy prior b33 D1. Dedicated
staging agent owns shadow/1/5/25/D1; root owns all production operations.

**Live AI:** Corrected code remains unproved on production. Prepared script
/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py now
requires exact merged-main SHA, production shadow/0/cutoverfalse/globalstatic/
fallbacknull before guest/scan and after terminal ready. Offline syntax/17 guard
cases/DTO/unit fixture checks PASS. Scriptsha256
54933151ea09afaece4cc2cf4e7ed922e2ac7a313c8a27bd8e8a1d89b7c1d546.
No live invocation of corrected code yet. Exactly one synthetic upload, bounded
polls, no ambiguous-submit retry, sanitized evidence and logout remain required.

**Next:** Obtain actual approval for37384670328, verify its receipt rather than
assuming chat confirmation. Require V1_CATALOG_CERTIFIED_STATIC, old-source
static100%, ledger38,500/exact V1 fingerprint/integrity before guarded0039.
Then production read-only certification; finish f2b staging shadow/1/5/25/D1;
production samef2b shadow/T20false, live synthetic AI proof, then1/5/25/D1. Every
normal production Environment gate remains. Local rollout documentation is on a
separate branch; remote main must remain f2b until all pending operations finish.

**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](docs/ai/recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Earlier checkpoints are historical.

---

# Production D1 recovery compatibility checkpoint - 2026-10-06 JST

**State:** Release incomplete. PR49 merged normally at
`b33bd5a772d3ba165a6134751137c78482678186`; its final implementation head is
`6f5cd543e5b13dc2da32344975b8b48c55043baf`. Hosted PR CI37373658595 attempt2
and exact-main push CI37378906656 succeeded, each249 files/5653 tests plus
lint/typecheck/migration smoke/build. Registration-only37378906661 succeeded.
The operator authorizes recovery/migration/production deployment and confirms
no real users; user-data preservation certification is excluded.

**Remote evidence:** Recovery37379695824 was approved normally by
`vn-taphoanhatung` but failed at OFFLINE_PLAN_AND_PRE_LEDGER after verifying
identity and canonical38/0038 ledger. No Worker pin, catalog import or migration
ran. Artifact11373786998 has digest
`sha256:d0566283ce8969f7c741fd96fb994558892ff06a3188c10a7283bfe6003015a4`.
Read-only inspect37381283540 completed successfully after normal independent
approval. Status INSPECTED_READ_ONLY, mutations0, authorityVerifiedtrue,
latestEqualsActivetrue, active100%version1fe3fdae-0ffc-4f83-acb7-4aaecb3ea9c0,
compatibilityCode UNSUPPORTED_METADATA. Artifact11375730428 has digest
`sha256:8dd5b0de738265cd83fd11e49470898fdd302fb62185de7441c14f4eae71f810`.
Its safe schema reveals top-level annotations, AI binding project:string and
script_runtime.assets. Actual asset configuration values remain private.
Production still serves136cb6ff/d1-configured/static fallback with ledger38;
database and queue healthy. Catalog recovery/0039/new application remain pending.

**Changes:** Executable capacity checkpoint414f449 replaces unsupported page
PRAGMAs with meta.size_after from the already verified ledger query. Missing,
invalid or >=100MiB metadata stops before Worker inspection/pin/bookmark/import.
Cloudflare query metadata documents database bytes; pinned Wrangler3.114.17
retains this metadata. Actual production metadata availability is still unproven.
Worker executable ca91a1f accepts observed bounded annotations/AI project/runtime
assets. Full asset runtime equivalence is checked before traffic and after deploy;
unknown fields and changed behavior remain rejected.

**Staging:** Exactb33/T20true completed shadow37379785022, canary1 37380051888,
canary5 37380383487, canary25 37380656192, D1 37381006320. All succeeded with
500 recipes/exact V1 fingerprint/no fallback, paired flags and smoke. Final
Worker e3fceba8-ce27-4ef9-8e04-f76ce463b4c4; artifact11375060434 digest
`sha256:4d114b0700564a3d4325cfc3cad30880baa1ce301bb2c8ef9c4cf9bdc5df9c7d`.
A changed release must restart shadow with intentional catalog rollback=true.

**Checks/failures:** Capacity regression red16failed/4passed; green20/20PASS,
independently rerun. Four recovery suites75PASS, lint/typecheck/migration smoke
and diff PASS. Initial concurrent build failed with missing Service Worker build
token; standalone pnpm build passed (no source change). Cause is unproven; serialize
build with tests. Observed metadata regression red11fail/40pass; green51/51PASS and independent
rerun. Final lint/typecheck/migration smoke/syntax/diff PASS; independent reviews
find no blockers. Initial capacity-only fullsuite intentionally cancelled exit130
after26 files/1593 tests because the real inspect required another source fix;
that is not a full PASS. Frozen final candidate fullsuite is running; build follows
serially. Hosted final-head and exact merged-main CI remain required.

**Next:** Complete full local validation and the serial build, require green
final-head hosted PR CI, merge with a merge commit, then
require green exact-main CI and freeze main. Bind new restore-v1 attempt1 to that
main and its final PR head (ancestor/different SHA/identical complete tree), obtain
fresh normal production approval. Require V1_CATALOG_CERTIFIED_STATIC/ledger38/
500/exactfingerprint before guarded0039 and read-only certification. Restage the
same new SHA shadow/1/5/25/D1 T20true. Production shadow T20false, then live synthetic
AI proof before same-SHA1/5/25/D1. Existing unexecuted live smoke is
/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py.
**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](docs/ai/recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Earlier checkpoint sections are historical.

---

# Current — T21R-C2F semantic drift / identity forensic (2026-10-05 UTC)

Read-only forensic of production run 37202777157; receipt integrity PASS.

- Count model proven: structural V1_ID / UNREVIEWED_ING_ENR partitions, 65 =
  same-ID multi-row drift, recipe-scoped target ambiguity, C2S changed 26 targets.
- Production is an out-of-repository, enrichment-derived replacement population:
  neither V1 nor committed V2. Runtime fails closed to static.
- Status `T21RC2F_ADDITIONAL_DIAGNOSTIC_REQUIRED`; repair REPAIR_NEEDS_MORE_EVIDENCE;
  0039 relevance NONE; deploy NOT AUTHORIZED; T21G_NOT_READY.
- Next: independent review, then a separately authorized C2T hashed diagnostic.

Report: `docs/ai/recipe-catalog/T21RC2F_SEMANTIC_DRIFT_IDENTITY_FORENSIC.md`.

---

# Current — T21R-C2S schema boundary (2026-10-04 UTC)

Offline-only schema defect reproduced on certified main
`b9bc66acfe660329103c08be1f5cff90ed175aba` and fixed at `946a7be`: unique target
publication cannot carry competing candidates; preserve ambiguity and exact-tuple
witness compatibility without changing the closed schema. Actual validation
privately creates safe static section/field/keyword/code diagnostics; no raw Ajv
context, values or failure artifact upload.

Latest task-supplied run 37158525748: capture PASS, engine completed, schema
REJECTED, cleanup PASS, artifacts 0. Production/V1 relation UNKNOWN and actual
production failure condition unverified. Synthetic scale/reachability/privacy/CLI
PASS; focused 8 files / 420 tests PASS; full UTC one-worker 237 files / 5429 PASS;
lint/typecheck/in-memory migration smoke/build/diff PASS. Initial 600-second
full-command interruption recovered under an 1800-second budget; no coverage
or threshold was weakened.

All 73 bound entries retained; reviewed `95b1746819c4690d267985ce55cb0ba673373a95` rejects.
Capture/SELECTs/C4I/workflows/V1/runtime unchanged. Draft
[PR #41](https://github.com/vn-tak/Tako-san/pull/41) owns the exact final SHA and
fresh attempt-1 CI receipt. Auto-fix subscription is enabled; review must pin
an immutable head, never a moving branch. Next: independently review that exact
head after CI SUCCESS. Do not merge, rerun C2/C4I, repair, use production
credentials/SQL, change secrets/tokens, apply 0039 or deploy. Production counters
0; token scope UNKNOWN/read-only proof false; T21G_NOT_READY.
Report: `docs/ai/recipe-catalog/T21RC2S_SCHEMA_BOUNDARY_FORENSIC.md`.

---

# Current — T21R-C2D classification diagnostics (2026-10-03 UTC)

Six sanitized classification stages, static failure diagnostic, and separately
proven malformed-parent/aggregate fixes. Source run 37135187427 capture PASS;
production/V1 relation remains UNKNOWN because classification did not complete.
Focused 375 PASS; UTC full 235 files / 5384 PASS; lint/typecheck/migration smoke/
build/diff PASS. Hosted CI pending at docs checkpoint. Old C2 `a0d4bf9` review
authority intentionally invalidated; C4I/capture/SELECT/schema/V1 unchanged.
Next: independent exact-head review after fresh PR CI. No merge, C2/C4I rerun,
production SQL, repair, secret/token changes, 0039 or deploy.
Report: `docs/ai/recipe-catalog/T21RC2D_CLASSIFICATION_DIAGNOSTICS.md`.

---

# Current - T21R-C4L Wrangler parsed-stdout remediation (2026-10-03 UTC)

Draft PR only. `WRANGLER_LOG=error` hid Wrangler 3.114.17 whoami/d1 list/d1
execute stdout parsed by C4I/C2; now `log`, still piped. Historical account
conclusions of 37124563415, 37128183771, 37084988593 invalidated; secret
correctness UNVERIFIED_PENDING_FIXED_C4I. Old C4I/C2 reviewed SHAs reject the new
head as intended. Next: independent review of both surfaces. No dispatch, merge,
SQL, secret change, 0039 or deploy. Report: `docs/ai/recipe-catalog/T21RC4L_WRANGLER_PARSED_STDOUT_REMEDIATION.md`.

---

# Current - T21R-C4I independent-review remediation (2026-10-03 JST)

Draft PR #38 only. Remediated 2 P1 (C4I reviewed-byte/exact-main-CI gate;
independent production approval validation before Cloudflare credentials) and
2 P2 (C2 account syntax parity; evidence-limited command/response statuses).
Focused C4I+C2 340/340 PASS; full UTC run 234 files / 5,303 PASS; lint,
typecheck, migration smoke, build and diff PASS. C2 73-path bytes untouched.
Next: push additive commit, verify fresh exact-head PR CI, then independent
delta review. Production diagnostic/C2 rerun/Environment approval/SQL/secret
mutation/0039/deploy remain stopped; token scope UNKNOWN. Do not merge.

---

# Current — T21R-C2 PR #36 hosted CI-history remediation (2026-10-02 UTC)

Same branch/PR36, verified pre-fix head `3e1bb60b`. Actual old run `37002486858`
/ job `110823126447` used depth-1 synthetic-merge checkout; missing historical
Git object caused capture test setup `T21RC2_LEDGER_CHANGED`. Offline reproduction
confirms it; full local history meets the unchanged 39-repository/38-production
ledger contract. CI now `fetch-depth: 0` with a static regression, no guard,
version, production workflow or bound-path-list changes.

C2 229 / focused 538 / full 230 files, 5,192 PASS; lint/typecheck/local migration
smoke/build/syntax/diff PASS. Exact commands are in the scoped report. One narrow
normal push authorized, then verify the new exact-head hosted run; stop if it
fails. Bound CI change invalidates the old review: independent delta review and
renewed PR approval required before merge. No production/Cloudflare/approval/
apply/deploy, T21G_NOT_READY, repair NOT_AUTHORIZED, 0039/deploy STOPPED.
Report: `docs/ai/recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# Current — T21R-C2 review-binding remediation only (2026-10-02 UTC)

**Status: `T21RC2_REMEDIATION_READY_FOR_REVIEW`.** Same published C2 branch,
reviewed parent `8d8028f3`, repository `1385308553` / `vn-tako4/Tako-san`.
P1 adds ancestry + exact reviewed byte closure (73 paths), rejects reviewed SHA
equal to ref, and rechecks before capture credentials/final publication. P2
receipt clarifies SELECT-only execution versus unproven token permissions.
Workflow/classifier/schema/target/capture/T19/T20/runtime unchanged.

Focused PASS: 537 tests, C2 228; full single-worker PASS: 230 files / 5,191.
Lint/typecheck/local migration smoke/build/syntax/diff PASS. Real-Git A–L and
all 73 bound changes tested; no timeout/assertion weakened. No production,
Cloudflare, approval, apply, restore or deploy; no PR/merge/delivery configuration.
Normal push of one tested remediation commit is authorized, then independent
delta review before opening any PR. `T21G_NOT_READY`; repair NOT_AUTHORIZED,
0039/deploy STOPPED; delivery `UNCONFIGURED`.
Exact closure/rationale/failures: `docs/ai/recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# Current — T21R-C2 executable protected row-read (2026-10-02 UTC)

**Status: `T21RC2_IMPLEMENTATION_READY_FOR_REVIEW`.** Correct branch
`codex/t21rc2-protected-production-row-read`, certified base
`518818458a354c5e180da52ae9bb73c9d3c1af78`, repository `1385308553` / `vn-tako4/Tako-san`.
Actual dispatch-only workflow/four scripts/four suites implemented; existing
classifier/schema and T19/T20 untouched. Verified executable checkpoint `ad7b3012`
normally published with exact local/provider equality; no PR or merge.
Old local `9542e112` is preserved and excluded, not C2 implementation or ancestry.

Focused PASS: 8 files / 455 tests (C2 146, predecessor 73, release-check 236).
Full `pnpm exec vitest run --maxWorkers=1` PASS: 230 files / 5,109 tests.
Lint/typecheck/local migration smoke/build/syntax/diff PASS; independent agent
review found no material defect. Initial setup/integration failures are recorded;
no timeout/assertion weakened. Production/Cloudflare calls/dispatches/approvals/
mutations/applies/restores/deploys: 0. Row delivery `UNCONFIGURED`.
Next: independent review of the actual executable implementation before any
production authorization. `T21G_NOT_READY`; repair NOT_AUTHORIZED, 0039/deploy STOPPED.
Exact checks/options/failures: `docs/ai/recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# Current — T21R-C P1-only remediation (2026-10-02 UTC)

Reviewed parent `32ab51d`, branch `codex/t21rc-row-level-reconciliation`;
repository `1385308553` / `vn-tako4/Tako-san`. Explicit balanced-tuple
satisfaction and direct V1-over-bridge precedence; six regression cases added.
`T21RC_REMEDIATION_READY_FOR_REVIEW`: 57 T21R-C / 73 focused PASS, all other
required local gates PASS; full single-worker suite PASS, 226 files / 4,963 tests.
No schema/taxonomy/runtime/authority/workflow/
migration/dependency change, PR or production operation.
Next: independent delta review of the single normally published remediation
checkpoint after `32ab51d`; no self-approval or production preparation.
`T21G_NOT_READY`; repair/0039/deploy STOPPED.

---

# Current — T21R-C protected row evidence (2026-10-02 UTC)

**Status: `T21RC_OFFLINE_DESIGN_READY`.** Offline classifier/schema/read design completed on
`codex/t21rc-row-level-reconciliation` from verified `a828b6354e29d89268a3d11c874158eb5ecb997c`,
repository ID `1385308553` (`vn-tako4/Tako-san`). Focused 67/67 (51 new + 16
regressions), offline source/CLI/Ajv checks, lint/typecheck/local migration
smoke/build/diff PASS. Full two-worker suite: 4,956 passed, one existing
5-second certification test timeout; final unchanged one-worker full run PASS,
226 files / 4,957 tests. Verified local implementation checkpoint `ec24101`.

Run `36943692146/1` aggregates accepted for review; admin-bypass exception is
separate (approval history `skipped` by `vn-tako4`). No new production read,
raw-row upload, mutation, restore, migration/0039 apply, deploy, flags, push,
PR or merge. V1 remains authority; `T21G_NOT_READY`; repair/0039/deploy STOPPED.
Next: independent human/privacy/governance review
before a separately authorized normal-reviewer protected read. Details/checks:
`docs/ai/recipe-catalog/T21RC_ROW_LEVEL_RECONCILIATION_DESIGN.md`.

---

# Current — T19 cooking hard-restriction hotfix (2026-09-28)

**Status: `T19_COOKING_HARD_RESTRICTION_HOTFIX_READY_FOR_REVIEW`.** Branch
`fix/t19-cooking-hard-restriction-bypass` from `85660fa`. cook/start +
cook/complete now enforce canonical hard restrictions (422
`HARD_CONSTRAINT_CONFLICT`, fail-closed). Deploy/D1/migration/secret/config: NO.
Staging stays canary 1%. Next: PR + review/merge; do NOT promote canary.

---

# Current — T19-R0 staging D1 runtime readiness certifier (2026-09-27)

**Status: `T19_STAGING_D1_RUNTIME_READINESS_FIX_READY_FOR_REVIEW`.** Deploy/D1 mutation/T20/authority: NO.
Read-only staging certifier + workflow on `61bf805`. Wait for review/merge;
do not dispatch until exact-main CI.

---

# Current — T20-R1 staging release observability (2026-09-27)

**Status: `T20_RELEASE_OBSERVABILITY_FIX_IN_REVIEW`. Deploy/T20/production: NO.**
Staging now captures and proves the serving recipe-authority Worker before
deploy; the post-deploy proof retries only that exact previous Worker and still
requires the exact release commit to pass (ADR-034).

---

# Current — T20 staging rollout preflight (2026-09-27)

**Status: `T20_STAGING_BLOCKED_RELEASE_OBSERVABILITY`. T20 enablement: NO.**
Main `0b2e0a17…`. Staging 0039 certified. Local T20/runtime gates PASS.
Do not dispatch Deploy (`meal_composition_v2_enabled=true`) until staging
`/health/recipe-authority` commit matches this SHA (failed on `36285175574`).

---

# Current — Staging D1 0033→0038 historical catch-up (2026-09-26)

**Status: `STAGING_D1_0033_0038_CATCHUP_PR_READY`. Remote D1 mutation: NO.**
Branch `feat/staging-d1-catchup-0033-0038` from `origin/main` `8147dde`.
Implementation `718abef`.

- [done] Dedicated staging-only historical catch-up workflow and checker.
- [done] One migration per run; prefix isolation excludes 0039.
- [done] Local 0033–0038 replay certified.
- [done] Existing 0039 staging migrate workflow left authoritative for 0038→0039.
- [done] Review remediation: full pre-state checkpoint certification blocks
  mutation on 0034–0037 checkpoint drift; apply-gate; repository id required.
- [open] PR review/merge. No remote catch-up dispatch until then.

Next authorized step after merge: dispatch target=0034 only, inspect receipt,
stop. Do not chain 0034–0038 automatically.

---

# Current — Ingredient icon pack v2 (2026-09-27)

**Status: `ICON_V2_IMPLEMENTED_LOCAL_GATES_RUNNING`. Remote systems:
`UNTOUCHED`.** Branch `feat/ingredient-icons-v2` from `origin/main` `8687ff9`.

- [done] Audit old `getIngredientImage` if-chain on real data: 43.3% tomato
  fallback, 18/48 PNGs unreferenced, mis-matches (cá lóc→salmon, dầu mè→oil,
  trái bơ→butter).
- [done] Add 39 new transparent PNGs to `public/frigo/ingredients/`
  (15 vegetables, 16 pantry, 8 generic category icons).
- [done] Add 214-rule `src/web/lib/ingredient-icon-rules.json` (single source
  of truth, ordered most-specific-first) + rewrite `ingredient-images.ts` as
  data-driven matcher (exact ID → Vietnamese substring → unaccented
  word-boundary → category fallback → tomato last resort).
- [done] Fix phase-1 ambiguous bare keywords: unaccented input no longer
  matches `me`/`chao` ("Me"→category-other, not tamarind).
- [done] Pre-PR semantic audit of grouped keywords (ngao→seafood,
  hương thảo→spice, pate→meat, đá viên→water…): all land on truthful
  category icons; kept.
- [done] `tests/unit/ingredient-images.test.ts` (7 tests): ordering,
  unaccented, no-guess, fallback, backward compat, asset existence on disk.
- [done] `pnpm typecheck` PASS, `pnpm lint` PASS, `pnpm build` PASS,
  `pnpm check:migrations` PASS, focused vitest 7/7 PASS,
  `vitest run tests/unit` 116 files / 2,460 PASS (pre-rebase),
  post-rebase 119 files / 2,478 PASS (incl. 18 new PR #12 tests),
  integration chunk 1 (22 files) 1,138 passed / 8 skipped.
  Sandbox confirmation gates stop long local runs; remaining integration
  chunks go through hosted PR CI (no integration/e2e test covers icons).
- [done] PR #13 opened (`feat/ingredient-icons-v2` → `main`,
  head `95e21c2e`), body lists local gates + reviewer `vn-taphoanhatung`.
- [monitoring] Hosted exact-head CI on PR #13 — final full-suite gate.
- [blocked] Merge/deploy: needs Tun bee's separate approval. Not doing it here.

Next authorized step after local gates: commit and open the PR; reviewer
decides merge. Then the icon upgrade ships with the normal release train.

---

# Current — Recipe Content Refresh V2 canonical source (2026-09-27)

**Status: `RECIPE_REFRESH_V2_CANONICAL_SOURCE_READY`. Remote systems:
`UNTOUCHED`.** Branch `codex/recipe-content-refresh-v2-canonical` starts from
`origin/main` `c81d6da2b3a9c051270b97953bfbb2c5aa34d057`; pushed implementation
checkpoint is `fc5e713e10e0b63c890ba31fc29d9678be896ed7`.

- [done] Audit ZIP hash
  `ebc18f06ee7fb4498f8cd2a7886f333a85b385f32af4407ae1b44b4ec3cc06fe`:
  500 recipes / 500 unique expected IDs, 4,938 steps, 6,766 ingredients, 15
  root schema variants, 1,102 source references, 289 numeric and 211 null
  nutrition profiles.
- [done] Normalize all 500 recipes to the strict canonical V2 schema under
  `data/recipe-refresh/v2`; preserve qualitative/process truth without making
  RuntimeRecipe quantities nullable or inventing measurements.
- [done] Reconcile 2,515 ingredient rows (505 existing, 1,642 new reviewed,
  368 aliases, 0 ambiguous/invalid); classify 166 process-only and 7
  mixed-process rows; project 3,770 rows and exclude 2,996 unsafe rows.
- [done] Re-audit nutrition: 353 candidates, 1 publishable, 288 blocked, 211
  truthful null. Salt beds, frying media, discarded/process liquids, and
  unresolved absorption are not counted as fully consumed.
- [done] Add deterministic `pnpm recipe:refresh:check`, strict parser,
  RuntimeRecipe projection, real catalog fingerprint, machine audit artifacts,
  targeted 11-test regression suite, ADR-032, and `AUDIT_REPORT.md`.
- [done] Pin canonical artifact SHA-256
  `fc7eefe6573ee9de1083728db1f34b058954fa60ff478f7c5e41dce9e4570dbe`
  and runtime fingerprint
  `6d0e3eb85696bb7c31bc54ac62783bc94432aaf008028eca79b17041f3eaed87`.
- [done] Final local gates: refresh/import checks, typecheck, lint,
  `git diff --check`, focused 11/11, and `pnpm check` PASS; full Vitest 204
  files / 4,591 tests. Sparse-checkout initially omitted tracked `public/`;
  restoring that tracked directory fixed the unrelated CSP/PWA asset failures.
- [pending] Open PR, require hosted exact-head CI and independent review. Do
  not merge, deploy, create 0040, mutate D1/R2, change recipe authority, or
  enable T20 in this task.

Next authorized release task: generate the Content Refresh V2 manifest and
`0040_recipe_content_refresh_v2.sql` from this canonical package, then certify
staging before any production rollout.

---

# Historical takeover receipt - 2026-09-23

**Status: `T19_V2_CODE_COMPLETE_PRODUCTION_BLOCKED`. Production: `UNTOUCHED`.**
Repository ID `1368281478` is `vn-tako4/Frigo-dev`. Application PR #53 merged
normally at `03005fcbc39ab3c964393d2091f726088a4be5d0`; exact-head PR CI
`35810551334` and exact-main CI `35810986000` both PASS (189 files / 4,367 tests).
Integration reviewed head is `dbf32547a07fbc767e044365866a2bdfc4264cd8`; the
original recovery branch remains immutable at `0a04209e512d19293ed56a19d3fd51eb29ffefcd`.

Rechecked after the external merge: main remains `03005fc` and preserves the
exact recovered checkpoint. PR #54 carries this documentation-only handoff;
the application must not be reconstructed or republished as another PR.
Production D1 certification is blocked: this workspace has no Cloudflare API
token and `pnpm wrangler whoami` reports unauthenticated. Earlier takeover
evidence recorded missing GitHub verification secrets. Current repository and
Environment secret/variable listings return HTTP 403, so their present contents
cannot be independently verified here; Worker-side presence remains unverified.
Automatic staging run `35811338820` failed BEFORE deployment on the missing
staging verification secret; its production job was skipped. No deployment,
migration, secret change, rollout or rollback was performed.

See `docs/ai/recipe-catalog/T19_V2_TAKEOVER_AUDIT.md` for evidence and operator
steps. Provision the release prerequisites, certify production read-only, then
use the reviewed rollout workflow and prove rollback. T19 is NOT complete;
T20 remains blocked. Earlier pending/publication-blocked claims below are
historical and superseded by this receipt.

---


**Current: T19_V2_APPLICATION_INTEGRATED_CI_PENDING.**

## T19 V2 — recipe authority cutover (integration 2026-09-22)

Repository ID `1368281478` resolves to `vn-tako3/Frigo-dev`; current main is
`a3b1564`. The immutable original branch is published at expected head
`0a04209`, and application checkpoint `558be74` is integrated onto
`feat/t19-recipe-authority-cutover-v2-integration` from current main. PR #52 is
merged historical safe-stop documentation.

- [done] Focused authority/planner/release/shopping/cooking/inventory suite: 13
  files / 356 tests PASS; full Vitest 188 files / 4,333 tests PASS; D1 release
  certification 23/23 plus the 500-recipe/tip-0037/integrity fixture PASS; lint,
  typecheck, migration smoke, 500-recipe import check and build PASS.
- [done] Final safety review: static planner identity excludes hidden D1-only
  families/ingredients/diagnostics; evidence requires Bearer auth; production
  transition preflight is monotonic and auto-restores the exact prior Worker on
  failed deployment proof.
- [done] Two review passes fixed: same-source authority drift, incomplete
  rollback proof, missing Cloudflare/D1 identity + catalog/integrity
  certification, fabricated canary readiness, unfenced D1 families, shadow
  promotion without D1 proof, backwards SHAs, cancellation bypassing rollback,
  unverified staging. Full Vitest 189 files / 4,364 PASS on the current tree.
- [blocked] Integration publication: push rejected — GitHub App credential
  lacks `workflows` permission. Branch commits `8205883` + `553791a` + docs
  are preserved locally with workspace-only bundle/patch artifacts. Owner
  push with a capable credential unblocks; then the application PR and
  exact-head hosted CI/review.
- [pending] Normal merge, exact-main certification, production identity/catalog
  checks, release-secret provisioning, staged rollout and rollback proof.
- [untouched] Production: no D1 query/migration, secret/config mutation, deploy,
  rollout or rollback. T20 is blocked until `T19_COMPLETE`.

Canonical handoff: `docs/ai/recipe-catalog/T19_V2_WIP_HANDOFF.md`.

- Exact repository/base/production: `1368281478`, `vn-tako1/Frigo-dev`,
  `66627ffea890dad1cec4e31674449775a940c660`.
- Isolated branch `feat/t18e-otp-email-delivery-recovery` is pushed; Google
  Sign-In files and behavior are untouched.
- `SEND_EMAIL` and the operator-authorized `RESEND_API_KEY` secret are present;
  the supplied key authenticates. The operator completed DNS correction and
  Resend reports the domain plus all three sending records as verified. Current
  Cloudflare sender authority and primary failure category remain UNKNOWN.
- Provider recovery is hardened and tested: Workers Email -> Resend -> fail
  closed, sanitized categories/logs, production invalidation on every delivery
  failure, and honest readiness semantics.
- Focused 165/165 and full Vitest 185 files / 4238 tests PASS; lint, typecheck,
  migration smoke and build PASS. No migration, workflow or production change.
- Review-only PR #50 is OPEN; hosted validate `35685553412` passed on
  publication head `eec404a` and the PR was `MERGEABLE` / `CLEAN`. Require
  fresh exact-head CI after the final docs receipt; do not merge or deploy.
- Next: operator verifies the fixed sender in Cloudflare Email Service,
  supplies an authorized inbox, and runs
  controlled staging then separately authorized production delivery checks.
  Evidence: `docs/ai/T18E_OTP_DELIVERY_RECOVERY.md`.

**Previous: T18D_READY_FOR_REVIEW.**

- T18D implementation freeze: `d3ef61c`, from exact base `07ace57241f8270b2458610979c709bb69b9a65a`.
- Four original findings and **seven** additional scoped P2s fixed;
  independent review open P0/P1/P2 = **0/0/0**; two P3 observations deferred.
- 27-screen human-style review: **14 PASS / 13 PASS_WITH_NOTE / 0 FAIL**.
- Focused browser: **14/14 PASS in 42.8s**, strict axe clean. Final repository
  logs pass: **185 files / 4226 tests in 333.25s**.
- Settled full matrix: **349 PASS / 5 intentional skips / 0 FAIL**, 354 cases
  in 23.3m; all **84 T18D cases PASS**, strict axe violations **0** across 162
  canonical checks. Duplicate breakpoint project instances alone skipped.
  `.hoplite/artifacts/t18d/final/matrix-settled.log` and
  `.hoplite/artifacts/t18d/final/matrix-settled/`. The prior matrix stopped
  near case 158 on pre-settle scan-review opacity/receipt enable sampling;
  parent added a 350ms wait after async CTA enable, with no axe/token changes.
- Fresh style **39/0**, contrast **33/33**, lint/typecheck/diff checks PASS.
- Review-only [PR #49](https://github.com/vn-tako1/Frigo-dev/pull/49) OPEN;
  publication checkpoint `fe1b5d4` pushed; auto-fix enabled, auto-merge disabled.
- Next: hosted CI/review settlement. Initial `validate` IN_PROGRESS in run
  `35677663372` at 01:57 UTC; no unresolved threads then.
  No merge/deploy. VoiceOver/NVDA NOT PERFORMED.

## Historical T18C receipt

**Previous: T18C_READY_FOR_REVIEW**, application freeze `6f8f6f4`.

- [done] 27/27 source-backed direct comparisons at all six widths: **2 PASS /
  25 PASS_WITH_DOCUMENTED_DIFFERENCE**, zero unresolved P0/P1/P2.
- [done] Browser **379 PASS / 11 intentional skips / 390 unique cases**;
  162 canonical + 449 regression screenshot files, zero strict axe/overflow.
  Five outer-timeout cases recovered; prior failures retained, not hidden.
- [done] Final lint/typecheck/full Vitest (**184 files / 4222 tests**), migration
  smoke/build, style (**39/0**), contrast (**33/33**) and diff checks PASS on
  the final implementation. Protected business/backend boundaries unchanged.
- [done] Review-only [PR #48](https://github.com/vn-tako/Frigo-dev/pull/48)
  opened; CI/review auto-fix enabled, auto-merge disabled.
- [done] Hosted `validate` SUCCESS on `289d80a` (run `35578662531`); final
  readiness audit clear, no unresolved threads or new migration/configuration
  action. Style/contrast/diff rechecks PASS; no application changes.
- [pending] Owner merge permission after latest documentation-head CI stays
  green. Human VoiceOver/NVDA not performed; auto-merge disabled.
  No merge, deployment or T18D.

Exact commands, failure ledger, evidence and next action:
[certification](docs/ai/T18C_VISUAL_CERTIFICATION.md),
[handoff](docs/ai/HANDOFF.md),
[evidence index](.hoplite/artifacts/t18c/EVIDENCE.md).

## Historical continuation checkpoints (superseded)

Final combined browser run: **378 passed / 11 intentional skips / 1 failed**.
Home 1024px/200%-text overflow was a real P2; rem-based wrapping replaces the
fixed two-column breakpoint. Original zoom gate plus explicit stacking check:
**12/12 focused PASS**. Complete post-correction browser/repository reruns next;
the failed run stays separate as `pre-zoom/`. No readiness/PR claim yet.

**Repository gates PASS on application freeze `b024b0d`: 184 files / 4222
tests**, lint/typecheck/migrations/build/diff, style 39/0 and contrast 33/33.
Final browser matrix and post-fix visual review are running; review-only PR next.

Explicit native target bounds passed the unchanged strict accessibility gate
and focused keyboard/Week flow: 14 PASS / 1 intentional project skip.

Review correction: removed no-op non-recipe Week title actions; unit red/green
and flag-off route test pass. Independent re-review is clear. Fresh full gates
and 390 browser cases replace the intentionally interrupted 384-case attempt.

Keyboard closure checkpoint: native row/shell/Week actions and shopping
checked-state semantics verified by 37 focused unit tests and 12+1 browser
passes. Full gates and the unfiltered 384-case browser run are underway;
failure history remains in the handoff. No merge/deploy/T18D.

All 27 identities have now been compared directly. Localized source-led fixes
passed targeted browser gates (43 + 18 + 1 passes; five intentional project
skips) and typecheck. Full final certification is next; see the current
[handoff](docs/ai/HANDOFF.md) for diagnostic failures and preserved evidence.

## T18C — final redesign certification — SAFE PAUSE (2026-09-21)

**STATUS: `T18C_PAUSED_SAFE`** — implementation halted by owner instruction.
- Branch `feat/t18c-final-redesign-certification` from exact base
  `b8447e85f099b800a9a8ebc6c4c137adc9e45a32`; checkpoint A `ac4d90e` pushed
  (162-screenshot baseline). Approved OS boards unavailable:
  **DIRECT_BOARD_COMPARISON_PENDING**; 0/27 board comparisons.
- Evidence-led semantic fixes applied; final rerun pending. Resume:
  [T18C_WIP_HANDOFF.md](docs/ai/T18C_WIP_HANDOFF.md). No merge or deployment.

## T18B — payment authority unification — `T18B_READY_FOR_REVIEW` (2026-09-21)

- Final review P1 fixed from expected `0926222` on the same branch/PR: price
  table → new offers only; issued intent → immutable per-order authority;
  signed callback → persisted-order match; entitlement → valid persisted paid
  intent only. Operational 49000/499000 prices and all checkout fences retained.
  Focused **151/151** (65 server payment), full **183 files / 4217 PASS**, browser
  **48/48**, lint/typecheck/migration smoke/build/diff checks PASS. Exact commands,
  failures/recovery and new-head CI boundary are in the report. No migration,
  auth, inventory, OCR/planner or workflow change in this final fix.
- Repository `1368281478` / `omin-jp/Frigo-dev`; exact base/main
  `13ff3f22082fc0601a81b90c96edded4741194ac`; branch
  `feat/t18b-payment-authority`; review-only PR #47 OPEN, auto-fix enabled and
  auto-merge disabled. No merge/deploy performed.
- Server-owned prices retained: monthly 49000 / annual 499000 VND; plan-only
  checkout, signed provider/QR contract, owned status and once-per-intent grants.
  Legacy secret grants retired; fresh same-owner `/me` confirms Plus.
- Pushed checkpoints `2aba91a`, `c00ea9f`, `1cef30b`, `1aabd32`; focused tests
  121/121, browser 48/48 plus error-state rerun 4/4, lint/typecheck/migration smoke/
  build PASS. First full run's single style failure was corrected in source;
  regression 38/38 and complete rerun **183 files / 4185 tests PASS**.
- Independent review: remaining P0/P1/P2/P3 all 0. Migrations 38/0 changes;
  T18A OTP, Inventory Truth, OCR/AI, recipe/planner/Week and Cloudflare infrastructure
  unchanged. No real payment. Live provider setup requires separate authorization.
- Readiness follow-up: CI `35554499704` passed at `2d6ff5a`; no review threads.
  Corrected deployed image CSP for VietQR and removed the obsolete payment-secret
  warning, without changing Wrangler bindings/workflows. Regression red/green,
  focused 104/104, browser 48/48 with production image policy, lint/typecheck/
  migration smoke/build/header parity/full-diff check PASS. New-head CI is
  verified separately on the PR before readiness; see the report for exact commands.
- Next: owner review/merge permission once final-head CI is green; no local blocker.
  [Exact authority maps, contract, commands and failures](docs/ai/T18B_PAYMENT_AUTHORITY_REPORT.md).

## T18A — auth resend expiry contract — `T18A_READY_FOR_REVIEW` (2026-09-21)

- Repository ID `1368281478` now resolves to `omin-jp/Frigo-dev`; base/main
  `51d0d3755d83b64185066228d98f44ab7bad5e3c` unchanged. New branch
  `feat/t18a-auth-resend-expiry-contract`, review-only PR #46 OPEN; auto-fix
  CI/review subscription enabled. Not merged or deployed.
- Pushed server `88096cb7fbea8e3b95f5627ff5a46e8c3d34b462`, client
  `47c3a3391e086caf2760b61ee4e2bfacd331cacf`, security-fixture
  `53f9fefdc9d935bb736a37cdcd9f5b0d0479685e` checkpoints.
- Resend now returns storage-authoritative `expiresInMinutes`; client no
  longer guesses. Reset policy remains generic; malformed/delivery/offline
  failures remain honest; security/T17B lifecycle invariants preserved.
- Final auth/security 300/300, full Vitest 180 files/4117 tests and six-viewport
  browser auth 42/42 PASS; lint/typecheck/migration smoke/build/diff checks PASS.
  Chromium dependency repaired; initial full-suite timeout recovered with a
  passing extended full run (two workers, no filters).
- Payment/billing/production/migration behavior unchanged. Next: final-head
  hosted CI and human review, never merge/deploy from this task. No local blockers.
  Exact commands, failures, SHA receipts and Worker diff explanation:
  [T18A report](docs/ai/T18A_AUTH_RESEND_EXPIRY_REPORT.md).

## Current — T17B contract reconciliation `T17B_COMPLETE` (2026-09-20)

- Branch `feat/t17b-contract-reconciliation`, exact base `858759f`, application
  HEAD `0f358f2`, certification checkpoint `00594eb`. Corrective checkpoints
  `8b0f050`, `9a94afb`, and `0f358f2` preserve all server-owned preference and
  verification state; `00594eb` measures registry layout after finite motion.
- Route-driven onboarding 04–06 exposes exactly seven cuisine and nine
  restriction choices (both include canonical `other`) while round-tripping
  authoritative values outside those chips, including `italian` and
  `vegetarian`. Authenticated completion waits for server confirmation; the
  preserved offline-guest path intentionally commits locally. Verification
  exit resets loading; server OTP/session authority and independent spicy-level
  truth remain intact.
- The current 27-screen registry uses reviewer-verified contracts. Focused auth
  is 102/102, verify/onboarding is 39/39, full Vitest is 180 files/4087, T13 is
  60/60, automated accessibility is 12/12 across six viewports, and the clean
  T17 matrix is 216 pass/6 intentional skips.
- Post-review fix `56fc01b`: screen 06 is a native `today`/`week`/`both` goal
  group (client-only, never sent to `/preferences`; `week` → `/week/setup`) and
  stored household size `6..20` round-trips unchanged. Reran: focused 87/87,
  Vitest 180 files/4094, registry 18/18, full T17 216/6/0, lint/typecheck/
  migrations/build/diff-check PASS.
- Residuals are 43/43 protected-payment allowlisted with 0 unjustified;
  contrast is 33/33. Worker/payment/migration diffs are zero.
- Visual source: `.hoplite/artifacts/t17-playwright/final-00594eb-clean/`;
  validated package: `.hoplite/artifacts/t17b-final-visuals-00594eb.zip`
  (232 entries, 180 PNGs; SHA-256 `d6f6d4f032c0ac637ce5d1523ecc95b1411bc567538bca8d235a7131e6ad9d70`).
- Corrective documentation checks pass: whitespace, required markers,
  protected-boundary zero diffs, ZIP integrity, and all 180 JSON/TSV screenshot
  records and hashes. The first ad hoc validator expected the wrong command
  field; the corrected `generatingCommand` check found no artifact defect.
- Managed Preview was recovered from an inferred `pnpm dev` path that lacked the
  isolated API to `node scripts/security-preview.mjs`; tracked settings were
  restored unchanged. Exact remote checkpoint `f901b02` passed supported
  synthetic reset/login and screens 04–06 at 390x844 with no page errors.
- Replacement PR #45 opened against exact main `858759f` from `f901b02`; its
  auto-fix CI/review loop is enabled and PR #44 remains untouched. At publication
  head `1cacd0b`, hosted validate run `35532565549` passed, GitHub reported
  `MERGEABLE / CLEAN`, and reviews, review comments, conversation comments, and
  unresolved human feedback were empty. The final merge-readiness pass reran
  focused auth/onboarding/session tests 74/74, changed-file ESLint, typecheck,
  artifact integrity, protected-boundary checks, and whitespace checks.
- No T17B merge or staging/production deploy occurred. Once the
  documentation-only readiness checkpoint retains green/CLEAN exact-head
  provider status, the authorized user may decide whether to merge PR #45.
  Direct board comparison
  and NVDA/VoiceOver remain pending with no named assignee or tracking issue;
  `HUMAN_SCREEN_READER = NOT_EXECUTED`.
- `PRE-EXISTING PROTECTED AUTH-CONTRACT BLOCKER`: registration reports a
  10-minute lifetime, but resend returns no fresh expiry metadata. A server/API
  owner must resolve that separately; the client honestly records unknown.
- `PRE-EXISTING PROTECTED PAYMENT-AUTHORITY BLOCKER`: frontend/QR prices remain
  `599000`/`79000`, while payment-intent authority remains `499000`/`49000`;
  the VietQR amount comes from a frontend prop instead of the server intent.
  This requires a separate owner-authorized payment follow-up; T17B made no fix.

## Previous T17 — Takosan UI V2 certification pass, `T17_PARTIAL` (2026-09-19)

- [done] `/auth/verify` real route over the existing OTP state machine; tab-scoped code-free context; honest empty state; 14 regression tests.
- [done] 27 registered screens certified per width (`t17-registry.e2e.ts`).
- [done] Semantic-token migration: 991 sites; residual audit 43/43 allowlisted (payment UI only), 0 unjustified; zero emerald/transition-all/animate-in; arbitrary hex removed.
- [done] WCAG-AA: contrast 33/33 measured; axe 0 serious/critical on 25 surfaces; zoom re-enabled; h1/alt/44px/dialog semantics/OTP announcements verified.
- [done] Reduced-motion certification on auth, onboarding, sheet/dialog, cooking, planner, scan review.
- [done] Canonical `scan-review` + 8 more surfaces captured; state matrix evidenced; visual review fixes applied.
- [done] Gates at final HEAD recorded in `docs/ai/T17_UI_V2_REPORT.md` (lint, typecheck, vitest, migration smoke, build, T13 suite, six-width T17 matrix, greps, worker diff 0).
- [limit] Kit ZIP absent in sandbox: boards/`screens/*.md`/`SCREEN_REGISTRY` comparison outstanding; registry reconstructed in `tests/e2e/t17-ui/screen-registry.ts` with per-row source tags.
- [next] Holder of the ZIP: compare preserved captures against the three boards, diff `screen-registry.ts` vs `SCREEN_REGISTRY`; run a screen-reader walkthrough; then flip to `T17_COMPLETE`.
- [safety] `main` untouched; no merge; no deploy; production untouched; PayOS/worker zero-change.

## Current T16 — PWA cache and Google recovery deployed (2026-09-19)

- [done] Root cause: live `/auth` + `/sw.js` cache hits, wrong `_headers` worker path, fixed `takosan-pwa-v2` cache; clean Chromium proves real Google GIS works.
- [done] Release-SHA worker/cache, best-effort stale-client navigation after claim, correct no-store/immutable headers, Google numeric width + retry recovery, and exact-SHA deploy smoke implemented.
- [done] Independent review remediated; local Wrangler effective headers and two-release Chromium update PASS.
- [done] Full gates: **178 files / 4046 tests**, lint, typecheck, migration smoke, build, shell syntax, diff check.
- [limit] Reload/reopen/navigation is the reliable recovery boundary for legacy tabs that are closed, suspended, or blocked from running Service Worker code.
- [done] PR #42 / exact-head CI `35415335137`; merge main `6a016f1...`; exact-main CI `35415536459`; staging `35415763483`.
- [done] Production Deploy `35415843682`, Worker `2f228dc9-d97b-4eb1-8cff-9a0f2df3b51c`, D1 38/0038, recipe `shadow/0/false`.
- [done] Live exact-SHA readiness, no-store shell/worker, immutable assets, Google popup and exact-SHA Service Worker/cache verified.
- [next] Capture one manual real-inbox OTP receipt without exposing the code.

## Current T15C-D — production 1% Canary certification — safe stop (2026-09-19)

- [done] Canonical repo/main verified: `1368281478`, `frigo-6/Frigo-dev`, `347b536950cf54d25a2d6a880c3c2cb3d8c8f329`; PR #38/#39 merged.
- [done] Exact-main CI `35409762462` and staging Deploy `35409964105` passed; staging `static/0/false`, production skipped.
- [done] Full local baseline passed: seed/import, typecheck, lint, migration smoke through 0038, build, **178 files / 4044 tests**, diff check.
- [done] Production read-only public audit remains `shadow/0/false`, Worker `6c336889-680d-4cc3-b03b-1007849aa738`, 71 deterministic recipes, D1-only samples hidden.
- [blocked] No authorized operator-owned INCLUDE/EXCLUDE household pair was supplied; local Wrangler is unauthenticated. No customer enumeration and no production mutation.
- [status] `T15C_D_BLOCKED_AUTHORIZED_TEST_HOUSEHOLDS_UNAVAILABLE`; receipt `docs/ai/recipe-catalog/T15C_D_PRODUCTION_1PCT_CANARY_CERTIFICATION.md`.
- [done] PR #40 merged receipt commit `16958c6...` as `763d7e9...`; exact-main CI `35411093064` and staging Deploy `35411300235` passed (`static/0/false`, production skipped).
- [next] Privately provide both operator-owned household IDs and authenticated Cloudflare operator access; re-run direct D1 certification, provision only hashed cohort secrets, certify 1%, then rollback to `shadow/0/false`. Stop before 2%, 5%, full D1, media, or T14G.

## Current T15C-C — authorized canary test cohort mechanism (dormant) — 2026-09-19

- [done] `packages/recipes/src/recipe-canary-cohort.ts` + `src/worker/services/recipe-authority.ts`: server-side override for operator-owned test households — `RECIPE_CATALOG_TEST_COHORT_ENABLED` / `RECIPE_CATALOG_TEST_INCLUDE` / `RECIPE_CATALOG_TEST_EXCLUDE` (Worker secrets; SHA-256 digests of `recipe-catalog-test-cohort:<householdId>`, never raw IDs). Precedence exclude > include > deterministic FNV bucket; disabled by default; canary+cutover only; zero effect in static/shadow/d1 or without a tenant; every malformed/half-applied shape fails closed in canary mode (`CONFIG_RECIPE_CATALOG_TEST_COHORT` fatal; static + loud diagnostic at request time). **R1 remediation:** cohort variables are inert in static/shadow/d1 (rollback = single mode change, no secret cleanup — P1 resolved) and an active cohort requires BOTH an include and an exclude household (`TEST_COHORT_PAIR_REQUIRED` — P2 resolved). Request input cannot reach it. `fnv1a32`/`recipeCanaryBucket`/thresholds unchanged.
- [done] Tests: 25 unit + 4 HTTP (request-control attempts, guest, static/shadow) + workflow/wrangler/manifest guardrail; no migration, no workflow change.
- [status] `T15C_AUTHORIZED_TEST_COHORT_READY` — NOT `T15C_CANARY_COMPLETE`. Production still `shadow / 0 / false`; no deploy/config/D1/R2 change. Receipt: `docs/ai/recipe-catalog/T15C_AUTHORIZED_TEST_COHORT.md`. Previous safe stops (T15C-B, `T15C_PRODUCTION_CANARY_SAFE_STOP.md`) remain valid history.
- [next] Operator supplies the two authorized households → digests as production secrets → T15C-B 1% canary through the protected workflow (separate authorization).
## Current T15C — production Canary safe stop (authorized cohort unavailable) — 2026-09-18

- [done] Fresh audit on canonical main `b41aa4682481447795350fc1a9eeb1e80887bd0e` (resolved by repository ID 1368281478): seed/import/typecheck/lint/check:migrations(0038)/build PASS; full `pnpm test` 176 files / 4008 tests PASS.
- [done] Read-only public production audit: readiness commit == main `b41aa468…`, database ok, 5/5 catalog reads = 71 deterministic, legacy IDs 200, D1-only IDs 404. Latest production Deploy receipt 35404106102 = `shadow / 0 / false` on that exact SHA (helper convergence 2 attempts).
- [stop] No operator-owned inside-1%/outside-1% production test cohort and no Cloudflare credentials in this environment; no customer IDs inspected; no dispatch/approval/D1/R2/config change. Classification `T15C_CANARY_BLOCKED_AUTHORIZED_COHORT_UNAVAILABLE`. Receipt: `docs/ai/recipe-catalog/T15C_PRODUCTION_CANARY_SAFE_STOP.md`.
- [next] Operator provides both authorized cohorts + read-only CF credentials + Environment reviewer; resume at exactly 1% via the protected `deploy.yml`; no widening beyond the 1→2→5 ladder, no `d1`, no media/R2, no T14G.

## Current T15B-SHADOW — production Shadow certified; stop before canary — 2026-09-18

- [done] PR #30 merged as `88e8b54de121125866b2ff813e56e33277decf1c`; exact-main CI `35336548833` and automatic staging Deploy `35336830786` succeeded. Staging stayed STATIC71 on Worker `580acb76-a006-4c0a-b991-618ebde07e88`.
- [done] Production Shadow Deploy `35337110268` succeeded after the required Environment approval: Worker `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`, exact SHA, convergence 1 attempt / 574 ms.
- [done] Independent live checks: 5/5 catalog reads returned 71, legacy IDs returned 200, five D1-only IDs returned 404; Shadow tail showed D1 500/500 hydrated, release READY, zero drift/errors, no authority leak.
- [done] D1 stayed tip 0037 / ledger 37 / release `rel-bd00a4f53fcaeee4`; no migration or other D1 write. Receipt: `docs/ai/recipe-catalog/T15B_SHADOW_CERTIFICATION.md`.
- [stop] `T15B_SHADOW_COMPLETE`; no canary, full D1, cutover, media/R2, T14G, Inventory Truth/T09/T11, PayOS/auth, or stale PR #29 merge.

## Previous T15B-PRE checkpoint — STATIC certified; SHADOW wiring PR ready — superseded 2026-09-18

- [done] Canonical repository `1368281478` / `frigo-6/Frigo-dev`, main `0fe2cf071693208f6c642d8cbd994f5a79b5a2cf`; PR #29 remained open and unmerged.
- [done] Immutable production D1 receipt `35329772751`: tip 0037, 500 recipes, release `rel-bd00a4f53fcaeee4`, schema gate PASS, FK `[]`, quick check `ok`, 500 pending media rows / 0 ready.
- [done] Static Deploy `35333517052` approved and SUCCESS: Worker `ab8ff038-2aaa-468b-a9de-8c5d94f14052`, exact SHA convergence PASS, five repeated live checks served 71 static recipes.
- [done] Rollback evidence: previous Worker `56979cb5-e1a8-4241-8a4c-2432d41cc439`; rollback mode `RECIPE_CATALOG_MODE=static`.
- [ready for review] PR #30 (`codex/t15b-shadow-wiring`) adds only validated `static|shadow` workflow plumbing and tests; implementation head `97aff50d…` exact CI `35335079345` SUCCESS. Final docs head must also have exact-head CI SUCCESS. Do not merge or activate in this task.
- [not started] Shadow activation/certification, canary, full D1, media/R2, T14G; Inventory Truth/T09/T11 unchanged.

## Current T15A — pre-production rollout hardening COMPLETE (production rollout not started) — 2026-09-18

- [done] PR #26 merged (`70cf7e0d…`): schema gate derived from `migrations/`, pinned migration chain, `catalog` certification command.
- [done, PR #27 / T15A-R2, pushed] `wait-for-deployed-release.mjs` bounded exact-SHA convergence helper; `readiness.commit` must be a canonical 40-hex SHA (malformed/missing → fail closed, only a different *valid* SHA retries; regression tests A–J).
- [done, PR #27 merged → main `0fe2cf07…`] Workflow wiring (`catalog` step in `production-d1-migrate.yml` after `verify`/before the schema gate, input interpolation removed, staging+production deploy proof via the helper) and unconditional guardrail tests are committed on the PR branch (`366dbd1`, `776422f`; identical to `t15a-r/workflows.patch` / `r2-wired-series.mbox`, retained as audit evidence). Focused 123/0 skipped; hosted exact-head CI SUCCESS. Merged by maintainer (merge commit); exact-main push CI 35329100767 SUCCESS; automatic Deploy 35329500028: release+staging SUCCESS, staging exact-SHA convergence via the helper (attempt 1, 547 ms), production SKIPPED. Classification `T15A_PRE_PRODUCTION_HARDENING_COMPLETE`.
- [next] T15A Phase B (live production re-query → migrate 0035–0037 via `production-d1-migrate.yml` → static deploy → shadow) only with credentials + operator approval; historical last verified production tip = 0034 (must be re-queried live first). No canary/d1/media/T14G. P3_FUTURE_MEDIA_GATE_COMPATIBILITY: `catalog` requires `media_ready=0`; revisit before any migration after media population.
- [next] T15A Phase B (live production re-query → migrate 0035–0037 via workflow → static deploy → shadow) only with credentials + operator approval; historical last verified production tip = 0034 (must be re-queried live first). No canary/d1/media/T14G. P3_FUTURE_MEDIA_GATE_COMPATIBILITY: `catalog` requires `media_ready=0`; revisit before any migration after media population.

## Historical T14F — T14F_DEVELOPMENT_COMPLETE (T14F-A/B/C certified; production untouched) — 2026-09-17

- T14F-C completed and committed (on top of authorized base `7d667523…`): 0037 promoted byte-identical (`68e52e6d…`), shipped manifest regenerated to 500/2 batches (`rel-bd00a4f53fcaeee4`, `fa47d31f…`), replay (fresh 0001→0037, 0036→0037, 0034→…→0037) PASS, D1 readiness READY 500, static/shadow/canary/full-D1 PASS, user flows incl. Batch B cuisines PASS. Development certificate: `docs/ai/recipe-catalog/T14F_C_500_CATALOG_CERTIFICATION.md`.
- **T14F-C CLOSED**: safe stop `44c0ad38…` resolved. Full closure gates PASS — lint, build, full `pnpm test` **171 files / 3913 tests**, typecheck, migration smoke through 0037, seed/import checks (500/2), diff check. One real blocker fixed forward-only in `8c6080aa…` (tests only): the five real-D1 suites overflowed workerd 1.20250718's 1 MiB statement cache when replaying 0001→0037 in one process (cloudflare/workerd#5977); `tests/helpers/local-d1-worker.mjs` recycles workerd before that. No migration/catalog/runtime change. Second blocker (docs heads): hosted Vitest passed 171/3913 but exited 1 on a vitest-worker `onTaskUpdate` RPC timeout — fixed forward-only via `tests/helpers/vitest-event-loop-yield.ts` (setupFiles; test config only).
- Final head + hosted exact-head validate SUCCESS bound in the PR #25 final certification receipt. Classification: `T14F_DEVELOPMENT_COMPLETE` · `T14F_REAL_CATALOG_500_COMPLETE` · `T14F_500_AUTHORITY_CERTIFIED` · `PRODUCTION_ROLLOUT_DEFERRED` · `MEDIA_POPULATION_DEFERRED` · `T14G_NOT_STARTED`; P3 = 1 (~780 KB unpaginated `/recipes`, T14G).
- PR #25 **ready for review, unmerged**. Production does **not** contain 500 recipes. Merge, production rollout, media population and T14G each need separate authorization.

## Historical T14F — T14F_B_SCALE_BATCH_CERTIFIED — 2026-09-17

- T14F-A pilot certified (`b0150d0…`). T14F-B scale batch completed: **399/399 records** (`t14f-scale-399-v1`) validated publishable, 0 hard duplicates, 0 unresolved ingredients; QA `ok` 0 findings; double compile byte-identical; candidate-500 composition proven (500 unique, order verified).
- Shipped release was 101 (`rel-193ac2b16c64a260`) at the time; approved-batches/current manifest unchanged then; 0036 SHA-256 unchanged; 0037 not yet created; no production action.
- Full gates PASS (171 files / 3911 tests, 2026-09-17). Certified head in PR #25 receipt / `T14F_B_SCALE_BATCH_CERTIFICATION.md`.
- Next: T14F-C only with separate authorization (0037 + 500 manifest). PR #25 stays draft/unmerged.

- Repository ID 1368281478; unchanged main; forward-only `hoplite/massalia-c2862d7c`;
  PR #25 draft/unmerged. Inherited routing fix `8079a37`, verification commit `2ee6f5cc…`.
- Original 5/7 failure independently reproduced: strict 71/101 COUNT_DRIFT is correct.
  Generated test-local 71 release now proves real D1/canary, null fallback, `[5]`/`[]` cache,
  invalid-drift rejection and cleanup; no runtime, pilot, manifest or migration change.
- Routing 8/8, growth 21/21, combined 29/29 twice, non-isolated 29/29, subsystem 383/383 PASS.
  Executed seed/import/typecheck/lint/migration smoke/build/test/diff: all PASS;
  full suite **171 files / 3911 tests**. Exact implementation CI **35223589293 / 105209475052 SUCCESS**.
- Final documentation SHA + hosted CI SUCCESS are bound in the [certification receipt](https://github.com/frigo-4/Frigo-dev/pull/25#issuecomment-5714709031).
  That final certified SHA, not the implementation commit, is the only valid future T14F-B base.
- Pilot 30 + legacy 71 = 101, complete 101/order 0..100, five statements/no N+1;
  replay, authority modes, imported HTTP flows and Inventory Truth regressions PASS.
- **STOP.** Await separately authorized T14F-B. No ingredient scale preflight, Batch B, 0037,
  500 manifest, production/media/T14G action or merge. Overall T14F is not complete.
- Exact commands/hashes: `docs/ai/recipe-catalog/T14F_NEXT_HANDOFF.md`. Local-only settings preserved.

## Historical T14F — WIP SAFE STOP — 2026-09-17 (superseded by takeover above)

- Pilot batch `t14f-pilot-30-v1`: 30 original recipes authored + reviewed + compiled via T14E (30/30
  publishable, 0 duplicates, 0 unresolved ingredients); `0036_recipe_catalog_pilot.sql` promoted
  byte-identical; manifest `rel-193ac2b16c64a260` 101 recipes / 1 batch; `ALL_RECIPES` still 71.
- Checks: typecheck, `check:migrations`, seed check, import check, diff check PASS; focused growth
  suites 20/21 — `production forward path 0034 → 0035 → growth` fails when both growth suites run
  together, passes alone (root cause unknown). Lint/build/full tests/bundle NOT run. Batch B not started.
- Full state and exact next steps: `docs/ai/recipe-catalog/T14F_WIP_HANDOFF.md`.

## T14E — BULK RECIPE IMPORT FACTORY — 2026-09-17 (MERGED main f7a55408…; main certified; NOT deployed; T14F not started)

- PR #23 merged (normal merge, remediated head `ba1a45d4…`); main CI green; 169/3889; app tree preserved. Release still
  `rel-1a047444a3632771` 71/0; 35 migrations / no 0036; no real recipes. Production still `4ed98514…` / 0034 / static.
  Receipt `docs/ai/recipe-catalog/T14E_MERGE_RECEIPT.md`; T14F only from `T14E_FINAL_CANONICAL_MAIN` per `T14E_NEXT_HANDOFF.md`.

## T14E — REMEDIATION — 2026-09-17 (review P1/P2/P3 closed; PR #23 ready for re-review, unmerged)

- Nutrition evidence preserved end-to-end (ADR-004 `nutrition_profiles` persistence), immutable batch hash covers all reviewed
  metadata, manifest failure telemetry corrected. No 0036, no real recipes, no production action.

## T14E — BULK RECIPE IMPORT FACTORY — 2026-09-17 (development complete on feature branch; PR unmerged)

- Import factory (`packages/recipes/src/import/`), CLI, 71-recipe Catalog Release Manifest, manifest-driven D1 readiness
  (ALL_RECIPES stays the 71 rollback baseline). No 0036, no real recipes, no production action, T14F not started.
  Docs: `docs/ai/recipe-catalog/T14E_BULK_RECIPE_IMPORT_FACTORY.md`, ADR-027, `T14E_NEXT_HANDOFF.md`.

## T14C/T14D OPS — PRODUCTION D1 MIGRATION WORKFLOW — 2026-09-17 (MERGED main 6910a7b4…; awaiting operator dispatch)

- PR #21 merged; main CI green; app tree unchanged. Production still `4ed98514…` / 0034 / static. Operator dispatch inputs in
  `docs/ai/recipe-catalog/T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`. Schema gate fixed to D1's 5-term compound-SELECT limit.

## T14D — RECIPE AUTHORITY CUTOVER — 2026-09-16 (MERGED main bb504cce…; main certified; NOT deployed)

- PR #19 merged; main CI green; 163/3801. Production still `4ed98514…` / 0034 / static — OPS sequence in
  `docs/ai/recipe-catalog/T14D_NEXT_HANDOFF.md`.

## T14D — RECIPE AUTHORITY CUTOVER — 2026-09-16 (development receipt)

- Authority router static|shadow|canary|d1 (fenced), verified D1 snapshot, deterministic canary, config-only rollback;
  no migration. Production still static / 0034. Docs: `docs/ai/recipe-catalog/T14D_RECIPE_AUTHORITY_CUTOVER.md`, ADR-026.

## T14C — RECIPE MEDIA LAYER — 2026-09-16 (MERGED main 3a1e6be6…; production 0035/deploy pending operator)

- PR #17 merged; main CI green; staging auto-deploy green. Production D1 still 0034, Worker still 4ed98514… —
  operator runbook: `docs/ai/recipe-catalog/T14C_MERGE_RECEIPT.md`.

## T14C — RECIPE MEDIA LAYER — 2026-09-16 (development receipt)

- 0035 `recipe_media` + catalog/resolver/route/frontend fallback; 0034 pinned; gates green locally.
- Review remediation: promotion verifies the R2 object (MIME/size/SHA-256) before ready; SQL enforces exact storage key.
- Production still 0034; media population and T14D/T14E deferred. Docs: `docs/ai/recipe-catalog/T14C_RECIPE_MEDIA_LAYER.md`.

## T14B-B — COMPLETE 2026-09-16 (D1 0034 in production; Worker `56979cb5-…` = main `4ed98514…`)

- Ledger 33→34 after backup; catalog certified; schema gate PASS; Deploy 35101845374 (staging) and
  35102115354 (production) SUCCESS; smoke green. Details: `docs/ai/recipe-catalog/T14B_B_FINAL_COMPLETION.md`.
- T14C ready to start (`docs/ai/recipe-catalog/T14C_HANDOFF.md`, branch `feat/t14c-recipe-media-layer`).

## T14B-B — MERGED TO MAIN 2026-09-16; PRODUCTION ROLLOUT BLOCKED (OPS SECRET) — historical

- PR #14 merged as `c7455160`; main CI green; fresh main gates green (157 files / 3704 tests).
- Blocked on OPS: production D1 0034 apply + Cloudflare deploy secrets (`CLOUDFLARE_API_TOKEN` missing
  in GitHub staging env; Deploy run 35073197948 failed there). Production app unchanged.
- T14C not started. Receipt: `docs/ai/recipe-catalog/T14B_B_MERGE_RECEIPT.md`.

## T14B-B — MERGED TO MAIN 2026-09-16; PRODUCTION ROLLOUT BLOCKED (OPS SECRET)

## T14B-B — D1 CATALOG PARITY & SHADOW FOUNDATION — 2026-09-16 (merged; details)

- Migration `0034_global_recipe_catalog_parity.sql`: 12 global recipes persisted, D1 = 71
  complete, `recipe_runtime_fields` (persisted `runtime_order`, typed open `category`, closed
  `region`, legacy nutrition) + `recipe_runtime_ingredient_order` added; `0001–0033` unchanged
  (fixed hash manifest).
- D1 → `RuntimeRecipe` hydration is lossless and order-preserving for all 71; recommendation,
  tie-sensitive ranking, planner (incl. tie fixture), >5-alternative swap and cooking parity
  proved on the actual D1 catalog output. **`ALL_RECIPES` remains production authority**; shadow
  mode is opt-in and production-rejected. Media → T14C; cutover → T14D; bulk import → T14E.
- Gates: lint, typecheck, build, `migration-smoke=ok`, seed check, full Vitest (totals in
  `docs/ai/recipe-catalog/T14B_B_REMEDIATION_HANDOFF.md` §10); PR #14 not merged.
- Details: `docs/ai/recipe-catalog/T14B_B_D1_PARITY_SHADOW.md`, ADR-024.

## Auth/OCR production hardening — 2026-09-16

- [done] Remove the credential-less Google production fallback.
- [done] Harden async GIS initialization and retry/unavailable UX.
- [done] Add staged OCR pending UI to upload and review screens.
- [done] Focused `54/54`, full Vitest `3632/3632`, lint, typecheck,
  migration smoke, build and diff check pass.
- [next] Browser smoke, hosted CI and maintainer review; no deployment yet.

## 2026-09-16 auth popup follow-up

- [done] Fix COOP precedence that broke Google GIS popup opener handshake.
- [done] Preserve strict `same-origin` on API responses.
- [done] Add SPA/API regression test; focused `17/17`, lint and typecheck pass.
- [done] Publish PR #9 and deploy Worker version
  `20bc1f35-6ffe-4085-ba79-d54a0b53da71`.
- [done] Production smoke, readiness and live SPA/API COOP checks pass; no
  migration or production data resource was mutated.

## CURRENT — T14 integration refresh, 2026-09-15 UTC

- `vn-clo/Frigo-dev` (ID `1368281478`), verified main before this docs-only receipt
  `a165474a623a8130c9a9ed4f1df096b3ac3b3ae9`; final tip is in its PR post-merge comment.
- PR #9 Auth/OCR production lineage `911db7f`; Worker version
  `20bc1f35-6ffe-4085-ba79-d54a0b53da71`; PR #10 rollout receipt preserved.
- T14A merged via PR #11 after exact-head CI `35034318031` passed. Accepted
  T14B-A merged via PR #12 after exact-head CI `35035112092` and all fresh local
  gates passed (154 files / 3676 tests). T14B-B NOT STARTED; prerequisites ready.
  Static authority 71/59/12,
  migrations 0001–0033 unchanged; media deferred to T14C.
- Main CI passed; Deploy staging missing-token blocker is separate OPS work.
- PR #4: CLOSE_ARCHIVE recommended, not merged or deleted.
- Exact evidence and next action: `docs/ai/recipe-catalog/T14_INTEGRATION_REFRESH.md`.

# Historical boards — superseded by the current refresh above

## CANONICAL REPOSITORY CONSOLIDATION COMPLETE — 2026-09-15

- `vn-dlo/Frigo-dev` (ID `1368281478`) is now the canonical long-term
  repository. PR #2 merged reviewed head `7ede92c` into `main` as merge commit
  `a5cfb14cfd5840be23eb16b26a3689f5e2d6e805`.
- Merge tree equals the reviewed tree; application freeze `5f6853d`, production
  `05423f2`, Qwen `da41686`, T13 `32ddbb4`, and Takosan `ff63edf` remain
  ancestors of canonical main.
- PR CI `34972891435` and post-merge CI `34973522150` passed. Strict `validate`,
  force-push/deletion blocks, and admin enforcement remain active.
- No staging or production deployment occurred. Production migration/D1/KV/R2/
  queue/PayOS/DNS/T14 work remains blocked and out of scope.

## T13R CERTIFIED — 2026-09-14

- **T13 REMEDIATION CERTIFIED — READY FOR INDEPENDENT FINAL REVIEW #2.**
  `T13R_APPLICATION_FREEZE=32ddbb4f2bb636fdcf201e9ca99c4689d3655477` on
  `hoplite/delos-f0bb1d04` (repo ID 1368281478; main `d1b06732…` unchanged).
- Pre-freeze and clean-detached gates: full Vitest 3471/138, focused T13R-A 45/5,
  T13R-B 171/7, real local D1 92/5, browser 60/60 (360/390/430), 32 migrations
  (0031/0032 unchanged, 0033 absent), fresh + legacy real D1 replay, schema gate,
  writer/reader UNKNOWN 0/0, diff-check, detached porcelain EMPTY. No hosted CI for
  the exact freeze. P0/P1/blocking P2 = 0/0/0; AC1–AC14 PASS; roadmap rows DONE.
- Next and only step: INDEPENDENT T13 FINAL REVIEW #2. See
  `docs/ai/inventory-truth/t13/T13R_FINAL_CERTIFICATION.md`.

## SAFE STOP — T13R-B — 2026-09-13T21:35Z

- P2-1 FIXED (commit `4d587eb`), P2-4/P2-5/P2-6 FIXED in WIP `7e68e3b`
  (unit + integration + 12/12 t13r-b-presentation browser cases GREEN at
  360/390/430; full Playwright suite 51 passed; typecheck PASS).
- Certification (full Vitest, build, migrations, D1, authority audit,
  freeze) NOT started. Next: resume certification per
  `docs/ai/inventory-truth/t13/T13R_B_REMEDIATION.md`.
## Production rollout receipt — 2026-09-15

- Production D1 `frigo-db`: migrations `0001`-`0033`, remote schema gate PASS.
- Deployed compatibility SHA `64ee9ed1`; deployed canonical SHA
  `e6b91956484589c088e6d04a9835b3e59a2eb786`.
- Readiness exact-SHA PASS; DB/queue/AI/config healthy, PLUS-grant warning only.
- Full Vitest `3630/3630`, lint/typecheck/build and frozen install PASS.
- Follow-up blocked on hosted CI/review for open PR #4; no protection bypass.
## T18C continuation checkpoint — 2026-09-21

**T18C_PARTIAL** — resumed existing branch at `2e770f8`, exact base `b8447e85`,
repository `1368281478` / `vn-tako/Frigo-dev`; upstream corrected. Fresh
pause-tree matrix **6 passed / 162 screenshots / 162 axe audits / zero
violations and overflow**. Approved source ZIP is now available and direct
comparison is underway: [provenance](docs/ai/T18C_SOURCE_PROVENANCE.md).
Final source-led fixes, regressions, full gates and PR remain pending.
Original baseline and workspace settings preserved; no merge/deploy/T18D.
