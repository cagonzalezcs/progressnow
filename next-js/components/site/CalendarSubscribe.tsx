/* Calendar subscribe strip (openspec events-presentation "Calendar subscribe
 * strip"; design D5): ink band, Bowlby title, muted lede, white "Google
 * Calendar" pill + outline "iCal / .ics" pill. Server-rendered outside the
 * island. Hrefs are used verbatim (absolute to WordPress). */
export function CalendarSubscribe({
  title,
  lede,
  googleLabel,
  icsLabel,
  googleCalUrl,
  icsUrl,
}: {
  title: string;
  lede: string;
  googleLabel: string;
  icsLabel: string;
  googleCalUrl: string;
  icsUrl: string;
}) {
  return (
    <section
      id="subscribe"
      className="calendar-subscribe bg-ink px-6 py-10 text-white md:py-14"
      data-tone="ink"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-8">
        <div className="flex max-w-[56ch] flex-col gap-2">
          <h2 className="m-0 font-display text-[1.2rem] font-normal md:text-[1.4rem]">{title}</h2>
          <p className="m-0 text-[0.98rem] leading-[1.55] text-muted-on-ink md:text-[1.05rem]">
            {lede}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 md:gap-3">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-white px-6 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-ink no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-[34px] md:py-3.5 md:text-base"
          >
            {googleLabel}
          </a>
          <a
            href={icsUrl}
            className="rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-8 md:py-3 md:text-base"
          >
            {icsLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
