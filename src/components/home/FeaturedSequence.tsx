"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { sheetRange } from "@/lib/sheet-range";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export type FeaturedStep = { title: string; body: string; media: React.ReactNode };

/**
 * M5: on large screens the stage holds still while scrolling walks through the steps:
 * each screenshot clip-reveals over the last and the text panel beside it swaps in sync.
 * Below `lg`, and with reduced motion, the steps simply stack.
 */
export function FeaturedSequence({
  intro,
  aside,
  steps,
}: {
  /** Title and summary, always visible at the top of the text column. */
  intro: React.ReactNode;
  /** Figures, credits and links under the step text. */
  aside: React.ReactNode;
  steps: FeaturedStep[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { desktop, reduce } = ctx.conditions!;
        if (!desktop || reduce) return;

        const root = ref.current!;
        const track = root.querySelector<HTMLElement>("[data-track]")!;
        const media = gsap.utils.toArray<HTMLElement>("[data-media]", root);
        const texts = gsap.utils.toArray<HTMLElement>("[data-text]", root);
        const bar = root.querySelector("[data-progress]");
        const range = sheetRange(track);

        gsap.set(media.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(texts.slice(1), { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            start: range.start,
            end: range.end,
            scrub: 0.6,
            // no ScrollTrigger snap: it fights Lenis for the scroll position
            invalidateOnRefresh: true,
          },
        });
        tl.addLabel("step0");
        for (let i = 1; i < steps.length; i++) {
          tl.to(media[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, `step${i - 1}+=0.2`)
            .to(media[i - 1], { scale: 0.96, duration: 1 }, "<")
            .to(texts[i - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, "<")
            .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.45")
            .addLabel(`step${i}`, ">0.2");
        }
        if (bar) tl.fromTo(bar, { scaleX: 1 / steps.length }, { scaleX: 1, duration: tl.duration() }, 0);
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [reduceMotion, steps.length] },
  );

  return (
    <div ref={ref}>
      {/* desktop: tall track, sticky stage */}
      <div
        data-track
        className="relative hidden lg:motion-safe:block"
        style={{ height: `${steps.length * 85 + 40}svh` }}
      >
        <div className="sticky top-0 grid h-svh grid-cols-12 items-center gap-x-6 px-gutter">
          <div className="col-span-5 flex h-full flex-col justify-center gap-10 py-24">
            {intro}
            <div className="relative min-h-[9.5rem]">
              {steps.map((s, i) => (
                <div key={s.title} data-text className={i === 0 ? "" : "absolute inset-x-0 top-0"}>
                  <h3 className="text-h3 font-semibold">{s.title}</h3>
                  <p className="mt-3 max-w-[46ch] text-graphite">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="h-px w-full origin-left bg-haze" aria-hidden>
              <div data-progress className="h-px w-full origin-left bg-ink" />
            </div>
            {aside}
          </div>
          <div className="relative col-span-7 -mr-[var(--gutter)] aspect-[1918/960]">
            {steps.map((s, i) => (
              <div key={s.title} data-media className="absolute inset-0 origin-top-left" style={{ zIndex: i }}>
                {s.media}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* small screens and reduced motion: the same story, stacked */}
      <div className="px-gutter py-24 lg:motion-safe:hidden">
        {intro}
        <ol className="mt-14 space-y-16">
          {steps.map((s) => (
            <li key={s.title}>
              <div className="-mr-[var(--gutter)]">{s.media}</div>
              <h3 className="mt-6 text-h3 font-semibold">{s.title}</h3>
              <p className="mt-3 max-w-[46ch] text-graphite">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-16">{aside}</div>
      </div>
    </div>
  );
}
