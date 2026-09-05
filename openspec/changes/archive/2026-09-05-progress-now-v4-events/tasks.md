## 1. Setup

- [x] 1.1 Re-pull the canvas and diff the Calendar / Calendar Mobile / Single Event artboards against the local copy; fold in changes

## 2. Calendar

- [x] 2.1 `EventCalendar.vue` toolbar: 44px round month buttons, Bowlby month label, segmented Month/List on an `alt` pill; mobile stacking
- [x] 2.2 `MonthGrid.vue`: brand weekday header, `--color-line` gaps, `alt` out-month cells, yellow today circle, brand event chips with category accent; dots + legend under 700px
- [x] 2.3 `EventCard.vue` as the shared row-link card; `EventListView.vue` list + dashed empty-month state
- [x] 2.4 Calendar subscribe strip (Google Calendar + iCal pills) in `page-calendar.twig` and `RouteCalendar.vue`; `PageHeader` with breadcrumb
- [x] 2.5 `EventDetailDialog.vue` on v4 tokens

## 3. Single event

- [x] 3.1 `SingleEvent.vue` hero via `PageHeader` extras: white date tile, category pill, when/where line, RSVP + Add to calendar pills
- [x] 3.2 Content blocks: `BlockGoodToKnow` `alt` panel, `BlockAgenda` bordered rows, `BlockMap` / `BlockA11yNote` card tokens
- [x] 3.3 Sidebar: `LinkListCard` rows (Date / Time / Location / Hosted by) + `CtaCard` "Save your spot"; more-upcoming-events `alt` band with three `EventCard`s
- [x] 3.4 `single-event.twig` + `RouteEvent.vue`

## 4. Verification

- [x] 4.1 Copy shared source to `site/app`; theme + `site` lint/typecheck/test; PHP tests; `generate:mock` + `verify:output`
- [x] 4.2 Screenshots (both renderers, EN + ES, HC on/off) at 1440 / 1024 / 768 / 390 / 320 against the three artboards; ICS/Google links verified per language
