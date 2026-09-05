<script setup lang="ts">
/* Event preview dialog (openspec progress-now-v4-events task 2.5, Calendar v4
 * artboard "Event modal"): radius-20 white card, brand date tile + Bowlby
 * title, 40px round close, When/Where lines, description, accent "View event"
 * pill + outline "RSVP". The category term color survives as the tile tint. */
import { computed } from "vue";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type ChapterEvent,
  categoryById,
  MONTH_NAMES,
  MONTH_SHORTS,
  parseISODate,
  WEEKDAYS,
} from "@/lib/events";

const props = defineProps<{
  event: ChapterEvent | null;
  showCategoryColors: boolean;
  viewLabel?: string;
  rsvpLabel?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const tileColor = computed(() =>
  props.event && props.showCategoryColors ? (categoryById(props.event.cat).color ?? undefined) : undefined,
);

const date = computed(() => (props.event ? parseISODate(props.event.date) : null));
const dateLine = computed(() => {
  const d = date.value;
  if (!d || !props.event) return "";
  return `${WEEKDAYS[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${props.event.time}`;
});
</script>

<template>
  <Dialog :open="!!event" @update:open="(open) => !open && emit('close')">
    <DialogContent
      v-if="event && date"
      class="event-detail-dialog max-h-[85vh] gap-4 overflow-auto rounded-[20px] border-none bg-white px-7 pb-[30px] pt-[26px] shadow-modal sm:max-w-[440px]"
      :show-close-button="false"
      aria-label="Event details"
    >
      <div class="flex items-start justify-between gap-3.5">
        <div class="flex items-center gap-3.5">
          <span aria-hidden="true" class="flex flex-none flex-col rounded-[12px] bg-brand px-3.5 py-2.5 text-center text-white" :style="tileColor ? { background: tileColor } : undefined">
            <span class="text-[1.3rem] font-extrabold leading-[1.1]">{{ String(date.getDate()).padStart(2, "0") }}</span>
            <span class="text-[0.72rem] font-bold tracking-[0.1em]">{{ MONTH_SHORTS[date.getMonth()]?.toUpperCase() }}</span>
          </span>
          <DialogTitle class="m-0 font-display text-[1.15rem] font-normal normal-case leading-[1.25] tracking-normal text-ink">
            {{ event.title }}
          </DialogTitle>
        </div>
        <DialogClose
          class="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-control bg-white text-base font-extrabold text-ink transition-colors hover:border-ink"
          aria-label="Close"
        >
          ✕
        </DialogClose>
      </div>
      <div class="flex flex-col gap-1.5 text-base font-medium text-text-body">
        <span><strong class="text-ink">When:</strong> {{ dateLine }}</span>
        <span><strong class="text-ink">Where:</strong> {{ event.location }}</span>
        <span class="text-[0.85rem] font-bold uppercase tracking-[0.06em] text-brand">{{ categoryById(event.cat).label }}</span>
      </div>
      <DialogDescription v-if="event.desc" class="m-0 text-[0.98rem] leading-[1.6] text-text-body">
        {{ event.desc }}
      </DialogDescription>
      <div class="flex flex-wrap gap-3">
        <!-- Primary action navigates to the full Single Event page — the modal
             is an optional fast preview, not the RSVP endpoint (04 §3d). -->
        <a
          :href="event.url ?? '/calendar/'"
          class="rounded-full bg-accent px-[26px] py-3 font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep"
        >
          {{ viewLabel ?? "View event" }}
        </a>
        <a
          v-if="event.rsvpUrl"
          :href="event.rsvpUrl"
          target="_blank"
          rel="noopener"
          class="rounded-full border-2 border-accent bg-white px-6 py-2.5 font-display text-[0.9rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white"
        >
          {{ rsvpLabel ?? "RSVP" }}
        </a>
      </div>
    </DialogContent>
  </Dialog>
</template>
