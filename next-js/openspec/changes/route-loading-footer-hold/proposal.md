## Why

A client navigation commits as soon as the catch-all page's shell resolves, with `app/[[...slug]]/page.tsx`'s Suspense fallback standing in for `<main>`. `<main>` is a 0px box until the route payload lands, so the footer paints directly under the header and then drops to the bottom of the finished page. Measured front → `/blog/` against a slow API: footer top 76px at t=1353ms, 898px at t=1746ms.

`b22918d` fixed that by hiding the footer for the window — `<html data-route-loading>` plus `visibility: hidden`. It removed the jump and introduced a worse problem, reported from the Vercel preview and reproduced locally: the footer is a dark band against a white page ground, so every navigation flashed **dark → white → dark**. On the preview, whose backend is remote, those windows are longer than local and the flashes correspondingly more visible. Repeated full-width luminance changes are a photosensitivity hazard (WCAG 2.3.1) and a vestibular one; the hold traded a jump for something less acceptable.

The measurement that settles it, front → `/blog/` with the `posts` envelope held 700ms, viewport 1280×900: with the hold, ~400px of the viewport is white for the whole window; with the hold disabled, the same region is the footer's own dark band.

## What Changes

- **Anchor the footer instead of hiding it.** `<body>` becomes a flex column of at least `100dvh` with `.site-main` taking the slack, so the footer's bottom edge is never above the viewport's. It starts where it will stay; content landing only pushes it further down, out of sight. Measured: footer bottom at the viewport edge at t=121ms and still anchored at t=797ms, with nothing hidden at any point.
- **Remove the hold entirely** — `components/nav/RoutePending.tsx`, the `data-route-loading` flag, the `visibility: hidden` rule, and the per-boundary opt-in rule that went with them. Nothing is hidden, so there is no reveal to gate behind reduce-motion and no flash to reason about.
- **Fold in the two gaps the flag could not reach.** Because the anchor is CSS with no JavaScript dependency, it also covers the first paint of a direct load (the streamed shell painted the footer under an empty `<main>` on every route) and `/calendar/`'s post-commit growth (the island rendering more than the server sent, moving the footer ~790px). Both were previously written up as out of scope; the separate `first-paint-footer-hold` change they were deferred to is withdrawn.
- **Keep the test harness the hold introduced.** `POST /__mock/delay { ms, path? }` and the signed-rebuild eviction are what make a loading window reproducible in the e2e suite; the assertions move from "the footer is hidden" to "the footer is painted, and never above the fold".

## Capabilities

### New Capabilities

- `footer-anchor`: the footer's position relative to the viewport — anchored below it whenever `<main>` is short, by layout rather than by hiding; the explicit prohibition on hiding it to stop it moving; and the mock delay plus cache eviction that let an e2e test open a real loading window and assert the anchor through a navigation.

### Modified Capabilities

None in this root. `openspec/specs/` here holds only `calendar-route`, whose requirements are unaffected. The root project's `openspec/changes/next-js-site-implementation/specs/next-headless-site` § Client navigation and design D6 describe the transition this sits inside; they gain a pointer, not a requirement change.

## Impact

- `app/sticky-footer.css` (renamed from `app/route-loading.css`) — now one layout rule rather than a hold; imported once from `app/layout.tsx`.
- `components/nav/RoutePending.tsx`, `test/component/route-pending.test.tsx` — deleted.
- `app/[[...slug]]/page.tsx`, `components/routes/RoutePostsIndex.tsx`, `components/routes/RouteCalendar.tsx` — back to plain Suspense fallbacks; `components/routes/RouteFront.tsx` and `components/routes/RouteStyleguide.tsx` lose the comments explaining why they were not wrapped.
- `lib/a11y-settings.ts` — `data-route-loading` removed from the `<html>` state attributes it documents.
- `test/mock/server.mjs`, `test/mock/api.mjs`, `test/unit/mock-controls.spec.ts` — the `/__mock/delay` control, kept.
- `test/e2e/chrome.spec.ts` — the anchor asserted through a real navigation, plus a short-route case (the 404) that needs no loading window at all. `test/e2e/receiver.spec.ts` selects its build-status callback by `buildId`, since the footer test is a second source of rebuilds.
- No API, dependency, or schema changes. `app/globals.css` stays byte-identical to the theme's `src/css/tailwind.css` (`test/unit/shared-source-drift.test.ts`); the anchor lives in its own Next-only sheet because the WordPress theme is a multi-page app whose footer never outruns its content.
