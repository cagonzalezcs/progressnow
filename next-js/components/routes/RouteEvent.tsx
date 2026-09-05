import { notFound } from "next/navigation";
import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";
import { getEvent } from "@/lib/data";
import { payloadSlug } from "@/lib/routes";

export async function RouteEvent({ resolved }: RouteProps) {
  const event = resolved.route ? await getEvent(payloadSlug(resolved.route), resolved.lang) : null;
  if (!event) notFound();
  return <Placeholder kind="event" title={event.event.title} />;
}
