import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Styleguide section: anchored, bordered Bowlby h2 (the Nuxt styleguide's
 * `h2Class`), optional note. Every section id is `sg-<slug>` so the table of
 * contents, the e2e screenshots and the axe reports share one vocabulary. */
export const H2 =
  "mb-6 border-b-2 border-line pb-2 font-display text-2xl font-normal uppercase text-ink";
export const H3 = "mb-4 mt-8 font-display text-lg font-normal uppercase";

export interface SectionProps {
  id: string;
  title: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({ id, title, note, className, children }: SectionProps) {
  return (
    <section
      id={`sg-${id}`}
      data-styleguide-section={id}
      data-testid="styleguide-section"
      className={cn("mb-16 scroll-mt-24", className)}
    >
      <h2 className={H2} data-testid="styleguide-section-title">
        {title}
      </h2>
      {children}
      {note ? (
        <p className="mt-3 max-w-[70ch] text-sm text-muted" data-testid="styleguide-section-note">
          {note}
        </p>
      ) : null}
    </section>
  );
}
