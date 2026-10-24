"use client";

import { useRef, useState } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { Kind, Status } from "@/content/projects";

export type IndexItem = {
  slug: string;
  title: string;
  kind: Kind[];
  status: Status;
  year?: string;
  credits?: string;
  /** Small screenshots that trail the cursor over this row (M8). */
  trail: string[];
  card: React.ReactNode;
};

const FILTERS: ("All" | Kind)[] = ["All", "Web", "Mobile", "IoT", "AI"];
const TRAIL_STEP = 90; // px of pointer travel between images
const TRAIL_MAX = 6;

export function WorkIndex({ items }: { items: IndexItem[] }) {
  const [filter, setFilter] = useState<"All" | Kind>("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const visible = items.filter(
    (i) => filter === "All" || i.kind.includes(filter),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const first = useRef(true);

  // filtering or switching view changes the sheet's height; the rows or cards that show fade in
  useGSAP(
    () => {
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      if (first.current) first.current = false;
      else if (!reduceMotion)
        gsap.from("[data-results] > li", {
          opacity: 0,
          y: 12,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.out",
        });
      return () => cancelAnimationFrame(id);
    },
    { scope: rootRef, dependencies: [filter, view] },
  );

  return (
    <div ref={rootRef}>
      <div className="flex flex-col gap-6 border-b border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div
          role="group"
          aria-label="Filter by kind"
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className="border border-ink px-4 py-1.5 text-small transition-colors aria-pressed:bg-ink aria-pressed:text-paper"
            >
              {f}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Layout" className="flex gap-6 text-small">
          {(["list", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className="link-underline capitalize text-graphite aria-pressed:text-ink"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <TrailList items={visible} />
      ) : (
        <ul
          data-results
          className="mt-12 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((item) => (
            <li key={item.slug}>{item.card}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** List view. On desktop, a row's screenshots trail behind the cursor while it moves over it (M8). */
function TrailList({ items }: { items: IndexItem[] }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();
  const trail = finePointer && !reduceMotion;
  const state = useRef({ x: 0, y: 0, travelled: 0, index: 0, slug: "" });

  const onMove = (e: React.PointerEvent, item: IndexItem) => {
    if (!trail || e.pointerType !== "mouse" || !item.trail.length) return;
    const s = state.current;
    if (s.slug !== item.slug) {
      s.slug = item.slug;
      s.index = 0;
      s.travelled = TRAIL_STEP; // drop one straight away
    }
    s.travelled += Math.hypot(e.clientX - s.x, e.clientY - s.y);
    s.x = e.clientX;
    s.y = e.clientY;
    if (s.travelled < TRAIL_STEP) return;
    s.travelled = 0;

    const layer = layerRef.current!;
    const img = document.createElement("img");
    img.src = item.trail[s.index++ % item.trail.length];
    img.alt = "";
    img.decoding = "async";
    img.className =
      "absolute w-[clamp(180px,16vw,280px)] -translate-x-1/2 -translate-y-1/2 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.35)]";
    img.style.left = `${e.clientX}px`;
    img.style.top = `${e.clientY}px`;
    layer.appendChild(img);
    while (layer.childElementCount > TRAIL_MAX)
      layer.firstElementChild!.remove();

    gsap
      .timeline({ onComplete: () => img.remove() })
      .fromTo(
        img,
        { scale: 0.7, opacity: 0, rotate: gsap.utils.random(-4, 4) },
        { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" },
      )
      .to(
        img,
        { scale: 0.85, opacity: 0, duration: 0.5, ease: "power2.in" },
        "+=0.45",
      );
  };

  const clear = () => {
    state.current.slug = "";
    const layer = layerRef.current;
    if (layer)
      gsap.to(layer.children, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => layer.replaceChildren(),
      });
  };

  return (
    <>
      <ul data-results onPointerLeave={clear}>
        {items.map((item) => (
          <li
            key={item.slug}
            className="border-b border-haze"
            onPointerMove={(e) => onMove(e, item)}
          >
            <TransitionLink
              href={`/work/${item.slug}`}
              label={item.title}
              data-cursor="View"
              className="group grid gap-x-6 gap-y-1 py-7 md:grid-cols-12 md:items-baseline"
            >
              <span className="stretch-on-hover wdth text-h2 font-semibold md:col-span-6">
                {item.title}
              </span>
              <span className="text-small text-graphite md:col-span-2">
                {item.kind.join(", ")}
              </span>
              <span className="text-small text-graphite md:col-span-3">
                {item.credits}
              </span>
              <span className="text-small md:col-span-1 md:text-right">
                {item.status === "Live" ? "Live" : (item.year ?? "")}
              </span>
            </TransitionLink>
          </li>
        ))}
      </ul>
      {trail && (
        <div
          ref={layerRef}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70]"
        />
      )}
    </>
  );
}
