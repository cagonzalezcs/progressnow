# site-chrome

## ADDED Requirements

### Requirement: Language toggle is a Polylang language switcher
The header EN/ES toggle SHALL be a Polylang language switcher: each segment is an `<a>` linking to the current page's translation URL (or the target language's home when no translation exists), rendered from server-provided language data. The active language segment SHALL be marked `aria-current="true"`. All responsive header instances SHALL receive the same language props and stay consistent. The toggle SHALL NOT record a client language cookie or trigger any machine-translation bridge; navigation to the translated URL is the entire behavior. The EN/ES codes themselves remain untranslated.

#### Scenario: Flip to Spanish
- **WHEN** a visitor clicks the ES segment on the English front page
- **THEN** the browser navigates to `/es/` and the Spanish page loads

#### Scenario: Active state on Spanish page
- **WHEN** the Spanish page renders
- **THEN** the ES segment is styled active with `aria-current` and the EN segment links back to the English page

### Requirement: Header and footer chrome translate via Polylang
Header nav labels, the About dropdown, the mobile menu, the Join CTA label, and footer columns/tagline SHALL render in the active language — nav from per-language WP menus assigned in Polylang, and static labels from `pll__()`-registered strings passed as island props. Language-neutral tokens (brand name, county names, social handles) SHALL stay untranslated.

#### Scenario: Spanish chrome
- **WHEN** the Spanish front page renders
- **THEN** header nav labels, the Join CTA, and footer text render in Spanish while the EN/ES toggle segments and brand tokens stay literal
