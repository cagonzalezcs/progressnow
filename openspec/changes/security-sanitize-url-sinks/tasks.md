## 1. Shared sanitizer

- [ ] 1.1 Add `progressnow_safe_url( $raw ): string` — `esc_url_raw( $raw, [ 'http', 'https', 'mailto', 'tel' ] )`, returns `''` on rejection
- [ ] 1.2 Unit-test the helper: safe schemes pass, `javascript:`/`data:`/`vbscript:`/`file:` dropped, empty in → empty out

## 2. Fix confirmed sinks

- [ ] 2.1 `inc/blog.php` video block: route `transcriptUrl` through `progressnow_safe_url`; omit key when empty
- [ ] 2.2 `inc/blog.php` video block: route `url` through `progressnow_safe_url`
- [ ] 2.3 `inc/blog.php` image block: sanitize regex-fallback `src` (`progressnow_safe_url`)
- [ ] 2.4 `inc/blog.php` pagination: replace `get_pagenum_link( $n, false )` with an escaped equivalent
- [ ] 2.5 `inc/events.php`: sanitize `rsvpUrl` in both the context serializer and the block-embed serializer

## 3. Sweep for missed sinks

- [ ] 3.1 Grep `src/**/*.vue` for every `:href` / `:src` binding; trace each to its serializer field
- [ ] 3.2 Confirm each traced field is sanitized; fix any not covered

## 4. Regression tests

- [ ] 4.1 Add hostile-URL fixtures + assertions for video transcript/url, image src, pagination, event rsvp
- [ ] 4.2 Run `composer test`; confirm green in CI

## 5. Content audit (one-time)

- [ ] 5.1 Scan existing block attrs + `rsvp_url` meta for dangerous-scheme values; report/clean any found
