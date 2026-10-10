# UI13 - Tako-san media review và provenance

Status: UI13_LOCAL_VERIFIED_REVIEW_REQUIRED. Standalone local board/tooling completed.
Implementation: `021220bbcb883360ba79b8101ff9586a67ebc4ae`.
Read round-13 FOUNDATION/VERIFICATION/GIT_VERIFICATION for final evidence.
Previous implementation: `03e16c78850b061784dc2e9a01323bd7e74b65f3`.
Read round-12 FOUNDATION/VERIFICATION/GIT_VERIFICATION and evidence/media-plan.json.
Canonical vn-tak/Tako-san, checkout Tako-san-ui-rebuild, codex/ui-rebuild-foundation.

## Outcome

Tạo một bộ review ảnh local có thể dùng để ra quyết định cho24món discovery đầu
và8asset local. Đây là bước giải quyết khoảng trống nội dung thương hiệu sau UI12;
không tự promote pending media hoặc tuyên bố ảnh đã có license. UI07identity và
UI11shell/recipe lifecycle UI12 giữ nguyên trừ bounded change có ADR mới.

## Work order

1. Read actual tree/current packet and recheck demand/mapping. Separate local
   versus production, mapping-policy versus subject/license approval. Do not
   fetch credentialed media or generate a whole catalog to fill pending states.
2. Build a standalone local HTML review board or repo-native preview artifact:
   full Vietnamese title/ID/slug, current permitted asset/missing, creator/source/
   license status, demand reason, responsive card/hero crops and required subject.
   Show unknown explicitly; a selected image/hash does not become approved.
3. Provide structured review records and a validation command for unique IDs,
   safe source paths, required provenance fields and explicit approval state.
   Derivatives only for assets with documented permission. Keep original hashes
   and distinguish owner-reviewed, candidate and rejected states.
4. Inspect mobile/desktop/text enlargement and the mixed photo/missing recipe
   grid. If runtime presentation changes are justified, record ADR-056 before
   editing and run affected meaningful tests/browser/gates. Artifact-only work
   does not require inventing irrelevant unit tests or weakening existing gates.
5. Record owner decision needed for each unsupported source. Prepare a concrete
   reviewed selection; any mapping promotion, remote upload or hosted release
   remains a separate authorized packet. Update state/board/handoff, coherent
   local commit, Git-blob verification and documentation checkpoint.

## Acceptance and boundaries

24observed demand records and8local asset hashes trace back to receipts; pending
license/subject/crop is visibly pending; previews do not silently bypass resolver.
No invented traffic statistics, nutrition/allergy/stock facts or photography rights.
No external message, remote DB/media operation or unapproved new brand direction.
Payment/PayOS/billing/checkout/auth protocol/backend/packages/schema/migrations/
services/stores/dependencies/public masters/production flags/config remain protected.
No push/PR/merge/deploy. Real device/Safari/native zoom/screen reader/usability/CWV
and separate domain outbox/queued receipt limitations stay explicit.

## Local completion

ADR-056 precedes implementation. Fresh mapping matches UI12, all eight originals
byte-verified. 24 initial reviews pending; four current photos and 20 missing
remain separate from candidates. All source/rights unknown. Shared validator,
atomic import/export, 3 MiB maximum valid-draft roundtrip, late-event fencing and
actual responsive/keyboard/direct-file checks complete. PASS exit 0: 287 files / 6,737 tests, Vitest 357.58s; typecheck/full lint/local migration smoke/Vite 3.06s/Worker TypeScript PASS; remote gates skipped.
No production app/domain/public/remote operation. Next UI14 local performance and
motion audit; human image/brand/device approval remains an independent input.
