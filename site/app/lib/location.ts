import { reactive } from "vue";

/* Reactive current-location store shared with the theme's islands (same
 * module path, same API). Under Nuxt it is fed by the router
 * (plugins/navigation.client.ts → setLocation on every committed navigation)
 * and starts empty so it is safe to import during prerender. SiteHeader reads
 * `location.path` for its active-link state. */
export const location = reactive({
  path: "",
  search: "",
});

export function setLocation(path: string, search = ""): void {
  location.path = path;
  location.search = search;
}
