<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useHead } from "#imports";
import StarGlyph from "@/components/routes/StarGlyph.vue";
import { frontRoute, type ResolvedRoute } from "@/lib/chapter/routes";
import { refreshChapterRoutes, useChapterRoutes, useChapterSite, useFreshness } from "@/composables/useChapter";

/* 404 — v4 (openspec progress-now-v4-interior-404 D3): one full-bleed blue
 * band with four stars, the giant Bowlby numeral, uppercase h1, lede and two
 * pills. Twin of views/404.twig — keep the class literals identical. Before
 * settling on "not found" the client re-reads the routes manifest from REST
 * once — the path may be content published after the last build (the shell
 * is newer than the bundle). */
const props = defineProps<{ resolved: ResolvedRoute }>();

const routes = useChapterRoutes();
const guard = useFreshness();
const lang = computed(() => props.resolved.lang);
const { data: site } = await useChapterSite(lang.value);
const s = computed(() => site.value?.strings ?? {});

const home = computed(() => frontRoute(routes.value, lang.value)?.path ?? "/");
const calendar = computed(
  () => routes.value.routes.find((r) => r.kind === "calendar" && r.lang === lang.value)?.path ?? "/calendar/",
);

useHead({
  title: s.value.nf_doc_title ?? "Page not found",
  meta: [{ key: "robots", name: "robots", content: "noindex,follow" }],
});

onMounted(() => {
  if (guard.state === "unguarded" && routes.value.routes.length > 0) return;
  void refreshChapterRoutes(props.resolved.path);
});

const PILL_WHITE =
  "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
const PILL_OUTLINE =
  "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
</script>

<template>
  <div class="route-not-found contents">
    <section class="not-found relative overflow-hidden bg-brand px-6 pb-24 pt-20 text-white md:px-10 md:pb-[110px] md:pt-[100px] xl:px-6 xl:pb-[120px] xl:pt-[110px]" data-tone="blue">
      <StarGlyph kind="star" class="absolute left-6 top-9 w-[38px] -rotate-12 text-brand-light md:left-[10%] md:top-[52px] md:w-[46px] xl:left-[12%] xl:top-16 xl:w-[52px]" />
      <StarGlyph kind="sparkle" class="absolute bottom-[60px] left-[34px] w-7 text-brand-light md:bottom-[70px] md:left-[18%] md:w-8 xl:bottom-20 xl:left-[22%] xl:w-9" />
      <StarGlyph kind="star-notch" class="absolute right-[22px] top-[52px] w-11 rotate-[14deg] text-brand-light md:right-[12%] md:top-[76px] md:w-[50px] xl:right-[14%] xl:top-[90px] xl:w-14" />
      <StarGlyph kind="star" class="absolute bottom-12 right-[30px] w-[34px] rotate-[20deg] text-brand-light md:bottom-14 md:right-[8%] md:w-10 xl:bottom-[60px] xl:right-[10%] xl:w-11" />

      <div class="relative mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center md:max-w-[620px] md:gap-6 xl:max-w-[720px] xl:gap-[26px]">
        <div aria-hidden="true" class="headline-shadow-sm font-display text-[5.5rem] leading-none md:text-[7.5rem] xl:text-[clamp(5rem,14vw,10rem)]">404</div>
        <h1 class="m-0 max-w-[20ch] font-display text-[1.25rem] font-normal uppercase leading-[1.25] md:max-w-none md:text-[1.6rem] md:leading-[1.2] xl:text-[clamp(1.4rem,2.8vw,2rem)]">{{ s.nf_title ?? "This page got organized out of existence" }}</h1>
        <p class="m-0 max-w-[34ch] text-[1.02rem] font-semibold leading-[1.5] md:max-w-[42ch] md:text-[1.12rem] xl:max-w-[44ch] xl:text-[1.2rem]">{{ s.nf_lede ?? "The page you’re looking for isn’t here — it may have moved, or the link may be broken." }}</p>
        <div class="flex flex-wrap justify-center gap-3 md:gap-3.5">
          <a :href="home" :class="PILL_WHITE">{{ s.nf_home ?? "Back home" }}</a>
          <a :href="calendar" :class="PILL_OUTLINE">{{ s.nf_calendar ?? "See the calendar" }}</a>
        </div>
      </div>
    </section>
  </div>
</template>
