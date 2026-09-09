## Why

The `next-js` CI job takes 13.5–14.2 minutes on every push and PR while the other four jobs finish in under 70 seconds, so it is the wall-clock for the whole workflow. Three recent green runs (`gh run view --json jobs`, 2026-09-09) break down the same way:

| Step | Measured |
|---|---|
| Upstream-failure e2e (serial, flips the mock) | 358–374 s |
| Functional e2e (60 tests, 2 workers) | 138–147 s |
| Accessibility gate (12 tests, 2 workers) | 118–123 s |
| Container image + smoke | 69–92 s |
| npm ci, lint, format, typecheck, unit, build, Playwright install | ~125 s |

The first row is a defect, not a cost: `playwright.config.ts` declares `dependencies: ["e2e", "a11y"]` on the `failure` project, and Playwright runs a project's dependencies even under `--project=failure`. The CI log confirms "Running 76 tests using 1 worker" — all 60 e2e and 12 a11y tests re-run serially on one worker before the 4 failure tests. Removing that alone cuts the job to ~8.5 minutes. The rest of the time is serial work that has no data dependency on each other (lint/typecheck/unit vs. the build; the three Playwright projects vs. each other; the container smoke vs. everything), running on 2 of the runner's 4 cores, with the browser and the image's dependency layer re-downloaded on every run.

## What Changes

- **Fix the `failure` project re-running its dependencies.** `test:failure` passes `--no-deps` so CI runs only the 4 serial tests; the `dependencies` declaration stays for the local `npx playwright test` loop, where ordering is the point.
- **Split the single `next-js` job into a fan-out pipeline.** `check` (lint, format, typecheck, unit) ∥ `build` (production build against the mock, uploads `.next/standalone` + `.next/static` as a workflow artifact) → `e2e`, `a11y`, `failure` in parallel, each downloading that one artifact and starting its own mock + standalone server ∥ `container` (image build + smoke, needs only the source). "Same built server" is kept by construction: every Playwright job tests the identical artifact.
- **Use the runner's cores.** Playwright workers go to 4 (the runner has 4 vCPUs; the default is 50%) in CI for the `e2e` and `a11y` projects; `failure` stays at 1.
- **Stop re-downloading.** Chromium is installed with `--only-shell` (headless shell only — what headless tests use) and `~/.cache/ms-playwright` is cached on the Playwright version. (A Docker layer cache for the image was tried and dropped: its export costs more than the deps stage it saves — design D7.)
- **Scope the next-js pipeline to next-js changes.** The next-js jobs are skipped when a push or PR touches none of `next-js/**`, the theme fixtures it consumes (`wp-content/themes/progressnow/tests/fixtures/**`), the shared-source drift inputs, or `ci.yml`. The three required security gates always run; the next-js jobs are not required checks, so a skipped job cannot block a merge.
- **Docs follow.** `docs/security-gates.md` names the new job set; `next-js/README.md` documents the pipeline and the `PW_SKIP_BUILD` reuse contract.

Not in scope: pinning actions to SHAs, `permissions:` scoping, `--ignore-scripts` (all `security-cicd-supply-chain-hardening`); coverage/mutation jobs (`test-credibility-coverage-and-mutation`); any change to what the suites assert.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `next-test-harness`: the "CI job" requirement is rewritten from one serial `next-js` job to a fan-out pipeline that tests a single shared build artifact; new requirements make the serial mock-mutating `failure` project run in isolation (never re-running the projects it depends on in CI), fix CI worker counts, cache the browser download, and scope the pipeline to next-js-affecting paths while the security gates stay unconditional.

## Impact

- **CI:** `.github/workflows/ci.yml` — the `next-js` job becomes `next-js-check`, `next-js-build`, `next-js-e2e`, `next-js-a11y`, `next-js-failure`, `next-js-container`, plus a path-scoping step; the axe/screenshot artifact upload moves to the `a11y` job (and `e2e` for the styleguide screenshots / Playwright report).
- **Playwright:** `next-js/playwright.config.ts` (`workers` under `CI`), `next-js/package.json` (`test:failure` gains `--no-deps`; `build:mock` unchanged).
- **Build artifact:** ~55 MB (`.next/standalone` 53 MB, `.next/static` 2.4 MB); `.next/cache` (278 MB) is excluded. `scripts/start-standalone.mjs` and `test/e2e/budget.spec.ts` already read only those two paths.
- **Expected outcome:** critical path ≈ `build` (~1.5 min incl. setup) + `e2e` (~3 min incl. setup and download) ≈ 4.5–5 min, from 14; runner-minutes rise by roughly four extra `npm ci` + checkout setups per run, which is free on this public repository.
- **Behavior:** no change to what is tested or the pass bars; a red `a11y` job already reads as a separate signal from `e2e`, and this makes that literal.
- **Docs:** `docs/security-gates.md` ("The rest of CI … stays as before" → lists the new jobs), `next-js/README.md`.
- **Coordinates with:** `security-cicd-supply-chain-hardening` (new `uses:` for artifact upload/download, cache, and Docker buildx are pinned there once it lands, and its `--ignore-scripts` applies to every new `npm ci`); `test-credibility-coverage-and-mutation` (a coverage step belongs in `next-js-check`). Does not modify either.
