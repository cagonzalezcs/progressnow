# site-chrome Specification

## Purpose
TBD - created by archiving change chapter-theme-foundation. Update Purpose after archive.
## Requirements

### Requirement: Site header
All templates SHALL render a sticky site header (via `base.twig` → `SiteHeader` island; `layouts/default.vue` in the Nuxt rendition) on a `#1848D8` bar (`data-tone="blue"`, shadow `0 2px 14px rgba(27,27,34,.22)`, `max-width:1320px` inner row, `min-height:76px`). From `lg` (1024px) it SHALL show, in one row: the wordmark lockup (or uploaded logo) linked home; the main nav in Bowlby One 1.06rem white — an About ▾ dropdown button (white radius-14 popover, 256px, `#1B1B22` 600 items with `#0F2E9C`/white hover) followed by the `primary` menu items (Calendar, Blog, Get Involved by default) with a radius-10 `rgba(27,27,34,.22)` hover pill and an underline on the current page; and a control cluster of white 42px pills with brand-blue text — the EN/ES language group, the Aa accessibility widget and a "Join Now" CTA linking to the chapter join URL — all inverting to `#0F2E9C`/white on hover. Below `lg` the header SHALL follow the *Mobile navigation toggle* requirement. Sticky behavior, About dropdown semantics, the Polylang switcher and the Aa widget behavior SHALL be unchanged.

#### Scenario: Header on every template
- **WHEN** a visitor loads the front page, a single event, or an archive at 1440px
- **THEN** the same blue header renders with lockup, About ▾, Calendar, Blog, Get Involved, EN/ES, Aa and Join Now

#### Scenario: v4 skin without behavior regressions
- **WHEN** a visitor uses the About dropdown, EN/ES toggle and Aa widget
- **THEN** each behaves exactly as before the re-skin (keyboard, focus, persistence)

### Requirement: Mobile navigation toggle
Below `lg` the header SHALL show the lockup, a white "Join" pill (44px tall) and a 44px hamburger `<button>` (2px `rgba(255,255,255,.6)` border, radius 12, `aria-label="Menu"`, `aria-expanded`, `aria-controls`). Activating it SHALL expand an **in-header panel** beneath the bar (same blue, 1px 25%-white top hairline) containing the flat nav (About, Calendar, Blog, Get Involved — Bowlby 1.05rem, 13px×12px padding, radius-10 hover/current pill), a hairline, and a row with the EN/ES group on the left and a text-size group on the right — three 44×44 buttons "A" / "A+" / "A++" (700, radius 10, 2px border `rgba(255,255,255,.5)`, active white background with brand text, `aria-pressed`) driving the same `textSize` setting as the desktop Aa widget. High-contrast and reduce-motion toggles SHALL NOT render on mobile (visitors zoom / use OS settings); the desktop Aa popover keeps them. Escape or a second activation SHALL close the panel and return focus to the button; a client navigation SHALL close it. No drawer, overlay, scroll lock or tablet two-tier strip SHALL render.

#### Scenario: Toggle opens nav
- **WHEN** a 390px visitor taps the hamburger
- **THEN** the panel expands in flow below the bar, `aria-expanded` flips to `true`, and the icon becomes ✕; tapping again or pressing Escape closes it and focus returns to the button

#### Scenario: Text size from the panel
- **WHEN** a visitor taps "A+" in the open panel
- **THEN** the root font size becomes 18px, the choice persists in `chapter-a11y`, and the desktop Aa widget shows the same selection on a wider viewport

#### Scenario: Panel closes on navigation
- **WHEN** a visitor taps "Calendar" in the open panel
- **THEN** the page navigates and the panel is closed on the destination

### Requirement: Site footer
All templates SHALL render the v4 footer: background `#1B1B22` (`data-tone="ink"`), inner `max-width:1320px`, grid `minmax(220px,1.1fr) repeat(3, minmax(170px,auto))` at `lg`, two columns at `md`, stacked below. Column one holds the wordmark lockup (or uploaded footer logo) and the chapter tagline (`chapter.footer_tagline`, `#C3CBE2`, 1rem, `max-width:30ch`) and, when the chapter has social profiles, the icon links beneath it. Three link columns (About / Get involved / Resources by default; WP `footer` menus override) SHALL use 700 1.15rem heads and white 500 1.06rem links with `#A9C7FF` underline hover. The bottom bar SHALL be `#1848D8` (`data-tone="blue"`) with the chapter name left and the accessibility invitation ("Built to be accessible — tell us how we can do better." linking `mailto:` the contact email when set) right, stacking below `md`.

#### Scenario: Footer content
- **WHEN** any page renders
- **THEN** the footer shows the lockup, tagline, three link columns and the blue bottom bar

#### Scenario: Data-driven columns and contact
- **WHEN** footer menus, tagline or contact email change in WordPress
- **THEN** the footer reflects them without template edits

### Requirement: Shared chapter context
`StarterSite::add_to_context()` SHALL expose a `chapter` array (join URL, Facebook/Instagram/Twitter URLs, newsletter URL, meeting blurb) consumed by header, footer, and front-page templates; nav locations `primary` and `footer` SHALL be registered. Demo starter context (`foo`, `stuff`, `notes`, `myfoo` filter) SHALL be removed.

#### Scenario: Single source for chapter URLs
- **WHEN** the join URL changes in `add_to_context()`
- **THEN** header, hero, and footer CTAs all reflect it without template edits

### Requirement: Language toggle is a Polylang language switcher
The header EN/ES toggle SHALL be a Polylang language switcher: each segment is an `<a>` linking to the current page's translation URL (or the target language's home when no translation exists), rendered from server-provided language data. The active language segment SHALL be marked `aria-current="true"`. All responsive header instances SHALL receive the same language props and stay consistent. The toggle SHALL NOT record a client language cookie or trigger any machine-translation bridge; navigation to the translated URL is the entire behavior. The EN/ES codes themselves remain untranslated.

#### Scenario: Flip to Spanish
- **WHEN** a visitor clicks the ES segment on the English front page
- **THEN** the browser navigates to `/es/` and the Spanish page loads

#### Scenario: Active state on Spanish page
- **WHEN** the Spanish page renders
- **THEN** the ES segment is styled active with `aria-current` and the EN segment links back to the English page

### Requirement: Header and footer chrome translate via Polylang
Header nav labels, the About dropdown, the mobile menu, the Join CTA label, and footer columns/tagline SHALL render in the active language — nav from per-language WP menus assigned in Polylang, and static labels from `pll__()`-registered strings passed as island props. Language-neutral tokens (brand name, county names, social handles) SHALL stay untranslated.

#### Scenario: Spanish chrome
- **WHEN** the Spanish front page renders
- **THEN** header nav labels, the Join CTA, and footer text render in Spanish while the EN/ES toggle segments and brand tokens stay literal

### Requirement: Wordmark lockup
When the chapter has not uploaded a header/footer logo (`identity.logo_*.is_default`), the header and footer SHALL render the v4 lockup: a decorative yellow (`#FFC800`) square rotated 45° (20px/radius 4 in the desktop header, 18px in the footer, 16px/radius 3 in the mobile header) followed by `identity.name` in Bowlby One uppercase white (1.35rem / 1.25rem / 1.1rem), the whole lockup being the home link labelled "<name> home". When a logo is uploaded the `<img>` SHALL render at the same box height (`width:auto`, `max-width:240px`) with `alt` = `identity.name`.

#### Scenario: Default lockup
- **WHEN** a fresh install renders any page
- **THEN** the header and footer show the diamond + "PROGRESS NOW" wordmark and no `<img>` logo

#### Scenario: Uploaded logo
- **WHEN** a chapter sets a header logo under Chapter Settings → Identity & brand
- **THEN** the header renders that image in place of the lockup at the same height
