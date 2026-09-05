<script setup lang="ts">
import type { SplitterResizeHandleEmits, SplitterResizeHandleProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { GripVertical } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import { SplitterResizeHandle, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<SplitterResizeHandleProps & { class?: HTMLAttributes["class"], withHandle?: boolean }>()
const emits = defineEmits<SplitterResizeHandleEmits>()

const delegatedProps = reactiveOmit(props, "class", "withHandle")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SplitterResizeHandle
    data-slot="resizable-handle"
    v-bind="forwarded"
    :class="cn('bg-ink focus-visible:ring-ring relative flex w-1 items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[orientation=vertical]:h-1 data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 [&[data-orientation=vertical]>div]:rotate-90', props.class)"
  >
    <template v-if="props.withHandle">
      <div class="bg-alt z-10 flex h-5 w-4 items-center justify-center rounded-none border-2 border-ink">
        <slot>
          <GripVertical class="size-2.5" />
        </slot>
      </div>
    </template>
  </SplitterResizeHandle>
</template>
