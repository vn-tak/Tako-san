# UI09 - Stock detail, reconciliation and system states

Authorization: user continues the Tako-san rebuild, 2026-10-10 JST.
Canonical vn-tak/Tako-san, branch codex/ui-rebuild-foundation.
Base dbcabb7648e7f4ee9595f5ae430f0d7b50e80f0b. ADR-052.
Status: UI09_LOCAL_VERIFIED_REVIEW_REQUIRED.

## Outcome and scope

Adopt UI07 identity for /fridge/:id, /ingredients/:id, /inventory/:id and
/inventory-reconciliation. Present quantity, expiry uncertainty and provenance
before metadata editing and related recipes. Group observations as readable
records with claim/verdict/reasons and explicit apply/dismiss actions.
Use shared kitchen header/heading and scoped CSS, preserving one h1 per page.
Extend the digital identity to AppErrorBoundary and SessionBoundary loading,
verification failure and pending/failed logout markup only.

Preserve lot query/fallback authority, IDs, draft ownership/baseline, dirty-only
PATCH payloads, version fences, conflict/refetch outcomes, reconciliation server
proposals, stable decision keys, private scope and inventory invalidation.
Presentation may distinguish a pending legacy fallback from not-found, lock
metadata controls during save, focus input/error/return action, add explicit
cancel/navigation draft warnings, and qualify recipe matching as ingredient
relevance rather than complete cookability. No service/store/backend/schema edit.
SessionBoundary's effects, verification/session/Plus/onboarding/logout authority
and App guards remain unchanged. PayOS/payment/billing/checkout protected.
No asset/font/pose/dependency/production/config/remote mutation or deployment.

## Week discovery and scope decision

Source inspection: WeekSetup's daySchedules and skipDetailedSchedule never enter
updateSetupDraft or generatePlan, while UI claims those choices control the week.
Week has six pages plus editing/export/shopping sheets with domain commands.
Handle that coherent workflow in UI10 rather than adding dead choices to a new
layout. UI09 adds a preview-only PREVIEW_MEAL_PLANNER_ENABLED=false switch to
security-preview, setting frontend/server together and retaining default true.
Use real isolated Worker to inspect Week with planner disabled; archive findings
and an execution-ready UI10 packet. No Week routing/default/domain change.

## Sequence and acceptance

1. Record source/caller/test inventory and this packet/ADR before runtime edits.
2. Build shared detail/system presentation, then migrate detail/reconciliation.
   Wrap long names/reasons/IDs, controls >=48px and inputs >=16px; explicit back.
3. Add meaningful tests for pending fallback, save locking/focus, cancellation,
   retained draft on error and server proposal/intent preservation; retain T13
   ownership/conflict and session/security regressions. Review route allowlist.
4. Actual local Chromium 320/390/768/1024/1440, doubled computed text at320,
   normal/reduced motion, keyboard edit/cancel/save/error/retry and real canonical
   adopt, reconciliation apply/dismiss. Synthetic failures clearly labelled;
   no overflow/broken assets/applicable axe violations in checked new surfaces.
   Verify read-only visits do not mutate stock, writes affect only intended item.
5. Run focused tests, type/lint, full pnpm check; record failures accurately.
   Archive screenshots/logs and hashes; inspect full diff/protected paths.
   Update boards/state/handoff, implementation commit, Git-object verification,
   then documentation checkpoint.

## Dependencies, risks and limits

Existing Node24/pnpm/Chromium/axe, local in-memorySQLite security preview only.
UI07 kit/tokens remain established; no stylistic approval question needed.
Legacy fallback currently occurs on any canonical-lot failure: preserve existing
behavior and record the authority risk for a separate domain packet, not silently
replace it with client inference. Unsaved draft warnings must not change command
identity or trap a pending save. Week flag-off screenshots are audit evidence,
not a claim that Week satisfies new UI criteria. Device/Safari/OS/native zoom,
screen-reader/usability/CWV/owner/hosted/release remain unverified.

## Executed outcome

Detail aliases/reconciliation and system fallback presentation adopted UI07.
Readonly stock unchanged; metadata dirty PATCH/version and all other item facts
unchanged excluding the proven shared household revision. Real canonical adopt,
metadata retry/reload and server proposals apply/dismiss checked. Query/mutation/
draft submit and reconciliation authority normalized tokens match the base;
session verification effects and App routes/guards match.125sourcehashes frozen.

Focused11files/223tests PASS3.99s (27new/196existing). Full pnpm check exit0:
281files/6615tests PASS,Vitest370.01s;type/lint/migration-smoke/Vite3.27s+WorkerTS
PASS. Frozen49screens/9journeys,0unexpectedpageerror/applicableaxe/overflow/broken
assets. Expected2lazyimport faults separated.320/390/768/1024/1440,doubledtext320,
longsyntheticcontent,short390x420,normal/reduced. Logout snapshots synthetic only.
51buildassets identical.115evidencepayloads/28logs raw/archivehash receipts.

Week planner-disabled audit16screens/2journeys confirms unsent firstday eat_out
returns cooking; inventory unchanged. UI10 packet recorded; no Week runtime edit.
Failure/recovery logs retained; generic UX146files/29issues/945warnings/80checks
STATUSFAIL; dependency41(4low/19moderate/16high/2critical),unchangedlock. Global nav
labels overlap at doubledtext320; UI11 follow-up, no whole-system UX certification.
Beforeunload document-only; fallback-any-error/queued metadata receipts unchanged.
Owned preview13063/13334 stopped,5202/8902/5203/8903 closed before full. No remote/
payment/service/store/backend/schema/dependency/config/push/deploy changes.
Evidence: round-9 FOUNDATION/VERIFICATION; owner/device/Safari/screenreader/
nativezoom/usability/CWV/hosted/release remain. Next UI10-week-compatibility.
