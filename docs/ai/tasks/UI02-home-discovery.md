# UI02 - Home authority and daily discovery

User authorization: continue one rebuild milestone on 2026-10-10 JST.
Base: UI01 documentation checkpoint `1533d98`, canonical repository `vn-tak/Tako-san`.
Branch: `codex/ui-rebuild-foundation`; checkout `/Users/tunbee27/Documents/Tako-san-ui-rebuild`.

## Goal and scope

Home reads the same current-plan authority as Planner under its existing UI flag,
with Week retained when disabled. Upcoming/no-plan/past/loading/error states stay
separate. T20 components own composed titles, including edited unplanned slots;
only UI-off or explicit composition 404 uses V1. Household query keys/session
fences remain. No planner/cooking/inventory commands or remote operations change.

Adopt a shared kitchen header/page heading and route-scoped shell identity on
Home, inventory list, recipe list and detail. Keep existing navigation destinations,
Scan prominence and default identity on other routes, including protected payments.
Recipe filters become URL state, with deterministic client paging of 24 results,
whole-result search and previous/next focus handling. This does not reduce the
existing full recommendation response or introduce a new list API.

## Sequence

1. Record ADR-045, inspect current DTO/flags/queries/composition/Week semantics.
2. Implement pure presentation adapter and read-only scoped hook; test authority,
   future dates, fixed offset, missing/error/mismatched composition and V2 slots.
3. Build shared header/heading, scoped navigation and Home; adopt on UI01 surfaces.
4. Rebuild discovery filters/results/pager with validated URL state; test deep links,
   back/reload, whole-set filtering, invalid params and native link behavior.
5. Run focused regressions, local browser/axe at320/390/768/1024/1440, full repository
   gates; inspect screenshots/diff/protected paths, record actual failures/limits.
6. Commit implementation then update state/task boards/handoff with verified hash.

## Acceptance and risks

- Flag on: only canonical current plan requested; flag off: only existing Week.
  A plan for tomorrow never appears as no-plan. Meal dates use the plan UTC offset.
- Composition pending/error/missing/revision mismatch never exposes a stale V1 title.
  Composition404 and UI-off preserve V1; V2 components can populate unplanned slots.
- Home links into canonical meal detail rather than treating a V1 anchor recipe as
  the complete composed meal. Planned availability is not current-stock certainty.
- No misleading zero results while loading; filters reset page, URL reload/back
  restores them, searching outside the first24 works; each rendered page stays<=24.
- Header/nav remain keyboard accessible at320px with long titles/names. Old route
  theme defaults, Week/auth/session/inventory/payment contracts remain intact.
- Browser evidence uses local synthetic fixtures only. Full pnpm check passes with
  documented local environment. No hosted/production certification is inferred.

## Continuation

UI03: lightweight list DTO/server pagination, then editor/scan/cooking/planner and
remaining brand/motion/device/usability work. No deployment is part of UI02.

## Actual local implementation

Shared shell/header/heading adopted on the four migrated route families. Home
canonical/Week selection and T20 authority implemented with read-only scoped
queries; explicit family V1 retained, custom late scheduled times supported.
Discovery URL filters/client24paging implemented; native filter panel collapsed
below1280 and expanded by default on desktop after screenshot review. Recipe
Card image dimensions and detail h1/back link corrected. Recipe detail returns
to Home or the filtered catalog according to the validated navigation origin.
Known/estimated expiry tones remain distinct. Existing static-render integration
helper now supplies Router context; legacy cases explicitly run with planner off,
and retain actual data/budget/expiry/error/security assertions. No server list API added.

Evidence and next-slice criteria: `../../ui-rebuild/round-2/FOUNDATION.md` and
`../../ui-rebuild/round-2/VERIFICATION.md`. Final fullgate/commit status is recorded
in the completion checkpoint, not inferred from intermediate logs.

## Completion evidence — 2026-10-10 JST

`UI02_LOCAL_VERIFIED_REVIEW_REQUIRED`: final full gate exit0,264files/6429tests,
0FAIL,326.64s; lint/typecheck/migration-smoke/build PASS. Browser21axe/layout,
23screenshots,0violations/overflow/pageerror; URL/Home↔Planner/Home-return journeys
PASS. Focused6files/157tests PASS. Full first12FAIL repaired in test Router/fixture
setup while retaining actual data/security assertions; details in VERIFICATION.
No source changes follow the final full gate; remaining edits are documentation.
Implementation hash is recorded in the subsequent documentation checkpoint.

Verified implementation: `11080d8a7a05614b37e85cf12f6f888addd15df0`.
Final gate ran on this source; only documentation follows it. CURRENT_STATE,
root/AI TASK_BOARD and HANDOFF contain the continuation checkpoint; no remote action.
