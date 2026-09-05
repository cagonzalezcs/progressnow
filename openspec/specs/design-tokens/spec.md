# design-tokens Specification

## Purpose
TBD - created by archiving change chapter-theme-foundation. Update Purpose after archive.
## Requirements

### Requirement: Typography faces
The theme SHALL self-host the brand faces under `static/fonts/{bowlby-one,public-sans,special-season}/` with `@font-face` (`font-display: swap`) and expose them as `--font-display` (Bowlby One 400 — headings, page titles, nav links, pill buttons, month label, featured titles), `--font-sans` (Public Sans variable `font-weight: 400 800` — 500 default body, 600 ledes/hero subhead, 700 titles and emphasis, 800 eyebrows, arrow links and numerals) and `--font-brush` (Special Season Brush 400 — the closing CTA line, caps via CSS). `body` SHALL set `font-synthesis: none`. Manifold, Montserrat, Open Sans, Jost and Myriad Pro SHALL NOT ship. Pill buttons SHALL be `border-radius: 999px` in Bowlby One. Bowlby One and Public Sans SHALL be preloaded.

#### Scenario: Fonts load self-hosted
- **WHEN** any page loads
- **THEN** Bowlby One, Public Sans and Special Season Brush load from `static/fonts/` with no external font requests and no request for a Manifold file

#### Scenario: Body weight axis
- **WHEN** an element uses `font-semibold` or `font-extrabold`
- **THEN** Public Sans renders the 600 / 800 instance from the variable file, not a synthesized bold

### Requirement: High-contrast token swaps
High-contrast mode (Aa widget) SHALL swap `--color-brand`, `--color-accent` and `--primary` to `#0F2E9C` and `--color-brand-deep` to `#071B5E` via CSS custom-property overrides keyed off `html.a11y-contrast`, alongside per-band `data-tone` rules injected by `useA11ySettings.ts`: `white` and `alt` bands go `#FFFFFF`/`#000000`, `blue` bands go `#0F2E9C`, `ink` bands go `#000000`/`#FFFFFF`; the duotone photo overlay SHALL be removed (pure grayscale). No other tokens change. The tone vocabulary SHALL be exactly `blue | white | alt | ink`; `red`, `cream`, `orange`, `green` SHALL NOT appear as `data-tone` values.

#### Scenario: High contrast toggled
- **WHEN** a visitor enables high contrast
- **THEN** blue bands render `#0F2E9C`, accent links render `#0F2E9C` on white, alt bands turn white with black text, photos lose the blue overlay, and the choice persists via `chapter-a11y`

#### Scenario: Focus ring on dark tones
- **WHEN** a control inside a `blue` or `ink` band receives keyboard focus
- **THEN** the focus outline is white (3px, 2px offset); on `white`/`alt` bands it is ink

### Requirement: Artwork assets are SVG-first
Production artwork SHALL ship in `static/images/brand/` with semantic filenames: `cta-panel.svg` (the v4 blue panel, 1281×563, fills `#1848D8`/`#3E4480`/`#FFC800`/`#FFFFFF`), `star.svg`, `star-notch.svg`, `sparkle.svg` (fill `currentColor` so placement sets the color), `flames-tile-light.png` (2816×384, seamless `repeat-x`, consumed only as a CSS mask), `icon-twitter.svg` / `icon-instagram.svg` / `icon-facebook.svg`, `logo-square.svg`/`.png` and `share-default.jpg`. Photo placeholders (`hero-photo.jpg`, `who-photo.jpg`, `about-photo.jpg`) SHALL be neutral color photographs — the duotone is applied in CSS, never baked in. `logo-header.svg`, `logo-footer.svg`, `feature-art.svg`, `flames-tile.svg`, `flames-full.svg`, `hero-photo@2x.jpg` SHALL NOT ship. The brand README table SHALL list every file with its override field.

#### Scenario: Crisp assets
- **WHEN** the page renders on a high-DPI display
- **THEN** stars, panel and wordmark are vector-crisp; the flame band never upsamples past 1× (height ≤ 240px)

#### Scenario: Stars take their color from context
- **WHEN** `star.svg` is placed with `text-brand-light` on the hero and with `text-brand` on the who-we-are photo
- **THEN** it renders `#A9C7FF` and `#1848D8` respectively without a second file

### Requirement: Brand palette tokens (v4 values)
`src/css/tailwind.css` (mirrored byte-for-byte, font URLs aside, in `nuxt-js/app/assets/css/tailwind.css`) SHALL define the v4 palette on role-named tokens in a plain `@theme` block, consumable as Tailwind utilities: `--color-brand` `#1848D8`, `--color-brand-deep` `#0F2E9C`, `--color-accent` `#0E62E6`, `--color-brand-light` `#A9C7FF`, `--color-alt` `#F2F5FB`, `--color-ink` `#1B1B22`, `--color-yellow` `#FFC800`, `--color-muted` `#4A5568`, `--color-muted-on-ink` `#C3CBE2`, `--color-text-body` `#3A3F4E`, `--color-line` `#D9E1F2`, `--color-control` `#C6CFE4`, `--color-control-faint` `#E3E8F4`, `--color-border-muted` `#9DA9C4`, `--color-cta-card` `#3E4480`, `--color-ink-hairline` `#33333E`. The shadcn variables SHALL follow: `--background` `#FFFFFF`, `--foreground`/`--ring`/`--secondary` ink, `--primary` brand, `--accent` accent, `--muted` alt, `--border`/`--input` control, `--radius` `4px` (shadcn `sm/md/lg/xl` = 4/6/8/12px; brand pills stay `999px` and cards set their own 14–24px radii explicitly). The inline critical background in `views/html-header.twig` SHALL be `#FFFFFF`. No v3 color-named token (`brand-red`, `red`, `orange`, `green-dark`, `green-panel`, `flame`, `cream`, `off-white`, `pink`, `tint`, `wash`) SHALL remain once the change is complete.

#### Scenario: Utilities resolve to v4 values
- **WHEN** the stylesheet compiles
- **THEN** `bg-brand`, `text-accent`, `bg-alt`, `text-ink`, `border-control`, `bg-cta-card` resolve to the exact hex values above and `grep -rn "text-red\|bg-brand-red\|text-orange\|green-dark\|bg-cream" src nuxt-js/app views inc` returns nothing

#### Scenario: Page ground is white
- **WHEN** any page loads before Tailwind applies
- **THEN** the `html` background is `#FFFFFF` and stays `#FFFFFF` after hydration

### Requirement: Responsive baseline
Every public template SHALL render without horizontal overflow from 320px to 1920px, with all interactive controls at least 44×44 CSS px on touch layouts, fluid type via `clamp()` for display sizes, and images constrained by `max-width:100%`. Layout tiers SHALL be exactly two until tablet artboards exist on the canvas: mobile below `lg` (1024px) and desktop from `lg`; between 700px and 1024px content SHALL wrap gracefully (flex-wrap / single column) rather than shrink below the mobile sizes.

#### Scenario: No horizontal scroll
- **WHEN** any page renders at 320, 390, 768, 1024 and 1440px
- **THEN** `document.documentElement.scrollWidth` equals the viewport width and no element is clipped

#### Scenario: Touch targets
- **WHEN** the header, toolbars and pagination render below `lg`
- **THEN** every button and link target measures at least 44×44px
