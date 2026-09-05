# front-page

## ADDED Requirements

### Requirement: Front page is language-aware
The front page SHALL resolve its content for the active Polylang language. At `/` it SHALL render the English `page_on_front`; at `/es/` it SHALL render that page's Spanish translation, sourcing hero, who-we-are, and get-involved copy from the Spanish page's own ACF fields. Language-neutral tokens (county names, brand, social handles) SHALL render identically in both languages.

#### Scenario: Spanish front page
- **WHEN** a visitor loads `/es/`
- **THEN** the same section layout renders with Spanish hero/who/get-involved copy from the Spanish page's ACF fields, and no PHP/Twig errors

#### Scenario: English unchanged
- **WHEN** a visitor loads `/`
- **THEN** the English front page renders exactly as before

## MODIFIED Requirements

### Requirement: Upcoming events section
The front page SHALL list up to 3 published `chapter_event` posts **in the active language** with `event_date` >= now, ordered soonest first, each card showing formatted date, title, location, event type term (if any), and an RSVP/link when `event_link` is set. When no upcoming events exist in the active language, an empty-state message with a link to `/events/` SHALL render instead.

#### Scenario: Past events excluded
- **WHEN** the only published events have `event_date` in the past
- **THEN** the empty-state message renders and no past events appear

#### Scenario: Soonest-first ordering
- **WHEN** multiple future events exist
- **THEN** cards render in ascending `event_date` order, max 3

#### Scenario: Spanish events on the Spanish home
- **WHEN** the Spanish front page renders and Spanish translations of upcoming events exist
- **THEN** the cards show the Spanish event translations; when none exist the empty-state renders

### Requirement: Blog teasers driven by published posts
The home "From the blog" section SHALL render the latest published posts **in the active language** (sticky-aware featured card + two rows) from context supplied by `legacy_blog_front_page_context()`; the context keys SHALL always be set (nullable/empty allowed), category pill classes SHALL be built in Twig from the raw `cat` slug, and an empty state SHALL render when no posts exist in the active language.

#### Scenario: Real posts on home
- **WHEN** published posts exist
- **THEN** the featured card and rows show real titles/dates/categories, not fixtures

#### Scenario: Pre-seed empty state
- **WHEN** no posts are published
- **THEN** the section shows a "Posts coming soon" state — never lorem ipsum

#### Scenario: Spanish posts on the Spanish home
- **WHEN** the Spanish front page renders and Spanish post translations exist
- **THEN** the featured card and rows show the Spanish posts; when none exist the empty state renders
