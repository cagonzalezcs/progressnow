import { Suspense } from "react";
import { Placeholder } from "@/components/routes/placeholder";
import type { RouteProps } from "@/components/routes/types";
import { getPage, getPosts } from "@/lib/data";
import { payloadSlug } from "@/lib/routes";

export async function RoutePostsIndex({ resolved, searchParams }: RouteProps) {
  const page = resolved.route ? await getPage(payloadSlug(resolved.route), resolved.lang) : null;
  return (
    <Placeholder kind="posts_index" title={page?.title ?? "Blog"}>
      <Suspense fallback={<p role="status">Loading…</p>}>
        <Results resolved={resolved} searchParams={searchParams} />
      </Suspense>
    </Placeholder>
  );
}

async function Results({ resolved, searchParams }: RouteProps) {
  const query = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  const s = pick(query.s);
  const category = pick(query.category) || resolved.category;
  const paged = Number.parseInt(pick(query.paged) || "", 10);
  const pageNumber = Number.isFinite(paged) && paged > 1 ? paged : resolved.page;
  const posts = await getPosts({
    lang: resolved.lang,
    s: s || undefined,
    category: category || undefined,
    page: pageNumber,
  });
  return (
    <section
      aria-label="Posts"
      data-page={pageNumber}
      data-category={category || "all"}
      data-search={s}
    >
      <p role="status">{posts.total} post(s)</p>
      <ul>
        {posts.posts.map((p) => (
          <li key={p.slug}>{p.title}</li>
        ))}
      </ul>
    </section>
  );
}
