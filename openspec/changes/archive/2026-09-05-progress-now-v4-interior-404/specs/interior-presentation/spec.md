## ADDED Requirements

### Requirement: Interior page header with breadcrumb
Interior templates (About, Get Involved, generic page) SHALL open with the v4 page header band (`#1848D8`, `data-tone="blue"`, `max-width:1140px`): breadcrumb pill (Home / <page title>) from `md`, Bowlby uppercase `h1` `clamp(2.2rem,4.2vw,3.4rem)` with the `#0F2E9C` offset shadow, and the page's 600 1.25rem lede (`max-width:56ch`).

#### Scenario: Header renders
- **WHEN** the About page renders
- **THEN** the blue band shows Home / About, the shadowed title and the lede from the page's fields

### Requirement: Mission band
When the page's mission section is visible (`editable-page-sections` toggles), an ink band (`data-tone="ink"`, 64px 24px) SHALL render an `#A9C7FF` 800 .9rem `.12em` uppercase eyebrow ("What we believe") and the mission statement in Bowlby `clamp(1.5rem,2.8vw,2.3rem)` (`max-width:38ch`).

#### Scenario: Toggle hides band
- **WHEN** the mission section is toggled off
- **THEN** the band and its nav entry do not render

### Requirement: Article and sidebar layout
Interior content SHALL lay out `minmax(300px,1fr) 310px` (56px gap) from `lg`, stacked below: the article column with Bowlby `h2`s `clamp(1.6rem,2.6vw,2.2rem)`, `#3A3F4E` 1.12rem/1.65 prose, radius-20 duotone figures with `#4A5568` captions, and radius-20 `#F2F5FB` blockquotes with a 6px `#1848D8` rule; the sticky (`top:108px`) sidebar with a `#1848D8` "Get involved" card (Bowlby title, lede, white "Join Now" pill), a white "Documents" card listing the page's document links as accent 700 links, and a dashed `#9DA9C4` "Contact" box with the chapter contact email. Sidebar cards SHALL be omitted when their data is empty.

#### Scenario: Sidebar composition
- **WHEN** the About page has documents and the chapter has a contact email
- **THEN** all three sidebar cards render; on Get Involved without documents only the CTA and Contact cards render

### Requirement: Committee cards
The committees section SHALL render `chapter.committees` as a `repeat(auto-fit, minmax(240px,1fr))` grid of white radius-20 cards (shadow `0 2px 10px rgba(27,27,34,.10)`, 22px 24px padding) with a `#1848D8` Bowlby 1.05rem name and `#3A3F4E` 1rem description.

#### Scenario: Four committees
- **WHEN** four committees are configured
- **THEN** four cards render in a responsive grid, two per row at 768px

### Requirement: FAQ disclosure rows
The FAQ SHALL render each item as a white row with a 1px `#D9E1F2` border and radius 14 — a 700 1.05rem summary (16px 20px padding) and `#3A3F4E` 1.02rem answer — keeping the existing accordion semantics (one open at a time, keyboard operable, `aria-expanded`).

#### Scenario: Open an item
- **WHEN** a visitor activates a question
- **THEN** its answer expands inside the bordered row and the previously open item closes

### Requirement: Interior subscribe strip
Interior pages SHALL end with an ink strip (`data-tone="ink"`): Bowlby 1.4rem "Never miss an update", `#C3CBE2` lede, white "Subscribe" pill linking the chapter newsletter URL (omitted when empty).

#### Scenario: Strip present
- **WHEN** the newsletter URL is set
- **THEN** the strip renders after the content section

### Requirement: 404 page
The not-found template (`404.twig` and `RouteNotFound.vue` / `error.vue`) SHALL render a full-bleed `#1848D8` band (`data-tone="blue"`, 110px 24px 120px) with four decorative stars (`star.svg`, `sparkle.svg`, `star-notch.svg` in `text-brand-light`, `aria-hidden`) around a centered `max-width:720px` column: Bowlby "404" `clamp(5rem,14vw,10rem)` with a `.06em` `#0F2E9C` shadow, a Bowlby uppercase `h1` `clamp(1.4rem,2.8vw,2rem)`, a 600 1.2rem line (`max-width:44ch`), and two pills — white "Back home" and outline white "See the calendar" — all strings translatable.

#### Scenario: Unknown URL
- **WHEN** a visitor requests a URL that resolves to nothing in either language
- **THEN** the blue 404 band renders with the two pills linking the home and calendar of the active language and the response status is 404
