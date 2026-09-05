import type { BlogPost, PostBlock, SinglePostData } from "@/lib/schemas";

/* Single-post view helpers (openspec progress-now-v4-blog D4; twin of the
 * computeds in SinglePost.vue). Framework-free so the server route and the
 * unit tests share them. */

/** Byline name: the author, or "The {committee}" in committee mode. */
export function authorName(post: Pick<SinglePostData, "bylineMode" | "author" | "committee">) {
  const named = post.bylineMode !== "committee";
  const name = named ? post.author : post.committee;
  return name ? (named ? name : `The ${name}`) : "";
}

/** Two-letter initials for the byline avatar ("Lorem Ipsum" → "LI"). */
export function initials(post: Pick<SinglePostData, "bylineMode" | "author" | "committee">) {
  const source = post.bylineMode !== "committee" ? post.author : post.committee;
  return source
    .split(/\s+/)
    .filter((w) => w && w !== "Committee")
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

/* "On this page": the prose blocks' h2 anchors (ids are injected at serialize
 * time — inc/blog.php; a slug fallback covers fixtures/mock content). */
const H2 = /<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/gi;

export function proseAnchors(blocks: PostBlock[]): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = [];
  for (const block of blocks) {
    if (block.type !== "prose") continue;
    for (const m of block.html.matchAll(H2)) {
      const label = m[2]!.replace(/<[^>]+>/g, "").trim();
      const id =
        m[1] ||
        label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      if (label && id) out.push({ label, href: `#${id}` });
    }
  }
  return out;
}

/* Read next: same category first, then other recent posts, never the current
 * post, three at most. Used when the envelope's own `readNext` is empty. */
export function pickReadNext(pool: BlogPost[], current: { slug: string; cat: string }) {
  const rest = pool.filter((p) => p.slug !== current.slug);
  const sameCat = rest.filter((p) => p.cat === current.cat);
  const others = rest.filter((p) => p.cat !== current.cat);
  return [...sameCat, ...others].slice(0, 3);
}

/** Prose h2 without an id gets the same slug the anchor list points at. */
export function ensureHeadingIds(html: string): string {
  return html.replace(/<h2(?![^>]*\sid=)([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
    const id = inner
      .replace(/<[^>]+>/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return id ? `<h2 id="${id}"${attrs}>${inner}</h2>` : `<h2${attrs}>${inner}</h2>`;
  });
}
