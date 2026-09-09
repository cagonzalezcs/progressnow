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
    const main = document.getElementById("main");
    const hashTarget = hash ? findHashTarget(decodeURIComponent(hash)) : null;
    if (hashTarget) {
      focusTarget(hashTarget, true);
      return;
    }
    if (!main) return;
    // Land on <main> — the navigation itself is what to announce — and, when the
    // hash target is not in the DOM yet, hand focus on to it once it mounts.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    focusTarget(main, false);
    if (!hash) return;
    // The route's content streams behind a Suspense boundary (app/[[...slug]]/
    // page.tsx): the pathname commits with the fallback in place, and the heading
    // arrives with a later reveal. Watch for it; move on only if focus is still
    // where this effect left it, so a visitor who has already moved on keeps
    // their place. The observer lives until the next route change.
    const target = decodeURIComponent(hash);
    const observer = new MutationObserver(() => {
      const el = findHashTarget(target);
      if (!el) return;
      observer.disconnect();
      const active = document.activeElement;
      if (active === main || active === document.body || active === null) focusTarget(el, true);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}

/** The hash target, if it is in the DOM *and rendered*: during a navigation the
 * previous route may still be mounted, hidden, and a same-id element there
 * (`#faq` exists on /about/ and /get-involved/) is not the one to focus. */
function findHashTarget(id: string): HTMLElement | null {
  const el = document.getElementById(id);
  if (!el) return null;
  if (typeof el.checkVisibility === "function" && !el.checkVisibility()) return null;
  return el;
}

/* Scroll explicitly (instant), then focus with preventScroll. A scrolling focus()
 * pins the target's top to the viewport edge, under the sticky header, hiding the
 * breadcrumbs/heading; scrollIntoView honours scroll-margin-top. A hash target
 * (heading) is not focusable: lend it tabindex, and take it back once focus moves
 * on (removing it while focused blurs the element in Chromium). */
function focusTarget(target: HTMLElement, scrollTo: boolean) {
  if (scrollTo) target.scrollIntoView({ block: "start", behavior: "instant" });
  const lent = !target.hasAttribute("tabindex");
  if (lent) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  if (lent)
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
}
