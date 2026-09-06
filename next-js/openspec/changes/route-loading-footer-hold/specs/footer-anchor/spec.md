## ADDED Requirements

### Requirement: The footer is anchored below the viewport

The site footer SHALL never be laid out entirely above the fold. Whenever `<main>` is shorter than the viewport — a route's content still in flight, a streamed shell on a direct load, a page shorter than the window, an island that has not rendered yet — `<main>` SHALL take the slack so the footer's bottom edge is at or below the viewport's bottom edge.

This SHALL be achieved with layout, in `app/sticky-footer.css`: `<body>` is a flex column of at least `100dvh` (with a `100vh` fallback) and `.site-main` is the growing child. `<body>`'s own children are the skip link — absolutely positioned, so it takes no space — `<header>`, `<main>` and `<footer>`; the wrappers in `SiteShell` are `display: contents`. The sticky header SHALL keep working, `position: sticky` being unaffected by a flex parent.

The footer SHALL NOT be hidden, faded, or otherwise removed from paint to achieve this. It stays in the accessibility tree and the tab order at all times.

#### Scenario: Content still loading

- **WHEN** a client navigation commits with a Suspense fallback standing in for `<main>`
- **THEN** the footer's bottom edge is at or below the viewport's bottom edge, and it is painted

#### Scenario: Content arrives

- **WHEN** the route's content commits and `<main>` grows
- **THEN** the footer moves further down, out of view, and is never seen at a position it does not keep

#### Scenario: Direct load

- **WHEN** a route is loaded directly and the shell is streamed before hydration
- **THEN** the footer is anchored from the first painted frame — the rule is CSS and needs no JavaScript

#### Scenario: Page shorter than the viewport

- **WHEN** a route's content is shorter than the window, as the 404 view is
- **THEN** the footer sits at the bottom of the viewport rather than under the header

#### Scenario: An island renders after the content commits

- **WHEN** `<main>` grows again after the route's content has committed, because an island renders more than the server sent
- **THEN** the footer only moves further down, and is not seen moving

### Requirement: The footer is never hidden to stop it moving

Hiding the footer while a route loads SHALL NOT be used. The footer is a dark band against a white page ground, so hiding and restoring it flashes the page dark → white → dark on every navigation — a photosensitivity hazard, and a worse outcome than the jump it removes. An earlier revision of this capability did exactly that, with `visibility: hidden` keyed on an `<html data-route-loading>` flag; both the flag and the rule are removed.

#### Scenario: No luminance flash on navigation

- **WHEN** a visitor navigates between routes, with or without a loading window
- **THEN** the footer's computed `visibility` is `visible` in every frame, and no frame replaces it with the page ground

### Requirement: The anchor is exercised end to end

The fixture-backed mock SHALL expose `POST /__mock/delay { ms, path? }`, which holds envelopes whose path starts with `path` (default: all) for `ms`, cleared by `POST /__mock/reset`. An e2e test SHALL use it, together with a signed rebuild that evicts the content tags, to open a real loading window and assert the anchor through an actual navigation — a warm route's payload arrives whole, fallback and all, so a cold cache is required. Because the mock is shared by specs running in parallel, the delay SHALL be scoped to the envelope the spec under test needs slowed.

#### Scenario: Delayed navigation

- **WHEN** the content tags are evicted, the `posts` envelope is held, and the test navigates from the front page to `/blog/`
- **THEN** `<main>` is measurably shorter at some sampled frame than the height it settles at, and in every sampled frame the footer is painted with its bottom edge at or below the viewport's bottom edge

#### Scenario: Delay is scoped

- **WHEN** a delay is set on one envelope path and another spec requests a different envelope
- **THEN** only the matching envelope is held, and `POST /__mock/reset` releases it
