import { ImageSlot } from "@/components/site/blog/ImageSlot";

/* Member quote with photo; `lang` marks the quote's language for AT, the
 * optional translation follows in the page language. */
export function BlockPersonQuote({
  photo,
  alt,
  quote,
  translation,
  name,
  role,
  lang,
}: {
  photo: string | null;
  alt: string;
  quote: string;
  translation?: string;
  name: string;
  role?: string;
  lang: "en" | "es";
}) {
  return (
    <div className="block-person-quote flex w-full flex-wrap items-start gap-6 rounded-[20px] bg-alt px-6 py-6 md:px-8 md:py-7">
      <div className="size-24 flex-none overflow-hidden rounded-full bg-white shadow-subtle">
        <ImageSlot src={photo} alt={alt} opacity={0} loading="lazy" />
      </div>
      <div className="flex flex-[1_1_300px] flex-col gap-3">
        <blockquote
          lang={lang}
          className="m-0 font-display text-[1.05rem] font-normal leading-[1.4] text-ink md:text-[1.25rem] md:leading-[1.35]"
        >
          {quote}
        </blockquote>
        {translation ? (
          <div className="text-base leading-[1.6] text-text-body">{translation}</div>
        ) : null}
        <div className="text-[0.85rem] font-bold uppercase tracking-[0.06em]">
          <span className="text-brand">{name}</span>
          {role ? <span className="text-muted"> · {role}</span> : null}
        </div>
      </div>
    </div>
  );
}
