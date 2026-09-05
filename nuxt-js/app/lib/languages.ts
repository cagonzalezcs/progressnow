import { reactive } from "vue";
import type { LanguageLink } from "@/components/site/LanguageToggle.vue";

/* Reactive language-switcher store (mirrors lib/location.ts — no Pinia). Each
 * entry's `url` is the current page's translation (computed server-side in
 * inc/i18n.php). SiteHeader stays mounted across client navigations, so its
 * mount-time `languages` prop would otherwise freeze at the entry page's URLs;
 * ts/navigation.ts refreshes this store from the fetched document on every
 * committed navigation so the switcher always points at the current page. */
export const languageState = reactive<{ list: LanguageLink[] }>({
  list: [],
});

export function setLanguages(list: LanguageLink[]): void {
  languageState.list = list;
}
