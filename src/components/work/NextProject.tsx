"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { sheetRange } from "@/lib/sheet-range";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const HOLD_MS = 1400;

/**
 * §7.7: the next project, large. Scrolling through to the end of this block fills a line and,
 * after a short pause the reader can cancel, opens the next case study. Scrolling back up or
 * past it also cancels. Reduced motion: no automatic navigation, only the link.
 */
export function NextProject({ children, title }: { children: React.ReactNode; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [state, setState] = useState<"idle" | "armed" | "cancelled">("idle");
  const stateRef = useRef(state);
  const timer = useRef<number | undefined>(undefined);

  const set = (s: typeof state) => {
    stateRef.current = s;
    setState(s);
  };

  useGSAP(
    () => {
      if (reduceMotion) return;
      const root = ref.current!;
      const block = root.querySelector<HTMLElement>("[data-hold]")!;
      const range = sheetRange(block);
      const disarm = () => {
        window.clearTimeout(timer.current);
        if (stateRef.current === "armed") set("idle");
      };

      ScrollTrigger.create({
        start: range.start,
        end: range.end,
        invalidateOnRefresh: true,
        animation: gsap.fromTo(root.querySelector("[data-fill]"), { scaleX: 0 }, { scaleX: 1, ease: "none" }),
        scrub: true,
        onUpdate: (self) => {
          const s = stateRef.current;
          if (self.progress > 0.985 && self.isActive && s === "idle") {
            set("armed");
            timer.current = window.setTimeout(() => {
              root.querySelector<HTMLAnchorElement>("a[data-next]")?.click();
            }, HOLD_MS);
          } else if (self.progress < 0.95) {
            disarm();
            if (s === "cancelled" && self.progress < 0.85) set("idle");
          }
        },
        onLeave: disarm,
        onLeaveBack: disarm,
      });
      return () => window.clearTimeout(timer.current);
    },
    { scope: ref, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  return (
    <div ref={ref}>
      <div data-hold className="relative motion-safe:h-[170svh]">
        <div className="flex h-svh flex-col justify-end gap-8 px-gutter pt-28 pb-12 motion-safe:sticky motion-safe:top-0">
          {children}
          <div className="flex flex-wrap items-center justify-between gap-4 text-small">
            <div className="h-px min-w-40 flex-1 bg-haze" aria-hidden>
              <div data-fill className="h-px origin-left bg-ink" />
            </div>
            <p aria-live="polite" className="min-h-[1.5em]">
              {state === "armed" && (
                <>
                  Opening {title}.{" "}
                  <button
                    type="button"
                    className="link-underline font-semibold"
                    onClick={() => {
                      window.clearTimeout(timer.current);
                      set("cancelled");
                    }}
                  >
                    Stay here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
