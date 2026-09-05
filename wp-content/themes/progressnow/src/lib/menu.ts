import { reactive } from "vue";

/* Reactive mobile-menu open state (mirrors the lib/location.ts reactive pattern
 * — no Pinia). SiteHeader owns the in-header panel UI, but ts/navigation.ts must
 * close it on every client navigation (design D6: the panel closes on
 * navigation) before the View Transition snapshot. This module-level store is
 * the cross-module channel that lets it do so. */
export const menu = reactive({ open: false });

export function closeMenu(): void {
  menu.open = false;
}
