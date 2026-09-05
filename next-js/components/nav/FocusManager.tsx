"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* After a client-side route change, move focus to <main id="main"> (or to the
 * hash target) so keyboard and screen-reader users continue from the new
 * content, not the top of the document (openspec next-accessibility § Focus and
 * announcement on client navigation). Next's route announcer reads the title. */
export function FocusManager() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const hash = window.location.hash.slice(1);
    const target =
      (hash && document.getElementById(decodeURIComponent(hash))) ||
      document.getElementById("main");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: Boolean(hash) === false ? false : true });
  }, [pathname]);
  return null;
}
