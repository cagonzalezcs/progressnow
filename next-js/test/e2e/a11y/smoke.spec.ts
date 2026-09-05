import { expect, test } from "@playwright/test";
import { formatViolations, scan } from "./scan";

/* axe-core gate smoke: the harness runs axe against the built app and writes a
 * report. Grows into the route × language × mode × state matrix from task 4.6. */
test("front page has no axe-core violations", async ({ page }, testInfo) => {
  await page.goto("/");
  const { errors } = await scan(page, testInfo, "front-en-default");
  expect(errors, formatViolations(errors)).toEqual([]);
});
