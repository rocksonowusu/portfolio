"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const DOT = 10;
const RING = 84;

/**
 * Custom cursor (M7). A small ink dot that inverts whatever it crosses; over anything marked
 * `data-cursor="view"` (or another label) it grows into a circle carrying that label.
 * Desktop pointers only: never rendered for touch.
 */
export function Cursor() {
  const finePointer = useFinePointer();
  if (!finePointer) return null;
  return <CursorDot />;
}

function CursorDot() {
  const rootRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current!;
    const circle = circleRef.current!;
    const label = labelRef.current!;
    const lag = reduceMotion ? 0 : 0.35;
    const xTo = gsap.quickTo(root, "x", { duration: lag, ease: "power3.out" });
    const yTo = gsap.quickTo(root, "y", { duration: lag, ease: "power3.out" });
    let current: string | null = null;
    let last: { x: number; y: number } | null = null;
    let frame = 0;

    document.documentElement.classList.add("has-cursor");
    gsap.set(root, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(circle, { scale: DOT / RING });

    const setMode = (text: string | null) => {
      if (text === current) return;
      current = text;
      label.textContent = text ?? "";
      gsap.to(circle, {
        scale: text ? 1 : DOT / RING,
        duration: reduceMotion ? 0 : 0.4,
        ease: "power3.out",
      });
      gsap.to(label, { opacity: text ? 1 : 0, duration: reduceMotion ? 0 : 0.2 });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = { x: e.clientX, y: e.clientY };
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(root, { opacity: 1, duration: 0.2, overwrite: "auto" });
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      setMode(target?.dataset.cursor ?? null);
    };
    // scrolling moves the page under a still pointer: re-check what it is over
    const onScroll = () => {
      if (!last || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = document.elementFromPoint(last!.x, last!.y)?.closest<HTMLElement>("[data-cursor]");
        setMode(el?.dataset.cursor ?? null);
      });
    };
    const onLeave = () => gsap.to(root, { opacity: 0, duration: 0.2 });
    const onDown = () => gsap.to(root, { scale: 0.8, duration: 0.15 });
    const onUp = () => {
      gsap.to(root, { scale: 1, duration: 0.3 });
      // a click can open or close something under a still pointer
      setTimeout(onScroll, 50);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      gsap.killTweensOf([root, circle, label]);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
      style={{ width: RING, height: RING }}
    >
      <div
        ref={circleRef}
        className="flex size-full items-center justify-center rounded-full bg-paper"
      >
        <span
          ref={labelRef}
          className="text-small font-medium text-ink opacity-0"
          style={{ fontStretch: "112%" }}
        />
      </div>
    </div>
  );
}
