## ADDED Requirements

### Requirement: The footer starts below the fold and stays there

No part of the site footer SHALL be inside the viewport at scroll top, in any state: a route's content still in flight, a streamed shell on a direct load, a page shorter than the window, an island that has not rendered yet, or a settled page. The visitor reaches the footer by scrolling, and never sees it arrive or leave on its own.

This SHALL be achieved with layout, in `app/footer-anchor.css`: `.site-main` carries `min-height: 100dvh` (with a `100vh` fallback), so `<main>` alone is at least a viewport tall and the footer begins past the bottom edge. Content landing only pushes it further down.

The footer SHALL NOT be hidden, faded, or otherwise removed from paint to achieve this. It stays in the accessibility tree and the tab order at all times, and remains reachable by scrolling and by keyboard.

The invariant is the footer's **top** edge, not its bottom. Anchoring the bottom edge to the viewport's — the conventional sticky-footer pattern — reserves the footer's height _inside_ the viewport and is not sufficient: measured on `/blog/`, 352px of footer showed while the route loaded and slid back out to 32px when the content landed, while the bottom edge never once rose above the fold.

#### Scenario: Content still loading

- **WHEN** a client navigation commits with a stand-in occupying `<main>`
- **THEN** the footer's top edge is at or below the viewport's bottom edge, and the footer is painted

#### Scenario: Content arrives

- **WHEN** the route's content commits
- **THEN** the footer's top edge is still at or below the viewport's bottom edge, so nothing about it is seen to change

#### Scenario: Direct load

- **WHEN** a route is loaded directly and the shell is streamed before hydration
- **THEN** the footer is below the fold from the first painted frame — the rule is CSS and needs no JavaScript

#### Scenario: Page shorter than the viewport

- **WHEN** a route's content is shorter than the window, as the 404 view is
- **THEN** the footer starts below the fold, and is reachable by scrolling to it

#### Scenario: An island renders after the content commits

- **WHEN** `<main>` grows again after the route's content has committed, because an island renders more than the server sent
- **THEN** the footer only moves further down, and is not seen moving

### Requirement: The footer is never hidden to stop it moving

Hiding the footer while a route loads SHALL NOT be used. The footer is a dark band against a white page ground, so hiding and restoring it flashes the page dark → white → dark on every navigation — a photosensitivity hazard (WCAG 2.3.1), and a worse outcome than the jump it removes. An earlier revision did exactly that, with `visibility: hidden` keyed on an `<html data-route-loading>` flag; both the flag and the rule are removed.

#### Scenario: No luminance flash on navigation

- **WHEN** a visitor navigates between routes, with or without a loading window
- **THEN** the footer's computed `visibility` is `visible` in every frame, and no frame replaces it with the page ground

### Requirement: The route transition washes through the page ground

The `vt-page` transition groups SHALL fade through `--color-background`, the ground both the outgoing and incoming pages already sit on, rather than through the brand blue. A full-width blue wash on every navigation reads as a flash of its own. This rule lives in the shared stylesheet, so the change SHALL be made in the theme's `src/css/tailwind.css` and re-copied to `app/globals.css`, keeping `test/unit/shared-source-drift.test.ts` green — the theme's cross-document transitions get the same treatment.

#### Scenario: Shared sheet stays in sync

- **WHEN** the drift test runs after the transition ground is changed
- **THEN** `app/globals.css` still matches the theme's `src/css/tailwind.css` byte for byte after URL normalization

### Requirement: The anchor is exercised end to end

The fixture-backed mock SHALL expose `POST /__mock/delay { ms, path? }`, which holds envelopes whose path starts with `path` (default: all) for `ms`, cleared by `POST /__mock/reset`. An e2e test SHALL use it, together with a signed rebuild that evicts the content tags, to open a real loading window and assert the invariant through an actual navigation — a warm route's payload arrives whole, fallback and all, so a cold cache is required. Because the mock is shared by specs running in parallel, the delay SHALL be scoped to the envelope the spec under test needs slowed.

The witness that a window opened SHALL be the stand-in's presence in the DOM, not page geometry: `<main>` is a full viewport tall while loading and after, which is the point of the rule and leaves nothing for a geometric witness to detect.

#### Scenario: Delayed navigation

- **WHEN** the content tags are evicted, the `posts` envelope is held, and the test navigates from the front page to `/blog/`
- **THEN** a stand-in is present in `<main>` in at least one sampled frame, and in every sampled frame the footer is painted with its top edge at or below the viewport's bottom edge

#### Scenario: Delay is scoped

- **WHEN** a delay is set on one envelope path and another spec requests a different envelope
- **THEN** only the matching envelope is held, and `POST /__mock/reset` releases it
