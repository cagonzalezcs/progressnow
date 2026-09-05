import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { ArrowGlyph } from "@/components/site/ArrowGlyph";
import { BlockA11yNote } from "@/components/site/BlockA11yNote";
import { BlockAgenda } from "@/components/site/BlockAgenda";
import { BlockGoodToKnow } from "@/components/site/BlockGoodToKnow";
import { BlockMap } from "@/components/site/BlockMap";
import { CtaCard } from "@/components/site/CtaCard";
import { DashedNote } from "@/components/site/DashedNote";
import { DuotoneImage } from "@/components/site/DuotoneImage";
import { EventBlocks } from "@/components/site/EventBlocks";
import { LinkListCard } from "@/components/site/LinkListCard";
import { PageHeader } from "@/components/site/PageHeader";
import { StarGlyph } from "@/components/site/StarGlyph";
import { SubscribeStrip } from "@/components/site/SubscribeStrip";
import { WordmarkLockup } from "@/components/site/WordmarkLockup";
import { CategoryTag } from "@/components/site/blog/CategoryTag";
import { EmailSubscribeStrip } from "@/components/site/blog/EmailSubscribeStrip";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import { BlockProse } from "@/components/site/blog/blocks/BlockProse";
import { BlockPullQuote } from "@/components/site/blog/blocks/BlockPullQuote";

/* Static site primitives (openspec next-test-harness § Component tests): each
 * renders from fixture-shaped props, keeps the Vue twin's semantics, and is
 * axe-clean. */
const WP = "https://wp.example";

describe("glyphs are decorative", () => {
  it("ArrowGlyph / StarGlyph are hidden from AT", async () => {
    const { container } = render(
      <p>
        Read more <ArrowGlyph /> <StarGlyph kind="sparkle" /> <StarGlyph kind="star-notch" />{" "}
        <StarGlyph />
      </p>,
    );
    expect(container.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(4);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("notes and event blocks", () => {
  it("DashedNote, BlockA11yNote, BlockGoodToKnow, BlockAgenda, BlockMap", async () => {
    const { container } = render(
      <main>
        <h1>Event</h1>
        <DashedNote heading="Who this is for">
          <p>Everyone.</p>
        </DashedNote>
        <BlockA11yNote html="<p>Ramp access. <a href='#'>Details</a></p>" />
        <BlockGoodToKnow items={["Bring water", "Kid friendly"]} heading="Bueno saber" />
        <BlockAgenda items={[{ title: "6:00", desc: "Doors" }, { title: "6:30" }]} />
        <BlockMap address="123 Main St, Anytown" />
      </main>,
    );
    expect(screen.getByText("Who this is for")).toBeInTheDocument();
    expect(screen.getByText("Accessibility & childcare")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Map to 123 Main St, Anytown" })).toBeInTheDocument();
    expect(screen.getByText("Bueno saber")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("EventBlocks dispatches every block type with translated headings", async () => {
    const { container } = render(
      <main>
        <h1>Event</h1>
        <EventBlocks
          headings={{
            agenda: "Programa",
            goodToKnow: "Bueno saber",
            a11yNote: "Accesibilidad",
            map: "Cómo llegar",
          }}
          blocks={[
            { type: "prose", html: "<p>Hola</p>" },
            { type: "agenda", items: [{ title: "6:00", desc: "Puertas" }] },
            { type: "good_to_know", items: ["Agua"] },
            { type: "a11y_note", html: "<p>Rampa</p>" },
            { type: "map", address: "Calle 1" },
          ]}
        />
      </main>,
    );
    for (const text of ["Hola", "Programa", "Bueno saber", "Accesibilidad", "Cómo llegar"])
      expect(screen.getByText(text)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("BlockProse renders kses'd HTML; BlockPullQuote quotes with attribution", async () => {
    const { container } = render(
      <main>
        <h1>Post</h1>
        <BlockProse html="<h2>Section</h2><p>Body</p>" />
        <BlockPullQuote quote="We win together." attribution="A member" />
      </main>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
    expect(screen.getByText("— A member")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("cards and strips", () => {
  it("CtaCard re-homes the WordPress URL and renders kses'd body", async () => {
    const { container } = render(
      <CtaCard
        title="Join us"
        body="<strong>Dues</strong> optional"
        href="https://wp.example/get-involved/"
        label="Get involved"
        wpOrigin={WP}
      />,
    );
    const link = screen.getByRole("link", { name: "Get involved" });
    expect(link).toHaveAttribute("href", "/get-involved/");
    expect(screen.getByText("Dues")).toBeInTheDocument();
    expect(container.querySelector("[data-tone='blue']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("LinkListCard is a nav with links, or a div with rows", async () => {
    const { container, rerender } = render(
      <LinkListCard
        heading="On this page"
        links={[
          { label: "Mission", href: "https://wp.example/about/#mission" },
          { label: "Bylaws", href: "https://wp.example/wp-content/uploads/bylaws.pdf" },
        ]}
        wpOrigin={WP}
      />,
    );
    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mission" })).toHaveAttribute(
      "href",
      "/about/#mission",
    );
    expect(screen.getByRole("link", { name: "Bylaws" })).toHaveAttribute(
      "href",
      "https://wp.example/wp-content/uploads/bylaws.pdf",
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <LinkListCard heading="Details" rows={[{ label: "When", value: "Tuesday" }]} wpOrigin={WP} />,
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
  });

  it("SubscribeStrip renders nothing without a URL and an ink band with one", async () => {
    const { container, rerender } = render(
      <SubscribeStrip href="" title="Stay in the loop" label="Subscribe" />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <main>
        <h1>Page</h1>
        <SubscribeStrip
          href="https://news.example/signup"
          title="Stay in the loop"
          lede="Monthly."
          label="Subscribe"
        />
        <EmailSubscribeStrip newsletterUrl="https://news.example/signup" />
      </main>,
    );
    expect(container.querySelectorAll("[data-tone='ink']")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Subscribe" })[0]).toHaveAttribute(
      "rel",
      "noopener",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("WordmarkLockup shows the chapter name with a decorative diamond", async () => {
    const { container } = render(
      <header>
        <WordmarkLockup name="Progress Now" size="footer" />
      </header>,
    );
    expect(screen.getByText("Progress Now")).toBeInTheDocument();
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("images and tags", () => {
  it("DuotoneImage keeps WordPress srcset and alt; ImageSlot placeholder is decorative", async () => {
    const { container } = render(
      <main>
        <h1>Post</h1>
        <DuotoneImage
          src="https://wp.example/wp-content/uploads/a.jpg"
          alt="Members marching"
          srcSet="a-400.jpg 400w, a-800.jpg 800w"
          sizes="(min-width: 768px) 50vw, 100vw"
          width={800}
          height={600}
          loading="lazy"
        />
        <div style={{ width: 100, height: 100 }}>
          <ImageSlot src={null} label="photo" />
        </div>
      </main>,
    );
    const img = screen.getByRole("img", { name: "Members marching" });
    expect(img).toHaveAttribute("srcset", "a-400.jpg 400w, a-800.jpg 800w");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(container.querySelector(".image-slot[aria-hidden='true']")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("CategoryTag resolves labels from the registry or WordPress overrides and links when given an href", async () => {
    const { container, rerender } = render(<CategoryTag catId="labor" />);
    expect(screen.getByText("Labor")).toBeInTheDocument();
    rerender(
      <CategoryTag
        catId="labor"
        categories={[{ id: "labor", label: "Trabajo", color: "#000" }]}
        href="https://wp.example/category/labor/"
        wpOrigin={WP}
        variant="text"
        size="sm"
      />,
    );
    expect(screen.getByRole("link", { name: "Trabajo" })).toHaveAttribute(
      "href",
      "/category/labor/",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PageHeader", () => {
  it("renders breadcrumb, h1, lede, slots; post variant balances the title", async () => {
    const { container, rerender } = render(
      <PageHeader
        title="About the Chapter"
        lede="Who we are"
        crumbs={[{ label: "Home", href: "https://wp.example/" }]}
        wpOrigin={WP}
        breadcrumbLabel="Miga de pan"
      >
        <p>Under the lede</p>
      </PageHeader>,
    );
    expect(screen.getByRole("navigation", { name: "Miga de pan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { level: 1, name: "About the Chapter" })).toHaveClass(
      "uppercase",
    );
    expect(container.querySelector("[aria-current='page']")).toHaveTextContent("About the Chapter");
    expect(screen.getByText("Under the lede")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    rerender(
      <PageHeader title="A post" variant="post" pullUp before={<span>Labor</span>} wpOrigin={WP} />,
    );
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveClass("uppercase");
    expect(screen.getByText("Labor")).toBeInTheDocument();
  });
});
