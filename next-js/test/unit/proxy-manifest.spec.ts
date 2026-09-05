import { describe, expect, it, vi } from "vitest";
import { createProxyManifest } from "@/lib/proxy-manifest";
import { createMock } from "../mock/api.mjs";

/* openspec next-headless-site § Content freshness — unknown path is cheap; the
 * proxy's manifest cache refreshes on a TTL and at most once per window on a miss. */
const mock = createMock({ origin: "https://wp.example" });

function harness({ fail = false } = {}) {
  let t = 1_000_000;
  const fetchImpl = vi.fn(async () =>
    fail ? new Response("down", { status: 503 }) : Response.json(mock.routesManifest()),
  );
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
    expect(fetchImpl).toHaveBeenCalledTimes(1);
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
