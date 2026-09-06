"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { monthCells, monthKey, WEEKDAYS_LONG, type YearMonth } from "@/lib/calendar";
import { categoryById, eventCategories } from "@/lib/categories";
import { WEEKDAYS } from "@/lib/events";
import type { ChapterEvent, EventCategory } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* Month grid (openspec progress-now-v4-events D2, spec "Month grid (v4)";
 * next-accessibility § Keyboard): radius-20 card with --color-line gaps, brand
 * weekday header (single letters under 700px), white in-month / alt
 * out-of-month cells, 28px numeral circle (yellow for today). Events are solid
 * chips from 700px, filled with the category term color (brand blue when
 * colors are off / unset), and one dot per event in the same color below.
 * Keyboard: one tab stop; arrows move between days (Home/End =
 * week edges, PageUp/PageDown = previous/next month), Enter/Space on a day
 * opens its event (or focuses its chips when there are several). */
export function MonthGrid({
  ym,
  events,
  todayISO,
  categories,
  showCategoryColors = true,
  labelledBy,
  onSelect,
  onMonthChange,
}: {
  ym: YearMonth;
  /** already category-filtered */
  events: ChapterEvent[];
  todayISO: string;
  categories?: EventCategory[] | null;
  showCategoryColors?: boolean;
  /** id of the visible month heading */
  labelledBy: string;
  onSelect: (id: string) => void;
  onMonthChange: (delta: number) => void;
}) {
  const cells = monthCells(ym, events, todayISO);
  const key = monthKey(ym);
  const palette = eventCategories(categories);
  const initialActive = () => {
    const today = cells.findIndex((c) => c.isToday && c.inMonth);
    return today >= 0 ? today : cells.findIndex((c) => c.inMonth);
  };
  const [active, setActive] = useState(initialActive);
  const [shownMonth, setShownMonth] = useState(key);
  const pendingFocus = useRef(false);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());

  // New month → active day resets (today when visible, else the 1st); keep focus in the grid.
  if (shownMonth !== key) {
    setShownMonth(key);
    setActive(initialActive());
  }
  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false;
      cellRefs.current[active]?.focus();
    }
  }, [active, key]);

  const move = (next: number) => {
    if (next < 0 || next >= cells.length) return;
    pendingFocus.current = true;
    setActive(next);
  };

  function onCellKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return; // chips handle their own keys
    const row = Math.floor(active / 7) * 7;
    const handlers: Record<string, () => void> = {
      ArrowRight: () => move(active + 1),
      ArrowLeft: () => move(active - 1),
      ArrowDown: () => move(active + 7),
      ArrowUp: () => move(active - 7),
      Home: () => move(row),
      End: () => move(row + 6),
      PageUp: () => {
        pendingFocus.current = true;
        onMonthChange(-1);
      },
      PageDown: () => {
        pendingFocus.current = true;
        onMonthChange(1);
      },
      Enter: () => open(active),
      " ": () => open(active),
    };
    const handler = handlers[e.key];
    if (!handler) return;
    e.preventDefault();
    handler();
  }

  function open(index: number) {
    const day = cells[index];
    if (!day || day.events.length === 0) return;
    if (day.events.length === 1) onSelect(day.events[0]!.id);
    else chipRefs.current.get(day.events[0]!.id)?.focus();
  }

  function onChipKey(e: KeyboardEvent<HTMLButtonElement>, day: (typeof cells)[number], i: number) {
    const cellIndex = cells.indexOf(day);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cellRefs.current[cellIndex]?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = day.events[i + (e.key === "ArrowDown" ? 1 : -1)];
      if (next) chipRefs.current.get(next.id)?.focus();
    }
  }

  /** Term color as the chip / dot fill (null → plain brand chip). */
  const fill = (ev: ChapterEvent) =>
    showCategoryColors ? (categoryById(ev.cat, palette).color ?? undefined) : undefined;

  return (
    <div
      className="month-grid"
      data-calendar-view="month"
      data-month={key}
      data-testid="month-grid"
    >
      <div
        role="grid"
        aria-labelledby={labelledBy}
        data-testid="month-grid-card"
        className="overflow-hidden rounded-[16px] bg-line shadow-gallery min-[700px]:rounded-[20px]"
      >
        <div
          role="row"
          className="grid grid-cols-7 gap-px bg-brand"
          data-testid="month-grid-weekdays"
        >
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              role="columnheader"
              data-testid="month-grid-weekday"
              data-weekday={wd}
              className="bg-brand px-0.5 py-[9px] text-center text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-white min-[700px]:px-1 min-[700px]:py-3 min-[700px]:text-[0.85rem] min-[700px]:tracking-[0.08em]"
            >
              <span aria-hidden="true" className="min-[700px]:hidden">
                {wd[0]}
              </span>
              <span aria-hidden="true" className="hidden min-[700px]:inline">
                {wd}
              </span>
              <span className="sr-only">{WEEKDAYS_LONG[i]}</span>
            </div>
          ))}
        </div>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <div
            key={r}
            role="row"
            className="grid grid-cols-7 gap-px bg-line"
            data-testid="month-grid-week"
            data-week-index={r}
          >
            {cells.slice(r * 7, r * 7 + 7).map((day, c) => {
              const index = r * 7 + c;
              const count = day.events.length;
              return (
                <div
                  key={day.key}
                  role="gridcell"
                  ref={(el) => {
                    cellRefs.current[index] = el;
                  }}
                  tabIndex={index === active ? 0 : -1}
                  aria-label={`${day.label}${count ? `, ${count} event${count === 1 ? "" : "s"}` : ""}${day.isToday ? ", today" : ""}`}
                  aria-current={day.isToday ? "date" : undefined}
                  data-date={day.key}
                  data-testid="month-grid-day"
                  data-in-month={day.inMonth}
                  data-today={day.isToday}
                  data-event-count={count}
                  onFocus={() => setActive(index)}
                  onKeyDown={onCellKey}
                  className={cn(
                    "flex min-h-11 min-w-0 flex-col items-start gap-1 px-1 py-1.5 outline-offset-[-3px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent min-[700px]:min-h-[96px] min-[700px]:gap-1.5 min-[700px]:px-2.5 min-[700px]:pb-3 min-[700px]:pt-2.5",
                    day.inMonth ? "bg-white" : "bg-alt",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-[0.78rem] font-extrabold min-[700px]:size-7 min-[700px]:text-[0.9rem]",
                      day.isToday && "bg-yellow text-ink",
                      day.inMonth ? "text-ink" : "text-muted", // 7.5:1 on alt; border-muted fails 4.5:1
                    )}
                    data-testid="month-grid-day-number"
                  >
                    {day.num}
                  </span>
                  {count ? (
                    <span
                      aria-hidden="true"
                      className="flex flex-wrap gap-[3px] min-[700px]:hidden"
                      data-testid="month-grid-day-dots"
                    >
                      {day.events.map((ev) => {
                        const color = fill(ev);
                        return (
                          <span
                            key={ev.id}
                            className="block size-[7px] rounded-full bg-brand"
                            style={color ? { backgroundColor: color } : undefined}
                            data-testid="month-grid-day-dot"
                            data-event-id={ev.id}
                          />
                        );
                      })}
                    </span>
                  ) : null}
                  {count ? (
                    <div
                      className="hidden w-full flex-col gap-1 min-[700px]:flex"
                      data-testid="month-grid-day-chips"
                    >
                      {day.events.map((ev, i) => {
                        const color = fill(ev);
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            tabIndex={-1}
                            ref={(el) => {
                              if (el) chipRefs.current.set(ev.id, el);
                              else chipRefs.current.delete(ev.id);
                            }}
                            aria-label={`${ev.title} — ${ev.time}`}
                            data-testid="month-grid-event-chip"
                            data-event-id={ev.id}
                            data-event-date={day.key}
                            style={color ? { backgroundColor: color } : undefined}
                            className="block w-full cursor-pointer truncate rounded-[8px] border-none bg-brand px-2 py-[5px] text-left text-[0.72rem] font-bold leading-[1.25] text-white transition-[filter,background-color] hover:brightness-[.85]"
                            onClick={() => onSelect(ev.id)}
                            onKeyDown={(e) => onChipKey(e, day, i)}
                          >
                            {ev.title}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p
        className="m-0 mt-3 px-1 text-[0.85rem] font-semibold text-muted min-[700px]:hidden"
        data-testid="month-grid-hint-compact"
      >
        ● = event day — switch to List for details.
      </p>
      <p
        className="m-0 mt-3.5 hidden text-[0.9rem] font-medium text-muted min-[700px]:block"
        data-testid="month-grid-hint"
      >
        Select an event for details, location, and how to RSVP. Arrow keys move between days.
      </p>
    </div>
  );
}
