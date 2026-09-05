# Design: backend-consolidation

## Context

Theme `wp-content/themes/rgvdsatheme`: Timber v2 + Vue 3 islands + Vite. Data flow: `inc/*.php` domain files hook `rgvdsa/context/*` filters → serializers shape island contracts → Twig prints `data-props` JSON → `src/ts/islands.ts` mounts. This change is phase 1 of 3 (before `gutenberg-post-blocks` and `rest-data-layer`); it repairs defects in the current embedded-props architecture without changing it.

## Goals / Non-Goals

**Goals:** one category source of truth; sanitized prose; cheap list queries; home teasers wired; magic slug gone; editor-owned content; running test suite.

**Non-Goals:** REST endpoints, block-editor migration, island fixture stripping, SSR.

## Decisions

### D1: `categories.json` at theme root, not a PHP constant
Six entries `{ id, label, color }` (slugs `chapter/poled/mutual/labor/electoral/social`; colors = current PHP palette, `#B01B22` for chapter). PHP reads it in `inc/categories.php` (`rgvdsa_category_registry()` — static-cached `json_decode`; `rgvdsa_categories()` — merges term name + ACF term-meta `color` override, replacing the duplicated merge logic in `rgvdsa_post_categories()`/`rgvdsa_event_categories()`). TS: `src/lib/events.ts` replaces hand-typed `DEFAULT_CATEGORIES` with `import categories from "../../categories.json"` (Vite native). JSON is the only format both runtimes read without codegen.

### D2: Tailwind tokens checked, not generated
Tailwind v4 `@theme` can't import JSON. Keep `--color-cat-*` in `src/css/tailwind.css`; add a vitest test asserting each token equals the JSON color. Failing test on drift beats a codegen pipeline at this scale.

### D3: Slug-rename guard
`add_filter( 'wp_update_term_data', 'rgvdsa_guard_canonical_term_slugs', 10, 4 )`: if a term in `category`/`event_category` currently has a canonical slug, force the slug back. Removes the silent degrade-to-`chapter` failure mode of `rgvdsa_blog_post_cat()`.

### D4: kses at serialize time
`rgvdsa_blog_kses_prose( $html )`: `wp_kses` allowlist `p,h2,h3,h4,ul,ol,li,a[href|title|rel|target],strong,em,b,i,br,blockquote,cite,code,sub,sup,mark,s`. Applied in the prose branch of `rgvdsa_blog_map_blocks()` (raw meta untouched). Captions/quotes/labels: `wp_strip_all_tags` or `br`-only. Ships now — `BlockProse.vue` `v-html` is live today; also reused verbatim by the Gutenberg serializer later.

### D5: Read minutes precomputed
`add_action( 'save_post_post', 'rgvdsa_blog_store_read_minutes' )` → word count at 200 wpm → `_rgvdsa_read_minutes`. `rgvdsa_blog_read_minutes()` reads meta, computes only when absent. Pre-Gutenberg the hook counts `post_content` + ACF prose rows once at save; post-Gutenberg it's just `post_content`. Kills the per-card flexible-content load. (Open question: delete the manual `read_minutes` ACF override — it existed to dodge the expensive compute.)

### D6: Query builder + cache priming
Extract `rgvdsa_blog_posts_query( array $args ): WP_Query` (shared later by REST). After query: `update_post_author_caches( $query->posts )`, `update_post_thumbnail_cache( $query )`. WP_Query already primes meta/terms.

### D7: Transient helper
`inc/cache.php`: `rgvdsa_cache_remember( $key, $cb, $ttl = 900 )` keyed `rgvdsa_{$key}_{ver}`, `ver = get_option( 'rgvdsa_content_ver' )`. Bump on `save_post_post`, `save_post_event`, `deleted_post`, `edited_term` (both taxonomies), `acf/save_post` for options. Version bump is the real invalidation; TTL is backstop. Used by the calendar window now, REST later.

### D8: Teasers — classes move to Twig
`rgvdsa_blog_front_page_context()` drops the `empty( $query->posts )` early-return; always sets `blog_featured` (or null) / `blog_rows` (or []), emitting raw `cat` slug + `cat_label`. Twig builds `bg-cat-{{ cat }} text-white` (featured) / `text-cat-{{ cat }} border-cat-{{ cat }}` (rows) — deletes the class-in-PHP pattern that caused the `cat_class`/`pill_class` mismatch. Section renders "Posts coming soon" state when null.

### D9: Calendar page template
`page-templates/calendar.php` (`Template Name: Calendar`); `rgvdsa_events_calendar_context()` checks `is_page_template( 'page-templates/calendar.php' )` instead of `post_name === 'calendar'`. Editor-visible, slug-rename-proof. About/get-involved/styleguide Twig-name routing stays — that's template selection, not data wiring.

### D10: Editable content mapping
- Counties strip → Chapter Settings repeater `counties` (name only); context always sets it.
- Posts-page lede → reuse interior `lede` ACF field on the posts page; blog-archive context reads it (kills `views/index.twig:13` lorem).
- CoC/grievance in `page.twig` → interior group toggle `show_grievance` + wysiwyg; email from `chapter.contact_email`.
- Footer email → `contact_email` threaded into SiteFooter island props; empty hides link (kills `hello@example.org`).
- Hero copy → ACF group located on front page (`hero_heading`, `hero_lede`, CTA labels/urls); current copy seeded as content, not code default.
- `EmailSubscribeStrip` → accepts `newsletterUrl` prop from `chapter.newsletter_url`; submit redirects to Action Network (no custom endpoint).

### D11: Test harness fix
Rename `tests/TestTimberStarterTheme.php` → `tests/test-timber-starter-theme.php` (phpunit.xml matches `test-*.php`) and delete the stale `foo` assertion. `tests/bootstrap.php` gains a `get_field()`/`get_option`-backed polyfill (ACF Pro absent under WorDBless). Theme `wordpress/` dir is the WorDBless install (composer `wordpress-install-dir`), untracked — README note only.

## Risks / Trade-offs

- [Slug guard surprises an admin intentionally renaming] → guard only canonical slugs; behavior documented in field instructions.
- [kses strips markup an editor expected] → allowlist covers the styleguide's prose set; extend list deliberately, not reactively.
- [`rgvdsa_content_ver` bump on every save invalidates all transients] → chapter-scale; simplicity beats granularity.
- [Hero/counties as ACF fields adds admin surface] → matches existing Chapter Settings pattern; defaults seeded.

## Migration Plan

Additive + refactor; single revert rolls back. Reseed via updated `bin/seed.php`. No content-format changes.

## Open Questions

1. Un-ignore `/openspec/` in root `.gitignore`? (proposals unversioned otherwise)
2. Delete manual `read_minutes` ACF override field?
3. Move featured `caption`/`credit` to attachment fields now or in `gutenberg-post-blocks`?
