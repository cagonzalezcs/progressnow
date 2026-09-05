import { reactive } from "vue";

/* Reactive mobile-drawer open state (mirrors the lib/location.ts reactive pattern
 * — no Pinia). SiteHeader owns the drawer UI, but ts/navigation.ts must close it
 * synchronously *before* the View Transition snapshot on every client navigation
 * so the portaled drawer/overlay never competes with the content cross-fade. This
 * module-level store is the cross-module channel that lets it do so. */
export const menu = reactive({ open: false });

export function closeMenu(): void {
  menu.open = false;
}
