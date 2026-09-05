import { notFound, permanentRedirect } from "next/navigation";
import { slug } from "next/root-params";
import { Suspense } from "react";
import { RouteAbout } from "@/components/routes/RouteAbout";
import { RouteCalendar } from "@/components/routes/RouteCalendar";
import { RouteEvent } from "@/components/routes/RouteEvent";
import { RouteFront } from "@/components/routes/RouteFront";
import { RouteGetInvolved } from "@/components/routes/RouteGetInvolved";
import { RoutePage } from "@/components/routes/RoutePage";
import { RoutePost } from "@/components/routes/RoutePost";
import { RoutePostsIndex } from "@/components/routes/RoutePostsIndex";
import type { RouteProps } from "@/components/routes/types";
import { getRoutes } from "@/lib/data";
import { resolveRoute } from "@/lib/routes";

/* One catch-all page (design D3): every public WordPress URL, in both
 * languages, resolves against the cached `/routes` manifest and renders the
 * matching route component. Manifest routes are prerendered at build; content
 * published later resolves on its first request (no dynamicParams needed under
 * Cache Components). The path is a root parameter (`next/root-params`), read
 * before any Suspense boundary so a 404 carries a real 404 status. `searchParams`
 * are only read inside the route components that need them (front, posts
 * index), inside their own Suspense fragments, so the static shell of every
 * other route stays prerendered. */

export async function generateStaticParams() {
  const manifest = await getRoutes();
  // /styleguide/ is its own segment (app/styleguide); other-language styleguide paths redirect to it.
  return manifest.routes.filter((route) => route.kind !== "styleguide").map((route) => ({ slug: route.path.split("/").filter(Boolean) }));
}

const ROUTES = {
  front: RouteFront,
  page: RoutePage,
  about: RouteAbout,
  get_involved: RouteGetInvolved,
  calendar: RouteCalendar,
  posts_index: RoutePostsIndex,
  search: RoutePostsIndex,
  post: RoutePost,
  event: RouteEvent,
} satisfies Record<string, React.ComponentType<RouteProps>>;

export default async function Page({ searchParams }: PageProps<"/[[...slug]]">) {
  // Resolve BEFORE any Suspense boundary: a 404 must be decided before the
  // static shell streams, or the response status would already be 200.
  const manifest = await getRoutes();
  // Path-only resolution here: `?s=` etc. are handled by the components that read searchParams.
  const resolved = resolveRoute(manifest, await slug());
  if (resolved.kind === "not_found") notFound();
  if (resolved.kind === "styleguide") permanentRedirect("/styleguide/");
  const Component = ROUTES[resolved.kind as keyof typeof ROUTES];
  return (
    <Suspense fallback={<main id="main" aria-busy="true" />}>
      <Component resolved={resolved} searchParams={searchParams} />
    </Suspense>
  );
}
