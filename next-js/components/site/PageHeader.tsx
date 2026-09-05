import type { ReactNode } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { cn } from "@/lib/utils";

/* v4 page header band (openspec progress-now-v4-blog D1 / -interior-404 spec
 * "Interior page header with breadcrumb"): blue band, white breadcrumb pill
 * (from `md`), Bowlby title, 600 lede. Twin of views/partials/page-header.twig.
 *   variant "page" (default): uppercase shadowed h1, 1140px column (1200px with `wide`).
 *   variant "post": the single-post hero — 880px column, plain balanced h1;
 *     `pullUp` grows the bottom padding so the featured image can overlap.
 * `before` renders between the breadcrumb and the h1 (category pill); children
 * render under the lede (byline, date tile, action pills). */
export interface Crumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  lede?: string;
  crumbs?: Crumb[];
  variant?: "page" | "post";
  wide?: boolean;
  pullUp?: boolean;
  /** Accessible name of the breadcrumb nav (`strings.blog_crumb_*` family). */
  breadcrumbLabel?: string;
  before?: ReactNode;
  children?: ReactNode;
  wpOrigin: string;
}

export function PageHeader({
  title,
  lede = "",
  crumbs = [{ label: "Home", href: "/" }],
  variant = "page",
  wide = false,
  pullUp = false,
  breadcrumbLabel = "Breadcrumb",
  before,
  children,
  wpOrigin,
}: PageHeaderProps) {
  const isPost = variant === "post";
  const bandClass = isPost
    ? pullUp
      ? "pb-[96px] pt-8 md:pb-[150px] md:pt-12"
      : "pb-10 pt-8 md:pb-12 md:pt-12"
    : "pb-10 pt-9 md:px-10 md:pb-[52px] md:pt-11 xl:px-6 xl:pb-14 xl:pt-12";
  const columnClass = isPost
    ? "max-w-[880px] gap-4 md:gap-5"
    : wide
      ? "max-w-[1200px]"
      : "max-w-[1140px]";
  const titleClass = isPost
    ? "text-[1.5rem] leading-[1.25] [text-wrap:balance] md:text-[clamp(2rem,3.8vw,3rem)] md:leading-[1.12]"
    : "headline-shadow uppercase text-[1.9rem] leading-[1.12] md:text-[2.3rem] md:leading-[1.1] xl:text-[clamp(2.2rem,4.2vw,3.4rem)] xl:leading-[1.08]";

  return (
    <section className={cn("page-header bg-brand px-6 text-white", bandClass)} data-tone="blue">
      <div
        className={cn(
          "mx-auto flex flex-col items-start gap-3.5 md:gap-4 xl:gap-[18px]",
          columnClass,
        )}
      >
        <nav aria-label={breadcrumbLabel} className="hidden md:block">
          <ol className="m-0 flex list-none flex-wrap items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.85rem] font-bold">
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {crumb.href ? (
                  <SiteLink
                    href={crumb.href}
                    wpOrigin={wpOrigin}
                    className="text-brand no-underline hover:underline hover:underline-offset-4"
                  >
                    {crumb.label}
                  </SiteLink>
                ) : (
                  <span className="text-ink">{crumb.label}</span>
                )}
                <span aria-hidden="true" className="text-muted">
                  /
                </span>
              </li>
            ))}
            <li aria-current="page" className="text-ink">
              {title}
            </li>
          </ol>
        </nav>
        {before}
        <h1 className={cn("m-0 font-display font-normal", titleClass)}>{title}</h1>
        {lede ? (
          <p className="m-0 max-w-[56ch] text-[1.05rem] font-semibold leading-[1.5] md:text-[1.12rem] xl:text-[1.25rem]">
            {lede}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
