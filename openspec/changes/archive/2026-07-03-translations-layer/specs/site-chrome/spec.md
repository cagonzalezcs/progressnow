# site-chrome

## ADDED Requirements

### Requirement: Language toggle drives live translation
The header EN/ES toggle SHALL, on translation-active pages (see `translation-layer`), trigger live translation via the GTranslate bridge in addition to recording the `legacy_lang` preference. On pages where translation is not active it SHALL remain an interactive preference recorder whose ES label tooltip states the current scope ("Español — disponible en la página de inicio"). All responsive header instances SHALL stay in sync through the shared preference singleton. The theme SHALL NOT pre-set `<html lang>` from the preference — Google's element owns it while translating, and a pre-set "es" makes Google treat the page as already Spanish and skip translation entirely.

#### Scenario: Toggle on home
- **WHEN** a visitor flips the toggle to ES on the front page
- **THEN** the page translates and `legacy_lang=es` is recorded

#### Scenario: Toggle on inner page
- **WHEN** a visitor flips the toggle to ES on a non-translated page
- **THEN** only the preference is recorded, content stays English, and the tooltip explains ES is available on the home page

### Requirement: Chrome translates except the language toggle
The header and footer islands (nav links, About dropdown, mobile menu panel, Join CTA, footer columns/tagline) SHALL be translatable — their labels are static text nodes Vue never re-patches, so machine translation is reconciliation-safe. The LanguageToggle SHALL carry `notranslate` (EN/ES are language codes, not copy).

#### Scenario: Chrome in ES
- **WHEN** the front page is translated to ES
- **THEN** header nav labels, the Join CTA, and footer text render in Spanish while the EN/ES toggle segments stay literal
