## Context

`SiteShell` puts one persistent `<main>` and the `<footer>` inside the `RouteTransition` boundary; `app/globals.css` names them `vt-main` / `vt-footer` with the shared `vt-page` class and fades each old snapshot through the brand blue into the new one. Both frontends share that stylesheet byte for byte (`test/unit/shared-source-drift.test.ts`), and the WordPress theme drives the same names through its cross-document `@view-transition`.

The transition is not the problem. The problem is what happens _after_ it: `app/[[...slug]]/page.tsx` is dynamic (`instant = false`, awaits `params` and the cached routes manifest) and wraps the route component in `<Suspense>`, so a client navigation commits — and the view transition runs — as soon as the page shell resolves, with the fallback in `<main>`. Until the route payload lands, `<main>` is a 0px box and the footer is its only content-bearing sibling.

Measured front → `/blog/`, viewport 900px, mock API delayed 900ms:

```
t=   0ms  /       footerTop=3442  mainH=3366
t=1353ms  /blog/  footerTop=  76  mainH=   0   ← commit, view transition, empty main
t=1746ms  /blog/  footerTop= 898  mainH= 822   ← content lands, footer slams down
```

`b22918d` shipped the hold. This change writes down the contract it implements, settles the rule the code applied by measurement rather than by policy, and replaces a self-referential e2e assertion with one that exercises a real loading window.

## Goals / Non-Goals

**Goals:**

- One written contract for the loading window: who raises the flag, what the footer does, when it is over.
- A stated rule for which Suspense boundaries participate, so a new route or fragment does not have to re-measure a jump to find out.
- An e2e test that fails if the wiring breaks, not one that only proves a CSS rule shipped.
- Keep the shared stylesheet byte-identical to the theme's.

**Non-Goals:**

- Resizing skeletons so they match the content they stand in for. That is the other half of this class of jump — the blog archive's `h-40` stand-in against ~450px of results — and it moves everything below it, not just the footer. Worth its own change.
- A route-level progress indicator, top-bar or spinner. The hold is about not painting something in the wrong place; it is not a loading affordance.
- `loading.tsx`. The app deliberately keeps the Suspense boundary inside the page so `searchParams`-dependent fragments and the whole-route boundary compose; switching conventions is a larger decision.
- Holding anything but the footer. `<main>`'s own content is what the visitor is waiting for.

## Decisions

**A flag on `<html>`, not a React context.** The footer is a server component rendered as a direct host child of `RouteTransition`; making its visibility reactive means either a client wrapper around it or threading a context through `SiteShell`. Both put an element between the boundary and `<footer>`, and React's `<ViewTransition>` stamps names on its host children — a wrapper would take the stamp the footer expects. A document-level attribute changes no DOM structure at all, and it matches the idiom already in use: the a11y bootstrap stamps `data-text-size`, `data-motion`, and `.a11y-contrast` on `<html>` before first paint.

_Alternative:_ a `display: contents` wrapper carrying inherited `visibility`. Works — `visibility` inherits through a box-less element — but it still changes what React stamps, and it cannot carry the fade (no box, so no `opacity`).

**Set in a layout effect, not a passive one.** React holds the view transition through mutation and layout effects; passive effects run after. A passive effect would risk the new snapshot being captured with the footer still painted, i.e. one frame of the jump surviving inside the transition. `useLayoutEffect` warns when it runs on the server and the fallback is streamed there, so the module picks `useEffect` when `window` is undefined.

**Reference-counted.** The whole-route fallback and a fragment's fallback overlap: the route shell resolves into a page whose archive fragment is still pending, and for one commit both are mounted — React runs the outgoing cleanup and the incoming effect in the same commit, before paint. A boolean would clear the flag on the first unmount and flash the footer. A module-level counter also absorbs StrictMode's mount→unmount→mount.

**`visibility: hidden`, not `display: none` or `opacity: 0`.** `visibility` keeps the layout box, so the footer's move to its final position happens with no second reflow, and it takes the footer out of the accessibility tree and the tab order — a footer that is invisible but tabbable is worse than one that jumps. `display: none` would also work visually but cannot be transitioned back without `@starting-style` / `allow-discrete`. `opacity: 0` alone leaves a focusable, screen-reader-visible footer.

**Opt in when a client navigation would move the footer.** Two conditions, both found by measurement. _Short stand-in:_ the whole-route boundary shows nothing, and the blog archive's `h-40` skeleton is ~290px short of its results and moved the footer 372px. `CalendarSkeleton` measured no movement at all (footer top 1340px before and after the fragment landed), so wrapping it would hide the footer for a window in which nothing was going to move — a regression in the other direction.

_Reached by client navigation:_ this one only surfaced under measurement. `RouteFront`'s `?s=` fragment does move the footer (~104px, its own flush), and `RouteStyleguide`'s one-line stand-in is far shorter than the sink it replaces — but neither URL is reachable by a client navigation from anywhere in the site. The search UI writes `?s=` on `/blog/`; `/styleguide/` is linked from nowhere. On a direct load the fallback is server-streamed and painted before hydration, so the flag arrives late: wrapping `RouteFront` put the flag up at t=175ms, 73ms after the footer had already painted at its wrong position. That converts a jump into a hide-then-show. Both stay unwrapped, with the measurement in a comment so the next reader does not repeat it.

**First paint is out of scope, deliberately.** The same defect exists on every direct load — the streamed shell paints header, empty `<main>`, footer, and the footer drops when the content arrives (~75ms locally with the envelope held 900ms). No client-side flag can precede that paint. The fix would be a server-rendered hold cleared by script, whose failure mode is a footer that never appears without JavaScript — a trade-off that deserves its own design rather than being absorbed here. Tracked as a follow-on change.

**No reduced-motion gate in the new sheet.** `MOTION_KILL_CSS` is injected by `applySettings` whenever the widget's setting or the media query says reduce, and its `*{transition:none !important}` already lands on the footer. A second gate would be a second thing to keep in sync. The hold itself stays in both modes: `visibility` is not motion, and the jump is exactly what a motion-sensitive visitor least wants to see.

**A delay knob on the mock, not a delayed RSC response.** The e2e suite runs against the production build, prerendered against the mock, so a `page.route` delay on the RSC request slows the payload without opening a gap between shell and content — the whole thing arrives at once and the fallback never shows. The gap comes from a slow upstream envelope on a cold cache, which only the mock can produce. `POST /__mock/delay { ms }` mirrors `/__mock/fail`, which already exists for exactly this kind of scenario steering.

_Alternative:_ keep the current test, which sets `data-route-loading` itself and asserts the footer goes. It proves the stylesheet shipped and nothing else — it would still pass if `RoutePending` were deleted. Keep it as the CSS unit of the pair; add the navigation test for the wiring.

## Risks / Trade-offs

- [A fallback that never unmounts leaves the footer hidden for the rest of the visit] → The flag's only writer is a component's mount/unmount, and every exit path unmounts it: content commits, the visitor navigates away, or `app/[[...slug]]/error.tsx` replaces the subtree. No timeout is added; a stuck flag would mean a stuck route, which is the larger bug.
- [The hidden window is as long as the slowest fragment] → On a slow connection the footer is absent for the whole load. Acceptable: there is no content above it to anchor it, and the alternative is the jump. The skeleton-sizing change (non-goal above) is what shortens it.
- [Hydrating mid-stream on a first page load hides the footer briefly] → Only when hydration wins the race against the streamed content, and the footer is below the fold on first paint. Direct loads settle with the flag clear; asserted in the spec's reveal scenario.
- [The document height changes while the flag is up, so a scrollbar can appear and disappear] → Pre-existing: `<main>` collapsing to 0px does that on its own, and `FocusManager` scrolls to top on every route change. Out of scope; `scrollbar-gutter: stable` would be the fix if it ever reads as a shift.
- [A new `/__mock/` control widens a documented test surface] → It is additive, reset by the existing `/__mock/reset`, and the mock is never in the production bundle. The header comment and `next-test-harness` § Fixture-backed mock API get the new line.
- [A second app-level stylesheet invites future drift-avoidance dumping] → The file's header states its one reason to exist (App Router state the theme has no equivalent of). Rules that both frontends share still belong in the theme's sheet, re-copied.
