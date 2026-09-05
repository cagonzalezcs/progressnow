# Proposal: backend-consolidation

## Why

The v2 blog/calendar build left the backend↔island integration with verified defects: the home "From the blog" section computes real posts in PHP but Twig unconditionally overwrites them with lorem fixtures (`views/front-page.twig:20-29` plain `{% set %}` + `cat_class`/`pill_class` key mismatch); the category palette is defined three times with divergent hex values (`src/lib/events.ts` says `#E9252E` where PHP says `#B01B22`); per-card serialization fires N+1 `get_field()` storms and re-reads the whole `post_blocks` flexible field per card for a word count; ACF WYSIWYG HTML reaches `v-html` with no `wp_kses`; calendar wiring breaks if the page slug changes; committees fixture is duplicated across two files; several pieces of content that editors should own are hardcoded; and the PHPUnit suite never runs (`phpunit.xml` matches `test-*.php`, the file is `TestTimberStarterTheme.php`).

This change consolidates and hardens the existing embedded-props integration before the Gutenberg migration (`gutenberg-post-blocks`) and REST layer (`rest-data-layer`) build on it.

## What Changes

- Add `categories.json` (theme root) as the single source for the six canonical category slugs/labels/colors; new `inc/categories.php` registry consumed by PHP, TS (Vite JSON import), and a Tailwind-token drift test. Delete `legacy_blog_canonical_palette()` and `legacy_events_palette()`. Guard canonical term slugs against rename via `wp_update_term_data`.
- Sanitize prose HTML at serialize time with a `wp_kses` allowlist (`legacy_blog_kses_prose()`).
- Precompute read minutes on save (`_legacy_read_minutes` meta); prime author/thumbnail caches in a shared query builder; add `inc/cache.php` transient helper with content-version invalidation.
- Fix home blog teasers: PHP always sets `blog_featured`/`blog_rows` (null/empty allowed), emits raw `cat` slug; Twig builds pill classes and renders an empty state.
- Dedupe committees fixture (blog defers to options); replace calendar magic-slug check with a page template; make hardcoded content editable (counties strip, posts-page lede, CoC/grievance section, footer contact email, hero copy); wire `EmailSubscribeStrip` to the existing `newsletter_url` option.
- Fix the test harness (`phpunit.xml` pattern/file rename) and add unit tests for the new behavior; update `bin/seed.php` for new fields.

Out of scope: Gutenberg block migration, REST endpoints, fixture stripping from islands (later changes).

## Capabilities

### New Capabilities
- `category-registry`: Single source of truth for canonical category slugs, labels, and colors across PHP, TS, and Tailwind, with term-slug rename protection.
- `content-performance`: Precomputed read time, primed caches, and a transient helper with version-bump invalidation.
- `chapter-editable-content`: Counties strip, posts-page lede, grievance section, footer contact email, hero copy, and newsletter URL editable in wp-admin.

### Modified Capabilities
- `front-page`: "From the blog" section renders real posts when they exist; designed empty state otherwise (spec delta from `chapter-theme-foundation`).

## Impact

- `inc/blog.php` — kses helper, teaser context always-set, committees dedup, read-minutes meta
- `inc/events.php` — palette removal, calendar page-template check
- New: `categories.json`, `inc/categories.php`, `inc/cache.php`, `page-templates/calendar.php`
- `inc/options.php` — counties repeater, hero group, grievance fields
- `src/lib/events.ts`, `src/css/tailwind.css` (checked, not changed), `views/front-page.twig`, `views/index.twig`, `views/page.twig`, `src/components/site/SiteFooter.vue`, `src/components/site/blog/EmailSubscribeStrip.vue`
- `phpunit.xml`, `tests/`, `bin/seed.php`
- Root `.gitignore` currently ignores `/openspec/` — flagged for user decision (proposals otherwise unversioned)
