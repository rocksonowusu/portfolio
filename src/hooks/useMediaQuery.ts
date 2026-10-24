"use client";

import { useSyncExternalStore } from "react";

/** Subscribes to a media query. Returns `serverValue` during SSR and hydration. */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * One-off checks for effects. Components that only need these inside effects should use them
 * instead of the hooks below: a hook starts from the server value and flips after hydration,
 * which renders every instance twice (the home page has dozens).
 */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)", true);

/** Desktop mouse/trackpad: the only place the custom cursor and magnetic pull run. */
export const useFinePointer = () =>
  useMediaQuery("(hover: hover) and (pointer: fine)");
