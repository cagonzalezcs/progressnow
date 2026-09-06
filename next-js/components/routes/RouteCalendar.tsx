import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RoutePending } from "@/components/nav/RoutePending";
import { interiorPaths } from "@/components/routes/RoutePage";
import type { RouteProps } from "@/components/routes/types";
import { PageHeader } from "@/components/site/PageHeader";
import { CalendarSubscribe } from "@/components/site/calendar/CalendarSubscribe";
import { CalendarIsland } from "@/components/site/calendar/CalendarIsland";
import type { CalendarLabels } from "@/components/site/calendar/EventCalendar";
import { defaultWindow, parseMonthParam } from "@/lib/calendar";
import { getEvents, getPage, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { toISODate } from "@/lib/events";
import { payloadSlug } from "@/lib/routes";
import type { SiteEnvelope } from "@/lib/schemas";

/* Calendar page — views/page-calendar.twig / RouteCalendar.vue. Unlike the
 * Nuxt island (fetch on mount), the requested month is server-rendered from
 * the REST window and the island takes over for paging (design D3). Query
 * state (`?view=`, `?month=`, `?category=`) is read inside Suspense so the
 * header streams from the shell. */
export async function RouteCalendar({ resolved, searchParams }: RouteProps) {
  const [page, site, manifest] = await Promise.all([
    resolved.route ? getPage(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
  ]);
  if (!page) notFound();
  const s = site.strings as Record<string, string>;
  const str = (key: string, fallback: string) => s[key] || fallback;
  const wpOrigin = getEnv().WP_ORIGIN;
  const paths = interiorPaths(manifest, resolved.lang);
  const basePath = resolved.route?.path ?? resolved.path;
  const lede =
    page.lede ||
    `Meetings, actions, trainings, and socials across ${site.chapter.region_label || "our community"}. Everything is open to the public unless noted — bring a friend.`;
  const icsUrl = page.calendar?.icsUrl ?? "#";

  return (
    <div
      data-route-kind="calendar"
      className="route-calendar contents"
      data-testid="route-calendar"
    >
      <PageHeader
        title={page.title || str("cal_title", "Event calendar")}
        lede={lede}
        crumbs={[{ label: str("blog_crumb_home", "Home"), href: paths.home }]}
        breadcrumbLabel={str("blog_crumb_label", "Breadcrumb")}
        wide
        wpOrigin={wpOrigin}
      />
      {/* RoutePending holds the footer back (openspec route-loading § A boundary opts in
          when a client navigation would move the footer): CalendarBody awaits the events
          envelope, and CalendarSkeleton is shorter than the grid it stands in for.
          Measured front -> /calendar/ with that envelope held 900ms: the footer sat at
          1178px behind the skeleton and settled at 1336px. */}
      <Suspense
        fallback={
          <RoutePending>
            <CalendarSkeleton />
          </RoutePending>
        }
      >
        <CalendarBody
          searchParams={searchParams}
          lang={resolved.lang}
          site={site}
          basePath={basePath}
          icsUrl={icsUrl}
          wpOrigin={wpOrigin}
        />
      </Suspense>
      <CalendarSubscribe
        title={str("cal_subscribe_h", "Subscribe to the calendar")}
        lede={str(
          "cal_subscribe_p",
          "Add every meeting and action to your own calendar automatically.",
        )}
        googleCalUrl={page.calendar?.googleCalUrl ?? "#"}
        icsUrl={icsUrl}
        googleLabel={str("cal_google", "Google Calendar")}
        icsLabel={str("cal_ics", "iCal / .ics")}
        wpOrigin={wpOrigin}
      />
    </div>
  );
}

async function CalendarBody({
  searchParams,
  lang,
  site,
  basePath,
  icsUrl,
  wpOrigin,
}: {
  searchParams: RouteProps["searchParams"];
  lang: string;
  site: SiteEnvelope;
  basePath: string;
  icsUrl: string;
  wpOrigin: string;
}) {
  const sp = await searchParams; // dynamic from here on: today + the REST window are per request
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const todayISO = toISODate(new Date());
  const window = defaultWindow(todayISO);
  const envelope = await getEvents({ lang, after: window.from, before: window.to });
  const view = first(sp.view) === "list" ? "list" : "month";
  const category = first(sp.category) || "all";
  return (
    <CalendarIsland
      events={envelope.events}
      window={window}
      todayISO={todayISO}
      lang={lang}
      initialView={view}
      initialMonth={parseMonthParam(first(sp.month)) ?? undefined}
      category={category}
      categories={envelope.categories.length ? envelope.categories : site.categories}
      basePath={basePath}
      icsUrl={icsUrl}
      labels={calendarLabels(site)}
      wpOrigin={wpOrigin}
    />
  );
}

export function calendarLabels(site: SiteEnvelope): Partial<CalendarLabels> {
  const s = site.strings as Record<string, string>;
  const str = (key: string) => s[key] || undefined;
  return {
    monthLabelText: str("cal_month"),
    listLabelText: str("cal_list"),
    viewLabel: str("home_view_event"),
    emptyTitle: str("cal_empty_h"),
    emptyBody: str("cal_empty_p"),
    icsLabel: str("cal_ics"),
    filterLabel: str("cal_filter"),
    allEventsLabel: str("cal_all_events"),
    prevLabel: str("cal_prev"),
    nextLabel: str("cal_next"),
    loading: str("cal_loading"),
    retry: str("cal_retry"),
  };
}

function CalendarSkeleton() {
  return (
    <section
      className="bg-white px-6 py-10 md:py-14"
      data-tone="white"
      aria-busy="true"
      data-testid="route-calendar-fallback"
    >
      <div
        className="mx-auto min-h-[520px] max-w-[1200px] animate-pulse rounded-[20px] bg-alt"
        data-testid="calendar-skeleton"
      />
    </section>
  );
}
