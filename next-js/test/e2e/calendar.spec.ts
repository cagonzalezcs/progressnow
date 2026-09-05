import { expect, test, type Page } from "@playwright/test";

/* Calendar interactions in the production build (openspec
 * fix-calendar-page-layout spec calendar-route). The mock's only event is the
 * contract fixture dated 2026-07-04; `/events` honors `from`/`to`, so months
 * outside the server window come back empty except July 2026. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const label = (page: Page) => page.locator("[data-month-label]");

function monthsBetween(from: Date, year: number, month: number) {
  return year * 12 + month - (from.getFullYear() * 12 + from.getMonth());
}

async function stepTo(page: Page, year: number, month: number) {
  const diff = monthsBetween(new Date(), year, month);
  const name = diff < 0 ? "Previous month" : "Next month";
  for (let i = 0; i < Math.abs(diff); i++) await page.getByRole("button", { name }).click();
}

test("first paint is complete HTML: header, grid, subscribe strip", async ({ request }) => {
  const html = await (await request.get("/calendar/")).text();
  expect(html).toContain('data-route-kind="calendar"');
  expect(html).toMatch(/<h1[^>]*>Event Calendar<\/h1>/);
  expect(html).toContain('aria-label="Previous month"');
  expect(html).toContain('id="subscribe"');
  expect(html).toContain("/feed/chapter-events/");
  expect(html).toMatch(/data-date="\d{4}-\d{2}-\d{2}"/); // the grid itself is in the stream
  const es = await (await request.get("/es/calendario/")).text();
  expect(es).toContain('data-route-kind="calendar"');
});

test("?view=list is reload-stable and aria-pressed; month nav announces via aria-live", async ({
  page,
}) => {
  await page.goto("/calendar/");
  await page.getByRole("button", { name: "List", exact: true }).click();
  await expect(page).toHaveURL(/\/calendar\/\?view=list$/);
  await page.reload();
  await expect(page.getByRole("button", { name: "List", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("[data-empty='month'], .event-card").first()).toBeVisible();

  const before = await label(page).textContent();
  await expect(label(page)).toHaveAttribute("aria-live", "polite");
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(label(page)).not.toHaveText(before!);

  await page.getByRole("button", { name: "Month", exact: true }).click();
  await expect(page).toHaveURL(/\/calendar\/$/);
});

test("in-window months make no /api/events request; out-of-window months fetch same-origin with from/to", async ({
  page,
  request,
}) => {
  await request.post(`${MOCK}/__mock/reset`);
  const calls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/events")) calls.push(r.url());
  });
  await page.goto("/calendar/");
  await page.getByRole("button", { name: "Next month" }).click();
  await page.getByRole("button", { name: "Previous month" }).click();
  await page.getByRole("button", { name: "Previous month" }).click();
  await page.waitForTimeout(300);
  expect(calls).toEqual([]);

  await page.goto("/calendar/");
  await stepTo(page, 2026, 6); // July 2026: outside the window from the build date onward
  await expect(label(page)).toHaveText("July 2026");
  await expect(page.getByRole("button", { name: "Contract Test Event" })).toBeVisible();
  expect(calls.length).toBeGreaterThanOrEqual(1);
  const july = calls.find((u) => u.includes("from=2026-07-01") && u.includes("to=2026-07-31"));
  expect(july, calls.join("\n")).toBeTruthy();
  expect(new URL(july!).origin).toBe(new URL(page.url()).origin);
});

test("chip opens the dialog; Escape restores focus to the chip", async ({ page }) => {
  await page.goto("/calendar/");
  await stepTo(page, 2026, 6);
  const chip = page.getByRole("button", { name: "Contract Test Event" });
  await chip.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "View event" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(chip).toBeFocused();
});
