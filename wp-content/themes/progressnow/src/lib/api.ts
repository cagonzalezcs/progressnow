import type { z } from "zod";
import {
  eventsEnvelopeSchema,
  postsEnvelopeSchema,
  singlePostEnvelopeSchema,
  type EventsEnvelope,
  type PostsEnvelope,
  type SinglePostEnvelope,
} from "@/lib/schemas";

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
  return err instanceof DOMException && err.name === "AbortError";
}

/* Contract enforcement (contract-governance): throw loudly in dev, log +
 * surface an error state in prod — never render silently wrong data. */
function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  if (import.meta.env.DEV) {
    return schema.parse(data);
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error("[progressnow] API response failed contract validation", result.error);
  throw new ApiError("Response failed contract validation", 500, "progressnow_contract");
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
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

function endpoint(apiBase: string, path: string, params: URLSearchParams): string {
  const qs = params.toString();
  return `${apiBase.replace(/\/+$/, "")}${path}${qs ? `?${qs}` : ""}`;
}

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

/** Single post by slug (JSON fast-path for archive → single client navigation).
 * Throws ApiError(404, "progressnow_post_not_found") for an unknown/unpublished slug. */
export function fetchSinglePost(
  apiBase: string,
  slug: string,
  lang?: string,
  signal?: AbortSignal,
): Promise<SinglePostEnvelope> {
  const path = `/posts/${encodeURIComponent(slug)}`;
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  return getJson(endpoint(apiBase, path, params), signal).then((data) =>
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
