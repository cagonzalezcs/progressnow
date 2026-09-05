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
import { ErrorSurface } from "@/components/site/ErrorSurface";
import { failureDigest } from "@/lib/api";
import { getRoutes } from "@/lib/data";
import { logger } from "@/lib/log";
import { isErrorRender, requestPath } from "@/lib/request-path";
import { langForPath, resolveRoute } from "@/lib/routes";

/* One catch-all page (design D3): every public WordPress URL, in both
 * languages, resolves against the cached `/routes` manifest and renders the
 * matching route component. Routes render per request from the cached data
 * layer (design D11): new content resolves on its first request, and the
 * build needs no API. `searchParams` are only read inside the route components
 * that need them (front, posts index), inside their own Suspense fragments.
 *
 * The page renders concurrently with the root layout, so it must be as
 * resilient to an upstream failure as the layout is: an uncaught throw here
 * would abort the whole response (Next's bare "Internal Server Error") before
 * the layout's error document could stream. */

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

/** The manifest, or the error surface when WordPress cannot be read (status: proxy.ts). */
async function loadManifest(): Promise<
  { ok: true; manifest: Awaited<ReturnType<typeof getRoutes>> } | { ok: false; digest: string }
> {
  try {
    return { ok: true, manifest: await getRoutes() };
  } catch (error) {
    // See app/layout.tsx: obfuscated across the 'use cache' boundary; the digest links the logs.
    const digest = failureDigest(error);
    logger.error("page_upstream_failure", { digest });
    return { ok: false, digest };
  }
}

export default async function Page({ params, searchParams }: PageProps<"/[[...slug]]">) {
  // proxy.ts' internal 500 render: the layout draws the error document; nothing to add here.
  if (await isErrorRender()) return null;
  // Unknown paths render the 404 view as a normal state; proxy.ts sets the 404 status
  // (a thrown notFound() would only reach the client behind the streamed shell).
  const [loaded, { slug }] = await Promise.all([loadManifest(), params]);
  if (!loaded.ok) return <ErrorSurface digest={loaded.digest} />;
  const { manifest } = loaded;
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
