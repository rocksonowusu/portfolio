"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Picture } from "@/components/media/Picture";
import { useLenis } from "@/components/motion/SmoothScroll";
import type { GalleryItem } from "./Gallery";

type LightboxProps = {
  items: GalleryItem[];
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/** Fullscreen viewer for the case-study gallery: arrows, swipe, Esc, focus kept inside. */
export function Lightbox({ index, ...props }: LightboxProps & { index: number | null }) {
  return <AnimatePresence>{index !== null && <Viewer index={index} {...props} />}</AnimatePresence>;
}

function Viewer({ items, index, title, onIndex, onClose }: LightboxProps & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(0);
  const item = items[index];

  const go = useCallback(
    (step: number) => {
      setDirection(step);
      onIndex((index + step + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  // keyboard: arrows, Esc, and focus kept inside the dialog
  useEffect(() => {
    const dialog = ref.current!;
    dialog.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const focusable = [...dialog.querySelectorAll<HTMLElement>("button")];
        const i = focusable.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          focusable.at(-1)?.focus();
        } else if (!e.shiftKey && i === focusable.length - 1) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // freeze the page behind
  useEffect(() => {
    lenis?.stop();
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      lenis?.start();
      html.style.overflow = overflow;
    };
  }, [lenis]);

  // swipe
  const start = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") start.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (start.current === null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return createPortal(
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} gallery`}
      data-lenis-prevent
      className="fixed inset-0 z-[95] flex flex-col bg-paper text-ink"
      initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
      animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
      exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-baseline justify-between px-gutter py-5 text-small">
        <p aria-live="polite">
          {index + 1} of {items.length}
        </p>
        <button type="button" data-close onClick={onClose} className="link-underline text-body">
          Close
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-gutter"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.figure
            key={item.image.name}
            custom={direction}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-full flex-col items-center"
          >
            <Picture
              image={item.image}
              alt={item.alt}
              sizes="90vw"
              className="block"
              imgClassName={`max-h-[calc(100svh-10rem)] w-auto! max-w-full object-contain ${
                item.image.device === "phone" ? "rounded-[1.5rem] border-[6px] border-ink" : "border border-haze"
              }`}
            />
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="flex justify-between px-gutter py-5">
        <button type="button" onClick={() => go(-1)} className="link-underline">
          Previous
        </button>
        <button type="button" onClick={() => go(1)} className="link-underline">
          Next
        </button>
      </div>
    </motion.div>,
    document.body,
  );
}
