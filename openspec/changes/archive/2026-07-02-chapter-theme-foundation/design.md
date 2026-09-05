# Design: chapter-theme-foundation

## Context

Theme `wp-content/themes/legacytheme/` is a Timber v2 (Twig) starter with Vite (`@kucrut/vite-for-wp`), SCSS, TypeScript, and webawesome v3 web components (button/input/dropdown imported per-component in `src/ts/app.ts`). Scaffolding exists but is empty: `StarterSite::register_post_types()`/`register_taxonomies()` are stubs; SCSS partials (`_global`, `_hero`, `_button`, header, `_home`) and `SiteHeader.ts` are 0 bytes; `index.php` references `front-page.twig`/`home.twig` which don't exist; header markup is default starter in `base.twig`. Local site https://chapter.test:8890, Vite dev :8891. No plugins (no ACF), no mu-plugins.

Reference design (a peer chapter site): red/black/cream, hero + about + events + get-involved sections, nav with JOIN button. Tokens: `#dd1111`, `#7c0909`, `#fff5e5`. Their stack (Neve + Otter) is NOT copied — structure/design only.

the chapter copy sources (old site archive + public info): tagline "A better world is possible"; mission "…funded and run democratically by its members that seeks to build a mass movement and transfer power from the ruling elite to the working class…"; McAllen/Edinburg TX; general meetings 2nd Friday 6pm Zoom; socials facebook.com/legacy, instagram/twitter legacy; join act.dsausa.org; newsletter via Action Network.

## Goals / Non-Goals

**Goals:**
- Content model: events + working groups CPTs with meta, editable in wp-admin without plugins
- Front page mirroring a peer chapter site section structure with generated regional copy
- Real header/footer shared across templates
- Progress Now design tokens as CSS custom properties, webawesome-compatible
- Seeded sample content so the front page renders meaningfully

**Non-Goals:**
- Campaigns/endorsements CPT (fits in working groups or posts for now)
- Admin-editable front-page copy (hardcoded Twig v1; settings page later)
- Barlow/Barlow Condensed fonts (keep wired Montserrat + Open Sans)
- Pixel-accurate styling, real media assets, events calendar integration

## Decisions

### D1: CPTs registered in theme, not mu-plugin
Use the existing `StarterSite::register_post_types()`/`register_taxonomies()` stubs (already hooked to `init`). No plugin infra exists; theme IS the product for a single-purpose chapter site. Portability tradeoff documented in code comment; later migration is copy-paste. *(User confirmed.)*

### D2: Content model
- `chapter_event`: supports title/editor/excerpt/thumbnail; `has_archive => 'events'`; `rewrite => ['slug' => 'events']`; `menu_icon => 'dashicons-calendar-alt'`; `show_in_rest => true`.
- `working_group`: same supports + `page-attributes` (menu_order controls grid order); archive/rewrite `working-groups`; `dashicons-groups`; `show_in_rest => true`.
- Taxonomy `event_type` (non-hierarchical, on `chapter_event`, `show_in_rest`): "General Meeting", "Chapter 101", "Action" — labels event cards.
- News/press = built-in Posts with a "Press Releases" category. No Campaigns CPT.

### D3: Meta without ACF
`register_post_meta()` (`single`, `show_in_rest`, sanitize callbacks) + one classic `add_meta_box()` per CPT (plain HTML inputs, nonce, `save_post_{type}` handler with capability + nonce checks). Classic boxes render fine under the block editor; zero JS build work. Fields:
- `chapter_event`: `event_date` (datetime-local, stored `Y-m-d\TH:i`), `event_location` (text), `event_link` (URL)
- `working_group`: `contact_email` (email), `meeting_schedule` (text)

Alternative rejected: ACF (new dependency), block-editor sidebar panels (JS build overhead for v1).

### D4: Front page data flow
`front-page.php` controller (wins template hierarchy; remove `is_home()` unshift in `index.php`):
- `upcoming_events`: `Timber::get_posts` on `chapter_event`, 3 posts, ordered by `event_date` meta ASC, meta_query `>= current_time('Y-m-d\TH:i')`
- `working_groups`: 6 posts by `menu_order` ASC
- renders `views/front-page.twig` extending `base.twig`; sections as `views/ui/` partials: `hero.twig`, `section-about.twig`, `section-events.twig`+`event-card.twig`, `section-involved.twig`+`group-card.twig`, `section-newsletter.twig`

Copy hardcoded in Twig *(user confirmed)*; shared URLs/blurbs centralized as `chapter` array in `add_to_context()` so header/footer/front page reuse them.

### D5: Design tokens + webawesome theming
`global/_global.scss` `:root`: `--color-red: #dd1111; --color-red-dark: #7c0909; --color-cream: #fff5e5; --color-black: #000; --color-white: #fff;` + spacing/max-width; map onto `--wa-color-brand-*`. Light reset, `body { background: var(--color-cream) }`, `.wrapper` (72rem, centered). `.btn` class for anchor CTAs (red fill, uppercase Montserrat); `wa-button` overrides for interactive controls. Newsletter CTA = styled external link to Action Network (no form v1).

### D6: Header/footer
`base.twig` header block: black bar, logo `static/images/logos/legacy-full-color.png` linked home, primary nav (`menu.twig`), `.btn` JOIN link, mobile toggle `<button aria-expanded aria-controls>`. `SiteHeader.ts`: toggle `aria-expanded` + `is-open` class; imported from `app.ts` (matches per-component convention). `footer.twig`: dark-red; mission one-liner, socials (inline SVG icons), newsletter link, footer menu, meeting blurb. `register_nav_menus`: `primary`, `footer`.

### D7: Media placeholders
No raster assets — decorative inline SVG (rose/star motifs) hand-rolled in Twig partials; solid-color blocks for card art.

### D8: Cleanup
Remove dead `theme_enqueue_styles()` (points at nonexistent `/dist/app.css`; `Vite\enqueue_asset` already injects CSS), demo context (`foo`/`stuff`/`notes`, `myfoo` filter), stray `components.json` (shadcn-vue/Tailwind, nothing installed). Add missing `@use` lines to `app.scss` (button/hero/site-header partials exist but never imported).

## Risks / Trade-offs

- [CPTs in theme: content types vanish on theme switch] → acceptable for single-purpose site; documented; mu-plugin move is trivial later
- [`event_date` stored as string meta; meta_query string compare] → `Y-m-d\TH:i` format sorts lexicographically = chronologically; fine at chapter scale
- [Hardcoded copy requires dev to edit] → deliberate v1 tradeoff; upgrade path = options page
- [Meta boxes vs block editor UX] → classic boxes appear below editor; acceptable, no build complexity
- [Rewrite rules stale after CPT registration] → flush once via `wp rewrite flush` or Permalinks save (task step)

## Migration Plan

Local-dev only, no deploy. Rollback = git revert; seeded content removable via wp-admin/wp-cli. Rewrite flush after CPT registration and again if reverted.

## Open Questions

None — CPT set, registration location, fonts, copy storage confirmed by user.
