import { notFound } from "next/navigation";
import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";
import { getEvents, getPage } from "@/lib/data";
import { payloadSlug } from "@/lib/routes";

export async function RouteCalendar({ resolved }: RouteProps) {
  const page = resolved.route ? await getPage(payloadSlug(resolved.route), resolved.lang) : null;
  if (!page) notFound();
  const events = await getEvents({ lang: resolved.lang });
  return (
    <Placeholder kind="calendar" title={page.title}>
      <p role="status">{events.events.length} event(s)</p>
    </Placeholder>
  );
}
