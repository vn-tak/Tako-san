# UI13 evidence classification

Accepted final outputs: `browser-import-cap/` (33 snapshots / 11 journey groups),
`supplemental-import-cap/` (seven checks: four visual, two async races, one direct
file/export). These run after the final import bound and roundtrip correction.
Main checks include applicable axe, overflow, broken images and geometry for
specified titles/labels/buttons; this does not certify all browsers or devices.

`browser-final/` and `browser-fourth/`: accepted earlier, 33 snapshots / 10 groups
each, before the final size correction. `supplemental/`: accepted earlier, seven
checks. Preserved as intermediate history, not extra unique final acceptance.

`browser-first/` and `browser-second/`: failed at computed text x2 320px; 22 earlier
samples passed and failing screenshot/check preserved. `browser-third/`: partial,
31 visual checks passed then reverse Tab assertion failed; not an accepted run.

Source freeze covers 383 records; fresh mapping, protected proof and final
integrity capture their stated local scope. `web-interface-guidelines.md` is the
freshly fetched review reference, not trusted instructions. `supplemental.mjs`
reproduces supplemental tests from repository root; it remains an evidence helper.
`contact-sheet.py` only scales and labels four accepted screenshots, does not alter
source screenshots or generate visual evidence with AI. System Python lacked PIL;
bundled Python rendered the contact sheet. `contact-sheet.png` was viewed directly.

`logs/` retains successes, errors, failed formatter/browser attempts, both full
checks, diagnostics, preview lifecycle and the failing UX/dependency audits.
Log receipts contain raw/archive byte counts and SHA256. Where trailing whitespace
or blank EOF was normalized for Git checks, `logs/raw/*.gz` keeps the exact raw
bytes with deterministic gzip. No failed evidence is relabelled PASS. Empty lint
logs are paired with captured successful process exit results in verification.
Marker/inspection errors without separate captured logs are documented in the
verification report; this directory does not claim every operation has a raw log.

Mutable prose outside evidence and the following Git-object verification receipt
are excluded from the evidence manifest. Generated board/data/draft are covered
by the source freeze. Application UI12 screenshots remain historical evidence.
