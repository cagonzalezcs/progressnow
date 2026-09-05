# Tasks: chapter-theme-foundation

All theme paths relative to `wp-content/themes/legacytheme/`.

## 1. Cleanup & foundations

- [x] 1.1 `src/StarterSite.php`: remove `theme_enqueue_styles()` and its `add_action` (dead `/dist/app.css` enqueue; Vite handles CSS)
- [x] 1.2 `src/StarterSite.php`: remove demo context values `foo`/`stuff`/`notes`, `myfoo()` method, and its TwigFilter registration
- [x] 1.3 `src/StarterSite.php`: add `register_nav_menus(['primary' => 'Primary Menu', 'footer' => 'Footer Menu'])` in `theme_supports()`
- [x] 1.4 `src/StarterSite.php` `add_to_context()`: use `Timber::get_menu('primary')`, add `footer_menu`, add `chapter` array (join URL act.dsausa.org, facebook.com/legacy, instagram.com/legacy, twitter.com/legacy, Action Network newsletter URL, meeting blurb "General meetings: 2nd Friday of each month, 6pm, on Zoom")
- [x] 1.5 `index.php`: remove `$context['foo']` and the `is_home()` `front-page.twig` unshift
- [x] 1.6 Delete stray `components.json` (shadcn-vue/Tailwind, not installed)
- [x] 1.7 Verify: site renders at https://chapter.test:8890, no PHP notices, no app.css 404 in network tab

## 2. Post types, taxonomy, meta

- [x] 2.1 Fill `register_post_types()`: `chapter_event` (title/editor/excerpt/thumbnail; `has_archive => 'events'`; rewrite `events`; `dashicons-calendar-alt`; `show_in_rest`) and `working_group` (+ `page-attributes`; archive/rewrite `working-groups`; `dashicons-groups`; `show_in_rest`)
- [x] 2.2 Fill `register_taxonomies()`: `event_type` non-hierarchical on `chapter_event`, `show_in_rest`, rewrite `event-type`
- [x] 2.3 Add `register_post_meta()` on init: event `event_date`/`event_location`/`event_link`; group `contact_email`/`meeting_schedule` (single, show_in_rest, sanitize callbacks)
- [x] 2.4 Add meta boxes + nonce-verified `save_post_{type}` handlers (capability check; `sanitize_text_field`/`esc_url_raw`/`sanitize_email`)
- [x] 2.5 Flush rewrites (`wp rewrite flush` or Permalinks save)
- [x] 2.6 Verify: Events + Working Groups in admin, meta persists on save/reload, `/events/` and `/working-groups/` archives resolve

## 3. Design tokens & global styles

- [x] 3.1 `src/scss/global/_global.scss`: `:root` tokens (`--color-red: #dd1111`, `--color-red-dark: #7c0909`, `--color-cream: #fff5e5`, black/white, spacing/max-width), map onto `--wa-color-brand-*`; light reset; cream body; `.wrapper`
- [x] 3.2 `src/scss/ui/_button.scss`: `.btn` anchor class (red fill, uppercase Montserrat, hover) + `wa-button` brand overrides
- [x] 3.3 `src/scss/app.scss`: add missing `@use` lines (`ui/button`, `ui/hero`, `ui/header/site-header`)
- [x] 3.4 Verify: `npm run dev`, cream background + tokens visible via HMR, no sass errors

## 4. Header & footer

- [x] 4.1 Rewrite header block in `views/base.twig`: black bar, logo `static/images/logos/legacy-full-color.png` linked home, primary menu include, `.btn` Join link (`chapter.join_url`), mobile toggle button (`aria-expanded`/`aria-controls`); guard/remove starter `{% if title %}` h1
- [x] 4.2 `views/footer.twig`: dark-red footer — mission one-liner, social links (inline SVG icons), newsletter CTA, footer menu, meeting info
- [x] 4.3 `src/ts/components/SiteHeader.ts`: nav toggle (aria-expanded + `is-open` class); import from `src/ts/app.ts`
- [x] 4.4 Style header/nav in `src/scss/components/site-header/_header.scss` + `_menu.scss` (collapsed/expanded states, breakpoint ~768px)
- [x] 4.5 Verify: header/footer render on all templates; mobile toggle works at narrow width

## 5. Front page

- [x] 5.1 Create `front-page.php` controller: Timber context + `upcoming_events` (3 × `chapter_event`, `event_date` meta >= now, ASC) + `working_groups` (6 × `menu_order` ASC), render `front-page.twig`
- [x] 5.2 Create `views/front-page.twig` extending `base.twig`, composing `views/ui/` partials
- [x] 5.3 `views/ui/hero.twig`: headline "We're fighting for the the region we deserve.", tagline, Join CTA + events CTA, inline SVG rose/star motif
- [x] 5.4 `views/ui/section-about.twig`: mission paragraph, regional blurb, link to news
- [x] 5.5 `views/ui/section-events.twig` + `event-card.twig`: date/title/location/event_type/RSVP; empty-state with `/events/` link
- [x] 5.6 `views/ui/section-involved.twig` + `group-card.twig`: name/excerpt/placeholder block art
- [x] 5.7 `views/ui/section-newsletter.twig`: Action Network CTA + social inline SVG icons

## 6. Front-page styling

- [x] 6.1 `src/scss/ui/_hero.scss`: red/black hero, chunky uppercase Montserrat headline, responsive
- [x] 6.2 `src/scss/pages/_home.scss`: section rhythm, events/groups card grids (1px black borders / flat shadows), newsletter band; single column <768px
- [x] 6.3 Verify: front page approximates a peer chapter site look at desktop + mobile widths

## 7. Seed content & WP settings

- [x] 7.1 Create sample content via wp-cli (fallback: wp-admin): 2–3 events with `event_date`/location/link meta + `event_type` terms; 4 working groups (Immigrant Rights, Electoral, Political Education, Communications) with excerpts + menu_order
- [x] 7.2 Create "Home" page; set Settings → Reading static front page (`show_on_front`/`page_on_front`)
- [x] 7.3 Create Primary menu (Home, News, Events archive, Get Involved archive, Newsletter external) + assign location; flush rewrites
- [x] 7.4 Verify: front page shows seeded events/groups

## 8. End-to-end verification

- [x] 8.1 Browse https://chapter.test:8890: all 5 front-page sections render; event ordering soonest-first, past events excluded
- [x] 8.2 Archives + singles for both CPTs resolve; 404/search unaffected
- [x] 8.3 `npm run lint`, `npm run stylelint`, `npm run typecheck`, `npm run build` all pass
- [x] 8.4 HMR sanity: edit `_hero.scss`, live update via :8891
