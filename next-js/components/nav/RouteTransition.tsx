"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import type { ComponentType, ReactNode } from "react";
import { useReducedMotion } from "@/components/a11y/A11yProvider";

type ViewTransitionProps = { default?: string; children: ReactNode };

/* `ViewTransition` ships in the React canary the App Router bundles; the stable
 * `react` package (unit tests, other hosts) lacks it → a pass-through there. */
const ViewTransition: ComponentType<ViewTransitionProps> =
  (React as unknown as { ViewTransition?: ComponentType<ViewTransitionProps> }).ViewTransition ??
  (({ children }) => <>{children}</>);

/** `view-transition-class` React stamps on the boundary's host children (<main>, <footer>) while
 * a route commit runs; globals.css animates `::view-transition-*(.vt-page)`. */
export const ROUTE_TRANSITION_CLASS = "vt-page";

/* Route transition (openspec next-headless-site § Client navigation; design
 * D6). The boundary wraps the persistent <main> and <footer>. On a route
 * commit React names both (auto names + the `vt-page` class) and calls
 * document.startViewTransition; the stylesheet fades the old page out to the
 * page ground, then the new page in. The header sits outside the boundary; the
 * stylesheet gives it a static group of its own, so it never moves or fades.
 * Reduced motion (media query or widget) sets the class to "none": React names
 * nothing and starts no transition — an instant swap — while the boundary
 * stays mounted so <main>/<footer> never remount. Browsers without the API
 * also swap instantly.
 *
 * Only a change of PATHNAME animates. React would otherwise transition on
 * every update inside the boundary, which is two things too many:
 *
 *   A URL-state update — `?s=`, `?category=`, `?paged=`, `?view=`, written
 *   with `router.replace(…, { scroll: false })` — cross-faded the whole page
 *   on each keystroke of the blog search, instead of the results fragment
 *   updating in place. Design D6 already says these "do not trigger a
 *   transition"; this is what makes that true.
 *
 *   A Suspense reveal — the archive results resolving behind their skeleton —
 *   ran a SECOND full-page cross-fade after the route had already arrived.
 *   Measured on a cold /blog/ with the posts envelope held 700ms: one
 *   transition at t=65ms for the navigation, another at t=767ms when the
 *   content landed. The page appeared to reload itself.
 *
 * Comparing against the previous pathname tells the three apart: the render
 * that introduces a new path animates, and everything after it on that path
 * does not. First mount matches too, so a direct load never transitions.
 *
 * The settled path is STATE, not a ref, and that distinction is the whole fix.
 * React reads `default` from the last render of this component, and a Suspense
 * reveal below it re-renders nothing here — pathname has not changed. A ref
 * would update silently and the boundary would still be holding the
 * `vt-page` prop from the navigation render, so the reveal animated anyway
 * (measured: still a second transition at t=751ms). Setting state forces the
 * re-render that commits `"none"` before the content lands.
 *
 * The settle is deferred to the next frame rather than run straight from the
 * effect: a synchronous setState there cascades renders (and
 * react-hooks/set-state-in-effect rejects it). A frame is the right moment
 * anyway — after the navigation's transition has been captured, and long
 * before content that is still in flight can arrive. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [settled, setSettled] = React.useState(pathname);
  const isRouteChange = settled !== pathname;

  React.useEffect(() => {
    if (!isRouteChange) return;
    if (typeof requestAnimationFrame !== "function") {
      const id = setTimeout(() => setSettled(pathname), 0);
      return () => clearTimeout(id);
    }
    const frame = requestAnimationFrame(() => setSettled(pathname));
    return () => cancelAnimationFrame(frame);
  }, [pathname, isRouteChange]);

  return (
    <ViewTransition default={reduce || !isRouteChange ? "none" : ROUTE_TRANSITION_CLASS}>
      {children}
    </ViewTransition>
  );
}
