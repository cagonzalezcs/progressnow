## ADDED Requirements

### Requirement: Site bootstrap endpoint
`GET /progressnow/v1/site?lang=` SHALL return the chrome payload for the language: `{ languages, chapter (identity + URLs + committees), header: { navItems, aboutItems, joinLabel, aboutLabel, logoUrl, homeUrl }, footer: { columns, socials, contactEmail, tagline, a11yLead, a11yLinkLabel, logoUrl }, strings: { <registered string slug>: <translated> } }`, built from the same context as the Twig shell.

#### Scenario: Spanish chrome
- **WHEN** `/site?lang=es` is requested
- **THEN** nav labels, strings, and links are the Spanish menu/strings/translation URLs

### Requirement: Route manifest endpoint
`GET /progressnow/v1/routes` SHALL return every public route in every language as `{ routes: [{ path, kind, lang, id, template, payloadKey }] }` where `kind` ∈ `front | page | posts_index | post | event | calendar | about | get_involved`, covering only published content.

#### Scenario: Manifest complete
- **WHEN** the manifest is requested on a seeded site
- **THEN** it lists the EN and ES front pages, posts pages, every published post and event, and every published page with its template

### Requirement: Front page and page endpoints
`GET /progressnow/v1/front-page?lang=` SHALL return the front-page context (hero, who, home events, blog teasers, calendar URL, event count). `GET /progressnow/v1/pages/{path}?lang=` SHALL return the page's title, lede, template, template-specific groups (About, Get Involved, Calendar props, interior documents, grievance callout), and kses-sanitized content, resolving `path` within the requested language; unknown paths return 404 `progressnow_page_not_found`.

#### Scenario: About page payload
- **WHEN** `/pages/about?lang=en` is requested
- **THEN** the response carries `template: "about"` and the About groups exactly as the shell context builds them

#### Scenario: Unknown page
- **WHEN** `/pages/nope` is requested
- **THEN** the response is 404 `progressnow_page_not_found`

### Requirement: Single event endpoint
`GET /progressnow/v1/events/{slug}?lang=` SHALL return the `SingleEvent` payload (ChapterEvent + blocks + languages) for a published event, 404 `progressnow_event_not_found` otherwise.

#### Scenario: Event by slug
- **WHEN** a published event slug is requested
- **THEN** the payload equals the event permalink's shell payload

### Requirement: Language parameter everywhere
Every `/progressnow/v1` read endpoint SHALL accept `lang`, resolving it as `/posts` does today (valid slug honored, else site default), and SHALL include the language in its cache key.

#### Scenario: Default language when omitted
- **WHEN** `/front-page` is requested without `lang`
- **THEN** the English front page payload is returned

### Requirement: SEO block on route payloads
`/front-page`, `/pages/{path}`, `/posts/{slug}`, and `/events/{slug}` SHALL include `seo: { title, description, canonical, robots, hreflang: [{ lang, href }] }` computed by the same functions that render the shell head.

#### Scenario: Payload SEO equals head
- **WHEN** a post's payload and its shell are compared
- **THEN** `seo.title`, `seo.description`, and `seo.canonical` equal the `<title>`, description meta, and canonical link in the shell

### Requirement: Build status callback endpoint
`POST /progressnow/v1/build-status` SHALL accept `{ buildId, status: "succeeded"|"failed", contentVersion, error? }` only when signed with the rebuild secret (`X-Chapter-Timestamp`/`X-Chapter-Signature`, ±5 minutes), SHALL be idempotent per `buildId`, and SHALL respond 401 to unsigned or stale requests and 204 on acceptance.

#### Scenario: Signed callback accepted
- **WHEN** a correctly signed `succeeded` callback arrives
- **THEN** the build state updates and the response is 204; a repeat with the same `buildId` is a no-op 204

#### Scenario: Unsigned callback rejected
- **WHEN** the signature is missing or wrong
- **THEN** the response is 401 and state is unchanged
