import { expect, test, type APIRequestContext } from "@playwright/test";

/* 404 twin of views/404.twig (openspec interior-presentation § 404 page;
 * next-headless-site § Error and empty surfaces): real status from the proxy,
 * copy from the language's `nf_*` strings, pills to that language's home and
 * calendar, noindex. */
const MOCK = process.env.MOCK_ORIGIN ?? `http://127.0.0.1:${process.env.MOCK_PORT ?? 8787}`;

async function strings(request: APIRequestContext, lang: string) {
  const res = await request.get(`${MOCK}/wp-json/progressnow/v1/site?lang=${lang}`);
  return ((await res.json()) as { strings: Record<string, string> }).strings;
}

for (const [lang, path, home, calendar] of [
  ["en", "/does-not-exist/", "/", "/calendar/"],
  ["es", "/es/no-existe/", "/es/", "/es/calendario/"],
] as const) {
  test(`unknown ${lang} path → 404 status, ${lang} copy, pills to ${lang} home and calendar`, async ({
    page,
    request,
  }) => {
    const s = await strings(request, lang);
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    expect(response?.headers()["x-robots-tag"]).toBe("noindex");
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("[data-route-kind='not_found']:visible")).toHaveCount(1);
    await expect(page.locator("h1:visible")).toHaveText(s.nf_title!);
    await expect(page.getByText(s.nf_lede!)).toBeVisible();
    await expect(page.getByRole("link", { name: s.nf_home! })).toHaveAttribute("href", home);
    await expect(page.getByRole("link", { name: s.nf_calendar! })).toHaveAttribute(
      "href",
      calendar,
    );
    expect(await page.locator("meta[name='robots']").getAttribute("content")).toBe(
      "noindex,follow",
    );
    // The chrome stays: header nav + footer are present around the band
    await expect(page.getByRole("navigation", { name: "Main" }).first()).toBeAttached();
    await expect(page.locator("footer.site-footer")).toBeAttached();
  });
}
