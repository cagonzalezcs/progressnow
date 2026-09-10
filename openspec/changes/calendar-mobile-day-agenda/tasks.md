## 1. Strings and fixtures (theme PHP — first, every renderer's tests read `site.json`)

- [x] 1.1 `inc/i18n.php` `progressnow_i18n_strings()`: add `cal_tap_hint`, `cal_day_region`, `cal_no_events`, `cal_event_count_one/_other`, `cal_day_empty`, `cal_jump_next`, `cal_see_month_list`, `cal_list_summary_one/_other`, `cal_show_past`, `cal_hide_past`, `cal_today_tag`, `cal_prev`, `cal_next`, `cal_loading`, `cal_retry` with the English literals from the events-presentation delta
- [x] 1.2 `bin/seed.php` Spanish pairs for each new string (values in the delta); `tests/test-brand-audit.php` Spanish list gains "Toca un día"
- [x] 1.3 Regenerate `tests/fixtures/site.json` through the PHPUnit fixture writer; `tests/test-payloads.php` asserts `strings['cal_show_past']`
- [x] 1.4 Theme PHPUnit (`TestPayloads|TestContracts|TestBrandAudit`) + phpcs on `inc/i18n.php`, `bin/seed.php`, touched tests

## 2. next-js

- [x] 2.1 `lib/calendar.ts`: `DayGroup`, `groupByDay`, `defaultSelectedDay`, `nextEventDay` (wraps; filtered input), `dayHeading`, `shortDate`, `formatLabel`; `test/unit/calendar.spec.ts` covers each (wrap-around, empty month, category-filtered cells, `n === 1` plural pick)
- [x] 2.2 `useCompactCalendar()` (`useSyncExternalStore` on `(max-width: 699.98px)`, server snapshot `false`, no `matchMedia` → `false`)
- [x] 2.3 `MonthGrid.tsx`: gridcell → day `<button>` (roving `tabIndex`, `aria-label`, `aria-pressed` when compact, `aria-disabled` out of month) → chips; `has-[:focus-visible]:` ring on the gridcell; selected / today+selected classes; Enter/Space/click = `compact ? onDaySelect(key) : open(index)`; legend from `labels.tapDayHint`; testids `month-grid-day-button`, `data-selected`
- [x] 2.4 `EventCard.tsx`: `variant="agenda"` (+ `category`, `past`), `aria-label` "View event: <title>, <Month> <day>", `data-variant`
- [x] 2.5 `EventCalendar.tsx`: `selectedDay` / `showPast` state and resets (month → both, category → `selectedDay`); derived `agendaDay`, `dayEvents`, `jumpTarget`; `DayAgenda` panel (region, heading, count, cards, empty note + jump, see-list → `setView("list")`) rendered `min-[700px]:hidden`; `CalendarLabels` + `DEFAULT_CALENDAR_LABELS` extended; `calendarLabels()` in `RouteCalendar.tsx` maps the new `cal_*` keys
- [x] 2.6 `EventListView.tsx`: summary row, past toggle (`aria-pressed`), day groups with sticky `aria-hidden` badge (+ TODAY tag), `<h3>` heading, agenda cards; past groups hidden until toggled, `opacity-60` + ink text when shown; empty month block unchanged; testids per design
- [x] 2.7 `test/component/event-calendar.test.tsx`: existing gridcell queries → day buttons; compact cases behind a `matchMedia` stub — tap dotted day lists its cards, empty day shows note + jump lands on the next event day, month change and category change reset selection, see-list writes `?view=list`, list hides then reveals past days, axe clean in month + list
- [x] 2.8 `test/e2e/calendar.spec.ts` at `setViewportSize(390×844)`: tap flow, jump, see-list URL, past toggle; keyboard test updated to the day button; `test/e2e/a11y/routes.spec.ts` scans the three compact states; `test/e2e/testids.spec.ts` drives the new testids
- [x] 2.9 next-js `tsc --noEmit`, eslint, vitest, `build:mock` + e2e `calendar.spec.ts` / `testids.spec.ts` + a11y calendar scans

## 3. Theme Vue islands (`src/` — mirrored to nuxt-js in §4)

- [x] 3.1 `src/lib/calendar.ts`: `monthCells` / `DayCell` extracted from `MonthGrid.vue` + the §2.1 helpers + `todayISO()`; `src/lib/__tests__/calendar.spec.ts` (same cases as next-js)
- [x] 3.2 `MonthGrid.vue`: same cell anatomy; roving tabindex + arrows / Home / End / PageUp / PageDown; `useMediaQuery` (`@vueuse/core`) for `compact`; props `selectedDay`, `todayISO`, label props; emits `select`, `day-select`, `month-change`; Enter/Space at ≥ 700px opens the event or focuses chips (Escape back to the day)
- [x] 3.3 `EventCard.vue`: `variant="agenda"` (+ `category`, `past`)
- [x] 3.4 `EventListView.vue`: summary, past toggle, day groups, badges, `<h3>`, agenda cards; empty month unchanged
- [x] 3.5 `EventCalendar.vue`: `selectedDay` / `showPast` + resets, `DayAgenda` panel, label props for every new string plus `prevLabel` / `nextLabel` / `loadingLabel` / `retryLabel` replacing the hard-coded toolbar copy
- [x] 3.6 `views/page-calendar.twig` `calendar_props`: new label props via `pll__()`
- [x] 3.7 `tests/calendar-day-agenda.test.ts` (happy-dom, `@vue/test-utils`, `matchMedia` stub): tap and keyboard selection, jump, resets, see-list, list grouping + past toggle, labels flow from props
- [x] 3.8 Theme `vue-tsc`, eslint, vitest, PHPUnit `TestPages|TestOutputEscaping` (calendar template), phpcs on `views/page-calendar.twig` context

## 4. nuxt-js

- [x] 4.1 Copy `EventCalendar.vue`, `MonthGrid.vue`, `EventListView.vue`, `EventCard.vue` and `lib/calendar.ts` byte-identical into `app/`; add `lib/calendar.ts` to `test/unit/shared-source-drift.test.ts`
- [x] 4.2 `app/components/routes/RouteCalendar.vue` `labels`: the new `cal_*` keys with English fallbacks
- [x] 4.3 nuxt-js `nuxt typecheck`, eslint, vitest (drift + contracts)

## 5. Demo backend (Vercel snapshot)

- [x] 5.1 Seed the Spanish strings on the MAMP install (`bin/seed.php` string pass), then `NODE_EXTRA_CA_CERTS=~/.mamp-root-ca.pem node deploy/mock-api/snapshot.mjs`; confirm `snapshot.json` `/site?lang=es` carries the new keys; commit the snapshot
- [x] 5.2 From the worktree: `npx vercel link --yes --project progressnow-mock-api --scope cagonzalezcs-projects`, `npx vercel deploy --prod --yes` in `deploy/mock-api`, delete the pulled `deploy/mock-api/.env.local` (alone), then redeploy the app from the repo root

## 6. Visual verification

- [x] 6.1 Headless Playwright at 390px against MAMP for all three (`next dev`, `nuxt dev`, theme `php -S` docroot): tap a dotted day → agenda cards; empty day → note + jump; today+selected ring; list groups with TODAY tag and past toggle; `/es/` copy
- [x] 6.2 1280px unchanged for the grid, chips and dialog; list view grouped

## 7. Cleanup and commit

- [x] 7.1 `rm -rf /Users/cesargonzalez/Sites/progressnow/design_handoff_calendar_day_agenda` (main checkout, not the worktree); `git status` in the main checkout shows no `??` for it; never `git add` it
- [x] 7.2 `git commit -S` with trailers on this branch; no push
