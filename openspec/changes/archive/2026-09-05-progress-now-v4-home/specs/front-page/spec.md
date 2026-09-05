## ADDED Requirements

### Requirement: Who we are section (v4)
The who-we-are section SHALL be a white band (`data-tone="white"`, `#about`) with a `minmax(320px,1.15fr) minmax(300px,1fr)` grid from `md`: left, the chapter's who-we-are photo (`identity.who_image`, shipped neutral placeholder) in the duotone treatment at opacity .30 with radius 24 and a decorative `star.svg` (52px, `text-brand`, `saturate(1.4)`) overhanging the top-right corner; right, a right-aligned column — accent eyebrow (800, uppercase, `.04em`), Bowlby `h2` `clamp(2rem,3.6vw,3.1rem)`, 700 1.22rem paragraphs, and an accent "More about us" arrow link. Below `md` the order SHALL be eyebrow, heading, photo (radius 18, no star), paragraphs (600, 1.05rem), link, all left-aligned. Copy SHALL come from the page's ACF fields per language.

#### Scenario: Photo replaces artwork
- **WHEN** the front page renders
- **THEN** the section shows a duotone photograph with the star, not the v3 feature artwork, and a chapter-uploaded photo replaces the placeholder

#### Scenario: Mobile order
- **WHEN** the viewport is 390px
- **THEN** eyebrow and heading precede the photo and all text is left-aligned

### Requirement: Events empty state (v4)
When the home events query returns zero events in the active language, the section SHALL render a 2px dashed `#9DA9C4` radius-20 container (64px × 32px padding) with a centered 700 1.25rem lead "No events on the books yet" and a 500 1.25rem line linking the word "calendar" to the calendar page.

#### Scenario: Zero events
- **WHEN** no upcoming events exist in the active language
- **THEN** the dashed v4 empty state renders with a calendar link and no event rows

### Requirement: Closing CTA (v4)
The front page SHALL end with a join CTA whose line is editor-owned: front-page ACF field `cta_line` (per language) defaulting to "Progress now, not someday!", delivered as `front.cta.line`. From 700px the composition SHALL be: a `#1848D8` section (`data-tone="blue"`, 72px top padding) → a flame band `clamp(120px,17vw,240px)` tall painted `#A9C7FF` through the `flames-tile-light.png` mask (`repeat-x`, bottom-aligned) → a `#A9C7FF` band (16px 24px 56px) holding the `identity.cta_panel` artwork (`max-width:1100px`) with an absolutely positioned overlay column (`padding-left:44%`, `padding-right:5%`) carrying the line in Special Season Brush `clamp(1.8rem,5.4vw,4.8rem)` white uppercase (CSS `text-transform`; the DOM keeps the editor's punctuation) and an accent "Join Now" pill (Bowlby, `#0E62E6` → `#0F2E9C` hover) linking the chapter join URL. Below 700px the composition SHALL be the star-badge card: `#3E4480` radius-22 card on the `#A9C7FF` band with an inset 3px dashed `#FFC800` ring, an inline two-tone star (120px, `#1848D8` fill / ink stroke / white inner star), the line at 2.1rem and the same pill. No text SHALL sit directly on the `#A9C7FF` band.

#### Scenario: Editor changes the line
- **WHEN** an editor sets `cta_line` on the Spanish front page
- **THEN** `/es/` shows that line uppercased over the panel and `/` still shows the English value

#### Scenario: Composition scales
- **WHEN** the viewport is 700, 900, 1200 or 1440px
- **THEN** flame band, panel and overlay scale proportionally with the line and pill fully over the panel's dark region

#### Scenario: Mobile card
- **WHEN** the viewport is under 700px
- **THEN** the star-badge card renders instead of the panel composition, with the line legible at 2.1rem

## MODIFIED Requirements

### Requirement: Front page template
The theme SHALL provide `front-page.php` rendering `views/front-page.twig` via Timber (and `RouteFront.vue` in the Nuxt rendition), containing in order: hero, who-we-are, upcoming events, from-the-blog, closing CTA. Each band SHALL carry a `data-tone` attribute from the v4 set (`blue` hero and CTA, `white` who-we-are and blog, `alt` events) for high-contrast mode. No counties strip, get-involved steps, or Ponte Trucha band SHALL render.

#### Scenario: Front page renders all sections
- **WHEN** a visitor loads the site root with a static front page configured
- **THEN** the five v4 sections render in order with the tones above and no PHP/Twig errors

### Requirement: Hero section
The hero SHALL be a `#1848D8` band (`data-tone="blue"`) with a two-cell flex row from 700px (each `flex:1 1 500px`): left, a centered column (`max-width:540px`, gap 34px) holding the page `<h1>` — `identity.hero_headline` as real text in Bowlby One uppercase `clamp(2.2rem,4.2vw,3.4rem)`, `line-height:1.08`, `max-width:15ch`, `text-shadow:0.09em 0.09em 0 #0F2E9C` (the v3 `hero_headline_image` override is removed) — a 600 1.35rem subhead (`max-width:34ch`), a white "Join Now" pill (Bowlby 1.15rem, brand text, `#0F2E9C`/white hover) linking the chapter join URL, and a 2px dashed `#A9C7FF` radius-16 secondary CTA box with a 700 1.25rem label and arrow glyph linking Get Involved; decorative `sparkle.svg` (34px, −10°), `star-notch.svg` (52px, 10°) and `star.svg` (50px) in `text-brand-light` around the column, `aria-hidden`. Right, `identity.hero_photo` in the duotone treatment at opacity .38, `object-fit:cover`, `min-height:480px`. Below 700px the column comes first (56px 24px 48px padding, `h1` 2rem, subhead 1.1rem, two stars only) and the photo follows at 240px tall.

#### Scenario: Headline is accessible text
- **WHEN** the front page renders
- **THEN** the `<h1>` contains the headline as text (translatable via Chapter Settings / Polylang) with the deep-blue offset, and star art is `aria-hidden`

#### Scenario: Join CTA
- **WHEN** a visitor clicks the hero Join Now pill
- **THEN** they are taken to the chapter join URL in a new tab

#### Scenario: Narrow viewport
- **WHEN** the viewport is under 700px
- **THEN** the copy stacks above a 240px duotone photo with the headline legible at 2rem

### Requirement: Upcoming events section
The front page SHALL list up to `event_count` (default 5, max 6) published `chapter_event` posts **in the active language** with `event_date` >= now, ordered soonest first, on the `#F2F5FB` band (`data-tone="alt"`, `#events`) under a Bowlby "Upcoming events" `h2` with an accent "Full calendar" arrow link (right of the heading from `md`, centered below the list on mobile). Each row SHALL be a white radius-16 card (shadow `0 1px 4px rgba(27,27,34,.07)`) that is itself the link (`aria-label` "View event: <title>"): a `#1848D8` radius-12 date tile (800 1.4rem day, 700 .75rem `.1em` month), 700 1.18rem title, `#4A5568` 500 meta "<when> · <where>", and at `md+` a visual outline "View event" pill (Bowlby .88rem, `#0E62E6` border/text, filling on row hover); on mobile the tile is 60px and the meta shows the date only. When no upcoming events exist the *Events empty state (v4)* SHALL render instead.

#### Scenario: Past events excluded
- **WHEN** the only published events have `event_date` in the past
- **THEN** the empty state renders and no past events appear

#### Scenario: Soonest-first ordering
- **WHEN** multiple future events exist
- **THEN** rows render in ascending `event_date` order, capped at `event_count`

#### Scenario: Spanish events on the Spanish home
- **WHEN** the Spanish front page renders and Spanish translations of upcoming events exist
- **THEN** the rows show the Spanish event translations; when none exist the empty state renders

### Requirement: Blog teasers driven by published posts
The home "From the blog" section (white band, `data-tone="white"`, `#blog`) SHALL render the latest published posts **in the active language** from `progressnow_blog_front_page_context()` / `front.blog`: from `lg` a `minmax(300px,1.15fr) minmax(280px,1fr)` grid — a featured radius-24 card (16:9 duotone image at .30 with a `#1848D8` solid category pill, `#4A5568` date · read time, 800 `clamp(1.2rem,2.2vw,1.45rem)` title, `#4A5568` excerpt, accent "Read the post" arrow) beside two radius-24 row cards (`130px 1fr`, outlined brand/accent category pill, 700 1.1rem title, date); on mobile the featured card (radius 18) and two `96px 1fr` row cards stack. Cards lift on hover (`0 14px 34px rgba(27,27,34,.16)`, `translateY(-2px)`). Context keys SHALL always be set (nullable/empty allowed) and an empty state ("Posts coming soon", dashed `#9DA9C4` radius-24) SHALL render when no posts exist in the active language.

#### Scenario: Real posts on home
- **WHEN** published posts exist
- **THEN** the featured card and rows show real titles/dates/categories with blue pills, not fixtures

#### Scenario: Pre-seed empty state
- **WHEN** no posts are published
- **THEN** the section shows the dashed "Posts coming soon" state — never lorem ipsum

#### Scenario: Spanish posts on the Spanish home
- **WHEN** the Spanish front page renders and Spanish post translations exist
- **THEN** the featured card and rows show the Spanish posts; when none exist the empty state renders

## REMOVED Requirements

### Requirement: Hero headline artwork override
**Reason**: The v4 headline is real text with the deep-blue offset; the Chapter Settings `hero_headline_image` upload (and `identity.hero_headline_image`) is retired to keep one headline path.
**Migration**: Remove the ACF field, the `identity.php` resolver, the `identitySchema` key, fixtures and both renderers' `v-if`/`{% if %}` branches; chapters set `hero_headline_text` instead.

### Requirement: Who we are section (v3)
**Reason**: Replaced by *Who we are section (v4)* — photo + star instead of county/feature artwork.
**Migration**: `identity.who_image` keeps its field; the shipped default becomes a neutral photo.

### Requirement: Events empty state (v3)
**Reason**: Replaced by *Events empty state (v4)* (blue-system dashed border `#9DA9C4`).
**Migration**: None — same trigger, new colors.

### Requirement: Ponte Trucha CTA
**Reason**: Replaced by *Closing CTA (v4)*; the brush line is now editor-owned per language and the flames/panel artwork is the v4 set.
**Migration**: `cta_line` defaults to "Progress now, not someday!"; a chapter wanting the old line enters it in the field. `.ponte-trucha` CSS, `flames-tile.svg`, `flames-full.svg` and the green `cta-panel.svg` are deleted.
