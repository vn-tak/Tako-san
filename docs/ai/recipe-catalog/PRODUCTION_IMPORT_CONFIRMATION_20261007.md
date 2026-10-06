# Production import confirmation - 2026-10-07 JST

Production remains incomplete. Recovery [37536969564](https://github.com/vn-tak/Tako-san/actions/runs/37536969564)
was normally approved by vn-taphoanhatung, then failed at BOOKMARK_AND_IMPORT.
Its receipt reports ATTEMPTED_COMPLETION_UNCONFIRMED and contains no importFailure,
provider code or post-import certification. Do not attribute the earlier incident's
10000 response to this run. No retry, rollback, 0039 or application deployment has
followed this new unknown outcome.

## Preserved incident

The immutable source is a8fa0324bb609274cc07a5c4b079e7ee4633fd83, repair ID
t21_v1_37536969564. Root and an independent reviewer reconstructed the same V2
plan offline: 296 restore / 36 rollback statements, 26 guards, 58 restore objects
and one optional canonical rollback-guard object. The restore SQL SHA256 is
e5a58960baa4b8e1f4cae8be94985dd03cf4e9acf03c274b38fb310ce79f28c0 and rollback SHA256
ba48a606a1694ec87a3af22fc01a640f0653344335ebd21bd260cdbefd4fdcee.
Source digest is 4c6c4ce836202c4b7a00954414bc1d37c02a5c2155068239c1efc624fb0a8ca5;
V1 runtime fingerprint is f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37.

Retained private evidence: /private/tmp/takosan-production-guarded-restore-37536969564/.
Artifact11446718824 ZIP SHA256 is
ac8f45e104d4c0a9a06f59b8afb6af988aefc3c106169b9af23d1dafe84febe6;
receipt SHA256 is a484b5256be675df15154b0c59eb102358d4d602fe1728db8fc5946ebe2caab7.
Pre-ledger38/0038 and static100% Worker were proved before the attempted import;
these are not post-import proofs.

## Parser cause and correction

Independent offline reproduction used the verbatim pinned Wrangler3.114.17
Handler/execute/import/spinner code with mocked provider responses. Successful
upload/ingest/poll and cached-complete init return an all-success JSON array, but
spinnerWhile writes progress directly to stdout even under --json/loggerLevelerror.
Parsing the entire stdout as JSON fails. The --command query control remains clean.
This proves a runner parser defect; it does not prove the actual production commit.

The dedicated file-import parser accepts only the pinned vendor progress sequence
followed by one terminal completion array, or clean terminal JSON. It validates
success, bookmark and aggregate completion fields and rejects arbitrary prefixes,
extra JSON documents, trailing noise, false/contradictory results and unsupported
shapes. Query parsing stays strict JSON. Import/rollback parsing failures retain
OUTPUT_UNCONFIRMED without raw stdout, provider text or SQL; they cannot authorize
an automatic rollback when import completion was not proved.

## Third sealed inspector and mutation fence

A separate module-owned descriptor and fixed wrapper observe only run37536969564.
No caller, CLI argument or receipt can choose a run or redefine its SQL. Historical
a8fa source is loaded independently from the candidate main SHA. The helper requires
canonical source/plan/restore/rollback hashes, statement arrays, object maps and
receipt equality before issuing SELECTs. It retains strict primary metadata,
inventory-before-PRAGMA ordering and exact known object/schema/status/count checks.
The original37384670328 and existing37491535308 descriptors and statuses remain.

The runner saves the first third-incident capture and requires an identical repeat
in inspect-import. A future restore additionally requires this incident absent,
zero objects/blockers/failed reads, all eight pre-mutation guards primary MATCH,
and matching repeated captures before pinning, bookmark or import. Applied,
rolled-back, partial, unknown or changing evidence stops mutation. Both old incident
fences and the independent corrected-current preflight remain in place.

All observer results retain UNKNOWN_NO_CURSOR, retryAuthorized=false and
NOT_A_RELEASE_CERTIFICATION. Primary reads establish nonblocking availability only
at observation times. Marker/count evidence is not complete runtime/integrity
certification and cannot prove terminal init/upload/ingest/poll state.

## Verification and next action

Implementation checkpoint244a43b is independently reviewed with no remaining
blocking findings. Root final focused run: runner75/auth13/parser106, three files /
194 tests PASS36.51s. Inspector163/163 PASS44.27s. Parser106/106PASS includes verbatim
vendor VM upload/cached/query controls; final metadata tightening rejects known
contradictory status/failure and invalid optional timing/location fields while
preserving unknown forward-compatible metadata. Lint, typecheck, migration smoke,
build, actionlint1.7.12, syntax and diff checks PASS. One initial inspector fixture
failed because drift was combined with guarded rollback; separate drift and real
rollback cases passed. The first exploratory full suite was deliberately terminated
(exit143) for final review-driven changes and is not certification. Full suite on
final implementation is running; hosted PR/main validation remains pending.
No new protected production inspection has been dispatched from this branch.
After a normal reviewed PR merge, require exact-main hosted CI and dispatch one
protected inspect-import with its exact final reviewed head. Obtain the mandatory
normal vn-taphoanhatung Environment approval, retain the sanitized receipt and
independently verify the third incident before choosing any mutation.

If the exact applied marker/catalog is observed, do not restore again: the existing
0039 migration preflight must independently certify complete V1 runtime/provenance
at ledger38 before mutation. If all incidents are absent and all corrected guards
are stable primary MATCH, a new intentional recovery needs a separate normal review.
Partial, rolled-back or blocked evidence requires a reviewed incident decision.

Any newly merged source requires new exact-SHA staging shadow/1/5/25/D1 with T20=true.
The completed a8fa staging packet cannot certify another source. Only after guarded
0039 and full production certification proceed with the same new source T20=false:
production shadow, one synthetic provider smoke, then1/5/25/D1 and live/public proofs.
User-data retention certification is excluded by the operator's no-real-users
instruction; no payment/auth, historical migrations or approval settings change.
