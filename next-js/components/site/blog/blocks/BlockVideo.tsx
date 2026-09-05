"use client";

import Image from "next/image";
import { useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { cn } from "@/lib/utils";

/** YouTube / Vimeo page URL → privacy-enhanced embed src; anything else has no player. */
export function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

/* Video block (openspec gutenberg-post-blocks § video): a click-to-load facade
 * (poster + play) so third-party iframes never ship on page load; the iframe
 * receives focus once mounted. */
export function BlockVideo({
  url,
  poster,
  caption,
  transcriptUrl,
  wpOrigin,
}: {
  url: string;
  poster?: string | null;
  caption?: string;
  transcriptUrl?: string;
  wpOrigin: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = videoEmbedUrl(url);
  const title = caption ? `Video: ${caption}` : "Video";

  return (
    <figure className="block-video m-0 flex w-full flex-col">
      {playing && embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="aspect-video w-full rounded-[20px] shadow-media"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          ref={(el) => el?.focus()}
        />
      ) : (
        <div
          className={cn(
            "relative flex aspect-video items-center justify-center overflow-hidden rounded-[20px] shadow-media",
            !poster &&
              "bg-[repeating-linear-gradient(45deg,var(--color-alt)_0_14px,var(--color-control-faint)_14px_28px)]",
          )}
        >
          {poster ? (
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1140px) 880px, 100vw"
              className="object-cover"
            />
          ) : null}
          <button
            type="button"
            aria-label={embedUrl ? `Play ${title}` : `${title} (unavailable)`}
            disabled={!embedUrl}
            className="relative flex size-[84px] cursor-pointer items-center justify-center rounded-full border-none bg-brand text-[1.8rem] text-white shadow-[0_8px_24px_rgba(27,27,34,0.3)] transition-transform duration-100 hover:scale-105 hover:bg-brand-deep disabled:cursor-default disabled:opacity-70"
            onClick={() => setPlaying(true)}
          >
            <span aria-hidden="true">▶</span>
          </button>
          <span
            aria-hidden="true"
            className="absolute bottom-3.5 right-3.5 rounded-[6px] bg-white px-2 py-1 text-[0.75rem] font-bold tracking-[0.06em] text-ink"
          >
            CC
          </span>
        </div>
      )}
      {caption || transcriptUrl ? (
        <figcaption className="flex flex-wrap justify-between gap-4 pt-3 text-[0.9rem] leading-[1.5] text-muted">
          <span>{caption}</span>
          {transcriptUrl ? (
            <SiteLink
              href={transcriptUrl}
              wpOrigin={wpOrigin}
              className="font-bold text-accent no-underline hover:underline hover:underline-offset-4"
            >
              Read transcript
            </SiteLink>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
