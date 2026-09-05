## ADDED Requirements

### Requirement: Public interior pages are translated page pairs

Each public interior page — Calendar, About, Get Involved, the Blog posts page (`page_for_posts`), and (subject to scope) Bylaws & Code of Conduct and Privacy Policy — SHALL have a Polylang Spanish translation linked to its English original via `pll_save_post_translations`. Each Spanish page SHALL carry the **same `_wp_page_template`** as its English original, so the template-keyed context wiring (calendar/about/get-involved islands and contexts) fires for the Spanish page. Each Spanish page SHALL resolve at its `/es/…` URL rather than 301-redirecting to the English page. Per-page editable content (page title, ACF `lede`, and per-page ACF body groups) SHALL be authored per-post in Spanish and seeded as an editable draft, so editors own the Spanish copy independently of the English page. Seeding SHALL be idempotent (guarded by `pll_get_post`), creating-or-updating without duplicating pages.

#### Scenario: Spanish calendar page resolves

- **WHEN** a visitor navigates to the Spanish calendar URL under `/es/`
- **THEN** the Spanish calendar page renders (no 301 to `/calendar/`) with a Spanish title and lede, and the events island fetches events filtered to the `es` language

#### Scenario: Template context wires up on the Spanish page

- **WHEN** the Spanish About page renders
- **THEN** its About island/context renders (not a bare page), because the Spanish page carries the About page template

#### Scenario: Spanish blog posts page resolves

- **WHEN** a visitor navigates to the Spanish blog URL under `/es/`
- **THEN** Polylang serves the Spanish `page_for_posts` (no 301) and the archive island shows Spanish posts, or its language-filtered empty state when none exist

#### Scenario: Editors own the Spanish copy

- **WHEN** an editor opens a Spanish interior page in wp-admin
- **THEN** its title, `lede`, and ACF body fields are independently editable without affecting the English page

#### Scenario: Re-running the seed does not duplicate

- **WHEN** the seed runs a second time
- **THEN** each interior page still has exactly one linked Spanish translation, and existing editor edits to a Spanish page are not clobbered

### Requirement: Spanish navigation and inter-page links resolve to translations

On the Spanish site, header/footer navigation items and seeded inter-page links (e.g. the front page's "more about our chapter" link, the About mega-menu targets) SHALL resolve to the `/es/` translation URLs of their targets rather than the canonical English paths. When a link target has no Spanish translation, it SHALL fall back to the Spanish home (`/es/`). Language-neutral URL fragments (anchor ids such as `#mission`) SHALL be preserved on the localized path.

#### Scenario: Spanish header nav links to translations

- **WHEN** the Spanish site renders its header navigation
- **THEN** the Calendar, Blog, Get Involved, and About items link to their `/es/` translation URLs

#### Scenario: Anchor preserved on localized path

- **WHEN** a Spanish visitor follows the About mega-menu "Mission & History" item
- **THEN** the browser navigates to the Spanish About page path with the `#mission` fragment intact

#### Scenario: Fallback when target untranslated

- **WHEN** a Spanish nav or in-page link points at a target that has no Spanish translation
- **THEN** the link resolves to the Spanish home `/es/` instead of the English page

### Requirement: Shared interior chrome strings are translatable

Static English labels rendered by the interior Twig templates that are neither ACF fields nor already-registered strings — e.g. the `page.twig` sidebar labels ("On this page", "Related", "Governing documents"), the grievance callout copy, and interior template fallback labels — SHALL be registered via `pll_register_string()` and output through `pll__()`/`pll_e()`, so they render Spanish on `/es/` pages. Language-neutral tokens (brand names, county names, emails, EN/ES codes) SHALL remain untranslated.

#### Scenario: Spanish interior chrome

- **WHEN** a Spanish interior page renders its sidebar and section chrome
- **THEN** the shared labels render in Spanish from registered string translations

#### Scenario: Body copy comes from Spanish page fields

- **WHEN** a seeded Spanish interior page renders its body
- **THEN** the content comes from the Spanish page's own ACF values / `post_content` and never falls back to the English fixture prose
