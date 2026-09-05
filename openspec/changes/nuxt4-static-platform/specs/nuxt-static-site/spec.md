## ADDED Requirements

### Requirement: Route parity with WordPress permalinks
The Nuxt app (`site/`) SHALL render a page for every public WordPress route in both languages — front page, posts page and `/page/N/`, single posts, calendar, single events, About, Get Involved, interior pages, search results, and 404 — at the exact WordPress URL, resolving paths against the `/routes` manifest rather than hard-coded slugs, so editor slug changes and Polylang `/es/` prefixes need no code change.

#### Scenario: Editor-controlled slug resolves
- **WHEN** the calendar page slug is changed in wp-admin and the site is regenerated
- **THEN** the new path renders the calendar page and the old path renders the 404 page

#### Scenario: Spanish routes resolve
- **WHEN** a visitor navigates client-side to the Spanish About page
- **THEN** the app renders the Spanish page content and `html[lang]` is `es`

### Requirement: Static generation from the REST API
`nuxt generate` SHALL prerender every route in the manifest for both languages with payload extraction enabled, producing `index.html` and `_payload.json` per route plus the Nuxt build metadata, using only `GET /progressnow/v1/*` as its data source. The build SHALL fail if any manifest route cannot be fetched.

#### Scenario: Full site generated
- **WHEN** generate runs against a seeded WordPress
- **THEN** every manifest path has `index.html` and `_payload.json` in `.output/public`, in both languages

#### Scenario: Missing content fails loudly
- **WHEN** a manifest route returns 404 during generate
- **THEN** the build exits non-zero naming the route

### Requirement: Data seeding and payload resolution
Route data SHALL be obtained, in order: the embedded shell payload (landing route), the prerendered `_payload.json` (client navigations to prerendered routes), and the REST API (non-prerendered states: search, filtered/paged archives, calendar windows, or when the freshness guard is active). A single composable SHALL implement this order for every route type.

#### Scenario: Client navigation uses static payloads
- **WHEN** a visitor navigates from the front page to a prerendered post
- **THEN** the app fetches that route's `_payload.json` and no REST request

#### Scenario: Dynamic interaction uses REST
- **WHEN** a visitor searches the blog or filters by category
- **THEN** results come from `GET /progressnow/v1/posts` with debounce and abort, as today

### Requirement: Freshness guard
The app SHALL compare the shell's `contentVersion` with the live manifest's; when the shell is newer it SHALL bypass `_payload.json` for the session and resolve navigations from REST until a manifest with a version ≥ the shell's is observed.

#### Scenario: Rebuild in flight
- **WHEN** an editor publishes a post and a visitor lands on the fresh PHP shell before the rebuild completes
- **THEN** navigating to the posts page shows the new post (fetched from REST), not the stale static list

### Requirement: Shell manifest emission
The build SHALL write `.output/public/shell-manifest.json` last, containing `buildId`, `builtAt`, `contentVersion` (from `CHAPTER_CONTENT_VERSION`), `entry`, `css[]`, `modulepreload[]`, and `prerenderedRoutes`, derived from the generated `200.html`.

#### Scenario: Manifest reflects the build
- **WHEN** generate completes
- **THEN** the manifest's `entry` and `css` paths exist in `.output/public` and `buildId` matches the Nuxt build id

### Requirement: Functional parity with the current front end
The app SHALL reproduce every current visitor-facing behavior: sticky header with About dropdown, mobile toggle (`aria-expanded`/`aria-controls`), EN/ES switcher linking to the current route's translation with `aria-current`; Aa accessibility widget (contrast, motion) persisted to localStorage with the high-contrast token swaps and `data-tone` bands; footer columns, socials, contact email, tagline, accessibility line; front-page sections and empty states; blog archive with debounced/abortable search, category filter, pagination, URL-state sync, and counts from the envelope; single post rendering all ten block types, read-next, share links; calendar month/list views, category colors, ICS/Google subscribe, event detail dialog, skeleton and error states; single event page; About and Get Involved templates (mission band, timeline, sections, FAQ accordion, join steps, channels, sidebar cards, governing documents, grievance callout); interior page sidebar; search results; 404; cross-fade view transitions and hover/focus prefetch on internal links; `prefers-reduced-motion` respected.

#### Scenario: Parity checklist passes
- **WHEN** the parity checklist is executed on the `nuxt` frontend against the seeded site in both languages
- **THEN** every item matches the `islands` frontend's behavior with no functional regression

#### Scenario: Language switch keeps context
- **WHEN** a visitor on an English post clicks ES
- **THEN** the app navigates to the Spanish translation of that post (or the Spanish home when none exists) and marks ES current

### Requirement: Client navigation keeps SEO state current
On every client navigation the app SHALL set the document title, meta description, canonical, robots, and hreflang links from the route payload's `seo` block, matching what the PHP shell would emit for that URL.

#### Scenario: Head follows navigation
- **WHEN** a visitor navigates from the front page to the calendar
- **THEN** `document.title` and the canonical link equal those of the calendar's PHP shell

### Requirement: Contract validation in the app
All REST and payload data SHALL be validated against the zod schemas — throwing in development and rendering the error state in production — as the islands do today.

#### Scenario: Drift is visible
- **WHEN** a serializer emits a wrong shape in development
- **THEN** the page fails loudly with the schema error rather than rendering silently wrong data

### Requirement: Self-contained build verification
The app SHALL ship a nitro mock API (enabled by `NUXT_MOCK_API=1`) backed by the shared fixtures so `nuxt generate` can run in CI without a live WordPress, and the CI `site` job SHALL run lint, typecheck, unit tests, and a mock generate.

#### Scenario: CI generates without WordPress
- **WHEN** the CI `site` job runs
- **THEN** generate completes against the mock API and produces a manifest
