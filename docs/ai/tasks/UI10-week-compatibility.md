# UI10 - Truthful Week compatibility and identity adoption

Status: UI10_READY_FOR_IMPLEMENTATION_PACKET; runtime not implemented.
Authorization: continued Tako-san UI rebuild. Canonical vn-tak/Tako-san,
checkout /Users/tunbee27/Documents/Tako-san-ui-rebuild,
branch codex/ui-rebuild-foundation. Start from the verified UI09 checkpoint.
Add ADR-053 with the decisions below before runtime edits; do not infer a new
backend contract from the old Week UI. Evidence: round-9 Week flag-off audit.

## Verified problems and chosen behavior

1. WeekSetupPage daySchedules/skipDetailedSchedule never reach the setup draft or
   generation payload. Actual local browser: select first day eat_out; returned
   dayType is cooking. Remove this unsupported step. Setup has four truthful
   stages: meal preset, budget, priorities, shopping frequency. Preserve back/next
   draft values, one to three priorities and explicit final generate action.
   Per-day scheduling remains a separate domain task; no new payload field.
2. WeekSettingsPage only updates useWeekStore.setupDraft in memory and reports
   saved before navigating back after800ms. Describe it as settings for the next
   generated plan in this session; no durable/saved-current-plan claim. Keep the
   existing draft authority, remove timed navigation, use explicit return to
   /week/:planId. No server preferences API shortcut.
3. Dashboard handleQuickRegenerate discards _priorityFocus. Replace the misleading
   priority-specific actions with one explicit setup/review action. Do not silently
   regenerate another plan on clicking a supposed priority choice.
4. WeekGeneratingPage converts null budget to750000 through ??. Preserve null as
   unlimited; default750000 only when undefined. This is a narrow frontend input
   mapping correction using the already accepted MealPlanSetupInput contract.
   Keep StrictMode command reuse, private-session guard, request/current fencing,
   route effects and all service/idempotency behavior.
5. Export marks clipboard success before writeText resolves. Await actual clipboard
   completion; rejected/unsupported clipboard gets a safe focused error. Native
   share cancellation must not claim sharing succeeded. Keep generated text and
   domain data. Both successful/error feedback remain inside the focus-trapped
   dialog; cleanup feedback timer if any, or use explicit dismiss.
6. completeWeekShopping already returns pendingSync in its offline result, but
   useWeekStore.completeShopping strips that fact. Narrowly propagate the existing
   optional pendingSync receipt through the store's return type and page's captured
   completion state, without changing service, outbox, commands or projections.
   Queue state says waiting for sync; no server-confirmed stock/import claim.
   Do not infer pendingSync from navigator.onLine. The service's queueWrite ignores
   its durable receipt and optimistic repeated projection may duplicate quantities:
   separate domain risk, no durable offline guarantee in this presentation packet.
   If the existing receipt cannot prove completion, keep feedback conservative and
   document the limit; do not invent confirmation or rewrite service authority.

## Route/component scope

Explicit existing Week routes: /week, /week/setup, /week/generating,
/week/:planId, /week/:planId/meal/:mealId, /week/:planId/shopping,
/week/:planId/settings. Do not adopt unrelated /week-old or nested unknown paths.
Planner-on redirect aliases remain byte-equivalent; planner-off uses these pages.

Presentation files: WeekDashboardPage, WeekSetupPage, WeekGeneratingPage,
MealDetailPage, WeekShoppingPage, WeekSettingsPage; WeekSummaryCards, MealCard,
MealSwapSheet, WeekExportModal; a shared Week workspace and scoped CSS if useful.
AppLayout explicit scope may expand. Use UI07 pine/coral/ink/canvas, licensed
Be Vietnam Pro and existing lockup/symbol. One h1/page, explicit deep-link return,
readable14px body/16px fields,48px controls, desktop board with constrained width,
mobile stacked days. Budget/availability/waste are projections; qualify estimates,
unknown prices/nutrition, partial/unplanned and stock reads by their actual sources.
No mascot pose replacement required: use symbol only when purposeful.

Rebuild meal/swap/shopping information hierarchy using actual plan and existing
commands. Keep useModalFocus, Escape/trap/return, dialog100dvh/scroll/safeareas;
wrap names and badges. Reduced motion disables decorative animation; no fake
progress/timing. Completing shopping is explicit stock import, while checking
items is intent only. Keep selected-item snapshots, errors and pending controls.
Cooking link uses existing /cook/:slug contract; no alternative deduction path.

## Protected boundaries

No PayOS/payment/billing/checkout, authentication protocol, backend/packages/
schema/migration/dependencies/production configuration or remote writes.
No changes to src/web/services/week.ts, its outbox/cache/projections or commands.
Only permitted store edit is passing through pendingSync from completeShopping;
keep default state, private reset, optimistic shopping edit ordering, rollback,
query invalidation, stable keys, versions and private-session fencing unchanged.
Inventory reads cannot become stock mutation; plan generation/swap cannot import
or consume inventory. Keep Week dual-write and planner flag/default routing.
Any broader domain fix needs a separate packet/ADR and verification.

## Execution and acceptance

1. Re-read protocol/source/current state; clean/owned diff inventory; ADR-053.
2. Shared Week shell and exact route adoption; four-stage setup and session-draft
   settings. Narrow null-budget mapping and truthful regenerate navigation.
3. Day board/meal/swap/export and shopping list/active/completion presentation;
   propagate existing pendingSync; preserve command lifecycle and dialogs.
4. Meaningful tests: four-step payload/back retention, null versus undefined budget,
   settings changes no server mutation/current-plan replacement; generation
   StrictMode/session/error; clipboard async/error; pendingSync pass-through;
   real command payload/version/private-key tests unchanged. Both flag routes.
5. Local real Worker with planner false:320/390/768/1024/1440,short390x420,
   doubled computed text320, normal/reduced. Keyboard setup/generate/read/reload,
   meal tabs/swap dialog/retry, export reject/success/Escape, selected-only shopping
   completion/readback. Distinguish intercepted faults from real writes. Assert
   generation/read/swap inventory equality; completion only intended stock changes.
   Test false and true flag destinations, no external provider or remote requests.
6. Focused/type/lint/full pnpm check. Actual direct visual review; record every
   failure, contrast/overflow/assets/axe and known global-nav limitations.
7. Freeze/hash sources and evidence, update state/boards/handoff/ADR, local
   implementation checkpoint and verified Git-object documentation checkpoint.

## Follow-ups outside UI10

Global mobile six-item navigation has cramped labels, especially at doubled text
320; whole-shell responsive/navigation audit needs UI11. Ingredient detail fallback
on any canonical read error and metadata queued-receipt presentation need a separate
inventory authority packet. Week service durable queuing/optimistic replay needs
its own domain packet. Owner brand review, devices/Safari/native zoom/screen-reader,
usability/CWV/hosted release and dependency advisories remain unverified/unresolved.
No push, PR, merge, production migrations or deployment in this local packet.
