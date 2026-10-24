"""Portrait edit (CLAUDE.md §8).

    python -I scripts/portrait.py [--model u2net_human_seg] [--skip-cutout]

Reads   raw/me/portrait.(jpg|jpeg|png)
        raw/me/portrait-cutout-source.png      optional: Rockson's retouched B&W portrait on white
                                               (2026-10-24). When present it is used for the cut-out
                                               and the square crop instead of the enlarged original.
Writes  raw/me/processed/portrait-bw.png       full-frame black & white (for /about)
        raw/me/processed/portrait-square.png   1:1 crop (OG / share images)
        raw/me/processed/portrait-cutout.png   background removed, graded, transparent
        raw/.cache/portrait-review.jpg         before/after sheet for approval
Then run `node scripts/process-images.mjs` to publish them to public/images/me.

The source is small (533x800), so it is enlarged 2x before grading: the film grain is added at
the final size, which reads as texture rather than as upscaling blur.
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path.cwd()
RAW = ROOT / "raw/me"
CUTOUT_SOURCE = RAW / "portrait-cutout-source.png"
OUT = RAW / "processed"
CACHE = ROOT / "raw/.cache"

PAPER = (255, 255, 255)
CHALK = (246, 247, 247)

SCALE = 2
# Face centre in source pixels, used for the square crop.
FACE_Y = 290
# The laptop lid enters the frame here (source pixels): the cut-out fades out above it.
FADE_START, FADE_END = 400, 485


def find_source() -> Path:
    for ext in ("jpg", "jpeg", "png"):
        p = RAW / f"portrait.{ext}"
        if p.exists():
            return p
    raise SystemExit("raw/me/portrait.(jpg|jpeg|png) not found")


def grade(rgb: Image.Image, seed: int = 7) -> Image.Image:
    """True greyscale, lifted whites, deep but not crushed blacks, light film grain."""
    a = np.asarray(rgb.convert("RGB"), dtype=np.float32) / 255.0
    # channel mix like an orange filter on B&W film: lifts skin and the red shirt away from the
    # black jacket, where plain Rec. 709 luminance merges them
    y = a[..., 0] * 0.42 + a[..., 1] * 0.48 + a[..., 2] * 0.10

    # levels: stretch to the image's own range
    lo, hi = np.percentile(y, [0.4, 99.6])
    y = np.clip((y - lo) / (hi - lo), 0, 1)

    # open the shadows so skin keeps its detail, then a gentle S for depth
    y = y ** 0.78
    y = y + 0.10 * y * (1 - y) * (2 * y - 1) * 2

    # output range: blacks sit at ~5% (deep, not crushed), whites are lifted to ~99%
    y = 0.05 + y * (0.99 - 0.05)

    # grain: luminance only, strongest in the midtones, softened slightly so it reads as film
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, 1, y.shape).astype(np.float32)
    noise = np.asarray(
        Image.fromarray(((noise * 32) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.55)),
        dtype=np.float32,
    )
    noise = (noise - 128) / 32
    y = y + noise * 0.028 * (0.35 + 2.6 * y * (1 - y))

    g = (np.clip(y, 0, 1) * 255).round().astype(np.uint8)
    return Image.fromarray(np.stack([g, g, g], axis=-1))


def enlarge(im: Image.Image) -> Image.Image:
    big = im.resize((im.width * SCALE, im.height * SCALE), Image.Resampling.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))


def cutout(src: Image.Image, model: str) -> Image.Image:
    from rembg import new_session, remove

    mask = remove(src, session=new_session(model), only_mask=True, post_process_mask=True).convert("L")
    mask = mask.resize((src.width * SCALE, src.height * SCALE), Image.Resampling.LANCZOS)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))

    # fade the bottom edge out above the laptop so the bust sits on the paper
    m = np.asarray(mask, dtype=np.float32)
    rows = np.arange(m.shape[0], dtype=np.float32)[:, None] / SCALE
    fade = np.clip((FADE_END - rows) / (FADE_END - FADE_START), 0, 1)
    fade = fade * fade * (3 - 2 * fade)  # smoothstep
    m = (m * fade).clip(0, 255).astype(np.uint8)
    return Image.fromarray(m)


def cutout_from_source(model: str) -> tuple[Image.Image, Image.Image]:
    """The retouched portrait: already graded, on white. Make it true greyscale and cut it out."""
    from rembg import new_session, remove

    src = Image.open(CUTOUT_SOURCE).convert("RGB")
    g = src.convert("L")  # removes the faint colour cast in the delivered file
    grey = Image.merge("RGB", (g, g, g))
    mask = remove(src, session=new_session(model), only_mask=True, post_process_mask=True).convert("L")
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    cut = grey.copy()
    cut.putalpha(mask)
    return grey, cut


def on(bg: tuple[int, int, int], im: Image.Image) -> Image.Image:
    base = Image.new("RGB", im.size, bg)
    base.paste(im, mask=im.getchannel("A"))
    return base


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="u2net_human_seg")
    ap.add_argument("--skip-cutout", action="store_true")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)

    src = Image.open(find_source()).convert("RGB")
    bw = grade(enlarge(src))
    bw.save(OUT / "portrait-bw.png", optimize=True)

    review = [src.resize(bw.size, Image.Resampling.LANCZOS), bw]
    retouched = CUTOUT_SOURCE.exists() and not args.skip_cutout
    if retouched:
        grey, cut = cutout_from_source(args.model)
        # square: full width, as close to the top as the face allows
        side = min(grey.size)
        grey.crop((0, 0, side, side)).save(OUT / "portrait-square.png", optimize=True)
    else:
        side = bw.width
        top = int(min(max(FACE_Y * SCALE - side / 2, 0), bw.height - side))
        bw.crop((0, top, side, top + side)).save(OUT / "portrait-square.png", optimize=True)

    if not args.skip_cutout:
        if not retouched:
            cut = bw.copy()
            cut.putalpha(cutout(src, args.model))
        # trim the empty canvas around the figure
        cut = cut.crop(cut.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
        cut.save(OUT / "portrait-cutout.png", optimize=True)
        for bg in (PAPER, CHALK):
            shown = cut.copy()
            shown.thumbnail(bw.size)
            framed = Image.new("RGB", bw.size, bg)
            x = (bw.width - shown.width) // 2
            framed.paste(on(bg, shown), (x, bw.height - shown.height - 40))
            review.append(framed)

    gap = 24
    sheet = Image.new("RGB", (sum(r.width for r in review) + gap * (len(review) + 1), bw.height + gap * 2), (205, 208, 208))
    x = gap
    for r in review:
        sheet.paste(r, (x, gap))
        x += r.width + gap
    sheet.thumbnail((3200, 3200))
    sheet.save(CACHE / "portrait-review.jpg", quality=88)
    print("wrote", ", ".join(p.name for p in sorted(OUT.glob("*.png"))))


if __name__ == "__main__":
    main()
