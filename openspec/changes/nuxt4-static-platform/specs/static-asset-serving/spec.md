## ADDED Requirements

### Requirement: Static paths resolve on the site's own domain
`/_nuxt/*`, `*/_payload.json`, `/_payload.json`, and `/shell-manifest.json` SHALL resolve on the WordPress domain in every mode, so the app needs no `cdnURL`, CORS, or cross-origin script attributes.

#### Scenario: Same-origin assets
- **WHEN** the shell for `/blog/` loads its entry script and the app later fetches `/blog/some-post/_payload.json`
- **THEN** both requests go to the site's own origin

### Requirement: Same-host mode (default)
When `CHAPTER_STATIC_DIR` points at a directory holding the generated build, the static paths SHALL be served from that directory. The theme SHALL ship documented Apache `.htaccess` and nginx snippets that serve them directly from disk with the cache-control policy below, and SHALL keep the PHP passthrough (`php-shell-handoff`) as a fallback so the site works before the server rules are installed.

#### Scenario: Served from disk
- **WHEN** the server rules are installed and `/_nuxt/entry.abc.js` is requested
- **THEN** the web server answers from `CHAPTER_STATIC_DIR` without invoking PHP

#### Scenario: Fallback through PHP
- **WHEN** the server rules are absent
- **THEN** the same request is answered by the PHP passthrough with identical headers

### Requirement: CDN mode (optional)
When the operator fronts the domain with CloudFront, behaviors for the static paths SHALL route to the private S3 build bucket via origin access control and the default behavior SHALL route to the WordPress origin, forwarding all cookies, query strings, and the `Authorization`/`Host` headers and honoring origin `Cache-Control`. The distribution SHALL redirect HTTP to HTTPS, enable HTTP/2 and HTTP/3, and compress text responses. The reference Terraform module SHALL offer an opt-in origin group that fails over to the prerendered HTML in S3 on origin 5xx/timeout; when off, the default behavior SHALL target WordPress only.

#### Scenario: Assets from S3, pages from PHP
- **WHEN** a browser requests `/blog/` and then `/_nuxt/entry.abc.js`
- **THEN** the first response comes from WordPress and the second from S3, both on the same domain

#### Scenario: Admin traffic passes through
- **WHEN** an editor uses `/wp-admin/` or `/wp-login.php`
- **THEN** requests reach WordPress uncached with cookies intact

#### Scenario: WordPress outage with failover enabled
- **WHEN** the WordPress origin returns 503 for `/calendar/` and failover is on
- **THEN** CloudFront serves the prerendered `/calendar/index.html` from S3

### Requirement: Cache policy per path class
`/_nuxt/*` SHALL be served as immutable for a year; payloads and the manifest SHALL be cached at most 60 seconds (and invalidated per build in CDN mode); WordPress responses SHALL be cached only as their own headers allow (anonymous REST `max-age=300`, logged-in `no-store`).

#### Scenario: New build is visible within a minute
- **WHEN** a build lands
- **THEN** `/shell-manifest.json` and any `_payload.json` reflect the new build within 60 seconds in either mode
