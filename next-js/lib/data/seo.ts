import { getEvent, getFrontPage, getPage, getPost, getSite } from "@/lib/data";
import type { SeoImage } from "@/lib/metadata";
import { payloadSlug, type ResolvedRoute } from "@/lib/routes";
import type { PostImage, Seo } from "@/lib/schemas";

/** Envelope image (nullable src) → OG ladder rung, or null when there is no photo. */
function rung(image: PostImage): SeoImage | null {
  return image.src ? { src: image.src, alt: image.alt } : null;
}

export interface RouteSeo {
  seo: Seo;
  /** the route's own image for the OG ladder (posts, events) */
  image?: SeoImage | null;
  type: "website" | "article";
}

/* The current route's `seo` block from the same cached envelope the route
 * component reads ('use cache' dedupes within the render). null when the route
 * has no envelope (404, search) or the entity is missing. */
export async function getRouteSeo(resolved: ResolvedRoute): Promise<RouteSeo | null> {
  const { lang, route } = resolved;
  switch (resolved.kind) {
    case "front":
      return { seo: (await getFrontPage(lang)).seo, type: "website" };
    case "page":
    case "about":
    case "get_involved":
    case "calendar":
    case "posts_index": {
      const page = route ? await getPage(payloadSlug(route), lang) : null;
      return page ? { seo: page.seo, type: "website" } : null;
    }
    case "post": {
      const post = route ? await getPost(payloadSlug(route), lang) : null;
      return post
        ? {
            seo: post.seo,
            image: rung(post.featuredImage),
            type: "article",
          }
        : null;
    }
    case "event": {
      const envelope = route ? await getEvent(payloadSlug(route), lang) : null;
      return envelope
        ? {
            seo: envelope.seo,
            image: rung(envelope.event.featuredImage),
            type: "website",
          }
        : null;
    }
    default:
      return null;
  }
}

/** identity.share_image as the ladder's last rung (null when WordPress has none). */
export async function shareImage(lang: string): Promise<SeoImage | null> {
  const { identity } = await getSite(lang);
  return identity.share_image.src ? identity.share_image : null;
}
