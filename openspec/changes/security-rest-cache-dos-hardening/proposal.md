## Why

The public `progressnow/v1` REST layer and the ICS feed have unbounded, user-controlled inputs that amplify load and bloat the database. The transient cache keys hash user-controlled values with unbounded cardinality — free-text `?s=`, unbounded `?page=`, arbitrary `?after`/`?before` date ranges, and single-post slug 404s that get negatively cached. Without a persistent object cache, each distinct value writes options-table rows via `set_transient`, and every cache miss still runs an expensive `LIKE '%…%'` or huge-`OFFSET` query — so the cache provides zero DoS protection while amplifying write load. A loop over random `?s=`/`?page=` values floods `wp_options` and hammers the DB. The ICS feed runs an all-events query on every anonymous hit with no caching. None of this is exploitable for data disclosure, but it is a low-effort availability/cost risk that grows with content volume.

## What Changes

- Bound REST pagination: add `maximum` to `page` (e.g. 500) alongside the existing `minimum`.
- Stop transient-caching high-cardinality/negative requests: do not persist cache entries for free-text search or unknown-slug 404s; rely on the HTTP `Cache-Control` layer for the long tail.
- Clamp the events date window (`after`/`before`) to a sane range and require `after <= before`.
- Cache the ICS feed body (`progressnow_cache_remember`) and send `Cache-Control`.
- Tighten cache invalidation: bump on `created_term`/`delete_term`; guard `deleted_post` so revisions/menu items don't churn the content version.

## Capabilities

### New Capabilities
- `rest-availability-hardening`: Input bounds, cache-cardinality controls, and feed caching that keep the public read API cheap and DoS-resistant.

### Modified Capabilities
<!-- Implementation hardening of existing rest-api behavior; no published requirement text changes. -->

## Impact

- **Code:** `inc/rest.php` (arg bounds, conditional caching, date clamp), `inc/events.php` (ICS caching), `inc/cache.php` (invalidation hooks).
- **Behavior:** identical responses; only cache/query cost and options-table growth change.
- **No API contract change.**
