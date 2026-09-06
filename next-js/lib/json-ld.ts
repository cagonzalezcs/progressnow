import { absoluteImageUrl } from "@/lib/metadata";
import type { Seo, SingleEventEnvelope, SinglePostEnvelope, SiteEnvelope } from "@/lib/schemas";

/* JSON-LD parity with the theme's inc/seo.php (openspec spec structured-data;
 * design D5): Organization site-wide, Article on posts, Event on events. Pure
 * builders over the envelopes; <JsonLd> serializes them. The Organization's
 * `url`/`@id` follow the canonical origin (CHAPTER_CANONICAL_ORIGIN via the
 * envelope's canonical) so the entity is the same across the PHP theme and the
 * headless frontends. */

export type JsonLdNode = Record<string, unknown>;

export interface Origins {
  /** canonical origin — the front page's canonical origin, else the app origin */
  canonicalOrigin: string;
  siteOrigin: string;
  wpOrigin: string;
}

export function canonicalOrigin(seo: Seo | null | undefined, fallback: string): string {
  try {
    return seo?.canonical ? new URL(seo.canonical).origin : fallback;
  } catch {
    return fallback;
  }
}

export const organizationId = (origin: string) => `${origin}/#organization`;

export function organizationNode(site: SiteEnvelope, o: Origins): JsonLdNode {
  const sameAs = [...site.chapter.socials.map((s) => s.url), site.chapter.instagram_url]
    .map((u) => (u ?? "").trim())
    .filter((u, i, all) => u && all.indexOf(u) === i);
  const logo = site.identity.logo_square.src;
  return {
    "@type": "Organization",
    "@id": organizationId(o.canonicalOrigin),
    name: site.identity.name,
    url: `${o.canonicalOrigin}/`,
    ...(logo ? { logo: absoluteImageUrl(logo, o.siteOrigin, o.wpOrigin) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** The envelope's display date ("June 1, 2026") → ISO date when it parses; null otherwise
 * (Spanish display dates do not — the ISO fields arrive with the 7.4 contract update). */
export function displayDateToIso(display: string): string | null {
  const t = Date.parse(display);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function articleNode(post: SinglePostEnvelope, o: Origins): JsonLdNode {
  const committee = post.committee.trim();
  const author =
    post.bylineMode === "committee" && committee
      ? { "@type": "Organization", name: committee }
      : { "@type": "Person", name: post.author };
  const date = displayDateToIso(post.date);
  return {
    "@type": "Article",
    headline: post.title,
    description: post.seo.description,
    ...(date ? { datePublished: date, dateModified: date } : {}),
    mainEntityOfPage: post.seo.canonical,
    author,
    publisher: { "@id": organizationId(o.canonicalOrigin) },
    ...(post.featuredImage.src
      ? { image: absoluteImageUrl(post.featuredImage.src, o.siteOrigin, o.wpOrigin) }
      : {}),
  };
}

/** Google Calendar `dates=YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS&ctz=Zone` (built by
 * inc/events.php from the same start/end as the ICS feed) → ISO 8601 with the
 * chapter zone's offset, i.e. PHP's `format('c')`. */
export function gcalToIso(gcalUrl: string): { start: string; end?: string } | null {
  let url: URL;
  try {
    url = new URL(gcalUrl);
  } catch {
    return null;
  }
  const dates = url.searchParams.get("dates");
  const zone = url.searchParams.get("ctz") ?? "UTC";
  if (!dates) return null;
  const [start, end] = dates.split("/");
  const iso = (compact: string | undefined) => {
    const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(compact ?? "");
    if (!m) return undefined;
    const [, y, mo, d, h, mi, s] = m;
    return `${y}-${mo}-${d}T${h}:${mi}:${s}${zoneOffset(zone, new Date(Date.UTC(+y!, +mo! - 1, +d!, +h!, +mi!, +s!)))}`;
  };
  const startIso = iso(start);
  if (!startIso) return null;
  const endIso = iso(end);
  return endIso ? { start: startIso, end: endIso } : { start: startIso };
}

/** "+HH:MM" for an IANA zone at (approximately) the given instant. */
export function zoneOffset(zone: string, at: Date): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value;
    if (!part || part === "GMT") return "+00:00";
    const m = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(part);
    if (!m) return "+00:00";
    return `${m[1]}${m[2]!.padStart(2, "0")}:${m[3] ?? "00"}`;
  } catch {
    return "+00:00";
  }
}

export function eventNode(envelope: SingleEventEnvelope, o: Origins): JsonLdNode | null {
  const ev = envelope.event;
  const when = gcalToIso(ev.gcalUrl);
  if (!when) return null; // no parseable start — the theme omits the node too
  const venue = ev.venue.trim();
  const city = ev.city.trim();
  const desc = ev.summary.trim() || envelope.seo.description;
  return {
    "@type": "Event",
    name: ev.title,
    startDate: when.start,
    ...(when.end ? { endDate: when.end } : {}),
    url: envelope.seo.canonical,
    organizer: { "@id": organizationId(o.canonicalOrigin) },
    ...(desc ? { description: desc } : {}),
    ...(venue || city
      ? {
          location: {
            "@type": "Place",
            name: venue || city,
            ...(city ? { address: { "@type": "PostalAddress", addressLocality: city } } : {}),
          },
        }
      : {}),
    ...(ev.rsvpUrl ? { offers: { "@type": "Offer", url: ev.rsvpUrl } } : {}),
    ...(ev.featuredImage.src
      ? { image: absoluteImageUrl(ev.featuredImage.src, o.siteOrigin, o.wpOrigin) }
      : {}),
  };
}

export function jsonLdGraph(nodes: (JsonLdNode | null)[]): {
  "@context": string;
  "@graph": JsonLdNode[];
} {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter((n): n is JsonLdNode => Boolean(n)),
  };
}

/** Safe to inline: `<` cannot close the script element. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
