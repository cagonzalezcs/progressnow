# next-test-harness Specification

## Purpose
Test contract for the Next.js frontend: unit, component, contract-fixture, and drift tests, the fixture-backed mock API that runs the whole site without WordPress, and the functional e2e and accessibility Playwright suites the CI jobs run against the production build.

## Requirements

### Requirement: Unit tests
Vitest (node environment) SHALL cover the route resolver, link re-homing, API client validation modes, receiver signing and replay logic, the a11y settings store (including legacy migration), metadata mapping, and sitemap generation, with the resolver and receiver tests ported from or vectored against their Nuxt and PHP counterparts.

#### Scenario: Resolver parity
- **WHEN** the ported resolver test suite runs
- **THEN** every case from the Nuxt `routes.spec.ts` passes unchanged

### Requirement: Component tests
Every component under `components/site/**` SHALL have a Vitest + React Testing Library test (jest-dom, user-event, jest-axe) rendering it with fixture-derived props, covering its keyboard path and an axe-core assertion.

#### Scenario: Keyboard path covered
- **WHEN** the `EventCalendar` component test runs
- **THEN** it exercises arrow-key navigation and the view toggle with `user-event`

### Requirement: Contract fixture tests
The theme's `tests/fixtures/*.json` SHALL be parsed by `lib/schemas.ts` in the unit suite (the Nuxt `contracts.spec.ts` ported), so a serializer change fails here until the shared contract is updated.

#### Scenario: Fixture parses
- **WHEN** `single-event.json` is parsed with `singleEventEnvelopeSchema`
- **THEN** parsing succeeds and the typed result is used by the mock

### Requirement: Drift tests
Unit tests SHALL assert byte identity (after the documented normalization) between the theme's `src/lib/schemas.ts`, `src/css/tailwind.css`, `categories.json`, and their copies in `next-js/`.

#### Scenario: Drift fails
- **WHEN** any guarded file differs
- **THEN** the test fails naming the file and the first differing line

### Requirement: Fixture-backed mock API
A standalone mock server (`test/mock/server.mjs`, no production code) SHALL serve `GET /wp-json/progressnow/v1/*` from the theme fixtures with the same per-route overlays as the Nuxt `shared/mock-api.ts` (`MOCK_ORIGIN`, `MOCK_CONTENT_VERSION`, both languages), and `npm run dev:mock` SHALL start it together with the dev server.

The mock SHALL expose a `/__mock/` control surface for steering e2e scenarios, cleared by `POST /__mock/reset`: post-title and canonical-origin overlays, `POST /__mock/fail` (503 for every envelope), the request log, the recorded build-status callbacks, and `POST /__mock/delay { ms, path? }`, which holds envelopes whose path starts with `path` (default: all) for `ms` — the only way to open a route's loading window on demand (`next-js/openspec/specs/footer-anchor`). Because the mock is shared by specs running in parallel, a delay SHALL be scoped to the envelope the spec under test needs slowed, so it cannot disturb a spec that is timing another route.

#### Scenario: Whole site from fixtures
- **WHEN** the app runs against the mock
- **THEN** every manifest route in both languages renders without a WordPress instance

#### Scenario: Scoped delay
- **WHEN** a spec sets a delay on one envelope path and another spec requests a different envelope
- **THEN** only the matching envelope is held, and `POST /__mock/reset` releases it

#### Scenario: Not in the bundle
- **WHEN** the production build is inspected
- **THEN** no mock module or fixture JSON is included

### Requirement: Functional end-to-end tests
Playwright SHALL run against the production build (`next build && next start`) with `WP_API_BASE` pointed at the mock, covering every route kind in `en` and `es`, the archive search/filter/page flow, the calendar month and view flows, the a11y widget, the 404, link re-homing, and the receiver round-trip (a signed POST changes rendered content on the next request).

#### Scenario: Receiver round-trip
- **WHEN** the e2e test changes the mock's post title, posts a correctly signed webhook, and reloads the post
- **THEN** the new title is rendered

### Requirement: Accessibility gate
A separate Playwright project (`test:a11y`) SHALL run axe-core over the matrix defined in `next-accessibility`, reuse the same built server, emit per-page JSON reports, and fail on any violation.

#### Scenario: Separate signal
- **WHEN** only an accessibility rule fails
- **THEN** the functional e2e job stays green and the a11y job fails

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

### Requirement: Test-first task ordering
Every task in `tasks.md` SHALL name the test(s) it lands first; implementation commits SHALL be preceded by a failing test for the behavior in the same task.

#### Scenario: Task shape
- **WHEN** a task is read
- **THEN** it lists its test file(s) before its implementation file(s)
