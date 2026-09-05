# Proposal: seo-meta-layer

## Why

The theme's only SEO primitive is `title-tag` support — no per-page meta descriptions (every page shares the site tagline), no canonical URLs, no Open Graph/Twitter cards (links shared to socials/Signal/WhatsApp render bare), no JSON-LD. For an organizing chapter whose growth channels are search and link-sharing, this is the largest remaining production gap (flagged in the 2026-07-02 architecture review; covered by no prior change). All the source data already exists in the domain serializers (dek, excerpts, featured images, event fields), so the layer is cheap to build now.

## What Changes

- New `inc/seo.php` domain file emitting into `wp_head`: per-page `<meta name="description">`, `rel=canonical`, and `noindex` for thin surfaces (search results, paged archives beyond page 1).
- Open Graph + Twitter card tags on every page — post dek/excerpt + featured image, event data on event permalinks, chapter defaults elsewhere; new Chapter Settings field for the default share image.
- JSON-LD structured data: `Organization` (site-wide), `Article` (posts, from the existing serializers), `Event` (event permalinks, from the ACF event fields — mirrors the ICS feed data).
- Hand-rolled in Twig/PHP, no SEO plugin: data lives in the domain serializers already, and the theme's philosophy is first-party integration (same call as REST). Core `wp_sitemaps` retained as-is.
- Editor control: per-post description falls back dek → excerpt; a per-page "search description" field on the interior group.

Out of scope: SSR of island content (crawl fallbacks shipped in rest-data-layer), analytics, XML sitemap customization, redirects.

## Capabilities

### New Capabilities
- `seo-metadata`: Per-page titles, meta descriptions, canonical URLs, and robots directives.
- `social-cards`: Open Graph/Twitter card tags with correct per-content images and copy.
- `structured-data`: JSON-LD for the organization, articles, and events.

### Modified Capabilities

None — this is additive head output; no existing spec's requirements change.

## Impact

- New: `inc/seo.php` (+ `require` in `functions.php`), `tests/test-seo.php`
- `inc/options.php` — default share image field on Chapter Settings; `inc/interior.php` — optional per-page description field
- Reuses: `rgvdsa_post_to_blog_post()`/`rgvdsa_post_to_single()` (dek/excerpt/featured image), `rgvdsa_event_to_chapter_event()` + event ACF fields, `rgvdsa_chapter_*` options
- `bin/seed.php` — seed the default share image reference
- Depends on: `backend-consolidation` (options/serializers), `rest-data-layer` (server-rendered single fallback makes Article JSON-LD honest)
