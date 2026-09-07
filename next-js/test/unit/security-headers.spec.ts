import { describe, expect, it } from "vitest";
import {
  applySecurityHeaders,
  buildCsp,
  CSP_HEADER,
  CSP_REPORT_ONLY_HEADER,
  cspHeaderName,
  FRAME_SOURCES,
  generateNonce,
  STATIC_SECURITY_HEADERS,
} from "@/lib/security-headers";

/* openspec next-deployment § Security headers and CSP (task 8.1). */
const base = {
  nonce: "abc123==",
  wpOrigin: "http://127.0.0.1:8787",
  imageHosts: ["127.0.0.1", "cdn.example.org"],
};

function directives(csp: string): Record<string, string> {
  return Object.fromEntries(
    csp.split(";").map((d) => {
      const [name, ...rest] = d.trim().split(/\s+/);
      return [name!, rest.join(" ")];
    }),
  );
}

describe("generateNonce", () => {
  it("is fresh per call and base64 (what Next's nonce parser accepts)", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(Buffer.from(a, "base64")).toHaveLength(16);
  });
});

describe("buildCsp", () => {
  it("locks scripts to the nonce with strict-dynamic and no unsafe-inline", () => {
    const d = directives(buildCsp(base));
    expect(d["script-src"]).toBe("'self' 'nonce-abc123==' 'strict-dynamic'");
    expect(d["script-src"]).not.toContain("unsafe-inline");
    expect(d["script-src"]).not.toContain("unsafe-eval");
  });

  it("adds unsafe-eval only for the dev server", () => {
    expect(directives(buildCsp({ ...base, dev: true }))["script-src"]).toContain("'unsafe-eval'");
  });

  it("carries the spec'd directives", () => {
    const d = directives(buildCsp(base));
    expect(d["default-src"]).toBe("'self'");
    expect(d["font-src"]).toBe("'self'");
    expect(d["connect-src"]).toBe("'self'");
    expect(d["frame-ancestors"]).toBe("'none'");
    expect(d["object-src"]).toBe("'none'");
    expect(d["base-uri"]).toBe("'self'");
    expect(d["form-action"]).toBe("'self'");
    expect(d["style-src"]).toBe("'self' 'unsafe-inline'");
  });

  it("allows images from self, data:, the WordPress origin (port kept) and IMAGE_HOSTS", () => {
    const d = directives(buildCsp(base));
    expect(d["img-src"]).toBe("'self' data: blob: http://127.0.0.1:8787 127.0.0.1 cdn.example.org");
  });

  it("allows media from the WordPress origin and frames from the video players only", () => {
    const d = directives(buildCsp(base));
    expect(d["media-src"]).toBe("'self' http://127.0.0.1:8787");
    expect(d["frame-src"]).toBe(FRAME_SOURCES.join(" "));
    expect(FRAME_SOURCES).toEqual(["https://www.youtube-nocookie.com", "https://player.vimeo.com"]);
  });

  it("appends extra image sources after the hosts (styleguide demos)", () => {
    const d = directives(buildCsp({ ...base, imageHosts: [], extraImageSources: ["https:"] }));
    expect(d["img-src"]).toBe("'self' data: blob: http://127.0.0.1:8787 https:");
  });

  it("dedupes hosts, ignores blanks, and appends report-uri when given", () => {
    const csp = buildCsp({
      ...base,
      imageHosts: ["", " cdn.example.org ", "cdn.example.org"],
      reportUri: "/csp-report",
    });
    const d = directives(csp);
    expect(d["img-src"]).toBe("'self' data: blob: http://127.0.0.1:8787 cdn.example.org");
    expect(d["report-uri"]).toBe("/csp-report");
    expect(csp.endsWith("report-uri /csp-report")).toBe(true);
  });
});

describe("applySecurityHeaders", () => {
  it("sets the CSP and the static headers; X-Powered-By is never added", () => {
    const h = new Headers();
    applySecurityHeaders(h, "default-src 'self'");
    expect(h.get(CSP_HEADER)).toBe("default-src 'self'");
    expect(h.get(CSP_REPORT_ONLY_HEADER)).toBeNull();
    expect(h.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains");
    expect(h.get("X-Content-Type-Options")).toBe("nosniff");
    expect(h.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(h.get("Permissions-Policy")).toContain("camera=()");
    expect(h.get("X-Powered-By")).toBeNull();
    expect(STATIC_SECURITY_HEADERS.map((s) => s.key)).not.toContain("X-Powered-By");
  });

  it("report-only mode swaps the header name only", () => {
    const h = new Headers();
    applySecurityHeaders(h, "default-src 'self'", true);
    expect(h.get(CSP_REPORT_ONLY_HEADER)).toBe("default-src 'self'");
    expect(h.get(CSP_HEADER)).toBeNull();
    expect(cspHeaderName(true)).toBe(CSP_REPORT_ONLY_HEADER);
    expect(cspHeaderName(false)).toBe(CSP_HEADER);
  });
});
