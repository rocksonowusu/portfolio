/**
 * Scroll positions for a tall block inside a sheet (M5, M6).
 *
 * Sheets are position: sticky, so measuring their contents can be wrong while a sheet is stuck.
 * The in-flow marker before each sheet is never sticky: it gives the sheet's true document
 * position, and the block's offset inside the sheet does not depend on scroll.
 */
export function sheetRange(block: HTMLElement) {
  const sheet = block.closest<HTMLElement>(".sheet")!;
  const marker = sheet.previousElementSibling as HTMLElement;
  const docTop = () => marker.getBoundingClientRect().top + window.scrollY;
  const offsetInSheet = () => {
    let y = 0;
    for (let el: HTMLElement | null = block; el && el !== sheet; el = el.offsetParent as HTMLElement | null) {
      y += el.offsetTop;
    }
    return y;
  };
  return {
    /** Scroll position where the block's top reaches the top of the viewport. */
    start: () => docTop() + offsetInSheet(),
    /** Scroll position where the block's bottom reaches the bottom of the viewport. */
    end: () => docTop() + offsetInSheet() + block.offsetHeight - window.innerHeight,
  };
}
