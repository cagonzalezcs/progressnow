/**
 * Client-side navigation layer.
 *
 * Intercepts internal <a> clicks, fetches the destination, and swaps only the
 * <main id="main"> content while SiteHeader/SiteFooter stay mounted — wrapped in
 * document.startViewTransition() for a seamless animated swap. Fully progressive:
 * with JS off, an unsupported browser, or any failure, navigation falls back to a
 * normal full-page load.
 *
 * Phases: (1) sitewide HTML swap + View Transitions, (2) hover/focus prefetch.
 */
import { nextTick } from "vue";
import { ApiError, fetchSinglePost, isAbortError } from "@/lib/api";
import { mountIslands, mountIslandsAsync, unmountIslands } from "./islands";
import { setLocation } from "@/lib/location";
import { setLanguages } from "@/lib/languages";
import { closeMenu } from "@/lib/menu";
import type { LanguageLink } from "@/components/site/LanguageToggle.vue";

/** Resolved destination content — either a parsed HTML document or a built,
 * ready-to-mount node from the JSON fast-path. */
type ResolvedMain =
  | { kind: "html"; doc: Document }
  | { kind: "json"; node: HTMLElement; title: string; languages: LanguageLink[] };

/** Optional shared-element morph carried from click → commit. */
interface MorphContext {
  /** The card image element in the OLD page to morph from. */
  fromEl: HTMLElement;
}

/** Extra options threaded through a navigation. */
interface NavOptions {
  push: boolean;
  /** Present when the click is a blog archive → single JSON fast-path. */
  slug?: string;
  morph?: MorphContext;
}

const VT_HERO = "post-hero";

let current: AbortController | null = null;
let liveRegion: HTMLElement | null = null;
let apiBase = "";
/** Polylang slug of the current page — scopes the single-post JSON fast-path. */
let lang = "";

/** In-flight/settled prefetch responses keyed by URL href (Phase 2). */
const prefetchCache = new Map<string, Promise<string>>();
const PREFETCH_MAX = 30;

/** Scroll position (ignoring hash) per page, keyed by path+search. */
const scrollPositions = new Map<string, number>();
let scrollWriteQueued = false;

function scrollKey(url: URL | Location = window.location): string {
  return `${url.pathname}${url.search}`;
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export function initNavigation(): void {
  if (!supportsFetch()) return; // nothing to enhance without fetch
  // Logged-in chrome (admin bar) lives outside #main and can't survive partial
  // swaps — its Edit link would keep pointing at the first-loaded page. Full loads.
  if (document.getElementById("wpadminbar")) return;
  history.scrollRestoration = "manual";
  apiBase = readApiBase();
  lang = readLang();

  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPopState);

  // Continuously record the current page's scroll so back/forward can restore it.
  window.addEventListener("scroll", queueScrollWrite, { passive: true });

  // Phase 2: warm the cache on intent.
  document.addEventListener("mouseover", onPrefetchIntent);
  document.addEventListener("focusin", onPrefetchIntent);
  document.addEventListener("touchstart", onPrefetchIntent, { passive: true });

  liveRegion = createLiveRegion();
}

// ---------------------------------------------------------------------------
// Click interception
// ---------------------------------------------------------------------------

function onClick(e: MouseEvent): void {
  if (e.defaultPrevented) return; // an island (pagination, dropdown) already handled it
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const a = (e.target as Element | null)?.closest("a");
  if (!a) return;

  const url = navigableUrl(a);
  if (!url) return;

  // Same page + hash → let the browser scroll natively.
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    if (url.hash) return; // native anchor scroll
    e.preventDefault(); // exact same URL — no-op
    return;
  }

  e.preventDefault();
  void navigate(url, blogFastPath(a, url));
}

/**
 * Detect an archive → single-post click that can be served from JSON, and set up
 * the image → hero morph. Returns plain nav options otherwise.
 */
function blogFastPath(a: HTMLAnchorElement, url: URL): NavOptions {
  const base: NavOptions = { push: true };
  if (!apiBase) return base;
  if (!a.hasAttribute("data-blog-link")) return base;
  if (!document.querySelector('[data-vue-island="BlogArchive"]')) return base; // not on an archive
  const slug = lastSegment(url.pathname);
  if (!slug) return base;

  const fromEl = findCardImage(a);
  return { push: true, slug, morph: fromEl ? { fromEl } : undefined };
}

/** The card's image element — inside the anchor (PostCard) or its card ancestor. */
function findCardImage(a: HTMLAnchorElement): HTMLElement | null {
  return (
    a.querySelector<HTMLElement>("[data-post-image]") ??
    a.closest("article")?.querySelector<HTMLElement>("[data-post-image]") ??
    null
  );
}

function lastSegment(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

/**
 * Returns a same-origin, client-navigable URL for an anchor, or null if the link
 * should be left to the browser (external, new tab, download, opt-out, non-http).
 * Shared by the click handler and prefetch.
 */
function navigableUrl(a: HTMLAnchorElement): URL | null {
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download")) return null;
  if (a.hasAttribute("data-native-nav")) return null;
  if (a.rel && /\bexternal\b/.test(a.rel)) return null;

  const href = a.getAttribute("href");
  if (!href || href.startsWith("#")) return null;

  let url: URL;
  try {
    url = new URL(a.href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url;
}

// ---------------------------------------------------------------------------
// Navigation orchestration
// ---------------------------------------------------------------------------

async function navigate(url: URL, opts: NavOptions): Promise<void> {
  current?.abort();
  const ctl = new AbortController();
  current = ctl;

  // Collapse the mobile menu panel *before* the View Transition snapshots the
  // page so the header group holds still while the content cross-fades. The
  // data-navigating flag marks the in-flight navigation for any chrome that
  // wants to react to it.
  document.documentElement.setAttribute("data-navigating", "");
  closeMenu();

  try {
    const next = await resolveMain(url, opts, ctl.signal);
    if (ctl !== current) return; // superseded
    await commit(url, next, opts);
  } catch (err) {
    if (isAbortError(err)) return;
    console.warn("[nav] falling back to full load", err);
    window.location.href = url.href;
  } finally {
    document.documentElement.removeAttribute("data-navigating");
  }
}

async function resolveMain(
  url: URL,
  opts: NavOptions,
  signal: AbortSignal,
): Promise<ResolvedMain> {
  // JSON fast-path: archive → single. Falls back to an HTML swap on any REST
  // failure (404/contract/network), which itself falls back to a full load.
  if (opts.slug) {
    try {
      return await buildMainFromJson(opts.slug, signal);
    } catch (err) {
      if (isAbortError(err)) throw err;
      if (!(err instanceof ApiError)) throw err;
      /* fall through to HTML swap */
    }
  }

  const html = await fetchDocument(url, signal);
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc.getElementById("main")) {
    throw new Error("destination has no #main");
  }
  return { kind: "html", doc };
}

/** Build the new <main> content for a single post entirely from JSON. */
async function buildMainFromJson(slug: string, signal: AbortSignal): Promise<ResolvedMain> {
  const env = await fetchSinglePost(apiBase, slug, lang, signal);
  const { readNext, languages, ...post } = env;
  const props = { post, posts: readNext, blogUrl: "/blog/", homeUrl: "/" };

  const node = document.createElement("div");
  node.setAttribute("data-vue-island", "SinglePost");
  node.dataset.props = JSON.stringify(props);

  return { kind: "json", node, title: `${post.title}`, languages };
}

async function fetchDocument(url: URL, signal: AbortSignal): Promise<string> {
  const cached = prefetchCache.get(url.href);
  if (cached) {
    try {
      return await cached;
    } catch {
      prefetchCache.delete(url.href); // poisoned entry — fetch fresh below
    }
  }

  const res = await fetch(url.href, {
    signal,
    headers: { Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) throw new Error(`non-HTML response (${ct})`);
  return res.text();
}

async function commit(url: URL, next: ResolvedMain, opts: NavOptions): Promise<void> {
  const { push, morph } = opts;
  if (push) history.pushState(null, "", url.href);

  const apply = async (useMorph: boolean): Promise<void> => {
    const oldMain = document.getElementById("main");
    if (!oldMain) {
      window.location.href = url.href;
      return;
    }
    unmountIslands(oldMain);

    if (next.kind === "html") {
      const newMain = next.doc.getElementById("main");
      if (!newMain) {
        window.location.href = url.href;
        return;
      }
      oldMain.replaceChildren(...Array.from(newMain.childNodes));
      syncHead(next.doc);
      setLocation(url.pathname, url.search);
      // SiteHeader stays mounted across swaps, so refresh its switcher URLs from
      // the fetched page's header island (the JSON fast-path has no doc to read).
      const langs = readLanguagesFromDoc(next.doc);
      if (langs) setLanguages(langs);
      mountIslands(oldMain); // SSR markup is already present; hydrate async
    } else {
      oldMain.replaceChildren(next.node);
      patchHeadForJson(url, next.title);
      setLocation(url.pathname, url.search);
      // Refresh the switcher for the single post (the REST envelope carries its
      // per-language URLs). Empty only when Polylang is inactive — leave as-is.
      if (next.languages.length) setLanguages(next.languages);
      // Await hydration so the new hero exists before the transition snapshots it.
      await mountIslandsAsync(oldMain);
      if (useMorph) {
        await nextTick();
        const hero = oldMain.querySelector<HTMLElement>("[data-post-hero]");
        if (hero) hero.style.viewTransitionName = VT_HERO;
      }
    }
    finishNavigation(url, oldMain);
  };

  const useVT = "startViewTransition" in document && !prefersReducedMotion();
  if (!useVT) {
    await apply(false);
    return;
  }

  if (morph) morph.fromEl.style.viewTransitionName = VT_HERO;
  const transition = (document as DocumentWithVT).startViewTransition(() =>
    apply(Boolean(morph)),
  );
  // A superseded transition rejects `finished` with InvalidStateError — that's
  // expected during rapid navigation; swallow it, but always clear morph names.
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (morph) morph.fromEl.style.viewTransitionName = "";
      const hero = document
        .getElementById("main")
        ?.querySelector<HTMLElement>("[data-post-hero]");
      if (hero) hero.style.viewTransitionName = "";
    });
}

/** Read the fresh language-switcher URLs from the fetched page's SiteHeader
 * island props. Returns null (leaving the current URLs in place) if the island
 * or its props are missing/unparseable. */
export function readLanguagesFromDoc(doc: Document): LanguageLink[] | null {
  const el = doc.querySelector<HTMLElement>('[data-vue-island="SiteHeader"]');
  if (!el?.dataset.props) return null;
  try {
    const langs = (JSON.parse(el.dataset.props) as { languages?: LanguageLink[] })
      .languages;
    return Array.isArray(langs) ? langs : null;
  } catch {
    return null;
  }
}

/** Head patch for the JSON path (no fetched <head>): title + canonical only. */
function patchHeadForJson(url: URL, title: string): void {
  document.title = title;
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url.href;
}

function finishNavigation(url: URL, main: HTMLElement): void {
  // Focus the swapped region for a11y (matches the skip-link target).
  main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });

  // Scroll: to the hash target if present, else the top of the new page.
  if (url.hash) {
    document.querySelector(url.hash)?.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }

  announce(document.title);
}

// ---------------------------------------------------------------------------
// <head> sync — allowlisted tags only; never touch wp_head scripts/styles.
// ---------------------------------------------------------------------------

function syncHead(doc: Document): void {
  document.title = doc.title;

  syncMeta('meta[name="description"]', doc);
  syncMeta('link[rel="canonical"]', doc);
  syncMeta('meta[name="progressnow:api-base"]', doc);
  syncMeta('meta[name="progressnow:lang"]', doc);
  syncMetaGroup('meta[property^="og:"]', doc);
  syncMetaGroup('meta[name^="twitter:"]', doc);

  // Body class / template drive .admin-bar offsets and template-scoped styles.
  document.body.className = doc.body.className;
  const tmpl = doc.body.getAttribute("data-template");
  if (tmpl !== null) document.body.setAttribute("data-template", tmpl);
}

/** Replace a single unique head element's attributes from the fetched doc. */
function syncMeta(selector: string, doc: Document): void {
  const next = doc.head.querySelector(selector);
  const curr = document.head.querySelector(selector);
  if (!next) {
    curr?.remove();
    return;
  }
  const clone = next.cloneNode(true) as Element;
  if (curr) curr.replaceWith(clone);
  else document.head.appendChild(clone);
}

/** Replace a whole group of head tags (og:*, twitter:*) wholesale. */
function syncMetaGroup(selector: string, doc: Document): void {
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
  doc.head.querySelectorAll(selector).forEach((el) => {
    document.head.appendChild(el.cloneNode(true));
  });
}

// ---------------------------------------------------------------------------
// History / scroll
// ---------------------------------------------------------------------------

function onPopState(): void {
  const url = new URL(window.location.href);
  void navigate(url, { push: false }).then(() => {
    const y = scrollPositions.get(scrollKey(url)) ?? 0;
    window.scrollTo(0, y);
  });
}

function queueScrollWrite(): void {
  if (scrollWriteQueued) return;
  scrollWriteQueued = true;
  requestAnimationFrame(() => {
    scrollWriteQueued = false;
    scrollPositions.set(scrollKey(), window.scrollY);
  });
}

// ---------------------------------------------------------------------------
// Prefetch (Phase 2)
// ---------------------------------------------------------------------------

function onPrefetchIntent(e: Event): void {
  if (!shouldPrefetch()) return;
  const a = (e.target as Element | null)?.closest("a");
  if (!a) return;
  const url = navigableUrl(a);
  if (!url) return;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return; // same page
  }
  warm(url);
}

function warm(url: URL): void {
  if (prefetchCache.has(url.href)) return;
  if (prefetchCache.size >= PREFETCH_MAX) {
    const oldest = prefetchCache.keys().next().value;
    if (oldest) prefetchCache.delete(oldest);
  }
  const promise = fetch(url.href, { headers: { Accept: "text/html" }, redirect: "follow" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("text/html")) throw new Error("non-HTML");
      return res.text();
    })
    .catch((err) => {
      prefetchCache.delete(url.href); // don't cache failures
      throw err;
    });
  prefetchCache.set(url.href, promise);
  void promise.catch(() => {}); // swallow unhandled rejection; click path handles it
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function shouldPrefetch(): boolean {
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** The View Transitions API is newer than the ambient DOM lib in some setups. */
interface ViewTransition {
  finished: Promise<void>;
}
type DocumentWithVT = Document & {
  startViewTransition(cb: () => void | Promise<void>): ViewTransition;
};

function readApiBase(): string {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="progressnow:api-base"]')?.content ?? ""
  );
}

function readLang(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="progressnow:lang"]')?.content ?? "";
}

function supportsFetch(): boolean {
  return typeof window.fetch === "function";
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createLiveRegion(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.className = "sr-only";
  el.style.cssText =
    "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;";
  document.body.appendChild(el);
  return el;
}

function announce(title: string): void {
  if (liveRegion) liveRegion.textContent = title;
}
