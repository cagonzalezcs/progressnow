import type { ReactNode } from "react";
import { FocusManager } from "@/components/nav/FocusManager";
import { RouteTransition } from "@/components/nav/RouteTransition";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";
import type { LanguageLink } from "@/lib/contracts";
import type { SiteEnvelope } from "@/lib/schemas";

/* Site chrome from `/site?lang=` (design D6): skip link, header, the route's
 * <main> (rendered by the route component, cross-faded by RouteTransition),
 * footer. Shared by the site root layout and the styleguide layout. */
export function SiteShell({
  site,
  languages,
  wpOrigin,
  children,
}: {
  site: SiteEnvelope;
  languages: LanguageLink[];
  wpOrigin: string;
  children: ReactNode;
}) {
  const strings = site.strings as Record<string, string>;
  return (
    <div className="site-app contents">
      <SkipLink label={strings.skip_link ?? "Skip to main content"} />
      <div className="contents">
        <SiteHeader header={site.header} languages={languages} wpOrigin={wpOrigin} />
      </div>
      {/* One persistent <main>: Cache Components keeps the previous route mounted (hidden) during
          navigation, so route components render a div[data-route-kind] inside it — never their own main. */}
      <main id="main" tabIndex={-1} className="site-main">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <SiteFooter footer={site.footer} wpOrigin={wpOrigin} />
      <FocusManager />
    </div>
  );
}
