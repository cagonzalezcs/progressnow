# Proposal: rest-data-layer

## Why

Dynamic islands currently receive one embedded payload and fake the rest client-side: `BlogArchive` "search" filters only the 24 posts already on the page (result counts lie, filtering happens twice — server via `?category=`/`?s=` on reload, client live), pagination is full page loads, and the calendar ships its whole 13-month window inline. Meanwhile every island carries lorem `SAMPLE_*` fixtures as prop defaults, so any missing context key silently renders fake content on the live site. The chapter decided (2026-07-02) to move dynamic island data onto a first-party REST layer, strip fixtures from production, and formalize the PHP↔TS contracts.

## What Changes

- New `inc/rest.php`: public GET namespace `legacy/v1` — `/posts` (server-side search/filter/pagination envelope), `/posts/{slug}`, `/events` (windowed), `/categories`. Reuses existing serializers; shares `legacy_blog_posts_query()` with Twig contexts so shapes cannot drift.
- HTTP caching: namespace-scoped `Cache-Control` + ETag/304 for anonymous requests; transient-backed responses via `legacy_cache_remember()`.
- `BlogArchive` rework: first browse page stays embedded (`initialPosts`, no flash); any search/filter/page interaction fetches via debounced, abortable `src/lib/api.ts` client; honest counts from `total`; URL state (`?s=&category=&paged=`) preserved; server-paged archive URLs and a `noscript` link list keep the crawl path.
- `EventCalendar` fetches its window on mount with a skeleton state.
- `SinglePost` stays embedded (SEO, one query, zero interactivity) and gains server-rendered fallback content inside the mount element (crawlable + no-JS).
- Fixture strip: `SAMPLE_*` moves to `src/lib/fixtures/` imported only by the styleguide; all islands get designed empty states; PHP contexts switch from "leave key unset" to "always set, possibly empty".
- Contract governance: zod schemas in `src/lib/schemas.ts` become the TS type source (`z.infer`); committed JSON fixtures asserted by both PHPUnit (REST `rest_do_request`) and vitest — contract drift fails one side.

Out of scope: write endpoints (newsletter stays an external link), auth, full SSR, non-theme API consumers.

## Capabilities

### New Capabilities
- `rest-api`: Versioned public read API for posts, events, and categories with validation, caching, and standard WP error shapes.
- `island-data-fetch`: BlogArchive/EventCalendar fetch server-truth data with debounce, abort, loading and error states, URL-synced.
- `island-empty-states`: No production fixture fallbacks; designed empty states everywhere; backend always supplies data.
- `contract-governance`: One schema source for island contracts, enforced by dual-sided fixture tests.

### Modified Capabilities

None outside the above.

## Impact

- New: `inc/rest.php`, `src/lib/api.ts`, `src/lib/schemas.ts`, `src/lib/fixtures/`, `tests/fixtures/*.json`, `tests/test-rest.php`
- `inc/blog.php`, `inc/events.php` — always-set contexts, shared query builder reuse
- `src/lib/posts.ts` / `src/lib/events.ts` — types re-derived from zod
- `src/components/site/blog/BlogArchive.vue`, `src/components/site/EventCalendar.vue`, all islands' `withDefaults`, `Styleguide.vue`
- `views/single.twig` (fallback content), `views/index.twig` (noscript list, `apiBase` prop)
- Depends on: `backend-consolidation` (registry, cache, tests); best after `gutenberg-post-blocks` (search covers body text — running earlier limits `s` to title/excerpt until migration lands)
