import type { Metadata } from "next";
import { after } from "next/server";
import "./globals.css";
import { ErrorDocument } from "@/components/layout/ErrorDocument";
import { RootDocument } from "@/components/layout/RootDocument";
import { SiteShell } from "@/components/layout/SiteShell";
import { failureDigest, isHangingPromiseRejection } from "@/lib/api";
import { getRoutes, getSite } from "@/lib/data";
import { getRouteLanguages } from "@/lib/data/languages";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/log";
import { isErrorRender, requestPath } from "@/lib/request-path";
import { resolveRoute } from "@/lib/routes";

/* ONE root layout for every route (design D3/D6): the chrome persists across
 * client navigations (no remount, no duplicate landmarks), <html lang> follows
 * the request path forwarded by proxy.ts, and the language toggle links to the
 * current route's translations. Renders per request from 'use cache' data —
 * the trade-off accepted with the nonce CSP (design D11).
 *
 * Upstream failure (next-headless-site § Error and empty surfaces): when the
 * /routes or /site envelope cannot be read, the layout renders the error
 * document itself — server-rendered, never Next's blank error shell. The HTTP
 * status is the proxy's: it answers 500 with this same document once the data
 * layer has recorded the failure (or its own probe fails). */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Progress Now", template: "%s – Progress Now" },
};

/** Language from the URL prefix when the manifest is unavailable. */
function langFromPrefix(path: string): string {
  return /^\/([a-z]{2})(?:\/|$)/.exec(path)?.[1] ?? "en";
}

type Shell =
  | {
      ok: true;
      lang: string;
      site: Awaited<ReturnType<typeof getSite>>;
      languages: Awaited<ReturnType<typeof getRouteLanguages>>;
    }
  | { ok: false; digest: string };

/** Reads the envelopes the chrome needs; a failure becomes a result, not a throw. */
async function loadShell(path: string): Promise<Shell> {
  try {
    const manifest = await getRoutes();
    const resolved = resolveRoute(manifest, path);
    const lang = resolved.lang || "en";
    const [site, languages] = await Promise.all([getSite(lang), getRouteLanguages(resolved)]);
    return { ok: true, lang, site, languages };
  } catch (error) {
    if (isHangingPromiseRejection(error)) throw error; // prerender pass, not a failure
    // Production obfuscates errors crossing the 'use cache' boundary: only the digest survives,
    // and the data layer has already logged the cause under it. Any failure here = no chrome.
    const digest = failureDigest(error);
    // after(): the logger reads the clock, which Next forbids inside the prerender pass.
    after(() => logger.error("layout_upstream_failure", { path, digest }));
    return { ok: false, digest };
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [path, errorRender] = await Promise.all([requestPath(), isErrorRender()]);
  if (errorRender) return <ErrorDocument lang={langFromPrefix(path)} />;
  const shell = await loadShell(path);
  if (!shell.ok) return <ErrorDocument lang={langFromPrefix(path)} digest={shell.digest} />;
  return (
    <RootDocument lang={shell.lang}>
      <SiteShell
        site={shell.site}
        languages={shell.languages.length ? shell.languages : shell.site.languages}
        wpOrigin={getEnv().WP_ORIGIN}
      >
        {children}
      </SiteShell>
    </RootDocument>
  );
}
