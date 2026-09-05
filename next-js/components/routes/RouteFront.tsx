import { Suspense } from "react";
import type { RouteProps } from "@/components/routes/types";
import { ArrowGlyph } from "@/components/site/ArrowGlyph";
import { DuotoneImage } from "@/components/site/DuotoneImage";
import { SiteLink } from "@/components/site/SiteLink";
import { StarGlyph } from "@/components/site/StarGlyph";
import { getFrontPage, getPosts, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import type { FrontPageEnvelope, SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Home — views/front-page.twig / RouteFront.vue ported 1:1 (openspec front-page,
 * progress-now-v4-home): hero, who-we-are, upcoming events, from-the-blog,
 * closing CTA. Copy, teasers and brand media come from `/front-page` +
 * `/site`; every key is always set (possibly empty) so the empty states own the
 * pre-seed render. Bands carry data-tone for the Aa widget's high-contrast mode. */

const H2 =
  "m-0 font-display text-[1.6rem] font-normal leading-[1.15] md:text-[clamp(2rem,3.6vw,3.1rem)] md:leading-[1.1]";
const ARROW_LINK =
  "flex items-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:gap-4 md:text-[1.05rem]";
const ARROW_SVG = "h-[17px] w-[34px] flex-none fill-accent md:h-5 md:w-10";
const STRIPE =
  "bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]";
const CARD =
  "overflow-hidden rounded-[18px] bg-white text-ink no-underline shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card-hover-lg md:rounded-[24px]";
const PILL =
  "rounded-full bg-accent font-display font-normal uppercase tracking-[0.04em] text-white no-underline transition-[transform,background-color] hover:-translate-y-px hover:bg-brand-deep";

export async function RouteFront({ resolved, searchParams }: RouteProps) {
  const [front, site] = await Promise.all([getFrontPage(resolved.lang), getSite(resolved.lang)]);
  return (
    <FrontPage front={front} site={site} wpOrigin={getEnv().WP_ORIGIN}>
      <Suspense fallback={null}>
        <SearchFragment lang={resolved.lang} searchParams={searchParams} />
      </Suspense>
    </FrontPage>
  );
}

/** Pure presentation (unit-tested with the theme fixtures). */
export function FrontPage({
  front,
  site,
  wpOrigin,
  children,
}: {
  front: FrontPageEnvelope;
  site: SiteEnvelope;
  wpOrigin: string;
  children?: React.ReactNode;
}) {
  const { identity, chapter } = site;
  const s = site.strings as Record<string, string>;
  const t = (key: string, fallback: string) => s[key] ?? fallback;
  const { hero, who, cta, blog } = front;
  const calendarUrl = front.calendarUrl || "/calendar/";
  const events = front.events.slice(0, front.eventCount || 5);
  const [emptyBefore, emptyAfter] = t(
    "home_events_empty_p",
    "New meetings and actions land on the %s first — subscribe there and never miss one.",
  ).split("%s");

  return (
    <div data-route-kind="front" className="route-front contents">
      {children}
      {/* ============ HERO ============ */}
      <section className="home-hero overflow-hidden bg-brand font-sans text-white" data-tone="blue">
        <div className="mx-auto flex w-full max-w-[1300px] flex-col min-[700px]:flex-row">
          <div className="relative h-[240px] min-w-0 min-[700px]:order-1 min-[700px]:h-auto min-[700px]:min-h-[480px] min-[700px]:w-1/2 min-[700px]:flex-none">
            <DuotoneImage
              src={identity.hero_photo.src}
              alt={identity.hero_photo.alt}
              width={identity.hero_photo.width}
              height={identity.hero_photo.height}
              opacity={0.38}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full"
              imgClass="block h-full w-full object-cover"
            />
          </div>
          <div className="relative flex min-w-0 flex-col items-center justify-center px-6 pb-12 pt-14 text-center min-[700px]:w-1/2 min-[700px]:flex-none min-[700px]:justify-end min-[700px]:px-8 min-[700px]:pb-[84px] min-[700px]:pt-[88px] lg:pl-12 lg:pr-16">
            <div className="relative flex w-full max-w-[540px] flex-col items-center gap-6 min-[700px]:gap-[34px]">
              <StarGlyph
                kind="sparkle"
                className="absolute -top-[30px] left-0 w-[26px] -rotate-10 text-brand-light min-[700px]:-left-6 min-[700px]:-top-11 min-[700px]:w-[34px] lg:-left-12"
              />
              <StarGlyph
                kind="star-notch"
                className="absolute -top-[38px] right-0 w-[38px] rotate-10 text-brand-light min-[700px]:-right-4 min-[700px]:-top-[52px] min-[700px]:w-[52px] lg:-right-10"
              />
              <StarGlyph
                kind="star"
                className="absolute -bottom-4 -right-6 hidden w-[50px] text-brand-light min-[700px]:block lg:-right-12"
              />
              <h1 className="hero-headline">{identity.hero_headline}</h1>
              <p className="m-0 max-w-[32ch] text-[1.1rem] font-semibold leading-[1.45] [text-wrap:balance] min-[700px]:max-w-[34ch] min-[700px]:text-[1.35rem] min-[700px]:leading-[1.4]">
                {hero.subhead}
              </p>
              <SiteLink
                href={hero.cta_primary_url}
                wpOrigin={wpOrigin}
                className="rounded-full bg-white px-10 py-[15px] font-display text-base font-normal uppercase tracking-[0.04em] text-brand no-underline transition-[transform,background-color,color] hover:-translate-y-px hover:bg-brand-deep hover:text-white min-[700px]:px-11 min-[700px]:py-4 min-[700px]:text-[1.15rem]"
              >
                {hero.cta_primary_label}
              </SiteLink>
              <SiteLink
                href={hero.cta_secondary_url}
                wpOrigin={wpOrigin}
                className="flex items-center gap-4 rounded-[14px] border-2 border-dashed border-brand-light px-[18px] py-3.5 text-left text-white no-underline transition-colors hover:border-transparent hover:bg-brand-deep min-[700px]:gap-[22px] min-[700px]:rounded-[16px] min-[700px]:px-7 min-[700px]:py-[18px]"
              >
                <span className="max-w-[22ch] text-base font-bold leading-[1.35] min-[700px]:text-[1.25rem]">
                  {hero.cta_secondary_label}
                </span>
                <ArrowGlyph className="h-[17px] w-[34px] flex-none fill-white min-[700px]:h-[22px] min-[700px]:w-11" />
              </SiteLink>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO WE ARE ============ */}
      <section
        id="about"
        className="who-we-are bg-white px-6 pb-12 pt-14 font-sans text-ink md:pb-[76px] md:pt-[84px]"
        data-tone="white"
      >
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 md:grid md:items-center md:gap-14 md:[grid-template-columns:minmax(320px,1.15fr)_minmax(300px,1fr)]">
          <div className="relative order-3 md:order-first">
            <DuotoneImage
              src={identity.who_image.src}
              alt={identity.who_image.alt}
              width={identity.who_image.width}
              height={identity.who_image.height}
              opacity={0.3}
              loading="lazy"
              className="rounded-[18px] md:rounded-[24px]"
              imgClass="block h-auto w-full"
            />
            <StarGlyph
              kind="star"
              className="absolute -right-4 -top-[22px] hidden w-[52px] text-brand [filter:saturate(1.4)] md:block"
            />
          </div>
          <div className="contents md:flex md:flex-col md:items-end md:gap-[22px] md:text-right">
            <div className="order-1 text-[0.9rem] font-extrabold uppercase tracking-[0.06em] text-accent md:text-base md:tracking-[0.04em]">
              {who.eyebrow}
            </div>
            {/* kses'd editor markup (notranslate spans) */}
            <h2 className={cn("order-2", H2)} dangerouslySetInnerHTML={{ __html: who.heading }} />
            <p className="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">
              {who.p1}
            </p>
            <p className="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">
              {who.p2}
            </p>
            {/* kses'd editor markup (line breaks) */}
            <p
              className="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]"
              dangerouslySetInnerHTML={{ __html: who.p3 }}
            />
            <SiteLink href={who.link_url} wpOrigin={wpOrigin} className={cn("order-5", ARROW_LINK)}>
              {who.link_label}
              <ArrowGlyph className={ARROW_SVG} />
            </SiteLink>
          </div>
        </div>
      </section>

      {/* ============ UPCOMING EVENTS ============ */}
      <section
        id="events"
        className="upcoming-events bg-alt px-6 pb-14 pt-12 font-sans text-ink md:pb-24 md:pt-[76px]"
        data-tone="alt"
      >
        <div className="mx-auto flex max-w-[1240px] flex-col gap-[22px] md:grid md:items-center md:gap-10 md:[grid-template-columns:1fr_auto]">
          <h2 className={H2}>{t("home_events_head", "Upcoming events")}</h2>
          <SiteLink
            href={calendarUrl}
            wpOrigin={wpOrigin}
            className={cn(
              "order-last justify-center",
              ARROW_LINK,
              "md:order-none md:col-start-2 md:row-start-1 md:justify-start",
            )}
          >
            {t("home_events_all", "Full calendar")}
            <ArrowGlyph className={ARROW_SVG} />
          </SiteLink>
          {events.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-[20px] border-2 border-dashed border-border-muted px-8 py-16 text-center md:col-span-2 md:row-start-2">
              <div className="text-[1.25rem] font-bold">
                {t("home_events_empty_h", "No events on the books yet")}
              </div>
              <p className="m-0 max-w-[42ch] text-[1.25rem] font-medium leading-[1.45]">
                {emptyBefore}
                <SiteLink
                  href={calendarUrl}
                  wpOrigin={wpOrigin}
                  className="font-bold text-accent underline underline-offset-4 hover:text-brand-deep"
                >
                  {t("home_events_empty_link", "calendar")}
                </SiteLink>
                {emptyAfter}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:col-span-2 md:row-start-2">
              {events.map((ev) => (
                <SiteLink
                  key={`${ev.title}-${ev.when}`}
                  href={ev.url || calendarUrl}
                  wpOrigin={wpOrigin}
                  aria-label={`${t("home_view_event", "View event")}: ${ev.title}`}
                  className="group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline shadow-subtle transition-shadow hover:shadow-card md:[grid-template-columns:76px_1fr_auto] md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px]"
                >
                  <span
                    aria-hidden="true"
                    className="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5"
                  >
                    <span className="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]">
                      {ev.day}
                    </span>
                    <span className="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]">
                      {ev.month}
                    </span>
                  </span>
                  <span className="flex flex-col gap-[3px] md:gap-1">
                    <span className="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]">
                      {ev.title}
                    </span>
                    <span className="text-[0.88rem] font-medium text-muted md:text-base">
                      {ev.when}
                      <span className="hidden md:inline"> · {ev.where}</span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block"
                  >
                    {t("home_view_event", "View event")}
                  </span>
                </SiteLink>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ FROM THE BLOG ============ */}
      <section
        id="blog"
        className="from-the-blog bg-white px-6 py-14 font-sans text-ink md:pb-24 md:pt-[88px]"
        data-tone="white"
      >
        <div className="mx-auto flex max-w-[1240px] flex-col gap-[22px] md:gap-11">
          <h2 className={H2}>{t("home_blog_head", "From the blog")}</h2>
          {blog.featured ? (
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8 lg:[grid-template-columns:minmax(300px,1.15fr)_minmax(280px,1fr)]">
              <SiteLink
                href={blog.featured.url}
                wpOrigin={wpOrigin}
                className={cn("flex flex-col", CARD, "md:col-span-2 lg:col-span-1")}
              >
                <span
                  className={cn(
                    "relative block aspect-video overflow-hidden",
                    blog.featured.image ? "" : STRIPE,
                  )}
                >
                  {blog.featured.image ? (
                    <DuotoneImage
                      src={blog.featured.image.src}
                      alt={blog.featured.image.alt}
                      opacity={0.3}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full"
                      imgClass="block h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-white md:left-3.5 md:top-3.5 md:px-3.5 md:py-[5px] md:text-[0.75rem]">
                    {blog.featured.cat_label}
                  </span>
                </span>
                <span className="flex flex-col gap-2 px-5 pb-[22px] pt-[18px] md:gap-2.5 md:px-7 md:pb-[30px] md:pt-[26px]">
                  <span className="text-[0.82rem] font-semibold text-muted md:text-[0.85rem]">
                    {blog.featured.date} · {blog.featured.read}
                  </span>
                  <span className="text-[1.1rem] font-extrabold leading-[1.3] [text-wrap:balance] md:text-[clamp(1.2rem,2.2vw,1.45rem)] md:leading-[1.25]">
                    {blog.featured.title}
                  </span>
                  <span className="hidden text-base leading-[1.55] text-muted md:block">
                    {blog.featured.excerpt}
                  </span>
                  <span className="mt-1 hidden items-center gap-3 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent md:flex">
                    {t("home_blog_read", "Read the post")}
                    <ArrowGlyph className="h-4 w-8 flex-none fill-accent" />
                  </span>
                </span>
              </SiteLink>
              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2 md:gap-5 lg:col-span-1 lg:grid-cols-1">
                {blog.rows.map((row, i) => (
                  <SiteLink
                    key={row.url + row.title}
                    href={row.url}
                    wpOrigin={wpOrigin}
                    className={cn(
                      "grid flex-1 grid-cols-[96px_1fr]",
                      CARD,
                      "md:[grid-template-columns:130px_1fr]",
                    )}
                  >
                    {row.image ? (
                      <DuotoneImage
                        src={row.image.src}
                        alt={row.image.alt}
                        opacity={0}
                        loading="lazy"
                        className="min-h-[96px] md:min-h-[130px]"
                        imgClass="block h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={cn("min-h-[96px] md:min-h-[130px]", STRIPE)}
                      />
                    )}
                    <span className="flex flex-col justify-center gap-1.5 px-[18px] py-3.5 md:gap-[9px] md:px-6 md:py-5">
                      <span
                        className={cn(
                          i % 2 === 0 ? "border-brand text-brand" : "border-accent text-accent",
                          "hidden self-start rounded-full border-2 px-3 py-[3px] text-[0.72rem] font-bold uppercase tracking-[0.06em] md:inline-block",
                        )}
                      >
                        {row.cat_label}
                      </span>
                      <span className="text-[0.98rem] font-bold leading-[1.35] md:text-[1.1rem]">
                        {row.title}
                      </span>
                      <span className="text-[0.82rem] font-semibold text-muted md:text-[0.85rem]">
                        {row.date}
                      </span>
                    </span>
                  </SiteLink>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-dashed border-border-muted px-6 py-16 text-center">
              <span className="text-[1.25rem] font-bold">
                {t("home_blog_empty_h", "Posts coming soon")}
              </span>
              <span className="max-w-[42ch] text-[1.25rem] font-medium leading-[1.45]">
                {t(
                  "home_blog_empty_p",
                  "The chapter is writing its first dispatches — check back shortly.",
                )}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section
        className="closing-cta bg-brand pt-10 font-sans min-[700px]:pt-[72px]"
        data-tone="blue"
        aria-label={t("cta_join", "Join us")}
      >
        <div
          aria-hidden="true"
          className="cta-flames h-[110px] min-[700px]:h-[clamp(120px,17vw,240px)]"
        />
        <div className="relative -mt-0.5 bg-brand-light px-5 pb-10 pt-2 min-[700px]:px-6 min-[700px]:pb-14 min-[700px]:pt-4">
          <div className="relative mx-auto hidden max-w-[1100px] min-[700px]:block">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand panel sized by the theme */}
            <img
              src={identity.cta_panel.src}
              alt={identity.cta_panel.alt}
              aria-hidden={identity.cta_panel.alt === "" ? "true" : undefined}
              width={identity.cta_panel.width}
              height={identity.cta_panel.height}
              className="block h-auto w-full"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[clamp(12px,3vw,40px)] pl-[44%] pr-[5%] text-center">
              <p className="m-0 font-brush text-[clamp(1.8rem,5.4vw,4.8rem)] font-normal uppercase leading-[1.1] text-white [text-wrap:balance]">
                {cta.line}
              </p>
              <SiteLink
                href={chapter.join_url}
                wpOrigin={wpOrigin}
                className={cn(PILL, "px-[2.6em] py-[0.8em] text-[clamp(0.8rem,1.3vw,1.1rem)]")}
              >
                {t("cta_join_now", "Join Now")}
              </SiteLink>
            </div>
          </div>
          <div className="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-[22px] bg-cta-card px-6 pb-9 pt-8 text-center min-[700px]:hidden">
            <span
              aria-hidden="true"
              className="absolute inset-2 rounded-[16px] border-[3px] border-dashed border-yellow opacity-85"
            />
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="-210 -200 420 395"
              className="relative h-auto w-[120px]"
            >
              <path
                d="M0 -196 L57.6 -60 L204 -51 L88 39 L127 188 L0 105 L-127 188 L-88 39 L-204 -51 L-57.6 -60 Z"
                fill="#1848D8"
                stroke="#1B1B22"
                strokeWidth="12"
                strokeLinejoin="round"
              />
              <path
                d="M0 -132 L38 -41 L136 -34 L59 26 L85 126 L0 70 L-85 126 L-59 26 L-136 -34 L-38 -41 Z"
                fill="#FFFFFF"
              />
            </svg>
            <p className="relative m-0 font-brush text-[2.1rem] font-normal uppercase leading-[1.1] text-white [text-wrap:balance]">
              {cta.line}
            </p>
            <SiteLink
              href={chapter.join_url}
              wpOrigin={wpOrigin}
              className={cn("relative", PILL, "px-9 py-[13px] text-[0.95rem]")}
            >
              {t("cta_join_now", "Join Now")}
            </SiteLink>
          </div>
        </div>
      </section>
    </div>
  );
}

/* `?s=` on the home URL is a WordPress search (resolver kind "search"). Read
 * inside Suspense so the front page's shell is unaffected. Full results UI
 * comes with the posts index (6.4); this fragment keeps the URL contract. */
async function SearchFragment({
  lang,
  searchParams,
}: {
  lang: string;
  searchParams: RouteProps["searchParams"];
}) {
  const query = await searchParams;
  const s = (Array.isArray(query.s) ? query.s[0] : query.s)?.trim() ?? "";
  if (!s) return null;
  const results = await getPosts({ lang, s });
  return (
    <section
      aria-label="Search results"
      data-route-kind="search"
      className="mx-auto max-w-[1240px] px-6 py-10"
    >
      <p role="status">
        {results.total} result(s) for “{s}”
      </p>
      <ul>
        {results.posts.map((p) => (
          <li key={p.slug}>{p.title}</li>
        ))}
      </ul>
    </section>
  );
}
