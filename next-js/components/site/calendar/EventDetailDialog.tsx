"use client";

import type { RefObject } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiteLink } from "@/components/site/SiteLink";
import { dateTile, eventDateLine } from "@/lib/calendar";
import { categoryById, eventCategories } from "@/lib/categories";
import type { ChapterEvent, EventCategory } from "@/lib/schemas";

/* Event preview dialog (openspec progress-now-v4-events task 2.5, Calendar v4
 * "Event modal"): radius-20 white card, brand date tile + Bowlby title, 40px
 * round close, When/Where lines, description, accent "View event" pill +
 * outline "RSVP". Radix Dialog supplies the focus trap, Escape and focus
 * restore: the dialog is opened programmatically (no Radix trigger), so the
 * opener element is recorded by the caller and refocused on close. The
 * primary action navigates to the
 * Single Event page — the modal is a fast preview, not the RSVP endpoint. */
export function EventDetailDialog({
  event,
  categories,
  showCategoryColors = true,
  fallbackUrl = "/calendar/",
  viewLabel = "View event",
  rsvpLabel = "RSVP",
  closeLabel = "Close",
  openerRef,
  onClose,
  wpOrigin,
}: {
  event: ChapterEvent | null;
  categories?: EventCategory[] | null;
  showCategoryColors?: boolean;
  fallbackUrl?: string;
  viewLabel?: string;
  rsvpLabel?: string;
  closeLabel?: string;
  /** element that opened the dialog — focus returns to it on close */
  openerRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  wpOrigin: string;
}) {
  const category = event ? categoryById(event.cat, eventCategories(categories)) : null;
  const tileColor = event && showCategoryColors ? (category?.color ?? undefined) : undefined;
  const tile = event ? dateTile(event.date) : null;
  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      {event && tile ? (
        <DialogContent
          className="event-detail-dialog max-h-[85vh] gap-4 overflow-auto rounded-[20px] border-none bg-white px-7 pb-[30px] pt-[26px] text-base text-ink shadow-modal ring-0 sm:max-w-[440px]"
          showCloseButton={false}
          data-testid="event-detail-dialog"
          data-event-id={event.id}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            openerRef?.current?.focus();
          }}
        >
          <div className="flex items-start justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className="flex flex-none flex-col rounded-[12px] bg-brand px-3.5 py-2.5 text-center text-white"
                style={tileColor ? { background: tileColor } : undefined}
                data-testid="event-detail-dialog-date-tile"
              >
                <span
                  className="text-[1.3rem] font-extrabold leading-[1.1]"
                  data-testid="event-detail-dialog-day"
                >
                  {tile.day}
                </span>
                <span
                  className="text-[0.72rem] font-bold tracking-[0.1em]"
                  data-testid="event-detail-dialog-month"
                >
                  {tile.month}
                </span>
              </span>
              <DialogTitle
                className="m-0 font-display text-[1.15rem] font-normal normal-case leading-[1.25] tracking-normal text-ink"
                data-testid="event-detail-dialog-title"
              >
                {event.title}
              </DialogTitle>
            </div>
            <DialogClose
              className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-control bg-white text-base font-extrabold text-ink transition-colors hover:border-ink"
              aria-label={closeLabel}
              data-testid="event-detail-dialog-close"
            >
              <span aria-hidden="true">✕</span>
            </DialogClose>
          </div>
          <div className="flex flex-col gap-1.5 text-base font-medium text-text-body">
            <span data-testid="event-detail-dialog-when">
              <strong className="text-ink">When:</strong> {eventDateLine(event)}
            </span>
            <span data-testid="event-detail-dialog-where">
              <strong className="text-ink">Where:</strong> {event.location}
            </span>
            <span
              className="text-[0.85rem] font-bold uppercase tracking-[0.06em] text-brand"
              data-testid="event-detail-dialog-category"
            >
              {category?.label}
            </span>
          </div>
          {event.desc ? (
            <DialogDescription
              className="m-0 text-[0.98rem] leading-[1.6] text-text-body"
              data-testid="event-detail-dialog-description"
            >
              {event.desc}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{eventDateLine(event)}</DialogDescription>
          )}
          <div className="flex flex-wrap gap-3">
            <SiteLink
              href={event.url ?? fallbackUrl}
              wpOrigin={wpOrigin}
              className="rounded-full bg-accent px-[26px] py-3 font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep"
              data-testid="event-detail-dialog-view-link"
            >
              {viewLabel}
            </SiteLink>
            {event.rsvpUrl ? (
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener"
                className="rounded-full border-2 border-accent bg-white px-6 py-2.5 font-display text-[0.9rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white"
                data-testid="event-detail-dialog-rsvp-link"
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
