import { SiteLink } from "@/components/site/SiteLink";
import { cn } from "@/lib/utils";

/* Ink action callout (openspec gutenberg-post-blocks § action_callout). The
 * heading is a styled div, not an <hN>: callouts sit between prose sections
 * and must not perturb the article outline the sidebar "On this page" reads. */
export function BlockActionCallout({
  heading,
  body,
  buttons,
  wpOrigin,
}: {
  heading: string;
  body: string;
  buttons: { label: string; url: string; style: "primary" | "outline" }[];
  wpOrigin: string;
}) {
  return (
    <aside
      className="block-action-callout flex w-full flex-col gap-4 rounded-[16px] bg-ink px-6 py-7 text-white md:gap-[18px] md:rounded-[20px] md:px-10 md:py-9"
      data-tone="ink"
      data-testid="block-action-callout"
    >
      <div
        className="max-w-[24ch] font-display text-[1.25rem] font-normal leading-[1.2] md:text-[clamp(1.4rem,2.4vw,1.9rem)]"
        data-testid="block-action-callout-heading"
      >
        {heading}
      </div>
      <p
        className="m-0 max-w-[56ch] text-base leading-[1.6] text-muted-on-ink md:text-[1.05rem]"
        data-testid="block-action-callout-body"
      >
        {body}
      </p>
      <div className="flex flex-wrap gap-3.5" data-testid="block-action-callout-buttons">
        {buttons.map((btn) => (
          <SiteLink
            key={btn.label + btn.url}
            href={btn.url}
            wpOrigin={wpOrigin}
            className={cn(
              "rounded-full px-[26px] py-3 font-display text-[0.9rem] font-normal tracking-[0.04em] no-underline transition-colors",
              btn.style === "primary"
                ? "bg-white text-ink hover:bg-brand-deep hover:text-white"
                : "border-2 border-ink-hairline bg-transparent text-white hover:border-white",
            )}
            data-testid="block-action-callout-button"
            data-button-style={btn.style}
          >
            {btn.label}
          </SiteLink>
        ))}
      </div>
    </aside>
  );
}
