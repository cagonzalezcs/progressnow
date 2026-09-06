/* First focusable element on every page (openspec next-accessibility
 * § Landmarks and skip link): moves focus to <main id="main" tabIndex={-1}>. */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      className="skip-link absolute -left-[9999px] top-3 z-200 rounded-[8px] bg-ink px-[18px] py-2.5 font-sans text-[0.95rem] font-bold text-white no-underline focus:left-4"
      href="#main"
      data-testid="skip-link"
    >
      {label}
    </a>
  );
}
