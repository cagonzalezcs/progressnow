import { RouteNotFound } from "@/components/routes/RouteNotFound";
import { getRoutes } from "@/lib/data";
import { requestPath } from "@/lib/request-path";
import { langForPath } from "@/lib/routes";

/* Fallback for notFound() thrown elsewhere (data missing for a manifest route).
 * Unknown paths never reach this: the catch-all renders RouteNotFound directly. */
export default async function NotFound() {
  const [manifest, path] = await Promise.all([getRoutes(), requestPath()]);
  return <RouteNotFound lang={langForPath(manifest, path) || "en"} />;
}
