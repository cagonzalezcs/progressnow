## MODIFIED Requirements

### Requirement: Designed empty states
Each list island SHALL render an intentional empty state — archive "No posts yet"; calendar "No events scheduled" with subscribe link; and, under 700px in month view, a day-level "Nothing scheduled on this day. Days with a ● have events." note that offers "Jump to next event · <Mon d>" whenever the month has an event in the active filter and always offers "See the whole month as a list →" — rather than an empty region or fixtures.

#### Scenario: Archive empty state
- **WHEN** the posts page renders with no published posts
- **THEN** the "No posts yet" state renders in place of the grid

#### Scenario: Empty day in a month with events
- **WHEN** the selected day under 700px has no events but a later day of the month does
- **THEN** the day-level note renders with a jump button that selects that later day

#### Scenario: Empty day in an empty month
- **WHEN** the selected day and the whole month have no events in the active filter
- **THEN** the day-level note renders without a jump button, the list link remains, and list view shows the month-level empty state
