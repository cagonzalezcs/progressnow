/* Payload-key grammar shared with inc/payloads.php (`progressnow_payload_key`)
 * and the PHP shell's `__SHELL_DATA__.data`:
 *
 *   site:{lang} | routes | front:{lang} | page:{lang}:{path}
 *   post:{lang}:{slug} | event:{lang}:{slug} | posts:{lang}
 *
 * `posts:{lang}` is the app's own key for the posts page's first browse page
 * (`GET /posts?lang=`); the shell embeds it on the posts index so the landing
 * render needs no request. */

export function siteKey(lang: string): string {
  return `site:${lang}`;
}

export const ROUTES_KEY = "routes";

export function frontKey(lang: string): string {
  return `front:${lang}`;
}

export function pageKey(lang: string, path: string): string {
  return `page:${lang}:${trimSlashes(path)}`;
}

export function postKey(lang: string, slug: string): string {
  return `post:${lang}:${trimSlashes(slug)}`;
}

export function eventKey(lang: string, slug: string): string {
  return `event:${lang}:${trimSlashes(slug)}`;
}

/** `posts:{lang}` for the first browse page; `posts:{lang}:{page}:{category}`
 * for any other browse state (mirrors inc/payloads.php
 * progressnow_payload_posts_key()). */
export function postsKey(lang: string, page = 1, category = ""): string {
  const p = Math.max(1, page);
  if (p === 1 && category === "") return `posts:${lang}`;
  return `posts:${lang}:${p}:${category}`;
}

export function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}
