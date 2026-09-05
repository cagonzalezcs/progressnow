## MODIFIED Requirements

### Requirement: Version-invalidated transients
`progressnow_cache_remember()` SHALL cache expensive payloads keyed to a content version option that is bumped by every editor write affecting a public payload: saves and deletions of the public post types (`post`, `event`, `page`), creation, edit, and deletion of `category` and `event_category` terms, nav-menu content and location changes, Chapter Settings (ACF options) saves, attachment metadata edits, and Polylang string-translation saves. A single request SHALL bump the version at most once and SHALL fire `progressnow/content_version_bumped` at most once.

#### Scenario: Fresh after edit
- **WHEN** an editor updates an event
- **THEN** the next calendar payload reflects the change (version bump invalidates prior transient)

#### Scenario: Page edit invalidates page and site payloads
- **WHEN** an editor saves the About page (content, ACF section fields, or visibility toggles)
- **THEN** the content version bumps and the next `GET /pages/about` and PHP shell payload reflect the change

#### Scenario: Menu edit invalidates the site payload
- **WHEN** an editor saves a nav menu or reassigns a menu location
- **THEN** the content version bumps and the next `GET /site` reflects the new navigation

#### Scenario: Term lifecycle invalidates category payloads
- **WHEN** a `category` or `event_category` term is created, renamed, or deleted
- **THEN** the content version bumps and the next `GET /categories`, `/site`, and archive payloads reflect it

#### Scenario: Attachment and string edits invalidate
- **WHEN** an attachment's alt text is edited, or a Polylang string translation is saved
- **THEN** the content version bumps

#### Scenario: One bump per request
- **WHEN** a single save request fires several bump hooks (for example `save_post` and `acf/save_post`)
- **THEN** the version increments by exactly one and `progressnow/content_version_bumped` fires once

## ADDED Requirements

### Requirement: Invalidation ignores noise
Content-version invalidation SHALL NOT bump for post revisions, autosaves, auto-drafts, nav-menu-item posts, or any post type outside the public allow-list.

#### Scenario: Revision save does not churn the version
- **WHEN** a post revision, autosave, or auto-draft is saved or deleted
- **THEN** the content version does not change

#### Scenario: Non-public post type ignored
- **WHEN** a post of a type outside `post`, `event`, `page` (for example `nav_menu_item` or `acf-field-group`) is saved or deleted
- **THEN** the content version does not change

### Requirement: Every bump schedules a rebuild
Each content-version bump SHALL fire `progressnow/content_version_bumped` exactly once so the static rebuild dispatcher can coalesce it.

#### Scenario: Page edit schedules a rebuild
- **WHEN** an editor saves a page and the rebuild transport is configured
- **THEN** the rebuild state becomes `requested` for the new content version within the same request
