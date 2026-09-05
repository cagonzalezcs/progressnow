# structured-data Specification

## Purpose
TBD - created by archiving change seo-meta-layer. Update Purpose after archive.
## Requirements
### Requirement: Organization schema
Every page SHALL emit `Organization` JSON-LD with the chapter name, URL, logo, and `sameAs` social profiles from Chapter Settings.

#### Scenario: Site-wide organization entity
- **WHEN** any front-end page renders
- **THEN** valid JSON-LD with `@type: Organization` is present exactly once

### Requirement: Article schema on posts
Post permalinks SHALL emit `Article` JSON-LD (headline, description, datePublished, dateModified, image, author as Person or the committee Organization per byline mode).

#### Scenario: Committee-bylined article
- **WHEN** a committee-byline post renders
- **THEN** the Article author is an Organization named after the committee

### Requirement: Event schema on event permalinks
Event permalinks SHALL emit `Event` JSON-LD with name, ISO-8601 `startDate`/`endDate` in the chapter timezone, `location` as a Place built from venue/city, and `offers` linking the RSVP URL when present — sourced from the same fields as the ICS feed.

#### Scenario: Event rich result eligibility
- **WHEN** an event with start/end/venue renders
- **THEN** the JSON-LD parses and carries `@type: Event` with startDate, location, and the event title

