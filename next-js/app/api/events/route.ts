import type { NextRequest } from "next/server";
import { failureDigest } from "@/lib/api";
import { getEvents } from "@/lib/data";
import { logger } from "@/lib/log";

/* GET /api/events?lang=&from=&to= — same-origin window fetch for the calendar
 * (openspec next-headless-site § Interactive archive and calendar, § No
 * browser-to-WordPress traffic). A cached read; the browser never sees the
 * WordPress origin. */
const LANG = /^[a-z]{2}(-[a-z]{2})?$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest): Promise<Response> {
  const q = request.nextUrl.searchParams;
  const lang = q.get("lang") ?? "";
  const from = q.get("from") ?? undefined;
  const to = q.get("to") ?? undefined;
  if (!LANG.test(lang) || (from && !DATE.test(from)) || (to && !DATE.test(to))) {
    return Response.json(
      { error: "lang (required), from and to (YYYY-MM-DD) expected" },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  try {
    const envelope = await getEvents({ lang, after: from, before: to });
    return Response.json(envelope, {
      headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    // A cached read failed (obfuscated across the 'use cache' boundary; the data layer logged
    // the cause under this digest): the upstream is unavailable → 503, never a crash.
    const digest = failureDigest(error);
    logger.error("events-route", { status: 503, digest });
    return Response.json(
      { error: "events temporarily unavailable", digest },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
