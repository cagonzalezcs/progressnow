/* Placeholder catch-all — replaced in task 3.5 by the manifest-driven route
 * resolver (openspec design D3). Static on purpose: under Cache Components,
 * `params`/`searchParams` must be read inside a Suspense boundary or a cached
 * scope, which is exactly how the real page will be structured. */
export default function Page() {
  return <main id="main">Progress Now</main>;
}
