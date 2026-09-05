"use client";

import { useRef, useState } from "react";

/* Audio card with a brand play control and progress rule. Audio-only content
 * needs the transcript link (WCAG 1.2.1), not a caption track. */
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BlockAudio({
  file,
  title,
  duration,
  transcriptUrl,
}: {
  file: string | null;
  title: string;
  duration?: string;
  transcriptUrl: string;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }

  return (
    <div className="block-audio flex w-full flex-col gap-3.5 rounded-[16px] bg-white px-5 py-[18px] shadow-media md:rounded-[20px] md:px-[26px] md:py-[22px]">
      {file ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audio}
          src={file}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={() => setCurrent(audio.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setTotal(audio.current?.duration ?? 0)}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-[18px]">
        <button
          type="button"
          aria-label={`${playing ? "Pause" : "Play"} audio: ${title}`}
          disabled={!file}
          onClick={toggle}
          className="size-14 flex-none cursor-pointer rounded-full border-none bg-brand text-[1.1rem] text-white shadow-[0_4px_14px_rgba(27,27,34,0.25)] transition-colors duration-100 hover:bg-brand-deep disabled:cursor-default disabled:opacity-60"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div className="flex flex-[1_1_260px] flex-col gap-2.5">
          <div className="text-[1.05rem] font-bold">{title}</div>
          <div
            aria-hidden="true"
            className="relative h-2.5 overflow-hidden rounded-full bg-control-faint"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[0.8rem] text-muted">
            <span>{fmt(current)}</span>
            <span>{total > 0 ? fmt(total) : duration || "—"}</span>
          </div>
        </div>
      </div>
      <a
        href={transcriptUrl}
        className="self-start text-[0.9rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4"
      >
        Read transcript
      </a>
    </div>
  );
}
