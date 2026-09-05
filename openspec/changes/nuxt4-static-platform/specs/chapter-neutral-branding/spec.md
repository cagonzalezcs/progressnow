## ADDED Requirements

### Requirement: No regional references on visible surfaces
No page, feed, head metadata, admin field label, seed content, or Polylang string — in English or Spanish — SHALL contain a reference to the the region, "regional", "the chapter", the `@chapterhandle`/`legacy` social handles, the `legacy` newsletter form, regional county names, or regional cities. Spanish translations SHALL be preserved as Spanish content with only the regional mentions rewritten.

### Requirement: No organization references on visible surfaces
The theme SHALL NOT relate to the the parent organization: no surface, asset, font name, link, or shipped file SHALL contain "Progress Now", "the parent organization", "democratic organizing/organizing" copy, YDSA, `dsausa.org` links, national-dues copy, or the rose mark. The palette, layout, typography faces, and organizing spirit (labor, mutual aid, political education, electoral, socials) SHALL be kept; the default organization name is "Progress Now".

#### Scenario: Organization tokens audited
- **WHEN** the brand-audit test scans the shipped files, seed (EN + ES), contexts, ICS feed, and structured data
- **THEN** no organization token is found and the identity defaults read "Progress Now"

#### Scenario: Join flows are self-contained
- **WHEN** a visitor uses the Join CTA, the Get Involved steps, or the footer join link on an unconfigured install
- **THEN** each points at the site's own Get Involved page and the label reads "Join us"

#### Scenario: Rendered surfaces audited in both languages
- **WHEN** the brand-audit test renders every template (front page, posts page, single post, calendar, single event, About, Get Involved, interior page, search, 404) and the ICS feed for `en` and `es`
- **THEN** no output contains any of the regional tokens, and the Spanish renders are still Spanish

#### Scenario: Seed content is neutral
- **WHEN** `bin/seed.php` runs on a fresh install
- **THEN** every seeded post, event, page, option, and string translation is free of regional tokens in both languages

#### Scenario: Editor-facing labels are neutral
- **WHEN** an editor opens Chapter Settings, a page, a post, or Polylang String Translations
- **THEN** no field label, instruction, or string group name mentions the region

### Requirement: Chapter identity is Chapter Settings data
Chapter Settings SHALL provide `chapter_name`, `chapter_short_name`, and `region_label`, exposed through one PHP accessor with neutral defaults ("Progress Now", "Progress Now", "our community"). Every surface that names the chapter — header logo `aria-label`/`alt`, footer bottom bar, footer organization name, ICS `PRODID` and `X-WR-CALNAME`, JSON-LD `Organization.name`, `og:site_name`, share `mailto:` subjects, default copy that mentions the chapter, and the Polylang string group — SHALL read from that accessor.

#### Scenario: Defaults render without configuration
- **WHEN** the identity fields are empty
- **THEN** every surface renders the neutral defaults and no surface renders empty

#### Scenario: Configured name flows everywhere
- **WHEN** an admin sets `chapter_name` to a new value and saves
- **THEN** the header aria-label, footer, ICS calendar name, JSON-LD organization, `og:site_name`, and share subjects all reflect it on the next render

### Requirement: Brand media are settings-driven with neutral defaults
Header logo, footer logo, who-we-are artwork, hero headline artwork (optional), and default share image SHALL be Chapter Settings media fields. Defaults SHALL be neutral in-repo assets: the hero headline defaults to real text ("A better world is possible!", translatable) styled in the display face; the who-we-are artwork defaults to a neutral SVG composed from the star brand elements; the logo lockups default to neutral "Progress Now" lockups with a star mark. The regional county map, the regional headline artwork, and any rose mark SHALL NOT ship.

#### Scenario: Neutral defaults ship
- **WHEN** no brand media is configured
- **THEN** the front page shows the text headline and the neutral artwork, and `static/images/brand/` contains no county map or regional headline file

#### Scenario: Chapter artwork overrides
- **WHEN** an admin uploads a hero headline image and a who-we-are image
- **THEN** the front page renders the uploaded images in place of the defaults, with the configured alt text

### Requirement: Socials and newsletter render only when configured
Facebook, Instagram, Twitter, and newsletter URLs SHALL default to empty. Footer social icons, the Get Involved channel cards for those networks, the JSON-LD `sameAs` entries, and the email subscribe strip SHALL render only when the corresponding URL is set.

#### Scenario: Unset socials are hidden
- **WHEN** no social URL is configured
- **THEN** the footer renders no social icon links and JSON-LD contains no `sameAs`

#### Scenario: Newsletter strip hidden when unset
- **WHEN** `newsletter_url` is empty
- **THEN** the subscribe strip does not render on the posts page or single posts

### Requirement: Database scrub migration
`bin/scrub-brand.sh` SHALL perform a serialization-safe search-and-replace of every known regional phrase (EN and ES) across posts, post meta, options, term meta, and Polylang string-translation posts; update `blogname`/`blogdescription` when they contain the old name; re-run the seed; and print an audit of any remaining matches. It SHALL be idempotent and SHALL NOT run without an explicit confirmation flag.

#### Scenario: Migration scrubs existing content
- **WHEN** the script runs against a database seeded with the previous content
- **THEN** the audit reports zero remaining matches and Spanish translations remain linked and Spanish

#### Scenario: Re-run is a no-op
- **WHEN** the script runs a second time
- **THEN** it reports no replacements and no duplicated content

### Requirement: ICS feed slug is neutral with a redirect
The events ICS feed SHALL be served at `/feed/chapter-events/`; requests to `/feed/progressnow-events/` SHALL respond with a 301 to the new feed.

#### Scenario: Old subscription URL still works
- **WHEN** a calendar client fetches `/feed/progressnow-events/`
- **THEN** it receives a 301 to `/feed/chapter-events/` and the new URL returns the ICS payload

### Requirement: Accessibility preferences key migration
The a11y widget SHALL persist to localStorage key `chapter-a11y`; on first load it SHALL migrate an existing `legacy-a11y` value and remove the old key.

#### Scenario: Existing visitor keeps settings
- **WHEN** a visitor with `legacy-a11y` stored loads the site
- **THEN** their contrast/motion settings apply unchanged and only `chapter-a11y` remains
