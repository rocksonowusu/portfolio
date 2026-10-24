"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * M4: the name widens from condensed (wdth 62) to expanded (125) letter by letter once the
 * intro is over, then compresses slightly as the hero scrolls away. The starting state is in CSS
 * (.js .hero-name), so nothing jumps before hydration.
 *
 * No layout shift: the name is laid out at its final width first and each letter's box is
 * locked, so letters widen inside fixed boxes instead of re-wrapping the lines (which pushed the
 * whole hero down). The scroll compress is a transform for the same reason.
 */
export function HeroName({ children, id }: { children: string; id: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    (_, contextSafe) => {
      if (reduceMotion) return;
      const h1 = ref.current!;
      let split: SplitText | null = null;

      // contextSafe: tweens made later, in the callback, are still reverted with the component
      const unsubscribe = onIntroDone(contextSafe!(() => {
        gsap.set(h1, { "--wdth": 125 });
        split = SplitText.create(h1, { type: "words,chars", charsClass: "wdth", aria: "auto" });
        const chars = split.chars as HTMLElement[];
        const boxes = chars.map((c) => c.getBoundingClientRect());
        // fixed, contained boxes: each frame re-lays out one letter, not the whole line
        chars.forEach((c, i) => {
          c.style.width = `${boxes[i].width}px`;
          c.style.height = `${boxes[i].height}px`;
          c.style.textAlign = "center";
          c.style.contain = "strict";
        });
        gsap.set(h1, { opacity: 1 });
        gsap
          .timeline({
            onComplete: () => {
              // each letter now fills its box exactly: unlock so the name reflows normally on resize
              chars.forEach((c) => {
                c.style.width = "";
                c.style.height = "";
                c.style.textAlign = "";
                c.style.contain = "";
              });
              scrollCompress();
            },
          })
          .fromTo(
            split.chars,
            { "--wdth": 62, opacity: 0, yPercent: 18 },
            {
              "--wdth": 125,
              opacity: 1,
              yPercent: 0,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.028,
              // every new width is a new font instance to shape; stepping by 4 keeps ~16 of them
              // cached across letters and frames instead of a fresh one per letter per frame
              snap: { "--wdth": 4 },
              onComplete: () => gsap.set(split!.chars, { "--wdth": 125 }),
            },
          );
      }));

      const scrollCompress = contextSafe!(() =>
        gsap.to(h1, {
          scaleX: 0.88,
          transformOrigin: "0% 50%",
          ease: "none",
          scrollTrigger: { start: 0, end: () => window.innerHeight, scrub: 0.4 },
        }),
      );

      return () => {
        unsubscribe();
        split?.revert();
      };
    },
    { dependencies: [reduceMotion], revertOnUpdate: true },
  );

  return (
    <h1 ref={ref} id={id} className="hero-name wdth text-display font-semibold tracking-tight">
      {children}
    </h1>
  );
}
