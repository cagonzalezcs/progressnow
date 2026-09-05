import { describe, expect, it } from "vitest";
import { firstLoadScripts, report, staticFileFor } from "../../scripts/bundle-budget.mjs";

describe("bundle budget helpers", () => {
  const html = `<html><head>
    <link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/a.js"/>
    <link rel="modulepreload" href="/_next/static/chunks/m.js"/>
    <link rel="preload" as="font" href="/wp-content/themes/progressnow/static/fonts/x.woff2"/>
    <link rel="stylesheet" href="/_next/static/css/app.css"/>
    </head><body>
    <script src="/_next/static/chunks/b.js" async=""></script>
    <script src="/_next/static/chunks/a.js"></script>
    <script src="https://cdn.example/other.js"></script>
    <script>inline()</script></body></html>`;

  it("collects first-load scripts once, ignoring fonts, CSS, inline and third-party scripts", () => {
    expect(firstLoadScripts(html)).toEqual([
      "/_next/static/chunks/a.js",
      "/_next/static/chunks/b.js",
      "/_next/static/chunks/m.js",
    ]);
  });

  it("maps public script URLs onto the build output", () => {
    expect(staticFileFor("/_next/static/chunks/a.js?v=2")).toBe(".next/static/chunks/a.js");
  });

  it("reports the total against the budget", () => {
    const rows = [
      { file: "a.js", gzipBytes: 100 },
      { file: "b.js", gzipBytes: 50 },
    ];
    expect(report(rows, 200)).toMatchObject({ total: 150, ok: true });
    expect(report(rows, 120)).toMatchObject({ total: 150, ok: false });
    expect(report(rows, 120).text).toContain("OVER by 30");
  });
});
