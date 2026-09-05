<script setup lang="ts">
import type { NumberFieldDecrementProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Minus } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import { NumberFieldDecrement, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<NumberFieldDecrementProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <NumberFieldDecrement data-slot="decrement" v-bind="forwarded" :class="cn('absolute inset-y-[2px] left-[2px] flex items-center border-r-2 border-ink bg-transparent px-2.5 disabled:cursor-not-allowed disabled:opacity-20', props.class)">
    <slot>
      <Minus class="h-4 w-4" />
    </slot>
  </NumberFieldDecrement>
</template>
