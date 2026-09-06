import { SiteLink } from "@/components/site/SiteLink";

/* Same anatomy as the Interior template's document row (views/page.twig).
 * Upload URLs stay on the WordPress origin (SiteLink → "wordpress" kind). */
export function BlockDocument({
  url,
  title,
  description,
  wpOrigin,
}: {
  url: string;
  title: string;
  description?: string;
  wpOrigin: string;
}) {
  return (
    <div
      className="block-document flex w-full flex-wrap items-center justify-between gap-5 rounded-[16px] bg-white px-[22px] py-[18px] shadow-card"
      data-testid="block-document"
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="rounded-[10px] border-2 border-accent px-2.5 py-2 font-mono text-[0.8rem] font-bold text-accent"
          data-testid="block-document-badge"
        >
          PDF
        </span>
        <div className="flex flex-col gap-[3px]">
          <span className="text-[1.05rem] font-bold" data-testid="block-document-title">
            {title}
          </span>
          {description ? (
            <span className="text-[0.85rem] text-muted" data-testid="block-document-description">
              {description}
            </span>
          ) : null}
        </div>
      </div>
      <SiteLink
        href={url}
        wpOrigin={wpOrigin}
        aria-label={`Download ${title}`}
        className="whitespace-nowrap rounded-full border-2 border-accent px-5 py-2 text-[0.9rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white"
        data-testid="block-document-download"
      >
        Download
      </SiteLink>
    </div>
  );
}
