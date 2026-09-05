import { slug } from "next/root-params";
import { getRoutes, getSite } from "@/lib/data";
import { langForPath, pathFromSegments } from "@/lib/routes";

/* 404 (openspec next-headless-site § Error and empty surfaces): copy comes from
 * the `/site` strings (`nf_*`); the 404.twig twin markup lands in task 6.8. */
export default async function NotFound() {
  const manifest = await getRoutes();
  const lang = langForPath(manifest, pathFromSegments(await slug())) || "en";
  const site = await getSite(lang);
  const s = site.strings as Record<string, string>;
  return (
    <main id="main" data-route-kind="not_found" className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="font-display text-3xl text-ink">{s.nf_title ?? "Page not found"}</h1>
      <p>{s.nf_lede ?? ""}</p>
    </main>
  );
}
