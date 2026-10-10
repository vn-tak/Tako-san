# UI15 - Short viewport and motion readability

Status: READY_FOR_LOCAL_AUDIT. UI14 completed locally; no UI15 runtime in UI14.
Canonical vn-tak/Tako-san, Tako-san-ui-rebuild, codex/ui-rebuild-foundation.
Read UI14 receipt/analysis and UI07brand/UI11shell/UI12recipe contracts.

## Concrete problem

UI14 combined320×420 computed textx2 shows fixed two-row nav237.375px and static
header136.1875px. Content remains scrollable and tabs focus above nav, but the
reading area is cramped. Home normal opacity fade has transient low contrast;
settled50snapshots pass axe. Legacy reduced motion contains a single projection
frame, same before/after. Generic geometry PASS does not establish usability.

## Outcome and sequence

1. Reproduce actual UI14 layouts on current exact source; baseline Home/discovery/
   detail and affected shell at320×420textx2,390×420,768×420, normal tall widths and
   native keyboard navigation. Measure content area, nav/header ownership, focus
   and motion frames. Do not infer device/browser behavior from synthetic text alone.
2. Rank failures; record ADR-058 before changes. Choose a coherent frontend
   presentation solution that keeps five roots/Scan access, full labels, visible
   current state, focus and UI07visual identity. Prefer intrinsic CSS/layout;
   avoid new JS measurement machinery unless evidence requires it.
3. Evaluate primary content fade/contrast across its duration and reduced policy;
   decide with measurements, avoid replacing it with generic animation everywhere.
   New motion must be meaningful and interruptible; never block navigation/data.
4. Verify tall/short/text/reduced/normal, scrolling/keyboard/Back/dialog/media and
   applicable axe, representative existing families, both Planner flag modes when
   affected. Read journeys must keep inventory equal and zero domain writes.
5. Required configured gates, source/public/protected proof, success/failure
   evidence, state/board/handoff/ADR. Local implementation commit → sequential Git
   verification → documentation checkpoint naming implementation, not itself.

## Boundaries

Protect payment/PayOS/auth/backend/packages/schema/migrations/services/stores,
public masters/fonts/dependencies/config, routes/guards/API/callback semantics.
No new brand direction/assets/photo promotion; current source/rights review stays
independent. No remote DB/media/push/PR/merge/deploy. Domain catalog lazy fallback,
hosted cache/preload/CWV and production auth require distinct delivery packets.
Device/Safari/nativezoom/screenreader/virtualkeyboard and owner usability/brand
approval remain separate. Successful tests do not complete the entire rebuild.
