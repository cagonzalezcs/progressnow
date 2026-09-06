## Why

`route-loading` holds the footer through the window a _client navigation_ opens. The same defect exists on a _direct load_, and nothing covers it: the streamed shell paints header, empty `<main>` and footer together, so the footer appears near the top of the document and drops to the bottom when the content arrives. Measured on the production build with the envelope held 900ms, viewport 1280×900:

```
direct load /?probe=1     t= 11ms  footerTop=  76   mainH=   0
                          t= 84ms  footerTop=3442   mainH=3366
```

Every route does this, in both languages. `RoutePending` cannot reach it: the flag is written from a layout effect, and on a direct load the fallback is server-streamed and painted before hydration mounts anything. Wrapping `RouteFront`'s search fragment to test the idea put the flag up at t=175ms — 73ms after the footer had already painted at the wrong position, converting a jump into a hide-then-show.

The window is short on a local mock and proportional to time-to-content in the field, which is exactly where it is longest and most visible.

## What Changes

- Hold the footer through first paint on a direct load, on the same terms `route-loading` already sets for a navigation: unpainted, out of the accessibility tree and the tab order, layout space kept, revealed when there is content above it.
- Decide and record the mechanism. The candidates differ mainly in their failure mode, which is the real subject of this change:
  - **Server-stamped attribute, cleared by script.** The shell renders `<html data-route-loading>` and an inline script after the streamed content removes it. Simple; fails closed — no JavaScript means no footer, ever.
  - **CSS-only, keyed on the shell.** Style the footer from a state the _server_ can express and the _content_ can undo without script — e.g. a `:has()` rule keyed on the stand-in still being in `<main>`. Degrades safely; depends on `:has()` support and on the stand-in being expressible as a selector.
  - **Reserve the space instead of hiding.** Give the stand-in the height its content will occupy, so the footer is never in the wrong place to begin with. No hiding, no JavaScript dependency, and it fixes the content above the footer too — but it needs a believable height per route.
- Whatever is chosen, specify the no-JavaScript path explicitly. A footer that never appears without JavaScript is a worse outcome than the jump this change exists to remove.

## Capabilities

### New Capabilities

None. This extends an existing capability rather than introducing one.

### Modified Capabilities

- `route-loading`: § "The flag covers client navigation, not first paint" is the requirement this change exists to replace. It currently states that a direct load's first-paint position is out of scope and that `data-route-loading` is expected to be absent until hydration. Both change, and § "A boundary opts in when a client navigation would move the footer" loses its second condition if first paint is covered — `RouteFront`'s `?s=` fragment and `RouteStyleguide`'s kitchen sink were left unwrapped only because the flag arrives too late for them.

## Impact

- `components/nav/RoutePending.tsx` and `app/route-loading.css` — the mechanism lands here or alongside; the client flag stays for the navigation case either way.
- `components/layout/RootDocument.tsx` — if the chosen mechanism needs a server-rendered attribute or an inline script, it belongs next to the a11y bootstrap that already runs before first paint.
- `components/routes/RouteFront.tsx`, `components/routes/RouteStyleguide.tsx` — their comments record that they are unwrapped _because_ the flag arrives after first paint; both are revisited if that stops being true.
- Skeleton heights across `components/routes/**` if the reserve-the-space option wins — that option overlaps the deferred skeleton-sizing work noted as a non-goal in `route-loading`'s design.
- `test/e2e/chrome.spec.ts` — a direct-load counterpart to the navigation test, using the existing `POST /__mock/delay { ms, path? }` control.
- No API, dependency, or schema changes. `app/globals.css` stays byte-identical to the theme's sheet; the theme is a multi-page app and would need its own answer if this ever applies there.
