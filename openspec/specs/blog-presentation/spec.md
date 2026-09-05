# blog-presentation Specification

## Purpose
Presentation contract for the blog archive (page header, toolbar, featured card, grid + pagination, filtered mode, subscribe strip) and the single post (hero, article column, sidebar, read next) on the Progress Now v4 brand system, in both renderers (theme Twig shell + Nuxt site). Behavior lives in island-data-fetch / island-empty-states / post-authoring.

## Requirements

### Requirement: Blog page header
The posts index SHALL open with the v4 page header band: `#1848D8` (`data-tone="blue"`, 48px 24px 56px; 36px 24px 40px on mobile), `max-width:1200px`, a white radius-999 breadcrumb pill ("Home" `#1848D8` link / "Blog" ink) from `md`, a Bowlby One uppercase `h1` ("From the blog") `clamp(2.2rem,4.2vw,3.4rem)` with `text-shadow:0.09em 0.09em 0 #0F2E9C` (1.9rem on mobile), and a 600 1.25rem lede (`max-width:56ch`; 1.05rem on mobile) from the editable blog page copy.

#### Scenario: Header renders
- **WHEN** a visitor loads `/blog/` at 1440px
- **THEN** the blue band shows the breadcrumb pill, the shadowed Bowlby title and the lede

### Requirement: Blog toolbar
Under the header a white toolbar (40px top padding; 28px on mobile) SHALL hold a `role="group"` "Filter by category" chip row — "All" plus one chip per category, 700 .88rem radius-999 buttons, `aria-pressed`, inactive white with 2px `#C6CFE4` border and `#0F2E9C`/white hover, active `#1848D8` — and a `type="search"` input (2px `#C6CFE4` border, radius 999, 10px 20px padding, `min-width:240px`, `aria-label="Search posts"`). From `md` chips sit left and the search right on one row; on mobile the search stacks above the chips. Behavior (URL state, debounce, server-truth results) SHALL be unchanged from `island-data-fetch`.

#### Scenario: Chip state
- **WHEN** a visitor activates the "Ipsum" chip
- **THEN** it renders filled `#1848D8` with `aria-pressed="true"`, "All" returns to the outline state, and the archive enters filtered mode

### Requirement: Featured post card
In browse mode (no query, "All") the archive SHALL show the first post of the current page as a featured radius-24 card: from `lg` a `minmax(300px,1.2fr) minmax(280px,1fr)` grid with a `min-height:300px` duotone image (opacity .30) carrying a `#1848D8` "Featured" pill and a text column (36px 40px padding) — `#4A5568` date · read time, Bowlby `clamp(1.3rem,2.4vw,1.7rem)` title, `#4A5568` 1.05rem excerpt, accent "Read the post" arrow; on mobile a stacked radius-18 card with a 16:9 image. Shadow `0 8px 28px rgba(27,27,34,.14)`, hover lift.

#### Scenario: Featured only while browsing
- **WHEN** the visitor types a query or picks a category
- **THEN** the featured card is not rendered and the filtered results section takes its place

### Requirement: Post grid and pagination
Browse mode SHALL list the remaining posts of the page in a `repeat(auto-fill, minmax(300px,1fr))` grid (28px gap) of radius-24 cards: 16:9 grayscale image with a white category pill (`#1848D8` text) top-left, `#4A5568` date · read time, 800 1.12rem title, `#4A5568` excerpt; on mobile compact `96px 1fr` row cards (radius 16) with a `#1848D8` uppercase category label, 700 .95rem title and date. Pagination SHALL be a centered `nav[aria-label="Pagination"]` of 44px round buttons — "← Prev" / "Next →" (disabled state `#E3E8F4` border, `#9DA9C4` text) and numbered pages in Bowlby (active `#1848D8`) — followed by a "Page N of M" line; activating a page scrolls to the featured card.

#### Scenario: Page change
- **WHEN** a visitor activates page 2
- **THEN** the URL updates, page-2 posts render, button 2 is filled, and the viewport scrolls to the top of the results

### Requirement: Filtered results mode
When a query or category is active the archive SHALL replace featured + grid with a results section: a header row with a 3px `#1848D8` bottom rule — Bowlby result label ("12 posts in Ipsum matching "x"") and a "Clear filters" accent text button — then a `repeat(auto-fill, minmax(260px,1fr))` grid of radius-20 cards (16:9 image, `#1848D8` uppercase category, 800 1.05rem title, date · read time); results pagination when more than one page; and, for zero matches, a dashed `#9DA9C4` radius-20 empty state "No posts match / Try a different search term or clear the filters." On mobile results are `96px 1fr` row cards.

#### Scenario: Clear filters
- **WHEN** a visitor activates "Clear filters"
- **THEN** query and category reset, the URL drops its params, and browse mode returns

#### Scenario: No matches
- **WHEN** a query matches nothing
- **THEN** the dashed empty state renders and no pagination appears

### Requirement: Blog subscribe strip
The archive SHALL end with an ink strip (`data-tone="ink"`, 56px 24px; 40px on mobile): Bowlby 1.4rem "Never miss a post", a `#C3CBE2` lede, and a white "Subscribe" pill (ink text, `#0F2E9C`/white hover) linking the chapter newsletter URL (the strip is omitted when the URL is empty).

#### Scenario: Newsletter wired
- **WHEN** the chapter newsletter URL is set
- **THEN** the strip renders with the pill linking to it; when empty the strip is absent

### Requirement: Post hero
A single post SHALL open with a `#1848D8` band (`data-tone="blue"`, 48px 24px 150px) whose `max-width:880px` column holds the breadcrumb pill (Home / Blog / <title>), a white category pill (`#1848D8` text), the Bowlby `h1` `clamp(2rem,3.8vw,3rem)` (no text-shadow, `text-wrap:balance`), and a 600 byline row — a 44px `#A9C7FF` initials avatar (`#0F2E9C` 800), "By <author>", date, read time.

#### Scenario: Hero content
- **WHEN** a post renders
- **THEN** breadcrumb, category pill, title and byline show real post data with the author's initials in the avatar

### Requirement: Post article column
Below the hero a white section SHALL lay out `minmax(300px,1fr) 280px` (56px gap) from `lg`, stacked below: the article column pulls the featured image up over the hero (`margin-top:-110px`, radius 24, duotone .25, shadow `0 10px 30px rgba(27,27,34,.12)`), then a 600 1.22rem lede paragraph, 1.12rem/1.7 `#3A3F4E` prose, Bowlby `h2` `clamp(1.4rem,2.4vw,1.9rem)`, radius-20 `#F2F5FB` blockquotes with a 6px `#1848D8` left rule and Bowlby quote text, figures with duotone images and `#4A5568` captions, and a share row (uppercase "Share" label, outline accent pills) above a `#D9E1F2` top rule. Existing post blocks (gallery, video, audio, document, person quote, action callout, event embed) SHALL adopt these tokens.

#### Scenario: Pulled-up image
- **WHEN** a post with a featured image renders at 1440px
- **THEN** the image overlaps the blue hero by 110px and casts the soft shadow; without an image the article starts 32px below the hero

### Requirement: Post sidebar
The sticky (`top:108px`) sidebar SHALL contain an "On this page" white card listing the article's `h2` anchors as accent 700 links and a `#1848D8` "Get involved" card (Bowlby title, lede, white "Join Now" pill). The sidebar SHALL be omitted when the per-post meta-rail toggle is off, and stacks under the article below `lg`.

#### Scenario: Anchor list
- **WHEN** a post has two `h2` headings
- **THEN** "On this page" lists both and each link scrolls to its heading

### Requirement: Read next
The post SHALL end with an `#F2F5FB` band (`data-tone="alt"`) — Bowlby "Read next" `h2` with an accent "All posts" arrow link — and a `repeat(auto-fit, minmax(260px,1fr))` grid of radius-20 cards (16:9 grayscale image, `#1848D8` uppercase category, 800 1.05rem title, date) built from the existing `readNext` envelope.

#### Scenario: Three suggestions
- **WHEN** at least three other posts exist in the active language
- **THEN** three cards render; with fewer, the available ones render and the band is omitted at zero
