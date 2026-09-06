import { expect, test } from "@playwright/test";

/* The data-testid automation surface. Locators here use getByTestId only — no
 * CSS, no text — so this spec fails the moment a hook is renamed or dropped.
 * Repeated items keep a stable testid and carry their identity in a separate
 * data-* attribute (data-nav-label, data-category, data-view, …), so a row is
 * addressed by filtering, never by baking data into the testid. */

test("chrome exposes stable, strict-mode-safe hooks on every route", async ({ page }) => {
  for (const path of ["/", "/calendar/", "/blog/", "/about/", "/get-involved/"]) {
    await page.goto(path);
    // Each of these must resolve to exactly one node, or the assertion throws.
    await expect(page.getByTestId("site-shell")).toHaveCount(1);
    await expect(page.getByTestId("site-header")).toHaveCount(1);
    await expect(page.getByTestId("site-main")).toHaveCount(1);
    await expect(page.getByTestId("site-footer")).toHaveCount(1);
    await expect(page.getByTestId("skip-link")).toHaveCount(1);
  }
});

test("the header's three responsive tiers are separately addressable", async ({ page }) => {
  await page.goto("/");
  for (const tier of ["mobile", "tablet", "desktop"]) {
    await expect(page.getByTestId(`site-header-${tier}`)).toHaveCount(1);
  }
  // The nav toggle lives only in the mobile tier, so it is unique document-wide.
  const toggle = page.getByTestId("site-header-menu-toggle");
  await expect(toggle).toHaveCount(1);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(page.getByTestId("site-header-mobile-panel")).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  // Repeated nav links: stable testid + data-nav-label identity.
  await page.locator('[data-testid="site-header-mobile-nav-link"][data-nav-label="Blog"]').click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test("calendar: month nav, view switch and category filters drive off testids", async ({
  page,
}) => {
  await page.goto("/calendar/");
  await expect(page.getByTestId("event-calendar")).toHaveCount(1);
  // A month grid is 5 or 6 whole weeks depending on how the month falls.
  const days = await page.getByTestId("month-grid-day").count();
  expect([35, 42]).toContain(days);

  const label = page.getByTestId("event-calendar-month-label");
  const before = await label.textContent();
  await page.getByTestId("event-calendar-next-month").click();
  await expect(label).not.toHaveText(before!);
  await page.getByTestId("event-calendar-prev-month").click();
  await expect(label).toHaveText(before!);

  // View switch: identity in data-view, not in the testid.
  await page.locator('[data-testid="event-calendar-view-option"][data-view="list"]').click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.getByTestId("event-list-view")).toBeVisible();
  await page.locator('[data-testid="event-calendar-view-option"][data-view="month"]').click();
  await expect(page.getByTestId("month-grid")).toBeVisible();

  // Category filter: identity in data-category.
  await page.locator('[data-testid="event-calendar-filter-option"][data-category="labor"]').click();
  await expect(page).toHaveURL(/category=labor/);
});

test("blog archive search and results are addressable", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.getByTestId("archive-frame")).toHaveCount(1);
  await expect(page.getByTestId("featured-post-card")).toHaveCount(1);
  await page.getByTestId("archive-search-input").fill("contract");
  await expect(page).toHaveURL(/s=contract/);
  await expect(page.getByTestId("archive-results-status")).toBeVisible();
});

test("a11y widget controls are addressable and reflect state", async ({ page }) => {
  await page.goto("/");
  // Two triggers (tablet + desktop) disambiguated by data-widget-size.
  const trigger = page.locator('[data-testid="a11y-widget-trigger"][data-widget-size="desktop"]');
  await expect(trigger).toHaveCount(1);
  await trigger.click();
  await expect(page.getByTestId("a11y-widget-panel")).toBeVisible();
  await page
    .locator('[data-testid="a11y-widget-text-size-option"][data-text-size-value="xl"]')
    .click();
  await expect(
    page.locator('[data-testid="a11y-widget-text-size-option"][data-text-size-value="xl"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("a11y-widget-high-contrast")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("styleguide sections and kitchen-sink examples are addressable", async ({ page }) => {
  await page.goto("/styleguide/");
  await expect(page.getByTestId("styleguide-toc")).toHaveCount(1);
  await expect(page.getByTestId("kitchen-sink")).toHaveCount(1);
  // Every registry example keeps its own root hook.
  for (const id of ["button-example", "card-example", "tabs-example", "sidebar-example"]) {
    await expect(page.getByTestId(id)).toHaveCount(1);
  }
  // Section identity lives in data-styleguide-section.
  await expect(
    page.locator('[data-testid="styleguide-section"][data-styleguide-section="button"]'),
  ).toHaveCount(1);
});
