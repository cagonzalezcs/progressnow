import type { Metadata } from "next";
import "./globals.css";
import { RootDocument } from "@/components/layout/RootDocument";
import { SiteShell } from "@/components/layout/SiteShell";
import { getRoutes, getSite } from "@/lib/data";
import { getRouteLanguages } from "@/lib/data/languages";
import { getEnv } from "@/lib/env";
import { requestPath } from "@/lib/request-path";
import { resolveRoute } from "@/lib/routes";

/* ONE root layout for every route (design D3/D6): the chrome persists across
 * client navigations (no remount, no duplicate landmarks), <html lang> follows
 * the request path forwarded by proxy.ts, and the language toggle links to the
 * current route's translations. Renders per request from 'use cache' data —
 * the trade-off accepted with the nonce CSP (design D11). */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Progress Now", template: "%s – Progress Now" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [manifest, path] = await Promise.all([getRoutes(), requestPath()]);
  const resolved = resolveRoute(manifest, path);
  const lang = resolved.lang || "en";
  const [site, languages] = await Promise.all([getSite(lang), getRouteLanguages(resolved)]);
  return (
    <RootDocument lang={lang}>
      <SiteShell
        site={site}
        languages={languages.length ? languages : site.languages}
        wpOrigin={getEnv().WP_ORIGIN}
      >
        {children}
      </SiteShell>
    </RootDocument>
  );
}
