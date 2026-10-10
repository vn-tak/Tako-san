# UI12 - Web Interface Guidelines review

2026-10-11 JST. Review source/runtime final UI12, UI07/UI11 inherited focus/chrome.
Rules fetched fresh from vercel-labs/web-interface-guidelines/main/command.md;
raw copy in `evidence/web-interface-guidelines.md`. No whole-repo compliance claim.

## Findings xử lý trong phạm vi

src/web/styles/kitchen-recipes.css:117 - resolved: detail facts/badges/paragraphs
used px line heights; unitless wrapping prevents measured text x2 clipping.

src/web/styles/kitchen-recipes.css:138 - resolved: fixed horizontal tabs collided;
intrinsic em grid/48px minimum retains native roving keyboard semantics.

src/web/styles/kitchen-recipes.css:174 - resolved: nutrition four columns clipped
labels at320normal/x2; adaptive cells, tabular numbers, full labels.

src/web/components/common/RecipeCard.tsx:43 - resolved: kitchen cards expose whole
title/description and native anchor href/modifiers; legacy remains explicit default.

src/web/components/common/RecipeMedia.tsx:22 - resolved: error chain has a terminal
HTML missing state; alt/dimensions/eager-lazy intent and synchronous identity reset.

src/web/styles/kitchen-recipes.css:210 - resolved: sticky discovery filters consume
UI11 header/banner metrics; short-height positions return to normal document flow.

src/web/styles/kitchen-recipes.css:228 - resolved: card feedback respects reduced
motion; only150ms border feedback, no `transition: all` or autoplay loop.

src/web/styles/kitchen-recipes.css:245 - resolved: native card touch-action declared.

## Residuals / follow-up

src/web/styles/kitchen-recipes.css:43 - low-priority residual: border-color transition
is not compositor-only as the guideline prefers. Reduced-motion disables it;
no frame-time performance certification. Consider instant border feedback in a
measured motion pass.

src/web/components/common/RecipeMedia.tsx:39 - priority hero uses eager loading;
no fetchPriority high. Measure actual LCP/CWV with approved photo and hosted network
before choosing preload/priority. Missing media is not proof of LCP performance.

src/web/pages/RecipeDetailPage.tsx:70 - existing tab state remains memory-only;
refresh/deep-link cannot preserve chosen panel. UI12 preserves lifecycle contract;
URL change belongs in an explicitly scoped route-state follow-up.

src/web/styles/kitchen-recipes.css:14 - photo crop remains object-fit cover4:3;
actual subject/crop review is pending. Never infer approval from a successful load.

Legacy RecipeCard default and unrelated/protected pages are not redesigned or
certified by this review. Brand owner, native zoom, Safari, screen reader,
virtual keyboard and hybrid-touch behavior need their own checks.

## Checked surface

Semantic anchors/buttons/labelled controls, decorative aria-hidden icons, full
names, existing live error/loading feedback, one h1, hierarchy, focus-visible
fallback, skip/chrome offsets, width/height, URL discovery filters/pagination,
interruptible motion, scoped tokens and touch were reviewed. Browser evidence
includes keyboard/retry/empty/error/long content, applicable axe0 and geometry0.
No unresolved blocking finding in the new recipe presentation slice was found.
Generic UX audit still FAIL and dependency audit41, recorded in VERIFICATION.md.
