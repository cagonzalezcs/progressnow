"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";

/* Route-loading flag (design D6; openspec next-headless-site § Client navigation).
 *
 * A client navigation commits as soon as the catch-all page's shell resolves —
 * with this component, the page's Suspense fallback, standing in for <main>'s
 * content. <main> is an empty box for as long as the route payload takes, so
 * the footer lands directly under the header and then drops to the bottom of
 * the finished page: the jump this flag exists to hide.
 *
 * While the fallback is mounted <html> carries `data-route-loading`;
 * app/route-loading.css holds the footer unpainted for that window. The
 * attribute is set in a layout effect so it is part of the same commit the
 * fallback appears in (the frame React snapshots for the view transition), and
 * dropped in the cleanup React runs before painting the finished route — the
 * footer is back the moment there is content above it.
 *
 * The counter keeps overlapping fallbacks — a route shell resolving into a
 * fragment that is itself still pending — and StrictMode's double-invoked
 * effects from clearing a flag another mount still needs. */

const ATTR = "data-route-loading";
let pending = 0;

/* useLayoutEffect warns when it runs on the server; the fallback is streamed there. */
const useCommitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function RoutePending({ children }: { children?: ReactNode }) {
  useCommitEffect(() => {
    if (++pending === 1) document.documentElement.setAttribute(ATTR, "");
    return () => {
      if (--pending === 0) document.documentElement.removeAttribute(ATTR);
    };
  }, []);
  // A route fragment passes its own skeleton; the whole-route boundary has none
  // to show, so aria-busy names the empty region for assistive tech.
  return children ?? <div aria-busy="true" />;
}
