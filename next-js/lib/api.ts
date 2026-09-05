import "server-only";
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
import { getEnv } from "@/lib/env";

/* `GET /wp-json/progressnow/v1/*` client — server only (openspec
 * next-headless-site § Single data source with contract validation; design
 * D2). Ported from the Nuxt rendition's lib/api.ts: one function per endpoint,
 * the same contract enforcement (throw in development, log + error state in
 * production — never render silently wrong data). The browser never imports
 * this module and never learns WP_API_BASE. */

export class ApiError extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface ContractErrorReport {
  endpoint: string;
  issues: unknown;
}

export interface ApiOptions {
  apiBase: string;
  fetchImpl?: typeof fetch;
  /** development → throw the zod error; production → log + ApiError 500. */
  mode?: "development" | "production";
  onContractError?: (report: ContractErrorReport) => void;
  /** Upstream timeout per request (ms). */
  timeoutMs?: number;
}

export interface PostsParams {
  s?: string;
  category?: string;
  page?: number;
  lang?: string;
}

export interface EventsParams {
  after?: string;
  before?: string;
  lang?: string;
}

export function createApi(options: ApiOptions) {
  const {
    apiBase,
    fetchImpl = fetch,
    mode = process.env.NODE_ENV === "production" ? "production" : "development",
    onContractError = (report) =>
      console.error("[progressnow] API response failed contract validation", report),
    timeoutMs = 10_000,
  } = options;
  const base = apiBase.replace(/\/+$/, "");

  function validate<T>(schema: z.ZodType<T>, data: unknown, endpoint: string): T {
    if (mode === "development") return schema.parse(data);
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    onContractError({ endpoint, issues: result.error.issues });
    throw new ApiError("Response failed contract validation", 500, "progressnow_contract");
  }

  async function getJson(
    path: string,
    params: URLSearchParams = new URLSearchParams(),
  ): Promise<unknown> {
    const qs = params.toString();
    const url = `${base}${path}${qs ? `?${qs}` : ""}`;
    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const name = (err as { name?: string } | null)?.name;
      throw new ApiError(name === "TimeoutError" ? "Upstream timeout" : "Network error", 0);
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

  function langParams(lang?: string): URLSearchParams {
    const params = new URLSearchParams();
    if (lang) params.set("lang", lang);
    return params;
  }

  return {
    site: async (lang: string): Promise<SiteEnvelope> =>
      validate(siteEnvelopeSchema, await getJson("/site", langParams(lang)), "/site"),
    routes: async (): Promise<RoutesManifest> =>
      validate(routesManifestSchema, await getJson("/routes"), "/routes"),
    frontPage: async (lang: string): Promise<FrontPageEnvelope> =>
      validate(
        frontPageEnvelopeSchema,
        await getJson("/front-page", langParams(lang)),
        "/front-page",
      ),
    /** Page by URI (slug hierarchy, no leading/trailing slash). */
    page: async (uri: string, lang: string): Promise<PageEnvelope> => {
      const path = `/pages/${uri
        .split("/")
        .filter(Boolean)
        .map((s) => encodeURIComponent(s))
        .join("/")}`;
      return validate(pageEnvelopeSchema, await getJson(path, langParams(lang)), "/pages");
    },
    posts: async ({ s, category, page, lang }: PostsParams = {}): Promise<PostsEnvelope> => {
      const params = new URLSearchParams();
      if (s && s.trim() !== "") params.set("s", s.trim());
      if (category && category !== "all") params.set("category", category);
      if (page && page > 1) params.set("page", String(page));
      if (lang) params.set("lang", lang);
      return validate(postsEnvelopeSchema, await getJson("/posts", params), "/posts");
    },
    /** Throws ApiError(404, "progressnow_post_not_found") for an unknown slug. */
    post: async (slug: string, lang: string): Promise<SinglePostEnvelope> =>
      validate(
        singlePostEnvelopeSchema,
        await getJson(`/posts/${encodeURIComponent(slug)}`, langParams(lang)),
        "/posts/{slug}",
      ),
    events: async ({ after, before, lang }: EventsParams = {}): Promise<EventsEnvelope> => {
      const params = new URLSearchParams();
      if (after) params.set("after", after);
      if (before) params.set("before", before);
      if (lang) params.set("lang", lang);
      return validate(eventsEnvelopeSchema, await getJson("/events", params), "/events");
    },
    event: async (slug: string, lang: string): Promise<SingleEventEnvelope> =>
      validate(
        singleEventEnvelopeSchema,
        await getJson(`/events/${encodeURIComponent(slug)}`, langParams(lang)),
        "/events/{slug}",
      ),
    categories: async (): Promise<CategoriesEnvelope> =>
      validate(categoriesEnvelopeSchema, await getJson("/categories"), "/categories"),
  };
}

export type Api = ReturnType<typeof createApi>;

let instance: Api | undefined;

/** The app's client, bound to the validated environment. */
export function api(): Api {
  if (!instance) instance = createApi({ apiBase: getEnv().WP_API_BASE });
  return instance;
}
