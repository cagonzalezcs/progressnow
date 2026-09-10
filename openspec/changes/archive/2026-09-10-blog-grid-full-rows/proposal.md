## Why

Archive pages fetch 24 posts and lift one into the featured card, leaving 23 grid cards: at 3 columns (≥1200px) the last row holds 2, at 2 columns (`md`) it holds 1 — on every page that still has posts to show. next-js browse already asks for 25 (a8c5daa2), but the Vue island shared by the theme and nuxt-js (`BlogArchive.vue`) still fetches the default 24 for page N and for every filtered state, and next-js search/category results render a different, featured-less 260px grid at 24.

## What Changes

- **One page size.** `PROGRESSNOW_ARCHIVE_PER_PAGE = 25` (`inc/blog.php`) drives the Twig first paint, the shell's embedded `posts:{lang}` payload and the `/posts` REST default; every client (island, nuxt-js route, next-js route) also sends `per_page=25` so the grid stays full against a host whose default lags. The Vercel demo backend mirrors it and honours `per_page` up to 50.
- **Featured card on every state.** Search and category results keep the results header row (count + Clear filters) and then render the same featured card + `minmax(300px,1fr)` grid as browse — the layout `views/index.twig` already paints for `?s=` / `?category=`, so hydration stops swapping layouts. The compact 260px results grid is retired from the archive (`PostCard` `compact` stays for Read next).
- **Tests.** REST pagination math (30 → 25 + 5), contract fixture `perPage: 25`, next-js e2e asserts the featured card in a filtered state.

## Capabilities

### New Capabilities
- none.

### Modified Capabilities
- `blog-presentation`: featured card on every archive state; 25-post pages; filtered mode = header row + featured + grid.
- `island-data-fetch`: scenario wording (first page of 25).
- `content-performance`: scenario wording (page of 25 cards).

## Impact

- **Theme:** `inc/blog.php`, `inc/rest.php`, `inc/payloads.php`, `inc/shell.php`, `tests/test-rest.php`, `tests/test-shell.php`, `tests/fixtures/posts-envelope.json`, `src/lib/api.ts`, `src/components/site/blog/BlogArchive.vue`.
- **nuxt-js:** `app/lib/api.ts`, `app/components/site/blog/BlogArchive.vue` (byte mirror), `app/components/routes/RoutePostsIndex.vue`.
- **next-js:** `components/routes/RoutePostsIndex.tsx`, `lib/api.ts`, `test/e2e/archive.spec.ts`.
- **Demo backend:** `deploy/mock-api/api/index.mjs`.
- **REST contract:** `/posts` default `per_page` 24 → 25 (additive; explicit `per_page` unchanged). Deploy the theme before the frontends: a newer nuxt-js bundle paging by 25 against an older host's 24-post embedded first page would skip post 25 between pages 1 and 2.
- Overlaps none of the open changes and does not modify them (`single-source-shared-ui` will later move `BlogArchive.vue`; this edits both copies under today's drift rule).
