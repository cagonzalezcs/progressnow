// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { resolveCached } from "@/lib/chapter/cache";
import { compareVersions, createFreshnessGuard } from "@/lib/chapter/freshness";
import { eventKey, frontKey, pageKey, postKey, postsKey, siteKey } from "@/lib/chapter/keys";
import { internalLinkTarget, isSameDocument } from "@/lib/chapter/links";
import { headForSeo } from "@/lib/chapter/seo";
import { createShellStore, isLandingPath, readShellData, SHELL_DATA_ID } from "@/lib/chapter/shell";
import type { ShellManifest } from "@/lib/schemas";
import site from "@fixtures/site.json";
import frontPage from "@fixtures/front-page.json";

function shellDocument(payload: unknown): Document {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return new DOMParser().parseFromString(
    `<!doctype html><html><head></head><body><div id="__nuxt"></div><script type="application/json" id="${SHELL_DATA_ID}">${json}</script></body></html>`,
    "text/html",
  );
}

const SHELL = {
  lang: "en",
  routeKind: "front",
  path: "/",
  contentVersion: 12,
  buildId: "abc",
  data: { "site:en": site, "front:en": frontPage },
};

describe("payload keys", () => {
  it("follow the shared grammar", () => {
    expect(siteKey("en")).toBe("site:en");
    expect(frontKey("es")).toBe("front:es");
    expect(pageKey("en", "/about/")).toBe("page:en:about");
    expect(pageKey("en", "get-involved/steps")).toBe("page:en:get-involved/steps");
    expect(postKey("es", "hola")).toBe("post:es:hola");
    expect(eventKey("en", "picnic")).toBe("event:en:picnic");
    expect(postsKey("")).toBe("posts:");
    expect(postsKey("en", 1, "")).toBe("posts:en");
    expect(postsKey("en", 2, "")).toBe("posts:en:2:");
    expect(postsKey("en", 1, "labor")).toBe("posts:en:1:labor");
  });
});

describe("readShellData", () => {
  it("parses a valid __SHELL_DATA__ element", () => {
    const data = readShellData(shellDocument(SHELL));
    expect(data?.path).toBe("/");
    expect(Object.keys(data?.data ?? {})).toEqual(["site:en", "front:en"]);
  });

  it("survives hostile content inside the payload", () => {
    const hostile = { ...SHELL, data: { "front:en": { ...frontPage, who: { ...frontPage.who, p1: "</script><script>alert(1)</script>" } } } };
    const doc = shellDocument(hostile);
    expect(doc.querySelectorAll("script").length).toBe(1);
    const data = readShellData(doc);
    expect((data?.data["front:en"] as typeof frontPage).who.p1).toContain("<script>alert(1)");
  });

  it("returns null without the element, on bad JSON, or on a contract miss", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(readShellData(new DOMParser().parseFromString("<main></main>", "text/html"))).toBeNull();
    const bad = new DOMParser().parseFromString(`<script id="${SHELL_DATA_ID}">{oops</script>`, "text/html");
    expect(readShellData(bad)).toBeNull();
    expect(readShellData(shellDocument({ lang: "en" }))).toBeNull();
    spy.mockRestore();
  });
});

describe("shell store", () => {
  it("knows its landing path", () => {
    const store = createShellStore(readShellData(shellDocument({ ...SHELL, path: "/about/" })));
    expect(store.keys).toEqual(["site:en", "front:en"]);
    expect(isLandingPath(store, "/about")).toBe(true);
    expect(isLandingPath(store, "/about/")).toBe(true);
    expect(isLandingPath(store, "/calendar/")).toBe(false);
    expect(isLandingPath(createShellStore(null), "/about/")).toBe(false);
  });
});

describe("resolveCached — the data order", () => {
  const sources = { payloadData: { a: 1 }, staticData: { a: 2, b: 3 }, bypassStatic: false };

  it("prefers the embedded/seeded payload, then the prerendered payload, then nothing", () => {
    expect(resolveCached("a", sources)).toBe(1);
    expect(resolveCached("b", sources)).toBe(3);
    expect(resolveCached("c", sources)).toBeUndefined();
  });

  it("skips prerendered data while the freshness guard bypasses", () => {
    expect(resolveCached("b", { ...sources, bypassStatic: true })).toBeUndefined();
    expect(resolveCached("a", { ...sources, bypassStatic: true })).toBe(1);
  });
});

describe("freshness guard", () => {
  const manifest = (contentVersion: number): ShellManifest => ({
    buildId: "b",
    builtAt: "",
    contentVersion,
    entry: "/_nuxt/e.js",
    css: [],
    modulepreload: [],
    prefetch: [],
    importmap: { "#entry": "/_nuxt/e.js" },
    prerenderedRoutes: 1,
    runtimeConfig: { public: {}, app: { baseURL: "/", buildId: "b", buildAssetsDir: "/_nuxt/", cdnURL: "" } },
  });

  it("bypasses static payloads until a manifest at least as new as the shell is seen", () => {
    const guard = createFreshnessGuard(12);
    expect(guard.state).toBe("unknown");
    expect(guard.bypass).toBe(true);
    expect(guard.observe(manifest(11))).toBe("stale");
    expect(guard.bypass).toBe(true);
    expect(guard.observe(manifest(12))).toBe("fresh");
    expect(guard.bypass).toBe(false);
    expect(guard.observe(manifest(13))).toBe("fresh");
  });

  it("treats an unreachable manifest as stale", () => {
    const guard = createFreshnessGuard(3);
    expect(guard.observe(null)).toBe("stale");
    expect(guard.bypass).toBe(true);
  });

  it("is unguarded without a shell", () => {
    const guard = createFreshnessGuard(null);
    expect(guard.state).toBe("unguarded");
    expect(guard.bypass).toBe(false);
    expect(guard.observe(manifest(0))).toBe("unguarded");
    expect(compareVersions(5, 5)).toBe("fresh");
  });
});

describe("headForSeo", () => {
  it("emits title, description, robots, canonical and hreflang with stable keys", () => {
    const head = headForSeo(
      {
        title: "About – Progress Now",
        description: "d",
        canonical: "https://x/about/",
        robots: "index,follow",
        hreflang: [
          { lang: "en", href: "https://x/about/" },
          { lang: "es", href: "https://x/es/acerca/" },
        ],
      },
      "es",
    );
    expect(head.htmlAttrs.lang).toBe("es");
    expect(head.title).toBe("About – Progress Now");
    expect(head.meta.map((m) => m.key)).toEqual(["description", "robots"]);
    expect(head.link.map((l) => l.key)).toEqual(["canonical", "hreflang-en", "hreflang-es"]);
  });
});

describe("internalLinkTarget", () => {
  const origin = "https://x.test";
  const anchor = (href: string, attrs: Record<string, string> = {}) => {
    const a = document.createElement("a");
    a.setAttribute("href", href);
    for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
    // happy-dom resolves against its own location; force the origin we test.
    Object.defineProperty(a, "href", { value: new URL(href, origin).toString() });
    return a;
  };

  it("accepts same-origin page links", () => {
    expect(internalLinkTarget(anchor("/about/#faq"), origin)).toEqual({ to: "/about/#faq", path: "/about/", search: "", hash: "#faq" });
    expect(internalLinkTarget(anchor("https://x.test/blog/?category=labor"), origin)?.to).toBe("/blog/?category=labor");
  });

  it("rejects everything the browser should handle", () => {
    expect(internalLinkTarget(anchor("https://other.test/"), origin)).toBeNull();
    expect(internalLinkTarget(anchor("mailto:hi@x.test"), origin)).toBeNull();
    expect(internalLinkTarget(anchor("#top"), origin)).toBeNull();
    expect(internalLinkTarget(anchor("/es/", { "data-native-nav": "" }), origin)).toBeNull();
    expect(internalLinkTarget(anchor("/files/bylaws.pdf"), origin)).toBeNull();
    expect(internalLinkTarget(anchor("/feed/chapter-events/"), origin)).toBeNull();
    expect(internalLinkTarget(anchor("/wp-admin/"), origin)).toBeNull();
    expect(internalLinkTarget(anchor("/x/", { download: "" }), origin)).toBeNull();
    expect(internalLinkTarget(anchor("/x/", { target: "_blank" }), origin)).toBeNull();
  });

  it("detects same-document hash navigations", () => {
    const t = internalLinkTarget(anchor("/about/#faq"), origin)!;
    expect(isSameDocument(t, { path: "/about", search: "" })).toBe(true);
    expect(isSameDocument(t, { path: "/about/", search: "?x=1" })).toBe(false);
  });
});
