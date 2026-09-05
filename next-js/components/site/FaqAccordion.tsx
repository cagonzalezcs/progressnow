"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* FAQ disclosure rows (openspec progress-now-v4-interior-404 D2): Radix
 * accordion (one open, keyboard, aria-expanded) wearing the bordered radius-14
 * row styling — the same contract as the reka-ui Vue twin. */
export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Accordion className="faq-accordion flex flex-col gap-2.5 lg:gap-3" type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`faq-${index}`}
          className="overflow-hidden rounded-[12px] border border-line bg-white lg:rounded-[14px]"
        >
          <AccordionTrigger className="items-center gap-4 rounded-none bg-transparent px-4 py-3.5 text-[0.98rem] font-bold text-ink hover:bg-alt hover:no-underline lg:px-5 lg:py-4 lg:text-[1.05rem] [&>svg]:hidden">
            <span>{item.question}</span>
            <svg
              className="pointer-events-none !block size-4 shrink-0 text-accent"
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="square"
            >
              <path d="M2 8h12" />
              <path className="[[data-state=open]_&]:hidden" d="M8 2v12" />
            </svg>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 lg:px-5 lg:pb-[18px]">
            <p className="m-0 text-[0.95rem] leading-[1.6] text-text-body lg:text-[1.02rem]">
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
