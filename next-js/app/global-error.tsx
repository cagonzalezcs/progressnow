"use client";

import "./globals.css";
import { ErrorSurface } from "@/components/site/ErrorSurface";

/* Last resort: the root layout itself threw something it could not turn into
 * its error document. Next replaces the whole document with this boundary, so
 * it owns <html>/<body>. Same band as the 404 and the segment error. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main id="main" tabIndex={-1} className="site-main">
          <ErrorSurface digest={error.digest} reset={reset} />
        </main>
      </body>
    </html>
  );
}
