"use client";

import { useEffect, useRef, useState } from "react";

const SHARE_PILL =
  "cursor-pointer rounded-full border-2 border-accent bg-transparent px-4 py-2 text-[0.85rem] font-bold text-accent no-underline transition-colors hover:bg-accent hover:text-white md:px-[18px] md:py-[7px] md:text-[0.9rem]";

/* Share row (openspec progress-now-v4-blog § Share). Copy link writes the
 * current URL and flips the button to a "Copied" state for two seconds; a
 * polite live region announces the result for screen-reader users, since a
 * changed button label alone is not reliably read. */
export function ShareRow({
  title,
  shareLabel = "Share",
  copyLabel = "Copy link",
  copiedLabel = "Copied ✓",
  emailLabel = "Email it",
}: {
  title: string;
  shareLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  emailLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function copyLink() {
    void navigator.clipboard?.writeText(location.href).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="share-row mt-1.5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5 md:mt-2 md:gap-3.5 md:pt-6"
      data-testid="share-row"
    >
      <span
        className="text-[0.85rem] font-extrabold uppercase tracking-[0.06em] text-muted md:text-[0.9rem]"
        data-testid="share-row-label"
      >
        {shareLabel}
      </span>
      <button
        type="button"
        className={SHARE_PILL}
        onClick={copyLink}
        data-testid="share-row-copy"
        data-copied={copied}
      >
        {copied ? copiedLabel : copyLabel}
      </button>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}`}
        className={SHARE_PILL}
        data-testid="share-row-email"
      >
        {emailLabel}
      </a>
      <span role="status" className="sr-only" data-testid="share-row-status">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
