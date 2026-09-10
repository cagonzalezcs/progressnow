## MODIFIED Requirements

### Requirement: Precomputed read time
Read minutes SHALL be computed once on `save_post_post` into `_progressnow_read_minutes`; list serialization SHALL NOT load the flexible-content field per card.

#### Scenario: Cheap card serialization
- **WHEN** the blog archive serializes a page of 25 cards
- **THEN** read time comes from primed post-meta cache with no per-card `post_blocks` reads
