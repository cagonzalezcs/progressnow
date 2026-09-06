import type { BlogPost, PostBlock, SinglePostData } from "@/lib/schemas";

/* Pure single-post helpers (twin of the computed values in the Nuxt
 * SinglePost.vue) so the server component stays declarative and the rules are
 * unit-testable without a DOM. */

const H2 = /<h2(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h2>/gi;

/** "On this page": the prose blocks' h2 anchors. Ids are injected at serialize
 * time (inc/blog.php); a slug fallback covers fixtures/mock content. */
export function postAnchors(blocks: PostBlock[]): { label: string; href: string }[] {
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

/** Read next: same category first, latest 3, featured excluded (the envelope's
 * `readNext` pool already omits the current post), padded with other recent
 * posts when the category has fewer than 3. */
export function readNextPosts(post: Pick<SinglePostData, "cat">, pool: BlogPost[]) {
  const rest = pool.filter((p) => !p.featured);
  const sameCat = rest.filter((p) => p.cat === post.cat);
  const others = rest.filter((p) => p.cat !== post.cat);
  return [...sameCat, ...others].slice(0, 3);
}

export function bylineName(post: SinglePostData, mode = post.bylineMode): string {
  const named = mode !== "committee";
  const name = named ? post.author : post.committee;
  return name ? (named ? name : `The ${name}`) : "";
}

/** Two-letter initials for the byline avatar ("Lorem Ipsum" → "LI"). */
export function bylineInitials(post: SinglePostData, mode = post.bylineMode): string {
  const source = mode !== "committee" ? post.author : post.committee;
  return source
    .split(/\s+/)
    .filter((w) => w && w !== "Committee")
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}
