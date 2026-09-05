/* Event "Getting there" (openspec progress-now-v4-events task 3.2): striped
 * radius-20 map placeholder on the v4 card tokens + address line. */
export function BlockMap({
  address,
  heading = "Getting there",
}: {
  address: string;
  heading?: string;
}) {
  return (
    <div className="block-map flex w-full flex-col gap-2.5 md:gap-3">
      <h2 className="m-0 mt-3 scroll-mt-[108px] font-display text-[1.25rem] font-normal leading-[1.25] md:mt-[18px] md:text-[clamp(1.4rem,2.4vw,1.9rem)] md:leading-[1.15]">
        {heading}
      </h2>
      <div
        role="img"
        aria-label={`Map to ${address}`}
        className="flex h-[clamp(220px,30vw,320px)] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_16px,var(--color-control-faint)_16px_32px)] shadow-card md:rounded-[20px]"
      >
        <span className="rounded-full bg-white px-4 py-2 font-mono text-[0.85rem] font-bold text-muted shadow-subtle">
          Map · {address}
        </span>
      </div>
      <p className="m-0 text-base leading-[1.65] text-text-body md:text-[1.05rem]">{address}</p>
    </div>
  );
}
