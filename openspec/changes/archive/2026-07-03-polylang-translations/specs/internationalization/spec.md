# internationalization

## ADDED Requirements

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
The header toggle SHALL render `<a>` links (EN and ES) that navigate to the translation URL of the current page, provided by Polylang server-side. When the current page has no translation in the target language, the link SHALL fall back to that language's home (`/` or `/es/`). The active language segment SHALL be styled as current and marked with `aria-current`. The switcher SHALL NOT depend on a client-side `rgvdsa_lang` cookie or any machine-translation bridge.

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
Static theme strings rendered in Twig or passed into Vue islands SHALL be translatable via `pll_register_string()` and output through `pll__()`/`pll_e()`, so their Spanish values are managed in Polylang's String Translations. Header and footer navigation SHALL use per-language WP menus assigned through Polylang. Language-neutral tokens (county names, `@dsa_rgv`, emails, the "RGV DSA"/"DSA" brand, the EN/ES codes) SHALL remain untranslated.

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

## REMOVED Requirements

### Requirement: GTranslate machine-translation bridge
**Reason**: GTranslate was uninstalled and replaced by Polylang, which serves real translated content at distinct URLs instead of mutating a single English DOM client-side.
**Migration**: Delete `src/ts/translation.ts` and its tests, drop `initTranslation()` from `src/ts/app.ts`, remove the SPA-navigation ES stand-down and `data-translation-scope` mirroring in `src/ts/navigation.ts`, remove the hidden `[gt-link]` shortcode block and `data-translation-scope` from `views/base.twig`, delete `inc/translation.php` (replaced by `inc/i18n.php`), remove the `es_enabled`/`es_url` ACF fields from `inc/options.php`, and remove the `GTranslate` option pin from `bin/seed.php`. The `rgvdsa_lang` cookie and `googtrans` cookie handling are retired; Polylang owns language state.
