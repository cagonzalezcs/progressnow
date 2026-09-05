import { Suspense } from "react";
import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";
import { getFrontPage, getPosts, getSite } from "@/lib/data";

export async function RouteFront({ resolved, searchParams }: RouteProps) {
  const [front, site] = await Promise.all([getFrontPage(resolved.lang), getSite(resolved.lang)]);
  return (
    <Placeholder kind="front" title={site.identity.hero_headline || site.identity.name}>
      <p>{front.hero.subhead}</p>
      <Suspense fallback={null}>
        <SearchFragment lang={resolved.lang} searchParams={searchParams} />
      </Suspense>
    </Placeholder>
  );
}

/* `?s=` on the home URL is a WordPress search (resolver kind "search"). Read
 * inside Suspense so the front page's static shell is unaffected. */
async function SearchFragment({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: RouteProps["searchParams"];
}) {
  const query = await searchParams;
  const s = (Array.isArray(query.s) ? query.s[0] : query.s)?.trim() ?? "";
  if (!s) return null;
  const results = await getPosts({ lang, s });
  return (
    <section aria-label="Search results" data-route-kind="search">
      <p role="status">
        {results.total} result(s) for “{s}”
      </p>
      <ul>
        {results.posts.map((p) => (
          <li key={p.slug}>{p.title}</li>
        ))}
      </ul>
    </section>
  );
}
