import { ArrowGlyph } from "@/components/site/ArrowGlyph";
import { DuotoneImage } from "@/components/site/DuotoneImage";
import { WordmarkLockup } from "@/components/site/WordmarkLockup";
import { H3, Section } from "@/components/site/styleguide/Section";
import { cn } from "@/lib/utils";

/* Brand tokens (ported from the Nuxt Styleguide.vue): palette, category
 * colors, type, wordmark, pills, chips, cards, tone bands, photo slot, radius
 * and shadows — every value a Tailwind utility off the shared stylesheet. */
const PALETTE = [
  {
    name: "brand",
    hex: "#1848D8",
    role: "Bands, pills, chips, duotone multiply",
    className: "bg-brand",
    dark: true,
  },
  {
    name: "brand-deep",
    hex: "#0F2E9C",
    role: "Hover / invert fill, headline offset",
    className: "bg-brand-deep",
    dark: true,
  },
  {
    name: "accent",
    hex: "#0E62E6",
    role: "Links, eyebrows, arrow links, filled buttons",
    className: "bg-accent",
    dark: true,
  },
  {
    name: "brand-light",
    hex: "#A9C7FF",
    role: "Light band, dashed borders, stars — never text on it",
    className: "bg-brand-light",
    dark: false,
  },
  { name: "alt", hex: "#F2F5FB", role: "Alternate band", className: "bg-alt", dark: false },
  { name: "ink", hex: "#1B1B22", role: "Body text, dark bands", className: "bg-ink", dark: true },
  {
    name: "yellow",
    hex: "#FFC800",
    role: "Wordmark diamond, panel border, strip stars",
    className: "bg-yellow",
    dark: false,
  },
  {
    name: "muted",
    hex: "#4A5568",
    role: "Muted text on white / alt (7.5:1)",
    className: "bg-muted",
    dark: true,
  },
  {
    name: "muted-on-ink",
    hex: "#C3CBE2",
    role: "Muted text on ink (10.6:1)",
    className: "bg-muted-on-ink",
    dark: false,
  },
  {
    name: "text-body",
    hex: "#3A3F4E",
    role: "Long-form prose",
    className: "bg-text-body",
    dark: true,
  },
  {
    name: "line",
    hex: "#D9E1F2",
    role: "1px hairlines on white / alt",
    className: "bg-line",
    dark: false,
  },
  {
    name: "control",
    hex: "#C6CFE4",
    role: "Inputs, inactive chips, popover borders",
    className: "bg-control",
    dark: false,
  },
  {
    name: "control-faint",
    hex: "#E3E8F4",
    role: "Inner dividers, striped placeholders",
    className: "bg-control-faint",
    dark: false,
  },
  {
    name: "border-muted",
    hex: "#9DA9C4",
    role: "Dashed empty-state / note borders",
    className: "bg-border-muted",
    dark: false,
  },
  {
    name: "cta-card",
    hex: "#3E4480",
    role: "CTA panel card fill",
    className: "bg-cta-card",
    dark: true,
  },
  {
    name: "ink-hairline",
    hex: "#33333E",
    role: "1px hairline on ink bands",
    className: "bg-ink-hairline",
    dark: true,
  },
];

const CATEGORY_COLORS = [
  { name: "chapter — Chapter-Wide", className: "bg-cat-chapter" },
  { name: "poled — Political Education", className: "bg-cat-poled" },
  { name: "mutual — Mutual Aid", className: "bg-cat-mutual" },
  { name: "labor — Labor", className: "bg-cat-labor" },
  { name: "electoral — Electoral", className: "bg-cat-electoral" },
  { name: "social — Social", className: "bg-cat-social" },
];

const RADII = [
  { name: "radius-sm (shadcn)", px: "4px", className: "rounded-sm" },
  { name: "radius-md (shadcn)", px: "6px", className: "rounded-md" },
  { name: "radius-lg (shadcn)", px: "8px", className: "rounded-lg" },
  { name: "radius-xl (shadcn)", px: "12px", className: "rounded-xl" },
  { name: "popover", px: "14px", className: "rounded-[14px]" },
  { name: "card", px: "18px", className: "rounded-[18px]" },
  { name: "photo", px: "24px", className: "rounded-[24px]" },
  { name: "pill", px: "999px", className: "rounded-full" },
];

const SHADOWS = [
  "shadow-card",
  "shadow-card-hover",
  "shadow-header",
  "shadow-popover",
  "shadow-featured",
  "shadow-photo",
];

const STATIC = "/wp-content/themes/progressnow/static/images/brand";
const PHOTO_SLOTS = [
  { name: "Hero", opacity: 0.38, src: `${STATIC}/hero-photo.jpg` },
  { name: "Who we are / cards", opacity: 0.3, src: `${STATIC}/who-photo.jpg` },
  { name: "Figures / post image", opacity: 0.25, src: `${STATIC}/about-photo.jpg` },
  { name: "Thumbnails", opacity: 0, src: `${STATIC}/hero-photo.jpg` },
];

const PILL_BLUE =
  "box-border inline-flex h-[42px] items-center rounded-full bg-white px-[22px] font-display text-[0.95rem] font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white";

export const BRAND_TOC = [
  { id: "colors", label: "Palette" },
  { id: "type", label: "Type" },
  { id: "wordmark", label: "Wordmark lockup" },
  { id: "pills", label: "Pills" },
  { id: "chips", label: "Chips" },
  { id: "cards", label: "Cards" },
  { id: "tones", label: "Tone bands" },
  { id: "photo", label: "Photo slot" },
  { id: "radius", label: "Radius & shadows" },
];

export function BrandSections() {
  return (
    <>
      <Section id="colors" title="Palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PALETTE.map((c) => (
            <div key={c.name} className="overflow-hidden rounded-[14px] border border-line">
              <div
                className={cn(
                  c.className,
                  "flex h-16 items-end px-2 pb-1.5 font-mono text-xs",
                  c.dark ? "text-white" : "text-ink",
                )}
              >
                {c.hex}
              </div>
              <div className="bg-white px-2 py-1.5">
                <p className="text-xs font-bold">{c.name}</p>
                <p className="text-[0.7rem] leading-snug text-muted">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
        <h3 className={H3}>Event categories</h3>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_COLORS.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 rounded-[8px] border border-control bg-white px-3 py-1.5"
            >
              <span className={cn(c.className, "inline-block size-3 rounded-sm")} />
              <span className="text-xs font-bold uppercase">{c.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="type" title="Type">
        <div className="space-y-6">
          <div data-tone="blue" className="rounded-[18px] bg-brand px-6 py-8 text-white">
            <p className="hero-headline">A better tomorrow is possible!</p>
            <p className="mt-2 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-brand-light">
              Hero H1 — Bowlby One, 0.09em deep-blue offset
            </p>
          </div>
          <p className="font-display text-[clamp(2rem,3.6vw,3.1rem)] font-normal leading-[1.1] text-ink">
            Section H2 — Bowlby One
          </p>
          <p className="font-display text-[1.5rem] font-normal leading-[1.2] text-ink">
            Card / in-content title — Bowlby One
          </p>
          <p className="text-base font-extrabold uppercase tracking-[0.04em] text-accent">
            Eyebrow — Public Sans 800, tracked
          </p>
          <p className="max-w-[34ch] text-[1.35rem] font-semibold leading-[1.4]">
            Lede — Public Sans 600. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <p className="max-w-[60ch] text-lg leading-relaxed text-text-body">
            Body — Public Sans 500. Our community deserves an economy and a government that put
            working people first. <strong className="font-bold text-ink">Emphasis is 700.</strong>
          </p>
          <p className="font-display text-[1.06rem] font-normal">Nav link — Bowlby One 1.06rem</p>
          <p className="font-sans text-[1.7rem] font-extrabold text-accent">
            01 · 02 · 03 — numerals 800
          </p>
          <p className="font-brush text-[clamp(1.8rem,5.4vw,4.8rem)] uppercase leading-[1.1] text-brand">
            Progress now, not someday!
          </p>
        </div>
      </Section>

      <Section
        id="wordmark"
        title="Wordmark lockup"
        note="Default header/footer logo while none is uploaded (yellow diamond + chapter name); an uploaded logo replaces it at the same height, max 240px wide."
      >
        <div
          className="flex flex-wrap items-center gap-8 rounded-[18px] bg-brand px-6 py-6"
          data-tone="blue"
        >
          <WordmarkLockup name="Progress Now" size="header" />
          <WordmarkLockup name="Progress Now" size="tablet" />
          <WordmarkLockup name="Progress Now" size="mobile" />
        </div>
      </Section>

      <Section id="pills" title="Pills">
        <div
          className="flex flex-wrap items-center gap-4 rounded-[18px] bg-brand p-6"
          data-tone="blue"
        >
          <a href="#sg-pills" className={PILL_BLUE}>
            Join Now
          </a>
          <a
            href="#sg-pills"
            className="box-border inline-flex h-11 items-center rounded-full bg-white px-4 font-display text-[0.82rem] font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white"
          >
            Join
          </a>
          <a
            href="#sg-pills"
            className="inline-flex items-center rounded-full bg-white px-11 py-4 font-display text-[1.15rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white"
          >
            JOIN NOW
          </a>
          <a
            href="#sg-pills"
            className="inline-flex items-center gap-[22px] rounded-[16px] border-2 border-dashed border-brand-light px-7 py-[18px] text-[1.25rem] font-bold leading-[1.35] text-white no-underline hover:bg-[rgba(169,199,255,0.14)]"
          >
            Dashed CTA link
          </a>
        </div>
        <div
          className="mt-4 flex flex-wrap items-center gap-4 rounded-[18px] bg-alt p-6"
          data-tone="alt"
        >
          <a
            href="#sg-pills"
            className="inline-flex items-center rounded-full bg-accent px-7 py-3 font-display text-[0.95rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep"
          >
            Accent fill
          </a>
          <a
            href="#sg-pills"
            className="inline-flex items-center rounded-full border-2 border-brand bg-transparent px-7 py-[10px] font-display text-[0.95rem] font-normal text-brand no-underline transition-colors hover:bg-brand hover:text-white"
          >
            Outline
          </a>
          <a
            href="#sg-pills"
            className="inline-flex items-center gap-4 text-[1.05rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4"
          >
            Arrow link <ArrowGlyph />
          </a>
        </div>
        <div
          className="mt-4 flex flex-wrap items-center gap-4 rounded-[18px] bg-ink p-6"
          data-tone="ink"
        >
          <a
            href="#sg-pills"
            className="inline-flex items-center rounded-full bg-white px-[22px] py-2.5 text-[0.95rem] font-bold text-ink no-underline transition-colors hover:bg-brand-deep hover:text-white"
          >
            White on ink
          </a>
          <a
            href="#sg-pills"
            className="inline-flex items-center rounded-full border-2 border-muted px-[21px] py-[9px] text-[0.95rem] font-bold text-white no-underline transition-colors hover:border-white"
          >
            Outline on ink
          </a>
          <a
            href="#sg-pills"
            className="text-[0.95rem] font-bold text-white underline underline-offset-4 hover:text-brand-light"
          >
            Ink link →
          </a>
        </div>
      </Section>

      <Section id="chips" title="Chips">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-[8px] bg-brand px-2.5 py-1 text-[0.72rem] font-bold leading-[1.25] text-white">
            Category
          </span>
          <span className="rounded-full bg-brand px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white">
            On
          </span>
          <span className="rounded-full border border-control px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-muted">
            Off
          </span>
          <span className="inline-flex flex-col items-center rounded-[12px] bg-brand px-3.5 py-2.5 text-white">
            <span className="text-[1.3rem] font-extrabold leading-[1.1]">12</span>
            <span className="text-[0.72rem] font-bold tracking-[0.1em]">SEP</span>
          </span>
          <span className="rounded-full border border-control bg-white px-3.5 py-1.5 text-[0.85rem] font-bold text-ink">
            Filter chip
          </span>
          <span className="rounded-full border border-ink bg-ink px-3.5 py-1.5 text-[0.85rem] font-bold text-white">
            Filter chip · active
          </span>
        </div>
      </Section>

      <Section id="cards" title="Cards">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-[18px] bg-white p-6 shadow-card">
            <p className="text-[0.85rem] font-extrabold uppercase tracking-[0.08em] text-accent">
              Eyebrow
            </p>
            <p className="font-display text-[1.25rem] leading-[1.25] text-ink">White card</p>
            <p className="text-[0.98rem] leading-[1.6] text-text-body">
              Radius 18, soft ink shadow. Hover lifts to shadow-card-hover.
            </p>
          </div>
          <div
            className="flex flex-col gap-3 rounded-[18px] bg-cta-card p-6 text-white"
            data-tone="ink"
          >
            <p className="font-display text-[1.7rem] text-brand-light">01</p>
            <p className="text-[1.18rem] font-extrabold">Ink card</p>
            <p className="text-base leading-[1.65] text-muted-on-ink">
              Steps on the ink band; numerals in brand-light.
            </p>
          </div>
          <div
            className="flex flex-col gap-3 rounded-[16px] border-2 border-dashed border-border-muted bg-alt p-6"
            data-tone="alt"
          >
            <p className="text-[1.05rem] font-extrabold text-ink">Dashed note</p>
            <p className="text-[0.98rem] leading-[1.6] text-text-body">
              Empty states and side notes on the alt band.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="tones"
        title="Tone bands"
        note={
          <>
            The Aa widget (desktop and tablet) toggles text size, high contrast and reduce motion.
            The mobile menu exposes text size only — visitors zoom or use OS-level contrast / motion
            settings, which the site honors (<code>prefers-reduced-motion</code>).
          </>
        }
      >
        <div className="overflow-hidden rounded-[18px] border border-line">
          <div data-tone="blue" className="bg-brand px-6 py-8 text-white">
            <p className="font-display uppercase">data-tone=&quot;blue&quot;</p>
            <p className="text-sm text-brand-light">High contrast → #0F2E9C; focus ring white</p>
          </div>
          <div data-tone="white" className="bg-white px-6 py-8 text-ink">
            <p className="font-display uppercase">data-tone=&quot;white&quot;</p>
            <p className="text-sm text-muted">High contrast → white / black; focus ring ink</p>
          </div>
          <div data-tone="alt" className="bg-alt px-6 py-8 text-ink">
            <p className="font-display uppercase">data-tone=&quot;alt&quot;</p>
            <p className="text-sm text-muted">High contrast → white / black; focus ring ink</p>
          </div>
          <div data-tone="ink" className="bg-ink px-6 py-8 text-white">
            <p className="font-display uppercase">data-tone=&quot;ink&quot;</p>
            <p className="text-sm text-muted-on-ink">
              High contrast → black / white; focus ring white
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="photo"
        title="Photo slot"
        note={
          <>
            <code>DuotoneImage</code> / <code>partials/duotone.twig</code>: full-color photo slot
            that clips to the card radius (the duotone treatment was retired 2026-09-05). Slot
            images with known sizes may use <code>next/image</code>; in-content photos keep
            WordPress&apos; srcset.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {PHOTO_SLOTS.map((slot) => (
            <figure key={slot.name} className="m-0">
              <DuotoneImage
                src={slot.src}
                alt=""
                opacity={slot.opacity}
                className="rounded-[14px]"
                imgClass="block aspect-[4/3] w-full object-cover"
              />
              <figcaption className="mt-2 text-xs font-bold">
                {slot.name}{" "}
                <span className="font-mono font-normal text-muted">· {slot.opacity}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="radius" title="Radius scale">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div
              key={r.name}
              className={cn(
                r.className,
                "flex h-16 min-w-32 flex-col items-center justify-center border-2 border-brand bg-alt px-4 text-center",
              )}
            >
              <span className="text-xs font-bold">{r.name}</span>
              <span className="font-mono text-xs text-muted">{r.px}</span>
            </div>
          ))}
        </div>
        <h3 className={H3}>Shadows</h3>
        <div className="flex flex-wrap gap-8">
          {SHADOWS.map((s) => (
            <div key={s} className={cn(s, "rounded-[14px] bg-white px-6 py-4 text-sm font-bold")}>
              {s}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
