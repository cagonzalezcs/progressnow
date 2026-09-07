"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* After a client-side route change, move focus to <main id="main"> (or to the
 * hash target) so keyboard and screen-reader users continue from the new
 * content, not the top of the document (openspec next-accessibility § Focus and
 * announcement on client navigation). Next's route announcer reads the title. */
export function FocusManager() {
  const pathname = usePathname();
  // Act only on a real path change. A "first run" flag is not enough: React dev
  // mode mounts effects twice, and the second run would focus the hash target of
  // the INITIAL load — stamping a tabindex on server HTML whose streamed segment
  // has not hydrated yet (a hydration mismatch on /about/#faq).
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    const hash = window.location.hash.slice(1);
    const hashTarget = hash ? document.getElementById(decodeURIComponent(hash)) : null;
    const target = hashTarget || document.getElementById("main");
    if (!target) return;
    // Scroll explicitly (instant), then focus with preventScroll. A scrolling
    // focus() pins <main>'s top to the viewport edge, under the sticky header,
    // hiding the breadcrumbs/heading; scrollIntoView honours scroll-margin-top.
    if (hashTarget) hashTarget.scrollIntoView({ block: "start", behavior: "instant" });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // A hash target (heading) is not focusable: lend it tabindex, and take it back
    // once focus moves on (removing it while focused blurs the element in Chromium).
    const lent = !target.hasAttribute("tabindex");
    if (lent) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (lent)
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }, [pathname]);
  return null;
}
