# front-page — delta for home-v3-brand-refresh

## MODIFIED Requirements

### Requirement: Front page template
The theme SHALL provide `front-page.php` rendering `views/front-page.twig` via Timber, containing in order: hero (v3 split), who-we-are, upcoming events, from-the-blog, Ponte Trucha CTA. The v2 counties strip and get-involved steps sections SHALL NOT render. Each band SHALL carry a `data-tone` attribute (`red`/`cream`/`ink`/`orange`/`green`) for high-contrast mode.

#### Scenario: Front page renders all sections
- **WHEN** a visitor loads the site root with a static front page configured
- **THEN** the five v3 sections render in order with no PHP/Twig errors, and no counties strip or get-involved steps section appears

### Requirement: Hero section
The hero SHALL be a 50/50 split (stacking under ~1000px). Left: `#DC1520` panel with a centered column — the supplied headline artwork rendered as an `<img>` inside the page's `<h1>` with alt text "A better Rio Grande Valley is possible!", a subhead, a JOIN DSA pill linking to the chapter join URL, and a dashed CTA box (2px dashed `#FFC800`, radius 16) linking to Get Involved — plus scattered star artwork (decorative, hidden from AT). Right: the designer's green-duotone hero photo, `object-fit: cover`, min-height 480px. The headline SHALL remain an image (no CSS recreation).

#### Scenario: Headline is accessible art
- **WHEN** the front page renders
- **THEN** the `<h1>` contains the supplied headline image with meaningful alt text, and star art is `aria-hidden`

#### Scenario: Join CTA
- **WHEN** a visitor clicks the hero JOIN DSA pill
- **THEN** they are taken to the DSA membership URL from chapter context

#### Scenario: Narrow viewport
- **WHEN** the viewport is under the stack breakpoint
- **THEN** the panel and photo stack vertically with the headline still legible

## ADDED Requirements

### Requirement: Who we are section (v3)
The who-we-are section SHALL be a two-column grid (county map ~1.15fr / text 1fr): left the supplied `county-map` artwork (stars baked in) representing the chapter's counties; right a right-aligned column with orange eyebrow, Bowlby One heading, body paragraphs, and a "MORE ABOUT OUR CHAPTER" arrow link. Copy SHALL come from the page's ACF fields per language (v3 prototype copy as defaults).

#### Scenario: Map replaces counties strip
- **WHEN** the front page renders
- **THEN** the county story appears via the map artwork in who-we-are; no standalone counties strip band exists

#### Scenario: Right-aligned text column
- **WHEN** the section renders at desktop width
- **THEN** eyebrow, heading, paragraphs, and arrow link are right-aligned beside the map

### Requirement: Ponte Trucha CTA
The front page SHALL end with a Ponte Trucha CTA: full-width flames artwork, with the luchador panel artwork overlaid anchored to its bottom (proportional geometry: `left/right: 3.2%`, `bottom: 4.1%`, panel `width: 100%`). Over the panel, an inset column (`padding-left: 44%`) SHALL show "¡Ponte trucha sigue la lucha!" in Special Season Brush uppercased via CSS `text-transform` (source text keeps `¡`/`!`), right-aligned, plus an orange JOIN DSA pill linking to the chapter join URL. The brush line SHALL render identically in both languages (it is Spanish brand copy). Below ~700px the text SHALL stack rather than shrink below readable size.

#### Scenario: Brush line preserved
- **WHEN** the CTA renders in either language
- **THEN** the line displays uppercase via CSS with `¡` and `!` intact in the DOM

#### Scenario: Composition scales
- **WHEN** the viewport width changes
- **THEN** flames, panel, and overlay scale proportionally with text clear of the luchador

### Requirement: Events empty state (v3)
When the home events query returns zero events in the active language, the section SHALL render the v3 empty state: 2px dashed `#B9B3A9` rounded container with centered "No events on the books yet" lead and a link to the calendar.

#### Scenario: Zero events
- **WHEN** no upcoming events exist in the active language
- **THEN** the dashed v3 empty state renders with a calendar link and no event rows

## REMOVED Requirements

### Requirement: Get involved grid
**Reason**: v3 removes the get-involved steps section from Home; its job moves to the Ponte Trucha CTA and header/footer links.
**Migration**: Section deleted from `front-page.twig`; `rgvdsa_front_involved` context/ACF stays for now (cleanup in interior-pages delta). Get Involved remains reachable via nav, hero dashed box, and CTA.

### Requirement: Newsletter and social CTA
**Reason**: v3 Home has no newsletter/social band; social links move to the footer as real icon links.
**Migration**: Footer (site-chrome) carries social icon links; newsletter link remains in footer columns.
