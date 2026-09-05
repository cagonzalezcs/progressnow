import type { ReactNode } from "react";
import { DashedNote } from "@/components/site/DashedNote";
import { PageHeader, type Crumb } from "@/components/site/PageHeader";
import { SiteLink } from "@/components/site/SiteLink";
import { SubscribeStrip } from "@/components/site/SubscribeStrip";
import { CHIP, GRID, SECTION, SIDEBAR } from "@/components/site/interior/recipes";
import type { SiteEnvelope } from "@/lib/schemas";

/* Interior skeleton shared by the generic page, About and Get Involved
 * (openspec interior-presentation § Interior page header with breadcrumb,
 * § Article and sidebar layout, § Interior subscribe strip): header band,
 * optional band slot, on-this-page chips (phones), article + sticky sidebar,
 * subscribe strip. Strings from `/site`. */
export interface InteriorShellProps {
  kind: string;
  title: string;
  lede: string;
  crumbs: Crumb[];
  site: SiteEnvelope;
  wpOrigin: string;
  nav?: { href: string; label: string }[];
  band?: ReactNode;
  article: ReactNode;
  sidebar: ReactNode;
}

export function InteriorShell({
  kind,
  title,
  lede,
  crumbs,
  site,
  wpOrigin,
  nav = [],
  band,
  article,
  sidebar,
}: InteriorShellProps) {
  const s = site.strings as Record<string, string>;
  return (
    <div data-route-kind={kind} className="route-interior contents">
      <PageHeader
        title={title}
        lede={lede}
        crumbs={crumbs}
        wpOrigin={wpOrigin}
        breadcrumbLabel={s.blog_crumb_home ? `${s.blog_crumb_home} › ${title}` : undefined}
      />
      {band}
      <section className={SECTION} data-tone="white">
        <div className={GRID}>
          {nav.length ? (
            <nav
              aria-label={s.chrome_on_this_page ?? "On this page"}
              className="flex flex-wrap gap-2 md:hidden"
            >
              {nav.map((item) => (
                <SiteLink key={item.href} href={item.href} wpOrigin={wpOrigin} className={CHIP}>
                  {item.label}
                </SiteLink>
              ))}
            </nav>
          ) : null}
          {article}
          <aside aria-label={s.chrome_related ?? "Related"} className={SIDEBAR}>
            {sidebar}
          </aside>
        </div>
      </section>
      <SubscribeStrip
        href={site.chapter.newsletter_url}
        title={s.interior_subscribe_h ?? "Never miss an update"}
        lede={
          s.interior_subscribe_p ??
          "One email when something new lands — meetings, actions, and posts. No spam, ever."
        }
        label={s.interior_subscribe_cta ?? "Subscribe"}
      />
    </div>
  );
}

/** Sidebar contact note — renders only with a chapter contact email. */
export function ContactNote({ site }: { site: SiteEnvelope }) {
  const s = site.strings as Record<string, string>;
  const email = site.chapter.contact_email;
  if (!email) return null;
  return (
    <DashedNote id="contact" heading={s.interior_contact ?? "Contact"}>
      <p>
        {s.interior_contact_p ?? "Questions, ideas, or press —"}{" "}
        <a className="notranslate" href={`mailto:${email}`}>
          {email}
        </a>
      </p>
    </DashedNote>
  );
}

/** kses'd editor HTML with the interior prose typography. */
export function Html({
  html,
  className,
  as: Tag = "div",
  id,
}: {
  html: string;
  className: string;
  as?: "div" | "span" | "p";
  id?: string;
}) {
  return <Tag id={id} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
