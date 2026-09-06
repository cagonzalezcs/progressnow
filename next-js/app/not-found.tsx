import { RouteNotFound } from "@/components/routes/RouteNotFound";
import { getRoutes } from "@/lib/data";
import { requestPath } from "@/lib/request-path";
import { langForPath } from "@/lib/routes";

/* Fallback for notFound() thrown elsewhere (data missing for a manifest route).
 * Unknown paths never reach this: the catch-all renders RouteNotFound directly.
 * Must never throw itself — Next renders it inside the error fallback tree. */
export default async function NotFound() {
  const path = await requestPath();
  let lang = /^\/([a-z]{2})(?:\/|$)/.exec(path)?.[1] ?? "en";
  try {
    lang = langForPath(await getRoutes(), path) || lang;
  } catch {
    /* upstream down: keep the prefix guess */
  }
  return <RouteNotFound lang={lang} />;
}
