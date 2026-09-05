import { expect, test, type APIRequestContext } from "@playwright/test";

/* Single post in the production build (openspec progress-now-v4-blog D4;
 * next-headless-site § Route parity). The mock corpus has one post whose title
 * the receiver e2e may rename in parallel, so assertions target structure. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;

async function postPaths(request: APIRequestContext) {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/routes`);
  const { routes } = (await res.json()) as {
    routes: { path: string; kind: string; lang: string }[];
  };
  return routes.filter((r) => r.kind === "post");
}

test("post renders hero, byline, blocks and share row server-side; copy link works", async ({
  page,
  request,
  context,
}) => {
  const [en] = await postPaths(request);
  expect(en).toBeDefined();
  const html = await (await request.get(en!.path)).text();
  expect(html).toContain('data-route-kind="post"');
  expect(html).toContain("block-prose");
  expect(html).toContain("block-pull-quote");
  expect(html).toContain("min read");

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(en!.path);
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Email it" })).toHaveAttribute(
    "href",
    /^mailto:\?subject=/,
  );
  const copy = page.getByRole("button", { name: "Copy link" });
  await copy.click();
  await expect(page.getByRole("button", { name: "Copied ✓" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toHaveCount(1);
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(page.url());
});

test("Spanish post renders in its language with the same anatomy", async ({ page, request }) => {
  const es = (await postPaths(request)).find((r) => r.lang === "es");
  expect(es).toBeDefined();
  await page.goto(es!.path);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("[data-route-kind='post']:visible")).toHaveCount(1);
  await expect(page.locator(".share-row:visible")).toHaveCount(1);
});
