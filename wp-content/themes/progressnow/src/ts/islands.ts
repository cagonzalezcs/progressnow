import { createApp, type App, type Component } from "vue";

/**
 * Vue island registry.
 *
 * Twig usage:
 *   <div data-vue-island="Styleguide" data-props='{{ props_json|e("html_attr") }}'></div>
 *
 * Components load lazily so pages only ship the islands they mount.
 */
const registry: Record<string, () => Promise<{ default: Component }>> = {
  Styleguide: () => import("@/components/site/Styleguide.vue"),
  SiteHeader: () => import("@/components/site/SiteHeader.vue"),
  SiteFooter: () => import("@/components/site/SiteFooter.vue"),
  PageHeader: () => import("@/components/site/PageHeader.vue"),
  FaqAccordion: () => import("@/components/site/FaqAccordion.vue"),
  EventCalendar: () => import("@/components/site/EventCalendar.vue"),
  BlogArchive: () => import("@/components/site/blog/BlogArchive.vue"),
  SinglePost: () => import("@/components/site/blog/SinglePost.vue"),
  SingleEvent: () => import("@/components/site/SingleEvent.vue"),
};

/* Track the Vue app mounted on each island node so a subtree (e.g. the old
 * <main> during a client navigation) can be torn down before it is replaced,
 * preventing leaks. WeakMap keys drop automatically once nodes are GC'd. */
const apps = new WeakMap<HTMLElement, App>();

export function mountIslands(root: ParentNode = document): void {
  for (const el of root.querySelectorAll<HTMLElement>("[data-vue-island]")) {
    void mountIsland(el);
  }
}

/** Awaitable mount — resolves once every island under `root` has mounted (its
 * DOM is rendered). Used by the JSON fast-path so a shared-element morph can
 * target freshly-hydrated content. */
export function mountIslandsAsync(root: ParentNode = document): Promise<void> {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-vue-island]"));
  return Promise.all(els.map(mountIsland)).then(() => undefined);
}

/** Unmount every island app under `root`. Call on the outgoing subtree before
 * replacing its DOM. Islands outside `root` (SiteHeader/SiteFooter live outside
 * <main>) are left mounted. */
export function unmountIslands(root: ParentNode = document): void {
  for (const el of root.querySelectorAll<HTMLElement>("[data-vue-island]")) {
    apps.get(el)?.unmount();
    apps.delete(el);
  }
}

async function mountIsland(el: HTMLElement): Promise<void> {
  const name = el.dataset.vueIsland ?? "";
  const loader = registry[name];
  if (!loader) {
    console.warn(`[islands] no component registered for "${name}"`);
    return;
  }
  if (apps.has(el)) return; // already hydrated (defensive against double-mount)

  let props: Record<string, unknown> = {};
  if (el.dataset.props) {
    try {
      props = JSON.parse(el.dataset.props);
    } catch (error) {
      console.error(`[islands] invalid data-props JSON on "${name}"`, error);
    }
  }

  const { default: component } = await loader();
  const app = createApp(component, props);
  app.mount(el);
  apps.set(el, app);
}
