# UI08 - Account and entry presentation

Authorization: user continues the Tako-san rebuild, 2026-10-10 JST.
Canonical vn-tak/Tako-san; branch codex/ui-rebuild-foundation.
Base 7f82edca63353a10b4f7b2919026c12b65d44963. ADR-051.
Status: UI08_LOCAL_VERIFIED_REVIEW_REQUIRED.
Full277files/6588tests PASS; focused121; recovery130; browser106checks/107PNG/
13journeys.95frozen hashes, runtime92unchanged across recovery. Reports round-8
FOUNDATION/VERIFICATION; implementation hash follows after Git-object verification.
Owner/device/remaining screens/hosted/release remain.

## Outcome and scope

Extend the established UI07 digital direction to /me, /me/preferences,
/me/household, /settings/app, /settings/planning, /settings/notifications,
/settings/privacy, /notifications and their existing redirects; landing,
auth presentation, three onboarding steps and route loading fallback.
Shared account chrome uses KitchenHeader and one readable content column.
Profile groups household/food and application links. Entry explains the real
scan -> review -> inventory -> meal flow without instant/accuracy guarantees.
No new mascot pose: use existing code-native symbol and useful task icons.

Preserve AuthPage state machine, cookie/session/CSRF/transfer/OTP/Google/Turnstile
contracts, unrelated App guards, onboarding request/completion/navigation (routing
addendum below), preference
wire fields and keys, Week and inventory authority. Preserve the existing Plus
link JSX/target and logout dialog; no payment routes/components are edited.
No Worker/service/schema/dependency/config/flag/production/remote change.
Legacy Week, ingredient detail/reconciliation, global errors, final mascot system
and device/owner/release review are explicitly subsequent packets.

## Evidence and decisions

Source shows 10-12px descriptions and truncating profile links; app settings
promises universal offline use; landing guarantees instant/precise AI. Notification
switches are only local saved intent: no caller consumes frigo_notify_prefs_;
remove scheduled/delivery claims. Family/data unavailable copy exposes internal
API implementation to users. Present capabilities and limits in plain language.
Privacy cannot guarantee no personal content in user-submitted scan images.

Use scoped account/entry CSS; retain existing primitives/handlers instead of a
second form system. Auth presentation may change layout/assets/classes only;
AuthPage and security modules remain byte-identical. Form controls >=48px and
inputs >=16px; text wraps and actions grow with content; switch hit areas survive
narrow/enlarged layouts. Existing selection and reduced-motion semantics remain.

## Sequence and acceptance

1. Inventory routes/callers/contracts, record packet/ADR before runtime edits.
2. Build account chrome and content hierarchy; migrate eight account screens.
3. Rebuild landing narrative, auth shell/fields and onboarding presentation;
   preserve existing controls/values/route state and useful motion.
4. Focused preference/notification/navigation/auth/onboarding regression tests;
   real local Chromium route/state/keyboard/responsive QA at320/390/768/1024/1440,
   short viewport, doubled text and normal/reduced motion. No broken assets,
   overflow or applicable axe violations in verified matrix.
5. Freeze files and evidence; run full pnpm check, inspect diff/protected paths;
   update reports/boards/state/handoff. Implementation checkpoint, then verify
   Git objects and record hash in docs-only checkpoint.

Risk: two kits coexist until remaining packets; precise route scope avoids global
payment changes. Local notification toggles are not delivery/filter implementation;
copy must disclose that. Synthetic providers cannot prove real Google/OTP delivery,
OS install or device UX. Existing preview forces planner enabled; do not claim
flag-off Week QA. No blocking question for this authorized round.

## Routing addendum before correction

Actual new-guest browser drill reproduced week choice -> /week/setup -> / despite
planner flag true; direct /week/setup correctly redirects /planner/new. The
onboarded /onboarding guard always emits Home and races the finish navigation.
Scope the one App.tsx onboarding redirect to the existing client primaryGoal,
matching finish's /week/setup intent. Other guards, backend/session/auth protocols
remain unchanged. Add guarded-App integration tests for all three goals and
repeat actual guest failure/retry/alias journey; no flag-off claim.
