import { expect, test, type APIRequestContext } from "@playwright/test";

/* Route parity against the mock manifest (openspec next-headless-site § Route
 * parity, § Content freshness — unknown path is cheap). */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;

async function manifest(request: APIRequestContext) {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/routes`);
  return (await res.json()) as { routes: { path: string; kind: string; lang: string }[] };
}

test("every manifest route renders in its language with one main landmark and one h1", async ({
  page,
  request,
}) => {
  const { routes } = await manifest(request);
  expect(routes.length).toBeGreaterThan(10);
  for (const route of routes) {
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);
    await expect(page.locator("html"), route.path).toHaveAttribute("lang", route.lang);
    await expect(page.locator("main#main"), route.path).toHaveCount(1);
    await expect(page.locator("h1:visible"), route.path).toHaveCount(1);
    const kind = route.kind === "posts_index" ? "posts_index" : route.kind;
    await expect(page.locator("[data-route-kind]:visible"), route.path).toHaveAttribute(
      "data-route-kind",
      kind,
    );
  }
});

test("derived posts-index states resolve: /blog/page/N/, /category/{slug}/, ?s=", async ({
  page,
}) => {
  await page.goto("/blog/page/2/");
  await expect(page.locator("[data-route-kind]:visible")).toHaveAttribute(
    "data-route-kind",
    "posts_index",
  );
  await expect(page.locator("[data-page='2']:visible")).toBeVisible();

  await page.goto("/category/labor/");
  await expect(page.locator("[data-category='labor']:visible")).toBeVisible();

  await page.goto("/es/category/labor/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // The receiver e2e renames the fixture post in parallel, so assert the search state, not a hit.
  await page.goto("/?s=contract");
  await expect(page.locator("[data-route-kind='search']:visible")).toBeVisible();
  await expect(page.locator("[data-route-kind='search']:visible [role='status']")).toHaveText(
    /\d+ result/,
  );
});

test("an unknown path is a 404 rendered from site strings and costs zero WordPress requests", async ({
  page,
  request,
}) => {
  await request.post(`${MOCK}/__mock/reset`, { data: {} });
  const response = await page.goto("/does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("[data-route-kind]:visible")).toHaveAttribute(
    "data-route-kind",
    "not_found",
  );
  await expect(page.locator("h1")).not.toBeEmpty();
  const es = await page.goto("/es/no-existe/");
  expect(es?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  const log = (await (await request.get(`${MOCK}/__mock/requests`)).json()) as string[];
  expect(log.filter((p) => p.includes("does-not-exist") || p.includes("no-existe"))).toEqual([]);
});

test("health answers without WordPress and events proxies same-origin", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ ok: true });

  const bad = await request.get("/api/events?lang=nope!");
  expect(bad.status()).toBe(400);
  const events = await request.get("/api/events?lang=en&from=2026-09-01&to=2026-09-30");
  expect(events.status()).toBe(200);
  expect((await events.json()).events.length).toBeGreaterThan(0);
});
