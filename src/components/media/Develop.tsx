"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/hooks/useMediaQuery";
import { onIntroDone } from "@/lib/intro";

type DevelopProps = {
  children: React.ReactNode;
  className?: string;
  /** Greyscale at rest; colour on hover (desktop) or while centred in view (touch). */
  mono?: boolean;
  /** Develop as soon as the intro is over instead of on scroll (for images already in view). */
  immediate?: boolean;
  delay?: number;
  /** Marks this as a project cover that can morph into the case-study cover (M10). */
  cover?: boolean;
  style?: React.CSSProperties;
};

/**
 * M3: images develop like darkroom prints. They start as blank, overexposed white
 * (the starting state is set in CSS so it is in place before hydration) and resolve
 * into the photo as they enter view. Reduced motion shows the photo as-is.
 */
export function Develop({ children, className = "", mono, immediate, delay = 0, cover, style }: DevelopProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = ref.current!;
      if (prefersReducedMotion() || root.classList.contains("is-developed")) return;
      const film = root.querySelector(".develop-film");
      const veil = root.querySelector(".develop-veil");

      const tl = gsap
        .timeline({
          paused: true,
          delay,
          onComplete: () => {
            root.classList.add("is-developed");
            gsap.set([film, veil], { clearProps: "all" });
          },
        })
        .to(veil, { opacity: 0, duration: 1.1, ease: "power2.out" }, 0)
        .to(film, { filter: "brightness(1) contrast(1) blur(0px)", duration: 1.6, ease: "power2.out" }, 0);

      if (immediate) return onIntroDone(contextSafe!(() => tl.play()));
      // an observer, not a ScrollTrigger: there are dozens of these and none needs a scroll position,
      // so they stay out of ScrollTrigger's layout measuring on every refresh
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      io.observe(root);
      return () => io.disconnect();
    },
    { scope: ref },
  );

  // Touch screens have no hover: colour comes in while the image sits in the middle of the screen.
  useEffect(() => {
    if (!mono || hasFinePointer()) return;
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([entry]) => el.toggleAttribute("data-centred", entry.isIntersecting),
      { rootMargin: "-40% 0px -40% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mono]);

  return (
    <div
      ref={ref}
      data-cover={cover || undefined}
      style={style}
      className={`develop relative overflow-hidden ${mono ? "mono" : ""} ${className}`}
    >
      <div className="develop-film">{children}</div>
      <div className="develop-veil" aria-hidden />
    </div>
  );
}
