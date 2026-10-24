"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export type TimelineEntry = { when: string; role: string; org: string; points: string[] };

/**
 * Career timeline. An ink line draws down as you read; each entry turns from graphite to ink
 * when the line reaches it. Reduced motion: everything drawn and inked from the start.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = ref.current!;
      const items = gsap.utils.toArray<HTMLElement>(":scope > ol > li", root);
      // the first run happens with the hook's server value (reduced motion), so each run cleans up
      const clear = () => items.forEach((i) => i.classList.remove("is-reached"));
      if (reduceMotion) {
        items.forEach((i) => i.classList.add("is-reached"));
        return clear;
      }
      gsap.fromTo(
        root.querySelector("[data-line]"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: root, start: "top 60%", end: "bottom 60%", scrub: 0.3 } },
      );
      items.forEach((item) =>
        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          onEnter: () => item.classList.add("is-reached"),
          onLeaveBack: () => item.classList.remove("is-reached"),
        }),
      );
      return clear;
    },
    { scope: ref, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className="relative">
      <div className="absolute top-2 bottom-2 left-[5px] w-px bg-haze md:left-[calc(25%+5px)]" aria-hidden>
        <div data-line className="size-full origin-top bg-ink" />
      </div>
      <ol>
      {entries.map((e) => (
        <li
          key={`${e.when}-${e.org}`}
          className="group relative grid gap-x-6 gap-y-2 pb-16 pl-10 text-graphite transition-colors duration-700 last:pb-0 md:grid-cols-4 md:pl-0 [&.is-reached]:text-ink"
        >
          <span
            aria-hidden
            className="absolute top-2 left-0 size-[11px] rounded-full border border-ink bg-bone transition-colors duration-500 group-[.is-reached]:bg-ink md:left-[25%]"
          />
          <p className="wdth text-h3 font-semibold md:pr-10 md:text-right" style={{ "--wdth": 112 } as React.CSSProperties}>
            {e.when}
          </p>
          <div className="md:col-span-3 md:pl-12">
            <h3 className="text-h3 font-semibold">{e.role}</h3>
            <p className="mt-1">{e.org}</p>
            <ul className="mt-4 max-w-[60ch] space-y-2 text-graphite">
              {e.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
      </ol>
    </div>
  );
}
