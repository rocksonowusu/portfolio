// Coordinates the first-visit preloader (M1) with the hero entrance (M4):
// the hero waits until the preloader sheet has lifted, or starts at once when there is none.

let done = false;
const waiting = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  waiting.forEach((cb) => cb());
  waiting.clear();
}

/** Runs `cb` once the intro has finished (immediately if it already has). Returns an unsubscribe. */
export function onIntroDone(cb: () => void) {
  if (done) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  return () => waiting.delete(cb);
}

export const INTRO_KEY = "rko:intro-seen";

/**
 * Runs in <head> before first paint: marks JS as available and whether this session has already
 * seen the preloader, so CSS can hide the preloader and set the hero's starting state with no flash.
 * The preloader belongs to the front door: arriving on any other page (a shared case-study link)
 * counts as having seen it, so that page shows at once.
 */
export const headScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var s=sessionStorage;if(s.getItem('${INTRO_KEY}')||location.pathname!=='/'){d.classList.add('intro-seen');s.setItem('${INTRO_KEY}','1')}}catch(e){if(location.pathname!=='/')d.classList.add('intro-seen')}})();`;
