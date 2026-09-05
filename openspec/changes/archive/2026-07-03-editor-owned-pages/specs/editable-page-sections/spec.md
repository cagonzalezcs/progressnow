# editable-page-sections

Section-level editor control on the templated interior pages (About, Get Involved): rich prose, per-section visibility wired to on-page navigation, and editable headings/labels/links — all with design-copy fallbacks so an unseeded page renders the full prototype.

## ADDED Requirements

### Requirement: Rich prose fields
Prose bodies on About (chapter paragraphs, history intro, counties intro, committees intro, governance intro, dues body) and Get Involved (step bodies, committees intro, sidebar-card body) SHALL accept basic rich text (links, bold/italic, lists) edited via WYSIWYG with media upload disabled. All rich values SHALL pass `wp_kses_post` at context-build time before unescaped Twig output. FAQ answers SHALL remain plain text.

#### Scenario: Editor adds a link
- **WHEN** an editor saves a history intro containing `<a href="...">` and `<strong>` markup
- **THEN** the About page renders the link and emphasis intact

#### Scenario: Disallowed markup stripped
- **WHEN** a rich field is saved containing `<script>` or event-handler attributes
- **THEN** the rendered context contains no script tags or event handlers

#### Scenario: Legacy plain-text value survives type swap
- **WHEN** a page saved before the WYSIWYG swap renders
- **THEN** its existing plain-text field values render unchanged

### Requirement: Section visibility toggles
Each major section SHALL have a show/hide toggle — About: mission band, chapter, history, counties, committees, governance, FAQ, dues callout; Get Involved: join steps, committees, channels, FAQ. Toggles SHALL default to visible, including for pages saved before the field existed (unset meta reads as visible). A hidden section SHALL NOT render in the page body.

#### Scenario: Section hidden
- **WHEN** an editor turns off the History toggle on the About page
- **THEN** the Mission & History section does not render

#### Scenario: Pre-existing page unaffected
- **WHEN** a page saved before the toggles existed renders
- **THEN** every section renders (unset toggle means visible)

### Requirement: Navigation follows visibility and headings
Each page's on-this-page navigation (mobile chip row and sticky sidebar) SHALL be built from a single PHP-computed list of visible sections, with labels sourced from the editable section headings. Hidden sections SHALL NOT appear in either nav copy. When no sections are visible, the nav SHALL render nothing.

#### Scenario: Hidden section leaves nav
- **WHEN** the Counties section is toggled off
- **THEN** neither nav copy contains a Counties link

#### Scenario: Renamed heading updates nav
- **WHEN** an editor changes the Get Involved FAQ heading to "Questions?"
- **THEN** both nav copies label that link "Questions?"

### Requirement: Get Involved heading parity
Get Involved section headings (join, committees, channels, FAQ) SHALL be editable text fields, defaulting to the current design copy — matching the heading editability About already has.

#### Scenario: Unseeded page uses design copy
- **WHEN** Get Involved renders with no heading fields saved
- **THEN** the headings read "How to join", "Committees", "Communication channels", "Common questions"

### Requirement: Editable cross-links
The Get Involved sidebar "Related" links SHALL be an editable repeater (label + URL, external URLs opening in a new tab) defaulting to the current three links. The About "Join a committee" cross-link label and URL SHALL be editable fields with the current values as defaults.

#### Scenario: Related links replaced
- **WHEN** an editor saves two custom Related rows
- **THEN** the sidebar lists exactly those two links, with external ones carrying `target="_blank"` and `rel="noopener"`

#### Scenario: Empty repeater falls back
- **WHEN** no Related rows are saved
- **THEN** the sidebar shows the three design-copy links

### Requirement: Page context test coverage
The About / Get Involved context builders SHALL have PHPUnit coverage for: design-copy fallbacks when ACF is absent or fields are empty, kses filtering of rich fields, external-URL detection (relative, anchor, mailto, cross-host), invalid-row dropping in repeaters, visibility tri-state defaults, and nav lists reflecting hidden sections.

#### Scenario: Suite exercises fallbacks
- **WHEN** `composer test` runs against a post with no ACF values
- **THEN** context assertions verify the full design-copy defaults for both pages
