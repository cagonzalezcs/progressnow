import { cn } from "@/lib/utils";

/* v4 wordmark lockup (openspec progress-now-v4-foundation-chrome, design D5):
 * a decorative yellow diamond followed by the chapter name in Bowlby One
 * uppercase white. Rendered by the header and footer while no logo is
 * uploaded (`identity.logo_*.is_default`). */
const DIAMOND = {
  header: "size-5 rounded-[4px]",
  tablet: "size-[18px] rounded-[4px]",
  footer: "size-[18px] rounded-[4px]",
  mobile: "size-4 rounded-[3px]",
} as const;
const NAME = {
  header: "text-[1.35rem] tracking-[0.01em]",
  tablet: "text-[1.2rem] tracking-[0.01em]",
  footer: "text-[1.25rem]",
  mobile: "text-[clamp(0.9rem,4.5vw,1.1rem)]",
} as const;
const GAP = { header: "gap-[13px]", tablet: "gap-3", footer: "gap-3", mobile: "gap-2.5" } as const;

export function WordmarkLockup({
  name,
  size = "header",
}: {
  name: string;
  size?: keyof typeof DIAMOND;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center", GAP[size])}>
      <span
        aria-hidden="true"
        className={cn("block flex-none rotate-45 bg-yellow", DIAMOND[size])}
      />
      <span
        className={cn("font-display font-normal uppercase leading-[1.05] text-white", NAME[size])}
      >
        {name}
      </span>
    </span>
  );
}
