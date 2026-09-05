## ADDED Requirements

### Requirement: Shared stylesheet by drift test
`next-js/app/globals.css` SHALL be the theme's `src/css/tailwind.css` byte-for-byte after the same normalization the Nuxt drift test applies (font/asset URL prefix, app-only `@source` block); a unit test SHALL fail on any other difference. The theme file is the source of truth.

#### Scenario: Token edited in the theme only
- **WHEN** `--color-brand` changes in the theme stylesheet and the copy is not updated
- **THEN** the drift test fails naming the file

### Requirement: Shared contracts and category registry
`lib/schemas.ts` and `categories.json` SHALL be byte-identical copies of the theme's, guarded by drift tests; category colors SHALL come from the registry with `/site.categories` overriding at render.

#### Scenario: Registry drift
- **WHEN** a category slug is renamed in the theme's `categories.json`
- **THEN** the drift test fails until the copy is updated

### Requirement: Tailwind v4, CSS-first
Tailwind SHALL be v4 via `@tailwindcss/postcss` with configuration in CSS (`@theme`, `@custom-variant`, `@source`); there SHALL be no `tailwind.config.*`.

#### Scenario: No JS config
- **WHEN** the repository is searched for `tailwind.config`
- **THEN** no file exists under `next-js/`

### Requirement: shadcn/ui component set
UI primitives SHALL be shadcn/ui (`new-york`, `neutral` base, CSS variables, `lucide-react`) installed per component under `components/ui/`, only those the site components use; the shadcn semantic variables SHALL map to the shared tokens exactly as the theme's `:root` block does; Radix keyboard and ARIA behavior SHALL not be overridden.

#### Scenario: Unused component absent
- **WHEN** a shadcn component is not imported by any site component
- **THEN** it is not present in `components/ui/`

#### Scenario: Semantic variables resolve to tokens
- **WHEN** a shadcn `Button` renders with the default variant
- **THEN** its background computes to `--primary` from the shared stylesheet

### Requirement: Typography faces
Bowlby One, Public Sans (variable), and Special Season Brush SHALL load from `/wp-content/themes/progressnow/static/fonts/` on the app origin (same-origin proxy to the theme), with `font-display: swap`, `font-synthesis: none`, preload hints for the two primary faces, and no external font requests.

#### Scenario: No third-party fonts
- **WHEN** the front page loads
- **THEN** all font requests are same-origin and none target a third-party host

### Requirement: Tone bands and high contrast
Sections SHALL use `data-tone="blue|white|alt|ink"` bands from the shared stylesheet; the high-contrast setting SHALL apply the theme's token swaps with no component-specific overrides; focus indicators SHALL remain visible on every band (`--ring` per band).

#### Scenario: Focus visible on ink band
- **WHEN** high contrast is on and a link inside an `ink` band receives focus
- **THEN** the focus ring has at least 3:1 contrast against the band

### Requirement: Tokens only
Site components SHALL use role-named tokens (`brand`, `accent`, `alt`, `ink`, `--color-cat-*`) and the radius scale (20/14/999) through utilities; raw color literals and ad-hoc radii SHALL not appear in component source (lint rule).

#### Scenario: Hex literal rejected
- **WHEN** a component introduces `bg-[#1848d8]`
- **THEN** lint fails

### Requirement: Visual parity surface
The styleguide route SHALL render every site component and every used shadcn component in each tone band and a11y mode; the e2e suite SHALL capture per-section screenshots as review artifacts for parity review against the Nuxt rendition.

#### Scenario: Screenshot artifacts
- **WHEN** the e2e job runs
- **THEN** a screenshot per styleguide section is attached to the CI run

### Requirement: Client bundle budget
The first-load client JavaScript for the front page — every script the prerendered shell loads, gzipped — SHALL stay under a budget asserted in CI after `next build` (initial value 240 kB gzipped: the Next 16.3 / React 19.2 runtime with Cache Components measured ~173 kB before any app code on 2026-09-05, leaving ~67 kB for the app's islands; adjusted only by an explicit change to `budget.json`), keeping interactive islands thin.

#### Scenario: Budget exceeded
- **WHEN** a change pushes the front page's first-load JS over budget
- **THEN** the build check fails and reports the delta
