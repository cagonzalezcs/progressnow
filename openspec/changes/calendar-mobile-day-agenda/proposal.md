## Why

Under 700px the month grid is inert: days show category dots but tapping one does nothing, and the legend ("● = event day — switch to List for details.") sends people to a List view that is a flat run of cards with no day boundaries and the month's past events stacked on top. The design handoff (`design_handoff_calendar_day_agenda/`, reference `Progress Now Calendar v4 Mobile.dc.html`) fixes both on every renderer of the calendar island — next-js (React), the theme's Vue islands, and nuxt-js (byte mirror of the theme Vue) — so mobile visitors reach an event in one tap instead of a mode switch plus a scroll.

## What Changes

- **Compact month grid → day picker (< 700px).** Every in-month cell is a `<button aria-pressed>` with a descriptive name ("September 12, 2 events"); tapping selects the day. Selected cell fills brand blue (white numeral/dots); today keeps its yellow circle, or a yellow ring when also selected. Default selection: today in the current month, else the first event day, else the 1st. Enter/Space select on compact; the ≥ 700px chip → dialog flow is unchanged. Hint copy becomes "Tap a day to see what's happening."
- **Day agenda panel (month view, < 700px).** `aria-live="polite"` region under the grid: "Saturday, Sep 12" + "2 events"; one agenda card per event, or the dashed "Nothing scheduled on this day…" note with **Jump to next event · Sep 8** (wraps to the month's first event day; hidden when the month is empty). Always ends with **See the whole month as a list →** (sets `view=list`).
- **Agenda card = `EventCard` variant.** 6px category bar, 700 title, "time · location", uppercase category label, `→`; whole card links to `event.url || fallbackUrl` (no dialog). The tile-style row stays for the single event's "More upcoming events" band and the Twig no-JS first paint.
- **List view → day groups (all widths).** Summary "9 events in September" (counts hidden past too) + **Show 3 past** / **Hide past events** toggle (`aria-pressed`); per day a decorative sticky date badge (blue upcoming, ink + **TODAY** tag today, alt past) beside an `<h3>` date heading and agenda cards. Past days (`date < today`) hidden by default, 0.6 opacity when shown. Empty month keeps the existing dashed state, no summary row.
- **State + helpers.** `selectedDay` and `showPast` live in the calendar island, reset on month change, `selectedDay` also on category change; neither is URL state. Pure helpers `groupByDay`, `defaultSelectedDay`, `nextEventDay` beside `monthCells` (next-js `lib/calendar.ts`; theme `src/lib` twin mirrored to nuxt-js).
- **Copy.** New translatable strings (tap hint, region label, counts, day-empty body, jump, see-month, list summary, show/hide past, TODAY) registered as `cal_*` in `inc/i18n.php` with ES, delivered through the `/site` `strings` map to next-js `calendarLabels()`, nuxt-js `RouteCalendar.vue`, and the Twig island props. Additive contract change; missing keys fall back to English defaults.
- **Tests.** Vitest for the helpers (wrap-around, filtered input); next-js RTL + Playwright at 390px (tap dotted day → cards; empty day → note + jump lands on next event day; month change resets; see-month writes `?view=list`; list hides/reveals past; axe on the new states); theme Vue vitest (`@vue/test-utils`, happy-dom) for day selection and grouping; theme `site.json` fixture + string registration coverage.

## Capabilities

### New Capabilities
- none.

### Modified Capabilities
- `events-presentation`: "Month grid (v4)" — compact days are selectable buttons with selected/today states and the new hint; ADDED "Day agenda (compact)" requirement; "Event list rows" — day-grouped list with summary, past toggle, date badges and the agenda card variant.
- `next-accessibility`: "Keyboard-complete interactions" — compact day selection by keyboard, `aria-pressed` days, polite live region for the agenda; axe gate covers the day-agenda and grouped-list states at a mobile viewport.
- `island-empty-states`: calendar gains a day-level empty state ("Nothing scheduled on this day" + jump to next event) beside the month-level one.

## Impact

- **next-js (first):** `lib/calendar.ts`, `components/site/calendar/{EventCalendar,MonthGrid,EventListView,EventCard}.tsx`, `components/routes/RouteCalendar.tsx` (`calendarLabels`), `test/unit/calendar.spec.ts`, `test/component/event-calendar.test.tsx`, `test/e2e/calendar.spec.ts`, `test/e2e/a11y/routes.spec.ts`, `test/e2e/testids.spec.ts` (new testids: day button, agenda region/card, list group/badge/toggle).
- **Theme Vue islands:** `src/components/site/{EventCalendar,MonthGrid,EventListView,EventCard}.vue`, `src/lib` helpers, `views/page-calendar.twig` (new label props), `inc/i18n.php` (`cal_*` EN/ES), `tests/fixtures/site.json`, new `tests/*.test.ts` Vue coverage. Vue `MonthGrid` has no roving tabindex today; the compact day buttons get one so the grid stays a single tab stop (parity with next-js).
- **nuxt-js:** `app/components/site/*.vue` byte mirror of the theme (drift rule, `test/unit/shared-source-drift.test.ts`), `app/lib` helper twin, `app/components/routes/RouteCalendar.vue` label props. Path-only under `single-source-shared-ui` later; this change edits both copies under today's rule.
- **Contract:** `/site` `strings` map gains keys (additive), including the four calendar keys next-js already reads but the theme never registered (`cal_prev`, `cal_next`, `cal_loading`, `cal_retry`). ES pairs seeded through `bin/seed.php`; `deploy/mock-api` snapshot refreshed and redeployed in this change so the Vercel demo carries the new copy.
- **Not changed:** ≥ 700px month grid, `EventDetailDialog`, REST endpoints, URL state shape, Twig no-JS first paint, loading/failed states. Nested `next-js/openspec/specs/calendar-route` is left to `repo-structure-consolidation`'s fold; the root delta is authoritative.
- **Handoff input is transient:** `design_handoff_calendar_day_agenda/` (main checkout, untracked) is the visual source while implementing; tasks end by deleting `/Users/cesargonzalez/Sites/progressnow/design_handoff_calendar_day_agenda` before the commit. It is never committed; the delta specs carry the values.
- **Ordering:** theme (strings) before frontends is not required — every label has an English default.
