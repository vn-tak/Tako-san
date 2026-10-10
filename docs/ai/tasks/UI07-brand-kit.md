# UI07 - Tako-san digital identity and core shell

Authorization: continue Tako-san UI rebuild, 2026-10-10 JST.
Canonical vn-tak/Tako-san; codex/ui-rebuild-foundation.
Base 3c593d941fb6ffa1fefffb7c4c5050c6be4e34b7. ADR-050.
Status: UI07_LOCAL_VERIFIED_REVIEW_REQUIRED.
Local scope complete:274files/6551tests full PASS,82focused,41browserchecks/45PNG/
6journeys.71frozen hashes; reports round-7 FOUNDATION/VERIFICATION. Implementation
checkpoint recorded after Git-object verification in subsequent documentation
checkpoint. Owner/device/remaining routes/hosted/release review remains.

## Outcome and scope

Complete a reviewable digital brand direction derived from UI01-UI06: warm canvas,
pine/coral, Be Vietnam Pro and friendly octopus. Preserve displayed Takosan and
technical identifiers. Deliver vector masters, horizontal/stacked/wordmark/symbol,
light/dark/one-color and optical micro versions, deterministic PNG/favicon/PWA/
maskable/iOS/OG exports, usage rules and an actual-size preview. Integrate into
existing migrated routes and browser metadata. Desktop persistent navigation owns
one lockup; immersive workflows and mobile retain their header identity.

Old TAKOSAN_BRAND, mascot, icon, content and legacy asset paths remain compatibility
assets for unrebuilt surfaces. This packet does not redraw every mascot or icon,
rebuild account/settings/auth/payment, change domains, Worker/schema/migrations,
dependencies/production flags/auth protocol/domain commands, deploy or publish.
No owner approval of final brand, trademark/recognition research or OS install QA
is inferred from local tests.

## Decisions, dependencies and sequence

1. Inventory source SVGs, metadata/manifest/SW, core and legacy callers, font/OFL
   and generator/tests; record outdated details and transition boundary.
2. Author simple octopus and micro masters; derive wordmark from existing licensed
   UI01 Be Vietnam Pro Bold outlines. Avoid system-font-dependent SVG text and
   external SVG references. Document provenance and generate variant lockups.
3. Generate exports locally using already pinned sharp. Default brand:icons builds
   new direction without external kit; explicit-kit mode remains compatible.
   Maskable essentials must fit the central 80%-diameter safe circle; PNGs opaque.
   OG master is fully outlined and export is 1200x630; no invented AI guarantee.
4. Update scoped contract/core shell and public metadata/precache only. Keep old
   runtime palette/TAKOSAN_BRAND unchanged for remaining/protected surfaces.
5. Add meaningful render/export/determinism/safe-zone tests. Run Chromium actual
   size/context/keyboard/core-route QA and guideline review, then full pnpm check.
6. Freeze sources, review protected paths, capture hashed evidence and update
   reports/state/boards/handoff. Implementation commit then verified docs checkpoint.

## Acceptance criteria

- Micro 16/24 and standard 32 use deliberate optical geometry, no broken assets;
  variant files are self-contained, predictable dimensions and transparent vectors.
- Exports regenerate byte-identically in one environment; manifest/HTML/SW callers
  resolve; regular/iOS/maskable PNGs opaque with tested dimensions and safe crop.
- One visible horizontal brand on persistent desktop; mobile/immersive preserve
  accessible home identity, back/action touch targets and no horizontal overflow.
- Actual-size and light/dark/one-color preview has font attribution, size/clearspace,
  palette/contrast, tone/motion and adoption limits; no final-approved claim.
- Focused tests, browser evidence, full type/lint/test/migration/build pass on frozen
  source, failures retained and explained. No protected/domain/backend edits.

## Risks and handling

Old and new kits coexist during scoped migration: explicit contracts/provenance and
caller inventory prevent accidental overwrite. Small marks lose facial details:
use separate micro master, inspect 1x outputs. Maskable crops remove outer details:
measure safe circle against pixel artwork and show round/squircle crops. PWA caches
may hold old bytes: new paths and existing release-aware SW lifecycle, no policy
rewrite. Desktop hide must follow actual layout mode, never hide immersive logo.
Hosted scrapers, Safari, physical launchers, usability and owner approval remain
separate follow-up gates. No blocking open question for this authorized local round.
