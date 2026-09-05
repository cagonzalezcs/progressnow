"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useA11y } from "@/components/a11y/A11yProvider";
import type { TextSize } from "@/lib/a11y-settings";
import { cn } from "@/lib/utils";

/* v4 "Aa" accessibility widget (design D6): a white pill trigger on the blue
 * header (desktop + tablet) and a white radius-14 popover with the segmented
 * text-size control plus the High contrast / Reduce motion On-Off pills. Port
 * of the Vue A11yWidget; state lives in the shared A11yProvider store so the
 * mobile A / A+ / A++ row and this popover always agree. Every control is a
 * real <button> with aria-pressed; changes are announced via role="status". */
export interface A11yWidgetProps {
  /** Trigger height: desktop 42px · tablet 44px (touch target). */
  size?: "desktop" | "tablet";
  /** Copy from `/site.strings` (falls back to English). */
  labels?: Partial<A11yWidgetLabels>;
}

export interface A11yWidgetLabels {
  trigger: string;
  heading: string;
  textSize: string;
  highContrast: string;
  reduceMotion: string;
  on: string;
  off: string;
}

const DEFAULT_LABELS: A11yWidgetLabels = {
  trigger: "Accessibility options",
  heading: "Accessibility",
  textSize: "Text size",
  highContrast: "High contrast",
  reduceMotion: "Reduce motion",
  on: "On",
  off: "Off",
};

const SIZES: { value: TextSize; label: string }[] = [
  { value: "default", label: "A" },
  { value: "large", label: "A+" },
  { value: "xl", label: "A++" },
];

const TRIGGER = {
  desktop: "h-[42px] px-[18px] text-[0.95rem]",
  tablet: "h-11 px-4 text-[0.9rem]",
} as const;

const ROW =
  "flex cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-0 text-left text-[0.9rem] font-bold text-ink";

function pillClass(on: boolean): string {
  return cn(
    "rounded-full border px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em]",
    on ? "border-brand bg-brand text-white" : "border-control bg-transparent text-muted",
  );
}

export function A11yWidget({ size = "desktop", labels }: A11yWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const { settings, setTextSize, toggleHighContrast, toggleReduceMotion } = useA11y();
  const status = `${t.textSize}: ${SIZES.find((s) => s.value === settings.textSize)?.label}. ${t.highContrast}: ${settings.highContrast ? t.on : t.off}. ${t.reduceMotion}: ${settings.reduceMotion ? t.on : t.off}.`;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "a11y-widget box-border inline-flex cursor-pointer items-center rounded-full border-0 bg-white font-display font-normal text-brand transition-colors hover:bg-brand-deep hover:text-white",
          TRIGGER[size],
        )}
        aria-label={t.trigger}
        title={t.trigger}
      >
        Aa
      </PopoverTrigger>
      {/* Radix gives the content role="dialog"; name it after the heading (axe aria-dialog-name). */}
      <PopoverContent
        align="end"
        aria-labelledby="a11y-widget-heading"
        className="z-[200] w-[280px] rounded-[14px] border-0 bg-white p-[18px] font-sans text-ink shadow-popover"
      >
        <div className="flex flex-col gap-4">
          <div id="a11y-widget-heading" className="text-base font-bold">
            {t.heading}
          </div>

          <div className="flex flex-col gap-2">
            <div id="a11y-text-size-label" className="text-[0.9rem] font-bold">
              {t.textSize}
            </div>
            <div className="flex gap-1.5" role="group" aria-labelledby="a11y-text-size-label">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={cn(
                    "flex-1 cursor-pointer rounded-[8px] border py-2 text-[0.95rem] font-bold",
                    settings.textSize === s.value
                      ? "border-ink bg-ink text-white"
                      : "border-control bg-white text-ink hover:bg-alt",
                  )}
                  aria-pressed={settings.textSize === s.value}
                  onClick={() => setTextSize(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={ROW}
            aria-pressed={settings.highContrast}
            onClick={toggleHighContrast}
          >
            <span>{t.highContrast}</span>
            <span className={pillClass(settings.highContrast)}>
              {settings.highContrast ? t.on : t.off}
            </span>
          </button>

          <button
            type="button"
            className={ROW}
            aria-pressed={settings.reduceMotion}
            onClick={toggleReduceMotion}
          >
            <span>{t.reduceMotion}</span>
            <span className={pillClass(settings.reduceMotion)}>
              {settings.reduceMotion ? t.on : t.off}
            </span>
          </button>

          <p role="status" className="sr-only">
            {status}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
