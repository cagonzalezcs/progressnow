<script lang="ts" setup>
import type { StepperTitleProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { StepperTitle, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<StepperTitleProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <StepperTitle v-bind="forwarded" :class="cn('font-display text-sm font-bold uppercase whitespace-nowrap', props.class)">
    <slot />
  </StepperTitle>
</template>
