## ADDED Requirements

### Requirement: Standalone build and container image
The app SHALL build with `output: 'standalone'`; a multi-stage Dockerfile SHALL produce a non-root image that honors `PORT` and `HOSTNAME`, exposes `/api/health`, and runs on Node 22.

#### Scenario: Container smoke
- **WHEN** the image runs with the required environment
- **THEN** `/api/health` answers 200 within the readiness window and `/` renders

### Requirement: Environment contract and startup validation
The app SHALL read `WP_API_BASE` (server), `WP_ORIGIN` (derived from `WP_API_BASE` unless set), `NEXT_PUBLIC_SITE_ORIGIN`, `CHAPTER_REBUILD_SECRET`, optional `WP_BUILD_STATUS_URL`, `IMAGE_HOSTS`, and `MOCK_API`; it SHALL fail fast at startup with a named error when a required variable is missing or malformed, and `.env.example` SHALL document each.

#### Scenario: Missing secret
- **WHEN** the server starts without `CHAPTER_REBUILD_SECRET` and `MOCK_API` unset
- **THEN** startup fails naming the variable

### Requirement: Security headers and CSP
Every HTML response SHALL carry `Content-Security-Policy` with a per-request nonce (`script-src 'self' 'nonce-…' 'strict-dynamic'`, `img-src 'self' data: <uploads host>`, `font-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`; the a11y bootstrap script and framework inline scripts SHALL use the nonce; `X-Powered-By` SHALL be absent.

#### Scenario: CSP enforced
- **WHEN** any route renders
- **THEN** the response carries the CSP with a fresh nonce, the page runs without CSP violations, and an injected inline script without the nonce is blocked

### Requirement: Image optimization policy
`next/image` SHALL allow only the hosts in `IMAGE_HOSTS` (default: the WordPress origin), serve AVIF/WebP, and SHALL NOT enable `dangerouslyAllowSVG`.

#### Scenario: Unknown host rejected
- **WHEN** an image URL on an unlisted host is requested through the optimizer
- **THEN** the optimizer answers 400

### Requirement: Static and proxied asset caching
Build assets SHALL be served immutable; the same-origin proxy of `/wp-content/themes/progressnow/static/*` SHALL forward to `WP_ORIGIN` and set `Cache-Control: public, max-age=31536000, immutable` on fonts and brand assets.

#### Scenario: Font cached
- **WHEN** a woff2 file is requested through the proxy
- **THEN** the response carries the immutable cache header

### Requirement: Portability
The same build SHALL run on Vercel, a container platform, and a VPS behind a reverse proxy without code changes; `docs/deployment.md` SHALL document each path plus the WordPress constants (`CHAPTER_REBUILD_TRANSPORT=webhook`, `CHAPTER_REBUILD_WEBHOOK_URL`, `CHAPTER_REBUILD_SECRET`, `CHAPTER_CANONICAL_ORIGIN`) and the multi-instance cache seam.

#### Scenario: Guide completeness
- **WHEN** an operator follows the Docker path of the guide against a seeded WordPress
- **THEN** the site renders, a content save refreshes it, and the WordPress admin "Site build" panel shows the build live

### Requirement: Observability
Server logs SHALL be structured lines including route, status, duration, and `requestId` for the receiver; contract and upstream failures SHALL be logged with endpoint and error code; no personal data or secrets SHALL be logged.

#### Scenario: Upstream failure logged
- **WHEN** WordPress answers 503 for an envelope
- **THEN** one structured log line records the endpoint and status

### Requirement: Documentation deliverables
The change SHALL update `docs/deployment.md` ("Headless Next.js"), `docs/accessibility-statement.md`, the root `README.md` (one CMS, three frontends, per-install decision table), and add `next-js/README.md` (commands, layout, data flow, env, tests).

#### Scenario: README describes the choice
- **WHEN** a new operator reads the root README
- **THEN** they can pick PHP, `nuxt-js`, or `next-js` and find the constants each requires
