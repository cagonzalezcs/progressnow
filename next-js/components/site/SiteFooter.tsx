import { SiteLink } from "@/components/site/SiteLink";
import { WordmarkLockup } from "@/components/site/WordmarkLockup";
import type { SiteEnvelope } from "@/lib/schemas";

/* v4 footer (design D7; openspec site-chrome § Site footer): lockup or uploaded
 * logo, tagline, social icon links (only configured ones), three link columns
 * (WordPress `footer` menus override the defaults), and the blue bottom bar
 * with the accessibility line. Port of the Vue SiteFooter. */
type FooterColumn = { title: string; links: { label: string; href: string; external?: boolean }[] };

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "About",
    links: [
      { label: "About the Chapter", href: "/about/" },
      { label: "Mission & History", href: "/about/#mission" },
      { label: "Where We Organize", href: "/about/#counties" },
      { label: "Bylaws & Code of Conduct", href: "/about/#bylaws" },
      { label: "FAQ", href: "/about/#faq" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { label: "Join Now", href: "/get-involved/#join", external: true },
      { label: "Event Calendar", href: "/calendar/" },
      { label: "Committees", href: "/get-involved/#committees" },
      { label: "Communication Channels", href: "/get-involved/#channels" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog/" },
      { label: "Documents & Minutes", href: "/bylaws-code-of-conduct/#documents" },
      { label: "Education Library", href: "/bylaws-code-of-conduct/" },
      { label: "Grievance Contact", href: "/bylaws-code-of-conduct/#grievance" },
    ],
  },
];

/* Designer-supplied glyphs (static/images/brand/icon-*.svg, fill → currentColor). */
const ICONS: Record<string, { viewBox: string; paths: string[] }> = {
  twitter: {
    viewBox: "0 0 26.51 21.75",
    paths: [
      "M25.94.46c.29.24-1.53,2.44-1.97,2.68l2.54-.28c-.26.92-2.33,2.07-2.49,2.59-.35,1.2-.24,3.46-.65,4.99-2.72,10.21-14.47,14.13-23.38,9.19l4.45-.76c.52-.15,3.13-1.26,3.15-1.64.01-.21-2.8-.95-3.66-1.97-.18-.21-1.22-2.05-1.12-2.12.27-.2,1.84.37,1.97-.28-1.44-.03-2.75-1.53-3.32-2.74-1.82-3.89.74-1.61,1.35-2.06.11-.08-1.23-1.69-1.47-2.34-.32-.89-.63-4.7.48-4.71.27,0,3,2.89,4.08,3.53,1,.59,6.35,2.8,7.06,2.11.08-.08-.05-1.87.02-2.37.5-3.41,4.71-5.16,7.75-3.85.71.31,1.17,1.08,1.97,1.14.89.06,3-1.3,3.23-1.12Z",
    ],
  },
  instagram: {
    viewBox: "0 0 26.29 26.28",
    paths: [
      "M6.59.24c2.73-.37,12.84-.38,15.12.53,2.6,1.04,4.06,3.31,4.38,6.06.31,2.67.34,12.45-.48,14.69-.99,2.69-3.34,4.24-6.15,4.57-2.67.31-12.45.34-14.69-.48C1.97,24.57.47,22.11.18,19.2-.1,16.39-.15,6.88.78,4.57,1.78,2.06,3.93.6,6.59.24ZM7.73,2.5c-2.39.27-4.19,1.11-4.89,3.57-.67,2.32-.72,11.89-.05,14.18.33,1.12,1.38,2.42,2.46,2.9,2.22.99,12.91,1.05,15.24.28.99-.33,2.25-1.43,2.68-2.4.99-2.22,1.05-12.91.28-15.24-.3-.91-1.35-2.15-2.2-2.59-2.19-1.12-10.83-1.01-13.51-.71Z",
      "M12.23,6.44c7.97-1.07,10.74,10.45,3.16,13.03-9.44,3.21-12.71-11.75-3.16-13.03ZM11.94,8.97c-4.02.83-4.24,7.76.52,8.37,6.8.86,6.45-9.81-.52-8.37Z",
      "M18.86,5.03c1.66-1.65,4.16,1.21,2.06,2.49-1.86,1.13-3.06-1.5-2.06-2.49Z",
    ],
  },
  facebook: {
    viewBox: "0 0 14.67 28.26",
    paths: [
      "M14.67,4.85h-4.09c-.12,0-.99,1.12-.99,1.27v4.37h4.79c-.04.53-.31,5.08-.56,5.08h-4.23v12.69h-5.36v-12.69H0v-5.08h4.23v-5.22c0-.49,1.03-2.63,1.41-3.1C6.69.86,8.64.19,10.28.05c.65-.06,4.38-.17,4.38.43v4.37Z",
    ],
  },
};

export function SiteFooter({
  footer,
  wpOrigin,
}: {
  footer: SiteEnvelope["footer"];
  wpOrigin: string;
}) {
  const showLockup = footer.logoIsDefault || !footer.logoUrl;
  const columns = footer.columns ?? DEFAULT_COLUMNS;
  const socials = footer.socials
    .filter((s) => s.url)
    .map((s) => ({ ...s, icon: ICONS[s.name.toLowerCase()] }));
  const a11yHref = footer.contactEmail ? `mailto:${footer.contactEmail}` : "";

  return (
    <footer
      className="site-footer bg-ink font-sans text-white"
      data-tone="ink"
      data-testid="site-footer"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-8 px-6 pb-9 pt-10 md:grid-cols-2 md:gap-9 md:pb-10 md:pt-12 lg:gap-11 lg:pb-11 lg:pt-[52px] lg:[grid-template-columns:minmax(220px,1.1fr)_repeat(3,minmax(170px,auto))]">
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
          {showLockup ? (
            <WordmarkLockup name={footer.orgName} size="footer" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- Chapter Settings upload
            <img
              src={footer.logoUrl}
              alt={footer.orgName}
              className="block h-12 w-auto max-w-[240px]"
              data-testid="site-footer-logo"
            />
          )}
          {footer.tagline ? (
            <p
              className="m-0 max-w-[30ch] text-base leading-[1.55] text-muted-on-ink"
              data-testid="site-footer-tagline"
            >
              {footer.tagline}
            </p>
          ) : null}
          {socials.length ? (
            <div className="flex items-center gap-[18px]" data-testid="site-footer-socials">
              {socials.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.name}
                  data-testid="site-footer-social-link"
                  data-social={s.name.toLowerCase()}
                  className="flex min-h-11 min-w-11 items-center justify-center text-white transition-colors hover:text-brand-light"
                >
                  {s.icon ? (
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox={s.icon.viewBox}
                      className="block h-[26px] w-auto fill-current"
                    >
                      {s.icon.paths.map((d, i) => (
                        <path key={i} d={d} />
                      ))}
                    </svg>
                  ) : (
                    <span className="text-[0.95rem] font-bold">{s.name}</span>
                  )}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {columns.map((col) => (
          <nav
            key={col.title}
            aria-label={col.title}
            className="flex flex-col gap-[9px]"
            data-testid="site-footer-column"
            data-column={col.title}
          >
            <div className="mb-1 text-[1.15rem] font-bold" data-testid="site-footer-column-title">
              {col.title}
            </div>
            {col.links.map((link) => (
              <SiteLink
                key={link.label}
                href={link.href}
                wpOrigin={wpOrigin}
                target={link.external ? "_blank" : undefined}
                className="text-[1.06rem] font-medium text-white no-underline hover:text-brand-light hover:underline hover:underline-offset-[3px]"
                data-testid="site-footer-link"
                data-nav-label={link.label}
              >
                {link.label}
              </SiteLink>
            ))}
          </nav>
        ))}
      </div>

      <div
        data-tone="blue"
        className="bg-brand px-6 py-3.5 text-white"
        data-testid="site-footer-bar"
      >
        <div className="mx-auto flex max-w-[1320px] flex-col gap-1.5 text-[0.92rem] md:flex-row md:flex-wrap md:justify-between md:gap-4 md:text-[1.02rem]">
          <span data-testid="site-footer-org-name">{footer.orgName}</span>
          <span>
            {footer.a11yLead}{" "}
            {a11yHref ? (
              <a
                href={a11yHref}
                className="font-bold text-white hover:text-brand-light"
                data-testid="site-footer-a11y-link"
              >
                {footer.a11yLinkLabel}
              </a>
            ) : (
              <span className="font-bold">{footer.a11yLinkLabel}</span>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
