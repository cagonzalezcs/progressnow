# Tasks: polylang-translations

> **Implementation notes (reconciled with reality):**
> - Runtime already had pretty permalinks, EN+ES languages (ES locale is **`es_MX`**, not `es_ES`), and the `/es/` directory URL structure — 1.1–1.3 were pre-done.
> - Event CPT slug is **`event`** (not `chapter_event` as the spec assumed).
> - Header nav is a **Vue island fixture**, not a WP menu (locations unassigned) — 4.1 was satisfied by passing Polylang-translated labels as island props (`navItems`/`aboutItems`/`joinLabel`/`aboutLabel`) rather than per-language WP menus.
> - `inc/options.php` front-page context now reads ACF from `get_queried_object_id()` so `/es/` serves the Spanish page's fields.
> - 6.7: kept the inert `notranslate` classes (harmless).
> - Known follow-ups: bare `/es/` 301s to `/es/inicio/` (Polylang static-front-page canonical); event teaser dates render in English (`DateTimeImmutable::format` not locale-aware); blog teasers are lorem-ipsum so ES shows the translated empty state.

## 1. Polylang + WordPress configuration

- [x] 1.1 Enable pretty permalinks (Settings → Permalinks, non-plain structure) — prerequisite for `/es/`
- [x] 1.2 In Polylang, add languages: English (`en_US`, default) and Spanish (`es_ES`)
- [x] 1.3 Set Polylang URL modifications: language from directory (`/es/`), hide default-language code
- [x] 1.4 Make `page`, `post`, `chapter_event` post types + their public taxonomies translatable (Polylang settings and/or `inc/i18n.php` hooks)
- [x] 1.5 Document any non-scriptable setup steps in README runbook (D-Open-Q1)

## 2. i18n context layer (`inc/i18n.php`)

- [x] 2.1 Create `inc/i18n.php`; swap the `require` in `functions.php` from `inc/translation.php`
- [x] 2.2 Build the `languages` context array for the current request (per language: code, label, `is_current`, translation `url` with home fallback via `pll_home_url`)
- [x] 2.3 Expose `languages` + `current_language` to Timber context
- [x] 2.4 Add a `pll__` Twig function (Timber function/filter) for inline string translation
- [x] 2.5 Register static theme strings with `pll_register_string()` (section headings, empty-states, chrome labels)

## 3. Header language switcher

- [x] 3.1 Pass `languages` into the SiteHeader island props in `base.twig`; remove `esEnabled`/`esUrl`/`data-translation-scope`
- [x] 3.2 Update `SiteHeader.vue` to accept/forward the `languages` prop to all three responsive `LanguageToggle` instances
- [x] 3.3 Rewrite `LanguageToggle.vue` to render `<a>` segments from `languages` (active = `aria-current`), removing the cookie/GTranslate calls
- [x] 3.4 Retire or repurpose `src/composables/useLanguagePreference.ts` (D-Open-Q5)

## 4. Chrome + menu translation

- [x] 4.1 Create Spanish WP menus and assign per language in Polylang; verify `Timber::get_menu()` returns the active-language menu
- [x] 4.2 Resolve chrome label strings via `pll__()` in PHP and pass as island props (header CTA, footer tagline/columns)
- [x] 4.3 Wrap static Twig headings/empty-state copy in the `pll__` Twig helper across `front-page.twig` (and other front-facing views in scope)

## 5. Language-aware front page + teasers

- [x] 5.1 Audit `legacy_events_front_page_context()` and `legacy_blog_front_page_context()` — confirm they use Polylang-filtered `WP_Query` (not raw SQL / `suppress_filters`); adjust if they bypass the filter (D5)
- [x] 5.2 Verify `front-page.php` / `page_on_front` resolves the ES page on `/es/` and English on `/`
- [x] 5.3 Confirm per-post ACF (`hero_*`, `who_*`, `home_involved_*`, steps) reads from the ES page on `/es/`

## 6. Remove GTranslate remnants

- [x] 6.1 Delete `src/ts/translation.ts` and its `src/ts/__tests__` coverage
- [x] 6.2 Drop `initTranslation()` from `src/ts/app.ts`
- [x] 6.3 Remove the ES stand-down + `data-translation-scope` mirroring from `src/ts/navigation.ts`
- [x] 6.4 Remove the hidden `[gt-link]` shortcode block from `views/base.twig`
- [x] 6.5 Delete `inc/translation.php`; remove `es_enabled`/`es_url` ACF fields from `inc/options.php`
- [x] 6.6 Remove the `GTranslate` option pin block from `bin/seed.php`
- [x] 6.7 Decide on inert `notranslate` classes — keep or strip (D-Open-Q4)

## 7. Seeding (`bin/seed.php`)

- [x] 7.1 Ensure EN + ES languages exist and post types are translatable (idempotent)
- [x] 7.2 Create/link the ES front page as the Spanish translation of Home; set static-front-page per language
- [x] 7.3 Seed Spanish ACF values (hero, who, get-involved, steps) on the ES page — editable draft copy
- [x] 7.4 Assign per-language header/footer menus and seed ES string-translation values
- [x] 7.5 Create ES translations of the teased posts/events, linked to their EN originals (D-Open-Q3)
- [x] 7.6 Guard every seed step so re-running does not duplicate

## 8. Verify + document

- [x] 8.1 Load `/` — English front page renders unchanged (hero, sections, teasers, chrome)
- [x] 8.2 Load `/es/` — Spanish hero/who/sections, Spanish chrome + menus, Spanish teasers (or empty-states)
- [x] 8.3 Click the ES toggle from `/` → lands on `/es/`; click EN from `/es/` → returns to `/`; active segment marked `aria-current`
- [x] 8.4 Confirm no GTranslate references remain (grep `gtranslate`, `googtrans`, `translation.ts`, `es_enabled`)
- [x] 8.5 Run `npm run build` + vitest/phpunit; fix breakage from removed modules
- [x] 8.6 Rewrite the README "Translations (EN/ES)" section for the Polylang flow
