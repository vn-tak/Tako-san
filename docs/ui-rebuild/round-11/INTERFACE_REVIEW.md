# UI11 - Interface review

Fresh Web Interface Guidelines retrieved into evidence/web-interface-guidelines.md.
Review scope: navigation variants, KitchenHeader, AppLayout, measurement hook,
kitchen-shell.css, action markers and review header JSX. Runtime scope follows
ADR-054; existing page domain, legacy and protected contracts are preserved.

## Resolved findings

- navigation.tsx: mobile six-cell fixed bar overlaps labels at computed text x2.
  Kitchen variant keeps five roots; an em grid reflows to two rows, retains full
  labels and real Links/aria-current. Static active surface avoids shared-layout
  motion between hidden navs; legacy default indicator remains unchanged.
- navigation.tsx: tablet truncated10px labels and short-height flex compression.
 112px scrolling rail,14px wrapping labels and nonshrinking rows. Desktop256px,
 16px roots, named Scan, native scrolling on focused offscreen rail links.
- KitchenHeader.tsx: Scan cannot fit the existing320 row with Back/brand/actions.
  Dedicated44px-minimum labelled mobile row; tablet+ Scan owned by rail/sidebar.
  One visible brand destination at every persistent breakpoint; immersive retains
  existing identity. Scan review pages now mount the shared header.
- AppLayout/action CSS:68px assumptions cannot reserve enlarged/safe-area chrome.
  ResizeObserver contract follows visible nav/header/banner/action heights, with
  late lazy route rebind, cleanup and batched reads before writes. Rail width is
  one CSS token. Main reserves fixed actions; actual document scroll padding and
  focused controls clear chrome. Dialog/alertdialog/toolbar focus remains owned
  by existing components. Short<=600px headers/actions flow normally.
- settings StickyActions: text x2 exposed fieldset-start clamping behind nav.
  Kitchen fixed Save toolbar receives measured main reserve; short viewport flows.
- Recipe/scan confirmation: common fixed-height buttons compress enlarged labels.
  Scoped48px-minimum intrinsic height,1.4 line-height, wrapping and stable icons.
- Navigation controls have hover and focus-visible states, full labels,24px icons,
  minimum44px Scan/48px action targets and touch-action manipulation. SVG icons
  keep decorative aria-hidden and existing kit geometry. No new asset dependency.

## Remaining findings and limits

- RecipeDetailPage existing hero badges still have cramped fixed/leading-none
  geometry at computed text x2; catalog often uses the honest missing-image plate.
  UI11 corrects shell/actions, not all inner-page typography or image content.
- Mobile enlarged navigation grows to about237px instead of squeezing text;
  Scan header adds a row. Short viewports release sticky header/page actions;
  navigation remains persistent. This is a measured readability tradeoff requiring
  real-device/owner/usability assessment; thumb-reach discoverability not certified.
- Rail may scroll at short/enlarged sizes. Scan is reachable by keyboard scrolling;
  all roots and Scan cannot remain simultaneously in a420px viewport with28px text.
- Existing root and contextual IA preserved: shopping and review have no selected
  root. Kitchen segment matchers prevent mealtime/recipes-old/week-old false states;
  legacy broad matchers remain a compatibility limitation outside adopted scope.
- Browser validates Chromium local only. No claim for Safari, native browser zoom,
  screen reader speech, virtual keyboard, hardware safe areas, CWV or hosted release.
  Computed text x2 and injected nav padding/banner events are labelled synthetic.
- Generic UX audit scans tests/fixtures and gives irrelevant hero/social-proof
  suggestions as well as existing warnings. Record its actual FAIL, not whole-repo
  compliance. Dependency advisories are retained; no lockfile remediation here.
- Week queueWrite durability/projection replay, inventory fallback/queued metadata
  receipts and historical export domain remain separate packets.

No new actionable navigation/shell overlap found in the final accepted local matrix;
this does not assert whole-system accessibility or product/brand approval.

Padding-only safe-area regression: default ResizeObserver content-box ignored30px
injected nav padding. Fixed using border-box observation; accepted browser asserts
actual total nav-height equality without a window resize. This is a layout contract,
not hardware safe-area certification.

Final fixture recovery leaves generic UX154files/30issues/977warnings/85checks
STATUS FAIL (earlier980warnings). Scan authority/privacy fixture mocks now isolate
new chrome; confirmed assertions target the review header. Full/runtime browser
must remain separately verified; no test weakening or domain change.
