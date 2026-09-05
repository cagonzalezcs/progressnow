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
    link.push({ key: `hreflang-${alt.lang}`, rel: "alternate", hreflang: alt.lang, href: alt.href });
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
