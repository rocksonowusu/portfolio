// Route transitions (M10). A paper sheet covers the page the moment a link is clicked, carries a
// loader while the next route loads, then lifts off it. The page is never frozen, so the loader
// keeps moving however long the route takes (View Transitions freeze the page until the next one
// has rendered, which read as a stall). A clicked project image flies onto the sheet and lands on
// the case-study cover (`[data-cover-target]`).

export type PageTransitionStart = {
  href: string;
  /** Shown large on the sheet while loading. */
  label: string;
  /** The clicked project image, to carry across. */
  source?: { src: string; rect: DOMRect };
};

/** `start` resolves once the sheet fully covers the page: swap routes only then. */
type Controller = { start: (t: PageTransitionStart) => Promise<unknown> };

let controller: Controller | null = null;

export const registerPageTransition = (c: Controller | null) => {
  controller = c;
};

export const startPageTransition = (t: PageTransitionStart) => controller?.start(t) ?? Promise.resolve();
