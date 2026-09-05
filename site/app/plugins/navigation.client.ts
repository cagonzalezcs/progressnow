import { defineNuxtPlugin, useRouter, useState } from "#imports";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { internalLinkTarget } from "@/lib/chapter/links";
import { setLocation } from "@/lib/location";
import { closeMenu } from "@/lib/menu";
import { installUrlStateRouter } from "@/lib/url-state";

/* Client navigation glue (openspec spec nuxt-static-site § Functional parity):
 *
 *  - the shared components render plain <a> links (they are the theme's
 *    islands too), so internal clicks are routed through vue-router here —
 *    modifier clicks, downloads, `data-native-nav`, WordPress admin/API paths,
 *    and other origins fall through to the browser;
 *  - hover/focus/touch intent prefetches the destination's `_payload.json`
 *    via Nuxt's `link:prefetch` hook (nuxt:payload listens);
 *  - the reactive stores the header depends on (current path, drawer state)
 *    follow the router; the URL-state adapter gets the router instance;
 *  - after the first client navigation the PHP shell's `hreflang` alternates
 *    are dropped so unhead owns the head (see useRouteSeo). */
export default defineNuxtPlugin({
  name: "progressnow:navigation",
  dependsOn: ["progressnow:shell"],
  setup(nuxtApp) {
    const router = useRouter();
    const navigated = useState<boolean>("chapter-navigated", () => false);
    installUrlStateRouter(router);

    const searchOf = (route: RouteLocationNormalizedLoaded): string => {
      const i = route.fullPath.indexOf("?");
      if (i === -1) return "";
      const end = route.fullPath.indexOf("#", i);
      return end === -1 ? route.fullPath.slice(i) : route.fullPath.slice(i, end);
    };

    setLocation(window.location.pathname, window.location.search);

    router.beforeResolve((to) => {
      closeMenu();
      setLocation(to.path, searchOf(to));
    });

    const phpAlternates = Array.from(
      document.querySelectorAll<HTMLLinkElement>('head link[rel="alternate"][hreflang]'),
    );
    router.afterEach((to, from) => {
      if (from.matched.length === 0) return; // initial navigation = the shell's route
      if (to.path === from.path) return;
      if (!navigated.value) {
        navigated.value = true;
        for (const link of phpAlternates) link.remove();
      }
    });

    const origin = window.location.origin;

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented) return; // an island (pagination, dropdown) already handled it
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor) return;
      const target = internalLinkTarget(anchor, origin);
      if (!target) return;
      e.preventDefault();
      const current = router.currentRoute.value;
      if (target.to === current.fullPath) return; // exact same URL — no-op
      void router.push(target.to);
    });

    const prefetched = new Set<string>();
    const onIntent = (e: Event) => {
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const target = internalLinkTarget(anchor, origin);
      if (!target || prefetched.has(target.path)) return;
      prefetched.add(target.path);
      void nuxtApp.hooks.callHook("link:prefetch", target.path);
    };
    document.addEventListener("mouseover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent, { passive: true });
    document.addEventListener("touchstart", onIntent, { passive: true });
  },
});
