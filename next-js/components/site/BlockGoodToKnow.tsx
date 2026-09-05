/* Event "Good to know" (openspec progress-now-v4-events spec "Event
 * content"): radius-20 alt panel, brand uppercase heading, bulleted list. */
export function BlockGoodToKnow({
  items,
  heading = "Good to know",
}: {
  items: string[];
  heading?: string;
}) {
  return (
    <div className="block-good-to-know flex w-full flex-col gap-2.5 rounded-[16px] bg-alt px-[22px] py-5 md:gap-3 md:rounded-[20px] md:px-[30px] md:py-[26px]">
      <div className="text-[0.92rem] font-extrabold uppercase tracking-[0.04em] text-brand md:text-base">
        {heading}
      </div>
      <ul className="m-0 flex list-disc flex-col gap-[7px] pl-5 text-[0.98rem] leading-[1.55] text-text-body md:gap-2 md:pl-[22px] md:text-[1.05rem]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
