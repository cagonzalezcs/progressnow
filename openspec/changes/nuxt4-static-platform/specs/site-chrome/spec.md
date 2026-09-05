## ADDED Requirements

### Requirement: Chrome renders in the shell and in the app
The PHP shell SHALL render the header (logo link home, primary nav links, About items, Join CTA, EN/ES links) and the footer (logo, link columns, socials, contact, tagline, accessibility line) as plain crawlable HTML inside `#__nuxt`; the Nuxt app SHALL render the same chrome from the `site:{lang}` payload after takeover.

#### Scenario: Nav links crawlable
- **WHEN** any page is fetched without JavaScript
- **THEN** the header and footer navigation links are present as anchors in the HTML

## MODIFIED Requirements

### Requirement: Mobile navigation toggle
Below the mobile breakpoint the header SHALL collapse the nav behind a toggle `<button>` that manages `aria-expanded` and `aria-controls`, implemented in the Nuxt `SiteHeader` component.

#### Scenario: Toggle opens nav
- **WHEN** a mobile-width visitor taps the toggle
- **THEN** the nav becomes visible and `aria-expanded` flips to `true`; tapping again closes it

### Requirement: Shared chapter context
`StarterSite::add_to_context()` SHALL expose a `chapter` array (identity: name, short name, region label, logo/artwork/share-image URLs; join URL; Facebook/Instagram/Twitter URLs; newsletter URL; contact email; footer tagline; committees) consumed by header, footer, and front-page templates and serialized identically into the `/site` REST payload. Social and newsletter URLs SHALL default to empty (no regional accounts); the join URL defaults to the site’s own Get Involved page (`/get-involved/#join`). Nav locations `primary`, `about`, and the four footer locations SHALL be registered. Demo starter context (`foo`, `stuff`, `notes`, `myfoo` filter) SHALL be removed.

#### Scenario: Single source for chapter URLs
- **WHEN** the join URL changes in Chapter Settings
- **THEN** header, hero, footer CTAs, and the `/site` payload all reflect it without template edits

#### Scenario: No regional defaults
- **WHEN** Chapter Settings has no social URLs
- **THEN** the context carries empty social URLs and no regional account URL appears anywhere
