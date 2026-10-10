# UI12 - Recipe journey, responsive content and media states

Canonical vn-tak/Tako-san, branch codex/ui-rebuild-foundation.
Base f7a27c16ef460b19322d3a463dc74dc09fa48ade, 2026-10-11 JST.
ADR-055 recorded before runtime. User authorized one large continued UI task.

## Outcome and boundaries

A coherent Home/discovery/detail recipe presentation with full names, readable
facts/actions at enlarged text, useful missing-image states and an audited media
backlog. Keep UI07 identity, UI11 navigation and all existing domain authority.
Audit the other migrated route families and both flags for regression; change only
the recipe/content slice justified by measured failures. No protected/remote edits.

## Ordered work

1. Source/baseline audit, route/state matrix and media re-audit; record severity
   and exact triggers. COMPLETE: ten valid base-configured captures; base777blobs verified; media500/static71 audit.
2. Kitchen card and shared media state component; recipe detail/state/panel CSS;
   responsive discovery controls. Preserve default card JSX and domain callbacks.
3. Meaningful media/Link tests; real browser panels, flags, state faults and long
   content. Compare inventory JSON and track API mutations on read journeys.
4. Fresh guidelines review, focused/type/lint/full gate; fix actual failures and
   archive all outcomes. Validate existing public asset bytes after build.
5. Update state/ADR/boards/handoff and reports; freeze sources/evidence; local
   implementation commit, verify Git blobs, then documentation checkpoint.

## Acceptance and risks

Seven widths320/360/390/430/768/1024/1440; computed text x2 at320/768, short390x420/
768x420. No overflow, broken images, unexpected errors, clipped recipe labels,
recipe badge/tab collisions or unintended writes in tested cases. Native tab
keyboard/focus, card modifier clicks, back context and loading/error/empty truth
remain. Photo fallback uses resolver authority; no fabricated source/licensing.

Do not run two Vite previews/media SSR audits against the same optimizer cache at
once: baseline attempt exposed504 Outdated Optimize Dep; restart recovered after
media audit. Run Planner ON then OFF sequentially. Synthetic fonts/faults/crops
are not hardware, native zoom, offline durability or photo-content approval.
Dependencies/provenance and separate offline/domain issues remain recorded.

## Executed checkpoint

Steps1-4 complete: scoped implementation,86focused/6702fullPASS,218structured
browsercases/26main-state-offjourneys,final10capturesclipping0,freshguidelines and
media plan. GenericUXFAIL/dependency41 retained. Step5 complete: reports/state updated;implementation commit and724Gitblobs
verified,receipt added. Following docs checkpoint records verifiedimplementation
without its own hash;source/evidence unchanged.
Implementation `03e16c78850b061784dc2e9a01323bd7e74b65f3`.
