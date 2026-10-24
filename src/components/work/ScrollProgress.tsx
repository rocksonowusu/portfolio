"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** M11: a 1px ink line across the top that fills as you read. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
    );
  });
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px origin-left bg-ink"
    />
  );
}
