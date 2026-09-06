import { A11yWidget } from "@/components/site/A11yWidget";
import { CtaCard } from "@/components/site/CtaCard";
import { DashedNote } from "@/components/site/DashedNote";
import { EventBlocks } from "@/components/site/EventBlocks";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { LinkListCard } from "@/components/site/LinkListCard";
import { PageHeader } from "@/components/site/PageHeader";
import { StarGlyph } from "@/components/site/StarGlyph";
import { SubscribeStrip } from "@/components/site/SubscribeStrip";
import { CategoryTag } from "@/components/site/blog/CategoryTag";
import { ImageSlot } from "@/components/site/blog/ImageSlot";
import { BlockPullQuote } from "@/components/site/blog/blocks/BlockPullQuote";
import { Section } from "@/components/site/styleguide/Section";
import {
  SAMPLE_EVENT_BLOCKS,
  SAMPLE_FAQ,
  SAMPLE_LINKS,
  SAMPLE_ROWS,
  SAMPLE_WP_ORIGIN,
} from "@/components/site/styleguide/samples";

/* Site components on the tone bands (openspec next-design-system § Visual
 * parity surface). Grows as routes land in group 6 (cards, calendar, post
 * blocks, header/footer). */
export const SITE_TOC = [
  { id: "page-header", label: "Page header" },
  { id: "a11y-widget", label: "Aa widget" },
  { id: "sidebar-cards", label: "Sidebar cards" },
  { id: "category-tag", label: "Category tag" },
  { id: "image-slot", label: "Image slot" },
  { id: "event-blocks", label: "Event blocks" },
  { id: "pull-quote", label: "Pull quote" },
  { id: "faq", label: "FAQ accordion" },
  { id: "subscribe", label: "Subscribe strip" },
  { id: "glyphs", label: "Glyphs" },
];

export function SiteComponentSections() {
  return (
    <>
      <Section
        id="page-header"
        title="Page header"
        note="variant=page (interior) and variant=post (single-post hero, pullUp for the overlapping featured image)."
      >
        <div
          className="flex flex-col gap-6 overflow-hidden rounded-[18px]"
          data-testid="sg-page-header-demo"
        >
          <PageHeader
            titleAs="h3"
            title="About the Chapter"
            lede="Who we are, how we decide, and how to plug in."
            crumbs={[{ label: "Home", href: `${SAMPLE_WP_ORIGIN}/` }]}
            wpOrigin={SAMPLE_WP_ORIGIN}
          />
          <PageHeader
            titleAs="h3"
            title="Know your rights on the job"
            variant="post"
            pullUp
            breadcrumbLabel="Post breadcrumb"
            crumbs={[
              { label: "Home", href: `${SAMPLE_WP_ORIGIN}/` },
              { label: "Blog", href: `${SAMPLE_WP_ORIGIN}/blog/` },
            ]}
            wpOrigin={SAMPLE_WP_ORIGIN}
            before={<CategoryTag catId="labor" variant="white" />}
          >
            <p className="m-0 text-[0.95rem] font-semibold">
              By the Labor committee · May 12, 2026 · 6 min read
            </p>
          </PageHeader>
        </div>
      </Section>

      <Section
        id="a11y-widget"
        title="Aa widget"
        note="Text size / high contrast / reduce motion, persisted as chapter-a11y. Open it to preview the styleguide in every mode."
      >
        <div
          className="flex flex-wrap items-center gap-6 rounded-[18px] bg-brand p-6"
          data-tone="blue"
          data-testid="sg-a11y-widget-demo"
        >
          <A11yWidget size="desktop" />
          <A11yWidget size="tablet" />
        </div>
      </Section>

      <Section id="sidebar-cards" title="Sidebar cards">
        <div
          className="grid gap-6 rounded-[18px] bg-alt p-6 md:grid-cols-3"
          data-tone="alt"
          data-testid="sg-sidebar-cards-demo"
        >
          <LinkListCard heading="On this page" links={SAMPLE_LINKS} wpOrigin={SAMPLE_WP_ORIGIN} />
          <LinkListCard heading="Details" rows={SAMPLE_ROWS} wpOrigin={SAMPLE_WP_ORIGIN} />
          <div className="flex flex-col gap-6">
            <CtaCard
              title="Ready to join?"
              body="Dues are <strong>sliding scale</strong> — nobody is turned away."
              href={`${SAMPLE_WP_ORIGIN}/get-involved/`}
              label="Get involved"
              wpOrigin={SAMPLE_WP_ORIGIN}
            />
            <DashedNote heading="Who this is for">
              <p>Anyone who wants to organize where they live and work.</p>
            </DashedNote>
          </div>
        </div>
      </Section>

      <Section
        id="category-tag"
        title="Category tag"
        note="solid · white · text, sm / md; every category reads brand blue on v4."
      >
        <div
          className="flex flex-wrap items-center gap-4 rounded-[18px] bg-white p-6 shadow-card"
          data-testid="sg-category-tag-demo"
        >
          <CategoryTag catId="labor" />
          <CategoryTag catId="mutual" size="sm" />
          <CategoryTag
            catId="electoral"
            variant="text"
            href={`${SAMPLE_WP_ORIGIN}/category/electoral/`}
            wpOrigin={SAMPLE_WP_ORIGIN}
          />
          <span
            className="rounded-[12px] bg-brand p-3"
            data-tone="blue"
            data-testid="sg-category-tag-on-blue"
          >
            <CategoryTag catId="social" variant="white" />
          </span>
        </div>
      </Section>

      <Section
        id="image-slot"
        title="Image slot"
        note="A real image renders full-color; a null src draws the striped placeholder (decorative)."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="sg-image-slot-demo">
          <div
            className="aspect-[4/3] overflow-hidden rounded-[14px]"
            data-testid="sg-image-slot-real"
          >
            <ImageSlot
              src="/wp-content/themes/progressnow/static/images/brand/who-photo.jpg"
              alt="Members at a community fridge"
            />
          </div>
          <div
            className="aspect-[4/3] overflow-hidden rounded-[14px]"
            data-testid="sg-image-slot-empty"
          >
            <ImageSlot src={null} label="photo" />
          </div>
        </div>
      </Section>

      <Section
        id="event-blocks"
        title="Event blocks"
        note="event_body flexible content: prose, agenda, good to know, accessibility note, map."
      >
        <div className="flex max-w-[760px] flex-col gap-6" data-testid="sg-event-blocks-demo">
          <EventBlocks blocks={SAMPLE_EVENT_BLOCKS} />
        </div>
      </Section>

      <Section id="pull-quote" title="Pull quote">
        <div className="max-w-[760px]" data-testid="sg-pull-quote-demo">
          <BlockPullQuote
            quote="When we fight, we win — and we only fight together."
            attribution="A steward at the plant"
          />
        </div>
      </Section>

      <Section
        id="faq"
        title="FAQ accordion"
        note="Radix disclosure: one open, arrow keys move between questions, aria-expanded on every trigger."
      >
        <div className="max-w-[760px]" data-testid="sg-faq-demo">
          <FaqAccordion items={SAMPLE_FAQ} />
        </div>
      </Section>

      <Section
        id="subscribe"
        title="Subscribe strip"
        note="Renders nothing without a newsletter URL in Chapter Settings."
      >
        <div className="overflow-hidden rounded-[18px]" data-testid="sg-subscribe-demo">
          <SubscribeStrip
            href="https://example.org/newsletter"
            title="Stay in the loop"
            lede="One email a month. No spam, no lists sold — ever."
            label="Subscribe"
            testId="sg-subscribe-strip"
          />
        </div>
      </Section>

      <Section
        id="glyphs"
        title="Glyphs"
        note="Inline SVG so fill: currentColor takes the placement's text color."
      >
        <div
          className="flex flex-wrap items-center gap-8 rounded-[18px] bg-brand-light p-6 text-brand"
          data-testid="sg-glyphs-demo"
        >
          <StarGlyph />
          <StarGlyph kind="star-notch" className="w-[44px]" />
          <StarGlyph kind="sparkle" className="w-[40px]" />
          <span className="text-yellow" data-testid="sg-glyph-yellow">
            <StarGlyph className="w-[36px]" />
          </span>
        </div>
      </Section>
    </>
  );
}
