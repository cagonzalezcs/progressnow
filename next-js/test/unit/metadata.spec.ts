import { describe, expect, it } from "vitest";
import frontPage from "@fixtures/front-page.json";
import pageAbout from "@fixtures/page-about.json";
import singlePost from "@fixtures/single-post.json";
import siteFixture from "@fixtures/site.json";
import { absoluteImageUrl, metadataFor, noindexMetadata, parseRobots } from "@/lib/metadata";
import type {
  FrontPageEnvelope,
  PageEnvelope,
  SinglePostEnvelope,
  SiteEnvelope,
} from "@/lib/schemas";

/* openspec design D5 / seo-metadata delta: the envelope `seo` block maps 1:1,
 * canonical verbatim (WordPress owns the canonical origin), hreflang →
 * alternates.languages, OG url = canonical, OG image ladder. */
const SITE = "https://app.example";
const WP = "http://example.org";
const origins = { siteOrigin: SITE, wpOrigin: WP };
const front = frontPage as unknown as FrontPageEnvelope;
const about = pageAbout as unknown as PageEnvelope;
const post = singlePost as unknown as SinglePostEnvelope;
const share = (siteFixture as unknown as SiteEnvelope).identity.share_image;

describe("metadataFor", () => {
  it("maps the front page: title, description, robots, canonical, OG with the share image", () => {
    const m = metadataFor({ seo: front.seo, images: [null, share], ...origins });
    expect(m.title).toEqual({ absolute: front.seo.title });
    expect(m.description).toBe(front.seo.description);
    expect(m.robots).toEqual({ index: true, follow: true });
    expect(m.alternates).toEqual({ canonical: "http://example.org/" }); // verbatim, WordPress origin
    expect(m.openGraph).toMatchObject({
      type: "website",
      url: "http://example.org/",
      images: [
        {
          url: `${SITE}/wp-content/themes/progressnow/static/images/brand/share-default.jpg`,
          width: 1200,
          height: 630,
          alt: "Progress Now",
        },
      ],
    });
    expect(m.twitter).toEqual({ card: "summary_large_image" });
  });

  it("keeps a foreign canonical origin and hreflang verbatim", () => {
    const seo = {
      ...about.seo,
      canonical: "https://canonical.example/about/",
      hreflang: [
        { lang: "en", href: "https://canonical.example/about/" },
        { lang: "es", href: "https://canonical.example/es/acerca/" },
        { lang: "x-default", href: "https://canonical.example/about/" },
      ],
    };
    const m = metadataFor({ seo, ...origins });
    expect(m.alternates).toEqual({
      canonical: "https://canonical.example/about/",
      languages: {
        en: "https://canonical.example/about/",
        es: "https://canonical.example/es/acerca/",
        "x-default": "https://canonical.example/about/",
      },
    });
    expect(m.openGraph).toMatchObject({ url: "https://canonical.example/about/" });
    expect(m.openGraph).not.toHaveProperty("images");
    expect(m.twitter).toEqual({ card: "summary" });
  });

  it("post: article type, the route image wins the ladder, noindex robots honored", () => {
    const image = { src: `${WP}/wp-content/uploads/2026/06/photo.jpg`, alt: "Members" };
    const m = metadataFor({
      seo: { ...post.seo, robots: "noindex,follow" },
      images: [image, share],
      type: "article",
      ...origins,
    });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.openGraph).toMatchObject({
      type: "article",
      images: [{ url: image.src, alt: "Members" }],
    });
  });

  it("filtered archive state: noindex, canonical stays the clean page", () => {
    const m = metadataFor({ seo: about.seo, filtered: true, ...origins });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates).toEqual({ canonical: about.seo.canonical });
  });

  it("helpers: robots parsing, image absolutizing, noindex titles", () => {
    expect(parseRobots("index,follow")).toEqual({ index: true, follow: true });
    expect(parseRobots("noindex, nofollow")).toEqual({ index: false, follow: false });
    expect(absoluteImageUrl("/wp-content/themes/progressnow/static/x.jpg", SITE, WP)).toBe(
      `${SITE}/wp-content/themes/progressnow/static/x.jpg`,
    );
    expect(absoluteImageUrl("/wp-content/uploads/x.jpg", SITE, WP)).toBe(
      `${WP}/wp-content/uploads/x.jpg`,
    );
    expect(absoluteImageUrl("https://cdn.example/x.jpg", SITE, WP)).toBe(
      "https://cdn.example/x.jpg",
    );
    expect(noindexMetadata("Page not found")).toEqual({
      title: "Page not found",
      robots: { index: false, follow: true },
    });
  });
});
