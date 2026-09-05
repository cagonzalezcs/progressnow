/* Accessibility settings (openspec next-accessibility § Accessibility settings
 * widget parity). Behavior-identical to the theme's useA11ySettings.ts:
 *   localStorage["chapter-a11y"] = { textSize, highContrast, reduceMotion }
 *   one-time migration from "rgv-dsa-a11y"
 *   html { font-size: 16|18|20px }, html[data-text-size], html.a11y-contrast,
 *   an injected <style id="progressnow-a11y-css"> with the tone swaps and the
 *   motion kill (also when prefers-reduced-motion is set), plus
 *   html[data-motion="reduce|auto"] for the app's own gates.
 * Framework-free; the React provider wraps `createA11yStore`. The same
 * `apply` logic is duplicated as a string in lib/a11y-bootstrap.ts so the
 * first paint already carries the visitor's settings (no flash). */

export type TextSize = "default" | "large" | "xl";

export interface A11ySettings {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean;
}

export const STORAGE_KEY = "chapter-a11y";
export const LEGACY_STORAGE_KEY = "rgv-dsa-a11y";
export const STYLE_ID = "progressnow-a11y-css";
export const FONT_SIZES: Record<TextSize, string> = { default: "16px", large: "18px", xl: "20px" };
export const DEFAULTS: A11ySettings = {
  textSize: "default",
  highContrast: false,
  reduceMotion: false,
};

export const MOTION_KILL_CSS =
  "*{animation:none !important; transition:none !important} html{scroll-behavior:auto !important}";
export const CONTRAST_CSS =
  '[data-tone="white"],[data-tone="alt"]{background:#FFFFFF !important; color:#000000 !important}' +
  '[data-tone="blue"]{background:#0F2E9C !important}' +
  '[data-tone="ink"]{background:#000000 !important; color:#FFFFFF !important}' +
  "body{background:#FFFFFF}";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const TEXT_SIZES: TextSize[] = ["default", "large", "xl"];

function sanitize(raw: unknown): A11ySettings {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<
    Record<keyof A11ySettings, unknown>
  >;
  return {
    textSize: TEXT_SIZES.includes(obj.textSize as TextSize)
      ? (obj.textSize as TextSize)
      : DEFAULTS.textSize,
    highContrast: typeof obj.highContrast === "boolean" ? obj.highContrast : DEFAULTS.highContrast,
    reduceMotion: typeof obj.reduceMotion === "boolean" ? obj.reduceMotion : DEFAULTS.reduceMotion,
  };
}

export function loadSettings(storage: StorageLike | undefined): A11ySettings {
  if (!storage) return { ...DEFAULTS };
  try {
    let raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = storage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        storage.setItem(STORAGE_KEY, legacy);
        storage.removeItem(LEGACY_STORAGE_KEY);
        raw = legacy;
      }
    }
    if (raw) return sanitize(JSON.parse(raw));
  } catch {
    /* corrupted or blocked storage falls back to defaults */
  }
  return { ...DEFAULTS };
}

export function applySettings(
  current: A11ySettings,
  { prefersReducedMotion, doc = document }: { prefersReducedMotion: boolean; doc?: Document },
): void {
  const html = doc.documentElement;
  html.style.fontSize = FONT_SIZES[current.textSize];
  html.dataset.textSize = current.textSize;
  const reduce = current.reduceMotion || prefersReducedMotion;
  html.dataset.motion = reduce ? "reduce" : "auto";

  let styleEl = doc.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = STYLE_ID;
    doc.head.appendChild(styleEl);
  }
  styleEl.textContent =
    (reduce ? MOTION_KILL_CSS : "") + (current.highContrast ? CONTRAST_CSS : "");
  html.classList.toggle("a11y-contrast", current.highContrast);
}

export interface A11yStore {
  getSnapshot(): A11ySettings;
  subscribe(listener: () => void): () => void;
  setTextSize(size: TextSize): void;
  toggleHighContrast(): void;
  toggleReduceMotion(): void;
  /** Re-apply (e.g. when prefers-reduced-motion changes). */
  refresh(): void;
}

export function createA11yStore({
  storage,
  prefersReducedMotion,
  doc,
}: {
  storage: StorageLike | undefined;
  prefersReducedMotion: () => boolean;
  doc?: Document;
}): A11yStore {
  let settings = loadSettings(storage);
  const listeners = new Set<() => void>();

  const commit = (next: A11ySettings) => {
    settings = next;
    applySettings(settings, { prefersReducedMotion: prefersReducedMotion(), doc });
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage blocked — settings still apply for the session */
    }
    for (const l of listeners) l();
  };

  return {
    getSnapshot: () => settings,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setTextSize: (textSize) => commit({ ...settings, textSize }),
    toggleHighContrast: () => commit({ ...settings, highContrast: !settings.highContrast }),
    toggleReduceMotion: () => commit({ ...settings, reduceMotion: !settings.reduceMotion }),
    refresh: () => applySettings(settings, { prefersReducedMotion: prefersReducedMotion(), doc }),
  };
}
