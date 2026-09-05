import { expect, test } from "@playwright/test";

/* Harness smoke (task 2.8): the production build answers, and WordPress
 * permalink shape holds — paths end with a slash (next-headless-site
 * § Trailing slash normalization). */
test("front page renders from the production build", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main#main")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("paths without a trailing slash redirect permanently to the slashed path", async ({
  request,
}) => {
  const response = await request.get("/about", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(new URL(response.headers()["location"], "http://127.0.0.1").pathname).toBe("/about/");
});
