"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useMediaQuery";

export type Tone = "paper" | "chalk" | "bone" | "linen";

const toneClass: Record<Tone, string> = {
  paper: "bg-paper",
  chalk: "bg-chalk",
  bone: "bg-bone",
  linen: "bg-linen",
};

type SheetProps = React.ComponentProps<"section"> & { tone?: Tone };

/** Visible markers in document order. Hidden (Activity) routes have no client rects. */
function visibleMarkers() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-sheet-marker]")).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * One sheet of paper (M2). Sticks once its bottom reaches the viewport bottom, so tall sheets
 * are fully readable, then the next sheet slides over it while this one sinks and shades.
 *
 * Position-sticky elements make unreliable ScrollTrigger triggers, so each sheet is preceded by
 * an in-flow zero-height marker that records where the sheet naturally starts.
 */
export function Sheet({ tone = "paper", className = "", children, ...rest }: SheetProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sheet = sheetRef.current!;

      const setTop = () => {
        sheet.style.top = `${Math.min(0, window.innerHeight - sheet.offsetHeight)}px`;
      };
      setTop();
      const ro = new ResizeObserver(setTop);
      ro.observe(sheet);
      window.addEventListener("resize", setTop);

      if (!prefersReducedMotion()) {
        const markers = visibleMarkers();
        const next = markers[markers.indexOf(markerRef.current!) + 1];
        if (next) {
          gsap
            .timeline({
              scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
            })
            .to(sheet, { scale: 0.94, ease: "none" }, 0)
            .to(shadeRef.current, { opacity: 0.14, ease: "none" }, 0);
        }
      }

      return () => {
        ro.disconnect();
        window.removeEventListener("resize", setTop);
      };
    },
    {},
  );

  return (
    <>
      <div ref={markerRef} data-sheet-marker className="sheet-marker" aria-hidden />
      <section ref={sheetRef} className={`sheet ${toneClass[tone]} ${className}`} {...rest}>
        {children}
        <div ref={shadeRef} className="sheet-shade" aria-hidden />
      </section>
    </>
  );
}
