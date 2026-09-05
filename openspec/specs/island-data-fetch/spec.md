# island-data-fetch Specification

## Purpose
TBD - created by syncing change rest-data-layer. Update Purpose after archive.
## Requirements
### Requirement: Server-truth archive interactions
`BlogArchive` SHALL fetch search/filter/pagination results from `/progressnow/v1/posts` (debounced, abortable, loading and error states), render its first browse page from embedded props without a fetch, sync state to URL params, and report counts from the response envelope. Client-side re-filtering of embedded posts SHALL be removed.

#### Scenario: Search spans all posts
- **WHEN** a visitor searches a term that matches a post beyond the first 24
- **THEN** the result appears and the count reflects the full corpus

#### Scenario: Stale requests aborted
- **WHEN** a visitor types quickly
- **THEN** superseded requests are cancelled and only the final query renders

#### Scenario: URL state restores
- **WHEN** a filtered/paged URL is reloaded or shared
- **THEN** the island fetches and renders that exact state

### Requirement: Windowed calendar fetch
`EventCalendar` SHALL fetch its event window from `/progressnow/v1/events` on mount with a skeleton state, instead of receiving the full window embedded.

#### Scenario: Calendar loads
- **WHEN** the calendar page opens
- **THEN** a skeleton shows until events render; failures show an error state with the ICS subscribe link

### Requirement: Crawlable fallbacks
The posts page SHALL include a `noscript` list of current-page post links, and single posts SHALL server-render title, dek, and sanitized prose inside the island mount element (replaced on hydration).

#### Scenario: No-JS post readable
- **WHEN** a single post loads without JavaScript
- **THEN** the article text is readable and present in view-source
