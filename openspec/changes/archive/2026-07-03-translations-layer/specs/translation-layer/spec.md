# translation-layer

## ADDED Requirements

### Requirement: Translation activation gate
Translation SHALL be active only when the Chapter Settings `es_enabled` option is on AND the current request is the front page, computed server-side by `rgvdsa_translation_active()` and filterable via `rgvdsa/translation/active`. The gate SHALL be exposed to templates as `translation.active` in Timber context and to client scripts as a `data-translation-scope` attribute on `<body>` (`page` when active, `none` otherwise).

#### Scenario: Home is translatable
- **WHEN** `es_enabled` is on and a visitor loads the front page
- **THEN** the body carries `data-translation-scope="page"` and GTranslate bootstrap assets are enqueued

#### Scenario: Inner pages carry no translation assets
- **WHEN** any non-front-page surface renders (page, post, archive, search, 404)
- **THEN** no gtranslate script or settings blob appears in the document and `data-translation-scope` is `none`

#### Scenario: Kill switch
- **WHEN** `es_enabled` is turned off in Chapter Settings
- **THEN** the front page renders with no translation assets and the header toggle reverts to preference-recorder behavior

### Requirement: GTranslate bootstrap via plugin shortcode
Translation-active pages SHALL bootstrap GTranslate by rendering the plugin's `[gt-link lang="es"]` shortcode inside a hidden `notranslate` wrapper before `wp_footer()`, so the plugin enqueues its own `base.js` and `window.gtranslateSettings` blob. The theme SHALL NOT duplicate plugin JavaScript.

#### Scenario: Plugin assets on home
- **WHEN** the front page renders with the gate active
- **THEN** view-source shows the gtranslate `base.js` enqueue and a `gtranslateSettings` inline blob, and no visible gtranslate widget UI

### Requirement: Toggle-to-GTranslate bridge
When the page is translation-scoped, flipping the header toggle to ES SHALL load Google's translate element (respecting the plugin's `window.gt_translate_script` guard) and fire `doGTranslate('en|es')`, translating in place without a reload; if plugin assets are absent it SHALL fall back to writing `googtrans=/en/es` and reloading. Flipping back to EN SHALL expire all `googtrans` cookie variants (hostname, dot-domain, `path=/`) and reload the page.

#### Scenario: ES flip translates in place
- **WHEN** a visitor on the front page flips the toggle to ES
- **THEN** the page content translates to Spanish without a full reload and the `googtrans` cookie reads `/en/es`

#### Scenario: EN flip restores pristine DOM
- **WHEN** a visitor in ES flips the toggle back to EN
- **THEN** the `googtrans` cookie is expired and the page reloads in English with no `<font>` translation artifacts

#### Scenario: ES persists across loads
- **WHEN** a visitor who activated ES hard-reloads or returns to the front page
- **THEN** the page auto-translates to Spanish on load

### Requirement: Cookie contract
The theme's `rgvdsa_lang` cookie SHALL remain the authoritative language preference; `googtrans` SHALL be treated as derived state. On load of a translation-scoped page, startup reconciliation SHALL activate Spanish when `rgvdsa_lang=es` and no ES `googtrans` cookie exists. The `googtrans` cookie SHALL be left in place when leaving the front page so ES auto-resumes on return.

#### Scenario: Preference survives googtrans loss
- **WHEN** `rgvdsa_lang=es` but the `googtrans` cookie is missing and the front page loads
- **THEN** the reconciler re-activates Spanish

### Requirement: Client-navigation standdown under ES
While `rgvdsa_lang=es`, the fetch-based partial-swap navigation SHALL stand down (no click interception, no prefetch): all navigation is full page loads. Partial-swap head syncing SHALL keep `data-translation-scope` current for EN users.

#### Scenario: ES navigation is full-load
- **WHEN** a visitor with ES active on the front page clicks a nav link to the blog
- **THEN** the browser performs a full page load and the blog renders in English

#### Scenario: EN keeps partial swaps
- **WHEN** a visitor with `rgvdsa_lang=en` navigates between pages
- **THEN** fetch-based partial swaps behave as before this change

### Requirement: notranslate content policy
All templates SHALL mark proper nouns, identifiers, and contact data with `class="notranslate"` — county names, social handles, email addresses, "RGV DSA"/"DSA" brand tokens, venue names and street addresses in server-rendered article/event fallbacks — and SHALL NOT mark descriptive copy. Content-island mount elements SHALL remain translatable.

#### Scenario: Identifiers survive translation
- **WHEN** the front page is translated to ES
- **THEN** county names (e.g. "Starr"), `@dsa_rgv`, contact emails, and "RGV DSA" render unchanged

### Requirement: Pinned plugin configuration
The GTranslate plugin option SHALL be pinned to: default language `en`, included languages exactly `en` and `es`, `detect_browser_language` off, and no widget/block/menu placement — the hidden gt-link bootstrap is the only integration surface. Configuration SHALL be documented (and optionally seeded via `bin/seed.php`).

#### Scenario: No auto-switch fight
- **WHEN** a visitor with a Spanish-language browser loads the front page for the first time
- **THEN** the page renders in English until they flip the toggle (no browser-language auto-translate)
