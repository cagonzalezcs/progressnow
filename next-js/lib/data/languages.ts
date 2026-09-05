import { getEvent, getFrontPage, getPage, getPost, getSite } from "@/lib/data";
import { payloadSlug, type ResolvedRoute } from "@/lib/routes";
import type { LanguageLink } from "@/lib/contracts";

/* The language toggle links to the CURRENT route's translations (openspec
 * next-headless-site § Chrome and copy come from the /site envelope). The root
 * layout resolves the path itself and reads the same cached envelope the page
 * reads ('use cache' dedupes within the render), falling back to the site-level
 * language homes for 404s, search and the styleguide. */
export async function getRouteLanguages(resolved: ResolvedRoute): Promise<LanguageLink[]> {
  const { lang, route } = resolved;
  try {
    switch (resolved.kind) {
      case "front":
        return (await getFrontPage(lang)).languages;
      case "page":
      case "about":
      case "get_involved":
      case "calendar":
      case "posts_index":
        return route ? ((await getPage(payloadSlug(route), lang))?.languages ?? []) : [];
      case "post":
        return route ? ((await getPost(payloadSlug(route), lang))?.languages ?? []) : [];
      case "event":
        return route ? ((await getEvent(payloadSlug(route), lang))?.languages ?? []) : [];
      default:
        return (await getSite(lang)).languages;
    }
  } catch {
    return (await getSite(lang)).languages;
  }
}
