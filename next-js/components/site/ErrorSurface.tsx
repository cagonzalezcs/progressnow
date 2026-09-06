"use client";

import { useEffect } from "react";
import { ERROR_PILL_OUTLINE, ERROR_PILL_WHITE, ErrorBand } from "@/components/site/ErrorBand";

/* Runtime error surface (openspec next-headless-site § Error and empty
 * surfaces): an upstream or contract failure renders an honest state — never
 * partial or fake content. Shared by the segment error boundary (chrome kept),
 * the global boundary and the layout's server-rendered fallback / proxy 500
 * document. No site payload is available on this path, so the copy is the
 * English source of the inc/i18n.php strings (as in the Nuxt error.vue). The
 * digest lets support match the page to the structured server log line. */
export function ErrorSurface({
  digest,
  reset,
  homeHref = "/",
}: {
  digest?: string;
  /** Error-boundary reset; without one "Try again" reloads the page. */
  reset?: () => void;
  homeHref?: string;
}) {
  useEffect(() => {
    document.title = "Something went wrong – Progress Now";
  }, []);
  return (
    <>
      <meta name="robots" content="noindex,follow" />
      <ErrorBand
        kind="error"
        numeral="500"
        title="Something went wrong"
        lede="We couldn’t load this page. Reloading usually fixes it."
        actions={
          <>
            {/* Plain anchor on purpose: a full reload when the router may itself be in the failed state. */}
            <a href={homeHref} className={ERROR_PILL_WHITE} data-testid="error-surface-home">
              Back home
            </a>
            <button
              type="button"
              className={`cursor-pointer ${ERROR_PILL_OUTLINE}`}
              data-testid="error-surface-retry"
              onClick={() => (reset ? reset() : location.reload())}
            >
              Try again
            </button>
            {digest ? (
              <p
                className="m-0 basis-full pt-2 text-[0.85rem] font-semibold text-brand-light"
                data-testid="error-surface-digest"
              >
                Reference: <span className="font-mono">{digest}</span>
              </p>
            ) : null}
          </>
        }
      />
    </>
  );
}
