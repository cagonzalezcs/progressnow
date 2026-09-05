## ADDED Requirements

### Requirement: Repository carries a licence and community files
The repository SHALL ship a root `LICENSE` (MIT) and consistent licence declarations in `wp-content/themes/progressnow/style.css`, `wp-content/themes/progressnow/composer.json`, `wp-content/themes/progressnow/package.json`, and `site/package.json`, together with a root `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.

#### Scenario: Fresh clone is publishable
- **WHEN** the repository is cloned at its default branch
- **THEN** `LICENSE`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md` exist at the root and the four package/theme manifests declare the same licence identifier

#### Scenario: Third-party attribution retained
- **WHEN** MIT-licensed upstream code is included (Timber starter theme, shadcn-vue components)
- **THEN** its attribution remains in the corresponding manifest or component header and is listed in the root README's acknowledgements

### Requirement: Required plugins are declared, not vendored
The repository SHALL NOT contain any WordPress plugin. The root README and the theme README SHALL list ACF Pro and Polylang Pro as required plugins with minimum versions and where to obtain them, and SHALL list optional plugins separately. The theme SHALL display a wp-admin notice naming any required plugin that is not active.

#### Scenario: Fresh clone contains no plugins
- **WHEN** `git ls-files wp-content/plugins` is run
- **THEN** it returns no paths

#### Scenario: Missing required plugin is surfaced
- **WHEN** the theme is active and ACF Pro or Polylang is not active
- **THEN** wp-admin shows a dismissible-per-session error notice naming the missing plugin and its minimum version, and the theme does not fatal

#### Scenario: Both required plugins active
- **WHEN** ACF Pro and Polylang are active at or above the documented minimum versions
- **THEN** no dependency notice is shown

### Requirement: No analytics or tracking ships with the theme or site
The theme and the Nuxt site SHALL NOT include analytics, tag-manager, advertising-pixel, session-recording, or fingerprinting code, and SHALL NOT make requests to such services. The only client-side storage written by shipped code is the visitor's own accessibility preferences.

#### Scenario: Shipped code is tracker-free
- **WHEN** the hygiene script scans tracked text files for analytics tokens
- **THEN** it finds none

#### Scenario: Visitor storage is limited to preferences
- **WHEN** a visitor browses the site without changing accessibility settings
- **THEN** shipped code writes nothing to `localStorage`, `sessionStorage`, IndexedDB, or cookies

### Requirement: Public-fork release checklist is documented
The repository SHALL include `docs/open-source-release.md` describing how the public fork is produced: a passing hygiene run, a fresh git history, an initial version tag, GitHub private vulnerability reporting enabled, and branch protection requiring CI.

#### Scenario: Release checklist is complete
- **WHEN** a maintainer follows `docs/open-source-release.md`
- **THEN** every step is executable from the document alone and the resulting public repository passes the hygiene job on its first CI run
