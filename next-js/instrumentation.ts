import type { Instrumentation } from "next";

/* Startup validation (openspec next-deployment § Environment contract and
 * startup validation): a misconfigured deployment fails before it serves a
 * request. `register` runs once per server instance. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("@/lib/env");
    const env = getEnv();
    const { logger } = await import("@/lib/log");
    logger.info("startup", {
      wpOrigin: env.WP_ORIGIN,
      siteOrigin: env.NEXT_PUBLIC_SITE_ORIGIN,
      mockApi: env.MOCK_API,
      buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev",
    });
  }
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { logger } = await import("@/lib/log");
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;
  logger.error("request-error", {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    digest,
    error,
  });
};
