<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    :class="cn('m-0 flex list-none flex-wrap items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[0.85rem] font-bold text-ink break-words', props.class)"
  >
    <slot />
  </ol>
</template>
