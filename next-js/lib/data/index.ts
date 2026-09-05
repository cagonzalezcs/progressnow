import { cacheLife, cacheTag } from "next/cache";
import { api, isApiError, type EventsParams, type PostsParams } from "@/lib/api";
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
 * resolve to null on a WordPress 404; any other upstream failure throws so the
 * route renders the error surface instead of wrong content.
 *
 * Fallback (design D1): if Cache Components has to be dropped, replace the
 * directive + cacheTag/cacheLife with `fetch(..., { next: { tags } })` inside
 * lib/api.ts — the call sites do not change. See lib/data/README.md. */

async function nullOn404<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  }
}

export async function getRoutes() {
  "use cache";
  cacheTag(...tagsFor(TAG.routes));
  cacheLife("content");
  return api().routes();
}

export async function getSite(lang: string) {
  "use cache";
  cacheTag(...tagsFor(TAG.site, siteTag(lang)));
  cacheLife("content");
  return api().site(lang);
}

export async function getFrontPage(lang: string) {
  "use cache";
  cacheTag(...tagsFor(frontTag(lang)));
  cacheLife("content");
  return api().frontPage(lang);
}

export async function getPage(uri: string, lang: string) {
  "use cache";
  cacheTag(...tagsFor(pageTag(lang, uri)));
  cacheLife("content");
  return nullOn404(api().page(uri, lang));
}

export async function getPost(slug: string, lang: string) {
  "use cache";
  cacheTag(...tagsFor(postTag(lang, slug)));
  cacheLife("content");
  return nullOn404(api().post(slug, lang));
}

export async function getEvent(slug: string, lang: string) {
  "use cache";
  cacheTag(...tagsFor(eventTag(lang, slug)));
  cacheLife("content");
  return nullOn404(api().event(slug, lang));
}

export async function getPosts(params: PostsParams) {
  "use cache";
  cacheTag(...tagsFor(postsTag(params.lang ?? "")));
  // Per-query search results are short-lived; browse/filter/paged states live with the content.
  cacheLife(params.s ? "search" : "content");
  return api().posts(params);
}

export async function getEvents(params: EventsParams) {
  "use cache";
  cacheTag(...tagsFor(eventsTag(params.lang ?? "")));
  cacheLife("content");
  return api().events(params);
}

export async function getCategories() {
  "use cache";
  cacheTag(...tagsFor("categories"));
  cacheLife("content");
  return api().categories();
}
