## 1. Idempotent bump and complete hook set (`inc/cache.php`)

- [x] 1.1 Make `progressnow_cache_bump_version()` bump and fire `progressnow/content_version_bumped` at most once per request (static guard); add `progressnow_cache_reset_bump_guard()` for tests
- [x] 1.2 Add `progressnow_cache_public_post_types()` (filterable; default `post`, `event`, `page`) and a guarded `save_post` handler at priority 20 that skips revisions, autosaves, auto-drafts, and non-public types; remove the per-type `save_post_post`/`save_post_event` lines
- [x] 1.3 Guard `deleted_post` with the same allow-list
- [x] 1.4 Add `created_term` and `delete_term` handlers for `category`/`event_category` next to the existing `edited_term` one
- [x] 1.5 Add `wp_update_nav_menu` and `update_option_theme_mods_progressnow` handlers (menu contents + locations)
- [x] 1.6 Add `edit_attachment` and `pll_save_strings_translations` handlers
- [x] 1.7 Update the file header comment and `tests/test-blog-performance.php` hook re-registration block to the new hook set

## 2. Chapter timezone (`inc/events.php`)

- [x] 2.1 `progressnow_events_timezone()` returns `wp_timezone()`; add `progressnow_events_timezone_name()` returning `wp_timezone_string()` only when it is an IANA identifier
- [x] 2.2 Gcal link: use the name for `ctz` when present; otherwise omit `ctz` and emit UTC `Ymd\THis\Z` dates
- [x] 2.3 ICS: emit `X-WR-TIMEZONE` only when a name is present; update the VCALENDAR doc comment
- [x] 2.4 Grep `inc/`, `views/`, `src/`, `bin/` for any remaining IANA identifier; remove
- [x] 2.5 Theme README + `docs/` onboarding note: set Settings → General → Timezone to a city

## 3. Language-aware categories

- [x] 3.1 `progressnow_categories( $taxonomy, $lang = '' )` prefers the term in `$lang` per canonical slug via `pll_get_term_language()`; `progressnow_post_categories( $lang = '' )` passes it through
- [x] 3.2 `GET /categories`: register the shared `lang` arg, resolve with `progressnow_rest_resolve_lang()`, cache under `rest_categories_<md5 lang>`
- [x] 3.3 `progressnow_payload_site( $lang )` passes its language into the categories helper
- [x] 3.4 Nuxt `site/app/lib/api.ts`: `fetchCategories( apiBase, lang? )` using `langParams()`; mirror in the theme `src/` twin if present; keep the drift test green

## 4. Tests

- [x] 4.1 Add `tests/polylang-stub.php` (minimal `pll_*` lookups backed by post/term meta) and load it from `tests/bootstrap.php` when Polylang is absent
- [x] 4.2 Bump tests: page save bumps once; revision/autosave/auto-draft/`nav_menu_item` do not; `created_term`/`delete_term` bump; menu save and location change bump; attachment edit bumps; two hooks in one request → one increment and one action
- [x] 4.3 Rebuild test: page save moves rebuild state to `requested` at the new version (extend `tests/test-rebuild.php`)
- [x] 4.4 Timezone tests (`tests/test-events-timezone.php`): city zone → gcal `ctz` + ICS header; UTC offset → no `ctz`, `Z` dates, no header; DST boundary conversion
- [x] 4.5 REST tests: `/categories?lang=es` returns Spanish names and a distinct cache key from `/categories`; `/site?lang=es` categories match
- [x] 4.6 Regenerate contract fixtures with `PROGRESSNOW_WRITE_FIXTURES=1 vendor/bin/phpunit --filter TestContracts` only if the categories envelope changed; confirm `site` vitest fixtures still validate

## 5. Coordinate overlapping change

- [x] 5.1 Edit `openspec/changes/security-rest-cache-dos-hardening`: remove tasks 4.1–4.2, the "Cache invalidation covers terms and ignores noise" requirement, and the matching proposal/design bullets; add a pointer to `content-invalidation-completeness`

## 6. Verification

- [x] 6.1 `composer test` green except the pre-existing `test-shell.php:540` failure (owned by `shell-chrome-parity`); `npm test` in `site/` green
- [ ] 6.2 Local site: edit About → `GET /wp-json/progressnow/v1/pages/about` reflects it immediately; `progressnow_content_ver` incremented by one; rebuild state `requested`
- [ ] 6.3 Local site: save the primary menu → `/site` navigation fresh; create + delete a category → `/categories` fresh
- [ ] 6.4 Local site: switch Settings → Timezone to another city → calendar page, a gcal link, and `/feed/chapter-events/` reflect it
