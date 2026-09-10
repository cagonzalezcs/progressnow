// @vitest-environment happy-dom
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import categoriesFixture from "../../../tests/fixtures/categories.json";
import postsEnvelopeFixture from "../../../tests/fixtures/posts-envelope.json";
import BlogArchive from "@/components/site/blog/BlogArchive.vue";
import FeaturedPostCard from "@/components/site/blog/FeaturedPostCard.vue";
import PostCard from "@/components/site/blog/PostCard.vue";
import { POSTS_PER_PAGE } from "@/lib/api";
import type { BlogPost } from "@/lib/schemas";

/* Grid math of the archive island (openspec blog-grid-full-rows →
 * blog-presentation § Post grid and pagination, § Filtered results mode):
 * every state asks /posts for POSTS_PER_PAGE, lifts one post into the
 * featured card and grids the other 24, so the 3-column (≥1200px) and
 * 2-column (md) grids never end on a short row. The nuxt-js copy of the
 * component is byte-identical (shared-source-drift.test.ts), so this covers
 * both renderers. */

const { fetchPosts } = vi.hoisted(() => ({ fetchPosts: vi.fn() }));
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, fetchPosts };
});

const API = "https://wp.example/wp-json/progressnow/v1";
const base = postsEnvelopeFixture.posts[0] as BlogPost;

function posts(n: number, prefix = "post"): BlogPost[] {
  return Array.from({ length: n }, (_, i) => ({
    ...base,
    id: `${prefix}-${i + 1}`,
    slug: `${prefix}-${i + 1}`,
    title: `${prefix} ${i + 1}`,
    url: `https://wp.example/blog/${prefix}-${i + 1}/`,
    featured: false,
  }));
}

function mountArchive(initialPosts: BlogPost[]) {
  return mount(BlogArchive, {
    props: {
      initialPosts,
      initialTotal: 30,
      apiBase: API,
      categories: categoriesFixture.categories,
      showSubscribe: false,
    },
  });
}

describe("BlogArchive page size", () => {
  beforeEach(() => {
    fetchPosts.mockReset();
  });

  it("browse page: one featured card plus a 24-card grid from a 25-post page, no fetch", () => {
    expect(POSTS_PER_PAGE).toBe(25);
    window.history.replaceState(null, "", "/blog/");
    const wrapper = mountArchive(posts(25));

    expect(fetchPosts).not.toHaveBeenCalled();
    expect(wrapper.findAllComponents(FeaturedPostCard)).toHaveLength(1);
    expect(wrapper.findAllComponents(PostCard)).toHaveLength(24);
    expect(wrapper.text()).toContain("Page 1 of 2"); // ceil(30 / 25)
  });

  it("a sticky post on the page takes the featured slot and leaves the grid", () => {
    window.history.replaceState(null, "", "/blog/");
    const list = posts(25);
    list[3] = { ...list[3]!, featured: true };
    const wrapper = mountArchive(list);

    expect(wrapper.getComponent(FeaturedPostCard).props("post").id).toBe("post-4");
    const gridIds = wrapper.findAllComponents(PostCard).map((c) => c.props("post").id);
    expect(gridIds).toHaveLength(24);
    expect(gridIds).not.toContain("post-4");
  });

  it("filtered state fetches per_page=25 and keeps the featured card + 24-card browse-style grid", async () => {
    window.history.replaceState(null, "", "/blog/?category=labor");
    fetchPosts.mockResolvedValueOnce({
      posts: posts(25, "labor"),
      page: 1,
      perPage: 25,
      total: 40,
      totalPages: 2,
    });
    const wrapper = mountArchive(posts(25));
    await flushPromises();

    expect(fetchPosts).toHaveBeenCalledTimes(1);
    expect(fetchPosts.mock.calls[0]![1]).toMatchObject({
      category: "labor",
      page: 1,
      perPage: POSTS_PER_PAGE,
    });
    expect(wrapper.text()).toContain("40 posts in Labor");
    expect(wrapper.getComponent(FeaturedPostCard).props("post").id).toBe("labor-1");
    const cards = wrapper.findAllComponents(PostCard);
    expect(cards).toHaveLength(24);
    expect(cards.every((c) => c.props("variant") === "grid")).toBe(true);
    expect(wrapper.text()).toContain("Page 1 of 2");
  });

  it("zero matches render the empty state with no featured card", async () => {
    window.history.replaceState(null, "", "/blog/?s=zzz");
    fetchPosts.mockResolvedValueOnce({ posts: [], page: 1, perPage: 25, total: 0, totalPages: 0 });
    const wrapper = mountArchive(posts(25));
    await flushPromises();

    expect(wrapper.text()).toContain("No posts match");
    expect(wrapper.findAllComponents(FeaturedPostCard)).toHaveLength(0);
    expect(wrapper.findAllComponents(PostCard)).toHaveLength(0);
  });
});
