# UI14 - Frontend delivery and motion audit

Status: UI14_LOCAL_VERIFIED_REVIEW_REQUIRED. Bounded runtime/tooling complete locally.
Previous UI13 implementation: `021220bbcb883360ba79b8101ff9586a67ebc4ae`.
Canonical vn-tak/Tako-san, Tako-san-ui-rebuild, codex/ui-rebuild-foundation.
Read current state, UI13 receipt, UI12 recipe/shell contracts and UI07 brand kit.

## Outcome

Measure the next frontend bottleneck in Home/discovery/detail and separate real
render/asset/motion issues from subjective polish. Produce a useful local cold/warm
load report and choose at most one measured presentation/delivery fix. No image
promotion is authorized by UI13 review-board completion. Owner source/rights
approval stays a separate input; do not block independent frontend work on it.

## Sequence

1. Inspect actual source/bundles and preserved routes/guards; map eager versus
   lazy imports, font/image requests and visual states. UI13 is an artifact-only
   change; prior app tests/screens are history until independently measured.
2. Use isolated local preview/build against synthetic household data. Measure
   cold/warm transfer/requests, route transitions, layout shifts and long tasks
   for Home→discovery→detail. Sample320/390/768/1440, textx2/short and reduced/normal
   motion. Never describe local lab values as hosted CWV or user traffic.
3. Rank observed issues. Record ADR-057 before any justified bounded change.
   Preserve callbacks, inventory truth, auth/tenancy and resolver fallback. No
   speculative framework migration, dependency bump or new brand/photo direction.
4. Verify affected interaction/geometry/behavior and actual before/after measures.
   Meaningful tests only when behavior changes; configured gates, source/assets/
   protected proof and failure logs. Keep unsolved server/device risks explicit.
5. Update state/board/handoff; local commit, Git-object verification, following
   documentation checkpoint. Prepare reviewable result before any release request.

Protected: payments/PayOS/billing/checkout/auth protocol/backend/packages/schema/
migrations/services/stores/dependencies/public masters/production flags/config.
App routes/guards/navigation authority must retain exact behavior. No remote DB/
media write, credentials, external messages, push/PR/merge/deploy. Actual photo
variants require documented permission and a distinct promotion packet. Device/
Safari/nativezoom/keyboard/screenreader/usability/hosted release remain separate.

## Actual local result (2026-10-11)

ADR-057 before runtime; provider import split + deferred legacy indicator with
static fallback/unmount fence. Entry raw -27.5%, three cold route JS -17.3–18.4%.
18 samples per stage; 288 files / 6,742 tests PASS; 50 settled snapshots / 5 journeys,
4 actual legacy journeys, 2 baseline motion probes and short-focus supplemental.
396 frozen records; protected/public unchanged, App import only, existing helper
source exact. Four ports closed. Fresh audit failures/41 advisories and Lighthouse
unavailability retained. Mid-fade contrast and cramped short-screen reading space
remain explicit. Implementation `IMPLEMENTATION_PENDING_GIT_VERIFICATION`;
sequential receipt and docs checkpoint follow. Next UI15 ready only.
