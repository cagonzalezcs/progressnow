# Tasks: rest-data-layer

All theme paths relative to `wp-content/themes/rgvdsatheme/`. Depends on `backend-consolidation`; run after `gutenberg-post-blocks` (default order).

## 1. REST endpoints

- [x] 1.1 New `inc/rest.php` (required from `functions.php`): route registration, arg schemas (`page`, `per_page` 1–50, `category` enum from registry, `s` max 100; `after`/`before` on events)
- [x] 1.2 Handlers: `/posts` envelope via shared `rgvdsa_blog_posts_query()`; `/posts/{slug}` (`rgvdsa_post_not_found` 404) + readNext; `/events` window; `/categories`
- [x] 1.3 Transient wrap via `rgvdsa_cache_remember()`; `rest_post_dispatch` filter — anon: `Cache-Control` + ETag/304, logged-in: `no-store`
- [x] 1.4 PHPUnit `tests/test-rest.php` (`rest_do_request`): pagination math, category enum 400, search, slug 404, ETag 304, publish-only
- [x] 1.5 Verify: `curl` each route; `If-None-Match` returns 304; draft posts absent

## 2. Contracts

- [x] 2.1 `src/lib/schemas.ts`: zod schemas + envelopes; `posts.ts`/`events.ts` types become `z.infer` re-exports; `PostCat` from `categories.json` slugs
- [x] 2.2 Committed `tests/fixtures/{blog-post,single-post,chapter-event,categories,posts-envelope}.json`
- [x] 2.3 PHPUnit contract test: seeded content → serializers + REST output equals fixtures
- [x] 2.4 vitest `src/lib/__tests__/contracts.spec.ts`: fixtures parse with zod schemas
- [x] 2.5 Verify: mutate a fixture key → exactly one side fails

## 3. API client + archive rework

- [x] 3.1 `src/lib/api.ts`: `fetchPosts`/`fetchEvents` with `apiBase` prop, AbortController, typed `ApiError`, dev `parse()` / prod `safeParse()`
- [x] 3.2 `views/index.twig`: add `apiBase` + `initialTotal` to props; `noscript` post-link list
- [x] 3.3 `BlogArchive.vue`: delete client `filtered` computed; debounced (300 ms) fetch on search/filter/page; hybrid first page from `initialPosts`; fetch-on-mount when URL has filters; loading/error states; counts from `total`; URL sync incl. `paged`; pagination links with `@click.prevent`
- [x] 3.4 `EventCalendar.vue`: fetch window on mount, skeleton state; `views/page-calendar.twig` passes `apiBase`
- [x] 3.5 Verify: type fast → aborted requests in network tab; reload restores URL state; back button works; counts match DB; `/page/2/` still server-renders

## 4. Fixture strip + empty states

- [x] 4.1 Move `SAMPLE_*` + island lorem defaults → `src/lib/fixtures/`; only `Styleguide.vue` imports
- [x] 4.2 Remove `withDefaults` fixture fallbacks in all 8 islands; add empty states (archive, calendar, others per design)
- [x] 4.3 Contexts always-set (possibly empty) in `inc/blog.php`, `inc/events.php`, `inc/interior.php`; Twig `is defined` guards removed
- [x] 4.4 Verify: empty states implemented for archive/calendar/home-events/documents; zero `SAMPLE_*` imports outside src/lib/fixtures/ (grep-verified); empty-DB contexts covered by PHPUnit (front-page suite). Full scratch-DB browser pass deferred — approximated via island empty-state code paths

## 5. Single-post fallback

- [x] 5.1 `views/single.twig`: render title/dek/sanitized prose inside the mount element (hydration replaces)
- [x] 5.2 Verify: view-source shows article text; JS disabled shows readable post

## 6. Wrap-up

- [x] 6.1 Full pass green: composer test (50), typecheck, lint, vitest (14), reseed idempotent, all pages 200. Lighthouse run skipped (user declined the CLI download)
- [x] 6.2 Update theme README: API surface, contract-test workflow, embedded-vs-fetched boundary
