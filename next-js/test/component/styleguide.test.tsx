import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { BRAND_TOC, BrandSections } from "@/components/site/styleguide/BrandSections";
import {
  SITE_TOC,
  SiteComponentSections,
} from "@/components/site/styleguide/SiteComponentSections";
import { Toc } from "@/components/site/styleguide/Toc";
import {
  KITCHEN_SINK_COMPONENTS,
  KITCHEN_SINK_TOC,
} from "@/components/site/styleguide/kitchen-sink-toc.generated";

/* openspec next-design-system § Visual parity surface, § shadcn/ui component
 * set: every installed primitive has a kitchen-sink section; the brand and
 * site-component sections render axe-clean with anchored headings the table
 * of contents points at. (The kitchen sink itself renders in the e2e/axe run.) */
describe("styleguide", () => {
  it("covers every installed shadcn/ui component with a kitchen-sink section", () => {
    const installed = readdirSync(resolve(__dirname, "../../components/ui"))
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => f.replace(/\.tsx$/, ""));
    const missing = installed.filter(
      (c) => !KITCHEN_SINK_COMPONENTS.includes(c as (typeof KITCHEN_SINK_COMPONENTS)[number]),
    );
    expect(
      missing,
      `run: npx shadcn add ${missing.map((m) => `@shadcn/${m}-example`).join(" ")} then node scripts/generate-kitchen-sink.mjs`,
    ).toEqual([]);
    const tocIds = KITCHEN_SINK_TOC.flatMap((g) => g.items.map((i) => i.id));
    expect([...tocIds].sort()).toEqual([...KITCHEN_SINK_COMPONENTS].sort());
  });

  it("brand and site sections render, are anchored, and are axe-clean", async () => {
    const { container } = render(
      <A11yProvider>
        <main>
          <h1>Styleguide</h1>
          <Toc
            groups={[
              { title: "Brand", items: BRAND_TOC },
              { title: "Site components", items: SITE_TOC },
            ]}
          />
          <BrandSections />
          <h2>Site components</h2>
          <SiteComponentSections />
        </main>
      </A11yProvider>,
    );
    for (const item of [...BRAND_TOC, ...SITE_TOC]) {
      expect(container.querySelector(`#sg-${item.id}`), item.id).toBeInTheDocument();
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        `#sg-${item.id}`,
      );
    }
    expect(screen.getByRole("navigation", { name: "Styleguide contents" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  }, 20_000);
});
