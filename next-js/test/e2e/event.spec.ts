import { expect, test, type APIRequestContext } from "@playwright/test";

/* Single event in the production build (openspec progress-now-v4-events D4;
 * next-headless-site § Route parity). Fully server-rendered — no island. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;

async function eventPaths(request: APIRequestContext) {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/routes`);
  const { routes } = (await res.json()) as {
    routes: { path: string; kind: string; lang: string }[];
  };
  return routes.filter((r) => r.kind === "event");
}

test("event renders hero, when/where, details and calendar links server-side", async ({
  request,
  page,
}) => {
  const [en] = await eventPaths(request);
  expect(en).toBeDefined();
  const html = await (await request.get(en!.path)).text();
  expect(html).toContain('data-route-kind="event"');
  expect(html).toContain("Thursday, July 4, 2030 · 6:00–8:00 PM · Union Hall · Downtown");
  expect(html).toContain('aria-label="Event details"');
  expect(html).toContain("Add to calendar");

  await page.goto(en!.path);
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Chapter-Wide" })).toHaveAttribute(
    "href",
    /\/calendar\/\?category=chapter$/,
  );
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link", { name: "Calendar" })).toHaveAttribute(
    "href",
    "/calendar/",
  );
});

test("Spanish event renders in its language", async ({ request, page }) => {
  const es = (await eventPaths(request)).find((r) => r.lang === "es");
  expect(es).toBeDefined();
  await page.goto(es!.path);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("[data-route-kind='event']:visible")).toHaveCount(1);
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: /Calendar|Calendario/ }),
  ).toHaveAttribute("href", /\/es\//);
});
