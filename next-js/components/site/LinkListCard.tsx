import { SiteLink } from "@/components/site/SiteLink";

/* Sidebar link-list card (openspec progress-now-v4-blog D2 / -interior-404
 * D1): white radius-20 card, uppercase 800 heading, accent 700 links. The
 * `rows` variant renders label/value pairs. Rendered as a <nav> when `links`
 * are given. Twin of views/partials/link-list-card.twig. */
export interface LinkListCardProps {
  heading: string;
  links?: { label: string; href: string; external?: boolean }[];
  rows?: { label: string; value: string }[];
  id?: string;
  ariaLabel?: string;
  wpOrigin: string;
}

export function LinkListCard({
  heading,
  links = [],
  rows = [],
  id,
  ariaLabel,
  wpOrigin,
}: LinkListCardProps) {
  const Tag = links.length ? "nav" : "div";
  return (
    <Tag
      id={id}
      aria-label={links.length ? ariaLabel || heading : undefined}
      className="link-list-card flex flex-col gap-[9px] rounded-[16px] bg-white px-[22px] py-5 shadow-card lg:gap-2.5 lg:rounded-[20px] lg:px-[26px] lg:py-6"
    >
      <div className="mb-0.5 text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-ink lg:mb-1 lg:text-base">
        {heading}
      </div>
      {links.map((link) => (
        <SiteLink
          key={link.href + link.label}
          href={link.href}
          wpOrigin={wpOrigin}
          target={link.external ? "_blank" : undefined}
          className="text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 lg:text-[0.98rem]"
        >
          {link.label}
        </SiteLink>
      ))}
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-0.5">
          <span className="row-label text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-muted">
            {row.label}
          </span>
          <span className="text-[0.98rem] font-semibold text-ink">{row.value}</span>
        </div>
      ))}
    </Tag>
  );
}
