"use client";

import { useEffect } from "react";

/* Freeze the document behind a full-viewport overlay (the mobile nav panel).
 *
 * `overflow: hidden` on <html> is the lock itself; the two lines around it are
 * what keep the lock from being felt:
 *   - hiding the document scrollbar reclaims its gutter, which slides every
 *     centered container sideways for as long as the panel is open — the
 *     padding puts the gutter back;
 *   - a document that cannot scroll loses its offset in some engines, so the
 *     panel would close onto a page scrolled back to the top. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const offset = window.scrollY;
    const gutter = window.innerWidth - root.clientWidth;
    const padding = root.style.paddingRight;
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;
    root.classList.add("overflow-hidden");
    return () => {
      root.classList.remove("overflow-hidden");
      root.style.paddingRight = padding;
      if (window.scrollY !== offset) window.scrollTo(0, offset);
    };
  }, [locked]);
}
