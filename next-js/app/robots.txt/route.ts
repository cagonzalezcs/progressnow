import { connection } from "next/server";
import { getEnv } from "@/lib/env";
import { renderRobotsTxt } from "@/lib/sitemap";

/* GET /robots.txt — policy on the app's public origin (design D5). Request-time
 * so the runtime NEXT_PUBLIC_SITE_ORIGIN wins over the build machine's. */
export async function GET(): Promise<Response> {
  await connection();
  return new Response(renderRobotsTxt(getEnv().NEXT_PUBLIC_SITE_ORIGIN), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
