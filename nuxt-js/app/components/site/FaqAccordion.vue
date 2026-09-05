<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* FAQ disclosure rows (openspec progress-now-v4-interior-404 D2): the
 * artboard's <details> is a design-tool stand-in — this keeps the reka
 * accordion (one open, keyboard, aria-expanded) and wears the bordered
 * radius-14 row styling. The Twig fallback in page-about / page-get-involved
 * emits the same row classes. */
interface FaqItem {
  question: string;
  answer: string;
}

defineProps<{
  items: FaqItem[];
}>();
</script>

<template>
  <Accordion class="faq-accordion flex flex-col gap-2.5 lg:gap-3" type="single" collapsible>
    <AccordionItem
      v-for="(item, index) in items"
      :key="item.question"
      :value="`faq-${index}`"
      class="overflow-hidden rounded-[12px] border border-line bg-white lg:rounded-[14px]"
    >
      <AccordionTrigger
        class="items-center gap-4 rounded-none bg-transparent px-4 py-3.5 text-[0.98rem] font-bold text-ink hover:bg-alt hover:no-underline lg:px-5 lg:py-4 lg:text-[1.05rem]"
      >
        <span>{{ item.question }}</span>
        <template #icon>
          <svg
            class="pointer-events-none size-4 shrink-0 text-accent"
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="square"
          >
            <path d="M2 8h12" />
            <path class="[[data-state=open]_&]:hidden" d="M8 2v12" />
          </svg>
        </template>
      </AccordionTrigger>
      <AccordionContent class="px-4 pb-4 lg:px-5 lg:pb-[18px]">
        <p class="m-0 text-[0.95rem] leading-[1.6] text-text-body lg:text-[1.02rem]">{{ item.answer }}</p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
