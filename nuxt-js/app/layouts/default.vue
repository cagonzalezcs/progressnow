<script setup lang="ts">
import { computed } from "vue";
import SiteHeader from "@/components/site/SiteHeader.vue";
import SiteFooter from "@/components/site/SiteFooter.vue";
import { useChapterLanguages, useChapterSite, useResolvedRoute } from "@/composables/useChapter";
import { setCategories } from "@/lib/events";

/* Site chrome from `site:{lang}` (openspec design D6): header nav, footer
 * columns, identity, strings, categories. Mirrors views/base.twig. */
const resolved = useResolvedRoute();
const lang = computed(() => resolved.value.lang);
const { data: site } = await useChapterSite(lang.value);

if (site.value && site.value.categories.length > 0) setCategories(site.value.categories);

const routeLanguages = useChapterLanguages();
const languages = computed(() =>
  routeLanguages.value.length ? routeLanguages.value : (site.value?.languages ?? []),
);
const strings = computed(() => site.value?.strings ?? {});
const header = computed(() => site.value?.header);
const footer = computed(() => site.value?.footer);
</script>

<template>
  <div class="site-app contents">
    <a
      class="skip-link absolute -left-[9999px] top-3 z-200 rounded-[8px] bg-ink px-[18px] py-2.5 font-sans text-[0.95rem] font-bold text-white no-underline focus:left-4"
      href="#main"
    >
      {{ strings.skip_link ?? "Skip to main content" }}
    </a>

    <!-- `contents` removes the wrapper's box so the sticky <header> sticks
         against the body scroll (base.twig does the same). -->
    <div class="contents">
      <SiteHeader
        v-if="header"
        :key="`header-${lang}`"
        :join-url="header.joinUrl"
        :join-label="header.joinLabel"
        :join-short-label="header.joinShortLabel"
        :about-label="header.aboutLabel"
        :logo-url="header.logoUrl"
        :logo-is-default="header.logoIsDefault"
        :org-name="header.orgName"
        :home-url="header.homeUrl"
        :nav-items="header.navItems ?? undefined"
        :about-items="header.aboutItems ?? undefined"
        :languages="languages"
        :current-path="resolved.path"
      />
    </div>

    <main id="main" class="site-main">
      <slot />
    </main>

    <SiteFooter
      v-if="footer"
      :key="`footer-${lang}`"
      :logo-url="footer.logoUrl"
      :logo-is-default="footer.logoIsDefault"
      :org-name="footer.orgName"
      :columns="footer.columns ?? undefined"
      :socials="footer.socials"
      :contact-email="footer.contactEmail || undefined"
      :tagline="footer.tagline || undefined"
      :a11y-lead="footer.a11yLead"
      :a11y-link-label="footer.a11yLinkLabel"
    />
  </div>
</template>
