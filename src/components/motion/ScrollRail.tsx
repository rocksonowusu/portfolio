"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/motion/SmoothScroll";

/** Fine dots in the track. */
const DOTS = 44;

type Section = { label: string; marker: HTMLElement };

const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
/** Where a sheet starts, measured live: pinned blocks size themselves after mount, so cached
 * positions go stale. Markers are never sticky, so this is their true document position. */
const topOf = (marker: HTMLElement) => marker.getBoundingClientRect().top + window.scrollY;

/** The sheets on the current page, and what each is called. */
function readSections(): Section[] {
  if (maxScroll() <= 0) return [];
  return [...document.querySelectorAll<HTMLElement>("[data-sheet-marker]")]
    .filter((m) => m.getClientRects().length > 0)
    .map((m) => {
      const sheet = m.tagName === "FOOTER" ? m : (m.nextElementSibling as HTMLElement | null);
      const labelledBy = sheet?.getAttribute("aria-labelledby");
      const label =
        m.tagName === "FOOTER"
          ? "Contact"
          : (sheet?.dataset.railLabel ??
            sheet?.getAttribute("aria-label") ??
            (labelledBy && document.getElementById(labelledBy)?.textContent?.trim()) ??
            "Section");
      return { label: label.replace(/^Featured: /, ""), marker: m };
    });
}

/**
 * The scroll bar, drawn in dots. It replaces the native bar everywhere (hidden in CSS); on
 * phones it is slimmer and sits closer to the edge, and can be dragged with a finger.
 * A track of fine dots fills with ink down to the current position, each sheet is a ring on
 * the track that fills once passed, and a solid ink dot is the thumb: drag it or click the
 * track to scroll, or use a section ring (a real button, with its name on hover) to go there.
 */
export function ScrollRail() {
  const pathname = usePathname();
  const lenis = useLenis();
  const railRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<Section[]>([]);

  // which sheets are on this page; re-read whenever layout settles (ScrollTrigger refreshes on
  // route changes, resizes, filters and pinned blocks resizing)
  useEffect(() => {
    const read = () => setSections(readSections());
    const id = requestAnimationFrame(read);
    ScrollTrigger.addEventListener("refresh", read);
    return () => {
      cancelAnimationFrame(id);
      ScrollTrigger.removeEventListener("refresh", read);
    };
  }, [pathname]);

  // follow the scroll without re-rendering: the thumb moves and the dots behind it fill
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const dots = [...rail.querySelectorAll<HTMLElement>("[data-dot]")];
    const rings = [...rail.querySelectorAll<HTMLElement>("[data-ring]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      // read everything first, then write, so this costs one layout at most
      const max = maxScroll();
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const ats = sections.map((s) => (max > 0 ? Math.min(1, topOf(s.marker) / max) : 0));

      rail.style.setProperty("--p", String(p));
      const filled = Math.round(p * (DOTS - 1));
      dots.forEach((d, i) => d.toggleAttribute("data-on", i <= filled));
      let current = -1;
      rings.forEach((r, i) => {
        const at = ats[i];
        r.style.top = `${at * 100}%`;
        const passed = p >= at - 0.002;
        r.toggleAttribute("data-on", passed);
        if (passed) current = i;
      });
      rings.forEach((r, i) => r.toggleAttribute("data-current", i === current));
    };
    // after a scroll, every section name shows for a moment, then only the current one stays
    const nav = rail.closest("nav")!;
    let quiet = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onUserScroll = () => {
      onScroll();
      nav.setAttribute("data-active", "");
      window.clearTimeout(quiet);
      quiet = window.setTimeout(() => nav.removeAttribute("data-active"), 1200);
    };
    update();
    window.addEventListener("scroll", onUserScroll, { passive: true });
    // the page changing height (pins sizing, filters, images) moves the rings too
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onUserScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(quiet);
    };
  }, [sections]);

  const scrollTo = (y: number, immediate = false) => {
    if (lenis) lenis.scrollTo(y, immediate ? { immediate: true } : { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  };

  // drag the thumb, or press anywhere on the track: the page follows the pointer
  const fromPointer = (clientY: number) => {
    const r = railRef.current!.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    return p * (document.documentElement.scrollHeight - window.innerHeight);
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const rail = e.currentTarget;
    rail.setPointerCapture(e.pointerId);
    rail.dataset.dragging = "";
    scrollTo(fromPointer(e.clientY), true);
    const move = (ev: PointerEvent) => scrollTo(fromPointer(ev.clientY), true);
    const up = () => {
      delete rail.dataset.dragging;
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerup", up);
      rail.removeEventListener("pointercancel", up);
    };
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
  };

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Page sections" className="scroll-rail pointer-events-none fixed top-1/2 right-0.5 z-50 -translate-y-1/2 text-paper mix-blend-difference md:right-[clamp(10px,1.3vw,22px)]">
      <div
        ref={railRef}
        onPointerDown={onPointerDown}
        className="pointer-events-auto relative h-[40svh] w-4 cursor-ns-resize touch-none select-none md:h-[46svh] md:w-6"
      >
        {/* the track: fine dots */}
        {Array.from({ length: DOTS }, (_, i) => (
          <span
            key={i}
            data-dot
            aria-hidden
            className="rail-dot absolute left-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
            style={{ top: `${(i / (DOTS - 1)) * 100}%` }}
          />
        ))}

        {/* the sheets: rings you can jump to */}
        {sections.map((s, i) => (
          <button
            key={`${s.label}-${i}`}
            type="button"
            data-ring
            onClick={() => scrollTo(topOf(s.marker))}
            aria-label={`Go to ${s.label}`}
            className="rail-ring group absolute left-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center"
          >
            <span className="rail-ring-dot block rounded-full border border-current" />
            <span className="rail-label pointer-events-none absolute right-7 whitespace-nowrap text-small font-medium">
              {s.label}
            </span>
          </button>
        ))}

        {/* the thumb */}
        <span
          aria-hidden
          className="rail-thumb absolute left-1/2 size-[11px] rounded-full bg-current"
          style={{ top: "calc(var(--p, 0) * 100%)" }}
        />
      </div>
    </nav>
  );
}
