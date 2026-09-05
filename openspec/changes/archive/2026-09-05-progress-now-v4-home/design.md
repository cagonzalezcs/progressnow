## Context

Builds on `progress-now-v4-foundation-chrome` (tokens D1, duotone D4, artwork D9). Sources: `Progress Now Home v4.dc.html` (1440) and `Progress Now Home v4 Mobile.dc.html` (390) in `wp-content/themes/design_handoff_rgvdsa_vue/v4/`. Home data comes from `front:{lang}` + `site:{lang}` (hero/who ACF, events, blog teasers, identity) and every key is always set so empty states own the pre-seed render.

## Goals / Non-Goals

**Goals:** both renderers match the two artboards; all copy stays editor-owned per language; empty states preserved; no contract break beyond the additive `cta.line` and the removed `hero_headline_image`.
**Non-Goals:** other pages; new event/blog data; tablet-specific layout (pending canvas rework — two tiers).

## Decisions

### D1 — CTA line is a front-page ACF field
`cta_line` joins the front-page hero group (per language through the translated page pair, like `hero_*`), default `pll__('Progress now, not someday!')`, exposed as `front.cta.line`. Owner allows regrouping/renaming ACF fields, so the hero group may be split into `Hero` and `Closing CTA` groups for editor clarity. Uppercasing is CSS; the DOM keeps the editor's punctuation.

### D2 — Two CTA compositions by breakpoint
≥700px: brand section → flame tips band (`flames-tile-light.png` as a CSS mask painted `var(--color-brand-light)`, `height: clamp(120px,17vw,240px)`, `repeat-x`, bottom-aligned) → `--color-brand-light` band with `identity.cta_panel` (`max-width:1100px`) and an absolute overlay column (`padding-left:44%; padding-right:5%`) holding the brush line and the accent pill — text always over the panel's dark region. <700px: `--color-cta-card` radius-22 card with inset dashed yellow ring, inline two-tone star SVG, line at 2.1rem, pill. Mask instead of `<img>` so HC can recolor and the tile never needs a second color file.

### D3 — Headline is text only
Remove `hero_headline_image` (ACF field, `identity.php` resolver, `identitySchema`, fixtures, both templates' branches). `.hero-headline` becomes the v4 rule (Bowlby uppercase, `clamp(2.2rem,4.2vw,3.4rem)`, `0.09em` deep-blue shadow; 2rem on mobile). Fewer paths, and the v4 art direction is typographic.

### D4 — Event rows stay whole-row links
Row = `<a aria-label="View event: …">`, brand date tile, meta, visual outline pill at `md+`, inline "View event →" below. Mobile shows the date only in the meta (as drawn).

### D5 — Twig first, Vue ported 1:1
Write `front-page.twig` with the shared class recipes, then port to `RouteFront.vue` with identical literals (Tailwind scans both). Stars via `currentColor` + `text-brand-light`; photos via the duotone partial/component.

## Risks / Trade-offs

- [Overlay drifts off the panel on odd widths] → same 44 % inset the art was drawn for; screenshots at 700/900/1200/1440.
- [Editors relied on headline artwork] → none known (placeholder install); `hero_headline_text` is the path; note in the change summary.
- [Long ES copy in the hero column] → `max-width` in `ch`, `text-wrap:balance`; check ES fixture strings.

## Migration Plan

Additive `cta.line` first (PHP + schema + fixtures), then templates. Rollback = revert; the ACF field is harmless if left in the options table.

## Canvas re-pull (task 1.1, 2026-09-05)

- **Mobile hero: photo now comes FIRST** (`order:-1` on the 240px photo), then the copy column — applied (the spec's "column comes first" is superseded by the canvas).
- Dashed secondary CTA hover is now a solid `#0F2E9C` fill with a transparent border — applied.
- The canvas Home grew two sections the change spec explicitly excludes ("No counties strip, get-involved steps … SHALL render"): a **communities strip** (ink band, names separated by yellow ★) and a **"Get involved" ink section** (three `#26262F` cards + "Follow along" row). Not implemented here — owner call (see Open Questions).
- Desktop blog band has no "All posts" link on the canvas — dropped (the nav reaches the archive).
- A `Progress Now Home v4 Tablet` artboard (834px) exists; the home page keeps two tiers (spec non-goal); the foundation's tablet header covers the chrome.
- Preview aid: `site/nuxt.config.ts` serves the theme's `static/` under `/wp-content/themes/progressnow/static` in mock mode (`publicAssets`), so `NUXT_MOCK_API=1 nuxt dev` shows real fonts/brand art instead of 404s.
- Stars are inlined (`partials/star.twig` / `StarGlyph.vue`) — a `currentColor` SVG loaded via `<img>` paints black.

## Open Questions

- Communities strip + "Get involved" section now on the canvas Home: add them (new ACF: community names list; step cards from the Get Involved page fields?) in a follow-up change, or keep the spec's five sections?
