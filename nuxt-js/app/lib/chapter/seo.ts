import type { Seo } from "@/lib/schemas";

/* `seo` block → head tags for client navigations (openspec spec
 * nuxt-static-site § Client navigation keeps SEO state current). The landing
 * route keeps the PHP head untouched — by contract it already equals this. */

export interface HeadLink {
  key: string;
  rel: string;
  href: string;
  hreflang?: string;
}

export interface HeadMeta {
  key: string;
  name: string;
  content: string;
}

export interface RouteHead {
  htmlAttrs: { lang: string };
  title: string;
  meta: HeadMeta[];
  link: HeadLink[];
}

export function headForSeo(seo: Seo, lang: string): RouteHead {
  const link: HeadLink[] = [];
  if (seo.canonical) {
    link.push({ key: "canonical", rel: "canonical", href: seo.canonical });
  }
  for (const alt of seo.hreflang) {
    link.push({
      key: `hreflang-${alt.lang}`,
      rel: "alternate",
      hreflang: alt.lang,
      href: alt.href,
    });
  }
  return {
    htmlAttrs: { lang: lang || "en" },
    title: seo.title,
    meta: [
      { key: "description", name: "description", content: seo.description },
      { key: "robots", name: "robots", content: seo.robots },
    ],
    link,
  };
}

/* PHP-shell head handoff (openspec spec nuxt-static-site § Client navigation
 * keeps SEO state current). The shell's `<link rel="alternate" hreflang>` tags
 * stay in the DOM on the landing route. unhead indexes every existing head
 * element by its dedupe key (`alternate:<lang>`) the first time it renders, and
 * on the first client navigation it ADOPTS the first element per key — mutating
 * it in place and stamping `data-hid` — rather than creating a new one. So the
 * shell's links must not be detached up front (unhead would keep updating the
 * detached nodes and the document would lose its hreflang); only the ones
 * unhead did not adopt are dropped, after a render that included the
 * alternates. */
export function rendersAlternates(renders: ReadonlyArray<{ id?: string }>): boolean {
  return renders.some((r) => typeof r.id === "string" && r.id.startsWith("alternate:"));
}

/** Removes the shell's hreflang links unhead did not adopt; returns how many. */
export function dropUnadoptedAlternates(links: Iterable<Element>): number {
  let dropped = 0;
  for (const link of links) {
    if (link.hasAttribute("data-hid")) continue;
    link.remove();
    dropped += 1;
  }
  return dropped;
}
