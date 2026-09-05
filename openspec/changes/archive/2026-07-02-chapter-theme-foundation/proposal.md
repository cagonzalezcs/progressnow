# Proposal: chapter-theme-foundation

## Why

RGV DSA's old website (dsargv.org) is dead and the chapter has no web presence beyond social media. The repo's custom Timber + Vite theme (`rgvdsatheme`) has build tooling in place but no substance: no post types, no front page, default starter header. This change builds the theme foundation, mimicking NYC DSA (socialists.nyc) in content structure and design style.

## What Changes

- Register two custom post types in the theme: `chapter_event` (events) and `working_group` (working groups), plus an `event_type` taxonomy.
- Add native post meta (no ACF): event date/location/link; working-group contact email/meeting schedule — via `register_post_meta` + classic meta boxes.
- Create a front page (`front-page.php` + `views/front-page.twig` + `views/ui/` partials) mirroring socialists.nyc sections: hero, about/mission, upcoming events, get-involved grid, newsletter/social CTA. Copy hardcoded in Twig (generated from public RGV DSA info); media as inline SVG/CSS placeholders.
- Replace starter header with real site header (logo, primary menu, JOIN CTA, mobile toggle) and build footer (mission, socials, newsletter, meeting info).
- Establish DSA design tokens as CSS custom properties (red `#dd1111`, dark red `#7c0909`, cream `#fff5e5`, black/white), mapped onto webawesome `--wa-*` vars.
- Cleanup: remove dead `theme_enqueue_styles()`, demo Timber context values, stray `components.json`.
- Seed sample content (events, working groups, home page, menu) via wp-cli or wp-admin.

Out of scope: Campaigns CPT, admin-editable front-page copy, Barlow font swap, styling polish.

## Capabilities

### New Capabilities
- `chapter-content-model`: Custom post types, taxonomy, and post meta for chapter events and working groups.
- `front-page`: Front-page template with hero, about, upcoming events, get-involved, and newsletter sections driven by Timber context.
- `site-chrome`: Site header (logo, nav, JOIN CTA, mobile toggle) and footer (mission, socials, meeting info) shared across all templates.
- `design-tokens`: DSA brand CSS custom properties, global styles, and button system integrated with webawesome theming.

### Modified Capabilities

None — no existing specs in `openspec/specs/`.

## Impact

- `wp-content/themes/rgvdsatheme/src/StarterSite.php` — CPTs, taxonomy, meta, context, nav menus, cleanup
- New: `front-page.php`, `views/front-page.twig`, `views/ui/*.twig`
- `views/base.twig`, `views/footer.twig` — header/footer rewrite
- SCSS: `global/_global.scss`, `ui/_button.scss`, `ui/_hero.scss`, `pages/_home.scss`, `app.scss` manifest
- TS: `src/ts/components/SiteHeader.ts`, `src/ts/app.ts`
- Delete: `components.json`
- WP database: seeded sample content, front-page reading setting, primary menu (local dev)
