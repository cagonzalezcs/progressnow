## Context

`progressnow_cache_remember()` keys every transient on `progressnow_content_ver`, and `inc/rebuild.php` listens to `progressnow/content_version_bumped` to schedule the Nuxt static rebuild through WP-Cron. The bump is therefore the single invalidation signal for REST transients, the PHP shell payloads, and the static site. Today it fires on `save_post_post`, `save_post_event`, `deleted_post` (unguarded — revisions and nav-menu items included), `edited_term` for the two category taxonomies, and `acf/save_post` for the options page. Pages (`inc/pages.php` ACF groups, per-section toggles), nav menus (`register_nav_menus` in `StarterSite.php`, read by `/site`), term creation/deletion, attachment alt text, and Polylang string translations do not bump. `inc/events.php` hard-codes `America/Chicago` in `progressnow_events_timezone()`, the gcal `ctz` parameter, and the ICS `X-WR-TIMEZONE` header. `progressnow_categories()` calls `get_terms()` for all languages and keeps the first term per canonical slug, so the label language is incidental; `GET /categories` has no `lang` argument and a single cache key, while `/site` (already language-keyed) embeds the same rows. PHPUnit runs on WorDBless without ACF Pro or Polylang; `tests/bootstrap.php` polyfills `get_field()` only, so every `pll_*` branch is untested in CI. Owner decisions: timezone source is the WordPress `timezone_string` setting; the project must be chapter-neutral for open-source release.

## Goals / Non-Goals

**Goals:**
- Any editor action that changes a public payload invalidates transients and schedules a rebuild, exactly once per request.
- No content-version churn from revisions, autosaves, auto-drafts, nav-menu-item posts, or Customizer autosaves.
- No built-in timezone; event display, calendar links, and ICS follow Settings → General → Timezone.
- `/categories` and `/site` return category labels in the requested language, cached per language.
- Language-dependent PHP paths run under PHPUnit.

**Non-Goals:**
- Pagination bounds, negative-cache suppression, date-window clamping, ICS body caching (`security-rest-cache-dos-hardening`).
- WP Super Cache page-cache purge policy and the rebuild transport/watchdog (`chapter-onboarding-and-build-ops`).
- Locale-aware date formatting and translated event strings (`chapter-locale-parity`).
- Granular per-payload invalidation; one global version remains the model.

## Decisions

- **Idempotent bump per request.** `progressnow_cache_bump_version()` keeps a static "bumped" flag; later calls in the same request are no-ops, and `progressnow/content_version_bumped` fires once. A `progressnow_cache_reset_bump_guard()` helper exists for tests only. Alternative — de-duplicate at the rebuild scheduler — rejected: the version option itself would still churn and every transient would be rebuilt twice.
- **Generic `save_post` with an allow-list, not per-type hooks.** One handler checks `in_array( $post->post_type, progressnow_cache_public_post_types(), true )` (filterable, default `post`, `event`, `page`), skips `wp_is_post_revision()`, `wp_is_post_autosave()`, and `auto-draft`, and runs at priority 20 so ACF's own `save_post` write (priority 10) has finished; the same guard wraps `deleted_post` (absorbing dos-hardening 4.2). Alternative — keep adding `save_post_{type}` lines — rejected: it is exactly how pages were missed. Trashing and untrashing go through `wp_update_post`, so `save_post` covers status transitions without a separate `transition_post_status` hook.
- **Terms: create, edit, delete for the two canonical taxonomies.** `created_term` and `delete_term` join the existing `edited_term` handler, all filtered to `category`/`event_category` (absorbing dos-hardening 4.1). Polylang term-translation linking fires `edited_term`, so it is covered.
- **Menus: contents and locations.** `wp_update_nav_menu` covers menu item edits (fires once per menu save, after items are written). Menu-location assignments live in `theme_mods_progressnow`, so `update_option_theme_mods_progressnow` bumps too; Customizer changeset autosaves do not touch that option until publish, so churn is limited to real publishes.
- **Attachments and Polylang strings.** `edit_attachment` (alt text, caption, title edits from the media modal) and Polylang's `pll_save_strings_translations` action both bump. Registering an action that never fires is harmless when Polylang is absent.
- **Timezone helper pair.** `progressnow_events_timezone()` returns `wp_timezone()`; new `progressnow_events_timezone_name()` returns `wp_timezone_string()` when it is an IANA identifier (contains `/` or equals `UTC`) and `''` otherwise. Gcal omits `ctz` and sends UTC `Ymd\THis\Z` dates when the name is empty; ICS omits `X-WR-TIMEZONE` (event `DTSTART`/`DTEND` are already emitted in UTC, so nothing else changes). Alternative — a Chapter Settings timezone field — rejected by the owner; WordPress already owns this setting and `wp_date()` honors it.
- **Language-aware categories without depending on `get_terms( lang )`.** `progressnow_categories( $taxonomy, $lang = '' )` still fetches all terms, then, when `$lang` is non-empty and `pll_get_term_language()` exists, prefers the term whose language equals `$lang` for each canonical slug (falling back to any term, then the registry label). Post-filtering keeps behavior identical under real Polylang and under the test stub, and does not rely on Polylang's query integration being active in REST context. Color resolution across the translation group is unchanged.
- **`/categories` threads `lang` like every other route.** Registers the shared `$lang_arg`, resolves via `progressnow_rest_resolve_lang()`, caches under `rest_categories_<md5 lang>`; `progressnow_payload_site( $lang )` passes its language to the helper. Nuxt `fetchCategories( apiBase, lang? )` uses `langParams()`; the categories fixture stays the English envelope, and a second Spanish assertion is added to `tests/test-rest.php` rather than a new fixture file.
- **Polylang stub for tests.** `tests/polylang-stub.php`, loaded by `bootstrap.php` only when `pll_current_language` is undefined, implements `pll_default_language` (`en`), `pll_languages_list` (`en`, `es`), `pll_current_language`, `pll_get_post_language`/`pll_set_post_language` (post meta `_progressnow_test_lang`), `pll_get_post` (meta map `_progressnow_test_translations`), `pll_get_term_language`/`pll_set_term_language` (term meta), `pll_get_term_translations`, `pll_home_url` (`/` or `/es/`), and identity `pll__`. It is deliberately minimal: enough for the cache, categories, payload, and REST paths, never a Polylang emulation.

## Risks / Trade-offs

- [Generic `save_post` at priority 20 fires for every public-type save, including bulk imports and the seed] → the per-request guard limits it to one bump; `bin/seed.php` already runs once and a single rebuild afterwards is the desired outcome.
- [`update_option_theme_mods_progressnow` fires for non-menu theme mods] → the theme stores nothing else there today; documented in the handler.
- [Existing sites with a UTC-offset timezone lose the gcal `ctz` hint] → times are still correct (UTC form); README/onboarding say to pick a city.
- [Post-filtering categories by language costs one `pll_get_term_language()` per term] → six canonical slugs × two languages, inside a language-keyed transient; negligible.
- [The Polylang stub could drift from real behavior] → it is limited to pure lookups backed by meta; anything richer must be tested against a real Polylang install (documented in the stub header).
- [Double bumps from `save_post` + `acf/save_post` on the options page] → the request guard makes them one.

## Migration Plan

1. Land `inc/cache.php` (guard + hooks) with tests; verify on the local site that editing About bumps the version once and the rebuild state moves to `requested`.
2. Land the timezone helpers; verify ICS output and a gcal link on a site set to a city and on one set to a UTC offset.
3. Land language-aware categories + `/categories?lang=` + Nuxt client parameter; regenerate contract fixtures if the envelope changes (it should not).
4. Trim `security-rest-cache-dos-hardening` to remove its invalidation section.

Rollback: each step is an isolated commit; reverting restores the previous hook set with no data migration.

## Open Questions

- Should `progressnow_cache_public_post_types()` include `attachment` so media-library metadata edits bump even when the attachment is unattached? (Default: no; `edit_attachment` covers alt text.)
- Do Customizer publishes of unrelated theme mods (none exist today) warrant a narrower hook once more mods are added?
