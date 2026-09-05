<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useHead } from "#imports";
import type { ResolvedRoute } from "@/lib/chapter/routes";

/* Dev-only component library page (page-templates/styleguide.php). Loaded
 * lazily — it pulls the whole shadcn-vue demo tree — and never indexed. */
defineProps<{ resolved: ResolvedRoute }>();

const Styleguide = defineAsyncComponent(() => import("@/components/site/Styleguide.vue"));

useHead({ title: "Styleguide", meta: [{ key: "robots", name: "robots", content: "noindex, nofollow" }] });
</script>

<template>
  <ClientOnly>
    <Styleguide />
  </ClientOnly>
</template>
