# island-empty-states Specification

## Purpose
TBD - created by syncing change rest-data-layer. Update Purpose after archive.
## Requirements
### Requirement: No production fixtures
Sample/lorem datasets SHALL NOT be reachable from production islands: fixtures live in `src/lib/fixtures/` imported only by the styleguide, islands have no fixture prop defaults, and PHP contexts always set their keys (possibly null/empty).

#### Scenario: Empty site is honest
- **WHEN** the site renders with zero published posts and events
- **THEN** every surface shows a designed empty state and no lorem content appears outside `/styleguide`

### Requirement: Designed empty states
Each list island SHALL render an intentional empty state (archive "No posts yet", calendar "No events scheduled" with subscribe link) rather than an empty region or fixtures.

#### Scenario: Archive empty state
- **WHEN** the posts page renders with no published posts
- **THEN** the "No posts yet" state renders in place of the grid

### Requirement: Styleguide retains fixtures
The styleguide page SHALL continue rendering all components from fixtures as the visual-regression surface.

#### Scenario: Styleguide unaffected
- **WHEN** `/styleguide` renders on an empty database
- **THEN** every component displays with fixture data
