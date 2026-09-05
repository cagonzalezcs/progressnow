# social-cards Specification

## Purpose
TBD - created by archiving change seo-meta-layer. Update Purpose after archive.
## Requirements
### Requirement: Open Graph and Twitter tags
Every page SHALL emit `og:site_name`, `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, and a `twitter:card` tag; posts use `og:type=article`, other surfaces `website`.

#### Scenario: Shared post renders a rich card
- **WHEN** a post permalink is shared to a social platform or messenger
- **THEN** the scraped tags carry the post title, dek/excerpt, and its featured image

### Requirement: Share image ladder
`og:image` SHALL resolve featured image → surface-specific image → the Chapter Settings default share image → the theme logo, with `og:image:width/height/alt` when attachment metadata exists.

#### Scenario: Imageless post still cards
- **WHEN** a post without a featured image is shared
- **THEN** the chapter default share image is used and the card is `summary` (not `summary_large_image`)

