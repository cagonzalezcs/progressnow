## Context

`inc/rest.php` wraps each handler in `progressnow_cache_remember( md5(...user inputs...) , fn )`, which uses transients. On a site without a persistent object cache (Redis/Memcached), transients live in `wp_options`. The cache keys include: `s` (100-char free text), `page` (min 1, no max), single-post `slug` (any `[a-z0-9-]+`, with 404s negatively cached), and `after`/`before` (any valid dates). `inc/events.php` ICS feed (`/feed/progressnow-events/`) runs `progressnow_events_query()` (`posts_per_page => -1`) plus per-event URL building on every anonymous hit, uncached. `inc/cache.php` bumps a content version on `save_post`/`deleted_post` but not on term create/delete, and `deleted_post` fires for revisions/menu items too.

## Goals / Non-Goals

**Goals:**
- Bounded worst-case query cost and bounded options-table growth from anonymous traffic.
- Feed and endpoints remain correct and identically-shaped.

**Non-Goals:**
- Introducing Redis/object cache (worth doing, but a separate infra decision; this change must be safe *without* it).
- Rate-limiting at the app layer (belongs at the edge/WAF).

## Decisions

- **Add `maximum` to `page`.** 500 is far beyond real archive depth; huge `OFFSET` walks are eliminated. Alternative (clamp to `max_num_pages`) is nicer but needs a count first — cap is simpler and sufficient.
- **Do not persist-cache the long tail.** For requests with non-empty `s`, or single-post lookups that miss (404), skip `set_transient` and serve computed-but-uncached results; the response still carries `Cache-Control`/ETag so edge/browser caches absorb repeats. Rationale: these are precisely the unbounded-cardinality keys; caching them is what enables the options flood, and it barely helps hit-rate.
- **Clamp the events window** to `[now-2y, now+5y]` and reject/normalize `after > before`. Rationale: bounds both query scope and cache cardinality; the calendar never needs more.
- **Cache the ICS body** with `progressnow_cache_remember` keyed by content-version (+lang) and add `Cache-Control`. Rationale: the feed is identical for all anonymous consumers between edits.
- **Invalidation tightening:** add `created_term`/`delete_term` hooks; guard `deleted_post` to bump only for the public post types (post/event/page), not revisions/nav-menu-item/auto-draft.

## Risks / Trade-offs

- [Skipping cache for search increases per-request CPU under a search flood] → The expensive part (the `LIKE` query) is unavoidable either way; not writing transients removes the DB-write amplification, and edge caching handles honest repeat traffic.
- [`page` cap rejects a legitimate deep page] → 500 pages × perPage is well past any real archive; raise deliberately if ever needed.
- [Window clamp changes results for an out-of-range explicit query] → Documented; the UI never requests outside the window.

## Migration Plan

1. Add arg bounds + date clamp in `inc/rest.php`.
2. Make caching conditional (skip search/negative).
3. Cache ICS + add headers.
4. Fix invalidation hooks in `inc/cache.php`.
5. Load-test a `?s=`/`?page=` flood against staging; confirm `wp_options` no longer grows unbounded.

## Open Questions

- Is a persistent object cache (Redis) on the roadmap? If yes, the "skip caching search" rule can be relaxed to a bounded LRU instead.
