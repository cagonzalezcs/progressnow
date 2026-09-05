"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* Click-to-load video (openspec progress-now-v4-blog D4): poster + brand play
 * button until pressed, then the privacy-friendly YouTube/Vimeo embed. */
function embedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return "";
}

export function BlockVideo({
  url,
  poster,
  caption,
  transcriptUrl,
}: {
  url: string;
  poster?: string | null;
  caption?: string;
  transcriptUrl?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const src = embedUrl(url);
  return (
    <figure className="block-video m-0 flex w-full flex-col">
      {playing && src ? (
        <iframe
          src={src}
          title={caption || "Video"}
          className="aspect-video w-full rounded-[20px] shadow-media"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
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
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
          ) : null}
          {src ? (
            <button
              type="button"
              aria-label="Play video"
              onClick={() => setPlaying(true)}
              className="relative flex size-[84px] cursor-pointer items-center justify-center rounded-full border-none bg-brand text-[1.8rem] text-white shadow-[0_8px_24px_rgba(27,27,34,0.3)] transition-transform duration-100 hover:scale-105 hover:bg-brand-deep"
            >
              ▶
            </button>
          ) : (
            <a
              href={url}
              className="relative rounded-full bg-brand px-6 py-3 font-display text-[0.9rem] text-white no-underline hover:bg-brand-deep"
            >
              Watch video
            </a>
          )}
          <span className="absolute bottom-3.5 right-3.5 rounded-[6px] bg-white px-2 py-1 text-[0.75rem] font-bold tracking-[0.06em] text-ink">
            CC
          </span>
        </div>
      )}
      {caption || transcriptUrl ? (
        <figcaption className="flex flex-wrap justify-between gap-4 pt-3 text-[0.9rem] leading-[1.5] text-muted">
          <span>{caption}</span>
          {transcriptUrl ? (
            <a
              href={transcriptUrl}
              className="font-bold text-accent no-underline hover:underline hover:underline-offset-4"
            >
              Read transcript
            </a>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
