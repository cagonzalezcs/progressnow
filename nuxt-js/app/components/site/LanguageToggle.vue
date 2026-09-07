<script setup lang="ts">
// EN/ES language switcher — the v4 white segmented pill (design D6). Under
// Polylang each language is a real URL (English at "/", Spanish at "/es/…"), so
// each segment is an <a> linking to the current page's translation (Polylang
// falls back to the language home when the page has no translation). The active
// language is a brand-blue filled segment marked aria-current; navigating is the
// entire behavior — no cookie, no machine translation. data-native-nav forces a
// full page load: switching language must re-render the whole page server-side.
// The header island lives outside #main and stays mounted across client swaps,
// so its `languages` URLs are refreshed per-navigation via the reactive
// lib/languages store (see ts/navigation.ts + SiteHeader.vue) — otherwise each
// segment's href would freeze at the entry page's translation.
export interface LanguageLink {
  code: string;
  label: string;
  name: string;
  active: boolean;
  url: string;
}

withDefaults(
  defineProps<{
    /** One entry per site language, from the server (see inc/i18n.php). */
    languages?: LanguageLink[];
    /** Group height: desktop 42px · tablet / mobile panel 44px (touch target). */
    size?: "desktop" | "tablet" | "mobile";
  }>(),
  {
    languages: () => [],
    size: "desktop",
  },
);

const HEIGHT = {
  desktop: "h-[42px]",
  tablet: "h-11",
  mobile: "h-11",
} as const;

// v4 segment: Bowlby One 0.8rem, tracked, radius 999; brand fill when active.
// Segments stretch to the group's full height (≥ 44px on touch tiers) and the
// active fill keeps the canvas' 3px white inset via a white border.
// Focus ring for the segments, built in three layers, because a plain outset ring
// cannot work here: the segments self-stretch to the group's full height, so their
// top and bottom edges are flush with the pill and sit directly on the blue band,
// while px-1 leaves only 4px of white either side.
//   outline (ink, offset -3px)  lands exactly on the segment's own 3px border band
//   inset-ring (white, 2px)     separates it from the brand fill inside
//   ring (white, 2px)           separates it from the blue band outside
// Every boundary clears 3:1 (17:1 white/ink, 7.1:1 white/brand) and the
// focused-vs-unfocused change on the border band is 17:1 — including under
// html.a11y-contrast, where ink against the darkened brand would otherwise be
// 1.5:1. The group must NOT be overflow-hidden or the outer ring is clipped away;
// the segments are rounded-full themselves, so nothing needed that clip.
// (WCAG 2.4.7, 2.4.13, 1.4.11)
const segmentClass =
  "box-border inline-flex cursor-pointer items-center self-stretch rounded-full border-[3px] px-[13px] font-display text-[0.8rem] leading-none font-normal tracking-[0.04em] no-underline hover:underline hover:underline-offset-[3px] focus-visible:outline-ink focus-visible:outline-offset-[-3px] focus-visible:inset-ring-2 focus-visible:inset-ring-white focus-visible:ring-2 focus-visible:ring-white";
</script>

<template>
  <div
    v-if="languages.length > 1"
    role="group"
    aria-label="Language"
    :class="[
      'notranslate box-border flex items-center gap-0.5 rounded-full bg-white px-1',
      HEIGHT[size],
    ]"
  >
    <a
      v-for="lang in languages"
      :key="lang.code"
      :href="lang.url"
      data-native-nav
      :lang="lang.code"
      :title="lang.name"
      :aria-current="lang.active ? 'true' : undefined"
      :class="[
        segmentClass,
        lang.active ? 'border-white bg-brand text-white' : 'border-transparent bg-transparent text-brand',
      ]"
    >
      {{ lang.label }}
    </a>
  </div>
</template>
