# seo-metadata Specification

## Purpose
TBD - created by archiving change seo-meta-layer. Update Purpose after archive.
## Requirements
### Requirement: Per-page meta description
Every front-end page SHALL emit one `<meta name="description">` resolved per surface: post dek → excerpt; page `seo_description` → lede → site tagline; event content; front-page hero lede — plain-text sanitized and trimmed to ~155 characters on a word boundary.

#### Scenario: Post description from dek
- **WHEN** a post with a dek renders
- **THEN** the head contains a description equal to the sanitized dek

#### Scenario: Fallback ladder
- **WHEN** a page has no SEO fields set
- **THEN** the description falls back to the lede, then the site tagline — never empty, never lorem

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

### Requirement: Core sitemap follows the canonical origin
WordPress core sitemap entries SHALL be rewritten to the canonical origin when it differs from the site URL, so the sitemap never lists non-canonical URLs.

#### Scenario: Sitemap on the app origin
- **WHEN** `CHAPTER_CANONICAL_ORIGIN` is set and `/wp-sitemap-posts-post-1.xml` is requested
- **THEN** every `<loc>` uses the canonical origin

### Requirement: Robots directives
Search results, filtered archive states, date/author archives, and 404s SHALL emit `noindex,follow`; primary surfaces SHALL emit none.

#### Scenario: Search results excluded
- **WHEN** a `?s=` search results page renders
- **THEN** the head contains `noindex,follow`

