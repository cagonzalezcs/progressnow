# site-chrome

## ADDED Requirements

### Requirement: Site header
All templates SHALL render a site header (via `base.twig`) containing the chapter logo linked home, the `primary` nav menu, and a prominent "Join DSA" CTA button linking to the DSA membership URL. The starter Timber header markup SHALL be replaced.

#### Scenario: Header on every template
- **WHEN** a visitor loads the front page, a single event, or an archive
- **THEN** the same header renders with logo, menu, and Join button

### Requirement: Mobile navigation toggle
Below the mobile breakpoint the header SHALL collapse the nav behind a toggle `<button>` that manages `aria-expanded` and `aria-controls`, implemented in `src/ts/components/SiteHeader.ts` and imported from `app.ts`.

#### Scenario: Toggle opens nav
- **WHEN** a mobile-width visitor taps the toggle
- **THEN** the nav becomes visible and `aria-expanded` flips to `true`; tapping again closes it

### Requirement: Site footer
All templates SHALL render a footer with the chapter mission one-liner, meeting info ("General meetings: 2nd Friday of each month, 6pm, on Zoom"), social links, newsletter link, and the `footer` menu when assigned.

#### Scenario: Footer content
- **WHEN** any page renders
- **THEN** the footer shows mission, meeting info, and social/newsletter links

### Requirement: Shared chapter context
`StarterSite::add_to_context()` SHALL expose a `chapter` array (join URL, Facebook/Instagram/Twitter URLs, newsletter URL, meeting blurb) consumed by header, footer, and front-page templates; nav locations `primary` and `footer` SHALL be registered. Demo starter context (`foo`, `stuff`, `notes`, `myfoo` filter) SHALL be removed.

#### Scenario: Single source for chapter URLs
- **WHEN** the join URL changes in `add_to_context()`
- **THEN** header, hero, and footer CTAs all reflect it without template edits
