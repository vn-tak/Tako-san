# UI06 — Thực đơn và danh sách mua sắm đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI06_LOCAL_VERIFIED_REVIEW_REQUIRED`. Packet
`docs/ai/tasks/UI06-planner-shopping.md`, ADR-049. Hoàn tất phạm vi local planner,
composer và shopping. Bộ nhận diện cuối và toàn hệ thống vẫn theo roadmap.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553; checkout
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, branch `codex/ui-rebuild-foundation`,
base `e584cf0bc8c5ab5c62b0896157c06f7bd511886b`. Implementation checkpoint:
`UI06_IMPLEMENTATION_PENDING`. Hash được ghi và đối chiếu trong documentation
checkpoint sau implementation. Checkout Frigo cũ giữ nguyên.

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

# UI02 — Home và discovery đã kiểm chứng local — 2026-10-10 JST

**Task/status:** `UI02_LOCAL_VERIFIED_REVIEW_REQUIRED`. Người dùng yêu cầu tiếp tục
một đợt rebuild. UI02 hoàn tất phạm vi local; toàn hệ thống/brand final vẫn trong roadmap.

**Repository/source:** Canonical `vn-tak/Tako-san`, ID1385308553; base UI01
checkpoint `1533d98`, canonical base `27d47b056455a57df811199cd7e9c32a84cbffe5`.
Checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh
`codex/ui-rebuild-foundation`. Implementation đã kiểm chứng và commit
`11080d8a7a05614b37e85cf12f6f888addd15df0`; documentation checkpoint theo sau.
Không push/PR/merge/deploy; checkout Frigo cũ vẫn giữ nguyên.

**Actual changes:** ADR-045 và packet `tasks/UI02-home-discovery.md`. Home chọn
canonical current-plan khi Planner UI bật, Week khi tắt; cùng household query keys
và clients đã validate. Ngày theo fixed UTC offset; today/tomorrow/past/no-plan/
loading/error riêng. T20 component có thẩm quyền, gồm edited unplanned slot;
pending/500/missing/revision mismatch không hiển thị title V1. UI-off/API404 giữ
V1, explicit family V1 projection giữ anchor; empty V2 vẫn rỗng. Retry theo plan/
revision mới. Home mở meal detail, không cook trực tiếp anchor hoặc khẳng định
stock/safety/budget chưa biết. Expiry estimate/known/unknown giữ qualifier/tone.

Shared kitchen header/heading, scoped shell/rail/logo/font/palette trên Home,
inventory list, catalog/detail; navigation/Scan giữ mô hình hiện hữu, các route
khác giữ kit mặc định. Catalog URL filters/page, native links, search toàn tập
kết quả có/không dấu, client 24-item paging/clamp, reset/page focus, detail return
về Home hoặc đúng filtered catalog. Mobile native filter panel thu gọn, desktop
mở sẵn từ1280px. Search/select16px, card image dimensions, detail h1, skip link.

**Verification:** Final full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0;264files/6429tests PASS,0FAIL,326.64s; typecheck/lint/migration-smoke/build
PASS. Focused6files/157tests PASS. Targeted Prettier18files và diffcheck PASS.
Final browser21axe/layout checks ở320/390/768/1024/1440,23PNG,
0violation/overflow/pageerror; Be Vietnam Pro, reduced-motion, native filters,
skip/pager/resetfocus, reload/history/detail return, local Home↔Planner PASS.
Evidence/manifest và commands tại `../ui-rebuild/round-2/VERIFICATION.md`.
Log final `.artifacts/ui02/full-check-final.log`, `browser-final.log`.
Preview local đã dừng trước full gate; không claim hosted/Safari/device/usability QA.

**Failures/recovery:** Full đầu6417PASS/12FAIL:11static-render cases thiếu Router
khi thêm Link,1fixture canonical ingredient ID sai. Thêm đúng Router, explicit
Week flags và presentation/link expectations, giữ actual-data/budget/expiry/error/
security assertions; sửa fixture theo validator. Focused157PASS rồi full final
PASS. Các lỗi invocation, wait/href, fixture fields, heading closing tag và harness
unroute đều ghi trong VERIFICATION; không xóa test, tăng timeout hoặc đổi config.

**Database/operational state:** Chỉ synthetic local Worker/SQLite fixture và
migration smoke. Không schema/migrations/dependencies/auth/payment/infrastructure/
production flags hoặc remote D1/R2 writes. Remote schema/Week gates skipped.
T20 deployment/certification status/authorization bên dưới không được UI02 thay thế.

**Next action:** Review source cuối/hosted CI theo quy trình repo. UI03 packet+ADR
cho lightweight recipe list DTO và server cursor/ranking/filter cùng catalog
identity/household inventory; detail tải riêng, page24 có stable ordering và
no-duplicate/reload/search tests. Audit recipe→image URL/hash/provenance; xử lý ảnh
legacy dùng chung sai món trước media batch. Sau đó scan/review/editor/cooking/
planner/shopping, brand export/motion; device/Safari/screen-reader/usability QA.
Cụ thể tại `../ui-rebuild/round-2/FOUNDATION.md`; API vẫn tải fullrecommendation,
logo prototype và fullbrand/remaining-screen migration chưa hoàn tất.

---

# UI01 — Handoff đợt đầu rebuild Tako-san — 2026-10-10 JST

**Task/status:** `UI01_LOCAL_VERIFIED_REVIEW_REQUIRED`, người dùng đã yêu cầu bắt
đầu ngày2026-10-09. Chỉ milestone đầu hoàn tất local; roadmap toàn hệ thống vẫn mở.

**Repository/source:** `vn-tak/Tako-san`, ID1385308553; canonical base
`27d47b056455a57df811199cd7e9c32a84cbffe5`. Thao tác tiếp trong
`/Users/tunbee27/Documents/Tako-san-ui-rebuild`, nhánh `codex/ui-rebuild-foundation`.
Implementation đã kiểm chứng/commit `716fa9aabfca9bb2bce77963b57ed80fef07153f`.
Documentation checkpoint này theo sau; kiểm tra final HEAD trước review/CI.
Không push/PR/merge/deploy; không lấy checkout Frigo cũ làm source implementation.

**Actual changes:** ADR-044, packet `tasks/UI01-ui-rebuild-foundation.md`.
Shared legacy quantity adapter tái dùng T02 index/session/exact arithmetic,
required trước optional, IDs giữ duplicate detection, cộng lot tương thích và
không quy đổi đoán pack/bunch/slice. No-buy dựa trên lượng; % vẫn coverage loại.
Detail cho xem lượng thiếu, shopping chỉ gửi shortfall biết được; state/source
của shopping không lẫn khi đổi route trước hoặc sau response. Cooking draft và
pending offline cache trừ lượng qua lot một lần; server FEFO/session/revision
commands giữ nguyên. Evidence chỉ quantity, không bảo đảm expiry/allergy.
Filtered inventory có no-results/reset/focus; ảnh lỗi về SVG trung tính.
Theme/font/logo prototype scoped ở inventory/detail; desktop recipe2cột,
hướng dẫn16px, Be Vietnam Pro400/600/700 tự host,9subset/OFL/Vietnameseglyph.
Palettecontrast, nguồn asset và14ảnh review tại `docs/ui-rebuild`.

**Verification:** Node24.16.0/pnpm10.33.2, frozen lockfile. Full command:
`PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check`
exit0,262files/6380tests,0FAIL,324.07s; lint/typecheck/migration-smoke/build PASS.
Final harness lint PASS; surface7/7 PASS sau format-only; Prettier targeted PASS.
Final browser command và preview env lưu trong `../ui-rebuild/VERIFICATION.md`:
12selected axe checks tại320/390/768/1024/1440 ->0violation/overflow/pageerror;
reduced-motion animation-none, keyboard/focus, shopping2eggs/HTTP201 PASS.
Standalone board1100/390 ->0overflow/brokenimage,4fontfacesloaded.
Log final `.artifacts/ui-rebuild/full-check-bounded.log`, `browser-final.log`.
JSON/screenshots `docs/ui-rebuild/evidence`; preview session đã dừng.

**Failures/recovery:** Full đầu6373PASS/5FAIL: contextual catalog fixture,3
historical Git blobs thiếu do partial clone và localWrangler timeout.
Assertion đổi đúng T02 contextual policy, thêm evidence cụ thể, giữ catalog/
planner/cooking assertions. Historical objects phục hồi đúng hash từ caches cũ,
không đổi test/source cũ;54/54PASS. Wrangler32/32PASS riêng với telemetryoff;
full tiếp6377PASS/1timeout. Full final giới hạn2worker qua env PASS toàn bộ,
không tăng timeout/thay config/giảm assertion. Chi tiết trong VERIFICATION.

**Database/operational state:** Local synthetic SQLite/migration smoke; không
sửa schema/migration/dependencies/auth/payment/infrastructure. Không credentials,
remoteD1/R2 write, hosted run hoặc flag mutation. Remote schema/Week gates skipped.
UI01 không thay thế T20 staging/production status và authorization bên dưới.

**Next action:** Review source cuối/hosted CI. Tạo UI02 task+ADR nếu cần cho Home
flag-aware canonical planner adapter và responsive shell/PageHeader, giữ Week.
Tiếp theo URL filters, summary API nhỏ và stablepagination24. Sau đó scan/editor/
cooking/planner/shopping, fullbrand/motionkit; device/Safari/screen-reader/
recognition/usability QA. Chưa có chứng nhận independent/hosted/release.

---

# T20 fixture staging: sửa tương thích timestamp trước rollout — 2026-10-09 JST

**Task/status:** `T20_STAGING_CERTIFICATION_REQUIRED` /
`T20_PRODUCTION_READINESS_BLOCKED`. PR61 đã merge theo operator continuation;
phát hiện blocker ở công cụ certification trước khi dispatch fixture hoặc deploy.

**Repository/source:** `vn-tak/Tako-san`, ID1385308553, main
`23065108be8e72951c289445cd2c537b87f18f4c`. PR61 normal merge head
`b789d7986c9a4e74e86840f8026a1fcb1b91985f`; parents5dfab234/b789d798,
merge/head tree `6d35cda4f7393456b6bf3c24be7875d238e1f69b` khớp.
Main CI `37851106419` SUCCESS, 259files/6361tests; CI green vẫn bỏ sót
fixture defect dưới đây. Nhánh sửa riêng `codex/t20-fixture-schema-contract`.

**Finding/fix:** P1 staging certification: fixture SQL dùng `datetime('now')`,
vi phạm CHECK `updated_at IS strftime('%Y-%m-%dT%H:%M:%fZ', updated_at)` của
migration0021. Test cũ dùng bảng tối giản không có CHECK nên bỏ sót.
Sửa đúng một expression thành UTC ISO `strftime(..., 'now')`; không đổi migration,
policy values, bindings, workflow guards, auth/runtime hoặc production data.
Thêm4 regression chạy prepare/audit với full migration chain bằng SqliteD1,
kiểm chứng timestamp, stored policy, insert1, audit0, duplicate prepare reject,
stock/event snapshot không đổi và FK check. Auth records trong tests chỉ là local
SQLite fixtures; workflow remote vẫn chỉ nhận normally registered verified owner.

**Verification:** Before4FAIL/23PASS, cả4 lỗi đúng CHECK timestamp. After27/27PASS,
failed0. Lượt full đầu có6365PASS nhưng2suitefail do hai file tạm ignored bị Vitest nhận
nhầm test. Đã đổi tên file tạm, giữ nguyên test config/assertions. Lượt rerun
`CI=true TMPDIR=/private/tmp pnpm check` exit0:259files/6365tests,0FAIL,
127.52s suite; lint/typecheck/migration-smoke/build PASS. Remote schema/Week
gates skipped có chủ đích; không claim hosted certification. Implementation
`4fb0ff8bb4143328bd1e20d4091e65d29efc95d1`; documentation checkpoint theo sau.
Private logs: `.wrangler/t20-rollout/20261009/schema-contract-before.log`,
`schema-contract-after.log`, `schema-contract-full-check.log`,
`schema-contract-full-check-clean.log`. Prod audit0high/critical,2moderate hiện hữu;
không đổi dependencies, không claim repo-wide tooling audit PASS.
45 hosted journeys chưa chạy; final-source readiness phải rerun sau source mới.

**Operational evidence:** Staging read-only readiness `37850099945` SUCCESS cho
main5dfab234 trước merge: D1500/ledger39/ID-order-fingerprint/provenance/integrity
match. Public serving baseline6f6eaaab ở cả hai môi trường, production T20false.
Năm normal accounts còn dùng được qua GET-only preflight. Không deploy Worker,
insert remote policy, production D1/R2 mutation, replay0039 hoặc failed scan.
Harness ignored thêm source/unique journey và đủ45 HTTP observation gates;
local rejection guards10/10PASS. Không dùng10 guard fixtures làm hosted PASS.

**Next action:** Review/CI final repair head, normal merge khi operator cho phép;
pin exact-main CI/SHA, final-source staging D1 read-only readiness, staging
shadow→1→5→25→D1, prepare fixed policy cho test households,45 hosted journeys
và audit stock/events. Chỉ sau `STAGING_CERTIFIED` mới production cùng source;
normal reviewer `vn-taphoanhatung` duyệt từng Environment run, không bypass.
Không reapply0039 hoặc thay catalog. Rollback theo `T20_RELEASE_READINESS.md`,
giữ additive schema/composition records. Production enablement chưa thực hiện.

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
[Production shadow diagnostic](scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).
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
[Production shadow diagnostic](scan/PRODUCTION_SHADOW_DIAGNOSTIC_20261008.md).

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

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
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

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
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

**Report:** [PRODUCTION_IMPORT_INSPECTION_20261006.md](recipe-catalog/PRODUCTION_IMPORT_INSPECTION_20261006.md).
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

**Report:** [PRODUCTION_ASSET_CONVERGENCE_20261006.md](recipe-catalog/PRODUCTION_ASSET_CONVERGENCE_20261006.md).
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

**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
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
**Report:** [PRODUCTION_D1_API_COMPATIBILITY_20261006.md](recipe-catalog/PRODUCTION_D1_API_COMPATIBILITY_20261006.md).
Earlier checkpoint sections are historical.

---

# Production replacement candidate checkpoint - 2026-10-06 JST

State: production release incomplete. Current main remains
`cd66bb86ca7c440b606fb8672e89428800df33c2`. PR49 carries AI correction `e7d7db1`
and Worker metadata compatibility correction `1ed5733`. The operator authorizes
production release and confirms no real users; user-data preservation certification
is excluded.

Changes: static-pin now accepts Cloudflare's documented informational metadata
`hasPreview` and `modified_on` alongside legacy `has_preview`. Unknown fields
still fail before mutation. Exact deployed source/runtime/bindings/assets,
module equivalence and approval/freshness fences remain enforced. AI repair
preserves the complete default/custom extraction task/schema; its role in the
observed live INVALID_RESPONSE remains unproven.

Checks: metadata regression red 3 failures / 20 passes; final focused suite
24 PASS, independently rerun. Combined recovery/AI targeted validation five files /
70 PASS. Lint, typecheck, migration smoke, production build, syntax and diff PASS.
Full combined candidate suite: 249 files / 5653 PASS, exit 0, 514.45s,
unchanged timeouts, one worker, UTC and canonical macOS temp path.

Remote: recovery37334212154 intentionally CANCELLED at 2026-10-05T20:49:15Z,
recover job steps empty, approvals/pending deployments empty. It executed no
Worker/catalog/migration mutation and no longer requires review. Staging canary1
37370418398 FAILURE before steps; annotation: "The job was not acquired by Runner
of type hosted even after multiple attempts". Staging remains healthy shadow
on cd66/T20true; production remains old 136cb6ff/static fallback/ledger38. Actual
catalog recovery,0039 and new production application deployment remain pending.
The earlier normal disposable guest/synthetic scan failed INVALID_RESPONSE;
logout revoked its session. Corrected live provider readiness is still unproven.

External gate: GitHub Actions incident remains active; latest 20:47:22Z update
reports degraded availability. PR49 prior-head CI37371504325 failed before steps at 20:58:30Z with the
same hosted-runner assignment annotation. Final-head hosted CI and exact merged-main
push CI remain required after publication; resolve their current IDs from PR49.

Next: require green hosted CI on the final PR49 head, merge with a merge commit,
require exact-main push CI and freeze the new main. New recovery attempt1 must bind ref to
that main and reviewed_sha to the final merged PR49 head, preserving ancestry
and complete tree equality. Fresh normal production Environment review is needed
only when that new run exists. Require V1_CATALOG_CERTIFIED_STATIC before guarded
0039; full production certification follows 0039. Restage the final SHA through
shadow/1/5/25/D1, paired T20true. Production uses T20false, same immutable SHA,
shadow/live non-PII AI proof before 1/5/25/D1 promotion. Do not reuse the cancelled
run or old reviewed implementation head.

Runner-local final-candidate smoke is prepared at
`/private/tmp/takosan-provider-smoke-final-candidate/live-provider-smoke.py`.
Static syntax and fixture hash PASS; it has not been executed. Require explicit
production SHA and the deployed corrected shadow before its one synthetic scan.

Report: [PRODUCTION_RELEASE_BLOCKERS_20261006.md](recipe-catalog/PRODUCTION_RELEASE_BLOCKERS_20261006.md).
Older checkpoints follow and their pending-run claims are historical.

---

# Production release and AI retry checkpoint - 2026-10-06 JST

Current GitHub main `cd66bb86ca7c440b606fb8672e89428800df33c2` has green exact-main
push CI37333194384:248 files /5640 tests plus lint/typecheck/migration smoke/build.
PR48 is merged. Actions registration375554736 is active; push registration run
37333194265 succeeded with only register running and gate/recover skipped.

Reviewed recovery dispatch37334212154 passed its complete-tree/main/CI gate and
is waiting for normal production Environment review by `vn-taphoanhatung`.
CLI actor `vn-tak` cannot approve it. No production catalog recovery,0039
migration or application deployment has occurred. Do not advance main while
this run is pending: its mutation fences require exact current main.

Staging0039 certification37331557226 and runtime readiness37331892983 succeeded
(certify-only39 ledger/FK0/500 hydrated/exact V1 fingerprint). Staging Deploy
shadow37334571659 succeeded atcd66 with paired T20=true, D1 ready500/no fallback,
exact SHA smoke and version223b8b47-5439-49b9-b089-e444e7a97174. Same-SHA canary
progression is in progress; production T20 remains deliberately off.

Actual live non-PII production receipt smoke on old136cb6ff accepted one synthetic
image202, then terminal INVALID_RESPONSE/attempt1/items0. Request IDs
24145b6c-8390-4e73-8337-a0beb6e52771 (acceptance) and
ba031f71-6c8c-4070-ac7d-ad0347c1c574 (terminal), support hash096080ad9e97.
One disposable guest/session/scan was created through normal APIs; logout200
revoked the session. No email/OTP, security bypass or secret extraction.
Provider availability/receipt accuracy remain uncertified. Staging mock does
not prove live provider behavior. Production AI/config and image preprocessing
are unchanged from the deployed Worker in the prior candidate.

Executable AI correction `e7d7db1` preserves the full default/custom extraction
prompt while adding repair feedback on same-model retry and multimodal escalation.
The source bug is independently reproduced: default retry lost task/schema.
It can undermine recovery; its causation of the live failure is unproven.
Regression red4 failed/3 passed; correction and adjacent AI/provider/router
checks5 files/81 PASS. Lint/typecheck/migration smoke/build/diff PASS; full local
suite249 files/5647 PASS (513.76s), unchanged timeouts. Independent review finds no blockers; input governance includes
repair feedback and bounds calls. No AI model/provider/quality/security policy
change. Publish as a separate reviewed fix, hold merge while recovery is pending,
then verify real provider behavior before declaring production release complete.

Next: complete normal review of recovery37334212154, inspect aggregate receipt
and any unsupported provider metadata before further operation. Require V1 catalog
certification, then guarded0039. Merge green AI correction only after the pending
recovery completes or is intentionally replaced; stage the final immutable SHA
through shadow/canary/D1 and deploy production through the normal Environment gates.
Report: [PRODUCTION_AI_REPAIR_20261006.md](scan/PRODUCTION_AI_REPAIR_20261006.md).
PR49 is open for the AI correction; no auto-merge and main remainscd66.
Staging canary1 run37370418398 and hosted AI CI37370993436 are queued with no
runner/deploy attempt. GitHub Status confirms an Actions incident affecting
hosted runner assignment/start times (19:11:58UTC start;20:39:27UTC update).
External wait has no ETA; do not redispatch duplicate runs or weaken gates.
Recovery37334212154 still waits for required reviewer; deployment is incomplete.

Older sections are historical.

---

# Recovery workflow registration checkpoint - 2026-10-05 UTC

Executable recovery `7f59afa`, registration remediation `aea900d`.
PR46 and47 are merged; current main080b78b has green exact-main push CI37330231950.
Full local recheck and hosted recovery CI each pass248 files /5639 tests.

Actual recovery dispatch is blocked before run creation: GitHub Actions workflow
index/web/GET and CLI/REST dispatch return404 for the new dispatch-only recovery
file, despite its presence on default main and valid actionlint schema. No run,
production approval, Worker change or D1 mutation was performed. The provider
registration cause is unresolved; invalid source syntax is not evidenced.

Minimal remediation adds a main-push registration job containing only echo, with
no checkout, production Environment, secret reference or production tool. The
production gate now explicitly requires workflow_dispatch/main/confirmtrue;
recover still depends on that gate and all authorization checks reject push.
Actionlint1.7.12, lint, diff check and13 approval tests PASS; independent review
finds no blockers. Full hosted PR/main CI remains required before dispatch.

Staging0039 certification37331557226 SUCCESS at080b78b: already-present39 ledger,
no migration applied, FK0/quick_checkok/schema gate/T20 constraints/aggregate
checks pass. Runtime readiness is pending. Staging application Deploy is held
until the final main SHA and green CI; production remains old136cb6ff static
fallback, ledger38. Next: merge green registration checkpoint, require green
exact-main CI, verify Actions registration, then reviewed restore-v1 plus normal
independent production Environment approval. Catalog/migration/deploy mutations0.

Earlier checkpoint status is historical.

---

# Production V1 catalog recovery checkpoint - 2026-10-05 UTC

Executable checkpoint `7f59afa` on `codex/production-v1-recovery` starts from
merged guard PR #45 / main `603c4404bebd53fce711b47c9d5cef9b30ce2bfa`.
Exact-main guard CI [37320114700](https://github.com/vn-tak/Tako-san/actions/runs/37320114700)
succeeded. User confirms no real users; user-data retention certification is
excluded. Source restoration uses certified V1, without assigning ambiguous
positions to the live ingredient population or claiming proven corruption.

Independent implementation reviews found no remaining blockers. The recovery
workflow binds the final merged PR head to the complete exact-main tree and CI,
normal independent production Environment approval and the shared production lock.
It first clones the exact old Worker source/runtime/bindings/assets with only
catalog static/0/cutover=false, then imports one atomic generated catalog batch.
Unknown provider metadata stops before mutation. Lost import response records an
unknown outcome requiring inspection; it never blindly retries or rolls back.
Catalog-only archive rollback requires the unchanged generated target and the
same pinned static Worker. Historical migrations and unrelated tables are intact.

Validation: targeted four suites / 56 tests PASS; lint, typecheck, migration
smoke, production build, syntax and diff checks PASS. Actual local workerd D1
restore and rollback PASS with pinned Wrangler 3.114.17: restore hydrates 500
recipes at fingerprint `f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`,
ledger38/FK0, archive6720; rollback restores6720/order0/FK0. A local compound
SELECT parser limit was reproduced and fixed by using VALUES. Full-suite result
first run: 5638 PASS / one unchanged Wrangler timeout; narrow recheck32 PASS.
Full recheck248 files /5639 PASS (522.82s). Hosted final-head CI
37327411648 also248 /5639 PASS, lint/typecheck/migration smoke/build PASS.
PR46 merged at9fbaffa; exact-main push CI is pending before remote execution.

Production still serves the old Worker `136cb6ff3d2921eac237c7b106b37ab5ee12a13f`
on static fallback, ledger38/0038/order0/hydration0. Remote recovery, migration
and new application deployment counts remain0. Next: merge green recovery PR,
require exact-main CI, run protected recovery and retain aggregate evidence;
then guarded0039, staging and production Deploy with immutable release inputs.
Report: [PRODUCTION_V1_CATALOG_RECOVERY.md](recipe-catalog/PRODUCTION_V1_CATALOG_RECOVERY.md).
Earlier sections are historical and their open-PR claims are superseded.

---

# Production release readiness handoff - 2026-10-05 UTC

**State:** Local executable checkpoint81255c1 on
`codex/production-release-guards`, clean GitHub-main baselineb00eb135.
Guard changes are locally validated; recovery and deployment remain pending.

**Evidence:** PR44 merged/approved (`vn-taphoanhatung`, review5414445860).
Exact-main CI37311349308 SUCCESS. Protected SELECT-only diagnostic37316530751
SUCCESS; normal production approval verified; artifact11347714770 digest
`sha256:8f51ed149a148d6c03199f4fd067d2df1551efd221f14b8c05865501e03deca8`
verified. Production ingredient population is not an exact V1 or committed V2
identity projection; assigning historical order to live rows is unsafe.

**Changes:** Fresh live-main/exact-SHA CI before uploads, rollback only after
upload attempt;0039 pre-mutation V1 runtime/ledger proof and shared production
lock. Worktree-safe historical Git object fixture. No applied SQL changed.

**Checks/failures:** Full244 files/5,583 PASS (one worker, canonical macOS temp,
UTC); targeted5/418 PASS; lint/typecheck/local migration smoke/build/diff PASS.
Earlier two-worker full run had one existing Wrangler subprocess timeout; no
assertion or timeout weakened. Production audit high/critical0; existing dev
toolchain audit has14 high findings, documented without speculative upgrades.

**Next:** Finish archived V1 restore/revert rehearsal and review; pin old Worker
static first to avoid automatic D1 activation. Certify500/fingerprint before0039.
Then stage/deploy current main and verify exact active SHA and served authority.
Production Worker136cb6ff remains on static fallback; remote repair/migration/
application deployment0. Guard merge changes review-bound bytes for future C2T
runs but does not invalidate the completed clean-main diagnostic evidence.

**Report:** [PRODUCTION_RELEASE_GUARDS_20261005.md](recipe-catalog/PRODUCTION_RELEASE_GUARDS_20261005.md).
Historical handoffs follow; their open PR/approval claims are superseded here.

---

# T21R-C2T-P1 invalid Action pin remediation handoff — 2026-10-05 UTC

**State:** `T21RC2T_P1_FIXED_READY_FOR_INDEPENDENT_REVIEW`. Branch
`hoplite/mesambria-d133eda3--t21rc2t-pnpm-action-pin` from exact live main
`b3fd7baf9c25ae195bdc6f52ed9ca27f34cef455`; executable checkpoint
`b78283c746b8150ebfc65c0f814f721eccd26a48`. Final docs-inclusive head/CI
belong in the dedicated draft PR, not in a handoff containing its own hash.

**Evidence:** Run `37304008220` / attempt 1, capture job `111743275723`, failed
during **Set up job** resolving the old pnpm pin. Classification
`T21RC2T_CAPTURE_BLOCKED_ACTION_PIN_INVALID`; Cloudflare/capture/topology not
started, D1 SQL 0, no receipt, artifacts 0. Historical Environment approval was
verified, not performed by P1. Annotated upstream `v4.3.0` target
`b906affcce14559ad1aafd4ab0e942779e9f58b1` exists; old pin returns HTTP 404; other three pins exist.

**Changes:** Single pnpm `uses:` replacement, exact expected-pin allowlist and
offline negative regression, plus mandatory checkpoint/report docs. No C2/C2T
runtime logic, Node/pnpm/install, SQL, Environment, privacy, artifact or cleanup
change. Changed review-bound bytes invalidate prior review `5412451575`.

**Checks/failures:** Old tests passed 5/5 despite invalid pin; hardened assertion
failed as expected before fix (1 failed / 5 passed, exit 1). Post-fix 3 files /
62 PASS; established 14 / 539 PASS (C2T 6/119, C2 8/420); full 243 / 5,548 PASS,
575.88 seconds. Lint/typecheck/local migration smoke/build/diff checks PASS.
Real-Git workflow delta is one pin only; all 73 C2 bound specifications unchanged.
No post-fix failing/skipped gate; commands and recovered inspection issue in report.

**Next:** [PR #44](https://github.com/vn-tak/Tako-san/pull/44) is published and
confirmed draft/open/unmerged, no auto-merge; CI/review update subscription enabled.
Initial hosted CI in progress; no human reviews or unresolved threads at publication.
STOP; the update loop will resume when hosted checks or feedback settle. Required
fresh independent reviewer is `vn-taphoanhatung`; later merge actor `vn-tak`.
No self approval, ready conversion, merge, failed-run rerun or production dispatch.

**Boundary:** All P1 production operation counts 0. Corruption NOT PROVEN;
repair needs more evidence; 0039 relevance NONE; 0039/deploy NOT AUTHORIZED;
T21G NOT READY. The historical setup failure adds no production diagnostic facts.

**Report:** [`T21RC2T_P1_ACTION_PIN_REMEDIATION.md`](recipe-catalog/T21RC2T_P1_ACTION_PIN_REMEDIATION.md).
Historical implementation handoff below is preserved, not current PR/review state.

---

# T21R-C2T identity topology implementation handoff — 2026-10-05 UTC

**State:** `T21RC2T_IMPLEMENTED_READY_FOR_INDEPENDENT_REVIEW`; code checkpoint
`f191b48`, fresh `feat/t21rc2t-identity-topology-diagnostic` from certified
PR #42 main `5218b0b`. Draft
[PR #43](https://github.com/vn-tak/Tako-san/pull/43) is open, unmerged, with
auto-fix subscription enabled and no auto-merge. Final docs-inclusive head and
fresh hosted CI evidence belong in the PR; this checkpoint does not contain its
own hash. Independent required human review: NOT YET PERFORMED.

**Evidence:** Live baseline/repository/clean-checkout gate passed before editing;
main still matched before publication. Exact-main push CI 37261145409,
job 111608452594, attempt 1, SUCCESS, all five steps verified via GitHub GET.
Actual offline source/engine acceptance: V1 500/2,702, V2 500/6,766,
4,233/4,233 ING_ENR formula matches and 1,395 distinct matches, zero mismatches.
Synthetic full-scale, residual 65/6/59, candidate, multiplicity, shape, schema,
private/public accounting, determinism and privacy tests pass. These cannot
establish live production topology or authorize a repair.

**Changes:** New dedicated C2T workflow and approval/capture/files/source/topology/
receipt modules, closed receipt schema, design and six test suites/helper.
Review closure 119 unique specs (78 required files / 6 directories / 35 optional),
including all 73 C2 specs and full dynamic data/import/artifact trees. Existing
C2, V1, generator data, application/auth/payment, inventory/Week, Wrangler config
and migrations unchanged. Fixed production SELECTs unchanged; new production SQL 0.

**Checks/failures:**
- `TZ=UTC pnpm exec vitest run tests/unit/t21rc2t-*.test.mjs
  tests/unit/t21rc2-*.test.mjs tests/unit/t21rc-row-reconciliation.test.mjs
  --maxWorkers=1` — 14 files / 538 PASS; C2T 6/118, C2 8/420.
- `TZ=UTC pnpm exec vitest run --maxWorkers=1` — 243 files / 5,547 PASS,
  exit 0, 626.96 seconds on `f191b48`, Node 24.21.0.
- `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`,
  syntax checks and staged/baseline `git diff --check` PASS. Cloudflare credentials
  removed, telemetry disabled; migration smoke is sandbox-local SQLite only.
- Initial source-member omission, multiset-only fixture count and inconsistent
  final authorization fixture corrected and rerun. Internal audit's concept-
  alias labeling and exact-witness accounting gaps fixed with regressions;
  context-only/mixed coverage retained. No coverage/timeouts weakened.
- Environment availability flags are bound metadata, not actual approval use;
  compatible normal C2 approval remains allowed, actual self/skipped/bypass use
  remains rejected. No Environment access or policy change performed.

**Next:** Confirm final PR head/current-head CI, then separate T21R-C2T-R review
by `vn-taphoanhatung`. Keep draft; no mark-ready, self-approval, merge, production
dispatch/read, Environment approval, C2/C4I rerun, repair, 0039, canary or deploy.
Any automated branch advance requires renewed review of a new immutable head.

**Boundary:** Corruption NOT PROVEN; C2F ADDITIONAL_DIAGNOSTIC_REQUIRED;
repair REPAIR_NEEDS_MORE_EVIDENCE; 0039 relevance NONE/application NOT AUTHORIZED;
deploy NOT AUTHORIZED; T21G NOT READY. All production operations 0.

**Report:** `recipe-catalog/T21RC2T_IDENTITY_TOPOLOGY_DIAGNOSTIC.md`.

---

# T21R-C2F semantic drift / identity forensic handoff — 2026-10-05 UTC

**State:** Read-only forensic complete on branch `hoplite/dreros-8066d555` from main
`075be11`. Status `T21RC2F_ADDITIONAL_DIAGNOSTIC_REQUIRED`. Documentation only.

**Evidence:**
- Run 37202777157 attempt 1: success; head = execution SHA `075be110a868a9a9c4d6c24f20342c5ccb7017c4`.
- Artifact 11304380358 digest verified; five source digests and the authority proof
  reproduced offline.
- Prior failed run 37158525748: head is pre-C2S `b9bc66a`.
- Access was GitHub GET reads only: no production SQL, logs, private runner files,
  reruns or Cloudflare credentials.

**Changes:** New forensic report. No code, workflow, schema, migration, authority or
data change.

**Checks/failures:**
- Focused Vitest 6 files / 178 PASS.
- `pnpm recipe:import:check`, `recipe:refresh:check`, `recipe:ingredient-v2:audit`
  PASS; `recipe:refresh:release-check` BLOCKED (expected, four blockers).
- A delegated runtime-impact exploration stopped (platform inference credits
  exhausted); the runtime trace was redone directly.
- Full lint/typecheck/test/build not rerun locally (documentation only).

**Next:** Independent review. Then a separately authorized C2T hashed identity
topology diagnostic (report §17) before any remediation or release-authority
decision. Do not repair, deduplicate, rewrite IDs, apply 0039, rerun C2 or deploy.

**Report:** `recipe-catalog/T21RC2F_SEMANTIC_DRIFT_IDENTITY_FORENSIC.md`.

---

# T21R-C2S schema-boundary handoff — 2026-10-04 UTC

**State:** Offline implementation verified at code checkpoint `946a7be`, branch
`codex/t21rc2s-schema-forensic`, certified base
`b9bc66acfe660329103c08be1f5cff90ed175aba`. Draft PR
[#41](https://github.com/vn-tak/Tako-san/pull/41); final docs-inclusive head and
attempt-1 hosted CI receipt belong in the PR. No independent review or execution
authority is granted here.

**Evidence:** Task-provided run 37158525748 attempt 1 completed reconciliation but
failed schema validation; capture/cleanup PASS, snapshot OBSERVED_STABLE_NON_ATOMIC,
artifacts 0. Production relation to V1 remains UNKNOWN. Original certified-main
module bytes reject minimized exact-plus-unknown and exact-plus-conflict cases
only at schema; aggregate and digest PASS. The production-only condition is
unverified, not inferred from the older generic run.

**Changes:** Fix unique target candidate publication without changing the closed
schema. Keep competing identity/content evidence ambiguous and intact; publish
only satisfying unique witnesses and preserve P1 A3 exact-tuple compatibility.
Actual schema validation privately brands failures; static allowlists/rules
reconstruct four safe fields, with unknown fallback, conditional/reference
coverage and single-read accessor protection. Preserve six C2D stages, aggregate/
digest guards, capture/SQL/11 reads, V1, C4I, workflow and 73-entry closure.
Old reviewed head `95b1746819c4690d267985ce55cb0ba673373a95` rejects intentionally.

**Checks/failures:** Final focused 8 files / 420 PASS. Exact full command
`TZ=UTC pnpm exec vitest run --maxWorkers=1`: 237 files / 5429 PASS, exit 0,
676.74 seconds. `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`,
`pnpm build`, `git diff --check` PASS. First full invocation was interrupted at
the 600-second command limit (exit 124); rerun budget 1800 completed unchanged
coverage. Initial .ts declaration failure, overbroad A3 guard and test loader
newline failure were fixed. One auxiliary concurrent-load C2D stress timeout
recovered in standalone/final focused runs; no test threshold was weakened.
Real credential-free classify CLI, privacy adversaries and deterministic
unknown/known diagnostics PASS. Synthetic 500/2702 structures cover 2702, 3002
and 8106 production rows, target-only input and 2702 candidates.

**Next:** Require fresh exact-final-head attempt-1 PR CI, then independent review
of that immutable SHA. Auto-fix subscription is enabled and may advance the branch;
no review authority follows a moving head. PR stays draft; no auto-merge, merge,
C2/C4I rerun, Cloudflare credential use, production SQL, repair, secret/token
change, 0039 or deploy. Production counters 0; token scope UNKNOWN/read-only proof
false; repair NOT_AUTHORIZED; T21G_NOT_READY. Separate baselineComparison aggregate
gap remains documented and outside this schema-only remediation.

**Report:** `recipe-catalog/T21RC2S_SCHEMA_BOUNDARY_FORENSIC.md`.

---

# T21R-C2D classification diagnostics handoff — 2026-10-03 UTC

**State:** Implementation on `codex/t21rc2d-classification-diagnostics` from
certified main `78313ab`; code checkpoints `fbce4a1`, `3054b4a`, `4be7e18`.
Final docs-inclusive head and CI receipt belong in the draft PR.

**Evidence:** Run 37135187427 captured a stable non-atomic snapshot but did not
complete classification. Gate/capture/cleanup PASS, artifact SKIPPED; production
relation to V1 remains UNKNOWN. Metadata-only inspection, no production rows/logs.

**Changes:** Six fixed classification subcodes and a static code/stage-only
failure diagnostic; separate schema/aggregate/digest validators; classify-time
authority failures categorized. Proven offline fixes keep broken parents
malformed/unattributed and validate recipe-local references, recipe status and
derived drift/conflict indexes. Schema, V1, SELECTs, capture, private storage,
workflow, package/lock and C4I are unchanged. Historical rejection cause unresolved.

**Checks/failures:** Baseline 7 expected FAIL / 5 PASS; five additional aggregate
repros FAIL before their fix. Final focused 6 files / 375 PASS. Final `pnpm lint`,
`pnpm typecheck`, `pnpm check:migrations`, `pnpm build`, `git diff --check` PASS;
`TZ=UTC pnpm exec vitest run --maxWorkers=1`: 235 files / 5384 PASS, exit 0.
Hosted CI pending at this documentation checkpoint; final head/run/job/count
receipt belongs in the draft PR. One interim padded-digest assertion was corrected
to expect the earlier schema-stage rejection; no validation was loosened.
Offline authority 500 recipes / 2702 occurrences with certified release/fingerprint.
All nine enum families match; no generic schema weakening. Old C2 reviewed head
`a0d4bf9` rejects intentionally; 73-entry closure unchanged; C4I still binds.

**Next:** Require fresh attempt-1 exact-head PR CI and independent review of six
boundaries, sanitized receipts/CLI, every contract correction and divergence/key
fixtures. No merge, C2/C4I rerun, SQL, repair, credential/secret change, 0039 or
deploy. Production counters 0; repair NOT_AUTHORIZED; T21G_NOT_READY.
Report: `recipe-catalog/T21RC2D_CLASSIFICATION_DIAGNOSTICS.md`.

---

# T21R-C4L Wrangler parsed-stdout remediation handoff - 2026-10-03 UTC

Finding `T21RC4_WRANGLER_LOG_SUPPRESSION_BUG_CONFIRMED`: under the lockfile's
Wrangler 3.114.17 (spec `^3.114.0`, unchanged), `WRANGLER_LOG=error` suppresses
`logger.log`/`logger.table`, emptying the whoami account table, `d1 list --json`
and `d1 execute --json` stdout that C4I/C2 parse. Fix: C4I child env and C2
`parsedWranglerStdoutEnvironment` (renamed from `captureExecutionEnvironment`,
used by identity and fixed SELECTs) set `WRANGLER_LOG='log'`; stdio stays piped,
debug-log sink/path, commands, SQL allowlist and all validation are unchanged.

C4I runs 37124563415 and 37128183771 and C2 run 37084988593 cannot prove an
account mismatch; their identity conclusions are
`INVALIDATED_BY_WRANGLER_LOG_SUPPRESSION_BUG` (run/gate/approval facts, whoami
command success, zero C4I SQL and zero mutation remain valid). The
operator-reported `CLOUDFLARE_ACCOUNT_ID` update before 37128183771 occurred, but
correctness is `UNVERIFIED_PENDING_FIXED_C4I`.

Old reviewed SHAs are intentionally void: C4I `a0c1cfd` → remediation head
rejects `T21RC4I_REVIEW_BINDING_REJECTED`; C2 `93c4055` rejects
`T21RC2_REVIEW_BINDING_REJECTED` (both still accept `0e6342f`; closures not
weakened). A new exact head needs independent review covering both C4I and C2
execution surfaces. Reviewer scope A-J (Wrangler 3.114.17 source; C4I whoami/list; C2
whoami/list/execute; privacy; no SQL authority expansion; both old bindings
invalidated) is listed in `recipe-catalog/T21RC4L_WRANGLER_PARSED_STDOUT_REMEDIATION.md`.

Local: focused C4I 4 files / 103 PASS, C2 4 files / 256 PASS; regressions fail
(10) with scripts reverted to `error`. `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`, `git diff
--check` PASS; `TZ=UTC pnpm exec vitest run --maxWorkers=1` 234 files / 5,322
PASS (Node 24.21.0).

No production C4I/C2 run, Environment approval, D1 SQL, secret/token mutation,
migration, 0039 or deploy. `SAFE_TO_RUN_C4I=NO`, `SAFE_TO_RUN_C2=NO`;
T21G_NOT_READY. Next: independent security review of the exact head (both
surfaces); do not merge or dispatch.

---

# T21R-C4I remediation handoff - 2026-10-03 JST

Draft PR #38 on `codex/t21rc4-cloudflare-identity-diagnostic` remains the sole
integration vehicle. The independent review of head
`a5966c7fa27b67d16ff02acb753cd2bc82c372fa` required 2 P1 and 2 P2 fixes.
This additive remediation introduces a separate reviewed-byte/exact-main-CI gate,
validates the exact normal production approval and policy before credential use,
matches C2's account-ID syntax, and splits command failures from malformed D1
responses. The C2 73-path closure and historical production failure are intact.

Local checks: focused C4I+C2 8 files / 340 PASS; full UTC Vitest 234 files /
5,303 PASS; lint, typecheck, migration smoke, build and diff PASS. The final
source of truth is the new remediation commit and its fresh hosted PR CI, not the
old CI run 37114032245. At handoff, production diagnostic/C2 rerun/Environment
approval/SQL/secret changes/0039/deploy have not occurred. Token scope remains
UNKNOWN. Next: confirm new exact-head PR CI, then request independent delta
review; keep PR draft, do not merge or dispatch production.

---

# T21R-C4I metadata identity diagnostic handoff — 2026-10-03 JST

**State:** `T21RC4I_IMPLEMENTATION_READY_FOR_REVIEW`, not live certification.
Repository `vn-tak/Tako-san` / 1385308553; branch
`codex/t21rc4-cloudflare-identity-diagnostic`, base
`7cd58968c3b4c0f7936c75d74b6965d229b57c69`. C3 protected integration is certified;
C2 reviewed head `93c4055a42cd2d94f4db296d8ca10d555c2c52c2` remains eligible subject
to future-main byte equivalence/ancestry/CI and unchanged gates. Verified published
code checkpoint `81646b0e6389fe61ea04db5892dec8ee597693f9` matches local tested
`dfad66da7706bf315e4b0e27b0e471b9ce71cb83` tree `00c68d1b21f9dd965a1936632ee479b1320d16f2`.
API author/date metadata changes SHA; local source history is preserved. Final
completion-doc head is verified/reported externally to avoid a document self-hash.

**Implementation:** Four new diagnostic workflow/script/test files, dedicated
report and minimal status/ADR notes. Manual/main-only/attempt-1, production
Environment, shared `frigo-deploy-production` lock, no cancellation, contents-read
only, immutable certified Actions, exact workflow SHA checkout, frozen tooling.
Credentials only in final script-step env. Fixed whoami/list calls; A–H stage
receipts, strict config and early aborts, private captured output, 0700 null-sink
Wrangler log setup/cleanup, no raw artifact. Formatter allowlists every field and
keeps read-only proof false. Stage B lowercase syntax is intentionally stricter
than unchanged C2; a new observation is not retrospective credential proof.

**Executed:** Focused pnpm10 6 files / 308 PASS (35 diagnostic, 26 static/workflow,
148 approval, 70 capture, 8 receipt, 21 C2 workflow). Compatibility fixtures
compare eight configs to the existing verifier. Real local Git reviewed-SHA /
additive-diagnostic regression passes; bound-byte mutation rejects. Lint,
typecheck, real local SQLite 3.45.1 migration smoke, web/Worker build and Node
syntax/diff PASS. Final `pnpm exec vitest run --maxWorkers=1` with default/JSON
reporters: UTC 232 files / 5,271 PASS, zero skips, exit 0, 494.41 seconds.
External Node transport blocked; one attempt per full run denied before network
use, two separate positive guard probes also denied. Proxy variables cleared;
all new Wrangler test calls mocked. No unrestricted or hosted C4I result claimed.

**Failures / resolution:** pnpm11 auto-install refused an outside-root worktree
modules link before tests; preserve modules/use isolated pnpm10.34.6 without
package/lockfile change. First direct focused run: 282 tests PASS, one workflow
suite parse failure from dot access to a hyphenated property; correct brackets
and syntax checks, then 308/308 PASS. First completed full run inherited PDT:
5,269 PASS / 2 FAIL (weekday/expired-OTP). Preserve that receipt; unchanged two
suites pass 32/32 under test-process UTC, then fresh full UTC PASS. No application,
Week/auth, assertion, timeout, selection, dependency or security guard changed.

**Live evidence / limits:** Task error T21RC2_IDENTITY_REJECTED in run 37084988593
attempt 1, actor tako-vn1, exact certified main. GitHub jobs confirm gate/approval
validator SUCCESS, capture FAIL, subsequent publication steps skipped, cleanup
SUCCESS. Source identity proof precedes any fixed SQL: historical D1 SQL 0/0,
mutations 0; metadata calls POSSIBLE / NOT FULLY DISTINGUISHABLE. No raw log read.
Current diagnostic NOT_RUN; no C2 rerun, Cloudflare call, production SQL/mutation,
Environment approval/policy edit or secret/token mutation by this implementation.
Token scope UNKNOWN, read-only-unproven; production identity cause still unknown.

**Next:** Independent review of final published C4I head before PR. Any later
protected integration and metadata-only execution need separate authority and
normal independent Environment approval. Never bypass, self-approve, change
secrets/tokens, run SQL or rerun C2 based on diagnostic completion. Future C2 ref
must be actual post-diagnostic current main with existing exact-main/binding gates.
T21G_NOT_READY, repair NOT_AUTHORIZED, 0039/deploy STOPPED, delivery UNCONFIGURED.
Report: `recipe-catalog/T21RC4I_CLOUDFLARE_IDENTITY_DIAGNOSTIC.md`.

---

# T21R-C3 dispatch readiness handoff — 2026-10-03 JST

**State:** `T21RC3_IMPLEMENTATION_READY_FOR_REVIEW`;
code, local checks and approved documentation publication complete, not production
ready. Owner login/write access works.
Repository `1385308553` / `vn-tak/Tako-san`; branch
`codex/t21rc3-production-dispatch-readiness`, exact starting main
`0d4fe89b7ccc72e013aafe53665059d0e62bd3b4`. Historical PR36/C2 protection and
exact-main push CI `37008867187` are verified. Tested code checkpoints
`57edc3ac9c2b3f86d28774c0c26bb1e9a961746e` and
`a34ec5e3245b5fdc6718c611ae23dcea6f56eb4c`; final documentation follows, so its
own/future publication SHA is not embedded here. The recovery receipt records the
historical local-only head. GitData publication code checkpoint
`e49c60a176cec80593e8b8644d058341cfeca720` has the certified base as parent and
exact tested executable tree `5b20d72eeb4f0077ac17b0d0e8584e4596292fb3`.
API commit metadata changes its SHA; original local checkpoint history is kept.
Final docs-inclusive remote head must be fetched/verified and reported externally.

**Implemented:** Official upstream commit pins for checkout/setup-node/pnpm/
upload-artifact, six external uses, no mutable refs. Production workflow only
changes Action identity; CI remains unchanged/full history. Gate and receipt's
current repository guards use the transferred name; the certified target's
review-time name/bytes remain intact. Static mutation tests and real-Git pin
binding tests preserve all 73 closure entries. Documentation supplies the future
operator packet and metadata governance/token-scope results; no dispatch helper.
One AI test's accidental call-through fetch is replaced by a synthetic 401,
with existing assertions intact, to make required full validation fixture-only.

**Executed:** Focused C3/C2/C/B/release command 8 files / 556 PASS; C2 suite counts
148 approval, 70 capture, 8 receipt, 21 workflow. Guarded provider/governance/scan
and local D1 6 files / 128 PASS. Final full `vitest run --maxWorkers=1` with
default/JSON reporting: 230 files / 5,210 PASS, zero skips, exit 0. Lint/typecheck/
local SQLite migration smoke/build/syntax/diff PASS. pnpm 10.34.6 and extracted
real SQLite 3.45.1 CLI; package/lockfile unchanged. Test proxy variables cleared,
temporary Node loopback-only preload outside repo; one remote transport attempt denied
before network use. Earlier partial full runs are not passing receipts. Exact
commands, installer/proxy/name-guard failures and automatic egress-review
rejection/resolution are in the scoped report.
The exact published code checkpoint was rechecked with the existing local Vitest:
C2 4 files / 247 PASS, 11.39 seconds, under the same loopback-only/proxy-cleared
environment. The first attempt failed only because the prior scratch pnpm.cjs
entrypoint no longer existed; no installation or dependency change was needed.

**Governance / limits:** Public GitHub Environment GET at 2026-10-02T18:22:04Z:
production `22649920074`, exact User reviewer `vn-taphoanhatung` / `329713999`,
self-review prevention false, admin bypass available true, branch policy null.
No policy change; availability is not use. Existing normal-approval validator
still rejects self/skipped/bypass/wrong reviewer or Environment and reruns.
Metadata-only audit PASS; live approval unverified/NOT_RUN. SELECT-only path true;
Cloudflare read-only token scope unproven/UNKNOWN. No token metadata call/mutation.
Application/T19/T20/config/canonical/migrations/CI and 73-path list unchanged.

**Publication access:** Earlier normal Git push failed because no CLI credential was
available. First workflow-blob write through the `takovn2` connection returned
403 `Resource not accessible by integration`; no remote blob/tree/commit/ref or
PR was created. Installation metadata for `takovn2` and `tako-vn` lists only
those respective owners, not `vn-tak`. No write via the second connection or
reviewer account, permission mutation or bypass was attempted. The generic error
did not prove a particular missing scope. The current `vn-tak` connection now
verifies profile/owner `335007142`, installation `167341024` and actual workflow
blob writes. Use normal GitData publication with this selected connection;
preserve original local history, check trees, fetch and compare exact final heads.
No login, permission mutation or reviewer-account write is needed. The earlier
recovery ZIP remains historical and is superseded for current status.
C3 hosted CI has not run.

**Publication:** Earlier automatic approval review rejected the full historical
CURRENT_STATE payload, its evidence-based retry, and the compact C3 report for
public operational metadata without explicit payload/destination consent. The
user confirmed all five documents from the preserved approval packet for public
`vn-tak/Tako-san` on 2026-10-03 JST, including completion status updates.
Their documentation checkpoint follows `e49c60a176cec80593e8b8644d058341cfeca720`
through a normal feature-ref update. All tested executable bytes and original
local history are preserved. Final documentation-inclusive local/remote SHA and
tree equality are in the external completion receipt, avoiding a self-hash.
No login, permission expansion or production operation was required.

**Boundary / next:** Obtain independent review of the final published C3 head
**before opening a PR**.
Old reviewed head `63739c56` is invalid for a post-C3 main: future `reviewed_sha`
is the independently approved final C3 head; future `ref` is exact post-merge
current main with successful push CI and byte-identical closure. Complete safe
metadata placeholders and the operator's unresolved token-scope risk decision.
Require fresh normal independent production approval only for a separately
authorized new attempt-1 capture. No PR/merge/dispatch/approval/D1 read/write/
Cloudflare SQL/restore/0039 apply/deploy in C3. LIVE capture NOT_RUN, T21G_NOT_READY,
repair NOT_AUTHORIZED, 0039/deploy STOPPED, row delivery UNCONFIGURED.
Report: `recipe-catalog/T21RC3_PRODUCTION_DISPATCH_READINESS.md`.

---

# T21R-C2 PR #36 CI-history remediation handoff — 2026-10-02 UTC

**State:** Narrow local Git-history environment correction; not new independent
approval, merge readiness or production authorization. Same C2 branch, PR #36
OPEN/unmerged, repository `1385308553` / `vn-tako4/Tako-san`; verified reviewed
pre-fix head `3e1bb60b7afa9706fca6bfed41252bfd4d421cdd` and base main
`518818458a354c5e180da52ae9bb73c9d3c1af78`. This checkpoint cannot embed its own hash
or future hosted run ID; final exact-head results are retained in PR checks and
`.hoplite/artifacts/t21rc2-pr36-ci/`.

**Implemented:** CI checkout now `fetch-depth: 0`, plus one regression in the
existing C2 static workflow suite requiring historical Git objects. Hosted old
run `37002486858` / job `110823126447` had depth 1 and fetched only synthetic
merge `db7728d0203089e8f35897f2fff2f2e35437e026`. Offline shallow fixture reproduces
missing certified-main object -> `T21RC2_LEDGER_CHANGED`; full-history helper
still yields exact first 38 of 39 repository names through 0038. No actual ledger
drift, guard relaxation, authority substitution or unit-test network call.

**Executed:** C2 command PASS, 4 files / 229 tests; focused C2/T21R-C/B/release
command PASS, 8 files / 538. `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`,
`pnpm build` PASS. Full single-worker 230 files / 5,192 PASS, 701.72 seconds.
Exact commands and syntax/diff checks are
in `recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`. Initial direct-path
shallow clone ignored depth/failed hardlink; corrected offline file-transport
clone proved diagnosis and was removed. No timeout/assertion changes.

**Production boundary / limits:** No production dispatch/Environment approval/
Cloudflare call/D1 read/mutation/restore/migration/0039 apply/deploy. Local smoke
fixtures only. No production workflow, versions, config, classifier/schema/target,
73-entry closure or ledger policy change. Old independent review of `3e1bb60b`
does not authorize new CI bytes. Delivery UNCONFIGURED / DELIVERY_NOT_AUTHORIZED;
T21G_NOT_READY, repair NOT_AUTHORIZED, 0039/deploy STOPPED.

**Next:** Normal push of one narrow commit, inspect automatically triggered PR36
CI at its exact new head, require all five hosted gates PASS; if it fails, stop
INCOMPLETE with run/job/failure. Then independent delta review from `3e1bb60b`
and renewed approval before merge. Do not close/create another PR or dispatch.
PR auto-fix subscription is enabled; this packet's no-fix-piling stop remains.

---

# T21R-C2 review-binding remediation handoff — 2026-10-02 UTC

**State:** `T21RC2_REMEDIATION_READY_FOR_REVIEW`, not re-approved or production-ready.
Repository `1385308553` / `vn-tako4/Tako-san`; same
`codex/t21rc2-protected-production-row-read`, reviewed parent
`8d8028f3e3358655b19fa2dd02ba883e57c52204`, verified prior implementation
`ad7b3012`, certified base main `518818458a354c5e180da52ae9bb73c9d3c1af78`.
One logical remediation commit follows that reviewed head without rebase/squash;
its own hash is resolved by final Git/provider verification, not embedded here.

**Implemented:** P1 binds the current ref's 73-entry security/execution closure
to the exact reviewed implementation bytes in addition to preserved ancestry/
main/CI/normal approval guards, rejects equal SHAs, and gates candidate output,
pre-Cloudflare capture and final publication recheck. Full dependency tracing and
optional auto-config absence/addition semantics are documented. P2 success
receipt: `queryPathSelectOnly=true`, `tokenScopeReadOnlyProven=false`; no token
introspection or override. Failure omits both because path attestation can fail
before execution. No workflow/capture/classifier/schema/target/runtime redesign.

**Executed:** `pnpm exec vitest run tests/unit/t21rc2-*.test.mjs tests/unit/t21rc-row-reconciliation.test.mjs tests/unit/t21rb-v1-semantic.test.mjs tests/unit/t21rb-v1-production.test.mjs tests/unit/release-check.test.mjs --maxWorkers=1`
PASS, 8 files / 537 tests (C2 228, T21R-C/B 73, release 236).
`pnpm exec vitest run --maxWorkers=1` PASS, 230 files / 5,191, 608.00 seconds.
`pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`, script
syntax, diff and protected-path checks PASS. Real temporary Git A–L/binding/
addition regressions and API mocks only. Initial test-helper import/scope errors
were fixed; no timeout/assertion weakened. Bounded agent review found no material
issue in guard/P2 logic and passed 151 tests; it did not re-audit the full closure.

**Production boundary / limits:** Zero production read/Cloudflare call/dispatch/
mutation/SQL write/Environment approval/restore/migration/0039 apply/deploy; no
production secrets, PR or merge. SQLite smoke writes throwaway local fixtures
only. Approval history, fixed SELECTs, two-read stability, row privacy and no
row-manifest upload remain unchanged. Row delivery `UNCONFIGURED` /
`DELIVERY_NOT_AUTHORIZED`. No human re-approval or hosted delta-head CI is claimed.

**Next:** Normally publish exactly one logical remediation commit after the
reviewed head, verify remote/local equality, then stop for independent delta
review from `8d8028f3` to that published HEAD **before opening any PR**. No
production authorization or delivery configuration. `T21G_NOT_READY`, repair
NOT_AUTHORIZED, 0039/deploy STOPPED. Closure/checks/failures:
`recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# T21R-C2 executable protected row-read handoff — 2026-10-02 UTC

**State:** `T21RC2_IMPLEMENTATION_READY_FOR_REVIEW`, not production-ready.
Repository `1385308553` / `vn-tako4/Tako-san`; correct branch
`codex/t21rc2-protected-production-row-read`, exact base/start
`518818458a354c5e180da52ae9bb73c9d3c1af78`, exact-main CI `36972970904` SUCCESS.
Verified executable implementation `ad7b3012` (`ad7b3012fc13c53948cdf7cbac4362df2662dee5`)
normally pushed; provider HEAD equaled local implementation. Old wrong-direction
`9542e112` preserved on its old local branch, excluded from C2 and never pushed.
This handoff is a later documentation checkpoint, not its own hash claim.

**Implemented:** Dispatch-only C2 workflow and four scripts for hardened main/CI/
ancestry and normal independent approval, exact account/database/config identity,
fixed SELECT execution, complete ledger/count/roster/two-read capture, credential-free
original classifier/schema, private runner-temp files/logs and aggregate-only
success receipt. Skipped/admin-bypass/self approvals and unbound reruns fail.
Actual approval API shape is tested; current bypass availability is not bypass
use. Fresh main is queried before credential use and final aggregate publication.
Row delivery remains `UNCONFIGURED` / `DELIVERY_NOT_AUTHORIZED`; no storage built.

**Executed:** `pnpm exec vitest run tests/unit/t21rc2-*.test.mjs tests/unit/t21rc-row-reconciliation.test.mjs tests/unit/t21rb-v1-semantic.test.mjs tests/unit/t21rb-v1-production.test.mjs tests/unit/release-check.test.mjs --maxWorkers=1`
PASS, 8 files / 455 tests (C2 146, T21R-C/B 73, release 236).
`pnpm exec vitest run --maxWorkers=1` PASS, 230 files / 5,109, 525.17 seconds.
`pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`, C2 syntax,
working/staged diff and protected-path reviews PASS. Initial fixture/module
integration failures and synthetic 5-second setup timeout are recorded, not hidden;
fixture preparation moved to `beforeAll`, assertions/timeouts unchanged. Independent
agent review found no material defect. Exact logs/checks are in the report.

**Production boundary / limits:** No production read, Cloudflare production call,
dispatch, Environment approval, mutation, operational SQL write, restore,
migration/0039 apply, deploy or flags; no PR/merge. Local SQLite tests use
throwaway fixtures, including their existing schema replay. No T19/T20/household/
inventory/Week, original classifier/schema, dependency or existing workflow change.
No live row receipt, hosted C2-head CI or human approval; normal code publication
does not authorize production. Raw/full manifests are never Actions artifacts.
Same observed A/B permits only `OBSERVED_STABLE_NON_ATOMIC`, not atomicity.

**Next:** Independent review of the actual published C2 executable workflow,
approval, query, schema binding, privacy/failure path and receipt before any
production authorization. Do not dispatch or configure row delivery in this task.
Keep `T21G_NOT_READY`, repair NOT_AUTHORIZED, 0039/deploy STOPPED.
Report: `recipe-catalog/T21RC2_PROTECTED_PRODUCTION_ROW_READ.md`.

---

# T21R-C P1-only remediation handoff — 2026-10-02 UTC

**State:** `T21RC_REMEDIATION_READY_FOR_REVIEW`; mandatory local validation PASS.
Branch `codex/t21rc-row-level-reconciliation`, repository `1385308553` /
`vn-tako4/Tako-san`, reviewed head `32ab51d35976e5174f73a544729f8bd7fd20e02c`
(implementation ancestor `ec24101`). One remediation checkpoint follows that
head without rebase/merge/squash. Its own hash is not embedded in its handoff;
verify the exact local/remote HEAD with Git. Existing `.context/` is preserved.

**Implemented:** Explicit exact-tuple balance plus membership before satisfaction;
direct V1 identity precedes bridge lookup, without general registry precedence
or relaxed bridge predicates. Six new A1–A3/B1–B3 regressions; old tests intact.
Pre-edit A cases already met fail-closed expectations; B1/B3 reproduced the
wrong production-only/missing classes. No other implementation semantics changed.

**Executed:** T21R-C 57/57 and regression set 73/73 PASS; lint/typecheck/local
in-memory migration smoke/build/syntax/formatting/diff PASS. Full
`pnpm exec vitest run --maxWorkers=1` PASS: 226 files / 4,963 tests,
678.21 seconds. No timeout/assertion edited, failures encountered in required
checks, two-worker retry, dependency re-audit or upgrade.

**Production boundary / limits:** No production read/write, workflow dispatch,
approval, restore, migration/0039 apply, deploy or repair. Schema/taxonomy/V1/V2/
runtime/privacy unchanged. No live row receipt or independent approval exists.

**Next:** Independently review the single normally published remediation delta
from `32ab51d` to the exact verified local/remote HEAD. Normal push is authorized
after these passing checks; no self-approval, PR, merge or production dispatch
preparation; `T21G_NOT_READY`, repair/0039/deploy STOPPED.

---

# T21R-C protected row-level evidence handoff — 2026-10-02 UTC

**State:** `T21RC_OFFLINE_DESIGN_READY`. Offline implementation/design completed on
`codex/t21rc-row-level-reconciliation`; base/source main `a828b6354e29d89268a3d11c874158eb5ecb997c`,
repository `1385308553` / `vn-tako4/Tako-san`. Verified implementation
`ec24101` (`ec24101bd906b820d3a6ac29dcc179dd62a1d3fa`); this is a later documentation checkpoint,
not a self-referential commit claim. Existing `.context/` remains untracked
and untouched; no forensic workspace was reset.

**Implemented:** Pure deterministic occurrence classifier, closed schema,
shared byte-pinned V1 source loader (existing T21R-B CLI compatible), multiset
accounting, per-recipe/drift/conflict/review evidence and protected-read/privacy
design. Names/quantities/physical IDs stay local; no action class or repair SQL.
Mixed multiplicity, incomplete capture and alternate-ID false absence corrected.
V1 `rel-bd00a4f53fcaeee4` / 500 / 2,702 remains target; current approved bridges=0.

**Executed:** Focused 3 files / 67 tests PASS (51 new + 16 existing), actual
offline CLIs on synthetic certified-source 500/2,702 PASS, source proof/Ajv/
syntax/formatting/lint/typecheck/local migration smoke/build/diff PASS.
Two-worker full suite: 1 failed / 4,956 passed, 226 files; the unchanged existing
certification query test hit 5 seconds. Final unchanged
`pnpm exec vitest run --maxWorkers=1` PASS: 226 files / 4,957 tests in
837.08 seconds, including both formerly timing-out CLI-heavy cases.
Earlier 600-second attempt stopped with intermediate fixture/CLI timeouts;
another was interrupted for the final review fix. No test timeout or assertion
was relaxed. Dependency audit separately found 33 existing advisories (4 low,
17 moderate, 12 high, 0 critical); lockfile unchanged.

**Production boundary:** Historical source run `36943692146/1` is live diagnostic
evidence, not a new dispatch here. Approval GET corroborates `skipped` by admin
`vn-tako4`, not reviewer `vn-taphoanhatung`; data accepted with a governance
exception. No live T21R-C row manifest exists. New production reads/mutations,
operational SQL writes, restores, migrations/0039 applies, deploys and flags: 0.
Required local SQLite tests use throwaway fixtures only. No workflow/application/
PayOS/authentication/inventory/Week/T19/T20 code changed. No push, PR or merge.

**Limits:** No actual per-row 1,793 drift/20 conflict breakdown, no atomic
snapshot, physical position authority or stored-reference/nutrition certification.
Public Actions artifacts are not private; row delivery needs explicit privacy
approval. Fixed-query code is not proof of a read-only underlying token scope.

**Next:** Independent human review of classifier, schema, query fields, workflow permissions,
artifact audience and stability. A separately approved normal-reviewer read
packet is required for any future dispatch. Never use admin bypass for T21G,
migration or deployment. Keep `T21G_NOT_READY`, repair/0039/deploy STOPPED.
Report/schema: `recipe-catalog/T21RC_ROW_LEVEL_RECONCILIATION_DESIGN.md` and
`recipe-catalog/T21RC_ROW_RECONCILIATION_SCHEMA.json`.

---

# Production V2 existing_canonical_id review fail-closed handoff — 2026-09-30

Final P1 on PR #30: `existing_canonical_id` fails closed if `review` is present. Reviewed-new contract, recipe-id gate, and forensic flags unchanged. No production diagnostic, merge, 0039, restore, or deploy. Next: hosted CI on the new head, then independent approval.

---

# Production V2 lineage reviewed-reconciliation handoff — 2026-09-30

Final P1 on PR #30: reconciliation authority now matches the canonical review contract. `runtimePositionAuthority=false`, `ingestionPipelineProven=false`, `researchV2LineageProven=false`, `missingLinesCausallyExplained=false`. No production diagnostic, merge, 0039, restore, or deploy. Next: hosted CI on the new head, then independent approval.

---

# Production V2 catalog lineage diagnostic remediation handoff — 2026-09-30

PR #30 remediates forensic overclaims on the additive read-only V2 diagnostic. Implementation still grants no production mutation, no extra SELECT, and no runtime position write. `ingestionPipelineProven=false`, `researchV2LineageProven=false`, `runtimePositionAuthority=false`. Next: new-head hosted CI and independent review of false-positive lineage, cross-ID matching, provisional reconciliation, missing-line causality, relative vs runtime order, artifact privacy, and no mutation. Do not dispatch production diagnostics until merge + exact-main CI + operator approval.

---

# Production V2 catalog lineage diagnostic handoff — 2026-09-30

Main `252096cccf602d07d6e33067024c5df2d6ba8a3e` (PR #28) remains current; exact-main CI `36640577701` SUCCESS. Protected run `36653466481` confirmed production D1 `frigo-db` ledger 38/0038, 6720 ingredient rows, zero positions, 0/500 hydrated, and complete V1 line-ID mismatch. This documentation checkpoint follows the additive V2 diagnostic implementation. No production mutation, migration, restore or deploy. `FINAL_RELEASE_SHA=UNSET`.

Next: review/merge this PR, require new exact-main CI, then dispatch `Production D1 Read-Only Diagnostics` with production Environment approval. Use `production-catalog-v2-lineage-<run>-<attempt>` only as forensic evidence. Do not grant position writes from tooling alone. See `recipe-catalog/PRODUCTION_CATALOG_V2_LINEAGE_DIAGNOSTIC.md`.

---

# Production catalog lineage diagnostic handoff — 2026-09-30

Starting main `d0c670289534c33187181b2eb7192c05a2962e22` passed CI `36576510231`. Verified implementation commit `cd25370` adds the diagnostic; this documentation checkpoint follows it. The last protected production receipt `36577380500` reports 6,720 ingredient rows, zero order rows and 0/500 hydrated; it is not release certification. Local immutable 0038 replay gives 2,702 ingredient lines and 2,702 positions. This branch adds a runner-local V1 line comparison to the existing read-only production diagnostic, with sanitized aggregate/digest artifact and no additional remote query or secret exposure. `researchV2LineageProven=false`, `positionAuthority=NONE_GRANTED_BY_THIS_DIAGNOSTIC`, `FINAL_RELEASE_SHA=UNSET`. See `recipe-catalog/PRODUCTION_CATALOG_LINEAGE_DIAGNOSTIC.md`.

Prior PR #28 head `fe1d2e5` passed focused 14/14, controlled full Vitest 221 files / 4,823 tests, local `WRANGLER_SEND_METRICS=false pnpm check` and hosted CI `36630071407`. Two earlier default-concurrency `pnpm check` attempts failed only the staging Wrangler test's five-second startup timeout; a separate long-running full Vitest attempt under machine interruption had 179/221 files pass, 67 test failures and 13 worker errors. None is represented as green. After PR #27 merged as main `e7c74a0`, PR #28 became conflicting. This branch incorporates that main and preserves the complete STOP packet. Independent code/diff review found the CLI's missing `writeFileSync` import; an actual CLI test failed before the import fix and focused tests now pass 15/15. Updated `WRANGLER_SEND_METRICS=false pnpm check` passes typecheck, lint, full Vitest, migration smoke and build; `git diff --check` passes. Hosted CI must run on the new head. PR #28 remains open; GitHub review is pending. No production mutation, remote migration, restore, deployment, recipe authority change or T20 enablement occurred. Next: push the corrected PR #28, obtain new CI and GitHub review, then protected merge/new exact-main CI and a separate production Environment approval to run it. Do not infer live V2 lineage or construct positions from the count gap.

---

# Production ingredient-order diagnostic handoff — 2026-09-29

Main `d0c670289534c33187181b2eb7192c05a2962e22` (PR #26) passed exact-main CI `36576510231`. Production Environment-approved read-only run `36577380500` passed all workflow steps and emitted sanitized artifact `production-d1-diagnostics-36577380500-1` with diagnostic status `BLOCKED`: `frigo-db` / `f975ec39-b2c8-4a2a-80e1-0366054599d3`, ledger 38 through 0038, 500 recipes, 6,720 ingredient lines, zero order rows, 500 missing-order recipes and 0 hydrated. Earlier hydration success does not establish the deletion cause or live-line identity. No production write, migration, restore, deploy or T20 flag change occurred. `FINAL_RELEASE_SHA=UNSET`.

The read-only STOP and recovery evidence requirements are in `recipe-catalog/PRODUCTION_INGREDIENT_ORDER_RECOVERY_PACKET.md`. On the documentation-only follow-up branch, `pnpm install --frozen-lockfile`, `WRANGLER_SEND_METRICS=false pnpm check` (typecheck, ESLint, Vitest, migration smoke, build), and `git diff --check` passed locally. Next: review a separate read-only per-line identity/position-provenance gate; only after exact source matching design a separately authorized, bookmarked recovery and recertify authority. Do not apply 0039 to try to fix catalog order.

---

# Order-coverage implementation checkpoint — 2026-09-29

Verified implementation commit: `c318b12` on `codex/production-d1-diagnostic-followup`, based on merged main `baf9a069f89f9544407c827448671ecea4c56b5a`. Final focused diagnostic/certification/read-only-query suite: 3 files / 72 tests PASS after workflow label cleanup. Documentation checkpoint follows this implementation commit; it does not certify or change production. Next: push PR, hosted CI, independent review, protected merge, new exact-main CI, then a separate Environment-approved read-only diagnosis.

---

# Production D1 order-coverage validation — 2026-09-29

`WRANGLER_SEND_METRICS=false pnpm check` PASS on the local follow-up branch: typecheck, ESLint, 220 files / 4,816 tests, migration smoke and build. The first unfiltered full run failed one unrelated staging Wrangler test on its 5-second timeout; a focused metrics-disabled rerun passed, then the complete full run passed. `git diff --check` passed. Implementation remains local pending PR/hosted review. Next: protected merge and exact-main CI, then a new production Environment-approved read-only diagnostic. No production mutation or deploy; release remains blocked.

---

# Production D1 order-coverage handoff — 2026-09-29

Merged PR #25 is main `baf9a069f89f9544407c827448671ecea4c56b5a`; exact-main CI `36571635467` passed. GitHub reports `reviews=[]`. Run `36572487026` passed the protected production Environment approval and read-only identity check. Its sanitized receipt found D1 ledger 38 through 0038 (0039 missing), 500 physical recipes and 500 `missing_ingredient_position` hydration failures, leaving zero hydrated. This differs from 2026-09-25 run `36150184637`, which reported 500 hydrated/zero failures. The receipt is not release certification; production still has `CATALOG_DIAGNOSTICS` fallback. No production migration, deployment, flag change or rollback occurred.

Local branch `codex/production-d1-diagnostic-followup` adds one count-only aggregate query to distinguish missing order rows from failed joins, records only sanitized counts and checks count consistency. Focused `pnpm exec vitest run tests/unit/production-d1-diagnostics.test.mjs tests/unit/production-certify-workflow.test.mjs tests/unit/d1-readonly-query.test.mjs` passed 71 tests in 3 files. Full gates and hosted CI remain to run. Next: finish checks, independent review/PR merge and exact-main CI, then dispatch another Environment-approved read-only diagnostic. Use its counts to design a separate catalog recovery packet. Migration 0039 and production rollout remain stopped; `FINAL_RELEASE_SHA=UNSET`.

---

# Production D1 identity gate verification — 2026-09-29

PR #25's account-identity repair passed focused 6/6 and final local `pnpm check` 220 files / 4,814 tests, lint, typecheck, migration smoke and build. Diff check passed. Hosted CI and independent review are pending on the updated PR head. Production remains degraded with `CATALOG_DIAGNOSTICS`; no production read, mutation or deployment was performed in this continuation. Next: push, obtain exact PR-head CI and independent review, protected merge and exact-main CI. The new diagnostic then needs production Environment approval; 0039 migration and rollout remain blocked.

---

# Production D1 diagnostic continuation — 2026-09-29

PR #25 final prior head `d2e481e75e652262310ac0db5cc3bf324397c08e` passed hosted CI run `36567679646`, with zero GitHub reviews. Main remains `8072e0fea9f8f3588426969007dda06cadbbfbb7`. Fresh public production readiness still shows old Worker `136cb6ff3d2921eac237c7b106b37ab5ee12a13f`, D1/0/cutover true but global static and `CATALOG_DIAGNOSTICS`; staging serves main with global D1 and no fallback. This continuation changes only the unmerged diagnostic workflow and its test: it now checks the authenticated Cloudflare account from `whoami` before remote D1 access, matching the production certification workflow. Focused tests 6/6 PASS; full local and hosted final-head checks are pending. No production mutation, merge or deploy. Next: complete gates, secure independent GitHub review, merge through protected flow, exact-main CI, then dispatch read-only diagnostics via production Environment approval. 0039 migration and rollout remain stopped.

---

# Production D1 diagnostic PR checkpoint — 2026-09-29

PR #25 is open from `codex/production-d1-diagnostics`. Implementation commit `ad30b7efeac7a4db71665a318fb4869396e4ce98` passed hosted PR CI run `36566901147` and local `pnpm check` (220 files / 4,813 tests, lint, typecheck, migration smoke, build). This follow-up changes documentation only; final-head CI and independent review remain required. Exact main remains `8072e0fea9f8f3588426969007dda06cadbbfbb7`; `FINAL_RELEASE_SHA=UNSET`. Next: review/merge PR #25 through protected flow, obtain exact-main CI, then dispatch only the read-only D1 diagnostic with production Environment approval. Do not apply 0039 or deploy while D1 fallback and migration mismatch persist. No production mutation was performed.

---

# Unified production release train handoff — 2026-09-29

`codex/production-d1-diagnostics` starts from main `8072e0fea9f8f3588426969007dda06cadbbfbb7` in isolated checkout `/Users/tunbee27/Documents/Tako-san-release-checkout`. Production certification run `36563767379` passed Worker version/deployment and D1 binding proof under production Environment approval, but stopped at the missing `0039_meal_composition_v2.sql` ledger entry. Public readiness independently reports `CATALOG_DIAGNOSTICS` fallback while configured D1/0/cutover true. No production mutation was made.

The branch proposes `.github/workflows/production-d1-diagnostics.yml`, `scripts/production-d1-diagnostics.mjs`, two unit tests, a one-line post-apply proof repair in `.github/workflows/production-d1-migrate.yml`, and `docs/ai/recipe-catalog/PRODUCTION_0039_MIGRATION_PACKET.md`. The diagnostic runs five guarded SELECTs after exact-main, production Environment and D1 identity checks and uploads counts/code categories only. It is diagnostic, not release certification. The packet is prepared, not authorization to apply.

Executed local checks: `pnpm lint` PASS; `pnpm typecheck` PASS; five-file focused Vitest 305/305 PASS; `pnpm check:migrations` PASS; `pnpm build` PASS; `NODE_OPTIONS=--no-experimental-webstorage pnpm test` 220 files/4,812 tests PASS; `git diff --check` PASS. First typecheck failed on missing sparse source folders; first full test attempt had 17 fixture/timeout failures. After expanding sparse paths, targeted 48/48 and final full suite passed. No hosted CI on this branch yet.

Next action: push reviewable PR, get independent review and hosted CI, merge through protected main. Then rerun exact-main gates and request production Environment approval for the new read-only diagnostic. Use failure codes to address catalog hydration; recheck ledger and migration packet before any 0039 apply. Do not dispatch production mutation or deploy while either blocker persists. `FINAL_RELEASE_SHA=UNSET`.

---

# Scan/OCR handoff — 2026-09-29

PR #22 was reviewed at `439451afeb81aee732c3e7d13acaf0a194b1e70e`, merged as `94056d29ed00a1000e65eb8e1348384638bc02af`, and passed exact-main CI run `36476834182` / job `109112533990` (216 files / 4,804 tests, lint, typecheck, migration smoke, build). Official staging deploy run `36477693577` succeeded on that SHA; production job was skipped. Staging serves AI mock with DB/Queue ready, recipe canary 1%, T20 true. Guest quota API covered 5 ready scans, 6th quota rejection, replay and tenancy. Direct D1 ledger, provider failure, retry exhaustion and no-job fault injection remain unverified on staging.

This follow-up branch `codex/scan-synthetic-ocr-certification` is based on the merge SHA and has local focused 28/28 plus full `pnpm check` PASS. It adds 4 deterministic fictitious receipts/16 variants and a source-first manifest. Apple Vision local baseline achieved 100% normalized names, quantity/unit, line prices and totals with 194-512 ms per image; Qwen OCR was not run. The branch also removes `trứng` and `mozzarella` as incorrect canonical aliases and exposes `X-Request-Id` to trusted CORS origins. Follow-up changes are not in the staging deploy above.

Next: obtain hosted CI and independent review for the follow-up PR before any merge. A dedicated non-production Qwen environment with isolated data resources and approved secret/configuration is needed for real OCR certification. The four original QA images and independently transcribed `qa/ocr/expected.json` are still unavailable; do not infer them from the old incident report. See `docs/ai/scan/SCAN_OCR_REMEDIATION_CERTIFICATION.md`, `qa/ocr/synthetic/README.md`, and `qa/ocr/README.md`. Status: `REAL_QWEN_STAGING_CERTIFICATION_BLOCKED_CONFIGURATION`, `LIVE_OCR_CERTIFICATION_BLOCKED_DATASET_UNAVAILABLE`, production `NOT_READY_FOR_PRODUCTION`. No production deployment or data mutation.

---

# Historical handoff — Scan/OCR/AI quota remediation (2026-09-28)

PR #22 (`takovn2/Tako-san`) contains the async quota, UI taxonomy, support ID, canonical ingredient, queue fencing/retry, and OCR harness changes. A follow-up review fixed replay of a terminal failed scan after queue-intent persistence fails before a job row exists. The same key now returns `SCAN_FAILED`/503 without reserving quota or sending work; a new key explicitly starts a new attempt. Regression is in `tests/integration/scan-async-quota-lifecycle.test.ts`. No migration or production configuration change.

Final unfiltered `pnpm check` PASS: 216 files / 4,804 tests, typecheck, ESLint, migration smoke, build. First full run timed out one unrelated AI provider test at five seconds; focused 23/23 and second full 4,804/4,804 passed. `git diff --check` and `node --check scripts/ocr-benchmark.mjs` passed. Staging read-only health/ready returned 200 and reported SHA `12348efd015ae72337fbeb08651150a7d28ee638`, database/queue ok, AI mock. Deploy workflow permits reviewed main SHAs only; this PR was not deployed. No live staging scan certification is claimed.

Private dataset requirements and runnable fixture tests: `qa/ocr/README.md`; schema: `qa/ocr/expected.schema.json`. The four originals and independent ground truth are missing. `node scripts/ocr-benchmark.mjs prepare --dataset qa/ocr` returns `DATASET_UNAVAILABLE`; live gate remains `LIVE_OCR_CERTIFICATION_BLOCKED_DATASET_UNAVAILABLE`. No production receipt, PII, synthetic QA image, or invented ground truth was used.

Implementation head `45b6115f5b8bbf54f44182ae8bd9e28d49fa3e8a` passed hosted CI run `36437178487` / job `108977987256`: ESLint, typecheck, Vitest (216 files), migration smoke, and build. Next: verify the current PR head remains green and obtain independent review. A later release owner can stage a reviewed main release under the existing gate, but staging's AI mock cannot certify actual Qwen OCR. The operator must provide the private four-image dataset and ground truth before live OCR scoring. Do not merge or deploy production in this task. Recommendation: `NOT_READY_FOR_PRODUCTION`.

---

# Handoff — T19 cooking hard-restriction hotfix (2026-09-28)

**Status: `T19_COOKING_HARD_RESTRICTION_HOTFIX_READY_FOR_REVIEW`.** Branch
`fix/t19-cooking-hard-restriction-bypass` from exact main
`85660fa497f3da7110a07ec2189309fbef81d701` (not yet pushed at handoff time).

Problem: `cook/start` and `cook/complete` could be called directly to bypass
household hard restrictions already enforced by the planner and T20
Manual/Assisted/Auto. Fix: new `src/worker/services/cooking-hard-restrictions.ts`
evaluates the canonical `evaluateHardRestrictions` (fail-closed) before any
success response (`cook/start`) or durable mutation (`cook/complete`, after the
idempotent-replay lookup on both legacy and adopted-lot paths). Facts reuse
`candidateRestrictionFacts` over the served authority recipe: static authority
uses the recipe only (no D1 planner enrichment); D1 adds `prep_time_minutes`,
`recipe_classifications`, and the canonical nutrition evidence provider.
Response contract matches T20: 422 `HARD_CONSTRAINT_CONFLICT`.

Local gates: regression 15/15 PASS (9 failed before fix, proving the bug);
nearby authority/T20 suites 50/50 PASS; worker typecheck clean; eslint clean.
No D1 catalog mutation, no migration, no secret/config/rollout change, no
staging or production deploy. Staging remains canary 1% — do NOT promote.

Next: push branch, open PR `fix(t19): enforce hard restrictions at cooking
boundary`, await review and merge. After merge, the T19 rollout restarts from
shadow on the new main SHA (fresh D1 proof required; old evidence stale).

---

# Handoff — T19-R0 staging D1 runtime readiness certifier (2026-09-27)

**Status: `T19_STAGING_D1_RUNTIME_READINESS_FIX_READY_FOR_REVIEW`.** Main remains
`e35df74b7a10ee6de1677bf8e059c7ef82ad55fc`. Application commit `61bf805ca77ceeb92df501fa1965d24856d45bff` adds
`scripts/staging-d1-runtime-readiness-check.mjs` and
`.github/workflows/staging-d1-runtime-readiness.yml`. The checker reuses
`hydrateRuntimeRecipes` + `assessD1Readiness` against the committed catalog
release manifest, plus pinned staging D1 identity `frigo-db-staging-v3` /
`7854298a-20f5-46aa-9cbf-917079c2a3dd`, ledger tip `0039_meal_composition_v2.sql`, approved-batch
provenance, and FK/quick_check. Workflow is `workflow_dispatch` only,
`environment: staging`, concurrency `frigo-deploy-staging`. No deploy,
`d1 migrations apply`, authority change, T20 change, or 0040.

Local gates: focused 31/31; `pnpm check` PASS. Do not dispatch the new
workflow until merge + exact-main CI. Do not claim remote staging D1
runtime readiness certified from this PR.

---

# Handoff — T20 live staging hard-time blocker and repair (2026-09-27)

**Status: `T20_STAGING_LIVE_HARD_RESTRICTION_BLOCKED_P1`.** Main and
staging Worker are `9d64178b8bbc8f07672a1e9f0434867f3699f339`.
Deploy `36306554840` / artifact `10927776649` succeeded with T20 and
planner enabled, static authority (71 served recipes), production skipped.
LIVE A plan `6aa36637-7a3f-4d4e-a531-c19d233fe6f8`, slot
`2026-09-28:dinner:0`, revision 11; A user
`usr_1790496416217_u02mk`, household
`hh_usr_1790496416217_u02mk`. B user
`usr_1790496420287_ajiz4`, household
`hh_usr_1790496420287_ajiz4`; B has no persisted plan from the failed
hard-time attempts. Sessions are in a local mode-0600 temporary file.
No credentials, email, OTP, cookie or password are in this handoff.

LIVE PASS: picker 71, browser T20 editor and role labels with no fatal error,
Manual add/lock/unlock/reorder/swap/save/remove and repeated reload,
409 stale revision, B ownership denials (all 404), Assisted 11 candidates
with apply/reload, Auto 15 candidates with four-component apply/reload,
shopping changes after swap/remove including simple food and duplicate
ingredient aggregation. LIVE FAIL: plan generation with slot hard maximum
10 or 20 minutes returned HTTP 500 `MEAL_PLANNING_UNAVAILABLE`, preventing
the hard-rule fixture. Source inspection is not a live rejection test.
No unsafe component was proven persisted. Post-smoke D1 PRAGMA and Worker
tail logs remain unproven because no approved local Cloudflare credentials
are available.

On `codex/t20-staging-hard-time`, ADR-038 records the repair. Local
direct-service reproduction found a strict T05 shopping snapshot ZodError
on an unplanned slot with `hardMaxTimeMinutes`; projection now selects
only T05 fields. T20 now applies V1's slot time policy to Manual checks,
downstream family revalidation and Assisted/Auto candidates. Focused T20
HTTP 4/4, lint, typecheck, migration smoke and staging-style build PASS.
Canonical-clone full `pnpm check` PASS. PR #18 is open on
`9f040f6921a8a6871c1233627edf5ddda3fda552`; hosted CI on the final
documentation head remains required. The branch is not deployed. Next:
PR CI/review/merge, exact-main CI, staging-only T20=true/static/0 Deploy,
then repeat the hard-rule LIVE matrix and D1/log checks. Do not certify
the current Worker. No production, T19 or 0040 action.

---

# Handoff — T20 live staging planner prerequisite PR #17 (2026-09-27)

**Status: `T20_STAGING_PLANNER_PR17_REVIEW_PENDING`.** Main and live
staging Worker are `b44e9355ce8988e7acb7c3b12c55bc2b27340e1a`.
Deploy `36305024017` succeeded with T20 Worker/UI flags true, static
recipe authority (served 71), and production skipped. Two registered
staging test accounts exist: A `usr_1790496416217_u02mk` /
`hh_usr_1790496416217_u02mk`, B `usr_1790496420287_ajiz4` /
`hh_usr_1790496420287_ajiz4`; secret sessions remain only in a local
mode-0600 temporary file.

Live unauthenticated picker was 401 as expected; authenticated picker
was 404 `MEAL_PLANNER_DISABLED`, so the T20 live matrix has not started
and no plan exists. Operator authorized staging-only
`MEAL_PLANNER_ENABLED=true` and `VITE_MEAL_PLANNER_ENABLED=true`.
PR #17 at `7c8b6d8b548872b95c2695862e7bd1a962ad7701` implements
these flags and a release prerequisite guard. Production config, T20
enablement, recipe authority, migration ledger and D1 catalog are
unchanged. Local focused 20/20, lint, typecheck, staging-style build and
migration smoke pass. Local full check had the known Wrangler catch-up
timeout (4,726/4,727); hosted PR CI `36305647997` is in progress.

Next: verify exact-head hosted CI and independent review/merge. Then
verify exact-main CI, dispatch only staging Deploy with T20=true/static/0
and production=false, and check live SHA before exercising the original
full live matrix. Production/T19/0040 are forbidden in this task.
Do not report source tests as live certification.

---

# Handoff — T20 staging account fix PR #16 (2026-09-27)

**Status: `T20_STAGING_PR16_REVIEW_PENDING`.** Main and live staging Worker
remain `dff7446855964d9fc60008c370ef656371652a13`. PR #16 on
`codex/t20-staging-turnstile` has implementation head
`ef5ebd8a5c3d52475c0951b83a0bb6a6ca2eef06`. Hosted pull-request CI run
`36299373601` SUCCESS: lint, typecheck, 208/4,725 Vitest, migration smoke,
build. Final documentation checkpoint CI must be verified after push.

The PR fixes staging registration with the official Turnstile test pair and
makes Deploy manual-only to avoid automatic T20=false rollback on merge.
Existing release gates still require current main, exact-SHA hosted CI,
staging authority proof, paired T20 flags and production confirmation. See
ADR-035/036 and the PR description. Local full Vitest had one unrelated
Wrangler D1 catch-up timeout; hosted CI passed it.

No live registered User A/B or T20 plan exists. No deploy, Worker var, D1,
recipe-authority, production, T19 or 0040 change was made. Next: independent
review/merge; successful exact-main CI; manual staging-only dispatch with
T20=true/static/0; then verify Worker identity, create User A/B and execute
the original full LIVE certification. Do not merge or dispatch from this handoff
without the required review/release decision.

---

# Handoff — T20 staging account fix and release gate (2026-09-27)

**Status: `T20_STAGING_FIX_BRANCH_READY_DEPLOY_BLOCKED_RELEASE_GATE`.** Canonical
main `dff7446855964d9fc60008c370ef656371652a13`; implementation commit
`027c628` on `codex/t20-staging-turnstile`. T20 remains enabled on staging;
Worker still serves `dff7446`. No live registered User A/B or T20 plan exists.

Change: `src/worker/utils/turnstile.ts` pairs only the exact staging test site
key with the official test secret and still calls Siteverify. Missing token or
failed provider response is rejected. Other staging site keys require a secret;
production behavior is unchanged. Unit/integration tests and ADR-035 document
the scope. A mismatched live Worker secret is the leading, unproven diagnosis.

Executed checks: focused Vitest 2/106 PASS; canonical exact-main clone
`pnpm check` PASS (208/4,724, lint, typecheck, migration smoke, build),
`git diff --check` PASS. Initial managed-worktree full run had two failures;
at least one was confirmed due to its stale old-repository `origin/main`. The
identical code passed the canonical clone.

Release obstacle: Deploy workflow requires a reviewed exact-head SHA on main,
with hosted CI. Direct main push triggers automatic staging deploy with
T20=false by default, violating the requirement to keep T20 on. Do not push
main directly, dispatch an off-flag release, or bypass the release gate. A
release-operator decision is needed for a safe staged sequence preserving both
T20 flags true. Once deployed, verify new SHA, register User A/B, and run the
full LIVE T20 matrix. No staging deploy, Worker var, D1, production, T19, or
0040 mutation was performed.

---

# Handoff — T20-R1 staging release observability convergence (2026-09-27)

**Status: `T20_RELEASE_OBSERVABILITY_FIX_IN_REVIEW`.** Do not deploy, do not
enable T20, do not merge from an agent.

Base: main `0b2e0a17578bdc744427944b90db5b76bdbfe33c`. Branch
`feat/t20-staging-release-observability`.

Files: `scripts/release-check.mjs` (`verifyPreviousRecipeAuthority`,
`previousWorkerStillAnswering`, shared `STABLE_RECIPE_AUTHORITY_EVIDENCE_FIELDS`,
strict exported `fetchRecipeAuthorityEvidence`, staging-only
`previous-authority` command), `.github/workflows/deploy.yml` (one staging step
before deploy), `tests/unit/release-check.test.mjs` (tests A–L, capture proof,
fetch, real-Git CLI, workflow order, production same-SHA exact-capture cases),
`docs/ai/DECISIONS.md` (ADR-034).

Behavior: exact captured previous commit + valid previous state → bounded retry;
target commit + target state → pass; unknown/malformed/wrong evidence → fail
closed; previous Worker never converging → fail at 90 s.

Next: review/merge → exact-main CI → flag-OFF staging Deploy re-prove (full
SUCCESS incl. protected authority proof) → only then a separate T20=true staging
rollout. Production untouched.

---

# Handoff — T20 staging rollout preflight (2026-09-27)

**Status: `T20_STAGING_BLOCKED_RELEASE_OBSERVABILITY`.** Do not enable T20.
Do not dispatch Deploy. Do not touch production.

Main `0b2e0a17578bdc744427944b90db5b76bdbfe33c` (unmoved). CI `36284857635`
SUCCESS. Staging 0039 run `36287079403` / artifact `10919819859` /
`STAGING_0039_CERTIFIED`. Flags OFF in `wrangler.jsonc` and
`wrangler.staging.jsonc`.

T20 runtime (flags off) certified locally: candidate cap 320, shared T03
`evaluateHardRestrictions` for Manual/Assisted/Auto/save/apply, simple foods
fail-closed, T19 authority, 500-recipe picker, persistence, IDOR, stale 409,
shopping. Focused T20 120 PASS; Vitest 208/4654 PASS; lint/typecheck/migrations/
build PASS. No code changes.

Blocker: Deploy `36285175574` failed `release-check.mjs authority` after smoke
PASS (`recipe-authority.commit` `8147dde8…` != release SHA). Same SHA T20
enablement would hit the same gate after Worker deploy.

Next: reconcile staging recipe-authority commit identity, then staging-only
Deploy with paired T20 flags. Do not start production.

---

# Handoff — Staging D1 0033→0038 historical catch-up PR

**Remediation (2026-09-27): `STAGING_D1_0033_0038_CATCHUP_PR_REMEDIATED_READY_FOR_REVIEW`.**
PR #14 review P1 fixed in `f14fcb4` / tests `50e973c`: before every mutation
the pre-tip (or the target in certify-only mode) must pass `certifyCheckpoint`
— exact ordered IDs, slugs and provenance, runtime_order 0..n-1, runtime and
ingredient-order coverage, child counts, media seed + exact index/trigger/MIME/
storage-key schema (0035+), approved batch provenance/marker (0036+),
onboarding schema (0038), FK/quick_check. `plan` refuses an uncertified
pre-state, and the apply step starts with `apply-gate` (certified pre-state,
rechecked ledger/plan, bookmark captured after recheck). P2s:
`GITHUB_REPOSITORY_ID` is required (no fallback); `assertCurrentRunBookmark`
proves run/source/ordering only, not wall-clock freshness. Local gates:
typecheck, lint, migration smoke PASS; Vitest 208 files / 4,654 tests PASS
(+10 hostile pre-state tests). Staging/production mutation: NO.

**Current: `STAGING_D1_0033_0038_CATCHUP_PR_READY`.** Do not dispatch the new
workflow until this PR is reviewed and merged. Do not apply 0039 from catch-up.

Canonical `main`: `8147dde`. Exact-main CI `36274587084` SUCCESS. Deploy
`36274945067` SUCCESS. Implementation `718abef` on
`feat/staging-d1-catchup-0033-0038`.

What landed:
- `.github/workflows/staging-d1-catchup.yml` — `workflow_dispatch` only, staging
  Environment, `confirm_staging_catchup` default false, contents/actions read,
  concurrency `frigo-deploy-staging` (shared with the 0039 workflow).
- `scripts/staging-d1-catchup-check.mjs` — one-step target gate, prefix builder
  (0001…target, never 0039), ephemeral D1-only Wrangler config, exact catalog
  certification from local replay, fresh Time Travel bookmark, production D1
  hard reject.
- Shared `classifyPreLedger` wording is now environment-neutral; behavior
  unchanged.
- Existing 0039 workflow / `PRE_TIP` / `TIP` / Wrangler DB IDs unchanged.

Local gates: typecheck, lint, Vitest 208/4,644, migration smoke, build PASS.
Local replay certified 59 → 71 → 71 → 101 → 500 → 500. Staging mutation was
not performed. Production D1/R2/deploy untouched. T20 remains false.

After merge, execute separately: target 0034, inspect receipt, then 0035, 0036,
0037, 0038. Only then use **Staging D1 Migration** for 0038→0039.

## Resume point

1. Review/merge the catch-up PR. Do not auto-merge.
2. Re-prove staging Cloudflare secrets after the repo transfer.
3. Dispatch catch-up from `main` with exact current main SHA, one target per run.
4. Do not start Content Refresh V2, 0040, or T20 enablement from this path.

---

# Handoff — Runtime Ingredient Model V2 staging blocker and offline checkpoint

Canonical `main` after PR #11: `8687ff9f3e8f6b6cbf466ee61968bb5f3469498c`.
Exact-main CI `36269257668` SUCCESS (204 files / 4,597 tests, lint,
typecheck, migration smoke, build). The staging-only 0039 workflow was
dispatched once: run `36269963768`, job `108481914553`, exact same SHA. It
failed at the first remote D1 identity read with Cloudflare authentication
error 10000; the reviewed workflow skipped ledger, Time Travel, migration
apply and post-checks. The staging config pins
`frigo-db-staging-v3` / `7854298a-20f5-46aa-9cbf-917079c2a3dd`, but the
remote identity was **not** verified. Do not retry with guessed credentials or
manual SQL. No production D1/media/R2 reads occurred. T20 remains off by
repository config; remote effective flags were not queried.

Offline branch `codex/runtime-ingredient-model-v2` starts from certified main.
Implementation checkpoint: `1c9a585cd39cfd9e3b2b8b8256dbd41ed9878110`.
ADR-033 and `RUNTIME_INGREDIENT_MODEL_V2.md` define the review candidate and
consumer map. The canonical recipe package and source hash
`da87da20475fa8d7ec92c716e899ee572339573258ae6d9cc7f3f8f554f2d695`
are unchanged. New deterministic audit pins that hash and reports 6,766 rows,
3,770 provisionally projected, 2,996 excluded, 2,860 excluded needing review,
136 semantic exclusions, plus 169 already-projected units needing conversion
review. No transformation, ingredient identity, URL or nutrition profile was
promoted. Provisional fingerprint stays
`6d0e3eb85696bb7c31bc54ac62783bc94432aaf008028eca79b17041f3eaed87`;
final fingerprint is absent. `pnpm recipe:refresh:release-check` must still
fail with four blockers. No 0040 or final release manifest exists.

Current local focused model/authority/refresh tests (3 files / 35 tests),
typecheck, lint, source/import/audit checks and final `pnpm check` all passed:
206 files / 4,615 tests, migration smoke and build. PR #12 is OPEN/MERGEABLE;
hosted CI `36271741260` / validate `108486877920` SUCCESS on implementation/docs
head `e321122069c74b2d791cd13d3c7422ed7e02abbe` with 206 files / 4,615
tests, lint, typecheck, migration smoke and build. This final documentation
receipt needs its own exact-head CI. Do not merge as release readiness.
Next: independently review PR #12; separately repair staging
credential and repeat the reviewed workflow before any remote audit or rollout.

# Handoff — Ingredient icon pack v2 (2026-09-27)

**Current (2026-09-27): `ICON_V2_PR_OPEN`.** PR #13
(`feat/ingredient-icons-v2` → `main`) opened; rebased on `origin/main`
`c6ea259` (PR #12) and re-pushed via Git Data API, remote tree
byte-identical to local. Post-rebase local gates: typecheck, lint,
focused icon test 7/7, unit 119 files / 2,478 tests, migration smoke,
build — all PASS. Monitoring hosted CI. No merge, no deploy from this task.

What changed (all additive, no call-site edits — the 8 existing
`getIngredientImage(id, name)` call sites are untouched):
- `public/frigo/ingredients/`: +39 PNG (512px, RGBA transparent):
  15 vegetables (shallot, lemongrass, cilantro, vietnamese-coriander,
  bean-sprouts, bitter-melon, luffa, winter-melon, zucchini, galangal,
  turmeric, leek, mint, pineapple, white-radish), 16 pantry (salt, pepper,
  seasoning-powder, water, flour, peanut, sesame, honey, cooking-wine,
  squid, crab, spare-ribs, oyster-sauce, sesame-oil, rice-paper, vinegar),
  8 generic (category-vegetable/spice/meat/seafood/fruit/grain/dairy/other).
- `src/web/lib/frigo-assets.ts`: 39 new keys + `ingredients.generic` section.
- `src/web/lib/ingredient-icon-rules.json`: 214 ordered rules (new file).
- `src/web/lib/ingredient-images.ts`: data-driven matcher replacing the
  if-chain; new optional 3rd param `category` for the fallback.
- `tests/unit/ingredient-images.test.ts`: 7 tests (new file).

Verification: `pnpm typecheck` PASS, `pnpm lint` PASS, `pnpm build` PASS,
`pnpm check:migrations` PASS, focused
`vitest run tests/unit/ingredient-images.test.ts` 7/7 PASS,
`vitest run tests/unit` 116 files / 2,460 tests PASS (pre-rebase),
post-rebase: 119 files / 2,478 tests PASS (incl. 18 new PR #12 tests),
`vitest run tests/integration` chunk 1 of 4 (22 files) 1,138 passed /
8 skipped, 0 failed. The sandbox pauses long execs for user confirmation,
so integration chunks 2–4 were not run locally; no integration/e2e test
covers the icon modules. Hosted PR CI is the final full-suite gate.

Known design decisions (audited, do not "fix" without review):
- Unaccented names never guess: 11 ambiguous normalized forms are dropped
  from phase 2, and phase 1 skips bare ambiguous keywords (`me`, `chao`)
  for unaccented input.
- Grouped keywords (ngao, hương thảo, kỷ tử, pate, đá viên…) resolve to
  truthful *category* icons, never to a wrong specific icon.

Boundaries respected: no PayOS/payment/billing/checkout/webhook, auth,
migration, deploy, or production D1/R2 change.

## Resume point

1. PR #13 is open: https://github.com/tako-vn2/Tako-san/pull/13
   (`feat/ingredient-icons-v2` → `main`, head `95e21c2e`).
2. Watch hosted exact-head CI; report green/red to Tun bee.
3. Require reviewer `vn-taphoanhatung` + Tun bee's separate approval
   before any merge. No merge/deploy from this task.

---

# Historical handoff — Recipe Content Refresh V2 PR #11 remediation

**Current (2026-09-27): `RECIPE_REFRESH_V2_RESEARCH_CANONICALIZED`; release projection blocked.**
Implementation commit `1f77902` contains the remediated source, compiler,
validators, generated artifacts and tests. Starting PR head was
`fbec18f1e2554068ec550c7a9b5c9afcd4da0b79`; starting main was
`c81d6da2b3a9c051270b97953bfbb2c5aa34d057`.
The source package is rebuilt from the original ZIP. It contains 500 IDs,
4,938 steps and 6,766 ingredients. The provisional runtime fingerprint remains
`6d0e3eb85696bb7c31bc54ac62783bc94432aaf008028eca79b17041f3eaed87`;
the canonical source SHA-256 is
`da87da20475fa8d7ec92c716e899ee572339573258ae6d9cc7f3f8f554f2d695`
(previously `fc7eefe6573ee9de1083728db1f34b058954fa60ff478f7c5e41dce9e4570dbe`).
No final release fingerprint exists. The manifest explicitly blocks release
for runtime projection loss, provisional ingredient authority, incomplete
source content verification, and nutrition evidence.
`pnpm recipe:refresh:release-check` must fail with
`RECIPE_REFRESH_RELEASE_BLOCKED`; `pnpm recipe:refresh:check` must pass.
Of 2,996 excluded ingredient rows, 2,860 require reviewed transformation;
136 are currently semantic exclusions. Reconciliation rows: 505 existing,
0 reviewed new, 1,642 provisional new, 368 aliases. Declared URLs: 1,101;
structurally valid URLs including one supporting source: 1,102;
URL-specific content verification: 0. Nutrition: 1 publishable, 288 blocked,
211 truthful null. Production rollout, 0040, recipe authority and T20 remain
out of scope.

Local verification: `git diff --check`, `pnpm recipe:refresh:check`,
`pnpm recipe:import:check`, focused refresh tests (17/17), `pnpm typecheck`,
`pnpm lint` and `pnpm check` passed (204 files / 4,597 tests, migration smoke,
build). The release check intentionally exited 1 with all four typed blockers.
Two fresh builds from the original ZIP reproduced the source artifact hash and
provisional fingerprint; sampled generated files matched byte for byte.
PR #11 was pushed at `dea13cddb0c153d325baa593700545d801c9e851` and
remains OPEN/MERGEABLE. Hosted CI run `36268138066` on that exact head passed
ESLint, typecheck, 204 files / 4,597 tests, migration smoke and web/worker
build. The PR description has the same blocker/remote-boundary receipt.

Next: verify hosted CI on this final documentation receipt, then hand PR #11
to independent review without merging. Hoplite next reconciles the runtime/
content model and evidence before any release artifact generation.

## Historical pre-remediation handoff (superseded)

**Previously reported (2026-09-27): `RECIPE_REFRESH_V2_CANONICAL_SOURCE_READY`.** Canonical
repository `tako-vn/Tako-san`, base `origin/main`
`c81d6da2b3a9c051270b97953bfbb2c5aa34d057`, branch
`codex/recipe-content-refresh-v2-canonical`, pushed implementation checkpoint
`fc5e713e10e0b63c890ba31fc29d9678be896ed7`.

## Resume point

The 500-file canonical source is complete at `data/recipe-refresh/v2`; audit
artifacts are at `artifacts/recipe-refresh-v2`; schema/runtime decisions and
known evidence gaps are in `AUDIT_REPORT.md` and ADR-032. Input ZIP SHA-256:
`ebc18f06ee7fb4498f8cd2a7886f333a85b385f32af4407ae1b44b4ec3cc06fe`.
Canonical artifact SHA-256:
`fc7eefe6573ee9de1083728db1f34b058954fa60ff478f7c5e41dce9e4570dbe`.
Runtime fingerprint:
`6d0e3eb85696bb7c31bc54ac62783bc94432aaf008028eca79b17041f3eaed87`.

Audit truth: 500 recipes / IDs, 4,938 steps, 6,766 ingredient lines, 15 raw
root variants, 6,743 quantified and 23 qualitative canonical rows, 166
process-only and 7 mixed-process rows, 3,770 projected and 2,996 excluded
runtime ingredient rows. Source coverage is 499 recipes with at least two
relevant URLs plus the explicit `imp-0d6c454ae1073ef6` exception. Ingredient
reconciliation has 505 existing IDs, 1,642 new reviewed IDs, 368 duplicate
aliases, and no ambiguous/invalid rows.

Nutrition outcome: 289 source numeric profiles, 353 recomputed candidates, 1
certified publishable profile, 288 blocked, 211 truthful null. Blocked/null
nutrition never projects runtime macros. Salt-bed and deep-frying outliers are
quarantined by evidence policy, not clipped. Runtime still uses positive
`StandardUnit` quantities and canonical IDs; richer qualitative/process data
stays in source instead of weakening planner/inventory/shopping contracts.

Verification on the final documentation tree: `pnpm recipe:refresh:check`,
`pnpm recipe:import:check`, `pnpm typecheck`, `pnpm lint`, `git diff --check`,
focused refresh 11/11, and `pnpm check` PASS; full Vitest is 204 files / 4,591
tests. The first full run failed only because managed sparse-checkout omitted
tracked `public/`; adding it back restored all assets, after which the 24
CSP/PWA brand tests and complete gate passed. No repository file was repaired
or fabricated for that checkout issue.

## Next exact action

Open/review the PR and require hosted exact-head CI. Do not merge or perform a
remote rollout in this task. A later authorized release task may generate the
Content Refresh V2 manifest and `0040_recipe_content_refresh_v2.sql` from the
pinned source, then certify staging before production.

`staging_mutation=NO` · `production_mutation=NO` · `deploy=NO` ·
`T20_enablement=NO`

---

# Historical handoff — T20 release gate

**Latest (2026-09-26):** PR #9 MERGED at `cb22cfb`, exact-main CI green;
local OAuth and read-only live staging D1 identity now match reviewed config,
not the operator packet's Section 0 ID. The next handoff is current; later
entries are historical.

## T20 staging D1 migration preflight handoff — 2026-09-26 UTC

### Owner-approved Cloudflare login and read-only identity receipt

`pnpm dlx wrangler@4.119.0 login --device --browser=false --scopes
account:read user:read d1:write` succeeded after owner approval (Wrangler
4.119.0 was disposable, not added to repository dependencies). Both this
version and the repository Wrangler 3.114.17 report authenticated via
`CI=true pnpm exec wrangler whoami`; before login, the repository command
exited 0 but actually printed "You are not authenticated". Read-only
`CI=true pnpm exec wrangler d1 list --json` and `CI=true pnpm exec wrangler
d1 info frigo-db-staging-v3 --config wrangler.staging.jsonc --json` PASS:
one matching staging name, with remote ID equal to `wrangler.staging.jsonc`
and packet Phase B, but unequal to packet Section 0. The identity discrepancy
is resolved for local read-only staging identification, not by guessing from
the packet. No staging ledger/schema/bookmark/row query, migration, deploy or
flag enablement occurred; production was untouched. Next: review PR #10 and
its exact-head CI, then verify the GitHub staging Environment credential and
run reviewed read-only gates on merged exact-main before applying 0039.
Local OAuth does not certify GitHub staging Environment access.

### State and checkpoints

`origin/main` `cb22cfb` contains PR #9. Exact-main hosted CI `36240577660`
validate job `108400172569` SUCCESS (202 files / 4,574 tests, lint,
typecheck, migration smoke and build). Automatic Deploy `36240842196`:
release and staging SUCCESS, production SKIPPED. This is flag-OFF/static
staging and not T20 staging certification. Local Wrangler 3.114.17 is not
authenticated; `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` were
absent. The operator packet Section 0 D1 ID conflicts with its Phase B
expected ID; `wrangler.staging.jsonc` matches Phase B. Do not infer which
remote D1 is safe: no remote identity, ledger, bookmark, FK, data or schema
query was made. No staging migration, staging D1-mode/T20-ON deploy, or
staging E2E occurred.

### Verification and failures

`git fetch --all --prune`, `git diff --check`, `pnpm check:migrations`
(`migration-smoke=ok`) PASS. Added a staging-only, manual-dispatch 0039
migration workflow and checker that fail closed on exact current main/hosted
CI, reviewed config identity, production ID exclusion, ledger and plan,
Time Travel bookmark, 500-recipe baseline, pre/post FK/quick checks,
0039 constraints and repository schema gate. The workflow shares staging's
deploy concurrency group; production migration/deploy files are untouched.
Executed `pnpm exec vitest run
tests/unit/staging-d1-migration-check.test.mjs
tests/unit/production-certify-workflow.test.mjs
tests/integration/d1-schema-gate.test.ts`: 3 files / 63 tests PASS;
`pnpm exec eslint scripts/staging-d1-migration-check.mjs
tests/unit/staging-d1-migration-check.test.mjs` PASS. The first targeted run
failed parsing a typo in the new test; the next failed because a test parsed
JSONC as JSON. Both issues were corrected and the final focused rerun passed. On initial
workflow checkpoint `9635ad6`, local `pnpm check` PASS (203 files / 4,580
tests, lint, typecheck, migration smoke, build); hosted PR #10 CI run
`36241921150` validate SUCCESS. Independent review found two P2 gaps in
this new workflow: schema checks did not require FK cascades, and the tests
did not lock preflight D1 commands to read-only SQL. The follow-up now checks
exact FK targets/cascades and unique index columns; tests fail on removed
cascades/changed index and constrain pre-apply SQL. Re-executed the same 3
files / 63 tests PASS and targeted ESLint PASS. This later review-fix/docs
checkpoint needs its own hosted CI. All checks above are local/hosted tests,
not remote staging D1 evidence.

### Next action / release boundary

Have a reviewer reconcile the staging D1 ID against the real staging account,
review and merge PR #10 only after its exact-head CI; verify exact-main CI on the merged
workflow SHA. Dispatch the workflow only on current main with staged credentials
and confirmation; it must certify identity and 0039 before any T20 deploy.
If auth/identity/ledger fails, stop without ad-hoc SQL. Subsequently run the
staging-only D1-500/T20-OFF deploy and baseline, then same-SHA V2-ON deploy,
full E2E and rollback proof. This task stopped safe before remote D1 mutation;
`staging_migration=NO`, `staging_v2_enablement=NO`,
`production_migration=NO`, `production_deploy=NO`,
`production_recipe_authority_change=NO`, `production_enablement=NO`,
`production_mutation=NO`.

**Latest (2026-09-26):** PR #8 MERGED, exact-main CI green; PR #9 C8 `8814701`
is synced/retargeted to `main`, and docs head `cffd959` passed hosted CI. The
next handoff is current; older entries are history.

## T20 C8 sync and C10 certification handoff — 2026-09-26 UTC

### State and checkpoints

`origin/main` `662a065` is PR #8's merge commit; hosted CI `36237334354`
validate SUCCESS. Deploy `36237637195`: release/staging SUCCESS and
production SKIPPED, not T20 flag-on staging certification. PR #9 is OPEN,
head C8 `8814701` (main merged into branch without rewrite), base `main`,
merge-base `662a065`. Earlier C5 `ab83d35`/`5c6835e`/`6c68d8d`, C6
`092d67b`/`869f035`, C7 `869f035` and docs `24437e0` remain intact.
No C9 fix was needed; final docs-only checkpoint follows full C10 local gate.

### Verification and limits

`git diff --check origin/main...HEAD` PASS. Post-sync focused `pnpm exec
vitest run` over the five T20 integration files, two T19 authority files
and three T20 unit files listed in the previous handoff: 10 files / 112
tests PASS. Explicit `pnpm typecheck`, `pnpm lint` and post-sync `pnpm check`
PASS: 202 files / 4,574 tests, migration smoke and web/Worker build. Hosted
PR #9 C8 head `8814701` CI run `36238249061`, validate job `108393884945`
SUCCESS: lint, typecheck, 202 files / 4,574 tests, migration smoke and build.
The later docs-only checkpoint requires its own exact-head hosted CI; no claim
of merge readiness until it and review clearance are confirmed. The
post-sync diff has only PR #9 runtime changes/tests/docs, not migration 0039,
workflow, secrets, production configuration, recipe authority or recipe count.

Docs head `cffd959` exact-head hosted run `36239282586`, validate job
`108396637996` SUCCESS (ESLint, typecheck, full Vitest, local SQLite migration
smoke, web/Worker build). Re-executed `pnpm exec vitest run
tests/integration/t20-meal-composition-stale-read.test.ts
tests/integration/t20-legacy-family-and-safety.test.ts` at `cffd959`: 2 files /
24 tests PASS. `git fetch origin main fix/t20-postmerge-ci-picker-cuisine--hardening`
and `git merge-base --is-ancestor origin/main HEAD` confirmed remote/base
ancestry; the hosted run, local HEAD and remote PR head matched. `gh pr view 9`
and GraphQL review-thread query showed OPEN, MERGEABLE/CLEAN and zero unresolved
threads. The new documentation receipt is itself a new head, requiring fresh
exact-head CI; no failures remain in the completed checks listed here.

### Next action / release boundary

Obtain exact-final-head hosted PR #9 CI SUCCESS on this docs-only receipt
(lint/typecheck/Vitest/migration smoke/build), zero unresolved review threads
and MERGEABLE/CLEAN before offering PR #9 for maintainer merge. Stop before
merging PR #9. Staging identity/ledger and a
reviewed T20 staging migration/deploy remain a separate later gate; keep
both T20 flags OFF. `staging_migration=NO`, `staging_deploy=NO` for this task;
`production_migration=NO`, `production_deploy=NO`,
`production_enablement=NO`.

## T20 C5–C7 hardening handoff — 2026-09-26 UTC

### State and checkpoints

`origin/main` `bf57451` is unchanged, last CI `36221190222` FAILED. PR #8
OPEN at `16c5aae`, MERGEABLE/CLEAN, no unresolved review threads, hosted
`validate` `36233377483` SUCCESS. PR #9 remains stacked on #8 at `869f035`;
the branch does not contain #8's final docs-only head yet. No PR merged or
closed. Current C5 checkpoints: `ab83d35` (edited-slot affected suffix),
`5c6835e` (later slots sharing the projection), `6c68d8d` (V1 family and
evidence-sensitive safety key). C6: `092d67b` (missing-slot precedence),
`869f035` (concurrent slot creation). C7 code-freeze SHA is `869f035`;
the documentation checkpoint follows separately. No known unfixed P0/P1/P2
from the focused audit; production substitution policy was not inferred from
injected test fixtures.

### Verification and failures

On `869f035`, `pnpm check` PASS: typecheck, lint, 202 files / 4,574 Vitest
tests, `migration-smoke=ok`, build. `pnpm exec vitest run` of
`tests/integration/t20-{meal-composition-stale-read,legacy-family-and-safety,meal-composition-http,meal-composition-flows,roles-picker-shopping}.test.ts`,
`tests/integration/t19-{recipe-authority-split,planner-authority-persistence}.test.ts`,
and `tests/unit/t20-{meal-composer-ui.test.tsx,composition-shopping.test.ts,composition-safety.test.ts}`:
10 files / 112 tests PASS. `pnpm typecheck`, `pnpm lint`, and `git diff
--check origin/main...HEAD` independently PASS. New deterministic tests
confirmed the cross-slot, V1 family and slot-creation bugs as expected-red
before their fixes; all are now green. Two earlier `pnpm check` runs were
interrupted (exit 130) when further findings required changes; neither is
counted as final evidence. Hosted PR #9 checks remain absent while stacked
under non-main #8; staging/production were not exercised.

### Release blockers and next action

Maintainer: merge PR #8 through the protected PR flow and confirm exact-main
SHA/CI. Then fetch and merge the updated main into PR #9 (avoid dropping its
checkpoints; resolve documentation overlap), retarget #9 to `main`, and require
exact-head hosted lint/typecheck/Vitest/migration-smoke/build SUCCESS, zero
unresolved threads and mergeability. Only then may a maintainer merge #9 and
verify exact-main CI. Staging D1 identity, ledger and rollback bookmark still
need authorized verification before any staging migration/deploy. Keep both
T20 flags OFF. `staging_migration=NO`, `staging_deploy=NO`,
`production_migration=NO`, `production_deploy=NO`,
`production_enablement=NO`. Do not claim T20 production completion.

## T20 PR #8 CI fix — lock/regenerate race, 2026-09-26 UTC

Final PR #8 readiness receipt (2026-09-26 UTC): base `main` `bf57451`
(`bf57451e4a1a047eeff7a0938b903d1a37b6f8c9`), last main CI `36221190222` failed in the pre-#8 race test;
PR #8 remote head `5b0a6b9` (`5b0a6b995786b338999286023eb2e46de4bc45a7`), hosted full `validate`
`36226026618` SUCCESS. MERGEABLE/CLEAN, no unresolved human review threads,
working tree clean. Executed `pnpm exec vitest run
tests/integration/t20-meal-composition-flows.test.ts
tests/integration/t20-roles-picker-shopping.test.ts
tests/unit/t20-meal-composer-ui.test.tsx
tests/integration/t20-meal-composition-http.test.ts` — 4 files / 37 PASS;
`git diff --check origin/main...HEAD` PASS. Diff/config audit: no PR #8
migrations, environment or secret requirements, infrastructure, deploy/CI
workflow, production backfill or new flag; the pre-existing T20 flags default
OFF. PR #8 is ready for an intermediate normal merge, not T20 production
enablement. PR #9 contains the separately tested torn-read, same-slot safety
and stale-picker fixes and remains stacked on #8. No migration or deploy was
run. Next: maintainer merges #8 via PR flow, verifies exact-main CI, retargets
#9 to main and requires its exact-head hosted CI before merging #9. Do not
direct-push main or change production.

---

PR #8 hosted `validate` run `36225377465` failed 1/4554:
`competing lock/regenerate` got `[200, 404]`. Regenerate won; the losing PATCH
targeted the unlocked legacy component, which the winning regenerate replaced.
Test-only fix (`754fb2e`): the race
now targets the locked rice component, which regenerate preserves by ID, so the
loser always reaches the revision fence (409 `PLAN_REVISION_CONFLICT`); final
state asserted for both winners. Executed: flows file 5/5 runs PASS (16 tests);
throwaway sequential regenerate-then-stale-PATCH check PASS (409, rice still
locked; not committed); `pnpm typecheck` PASS; eslint on the file PASS.

Follow-up finding (production code NOT changed, per scope): `MealCompositionService.load`
reads the plan row and `readPlanCompositions` in separate awaits. A stale
component edit can pass `assertRevision` on the old row, then read a newer
composition and fail with 404 `COMPONENT_NOT_FOUND` before the fenced write.
Writes remain revision-fenced (no data loss); only the error classification is
wrong. Next: reclassify to `PLAN_REVISION_CONFLICT` when the plan revision
moved (or read row + compositions in one batch), with a regression test.

---

# T20 post-merge CI fix + picker cuisine filter, 2026-09-26 UTC

Branch `fix/t20-postmerge-ci-picker-cuisine` from main `bf57451` (PR #7 merge).
- `87c8e64` (test-only): main CI run `36221190222` failed at
  `tests/integration/t20-meal-composition-flows.test.ts:177` because the
  add/remove race can legitimately be won by DELETE (empty composition) while
  the test assumed `components[0]`. The combined race is split into three
  independent cases; each asserts exactly one 200 + one typed 409
  (`PLAN_REVISION_CONFLICT`; auto-apply losing to a save may be the documented
  `PROPOSAL_STALE`) and a final state matching the winner. DELETE-wins refills
  at the current revision; lock/regenerate and save/auto-apply start from a
  deterministic sequential setup. No production logic changed.
- `65084fc`: T20 picker `cuisine` query (strict enum of existing `CuisineType`
  values), filtered server-side on stored recipe cuisine together with role/q/
  kind; simple foods have no cuisine and are excluded when the filter is set.
  UI: labelled cuisine select and filtered empty state with Clear filters.
  Candidate authority, hard restrictions, composer, shopping, T19 unchanged.

Executed: focused `vitest run` of t20-meal-composer-ui, t20-roles-picker-shopping,
t20-meal-composition-flows, t20-meal-composition-http: 4 files / 37 tests PASS;
flows file 6/6 repeated runs PASS; DELETE-first sequence verified with a
throwaway sequential test (not committed). `pnpm typecheck`, lint PASS.
`pnpm check` on `65084fc`: typecheck, lint PASS; vitest 4,552 PASS / 2 FAIL —
`tests/unit/d1-readonly-query.test.mjs` and
`tests/unit/production-certify-workflow.test.mjs` hit the 5 s default timeout in
this sandbox (both PASS with `--testTimeout=60000`, ~6.2 s each; unrelated to
T20). Because the script stops at tests, `pnpm check:migrations`
(`migration-smoke=ok`) and `pnpm build` (`✓ built in 10.45s`) were run
separately: PASS. `git diff --check origin/main...HEAD` PASS. The running-app
UI check was not performed (the T20 UI flag stays off here). Nothing merged,
deployed or migrated; production D1 not accessed; no T20 flags enabled.

Next: open a PR from this branch, confirm hosted `validate` is green (it should
no longer flake at the old line 177), then run a flag-enabled local visual check
of the picker cuisine select before any T20 release.

---

# T20 PR #7 — final merge-readiness handoff, 2026-09-26 UTC

No implementation changes remained after review of `6882ba3` against main
`136cb6f`. PR #7 was MERGEABLE/CLEAN, with no review comments; exact-head
hosted `validate` run `36217584128` SUCCESS. `git diff --check
origin/main...HEAD` PASS. `pnpm exec vitest run
tests/unit/composition-flags.test.mjs tests/integration/d1-schema-gate.test.ts
tests/unit/t20-composer-candidates.test.ts tests/unit/t20-meal-composition.test.ts`
PASS (4 files / 46 tests). Previously the application head `0b465d5` passed
`pnpm check` (typecheck, lint, 201 files / 4,549 tests, migration smoke, build);
subsequent commits changed docs only. Remote D1 not accessed; no migration,
deploy, flag enablement, merge or T19 authority change.

Next: check hosted CI on this docs-only handoff head, then hand the merge
decision to the user. The database operator applies 0039 before deployment;
the release owner opts into paired server/UI flags only after the target D1 is
migrated. Neither action blocks merging.

---

# T20 PR #7 — final P2 handoff, 2026-09-26 UTC

**Status `T20_PR7_READY_FOR_FINAL_REVIEW`; no production operation or merge.**
Reviewed main `136cb6f`, prior head `a337a2b`: hosted CI `validate` run
`36216083854` SUCCESS. Application head `0b465d5`: hosted `validate` run
`36216675722` SUCCESS (MERGEABLE/CLEAN, no review comments). Final pass
`0b465d5` removes the stray EOF blank line in
`src/worker/services/meal-composition.ts` so the full PR diff check passes;
no logic changed. Handoff head `d7aef32`: hosted `validate` run `36217199489`
SUCCESS (MERGEABLE/CLEAN, no review comments). App checkpoints `e3aef74`
(total candidate pool cap 320 including eligible simple foods, fair multi-role
selection and ranked backfill) + `4f60157` (pre-score operation gate, cached
scores and best already-scored partials on exhaustion). No T19 authority change.

Executed: `pnpm typecheck` PASS, `git diff --check` PASS; focused
`pnpm exec vitest run tests/unit/t20-meal-composition.test.ts
tests/unit/t20-composer-candidates.test.ts tests/unit/t20-composition-safety.test.ts
tests/unit/composition-flags.test.mjs tests/integration/t20-meal-composition-flows.test.ts
tests/integration/t20-legacy-family-and-safety.test.ts`: 6 files / 68 tests PASS
before the zero-budget test; composer-only rerun: 17 PASS. `pnpm check` PASS:
typecheck, lint, 201 test files / 4,549 tests, `pnpm check:migrations`
(`migration-smoke=ok`), build (`✓ built in 6.64s`). `git diff --check` PASS.
Remote D1 schema and Week parity checks skipped locally. Independent focused
review: no actionable P0/P1/P2. No migration (0039 remains unapplied here), deploy,
production data mutation, flag enablement or merge.

Final-pass `pnpm typecheck`: PASS; focused `pnpm exec vitest run
tests/unit/t20-composer-candidates.test.ts tests/unit/t20-meal-composition.test.ts
tests/integration/t20-meal-composition-http.test.ts`: 3 files / 23 tests PASS;
`git diff --check origin/main...HEAD`: PASS after initial EOF warning was fixed.
Full `pnpm check` PASS: typecheck, lint, 201 test files / 4,549 tests,
`migration-smoke=ok`, build (`✓ built in 6.72s`); remote D1 schema and Week
parity skipped locally. Independent code/release audits found no new
P0/P1/P2 or merge blocker. Migration 0039 is deployment-only (target D1 owner),
and enabling the paired default-off Worker/UI flag is a release-owner decision.

Final narrow check: `pnpm exec vitest run tests/unit/composition-flags.test.mjs
tests/integration/d1-schema-gate.test.ts tests/unit/t20-composer-candidates.test.ts
tests/unit/t20-meal-composition.test.ts` PASS (4 files / 46 tests);
`git diff --check origin/main...HEAD` PASS. No runtime, migration or workflow
changes; no new merge blocker. Production/staging migration and release flag
activation remain separate operator decisions, not merge blockers.

**Next:** verify exact-head CI immediately before handing PR #7 to the user for
the merge decision; do not merge, deploy or claim `T20_COMPLETE` here.

---

# Tako-san T20 PR #7 review remediation (4 × P1 + candidate-cap P2) - 2026-09-26 UTC

**Status: `T20_REVIEW_P1_REMEDIATED` — local `pnpm check` PASS (200 files /
4,541 tests); PR #7 hosted `validate` run `36210020774` SUCCESS on head
`424be56` (MERGEABLE, CLEAN; this docs-only commit gets its own run). Production untouched: no
deploy, no D1 migration, T19 authority unchanged (d1/0/cutover=true, 500).**

`branch=feat/t20-meal-composition-v2` (PR #7), review base head `febeb1f`; implementation commit `2e4f878`.

Fixed (review findings on PR #7; the earlier "P1 = 0" claim was wrong):
- P1 Manual hard safety: T03 `evaluateHardRestrictions` extracted from
  `evaluateRankingEligibility` (behaviour unchanged) is the single definition.
  New `packages/recipes/src/composition/restrictions.ts` judges every component a
  Manual mutation adds (add/swap/replace, and Assisted/Auto apply) on the same
  T02 candidate (slot inventory, planner substitution policy, server evidence
  provider) that Auto ranks: dietary/allergen unknown, time unknown/over, hard
  nutrition unknown/conflict, forbidden (incl. used substitutes), never-recommend
  → 422 `HARD_CONSTRAINT_CONFLICT`. Simple foods use the same function in Auto,
  Manual and picker (Auto previously ignored time/nutrition for simple foods).
  No manual override model.
- P1 V1 family meals: composition routes (Manual/Assist/Auto) return 422
  `LEGACY_FAMILY_COMPOSITION_UNSUPPORTED` up front; the UI keeps V1 "Swap meal"
  and shows no composer for family slots. Family slots are now projected
  (`legacy_family`, exact T04 variant identity), so composed-plan shopping no
  longer drops their demand (it silently did before); an unresolvable variant is
  409 `COMPOSITION_REVALIDATION_REQUIRED`.
- P1 shopping substitution authority: `EvaluationScope` requires
  `substitutions/approvedSubstitutionIds/activeConstraints`, built by
  `evaluationScope(context)` from the same planning context as the planner and
  Auto. (The production context still supplies empty lists — no reviewed registry.)
- P1 flags: `deploy.yml` input `meal_composition_v2_enabled` (default false) →
  `release-check.mjs gate` normalizes once (manifest `mealCompositionV2Enabled`)
  → Build `VITE_MEAL_COMPOSITION_V2_ENABLED` + Worker `--var
  MEAL_COMPOSITION_V2_ENABLED` in staging and production; `scripts/composition-flags.mjs
  verify` fails unless server/UI/manifest/compiled value (`dist/composition-flags.json`,
  written by a Vite build plugin outside `dist/client`) agree. Wrangler configs
  default `"false"`. Production build moved to its own step after local gates.
  UI falls back to V1 controls when the composition API 404s (mismatch).
- P2 candidate bias: all role-matching recipes are generated and ranked; the 320
  cap applies after ranking with a per-role quota (no catalog-order truncation).
- Preview: `PREVIEW_MEAL_COMPOSITION_V2_SERVER=false` drills the UI-on/server-off
  mismatch in the isolated preview.

Checks executed (local, Node 24.19):
- `pnpm check` PASS: typecheck (app + worker), lint, Vitest **200 files / 4,541
  tests** (612.9 s), `migration-smoke=ok`, build.
- New suites: `tests/unit/t20-composition-safety.test.ts` (13),
  `tests/integration/t20-legacy-family-and-safety.test.ts` (5),
  `tests/unit/composition-flags.test.mjs` (17), +4 UI cases in
  `tests/unit/t20-meal-composer-ui.test.tsx`. Verified to fail on the old code:
  all 5 integration cases and the 2 UI family/mismatch cases.
- Browser (isolated preview, synthetic data, agent-browser, 390×844): flags on →
  composer shown, V1 swap hidden, Manual add of rice persisted; UI on/server off →
  compositions 404, V1 "Đổi món" shown, no composer. Family slot not browser-tested
  (static preview catalog has no families; covered by jsdom + HTTP tests).
- `deploy.yml` not executed on GitHub Actions (only parsed and unit-tested).

Remaining debt (not blocking): picker still lists recipes with
`constraintState: unknown` when safety is requested (server rejects on save);
role heuristics (staple 0 / dessert 0 in catalog); per-component servings.

Next: operator merge decision on PR #7 (not merged by the agent). After merge,
production Deploy fails closed until 0039 is applied through *Production D1
migration* (`expected_pre_tip=0038_auth_onboarding_completion.sql`,
`migration=0039_meal_composition_v2.sql`); staging D1 needs 0039 before its flag
is enabled. Automatic staging deploys ship the flag off. Then dispatch Deploy with
`meal_composition_v2_enabled=true` (see `DEPLOYMENT.md`).

---

# Tako-san T20 Meal Composition V2 - 2026-09-25 UTC

**Status: `T20_CODE_COMPLETE` — local gates PASS; PR #7 hosted CI `validate`
run `36197958265` SUCCESS on implementation head `0db541da8619fdf03f21bc4fb93d081fa335a0d5` (MERGEABLE,
CLEAN; this docs-only commit gets its own PR-head run). T19: `T19_COMPLETE_OPERATOR_ACCEPTED`. Production
untouched: recipe authority d1/0/cutover=true, 500 recipes; no T20 deploy; no
production D1 migration.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`
`starting_main=136cb6ff3d2921eac237c7b106b37ab5ee12a13f`
`branch=feat/t20-meal-composition-v2`

Implemented (ADR-031, `MEAL_COMPOSITION_V2.md`):
- T20A: additive migration `0039_meal_composition_v2.sql`
  (`generated_meal_plan_compositions`, `generated_meal_plan_components`,
  `recipe_role_assignments`; partial unique indexes for one dish per meal);
  domain model, closed role enum, deterministic role rules with provenance,
  nine bounded simple foods, flexible meal profiles, V1 read-time projection.
- T20B: server-authoritative Manual builder API (add/remove/swap/lock/role/
  reorder/replace) sharing the plan `revision` behind a batch fence; picker
  (summary DTOs, role/kind/text filters, stable offset cursor, ≤ 24/page).
- T20C/D: Assisted (complete / regenerate unlocked) and Auto (top ≤ 3) on one
  bounded, deterministic beam search; suggestions never write; apply recomputes
  and requires the same option ID; locks are domain-enforced.
- T20E: all components of all meals projected against one running T04
  inventory projection, then unchanged T05 aggregation (single subtraction).
- T20F: composed week cards, meal composer, picker bottom sheet/dialog,
  suggestion panels; vi/en; lock `aria-pressed`, one polite live region, focus
  restoration, Escape cancels without mutation.
- V1: unedited slots read as `main / legacy_v1`; V1 schemas unchanged; V1 swap
  on a composed slot is 409 `COMPOSITION_MANAGED_SLOT`; V1 regenerate keeps
  locked components; V1 shopping projects components. Flag off = pre-T20.
- Flags: `MEAL_COMPOSITION_V2_ENABLED` (server) and
  `VITE_MEAL_COMPOSITION_V2_ENABLED` (UI), both default off, independent of T19.
- Preview: `PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs`
  opts the isolated preview into V2 (default off keeps the T06B browser suite).

Role distribution on the 500-recipe D1 release (pinned test): main 362, side
87, soup 70, vegetable 37, simple_food 7, staple 0, dessert 0; unclassified 0,
invalid 0, duplicates 0, contradictions 0, review-required 0.

Checks executed (local, Node 24.19, sqlite3):
- `pnpm check` PASS: typecheck, lint, Vitest **197 files / 4,502 tests**
  (725.9 s), `migration-smoke=ok`, build. T20 suites: 6 files / 48 tests; T19
  authority suites (split 11, persistence 18, observability 19) PASS;
  d1-schema-gate 9 PASS.
- Earlier full run: 4,496/4,497 with one unrelated 5 s timeout in
  `production-certify-workflow.test.mjs` under parallel load; that file passed
  48/48 in isolation and in the final `pnpm check`.
- Browser (isolated preview, synthetic data, agent-browser): 375×812, 390×844,
  768×1024, 1280×900 — plan generation, V1 cards, composer, Auto options and
  accept, picker keyboard focus/Escape return, no horizontal overflow, no
  unnamed controls.

Not done / deferred: leftovers (T20B/T21), per-component servings, role review
tooling and AI-assisted offline role proposals, picker ingredient/cuisine
filters, whole-week Auto, price-aware scoring. `tests/fixtures/migration-sha256.json`
gets the 0039 hash only after the migration is applied (fixture policy).

Next: independent review of PR #7 (not merged by the agent); require exact-head
hosted `validate` on the final head.
Rollout (separately authorized): apply 0039 to staging then production D1 (the
schema gate fails closed on a 0038 ledger), then enable both flags. Do not change
T19 recipe authority.

---

# Historical T19 operator closure / T20 unlocked - 2026-09-25 UTC

**Status: `T19_COMPLETE_OPERATOR_ACCEPTED`. T20: `UNLOCKED`.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`
`main_baseline=136cb6ff3d2921eac237c7b106b37ab5ee12a13f` (PR #6 merge)

T19 closure was accepted by the operator based on the successful final D1
deployment, the rollback proof, the final restoration, exact-main CI, the
existing production read-only certification and runtime release evidence.
The evidence below is operator-reported for runs on the same main SHA; this
agent did not re-run or re-read those production runs in this task.

- Exact-main CI `36149295615` SUCCESS; current-main staging `36149849086`
  SUCCESS.
- Production sequence: shadow `36150427552`, canary-1 `36151130515`,
  canary-5 `36152198646`, canary-25 `36153116467`, first d1 `36153948951`
  (all SUCCESS).
- Rollback proof `36154980456` SUCCESS (d1 → shadow): PASS.
- Final restore: canary-1 `36167843671`, canary-5 `36176092421`, canary-25
  `36176824421`, final d1 `36183890785` (all SUCCESS): PASS.
- Final production authority: `mode=d1`, `percent=0`, `cutover=true`,
  `source=d1`, served recipes `500`, release `rel-bd00a4f53fcaeee4`,
  `fallback=null`, runtime fingerprint `f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`.

**The final post-rollout read-only recertification was waived by the
operator. No post-final-D1 certification run occurred; do not invent a PASS
receipt for it.**

T20 (Meal Composition V2) is unlocked and implemented on
`feat/t20-meal-composition-v2`; see the T20 section above this one once it is
recorded. T20 must not change production recipe authority (d1/0/true, 500).

---

# Historical T19 same-SHA promotion convergence handoff - 2026-09-25 UTC

**Status: `TAKOSAN_D1_PROMOTION_CONVERGENCE_FIX_IN_REVIEW`. Production
stable at `canary-25` (`a3e1614`). T19 incomplete; T20 blocked.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- d1 promotion `36144837880` failed because post-deploy readiness identified
  the Worker by commit only; old and new versions share the commit. Automatic
  restore succeeded after one retry (receipt `rollback.result=restored`).
- Fix in `scripts/release-check.mjs` and `scripts/wait-for-deployed-release.mjs`
  plus regressions; no workflow, secret, migration or app change.
  `pnpm check` PASS (191 files / 4,453 tests).
- **Next action:** after merge, restart on the new SHA from `shadow` with
  `confirm_recipe_catalog_rollback=true` (required by the transition rules
  when leaving canary-25), then canary 1 → 5 → 25 → d1, rollback proof and
  final d1. Do not retry d1 on `a3e1614`: it can race again.

---

# Historical T19 legacy-Worker bootstrap fix handoff - 2026-09-25 UTC

**Status: `TAKOSAN_PRODUCTION_BOOTSTRAP_FIX_IN_REVIEW`. No production deploy
yet; production still `4677ebb`. T19 incomplete; T20 blocked.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- Runs `36133649176` (token missing) and `36134994434` (legacy 401) failed
  in preflight; no production mutation.
- Fix: `legacy-authority` classifier plus restore-path handling; token
  mismatch (`RELEASE_VERIFY_UNAUTHORIZED`) and non-legacy Workers still fail
  closed. Full gate PASS.
- **Next action:** after merge and new-SHA CI/staging/certification, owner
  re-dispatches production shadow (`confirm_recipe_catalog_rollback=true`)
  with the new full main SHA; agent inspects the receipt before canary 1.

---

# Historical T19 production rollout handoff - 2026-09-25 UTC

**Status: `TAKOSAN_PRODUCTION_SHADOW_DISPATCH_REQUIRED`. Main `860380887350d4ab93e4d5e66a0fa4e074397608`
certified: CI, staging and production read-only PASS. No production rollout
yet. T19 incomplete; T20 blocked.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- Evidence: PR #4 merged (six files identical to `399ec9b`); CI
  `36131217435`; staging `36131763935`; certification `36132078167`
  (`PASS`, 500/500, ledger 0038, fingerprint match, FK/quick_check ok,
  baseline `aada9b9d-93f9-4db5-97a6-d5c4741a67e7`/`4677ebbabbb580b9045423350da719acaf8f5742`). Failed/cancelled Deploy runs
  `36131617559`/`36131966475` and workflow-file push run `36130289358` did
  not reach production. Production public readiness still pre-T19.
- Agent production shadow dispatch: HTTP 403, no run.
- **Next action:** owner dispatches Deploy (production, shadow, percent 0,
  full main SHA as `ref` and `hardened_sha`, `confirm_production=true`,
  bootstrap `confirm_recipe_catalog_rollback=true`); reviewer approves; agent
  inspects receipt; continue canary 1 → 5 → 25 → d1, rollback proof, final
  restoration to d1 on the same SHA. No main merges until complete; publish
  these docs afterwards.

---

# Historical T19 exact implementation patch handoff - 2026-09-25 UTC

**Status: `TAKOSAN_WORKFLOW_WRITE_PERMISSION_BLOCKED`. Sent the tested
single-commit `399ec9b` implementation patch to the owner for an authorized
maintainer to apply. No remote branch, PR, production query or certification
result was created by this exchange. T19/T20 BLOCKED.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- `git format-patch -1 399ec9b --stdout` and exact
  `git diff 399ec9b^ 399ec9b` show the same six implementation files. Do
  **not** use `git diff main...399ec9b` because local docs commits precede
  the implementation. No secrets or unrelated protected paths included.
- `git diff --check 399ec9b^ 399ec9b` PASS; `git apply --check -` of the
  format patch on an isolated archive of `origin/main=f933f222df992768534283b38d32b358498563d2` PASS.
  Repository remains on local branch with pre-existing untracked `.context/`;
  this handoff does not claim GitHub publication or remote certification.
- Next: authorized reviewer applies patch to fresh main, runs relevant tests,
  opens PR; after normal merge require exact-new-main CI, new-SHA staging
  receipt and a new production read-only certification with required review.
  Production rollout/migration and T20 still blocked.

---

# Historical T19 workflow publication permission handoff - 2026-09-25 UTC

**Status: `TAKOSAN_WORKFLOW_WRITE_PERMISSION_BLOCKED`. Query-path repair
locally green, but not published: no PR, no new CI, no new staging receipt,
no production certification. T19 and T20 blocked.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- Tested implementation `399ec9b`, docs `17ab64c` are local on
  `hoplite/stymphalos-a3bdf6c6`. Full `pnpm check` PASS: 191 test files /
  4,432 tests, lint, typecheck, migration smoke and build. `.context/`
  pre-existed untracked; `.hoplite/settings.json` was not modified.
- Push `git push origin HEAD:hoplite/stymphalos-a3bdf6c6` failed at remote:
  `refusing to allow a GitHub App to create or update workflow
  .github/workflows/deploy.yml without workflows permission`. Managed App is
  active for canonical repository ID `1385308553`; remote branch absent,
  PR list empty, main still `f933f222df992768534283b38d32b358498563d2`. Installation metadata GET was
  not readable (401 JWT required); this does not weaken explicit push refusal.
- **Next action:** use an approved integration with GitHub workflow-file write
  permission, or authorized maintainer publishing the **exact tested patch**, to
  create and review the PR. No token sharing or workflow-stripping workaround.
  After normal merge: exact-main CI → fresh staging receipt on new SHA →
  owner/reviewer-approved read-only production certification → inspect full
  PASS/unchanged baseline. No migration/rollout/T20 before those gates.
- Checks: `credential_control status`; denied explicit-ref `git push`;
  `git ls-remote` (branch absent); `gh pr list` (empty);
  `gh api repos/tako-vn1/Tako-san/commits/main` (`f933f222df992768534283b38d32b358498563d2`).
  No production D1/Worker changes by this agent.

---

# Historical T19 production certification query repair handoff - 2026-09-25 UTC

**Status: `T19_PRODUCTION_READ_ONLY_CERTIFICATION_BLOCKED`. Old-main staging
PASS; owner production certification run `36101940395` FAIL; no production
mutation by this change. T19 and T20 BLOCKED.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- Run `36101940395` attempt 1 (`workflow_dispatch`, head `f933f222df992768534283b38d32b358498563d2`)
  passed its release gate, post-review exact-main gate, production identity,
  previous Worker baseline, and remote schema/0001–0038/foreign-key gate.
  Its first `wrangler d1 execute --file schema-gate.sql` exited 1 with no
  bounded diagnostic. The failure receipt lacks `certification.result=PASS`,
  verified 500-recipe D1 catalog, runtime, health and final ledger proof;
  production readiness remains unknown. No deploy/migration was initiated.
- Pinned Wrangler 3.114.17 routes remote `--file` to D1's import API (DB
  blocking, summary instead of rows); `--command` uses the query API. The
  precise exit-1 cause is not proven. The repair changes all three
  certification proofs (schema, two-statement catalog, five-statement
  runtime) to guarded per-SELECT `--command` calls and fixes the same issue
  in Deploy runtime preflight. Existing validation and Environment approval
  stay fail-closed; no dependency upgrade or production API token change.
- New `scripts/d1-readonly-query.mjs` is fingerprint-pinned in the certification
  safety test. New unit regressions cover real generated SQL, query arguments,
  response shape and mutation/partial-output rejection. Five focused test
  files (260 tests), lint, typecheck and diff-check PASS. Workspace sqlite3
  was missing; `.hoplite/setup.sh` was added and `sandbox_control setup`
  installed it, preserving tracked settings overlay. `pnpm check:migrations`
  subsequently passed (`migration-smoke=ok`). Full `pnpm check` PASS:
  lint, typecheck, **191 test files / 4,432 tests**, migration smoke, build.
  Implementation checkpoint: `399ec9b`; docs are separate.
- **Next:** review/merge workflow repair; require protected exact-new-main
  CI, fresh staging deploy/receipt on that new SHA, then independently run
  Production Read-Only Certification with approved hardening SHA and reviewer
  gate. Only a complete PASS and unchanged baseline permits planning the
  separately authorized production D1 migration and staged rollout; T20 is
  blocked. Rerunning old run `36101940395` cannot use a merged workflow.

Executed checks: `gh api` GET for run/jobs/artifact `36101940395`;
`gh run view --log-failed` bounded; local Wrangler source for both remote
paths; `git fetch origin --prune --quiet`, exact-main API and actor/event;
`pnpm wrangler --version`; focused Vitest 5 files / 260 tests PASS;
`pnpm lint` PASS; `pnpm typecheck` PASS; `git diff --check` PASS;
`pnpm check:migrations` originally failed due absent sqlite3, then
`sandbox_control setup` PASS; `pnpm check:migrations` PASS;
`pnpm check` PASS (lint, typecheck, 191 files / 4,432 tests, migration
smoke, build). No live production SQL or Worker operation by the agent.

---

# Historical T19 staging PASS / production read-only handoff - 2026-09-25 UTC

**Status: `TAKOSAN_OWNER_TRANSFER_CONTROL_PLANE_MISMATCH`: installation
cannot dispatch production read-only certification (HTTP 403). Staging PASS;
production certification NOT STARTED; T19 and T20 BLOCKED. No production
mutation.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- **Rerun:** Deploy `36018964086` attempt 2 is SKIPPED (release/staging/
  production all no steps); cause of historical event gate mismatch is not
  conclusively established. It made no deployment.
- **Current-main staging:** owner manually dispatched the reviewed Deploy
  workflow as `36092413084` attempt 1, event `workflow_dispatch`, head
  `f933f222df992768534283b38d32b358498563d2`, actor `tako-vn1`. Release SUCCESS, staging SUCCESS,
  production SKIPPED. Secret preflight, build, exact-main CI recheck, staging
  deploy, smoke and protected authority proof all SUCCESS. Artifact
  `release-staging-36092413084-1`: deployed SHA `f933f222df992768534283b38d32b358498563d2`, staging,
  `static/0/cutover=false`, actual/global `static`, 71 served, release
  `rel-bd00a4f53fcaeee4`, fallback null. Hosted smoke log: readiness/database `ok`,
  smoke PASS. D1 readiness in static mode `not_evaluated` (not a production
  D1 proof). The accepted staging secret now works for this workflow; its
  actual value or IAM policy was not inspected.
- **Production gate:** main and green CI `36018278513` still match staged
  SHA. Production Environment requires `vn-taphoanhatung`. Reviewed
  `.github/workflows/production-certify.yml` is active and manual/main-only.
  Attempt to dispatch read-only certification with exact SHA and approved
  hardening SHA from staging artifact failed HTTP 403 (`Resource not accessible
  by integration`); no certification run, no production mutation. Do not
  replace with deploy or migration.
- **Next:** owner goes to **Actions → Production Read-Only Certification →
  Run workflow** on `main`, copies *full* `sha` and `hardenedSha` from
  `release-manifest.json` in the successful staging run's
  `release-staging-36092413084-1` artifact, sets
  `confirm_read_only_certification=true`. Require approval from existing
  production reviewer; then inspect certification result, unchanged
  production, catalog/ledger/integrity and rollback baseline. Only after a
  read-only PASS may a separately authorized D1 migration/rollout be
  considered; T20 remains blocked.
- **Executed checks:** `gh api` run/attempt/jobs/artifacts for old/new Deploy;
  download candidate and final staging artifacts into temporary directories;
  explicit safe receipt fields and bounded hosted smoke/authority log markers;
  `git fetch origin --prune --quiet`, main API and hosted CI;
  production Environment/workflow GETs; `gh workflow run
  .github/workflows/production-certify.yml` (403). No local application tests
  since no application/workflow code changed.

---

# Historical T19 staging rerun handoff - 2026-09-25 UTC

**Status: `TAKOSAN_OWNER_TRANSFER_CONTROL_PLANE_MISMATCH` (Actions rerun
permission denied). Owner says staging secret updated; metadata cannot be
read. T19 and T20: `BLOCKED`. No deployment/production mutation in this retry.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- **Owner report:** dedicated staging Cloudflare token and GitHub Environment
  update completed; installation cannot independently inspect the secret
  (`gh secret list --env staging` HTTP 403). Never ask for its value.
- **Exact main/CI:** `git fetch origin --prune --quiet`, repository/commit API
  and hosted CI confirm `main=f933f222df992768534283b38d32b358498563d2`, repository ID `1385308553`, CI
  `36018278513` `validate` SUCCESS. Workflow file equals `origin/main`.
- **Reviewed retry blocked:** attempted full `gh run rerun 36018964086 -R
  tako-vn1/Tako-san`, which GitHub denied (`Resource not accessible by
  integration`). Original `workflow_run` attempt remains 1, release SUCCESS,
  staging FAILURE (Cloudflare 10000 preflight), production SKIPPED. No new
  run/deploy. Read-only OAuth cannot list staging Worker secrets either (`No
  access to the specified resource`). Do not use ad-hoc Wrangler deploy or
  move main to provoke CI.
- **Next action:** owner opens
  `https://github.com/tako-vn1/Tako-san/actions/runs/36018964086` and clicks
  **Re-run jobs → Re-run all jobs**. Full retry recreates attempt-specific
  release artifact; `--failed` alone is not appropriate. Inform this thread
  when triggered. Inspect exact attempt, staging jobs, smoke/authority proof
  before proceeding. This `workflow_run` cannot start production; production
  requires a separate manual dispatch and Environment approval. T20 blocked.
- **Executed checks:** `git fetch origin --prune --quiet`;
  `git diff origin/main -- .github/workflows/deploy.yml` (no diff); GitHub
  repository/main/CI/deploy GETs; `gh secret list -R tako-vn1/Tako-san --env
  staging` (403); `gh run rerun 36018964086 -R tako-vn1/Tako-san` (denied);
  Wrangler whoami/Worker-secret-list probe (read-only OAuth lacks access).
  No application tests (no code change).

---

# Historical T19 Cloudflare login handoff - 2026-09-25 UTC

**Status: `TAKOSAN_STAGING_CLOUDFLARE_TOKEN_REQUIRED`; T19 and T20:
`BLOCKED`. No Cloudflare token created, no GitHub secret changed, no staging
deployment or production mutation performed.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- **Fresh permission recheck after owner authorization (2026-09-25 UTC):**
  rotated the GitHub App installation credential; staging Environment
  secret-name and Actions-policy GETs still return HTTP 403. Cloudflare
  `whoami` still lists only read-only user/account OAuth scopes; no staging
  API token exists in the workspace. Main is still `f933f222df992768534283b38d32b358498563d2`, last Deploy
  remains failed run `36018964086`. No secret write, token creation or workflow
  dispatch attempted. Need an approved integration with Cloudflare API Tokens
  Write and GitHub Environment Secrets write, **or** owner-side secure UI
  provisioning of the dedicated staging token/secret. Authorization in chat
  does not grant the missing service-issued permissions.
- **Authorized login:** owner approved Wrangler device login. Transient
  `pnpm dlx wrangler@4.119.0 login --device --browser=false --scopes user:read account:read`
  succeeded; sanitized `pnpm dlx wrangler@4.119.0 whoami` confirms Cloudflare
  account ID `ef250a88911fd24073cb73d1c07e0218`. Only `user:read`, `account:read` and
  `offline_access` OAuth scopes were granted. No token values were copied into
  GitHub, logs, docs or chat; do not use the OAuth snapshot as a CI secret.
- **Token creation blocker:** Cloudflare's API token-creation endpoint needs
  `API Tokens Write`, which Wrangler's device login does not offer. The managed
  GitHub App also cannot administer Environment secrets. GitHub CLI being a
  managed App does not mean the owner is not logged into GitHub in a browser;
  the older `TAKOSAN_GITHUB_LOGIN_REQUIRED` wording below is historical and
  overstates that distinction.
- **State:** GitHub commits API still reports `main=f933f222df992768534283b38d32b358498563d2` (`f933f22`);
  CI `36018278513` is green, Deploy `36018964086` is blocked on Cloudflare
  code `10000` before staging deployment. No staging Worker/D1 live identity
  proof from this read-only OAuth session; production remains untouched.
- **Exact checks:** `pnpm dlx wrangler@4.119.0 --version` and `login --help`;
  `login --scopes-list`; owner-approved device login; sanitized `whoami`;
  `gh api repos/tako-vn1/Tako-san/commits/main --jq .sha`; `gh auth status`;
  `git status --short --branch`; `git diff --check` and assertions for current
  T19 identities, blockers and historical records in all three docs. No local
  tests (no code changes).
- **Next owner action:** create a durable, dedicated staging API token in the
  Cloudflare dashboard with Worker-scripts write permission scoped to the
  correct account and set **only** GitHub `staging` Environment
  `CLOUDFLARE_API_TOKEN` in GitHub's UI. Never paste its value into chat or a
  repository file. Then confirm token and staging account/Worker/D1 identity,
  retry the reviewed exact-main staging Deploy, and require staging PASS before
  any gated production certification. No T20.

---

# Historical T19 owner-transfer handoff - 2026-09-24 UTC

**Status: `TAKOSAN_GITHUB_LOGIN_REQUIRED`; also
`TAKOSAN_STAGING_CLOUDFLARE_TOKEN_REQUIRED`. T19 and T20: `BLOCKED`.
No production mutation in this takeover.**

`canonical_repository=tako-vn1/Tako-san`
`canonical_repository_id=1385308553`

- **Transfer:** same numeric repository ID and preserved Git history as the
  historical `vn-tako4/Tako-san`; no mirror, migration, branch rewrite or remote
  URL change. `origin=https://github.com/tako-vn1/Tako-san.git`.
- **Main:** `f933f222df992768534283b38d32b358498563d2` (`f933f22`) from `git fetch origin --prune`, the
  commits API and local HEAD. PR #1-#3 merge history and CI repository IDs
  still belong to repository `1385308553`.
- **Authentication:** managed CLI reports `x-access-token`, not a
  `tako-vn1` user account; `gh api user --jq .login` fails HTTP 403. Do not
  log out the brokered installation token. Owner-approved browser login is
  needed in an authorized CLI context; workflow scope for a user session is
  unverified.
- **Control plane:** `main` is protected with required Actions `validate`
  (App ID 15368); accessible rulesets/rules return `[]`. `staging` and
  `production` Environments exist. Production reviewer `vn-taphoanhatung`
  still has `write` permission. Installation authorization returns HTTP 403 for
  Actions policy, workflow token permissions, full protection, secret/variable
  names and webhooks, and HTTP 401 for app installation lookup; these controls
  need owner-side verification, not guesses about missing secrets.
- **Current-main CI:** run `36018278513` for `f933f222df992768534283b38d32b358498563d2`, event
  `push/main`, `validate` SUCCESS: ESLint/typecheck, 190 test files / 4,415
  tests, migration smoke, build. Hosted run and logs were inspected.
- **Staging:** last successful Deploy `36009510442` certified older SHA
  `d6204d91b1849bf98df89c1c590e74395c494c89`. Latest Deploy `36018964086` on current main: release
  SUCCESS, staging FAILURE, production SKIPPED. Wrangler secret-list preflight
  returns Cloudflare code `10000`; build/deploy/smoke skipped. Current main
  is **not** staging-certified. No local Cloudflare credentials/OAuth session;
  no token was created/replaced or Worker/D1 account verified.
- **Checks run:** `gh auth status`; `git remote -v`; `git fetch origin --prune`;
  `gh api user --jq .login` (403); repository/commit/branch/Environment/
  reviewer/rules/policy/secret-name GETs (restricted calls noted above);
  `gh run view 36018278513` / `36018964086` (jobs and failed logs);
  `gh run list --workflow Deploy`; local config/release manifest and Git
  status inspection. `git diff --check` and `python3` checks for current identity,
  blocked gate and historical preservation passed for all three docs. No local
  test/build run because no application code changed.
- **Next:** authorized `tako-vn1` CLI login and owner-side control-plane audit;
  obtain a durable least-privilege staging Cloudflare token, verify staging
  identity and replace only staging `CLOUDFLARE_API_TOKEN`; retry reviewed
  exact-main staging Deploy. Production read-only certification and approval
  come **after** staging PASS. No docs-only PR or main movement for this receipt.
  T20 remains blocked.

---

# Historical pre-transfer T19 release-control handoff - 2026-09-25

**Status: `TAKOSAN_STAGING_BLOCKED`. Exact-main CI: `GREEN`.
Production: `UNTOUCHED`.
T20: `BLOCKED`.**

- **Canonical identity:** `vn-tako4/Tako-san` (ID `1385308553`); docs-recovery
  merge baseline `a86ed095ba77d1e3e1ba549ee5b28240d50ba731`.
- **PR #1:** merged normally at `2026-09-24T13:55:01Z`; reviewed head
  `0899c49a28906d09f1a51b8afe2c72e09c860f18`; merge commit `d6204d91`.
- **PR CI:** run `36007943241`, exact head `0899c49a`, `validate` SUCCESS.
- **Exact-main CI:** run `36009002161`, event `push`, branch `main`, exact SHA
  `d6204d91`, `validate` SUCCESS. Lint, typecheck, 190 files / 4,415 tests,
  migration smoke and build passed.
- **Diagnosis:** the reported zero-run state was observed in the four-second
  interval between merge and run creation. Human actor `vn-tako4`, active and
  unchanged CI YAML, matching `push/main` filter, no skip directive and enabled
  Actions policy rule out recursion suppression and control-plane failure.
- **Automatic staging:** Deploy run `36009510442` was created by the successful
  main CI. Release and staging succeeded; production was skipped. The receipt
  records exact SHA `d6204d91`, `static`, canary `0`, cutover `false`, source
  `static`, 71 served recipes and null fallback.
- **Docs recovery:** PR #2 merged docs-only head `2002dfd2` as `a86ed095`.
  Exact-main CI run `36016668591` passed `validate`; automatic Deploy
  `36017207468` ran release successfully and skipped production.
- **Current staging blocker:** staging stopped before build/deploy because the
  stored GitHub `CLOUDFLARE_API_TOKEN` was rejected by Cloudflare with code
  `10000`. Secret names remain present. Local Wrangler OAuth can refresh and read
  the Worker secret list, proving the stored access-token snapshot expired or was
  invalidated. Staging remains on healthy SHA `d6204d91`; `a86ed095` was not
  deployed.
- **Safety:** Production certification was not run. Production deploy, D1,
  secrets, traffic and rollback remain untouched. T20 remains blocked.
- **Residuals:** dependency audit and the separate `usehoplite` zero-check-run
  behavior remain follow-ups; protected `validate` is green and unaffected.
- **Next:** provision a durable least-privilege Cloudflare token, replace only the
  staging Environment credential, then repeat the reviewed staging path. Handle
  production prerequisites/certification separately. Do not start rollout or T20
  automatically.

---

# Historical T19 production read-only certification workflow - 2026-09-23

**Status: `T19_V2_PRODUCTION_CERT_WORKFLOW_PR_PENDING`. Production: `UNTOUCHED`.**

- **Base/branch:** `vn-tako4/Frigo-dev` (ID `1368281478`), main `a4b5d726`,
  exact-main CI `35817133131` PASS; branch `hoplite/akanthos-df8cfb50`.
- **Staging:** Deploy `35817440484` attempt 2 SUCCESS, production SKIPPED.
  Exact-main SHA, static/0/no-cutover, static source, 71 served recipes,
  `rel-bd00a4f53fcaeee4`, null fallback; machine receipt independently checked.
- **Changes:** manual `production-certify.yml` plus focused workflow tests.
  Existing release and D1 algorithms are reused unchanged. Production Environment
  approval remains mandatory. Read-only SQL/metadata only; no mutation command.
  Only sanitized manifest artifacts; no secret access for authority proof.
- **Checks:** focused 236/236, lint, typecheck, local config, migration smoke,
  build and diff check PASS. Missing sqlite3 initially blocked migration smoke;
  the existing repository setup repaired it. `pnpm test` exceeded the local
  600-second command budget (exit 124); no full-suite pass is claimed. Hosted
  complete-suite CI remains required; all eight workflow blocks pass `bash -n`.
  Exact commands and structural-vs-IAM safety limits: `CURRENT_STATE.md`.
- **Publication:** implementation commit `aee4e2e` is local only. Push of
  `HEAD:hoplite/akanthos-df8cfb50` failed: this GitHub App lacks `workflows`
  permission for the new workflow file. PR creation then failed because the
  remote head branch does not exist. No PR/new hosted CI; do not claim publication.
- **Next:** operator authorizes Workflows write for the existing repository App
  installation, then retry the explicit branch push and narrow PR (never bypass
  permissions). Require exact-head CI/review and maintainer merge, new main CI, then
  dispatch Production Read-Only Certification on main with `ref=<full new main>`,
  `hardened_sha=<owner-approved exact SHA>`,
  `confirm_read_only_certification=true`. Wait for production Environment approval.
  Inspect `certification.result=PASS` and the full sanitized receipt; a candidate
  or partial failure artifact does not certify production. Missing ledger entries
  must HOLD, never migrate in this workflow. Secret pair remains a separate gate.
- **Boundary:** agent merge is prohibited; no live certification has run. No
  deployment, migration, secret/config change or traffic mutation. T20 NOT STARTED.

---

# Release-secret provisioning receipt - 2026-09-23

**Status: `T19_V2_RELEASE_SECRET_PROVISIONING_BLOCKED`. Production: `UNTOUCHED`.**
Main `c0c8e82ac9bdb3167de4e5774c90cbd364b5ff92` (exact-main CI `35815588844` PASS) is
the release candidate. Automatic staging run `35815905652` failed BEFORE
deployment: the staging job env proves GitHub effective
`STAGING_RELEASE_VERIFY_TOKEN` is MISSING (empty), Cloudflare secrets PRESENT
(masked), staging Worker `RELEASE_VERIFY_TOKEN` UNKNOWN. This installation can
neither read secret metadata (HTTP 403) nor write GitHub/Worker secrets, and has
no Cloudflare credential.

**Next (operator):** provision the staging pair with one shared >= 32-byte random
value (GitHub staging `STAGING_RELEASE_VERIFY_TOKEN` = `frigo-staging` Worker
`RELEASE_VERIFY_TOKEN`; separate from the future production value), then re-run
the reviewed staging workflow for the current exact main. Certify staging
(deployed SHA, mode, canary percent, cutover, release ID, recipe count,
fingerprint, D1 readiness, fallbackReason, protected authority proof, smoke)
before any production read-only certification. No ad-hoc `wrangler deploy`.
Details in `docs/ai/CURRENT_STATE.md`; the rest of this file remains the
historical trail.

---


# Current takeover receipt - 2026-09-23

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


# Frigo / Takosan current handoff — 2026-09-22

## T19 V2 — recipe authority cutover (integration)

- **Base/branches:** repository ID `1368281478` (`vn-tako3/Frigo-dev`); exact
  canonical main/integration base `a3b1564`; immutable original branch
  `feat/t19-recipe-authority-cutover-v2` at `0a04209`; active branch
  `feat/t19-recipe-authority-cutover-v2-integration`.
- **State:** `T19_V2_APPLICATION_INTEGRATED_CI_PENDING`. Application authority unification
  (Recipe API = Planner = Shopping = Cooking under one `resolveRecipeAuthority`),
  authority-scoped fingerprints, stored-plan authority identity with typed
  revalidation, reviewed full-D1 release states (`static|shadow|canary{1,2,5,25}|d1`,
  derived cutover), protected recipe-authority release evidence.
- **Publication truth:** the original branch remains published and unchanged
  at `0a04209`. Application checkpoint `558be74` is integrated from current
  main (branch commits `8205883` + `553791a` + docs); PR #52 is merged
  historical documentation. **Safe stop 2026-09-23: the integration branch is
  publication-blocked** — the GitHub App credential cannot push
  workflow-changing commits (exact error in the canonical handoff). Recovery
  artifacts are workspace-only: `.artifacts/t19-current-safe-stop.bundle` and
  `.artifacts/t19-current-safe-stop.patch`, with SHA-256 values in
  `.artifacts/t19-current-safe-stop.sha256`. Hosted application CI has not run.
  Production is untouched.
- **Verification (current tree):** full Vitest 189 files / 4,364 tests PASS
  (run A); the final rerun (run B) passed 4,363 with one 5 s contention
  timeout in the unrelated T13 real-D1 file, which passed 22/22 in isolation;
  focused 13-file matrix 356 PASS plus 23 snapshot/persistence tests after the
  last cleanup; release-check 155, D1 certification 32, Worker rollback 10 PASS;
  `pnpm lint`, `pnpm typecheck` (both), `pnpm check:migrations`, `pnpm build`,
  `pnpm recipe:import:check` (`rel-bd00a4f53fcaeee4`, 500 recipes) and `git
  diff --check` PASS. The Wrangler-shaped `release-certify` fixture proves tip
  0037, 500 recipes, clean foreign keys and `quick_check=ok`.
- **Final hardening:** planner content/steps always come from the authority
  snapshot (static reads no D1 rows; d1 enrichment is fenced and degradable);
  same-source authority drift is typed; shadow and canary release probes
  exercise D1 so shadow cannot promote on `not_evaluated`; Deploy certifies
  `wrangler.jsonc` binding, Cloudflare/D1 identity, ledger, catalog identity
  (ordered IDs, duplicates, `runtime_order`), `foreign_key_check`,
  `quick_check` read-only before mutation; release ref must equal current
  main; backwards SHAs, stale/skipped/reverse promotions and unconfirmed
  downgrades/bootstraps fail; previous and deployed Worker versions must bind
  the pinned D1; failure or cancellation restores the exact previous version via
  the Cloudflare API with a complete evidence proof; staging is fail-closed on
  its proof configuration.
- **Blocked on (in order):** publication with a workflows-capable credential
  (owner action) → application PR + exact-head hosted CI/review → normal merge
  + exact-main CI → verified production identity, release secrets
  (`RELEASE_VERIFY_TOKEN` production + staging Worker secrets,
  `STAGING_RELEASE_VERIFY_TOKEN`) and `production` Environment approval.
- **Next:** the owner (or a `workflows`-granted installation) pushes
  `git push origin HEAD:feat/t19-recipe-authority-cutover-v2-integration`,
  verifies the remote SHA equals local HEAD, then the application PR opens. No
  production action before merge and exact-main certification. T20 stays
  blocked. Rollback after rollout = reviewed redeploy to `shadow` (or `static`
  if policy requires it), never data deletion.
- **Canonical handoff:**
  [T19_V2_WIP_HANDOFF.md](recipe-catalog/T19_V2_WIP_HANDOFF.md).

## Google Safari profile recovery + registration-only Turnstile

- **Base/branch:** repository `vn-tako1/Frigo-dev`; exact canonical base
  `8dc9198918837cb15f4a7ddf4f9029875b015091`; isolated branch
  `codex/google-safari-turnstile`.
- **Root cause:** the PWA service worker intercepted cross-origin GIS loads.
  After a blocker rejected the first load, its default cache fallback resolved
  no response and left the normal WebKit profile stuck; a clean/private profile
  worked. Clearing service-worker/cache state recovered immediately.
- **Fix:** `public/sw.js` bypasses every cross-origin request before
  `respondWith`; Google GIS and Turnstile therefore use the browser network
  stack. Same-origin uncached failure no longer resolves null.
- **Turnstile scope:** only `/auth/register` renders and verifies Turnstile.
  Login, forgot-password and resend do not challenge again. Auth rate limiting,
  resend cooldown, CSRF, OTP digest/single-use/expiry, and production config
  fail-closed behavior remain. Unknown/verified register/login resend addresses
  receive a generic no-op response and no email/OTP.
- **Evidence:** focused 124/124; full Vitest 185 files / 4242 tests; lint,
  typecheck, migration smoke, build and diff check pass. Candidate WebKit smoke
  with active service worker + first GIS request blocked recovered through the
  retry button; Google iframe 362x44, warning absent, login CAPTCHA frames 0,
  registration CAPTCHA frames 1.
- **Known unrelated baseline:** `pnpm audit --prod` reports two moderate React
  Router 6 advisories; no dependency changed.
- **Next:** publish PR, require exact-head hosted `validate`, merge only when
  green, then verify production release SHA/service worker and repeat WebKit
  smoke. See [GOOGLE_SAFARI_TURNSTILE_RECOVERY.md](GOOGLE_SAFARI_TURNSTILE_RECOVERY.md).

## T18E — `T18E_OTP_TEST_RECIPIENT_REQUIRED`

- **Base/branch:** repository `1368281478` / `vn-tako1/Frigo-dev`; exact base
  and production `66627ffea890dad1cec4e31674449775a940c660`; branch
  `feat/t18e-otp-email-delivery-recovery`.
- **Observed production state:** `SEND_EMAIL` and the operator-authorized
  `RESEND_API_KEY` secret are present; the supplied key authenticates. The
  operator completed DNS correction and Resend reports `tungjpstore.net`, DKIM,
  and both SPF-purpose records as verified. Current Cloudflare sender onboarding
  and the exact primary-provider rejection category remain UNKNOWN. Do not claim
  sender or recipient rejection without a sanitized event.
- **Implementation:** Workers Email -> Resend -> fail-closed is preserved;
  Resend HTTP/body categories are sanitized; final provider failures log only
  event/provider/category/purpose/environment; unexpected router rejection
  still invalidates production OTP; readiness separates configuration presence
  from delivery verification.
- **Contracts:** registration success/failure, fallback success, secured resend
  after initial failure, forgot-password anti-enumeration, single-use/replay,
  expiry, cooldown, Turnstile, digest-only storage and production `devOtp`
  suppression are certified. Client UX already remained truthful; no AuthPage
  or Google source changed.
- **Verification:** focused 165/165; full Vitest 185 files / 4238 tests; lint,
  typecheck, migration smoke and build PASS. Audit reports the unchanged
  lockfile baseline of 21 advisories / 6 high; no dependency changed.
- **PR/CI:** review-only [PR #50](https://github.com/vn-tako1/Frigo-dev/pull/50)
  is OPEN. Hosted validate run `35685553412` passed on publication head
  `eec404a`; PR was `MERGEABLE` / `CLEAN`. Wait for fresh exact-head CI after
  the final documentation receipt. Do not merge.
- **Safety:** no migration, workflow, payment, Google, D1, deploy, merge, or
  random test email. The only production mutation was the explicitly authorized
  Resend secret upload. Real inbox delivery is NOT RUN.
- **Next:** verify `no-reply@tungjpstore.net` in Cloudflare Email Service and
  supply an authorized test recipient. Then review/merge,
  exact-main CI, automatic staging and controlled staging delivery; production
  deploy remains separately authorized. See
  [T18E_OTP_DELIVERY_RECOVERY.md](T18E_OTP_DELIVERY_RECOVERY.md).

## T18D — `T18D_READY_FOR_REVIEW`

- **Task/base:** Human-style semantic hardening, not redesign; repository ID
  `1368281478`, `vn-tako1/Frigo-dev`, exact base `07ace57241f8270b2458610979c709bb69b9a65a` verified.
  Branch `feat/t18d-a11y-human-style-hardening` was created and pushed;
  implementation freeze is `d3ef61c`.
- **Scope/result:** The four original findings and seven additional scoped P2s
  are fixed. Independent review open P0/P1/P2 = **0/0/0**; two P3
  observations are deliberately deferred. The 27-screen disposition is
  **14 PASS / 13 PASS_WITH_NOTE / 0 FAIL**.
- **Evidence:** Final focused browser evidence is **14/14 PASS** in **42.8s**,
  strict axe clean; `.hoplite/artifacts/t18d/final/focused.log`. Final
  `lint`, `typecheck`, `test`, `check:migrations`, and `build` logs pass;
  Vitest is **185 files / 4226 tests** in **333.25s** under
  `.hoplite/artifacts/t18d/final/{lint,typecheck,test,check-migrations,build}.log`.
  Fresh style residuals **39 allowlisted / 0 unjustified** and contrast
  **33/33 PASS** were rerun under `final/`; lint/typecheck pass again after
  the test-only settling correction. `git diff --check` PASS.
- **Matrix recovery:** The second full matrix stopped at approximately case
  158 when `t17-a11y.e2e.ts` sampled scan-review entrance opacity and receipt
  enable-state before settle; failure context is retained. The parent patched
  the test to wait 350ms **after** async CTAs become enabled, matching T18C's
  settled-state convention. No axe rules or design tokens changed.
- **Final matrix:** **349 PASS / 5 intentional skips / 0 FAIL**, 354 total in
  23.3m, exit 0, no retries/flakes. All 84 T18D cases pass. The five skips are
  duplicate project instances of the once-passing mobile-390 breakpoint sweep.
  Strict axe violations **0** across 162 canonical checks; 45 incomplete
  contrast rule records retained. Exact command and suite counts in the report.
  Log:
  `.hoplite/artifacts/t18d/final/matrix-settled.log`, artifacts
  `.hoplite/artifacts/t18d/final/matrix-settled/`.
- **Boundaries/limitations:** No business/server/schema/workflow change, remote
  write, merge, or deployment. Human-style semantic, keyboard, and
  accessibility-tree/ARIA review were performed; VoiceOver/NVDA actual
  execution was not performed. Existing settings-file modification remains
  preserved and excluded.
- **Publication:** [PR #49](https://github.com/vn-tako1/Frigo-dev/pull/49) OPEN
  to `main`, review-only; verified checkpoint `fe1b5d4` matched remote (6 ahead /
  0 behind main, 0/0 vs upstream). Initial hosted `validate` IN_PROGRESS in run
  `35677663372` at 01:57 UTC; no unresolved review threads then. Auto-fix loop
  enabled, auto-merge disabled. This receipt is a subsequent doc-only checkpoint.
- **Next:** Inspect settled hosted CI and review feedback via the enabled loop.
  Do not merge, deploy, run remote migrations, or begin production promotion.

### T18D failure history — 2026-09-22

An earlier full gate pass recorded **185 files / 4226 Vitest PASS** in
331.37s. During AX-tree inspection, the completed timer still offered an
active pause control; this seventh P2 was fixed at the UI boundary with
`aria-disabled` focus retention, an inert terminal toggle, and working Reset,
without changing duration/store/ticks. An earlier 354-case matrix stopped at
case 96, and an earlier 13/14 focused attempt sampled an existing entrance
fade; neither is final evidence. The current final gates are recorded as
185 files / 4226 tests in 333.25s, and the settled matrix status and artifacts
are documented in the current T18D section above.

## T18C final handoff — `T18C_READY_FOR_REVIEW`

- **Task:** Continue existing T18C, not a restart. Repository ID `1368281478`
  is `vn-tako/Frigo-dev`; branch `feat/t18c-final-redesign-certification`,
  correct matching upstream, unchanged main/base `b8447e85`. Verified
  implementation freeze: `6f8f6f40bb2c47dacd33670ac7397b0528b469a8`.
- **Changes:** Evidence-led semantic, keyboard/focus, target, responsive and
  source-composition corrections only. Latest Home fix wraps rem-based regions
  under 200% text zoom without changing normal primary dominance. All 27
  identities compared to supplied boards/contracts at all six widths; final
  dispositions **2 PASS / 25 PASS_WITH_DOCUMENTED_DIFFERENCE**. No unresolved
  P0/P1/P2. Detailed differences are explicit in `T18C_VISUAL_CERTIFICATION.md`.
- **Checks:** `pnpm lint`, `pnpm typecheck`, full `pnpm test` (**184 files /
  4222 PASS**, 554.62s), `pnpm check:migrations`, `pnpm build`,
  `node scripts/t17/style-residuals.mjs` (**39/0**),
  `node scripts/t17/contrast-audit.mjs` (**33/33**), `git diff --check` and
  `git diff --check origin/main...HEAD` PASS. Final gates ended 08:23:33 UTC.
  Six-project T17/T18C browser suite: **379 PASS / 11 intentional skips / 390
  unique cases**, zero strict axe violations or horizontal overflow across
  162 canonical captures. Exact shard/recovery commands: `final/reports/commands.md`.
- **Failures/recovery:** Pre-fix 378/11/1 run found genuine Home zoom P2;
  original assertion preserved and focused follow-up 12/12 PASS. Concurrent
  Vitest hit unchanged CLI timeout under browser contention, was interrupted,
  and then passed serially. Three 40-minute outer wrappers left five unfinished
  browser cases; exact recovery 4/4 + 1/1 PASS and manifest reconciliation prove
  zero missing/duplicate cases. Do not call it one uninterrupted green run.
- **Evidence:** Separate final matrix, raw shards/recovery, 449 regression
  screenshot files, Board 1/2/3 six-width reviews, gate logs, and preserved
  failed-run archives indexed in `.hoplite/artifacts/t18c/EVIDENCE.md`.
  Original baseline and approved-source hashes are unchanged.
- **Boundaries/database:** No backend/shared/packages/migration/workflow/Wrangler
  change. T18A auth, T18B 49000/499000 VND and issued-intent/webhook/entitlement
  authority, Inventory Truth, OCR/AI, planner and Week logic unchanged.
  Synthetic local SQLite fixtures only; no remote D1 change or real payment.
- **Limitations:** Human VoiceOver and NVDA **NOT PERFORMED**; incomplete axe
  records retained. Hardware/provider/production certification is not claimed.
- **Publication:** Certification/evidence checkpoint `321824d` pushed and
  verified. [PR #48](https://github.com/vn-tako/Frigo-dev/pull/48) OPEN to
  `main`; CI/review auto-fix **enabled**, auto-merge **disabled**. Hosted
  `validate` **SUCCESS** on `289d80a` (run `35578662531`, 08:40:02 UTC),
  including lint/typecheck/full Vitest/migration smoke/build. Final read:
  no reviews/comments/unresolved threads, `MERGEABLE` / `CLEAN`.
- **Final readiness audit:** No introduced migration/configuration follow-up
  or additional application fix. Protected-surface and application-freeze diff
  checks PASS; high-confidence credential/private-key scan of 443 changed-text
  files/archive members found no matches. Re-executed style audit **39/0**,
  contrast **33/33**, and both diff checks PASS. Independent configuration
  review agrees. No application/test changes; this receipt is docs only.
- **Next:** Confirm the latest documentation-head CI, then await owner merge
  permission. The enabled loop handles any new CI/review feedback. No merge,
  deploy, T18D or speculative redesign. Keep pre-existing
  `.hoplite/settings.json` and `.hoplite/extracted/` uncommitted.

## Historical continuation checkpoints (superseded)

### Final browser failure / text-zoom correction

- Complete run: **378 PASS / 11 intentional skips / 1 FAIL**. Home at 1024px
  overflowed by 46px under 200% text zoom; this is a real P2, not a fixture issue.
- Three Home layout classes now wrap by rem-based region width rather than
  forcing two columns at a pixel breakpoint. Original zoom assertion unchanged;
  new explicit stacked-region check added. Six-width focused follow-up:
  **12/12 PASS** in 1.8 minutes.
- Preserve the complete failed run separately as `pre-zoom/`; current board
  reviews cover that freeze and must not silently certify new Home pixels.
- Next: rerun all 390 cases in three isolated two-project groups (independent
  frontend/API ports and process-local in-memory SQLite, one worker per group),
  rerun complete repository gates, inspect regenerated images and archive.
  This changes scheduling only, not tests, fixtures, retries, or assertions.

### Complete repository gate receipt

- Application freeze `b024b0d41d13e07df253dad4f6a7d472ec1d7c11`.
- Fresh full `pnpm test`: **184 files / 4222 PASS**, 818.46s, finished
  2026-09-21T06:49:59Z. Lint/typecheck/migration smoke/build/diff-check PASS.
- Style **39 allowlisted / 0 unjustified**; contrast **33/33 PASS** (one
  informational border pair). Full-diff review found imported license trailing
  whitespace: normalized that line and its fetch script, without changing any
  font byte/checksum. Script ESLint and `node --check` PASS; 5/5 font hashes PASS.
- Evidence checkpoint: `.hoplite/artifacts/t18c/repository-gates.zip`.
  Browser/visual final certification remains running; no final browser total
  or PR claimed yet. Next: finish six-width run, archive matrix, finalize PR.

### Keyboard closure checkpoint

- Strict target gate identified new brand/title elements without explicit
  44px bounds. Existing `tap-target` utility now supplies them; gate unchanged.
  Focused mobile-360 a11y/gaps/flag-off run **14 PASS / 1 intentional skip**.
  Preserve failed attempt at `resume/target-bounds-final-attempt`; final run
  restarts on the explicit-bound implementation, not on `ef5a619`.

- Review follow-up found P2 no-op title buttons on non-recipe legacy Week
  slots. Removed those title actions/affordances; preserved real choose/change
  buttons. Two targeted red cases, then five units PASS and real routed
  flag-off setup 1/1 PASS. Independent re-review reports no P0/P1/P2.
- The 384-case run and concurrent repository gate were intentionally
  interrupted for this fix, not counted as final; archived at
  `resume/pre-review-final-attempt`. Restart full gates plus 390 browser cases.

- Native inventory/recipe navigation, item-named shopping checkbox state, shell
  brand links, and legacy Week card/setup controls preserve existing handlers.
- Focused browser red 2/2, green 12/12; sibling-action follow-up 1/1 after a
  test-only fix for row ordering after refetch. New real-Link rendering exposed
  an incomplete router mock (25 failures); MemoryRouter restored it without
  removing assertions. Final focused units 3 files / 37 PASS; typecheck,
  targeted ESLint and diff-check PASS. The new test's two type errors were
  corrected in its fixture (`appendChild`, lowercase `dinner`).
- Full gates and unfiltered 384-case browser run now in progress. Neither the
  earlier interrupted final attempts nor historical 4217 results are current
  proof. Logs remain under `resume/reports/interrupted-final` and
  `resume/reports/keyboard`; final evidence is separately under `final/`.
- Next: finish final gates, inspect fresh matrix, archive and publish review PR.

### Source-led fixes ready for final rerun

- Source/fixed-tree checkpoint pushed: `147f1714a8c8c81e2e0d37785a614c0e4446f2be`.
- All 27 boards/contracts directly compared; presentation corrections applied
  without changing protected business authority. Targeted browser gates:
  43 passed/5 intentional skips, 18 passed, boundary 1 passed; typecheck passed.
- Failure ledger: initial gap diagnostic was 7 failed/1 skipped/6 passed.
  RecipeCard was patched between its mobile red and desktop green cases, so
  this is not a single pre-fix snapshot. The first 306-case pre-fix T17 run
  was intentionally interrupted after 59 passes/1 planned screenshot skip
  to apply verified source-led fixes; it is not final proof. Its interrupted
  JSON is not a valid completion report. A supplemental boundary test then
  hit the real authenticated landing redirect; clearing public-session state
  corrected the fixture, and the unchanged layout assertions passed.
- Next: freeze implementation, run complete T18C/T17 and fresh native gates,
  inspect final screenshots, archive evidence, finish docs and review-only PR.
  Human VoiceOver/NVDA remain NOT PERFORMED.

## T18C safe pause — certification handoff (2026-09-21)

- **Task/status:** `T18C_PAUSED_SAFE`; overall `T18C_PARTIAL` with
  `DIRECT_BOARD_COMPARISON_PENDING`. No direct Takosan boards available.
- **Branch/base:** `feat/t18c-final-redesign-certification` from exact main
  `b8447e85f099b800a9a8ebc6c4c137adc9e45a32` in repository `1368281478` /
  `omin-jp/Frigo-dev`. Initial tree clean; main CI #145 and staging Deploy #52
  successful; production skipped; no overlapping redesign PR.
- **Changes:** Checkpoint A `ac4d90e` (harness, registry/report, 162-PNG
  baseline archive) pushed; evidence-led presentation fixes applied after it
  (landmarks, heading order ×11, camera reduced-motion, VietQR focus
  trap/return) with red/green targeted regressions and OFL font fixtures.
- **Checks:** typecheck PASS and one targeted payment-focus regression PASS on
  the paused tree; `git diff --check` PASS. Full Vitest 183/4217 applies only
  to the `ac4d90e`-era tree. Matrix/gate rerun NOT yet run.
- **Evidence:** durable baseline in `.hoplite/artifacts/t18c/baseline.zip`;
  remaining screenshots/logs are ephemeral (paths listed in the handoff).
- **Boundaries:** No backend/schema/workflow changes, no payment/OTP authority
  change, no real payment, remote D1, merge, staging or production deployment.
  No T18D work.
- **Next:** Owner-resumable plan and exact artifact/test ledger:
  [T18C_WIP_HANDOFF.md](T18C_WIP_HANDOFF.md). See also
  `T18C_VISUAL_CERTIFICATION.md`.

## T18B handoff — `T18B_READY_FOR_REVIEW` (2026-09-21)

- **Final review fix:** verified expected start `0926222` on the existing
  branch/PR; replaced current-price revalidation with strict issued-row
  validation. Monthly/annual price-change, old-order payment, new-order price,
  malformed-row, expiry, terminal-state and replay/grant tests pass: focused
  **151/151**, including **65** server payment; full `pnpm test` **183 files /
  4217 PASS**; six-width browser **48/48**; lint/typecheck/migration smoke/build/
  diff checks PASS. SQLite fixture and local HMR-origin recovery are documented
  in the report. Earlier counts below are historical. Verify new exact-head CI
  on PR #47 before owner review; no merge/deploy/payment authorization.
- **Identity/base:** `1368281478`, `omin-jp/Frigo-dev`; exact main/base
  `13ff3f22082fc0601a81b90c96edded4741194ac`; branch
  `feat/t18b-payment-authority`.
- **Publication:** [PR #47](https://github.com/omin-jp/Frigo-dev/pull/47), OPEN;
  CI/review auto-fix enabled, auto-merge disabled. Do not merge or deploy.
- **Durable checkpoints:** A `2aba91acceeefba74ea242c7a55cae3b7b6d1e40`, B
  `c00ea9fa132455f96aea31608b689ac87709d511`, C
  `1cef30b902435ee71b0fae60a92b36ed9c3ca268`, style fix
  `1aabd32562edc2c5c37b3db9d7d19e1938896084`; each pushed immediately.
- **Implemented:** Worker-owned 49000/499000 VND; strict plan-only intents;
  signed PayOS response and webhook verification; server-generated QR
  instructions; owned status reads; atomic once-per-order entitlement; fresh
  same-owner `/me`; stale request/session fences and honest unavailable states.
- **Authority lifecycle:** price table → new offers only; issued intent →
  immutable per-order plan/amount/currency/order/expiry with persisted lifecycle
  status; signed callback → match that persisted order, not current prices;
  entitlement → atomic grant only from a valid persisted paid intent.
- **Compatibility:** no schema change. Old activation cannot grant; `grantCode`
  returns 410. Server-only PayOS client/API/checksum credentials and APP_URL are
  required for checkout. Unknown/failed provider creation produces no instructions;
  late paid callbacks for failed orders require operator reconciliation/refund.
- **Verification:** focused payment/session/entitlement 121/121; browser 48/48
  across six widths plus error-state rerun 4/4; brand/checkout follow-up 38/38;
  full Vitest **183 files / 4185 tests PASS** using
  `pnpm test --maxWorkers=2 --minWorkers=2` (no exclusions). Lint/typecheck/
  migration smoke/build/diff check PASS. Independent final security review has
  zero remaining P0/P1/P2/P3 findings.
- **Failures/recovery:** first full suite 4184 pass/1 failure exposed raw error
  colors; fixed semantic tokens without weakening coverage. Earlier focused
  parallel cold-load timeout/state fallout passed with the same tests/two workers;
  Worker-vs-DOM import fixed through the existing test bridge; transient edited-file
  typecheck and generated SW build errors recovered and final gates passed.
  Managed Preview's fixed port override was repaired; provider data is synthetic.
- **Boundaries:** 38 migrations, 0 new/changed; all T18A code before the
  payment-only legacy handler unchanged. Inventory, OCR/AI, recipe/planner, Week,
  production infrastructure/workflows unchanged. No real payment, deployment,
  remote mutation or merge. Main CI #140/staging #51 green, production skipped.
- **Readiness follow-up:** CI `35554499704` green at `2d6ff5a`; no review threads.
  Corrected CSP blocking VietQR in both production policies and removed the
  obsolete grant-secret warning (no infrastructure/binding changes). CSP unit
  and browser decode assertions failed before the fix, then passed. Final
  focused CSP/config/health/payment 104/104 and six-width browser 48/48 PASS;
  lint/typecheck/migration smoke/build, built-header parity and full-diff check
  PASS. One full-diff trailing blank line and a local test-adapter origin mismatch
  were corrected. Exact commands and limitations are in the report; full-suite
  final-head CI must be verified separately, not inferred from the earlier run.
- **Next action:** owner review/merge permission once final-head CI is green; no local blocker.
  Auto-fix is enabled for follow-up, not
  merge/deploy permission. See [exact report](T18B_PAYMENT_AUTHORITY_REPORT.md).

## T18A handoff — `T18A_READY_FOR_REVIEW` (2026-09-21)

- **Identity/base:** `1368281478`, currently `omin-jp/Frigo-dev`; exact main
  `51d0d3755d83b64185066228d98f44ab7bad5e3c`. Branch
  `feat/t18a-auth-resend-expiry-contract`.
- **Publication:** new [PR #46](https://github.com/omin-jp/Frigo-dev/pull/46),
  OPEN against main; CI/review auto-fix enabled. Do not merge or deploy.
- **Durable checkpoints:** server `88096cb7fbea8e3b95f5627ff5a46e8c3d34b462`,
  frontend/browser `47c3a3391e086caf2760b61ee4e2bfacd331cacf`, final security
  fixtures `53f9fefdc9d935bb736a37cdcd9f5b0d0479685e`; each pushed immediately.
- **Implemented:** server-owned `expiresInMinutes` from the storage TTL;
  bounded presentation-only client expiry on resend; honest unknown/missing
  metadata; delivery failure/offline stale-state cleanup unchanged. Reset
  responses expose only generic policy, preserving anti-enumeration. No
  migration, lifetime increase, credential persistence or anti-abuse change.
- **Verification:** final auth/security 300/300; server 86/86 and client 83/83
  focused subsets; full Vitest 180 files/4117 tests; six-viewport T17/T18A
  browser coverage 42/42; lint/typecheck/migration smoke/build/diff check PASS.
  `pnpm test --maxWorkers=2 --minWorkers=2` ran the entire suite, without filters.
  Exact commands and results are in [the report](T18A_AUTH_RESEND_EXPIRY_REPORT.md).
- **Failures/recovery:** missing locked Chromium fixed; browser rerun passed.
  First full run hit 600s shell timeout without a reported test failure;
  extended final run uses all tests. Setup lifecycle claim refusal reported;
  effective durable local setup was safely executed via shell. Platform-only
  settings were preserved in a named stash and excluded from the PR.
- **Boundaries:** billing/payment UI/payment behavior/migrations/other Worker
  code all zero diff from base. T17B history unchanged; T18B payment mismatch
  remains out of scope. Main CI #137 and staging Deploy #50 were verified
  successful for the unchanged base; production job skipped. This branch has
  not been merged or deployed anywhere.
- **Next action:** no local blockers; settle final-head hosted CI and human review of
  PR #46. Auto-fix subscription will deliver subsequent CI/review feedback;
  it is not merge/deploy authorization.
  Implementation-head CI `35549781613` passed; the final documentation SHA
  receives its own hosted run.

## Current handoff — T17B contract reconciliation (2026-09-20)

- **Identity/base:** repository id `1368281478`, `omin-vn/Frigo-dev`; branch
  `feat/t17b-contract-reconciliation`; exact starting main
  `858759f771baccb85f5ed6fd8e06df2fc0bbb112`.
- **Preserved checkpoints:** `029011c` onboarding/registry, `cbbeb1d` verify
  lifecycle, `f0349b6` contract coverage, `fde016a` labelled target
  measurement, `53e950c` delivery/spicy truth, `8b0f050` onboarding preference
  truth, `9a94afb` pending-auth/restriction truth, application HEAD `0f358f2`
  verification-exit/stored-value truth, and certification checkpoint `00594eb`
  settled layout measurement. Initial documentation checkpoint `dd108a2`
  published the evidence; corrective documentation checkpoint `f901b02` fixed
  authority wording and blockers. This publication receipt follows and cannot
  record its own hash.
- **Outcome:** URL-owned onboarding 04–06, screen 06 as a native single-select
  planning goal (`today`/`week`/`both`, client-only, never sent to the server,
  `week` → `/week/setup` after confirmation) with a review of the server-stored
  fields, unclamped household size (stored `6..20` shown as "5+" and
  round-tripped unchanged), server-confirmed completion for authenticated
  sessions, the
  preserved local-only offline-guest exception, owner-bound and
  delivery/expiry-honest `/auth/verify`, stale-request/route cleanup, supported
  spicy-value preservation, verification-exit loading reset, and concrete proof
  for all 27 reviewer-verified registry entries. Screen 05 has exactly seven
  visible cuisine and nine restriction choices (both include `other`) without
  dropping stored `italian`, `vegetarian`, or other authoritative values.
- **Final local evidence:** focused auth 102/102; final verify/onboarding 39/39;
  full Vitest 180 files/4087; registry 18/18; T13 60/60; clean full T17
  216 pass/6 intentional skips; automated accessibility 12/12 across six
  viewports; residual 43/43 payment-allowlisted/0 unjustified; contrast 33/33;
  lint, typecheck, migration smoke, build, focused ESLint, and
  `git diff --check` PASS. Exact commands are in the report.
- **Post-review fix (`56fc01b`):** screen 06 goal restored and household size
  unclamped. Reran focused onboarding/auth **87/87**, full Vitest **180
  files/4094**, registry **18/18**, remaining T17 **198 pass/6 skips**
  (full matrix 216/6/0), lint, typecheck, migration smoke, build,
  `git diff --check`; worker/migration/payment diffs still 0. Logs in
  `.hoplite/artifacts/t17b-validation-p1p2/`. The `00594eb` ZIP's screen 06
  captures are superseded for that screen.
- **Visual artifact:** clean source
  `.hoplite/artifacts/t17-playwright/final-00594eb-clean/`, validation source
  `.hoplite/artifacts/t17b-validation-00594eb/`, inspected contact sheet
  `.hoplite/artifacts/t17b-final-00594eb-contact-sheet.png`; tested 232-entry,
  180-PNG package `.hoplite/artifacts/t17b-final-visuals-00594eb.zip`, SHA-256
  `d6f6d4f032c0ac637ce5d1523ecc95b1411bc567538bca8d235a7131e6ad9d70`.
- **Boundaries:** `src/worker` and protected payment behavior have zero T17B
  diff; migrations also have zero diff.
  `PRE-EXISTING PROTECTED AUTH-CONTRACT BLOCKER`: registration reports
  `expiresInMinutes: 10`, while resend supplies no fresh expiry metadata; a
  server/API owner must resolve it separately.
  `PRE-EXISTING PROTECTED PAYMENT-AUTHORITY BLOCKER`: frontend and VietQR-prop
  prices remain `599000`/`79000`, while payment-intent authority is
  `499000`/`49000`; the QR does not source its amount from that intent. Aligning
  these requires separate owner-authorized payment work. No staging,
  production, or deployment action.
- **Corrective documentation verification:** `git diff --check`, required-marker
  assertions, and fresh Worker/migration/payment zero-diff checks pass. The ZIP
  revalidated at 232 entries/180 PNGs with 180 JSON + 180 TSV records, no missing
  fields/files or hash mismatches, and the recorded SHA-256. An initial ad hoc
  validator looked for `command` instead of the declared `generatingCommand`
  key; the corrected validator passed. Application gates were not rerun because
  this follow-up changes only the six documentation files.
- **Final merge-readiness verification:** focused auth/onboarding/session suites
  reran at 74/74; changed-file ESLint, full typecheck, and `git diff --check`
  passed; protected release/configuration surfaces remained unchanged; and the
  ZIP again passed integrity with recorded SHA-256
  `d6f6d4f032c0ac637ce5d1523ecc95b1411bc567538bca8d235a7131e6ad9d70`.
- **Managed Preview:** an initial inferred `pnpm dev` run path lacked the
  isolated API and guest creation returned 500. Restoring the effective
  `node scripts/security-preview.mjs` path recovered a ready Preview; the
  tracked `.hoplite/settings.json` was restored unchanged. At exact remote
  checkpoint `f901b02`, supported synthetic reset/login verified screens 04–06
  at 390x844, including five household radios, 7 cuisine and 9 restriction
  checkboxes, independent review values, and Back/Forward preservation. No page
  error was reported in the successful flow. The separate real-guest fixture
  endpoint still returned 500 and was not broadened by T17B.
- **Receipt separation:** PR #44/main CI/staging receipts are historical T17;
  T17B replacement PR #45 opened against exact main `858759f` from remote
  checkpoint `f901b02`. At publication head `1cacd0b`, hosted validate run
  `35532565549` passed, GitHub reported `MERGEABLE / CLEAN`, and reviews, review
  comments, conversation comments, and unresolved human feedback were empty.
  Its auto-fix CI/review loop is enabled. T17B itself has not merged or deployed.
- **Status/blockers:** `T17B_COMPLETE`; no in-scope implementation blocker.
  Manual — original boards/ZIP unavailable, final direct board comparison
  pending external reviewer, and `HUMAN_SCREEN_READER = NOT_EXECUTED`.
  Pre-existing protected auth/payment blockers are recorded above, not fixed;
  merge/deploy remain operator decisions.
- **Next exact action:** PR #45 is ready for the authorized user's merge decision
  when the documentation-only readiness checkpoint retains green/CLEAN
  exact-head provider status. Direct package/board comparison and NVDA/VoiceOver
  remain pending; neither has a named assignee or tracking issue in this
  repository. Do not deploy outside the operator path.

## Previous handoff — T17 continuation 6: contract gaps closed, `T17_PARTIAL` (2026-09-19)

- **Branch/PR:** `feat/t17-takosan-ui-v2`, PR #44, repository id `1368281478`
  (`tako-san1/Frigo-dev`). Implementation commits `dfdd0ab`, `227e36b`,
  `8f25fbd`, `463bf29`; docs checkpoint follows (hash cannot be recorded in
  itself — see `git log`).
- **What changed:** `/auth/verify` real route + code-free tab context + honest
  empty state; 27-screen registry certification; 991-site semantic-token
  migration with an enforced residual allowlist (payment UI only); WCAG-AA
  contrast/axe/h1/alt/44px/dialog/OTP certification with product fixes
  (viewport zoom re-enabled, `text-muted` darkened, `BottomSheet` +
  `useModalFocus`); reduced-motion certification on auth/onboarding/sheet/
  dialog/cooking/planner/scan; canonical `scan-review` + state-matrix captures;
  visual-review fixes (canvas width cap, aligned fixed bars, wrappers).
- **Exact verification at final HEAD:** `docs/ai/T17_UI_V2_REPORT.md`
  §Verification (lint, typecheck, full vitest, `check:migrations`, build,
  T13 suite at 360/390/430, T17 suite at 360/390/430/768/1024/1440, residual
  greps, `git diff 769d085 -- src/worker` = 0, payment boundary, `git diff
  --check`, `git status --short`). The old ephemeral artifact directory is no
  longer present; T17B replacement evidence is named in the current handoff.
- **Limitations:** the kit ZIP was not present in the sandbox — board
  comparison and `SCREEN_REGISTRY` diff are outstanding (registry reconstructed
  with per-row `source` tags in `tests/e2e/t17-ui/screen-registry.ts`); no
  human screen-reader walkthrough; virtual keyboard approximated by a shrunk
  viewport. `sqlite3` had to be installed in-session (repo setup script line).
- **Next exact action:** with the original design ZIP in hand, compare the
  T17B package named in the current handoff against the three Takosan boards
  and `screens/*.md`, diff `screen-registry.ts` vs
  `SCREEN_REGISTRY`, run an NVDA/VoiceOver pass over the canonical surfaces;
  fix anything found, then set `T17_COMPLETE`. Do not merge/deploy from this
  branch without the operator path in `DEPLOYMENT.md`.
- **Harness notes:** kill any leftover `security-preview.mjs` on :3000 before
  Playwright; the T17 config clears its output directory per run. T17B used
  isolated per-project output directories to avoid artifact collisions.

## Previous handoff — T17 Takosan UI V2 partial redesign on feat/t17-takosan-ui-v2

### Continuation 4 (same day) — full-diff review, latent defects fixed

### Continuation 5 (same day) — release preparation

- **P1 found from screenshots, not tests:** camelCase `semantic` colour keys in `tailwind.config.js` meant `bg-semantic-action-primary`, `text-semantic-text-*`, `*-soft`, `border-strong` etc. compiled to **no CSS**. Fixed (kebab keys); `takosan-brand.test.tsx` now guards every `semantic-*` utility in `src/web` against the config. Re-verified: vitest 178/4047, T17 390/768/1440 51/51, build PASS.
- **Release path:** PR into `main` opened from this branch; CI hosted must be green; staging deploys automatically from `main`; production is a manual operator dispatch (`Deploy` workflow, `production` Environment, `confirm_production`, full SHA + `hardened_sha`). No new migrations in this branch. The agent does not deploy (rule 19).
- **Still open before `T17_COMPLETE`:** slate-palette migration (856 sites), human design review of the captures (this continuation shows why), WCAG contrast on legacy pages.

**4b addendum:** three more fixes (FoodPreferences onboarding-flag leak; per-nav `layoutId`; dev-OTP `<button>`). **T13 suite first local run: 60/60** after two test-only fixes — `/profile`→`/me` target, and the presentation test's `localStorage.frigo_onboarded` shim (broken on base by migration 0038, not by T17) replaced with the real onboarding flow. Do **not** seed the preview profile as onboarded: the T17 screenshot spec and screens 04-06 need the fresh preview user to land on onboarding. Full T17 matrix green after one more test-only `networkidle` fix (12/12 re-verify, 6 widths). Prefer `--reporter=line` and make sure no `security-preview.mjs` is left listening on :3000 before a Playwright run — a leaked server from a killed run caused spurious 1.0 m timeouts once.

- **Scope:** every file in `git diff 769d085..HEAD` reviewed; 10 product defects + 1 test defect fixed. Table with severity/finding/fix in `docs/ai/T17_UI_V2_REPORT.md` §Continuation 4.
- **Most important:** (P1) new settings pages had unscoped React Query keys — fixed with scoped `queryKeys.foodPreferences()`/`planningPreferences()` and invalidate-after-write; (P1) offline planning save showed success while only queued — now explicit pending-sync copy; (P1) offline planning read hung — now honest unavailable state.
- **IA/layout:** TopBar detects `/me`, navigates to `/me` and `/settings/app` directly; immersive shell is camera-only so `/scan/:id/review` and `/scan/receipt-review` keep navigation; ReceiptReview wrapper removed and its CTA clears the nav; `BottomCTA`/`StickyActions` primitives clear the mobile nav.
- **A11y/motion:** auth fields label-associated with ids, autocomplete, OTP group/digit names, reveal-button name/state, mode switcher `aria-pressed`; Switch gets `aria-describedby` and a transform-driven, reduced-motion-governed thumb; inventory rows fade on enter/exit.
- **Verification:** lint PASS, typecheck PASS, full vitest **178/4046 PASS**, migration smoke PASS, build PASS, focused UI/auth **65/65**, T17 Playwright at 390 + 1440 (33 pass + screenshot timeout fixed test-only, then 6/6 re-verified incl. two new regression assertions). `git diff 769d085 -- src/worker` = 0 lines.
- **Next exact actions:** unchanged — slate-palette semantic migration, human screenshot review before baselining, first local T13 Playwright run. Status `T17_PARTIAL`.

### Continuation 3 (same day, same branch)

- **Scoped transitions:** named `transition-tap` token added to tailwind (explicit `transform, background-color, border-color, color, box-shadow, opacity`; layout never transitions); all 86 `transition-all` sites across 32 files migrated; zero remain.
- **Motion stories:** cooking steps slide directionally (+24px forward, reverse on Back; timers never depend on animation frames); inventory rows animate add/remove/layout via AnimatePresence + layout keyed by stable server identity (instant under reduced motion); scan camera→processing crossfade verified already reduced-motion-safe over preserved context.
- **State matrix:** new suite tests — inventory bottom sheet (labelled/closable/in-viewport), honest offline banner (driven by browser offline/online events; Playwright `setOffline` only fails requests and is not this component's trigger), and 200% text-zoom survival on Home/Fridge/Recipes/Shopping/Profile.
- **Real zoom bugs fixed:** the 200% gate exposed rem-sized nav icons forcing flex min-content overflow, Profile-hub/Home truncation gaps, unwrappable RecipeCard meta and IngredientRow action rows, and a missing `min-w-0` on the inventory search. Verified clean by probe at 390 and 360 (desktop and mobile emulation) and by the suite at all six widths (settled measurement).
- **Gates:** lint PASS, typecheck PASS, full vitest **178/4046 PASS**, migration smoke PASS, build PASS (436.34 kB / 120.90 kB gzip). Full T17 matrix run passed except two test-code defects (case-sensitive offline regex; zoom measured pre-settle) — fixed test-only and re-verified **12/12** at all six widths; no product code changed after the full-suite run.
- **Next exact actions:** (1) migrate the 856 remaining `slate-*` neutral-palette sites on legacy pages to semantic tokens (brand `takosan-*` aliases may stay per the kit); (2) human design-review of the canonical screenshots before baselining; (3) first local run of the T13 Playwright inventory suite. Status stays `T17_PARTIAL`.
- **Safety:** worker/PayOS diff zero; `main` untouched; production untouched.

### Continuation 2 (same day, same branch)

- **Auth decomposed:** `AuthPage.tsx` is now a state machine composing `src/web/features/auth/*` (AuthShell, LoginMode, RegisterMode, OtpMode, ForgotPasswordMode, GoogleAuthSection, AuthField, auth-shared) with the kit's auth-state transition. Security semantics byte-compatible (Turnstile single-use token rotation, GSI retry/width/credential-only contract, DEC-012 deferred guest transfer with explicit continue-without-transfer, private-session capture, exact server error mapping). Auth suites **11/11 PASS**.
- **Dead animation classes retired:** the plugin that defines `animate-in`/`zoom-in-95`/`slide-in-from-*` was never installed, so those classes did nothing; all 15 occurrences moved to the real reduced-motion-gated `animate-fade-in`/`animate-slide-up`. Zero remain (`rg` proves absence).
- **Visual matrix complete:** T17 config certifies 360/390/430/768/1024/1440; 17 canonical screenshots captured per certified width under `.hoplite/artifacts/t17-playwright/results/t17-screenshots.e2e.ts-*`; destructive-dialog focus-trap/Escape/focus-return and empty-inbox honesty asserted. The 360 run exposed a real `/shopping` overflow (quick-add input refused to shrink) — fixed with `min-w-0` and re-probed at scrollWidth 360.
- **Gates after continuation:** lint PASS, typecheck PASS, full vitest **178 files / 4046 tests PASS**, migration smoke PASS, build PASS (index 436.21 kB / 120.84 kB gzip), T17 Playwright **42/42 PASS** at certified widths, full 6-width matrix green.
- **Next exact actions:** (1) migrate per-screen motion to the shared primitives (inventory list layout, scan crossfade, cooking-step direction, planner layout) and replace indiscriminate `transition-all`; (2) extend the state-class matrix (bottom sheet, long Vietnamese text, loading/offline) and human design-review the screenshots before baselining; (3) per-screen semantic-token migration for legacy-styled pages (Home, Inventory, Recipes, Week fallbacks, scan/cooking). Status stays `T17_PARTIAL` until those are evidenced.
- **Safety:** worker diff zero again this continuation; PayOS/payment untouched; `main` untouched; no deploy.

- **Branch/base:** `feat/t17-takosan-ui-v2` from live remote main `769d08597563f816ef9c1dd9523fdafb687de3e2`; `main` untouched, no merge/deploy. Status **`T17_PARTIAL`**; full evidence and exact gaps in `docs/ai/T17_UI_V2_REPORT.md`, audit in `docs/ai/T17_UI_V2_AUDIT.md`.
- **Design contract:** attached `takosan-redesign-os-v2.0.0.zip` (kit read in full: rules, tokens, layout, motion, states, components, 27 screens, engineering, QA). Kit assets that a prior migration had missed (search/notification/expiry/settings/budget/nutrition/scan/shopping-list/leaf icons) were installed under `public/takosan/`.
- **Implementation:** semantic token layer (CSS `--semantic-*` + tailwind `semantic-*`, type/radius/elevation scales); `motion@13.4.0` + `MotionConfig reducedMotion="user"` provider and motion primitives; shared primitives module; AppShell V2 (mobile bottom nav / tablet rail / desktop sidebar, immersive-only hiding, real links + `aria-current`; legacy `BottomNav` retired with migrated test); settings IA split with dedicated pages over real GET/PATCH `/preferences` and `/week/preferences`, `/settings/notifications`, `/settings/privacy`, `/settings/app`, honest household/privacy unavailable states replacing fabricated flows; inbox/preferences separated; planner canonical with param-preserving Week redirects (flag-gated, flag-off keeps Week rollout surface); onboarding step routes; phone-width emulation removed from 20+ pages; fixed CTAs clear nav/rail/sidebar; Landing/Auth h1; zero emerald/user-visible "Frigo Plus".
- **Verification:** baseline on `769d085` and post-implementation both: `pnpm lint`, `pnpm typecheck`, `pnpm test` **178 files / 4046 tests**, `pnpm check:migrations`, `pnpm build` all PASS; new isolated suite `pnpm exec playwright test --config playwright.t17.config.ts` **33/33 PASS** at 390/768/1440 (sqlite3 CLI installed in-session as the repo setup script does; Playwright chromium downloaded in-session). Test changes are documented and justified (MotionProvider in the shell-ancestry assertion, MemoryRouter wrapping for the inbox link, navigation primitive in the brand test) — no coverage weakened.
- **PayOS/payment:** zero application change — `git diff 769d085 -- src/worker` is empty; the only payment-path diff is 12/12 presentation-only lines in `VietQRModal.tsx`; billing service functions untouched.
- **Known limits / next exact actions:** (1) decompose `AuthPage.tsx` (930 lines) into `features/auth/*` with mode-presence transitions keeping auth tests green; (2) migrate per-screen motion + semantic tokens on legacy-styled pages; (3) extend the T17 suite to 360/430/1024, the state-class matrix and canonical screenshots; (4) full a11y (contrast/zoom/SR) pass. Only then consider `T17_COMPLETE`.
- **Safety:** no production/D1/R2/PayOS mutation, no canary change, Inventory Truth/OCR/AI/recipe authority/planning algorithms untouched; `.hoplite/settings.json` is platform-managed session metadata excluded from T17 commits.

## Current handoff — T16 PWA cache and Google recovery deployed

- **Branch/base:** `codex/auth-pwa-cache-google-recovery` from canonical main `ff07773ce8e146923870698928a1b8b4c451f8e6`.
- **Root cause:** production `/auth` and `/sw.js` were Cloudflare cache hits; app registration used `/sw.js` while `_headers` configured `/service-worker.js`; worker cache name was fixed at `takosan-pwa-v2`. A clean browser loaded real Google GIS and opened the Google account popup, isolating the reported GIS failure to stale/blocked client state rather than the backend credential contract.
- **Implementation:** release SHA is injected into `dist/client/sw.js`; registration uses `/sw.js?v=<sha>` plus `updateViaCache: none`; update checks run on load/online/foreground; activation removes only prior Takosan caches, claims clients, then best-effort navigates stale same-origin clients once; navigation refreshes cached `/index.html`; cache writes are awaited. Google button width is numeric/clamped and retry script errors are explicit.
- **Headers/workflow:** effective `/auth` and `/sw.js` policy is no-store, hashed assets are immutable without inherited no-store, and deploy builds receive the exact SHA. Exact-SHA convergence now precedes smoke; smoke validates the shell/worker/asset headers plus embedded Worker SHA.
- **Verification:** focused 116/116, full Vitest 178 files / 4046 tests, lint, typecheck, migration smoke, build, shell syntax and diff check PASS. Local Wrangler returned the intended effective headers. Two-release Chromium proved one clean-install document request, one update navigation, exact new controller and only the new release cache.
- **Browser limit:** no release can force a closed, suspended or browser-blocked old tab to execute new code. Awaiting its navigation inside Service Worker activation deadlocks the document fetch, so refresh is best-effort after claim; reload/reopen/navigation is the reliable recovery path, and clients on this release gain load/online/foreground checks for future updates.
- **Recorded non-gate failure:** `pnpm audit --audit-level high` reports the unchanged lockfile's 21 advisories / 6 high in Wrangler/Miniflare, jsdom and build-time sharp paths. No dependency changed here and these packages are not added to the browser runtime; handle in a separate reviewed dependency upgrade.
- **Merge/deploy receipt:** PR #42 head `54dd81b3ba260843ed39d625c8e0b7c2f4cef831` passed CI `35415335137`, merged as main `6a016f185cae9c51ab5a1fc873a8a05a10a57edd`, then passed exact-main CI `35415536459` and staging Deploy `35415763483`. Protected production Deploy `35415843682` succeeded on Worker `2f228dc9-d97b-4eb1-8cff-9a0f2df3b51c`, D1 ledger 38 / tip 0038, recipe `shadow/0/false`.
- **Production verification:** readiness identifies the exact main SHA; DB/queue are OK and only `CONFIG_PLUS_GRANT_SECRET_MISSING` remains. `/auth` is current + no-store (Cloudflare Assets reports HIT), `/sw.js` is MISS + no-store and embeds the exact SHA, hashed assets are immutable. Clean Chromium opened the real Google account chooser and showed the exact-SHA controller plus sole matching Takosan cache.
- **Safety:** no migration, D1/R2/customer-data write, payment/PayOS change, Canary activation, full-D1 cutover, Inventory Truth change or Week change. Real inbox OTP receipt remains a separate manual evidence item.

## Current handoff — T15C-D production 1% Canary blocked before mutation (2026-09-19)

- **Canonical base:** repository `1368281478` / `frigo-6/Frigo-dev`; main and task base `347b536950cf54d25a2d6a880c3c2cb3d8c8f329`; branch `codex/t15c-production-canary-1pct`.
- **Merged prerequisites:** PR #38 -> `8163f05ed1af361f9c0658361df745227e6eae20`; PR #39 -> `347b536950cf54d25a2d6a880c3c2cb3d8c8f329`. Exact-main CI `35409762462` and staging Deploy `35409964105` succeeded; production job was skipped and staging stayed `static/0/false`.
- **Fresh gates:** frozen install, seed/import, typecheck, lint, migration smoke through 0038, build, diff check, and full Vitest **178 files / 4044 tests** passed.
- **Production read-only evidence:** Deploy `35404106102`, Worker `6c336889-680d-4cc3-b03b-1007849aa738`, SHA `b41aa468...`, `shadow/0/false`; readiness config-valid with DB/queue/email OK and only `CONFIG_PLUS_GRANT_SECRET_MISSING`; 5/5 recipe reads served the same 71 IDs, legacy details returned 200, sampled D1-only details returned 404.
- **Safe stop:** no authorized operator-owned INCLUDE and EXCLUDE household pair was supplied; customer/user IDs were not searched. Local Wrangler is unauthenticated, so no fresh direct D1/tail audit or secret provisioning was possible. No production mutation occurred. Classification `T15C_D_BLOCKED_AUTHORIZED_TEST_HOUSEHOLDS_UNAVAILABLE`.
- **Receipt merge:** commit `16958c605c1d4659591f2c02faecf593d81a7a6a` passed exact-head CI `35410893001`; PR #40 merged as `763d7e904798dc513c60d4da5f876598570c12fb`; exact-main CI `35411093064` and automatic staging Deploy `35411300235` passed on `static/0/false`, with production skipped.
- **Next exact action:** privately supply the two operator-owned household IDs, authenticate the intended Cloudflare operator session, repeat direct D1 certification, provision the three hashed cohort Worker secrets without printing IDs/digests, prove Shadow remains inert, deploy exactly 1% through protected `deploy.yml`, certify EXCLUDE then INCLUDE plus E2E/telemetry, and rollback to `shadow/0/false` with secrets retained. Receipt: `recipe-catalog/T15C_D_PRODUCTION_1PCT_CANARY_CERTIFICATION.md`.

## Current handoff — T15C-C authorized test cohort mechanism ready, dormant (2026-09-19)

- **Base/branch:** canonical main `b41aa4682481447795350fc1a9eeb1e80887bd0e`; branch `hoplite/aigeai-eca96ae8--t15c-cohort` (PR in body). Implementation `c5d2d63aa06ad51727aaeac6bd6cf01349598e29`.
- **What:** secret-configured include/exclude digest sets let operator-owned test households prove INSIDE/OUTSIDE 1% canary without touching the customer algorithm or adding any request-controlled switch. Default disabled; parsed/validated only in `canary` mode with cutover — inert in static/shadow/d1 so rollback is a single mode change with no secret cleanup (review P1 resolved); an active cohort requires both an include and an exclude household (`TEST_COHORT_PAIR_REQUIRED`, review P2 resolved); fail-closed validation; no IDs/digests in logs, readiness, API, manifest, workflow, or wrangler config. Details/setup/rollback: `recipe-catalog/T15C_AUTHORIZED_TEST_COHORT.md`.
- **Production:** unchanged — `shadow / 0 / false`, Worker == main. Classification `T15C_AUTHORIZED_TEST_COHORT_READY`; canary activation remains a separate authorized T15C-B step.
## Current handoff — T15C production Canary safe stop (2026-09-18, after T16 merges)

- **Base:** canonical main `b41aa4682481447795350fc1a9eeb1e80887bd0e` (unchanged during the session); docs-only branch `hoplite/aigeai-eca96ae8--t15c-canary`.
- **Production (read-only, public endpoints):** Worker commit == main, authority `shadow / 0 / false` per Deploy 35404106102 receipt, 71 served deterministically, D1-only IDs 404. D1 aggregates not re-queried (no credential here) — historical from T15C-B: 500 / tip 0037 / `rel-bd00a4f53fcaeee4` / media 500 pending, 0 ready.
- **Blocker:** authorized inside/outside 1% cohorts and Cloudflare credentials unavailable → `T15C_CANARY_BLOCKED_AUTHORIZED_COHORT_UNAVAILABLE`. No production mutation of any kind. Receipt + resume steps: `recipe-catalog/T15C_PRODUCTION_CANARY_SAFE_STOP.md`.

## Current handoff — T16 OTP resend and guest account gates ready for release

- **Branch/base:** `codex/auth-otp-guest-account-gates` from canonical main `14f06ff7f3ede72e676e2cb42b9949cca074a070`; this checkpoint contains the application, tests and documentation candidate, while production is unchanged.
- **Implementation checkpoint:** `31006994849ee9f6d78ae6114f82d77d41efc784` (`fix(auth): restore OTP resend and gate guest upgrades`).
- **Confirmed root cause:** the real Cloudflare Email Service binding rejects `no-reply@frigo.tungjpstore.net` because that subdomain is not onboarded as a sending domain. The onboarded apex sender `no-reply@tungjpstore.net` was accepted and returned a provider `messageId`. Do not claim inbox delivery until a real OTP message is received.
- **OTP fix:** `src/worker/services/email.ts` uses the apex sender and sanitizes the known subdomain error. `src/worker/routes/auth.ts` tolerates optional KV cooldown outages, releases cooldown after failed sends, and returns `503 OTP_RESEND_UNAVAILABLE` for unexpected failures. `src/web/pages/AuthPage.tsx` requires and renews a Turnstile token for resend.
- **Guest UX:** guest `/plus` shows an account-required state with `/auth?mode=login&returnTo=%2Fplus`, never the price cards or `VietQRModal`. The guest profile CTA links directly to that login path. Auth accepts guest sessions and safe local `returnTo` routing sends an onboarded account back to Plus after login.
- **Payment boundary:** no PayOS, billing, checkout, payment webhook or settlement code changed; authenticated users retain the existing pricing/payment flow.
- **Verification:** focused **86 tests / 4 files PASS**; full `pnpm test` **176 files / 4008 tests PASS**; `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations` (`migration-smoke=ok`), `pnpm build`, and `git diff --check` PASS. Browser checks at 390x844 and 1440x1000 confirmed the guest gate and return path.
- **Production pre-state:** Worker `e8164168-9566-475b-b0fa-7508368bf3e7`, main `0cb5d2c08fa24479ecce6b4c4e5f73b31a920ff5`, D1 ledger 38 / tip 0038, recipe `shadow/0/false`; only the known `CONFIG_PLUS_GRANT_SECRET_MISSING` readiness warning.
- **Next exact action:** commit coherently, push/open PR, require exact-head CI and review, merge normally, require exact-main CI, dispatch `.github/workflows/deploy.yml` with production confirmation and `shadow/0/false`, verify exact SHA/ledger/readiness, then use a normal browser to request/resend one OTP and confirm receipt without recording the code.

## Current handoff — T16 production and CSP hotfix deployed; OTP receipt pending

- **Merged release:** PR #34 contains implementation `3633a2fa8a0827a6aa31a3c86da7fb680a6e0f2a` plus docs `66e8073161cf418ffe4df2ed6cece75d56087af1`, merged as main `d6c981b1a67001b807f03166109f661bc753728c`. PR CI `35385363064` and exact-main CI `35385844667` passed.
- **User-facing result:** landing has two explicit choices; auth supports query-driven registration/Google entry; returning users skip completed onboarding; new users see three preference-only steps; onboarding has no duplicate account or unsupported Apple choice.
- **OTP/email:** `src/worker/services/email.ts` uses the structured Cloudflare Email Service API and sanitized error categories, with Resend fallback. Production delivery failure invalidates the challenge and register/resend return honest `503 OTP_DELIVERY_UNAVAILABLE`; development still exposes `devOtp` for local tests.
- **Google:** `/config` exposes the runtime `GOOGLE_CLIENT_ID`; frontend GIS and backend `aud` validation use that same value. Missing config fails clearly, retry reloads the GIS script, and no credential-less production fallback exists.
- **Persistence:** migration `0038_auth_onboarding_completion.sql` adds `profiles.onboarding_completed_at`; `/me`, auth responses, the auth store, and `SessionBoundary` hydrate server authority. `PATCH /preferences` validates input and batches preferences with completion.
- **Production D1:** workflow `35386276549` applied only 0038; ledger 38/tip `0038_auth_onboarding_completion.sql`; bookmark `000000d3-00000000-000050ea-709daab542439d8e8fab731b65dab714`; FK, quick check, aggregate drift, recipe media and catalog certification passed.
- **Production deploy:** workflow `35386532369` succeeded after Environment approval. Worker `c0161a22-1987-42dd-99c4-0a5874d4fadb` serves exact SHA `d6c981b1a67001b807f03166109f661bc753728c`; rollback Worker `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`. Recipe settings are unchanged at `shadow/0/false`. Readiness is exact-SHA and operational, degraded only by existing `CONFIG_PLUS_GRANT_SECRET_MISSING`; post-deploy smoke passed.
- **Browser evidence:** production Playwright at 390x844 and 1440x900 found no overflow; Google GIS rendered and opened Google Accounts without an origin error. The live guest path survived reload, completed all three onboarding steps, persisted preferences with HTTP 200, reached `/`, and retained the secure `__Host-frigo_session` attributes.
- **CSP hotfix release:** implementation `79dfca6483d90fcf33380acfe33f880c1e6ff7a5`; PR #35 head `c14a3755d95ddae316d5e6636ef85f9784ac4a54`; PR CI `35388666150`; merge/main `0cb5d2c08fa24479ecce6b4c4e5f73b31a920ff5`; exact-main CI `35388963509`. The policy adds only the required Google Fonts/GSI and Cloudflare Insights origins, with no wildcard or script `unsafe-inline`.
- **Hotfix production deploy:** workflow `35389274233` / production job `105743646947` succeeded after Environment approval. Worker `e8164168-9566-475b-b0fa-7508368bf3e7` serves exact merge SHA; previous Worker `c0161a22-1987-42dd-99c4-0a5874d4fadb` is the immediate rollback reference. Full gates, exact-head CI recheck, read-only ledger/schema gate, smoke and one-attempt convergence passed. Manifest and live API remain `shadow/0/false`, 71 recipes, ledger 38/tip 0038.
- **Independent hotfix verification:** readiness exact SHA; DB/queue/email configured; only `CONFIG_PLUS_GRANT_SECRET_MISSING` warning. Mobile/desktop Playwright loaded fonts and one Google iframe with no overflow or CSP console violation. The Insights request was no longer CSP-blocked but its external host refused the connection from the verification network.
- **UX audit:** repository audit remains FAIL with 19 issues / 686 warnings / 47 passed; pages-only audit remains FAIL with 6 issues / 303 warnings / 15 passed. Reported issues are existing unrelated pages/tests/styles, not the T16 landing/auth/onboarding surfaces.
- **Remaining limitation:** real OTP delivery is not certified. `tungjpstore@gmail.com` already exists; automated headed and headless Chrome displayed the real Turnstile checkbox but did not produce a token. No forgot-password request was sent and no email receipt may be claimed. One legitimate production guest test record remains by design.
- **Safety boundary:** no PayOS/payment, recipe authority, canary percentage, Inventory Truth, Week behavior, media/R2, or unrelated production setting changed.
- **Next exact action:** in a normal user browser, open Forgot password for the existing account, complete Turnstile, submit once, and confirm the email arrived without exposing the OTP. No code, migration, or deploy action is otherwise pending.

## Current handoff — T15C-B merged control plane; authorized-cohort safe stop (2026-09-18)

PR #32 merged with expected head `a7b3d23f2ad8b48203328116d0e35425390d2127` as
`a6e81cd89b9e4c6b923cfc39947b01faf44ff5f3`. Exact-head PR CI `35344089103`,
unresolved threads `0`, and exact-main CI `35347246583` / job `105606601599`
are SUCCESS. Automatic Deploy `35347579284` passed release and staging, skipped
production, and its release/staging manifests are `static/0/false`; staging
deployed the exact merge SHA on Worker `12623f3b-ac64-4255-9fbf-c429b6225e1d`.

Production was rechecked read-only and remains Shadow/static user authority on
Worker `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`, SHA
`88e8b54de121125866b2ff813e56e33277decf1c`: five catalog responses at 71,
legacy IDs 200, reviewed D1-only IDs 404. D1 `frigo-db` remains ledger 37 / tip
0037, 500 recipes, 500 runtime fields, 500 pending media / 0 ready; all SELECTs
reported `changes=0`, `rows_written=0`, and fresh aggregate catalog certification
passed at 500 recipes / 2 approved batches / release `rel-bd00a4f53fcaeee4`.
No migration, D1 write, R2/media write, or production deployment occurred in
this task.

The required authorized operator-owned inside-1% and outside-1% production test
cohorts were unavailable in repository/env/operator inputs. No arbitrary customer
households were inspected. Production Canary was not dispatched, so no
Environment approval was requested and no Canary certification fields exist.
Classification: `T15C_B_AUTHORIZED_TEST_COHORT_UNAVAILABLE`.

Next exact action: an authorized operator provides both cohorts; then recheck
production pre-state and dispatch exactly 1% through the protected workflow.
Do not widen above 1%, enable full D1, populate media/R2, start T14G, or modify
Inventory Truth/T09/T11, PayOS, or auth. Durable receipt:
`docs/ai/recipe-catalog/T15C_B_AUTHORIZED_COHORT_SAFE_STOP.md`.

## Current handoff — T15C-A bounded canary control plane (stop before activation)

- **Base:** certified main `6f589d0201499a3729d343e42ccb6d19fdff217a`; branch `codex/t15c-canary-control-plane`.
- **Remote closures:** PR #31 merged normally as `6f589d0…` after exact head `bb14ba3d…`; PR #29 closed, not merged, with a supersession comment. Automatic Deploy `35340976739` passed release/staging and skipped production.
- **Implementation:** `.github/workflows/deploy.yml` exposes only `static|shadow|canary`; canary choices are strings `0|1|2|5`; `scripts/release-check.mjs` validates the full combination and derives cutover; manifest/output/Wrangler propagation binds mode, percent, and cutover. Runtime authority files are unchanged.
- **Receipt:** `docs/ai/recipe-catalog/T15C_A_CANARY_CONTROL_PLANE.md` distinguishes runtime support from production authorization and documents T15C-B only.
- **Verification:** focused 121/121; full `pnpm test` 173 files / 3995 tests; `pnpm recipe:seed:check`, `pnpm recipe:import:check`, `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations`, `pnpm build`, and `git diff --check` PASS. Migration 0036 SHA-256 `04228788e60d59a2427d70956d4d8a108d0a6c1c4a643c47641402f658120ba9`; 0037 SHA-256 `68e52e6d8b9d44054f609a3d405c9fa329d093521ffc8c97009c76fbf7317ad6`; no 0038.
- **Safety:** no production redeploy, canary activation, D1 write/migration dispatch, R2/media population, T14G, T09/T11, PayOS/auth, force-push, or history rewrite. Production remains Shadow/static user authority with 71 served and D1 500 READY per T15B receipt.
- **Canary PR:** #32 is open and mergeable. In-file checkpoints through `642b4f8bc88c4a5987c047570ef408ef277efd1b` passed exact-head CI. The authoritative final head, final CI run, unresolved-thread count, and production recheck are recorded in the PR's post-publication receipt because this file cannot contain the hash of its own commit.
- **Next exact action:** confirm that PR receipt, then independent review of PR #32. Do not merge, dispatch production, activate canary, or widen the policy in this task.

## Current — T15B-SHADOW production certification complete; stop before canary (2026-09-18)

See `recipe-catalog/T15B_SHADOW_CERTIFICATION.md` for the durable receipt. Canonical repository `1368281478` is `frigo-6/Frigo-dev`; PR #30 head `ad3e1d1656418aaf495b130443d6514926b8bdca` merged as main `88e8b54de121125866b2ff813e56e33277decf1c` with zero tree delta. Exact-main CI `35336548833` succeeded. Automatic staging Deploy `35336830786` succeeded and remained STATIC71 on Worker `580acb76-a006-4c0a-b991-618ebde07e88`.

Production Shadow Deploy `35337110268` succeeded after the normal required Environment reviewer gate: release job `105574386006`, production job `105574426707`, Worker `c6fa2ce8-f35b-4485-ad38-09dbc19738d1`, exact SHA convergence in one attempt / 574 ms. The immutable manifest records `recipeCatalogMode=shadow`, schema tip 0037 and ledger 37. Existing production D1 migration run `35329772751` was not rerun and no manual/additional D1 write occurred.

Independent production certification performed five repeated readiness/catalog checks: every request returned exact SHA and 71 user-facing recipes; `vn-canh-01` and `gl-12` remained HTTP 200; five reviewed imported IDs remained HTTP 404. Sanitized Cloudflare tail diagnostics proved `catalog_mode=shadow`, `catalog_source=static`, D1 500 complete/hydrated, release `rel-bd00a4f53fcaeee4` READY, zero drift/order/hydration errors, zero Shadow errors, and no authority leak. Previous Worker `ab8ff038-2aaa-468b-a9de-8c5d94f14052` remains retained; rollback is the approved Deploy workflow with the same SHA and `recipe_catalog_mode=static` plus normal approval.

Next action: independent review of the docs-only receipt PR. Do not merge stale/conflicting PR #29 as-is. Do not enable canary, full D1, or cutover; do not populate media/R2; do not start T14G; do not modify Inventory Truth/T09/T11, PayOS, or auth. Classification: `T15B_SHADOW_COMPLETE`.

## Previous — T15B-PRE STATIC certified; SHADOW wiring PR ready (superseded 2026-09-18)

See `recipe-catalog/T15B_PRE_STATIC_RECEIPT.md` for the durable receipt. Main stayed at `0fe2cf071693208f6c642d8cbd994f5a79b5a2cf`; PR #29 was not merged. Existing D1 migration run `35329772751` is SUCCESS at 0037/500 and was not rerun. Static Deploy run `35333517052` is SUCCESS with required Environment approval, Worker version `ab8ff038-2aaa-468b-a9de-8c5d94f14052`, exact SHA convergence in one attempt/587 ms, and five repeated live STATIC71 checks. Previous Worker `56979cb5-e1a8-4241-8a4c-2432d41cc439` remains available for rollback.

No approved Shadow switch existed in the certified main workflow/config path, so no undocumented Cloudflare mutation was attempted. PR #30 from `codex/t15b-shadow-wiring` adds only validated `static|shadow` deploy input/manifest propagation plus tests; canary/full-D1 remain unavailable. Full local gates pass: focused 99/99; lint, typecheck, full 173 files/3976 tests, migration smoke, build, diff-check. Implementation head `97aff50d…` exact CI `35335079345` is SUCCESS; require independent review and final docs-head exact CI, then stop. Do not merge, activate Shadow, enable canary/full D1, write R2/media, start T14G, change Inventory Truth/T09/T11, PayOS, auth, or production infrastructure.

## Current — T15A pre-production hardening COMPLETE; Phase B (production) not started

See `recipe-catalog/T15A_WIP_HANDOFF.md` for the final T15A-R receipt: PR #27 merged to main `0fe2cf071693208f6c642d8cbd994f5a79b5a2cf` (merge commit by maintainer; certified head `776422fb…`; tree delta 0), exact-main CI SUCCESS, automatic staging deploy SUCCESS with exact-SHA convergence through `wait-for-deployed-release.mjs`, production job SKIPPED. Historical last verified production tip = 0034; Phase B must re-query the live ledger before any mutation. No production D1/R2/deploy/authority change has occurred.

## Current T14F — T14F_DEVELOPMENT_COMPLETE (T14F-C certified + closed; production untouched)

T14F-C ran on top of the certified T14F-B base `7d667523…` and completed the 500-recipe development certification: 0037 promoted byte-identical to the certified factory artifact (`68e52e6d…`), `approved-batches.json` + shipped manifest regenerated to 500 recipes / 2 batches (`rel-bd00a4f53fcaeee4`, manifest `fa47d31f…`), fresh/staged/production-forward replay PASS, D1 readiness READY 500, static/shadow/canary/full-D1 authority PASS, and user flows incl. Batch B recipes across six cuisines PASS. Certificate: `recipe-catalog/T14F_C_500_CATALOG_CERTIFICATION.md` (with the closure section).

**Closure executed** (safe stop `44c0ad38…` resolved): `pnpm lint` PASS, `pnpm build` PASS, full `pnpm test` **171/171 files, 3913/3913 tests** (419.6 s), `pnpm typecheck`, `pnpm check:migrations` (smoke through 0037), `pnpm recipe:seed:check`, `pnpm recipe:import:check` (500/2), `git diff --check` PASS; working tree clean. Hosted validate on `44c0ad38…` (run 35266591460) was cancelled by a runner shutdown, then on rerun **failed** the five real-D1 suites (`Error: Network connection lost`): replaying 0001→0037 in one workerd overflows the 1 MiB prepared-statement cache in workerd 1.20250718, whose eviction segfaults (cloudflare/workerd#5977). Fix `8c6080aa…` is tests-only (`tests/helpers/local-d1-worker.mjs`: persisted local D1, one batch per migration, workerd restart before the cache would overflow); real-D1 suites 5 files / 92 tests PASS. No migration, catalog, runtime, Inventory Truth, PayOS or auth change. A second, distinct closure blocker then surfaced on the docs-only heads: the hosted Vitest step passed 171/3913 but exited 1 with an unhandled `[vitest-worker]: Timeout calling "onTaskUpdate"` (birpc 60 s reply timeout starved by long synchronous SqliteD1 suites on the 2-vCPU runner). Fixed forward-only with `tests/helpers/vitest-event-loop-yield.ts` (vitest `setupFiles`, one `setImmediate` yield per test) — test config only.

Final head and hosted exact-head validate SUCCESS (run/job ids) are bound in the PR #25 **final certification receipt**; PR #25 is marked ready for review and stays **unmerged**. Next action: **STOP.** Merge is a separate explicit decision after independent review. Production rollout (production ledger → 0036/0037 via the OPS migration workflow with `EXPECTED_PRE_TIP`, D1 readiness READY 500 verify, shadow → canary → d1), media population and T14G each require separate authorization. Production currently does **not** contain 500 recipes. `recipe-catalog/T14F_C_WIP_HANDOFF.md` is historical only — do not resume from it.

### T14F-A — pilot certified (earlier)

- Recovery: repository ID 1368281478; `frigo-4/Frigo-dev`; `hoplite/massalia-c2862d7c`;
  main `f0c229f2…` unchanged; start `8079a37` inspected as a compatible test-only fix.
- Implementation: `2ee6f5cc0e144e5c522ce91bd005ab61dc124ed5`. The legacy routing suite uses
  a generated test-local 71 release, verifies actual D1/canary selection and null fallback,
  retains first batch `[5]` / cached `[]`, rejects and does not cache semantic drift,
  and cleans up its mock. Timestamp fix `486409c…` and production semantics preserved.
- Failure history: reproduced pre-remediation 5/7; independent 71/101 mismatch diagnostics
  confirm correct COUNT_DRIFT/static fallback. Both stale-fixture failures are resolved.
- Verification: routing 8/8, growth 21/21, combined 29/29 twice, focused subsystem 383/383;
  independent serial/non-isolated 29/29; no P0/P1/P2 review blocker. Executed seed/import,
  typecheck, lint, migration smoke, build, full `pnpm test`, diff: all PASS;
  full suite 171/171 files, 3911/3911 tests. Exact commands are in the next handoff.
- Hosted implementation validate **35223589293 / 105209475052 SUCCESS**. The
  [final certification receipt](https://github.com/frigo-4/Frigo-dev/pull/25#issuecomment-5714709031)
  binds the final documentation head to its own hosted SUCCESS; required for a valid T14F-B base.
- Pilot remains 30 + legacy 71 = 101 READY, complete 101/order 0..100, five statements/no N+1;
  fresh/staged replay, authority modes, imported HTTP flows and inventory regressions pass.
  Pilot sources/review/registry/manifest, 0036 hash and all historical migration bytes unchanged.
- Next action: **STOP.** Await separate T14F-B authorization; start only from the final SHA
  in the receipt, not an earlier implementation SHA. No ingredient scale preflight, Batch B,
  0037, 500 manifest, production mutation/deploy/switch, media population or T14G.
  PR #25 stays draft/unmerged and auto-fix subscribed. Pre-existing local settings delta preserved.
- Durable recovery, exact commands and hashes: `recipe-catalog/T14F_NEXT_HANDOFF.md`;
  full history: `T14F_REAL_CATALOG_GROWTH.md`; pilot quality: `T14F_CATALOG_QUALITY_REPORT.md`.

## Historical handoffs (not current T14F status)

## Current handoff — T14F WIP SAFE STOP on `feat/t14f-recipe-catalog-500`; pilot 30 compiled + 0036 promoted; ONE focused test failing; Batch B not started (2026-09-17)

- **Implementation state:** uncommitted T14F pilot WIP checkpointed and pushed on
  `feat/t14f-recipe-catalog-500` (base `f0c229f2…` = T14E certified main, still origin/main). See
  `docs/ai/recipe-catalog/T14F_WIP_HANDOFF.md` for the authoritative state, hashes and next steps.
- **Pilot:** `data/recipe-import/t14f/pilot-30.jsonl` (30 original recipes, reviewed) → T14E compile
  30/30 publishable, 0 duplicates / 0 unresolved ingredients → `migrations/0036_recipe_catalog_pilot.sql`
  byte-identical to artifact; manifest `rel-193ac2b16c64a260` = 101 recipes / 1 approved batch;
  `ALL_RECIPES` stays 71; migrations 36 / tip 0036; 0001–0035 unchanged.
- **Verification:** typecheck, `check:migrations`, seed check, import check, diff check PASS. Focused
  growth suites 20/21: `production forward path 0034 → 0035 → growth` fails only when both growth
  suites run together (passes alone; root cause unknown — fix before any Batch B work). Lint, build,
  full `pnpm test`, bundle accounting NOT run.
- **Next exact step:** checkout the branch, reproduce/fix the failing growth test (test isolation only —
  do NOT regenerate data or 0036), then continue the T14F packet pilot gate before Batch B.
- **Not done:** Batch B (399), final 500 manifest, QA/architecture docs, PR, production anything.

## Current handoff — T14E MERGED to main `f7a55408…`; main certified; production untouched; T14F not started (2026-09-17)

- **Implementation state:** PR #23 (`hoplite/syrakousai-f7b7c8a0-…-t14e-bulk-recipe-import-factory`, remediated head
  `ba1a45d43f2f4b85d4f7500eba36fe094a7d3655`, original reviewed head `7b4edcc8…` as ancestor) merged by normal merge commit
  `f7a5540841db27be31cdab9e0c2010cd92bc3861` onto `9ff57199…`. Main contains exactly the reviewed tree (diff PR head → main = 0).
  Merged: `packages/recipes/src/import/*` + `catalog-release.current.json` (`rel-1a047444a3632771`, 71/0), `catalog-fingerprint.ts`,
  manifest-driven `recipe-authority.ts`, `scripts/recipe-import*.mjs`, `pnpm recipe:import:check`, tests, ADR-027, docs.
  Migrations 35 / tip 0035 / no 0036; protected paths (`migrations/`, `.github/`, wrangler, `src/`, `packages/db|domain|ai`) diff = 0.
- **Executed checks (fresh, exact `f7a55408…`):** `pnpm install --frozen-lockfile`; `recipe:seed:check` ok ×3; `recipe:import:check`
  ok (`rel-1a047444a3632771`, 71, 0); `typecheck` 0 errors; `lint` PASS; `check:migrations` `migration-smoke=ok`; `build` PASS;
  `pnpm test` **169 files / 3889 tests PASS**; focused T14E 6 files / 88; regression 15 files / 275 (authority modes, catalog safety,
  D1 parity, engine/candidates, planner, cooking, media, Inventory Truth) + 7 files / 160 (ranking ties, meal-planning http/persistence/
  snapshot, week core flow); `git diff --check` clean; working tree clean. Hosted: PR validate 35179141504 SUCCESS; main validate
  35182568280 / job 105077715190 SUCCESS; incidental staging Deploy 35182789974 SUCCESS (production job skipped).
  Scale (50 % evidence-backed): 500 → 826,455 B; 2,000 → 3,326,028 B; 5,000 → 8,322,981 B SQL.
- **Not done — by design:** 0036, real recipe growth, media population, production D1/R2/deploy, Cloudflare vars/secrets, authority
  activation (production stays `static`), T14F. Production still `4ed98514…` / D1 0034 / static — `PENDING_OPERATOR` dispatch per
  `recipe-catalog/T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`.
- **Next action:** merge the docs-only closure PR (this file, `T14E_MERGE_RECEIPT.md`, `T14E_NEXT_HANDOFF.md`, state docs) → freeze
  `T14E_FINAL_CANONICAL_MAIN` = its merge SHA (exact-head validate SUCCESS required) → T14F only from that SHA per
  `recipe-catalog/T14E_NEXT_HANDOFF.md` §4–§7 (authorized dataset, validation, ingredient/duplicate/provenance review, deterministic
  compile, chunking decision, promotion, manifest update, SQLite replay, parity, independent review).

## Current handoff — T14E remediation (P1/P2/P3) on the feature branch; PR #23 unmerged, awaiting re-review (2026-09-17)

- **Implementation state:** forward commit after `7b4edcc8…`. `packages/recipes/src/import/{types,schema,normalize,compiler,
  sql-render,release-manifest}.ts`: `nutritionEvidence` + `duplicateReview` on the normalized model; `canonicalBatchProjection`
  (single hash projection); SQL renders `nutrition_profiles` (`<id>_nutrition_v1`, per serving, source_type/source_reference from the
  reviewed evidence) + `recipe_nutrition` rows; `normalized-recipes.json` carries batch metadata (incl. license/usageNote) and per-recipe
  evidence/review; `NUTRITION_EVIDENCE_LOST` guard. `recipe-authority.ts`: error union `D1_READ_FAILED | RELEASE_MANIFEST_INVALID`;
  manifest supplier failure ⇒ `RELEASE_MANIFEST_INVALID`. Migrations 35 / 0035 / no 0036; hash set unchanged. Protected paths untouched.
- **Executed checks:** `pnpm install --frozen-lockfile`, `recipe:seed:check` 3× ok, `recipe:import:check` ok (`rel-1a047444a3632771`, 71/0),
  `typecheck`, `lint`, `check:migrations` (`migration-smoke=ok`), `build`, `pnpm test` **169 files / 3889 tests PASS**; focused:
  provenance 11, factory 16, scale 4, output-policy+CLI 25, release-readiness 15, authority 17 (88); `git diff --check` clean.
  Scale (50 % evidence-backed): 500 → 826,455 B; 2,000 → 3,326,028 B; 5,000 → 8,322,981 B SQL.
- **Not done — by design:** merge, 0036, real recipes, media population, production/Cloudflare action, authority activation, T14F.
- **Next action:** independent re-review of PR #23 (exact head recorded in the PR post-push comment) → merge → freeze
  `T14E_FINAL_CANONICAL_MAIN` → T14F per `recipe-catalog/T14E_NEXT_HANDOFF.md`. Production dispatch still pending per
  `T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`.

## Current handoff — T14E import factory development complete on feature branch; PR open, NOT merged (2026-09-17)

- **Implementation state:** `packages/recipes/src/import/{types,schema,parse,identity,ingredients,normalize,duplicates,
  sql-render,release-manifest,compiler,index}.ts` + `catalog-release.current.json`; `packages/recipes/src/catalog-fingerprint.ts`
  (extracted, re-exported); `recipe-authority.ts` readiness now takes a release manifest (default = shipped manifest) and
  `D1RecipeAuthority` a release supplier; `scripts/recipe-import.mjs` + `recipe-import-output-policy.mjs`; `pnpm recipe:import:check`;
  tests + fixtures listed in `recipe-catalog/T14E_NEXT_HANDOFF.md`; ADR-027; design doc. Migrations 35 / tip 0035 / no 0036;
  0001–0035 byte-identical (hash set unchanged). `ALL_RECIPES` = 71. Worker router, D1 reader, hydrator, Inventory Truth untouched.
- **Executed checks:** `pnpm lint`, `pnpm typecheck`, `pnpm recipe:seed:check` (3× ok), `pnpm recipe:import:check` (ok,
  `rel-1a047444a3632771`, 71/0), `pnpm check:migrations` (`migration-smoke=ok`), `pnpm build`, `pnpm test` **168 files /
  3878 tests PASS** (baseline 164/3818); focused: import factory 16, scale 4 (500/2000/5000), output policy + CLI 25, release
  readiness 15, updated T14D authority 17; `git diff --check` clean. Synthetic 500/2000/5000 SQL ≈ 0.78/3.1/7.9 MB.
- **Behavioural equivalence:** T14D negative controls now report `LEGACY_BASELINE_DRIFT` for a legacy field change (was
  `FINGERPRINT_DRIFT`); `ready` readiness carries `releaseId`. Everything else identical; client bundle unchanged.
- **Not done — by design:** 0036, real recipe growth, media population, any production/Cloudflare action, authority activation,
  T14F. Production remains `4ed98514…` / D1 0034 / static (operator dispatch pending per `T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`).
- **Next action:** independent review of the T14E PR (do not merge automatically) → merge → record `T14E_FINAL_CANONICAL_MAIN`
  → T14F only per `recipe-catalog/T14E_NEXT_HANDOFF.md`.

## Current handoff — T14C/T14D OPS workflow merged (main 6910a7b4…); production D1/Worker untouched; operator dispatch required (2026-09-17)

- **Implementation state:** OPS-only. `.github/workflows/production-d1-migrate.yml`, `scripts/d1-migration-check.mjs`,
  `tests/unit/d1-migration-check.test.mjs`, `scripts/d1-schema-gate.sql` (5-branch), `DEPLOYMENT.md`, `docs/D1_SCHEMA_GATE.md`
  via PR #21 → `6910a7b4aee875f061454528daf6b4f0777e7f1a`. `deploy.yml`, migrations 0001–0035, `src/`, `packages/`, wrangler
  configs unchanged. Production Worker `4ed98514…`, production D1 expected tip 0034 (not read this session), recipe mode static.
- **Executed checks:** `pnpm lint`, `pnpm typecheck`, `pnpm check:migrations` (`migration-smoke=ok`), `pnpm build`, `pnpm test`
  **164 files / 3818 tests PASS**; real-repo candidate gate dry run at `ed34c6b9…` (35 migrations, tip 0035, 34 pins, `ref=main`
  rejected); full local-D1 rehearsal 0034→0035 (pre-ledger 34/apply, baseline 71/59/12 · 385/341/71/385, plan exactly 0035, post
  35/0035, `recipe_media` 71/71/0, FK `[]`, `quick_check ok`, drift none, schema gate PASS; certify mode with empty plan OK);
  schema-gate negative test (missing index + trigger → exit 1); 6-term gate reproduces `too many terms in compound SELECT` on local D1;
  hosted validate SUCCESS on PR head `2c39e484…` (35168307081) and on main `6910a7b4…` (35168563076); auto staging Deploy
  35168741683 SUCCESS with readiness `commit=6910a7b4…`; read-only prod probes (ready `4ed98514…`, recipes 71/59/12, media route 401
  on old Worker).
- **Not executed:** production ledger read, Time Travel bookmark, 0035 apply, production deploy, post-deploy smoke — all require the
  GitHub Actions production Environment, which needs a `workflow_dispatch` the Hoplite toolset cannot issue (sandbox `gh`
  unauthenticated; API 401). Reported as missing tooling.
- **Limitations:** `PRAGMA integrity_check` unsupported on hosted D1 (workflow uses `quick_check` + FK); `d1 info` may need extra
  token scope (workflow falls back to `d1 list` identity and warns); `CONFIG_PLUS_GRANT_SECRET_MISSING` pre-existing; Wrangler 3.114.17.
- **Next action:** operator dispatches `Production D1 Migration` (ref `6910a7b4…`, `0034_global_recipe_catalog_parity.sql`,
  `0035_recipe_media_layer.sql`, confirm=true) and approves the production Environment; on PASS dispatch `Deploy`
  (production, ref `6910a7b4…`, hardened `bb504cce…`, confirm_production=true); then smoke + write `T14C_FINAL_COMPLETION.md` /
  `T14D_PRODUCTION_DEPLOY_RECEIPT.md` per `recipe-catalog/T14CD_PRODUCTION_ROLLOUT_HANDOFF.md`. Do NOT set `RECIPE_CATALOG_MODE`.

## Current handoff — T14D merged and certified on main (bb504cce…); production rollout deferred to OPS

- **Done this packet:** fresh pre-merge gates (main/PR head unchanged; diff within T14D scope; migrations 35 / no 0036 /
  0001–0035 unchanged; modes + fence + no user-controlled mode; readiness codes; canary determinism; Inventory Truth
  files untouched; legacy recipe FK anchors pre-existing); PR #19 merged (`MERGE_SHA=bb504cce…`, PR head in main,
  tree preserved); post-merge main certified locally (seed 3×ok, typecheck, lint, `migration-smoke=ok`, build,
  **163 files / 3801 tests**, focused 131, diff-check clean) and by hosted CI (35157739716 / 105001075798 SUCCESS);
  incidental auto-staging Deploy 35158032832 SUCCESS (staging only). Docs closure: `T14D_MERGE_RECEIPT.md`,
  `T14D_NEXT_HANDOFF.md`, state docs.
- **Not done — by design:** Cloudflare login, 0035 production apply, any deploy, enabling shadow/canary/d1, T14E,
  media population. Production remains `4ed98514…` / 0034 / static.
- **Next action:** freeze `T14D_FINAL_CANONICAL_MAIN` (docs-closure merge SHA, exact-head CI green) as the only base
  for the next task; choose a track from `recipe-catalog/T14D_NEXT_HANDOFF.md` §6 (A: T14E import factory, B: media
  population, C: other) or run the Codex OPS sequence (§4) when Cloudflare access is available.

## Previous handoff — T14D recipe authority cutover architecture, development complete pending review

- **Branch/base:** `feat/t14d-recipe-authority-cutover` from `d0856b48e043c72d1793002e7c6047a186ac890d` (exact
  `origin/main` at start). Final head/PR/CI receipt: PR body + post-publication comment.
- **Implementation:** `packages/recipes/src/recipe-authority.ts`; `src/worker/services/recipe-authority.ts`;
  `src/worker/services/recipe-catalog-shadow.ts` (mode parser delegated; shadow unchanged); `src/worker/config/validation.ts`
  (fence/percent validation); `src/worker/types.ts`; routes `recipes.ts`, `week.ts`, `shopping.ts`;
  `packages/domain/src/week/planner.ts` (no hidden static default). Tests: `tests/unit/recipe-authority.test.ts`,
  `tests/unit/recipe-catalog-authority.test.ts` (reader guard), `tests/integration/recipe-authority-routing.test.ts`.
- **Database state:** no schema change; local replay still 35 migrations; production D1 remains 0034 (0035 pending OPS).
- **Checks executed:** `pnpm recipe:seed:check`, `pnpm typecheck`, `pnpm lint`, `pnpm check:migrations`, `pnpm build`,
  focused suites, full `pnpm test`, `git diff --check` — exact totals in the PR body.
- **Limitations:** no Cloudflare action by design; production remains static; canary/d1 exercised only against the
  in-memory D1 harness. Readiness requires exact D1 == ALL_RECIPES parity (T14E growth needs a new policy).
- **Next action:** independent review → merge → Codex OPS: apply 0035, deploy static, then config-only progression
  `shadow → canary (fenced, small %) → d1` per `recipe-catalog/T14D_RECIPE_AUTHORITY_CUTOVER.md` §12. Do NOT enable
  canary/d1 in production without `RECIPE_CATALOG_CUTOVER_ENABLED=true` and operator approval. T14E / media population not started.

## Current handoff — T14C merged (main 3a1e6be6…); production 0035 apply + deploy pending operator credentials

- **Done this session:** fresh pre-merge gates (main/PR head unchanged, migrations 35/no 0036/0001–0034 drift 0,
  ready-integrity + storage-key gates, protected areas untouched); PR #17 merged (`MERGE_SHA=3a1e6be6…`,
  PR head in main, tree preserved); post-merge main certified locally (seed check 3× ok, typecheck, lint,
  `migration-smoke=ok`, build, **161 files / 3776 tests**, diff-check clean) and by hosted CI
  (run 35147336385 / check 104966628291 SUCCESS); automatic staging Deploy run 35147682739 SUCCESS.
- **Not done — blocked:** production D1 ledger read, backup, `0035` apply, production deploy, production smoke.
  `wrangler whoami` → not authenticated and no `CLOUDFLARE_API_TOKEN` in the sandbox; the packet's stop
  condition (Cloudflare identity cannot be proven) applies. Nothing in production was mutated.
- **Next action (operator with Cloudflare access):** follow the 10-step runbook in
  `recipe-catalog/T14C_MERGE_RECEIPT.md` — identity → ledger (expect 34 / tip 0034) → export backup →
  aggregate baseline → plan (exactly 0035) → apply → verify 71 pending / 0 ready, FK/quick_check, schema gate →
  dispatch `Deploy` for `3a1e6be6…` (production, confirm_production, approval) → smoke → write
  `T14C_FINAL_COMPLETION.md` + `T14C_NEXT_HANDOFF.md`, mark `T14C_COMPLETE`, freeze final main.
  Do NOT deploy before 0035 is applied; do NOT populate media; do NOT start T14D/T14E.

## Previous handoff — T14C Recipe Media Layer, development complete pending review

- **Branch/base:** `feat/t14c-recipe-media-layer` from `8d3ebc444bbaa577893dd88a9d21f308a24f0cf5`
  (exact `origin/main` at start; unchanged). Final head/PR/CI receipt: see the PR body and the
  post-publication comment; not embeddable here (a handoff cannot contain its own commit).
- **Implementation:** `migrations/0035_recipe_media_layer.sql`; `packages/recipes/src/recipe-media.ts`;
  `packages/db/src/recipe-media.ts`; `src/worker/routes/recipe-media.ts`; `src/worker/services/recipe-media.ts`;
  `src/worker/routes/recipes.ts` (post-ranking enrichment only); `src/worker/index.ts` (public mount);
  `src/web/lib/recipe-media.ts` + 7 surfaces; `scripts/d1-schema-gate.{sql,sh}`, `scripts/migration-smoke.sh`,
  `scripts/render-recipe-seed.mjs` (media render/check); `tests/fixtures/migration-sha256.json` (0034 pinned).
- **Database state:** local fresh replay 0001→0035 = 35 migrations, `recipe_media` 71 pending hero
  slots, 0 ready; production untouched at 0034.
- **Checks executed:** `pnpm recipe:seed:check` (3× ok), `pnpm check:migrations` (`migration-smoke=ok`,
  incl. 0034→0035 upgrade + idempotent re-read), `pnpm typecheck`, `pnpm lint`, `pnpm build`,
  focused Vitest (schema 10 / catalog 16 / route+API 27 / presentation 8), full `pnpm test`,
  `git diff --check` — exact totals recorded in the PR body.
- **Limitations:** no production/staging execution; no R2 objects exist (all 71 resolve to legacy
  images exactly as before); `PRAGMA integrity_check` unavailable on hosted D1 (local only).
- **Independent-review remediation (2026-09-16, forward commit on the same branch):** P1 READY_INTEGRITY —
  `promoteRecipeMediaVersion(db, images, …)` verifies the actual R2 object (existence / MIME / size /
  SHA-256 of bytes, bounded 16 MiB) before an atomic guarded D1 batch; typed `OBJECT_*` errors; failure
  keeps target pending and old ready intact. P2 STORAGE_KEY_SQL_CONTRACT — 0035 renderer regenerated:
  exact `storage_key` CHECK (`CASE mime_type`), `content_length NOT NULL` for ready. Tests:
  `tests/helpers/recipe-media-r2.ts` (realistic R2 double), schema 13 / catalog 24 / route 27 /
  presentation 8. Checks re-executed: `recipe:seed:check`, `typecheck`, `lint`, `check:migrations`,
  `build`, full `pnpm test`, `git diff --check` — totals in the PR body. Still no production/staging
  action; 0001–0034 byte-identical; no 0036.
- **Next action:** independent review of the remediated PR #17 → merge → operator rollout (backup, apply
  0035, deploy via `deploy.yml`, smoke) → separate media population task (new bytes ⇒ new version ⇒ new
  key; never overwrite a ready key). Do NOT apply 0035 remotely before review.

# Frigo / Takosan current handoff — 2026-09-15

## Current handoff — T14B-B COMPLETE; T14C ready to start, 2026-09-16

- **Implementation state:** no application code changed; this checkpoint is OPS + docs. Production D1
  ledger tip `0034`; production Worker `56979cb5-e1a8-4241-8a4c-2432d41cc439` = main `4ed98514…`.
- **Executed checks (hosted/production):** `wrangler whoami`; `d1 list/info`; ledger SELECTs before/after;
  `d1 export` (SHA-256 `ab082dd4…343c`); `d1 migrations apply --remote` (0034 ✅); catalog/ordinal/FK/
  quick_check SQL; `scripts/d1-schema-gate.sh remote` PASS; Deploy runs 35101845374 + 35102115354 SUCCESS
  (production job ran lint/typecheck/test/check:migrations/build + schema gate + smoke on the runner);
  curl smoke of health/ready/recipes/auth-config/CORS/SPA; `wrangler tail` 25 s: 0 exceptions.
- **Not executed locally in this session:** `pnpm check` (docs-only change; hosted `validate` on the PR head
  is the gate). `PRAGMA integrity_check` is refused by hosted D1 (SQLITE_AUTH) — recorded.
- **Limitations:** backup lives in the thread sandbox (`/tmp/d1-backup/…`), copy out if retention needed;
  `CONFIG_PLUS_GRANT_SECRET_MISSING` readiness warning pre-exists; Wrangler 3.x outdated.
- **Next action:** merge this docs-only PR → freeze `T14C_CANONICAL_BASE_MAIN` = resulting main SHA →
  start T14C on `feat/t14c-recipe-media-layer` per `recipe-catalog/T14C_HANDOFF.md`. Do not enable
  `RECIPE_CATALOG_MODE=shadow` in production without a separate decision.

## Current handoff — T14B-B MERGED to main; production rollout blocked by existing OPS secret, 2026-09-16

- PR #14 (head `004e5a32`) merged into `main` as `c7455160bfc8d279d38bc7ca4c0751542012a3c5` (normal
  merge commit; PR content byte-identical in main). Main CI `validate` SUCCESS (run 35072991882);
  fresh main gates: typecheck, lint, seed check, `migration-smoke=ok`, build, 157 files / 3704 tests.
- Production D1 (`frigo-db`, `f975ec39-…`) still needs 0034 applied by an operator with Cloudflare
  credentials (none available here); the auto Deploy run 35073197948 failed at "Deploy to Cloudflare
  staging" with `CLOUDFLARE_API_TOKEN` missing — the known OPS blocker. Production application is
  unchanged (pre-T14B-B lineage). Read-only prod probe healthy (71 static recipes served).
- Status: `T14B_B_ROLLOUT_BLOCKED`; T14C NOT started (no handoff written until rollout closes).
  Receipt: `recipe-catalog/T14B_B_MERGE_RECEIPT.md`. Next: operator applies 0034 remotely, verifies
  ledger/counts/integrity, sets the staging/production Cloudflare secrets, dispatches Deploy.

## Historical — T14B-B remediation FINAL (review-ready), 2026-09-16

- Continued from safe checkpoint `d9130b69…` (hosted validate SUCCESS run 35053041994, now
  historical). Commit A `19b144a5` rewrites `tests/integration/recipe-d1-runtime-parity.test.ts`
  to consume `D1RuntimeRecipeCatalog.listRuntimeRecipes()` as emitted (no `byId`/`ALL_RECIPES`
  re-mapping, no sorting): strict-equal list + unsorted ID order, recommendation parity,
  tie-sensitive ranking, planner tie fixture, >5-alternative swap regression, executed swap,
  ingredient-ordinal integrity and shadow health (info at 0 order drift, warn otherwise), each with
  a reversed-catalog negative control. Mutation check: an ID-sorting hydrator fails 8/11 tests.
  Commit B finalises docs: category = typed open (non-empty string), region = closed vocabulary;
  ADR-024 records persisted runtime order, explicit ingredient ordinals and static authority.
- Focused: `recipe-d1-parity` 12, `recipe-d1-runtime-parity` 11, `recipe-catalog-authority` 5,
  `recipe-catalog-safety` 6 → 4 files / 34 tests. Full gates and fresh exact-head hosted CI are
  recorded in `recipe-catalog/T14B_B_REMEDIATION_HANDOFF.md` §10 and the PR #14 body.
- Authority unchanged: `ALL_RECIPES`; no `d1` mode; production static; shadow throttle unchanged;
  0001–0033 byte-identical; 0034 re-rendered in place (unmerged). PR #14 NOT merged; PR #4
  untouched; T14C/T14D/T14E not started. Next action: maintainer review + protected merge of #14.

## Historical — T14B-B remediation SAFE STOP, 2026-09-16

- Work stopped by instruction mid-remediation; nothing discarded, checkpoint pushed to PR #14's
  branch only. Superseded by the FINAL entry above; kept for lineage:
  `recipe-catalog/T14B_B_REMEDIATION_HANDOFF.md`.
- Implemented and locally verified on the checkpoint tree: persisted canonical `runtime_order`
  (0034, renderer-owned), explicit `recipe_runtime_ingredient_order` positions (reader/hydrator,
  fail-closed), `StaticRuntimeRecipeCatalog` preserves input order, shadow `orderDrift`
  diagnostics, and the 33/33 migration fingerprint manifest pinned from `c1c1c14a…`.
- Not finished: rewrite `tests/integration/recipe-d1-runtime-parity.test.ts` without the
  ALL_RECIPES-reordering workaround (tie + >5-alternative swap tests), correct category wording
  (typed open, not closed) in ADR-024/PR body, rerun full gates, obtain fresh exact-head CI.
- Tree at stop: typecheck/lint/seed-check/migration-smoke/build/full test (157 files / 3699
  tests) all exit 0; `git diff --check` clean; hosted CI on the checkpoint SHA NOT_RUN; last
  known green head `f8813d50…` (run 35050720485).
- Authority unchanged: `ALL_RECIPES`; no `d1` mode; production static; no deploy/production
  mutation. PR #14 and PR #4 remain unmerged. Do not start T14C/T14D/T14E.

## Current handoff — T14B-B D1 parity & shadow, 2026-09-16

- Task: T14B-B (D1 catalog parity, runtime view, shadow foundation). NOT the authority cutover.
- Repository: `vn-clo/Frigo-dev`, ID `1368281478`; start main `c1c1c14a2a7dccc883f1030d0dee7043754fb4a9`.
- Branch: `hoplite/poteidaia-c88481ca-integrate-t14b-a-current-main-t14-canonical-merge-receipt-t14b-b-d1-recipe-parity-shadow`.
  Commits: `724ed3fb` (0034 + renderer + smoke/gate), `550eef0d` (hydrator, runtime catalog,
  drift typed fields, shadow service, config gate), `a210c72f` (parity/fail-closed/planner/
  recommendation/cooking/authority tests), `330add8b` (docs/ADR-024), `0284a96c` (review fixes:
  per-isolate shadow interval bound, no description default, Inventory Truth test decoupled).
  PR #14 against `main`; exact-head hosted `validate` passed on `71e338a1` (run 104647097626);
  the rerun on `0284a96c` is recorded in the PR.
- Migration: `0034_global_recipe_catalog_parity.sql`; `0001–0033` hash drift NONE; fresh replay
  and populated-0033 upgrade (FK stub + cooked meal) pass in tests and `pnpm check:migrations`.
- Checks executed (this head): `pnpm install --frozen-lockfile`, `pnpm recipe:seed:check` (0006 +
  0034 ok), `pnpm typecheck`, `pnpm lint`, `pnpm check:migrations` (`migration-smoke=ok`),
  `pnpm build`, `pnpm test` → **157 files / 3697 tests passed**, `git diff --check` clean.
  Focused: `recipe-d1-parity` 10/10, `recipe-d1-runtime-parity` 6/6, `recipe-catalog-authority`
  5/5, `recipe-catalog-safety` 6/6. Remote schema gate not run (no credentials; not required).
- Truth: static 71 (59+12); D1 71 complete, staticOnly `[]`, d1Only `[]`, all drift `[]`;
  nutrition `legacy_compatibility`; category/region `typed_runtime_field`; media legacy compat only.
- Authority: `ALL_RECIPES` on every route/web/planner path (static guard test); shadow mode is
  opt-in, off-response, production-rejected; no `d1` mode.
- Not done / deferred: T14C media, T14D cutover, T14E bulk import; PR #4 untouched
  (`CLOSE_ARCHIVE` recommended); Deploy staging token blocker remains an OPS issue.
- Next action: maintainer review of PR #14 (ADR-024, `recipe-catalog/T14B_B_D1_PARITY_SHADOW.md`)
  with exact-head hosted `validate` green, then normal protected merge. Do not enable shadow in
  production or deploy. T14C/T14D/T14E remain separate packets.

## Current handoff — T14 integration refresh, 2026-09-15 UTC

- Task: reconcile T14A then accepted T14B-A; no redesign or T14B-B.
- Repository: `vn-clo/Frigo-dev`, ID `1368281478`; verified canonical main before
  this docs-only receipt `a165474a623a8130c9a9ed4f1df096b3ac3b3ae9`.
- Merges: T14A PR #11 → `fbd14c771070e1b5594532648d79fb60c891747d`, then
  T14B-A PR #12 → `a165474a623a8130c9a9ed4f1df096b3ac3b3ae9`. Normal protected
  flow, no history rewrite. Source PRs #7/#8 remain historical references.
- Branch: docs-only final merge receipt from both completed integrations.
- Output: historical audit retained with explicit lineage refresh; current
  production truth wins over old shared-status prose. Detailed receipt:
  `recipe-catalog/T14_INTEGRATION_REFRESH.md`.
- Production: PR #9 merge `911db7fdddcd60ea1e3f3c17b4aed3f4b922bda5`, Worker
  `20bc1f35-6ffe-4085-ba79-d54a0b53da71` recorded at 100%; PR #10 receipt
  adds docs only. No fresh deploy or production probe was performed here.
- Checks: fresh frozen install, lint, typecheck, test (**151 files / 3633 tests**),
  migration smoke, build and diff check all exit 0. All 33 migration hashes match;
  T14A application-path diff is empty. Exact T14A hosted head `e916d292` passed
  run `35034318031`. T14B-A exact head `3e393741` passed hosted run `35035112092`
  and every fresh required local gate: 154 files / 3676 tests, seed check/render,
  typecheck, lint, migration smoke, build, diff check; post-run tree empty.
- Blockers: Deploy `35035612637` staging lacks `CLOUDFLARE_API_TOKEN`; release
  succeeded, production skipped. Main CI `35035415271` passed. Do not fix secrets.
- Safety: migrations 0001–0033, static `ALL_RECIPES` authority, Inventory Truth,
  Qwen, PayOS and PR #9 headers/source remain unchanged; media deferred to T14C.
  PR #4 remains open with CLOSE_ARCHIVE recommendation, not merge.
- Architecture: accepted safety modules remain non-authoritative. Recipe ADR-023
  only renumbers the historical ADR-022 to preserve PR #9's Auth/OCR decision.
- Recipe truth: 71/59/12 runtime; fresh local D1 replay complete 59, static-only
  globals 12, d1-only/incomplete/rejected empty, supported-field drift zero;
  nutrition unsupported, not fabricated parity. Renderer containment intact.
- Next action: finish the protected docs-only receipt. Its post-merge PR comment
  records exact final main / `T14B_B_BASE_MAIN` and final CI/Deploy status (a commit
  cannot embed its own eventual merge SHA). Then use that final main for a
  separately authorized T14B-B packet. **READY_FOR_T14B_B** prerequisites only.
  **T14B-B NOT STARTED; do not create 0034 or deploy.**

# Historical handoffs — not current next-action authority

Retained verbatim below; old main/production SHAs and unfinished-task statements
describe their original checkpoints, not the current refresh above.

## Auth/OCR production hardening handoff — 2026-09-16

Branch: `codex/auth-ocr-production-fix`.

The live auth error was traced to a frontend-only credential-less Google fallback
that sent `userInfo` without an ID token; it is removed. GIS initialization now
waits for the async SDK and provides a safe retry state. A shared
`ScanProcessingState` gives the upload, fridge review and receipt review screens
visible pending stages and elapsed-time reassurance while preserving the server
status contract and review-before-confirm rule.

Checks executed: focused auth/OCR `54/54`; full Vitest `3632/3632` (151 files);
`pnpm lint`; `pnpm typecheck`; `pnpm check:migrations`; `pnpm build`; and
`git diff --check` all passed. Known test stderr is expected injected failure or
KV-degraded limiter logging; no test failed.

No deployment, remote D1 migration, secret/configuration mutation, production
KV/R2/queue mutation, PayOS change or T14 work occurred. Next action is exact
branch browser smoke and PR/hosted-CI review. Do not deploy from this branch
until those gates pass and an explicit maintainer release decision exists.

## Production rollout handoff — 2026-09-15

Production is serving canonical Worker SHA
`e6b91956484589c088e6d04a9835b3e59a2eb786` after compatibility Worker
`64ee9ed1d986a5e521598a36656e9c2f59d682ee` was deployed ahead of the remote
bridge. D1 `frigo-db` has ledger `0001`-`0033`; `pnpm schema:check:remote`
passed. Readiness returned HTTP 200 with exact canonical commit, database and
queue healthy, AI/configured, and only the known PLUS-grant warning.

Evidence: export `/tmp/frigo-prod-pre0032-20260916.sql`, SHA-256
`378c023b15c159d140162e6eb74bbf2ad584e7b699c72384379119defe6dec6a`; health,
recipes, manifest/Takosan assets and unauthenticated mutation checks passed;
full local Vitest was `3630/3630`, frozen install/lint/typecheck/build passed.
Ad-hoc Cloudflare SQL queries were denied with `SQLITE_AUTH`, so rely on the
repository-owned schema gate rather than claiming direct PRAGMA evidence.

Open follow-up: PR #4 (`release/pre0032-schema-compat`, commit `64ee9ed1`) is
still open with no hosted checks. Do not bypass branch protection; obtain CI
and maintainer review, then merge it history-preservingly so production and
canonical `main` converge. No PayOS, DNS, secret rotation, KV/R2/queue data
mutation or T14 work was performed.

## Current canonical repository handoff

- Repository: `vn-dlo/Frigo-dev` (ID `1368281478`).
- Application freeze: `5f6853d0ed11415871dca0fd31d4981d60518310`.
- Historical superseded candidate: `e34ed16777166407acf67b2c76d733d89c7d64ca`.
- Merged PR: #2, base `main`, head `canonical/5f6853d-promotion-ci`.
- Final reviewed head: `7ede92c73a41da24500746fd0eded892689d8558`.
- Final canonical main: `a5cfb14cfd5840be23eb16b26a3689f5e2d6e805`.
- Exact PR CI: run `34972891435`, `validate` PASS.
- Post-merge main CI: run `34973522150`, `validate` PASS.
- Protection: strict `validate`, admin enforcement, force-push and branch
  deletion blocked; approval count zero under the recorded waiver.

PR #2 used a history-preserving merge commit. Its tree is identical to reviewed
head `7ede92c`, and production, Qwen, T13, Takosan and application-freeze SHAs
remain ancestors of canonical `main`. Current required action is only to publish
this docs-only post-merge receipt. Do not modify application code, deploy,
migrate production, touch production resources or start T14.

Maintainer decision: external technical review is accepted for this
consolidation at final reviewed head `7ede92c73a41da24500746fd0eded892689d8558`
(P0=0, P1=0, P2=0). The GitHub-native collaborator approval may be waived by
the owner; do not fabricate or impersonate a GitHub review. All other branch
protections and exact-head CI gates remain required.

Production deployment is complete under the separate rollout receipt above.
The automatic post-merge Deploy workflow had skipped production earlier; the
operator-authorized rollout later applied the bridge migrations and deployed
the exact canonical SHA. PR #4 is the remaining canonicalization follow-up.

# Historical production integration handoff — 2026-09-15

## Historical safe-merger planning handoff — superseded as current authority

Status: **PROMOTION BRANCH PUBLISHED; PR OPEN; MERGE/RELEASE BLOCKED ON HOSTED CI, ADMIN CONTROLS AND ROLLING COMPATIBILITY**.

The decision-complete repository-promotion plan is
`docs/integration/CANONICAL_REPOSITORY_CONSOLIDATION_PLAN.md`; production
rollout sequencing remains in `docs/integration/SAFE_PRODUCTION_MERGER_PLAN.md`.
Verified access is production
`ADMIN` and Frigo-dev `WRITE`; fetched default heads remain `05423f2` and
`d1b0673`; common base is `d1b0673`. Production already contains the adapted
frontend and platform upgrades through `d270cd4`/`57c88c5` and `3f33d11`, so
their historical branch tips must not be reapplied.
Qwen source `da41686` is not in production `main`; it is 15 commits ahead and
must remain an explicit frozen merge source.

Promotion receipt: branch `canonical/5f6853d-promotion` is
`f48e830ed9cdde2214ad5b4dbd58b8bc30c06106`; archive pointer
`archive/pre-canonical-consolidation` is `d1b06732f8a80db4e77986df31ff28d9f04641fa`;
PR #1 targets `main`. Local frozen install, lint, typecheck, migration smoke,
build, Vitest `3630/3630`, D1 `92/92`, browser `60/60`, and diff check passed.
Hosted exact-head CI has not reported. Branch protection is 404 and current
account is not admin. Do not merge.

Migration audit found exactly one semantic numbering collision: production
`0023_scan_request_fingerprint.sql` (`777f4b6f...`) versus dev
`0023_inventory_truth_foundation.sql` (`1ec671af...`). Canonical resolution is
production `0001`-`0023` unchanged plus certified T08-T13 at `0024`-`0033`.
However canonical `0032` adds a trigger that rejects the current production
Worker's `is_confirmed = 1`-only confirmation update, while the integrated
Worker assumes the new columns exist. Next action is a separately reviewed
schema-capability compatibility release and pre/post-0032 rolling rehearsal,
not a production merge or migration. Release the compatibility Worker
independently from `05423f2`, then run separate Qwen/runtime, T08-T13 bridge and
Takosan brand-only trains, each from the prior deployed production head. Do not
promote current `f26003b` directly. No remote state was changed in this audit.

Executed checks: repository/API permissions; branch heads, merge-base,
ancestry and source diff counts; all-fetched-ref migration scan; bridge/source
blob comparison; scan SQL inspection; pre/post-0032 SQLite failure probes; and
`git diff --check` (PASS). Both probes exited `1` with the expected errors. No
application suite was rerun because this continuation changed docs only.

## Historical candidate remediation handoff — superseded

Status: **INDEPENDENT-REVIEW REMEDIATION COMPLETE AND COMMITTED LOCALLY**.

`WORKING_BRANCH=integration/t13-takosan-qwen`

`PRODUCTION_BASE=05423f2ad675006a4c7913e696f1979b3fcaae59`

`COMMON_BASE=d1b06732f8a80db4e77986df31ff28d9f04641fa`

`REVIEWED_CANDIDATE_SUPERSEDED=e34ed16777166407acf67b2c76d733d89c7d64ca`

`REMEDIATION_BASE_HEAD=231d1e76e0320133e047624eea2be546ff779bd6`

`REMEDIATION_COMMIT=5f6853d`

`INTEGRATION_DOCS_HEAD=c14116e3f979f90ca42ec21187c1aa55d319185b`

The integration line combines production Qwen `da41686b`, certified T13 `32ddbb4`
(review `9c3c3d3`), hardened Takosan `ff63edf`, and byte-identical T13 migrations
renumbered to `0024`-`0033`. Production migration changes `0`, bridge mismatches
`0`, unknown inventory writers/readers `0/0`. Frozen install, lint, typecheck,
migration smoke, build, full Vitest `3628/3628` (149), real local D1 `92/92` (5),
and browser `60/60` (360/390/430, serial, last) historically passed before
review. The remediation restores protected payment UI to production base,
replaces the mocked-router integration proof with real Qwen runtime composition,
retains exact missing/0/.11/.9 evidence, preserves concrete runtime errors, and
scopes Takosan tests away from payment. Auth intentionally retains certified
T13 DEC-012 guest-transfer deferral. P3-1/P3-2 remain unchanged.

Fresh remediation receipt: focused `41/41`; affected matrix first `300/302`
(two brand assertions incorrectly included payment), corrected brand `16/16`;
full Vitest `3630/3630` in 149 files; lint, typecheck, migration smoke, build and
diff check PASS; browser `60/60` at 360/390/430 PASS.
Two intermediate typecheck attempts failed on incorrect `fetch` spy annotation
forms; the final `MockInstance<typeof globalThis.fetch>` annotation passes, as
does the post-fix focused `57/57` run.

Access preflight is READY: current GitHub account has `ADMIN` on
`Tungjpstore/Frigo` and `WRITE` on `vn-dlo/Frigo-dev`; default heads remain
`05423f2`/`d1b0673`, and neither repo reports protection/rulesets. Local
`origin=Tungjpstore/yaji`, so do not use an implicit `git push origin`.

**NO HOSTED GITHUB CI STATUS FOR INTEGRATION_APPLICATION_CANDIDATE**.

Next: independently review immutable remediation SHA `5f6853d`. No PR, push,
merge, deploy, remote migration/resource
mutation, PayOS/payment work, secret/DNS change, or T14. Exact evidence and
retained setup failures are in `docs/integration/`.

# Takosan brand handoff — 2026-09-14 (independent of the T13 handoff below)

Task: user-facing brand migration Frigo → Takosan from the supplied brand kit.
Status: **TAKOSAN BRAND MIGRATION COMPLETE — READY FOR BRAND REVIEW.**
Branch `hoplite/megara-hyblaia-6b723eb2` (Hoplite broker branch; preferred name
`feat/takosan-brand-refresh` could not be published by the broker), base
`TAKOSAN_BRAND_BASE=897102b6816c22af2e6a49f29662690e3e3206e0`,
`TAKOSAN_BRAND_APPLICATION_CHECKPOINT=e37ee2808a50a7195dc90a2e7bb01be639aa186b`;
the docs-only commit containing this section is `TAKOSAN_BRAND_DOCS_HEAD`.
T13 freeze `32ddbb4`, `42e0037`, `897102b`, main `d1b0673` unchanged.

Exact checks at `e37ee28`: `git diff --check` clean; `pnpm typecheck` PASS;
`pnpm exec eslint src/web tests/unit/takosan-brand.test.tsx scripts/generate-takosan-icons.mjs`
PASS; `pnpm build` PASS; `CI=1 pnpm test` **3480 passed / 139 files**;
`CI=1 pnpm test:browser` **60 passed / 60** (4.0 m); Playwright brand QA matrix
360/390/430 × landing/onboarding/auth/home/fridge/scan/planner/profile: 0 broken
asset requests, 0 horizontal overflow. Failures: none.

Next action: brand review of `e37ee28`; then optionally delete legacy Frigo brand
assets under `public/frigo/{brand,app-icons,illustrations}`. Do not merge to main,
deploy, touch remote D1 or PayOS. Full details in
[docs/brand/TAKOSAN_MIGRATION.md](../brand/TAKOSAN_MIGRATION.md).

# Frigo AI Handoff — T13R certified, ready for independent review #2

## Current handoff — T13R certified freeze, 2026-09-14

Task: final technical certification of the fully remediated T13 candidate
(T13R-A + T13R-B), exact application freeze, detached recertification, docs.
Status: **T13 REMEDIATION CERTIFIED — READY FOR INDEPENDENT FINAL REVIEW #2.**
Repository `vn-blo/Frigo-dev` (owner renamed from `vn-co3`; ID **1368281478**
verified via public API). Branch `hoplite/delos-f0bb1d04` — this thread's only
broker-authorized branch; it fast-forwards from `origin/hoplite/medma-164548ce`
(`83248df4f97d2110527a69e92a3ebe162aa71492`, the T13R-B safe-stop docs head, which
is itself docs-only above the T13R-B candidate `7e68e3b358f73786cc02eaa7db24537df855fba5`).

**T13R_APPLICATION_FREEZE = `32ddbb4f2bb636fdcf201e9ca99c4689d3655477`**, published
via the trusted broker and fetch-verified (`origin/hoplite/delos-f0bb1d04 ==
32ddbb4`). The docs-only commit that follows this handoff is `T13R_DOCS_HEAD`; its
explicit application-path diff against the freeze must be EMPTY. Main
`d1b06732f8a80db4e77986df31ff28d9f04641fa` unchanged. Rejected freeze
`7b7bb695ee597a46cf4022a2c534e2fea374be5d` unchanged, **DO NOT RELEASE**.

Why `7e68e3b` is not the freeze: certification required two test/fixture-only
changes. `bd2f5f3` — the T13R-B openedAt fixture seeded a `FRESH_MILK` 'Sữa tươi'
row that fridge confirmation grouped browser case C into (**3 failed / 51 passed**
first full serial run); the fixture now seeds `preview-stock-cheese`. `32ddbb4` —
new `tests/e2e/t13r-a-expiry-reopen.e2e.ts` because the packet requires browser
coverage of the explicit-expiry reopen (previously jsdom-only); RED at `7b7bb69`,
GREEN 6/6. Application source, migrations, dependencies and harness config are
byte-identical to `7e68e3b` (explicit path diff EMPTY).

Exact checks — pre-freeze (development worktree, `CI=1`, Vitest before browser)
and clean detached (`git worktree add --detach /tmp/t13r-freeze 32ddbb4`, frozen
install, Node 24.19.0, pnpm 10.26.0, Playwright 1.63.0): `pnpm lint`/`pnpm
typecheck`/`pnpm build` PASS; `pnpm test` **3471/3471 in 138 files** (identical
both runs); focused T13R-A **45/5**; focused T13R-B (7 files) **171/7**; T08
**130/2**, T09 **1259/17**, T10 **98/6**, T11 **39/2**, T12 **22/3**, T13
**320/12**; real local D1 `*-d1.test.mjs` **92/5**; `pnpm check:migrations`
`migration-smoke=ok`; fresh `wrangler d1 migrations apply --local` 32 ✅, n=32,
last 0032, FK []; `pnpm schema:check:local` PASS; legacy populated replay on real
local D1 (0001–0030 → seeded legacy lines → 0031 → seeded T13 lines → 0032) all ✅,
pre-existing `scan_items` columns identical, all new 0032 columns NULL (0
fabricated), FK [], schema gate PASS; migrations **32**, 0031 blob `c580d30b…` ==
`fc0f9c5` == `7b7bb69`, 0032 blob `48f26f7c…` == `fc0f9c5`, 0033 absent; writer
audit `src`+`packages` statement set identical to `fc0f9c5`/`7b7bb69` (only two
synthetic preview seed INSERTs added in `scripts/planner-preview-fixtures.mjs`),
reader call set identical — UNKNOWN writers **0**, UNKNOWN readers **0**, T09/T11
authority preserved; `git diff --check` PASS; browser `pnpm exec playwright test`
serial and last **60 passed / 0 failed** (20 cases × 360/390/430) pre-freeze at
`32ddbb4` and detached; detached `git status --porcelain` EMPTY.

Blocker disposition: P1-1/P1-2/P1-3/P1-4, P2-1/P2-2/P2-3/P2-4/P2-5/P2-6 and the
IngredientRow `/fridge` ReferenceError all CLOSED with permanent tests re-run at
the freeze; **P0 0, P1 0, blocking P2 0**. Original AC1–AC14 **all PASS**
(numbering from `release/T13_PROPOSED_SCOPE.md`); R3/R4/R5/R6/R7/R8/R11 and
U1/U4/U6/U7/U8/U12/U13/U14 **DONE**. **NO HOSTED GITHUB CI STATUS FOR
T13R_APPLICATION_FREEZE** (0 runs / 0 checks / 0 contexts; `ci.yml` triggers on
main/PR only).

Evidence (gitignored/sandbox): `.hoplite/artifacts/t13r-cert/{,prefreeze-bd2f5f3,
prefreeze-32ddbb4}/`, `/tmp/t13r-detached-logs/` (freeze), `/tmp/t13r-detached-logs-
bd2f5f3/`, drivers `/tmp/t13r-tools/`. Full record:
[T13R_FINAL_CERTIFICATION.md](inventory-truth/t13/T13R_FINAL_CERTIFICATION.md).

Limitations: all evidence is local; hosted CI absent for the exact freeze. Browser
evidence uses the repository's isolated synthetic harness (`SCAN_QUEUE_MODE` sync);
the async queue path is proven by the real queue processor over real migrations in
Vitest, not in the browser. `.hoplite/settings.json` overlay remains uncommitted.

Safety: main merged NO; production modified/deployed NO; remote D1 NO; PayOS NO;
T14 NO; repository reconciliation NO.

Publication (verified by brokered fetch after publishing): **T13R_DOCS_HEAD =
`42e0037f92104fd5dc3c89c633d91f67fa892724`** is remote on `hoplite/delos-f0bb1d04`
(`LOCAL_HEAD == REMOTE_HEAD`); freeze `32ddbb4` is its ancestor and the explicit
application-path diff `32ddbb4..42e0037` is EMPTY. `origin/main` remains
`d1b06732…`. `hoplite/medma-164548ce` stays at `83248df…` because the broker
refuses to publish to this thread's configured base branch; it is a strict
fast-forward ancestor and a maintainer may advance it without any rewrite. The
commit recording this paragraph is a later docs-only receipt on the same branch.

Next action: **INDEPENDENT T13 FINAL REVIEW #2** of exact freeze `32ddbb4` and its
docs-only head. Nothing else is authorized.

## Historical handoff — T13R-A application checkpoint, 2026-09-13 (superseded)

Task: T13R-A data-integrity & ownership remediation of the rejected T13 freeze.
Status: **T13R-A COMPLETE — READY FOR T13R-B.** Not a final T13 freeze.
Repository: `vn-co3/Frigo-dev` (owner renamed from `vn-co2`; ID **1368281478**
verified). Branch `hoplite/oropos-eb2d4886--t13r-a-data-integrity-ownership`.
Recovered this session from the mismatched local branch `hoplite/amisos-peiraieus-
ab9b6c4c`/`hoplite/medma-164548ce` (HEAD `b9735b4`, a docs-only ancestor of the
remote head) by `git switch --track`; no reset/rebase/cherry-pick/force-push.

**T13R_A_APPLICATION_CHECKPOINT=`fc0f9c56c53ae7b17f2d1fb4770a6bc231ebc027`**
(starting checkpoint `d589342cbcef9f80487a2c269bcf6133fe0e4415`). The docs-only
commit following this handoff is `T13R_A_DOCS_HEAD`; its non-doc diff against the
application checkpoint must be empty. Main `d1b06732f8a80db4e77986df31ff28d9f04641fa`
unchanged. Rejected freeze `7b7bb695ee597a46cf4022a2c534e2fea374be5d` unchanged,
**DO NOT RELEASE**.

Implemented (one finding at a time, REPRODUCE → RED permanent test → minimal fix →
GREEN → regression): **P1-1** async queue raw evidence + nullable confidence
(`4d73365`); **P2-A/P2-B** additive migration `0032_scan_evidence_completeness.sql`
(`ocr_canonical_id/category/storage`, `reviewed_expiry_date/kind` + fail-closed
triggers), sync+async writers, `scanItemDto`, both review pages (`ac3c35e`);
**P1-2** canonical identity preserved under free-form rename (`20bc14e`);
**P1-3/P1-4** lot-keyed detail with draft-owner check and route-id-owned receipt
review (`43e95ed`); test alignment (`bb19fc0`, `fc0f9c5`). Migrations **32**;
0001–0031 byte-identical to the freeze; no backfill in 0032.

Exact checks at the checkpoint: `pnpm lint` PASS; `pnpm typecheck` PASS;
`pnpm build` PASS; `pnpm test` **3423/3423 in 137 files**; focused
`tests/{integration,unit}/t13r-a-*` **45/45 in 5 files**; real local D1 (workerd)
`*-d1.test.mjs` **92/92 in 5 files**; `bash scripts/migration-smoke.sh` ok (includes
populated 0031→0032 upgrade over legacy pending/confirmed and T13 pending/confirmed/
rejected rows, zero fabricated evidence); `wrangler d1 migrations apply frigo-db
--local` fresh 32 ✅ and legacy freeze-tree 0001–0031 + seeded rows → 0032 ✅ with
pre-existing columns byte-identical, all new columns SQL NULL, `foreign_key_check` 0;
`pnpm schema:check:local` PASS on both; `CI=1 pnpm exec playwright test`
**42 passed / 0 failed** (14 cases × 360/390/430, includes the new
`tests/e2e/t13r-a-ownership.e2e.ts`); `git diff --check` PASS.

Authority audit: inventory `INSERT/UPDATE inventory_items|inventory_lots` statement
set and T11 reader call set are identical to the freeze; the 0032 columns are read
only by `scan-evidence.ts` → `scanItemDto()`. UNKNOWN writers **0**, UNKNOWN readers
**0**. T09 write and T11 read authority preserved.

Not changed (T13R-B, still OPEN): Cloudflare fridge `vision()` confidence clamp,
inventory conflict/refetch UX, Home estimated-expiry qualifier, `openedAt === null`
→ "Chưa mở". PayOS, auth, production infra untouched. `.hoplite/settings.json`
overlay kept uncommitted.

Limitations: hosted CI was not consulted; all evidence is local. Browser evidence
uses the repository's isolated synthetic harness (SCAN_QUEUE_MODE sync); the async
path is proven by the real queue processor over real migrations in Vitest, not in
the browser.

Publication state (verified by brokered fetch after publishing): the first
T13R-A docs head `111171d373769a2037c047d678236b97c33e60d8` (application
checkpoint `fc0f9c5` + docs) is remote on **`hoplite/medma-164548ce`**, this
thread's only broker-authorized branch. Remote
`hoplite/oropos-eb2d4886--t13r-a-data-integrity-ownership` still points at the
safe-stop `d589342` because the trusted broker refuses to publish to that branch
from this thread and the sandbox has no direct Git credentials. `111171d` (and the
docs commit that records this paragraph) descend from `d589342` by fast-forward
only; a maintainer can advance the remediation branch with
`git push origin <docs-head>:hoplite/oropos-eb2d4886--t13r-a-data-integrity-ownership`
without any rewrite. Main is unchanged.

Next action: **T13R-B** on a stacked branch from this checkpoint — fix the four
deferred blockers only, red/green each, then new application freeze → independent
recertification. No merge/deploy/remote D1/PayOS/T14/repository reconciliation.
Full detail: [T13R_A_REMEDIATION.md](inventory-truth/t13/T13R_A_REMEDIATION.md).

## Historical handoff — T13R-A safe stop, 2026-09-13T15:50:34Z (superseded)

Status: **T13R-A SAFELY CHECKPOINTED — READY FOR HANDOFF** (implementation not
started). Repository `vn-co2/Frigo-dev`, ID **1368281478**. Branch
`hoplite/oropos-eb2d4886--t13r-a-data-integrity-ownership`; starting/pre-stop SHA
`b9735b441d93dfb7d7d409a47292974c8f2f1e52`. The audit commit is docs-only, descends
from docs head `4fcbc96…`, is published remotely (`hoplite/oropos-eb2d4886`,
`git ls-remote` equality verified), and is protected from amendment.

Verified before any edit: empty non-doc delta from rejected freeze `7b7bb69…`;
origin/main `d1b06732…` unchanged; migrations 31, 0031 untouched, no 0032.
Finding status: P1-1/P1-2/P1-3/P1-4/P2-A/P2-B all **NOT STARTED**;
`NO_NEW_T13R_A_CODE_COMMIT=true`. Executed: full identity gate and
`git diff --check` PASS. Not run (nothing to test): typecheck, scoped lint,
focused/full/D1/browser suites, migration replays, authority audit.

Uncommitted preserved file: `.hoplite/settings.json` (pre-existing workspace
overlay; prohibited from commit by safe-stop rules). Complete state, exact
commands and resume point:
[T13R_A_REMEDIATION.md](inventory-truth/t13/T13R_A_REMEDIATION.md).
Safety: no freeze, no main merge, no deploy, no remote D1, no PayOS, no T14, no
repository reconciliation. Next step: begin T13R-A implementation on this branch,
starting with the P1-1/P2-A evidence schema decision, one red/green finding at a
time; deferred T13R-B blockers stay open.

## Current handoff — independent final review failed, 2026-09-13

Status: **T13 INDEPENDENT FINAL REVIEW — FAIL**. No remediation was performed.
Review branch `hoplite/oropos-eb2d4886` starts at docs head
`4fcbc96b5a5d4b3cea2c2ad0bdb5682b1866891a`. The detached application freeze
`7b7bb695ee597a46cf4022a2c534e2fea374be5d` remains clean. Repository ID 1368281478
is verified under current provider name `vn-co2/Frigo-dev`; protected main and
the certified remote branch retain their required exact SHAs. Non-doc delta from
freeze to docs is empty; all 31 migration blobs retain their introducing bytes.

Fresh verification: lint/typecheck/build, **3372/132** full, **194/10** focused,
**92/5** real local D1, **36/36** browser, migration smoke, fresh local 31-migration
apply, legacy replay/upgrade, local schema and diff PASS. Existing browser suite
ran serially after source-writing tests. Hosted exact-freeze checks are absent.

Findings: **P0 0 / P1 4 / blocking P2 6 / P3 3 groups**. Independent probes
reproduced async evidence/confidence loss, U7 canonical-identity loss and cross-lot
draft submission, receipt response-ID mismatch, fabricated fridge confidence,
lost confirmed expiry, stale generic inventory conflict recovery, unqualified
Home estimates, and false unopened labels for NULL opening evidence. Raw review
field coverage and failed-refetch handling also have source evidence.

Retained diagnostic limitations: one audit input initially used the wrong version
field; its corrected focus-refetch probe remained inconclusive and is not a
finding. Home initially lacked the synthetic onboarding prerequisite; the corrected
fixture reproduced the defect. Original historical certification logs were absent;
fresh exact-freeze gates replaced, rather than authenticated, those historical runs.

Complete report, original acceptance and roadmap matrix, exact commands and
evidence: [T13_INDEPENDENT_FINAL_REVIEW.md](release/T13_INDEPENDENT_FINAL_REVIEW.md).
Only that report and required status/handoff docs changed; pre-existing
`.hoplite/settings.json` work was preserved and excluded. No PR, merge, deploy,
remote D1, PayOS application work, T14, or repository reconciliation.

Next action: **NEW T13 REMEDIATION BRANCH → confirmed blockers only → new freeze
→ independent certification**. Do not reconcile production yet. Earlier handoffs
below are historical and superseded by this failed independent review.

## Current handoff — T13 final detached certification, 2026-09-13

Task: T13B-B repository-owned browser harness → freeze → detached certification.
Status: **T13 COMPLETE — STOP for INDEPENDENT T13 FINAL REVIEW**.
Repository: `vn-ca1/Frigo-dev`, ID **1368281478**.
Main: `d1b06732f8a80db4e77986df31ff28d9f04641fa`, unchanged.
Branch: `hoplite/mende-26679a14--browser-harness-final-cert`.
Starting HEAD: `3262eaff86333da142ada1135e5a20c58ea640eb`; application fd32aa8.
Separate U7 application fix: `47b10e25d6853a9bc4f9dfcf2e83bc01ba330bf2`.
**T13B_APPLICATION_FREEZE: `7b7bb695ee597a46cf4022a2c534e2fea374be5d`**,
published/fetched equal. Final docs publication follows separately and must have
an empty non-doc delta; its exact SHA is recorded after commit creation.

Changed: Playwright 1.63/Chromium isolated harness, mobile A–I/U7/reconciliation
tests, test-only fixture controls and privacy-safe failure artifacts. A real
browser negative test identified missing U7 existing-lot metadata fields; the
separate fix adds name/unit/category to expiry/storage through existing T09 adapters.
No prior scan hardening, inventory architecture, production configuration or schema
was redesigned. HTML report output was removed after synthetic leakage proof.

Executed: full pre-freeze **3372/132**, detached **3372/132**; browser before and
after freeze **36/36** at all three widths. Detached T08 **130/2**, T09 **1259/17**,
T10 **98/6**, T11 **39/2**, T12 **22/3**, T13/T13B **271/12**; 10-file focused
**194/194** including hardening 26 and CLI 26. Real local workerd/D1 **92/5**.
Lint/typecheck/build/migration smoke/fresh local D1/legacy replay/schema/diff PASS;
new detached checkout `/tmp/frigo-t13b-detached-cert` remains clean. Writer/reader
UNKNOWN 0/0, 31 migrations, unchanged 0031, no 0032. Original AC1–AC14 PASS and all
required roadmap rows DONE. Scoped P0/P1/blocking P2/P3: 0.

Failures: first concurrent detached browser 35/36 (H document marker lost on Vite
reload from existing generator test); same freeze passed all 36 serially afterward.
No frozen file or assertion was changed. Reproduce browser only after source-writing
checks finish. Complete chronology and exact commands:
[T13B_FINAL_HARDENING.md](inventory-truth/t13/T13B_FINAL_HARDENING.md).
Hosted: **NO HOSTED GITHUB CI STATUS FOR T13B_APPLICATION_FREEZE**.

Next action: independent final review of the frozen tree, original AC matrix,
roadmap closure and docs-only delta. Do not implement further work, merge main,
deploy, access remote D1, touch PayOS, start T14, or reconcile repositories.
Earlier handoffs below are historical and superseded by this section.

## Current handoff — fresh-session Preview safe-stop, 2026-09-13

Task: resume T13B-B browser/final-certification WIP only; do not begin T14 or integration.
Status: **T13 NOT COMPLETE — BROWSER VERIFICATION BLOCKED**; no application defect was
found or reopened.
Repository: `vn-ca1/Frigo-dev`, ID **1368281478**. Main:
`d1b06732f8a80db4e77986df31ff28d9f04641fa` (unchanged).
Branch/start: fresh thread branch `hoplite/mende-26679a14` and prior continuation
`hoplite/kos-9d39545d--t13b-b-final-certification` both started at
`a9b5904aeba0fc7e4d649165770a4e86701312a2`; initial status/diff empty.
Lineage: verified `2334a6f -> c37a9b8 -> f845d04 -> fd32aa8 -> a9b5904`, with the
`fd32aa8..a9b5904` non-doc diff empty.
Preview: effective run `node scripts/security-preview.mjs`. Three schema-valid calls
(`preview`, 120 seconds, promotion `preview:3000`) all failed before startup:
`Preview port must be a currently discovered HTTP listener owned by the managed preview run`.
Port 3000 is the harness default, but no harness listener was running; only browser
processes were listening. No settings/script change, ad-hoc server, or workaround.
Checks: workspace setup reported ready with no configured setup run. No fresh
focused/full/type/lint/build/D1/migration-replay/schema/authority checks ran; 176/9 and
26 hardening/adoption results are historical only. `CURRENT_FULL_TEST_COUNT` and
`CURRENT_FULL_FILE_COUNT` are not established. Migration integrity passed (31,
unchanged 0031, no 0032); `git diff --check` passed. Platform fault report recorded.
Not run: flows A–I, 360/390/430 checks, and real viewport-emulation capability.
Next: repair the supported managed Preview interface and resume every mandatory WIP
flow before measuring the baseline, closing AC/roadmap evidence, freezing, and clean
certification. No `T13B_APPLICATION_FREEZE` or `T13B_DOCS_HEAD`; no merge, deploy,
remote D1, PayOS, or T14 work.

## Current handoff — confirmed UX checkpoint, 2026-09-13 12:40 UTC

Task: finish T13B-B, not T14/integration/deployment.
Status: **T13 NOT COMPLETE — BROWSER VERIFICATION BLOCKED**, owner stop rule applied.
Identity: fresh verification of `vn-ca1/Frigo-dev`, ID 1368281478, historical redirect,
guarded main, old WIP branch, 2334a6f -> c37a9b8 -> f845d04 ancestry/docs-only delta.
Branch: `hoplite/kos-9d39545d--t13b-b-final-certification`, created at exact f845d04.
Published WIP: `fd32aa8deaee7df454245591015780c59f909352`, not application freeze.
Change: completed/read-only confirmed scan wording and `Xem tủ lạnh`; no confirmation
CTA/manual addition. All persisted controls disabled and previous 23 regressions retained.
Checks: 176/176 (9 files), hardening 26/26, operator 26/26, typecheck/scoped lint/diff PASS.
Failure: one fresh supported-schema Preview attempt still requires a pre-discovered
managed listener; reported platform fault. Only browser listeners exist, no isolated app.
No unsupported workaround/settings commit. Browser/mobile and final gates remain unrun.
Next: follow latest `inventory-truth/t13/T13B_B_WIP_HANDOFF.md`; unblock Preview,
verify flows A–I and widths, measure actual current full suite (not 3177/124), close
original AC/roadmap/source audit and independent diff review, then freeze/certify.
No final application/docs SHA assigned; old WIP/main preserved; no merge/deploy/remote D1/PayOS.

## Current authoritative handoff — T13B-B hardened WIP, 2026-09-13

Program: Inventory Truth Layer / T13B-B final hardening after recovery
Status: **BLOCKED_FINAL_VERIFICATION — T13 NOT COMPLETE**
Repository: `vn-ca1/Frigo-dev`, ID **1368281478**; historical `Tungjpstore/Frigo-dev`
transfer/redirect verified against that ID.
Starting WIP: `2334a6f41cf68d42ae1eba7a30440b8fe324eb31`; all specified main/rescue/
quota-WIP refs and `c31567e` ancestry passed before editing.
Branch: `hoplite/kos-9d39545d--t13b-b-final-hardening`
Published/fetched WIP: `c37a9b8d7afc66507052bbc8f1e8a24fdc896e8d`, **not a freeze**.
Changed: route-authoritative ScanResultPage, fenced polling/confirm/refetch, safe
domain errors, store-retained terminal review status, 23 permanent regressions.
Checks: final focused 173/173 (9 files), preserved backend 1122/1122 (17 files),
typecheck, scoped lint, CLI syntax and diff check PASS. Red/green diagnostic:
5 targeted cases fail against recovered WIP, all pass on continuation.
Failures resolved: missing node_modules; two incorrect test DTO TS2345 errors;
duplicate discovery of an initially nested diagnostic worktree (moved outside).
Remaining blocker: mandatory `preview_start` promotion schema rejects first startup;
reported to platform. Effective run override selects the existing isolated harness;
pre-existing settings overlay stays uncommitted. No browser/mobile proof or final
freeze/full-suite/real-D1/migration/schema/build certification was fabricated.
Migration/authority: 31 unchanged, no 0032; writer/reader UNKNOWN 0/0. Historical
`69b0dc6` is not an ancestor, but all five Part A docs were retained; no history rewrite.
Next: follow `inventory-truth/t13/T13B_B_WIP_HANDOFF.md` to unblock Preview, finish
original AC1–AC14/roadmap evidence, freeze, run clean detached gates, publish docs-only
head, then independent T13 final review. Main unchanged; no merge/deploy/remote D1/PayOS.

## Current authoritative handoff — T13B-B stopped by owner, 2026-09-13

**Quota-safe WIP; not final certification.** Read
[T13B_B_WIP_HANDOFF.md](inventory-truth/t13/T13B_B_WIP_HANDOFF.md) first.
It records the actual application-checkpoint base versus the owner's expected docs
base, all implementation/test changes, 109 passing focused tests, partial browser
evidence and the interrupted review. After initial access failures, WIP
`a8cefd13505bc6b45dd11f45a6323539deb60f93` was published/fetched with exact equality;
main was reverified unchanged. Fresh public numeric metadata still returns 404.
Preserve the checkpoint and wait for explicit permission before resuming work;
reverify identity and the documented base discrepancy first. No settings edits or
main merge. The safe-stop report records the final documentation-follow-up SHA.

## Current authoritative handoff — T13B-A backend continuation, 2026-09-13

Program: Inventory Truth Layer — T13B split continuation
Task: T13B-A BACKEND TRUTH HARDENING (Part A only)
Status: **T13B-A COMPLETE — READY FOR T13B-B**; no final T13 certification
Repository: vn-2l/frigo-dev; verified numeric ID 1364064929
Branch: hoplite/megara-hyblaia-888f1514 (platform-generated equivalent)
Base: 3458c6cb971f5d96fce8eda3abc3d708437ce713; verified HEAD before edits
origin/main: d1b06732f8a80db4e77986df31ff28d9f04641fa; unchanged, no merge/rebase
T13B_A_CHECKPOINT: c31567ec7dfa8f95808c20c834b327cbb3425f9c
Publication: application/test checkpoint pushed without force, fetched, local/remote equality PASS
Documentation: separate descendant commit; continue from final published branch HEAD
Primary handoff: docs/ai/inventory-truth/t13/T13B_A_HANDOFF.md
Decision: docs/ai/inventory-truth/DECISIONS.md, DEC-016

Actual changes: per-line T09 CREATE for adopted receipt purchases preserves old lot
and new purchase truth; fridge grouped CORRECT unchanged. Validated `scanEvidence`
is in existing receipt/event fingerprints, not a new ledger/event-envelope key.
Production `correctionOf()` use; T10 rawName from retained OCR, null when absent,
with actual subject identity. Atomic confirmation retained. Committed concurrent
twins/response loss recover through scoped status-based replay and strict T11 reads.

Executed checks: `pnpm install --frozen-lockfile`; focused Vitest **1,122/1,122
(17 suites)**; real local workerd/D1 **92/92 (5 suites)**; `pnpm typecheck`;
scoped ESLint (all six changed application/test files); `git diff --check`;
scope/ancestry/migration comparisons. All PASS. Exact commands in primary handoff.
Negative control: four new regression tests fail as expected at exact base; removed
the temporary worktree. Migration count 31; 0001–0031 untouched; 0032 absent.
Focused writer UNKNOWN = 0; canonical reader UNKNOWN = 0; no new stock SQL/readers.

Failures resolved: typed OCR/expiry mapping; incompatible top-level event metadata
(0025 guard, replaced by existing fingerprint extension); test helper binding and
storage-path assertions; intermittent D1 concurrent replay 500 (91/92 before fix,
92/92 after). No known failing Part A backend gate remains. Setup tool state issue
reported; direct locked dependency install worked without changing configuration.

NOT RUN — DEFERRED TO T13B-B FINAL VERIFICATION: full application suite/full lint/
build, dedicated migration smoke/schema/upgrade matrix, browser/mobile/UX checks,
adoption workflow, final T13 acceptance matrix/certification. No hosted CI requested.
Next action: verify repository/main guards and checkpoint ancestry, read the primary
handoff, complete Part B frontend/adoption scope and final verification. Do not
restart from main, rewrite prior T13, mutate migrations, merge or deploy.

## Current authoritative handoff — T13 Receipt/Vision Truth & Inventory UX V2, 2026-09-13

Program: Inventory Truth Layer — T08-T12 release train + T13 (final roadmap task)
Task: T13 RECEIPT/VISION TRUTH & INVENTORY UX V2 — implementation
Status: **T13 COMPLETE on branch; main NOT merged, nothing deployed**
Repository: vn-2i/frigo-dev (repository ID 1364064929 is ground truth; owner names redirect)
Branch: hoplite/lindos-0368e413
Base: exact 578f705f12cfde6e5ebe65bdc574154a0670c8df (ROADMAP_AUDIT_HEAD)
origin/main: d1b06732f8a80db4e77986df31ff28d9f04641fa (NOT advanced)
T13_APPLICATION_FREEZE: ad342703fb31a2b97d2798f1161fb83d4d0ed090
Primary documents: docs/ai/inventory-truth/t13/{README,RECEIPT_VISION_TRUTH,UX_V2,AUTHORITY_MAP,TEST_MATRIX,CONTINUATION}.md

Design: **evidence is not authority.** OCR/vision -> user review -> T10 observation ->
T09 command -> lots. T13 adds exactly ONE new write statement (a guarded INSERT into
inventory_observations riding the existing atomic batch) and ZERO new writers to
inventory_lots / inventory_items / inventory_events, and ZERO new inventory_items readers.
Writer and reader audits: UNKNOWN = 0.

Migration: 0031_scan_evidence_retention.sql, additive only. Adds ocr_raw_name, ocr_quantity,
ocr_unit, ocr_confidence (nullable: the legacy confidence column is NOT NULL DEFAULT 0.9 and
cannot represent "unknown") and review_state to scan_items, coupled to is_confirmed by
insert/update triggers rather than a column CHECK (ALTER TABLE ... ADD COLUMN ... CHECK is
evaluated against pre-existing rows and would fail on already-confirmed rows). Migrations
0001-0030 untouched.

Executed checks (clean detached worktree /tmp/t13-freeze @ ad34270, pnpm install
--frozen-lockfile, status empty): full suite **3,177/3,177 across 124 files** (218.25 s);
real D1 **81/81** (5 files); lint PASS; typecheck PASS; build PASS; check:migrations PASS
(migration-smoke=ok); schema:check:local PASS (after `wrangler d1 migrations apply
frigo-db --local` provisions the gitignored local D1 in a fresh worktree — the gate reads
existing local state and does not create it); git diff --check PASS; git status --porcelain
empty. Baseline before T13: 3,092/120 and 70 real-D1.

Browser verification (isolated preview only; no remote D1, no deployment): flows A (receipt
-> review -> confirm -> RECEIPT provenance + real purchasedAt), C (MOVE), D (stale edit ->
409 CONFLICT with prior state preserved), D' (expiry UNKNOWN -> ESTIMATED -> UNKNOWN and
UNKNOWN -> KNOWN) and E (observation -> dismiss -> RECONCILED with stock untouched) all
verified. **7 defects that the green test suite had not caught were found this way** and are
fixed with permanent regression tests; the worst was a truncation-induced lot-id collision
that made every line of one receipt share a single lot id.

Failures: none outstanding.
Known verification limits: viewport emulation was unavailable in this sandbox (set viewport
and set device both left innerWidth at 1440), so the 360/390/430 check is a computed
layout-overflow probe (0 offenders) rather than a visual check; the reconciliation accept
(CORRECT/MOVE) path was exercised through tests and the API but not through a UI click,
because the seeded preview data yields STALE_OBSERVATION verdicts with no safe proposal
(which correctly disables the button). No hosted GitHub CI status exists for this SHA.

Next action: owner review of this branch. Do NOT merge main, deploy, run remote D1, touch
PayOS, rewrite migrations 0001-0030, add a second inventory writer, or enable
MEAL_PLANNER_ENABLED / cutover flags.

## Current authoritative handoff — Roadmap reconciliation / gap audit, 2026-09-12

Program: Inventory Truth Layer — T08–T12 release train, post-certification roadmap audit
Task: ROADMAP RECONCILIATION / GAP AUDIT (original T11 Receipt/Vision Truth + Inventory UX V2 vs RC 64c5501) — audit only
Status: AUDIT_COMPLETE — verdict **T13 REQUIRED**; main NOT merged
Repository: vn-2g/frigo-dev (repository ID 1364064929; earlier owner names redirect)
Audit branch: hoplite/delphoi-499ad774 (requested logical name hoplite/inventory-truth-roadmap-reconciliation)
Base: exact 1cae11ee2e5acdc1d6c76266ad72b3ef744d7797 (re-certification docs HEAD) · Application RC: 64c5501ab0110658718b3752bd84e537f0854e12 (unchanged)
origin/main: d1b06732f8a80db4e77986df31ff28d9f04641fa (NOT advanced)
ROADMAP_AUDIT_HEAD: 3fce917ad6e079f76cf3bdd55e354ce0e35054bf (audit docs commit; verified: descends from 1cae11e,
    `git diff 64c5501 3fce917 -- . ':(exclude)docs'` empty). This SHA-recording commit follows it on the same branch.
Primary documents: docs/ai/release/INVENTORY_TRUTH_ROADMAP_RECONCILIATION.md (sources S1–S12, matrix R1–R12 / U1–U17,
    pipeline trace, materiality) and docs/ai/release/T13_PROPOSED_SCOPE.md (definition only; starting SHA = ROADMAP_AUDIT_HEAD).
Executed checks (clean detached worktree /tmp/frigo-rc @ 64c5501, status empty): pnpm install --frozen-lockfile (lockfile
    unchanged); pnpm exec vitest run tests/unit/receipt-scan.test.ts tests/unit/scans.test.ts tests/unit/scan-privacy.test.tsx
    tests/integration/scan-response-loss.test.ts tests/integration/inventory-adoption.test.ts → 55/55 (5 files, 5.37 s);
    temporary uncommitted probe tests/__audit_probe__ → 4/4 (receipt lot source_type='SCAN', purchased_at/money NULL,
    expiry_kind='KNOWN' from shelf-life default, observations 0, OCR raw overwritten on correction, altered re-confirm →
    200 idempotentReplay, cross-tenant 404/404), then deleted. Full 3,092 suite NOT rerun (no application change).
Failures: none. Release-safety findings: P0/P1/P2 none; P3 — inferred expiry as KNOWN (R6/U6), CF provider fabricated
    defaults (R5), FINAL_WRITER_MAP scan changed-payload wording (R9), pre-existing outbox permanent-409 block (U15).
Next action: owner decision — (a) authorize T13 from ROADMAP_AUDIT_HEAD per T13_PROPOSED_SCOPE.md, and/or (b) a separate
    explicit main-integration review for 64c5501 (technical certification stands; this audit does NOT declare final merge
    readiness). Do NOT implement T13, merge main, deploy, run remote D1, touch PayOS, rewrite migrations, enable
    MEAL_PLANNER_ENABLED, or commit the workspace overlay from this packet.

## Current authoritative handoff — Independent final re-certification, 2026-09-12

Program: Inventory Truth Layer — T08–T12 release train + D3/D1/D2 remediation
Task: Independent final re-certification (audit only)
Status: RECERTIFICATION_COMPLETE — RC 64c5501 TECHNICALLY CERTIFIED; main NOT merged
Repository: vn-2f/frigo-dev (repository ID 1364064929; `vb-2f` redirects)
Review branch: hoplite/akraiphia-akraiphnion-a03445c7--inventory-truth-final-recertification (base bc1532e; suggested name hoplite/inventory-truth-final-recertification)
Application RC: 64c5501ab0110658718b3752bd84e537f0854e12 · Docs HEAD reviewed: bc1532ea406525dc7fa9e59c58d320fd525774d8
origin/main: d1b06732f8a80db4e77986df31ff28d9f04641fa (unchanged)
Executed checks (clean detached /tmp/hoplite/rc2 @ 64c5501): pnpm install --frozen-lockfile (Node v24.19.0, pnpm 10.26.0,
    lockfile unchanged); pnpm test 3,092/3,092 · 120 files · 196.29 s; D3 32/32; auth regression selection 143/143;
    T09 654/654; T10 98/98; T11 39/39; T12 22/22; T08 430/430; real D1 70/70; pnpm lint/typecheck/build PASS;
    pnpm check:migrations ok (30); local D1 apply + pnpm schema:check:local PASS; git diff --check clean;
    git status --porcelain empty. Fresh real-D1 replay 0001→0030 (30/30, 200 objects identical to d156001) and
    legacy-upgrade replay (0001–0022 + legacy rows → 0023–0030) PASS. Negative control: 3/6 UI tests fail on the
    pre-fix AuthPage (4/6 with all three pre-fix client files). Browser reproduction at 64c5501 PASS.
Failures: none. Findings: P0/P1/P2 none; P3 N1 (pre-existing raw error text for generic auth errors), N2 maintainability note.
Next action: ROADMAP RECONCILIATION / GAP AUDIT of 64c5501 (separate task). Do NOT merge main from this certification alone.
Do NOT deploy, run remote D1, touch PayOS, rewrite migrations, enable MEAL_PLANNER_ENABLED, or commit the workspace overlay.

## Current authoritative handoff — Final RC targeted remediation, 2026-09-12

Program: Inventory Truth Layer — T08–T12 release train
Task: Targeted remediation of review defects D3 (P1), D1 (P2), D2 (P2)
Status: REMEDIATION_COMPLETE — D3 closed, D1 closed, D2 documented; ready for re-certification
Repository: vn-2f/frigo-dev (repository ID 1364064929; `vb-2f` redirects)
Branch: hoplite/akraiphia-akraiphnion-a03445c7--inventory-truth-final-remediation (published; requested name hoplite/inventory-truth-final-remediation) — base 32b6ec1 → 5cb4caa → d156001; main d1b0673 unchanged
NEW_APPLICATION_FREEZE: 64c5501ab0110658718b3752bd84e537f0854e12
Docs HEAD: docs-only commit on top; exact SHA in the final report
Application delta vs d156001: .hoplite/settings.json (A, main blob 3818a00), src/web/pages/AuthPage.tsx,
    src/web/services/auth.ts, src/web/services/http.ts, tests/integration/inventory-guest-transfer.test.ts (+1),
    tests/unit/auth-guest-transfer-deferred.test.tsx (new, 6). No server, migration, dependency or config change.
Executed checks (clean detached /tmp/hoplite/remed-clean @ 64c5501): pnpm install --frozen-lockfile (Node v24.19.0,
    pnpm 10.26.0, lockfile unchanged); pnpm test 3,092/3,092 · 120 files · 191.47 s; D3 suites 32/32; real D1 70/70;
    T09 654/654; T10 98/98; T11 39/39; T12 22/22; pnpm lint/typecheck/build PASS; pnpm check:migrations ok (30);
    wrangler d1 migrations apply --local + pnpm schema:check:local PASS; git diff --check clean; git status --porcelain empty.
    Browser: guest → register → deferral notice → “Tiếp tục không chuyển dữ liệu khách” → account session (isolated preview).
Failures: none. Negative control: new UI suite fails 3/6 against the pre-fix AuthPage.
Next action: independent re-certification of 64c5501 (repeat the §11 clean-checkout gates and the D3 browser check);
    then main integration is a separate, explicitly authorized step. Follow-up MEAL_PLANNER_AUTHORITY_CUTOVER before
    enabling MEAL_PLANNER_ENABLED for adopted households.
Do NOT merge main, deploy, run remote D1, touch PayOS, rewrite migrations, enable MEAL_PLANNER_ENABLED, or commit the workspace overlay.

## Current authoritative handoff — Final Release Integration Review, 2026-09-12

Program: Inventory Truth Layer — T08–T12 release train
Task: Final independent integration review / release-candidate certification
Status: REVIEW_COMPLETE — verdict RELEASE CANDIDATE NOT READY (D3 P1, D1 P2, D2 P2; no P0)
Repository: vn-2f/frigo-dev (repository ID 1364064929; packet name vb-2f redirects)
Review HEAD: 5cb4caa0d5b3c86b00954d77cd40b16027c21df1 (T12 docs); RC: d15600186c3e73faba011eb690ac6cd70e8d3d2d
origin/main: d1b06732f8a80db4e77986df31ff28d9f04641fa (unchanged; RC 54 ahead / 0 behind)
Deliverables: docs/ai/release/INVENTORY_TRUTH_RELEASE_CERTIFICATION.md,
    INVENTORY_TRUTH_ANCESTRY.md, INVENTORY_TRUTH_CHANGE_MANIFEST.md (docs only; no app code touched)
Executed checks (clean detached /tmp/hoplite/rc-app @ d156001): pnpm install --frozen-lockfile
    (Node v24.19.0, pnpm 10.26.0, lockfile unchanged); pnpm test 3,085/3,085 · 119 files · 199.68 s;
    T09 654/654 (10 suites) and 1,432/1,432 (22 suites); T10 98/98; T11 39/39; T12 22/22;
    real D1 70/70 (44+7+11+8); pnpm lint/typecheck/build PASS; pnpm check:migrations ok;
    wrangler d1 migrations apply --local 30/30 on fresh + pnpm schema:check:local PASS;
    fresh sqlite3 0001→0030 PASS; legacy-upgrade simulation on sqlite3 and real local D1 PASS;
    git diff --check clean; git status --porcelain empty (ignored dist/, node_modules/, .wrangler/ only).
Failures: none in gates. Defects found by review (not fixed here, per packet rules):
    D3 P1 guest→register 409 INVENTORY_TRANSFER_DEFERRED dead-end in web UI (reproduced via curl
    and browser on scripts/security-preview.mjs); D1 P2 .hoplite/settings.json deleted at 4553b8a;
    D2 P2 meal-planning-snapshot.ts reader undocumented (SAFE_DEFERRED, flag unbound in wrangler.jsonc).
Next action: targeted successor on the T12 branch — (1) AuthPage handles INVENTORY_TRANSFER_DEFERRED
    with an explicit retry without migrateFromHouseholdId + test; (2) git checkout d1b0673 --
    .hoplite/settings.json and commit that blob only; (3) update t11/READ_CONSUMER_MAP.md and
    t12/FINAL_AUTHORITY_MAP.md for D2. Then re-run §11 gates and the D3 browser check on the new SHA.
Do NOT merge main, deploy, run remote D1, touch PayOS, rewrite migrations, or edit the workspace overlay.

## Current authoritative handoff — T12 runtime verification fix, 2026-09-12

Program: Inventory Truth Layer — T08–T12 release train
Task: T12 final targeted hardening fix (review findings P1 + 2×P2)
Status: T12_COMPLETE (verified); awaiting separate Final Release Integration Review
Repository: vb-2f/frigo-dev (repository ID 1364064929)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation-t11-inventory-read-authority-t12-inventory-closed-loop
Starting docs HEAD: 24668c20dfaac094aff0f84e0d59c1f0a333fbf8
Previous application freeze (superseded): 22f675d1cca76d05c93ebb2ed40bbaea11a72238
NEW T12 application freeze: d15600186c3e73faba011eb690ac6cd70e8d3d2d
Docs HEAD: docs-only commit on top; exact SHA in the final report
P1: tests/integration/inventory-closed-loop-d1.test.mjs — 8 real workerd/D1 cases
    (A accept exactly-once/replay/conflict, B DISMISS, C read→USE→read, D FEFO,
    E drift, F retry, G tenancy, H reconciliation-vs-manual STALE_SNAPSHOT).
    Real D1 62 → 70.
P2: tests/integration/inventory-closed-loop-routes.test.ts — real Hono routes
    POST /week/plans/:id/shopping/complete, POST /recipes/:id/cook/complete,
    GET /inventory (adopted; stale KV injected; replay/conflict/tenancy/no legacy batch).
P2: race regression requires LotCommandError STALE_SNAPSHOT; no receipt/commands/
    events/projection damage for the loser (integration + real D1).
Route fix: completeAdoptedCooking replays durable cooked_meals receipt before
    re-planning (response-loss retry regression found by the route proof).
Verification: baseline 3,072/117 · 62 real D1 → freeze 3,085/119 · 70 real D1;
    all gates PASS; clean detached exact-SHA checkout with EMPTY status. Migrations 30.
UNKNOWN production readers/writers = 0. Remaining P0/P1: NONE.
Next: Final Release Integration Review (separate; NOT started here). Do NOT deploy,
    run remote D1, touch PayOS, or merge main from this thread.

## Historical handoff — first T12 freeze (superseded)

Program: Inventory Truth Layer — **T08–T12 release train COMPLETE**
Task: T12 — closed-loop inventory integration & hardening (final train task)
Status: T12_COMPLETE; train ready for separate main integration
Repository: vb-2f/frigo-dev (repository ID 1364064929)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation-t11-inventory-read-authority-t12-inventory-closed-loop
Base: T11 docs HEAD 847b0363… via train merge 14c02f8 (main d1b0673 untouched)
T12 application freeze: 22f675d1cca76d05c93ebb2ed40bbaea11a72238
Docs HEAD: docs-only commit on top; exact SHA in the final report
Closed loop: observation → reconciliation → T09 → lots → T11 → consumers,
proven by tests/integration/inventory-closed-loop.test.ts (9 tests: E2E
reconciliation exactly-once + replay + IDEMPOTENCY_CONFLICT; DISMISS inert;
recipe 500g-vs-5kg-tamper then 300g after USE; planner regeneration; shopping
idempotent retry; atomic FEFO poststate; tamper-proof notifications;
reconciliation-vs-manual single-winner race; drift matrix).
Display aliases: agreement-gated (tampered projection → canonical presentation).
Authority maps: docs/ai/inventory-truth/t12/FINAL_AUTHORITY_MAP.md and
FINAL_WRITER_MAP.md — UNKNOWN production readers/writers = 0.
Verification: baseline 3,063/116 · 62 real D1 → freeze 3,072/117 · 62 real D1;
lint/typecheck/build/30-migration smoke/schema PASS; clean detached exact-SHA
checkout repeats all with EMPTY status. No migration. Remaining P0/P1: NONE.
Next: independent review of the train; main integration happens separately.
Do NOT deploy, run remote D1, touch PayOS, or start a post-T12 task.

## Historical handoff — T11 hardening (superseded by T12)

Program: Inventory Truth Layer
Task: T11 — final targeted hardening fix (findings A–F)
Status: COMPLETE; T11_READY_FOR_INDEPENDENT_REVIEW
Repository: vb-2f/frigo-dev (repository ID 1364064929)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation-t11-inventory-read-authority
Starting docs HEAD: e64ee7749d3110ecc7b1eb08216062fc404918d5
Previous application freeze (superseded): 657201f3a12f18dd96cc96adeac0dd1d3b75e6f4
NEW T11 application freeze: c15c9a81fc4367b3506a7e2693798ebe1424b0a9
Docs HEAD: docs-only commit on top; exact SHA in the final report
Published by direct commit publication (no PR tooling; overlay preserved
byte-for-byte uncommitted, SHA-256 6d8f5b45…). PR #3 left untouched.
A: real workerd/D1 T11 suite (11) via /read, /funnel, /read-race — real D1 62/62.
B: adopted-but-empty → native, [], no legacy/KV/auto-adoption (integration, real D1, HTTP).
C: READ vs MOVE/DISCARD/FEFO barrier tests (both harnesses); matrix complete.
D: readInventorySummary.activeCount = filtered length.
E: displayQuantity — retained kg/l alias only when label present + exact round trip;
   authority canonical; projection quantity never consulted; families never cross.
F: computeReadFreshness(expiry, state, now) deterministic; invalid → CORRUPT_LOT_ROW.
Verification: baseline 3,041/115 · 51 real D1 → freeze 3,063/116 · 62 real D1; all gates
PASS; clean detached exact-SHA checkout repeats all with EMPTY status. Migrations 30.
Remaining P0/P1: NONE. Merge-blocking P2: NONE.
Next: independent review. Do NOT merge main, deploy, run remote D1, touch PayOS, or start T12.

## Historical handoff — first T11 freeze (superseded)

Program: Inventory Truth Layer
Task: T11 — Inventory Read Authority & Projection Cutover
Status: COMPLETE; T11_READY_FOR_INDEPENDENT_REVIEW (PR #3, base = release train, main NOT a target)
Repository: vb-2f/frigo-dev (repository ID 1364064929)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation-t11-inventory-read-authority
T11 base: train merge 30ce4ea (contains exact T10 docs HEAD c71692a)
T11 application freeze: 657201f3a12f18dd96cc96adeac0dd1d3b75e6f4
Docs HEAD: docs-only commit on the branch; exact SHA in the final report
Platform overlay auto-commit c7e2296 corrected by 4553b8a (workspace file preserved byte-for-byte, uncommitted).
Canonical answer: adopted households read inventory_lots + validated authority
metadata via readInventoryAuthority/readInventoryLot/readInventorySummary;
inventory_items is checked-for-parity compatibility, never a fallback; reads
are single-batch coherent snapshots, bounded (1000), deterministic, tenancy-
fenced, fail-closed on corruption; observations/events never decide truth.
Cutover: fetchHouseholdInventoryFromDb (GET /inventory, recipes, scans list
reads, weekly planner, notifications) + adoption gate; legacy-only raw reads
documented INTENTIONAL_LEGACY_READ. API ids/version semantics preserved
additively (READ_CONSUMER_MAP.md §identity).
Verification: baseline 3,024/3,024 · 114 files on the base tree; freeze full
3,041/3,041 · 115 files; real D1 51/51; lint/typecheck/build/30-migration
smoke/local schema/diff PASS; clean detached exact-SHA checkout repeats all
with EMPTY status. No migration (0023–0030 untouched).
Note: the T11 packet arrived truncated mid-§32; visible §0–31 + the §32
adoption gate were implemented; train conventions used for completion.
Next: independent review of PR #3. Do NOT merge main, deploy, run remote D1,
touch PayOS, or start T12.

## Historical handoff — T10 observation claim fence (superseded)

Program: Inventory Truth Layer
Task: T10 — P1 concurrency/integrity fix: atomically fence competing reconciliation decisions
Status: P1_REPRODUCED_FIXED_AND_FULLY_VERIFIED; T10_PASS_READY_FOR_INDEPENDENT_REVIEW
Repository: vb-2f/frigo-dev (repository ID 1364064929)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation
Starting reviewed HEAD: bf86efb40e4eb13120a34679225aa24881a356b4
Previous application freeze (superseded): 4c414fa7eb33329ee12936c0899644af67e48f07
NEW T10 application freeze: 7393edcd4fb9cc8bb4df2a06628fb5dc57f8607b
Docs HEAD: docs-only commit on top of the freeze; exact SHA in the final report
T09 ancestors intact (docs d522769…, application bf391c5…). Main d1b0673… NOT merged.
Root cause: the decision batch ended with `UPDATE inventory_observations … WHERE status='OPEN'
AND version=?`; a zero-row match is a silent D1 success (proven: success=true, changes=0), so the
batch never proved the claim. Losers were only stopped by the 0030 receipt trigger (raw SQLite
error leaked); without that trigger two DISMISS decisions both committed.
Fix: `observationClaimGuard` — last batch statement, INSERT INTO inventory_events with NULL
inventory_item_id WHERE changes() <> 1 → NOT NULL abort → D1 rolls back the entire batch (T09
commands, events, projection, decision receipt, observation). Loser classification:
committed same-key exact twin → replay; altered → IDEMPOTENCY_CONFLICT; observation not OPEN at
expected version → OBSERVATION_VERSION_CONFLICT; T09 CAS → STALE_SNAPSHOT/STALE_VERSION; else
PERSISTENCE_FAILED. Pre-batch exact replay still precedes OPEN/version rejection. No
process-local locks; the mechanism is D1's own atomic batch + changes().
Regressions: fence suite 13 (all fail pre-fix); real-D1 zero-row proof + controlled workerd race.
Verification: full 3,024/3,024 (114 files); T10 focused 98/98; T09 focused 323/323; real D1
51/51; lint/typecheck/build/30-migration smoke/local schema/diff PASS; clean detached exact-SHA
checkout repeats everything with EMPTY status. No GitHub CI configured for the branch.
Preserved: multi-field composition (≤1 CORRECT + ≤1 MOVE, same lot/version, boundary
fail-closed, CORRECT+MOVE atomic via useCurrentLotVersion, unique #CORRECT/#MOVE keys,
explicit terminalState, fresh-plan authority, native/backfilled coherence).
Remaining P0/P1: NONE. Merge-blocking P2: NONE.
Next: independent review. Do NOT merge main, deploy, run remote D1, touch PayOS, or start T11.

## Historical handoff — composition fix 4c414fa (superseded)

Program: Inventory Truth Layer
Task: T10 — final targeted multi-field reconciliation composition fix
Status: P1_REPRODUCED_FIXED_AND_FULLY_VERIFIED; T10_COMPLETE_READY_FOR_INDEPENDENT_REVIEW
Repository: vb-2f/frigo-dev (repository ID 1364064929)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation
Starting docs HEAD: aa17aeed18b61cad97a2f4f976046a102969a23a
Previous application freeze (superseded): 6c28858acd0627d2d602998107c2e260c5e4f0d5
NEW T10 application freeze: 4c414fa7eb33329ee12936c0899644af67e48f07
Docs HEAD: docs-only commit on top of the freeze; exact SHA in the final report
T09 ancestors: docs d522769ae89496fd4b3f26419f1fdfe23d9e926a, application
bf391c5fdcdd9e9c2f2257db515815e082cb4381 (both intact)
Main SHA: d1b06732f8a80db4e77986df31ff28d9f04641fa (NOT merged)
Reproduction (pre-fix): quantity+expiry → 2 CORRECT (verdict EXPIRY_UPDATE);
quantity+opened → 2 CORRECT; quantity+expiry+opened → 3 CORRECT; quantity+storage →
1 CORRECT + 1 MOVE; quantity+expiry+storage → 2 CORRECT + 1 MOVE (3 proposals).
Fix: planner merges into ≤1 CORRECT + ≤1 MOVE (contradiction → CONFLICT); decision
boundary enforces the same invariant and fails closed on malformed caller proposals;
decisionCommandSpecs re-asserts uniqueness and composes MOVE via useCurrentLotVersion.
Verification: 19 new regressions (16 fail pre-fix); full 3,009/3,009 (113 files);
T10 focused 78/78; real local D1 49/49; lint/typecheck/build/30-migration smoke/local
schema/diff PASS; clean detached exact-SHA checkout repeats everything with EMPTY status.
No migration; 0023–0030 untouched; PayOS untouched; no PR created/updated for this fix.
Remaining P0/P1: NONE. Merge-blocking P2: NONE.
Next action: independent review. Do NOT merge main, deploy, run remote D1 migrations,
touch PayOS, or start T11. Settings overlay preserved byte-for-byte/uncommitted.

## Historical handoff — initial T10 freeze 6c28858 (superseded)

Program: Inventory Truth Layer
Task: T10 — observations, evidence and reconciliation authority
Status: T10G COMPLETE; T10_COMPLETE_READY_FOR_INDEPENDENT_REVIEW
Repository: vb-2f/frigo-dev (repository ID 1364064929; task lineage vn-2e/frigo-dev)
Branch: hoplite/himera-6d3eda84-t10-observation-reconciliation (platform start-branch
successor, dashed to avoid the GitHub ref conflict with the live parent branch name)
Starting T09 docs SHA: d522769ae89496fd4b3f26419f1fdfe23d9e926a
T09 application ancestor: bf391c5fdcdd9e9c2f2257db515815e082cb4381 (intact)
Train merge: 668920fa462524e65a79d31a7b0844720baf38e0 (PR #1 himera -> kydonia,
internal base ONLY; main NOT merged)
PR tooling overlay-commit correction: 09f13c41beb826b9dd0b53037935947d6b09fd7f
(settings.json restored; overlay itself uncommitted and byte-preserved,
SHA-256 6d8f5b45041a5f41bfa6463a5f88fe1e0f5602822ecb403a5d949961f00bbee7)
T10 application freeze: 6c28858acd0627d2d602998107c2e260c5e4f0d5 (published/fetched,
local == remote == clean-checkout SHA)
T10 docs HEAD: docs-only commit on top of the freeze; exact SHA in the final report
Main SHA: d1b06732f8a80db4e77986df31ff28d9f04641fa (unchanged, NOT merged)
Baseline (pre-edit, T09 tree): 2,926 tests/108 files; 44 real local-D1; all static
gates PASS.
Verification: full 2,990/2,990 (112 files, 177.04s working tree; 175.72s clean
checkout); T10 focused 1,097/19 files; real local D1 49/49; lint/typecheck/build;
30-migration smoke incl. 0030 + T10 object/behavioral asserts; local D1 schema gate
requires 0030; fresh 0001->0030 and upgrade 0029->0030 local-only PASS;
`git diff --check` clean; clean detached exact-SHA checkout repeats everything with
EMPTY `git status --porcelain`. NO GITHUB CI STATUS for the branch.
Key design: additive 0030 observations/decisions (evidence never mutates inventory);
pure deterministic planner (9 verdicts, exact milli comparison, name-only matching
refusal, contextual units UNSUPPORTED, confirmed-expiry precedence, stale detection
by household inventory version); decision confirmation composes existing T09
CORRECT/MOVE via composeInventoryLotCommands in ONE atomic D1 batch (decision receipt
+ T09 receipts/events + observation lifecycle); response-loss replay by decision
fingerprint; altered semantics -> IDEMPOTENCY_CONFLICT; drift -> OBSERVATION_STALE
fail-closed; no second stock ledger; NO new HTTP routes (T09 precedent; T11 owns UX).
T11: NOT STARTED. T12: NOT STARTED.
Remaining P0/P1: NONE. Relevant merge-blocking P2: NONE known.
Next action: independent review of PR #2. Do NOT merge main, deploy, run remote D1
migrations, touch PayOS/payment code, or start T11 from this packet.
Details: inventory-truth/t10/{VERIFICATION,TEST_MATRIX,INVARIANT_MATRIX,CHANGE_MANIFEST,CONTINUATION}.md

## Historical T09 handoff — superseded as current (freeze remains a verified ancestor)

## Current authoritative handoff — FEFO v2 backfill compatibility, 2026-09-11

Program: Inventory Truth Layer
Task: T09 — final FEFO v2 backfilled synthetic-lot compatibility
Status: FINAL_P1_FIXED_AND_FULLY_VERIFIED; READY_FOR_FINAL_MAIN_MERGE_REVIEW
Canonical Repository: vn-2e/frigo-dev (live origin vb-2f/frigo-dev, same lineage)
Published Branch: hoplite/himera-6d3eda84 (successor at exact docs HEAD 8552fe5337245f2ac8349933c02946bf7d9dcc8f;
hoplite/kydonia-2785bb72 tip unchanged at 8552fe5337245f2ac8349933c02946bf7d9dcc8f)
Starting Docs HEAD: 8552fe5337245f2ac8349933c02946bf7d9dcc8f
Historical GLM Freeze: 9bf9ac0fe7b5e0d39615f39ae5cc30f84569af2f
Historical Astra Replay Fix: 27427383d61930ea1b67ccbc1d69bb1cc069f931
Historical PATCH Parity Freeze: e796f695bdb4228853992cdedc4e3cecf3437adb
Historical Backfill PATCH Freeze: df73bc035c2938b6fd082c57f6bca89a82d8e443
New Final FEFO Application Freeze: bf391c5fdcdd9e9c2f2257db515815e082cb4381
Docs HEAD: docs-only commit containing this receipt; exact fetched SHA in final operator report
Main SHA: d1b06732f8a80db4e77986df31ff28d9f04641fa (unchanged)
Ahead/behind main: start 29/0; application 30/0; following docs checkpoint 31/0
Changes: additive 0029 replaces the two 0027 v2 FEFO equal-ID/strict-prestate-parity
guards with authoritative adoption-mapping checks as separate shallow trigger
statements (D1 expression depth <= 100); FEFO executor drops the fail-closed TS guard
(requireParity admission now governs, exactly as v1), authenticates replay mappings
via authoritativeMapping, and writes the lot CAS with the mapped projection identity.
Migration smoke now replays 0028 (previously missed) and 0029; the local D1 schema
gate requires 0029.
Verification: 13-test permanent backfilled-FEFO matrix (single/multi/mixed incl. kg
display, terminal/partial, replay, changed-intent, stale, lost response, tenancy,
drift, four race pairs plus a multi-lot allocation race); 1,237 focused/15 files;
2,926 full/108; 44 real local-D1; lint/typecheck/build/migration/schema/diff PASS;
clean detached exact-SHA checkout repeats everything with empty status. Native
equal-ID FEFO/PATCH suites unchanged and PASS. NO GITHUB CI STATUS.
Remaining P0/P1: NONE. Relevant merge-blocking P2: NONE known.
Next action: external final main-merge review. Do not merge main, deploy, touch
remote D1/PayOS, redesign guest transfer or start T10 from this packet.
Settings overlay preserved byte-for-byte/uncommitted. Details:
inventory-truth/t09/FINAL_PATCH_VERIFICATION.md.

## Historical backfill compatibility handoff — superseded by bf391c5

Program: Inventory Truth Layer
Task: T09 — targeted legitimate backfilled-lot PATCH compatibility
Status: TARGETED_P1_FIXED_AND_VERIFIED; NOT_READY_FOR_MAIN
Canonical Repository: vn-2e/frigo-dev
Published Branch: hoplite/kydonia-2785bb72
Starting Docs HEAD: f06289b8d440071b213604c360b8839dbbf350cb
Historical GLM Freeze: 9bf9ac0fe7b5e0d39615f39ae5cc30f84569af2f
Historical Astra Replay Fix: 27427383d61930ea1b67ccbc1d69bb1cc069f931
Historical PATCH Parity Freeze: e796f695bdb4228853992cdedc4e3cecf3437adb
Final Backfill Compatibility Application Freeze: df73bc035c2938b6fd082c57f6bca89a82d8e443
Docs HEAD: docs-only commit containing this receipt; exact fetched SHA in final operator report
Main SHA: d1b06732f8a80db4e77986df31ff28d9f04641fa (unchanged)
Changes: exact adoption witness authenticates synthetic mappings; native lot CAS,
event projection ID, replay and virtual snapshot advancement use mapped projection identity.
Verification: 43 new backfill tests; previous 25 native PATCH tests; 619 focused/nine files;
2,910 full/107; 42 real local-D1; static/build/migration/schema PASS. Exact remote
SHA clean checkout: frozen install, 2,910/107, all required gates, 42 D1, empty git status.
Remaining P1: unchanged v2 FEFO SQL requires equal lot/projection IDs; no mutation
is permitted for synthetic FEFO. This shared-path limitation is not fixed by v1 PATCH.
Next action: separately authorize the additive FEFO compatibility/schema follow-up.
Do not merge, deploy, change remote D1/PayOS, implement guest transfer or start T10.
Settings overlay preserved byte-for-byte/uncommitted. Details: inventory-truth/t09/FINAL_PATCH_VERIFICATION.md.

## Historical PATCH parity handoff — superseded by df73bc0

Program: Inventory Truth Layer
Task: T09 — final targeted manual PATCH fix
Status: TARGETED_FIX_VERIFIED; NOT_READY_FOR_MAIN
Canonical Repository: vn-2e/frigo-dev
Published Branch: hoplite/kydonia-2785bb72
Start SHA: 6999b64aff0786827637b0a85f2de28c196ca288
Historical GLM Freeze: 9bf9ac0fe7b5e0d39615f39ae5cc30f84569af2f
Historical Astra First Fix: 27427383d61930ea1b67ccbc1d69bb1cc069f931
Final Application Freeze: e796f695bdb4228853992cdedc4e3cecf3437adb
Docs HEAD: the docs-only commit containing this receipt; resolve the fetched branch tip
Main SHA: d1b06732f8a80db4e77986df31ff28d9f04641fa (unchanged)
Changes: complete presence-sensitive PATCH replay; atomic projection category and
freshness; versioned metadata-only correction; retained CORRECT/MOVE response.
Verification: 515 focused/six files; 2,865 full/106; 40 isolated real local-D1;
lint/typecheck/build/migration smoke/local schema/diff PASS. Clean worktree evidence:
inventory-truth/t09/FINAL_PATCH_VERIFICATION.md.
Remaining P1: pre-existing backfilled-lot mapping refusal on PATCH (500 DRIFT_DETECTED).
Next action: separately authorize that mapping compatibility fix before main review;
do not merge, deploy, start T10 or modify remote D1. External settings overlay unchanged.

## Historical evidence — all prior freeze/readiness claims below are superseded

## T09 F/G/H complete handoff — 2026-09-11

Program: Inventory Truth Layer
Task: T09 — unchanged continuation
Phase: A–H COMPLETE (F = COMPLETE, G = COMPLETE, H = COMPLETE freeze/evidence)
Status: AWAITING_EXTERNAL_REVIEW
Canonical Repository: vn-2e/frigo-dev
T09D Frozen Base Branch/HEAD: hoplite/euhesperides-d77023a5 / 811f7e8463303e010199741d66f88ab8a817212d
Read-only configured base: hoplite/kos-2a686759 at aa44d2a2f80ea33fd4b328aba906660c0129051e
Published Branch: hoplite/kydonia-2785bb72 (platform-verified successor, same lineage)
Application Freeze SHA: 9bf9ac0fe7b5e0d39615f39ae5cc30f84569af2f (local == remote verified)
Docs SHA: recorded in REVIEW_INDEX after the docs-only commit that follows
Main anchor: d1b06732f8a80db4e77986df31ff28d9f04641fa (branch 22 ahead / 0 behind)
Fresh Checks at the application freeze: 2,837 tests / 105 files PASS; 38 isolated
real local-D1 tests PASS; lint/typecheck/build PASS; 28-migration smoke PASS;
local D1 schema gate PASS (0028 required); clean-checkout gate recorded in
inventory-truth/t09/VERIFICATION.md.
What changed since the last handoff: atomic receipt-backed adoption with
empty-household evidence (0028); every inventory writer either serves adopted
households through the lot authority or fails closed; G concurrency/tenancy matrix;
final writer map without UNKNOWN. DEC-012 remains SAFE-DEFERRED.
Independent-review follow-up `27427383d61930ea1b67ccbc1d69bb1cc069f931` restores
committed adopted PATCH response-loss replay ahead of legacy version preflight,
rejects altered idempotency-key reuse, and keeps distinct-key CAS strict. Fresh full
verification: 2,838 tests / 105 files PASS (165.25s); lint/typecheck/build and
28-migration smoke PASS.
Next action: external independent review decides readiness. Do not merge to main,
deploy, mutate remote D1, touch PayOS, or start T10 from this handoff.

## Historical continuation handoff (superseded) — 2026-09-11

Program: Inventory Truth Layer
Task: T09 — unchanged continuation
Phase: A–E complete; F in progress; G–H pending
Status: IN_PROGRESS
Canonical Repository: vn-2d/frigo-dev
T09D Frozen Base Branch: hoplite/euhesperides-d77023a5
T09D Frozen Base HEAD: 811f7e8463303e010199741d66f88ab8a817212d
Canonical Writable Continuation: hoplite/kos-2a686759
Verified Successor Base / Interrupted F SHA: 66858c5296b38715e4bfca77fca5eefe5adadf5a
Last Verified Published Prior Continuation SHA: 66858c5296b38715e4bfca77fca5eefe5adadf5a
Last Verified Application SHA: aa43e069edbff7843e9eb7532ff386b27be96a17
T09E Application SHA: 9bd1e6bc000cd2e94121469babb1a5eb63a5047f
Application Freeze: NOT FROZEN

Current Published Application SHA: aa43e069edbff7843e9eb7532ff386b27be96a17
Current Published Branch: hoplite/kos-2a686759
Current Scope: pure adoption preparation; mapped-authority legacy writer fences;
scan/shopping stock-revision fences; original scan retry identity; shopping
fingerprint/lease/committed-response recovery. DEC-012 unchanged.
Fresh Checks: 1,347 tests / 19 focused files; 2,808 / 103 full; 38 actual local-D1
tests; lint; typecheck; build; 27-migration replay; diff and protected paths PASS.
Scoped Review: two P2 findings corrected and independently re-reviewed; no remaining
P1/P2 within this partial increment, not a final T09 independent-review verdict.
Remaining: atomic adoption executor/activation marker and v3 evidence; functional
mapped-household adapters; original scan confirmation intent/result replay; full
G races/tenancy; H freeze/complete review. No new schema or active adoption yet.
Exact Next Action: implement additive, narrowly dispatched v3 ADOPT authority and
persist the pure plan in one fenced transaction, including empty-household marker;
extend writer admission before activation, then implement all functional adapters.
See F_ADOPTION_PLAN.md and VERIFICATION.md for exact constraints/failures.

## Recovery baseline and pre-transfer chronology

Transfer recovery: all canonical branches/tag fetched; required objects, full
consecutive ancestry and fsck PASS. Main unchanged at d1b0673; interrupted F was
18 ahead / 0 behind. Prior continuation is the read-only configured base;
unchanged-head publication rejected without mutation. One existing successor
starts exactly at 66858c5. Fresh baseline: 2,685 tests / 99 files and typecheck,
lint, 27-migration smoke, build PASS. Pre-existing settings overlay preserved in
stash `t09-transfer-preexisting-hoplite-settings-overlay`. Exact Next Action:
publish recovery docs, then explicit adoption/all-writer integration per
F_ADOPTION_PLAN.md; continue G/H only after real F acceptance. Previous repository
owners and the pre-transfer receipts below are historical provenance only.

Reason: Hoplite base branches are read-only; user authorized writable successor.
Ancestry and successor publication-first PASS at 8bf32ed4e41ed3341215c6376e0c13ef13043616.
E adds deterministic bounded FEFO USE, one atomic 1–32-effect batch, v2 receipt/event
authority and additive 0027; v1 predicates and 0023–0026 are unchanged. Existing
settings overlay remains outside this task. No adoption, live writer, HTTP or UI change.
Latest checks after the ordered-receipt fence: 1,172 focused / 11 files (35 actual
local D1 tests), full 2,659 / 98 files and lint/typecheck/build/migration smoke PASS.
Earlier post-replay-fix 1,170 focused / 2,657 full results predate that fence.
Isolated local D1 applied 27 migrations and schema gate returned success.
Failures fixed: D1 expression depth, SQL NULL fail-open, replay envelope/mode
misclassification; ordered-receipt follow-up and gate chronology are recorded in
`inventory-truth/t09/VERIFICATION.md`. Scoped E review has no remaining P1/P2
findings. E publication/fetch/equality/ancestry PASS. Exact Next Action: F explicit
adoption/all-writer integration per `inventory-truth/t09/F_ADOPTION_PLAN.md`;
DEC-012 guest-transfer safety is implemented with 143 focused auth/guest/outbox
tests PASS, full 2,685 / 99 and all static/build/local migration gates PASS.
No automatic guest-data fallback occurs. Adoption and other live
writers remain incomplete. Never push the frozen D base.
No main/legacy/production/staging/remote D1/PayOS/T10 changes.

## Historical T09D handoff — 2026-09-10

Program: Inventory Truth Layer
Task: T09 — Inventory Lot Engine & Event Authority
Phase: T09D complete and published; E–H pending
Status: IN_PROGRESS
Canonical Repository: vn-2b/frigo-dev (user-confirmed correction)
Canonical Branch: hoplite/euhesperides-d77023a5
T08 Base SHA: 8f8788c1a0c9e486657751ef3875a5baa5334dec
Last Verified Remote SHA: b036b257a8ad775dd6f1a445dcfdcce38a6babf1
T09D Code Checkpoint: b036b257a8ad775dd6f1a445dcfdcce38a6babf1
Development Main Anchor: d1b06732f8a80db4e77986df31ff28d9f04641fa
Application Freeze: NOT FROZEN

Completed: identity/baseline/publication-first; T09A audit/lifecycle; B contracts;
C internal native executor, additive 0024, membership/revision/CAS, receipt/event/
projection atomicity and actual local D1 proof. No HTTP or legacy-writer cutover;
unadopted/mixed households fail ADOPTION_REQUIRED rather than silently diverge.
Checks: native/combined/full regression gates, static/build, 24-migration replay,
populated upgrade and local D1 proof run; exact current counts in
inventory-truth/t09/VERIFICATION.md. Final C: 507 focused / 1,994 full (93 files),
lint/typecheck/build, 24-migration/local schema PASS. Remote-source 507 PASS.
Failure: managed setup claim blocked; workaround succeeded, platform issue filed.
D now rejects corrupt retained receipts, invalid command event binding and paired
receipt/event evidence inconsistent with written stock. Additive 0025/0026 retain
all earlier migrations and historical events. D final checks: 1,031 focused,
2,518 full / 95 files, lint/typecheck/build, 26-migration replay and local schema
PASS. Review findings and exact commands: inventory-truth/t09/VERIFICATION.md.
Full T09 E–H completion gates pending. Historical counts below are not
T09 evidence. Preserved unrelated settings overlay in named local stash; details
in inventory-truth/t09/SESSION_LOG.md. No tracked setup configuration changes.
Publication: D b036b25 committed/published/fetched; local/remote equality PASS.
Separate fetched-source worktree: 1,031 tests and typecheck PASS, clean source.
Exact Next Action: T09E deterministic FEFO, then F explicit adoption/all-writer
integration before exposing HTTP. No remaining D check failure. This documentation
receipt follows the verified code SHA; resolve latest docs HEAD via Git.
Read inventory-truth/t09/REVIEW_INDEX.md. T09 is not independent-review-ready.
Legacy Frigo/main/production/staging/remote D1/PayOS untouched; T10 not started.

## Historical handoff (not current task authority)

## Current branch handoff — published T08 completion (2026-09-10)

Repository vn-2c/Frigo. User explicitly approved the Hoplite publication branch
instead of the original canonical name; DEC-006 supersedes only that restriction.

Program: Inventory Truth Layer
Task: T08
Phase: T08F Verification/Handoff
Status: COMPLETE — verified, committed and published; not deployed
Canonical Branch: hoplite/xanthos-7d942897 (user-approved cross-account handoff)
Base Main / last fetched origin/main: d1b06732f8a80db4e77986df31ff28d9f04641fa
Last Code SHA: dd2ecc6f7066250dfdc5214a3d6c356e1479b61e
Last Verified / Confirmed Published SHA: fb00f46d4633c9659e812be9f86119533973a8bd
Final HEAD: subsequent docs-only checkpoint; read `git rev-parse HEAD`

Completed: audit; strict storage/lot contracts; additive 0023; exact milli-unit
adapter; explicit guarded/idempotent backfill; compatibility projection/parity.
Fresh final-session verification: 130 focused tests; 1,617 full tests / 89 files;
lint, typecheck, build, 23-migration replay/local schema and diff checks PASS.
Prior sandbox-local D1 apply also passed 23/23. No remaining failure; publication
succeeded through the trusted broker and its exact head was fetched/confirmed.

Remaining T08 work: none. Exact next action: next account checks out
`origin/hoplite/xanthos-7d942897`, reads `inventory-truth/T08_VERIFICATION.md` and
the six handoff files, then waits for explicit T09 authorization.
Do not force-push, merge/rebase main, deploy or touch remote D1/PayOS.
Quantity that cannot fit exact milli-units fails preflight unchanged. Legacy data
is not live-synced; unknown/estimated evidence stays distinct and guest transfer
drift is diagnostic, not an auth rewrite. T09 owns commands/event authority/dual-write.

Cross-account takeover: first read the six `inventory-truth/` documents in order;
diff Last Verified SHA..HEAD. Exact executed commands, corrected failures, source
map and future integration risks are persisted there, not dependent on this chat.
Branch pushed: YES. Main/production/staging/remote D1/PayOS untouched: YES.

## Preserved release handoff (historical, separate production track)

## Active production integration handoff (2026-09-15)

WORKING_BRANCH: `integration/t13-takosan-qwen`

PRODUCTION_BASE: `05423f2ad675006a4c7913e696f1979b3fcaae59`

COMMON_BASE: `d1b06732f8a80db4e77986df31ff28d9f04641fa`

The current authorized task is a local/published integration candidate combining
production, the Qwen runtime branch, certified T13, and hardened Takosan. Source
IDs and SHAs are verified, production migration `0023_scan_request_fingerprint.sql`
is immutable, and the T13 migration bridge is planned at `0024`-`0033`.
`docs/integration/` is the current task packet. No candidate is designated yet.

Next action: checkpoint the analysis, integrate Qwen, merge T13/Takosan with
semantic conflict resolution, then run migration/static/full/browser gates.
Production main, remote D1, deployment, production R2/KV/queue, PayOS, and T14
remain untouched.

## Authoritative release

AUTHORITATIVE REPOSITORY: `vn-2c/Frigo`

CANONICAL GITHUB REPOSITORY (redirect observed 2026-09-12): `Tungjpstore/Frigo`

The configured `github-frigo` remote retains the `vn-2c/Frigo` alias.

AUTHORITATIVE BRANCH: `main`

PRODUCTION_APPLICATION_BASE_SHA:
`23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`

DEPLOYED_APPLICATION_SHA:
`d1b06732f8a80db4e77986df31ff28d9f04641fa`

MAIN_RELEASE_LINEAGE:
`d1b06732f8a80db4e77986df31ff28d9f04641fa` plus documentation-only receipt
merges; resolve the current `main` head from GitHub for a future release.

APPLICATION_RELEASE_MERGE_SHA:
`23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`

PRE_CLEANUP_MAIN_HEAD:
`41d2de6bc76331322cc63e8038432b0b02f60da1`

VERIFIED APPLICATION SHA: `0b20061e7dc7405df68b18a18da4166e09494ecd`

VERIFIED RELEASE HEAD: `0420807968538f61b669569d064c404f67032174`

MAIN CI: `34396319671 SUCCESS`

PREVIOUS FINAL-HEAD CI: `34405307196 SUCCESS`

PREVIOUS RELEASE DEPLOY WORKFLOW: `34396457582 SUCCESS`

PREVIOUS DOCS-CLEANUP DEPLOY WORKFLOW: `34405457796 SUCCESS`

PRODUCTION: **DEPLOYED AND VERIFIED**

DEPLOYED_MAIN_SHA:
`d1b06732f8a80db4e77986df31ff28d9f04641fa`

PRODUCTION_WORKER_VERSION:
`df7225c9-6f20-4206-9f16-573de6a69c43` (100% traffic)

OCR_RECOVERY_BRANCH: `codex/ocr-production-recovery`

OCR_RECOVERY_BASE_SHA:
`d8ca112a5ac5eb215f36a3f89b4218e2fc691371`

OCR_RECOVERY_STATUS: **DEPLOYED AND VERIFIED**

OCR_RECOVERY_CHECKPOINT: 2026-09-13; implementation `ec87aec` merged as
`bdb0dda0b1123c4fd940058091e3cb285d5e8eb8`. Worker version
`df7225c9-6f20-4206-9f16-573de6a69c43` serves 100% traffic and production D1 is
at migration `0023`.

## Current status

T01-T07: COMPLETE

Release Integration: **COMPLETE**

Main Integration: **COMPLETE**

GitHub source of truth: main.

APPLICATION INTEGRATION: complete in main at `23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`.

The main merge tree is source-equivalent to the verified release head. Changes
after the production application base on GitHub remain documentation-only; the
separate OCR recovery branch contains candidate code/config/test changes that
are not part of `main` or production.

## Production cutover receipt

**Status: COMPLETE - SCHEMA AND WORKER CUTOVER VERIFIED (2026-09-10).**
Migrations `0019` -> `0022` were applied in order after the retained D1 export,
then the Worker was deployed from a clean checkout of the approved `main` SHA.

### Live runtime

- Target: `https://frigo.tungjpstore.net` (Cloudflare Worker; no Frigo
  production process is running in this local checkout).
- Liveness and landing smoke returned HTTP 200.
- Readiness returned HTTP 200 with `status=degraded`, `environment=production`,
  and full `commit=d1b06732f8a80db4e77986df31ff28d9f04641fa`.
- Readiness services are database/queue/AI/email `ok` or `configured`, rate
  limiting is `kv-best-effort`, and the only issue is the non-blocking warning
  `CONFIG_PLUS_GRANT_SECRET_MISSING`; `config.ok=true` and no fatal issue were
  observed.
- Active Cloudflare version is `48e0c366-3c8a-4f2b-a2d5-965785995431` at 100%
  traffic (deployment started 2026-09-10T21:08:00Z).

### Source and schema comparison

- The deployed Worker reports the approved main SHA; no source-only divergence
  remains on the public runtime.
- Remote D1 ledger is exactly `0001` through `0022`; the exact schema gate passes,
  foreign-key violations are `0`, and 65 user tables are present.
- `pnpm week:reconcile:remote -- --strict --json` passes 2/2 plans, 0 orphan
  rows and 0 mismatches (14 Week days, 16 slots and 30 shopping rows observed).

### Backup and rehearsal

- Export: `.artifacts/frigo-db-pre-main-d1b0673-20260910T205627Z.sql`,
  mode 600, 521095 bytes, SHA-256
  `000c9cb88d6045afb19cca6ce3e1caa308b20ffa214dbb2cddfca0cb78d722eb`.
- Temporary-copy replay of `0019` -> `0022` passed foreign-key/integrity checks
  and all `0020` preflight guards before the remote apply.
- Key post-cutover counts remain users 28, households 28, inventory items 13,
  recipes 59, meal plans 2, scan queue jobs 15, sessions 2 and auth OTPs 0.
- Migrations are additive and order-dependent. There are no down-migrations;
  retain the additive schema and use only a schema-compatible code rollback.

### Operational finding and gate

- CORS probes now return the exact ACAO for the trusted origin and no ACAO for
  path-bearing, localhost or arbitrary origins.
- No planner flag, PayOS/payment path or production secret value was changed.

## Verification receipt

- Full: 1,487 tests / 87 files PASS.
- Focused T02-T07: 819 tests / 40 files PASS.
- D1 clean: 22 / 22 migrations PASS.
- Upgrade sanity: 0020 -> 0022 PASS.
- Existing rows preserved: 776 rows / 58 tables.
- Browser: 264 assertions / 36 phases PASS.
- Payment-adjacent: 82 tests / 7 files PASS.
- Final release CI: PASS.
- Post-cutover local gates: `pnpm lint`, `pnpm typecheck`,
  `pnpm check:migrations` and `pnpm build` PASS.
- Local `pnpm test`: 1,427/1,487 PASS; 60 failures are limited to the two shell
  UI suites because `localStorage`/`container` are unavailable in this runner.
- Hosted exact-SHA CI `34413458369`: 1,487 tests / 87 files PASS.
- Dependency audit: `pnpm audit --prod` reports 2 moderate `react-router`
  advisories (current v6 line; upstream fix requires v7.18.0). Treat the
  dependency upgrade as a separately tested follow-up; no emergency package
  change was made during this production cutover.
- `git diff --check`: PASS for the OCR candidate. `pnpm check` on 2026-09-13
  passed 1,579 tests / 93 files plus lint, typecheck, migration replay through
  `0023` and build. Hosted PR #17 CI run `34728606704` passed the same checks;
  live-provider smoke and production canary remain pending.

The local UI limitation is environmental; the hosted exact-SHA CI remains the
authoritative full-suite gate.

## OCR production-recovery candidate

The candidate is a code/config recovery with additive migration
`0023_scan_request_fingerprint.sql`; it does not amend the historical cutover
receipt or authorize a deployment.

- Qwen `qwen3.7-flash` is explicitly set as the primary provider for vision,
  receipt OCR, chat and ranking through the DashScope international endpoint
  (`QWEN_BASE_URL`, `QWEN_MODEL`); structured requests disable thinking. Groq is
  an opt-in legacy fallback through `GROQ_FALLBACK_ENABLED=true`, and is
  disabled in the candidate vars.
- Native Cloudflare vision is opt-in through `CLOUDFLARE_VISION_FALLBACK` and is
  `false` in the candidate worktree vars. DeepSeek remains the optional
  text/ranking fallback when `DEEPSEEK_FALLBACK_ENABLED=true`, and Z.ai/GLM the
  optional vision/text extension path when `GLM_FALLBACK_ENABLED=true`; GLM-5.3
  Flash is future model work, not an active claim.
- Zod plus a deterministic quality gate removes generic/placeholder labels and
  confidence below `0.6`; an empty usable result is the permanent
  `AI_SCAN_NO_USABLE_ITEMS` failure. OCR output remains reviewable draft data,
  not trusted inventory, price or safety authority.
- Typed provider failures distinguish permanent `MODEL_NOT_FOUND`, auth/permission,
  license, schema/invalid-response and quality errors from retryable
  `REQUEST_TIMEOUT`, `NETWORK_ERROR`, `RATE_LIMITED` and `UPSTREAM_ERROR` errors.
  Queue lease, idempotency, tenant fencing, attempt limits and DLQ semantics are
  unchanged.
- Scan status responses expose bounded failure codes and retry metadata without
  provider credentials or raw image content.
- The candidate adds additive migration `0023_scan_request_fingerprint.sql`.
  Local replay/schema checks cover `0001`-`0023`; production D1 now includes
  `0023` after the retained pre-0023 export. Worker deployment is verified.

Focused local checks and the full candidate gates passed on 2026-09-13:
`pnpm check` reports 1,579 tests / 93 files PASS, lint/typecheck/migration replay
through `0023` and build PASS; hosted PR #17 CI run `34728606704` is also green.
Live provider access is verified: a non-PII Qwen smoke returned HTTP 200 with
model `qwen3.7-flash` and `OK`; the key value is not stored in the repository or
logs. No separate staged canary was used; the guarded deploy went to 100% after
backup, migration and schema gate.

## Deployment and production boundary

Release packaging completed. Staging was not provisioned, so no staging deploy
occurred. The GitHub production environment/secrets are not provisioned, so the
approved release was deployed directly with Wrangler OAuth from a clean SHA
checkout; the same schema, smoke and readiness receipts were captured locally.

Production now reports candidate commit `bdb0dda0…`; readiness and liveness smoke
passed after deployment. Wrangler OAuth is authenticated as `tungbipdz@gmail.com`
for account `ef250a88911fd24073cb73d1c07e0218`.

PRODUCTION LOCAL RECONCILIATION COMPLETE - SCHEMA/CODE CUTOVER VERIFIED

Production local reconciliation: COMPLETE - post-cutover checks passed

PRODUCTION DATABASE MIGRATION COMPLETE - `frigo-db` at `0022`

Production DB migration: COMPLETE - exact ledger `0001` through `0022`

PRODUCTION DEPLOYMENT COMPLETE - Worker version `48e0c366-3c8a-4f2b-a2d5-965785995431`

Production deployment: COMPLETE - readiness commit matches `d1b06732...`

Planner rollout: NOT STARTED. `PLUS_GRANT_SECRET` remains intentionally absent
and is reported as a warning; no secret values were read or changed.

## OCR image optimization candidate (2026-09-13)

`src/web/lib/private-image.ts` contains an uncommitted client-side optimization:
gallery images are decoded in memory, constrained to a 2,000 px longest side and
encoded as JPEG quality 0.82 only when smaller than the source. Small images are
not upscaled; originals are never mutated or stored; cancellation/session fencing
and a FileReader fallback are preserved. The attached receipt measured 2,116,353
bytes as PNG versus 382,334 bytes after a local quality-0.82 conversion (81.9%
reduction, same dimensions). Focused privacy/image tests pass 11/11. The
implementation is committed locally at `ba3d872eea2d677e38f94adb8355f493c4c45852`
but is not deployed; browser/device OCR recall and latency smoke is still
required before release.

## PR #8 authoritative metadata

PR #8 METADATA:

- State: `MERGED`
- Draft: `false`
- Merged at: `2026-09-09T19:38:59Z`
- Closed at: `2026-09-09T19:38:59Z`
- Merge commit: `23ef51d6ec12a5a3e319a2d941dca39d2775cb9d`
- Base: `main`
- Head: `hoplite/kirrha-5f4057f0`
- Head SHA: `0420807968538f61b669569d064c404f67032174`

PR #8 was not reopened, re-merged or modified during this task. Its verified
release tree is already contained in main. Application integration and PR
metadata are separate facts.

## Kirrha archival state

Kirrha is two commits ahead of current main and differs only in the four
`docs/ai/` release protocol documents. It has no application differences absent
from main. Do not merge or revert this historical branch.

## Protected areas

PayOS/payment code untouched.

No real payment performed.

## Next task

Next task: MONITOR OCR QUALITY/LATENCY AND SCHEDULE REACT ROUTER UPGRADE

Keep the deployed Worker and planner flags at safe defaults while the OCR
candidate is validated. Run focused provider/queue/UI tests and all required
local gates, then obtain authorized live-provider smoke, hosted CI, readiness and
canary evidence before any production deploy. Apply and verify additive migration
`0023_scan_request_fingerprint.sql` first; no production secret change is implied.
Do not touch PayOS/payment or use a down-migration. Rollback remains code-only to a schema-compatible SHA;
reserve D1 restore/export for an incident. Configure the GitHub `production`
environment, `PRODUCTION_URL` and Cloudflare secrets before the next guarded
release, and schedule the tested React Router major upgrade separately.

## Qwen runtime governance candidate (current task)

WORKING_BRANCH: `feat/qwen-ai-runtime-cost-router`

BASE_SHA: `05423f2ad675006a4c7913e696f1979b3fcaae59`

CANONICAL_MAIN_CHANGED: **NO**

PRODUCTION_DEPLOYED: **NO CHANGE / NOT AUTHORIZED**

The branch adds a fetch-compatible `QwenTaskRuntime` behind `AIRouter`. Tasks
resolve to logical roles (`QWEN_FAST`, `QWEN_FAST_CANARY`, `QWEN_MULTIMODAL`,
`QWEN_OCR`, `QWEN_REASONING`, `QWEN_JUDGE`) in one governance table. Physical
model IDs are supplied only by `AI_MODEL_*` configuration. Normal text uses the
pinned `qwen3.7-flash-2026-07-15`; OCR uses `qwen-vl-ocr`; multimodal work uses
`qwen3.8-flash`; reasoning and judge are disabled unless explicitly enabled.

The runtime enforces per-task input/output budgets, a per-operation call/token
ceiling, one repair plus one policy-approved escalation, Zod structured-output
validation, scan quality gates and cost metadata. `AIUsageLedger` aggregates
task/model calls, tokens, costs, failures, retries, escalation and latency;
Worker logs include only non-PII metadata. `AI_QWEN_ONLY=true` prevents legacy
Groq, DeepSeek, GLM and native Cloudflare providers from being constructed.

Inventory safety is unchanged: AI returns observation/candidate data only. The
existing normalization, validation, review, reconciliation, fencing and
idempotent inventory command remain the sole authority for mutations.

Final T08-T12 Inventory Truth end-to-end certification is still pending the
later unification with the separate `frigo-dev` lineage. This candidate does
not import that code or migrations; it only proves that Qwen runtime/provider
modules have no direct authoritative inventory mutation path.

Offline evaluation assets are `tests/fixtures/ai-golden.json`,
`tests/unit/ai-golden-dataset.test.ts` and `scripts/ai-eval.mjs`; run
`pnpm ai:eval -- --dry-run`. The command makes no live provider call and no CI
test requires an Alibaba credential.

Verification recorded for this checkpoint:

- Application checkpoint: `21c442d`.
- `pnpm check`: PASS — 1,606 tests / 95 files; lint, typecheck, migration replay
  and production build all PASS. Remote D1 schema and Week parity checks were
  skipped because no release flags were supplied.
- `pnpm ai:eval -- --dry-run`: PASS; fixture-only report, no Alibaba/Qwen call.
- `git diff --check`: PASS after the documentation edits.
- Focused command (`pnpm vitest run tests/unit/ai-runtime-governance.test.ts
  tests/unit/ai-router.test.ts tests/unit/qwen-provider.test.ts
  tests/unit/config-validation.test.ts tests/unit/meal-planning-explanation.test.ts
  tests/unit/scan-privacy.test.tsx tests/integration/scan-queue-retry-policy.test.ts
  tests/integration/scan-async-canary.test.ts`): **119 tests / 8 files PASS**;
  queue/idempotency regression coverage remains green.
- `pnpm audit --prod`: FAIL (2 moderate `react-router` advisories; patched
  upstream at `>=7.18.0`). This pre-existing dependency follow-up is outside
  the Qwen runtime scope; no package upgrade was made in this checkpoint.
- Secret scan, protected-path scan and provider/model search were clean. No
  PayOS/payment, unrelated auth, remote migration, merge or deployment action
  was performed.
- Local `main` is a separate divergent ref (`f6a48a1`); canonical source for
  this candidate is `github-frigo/main` at `05423f2`, and no local ref was
  changed.
- Final review found no concrete runtime defect requiring a code fix. Readiness
  already probes the additive scan columns from migration `0023`, and the
  deployment documentation correctly scopes the native `AI` binding to the
  explicit `CLOUDFLARE_VISION_FALLBACK=true` path.
- Publication checkpoint: `feat/qwen-ai-runtime-cost-router` is now published
  on `github-frigo` by a normal non-force push; `git ls-remote` verified the
  remote branch SHA matches the local candidate and canonical `main` remains
  `05423f2`. GitHub emitted only the repository-relocation notice to
  `Tungjpstore/Frigo`; no merge, deployment, remote migration or production
  change has occurred.

Next action after publication: request code review or a separately authorized
Qwen benchmark, then promote a pinned alias only through the documented
golden-dataset process. Do not merge, migrate remotely or deploy from this
branch.

## Qwen pre-unification hardening checkpoint (2026-09-13)

Implementation is complete on `feat/qwen-ai-runtime-cost-router` and remains
ahead of canonical `github-frigo/main` at `05423f2` without changing `main` or
production. The final changes are:

The verified application publication commit is
`f8468eaa7d7fed3cbcf5ac7e780eca07ad3d71e4`; the docs checkpoint containing
this handoff is intentionally a subsequent normal commit.
The final pre-documentation branch head, including the scheduler-failure
regression test, is `a145ef5`.

- `qwen-vl-ocr` capability metadata disables unsupported provider structured
  output and thinking controls while preserving prompt JSON, application parsing,
  normalization, Zod validation and scan quality gates. The rolling alias is
  explicitly `pinned=false`; no unverified snapshot was invented.
- Pricing defaults now reflect Singapore low-context planning values and carry
  `estimate-2026-09-sg-low-context` (judge remains a documented planning
  estimate). Usage remains estimated, not Alibaba invoice truth.
- `AI_MAX_IMAGE_BYTES` and `AI_MAX_OCR_IMAGE_BYTES` default to 5 MiB and are
  bounded to 64 KiB-20 MiB. Raw/data-URL base64 is checked by decoded-byte
  estimate before any Qwen provider call; remote URLs remain upstream-limited.
- Shadow canary is lifecycle-safe: `backgroundExecutor` schedules the reserved
  promise through Worker `executionCtx.waitUntil`; hosts without an executor
  skip shadow. The default canary percentage remains zero, and scheduler
  invocation failures are isolated from successful primary responses.

Verification completed 2026-09-13:

- Focused command: **134 tests / 8 files PASS**.
- `pnpm check`: **1,623 tests / 95 files PASS**; lint, typecheck, migration
  replay and production build PASS.
- `pnpm ai:eval -- --dry-run`: PASS, six fixture cases, no live request.
- `git diff --check`: PASS.
- `pnpm audit --prod`: FAIL with two known moderate React Router advisories;
  patched upstream at `>=7.18.0`, upgrade intentionally deferred.

No live Qwen benchmark, production deploy, remote migration, secret change,
merge, PayOS/payment modification or T08-T12 Inventory Truth import occurred.
Queue/HTTP compatibility and inventory mutation boundaries remain intact. The
next action is to verify the final normal push SHA with `git ls-remote`, obtain
code review, and only then consider a separately authorized benchmark/release.
Do NOT git pull/reset directly inside running production. Production-local source
must first be snapshotted and compared against the final post-merge GitHub main
head, with
application lineage anchored at `PRODUCTION_APPLICATION_BASE_SHA`. Do not deploy,
run remote migrations, enable planner flags or alter production configuration as
part of this bookkeeping task. Do not treat `PRE_CLEANUP_MAIN_HEAD` as the final
head.

## SAFE STOP — T13R-B — 2026-09-13T21:35Z

T13R-B truth-presentation remediation checkpointed at WIP `7e68e3b` on
`hoplite/medma-164548ce` (P2-1 already committed as `4d587eb`). Full
status, test evidence, and next step: `docs/ai/inventory-truth/t13/T13R_B_REMEDIATION.md`.
Findings P2-1/P2-4/P2-5/P2-6 = FIXED (test-backed, NOT certified). No
freeze created. Main unchanged. See T13R_B_REMEDIATION.md before continuing.
## Canonical promotion CLI handoff (2026-09-15)

**HISTORICAL CHECKPOINT — SUPERSEDED BY THE MERGED PR #2 RECEIPT ABOVE.**

The canonical promotion remains intentionally unmerged. GitHub CLI verified
`vn-dlo/Frigo-dev`, PR #1, base `main`, and promotion head
`ae1689c1f5525262da3478137b402692e4e4ed45`. The head differs from the prior
receipt only by an empty commit used to request a fresh PR event; application,
migration, and documentation trees are unchanged by that commit.

The exact hosted CI gate is unresolved: `gh run list` and PR checks are empty,
and `gh workflow run` returns HTTP 422 `Actions has been disabled for this
user`. The CLI account is `Tungjpstore` with push but not admin/maintain access;
branch protection is not configured/visible. Do not merge or deploy. An admin
must enable Actions and confirm main protection, then rerun checks against the
exact head and explicitly authorize a history-preserving merge.

Follow-up: `gh` is now authenticated as repository owner `vn-dlo` with admin/
maintain access. Main protection is configured to require one PR approval and
the `validate` status, with force-push and deletion disabled. The promotion
head is `6ec7ff08ef258ef2ca95fb5d24b581b939ef1c92`; this is another empty
tree-neutral trigger commit. Actions is enabled, but no exact-head workflow run
has appeared. Do not merge until the `validate` check is actually present and
passing, then obtain explicit maintainer authorization.

Owner-visible PR #2 (`canonical/5f6853d-promotion-ci`) now has exact hosted CI
run `34968012294` passing on `8eb6d2b8d54e5e2fd08c0a11acd9f57a1e068b24`.
Hosted validate completed lint, typecheck, full Vitest, migration smoke, and
build successfully. Main protection correctly leaves the PR blocked pending
one independent approval; no merge or deployment has occurred.

## Current auth handoff (2026-09-16)

Safari showed a blank Google OAuth popup at `accounts.google.com/gsi/transform`.
The live `/auth` headers included `Cross-Origin-Opener-Policy: same-origin`.
Hono `secureHeaders` was the effective source because it ran after the custom
header middleware and overwrote the GIS-compatible value. The fix disables
that one Hono default and sets COOP by path: SPA `same-origin-allow-popups`, API
`same-origin`. The regression test is green (`17/17` focused tests), with lint,
typecheck and diff check green. PR #9 merged as `911db7f`; Worker version
`20bc1f35-6ffe-4085-ba79-d54a0b53da71` is live at 100%. Production smoke and
readiness pass, `/auth` now returns `same-origin-allow-popups`, and `/api/*`
retains `same-origin`. The only readiness warning is the pre-existing
`CONFIG_PLUS_GRANT_SECRET_MISSING`; no migration or production data resource
was changed.
## T18C resumed — source comparison checkpoint (2026-09-21)

- **Status:** T18C_PARTIAL; historical pause below is retained, not current.
- **Resume:** `2e770f8e93bdda63dc3534093dc313d99fab229d`, existing branch,
  main `b8447e85`, repository `1368281478` / `vn-tako/Frigo-dev`.
  Correct upstream is `origin/feat/t18c-final-redesign-certification`.
- **Executed:** `PORT=5173 pnpm exec playwright test -c
  playwright.t18c.config.ts tests/e2e/t17-ui/t18c-matrix.e2e.ts` — 6 passed,
  162 captures/audits, zero axe violations/overflow. Source remains unedited
  since the pause. Style 39 allowlisted/0 unjustified; contrast 33/33
  configured pairs (one decorative informational pair).
- **Evidence:** baseline untouched; `fixed-tree.zip` preserves the fresh
  rerun. `approved-source.zip` now preserves the supplied original kit.
  See `T18C_SOURCE_PROVENANCE.md` for hashes and authority hierarchy.
- **Environment:** dependency install was missing. Durable project setup/run
  overrides use frozen pnpm install, Chromium, SQLite and repository-owned
  isolated Preview on 5173. Platform setup claim failed twice; the exact
  setup command succeeded through shell. Settings file remains untouched.
- **Next:** finish direct 27-screen comparison, classify/fix evidenced UI
  gaps, run T17 and final gates, then produce separate final evidence.
  Do not reuse pause-tree results for subsequent edits. No human screen-reader
  test, merge, deploy, remote migration or T18D.

---

# T20 hardening handoff — 2026-09-26 UTC

## State and checkpoints

Not production-ready: `main` is PR #7 merge `bf57451` (`bf57451e4a1a047eeff7a0938b903d1a37b6f8c9`), last
main CI `36221190222` FAIL in the T20 add/remove race test. PR #8 remains
OPEN, head `5b0a6b9` (`5b0a6b995786b338999286023eb2e46de4bc45a7`), MERGEABLE/CLEAN, no unresolved review
threads, full hosted `validate` `36226026618` SUCCESS. Local `pnpm check` on
that exact head passed (201 files / 4,554 tests, migrations, build). Agent
merge is disallowed; no C1 exact-main green SHA or merge SHA yet.

Follow-up branch `fix/t20-postmerge-ci-picker-cuisine--hardening`, PR #9 base
PR #8: C2 `762015f` (torn-read 409 semantics); C3 `bc92346` (picker stale-page
guard) + `c555443` (combined-filter regression); P2 `fb4416e` (same-slot
T02 prefix inventory for Manual hard restrictions). All pushed. The C4
application code freeze is `fb4416e`; this documentation receipt follows it.
No known outstanding in-scope P0/P1/P2; no T19 authority or 500-catalog change.

## Executed checks

- C2: `pnpm exec vitest run tests/integration/t20-meal-composition-stale-read.test.ts tests/integration/t20-meal-composition-flows.test.ts` — 22/22 PASS; `pnpm typecheck`, `pnpm lint`, `git diff --check` PASS. Initial fixture used an invalid slot ID and failed one assertion; corrected to a valid absent ID, then reran green. No sleeps/retries.
- C3: `pnpm exec vitest run tests/unit/t20-meal-composer-ui.test.tsx tests/integration/t20-roles-picker-shopping.test.ts` — 19/19 PASS; four-way filter/pagination extension rerun 7/7 PASS. A new focus assertion initially clicked an unfocused opener in jsdom; focused it like keyboard use, then reran green. `pnpm typecheck`, `pnpm lint`, `git diff --check` PASS.
- P2: `pnpm exec vitest run tests/integration/t20-legacy-family-and-safety.test.ts tests/unit/t20-composition-safety.test.ts tests/unit/t20-composition-shopping.test.ts tests/integration/t20-meal-composition-stale-read.test.ts` — 33/33 PASS; `pnpm typecheck`, `git diff --check` PASS.
- C4 at `fb4416e`: `pnpm check` PASS: typecheck, lint, 202 Vitest files / 4,562 tests, migration smoke (`migration-smoke=ok`), build. `pnpm exec vitest run tests/integration/t19-recipe-authority-split.test.ts tests/integration/t19-recipe-authority-observability.test.ts tests/integration/t19-planner-authority-persistence.test.ts tests/integration/recipe-catalog-growth-authority.test.ts tests/integration/t20-meal-composition-flows.test.ts tests/integration/t20-roles-picker-shopping.test.ts` — 6 files / 80 tests PASS. Remote D1/Week gates skipped by `pnpm check` (no credentials).
- Real isolated preview with `PREVIEW_MEAL_COMPOSITION_V2=true` (paired Worker/UI, no external fetch): mobile 390×844, tablet 768×1024, desktop 1280×800. Picker Vietnamese/Korean/Japanese, role+cuisine+search, filtered empty/clear, load more 20→40 unique, focus trap, Escape restores opener, no horizontal overflow or browser errors. Screenshots inspected locally. This is NOT staging smoke.

## Release blockers and next action

PR #9 has no hosted CI while based on PR #8's branch; `ci.yml` only triggers PRs
targeting main/master. Merge PR #8 via normal PR flow, wait for its exact-main
CI, retarget PR #9 to main, verify exact-head hosted CI, zero unresolved review
threads and mergeability, then merge PR #9 normally and verify exact-main CI.
No direct push/force push to main. Staging config exists, but Cloudflare
credentials are absent here and GitHub environment secrets are unreadable
(403), so the target identity, pre-ledger, bookmark and aggregate baseline
cannot be checked. 0039 ledger before/after unknown; staging migration/deploy/
flag-on smoke NOT performed. After authorized staging access, follow
`DEPLOYMENT.md`: verify staging target and ledger, use reviewed migration
mechanism, inspect FK/quick check and 500 catalog, deploy certified main with
both flags OFF first, then explicitly opt in and run Manual/Assisted/Auto,
safety, shopping, legacy, T19 and UX smokes. Production authorization was not
given: `production_migration=NO`, `production_deploy=NO`,
`production_enablement=NO`.

---

# T21R-B offline semantic snapshot handoff — 2026-10-01

**State:** `T21RB_OFFLINE_TOOLING_READY`; no production row snapshot has been
captured. Implementation commit `5dd9990` on
`codex/t21rb-offline-semantic-snapshot` follows the separate T21R-A target
commit `6bcef891`. See
`recipe-catalog/T21RB_OFFLINE_SEMANTIC_SNAPSHOT_DESIGN.md` for target, capture
boundary, classification rules and unresolved consistency caveat.

**Executed:** `pnpm exec vitest run tests/unit/t21rb-v1-semantic.test.mjs`
8/8 PASS; comparator plus staging Wrangler focused rerun 40/40 PASS; local
SQLite 0038 replay through the offline CLI matched 2,702/2,702 ingredient
tuples in 500 recipes. `WRANGLER_SEND_METRICS=false pnpm check` passed types
and lint, then one staging Wrangler startup test timed out at 5 seconds while
4,897/4,898 tests passed. Controlled full Vitest rerun with `--maxWorkers=2`
passed 224 files / 4,898 tests. Migration smoke and build passed separately;
`node --check` and `git diff --check` passed. The combined check failed and
is not reported as green.

**Limits:** The tool accepts a saved five-statement local JSON input and emits
sanitized aggregate counts. The prior production artifacts contain no raw
rows. Separate D1 SELECTs and a stable migration ledger do not prove an atomic
production snapshot. The tool is not wired to a remote workflow; no production
read, mutation, repair, 0039, deploy or flag change occurred. T21G remains
`T21G_NOT_READY`.

**Next:** Independently review the offline tool and a protected runner-local
capture/consistency design, then use exact-main CI and production Environment
approval for a new read-only capture if authorized. Keep raw rows runner-local
and review only a sanitized V1-relative receipt. Do not infer repair actions
from classification counts.

---

# T21R-B protected V1 diagnostic integration handoff — 2026-10-02 JST

**State:** `T21RB_PROTECTED_INTEGRATION_PREPARED`; no production V1 snapshot
has been captured. Repository ID `1385308553` resolves to
`vn-tako4/Tako-san`; verified GitHub main and local `origin/main` are
`3e0f6531b98feb1e44743513b91aff131bbd522b`. Branch
`codex/t21rb-offline-semantic-snapshot` starts this continuation at
`8d275b5e30bc6b29a40d7747f18512a82e436a73`. Implementation checkpoint:
`90569fa6e9890403bbbf57eaecad2c6e049fd1e8`.

**Implemented:** `.github/workflows/production-d1-diagnostics.yml` performs a
second guarded five-statement catalog read and third migration-ledger read.
`scripts/t21rb-v1-production.mjs` requires complete equal captures, reviewed
0038 ledger prefix, matching order coverage and prior diagnostic, repository
and D1 identity, and the certified V1 manifest hash. It calls the offline
comparator without Cloudflare credentials and emits an allowlisted aggregate
receipt only after the workflow's final exact-main check. Raw rows and raw-row
digests are not uploaded. `scripts/t21rb-v1-semantic.mjs` rejects boolean or
whitespace-only raw ingredient fields. Tests cover drift, contradictory flags,
coverage, identity, malformed fields and output redaction. The design packet
specifies the ingredient-only and non-atomic evidence boundary.

**Executed:** `pnpm exec vitest run tests/unit/t21rb-v1-production.test.mjs
 tests/unit/t21rb-v1-semantic.test.mjs
 tests/unit/production-d1-diagnostics.test.mjs` — 3 files / 23 tests PASS.
`pnpm lint` and `pnpm typecheck` PASS. `pnpm check:migrations` PASS
(`migration-smoke=ok`); `pnpm build` PASS. `node --check` on both changed
scripts and `git diff --check` PASS. `pnpm exec vitest run --maxWorkers=2`
passed 225 files / 4,906 tests twice, including once after the implementation
commit on the frozen tree. Earlier in this continuation, an initial diagnostic
fixture mismatch caused two focused test failures; correcting the `{name,id}`
shape yielded the final 23/23. `node --test` failed because the files require
Vitest; the correct runner passed. No combined `pnpm check` result is claimed.

**Limits:** `OBSERVED_STABLE_NON_ATOMIC` means two equal observations across
separate SELECTs, not a transactionally pinned state. The receipt classifies
only the recipe ID set and V1 ingredient tuples. It does not certify recipe
order, metadata, steps, nutrition, physical line identity, live positions or
T20 hard-restriction evidence. `NOT_A_RELEASE_CERTIFICATION`,
`runtimePositionAuthority=false`, `repairAuthorized=false` and
`T21G_NOT_READY` remain explicit. Production read dispatches, SQL mutations,
restore calls, migration/0039 applies, flag changes and deploys: **0**.

**Next:** independent review of this branch, protected merge and exact-main CI,
then separately authorize a manual read-only production Environment dispatch.
Inspect the sanitized V1 receipt and plan a distinct protected row-evidence
path for unresolved occurrences before any T21G repair design. Do not infer a
repair action from counts; 0039 and production deploy remain stopped.

---

# T21R-B protected integration merge handoff — 2026-10-02 JST

**State:** `T21RB_PROTECTED_INTEGRATION_MERGED`. PR #33 merged reviewed head
`0b28b48e2fbd8f4892ddbf57ae9139d96addc0a3` into main as
`483e054b8ad5e0391aaedfcaf65343ce95949562`. PR exact-head run
`36931130799` and merge exact-main run `36931887016` both passed `validate`.
The independent read-only review found no concrete issue. See
`recipe-catalog/T21RB_PROTECTED_INTEGRATION_MERGE_RECEIPT.md` for the exact
checks and remaining evidence limits.

**Production boundary:** No D1 read dispatch, mutation, restore, 0039 apply,
flag change or deploy. The workflow is manual and retains the exact-main CI,
production Environment, account/D1 identity and ledger guards. Two matching
five-statement observations are `OBSERVED_STABLE_NON_ATOMIC`, not a release
certification. Only recipe ID set and V1 ingredient tuples are compared.
`T21G_NOT_READY`; `repairAuthorized=false`.

**Next:** operator separately authorizes a manual read-only diagnostic at an
exact current-main SHA. Review the sanitized V1 receipt and unresolved rows
before a distinct protected row-evidence path. Do not infer repair from counts;
0039 and production deploy stay stopped.
