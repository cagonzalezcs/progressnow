## Context

Builds on `progress-now-v4-foundation-chrome` and the shared components from `progress-now-v4-blog`. Sources: `Progress Now Calendar v4.dc.html`, `Progress Now Calendar v4 Mobile.dc.html`, `Progress Now Single Event v4.dc.html`. `EventCalendar.vue` owns month/list state, URL state and the windowed REST fetch; `MonthGrid.vue` renders cells and opens `EventDetailDialog`; `SingleEvent.vue` renders event blocks from the event envelope. Presentation changes only.

## Goals / Non-Goals

**Goals:** calendar and event pages match the three artboards; month navigation, list/grid toggle, dialog, ICS/Google links and category tints keep working; mobile grid readable at 320px.
**Non-Goals:** new event fields (agenda/host/good-to-know already exist), RSVP integrations.

## Decisions

### D1 — Toolbar is a re-skin of existing controls
Month buttons → 44px round (`border-control`, accent fill hover); month label Bowlby `clamp(1.3rem,2.4vw,1.8rem)` `min-width:280px`; view toggle → `role="group"` on an `alt` radius-999 pill with `aria-pressed` segments. Below `md` the month nav spans the row and the toggle centers beneath.

### D2 — Grid tokens, dots on mobile
Card radius 20 with `--color-line` background as the 1px gap; weekday header row brand blue; cells `min-height:96px`, in-month white, out-month `alt` with `border-muted` numerals; numeral in a 28px circle, today `yellow`. Event chips brand radius-8 (`.72rem`, ellipsis) keep the per-category tint from term meta as a left accent so category colors survive; under 700px a chip collapses to a 7px dot and a legend line renders under the grid — the list view carries details, so no information is lost.

### D3 — Rows reuse the home event row
`EventCard.vue` becomes the single row-link card (brand date tile, meta, visual outline pill at `md+`) used by home, calendar list and "more events".

### D4 — Event page composed from `PageHeader` + sidebar primitives
Hero = `PageHeader` with extras: white date tile (Bowlby day), translucent-ink category pill, when/where line, RSVP (`event_link`) and Add-to-calendar (ICS) pills. Content: description, `BlockGoodToKnow` → `alt` radius-20 panel, `BlockAgenda` → `110px 1fr` bordered rows, map/a11y-note on the same card tokens. Sidebar: `LinkListCard` rows variant (Date / Time / Location / Hosted by) + `CtaCard` "Save your spot" (omitted without a link). "More upcoming events" = next three `EventCard`s excluding the current one.

### D5 — Subscribe strip
`EmailSubscribeStrip`-style ink strip with two pills: white "Google Calendar" (existing Google subscribe URL) and outline "iCal / .ics" (existing feed URL per language).

## Risks / Trade-offs

- [Category color meaning weakened by brand-blue chips] → left accent stripe + dialog badge keep the tint; legend unchanged.
- [Seven columns at 320px] → single-letter header, dots only, `min-height` reduced to 44px on mobile.
- [Sticky sidebar overlaps long agendas on short viewports] → `align-self:start; top:108px; max-height:calc(100vh - 124px); overflow:auto`.

## Migration Plan

Components → Twig → Nuxt routes → copy → screenshots. Rollback = revert.

## Open Questions

- none.
