# UI04 - Scan, review and explicit inventory confirmation

Authorization: continue the Tako-san UI rebuild, 2026-10-10 JST.
Canonical vn-tak/Tako-san; local branch codex/ui-rebuild-foundation.
Base cf607e4. See ADR-047 before implementation.

## Outcome and scope

One coherent scan -> review -> edit -> explicit confirmation -> inventory journey
using the established pine/coral/warm canvas identity and Be Vietnam Pro. Shared
review fields retain names, fractional quantities, all eight units, storage,
expiry supplied/estimated/unknown, immutable extraction and confidence. Rejection
is reversible and remains durable evidence. Canonical mapping remains resolved
by the existing server contract; no new catalog picker/authority is introduced.

## Findings to resolve

- Camera mode and review screens use different visual systems; dense tiny text,
  raw unit codes and oversized fixed action bars impede mobile editing.
- ScanPage advances claimed processing stages on timers rather than server state.
- Fridge confirm ignores pendingSync feedback. Offline synthetic imports iterate
  rejected rows and replace invalid quantities with 1.
- Rejected fridge fields still participate in native form validation; invalid
  accepted edits can reach programmatic submit. Camera cleanup captures an old
  stream and may fail to stop the stream opened by the current effect.

## Sequence and acceptance

1. Shared fields/layout/step/status components; scoped shell and responsive CSS.
2. Apply both review pages and scan workspace without changing scan command,
   quota/session/ownership/idempotency/revision/Week compatibility contracts.
3. Truthful uploading/pending stages, pending-sync receipt/scan feedback; validate
   accepted quantities and skip rejected synthetic offline lines. Release camera
   tracks on switch/unmount; cancel unfinished image reads on mode changes and
   allow selecting the same file again, with gallery recovery after errors.
4. Meaningful regressions for invalid/rejected/fractional edits, pending-sync and
   camera cleanup; retain existing T13/session/queue tests. Actual local Worker
   browser journeys at320/390/768/1024/1440 plus keyboard-height/reflow/reduced
   motion, screenshots and axe. Verify edits/rejection/expiry after reopen.
5. Freeze runtime/tests/scripts; Node24 bounded-worker pnpm check. Review full
   diff and protected paths; implementation commit then verified-hash doc checkpoint.

Acceptance: no false AI progress, no rejected stock import, no fabricated quantity,
no cross-route/session source preview, explicit confirm only, no horizontal page
scroll in tested widths; readable16px fields/44px controls and retained focus/error
semantics. Document exact evidence, failures and remaining browser/device limits.

## Boundaries

No backend architecture/schema/migration/dependency/flag/payment/auth/infrastructure
changes, remote DB/R2/provider calls, production credentials, push/PR/merge/deploy.
Brand remains prototype. Source-image persistence, authoritative canonical remap
editor, image content batches and remaining roadmap are separate work.

## Actual implementation

Shared ReviewHeading/Summary, ReviewFields and explicitly bound ReviewSource,
scoped scan shell/CSS; preserved photo/receipt lifecycle handlers. Upload no longer
advances claimed stages on time. PendingSync photo feedback precedes inventory
navigation. Accepted validation, ID-only rejected submission, offline accepted-only
quantity-safe import/estimate projection (zero-imports report no pending sync), camera stream cleanup and delayed image
read cancellation implemented. Receipt ingredient image lookup corrected.

Final focused 13 files / 188 tests PASS, including the 10 offline regressions. Final local
browser 29 axe/layout checks, 51 PNG, 8 journey groups, 0 violations/overflow/brokenimages/
pageerrors. Real synthetic local Worker confirms and reopened evidence checked;
provider, physical camera, Safari/device/zoom/screen-reader/usability untested.
Final full gate exit0,268 files/6490 tests PASS, Vitest 324.11s; lint/typecheck/
migration smoke/build PASS. Frozen19 source hashes and evidence52 hashes verified.
Verified implementation checkpoint in round-4/VERIFICATION and HANDOFF.
No remote data/provider calls or protected runtime changes. Canonical remap picker
and image persistence remain separate; existing server mapping fallback documented.
