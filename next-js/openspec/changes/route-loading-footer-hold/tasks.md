## 1. Replace the hold with the anchor

- [x] 1.1 Add `app/sticky-footer.css` (renamed from `app/route-loading.css`): `<body>` a flex column of `100dvh` with a `100vh` fallback, `.site-main` taking the slack. Document why it is Next-only and why hiding was wrong.
- [x] 1.2 Update the single import in `app/layout.tsx`.
- [x] 1.3 Delete `components/nav/RoutePending.tsx` and `test/component/route-pending.test.tsx`.
- [x] 1.4 Restore plain Suspense fallbacks in `app/[[...slug]]/page.tsx`, `components/routes/RoutePostsIndex.tsx` and `components/routes/RouteCalendar.tsx`; drop the "why not wrapped" comments from `RouteFront` and `RouteStyleguide`.
- [x] 1.5 Remove `data-route-loading` from the `<html>` state attributes documented in `lib/a11y-settings.ts`.

## 2. Prove it, on the cases the flag could not reach

- [x] 2.1 Client navigation, cold route, `posts` held 700ms: footer bottom on the viewport edge at t=121ms and still anchored at t=797ms, nothing hidden.
- [x] 2.2 Direct load of `/blog/`, cold, sampled from the first frame: 178 frames, footer above the fold in none.
- [x] 2.3 Short route (`/no-such-page/`): footer at the bottom of the viewport, not under the header.
- [x] 2.4 Desktop 1280×900 and mobile 375×812 screenshots at 400ms into a held navigation: viewport filled to the bottom edge by the footer, no white band.
- [x] 2.5 `/calendar/`'s post-commit island growth: `<main>` still grows, but the footer only moves further down and out of view.

## 3. Test harness

- [x] 3.1 Keep `POST /__mock/delay { ms, path? }` and its path scoping — an unscoped delay broke both calendar specs under `fullyParallel`.
- [x] 3.2 Keep the signed-rebuild eviction; a warm route's payload arrives whole, so a cold cache is required to open a window at all.
- [x] 3.3 Keep `receiver.spec.ts` selecting its build-status callback by `buildId`, since the footer test is a second source of rebuilds.
- [x] 3.4 Rewrite the e2e assertions: witness on `<main>` growing (the archive skeleton carries no `aria-busy`), invariant on the footer's bottom edge never rising above the viewport's, plus `visibility: visible` in every frame — the assertion that would have caught the flash.

## 4. Documentation

- [x] 4.1 Rewrite proposal, design and spec for the anchor; rename the capability from `route-loading` to `footer-anchor`.
- [x] 4.2 Withdraw `first-paint-footer-hold`: the anchor is CSS, so first paint needs no separate mechanism and no no-JavaScript trade-off.
- [x] 4.3 Keep the pointers from the root project's `next-headless-site` § Client navigation and design D6, and the `/__mock/delay` line in `next-test-harness`.

## 5. Gates

- [x] 5.1 `npm run lint`, `npm run typecheck`, `npm test`.
- [x] 5.2 `npm run test:e2e`.
- [x] 5.3 `npm run test:a11y`.
- [ ] 5.4 Confirm on the Vercel preview that the reported flashes are gone, then `openspec validate`, sync the spec and archive.
