# Design: translations-layer

## Context

GTranslate (free tier, `url_structure='none'`) is installed but unwired: no `/es/` URLs, translation is purely client-side. The plugin only emits front-end code when a widget/shortcode/block renders; the `[gt-link]` shortcode path enqueues `js/base.js` + a `window.gtranslateSettings` blob with no visible widget. `base.js` hides Google's banner UI, appends a hidden `#google_translate_element2`, and exposes `window.doGTranslate('en|es')`, which drives the `select.goog-te-combo` Google injects. Language persists in the `googtrans=/en/es` cookie (`path=/`, sometimes duplicated on the dot-domain); with it set, `base.js` auto-loads Google's `element.js` on page load and the page translates on init. `element.js` manages `<html lang>` itself and machine-translates late-added DOM via MutationObserver.

Theme side: `LanguageToggle.vue` (3 responsive instances in `SiteHeader.vue`) writes only the theme's `legacy_lang` cookie via the `useLanguagePreference` singleton. `esEnabled`/`esUrl` props exist unused, fed from Chapter Settings through `base.twig`. Home (`front-page.twig`) is server-rendered Twig whose only islands are chrome (SiteHeader/SiteFooter); inner surfaces mount content islands (BlogArchive, SinglePost, SingleEvent, EventCalendar) and `navigation.ts` does fetch-based partial swaps of `#main`.

## Goals / Non-Goals

**Goals:** live EN/ES on the home page driven by the existing toggle; zero gtranslate assets (and zero translation) on inner pages until the in-company team ships; every template translation-ready now (notranslate policy applied); Vue islands never corrupted by Google's DOM mutation; single, obvious lift point for the home-only restriction.

**Non-Goals:** hreflang / ES URLs (impossible on free tier), curated Spanish copy, native ES chrome strings (header/footer stay EN in v1), inner-page translation, paid GTranslate migration, translating REST/island payloads.

## Decisions

### D1: Bootstrap via hidden `[gt-link]` shortcode, not a theme-owned loader
When the gate is active, `base.twig` renders `do_shortcode('[gt-link lang="es" label="Español"]')` inside a hidden `notranslate` wrapper before `wp_footer()`. The plugin then enqueues its own `base.js` + settings blob — update-safe, no plugin JS copied into the theme. Alternative considered: theme-enqueued copy of the loader — rejected; it would fork plugin internals we'd have to track across updates.

### D2: EN revert = expire `googtrans` + reload, not `doGTranslate('en|en')`
In-place revert can leave `<font>` wrapper artifacts in the DOM. Expiring the cookie (hostname, `.hostname`, and dot-domain variants, `path=/`) and reloading guarantees pristine markup for island remounts. Trade-off: one full load on ES→EN; acceptable for a rare action.

### D3: SPA standdown while ES preference is set
`navigation.ts` returns early from click interception (and prefetch) when `legacy_lang=es`. One rule covers both failure modes: home→inner (MutationObserver would translate swapped EN content and race island mounts) and inner→home (a swap can't add the gtranslate scripts). Alternative considered: retranslate-on-swap hook — rejected as racy and dependent on Google internals. Because interception never happens under ES, `popstate` needs no special handling. `syncHead()` also syncs `data-translation-scope` so an EN user who SPA-navigates onto home can still flip ES (fallback path in D6 covers missing scripts).

### D4: Chrome translates except the language toggle (revised during apply)
Originally all chrome was `notranslate`; per user direction the header and footer islands now translate — their labels are static text nodes Vue never re-patches after mount, so Google's `<font>` wrapping is reconciliation-safe. The LanguageToggle carries its own `notranslate` (EN/ES are language codes, not copy). Dynamically mounted chrome (mobile panel, portaled About dropdown) appears in EN and is translated a beat later by Google's MutationObserver — accepted. Content-island mounts (BlogArchive/SinglePost/etc.) stay translatable; when the gate lifts, their ES should come from data/props (REST-side fields), not DOM machine translation.

### D4b: The theme must never pre-set `<html lang>` to the preference
Found during apply: `useLanguagePreference` used to set `document.documentElement.lang = 'es'` on load/flip. Google's element then saw source language == target language and silently no-opped the entire translation (it still added `translated-ltr`). The composable now only writes the cookie; Google owns `<html lang>` while translating.

### D5: Inner-page toggle stays an interactive preference recorder
Disabling the switch off-home would make the preference un-settable anywhere but home. It keeps writing `legacy_lang`; tooltip copy changes from "próximamente" to "Español — disponible en la página de inicio" so scope is stated honestly.

### D6: PHP-side gate with `legacy/translation/active` as the lift point
`inc/translation.php`: `legacy_translation_active() = !is_admin() && es_enabled && is_front_page()`, wrapped in `apply_filters('legacy/translation/active', $active)`; exposed to Twig as `translation.active` and to the client as `data-translation-scope` on `<body>`. Lifting home-only later = one predicate change (or a filter from a future inc file). Alternative considered: JS-side gate — rejected; assets must not even enqueue on inner pages.

Bridge mechanics (`src/ts/translation.ts`): `activateSpanish()` requires the page to be translation-scoped, ensures Google's `element.js` is loaded (replicating the plugin's `load_tlib`, honoring the `window.gt_translate_script` guard — needed because the hidden gt-link never receives the pointerenter that normally lazy-loads it), then `doGTranslate('en|es')` translates in place; if plugin assets are absent it falls back to writing `googtrans=/en/es` + reload. `legacy_lang` is authoritative; `googtrans` is derived. `initTranslation()` reconciles on load (ES preferred + translatable page + no googtrans → activate).

### D7: Keep `googtrans` when leaving home
The cookie is inert on inner pages (no element.js) and makes ES auto-resume when the visitor returns to home (`base.js` auto-loads on init). Clearing it on every inner-page load would add cookie churn for no behavioral gain.

### D8: notranslate content policy
`class="notranslate"` (Google-honored) on proper nouns, identifiers, and contact data only — never descriptive copy: county names (a county name would machine-translate), `@chapterhandle`, emails, "the chapter"/"Progress Now" brand tokens, venue names/addresses in the server-rendered single/event fallbacks. Existing `lang="es"` spans stay. Plugin settings pinned: languages en+es, `detect_browser_language` OFF (it auto-fires `doGTranslate` and would fight the toggle and the gate), no widget placement.

## Risks / Trade-offs

- [Google `element.js` endpoint availability/changes] → single choke point in `translation.ts`; failure degrades to EN with a working preference toggle, never a broken page.
- [Machine-translation quality on organizing copy] → accepted for v1; notranslate protects identifiers; in-company team supersedes later.
- [Cookie domain duplication (`googtrans` on host + dot-domain)] → revert expires all variants.
- [Plugin update changes `base.js` contract (`doGTranslate`, cookie format)] → bridge feature-detects `window.doGTranslate` and falls back to cookie+reload; vitest pins our side of the contract.
- [ES users lose SPA nav speed] → deliberate (D3); full loads are correct-by-construction while translation is active.

## Migration Plan

Additive: ship gate + bridge behind the existing `es_enabled` option (default off). Enable on staging, verify home ES flow, then enable in prod options. Rollback = toggle `es_enabled` off (assets stop enqueueing instantly). Gate lift for the in-company team documented in README: override `legacy/translation/active` (or drop `is_front_page()`), then extend the notranslate sweep + island data strategy per D4.

## Open Questions

1. Machine-translated chrome is v1 — add native ES nav/footer strings later for quality?
2. "the parent organization" full name notranslate, or let it translate?
3. Gate lift surface: filter only, or add per-page ACF "translation ready" field now?
4. `es_url` ACF option obsolete under cookie approach — remove or keep dormant?
