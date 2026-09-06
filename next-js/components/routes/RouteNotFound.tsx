import { getSite } from "@/lib/data";

/* 404 view (openspec next-headless-site § Error and empty surfaces; interior-
 * presentation § 404 page). Rendered as an ordinary server-rendered state — not
 * via notFound() — because under Cache Components a thrown not-found only
 * reaches the client behind the streamed shell; the HTTP status comes from
 * proxy.ts. Copy from `/site` strings (`nf_*`); the 404.twig twin lands in 6.8. */
export async function RouteNotFound({ lang }: { lang: string }) {
  const site = await getSite(lang);
  const s = site.strings as Record<string, string>;
  return (
    <div
      data-route-kind="not_found"
      className="mx-auto max-w-[1200px] px-4 py-10"
      data-testid="route-not-found"
    >
      <meta name="robots" content="noindex,follow" />
      <h1 className="font-display text-3xl text-ink" data-testid="route-not-found-title">
        {s.nf_title ?? "Page not found"}
      </h1>
      <p data-testid="route-not-found-lede">{s.nf_lede ?? ""}</p>
    </div>
  );
}
