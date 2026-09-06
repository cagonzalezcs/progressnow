import { describe, expect, it } from "vitest";
import blogPost from "@fixtures/blog-post.json";
import singlePost from "@fixtures/single-post.json";
import { MONTH_SHORTS, parseISODate, toISODate, WEEKDAYS } from "@/lib/events";
import { bylineInitials, bylineName, postAnchors, readNextPosts } from "@/lib/post";
import type { BlogPost, SinglePostData } from "@/lib/schemas";

const post = singlePost as unknown as SinglePostData;
const card = blogPost as unknown as BlogPost;

describe("post helpers", () => {
  it("collects prose h2 anchors, preferring serialized ids over slugs", () => {
    const blocks = [
      { type: "prose" as const, html: '<h2 id="why-now">Why <em>now</em></h2><p>x</p>' },
      { type: "pull_quote" as const, quote: "q" },
      { type: "prose" as const, html: "<h2>What Comes Next?</h2><h3>Skip me</h3>" },
    ];
    expect(postAnchors(blocks)).toEqual([
      { label: "Why now", href: "#why-now" },
      { label: "What Comes Next?", href: "#what-comes-next" },
    ]);
    expect(postAnchors(post.blocks)).toEqual([]);
  });

  it("read next: same category first, featured excluded, capped at three", () => {
    const mk = (id: number, cat: BlogPost["cat"], featured = false): BlogPost => ({
      ...card,
      id: String(id),
      cat,
      featured,
      title: `Post ${id}`,
    });
    const pool = [
      mk(1, "labor"),
      mk(2, "chapter", true),
      mk(3, "chapter"),
      mk(4, "labor"),
      mk(5, "chapter"),
    ];
    expect(readNextPosts({ cat: "chapter" }, pool).map((p) => p.id)).toEqual(["3", "5", "1"]);
    expect(readNextPosts(post, [card]).map((p) => p.id)).toEqual([card.id]);
    expect(readNextPosts(post, [])).toEqual([]);
  });

  it("byline: named vs committee mode, initials skip the word Committee", () => {
    const named = { ...post, author: "Lorem Ipsum", committee: "Housing Committee" };
    expect(bylineName(named)).toBe("Lorem Ipsum");
    expect(bylineInitials(named)).toBe("LI");
    expect(bylineName(named, "committee")).toBe("The Housing Committee");
    expect(bylineInitials(named, "committee")).toBe("H");
    expect(bylineName({ ...named, author: "" })).toBe("");
    expect(bylineInitials({ ...named, author: "" })).toBe("");
  });
});

describe("event date helpers", () => {
  it("parses ISO dates as local dates and round-trips", () => {
    const d = parseISODate("2026-07-04");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 6, 4]);
    expect(WEEKDAYS[d.getDay()]).toBe("Sat");
    expect(MONTH_SHORTS[d.getMonth()]).toBe("Jul");
    expect(toISODate(d)).toBe("2026-07-04");
    expect(toISODate(parseISODate("2026-01-01"))).toBe("2026-01-01");
  });
});
