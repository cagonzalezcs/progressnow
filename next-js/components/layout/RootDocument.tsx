import type { ReactNode } from "react";
import { preload } from "react-dom";
import { A11yProvider } from "@/components/a11y/A11yProvider";
import { A11Y_BOOTSTRAP_SCRIPT } from "@/lib/a11y-bootstrap";

/** The two faces every route paints first (design D4/D7); same-origin via the theme static proxy. */
const FONT_PRELOADS = [
  "/wp-content/themes/progressnow/static/fonts/bowlby-one/BowlbyOne-Regular.woff2",
  "/wp-content/themes/progressnow/static/fonts/public-sans/PublicSans[wght].woff2",
];

/* <html>/<body> shared by the site's root layout (app/[[...slug]]) and the
 * styleguide's (app/styleguide — its own segment so the kitchen sink bundle
 * never reaches another route). The a11y bootstrap runs before first paint
 * (so <html> carries the visitor's settings on the first frame) and carries the
 * request's CSP nonce (proxy.ts → lib/request-path `requestNonce`). */
export function RootDocument({
  lang,
  nonce,
  children,
}: {
  lang: string;
  nonce?: string;
  children: ReactNode;
}) {
  for (const href of FONT_PRELOADS)
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    // suppressHydrationWarning: the pre-paint a11y bootstrap legitimately mutates <html>
    // (font-size, data-text-size, data-motion, .a11y-contrast) before React hydrates.
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          // html-sink: static — A11Y_BOOTSTRAP_SCRIPT is a build-time constant, no request data
          dangerouslySetInnerHTML={{ __html: A11Y_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body data-testid="site-body">
        <A11yProvider>{children}</A11yProvider>
      </body>
    </html>
  );
}
