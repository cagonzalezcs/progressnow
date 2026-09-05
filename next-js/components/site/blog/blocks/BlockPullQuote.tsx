/* v4 blockquote (openspec progress-now-v4-blog D4): alt band, 6px brand rule, Bowlby quote */
export function BlockPullQuote({ quote, attribution }: { quote: string; attribution?: string }) {
  return (
    <aside className="block-pull-quote flex w-full flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:gap-3 md:rounded-[20px] md:border-l-[6px] md:px-[30px] md:py-[26px]">
      <blockquote className="m-0 font-display text-[1.05rem] font-normal leading-[1.4] text-ink md:text-[1.25rem] md:leading-[1.35]">
        {quote}
      </blockquote>
      {attribution ? (
        <div className="text-[0.88rem] font-bold text-brand md:text-[0.95rem]">— {attribution}</div>
      ) : null}
    </aside>
  );
}
