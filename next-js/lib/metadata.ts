import type { Metadata } from "next";
import type { Seo } from "@/lib/schemas";

/* Envelope `seo` block → Next Metadata, 1:1 (openspec design D5 / seo-metadata
 * delta): title, description, robots, canonical VERBATIM (the canonical origin
 * is WordPress' decision — CHAPTER_CANONICAL_ORIGIN), `alternates.languages`
 * from hreflang, Open Graph url = canonical, OG image ladder route image →
 * identity.share_image. Pure and framework-free so it is unit-tested from the
 * theme fixtures. */

export interface SeoImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface MetadataInput {
  seo: Seo;
  /** route image first, then identity.share_image — the first with a src wins */
  images?: (SeoImage | null | undefined)[];
  /** "article" for posts, else website */
  type?: "website" | "article";
  /** island filter state (`?s=`, `?category=`, `?paged=`): noindex, canonical stays the clean page */
  filtered?: boolean;
  /** app origin — theme static paths are served here (same-origin proxy) */
  siteOrigin: string;
  /** WordPress origin — relative upload paths resolve here */
  wpOrigin: string;
}

const THEME_STATIC = /^\/wp-content\/themes\//;

/** Absolute image URL: theme static → app origin (proxied), other relative → WordPress. */
export function absoluteImageUrl(src: string, siteOrigin: string, wpOrigin: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return new URL(src, THEME_STATIC.test(src) ? siteOrigin : wpOrigin).href;
}

export function parseRobots(robots: string): { index: boolean; follow: boolean } {
  const parts = robots.split(",").map((p) => p.trim().toLowerCase());
  return { index: !parts.includes("noindex"), follow: !parts.includes("nofollow") };
}

export function metadataFor({
  seo,
  images = [],
  type = "website",
  filtered = false,
  siteOrigin,
  wpOrigin,
}: MetadataInput): Metadata {
  const robots = filtered ? { index: false, follow: true } : parseRobots(seo.robots);
  const image = images.find((i) => i?.src);
  const languages = Object.fromEntries(seo.hreflang.map((h) => [h.lang, h.href]));
  return {
    title: { absolute: seo.title },
    description: seo.description,
    robots,
    alternates: {
      ...(seo.canonical ? { canonical: seo.canonical } : {}),
      ...(seo.hreflang.length ? { languages } : {}),
    },
    openGraph: {
      type,
      title: seo.title,
      description: seo.description,
      ...(seo.canonical ? { url: seo.canonical } : {}),
      ...(image
        ? {
            images: [
              {
                url: absoluteImageUrl(image.src, siteOrigin, wpOrigin),
                ...(image.width ? { width: image.width } : {}),
                ...(image.height ? { height: image.height } : {}),
                ...(image.alt ? { alt: image.alt } : {}),
              },
            ],
          }
        : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

/** Routes without an envelope `seo` block (404, search): a title from the site strings, never indexed. */
export function noindexMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: true } };
}
