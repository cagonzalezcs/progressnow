"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, type ReactNode } from "react";
import { useA11y } from "@/components/a11y/A11yProvider";
import { A11yWidget } from "@/components/site/A11yWidget";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { WordmarkLockup } from "@/components/site/WordmarkLockup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobileNav } from "@/hooks/use-mobile-nav";
import type { TextSize } from "@/lib/a11y-settings";
import { resolveHref } from "@/lib/links";
import type { LanguageLink } from "@/lib/contracts";
import type { SiteEnvelope } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/* v4 header (design D6; openspec site-chrome § Site header, § Mobile navigation
 * toggle). Three tiers: ≥xl one row (lockup · Bowlby nav with About ▾ · white
 * 42px pills); md→xl two rows; <md lockup · Join · hamburger → full-viewport
 * panel with the nav, Join, EN/ES and the A / A+ / A++ row. Port of the Vue
 * SiteHeader: same class recipes, same behaviors — Escape closes the panel and
 * returns focus to the toggle, the page behind is scroll-locked, the panel
 * closes on navigation, aria-current marks the current section. The panel's
 * overlay mechanics (immediate close on tap, scroll lock, focus containment,
 * measured top edge, breakpoint bail-out) live in useMobileNav. */
export interface SiteHeaderProps {
  header: SiteEnvelope["header"];
  languages: LanguageLink[];
  /** WordPress origin the envelope URLs were minted on (re-homing). */
  wpOrigin: string;
  strings?: { menu?: string; textSize?: string; language?: string };
}

const NAV_LINK =
  "rounded-[10px] px-3.5 py-2.5 font-display text-[1.06rem] font-normal text-white no-underline hover:bg-ink/22";
const NAV_LINK_TABLET =
  "inline-flex min-h-11 items-center rounded-[10px] px-3 py-[9px] font-display text-[0.98rem] font-normal text-white no-underline hover:bg-ink/22";
const CURRENT = "underline decoration-[3px] underline-offset-[6px]";
const PILL =
  "box-border inline-flex items-center rounded-full bg-white font-display font-normal text-brand no-underline transition-colors hover:bg-brand-deep hover:text-white";
const ABOUT_ITEM =
  "rounded-[9px] px-[15px] py-[11px] text-base font-semibold text-ink focus:bg-brand-deep focus:text-white";
/* WordPress menus override these (site-chrome § Site header); the Vue twin's defaults. */
const DEFAULT_ABOUT = [
  { label: "About the Chapter", href: "/about/" },
  { label: "Mission & History", href: "/about/#mission" },
  { label: "Where We Organize", href: "/about/#counties" },
  { label: "Committees", href: "/about/#committees" },
  { label: "Bylaws & Code of Conduct", href: "/about/#bylaws" },
  { label: "FAQ", href: "/about/#faq" },
];
const DEFAULT_NAV = [
  { label: "Calendar", href: "/calendar/" },
  { label: "Blog", href: "/blog/" },
  { label: "Get Involved", href: "/get-involved/" },
];
const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "default", label: "A" },
  { value: "large", label: "A+" },
  { value: "xl", label: "A++" },
];

function normalizePath(href: string): string {
  const path = href.replace(/[?#].*$/, "");
  return path !== "/" ? path.replace(/\/$/, "") : path;
}

type Href = (url: string) => ReturnType<typeof resolveHref>;

/** Envelope URL → the right anchor: internal client navigation, otherwise a plain link. */
function NavA({
  url,
  href,
  className,
  children,
  ...rest
}: {
  url: string;
  href: Href;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
}) {
  const r = href(url);
  return r.kind === "internal" ? (
    <Link href={r.href} className={className} {...rest}>
      {children}
    </Link>
  ) : (
    <a
      href={r.href}
      className={className}
      rel={r.kind === "external" ? "noopener" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}

function Logo({
  header,
  size,
  imgClass,
}: {
  header: SiteHeaderProps["header"];
  size: "header" | "tablet" | "mobile";
  imgClass: string;
}) {
  const showLockup = header.logoIsDefault || !header.logoUrl;
  return showLockup ? (
    <WordmarkLockup name={header.orgName} size={size} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- Chapter Settings upload, sized by the theme
    <img src={header.logoUrl} alt={header.orgName} className={imgClass} />
  );
}

function HomeLink({
  header,
  href,
  size,
  imgClass,
  className,
}: {
  header: SiteHeaderProps["header"];
  href: Href;
  size: "header" | "tablet" | "mobile";
  imgClass: string;
  className: string;
}) {
  return (
    <NavA
      url={header.homeUrl}
      href={href}
      aria-label={`${header.orgName} home`}
      className={className}
    >
      <Logo header={header} size={size} imgClass={imgClass} />
    </NavA>
  );
}

function AboutMenu({
  label,
  items,
  href,
  triggerClass,
  current,
}: {
  label: string;
  items: { label: string; href: string }[];
  href: Href;
  triggerClass: string;
  current: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("cursor-pointer border-0 bg-transparent", triggerClass, current && CURRENT)}
        aria-current={current ? "page" : undefined}
      >
        {label}&nbsp;▾
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[200] min-w-[256px] rounded-[14px] border-0 bg-white p-2 font-sans shadow-popover"
      >
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild className={ABOUT_ITEM}>
            <NavA
              url={item.href}
              href={href}
              className="block cursor-pointer text-ink no-underline hover:bg-brand-deep hover:text-white focus:text-white"
            >
              {item.label}
            </NavA>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function JoinPill({
  url,
  href,
  className,
  label,
  onClick,
}: {
  url: string;
  href: Href;
  className: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavA url={url} href={href} className={cn(PILL, className)} onClick={onClick}>
      {label}
    </NavA>
  );
}

export function SiteHeader({ header, languages, wpOrigin, strings }: SiteHeaderProps) {
  const pathname = usePathname() ?? "/";
  const panelId = useId();
  const { open, barRef, panelRef, toggleRef, toggle, close } = useMobileNav(pathname);
  const { settings, setTextSize, reduceMotion } = useA11y();

  const aboutItems = header.aboutItems ?? DEFAULT_ABOUT;
  const navItems = header.navItems ?? DEFAULT_NAV;
  const href: Href = (url) => resolveHref(url, wpOrigin);
  const isCurrent = (url: string) => normalizePath(href(url).href) === normalizePath(pathname);
  const isAboutCurrent = aboutItems.some((i) => isCurrent(i.href));
  const joinShort = header.joinShortLabel || header.joinLabel;
  const flatNav = [
    { label: header.aboutLabel, href: aboutItems[0]?.href ?? "/about/" },
    ...navItems,
  ];
  const t = { menu: "Menu", textSize: "Text size", language: "Language", ...strings };

  return (
    <header
      className="site-header sticky top-0 z-100 bg-brand font-sans shadow-header"
      data-tone="blue"
    >
      {/* ============ MOBILE (< md) ============ */}
      {/* Taps land on the `active:` recipes below, not on the OS tap flash the panel
          inherits from here (the property inherits, so one declaration covers the tier). */}
      <div className="md:hidden" style={{ WebkitTapHighlightColor: "transparent" }}>
        <div
          ref={barRef}
          className="flex min-h-[60px] items-center justify-between gap-3 px-4 py-2"
        >
          <HomeLink
            header={header}
            href={href}
            size="mobile"
            imgClass="block h-9 w-auto max-w-[200px]"
            className="flex min-h-11 min-w-0 flex-1 items-center no-underline"
          />
          <div className="flex flex-none items-center gap-2">
            <JoinPill
              url={header.joinUrl}
              href={href}
              className="h-11 touch-manipulation px-3.5 text-[0.82rem] active:bg-brand-deep active:text-white"
              label={joinShort}
              onClick={close}
            />
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-11 touch-manipulation cursor-pointer items-center justify-center rounded-[12px] border-2 border-white/60 bg-transparent text-white transition-colors duration-100 hover:bg-ink/22 active:bg-ink/30"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={t.menu}
              onClick={toggle}
            >
              {open ? (
                <X className="size-6" aria-hidden="true" />
              ) : (
                <Menu className="size-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div
          id={panelId}
          ref={panelRef}
          hidden={!open}
          /* `--pn-bar-h` is measured by useMobileNav; 60px is the bar's height at the
             default text size, which is what the first paint gets. */
          style={{ top: "var(--pn-bar-h, 60px)" }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-90 flex flex-col overflow-y-auto overscroll-contain border-t border-white/25 bg-brand",
            !reduceMotion && "animate-in fade-in-0 slide-in-from-top-2 duration-150 ease-out",
          )}
          data-tone="blue"
        >
          <nav aria-label="Main" className="relative flex flex-1 flex-col gap-1 px-4 py-6">
            {flatNav.map((item) => (
              <NavA
                href={href}
                key={item.label}
                url={item.href}
                onClick={close}
                className={cn(
                  "relative touch-manipulation rounded-[12px] px-3 py-4 font-display text-[1.6rem] font-normal uppercase text-white no-underline transition-colors duration-100 hover:bg-ink/22 active:bg-ink/30",
                  isCurrent(item.href) && "bg-ink/22",
                )}
                aria-current={isCurrent(item.href) ? "page" : undefined}
              >
                {item.label}
              </NavA>
            ))}
            <NavA
              url={header.joinUrl}
              href={href}
              onClick={close}
              className="relative mx-3 mt-6 touch-manipulation rounded-full bg-white px-3 py-[15px] text-center font-display text-base font-normal uppercase tracking-[0.04em] text-brand no-underline transition-colors duration-100 hover:bg-brand-deep hover:text-white active:bg-brand-deep active:text-white"
            >
              {header.joinLabel}
            </NavA>
          </nav>
          {/* The home indicator overlaps the last 34px of the viewport on modern iPhones;
              without the inset its swipe area sits on top of the text-size buttons. Where
              env() is unknown the declaration drops and `pb-7` stands as before. */}
          <div
            className="mt-auto flex items-center justify-between gap-3 border-t border-white/25 px-6 pb-7 pt-[18px]"
            style={{ paddingBottom: "calc(1.75rem + env(safe-area-inset-bottom))" }}
          >
            <LanguageToggle
              languages={languages}
              size="mobile"
              wpOrigin={wpOrigin}
              label={t.language}
            />
            <div role="group" aria-label={t.textSize} className="flex items-center gap-2">
              {TEXT_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={cn(
                    "size-11 touch-manipulation cursor-pointer rounded-[10px] border-2 text-[0.9rem] font-bold transition-colors duration-100",
                    settings.textSize === s.value
                      ? "border-white bg-white text-brand"
                      : "border-white/50 bg-transparent text-white",
                  )}
                  aria-pressed={settings.textSize === s.value}
                  onClick={() => setTextSize(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ TABLET (md → xl) ============ */}
      <div className="hidden md:block xl:hidden">
        <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-3">
          <HomeLink
            header={header}
            href={href}
            size="tablet"
            imgClass="block h-10 w-auto max-w-[240px]"
            className="flex min-h-11 min-w-0 flex-1 items-center no-underline"
          />
          <div className="flex flex-none items-center gap-2.5">
            <LanguageToggle
              languages={languages}
              size="tablet"
              wpOrigin={wpOrigin}
              label={t.language}
            />
            <A11yWidget size="tablet" />
            <JoinPill
              url={header.joinUrl}
              href={href}
              className="h-11 px-5 text-[0.9rem]"
              label={header.joinLabel}
            />
          </div>
        </div>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
          <AboutMenu
            label={header.aboutLabel}
            items={aboutItems}
            href={href}
            triggerClass={NAV_LINK_TABLET}
            current={isAboutCurrent}
          />
          {navItems.map((item) => (
            <NavA
              key={item.label}
              url={item.href}
              href={href}
              className={cn(NAV_LINK_TABLET, isCurrent(item.href) && CURRENT)}
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </NavA>
          ))}
        </nav>
      </div>

      {/* ============ DESKTOP (xl+) ============ */}
      <div className="site-header-desktop mx-auto hidden min-h-[76px] max-w-[82.5rem] flex-wrap items-center justify-between gap-6 px-6 py-[14px] xl:flex">
        <HomeLink
          header={header}
          href={href}
          size="header"
          imgClass="block h-12 w-auto max-w-[240px]"
          className="flex min-h-11 flex-none items-center no-underline"
        />
        <nav aria-label="Main" className="flex flex-wrap items-center gap-[18px]">
          <AboutMenu
            label={header.aboutLabel}
            items={aboutItems}
            href={href}
            triggerClass={NAV_LINK}
            current={isAboutCurrent}
          />
          {navItems.map((item) => (
            <NavA
              key={item.label}
              url={item.href}
              href={href}
              className={cn(NAV_LINK, isCurrent(item.href) && CURRENT)}
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </NavA>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageToggle languages={languages} wpOrigin={wpOrigin} label={t.language} />
          <A11yWidget />
          <JoinPill
            url={header.joinUrl}
            href={href}
            className="h-[42px] px-[22px] text-[0.95rem]"
            label={header.joinLabel}
          />
        </div>
      </div>
    </header>
  );
}
