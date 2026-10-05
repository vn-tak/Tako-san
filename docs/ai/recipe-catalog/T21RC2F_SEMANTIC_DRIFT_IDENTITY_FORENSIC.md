# T21R-C2F — Production semantic drift and ingredient identity forensic

Status: `T21RC2F_ADDITIONAL_DIAGNOSTIC_REQUIRED`. The classification and count
model is established from code, the public aggregate receipt and repository data.
The semantic questions that decide remediation are not: whether `ING_ENR_*` rows
are re-identified V1 ingredients, duplicates or genuine additions, and whether the
production IDs came from the repository generator. They need the separate
privacy-safe diagnostic in §17. This task was read-only: zero production reads or
mutations, no C2/C4I rerun, no repair, 0039 not applied, no deploy.
`DEPLOY = NOT AUTHORIZED`, `T21G = NOT READY`.

## 1. Evidence boundary and receipt integrity

| Item | Verified value | Method |
| --- | --- | --- |
| Repository | `vn-tak/Tako-san`, id 1385308553 | receipt, credential metadata |
| Run | 37202777157 attempt 1, `Production D1 T21R-C Row Reconciliation`, `workflow_dispatch` on `main`, `success` (2026-10-04 12:37–12:56 UTC) | `gh run view` (GET) |
| Execution SHA | `075be110a868a9a9c4d6c24f20342c5ccb7017c4` (`075be11`, merge of PR #41); equals the run head SHA | `gh run view` vs `git rev-parse HEAD` |
| Reviewed SHA | `ae19f0571d7e9236e8cf014f65b22d2d3d381df3` (`ae19f05`); tree identical to the execution commit | `git rev-parse <sha>^{tree}` |
| Artifact | 11304380358 `production-t21rc2-aggregate-37202777157-1`, 2,062 bytes, single member `t21rc2-public-receipt.json` | `gh api` artifact metadata |
| Artifact digest | `sha256:55852a55f712988afa5b81e562d8f080b8b35b7947f7a49960a69a3450113af5` = API digest = SHA-256 of the downloaded zip = task value | `sha256sum` |
| Receipt content | All task counts match; `NOT_A_RELEASE_CERTIFICATION`; ledger 38 / `0038_auth_onboarding_completion.sql`; `applied0039=false`; mutations, SQL writes, migrations, deploys 0; `rowLevelEvidenceDelivery=UNCONFIGURED` | direct read |
| Source digests | 5/5 equal SHA-256 of the committed files (§8); offline `loadCertifiedV1Authority()` reproduces all 8 `sourceDigestProof` fields exactly | offline |
| Prior failed run | 37158525748 attempt 1, `failure`, head `b9bc66a` = C2S base `946a7be^` (pre-C2S classifier bytes) | `gh run view` |

Receipt integrity: **PASS**. The artifact was downloaded to a scratch directory
outside the repository. No run logs, private runner files, production rows or
Cloudflare credentials were accessed.

## 2. Traced code path (execution SHA)

- Capture, `scripts/t21rc2-production-capture.mjs`:
  - `:15-20` fixed SELECTs (`id, recipe_id, ingredient_id, name, required_quantity, unit, is_optional`);
  - `:160-195` ledger, count and roster checks around two full captures, whose digests must be equal (`OBSERVED_STABLE_NON_ATOMIC`).
- Classify, `:197-243`: binds the capture to authorization and authority proof, runs `reconcileIngredientOccurrences`, then `validateT21RC2Manifest` (schema, aggregate, digests).
- Authority, `scripts/t21r-v1-authority.mjs:9-66`:
  - recompiles the V1 release from the approved batches;
  - checks manifest bytes, release ID, 500 recipes, fingerprint and 2,702 lines;
  - supplies the target recipes, the 45 registry IDs and the V2 reconciliation file.
- Classifier, `scripts/t21rc-row-reconciliation.mjs`:
  - targets `:148-174`; `v1Ids` = target IDs; `knownIds` = V1 ∪ registry `:175-176`;
  - bridges `:62-83`, only from rows passing `reviewedIngredientBridgePair` (`scripts/t21rb-v1-semantic.mjs:82-96`);
  - identity population `:227-231`: V1 → canonical → reviewed-new → `ING_ENR_` prefix → unknown;
  - production class tree `:248-317`; alternate-conflict post-pass `:323-342`;
  - target classes `:344-370`. Every `UNKNOWN_ID`, `UNREVIEWED_ING_ENR` or malformed row of a recipe is a candidate of **every** target in that recipe (`:346-348`). Since C2S `946a7be`, such a competitor withdraws a unique satisfied assignment (`:351-353`);
  - populations `:403-408`: confidence `DETERMINISTIC`, `REVIEW_REQUIRED`, otherwise `unknown`.
- Receipt, `scripts/t21rc2-production-receipt.mjs:478-567`: aggregates only.

## 3. Repository facts used (offline, execution SHA)

- **V1 target `rel-bd00a4f53fcaeee4`:**
  - 500 recipes, 2,702 lines (3–9 per recipe), **45** distinct ingredient IDs;
  - the canonical registry (`packages/domain/src/index.ts`) is exactly the same 45 IDs;
  - zero `ING_ENR_` IDs in V1 or the registry;
  - zero repeated (recipe, ingredient ID) pairs, zero repeated exact tuples, zero same-recipe lines with identical name/quantity/unit/optional.
- **Reconciliation** (`data/recipe-refresh/v2/ingredient-reconciliation.json`):
  - 2,515 rows = 505 `existing_canonical_id` + 1,642 `provisional_new_canonical_id` + 368 `duplicate_alias`;
  - 0 `reviewed_new_canonical_id`;
  - `sourceId` and `review` are null in all 2,515 rows.
- **V2 canonical source** (`data/recipe-refresh/v2/recipes/*.json`):
  - 500 recipes / 6,766 rows = 2,533 V1-ID rows + 4,233 `ING_ENR_` rows;
  - 1,395 distinct `ING_ENR_` IDs, all `ING_ENR_` + 16 uppercase hex; every recipe has at least one;
  - the ID set and identity counts are unchanged since `fc5e713`; `1f77902` relabelled the generated concepts from `new_reviewed_canonical_id` to `provisional_new_canonical_id`.
- **V2 release gate:** `pnpm recipe:refresh:release-check` is BLOCKED by `RUNTIME_PROJECTION_LOSS`, `INGREDIENT_RECONCILIATION_INCOMPLETE`, `SOURCE_CONTENT_VERIFICATION_INCOMPLETE` and `NUTRITION_EVIDENCE_INCOMPLETE`.

## 4. Numerical reconciliation

**Partition lemma (static code).** The receipt's conditions are: complete capture
counts, `MALFORMED=0` (so no taint), zero bridges, registry = V1 IDs and no
`ING_ENR_` in V1. Under them, the classifier can place:

- a **V1_ID** row only in `EXACT_V1_MATCH`, `SAME_ID_CONTENT_DRIFT`,
  `DUPLICATE_SEMANTIC_OCCURRENCE`, `PRODUCTION_ONLY_KNOWN_ID` or
  `ID_CONFLICT_REVIEW_REQUIRED`. It can never be `AMBIGUOUS`, because a known ID
  always reaches `:311`.
- an **UNREVIEWED_ING_ENR** row only in `ID_CONFLICT_REVIEW_REQUIRED` (a same-recipe
  V1 line has identical name, quantity, unit and optional flag, `:305-310`) or
  `AMBIGUOUS`. Its identity and tuple keys cannot match a target, and `:311` refuses
  unknown IDs.

| Relation | Exact explanation | Level |
| --- | --- | --- |
| 26 + 1,793 + 649 = 2,468 = V1_ID | EXACT, DRIFT and PRODUCTION_ONLY_KNOWN admit only V1_ID rows, and their sum is the whole V1_ID population, so **0** V1_ID rows are ID_CONFLICT | PROVEN |
| 4,232 + 20 = 4,252 = UNREVIEWED_ING_ENR | therefore all 20 ID_CONFLICT rows and all 4,232 AMBIGUOUS rows are `ING_ENR_` rows | PROVEN |
| 2,468 + 4,252 = 6,720 | the other four identity populations are 0 | PROVEN |
| 2,403 + 85 + 4,232 = 6,720 | confidence mapping below | PROVEN |
| drift kinds sum to 1,793 | `driftKind` is set only on DRIFT rows (`:276`, `:299`, `:341`): 94+3+0+933+0+0+41+0+6+40+676+0 | PROVEN |

The 2,468 and 4,252 equalities are **structural by design** (answer A). They split
production exactly along reviewed versus unreviewed identity authority, which is
evidence of answer C: enrichment identity was never canonicalized. They are not
incidental, and no other mechanism is needed.

| Population | Contributing classes | Rows |
| --- | --- | --- |
| deterministic | 26 EXACT (V1 tuples are unique, so `UNIQUE`/`DETERMINISTIC`, `:282-283`) + 649 PRODUCTION_ONLY_KNOWN (`:313`) + 1,728 DRIFT with exactly one production row for the (recipe, V1 ID) pair (`:300-302`) | 2,403 |
| reviewRequired | 20 ID_CONFLICT (`:308-309`) + 65 DRIFT in multi-row same-ID groups | 85 |
| unknown | AMBIGUOUS rows keep the initial `confidence='UNKNOWN'` (`:236`) | 4,232 |

**The 65 residual (V1_ID − deterministic).** These are the 65
`SAME_ID_CONTENT_DRIFT` rows whose recipe has ≥2 production rows with the same V1
ingredient ID while V1 has exactly one line. That makes `membership=false` and
`unique=false`.

By `driftKind` (`:114-122`), a membership-false row is `membership_only` (exact
content), `membership_plus_content` (name unchanged) or `name_plus_semantics`
(name changed). `membership_only=0`, so the 65 are exactly:

- all **6** `membership_plus_content` rows, plus
- **59** of the 676 `name_plus_semantics` rows.

Further consequences:

- The other 617 `name_plus_semantics` rows are membership-true and deterministic.
- No row in such a group equals the V1 line.
- There are 1–32 such groups (g). Since 65 is odd, at least one group has ≥3 rows.

The repository V2 source also has 65 more V1-ID rows than production (2,533 vs
2,468). That is an arithmetic coincidence with no code link to this residual.

## 5. Why all 2,702 targets are AMBIGUOUS

Accounting PASS, `recipeIdSetMatch=true` and `unattributedProductionOccurrences=0`
are completeness facts only:

- every row and target received exactly one class;
- both rosters are the same 500 recipe IDs;
- every row belongs to a captured recipe.

`AMBIGUOUS` is a valid class, so none of these facts says anything about identity
resolution.

Target ambiguity is **recipe-scoped**. All unresolved-identity rows of a recipe are
candidates of each of its targets, and since C2S any such competitor withdraws a
`UNIQUE` assignment. One `ING_ENR_` row per recipe is therefore enough to make every
target of that recipe ambiguous, even if every V1 line matches exactly.

**Offline control** (certified V1 authority, current classifier):

- V1 alone → `SATISFIED_EXACT=2,702`.
- V1's 2,702 lines plus one synthetic `ING_ENR_` row per recipe → 2,702
  `EXACT_V1_MATCH` production rows, yet target `AMBIGUOUS=2,702` and
  `SATISFIED_EXACT=0`.

**Bounds proven from aggregate + code.** These use two V1 facts: (recipe, ID) pairs
are unique, and no recipe has two lines with identical content.

- Targets with ≥1 same-ID production row: 1,819 − 65 + g = **1,755–1,786**. Of
  these, 26 match exactly and the rest are drifted.
- Targets with **no** same-ID production row: **916–947** (34–35%).
- Each ID_CONFLICT row points to exactly one target. So at least 896 targets have no
  explicit candidate, and since `TARGET_ONLY_MISSING=0` they are AMBIGUOUS **solely**
  because their recipe contains `ING_ENR_` rows (`UNRESOLVED_PRODUCTION_IDENTITY`).
- `SATISFIED_EXACT=0` means all 26 exact-content targets were withdrawn by
  competition.

**Topology:**

| Topology | Share of targets | Shape |
| --- | --- | --- |
| T1 | 65–66% | one same-ID production row (usually drifted; g targets have ≥2), plus every `ING_ENR_` row of the recipe |
| T2 | 34–35% | no same-ID row; only recipe-wide `ING_ENR_` rows, plus at most 20 ID-conflict rows |

One target therefore routinely has many `ING_ENR_` candidates. That is structural
candidate inflation, not semantic matching.

Which `ING_ENR_` row, if any, is the same ingredient as a T2 target requires
row-level evidence. A repository analogue exists: of the 976 V1 targets with no
same-ID V2 row, 598 have a same-recipe `ING_ENR_` row whose normalized name equals,
contains or is contained in the V1 name.

## 6. ING_ENR forensic

| Question | Finding | Level |
| --- | --- | --- |
| What is an `UNREVIEWED_ING_ENR` occurrence? | A valid row whose `ingredient_id` starts with `ING_ENR_` and is in neither V1, the registry nor a reviewed bridge. The population is assigned by prefix only after the authority checks fail (`:231`); the prefix is never authority (`tests/unit/t21rc-row-reconciliation.test.mjs:748`) | PROVEN |
| Where do the IDs originate and how are they generated? | The repository V2 enrichment refresh, `scripts/recipe-refresh-v2.mjs:171-195`. A name with no exact or context-stripped alias gets `ING_ENR_` + the first 16 hex (uppercase) of `sha256('source-name:' + ingredientConceptKey(name))`, labelled `provisional_new_canonical_id` ("ingredient authority review pending"). The prefix is mandated by `packages/recipes/src/refresh/schema.ts:62`, `release.ts:72,147-149` and `ingredient-authority-v2.ts:5`. First commit `fc5e713` (2026-09-26 15:02 UTC) | PROVEN |
| Created by enrichment or import? | Enrichment identity generation. No repository import, migration or workflow has ever written `ING_ENR_` rows to D1 (`git log -S ING_ENR_ -- migrations '*.sql'` is empty, and V1 contains none). The production rows came from a writer outside the repository; writer and time are UNKNOWN (T21D/T21E window 2026-09-25 20:14Z → 2026-09-29 13:07Z) | PROVEN (static); writer UNKNOWN |
| Stable? | The repository generator is deterministic (same 1,395 IDs at `fc5e713` and HEAD) but name-derived, so other normalization yields other IDs. Production was identical across both captures of this run. Whether production IDs equal the generator's output is unknown | PROVEN (repo); ROW_LEVEL_EVIDENCE_REQUIRED (prod) |
| Canonical? | No: not in the registry, zero reviewed decisions, release gate blocked on `INGREDIENT_RECONCILIATION_INCOMPLETE` | PROVEN |
| Do they map to V1 IDs? | No mapping exists. For **20** occurrences an `ING_ENR_` row has the same name, quantity, unit and optional flag as a same-recipe V1 line with a canonical ID: the same ingredient line under a second identity | PROVEN for 20; rest ROW_LEVEL_EVIDENCE_REQUIRED |
| Do bridges exist? | Zero (§8) | PROVEN |
| Were bridges intentionally absent? | Yes. Generated concepts are deliberately provisional; T21R-A recorded zero current bridges; `RUNTIME_INGREDIENT_MODEL_V2.md` records that no review-decision file was manufactured | PROVEN |
| Can they be richer versions of the same ingredient? | Yes by mechanism: a more specific enriched name misses exact-alias resolution and gets a new provisional ID. The 20 ID conflicts are proven cases; V2 shows 598 name-matching analogues | PROVEN mechanism; extent ROW_LEVEL_EVIDENCE_REQUIRED |
| Can one target match several `ING_ENR_` rows? | Yes, always: every `ING_ENR_` row of a recipe is a candidate of every target in it | PROVEN |
| Why AMBIGUOUS rather than PRODUCTION_ONLY? | `PRODUCTION_ONLY_*` requires a known or reviewed-new ID (`:311-312`); unreviewed identity stays `AMBIGUOUS` with confidence `UNKNOWN` | PROVEN |

## 7. Drift taxonomy (1,793 same-ID rows in 490/500 recipes)

| Kind | Rows | Meaning |
| --- | --- | --- |
| quantity_unit | 933 | name unchanged; quantity and unit both re-expressed |
| name_plus_semantics | 676 | name changed plus ≥1 of quantity/unit/optional/membership (59 membership-false) |
| quantity_only | 94 | only quantity changed |
| multi_field | 41 | quantity, unit and optional all changed; name unchanged |
| name_only | 40 | only the name changed |
| membership_plus_content | 6 | same-ID multiplicity plus content change; name unchanged |
| unit_only | 3 | only the unit changed |

- The optional flag changed in at least 41 rows; its share inside the two name and
  membership kinds is not published.
- 716 rows (40%) renamed an ingredient under an unchanged canonical ID; 933 (52%)
  re-expressed quantity and unit.
- Ten recipes have no same-ID drift at all.

**Interpretation.**

- The pattern matches enrichment: unit re-expression, more specific names and
  researched quantities.
- Repository V2 versus V1 shows the same drift classes at similar scale (1,585
  same-ID drift rows and 481 drifted recipes under a best-effort V2 quantity
  projection).
- No drift kind indicates corruption. `MALFORMED=0`: every row has a valid ID, a
  positive finite quantity, a closed unit and a captured recipe.
- Whether each change is an intended, reviewed enrichment cannot be established,
  because no reviewed source reproduces production.

**Verdict per category:**

| Category | Verdict |
| --- | --- |
| Enriched quantities, unit normalization | PLAUSIBLE |
| Renaming | PROVEN as name change; intent PLAUSIBLE |
| Canonical-source divergence | PROVEN |
| Importer differences | PROVEN |
| Stale V1 authority | not supported (V1 is the only certified release) |
| Accidental production edits | UNKNOWN (a wholesale 500-recipe replacement is inconsistent with sporadic manual edits) |

## 8. Source authority

| Receipt field | Byte-identical repository source | Last change |
| --- | --- | --- |
| canonicalTargetSha256 `09e872b6e7b2e4dd25ddce544e6e5c23d0655723d456aabee7f26189d8f30aeb` | `docs/ai/recipe-catalog/T21RA_RUNTIME_CANONICAL_TARGET.json` | `6bcef89` 2026-10-01 |
| releaseManifestSha256 `fa47d31f344736d338dc0ba50654e4604f793089fe97e44857e7dd5dd0134ac0` | `packages/recipes/src/import/catalog-release.current.json` | `c10db67` 2026-09-17 |
| approvedBatchesSha256 `2dcd4b03c1f2991d74de0c938b5f5a850034c6659a963ca2438f9308542dbb42` | `data/recipe-import/approved-batches.json` | `c10db67` 2026-09-17 |
| canonicalRegistrySourceSha256 `731b8a9710313eb9ae554670f2f941a213b8e4891ac5499218b795853647e558` | `packages/domain/src/index.ts` | `2945585` 2026-09-29 |
| reconciliationSha256 `95f7d680ab2bedafebb39595341b55ba5d278a5c98fb14851ab116105f7d0ca5` | `data/recipe-refresh/v2/ingredient-reconciliation.json` | `1f77902` 2026-09-27 |

- **releaseId** `rel-bd00a4f53fcaeee4`: the V1 approved catalog release. It is 71 static
  recipes plus the reviewed pilot 30 and scale 399, i.e. 500 ordered recipes.
  T21R-A certified it as the only release the Worker's D1 contract accepts.
- **runtimeFingerprint** `f8cf8c7ff59df9fe29e246b9e3c9aad0fd155fa8df35bf671ac4d03fa2b5ab37`: the SHA-256 of the ordered stable
  projection of all RuntimeRecipe fields, ingredients included. It is the value
  D1 must hash to (`packages/recipes/src/recipe-authority.ts:196-200`); it is not
  a measurement of production.
- **reviewedBridgeCount = 0**: `bridgePair` requires a non-empty `sourceId`
  distinct from `canonicalId`, and all 2,515 rows have `sourceId=null`.
  Independently, there are no `reviewed_new_canonical_id` rows and no review
  objects. The count describes the committed file, not production.
- **Was a bridge expected for ING_ENR identities?** No. That would require review
  decisions that were never made. Even a `reviewed_new_canonical_id` bridge would
  only make an `ING_ENR_` ID a reviewed new identity; it would not map it onto a
  V1 ID.

## 9. C2S relation

- **Module proof** on the synthetic V1 + one-`ING_ENR_`-per-recipe input:
  - pre-C2S bytes (`git show 946a7be^:scripts/t21rc-row-reconciliation.mjs`,
    identical to failed-run head `b9bc66a`) emit 2,702 `UNIQUE` targets with 2
    candidates each → `T21RC2_CLASSIFICATION_SCHEMA_REJECTED`;
  - the current classifier emits 2,702 `AMBIGUOUS`, schema PASS.
- **Current snapshot (code + aggregate).** The 26 exact targets are unique and all
  faced competition (`SATISFIED_EXACT=0`). Pre-C2S code would have published them as
  `SATISFIED_EXACT`/`UNIQUE` with ≥2 candidates, so the snapshot captured by run
  37202777157 is **PROVEN schema-invalid under the pre-C2S classifier**.
  - C2S changes exactly those **26** target classifications.
  - `946a7be` touched only the target section, so production classes are unchanged.
  - The other 2,676 targets would be AMBIGUOUS under either version.
- **Hypothesis "C2S surfaced a much larger ambiguity hidden by invalid UNIQUE
  assignments".**
  - The strong form is **rejected**: the invalid assignments hid 26 targets, not
    2,702.
  - The weak form is **confirmed**: the schema failure stopped any receipt from
    being published, which is what hid the full picture.
- **Historical causal certainty:** STRONGLY_SUPPORTED, not PROVEN, that run
  37158525748 failed for this reason. Support: the same 500/6,720 since
  2026-09-30, no authorized writer, and a proven mechanism. Against proof: that
  run's capture digest was never published.

## 10. Enrichment history and what production contains

| UTC | Event | Source |
| --- | --- | --- |
| 2026-09-17 | V1 500-recipe release and 0037 committed (`c10db67`) | git |
| 2026-09-25 20:14 | last known hydrated production receipt | T21D |
| 2026-09-26 ~13:05–13:09 | reported external enrichment write (unverified); `tako-enrichment-500-recipes.zip` built, its README claiming a production write | T21D, T21E |
| 2026-09-26 15:02 | V2 canonical source and `ING_ENR_` generator (`fc5e713`; PR #11 merged 20:21) | git, T21D |
| 2026-09-29 13:07 | first confirmed 0/500 hydration (missing positions) | T21D |
| 2026-09-30 | 500 / 6,720 / 0 order rows; V2 comparator: 596 same-ID, 1,475 cross-ID content, 4,649 production-only | T21R-A |

Production contains **neither legacy V1 rows nor the committed V2 rows**. It holds
one replacement population in an enrichment-derived representation.

**What is proven:**

- **No V1 physical row survives.** Zero historical physical line IDs remain (prior
  comparator), and only 26 of 6,720 tuples equal a V1 line.
- **Not a subset of committed V2.** Any subset of V2 has at most 4,233 `ING_ENR_`
  rows; production has 4,252. The prior comparator also found 1,475 rows that are
  content-identical to a V2 line under a different ID.
- **No repository pipeline wrote these rows.**
  - The committed catalog writers are migrations 0006/0034/0036/0037, which use V1
    IDs only.
  - Refresh V2 writes canonical JSON and artifacts, not D1 SQL.
  - T21D excluded the deploy and migration workflows for the window.
  - The actual writer is UNKNOWN.

**Strongly supported:** the same enrichment lineage as V2, with a different ID
assignment and normalization. The identity-only structure is close but not equal:

| Identity metric | Production | Repository V2 |
| --- | --- | --- |
| Rows | 6,720 | 6,766 |
| V1-ID rows / `ING_ENR_` rows | 2,468 / 4,252 | 2,533 / 4,233 |
| V1-ID rows on a V1 (recipe, ID) pair | 1,819 | 1,788 |
| V1-ID rows not among that recipe's V1 lines | 649 | 745 |
| Rows in multi-row same-ID groups | 65 | 118 |
| V1 targets with no same-ID row | 916–947 | 976 |

**Plausible:** the zero order rows follow from replacing every `recipe_ingredients`
row, since `recipe_runtime_ingredient_order.recipe_ingredient_id` references
`recipe_ingredients(id) ON DELETE CASCADE`
(`migrations/0034_global_recipe_catalog_parity.sql:261-266`). An explicit delete
would leave the same result.

## 11. Migration 0039

**What 0039 changes.** `migrations/0039_meal_composition_v2.sql` contains:

- 3 `CREATE TABLE`: `generated_meal_plan_compositions`,
  `generated_meal_plan_components`, `recipe_role_assignments`;
- 2 `CREATE UNIQUE INDEX`;
- no ALTER, INSERT, UPDATE or DELETE, and no reference to `ingredients`,
  `recipe_ingredients` or the order table.

**Effect on the listed areas.** None of ingredient rows, recipe authority, identity
mapping, canonical runtime source or reconciliation state. Its only recipe link is
`recipe_role_assignments.recipe_id → recipes(id) ON DELETE CASCADE`.

**0039_RELEVANCE = NONE.** It neither causes nor cures this condition, and it is not
authorized.

## 12. Is production actually broken?

| Concept | Verdict | Level |
| --- | --- | --- |
| A. Content differs from V1 | Yes: 26/6,720 exact rows; 0/2,702 targets satisfied | PROVEN |
| B. Content richer than V1 | 6,720 vs 2,702 lines, 649 extra canonical-ID lines, more specific names; quality and review status unknown | PROVEN (volume); PLAUSIBLE (quality) |
| C. Identity mapping incomplete | 4,252 rows without identity authority; 0 bridges | PROVEN |
| D. True duplicates | Not shown. `DUPLICATE_SEMANTIC_OCCURRENCE` only detects excess copies of V1-exact tuples. The 65 same-ID multi-row rows and possible V1/`ING_ENR_` double identification are undetermined | UNKNOWN (ROW_LEVEL_EVIDENCE_REQUIRED) |
| E. Conflicting IDs | 20 `ING_ENR_` rows repeat a same-recipe V1 line's content under another ID | PROVEN (20) |
| F. Runtime unsafe or broken | Not unsafe: D1 content cannot become authoritative (§13). Availability is degraded to the static 71 recipes whenever a D1 mode is configured | PROVEN (code) |
| G. Release authority inconsistent | Repository authority is internally consistent (digests, gates); production D1 is inconsistent with it | PROVEN |
| H. Destructive repair required | Not shown: no corruption, and runtime fails closed. Normalizing to V1 would overwrite or drop 6,694 of 6,720 rows (≥4,018 net) of unreviewed enrichment content | NOT PROVEN |

## 13. User-facing runtime impact

This assumes the deployed build equals the repository code.

**Where `recipe_ingredients` is read.** Outside tests, there are two runtime
readers:

1. `packages/db/src/recipe-content.ts:26-29`, the hydration input of
   `D1RecipeAuthority` (shadow diagnostics use the same reader);
2. `packages/db/src/recipe-catalog.ts:290-293`, used only when
   `authority.source === 'd1'` (`packages/db/src/meal-planning-snapshot.ts:193`).
   `readRecipeCatalog` has no non-test caller.

**How D1 authority is gated.**

- The mode defaults to `static` (`src/worker/services/recipe-authority.ts:60-61`).
  User-visible D1 modes need the cutover flag (`:90-92`).
- A D1 snapshot exists only when all three hold:
  - hydration has zero failures (`packages/recipes/src/recipe-authority.ts:170`);
  - the first 71 recipes equal the static baseline (`:183-186`);
  - the fingerprint equals the V1 release (`:196-200`).
- The provider never returns a failing snapshot (`:210-245`). If D1 is not ready,
  the request falls back to static (`services/recipe-authority.ts:265-277`). Stale
  reuse applies only to a previously verified snapshot, for at most 5 minutes
  (`:114`, `:146-149`).
- Current production fails hydration because it has 0 order rows. Even with
  positions restored, it cannot match the V1 fingerprint, because the ingredient
  arrays differ.

| Area | Classification | Evidence / condition |
| --- | --- | --- |
| Planner wrong ingredients | NOT_IMPACTED | planner reads D1 lines only for a ready D1 snapshot |
| Shopping duplication | NOT_IMPACTED | `src/worker/routes/shopping.ts:149` uses the resolved snapshot (static) |
| Cooking ingredient duplication | NOT_IMPACTED | same single snapshot (T19 contract) |
| Incorrect quantities | NOT_IMPACTED | D1 quantities never reach a snapshot |
| Ingredient names duplicated | NOT_IMPACTED | same gate |
| Wrong allergen/diet decisions | NOT_IMPACTED | restrictions see static V1 IDs only; `ING_ENR_` never reaches them |
| Meal composition candidates | NOT_IMPACTED | `MEAL_COMPOSITION_V2_ENABLED="false"` (`wrangler.jsonc:90`), 0039 unapplied, T20 uses the same snapshot |
| Recipe 404 / authority split | IMPACT_POSSIBLE | See below |

On recipe 404 / authority split:

- There is no split: each request uses one snapshot.
- In `shadow`/`canary`/`d1` modes the D1 failure forces static, so the 429 imported
  recipe IDs are not served. A prior public readiness reported this fallback.
- The deployed mode is not set in `wrangler.jsonc` and was not observed here.
- The stored-plan source/fingerprint binding documented by T21R-A was not re-traced.

Every NOT_IMPACTED area becomes reachable only if a release is certified from this
content or the gates change.

## 14. Root-cause classification

**Proven:**

- `IMPORT_PIPELINE_DIVERGENCE`: the rows were written outside every repository
  pipeline; writer UNKNOWN.
- `CANONICAL_SOURCE_DIVERGENCE`: production equals neither V1 nor any subset of
  committed V2.
- `UNREVIEWED_ENRICHMENT_IDENTITY_POPULATION`: 4,252 `ING_ENR_` rows.
- `MISSING_IDENTITY_BRIDGE`: zero bridges, which is expected because review never
  happened.
- `RUNTIME_AUTHORITY_MISMATCH`: D1 cannot satisfy the release contract. This is a
  consequence, and the runtime fails closed.

**Supported, not proven:** `EXPECTED_CONTENT_ENRICHMENT_DRIFT`. The pattern matches
enrichment, but intent and review are unproven.

**Not proven or rejected:**

- `DUPLICATE_PRODUCTION_OCCURRENCES`: UNKNOWN.
- `TRUE_DATA_CORRUPTION`: NOT PROVEN (0 malformed rows).
- `STALE_V1_TARGET_AUTHORITY`: rejected.

**`INSUFFICIENT_EVIDENCE`:** semantic equivalence of `ING_ENR_` rows to V1 targets,
duplication, production-ID lineage and writer identity.

## 15. Evidence matrix

| Claim | Evidence source | Proof level | Counter-evidence | Confidence |
| --- | --- | --- | --- | --- |
| Receipt is authentic and bound to the execution SHA | artifact digest, run metadata, authority-proof reproduction | PROVEN | none | High |
| The 2,468 and 4,252 equalities are structural partitions | classifier `:227-317`, V1/registry facts, receipt | PROVEN | holds only while bridges, malformed rows and non-V1 canonical IDs are 0 | High |
| The 20 ID-conflict rows are `ING_ENR_` re-identifications of V1 lines | partition arithmetic, `:305-310` | PROVEN | none | High |
| 65 = 6 + 59 same-ID multi-row drift rows | `:114-122`, `:273-302`, receipt | PROVEN | none | High |
| Target ambiguity is recipe-scoped; ≥896 targets ambiguous only via `ING_ENR_` | `:344-370`, bounds, offline control | PROVEN | per-recipe distribution unpublished | High |
| Pre-C2S code rejects the current snapshot; C2S changed exactly 26 targets | pre/post module control, aggregate deduction | PROVEN | none | High |
| Run 37158525748 failed for the same structure | count stability, mechanism | STRONGLY_SUPPORTED | historical digest unpublished | Medium-high |
| `ING_ENR_` has no authority; zero bridges is expected | reconciliation file, release gate, docs | PROVEN | none | High |
| No repository pipeline wrote the production rows | full git history, migrations, workflows (T21D) | PROVEN | none for repository pipelines; out-of-band writes remain the leading explanation | High |
| Production is neither V1 nor a subset of committed V2 | 26/6,720; 4,252 > 4,233; prior 1,475 cross-ID | PROVEN | none | High |
| Same enrichment lineage as V2 with different ID assignment | identity comparison, ZIP timeline, prior comparator | STRONGLY_SUPPORTED | extra `ING_ENR_` rows; different group counts | Medium |
| Drift is mostly legitimate enrichment | drift kinds, V2 analogue | PLAUSIBLE | no reviewed source reproduces production | Medium-low |
| True duplicates are present | not determinable from aggregates | UNKNOWN | `DUPLICATE=0` is narrow in scope | n/a |
| Users are not exposed to D1 ingredient content | gate code, complete reader set | PROVEN (code) | deployed build and mode not observed | High |
| Zero order rows result from cascade on replacement | 0034 FK `ON DELETE CASCADE` | PLAUSIBLE | an explicit delete gives the same state | Low-medium |
| 0039 is irrelevant | statement inventory | PROVEN | none | High |

## 16. Decisions

- **Repair: `REPAIR_NEEDS_MORE_EVIDENCE`.**
  - Not `REQUIRED`: there is no corruption and the runtime fails closed.
  - Not `NOT_NEEDED`: D1 stays unusable until production or the release authority
    changes.
  - Choosing restore-V1 versus certifying enriched content needs §17 evidence and a
    separate authority decision.
- **0039: `NONE`**, not authorized.
- **Release:** `DEPLOY = NOT AUTHORIZED`, `T21G = NOT READY`.
- **`ROW_LEVEL_EVIDENCE_REQUIRED`** for D, the extent of re-identification and
  production-ID lineage.

## 17. Proposed separate task: T21R-C2T identity topology diagnostic

Design only; not implemented or dispatched.

**Envelope.**

- Reuse the reviewed C2 envelope: fixed `T21RC2_SELECTS` (no new SQL), two-capture
  stability, production approval and identity proof.
- Raw files stay runner-local; failure artifacts disabled; cleanup.
- Add one offline-reviewed aggregator. It needs new independent review because it
  changes bound execution bytes.
- Public output: counts, histograms and digests only. No names, quantities,
  physical row IDs, account or user data. Buckets below 5 are suppressed.

**Outputs:**

1. **Generator lineage.** Count production `ING_ENR_` rows whose ID equals
   `ING_ENR_` + sha256(`source-name:` + `ingredientConceptKey(name)`)[0:16], and
   distinct IDs in production ∩ V2, production-only and V2-only.
2. **Name-key topology.** For each target without a same-ID row, a 0/1/2+ histogram
   of same-recipe `ING_ENR_` rows sharing or containing its concept key; the same
   for the 20 ID-conflict rows.
3. **Duplicates.** Multiplicity histograms of (recipe, ingredient ID, concept key)
   and of (recipe, concept key) across different IDs, split V1 / `ING_ENR_`.
4. **Same-ID groups.** g and the group-size histogram behind the 65.
5. **Per-recipe distributions.** `ING_ENR_`/V1-ID/drift counts as histograms, plus
   a digest of the 500-entry count vector for offline comparison with
   repository-derived vectors.
6. **Drift fields.** Strict convertible unit pairs (g↔kg, ml↔l), count→mass
   re-expressions and quantity-ratio buckets, without inferring any weight.

**Acceptance before any production use.** The aggregator, run offline on
repository V2, must reproduce known values (for example generator lineage
4,233/4,233). It then needs independent review and separate production approval.
Zero writes.

## 18. Verification performed

- `gh run view` for 37202777157 and 37158525748, plus `gh api` artifact metadata
  and zip (GET only): results as in §1.
- `sha256sum` of the five authority sources: 5/5 equal.
  `loadCertifiedV1Authority()`: 8/8 `sourceDigestProof` fields equal.
- Offline classifier controls with the certified authority. Scratch scripts outside
  the repository; synthetic or repository data only:
  - V1 only → 2,702 `SATISFIED_EXACT`;
  - V1 + one `ING_ENR_` per recipe → 2,702 `AMBIGUOUS` (current) versus
    `T21RC2_CLASSIFICATION_SCHEMA_REJECTED` (pre-C2S bytes);
  - two V2 quantity projections give V2-like aggregates, but not the receipt
    digests, as expected for production ≠ V2.
- `TZ=UTC pnpm exec vitest run tests/unit/t21rc-row-reconciliation.test.mjs tests/unit/t21rc2-schema-boundary.test.mjs tests/unit/t21rc2-classification-diagnostics.test.mjs tests/unit/production-catalog-v2-lineage.test.mjs tests/unit/recipe-refresh-v2.test.ts tests/unit/ingredient-authority-v2.test.ts --maxWorkers=2`:
  6 files / 178 PASS (Node 24.21.0).
- `pnpm recipe:import:check`, `pnpm recipe:refresh:check` and
  `pnpm recipe:ingredient-v2:audit`: PASS.
- `pnpm recipe:refresh:release-check`: BLOCKED as expected (exit 1, four blockers).
- `git fetch --unshallow` for the history audit (650 commits).
- Documentation-only change, following the T21R-A report-only precedent:
  lint/typecheck/full suite/build were not rerun locally. Hosted PR CI is the
  confirming gate.

Production SQL, C2/C4I reruns, repairs, migrations, 0039, deploys, secret and
Environment changes: **0**.
