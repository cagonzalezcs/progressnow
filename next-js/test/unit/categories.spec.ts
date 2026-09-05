import { describe, expect, it } from "vitest";
import {
  categoryById,
  DEFAULT_CATEGORIES,
  eventCategories,
  hexToRgba,
  postCategories,
  resolveCategories,
} from "@/lib/categories";

describe("categories", () => {
  it("defaults to the drift-guarded registry with the 'all' pseudo-category first", () => {
    expect(DEFAULT_CATEGORIES.map((c) => c.id)).toEqual([
      "chapter",
      "poled",
      "mutual",
      "labor",
      "electoral",
      "social",
    ]);
    expect(eventCategories()[0]).toEqual({ id: "all", label: "All events", color: null });
    expect(postCategories()[0]).toEqual({ id: "all", label: "All posts", color: null });
  });

  it("prefers WordPress overrides and falls back for unknown ids", () => {
    const wp = [{ id: "labor", label: "Labor & Work", color: "#000000" }];
    expect(resolveCategories(wp)).toEqual(wp);
    expect(resolveCategories([{ id: "all", label: "x", color: null }])).toEqual(DEFAULT_CATEGORIES);
    expect(categoryById("labor", postCategories(wp)).label).toBe("Labor & Work");
    expect(categoryById("nope", postCategories()).id).toBe("all");
  });

  it("hexToRgba", () => {
    expect(hexToRgba("#1848d8", 0.5)).toBe("rgba(24,72,216,0.5)");
    expect(hexToRgba("var(--x)", 0.5)).toBe("var(--x)");
  });
});
