import { RootDocument } from "@/components/layout/RootDocument";
import { ErrorSurface } from "@/components/site/ErrorSurface";

/* The server-rendered error document (openspec next-headless-site § Error and
 * empty surfaces): the root layout renders it when the /site or /routes
 * envelope cannot be read, and proxy.ts renders it internally to answer a real
 * 500. Chrome-less on purpose — the chrome IS the unavailable data. */
export function ErrorDocument({ lang = "en", digest }: { lang?: string; digest?: string }) {
  return (
    <RootDocument lang={lang}>
      <main id="main" tabIndex={-1} className="site-main">
        <ErrorSurface digest={digest} />
      </main>
    </RootDocument>
  );
}
