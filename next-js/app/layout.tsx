import type { Metadata } from "next";
import "./globals.css";

/* Placeholder root layout — replaced in task 3.5 (manifest-driven `lang`,
 * `/site` chrome, nonce). Fonts are the theme's self-hosted faces declared in
 * globals.css (design D4/D7); no next/font. */
export const metadata: Metadata = {
  title: "Progress Now",
  description: "Progress Now — headless Next.js frontend",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
