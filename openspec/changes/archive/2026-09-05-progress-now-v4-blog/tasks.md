## 1. Setup

- [x] 1.1 Re-pull the canvas and diff the three Blog artboards against the local copy; fold in changes

## 2. Shared components

- [x] 2.1 `PageHeader.vue` + `views/partials/page-header.twig`: v4 blue band, breadcrumb pill slot, shadowed Bowlby `h1`, lede, extras slot (D1); `ui/breadcrumb` pill styling
- [x] 2.2 New `CtaCard.vue`, `LinkListCard.vue` (links + rows variants), `DashedNote.vue` in shared site components + Twig partials

## 3. Blog archive

- [x] 3.1 `BlogArchive.vue`: chip + search toolbar, featured card, `auto-fill` grid, round pagination, filtered-results header with clear button, dashed empty state; scroll offset for the sticky header
- [x] 3.2 `PostCard`, `FeaturedPostCard`, `PostResultRow`, `CategoryTag`, `ImageSlot` on v4 tokens + `DuotoneImage`; mobile 96px rows
- [x] 3.3 `EmailSubscribeStrip.vue` → ink strip with title/lede props, omitted without newsletter URL
- [x] 3.4 `index.twig` / `archive.twig` / `search.twig` crawlable shell markup + `RoutePostsIndex.vue`

## 4. Single post

- [x] 4.1 `SinglePost.vue`: hero via `PageHeader` (breadcrumb, category pill, byline avatar), pulled-up featured image, prose/blockquote/figure tokens, share row
- [x] 4.2 Sidebar: `LinkListCard` "On this page" from `h2` ids, `CtaCard` Get involved; meta-rail toggle respected; stacks below `lg`
- [x] 4.3 Read-next `alt` band with `readNext` cards; restyle `blog/blocks/*` (gallery, video, audio, document, person quote, action callout, event embed)
- [x] 4.4 `single.twig` + `RoutePost.vue`

## 5. Verification

- [x] 5.1 Copy shared source to `site/app`; theme + `site` lint/typecheck/test; `generate:mock` + `verify:output`
- [x] 5.2 Screenshots (both renderers, EN + ES) at 1440 / 1024 / 768 / 390 against the Blog, Blog Mobile and Blog Post artboards; no horizontal overflow at 320
