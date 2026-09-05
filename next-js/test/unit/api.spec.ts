import { describe, expect, it, vi } from "vitest";
import { ApiError, createApi } from "@/lib/api";
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
