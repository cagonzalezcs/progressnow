import { notFound } from "next/navigation";
import type { RouteProps } from "@/components/routes/types";
import { SingleEventPage } from "@/components/site/SingleEvent";
import { getEvent, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { payloadSlug } from "@/lib/routes";

/* Single event — views/single-event.twig / RouteEvent.vue (openspec
 * progress-now-v4-events). The envelope carries the event, its categories,
 * the related "more upcoming" rows and the home/calendar URLs; chrome strings
 * come from `/site`. */
export async function RouteEvent({ resolved }: RouteProps) {
  const [envelope, site] = await Promise.all([
    resolved.route ? getEvent(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
  ]);
  if (!envelope) notFound();
  return <SingleEventPage envelope={envelope} site={site} wpOrigin={getEnv().WP_ORIGIN} />;
}
