## ADDED Requirements

### Requirement: Route parity with WordPress permalinks
The Next.js app (`next-js/`) SHALL serve a page for every public WordPress route in both languages — front page, posts page and `/page/N/`, `/category/{slug}/` archives, single posts, calendar, single events, About, Get Involved, interior pages, search results (`?s=`), the styleguide, and 404 — at the exact WordPress path (trailing slash included), resolving paths against the `/routes` manifest with the same resolver semantics as the Nuxt rendition rather than hard-coded slugs, so editor slug changes and Polylang `/es/` prefixes need no code change.

#### Scenario: Editor-controlled slug resolves
- **WHEN** the calendar page slug is changed in wp-admin and the content version is bumped
- **THEN** the new path renders the calendar page on its next request and the old path renders the 404 page, with no redeploy

#### Scenario: Spanish routes resolve
- **WHEN** `/es/acerca/` is requested
- **THEN** the app renders the Spanish About content and `html[lang]` is `es`

#### Scenario: Derived posts-index states
- **WHEN** `/blog/page/2/`, `/category/labor/`, or `/blog/?s=strike` is requested
- **THEN** each renders the posts index in the matching state (page 2, category filter, search results) and `/blog/page/2/` keeps its own canonical

#### Scenario: Trailing slash normalization
- **WHEN** `/about` is requested without a trailing slash
- **THEN** the response is a permanent redirect to `/about/`

### Requirement: Server rendering of every route state
Every route, including search results, filtered and paged archives, category archives, and the calendar's initial window, SHALL be fully rendered on the server on first paint; the browser SHALL NOT need to fetch data before content is visible, and the document with JavaScript disabled SHALL contain the same primary content, navigation, and footer.

#### Scenario: Search results without JavaScript
- **WHEN** `/blog/?s=valley` is requested with scripts disabled
- **THEN** the HTML contains the matching posts, the result count, and the `noindex,follow` robots directive

#### Scenario: Calendar first paint
- **WHEN** the calendar page is requested
- **THEN** the HTML contains the current month's events; no events request is made by the browser before first paint

### Requirement: Single data source with contract validation
The app SHALL read content only from `GET /wp-json/progressnow/v1/*`, from server code (`WP_API_BASE` never reaches the browser), and SHALL validate every envelope against the shared zod contracts — throwing in development, logging and rendering the error surface in production — never rendering silently wrong data.

#### Scenario: Contract drift in development
- **WHEN** an envelope fails schema validation while `NODE_ENV=development`
- **THEN** rendering fails with the zod error naming the field

#### Scenario: Contract drift in production
- **WHEN** an envelope fails schema validation in production
- **THEN** the error is logged with the endpoint and the route renders the error surface with status 500, not partial content

### Requirement: Content freshness by push revalidation
Content SHALL be served from the app's cache until the revalidation receiver invalidates it; after a successful signed revalidation the very next request for any route SHALL reflect the current WordPress content. Content published after the last deployment SHALL resolve on its first request without a redeploy. An unknown path SHALL be answered with a server-rendered 404 (real 404 status, decided before the body streams) from an in-memory copy of the routes manifest; a burst of unknown paths SHALL cost WordPress at most one manifest refresh per window (10 s).

#### Scenario: Newly published post
- **WHEN** an editor publishes a post, WordPress dispatches the rebuild webhook, and the receiver accepts it
- **THEN** the post's permalink renders the post on the next request and the posts index lists it

#### Scenario: Unknown path is cheap
- **WHEN** `/does-not-exist/` is requested 100 times within a window
- **THEN** the app answers a server-rendered 404 each time and WordPress receives at most one `/routes` refresh, never a request for that path

### Requirement: Internal links are re-homed onto the app origin
Every URL from an envelope whose origin is the WordPress origin (`/site.homeUrl`) SHALL be rendered as a relative link on the app origin — except WordPress-only paths (`/wp-admin`, `/wp-login.php`, `/wp-json`, `/wp-content`, `/feed`) and file URLs, which stay absolute to WordPress. External URLs SHALL be rendered unchanged with `rel="noopener"`.

#### Scenario: Navigation link re-homed
- **WHEN** the header nav item `https://wp.example/about/` is rendered
- **THEN** the anchor `href` is `/about/` and the click is a client navigation

#### Scenario: ICS feed links out
- **WHEN** the calendar subscribe strip renders the ICS link
- **THEN** the anchor `href` is the absolute WordPress feed URL and the click is a full navigation

### Requirement: Media delivery
Slot images with known dimensions (hero, cards, teasers, gallery, avatars) SHALL be rendered through `next/image` with the WordPress uploads host allow-listed; in-content HTML SHALL keep WordPress' own `srcset`/`sizes` via plain `<img>`; the theme's `static/` assets (fonts, brand placeholders) SHALL be reachable on the app origin at their original `/wp-content/themes/progressnow/static/…` paths so `@font-face` is same-origin.

#### Scenario: Card image optimized
- **WHEN** a post card renders a featured image from the uploads host
- **THEN** the `<img>` `src` is the app's image optimizer URL and `alt` equals the envelope's `alt`

#### Scenario: Fonts load same-origin
- **WHEN** the document loads
- **THEN** the woff2 requests are on the app origin and no font request fails with a CORS error

### Requirement: Chrome and copy come from the `/site` envelope
Header, footer, language toggle, and every visible string SHALL be rendered from `/site?lang=` (`header`, `footer`, `identity`, `strings`, `categories`) and the route envelope's `languages`; the app SHALL contain no hardcoded visible copy. The language toggle SHALL link to the current route's translations.

#### Scenario: Spanish chrome
- **WHEN** any `/es/…` route renders
- **THEN** nav labels, footer columns, skip link, and empty-state copy are the Spanish strings from `/site?lang=es`

#### Scenario: Language toggle points at translation
- **WHEN** a visitor is on a Spanish post that has an English translation
- **THEN** the toggle's English link is that translation's path (re-homed), not the English front page

### Requirement: Envelope-driven document head
Each route's `<head>` SHALL be generated from the envelope's `seo` block: `<title>`, `meta description`, `meta robots`, `rel=canonical` (verbatim from the envelope), `hreflang` alternates, and Open Graph tags (`og:url` = canonical, image from the route or `identity.share_image`). The styleguide SHALL be `noindex,follow` regardless of the envelope. `sitemap.xml` and `robots.txt` SHALL be generated from the routes manifest on the app's public origin.

#### Scenario: Canonical verbatim
- **WHEN** a route envelope carries `seo.canonical`
- **THEN** the document's canonical `href` equals it byte-for-byte

#### Scenario: Sitemap lists both languages
- **WHEN** `/sitemap.xml` is requested
- **THEN** it lists every indexable manifest route in both languages with `hreflang` alternates and excludes search and styleguide

### Requirement: Error and empty surfaces
Upstream or contract failures SHALL render a designed error surface (status 500, no fake content, retry affordance); unknown routes SHALL render the 404 twin of `404.twig` using the `nf_*` strings; empty lists SHALL render the designed empty states from `island-empty-states` with envelope copy. Production builds SHALL contain no fixture content outside the styleguide.

#### Scenario: WordPress unreachable with a cold cache
- **WHEN** WordPress is unreachable and the route is not cached
- **THEN** the app answers 500 with the error surface and logs the upstream failure

#### Scenario: No upcoming events
- **WHEN** the events envelope is empty
- **THEN** the calendar renders the `cal_empty_h` / `cal_empty_p` state, not a blank grid

### Requirement: Client navigation
Internal navigation SHALL be client-side with prefetch on viewport/hover, scroll to top or to the `#hash` target, and a cross-fade between routes implemented with the View Transitions API through Next's view-transition support; the cross-fade SHALL be disabled when `prefers-reduced-motion: reduce` or the a11y widget's reduce-motion setting is active, and SHALL degrade to an instant swap on browsers without the API. URL-state interactions (search, filter, page, calendar view) SHALL NOT scroll the page.

The route commits as soon as the page shell resolves, so the cross-fade is followed by a window in which a Suspense fallback stands in for the content. What the chrome does during that window — the footer held unpainted until there is content above it — is `next-js/openspec/specs/route-loading`.

#### Scenario: Cross-fade
- **WHEN** a visitor without a reduced-motion preference navigates from the front page to a post
- **THEN** the route change is animated as a document cross-fade and the post's `<h1>` is present after the transition

#### Scenario: Reduced motion
- **WHEN** the visitor has `prefers-reduced-motion: reduce` or reduce motion enabled in the widget
- **THEN** the route change is instant with no view transition

#### Scenario: Unsupported browser
- **WHEN** the browser lacks `document.startViewTransition`
- **THEN** navigation completes instantly with no console error

### Requirement: Interactive archive and calendar
The posts index SHALL treat the URL as its state: typing or choosing writes `?s=`, `?category=`, `?paged=` (debounced 300 ms, replace not push, no scroll), the results fragment re-renders on the server, a pending state is exposed while it does, and superseded requests are discarded. Browse mode (no query, "All") SHALL render the embedded first page and featured card with no request. The calendar SHALL receive its events window as server-rendered props, handle month navigation and month/list view (`?view=list`) client-side within that window, and fetch windows outside it from the same-origin `GET /api/events` handler.

#### Scenario: Search is URL state
- **WHEN** a visitor types "strike" in the archive search
- **THEN** after the debounce the URL is `?s=strike`, results render server-side, and reloading the URL renders the same results

#### Scenario: Superseded query
- **WHEN** a visitor types a second query before the first resolves
- **THEN** only the results for the latest query are shown

#### Scenario: Month outside window
- **WHEN** a visitor navigates the calendar to a month outside the loaded window
- **THEN** the app requests `/api/events` on its own origin, shows the loading status, and renders the month; no request goes to WordPress from the browser

### Requirement: No browser-to-WordPress traffic
The browser SHALL make no requests to the WordPress origin for data or scripts; only media (`next/image` sources, in-content uploads) and WordPress-only link-outs (ICS, admin) may reference it.

#### Scenario: Network audit
- **WHEN** a visitor loads the front page, searches the blog, and navigates the calendar
- **THEN** the only requests to the WordPress origin are image requests

### Requirement: Styleguide route
`/styleguide/` SHALL render every site component with fixture data and the shadcn/ui kitchen sink (every installed registry component via its canonical example), in every tone band and a11y mode, with an in-page table of contents, and SHALL be `noindex,follow`; it is the visual guide to the library, the visual-parity surface, and the first axe-core target.

#### Scenario: Styleguide complete
- **WHEN** `/styleguide/` renders
- **THEN** it contains a section per site component, per tone band, and per installed shadcn/ui component, each reachable from the table of contents, and its robots directive is `noindex,follow`
