# UI14 - Fresh interface review

Guidelines retrieved 2026-10-11 from
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md;
exact text archived in evidence. Scope: changed motion/provider/navigation, their
Home/discovery/detail callers, existing font/image delivery and measured states.

## Actionable residuals

- `src/web/styles/kitchen-shell.css:54` - 320×420 textx2 fixed two-row navigation occupies about237px; content can scroll but reading space is poor. UI15 measured usability/layout follow-up.
- `src/web/styles/index.css:72` - Home fade temporarily lowers text contrast; axe mid-animation detects this, settled-state axe passes. Evaluate opacity reveal for primary content in UI15.
- `src/web/components/common/RecipeMedia.tsx:39` - eager priority has no fetchPriority high; hero starts after data/route/font waterfall. Separate controlled delivery experiment, not an extra UI14 fix.
- `src/web/styles/kitchen-fonts.css:2` - local subsets swap correctly but critical fonts are discovered after CSS/route; no preload currently. Measure selected subset/weight before changing preload policy.
- `src/web/services/recipes.ts:2` - ALL_RECIPES eager fallback keeps catalog/domain in entry. Protected; dedicated domain-delivery packet required.
- `public/_headers:2` - non-hashed public fonts/photos inherit no-store, while hashed /assets is immutable; preview warm caching cannot certify hosted behavior. Production config remains protected.
- `src/web/design-system/legacy-nav-indicator.tsx:5` - reduced layout motion has a single projected frame in both baseline and after; no prolonged movement, no zero-spatial-frame claim.

## Changed code review result

Deferred/loaded indicator is decorative aria-hidden. Static fallback keeps the same
active shape/color. Native Link, aria-current, labels, focus styles and selection
model are unchanged. Pending/rejected modules cannot prevent navigation. Provider
retains user policy. Async cleanup, concurrency, StrictMode/current identity and
rejection are tested. No new actionable correctness issue in the bounded runtime
diff. All50 settled snapshots pass applicable axe/overflow/broken-image/navigation/
recipe clipping checks; this is not all-route WCAG certification.

Generic UX helper is heuristic: entire working folder167files/41issues/1181warnings/
90checks STATUS FAIL, polluted by build/test artifacts. Scoped src/web108files/
23issues/734warnings/54checks also FAIL; CSS "unlabelled input" and social-proof
suggestions need human triage. Preserve both raw results; don't relabel as PASS.
Dependency audit fresh41advisories (4low/19moderate/16high/2critical); no lockfile edit.
React heuristic0critical/0warnings is narrow evidence; Lighthouse CLI unavailable.
Neither overrides the actual bundle/waterfall observations or certifies release.
