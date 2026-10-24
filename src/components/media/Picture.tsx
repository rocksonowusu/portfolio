import type { ImageEntry } from "@/content/images";

type PictureProps = {
  image: ImageEntry;
  alt: string;
  /** Rendered width hint, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  /**
   * Above-the-fold image: eager and high fetch priority. No preload hint: the <img> is in the
   * server HTML already, and a hint would also ride along when the page is only prefetched.
   */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

const srcSet = (image: ImageEntry, format: string) =>
  image.widths.map((w) => `${image.src}-${w}.${format} ${w}w`).join(", ");

/**
 * Responsive <picture> over the pre-generated variants from scripts/process-images.mjs:
 * AVIF first, WebP fallback, with the blur placeholder painted behind opaque images.
 */
export function Picture({ image, alt, sizes, priority, className = "", imgClassName = "" }: PictureProps) {
  const opaque = !image.formats.includes("png");
  const largest = image.widths.at(-1)!;

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, "webp")} sizes={sizes} />
      <img
        src={opaque ? `${image.src}-${largest}.webp` : `${image.src}.png`}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        className={`block h-auto w-full ${imgClassName}`}
        style={
          opaque
            ? { backgroundImage: `url(${image.blurDataURL})`, backgroundSize: "cover" }
            : undefined
        }
      />
    </picture>
  );
}
