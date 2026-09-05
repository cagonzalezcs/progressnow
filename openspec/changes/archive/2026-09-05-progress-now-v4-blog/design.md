## Context

Builds on `progress-now-v4-foundation-chrome`. Sources: `Progress Now Blog v4.dc.html`, `Progress Now Blog v4 Mobile.dc.html`, `Progress Now Blog Post v4.dc.html`. `BlogArchive.vue` already implements URL state, debounced search, category filter, pagination and a browse/filter split against `/wp-json/progressnow/v1` (`island-data-fetch`); `SinglePost.vue` renders the block list and `readNext` from the post envelope. Only presentation changes.

## Goals / Non-Goals

**Goals:** archive and post match the three artboards in both renderers; every existing interaction (search, chips, pagination, URL state, crawlable fallbacks, meta-rail toggle) unchanged; mobile fully responsive.
**Non-Goals:** new post data, comments, author pages beyond token inheritance.

## Decisions

### D1 — `PageHeader` owns the blue band and breadcrumb
`PageHeader.vue` + `partials/page-header.twig`: `#1848D8` band, optional breadcrumb pill (`ui/breadcrumb` styled as a white radius-999 pill; hidden below `md`), Bowlby uppercase `h1` with the deep-blue shadow, 600 lede `max-width:56ch`; default slot for extras (post: category pill + byline; later: date tile, action pills). One component serves blog, calendar, interior, event.

### D2 — Three sidebar primitives
`CtaCard.vue` (brand card: Bowlby title, lede, white pill), `LinkListCard.vue` (white card: uppercase 800 heading, accent links; `rows` variant for label/value pairs), `DashedNote.vue` (dashed border box). Post uses `LinkListCard` ("On this page", built from the article's `h2`s at render time — blocks already carry heading ids) and `CtaCard`.

### D3 — Archive re-skin only
Toolbar: chip group (`aria-pressed`, `[data-chip]` hover) + search input; browse mode = featured card (first item of the page) + `repeat(auto-fill,minmax(300px,1fr))` grid + 44px round pagination; filter mode = rule header + `minmax(260px,1fr)` grid + results pagination + dashed empty state. Existing debounce/URL/scroll logic untouched; scroll target becomes the featured/results section top (−80px for the sticky header). Mobile (<`md`): search above chips, featured radius 18, `96px 1fr` rows.

### D4 — Post hero overlap
Hero band `padding-bottom:150px`; article column's first child is the duotone featured image with `margin-top:-110px`, radius 24, shadow. Without a featured image the band bottom padding drops to 48px (no negative margin). Prose tokens: lede 600 1.22rem ink, body 1.12rem/1.7 `--color-text-body`, `h2` Bowlby `clamp(1.4rem,2.4vw,1.9rem)`, blockquote `alt` radius-20 with 6px brand rule and Bowlby quote, figures duotone .25 with muted captions, share row with outline accent pills above a `--color-line` rule.

### D5 — Subscribe strip is data-gated
`EmailSubscribeStrip.vue` renders the ink strip only when `chapter.newsletter_url` is set (title/lede props so calendar/interior reuse it with their own copy).

## Risks / Trade-offs

- [Featured card steals the first grid slot on page > 1] → keep current behavior (featured = first item of the current page, as the artboard's logic does).
- [Pulled-up image on very tall portrait images] → `aspect-ratio: 16/9; object-fit: cover` on the pulled image.
- [Chip row overflow on mobile with many categories] → `flex-wrap`; verified at 320px.

## Migration Plan

Components first (shared), then Twig shell views, then Nuxt routes; copy to `site/app`; screenshots. Rollback = revert.

## Open Questions

- none.
