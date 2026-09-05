/* Cache tag grammar (openspec design D1). The rebuild receiver invalidates the
 * three global tags; per-key tags exist for future granular revalidation and
 * mirror the Nuxt payload key grammar (`page:{lang}:{path}`, `post:{lang}:{slug}`, …). */
export const TAG = { content: "content", routes: "routes", site: "site" } as const;

const slugOf = (path: string) => path.replace(/^\/+|\/+$/g, "");

export const siteTag = (lang: string) => `site:${lang}`;
export const frontTag = (lang: string) => `front:${lang}`;
export const pageTag = (lang: string, path: string) => `page:${lang}:${slugOf(path)}`;
export const postTag = (lang: string, slug: string) => `post:${lang}:${slug}`;
export const eventTag = (lang: string, slug: string) => `event:${lang}:${slug}`;
export const postsTag = (lang: string) => `posts:${lang}`;
export const eventsTag = (lang: string) => `events:${lang}`;

/** The global content tag plus the given per-key tags. */
export function tagsFor(...tags: string[]): string[] {
  return [TAG.content, ...tags.filter((t) => t !== TAG.content)];
}
