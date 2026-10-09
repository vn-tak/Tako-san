# UI03 - Lightweight discovery and honest recipe media

User authorization: continue one rebuild milestone, 2026-10-10 JST.
Canonical: vn-tak/Tako-san. Base: 87cfbdf1b2e1164f3cb9a122d8613ed52d140c3b.
Checkout: /Users/tunbee27/Documents/Tako-san-ui-rebuild.
Branch: codex/ui-rebuild-foundation. See ADR-046 before implementation.

## Outcome and scope

Recipes and Home use an additive authenticated discovery endpoint. Cards receive
summary fields and quantity-based counts only; detail retains its separate API.
Search (Vietnamese accent-insensitive), cuisine, category, region, time and no-buy
filter the entire authoritative catalog before stable ranking and page slicing.
Catalog defaults to 24 items; Home requests 3. Legacy APIs/consumers stay compatible.

Previous/next links include a cursor binding page, page size, normalized filters,
user/household, actual catalog source/content fingerprint and relevant inventory.
Changed snapshots produce 409 and an explicit restart action. Deep links without a
cursor read the current snapshot and clamp page bounds. Filters/reset drop cursors.
No mixed stale result while a different filter/page request is pending. Offline
uses existing local inventory/static recipes, explicitly labelled device results.

Audit all 500 fresh local D1 recipe mappings and the 71 static rollback mappings:
URL, duplicate use, available file bytes/dimensions/hash, media status and provenance
limits. Suppress generic food illustration and confirmed mismatches in presentation;
quarantine known unverified legacy Unsplash mappings pending content review. Preserve
raw catalog URLs and canonical ready media priority. No provider calls or remote writes.

## Execution sequence

1. Record ADR-046 and typed request/response contracts, deterministic ranking and
   stateless cursor validation; preserve source and quantity authority.
2. Add route and frontend client with validation, session fences, offline label;
   migrate Recipes/Home, scoped cache keys/invalidation, URL/recovery/focus behavior.
3. Generate reproducible local media mapping report, apply precise presentation
   quarantine, verify canonical fallback and neutral alt text without altering catalog.
4. Run API/quantity/security/session/paging/UI regressions; exercise real local
   Worker/browser at 320/390/768/1024/1440; inspect screenshots and JSON byte sizes.
5. Freeze source; run repository pnpm check with Node24 and two Vitest workers.
   Review complete diff/protected paths and commit implementation. Record exact
   checks/failures/limitations/hash in state, task boards, handoff and verification.

## Acceptance and risks

- First page <=24 and Home <=3; list omits ingredients, steps, nutrition and lot
  evidence; 24-item JSON under 100KiB before compression in the local 500 fixture.
- All pages cover each matching recipe exactly once on an unchanged snapshot.
  Ties resolve by recipe ID; no-buy reuses UI01 quantity arithmetic, not presence.
- Filter/search beyond first24, URL reload/history/detail return, error/loading,
  stale cursor recovery, household switching and inventory invalidation tested.
- Cursor is an opaque digest/page witness, never an authorization token or a
  server-held historical snapshot. Every request re-reads current inventory.
- Inventory read failures return 503 rather than fabricated empty/cached stock.
- Media queries/enrichment only cover returned page; ranking still scans/hydrates
  the authoritative catalog. No claim of database keyset pagination or CPU savings.
- Layout/axe/reduced motion pass selected browser matrix. Full repository gates
  pass without weakened assertions or changes to applied migrations.

## Boundaries and continuation

No migrations, dependencies, flags, payment, unrelated auth/infrastructure,
inventory/cooking/planner/Week commands, remote credentials/data, push or deployment.
Final brand export, scan/editor/cooking/planner/shopping and remaining routes remain
in the existing rebuild roadmap. Local evidence is not hosted/device certification.

## Actual implementation and evidence

Additive `/recipe-discovery` implemented with typed summary DTO, strict inventory
read, existing authority, deterministic ranking, page24/Home3 and cursor witnesses.
Client validates contract/session, labels offline source, shares scoped invalidation.
Recipes URL/history/return/focus/409-restart tested; stale background requests hide
old rows until current response. Grid missing-image header compact80px after visual
review. Central presentation policy quarantines429generic/59unreviewed/6wrong-or-
missing mappings and preserves ready canonical priority/raw catalog content.

Local report500D1/71static/46URL/21reusegroups;8mapped files SHA/dimensions/bytes,
13physical files contact-sheet review. All500 fresh media rows pending, not a remote
coverage claim. Twelve actual browser journeys,15axe/layout checks,17screenshots,
0violations/overflow/brokenimages/pageerrors. Focused7files/163tests PASS.

First full gate6467PASS/1FAIL: authority audit found the documented offline client
not yet in its explicit static-reader allowlist. Added that exact reader and T14D
addendum under ADR-046; unchanged unknown-reader0 assertion. Focused authority+
client2files/20tests PASS. Final full gate result and implementation hash recorded
in the completion checkpoint. Reports: `../../ui-rebuild/round-3/FOUNDATION.md`,
`../../ui-rebuild/round-3/VERIFICATION.md`, evidence/manifest. No remote operation.

## Completion evidence

Final full gate exit0:266files/6468tests PASS,0FAIL,321.24s; lint/typecheck/
migration-smoke/build PASS. Runtime/test/script manifest23files unchanged after
final check. First full6467PASS/1FAIL and all focused/browser repairs documented
in VERIFICATION; no assertion removed or timeout/config relaxed. Implementation
hash follows in the documentation checkpoint. No push/PR/merge/deploy.

Verified implementation: `dbba0535f66b585ff3bdedb27894ee72b57872d1`.
Only documentation follows the final full gate and this implementation commit.
