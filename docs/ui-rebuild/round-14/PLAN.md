# UI14 - Frontend delivery and motion

2026-10-11 JST. Canonical vn-tak/Tako-san, checkout Tako-san-ui-rebuild,
codex/ui-rebuild-foundation. Base `f3a09f2a7beb548fbd4bc9ef8ae932a092dd3827`.
Initial worktree clean, UI13 checkpoint/source verified. User requested continuation.

## Outcome and boundaries

A reproducible local production-build report for Home -> discovery -> detail:
cold/warm requests and transfer, fonts/images/chunks, ready times, layout shifts,
long tasks and normal/reduced motion. Rank findings and implement at most one
measured frontend delivery/presentation improvement after ADR-057. Preserve UI07
identity/UI11 shell/UI12 media and all domain callbacks/guards.

No services/stores/backend/packages/schema/migrations/public/dependency/payment/
auth protocol/production config changes. App routes and guard authority unchanged.
No image promotion, remote DB/media operation, push/PR/merge/deploy. Local lab
metrics do not certify hosted CWV, devices, Safari or real-user experience.

## Ordered execution

1. Inspect actual source graph/build/maps and existing fixture authority. DONE:
   entry includes offline recipe/domain modules and eager motion; routes are lazy.
2. DONE: build exact baseline, pin source/build bytes, serve on loopback with real Worker
   and synthetic in-memory fixture. Separate fixture bootstrap writes from measured
   read journeys. Measure cold/warm and responsive/motion states before choosing fix.
3. DONE: rank actual findings; ADR-057 before one bounded fix. Measure same build/fixture/
   browser conditions after; reject claims based on gzip alone or dev HMR numbers.
4. DONE: validate affected interactions, focus/media/overflow/axe/text/short states and
   configured gates. Freeze and compare protected/public/source records. Keep failed
   attempts and honest limitations in evidence.
5. Update CURRENT_STATE/TASK_BOARD/HANDOFF/ADR and next packet. Local implementation
   commit -> sequential Git-object verification -> documentation checkpoint naming
   verified implementation, not itself. Stop owned previews and leave clean tree.

## Acceptance and risk handling

Cold starts use a fresh context/cache; warm cache must actually remain enabled
(browser request routing can disable it). CDP/resource cache receipts distinguish
transfer from decoded bytes. Timings repeated under explicitly recorded conditions,
not promoted to field INP/LCP. Content-ready waits use actual selectors/query state,
not networkidle or arbitrary sleep. Layout shifts with recent input kept separately.
Before/after fixture inventory must match, measured domain writes zero. Synthetic
onboarding/session setup noted separately. UI data remain household-authorized.

Current unknown photo rights remain independent of frontend delivery work. Eager
offline catalog/service authority may be a larger bottleneck, but is protected in
this packet; report evidence for a distinct task instead of changing it silently.
A performance fix must preserve meaningful visual feedback and reduced motion;
if no safe fix improves actual measurements, finish a complete audit with that result.

## Completed checkpoint

Full288files/6742testsPASS; 50settled snapshots/5journeys, four actual legacy
journeys, two baseline frame probes, short-focus supplemental. One delivery fix
reduces cold JS transfer17.3–18.4%. Protected/App/helpers/public proof preserved.
First commit8f486cd retained after a whitespace-check shell masking failure; fixed
log text plus exact raw gzip in follow-up, no code changes or amend/reset.
Verified implementation `7ee28bf48974e8faf52f78caa2b9a5b979953768`;
VERIFIED: 396 source / 139 evidence / 257 public records, 515 unique blobs; 41 log receipts / 6 raw gzip. Manifest 97427 bytes, SHA256 1b9065bead923ee54752980cd7553a5e1812a527adb0b7f7593cc1bd7d7b9870; round-14/GIT_VERIFICATION.md. Four owned portsclosed; documentation checkpoint follows.
UI15 ready only; remaining readability/device/hosted/photo/brand limits explicit.
