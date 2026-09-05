import type { z } from "zod";
import {
  categoriesEnvelopeSchema,
  eventsEnvelopeSchema,
  frontPageEnvelopeSchema,
  pageEnvelopeSchema,
  postsEnvelopeSchema,
  routesManifestSchema,
  singleEventEnvelopeSchema,
  singlePostEnvelopeSchema,
  siteEnvelopeSchema,
  type CategoriesEnvelope,
  type EventsEnvelope,
  type FrontPageEnvelope,
  type PageEnvelope,
  type PostsEnvelope,
  type RoutesManifest,
  type SingleEventEnvelope,
  type SinglePostEnvelope,
  type SiteEnvelope,
} from "@/lib/schemas";

/* `GET /wp-json/progressnow/v1/*` client. Same contract enforcement as the
 * theme's islands (throw in dev, error state in prod). Under Nuxt every call
 * goes through `$fetch` so relative URLs resolve during prerender (nitro's
 * local fetch) and in the browser alike; outside Nuxt (unit tests) it falls
 * back to the global `fetch`. */

/** Normalized error for any failed API call (WP error envelope or network). */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Re-thrown untouched so callers can ignore superseded requests. */
export function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  const e = err as { name?: string; cause?: { name?: string } } | null;
  return e?.name === "AbortError" || e?.cause?.name === "AbortError";
}

const DEV = Boolean(
  (import.meta as unknown as { dev?: boolean }).dev ??
    (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV,
);

/* Contract enforcement (contract-governance): throw loudly in dev, log +
 * surface an error state in prod — never render silently wrong data. */
function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  if (DEV) {
    return schema.parse(data);
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error("[progressnow] API response failed contract validation", result.error);
  throw new ApiError("Response failed contract validation", 500, "progressnow_contract");
}

interface RawFetch {
  raw: (
    url: string,
    opts: Record<string, unknown>,
  ) => Promise<{ status: number; _data?: unknown }>;
}

function nuxtFetch(): RawFetch | null {
  const f = (globalThis as { $fetch?: RawFetch }).$fetch;
  return f && typeof f.raw === "function" ? f : null;
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const $fetch = nuxtFetch();
  if ($fetch) {
    let res: { status: number; _data?: unknown };
    try {
      res = await $fetch.raw(url, {
        signal,
        headers: { Accept: "application/json" },
        responseType: "json",
        ignoreResponseError: true,
      });
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw new ApiError("Network error", 0);
    }
    if (res.status >= 400) {
      const body = (res._data ?? {}) as { code?: string; message?: string };
      throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status, body.code);
    }
    return res._data;
  }

  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new ApiError("Network error", 0);
  }

  if (!response.ok) {
    let code: string | undefined;
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { code?: string; message?: string };
      code = body.code;
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    throw new ApiError(message, response.status, code);
  }

  return response.json();
}

function endpoint(apiBase: string, path: string, params: URLSearchParams = new URLSearchParams()): string {
  const qs = params.toString();
  return `${apiBase.replace(/\/+$/, "")}${path}${qs ? `?${qs}` : ""}`;
}

function langParams(lang?: string): URLSearchParams {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  return params;
}

/* ---- Islands' interaction endpoints (unchanged contract) ---- */

export interface FetchPostsParams {
  s?: string;
  category?: string;
  page?: number;
  /** Polylang language slug of the embedding page; scopes results to it. */
  lang?: string;
}

export function fetchPosts(
  apiBase: string,
  { s, category, page, lang }: FetchPostsParams = {},
  signal?: AbortSignal,
): Promise<PostsEnvelope> {
  const params = new URLSearchParams();
  if (s && s.trim() !== "") params.set("s", s.trim());
  if (category && category !== "all") params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  if (lang) params.set("lang", lang);

  return getJson(endpoint(apiBase, "/posts", params), signal).then((data) =>
    validate(postsEnvelopeSchema, data),
  );
}

/** Single post by slug. Throws ApiError(404, "progressnow_post_not_found")
 * for an unknown/unpublished slug. */
export function fetchSinglePost(
  apiBase: string,
  slug: string,
  lang?: string,
  signal?: AbortSignal,
): Promise<SinglePostEnvelope> {
  const path = `/posts/${encodeURIComponent(slug)}`;
  return getJson(endpoint(apiBase, path, langParams(lang)), signal).then((data) =>
    validate(singlePostEnvelopeSchema, data),
  );
}

export interface FetchEventsParams {
  after?: string;
  before?: string;
  /** Polylang language slug of the embedding page; scopes results to it. */
  lang?: string;
}

export function fetchEvents(
  apiBase: string,
  { after, before, lang }: FetchEventsParams = {},
  signal?: AbortSignal,
): Promise<EventsEnvelope> {
  const params = new URLSearchParams();
  if (after) params.set("after", after);
  if (before) params.set("before", before);
  if (lang) params.set("lang", lang);

  return getJson(endpoint(apiBase, "/events", params), signal).then((data) =>
    validate(eventsEnvelopeSchema, data),
  );
}

/* ---- Route payload endpoints (inc/payloads.php) ---- */

export function fetchSite(apiBase: string, lang?: string): Promise<SiteEnvelope> {
  return getJson(endpoint(apiBase, "/site", langParams(lang))).then((data) =>
    validate(siteEnvelopeSchema, data),
  );
}

export function fetchRoutes(apiBase: string): Promise<RoutesManifest> {
  return getJson(endpoint(apiBase, "/routes")).then((data) => validate(routesManifestSchema, data));
}

export function fetchFrontPage(apiBase: string, lang?: string): Promise<FrontPageEnvelope> {
  return getJson(endpoint(apiBase, "/front-page", langParams(lang))).then((data) =>
    validate(frontPageEnvelopeSchema, data),
  );
}

/** Page by URI (slug hierarchy, no leading/trailing slash). */
export function fetchPage(apiBase: string, uri: string, lang?: string): Promise<PageEnvelope> {
  const path = `/pages/${uri
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/")}`;
  return getJson(endpoint(apiBase, path, langParams(lang))).then((data) =>
    validate(pageEnvelopeSchema, data),
  );
}

export function fetchSingleEvent(
  apiBase: string,
  slug: string,
  lang?: string,
): Promise<SingleEventEnvelope> {
  const path = `/events/${encodeURIComponent(slug)}`;
  return getJson(endpoint(apiBase, path, langParams(lang))).then((data) =>
    validate(singleEventEnvelopeSchema, data),
  );
}

export function fetchCategories(apiBase: string): Promise<CategoriesEnvelope> {
  return getJson(endpoint(apiBase, "/categories")).then((data) =>
    validate(categoriesEnvelopeSchema, data),
  );
}
