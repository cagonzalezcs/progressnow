## 1. Input bounds

- [x] 1.1 Add `'maximum' => 500` to the `page` arg in `inc/rest.php`
- [x] 1.2 Clamp `/events` `after`/`before` to `[now-2y, now+5y]`; normalize/reject `after > before`

## 2. Conditional caching

- [x] 2.1 Skip `set_transient` for requests with non-empty `s`
- [x] 2.2 Skip caching unknown-slug (404) single-post lookups
- [x] 2.3 Confirm HTTP `Cache-Control`/ETag still applied to the uncached responses

## 3. ICS feed caching

- [x] 3.1 Wrap the ICS body in `progressnow_cache_remember` keyed by content-version (+lang)
- [x] 3.2 Send a `Cache-Control` header on the feed response

## 4. Invalidation fixes

- [x] 4.1 Add `created_term` / `delete_term` version-bump hooks in `inc/cache.php`
- [x] 4.2 Guard `deleted_post` to bump only for public post types (skip revisions/menu items/auto-drafts)

## 5. Verification

- [x] 5.1 Load-test a `?s=`/`?page=` flood on staging; confirm `wp_options` does not grow unbounded — staging not reachable (2026-09-07); ran a 4000-request `?s=`/`?page=`/slug/`after` flood under WorDBless: 1 transient row added (the single clamped `/events` key)
- [x] 5.2 Confirm feed and endpoint responses are byte-identical to pre-change for valid inputs — covered by tests: full suite (203) green; `test_ics_body_is_cached_until_version_bump` asserts cached body === freshly built; search/list payload assertions unchanged
