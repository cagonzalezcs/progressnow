## Context

`SiteShell` puts one persistent `<main>` and the `<footer>` inside the `RouteTransition` boundary; `app/globals.css` names them `vt-main` / `vt-footer` and fades each old snapshot through the brand blue into the new one. Both frontends share that stylesheet byte for byte (`test/unit/shared-source-drift.test.ts`).

The transition is not the problem. The problem is what happens after it: `app/[[...slug]]/page.tsx` is dynamic (`instant = false`) and wraps the route in `<Suspense>`, so a navigation commits — and the transition runs — as soon as the shell resolves, with the fallback in `<main>`. Until the payload lands `<main>` is a 0px box, and the footer is its only content-bearing sibling.

```
t=   0ms  /       footerTop=3442  mainH=3366
t=1353ms  /blog/  footerTop=  76  mainH=   0   ← commit, empty main
t=1746ms  /blog/  footerTop= 898  mainH= 822   ← content lands, footer slams down
```

`b22918d` hid the footer for that window. This revision replaces that mechanism, because hiding it was the wrong lever — see below.

## Goals / Non-Goals

**Goals:**

- The footer is never seen in a position it does not keep, on a navigation, a direct load, or a late island render.
- No luminance flash: nothing about the footer is hidden, faded, or repainted to achieve that.
- No JavaScript dependency, so the fix reaches first paint and no-JS visitors alike.
- Keep the shared stylesheet byte-identical to the theme's.

**Non-Goals:**

- Resizing skeletons to match the content they stand in for. The anchor makes the footer's position stable regardless, but a short skeleton still shifts the content _above_ it when the real content lands. Worth its own change.
- A route-level progress indicator. This is about not painting something in the wrong place, not about signalling load.
- `loading.tsx`. The app deliberately keeps the boundary inside the page so `searchParams` fragments and the whole-route boundary compose.

## Decisions

**Layout, not visibility.** This is the correction at the heart of this revision. The first implementation reasoned that a footer which cannot be seen cannot be seen jumping, and hid it for the window. That is true and beside the point: the footer is a dark band against a `#ffffff` page ground, so hiding it does not remove a visual event, it substitutes a larger one — a full-width dark→white→dark cycle on every navigation. Measured at 1280×900 with the `posts` envelope held 700ms, roughly 400px of the viewport went white for the whole window; with the rule disabled the same region was the footer's own dark band. Repeated full-width luminance changes are exactly what WCAG 2.3.1 is about, and the report came from a real preview before any of this was measured.

Anchoring instead asks the layout to put the footer where it belongs from the start. `<body>` is a flex column of at least `100dvh`; `.site-main` is `flex: 1 0 auto`. When `<main>` is short — loading, streaming, a short page, a late island — `<main>` absorbs the slack and the footer's bottom edge lands on the viewport's. When content arrives the footer moves further down, out of view. Nothing is hidden, so nothing flashes, and there is no reveal to gate behind reduce-motion.

_Alternative:_ keep the hold and paint the reserved area a brand colour so the flash is dark→blue→dark rather than dark→white→dark. Rejected: it still removes and restores the footer on every navigation, still needs the flag and its lifecycle, and still leaves the accessibility tree and tab order churning.

**`<body>` is the flex container, and that is not an accident of markup.** `SiteShell`'s wrappers are `display: contents`, so `<body>`'s real children are the skip link (absolutely positioned, no space), `<header>`, `<main>` and `<footer>`. The sticky header is unaffected — `position: sticky` works inside a flex item. No wrapper element is introduced, which matters: React's `<ViewTransition>` stamps names on its host children, and an extra element between the boundary and `<footer>` would take the stamp the footer expects.

**`100dvh` with a `100vh` fallback.** Mobile toolbars make `100vh` taller than the visible viewport, which would push the footer just off-screen and leave a gap on scroll; `dvh` tracks the real one. The plain `100vh` line stays first so browsers without `dvh` still get an anchor.

**No JavaScript, which is what makes it reach further than the flag did.** The previous mechanism wrote its flag from a layout effect, so on a direct load the fallback was server-streamed and painted before hydration and the flag arrived late — measured at 73ms late on `/?s=`, which turned a jump into a hide-then-show. That limitation is why `RouteFront` and `RouteStyleguide` were left unwrapped and why first paint was written up as out of scope. A CSS rule has no such window: verified over 178 sampled frames of a cold direct load of `/blog/`, the footer was never above the fold.

**Keep the mock delay and the eviction.** They were built to test the hold and they test the anchor just as well. Opening a loading window needs a cold server cache — a warm route's payload arrives whole, fallback and all, so delaying the RSC request does not split it — and a slow envelope once cold. The delay is scoped to one envelope path because the mock is shared with specs that time the calendar; an unscoped one broke both of them under `fullyParallel`.

**The assertion changed shape with the mechanism.** "The footer is hidden while a stand-in is up" is meaningless now. The invariant is that the footer's bottom edge is never above the viewport's — the position it would jump from — and that its computed `visibility` is `visible` in every frame, which is what would have caught the flash this revision fixes. The witness that a window opened is `<main>` measurably growing, a DOM fact that does not depend on the mechanism: the archive's skeleton carries no `aria-busy` of its own.

## Risks / Trade-offs

- [A page shorter than the viewport now has its footer pinned to the bottom rather than following the content] → That is the conventional sticky-footer behaviour and what the 404 view wants anyway; asserted for `/no-such-page/`.
- [`<body>` becoming a flex container could disturb an existing layout] → Its children are only the skip link, header, main and footer; everything else sits inside those. Full e2e and axe suites pass, including the styleguide's per-section screenshots, which is the visual-parity surface.
- [`dvh` support] → Chromium/Safari/Firefox current; the `100vh` declaration above it is the fallback, and the failure mode is the old behaviour, not a broken page.
- [The white area during loading is still white, just without the footer in it] → Yes: an empty `<main>` over a white ground is what "loading" looks like, and it is stable rather than flashing. Sizing skeletons to their content is the non-goal above and would fill it.
- [Nothing now warns if someone reintroduces a hold] → The spec forbids it by name, and the e2e asserts `visibility: visible` in every sampled frame.
