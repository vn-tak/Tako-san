# UI10 - Fresh Web Interface Guidelines review

Source fetched2026-10-10: evidence/web-interface-guidelines.md. Review covers the
UI10 diff and shared rules actually used; browser61snapshots complements source.

src/web/features/week/WeekWorkspace.tsx:20 - shared header/oneh1/exact back; Intl dates/currency, scoped workspace checked.
src/web/features/week/WeekSetupChoices.tsx:21 - native labelled radio controls, shared hit targets and selection states checked.
src/web/features/week/MealCard.tsx:59 - real Link for detail; native swap action; dimensions/lazy/fallback and non-cooking state checked.
src/web/features/week/WeekSummaryCards.tsx:11 - valid dl/dt/dd groups, projections and unlimited target checked; original definition-list violation fixed.
src/web/features/week/MealSwapSheet.tsx:31 - labelled dialog, useModalFocus, error/retry, native actions and wrapping checked.
src/web/features/week/WeekExportModal.tsx:113 - awaited device receipt, safe focused error/live feedback, cancellation/epoch and dimensions checked.
src/web/pages/WeekDashboardPage.tsx:52 - real navigation links; readable projections/empty/error/retry and two-column/stacked board checked.
src/web/pages/WeekGeneratingPage.tsx:49 - real async status, no fabricated progress; preserved private/StrictMode effect checked.
src/web/pages/WeekSettingsPage.tsx:21 - session-only draft copy, labelled fields, explicit return and no timed navigation checked.
src/web/pages/WeekShoppingPage.tsx:65 - selected snapshot, pending locks, explicit import, scoped late receipt and completion/error focus checked.
src/web/styles/kitchen-week.css:558 - dynamic-height dialog/safe areas/overscroll, reduced motion,48px buttons, text wrapping and heading reflow checked.

Remaining observed boundaries, not a whole-application compliance claim:

src/web/design-system/navigation.tsx:62 - shared11px leading-none labels and six mobile cells remain dense; UI11 packet covers shell/offsets/active/flag/immersive contracts.
src/web/pages/MealDetailPage.tsx:17 - recipe tab stays in memory; existing meal URL remains deep-link authority, no tab query param in UI10.
src/web/pages/WeekShoppingPage.tsx:19 - section/mode remain ephemeral; reload returns to list, no durable checkout-state promise.
src/web/pages/WeekSetupPage.tsx:44 - stage lives in memory; explicit review/generate remains required, no resume-after-document-reload claim.
src/web/features/week/WeekExportModal.tsx:106 - legacy domain remains in exported text by packet's unchanged-generator contract; brand/media follow-up still needed.

Source review/axe0 cannot certify screen-reader output, Safari, native zoom, hybrid
pointer scrolling, actual safe-area hardware or usability. No new dependency,
production media, account authority or payment surface change was inferred.
