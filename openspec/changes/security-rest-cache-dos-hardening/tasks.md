## 1. Input bounds

- [ ] 1.1 Add `'maximum' => 500` to the `page` arg in `inc/rest.php`
- [ ] 1.2 Clamp `/events` `after`/`before` to `[now-2y, now+5y]`; normalize/reject `after > before`

## 2. Conditional caching

- [ ] 2.1 Skip `set_transient` for requests with non-empty `s`
- [ ] 2.2 Skip caching unknown-slug (404) single-post lookups
- [ ] 2.3 Confirm HTTP `Cache-Control`/ETag still applied to the uncached responses

## 3. ICS feed caching

- [ ] 3.1 Wrap the ICS body in `progressnow_cache_remember` keyed by content-version (+lang)
- [ ] 3.2 Send a `Cache-Control` header on the feed response

## 4. Invalidation fixes

- [ ] 4.1 Add `created_term` / `delete_term` version-bump hooks in `inc/cache.php`
- [ ] 4.2 Guard `deleted_post` to bump only for public post types (skip revisions/menu items/auto-drafts)

## 5. Verification

- [ ] 5.1 Load-test a `?s=`/`?page=` flood on staging; confirm `wp_options` does not grow unbounded
- [ ] 5.2 Confirm feed and endpoint responses are byte-identical to pre-change for valid inputs
