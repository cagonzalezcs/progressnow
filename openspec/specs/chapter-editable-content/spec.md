# chapter-editable-content Specification

## Purpose
TBD - created by archiving change backend-consolidation. Update Purpose after archive.
## Requirements
### Requirement: Editor-owned site copy
Counties strip, posts-page lede, code-of-conduct/grievance section, footer contact email, and front-page hero copy SHALL be editable in wp-admin (Chapter Settings or page fields), with no hardcoded placeholder values (`hello@example.org`, lorem ipsum) in templates or components.

#### Scenario: Counties editable
- **WHEN** an admin edits the counties repeater in Chapter Settings
- **THEN** the home counties strip reflects the list without a deploy

#### Scenario: No placeholder leakage
- **WHEN** any page renders on a seeded site
- **THEN** no `example.org` addresses or lorem copy appear outside `/styleguide`

### Requirement: Newsletter CTA wired
`EmailSubscribeStrip` SHALL use the `newsletter_url` chapter option as its destination instead of a stubbed form action.

#### Scenario: Subscribe follows option
- **WHEN** a visitor submits the subscribe strip
- **THEN** they land on the configured Action Network form

### Requirement: Template-based calendar wiring
Calendar event injection SHALL key off an assigned page template, not the page slug.

#### Scenario: Slug rename safe
- **WHEN** the Calendar page slug changes
- **THEN** the calendar island still receives events
