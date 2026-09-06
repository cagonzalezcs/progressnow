## Why

A client navigation commits as soon as the catch-all page's shell resolves, with `app/[[...slug]]/page.tsx`'s Suspense fallback standing in for `<main>`. `<main>` is a 0px box until the route payload lands, so the footer paints directly under the header and then drops to the bottom of the finished page. Measured front → `/blog/` against a slow API: footer top 76px at t=1353ms, 898px at t=1746ms.

`b22918d` fixed that by hiding the footer for the window — `<html data-route-loading>` plus `visibility: hidden`. It removed the jump and introduced a worse problem, reported from the Vercel preview and reproduced locally: the footer is a dark band against a white page ground, so every navigation flashed **dark → white → dark**. On the preview, whose backend is remote, those windows are longer than local and the flashes correspondingly more visible. Repeated full-width luminance changes are a photosensitivity hazard (WCAG 2.3.1) and a vestibular one; the hold traded a jump for something less acceptable.

The measurement that settles it, front → `/blog/` with the `posts` envelope held 700ms, viewport 1280×900: with the hold, ~400px of the viewport is white for the whole window; with the hold disabled, the same region is the footer's own dark band.

## What Changes

- **Keep the footer below the fold instead of hiding it.** `.site-main` carries `min-height: 100dvh`, so `<main>` alone is at least a viewport tall and the footer begins past the bottom edge in every state. Measured on `/blog/`: footer top at 976px while loading and 976px after the content lands — unmoved, and never on screen.

  A first attempt at this anchored the footer's _bottom_ edge instead, with a sticky-footer flex column. That reserves the footer's height inside the viewport: 352px of it showed during the load and slid back out to 32px when the content arrived. The bottom edge never rose above the fold, so the test written around that invariant passed while the visible defect remained — the reason the spec now names the **top** edge.

- **Remove the hold entirely** — `components/nav/RoutePending.tsx`, the `data-route-loading` flag, the `visibility: hidden` rule, and the per-boundary opt-in rule that went with them. Nothing is hidden, so there is no reveal to gate behind reduce-motion and no flash to reason about.
- **Fold in the two gaps the flag could not reach.** Because the anchor is CSS with no JavaScript dependency, it also covers the first paint of a direct load (the streamed shell painted the footer under an empty `<main>` on every route) and `/calendar/`'s post-commit growth (the island rendering more than the server sent, moving the footer ~790px). Both were previously written up as out of scope; the separate `first-paint-footer-hold` change they were deferred to is withdrawn.
- **Wash the route transition through the page ground, not the brand blue.** A full-width blue wash on every navigation reads as a flash of its own. This rule is in the shared stylesheet, so the change is made in the theme's `src/css/tailwind.css` and re-copied to `app/globals.css`; the theme's cross-document transitions get the same treatment.
- **Keep the test harness the hold introduced.** `POST /__mock/delay { ms, path? }` and the signed-rebuild eviction are what make a loading window reproducible in the e2e suite. The assertions move to "the footer's top edge is never inside the viewport", and the witness moves from page geometry to the stand-in's presence in the DOM — `<main>` is now a full viewport tall in both states, which is the point of the rule and leaves nothing for a geometric witness to detect.

## Capabilities

### New Capabilities

- `footer-anchor`: the footer's position relative to the viewport — anchored below it whenever `<main>` is short, by layout rather than by hiding; the explicit prohibition on hiding it to stop it moving; and the mock delay plus cache eviction that let an e2e test open a real loading window and assert the anchor through a navigation.

### Modified Capabilities

None in this root. `openspec/specs/` here holds only `calendar-route`, whose requirements are unaffected. The root project's `openspec/changes/next-js-site-implementation/specs/next-headless-site` § Client navigation and design D6 describe the transition this sits inside; they gain a pointer, not a requirement change.

## Impact

- `app/footer-anchor.css` (renamed from `app/route-loading.css`) — now one layout rule rather than a hold; imported once from `app/layout.tsx`.
- `app/globals.css` **and** `wp-content/themes/progressnow/src/css/tailwind.css` — the `vt-page` group's background moves from `--color-brand` to `--color-background`, edited in the theme and re-copied so `test/unit/shared-source-drift.test.ts` stays green.
- `components/nav/RoutePending.tsx`, `test/component/route-pending.test.tsx` — deleted.
- `app/[[...slug]]/page.tsx`, `components/routes/RoutePostsIndex.tsx`, `components/routes/RouteCalendar.tsx` — back to plain Suspense fallbacks; `components/routes/RouteFront.tsx` and `components/routes/RouteStyleguide.tsx` lose the comments explaining why they were not wrapped.
- `lib/a11y-settings.ts` — `data-route-loading` removed from the `<html>` state attributes it documents.
- `test/mock/server.mjs`, `test/mock/api.mjs`, `test/unit/mock-controls.spec.ts` — the `/__mock/delay` control, kept.
- `test/e2e/chrome.spec.ts` — the anchor asserted through a real navigation, plus a short-route case (the 404) that needs no loading window at all. `test/e2e/receiver.spec.ts` selects its build-status callback by `buildId`, since the footer test is a second source of rebuilds.
- No API, dependency, or schema changes. The footer rule lives in its own Next-only sheet because the WordPress theme is a multi-page app whose footer never outruns its content; the transition ground is shared, so it goes through the theme.
