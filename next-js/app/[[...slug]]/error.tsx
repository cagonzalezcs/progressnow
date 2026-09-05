"use client";

/* Error surface (openspec next-headless-site § Error and empty surfaces): an
 * upstream or contract failure renders an honest state — never partial or
 * fake content. Designed markup lands in task 6.8. */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div data-route-kind="error" className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="font-display text-3xl text-ink">Content is temporarily unavailable</h1>
      <p>Please try again in a moment.</p>
      {error.digest ? <p className="text-muted text-sm">Reference: {error.digest}</p> : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-full bg-brand px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
