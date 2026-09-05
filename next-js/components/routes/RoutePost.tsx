import { notFound } from "next/navigation";
import { interiorPaths } from "@/components/routes/RoutePage";
import type { RouteProps } from "@/components/routes/types";
import { SinglePostPage } from "@/components/site/blog/SinglePost";
import { getPost, getPosts, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { pickReadNext } from "@/lib/post";
import { payloadSlug, postsIndexRoute } from "@/lib/routes";
import type { RoutesManifest } from "@/lib/schemas";

/* Single post — Claude Design "Progress Now Blog Post v4" (openspec
 * progress-now-v4-blog D4; twin of views/single.twig). The envelope carries
 * its own `readNext`; when WordPress sends none, the latest posts fill it. */
export function postPaths(manifest: RoutesManifest, lang: string) {
  const find = (kind: string) =>
    manifest.routes.find((r) => r.kind === kind && r.lang === lang)?.path;
  return {
    home: interiorPaths(manifest, lang).home,
    blog: postsIndexRoute(manifest, lang)?.path ?? "/blog/",
    calendar: find("calendar") ?? "/calendar/",
  };
}

export async function RoutePost({ resolved }: RouteProps) {
  const slug = resolved.route ? payloadSlug(resolved.route) : "";
  const [post, site, manifest] = await Promise.all([
    slug ? getPost(slug, resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
  ]);
  if (!post) notFound();
  const readNext = post.readNext.length
    ? post.readNext.slice(0, 3)
    : pickReadNext((await getPosts({ lang: resolved.lang })).posts, { slug, cat: post.cat });
  return (
    <SinglePostPage
      post={post}
      readNext={readNext}
      site={site}
      paths={postPaths(manifest, resolved.lang)}
      wpOrigin={getEnv().WP_ORIGIN}
    />
  );
}
