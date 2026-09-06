import type { LanguageLink } from "@/lib/contracts";
import { resolveHref } from "@/lib/links";
import { cn } from "@/lib/utils";

/* EN/ES switcher — the v4 white segmented pill (design D6). Each segment links
 * to the current page's translation (Polylang falls back to the language home).
 * A plain <a>: switching language is a full document load on purpose, so
 * <html lang>, the chrome and every string re-render for the new language. */
const HEIGHT = { desktop: "h-[42px]", tablet: "h-11", mobile: "h-11" } as const;
/* Focus ring for the segments, built in three layers, because a plain outset ring
 * cannot work here: the segments self-stretch to the group's full height, so their
 * top and bottom edges are flush with the pill and sit directly on the blue band,
 * while px-1 leaves only 4px of white either side.
 *   outline (ink, offset -3px)  lands exactly on the segment's own 3px border band
 *   inset-ring (white, 2px)     separates it from the brand fill inside
 *   ring (white, 2px)           separates it from the blue band outside
 * Every boundary clears 3:1 (17:1 white/ink, 7.1:1 white/brand) and the
 * focused-vs-unfocused change on the border band is 17:1 — including under
 * html.a11y-contrast, where ink against the darkened brand would otherwise be
 * 1.5:1. The group must NOT be overflow-hidden or the outer ring is clipped away;
 * the segments are rounded-full themselves, so nothing needed that clip.
 * (WCAG 2.4.7, 2.4.13, 1.4.11) */
const SEGMENT =
  "box-border inline-flex cursor-pointer items-center self-stretch rounded-full border-[3px] px-[13px] font-display text-[0.8rem] leading-none font-normal tracking-[0.04em] no-underline hover:underline hover:underline-offset-[3px] focus-visible:outline-ink focus-visible:outline-offset-[-3px] focus-visible:inset-ring-2 focus-visible:inset-ring-white focus-visible:ring-2 focus-visible:ring-white";

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
      data-testid="language-toggle"
      data-toggle-size={size}
      className={cn(
        "notranslate box-border flex items-center gap-0.5 rounded-full bg-white px-1",
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
            data-testid="language-toggle-option"
            data-lang={l.code}
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
