# Home v3 Brand Refresh

## Why

Designer delivered a v3 brand refresh (new palette, new type system, supplied artwork) applied so far to one screen: Home. The live theme still renders the v2 skin. Handoff is canonical in `design_handoff_rgvdsa_vue/06-V3-BRAND-REFRESH.md` + pixel-exact prototype `designs/RGV DSA Home v3.dc.html`; assets in `design_handoff_rgvdsa_vue/design-assets/` (SVGs canonical, fonts, duotone photo).

## What Changes

- **New v3 design tokens**: palette (`#DC1520` red — accessibility-darkened, do not revert to AI-file `#EB2028` — orange `#FF4100`, yellow `#FFC800`, greens `#719655`/`#5F813A`, creams, inks) and type stack (Bowlby One, Manifold DSA Heavy/Bold/DemiBold/Medium, Special Season Brush) replacing Montserrat/Open Sans on Home + shared chrome. High-contrast mode swaps red→`#B5121B`, green-dark→`#3F5A23` via existing `data-tone` band pattern.
- **Header re-skin** (`SiteHeader.vue`): bg `#DC1520`, Bowlby One nav, v3 logo lockup (SVG, recolored for adjusted red). Behavior unchanged.
- **Hero rework**: 50/50 split (stacks <~1000px); left red panel with supplied `hero-headline` art as `<h1>` image (meaningful alt), subhead, JOIN DSA pill, dashed `#FFC800` CTA box, scattered star art; right green-duotone `hero-photo` cover.
- **BREAKING (visual/IA): counties strip removed** — county story moves into the Who-we-are map.
- **Who we are rework**: 2-col map (`county-map` SVG) / right-aligned text column, orange eyebrow, Bowlby heading, arrow link.
- **Events band re-token**: cream `#F7F5F1`, red date chips, orange-outline Bowlby View-event pills; dashed empty state per v3 mock.
- **Blog section re-token**: v2 layout kept, radius 24, v3 chip colors, Manifold type.
- **BREAKING (visual/IA): Get-involved steps section removed** — replaced by new **Ponte Trucha CTA**: full-width `flames-full` art + `luchador-panel` overlay, Special Season Brush line (CSS-uppercased, keeps `¡`/`!`), orange JOIN DSA pill; proportional geometry.
- **Footer re-skin** (`SiteFooter.vue`): near-black `#211E1E`, v3 footer logo, `#FFC800` link hover, green `#5F813A` bottom bar, real social icon links (prototype's `social-icons.png` is placeholder — replace).
- **Asset pipeline**: v3 SVGs + fonts copied into theme `static/`; new `@font-face` set; prototype PNG rasters used only where no SVG equivalent (photo; luchador texture fallback if SVG export poor).
- Interior pages stay v2 for now (future delta), but shared header/footer go v3 site-wide per handoff.

## Capabilities

### New Capabilities

_None — all changes land in existing capabilities._

### Modified Capabilities

- `front-page`: hero requirement (headline-as-image, split layout, dashed CTA), counties-strip requirement removed, who-we-are map layout, events/blog v3 styling + empty state, get-involved grid + newsletter/social CTA requirements replaced by Ponte Trucha CTA.
- `design-tokens`: v3 palette + type tokens replace v2 brand tokens; high-contrast swap values; new font-face set.
- `site-chrome`: header/footer v3 re-skin (logo lockups, colors, type, footer columns/bottom bar, real social icon links). Nav/toggle/language behavior unchanged.

## Impact

- Theme: `src/css/tailwind.css` (tokens, font-faces), `views/front-page.twig`, `views/base.twig` (props), `src/components/site/SiteHeader.vue` / `SiteFooter.vue`, `src/composables/useA11ySettings.ts` (contrast swaps), `static/fonts/`, `static/images/`.
- Data plumbing (`inc/options.php`, `inc/events.php`, `inc/blog.php`) largely unchanged; ACF copy defaults for who-we-are/hero may need v3 copy updates; counties/get-involved context becomes unused on Home.
- Tests: existing island/twig tests referencing removed sections or v2 classes.
- Font licensing OK per handoff (Manifold = DSA brand face; Special Season/Bowlby from designer/OFL).
