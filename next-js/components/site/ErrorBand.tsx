import type { ReactNode } from "react";
import { StarGlyph } from "@/components/site/StarGlyph";

/* The v4 error band (openspec progress-now-v4-interior-404 D3; twin of
 * views/404.twig and the Nuxt error.vue): one full-bleed blue band with four
 * decorative stars, the giant Bowlby numeral, an uppercase h1, a lede and two
 * pills. Presentational and framework-free so the 404 route (server, site
 * strings), the segment error boundary and the global error boundary (client,
 * English sources of the same strings) all render the identical surface. */
export const ERROR_PILL_WHITE =
  "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
export const ERROR_PILL_OUTLINE =
  "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";

export function ErrorBand({
  numeral,
  title,
  lede,
  actions,
  kind,
}: {
  /** "404" / "500" — decorative; the h1 carries the meaning */
  numeral: string;
  title: string;
  lede: string;
  actions: ReactNode;
  /** data-route-kind for tests and the focus manager */
  kind: "not_found" | "error";
}) {
  return (
    <section
      className="not-found relative flex min-h-[70vh] items-center overflow-hidden bg-brand px-6 pb-24 pt-20 font-sans text-white md:px-10 md:pb-[110px] md:pt-[100px] xl:px-6 xl:pb-[120px] xl:pt-[110px]"
      data-tone="blue"
      data-route-kind={kind}
      data-testid="error-band"
      data-error-kind={kind}
    >
      <StarGlyph
        kind="star"
        className="absolute left-6 top-9 w-[38px] -rotate-12 text-brand-light md:left-[10%] md:top-[52px] md:w-[46px] xl:left-[12%] xl:top-16 xl:w-[52px]"
      />
      <StarGlyph
        kind="sparkle"
        className="absolute bottom-[60px] left-[34px] w-7 text-brand-light md:bottom-[70px] md:left-[18%] md:w-8 xl:bottom-20 xl:left-[22%] xl:w-9"
      />
      <StarGlyph
        kind="star-notch"
        className="absolute right-[22px] top-[52px] w-11 rotate-[14deg] text-brand-light md:right-[12%] md:top-[76px] md:w-[50px] xl:right-[14%] xl:top-[90px] xl:w-14"
      />
      <StarGlyph
        kind="star"
        className="absolute bottom-12 right-[30px] w-[34px] rotate-[20deg] text-brand-light md:bottom-14 md:right-[8%] md:w-10 xl:bottom-[60px] xl:right-[10%] xl:w-11"
      />
      <div className="relative mx-auto flex w-full max-w-[720px] flex-col items-center gap-5 text-center md:max-w-[620px] md:gap-6 xl:max-w-[720px] xl:gap-[26px]">
        <div
          aria-hidden="true"
          className="headline-shadow-sm font-display text-[5.5rem] leading-none md:text-[7.5rem] xl:text-[clamp(5rem,14vw,10rem)]"
          data-testid="error-band-numeral"
        >
          {numeral}
        </div>
        <h1
          className="m-0 max-w-[20ch] font-display text-[1.25rem] font-normal uppercase leading-[1.25] md:max-w-none md:text-[1.6rem] md:leading-[1.2] xl:text-[clamp(1.4rem,2.8vw,2rem)]"
          data-testid="error-band-title"
        >
          {title}
        </h1>
        <p
          className="m-0 max-w-[34ch] text-[1.02rem] font-semibold leading-[1.5] md:max-w-[42ch] md:text-[1.12rem] xl:max-w-[44ch] xl:text-[1.2rem]"
          data-testid="error-band-lede"
        >
          {lede}
        </p>
        <div
          className="flex flex-wrap justify-center gap-3 md:gap-3.5"
          data-testid="error-band-actions"
        >
          {actions}
        </div>
      </div>
    </section>
  );
}
