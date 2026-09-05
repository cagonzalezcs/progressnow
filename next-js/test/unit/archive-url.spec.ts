import { describe, expect, it } from "vitest";
import { archiveBase, archiveHref, isBrowse, pageItems } from "@/lib/archive-url";

describe("archive URL state", () => {
  it("browse pages are WordPress permalinks", () => {
    expect(archiveHref("/blog/", {})).toBe("/blog/");
    expect(archiveHref("/blog/", { page: 1 })).toBe("/blog/");
    expect(archiveHref("/blog/page/2/", { page: 3 })).toBe("/blog/page/3/");
    expect(archiveHref("/es/blog", { page: 2 })).toBe("/es/blog/page/2/");
  });

  it("filtered states use query params and reset paging unless asked", () => {
    expect(archiveHref("/blog/", { s: " strike " })).toBe("/blog/?s=strike");
    expect(archiveHref("/blog/page/4/", { category: "labor" })).toBe("/blog/?category=labor");
    expect(archiveHref("/blog/", { s: "x", category: "all", page: 2 })).toBe("/blog/?s=x&paged=2");
    expect(isBrowse({ s: "", category: "all" })).toBe(true);
    expect(isBrowse({ category: "labor" })).toBe(false);
  });

  it("derives the base path", () => {
    expect(archiveBase("/blog/page/12/")).toBe("/blog/");
    expect(archiveBase("/category/labor/")).toBe("/category/labor/");
  });

  it("windows page numbers", () => {
    expect(pageItems(5, 3)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(12, 6)).toEqual([1, "…", 5, 6, 7, "…", 12]);
    expect(pageItems(12, 1)).toEqual([1, 2, "…", 12]);
  });
});
