import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { interiorPaths } from "@/components/routes/RoutePage";
import type { RouteProps } from "@/components/routes/types";
import { CalendarSubscribe } from "@/components/site/CalendarSubscribe";
import { CalendarSkeleton, EventCalendar } from "@/components/site/EventCalendar";
import { PageHeader } from "@/components/site/PageHeader";
import { eventCategories } from "@/lib/categories";
import { getEvents, getPage, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { type CalendarView, normalizeCategory, normalizeView, toISODate } from "@/lib/events";
import { payloadSlug } from "@/lib/routes";
import type { ChapterEvent, PageEnvelope, RoutesManifest, SiteEnvelope } from "@/lib/schemas";

/* Calendar page — views/page-calendar.twig (openspec fix-calendar-page-layout;
 * events-presentation "Calendar page header" … "Calendar subscribe strip").
 * Everything is server-rendered: header, toolbar, the initial month's grid and
 * the subscribe strip. `?view=` / `?category=` and `today` are read inside the
 * Suspense fragment (after the dynamic searchParams access, so the prerender
 * never sees `new Date()`) and handed to the island as its initial state. */
export async function RouteCalendar({ resolved, searchParams }: RouteProps) {
  const [page, site, manifest, envelope] = await Promise.all([
    resolved.route ? getPage(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
    getEvents({ lang: resolved.lang }),
  ]);
  if (!page) notFound();
  const wpOrigin = getEnv().WP_ORIGIN;
  return (
    <CalendarPage
      page={page}
      site={site}
      manifest={manifest}
      lang={resolved.lang}
      wpOrigin={wpOrigin}
    >
      <Suspense
        fallback={
          <section className="bg-white px-6 py-10 md:py-14" data-tone="white" aria-busy="true">
            <CalendarSkeleton />
          </section>
        }
      >
        <CalendarWithQuery
          searchParams={searchParams}
          site={site}
          page={page}
          events={envelope.events}
          lang={resolved.lang}
          fallbackUrl={resolved.route?.path ?? resolved.path}
        />
      </Suspense>
    </CalendarPage>
  );
}

async function CalendarWithQuery({
  searchParams,
  ...rest
}: { searchParams: RouteProps["searchParams"] } & Omit<
  Parameters<typeof CalendarIsland>[0],
  "initialView" | "initialCategory" | "today"
>) {
  await connection(); // per-request from here: `today` must never be prerendered
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <CalendarIsland
      {...rest}
      today={toISODate(new Date())}
      initialView={one(q.view)}
      initialCategory={one(q.category)}
    />
  );
}

/** Strings + props plumbing shared by the route and the component test. */
export function CalendarIsland({
  site,
  page,
  events,
  lang,
  today,
  fallbackUrl,
  initialView,
  initialCategory,
  initialMonth,
}: {
  site: SiteEnvelope;
  page: PageEnvelope;
  events: ChapterEvent[];
  lang: string;
  today: string;
  fallbackUrl: string;
  initialView?: string;
  initialCategory?: string;
  initialMonth?: { year: number; month: number };
}) {
  const s = site.strings as Record<string, string>;
  const t = (key: string, fallback: string) => s[key] || fallback;
  const categories = eventCategories(site.categories).map((c) =>
    c.id === "all" ? { ...c, label: t("cal_all_events", c.label) } : c,
  );
  const defaultView: CalendarView = "month";
  return (
    <EventCalendar
      lang={lang}
      events={events}
      categories={categories}
      today={today}
      initialView={normalizeView(initialView, defaultView)}
      initialCategory={normalizeCategory(initialCategory, categories)}
      initialMonth={initialMonth}
      defaultView={defaultView}
      showCategoryColors
      icsUrl={page.calendar?.icsUrl ?? "#"}
      fallbackUrl={fallbackUrl}
      labels={{
        monthLabelText: t("cal_month", "Month"),
        listLabelText: t("cal_list", "List"),
        filterLabelText: t("cal_filter", "Filter:"),
        allEventsText: t("cal_all_events", "All events"),
        viewLabel: t("home_view_event", "View event"),
        emptyTitle: t("cal_empty_h", "Nothing scheduled this month"),
        emptyBody: t("cal_empty_p", "Check the next month or subscribe below and never miss one."),
        icsLabel: t("cal_ics", "iCal / .ics"),
      }}
    />
  );
}

/** Pure presentation (component-tested with the theme fixtures); `children` is the island fragment. */
export function CalendarPage({
  page,
  site,
  manifest,
  lang,
  wpOrigin,
  children,
}: {
  page: PageEnvelope;
  site: SiteEnvelope;
  manifest: RoutesManifest;
  lang: string;
  wpOrigin: string;
  children?: React.ReactNode;
}) {
  const s = site.strings as Record<string, string>;
  const t = (key: string, fallback: string) => s[key] || fallback;
  const paths = interiorPaths(manifest, lang);
  const lede =
    page.lede ||
    `Meetings, actions, trainings, and socials across ${site.chapter.region_label || "our community"}. Everything is open to the public unless noted — bring a friend.`;
  return (
    <div data-route-kind="calendar" className="route-calendar contents">
      <PageHeader
        title={page.title || t("cal_title", "Event calendar")}
        lede={lede}
        crumbs={[{ label: t("blog_crumb_home", "Home"), href: paths.home }]}
        wide
        wpOrigin={wpOrigin}
      />
      {children}
      <CalendarSubscribe
        title={t("cal_subscribe_h", "Subscribe to the calendar")}
        lede={t(
          "cal_subscribe_p",
          "Add every meeting and action to your own calendar automatically.",
        )}
        googleLabel={t("cal_google", "Google Calendar")}
        icsLabel={t("cal_ics", "iCal / .ics")}
        googleCalUrl={page.calendar?.googleCalUrl ?? "#"}
        icsUrl={page.calendar?.icsUrl ?? "#"}
      />
    </div>
  );
}
