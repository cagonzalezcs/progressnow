# Proposal: gutenberg-post-blocks

## Why

Post bodies currently live in an ACF flexible-content field (`post_blocks`), not `post_content`. Consequences: native WP search (`?s=`) cannot see any body text; authoring happens in a meta box stack below an unused editor; content, revisions, and exports bypass WP's canonical storage; and the 10-layout ACF group is a third hand-synced copy of the block contract (ACF PHP ↔ serializer ↔ TS types). The chapter decided (2026-07-02) to migrate authoring to native Gutenberg blocks mapped onto the existing `PostBlock` island contracts, keeping the Vue renderers untouched.

## What Changes

- Register six ACF blocks (`rgvdsa/person-quote`, `video`, `audio`, `document`, `event-embed`, `action-callout`) via `blocks/*/block.json` + `render.php` — no second JS toolchain.
- Map core blocks onto the remaining contracts: paragraph/heading/list/quote → `prose` (coalesced), `core/image` → `image` (wide/full align = `breakout`, credit from new attachment field), `core/pullquote` → `pull_quote`, `core/gallery` (+ `essay`/`grid` block styles) → `gallery`.
- Restrict the `post` inserter to exactly these 14 blocks (`allowed_block_types_all`); other post types unchanged. Dek/byline/committee/meta-rail stay as the existing ACF sidebar group.
- New serializer `rgvdsa_blog_blocks_from_content()` (`parse_blocks` → `PostBlock[]`); `rgvdsa_blog_map_blocks()` becomes a `has_blocks()` dispatcher retaining the legacy ACF path until migration is verified.
- Migration script `bin/migrate-post-blocks.php` (WP-CLI `eval-file`, dry mode, idempotent, ACF meta retained for rollback).
- Contract change: `event_embed.event` becomes nullable; `BlockEventEmbed.vue` renders a "no longer scheduled" fallback card.
- After verification: delete the ACF `post_blocks` group and legacy serializer path.

Out of scope: REST endpoints (next change), page/event editor changes, block-based themes.

## Capabilities

### New Capabilities
- `post-authoring`: Posts authored in the block editor with a restricted, contract-complete block set.
- `block-serialization`: `post_content` blocks serialize to the existing `PostBlock` island contracts, including sanitization and nullable event embeds.
- `content-migration`: Existing ACF-block posts convert to block markup idempotently with rollback.

### Modified Capabilities

None (island contracts unchanged except the additive nullable `event_embed.event`).

## Impact

- New: `blocks/{person-quote,video,audio,document,event-embed,action-callout}/{block.json,render.php}`, `inc/blocks.php`, `bin/migrate-post-blocks.php`
- `inc/blog.php` — new parser, dispatcher, prose coalescer (reuses `rgvdsa_blog_kses_prose()` from `backend-consolidation`); later deletes `post_blocks` group + legacy path
- ACF: new `credit` field on attachments; featured caption/credit sourced from attachment
- `src/lib/posts.ts` (nullable event in `event_embed`), `src/components/site/blog/blocks/BlockEventEmbed.vue`
- Depends on: `backend-consolidation` (kses helper, category registry, test harness)
- Payoff: `?s=` and the future REST `s` param search full body text natively
