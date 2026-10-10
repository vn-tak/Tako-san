# UI12 - Recipe journey, route visual review and media coverage

Status: UI12_LOCAL_GATES_PASSED_GIT_PENDING, 2026-10-11 JST. ADR-055 before runtime.
Implementation: `UI12_IMPLEMENTATION_PENDING_VERIFICATION`.
Base `f7a27c16ef460b19322d3a463dc74dc09fa48ade`.
Canonical vn-tak/Tako-san; Tako-san-ui-rebuild; codex/ui-rebuild-foundation.

## Executed scope

User requested one large continuation. Baseline/source audit chose the bounded
Home/discovery/detail presentation slice. Kitchen cards retain default legacy JSX;
shared RecipeMedia owns loading/photo/missing and terminal permitted fallback.
Typography/control/grid/sticky changes prevent measured clipping at enlarged text,
short viewports and long labels. UI07 identity/UI11navigation and domain authority
remain. Resolver, public assets, routes/guards, services/stores/config are unchanged.

## Verified local acceptance

Full286files/6702PASS352.41s;type/lint/migrations/build PASS. Focused7/86PASS2.43s,
17new meaningful cases. Main167/17journeys,OFF24/1,state13/8,supplemental14:
218structured browser cases across seven widths,computedx2/short/combined,three
panels,keyboard/focus,load/error/retry/404/empty/long/unknown/fallback. Applicable
axe/overflow/brokenimage/unexpectederrors/newrecipeclipping0. Complete inventory
JSON equal before/after;zero domain writes in read/navigation slices (synthetic
onboarding PATCH classified separately). Separate E2E runner not executed UI12.

374frozen source/public records intact;257public build checks:256exact copies,
sw.js only existing build-ID transform.96page lifecycle records match base,
legacy card JSX tail byte-identical,protected diff empty. Baseline777Git blobs
verified. Owned previews stopped; six task ports closed. See round-12 reports,
raw/archive log receipts,manifest and subsequent GIT_VERIFICATION.md.

## Remaining work

500canonical local media rows pending;6allowed mappings,6wrong/missing,
429generic,59unreviewedphoto.24priority recipes and8local assets documented.
GenericUXFAIL157/31/989/86;41dependencyadvisories unchanged. Whole brand approval,
owner/device/Safari/nativezoom/screenreader/keyboard/usability/CWV/hostedrelease
and separate offline/domain fixes not certified. Source inventory47declarations
is not47independently certified pages.

Next: UI13-media-provenance-review.md, concrete local review artifact before
any media promotion. No UI13 runtime in this task. No push/PR/merge/deploy.
