import { expect, test, type APIRequestContext } from "@playwright/test";

/* SEO surfaces in the production build (openspec next-headless-site
 * § Envelope-driven document head; design D5). Task 7.2: sitemap + robots on
 * the app origin. Task 7.6 extends this with canonical/hreflang/OG/JSON-LD. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;

async function manifest(request: APIRequestContext) {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/routes`);
  return (await res.json()) as { routes: { path: string; kind: string; lang: string }[] };
}

test("sitemap.xml lists every indexable route in both languages with hreflang alternates", async ({
  request,
  baseURL,
}) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/xml");
  const xml = await res.text();
  const { routes } = await manifest(request);
  for (const r of routes) {
    const loc = `<loc>${baseURL}${r.path}</loc>`;
    if (r.kind === "styleguide") expect(xml).not.toContain(loc);
    else expect(xml, r.path).toContain(loc);
  }
  expect(xml).not.toContain("?s=");
  expect(xml).toContain(`hreflang="es" href="${baseURL}/es/acerca/"`);
  expect(xml).toContain(`hreflang="en" href="${baseURL}/about/"`);
});

test("robots.txt allows the site, blocks internal surfaces and points at the sitemap", async ({
  request,
  baseURL,
}) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const txt = await res.text();
  expect(txt).toContain("Disallow: /styleguide/");
  expect(txt).toContain("Disallow: /api/");
  expect(txt).toContain(`Sitemap: ${baseURL}/sitemap.xml`);
});

/** Every ld+json graph on the page, parsed. */
async function graphs(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]!) as { "@context": string; "@graph": Record<string, unknown>[] },
  );
}

test("JSON-LD: Organization exactly once on every page; Article on posts; Event on events", async ({
  request,
}) => {
  const { routes } = await manifest(request);
  const post = routes.find((r) => r.kind === "post" && r.lang === "en")!;
  const event = routes.find((r) => r.kind === "event" && r.lang === "en")!;

  const home = (await graphs(request, "/")).flatMap((g) => g["@graph"]);
  const orgs = home.filter((n) => n["@type"] === "Organization");
  expect(orgs).toHaveLength(1);
  expect(orgs[0]).toMatchObject({ name: expect.any(String), url: expect.stringMatching(/\/$/) });
  expect(String(orgs[0]!["@id"])).toMatch(/\/#organization$/);

  const postNodes = (await graphs(request, post.path)).flatMap((g) => g["@graph"]);
  expect(postNodes.filter((n) => n["@type"] === "Organization")).toHaveLength(1);
  const article = postNodes.find((n) => n["@type"] === "Article")!;
  expect(article).toMatchObject({
    headline: expect.any(String),
    author: { "@type": expect.stringMatching(/Person|Organization/) },
    publisher: { "@id": orgs[0]!["@id"] },
  });

  const eventNodes = (await graphs(request, event.path)).flatMap((g) => g["@graph"]);
  const ev = eventNodes.find((n) => n["@type"] === "Event")!;
  expect(ev).toMatchObject({
    name: "Contract Test Event",
    startDate: "2030-07-04T18:00:00-05:00",
    endDate: "2030-07-04T20:00:00-05:00",
    location: { "@type": "Place", name: "Union Hall" },
    organizer: { "@id": orgs[0]!["@id"] },
  });
});

/** <head> tags of a route as the browser sees them. */
async function headTags(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();
  const attr = (re: RegExp) => [...html.matchAll(re)].map((m) => m[1]!);
  return {
    canonical: attr(/<link rel="canonical" href="([^"]+)"/g),
    // React renders the camelCase prop as `hrefLang=`; HTML attribute names are case-insensitive.
    hreflang: [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)].map(
      (m) => [m[1]!, m[2]!] as const,
    ),
    og: Object.fromEntries(
      [...html.matchAll(/<meta property="(og:[a-z:]+)" content="([^"]*)"/g)].map((m) => [
        m[1]!,
        m[2]!,
      ]),
    ),
    robots: attr(/<meta name="robots" content="([^"]+)"/g),
    title: attr(/<title>([^<]*)<\/title>/g)[0],
  };
}

test("head: canonical verbatim, hreflang alternates, OG url = canonical, share image — both languages", async ({
  request,
}) => {
  const { routes } = await manifest(request);
  for (const lang of ["en", "es"] as const) {
    const post = routes.find((r) => r.kind === "post" && r.lang === lang)!;
    const head = await headTags(request, post.path);
    expect(head.canonical, post.path).toEqual([`${MOCK}${post.path}`]); // WordPress origin, verbatim
    expect(head.hreflang.map(([l]) => l).sort()).toEqual(["en", "es"]);
    for (const [, href] of head.hreflang) expect(href.startsWith(`${MOCK}/`)).toBe(true);
    expect(head.og["og:url"]).toBe(`${MOCK}${post.path}`);
    expect(head.og["og:type"]).toBe("article");
    expect(head.og["og:image"]).toMatch(/\/static\/images\/brand\/share-default\.jpg$/); // ladder fallback
    expect(head.robots).toEqual(["index, follow"]);
    // <title> is the envelope's seo.title verbatim (WordPress composes "Title – Site").
    const envelope = (await (
      await request.get(`${MOCK}/wp-json/progressnow/v1/posts/contract-test-post?lang=${lang}`)
    ).json()) as { seo: { title: string } };
    expect(head.title).toBe(envelope.seo.title);
  }
  const about = await headTags(request, "/about/");
  expect(about.og["og:type"]).toBe("website");
  const filtered = await headTags(request, "/blog/?category=labor");
  expect(filtered.robots).toEqual(["noindex, follow"]);
  expect(filtered.canonical).toEqual([`${MOCK}/blog/`]); // clean page canonical
});
