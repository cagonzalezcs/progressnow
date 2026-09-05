# block-serialization Specification

## Purpose
TBD - created by syncing change gutenberg-post-blocks. Update Purpose after archive.
## Requirements
### Requirement: Blocks serialize to island contracts
`progressnow_blog_blocks_from_content()` SHALL map top-level `post_content` blocks to the existing `PostBlock` union: consecutive prose-class core blocks coalesce into one sanitized `prose` entry; `core/image` maps to `image` with `breakout` from wide/full alignment and credit from the attachment; `core/pullquote` → `pull_quote`; `core/gallery` → `gallery` with layout from block style; each `progressnow/*` block → its contract member.

#### Scenario: Prose coalescing
- **WHEN** a post contains paragraph, heading, list, paragraph in sequence
- **THEN** the serialized payload contains one `prose` block whose HTML passed the kses allowlist

#### Scenario: Contract parity
- **WHEN** a post uses every allowed block type
- **THEN** the serialized `PostBlock[]` validates against the TS contract with no renderer changes

### Requirement: Single serialization path
`progressnow_blog_map_blocks()` SHALL serialize all posts from `post_content`: block posts map through the contract block map, and classic/non-block content serializes as a single sanitized `prose` entry via the freeform-prose branch. No legacy ACF serialization path SHALL remain.

#### Scenario: Mixed corpus renders
- **WHEN** block-authored and classic-content posts coexist
- **THEN** both render correctly through the same island

### Requirement: Nullable event embed
`event_embed` SHALL serialize `event: null` when the referenced event is unpublished or deleted, and the island SHALL render a fallback card instead of dropping the block.

#### Scenario: Unpublished event
- **WHEN** an embedded event is moved to draft
- **THEN** the post shows a "no longer scheduled" card linking to the calendar
