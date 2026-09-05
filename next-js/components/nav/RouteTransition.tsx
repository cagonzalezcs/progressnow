"use client";

import * as React from "react";
import { Fragment, type ComponentType, type ReactNode } from "react";
import { useReducedMotion } from "@/components/a11y/A11yProvider";

/* `ViewTransition` ships in the React canary the App Router bundles; the stable
 * `react` package (unit tests, other hosts) lacks it → plain Fragment there. */
const ViewTransition: ComponentType<{ name?: string; children: ReactNode }> =
  (React as unknown as { ViewTransition?: ComponentType<{ name?: string; children: ReactNode }> })
    .ViewTransition ?? Fragment;

/* Route cross-fade (openspec next-headless-site § Client navigation; design
 * D6). React's <ViewTransition> names the route's <main> `vt-main`, the same
 * name the theme stylesheet animates (::view-transition-old/new(vt-main)) and
 * disables under prefers-reduced-motion. When the visitor asked for reduced
 * motion (media query or widget) the children render bare — an instant swap;
 * browsers without document.startViewTransition also swap instantly because
 * React only animates where the API exists. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  // Unnamed: the persistent <main> carries the theme's `view-transition-name: vt-main`, so its
  // old/new snapshots cross-fade via the stylesheet; React only needs to start the transition.
  return <ViewTransition>{children}</ViewTransition>;
}
