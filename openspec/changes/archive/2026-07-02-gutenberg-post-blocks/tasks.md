# Tasks: gutenberg-post-blocks

All theme paths relative to `wp-content/themes/legacytheme/`. Depends on `backend-consolidation` (kses, registry, tests).

## 1. Block registration

- [x] 1.1 New `inc/blocks.php` (required from `functions.php`): registration loop over `blocks/*/block.json` on `init`; `register_block_style('core/gallery', …)` for `essay` + `grid`; post template `[['core/paragraph']]`
- [x] 1.2 Create `blocks/{person-quote,video,audio,document,event-embed,action-callout}/block.json` (ACF mode preview) + minimal `render.php` each
- [x] 1.3 ACF field groups per custom block on `acf/init` (fields per design D1 table)
- [x] 1.4 `allowed_block_types_all` filter: `post` type → 8 core + 6 custom only
- [x] 1.5 Attachment `credit` ACF field
- [x] 1.6 Verify: new post inserter shows exactly 14 blocks; each custom block edits + previews in editor

## 2. Serialization

- [x] 2.1 `legacy_blog_blocks_from_content()` in `inc/blog.php`: `parse_blocks()` → contract map; prose coalescing via `render_block()` + `legacy_blog_kses_prose()`; `breakout` from align; gallery style from `className`; event embed resolves to `event|null`
- [x] 2.2 `legacy_blog_map_blocks()` → `has_blocks()` dispatcher (legacy ACF path retained)
- [x] 2.3 Featured image serializer reads attachment caption/`credit`
- [x] 2.4 Widen contract: `src/lib/posts.ts` `event_embed.event: ChapterEvent | null`; `BlockEventEmbed.vue` fallback card ("no longer scheduled" + calendar link)
- [x] 2.5 PHPUnit: per-block fixture markup → expected `PostBlock[]` (coalescing, breakout, grid style, nullable event, kses applied)
- [x] 2.6 Verify: author one post using every block type; front end renders identical to styleguide reference

## 3. Migration

- [x] 3.1 `bin/migrate-post-blocks.php` (`wp eval-file … [dry]`): skip `has_blocks()`, prose split by top-level tag (fallback `core/html`), custom layouts → ACF block comments, `serialize_blocks()` → `wp_update_post`, `_legacy_blocks_migrated` stamp, ACF meta retained
- [x] 3.2 Dry run; review printed markup per post
- [x] 3.3 Real run; open each migrated post in editor (no invalid-block warnings); visual parity check vs pre-migration screenshots
- [x] 3.4 Verify: `?s=` finds body text from a migrated post

## 4. Legacy removal (only after 3 verified)

- [x] 4.1 Delete ACF `post_blocks` flexible-content group registration + legacy branch in `legacy_blog_map_blocks()`
- [x] 4.2 Delete per-post `featured_caption`/`featured_credit` fields (per open question resolution)
- [x] 4.3 Update `bin/seed.php` to seed block markup posts
- [x] 4.4 Verify: full pass — `composer test`, `npm run typecheck`, `npm test`, reseed + browse blog/single/home
