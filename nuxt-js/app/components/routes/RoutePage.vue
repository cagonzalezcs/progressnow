<script setup lang="ts">
import { computed } from "vue";
import CtaCard from "@/components/site/CtaCard.vue";
import DashedNote from "@/components/site/DashedNote.vue";
import LinkListCard from "@/components/site/LinkListCard.vue";
import PageHeader from "@/components/site/PageHeader.vue";
import SubscribeStrip from "@/components/site/SubscribeStrip.vue";
import { fetchPage } from "@/lib/api";
import { pageKey } from "@/lib/chapter/keys";
import { frontRoute, type ResolvedRoute } from "@/lib/chapter/routes";
import {
  payloadSlug,
  provideRouteLanguages,
  useChapterApi,
  useChapterData,
  useChapterRoutes,
  useChapterSite,
  useRouteSeo,
} from "@/composables/useChapter";

/* Interior page — v4 layout (openspec progress-now-v4-interior-404 D1: header
 * + article + sidebar). Twin of views/page.twig — keep the class literals
 * identical. `content` is the kses'd editor HTML; documents + grievance come
 * from the Interior ACF group (inc/interior.php). The design's fixture prose
 * renders only when the editor content is empty, exactly as the Twig does. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const route = props.resolved.route!;
const uri = payloadSlug(route);
const api = useChapterApi();
const { data: site } = await useChapterSite(lang.value);
const { data: page } = await useChapterData(pageKey(lang.value, uri), () => fetchPage(api, uri, lang.value));

provideRouteLanguages(computed(() => page.value?.languages));
useRouteSeo(
  computed(() => page.value?.seo),
  lang,
);

const routes = useChapterRoutes();
const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
const aboutPath = computed(() => routes.value.routes.find((r) => r.kind === "about" && r.lang === lang.value)?.path ?? "/about/");
const giPath = computed(() => routes.value.routes.find((r) => r.kind === "get_involved" && r.lang === lang.value)?.path ?? "/get-involved/");
const chapter = computed(() => site.value?.chapter);
const s = computed(() => site.value?.strings ?? {});

const lede = computed(
  () =>
    page.value?.lede ||
    (page.value?.content ? "" : "How our chapter governs itself — and how we take care of each other while we do the work."),
);
const documentLinks = computed(() => (page.value?.documents ?? []).map((d) => ({ label: d.title, href: d.url })));
const relatedLinks = computed(() => [
  { label: s.value.about_mission ?? "Mission & History", href: `${aboutPath.value}#mission` },
  { label: s.value.about_committees ?? "Committees", href: `${giPath.value}#committees` },
  { label: s.value.about_faq ?? "FAQ", href: `${aboutPath.value}#faq` },
]);

/* ---- shared interior recipes (same literals as page.twig) ---- */
const h2class =
  "m-0 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
const h2later = "mt-3.5 xl:mt-[18px]";
const prose =
  "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
const callout =
  "m-0 flex flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[18px] md:px-[26px] md:py-[22px] xl:rounded-[20px] xl:border-l-[6px] xl:px-[30px] xl:py-[26px]";
</script>

<template>
  <div v-if="page && chapter" class="route-page contents">
    <PageHeader :title="page.title" :lede="lede" :crumbs="[{ label: s.blog_crumb_home ?? 'Home', href: home }]" />

    <section class="interior-page bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16" data-tone="white">
      <div class="mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]">
        <article :id="`post-${page.id}`" class="post-type-page flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]">
          <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor content -->
          <div v-if="page.content" class="prose-chapter" v-html="page.content" />
          <template v-else>
            <p :class="['m-0', prose]">
              Our chapter is governed by its members. These documents spell out how we make decisions together, how we treat each other, and what to do when something goes wrong. Every member is encouraged to read them &mdash; and every member has the power to propose changes.
            </p>

            <h2 id="conduct" :class="[h2class, h2later]">What we expect of each other</h2>
            <p :class="['m-0', prose]">Organizing only works when everyone can participate safely and fully. Our code of conduct applies to all chapter spaces &mdash; meetings, actions, socials, and online channels. In short:</p>
            <ul class="m-0 flex list-[square] flex-col gap-2.5 pl-6 text-[1.02rem] leading-[1.6] text-text-body marker:text-brand md:text-[1.05rem] xl:text-[1.12rem]">
              <li>Treat fellow members with respect, across every difference.</li>
              <li>Honor pronouns, access needs, and language needs.</li>
              <li>No harassment, intimidation, or discrimination &mdash; full stop.</li>
              <li>Disagree openly and in good faith; debate ideas, not people.</li>
            </ul>
            <h3 class="mx-0 mb-0 mt-2 font-display text-[1.15rem] font-normal leading-[1.2]">Amending these documents</h3>
            <p :class="['m-0', prose]">Any member in good standing may propose an amendment. Proposals are read at a general meeting and voted on at the following one. Reach out to the steering committee if you&rsquo;d like help drafting a proposal.</p>
          </template>

          <!-- Grievance callout (toggle + editable body; email from chapter settings) -->
          <aside v-if="page.grievance.show" id="grievance" :class="['callout-card mt-1.5 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))]', callout]">
            <div class="font-display text-base font-normal text-brand md:text-[1.05rem]">{{ s.page_grievance_h ?? "Need to report something?" }}</div>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor content -->
            <div v-if="page.grievance.body" class="prose-chapter text-base leading-[1.65] text-text-body" v-html="page.grievance.body" />
            <p v-else class="m-0 text-base leading-[1.65] text-text-body">
              Our grievance officers are here for you. Reports are handled confidentially, and you can always bring a support person.
              <template v-if="chapter.contact_email">
                Email <a :href="`mailto:${chapter.contact_email}`" class="notranslate font-bold text-accent underline underline-offset-[3px] hover:text-brand-deep">{{ chapter.contact_email }}</a> or speak to any grievance officer at a meeting.
              </template>
              <template v-else> Speak to any grievance officer at a meeting.</template>
            </p>
          </aside>
        </article>

        <!-- Sidebar: Get involved · Documents · Related · Contact -->
        <aside
          :aria-label="s.chrome_related ?? 'Related'"
          class="flex flex-col gap-5 md:sticky md:top-[calc(120px+var(--wp-admin--admin-bar--height,0px))] xl:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] xl:gap-6"
        >
          <CtaCard
            v-if="page.newhere"
            id="involved"
            :title="page.newhere.heading"
            :body="page.newhere.body"
            :href="page.newhere.url"
            :label="page.newhere.link_label"
            :external="page.newhere.external"
          />

          <LinkListCard v-if="documentLinks.length" id="documents" :heading="s.interior_documents ?? 'Documents'" :links="documentLinks" />

          <LinkListCard :heading="s.chrome_related ?? 'Related'" :links="relatedLinks" />

          <DashedNote v-if="chapter.contact_email" id="contact" :heading="s.interior_contact ?? 'Contact'">
            <p>{{ s.interior_contact_p ?? "Questions, ideas, or press —" }} <a class="notranslate" :href="`mailto:${chapter.contact_email}`">{{ chapter.contact_email }}</a></p>
          </DashedNote>
        </aside>
      </div>
    </section>

    <SubscribeStrip
      :href="chapter.newsletter_url"
      :title="s.interior_subscribe_h ?? 'Never miss an update'"
      :lede="s.interior_subscribe_p ?? 'One email when something new lands — meetings, actions, and posts. No spam, ever.'"
      :label="s.interior_subscribe_cta ?? 'Subscribe'"
    />
  </div>
</template>
