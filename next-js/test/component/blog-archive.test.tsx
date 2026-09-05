import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import postsFixture from "@fixtures/posts-envelope.json";
import { ArchiveFrame } from "@/components/site/blog/ArchiveFrame";
import { FeaturedPostCard } from "@/components/site/blog/FeaturedPostCard";
import { Pagination } from "@/components/site/blog/Pagination";
import { PostCard } from "@/components/site/blog/PostCard";
import { postCategories } from "@/lib/categories";
import type { PostsEnvelope } from "@/lib/schemas";

/* openspec blog-presentation § Blog toolbar, § Featured post card, § Post grid
 * and pagination; next-headless-site § Interactive archive: the URL is the
 * state — typing debounces into router.replace(?s=), chips are immediate,
 * both reset paging; pagination hrefs are real permalinks. */
const replace = vi.fn();
let pathname = "/blog/";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => pathname,
}));

const WP = "https://wp.example";
const posts = postsFixture as unknown as PostsEnvelope;
const post = posts.posts[0]!;
const strings = {
  searchPlaceholder: "Search posts…",
  searchLabel: "Search posts",
  filterLabel: "Filter by category",
  searching: "Searching…",
  clear: "Clear filters",
};

describe("blog cards", () => {
  it("featured and grid/compact cards link to the re-homed post and are axe-clean", async () => {
    const { container } = render(
      <main>
        <h1>Blog</h1>
        <FeaturedPostCard post={{ ...post, url: `${WP}/blog/${post.slug}/` }} wpOrigin={WP} />
        <PostCard
          post={{ ...post, url: `${WP}/blog/${post.slug}/` }}
          variant="grid"
          wpOrigin={WP}
        />
        <PostCard post={post} variant="compact" readTime wpOrigin={WP} />
      </main>,
    );
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", `/blog/${post.slug}/`);
    expect(screen.getAllByText(post.title)).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("pagination renders permalink hrefs with the current page marked", async () => {
    const { container } = render(
      <main>
        <h1>Blog</h1>
        <Pagination base="/blog/" state={{}} current={2} total={12} />
        <Pagination
          base="/blog/"
          state={{ s: "x" }}
          current={1}
          total={3}
          label="Results pagination"
        />
      </main>,
    );
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Page 12" })).toHaveAttribute(
      "href",
      "/blog/page/12/",
    );
    expect(within(nav).getByRole("link", { name: /Previous page/ })).toHaveAttribute(
      "href",
      "/blog/",
    );
    const results = screen.getByRole("navigation", { name: "Results pagination" });
    expect(within(results).getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "href",
      "/blog/?s=x&paged=2",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ArchiveFrame", () => {
  beforeEach(() => {
    replace.mockClear();
    pathname = "/blog/page/2/";
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("debounces typing into ?s= (resetting paging), chips are immediate, clear returns to browse", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(
      <ArchiveFrame
        categories={postCategories()}
        initial={{ s: "", category: "all" }}
        basePath="/blog/"
        strings={strings}
      >
        <p>results</p>
      </ArchiveFrame>,
    );
    const input = screen.getByRole("searchbox", { name: "Search posts" });
    await user.type(input, "strike");
    expect(replace).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenLastCalledWith("/blog/?s=strike", { scroll: false });

    await user.click(
      within(screen.getByRole("group", { name: "Filter by category" })).getByRole("button", {
        name: "Labor",
      }),
    );
    expect(replace).toHaveBeenLastCalledWith("/blog/?s=strike&category=labor", { scroll: false });

    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/blog/");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks the active category and shows no clear link in browse mode", () => {
    render(
      <ArchiveFrame
        categories={postCategories()}
        initial={{ s: "", category: "labor" }}
        basePath="/blog/"
        strings={strings}
      >
        <p>results</p>
      </ArchiveFrame>,
    );
    expect(screen.getByRole("button", { name: "Labor" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All posts" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
