# UI13 - Interface review

2026-10-11 JST. Fresh Web Interface Guidelines copy in evidence/web-interface-guidelines.md.
Scope: standalone board/client/validator/preview, not whole application compliance.

## Resolved findings

scripts/ui13/board.html - title Chawanmushi escaped card at 320px computed text x2.
Headings now wrap long words; all24card titles checked by browser geometry.

scripts/ui13/board.html - initial policy options had malformed closing markup.
Proper options restored; Prettier parser and actual filters now pass.

scripts/ui13/board-client.mjs - native dialog alone let reverse Tab escape the
expected last control in Chromium. Explicit first/last Tab cycling, native Escape,
close/save return focus and scrollable short/text x2 dialog now tested.

scripts/ui13/board-client.mjs - delayed File.text can race another import or a
new review. Generation fence keeps newer file/review authoritative; async fault
checks verify exact export after each race. Invalid import is atomic. The initial 256 KB import bound could reject valid
maximum-length exports; the final 3 MiB bound covers JSON escape expansion,
with maximum-length export/import and oversized-file atomicity checks.

scripts/ui13/board-client.mjs - markup in source/notes is rendered with textContent
or input.value; no untrusted innerHTML. Dataset JSON escapes less-than/U+2028/U+2029
at generation. Server CSP permits only exact inline script hash/local assets.

## Reviewed surface

Semantic sections/headings/native controls, labels/names, aria-live status/error,
visible focus, skip link, minimum 48px controls, dialog labelling/focus/scroll,
intrinsic wrapping/em grids, explicit image dimensions/lazy decode, local font
swap, touch-action and intentional tap highlight are present. Discovery filters
and selected recipe are URL-addressable over HTTP. file: History writes have a
safe fallback; direct-file rendering/export is tested. No destructive application
operation, remote fetch, silent upload or misleading persisted-state label.

Motion is a 280ms opacity/transform intro only under no-preference; reduced-motion
gets no intro animation. Both modes rendered; no frame-time/CWV certification.
Gallery original uses contain, candidate 4:3/16:9 use cover and original ratio stays
available. Crop preview does not alter source file or claim approved composition.

## Limits

Safe-area/native zoom/Safari/hybrid touch/virtual keyboard/screen reader/usability
need real device work. Current photos below fold remain lazy; no LCP proof from
this local board. Application domain routes/guards/whole brand are unchanged and
not re-certified by board screenshots. Generic UX heuristic still FAIL 159 files/
31 issues/1,006 warnings/88 passed checks; 41 dependency advisories remain. Structural
owner-claim validation does not independently prove identity/license/subject.
