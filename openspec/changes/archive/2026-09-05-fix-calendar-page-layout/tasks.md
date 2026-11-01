## 1. Foundations

- [x] 1.1 Read `node_modules/next/dist/docs/` for `useSearchParams`/Suspense, `"use client"` boundaries, and `history.replaceState` router sync; note any deprecation affecting D2
- [x] 1.2 Add `lib/events.ts`: `parseISODate`, `WEEKDAYS`, `MONTH_NAMES`, `MONTH_SHORTS`, `monthKey(date)`, `monthRange(year, month)` → `{from,to}`, `CALENDAR_WINDOW_MONTHS`, `windowCovers(today, year, month)`; no React import
- [x] 1.3 `test/unit/events.spec.ts`: local-time parse (no UTC shift), month range edges (Feb / Dec→Jan), window coverage

## 2. Presentational components

- [x] 2.1 `components/site/EventCard.tsx` — port of `EventCard.vue` (props: `event`, `fallbackUrl`, `viewLabel`, `subtle`); same class literals; row is the link with `aria-label="<viewLabel>: <title>"`
- [x] 2.2 `components/site/EventListView.tsx` — rows + dashed empty state (`emptyTitle`/`emptyBody`)
- [x] 2.3 `components/site/MonthGrid.tsx` — cells from `year/month/today/events/categories/showCategoryColors`; chips ≥700px, dots + legend <700px; cell accessible label "<Weekday>, <Month> <day>[, N events]"; container `role="group"` named by month label; `onSelect(id)`
- [x] 2.4 Roving tabindex + arrow/Home/End handling in `MonthGrid` (D6); only chips focusable; empty days skipped
- [x] 2.5 `components/site/EventDetailDialog.tsx` — shadcn `Dialog` controlled by `event | null`; tinted tile, Bowlby title, 40px `DialogClose` "Close", When/Where/category, desc, View event + optional RSVP (D7)

## 3. Island and route

- [x] 3.1 `components/site/EventCalendar.tsx` (`"use client"`): props `{ lang, events, categories, today, defaultView, showCategoryColors, labels, initialMonth? }`; month offset state; view/category from `useSearchParams` with fallback to defaults; write-back via `history.replaceState` dropping defaults (D2)
- [x] 3.2 Toolbar (nav buttons, `aria-live` label, segmented Month/List `aria-pressed`) + filter chips (`aria-pressed`, swatch dots) — class literals from `EventCalendar.vue`
- [x] 3.3 Month cache seeded from props; out-of-window detection via `windowCovers`; `fetch('/api/events?lang&from&to')` with `AbortController`, skeleton + `role="status"` "Loading events…", error state with `cal_ics` link + Retry (D1)
- [x] 3.4 `CalendarSubscribe` section (`#subscribe`, `data-tone="ink"`, Google + iCal pills from `page.calendar`) (D5)
- [x] 3.5 Rewrite `components/routes/RouteCalendar.tsx`: `Promise.all(getPage, getSite, getEvents)`, `notFound()` guard, export server-safe `CalendarPage({ page, site, events, lang, wpOrigin, today })`; `PageHeader wide` with crumbs/labels from `site.strings` (`cal_*`, `blog_crumb_home`) and lede fallback; `<Suspense fallback={<CalendarSkeleton/>}>` around the island; `data-route-kind="calendar"`; drop `Placeholder` import
- [x] 3.6 `npm run typecheck && npm run lint` clean; `npm run dev:mock` → `/calendar/` and `/es/calendario/` visually match Nuxt (`nuxt-js` `generate:mock` preview) at 375px and 1280px

## 4. Tests

- [x] 4.1 `test/component/route-calendar.test.tsx`: render `CalendarPage` with `page-calendar.json`, `chapter-event.json`, `site.json`, `routes-manifest.json`, `initialMonth` = fixture month; assert header/crumb/title, nav names, `aria-pressed` defaults, chips + swatches, fixture chip in grid, cell label with count, list view rows + empty month, subscribe hrefs; `axe` on month, list, dialog-open
- [x] 4.2 Component test: chip click opens dialog with title/When/Where/View event; no RSVP when `rsvpUrl` absent; Escape closes and focus returns to chip
- [x] 4.3 Component test: `?category=chapter` and `?view=list` initial state (mock `useSearchParams`), defaults removed on write-back
- [x] 4.4 `test/e2e/calendar.spec.ts`: `?view=list` reload-stable; "→" advances `aria-live` label; navigate to a month outside the window → one `/api/events` request with `from`/`to` + `role=status` seen; chip → dialog → Escape restores focus; in-window nav makes zero `/api/events` requests
- [x] 4.5 Optional: teach `test/mock/api.mjs` `events()` to honor `from`/`to` so out-of-window months return an empty set (keeps e2e deterministic)
- [x] 4.6 `test/e2e/a11y/routes.spec.ts`: add `state-calendar-list-view` (`?view=list`) and `state-event-dialog-open` scans in every mode; zero violations
- [x] 4.7 `npm test`, `npm run test:e2e`, `npm run test:a11y`, `npm run budget` green

## 5. Wrap-up

- [x] 5.1 Tick task 6.6 in `../openspec/changes/next-js-site-implementation/tasks.md`
- [x] 5.2 Commit (GPG-signed, trailers), do not push
