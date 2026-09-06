import { describe, expect, it, vi } from "vitest";
import { ApiError, createApi } from "@/lib/api";
import { createLogger } from "@/lib/log";
import { createMock } from "../mock/api.mjs";

/* Server-side progressnow/v1 client (openspec next-headless-site § Single data
 * source with contract validation). The mock's dispatcher stands in for
 * WordPress behind a fake fetch, so every envelope is contract-valid. */
const BASE = "https://wp.example/wp-json/progressnow/v1";
const mock = createMock({ origin: "https://wp.example" });

function fakeFetch(overrides: Partial<Record<string, unknown>> = {}) {
  const calls: string[] = [];
  const fetchImpl = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    calls.push(url.pathname + url.search);
    const path = url.pathname.replace("/wp-json/progressnow/v1/", "");
    const body =
      path in overrides
        ? overrides[path]
        : mock.dispatch(path, Object.fromEntries(url.searchParams));
    if (body === null) {
      return new Response(
        JSON.stringify({
          code: "progressnow_not_found",
          message: "Not found",
          data: { status: 404 },
        }),
        { status: 404 },
      );
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  return { fetchImpl, calls };
}

describe("createApi", () => {
  it("fetches and validates every envelope, encoding language and paths", async () => {
    const { fetchImpl, calls } = fakeFetch();
    const api = createApi({ apiBase: BASE, fetchImpl, mode: "development" });
    expect((await api.site("es")).lang).toBe("es");
    expect((await api.routes()).routes.length).toBeGreaterThan(0);
    expect((await api.frontPage("en")).seo.canonical).toContain("wp.example");
    expect((await api.page("acerca", "es")).kind).toBe("about");
    expect(
      (await api.posts({ lang: "en", s: "contract", category: "all", page: 1 })).posts.length,
    ).toBe(1);
    expect((await api.post("contract-test-post", "en")).title).toBeTruthy();
    expect((await api.events({ lang: "en" })).events.length).toBe(1);
    expect((await api.event("contract-test-event", "es")).lang).toBe("es");
    expect((await api.categories()).categories.length).toBeGreaterThan(0);
    expect(calls).toContain("/wp-json/progressnow/v1/site?lang=es");
    expect(calls).toContain("/wp-json/progressnow/v1/posts?s=contract&lang=en");
    expect(calls).toContain("/wp-json/progressnow/v1/pages/acerca?lang=es");
    expect(calls.some((c) => c.includes("category=all"))).toBe(false);
  });

  it("maps a WordPress 404 envelope onto ApiError(404, code)", async () => {
    const api = createApi({ apiBase: BASE, fetchImpl: fakeFetch().fetchImpl, mode: "production" });
    await expect(api.post("nope", "en")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      code: "progressnow_not_found",
    });
  });

  it("throws the zod error in development when the contract drifts", async () => {
    const { fetchImpl } = fakeFetch({ categories: { categories: [{ id: 1 }] } });
    const api = createApi({ apiBase: BASE, fetchImpl, mode: "development" });
    await expect(api.categories()).rejects.toThrow(/label|Expected/i);
  });

  it("logs and throws ApiError('progressnow_contract') in production when the contract drifts", async () => {
    const { fetchImpl } = fakeFetch({ categories: { categories: [{ id: 1 }] } });
    const log = vi.fn();
    const api = createApi({ apiBase: BASE, fetchImpl, mode: "production", onContractError: log });
    await expect(api.categories()).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      code: "progressnow_contract",
    });
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ endpoint: "/categories" }));
  });

  it("wraps network failures as ApiError(0)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const api = createApi({ apiBase: BASE, fetchImpl, mode: "production" });
    await expect(api.routes()).rejects.toMatchObject({ name: "ApiError", status: 0 });
    expect(() => new ApiError("x", 503, "y")).not.toThrow();
  });
});

describe("upstream failure logging", () => {
  const capture = () => {
    const lines: string[] = [];
    const log = createLogger({ sink: (line) => lines.push(line), now: () => new Date(0) });
    return { lines, log };
  };

  it("emits one structured line for a 5xx and none for a 404 (a content decision)", async () => {
    const { lines, log } = capture();
    const fetchImpl = vi.fn(async (input: string | URL | Request) =>
      String(input).includes("/posts/")
        ? new Response(JSON.stringify({ code: "progressnow_not_found" }), { status: 404 })
        : new Response(JSON.stringify({ code: "progressnow_mock_failing", message: "Simulated" }), {
            status: 503,
          }),
    );
    const api = createApi({ apiBase: BASE, fetchImpl, log });
    await expect(api.site("en")).rejects.toMatchObject({
      status: 503,
      code: "progressnow_mock_failing",
    });
    await expect(api.post("gone", "en")).rejects.toMatchObject({ status: 404 });
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!)).toEqual({
      level: "error",
      time: "1970-01-01T00:00:00.000Z",
      event: "upstream_failure",
      path: "/site",
      status: 503,
      code: "progressnow_mock_failing",
      message: "Simulated",
    });
  });

  it("marks upstream health: failure on 5xx/network, success on any 2xx", async () => {
    const marks: string[] = [];
    const health = { markFailure: () => marks.push("fail"), markSuccess: () => marks.push("ok") };
    const { log } = capture();
    let failing = true;
    const api = createApi({
      apiBase: BASE,
      fetchImpl: vi.fn(async () =>
        failing
          ? new Response("down", { status: 503 })
          : Response.json(mock.dispatch("routes", {})),
      ),
      log,
      health,
    });
    await expect(api.routes()).rejects.toMatchObject({ status: 503 });
    failing = false;
    await api.routes();
    expect(marks).toEqual(["fail", "ok"]);
  });

  it("network errors and contract failures are logged too", async () => {
    const { lines, log } = capture();
    const api = createApi({
      apiBase: BASE,
      fetchImpl: vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
      log,
    });
    await expect(api.routes()).rejects.toMatchObject({ status: 0 });
    const bad = createApi({
      apiBase: BASE,
      fetchImpl: vi.fn(async () => Response.json({ nope: true })),
      mode: "production",
      onContractError: () => {},
      log,
    });
    await expect(bad.routes()).rejects.toMatchObject({ code: "progressnow_contract" });
    expect(lines.map((l) => JSON.parse(l).event)).toEqual([
      "upstream_failure",
      "upstream_contract",
    ]);
  });
});
