<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useA11ySettings, type TextSize } from "@/composables/useA11ySettings";

/* v4 "Aa" accessibility widget (design D6): a white pill trigger on the blue
 * header (desktop + tablet only — the mobile panel exposes text size alone,
 * by owner decision; visitors zoom / use OS contrast and motion settings) and
 * a white radius-14 popover with the segmented text-size control plus the
 * High contrast / Reduce motion On-Off pills. State lives in useA11ySettings
 * (persisted as `chapter-a11y`) so the mobile A / A+ / A++ row and this popover
 * always agree. */
withDefaults(
  defineProps<{
    /** Trigger height: desktop 42px · tablet 44px (touch target). */
    size?: "desktop" | "tablet";
  }>(),
  { size: "desktop" },
);

const { settings, setTextSize, toggleHighContrast, toggleReduceMotion } =
  useA11ySettings();

const sizes: { value: TextSize; label: string }[] = [
  { value: "default", label: "A" },
  { value: "large", label: "A+" },
  { value: "xl", label: "A++" },
];

const TRIGGER = {
  desktop: "h-[42px] px-[18px] text-[0.95rem]",
  tablet: "h-11 px-4 text-[0.9rem]",
} as const;

const rowClass =
  "flex cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-0 text-left text-[0.9rem] font-bold text-ink";

function pillClass(on: boolean): string {
  return [
    "rounded-full border px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em]",
    on ? "border-brand bg-brand text-white" : "border-control bg-transparent text-muted",
  ].join(" ");
}
</script>

<template>
  <Popover>
    <PopoverTrigger
      :class="[
        'a11y-widget box-border inline-flex cursor-pointer items-center rounded-full border-0 bg-white font-display font-normal text-brand transition-colors hover:bg-brand-deep hover:text-white',
        TRIGGER[size],
      ]"
      aria-label="Accessibility options"
      title="Accessibility options"
    >
      Aa
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="z-[200] w-[280px] rounded-[14px] border-0 bg-white p-[18px] font-sans text-ink shadow-popover"
    >
      <div class="flex flex-col gap-4">
        <div class="text-base font-bold">Accessibility</div>

        <div class="flex flex-col gap-2">
          <div class="text-[0.9rem] font-bold">Text size</div>
          <div class="flex gap-1.5">
            <button
              v-for="s in sizes"
              :key="s.value"
              type="button"
              class="flex-1 cursor-pointer rounded-[8px] border py-2 text-[0.95rem] font-bold"
              :class="
                settings.textSize === s.value
                  ? 'border-ink bg-ink text-white'
                  : 'border-control bg-white text-ink hover:bg-alt'
              "
              :aria-pressed="settings.textSize === s.value"
              @click="setTextSize(s.value)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <button
          type="button"
          :class="rowClass"
          :aria-pressed="settings.highContrast"
          @click="toggleHighContrast()"
        >
          <span>High contrast</span>
          <span :class="pillClass(settings.highContrast)">
            {{ settings.highContrast ? "On" : "Off" }}
          </span>
        </button>

        <button
          type="button"
          :class="rowClass"
          :aria-pressed="settings.reduceMotion"
          @click="toggleReduceMotion()"
        >
          <span>Reduce motion</span>
          <span :class="pillClass(settings.reduceMotion)">
            {{ settings.reduceMotion ? "On" : "Off" }}
          </span>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
