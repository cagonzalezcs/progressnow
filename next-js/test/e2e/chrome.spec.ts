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

test("data-route-loading hides the footer: the rule ships in the production bundle", async ({
  page,
}) => {
  // Half of the pair. This one drives the attribute by hand, so it only proves
  // app/route-loading.css shipped and does what it claims; the navigation test
  // below is what proves components/nav/RoutePending.tsx is wired to raise it.
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

type FooterSample = {
  t: number;
  top: number;
  visibility: string;
  mainHeight: number;
  standIn: boolean;
  flagged: boolean;
  path: string;
};

/** Painted frames whose footer position is not the one the route settles on. */
function footerPaintedWhereItDoesNotStay(samples: FooterSample[], path: string) {
  const painted = samples.filter((s) => s.path === path && s.visibility === "visible");
  const settled = painted.at(-1)?.top;
  return painted
    .filter((s) => s.top !== settled)
    .map((s) => `t=${s.t}ms top=${s.top} (settles at ${settled})`);
}

/* Every animation frame of the navigation: where the footer is, whether it is
 * painted, whether the hold is flagged, and how tall <main> is. `standIn` (any
 * aria-busy region) is diagnostic only: RouteCalendar's fragment carries it while
 * deliberately not opting in, and the blog archive's skeleton is aria-hidden and
 * carries none — so it is neither a reliable witness nor a reason to require the
 * footer be hidden. */
async function sampleFooterThrough(page: Page, navigate: () => Promise<unknown>, ms = 2500) {
  await page.evaluate((limit) => {
    (window as unknown as { __footer: unknown[] }).__footer = [];
    const t0 = performance.now();
    const tick = () => {
      const f = document.querySelector(".site-footer");
      if (f) {
        (window as unknown as { __footer: unknown[] }).__footer.push({
          t: Math.round(performance.now() - t0),
          top: Math.round(f.getBoundingClientRect().top),
          visibility: getComputedStyle(f).visibility,
          mainHeight: Math.round(
            document.getElementById("main")?.getBoundingClientRect().height ?? 0,
          ),
          standIn: Boolean(document.querySelector("main#main [aria-busy='true']")),
          flagged: document.documentElement.hasAttribute("data-route-loading"),
          path: location.pathname,
        });
      }
      if (performance.now() - t0 < limit) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, ms);
  await navigate();
  await page.waitForTimeout(ms + 300);
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __footer: FooterSample[];
        }
      ).__footer,
  );
}

/* A signed rebuild evicts the `content`, `routes` and `site` tags — the only supported
 * way to make a route cold again inside a running server, and a cold route is what a
 * loading window needs. receiver.spec.ts owns the receiver's own contract; it selects
 * its callback by buildId so this second source does not disturb it. */
async function evictContentCache(request: APIRequestContext) {
  const body = JSON.stringify({
    event: "rebuild",
    requestId: "e2e-footer-hold",
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

test("the footer is never painted while a stand-in occupies <main>", async ({ page, request }) => {
  // The wiring, through a real navigation. Opening a loading window needs two things:
  // a cold server cache (a warm route's payload arrives whole, fallback and all —
  // delaying the RSC request does not split it) and a slow envelope once it is cold.
  // So: evict, hold the `posts` envelope, then navigate. The delay is scoped to that
  // one path because the mock is shared with specs that time the calendar.
  await page.setViewportSize({ width: 1440, height: 900 });
  const blog = () =>
    page.getByRole("navigation", { name: "Main" }).last().getByRole("link", { name: "Blog" });

  try {
    let samples: Awaited<ReturnType<typeof sampleFooterThrough>> = [];
    for (let attempt = 0; attempt < 3 && !samples.some((s) => s.flagged); attempt++) {
      await request.post(`${MOCK}/__mock/delay`, { data: { ms: 700, path: "posts" } });
      await page.goto("/");
      await evictContentCache(request);
      samples = await sampleFooterThrough(page, async () => {
        await blog().click();
        await expect(page).toHaveURL(/\/blog\/$/);
      });
    }
    expect(
      samples.some((s) => s.flagged),
      "no loading window opened — the route stayed warm or the delay never took effect, so this test would pass vacuously",
    ).toBe(true);

    // The visitor-facing invariant: no painted frame shows the footer at a position
    // it will not keep. Independent of how the hold is implemented — and it fails if
    // the flag is raised too late as surely as if it is never raised at all.
    expect(footerPaintedWhereItDoesNotStay(samples, "/blog/")).toEqual([]);

    // And <main> really was short while the flag was up — the footer had somewhere
    // to jump to, and did not.
    const held = samples.filter((s) => s.flagged);
    expect(Math.min(...held.map((s) => s.mainHeight))).toBeLessThan(
      Math.max(...samples.map((s) => s.mainHeight)),
    );
  } finally {
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
  }
});

test("an in-page URL update never hides the footer", async ({ page }) => {
  // React does not re-show a mounted boundary's fallback during a transition, so
  // typing a query must leave the flag — and the contentinfo landmark — alone.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/blog/");
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const search = page.getByRole("searchbox").first();
  const samples = await sampleFooterThrough(
    page,
    async () => {
      await search.click();
      await search.type("union", { delay: 60 });
      await expect(page).toHaveURL(/[?&]s=union/);
    },
    2000,
  );

  expect(samples.filter((s) => s.flagged)).toEqual([]);
  expect(samples.filter((s) => s.visibility !== "visible")).toEqual([]);
});

test("reduced motion holds the footer too, and reveals it without a fade", async ({
  page,
  request,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("chapter-a11y", JSON.stringify({ reduceMotion: true })),
  );
  await page.setViewportSize({ width: 1440, height: 900 });

  try {
    await request.post(`${MOCK}/__mock/delay`, { data: { ms: 700, path: "posts" } });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe("reduce");
    await evictContentCache(request);

    const samples = await sampleFooterThrough(page, async () => {
      await page
        .getByRole("navigation", { name: "Main" })
        .last()
        .getByRole("link", { name: "Blog" })
        .click();
      await expect(page).toHaveURL(/\/blog\/$/);
    });

    // Held as usual — visibility is not motion.
    expect(
      samples.some((s) => s.flagged),
      "no loading window opened, so the hold was never exercised",
    ).toBe(true);
    expect(footerPaintedWhereItDoesNotStay(samples, "/blog/")).toEqual([]);
    // Revealed with no fade: MOTION_KILL_CSS neutralizes the transition, so the footer
    // settles at full opacity rather than easing there.
    expect(await page.locator(".site-footer").evaluate((el) => getComputedStyle(el).opacity)).toBe(
      "1",
    );
  } finally {
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
  }
});

test("POST /__mock/delay holds envelopes and /__mock/reset releases them", async ({ request }) => {
  // The knob the footer-hold navigation test depends on (openspec next-test-harness
  // § Fixture-backed mock API). Validation of the value itself is unit-tested.
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
