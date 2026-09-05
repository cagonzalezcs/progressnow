## MODIFIED Requirements

### Requirement: Public read endpoints
The theme SHALL expose `GET /progressnow/v1/posts` (paginated envelope with server-side search and category filter), `/posts/{slug}`, `/events` (date-windowed), and `/categories`, serving only published content, shaped exactly as the island contracts, reusing the domain serializers. Every endpoint whose payload contains language-dependent text SHALL accept the optional `lang` argument, resolve it with the shared normalizer, and cache its response per language.

#### Scenario: Paginated search
- **WHEN** a client requests `/posts?s=valley&category=labor&page=2`
- **THEN** the response contains matching published posts for that page plus accurate `total`/`totalPages`

#### Scenario: Invalid category rejected
- **WHEN** `category` is not a canonical slug
- **THEN** core returns 400 `rest_invalid_param`

#### Scenario: Unknown slug
- **WHEN** `/posts/{slug}` matches no published post
- **THEN** the response is 404 `progressnow_post_not_found` in standard WP error shape

#### Scenario: Categories in the requested language
- **WHEN** a client requests `/categories?lang=es` on a site whose Spanish category terms are named differently from the English ones
- **THEN** each category row carries the Spanish term name, the canonical `id` slug, and the shared color, and the response is cached under a Spanish-specific key

#### Scenario: Categories default language
- **WHEN** a client requests `/categories` without `lang`
- **THEN** the response uses the default language's term names and is cached under the default-language key
