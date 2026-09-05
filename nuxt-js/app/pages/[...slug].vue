<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from "vue";
import { useResolvedRoute } from "@/composables/useChapter";
import type { ResolvedKind } from "@/lib/chapter/routes";
import RouteFront from "@/components/routes/RouteFront.vue";
import RoutePage from "@/components/routes/RoutePage.vue";
import RouteAbout from "@/components/routes/RouteAbout.vue";
import RouteGetInvolved from "@/components/routes/RouteGetInvolved.vue";
import RouteCalendar from "@/components/routes/RouteCalendar.vue";
import RoutePostsIndex from "@/components/routes/RoutePostsIndex.vue";
import RoutePost from "@/components/routes/RoutePost.vue";
import RouteEvent from "@/components/routes/RouteEvent.vue";
import RouteNotFound from "@/components/routes/RouteNotFound.vue";

/* One catch-all page: every public WordPress URL (both languages) resolves
 * against the /routes manifest (openspec design D3) and renders the matching
 * route component. Nuxt keys pages by path, so a path change remounts the
 * component with a fresh data key; query-only changes (archive filters,
 * calendar view) do not. */
const RouteStyleguide = defineAsyncComponent(() => import("@/components/routes/RouteStyleguide.vue"));

const COMPONENTS: Record<ResolvedKind, Component> = {
  front: RouteFront,
  page: RoutePage,
  about: RouteAbout,
  get_involved: RouteGetInvolved,
  calendar: RouteCalendar,
  posts_index: RoutePostsIndex,
  search: RoutePostsIndex,
  post: RoutePost,
  event: RouteEvent,
  styleguide: RouteStyleguide,
  not_found: RouteNotFound,
};

const resolved = useResolvedRoute();
const component = computed(() => COMPONENTS[resolved.value.kind]);
</script>

<template>
  <component :is="component" :resolved="resolved" :data-route-kind="resolved.kind" />
</template>
