import { expect, test } from "@playwright/test";
import { signatureHeader } from "../../../lib/signing";

/* CHAPTER_CANONICAL_ORIGIN end to end (openspec seo-metadata delta; design
 * D5): WordPress (the mock) mints canonical/hreflang on a foreign origin and
 * the app emits them VERBATIM — canonical, hreflang, og:url and the JSON-LD
 * entity ids — while its own sitemap keeps listing app-origin URLs. Serial:
 * the mock switch is global and the cache must be expired with a signed
 * rebuild for the new envelopes to be read. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const SECRET = "playwright-test-secret";
const CANONICAL = "https://canonical.example";

function signed(body: string) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  return {
    data: Buffer.from(body, "utf8"),
    headers: {
      "content-type": "application/json",
      "x-chapter-timestamp": timestamp,
      "x-chapter-signature": signatureHeader(body, timestamp, SECRET),
    },
  };
}

async function expireCache(request: import("@playwright/test").APIRequestContext) {
  const body = JSON.stringify({
    event: "rebuild",
    requestId: `canonical-${Date.now()}`,
    contentVersion: 2,
    reason: "test",
    siteUrl: MOCK,
    requestedAt: new Date().toISOString(),
  });
  expect((await request.post("/api/rebuild", signed(body))).status()).toBe(202);
}

test.describe.serial("canonical origin", () => {
  test.afterAll(async ({ request }) => {
    await request.post(`${MOCK}/__mock/canonical-origin`, { data: { origin: null } });
    await expireCache(request);
  });

  test("a foreign canonical origin flows verbatim into canonical, hreflang, og:url and JSON-LD", async ({
    request,
    baseURL,
  }) => {
    await request.post(`${MOCK}/__mock/canonical-origin`, { data: { origin: CANONICAL } });
    await expireCache(request);

    for (const path of ["/about/", "/es/acerca/", "/blog/contract-test-post/"]) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain(`<link rel="canonical" href="${CANONICAL}${path}"`);
      const hreflangs = [
        ...html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/gi),
      ].map((m) => m[1]);
      expect(hreflangs.length, path).toBeGreaterThan(1);
      for (const href of hreflangs) expect(href, path).toMatch(new RegExp(`^${CANONICAL}/`));
      expect(html, path).toContain(`<meta property="og:url" content="${CANONICAL}${path}"`);
      const graph = [
        ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
      ].flatMap((m) => (JSON.parse(m[1]!) as { "@graph": Record<string, unknown>[] })["@graph"]);
      const org = graph.find((n) => n["@type"] === "Organization")!;
      expect(org["@id"], path).toBe(`${CANONICAL}/#organization`);
      expect(org.url, path).toBe(`${CANONICAL}/`);
    }

    // The app's own sitemap still lists the app origin (routes), not the canonical one.
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>${baseURL}/about/</loc>`);
    expect(sitemap).not.toContain(CANONICAL);
  });

  test("resetting the origin restores WordPress-origin canonicals on the next request", async ({
    request,
  }) => {
    await request.post(`${MOCK}/__mock/canonical-origin`, { data: { origin: null } });
    await expireCache(request);
    const html = await (await request.get("/about/")).text();
    expect(html).toContain(`<link rel="canonical" href="${MOCK}/about/"`);
  });
});
