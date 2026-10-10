# UI07 scoped digital identity (ADR-050, 2026-10-10)

`TAKOSAN_KITCHEN` reads /takosan/rebuild assets; supplied TAKOSAN_BRAND remains
compatibility contract. Five vector masters feed generate-takosan-brand.mjs and
default brand:icons; explicit-kit generator mode retains legacy exports. Outline
masters use existing Be Vietnam Pro WOFF2/OFL; ordinary exports need pinned sharp
only. Header/sidebar/cooking dimensions and AppLayout persistent mode prevent
repeated desktop lockups without hiding immersive identity. Metadata/manifest/SW
static precache adopt new paths; lifecycle/fetch policy remains. No domain/backend/
auth/payment/dependency/flag/config change. Evidence/limits: round-7 reports.

---

# UI06 planner and saved shopping presentation (ADR-049, 2026-10-10)

`PlannerPage` mounts `PlannerWorkspace` keyed by pathname. Existing usePlanner
mounted/private-session checks discard abandoned screen callbacks; durable plans
remain in server and private query cache. `/planner` family and `/shopping` use
the scoped kitchen shell and `kitchen-planning.css`; Week flag routing/aliases,
V1/V2/404 fallback, proposal accept/revision and inventory authority are unchanged.

Planner setup/day board/meal/composer/shopping share responsive hierarchy and
readable forms. Picker receives mutation errors inside its focus-trapped dialog;
search error terminates pending feedback. Shopping budget error owns focus.

Saved shopping uses typed `ShoppingSnapshot` under the existing query prefix plus
`snapshot`; old facade readers retain the array contract. `shopping.ts` validates
input/response, scopes cached reads and queued operations, overlays owned outbox
POST/PATCH/DELETE in order, deduplicates client IDs and verifies durable queuing.
Later same-item commands queue behind pending earlier commands. Mutation cache
projection does not issue an extra GET. Form holds one in-memory add ID/payload
through uncertain retry and warns on document exit; known400 allows edit. Checks
and deletions return pendingSync receipts; no stock command or new persistence.
See UI06 packet and round-6 FOUNDATION/VERIFICATION for evidence and limits.

---

# UI05 cooking presentation and lifecycle (ADR-048, 2026-10-10)

RecipeDetailPage remains preparation. `/cook/:slug` and `/cooking/:id` use the
scoped cooking workspace; `/cooking/complete` and existing attempted cook aliases
share CookingReview. `useCookingStore` owns in-memory run, quantity strings,
strict availability validation, deadline timer and immutable command attempt.
`lib/cooking-review.ts` handles typed actual-use/zero/blank/error presentation;
`lib/cooking-completion.ts` completes only its current run/session and invalidates
Week dependents, with no async navigation. Component refresh uses fetchJson
without offline cache fallback; unmounted/run-changed responses cannot reopen it.

Recipes service retains server/outbox authority: validate success shape, verify
queued persistence, snapshot stock before command, preserve key/body/header and
avoid duplicate same/concurrent-key offline projection. Worker allocation/commands,
tenancy, revisions and Week dual-write remain unchanged. Voice/step callbacks read
current state and stop across lifecycle. See UI05 packet and round-5 evidence.

---

# UI04 scan review presentation (ADR-047, 2026-10-10)

`components/scan/{ReviewHeading,ReviewFields,ReviewSource}.tsx` share presentation
across photo/receipt reviews; existing route/session/poll/command handlers remain
separate. Shared values carry blank quantity without inventing0/1. `useScanStore`
adds explicit in-memory imageScanId binding; server hydration cannot bind an old
image. `kitchen-scan.css` and scoped AppLayout include `/scan` family; immersive
camera and non-immersive review route/navigation compatibility remain.

`ScanPage` no longer invents processing stages from timers. Existing server
pending/processing DTOs own queued/analyzing status. Camera effects own/stop the
opened stream; scan mode changes cancel unfinished image reads and reset the file
input, so a stale callback cannot submit the prior mode and the same file can be
selected again. Photo confirm surfaces pendingSync before inventory navigation and clears the
queued ready draft on leaving review; SPA return must hydrate server state.
Synthetic offline confirmation skips rejected rows, validates accepted quantities
before mutation and carries estimate qualifiers into existing outbox/projection.
An all-rejected synthetic import reports zero items and no pending synchronization.
No scan API/schema/catalog or inventory authority change. See UI04 FOUNDATION.

---

# UI03 discovery read path (ADR-046, 2026-10-10)

`GET /api/v1/recipe-discovery` is additive under recipe routes and existing auth/
tenancy guards. `src/worker/services/recipe-discovery.ts` accepts one routed
RecipeAuthoritySnapshot, reads strict household inventory and uses
`packages/recipes/src/discovery.ts` for whole-catalog filtering, legacy quantity
ranking, deterministic ties and snapshot-fenced offset pagination. Shared Zod
request/card/page contracts are in `discovery-contract.ts`. Only selected page
IDs receive media enrichment; detail/legacy APIs and commands stay unchanged.

`src/web/services/recipe-discovery.ts` validates response/session and is the
explicitly approved offline static reader (T14D audit addendum); device results are
labelled and source-fenced. Home requests3, Recipes24, with scoped recommendation
cache prefix/invalidation and URL cursor/restart. `legacy-media-policy.ts` is a
presentation quarantine used by the central web resolver; raw catalog/release
fingerprints and canonical media serving authority are unchanged. Local evidence:
`../ui-rebuild/round-3/FOUNDATION.md`. Full catalog ranking/hydration remains;
this contract reduces transfer and selected-page media reads, not database CPU.

---

# Architecture — T01 foundation through T05 shopping optimization

T20 adds `packages/recipes/src/composition/*` (roles, simple foods, profiles, pure
composition model, single-subtraction projection, bounded composer), additive
migration 0039 with `packages/db/src/meal-composition.ts`, and
`src/worker/services/meal-composition.ts` under the existing meal-planning routes,
gated by `MEAL_COMPOSITION_V2_ENABLED`. T19 authority, T02–T05 arithmetic and V1
contracts are consumed unchanged. See ADR-031 and `MEAL_COMPOSITION_V2.md`.

T07 adds an aggregate authenticated-account budget to expensive new-planner
routes, retaining their per-path limits. KV and isolate-local fallback remain
best-effort abuse controls, not atomic quotas; see ADR-019 and `T07_H2_ABUSE.md`.
No legacy/auth/payment policy or deployment architecture changes.

T05 adds pure `recipes/src/shopping-*.ts`: opaque authorized plan/catalog/budget
preload, authoritative shortage normalization, bounded package enumeration, exact
minor-unit money, budget proof and evidence-only stock/surplus risk. No T04
replanning, persistence, legacy shopping cutover or T06 route/UI integration.
Legacy VND benchmark/package helpers are not authoritative price offers.
See `SHOPPING_OPTIMIZER.md` and ADR-015 for the T06 contract and proof scope.

T04 adds `recipes/src/planner-*.ts` and `weekly-planner.ts`: opaque preloaded
context, fixed-offset ordered slots, exact branch-local inventory, T02 regeneration,
T03 eligibility/utility, bounded beam search, period nutrition, locks and explicit
partial/incomplete results. Opt-in T02 expiry-first lot ordering supplies the actual
projection witness; the standalone default stays ID-ordered. No T03 scoring or
safety logic is replaced. See `WEEKLY_PLANNER.md` for the complete T05 contract,
limits, generated-only persistence and safe future shadow/canary integration.

The T04 core accepts no database binding, performs no I/O and never writes real
stock or Week rows. Source snapshots must be authorized/preloaded before context
creation and revalidated before future acceptance/cooking. Existing legacy Week
remains the production path, including all dual-write and reconciliation behavior.

T03 adds pure `recipes/src/ranking*.ts` and scoped `personalization.ts` contracts.
Hard eligibility precedes bounded component utility and deterministic ordering.
The T02 result has private same-process scope/fingerprint provenance for ranking;
it cannot be reconstructed from request JSON. Server-owned review evidence is a
separate authority boundary. D1 personalization/feedback and bulk nutrition readers
load snapshots before scoring; no query occurs in the candidate loop. Existing
`cooked_meals` is reused rather than creating a second cooking command/history.
No old ranker or live route is cut over. See `RANKING_ENGINE.md` for exact weights,
unknown/safety behavior, ownership, persistence and the T04 utility contract.

## Stack and layout

Single private pnpm project, not a pnpm workspace. `packages/*` are source folders
resolved by TypeScript/Vite aliases; there are no independent package manifests.
Lockfile versions, not README ranges, govern dependencies (React 18, Hono 4,
Zod 3, Vite 6, Vitest 3, TypeScript 5, Wrangler 3).

| Layer | Actual paths / responsibility |
| --- | --- |
| Web | `src/web/App.tsx`, `pages`, `components`, `features/week`; React Router lazy routes, Tailwind, shared TanStack Query, Zustand workflow drafts |
| Web data | `src/web/services/api.ts` compatibility facade; `http.ts` cookie transport/owner fencing; domain services; scoped query keys/cache/outbox |
| Worker | `src/worker/index.ts`, Hono `/api/v1` routers; middleware for sessions, CSRF, tenancy, rate limits; Cloudflare Queue consumer |
| Validation | `src/worker/validation/schemas.ts` Zod request schemas, additional route-local validation; older routes still contain loosely typed code |
| Domain | `index.ts` static ingredients/normalization/freshness; leaf `units.ts`, `quantity.ts`, `availability.ts` for shared T02 arithmetic; `week/*` remains the legacy planner |
| Recipes | Legacy `{types,data,engine,vietnamese-bank}.ts` still drives API/cooking/Week; new `{catalog,requirements,substitutions,families,candidates}.ts` is an explicitly invoked T02 library |
| Database | Raw SQL/D1 batch, **no ORM**; T01 `catalog.ts` trusted authoring and T02 `recipe-catalog.ts` read-only snapshots; numbered `migrations/*.sql` |
| AI | `packages/ai/src/router.ts`, `schemas.ts`, `providers/*`; validated structured predictions, provider routing and mock mode |

T01 adds leaf `foundation.ts` domain/recipe contracts and `packages/db/src/catalog.ts`
for explicitly invoked catalog authoring/exact alias lookup. Legacy entry-point
types/engines remain intact. Leaf imports avoid expanding the existing
domain-week/recipes barrel dependency cycle.

T02 adds one canonical lot index and per-candidate reservation witness. Concrete
recipes and bounded family variants use the same scaling, availability and
substitution path. The explicit snapshot contract separates candidate generation
from existing ranking, Week simulation and live readers. No new endpoint, migration
or persisted variant exists. See `RECIPE_ENGINE.md` for the full consumer contract.

## Data/runtime split (important)

- D1 contains canonical ingredients, aliases, translations, recipes, recipe lines
  and steps, but runtime normalization uses `CANONICAL_INGREDIENTS` and runtime
  recipes use `ALL_RECIPES`. They are not automatically hydrated from D1.
- At the audited seed baseline there are 45 D1 ingredients, 59 recipes, 328 recipe
  lines and 295 steps; DB aliases/translations start empty. Static catalogs contain
  aliases and optional recipe macro summaries absent from those SQL tables.
- T01 did **not** reconcile/import the whole catalog or switch any live reader.
  T02 now provides explicit validated adapters and a read-only drift report.
- T02 inspects either catalog through that adapter while retaining source and
  incompatibility evidence. It must not merge conflicting identities, hydrate old
  runtime readers from D1, or change catalog authority without a separately reviewed
  import/cutover. Foundation persistence is not runtime publication.
- T02's fresh replay audit finds 45 canonical IDs in both sources; 59 D1 recipes
  agree with their static counterparts. Static-only `gl-01`–`gl-12` remain static;
  no requirement/unit drift was found among shared recipes. Alias keys/collisions
  are reported for review only, never automatically promoted. The eight D1 catalog
  SELECTs use one transactional batch to keep parent versions and demands coherent.
- D1 is authoritative for household inventory and commands. KV caches are not a
  replacement for failed authoritative reads; command paths already use strict
  reads, transactions/idempotency and version checks.

## Inventory, OCR and ownership

`inventory_items` are household-owned lots; canonical FK is nullable. HTTP maps
unmapped FK to `ingredientId: ''` plus normalization status. Preserve raw name.
`inventory_events` logs changes; `version` prevents stale edits. Cooking allocates
across compatible lots with command replay protection (`routes/recipes.ts`).

Scan upload -> durable scan/quota/queue state -> fenced AI/OCR worker -> `scan_items`
drafts -> user confirmation -> inventory/event transaction. Receipt metadata
comes from migrations 0013+; user review must remain between AI and stock writes.
T01's new normalized aliases and condition columns are **not wired into** this flow.

`users`, `profiles`, `households`, `household_members`, `user_preferences`, and
`weekly_planner_preferences` already exist. Household access is checked by server
session and tenancy guard. Preferences currently contain household size, cuisines,
dietary strings, language and weekly settings, not a structured nutrition/taste
model. The older preference route has weak validation/replacement semantics;
address only when extending planner preferences in T03, not unrelated auth.

## Existing recipes / Week / shopping

Recommendation scoring and seven-day sequential planning already run. Week clones
and decrements tracking inventory, scales servings, considers price/preferences,
supports swaps and shopping. Known gaps include first/last-lot matching in some
paths, string dietary tests, unsafe fallback when no eligible candidate, static
price/package assumptions and lack of hard nutrition/allergy constraints.

Week persistence has historical overlapping models: 0003 `meal_slots`, 0005
`meal_plan_slots`, and 0010 shadow `_v2` tables. Existing routes dual-write according
to `WEEK_SCHEMA_MODE`, with snapshots and legacy reads. Do not change that cutover
in T01. See `docs/WEEK_RECONCILIATION.md`, `WEEK_KV_RECOVERY.md`, `D1_SCHEMA_GATE.md`.
Existing weekly and standalone shopping lists are different workflows.

No retail SKU/barcode/product table exists; generic ingredient prices/packages
exist in SQL while runtime Week uses static providers. T05 owns product/price
context and package arithmetic, not T01.

## Environment, tests and release

- `wrangler.jsonc` binds D1/KV/R2/queues and runtime settings; `.dev.vars.example`
  documents local variables. Never commit `.dev.vars` or production secrets.
- Vite proxies to local Worker by default (`VITE_API_URL` can override).
- `.hoplite/settings.json`: idempotent sqlite3 install + frozen pnpm install;
  managed run is `node scripts/security-preview.mjs`. It serves real app/routes
  with private in-memory SQLite, mocked AI and blocked outbound backend fetches.
- `tests/helpers/sqlite-d1.ts` replays every migration with real `node:sqlite`
  constraints and atomic batch rollback; tests also cover Worker routes, frontend
  services, session boundaries and concurrency. Vitest runs Node, not a DOM browser.
- `scripts/migration-smoke.sh` tests the entire chain and historical Week/seed
  recovery cases. `scripts/d1-schema-gate.sql` checks migration ledger/schema.
- `pnpm lint`, `typecheck`, `test`, `check:migrations`, `build`; `pnpm check` wraps
  local gates. `typecheck` includes source/packages and TS/TSX tests through
  `tsconfig.json`; JavaScript/MJS tests are executed, not checked with `checkJs`.
- Existing `.github/workflows/{ci,deploy}.yml` and `DEPLOYMENT.md` govern release.
  T01 makes no deployment/config/auth/payment change. Existing migrations are
  immutable; 0019 is additive and ledger-applied once. Published 0019 is retained;
  follow-up 0020 preflights existing data and adds identity/version/provenance guards.
  Only sandbox-local migrations are authorized by T01; deployment remains operator-owned.

Historical `docs/HOPLITE_HANDOFF.md` and root hardening/frontend reports retain
security integration context. For this seven-task program, `docs/ai/HANDOFF.md`
supersedes their current-task/status claims; no duplicate security protocol is created.
