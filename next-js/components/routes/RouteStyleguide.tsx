import { BRAND_TOC, BrandSections } from "@/components/site/styleguide/BrandSections";
import {
  SITE_TOC,
  SiteComponentSections,
} from "@/components/site/styleguide/SiteComponentSections";
import { Toc } from "@/components/site/styleguide/Toc";
import { KITCHEN_SINK_TOC } from "@/components/site/styleguide/kitchen-sink-toc.generated";
import { KitchenSink } from "@/components/site/styleguide/kitchen-sink.generated";
import { connection } from "next/server";
import { Suspense } from "react";

/* /styleguide/ — the Progress Now v4 kit and the shadcn/ui kitchen sink on the
 * chapter tokens (openspec next-headless-site § Styleguide route;
 * next-design-system § Visual parity surface). Rendered by app/styleguide (its
 * own segment and bundle); the layout's metadata keeps it noindex. */
export function RouteStyleguide({ lang }: { lang: string }) {
  return (
    <main
      id="main"
      data-route-kind="styleguide"
      lang={lang}
      className="styleguide mx-auto max-w-[1100px] px-6 py-16 font-sans text-foreground"
    >
      <header className="mb-12">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">
          Progress Now Design System · v4
        </p>
        <h1 className="font-display text-5xl font-normal uppercase leading-[1.08] text-ink">
          Styleguide
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-text-body">
          Role-named tokens on a white ground: blue bands, Public Sans body, Bowlby One display,
          full-color photo slots. Every value below is a Tailwind utility off{" "}
          <code className="rounded-sm bg-alt px-1.5 py-0.5 text-[0.9em]">src/css/tailwind.css</code>
          . The kitchen sink shows every shadcn/ui component through its canonical registry example,
          on these tokens.
        </p>
      </header>

      <Toc
        groups={[
          { title: "Brand", items: BRAND_TOC },
          { title: "Site components", items: SITE_TOC },
          ...KITCHEN_SINK_TOC,
        ]}
      />

      <BrandSections />

      <h2 className="mb-10 mt-20 font-display text-3xl font-normal uppercase text-ink">
        Site components
      </h2>
      <SiteComponentSections />

      <Suspense
        fallback={
          <p role="status" className="my-16 text-center text-muted">
            Loading the kitchen sink…
          </p>
        }
      >
        <RequestTimeKitchenSink />
      </Suspense>
    </main>
  );
}

/* The registry examples read the clock (calendar, chart) — request-time values
 * Cache Components refuses to bake into a prerender. The brand and site
 * sections above stay in the static shell; the sink streams in per request. */
async function RequestTimeKitchenSink() {
  await connection();
  return <KitchenSink />;
}
