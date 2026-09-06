"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { categoryById } from "@/lib/categories";
import {
  type ChapterEvent,
  type EventCategory,
  MONTH_NAMES,
  parseISODate,
  toISODate,
  WEEKDAYS,
  WEEKDAYS_LONG,
} from "@/lib/events";
import { cn } from "@/lib/utils";

/* Month grid (openspec events-presentation "Month grid (v4)"; twin of
 * MonthGrid.vue): radius-20 card with --color-line gaps, brand weekday header
 * (single letters under 700px), white in-month / alt out-of-month cells, 28px
 * numeral circle (yellow for today). Events are solid chips from 700px filled
 * with the category color (brand when colors are off / unset) and 7px dots
 * below. Keyboard (design D6): chips form a roving-tabindex group — ←/→ walk
 * chips in document order, ↑/↓ jump a week, Home/End first/last chip. The
 * parent keys the grid by month so the roving index resets per month. */
interface DayCell {
  key: string;
  num: number;
  inMonth: boolean;
  isToday: boolean;
  label: string;
  events: ChapterEvent[];
}

export function buildCells(
  year: number,
  month: number,
  today: string,
  events: ChapterEvent[],
): DayCell[] {
  const byDate: Record<string, ChapterEvent[]> = {};
  for (const ev of events) (byDate[ev.date] ??= []).push(ev);
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const out: DayCell[] = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(year, month, i - firstDow + 1);
    const key = toISODate(d);
    const dayEvents = byDate[key] ?? [];
    const count =
      dayEvents.length === 0
        ? ""
        : `, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`;
    out.push({
      key,
      num: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: key === today,
      label: `${WEEKDAYS_LONG[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}${count}`,
      events: dayEvents,
    });
  }
  return out;
}

export function MonthGrid({
  year,
  month,
  today,
  events,
  categories,
  showCategoryColors,
  onSelect,
}: {
  year: number;
  /** 0-based */
  month: number;
  /** ISO yyyy-mm-dd, decided by the server (hydration-stable) */
  today: string;
  /** already category-filtered */
  events: ChapterEvent[];
  categories: EventCategory[];
  showCategoryColors: boolean;
  onSelect: (id: string) => void;
}) {
  const cells = buildCells(year, month, today, events);
  const chips = cells.flatMap((day) => day.events.map((ev) => ({ ev, date: day.key })));
  const [activeIndex, setActive] = useState(0);
  const active = Math.min(activeIndex, Math.max(chips.length - 1, 0));
  const root = useRef<HTMLDivElement>(null);

  const fill = (ev: ChapterEvent): string | undefined =>
    showCategoryColors ? (categoryById(ev.cat, categories).color ?? undefined) : undefined;

  const focusChip = (index: number) => {
    const el = root.current?.querySelector<HTMLButtonElement>(`[data-chip-index="${index}"]`);
    if (el) {
      setActive(index);
      el.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (chips.length === 0) return;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
        next = Math.min(index + 1, chips.length - 1);
        break;
      case "ArrowLeft":
        next = Math.max(index - 1, 0);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = chips.length - 1;
        break;
      case "ArrowDown":
      case "ArrowUp": {
        // Same weekday, ±1 week: the nearest chip on that day, else keep searching in that direction.
        const dir = e.key === "ArrowDown" ? 7 : -7;
        const from = parseISODate(chips[index]!.date);
        for (let step = 1; step <= 6 && next === null; step++) {
          const target = toISODate(
            new Date(from.getFullYear(), from.getMonth(), from.getDate() + dir * step),
          );
          const found = chips.findIndex((c) => c.date === target);
          if (found >= 0) next = found;
        }
        break;
      }
      default:
        return;
    }
    if (next !== null) {
      e.preventDefault();
      focusChip(next);
    }
  };

  let chipIndex = -1;
  return (
    <div className="month-grid" data-testid="month-grid">
      <div
        ref={root}
        role="group"
        aria-label={`${MONTH_NAMES[month]} ${year}`}
        className="overflow-hidden rounded-[16px] bg-line shadow-gallery min-[700px]:rounded-[20px]"
        data-testid="month-grid-card"
      >
        <div className="grid grid-cols-7 gap-px bg-brand" data-testid="month-grid-weekdays">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              data-testid="month-grid-weekday"
              data-weekday={wd}
              className="bg-brand px-0.5 py-[9px] text-center text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-white min-[700px]:px-1 min-[700px]:py-3 min-[700px]:text-[0.85rem] min-[700px]:tracking-[0.08em]"
            >
              <span className="min-[700px]:hidden" aria-hidden="true">
                {wd[0]}
              </span>
              <span className="hidden min-[700px]:inline">{wd}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line" data-testid="month-grid-days">
          {cells.map((day) => (
            <div
              key={day.key}
              data-date={day.key}
              data-testid="month-grid-day"
              data-in-month={day.inMonth}
              data-today={day.isToday}
              className={cn(
                "flex min-h-11 min-w-0 flex-col items-start gap-1 px-1 py-1.5 min-[700px]:min-h-[96px] min-[700px]:gap-1.5 min-[700px]:px-2.5 min-[700px]:pb-3 min-[700px]:pt-2.5",
                day.inMonth ? "bg-white" : "bg-alt",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-[0.78rem] font-extrabold min-[700px]:size-7 min-[700px]:text-[0.9rem]",
                  day.isToday && "bg-yellow text-ink",
                  day.inMonth ? "text-ink" : "text-border-muted",
                )}
              >
                <span aria-hidden="true" data-testid="month-grid-day-number">
                  {day.num}
                </span>
                <span className="sr-only">{day.label}</span>
              </span>
              {day.events.length ? (
                <span
                  aria-hidden="true"
                  className="flex flex-wrap gap-[3px] min-[700px]:hidden"
                  data-testid="month-grid-day-dots"
                >
                  {day.events.map((ev) => (
                    <span
                      key={ev.id}
                      className="block size-[7px] rounded-full bg-brand"
                      data-testid="month-grid-day-dot"
                      data-event-id={ev.id}
                      style={fill(ev) ? { backgroundColor: fill(ev) } : undefined}
                    />
                  ))}
                </span>
              ) : null}
              <div
                className="hidden w-full flex-col gap-1 min-[700px]:flex"
                data-testid="month-grid-day-chips"
              >
                {day.events.map((ev) => {
                  const index = ++chipIndex;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      data-chip-index={index}
                      data-testid="month-grid-event-chip"
                      data-event-id={ev.id}
                      data-event-date={day.key}
                      tabIndex={index === active ? 0 : -1}
                      title={`${ev.title} — ${ev.time}`}
                      style={fill(ev) ? { backgroundColor: fill(ev) } : undefined}
                      className="block w-full cursor-pointer truncate rounded-[8px] border-none bg-brand px-2 py-[5px] text-left text-[0.72rem] font-bold leading-[1.25] text-white transition-[filter,background-color] hover:brightness-[.85]"
                      onClick={() => onSelect(ev.id)}
                      onFocus={() => setActive(index)}
                      onKeyDown={(e) => onKeyDown(e, index)}
                    >
                      {ev.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
        Select an event for details, location, and how to RSVP.
      </p>
    </div>
  );
}
