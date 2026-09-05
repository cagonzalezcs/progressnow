<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from "vue";
import { Menu, X } from "lucide-vue-next";
import { location } from "@/lib/location";
import { menu } from "@/lib/menu";
import { languageState, setLanguages } from "@/lib/languages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useA11ySettings, type TextSize } from "@/composables/useA11ySettings";
import A11yWidget from "@/components/site/A11yWidget.vue";
import WordmarkLockup from "@/components/site/WordmarkLockup.vue";
import LanguageToggle, {
  type LanguageLink,
} from "@/components/site/LanguageToggle.vue";

interface NavLink {
  label: string;
  href: string;
}

const props = withDefaults(
  defineProps<{
    joinUrl?: string;
    joinLabel?: string;
    /** Short CTA label for the mobile bar ("Join"); falls back to joinLabel. */
    joinShortLabel?: string;
    aboutLabel?: string;
    /** Uploaded header logo (Chapter Settings → Identity & brand); '' → wordmark lockup. */
    logoUrl?: string;
    /** True while the shipped default (the lockup) is in use — design D5. */
    logoIsDefault?: boolean;
    /** Chapter name (Chapter Settings → Identity & brand) — lockup text, logo alt, home link label. */
    orgName?: string;
    homeUrl?: string;
    aboutItems?: NavLink[];
    navItems?: NavLink[];
    currentPath?: string;
    /** One entry per site language (Polylang) — drives the header switcher. */
    languages?: LanguageLink[];
  }>(),
  {
    joinUrl: "/get-involved/#join",
    joinLabel: "Join Now",
    joinShortLabel: "",
    aboutLabel: "About",
    logoUrl: "",
    logoIsDefault: true,
    orgName: "Progress Now",
    homeUrl: "/",
    languages: () => [],
    aboutItems: () => [
      { label: "About the Chapter", href: "/about/" },
      { label: "Mission & History", href: "/about/#mission" },
      { label: "Where We Organize", href: "/about/#counties" },
      { label: "Committees", href: "/about/#committees" },
      { label: "Bylaws & Code of Conduct", href: "/about/#bylaws" },
      { label: "FAQ", href: "/about/#faq" },
    ],
    navItems: () => [
      { label: "Calendar", href: "/calendar/" },
      { label: "Blog", href: "/blog/" },
      { label: "Get Involved", href: "/get-involved/" },
    ],
    currentPath: "",
  },
);

/* v4 header (openspec progress-now-v4-foundation-chrome, design D6 + the
 * tablet artboard that landed on the canvas 2026-09-05). Three layout tiers:
 *   ≥ xl   one row — lockup · Bowlby nav (About ▾ dropdown) · white 42px pills
 *          (the single row needs ~1160px; below xl it would wrap the controls)
 *   md→xl  two rows — lockup + 44px pills, then the nav row (tablet artboard)
 *   < md   lockup · Join pill · 44px hamburger → fixed full-viewport panel
 *          (Mobile Menu artboard): uppercase Bowlby nav, Join Now pill, then
 *          EN/ES and the A / A+ / A++ text-size row at the bottom (no HC/RM)
 * views/base.twig renders a static shell with these exact class recipes so the
 * PHP first paint already shows the blue bar (no white→blue cross-fade). */

const showLockup = computed(() => props.logoIsDefault || !props.logoUrl);

// Bowlby One nav links: white on the blue bar, radius-10 translucent-ink hover pill.
const navLinkClass =
  "rounded-[10px] px-3.5 py-2.5 font-display text-[1.06rem] font-normal text-white no-underline hover:bg-[rgba(27,27,34,0.22)]";
const navLinkTabletClass =
  "inline-flex min-h-11 items-center rounded-[10px] px-3 py-[9px] font-display text-[0.98rem] font-normal text-white no-underline hover:bg-[rgba(27,27,34,0.22)]";
const currentClass = "underline decoration-[3px] underline-offset-[6px]";

// White pills: Bowlby One, radius 999, brand text; invert to deep blue on hover.
const pillClass =
  "box-border inline-flex items-center rounded-full bg-white font-display font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white";

const aboutItemClass =
  "rounded-[9px] px-[15px] py-[11px] text-base font-semibold text-ink focus:bg-brand-deep focus:text-white";

// Below md the About ▾ dropdown collapses to a plain About link.
const flatNav = computed<NavLink[]>(() => [
  { label: props.aboutLabel, href: props.aboutItems[0]?.href ?? "/about/" },
  ...props.navItems,
]);

const joinShort = computed(() => props.joinShortLabel || props.joinLabel);

/* ---- mobile panel ---- */
const PANEL_ID = "site-menu-panel";
const toggleRef = ref<HTMLButtonElement | null>(null);

function togglePanel() {
  menu.open = !menu.open;
}

/** Escape (anywhere in the document) closes the open panel and returns focus
 * to the toggle. Registered on `document` so the static <header> carries no
 * handler of its own (a11y lint: non-interactive elements stay inert). */
function onKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape" || !menu.open) return;
  menu.open = false;
  nextTick(() => toggleRef.value?.focus());
}
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));

// A client navigation (ts/navigation.ts) sets html[data-navigating] and closes
// the shared store; watching keeps aria-expanded in step when it does.
const panelOpen = computed(() => menu.open);
watch(panelOpen, (open) => {
  if (typeof document === "undefined") return;
  // The panel is fixed and scrolls on its own — freeze the page behind it.
  document.documentElement.classList.toggle("overflow-hidden", open);
  if (!open) {
    const active = document.activeElement;
    // Focus lost inside the collapsed panel → hand it back to the toggle.
    if (active && document.getElementById(PANEL_ID)?.contains(active)) {
      toggleRef.value?.focus();
    }
  }
});

/* ---- text size (mobile panel) — same store as the desktop Aa widget ---- */
const { settings, setTextSize } = useA11ySettings();
const textSizes: { value: TextSize; label: string }[] = [
  { value: "default", label: "A" },
  { value: "large", label: "A+" },
  { value: "xl", label: "A++" },
];

// Reactive current path so active state updates during client-side navigation
// (the header stays mounted across swaps). Falls back to the SSR prop first paint.
const currentPath = computed(() => location.path || props.currentPath);

// Switcher URLs are the current page's translations. The header stays mounted
// across client navigations, so the mount-time `languages` prop would freeze at
// the entry page's URLs; ts/navigation.ts refreshes the reactive store on every
// commit. Seed it from the SSR prop so the first paint (pre-nav) is correct.
if (!languageState.list.length) setLanguages(props.languages);
const currentLanguages = computed(() =>
  languageState.list.length ? languageState.list : props.languages,
);

/** Normalize to a comparable pathname: strip origin from absolute menu hrefs,
 * drop hash/query, and normalize the trailing slash. */
function normalizePath(href: string): string {
  let path = href;
  try {
    // `window` is absent while the Nuxt rendition prerenders (site/).
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    path = new URL(href, origin).pathname;
  } catch {
    /* relative fragment or malformed — compare as-is */
  }
  return path !== "/" ? path.replace(/\/$/, "") : path;
}

function isCurrent(href: string): boolean {
  if (currentPath.value === "") return false;
  return normalizePath(href) === normalizePath(currentPath.value);
}

// The About ▾ trigger is current when any of its items (ignoring #hash) match.
const isAboutCurrent = computed(() => props.aboutItems.some((item) => isCurrent(item.href)));
</script>

<template>
  <header
    class="site-header sticky top-0 z-100 bg-brand font-sans shadow-header [.admin-bar_&]:top-[var(--wp-admin--admin-bar--height,32px)]"
    data-tone="blue"
  >
    <!-- ============ MOBILE (< md): lockup · Join · hamburger → in-flow panel ============ -->
    <div class="md:hidden">
      <div class="flex min-h-[60px] items-center justify-between gap-3 px-4 py-2">
        <a
          :href="homeUrl"
          :aria-label="`${orgName} home`"
          class="flex min-h-11 min-w-0 flex-1 items-center no-underline"
        >
          <WordmarkLockup v-if="showLockup" :name="orgName" size="mobile" />
          <img v-else :src="logoUrl" :alt="orgName" class="block h-9 w-auto max-w-[200px]" />
        </a>
        <div class="flex flex-none items-center gap-2">
          <a
            :href="joinUrl"
            target="_blank"
            rel="noopener"
            :class="`${pillClass} h-11 px-3.5 text-[0.82rem]`"
          >
            {{ joinShort }}
          </a>
          <button
            ref="toggleRef"
            type="button"
            class="inline-flex size-11 cursor-pointer items-center justify-center rounded-[12px] border-2 border-white/60 bg-transparent text-white hover:bg-[rgba(27,27,34,0.22)]"
            :aria-expanded="panelOpen"
            :aria-controls="PANEL_ID"
            aria-label="Menu"
            @click="togglePanel"
          >
            <X v-if="panelOpen" class="size-6" />
            <Menu v-else class="size-6" />
          </button>
        </div>
      </div>

      <!-- Full-viewport menu (canvas "Progress Now Mobile Menu v4", 2026-09-05):
           fixed under the 60px bar, its own scroll, the nav grows and the
           EN/ES + text-size row sits at the bottom. -->
      <div
        v-show="panelOpen"
        :id="PANEL_ID"
        class="fixed inset-x-0 bottom-0 top-[calc(60px+var(--wp-admin--admin-bar--height,0px))] z-90 flex flex-col overflow-auto border-t border-white/25 bg-brand"
        data-tone="blue"
      >
        <nav aria-label="Main" class="relative flex flex-1 flex-col gap-1 px-4 py-6">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 61.68 70.82" class="absolute right-6 top-[30px] h-auto w-9 rotate-[14deg] text-brand-light"><path fill="currentColor" d="M61.62,30.6l-18.24,9.31,3.72,30.13c-.77.87-14.53-15.43-19.5-20.52l-19.92,21.3,5.64-27.87c-.42-1.74-13.32-8.86-13.32-8.86l18.75-6.92C20.92,23.99,31.04-.65,31.03.01l3.62,27.13c.31.69,28.45,2.78,26.97,3.46Z" /></svg>
          <svg aria-hidden="true" focusable="false" viewBox="0 0 41.72 45.56" class="absolute bottom-10 right-10 h-auto w-[26px] text-brand-light"><polygon fill="currentColor" points="25.85 16.6 41.72 23.74 27.94 27.33 22.78 45.56 15.78 30.31 0 38.44 9.45 22.37 3.27 13.79 14.39 13.86 28.2 0 25.85 16.6" /></svg>
          <a
            v-for="item in flatNav"
            :key="item.label"
            :href="item.href"
            class="relative rounded-[12px] px-3 py-4 font-display text-[1.6rem] font-normal uppercase text-white no-underline hover:bg-[rgba(27,27,34,0.22)]"
            :class="isCurrent(item.href) ? 'bg-[rgba(27,27,34,0.22)]' : ''"
            :aria-current="isCurrent(item.href) ? 'page' : undefined"
          >
            {{ item.label }}
          </a>
          <a
            :href="joinUrl"
            target="_blank"
            rel="noopener"
            class="relative mx-3 mt-6 rounded-full bg-white px-3 py-[15px] text-center font-display text-base font-normal uppercase tracking-[0.04em] text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white"
          >
            {{ joinLabel }}
          </a>
        </nav>
        <div
          class="mt-auto flex items-center justify-between gap-3 border-t border-white/25 px-6 pb-7 pt-[18px]"
        >
          <LanguageToggle :languages="currentLanguages" size="mobile" />
          <div role="group" aria-label="Text size" class="flex items-center gap-2">
            <button
              v-for="s in textSizes"
              :key="s.value"
              type="button"
              class="size-11 cursor-pointer rounded-[10px] border-2 text-[0.9rem] font-bold"
              :class="
                settings.textSize === s.value
                  ? 'border-white bg-white text-brand'
                  : 'border-white/50 bg-transparent text-white'
              "
              :aria-pressed="settings.textSize === s.value"
              @click="setTextSize(s.value)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ TABLET (md → xl): two rows on the same blue ============ -->
    <div class="hidden md:block xl:hidden">
      <div class="flex items-center justify-between gap-4 px-6 pb-2 pt-3">
        <a
          :href="homeUrl"
          :aria-label="`${orgName} home`"
          class="flex min-h-11 min-w-0 flex-1 items-center no-underline"
        >
          <WordmarkLockup v-if="showLockup" :name="orgName" size="tablet" />
          <img v-else :src="logoUrl" :alt="orgName" class="block h-10 w-auto max-w-[240px]" />
        </a>
        <div class="flex flex-none items-center gap-2.5">
          <LanguageToggle :languages="currentLanguages" size="tablet" />
          <A11yWidget size="tablet" />
          <a
            :href="joinUrl"
            target="_blank"
            rel="noopener"
            :class="`${pillClass} h-11 px-5 text-[0.9rem]`"
          >
            {{ joinLabel }}
          </a>
        </div>
      </div>
      <nav aria-label="Main" class="flex flex-wrap items-center gap-1.5 px-4 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            :class="[`cursor-pointer border-0 bg-transparent ${navLinkTabletClass}`, isAboutCurrent ? currentClass : '']"
            :aria-current="isAboutCurrent ? 'page' : undefined"
          >
            {{ aboutLabel }}&nbsp;▾
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            class="z-[200] min-w-[250px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
          >
            <DropdownMenuItem
              v-for="item in aboutItems"
              :key="item.label"
              as-child
              :class="aboutItemClass"
            >
              <a
                :href="item.href"
                class="block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
                >{{ item.label }}</a
              >
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          :class="[navLinkTabletClass, isCurrent(item.href) ? currentClass : '']"
          :aria-current="isCurrent(item.href) ? 'page' : undefined"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>

    <!-- ============ DESKTOP (xl+): single row, About ▾ dropdown, white 42px pills ============ -->
    <div
      class="site-header-desktop mx-auto hidden min-h-[76px] max-w-[82.5rem] flex-wrap items-center justify-between gap-6 px-6 py-[14px] xl:flex"
    >
      <a
        :href="homeUrl"
        :aria-label="`${orgName} home`"
        class="flex min-h-11 flex-none items-center no-underline"
      >
        <WordmarkLockup v-if="showLockup" :name="orgName" size="header" />
        <img v-else :src="logoUrl" :alt="orgName" class="block h-12 w-auto max-w-[240px]" />
      </a>

      <nav aria-label="Main" class="flex flex-wrap items-center gap-[18px]">
        <DropdownMenu>
          <DropdownMenuTrigger
            :class="[`cursor-pointer border-0 bg-transparent ${navLinkClass}`, isAboutCurrent ? currentClass : '']"
            :aria-current="isAboutCurrent ? 'page' : undefined"
          >
            {{ aboutLabel }}&nbsp;▾
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            class="z-[200] min-w-[256px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
          >
            <DropdownMenuItem
              v-for="item in aboutItems"
              :key="item.label"
              as-child
              :class="aboutItemClass"
            >
              <a
                :href="item.href"
                class="block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
                >{{ item.label }}</a
              >
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          :class="[navLinkClass, isCurrent(item.href) ? currentClass : '']"
          :aria-current="isCurrent(item.href) ? 'page' : undefined"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="flex flex-wrap items-center gap-3">
        <LanguageToggle :languages="currentLanguages" />
        <A11yWidget />
        <a
          :href="joinUrl"
          target="_blank"
          rel="noopener"
          :class="`${pillClass} h-[42px] px-[22px] text-[0.95rem]`"
        >
          {{ joinLabel }}
        </a>
      </div>
    </div>
  </header>
</template>
