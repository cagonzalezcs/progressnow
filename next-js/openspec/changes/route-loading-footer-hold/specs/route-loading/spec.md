## ADDED Requirements

### Requirement: A route's loading window is flagged on `<html>`

While a Suspense fallback stands in for route content during a client navigation, the document element SHALL carry the attribute `data-route-loading`. `RoutePending` (`components/nav/RoutePending.tsx`) SHALL be the only writer: it sets the attribute in a layout effect on mount — the same commit the fallback appears in, so the flag is part of the frame React snapshots for the view transition — and removes it in the cleanup React runs before painting the content that replaces it.

The flag SHALL be reference-counted. Overlapping fallbacks — a route shell that resolves into a fragment still pending — SHALL keep the attribute until the last one has gone, and a fallback leaving while another is up SHALL NOT clear it. StrictMode's double-invoked effects SHALL NOT leave the flag stuck or prematurely cleared.

#### Scenario: Flag raised for the whole loading window

- **WHEN** a client navigation commits with `app/[[...slug]]/page.tsx`'s Suspense fallback standing in for `<main>`
- **THEN** `<html>` carries `data-route-loading` from that commit until the route content commits

#### Scenario: Overlapping fallbacks

- **WHEN** the route shell resolves into a fragment whose own `RoutePending` fallback is still mounted
- **THEN** `data-route-loading` remains set, and is removed only when the fragment's fallback goes

#### Scenario: Content arrives

- **WHEN** the last `RoutePending` fallback unmounts
- **THEN** `data-route-loading` is removed before the frame that paints the content

### Requirement: The footer is held back for that window

`app/route-loading.css` SHALL hold the site footer unpainted while `data-route-loading` is set, so it never appears under an empty `<main>` and then jumps to the bottom of the finished page. The hold SHALL use `visibility: hidden`, which keeps the footer's layout box while taking it out of the accessibility tree and the tab order; `opacity` alone SHALL NOT be used. Hiding SHALL be immediate (no fade out). When the flag is removed the footer SHALL fade in over 200ms at its final position.

This rule SHALL live in a Next-only stylesheet. It SHALL NOT be added to `app/globals.css`, which is a byte-identical copy of the theme's `src/css/tailwind.css` guarded by `test/unit/shared-source-drift.test.ts` — the WordPress theme is a multi-page app whose footer never outruns its content.

#### Scenario: Footer unpainted during the window

- **WHEN** `<html>` carries `data-route-loading`
- **THEN** the footer's computed `visibility` is `hidden`, it exposes no `contentinfo` landmark to assistive technology, and none of its links are reachable by Tab

#### Scenario: Footer never paints at a position it will not keep

- **WHEN** a visitor navigates from a long page to a route whose content takes time to arrive
- **THEN** no painted frame shows the footer at the position it holds while the stand-in occupies `<main>`

#### Scenario: Reveal

- **WHEN** `data-route-loading` is removed
- **THEN** the footer becomes visible at its final position and its opacity transitions from 0 to 1 over 200ms

#### Scenario: Shared stylesheet untouched

- **WHEN** `test/unit/shared-source-drift.test.ts` runs
- **THEN** `app/globals.css` still matches the theme's `src/css/tailwind.css` byte for byte after URL normalization

### Requirement: A boundary opts in when its stand-in is short

A Suspense boundary SHALL use `RoutePending` when the stand-in it shows is shorter than the content it replaces, so that content landing would move the footer. `RoutePending` SHALL render the boundary's own skeleton when given one as children, and an empty `aria-busy="true"` region when the boundary has none of its own.

The whole-route boundary in `app/[[...slug]]/page.tsx` SHALL opt in: its stand-in is empty. The blog archive fragment in `components/routes/RoutePostsIndex.tsx` SHALL opt in: its `h-40` skeleton stands in for roughly 450px of results. A boundary whose skeleton already holds the content's space SHALL NOT opt in, so the footer is not hidden for a window in which it would not have moved.

#### Scenario: Whole-route boundary

- **WHEN** the catch-all page's fallback is showing
- **THEN** it renders an empty `aria-busy="true"` region and the flag is raised

#### Scenario: Fragment with its own skeleton

- **WHEN** the blog archive's fallback is showing
- **THEN** its own skeleton renders (not the `aria-busy` stand-in) and the flag is raised

#### Scenario: Skeleton that already holds its space

- **WHEN** a boundary's skeleton is sized like the content it replaces, as `CalendarSkeleton` is
- **THEN** the boundary does not use `RoutePending` and the footer stays visible through that fragment's load

### Requirement: In-page URL updates do not raise the flag

A URL-state update on the current route — `?s=`, `?category=`, `?paged=`, `?view=` written with `router.replace(…, { scroll: false })` — SHALL NOT raise `data-route-loading` and SHALL NOT hide the footer. React does not re-show a mounted boundary's fallback during a transition; the pending state for these updates stays in place, as `aria-busy` and the archive controls' `useTransition` state.

#### Scenario: Typing in the blog search box

- **WHEN** the visitor types a query on an already-loaded `/blog/`
- **THEN** `data-route-loading` is never set and the footer never leaves the accessibility tree

### Requirement: Reduce motion needs no gate of its own

The reveal SHALL be instant when motion is reduced, by either the `prefers-reduced-motion: reduce` media query or the accessibility widget's setting. This SHALL be inherited from `MOTION_KILL_CSS` (`lib/a11y-settings.ts`), whose `transition: none !important` already covers the footer; `app/route-loading.css` SHALL NOT carry its own reduced-motion gate. The hold itself SHALL still apply — `visibility` is not motion.

#### Scenario: Reduced motion

- **WHEN** reduce motion is on and a route's content arrives
- **THEN** the footer is revealed on the same frame with no fade, having been held for the loading window as usual

### Requirement: The loading window is exercised end to end

The fixture-backed mock SHALL expose `POST /__mock/delay { ms }`, which delays every `progressnow/v1` envelope response by `ms`, cleared by `POST /__mock/reset` — the same control-surface shape as `/__mock/fail`, documented in the server's header comment. An e2e test SHALL use it to open a real loading window and assert the footer invariant through an actual navigation, not by setting `data-route-loading` by hand.

#### Scenario: Delayed navigation

- **WHEN** a delay is set and the test navigates from the front page to `/blog/`
- **THEN** at least one sampled frame shows a stand-in occupying `<main>`, and in every such frame the footer's computed `visibility` is `hidden`

#### Scenario: Delay is scoped to the test

- **WHEN** `POST /__mock/reset` is called
- **THEN** envelope responses are no longer delayed

### Requirement: `<html>` state attributes are documented together

The document element's state attributes SHALL be discoverable from one place. `data-route-loading` SHALL be listed alongside `data-text-size`, `data-motion`, and the `a11y-contrast` class in the doc comment of `lib/a11y-settings.ts`, with a pointer to its writer.

#### Scenario: Reading the attribute list

- **WHEN** a developer reads the `<html>` state attributes documented in `lib/a11y-settings.ts`
- **THEN** `data-route-loading` appears there with a pointer to `components/nav/RoutePending.tsx`
