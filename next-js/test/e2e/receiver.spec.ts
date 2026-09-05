import { expect, test } from "@playwright/test";
import { signatureHeader, verify } from "../../lib/signing";

/* Receiver round-trip (openspec next-revalidation-receiver; next-test-harness
 * § Functional end-to-end tests): a content change in "WordPress" (the mock),
 * a correctly signed webhook, and the very next request renders the change.
 * WP_BUILD_STATUS_URL points at the mock, which records the signed callback. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const SECRET = "playwright-test-secret";
const SLUG = "contract-test-post";

function signed(body: string, timestamp = String(Math.floor(Date.now() / 1000))) {
  // Buffer: Playwright sends it byte-for-byte (a string with a JSON content-type is re-serialized).
  return {
    data: Buffer.from(body, "utf8"),
    headers: {
      "content-type": "application/json",
      "x-chapter-timestamp": timestamp,
      "x-chapter-signature": signatureHeader(body, timestamp, SECRET),
    },
  };
}

test.describe.serial("POST /api/rebuild", () => {
  test.afterAll(async ({ request }) => {
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
  });

  test("a signed rebuild webhook revalidates content and reports back", async ({
    page,
    request,
  }) => {
    await request.post(`${MOCK}/__mock/reset`, { data: {} });
    await page.goto(`/blog/${SLUG}/`);
    const before = await page.locator("h1").textContent();

    const title = `Renamed by the webhook ${Date.now()}`;
    await request.post(`${MOCK}/__mock/posts/${SLUG}`, { data: { title } });
    // Still cached: WordPress changed, the app has not been told.
    await page.goto(`/blog/${SLUG}/`);
    await expect(page.locator("h1")).toHaveText(before ?? "");

    const body = JSON.stringify({
      event: "rebuild",
      requestId: "e2e-1",
      contentVersion: 9,
      reason: "post_updated",
      siteUrl: MOCK,
      requestedAt: new Date().toISOString(),
    });
    const res = await request.post("/api/rebuild", signed(body));
    expect(res.status()).toBe(202);
    const json = await res.json();
    expect(json).toMatchObject({ status: "started" });
    expect(json.buildId).toMatch(/^[0-9a-f-]{36}$/);

    await page.goto(`/blog/${SLUG}/`);
    await expect(page.locator("h1")).toHaveText(title);

    await expect
      .poll(
        async () =>
          ((await (await request.get(`${MOCK}/__mock/build-status`)).json()) as unknown[]).length,
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0);
    const [callback] = (await (await request.get(`${MOCK}/__mock/build-status`)).json()) as {
      body: { buildId: string; status: string; contentVersion: number };
      timestamp: string;
      signature: string;
    }[];
    expect(callback!.body).toEqual({
      buildId: json.buildId,
      status: "succeeded",
      contentVersion: 9,
    });
    expect(
      verify({
        body: JSON.stringify(callback!.body),
        timestamp: callback!.timestamp,
        signature: callback!.signature,
        secret: SECRET,
        now: Number(callback!.timestamp),
      }),
    ).toEqual({ ok: true });
  });

  test("a stale or wrong signature is rejected and changes nothing", async ({ page, request }) => {
    const current = await (await page.goto(`/blog/${SLUG}/`))?.text();
    await request.post(`${MOCK}/__mock/posts/${SLUG}`, { data: { title: "Should not appear" } });

    const body = JSON.stringify({ event: "rebuild", requestId: "e2e-2", contentVersion: 10 });
    const stale = await request.post(
      "/api/rebuild",
      signed(body, String(Math.floor(Date.now() / 1000) - 600)),
    );
    expect(stale.status()).toBe(401);
    const wrong = await request.post("/api/rebuild", {
      data: Buffer.from(body, "utf8"),
      headers: {
        "content-type": "application/json",
        "x-chapter-timestamp": String(Math.floor(Date.now() / 1000)),
        "x-chapter-signature": "sha256=" + "0".repeat(64),
      },
    });
    expect(wrong.status()).toBe(401);
    const unsigned = await request.post("/api/rebuild", { data: body });
    expect(unsigned.status()).toBe(401);

    await page.goto(`/blog/${SLUG}/`);
    await expect(page.locator("h1")).not.toHaveText("Should not appear");
    expect(current).toBeTruthy();
  });

  test("malformed payloads are 400/413, never 5xx", async ({ request }) => {
    expect((await request.post("/api/rebuild", signed("{not json"))).status()).toBe(400);
    expect(
      (await request.post("/api/rebuild", signed(JSON.stringify({ event: "deploy" })))).status(),
    ).toBe(400);
    expect(
      (
        await request.post(
          "/api/rebuild",
          signed(JSON.stringify({ event: "rebuild", reason: "x".repeat(20_000) })),
        )
      ).status(),
    ).toBe(413);
  });
});
