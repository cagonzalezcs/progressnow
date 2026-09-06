"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useScrollLock } from "@/hooks/use-scroll-lock";

/* Behavior of the mobile nav panel (openspec site-chrome § Mobile navigation
 * toggle; next-accessibility § Keyboard-complete interactions). The panel is a
 * fixed overlay that covers the whole viewport below the bar, which puts four
 * things beyond the reach of markup alone:
 *
 *  - a tap on a panel link closes it immediately, rather than when the new
 *    route commits. Waiting on the commit reads as a dead tap while the route
 *    streams in, and a link to the page you are already on never committed
 *    anything, so the panel simply stayed open;
 *  - the document behind it is frozen without being shifted (`useScrollLock`),
 *    and the panel keeps its own overscroll to itself (`overscroll-contain` on
 *    the element) so dragging past its end no longer drags the page under it;
 *  - Tab stays inside the panel and its toggle: everything else is covered,
 *    so focus leaving them lands on things the visitor cannot see;
 *  - the bar's height is measured rather than assumed. It grows with the root
 *    font size (A+ / A++), and a panel pinned to a hard-coded 60px then rides
 *    up over the toggle that opened it and swallows the taps meant to close it.
 *
 * The panel is also display:none from `md` up, so a viewport that crosses that
 * line while it is open closes it — otherwise the page behind stays frozen
 * with no visible control left to unfreeze it. */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Tailwind's `md`: at and above it the panel is hidden and the tablet tier takes over. */
const TABLET_UP = "(min-width: 768px)";

export interface MobileNav {
  open: boolean;
  /** The bar the panel hangs from — its measured height becomes the panel's top edge. */
  barRef: RefObject<HTMLDivElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
  toggle: () => void;
  /** Close and leave focus where it is — a tap on a link inside the panel. */
  close: () => void;
}

export function useMobileNav(pathname: string): MobileNav {
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // The panel is open only for the path it was opened on: a navigation closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  const close = useCallback(() => setOpenFor(null), []);
  const toggle = useCallback(() => setOpenFor(open ? null : pathname), [open, pathname]);
  /** Escape and a second activation both hand focus back to the toggle. */
  const dismiss = useCallback(() => {
    setOpenFor(null);
    toggleRef.current?.focus();
  }, []);

  useScrollLock(open);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const height = Math.round(bar.getBoundingClientRect().height);
      if (height > 0) panelRef.current?.style.setProperty("--pn-bar-h", `${height}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      const toggleEl = toggleRef.current;
      if (!panel || !toggleEl) return;
      const stops = [toggleEl, ...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = stops[0]!;
      const last = stops[stops.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      let target: HTMLElement | null = null;
      if (!active || !stops.includes(active))
        target = first; // focus fell out (a click on the panel itself)
      else if (event.shiftKey && active === first) target = last;
      else if (!event.shiftKey && active === last) target = first;
      if (!target) return;
      event.preventDefault();
      target.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(TABLET_UP);
    if (query.matches) {
      close();
      return;
    }
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open, close]);

  return { open, barRef, panelRef, toggleRef, toggle, close };
}
