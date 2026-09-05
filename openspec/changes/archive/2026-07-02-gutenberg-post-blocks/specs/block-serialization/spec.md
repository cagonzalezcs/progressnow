# block-serialization

## ADDED Requirements

### Requirement: Blocks serialize to island contracts
`legacy_blog_blocks_from_content()` SHALL map top-level `post_content` blocks to the existing `PostBlock` union: consecutive prose-class core blocks coalesce into one sanitized `prose` entry; `core/image` maps to `image` with `breakout` from wide/full alignment and credit from the attachment; `core/pullquote` → `pull_quote`; `core/gallery` → `gallery` with layout from block style; each `legacy/*` block → its contract member.

#### Scenario: Prose coalescing
- **WHEN** a post contains paragraph, heading, list, paragraph in sequence
- **THEN** the serialized payload contains one `prose` block whose HTML passed the kses allowlist

#### Scenario: Contract parity
- **WHEN** a post uses every allowed block type
- **THEN** the serialized `PostBlock[]` validates against the TS contract with no renderer changes

### Requirement: Transitional dispatch
`legacy_blog_map_blocks()` SHALL serialize from `post_content` when `has_blocks()` and from legacy ACF rows otherwise, until the legacy path is removed post-migration.

#### Scenario: Mixed corpus renders
- **WHEN** migrated and unmigrated posts coexist
- **THEN** both render correctly through the same island

### Requirement: Nullable event embed
`event_embed` SHALL serialize `event: null` when the referenced event is unpublished or deleted, and the island SHALL render a fallback card instead of dropping the block.

#### Scenario: Unpublished event
- **WHEN** an embedded event is moved to draft
- **THEN** the post shows a "no longer scheduled" card linking to the calendar
