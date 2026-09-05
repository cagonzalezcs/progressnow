"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createA11yStore,
  DEFAULTS,
  type A11ySettings,
  type A11yStore,
  type TextSize,
} from "@/lib/a11y-settings";

/* React face of lib/a11y-settings.ts (openspec next-accessibility). One store
 * per document; the header widget and any other consumer share it. The
 * bootstrap script has already applied the stored settings before hydration,
 * so the first client render only re-applies the same values. */
interface A11yContextValue {
  settings: A11ySettings;
  setTextSize: (size: TextSize) => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  /** Effective motion preference: setting OR prefers-reduced-motion. */
  reduceMotion: boolean;
}

const A11yContext = createContext<A11yContextValue | null>(null);

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

/** matchMedia is absent in some test/embedded environments; treat that as "no preference". */
function media(): MediaQueryList | null {
  return isBrowser && typeof window.matchMedia === "function"
    ? window.matchMedia(REDUCE_QUERY)
    : null;
}

let singleton: A11yStore | undefined;
function store(): A11yStore {
  if (!singleton) {
    singleton = createA11yStore({
      storage: isBrowser ? window.localStorage : undefined,
      prefersReducedMotion: () => media()?.matches ?? false,
    });
  }
  return singleton;
}

const serverSnapshot = () => DEFAULTS;

export function A11yProvider({ children }: { children: ReactNode }) {
  const s = isBrowser ? store() : null;
  const settings = useSyncExternalStore(
    (listener) => (s ? s.subscribe(listener) : () => {}),
    () => (s ? s.getSnapshot() : DEFAULTS),
    serverSnapshot,
  );
  const prefersReduced = useSyncExternalStore(
    (listener) => {
      const mq = media();
      if (!mq) return () => {};
      const handler = () => {
        s?.refresh();
        listener();
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    },
    () => media()?.matches ?? false,
    () => false,
  );

  useEffect(() => {
    s?.refresh();
  }, [s]);

  const value = useMemo<A11yContextValue>(
    () => ({
      settings,
      setTextSize: (size) => s?.setTextSize(size),
      toggleHighContrast: () => s?.toggleHighContrast(),
      toggleReduceMotion: () => s?.toggleReduceMotion(),
      reduceMotion: settings.reduceMotion || prefersReduced,
    }),
    [settings, prefersReduced, s],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used inside <A11yProvider>");
  return ctx;
}

/** Effective motion preference (setting OR media query); safe outside the provider (defaults to false). */
export function useReducedMotion(): boolean {
  return useContext(A11yContext)?.reduceMotion ?? false;
}
