import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { resolveHref } from "@/lib/links";

/* Every envelope URL is rendered through this component (design D4): app paths
 * become client navigations with prefetch, WordPress-only URLs (ICS feed,
 * uploads, admin) stay full navigations, external URLs get rel="noopener".
 * Server component by default; client islands receive already-resolved hrefs
 * or pass `wpOrigin` themselves. */
export interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** WordPress origin the envelope URLs were minted on (`/site.homeUrl`). */
  wpOrigin: string;
  children: ReactNode;
  /** Disable next/link prefetch for long lists. */
  prefetch?: boolean | null;
}

export function SiteLink({ href, wpOrigin, children, prefetch, rel, ...rest }: SiteLinkProps) {
  const resolved = resolveHref(href, wpOrigin);
  if (resolved.kind === "internal") {
    return (
      <Link href={resolved.href} prefetch={prefetch ?? undefined} rel={rel} {...rest}>
        {children}
      </Link>
    );
  }
  const relValue = resolved.kind === "external" ? [rel, "noopener"].filter(Boolean).join(" ") : rel;
  return (
    <a href={resolved.href} rel={relValue || undefined} {...rest}>
      {children}
    </a>
  );
}
