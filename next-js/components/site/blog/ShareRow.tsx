"use client";

import { useEffect, useRef, useState } from "react";

/* Share row under the article (design "Post hero"/"Article body"): outline
 * accent pills — Copy link (clipboard + "Copied ✓" status) and Email it. */
const PILL =
  "cursor-pointer rounded-full border-2 border-accent bg-transparent px-4 py-2 text-[0.85rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white md:px-[18px] md:py-[7px] md:text-[0.9rem]";

export function ShareRow({
  title,
  shareLabel,
  copyLabel,
  emailLabel,
}: {
  title: string;
  shareLabel: string;
  copyLabel: string;
  emailLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function copyLink() {
    void navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5 md:mt-2 md:gap-3.5 md:pt-6">
      <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.06em] text-muted md:text-[0.9rem]">
        {shareLabel}
      </span>
      <button type="button" className={PILL} onClick={copyLink} aria-live="polite">
        {copied ? "Copied ✓" : copyLabel}
      </button>
      <a href={`mailto:?subject=${encodeURIComponent(title)}`} className={PILL}>
        {emailLabel}
      </a>
    </div>
  );
}
