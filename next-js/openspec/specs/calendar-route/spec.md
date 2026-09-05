# calendar-route Specification

## Purpose
The Next.js calendar page: server-rendered v4 header + initial events window, the `EventCalendar` island (URL-state view/category, month nav, grid/list, dialog, keyboard/a11y contract), same-origin `/api/events` refetch with loading/error states, and the calendar subscribe strip. Visual requirements defer to the repo-root `openspec/specs/events-presentation`.

## Requirements

### Requirement: Calendar route is server-rendered v4
`RouteCalendar` SHALL replace the placeholder and render, on first paint and without client JavaScript: the v4 `PageHeader` (wide, breadcrumb Home / `cal_crumb_calendar`, title from the page or `cal_title`, lede from the page or the chapter-region fallback), the toolbar, the category filter row, the month grid for the initial month with its events, and the calendar subscribe strip. The wrapper SHALL carry `data-route-kind="calendar"` and the document SHALL have exactly one `h1`.

#### Scenario: First paint has content
- **WHEN** `/calendar/` (or `/es/calendario/`) is requested
- **THEN** the HTML response contains the header, month label, weekday header, day cells, an event chip for every event in the initial month, and the subscribe strip — no skeleton

#### Scenario: Missing page is 404
- **WHEN** the route resolves but `getPage` returns null
- **THEN** the route calls `notFound()`

### Requirement: Initial events window comes as props
The server SHALL fetch the events envelope with `getEvents({ lang })` and pass `events`, the resolved category list (`eventCategories(site.categories)`), `today` (ISO date), and the covered window (`CALENDAR_WINDOW_MONTHS`) to the `EventCalendar` island as props. The island SHALL NOT fetch on mount for a month inside the window.

#### Scenario: In-window navigation makes no request
- **WHEN** the visitor navigates to a month inside the server-loaded window
- **THEN** the grid/list updates from props and no request to `/api/events` is made

### Requirement: Out-of-window months refetch same-origin
When the visible month lies outside the loaded window, the island SHALL request `GET /api/events?lang=<lang>&from=<first day>&to=<last day>` (same origin, never the WordPress origin), show a loading skeleton with a `role="status"` "Loading events…" message, abort any superseded request, merge the result into its month cache, and render. On failure it SHALL render the dashed error state ("We couldn't load the calendar") with the `cal_ics` link and a Retry button that re-issues the request.

#### Scenario: Out-of-window month loads
- **WHEN** the visitor advances past the loaded window
- **THEN** a `role="status"` loading message appears, one request to `/api/events` with the month's `from`/`to` is made, and the month renders with the returned events

#### Scenario: Refetch fails
- **WHEN** `/api/events` responds with a non-2xx status or the network fails
- **THEN** the error state renders with the iCal link and Retry; activating Retry repeats the request

#### Scenario: Superseded request
- **WHEN** the visitor advances two months quickly
- **THEN** the first request is aborted and only the last month's result renders

### Requirement: View and category are URL state
The island SHALL read `?view=month|list` and `?category=<id>` on load and write them back on change with `history.replaceState` (no scroll, no server round-trip). Defaults (`view=month`, `category=all`) SHALL be removed from the URL rather than written. The Month / List buttons SHALL expose `aria-pressed`; the filter chips SHALL expose `aria-pressed`; an unknown `category` or `view` value SHALL fall back to the default.

#### Scenario: List view survives reload
- **WHEN** the visitor selects "List" and reloads
- **THEN** the list view renders with `aria-pressed="true"` on "List" and the URL still contains `view=list`

#### Scenario: Category filter applies to both views
- **WHEN** `?category=chapter` is present
- **THEN** the "chapter" chip is pressed and only events with `cat === "chapter"` appear in the grid and the list

#### Scenario: Defaults clear the URL
- **WHEN** the visitor returns to "Month" and "All events"
- **THEN** `view` and `category` are absent from the query string

### Requirement: Month navigation is announced
"←" / "→" buttons (`aria-label` Previous month / Next month, 44px round) SHALL change the visible month by one; the month label (`<Month> <YYYY>`) SHALL live in an `aria-live="polite"` region so the change is announced.

#### Scenario: Advance one month
- **WHEN** "→" is activated
- **THEN** the label reads the next month and the grid/list shows that month's events

### Requirement: Grid keyboard and labels
Event chips in the month grid SHALL be buttons in a roving-tabindex group: ←/→ move to the previous/next chip in document order, ↑/↓ move to the chip in the same weekday one week earlier/later (skipping empty days), Home/End move to the first/last chip of the month. Each day cell SHALL expose an accessible label "<Weekday>, <Month> <day>" plus the event count when non-zero; the grid container SHALL be a `role="group"` named by the month label. Under 700px, event dots SHALL be `aria-hidden` and the legend line SHALL render.

#### Scenario: Arrow keys move between chips
- **WHEN** focus is on an event chip and → is pressed
- **THEN** focus moves to the next event chip and the previous chip's `tabindex` becomes -1

#### Scenario: Cell label
- **WHEN** a day has two events
- **THEN** its accessible label ends with "2 events"

### Requirement: Event dialog
Activating a chip SHALL open the event dialog (shadcn/Radix `Dialog`): date tile tinted with the category color when colors are on, Bowlby title, close button named "Close", When/Where lines, category label, description, "View event" link to the permalink (falling back to the calendar path) and "RSVP" (`target=_blank rel=noopener`) when `rsvpUrl` is set. Focus SHALL move into the dialog on open, be trapped, and return to the activating chip on close; Escape and the close button SHALL close it.

#### Scenario: Open, Escape, focus restored
- **WHEN** a chip is activated and Escape is pressed
- **THEN** the dialog is removed and focus is back on the same chip

#### Scenario: No RSVP link without URL
- **WHEN** the event has no `rsvpUrl`
- **THEN** only "View event" renders in the action row

### Requirement: List view and empty month
List view SHALL render the visible month's events (date-sorted, category-filtered) as `EventCard` rows and the dashed `cal_empty_h` / `cal_empty_p` state when there are none. Month view SHALL simply show no chips for an empty month.

#### Scenario: Empty month in list view
- **WHEN** the visible month has no events after filtering
- **THEN** the dashed empty state with `cal_empty_h` and `cal_empty_p` renders and no `EventCard` is present

### Requirement: Calendar subscribe strip
The page SHALL end with `#subscribe` (`data-tone="ink"`): `cal_subscribe_h`, `cal_subscribe_p`, a white pill `cal_google` → `page.calendar.googleCalUrl` (`target=_blank rel=noopener`) and an outline pill `cal_ics` → `page.calendar.icsUrl`. Both hrefs SHALL be used verbatim (absolute to WordPress).

#### Scenario: Strip links
- **WHEN** the page renders with the fixture envelope
- **THEN** the Google pill's href equals `calendar.googleCalUrl` and the iCal pill's href equals `calendar.icsUrl`

### Requirement: Accessibility gate
The calendar route SHALL pass axe with zero violations in every widget mode for: month view, list view, and dialog-open states, at component level (`jest-axe`) and in the `test:a11y` matrix.

#### Scenario: A11y matrix includes calendar states
- **WHEN** `test:a11y` runs
- **THEN** it scans `/calendar/` and `/es/calendario/` in month view, with `?view=list`, and with the event dialog open, and reports zero violations
