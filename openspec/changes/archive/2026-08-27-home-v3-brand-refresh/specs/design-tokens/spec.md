# design-tokens — delta for home-v3-brand-refresh

## ADDED Requirements

### Requirement: v3 brand palette tokens
`src/css/tailwind.css` SHALL define namespaced v3 color tokens consumable as Tailwind utilities: red `#DC1520` (primary; accessibility-adjusted from the AI file's `#EB2028` and SHALL NOT be reverted), orange `#FF4100`, yellow `#FFC800`, green `#719655`, green-dark `#5F813A`, cream `#F7F5F1`, cream-card `#F5F2EC`, ink `#231F20`, footer-ink `#211E1E`. v2 tokens SHALL remain untouched for interior pages. Orange SHALL NOT be used for small body text (contrast ~3.5:1 — large/bold uppercase only).

#### Scenario: v3 utilities available
- **WHEN** the stylesheet compiles
- **THEN** v3 color utilities resolve to the exact hex values above and v2-skinned interior pages are visually unchanged

#### Scenario: Red stays adjusted
- **WHEN** the header/hero render
- **THEN** the red is `#DC1520` (5.0:1 on white), not `#EB2028`

### Requirement: v3 typography faces
The theme SHALL self-host the v3 faces in `static/fonts/v3/` with `@font-face` (`font-display: swap`): Bowlby One 400 (section headings, all nav links and pill buttons), Manifold Heavy 800 (eyebrows/arrow links), Bold 700 (body emphasis, event titles), DemiBold 600 (hero subhead, dropdown items), Medium 500 (default body, footer links), Special Season Brush 400 (brush CTA line, caps only). Jost and Myriad Pro SHALL NOT ship in this change. Pill buttons SHALL be `border-radius: 999px` in Bowlby One.

#### Scenario: Fonts load self-hosted
- **WHEN** the front page loads
- **THEN** all v3 faces load from `static/fonts/v3/` with no external font requests

### Requirement: v3 high-contrast token swaps
High-contrast mode (Aa widget) SHALL swap v3 red to `#B5121B` and v3 green-dark to `#3F5A23` via CSS custom-property overrides keyed off the existing a11y root class and per-band `data-tone` attributes; no other v3 tokens change.

#### Scenario: High contrast toggled
- **WHEN** a visitor enables high contrast
- **THEN** red bands/chips render `#B5121B` and green-dark surfaces `#3F5A23`, persisting via `legacy-a11y`

### Requirement: v3 artwork assets are SVG-first
Production v3 artwork (logo lockups, hero headline, stars/sparkles, county map, flames, cta-figure panel) SHALL ship as SVGs in `static/images/v3/` with semantic filenames mapped from the designer's `design-assets/SVG/` exports. Exceptions: the hero photo ships as the designer's duotone raster, and the cta-figure panel MAY fall back to the designer's 2x PNG if its spray texture rasterized poorly in SVG export. The header logo SHALL be transparent with the `#DC1520` background set in CSS. The prototype's `social-icons.png` SHALL NOT ship.

#### Scenario: Crisp assets
- **WHEN** the page renders on a high-DPI display
- **THEN** logos, stars, map, flames, and headline are vector-crisp; only the photo (and possibly the cta-figure) are raster
