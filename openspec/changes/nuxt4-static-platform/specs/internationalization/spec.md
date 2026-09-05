## MODIFIED Requirements

### Requirement: Theme copy and menus translate the Polylang-native way
Static theme strings rendered in Twig or delivered to the Nuxt app (via the `/site` payload `strings` map) SHALL be translatable via `pll_register_string()` under the "Chapter" string group and output through `pll__()`/`pll_e()`, so their Spanish values are managed in Polylang's String Translations. Header and footer navigation SHALL use per-language WP menus assigned through Polylang. Language-neutral tokens (the chapter name and short name from Chapter Settings, emails, social handles when configured, the EN/ES codes) SHALL remain untranslated. Existing Spanish translations SHALL be preserved across the brand scrub, with only regional mentions rewritten.

#### Scenario: Section headings in Spanish
- **WHEN** the Spanish front page renders
- **THEN** static section headings and empty-state copy render in Spanish from registered string translations

#### Scenario: Spanish navigation menu
- **WHEN** the Spanish site renders its header
- **THEN** the nav shows the Spanish menu assigned to `es_ES`

#### Scenario: App receives translated strings
- **WHEN** the Nuxt app renders a Spanish route
- **THEN** its chrome labels come from the `/site?lang=es` `strings` map and match the Twig shell
