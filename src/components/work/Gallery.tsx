"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { ImageEntry } from "@/content/images";

// the lightbox (and Motion with it) loads on first open
const Lightbox = dynamic(() => import("./Lightbox").then((m) => m.Lightbox), { ssr: false });

export type GalleryItem = { thumb: React.ReactNode; image: ImageEntry; alt: string };

/** §7.6: masonry of the remaining images; each opens a fullscreen lightbox. */
export function Gallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <ul className="columns-2 gap-[clamp(0.75rem,2vw,1.5rem)] md:columns-3 xl:columns-4">
        {items.map((item, i) => (
          <li key={item.image.name} className="mb-[clamp(0.75rem,2vw,1.5rem)] break-inside-avoid">
            <button
              type="button"
              data-cursor="Open"
              className="group block w-full text-left"
              aria-label={`Open image ${i + 1} of ${items.length}: ${item.alt}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setLoaded(true);
                setOpen(i);
              }}
            >
              {item.thumb}
            </button>
          </li>
        ))}
      </ul>
      {loaded && (
        <Lightbox
          items={items}
          index={open}
          title={title}
          onIndex={setOpen}
          onClose={() => {
            setOpen(null);
            opener.current?.focus();
          }}
        />
      )}
    </>
  );
}
