# T20 — Release và rollback packet cho operator review

Trạng thái: `T20_STAGING_CERTIFICATION_REQUIRED` / `T20_PRODUCTION_READINESS_BLOCKED`.
Ngày: 2026-10-09 JST. Implementation và final-head CI được ghi trong checkpoint
cuối `T20_TAKEOVER_AUDIT.md` và PR. Packet này không cấp quyền deploy.

## Source và baseline đang chạy

Repo `vn-tak/Tako-san` ID1385308553; base/current-main đã xác minh:
`6f6eaaab518cf2430de225d0be73d695b40706e4`. Production Deploy37789673028 SUCCESS;
Worker `f92df570-6cb0-43de-bfa6-a4c7bd7f07d8`; origin
`https://frigo.tungjpstore.net`. Release catalog `rel-bd00a4f53fcaeee4`, D1500,
schema39 đã applied theo receipt được duyệt; T20false. Staging cùng base,
D1/500/T20true (`37782346206`). Bằng chứng là baseline, không phải certification
cho head mới. Main thay đổi phải đối chiếu lại fingerprint/CI và review.

## Surface thay đổi và rollback compatibility

- UI xử lý pending/lỗi/missing composition rõ ràng; chỉ404 server-off fallbackV1.
  Dùng cùng query canonical giữa meal page và composer, tránh thêm fetch khi mount.
- Assisted regenerate_unlocked thêm preview/apply qua API có sẵn; không ghi khi
  generate, shared revision/locks/proposal revalidation không đổi.
- Shopping/week ghi rõ món không theo dõi, không thêm quantity calculator;
  touch targets T20 tối thiểu44px, validation copy vi/en qua allowlist.
- Production planner UI/Worker derive từ normalized T20 release decision:
  T20true → plannertrue; T20false → plannerfalse như baseline. Staging planner
  vẫn true độc lập. Pre-upload guard chặn T20true thiếu bất kỳ prerequisite.
- Không thay config Wrangler đã commit, bindings, secrets, migration, T19/T21
  catalog routing, ranking weights, physical stock, auth hoặc payment code.

## Điều kiện trước yêu cầu staging deploy

1. Reviewer độc lập review final PR head, gồm workflow wiring. Agent không tự
   approve/merge. Operator merge qua protection, pin exact main fullSHA sau merge.
2. CI main-push trên chính SHA đó phải PASS mọi gate. PR CI/old CI không thay thế.
3. Kiểm tra staging identity, isolated bindings, ledger0039, integrity/catalog500,
   release fingerprint và no fallback bằng workflow chỉ đọc đã được cho phép.
   Nếu drift, dừng release; không tự recovery/import/reapply0039.
4. Operator review kế hoạch: Deploy staging từ SHA đã pin, giữ D1/cutover như
   baseline, server/UI T20true, plannertrue. Đúng manifest/build-record.
5. Operator phê duyệt riêng lượt staging trước dispatch. Task này không dispatch.

## Staging certification còn phải thực hiện

Dùng đăng ký/OTP/session bình thường, không dùng preview account/auth bypass.
Trên exact source: Manual4 món/save-reload/reorder/role/swap/remove; Assisted
complete và regenerate_unlocked preview-no-write/apply giữ locks; Auto3 options;
weekly schedule và shopping1 projected inventory; hard slot10/20 và household
forbidden/dietary/unknown-hard-nutrition reject422/no writes; D1-only picker→meal→
detail/cooking read; stale writes409/reload; cross-household read/write/apply
404/403 không leak; mobile390/tablet768/desktop1280, keyboard/focus/axe.

Ghi deployment source/Worker version, manifest flags/build record, identity hashes,
0039 ledger/integrity, served recipe fingerprint/hydration/order/media proof,
request/status/plan revisions/locks, inventory events before-after và bounded
smoke-window logs không có unexplained500. Không chỉ dùng screenshot/count500.
Raw cookies/accounts/logs giữ private ignored, publish aggregate receipt.

## Điều kiện production

Chỉ sau staging receipt PASS trên source đã review và operator phê duyệt riêng:
exact-main CI, release manifest/fingerprint, deployed previous-Worker identity,
ledger0039 và integrity lại hợp lệ; T20/planner UI/Worker agree; không P0/P1.
Operator dispatch Deploy production theo workflow hiện có và normal Environment
review `vn-taphoanhatung`. Không bypass, không reuse approval nếu source đổi.
Không reapply0039, không import/recovery và không canary authority cutover T19.
D1 catalog đã full; giữ approved D1/cutover state. Bước T20 bật là rollout riêng.

Post-deploy phải xác nhận exact source/version, paired flags thực, planner routes
và UI entrypoint, catalog authority500/no fallback, readiness, cùng bounded
functional matrix phù hợp và logs. Production no-real-users không thay human
gates, không cho phép xoá composition records hay sửa inventory bằng shortcut.

## Rollback dự kiến, operator thực hiện

- Tắt paired T20 flags bằng release decision false trên source đã review; production
  planner/UI cũng false như baseline; staging planner vẫn true với T20false.
  Manifest và build-record phải khớp Worker vars; chỉ qua normal workflow review.
- Nếu phải rollback code, deploy source rollback được review qua workflow; base
  `6f6eaaab…` tương thích additive schema39. Xác nhận pipeline/manifest sử dụng
  state D1 catalog hiện tại thay vì tự phục hồi catalog/static.
- Giữ0039 và toàn bộ composition/role rows. Không DROP, xoá records, sửa migration
  ledger hoặc physical stock. V1 fallback dùng stored anchors/shopping V1; records
  V2 còn nguyên để re-enable. UI/error-state revert đơn lẻ không đổi database.
- Verify health/source/version, auth/tenancy, V1 planner/shopping (staging), T20
  routes404/off, expected production planner-off, D1 authority/fingerprint/media,
  no unexpected500 và no new composition/inventory mutation.
- Nếu lỗi hard restrictions/tenancy/inventory/lost update, operator dừng enablement,
  thu thập bounded evidence, disable flags rồi review repair; không tự replay writes.

## Tái lập local

Node>=22.13 (đã dùng24.16.0), pnpm10, sqlite3. `pnpm check` là full gate.
Browser dùng `pnpm exec playwright test --config playwright.t20.config.ts` (T20on),
`T20_FLAG_DRILL=off ...` và `T20_FLAG_DRILL=mismatch ...` (cùng command).
Chạy tuần tự: Vite previews dùng chung dependency optimizer, không chạy hai flag
preview song song trên cùng checkout. Port defaults3100/8890; configs validate
local ports và không reuse server. AI mock, provider fetch blocked, SQLite memory;
không phải staging/production certification. Benchmark: `node scripts/t20-benchmark.mjs`;
Worker metrics qua `T20_BENCHMARK_OUT=<ignored path> pnpm exec vitest run tests/integration/t20-performance.test.ts`.
Tooling audit high/critical hiện hữu cần maintenance review riêng; không được coi
`pnpm check` PASS là đã giải quyết dependency security hoặc hosted certification.

## Chứng nhận engineering và identity đã pin — 2026-10-09

Implementation `8592fa6a35890b54833f81282434101ada1e7694`; final PR head thêm
documentation checkpoint. `pnpm check` local PASS258files/6337tests, lint,
typecheck, migration smoke và build. Browser45PASS = on39/off3/mismatch3;
production on/off builds ghi pair planner/T20 đúng và CLI guards PASS. Build
manifest fixtures là local test evidence, không phải approved release manifest.
Hosted CI final head được ghi ở PR; sau merge vẫn cần exact-main CI riêng.

Receipt production37789673028 ghi served recipe fingerprint
`f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37` và
migration-tree SHA256 `321e59c716a6eb16b2375ae878b81c23fe0917ac1b25c53499b65afb8231f52b`.
Không migration change trong PR. So sánh lại cả ledger, tree hash và runtime
fingerprint tại reviewed operator gate; receipt cũ không cấp quyền deploy mới.

Input plan cho operator review sau merge: exact `ref` và reviewed `hardened_sha`,
`recipe_catalog_mode=d1`, percent0, rollback confirmationfalse để giữ baseline
D1 authority; staging T20true và paired plannertrue. Production T20true chỉ sau
staging certified và authorization riêng; `confirm_production=true`, Environment
review bình thường. Rollback T20false giữ catalog d1/0/cutovertrue, composition
records/schema39 giữ nguyên; production planner/UI trở vềfalse như baseline.
Task takeover không dispatch bất kỳ input nào trong packet này.

Final engineering source sau own-review cache404:
`12fe6fc44370188d02812f449cee4052dbb57364`. Local6338tests/258files full gate và
browser48PASS(on42/off3/mismatch3), true/false production builds và actual guards
PASS. PR60 final head gồm docs checkpoint; latest hosted CI/reviewer phải kiểm tra
head cuối, không dùng CI37841636469 của previous318b10e để authorize release.
PR: https://github.com/vn-tak/Tako-san/pull/60. Cached404 rollback giờ trở về V1;
không xoá cache/database composition records. Operator gates phía trên giữ nguyên.

## Đính chính input rollout khi thực thi — 2026-10-09

PR60 đã merge tại `5dfab234247dcbee1339decf39b6a7d999869c11` và CI main-push
37845102901 PASS sau operator authorization. Gate runtime đang yêu cầu SHA mới
restart shadow rồi1/5/25/D1; input d1 trực tiếp trong packet cũ sẽ bị từ chối.
Không sửa/weaken guard để bỏ bước này. Kế hoạch chứng nhận và staging-only fixture
được mô tả tại `T20_STAGING_CERTIFICATION.md`. SHA mới sau tooling phải có CI main
riêng và toàn bộ artifact/hosted journeys gắn với SHA đó trước production.
