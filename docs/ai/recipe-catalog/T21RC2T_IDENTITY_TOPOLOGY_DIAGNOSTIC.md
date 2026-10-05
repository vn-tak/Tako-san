# T21R-C2T identity topology diagnostic

Implementation only, based on certified PR #42 main (`5218b0b`). The attachment's
exact live-main/checkout hard gate passed before editing. Repository:
`vn-tak/Tako-san`, ID `1385308553`. No production execution is authorized here.

## Authority and forensic question

The C2F result remains `T21RC2F_ADDITIONAL_DIAGNOSTIC_REQUIRED`. Production
corruption is NOT PROVEN; repair is `REPAIR_NEEDS_MORE_EVIDENCE`; migration 0039
and deployment are NOT AUTHORIZED; T21G is NOT READY. Nothing in this diagnostic
changes V1 authority, creates an ingredient bridge, or authorizes normalization.

C2T asks whether provisional IDs follow the generator formula, how their
populations intersect committed V2, and whether name, content, multiplicity and
candidate topology are compatible with replacement, additional enrichment or
accumulation. Formula compatibility is not attribution to a particular writer.
Name similarity cannot establish a reviewed identity. Additional-looking content
is not proof of a legitimate additional ingredient; a duplicate-like tuple is not
proof that repeated use is erroneous. Writer history and independent semantic
review remain necessary before repair.

## Separate execution path

- Workflow: `.github/workflows/production-d1-t21rc2t-identity-topology.yml`.
- Gate/approval/recheck: `scripts/t21rc2t-production-approval.mjs`.
- Fixed capture adapter: `scripts/t21rc2t-production-capture.mjs`.
- Private evidence lifecycle: `scripts/t21rc2t-production-files.mjs`.
- Source authority: `scripts/t21rc2t-source-authority.mjs`.
- Pure aggregator: `scripts/t21rc2t-identity-topology.mjs`.
- Receipt creation/recomputation: `scripts/t21rc2t-production-receipt.mjs`.
- Closed schema: `T21RC2T_IDENTITY_TOPOLOGY_RECEIPT_SCHEMA.json`.

Existing C2 executable and workflow bytes are preserved. Shared imports are
read-only reuse, not a repurposed C2 dispatch or approval. The diagnostic exposes
no arbitrary SQL, table, WHERE, identity, recipe, command or repair parameter.

## Fixed SQL and observation envelope

The adapter imports the exact certified `T21RC2_SELECTS`: roster, occurrences,
counts and migration ledger. New production SQL: **0**. Only their fixed SELECT
strings can reach the existing executor; mutation verbs and extension/file
functions are rejected. Two complete occurrence captures are interleaved with
four independent counts, two rosters and three ledgers: 11 reads, no retry.

Roster and counts must agree with the certified source and physical captures;
ledger must be the exact reviewed first 38 names, ending at
`0038_auth_onboarding_completion.sql`. A changed ledger, including 0039, fails
closed; it is never repaired. Equal observations prove only
`OBSERVED_STABLE_NON_ATOMIC`, not transactional pinning or release certification.

Future production publication also preserves the C2F population contract:
500 recipes, 6,720 occurrences, 2,702 targets; V1-ID 2,468 and ING_ENR 4,252;
C2 classes 26 exact, 1,793 same-ID drift, 649 production-only known, 20 ID
conflicts, 4,232 ambiguous; all 2,702 targets ambiguous; residual 65 with 6
membership-plus-content and 59 name-plus-semantics. Differing evidence is rejected,
not forced into expected buckets. Offline fixtures do not assert live topology.

## Source and generator lineage

The existing certified V1 loader verifies its spec, manifest, approved batches,
compiled migrations and 500/2,702 release. The new V2 loader validates the current
base release/ordered roster, source schemas, all 503 hashed package members and
the aggregate package root. All 6,766 canonical source occurrences are compared,
including qualitative/process rows excluded from provisional runtime projection.
Source measured amount/unit are retained; qualitative quantity/unit stay unknown.
No provisional runtime estimate, gram equivalent, density or piece weight is used.

Repository normalization is loaded directly through Vite SSR:
`ingredientConceptKey` from `packages/recipes/src/refresh/normalize.ts`, and
`normalizeIngredientAlias` from `packages/domain/src/foundation.ts`. The generator
formula is `ING_ENR_` plus the first 16 uppercase hex characters of
SHA-256(`source-name:` + `ingredientConceptKey(sourceName)`). Hashes and identities
are internal only. A distinct ID is a formula mismatch if any occurrence using
that ID mismatches; occurrence and distinct-ID accounting are separate.

Fresh offline acceptance through the actual aggregator derived V1 500/2,702,
V2 500/6,766, 4,233/4,233 formula-matching ING_ENR occurrences and
1,395/1,395 matching distinct IDs; V2-as-input has 6,766 exact V2 shape matches.
These are repository facts, **not production findings**.

## Topology definitions and proof limits

All histograms have a repository-defined fixed bucket set. The exported
`T21RC2T_HISTOGRAM_BUCKETS` and closed schema define the complete public surface.

| Family | Definition / what it proves | What it cannot prove |
| --- | --- | --- |
| Identity/formula/lineage | V1-ID / ING_ENR / other partition; formula-match occurrence and distinct-ID partitions; shared/production-only/V2-only populations and occurrence memberships | Writer attribution, reviewed canonical authority, or population subset from counts alone |
| C2 target candidates | Unchanged C2 graph cardinalities 0/1/2/3/4/5/6–10/11–20/>20; none/V1/ING_ENR/mixed/other origins; separate conflict-present partition | A name-key candidate is not a C2 witness or identity bridge |
| Name-key candidates | For targets lacking same-ID rows, same-recipe ING_ENR rows with equal repository concept keys or whole-token context-compatible containment; 0/1/2/3–4/5+ and equal concept-key vs context-only partitions | Repository concept aliases remain equal-key matches; containment is deliberately labeled plausible, not semantic equivalence |
| Exact-witness competition | Targets with an exact V1 witness split into no competitor, one/multiple ING_ENR competitors, cross-ID conflict or other competition, with conflict precedence | No restoration of uniqueness; the C2S competition semantics remain unchanged |
| Enrichment topology | Per ING_ENR row: no plausible V1 concept, one absent-ID counterpart, competitor alongside same-ID witness, or multiple plausible targets; separate V1-normalized-content representation | “No plausible concept” is not a certified true additional ingredient; content beyond V1 is a loss-risk signal, not a repair decision |
| Multiplicity | ID recurrence across distinct recipes, same-recipe ID multiplicity, cross-ID concept groups and exact tuple multiplicity, split by origin | Multiple occurrences are not automatically duplicates |
| Semantic structure | Same-recipe concept/identity and normalized-content/identity groups; same-identity and same-concept content variants; unknown content separate | Same concept with different quantity/usage may be legitimate repeated conceptual use |
| Residual | Review-required same-ID drift in multi-row identity groups; residual group/row size histograms, membership, drift kinds and exact private weighted row sum | Grouping does not establish which physical row should survive or map to a target |
| Production/V2 shape | One-to-one multiset exact matching, then uniquely attributable normalized content equivalence, then unique same-ID content difference; remaining-only and ambiguous groups are separate on both sides | Multiple possible assignments stay unresolved; aggregate pairing never selects a physical replacement row |
| Per-recipe | Anonymous count histograms and production−V1, production−V2, V2−V1 delta distributions; composition-class sum equals recipe count | No recipe IDs, ordered vector or recipe-level lookup; no position or metadata authority |
| Drift fields | Unique same-ID counterparts: same-unit coarse ratio buckets, strict g/kg or ml/l conversion equality, count/mass representation changes, non-convertible and multi-row cases | No piece/package/bunch/slice/spoon/serving weights, density, yield, cooking loss or nutrition conversion |

Shape equality excludes physical row IDs. Exact shape retains raw name, quantity,
unit and optional semantics. Normalized content uses the certified alias
normalizer and exact decimal rational g/kg and ml/l scaling; other units have
identity comparison only. Missing quantities do not establish content equivalence.
Percentiles use nearest rank; median averages the two middle count deltas.

## Privacy, suppression and low-entropy threat

Public output has only closed enum/boolean fields, bounded aggregate numbers and
fixed histogram objects. There are no names, IDs, raw quantities/units, keys,
individual digests, SQL output, free-text strings or arbitrary arrays.

Individual ingredient names/IDs, recipe IDs and physical row IDs are enumerable;
publishing their unkeyed hashes permits dictionary recovery. None are published,
including C2 occurrence hashes. The optional count-vector digest is **omitted**:
ordered counts plus public recipe knowledge create unnecessary linkage risk.
Only anonymous histograms and count-distribution statistics leave the runner.

`WHOLE_PARTITION_K5` is deterministic complementary suppression:

1. If every cell is 0 or at least 5, publish the counts and exact total.
2. If any cell is 1–4, suppress **every** cell in that partition, including zero
   and large complementary cells. Do not reveal which cell was rare.
3. Publish `suppressedBucketCount` as the fixed partition width and
   `suppressedOccurrenceTotal` as the partition total only if 0 or at least 5;
   a total of 1–4 is itself `SUPPRESSED`.
4. Never replace hidden values with zero. This sacrifices partition detail to
   prevent recovery of one masked cell by subtracting visible neighbors.

This is bounded aggregate disclosure, not differential privacy or a guarantee
against all correlation with external evidence. Known overall populations and
allowed anonymous count statistics remain public. Small subgroup totals are
hidden rather than emitted through a digest. Independent privacy review must
assess cross-metric disclosure before any live execution.

## Accounting and final receipt validation

Every object schema is closed (`additionalProperties=false`). Cells are exactly
0, a bounded integer at least 5, or the enum `SUPPRESSED`. Creation validates the
full unsuppressed runner-local metric model first. Checks include:

- Identity and production-class sums = production occurrence count.
- Target class, candidate-cardinality, origin and conflict sums = target count.
- Exact-witness competition sum = C2 exact-match occurrence count.
- Formula, occurrence membership and enrichment topology sums agree.
- Shared distinct-ID counts agree from both sides.
- Each production/V2 shape partition accounts for its entire compared population;
  all paired categories have equal counts from both sides.
- Per-recipe topology/count/delta histogram sums = recipe count.
- Residual rows = weighted exact private group sizes = drift-kind sum; exact
  two/three-row weights and four-plus lower bounds agree.
- Drift relation, convertible-quantity and same-unit ratio subsets account exactly.

Public schema validation proves closure and suppression consistency, **not hidden
cell values**. Acceptance therefore requires private raw evidence: after fresh
main/CI/approval/closure recheck, `validate` reopens the bound capture, reloads
source authority, recomputes topology and all exact accounting, verifies the
unchanged forensic contract, and compares deterministic receipt bytes. A schema-
valid mutated aggregate, missing final authorization or hidden accounting drift
fails closed. No privacy weakening is used to make public totals self-verifying.

## Future approval flow and review closure

Only three manual inputs exist: `ref`, `reviewed_sha`, and
`confirm_t21rc2t_read_only_diagnostic`. Gate requires exact current-main execution,
an independently reviewed proper ancestor (not `reviewed_sha=ref`), matching
C2T execution-closure bytes and successful exact-main push CI. C2's earlier
reviewed SHA cannot satisfy C2T authority: the new workflow and required files
must exist in the reviewed implementation tree.

Actor is `vn-tak`; normal production Environment reviewer is
`vn-taphoanhatung`, distinct from actor and triggering actor. Self/skipped/bypass
approval is rejected without altering Environment policy. Ordering is offline
gate → production Environment approval → fresh pre-credential authorization →
identity proof/fixed capture → credential-free aggregation → fresh main/CI/
approval/closure recheck → private recomputation/schema/byte validation → success-
only artifact → always cleanup. Token read-only scope remains unproven; only the
reachable query path is SELECT-only.

`T21RC2T_REVIEW_BOUND_PATHS` and its reviewed directory-union comparison in the
approval module are the executable closure authority. They include all new C2T
files/schema/design/tests, shared C2 capture/gate/file/classifier/receipt and V1
authority dependencies, generator, refresh/import/domain graphs, V1 batch and
manifest data, complete V2 data/artifacts, migrations, package/lock/toolchain and
Vite/CI/config inputs. Optional absent config paths are bound against introduction.
Directories are compared on both trees so additions, deletions and type/byte
changes cannot hide behind a static list. Renew review for any closure delta.

## Evidence lifecycle, artifacts and failures

Raw rows, private identity-derived digests, observations, authorization and
Wrangler logs remain under `RUNNER_TEMP/t21rc2t-private`, outside checkout, with
private directories/files and symlink/path rejection. They never enter git,
stdout/stderr, `GITHUB_OUTPUT` or artifacts. CLI errors expose only allowlisted
`T21RC2T_*` codes, without message/cause/stack or provider payload.

After full success, upload exactly one artifact named
`production-t21rc2t-topology-<run_id>-<attempt>` containing only the literal file
`RUNNER_TEMP/t21rc2t-public/t21rc2t-public-receipt.json`. No wildcard or failure
artifact exists. `if: always()` removes both private capture and public receipt
directories; failures have zero artifacts and no automatic retry.

## Verification checkpoint and next action

Initial privacy suite: `TZ=UTC pnpm exec vitest run
tests/unit/t21rc2t-privacy.test.mjs --maxWorkers=1` — 1 file / 34 tests PASS.
Actual offline V2 acceptance through `loadTopologyAuthorities`, aggregator,
receipt creation and private validation PASS: 500 / 2,702 / 6,766;
formula 4,233 occurrences and 1,395 distinct IDs, zero mismatches.
The first source-loader check rejected the omitted hashed
`nutrition-evidence.json` member; the authority envelope was corrected and the
unchanged source acceptance rerun passed. No production evidence was queried.

Remaining at this checkpoint: focused topology/authority/workflow and existing C2
regressions, full prescribed gates, draft PR and known final-head CI. Independent
human security/privacy/authority review is **NOT YET PERFORMED** and remains the
separate T21R-C2T-R phase. Do not mark ready, approve, merge, dispatch, approve an
Environment, query production, repair, apply 0039 or deploy in this task.
