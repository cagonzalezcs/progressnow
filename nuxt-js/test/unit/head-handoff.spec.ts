// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { createHead, renderDOMHead } from "unhead/client";
import { dropUnadoptedAlternates, headForSeo, rendersAlternates } from "@/lib/chapter/seo";

/* openspec nuxt4-static-platform 5.7: the PHP shell's hreflang links are handed
 * to unhead on the first client navigation. This drives a real unhead client
 * against a shell-like <head> to pin the adoption behaviour the navigation
 * plugin relies on. */

const SEO = {
  title: "Event Calendar",
  description: "Upcoming events.",
  canonical: "https://example.org/calendar/",
  robots: "index,follow",
  hreflang: [
    { lang: "en", href: "https://example.org/calendar/" },
    { lang: "es", href: "https://example.org/es/calendario/" },
  ],
};

function shellHead(): Document {
  document.head.innerHTML = [
    // Polylang's set (attribute order as WordPress emits it)…
    '<link rel="alternate" href="https://example.org/" hreflang="en">',
    '<link rel="alternate" href="https://example.org/es/inicio/" hreflang="es">',
    // …and the theme's set (canonical origin).
    '<link rel="canonical" href="https://example.org/">',
    '<link rel="alternate" hreflang="en" href="https://example.org/">',
    '<link rel="alternate" hreflang="es" href="https://example.org/es/inicio/">',
  ].join("");
  return document;
}

const hreflangLinks = () =>
  Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'));

function boot(doc: Document) {
  const head = createHead({ document: doc });
  // Landing route: unhead renders something unrelated (nuxt's own head) — this
  // is the render that indexes the shell's existing links by dedupe key.
  head.push({ meta: [{ name: "viewport", content: "width=device-width" }] });
  renderDOMHead(head, { document: doc });
  return head;
}

describe("PHP shell hreflang handoff", () => {
  it("detaching the shell's links before unhead renders loses hreflang (the bug)", () => {
    const doc = shellHead();
    const head = boot(doc);
    const php = hreflangLinks();
    expect(php).toHaveLength(4);
    for (const link of php) link.remove();
    head.push(headForSeo(SEO, "en"));
    renderDOMHead(head, { document: doc });
    expect(hreflangLinks()).toHaveLength(0);
  });

  it("unhead adopts one shell link per language; the rest are dropped after that render", () => {
    const doc = shellHead();
    const head = boot(doc);
    const php = hreflangLinks();
    let dropped = -1;
    let sawAlternates = false;
    const off = head.hooks.hook("dom:rendered", ({ renders }) => {
      if (!rendersAlternates(renders)) return;
      sawAlternates = true;
      dropped = dropUnadoptedAlternates(php);
      off();
    });
    // Nothing happens on renders without alternates.
    head.push({ meta: [{ name: "description", content: "x" }] });
    renderDOMHead(head, { document: doc });
    expect(sawAlternates).toBe(false);
    expect(hreflangLinks()).toHaveLength(4);

    head.push(headForSeo(SEO, "en"));
    renderDOMHead(head, { document: doc });
    expect(sawAlternates).toBe(true);
    expect(dropped).toBe(2);
    const links = hreflangLinks();
    expect(links.map((l) => [l.hreflang, l.href, l.dataset.hid])).toEqual([
      ["en", "https://example.org/calendar/", "hreflang-en"],
      ["es", "https://example.org/es/calendario/", "hreflang-es"],
    ]);
    expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SEO.canonical);
  });
});
