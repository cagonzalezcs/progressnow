import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { sendBuildStatus } from "@/lib/build-status";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/log";
import { handleRebuild } from "@/lib/rebuild-receiver";
import { createReplayCache } from "@/lib/replay-cache";

/* POST /api/rebuild — the WordPress `webhook` rebuild transport lands here
 * (openspec next-revalidation-receiver; design D9). The core lives in
 * lib/rebuild-receiver.ts; this file wires the real dependencies. */

// Process-wide: a replayed (timestamp, signature) is rejected for the window.
const replayCache = createReplayCache();

export async function POST(request: Request): Promise<Response> {
  const env = getEnv();
  return handleRebuild(request, {
    secret: env.CHAPTER_REBUILD_SECRET,
    now: () => Math.floor(Date.now() / 1000),
    replayCache,
    // `{ expire: 0 }`: the very next request re-reads WordPress instead of serving stale content.
    revalidate: (tags) => {
      for (const tag of tags) revalidateTag(tag, { expire: 0 });
    },
    callback: env.WP_BUILD_STATUS_URL
      ? async (payload) => {
          const url = env.WP_BUILD_STATUS_URL!;
          // Fire after the 202 is on the wire; sendBuildStatus never throws.
          after(() =>
            sendBuildStatus({ url, secret: env.CHAPTER_REBUILD_SECRET, payload, logger }),
          );
        }
      : undefined,
    logger,
  });
}
