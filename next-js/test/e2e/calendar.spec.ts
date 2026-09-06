import { expect, test } from "@playwright/test";
import { monthKey, monthOf } from "../../lib/calendar";
import { toISODate } from "../../lib/events";

/* Calendar in the production build (openspec next-headless-site § Interactive
 * archive and calendar; next-accessibility § Keyboard, § Dialogs). The REST
 * window is today −1 → +12 months, so the current month is server-rendered from
 * props, while the mock corpus' one event (2026-07-04) sits in the past: that
 * month exercises the out-of-window path (live status, then same-origin fetch). */
const CURRENT = monthKey(monthOf(toISODate(new Date())));

test("current month grid, list view and empty state are server-rendered", async ({ request }) => {
  const html = await (await request.get(`/calendar/?month=${CURRENT}`)).text();
  expect(html).toContain('data-route-kind="calendar"');
  expect(html).toContain(`data-month="${CURRENT}"`);
  expect(html).toContain('role="grid"');
  expect(html).toContain('aria-live="polite"');
  expect(html).toContain('id="subscribe"');

  const list = await (await request.get(`/calendar/?month=${CURRENT}&view=list`)).text();
  expect(list).toContain('data-calendar-view="list"');
  expect(list).toMatch(/data-calendar-empty=""|View event: /);

  // Out of the REST window → the server streams the live loading status, the island fetches.
  const past = await (await request.get("/calendar/?month=2026-07")).text();
  expect(past).toContain('role="status"');
  expect(past).toContain("Loading events…");
});

test("month paging, toggle and dialog: URL state, aria-pressed, focus trap and restore", async ({
  page,
}) => {
  await page.goto("/calendar/?month=2026-07");
  await expect(page.getByRole("heading", { level: 2, name: "July 2026" })).toBeVisible();

  const chip = page.getByRole("button", { name: /Contract Test Event —/ });
  await chip.click();
  const dialog = page.getByRole("dialog", { name: /Contract Test Event/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "View event" })).toHaveAttribute(
    "href",
    /\/events\//,
  );
  await page.keyboard.press("Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1); // focus stays inside
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(chip).toBeFocused();

  await page.getByRole("button", { name: "List" }).click();
  await expect(page).toHaveURL(/\?view=list&month=2026-07$/);
  await expect(page.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "View event: Contract Test Event" })).toBeVisible();

  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "August 2026" })).toBeVisible();
  await expect(page).toHaveURL(/month=2026-08/);
  await expect(page.locator("[data-calendar-empty]")).toBeVisible();

  // Reload lands on the same state (URL is the state)
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: "August 2026" })).toBeVisible();
  await expect(page.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
});

test("keyboard: arrow keys move the single tab stop, Enter opens the day's event", async ({
  page,
}) => {
  await page.goto("/calendar/?month=2026-07");
  const grid = page.locator("[role='grid']:visible");
  await expect(grid).toHaveCount(1);
  await grid.getByRole("gridcell", { name: "Wednesday, July 1", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(grid.getByRole("gridcell", { name: /July 4, 1 event/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: /Contract Test Event/ })).toBeVisible();
});

test("out-of-window month loads once through the same-origin events API", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.pathname.startsWith("/api/events")) calls.push(`${url.pathname}${url.search}`);
  });
  await page.goto("/calendar/?month=2031-01");
  await expect(page.getByRole("heading", { level: 2, name: "January 2031" })).toBeVisible();
  await expect(page.locator("[role='grid']:visible")).toHaveCount(1);
  expect(calls).toEqual(["/api/events/?lang=en&from=2031-01-01&to=2031-01-31"]);
});
