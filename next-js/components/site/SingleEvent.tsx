import { ArrowGlyph } from "@/components/site/ArrowGlyph";
import { CtaCard } from "@/components/site/CtaCard";
import { DashedNote } from "@/components/site/DashedNote";
import { EventBlocks } from "@/components/site/EventBlocks";
import { EventCard } from "@/components/site/EventCard";
import { LinkListCard } from "@/components/site/LinkListCard";
import { PageHeader } from "@/components/site/PageHeader";
import { SiteLink } from "@/components/site/SiteLink";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import { categoryById, eventCategories } from "@/lib/categories";
import { dateTile, detailRows, hasContact, telHref, whenWhere } from "@/lib/event";
import { resolveHref } from "@/lib/links";
import type { SingleEventEnvelope, SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Single event (openspec progress-now-v4-events D4, specs "Event hero" …
 * "More upcoming events"; twin of views/single-event.twig / SingleEvent.vue).
 * Hero = PageHeader with extras (white date tile + translucent-ink category
 * pill before the h1; when/where lede; RSVP + Add-to-calendar pills). Content
 * = "About this event" + event blocks; sticky sidebar = Details rows + "Save
 * your spot" CTA (only with an RSVP link) + contact note; "More upcoming
 * events" = EventCard rows on the alt band. Copy comes from `/site.strings`
 * (`event_*`, `cal_crumb_calendar`, `home_*`); the design-copy fallbacks
 * mirror inc/i18n.php for fixtures that predate a string. */
export interface SingleEventPageProps {
  envelope: SingleEventEnvelope;
  site: SiteEnvelope;
  wpOrigin: string;
}

const WHITE_PILL =
  "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
const OUTLINE_PILL =
  "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
const FULL_CALENDAR =
  "items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4";
const H2 =
  "m-0 font-display text-[1.35rem] font-normal leading-[1.2] md:text-[clamp(1.6rem,2.6vw,2.2rem)] md:leading-[1.1]";

export function SingleEventPage({ envelope, site, wpOrigin }: SingleEventPageProps) {
  const { event, related, showRelated, homeUrl, calendarUrl } = envelope;
  const s = site.strings as Record<string, string>;
  const t = (key: string, fallback: string) => s[key] || fallback;
  const labels = {
    crumbHome: t("blog_crumb_home", "Home"),
    crumbCalendar: t("cal_crumb_calendar", "Calendar"),
    rsvp: t("event_rsvp", "RSVP"),
    addToCalendar: t("event_add_calendar", "Add to calendar"),
    about: t("event_about", "About this event"),
    details: t("event_details", "Details"),
    date: t("event_date", "Date"),
    time: t("event_time", "Time"),
    location: t("event_location", "Location"),
    saveTitle: t("event_save_h", "Save your spot"),
    saveBody: t("event_save_p", "RSVP and we’ll send the details straight to you."),
    saveLabel: t("event_save_cta", "RSVP Now"),
    contact: t("event_contact", "Questions? Contact"),
    more: t("event_more", "More upcoming events"),
    fullCalendar: t("home_events_all", "Full calendar"),
    view: t("home_view_event", "View event"),
    agenda: t("event_agenda", "Agenda"),
    goodToKnow: t("event_good_to_know", "Good to know"),
    a11yNote: t("event_a11y_note", "Accessibility & childcare"),
    map: t("event_map", "Getting there"),
  };

  // WordPress term categories override the registry palette; the envelope carries them.
  const categories = eventCategories(
    envelope.categories.length ? envelope.categories : site.categories,
  );
  const category = categoryById(event.cat, categories);
  const tile = dateTile(event.date);
  const calendarHref = resolveHref(calendarUrl, wpOrigin).href;
  const hasImage = Boolean(event.featuredImage.src);
  const hasBody = hasImage || event.summary !== "" || event.blocks.length > 0;
  const addToCalendar = event.icsUrl || event.gcalUrl;
  const more = showRelated
    ? related.slice(0, 3).map((r) => ({ ...r, url: resolveHref(r.url, wpOrigin).href }))
    : [];

  return (
    <div
      data-route-kind="event"
      className="single-event route-event contents"
      data-testid="single-event"
    >
      <PageHeader
        title={event.title}
        lede={whenWhere(event)}
        crumbs={[
          { label: labels.crumbHome, href: homeUrl },
          { label: labels.crumbCalendar, href: calendarUrl },
        ]}
        breadcrumbLabel={`${labels.crumbHome} › ${event.title}`}
        before={
          <div className="flex flex-wrap items-center gap-3.5 md:gap-[18px]">
            <span
              aria-hidden="true"
              className="flex flex-col rounded-[12px] bg-white px-3.5 py-2.5 text-center text-brand md:rounded-[14px] md:px-[18px] md:py-3"
              data-testid="single-event-date-tile"
            >
              <span
                className="font-display text-[1.4rem] leading-[1.05] md:text-[1.7rem]"
                data-testid="single-event-day"
              >
                {tile.day}
              </span>
              <span
                className="text-[0.72rem] font-extrabold tracking-[0.1em] md:text-[0.8rem]"
                data-testid="single-event-month"
              >
                {tile.month}
              </span>
            </span>
            <SiteLink
              href={`${calendarHref}?category=${event.cat}`}
              wpOrigin={wpOrigin}
              className="rounded-full bg-ink/[.22] px-3.5 py-[5px] text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white no-underline hover:underline hover:underline-offset-4 md:px-4 md:py-1.5 md:text-[0.8rem]"
              data-testid="single-event-category-pill"
              data-category={event.cat}
            >
              {category.label}
            </SiteLink>
          </div>
        }
        wpOrigin={wpOrigin}
      >
        {event.rsvpUrl || addToCalendar ? (
          <div className="flex flex-wrap gap-2.5 md:gap-3.5" data-testid="single-event-actions">
            {event.rsvpUrl ? (
              <SiteLink
                href={event.rsvpUrl}
                wpOrigin={wpOrigin}
                target="_blank"
                className={WHITE_PILL}
                data-testid="single-event-rsvp-link"
              >
                {labels.rsvp}
              </SiteLink>
            ) : null}
            {addToCalendar ? (
              <a
                href={addToCalendar}
                className={OUTLINE_PILL}
                data-testid="single-event-add-to-calendar"
              >
                {labels.addToCalendar}
              </a>
            ) : null}
          </div>
        ) : null}
      </PageHeader>

      {/* Content + sidebar */}
      <section
        className="bg-white px-6 pb-14 pt-10 md:pb-24 md:pt-16"
        data-tone="white"
        data-testid="single-event-body"
      >
        <div className="mx-auto grid max-w-[1140px] items-start gap-10 lg:gap-14 lg:[grid-template-columns:minmax(300px,1fr)_310px]">
          <article
            className="flex min-w-0 flex-col gap-[18px] md:gap-6"
            data-testid="single-event-article"
          >
            {hasBody ? (
              <h2 className={H2} data-testid="single-event-about-heading">
                {labels.about}
              </h2>
            ) : null}
            {hasImage ? (
              <figure className="m-0 flex flex-col" data-testid="single-event-figure">
                <div className="relative aspect-video overflow-hidden rounded-[16px] bg-white md:rounded-[20px]">
                  <ImageSlot
                    src={event.featuredImage.src}
                    alt={event.featuredImage.alt}
                    loading="eager"
                  />
                </div>
                {event.featuredImage.caption || event.featuredImage.credit ? (
                  <figcaption
                    className="mt-3 text-[0.9rem] leading-[1.5] text-muted"
                    data-testid="single-event-figcaption"
                  >
                    {event.featuredImage.caption}{" "}
                    {event.featuredImage.credit ? (
                      <span data-testid="single-event-image-credit">
                        {event.featuredImage.credit}
                      </span>
                    ) : null}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            {event.summary ? (
              <p
                className="m-0 text-[1.08rem] font-semibold leading-[1.6] text-ink md:text-[1.22rem] md:leading-[1.65]"
                data-testid="single-event-summary"
              >
                {event.summary}
              </p>
            ) : null}
            <EventBlocks
              blocks={event.blocks}
              headings={{
                agenda: labels.agenda,
                goodToKnow: labels.goodToKnow,
                a11yNote: labels.a11yNote,
                map: labels.map,
              }}
            />
          </article>

          <aside
            aria-label={labels.details}
            className="flex flex-col gap-6 lg:sticky lg:top-[108px] lg:max-h-[calc(100vh-124px)] lg:overflow-auto"
            data-testid="single-event-sidebar"
          >
            <div className="[&_.row-label]:text-brand">
              <LinkListCard
                heading={labels.details}
                rows={detailRows(event, {
                  date: labels.date,
                  time: labels.time,
                  location: labels.location,
                })}
                wpOrigin={wpOrigin}
              />
            </div>
            {event.rsvpUrl ? (
              <CtaCard
                id="rsvp"
                title={labels.saveTitle}
                body={labels.saveBody}
                href={event.rsvpUrl}
                label={labels.saveLabel}
                external
                wpOrigin={wpOrigin}
              />
            ) : null}
            {hasContact(event.contact) ? (
              <DashedNote heading={labels.contact}>
                {event.contact.name ? (
                  <p className="font-bold text-ink" data-testid="single-event-contact-name">
                    {event.contact.name}
                  </p>
                ) : null}
                {event.contact.email ? (
                  <p>
                    <a
                      href={`mailto:${event.contact.email}`}
                      data-testid="single-event-contact-email"
                    >
                      {event.contact.email}
                    </a>
                  </p>
                ) : null}
                {event.contact.phone ? (
                  <p>
                    <a href={telHref(event.contact.phone)} data-testid="single-event-contact-phone">
                      {event.contact.phone}
                    </a>
                  </p>
                ) : null}
              </DashedNote>
            ) : null}
          </aside>
        </div>
      </section>

      {/* More upcoming events */}
      {more.length > 0 ? (
        <section
          className="bg-alt px-6 pb-14 pt-11 md:pb-24 md:pt-16"
          data-tone="alt"
          data-more-events=""
          data-testid="single-event-more"
        >
          <div className="mx-auto flex max-w-[1140px] flex-col gap-[18px] md:gap-7">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className={H2} data-testid="single-event-more-heading">
                {labels.more}
              </h2>
              <SiteLink
                href={calendarUrl}
                wpOrigin={wpOrigin}
                className={cn("hidden md:flex", FULL_CALENDAR)}
                data-testid="single-event-full-calendar-link"
              >
                {labels.fullCalendar}
                <ArrowGlyph />
              </SiteLink>
            </div>
            <div className="flex flex-col gap-3" data-testid="single-event-more-list">
              {more.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  fallbackUrl={calendarHref}
                  viewLabel={labels.view}
                  subtle
                />
              ))}
            </div>
            <SiteLink
              href={calendarUrl}
              wpOrigin={wpOrigin}
              className={cn(
                "flex justify-center md:hidden",
                FULL_CALENDAR,
                "gap-3.5 text-[0.95rem]",
              )}
              data-testid="single-event-full-calendar-link-compact"
            >
              {labels.fullCalendar}
              <ArrowGlyph className="h-[17px] w-[34px] flex-none fill-accent" />
            </SiteLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
