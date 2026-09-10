## MODIFIED Requirements

### Requirement: Featured post card
On every archive state — browse, category filter and search results alike — the archive SHALL show the first post of the current page (a sticky post on that page takes precedence) as a featured radius-24 card: from `lg` a `minmax(300px,1.2fr) minmax(280px,1fr)` grid with a `min-height:300px` duotone image (opacity .30) carrying a `#1848D8` "Featured" pill and a text column (36px 40px padding) — `#4A5568` date · read time, Bowlby `clamp(1.3rem,2.4vw,1.7rem)` title, `#4A5568` 1.05rem excerpt, accent "Read the post" arrow; on mobile a stacked radius-18 card with a 16:9 image. Shadow `0 8px 28px rgba(27,27,34,.14)`, hover lift.

#### Scenario: Featured on filtered pages
- **WHEN** the visitor types a query or picks a category
- **THEN** the first result of the page renders as the featured card under the results header row, above the grid

### Requirement: Post grid and pagination
A page SHALL hold 25 posts — the featured card plus 24 grid cards — so the grid fills both the 3-column (≥1200px) and the 2-column (`md`) layout with no short last row; every consumer (the Twig first paint, `BlogArchive.vue`, nuxt-js and next-js) requests `per_page=25` and `/posts` defaults to it (`PROGRESSNOW_ARCHIVE_PER_PAGE`). Browse mode SHALL list the remaining posts of the page in a `repeat(auto-fill, minmax(300px,1fr))` grid (28px gap) of radius-24 cards: 16:9 grayscale image with a white category pill (`#1848D8` text) top-left, `#4A5568` date · read time, 800 1.12rem title, `#4A5568` excerpt; on mobile compact `96px 1fr` row cards (radius 16) with a `#1848D8` uppercase category label, 700 .95rem title and date. Pagination SHALL be a centered `nav[aria-label="Pagination"]` of 44px round buttons — "← Prev" / "Next →" (disabled state `#E3E8F4` border, `#9DA9C4` text) and numbered pages in Bowlby (active `#1848D8`) — followed by a "Page N of M" line; activating a page scrolls to the featured card.

#### Scenario: Page change
- **WHEN** a visitor activates page 2
- **THEN** the URL updates, page-2 posts render, button 2 is filled, and the viewport scrolls to the top of the results

#### Scenario: Full last row
- **WHEN** a page carries 25 posts at 1200px
- **THEN** one is the featured card and the 24 grid cards fill eight complete rows of three

### Requirement: Filtered results mode
When a query or category is active the archive SHALL keep the featured card + grid and open the results section with a header row: a 3px `#1848D8` bottom rule under a Bowlby result label ("12 posts in Ipsum matching "x"") and a "Clear filters" accent text button. Below it the first result of the page renders as the featured card, then the remaining results in the same `repeat(auto-fill, minmax(300px,1fr))` grid of radius-24 cards as browse mode (so a 25-post page is one featured card + 24 grid cards); results pagination when more than one page; and, for zero matches, a dashed `#9DA9C4` radius-20 empty state "No posts match / Try a different search term or clear the filters." with no featured card. On mobile results are `96px 1fr` row cards.

#### Scenario: Clear filters
- **WHEN** a visitor activates "Clear filters"
- **THEN** query and category reset, the URL drops its params, and browse mode returns

#### Scenario: No matches
- **WHEN** a query matches nothing
- **THEN** the dashed empty state renders and no pagination appears
