# internationalization Specification

## Purpose
TBD - created by archiving change polylang-translations. Update Purpose after archive.
## Requirements
### Requirement: Polylang language and URL configuration
The site SHALL run Polylang with two languages: English (`en_US`) as the default and Spanish (`es_ES`). URL modifications SHALL place the language code in the directory (`/es/`) with the default language code hidden, so English pages resolve at `/` and Spanish pages at `/es/…`. Pretty permalinks SHALL be enabled (a required prerequisite). The `page`, `post`, and `chapter_event` post types and their public taxonomies SHALL be registered as translatable.

#### Scenario: Spanish home URL
- **WHEN** a visitor navigates to `/es/`
- **THEN** the Spanish front page renders and the English home stays at `/`

#### Scenario: Default language uncoded
- **WHEN** an English page renders
- **THEN** its URL contains no `/en/` segment

### Requirement: Static front page is a translated page pair
The static front page (`page_on_front`) SHALL have a Polylang Spanish translation linked to the English original. Polylang SHALL resolve `page_on_front` per language so `/` serves the English page and `/es/` serves its Spanish translation. Front-page ACF copy (hero, who-we-are, get-involved, steps) SHALL be authored per-post, so the Spanish page carries its own Spanish field values seeded as an editable draft.

#### Scenario: Spanish front page content
- **WHEN** a visitor loads `/es/`
- **THEN** the hero heading, lede, CTAs, "who we are" copy, and get-involved steps render in Spanish from the Spanish page's ACF fields

#### Scenario: Editors own the Spanish copy
- **WHEN** an editor opens the Spanish home page in wp-admin
- **THEN** its ACF fields are independently editable without affecting the English page

### Requirement: Header language switcher navigates to translations
The header toggle SHALL render `<a>` links (EN and ES) that navigate to the translation URL of the current page, provided by Polylang server-side. When the current page has no translation in the target language, the link SHALL fall back to that language's home (`/` or `/es/`). The active language segment SHALL be styled as current and marked with `aria-current`. The switcher SHALL NOT depend on a client-side `progressnow_lang` cookie or any machine-translation bridge.

#### Scenario: Switch to Spanish from a translated page
- **WHEN** a visitor on the English front page clicks ES
- **THEN** the browser navigates to `/es/` and the Spanish front page loads

#### Scenario: Fallback when no translation exists
- **WHEN** a visitor is on an English page that has no Spanish translation and clicks ES
- **THEN** the browser navigates to the Spanish home `/es/`

#### Scenario: Active language indicated
- **WHEN** the Spanish page renders
- **THEN** the ES segment is styled active with `aria-current` and the EN segment links to the English equivalent

### Requirement: Theme copy and menus translate the Polylang-native way
Static theme strings rendered in Twig or passed into Vue islands SHALL be translatable via `pll_register_string()` and output through `pll__()`/`pll_e()`, so their Spanish values are managed in Polylang's String Translations. Header and footer navigation SHALL use per-language WP menus assigned through Polylang. Language-neutral tokens (county names, `@chapterhandle`, emails, the "the chapter"/"Progress Now" brand, the EN/ES codes) SHALL remain untranslated.

#### Scenario: Section headings in Spanish
- **WHEN** the Spanish front page renders
- **THEN** static section headings and empty-state copy render in Spanish from registered string translations

#### Scenario: Spanish navigation menu
- **WHEN** the Spanish site renders its header
- **THEN** the nav shows the Spanish menu assigned to `es_ES`

### Requirement: Teaser queries filter by active language
Front-page teaser queries (`chapter_event` upcoming events, blog featured/rows) SHALL return only content in the active language. Spanish translations of the teased posts and events SHALL be seeded and linked to their English originals so the Spanish front page shows real Spanish teasers. Where no translation exists, the section's existing empty-state SHALL render.

#### Scenario: Spanish teasers on the Spanish home
- **WHEN** the Spanish front page renders
- **THEN** the events and blog teasers show the Spanish translations of the teased content

#### Scenario: Empty-state when untranslated
- **WHEN** a teased section has no Spanish content in the active language
- **THEN** that section renders its empty-state message instead of English content

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

