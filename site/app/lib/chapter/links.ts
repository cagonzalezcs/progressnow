/* Internal-link detection for the global click interceptor
 * (plugins/navigation.client.ts). The shared components render plain <a>
 * elements (they are the theme's islands too), so the app decides per click
 * whether a link is a client navigation. Nuxt-free and unit-tested. */

export interface LinkTarget {
  /** Router location: pathname + search + hash. */
  to: string;
  path: string;
  hash: string;
  search: string;
}

export interface AnchorLike {
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  href: string;
  target: string;
}

export function internalLinkTarget(anchor: AnchorLike, origin: string): LinkTarget | null {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return null;
  if (anchor.hasAttribute("download") || anchor.hasAttribute("data-native-nav")) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (/^(mailto|tel|sms|javascript):/i.test(href)) return null;

  let url: URL;
  try {
    url = new URL(anchor.href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  // WordPress admin/API/feeds and the static build's own files are not routes.
  if (/^\/(wp-admin|wp-login\.php|wp-json|wp-content|feed|_nuxt)(\/|$)/.test(url.pathname)) return null;
  if (/\.(pdf|ics|xml|zip|jpe?g|png|gif|svg|webp|mp[34]|json)$/i.test(url.pathname)) return null;

  return {
    to: `${url.pathname}${url.search}${url.hash}`,
    path: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

/** Same document + only the hash differs → let the browser scroll natively. */
export function isSameDocument(target: LinkTarget, current: { path: string; search: string }): boolean {
  const norm = (p: string) => (p !== "/" ? p.replace(/\/$/, "") : p);
  return norm(target.path) === norm(current.path) && target.search === current.search;
}
