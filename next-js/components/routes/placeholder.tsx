import type { ReactNode } from "react";

/* Task 3.5 placeholder chrome for the route components; replaced route by
 * route in group 6. Keeps one <main id="main"> and one <h1> per document. */
export function Placeholder({
  kind,
  title,
  children,
}: {
  kind: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div data-route-kind={kind} className="mx-auto max-w-[1200px] px-4 py-10">
      <h1 className="font-display text-3xl text-ink">{title}</h1>
      {children}
    </div>
  );
}
