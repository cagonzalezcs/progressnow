import { expect, test } from "@playwright/test";

/* Posts index interactions in the production build (openspec next-headless-
 * site § Interactive archive and calendar, § Server rendering of every route
 * state). The mock corpus has one post; the receiver e2e may rename it in
 * parallel, so assertions target states and structure, not a specific title. */
test("browse page renders featured card server-side; chips and search drive the URL", async ({
  page,
}) => {
  await page.goto("/blog/");
  await expect(page.locator(".featured-post-card:visible")).toHaveCount(1);
  await expect(page.locator("[data-archive='browse']")).toHaveCount(1); // may be empty (single featured post) → zero-size, so not "visible"

  await page.getByRole("button", { name: "Labor" }).click();
  await expect(page).toHaveURL(/\/blog\/\?category=labor$/);
  await expect(page.getByRole("button", { name: "Labor" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-results-status]:visible")).toHaveText(/posts? in Labor/);

  const search = page.getByRole("searchbox", { name: /Search posts/ });
  await search.fill("zzz-no-match");
  await expect(page).toHaveURL(/s=zzz-no-match/);
  await expect(page.locator("[data-empty='filtered']:visible")).toBeVisible();

  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator(".featured-post-card:visible")).toHaveCount(1);
});

test("filtered and paged states are fully server-rendered (no JavaScript)", async ({ request }) => {
  const html = await (await request.get("/blog/?category=labor")).text();
  expect(html).toContain('data-results-status=""');
  expect(html).toMatch(/posts? in Labor/);
  expect(html).toMatch(/name="robots" content="noindex,\s*follow"/); // generateMetadata (Next spaces the list)
  const paged = await (await request.get("/blog/page/2/")).text();
  expect(paged).toContain('data-archive="browse"');
});
