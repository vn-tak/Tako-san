# T20 — Hoàn thiện Meal Composition V2

## Trạng thái hiện hành — 2026-10-09 JST

`T20_PRODUCTION_ROLLOUT_COMPLETE_FUNCTIONAL_SMOKE_PASS`; source `27d47b056455a57df811199cd7e9c32a84cbffe5`.
Staging năm stage/45 hosted journeys/bốn stock-event audits PASS;
production shadow → 1% → 5% → 25% → D1 đều PASS với normal Environment review.
T20/planner paired true, catalog toàn bộ D1, ledger 39; không replay migration.

Production smoke verified năm journeys: initial bốn PASS + một local observer
recursion failure trước concurrency race, sau đó targeted concurrency 1/1 PASS
trên đúng plan chưa sửa. Original evidence/checksums giữ nguyên, helper đã có
regression RED/GREEN; automatic retries 0, không replay bốn PASS.
Năm HTTP windows không có unexplained Worker 5xx; stock HTTP snapshots khớp
với item count 0. Production event ledger không được query.

Readiness window 6 observations/301,536s PASS, HTTP 200 và source/D1/no fallback
khớp; `degraded` chỉ bởi `CONFIG_RECIPE_CATALOG_D1_AUTHORITY` hiện hữu.
Đây là public readiness evidence, không phải full Worker log/error-rate audit.
Whole-week V2 Auto và optional extensions giữ phân loại trong takeover audit.

Báo cáo hiện hành: [rollout certification](../T20_ROLLOUT_CERTIFICATION_20261009.md)
và [public aggregate](../T20_PRODUCTION_EVIDENCE_20261009.json).
PR #63 dành cho documentation/evidence, chưa merge; kiểm tra CI đúng final head.
Không dispatch production thêm hoặc replay certified journeys/0039/recovery/scan.
Rollback paired flags theo workflow/reviewer chuẩn, giữ source/catalog state
được transition guard chấp nhận, schema 0039 và composition records.

---

## Hồ sơ trước rollout — giữ làm lịch sử

Trạng thái: `T20_CODE_COMPLETE_REVIEW_REQUIRED` / `T20_TEST_VERIFIED` (local),
`T20_STAGING_CERTIFICATION_REQUIRED` / `T20_PRODUCTION_READINESS_BLOCKED`.
Checkpoint 2026-10-09 JST. Chỉ thị takeover thay kế hoạch merge/deploy tự động cũ.

## Phạm vi và thẩm quyền

Repo `vn-tak/Tako-san`, ID `1385308553`; base/main đã xác minh
`6f6eaaab518cf2430de225d0be73d695b40706e4`; nhánh
`codex/t20-production-completion`; implementation
`12fe6fc44370188d02812f449cee4052dbb57364`.
Được sửa code/test/docs, chạy local, commit/push và mở PR. Reviewer độc lập phải
kiểm tra final head gồm docs sau implementation. Không tự merge/approve, dispatch
protected workflow, deploy, migrate, đổi staging/production flags/secrets/data.
Production baseline T20false; staging true. Không recovery/0039/AI scan replay;
không sửa PayOS, auth ngoài scope hoặc T19/T21 authority/applied migrations.

## Đã hoàn tất

1. Source/API/persistence/frontend/shopping audit và ma trận28 capability,
   baseline thực và severity/deferred classification trong `../T20_TAKEOVER_AUDIT.md`.
2. P1 pending/500/offline/missing composition: loading/error/retry rõ, chặn V1
   anchor stale; giữ404 server-off/familyV1 và unknown-slot unavailable.
3. P1 rollout: production planner Worker/build derive từ normalized T20 decision;
   pre-upload guard đòi prerequisite cả production/staging. Runtime không đổi.
4. Assisted regenerate_unlocked preview/apply qua existing API giữ locks/revision.
   Copy6 typed validation vi/en; week/shopping untracked explicit; touch≥44px.
5. Full local `pnpm check` PASS:258files/6338tests, lint/typecheck/migration/build.
   Browser on42/off3/mismatch3 PASS sequential tại390/768/1280; real flag on/off
   builds + CLI guard PASS. Benchmark domain/Worker và dependency audit ghi đủ.
6. ADR-043, canonical docs và `../T20_RELEASE_READINESS.md` ghi readiness/rollback.
   Hosted exact-final-head CI được ghi tại PR; không dùng historical CI thay thế.

## Ranh giới hoàn thành

Local core journeys Manual/Assisted/Auto per-slot, week/save/reload, shopping,
safety/tenancy/revision/flags/mobile verified. Không known unresolved P0/P1
implementation sau own-review, chưa có independent review hay staging receipt
cho source mới. Production T20 chưa enabled; không claim T20_COMPLETE.

Whole-week V2 Auto là OPTIONAL_EXTENSION: tuần hiện dùng V1 anchors + V2 mỗi slot,
journey7 ngày giữ identity các ngày khác đã verified. Phase riêng nếu mở rộng,
phải có shared projection/locks/revision, không nối7 generation calls. Leftovers,
per-component servings, role-curation, drag-and-drop và real-price scoring được
phân loại trong audit; không thiếu core capability để sửa bằng schema shortcut.

## Evidence và next action

Node24.16.0/pnpm10.33.2. Ignored `.wrangler/t20-completion/20261008/` có actual logs.
Baseline6315PASS/1Wrangler timeout, isolated32PASS; final6338PASS/0FAIL không đổi
assertions/timeouts. Remote schema/Week parity không chạy. Full dependency audit
2critical/16high trong tooling dev hiện hữu; prod audit0high/critical,2moderate;
lockfile/deps không đổi, cần maintenance review riêng.

Reviewer kiểm tra final PR head/hosted validate, sau đó operator merge/pin
exact-mainCI và phê duyệt kế hoạch staging riêng. A–I normal-session staging
certification phải PASS trước production enablement/operator approval. Packet
chứa identity/schema/fingerprint/flags và rollback giữ composition records.

Own-review bổ sung đã sửa cached404 rollback: week warm V2 cache trở về V1 khi
backend tắt; unit regression FAIL trước/PASS23/23 sau, browser3widths PASS.
PR review: https://github.com/vn-tak/Tako-san/pull/60.

## Checkpoint vận hành hiện hành — 2026-10-09 JST

Các nhãn pending local/review/staging phía trên là lịch sử. Operator đã duyệt
merge/rollout PR60 và PR62 theo gates chuẩn. Source final
`27d47b056455a57df811199cd7e9c32a84cbffe5`, approved head8b7b254d;
CI main37853046693 SUCCESS259files/6365tests. Staging readiness37853983168,
shadow→1→5→25→D1,45/45hosted browser và bốnstock/event audits đều PASS;
`STAGING_CERTIFIED`. Chi tiết và rollout table trong
`../T20_ROLLOUT_CERTIFICATION_20261009.md`.

Production shadow37858608953 đã dispatch, waiting Environment reviewer
vn-taphoanhatung; CLIvn-tak không được duyệt. Chưa bật/certify T20 production;
source vẫn pin, không merge documentation checkpoint làm đổi main giữa chuỗi.
Sau reviewer approval collect artifact/live proof, tiếp tục1/5/25/D1 lần lượt
với approval mỗi run; normal registered production smoke còn phải chạy.
Hai cửa sổ Chromium login đã timeout, chưa có private production session.
Không replay fixtures/journeys certified hoặc reapply0039/failed AI scan.

## Production shadow continuation — 2026-10-09 JST

Source27d47b05/main vẫn pin. Shadow37858608953 đã normalapproved/release/artifact/
liveproofPASS,pairedT20/plannertrue,ledger39/catalog500/hydration0/media500/binding
match. Run1%37922994678 đã approved riêng bởi vn-taphoanhatung và đang chạy.
Registered normal session đã capture; actualproduction5journeys0executed,
chỉ chạy sauchain1/5/25/D1proofPASS. Xem report hiện hành và ignoredactive-turn;
không replaycertifiedstaging/0039/failedscan hoặc mergePR63 giữarollout.
