/* Shared interior class recipes — the {% set %}s of page.twig / page-about.twig /
 * page-get-involved.twig, kept as literals so Tailwind sees them
 * (openspec interior-presentation § Article and sidebar layout). */
export const H2 =
  "m-0 scroll-mt-[110px] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
export const H2_LATER = "mt-3.5 xl:mt-[18px]";
/* Editor prose (kses'd WYSIWYG): the wrapper owns the typography so wpautop's <p> tags don't nest inside a template <p>. */
export const PROSE =
  "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
export const PROSE_SM =
  "text-base leading-[1.65] text-text-body [&_p]:m-0 [&_p+p]:mt-3 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_strong]:font-extrabold [&_strong]:text-ink";
export const CARD_GRID =
  "grid gap-3.5 md:grid-cols-2 md:gap-4 xl:gap-5 xl:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";
export const CARD =
  "flex flex-col gap-1.5 rounded-[16px] bg-white px-5 py-[18px] shadow-card md:gap-[7px] md:rounded-[18px] md:px-[22px] md:py-5 xl:gap-2 xl:rounded-[20px] xl:px-6 xl:py-[22px]";
export const CARD_TITLE =
  "font-display text-[0.98rem] font-normal text-brand [text-wrap:balance] md:text-base xl:text-[1.05rem]";
export const CARD_DESC =
  "m-0 text-[0.95rem] leading-[1.5] text-text-body xl:text-base xl:leading-[1.55]";
export const ROW =
  "rounded-[12px] border border-line bg-white px-4 py-3.5 md:rounded-[14px] md:px-[18px] md:py-4";
export const CALLOUT =
  "m-0 flex flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[18px] md:px-[26px] md:py-[22px] xl:rounded-[20px] xl:border-l-[6px] xl:px-[30px] xl:py-[26px]";
export const PILL_FILL =
  "rounded-full bg-accent px-[22px] py-[11px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep md:text-[0.9rem]";
export const PILL_OUTLINE =
  "rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white md:text-[0.9rem]";
export const LINK_ACCENT =
  "self-start text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 md:text-[0.98rem]";
export const CHIP =
  "rounded-full border border-control bg-white px-3.5 py-2 text-[0.88rem] font-bold text-ink no-underline hover:border-accent hover:text-accent";
export const SIDEBAR = "flex flex-col gap-5 md:sticky md:top-[120px] xl:top-[108px] xl:gap-6";
export const GRID =
  "mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]";
export const SECTION =
  "bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16";
export const ARTICLE = "flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]";
