# chapter-content-model

## ADDED Requirements

### Requirement: Events post type
The theme SHALL register a public `chapter_event` post type with archive at `/events/`, block-editor support (`show_in_rest`), and supports for title, editor, excerpt, and thumbnail.

#### Scenario: Events appear in admin
- **WHEN** an admin views wp-admin
- **THEN** an "Events" menu (calendar icon) allows creating/editing events

#### Scenario: Events archive resolves
- **WHEN** a visitor requests `/events/` after rewrite flush
- **THEN** the archive template renders published events, not a 404

### Requirement: Working Groups post type
The theme SHALL register a public `working_group` post type with archive at `/working-groups/`, `page-attributes` support so `menu_order` controls display order, plus title/editor/excerpt/thumbnail support and `show_in_rest`.

#### Scenario: Working groups orderable
- **WHEN** an admin sets Order values on working groups
- **THEN** front-end listings sort by `menu_order` ascending

### Requirement: Event type taxonomy
The theme SHALL register a non-hierarchical `event_type` taxonomy on `chapter_event` (e.g., "General Meeting", "DSA 101", "Action") with `show_in_rest`.

#### Scenario: Assign event type
- **WHEN** an admin tags an event with an `event_type` term
- **THEN** the term is saved and available to templates for card labels

### Requirement: Event meta fields
The theme SHALL register `event_date` (datetime, stored `Y-m-d\TH:i`), `event_location` (text), and `event_link` (URL) meta on `chapter_event`, editable via a meta box with nonce verification and sanitization on save.

#### Scenario: Event meta persists
- **WHEN** an admin fills date/location/link in the Event Details meta box and updates the post
- **THEN** values persist and repopulate on reload

#### Scenario: Save is protected
- **WHEN** a save request lacks a valid nonce or edit capability
- **THEN** meta values are not modified

### Requirement: Working group meta fields
The theme SHALL register `contact_email` (email) and `meeting_schedule` (text) meta on `working_group`, editable via a meta box with nonce verification and sanitization on save.

#### Scenario: Group meta persists
- **WHEN** an admin fills contact email and meeting schedule and updates the post
- **THEN** values persist, with email sanitized via `sanitize_email`
