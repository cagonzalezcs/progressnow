## MODIFIED Requirements

### Requirement: Server-truth archive interactions
`BlogArchive` SHALL fetch search/filter/pagination results from `/progressnow/v1/posts` (debounced, abortable, loading and error states), render its first browse page from embedded props without a fetch, sync state to URL params, and report counts from the response envelope. Client-side re-filtering of embedded posts SHALL be removed.

#### Scenario: Search spans all posts
- **WHEN** a visitor searches a term that matches a post beyond the first page of 25
- **THEN** the result appears and the count reflects the full corpus

#### Scenario: Stale requests aborted
- **WHEN** a visitor types quickly
- **THEN** superseded requests are cancelled and only the final query renders

#### Scenario: URL state restores
- **WHEN** a filtered/paged URL is reloaded or shared
- **THEN** the island fetches and renders that exact state
