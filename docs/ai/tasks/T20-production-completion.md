# T20 — Hoàn thiện Meal Composition V2

Trạng thái: `T20_CODE_COMPLETE_REVIEW_REQUIRED` / `T20_TEST_VERIFIED` (local),
`T20_STAGING_CERTIFICATION_REQUIRED` / `T20_PRODUCTION_READINESS_BLOCKED`.
Checkpoint 2026-10-09 JST. Chỉ thị takeover thay kế hoạch merge/deploy tự động cũ.

## Phạm vi và thẩm quyền

Repo `vn-tak/Tako-san`, ID `1385308553`; base/main đã xác minh
`6f6eaaab518cf2430de225d0be73d695b40706e4`; nhánh
`codex/t20-production-completion`; implementation
`8592fa6a35890b54833f81282434101ada1e7694`.
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
5. Full local `pnpm check` PASS:258files/6337tests, lint/typecheck/migration/build.
   Browser on39/off3/mismatch3 PASS sequential tại390/768/1280; real flag on/off
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
Baseline6315PASS/1Wrangler timeout, isolated32PASS; final6337PASS/0FAIL không đổi
assertions/timeouts. Remote schema/Week parity không chạy. Full dependency audit
2critical/16high trong tooling dev hiện hữu; prod audit0high/critical,2moderate;
lockfile/deps không đổi, cần maintenance review riêng.

Reviewer kiểm tra final PR head/hosted validate, sau đó operator merge/pin
exact-mainCI và phê duyệt kế hoạch staging riêng. A–I normal-session staging
certification phải PASS trước production enablement/operator approval. Packet
chứa identity/schema/fingerprint/flags và rollback giữ composition records.
