## MODIFIED Requirements

### Requirement: Front page template
The theme SHALL provide `front-page.php` rendering `views/front-page.twig` via Timber as the PHP shell, containing crawlable content for, in order: hero (v3 split), who-we-are, upcoming events, from-the-blog, Closing CTA CTA; the Nuxt front page SHALL render the designed sections in the same order. The v2 counties strip and get-involved steps sections SHALL NOT render. Each band SHALL carry a `data-tone` attribute (`red`/`cream`/`ink`/`orange`/`green`) for high-contrast mode.

#### Scenario: Front page renders all sections
- **WHEN** a visitor loads the site root with a static front page configured
- **THEN** the five v3 sections render in order with no PHP/Twig errors, and no counties strip or get-involved steps section appears

#### Scenario: Shell and app agree
- **WHEN** the front page shell is fetched without JavaScript and then loaded with JavaScript
- **THEN** both renditions present the same five sections with the same copy, events, and posts

### Requirement: Hero section
The hero SHALL be a 50/50 split (stacking under ~1000px). Left: `#DC1520` panel with a centered column — the page `<h1>` rendering the chapter headline (default: the text "A better world is possible!" in the display face with the layered green offset treatment, translatable; when Chapter Settings provides a hero headline image, that image renders inside the `<h1>` with the configured alt text) — a subhead, a JOIN pill linking to the chapter join URL, and a dashed CTA box (2px dashed `#FFC800`, radius 16) linking to Get Involved — plus scattered star artwork (decorative, hidden from AT). Right: the hero photo from Chapter Settings (default: the shipped duotone photo with a neutral alt), `object-fit: cover`, min-height 480px. No default headline or alt SHALL name a region.

#### Scenario: Headline is accessible
- **WHEN** the front page renders with no headline image configured
- **THEN** the `<h1>` contains the translatable text headline, and star art is `aria-hidden`

#### Scenario: Chapter headline art
- **WHEN** a hero headline image and alt are configured
- **THEN** the `<h1>` contains that image with that alt text

#### Scenario: Join CTA
- **WHEN** a visitor clicks the hero JOIN pill
- **THEN** they are taken to the join URL from chapter context

#### Scenario: Narrow viewport
- **WHEN** the viewport is under the stack breakpoint
- **THEN** the panel and photo stack vertically with the headline still legible

### Requirement: Who we are section (v3)
The who-we-are section SHALL be a two-column grid (artwork ~1.15fr / text 1fr): left the who-we-are artwork from Chapter Settings (default: the neutral in-repo `chapter-art.svg`; no county map ships); right a right-aligned column with orange eyebrow, Bowlby One heading, body paragraphs, and a "MORE ABOUT OUR CHAPTER" arrow link. Copy SHALL come from the page's ACF fields per language, with neutral defaults that reference the chapter through the identity accessor and never a region.

#### Scenario: Neutral artwork by default
- **WHEN** the front page renders with no who-we-are image configured
- **THEN** the neutral artwork appears and no county names are present in the DOM

#### Scenario: Right-aligned text column
- **WHEN** the section renders at desktop width
- **THEN** eyebrow, heading, paragraphs, and arrow link are right-aligned beside the artwork
