<script setup lang="ts">
/* Single event island (openspec progress-now-v4-events D4, specs "Event hero"
 * … "More upcoming events"). Hero = PageHeader with extras (white date tile +
 * translucent-ink category pill before the h1; when/where lede; RSVP +
 * Add-to-calendar pills). Content = "About this event" + event blocks on the
 * v4 tokens; sticky sidebar = LinkListCard rows (Date / Time / Location) +
 * CtaCard "Save your spot" (omitted without an RSVP link); "More upcoming
 * events" = EventCard rows on the alt band. views/single-event.twig mirrors
 * the crawlable shell with the same class recipes. */
import { computed } from "vue";
import ImageSlot from "@/components/site/blog/ImageSlot.vue";
import CtaCard from "@/components/site/CtaCard.vue";
import DashedNote from "@/components/site/DashedNote.vue";
import EventBlocks from "@/components/site/EventBlocks.vue";
import EventCard from "@/components/site/EventCard.vue";
import LinkListCard from "@/components/site/LinkListCard.vue";
import PageHeader from "@/components/site/PageHeader.vue";
import {
  categoryById,
  type EventCategory,
  MONTH_NAMES,
  MONTH_SHORTS,
  parseISODate,
  type RelatedEvent,
  setCategories,
  type SingleEventData,
} from "@/lib/events";

const props = withDefaults(
  defineProps<{
    event: SingleEventData;
    /** WP term-driven categories — replaces the registry palette when provided */
    categories?: EventCategory[];
    related?: RelatedEvent[];
    showRelated?: boolean;
    homeUrl?: string;
    calendarUrl?: string;
    /** translated UI strings */
    crumbHome?: string;
    crumbCalendar?: string;
    rsvpLabel?: string;
    addToCalendarLabel?: string;
    aboutLabel?: string;
    detailsLabel?: string;
    dateLabel?: string;
    timeLabel?: string;
    locationLabel?: string;
    saveTitle?: string;
    saveBody?: string;
    saveLabel?: string;
    contactLabel?: string;
    moreLabel?: string;
    fullCalendarLabel?: string;
    viewLabel?: string;
  }>(),
  {
    categories: undefined,
    related: () => [],
    showRelated: true,
    homeUrl: "/",
    calendarUrl: "/calendar/",
    crumbHome: "Home",
    crumbCalendar: "Calendar",
    rsvpLabel: "RSVP",
    addToCalendarLabel: "Add to calendar",
    aboutLabel: "About this event",
    detailsLabel: "Details",
    dateLabel: "Date",
    timeLabel: "Time",
    locationLabel: "Location",
    saveTitle: "Save your spot",
    saveBody: "RSVP and we’ll send the details straight to you.",
    saveLabel: "RSVP Now",
    contactLabel: "Questions? Contact",
    moreLabel: "More upcoming events",
    fullCalendarLabel: "Full calendar",
    viewLabel: "View event",
  },
);

if (props.categories && props.categories.length > 0) setCategories(props.categories);

const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const category = computed(() => categoryById(props.event.cat));
const date = computed(() => parseISODate(props.event.date));
const dayNum = computed(() => String(date.value.getDate()).padStart(2, "0"));
const monthShort = computed(() => MONTH_SHORTS[date.value.getMonth()]!.toUpperCase());
/** "Tuesday, September 8, 2026" */
const longDate = computed(
  () => `${WEEKDAYS_LONG[date.value.getDay()]}, ${MONTH_NAMES[date.value.getMonth()]} ${date.value.getDate()}, ${date.value.getFullYear()}`,
);

const isOnline = computed(() => props.event.locationType === "online");
const locationLine = computed(() => {
  if (isOnline.value) return "Online · link shared on RSVP";
  const place = [props.event.venue, props.event.city].filter(Boolean).join(" · ");
  if (props.event.locationType === "hybrid") return place ? `${place} · or online` : "In person or online";
  return place || "Location TBA";
});
/** hero lede: "<weekday, date> · <time> · <location>" */
const whenWhere = computed(() =>
  [longDate.value, props.event.time, locationLine.value].filter(Boolean).join(" · "),
);

const detailRows = computed(() => {
  const rows = [
    { label: props.dateLabel, value: longDate.value },
    ...(props.event.time ? [{ label: props.timeLabel, value: props.event.doorsTime ? `${props.event.time} · doors ${props.event.doorsTime}` : props.event.time }] : []),
    { label: props.locationLabel, value: locationLine.value },
  ];
  return rows;
});

const hasContact = computed(
  () => props.event.contact.name !== "" || props.event.contact.email !== "" || props.event.contact.phone !== "",
);
const hasImage = computed(() => Boolean(props.event.featuredImage.src));
const hasBody = computed(() => hasImage.value || props.event.summary !== "" || props.event.blocks.length > 0);
const moreEvents = computed(() => (props.showRelated ? props.related.slice(0, 3) : []));

const WHITE_PILL =
  "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
const OUTLINE_PILL =
  "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
</script>

<template>
  <div class="single-event">
    <PageHeader
      :title="event.title"
      :lede="whenWhere"
      :crumbs="[
        { label: crumbHome, href: homeUrl },
        { label: crumbCalendar, href: calendarUrl },
      ]"
    >
      <template #before>
        <div class="flex flex-wrap items-center gap-3.5 md:gap-[18px]">
          <span aria-hidden="true" class="flex flex-col rounded-[12px] bg-white px-3.5 py-2.5 text-center text-brand md:rounded-[14px] md:px-[18px] md:py-3">
            <span class="font-display text-[1.4rem] leading-[1.05] md:text-[1.7rem]">{{ dayNum }}</span>
            <span class="text-[0.72rem] font-extrabold tracking-[0.1em] md:text-[0.8rem]">{{ monthShort }}</span>
          </span>
          <a :href="`${calendarUrl}?category=${event.cat}`" class="rounded-full bg-ink/[.22] px-3.5 py-[5px] text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white no-underline hover:underline hover:underline-offset-4 md:px-4 md:py-1.5 md:text-[0.8rem]">
            {{ category.label }}
          </a>
        </div>
      </template>
      <div class="flex flex-wrap gap-2.5 md:gap-3.5">
        <a v-if="event.rsvpUrl" :href="event.rsvpUrl" target="_blank" rel="noopener" :class="WHITE_PILL">{{ rsvpLabel }}</a>
        <a v-if="event.icsUrl || event.gcalUrl" :href="event.icsUrl || event.gcalUrl" :class="OUTLINE_PILL">{{ addToCalendarLabel }}</a>
      </div>
    </PageHeader>

    <!-- Content + sidebar -->
    <section class="bg-white px-6 pb-14 pt-10 md:pb-24 md:pt-16" data-tone="white">
      <div class="mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14 lg:[grid-template-columns:minmax(300px,1fr)_310px]">
        <article class="flex min-w-0 flex-col gap-[18px] md:gap-6">
          <h2 v-if="hasBody" class="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.6vw,2.2rem)] md:leading-[1.1]">{{ aboutLabel }}</h2>
          <figure v-if="hasImage" class="m-0 flex flex-col">
            <div class="aspect-video overflow-hidden rounded-[16px] bg-white md:rounded-[20px]">
              <ImageSlot :src="event.featuredImage.src" :alt="event.featuredImage.alt" loading="eager" />
            </div>
            <figcaption v-if="event.featuredImage.caption || event.featuredImage.credit" class="mt-3 text-[0.9rem] leading-[1.5] text-muted">
              {{ event.featuredImage.caption }} {{ event.featuredImage.credit }}
            </figcaption>
          </figure>
          <p v-if="event.summary" class="m-0 text-[1.08rem] font-semibold leading-[1.6] text-ink md:text-[1.22rem] md:leading-[1.65]">{{ event.summary }}</p>
          <EventBlocks :blocks="event.blocks" />
        </article>

        <aside
          aria-label="Event details"
          class="flex flex-col gap-6 lg:sticky lg:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] lg:max-h-[calc(100vh-124px)] lg:overflow-auto"
        >
          <LinkListCard :heading="detailsLabel" :rows="detailRows" class="[&_.row-label]:text-brand" />
          <CtaCard v-if="event.rsvpUrl" id="rsvp" :title="saveTitle" :body="saveBody" :href="event.rsvpUrl" :label="saveLabel" external />
          <DashedNote v-if="hasContact" :heading="contactLabel">
            <p v-if="event.contact.name" class="font-bold text-ink">{{ event.contact.name }}</p>
            <p v-if="event.contact.email"><a :href="`mailto:${event.contact.email}`">{{ event.contact.email }}</a></p>
            <p v-if="event.contact.phone"><a :href="`tel:${event.contact.phone.replace(/[^0-9+]/g, '')}`">{{ event.contact.phone }}</a></p>
          </DashedNote>
        </aside>
      </div>
    </section>

    <!-- More upcoming events -->
    <section v-if="moreEvents.length > 0" class="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16" data-tone="alt">
      <div class="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7">
        <div class="flex flex-wrap items-baseline justify-between gap-4">
          <h2 class="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">{{ moreLabel }}</h2>
          <a :href="calendarUrl" class="hidden items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:flex">
            {{ fullCalendarLabel }}
            <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-5 w-10 flex-none fill-accent"><path d="M0 8.4h26v3.2H0z" /><path d="M24 1.5 38.5 10 24 18.5Z" /></svg>
          </a>
        </div>
        <div class="flex flex-col gap-3">
          <EventCard v-for="ev in moreEvents" :key="ev.id" :event="ev" :fallback-url="calendarUrl" :view-label="viewLabel" subtle />
        </div>
        <a :href="calendarUrl" class="flex items-center justify-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:hidden">
          {{ fullCalendarLabel }}
          <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" class="h-[17px] w-[34px] flex-none fill-accent"><path d="M0 8.4h26v3.2H0z" /><path d="M24 1.5 38.5 10 24 18.5Z" /></svg>
        </a>
      </div>
    </section>
  </div>
</template>
