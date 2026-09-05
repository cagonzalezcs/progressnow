import { z } from "zod";

/* Single source of truth for the island contracts (contract-governance).
 * PHP serializers (inc/blog.php, inc/events.php, inc/rest.php) emit these
 * exact shapes; tests/fixtures/*.json is asserted against them from both
 * sides (PHPUnit equality, vitest zod parse). Edit contracts HERE — the
 * interfaces in posts.ts / events.ts are z.infer re-exports. */

/* Canonical category slugs. categories.json (theme root) is the runtime
 * registry; this literal tuple exists because TS cannot derive a literal
 * union from a JSON import — contracts.spec.ts asserts they stay in sync. */
export const POST_CATS = ["chapter", "poled", "mutual", "labor", "electoral", "social"] as const;

export const postCatSchema = z.enum(POST_CATS);

export const eventCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  /** null = the "All events" pseudo-category (no swatch) */
  color: z.string().nullable(),
});

export const chapterEventSchema = z.object({
  id: z.string(),
  /** ISO yyyy-mm-dd */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** display string, e.g. "7:00–8:30 PM" */
  time: z.string(),
  cat: postCatSchema,
  title: z.string(),
  location: z.string(),
  desc: z.string(),
  rsvpUrl: z.string().optional(),
  /** Google Calendar render?action=TEMPLATE URL */
  gcalUrl: z.string().optional(),
  /** Single Event permalink — the modal/chip "View event" destination (04 §3d) */
  url: z.string().optional(),
});

export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  cat: postCatSchema,
  /** display date, e.g. "Jun 14, 2026" */
  date: z.string(),
  excerpt: z.string(),
  dek: z.string().optional(),
  bylineMode: z.enum(["named", "committee"]),
  author: z.string().optional(),
  committee: z.string().optional(),
  featured: z.boolean().optional(),
  readMinutes: z.number().optional(),
  url: z.string(),
  /** featured/card image (null src = striped placeholder) */
  image: z
    .object({ src: z.string().nullable(), alt: z.string() })
    .nullable()
    .optional(),
});

export const postImageSchema = z.object({
  src: z.string().nullable(),
  alt: z.string(),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

export const postBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("prose"), html: z.string() }),
  z.object({
    type: z.literal("image"),
    image: postImageSchema,
    breakout: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("pull_quote"),
    quote: z.string(),
    attribution: z.string().optional(),
  }),
  z.object({
    type: z.literal("gallery"),
    layout: z.enum(["essay", "grid"]),
    images: z.array(postImageSchema),
  }),
  z.object({
    type: z.literal("person_quote"),
    photo: z.string().nullable(),
    alt: z.string(),
    quote: z.string(),
    translation: z.string().optional(),
    name: z.string(),
    role: z.string().optional(),
    lang: z.enum(["en", "es"]),
  }),
  z.object({
    type: z.literal("video"),
    url: z.string(),
    poster: z.string().nullable().optional(),
    caption: z.string().optional(),
    transcriptUrl: z.string().optional(),
  }),
  z.object({
    type: z.literal("audio"),
    file: z.string().nullable(),
    title: z.string(),
    duration: z.string().optional(),
    transcriptUrl: z.string(),
  }),
  z.object({
    type: z.literal("document"),
    url: z.string(),
    title: z.string(),
    description: z.string().optional(),
  }),
  z.object({ type: z.literal("event_embed"), event: chapterEventSchema.nullable() }),
  z.object({
    type: z.literal("action_callout"),
    heading: z.string(),
    body: z.string(),
    buttons: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
        style: z.enum(["primary", "outline"]),
      }),
    ),
  }),
]);

export const singlePostDataSchema = z.object({
  title: z.string(),
  dek: z.string(),
  cat: postCatSchema,
  date: z.string(),
  readMinutes: z.number(),
  bylineMode: z.enum(["named", "committee"]),
  author: z.string(),
  authorAvatar: z.string().nullable(),
  committee: z.string(),
  authorBio: z.string(),
  committeeBio: z.string(),
  featuredImage: postImageSchema,
  blocks: z.array(postBlockSchema),
  tags: z.array(z.string()),
});

/* ---- Single Event (inc/events.php → SingleEvent island) ---- */

/** event_body flexible-content layouts (the event-appropriate block set). */
export const eventBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("prose"), html: z.string() }),
  z.object({
    type: z.literal("agenda"),
    items: z.array(z.object({ title: z.string(), desc: z.string().optional() })),
  }),
  z.object({ type: z.literal("good_to_know"), items: z.array(z.string()) }),
  z.object({ type: z.literal("a11y_note"), html: z.string() }),
  /** address auto-derived from venue/city; only present when locationType !== "online" */
  z.object({ type: z.literal("map"), address: z.string() }),
]);

export const eventContactSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
});

/** Related-events card (rail-free; carries its own permalink). */
export const relatedEventSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string(),
  cat: postCatSchema,
  title: z.string(),
  location: z.string(),
  url: z.string(),
});

export const singleEventDataSchema = z.object({
  title: z.string(),
  summary: z.string(),
  cat: postCatSchema,
  /** ISO yyyy-mm-dd — date block + full date line derive from this */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** display range, e.g. "2:00–4:00 PM" */
  time: z.string(),
  /** display doors time, e.g. "1:30 PM"; "" when unset */
  doorsTime: z.string(),
  locationType: z.enum(["in-person", "online", "hybrid"]),
  venue: z.string(),
  city: z.string(),
  cost: z.string(),
  rsvpRequired: z.boolean(),
  /** "" when unset (button falls back to #rsvp) */
  rsvpUrl: z.string(),
  capacity: z.number().nullable(),
  /** maps URL from venue/city; "" when online / no location */
  directionsUrl: z.string(),
  /** Google Calendar render URL; "" when no start time */
  gcalUrl: z.string(),
  /** per-event iCal URL; "" = no endpoint exposed (button hidden) */
  icsUrl: z.string(),
  contact: eventContactSchema,
  featuredImage: postImageSchema,
  blocks: z.array(eventBlockSchema),
});

/* ---- REST envelopes (inc/rest.php) ---- */

export const postsEnvelopeSchema = z.object({
  posts: z.array(blogPostSchema),
  page: z.number().int(),
  perPage: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

/** Header language-switcher entry (mirrors LanguageLink in LanguageToggle.vue
 * and progressnow_i18n_languages_for_post() in inc/i18n.php). Carried on the
 * single-post envelope so the JSON fast-path can refresh the switcher after a
 * client-side navigation. */
export const languageLinkSchema = z.object({
  code: z.string(),
  label: z.string(),
  name: z.string(),
  active: z.boolean(),
  url: z.string(),
});

/** The `seo` block every route payload carries (inc/seo.php
 * progressnow_seo_payload()) — what the PHP shell puts in <head>, so client
 * navigation can keep title/description/canonical/hreflang current. */
export const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  canonical: z.string(),
  robots: z.enum(["index,follow", "noindex,follow"]),
  hreflang: z.array(z.object({ lang: z.string(), href: z.string() })),
});

export const singlePostEnvelopeSchema = singlePostDataSchema.extend({
  readNext: z.array(blogPostSchema),
  /** Per-post ACF toggle (the SinglePost `showMetaRail` prop). */
  showMetaRail: z.boolean(),
  languages: z.array(languageLinkSchema),
  seo: seoSchema,
});

export const eventsEnvelopeSchema = z.object({
  events: z.array(chapterEventSchema),
  categories: z.array(eventCategorySchema),
});

export const categoriesEnvelopeSchema = z.object({
  categories: z.array(eventCategorySchema),
});

/* ---- Route payloads (inc/payloads.php) — shared by the PHP shell's
 * embedded __SHELL_DATA__ and the REST API, keyed by the payload-key grammar
 * `site:{lang}` | `routes` | `front:{lang}` | `page:{lang}:{path}` |
 * `post:{lang}:{slug}` | `event:{lang}:{slug}`. ---- */

/** A Chapter Settings image with its shipped-placeholder fallback (inc/identity.php). */
export const identityImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  is_default: z.boolean(),
});

export const identitySchema = z.object({
  name: z.string(),
  short_name: z.string(),
  region_label: z.string(),
  hero_headline: z.string(),
  logo_header: identityImageSchema,
  logo_footer: identityImageSchema,
  logo_square: identityImageSchema,
  share_image: identityImageSchema,
  hero_photo: identityImageSchema,
  who_image: identityImageSchema,
  cta_panel: identityImageSchema,
});

export const navLinkSchema = z.object({ label: z.string(), href: z.string() });

export const chapterSchema = z.object({
  name: z.string(),
  short_name: z.string(),
  region_label: z.string(),
  join_url: z.string(),
  newsletter_url: z.string(),
  contact_email: z.string(),
  footer_tagline: z.string(),
  instagram_url: z.string(),
  committees: z.array(z.object({ name: z.string(), desc: z.string() })),
  socials: z.array(z.object({ name: z.string(), url: z.string() })),
});

export const siteEnvelopeSchema = z.object({
  lang: z.string(),
  homeUrl: z.string(),
  apiBase: z.string(),
  languages: z.array(languageLinkSchema),
  chapter: chapterSchema,
  identity: identitySchema,
  header: z.object({
    navItems: z.array(navLinkSchema).nullable(),
    aboutItems: z.array(navLinkSchema).nullable(),
    joinLabel: z.string(),
    /** Short CTA for the mobile bar ("Join"). */
    joinShortLabel: z.string(),
    aboutLabel: z.string(),
    joinUrl: z.string(),
    logoUrl: z.string(),
    /** True while no logo is uploaded → the chrome draws the wordmark lockup. */
    logoIsDefault: z.boolean(),
    orgName: z.string(),
    homeUrl: z.string(),
  }),
  footer: z.object({
    logoUrl: z.string(),
    logoIsDefault: z.boolean(),
    orgName: z.string(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(navLinkSchema.extend({ external: z.boolean().optional() })),
        }),
      )
      .nullable(),
    socials: z.array(z.object({ name: z.string(), url: z.string() })),
    contactEmail: z.string(),
    tagline: z.string(),
    a11yLead: z.string(),
    a11yLinkLabel: z.string(),
  }),
  /** Polylang-registered UI strings, translated for `lang` (inc/i18n.php slugs). */
  strings: z.record(z.string(), z.string()),
  /** Post/event categories (the `/categories` envelope) — one fetch for the whole site. */
  categories: z.array(eventCategorySchema),
});

export const ROUTE_KINDS = [
  "front",
  "posts_index",
  "page",
  "about",
  "get_involved",
  "calendar",
  "styleguide",
  "post",
  "event",
] as const;

export const routeSchema = z.object({
  path: z.string(),
  kind: z.enum(ROUTE_KINDS),
  lang: z.string(),
  id: z.number().int(),
  template: z.string(),
  payloadKey: z.string(),
});

export const routesManifestSchema = z.object({
  routes: z.array(routeSchema),
  contentVersion: z.number().int(),
  generatedAt: z.string(),
});

export const teaserImageSchema = z.object({ src: z.string(), alt: z.string() }).nullable();

export const frontPageEnvelopeSchema = z.object({
  lang: z.string(),
  id: z.number().int(),
  path: z.string(),
  hero: z.object({
    subhead: z.string(),
    lede: z.string(),
    cta_primary_label: z.string(),
    cta_primary_url: z.string(),
    cta_secondary_label: z.string(),
    cta_secondary_url: z.string(),
  }),
  who: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    p1: z.string(),
    p2: z.string(),
    p3: z.string(),
    link_label: z.string(),
    link_url: z.string(),
  }),
  /** Closing CTA (progress-now-v4-home D1): editor-owned brush line, per language. */
  cta: z.object({ line: z.string() }),
  eventCount: z.number().int(),
  events: z.array(
    z.object({
      day: z.string(),
      month: z.string(),
      title: z.string(),
      when: z.string(),
      where: z.string(),
      url: z.string(),
    }),
  ),
  calendarUrl: z.string(),
  blog: z.object({
    featured: z
      .object({
        cat: postCatSchema,
        cat_label: z.string(),
        date: z.string(),
        read: z.string(),
        title: z.string(),
        excerpt: z.string(),
        url: z.string(),
        image: teaserImageSchema,
      })
      .nullable(),
    rows: z.array(
      z.object({
        cat: postCatSchema,
        cat_label: z.string(),
        title: z.string(),
        date: z.string(),
        url: z.string(),
        image: teaserImageSchema,
      }),
    ),
  }),
  languages: z.array(languageLinkSchema),
  seo: seoSchema,
});

const linkRowSchema = z.object({ label: z.string(), url: z.string(), external: z.boolean() });
const faqRowSchema = z.object({ question: z.string(), answer: z.string() });
const sectionSchema = z.object({ visible: z.boolean(), heading: z.string() });

/** About page ACF group context (inc/pages.php progressnow_about_context()). */
export const aboutGroupSchema = z.object({
  mission: z.object({ visible: z.boolean(), eyebrow: z.string(), body: z.string() }),
  chapter: sectionSchema.extend({
    p1: z.string(),
    p2: z.string(),
    photo: z.object({ src: z.string(), alt: z.string() }).nullable(),
    ctas: z.array(linkRowSchema),
  }),
  history: sectionSchema.extend({
    body: z.string(),
    timeline: z.array(z.object({ year: z.string(), text: z.string() })),
  }),
  counties: sectionSchema.extend({
    intro: z.string(),
    cards: z.array(z.object({ name: z.string(), cities: z.string(), note: z.string() })),
  }),
  committees: sectionSchema.extend({ intro: z.string(), link: linkRowSchema }),
  governance: sectionSchema.extend({
    intro: z.string(),
    docs: z.array(z.object({ title: z.string(), covers: z.string(), action: z.string(), url: z.string() })),
  }),
  faq: sectionSchema.extend({ rows: z.array(faqRowSchema) }),
  dues: sectionSchema.extend({ body: z.string() }),
  nav: z.array(z.object({ href: z.string(), label: z.string() })),
});

/** Get Involved page ACF group context (inc/pages.php progressnow_get_involved_context()). */
export const getInvolvedGroupSchema = z.object({
  join: sectionSchema.extend({
    steps: z.array(
      z.object({
        title: z.string(),
        body: z.string(),
        link_label: z.string(),
        href: z.string(),
        external: z.boolean(),
      }),
    ),
  }),
  committees: sectionSchema.extend({ intro: z.string() }),
  channels: sectionSchema.extend({
    items: z.array(
      z.object({
        label: z.string(),
        desc: z.string(),
        link_label: z.string(),
        url: z.string(),
        badge: z.string(),
        external: z.boolean(),
      }),
    ),
  }),
  faq: sectionSchema.extend({ items: z.array(faqRowSchema) }),
  card: z.object({
    heading: z.string(),
    body: z.string(),
    link_label: z.string(),
    url: z.string(),
    external: z.boolean(),
  }),
  related: z.array(linkRowSchema),
  nav: z.array(z.object({ href: z.string(), label: z.string() })),
});

export const pageEnvelopeSchema = z.object({
  lang: z.string(),
  id: z.number().int(),
  path: z.string(),
  kind: z.enum(ROUTE_KINDS),
  template: z.string(),
  title: z.string(),
  lede: z.string(),
  /** kses'd rendered post_content */
  content: z.string(),
  documents: z.array(z.object({ title: z.string(), meta: z.string(), url: z.string() })),
  grievance: z.object({ show: z.boolean(), body: z.string() }),
  newhere: z
    .object({ heading: z.string(), body: z.string(), link_label: z.string(), url: z.string(), external: z.boolean() })
    .nullable(),
  about: aboutGroupSchema.nullable(),
  gi: getInvolvedGroupSchema.nullable(),
  calendar: z
    .object({ apiBase: z.string(), icsUrl: z.string(), googleCalUrl: z.string() })
    .nullable(),
  languages: z.array(languageLinkSchema),
  seo: seoSchema,
});

export const singleEventEnvelopeSchema = z.object({
  lang: z.string(),
  id: z.number().int(),
  path: z.string(),
  event: singleEventDataSchema,
  categories: z.array(eventCategorySchema),
  related: z.array(relatedEventSchema),
  showRelated: z.boolean(),
  homeUrl: z.string(),
  calendarUrl: z.string(),
  languages: z.array(languageLinkSchema),
  seo: seoSchema,
});

/** What nuxt generate writes last (nuxt-js/modules/shell-manifest.ts) and the PHP
 * shell reads to emit the app's script/style tags (inc/shell.php). */
export const shellManifestSchema = z.object({
  buildId: z.string(),
  builtAt: z.string(),
  contentVersion: z.number().int(),
  entry: z.string(),
  css: z.array(z.string()),
  modulepreload: z.array(z.string()),
  /** Route chunks Nuxt hints with `<link rel="prefetch">` (optional for the shell). */
  prefetch: z.array(z.string()),
  /** `imports` of the importmap the entry chunk relies on (`#entry`). */
  importmap: z.record(z.string(), z.string()),
  prerenderedRoutes: z.number().int(),
  /** Public runtime config the shell serializes as `window.__NUXT__.config`
   * so the client entry boots (createApp, no hydration) without `__NUXT_DATA__`. */
  runtimeConfig: z.object({
    public: z.record(z.string(), z.unknown()),
    app: z
      .object({
        baseURL: z.string(),
        buildId: z.string(),
        buildAssetsDir: z.string(),
        cdnURL: z.string(),
      })
      .passthrough(),
  }),
});

/** The shell's embedded route data (`<script id="__SHELL_DATA__">`). */
export const shellDataSchema = z.object({
  lang: z.string(),
  routeKind: z.enum(ROUTE_KINDS).or(z.literal("search")).or(z.literal("not_found")),
  path: z.string(),
  contentVersion: z.number().int(),
  buildId: z.string(),
  data: z.record(z.string(), z.unknown()),
});

/* ---- Derived types (the one definition point) ---- */

export type PostCat = z.infer<typeof postCatSchema>;
export type EventCategory = z.infer<typeof eventCategorySchema>;
export type ChapterEvent = z.infer<typeof chapterEventSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type PostImage = z.infer<typeof postImageSchema>;
export type PostBlock = z.infer<typeof postBlockSchema>;
export type SinglePostData = z.infer<typeof singlePostDataSchema>;
export type EventBlock = z.infer<typeof eventBlockSchema>;
export type EventContact = z.infer<typeof eventContactSchema>;
export type RelatedEvent = z.infer<typeof relatedEventSchema>;
export type SingleEventData = z.infer<typeof singleEventDataSchema>;
export type PostsEnvelope = z.infer<typeof postsEnvelopeSchema>;
export type SinglePostEnvelope = z.infer<typeof singlePostEnvelopeSchema>;
export type EventsEnvelope = z.infer<typeof eventsEnvelopeSchema>;
export type CategoriesEnvelope = z.infer<typeof categoriesEnvelopeSchema>;
export type Seo = z.infer<typeof seoSchema>;
export type IdentityImage = z.infer<typeof identityImageSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type SiteEnvelope = z.infer<typeof siteEnvelopeSchema>;
export type RouteKind = (typeof ROUTE_KINDS)[number];
export type Route = z.infer<typeof routeSchema>;
export type RoutesManifest = z.infer<typeof routesManifestSchema>;
export type FrontPageEnvelope = z.infer<typeof frontPageEnvelopeSchema>;
export type AboutGroup = z.infer<typeof aboutGroupSchema>;
export type GetInvolvedGroup = z.infer<typeof getInvolvedGroupSchema>;
export type PageEnvelope = z.infer<typeof pageEnvelopeSchema>;
export type SingleEventEnvelope = z.infer<typeof singleEventEnvelopeSchema>;
export type ShellManifest = z.infer<typeof shellManifestSchema>;
export type ShellData = z.infer<typeof shellDataSchema>;
