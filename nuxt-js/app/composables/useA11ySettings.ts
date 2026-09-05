import { reactive, watchEffect } from "vue";

export type TextSize = "default" | "large" | "xl";

export interface A11ySettings {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = "chapter-a11y";
const STYLE_ID = "progressnow-a11y-css";
const FONT_SIZES: Record<TextSize, string> = {
  default: "16px",
  large: "18px",
  xl: "20px",
};

const DEFAULTS: A11ySettings = {
  textSize: "default",
  highContrast: false,
  reduceMotion: false,
};

// Module-level singleton: several islands (header, calendar, …) share one
// settings object so a change in any widget applies everywhere at once.
let settings: A11ySettings | undefined;

/** False while the Nuxt rendition (nuxt-js/) prerenders — no DOM, no storage. */
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

function load(): A11ySettings {
  if (!isBrowser) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* corrupted storage falls back to defaults */
  }
  return { ...DEFAULTS };
}

function apply(current: A11ySettings): void {
  if (!isBrowser) return;
  document.documentElement.style.fontSize = FONT_SIZES[current.textSize];
  // CSS hook: media-query rem ignores the html font-size, so layout that must
  // react to the text-size choice keys off this attribute (see tailwind.css
  // "A11y text size" block).
  document.documentElement.dataset.textSize = current.textSize;

  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let css = "";
  if (current.reduceMotion || prefersReducedMotion) {
    css +=
      "*{animation:none !important; transition:none !important} html{scroll-behavior:auto !important}";
  }
  if (current.highContrast) {
    // v4 tone vocabulary (design D3): white/alt bands go pure white-on-black,
    // blue bands go the deep swap, ink bands go black-on-white. Values match
    // the `html.a11y-contrast` token swaps in tailwind.css.
    css += '[data-tone="white"],[data-tone="alt"]{background:#FFFFFF !important; color:#000000 !important}';
    css += '[data-tone="blue"]{background:#0F2E9C !important}';
    css += '[data-tone="ink"]{background:#000000 !important; color:#FFFFFF !important}';
    css += "body{background:#FFFFFF}";
  }
  styleEl.textContent = css;

  // Root-class hook for the CSS-variable swaps in tailwind.css
  // (`html.a11y-contrast { --color-brand: … }`) — covers chips, pills, outlines
  // and the duotone overlay that consume the brand tokens without being whole
  // `data-tone` bands.
  document.documentElement.classList.toggle("a11y-contrast", current.highContrast);
}

export function useA11ySettings() {
  if (!settings) {
    settings = reactive(load());
    if (isBrowser) {
      watchEffect(() => {
        apply(settings!);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
          /* storage blocked — settings still apply for the session */
        }
      });
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .addEventListener("change", () => apply(settings!));
    }
  }

  return {
    settings,
    setTextSize: (size: TextSize) => (settings!.textSize = size),
    toggleHighContrast: () => (settings!.highContrast = !settings!.highContrast),
    toggleReduceMotion: () => (settings!.reduceMotion = !settings!.reduceMotion),
  };
}
