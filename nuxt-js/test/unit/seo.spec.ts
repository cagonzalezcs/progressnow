import { describe, expect, it } from "vitest";
import { headForSeo } from "@/lib/chapter/seo";

/* openspec next-js-site-implementation task 7.5 / seo-metadata delta: the Nuxt
 * rendition emits the envelope's canonical and hreflang VERBATIM — when
 * WordPress is configured with CHAPTER_CANONICAL_ORIGIN (another frontend is
 * primary), the values already carry that origin and Nuxt must not rewrite
 * them onto its own. */
describe("headForSeo canonical origin", () => {
  it("emits a foreign-origin canonical and hreflang hrefs byte for byte", () => {
    const head = headForSeo(
      {
        title: "About – Progress Now",
        description: "Organizing.",
        canonical: "https://app.example/about/",
        robots: "index,follow",
        hreflang: [
          { lang: "en", href: "https://app.example/about/" },
          { lang: "es", href: "https://app.example/es/acerca/" },
        ],
      },
      "en",
    );
    expect(head.link).toEqual([
      { key: "canonical", rel: "canonical", href: "https://app.example/about/" },
      { key: "hreflang-en", rel: "alternate", hreflang: "en", href: "https://app.example/about/" },
      {
        key: "hreflang-es",
        rel: "alternate",
        hreflang: "es",
        href: "https://app.example/es/acerca/",
      },
    ]);
    expect(head.meta).toContainEqual({ key: "robots", name: "robots", content: "index,follow" });
    expect(head.title).toBe("About – Progress Now");
  });

  it("omits the canonical link when the envelope has none (404)", () => {
    const head = headForSeo(
      {
        title: "Page not found",
        description: "",
        canonical: "",
        robots: "noindex,follow",
        hreflang: [],
      },
      "es",
    );
    expect(head.link).toEqual([]);
    expect(head.htmlAttrs).toEqual({ lang: "es" });
  });
});
