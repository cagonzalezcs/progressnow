## Why

The approved design moved from the v3 red/orange brand to the v4 "Progress Now" system (Claude Design canvas *Progress Now Home v4 Canvas*, project `a41d45d4-…`). Every page depends on the same tokens, fonts, band tones, photo treatment and header/footer, so those must land first — as one change — before any page can be brought to v4. This is change 1 of 5 (`progress-now-v4-foundation-chrome` → `-home` → `-blog` → `-events` → `-interior-404`).

## What Changes

- **Tokens:** v4 blue palette on role-named tokens (`brand #1848D8`, `accent #0E62E6`, `brand-deep #0F2E9C`, `brand-light #A9C7FF`, `alt #F2F5FB`, `ink #1B1B22`, `yellow #FFC800`, muted/line/control/border tokens), white page ground, shadcn `--radius` 4px. **BREAKING:** v3 color-named tokens become temporary aliases (deleted by the last v4 change).
- **Typography:** Public Sans (one variable woff2) replaces Manifold as `--font-sans`; Bowlby One and Special Season Brush stay. **BREAKING:** Manifold files removed.
- **Tones + high contrast:** `data-tone` vocabulary becomes `blue | white | alt | ink`; HC swaps and focus rings follow.
- **Photo treatment:** shared duotone wrapper (Vue + Twig) — grayscale + brand multiply — for every photo slot.
- **Artwork:** v4 set (blue CTA panel, light flame tile as mask, `currentColor` stars, neutral photo placeholders); v3-only files removed.
- **Header:** blue bar, wordmark lockup (diamond + Bowlby name) when no logo is uploaded, Bowlby nav + About ▾, white pill controls; mobile = Join pill + hamburger + in-header panel with nav, EN/ES and a text-size row (no drawer, no tablet tier).
- **Footer:** lockup + tagline (+ social icons when present), three columns, blue bottom bar.
- **Responsive baseline:** two layout tiers (mobile < `lg`, desktop ≥ `lg`) until tablet artboards land; no horizontal overflow 320–1920, 44px touch targets.
- **Styleguide** re-kitted to v4; shared-source drift test added.

## Capabilities

### New Capabilities
- `photo-treatment`: CSS duotone for photo slots (opacity per slot, HC variant, shell/app parity).

### Modified Capabilities
- `design-tokens`: v4 palette/radius, Public Sans, tone vocabulary + HC swaps, artwork set, responsive baseline; stale v1 SCSS requirements removed.
- `site-chrome`: header, mobile toggle and footer requirements rewritten for v4; wordmark lockup added.

## Impact

- Shared source (theme `src/` → copied to `site/app/`): `css/tailwind.css`, `components/site/{SiteHeader,SiteFooter,A11yWidget,LanguageToggle,Styleguide,styleguide/*}.vue`, new `DuotoneImage.vue`, `composables/useA11ySettings.ts`.
- Theme: `views/{base,html-header,page-styleguide}.twig`, new `views/partials/duotone.twig`, `inc/identity.php` (lockup defaults, `logoIsDefault`), preload list, `static/fonts/` (+public-sans, −manifold), `static/images/brand/` (+v4, −v3) and its README.
- Nuxt: `layouts/default.vue`, `site/test/unit/shared-source-drift.test.ts`, `site/README.md`.
- Every other page temporarily renders "v3 layout in v4 paint" through the aliases until its own change lands.
