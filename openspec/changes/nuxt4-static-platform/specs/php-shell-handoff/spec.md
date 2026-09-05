## ADDED Requirements

### Requirement: Every public route is served first as a PHP shell
WordPress SHALL respond to every public URL (both languages) with a Timber-rendered document containing: the full SEO head from `inc/seo.php` (title, description, canonical, robots, Open Graph/Twitter, JSON-LD, hreflang), a `<div id="__nuxt">` whose children are crawlable HTML for the route — header navigation links, the route's content (front-page sections, page body and sections, post article, event details, current-page post list for archives), and footer links — and no dependence on JavaScript for that content to be present.

#### Scenario: Crawler receives complete content
- **WHEN** `/blog/some-post/` is fetched without JavaScript
- **THEN** the response contains the article title, dek, sanitized prose, header nav links, and footer links inside `#__nuxt`, plus the SEO head

#### Scenario: Spanish route shell
- **WHEN** `/es/calendario/` is fetched
- **THEN** the shell renders Spanish chrome and page content with `lang="es"` and Spanish SEO metadata

### Requirement: Embedded route payload
The shell SHALL embed one `<script type="application/json" id="__SHELL_DATA__">` element carrying `{ lang, routeKind, path, contentVersion, buildId, data: { <key>: <payload> } }` where each `data` key follows the shared key grammar (`site:{lang}`, `routes`, `front:{lang}`, `page:{lang}:{path}`, `post:{lang}:{slug}`, `event:{lang}:{slug}`, `posts:{lang}` on the posts index) and each value equals the corresponding REST endpoint's response for that route. JSON SHALL be encoded with HTML-safe escaping so `</script>` cannot break out.

#### Scenario: Payload matches REST
- **WHEN** the shell for a single post renders
- **THEN** `data["post:en:<slug>"]` deep-equals `GET /progressnow/v1/posts/<slug>?lang=en` and `data["site:en"]` deep-equals `GET /progressnow/v1/site?lang=en`

#### Scenario: Hostile content cannot escape the payload
- **WHEN** post content contains `</script><script>alert(1)</script>`
- **THEN** the embedded JSON contains the escaped sequence and the document parses with a single JSON script element

### Requirement: App assets resolved from the shell manifest
The shell SHALL read `shell-manifest.json` from the configured static origin, cache it in a transient for 60 seconds, and emit, in this order, `<script type="importmap">` from `importmap`, `<link rel="stylesheet">` for each `css` entry, `<link rel="modulepreload">` for each `modulepreload` entry, an inline `<script>window.__NUXT__={};window.__NUXT__.config=<runtimeConfig></script>`, and `<script type="module">` for `entry`. When the manifest is unreachable or invalid the shell SHALL still render its crawlable content, omit the app tags, and log once per minute.

#### Scenario: Tags follow the manifest
- **WHEN** the manifest declares entry `/_nuxt/entry.abc.js`, one stylesheet, and an importmap
- **THEN** the head contains the importmap, a stylesheet link for that CSS path, the `window.__NUXT__` config script, and a module script for that entry, and no `__NUXT_DATA__` element

#### Scenario: Degraded mode without a build
- **WHEN** the static origin returns 404 for the manifest
- **THEN** the page renders with content and SEO head, without app tags, and no PHP error surfaces

### Requirement: Nuxt takes over the document without refetching
On load the Nuxt client SHALL mount into `#__nuxt` (client mount, not hydration), render the landing route from the embedded payload without issuing a request for that route's data, preserve document language, title, and scroll position, and thereafter handle navigation client-side.

#### Scenario: No landing-route request
- **WHEN** the front page shell loads with a valid build
- **THEN** the app renders the front page with zero requests to `/progressnow/v1/*` or `_payload.json` for the landing route

#### Scenario: Takeover keeps state
- **WHEN** a visitor arrives at `/blog/some-post/#section` and the app mounts
- **THEN** the document title and scroll target are unchanged after mount

### Requirement: Logged-in visitors with the admin bar bypass the app
When the admin bar renders, the shell SHALL omit the app tags and mark the document `data-frontend="php"`, so editors keep full PHP page loads and a working admin-bar Edit link.

#### Scenario: Editor browses in PHP
- **WHEN** a logged-in editor with the admin bar visits any public page
- **THEN** no Nuxt script loads and clicking a link performs a full PHP page load

### Requirement: Frontend mode flag during migration
A `CHAPTER_FRONTEND` constant (`islands` default, `nuxt`) SHALL select between the existing Vite islands and the shell+Nuxt handoff until the islands are removed; the two modes SHALL never both enqueue their bundles on one page.

#### Scenario: Flag flips the bundle
- **WHEN** `CHAPTER_FRONTEND` is `nuxt`
- **THEN** the page contains the Nuxt entry tags and no `main-app-script` enqueue; when `islands`, the reverse

### Requirement: Static passthrough (same-host mode)
When `CHAPTER_STATIC_DIR` is defined, WordPress SHALL serve `/_nuxt/*`, `*/_payload.json`, `/_payload.json`, and `/shell-manifest.json` from that directory (ignoring any query string, e.g. `?_b=<buildId>`) with correct `Content-Type`, `Cache-Control` (`immutable` for `/_nuxt/*`, `max-age=60` otherwise), and 404 for missing files, before WordPress routing runs — in development (pointed at `nuxt-js/.output/public`) and in production as the fallback behind the web server's own rules. Path traversal outside the directory SHALL be rejected. When the constant is undefined the passthrough SHALL be inert.

#### Scenario: Generated assets served
- **WHEN** the constant points at `nuxt-js/.output/public` and `/_nuxt/entry.abc.js` is requested
- **THEN** the file is returned as `text/javascript` with an immutable cache header

#### Scenario: Traversal rejected
- **WHEN** a request path attempts to escape the static directory with parent-directory segments
- **THEN** the response is 404 and no file outside the directory is read

### Requirement: New build purges PHP caches
When the shell observes a `buildId` different from the recorded live build, WordPress SHALL record the new live build and content version, clear the manifest transient, and purge the page cache (WP Super Cache when active).

#### Scenario: Page cache refreshed after a build
- **WHEN** a build with a new `buildId` lands and any front-end request arrives
- **THEN** the page cache is purged and subsequent responses embed the new entry tags
