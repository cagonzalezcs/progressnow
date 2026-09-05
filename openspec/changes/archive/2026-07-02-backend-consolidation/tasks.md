# Tasks: backend-consolidation

All theme paths relative to `wp-content/themes/legacytheme/`.

## 1. Test harness (first — everything below adds tests)

- [x] 1.1 Rename `tests/TestTimberStarterTheme.php` → `tests/test-timber-starter-theme.php`; drop stale `foo` assertion
- [x] 1.2 `tests/bootstrap.php`: add `get_field()` polyfill (post meta / `get_option` backed) for WorDBless runs
- [x] 1.3 Verify: `composer test` runs and passes (suite actually executes)

## 2. Category registry

- [x] 2.1 Create `categories.json` (6 entries, colors = current PHP palette)
- [x] 2.2 New `inc/categories.php`: `legacy_category_registry()` (static-cached), `legacy_categories()` (term name + term-meta color merge); require from `functions.php`
- [x] 2.3 Replace `legacy_blog_canonical_palette()` / `legacy_events_palette()` callers (`legacy_post_categories`, `legacy_event_categories`, `legacy_blog_post_cat`, archive `?category=` validation) with registry; delete both
- [x] 2.4 Slug guard: `wp_update_term_data` filter forcing canonical slugs back on rename (both taxonomies)
- [x] 2.5 `src/lib/events.ts`: replace `DEFAULT_CATEGORIES` literals with `categories.json` import
- [x] 2.6 vitest drift test: `--color-cat-*` tokens in `src/css/tailwind.css` equal JSON colors (adds vitest to devDeps, `npm test` script)
- [x] 2.7 PHPUnit: registry merge logic + slug guard (rename attempt → slug preserved)
- [x] 2.8 Verify: `npm run typecheck`, `npm test`, `composer test` pass; blog/calendar chips unchanged visually

## 3. Sanitization

- [x] 3.1 `legacy_blog_kses_prose()` in `inc/blog.php` (allowlist per design D4); apply in prose branch of `legacy_blog_map_blocks()`
- [x] 3.2 `wp_strip_all_tags`/`br`-only pass on captions, quotes, attributions, callout fields (added `legacy_blog_kses_plain()`; applied to pull_quote/person_quote/image/gallery/video/action_callout fields; button urls `esc_url_raw`)
- [x] 3.3 PHPUnit: `<script>`/`onclick` stripped, allowlist tags survive (`tests/test-blog-sanitization.php`)
- [x] 3.4 Verify: `composer test` green (14 tests); prose block strips `<script>`/`onclick`/`<iframe>`, keeps allowlist; plaintext fields tag-stripped at serialize time

## 4. Performance

- [x] 4.1 `save_post_post` hook → `_legacy_read_minutes` meta; `legacy_blog_read_minutes()` reads meta, computes only when absent (self-heals: stores on compute; ACF override still wins)
- [x] 4.2 Extract `legacy_blog_posts_query( $args )` from `legacy_blog_archive_context()`; prime author + thumbnail caches after query; use in archive/single/front-page contexts
- [x] 4.3 New `inc/cache.php`: `legacy_cache_remember()` + `legacy_content_ver` bump hooks (`save_post_post`, `save_post_event`, `deleted_post`, `edited_term`, `acf/save_post` options); wrap calendar window query
- [x] 4.4 PHPUnit: read-minutes hook; cache helper invalidation on version bump (`tests/test-blog-performance.php`, 9 tests)
- [x] 4.5 Verify: chapter.test unreachable — covered by PHPUnit instead: archive context test asserts zero per-card `post_blocks` reads (the old storm); remaining per-card `get_field`s hit WP_Query-primed meta cache; author/thumbnail caches primed in the shared builder. Re-check with Query Monitor when the site is back up.

## 5. Front-page teasers

- [x] 5.1 `legacy_blog_front_page_context()`: drop empty-query early return; always set `blog_featured` (nullable) + `blog_rows` (array); emit raw `cat` + `cat_label`; delete `cat_class`
- [x] 5.2 `views/front-page.twig`: remove `{% set blog_featured/blog_rows %}` fixtures; literal `cat_featured_pill`/`cat_row_pill` maps (JIT-safe) build pill classes from raw `cat`; "Posts coming soon" empty state
- [x] 5.3 Verify: `tests/test-blog-front-page.php` — empty DB → `blog_featured` null + `blog_rows` []; seeded → raw `cat` slug emitted, no `cat_class`. Live browser QA deferred (chapter.test down)

## 6. Structural cleanups

- [x] 6.1 `legacy_blog_committees()` → delegate to `legacy_chapter_committees()`; deleted the duplicated 6-item fixture (options.php owns the single source)
- [x] 6.2 `page-templates/calendar.php` (Template Name: Calendar) renders `page-calendar.twig`; `legacy_events_calendar_context()` checks `is_page_template( 'page-templates/calendar.php' )`; seeder creates the Calendar page + assigns the template (`_wp_page_template` meta)
- [x] 6.3 Verify: php -l all changed files; `composer test` green (26). Slug-rename QA deferred (site down) — logic keys off template meta, not `post_name`

## 7. Editable content

- [x] 7.1 Chapter Settings `counties` repeater + `legacy_chapter_counties()`; front-page context always sets `counties`; `views/front-page.twig` loops it (fixture removed)
- [x] 7.2 Posts-page lede: `legacy_blog_archive_context()` reads interior `lede` on `page_for_posts`; `views/index.twig` uses `posts_page_lede` (lorem gone)
- [x] 7.3 Interior group `show_grievance` toggle + `grievance_body` wysiwyg; `views/page.twig` gates + renders from fields, email from `chapter.contact_email` (kills `hello@example.org`)
- [x] 7.4 `contactEmail` threaded into SiteFooter props (base.twig); `SiteFooter.vue` derives the a11y mailto, drops the hardcoded fixture email, hides the link when empty
- [x] 7.5 Front-page `Home hero` ACF group (`hero_heading`/`hero_lede`/CTA label+url ×2) + `legacy_front_hero()`; front-page.twig reads `hero.*`; copy seeded on the front page
- [x] 7.6 `EmailSubscribeStrip.vue` `newsletterUrl` prop → Action Network redirect on submit; threaded via `BlogArchive.vue` from `chapter.newsletter_url` (index.twig)
- [x] 7.7 `bin/seed.php`: counties, hero copy (guarded on page_on_front), posts-page lede (calendar template assignment done in §6)
- [x] 7.8 Verify: `composer test` (26), `npm run typecheck`, `npm test` (8), `eslint` all green; php -l clean. Live wp-admin QA deferred (site down)

## 8. Wrap-up

- [x] 8.1 README: added Testing section (WorDBless `wordpress/` = untracked test artifact, get_field polyfill) + Calendar-template note (deferred §6.2 doc) + refreshed inc/ domain table
- [x] 8.2 Flagged `.gitignore:56` `/openspec/` to user (open question — version proposals?); left ignored pending decision
- [x] 8.3 Verify: full pass green — `composer test` (26), `npm run typecheck`, `npm run lint`, `npm test` (8). Manual home/blog/calendar browser QA deferred (chapter.test down)
