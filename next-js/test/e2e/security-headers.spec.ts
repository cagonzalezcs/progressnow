import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/* Security headers + nonce CSP (openspec next-deployment § Security headers
 * and CSP; task 8.1): every HTML response carries the policy with a fresh
 * nonce, the pages run without a single CSP violation, and an inline script
 * without the nonce is blocked. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;
const NONCE_RE = /'nonce-([A-Za-z0-9+/]+={0,2})'/;

/** Lowercase header map, since Playwright normalizes names but not always. */
function lower(h: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));
}

function expectSecurityHeaders(headers: Record<string, string>, label: string): string {
  const h = lower(headers);
  expect(h["x-powered-by"], `${label}: x-powered-by`).toBeUndefined();
  expect(h["strict-transport-security"], label).toBe("max-age=63072000; includeSubDomains");
  expect(h["x-content-type-options"], label).toBe("nosniff");
  expect(h["referrer-policy"], label).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"], label).toContain("camera=()");
  const csp = h["content-security-policy"];
  expect(csp, `${label}: content-security-policy`).toBeDefined();
  expect(csp, label).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(csp, label).not.toContain("unsafe-inline' 'strict");
  expect(csp, label).toContain("frame-ancestors 'none'");
  expect(csp, label).toContain("object-src 'none'");
  expect(csp, label).toContain("base-uri 'self'");
  expect(csp, label).toContain("font-src 'self'");
  expect(csp, label).toMatch(/img-src 'self' data: blob: /);
  return NONCE_RE.exec(csp!)![1]!;
}

async function manifestPaths(request: APIRequestContext): Promise<string[]> {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/routes`);
  const { routes } = (await res.json()) as { routes: { path: string }[] };
  return routes.map((r) => r.path);
}

/** Collects CSP violations two ways: the console line Chromium prints, and the DOM event. */
async function armViolationCapture(page: Page): Promise<() => Promise<string[]>> {
  const console_: string[] = [];
  page.on("console", (msg) => {
    if (/content security policy|refused to (execute|load|apply|connect|frame)/i.test(msg.text()))
      console_.push(msg.text());
  });
  await page.addInitScript(() => {
    const w = window as unknown as { __cspViolations: string[] };
    w.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      w.__cspViolations.push(
        `${e.violatedDirective} ${e.blockedURI} ${e.sourceFile}:${e.lineNumber}`,
      );
    });
  });
  return async () => [
    ...console_,
    ...(await page.evaluate(
      () => (window as unknown as { __cspViolations: string[] }).__cspViolations,
    )),
  ];
}

test("every route kind (both languages), the search state, the styleguide and the 404 carry the headers with a fresh nonce and run violation-free", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const paths = [
    ...(await manifestPaths(request)),
    "/?s=contract",
    "/blog/page/2/",
    "/category/labor/",
    "/styleguide/",
    "/does-not-exist/",
    "/es/no-existe/",
  ];
  const violations = await armViolationCapture(page);
  const nonces = new Set<string>();
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response, path).not.toBeNull();
    const nonce = expectSecurityHeaders(response!.headers(), path);
    expect(nonces.has(nonce), `${path}: nonce reused`).toBe(false);
    nonces.add(nonce);
    // The document's own scripts — a11y bootstrap, Next's runtime, RSC payload — are all nonce'd.
    const inline = await page
      .locator("script:not([src]):not([type='application/ld+json']):not([type='application/json'])")
      .evaluateAll((els) => els.map((el) => el.getAttribute("nonce")));
    expect(inline.length, `${path}: inline scripts`).toBeGreaterThan(0);
    // Browsers hide `nonce` from getAttribute once applied; the property still reads it.
    const applied = await page
      .locator("script:not([src]):not([type='application/ld+json']):not([type='application/json'])")
      .evaluateAll((els) => els.map((el) => (el as HTMLScriptElement).nonce));
    expect(applied, `${path}: every inline script carries the response nonce`).toEqual(
      applied.map(() => nonce),
    );
    await page.waitForLoadState("networkidle");
    expect(await violations(), `${path}: CSP violations`).toEqual([]);
  }
});

test("interactive surfaces stay violation-free: mobile nav, a11y widget, archive search, calendar month change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const violations = await armViolationCapture(page);
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  // The widget trigger lives in the (now closed) mobile panel; use the desktop one.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForLoadState("networkidle");
  const widget = page.getByRole("button", { name: "Accessibility options" }).last();
  await widget.click();
  await expect(page.getByRole("button", { name: "A++" }).last()).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/blog/");
  await page.getByRole("searchbox", { name: /Search posts/ }).fill("contract");
  await page.waitForURL(/s=contract/);
  await page.goto("/calendar/");
  await page.getByRole("button", { name: "Next month" }).click();
  await page.waitForLoadState("networkidle");
  expect(await violations()).toEqual([]);
});

/* The threat the policy exists for: markup that reaches the browser with a
 * script the server never nonce'd (stored XSS through kses'd HTML, a compromised
 * upstream). The HTML is rewritten on its way in; the response headers — the
 * real ones, nonce included — are untouched. */
test("an inline script injected into the markup without the nonce is blocked", async ({ page }) => {
  await page.route("**/", async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      "<head>",
      `<head><script>window.__cspProbe = "ran"</script>`,
    );
    await route.fulfill({ response, body: html });
  });
  const violations = await armViolationCapture(page);
  const response = await page.goto("/");
  expectSecurityHeaders(response!.headers(), "/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => (window as unknown as { __cspProbe?: string }).__cspProbe)).toBe(
    undefined,
  );
  const blocked = (await violations()).filter((v) => /script-src/.test(v));
  expect(blocked.length).toBeGreaterThanOrEqual(1);
  // …while the page itself still hydrated: its own (nonce'd) scripts ran.
  await expect(page.locator("main#main")).toBeVisible();
});

test("non-HTML responses carry the static headers and no X-Powered-By", async ({ request }) => {
  for (const path of ["/api/health", "/robots.txt", "/sitemap.xml"]) {
    const res = await request.get(path);
    const h = lower(res.headers());
    expect(res.status(), path).toBe(200);
    expect(h["x-powered-by"], path).toBeUndefined();
    expect(h["x-content-type-options"], path).toBe("nosniff");
    expect(h["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"], path).toBe("max-age=63072000; includeSubDomains");
  }
});

test("the 301 language redirect is secured too", async ({ request }) => {
  const lang = await request.get("/es/", { maxRedirects: 0 });
  expect(lang.status()).toBe(301);
  expectSecurityHeaders(lang.headers(), "/es/");
});
