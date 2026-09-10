## Context

Three renderers share one archive: the theme's Twig first paint (`views/index.twig`) plus the `BlogArchive` island (theme `src/`, byte-copied to `nuxt-js/app/` under `shared-source-drift.test.ts`), the nuxt-js route (`RoutePostsIndex.vue`, page 1 embedded by the PHP shell or the prerender), and the next-js route (`RoutePostsIndex.tsx`, fully server-rendered). All three pick `posts.find(featured) ?? posts[0]` for the featured card and grid the rest.

## Goals / Non-Goals

**Goals:** a full last row on every archive page and state in all three renderers; one number, defined once on the server; hydration parity with the Twig first paint.

**Non-Goals:** card designs, pagination, the toolbar, the REST cap of 50; sharing the island source (that is `single-source-shared-ui`).

## Decisions

- **25 = 1 featured + 24 grid.** 24 divides by 3 (≥1200px) and by 2 (`md`). Rejected: 22 (1 + 21, fewer posts per page), dropping the featured card (design regression), padding the grid with a filler card (fake content).
- **Server constant + explicit client param.** `PROGRESSNOW_ARCHIVE_PER_PAGE` is also the REST default so untouched consumers get full pages; clients still send `per_page=25` because the frontends deploy independently of the WordPress host. Rejected: keeping the REST default at 24 (a number no first-party consumer would use); deriving the page size from the embedded first page's length (only matters in a skewed deploy window and cannot tell a full old page from a short last page).
- **Featured card on search and category, not search only.** Both share one code path in every renderer, and `index.twig` already renders featured + grid for both, so the island stops swapping layouts on hydration. Rejected: splitting by "has query" (category chips would look different from search results).
- **Filtered mode keeps its header row** (count + Clear filters, `role="status"`), then featured + grid inside the same section; the zero-match empty state has no featured card.

## Risks / Trade-offs

- [Deploy skew] nuxt-js bundle at 25 against a host at 24 → post 25 skipped between page 1 and 2 on the shell path → deploy the theme first; next-js fetches every page itself and is unaffected.
- [Cache keys] REST transient keys include `per_page`; the first requests after deploy miss once. No action.
- [Drift rule] `BlogArchive.vue` must stay byte-identical in theme and nuxt-js; `api.ts` differs by transport and is edited in both.
