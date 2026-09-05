import type { RouterConfig } from "@nuxt/schema";
import { START_LOCATION } from "vue-router";

/* Scroll behaviour for the takeover model (openspec spec php-shell-handoff
 * § Nuxt takes over the document): the initial "navigation" is the document
 * the shell already rendered, so the browser's position (and any hash target
 * it scrolled to) must be left alone. Later navigations behave like Nuxt's
 * default — restore on back/forward, honour hashes (with the sticky header's
 * scroll-margin), otherwise top. */
export default {
  scrollBehavior(to, from, savedPosition) {
    if (from === START_LOCATION) return false;

    const samePath = to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "");
    if (samePath) {
      if (from.hash && !to.hash) return savedPosition ?? { left: 0, top: 0 };
      if (to.hash) return { el: to.hash, top: hashMarginTop(to.hash), behavior: "smooth" };
      return false;
    }

    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, top: hashMarginTop(to.hash), behavior: "instant" };
    return { left: 0, top: 0 };
  },
} satisfies RouterConfig;

function hashMarginTop(selector: string): number {
  try {
    const el = document.querySelector(selector);
    if (el) {
      return (
        (Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0) +
        (Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      );
    }
  } catch {
    /* invalid selector */
  }
  return 0;
}
