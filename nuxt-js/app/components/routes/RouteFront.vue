<script setup lang="ts">
import { computed, toRef } from "vue";
import ArrowGlyph from "@/components/routes/ArrowGlyph.vue";
import StarGlyph from "@/components/routes/StarGlyph.vue";
import DuotoneImage from "@/components/site/DuotoneImage.vue";
import { fetchFrontPage } from "@/lib/api";
import { frontKey } from "@/lib/chapter/keys";
import type { ResolvedRoute } from "@/lib/chapter/routes";
import {
  provideRouteLanguages,
  useChapterApi,
  useChapterData,
  useChapterSite,
  useRouteSeo,
} from "@/composables/useChapter";

/* Home — views/front-page.twig ported 1:1 (Progress Now v4, openspec
 * progress-now-v4-home): hero, who-we-are, upcoming events, from-the-blog,
 * closing CTA. Copy, teasers and brand media come from `front:{lang}` +
 * `site:{lang}`; every key is always set (possibly empty) so the empty states
 * own the pre-seed render. Bands carry data-tone for the Aa widget's
 * high-contrast mode. Keep the class literals identical to the Twig. */
const props = defineProps<{ resolved: ResolvedRoute }>();

const lang = computed(() => props.resolved.lang);
const api = useChapterApi();
const { data: site } = await useChapterSite(lang.value);
const { data: front } = await useChapterData(frontKey(lang.value), () => fetchFrontPage(api, lang.value));

provideRouteLanguages(computed(() => front.value?.languages));
useRouteSeo(
  computed(() => front.value?.seo),
  lang,
);

const identity = computed(() => site.value?.identity);
const chapter = computed(() => site.value?.chapter);
const s = computed(() => site.value?.strings ?? {});
const t = (key: string, fallback: string) => s.value[key] ?? fallback;

const calendarUrl = computed(() => front.value?.calendarUrl ?? "/calendar/");
const events = computed(() => (front.value?.events ?? []).slice(0, front.value?.eventCount ?? 5));

const eventsEmptyHtml = computed(() => {
  const link = `<a href="${calendarUrl.value}" class="font-bold text-accent underline underline-offset-4 hover:text-brand-deep">${t("home_events_empty_link", "calendar")}</a>`;
  return t("home_events_empty_p", "New meetings and actions land on the %s first — subscribe there and never miss one.").replace("%s", link);
});

/* Shared class recipes (literals so Tailwind sees them). */
const h2Class = "m-0 font-display text-[1.6rem] font-normal leading-[1.15] md:text-[clamp(2rem,3.6vw,3.1rem)] md:leading-[1.1]";
const arrowLink =
  "flex items-center gap-3.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent no-underline hover:underline hover:underline-offset-4 md:gap-4 md:text-[1.05rem]";
const arrowSvg = "h-[17px] w-[34px] flex-none fill-accent md:h-5 md:w-10";
const stripe = "bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]";
const card =
  "overflow-hidden rounded-[18px] bg-white text-ink no-underline shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card-hover-lg md:rounded-[24px]";
const pill =
  "rounded-full bg-accent font-display font-normal uppercase tracking-[0.04em] text-white no-underline transition-[transform,background-color] hover:-translate-y-px hover:bg-brand-deep";

const hero = toRef(() => front.value?.hero);
const who = toRef(() => front.value?.who);
const cta = toRef(() => front.value?.cta);
const blog = toRef(() => front.value?.blog);
</script>

<template>
  <div v-if="front && identity && chapter && hero && who && cta && blog" class="route-front contents">
    <!-- ============ HERO — photo above the copy on mobile (canvas order), 50/50 row from 700px ============ -->
    <section class="home-hero overflow-hidden bg-brand font-sans text-white" data-tone="blue">
      <div class="mx-auto flex w-full max-w-[1300px] flex-col min-[700px]:flex-row">
        <div class="relative h-[240px] min-w-0 min-[700px]:order-1 min-[700px]:h-auto min-[700px]:min-h-[480px] min-[700px]:w-1/2 min-[700px]:flex-none">
          <DuotoneImage
            :src="identity.hero_photo.src"
            :alt="identity.hero_photo.alt"
            :width="identity.hero_photo.width"
            :height="identity.hero_photo.height"
            :opacity="0.38"
            fetchpriority="high"
            class="absolute inset-0 h-full w-full"
            img-class="block h-full w-full object-cover"
          />
        </div>
        <div class="relative flex min-w-0 flex-col items-center justify-center px-6 pb-12 pt-14 text-center min-[700px]:w-1/2 min-[700px]:flex-none min-[700px]:justify-end min-[700px]:px-8 min-[700px]:pb-[84px] min-[700px]:pt-[88px] lg:pl-12 lg:pr-16">
          <div class="relative flex w-full max-w-[540px] flex-col items-center gap-6 min-[700px]:gap-[34px]">
            <StarGlyph kind="sparkle" class="absolute -top-[30px] left-0 w-[26px] -rotate-10 text-brand-light min-[700px]:-left-6 min-[700px]:-top-11 min-[700px]:w-[34px] lg:-left-12" />
            <StarGlyph kind="star-notch" class="absolute -top-[38px] right-0 w-[38px] rotate-10 text-brand-light min-[700px]:-right-4 min-[700px]:-top-[52px] min-[700px]:w-[52px] lg:-right-10" />
            <StarGlyph kind="star" class="absolute -bottom-4 -right-6 hidden w-[50px] text-brand-light min-[700px]:block lg:-right-12" />

            <h1 class="hero-headline">{{ identity.hero_headline }}</h1>
            <p class="m-0 max-w-[32ch] text-[1.1rem] font-semibold leading-[1.45] [text-wrap:balance] min-[700px]:max-w-[34ch] min-[700px]:text-[1.35rem] min-[700px]:leading-[1.4]">{{ hero.subhead }}</p>
            <a
              :href="hero.cta_primary_url"
              target="_blank"
              rel="noopener"
              class="rounded-full bg-white px-10 py-[15px] font-display text-base font-normal uppercase tracking-[0.04em] text-brand no-underline transition-[transform,background-color,color] hover:-translate-y-px hover:bg-brand-deep hover:text-white min-[700px]:px-11 min-[700px]:py-4 min-[700px]:text-[1.15rem]"
            >
              {{ hero.cta_primary_label }}
            </a>
            <a
              :href="hero.cta_secondary_url"
              class="flex items-center gap-4 rounded-[14px] border-2 border-dashed border-brand-light px-[18px] py-3.5 text-left text-white no-underline transition-colors hover:border-transparent hover:bg-brand-deep min-[700px]:gap-[22px] min-[700px]:rounded-[16px] min-[700px]:px-7 min-[700px]:py-[18px]"
            >
              <span class="max-w-[22ch] text-base font-bold leading-[1.35] min-[700px]:text-[1.25rem]">{{ hero.cta_secondary_label }}</span>
              <ArrowGlyph class="h-[17px] w-[34px] flex-none fill-white min-[700px]:h-[22px] min-[700px]:w-11" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ WHO WE ARE — duotone photo + star, right-aligned copy from md ============ -->
    <section id="about" class="who-we-are bg-white px-6 pb-12 pt-14 font-sans text-ink md:pb-[76px] md:pt-[84px]" data-tone="white">
      <div class="mx-auto flex max-w-[1240px] flex-col gap-5 md:grid md:items-center md:gap-14 md:[grid-template-columns:minmax(320px,1.15fr)_minmax(300px,1fr)]">
        <div class="relative order-3 md:order-first">
          <DuotoneImage
            :src="identity.who_image.src"
            :alt="identity.who_image.alt"
            :width="identity.who_image.width"
            :height="identity.who_image.height"
            :opacity="0.3"
            loading="lazy"
            class="rounded-[18px] md:rounded-[24px]"
            img-class="block h-auto w-full"
          />
          <StarGlyph kind="star" class="absolute -right-4 -top-[22px] hidden w-[52px] text-brand [filter:saturate(1.4)] md:block" />
        </div>
        <div class="contents md:flex md:flex-col md:items-end md:gap-[22px] md:text-right">
          <div class="order-1 text-[0.9rem] font-extrabold uppercase tracking-[0.06em] text-accent md:text-base md:tracking-[0.04em]">{{ who.eyebrow }}</div>
          <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor markup (notranslate spans) -->
          <h2 :class="['order-2', h2Class]" v-html="who.heading" />
          <p class="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">{{ who.p1 }}</p>
          <p class="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]">{{ who.p2 }}</p>
          <!-- eslint-disable-next-line vue/no-v-html -- kses'd editor markup (line breaks) -->
          <p class="order-4 m-0 text-[1.05rem] font-semibold leading-[1.5] md:text-[1.22rem] md:font-bold md:leading-[1.45]" v-html="who.p3" />
          <a :href="who.link_url" :class="['order-5', arrowLink]">
            {{ who.link_label }}
            <ArrowGlyph :class="arrowSvg" />
          </a>
        </div>
      </div>
    </section>

    <!-- ============ UPCOMING EVENTS — alt band, whole-row link cards ============ -->
    <section id="events" class="upcoming-events bg-alt px-6 pb-14 pt-12 font-sans text-ink md:pb-24 md:pt-[76px]" data-tone="alt">
      <div class="mx-auto flex max-w-[1240px] flex-col gap-[22px] md:grid md:items-center md:gap-10 md:[grid-template-columns:1fr_auto]">
        <h2 :class="h2Class">{{ t("home_events_head", "Upcoming events") }}</h2>
        <a :href="calendarUrl" :class="['order-last justify-center', arrowLink, 'md:order-none md:col-start-2 md:row-start-1 md:justify-start']">
          {{ t("home_events_all", "Full calendar") }}
          <ArrowGlyph :class="arrowSvg" />
        </a>
        <div v-if="events.length === 0" class="flex flex-col items-center gap-1 rounded-[20px] border-2 border-dashed border-border-muted px-8 py-16 text-center md:col-span-2 md:row-start-2">
          <div class="text-[1.25rem] font-bold">{{ t("home_events_empty_h", "No events on the books yet") }}</div>
          <!-- eslint-disable-next-line vue/no-v-html -- translated string with a link placeholder -->
          <p class="m-0 max-w-[42ch] text-[1.25rem] font-medium leading-[1.45]" v-html="eventsEmptyHtml" />
        </div>
        <div v-else class="flex flex-col gap-3 md:col-span-2 md:row-start-2">
          <a
            v-for="ev in events"
            :key="`${ev.title}-${ev.when}`"
            :href="ev.url || calendarUrl"
            :aria-label="`${t('home_view_event', 'View event')}: ${ev.title}`"
            class="group grid grid-cols-[60px_1fr] items-center gap-4 rounded-[14px] bg-white p-4 text-ink no-underline shadow-subtle transition-shadow hover:shadow-card md:[grid-template-columns:76px_1fr_auto] md:gap-6 md:rounded-[16px] md:px-[22px] md:py-[18px]"
          >
            <span aria-hidden="true" class="flex flex-col rounded-[10px] bg-brand px-0.5 py-2 text-center text-white md:rounded-[12px] md:px-1 md:py-2.5">
              <span class="text-[1.2rem] font-extrabold leading-[1.1] md:text-[1.4rem]">{{ ev.day }}</span>
              <span class="text-[0.68rem] font-bold tracking-[0.1em] md:text-[0.75rem]">{{ ev.month }}</span>
            </span>
            <span class="flex flex-col gap-[3px] md:gap-1">
              <span class="text-[1.02rem] font-bold leading-[1.3] md:text-[1.18rem]">{{ ev.title }}</span>
              <span class="text-[0.88rem] font-medium text-muted md:text-base">{{ ev.when }}<span class="hidden md:inline"> · {{ ev.where }}</span></span>
            </span>
            <span
              aria-hidden="true"
              class="hidden whitespace-nowrap rounded-full border-2 border-accent px-5 py-[9px] font-display text-[0.88rem] font-normal uppercase tracking-[0.03em] text-accent transition-colors group-hover:bg-accent group-hover:text-white md:inline-block"
            >
              {{ t("home_view_event", "View event") }}
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- ============ FROM THE BLOG — radius-24 cards, blue pills ============ -->
    <section id="blog" class="from-the-blog bg-white px-6 py-14 font-sans text-ink md:pb-24 md:pt-[88px]" data-tone="white">
      <div class="mx-auto flex max-w-[1240px] flex-col gap-[22px] md:gap-11">
        <h2 :class="h2Class">{{ t("home_blog_head", "From the blog") }}</h2>
        <div v-if="blog.featured" class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8 lg:[grid-template-columns:minmax(300px,1.15fr)_minmax(280px,1fr)]">
          <a :href="blog.featured.url" :class="['flex flex-col', card, 'md:col-span-2 lg:col-span-1']">
            <span :class="['relative block aspect-video overflow-hidden', blog.featured.image ? '' : stripe]">
              <DuotoneImage
                v-if="blog.featured.image"
                :src="blog.featured.image.src"
                :alt="blog.featured.image.alt"
                :opacity="0.3"
                loading="lazy"
                class="absolute inset-0 h-full w-full"
                img-class="block h-full w-full object-cover"
              />
              <span class="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-white md:left-3.5 md:top-3.5 md:px-3.5 md:py-[5px] md:text-[0.75rem]">{{ blog.featured.cat_label }}</span>
            </span>
            <span class="flex flex-col gap-2 px-5 pb-[22px] pt-[18px] md:gap-2.5 md:px-7 md:pb-[30px] md:pt-[26px]">
              <span class="text-[0.82rem] font-semibold text-muted md:text-[0.85rem]">{{ blog.featured.date }} · {{ blog.featured.read }}</span>
              <span class="text-[1.1rem] font-extrabold leading-[1.3] [text-wrap:balance] md:text-[clamp(1.2rem,2.2vw,1.45rem)] md:leading-[1.25]">{{ blog.featured.title }}</span>
              <span class="hidden text-base leading-[1.55] text-muted md:block">{{ blog.featured.excerpt }}</span>
              <span class="mt-1 hidden items-center gap-3 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-accent md:flex">
                {{ t("home_blog_read", "Read the post") }}
                <ArrowGlyph class="h-4 w-8 flex-none fill-accent" />
              </span>
            </span>
          </a>
          <div class="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2 md:gap-5 lg:col-span-1 lg:grid-cols-1">
            <a
              v-for="(row, i) in blog.rows"
              :key="row.url + row.title"
              :href="row.url"
              :class="['grid flex-1 grid-cols-[96px_1fr]', card, 'md:[grid-template-columns:130px_1fr]']"
            >
              <DuotoneImage
                v-if="row.image"
                :src="row.image.src"
                :alt="row.image.alt"
                :opacity="0"
                loading="lazy"
                class="min-h-[96px] md:min-h-[130px]"
                img-class="block h-full w-full object-cover"
              />
              <span v-else aria-hidden="true" :class="['min-h-[96px] md:min-h-[130px]', stripe]" />
              <span class="flex flex-col justify-center gap-1.5 px-[18px] py-3.5 md:gap-[9px] md:px-6 md:py-5">
                <span :class="[i % 2 === 0 ? 'border-brand text-brand' : 'border-accent text-accent', 'hidden self-start rounded-full border-2 px-3 py-[3px] text-[0.72rem] font-bold uppercase tracking-[0.06em] md:inline-block']">{{ row.cat_label }}</span>
                <span class="text-[0.98rem] font-bold leading-[1.35] md:text-[1.1rem]">{{ row.title }}</span>
                <span class="text-[0.82rem] font-semibold text-muted md:text-[0.85rem]">{{ row.date }}</span>
              </span>
            </a>
          </div>
        </div>
        <div v-else class="flex flex-col items-center gap-1 rounded-[24px] border-2 border-dashed border-border-muted px-6 py-16 text-center">
          <span class="text-[1.25rem] font-bold">{{ t("home_blog_empty_h", "Posts coming soon") }}</span>
          <span class="max-w-[42ch] text-[1.25rem] font-medium leading-[1.45]">{{ t("home_blog_empty_p", "The chapter is writing its first dispatches — check back shortly.") }}</span>
        </div>
      </div>
    </section>

    <!-- ============ CLOSING CTA — flame band + light band + star panel (design D2) ============ -->
    <section class="closing-cta bg-brand pt-10 font-sans min-[700px]:pt-[72px]" data-tone="blue" :aria-label="t('cta_join', 'Join us')">
      <div aria-hidden="true" class="cta-flames h-[110px] min-[700px]:h-[clamp(120px,17vw,240px)]" />
      <div class="relative -mt-0.5 bg-brand-light px-5 pb-10 pt-2 min-[700px]:px-6 min-[700px]:pb-14 min-[700px]:pt-4">
        <div class="relative mx-auto hidden max-w-[1100px] min-[700px]:block">
          <img
            :src="identity.cta_panel.src"
            :alt="identity.cta_panel.alt"
            :aria-hidden="identity.cta_panel.alt === '' ? 'true' : undefined"
            :width="identity.cta_panel.width"
            :height="identity.cta_panel.height"
            class="block h-auto w-full"
          />
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-[clamp(12px,3vw,40px)] pl-[44%] pr-[5%] text-center">
            <p class="m-0 font-brush text-[clamp(1.8rem,5.4vw,4.8rem)] font-normal uppercase leading-[1.1] text-white [text-wrap:balance]">{{ cta.line }}</p>
            <a :href="chapter.join_url" target="_blank" rel="noopener" :class="[pill, 'px-[2.6em] py-[0.8em] text-[clamp(0.8rem,1.3vw,1.1rem)]']">{{ t("cta_join_now", "Join Now") }}</a>
          </div>
        </div>
        <div class="relative flex flex-col items-center gap-[22px] overflow-hidden rounded-[22px] bg-cta-card px-6 pb-9 pt-8 text-center min-[700px]:hidden">
          <span aria-hidden="true" class="absolute inset-2 rounded-[16px] border-[3px] border-dashed border-yellow opacity-85" />
          <svg aria-hidden="true" focusable="false" viewBox="-210 -200 420 395" class="relative h-auto w-[120px]">
            <path d="M0 -196 L57.6 -60 L204 -51 L88 39 L127 188 L0 105 L-127 188 L-88 39 L-204 -51 L-57.6 -60 Z" fill="#1848D8" stroke="#1B1B22" stroke-width="12" stroke-linejoin="round" />
            <path d="M0 -132 L38 -41 L136 -34 L59 26 L85 126 L0 70 L-85 126 L-59 26 L-136 -34 L-38 -41 Z" fill="#FFFFFF" />
          </svg>
          <p class="relative m-0 font-brush text-[2.1rem] font-normal uppercase leading-[1.1] text-white [text-wrap:balance]">{{ cta.line }}</p>
          <a :href="chapter.join_url" target="_blank" rel="noopener" :class="['relative', pill, 'px-9 py-[13px] text-[0.95rem]']">{{ t("cta_join_now", "Join Now") }}</a>
        </div>
      </div>
    </section>
  </div>
</template>
