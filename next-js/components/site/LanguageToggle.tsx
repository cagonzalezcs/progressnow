import type { LanguageLink } from "@/lib/contracts";
import { resolveHref } from "@/lib/links";
import { cn } from "@/lib/utils";

/* EN/ES switcher — the v4 white segmented pill (design D6). Each segment links
 * to the current page's translation (Polylang falls back to the language home).
 * A plain <a>: switching language is a full document load on purpose, so
 * <html lang>, the chrome and every string re-render for the new language. */
const HEIGHT = { desktop: "h-[42px]", tablet: "h-11", mobile: "h-11" } as const;
const SEGMENT =
  "box-border inline-flex cursor-pointer items-center self-stretch rounded-full border-[3px] px-[13px] font-display text-[0.8rem] leading-none font-normal tracking-[0.04em] no-underline hover:underline hover:underline-offset-[3px]";

export function LanguageToggle({
  languages = [],
  size = "desktop",
  wpOrigin,
  label = "Language",
}: {
  languages?: LanguageLink[];
  size?: keyof typeof HEIGHT;
  wpOrigin: string;
  label?: string;
}) {
  if (languages.length < 2) return null;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "notranslate box-border flex items-center gap-0.5 overflow-hidden rounded-full bg-white px-1",
        HEIGHT[size],
      )}
    >
      {languages.map((l) => {
        const href = resolveHref(l.url, wpOrigin);
        return (
          <a
            key={l.code}
            href={href.href}
            data-native-nav=""
            lang={l.code}
            title={l.name}
            aria-current={l.active ? "true" : undefined}
            className={cn(
              SEGMENT,
              l.active
                ? "border-white bg-brand text-white"
                : "border-transparent bg-transparent text-brand",
            )}
          >
            {l.label}
          </a>
        );
      })}
    </div>
  );
}
