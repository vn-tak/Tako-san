# UI14 - Frontend delivery and motion audit

Status: READY_FOR_LOCAL_AUDIT. No UI14 runtime in UI13.
Previous UI13 implementation: `UI13_IMPLEMENTATION_PENDING_VERIFICATION`.
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
