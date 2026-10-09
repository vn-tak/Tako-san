# Tako-san UI rebuild: first implementation

Canonical repository: https://github.com/vn-tak/Tako-san
Base: `27d47b056455a57df811199cd7e9c32a84cbffe5`.
Branch: `codex/ui-rebuild-foundation`.

The user authorized starting the audited roadmap on 2026-10-09. This is the first
implementation milestone, not completion of the full interface rebuild.

## What can be reviewed

- `/fridge` (with `/inventory` compatibility): scoped warm canvas, pine actions,
  self-hosted Be Vietnam Pro, prototype lowercase lockup and octopus symbol.
  An empty search/category has a reset action and retains the stock count.
- `/recipes/thit-kho-trung`: responsive overview/preparation columns on desktop,
  16px instructions, explicit quantity evidence and preparation selected initially.
  Two eggs against four required produces a two-egg shopping command.
- Shared recipe matcher, detail and cooking drafts use T02 lot arithmetic. Required
  demands reserve before optional ones; compatible lots sum, duplicated/conflicting
  IDs are handled by the existing index. Contextual packages remain unresolved.
- Match percentage continues to describe ingredient types. No-buy requires enough
  known stock. List payloads omit verbose per-lot evidence; detail returns it.
- Offline cooking projects allocated quantities once across lots and retains the
  pending-sync contract. Server command, session, FEFO and revision guards are intact.
- Failed/missing recipe photos end at a neutral SVG. Existing canonical and legacy
  recipe media are retained while renderable.

Quantity evidence is not an expiry or allergy guarantee. No inventory dates are
projected into this adapter; the fixed reference date is inert. Expiry and dietary
policies remain with their existing authorities. No production data or schema changes.
See ADR-044 for contracts, compatibility and rollout scope.

## Brand prototype

The name remains **Takosan** under the existing identity contract. The coral
symbol and outlined lowercase wordmark under `public/takosan/rebuild` are a first
prototype. The wordmark derives from Be Vietnam Pro Bold with adjusted spacing;
it is not yet a bespoke final identity. Existing global navigation, PWA icons,
mascot scenes and protected payment presentation keep the current kit.

Palette: coral `#EE705E`, pine `#245D49`, ink `#202C28`, canvas `#F7F3EC`.
White on pine is 7.67:1; ink on canvas is 13.07:1 (see measured values in verification).
Coral is decoration/identity, not white-text body action fill.

Font source: `@fontsource/be-vietnam-pro@5.2.6`, Google Fonts Be Vietnam Pro v12.
Nine WOFF2 files cover Latin, Latin extended and Vietnamese at 400/600/700.
The SIL OFL is retained in `public/takosan/fonts/OFL.txt`. Font requests are same-origin;
legacy pages continue to use their current typography. Raw TTFs/tools used to outline
wordmark are temporary, not runtime dependencies. No package or lockfile changes.

## Verification

`evidence/browser-observations.json` records the local browser results and screenshots.
The harness uses synthetic data in the in-memory security preview, blocks external
requests and refuses non-loopback hosts. It is not production certification.

Reproduce:

```sh
NODE_OPTIONS=--no-experimental-webstorage PORT=5197 PREVIEW_API_PORT=8897 PREVIEW_APP_URL=http://127.0.0.1:5197 PREVIEW_T20_D1=true PREVIEW_MEAL_COMPOSITION_V2=true node scripts/security-preview.mjs
UI_REBUILD_OUT=docs/ui-rebuild/evidence node scripts/ui-rebuild-browser-check.mjs
```

Set `PLAYWRIGHT_EXECUTABLE_PATH` if Playwright's default browser is unavailable.
Run the full repository gates with `pnpm check`; exact results are recorded in
`VERIFICATION.md`, CURRENT_STATE and HANDOFF after execution.

## Next milestone

1. Finish responsive shell/PageHeader, typography and brand prototype in Home/catalog;
   resolve the Home canonical-planner adapter while retaining Week compatibility.
2. Put recipe filters in the URL and add a lightweight paginated list contract for
   the 500-recipe catalog, with API compatibility and measurements.
3. Extend the same components to inventory editor, scan/review, cooking and planning.
4. Finalize logo micro variants, complete the asset/motion kit and verify navigation
   discoverability with target users before changing the central scan action.

Remaining audit findings and the six-to-nine-week roadmap are tracked in the
baseline audit documents. Brand research, full-device/browser QA, user testing,
independent review, hosted CI and release remain outstanding.
