## Why

The blog archive and single post are the highest-traffic interior surfaces and have three v4 artboards (Blog — Desktop 1440, Blog — Mobile 390, Blog Post — Desktop 1440). With the v4 foundation and chrome in place, this change brings both pages to the canvas in both renderers without touching the archive's server-truth search/filter/pagination behavior. Change 3 of 5.

## What Changes

- **Blog archive:** v4 page header with breadcrumb pill; category-chip + search toolbar; featured card (browse mode); `auto-fill` card grid; round pagination; filtered-results mode with 3px brand rule and "Clear filters"; dashed no-match state; ink "Never miss a post" subscribe strip. Mobile: stacked toolbar, 96px row cards.
- **Single post:** blue hero (breadcrumb, category pill, Bowlby title, initials-avatar byline); article column with the featured image pulled up over the hero, v4 prose/blockquote/figure styles, share row; sticky sidebar (On this page + Get involved card, honoring the meta-rail toggle); "Read next" cards on the `alt` band. Post blocks restyled on v4 tokens.
- **Shared:** `PageHeader` gains the breadcrumb slot; `CtaCard` and `LinkListCard` sidebar components introduced (reused by events and interior changes).

## Capabilities

### New Capabilities
- `blog-presentation`: presentation contract for the archive (header, toolbar, featured, grid + pagination, filtered mode, subscribe strip) and the post (hero, article, sidebar, read next).

### Modified Capabilities
- none (behavioral specs `island-data-fetch`, `island-empty-states`, `post-authoring` unchanged).

## Impact

- Shared source: `components/site/PageHeader.vue`, new `CtaCard.vue`, `LinkListCard.vue`, `blog/{BlogArchive,PostCard,FeaturedPostCard,PostResultRow,CategoryTag,ImageSlot,EmailSubscribeStrip,SinglePost}.vue`, `blog/blocks/*`.
- Theme: `views/{index,archive,search,single}.twig`, `views/partials/page-header.twig`, `src/css/tailwind.css` (`.prose-post` tokens).
- Nuxt: `routes/{RoutePostsIndex,RoutePost}.vue`.
- Depends on `progress-now-v4-foundation-chrome`.
