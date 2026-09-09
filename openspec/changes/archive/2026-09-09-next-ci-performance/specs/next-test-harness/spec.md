## MODIFIED Requirements

### Requirement: CI job
The `next-js` CI work SHALL run as a fan-out of jobs on Node 22, without a WordPress instance: a `check` job (`lint`, `format:check`, `typecheck`, `test:unit`) and a `build` job (`build:mock`, publishing `.next/standalone` and `.next/static` as one workflow artifact) in parallel; `e2e`, `a11y`, and `failure` jobs that each download that one artifact and run their Playwright project against it with `PW_SKIP_BUILD=1`, in parallel with each other; and a `container` job that builds the image and runs the deployment smoke against the mock, needing only the checkout. No Playwright job SHALL run `next build`. Every job SHALL fail on any step. The `a11y` job SHALL upload the per-page axe reports; the `e2e` job SHALL upload the styleguide screenshots and the Playwright report; the `failure` job SHALL upload its Playwright report when it fails.

#### Scenario: No WordPress in CI
- **WHEN** the pipeline runs on fresh runners
- **THEN** it completes with only the repository checkout, the npm registry, the Playwright browser download, the base image registry, and GitHub's artifact and cache storage

#### Scenario: One build, every Playwright job
- **WHEN** the `e2e`, `a11y`, and `failure` jobs run
- **THEN** each serves the standalone build downloaded from the `build` job's artifact, and the Playwright web server starts it without building

#### Scenario: Independent signals
- **WHEN** only an accessibility rule fails
- **THEN** the `a11y` job is red and the `e2e`, `failure`, and `container` jobs finish green on their own

#### Scenario: Wall-clock is the longest branch, not the sum
- **WHEN** the pipeline's job graph is inspected
- **THEN** `check` and `container` depend on nothing, `e2e`/`a11y`/`failure` depend only on `build`, and no job waits on a sibling

## ADDED Requirements

### Requirement: Serial project isolation
The `failure` Playwright project (serial, mock-mutating) SHALL run with one worker and SHALL NOT re-run the projects it depends on when invoked through `test:failure`: the script passes `--no-deps`. The `dependencies: ["e2e", "a11y"]` declaration SHALL remain in `playwright.config.ts` so an unfiltered `npx playwright test` still orders the parallel projects before the serial one.

#### Scenario: CI runs only the failure tests
- **WHEN** the `failure` job runs `npm run test:failure`
- **THEN** Playwright reports exactly the tests under `test/e2e/failure/` on 1 worker, and no `[e2e]` or `[a11y]` test appears in its output

#### Scenario: Local ordering preserved
- **WHEN** a developer runs `npx playwright test` with no project filter
- **THEN** every `e2e` and `a11y` test completes before the first `failure` test starts

### Requirement: CI worker count
Under `CI`, the `e2e` and `a11y` projects SHALL run with 4 Playwright workers — the runner's core count — overridable through `PW_WORKERS`; the `failure` project SHALL keep 1 worker through its script's `--workers=1`, which takes precedence over the config.

#### Scenario: Four workers in CI
- **WHEN** the `e2e` or `a11y` job starts Playwright
- **THEN** the run header reports 4 workers

#### Scenario: Override for triage
- **WHEN** `PW_WORKERS=2` is set on a job
- **THEN** that run uses 2 workers without a config edit

#### Scenario: Retries stay visible
- **WHEN** a test passes only on its CI retry
- **THEN** the job is green and the uploaded Playwright report records the retry

### Requirement: Warm caches
Playwright jobs SHALL install only the Chromium headless shell with its OS dependencies (`playwright install --with-deps --only-shell chromium`), restoring the browser download from the Actions cache keyed on the installed Playwright version. A cache miss SHALL cost time only, never correctness.

#### Scenario: Browser cache hit
- **WHEN** the Playwright version matches a previous run's cache
- **THEN** no browser is downloaded, and the OS dependency install still runs

#### Scenario: Cache unavailable
- **WHEN** the Actions cache is evicted or unreachable
- **THEN** the job downloads or builds from scratch and passes on the same inputs

### Requirement: Change-scoped pipeline
On a branch push or pull request, the next-js jobs SHALL be skipped — reported as skipped, never as passed — when the change touches none of the paths next-js depends on: `next-js/**`, the CI workflow and its scripts, and the theme files next-js reads across the tree (the contract fixtures and the sources its drift tests compare). Pushes to `main` SHALL never be scoped. The required security gates SHALL run unconditionally. When the diff base cannot be determined, the pipeline SHALL run in full.

#### Scenario: Theme-only pull request
- **WHEN** a pull request changes only files under `wp-content/themes/progressnow/inc/`
- **THEN** every next-js job is skipped and the three security gates run

#### Scenario: Fixture change
- **WHEN** a pull request changes a file under `wp-content/themes/progressnow/tests/fixtures/`
- **THEN** the next-js pipeline runs in full

#### Scenario: Main is never scoped
- **WHEN** a commit that touches only documentation lands on `main`
- **THEN** the next-js pipeline runs in full

#### Scenario: Unknown base
- **WHEN** a branch's first push carries no previous commit to diff against
- **THEN** the next-js pipeline runs in full
