<script setup lang="ts">
import { computed } from "vue";
import CtaCard from "@/components/site/CtaCard.vue";
import DashedNote from "@/components/site/DashedNote.vue";
import DuotoneImage from "@/components/site/DuotoneImage.vue";
import FaqAccordion from "@/components/site/FaqAccordion.vue";
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

/* About page — v4 interior layout (openspec progress-now-v4-interior-404 D1).
 * Twin of views/page-about.twig — keep the class literals identical. Section
 * content is the "About page" ACF group (inc/pages.php), defaulted in PHP to
 * the design copy, so `about.*` is always fully set; the section ids feed the
 * visibility-driven `about.nav`. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const uri = payloadSlug(props.resolved.route!);
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
const chapter = computed(() => site.value?.chapter);
const s = computed(() => site.value?.strings ?? {});
const about = computed(() => page.value?.about);
const lede = computed(
  () =>
    page.value?.lede ||
    `A member-run chapter organizing for working people across ${chapter.value?.region_label ?? "our community"}.`,
);
const navLinks = computed(() => (about.value?.nav ?? []).map((i) => ({ label: i.label, href: i.href })));
const documentLinks = computed(() =>
  (about.value?.governance.docs ?? []).filter((d) => d.url).map((d) => ({ label: d.title, href: d.url })),
);

/* ---- shared interior recipes (mirror the {% set %}s in page-about.twig) ---- */
const h2class =
  "m-0 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
const h2later = "mt-3.5 xl:mt-[18px]";
/* Editor prose (kses'd WYSIWYG): the wrapper owns the typography so wpautop's
 * <p> tags don't nest inside a template <p>. */
const prose =
  "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
const cardGrid =
  "grid gap-3.5 md:grid-cols-2 md:gap-4 xl:gap-5 xl:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";
const card =
  "flex flex-col gap-1.5 rounded-[16px] bg-white px-5 py-[18px] shadow-card md:gap-[7px] md:rounded-[18px] md:px-[22px] md:py-5 xl:gap-2 xl:rounded-[20px] xl:px-6 xl:py-[22px]";
const cardTitle = "font-display text-[0.98rem] font-normal text-brand [text-wrap:balance] md:text-base xl:text-[1.05rem]";
const cardDesc = "m-0 text-[0.95rem] leading-[1.5] text-text-body xl:text-base xl:leading-[1.55]";
const row = "rounded-[12px] border border-line bg-white px-4 py-3.5 md:rounded-[14px] md:px-[18px] md:py-4";
const callout =
  "m-0 flex flex-col gap-2.5 rounded-[16px] border-l-[5px] border-brand bg-alt px-[22px] py-5 md:rounded-[18px] md:px-[26px] md:py-[22px] xl:rounded-[20px] xl:border-l-[6px] xl:px-[30px] xl:py-[26px]";
const pillFill =
  "rounded-full bg-accent px-[22px] py-[11px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:bg-brand-deep md:text-[0.9rem]";
const pillOutline =
  "rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white md:text-[0.9rem]";
const linkAccent = "self-start text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 md:text-[0.98rem]";
const chip = "rounded-full border border-control bg-white px-3.5 py-2 text-[0.88rem] font-bold text-ink no-underline hover:border-accent hover:text-accent";
</script>

<template>
  <div v-if="page && about && chapter" class="route-about contents">
    <PageHeader :title="page.title || 'About the Chapter'" :lede="lede" :crumbs="[{ label: s.blog_crumb_home ?? 'Home', href: home }]" />

    <!-- Mission band -->
    <section v-if="about.mission.visible" id="mission-band" class="bg-ink px-6 py-10 text-white md:px-10 md:py-12 xl:px-6 xl:py-16" data-tone="ink">
      <div class="mx-auto flex max-w-[1140px] flex-col gap-3 md:gap-3.5 xl:gap-[18px]">
        <div class="text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-brand-light md:text-[0.85rem] xl:text-[0.9rem]">{{ about.mission.eyebrow }}</div>
        <p class="m-0 font-display text-[1.25rem] font-normal leading-[1.3] md:max-w-[36ch] md:text-[1.6rem] md:leading-[1.25] xl:max-w-[38ch] xl:text-[clamp(1.5rem,2.8vw,2.3rem)] xl:leading-[1.2]">{{ about.mission.body }}</p>
      </div>
    </section>

    <section class="bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16" data-tone="white">
      <div class="mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]">
        <!-- On-this-page chips above the article on phones; the sidebar card carries the same links from md. -->
        <nav v-if="about.nav.length" :aria-label="s.chrome_on_this_page ?? 'On this page'" class="flex flex-wrap gap-2 md:hidden">
          <a v-for="item in about.nav" :key="item.href" :href="item.href" :class="chip">{{ item.label }}</a>
        </nav>

        <article class="flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]">
          <!-- 1. About the Chapter -->
          <template v-if="about.chapter.visible">
            <h2 id="chapter" :class="h2class">{{ about.chapter.heading }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="about.chapter.p1" />
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="about.chapter.p2" />

            <figure v-if="about.chapter.photo" class="m-0 my-1.5 flex flex-col md:my-2 xl:my-3">
              <DuotoneImage :src="about.chapter.photo.src" :alt="about.chapter.photo.alt" :opacity="0.3" class="rounded-[16px] md:rounded-[18px] xl:rounded-[20px]" img-class="block h-auto w-full" loading="lazy" />
              <figcaption v-if="about.chapter.photo.alt" class="mt-2.5 text-[0.85rem] text-muted md:text-[0.88rem] xl:mt-3 xl:text-[0.9rem]">{{ about.chapter.photo.alt }}</figcaption>
            </figure>

            <div v-if="about.chapter.ctas.length" class="flex flex-wrap gap-3">
              <a
                v-for="(cta, i) in about.chapter.ctas"
                :key="cta.url + cta.label"
                :href="cta.url"
                :target="cta.external ? '_blank' : undefined"
                :rel="cta.external ? 'noopener' : undefined"
                :class="i === 0 ? pillFill : pillOutline"
                >{{ cta.label }}</a
              >
            </div>
          </template>

          <!-- 2. Mission & History -->
          <template v-if="about.history.visible">
            <h2 id="mission" :class="[h2class, h2later]">{{ about.history.heading }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="about.history.body" />
            <ol v-if="about.history.timeline.length" class="m-0 flex list-none flex-col gap-2.5 p-0">
              <li
                v-for="item in about.history.timeline"
                :key="item.year + item.text"
                :class="['grid items-baseline gap-3.5 [grid-template-columns:72px_1fr] md:gap-[18px] md:[grid-template-columns:90px_1fr]', row]"
              >
                <span class="font-display text-[0.95rem] font-normal text-brand md:text-base">{{ item.year }}</span>
                <!-- eslint-disable-next-line vue/no-v-html -- kses'd timeline copy -->
                <span class="text-[0.95rem] leading-[1.55] text-text-body md:text-base" v-html="item.text" />
              </li>
            </ol>
          </template>

          <!-- 3. Where We Organize -->
          <template v-if="about.counties.visible">
            <h2 id="counties" :class="[h2class, h2later]">{{ about.counties.heading }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="about.counties.intro" />
            <div :class="cardGrid">
              <div v-for="c in about.counties.cards" :key="c.name" :class="card">
                <div :class="['notranslate', cardTitle]">{{ c.name }}</div>
                <p v-if="c.cities" :class="['notranslate', cardDesc]">{{ c.cities }}</p>
                <div v-if="c.note" class="mt-0.5 text-[0.82rem] font-bold text-accent">{{ c.note }}</div>
              </div>
            </div>
          </template>

          <!-- 4. Committees (rows edited under Chapter Settings) -->
          <template v-if="about.committees.visible">
            <h2 id="committees" :class="[h2class, h2later]">{{ about.committees.heading }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="about.committees.intro" />
            <div :class="cardGrid">
              <div v-for="committee in chapter.committees" :key="committee.name" :class="card">
                <div :class="cardTitle">{{ committee.name }}</div>
                <p :class="cardDesc">{{ committee.desc }}</p>
              </div>
            </div>
            <a
              v-if="about.committees.link.url"
              :href="about.committees.link.url"
              :target="about.committees.link.external ? '_blank' : undefined"
              :rel="about.committees.link.external ? 'noopener' : undefined"
              :class="linkAccent"
              >{{ about.committees.link.label }} &rarr;</a
            >
          </template>

          <!-- 5. Bylaws & Code of Conduct -->
          <template v-if="about.governance.visible">
            <h2 id="bylaws" :class="[h2class, h2later]">{{ about.governance.heading }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="about.governance.intro" />
            <div class="flex flex-col gap-2.5">
              <div
                v-for="doc in about.governance.docs"
                :key="doc.title"
                :class="['flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5', row]"
              >
                <div class="flex flex-col gap-[3px]">
                  <span class="text-[1.02rem] font-bold md:text-[1.05rem]">{{ doc.title }}</span>
                  <span v-if="doc.covers" class="text-[0.9rem] leading-[1.5] text-muted">{{ doc.covers }}</span>
                </div>
                <a v-if="doc.url" :href="doc.url" :class="['whitespace-nowrap', pillOutline]">{{ doc.action }}</a>
              </div>
            </div>
          </template>

          <!-- 6. FAQ (D2: reka accordion, bordered rows) -->
          <template v-if="about.faq.visible">
            <h2 id="faq" :class="[h2class, h2later]">{{ about.faq.heading }}</h2>
            <FaqAccordion :items="about.faq.rows" />
          </template>

          <!-- Dues callout -->
          <aside v-if="about.dues.visible" id="dues" :class="['mt-1.5', callout]">
            <div class="font-display text-base font-normal text-brand md:text-[1.05rem]">{{ about.dues.heading }}</div>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div class="text-base leading-[1.65] text-text-body [&_p]:m-0 [&_p+p]:mt-3 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px]" v-html="about.dues.body" />
            <a :href="chapter.join_url" target="_blank" rel="noopener" :class="['mt-1 self-start', pillFill]">{{ s.about_dues_cta ?? "Update my dues" }}</a>
          </aside>
        </article>

        <!-- Sidebar: On this page · Get involved · Documents · Contact -->
        <aside
          :aria-label="s.chrome_related ?? 'Related'"
          class="flex flex-col gap-5 md:sticky md:top-[calc(120px+var(--wp-admin--admin-bar--height,0px))] xl:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] xl:gap-6"
        >
          <div v-if="navLinks.length" class="hidden md:contents">
            <LinkListCard :heading="s.chrome_on_this_page ?? 'On this page'" :links="navLinks" />
          </div>

          <CtaCard
            v-if="page.newhere"
            id="involved"
            :title="page.newhere.heading"
            :body="page.newhere.body"
            :href="page.newhere.url"
            :label="page.newhere.link_label"
            :external="page.newhere.external"
          />

          <LinkListCard v-if="about.governance.visible && documentLinks.length" id="documents" :heading="s.interior_documents ?? 'Documents'" :links="documentLinks" />

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
