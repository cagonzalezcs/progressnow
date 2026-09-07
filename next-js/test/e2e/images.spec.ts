import { expect, test } from "@playwright/test";

/* Image optimization policy (openspec next-deployment § Image optimization
 * policy; task 8.2): card images go through next/image on the allowlisted
 * WordPress host with the envelope's alt, the optimizer serves AVIF/WebP, and
 * it refuses unlisted hosts and SVG. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;

test("a post card's image is the optimizer URL for the WordPress upload, with the envelope alt", async ({
  page,
  request,
}) => {
  await page.goto("/blog/");
  // The lone fixture post is the archive's featured card; a grid card renders the same slot.
  const img = page
    .locator("[data-testid='featured-post-card-image'] img, [data-testid='post-card-image'] img")
    .first();
  await expect(img).toHaveAttribute("alt", "Contract Test Post");
  const src = (await img.getAttribute("src"))!;
  expect(src).toMatch(/^\/_next\/image\/?\?url=/);
  const url = new URL(src, "http://127.0.0.1");
  expect(url.searchParams.get("url")).toBe(`${MOCK}/wp-content/uploads/contract-test-post.png`);
  expect(Number(url.searchParams.get("w"))).toBeGreaterThan(0);
  // The optimizer fetches the upload from the mock and answers a modern format.
  const optimized = await request.get(src, { headers: { accept: "image/avif,image/webp,*/*" } });
  expect(optimized.status()).toBe(200);
  expect(optimized.headers()["content-type"]).toMatch(/^image\/(avif|webp)$/);
  // The <img> actually painted (no broken image).
  expect(await img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("the optimizer refuses images on unlisted hosts", async ({ request }) => {
  const res = await request.get(
    `/_next/image?url=${encodeURIComponent("https://evil.example/hero.png")}&w=640&q=75`,
  );
  expect(res.status()).toBe(400);
});

test("the optimizer refuses SVG (dangerouslyAllowSVG is off)", async ({ request }) => {
  const svg = `${MOCK}/wp-content/themes/progressnow/static/images/brand/logo-square.svg`;
  const res = await request.get(`/_next/image?url=${encodeURIComponent(svg)}&w=640&q=75`);
  expect(res.status()).toBe(400);
});
