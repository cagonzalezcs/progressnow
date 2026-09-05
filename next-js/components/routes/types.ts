import type { ResolvedRoute } from "@/lib/routes";

export interface RouteProps {
  resolved: ResolvedRoute;
  /** Read only inside a Suspense fragment (front, posts index): `?s=`, `?category=`, `?paged=`, `?view=`. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
