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
  await expect(page.locator("[data-archive='browse'][data-page='2']")).toHaveCount(1);

  await page.goto("/category/labor/");
  await expect(page.locator("[data-results-status]:visible")).toHaveText(/in Labor/);

  await page.goto("/es/category/labor/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // The receiver e2e renames the fixture post in parallel, so assert the search state, not a hit.
  await page.goto("/?s=contract");
  await expect(page.locator("[data-route-kind='search']:visible")).toBeVisible();
  await expect(page.locator("[data-route-kind='search']:visible [role='status']")).toHaveText(
    /\d+ result/,
  );
});

/* Found against a real WordPress in openspec next-js-site-implementation task 8.5:
 * `/posts` validates `category` against the registry enum, so an unknown slug is a
 * 400 upstream. The archive path must 404 (WordPress does) and the query filter must
 * be dropped — neither may reach the API. */
test("an unknown category 404s as an archive path and is ignored as a filter", async ({
  page,
  request,
}) => {
  expect((await request.get("/category/no-such-category/")).status()).toBe(404);
  await page.goto("/category/no-such-category/");
  await expect(page.locator("[data-route-kind='not_found']:visible")).toBeVisible();

  expect((await request.get("/es/category/no-such-category/")).status()).toBe(404);

  const filtered = await request.get("/blog/?category=no-such-category");
  expect(filtered.status()).toBe(200);
  await page.goto("/blog/?category=no-such-category");
  await expect(page.locator("[data-archive='browse']")).toHaveCount(1);
});

test("a bare language directory 301s to that language's front page, as WordPress does", async ({
  page,
  request,
  baseURL,
}) => {
  // Polylang keeps the translated static front page at its own slug (/es/inicio/) and
  // redirects the bare /es/ to it; the app mirrors that from the manifest, not a hard-coded slug.
  const { routes } = await manifest(request);
  const front = routes.find((r) => r.kind === "front" && r.lang === "es")!;
  expect(front.path).toBe("/es/inicio/");

  // The server may emit Location relative or absolute; resolve it either way.
  const bare = await request.get("/es/", { maxRedirects: 0 });
  expect(bare.status()).toBe(301);
  expect(new URL(bare.headers()["location"]!, baseURL).pathname).toBe(front.path);
  // The query string survives the hop…
  const tagged = await request.get("/es/?utm_source=x", { maxRedirects: 0 });
  expect(tagged.status()).toBe(301);
  expect(new URL(tagged.headers()["location"]!, baseURL).search).toBe("?utm_source=x");
  // …search included: the front page renders the results after the hop.
  const search = await request.get("/es/?s=contract", { maxRedirects: 0 });
  expect(search.status()).toBe(301);
  expect(new URL(search.headers()["location"]!, baseURL).search).toBe("?s=contract");
  await page.goto("/es/?s=contract");
  await expect(page).toHaveURL(/\/es\/inicio\/\?s=contract$/);
  await expect(page.locator("[data-route-kind='search']:visible")).toBeVisible();

  await page.goto("/es/");
  await expect(page).toHaveURL(/\/es\/inicio\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("[data-route-kind]:visible")).toHaveAttribute(
    "data-route-kind",
    "front",
  );
});

test("an unknown path is a 404 rendered from site strings and costs zero WordPress requests", async ({
  page,
  request,
}) => {
  // No /__mock/reset here: it would undo the receiver e2e's title overlay mid-test
  // (fullyParallel); the request-log filter below isolates this test on its own.
  const response = await page.goto("/does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("[data-route-kind]:visible")).toHaveAttribute(
    "data-route-kind",
    "not_found",
  );
  await expect(page.locator("h1")).not.toBeEmpty();
  // Spanish chrome comes from the /es/ directory, not the front page's full path (/es/inicio/).
  const es = await page.goto("/es/no-existe/");
  expect(es?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(
    page.getByRole("navigation", { name: "Main" }).last().getByRole("link", { name: "Calendario" }),
  ).toHaveAttribute("href", "/es/calendario/");

  const log = (await (await request.get(`${MOCK}/__mock/requests`)).json()) as string[];
  expect(log.filter((p) => p.includes("does-not-exist") || p.includes("no-existe"))).toEqual([]);
});

test("health answers without WordPress and events proxies same-origin", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ ok: true });

  const bad = await request.get("/api/events?lang=nope!");
  expect(bad.status()).toBe(400);
  const events = await request.get("/api/events?lang=en&from=2026-07-01&to=2026-07-31");
  expect(events.status()).toBe(200);
  expect((await events.json()).events.length).toBeGreaterThan(0);
});
