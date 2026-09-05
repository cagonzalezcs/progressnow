import { permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { RouteAbout } from "@/components/routes/RouteAbout";
import { RouteCalendar } from "@/components/routes/RouteCalendar";
import { RouteEvent } from "@/components/routes/RouteEvent";
import { RouteFront } from "@/components/routes/RouteFront";
import { RouteGetInvolved } from "@/components/routes/RouteGetInvolved";
import { RouteNotFound } from "@/components/routes/RouteNotFound";
import { RoutePage } from "@/components/routes/RoutePage";
import { RoutePost } from "@/components/routes/RoutePost";
import { RoutePostsIndex } from "@/components/routes/RoutePostsIndex";
import type { RouteProps } from "@/components/routes/types";
import { getRoutes } from "@/lib/data";
import { requestPath } from "@/lib/request-path";
import { langForPath, resolveRoute } from "@/lib/routes";

/* One catch-all page (design D3): every public WordPress URL, in both
 * languages, resolves against the cached `/routes` manifest and renders the
 * matching route component. Routes render per request from the cached data
 * layer (design D11): new content resolves on its first request, and the
 * build needs no API. `searchParams` are only read inside the route components
 * that need them (front, posts index), inside their own Suspense fragments.
 * `params` is awaited outside Suspense, so the route is blocking, as the root
 * layout already is (it renders per request too). */
export const instant = false;

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

export default async function Page({ params, searchParams }: PageProps<"/[[...slug]]">) {
  // Unknown paths render the 404 view as a normal state; proxy.ts sets the 404 status
  // (a thrown notFound() would only reach the client behind the streamed shell).
  const [manifest, { slug }] = await Promise.all([getRoutes(), params]);
  // Path-only resolution here: `?s=` etc. are handled by the components that read searchParams.
  const resolved = resolveRoute(manifest, slug);
  if (resolved.kind === "not_found") {
    // proxy.ts renders this route for unknown paths and forwards the visitor's path.
    return (
      <RouteNotFound lang={langForPath(manifest, await requestPath()) || resolved.lang || "en"} />
    );
  }
  if (resolved.kind === "styleguide") permanentRedirect("/styleguide/");
  const Component = ROUTES[resolved.kind as keyof typeof ROUTES];
  return (
    <Suspense fallback={<div aria-busy="true" />}>
      <Component resolved={resolved} searchParams={searchParams} />
    </Suspense>
  );
}
