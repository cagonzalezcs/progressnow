/* Fixture-backed mock of `GET /wp-json/progressnow/v1/*` (openspec design
 * D10). Enabled by NUXT_MOCK_API=1: the nitro route under
 * server/routes/mock/v1/ serves it and modules/routes-manifest.ts prerenders
 * its route list, so `nuxt generate` runs in CI without a live WordPress.
 *
 * The fixtures are the theme's dual-sided contract fixtures
 * (wp-content/themes/progressnow/tests/fixtures, written by PHPUnit), so the
 * mock's shapes cannot drift from what WordPress serializes. Only URL-ish
 * fields (lang, path, canonical, permalinks) are overlaid per route.
 */
import siteFixture from "../../wp-content/themes/progressnow/tests/fixtures/site.json";
import frontFixture from "../../wp-content/themes/progressnow/tests/fixtures/front-page.json";
import aboutFixture from "../../wp-content/themes/progressnow/tests/fixtures/page-about.json";
import getInvolvedFixture from "../../wp-content/themes/progressnow/tests/fixtures/page-get-involved.json";
import calendarFixture from "../../wp-content/themes/progressnow/tests/fixtures/page-calendar.json";
import postsFixture from "../../wp-content/themes/progressnow/tests/fixtures/posts-envelope.json";
import singlePostFixture from "../../wp-content/themes/progressnow/tests/fixtures/single-post.json";
import singleEventFixture from "../../wp-content/themes/progressnow/tests/fixtures/single-event.json";
import chapterEventFixture from "../../wp-content/themes/progressnow/tests/fixtures/chapter-event.json";
import categoriesFixture from "../../wp-content/themes/progressnow/tests/fixtures/categories.json";

export const MOCK_ORIGIN = "https://mock.example";
export const MOCK_CONTENT_VERSION = 7;

type Lang = "en" | "es";

interface MockPage {
  lang: Lang;
  path: string;
  slug: string;
  kind: "posts_index" | "about" | "get_involved" | "calendar" | "page";
  template: string;
  title: string;
}

const HOME: Record<Lang, string> = { en: "/", es: "/es/" };

const PAGES: MockPage[] = [
  { lang: "en", path: "/blog/", slug: "blog", kind: "posts_index", template: "page.php", title: "Chapter Blog" },
  { lang: "en", path: "/about/", slug: "about", kind: "about", template: "page-templates/about.php", title: "About the Chapter" },
  { lang: "en", path: "/get-involved/", slug: "get-involved", kind: "get_involved", template: "page-templates/get-involved.php", title: "Get involved" },
  { lang: "en", path: "/calendar/", slug: "calendar", kind: "calendar", template: "page-templates/calendar.php", title: "Event Calendar" },
  { lang: "en", path: "/bylaws/", slug: "bylaws", kind: "page", template: "page.php", title: "Bylaws & Code of Conduct" },
  { lang: "es", path: "/es/blog/", slug: "blog", kind: "posts_index", template: "page.php", title: "Blog del capítulo" },
  { lang: "es", path: "/es/acerca/", slug: "acerca", kind: "about", template: "page-templates/about.php", title: "Sobre el capítulo" },
  { lang: "es", path: "/es/participa/", slug: "participa", kind: "get_involved", template: "page-templates/get-involved.php", title: "Participa" },
  { lang: "es", path: "/es/calendario/", slug: "calendario", kind: "calendar", template: "page-templates/calendar.php", title: "Calendario de eventos" },
];

const POST_SLUG = "contract-test-post";
const EVENT_SLUG = "contract-test-event";

function langOf(value: unknown): Lang {
  return value === "es" ? "es" : "en";
}

function abs(path: string): string {
  return `${MOCK_ORIGIN}${path}`;
}

function translationOf(lang: Lang, kind: MockPage["kind"] | "front" | "post" | "event"): string {
  if (kind === "front") return HOME[lang];
  if (kind === "post") return `${HOME[lang]}blog/${POST_SLUG}/`;
  if (kind === "event") return `${HOME[lang]}events/${EVENT_SLUG}/`;
  return PAGES.find((p) => p.lang === lang && p.kind === kind)?.path ?? HOME[lang];
}

function languages(lang: Lang, kind: Parameters<typeof translationOf>[1]) {
  return (["en", "es"] as Lang[]).map((code) => ({
    code,
    label: code.toUpperCase(),
    name: code === "en" ? "English" : "Español",
    active: code === lang,
    url: abs(translationOf(code, kind)),
  }));
}

function seo(base: { title: string; description: string; robots?: string }, lang: Lang, kind: Parameters<typeof translationOf>[1], path: string) {
  return {
    title: base.title,
    description: base.description,
    canonical: abs(path),
    robots: base.robots ?? "index,follow",
    hreflang: (["en", "es"] as Lang[]).map((code) => ({ lang: code, href: abs(translationOf(code, kind)) })),
  };
}

export function mockRoutesManifest() {
  const routes: Array<{ path: string; kind: string; lang: string; id: number; template: string; payloadKey: string }> = [];
  let id = 1;
  for (const lang of ["en", "es"] as Lang[]) {
    routes.push({ path: HOME[lang], kind: "front", lang, id: id++, template: "front-page", payloadKey: `front:${lang}` });
    for (const page of PAGES.filter((p) => p.lang === lang)) {
      routes.push({ path: page.path, kind: page.kind, lang, id: id++, template: page.template, payloadKey: `page:${lang}:${page.slug}` });
    }
    routes.push({ path: translationOf(lang, "post"), kind: "post", lang, id: id++, template: "single.php", payloadKey: `post:${lang}:${POST_SLUG}` });
    routes.push({ path: translationOf(lang, "event"), kind: "event", lang, id: id++, template: "single-event.php", payloadKey: `event:${lang}:${EVENT_SLUG}` });
  }
  return { routes, contentVersion: MOCK_CONTENT_VERSION, generatedAt: "2026-01-01T00:00:00+00:00" };
}

export function mockSite(langValue: unknown) {
  const lang = langOf(langValue);
  const home = abs(HOME[lang]);
  return {
    ...siteFixture,
    lang,
    homeUrl: home,
    apiBase: `${MOCK_ORIGIN}/mock/v1`,
    languages: languages(lang, "front"),
    header: {
      ...siteFixture.header,
      homeUrl: home,
      navItems: [
        { label: lang === "es" ? "Calendario" : "Calendar", href: translationOf(lang, "calendar") },
        { label: "Blog", href: translationOf(lang, "posts_index") },
        { label: lang === "es" ? "Participa" : "Get Involved", href: translationOf(lang, "get_involved") },
      ],
      aboutItems: [
        { label: lang === "es" ? "Sobre el capítulo" : "About the Chapter", href: translationOf(lang, "about") },
        { label: lang === "es" ? "Misión e historia" : "Mission & History", href: `${translationOf(lang, "about")}#mission` },
        { label: "FAQ", href: `${translationOf(lang, "about")}#faq` },
      ],
    },
    categories: categoriesFixture.categories,
  };
}

export function mockFrontPage(langValue: unknown) {
  const lang = langOf(langValue);
  return {
    ...frontFixture,
    lang,
    path: HOME[lang],
    calendarUrl: abs(translationOf(lang, "calendar")),
    events: frontFixture.events.map((e) => ({ ...e, url: abs(translationOf(lang, "event")) })),
    blog: {
      ...frontFixture.blog,
      featured: frontFixture.blog.featured ? { ...frontFixture.blog.featured, url: abs(translationOf(lang, "post")) } : null,
      rows: [
        { cat: "labor", cat_label: "Labor", title: "Know your rights on the job", date: "May 12, 2026", url: abs(translationOf(lang, "post")), image: null },
        { cat: "mutual", cat_label: "Mutual Aid", title: "Community fridge: spring report", date: "April 30, 2026", url: abs(translationOf(lang, "post")), image: null },
      ],
    },
    languages: languages(lang, "front"),
    seo: seo(frontFixture.seo, lang, "front", HOME[lang]),
  };
}

export function mockPage(pathValue: string, langValue: unknown) {
  const lang = langOf(langValue);
  const slug = pathValue.replace(/^\/+|\/+$/g, "");
  const page = PAGES.find((p) => p.lang === lang && p.slug === slug);
  if (!page) return null;

  const base =
    page.kind === "about" ? aboutFixture : page.kind === "get_involved" ? getInvolvedFixture : page.kind === "calendar" ? calendarFixture : { ...calendarFixture, calendar: null, about: null, gi: null };
  const content =
    page.kind === "page"
      ? "<p>Our chapter is governed by its members. These documents spell out how we make decisions together, how we treat each other, and what to do when something goes wrong.</p>"
      : page.kind === "posts_index"
        ? ""
        : base.content;

  return {
    ...base,
    lang,
    id: 100 + PAGES.indexOf(page),
    path: page.path,
    kind: page.kind,
    template: page.template,
    title: page.title,
    content,
    documents:
      page.kind === "page"
        ? [{ title: "Chapter Bylaws", meta: "PDF · 12 pages", url: `${MOCK_ORIGIN}/wp-content/uploads/bylaws.pdf` }]
        : [],
    calendar:
      page.kind === "calendar"
        ? { apiBase: `${MOCK_ORIGIN}/mock/v1`, icsUrl: `${MOCK_ORIGIN}/feed/chapter-events/`, googleCalUrl: "https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fmock.example%2Ffeed%2Fchapter-events%2F" }
        : null,
    languages: languages(lang, page.kind),
    seo: seo({ title: `${page.title} – Progress Now`, description: base.seo.description }, lang, page.kind, page.path),
  };
}

export function mockPosts(query: Record<string, unknown>) {
  const lang = langOf(query.lang);
  const s = typeof query.s === "string" ? query.s.trim().toLowerCase() : "";
  const category = typeof query.category === "string" ? query.category : "";
  let posts = postsFixture.posts.map((p) => ({ ...p, url: abs(translationOf(lang, "post")) }));
  if (s) posts = posts.filter((p) => p.title.toLowerCase().includes(s));
  if (category && category !== "all") posts = posts.filter((p) => p.cat === category);
  return { ...postsFixture, posts, total: posts.length, totalPages: posts.length ? 1 : 0 };
}

export function mockSinglePost(slug: string, langValue: unknown) {
  if (slug !== POST_SLUG) return null;
  const lang = langOf(langValue);
  const path = translationOf(lang, "post");
  return {
    ...singlePostFixture,
    languages: languages(lang, "post"),
    seo: seo(singlePostFixture.seo, lang, "post", path),
  };
}

export function mockEvents(query: Record<string, unknown>) {
  const lang = langOf(query.lang);
  return {
    events: [{ ...chapterEventFixture, url: abs(translationOf(lang, "event")) }],
    categories: categoriesFixture.categories,
  };
}

export function mockSingleEvent(slug: string, langValue: unknown) {
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

export function mockCategories() {
  return categoriesFixture;
}

/** Route a `/mock/v1/<path>?<query>` request to the fixture builder. */
export function mockDispatch(path: string, query: Record<string, unknown>): unknown | null {
  const segments = path.replace(/^\/+|\/+$/g, "").split("/");
  const [head, ...rest] = segments;
  switch (head) {
    case "site":
      return mockSite(query.lang);
    case "routes":
      return mockRoutesManifest();
    case "front-page":
      return mockFrontPage(query.lang);
    case "pages":
      return mockPage(rest.join("/"), query.lang);
    case "posts":
      return rest.length ? mockSinglePost(rest[0]!, query.lang) : mockPosts(query);
    case "events":
      return rest.length ? mockSingleEvent(rest[0]!, query.lang) : mockEvents(query);
    case "categories":
      return mockCategories();
    default:
      return null;
  }
}
