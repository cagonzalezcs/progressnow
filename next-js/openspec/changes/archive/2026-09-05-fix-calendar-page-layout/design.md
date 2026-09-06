## Context

`RouteCalendar.tsx` is the task-3.5 `Placeholder`; parent change `next-js-site-implementation` task 6.6 is open. The Nuxt twin (`nuxt-js/app/components/routes/RouteCalendar.vue`, `site/EventCalendar.vue`, `MonthGrid.vue`, `EventListView.vue`, `EventCard.vue`, `EventDetailDialog.vue`, `lib/events.ts`) is the visual/behavioral reference and already matches root spec `events-presentation`. Already in place on the Next side: `getEvents`/`getPage`/`getSite` (tagged cache), `GET /api/events?lang&from&to` (same-origin proxy), `lib/categories.ts` (framework-free registry), `PageHeader`, `components/ui/dialog.tsx` (Radix), `SubscribeStrip` (single-pill interior variant), fixtures `page-calendar.json` + `chapter-event.json`, mock API `events` (returns one fixture event dated 2026-07-04 regardless of window), and the a11y e2e matrix (route × lang × mode).

Constraints: server components own data; islands get props; URL is the state; no browser→WordPress traffic; no global store; axe zero-violations bar; `data-route-kind="calendar"` + one `h1` per document (routes.spec); Tailwind class literals mirror the Vue twins; `AGENTS.md`: read `node_modules/next/dist/docs/` before writing Next code.

## Goals / Non-Goals

**Goals:**

- `/calendar/` and `/es/calendario/` render the v4 calendar server-first: header, toolbar, filter chips, month grid (or list), subscribe strip on first paint — no skeleton for the initial month.
- Month nav / view toggle / category filter as client state; `?view=` and `?category=` reload-stable.
- Out-of-window months refetch via `/api/events`; `role="status"` loading, ICS-link error state with Retry.
- Event dialog: Radix focus trap/restore/Escape; primary action = permalink.
- Keyboard: arrow keys move between event chips in the grid; every control named.
- Component tests (+ jest-axe) from fixtures; e2e for view/nav/dialog; a11y scan covers list view + dialog-open states.

**Non-Goals:**

- Single event page (task 6.7), 404/error (6.8), parity screenshots (6.9).
- Replacing `RouteFront` inline event rows with `EventCard` (optional follow-up).
- Changing `/api/events`, schemas, categories.json, or WP theme.
- Month-range prefetch / SWR caching beyond a simple in-memory map per island instance.
- i18n of month/weekday names beyond what Nuxt does today (English constants) — tracked as open question.

## Decisions

**D1. Server-rendered initial window as props; island refetches only outside it.**
`RouteCalendar` (server) loads `page`, `site`, `getEvents({ lang })` in parallel, resolves categories via `eventCategories(site.categories)` and passes `{ events, categories, window: { from, to } }` to `EventCalendar` (client). The island keeps `Map<"yyyy-mm", ChapterEvent[]>`-style cache seeded from props; navigating to a month whose range isn't covered calls `fetch('/api/events?lang&from&to')` with `AbortController` (latest wins).
_Why:_ parent design §Calendar + island-data-fetch "windowed fetch" intent, without a skeleton on first paint (SSR beats the Nuxt `ClientOnly` fallback). _Alternatives:_ Nuxt-style mount-time fetch → empty first paint, worse LCP, crawlers see nothing. Full-range fetch on server → unbounded payload.
_Window semantics:_ the WP envelope has no explicit range field; treat the server-loaded set as covering `[today − 1 month, today + N months]` where N = a `CALENDAR_WINDOW_MONTHS` constant (default 3, in `lib/events.ts`). Any month outside → refetch that month `[first day, last day]`. Refetched months are merged into the cache, never replacing the seed.

**D2. URL state: server reads `searchParams`, island writes `history.replaceState`.**
View/category changes are purely client-side, so the island writes `?view=`/`?category=` with `window.history.replaceState` (Next syncs its router from it, per `docs/01-app/01-getting-started/04-linking-and-navigating.md` § Native History API) — no RSC round-trip per click. The _initial_ values come from the page's `searchParams` prop, awaited inside a Suspense fragment (`CalendarWithQuery`, the `RoutePostsIndex` pattern) and passed as props; `useSearchParams` in the island was rejected after reading `use-search-params.md` § Prerendering: it client-renders the whole subtree up to the Suspense boundary, which would defeat "no skeleton on first paint". `today` is computed in the same fragment after `await connection()` — Next 16 refuses `new Date()` during prerender otherwise (verified in dev: "unstable value `new Date()` while prerendering"). Month is _not_ in the URL (matches Nuxt; see open question).
_Alternative:_ `router.replace({ scroll:false })` like `ArchiveFrame` — rejected: that pattern exists because the archive's results are server-rendered; the calendar's are not.

**D3. Component split mirrors Nuxt, one client boundary.**
`EventCalendar.tsx` (`"use client"`) owns state and renders `MonthGrid`, `EventListView`, `EventDetailDialog` — all plain function components without their own `"use client"` (they inherit the boundary). `EventCard.tsx` is a server-safe presentational component (anchor row) usable later by `RouteEvent`. `lib/events.ts` holds `parseISODate`, `WEEKDAYS`, `MONTH_NAMES`, `MONTH_SHORTS`, `monthKey`, `monthRange`, `CALENDAR_WINDOW_MONTHS` — no React import, unit-testable.
_Why:_ keeps the client bundle to one chunk for the route; presentational pieces stay testable with RTL without providers.

**D4. Categories are props, not a store.**
`eventCategories(site.categories)` on the server (already resolves WP overrides vs registry); `categoryById(id, list)` from `lib/categories.ts` used by grid/dialog. The `/api/events` envelope's `categories` are ignored on refetch (server already resolved them).
_Alternative:_ port Nuxt's reactive `EVENT_CATEGORIES` + `setCategories` — rejected: parent design forbids global stores; `lib/categories.ts` already exists for this.

**D5. Calendar subscribe strip is a new inline section, not `SubscribeStrip`.**
`SubscribeStrip` renders one pill and returns null without `href`; the calendar strip needs two pills (Google + iCal) and always renders. Implement `CalendarSubscribe` inside `EventCalendar.tsx` file scope (server-safe markup, `id="subscribe"`, `data-tone="ink"`), rendered by `RouteCalendar` after the island so it is SSR'd outside the client boundary. ICS/Google hrefs come from `page.calendar` (already absolute to WP in the envelope; mock builds them from `origin`).
_Alternative:_ extend `SubscribeStrip` with a `secondary` action — reasonable, but touches interior routes' tests for no gain now.

**D6. Grid keyboard model = roving tabindex over event chips, `role="grid"` skipped.**
Chips are `<button>`s inside a CSS grid of `<div>`s. Arrow keys move focus among chips (row-major for ←/→, same weekday ±7 days for ↑/↓); Home/End = first/last chip of the month. Cells carry `aria-label="<Weekday> <Month> <day>, N events"` via a visually-hidden span; the grid container is a `<div role="group" aria-label="<Month YYYY>">`. Empty days are not focusable.
_Why:_ full ARIA `grid` with `gridcell` semantics on a calendar of mixed content produces axe `best-practice` noise and confuses screen readers when cells contain multiple buttons; the parent design only requires "arrow-key navigation" + labelled cells. _Alternative:_ `role="grid"` — revisit if the a11y review demands it.

**D7. Dialog = shadcn `Dialog` (Radix) controlled by `selectedId`.**
`open={!!event}`, `onOpenChange(false) → setSelectedId(null)`, `showCloseButton={false}` with the custom 40px round `DialogClose`. Radix supplies focus trap/restore/Escape; a11y scan adds a "dialog open" state.

**D8. Tests.**

- `test/unit/events.spec.ts`: `parseISODate` (no UTC shift), `monthRange`, `monthKey`, window coverage.
- `test/component/route-calendar.test.tsx`: render `CalendarPage` (exported server-safe twin like `AboutPage`) with `page-calendar.json` + `chapter-event.json` + `site.json` + `routes-manifest.json`; asserts header/crumb, toolbar names, `aria-pressed`, chips, grid chip for fixture date when the visible month is forced via a `initialMonth` prop (test seam, defaults to today), list view empty state, subscribe hrefs; `axe` on month + list + dialog-open.
- `test/e2e/calendar.spec.ts`: `?view=list` reload-stable + `aria-pressed`; "→" advances label + `aria-live`; out-of-window month hits `/api/events` (network assertion) and shows `role=status`; chip → dialog → Escape restores focus.
- `test/e2e/a11y/routes.spec.ts`: add states `state-calendar-list-view`, `state-event-dialog-open`.

## Risks / Trade-offs

- [Mock `events` ignores `from`/`to` and returns a July 2026 event] → e2e navigates to July 2026 explicitly; unit/component tests inject `initialMonth`. Consider teaching the mock to filter by window (small, optional).
- [Server "today" ≠ client "today" across midnight/timezone → hydration mismatch on the yellow numeral and initial month] → compute `initialMonth` on the server and pass it as a prop; `isToday` computed client-side after mount (`useEffect`) or accept a benign mismatch on the numeral only. Chosen: pass `today` (yyyy-mm-dd) from server as prop; client uses it as-is.
- [Reading `searchParams` / `new Date()` makes the fragment dynamic; the shell above it still prerenders] → `RouteCalendar` wraps the fragment in `<Suspense fallback={<CalendarSkeleton/>}>`; header and subscribe strip render outside it.
- [`history.replaceState` vs Next router] → verified on Next 16.3.4: documented as router-integrated; the component test asserts the URL write-back, the e2e asserts reload stability.
- [Radix focus restore lands on `<body>` under jsdom] → the component test asserts the dialog closes; focus restoration is asserted in `test/e2e/calendar.spec.ts` (real Chromium).
- [Category term colors come from `site.categories` colors; high-contrast mode may not override inline `backgroundColor`] → same as Nuxt; chips also keep white text + `title`; a11y scan in high-contrast mode will confirm.
- [Bundle budget (`budget.json`) — new client chunk for calendar route] → route-level split; calendar not on the front page budget. Verify `test:budget` unaffected.
- [Task 6.6 in the parent change stays unchecked unless updated] → tick it in `../openspec/changes/next-js-site-implementation/tasks.md` as part of this change's last task.

## Migration Plan

No deploy or data migration. Ship as one PR on `feature/cg/next-js-migration-from-nuxt`. Rollback = revert the commit; `Placeholder` remains for other stub routes.

## Open Questions

- Should month be in the URL (`?month=2026-09`)? Spec text says "URL reflects it"; Nuxt doesn't do it. Default: **no** (parity with Nuxt), revisit if wanted.
- Localised month/weekday names for `es`? Nuxt ships English constants; `Intl.DateTimeFormat(lang)` is a cheap upgrade — defer unless asked.
- Move this change dir to the repo-root `openspec/` (where specs + parent change live)? Currently under `next-js/openspec/`.
