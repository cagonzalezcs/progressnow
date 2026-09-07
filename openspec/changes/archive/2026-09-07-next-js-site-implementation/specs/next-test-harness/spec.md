## ADDED Requirements

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
A `next-js` CI job SHALL run `lint`, `typecheck`, `test:unit`, `build`, then `test:e2e` and `test:a11y` against the same built server, without a WordPress instance, on Node 22; the job SHALL fail on any step and upload the axe reports and styleguide screenshots.

#### Scenario: No WordPress in CI
- **WHEN** the CI job runs on a fresh runner
- **THEN** it completes with only the repository checkout and npm registry access

### Requirement: Test-first task ordering
Every task in `tasks.md` SHALL name the test(s) it lands first; implementation commits SHALL be preceded by a failing test for the behavior in the same task.

#### Scenario: Task shape
- **WHEN** a task is read
- **THEN** it lists its test file(s) before its implementation file(s)
