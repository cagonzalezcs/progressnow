import { CtaCard } from "@/components/site/CtaCard";
import { DashedNote } from "@/components/site/DashedNote";
import { EventBlocks } from "@/components/site/EventBlocks";
import { LinkListCard } from "@/components/site/LinkListCard";
import { PageHeader } from "@/components/site/PageHeader";
import { SiteLink } from "@/components/site/SiteLink";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import { EventCard } from "@/components/site/calendar/EventCard";
import { dateTile } from "@/lib/calendar";
import { categoryById, eventCategories } from "@/lib/categories";
import { eventDetailRows, eventHasContact, eventWhenWhere, telHref } from "@/lib/event";
import type { EventCategory, RelatedEvent, SingleEventData } from "@/lib/schemas";

/* Single event (openspec progress-now-v4-events D4, specs "Event hero" …
 * "More upcoming events"; twin of views/single-event.twig / SingleEvent.vue).
 * Hero = PageHeader with extras (white date tile + translucent-ink category
 * pill before the h1; when/where lede; RSVP + Add-to-calendar pills). Content
 * = "About this event" + event blocks; sticky sidebar = Details rows (Date /
 * Time / Location) + "Save your spot" CtaCard (omitted without an RSVP link) +
 * contact note; "More upcoming events" = EventCard rows on the alt band.
 * Server component throughout — nothing here needs client JavaScript. */
export interface SingleEventLabels {
  crumbHome: string;
  crumbCalendar: string;
  breadcrumbLabel: string;
  rsvpLabel: string;
  addToCalendarLabel: string;
  aboutLabel: string;
  detailsLabel: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  saveTitle: string;
  saveBody: string;
  saveLabel: string;
  contactLabel: string;
  moreLabel: string;
  fullCalendarLabel: string;
  viewLabel: string;
  sidebarLabel: string;
}

export const DEFAULT_EVENT_LABELS: SingleEventLabels = {
  crumbHome: "Home",
  crumbCalendar: "Calendar",
  breadcrumbLabel: "Breadcrumb",
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
  sidebarLabel: "Event details",
};

const WHITE_PILL =
  "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
const OUTLINE_PILL =
  "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
const ARROW = (cls: string) => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 40 20" className={cls}>
    <path d="M0 8.4h26v3.2H0z" />
    <path d="M24 1.5 38.5 10 24 18.5Z" />
  </svg>
);

export function SingleEvent({
  event,
  categories,
  related = [],
  showRelated = true,
  homeUrl = "/",
  calendarUrl = "/calendar/",
  labels = {},
  wpOrigin,
}: {
  event: SingleEventData;
  /** WP term-driven categories — replaces the registry palette when provided */
  categories?: EventCategory[] | null;
  related?: RelatedEvent[];
  showRelated?: boolean;
  homeUrl?: string;
  calendarUrl?: string;
  labels?: Partial<SingleEventLabels>;
  wpOrigin: string;
}) {
  const L: SingleEventLabels = {
    ...DEFAULT_EVENT_LABELS,
    ...Object.fromEntries(Object.entries(labels).filter(([, v]) => Boolean(v))),
  };
  const category = categoryById(event.cat, eventCategories(categories));
  const tile = dateTile(event.date);
  const hasImage = Boolean(event.featuredImage.src);
  const hasBody = hasImage || event.summary !== "" || event.blocks.length > 0;
  const moreEvents = showRelated ? related.slice(0, 3) : [];
  const addToCalendar = event.icsUrl || event.gcalUrl;
  const rows = eventDetailRows(event, {
    date: L.dateLabel,
    time: L.timeLabel,
    location: L.locationLabel,
  });

  return (
    <div className="single-event contents" data-route-kind="event">
      <PageHeader
        title={event.title}
        lede={eventWhenWhere(event)}
        breadcrumbLabel={L.breadcrumbLabel}
        crumbs={[
          { label: L.crumbHome, href: homeUrl },
          { label: L.crumbCalendar, href: calendarUrl },
        ]}
        before={
          <div className="flex flex-wrap items-center gap-3.5 md:gap-[18px]">
            <span
              aria-hidden="true"
              className="flex flex-col rounded-[12px] bg-white px-3.5 py-2.5 text-center text-brand md:rounded-[14px] md:px-[18px] md:py-3"
            >
              <span className="font-display text-[1.4rem] leading-[1.05] md:text-[1.7rem]">
                {tile.day}
              </span>
              <span className="text-[0.72rem] font-extrabold tracking-[0.1em] md:text-[0.8rem]">
                {tile.month}
              </span>
            </span>
            <SiteLink
              href={`${calendarUrl}?category=${event.cat}`}
              wpOrigin={wpOrigin}
              className="rounded-full bg-ink/[.22] px-3.5 py-[5px] text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white no-underline hover:underline hover:underline-offset-4 md:px-4 md:py-1.5 md:text-[0.8rem]"
            >
              {category.label}
            </SiteLink>
          </div>
        }
        wpOrigin={wpOrigin}
      >
        {event.rsvpUrl || addToCalendar ? (
          <div className="flex flex-wrap gap-2.5 md:gap-3.5">
            {event.rsvpUrl ? (
              <a href={event.rsvpUrl} target="_blank" rel="noopener" className={WHITE_PILL}>
                {L.rsvpLabel}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
            {addToCalendar ? (
              <SiteLink href={addToCalendar} wpOrigin={wpOrigin} className={OUTLINE_PILL}>
                {L.addToCalendarLabel}
              </SiteLink>
            ) : null}
          </div>
        ) : null}
      </PageHeader>

      {/* Content + sidebar */}
      <section className="bg-white px-6 pb-14 pt-10 md:pb-24 md:pt-16" data-tone="white">
        <div className="mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14 lg:[grid-template-columns:minmax(300px,1fr)_310px]">
          <article className="flex min-w-0 flex-col gap-[18px] md:gap-6">
            {hasBody ? (
              <h2 className="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.6vw,2.2rem)] md:leading-[1.1]">
                {L.aboutLabel}
              </h2>
            ) : null}
            {hasImage ? (
              <figure className="m-0 flex flex-col">
                <div className="aspect-video overflow-hidden rounded-[16px] bg-white md:rounded-[20px]">
                  <ImageSlot
                    src={event.featuredImage.src}
                    alt={event.featuredImage.alt}
                    priority
                    sizes="(min-width: 1140px) 780px, 100vw"
                  />
                </div>
                {event.featuredImage.caption || event.featuredImage.credit ? (
                  <figcaption className="mt-3 text-[0.9rem] leading-[1.5] text-muted">
                    {[event.featuredImage.caption, event.featuredImage.credit]
                      .filter(Boolean)
                      .join(" ")}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            {event.summary ? (
              <p className="m-0 text-[1.08rem] font-semibold leading-[1.6] text-ink md:text-[1.22rem] md:leading-[1.65]">
                {event.summary}
              </p>
            ) : null}
            <EventBlocks blocks={event.blocks} />
          </article>

          <aside
            aria-label={L.sidebarLabel}
            className="flex flex-col gap-6 lg:sticky lg:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] lg:max-h-[calc(100vh-124px)] lg:overflow-auto"
          >
            <LinkListCard
              heading={L.detailsLabel}
              rows={rows}
              className="[&_.row-label]:text-brand"
              wpOrigin={wpOrigin}
            />
            {event.rsvpUrl ? (
              <CtaCard
                id="rsvp"
                title={L.saveTitle}
                body={L.saveBody}
                href={event.rsvpUrl}
                label={L.saveLabel}
                external
                wpOrigin={wpOrigin}
              />
            ) : null}
            {eventHasContact(event) ? (
              <DashedNote heading={L.contactLabel}>
                {event.contact.name ? (
                  <p className="font-bold text-ink">{event.contact.name}</p>
                ) : null}
                {event.contact.email ? (
                  <p>
                    <a href={`mailto:${event.contact.email}`}>{event.contact.email}</a>
                  </p>
                ) : null}
                {event.contact.phone ? (
                  <p>
                    <a href={telHref(event.contact.phone)}>{event.contact.phone}</a>
                  </p>
                ) : null}
              </DashedNote>
            ) : null}
          </aside>
        </div>
      </section>

      {moreEvents.length > 0 ? (
        <section
          className="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16"
          data-tone="alt"
          data-more-events=""
        >
          <div className="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.8vw,2.2rem)] md:leading-[1.1]">
                {L.moreLabel}
              </h2>
              <SiteLink
                href={calendarUrl}
                wpOrigin={wpOrigin}
                className="hidden items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:flex"
              >
                {L.fullCalendarLabel}
                {ARROW("h-5 w-10 flex-none fill-accent")}
              </SiteLink>
            </div>
            <div className="flex flex-col gap-3">
              {moreEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  fallbackUrl={calendarUrl}
                  viewLabel={L.viewLabel}
                  subtle
                  wpOrigin={wpOrigin}
                />
              ))}
            </div>
            <SiteLink
              href={calendarUrl}
              wpOrigin={wpOrigin}
              className="flex items-center justify-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:hidden"
            >
              {L.fullCalendarLabel}
              {ARROW("h-[17px] w-[34px] flex-none fill-accent")}
            </SiteLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
