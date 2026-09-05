<script setup lang="ts">
import type { AlertDialogTitleProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AlertDialogTitle } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="delegatedProps"
    :class="cn('font-display text-lg font-extrabold uppercase', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
