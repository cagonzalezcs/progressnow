import { describe, expect, it, vi } from "vitest";
import { createProxyManifest } from "@/lib/proxy-manifest";
import { createMock } from "../mock/api.mjs";

/* openspec next-headless-site § Content freshness — unknown path is cheap; the
 * proxy's manifest cache refreshes on a TTL and at most once per window on a miss. */
const mock = createMock({ origin: "https://wp.example" });

function harness({
  fail = false,
  siteFail = false,
  categories,
}: {
  fail?: boolean;
  siteFail?: boolean;
  categories?: { id: string; label: string; color: string | null }[];
} = {}) {
  let t = 1_000_000;
  const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/site")) {
      if (siteFail) return new Response("down", { status: 503 });
      const site = mock.dispatch("site", {}) as { categories?: unknown };
      return Response.json({ ...site, ...(categories === undefined ? {} : { categories }) });
    }
    return fail ? new Response("down", { status: 503 }) : Response.json(mock.routesManifest());
  });
  const pm = createProxyManifest({
    apiBase: "https://wp.example/wp-json/progressnow/v1",
    fetchImpl,
    now: () => t,
    ttlMs: 60_000,
    missRefreshMs: 10_000,
  });
  return { pm, fetchImpl, tick: (ms: number) => (t += ms) };
}

describe("createProxyManifest", () => {
  it("fetches once, then answers known paths (including derived states) from memory", async () => {
    const { pm, fetchImpl } = harness();
    expect(await pm.exists("/about/")).toBe("known");
    expect(await pm.exists("/es/acerca")).toBe("known");
    expect(await pm.exists("/blog/page/3/")).toBe("known");
    expect(await pm.exists("/category/labor/")).toBe("known");
    // One /routes fetch serves them all; the archive adds the one /site registry read.
    expect(fetchImpl.mock.calls.filter(([u]) => String(u).includes("/routes"))).toHaveLength(1);
  });

  /* Found against a real WordPress in openspec next-js-site-implementation task 8.5:
   * `/posts` validates `category` against the registry enum, so an archive for a slug
   * WordPress does not have must 404 here as it does there — and the status has to be
   * decided in the proxy, before the route streams. */
  it("404s a category archive whose slug is not in the registry", async () => {
    const { pm } = harness();
    expect(await pm.exists("/category/labor/")).toBe("known");
    expect(await pm.exists("/es/category/labor/")).toBe("known");
    expect(await pm.exists("/category/no-such-category/")).toBe("unknown");
  });

  it("follows the WordPress category override rather than the bundled registry", async () => {
    const { pm } = harness({ categories: [{ id: "housing", label: "Housing", color: null }] });
    expect(await pm.exists("/category/housing/")).toBe("known");
    expect(await pm.exists("/category/labor/")).toBe("unknown");
  });

  it("caches the registry: one /site fetch serves many archive checks", async () => {
    const { pm, fetchImpl, tick } = harness();
    for (let i = 0; i < 5; i++) await pm.exists("/category/labor/");
    expect(fetchImpl.mock.calls.filter(([u]) => String(u).includes("/site"))).toHaveLength(1);
    tick(60_001);
    await pm.exists("/category/labor/");
    expect(fetchImpl.mock.calls.filter(([u]) => String(u).includes("/site"))).toHaveLength(2);
  });

  it("fails open when the registry cannot be read — a transient /site error is not a 404", async () => {
    const { pm } = harness({ siteFail: true });
    expect(await pm.exists("/category/labor/")).toBe("known");
    expect(await pm.exists("/category/no-such-category/")).toBe("known");
  });

  it("refreshes at most once per window for unknown paths, then answers unknown from memory", async () => {
    const { pm, fetchImpl, tick } = harness();
    expect(await pm.exists("/nope/")).toBe("unknown");
    expect(fetchImpl).toHaveBeenCalledTimes(2); // initial + one miss refresh
    for (let i = 0; i < 50; i++) expect(await pm.exists(`/nope-${i}/`)).toBe("unknown");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    tick(10_001);
    expect(await pm.exists("/nope-again/")).toBe("unknown");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("refreshes after the TTL", async () => {
    const { pm, fetchImpl, tick } = harness();
    await pm.exists("/about/");
    tick(60_001);
    await pm.exists("/about/");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("reports unavailable when WordPress cannot be reached and no manifest is cached", async () => {
    const { pm } = harness({ fail: true });
    expect(await pm.exists("/about/")).toBe("unavailable");
  });

  it("redirect(): a bare language directory goes to its front page, nothing else moves", async () => {
    const { pm, fetchImpl } = harness();
    expect(await pm.redirect("/es/")).toBe("/es/inicio/");
    expect(await pm.redirect("/es")).toBe("/es/inicio/");
    expect(await pm.redirect("/")).toBeNull();
    expect(await pm.redirect("/es/inicio/")).toBeNull();
    expect(await pm.redirect("/about/")).toBeNull();
    expect(await pm.redirect("/nope/")).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(1); // answered from the cached manifest
  });

  it("redirect(): null while WordPress is unreachable with a cold cache", async () => {
    const { pm } = harness({ fail: true });
    expect(await pm.redirect("/es/")).toBeNull();
  });

  it("probe(): one fresh fetch tells whether WordPress answers right now", async () => {
    const { pm, fetchImpl } = harness();
    expect(await pm.exists("/about/")).toBe("known");
    expect(await pm.probe()).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    fetchImpl.mockResolvedValue(new Response("down", { status: 503 }));
    expect(await pm.probe()).toBe(false);
    expect(await pm.exists("/about/")).toBe("known"); // memory still serves routing
    expect(pm.state.lastRefreshOk).toBe(false);
    fetchImpl.mockResolvedValue(Response.json(mock.routesManifest()));
    expect(await pm.probe()).toBe(true);
  });
});
