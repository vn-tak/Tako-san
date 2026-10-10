# UI13 - Verification and evidence

2026-10-11 JST. Base `5da802735c318c56505bed85a133b049728afb39`.
Implementation: `UI13_IMPLEMENTATION_PENDING_VERIFICATION`.
Scope: standalone local review artifact/tooling; production application code unchanged.

## Executed gates

First full configured check exited 0: 287 files / 6,736 tests PASS, Vitest 348.77s,
typecheck, full ESLint, migration smoke, Vite 2.87s and Worker TypeScript build PASS.
After the concrete import-cap defect was fixed, final full result:
`PASS exit 0: 287 files / 6,737 tests, Vitest 357.58s; typecheck/full lint/local migration smoke/Vite 3.06s/Worker TypeScript PASS; remote gates skipped`.
Exact full command, used for both runs:

```sh
PATH=/opt/homebrew/opt/node@24/bin:$PATH CI=true TMPDIR=/private/tmp WRANGLER_SEND_METRICS=false VITEST_MAX_THREADS=2 VITEST_MIN_THREADS=1 VITEST_MAX_FORKS=2 VITEST_MIN_FORKS=1 pnpm check
```

Remote schema/Week parity are skipped by the configured local gate. Local build
success is not deployment evidence. No separate app-domain E2E runner or fresh
whole-app browser matrix is claimed by UI13; UI12 app evidence remains historical.

Focused: initial and pre-cap final 3 files / 59 tests PASS (1.08s / 1.17s), including
34 new validator cases, 17 UI12 cases and eight existing media-policy cases.
Final focused after cap correction: `PASS 3 files / 60 tests in 1.15s (35 new validator cases)`.

```sh
pnpm exec vitest run tests/unit/ui13-media-review.test.mjs tests/unit/ui12-recipe-media.test.tsx tests/unit/recipe-media-presentation.test.ts
pnpm exec eslint scripts/ui13-media-review.mjs scripts/ui13-browser-check.mjs scripts/ui13/board-client.mjs scripts/ui13/review-contract.mjs tests/unit/ui13-media-review.test.mjs
pnpm exec prettier --check scripts/ui13-media-review.mjs scripts/ui13-browser-check.mjs scripts/ui13/board.html scripts/ui13/board-client.mjs scripts/ui13/review-contract.mjs tests/unit/ui13-media-review.test.mjs
node scripts/ui13-media-review.mjs check
node scripts/ui13-media-review.mjs validate
```

Final lint/format/deterministic/draft results: `PASS final targeted ESLint, Prettier, deterministic generation and initial draft validation`.
New roundtrip test uses a full maximum-length draft whose JSON escaping expands
past the old 256 KB bound. Structural validation never asserts license or promotion.

## Actual browser verification

Earlier accepted `browser-final`: 33 snapshots / 10 journey groups PASS. Final
`browser-import-cap`: `PASS 33 snapshots / 11 journey groups`. Supplemental final:
`PASS seven supplemental checks (four visual, two async races, one direct-file/export)`. Accepted earlier supplemental had seven checks:
four visual, two delayed-import races and one direct-file/export check.

```sh
node scripts/ui13-media-review.mjs serve
UI_REBUILD_OUT=.artifacts/ui13/browser-import-cap node scripts/ui13-browser-check.mjs
UI_REBUILD_OUT=.artifacts/ui13/supplemental-import-cap node .artifacts/ui13/supplemental.mjs
```

Chromium samples: widths 320/360/390/430/768/1024/1440, computed text x2 at 320/768,
short 390x420/768x420 and combined 320x420x2. Search without diacritics, policy/
decision filters, empty/reset/URL/deep link, native modal Tab/Shift+Tab/Escape/return
focus, validation focus, export literal notes, malformed/cross-dataset/path import
atomicity, reload/import roundtrip and synthetic complete human claims were tested.
Both normal/reduced motion rendered. Cap correction adds full maximum-length
export→reload→import and oversized import preserving the existing draft.

Applicable axe violations, measured overflow, broken images, checked title/control
clipping and unexpected pageerrors: zero in accepted main samples. Supplemental
visual samples check applicable axe/overflow/broken images. Mixed photos/missing
and original crop viewed directly; no images altered to produce evidence.
Browser network writes and external requests zero. A separate APIRequestContext
POST probe intentionally receives 405; do not describe the entire test session as
zero requests. Supplemental async races cannot overwrite a newer imported draft
or a newly saved review. Direct `file:` HTML loads local assets/fonts and exports.
Computed fonts and lab geometry are synthetic, not device/native-zoom certification.

## Fresh asset/source audit and integrity

`node scripts/ui03-media-audit.mjs` PASS. Fresh local mapping matches the archived
UI12 mapping exactly: 500 canonical / 71 static / 46 URLs; six allowed mappings,
six wrong/missing, 429 generic and 59 unreviewed photo; all 500 canonical media
rows pending. 21 reused URL groups, eight local originals, zero duplicate local
hashes. 24 priority records have four permitted current photos and 20 missing.
No new production-demand, photography-method, source or rights inference.

383 frozen source/test/script/config/public/generated records include the prior
374 unchanged plus nine review records. Entire `src` and protected-path diffs
against base are empty. All 257 public source files unchanged. Built public assets:
256 exact byte copies; `sw.js` matches the existing Vite build-ID replacement
`__TAKOSAN_BUILD_ID__`→`local`. This is not a claim of 257 byte-identical build copies.
Final integrity after the corrected full run: `PASS 383 frozen records, entire src/protected unchanged, public 256 exact + one expected SW transform, seven ports closed`.
No backend/packages/schema/migrations/services/stores/dependency/payment/auth/
production config change. No remote DB/R2/media fetch/upload/write, push/PR/merge/deploy.

## Failed attempts and recovery

- Initial template had malformed option closing tags; Prettier failed. A chained
  command still built and its last exit 0 masked the formatter error. Valid markup
  and independently checked formatting recovered; failed logs remain archived.
- First and second browser runs stopped at 320px text x2: Chawanmushi width 246px,
  scroll width 282px. A Python replacement expected already formatted CSS while
  the template was still minified; marker assertion failed without changing code.
  Fixed template placeholders/formatting and long-word wrapping recovered geometry.
- Third run passed 31 visual samples then reverse Tab failed. Native modal alone
  did not meet the expected boundary; explicit cycling fixed it. Fourth/final
  accepted before cap correction: 33 snapshots / 10 journeys each.
- Generation fence was added for late File.text after another import or saved
  review; two supplemental faults demonstrate both outcomes. Final browser-harness
  format warning was repaired; frozen record updated only for the intended file.
- Final review found valid full notes could produce an export beyond the 256 KB
  import cap. Raised the bounded import to 3 MiB, covering worst-case JSON escaping,
  added validator and browser roundtrip/oversize tests, and reran configured gates.
- Contact sheet first used system Python without PIL; bundled workspace Python
  rendered the comparison successfully, then it was viewed directly.
- First archive guard refused a previously created empty evidence directory; no
  archive files were overwritten. Allowed only an empty destination, then reran
  archive/staged integrity. The staged check before archiving lacked source-freeze;
  no commit was made until archive and integrity completed.
- Some inspection searches named nonexistent historical reports; read-only misses,
  not product failures. Shell marker failures without their own raw logs are
  documented here; not every shell operation has a separate captured log.

Failed screenshot directories are retained and classified separately from accepted
outputs in evidence/EVIDENCE_INDEX.md. Terminal log normalization, if required for
Git whitespace checks, has raw/archive byte/SHA256 receipts and exact raw gzip.
No failed audit or screenshot is silently relabelled PASS.

## Open audit/device work

Fresh generic UX audit: FAIL, 159 files / 31 issues / 1,006 warnings / 88 passed
checks. Its heuristics include tests/CSS and protected unrelated pages; no mechanical
social-proof/payment changes or whole-repo UX PASS. Dependency audit: 41 advisories,
four low / 19 moderate / 16 high / two critical; lockfile unchanged. Reports preserved.
Source/license/subject/crop and brand owner decisions still need human evidence.
Safari/real devices/native zoom/screen reader/virtual keyboard/usability/frame-time/
CWV/hosted release remain open. UI14 is ready only for independent local frontend
performance/motion audit; UI13 does not authorize catalog promotion or release.

## Archived evidence

Manifest covers 263 payloads (44,149,618 bytes); 57 logs have raw/archive byte and SHA256 receipts, 5 normalized text logs also retain exact raw gzip. Manifest excludes itself, mutable prose and the following Git-object receipt.
