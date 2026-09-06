## Why

A client navigation commits as soon as the catch-all page's shell resolves, with `app/[[...slug]]/page.tsx`'s Suspense fallback standing in for `<main>`. `<main>` is a 0px box until the route payload lands, so the footer — the boundary's other host child — paints directly under the header and then drops to the bottom of the finished page. Measured front → `/blog/` against a slow API: footer top 76px at t=1353ms, 898px at t=1746ms.

The hold shipped in `b22918d` (`RoutePending` + `<html data-route-loading>` + `app/route-loading.css`), but it exists only as code comments. Which Suspense boundaries participate, what the flag must guarantee, and how it interacts with the view transition and reduce-motion are decisions a future route or fragment will have to re-derive — and the e2e test currently drives the attribute by hand rather than through a real loading window, so nothing guards the wiring.

## What Changes

- Record the shipped contract as a spec: the flag's lifecycle (raised while a fallback stands in for route content, ref-counted, lowered when the last one goes), the footer's visual and accessibility state during the window, and the reveal.
- Pin **which boundaries participate**. Today `RoutePending` wraps the whole-route boundary and the blog archive fragment (its `h-40` skeleton stands in for ~450px of results); `RouteCalendar` and `RouteFront`'s search fragment do not. Make that a stated rule — a boundary opts in when its stand-in is shorter than the content it replaces — rather than an accident of which jump was measured.
- Pin the two behaviors that fall out of existing machinery and must not regress: an in-page URL update (`?s=`, `?category=`, `?view=`) never raises the flag, because React does not re-show a mounted boundary's fallback during a transition; and reduce motion needs no gate of its own, because `MOTION_KILL_CSS` already forces `transition: none !important`.
- Close the test gap: `test/e2e/chrome.spec.ts` asserts the CSS rule by setting `data-route-loading` itself. Add a deterministic loading window — a `POST /__mock/delay { ms }` control on the fixture mock, alongside `/__mock/fail` — so an e2e test can assert the invariant that matters: the footer is never painted while a stand-in occupies `<main>`.
- Document `data-route-loading` next to the other `<html>` state attributes (`data-text-size`, `data-motion`, `.a11y-contrast`) so the set is discoverable from one place.

## Capabilities

### New Capabilities

- `route-loading`: the loading window of a client navigation in the Next.js app — the `data-route-loading` flag's lifecycle and ref-counting, which Suspense boundaries raise it, the footer's held state (unpainted, out of the accessibility tree and tab order, layout space kept) and its reveal, the interaction with the `vt-page` view transition and with reduce motion, and what an in-page URL update must _not_ do.

### Modified Capabilities

None in this root. `openspec/specs/` here holds only `calendar-route`, whose requirements are unaffected. The root project's `openspec/changes/next-js-site-implementation/specs/next-headless-site` § Client navigation and design D6 describe the transition this window sits inside; they gain a pointer, not a requirement change (see Impact).

## Impact

- `components/nav/RoutePending.tsx`, `app/route-loading.css`, `app/layout.tsx`, `app/[[...slug]]/page.tsx`, `components/routes/RoutePostsIndex.tsx` — shipped in `b22918d`; this change verifies them against the written contract and adjusts only where the spec says something the code does not do.
- `components/routes/RouteCalendar.tsx`, `components/routes/RouteFront.tsx` — audited against the opt-in rule; wrapped only if their stand-ins are short. `RouteCalendar`'s `CalendarSkeleton` measured no jump (footer top 1340px, unchanged after the fragment landed).
- `test/mock/server.mjs` — new `POST /__mock/delay { ms }` control, cleared by `/__mock/reset`. Extends the documented control surface in the header comment (parent spec `next-test-harness` § Fixture-backed mock API).
- `test/e2e/chrome.spec.ts` — the hand-driven assertion is replaced by (or joined with) one that navigates through a real delayed window.
- `lib/a11y-settings.ts` doc comment — `data-route-loading` added to the list of `<html>` state attributes.
- No API, dependency, schema, or `globals.css` changes. `app/globals.css` stays byte-identical to the theme's `src/css/tailwind.css` (`test/unit/shared-source-drift.test.ts`); the route-loading rule stays in its own Next-only sheet because the WordPress theme is a multi-page app whose footer never outruns its content.
