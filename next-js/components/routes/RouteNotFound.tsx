import { ERROR_PILL_OUTLINE, ERROR_PILL_WHITE, ErrorBand } from "@/components/site/ErrorBand";
import { SiteLink } from "@/components/site/SiteLink";
import { getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { frontRoute } from "@/lib/routes";

/* 404 view (openspec next-headless-site § Error and empty surfaces; interior-
 * presentation § 404 page) — twin of views/404.twig with the `nf_*` strings.
 * Rendered as an ordinary server-rendered state — not via notFound() — because
 * under Cache Components a thrown not-found only reaches the client behind the
 * streamed shell; the HTTP status and x-robots-tag come from proxy.ts, the
 * noindex meta from generateMetadata. */
export async function RouteNotFound({ lang }: { lang: string }) {
  const [site, manifest] = await Promise.all([getSite(lang), getRoutes()]);
  const s = site.strings as Record<string, string>;
  const wpOrigin = getEnv().WP_ORIGIN;
  const home = frontRoute(manifest, lang)?.path ?? "/";
  const calendar =
    manifest.routes.find((r) => r.kind === "calendar" && r.lang === lang)?.path ?? "/calendar/";
  return (
    <>
      <ErrorBand
        kind="not_found"
        numeral="404"
        title={s.nf_title || "This page got organized out of existence"}
        lede={
          s.nf_lede ||
          "The page you’re looking for isn’t here — it may have moved, or the link may be broken."
        }
        actions={
          <>
            <SiteLink
              href={home}
              wpOrigin={wpOrigin}
              className={ERROR_PILL_WHITE}
              data-testid="not-found-home-link"
            >
              {s.nf_home || "Back home"}
            </SiteLink>
            <SiteLink
              href={calendar}
              wpOrigin={wpOrigin}
              className={ERROR_PILL_OUTLINE}
              data-testid="not-found-calendar-link"
            >
              {s.nf_calendar || "See the calendar"}
            </SiteLink>
          </>
        }
      />
    </>
  );
}
