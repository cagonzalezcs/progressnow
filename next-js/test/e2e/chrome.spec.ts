import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { signatureHeader } from "../../lib/signing";

const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const REBUILD_SECRET = process.env.CHAPTER_REBUILD_SECRET ?? "playwright-test-secret";

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
type FooterSample = {
  t: number;
  top: number;
  bottom: number;
  visibility: string;
  mainHeight: number;
  standIn: boolean;
  path: string;
};

/* Frames where the footer sat entirely above the fold — the position it would jump
 * from. The anchor does not stop the footer moving; it stops it being *seen* moving,
 * by keeping it at or below the viewport's bottom edge while <main> is short. (Valid
 * only at scroll top, which is where a route change leaves the visitor.) */
function footerAboveTheFold(samples: FooterSample[], path: string, viewportHeight: number) {
  return samples
    .filter((s) => s.path === path && s.bottom < viewportHeight)
    .map((s) => `t=${s.t}ms bottom=${s.bottom} (viewport ${viewportHeight})`);
}

/* Every animation frame of the navigation: where the footer is, whether it is
 * painted, how tall <main> is, and whether a stand-in still occupies it.
 * `standIn` (any aria-busy region) is the witness that a loading window opened. */
async function sampleFooterThrough(page: Page, navigate: () => Promise<unknown>, ms = 2500) {
  await page.evaluate((limit) => {
    (window as unknown as { __footer: unknown[] }).__footer = [];
    const t0 = performance.now();
    const tick = () => {
      const f = document.querySelector(".site-footer");
      if (f) {
        const box = f.getBoundingClientRect();
        (window as unknown as { __footer: unknown[] }).__footer.push({
          t: Math.round(performance.now() - t0),
          top: Math.round(box.top),
          bottom: Math.round(box.bottom),
          visibility: getComputedStyle(f).visibility,
          mainHeight: Math.round(
            document.getElementById("main")?.getBoundingClientRect().height ?? 0,
          ),
          standIn: Boolean(document.querySelector("main#main [aria-busy='true']")),
          path: location.pathname,
        });
      }
      if (performance.now() - t0 < limit) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, ms);
  await navigate();
  await page.waitForTimeout(ms + 300);
  return page.evaluate(() => (window as unknown as { __footer: FooterSample[] }).__footer);
}

/* A signed rebuild evicts the `content`, `routes` and `site` tags — the only supported
 * way to make a route cold again inside a running server, and a cold route is what a
 * loading window needs. receiver.spec.ts owns the receiver's own contract; it selects
 * its callback by buildId so this second source does not disturb it. */
async function evictContentCache(request: APIRequestContext) {
  const body = JSON.stringify({
    event: "rebuild",
    requestId: "e2e-sticky-footer",
    contentVersion: 0,
    reason: "test_cache_evict",
    siteUrl: MOCK,
    requestedAt: new Date().toISOString(),
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const res = await request.post("/api/rebuild", {
    data: Buffer.from(body, "utf8"),
    headers: {
      "content-type": "application/json",
      "x-chapter-timestamp": timestamp,
      "x-chapter-signature": signatureHeader(body, timestamp, REBUILD_SECRET),
    },
  });
  expect(res.status(), "the rebuild receiver refused the eviction webhook").toBe(202);
}

test("an empty <main> still fills the viewport, so the footer starts where it stays", async ({
  page,
  request,
}) => {
  // The whole mechanism, through a real navigation. Opening a loading window needs a
  // cold server cache (a warm route's payload arrives whole, fallback and all) and a
  // slow envelope once it is cold. The delay is scoped to `posts` because the mock is
  // shared with specs that time the calendar.
  await page.setViewportSize({ width: 1440, height: 900 });
  const blog = () =>
    page.getByRole("navigation", { name: "Main" }).last().getByRole("link", { name: "Blog" });

  try {
    let samples: Awaited<ReturnType<typeof sampleFooterThrough>> = [];
    for (let attempt = 0; attempt < 3 && !samples.some((s) => s.standIn); attempt++) {
      await request.post(`${MOCK}/__mock/delay`, { data: { ms: 700, path: "posts" } });
      await page.goto("/");
      await evictContentCache(request);
      samples = await sampleFooterThrough(page, async () => {
        await blog().click();
        await expect(page).toHaveURL(/\/blog\/$/);
      });
    }
    // A window opened iff <main> was shorter at some point than the height it settles
    // at. A DOM fact, and mechanism-agnostic: the archive's skeleton carries no
    // aria-busy of its own, so `standIn` alone would miss this boundary.
    const onBlog = samples.filter((s) => s.path === "/blog/");
    const settledMain = Math.max(...onBlog.map((s) => s.mainHeight));
    expect(
      Math.min(...onBlog.map((s) => s.mainHeight)),
      "<main> never grew — the route stayed warm or the delay never took effect, so this test would pass vacuously",
    ).toBeLessThan(settledMain);

    // The visitor-facing invariant: the footer is never sitting up under the header,
    // which is the position it would visibly jump from.
    expect(footerAboveTheFold(samples, "/blog/", 900)).toEqual([]);

    // Anchored, not hidden. An earlier revision hid it while the route loaded, which
    // flashed the page dark → white → dark on every navigation.
    expect(samples.filter((s) => s.visibility !== "visible")).toEqual([]);
  } finally {
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
  }
});

test("a short route does not pull the footer up under the header", async ({ page }) => {
  // No loading window needed: a 404's content is simply shorter than the viewport.
  // Without the anchor the footer would sit just below the heading.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/no-such-page-here/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeVisible();
  const bottom = await page
    .locator(".site-footer")
    .evaluate((el) => el.getBoundingClientRect().bottom);
  expect(bottom).toBeGreaterThanOrEqual(900);
});

test("POST /__mock/delay holds envelopes and /__mock/reset releases them", async ({ request }) => {
  // The knob the navigation test depends on (openspec next-test-harness § Fixture-backed
  // mock API). Validation of the value itself is unit-tested.
  try {
    await request.post(`${MOCK}/__mock/delay`, { data: { ms: 600, path: "posts" } });

    const held = Date.now();
    await request.get(`${MOCK}/wp-json/progressnow/v1/posts?lang=en`);
    expect(Date.now() - held).toBeGreaterThanOrEqual(600);

    // Scoped: an envelope outside the prefix is untouched, so a delay set here cannot
    // slow the routes another spec is timing.
    const other = Date.now();
    await request.get(`${MOCK}/wp-json/progressnow/v1/site?lang=en`);
    expect(Date.now() - other).toBeLessThan(600);

    await request.post(`${MOCK}/__mock/reset`, { data: {} });
    const released = Date.now();
    await request.get(`${MOCK}/wp-json/progressnow/v1/posts?lang=en`);
    expect(Date.now() - released).toBeLessThan(600);
  } finally {
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
  }
});
