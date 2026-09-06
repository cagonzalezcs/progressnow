/* Link re-homing (openspec next-headless-site § Internal links are re-homed
 * onto the app origin; design D4). Envelopes carry absolute WordPress URLs
 * (permalinks, nav hrefs, languages[].url); the app runs on its own origin, so
 * a URL on the WordPress origin becomes a relative app path — unless it is
 * WordPress-only (admin, API, uploads, feeds) or a file. Pure and framework-
 * free; the same rule set as the Nuxt rendition's lib/chapter/links.ts. */

export type HrefKind = "internal" | "wordpress" | "external" | "inert";

export interface ResolvedHref {
  kind: HrefKind;
  href: string;
}

const WORDPRESS_ONLY = /^\/(wp-admin|wp-login\.php|wp-json|wp-content|feed)(\/|$)/;
const FILE = /\.(pdf|ics|xml|zip|jpe?g|png|gif|svg|webp|avif|mp[34]|json|csv|docx?|pptx?|xlsx?)$/i;

export function resolveHref(raw: string, wpOrigin: string): ResolvedHref {
  const href = raw.trim();
  if (href === "" || href.startsWith("#") || /^(mailto|tel|sms|javascript):/i.test(href)) {
    return { kind: "inert", href };
  }

  let url: URL;
  try {
    url = new URL(href, wpOrigin);
  } catch {
    return { kind: "inert", href };
  }

  if (url.origin !== new URL(wpOrigin).origin) {
    return { kind: "external", href };
  }
  if (
    WORDPRESS_ONLY.test(url.pathname) ||
    FILE.test(url.pathname) ||
    url.searchParams.has("feed") // `?feed=chapter-events` (plain permalinks)
  ) {
    return { kind: "wordpress", href: url.href };
  }
  return { kind: "internal", href: `${url.pathname}${url.search}${url.hash}` };
}

/* Calendar events carry absolute WordPress permalinks (`url`) and the calendar
 * is a client island that must never learn the WordPress origin
 * (next-headless-site § No browser-to-WordPress traffic), so its links cannot
 * go through SiteLink. Re-home them at the data boundary instead — see
 * lib/data/index.ts getEvents(). */
export function rehomeEventLinks<T extends { url?: string }>(events: T[], wpOrigin: string): T[] {
  return events.map((event) =>
    event.url ? { ...event, url: resolveHref(event.url, wpOrigin).href } : event,
  );
}
