"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { registerPageTransition, type PageTransitionStart } from "@/lib/page-transition";

/** Give up waiting and lift the sheet if a route never arrives. */
const TIMEOUT_MS = 12000;

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/**
 * The sheet for M10 (see lib/page-transition): slides up over the page on click, shows the
 * destination's name developing and a progress line while the route loads, then lifts away.
 * Reduced motion: the same sheet fades in and out, with no sliding or flying image.
 */
export function PageTransition() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const run = useRef<{
    from: string;
    covered: Promise<unknown>;
    reduce: boolean;
    clone: boolean;
    timer: number;
  } | null>(null);
  const revealRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = rootRef.current!;
    const sheet = root.querySelector<HTMLElement>("[data-sheet]")!;
    const label = root.querySelector<HTMLElement>("[data-label]")!;
    const bar = root.querySelector<HTMLElement>("[data-bar]")!;
    const clone = root.querySelector<HTMLImageElement>("[data-clone]")!;
    let progress: gsap.core.Tween | null = null;

    const reset = () => {
      gsap.killTweensOf([sheet, label, bar, clone]);
      progress?.kill();
      root.style.visibility = "hidden";
      root.style.pointerEvents = "none";
      gsap.set(sheet, { yPercent: 100, opacity: 1 });
      gsap.set(clone, { opacity: 0 });
      clone.removeAttribute("src");
      run.current = null;
    };
    reset();

    const reveal = async () => {
      const r = run.current;
      if (!r) return;
      window.clearTimeout(r.timer);
      await r.covered;
      await nextFrame(); // let the new page lay out and scroll to the top

      const target = [...document.querySelectorAll<HTMLElement>("[data-cover-target]")].find(
        (el) => el.getClientRects().length > 0,
      );
      // don't reveal a cover that is still blank
      await target?.querySelector("img")?.decode().catch(() => {});

      const tl = gsap.timeline({ onComplete: reset });
      tl.to(bar, { scaleX: 1, duration: 0.2, ease: "power2.out" }, 0);
      if (r.reduce) {
        tl.to(sheet, { opacity: 0, duration: 0.25 }, 0.1);
        return;
      }
      if (r.clone) {
        if (target) {
          const rect = target.getBoundingClientRect();
          tl.to(clone, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, duration: 0.8, ease: "power3.inOut" }, 0);
        }
        tl.to(clone, { opacity: 0, duration: 0.35 }, target ? 0.75 : 0.2);
      }
      tl.to(sheet, { yPercent: -100, duration: 0.75, ease: "power3.inOut" }, 0.1);
    };
    revealRef.current = reveal;

    registerPageTransition({
      start: ({ label: text, source }: PageTransitionStart) => {
        reset();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        label.textContent = text;
        root.style.visibility = "visible";
        root.style.pointerEvents = "auto"; // nothing underneath is clickable mid-transition

        // the progress line creeps towards the end until the route arrives
        progress = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 0.88, duration: 5, ease: "power2.out" });

        let covered: Promise<unknown>;
        if (reduce) {
          gsap.set(sheet, { yPercent: 0, opacity: 0 });
          gsap.set(label, { opacity: 1, filter: "none" });
          covered = gsap.to(sheet, { opacity: 1, duration: 0.15 }).then();
        } else {
          covered = gsap
            .timeline()
            .fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "power3.inOut" })
            .fromTo(
              label,
              { opacity: 0, filter: "blur(12px) brightness(2.2)" },
              { opacity: 1, filter: "blur(0px) brightness(1)", duration: 0.7, ease: "power2.out" },
              0.3,
            )
            .then();
        }

        const withClone = !reduce && !!source;
        if (withClone) {
          // the clicked image lifts off its card and settles across the lower part of the sheet
          // (a single fixed element, so animating its box is cheap)
          const { rect } = source;
          clone.src = source.src;
          gsap.set(clone, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, opacity: 1 });
          gsap.to(clone, {
            left: 0,
            top: window.innerHeight * 0.42,
            width: window.innerWidth,
            height: window.innerHeight * 0.58,
            duration: 0.8,
            ease: "power3.inOut",
          });
        }

        run.current = {
          from: window.location.pathname,
          covered,
          reduce,
          clone: withClone,
          timer: window.setTimeout(reveal, TIMEOUT_MS),
        };
        return covered;
      },
    });
    return () => {
      registerPageTransition(null);
      reset();
    };
  }, []);

  // the new route has rendered: take the sheet off it
  useEffect(() => {
    if (run.current && run.current.from !== pathname) revealRef.current();
  }, [pathname]);

  return (
    <div ref={rootRef} aria-hidden className="invisible fixed inset-0 z-[80]">
      <div
        data-sheet
        className="absolute inset-0 flex flex-col bg-paper px-gutter pt-28 shadow-[0_-30px_60px_-20px_rgb(0_0_0/0.25)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-haze">
          <div data-bar className="h-px origin-left bg-ink" />
        </div>
        <p
          data-label
          className="wdth max-w-[16ch] text-h1 font-semibold"
          style={{ "--wdth": 118 } as React.CSSProperties}
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a copy of an image already on screen */}
      <img data-clone alt="" className="fixed object-cover opacity-0" />
    </div>
  );
}
