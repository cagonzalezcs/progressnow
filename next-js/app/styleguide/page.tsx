import type { Metadata } from "next";
import "./styleguide.css";
import { RouteStyleguide } from "@/components/routes/RouteStyleguide";

/* /styleguide/ — its own segment so the shadcn kitchen sink is a separate
 * bundle (next-design-system § Client bundle budget). English-only, noindex. */
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: true },
};

export default function StyleguidePage() {
  return <RouteStyleguide lang="en" />;
}
