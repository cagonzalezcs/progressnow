import Link from "next/link";
import { archiveHref, pageItems, type ArchiveState } from "@/lib/archive-url";
import { cn } from "@/lib/utils";

/* Round pagination (openspec blog-presentation § Post grid and pagination):
 * real hrefs — browse pages are WordPress permalinks, filtered pages keep the
 * query — so every page is crawlable and shareable; client navigation via
 * next/link. */
const NAV_BTN =
  "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-2 bg-white px-[18px] text-[0.95rem] font-extrabold text-ink no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep hover:text-white";
const NAV_BTN_DISABLED =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-control-faint bg-white px-[18px] text-[0.95rem] font-extrabold text-border-muted";
const PAGE_BTN =
  "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-2 p-0 font-display text-[0.9rem] font-normal no-underline transition-colors";

export function Pagination({
  base,
  state,
  current,
  total,
  label = "Pagination",
  strings,
}: {
  base: string;
  state: ArchiveState;
  current: number;
  total: number;
  label?: string;
  strings?: { prev?: string; next?: string; page?: string; pageOf?: string };
}) {
  if (total <= 1) return null;
  const t = { prev: "Prev", next: "Next", page: "Page", pageOf: "Page %1 of %2", ...strings };
  const href = (page: number) => archiveHref(base, { ...state, page });
  return (
    <>
      <nav
        aria-label={label}
        className="flex flex-wrap items-center justify-center gap-2 pt-7 md:gap-2.5 md:pt-12"
        data-testid="pagination"
        data-current-page={current}
        data-total-pages={total}
      >
        {current > 1 ? (
          <Link
            href={href(current - 1)}
            className={cn(NAV_BTN, "border-control")}
            scroll
            data-testid="pagination-prev"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden md:inline">&nbsp;{t.prev}</span>
            <span className="sr-only">Previous page</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={NAV_BTN_DISABLED}
            data-testid="pagination-prev-disabled"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden md:inline">&nbsp;{t.prev}</span>
          </span>
        )}
        {pageItems(total, current).map((item, i) =>
          item === "…" ? (
            <span
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1 font-extrabold text-muted"
              data-testid="pagination-gap"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={href(item)}
              aria-label={`${t.page} ${item}`}
              aria-current={item === current ? "page" : undefined}
              data-testid="pagination-page"
              data-page-number={item}
              className={cn(
                PAGE_BTN,
                item === current
                  ? "border-brand bg-brand text-white"
                  : "border-control bg-white text-ink hover:border-brand-deep hover:bg-brand-deep hover:text-white",
              )}
            >
              {item}
            </Link>
          ),
        )}
        {current < total ? (
          <Link
            href={href(current + 1)}
            className={cn(NAV_BTN, "border-control")}
            data-testid="pagination-next"
          >
            <span className="hidden md:inline">{t.next}&nbsp;</span>
            <span aria-hidden="true">→</span>
            <span className="sr-only">Next page</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={NAV_BTN_DISABLED}
            data-testid="pagination-next-disabled"
          >
            <span className="hidden md:inline">{t.next}&nbsp;</span>
            <span aria-hidden="true">→</span>
          </span>
        )}
      </nav>
      <div
        className="pt-1.5 text-center text-[0.9rem] font-bold text-muted md:pt-3.5 md:text-[0.95rem]"
        data-testid="pagination-status"
      >
        {t.pageOf.replace("%1", String(current)).replace("%2", String(total))}
      </div>
    </>
  );
}
