import type { Metadata } from "next";
import "../globals.css";
import "./styleguide.css";
import { RootDocument } from "@/components/layout/RootDocument";

/* Second root layout: /styleguide/ is its own segment so the shadcn kitchen
 * sink is a separate bundle (next-design-system § Client bundle budget).
 * Dev-facing and English-only; never indexed. */
export const metadata: Metadata = {
  title: "Styleguide – Progress Now",
  robots: { index: false, follow: true },
};

export default function StyleguideLayout({ children }: LayoutProps<"/styleguide">) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
