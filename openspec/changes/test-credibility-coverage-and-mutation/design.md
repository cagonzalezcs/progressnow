## Context

vitest 4 supports v8 coverage out of the box; PHPUnit needs `pcov` (fast) or Xdebug. Stryker (JS) and Infection (PHP) are the standard mutation tools and both support file-scoped runs so cost stays bounded. The contract fixtures are byte-equality oracles by design (`contract-governance`); the risk is not the oracle but unreviewed regeneration.

## Goals / Non-Goals

**Goals:**
- Every CI run reports coverage; the number can only go up without an explicit decision.
- The tests guarding signing, escaping, URL handling, and path resolution are shown to kill mutants.
- A fixture change is visible, labeled, and reviewed as a contract change.

**Non-Goals:**
- 100 % coverage; the thresholds are floors, not goals.
- Mutation testing on UI components or on every PR.
- Rewriting suites wholesale; the audit converts specific tests.

## Decisions

- **Ratchet thresholds.** Initial values = measured coverage at adoption minus 1 point; a `coverage:ratchet` script raises the floor to the new measured value when it increases. Rationale: no big-bang cleanup; regressions blocked immediately.
- **Coverage on unit + component suites only.** e2e/a11y coverage is not collected (instrumenting builds is expensive and the signal is different).
- **Mutation weekly, file-scoped, floor-gated.** `mutation.yml` on a schedule and on demand; per-file `mutationScore` floors in the tool config (initial = measured − 5). A PR touching a listed file may run the scoped mutation job via label `mutation`. Rationale: minutes budget; the files that matter are small.
- **Fixture guard is a CI step, not a hook.** `git diff --name-only origin/main` ∩ `tests/fixtures/*.json` non-empty → require the `fixtures` label (GitHub API) and a checked checklist line in the PR body. Rationale: reviewable in the PR, no local tooling.
- **Tautology audit heuristics** (script, then human): tests whose only assertion is `toMatchSnapshot`/`toMatchInlineSnapshot`; tests that call the unit under test on both sides of an equality; PHPUnit tests with a single `assertTrue(true)`/`assertNotNull` on a non-nullable; tests without any assertion. Output is a list with file:line for the reviewer.
- **`docs/testing.md` is the map.** One table: layer, tool, location, what it proves, when it runs, how to add.

## Risks / Trade-offs

- [Coverage thresholds block unrelated PRs] → floors are per app and only fail on decrease; the ratchet never raises above measured.
- [Mutation runs are slow] → scoped to ≈10 files per side; weekly schedule; label-triggered otherwise.
- [Fixture label bypass] → branch protection (from `security-headers-and-cicd-gates`) makes the check required.
- [pcov not available in a host's PHP] → CI-only; local runs may use Xdebug or skip coverage.

## Migration Plan

1. Coverage collection + artifacts (no thresholds) for one release; record baselines.
2. Thresholds at baseline − 1 + ratchet script; PR summary.
3. Fixture guard; docs.
4. Stryker/Infection configs, first run, floors; weekly workflow.
5. Tautology audit; convert findings; `docs/testing.md`.

## Open Questions

- Coverage summary via a PR comment (needs `pull-requests: write`) or job summary only? (Recommend job summary; keeps CI tokens read-only per `security-cicd-supply-chain-hardening`.)
- Mutation floors per file or per suite? (Recommend per file for the named critical modules, none elsewhere.)
