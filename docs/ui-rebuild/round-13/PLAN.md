# UI13 - Local media review board

2026-10-11 JST. Canonical vn-tak/Tako-san, Tako-san-ui-rebuild,
codex/ui-rebuild-foundation. Base `5da802735c318c56505bed85a133b049728afb39` (filled before code).
ADR-056 recorded before implementation. User requested continuation.

## Deliverable and assumptions

A useful standalone HTML board with 24 pinned observed recipe records/eight local
asset originals, current resolver versus proposed candidate, responsive crops,
source/creator/rights/subject/crop/reviewer notes, filters and JSON draft roundtrip.
Reuse UI07 identity. Local observations are not production analytics. No existing
license proof found; all rights remain unknown until a human supplies evidence.

## Ordered execution

1. Read checkpoint/source/policy/assets; fresh local media audit, verify hashes
   and distinguish display policy from photo rights. DONE: fresh report matches UI12.
2. Pin dataset/briefs and implement deterministic generator, shared structural
   validator and standalone review UI. DONE: candidate preview never changes live resolver.
3. Validate malformed/duplicate/cross-dataset/path/evidence claims; browser full
   width/text/short/keyboard/filter/dialog/import/export/error/focus matrix. DONE;
   final import-cap roundtrip correction passed 33 snapshots/11 groups + seven supplemental checks.
4. Run configured local gates and fresh guideline review. Verify runtime/public
   bytes unchanged, archive accepted/failed logs/screens and evidence manifest. DONE;
   final full check passed after the cap correction, all 383 frozen records match.
5. Update state/ADR/board/handoff; DONE: local implementation `021220bbcb883360ba79b8101ff9586a67ebc4ae`,
   383 source / 263 evidence / 494 unique blobs verified, documentation checkpoint.
   No remote operation.

## Observable acceptance and limits

24 unique recipes and 8 byte-verified originals. Current 4 permitted photos/20 missing
remain distinct from proposed candidates. Draft schema rejects unsafe IDs/paths,
missing/duplicate/cross-dataset records and incomplete owner-reviewed claims;
unknown source/license remains visible. Structural success is not licensing proof.
Filter URL/deep link, reset, focus trap/Escape/return, import atomicity and JSON
roundtrip work; zero overflow/axe/brokenimage/pageerror in accepted samples.
Computed text enlargement/shortscreens are synthetic; device/Safari/nativezoom/
screenreader/usability/CWV/hosted/brand approval remain outside this artifact.
No public derivatives, new bitmap, dependency, protected domain/config change,
remote fetch/upload/write, push/PR/merge/deploy. No user decision blocks creating
this concrete board; actual owner approval is a later input to the review records.

## Closing correction

A concrete roundtrip defect was found during final review: valid complete notes
could export beyond the 256 KB import cap. The bound is now 3 MiB, enough for
maximum field lengths with JSON escape expansion. Meaningful maximum-length
roundtrip/oversized atomicity checks added; final full/local/browser gates rerun.

All final local gates passed. Implementation `021220bbcb883360ba79b8101ff9586a67ebc4ae`
verified against 383 source records / 263 evidence payloads / 494 unique blobs.
Documentation checkpoint records the verified implementation, not its own hash.
