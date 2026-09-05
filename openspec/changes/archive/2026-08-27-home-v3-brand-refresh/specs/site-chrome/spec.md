# site-chrome — delta for home-v3-brand-refresh

## MODIFIED Requirements

### Requirement: Site header
All templates SHALL render a site header (via `base.twig`) containing the chapter logo linked home, the `primary` nav menu, and a prominent "Join" CTA button linking to the Progress Now membership URL. The header SHALL wear the v3 skin site-wide: background `#DC1520`, nav links in Bowlby One (~1.06rem) white, pill-shaped buttons (JOIN, Aa, EN/ES), and the v3 logo lockup (transparent SVG, ~78px tall, background set in CSS). Sticky behavior, About dropdown, EN/ES switcher, and Aa widget behavior SHALL be unchanged from v2.

#### Scenario: Header on every template
- **WHEN** a visitor loads the front page, a single event, or an archive
- **THEN** the same v3 header renders with logo, menu, and Join button

#### Scenario: v3 skin without behavior regressions
- **WHEN** a visitor uses the About dropdown, EN/ES toggle, and Aa widget on the v3 header
- **THEN** each behaves exactly as before the re-skin

### Requirement: Site footer
All templates SHALL render the v3 footer: background `#211E1E`, grid of v3 footer logo (~230px) plus About / Get involved / Resources link columns, social icon links top-right, column heads in Manifold Bold (~1.15rem), links in Manifold Medium (~1.06rem) white with `#FFC800` underline hover. Social icons SHALL be real icon components linking to the chapter's actual profiles (no placeholder image strip). The bottom bar SHALL be green `#5F813A` with the chapter name left and the accessibility invitation ("Built to be accessible — tell us how we can do better.") right. The `footer` menu/columns and contact email SHALL remain data-driven as today.

#### Scenario: Footer content
- **WHEN** any page renders
- **THEN** the v3 footer shows logo, link columns, working social icon links, and the green bottom bar

#### Scenario: No placeholder social strip
- **WHEN** the footer renders
- **THEN** each social icon is an individual link to a real chapter profile URL
