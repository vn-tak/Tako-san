# UI06 - Planner, meal composition and shopping presentation

Authorization: continue Tako-san UI rebuild, 2026-10-10 JST.
Canonical vn-tak/Tako-san; branch codex/ui-rebuild-foundation.
Base e584cf0bc8c5ab5c62b0896157c06f7bd511886b.
Status: UI06_LOCAL_VERIFIED_REVIEW_REQUIRED. ADR-049.
Implementation checkpoint: `UI06_IMPLEMENTATION_PENDING`; recorded after the
implementation in a documentation checkpoint. Local scope complete; review,
final brand kit, remaining routes/device/hosted/release remain open.

## Outcome and scope

Rebuild the existing /planner family (setup, agenda, meal, composition/picker,
shopping) and /shopping saved list in the established warm canvas/pine/coral,
self-hosted Be Vietnam Pro identity. Keep every existing planner/composition flag,
DTO, API, revision, idempotency, hard constraint and inventory authority.
Legacy /week aliases keep their current routing; legacy workflows are not cut over.
Other account/settings/legacy detailed screens and final brand kit remain later work.

## Evidence and decisions

The current planner uses a narrow vertical feed at all widths. The legacy footer
link redirects to the same planner when enabled. A compact saved-list form omits
quantity entirely. Planner form number fields are 14px; picker truncates titles.
Mutation completion can survive a subroute change within the same mounted page.
Saved-list writes expose no pendingSync receipt for toggle/delete.

Use a responsive day board, a form/context setup split, plain partial/unknown
messages, and separate shopping summary/list hierarchy. Shared scoped CSS handles
composer/picker/dialog readability and 48px targets. The saved-list form exposes
name/quantity/unit with positive fractional/blank validation and explicit delete
confirmation. Checks on planner recommendations remain temporary reminders; saved
shopping checks retain server/outbox persistence. Show pending sync accurately.
Remount the planner workspace on pathname changes so abandoned screen callbacks
cannot accept data or navigate the new screen. Query cache/server owns durable plans.

## Sequence and acceptance

1. Record ADR and source findings, then implement scoped shell/CSS and page layouts.
2. Preserve V1/V2/404 fallback, partial/stale/unplanned, proposals and explicit
   acceptance; never invent prices, stock, demand, images or safety assurances.
3. Saved-list quantity blank remains invalid; zero/negative/nonfinite rejected;
   decimal quantities and eight existing wire units are supported. Deletion has
   confirmation and pending/errors have visible feedback.
4. Add meaningful behavioral tests for shopping validation/pending cache and
   planner lifecycle. Run focused existing authority/client/sync regressions.
5. Run real local Worker browser journeys at320/390/768/1024/1440 plus short
   viewport, enlarged text, keyboard dialog, reduced motion, V1/V2/mismatch/Week
   routing, unknown prices and read/mutation failures. Capture evidence.
6. Freeze source, run full pnpm check, review full diff/protected paths, update
   actual state/reports and create implementation + verified-hash doc checkpoints.

## Risks and boundaries

No Worker/schema/migrations/dependencies/production flags/payment/auth/remote
DB/R2/provider/credentials/push/PR/deploy. Existing private session/outbox scopes
must survive; ambiguous add retries retain client identity. Pending means verified
local persistence, not proof that the server has not committed. No new durable
private planner drafts; form/recommendation ticks stay view-local. Desktop board
must collapse by actual content width; no hidden overflow. Device/Safari/OS
keyboard/actual zoom/screen-reader/usability/hosted/release validation remain open.

## Executed acceptance and next action

Full pnpm check exit0:272files/6533tests PASS,331.63s;typecheck/lint/migration smoke/
build PASS. Focused8files/151tests PASS7.06s; recovery6files/174tests PASS3.03s;
unchanged-environment Wrangler isolated32PASS3.26s. Browser59checks/91PNG/
21journey groups across V2/V1/server-mismatch,0axe/overflow/brokenimages/pageerrors.
21source/test/script hashes frozen and unchanged;107evidence payloads+manifest
bytes/SHA256 verified. Details, failures and operational limits:
`../../ui-rebuild/round-6/VERIFICATION.md`; design/audit/next-brand plan:
`../../ui-rebuild/round-6/FOUNDATION.md`. No remote or protected-path mutations.

Next UI07: asset inventory and vector brand kit/wordmark/symbol/micro/icon/PWA/OG/
usage; then synchronize remaining surfaces. Write a distinct packet+ADR before
implementation, preserve name/technical IDs and scope payment/auth protocols out.
