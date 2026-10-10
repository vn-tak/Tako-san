# UI05 - Cooking steps and explicit actual-use confirmation

Authorization: continue Tako-san rebuild, 2026-10-10 JST.
Canonical vn-tak/Tako-san; branch codex/ui-rebuild-foundation; base edf2e9a.
Status: UI05_LOCAL_VERIFIED_REVIEW_REQUIRED.
Implementation `cef5acb5a21964fb58d4886fb58ffd098e54fe89`. Read ADR-048 before runtime edits.

## Outcome and scope

Preserve RecipeDetailPage as preparation with UI01 quantity/conversion evidence.
Rebuild /cook/:slug and /cooking/:id in the established pine/coral/warm canvas,
Be Vietnam Pro identity, using a readable step workspace, optional voice/manual
controls and wall-clock timer. /cooking/complete and step completion share one
actual-use review, fractional inputs, explicit confirm, errors and pending status.
No invented dish images, provenance or completed server mutation.

## Decisions and sequence

1. Session-owned in-memory draft and immutable command snapshot: stable retry ID,
   prevent double submit, lock editing after ambiguous outcomes. Only a known
   rejected command permits authoritative stock refresh and a fresh review/key.
   Pending-sync and server-success remain distinct, with explicit inventory link.
2. Number inputs preserve blank; validate finite/nonnegative/max100000 and strict
   sequential availability across duplicate ingredient rows before submit. Refresh
   keeps actual-use edits and recomputes stock; does not silently clamp intent.
3. Recipe-route/run/session/unmount fences reject late voice and completion callbacks.
   Empty steps and direct completion without a draft are recoverable states.
4. Deadline timer compensates background elapsed time, pauses/resumes accurately,
   ends once at zero; step navigation resets timer as before. Live regions announce
   transitions, not every second. Expired control stays focusable/aria-disabled.
5. Browser QA at320/390/768/1024/1440, short viewport/enlarged text/reduced motion,
   real local Worker completion/replay/stock allocation plus mocked error/voice.
6. Focused behavioral regressions then full pnpm check, complete diff review,
   implementation commit and verified-hash documentation checkpoint.

## Boundaries and risks

Keep Worker inventory/recipe/tenancy/revision/idempotency/Week authority unchanged.
No migrations/dependencies/config/production flags/payment/auth/infrastructure,
remote DB/media/provider/credentials/push/PR/deploy. Device/browser speech and
background alarms cannot be guaranteed; manual controls remain available.
Cooking drafts/ambiguous attempts are in-memory and lost on reload; warn while
unfinished. Durable outbox remains existing mechanism, not new command persistence.
Do not label cached offline data as an authoritative refresh. Brand kit/media and
remaining planner/composer/shopping/device/usability/release work stay open.

## Actual verification and handoff

Final full pnpm check exit0:270files/6514tests PASS,342.45s; lint/typecheck/
migration smoke/build PASS. Focused7files/70tests6.36s; browser32checks/55PNG/
12journeys,0axe/overflow/brokenimages/pageerrors.57evidence payloads plus manifest,
16frozen source hashes verified. See round-5 VERIFICATION for exact commands,
first Wrangler timeout/32test recovery, interrupted focus-fix run and final pass.
All own previews stopped. No remote/push/deploy or protected authority changes.
Next UI06 planning/composer/shopping slice, then brand/media/device/release review.
