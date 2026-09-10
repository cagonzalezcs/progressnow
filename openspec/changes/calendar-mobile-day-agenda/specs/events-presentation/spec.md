## MODIFIED Requirements

### Requirement: Month grid (v4)
Month view SHALL render a radius-20 card (shadow `0 4px 18px rgba(27,27,34,.12)`, `#D9E1F2` gap color) with a `#1848D8` weekday header (800 .85rem `.08em` white; single letters at .7rem on mobile) and a 7-column day grid of `min-height:96px` cells (white in-month, `#F2F5FB` out-of-month with `#9DA9C4` numerals). The day numeral SHALL be a 28px circle, filled `#FFC800` for today. Each event SHALL render as a radius-8 chip (700 .72rem, white text, ellipsized) filled solid with its category term color (`#1848D8` when colors are off or unset) that opens the event dialog/permalink as today. Under 700px every in-month cell SHALL be a `min-height:52px` day control — a real `<button>` named "<Weekday>, <Month> <day>, N events" / "…, no events" (", today" appended on today), `aria-pressed` when it is the selected day, inert (`aria-disabled`, still in the arrow path) and dot-less when out of month — showing a 26px 800 .82rem numeral circle and one 7px dot per event in its category color (`#1848D8` when colors are off or unset). The selected day fills its cell `#1848D8` with a white numeral and white dots; today keeps its `#FFC800` numeral fill, replaced by a 2px `#FFC800` ring (no fill) when today is also selected. The legend under the grid SHALL read "Tap a day to see what's happening." Exactly one in-month day SHALL be selected whenever the month renders: today when the visible month is the current month, else the first in-month day with an event in the active category filter, else the 1st; the selection SHALL return to that default on month change and on category change and SHALL NOT be URL state. At ≥ 700px the selection has no visual and the chip → dialog flow is unchanged.

#### Scenario: Today and events
- **WHEN** the current month renders
- **THEN** today's numeral sits in a yellow circle and each event day shows a blue chip (desktop) or dot (mobile)

#### Scenario: Out-of-month cells
- **WHEN** the month does not start on Sunday
- **THEN** leading/trailing cells render `#F2F5FB` with `#9DA9C4` numerals and, under 700px, are inert (`aria-disabled`) day controls without dots

#### Scenario: Tap a day
- **WHEN** a visitor under 700px taps September 12, which carries two dots
- **THEN** that cell fills `#1848D8` with a white numeral and dots, its button reports `aria-pressed="true"`, the previously selected cell returns to white, and the day agenda lists September 12's two events

#### Scenario: Default selection
- **WHEN** August 2026 (not the current month) renders with events on August 4 and 18
- **THEN** August 4 is selected; when the same month renders with no events in the active filter, August 1 is selected; when September 2026 renders as the current month on September 5, September 5 is selected

#### Scenario: Today selected
- **WHEN** today is the selected day under 700px
- **THEN** the cell is `#1848D8`, the numeral is white on transparent with a 2px `#FFC800` ring and no yellow fill

#### Scenario: Month change resets the selection
- **WHEN** a visitor has selected September 12 and activates "Next month"
- **THEN** October renders with its own default day selected, not the 12th

### Requirement: Event list rows
List view SHALL render the month's events (`max-width:900px`, 12px column gap) grouped by day, preceded by a summary row (baseline-aligned, `0 4px 4px` padding): a 700 .85rem `#4A5568` "<N> events in <Month>" ("1 event in <Month>" when one) counting every event of the month in the active filter, hidden past days included, and — only when the month has past days — an `aria-pressed` `#0E62E6` 700 .85rem text button reading "Show <N> past" while past days are hidden and "Hide past events" while shown. Each day group SHALL be a `56px 1fr` grid (14px gap, items aligned to the start): a decorative (`aria-hidden`) radius-12 date badge (8px 4px padding), sticky at `top:76px`, stacking the 800 .66rem `.1em` uppercase weekday and the Bowlby 1.35rem day number — `#1848D8` on white text for upcoming days, `#1B1B22` on white text plus a "TODAY" tag (800 .58rem `.08em`, `#FFC800` on `#1B1B22` text, radius-999, 2px 6px) for today, `#F2F5FB` with `#4A5568` text for past days — beside a column (10px gap) holding an `<h3>` date heading (700 .85rem `.04em` uppercase `#4A5568`, 6px top padding, "Saturday, September 12") and one agenda card per event. Days before today SHALL be hidden until the toggle is pressed and then render at `opacity:.6` with every text line of their cards in `#1B1B22` so the composite stays ≥ 4.5:1; the toggle SHALL reset to hidden on month change and SHALL NOT be URL state. An empty month SHALL render the dashed `#9DA9C4` radius-20 state "Nothing scheduled this month / check the next month or subscribe below." with no summary row and no toggle.

#### Scenario: Empty month
- **WHEN** a month has no events in the active language
- **THEN** the dashed empty state renders in list view without a summary row, and the grid shows no chips or dots in month view

#### Scenario: Past days hidden by default
- **WHEN** September 2026 renders in list view on September 5 with three events before the 5th and six on or after it
- **THEN** the summary reads "9 events in September", the toggle reads "Show 3 past" with `aria-pressed="false"`, and only the six upcoming events render, grouped under their day headings

#### Scenario: Show past
- **WHEN** the visitor activates "Show 3 past"
- **THEN** the three past days render first with `#F2F5FB` badges and cards at `opacity:.6`, the toggle reads "Hide past events" with `aria-pressed="true"`, and activating it again hides them

#### Scenario: Today group
- **WHEN** a day group is today
- **THEN** its badge is `#1B1B22` with the "TODAY" tag and its `<h3>` still reads the full date

#### Scenario: Toggle resets on month change
- **WHEN** past days are shown and the visitor moves to the next month
- **THEN** the new month renders with past days hidden and, when it has none, without the toggle

## ADDED Requirements

### Requirement: Day agenda (compact)
Under 700px, month view SHALL render 20px below the grid a `role="region"` `aria-live="polite"` panel named "Events on selected day" for the selected day, as a 12px-gap column: a header row (baseline-aligned, `0 4px` padding) with the day in Bowlby 1.1rem `#1B1B22` ("Saturday, Sep 12" — long weekday, short month) and a 700 .85rem `#4A5568` count ("2 events" / "1 event" / "No events"); then one agenda card per event on that day, or — when the day has none — a `2px dashed #9DA9C4` radius-16 note (24px padding, 12px gap) reading "Nothing scheduled on this day. Days with a ● have events." (600 1rem) with a `#1848D8` white Bowlby .85rem `.03em` pill (12px 20px, hover `#0E62E6`) "Jump to next event · <Mon d>" that selects the first event day after the selected day, wrapping to the month's first event day, and is omitted when the month has no events in the active filter. The panel SHALL always end with a `#0E62E6` 700 .92rem text button "See the whole month as a list →" (8px 4px, underline on hover) that switches to list view. The panel SHALL be hidden at ≥ 700px.

#### Scenario: Day with events
- **WHEN** September 12 with two events is the selected day under 700px
- **THEN** the region announces "Saturday, Sep 12" and "2 events" and lists two agenda cards linking to those events

#### Scenario: Empty day jumps forward
- **WHEN** September 6 has no events and the month's next event is on September 8
- **THEN** the note renders with "Jump to next event · Sep 8", and activating it selects September 8 and lists its events

#### Scenario: Jump wraps
- **WHEN** the selected day is after the month's last event day, and the month's first event day is September 3
- **THEN** the jump button reads "Jump to next event · Sep 3" and selects September 3

#### Scenario: Month without events
- **WHEN** the visible month has no events in the active filter
- **THEN** the note renders without a jump button and the "See the whole month as a list →" button is still present

#### Scenario: See the whole month
- **WHEN** the visitor activates "See the whole month as a list →"
- **THEN** list view renders and the URL carries `view=list`

### Requirement: Agenda card
The day agenda and the list view SHALL render each event as an agenda card — a variant of the event row card whose whole surface is the link to the event permalink (the calendar page when it has none) named "View event: <title>, <Month> <day>": a `6px 1fr auto` grid (14px gap, `14px 16px 14px 14px` padding) on white, radius-14, shadow `0 2px 10px rgba(27,27,34,.10)` (card-hover shadow on hover), `#1B1B22` text, no underline; a 6px full-height radius-999 bar in the category term color (`#1848D8` when colors are off or unset); a column (4px gap, `min-width:0`) with the 700 1.02rem title, a 500 .88rem `#4A5568` "<time> · <location>" line (time alone when there is no location) and a 700 .75rem `.06em` uppercase `#4A5568` category label; and a decorative `#1848D8` 800 1.1rem "→" centered at the end. The tile-style row card SHALL remain for the single event's "More upcoming events" band and the Twig first paint.

#### Scenario: Card links to the event
- **WHEN** an event with a permalink renders as an agenda card
- **THEN** the card is one link to that permalink named "View event: <title>, <Month> <day>", shows its time and location and its category label, and opens no dialog

#### Scenario: Event without a permalink
- **WHEN** an event has no `url`
- **THEN** the agenda card links to the calendar page

### Requirement: Calendar island copy
Every visitor-facing string of the calendar island SHALL come from the `/site` `strings` map (`progressnow_i18n_strings()` slugs, Polylang-translated) with the English literal as the fallback: `cal_tap_hint` ("Tap a day to see what's happening."), `cal_day_region` ("Events on selected day"), `cal_no_events` ("No events"), `cal_event_count_one` / `cal_event_count_other` ("{n} event" / "{n} events"), `cal_day_empty` ("Nothing scheduled on this day. Days with a ● have events."), `cal_jump_next` ("Jump to next event · {date}"), `cal_see_month_list` ("See the whole month as a list →"), `cal_list_summary_one` / `cal_list_summary_other` ("{n} event in {month}" / "{n} events in {month}"), `cal_show_past` ("Show {n} past"), `cal_hide_past` ("Hide past events"), `cal_today_tag` ("TODAY"), and the toolbar's `cal_prev` ("Previous month"), `cal_next` ("Next month"), `cal_loading` ("Loading events…"), `cal_retry` ("Retry"). Placeholders are `{name}` tokens the island substitutes; plurals are a `_one` / `_other` pair chosen by `n === 1`. The seed SHALL carry a Spanish pair for each: "Toca un día para ver qué hay.", "Eventos del día seleccionado", "Sin eventos", "{n} evento" / "{n} eventos", "No hay nada programado este día. Los días con ● tienen eventos.", "Ir al próximo evento · {date}", "Ver todo el mes como lista →", "{n} evento en {month}" / "{n} eventos en {month}", "Mostrar {n} pasados", "Ocultar eventos pasados", "HOY", "Mes anterior", "Mes siguiente", "Cargando eventos…", "Reintentar". Month and weekday names remain the English constants in every language, as the month heading does today.

#### Scenario: Spanish agenda copy
- **WHEN** the Spanish calendar renders under 700px with the seeded translations
- **THEN** the legend reads "Toca un día para ver qué hay.", a two-event day counts "2 eventos", and the list toggle reads "Mostrar 3 pasados"

#### Scenario: Missing key falls back
- **WHEN** the `strings` map lacks `cal_show_past`
- **THEN** the toggle reads "Show 3 past"
