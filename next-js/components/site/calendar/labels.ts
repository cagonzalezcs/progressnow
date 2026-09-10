/* Calendar island copy (openspec events-presentation § Calendar island copy):
 * every visitor-facing string with its English default. RouteCalendar maps the
 * `/site` `strings` slugs (`cal_*`, inc/i18n.php) onto these keys; a missing
 * key keeps the default. `{n}` / `{month}` / `{date}` are substituted by
 * `formatLabel`; plurals are a `One` / `Other` pair picked by `n === 1`. */
export interface CalendarLabels {
  monthLabelText: string;
  listLabelText: string;
  viewGroupLabel: string;
  filterLabel: string;
  allEventsLabel: string;
  prevLabel: string;
  nextLabel: string;
  viewLabel: string;
  rsvpLabel: string;
  closeLabel: string;
  emptyTitle: string;
  emptyBody: string;
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  icsLabel: string;
  /** compact grid legend */
  tapDayHint: string;
  /** day agenda region name */
  dayRegionLabel: string;
  noEvents: string;
  eventCountOne: string;
  eventCountOther: string;
  dayEmptyBody: string;
  /** "Jump to next event · {date}" */
  jumpToNext: string;
  seeMonthList: string;
  /** "{n} event in {month}" */
  listSummaryOne: string;
  listSummaryOther: string;
  /** "Show {n} past" */
  showPast: string;
  hidePast: string;
  todayTag: string;
}

export const DEFAULT_CALENDAR_LABELS: CalendarLabels = {
  monthLabelText: "Month",
  listLabelText: "List",
  viewGroupLabel: "View",
  filterLabel: "Filter:",
  allEventsLabel: "All events",
  prevLabel: "Previous month",
  nextLabel: "Next month",
  viewLabel: "View event",
  rsvpLabel: "RSVP",
  closeLabel: "Close",
  emptyTitle: "Nothing scheduled this month",
  emptyBody: "Check the next month or subscribe below and never miss one.",
  loading: "Loading events…",
  errorTitle: "We couldn’t load the calendar",
  errorBody: "Try again in a moment — or subscribe with",
  retry: "Retry",
  icsLabel: "iCal / .ics",
  tapDayHint: "Tap a day to see what’s happening.",
  dayRegionLabel: "Events on selected day",
  noEvents: "No events",
  eventCountOne: "{n} event",
  eventCountOther: "{n} events",
  dayEmptyBody: "Nothing scheduled on this day. Days with a ● have events.",
  jumpToNext: "Jump to next event · {date}",
  seeMonthList: "See the whole month as a list →",
  listSummaryOne: "{n} event in {month}",
  listSummaryOther: "{n} events in {month}",
  showPast: "Show {n} past",
  hidePast: "Hide past events",
  todayTag: "TODAY",
};
