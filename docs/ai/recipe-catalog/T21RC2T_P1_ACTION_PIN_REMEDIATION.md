# T21R-C2T-P1 invalid GitHub Action pin remediation

**STATUS:** `T21RC2T_P1_FIXED_READY_FOR_INDEPENDENT_REVIEW`.

Repository `vn-tak/Tako-san`, ID `1385308553`. Starting live main was exactly
`b3fd7baf9c25ae195bdc6f52ed9ca27f34cef455`, fetched before editing and again before
committing; no concurrent main was absorbed. Fresh isolated branch:
`hoplite/mesambria-d133eda3--t21rc2t-pnpm-action-pin`. Executable checkpoint:
`b78283c746b8150ebfc65c0f814f721eccd26a48`.

## Failure classification and production boundary

[Run 37304008220](https://github.com/vn-tak/Tako-san/actions/runs/37304008220),
attempt 1, ran on the starting execution SHA. Gate job `111743191031` passed;
the historical normal `production` Environment approval by `vn-taphoanhatung`
was verified through approval-history metadata. Capture job `111743275723`
failed in **Set up job**, while the runner prepared external Actions:

```text
Unable to resolve action `pnpm/action-setup@e9380648b2a849f35e2732bdc8e24f7880e5f5aa`,
unable to find version `e9380648b2a849f35e2732bdc8e24f7880e5f5aa`
```

Classification: **`T21RC2T_CAPTURE_BLOCKED_ACTION_PIN_INVALID`**.
The capture job has only the failed setup step in its job metadata. No later
workflow step executed: Cloudflare identity NOT STARTED; production D1 SQL **0**;
capture/topology NOT STARTED; receipt NOT CREATED; artifact count **0**, confirmed
by the run's artifact API. This is not a topology, Cloudflare, D1, capture-data
or corruption finding. The failed run was read, never rerun.

## Supply-chain proof and minimal fix

GitHub upstream GET evidence, verified 2026-10-05 UTC and rechecked before commit:

- `repos/pnpm/action-setup/git/ref/tags/v4.3.0` returns an annotated tag object.
- Dereferencing that object's `git/tags/<sha>` returns tag `v4.3.0`, target type
  `commit`, target **`b906affcce14559ad1aafd4ab0e942779e9f58b1`**.
- `repos/pnpm/action-setup/git/commits/<target>` confirms the target exists in
  `pnpm/action-setup`; the old pin's commit-object lookup returns **HTTP 404**.
- Ordinary exact-main CI run `37291360914`, job `111702260568`, logged successful
  resolution of `pnpm/action-setup@v4` to that same target. This is corroboration,
  not permission to use a floating pin in the production workflow.

All six external `uses:` entries were audited. Their four distinct dependencies
are bound to these exact repository-owned expected values in the offline test:

| Action | Expected immutable commit | Audit result |
| --- | --- | --- |
| `actions/checkout` | `11bd71901bbe5b1630ceea73d27597364c9af683` | Upstream commit exists; unchanged |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | Upstream commit exists; unchanged |
| `pnpm/action-setup` | `b906affcce14559ad1aafd4ab0e942779e9f58b1` | Annotated v4.3.0 target exists; fixed |
| `actions/upload-artifact` | `ea165f8d65b6e75b540449e92b4886f43607fa02` | Upstream commit exists; unchanged |

Only the pnpm `uses:` value changed, preserving `# v4.3.0`, Node **24**, pnpm
**10**, and `pnpm install --frozen-lockfile`. No major/minor upgrade or `pnpm/setup`
migration. Upstream lookup data is documented evidence, not live runtime/test
authority; the unit regression performs no network request.

## Why the prior test missed the defect

The existing safety helper required only `owner/repo@` plus 40 lowercase hex
characters, six references and four distinct dependencies. It rejected floating
refs, but never compared pins with independently verified expected commits.
The nonexistent old SHA met the syntax check, so all **5/5** existing workflow
tests passed against the broken workflow.

The same helper now rejects any external ref outside a fixed four-ref expected
list, and the assertion compares the complete distinct-ref set. A new negative
test substitutes the old SHA-shaped pnpm pin and requires
`T21RC2T_UNREVIEWED_ACTION`. After hardening the test, but before changing the
workflow, the original pin caused the expected **1 failed / 5 passed**, exit **1**.
After the single-line fix, all tests passed. No assertion, timeout, security gate
or existing coverage was weakened.

## Exact checks executed

Runtime: Node **24.21.0**, pnpm **10.31.0**, Vitest **3.2.7**.

```sh
# Baseline blind-spot reproduction, then expected red regression before pin fix.
TZ=UTC pnpm exec vitest run tests/unit/t21rc2t-workflow-safety.test.mjs --maxWorkers=1

# Required narrow post-fix suite.
TZ=UTC pnpm exec vitest run tests/unit/t21rc2t-workflow-safety.test.mjs tests/unit/t21rc2t-production-approval.test.mjs tests/unit/t21rc2t-production-capture.test.mjs --maxWorkers=1

# Established C2T + C2 regressions.
TZ=UTC pnpm exec vitest run tests/unit/t21rc2t-*.test.mjs tests/unit/t21rc2-*.test.mjs tests/unit/t21rc-row-reconciliation.test.mjs --maxWorkers=1

pnpm lint
pnpm typecheck
TZ=UTC pnpm exec vitest run --maxWorkers=1
pnpm check:migrations
pnpm build
git diff --check
git diff --cached --check
```

| Check | Confirmed result |
| --- | --- |
| Original workflow safety suite with bad pin | 1 file / 5 tests PASS; reproduced the blind spot |
| Hardened safety suite before pin fix | Expected red: 1 failed / 5 passed, exit 1 |
| Required narrow post-fix suite | 3 files / 62 tests PASS, exit 0, 3.90 seconds |
| Established C2T + C2 suite | 14 files / 539 tests PASS, exit 0, 41.17 seconds |
| C2T portion / unchanged C2 portion | 6 files / 119 tests; 8 files / 420 tests PASS |
| Full Vitest | 243 files / 5,548 tests PASS, exit 0, 575.88 seconds |
| ESLint / Typecheck | PASS, exit 0 |
| Migration smoke | PASS, `migration-smoke=ok`; local SQLite only |
| Build | PASS, web and Worker compilation only; no deploy |
| Whitespace and staged code diff checks | PASS |
| Real-Git workflow byte comparison | Exactly the single pnpm pin replacement |
| Existing C2 review-bound path comparison | Zero changed files across all 73 specifications |

An initial standalone `vitest.config.ts` lookup was absent; the actual test
configuration is the existing `vite.config.ts`. No configuration repair was
needed. The red failure above was deliberate pre-fix regression evidence; no
post-fix gate failed or skipped. Expected synthetic negative-test/provider
warnings in the full suite do not represent production calls.

## Preserved semantics, fresh review and handoff

Changed code paths are only
`.github/workflows/production-d1-t21rc2t-identity-topology.yml` and
`tests/unit/t21rc2t-workflow-safety.test.mjs`; other changes are this report and
the three mandatory AI checkpoint documents. Existing C2 executable/workflow
bytes and C2T approval/capture/files/source/algorithm/receipt/schema bytes are
unchanged. New production SQL **0**. Manual trigger, read-only permissions,
production Environment/approval model, fixed SQL, topology/accounting/K5 privacy,
success-only literal artifact and always cleanup remain unchanged.

The workflow and its test are review-bound. Changing their bytes intentionally
invalidates the prior execution closure. Review **5412451575** on
`16b07bedcc72310e69a349c4343e5f076d504554` does **not** authorize this remediation.
Required human independent review by `vn-taphoanhatung`: **NOT PERFORMED**.
Required later merge actor: `vn-tak`; no merge in P1.

PR contract: dedicated **DRAFT / OPEN / UNMERGED**, with no self approval,
ready conversion or auto-merge. The PR is the authority for its final
docs-inclusive head and hosted checks; this report records the verified
implementation checkpoint rather than its own documentation commit hash.
Next: stop after draft publication and verification; hand off the exact final
head for fresh independent review. Never rerun `37304008220` or dispatch a new
production workflow in this task.

All P1 production operation counts are **0**: dispatch, Environment approval,
Cloudflare calls, production D1 SQL, repair, 0039 apply and deploy. The historical
approval above is not an approval performed by this remediation agent.
`DATA_CORRUPTION=NOT_PROVEN`, `REPAIR=REPAIR_NEEDS_MORE_EVIDENCE`,
`0039_RELEVANCE=NONE`, `0039=NOT_AUTHORIZED`, `DEPLOY=NOT_AUTHORIZED`,
`T21G=NOT_READY` remain frozen. **STOP; no production execution.**
