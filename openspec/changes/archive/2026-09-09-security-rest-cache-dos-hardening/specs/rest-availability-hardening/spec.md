## ADDED Requirements

### Requirement: REST pagination is bounded

The `/posts` endpoint SHALL enforce an upper bound on `page` in addition to the existing lower bound.

#### Scenario: Oversized page rejected

- **WHEN** a request sets `page` above the configured maximum
- **THEN** the API returns a 400 (invalid param) rather than executing a huge-offset query

### Requirement: High-cardinality and negative requests are not persist-cached

Free-text search requests and unknown-slug (404) single-post lookups SHALL NOT create persistent transient cache entries; they SHALL still carry HTTP cache headers.

#### Scenario: Search flood does not bloat the options table

- **WHEN** many distinct `?s=` values are requested
- **THEN** no per-query transient rows accumulate for those searches

#### Scenario: Unknown slug is not negatively cached

- **WHEN** a single-post request targets a slug that does not resolve
- **THEN** the 404 result is not stored as a transient

### Requirement: Event date window is clamped

The `/events` endpoint SHALL clamp `after`/`before` to a bounded range and require `after <= before`.

#### Scenario: Out-of-range window is clamped

- **WHEN** a request supplies an `after`/`before` spanning centuries or with `after > before`
- **THEN** the effective query window is clamped to the configured bounds

### Requirement: ICS feed is cached

The events ICS feed SHALL serve a cached body invalidated on content change and SHALL send cache headers.

#### Scenario: Repeated feed hits reuse cache

- **WHEN** the ICS feed is requested repeatedly with no intervening content edit
- **THEN** the all-events query executes at most once per cache lifetime, not per request

### Requirement: Cache invalidation covers terms and ignores noise

Content-version invalidation SHALL bump on term create/delete and SHALL NOT bump for revisions, auto-drafts, or nav-menu items.

#### Scenario: New category invalidates cache

- **WHEN** a category term is created or deleted
- **THEN** the content version bumps so category-dependent payloads refresh

#### Scenario: Revision save does not churn the version

- **WHEN** a post revision or nav-menu item is saved or deleted
- **THEN** the content version does not bump
