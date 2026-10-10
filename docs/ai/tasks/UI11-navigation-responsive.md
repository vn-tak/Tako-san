# UI11 - Shared navigation and responsive shell

Status: UI11_LOCAL_VERIFIED_REVIEW_REQUIRED; final full and Git-object checks PASS.
Verified implementation: `74adf20db00f77c63ba47085362c621b56e050fc` (2026-10-11 JST).
160 source / 271 evidence / 99 public asset records and manifest match Git/worktree.
Receipt: `docs/ui-rebuild/round-11/GIT_VERIFICATION.md`. Documentation checkpoint
follows; next packet UI12 is ready for audit, with no runtime work started.
Authorization: continued Tako-san UI rebuild; canonical vn-tak/Tako-san,
checkout /Users/tunbee27/Documents/Tako-san-ui-rebuild,
branch codex/ui-rebuild-foundation. Start at verified UI10 implementation
`89bddf821ea4f74d639f0779febd78606bdf617f` plus its documentation checkpoint.
UI10 source143/evidence144/manifest were verified against Git objects; full gate
283 files / 6653 tests PASS. Read protocol/source first; add ADR-054 before
runtime. No new visual direction: retain UI07 identity.

## Verified starting evidence

UI09/UI10 direct visual review: global mobile bar has six equal-width cells
(five destinations plus raised Scan action),11px leading-none labels and68px
fixed height. At320px labels wrap densely; text enlargement can overlap. Tablet
rail has10px truncated labels. Source: src/web/design-system/navigation.tsx.
Comment calls Scan contextual, but rendering is a sixth cell. Brand/header and
shell spacing must be assessed together. Existing AppLayout bottom padding assumes
68px; page sticky actions elsewhere also encode this offset. Axe/overflow0 alone
cannot prove label separation or focused content visibility.

## Audit before choosing final navigation

Map current NAV_ITEMS, Scan affordances, feature-flag destinations and active route
matchers, AppLayout immersive patterns, existing Header and all fixed/sticky bottom
actions in migrated pages. Measure readable label/touch space and safe-area heights
at320/360/390/430/768/1024/1440, short390x420, computed text×2 and native zoom when
available. Record overlap, focused-link/field occlusion, immersive visibility,
one visible brand lockup and unexpected route matches. Review assets/icons for
consistency and reduced-motion indicator behavior. Inventory/payment/auth/domain
work is not implied by this audit.

## Chosen implementation constraints

Preserve five existing root destinations and Scan route access; do not hide
labels or reduce type to squeeze six cells. Choose the smallest measured solution
in ADR-054: if moving Scan outside the bar, define its mobile location and prove
it remains discoverable/reachable without covering page controls. Keep desktop
Scan action and tablet access. Document layout tradeoffs from screenshots before
coding; no extra root page/drawer solely to solve density.

Use real Links, aria-current and visible focus. Preserve Planner/Week flag routing,
explicit route active-state semantics, immersive behavior and all auth/onboarding
guards. Any replacement for hardcoded bottom offsets must have one shared layout
contract and verify every affected fixed action at both narrow and desktop widths.
Apply rebuilt styling only inside existing kitchen scopes; protected/legacy
surfaces keep their semantics and brand compatibility. Avoid global CSS patches
that conceal overflow or cut text. No dependency or backend/service/store change.

## Sequence and acceptance

1. Re-read protocol/UI10/source, status/diff/remote; enumerate shared nav users and
   fixed offsets; capture the reproducible failures; ADR-054.
2. Implement coherent mobile/tablet/desktop shell adjustment and affected offsets
   within measured scope. Keep reduced-motion and one-lockup behavior.
3. Meaningful tests for destination/accessibility/flag/active-state/immersive
   contracts; unchanged session/inventory/Week/planner/cooking/scan protections.
4. Real local browser journeys across Home, stock detail/edit, scan review, recipe,
   cook, Planner, Week flag-off, shopping, account/settings and public entry.
   Keyboard Tab/Escape/dialog return, responsive/short/enlarged text and safe-area
   checks; actual visual review and explicit no-label-overlap measurements.
5. Freeze sources/evidence; focused/type/lint/full pnpm check; document failures,
   remaining device/Safari/native zoom/usability/CWV/media/dependency limits.
6. Update state/boards/handoff/ADR; local implementation commit, verify Git objects,
   then documentation checkpoint with verified implementation hash.

Protected: PayOS/payment/billing/checkout, auth protocol, backend/packages/schema/
migrations/services/stores/dependencies/production flags/config and remote writes.
No push/PR/merge/deploy. Week durable outbox/projection replay and inventory fallback/
queued metadata receipts remain separate domain packets. UI11 does not certify
whole-system accessibility, owner brand approval or hosted release readiness.
