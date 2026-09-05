import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

/* /styleguide/ (openspec next-headless-site § Styleguide route; next-design-
 * system § Visual parity surface): every TOC anchor resolves to a section,
 * the page is noindex, and a screenshot per section lands in
 * test-results/styleguide/ as a review artifact. */
test("styleguide sections resolve from the table of contents and the page is noindex", async ({
  page,
}) => {
  await page.goto("/styleguide/");
  await expect(page.locator("[data-route-kind]:visible")).toHaveAttribute(
    "data-route-kind",
    "styleguide",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const anchors = await page
    .locator('nav[aria-label="Styleguide contents"] a')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
  expect(anchors.length).toBeGreaterThan(60);
  for (const href of anchors) {
    await expect(page.locator(href), href).toHaveCount(1);
  }
  await expect(page.locator("h1:visible")).toHaveCount(1);
});

test("styleguide screenshots per section", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/styleguide/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-route-kind]:visible")).toHaveAttribute(
    "data-route-kind",
    "styleguide",
  );
  const dir = resolve(__dirname, "../../test-results/styleguide");
  mkdirSync(dir, { recursive: true });
  const sections = page.locator("[data-styleguide-section]");
  const count = await sections.count();
  expect(count).toBeGreaterThan(60);
  for (let i = 0; i < count; i++) {
    const section = sections.nth(i);
    const id = await section.getAttribute("data-styleguide-section");
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: resolve(dir, `${id}.png`), animations: "disabled" });
  }
});
