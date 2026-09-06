import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import blogPost from "@fixtures/blog-post.json";
import chapterEvent from "@fixtures/chapter-event.json";
import singlePost from "@fixtures/single-post.json";
import siteFixture from "@fixtures/site.json";
import { postLabels } from "@/components/routes/RoutePost";
import { PostBlocks } from "@/components/site/blog/PostBlocks";
import { SinglePost } from "@/components/site/blog/SinglePost";
import { videoEmbedUrl } from "@/components/site/blog/blocks/BlockVideo";
import type {
  BlogPost,
  ChapterEvent,
  PostBlock,
  SinglePostData,
  SiteEnvelope,
} from "@/lib/schemas";

/* openspec progress-now-v4-blog D4 / gutenberg-post-blocks: the single-post
 * shell and one test per block type, from the theme's contract fixtures. */
const WP = "https://mock.example";
const site = siteFixture as unknown as SiteEnvelope;
const post = singlePost as unknown as SinglePostData;
const card = blogPost as unknown as BlogPost;
const event = chapterEvent as unknown as ChapterEvent;

const IMG = {
  src: `${WP}/wp-content/uploads/photo.jpg`,
  alt: "Members at the table",
  caption: "Cap",
  credit: "© PN",
};

function renderBlocks(blocks: PostBlock[]) {
  return render(
    <main>
      <h1>Post</h1>
      <PostBlocks
        blocks={blocks}
        categories={site.categories}
        calendarUrl="/calendar/"
        wpOrigin={WP}
      />
    </main>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe("SinglePost", () => {
  it("hero, byline, dek, blocks, share row and read next — axe-clean; no rail by default", async () => {
    const { container } = render(
      <main>
        <SinglePost
          post={{ ...post, author: "Lorem Ipsum", dek: "A short dek." }}
          posts={[card]}
          categories={site.categories}
          blogUrl="/blog/"
          homeUrl="/"
          joinUrl={site.chapter.join_url}
          labels={postLabels(site)}
          wpOrigin={WP}
        />
      </main>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(post.title);
    expect(screen.getByText("LI")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("By Lorem Ipsum")).toBeInTheDocument();
    expect(screen.getByText("A short dek.")).toBeInTheDocument();
    expect(container.querySelector(".block-prose")).toHaveTextContent("Deterministic body prose");
    expect(container.querySelector(".block-pull-quote")).toBeInTheDocument();
    expect(container.querySelector("[data-post-hero]")).toBeNull(); // fixture has no featured image
    expect(screen.queryByRole("complementary", { name: "Post details" })).toBeNull();
    // Category pill links back to the filtered archive; breadcrumb from labels
    expect(screen.getByRole("link", { name: "Chapter-Wide" })).toHaveAttribute(
      "href",
      "/blog/?category=chapter",
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    // Read next: pool of one same-category card
    const readNext = container.querySelector("[data-read-next]")!;
    expect(within(readNext as HTMLElement).getByRole("heading", { level: 2 })).toHaveTextContent(
      "Read next",
    );
    expect(
      within(readNext as HTMLElement).getAllByRole("link", { name: /Contract Test Post/ }),
    ).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("meta rail: sticky aside with On this page anchors + Get involved card; featured image pulled up", async () => {
    const { container } = render(
      <main>
        <SinglePost
          post={{
            ...post,
            featuredImage: IMG,
            blocks: [{ type: "prose", html: '<h2 id="one">One</h2><p>a</p><h2>Two Words</h2>' }],
          }}
          showMetaRail
          joinUrl="/get-involved/#join"
          wpOrigin={WP}
        />
      </main>,
    );
    const aside = screen.getByRole("complementary", { name: "Post details" });
    const toc = within(aside).getByRole("navigation", { name: "On this page" });
    expect(within(toc).getByRole("link", { name: "One" })).toHaveAttribute("href", "#one");
    expect(within(toc).getByRole("link", { name: "Two Words" })).toHaveAttribute(
      "href",
      "#two-words",
    );
    expect(within(aside).getByRole("link", { name: "Join Now" })).toHaveAttribute(
      "href",
      "/get-involved/#join",
    );
    expect(container.querySelector("[data-post-hero] img")).toHaveAttribute("alt", IMG.alt);
    expect(container.querySelector("figcaption")).toHaveTextContent("Cap © PN");
    expect(container.querySelector("[data-read-next]")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("committee byline mode", () => {
    render(
      <SinglePost
        post={{ ...post, committee: "Housing Committee" }}
        bylineMode="committee"
        wpOrigin={WP}
      />,
    );
    expect(screen.getByText("By The Housing Committee")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  it("share row: copy link writes the URL, flips the label, announces, and resets", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(<SinglePost post={post} wpOrigin={WP} />);
    const copy = screen.getByRole("button", { name: "Copy link" });
    await act(async () => {
      copy.click();
    });
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(copy).toHaveTextContent("Copied ✓");
    expect(screen.getByRole("status")).toHaveTextContent("Link copied");
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(copy).toHaveTextContent("Copy link");
    expect(screen.getByRole("link", { name: "Email it" })).toHaveAttribute(
      "href",
      `mailto:?subject=${encodeURIComponent(post.title)}`,
    );
    vi.useRealTimers();
  });
});

describe("post blocks", () => {
  it("image: figure with caption/credit; breakout widens at lg", async () => {
    const { container } = renderBlocks([{ type: "image", image: IMG, breakout: true }]);
    const figure = container.querySelector(".block-image")!;
    expect(figure.className).toContain("lg:-mx-20");
    expect(within(figure as HTMLElement).getByRole("img")).toHaveAttribute("alt", IMG.alt);
    expect(figure.querySelector("figcaption")).toHaveTextContent("Cap © PN");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("gallery: essay leads wide; placeholders are decorative", async () => {
    const { container } = renderBlocks([
      {
        type: "gallery",
        layout: "essay",
        images: [IMG, { src: null, alt: "", caption: "Second" }],
      },
    ]);
    const figures = container.querySelectorAll(".block-gallery figure");
    expect(figures).toHaveLength(2);
    expect(figures[0]!.className).toContain("sm:col-span-2");
    expect(figures[1]!.querySelector("[aria-hidden='true']")).toHaveTextContent("Photo");
    expect(figures[1]!.querySelector("figcaption")).toHaveTextContent("Second");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("pull quote + person quote (quote carries its own lang)", async () => {
    const { container } = renderBlocks([
      { type: "pull_quote", quote: "Organize.", attribution: "A member" },
      {
        type: "person_quote",
        photo: null,
        alt: "",
        quote: "Sí se puede.",
        translation: "Yes we can.",
        name: "Ana",
        role: "Organizer",
        lang: "es",
      },
    ]);
    expect(container.querySelector(".block-pull-quote")).toHaveTextContent("— A member");
    const bq = container.querySelector(".block-person-quote blockquote")!;
    expect(bq).toHaveAttribute("lang", "es");
    expect(bq).toHaveTextContent("Sí se puede.");
    expect(container.querySelector(".block-person-quote")).toHaveTextContent("Ana · Organizer");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("video: facade → iframe on play; unsupported URL disables the button", async () => {
    expect(videoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
    );
    expect(videoEmbedUrl("https://vimeo.com/12345")).toBe(
      "https://player.vimeo.com/video/12345?autoplay=1",
    );
    expect(videoEmbedUrl("https://example.org/clip.mp4")).toBeNull();

    const user = userEvent.setup();
    const { container } = renderBlocks([
      {
        type: "video",
        url: "https://youtu.be/dQw4w9WgXcQ",
        poster: null,
        caption: "Rally recap",
        transcriptUrl: "/t/",
      },
      { type: "video", url: "https://example.org/x" },
    ]);
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole("link", { name: "Read transcript" })).toHaveAttribute("href", "/t/");
    expect(screen.getByRole("button", { name: /Video \(unavailable\)/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Play Video: Rally recap" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute(
      "src",
      expect.stringContaining("youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    );
    expect(frame).toHaveAttribute("title", "Video: Rally recap");
    expect(frame).toHaveFocus();
  });

  it("audio: play/pause toggles the hidden element; no file → static disabled player", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.dispatchEvent(new Event("pause"));
    });
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(
      () => play.mock.calls.length <= pause.mock.calls.length,
    );
    const user = userEvent.setup();
    const { container } = renderBlocks([
      {
        type: "audio",
        file: `${WP}/wp-content/uploads/ep1.mp3`,
        title: "Episode 1",
        duration: "12:30",
        transcriptUrl: "/t/",
      },
      { type: "audio", file: null, title: "Coming soon", transcriptUrl: "/t2/" },
    ]);
    expect(await axe(container)).toHaveNoViolations();
    const btn = screen.getByRole("button", { name: "Play audio: Episode 1" });
    expect(screen.getByText("12:30")).toBeInTheDocument();
    await user.click(btn);
    expect(play).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAccessibleName("Pause audio: Episode 1");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    await user.click(btn);
    expect(pause).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAccessibleName("Play audio: Episode 1");
    expect(screen.getByRole("button", { name: "Play audio: Coming soon" })).toBeDisabled();
    expect(screen.getByText("–:––")).toBeInTheDocument();
  });

  it("document: upload link stays on the WordPress origin with a named download", async () => {
    const { container } = renderBlocks([
      {
        type: "document",
        url: `${WP}/wp-content/uploads/bylaws.pdf`,
        title: "Bylaws",
        description: "PDF, 2 pages",
      },
    ]);
    expect(screen.getByRole("link", { name: "Download Bylaws" })).toHaveAttribute(
      "href",
      `${WP}/wp-content/uploads/bylaws.pdf`,
    );
    expect(screen.getByText("PDF, 2 pages")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("event embed: date tile, category, RSVP to the event page; null event → calendar fallback", async () => {
    const { container } = renderBlocks([
      { type: "event_embed", event: { ...event, url: `${WP}/events/rally/` } },
      { type: "event_embed", event: null },
    ]);
    const live = container.querySelectorAll(".block-event-embed")[0]!;
    expect(live).toHaveTextContent("SAT4JUL");
    expect(live).toHaveTextContent(`Upcoming event · Chapter`);
    expect(
      within(live as HTMLElement).getByRole("link", { name: `RSVP: ${event.title}` }),
    ).toHaveAttribute("href", "/events/rally/");
    expect(screen.getByText("This event is no longer scheduled.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the calendar" })).toHaveAttribute(
      "href",
      "/calendar/",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("action callout: primary/outline buttons re-homed through SiteLink", async () => {
    const { container } = renderBlocks([
      {
        type: "action_callout",
        heading: "Show up Saturday",
        body: "Bring a friend.",
        buttons: [
          { label: "RSVP", url: `${WP}/calendar/`, style: "primary" },
          { label: "Donate", url: "https://donate.example/", style: "outline" },
        ],
      },
    ]);
    expect(screen.getByRole("link", { name: "RSVP" })).toHaveAttribute("href", "/calendar/");
    const donate = screen.getByRole("link", { name: "Donate" });
    expect(donate).toHaveAttribute("rel", "noopener");
    expect(donate.className).toContain("border-2");
    expect(await axe(container)).toHaveNoViolations();
  });
});
