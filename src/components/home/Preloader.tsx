"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { INTRO_KEY, markIntroDone } from "@/lib/intro";
import { site } from "@/content/site";

/**
 * M1: first visit of the session, when it lands on the home page. The name develops out of white,
 * then the sheet lifts away.
 * Under 1.6s. Visibility before hydration is decided by the <head> script + CSS, so a returning
 * visitor never sees a flash of it.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("intro-seen")) {
      markIntroDone();
      return;
    }
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}

    const root = ref.current!;
    const name = root.querySelector(".preloader-name");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    root.style.animation = "none"; // JS is running: the CSS failsafe is not needed

    const finish = () => {
      html.style.overflow = overflow;
      html.classList.add("intro-seen");
    };

    const tl = gsap.timeline({ onComplete: finish });
    if (reduce) {
      tl.call(markIntroDone).to(root, { opacity: 0, duration: 0.3, delay: 0.2 });
    } else {
      tl.fromTo(
        name,
        { filter: "brightness(2.4) contrast(0.3) blur(14px)", opacity: 0.25 },
        { filter: "brightness(1) contrast(1) blur(0px)", opacity: 1, duration: 0.85, ease: "power2.out" },
      )
        // the hero starts widening as the sheet lifts
        .call(markIntroDone, [], "+=0.1")
        .to(root, { yPercent: -100, duration: 0.6, ease: "power3.inOut" }, "<");
    }
    return () => {
      tl.kill();
      finish();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="preloader fixed inset-0 z-[90] items-end bg-paper px-gutter pb-[18svh] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.25)]"
    >
      <p
        className="preloader-name wdth text-display font-semibold tracking-tight"
        style={{ "--wdth": 125 } as React.CSSProperties}
      >
        {site.name}
      </p>
    </div>
  );
}
