import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import postsFixture from "@fixtures/posts-envelope.json";
import singlePost from "@fixtures/single-post.json";
import siteFixture from "@fixtures/site.json";
import { SinglePostPage } from "@/components/site/blog/SinglePost";
import type { PostsEnvelope, SinglePostEnvelope, SiteEnvelope } from "@/lib/schemas";

/* Claude Design "Progress Now Blog Post v4" (openspec progress-now-v4-blog D4):
 * hero with breadcrumb/category/byline, pulled-up featured image, block
 * stack, share row, meta rail, read next — from the theme fixtures. */
const WP = "https://mock.example";
const site = {
  ...(siteFixture as unknown as SiteEnvelope),
  chapter: {
    ...(siteFixture as unknown as SiteEnvelope).chapter,
    join_url: "https://join.example/",
  },
};
const seed = (postsFixture as unknown as PostsEnvelope).posts[0]!;
const pool = [1, 2, 3].map((n) => ({ ...seed, id: `${seed.id}-${n}`, slug: `${seed.slug}-${n}` }));
const base = singlePost as unknown as SinglePostEnvelope;
const paths = { home: "/", blog: "/blog/", calendar: "/calendar/" };

const rich: SinglePostEnvelope = {
  ...base,
  title: "Lorem ipsum dolor sit amet",
  dek: "A lede in 600.",
  author: "Lorem Ipsum",
  bylineMode: "named",
  readMinutes: 8,
  showMetaRail: true,
  featuredImage: { src: `${WP}/wp-content/uploads/hero.jpg`, alt: "Hero", credit: "Photo: X" },
  blocks: [
    { type: "prose", html: "<h2>Sed ut perspiciatis</h2><p>Body.</p>" },
    { type: "pull_quote", quote: "Quis autem vel eum.", attribution: "Dolor Sit, Organizer" },
    { type: "image", image: { src: `${WP}/img.jpg`, alt: "Inline", caption: "Cap" } },
    {
      type: "gallery",
      layout: "essay",
      images: [
        { src: null, alt: "" },
        { src: null, alt: "" },
      ],
    },
    {
      type: "person_quote",
      photo: null,
      alt: "",
      quote: "Hola",
      translation: "Hi",
      name: "Ana",
      role: "Member",
      lang: "es",
    },
    { type: "video", url: "https://youtu.be/abcdef123", caption: "Clip", transcriptUrl: "/t.txt" },
    { type: "audio", file: null, title: "Episode 1", duration: "12:00", transcriptUrl: "/a.txt" },
    {
      type: "document",
      url: `${WP}/wp-content/uploads/doc.pdf`,
      title: "Bylaws",
      description: "PDF",
    },
    { type: "event_embed", event: null },
    {
      type: "action_callout",
      heading: "Act",
      body: "Now.",
      buttons: [{ label: "Go", url: "/go/", style: "primary" }],
    },
  ],
  readNext: [],
};

describe("single post", () => {
  it("renders hero, byline, pulled-up image, blocks, share row, rail and read next", async () => {
    const { container } = render(
      <main>
        <SinglePostPage post={rich} readNext={pool} site={site} paths={paths} wpOrigin={WP} />
      </main>,
    );
    expect(container.querySelector("[data-route-kind='post']")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(rich.title);
    // Breadcrumb: Home / Blog / current.
    const crumbs = screen.getByRole("navigation", { name: /Home/ });
    expect(within(crumbs).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
    // Category pill filters the archive.
    expect(screen.getByRole("link", { name: "Chapter-Wide" })).toHaveAttribute(
      "href",
      "/blog/?category=chapter",
    );
    expect(screen.getByText("LI")).toBeInTheDocument();
    expect(screen.getByText("By Lorem Ipsum")).toBeInTheDocument();
    expect(screen.getByText("8 min read")).toBeInTheDocument();
    expect(container.querySelector("[data-post-hero] img")).toHaveAttribute("alt", "Hero");
    expect(screen.getByText("A lede in 600.")).toBeInTheDocument();
    // Blocks.
    expect(container.querySelector("h2#sed-ut-perspiciatis")).toBeInTheDocument();
    expect(screen.getByText("Quis autem vel eum.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play video" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Play audio: Episode 1/ })).toBeDisabled();
    expect(screen.getByRole("link", { name: /Download/ })).toHaveAttribute(
      "href",
      `${WP}/wp-content/uploads/doc.pdf`,
    );
    expect(screen.getByRole("link", { name: "See the calendar" })).toHaveAttribute(
      "href",
      "/calendar/",
    );
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/go/");
    // Share row.
    expect(screen.getByRole("link", { name: "Email it" })).toHaveAttribute(
      "href",
      `mailto:?subject=${encodeURIComponent(rich.title)}`,
    );
    // Meta rail: on-this-page anchors + CTA (sidebar and stacked copy).
    const rail = screen.getByRole("complementary", { name: "Related" });
    expect(within(rail).getByRole("link", { name: "Sed ut perspiciatis" })).toHaveAttribute(
      "href",
      "#sed-ut-perspiciatis",
    );
    expect(screen.getAllByRole("link", { name: "Join Now" })).toHaveLength(2);
    // Read next: three compact cards + "All posts".
    expect(container.querySelectorAll("[data-read-next] a")).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: /All posts/ })[0]).toHaveAttribute("href", "/blog/");
    expect(
      await axe(container, { rules: { "landmark-unique": { enabled: false } } }),
    ).toHaveNoViolations();
  }, 20_000);

  it("fixture post: no image → no pull-up, no rail, no read next; copy link reports Copied", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { container } = render(
      <main>
        <SinglePostPage post={base} readNext={[]} site={site} paths={paths} wpOrigin={WP} />
      </main>,
    );
    expect(container.querySelector("[data-post-hero]")).not.toBeInTheDocument();
    expect(container.querySelector("article")).toHaveClass("pt-8");
    expect(screen.queryByRole("complementary", { name: "Related" })).not.toBeInTheDocument();
    expect(screen.queryByText("Read next")).not.toBeInTheDocument();
    expect(screen.queryByText(/^By /)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getByRole("button", { name: "Copied ✓" })).toBeInTheDocument();
  });
});
