import { describe, expect, it } from "vitest";
import {
  eventTag,
  eventsTag,
  frontTag,
  pageTag,
  postTag,
  postsTag,
  siteTag,
  TAG,
  tagsFor,
} from "@/lib/data/tags";

/* Cache tag grammar (design D1, § Content freshness). Mirrors the Nuxt payload
 * key grammar so both frontends name content the same way. */
describe("cache tags", () => {
  it("names the global tags the receiver invalidates", () => {
    expect(TAG).toEqual({ content: "content", routes: "routes", site: "site" });
  });

  it("derives per-key tags from lang and slug", () => {
    expect(siteTag("es")).toBe("site:es");
    expect(frontTag("en")).toBe("front:en");
    expect(pageTag("en", "about")).toBe("page:en:about");
    expect(pageTag("es", "/acerca/")).toBe("page:es:acerca");
    expect(postTag("en", "know-your-rights")).toBe("post:en:know-your-rights");
    expect(eventTag("es", "asamblea")).toBe("event:es:asamblea");
    expect(postsTag("en")).toBe("posts:en");
    expect(eventsTag("en")).toBe("events:en");
  });

  it("always includes the global content tag", () => {
    expect(tagsFor(postTag("en", "x"))).toEqual(["content", "post:en:x"]);
    expect(tagsFor(TAG.routes)).toEqual(["content", "routes"]);
  });
});
