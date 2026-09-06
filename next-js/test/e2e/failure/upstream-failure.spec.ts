import { expect, test } from "@playwright/test";
import { signatureHeader } from "../../../lib/signing";

/* Upstream failure on a cold route (openspec next-headless-site § Error and
 * empty surfaces; next-deployment § Observability). Runs in its own Playwright
 * project AFTER e2e + a11y: it flips the mock into failure for every envelope,
 * which would break any test running alongside. Sequence: expire the cache
 * with a signed rebuild webhook, fail the upstream, request a page → the root
 * layout cannot read /site → 500 + the global error surface (no fake content);
 * recover the upstream → the very next request is 200 again. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const SECRET = "playwright-test-secret";

function signed(body: string) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  return {
    data: Buffer.from(body, "utf8"),
    headers: {
      "content-type": "application/json",
      "x-chapter-timestamp": timestamp,
      "x-chapter-signature": signatureHeader(body, timestamp, SECRET),
    },
  };
}

async function expireCache(request: import("@playwright/test").APIRequestContext) {
  const body = JSON.stringify({
    event: "rebuild",
    requestId: `failure-${Date.now()}`,
    contentVersion: 1,
    reason: "test",
    siteUrl: MOCK,
    requestedAt: new Date().toISOString(),
  });
  expect((await request.post("/api/rebuild", signed(body))).status()).toBe(202);
}

test.describe.serial("upstream failure", () => {
  test.afterAll(async ({ request }) => {
    await request.post(`${MOCK}/__mock/fail`, { data: { failing: false } });
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
  });

  test("cold route while WordPress is down → 500 error surface; recovers on the next request", async ({
    page,
    request,
  }) => {
    await expireCache(request);
    await request.post(`${MOCK}/__mock/fail`, { data: { failing: true } });

    // First failing request: the data layer records the failure; the layout's own fallback may
    // stream the surface with a 200 (the proxy's manifest was still fresh) — never a blank shell.
    const first = await request.get("/about/");
    expect([200, 500]).toContain(first.status());
    expect(await first.text()).toContain('data-route-kind="error"');

    // From here the proxy probes, confirms, and answers a real 500 with the same document.
    const response = await page.goto("/about/");
    expect(response?.status()).toBe(500);
    expect(response?.headers()["cache-control"]).toBe("no-store");
    expect(response?.headers()["x-robots-tag"]).toBe("noindex");
    await expect(page.locator("[data-route-kind='error']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Something went wrong");
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back home" })).toHaveAttribute("href", "/");
    expect(await page.locator("meta[name='robots']").getAttribute("content")).toBe(
      "noindex,follow",
    );
    // Never partial content from a stale/unknown state
    await expect(page.locator("[data-route-kind='about']")).toHaveCount(0);

    await request.post(`${MOCK}/__mock/fail`, { data: { failing: false } });
    // Recovery is immediate: the proxy's probe succeeds and the layout reads fresh envelopes.
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.locator("[data-route-kind='about']:visible")).toHaveCount(1);
    const ok = await request.get("/about/");
    expect(ok.status()).toBe(200);
  });

  test("the same-origin events API answers 503 (not a crash) while WordPress is down", async ({
    request,
  }) => {
    await expireCache(request);
    await request.post(`${MOCK}/__mock/fail`, { data: { failing: true } });
    const res = await request.get("/api/events/?lang=en&from=2031-01-01&to=2031-01-31");
    expect(res.status()).toBe(503);
    expect(await res.json()).toMatchObject({ error: "events temporarily unavailable" });
    await request.post(`${MOCK}/__mock/fail`, { data: { failing: false } });
  });
});
