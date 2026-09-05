# Design: gutenberg-post-blocks

## Context

Second of three changes (after `backend-consolidation`, before `rest-data-layer`). The 10 Vue block renderers and the `PostBlock` TS union stay as-is; only the authoring/storage side moves from ACF flexible content to `post_content` blocks. POC content volume is a handful of seeded posts.

## Goals / Non-Goals

**Goals:** block-editor authoring; body text in `post_content` (search, revisions); one less hand-synced contract copy; safe migration.

**Non-Goals:** changing island contracts (beyond nullable event embed), REST, page templates as blocks, editor JS build.

## Decisions

### D1: ACF blocks for the six customs
`block.json` with `"acf": { "mode": "preview", "renderTemplate": "render.php" }`; fields registered on `acf/init` next to existing groups. Rationale: ACF Pro stays regardless (options/events/sidebar), gives editor UI with zero `@wordpress/scripts` toolchain beside Vite, and attributes land in the block comment `data` — trivially readable by `parse_blocks()`. `render.php` matters only for editor preview + no-JS fallback; the front end renders via the Vue island from serialized contracts.

Block ↔ contract map:

| Contract | Editor block | Notes |
|---|---|---|
| `prose` | `core/paragraph`, `core/heading` (2–4), `core/list`(+item), `core/quote` | consecutive prose-class blocks coalesce into one `{type:'prose', html}` via `render_block()` + `rgvdsa_blog_kses_prose()` |
| `image` | `core/image` | `breakout: true` when `align` ∈ {wide, full}; `credit` from attachment ACF field |
| `pull_quote` | `core/pullquote` | `value`→`quote`, `citation`→`attribution` |
| `gallery` | `core/gallery` | `register_block_style` `essay` (default) / `grid`; serializer reads `is-style-grid` |
| `person_quote` | `rgvdsa/person-quote` | photo, quote, translation, name, role, lang |
| `video` | `rgvdsa/video` | url, poster, caption, transcript_url (core/embed lacks transcript — a11y contract requirement) |
| `audio` | `rgvdsa/audio` | file, title, duration, transcript file |
| `document` | `rgvdsa/document` | file, title, description (core/file lacks description) |
| `event_embed` | `rgvdsa/event-embed` | post_object → `event` CPT; serializes `event: null` when unpublished |
| `action_callout` | `rgvdsa/action-callout` | heading, body, buttons repeater (label/url/style) |

### D2: Allowlist + template
`allowed_block_types_all` filter: for `post_type === 'post'` return the 8 core + 6 custom; other types untouched. Post template `[ ['core/paragraph'] ]`, not locked. Featured caption/credit move to the attachment (`credit` ACF field on attachments; caption is native) so credit travels with the photo — the per-post `featured_caption`/`featured_credit` fields are deleted after migration.

### D3: Serializer + dispatcher
`rgvdsa_blog_blocks_from_content( WP_Post ): array` walks top-level `parse_blocks()` output through the map. `rgvdsa_blog_map_blocks( $post_id )` becomes: `has_blocks( $post )` → new parser; else legacy ACF path. Transitional by design — rollback of any migrated post (revert `post_content`) transparently reactivates the legacy path. Final task deletes legacy path + ACF `post_blocks` group registration.

### D4: Migration script
`bin/migrate-post-blocks.php` via `wp eval-file bin/migrate-post-blocks.php [dry]` (mirrors `bin/seed.php`):
- Skips posts where `has_blocks()` is already true (idempotent).
- Maps ACF rows → block arrays: prose HTML split by top-level tag into paragraph/heading/list blocks, unrecognized markup → `core/html`; custom layouts → ACF-block comments with `data` attrs.
- `serialize_blocks()` → `wp_update_post`; stamps `_rgvdsa_blocks_migrated`; **does not delete ACF meta** (rollback path).
- `dry` prints would-be markup per post. Volume is tiny — eyeball every post in the editor afterward.

### D5: Nullable event embed
Contract widens to `event: ChapterEvent | null`. PHP emits `null` for unpublished/deleted events (currently the block silently vanishes); `BlockEventEmbed.vue` renders a muted "This event is no longer scheduled" card linking to the calendar.

## Risks / Trade-offs

- [ACF-block preview UX rougher than native blocks] → acceptable; QA all 14 blocks before deleting the flexible-content group; native rebuild remains possible later without contract changes.
- [Prose splitting mis-parses odd wysiwyg markup] → `core/html` catch-all preserves fidelity; dry-run diff review per post.
- [Editors could rely on render.php markup diverging from Vue renderers] → render.php kept minimal, marked editor-preview-only.

## Migration Plan

1. Land blocks + serializer + dispatcher (legacy path intact) → author a NEW post per block type, verify render parity vs styleguide.
2. `dry` run, review; real run; editor re-save + visual check each migrated post.
3. Delete ACF `post_blocks` group + legacy path; update `bin/seed.php` to seed block markup.
Rollback: revert content (dispatcher falls back), or full git revert pre-step-3.

## Open Questions

1. Lock post template (`template_lock`) or leave free-form? (recommend free-form)
2. Delete per-post `featured_caption`/`featured_credit` in this change or defer?
