import { notFound } from "next/navigation";
import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";
import { getPage } from "@/lib/data";
import { payloadSlug } from "@/lib/routes";

export async function RoutePage({ resolved }: RouteProps) {
  const page = resolved.route ? await getPage(payloadSlug(resolved.route), resolved.lang) : null;
  if (!page) notFound();
  return <Placeholder kind={resolved.kind} title={page.title} />;
}
