"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryById } from "@/lib/categories";
import {
  type ChapterEvent,
  type EventCategory,
  MONTH_NAMES,
  MONTH_SHORTS,
  parseISODate,
  WEEKDAYS,
} from "@/lib/events";

/* Event preview dialog (openspec fix-calendar-page-layout D7; twin of
 * EventDetailDialog.vue): radius-20 white card, brand date tile + Bowlby
 * title, 40px round close, When/Where lines, description, accent "View event"
 * pill + outline "RSVP". Radix owns focus trap / Escape; modal content
 * returns focus to its (absent) trigger, so `returnFocusTo` names the chip
 * that opened the dialog and gets focus back on close. */
export function EventDetailDialog({
  event,
  categories,
  showCategoryColors,
  fallbackUrl = "/calendar/",
  viewLabel = "View event",
  rsvpLabel = "RSVP",
  returnFocusTo,
  onClose,
}: {
  event: ChapterEvent | null;
  categories: EventCategory[];
  showCategoryColors: boolean;
  fallbackUrl?: string;
  viewLabel?: string;
  rsvpLabel?: string;
  /** element focused before the dialog opened (the grid chip) */
  returnFocusTo?: HTMLElement | null;
  onClose: () => void;
}) {
  const date = event ? parseISODate(event.date) : null;
  const category = event ? categoryById(event.cat, categories) : null;
  const tileColor = event && showCategoryColors ? (category?.color ?? undefined) : undefined;
  const dateLine =
    event && date
      ? `${WEEKDAYS[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${event.time}`
      : "";
  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      {event && date ? (
        <DialogContent
          className="event-detail-dialog max-h-[85vh] gap-4 overflow-auto rounded-[20px] border-none bg-white px-7 pb-[30px] pt-[26px] text-base text-ink shadow-modal ring-0 sm:max-w-[440px]"
          showCloseButton={false}
          aria-label="Event details"
          onCloseAutoFocus={(e) => {
            if (returnFocusTo?.isConnected) {
              e.preventDefault();
              returnFocusTo.focus();
            }
          }}
        >
          <div className="flex items-start justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className="flex flex-none flex-col rounded-[12px] bg-brand px-3.5 py-2.5 text-center text-white"
                style={tileColor ? { background: tileColor } : undefined}
              >
                <span className="text-[1.3rem] font-extrabold leading-[1.1]">
                  {String(date.getDate()).padStart(2, "0")}
                </span>
                <span className="text-[0.72rem] font-bold tracking-[0.1em]">
                  {MONTH_SHORTS[date.getMonth()]?.toUpperCase()}
                </span>
              </span>
              <DialogTitle className="m-0 font-display text-[1.15rem] font-normal normal-case leading-[1.25] tracking-normal text-ink">
                {event.title}
              </DialogTitle>
            </div>
            <DialogClose
              className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-control bg-white text-base font-extrabold text-ink transition-colors hover:border-ink"
              aria-label="Close"
            >
              ✕
            </DialogClose>
          </div>
          <div className="flex flex-col gap-1.5 text-base font-medium text-text-body">
            <span>
              <strong className="text-ink">When:</strong> {dateLine}
            </span>
            <span>
              <strong className="text-ink">Where:</strong> {event.location}
            </span>
            <span className="text-[0.85rem] font-bold uppercase tracking-[0.06em] text-brand">
              {category?.label}
            </span>
          </div>
          {event.desc ? (
            <DialogDescription className="m-0 text-[0.98rem] leading-[1.6] text-text-body">
              {event.desc}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{dateLine}</DialogDescription>
          )}
          <div className="flex flex-wrap gap-3">
            {/* Primary action navigates to the full Single Event page — the modal
                is an optional fast preview, not the RSVP endpoint (04 §3d). */}
            <a
              href={event.url ?? fallbackUrl}
              className="rounded-full bg-accent px-[26px] py-3 font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep"
            >
              {viewLabel}
            </a>
            {event.rsvpUrl ? (
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener"
                className="rounded-full border-2 border-accent bg-white px-6 py-2.5 font-display text-[0.9rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white"
              >
                {rsvpLabel}
              </a>
            ) : null}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
