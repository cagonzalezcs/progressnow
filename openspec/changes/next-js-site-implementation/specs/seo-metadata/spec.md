## MODIFIED Requirements

### Requirement: Canonical URLs
Every indexable page SHALL emit one `rel=canonical`; island filter params (`?s=`, `?category=`, `?paged=`) SHALL canonicalize to the clean posts-page URL while server-paged `/page/N/` archives keep their own canonical. Canonical, `hreflang`, and `og:url` values SHALL be emitted against a configurable canonical origin — `CHAPTER_CANONICAL_ORIGIN` (wp-config constant) or the `progressnow/seo/canonical_origin` filter, defaulting to the site URL's origin — applied by one function shared by the Twig head and the REST `seo` block, so every frontend agrees on the canonical.

#### Scenario: Filtered archive canonicalizes
- **WHEN** `/blog/?category=labor&s=strike` renders
- **THEN** the canonical URL is the plain posts-page permalink

#### Scenario: Canonical origin configured
- **WHEN** `CHAPTER_CANONICAL_ORIGIN` is `https://app.example` and a post renders on the PHP theme or is served by `/posts/{slug}`
- **THEN** the canonical, every `hreflang` `href`, and `og:url` use `https://app.example` with the WordPress path unchanged

#### Scenario: Default is a no-op
- **WHEN** the constant and filter are unset
- **THEN** canonical output is identical to today's

## ADDED Requirements

### Requirement: Core sitemap follows the canonical origin
WordPress core sitemap entries SHALL be rewritten to the canonical origin when it differs from the site URL, so the sitemap never lists non-canonical URLs.

#### Scenario: Sitemap on the app origin
- **WHEN** `CHAPTER_CANONICAL_ORIGIN` is set and `/wp-sitemap-posts-post-1.xml` is requested
- **THEN** every `<loc>` uses the canonical origin
