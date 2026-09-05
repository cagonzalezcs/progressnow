/* Downloadable document row: PDF badge, title/description, outline pill. */
export function BlockDocument({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="block-document flex w-full flex-wrap items-center justify-between gap-5 rounded-[16px] bg-white px-[22px] py-[18px] shadow-card">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="rounded-[10px] border-2 border-accent px-2.5 py-2 font-mono text-[0.8rem] font-bold text-accent"
        >
          PDF
        </span>
        <div className="flex flex-col gap-[3px]">
          <span className="text-[1.05rem] font-bold">{title}</span>
          {description ? <span className="text-[0.85rem] text-muted">{description}</span> : null}
        </div>
      </div>
      <a
        href={url}
        className="whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white"
      >
        Download<span className="sr-only">: {title}</span>
      </a>
    </div>
  );
}
