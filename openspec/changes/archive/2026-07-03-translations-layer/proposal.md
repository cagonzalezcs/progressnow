# Proposal: translations-layer

## Why

The header EN/ES toggle only records a cookie preference (`legacy_lang`) — flipping to ES translates nothing, and the installed GTranslate plugin is completely unwired from the theme. The chapter serves a bilingual region; Spanish on the home page is the highest-value first step, and every template should become translation-ready now so the in-company team can extend translation to inner pages without re-plumbing.

## What Changes

- New `inc/translation.php` gate: translation is active when the Chapter Settings `es_enabled` option is on AND the page is the front page, exposed via `apply_filters('legacy/translation/active', …)` and Timber context (`translation.active`). The `is_front_page()` predicate is the single, deliberately liftable home-only restriction.
- GTranslate bootstrap on translation-active pages only: `base.twig` emits a hidden `[gt-link lang="es"]` shortcode, letting the plugin enqueue its own `base.js` + settings blob (no widget UI, no duplicated plugin code). Inner pages load zero gtranslate assets — that absence is the enforcement.
- New `src/ts/translation.ts` bridge: the toggle's ES flip loads Google's translate element and fires `doGTranslate('en|es')` in place; EN flip expires the `googtrans` cookie(s) and reloads for a pristine DOM. `legacy_lang` stays the theme-level source of truth; `googtrans` is derived.
- `LanguageToggle.vue` drives live translation when `esEnabled`; on inner pages it remains a preference recorder with an accurate scope tooltip ("Español — disponible en la página de inicio").
- SPA-nav standdown: while the ES preference is set, `navigation.ts` skips fetch-based partial swaps (full page loads), so translated DOM and island swaps never coexist.
- Translation-ready markup across ALL templates: `notranslate` on proper nouns, identifiers, and contact data (county names, `@chapterhandle`, emails, "the chapter" brand tokens, venue/address text); `notranslate` on chrome island mounts (SiteHeader/SiteFooter) and the portaled header dropdown so Google never mutates Vue-managed DOM. Content-island mounts stay translatable for the future gate lift.
- GTranslate plugin configuration pinned: languages en+es only, `detect_browser_language` off, no widget/menu placement (documented + optionally seeded via `bin/seed.php`).

Out of scope: hreflang (free tier has no distinct ES URLs), curated/native Spanish copy, inner-page translation (in-company team), paid GTranslate tiers (`/es/` URL structure), ES strings for header/footer chrome (stays EN in v1).

## Capabilities

### New Capabilities
- `translation-layer`: Home-only EN/ES machine translation — activation gate, toggle↔GTranslate bridge, cookie contract, notranslate policy, client-nav standdown.

### Modified Capabilities
- `site-chrome`: Header language toggle gains live-translation behavior on translation-active pages; chrome (header/footer/dropdown) is excluded from machine translation.

## Impact

- New: `inc/translation.php` (+ `require` in `functions.php`), `src/ts/translation.ts`, `src/ts/__tests__` coverage for the bridge
- Modified: `views/base.twig` (gt-link bootstrap, notranslate mounts, body scope attr, `esEnabled` from gate), `src/components/site/LanguageToggle.vue`, `src/components/site/SiteHeader.vue` (portaled dropdown), `src/ts/navigation.ts` (ES standdown + scope sync), `src/ts/app.ts` (init), `views/front-page.twig` + all other views (notranslate sweep), `src/composables/useLanguagePreference.ts` (export cookie reader, refresh comments)
- Reuses: `es_enabled` ACF option (inc/options.php), `useLanguagePreference` singleton + `legacy_lang` cookie, `legacy/context/*` domain-filter pattern, gtranslate plugin's own `base.js`/shortcode machinery
- Depends on: gtranslate plugin installed (free tier); Google `translate.google.com/translate_a/element.js` availability at runtime
