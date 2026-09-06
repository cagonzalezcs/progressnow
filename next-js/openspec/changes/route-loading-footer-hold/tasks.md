## 1. Replace the hold with the anchor

- [x] 1.1 Add `app/footer-anchor.css` (renamed from `app/route-loading.css`): `.site-main` with `min-height: 100dvh` and a `100vh` fallback, so `<main>` alone is a viewport tall. Document why it is Next-only, why hiding was wrong, and why the bottom-edge anchor was not enough.
- [x] 1.2 Update the single import in `app/layout.tsx`.
- [x] 1.3 Delete `components/nav/RoutePending.tsx` and `test/component/route-pending.test.tsx`.
- [x] 1.4 Restore plain Suspense fallbacks in `app/[[...slug]]/page.tsx`, `components/routes/RoutePostsIndex.tsx` and `components/routes/RouteCalendar.tsx`; drop the "why not wrapped" comments from `RouteFront` and `RouteStyleguide`.
- [x] 1.5 Remove `data-route-loading` from the `<html>` state attributes documented in `lib/a11y-settings.ts`.

## 2. Prove it, on the cases the flag could not reach

- [x] 2.1 Client navigation, cold route, `posts` held 700ms: footer top at 976px while loading and 976px after the content lands — below the fold throughout, nothing hidden.
- [x] 2.1a Reject the sticky-footer variant first tried here: anchoring the bottom edge showed 352px of footer during the load, sliding out to 32px on arrival. Recorded because the test written around it passed.
- [x] 2.2 Direct load of `/blog/`, cold, sampled from the first frame: 178 frames, footer above the fold in none.
- [x] 2.3 Short route (`/no-such-page/`): footer at the bottom of the viewport, not under the header.
- [x] 2.4 Desktop 1280×900 and mobile 375×812 screenshots at 400ms into a held navigation: viewport filled to the bottom edge by the footer, no white band.
- [x] 2.5 `/calendar/`'s post-commit island growth: `<main>` still grows, but the footer only moves further down and out of view.

## 3. Test harness

- [x] 3.1 Keep `POST /__mock/delay { ms, path? }` and its path scoping — an unscoped delay broke both calendar specs under `fullyParallel`.
- [x] 3.2 Keep the signed-rebuild eviction; a warm route's payload arrives whole, so a cold cache is required to open a window at all.
- [x] 3.3 Keep `receiver.spec.ts` selecting its build-status callback by `buildId`, since the footer test is a second source of rebuilds.
- [x] 3.4 Rewrite the e2e assertions: invariant on the footer's **top** edge never entering the viewport, plus `visibility: visible` in every frame — the pair that catches both the jump and the flash.
- [x] 3.5 Move the witness from page geometry to the stand-in's presence in the DOM: `<main>` is a full viewport tall in both states now, so nothing geometric distinguishes loading from settled. The selector covers the whole-route boundary's `aria-busy` region and a fragment's own skeleton.

## 4. Documentation

- [x] 4.1 Rewrite proposal, design and spec for the anchor; rename the capability from `route-loading` to `footer-anchor`.
- [x] 4.1a Wash the route transition through `--color-background` instead of `--color-brand`, edited in the theme's `src/css/tailwind.css` and re-copied to `app/globals.css` with the drift test green.
- [x] 4.2 Withdraw `first-paint-footer-hold`: the anchor is CSS, so first paint needs no separate mechanism and no no-JavaScript trade-off.
- [x] 4.3 Keep the pointers from the root project's `next-headless-site` § Client navigation and design D6, and the `/__mock/delay` line in `next-test-harness`.

## 5. Gates

- [x] 5.1 `npm run lint`, `npm run typecheck`, `npm test`.
- [x] 5.2 `npm run test:e2e`.
- [x] 5.3 `npm run test:a11y`.
- [ ] 5.4 Confirm on the Vercel preview — the deployed build is still the old hold, so nothing reported so far has been judged against this work. Then `openspec validate`, sync the spec and archive.
