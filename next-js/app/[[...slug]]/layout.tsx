import type { Metadata } from "next";
import { slug } from "next/root-params";
import "../globals.css";
import { getRoutes } from "@/lib/data";
import { langForPath, pathFromSegments } from "@/lib/routes";

/* Root layout lives inside the optional catch-all so the path is a root
 * parameter (`next/root-params`) and `<html lang>` can follow Polylang's URL
 * structure (design D3). Chrome (header/footer/skip link) lands in group 5. */
export const metadata: Metadata = {
  title: { default: "Progress Now", template: "%s – Progress Now" },
};

export default async function RootLayout({ children }: LayoutProps<"/[[...slug]]">) {
  const manifest = await getRoutes();
  const lang = langForPath(manifest, pathFromSegments(await slug())) || "en";
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
