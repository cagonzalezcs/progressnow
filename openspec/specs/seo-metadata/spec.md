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
Every indexable page SHALL emit one `rel=canonical`; island filter params (`?s=`, `?category=`, `?paged=`) SHALL canonicalize to the clean posts-page URL while server-paged `/page/N/` archives keep their own canonical.

#### Scenario: Filtered archive canonicalizes
- **WHEN** `/blog/?category=labor&s=strike` renders
- **THEN** the canonical URL is the plain posts-page permalink

### Requirement: Robots directives
Search results, filtered archive states, date/author archives, and 404s SHALL emit `noindex,follow`; primary surfaces SHALL emit none.

#### Scenario: Search results excluded
- **WHEN** a `?s=` search results page renders
- **THEN** the head contains `noindex,follow`

