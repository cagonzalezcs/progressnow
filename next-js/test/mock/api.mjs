/* Fixture-backed mock of `GET /wp-json/progressnow/v1/*` (openspec design D10,
 * next-test-harness § Fixture-backed mock API). Ported from the Nuxt
 * rendition's shared/mock-api.ts: the fixtures are the theme's dual-sided
 * contract fixtures (wp-content/themes/progressnow/tests/fixtures, written by
 * PHPUnit), so the mock's shapes cannot drift from what WordPress serializes.
 * Only URL-ish fields (lang, path, canonical, permalinks) are overlaid per
 * route. Plain ESM so both the standalone server (node) and vitest import it.
 *
 * E2E hooks (not part of the WordPress contract): `setPostTitle`,
 * `setCanonicalOrigin`, `setFailing`, `reset`, and the request log. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FIXTURES = new URL("../../../wp-content/themes/progressnow/tests/fixtures/", import.meta.url);
/** @param {string} name */
function fixture(name) {
  return JSON.parse(readFileSync(fileURLToPath(new URL(`${name}.json`, FIXTURES)), "utf8"));
}

const siteFixture = fixture("site");
const frontFixture = fixture("front-page");
const aboutFixture = fixture("page-about");
const getInvolvedFixture = fixture("page-get-involved");
const calendarFixture = fixture("page-calendar");
const postsFixture = fixture("posts-envelope");
const singlePostFixture = fixture("single-post");
const singleEventFixture = fixture("single-event");
const chapterEventFixture = fixture("chapter-event");
const categoriesFixture = fixture("categories");

export const MOCK_CONTENT_VERSION = 7;
export const POST_SLUG = "contract-test-post";
export const EVENT_SLUG = "contract-test-event";

/** @typedef {"en" | "es"} Lang */
/** @typedef {{ lang: Lang; path: string; slug: string; kind: "posts_index" | "about" | "get_involved" | "calendar" | "page" | "styleguide"; template: string; title: string }} MockPage */

/** @type {Record<Lang, string>} */
const HOME = { en: "/", es: "/es/" };

/** @type {MockPage[]} */
export const PAGES = [
  {
    lang: "en",
    path: "/blog/",
    slug: "blog",
    kind: "posts_index",
    template: "page.php",
    title: "Chapter Blog",
  },
  {
    lang: "en",
    path: "/about/",
    slug: "about",
    kind: "about",
    template: "page-templates/about.php",
    title: "About the Chapter",
  },
  {
    lang: "en",
    path: "/get-involved/",
    slug: "get-involved",
    kind: "get_involved",
    template: "page-templates/get-involved.php",
    title: "Get involved",
  },
  {
    lang: "en",
    path: "/calendar/",
    slug: "calendar",
    kind: "calendar",
    template: "page-templates/calendar.php",
    title: "Event Calendar",
  },
  {
    lang: "en",
    path: "/bylaws/",
    slug: "bylaws",
    kind: "page",
    template: "page.php",
    title: "Bylaws & Code of Conduct",
  },
  {
    lang: "es",
    path: "/es/blog/",
    slug: "blog",
    kind: "posts_index",
    template: "page.php",
    title: "Blog del capítulo",
  },
  {
    lang: "es",
    path: "/es/acerca/",
    slug: "acerca",
    kind: "about",
    template: "page-templates/about.php",
    title: "Sobre el capítulo",
  },
  {
    lang: "es",
    path: "/es/participa/",
    slug: "participa",
    kind: "get_involved",
    template: "page-templates/get-involved.php",
    title: "Participa",
  },
  {
    lang: "es",
    path: "/es/calendario/",
    slug: "calendario",
    kind: "calendar",
    template: "page-templates/calendar.php",
    title: "Calendario de eventos",
  },
  {
    lang: "en",
    path: "/styleguide/",
    slug: "styleguide",
    kind: "styleguide",
    template: "page-templates/styleguide.php",
    title: "Styleguide",
  },
];

/** @param {unknown} value @returns {Lang} */
function langOf(value) {
  return value === "es" ? "es" : "en";
}

/**
 * @param {{ origin?: string }} [options] origin used for every absolute URL
 *   the envelopes carry (homeUrl, permalinks, languages[].url) — the
 *   "WordPress origin" the app re-homes links from.
 */
export function createMock(options = {}) {
  const origin = options.origin ?? "https://mock.example";
  /** @type {{ canonicalOrigin: string | null; postTitles: Map<string, string>; failing: boolean }} */
  const state = { canonicalOrigin: null, postTitles: new Map(), failing: false };
  /** @type {string[]} */
  const requests = [];

  /** @param {string} path */
  const abs = (path) => `${origin}${path}`;
  /** Canonical/hreflang honor CHAPTER_CANONICAL_ORIGIN (seo-metadata delta). @param {string} path */
  const canonicalAbs = (path) => `${state.canonicalOrigin ?? origin}${path}`;

  /** @param {Lang} lang @param {MockPage["kind"] | "front" | "post" | "event"} kind */
  function translationOf(lang, kind) {
    if (kind === "front") return HOME[lang];
    if (kind === "post") return `${HOME[lang]}blog/${POST_SLUG}/`;
    if (kind === "event") return `${HOME[lang]}events/${EVENT_SLUG}/`;
    return PAGES.find((p) => p.lang === lang && p.kind === kind)?.path ?? HOME[lang];
  }

  /** @param {Lang} lang @param {Parameters<typeof translationOf>[1]} kind */
  function languages(lang, kind) {
    return /** @type {Lang[]} */ (["en", "es"]).map((code) => ({
      code,
      label: code.toUpperCase(),
      name: code === "en" ? "English" : "Español",
      active: code === lang,
      url: abs(translationOf(code, kind)),
    }));
  }

  /**
   * @param {{ title: string; description: string; robots?: string }} base
   * @param {Lang} lang @param {Parameters<typeof translationOf>[1]} kind @param {string} path
   */
  function seo(base, lang, kind, path) {
    return {
      title: base.title,
      description: base.description,
      canonical: canonicalAbs(path),
      robots: base.robots ?? "index,follow",
      hreflang: /** @type {Lang[]} */ (["en", "es"]).map((code) => ({
        lang: code,
        href: canonicalAbs(translationOf(code, kind)),
      })),
    };
  }

  function routesManifest() {
    /** @type {Array<{ path: string; kind: string; lang: string; id: number; template: string; payloadKey: string }>} */
    const routes = [];
    let id = 1;
    for (const lang of /** @type {Lang[]} */ (["en", "es"])) {
      routes.push({
        path: HOME[lang],
        kind: "front",
        lang,
        id: id++,
        template: "front-page",
        payloadKey: `front:${lang}`,
      });
      for (const page of PAGES.filter((p) => p.lang === lang)) {
        routes.push({
          path: page.path,
          kind: page.kind,
          lang,
          id: id++,
          template: page.template,
          payloadKey: `page:${lang}:${page.slug}`,
        });
      }
      routes.push({
        path: translationOf(lang, "post"),
        kind: "post",
        lang,
        id: id++,
        template: "single.php",
        payloadKey: `post:${lang}:${POST_SLUG}`,
      });
      routes.push({
        path: translationOf(lang, "event"),
        kind: "event",
        lang,
        id: id++,
        template: "single-event.php",
        payloadKey: `event:${lang}:${EVENT_SLUG}`,
      });
    }
    return {
      routes,
      contentVersion: MOCK_CONTENT_VERSION,
      generatedAt: "2026-01-01T00:00:00+00:00",
    };
  }

  /** @param {unknown} langValue */
  function site(langValue) {
    const lang = langOf(langValue);
    const home = abs(HOME[lang]);
    return {
      ...siteFixture,
      lang,
      homeUrl: home,
      apiBase: `${origin}/wp-json/progressnow/v1`,
      languages: languages(lang, "front"),
      header: {
        ...siteFixture.header,
        homeUrl: home,
        navItems: [
          {
            label: lang === "es" ? "Calendario" : "Calendar",
            href: abs(translationOf(lang, "calendar")),
          },
          { label: "Blog", href: abs(translationOf(lang, "posts_index")) },
          {
            label: lang === "es" ? "Participa" : "Get Involved",
            href: abs(translationOf(lang, "get_involved")),
          },
        ],
        aboutItems: [
          {
            label: lang === "es" ? "Sobre el capítulo" : "About the Chapter",
            href: abs(translationOf(lang, "about")),
          },
          {
            label: lang === "es" ? "Misión e historia" : "Mission & History",
            href: `${abs(translationOf(lang, "about"))}#mission`,
          },
          { label: "FAQ", href: `${abs(translationOf(lang, "about"))}#faq` },
        ],
      },
      categories: categoriesFixture.categories,
    };
  }

  /** @param {unknown} langValue */
  function frontPage(langValue) {
    const lang = langOf(langValue);
    return {
      ...frontFixture,
      lang,
      path: HOME[lang],
      calendarUrl: abs(translationOf(lang, "calendar")),
      events: frontFixture.events.map((e) => ({ ...e, url: abs(translationOf(lang, "event")) })),
      blog: {
        ...frontFixture.blog,
        featured: frontFixture.blog.featured
          ? {
              ...frontFixture.blog.featured,
              title: titleOf(POST_SLUG, frontFixture.blog.featured.title),
              url: abs(translationOf(lang, "post")),
            }
          : null,
        rows: [
          {
            cat: "labor",
            cat_label: "Labor",
            title: "Know your rights on the job",
            date: "May 12, 2026",
            url: abs(translationOf(lang, "post")),
            image: null,
          },
          {
            cat: "mutual",
            cat_label: "Mutual Aid",
            title: "Community fridge: spring report",
            date: "April 30, 2026",
            url: abs(translationOf(lang, "post")),
            image: null,
          },
        ],
      },
      languages: languages(lang, "front"),
      seo: seo(frontFixture.seo, lang, "front", HOME[lang]),
    };
  }

  /** @param {string} pathValue @param {unknown} langValue */
  function page(pathValue, langValue) {
    const lang = langOf(langValue);
    const slug = pathValue.replace(/^\/+|\/+$/g, "");
    const entry = PAGES.find((p) => p.lang === lang && p.slug === slug);
    if (!entry) return null;

    const base =
      entry.kind === "about"
        ? aboutFixture
        : entry.kind === "get_involved"
          ? getInvolvedFixture
          : entry.kind === "calendar"
            ? calendarFixture
            : { ...calendarFixture, calendar: null, about: null, gi: null };
    const content =
      entry.kind === "page"
        ? "<p>Our chapter is governed by its members. These documents spell out how we make decisions together, how we treat each other, and what to do when something goes wrong.</p>"
        : entry.kind === "posts_index"
          ? ""
          : base.content;

    return {
      ...base,
      lang,
      id: 100 + PAGES.indexOf(entry),
      path: entry.path,
      kind: entry.kind,
      template: entry.template,
      title: entry.title,
      content,
      documents:
        entry.kind === "page"
          ? [
              {
                title: "Chapter Bylaws",
                meta: "PDF · 12 pages",
                url: `${origin}/wp-content/uploads/bylaws.pdf`,
              },
            ]
          : [],
      calendar:
        entry.kind === "calendar"
          ? {
              apiBase: `${origin}/wp-json/progressnow/v1`,
              icsUrl: `${origin}/feed/chapter-events/`,
              googleCalUrl: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${new URL(origin).host}/feed/chapter-events/`)}`,
            }
          : null,
      languages: languages(lang, entry.kind),
      seo: seo(
        { title: `${entry.title} – Progress Now`, description: base.seo.description },
        lang,
        entry.kind,
        entry.path,
      ),
    };
  }

  /** @param {string} slug @param {string} fallback */
  function titleOf(slug, fallback) {
    return state.postTitles.get(slug) ?? fallback;
  }

  /** @param {Record<string, unknown>} query */
  function posts(query) {
    const lang = langOf(query.lang);
    const s = typeof query.s === "string" ? query.s.trim().toLowerCase() : "";
    const category = typeof query.category === "string" ? query.category : "";
    let list = postsFixture.posts.map((p) => ({
      ...p,
      title: p.slug === POST_SLUG ? titleOf(POST_SLUG, p.title) : p.title,
      url: abs(translationOf(lang, "post")),
    }));
    if (s) list = list.filter((p) => p.title.toLowerCase().includes(s));
    if (category && category !== "all") list = list.filter((p) => p.cat === category);
    return { ...postsFixture, posts: list, total: list.length, totalPages: list.length ? 1 : 0 };
  }

  /** @param {string} slug @param {unknown} langValue */
  function singlePost(slug, langValue) {
    if (slug !== POST_SLUG) return null;
    const lang = langOf(langValue);
    const path = translationOf(lang, "post");
    return {
      ...singlePostFixture,
      title: titleOf(POST_SLUG, singlePostFixture.title),
      languages: languages(lang, "post"),
      seo: seo(
        { ...singlePostFixture.seo, title: titleOf(POST_SLUG, singlePostFixture.seo.title) },
        lang,
        "post",
        path,
      ),
    };
  }

  /** @param {Record<string, unknown>} query */
  function events(query) {
    const lang = langOf(query.lang);
    return {
      events: [{ ...chapterEventFixture, url: abs(translationOf(lang, "event")) }],
      categories: categoriesFixture.categories,
    };
  }

  /** @param {string} slug @param {unknown} langValue */
  function singleEvent(slug, langValue) {
    if (slug !== EVENT_SLUG) return null;
    const lang = langOf(langValue);
    const path = translationOf(lang, "event");
    return {
      ...singleEventFixture,
      lang,
      path,
      homeUrl: abs(HOME[lang]),
      calendarUrl: abs(translationOf(lang, "calendar")),
      languages: languages(lang, "event"),
      seo: seo(singleEventFixture.seo, lang, "event", path),
    };
  }

  /**
   * Route a `/wp-json/progressnow/v1/<path>?<query>` request to a fixture
   * builder. Returns null for unknown content (the server answers 404).
   * @param {string} path @param {Record<string, unknown>} query
   * @returns {unknown | null}
   */
  function dispatch(path, query) {
    const segments = path.replace(/^\/+|\/+$/g, "").split("/");
    const [head, ...rest] = segments;
    switch (head) {
      case "site":
        return site(query.lang);
      case "routes":
        return routesManifest();
      case "front-page":
        return frontPage(query.lang);
      case "pages":
        return page(rest.join("/"), query.lang);
      case "posts":
        return rest.length ? singlePost(rest[0], query.lang) : posts(query);
      case "events":
        return rest.length ? singleEvent(rest[0], query.lang) : events(query);
      case "categories":
        return categoriesFixture;
      default:
        return null;
    }
  }

  return {
    origin,
    dispatch,
    routesManifest,
    requests,
    /** @param {string} path */
    log(path) {
      requests.push(path);
    },
    get failing() {
      return state.failing;
    },
    /** @param {boolean} value */
    setFailing(value) {
      state.failing = value;
    },
    /** @param {string} slug @param {string} title */
    setPostTitle(slug, title) {
      state.postTitles.set(slug, title);
    },
    /** @param {string | null} canonicalOrigin */
    setCanonicalOrigin(canonicalOrigin) {
      state.canonicalOrigin = canonicalOrigin;
    },
    reset() {
      state.canonicalOrigin = null;
      state.postTitles.clear();
      state.failing = false;
      requests.length = 0;
    },
  };
}
