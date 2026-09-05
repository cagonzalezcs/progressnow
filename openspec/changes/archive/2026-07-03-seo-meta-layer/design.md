# Design: seo-meta-layer

## Context

The theme (Timber 2 + Vue islands) owns `<head>` via `views/html-header.twig` + `wp_head()`. `title-tag` is the only SEO output today. All copy/image sources already exist: post dek (`legacy_blog_field`), excerpts, featured images, event ACF fields (`start_datetime`, `venue`, `city`, `rsvp_url`), Chapter Settings options. rest-data-layer added server-rendered article fallbacks, so crawlers see real content on posts. Single dev, chapter-scale traffic.

## Goals / Non-Goals

**Goals:** correct per-page description/canonical/robots; rich link previews everywhere; JSON-LD for organization/articles/events; editor control with sane fallbacks; zero new plugins.

**Non-Goals:** SSR of islands, sitemap customization (core `wp_sitemaps` stands), redirects/404 tooling, analytics, multilingual heads (gtranslate rewrites at proxy level), breadcrumb JSON-LD (visual crumbs only).

## Decisions

### D1: Hand-rolled `inc/seo.php`, not Yoast/RankMath
One domain file hooked to `wp_head` (priority 5), same one-file-per-domain pattern as the rest of `inc/`. Rationale: every data source is already serialized first-party; a plugin adds admin surface, upsell noise, and a second place where titles/descriptions are defined. Alternative considered: Yoast — rejected for chapter scale (its value is content-team workflows we don't have).

### D2: Description resolution ladder
`legacy_seo_description()` per surface: post → dek, else excerpt; page → interior `seo_description` field, else `lede`, else site tagline; posts page → its lede; event → trimmed `post_content`; front page → hero lede, else tagline. All through `legacy_blog_kses_plain()`, trimmed ~155 chars on a word boundary.

### D3: Canonical + robots
`rel=canonical` from `get_permalink()` / `get_pagenum_link()` (paged archives keep their own canonical, not page 1). `noindex,follow` on: search results, `?category=`/`?s=`-filtered archive states, 404, date/author archives. Island filter params (`?s=`, `?category=`, `?paged=`) canonicalize to the clean posts-page URL — the server-paged `/page/N/` path stays the indexable one.

### D4: Social cards
`og:site_name/type/title/description/url/image` + `twitter:card` (`summary_large_image` when an image exists, else `summary`). Image ladder: featured image (`large`) → per-surface (event thumbnail) → Chapter Settings `default_share_image` (new ACF image field) → theme `logo-lg.png` fallback. Emit `og:image:width/height/alt` when the attachment metadata has them.

### D5: JSON-LD
One `<script type="application/ld+json">` per page via `wp_json_encode`:
- Site-wide `Organization` (name, url, logo, `sameAs` Instagram from options).
- Posts: `Article` (headline, description, datePublished/Modified, author Person/Organization by byline mode, image).
- Event permalinks: `Event` (name, startDate/endDate in `America/Chicago` ISO-8601, location Place from venue/city, offers → `rsvp_url`) — mirrors the ICS feed fields exactly.
Rationale: `Event` markup is the highest-leverage schema for an organizing chapter (event rich results); data is already normalized by `legacy_event_to_chapter_event()`.

### D6: Testing
WorDBless suite `tests/test-seo.php`: capture `wp_head` output buffer per conditional context (post/page/search/front) via the existing seam patterns; assert description ladder, canonical, noindex set, OG completeness, JSON-LD validity (`json_decode` + `@type`). No live-crawl tooling.

## Risks / Trade-offs

- [Hand-rolled = we own correctness] → the test suite pins output; surface is small and stable.
- [Conditional-tag reliance (`is_search()` etc.) makes output order-sensitive] → hook once at `wp_head` 5, read only from the main query.
- [No per-post social-image override] → featured image covers it; add a field later if editors ask (additive).
- [gtranslate proxies may duplicate og:url on translated paths] → acceptable; canonical points at the EN origin.

## Migration Plan

Additive head output only — ship, verify with social debuggers (Meta Sharing Debugger, Google Rich Results test) against the seeded site, no rollback concerns beyond reverting the require.

## Open Questions

1. Default share image: commission art or crop `logo-lg.png`? (fallback chain works either way)
2. `noindex` event permalinks too (calendar is the canonical surface) or let them index? (recommend index — Event JSON-LD lives there)
