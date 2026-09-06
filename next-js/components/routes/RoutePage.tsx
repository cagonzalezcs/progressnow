import { notFound } from "next/navigation";
import type { RouteProps } from "@/components/routes/types";
import { CtaCard } from "@/components/site/CtaCard";
import { LinkListCard } from "@/components/site/LinkListCard";
import { ContactNote, Html, InteriorShell } from "@/components/site/interior/InteriorShell";
import { ARTICLE, CALLOUT, H2, H2_LATER, PROSE } from "@/components/site/interior/recipes";
import { getPage, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { frontRoute, payloadSlug } from "@/lib/routes";
import type { PageEnvelope, RoutesManifest, SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Interior page — v4 layout (openspec interior-presentation; twin of
 * views/page.twig / RoutePage.vue). `content` is the kses'd editor HTML;
 * documents + grievance come from the Interior ACF group. The design's fixture
 * prose renders only when the editor content is empty, exactly as the Twig does. */
export async function RoutePage({ resolved }: RouteProps) {
  const [page, site, manifest] = await Promise.all([
    resolved.route ? getPage(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
  ]);
  if (!page) notFound();
  return (
    <InteriorPage
      page={page}
      site={site}
      manifest={manifest}
      lang={resolved.lang}
      wpOrigin={getEnv().WP_ORIGIN}
    />
  );
}

export function interiorPaths(manifest: RoutesManifest, lang: string) {
  const find = (kind: string) =>
    manifest.routes.find((r) => r.kind === kind && r.lang === lang)?.path;
  return {
    home: frontRoute(manifest, lang)?.path ?? "/",
    about: find("about") ?? "/about/",
    gi: find("get_involved") ?? "/get-involved/",
  };
}

export function InteriorPage({
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
  const s = site.strings as Record<string, string>;
  const { chapter } = site;
  const paths = interiorPaths(manifest, lang);
  const lede =
    page.lede ||
    (page.content
      ? ""
      : "How our chapter governs itself — and how we take care of each other while we do the work.");
  const documentLinks = page.documents.map((d) => ({ label: d.title, href: d.url }));
  const relatedLinks = [
    { label: s.about_mission ?? "Mission & History", href: `${paths.about}#mission` },
    { label: s.about_committees ?? "Committees", href: `${paths.gi}#committees` },
    { label: s.about_faq ?? "FAQ", href: `${paths.about}#faq` },
  ];

  return (
    <InteriorShell
      kind="page"
      title={page.title}
      lede={lede}
      crumbs={[{ label: s.blog_crumb_home ?? "Home", href: paths.home }]}
      site={site}
      wpOrigin={wpOrigin}
      article={
        <article
          id={`post-${page.id}`}
          className={cn("post-type-page", ARTICLE)}
          data-testid="interior-page-article"
        >
          {page.content ? (
            <Html html={page.content} className="prose-chapter" />
          ) : (
            <>
              <p className={cn("m-0", PROSE)}>
                Our chapter is governed by its members. These documents spell out how we make
                decisions together, how we treat each other, and what to do when something goes
                wrong. Every member is encouraged to read them — and every member has the power to
                propose changes.
              </p>
              <h2 id="conduct" className={cn(H2, H2_LATER)}>
                What we expect of each other
              </h2>
              <p className={cn("m-0", PROSE)}>
                Organizing only works when everyone can participate safely and fully. Our code of
                conduct applies to all chapter spaces — meetings, actions, socials, and online
                channels. In short:
              </p>
              <ul className="m-0 flex list-[square] flex-col gap-2.5 pl-6 text-[1.02rem] leading-[1.6] text-text-body marker:text-brand md:text-[1.05rem] xl:text-[1.12rem]">
                <li>Treat fellow members with respect, across every difference.</li>
                <li>Honor pronouns, access needs, and language needs.</li>
                <li>No harassment, intimidation, or discrimination — full stop.</li>
                <li>Disagree openly and in good faith; debate ideas, not people.</li>
              </ul>
              <h3 className="mx-0 mb-0 mt-2 font-display text-[1.15rem] font-normal leading-[1.2]">
                Amending these documents
              </h3>
              <p className={cn("m-0", PROSE)}>
                Any member in good standing may propose an amendment. Proposals are read at a
                general meeting and voted on at the following one. Reach out to the steering
                committee if you’d like help drafting a proposal.
              </p>
            </>
          )}
          {page.grievance.show ? (
            <aside
              id="grievance"
              className={cn("callout-card mt-1.5 scroll-mt-[110px]", CALLOUT)}
              data-testid="interior-page-grievance"
            >
              <div
                className="font-display text-base font-normal text-brand md:text-[1.05rem]"
                data-testid="interior-page-grievance-heading"
              >
                {s.page_grievance_h ?? "Need to report something?"}
              </div>
              {page.grievance.body ? (
                <Html
                  html={page.grievance.body}
                  className="prose-chapter text-base leading-[1.65] text-text-body"
                />
              ) : (
                <p className="m-0 text-base leading-[1.65] text-text-body">
                  Our grievance officers are here for you. Reports are handled confidentially, and
                  you can always bring a support person.{" "}
                  {chapter.contact_email ? (
                    <>
                      Email{" "}
                      <a
                        href={`mailto:${chapter.contact_email}`}
                        className="notranslate font-bold text-accent underline underline-offset-[3px] hover:text-brand-deep"
                        data-testid="interior-page-grievance-email"
                      >
                        {chapter.contact_email}
                      </a>{" "}
                      or speak to any grievance officer at a meeting.
                    </>
                  ) : (
                    "Speak to any grievance officer at a meeting."
                  )}
                </p>
              )}
            </aside>
          ) : null}
        </article>
      }
      sidebar={
        <>
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
          {documentLinks.length ? (
            <LinkListCard
              id="documents"
              heading={s.interior_documents ?? "Documents"}
              links={documentLinks}
              wpOrigin={wpOrigin}
            />
          ) : null}
          <LinkListCard
            heading={s.chrome_related ?? "Related"}
            links={relatedLinks}
            wpOrigin={wpOrigin}
          />
          <ContactNote site={site} />
        </>
      }
    />
  );
}
