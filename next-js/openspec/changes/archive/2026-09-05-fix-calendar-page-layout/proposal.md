## Why

`/calendar/` in the Next.js app still renders the task-3.5 `Placeholder` chrome (bare `h1` + "N event(s)" status line). The v4 calendar (header band, toolbar, month grid, list view, dialog, subscribe strip) shipped in nuxt-js was never ported — parent change `next-js-site-implementation` task 6.6 is unchecked. Visitors see an unstyled stub instead of the designed page.

## What Changes

- Replace the `RouteCalendar` placeholder with the full v4 calendar page, twin of `nuxt-js/app/components/routes/RouteCalendar.vue` + `EventCalendar.vue`:
  - `PageHeader` (wide, blue band, breadcrumb Home / Calendar, editable lede fallback).
  - `EventCalendar` client island: month nav (`aria-live` label, 44px round buttons), Month/List segmented control (`aria-pressed`), category filter chips (`?category=`), `?view=` URL state.
  - `MonthGrid`: radius-20 card, brand weekday header, today numeral in yellow, category-colored chips ≥700px / dots <700px + legend.
  - `EventListView` + `EventCard`: row-link cards for the visible month, dashed `cal_empty_*` state.
  - `EventDetailDialog` on top of `components/ui/dialog` (focus trap/restore/Escape).
  - Calendar subscribe strip: ink band, Google Calendar + iCal/.ics pills from `page.calendar.{googleCalUrl,icsUrl}`.
- Data flow differs from Nuxt: server renders the initial events window as props (`getEvents` in `RouteCalendar`); out-of-window months fetch same-origin `/api/events?lang&from&to` with `role="status"` loading and the ICS-link error state. No browser-to-WordPress traffic.
- Categories resolved server-side via `lib/categories.ts` (`eventCategories(site.categories)`) and passed down; no reactive store.
- Tests: component tests + jest-axe from `page-calendar.json` / `chapter-event.json`; e2e for `?view=list`, month nav, dialog keyboard.
- Checks off parent task 6.6.

## Capabilities

### New Capabilities

- `calendar-route`: the Next.js calendar page — server-rendered v4 header + initial events window, the `EventCalendar` island (URL-state view/category, month nav, grid/list, dialog, keyboard/a11y contract), same-origin `/api/events` window refetch with loading/error states, and the calendar subscribe strip. Visual requirements defer to the root `openspec/specs/events-presentation`; this spec pins the Next-specific data flow and interaction contract.

### Modified Capabilities

None. Root specs `events-presentation` (Calendar page header / toolbar / Month grid (v4) / Event list rows / Calendar subscribe strip), `island-data-fetch` (Windowed calendar fetch), and `island-empty-states` are implemented as written; no spec-level behavior changes.

## Impact

- `components/routes/RouteCalendar.tsx` — rewrite; drops `Placeholder` import.
- New `components/site/`: `EventCalendar.tsx` (client), `MonthGrid.tsx`, `EventListView.tsx`, `EventCard.tsx`, `EventDetailDialog.tsx` (client). `EventCard` shared later by single event (task 6.7) and could replace the inline rows in `RouteFront`.
- New `lib/events.ts`: `parseISODate`, `WEEKDAYS`, `MONTH_NAMES`, `MONTH_SHORTS` (framework-free; categories stay in `lib/categories.ts`).
- Consumes existing `app/api/events/route.ts`, `getEvents`/`getSite` in `lib/data`, `components/ui/dialog.tsx`, `PageHeader`.
- Styleguide (`components/styleguide/examples/calendar-example.tsx`) may gain the site calendar demo; not required.
- No API, dependency, or schema changes. `Placeholder` remains for `RouteEvent`/`RoutePost`/`RoutePostsIndex` until their tasks land.
