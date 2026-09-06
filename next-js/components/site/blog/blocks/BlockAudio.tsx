"use client";

import { useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* Audio block (openspec gutenberg-post-blocks § audio). Custom play/pause over a
 * hidden <audio>; audio-only content needs a transcript (the link below), not a
 * caption track — WCAG 1.2.1. Without a file (fixtures) the player shows the
 * prototype's static state. */
export function BlockAudio({
  file,
  title,
  duration,
  transcriptUrl,
  wpOrigin,
}: {
  file: string | null;
  title: string;
  duration?: string;
  transcriptUrl: string;
  wpOrigin: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [totalSec, setTotalSec] = useState(0);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play()?.catch(() => {});
    else el.pause();
  }

  const progressPct = file ? (totalSec ? (currentSec / totalSec) * 100 : 0) : 30;
  const currentLabel = file ? fmt(currentSec) : "0:58";
  const totalLabel = file && totalSec ? fmt(totalSec) : (duration ?? "–:––");

  return (
    <div
      className="block-audio flex w-full flex-col gap-3.5 rounded-[16px] bg-white px-5 py-[18px] shadow-media md:rounded-[20px] md:px-[26px] md:py-[22px]"
      data-testid="block-audio"
      data-playing={playing}
    >
      {file ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- audio-only: transcript link below (WCAG 1.2.1)
        <audio
          ref={audioRef}
          src={file}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={() => setCurrentSec(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setTotalSec(audioRef.current?.duration ?? 0)}
          data-testid="block-audio-element"
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-[18px]">
        <button
          type="button"
          aria-label={`${playing ? "Pause" : "Play"} audio: ${title}`}
          aria-pressed={playing}
          disabled={!file}
          className="size-14 flex-none cursor-pointer rounded-full border-none bg-brand text-[1.1rem] text-white shadow-[0_4px_14px_rgba(27,27,34,0.25)] transition-colors duration-100 hover:bg-brand-deep disabled:cursor-default disabled:opacity-70"
          data-testid="block-audio-toggle"
          onClick={toggle}
        >
          <span aria-hidden="true">{playing ? "⏸" : "▶"}</span>
        </button>
        <div className="flex flex-[1_1_260px] flex-col gap-2.5">
          <div className="text-[1.05rem] font-bold" data-testid="block-audio-title">
            {title}
          </div>
          <div
            aria-hidden="true"
            className="relative h-2.5 overflow-hidden rounded-full bg-control-faint"
            data-testid="block-audio-progress"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              style={{ width: `${progressPct}%` }}
              data-testid="block-audio-progress-fill"
            />
          </div>
          <div className="flex justify-between font-mono text-[0.8rem] text-muted">
            <span data-testid="block-audio-current-time">{currentLabel}</span>
            <span data-testid="block-audio-duration">{totalLabel}</span>
          </div>
        </div>
      </div>
      <SiteLink
        href={transcriptUrl}
        wpOrigin={wpOrigin}
        className="self-start text-[0.9rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4"
        data-testid="block-audio-transcript"
      >
        Read transcript
      </SiteLink>
    </div>
  );
}
