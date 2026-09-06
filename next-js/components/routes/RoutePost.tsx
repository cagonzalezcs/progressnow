import { notFound } from "next/navigation";
import type { RouteProps } from "@/components/routes/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { SinglePost, type SinglePostLabels } from "@/components/site/blog/SinglePost";
import { getPost, getRoutes, getSite } from "@/lib/data";
import { getEnv } from "@/lib/env";
import { articleNode, canonicalOrigin } from "@/lib/json-ld";
import { frontRoute, payloadSlug } from "@/lib/routes";
import type { RoutesManifest, SiteEnvelope } from "@/lib/schemas";

/* Single post — views/single.twig / RoutePost.vue. SinglePost renders the v4
 * hero through PageHeader's `post` variant; `readNext` is the pool it narrows
 * to same-category latest 3. Sidebar copy comes from the site strings. */
export async function RoutePost({ resolved }: RouteProps) {
  const [post, site, manifest] = await Promise.all([
    resolved.route ? getPost(payloadSlug(resolved.route), resolved.lang) : null,
    getSite(resolved.lang),
    getRoutes(),
  ]);
  if (!post) notFound();
  const paths = postPaths(manifest, resolved.lang);
  const env = getEnv();
  const origins = {
    canonicalOrigin: canonicalOrigin(post.seo, env.NEXT_PUBLIC_SITE_ORIGIN),
    siteOrigin: env.NEXT_PUBLIC_SITE_ORIGIN,
    wpOrigin: env.WP_ORIGIN,
  };
  return (
    <>
      <JsonLd id="ld-article" nodes={[articleNode(post, origins)]} />
      <SinglePost
        post={post}
        posts={post.readNext}
        categories={site.categories}
        showMetaRail={post.showMetaRail}
        blogUrl={paths.blog}
        homeUrl={paths.home}
        calendarUrl={paths.calendar}
        joinUrl={site.chapter.join_url || ""}
        labels={postLabels(site)}
        wpOrigin={env.WP_ORIGIN}
      />
    </>
  );
}

export function postPaths(manifest: RoutesManifest, lang: string) {
  const find = (kind: string) =>
    manifest.routes.find((r) => r.kind === kind && r.lang === lang)?.path;
  return {
    home: frontRoute(manifest, lang)?.path ?? "/",
    blog: find("posts_index") ?? "/blog/",
    calendar: find("calendar") ?? "/calendar/",
  };
}

export function postLabels(site: SiteEnvelope): Partial<SinglePostLabels> {
  const s = site.strings as Record<string, string>;
  const str = (key: string) => s[key] || undefined;
  return {
    joinLabel: site.header.joinLabel || str("cta_join_now"),
    ctaTitle: str("blog_get_involved_h"),
    ctaBody: str("blog_get_involved_p"),
    crumbHome: str("blog_crumb_home"),
    crumbBlog: str("blog_crumb_blog"),
    breadcrumbLabel: str("blog_crumb_label"),
    onThisPageLabel: str("chrome_on_this_page"),
    shareLabel: str("blog_share"),
    copyLabel: str("blog_copy_link"),
    emailLabel: str("blog_email_it"),
    readNextLabel: str("blog_read_next"),
    allPostsLabel: str("home_blog_all"),
  };
}
