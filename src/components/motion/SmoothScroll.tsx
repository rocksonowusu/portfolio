"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

// The Lenis instance lives outside React: it is an external system that components subscribe to.
let current: Lenis | null = null;
const listeners = new Set<() => void>();
const setCurrent = (lenis: Lenis | null) => {
  current = lenis;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The active Lenis instance, or null when smooth scrolling is off (reduced motion, SSR). */
export const useLenis = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );

/** Scrolls to an element or selector through Lenis when it runs, natively otherwise. */
export function scrollToTarget(lenis: Lenis | null, target: string | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView();
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (reduceMotion) return;

    const instance = new Lenis({ lerp: 0.11, anchors: true, stopInertiaOnNavigate: true });
    const tick = (time: number) => instance.raf(time * 1000);

    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setCurrent(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setCurrent(null);
    };
  }, [reduceMotion]);

  // New route: start at the top and re-measure every trigger once the page has laid out.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      lenis?.scrollTo(0, { immediate: true, force: true });
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return children;
}
