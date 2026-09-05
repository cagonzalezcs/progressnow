import { expect, test } from "@playwright/test";

/* Typography faces load same-origin through the theme static proxy (openspec
 * next-design-system § Typography faces; next-headless-site § Media delivery;
 * next-deployment § Static and proxied asset caching). */
const APP = process.env.PW_APP_ORIGIN ?? "http://127.0.0.1:3100";

test("fonts are requested same-origin, preloaded, and never from a third party", async ({
  page,
}) => {
  const fontRequests: string[] = [];
  const consoleErrors: string[] = [];
  page.on("request", (req) => {
    if (req.resourceType() === "font" || /\.woff2?(\?|$)/.test(req.url()))
      fontRequests.push(req.url());
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) expect(new URL(url).origin, url).toBe(APP);
  expect(consoleErrors.filter((e) => /cors|font|blocked/i.test(e))).toEqual([]);

  const preloads = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute("href"), cross: el.getAttribute("crossorigin") })),
    );
  expect(preloads.some((p) => p.href?.includes("BowlbyOne-Regular.woff2"))).toBe(true);
  expect(preloads.every((p) => p.cross === "anonymous" || p.cross === "")).toBe(true);
});

test("the theme static proxy serves fonts and brand art with immutable caching", async ({
  request,
}) => {
  const font = await request.get(
    "/wp-content/themes/progressnow/static/fonts/bowlby-one/BowlbyOne-Regular.woff2",
  );
  expect(font.status()).toBe(200);
  expect(font.headers()["content-type"]).toContain("font/woff2");
  expect(font.headers()["cache-control"]).toContain("immutable");

  const art = await request.get(
    "/wp-content/themes/progressnow/static/images/brand/logo-square.svg",
  );
  expect(art.status()).toBe(200);
  expect(art.headers()["content-type"]).toContain("svg");
});
