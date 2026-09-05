# Design: rest-data-layer

## Context

Third of three changes. Serializers, registry, cache helper, and (ideally) Gutenberg-backed `post_content` already exist. Only consumer of the API is the theme's own bundle, deployed atomically with the PHP.

## Goals / Non-Goals

**Goals:** server-truth search/filter/pagination; slim calendar payload; zero prod fixtures; validated contracts; cacheable responses.

**Non-Goals:** writes, auth, SSR/hydration framework, external API consumers, `/settings` endpoint (chrome stays embedded; additive later).

## Decisions

### D1: Endpoints (`inc/rest.php`, `rest_api_init` → `rgvdsa_rest_register_routes()`)

| Route | Returns |
|---|---|
| `GET /rgvdsa/v1/posts` | `{ posts: BlogPost[], page, perPage, total, totalPages }` |
| `GET /rgvdsa/v1/posts/{slug}` | `SinglePostData` + `readNext: BlogPost[]` |
| `GET /rgvdsa/v1/events` | `{ events: ChapterEvent[], categories: EventCategory[] }` |
| `GET /rgvdsa/v1/categories` | `{ categories: EventCategory[] }` |

`/posts` args via `register_rest_route` `args` schemas (core validates): `page` (int ≥1), `per_page` (1–50, default 24), `category` (enum from registry → core 400 `rest_invalid_param`), `s` (max 100, `sanitize_text_field`). `/events`: `after`/`before` `Y-m-d`, defaulting to −1/+12 months. Handlers reuse `rgvdsa_post_to_blog_post()`, `rgvdsa_post_to_single()`, `rgvdsa_event_to_chapter_event()`, `rgvdsa_categories()`, and the shared `rgvdsa_blog_posts_query()` (envelope from `found_posts`/`max_num_pages`).

### D2: Embedded vs fetched boundary
- **Fetched:** `BlogArchive` interactions (the feature), `EventCalendar` (month nav over a window; skeleton on load).
- **Embedded:** chrome islands (first paint, no queries), front-page Twig sections, **`SinglePost`** — SEO-critical, exactly one query, zero interactive queries; `/posts/{slug}` is still built as the contract-test surface and future-proofing.
- **Hybrid archive:** browse page 1 embedded as `initialPosts`/`initialTotal` (no fetch flash); any state change fetches. On mount with URL filters present, fetch immediately instead of trusting embedded props.

### D3: Permissions, caching, errors, versioning
- `permission_callback => '__return_true'`; queries pinned `post_status => 'publish'`. GET-only ⇒ no nonces.
- Transients: responses through `rgvdsa_cache_remember()` (version-bump invalidation from `backend-consolidation`).
- HTTP: one `rest_post_dispatch` filter scoped to the namespace — anonymous: `Cache-Control: public, max-age=300, stale-while-revalidate=3600`, `ETag: "md5(body)"`, 304 on `If-None-Match`; logged-in: `no-store` (editors always fresh).
- Errors: standard WP `{ code, message, data: { status } }`; named `rgvdsa_post_not_found` (404); no invented envelope. TS client normalizes to typed `ApiError`.
- `/v1` namespace; policy: additive = non-breaking, rename/remove = `/v2`. Cheap insurance — consumer deploys atomically.

### D4: Archive island rework
Delete the client-side `filtered` computed (`BlogArchive.vue:58-65`) — the double-filter bug. `src/lib/api.ts`: `fetchPosts({ s, category, page })` against `apiBase` prop (`rest_url('rgvdsa/v1')` embedded in `views/index.twig`). Search debounced 300 ms (`useDebounceFn`, @vueuse/core already a dep); `AbortController` cancels stale requests; loading + error states in the results section. URL sync keeps `?s=&category=`, adds `paged`; result line uses envelope `total` (counts stop lying). Pagination island-driven; keep real `<a href>` + `@click.prevent` so middle-click/no-JS hit the server-paged archive (`/page/2/` still works via Twig context).

### D5: Fixture strip + empty states
`SAMPLE_POSTS/SAMPLE_SINGLE/SAMPLE_EVENTS` + island-local lorem → `src/lib/fixtures/`, imported only by `Styleguide.vue` (keeps the visual-regression page). Remove `withDefaults` fixture fallbacks in all 8 islands. Designed empty states: archive "No posts yet", calendar "No events scheduled — subscribe", front-page states from `backend-consolidation`. PHP contexts in `inc/blog.php`/`inc/events.php`/`inc/interior.php` switch to always-set (possibly empty) keys.

### D6: SEO/no-JS mitigation
`views/single.twig`: render title, dek, and sanitized prose HTML inside the island mount element via a small Twig loop over `single_post.blocks` — `createApp().mount(el)` replaces children on hydration, so this is simultaneously the crawlable content and the no-JS fallback. `views/index.twig`: `noscript` `<ul>` of current-page post links (data already in context). Canonical crawl path remains the server-paged archive. Full SSR explicitly out of scope.

### D7: Contract governance
`src/lib/schemas.ts`: zod schemas for `BlogPost`, `PostBlock` (discriminated union), `SinglePostData`, `ChapterEvent`, `EventCategory`, envelopes; `PostCat` derived from registry slugs. Existing interfaces become `z.infer` re-exports — one definition. Runtime: `parse()` in dev (throw loudly), `safeParse()` in prod (console.error + error state). Sync bridge = committed `tests/fixtures/*.json`: PHPUnit seeds known content, runs serializers + `rest_do_request()`, asserts equality; vitest parses the same files with zod. Contract change fails one side until both agree. No codegen/JSON-Schema toolchain — right-sized for one dev. WorDBless caveat: ACF absent in harness → `get_field()` polyfill from `backend-consolidation`; block serializer needs no ACF at all.

## Risks / Trade-offs

- [CSR archive states invisible to non-JS crawlers] → canonical server-paged path + noscript list; accepted.
- [ETag md5 per request costs CPU] → trivial at this payload size; transient already avoided the query cost.
- [zod in prod bundle] → already a dependency (vee-validate); schemas tree-shake per island chunk.
- [Hybrid first page can briefly disagree with a stale cache] → 300 s max-age; acceptable.

## Migration Plan

Island bundle + `inc/rest.php` ship together (atomic). REST failure degrades to embedded page 1 + error state. Rollback = revert bundle + `inc/rest.php`; embedded-props behavior restores exactly.

## Open Questions

1. Land before `gutenberg-post-blocks` (search limited to title/excerpt until migration) or strictly after? (recommend after)
2. Expose `per_page` to the island UI or pin at 24? (recommend pin)
