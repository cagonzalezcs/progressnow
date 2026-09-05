# content-performance

## ADDED Requirements

### Requirement: Sanitized prose output
Prose HTML SHALL pass through a `wp_kses` allowlist (`rgvdsa_blog_kses_prose()`) at serialize time before reaching any island `v-html` sink; attribute-bearing text fields SHALL be stripped or `br`-only.

#### Scenario: Script injection stripped
- **WHEN** post prose contains `<script>` or `onclick` attributes
- **THEN** the serialized `prose.html` contains neither, while allowlisted tags survive

### Requirement: Precomputed read time
Read minutes SHALL be computed once on `save_post_post` into `_rgvdsa_read_minutes`; list serialization SHALL NOT load the flexible-content field per card.

#### Scenario: Cheap card serialization
- **WHEN** the blog archive serializes 24 cards
- **THEN** read time comes from primed post-meta cache with no per-card `post_blocks` reads

### Requirement: Primed list queries
The shared query builder `rgvdsa_blog_posts_query()` SHALL prime author and thumbnail caches for its result set.

#### Scenario: No N+1 author lookups
- **WHEN** archive/read-next/teaser lists render
- **THEN** author display names and thumbnails resolve from cache, not per-post queries

### Requirement: Version-invalidated transients
`rgvdsa_cache_remember()` SHALL cache expensive payloads keyed to a content version option bumped on post/event/term/options saves.

#### Scenario: Fresh after edit
- **WHEN** an editor updates an event
- **THEN** the next calendar payload reflects the change (version bump invalidates prior transient)
