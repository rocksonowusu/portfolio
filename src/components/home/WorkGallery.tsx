"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { sheetRange } from "@/lib/sheet-range";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { Kind } from "@/content/projects";

export type GalleryItem = { slug: string; kind: Kind[]; card: React.ReactNode };

const FILTERS: ("All" | Kind)[] = ["All", "Web", "Mobile", "IoT", "AI"];

/**
 * M6: on large screens vertical scroll drives the card track sideways while the stage holds.
 * Small screens get a plain vertical list. Filters re-measure the track.
 */
export function WorkGallery({
  heading,
  items,
  end,
}: {
  heading: React.ReactNode;
  items: GalleryItem[];
  /** Last card in the track (link to all work). */
  end: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"All" | Kind>("All");
  const reduceMotion = usePrefersReducedMotion();
  const visible = items.filter((i) => filter === "All" || i.kind.includes(filter));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { desktop, reduce } = ctx.conditions!;
        const root = ref.current!;
        const pin = root.querySelector<HTMLElement>("[data-pin]")!;
        const track = root.querySelector<HTMLElement>("[data-track]")!;
        if (!desktop || reduce) {
          pin.style.height = "";
          return;
        }

        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        // the pinned block is exactly as tall as the sideways distance plus one screen
        const size = () => {
          pin.style.height = `${distance() + window.innerHeight}px`;
        };
        size();
        const range = sheetRange(pin);

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            start: range.start,
            end: range.end,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onRefreshInit: size,
          },
        });
        return () => {
          pin.style.height = "";
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [reduceMotion, filter], revertOnUpdate: true },
  );

  // a new filter: the cards that remain fade in (GSAP rather than Motion keeps the home bundle light)
  const first = useRef(true);
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (!reduceMotion) gsap.from("[data-track] > li", { opacity: 0, y: 16, duration: 0.5, stagger: 0.05, ease: "power2.out" });
    },
    { scope: ref, dependencies: [filter] },
  );

  const choose = (f: "All" | Kind) => {
    setFilter(f);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <div ref={ref}>
      <div data-pin className="relative">
        <div className="flex min-h-svh flex-col justify-center gap-10 py-24 lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-svh lg:motion-safe:overflow-hidden lg:motion-safe:py-0">
          <div className="flex flex-col gap-6 px-gutter md:flex-row md:items-end md:justify-between">
            {heading}
            <div role="group" aria-label="Filter by kind" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => choose(f)}
                  className="border border-ink px-4 py-1.5 text-small transition-colors aria-pressed:bg-ink aria-pressed:text-paper"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ul
            data-track
            className="flex flex-col gap-16 px-gutter lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:items-start lg:motion-safe:gap-[3vw] lg:motion-reduce:grid lg:motion-reduce:grid-cols-3 lg:motion-reduce:gap-x-6"
          >
            {visible.map((item) => (
              <li key={item.slug} className="lg:motion-safe:w-[clamp(320px,30vw,520px)]">
                {item.card}
              </li>
            ))}
            <li key="__end" className="lg:motion-safe:w-[clamp(260px,22vw,380px)] lg:self-stretch">
              {end}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
