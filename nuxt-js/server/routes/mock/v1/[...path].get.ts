import { createError, defineEventHandler, getQuery, getRouterParam, setResponseHeader } from "h3";
import { useRuntimeConfig } from "#imports";
import { mockDispatch } from "../../../../shared/mock-api";

/* GET /mock/v1/* — the fixture-backed WordPress REST stand-in. Inert unless
 * NUXT_MOCK_API=1 (runtimeConfig.public.mockApi), so a production build never
 * exposes it. */
export default defineEventHandler((event) => {
  if (!useRuntimeConfig(event).public.mockApi) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const path = getRouterParam(event, "path") ?? "";
  const body = mockDispatch(path, getQuery(event) as Record<string, unknown>);
  if (body === null) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { code: "progressnow_not_found", message: `No fixture for /${path}` },
    });
  }

  setResponseHeader(event, "Cache-Control", "no-store");
  return body;
});
