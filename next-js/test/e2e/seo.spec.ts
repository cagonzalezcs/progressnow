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
