import { notFound } from "next/navigation";
import type { RouteProps } from "@/components/routes/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { SingleEvent, type SingleEventLabels } from "@/components/site/SingleEvent";
import { getEvent, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { canonicalOrigin, eventNode } from "@/lib/json-ld";
import { payloadSlug } from "@/lib/routes";
import type { SiteEnvelope } from "@/lib/schemas";

/* Single event — views/single-event.twig / RouteEvent.vue. The envelope carries
 * its own home/calendar URLs (WordPress absolute; SiteLink re-homes them);
 * sidebar/strip copy comes from the site strings. */
export async function RouteEvent({ resolved }: RouteProps) {
  const [envelope, site] = await Promise.all([
    resolved.route ? getEvent(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
  ]);
  if (!envelope) notFound();
  const env = getEnv();
  const origins = {
    canonicalOrigin: canonicalOrigin(envelope.seo, env.NEXT_PUBLIC_SITE_ORIGIN),
    siteOrigin: env.NEXT_PUBLIC_SITE_ORIGIN,
    wpOrigin: env.WP_ORIGIN,
  };
  return (
    <>
      <JsonLd id="ld-event" nodes={[eventNode(envelope, origins)]} />
      <SingleEvent
        event={envelope.event}
        categories={envelope.categories.length ? envelope.categories : site.categories}
        related={envelope.related}
        showRelated={envelope.showRelated}
        homeUrl={envelope.homeUrl}
        calendarUrl={envelope.calendarUrl}
        labels={eventLabels(site)}
        wpOrigin={env.WP_ORIGIN}
      />
    </>
  );
}

export function eventLabels(site: SiteEnvelope): Partial<SingleEventLabels> {
  const s = site.strings as Record<string, string>;
  const str = (key: string) => s[key] || undefined;
  return {
    crumbHome: str("blog_crumb_home"),
    crumbCalendar: str("cal_crumb_calendar"),
    breadcrumbLabel: str("blog_crumb_label"),
    rsvpLabel: str("event_rsvp"),
    addToCalendarLabel: str("event_add_calendar"),
    aboutLabel: str("event_about"),
    detailsLabel: str("event_details"),
    dateLabel: str("event_date"),
    timeLabel: str("event_time"),
    locationLabel: str("event_location"),
    saveTitle: str("event_save_h"),
    saveBody: str("event_save_p"),
    saveLabel: str("event_save_cta"),
    contactLabel: str("event_contact"),
    moreLabel: str("event_more"),
    fullCalendarLabel: str("home_events_all"),
    viewLabel: str("home_view_event"),
  };
}
