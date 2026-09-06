import { notFound } from "next/navigation";
import { interiorPaths } from "@/components/routes/RoutePage";
import type { RouteProps } from "@/components/routes/types";
import { CtaCard } from "@/components/site/CtaCard";
import { DuotoneImage } from "@/components/site/DuotoneImage";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { LinkListCard } from "@/components/site/LinkListCard";
import { SiteLink } from "@/components/site/SiteLink";
import { ContactNote, Html, InteriorShell } from "@/components/site/interior/InteriorShell";
import {
  ARTICLE,
  CALLOUT,
  CARD,
  CARD_DESC,
  CARD_GRID,
  CARD_TITLE,
  H2,
  H2_LATER,
  LINK_ACCENT,
  PILL_FILL,
  PILL_OUTLINE,
  PROSE,
  ROW,
} from "@/components/site/interior/recipes";
import { getPage, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { payloadSlug } from "@/lib/routes";
import type { PageEnvelope, RoutesManifest, SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* About page — v4 interior layout (openspec interior-presentation § Mission
 * band, § Committee cards, § FAQ disclosure rows; twin of page-about.twig /
 * RouteAbout.vue). `about.*` is always fully set by PHP; section ids feed the
 * visibility-driven `about.nav`. */
export async function RouteAbout({ resolved }: RouteProps) {
  const [page, site, manifest] = await Promise.all([
    resolved.route ? getPage(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
  ]);
  if (!page?.about) notFound();
  return (
    <AboutPage
      page={page}
      site={site}
      manifest={manifest}
      lang={resolved.lang}
      wpOrigin={getEnv().WP_ORIGIN}
    />
  );
}

export function AboutPage({
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
  const about = page.about!;
  const s = site.strings as Record<string, string>;
  const { chapter } = site;
  const paths = interiorPaths(manifest, lang);
  const lede =
    page.lede ||
    `A member-run chapter organizing for working people across ${chapter.region_label || "our community"}.`;
  const navLinks = about.nav.map((i) => ({ label: i.label, href: i.href }));
  const documentLinks = about.governance.docs
    .filter((d) => d.url)
    .map((d) => ({ label: d.title, href: d.url }));

  return (
    <InteriorShell
      kind="about"
      title={page.title || "About the Chapter"}
      lede={lede}
      crumbs={[{ label: s.blog_crumb_home ?? "Home", href: paths.home }]}
      site={site}
      wpOrigin={wpOrigin}
      nav={about.nav}
      band={
        about.mission.visible ? (
          <section
            id="mission-band"
            className="bg-ink px-6 py-10 text-white md:px-10 md:py-12 xl:px-6 xl:py-16"
            data-tone="ink"
            data-testid="about-mission-band"
          >
            <div className="mx-auto flex max-w-[1140px] flex-col gap-3 md:gap-3.5 xl:gap-[18px]">
              <div
                className="text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-brand-light md:text-[0.85rem] xl:text-[0.9rem]"
                data-testid="about-mission-eyebrow"
              >
                {about.mission.eyebrow}
              </div>
              <p
                className="m-0 font-display text-[1.25rem] font-normal leading-[1.3] md:max-w-[36ch] md:text-[1.6rem] md:leading-[1.25] xl:max-w-[38ch] xl:text-[clamp(1.5rem,2.8vw,2.3rem)] xl:leading-[1.2]"
                data-testid="about-mission-body"
              >
                {about.mission.body}
              </p>
            </div>
          </section>
        ) : null
      }
      article={
        <article className={ARTICLE} data-testid="about-article">
          {about.chapter.visible ? (
            <>
              <h2 id="chapter" className={H2} data-testid="about-chapter-heading">
                {about.chapter.heading}
              </h2>
              <Html html={about.chapter.p1} className={PROSE} />
              <Html html={about.chapter.p2} className={PROSE} />
              {about.chapter.photo ? (
                <figure
                  className="m-0 my-1.5 flex flex-col md:my-2 xl:my-3"
                  data-testid="about-chapter-figure"
                >
                  <DuotoneImage
                    src={about.chapter.photo.src}
                    alt={about.chapter.photo.alt}
                    opacity={0.3}
                    className="rounded-[16px] md:rounded-[18px] xl:rounded-[20px]"
                    imgClass="block h-auto w-full"
                    loading="lazy"
                  />
                  {about.chapter.photo.alt ? (
                    <figcaption
                      className="mt-2.5 text-[0.85rem] text-muted md:text-[0.88rem] xl:mt-3 xl:text-[0.9rem]"
                      data-testid="about-chapter-figcaption"
                    >
                      {about.chapter.photo.alt}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
              {about.chapter.ctas.length ? (
                <div className="flex flex-wrap gap-3" data-testid="about-chapter-ctas">
                  {about.chapter.ctas.map((cta, i) => (
                    <SiteLink
                      key={cta.url + cta.label}
                      href={cta.url}
                      wpOrigin={wpOrigin}
                      target={cta.external ? "_blank" : undefined}
                      className={i === 0 ? PILL_FILL : PILL_OUTLINE}
                      data-testid="about-chapter-cta"
                      data-cta-index={i}
                    >
                      {cta.label}
                    </SiteLink>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {about.history.visible ? (
            <>
              <h2 id="mission" className={cn(H2, H2_LATER)} data-testid="about-history-heading">
                {about.history.heading}
              </h2>
              <Html html={about.history.body} className={PROSE} />
              {about.history.timeline.length ? (
                <ol
                  className="m-0 flex list-none flex-col gap-2.5 p-0"
                  data-testid="about-timeline"
                >
                  {about.history.timeline.map((item) => (
                    <li
                      key={item.year + item.text}
                      className={cn(
                        "grid items-baseline gap-3.5 [grid-template-columns:72px_1fr] md:gap-[18px] md:[grid-template-columns:90px_1fr]",
                        ROW,
                      )}
                      data-testid="about-timeline-item"
                      data-year={item.year}
                    >
                      <span
                        className="font-display text-[0.95rem] font-normal text-brand md:text-base"
                        data-testid="about-timeline-year"
                      >
                        {item.year}
                      </span>
                      <Html
                        as="span"
                        html={item.text}
                        className="text-[0.95rem] leading-[1.55] text-text-body md:text-base"
                      />
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          ) : null}

          {about.counties.visible ? (
            <>
              <h2 id="counties" className={cn(H2, H2_LATER)} data-testid="about-counties-heading">
                {about.counties.heading}
              </h2>
              <Html html={about.counties.intro} className={PROSE} />
              <div className={CARD_GRID} data-testid="about-counties">
                {about.counties.cards.map((c) => (
                  <div
                    key={c.name}
                    className={CARD}
                    data-testid="about-county"
                    data-county={c.name}
                  >
                    <div className={cn("notranslate", CARD_TITLE)} data-testid="about-county-name">
                      {c.name}
                    </div>
                    {c.cities ? (
                      <p className={cn("notranslate", CARD_DESC)} data-testid="about-county-cities">
                        {c.cities}
                      </p>
                    ) : null}
                    {c.note ? (
                      <div
                        className="mt-0.5 text-[0.82rem] font-bold text-accent"
                        data-testid="about-county-note"
                      >
                        {c.note}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {about.committees.visible ? (
            <>
              <h2
                id="committees"
                className={cn(H2, H2_LATER)}
                data-testid="about-committees-heading"
              >
                {about.committees.heading}
              </h2>
              <Html html={about.committees.intro} className={PROSE} />
              <div className={CARD_GRID} data-testid="about-committees">
                {chapter.committees.map((committee) => (
                  <div
                    key={committee.name}
                    className={CARD}
                    data-testid="about-committee"
                    data-committee={committee.name}
                  >
                    <div className={CARD_TITLE} data-testid="about-committee-name">
                      {committee.name}
                    </div>
                    <p className={CARD_DESC} data-testid="about-committee-desc">
                      {committee.desc}
                    </p>
                  </div>
                ))}
              </div>
              {about.committees.link.url ? (
                <SiteLink
                  href={about.committees.link.url}
                  wpOrigin={wpOrigin}
                  target={about.committees.link.external ? "_blank" : undefined}
                  className={LINK_ACCENT}
                  data-testid="about-committees-link"
                >
                  {about.committees.link.label} →
                </SiteLink>
              ) : null}
            </>
          ) : null}

          {about.governance.visible ? (
            <>
              <h2 id="bylaws" className={cn(H2, H2_LATER)} data-testid="about-governance-heading">
                {about.governance.heading}
              </h2>
              <Html html={about.governance.intro} className={PROSE} />
              <div className="flex flex-col gap-2.5" data-testid="about-governance-docs">
                {about.governance.docs.map((doc) => (
                  <div
                    key={doc.title}
                    className={cn(
                      "flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5",
                      ROW,
                    )}
                    data-testid="about-governance-doc"
                    data-doc-title={doc.title}
                  >
                    <div className="flex flex-col gap-[3px]">
                      <span
                        className="text-[1.02rem] font-bold md:text-[1.05rem]"
                        data-testid="about-governance-doc-title"
                      >
                        {doc.title}
                      </span>
                      {doc.covers ? (
                        <span
                          className="text-[0.9rem] leading-[1.5] text-muted"
                          data-testid="about-governance-doc-covers"
                        >
                          {doc.covers}
                        </span>
                      ) : null}
                    </div>
                    {doc.url ? (
                      <SiteLink
                        href={doc.url}
                        wpOrigin={wpOrigin}
                        className={cn("whitespace-nowrap", PILL_OUTLINE)}
                        data-testid="about-governance-doc-link"
                      >
                        {doc.action}
                      </SiteLink>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {about.faq.visible ? (
            <>
              <h2 id="faq" className={cn(H2, H2_LATER)} data-testid="about-faq-heading">
                {about.faq.heading}
              </h2>
              <FaqAccordion items={about.faq.rows} />
            </>
          ) : null}

          {about.dues.visible ? (
            <aside id="dues" className={cn("mt-1.5", CALLOUT)} data-testid="about-dues">
              <div
                className="font-display text-base font-normal text-brand md:text-[1.05rem]"
                data-testid="about-dues-heading"
              >
                {about.dues.heading}
              </div>
              <Html
                html={about.dues.body}
                className="text-base leading-[1.65] text-text-body [&_p]:m-0 [&_p+p]:mt-3 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px]"
              />
              <SiteLink
                href={chapter.join_url}
                wpOrigin={wpOrigin}
                target="_blank"
                className={cn("mt-1 self-start", PILL_FILL)}
                data-testid="about-dues-cta"
              >
                {s.about_dues_cta ?? "Update my dues"}
              </SiteLink>
            </aside>
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
          {page.newhere ? (
            <CtaCard
              id="involved"
              title={page.newhere.heading}
              body={page.newhere.body}
              href={page.newhere.url}
              label={page.newhere.link_label}
              external={page.newhere.external}
              wpOrigin={wpOrigin}
            />
          ) : null}
          {about.governance.visible && documentLinks.length ? (
            <LinkListCard
              id="documents"
              heading={s.interior_documents ?? "Documents"}
              links={documentLinks}
              wpOrigin={wpOrigin}
            />
          ) : null}
          <ContactNote site={site} />
        </>
      }
    />
  );
}
