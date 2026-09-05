<script setup lang="ts">
import { computed } from "vue";
import SinglePost from "@/components/site/blog/SinglePost.vue";
import { fetchSinglePost } from "@/lib/api";
import { postKey } from "@/lib/chapter/keys";
import { frontRoute, postsIndexRoute, type ResolvedRoute } from "@/lib/chapter/routes";
import {
  payloadSlug,
  provideRouteLanguages,
  useChapterApi,
  useChapterData,
  useChapterRoutes,
  useChapterSite,
  useRouteSeo,
} from "@/composables/useChapter";

/* Single post — views/single.twig. SinglePost renders the v4 hero through
 * PageHeader's `post` variant; `readNext` is the pool it narrows to
 * same-category latest 3. Sidebar copy comes from the site strings. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const slug = payloadSlug(props.resolved.route!);
const api = useChapterApi();
const { data: site } = await useChapterSite(lang.value);
const { data: post } = await useChapterData(postKey(lang.value, slug), () => fetchSinglePost(api, slug, lang.value));

provideRouteLanguages(computed(() => post.value?.languages));
useRouteSeo(
  computed(() => post.value?.seo),
  lang,
);

const routes = useChapterRoutes();
const homeUrl = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
const blogUrl = computed(() => postsIndexRoute(routes.value, lang.value)?.path ?? "/blog/");

const str = (key: string, fallback: string) => site.value?.strings[key] || fallback;
const labels = computed(() => ({
  joinLabel: site.value?.header.joinLabel || str("cta_join_now", "Join Now"),
  ctaTitle: str("blog_get_involved_h", "Get involved"),
  ctaBody: str("blog_get_involved_p", "Meetings, actions and committees are open to everyone. Come find your place in the work."),
  crumbHome: str("blog_crumb_home", "Home"),
  crumbBlog: str("blog_crumb_blog", "Blog"),
  onThisPageLabel: str("chrome_on_this_page", "On this page"),
  shareLabel: str("blog_share", "Share"),
  copyLabel: str("blog_copy_link", "Copy link"),
  emailLabel: str("blog_email_it", "Email it"),
  readNextLabel: str("blog_read_next", "Read next"),
  allPostsLabel: str("home_blog_all", "All posts"),
}));
</script>

<template>
  <SinglePost
    v-if="post"
    :post="post"
    :posts="post.readNext"
    :categories="site?.categories"
    :show-meta-rail="post.showMetaRail"
    :blog-url="blogUrl"
    :home-url="homeUrl"
    :join-url="site?.chapter.join_url || ''"
    v-bind="labels"
  />
</template>
