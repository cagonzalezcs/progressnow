## Why

The calendar and single event pages carry the chapter's organizing rhythm and have three v4 artboards (Calendar — Desktop 1440, Calendar — Mobile 390, Single Event — Desktop 1440). With the v4 foundation, chrome and the shared page-header/sidebar components (blog change) available, this change brings both to the canvas in both renderers while keeping the windowed calendar fetch, dialog and ICS behavior. Change 4 of 5.

## What Changes

- **Calendar:** v4 page header + breadcrumb; toolbar with round month buttons, Bowlby month label and segmented Month/List toggle; month grid with brand weekday header, `#D9E1F2` gaps, `alt` out-month cells, yellow today circle, brand event chips (mobile: dots + legend); list rows as row-link cards; dashed empty-month state; ink subscribe strip with Google Calendar / iCal pills.
- **Single event:** blue hero with white date tile, category pill, when/where line, RSVP + Add-to-calendar pills; content with `alt` "Good to know" panel and bordered agenda rows; sticky Details + "Save your spot" sidebar; "More upcoming events" on the `alt` band.
- `EventDetailDialog` and event blocks restyled on v4 tokens.

## Capabilities

### New Capabilities
- `events-presentation`: presentation contract for the calendar page (header, toolbar, grid, list, subscribe) and the single event (hero, content, sidebar, more events).

### Modified Capabilities
- none (`island-data-fetch` windowed fetch, `chapter-editable-content` calendar wiring, `structured-data` unchanged).

## Impact

- Shared source: `components/site/{EventCalendar,MonthGrid,EventListView,EventCard,EventDetailDialog,SingleEvent,EventBlocks,BlockAgenda,BlockGoodToKnow,BlockMap,BlockA11yNote}.vue`.
- Theme: `views/{page-calendar,single-event}.twig`; Nuxt: `routes/{RouteCalendar,RouteEvent}.vue`.
- Depends on `progress-now-v4-foundation-chrome` and the `PageHeader`/`CtaCard`/`LinkListCard` components from `progress-now-v4-blog`.
