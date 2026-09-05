<script setup lang="ts">
import { computed } from "vue";
import SingleEvent from "@/components/site/SingleEvent.vue";
import { fetchSingleEvent } from "@/lib/api";
import { eventKey } from "@/lib/chapter/keys";
import type { ResolvedRoute } from "@/lib/chapter/routes";
import {
  payloadSlug,
  provideRouteLanguages,
  useChapterApi,
  useChapterData,
  useChapterSite,
  useRouteSeo,
} from "@/composables/useChapter";

/* Single event — views/single-event.twig. SingleEvent renders the v4 hero
 * through PageHeader; sidebar/strip copy comes from the site strings. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const slug = payloadSlug(props.resolved.route!);
const api = useChapterApi();
const { data: site } = await useChapterSite(lang.value);
const { data: event } = await useChapterData(eventKey(lang.value, slug), () =>
  fetchSingleEvent(api, slug, lang.value),
);

provideRouteLanguages(computed(() => event.value?.languages));
useRouteSeo(
  computed(() => event.value?.seo),
  lang,
);

const str = (key: string, fallback: string) => site.value?.strings[key] || fallback;
const labels = computed(() => ({
  crumbHome: str("blog_crumb_home", "Home"),
  crumbCalendar: str("cal_crumb_calendar", "Calendar"),
  rsvpLabel: str("event_rsvp", "RSVP"),
  addToCalendarLabel: str("event_add_calendar", "Add to calendar"),
  aboutLabel: str("event_about", "About this event"),
  detailsLabel: str("event_details", "Details"),
  dateLabel: str("event_date", "Date"),
  timeLabel: str("event_time", "Time"),
  locationLabel: str("event_location", "Location"),
  saveTitle: str("event_save_h", "Save your spot"),
  saveBody: str("event_save_p", "RSVP and we’ll send the details straight to you."),
  saveLabel: str("event_save_cta", "RSVP Now"),
  contactLabel: str("event_contact", "Questions? Contact"),
  moreLabel: str("event_more", "More upcoming events"),
  fullCalendarLabel: str("home_events_all", "Full calendar"),
  viewLabel: str("home_view_event", "View event"),
}));
</script>

<template>
  <SingleEvent
    v-if="event"
    :event="event.event"
    :categories="event.categories"
    :related="event.related"
    :show-related="event.showRelated"
    :home-url="event.homeUrl"
    :calendar-url="event.calendarUrl"
    v-bind="labels"
  />
</template>
