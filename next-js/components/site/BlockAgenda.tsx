/* Event agenda (openspec progress-now-v4-events spec "Event content"): Bowlby
 * "Agenda" h2 + `110px 1fr` bordered rows. */
export function BlockAgenda({
  items,
  heading = "Agenda",
}: {
  items: { title: string; desc?: string }[];
  heading?: string;
}) {
  return (
    <div className="block-agenda flex w-full flex-col gap-2.5 md:gap-3" data-testid="block-agenda">
      <h2
        data-testid="block-agenda-heading"
        className="m-0 mt-3 scroll-mt-[108px] font-display text-[1.25rem] font-normal leading-[1.25] md:mt-[18px] md:text-[clamp(1.4rem,2.4vw,1.9rem)] md:leading-[1.15]"
      >
        {heading}
      </h2>
      <ol
        className="m-0 flex list-none flex-col gap-[9px] p-0 md:gap-2.5"
        data-testid="block-agenda-list"
      >
        {items.map((item, i) => (
          <li
            key={i}
            data-testid="block-agenda-item"
            data-item-index={i}
            className="grid items-baseline gap-3.5 rounded-[12px] border border-line px-4 py-3 [grid-template-columns:90px_1fr] md:gap-[18px] md:rounded-[14px] md:px-[18px] md:py-3.5 md:[grid-template-columns:110px_1fr]"
          >
            <span
              className="text-[0.95rem] font-extrabold text-brand md:text-base"
              data-testid="block-agenda-item-title"
            >
              {item.title}
            </span>
            <span
              className="text-[0.95rem] font-semibold md:text-base"
              data-testid="block-agenda-item-desc"
            >
              {item.desc ?? ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
