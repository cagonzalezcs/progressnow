# post-authoring

## ADDED Requirements

### Requirement: Block-editor authoring
Posts SHALL be authored in the block editor with an inserter restricted to the contract-complete set: `core/paragraph`, `core/heading`, `core/list`, `core/list-item`, `core/quote`, `core/image`, `core/pullquote`, `core/gallery`, plus `legacy/person-quote`, `legacy/video`, `legacy/audio`, `legacy/document`, `legacy/event-embed`, `legacy/action-callout`. Other post types' editors are unaffected.

#### Scenario: Restricted inserter
- **WHEN** an editor opens the inserter on a post
- **THEN** exactly the allowed blocks appear; pages/events are unchanged

#### Scenario: Custom block editing
- **WHEN** an editor inserts `legacy/action-callout` and fills heading/body/buttons
- **THEN** the block previews in the editor and persists in `post_content`

### Requirement: Sidebar settings retained
Dek, byline mode, committee, and meta-rail toggle SHALL remain ACF sidebar fields on posts.

#### Scenario: Post settings persist
- **WHEN** an editor sets byline mode to committee
- **THEN** the single-post island renders the committee byline as before
