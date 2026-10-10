# UI11 - Navigation and responsive shell

Canonical vn-tak/Tako-san, local checkout Tako-san-ui-rebuild,
branch codex/ui-rebuild-foundation, base13cef9f8e6dc72549071426ad98df70e0d16f4a4.
ADR-054 recorded before runtime. Implementation in progress.

## Baseline

Ten local Chromium states in .artifacts/ui11/audit, script ui11-shell-audit.mjs.
Seven widths320/360/390/430/768/1024/1440, text x2 at320/768, short768x420.
Directly viewed mobile text2, tablet text2 and short tablet: mobile three label
pairs overlap, text escapes69px bar; tablet truncation; short rail clips labels.
No horizontal overflow does not establish readability. The320 header row has
no room for another44px action when Back is present.

## Chosen layout and sequence

ADR-054 defines five-root mobile bar, Scan header row,112px scrolling tablet rail,
256px desktop sidebar, exact active-route boundaries and a measured offset contract.
Keep UI07 palette/assets/type. Implement kitchen variants with legacy defaults;
verify actions/focus/short/text2, then meaningful tests and full gates; preserve
failed evidence and commit/verify/checkpoint. No remote or domain changes.

## Implementation

Kitchen-only variants preserve default legacy rendering. Mobile Scan is in the
shared header; review pages adopt it. Tablet112px and desktop256px share five
root items, segment active matching and named Scan. Root flag destination retains
module-load build behavior. No extra route or drawer. Shopping/review intentionally
have no selected root. Persistent brand is owned by header below640, sidebar above.

useKitchenShell binds late chrome and uses actual nav height including safe area.
The --kitchen-action-gap token prevents a previous-frame bottom offset from
feeding back into reserves during nav resize. Inventory Add, recipe Cook, settings
Save, scan confirmation and unused BottomCTA consume scoped offsets; main reserves
fixed action height. Focused main controls clear top/bottom chrome; dialogs/actions
are excluded. Cleanup restores document scroll padding and observers/queued frames.
Short<=600px header/action blocks are static; tablet/desktop rail scrolls.

### Adjustments from actual failures

First5-cell version removed overlap but broke words at text x2; em grid now uses
two rows. Enlarged settings StickyActions clamped to the fieldset start behind
nav; kitchen Save is fixed with measured reserve. Direct screenshots caught recipe
and scan buttons with compressed text despite axe/offset PASS; scoped intrinsic
button height/line-height resolves the action labels. Existing inner recipe badges
remain a residual finding. No reduced-motion animation added to kitchen indicator.

Harness failures are retained: transient session h1, attribute-order regex, pure
scope import pulling auth localStorage, missing select/input selectors and HMR
interrupting keyboard navigation. Header import belongs to review pages; source
scope stays pure. Final captures wait4 scan rows and final page rather than pending
zero-item shells. Domain callbacks are preserved; no stock/write authority changes.

Injected safe-area padding exposed another real issue: default ResizeObserver
tracks the content box and ignores padding-only changes. Chrome observers now
request border-box; actual total nav/safe-area height updates without depending
on a viewport resize. Unit binding contract and browser padding proof cover this.
Preliminary full runs were interrupted for visual action text and observer fixes;
none are counted as PASS. Final full begins only after accepted browser evidence.


The first completed full exposed4 scan fixture suites:53 failed assertions and
one not loaded (6621pass/6674collected,354.73s). Existing TopBar mocks now isolate
KitchenHeader in receipt/privacy business fixtures; confirmed fridge assertions
query the review heading precisely. Every domain/privacy/poll/quantity assertion
remains. Recovery6files/115PASS2.28s; runtime unchanged,160source hashes frozen.


## Accepted local outcome

Đợt UI11 hoàn tất phần shell điều hướng local của Tako-san: năm đích dễ đọc,
Scan có vị trí riêng, tablet cuộn được, các thanh thao tác và focus dùng số đo
chung. Đây là một đợt triển khai trong kế hoạch xây lại; chưa hoàn tất toàn bộ
UI/UX, nội dung ảnh, kiểm chứng thiết bị hay phê duyệt thương hiệu.

Final focused14files/255PASS6.34s;full285files/6685PASS344.71s,type/lint/migration
smoke/Vite2.97s/WorkerTS PASS. Runtime/browser unchanged through final fixture and
Wrangler startup recovery. Source160 and expanded all99publicTakosan build assets
verify; final-validation and log receipts retain every outcome. Git checkpoint next.
