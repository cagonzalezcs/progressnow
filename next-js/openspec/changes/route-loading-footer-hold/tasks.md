## 1. Verify what shipped against the written contract

- [x] 1.1 Read `components/nav/RoutePending.tsx` against spec § "A route's loading window is flagged on `<html>`": single writer, layout effect on mount and cleanup on unmount, module-level counter, `useEffect` fallback when `window` is undefined. Fix any divergence; the spec is the contract, `b22918d` is the draft.
- [x] 1.2 Read `app/route-loading.css` against spec § "The footer is held back for that window": `visibility: hidden` plus `opacity: 0` with `transition: none` while flagged, 200ms opacity fade on the base rule, no reduced-motion gate of its own.
- [x] 1.3 Confirm `app/route-loading.css` is imported once, from `app/layout.tsx`, after `./globals.css`, and that `npm test` still passes `test/unit/shared-source-drift.test.ts`.

## 2. Settle which boundaries opt in

- [x] 2.1 Audit `components/routes/RouteCalendar.tsx`: measure the footer's top before and after the calendar fragment lands (probe below), confirm `CalendarSkeleton` holds its space, and leave it unwrapped. Record the measurement in a code comment so the next reader does not re-litigate it.
- [x] 2.2 Audit `components/routes/RouteFront.tsx`'s `SearchFragment` (`fallback={null}`) on `/?s=…`. Measured: the results section is ~104px and lands in its own flush, moving the footer — but `?s=` on `/` is only ever a direct load (the search UI writes it on `/blog/`), so the flag arrives after first paint. Leave unwrapped per spec § "A boundary opts in when a client navigation would move the footer"; record the measurement and the reason in a comment.
- [x] 2.3 Sweep every other `<Suspense>` in `components/routes/**` and `app/**` and apply the two-condition rule; in each unwrapped case record which condition it fails. Known: `RouteStyleguide`'s kitchen-sink boundary has a one-line stand-in for a very tall section, but `/styleguide/` is linked from nowhere and is direct-load only.

## 3. Deterministic loading window in the mock

- [x] 3.1 Add `POST /__mock/delay { ms }` to `test/mock/server.mjs` next to `/__mock/fail`: validate `ms` as a non-negative number, store it in the mock's state, and delay every `progressnow/v1` envelope response by it.
- [x] 3.2 Clear the delay in `POST /__mock/reset` alongside the other overlays.
- [x] 3.3 Document the new control in the server's header comment block, in the same shape as the surrounding entries.
- [x] 3.4 Add a unit or e2e-level check that `/__mock/delay` then `/__mock/reset` restores undelayed responses, so the knob cannot silently stop working and make the navigation test vacuous.

## 4. Tests

- [x] 4.1 Extend `test/component/route-pending.test.tsx` to cover the spec's scenarios not yet asserted: the `aria-busy` stand-in vs. a supplied skeleton, and the overlapping-fallback ordering.
- [x] 4.2 Add the navigation e2e to `test/e2e/chrome.spec.ts`: set a mock delay, sample the footer's rect, computed `visibility`, and whether a stand-in occupies `<main>` on every animation frame across a front → `/blog/` navigation; assert at least one sampled frame has a stand-in, and that the footer's `visibility` is `hidden` in every such frame. Reset the delay in a fixture teardown.
- [x] 4.3 Add the in-page-update guard: type a query on an already-loaded `/blog/` and assert `data-route-loading` is never set and the `contentinfo` landmark never disappears.
- [x] 4.4 Keep the existing hand-driven CSS assertion as the stylesheet's own test, retitled so the pair reads as "the rule ships" and "the wiring works".
- [x] 4.5 Add a reduced-motion pass: with `reduceMotion` set, navigate through a delayed window and assert the footer was held and then revealed with no transition.

## 5. Documentation

- [x] 5.1 List `data-route-loading` in the `<html>` state attributes documented in `lib/a11y-settings.ts`, with a pointer to `components/nav/RoutePending.tsx`.
- [x] 5.2 Add a pointer from the root project's `openspec/changes/next-js-site-implementation/specs/next-headless-site` § Client navigation (and design D6's navigation paragraph) to this capability, so the transition and the window after it are findable from each other.
- [x] 5.3 Note the new `/__mock/delay` control in `next-test-harness` § Fixture-backed mock API.

## 6. Gates

- [x] 6.1 `npm run lint`, `npm run typecheck`, `npm test` clean.
- [x] 6.2 `npm run test:e2e` clean.
- [x] 6.3 `npm run test:a11y` — no _new_ violations. Five pre-existing failures on `/calendar/` (adjacent-month day numbers at 2.15:1 contrast) and one pre-existing `test/component/route-event.test.tsx` failure are tracked separately; confirm the count and the routes are unchanged by this work.
- [ ] 6.4 `openspec validate route-loading-footer-hold`, then sync the spec and archive.

## 7. Follow-on

- [x] 7.1 Propose a separate change for the first-paint jump: on every direct load the streamed shell paints the footer under an empty `<main>` and it drops when the content arrives (~75ms locally with the envelope held 900ms; proportionally longer on a slow connection). Out of this capability per spec § "The flag covers client navigation, not first paint" — it needs a server-rendered mechanism and a decision on the no-JavaScript failure mode.
