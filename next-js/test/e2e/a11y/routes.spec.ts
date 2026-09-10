import { expect, test, type APIRequestContext } from "@playwright/test";
import { formatViolations, scan } from "./scan";

/* The route × language × mode × state matrix (openspec next-accessibility
 * § axe-core gate). Routes come from the mock manifest, so a new route kind is
 * scanned automatically. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const MODES = {
  default: {},
  "high-contrast": { highContrast: true },
  "xl-text": { textSize: "xl" },
  "reduce-motion": { reduceMotion: true },
} as const;

async function routes(request: APIRequestContext) {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/routes`);
  return (
    (await res.json()) as { routes: { path: string; kind: string; lang: string }[] }
  ).routes.filter((r) => r.kind !== "styleguide");
}

for (const [mode, settings] of Object.entries(MODES)) {
  test(`every route has no axe-core violations (${mode})`, async ({ page, request }, testInfo) => {
    test.setTimeout(240_000);
    await page.addInitScript(
      (value) => localStorage.setItem("chapter-a11y", value),
      JSON.stringify(settings),
    );
    const failures: string[] = [];
    for (const route of await routes(request)) {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      const { errors } = await scan(
        page,
        testInfo,
        `${route.kind}-${route.lang}-${mode}${route.path.replace(/\W+/g, "_")}`,
      );
      if (errors.length) failures.push(`${route.path} (${mode})\n${formatViolations(errors)}`);
    }
    expect(failures, failures.join("\n\n")).toEqual([]);
  });
}

/** Park the pointer and let hover/color transitions finish so axe samples final colors. */
async function settle(page: import("@playwright/test").Page) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
}

test("chrome interactive states: mobile nav open, a11y popover open", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await settle(page);
  let out = await scan(page, testInfo, "state-mobile-nav-open");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Accessibility options" }).last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await settle(page);
  out = await scan(page, testInfo, "state-a11y-popover-open");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);
});

test("calendar interactive states: list view (past shown), event dialog open, compact day agenda", async ({
  page,
}, testInfo) => {
  await page.goto("/calendar/?month=2026-07&view=list");
  await expect(page.getByTestId("event-list-summary")).toHaveText("1 event in July"); // out-of-window fetch done
  await page.getByRole("button", { name: "Show 1 past" }).click();
  await expect(page.getByRole("link", { name: /View event: / })).toBeVisible();
  await settle(page);
  let out = await scan(page, testInfo, "state-calendar-list-past-shown");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);

  await page.goto("/calendar/?month=2026-07");
  await page.getByRole("button", { name: /Contract Test Event —/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await settle(page);
  out = await scan(page, testInfo, "state-calendar-dialog-open");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);

  // 390px (openspec calendar-mobile-day-agenda): day agenda with cards, an empty day with the
  // jump pill, and the grouped list with past-day cards shown.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/calendar/?month=2026-07");
  const agenda = page.getByRole("region", { name: "Events on selected day" });
  await expect(agenda.getByRole("link", { name: /View event: / })).toBeVisible();
  await settle(page);
  out = await scan(page, testInfo, "state-calendar-day-agenda-390");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);

  await page
    .locator("[role='grid']:visible")
    .getByRole("button", { name: "Monday, July 6, no events" })
    .click();
  await expect(page.getByRole("button", { name: /Jump to next event/ })).toBeVisible();
  await settle(page);
  out = await scan(page, testInfo, "state-calendar-day-empty-390");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);

  await page.goto("/calendar/?month=2026-07&view=list");
  await page.getByRole("button", { name: "Show 1 past" }).click();
  await expect(page.getByRole("link", { name: /View event: / })).toBeVisible();
  await settle(page);
  out = await scan(page, testInfo, "state-calendar-list-past-390");
  expect(out.errors, formatViolations(out.errors)).toEqual([]);
});

test("404 page has no axe-core violations in both languages", async ({ page }, testInfo) => {
  for (const path of ["/does-not-exist/", "/es/no-existe/"]) {
    await page.goto(path);
    await settle(page);
    const out = await scan(page, testInfo, `state-not-found${path.replace(/\W+/g, "_")}`);
    expect(out.errors, formatViolations(out.errors)).toEqual([]);
  }
});
