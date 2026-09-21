## 1. Shared sanitizer

- [x] 1.1 Add `progressnow_safe_url( $raw ): string` — `esc_url_raw( $raw, [ 'http', 'https', 'mailto', 'tel' ] )`, returns `''` on rejection
- [x] 1.2 Unit-test the helper: safe schemes pass, `javascript:`/`data:`/`vbscript:`/`file:` dropped, empty in → empty out

## 2. Fix confirmed sinks

- [x] 2.1 `inc/blog.php` video block: route `transcriptUrl` through `progressnow_safe_url`; omit key when empty
- [x] 2.2 `inc/blog.php` video block: route `url` through `progressnow_safe_url`
- [x] 2.3 `inc/blog.php` image block: sanitize regex-fallback `src` (`progressnow_safe_url`)
- [x] 2.4 `inc/blog.php` pagination: replace `get_pagenum_link( $n, false )` with an escaped equivalent
- [x] 2.5 `inc/events.php`: sanitize `rsvpUrl` in both the context serializer and the block-embed serializer

## 3. Sweep for missed sinks

- [x] 3.1 Grep `src/**/*.vue` for every `:href` / `:src` binding; trace each to its serializer field
- [x] 3.2 Confirm each traced field is sanitized; fix any not covered

## 4. Regression tests

- [x] 4.1 Add hostile-URL fixtures + assertions for video transcript/url, image src, pagination, event rsvp
- [x] 4.2 Run `composer test`; confirm green in CI

## 5. Content audit (one-time)

- [x] 5.1 Scan existing block attrs + `rsvp_url` meta for dangerous-scheme values; report/clean any found

## Notes (apply 2026-09-07)

- Helper lives in `inc/sanitize.php` (loaded first in `functions.php`); tests in `tests/test-url-sinks.php`.
- 3.1/3.2 sweep: beyond the five confirmed sinks, these editable URL fields were also routed through `progressnow_safe_url()`: action-callout button `url` (was `esc_url_raw` w/o allow-list), JSON-LD event `offers.url`, page ACF link rows (about/get-involved link_row, governance docs, join steps `link_url`, channels, `gi_card_link_url`, `about_committees_link_url`), Chapter Settings `join_url` / `newsletter_url` / `instagram_url` / `facebook_url` / `twitter_url` / `newhere_link_url`, front-page `hero_cta_*_url` / `who_link_url`. Attachment, permalink, Polylang and generated (gcal/ics/maps) URLs are trusted as-is.
- 4.2: `composer test` green locally (180 tests). CI run pending push.
- 5.1: real WP DB not reachable from this environment. Added `wp chapter audit-urls` (`progressnow_audit_unsafe_urls()`, unit-tested) for the one-time scan on the host; the Vercel snapshot (`deploy/mock-api/snapshot.json`) was scanned and contains only `https:`/`mailto:` URLs.
