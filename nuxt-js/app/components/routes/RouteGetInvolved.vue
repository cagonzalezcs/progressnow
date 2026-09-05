<script setup lang="ts">
import { computed } from "vue";
import CtaCard from "@/components/site/CtaCard.vue";
import DashedNote from "@/components/site/DashedNote.vue";
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

/* Get Involved — v4 interior layout (openspec progress-now-v4-interior-404
 * D1: the About skeleton with its own sections). Twin of
 * views/page-get-involved.twig — keep the class literals identical. Section
 * content is the "Get Involved page" ACF group (inc/pages.php), defaulted in
 * PHP to the design copy, so `gi.*` is always fully set. */
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
const gi = computed(() => page.value?.gi);
const lede = computed(
  () =>
    page.value?.lede ||
    "No experience needed, no perfect politics required. If you want a better world, there's a place for you here.",
);
const navLinks = computed(() => (gi.value?.nav ?? []).map((i) => ({ label: i.label, href: i.href })));
const documentLinks = computed(() => (page.value?.documents ?? []).map((d) => ({ label: d.title, href: d.url })));
const relatedLinks = computed(() =>
  (gi.value?.related ?? []).map((l) => ({ label: l.label, href: l.url, external: l.external })),
);

/* ---- shared interior recipes (same literals as page-get-involved.twig) ---- */
const h2class =
  "m-0 scroll-mt-[calc(110px+var(--wp-admin--admin-bar--height,0px))] font-display text-[1.35rem] font-normal leading-[1.2] md:text-[1.6rem] md:leading-[1.15] xl:text-[clamp(1.6rem,2.6vw,2.2rem)] xl:leading-[1.1]";
const h2later = "mt-3.5 xl:mt-[18px]";
const prose =
  "text-[1.02rem] leading-[1.65] text-text-body md:text-[1.05rem] xl:text-[1.12rem] [&_p]:m-0 [&_p+p]:mt-4 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_ul]:my-0 [&_ul]:list-[square] [&_ul]:pl-5 [&_ol]:my-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink";
const proseSm =
  "text-base leading-[1.65] text-text-body [&_p]:m-0 [&_p+p]:mt-3 [&_a]:font-bold [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep [&_strong]:font-extrabold [&_strong]:text-ink";
const cardGrid =
  "grid gap-3.5 md:grid-cols-2 md:gap-4 xl:gap-5 xl:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]";
const card =
  "flex flex-col gap-1.5 rounded-[16px] bg-white px-5 py-[18px] shadow-card md:gap-[7px] md:rounded-[18px] md:px-[22px] md:py-5 xl:gap-2 xl:rounded-[20px] xl:px-6 xl:py-[22px]";
const cardTitle = "font-display text-[0.98rem] font-normal text-brand [text-wrap:balance] md:text-base xl:text-[1.05rem]";
const cardDesc = "m-0 text-[0.95rem] leading-[1.5] text-text-body xl:text-base xl:leading-[1.55]";
const row = "rounded-[12px] border border-line bg-white px-4 py-3.5 md:rounded-[14px] md:px-[18px] md:py-4";
const pillOutline =
  "rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal tracking-[0.04em] text-accent no-underline transition-colors hover:bg-accent hover:text-white md:text-[0.9rem]";
const linkAccent = "self-start text-[0.95rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4 md:text-[0.98rem]";
const chip = "rounded-full border border-control bg-white px-3.5 py-2 text-[0.88rem] font-bold text-ink no-underline hover:border-accent hover:text-accent";
</script>

<template>
  <div v-if="page && gi && chapter" class="route-get-involved contents">
    <PageHeader :title="page.title || 'Get involved'" :lede="lede" :crumbs="[{ label: s.blog_crumb_home ?? 'Home', href: home }]" />

    <section class="bg-white px-6 pb-14 pt-11 md:px-10 md:pb-[72px] md:pt-14 xl:px-6 xl:pb-24 xl:pt-16" data-tone="white">
      <div class="mx-auto grid max-w-[1140px] items-start gap-10 md:gap-9 md:[grid-template-columns:minmax(0,1fr)_260px] xl:gap-14 xl:[grid-template-columns:minmax(300px,1fr)_310px]">
        <nav v-if="gi.nav.length" :aria-label="s.chrome_on_this_page ?? 'On this page'" class="flex flex-wrap gap-2 md:hidden">
          <a v-for="item in gi.nav" :key="item.href" :href="item.href" :class="chip">{{ item.label }}</a>
        </nav>

        <article class="flex min-w-0 flex-col gap-5 md:gap-[22px] xl:gap-[26px]">
          <!-- How to join -->
          <template v-if="gi.join.visible">
            <h2 id="join" :class="h2class">{{ gi.join.heading }}</h2>
            <ol class="m-0 flex list-none flex-col gap-3.5 p-0">
              <li
                v-for="(step, i) in gi.join.steps"
                :key="step.title"
                class="grid grid-cols-[48px_1fr] gap-4 rounded-[16px] bg-white p-5 shadow-card md:grid-cols-[56px_1fr] md:gap-5 md:rounded-[18px] md:p-6 xl:rounded-[20px]"
              >
                <div aria-hidden="true" class="flex size-12 items-center justify-center rounded-[12px] bg-brand font-display text-[1.4rem] font-normal text-white md:size-14 md:text-[1.6rem]">{{ i + 1 }}</div>
                <div class="flex flex-col gap-2">
                  <div class="text-[1.05rem] font-bold md:text-[1.1rem]">{{ step.title }}</div>
                  <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
                  <div :class="proseSm" v-html="step.body" />
                  <a
                    v-if="step.link_label && step.href"
                    :href="step.href"
                    :target="step.external ? '_blank' : undefined"
                    :rel="step.external ? 'noopener' : undefined"
                    :class="linkAccent"
                    >{{ step.link_label }}</a
                  >
                </div>
              </li>
            </ol>
          </template>

          <!-- Committees (cards edited under Chapter Settings) -->
          <template v-if="gi.committees.visible">
            <h2 id="committees" :class="[h2class, h2later]">{{ gi.committees.heading }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor prose -->
            <div :class="prose" v-html="gi.committees.intro" />
            <div :class="cardGrid">
              <div v-for="committee in chapter.committees" :key="committee.name" :class="card">
                <div :class="cardTitle">{{ committee.name }}</div>
                <p :class="cardDesc">{{ committee.desc }}</p>
              </div>
            </div>
          </template>

          <!-- Communication channels -->
          <template v-if="gi.channels.visible">
            <h2 id="channels" :class="[h2class, h2later]">{{ gi.channels.heading }}</h2>
            <div class="flex flex-col gap-2.5">
              <div
                v-for="channel in gi.channels.items"
                :key="channel.label"
                :class="['flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5', row]"
              >
                <div class="flex flex-col gap-[3px]">
                  <!-- eslint-disable-next-line vue/no-v-html -- kses'd channel label -->
                  <span class="text-[1.02rem] font-bold md:text-[1.05rem]" v-html="channel.label" />
                  <span v-if="channel.desc" class="text-[0.9rem] leading-[1.5] text-muted">{{ channel.desc }}</span>
                </div>
                <a
                  v-if="channel.url && channel.link_label"
                  :href="channel.url"
                  :target="channel.external ? '_blank' : undefined"
                  :rel="channel.external ? 'noopener' : undefined"
                  :class="['whitespace-nowrap', pillOutline]"
                  >{{ channel.link_label }}</a
                >
                <span v-else-if="channel.badge" class="rounded-full border border-dashed border-border-muted px-4 py-2 text-[0.8rem] font-bold text-muted">{{ channel.badge }}</span>
              </div>
            </div>
          </template>

          <!-- Common questions (D2) -->
          <template v-if="gi.faq.visible">
            <h2 id="faq" :class="[h2class, h2later]">{{ gi.faq.heading }}</h2>
            <FaqAccordion :items="gi.faq.items" />
          </template>
        </article>

        <!-- Sidebar: On this page · CTA card · Documents · Related · Contact -->
        <aside
          :aria-label="s.chrome_related ?? 'Related'"
          class="flex flex-col gap-5 md:sticky md:top-[calc(120px+var(--wp-admin--admin-bar--height,0px))] xl:top-[calc(108px+var(--wp-admin--admin-bar--height,0px))] xl:gap-6"
        >
          <div v-if="navLinks.length" class="hidden md:contents">
            <LinkListCard :heading="s.chrome_on_this_page ?? 'On this page'" :links="navLinks" />
          </div>

          <CtaCard id="involved" :title="gi.card.heading" :body="gi.card.body" :href="gi.card.url" :label="gi.card.link_label" :external="gi.card.external" />

          <LinkListCard v-if="documentLinks.length" id="documents" :heading="s.interior_documents ?? 'Documents'" :links="documentLinks" />

          <LinkListCard v-if="relatedLinks.length" :heading="s.chrome_related ?? 'Related'" :links="relatedLinks" />

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
