import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import blogPost from "@fixtures/blog-post.json";
import singlePost from "@fixtures/single-post.json";
import siteFixture from "@fixtures/site.json";
import { PostBlocks } from "@/components/site/blog/PostBlocks";
import type { BlogPost, PostBlock, SinglePostEnvelope, SiteEnvelope } from "@/lib/schemas";

/* One test per post_blocks type (openspec next-js-site-implementation task
 * 6.5; block-serialization spec). The fixture post carries `prose` and
 * `pull_quote`; the other eight are built on the fixture shapes so every
 * branch of PostBlocks renders, keeps heading order, and is axe-clean. */
const WP = "https://mock.example";
const site = siteFixture as unknown as SiteEnvelope;
const fixtureBlocks = (singlePost as unknown as SinglePostEnvelope).blocks;
const teaser = blogPost as unknown as BlogPost;

function renderBlocks(blocks: PostBlock[]) {
  return render(
    <main>
      <h1>Post</h1>
      <PostBlocks
        blocks={blocks}
        categories={site.categories}
        calendarHref="/calendar/"
        wpOrigin={WP}
      />
    </main>,
  );
}

const byType = (type: PostBlock["type"]) => fixtureBlocks.filter((b) => b.type === type);

describe("post blocks", () => {
  it("prose (fixture): kses HTML renders, h2 gets an anchor id, no inline handlers", async () => {
    const [prose] = byType("prose");
    expect(prose).toBeDefined();
    const { container } = renderBlocks([
      { type: "prose", html: `${(prose as { html: string }).html}<h2>Next steps</h2><p>Go.</p>` },
    ]);
    expect(container.querySelector(".block-prose")).toBeInTheDocument();
    expect(container.querySelector("h2#next-steps")).toHaveTextContent("Next steps");
    expect(container.querySelector("[onclick], script")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("pull_quote (fixture): blockquote with attribution", async () => {
    const [quote] = byType("pull_quote");
    expect(quote).toBeDefined();
    const { container } = renderBlocks([quote!]);
    const q = quote as { quote: string; attribution: string };
    expect(screen.getByText(q.quote)).toBeInTheDocument();
    if (q.attribution) expect(screen.getByText(new RegExp(q.attribution))).toBeInTheDocument();
    expect(container.querySelector("blockquote, figure, .block-pull-quote")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("image: figure with the envelope alt and caption/credit", async () => {
    const { container } = renderBlocks([
      {
        type: "image",
        image: {
          src: `${WP}/wp-content/uploads/a.jpg`,
          alt: "A crowd",
          caption: "Cap",
          credit: "© X",
        },
        breakout: true,
      },
    ]);
    expect(container.querySelector("figure.block-image img")).toHaveAttribute("alt", "A crowd");
    expect(screen.getByText("Cap")).toBeInTheDocument();
    expect(screen.getByText("© X")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("gallery: essay layout leads wide, null src draws the decorative placeholder", async () => {
    const { container } = renderBlocks([
      {
        type: "gallery",
        layout: "essay",
        images: [
          { src: `${WP}/g1.jpg`, alt: "One", caption: "First" },
          { src: null, alt: "" },
        ],
      },
    ]);
    const figures = container.querySelectorAll(".block-gallery figure");
    expect(figures).toHaveLength(2);
    expect(figures[0]).toHaveClass("sm:col-span-2");
    expect(figures[0]!.querySelector("img")).toHaveAttribute("alt", "One");
    expect(figures[1]!.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("person_quote: quote, translation, name and role; lang attribute on the quote", async () => {
    const { container } = renderBlocks([
      {
        type: "person_quote",
        photo: null,
        alt: "",
        quote: "Sí se puede",
        translation: "Yes we can",
        name: "Ana",
        role: "Member",
        lang: "es",
      },
    ]);
    expect(screen.getByText(/Sí se puede/)).toBeInTheDocument();
    expect(screen.getByText(/Yes we can/)).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText(/Member/)).toBeInTheDocument();
    expect(container.querySelector("[lang='es']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("video: click-to-load facade with a named play control and transcript link", async () => {
    const { container } = renderBlocks([
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=abcdef12345",
        caption: "Rally clip",
        transcriptUrl: "/transcripts/rally.txt",
      },
    ]);
    expect(screen.getByRole("button", { name: "Play video" })).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("link", { name: "Read transcript" })).toHaveAttribute(
      "href",
      "/transcripts/rally.txt",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("audio: play control is named after the title and disabled without a file; transcript required", async () => {
    const { container } = renderBlocks([
      { type: "audio", file: null, title: "Episode 1", duration: "12:00", transcriptUrl: "/a.txt" },
    ]);
    expect(screen.getByRole("button", { name: /Play audio: Episode 1/ })).toBeDisabled();
    expect(screen.getByText("12:00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read transcript" })).toHaveAttribute("href", "/a.txt");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("document: download link stays absolute to WordPress uploads", async () => {
    const { container } = renderBlocks([
      {
        type: "document",
        url: `${WP}/wp-content/uploads/bylaws.pdf`,
        title: "Bylaws",
        description: "PDF, 2 pages",
      },
    ]);
    expect(screen.getByText("Bylaws")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Download/ })).toHaveAttribute(
      "href",
      `${WP}/wp-content/uploads/bylaws.pdf`,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("event_embed: an event renders as a card; null falls back to the calendar link", async () => {
    const { container, unmount } = renderBlocks([
      {
        type: "event_embed",
        event: {
          id: "e1",
          date: "2026-07-04",
          time: "6:00 PM",
          cat: "chapter",
          title: "General meeting",
          location: "Union Hall",
          desc: "",
          url: `${WP}/events/general-meeting/`,
        },
      },
    ]);
    expect(screen.getByRole("link", { name: /General meeting/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    renderBlocks([{ type: "event_embed", event: null }]);
    expect(screen.getByRole("link", { name: "See the calendar" })).toHaveAttribute(
      "href",
      "/calendar/",
    );
  });

  it("action_callout: heading, body and buttons re-homed onto the app origin", async () => {
    const { container } = renderBlocks([
      {
        type: "action_callout",
        heading: "Take action",
        body: "Show up Tuesday.",
        buttons: [
          { label: "RSVP", url: `${WP}/events/x/`, style: "primary" },
          { label: "Read more", url: `${WP}/blog/${teaser.slug}/`, style: "outline" },
        ],
      },
    ]);
    expect(screen.getByText("Take action")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RSVP" })).toHaveAttribute("href", "/events/x/");
    expect(screen.getByRole("link", { name: "Read more" })).toHaveAttribute(
      "href",
      `/blog/${teaser.slug}/`,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
