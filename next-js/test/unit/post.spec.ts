import { describe, expect, it } from "vitest";
import postsFixture from "@fixtures/posts-envelope.json";
import { authorName, ensureHeadingIds, initials, pickReadNext, proseAnchors } from "@/lib/post";
import type { PostsEnvelope } from "@/lib/schemas";

const posts = (postsFixture as unknown as PostsEnvelope).posts;

describe("single post helpers", () => {
  it("byline: named author, committee mode, empty", () => {
    expect(authorName({ bylineMode: "named", author: "Lorem Ipsum", committee: "" })).toBe(
      "Lorem Ipsum",
    );
    expect(authorName({ bylineMode: "committee", author: "", committee: "Labor Committee" })).toBe(
      "The Labor Committee",
    );
    expect(authorName({ bylineMode: "named", author: "", committee: "" })).toBe("");
  });

  it("initials drop the word Committee and cap at two letters", () => {
    expect(initials({ bylineMode: "named", author: "lorem ipsum dolor", committee: "" })).toBe(
      "LI",
    );
    expect(initials({ bylineMode: "committee", author: "", committee: "Labor Committee" })).toBe(
      "L",
    );
    expect(initials({ bylineMode: "named", author: "", committee: "" })).toBe("");
  });

  it("anchors come from prose h2s, honoring serialized ids and slugging the rest", () => {
    const anchors = proseAnchors([
      { type: "prose", html: '<h2 id="sec1">Sed ut <em>perspiciatis</em></h2><p>x</p>' },
      { type: "pull_quote", quote: "q" },
      { type: "prose", html: "<h2>At vero eos!</h2>" },
    ]);
    expect(anchors).toEqual([
      { label: "Sed ut perspiciatis", href: "#sec1" },
      { label: "At vero eos!", href: "#at-vero-eos" },
    ]);
    expect(ensureHeadingIds('<h2>At vero eos!</h2><h2 id="keep">K</h2>')).toBe(
      '<h2 id="at-vero-eos">At vero eos!</h2><h2 id="keep">K</h2>',
    );
  });

  it("read next: same category first, never the current post, three max", () => {
    const current = posts[0]!;
    const picked = pickReadNext(posts, { slug: current.slug, cat: current.cat });
    expect(picked.length).toBeLessThanOrEqual(3);
    expect(picked.some((p) => p.slug === current.slug)).toBe(false);
    const firstOther = picked.findIndex((p) => p.cat !== current.cat);
    const lastSame = picked.map((p) => p.cat === current.cat).lastIndexOf(true);
    if (firstOther !== -1 && lastSame !== -1) expect(lastSame).toBeLessThan(firstOther);
  });
});
