# rest-api Specification

## Purpose
TBD - created by syncing change rest-data-layer. Update Purpose after archive.
## Requirements
### Requirement: Public read endpoints
The theme SHALL expose `GET /progressnow/v1/posts` (paginated envelope with server-side search and category filter), `/posts/{slug}`, `/events` (date-windowed), and `/categories`, serving only published content, shaped exactly as the island contracts, reusing the domain serializers.

#### Scenario: Paginated search
- **WHEN** a client requests `/posts?s=valley&category=labor&page=2`
- **THEN** the response contains matching published posts for that page plus accurate `total`/`totalPages`

#### Scenario: Invalid category rejected
- **WHEN** `category` is not a canonical slug
- **THEN** core returns 400 `rest_invalid_param`

#### Scenario: Unknown slug
- **WHEN** `/posts/{slug}` matches no published post
- **THEN** the response is 404 `progressnow_post_not_found` in standard WP error shape

### Requirement: Cacheable responses
Anonymous responses SHALL carry `Cache-Control: public, max-age=300, stale-while-revalidate=3600` and an ETag honoring `If-None-Match` with 304; logged-in requests SHALL be `no-store`. Payloads SHALL be transient-cached with content-version invalidation.

#### Scenario: Conditional revalidation
- **WHEN** a client repeats a request with the prior ETag
- **THEN** the server answers 304 with no body

#### Scenario: Editors see fresh data
- **WHEN** a logged-in editor saves a post and reloads
- **THEN** the change appears immediately
