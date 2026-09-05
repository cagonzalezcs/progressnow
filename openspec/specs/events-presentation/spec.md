# events-presentation Specification

## Purpose
Presentation contract for the calendar page (page header, toolbar, month grid, list rows, subscribe strip) and the single event (hero, content blocks, sidebar, more upcoming events) on the Progress Now v4 brand system, in both renderers (theme Twig shell + Nuxt site). Behavior lives in island-data-fetch / chapter-editable-content / structured-data.

## Requirements

### Requirement: Calendar page header
The calendar page SHALL open with the v4 page header band (`#1848D8`, `data-tone="blue"`): breadcrumb pill (Home / Calendar) from `md`, Bowlby uppercase `h1` "Event calendar" `clamp(2.2rem,4.2vw,3.4rem)` with the `#0F2E9C` offset shadow (1.9rem on mobile), and a 600 1.25rem lede (`max-width:56ch`) from the editable calendar page copy.

#### Scenario: Header renders
- **WHEN** a visitor loads the calendar page
- **THEN** the blue band shows breadcrumb, shadowed title and lede

### Requirement: Calendar toolbar
Under the header a white toolbar SHALL hold month navigation — 44px round buttons (2px `#C6CFE4` border, "←"/"→", `aria-label` Previous/Next month, accent fill on hover) flanking a Bowlby month label (`clamp(1.3rem,2.4vw,1.8rem)`, `min-width:280px`) — and a `role="group"` "View" segmented control on an `#F2F5FB` radius-999 pill with Month / List buttons (`aria-pressed`, active `#1848D8`/white). From `md` the two sit on one row; on mobile the month nav spans the width and the toggle centers below. Month changes SHALL keep the windowed fetch and URL state of `island-data-fetch`.

#### Scenario: Month navigation
- **WHEN** a visitor activates "→"
- **THEN** the label advances one month, the grid/list shows that month, and the URL reflects it

### Requirement: Month grid (v4)
Month view SHALL render a radius-20 card (shadow `0 4px 18px rgba(27,27,34,.12)`, `#D9E1F2` gap color) with a `#1848D8` weekday header (800 .85rem `.08em` white; single letters at .7rem on mobile) and a 7-column day grid of `min-height:96px` cells (white in-month, `#F2F5FB` out-of-month with `#9DA9C4` numerals). The day numeral SHALL be a 28px circle, filled `#FFC800` for today. Each event SHALL render as a `#1848D8` radius-8 chip (700 .72rem, ellipsized) that opens the event dialog/permalink as today; on mobile (<700px) events render as 7px `#1848D8` dots with a legend line "● = event day — switch to List for details." under the grid. Category colors from term meta SHALL continue to tint chips.

#### Scenario: Today and events
- **WHEN** the current month renders
- **THEN** today's numeral sits in a yellow circle and each event day shows a blue chip (desktop) or dot (mobile)

#### Scenario: Out-of-month cells
- **WHEN** the month does not start on Sunday
- **THEN** leading/trailing cells render `#F2F5FB` with `#9DA9C4` numerals

### Requirement: Event list rows
List view SHALL render the month's events as white radius-16 row cards (`max-width:900px`, shadow `0 2px 10px rgba(27,27,34,.10)`), each the link to the event: `#1848D8` radius-12 date tile (800 1.4rem day, 700 .75rem month), 700 1.18rem title, `#4A5568` "<when> · <where>", and at `md+` a visual outline "View event" pill (Bowlby .88rem, `#0E62E6`). Mobile rows use a 60px tile and 1.02rem title. An empty month SHALL render the dashed `#9DA9C4` radius-20 state "Nothing scheduled this month / check the next month or subscribe below."

#### Scenario: Empty month
- **WHEN** a month has no events in the active language
- **THEN** the dashed empty state renders in list view and the grid shows no chips in month view

### Requirement: Calendar subscribe strip
The calendar page SHALL end with an ink strip (`data-tone="ink"`): Bowlby 1.4rem "Subscribe to the calendar", `#C3CBE2` lede, and two pills — white "Google Calendar" (ink text) and outline white "iCal / .ics" — linking the existing Google subscribe URL and the ICS feed.

#### Scenario: Feed links
- **WHEN** the strip renders
- **THEN** "iCal / .ics" links the ICS feed and "Google Calendar" the Google subscribe URL for the active language

### Requirement: Event hero
A single event SHALL open with a `#1848D8` band (`data-tone="blue"`, 48px 24px 64px, `max-width:1140px`): breadcrumb pill (Home / Calendar / <title>), a row with a white radius-14 date tile (Bowlby 1.7rem day, 800 .8rem month, `#1848D8` text) and a translucent-ink category pill (`rgba(27,27,34,.22)`, 800 .8rem uppercase), the Bowlby uppercase `h1` with the `#0F2E9C` offset shadow, a 600 1.25rem "<weekday, date> · <time range> · <location>" line, and action pills — white "RSVP" (when `event_link` is set) and outline white "Add to calendar" (ICS).

#### Scenario: Hero data
- **WHEN** an event with a link renders
- **THEN** date tile, category, title, when/where line, RSVP and Add to calendar all reflect the event; without a link the RSVP pill is absent

### Requirement: Event content
Below the hero a white section SHALL lay out `minmax(300px,1fr) 310px` from `lg` (stacked below): the article column with a Bowlby "About this event" `h2`, `#3A3F4E` 1.12rem prose, the "Good to know" block as a radius-20 `#F2F5FB` panel (`#1848D8` uppercase heading, bulleted list) and the agenda as `110px 1fr` bordered rows (`#D9E1F2`, radius 14, `#1848D8` 800 times). The map/a11y-note blocks SHALL adopt the same card tokens.

#### Scenario: Blocks styled
- **WHEN** an event has good-to-know items and an agenda
- **THEN** the panel and bordered rows render in order after the description

### Requirement: Event sidebar
The sticky sidebar SHALL contain a white "Details" card (uppercase 800 heading; Date / Time / Location / Hosted by rows with `#1848D8` .82rem labels and 600 values) and a `#1848D8` "Save your spot" card (Bowlby title, lede, white "RSVP Now" pill linking `event_link`, omitted without a link).

#### Scenario: Details rows
- **WHEN** an event has a host committee
- **THEN** the Details card shows a "Hosted by" row; otherwise that row is absent

### Requirement: More upcoming events
The event page SHALL end with an `#F2F5FB` band (`data-tone="alt"`): Bowlby "More upcoming events" `h2` with an accent "Full calendar" arrow link and up to three *Event list rows* for the next events in the active language, omitting the band when none exist.

#### Scenario: Next three
- **WHEN** other future events exist
- **THEN** up to three rows render soonest-first, excluding the current event
