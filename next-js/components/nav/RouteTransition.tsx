"use client";

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
 * D6). The boundary wraps the persistent <main> and <footer>. On every route
 * commit React names both (auto names + the `vt-page` class) and calls
 * document.startViewTransition; the stylesheet fades the old page out to the
 * brand blue, then the new page in. The header sits outside the boundary; the
 * stylesheet gives it a static group of its own, so it never moves or fades.
 * Reduced motion (media query or widget) sets the class to "none": React names
 * nothing and starts no transition — an instant swap — while the boundary
 * stays mounted so <main>/<footer> never remount. Browsers without the API
 * also swap instantly. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <ViewTransition default={reduce ? "none" : ROUTE_TRANSITION_CLASS}>{children}</ViewTransition>
  );
}
