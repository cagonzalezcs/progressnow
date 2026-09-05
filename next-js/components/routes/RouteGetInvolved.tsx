import { notFound } from "next/navigation";
import { interiorPaths } from "@/components/routes/RoutePage";
import type { RouteProps } from "@/components/routes/types";
import { CtaCard } from "@/components/site/CtaCard";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { LinkListCard } from "@/components/site/LinkListCard";
import { SiteLink } from "@/components/site/SiteLink";
import { ContactNote, Html, InteriorShell } from "@/components/site/interior/InteriorShell";
import {
  ARTICLE,
  CARD,
  CARD_DESC,
  CARD_GRID,
  CARD_TITLE,
  H2,
  H2_LATER,
  LINK_ACCENT,
  PILL_OUTLINE,
  PROSE,
  PROSE_SM,
  ROW,
} from "@/components/site/interior/recipes";
import { getPage, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { payloadSlug } from "@/lib/routes";
import type { PageEnvelope, RoutesManifest, SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Get Involved — v4 interior layout (openspec interior-presentation; twin of
 * page-get-involved.twig / RouteGetInvolved.vue). `gi.*` is always fully set. */
export async function RouteGetInvolved({ resolved }: RouteProps) {
  const [page, site, manifest] = await Promise.all([
    resolved.route ? getPage(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
  ]);
  if (!page?.gi) notFound();
  return (
    <GetInvolvedPage
      page={page}
      site={site}
      manifest={manifest}
      lang={resolved.lang}
      wpOrigin={getEnv().WP_ORIGIN}
    />
  );
}

export function GetInvolvedPage({
  page,
  site,
  manifest,
  lang,
  wpOrigin,
}: {
  page: PageEnvelope;
  site: SiteEnvelope;
  manifest: RoutesManifest;
  lang: string;
  wpOrigin: string;
}) {
  const gi = page.gi!;
  const s = site.strings as Record<string, string>;
  const { chapter } = site;
  const paths = interiorPaths(manifest, lang);
  const lede =
    page.lede ||
    "No experience needed, no perfect politics required. If you want a better world, there's a place for you here.";
  const navLinks = gi.nav.map((i) => ({ label: i.label, href: i.href }));
  const documentLinks = page.documents.map((d) => ({ label: d.title, href: d.url }));
  const relatedLinks = gi.related.map((l) => ({
    label: l.label,
    href: l.url,
    external: l.external,
  }));

  return (
    <InteriorShell
      kind="get_involved"
      title={page.title || "Get involved"}
      lede={lede}
      crumbs={[{ label: s.blog_crumb_home ?? "Home", href: paths.home }]}
      site={site}
      wpOrigin={wpOrigin}
      nav={gi.nav}
      article={
        <article className={ARTICLE}>
          {gi.join.visible ? (
            <>
              <h2 id="join" className={H2}>
                {gi.join.heading}
              </h2>
              <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
                {gi.join.steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[48px_1fr] gap-4 rounded-[16px] bg-white p-5 shadow-card md:grid-cols-[56px_1fr] md:gap-5 md:rounded-[18px] md:p-6 xl:rounded-[20px]"
                  >
                    <div
                      aria-hidden="true"
                      className="flex size-12 items-center justify-center rounded-[12px] bg-brand font-display text-[1.4rem] font-normal text-white md:size-14 md:text-[1.6rem]"
                    >
                      {i + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[1.05rem] font-bold md:text-[1.1rem]">{step.title}</div>
                      <Html html={step.body} className={PROSE_SM} />
                      {step.link_label && step.href ? (
                        <SiteLink
                          href={step.href}
                          wpOrigin={wpOrigin}
                          target={step.external ? "_blank" : undefined}
                          className={LINK_ACCENT}
                        >
                          {step.link_label}
                        </SiteLink>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          {gi.committees.visible ? (
            <>
              <h2 id="committees" className={cn(H2, H2_LATER)}>
                {gi.committees.heading}
              </h2>
              <Html html={gi.committees.intro} className={PROSE} />
              <div className={CARD_GRID}>
                {chapter.committees.map((committee) => (
                  <div key={committee.name} className={CARD}>
                    <div className={CARD_TITLE}>{committee.name}</div>
                    <p className={CARD_DESC}>{committee.desc}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {gi.channels.visible ? (
            <>
              <h2 id="channels" className={cn(H2, H2_LATER)}>
                {gi.channels.heading}
              </h2>
              <div className="flex flex-col gap-2.5">
                {gi.channels.items.map((channel) => (
                  <div
                    key={channel.label}
                    className={cn(
                      "flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5",
                      ROW,
                    )}
                  >
                    <div className="flex flex-col gap-[3px]">
                      <Html
                        as="span"
                        html={channel.label}
                        className="text-[1.02rem] font-bold md:text-[1.05rem]"
                      />
                      {channel.desc ? (
                        <span className="text-[0.9rem] leading-[1.5] text-muted">
                          {channel.desc}
                        </span>
                      ) : null}
                    </div>
                    {channel.url && channel.link_label ? (
                      <SiteLink
                        href={channel.url}
                        wpOrigin={wpOrigin}
                        target={channel.external ? "_blank" : undefined}
                        className={cn("whitespace-nowrap", PILL_OUTLINE)}
                      >
                        {channel.link_label}
                      </SiteLink>
                    ) : channel.badge ? (
                      <span className="rounded-full border border-dashed border-border-muted px-4 py-2 text-[0.8rem] font-bold text-muted">
                        {channel.badge}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {gi.faq.visible ? (
            <>
              <h2 id="faq" className={cn(H2, H2_LATER)}>
                {gi.faq.heading}
              </h2>
              <FaqAccordion items={gi.faq.items} />
            </>
          ) : null}
        </article>
      }
      sidebar={
        <>
          {navLinks.length ? (
            <div className="hidden md:contents">
              <LinkListCard
                heading={s.chrome_on_this_page ?? "On this page"}
                links={navLinks}
                wpOrigin={wpOrigin}
              />
            </div>
          ) : null}
          <CtaCard
            id="involved"
            title={gi.card.heading}
            body={gi.card.body}
            href={gi.card.url}
            label={gi.card.link_label}
            external={gi.card.external}
            wpOrigin={wpOrigin}
          />
          {documentLinks.length ? (
            <LinkListCard
              id="documents"
              heading={s.interior_documents ?? "Documents"}
              links={documentLinks}
              wpOrigin={wpOrigin}
            />
          ) : null}
          {relatedLinks.length ? (
            <LinkListCard
              heading={s.chrome_related ?? "Related"}
              links={relatedLinks}
              wpOrigin={wpOrigin}
            />
          ) : null}
          <ContactNote site={site} />
        </>
      }
    />
  );
}
