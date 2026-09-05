<script setup lang="ts">
import { computed } from "vue";
import { clearError, useHead } from "#imports";
import type { NuxtError } from "#app";
import StarGlyph from "@/components/routes/StarGlyph.vue";

/* Runtime error page (a failed contract, an unreachable API). Route-level
 * 404s render app/components/routes/RouteNotFound.vue instead so the site
 * chrome stays; this only appears when the app itself cannot render, so it
 * has no site payload — strings are the English sources of the inc/i18n.php
 * `nf_*` keys. Same v4 band as views/404.twig (openspec
 * progress-now-v4-interior-404 D3); non-404 errors swap the numeral and copy. */
const props = defineProps<{ error: NuxtError }>();

const status = computed(() => props.error.statusCode ?? 500);
const isNotFound = computed(() => status.value === 404);

useHead({ title: isNotFound.value ? "Page not found" : "Something went wrong", meta: [{ name: "robots", content: "noindex,follow" }] });

function retry() {
  void clearError({ redirect: window.location.pathname });
}

const PILL_WHITE =
  "rounded-full bg-white px-7 py-[13px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white md:px-9 md:py-3.5 md:text-base";
const PILL_OUTLINE =
  "rounded-full border-2 border-white bg-transparent px-[22px] py-[11px] font-display text-[0.9rem] font-normal tracking-[0.04em] text-white no-underline transition-colors hover:border-brand-deep hover:bg-brand-deep md:px-[34px] md:py-3 md:text-base";
</script>

<template>
  <section class="not-found relative flex min-h-[70vh] items-center overflow-hidden bg-brand px-6 pb-24 pt-20 font-sans text-white md:px-10 md:pb-[110px] md:pt-[100px] xl:px-6 xl:pb-[120px] xl:pt-[110px]" data-tone="blue">
    <StarGlyph kind="star" class="absolute left-6 top-9 w-[38px] -rotate-12 text-brand-light md:left-[10%] md:top-[52px] md:w-[46px] xl:left-[12%] xl:top-16 xl:w-[52px]" />
    <StarGlyph kind="sparkle" class="absolute bottom-[60px] left-[34px] w-7 text-brand-light md:bottom-[70px] md:left-[18%] md:w-8 xl:bottom-20 xl:left-[22%] xl:w-9" />
    <StarGlyph kind="star-notch" class="absolute right-[22px] top-[52px] w-11 rotate-[14deg] text-brand-light md:right-[12%] md:top-[76px] md:w-[50px] xl:right-[14%] xl:top-[90px] xl:w-14" />
    <StarGlyph kind="star" class="absolute bottom-12 right-[30px] w-[34px] rotate-[20deg] text-brand-light md:bottom-14 md:right-[8%] md:w-10 xl:bottom-[60px] xl:right-[10%] xl:w-11" />

    <div class="relative mx-auto flex w-full max-w-[720px] flex-col items-center gap-5 text-center md:max-w-[620px] md:gap-6 xl:max-w-[720px] xl:gap-[26px]">
      <div aria-hidden="true" class="headline-shadow-sm font-display text-[5.5rem] leading-none md:text-[7.5rem] xl:text-[clamp(5rem,14vw,10rem)]">{{ status }}</div>
      <h1 class="m-0 max-w-[20ch] font-display text-[1.25rem] font-normal uppercase leading-[1.25] md:max-w-none md:text-[1.6rem] md:leading-[1.2] xl:text-[clamp(1.4rem,2.8vw,2rem)]">
        {{ isNotFound ? "This page got organized out of existence" : "Something went wrong" }}
      </h1>
      <p class="m-0 max-w-[34ch] text-[1.02rem] font-semibold leading-[1.5] md:max-w-[42ch] md:text-[1.12rem] xl:max-w-[44ch] xl:text-[1.2rem]">
        {{ isNotFound ? "The page you’re looking for isn’t here — it may have moved, or the link may be broken." : "We couldn’t load this page. Reloading usually fixes it." }}
      </p>
      <div class="flex flex-wrap justify-center gap-3 md:gap-3.5">
        <a href="/" data-native-nav :class="PILL_WHITE">Back home</a>
        <a v-if="isNotFound" href="/calendar/" data-native-nav :class="PILL_OUTLINE">See the calendar</a>
        <button v-else type="button" :class="['cursor-pointer', PILL_OUTLINE]" @click="retry">Try again</button>
      </div>
    </div>
  </section>
</template>
