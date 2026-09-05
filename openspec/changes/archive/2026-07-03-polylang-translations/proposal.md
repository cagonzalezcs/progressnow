# Proposal: polylang-translations

## Why

The site was wired for GTranslate (client-side machine translation of a single English DOM), but that plugin has been uninstalled and **Polylang 3.8.5 is now installed with zero theme integration** — so the header ES toggle translates nothing and the theme is half-migrated (it still renders GTranslate's `[gt-link]` shortcode and expects the `GTranslate` option). Polylang is a fundamentally different model: real translated content served at distinct `/es/` URLs, not DOM mutation. We want the front page to render genuine Spanish content — hero, "who we are", section copy, chrome, and teasers — reachable by flipping the header toggle to ES.

Supersedes the `translations-layer` change (GTranslate approach); that design's home-only gate, cookie-poisoning bridge, and notranslate-DOM policy no longer apply.

## What Changes

- **Polylang configured for EN (default) + ES** with pretty-permalink URL structure: English at `/`, Spanish at `/es/`. Default language code hidden from EN URLs. Post types (pages, posts, events) and taxonomies made translatable. (Setup step: pretty permalinks must be enabled.)
- **Front page translated as a real Polylang page pair.** The static Home Page (`page_on_front`) gets an ES translation; Polylang serves it at `/es/` and maps `page_on_front` per language. Its ACF fields (`hero_*`, `who_*`, `home_involved_*`, steps) are per-post, so the ES page carries its own Spanish values — **seeded with a Spanish draft** editors can refine.
- **Header toggle becomes a real language switcher.** `LanguageToggle.vue` renders `<a>` links to the current page's translation URL (Polylang-provided), falling back to the language home when no translation exists. **BREAKING**: drops the `legacy_lang` cookie-as-source-of-truth and the client GTranslate bridge; Polylang owns language state and its own detection cookie.
- **Theme strings + chrome translated the Polylang-native way**: static Twig strings and Vue-island labels via `pll_register_string()`/`pll__()` (passed as props from PHP); header/footer nav via Polylang per-language WP menus; section headings and empty-state copy via `pll__()`.
- **Teasers render per-language content.** Post/event CPTs become Polylang-translatable so `home_events` / `blog_*` queries auto-filter by the active language; ES translations of the teased posts/events are seeded so the ES home shows real Spanish teasers (graceful empty-states where none exist).
- **GTranslate remnants removed**: delete `src/ts/translation.ts`, drop `initTranslation()` from `app.ts`, remove the SPA-navigation ES stand-down + scope mirroring, remove the hidden `[gt-link]` block and `data-translation-scope` from `base.twig`, remove the `es_enabled`/`es_url` ACF fields and the `GTranslate` option pin in `bin/seed.php`. `inc/translation.php` is replaced by a Polylang-aware i18n context provider.

Out of scope: translating inner pages beyond what the front-page teasers link to (in-company team, later); native Spanish for every CPT; hreflang tuning beyond what Polylang emits by default; paid Polylang Pro features.

## Capabilities

### New Capabilities
- `internationalization`: Polylang EN/ES — language + URL configuration, static-front-page translation, the language-switcher contract, string/menu/theme-copy translation policy, and per-language content queries for teasers.

### Modified Capabilities
- `site-chrome`: Header language toggle changes from a cookie/GTranslate recorder to a Polylang language switcher (`<a>` to translation URLs); chrome nav/footer strings become translatable.
- `front-page`: Front page becomes language-aware — resolves per-language `page_on_front`, per-post ACF copy, and language-filtered teaser queries.

## Impact

- **New**: `inc/i18n.php` (Polylang context: current language, translation URLs, `pll` Twig helpers, string registration) + `require` in `functions.php`
- **Removed**: `inc/translation.php`, `src/ts/translation.ts`, `src/ts/__tests__` GTranslate coverage
- **Modified**: `views/base.twig` (drop gt-link + scope, feed language props to header island), `src/components/site/LanguageToggle.vue` (link switcher), `src/components/site/SiteHeader.vue` (language props), `src/composables/useLanguagePreference.ts` (retire or repurpose), `src/ts/navigation.ts` (remove ES stand-down; keep per-language links), `src/ts/app.ts` (drop `initTranslation`), `inc/options.php` (remove `es_enabled`/`es_url`), `inc/events.php` + `inc/blog.php` (language-aware queries), `bin/seed.php` (remove GTranslate pin; seed ES front page + ES ACF + ES teaser translations), various `views/*.twig` (wrap static copy in `pll__`), `README.md` (rewrite Translations section)
- **Reuses**: the `chapter.es_url` prop already passed to the toggle (unused under GTranslate) now carries the Polylang ES URL; the front Page + ACF field architecture; the island prop-plumbing pattern in `base.twig`
- **Depends on**: Polylang 3.8.5 (installed); pretty permalinks enabled; ACF Pro (installed, for per-post front-page fields)
