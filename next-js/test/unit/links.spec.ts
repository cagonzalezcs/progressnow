import { describe, expect, it } from "vitest";
import { resolveHref } from "@/lib/links";

/* Link re-homing (openspec next-headless-site § Internal links are re-homed
 * onto the app origin; design D4). Same rule set as the Nuxt rendition's
 * lib/chapter/links.ts, applied at render instead of at click. */
const WP = "https://wp.example";

describe("resolveHref", () => {
  it("re-homes WordPress-origin content URLs onto the app as relative paths", () => {
    expect(resolveHref("https://wp.example/about/", WP)).toEqual({
      kind: "internal",
      href: "/about/",
    });
    expect(resolveHref("https://wp.example/es/blog/?s=x#top", WP)).toEqual({
      kind: "internal",
      href: "/es/blog/?s=x#top",
    });
    expect(resolveHref("https://wp.example/about/#mission", WP)).toEqual({
      kind: "internal",
      href: "/about/#mission",
    });
    expect(resolveHref("https://wp.example", WP)).toEqual({ kind: "internal", href: "/" });
  });

  it("treats relative URLs as app paths", () => {
    expect(resolveHref("/calendar/", WP)).toEqual({ kind: "internal", href: "/calendar/" });
    expect(resolveHref("blog/", WP)).toEqual({ kind: "internal", href: "/blog/" });
  });

  it("keeps WordPress-only paths and files absolute", () => {
    expect(resolveHref("https://wp.example/feed/chapter-events/", WP)).toEqual({
      kind: "wordpress",
      href: "https://wp.example/feed/chapter-events/",
    });
    expect(resolveHref("https://wp.example/wp-content/uploads/bylaws.pdf", WP).kind).toBe(
      "wordpress",
    );
    expect(resolveHref("https://wp.example/wp-admin/", WP).kind).toBe("wordpress");
    expect(resolveHref("https://wp.example/wp-login.php", WP).kind).toBe("wordpress");
    expect(resolveHref("https://wp.example/wp-json/progressnow/v1/posts", WP).kind).toBe(
      "wordpress",
    );
    expect(resolveHref("https://wp.example/docs/agenda.ics", WP).kind).toBe("wordpress");
    expect(resolveHref("/wp-content/uploads/x.jpg", WP)).toEqual({
      kind: "wordpress",
      href: "https://wp.example/wp-content/uploads/x.jpg",
    });
  });

  it("passes external URLs through unchanged", () => {
    expect(resolveHref("https://calendar.google.com/calendar/r?cid=abc", WP)).toEqual({
      kind: "external",
      href: "https://calendar.google.com/calendar/r?cid=abc",
    });
    expect(resolveHref("http://wp.example/about/", WP).kind).toBe("external"); // scheme differs → different origin
  });

  it("leaves inert hrefs alone", () => {
    for (const href of [
      "",
      "#faq",
      "mailto:hi@example.org",
      "tel:+15555555555",
      "sms:+1555",
      "javascript:void(0)",
    ]) {
      expect(resolveHref(href, WP)).toEqual({ kind: "inert", href });
    }
  });

  it("does not throw on garbage", () => {
    expect(resolveHref("http://[", WP)).toEqual({ kind: "inert", href: "http://[" });
  });
});
