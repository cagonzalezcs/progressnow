## MODIFIED Requirements

### Requirement: High-contrast token swaps
High-contrast mode (Aa widget) SHALL swap red (`--color-red`, `--color-brand-red`, `--primary`) to `#B5121B`, red hover/deep to `#8E0E15`, and `--color-green-dark` to `#3F5A23` (`--color-green-panel` and `--color-flame` are decorative and match baked-in artwork, so they do not swap) via CSS custom-property overrides keyed off the existing `html.a11y-contrast` root class, alongside the per-band `data-tone` rules (`cream` and `orange` bands go white/black; `red`, `ink`, `green` bands darken); no other tokens change.

#### Scenario: High contrast toggled
- **WHEN** a visitor enables high contrast
- **THEN** red bands/chips render `#B5121B` and green-dark surfaces `#3F5A23`, persisting via `chapter-a11y`

### Requirement: Artwork assets are SVG-first
Production artwork (neutral logo lockups, stars/sparkles, the neutral who-we-are artwork, flames, luchador panel) SHALL ship as SVGs in the theme's `static/images/brand/` with semantic filenames; the Nuxt app SHALL reference them by URL from the `/site` payload so one copy serves both the shell and the app. No regional artwork (county map, regional headline lockup, regional logo lockups) SHALL ship. Exceptions: the hero photo ships as the designer's duotone raster, and the luchador panel MAY fall back to the designer's 2x PNG if its spray texture rasterized poorly in SVG export. The header logo SHALL be transparent with the `#DC1520` background set in CSS. The prototype's `social-icons.png` SHALL NOT ship.

#### Scenario: Crisp assets
- **WHEN** the page renders on a high-DPI display
- **THEN** logos, stars, artwork, and flames are vector-crisp; only the photo (and possibly the luchador) are raster

#### Scenario: No regional artwork in the bundle
- **WHEN** the theme's `static/images/` and the generated `.output/public` are listed
- **THEN** no county map or regional headline/logo asset exists
