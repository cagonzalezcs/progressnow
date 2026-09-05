"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { archiveBase, archiveHref, isBrowse } from "@/lib/archive-url";
import type { EventCategory } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Archive toolbar + pending frame (openspec next-headless-site § Interactive
 * archive and calendar; blog-presentation § Blog toolbar). The URL is the
 * state: typing writes `?s=` (debounced 300 ms, replace, no scroll) and chips
 * write `?category=`; the server re-renders the results fragment (children)
 * inside this frame, which exposes the transition as aria-busy + a live status
 * so assistive tech hears "Searching…" and then the count. Superseded
 * transitions are dropped by React. */
export interface ArchiveStrings {
  searchPlaceholder: string;
  searchLabel: string;
  filterLabel: string;
  searching: string;
  clear: string;
}

export function ArchiveFrame({
  categories,
  initial,
  basePath,
  strings,
  children,
}: {
  categories: EventCategory[];
  initial: { s: string; category: string };
  basePath: string;
  strings: ArchiveStrings;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initial.s);
  const category = initial.category || "all";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const base = archiveBase(pathname || basePath);

  const go = (state: { s: string; category: string }) => {
    const href = isBrowse(state) ? archiveHref(basePath, {}) : archiveHref(basePath, state);
    startTransition(() => router.replace(href, { scroll: false }));
  };

  // Debounced search → URL; category changes are immediate. Both reset paging.
  const onQuery = (value: string) => {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => go({ s: value, category }), 300);
  };
  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  return (
    <div className="blog-archive" aria-busy={isPending || undefined} data-archive-frame="">
      <section className="bg-white px-6 pt-7 md:pt-10" data-tone="white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={strings.searchPlaceholder}
            aria-label={strings.searchLabel}
            className="order-first box-border w-full rounded-full border-2 border-control bg-white px-5 py-3 text-base font-medium text-ink outline-offset-2 md:order-last md:w-auto md:min-w-[240px] md:py-2.5"
          />
          <div
            role="group"
            aria-label={strings.filterLabel}
            className="flex flex-wrap items-center gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={category === cat.id}
                data-chip=""
                className={cn(
                  "cursor-pointer rounded-full border-2 px-[18px] py-2 text-[0.88rem] font-bold transition-colors",
                  category === cat.id
                    ? "border-brand bg-brand text-white"
                    : "border-control bg-white text-ink hover:border-brand-deep hover:bg-brand-deep hover:text-white",
                )}
                onClick={() => go({ s: query, category: cat.id })}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {isPending ? strings.searching : ""}
        </p>
        {!isBrowse({ s: query, category }) ? (
          <div className="mx-auto mt-3 flex max-w-[1200px] justify-end">
            <Link
              href={archiveHref(basePath, {})}
              className="text-[0.9rem] font-bold text-accent hover:underline hover:underline-offset-4 md:text-[0.95rem]"
              onClick={() => setQuery("")}
            >
              {strings.clear}
            </Link>
          </div>
        ) : null}
      </section>
      <div className={cn("transition-opacity", isPending && "opacity-70")} data-base={base}>
        {children}
      </div>
    </div>
  );
}
