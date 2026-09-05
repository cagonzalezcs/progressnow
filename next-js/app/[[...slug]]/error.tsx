"use client";

import { ErrorSurface } from "@/components/site/ErrorSurface";

/* Segment error boundary: the chrome (header, footer, skip link) stays; the
 * route area shows the v4 error band with retry (re-renders the segment). */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSurface digest={error.digest} reset={reset} />;
}
