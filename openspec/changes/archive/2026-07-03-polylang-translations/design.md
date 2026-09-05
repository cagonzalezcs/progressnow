# Design: polylang-translations

## Context

The theme (Timber/Twig + Vue islands + Vite, ACF Pro) was wired for GTranslate: client-side machine translation of a single English DOM, gated to the home page, driven by a hand-tuned cookie/bubbling-change bridge (`src/ts/translation.ts`). That plugin is now uninstalled; the theme still renders GTranslate's `[gt-link]` shortcode and expects the `GTranslate` option, so translation is inert. **Polylang 3.8.5 is installed with zero theme integration** (no `pll_*` calls anywhere).

Polylang is a different model entirely: it stores real translated content as separate post objects, serves them at distinct URLs, and filters queries by the active language. The front page is a static WP Page (`page_on_front`) whose hero/who/get-involved copy are ACF fields **on that page** (`inc/options.php` → `rgvdsa/context/front_page` filter), with Twig literals as pre-seed fallbacks. Because those fields are per-post, an ES page translation naturally carries its own Spanish values — no per-field option gymnastics. Chapter Settings options (counties, socials, event count) are global and mostly language-neutral. The event CPT is `chapter_event`.

User decisions locked: pretty `/es/` URLs; translate the whole visible front page including chrome and teasers; seed a Spanish draft that editors refine.

## Goals / Non-Goals

**Goals:** genuine Spanish front page at `/es/` (hero, who, sections, chrome, teasers); a header toggle that switches languages by navigating to translation URLs; Polylang-native machinery (page pairs, string translations, per-language menus, language-filtered queries); complete removal of the GTranslate bridge; a seed path that produces a viewable ES home immediately.

**Non-Goals:** translating every inner page (in-company team, later); native Spanish for all CPT content; hreflang beyond Polylang's default emission; Polylang Pro features; preserving the `rgvdsa_lang`/`googtrans` cookie contract.

## Decisions

### D1: URL structure — language in directory, default uncoded
Polylang "URL modifications" = language set from directory (`/es/`), "Hide URL language information for the default language" ON. English at `/`, Spanish at `/es/…`. Requires pretty permalinks. Alternative `?lang=es` (query var) rejected: ugly, worse for SEO/caching, and the toggle already carries an `esUrl` prop that wants a real URL. **Prerequisite**: enable pretty permalinks before configuring Polylang.

### D2: Front page = translated static-page pair, not options or string-translated body
Create an ES translation of the Home Page; set the static-front-page per language in Polylang. `page_on_front` resolves per language automatically. Hero/who/get-involved ES copy lives in the ES page's own ACF fields (ACF Pro stores fields per-post, so no "Polylang for ACF" plugin is needed for post-level fields). Alternatives rejected: (a) `pll_register_string` over every body string — fights ACF ownership and duplicates the editor surface; (b) per-language ACF **options** — options are global in Polylang without extra plugins and the home body isn't option-sourced anyway.

### D3: Toggle = server-provided translation URLs, `<a>` navigation
`inc/i18n.php` builds a `languages` array for the current request — for each language: code, label, `is_current`, and `url` (the translation of the current page via `pll_get_post(get_queried_object_id(), $lang)` → permalink, falling back to `pll_home_url($lang)`). `base.twig` passes this into the SiteHeader island props (replacing `esEnabled`/`esUrl`). `LanguageToggle.vue` renders `<a>` segments from it. No cookie, no GTranslate bridge. Polylang keeps its own `pll_language` detection cookie; we don't touch it. Alternative (keep the cookie recorder) rejected: language state now lives in the URL, so a cookie is redundant and can desync from the URL.

### D4: Theme strings via `pll_register_string`/`pll__`; menus per language
Static Twig headings/empty-states and Vue-island labels are registered with `pll_register_string()` (on `init`/`after_setup_theme`) and output through `pll__()` — for island labels, PHP resolves them and passes the translated strings as props (islands stay dumb). Header/footer nav uses per-language WP menus assigned in Polylang's menu-language UI; `Timber::get_menu()` returns the active-language menu. Expose a `pll__` Twig function via a Timber filter so Twig can translate inline. Language-neutral tokens keep their literals (the old `notranslate` classes become inert but harmless — leave in place, or strip opportunistically).

### D5: Teasers — make CPTs translatable, let Polylang filter, seed ES translations
Register `post` and `chapter_event` (and their taxonomies) as translatable. Polylang then filters main and secondary queries by the active language, so `rgvdsa_events_front_page_context()` / `rgvdsa_blog_front_page_context()` return ES content on `/es/` with no query rewrite from us — **verify** each helper uses a normal `WP_Query`/`get_posts` (Polylang-filtered) rather than a language-agnostic raw SQL path; adjust only if it bypasses the query filter. Seed ES translations for the specific posts/events the home teases, linked to their EN originals. Untranslated sections fall through to their existing empty-states.

### D6: Remove GTranslate; replace `inc/translation.php` with `inc/i18n.php`
Deletions/edits enumerated in the proposal Impact + the `internationalization` REMOVED requirement. `inc/i18n.php` owns: Polylang post-type/taxonomy registration hooks (if not done in Polylang settings), the `languages` context builder, string registration, and Twig `pll__` helper. `functions.php` swaps the `require`. `src/ts/navigation.ts` drops the ES stand-down entirely — with per-language URLs every link is already language-correct, so fetch-based partial swaps stay within the active language naturally.

### D7: Seeding is idempotent and re-runnable
Extend `bin/seed.php`: ensure languages exist (`pll_*` admin APIs or direct term insertion), create/link the ES home page + ES ACF values, assign per-language menus, register string translations' ES values, and create ES teaser translations. Guard every step so re-running doesn't duplicate. Remove the `GTranslate` option pin block. This is what makes "flip to ES and see Spanish" work on a fresh DB.

## Risks / Trade-offs

- **Pretty permalinks not enabled** → `/es/` 404s. Mitigation: D1 prerequisite is an explicit first task; seed/README call it out.
- **A teaser helper bypasses the Polylang query filter (raw SQL / `suppress_filters`)** → ES home shows English teasers. Mitigation: D5 verify step audits `inc/events.php`/`inc/blog.php` before relying on auto-filtering.
- **Polylang admin steps aren't fully scriptable** → some setup (URL modifications, static-front-page-per-language, menu-language assignment) may need a documented manual pass even with `bin/seed.php`. Mitigation: README runbook; seed does everything the `pll_*` API allows and logs what remains manual.
- **String translations drift** as editors change English copy → registered strings need Spanish re-entry. Accepted; standard Polylang behavior, documented.
- **Vue island label translation** adds PHP→prop plumbing for chrome strings. Mitigation: only the finite set of chrome labels needs it; nav goes through menus, not props.
- **SPA nav across languages** — removing the stand-down assumes all in-page links are language-correct (Polylang rewrites them). Verify the fetch-swap preserves the `/es/` prefix; if a link is language-agnostic it would swap English content. Low risk since Polylang filters link URLs.

## Migration Plan

1. Enable pretty permalinks. 2. Configure Polylang languages (EN default, ES) + `/es/` URL modifications. 3. Land the theme code (i18n context, toggle, chrome/menu translation, GTranslate removal) — additive/behind real content, English site unchanged. 4. Run `bin/seed.php` to create the ES front page, ACF copy, menus, string translations, and teaser translations. 5. Verify `/es/` renders Spanish end-to-end via the toggle. Rollback: the English site is unaffected by the presence of an ES page; to fully revert, restore `inc/translation.php`/`translation.ts` from git and remove ES content — but there is no reason to keep GTranslate.

## Open Questions

1. Which Polylang setup steps must stay manual vs scriptable in `bin/seed.php`? (verify `pll_*` admin API coverage for URL mods + static-front-page-per-language)
2. Do `rgvdsa_events_front_page_context()` / `rgvdsa_blog_front_page_context()` use Polylang-filtered `WP_Query`, or a raw path that needs language handling added?
3. Seed ES translations for which exact teased posts/events — a fixed demo set, or whatever is currently featured?
4. Keep the now-inert `notranslate` classes, or strip them in this change?
5. Retire `src/composables/useLanguagePreference.ts` entirely, or keep it for a non-language use?
