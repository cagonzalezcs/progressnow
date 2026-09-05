import { cacheLife, cacheTag } from "next/cache";
import { api, isApiError, type EventsParams, type PostsParams } from "@/lib/api";
import type {
  CategoriesEnvelope,
  EventsEnvelope,
  FrontPageEnvelope,
  PageEnvelope,
  PostsEnvelope,
  RoutesManifest,
  SingleEventEnvelope,
  SinglePostEnvelope,
  SiteEnvelope,
} from "@/lib/schemas";
import {
  eventsTag,
  eventTag,
  frontTag,
  pageTag,
  postsTag,
  postTag,
  siteTag,
  TAG,
  tagsFor,
} from "@/lib/data/tags";

/* Cached reads (openspec design D1; next-headless-site § Content freshness by
 * push revalidation). Every function is a `'use cache'` scope tagged `content`
 * plus its own key; the rebuild receiver revalidates `content`, `routes` and
 * `site`, so freshness is pushed, not polled. Entities that can legitimately be
 * missing (a page/post/event whose slug the manifest listed a moment ago)
 * resolve to null on a WordPress 404; any other upstream failure throws an
 * UpstreamError so the route renders the error surface instead of wrong content.
 *
 * Errors never cross the 'use cache' boundary (learned in task 6.8): a failure
 * thrown inside a cached scope reaches callers obfuscated (digest only), and
 * when several callers share one in-flight fill the leader's error is rethrown
 * into the render itself — past every try/catch — which aborts the response
 * into Next's bare 500. So each cached scope returns a Result, marks a failed
 * result as not cacheable, and the public getter throws OUTSIDE the scope.
 *
 * Fallback (design D1): if Cache Components has to be dropped, replace the
 * directive + cacheTag/cacheLife with `fetch(..., { next: { tags } })` inside
 * lib/api.ts — the call sites do not change. See lib/data/README.md. */

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; code?: string; message: string };

/** What the public getters throw on an upstream failure (outside the cache scope). */
export class UpstreamError extends Error {
  readonly name = "UpstreamError";
  readonly status: number;
  readonly code?: string;
  /** stable, clock-free reference that matches the data layer's log line */
  readonly digest: string;
  constructor(failure: Extract<Result<unknown>, { ok: false }>) {
    super(failure.message);
    this.status = failure.status;
    this.code = failure.code;
    this.digest = `upstream-${failure.status}${failure.code ? `-${failure.code}` : ""}`;
  }
}

/** A failed result must not be cached for the profile's lifetime. */
const NO_CACHE = { stale: 0, revalidate: 0, expire: 0 } as const;

/** Runs INSIDE a 'use cache' scope: API failures become a (non-cached) result. */
async function attempt<T>(work: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await work() };
  } catch (error) {
    if (!isApiError(error)) throw error; // a programming error, not an upstream one
    cacheLife(NO_CACHE);
    return { ok: false, status: error.status, code: error.code, message: error.message };
  }
}

/** Like attempt(), but a WordPress 404 is a legitimate null (entity gone). */
async function attemptNullable<T>(work: () => Promise<T>): Promise<Result<T | null>> {
  try {
    return { ok: true, value: await work() };
  } catch (error) {
    if (!isApiError(error)) throw error;
    if (error.status === 404) return { ok: true, value: null };
    cacheLife(NO_CACHE);
    return { ok: false, status: error.status, code: error.code, message: error.message };
  }
}

function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value;
  throw new UpstreamError(result);
}

/* ---- cached scopes (private) ---- */

async function cachedRoutes(): Promise<Result<RoutesManifest>> {
  "use cache";
  cacheTag(...tagsFor(TAG.routes));
  cacheLife("content");
  return attempt(() => api().routes());
}

async function cachedSite(lang: string): Promise<Result<SiteEnvelope>> {
  "use cache";
  cacheTag(...tagsFor(TAG.site, siteTag(lang)));
  cacheLife("content");
  return attempt(() => api().site(lang));
}

async function cachedFrontPage(lang: string): Promise<Result<FrontPageEnvelope>> {
  "use cache";
  cacheTag(...tagsFor(frontTag(lang)));
  cacheLife("content");
  return attempt(() => api().frontPage(lang));
}

async function cachedPage(uri: string, lang: string): Promise<Result<PageEnvelope | null>> {
  "use cache";
  cacheTag(...tagsFor(pageTag(lang, uri)));
  cacheLife("content");
  return attemptNullable(() => api().page(uri, lang));
}

async function cachedPost(slug: string, lang: string): Promise<Result<SinglePostEnvelope | null>> {
  "use cache";
  cacheTag(...tagsFor(postTag(lang, slug)));
  cacheLife("content");
  return attemptNullable(() => api().post(slug, lang));
}

async function cachedEvent(
  slug: string,
  lang: string,
): Promise<Result<SingleEventEnvelope | null>> {
  "use cache";
  cacheTag(...tagsFor(eventTag(lang, slug)));
  cacheLife("content");
  return attemptNullable(() => api().event(slug, lang));
}

async function cachedPosts(params: PostsParams): Promise<Result<PostsEnvelope>> {
  "use cache";
  cacheTag(...tagsFor(postsTag(params.lang ?? "")));
  // Per-query search results are short-lived; browse/filter/paged states live with the content.
  cacheLife(params.s ? "search" : "content");
  return attempt(() => api().posts(params));
}

async function cachedEvents(params: EventsParams): Promise<Result<EventsEnvelope>> {
  "use cache";
  cacheTag(...tagsFor(eventsTag(params.lang ?? "")));
  cacheLife("content");
  return attempt(() => api().events(params));
}

async function cachedCategories(): Promise<Result<CategoriesEnvelope>> {
  "use cache";
  cacheTag(...tagsFor("categories"));
  cacheLife("content");
  return attempt(() => api().categories());
}

/* ---- public getters: same signatures as before, throw UpstreamError outside the scope ---- */

export const getRoutes = async () => unwrap(await cachedRoutes());
export const getSite = async (lang: string) => unwrap(await cachedSite(lang));
export const getFrontPage = async (lang: string) => unwrap(await cachedFrontPage(lang));
export const getPage = async (uri: string, lang: string) => unwrap(await cachedPage(uri, lang));
export const getPost = async (slug: string, lang: string) => unwrap(await cachedPost(slug, lang));
export const getEvent = async (slug: string, lang: string) => unwrap(await cachedEvent(slug, lang));
export const getPosts = async (params: PostsParams) => unwrap(await cachedPosts(params));
export const getEvents = async (params: EventsParams) => unwrap(await cachedEvents(params));
export const getCategories = async () => unwrap(await cachedCategories());
