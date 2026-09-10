## Why

Editors' page, menu, and taxonomy edits never reach visitors on time: `inc/cache.php` bumps `progressnow_content_ver` only on post/event saves, `edited_term`, and Chapter Settings saves, so About / Get Involved / Calendar page edits, nav-menu changes, new or deleted categories, attachment alt-text edits, and Polylang string translations sit behind 900-second transients and — because the static rebuild is dispatched from that same bump — never trigger a Nuxt rebuild at all. Two chapter-specific defaults also survive in the same code paths: `America/Chicago` is hard-coded for event display, Google Calendar links, and the ICS feed, and `GET /categories` ignores `lang` with an unkeyed cache. These are the cheapest fixes that unblock the static cutover and the open-source release.

## What Changes

- **Complete write-path coverage.** Every editor write that changes a public payload bumps the content version: `save_post`/`deleted_post` for the public post types (`post`, `event`, `page`) with revisions, autosaves, and auto-drafts excluded; `created_term`/`edited_term`/`delete_term` for `category` and `event_category`; `wp_update_nav_menu` and menu-location changes; ACF Chapter Settings saves; attachment edits (alt text); Polylang string-translation saves.
- **One bump per request.** `progressnow_cache_bump_version()` becomes idempotent within a request so a single save that fires several hooks increments the version once and dispatches one rebuild.
- **Chapter timezone from WordPress settings.** `progressnow_events_timezone()` returns `wp_timezone()`; Google Calendar `ctz` and ICS `X-WR-TIMEZONE` use `wp_timezone_string()`, omitted when the site uses a UTC offset instead of an IANA zone.
- **Language-aware categories.** `progressnow_categories()` accepts a language and returns the term names of that language; `GET /categories` gains the `lang` argument, its cache is keyed by language, `/site` passes its language through, and the Nuxt client's `fetchCategories()` accepts `lang`.
- **Testable Polylang paths.** `tests/bootstrap.php` loads a minimal Polylang function stub so language-keyed cache and category behavior run under PHPUnit.
- **Absorbs** the invalidation section of `security-rest-cache-dos-hardening` (its tasks 4.1–4.2 and the "Cache invalidation covers terms and ignores noise" requirement move here; that change keeps pagination bounds, negative-cache suppression, date-window clamps, and ICS caching).

## Capabilities

### New Capabilities
- `chapter-timezone`: event times, calendar links, and feeds use the WordPress timezone setting, never a built-in zone.

### Modified Capabilities
- `content-performance`: "Version-invalidated transients" now names the complete set of write paths and requires one bump per request; new requirements for noise exclusion and rebuild dispatch.
- `rest-api`: "Public read endpoints" — `/categories` accepts `lang` and is cached per language.

## Impact

- **Theme PHP:** `inc/cache.php` (hooks, idempotent bump), `inc/events.php` (timezone helper, gcal `ctz`, ICS header), `inc/categories.php` + `inc/blog.php` (`$lang` parameter), `inc/rest.php` (`/categories` args + cache key), `inc/payloads.php` (`/site` passes lang).
- **Tests:** `tests/bootstrap.php` + new `tests/polylang-stub.php`; new/extended cases in `tests/test-blog-performance.php`, `tests/test-rest.php`, a new `tests/test-events-timezone.php`; contract fixtures regenerated if the categories envelope changes.
- **Nuxt:** `site/app/lib/api.ts` `fetchCategories(apiBase, lang?)`; theme `src/` twin if present.
- **Docs:** theme README + onboarding note: set Settings → General → Timezone to a city, not an offset.
- **Behavior:** identical responses; editors see page/menu/term edits within one request, and each such edit schedules a static rebuild. No API contract break (`lang` is optional).
- **Coordination:** `security-rest-cache-dos-hardening` proposal/design/tasks/spec trimmed to point here.
