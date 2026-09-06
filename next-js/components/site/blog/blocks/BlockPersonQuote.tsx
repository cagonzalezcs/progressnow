import { ImageSlot } from "@/components/site/blog/ImageSlot";

/* Person quote (openspec gutenberg-post-blocks § person_quote). The quote
 * carries its own `lang` so screen readers switch voice; the translation, when
 * present, is in the page language. */
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
    <div
      className="block-person-quote flex w-full flex-wrap items-start gap-6 rounded-[20px] bg-alt px-6 py-6 md:px-8 md:py-7"
      data-testid="block-person-quote"
    >
      <div
        className="size-24 flex-none overflow-hidden rounded-full bg-white shadow-subtle"
        data-testid="block-person-quote-photo"
      >
        <ImageSlot src={photo} alt={alt} loading="lazy" sizes="96px" />
      </div>
      <div className="flex flex-[1_1_300px] flex-col gap-3">
        <blockquote
          lang={lang}
          className="m-0 font-display text-[1.05rem] font-normal leading-[1.4] text-ink md:text-[1.25rem] md:leading-[1.35]"
          data-testid="block-person-quote-text"
        >
          {quote}
        </blockquote>
        {translation ? (
          <div
            className="text-base leading-[1.6] text-text-body"
            data-testid="block-person-quote-translation"
          >
            {translation}
          </div>
        ) : null}
        <div
          className="text-[0.85rem] font-bold uppercase tracking-[0.06em]"
          data-testid="block-person-quote-byline"
        >
          <span className="text-brand" data-testid="block-person-quote-name">
            {name}
          </span>
          {role ? (
            <span className="text-muted" data-testid="block-person-quote-role">
              {" "}
              · {role}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
