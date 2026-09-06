import { expect, test } from "@playwright/test";

/* Site chrome in the production build (openspec next-accessibility § Landmarks
 * and skip link, § Focus and announcement, § Accessibility settings widget
 * parity; next-headless-site § Chrome and copy, § Client navigation). */
test("chrome renders per language from /site and the skip link lands on main", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("main#main")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(page.locator("a.skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();

  await page.goto("/es/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(
    page.getByRole("navigation", { name: "Main" }).last().getByRole("link", { name: "Calendario" }),
  ).toHaveAttribute("href", "/es/calendario/");
});

test("language toggle links to the current page's translation", async ({ page }) => {
  await page.goto("/about/");
  const toggle = page.getByRole("group", { name: "Language" }).last();
  await expect(toggle.getByRole("link", { name: "EN" })).toHaveAttribute("aria-current", "true");
  await expect(toggle.getByRole("link", { name: "ES" })).toHaveAttribute("href", "/es/acerca/");
});

test("mobile navigation: toggle, Escape returns focus, navigation closes it", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const panel = page.locator(`#${await toggle.getAttribute("aria-controls")}`);
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await panel.getByRole("link", { name: "Blog" }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("a11y settings apply before first paint and the legacy key migrates", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("rgv-dsa-a11y", JSON.stringify({ textSize: "xl", highContrast: true })),
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Already applied by the inline bootstrap, before React hydrates.
  expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe("20px");
  expect(
    await page.evaluate(() => document.documentElement.classList.contains("a11y-contrast")),
  ).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("rgv-dsa-a11y"))).toBeNull();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("chapter-a11y")!).textSize),
  ).toBe("xl");
  await page.waitForLoadState("networkidle");
  const widget = page.getByRole("button", { name: "Accessibility options" }).last();
  await widget.click();
  await expect(page.getByRole("button", { name: "A++" }).last()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("client navigation moves focus to main and cross-fades unless motion is reduced", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { __vt: number }).__vt = 0;
    const orig = document.startViewTransition?.bind(document);
    if (orig) {
      document.startViewTransition = ((cb: () => void) => {
        (window as unknown as { __vt: number }).__vt++;
        return orig(cb);
      }) as typeof document.startViewTransition;
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .last()
    .getByRole("link", { name: "Blog" })
    .click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator("main#main")).toBeFocused();
  const calls = await page.evaluate(() => (window as unknown as { __vt: number }).__vt);
  expect(calls).toBeGreaterThan(0);

  // Reduced motion: React's SSR runtime may still call startViewTransition during hydration,
  // so the guarantee is that no view-transition animation can run (pseudo-elements neutralized).
  await page.addInitScript(() =>
    localStorage.setItem("chapter-a11y", JSON.stringify({ reduceMotion: true })),
  );
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe("reduce");
  expect(
    await page.evaluate(() => document.getElementById("progressnow-a11y-css")?.textContent ?? ""),
  ).toContain("::view-transition-old(*)");
  await page
    .getByRole("navigation", { name: "Main" })
    .last()
    .getByRole("link", { name: "Calendar" })
    .click();
  await expect(page).toHaveURL(/\/calendar\/$/);
  await expect(page.locator("main#main")).toBeFocused();
});

test("the footer is held back while a route's content is loading", async ({ page }) => {
  // components/nav/RoutePending.tsx raises this flag for as long as a Suspense
  // fallback stands in for route content, so the footer never paints under an
  // empty <main> and then jumps down when the content lands. Driving the
  // attribute directly keeps the assertion on what ships: the rule in
  // app/route-loading.css, in the production bundle.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeVisible();

  await page.evaluate(() => document.documentElement.setAttribute("data-route-loading", ""));
  // `visibility: hidden`: unpainted, and with it out of the accessibility tree and
  // the tab order — so the role locator stops matching it altogether.
  expect(await page.locator(".site-footer").evaluate((el) => getComputedStyle(el).visibility)).toBe(
    "hidden",
  );
  await expect(footer).toHaveCount(0);

  await page.evaluate(() => document.documentElement.removeAttribute("data-route-loading"));
  await expect(footer).toBeVisible();
});
