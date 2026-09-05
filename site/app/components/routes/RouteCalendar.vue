<script setup lang="ts">
import { computed } from "vue";
import EventCalendar from "@/components/site/EventCalendar.vue";
import PageHeader from "@/components/site/PageHeader.vue";
import { fetchPage } from "@/lib/api";
import { pageKey } from "@/lib/chapter/keys";
import { frontRoute, type ResolvedRoute } from "@/lib/chapter/routes";
import {
  payloadSlug,
  provideRouteLanguages,
  useChapterApi,
  useChapterData,
  useChapterRoutes,
  useChapterSite,
  useRouteSeo,
} from "@/composables/useChapter";

/* Calendar page — views/page-calendar.twig. The EventCalendar island fetches
 * its event window from REST on mount (skeleton state) exactly as today and
 * owns the designed empty/error states. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const uri = payloadSlug(props.resolved.route!);
const api = useChapterApi();
const { data: site } = await useChapterSite(lang.value);
const { data: page } = await useChapterData(pageKey(lang.value, uri), () => fetchPage(api, uri, lang.value));

provideRouteLanguages(computed(() => page.value?.languages));
useRouteSeo(
  computed(() => page.value?.seo),
  lang,
);

const routes = useChapterRoutes();
const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
const str = (key: string, fallback: string) => site.value?.strings[key] || fallback;
const labels = computed(() => ({
  subscribeTitle: str("cal_subscribe_h", "Subscribe to the calendar"),
  subscribeLede: str("cal_subscribe_p", "Add every meeting and action to your own calendar automatically."),
  googleLabel: str("cal_google", "Google Calendar"),
  icsLabel: str("cal_ics", "iCal / .ics"),
  monthLabelText: str("cal_month", "Month"),
  listLabelText: str("cal_list", "List"),
  viewLabel: str("home_view_event", "View event"),
  emptyTitle: str("cal_empty_h", "Nothing scheduled this month"),
  emptyBody: str("cal_empty_p", "Check the next month or subscribe below and never miss one."),
}));
const lede = computed(
  () =>
    page.value?.lede ||
    `Meetings, actions, trainings, and socials across ${site.value?.chapter.region_label ?? "our community"}. Everything is open to the public unless noted — bring a friend.`,
);
</script>

<template>
  <div v-if="page" class="route-calendar contents">
    <PageHeader :title="page.title || str('cal_title', 'Event calendar')" :lede="lede" :crumbs="[{ label: str('blog_crumb_home', 'Home'), href: home }]" wide />
    <ClientOnly>
      <EventCalendar
        :api-base="api"
        :lang="lang"
        default-view="month"
        :show-category-colors="true"
        :show-subscribe="true"
        :ics-url="page.calendar?.icsUrl ?? '#'"
        :google-cal-url="page.calendar?.googleCalUrl ?? '#'"
        v-bind="labels"
      />
      <template #fallback>
        <section class="bg-white px-6 py-10 md:py-14" data-tone="white" aria-busy="true">
          <div class="mx-auto max-w-[1200px] animate-pulse rounded-[20px] bg-alt" style="min-height: 520px" />
        </section>
      </template>
    </ClientOnly>
  </div>
</template>
