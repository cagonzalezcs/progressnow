## ADDED Requirements

### Requirement: Internal render headers are not honored from the public edge
The proxy SHALL treat `x-nonce`, `x-pathname`, `x-not-found-render`, and `x-error-render` as internal: inbound requests that do not carry the process's internal token SHALL have those headers removed before any routing, status, or CSP decision, and internal renders SHALL authenticate with that token.

#### Scenario: Spoofed nonce ignored
- **WHEN** a client sends `x-nonce: AAAA` with a page request
- **THEN** the response CSP and inline scripts use a freshly generated nonce, never `AAAA`

#### Scenario: Spoofed not-found flag ignored
- **WHEN** a client sends `x-not-found-render: 1` for a path absent from the routes manifest
- **THEN** the response status is 404 with the not-found document

#### Scenario: Internal loop still works
- **WHEN** the proxy renders the not-found or error document through its own fetch
- **THEN** the render uses the outer request's nonce and path

### Requirement: Image optimization uses HTTPS upstreams in production
Outside mock mode, `next/image` SHALL fetch only `https` upstreams for bare `IMAGE_HOSTS` entries; an `http` upstream SHALL be allowed only for an entry that names the scheme explicitly.

#### Scenario: Plain-http upstream rejected
- **WHEN** `IMAGE_HOSTS=cms.example.org` and an image on `http://cms.example.org/…` is requested through the optimizer
- **THEN** the optimizer answers 400

### Requirement: HTML sinks are enumerated and justified
Every use of `dangerouslySetInnerHTML` in application code SHALL be in an allowlisted file and carry an inline comment naming the sanitizer or encoder that produced the HTML; lint SHALL reject any other use and a test SHALL fail when the set of sinks changes without updating the allowlist.

#### Scenario: New sink without justification
- **WHEN** a component gains `dangerouslySetInnerHTML` outside the allowlist
- **THEN** `npm run lint` fails on that line

### Requirement: Public helper endpoints and demo backends have a written abuse posture
`/api/events` SHALL document its cache profile, upstream timeout, and failure response, and the deployment guide SHALL give an edge rate-limit recipe; any publicly deployed demo backend SHALL require the same HMAC on write endpoints as the real API and SHALL be labeled non-production.

#### Scenario: Unsigned demo build-status rejected
- **WHEN** an unsigned `POST /build-status` reaches the demo backend
- **THEN** it answers 401 and records nothing
