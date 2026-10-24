"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoEntry } from "@/content/images";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Data saver, or a connection too slow to stream video without being asked. */
function constrainedNetwork() {
  const c = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return !!c && (c.saveData || ["slow-2g", "2g", "3g"].includes(c.effectiveType ?? ""));
}

/**
 * Muted, inline, looping video that loads only when it nears the viewport and plays only
 * while visible. With reduced motion or on a constrained connection it waits for a tap.
 * `poster` is the server-rendered poster image, shown until the video can play.
 */
export function LazyVideo({
  video,
  poster,
  label,
  className = "",
}: {
  video: VideoEntry;
  poster: React.ReactNode;
  label: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Mount the <video> when it gets close; decide whether it may play by itself.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setAutoplay(!reduceMotion && !constrainedNetwork());
        setMounted(true);
        io.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(wrapRef.current!);
    return () => io.disconnect();
  }, [reduceMotion]);

  // Play only while on screen.
  useEffect(() => {
    if (!mounted || !autoplay) return;
    const v = videoRef.current!;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [mounted, autoplay]);

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ aspectRatio: `${video.width} / ${video.height}` }}>
      {poster}
      {mounted && (
        <video
          ref={videoRef}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          muted
          playsInline
          loop
          preload={autoplay ? "auto" : "none"}
          aria-label={label}
          onPlaying={() => setPlaying(true)}
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
      )}
      {mounted && !autoplay && !playing && (
        <button
          type="button"
          onClick={() => videoRef.current?.play()}
          className="absolute bottom-4 left-4 bg-ink px-4 py-2 text-small text-paper"
        >
          Play walkthrough
        </button>
      )}
    </div>
  );
}
