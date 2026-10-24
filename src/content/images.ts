import manifest from "./images.generated.json";

// Typed access to the output of scripts/process-images.mjs. Server-side only: the manifest
// carries every blur placeholder, so pass single entries down to client components.

export type Device = "phone" | "desktop" | "photo";

export type ImageEntry = {
  name: string;
  /** Delivered subfolder, kebab-cased ("admin-workspace", "hardware"), or "main". */
  group: string;
  /** Path without width/extension: `${src}-${width}.avif` */
  src: string;
  width: number;
  height: number;
  aspect: number;
  widths: number[];
  formats: ("avif" | "webp" | "png")[];
  device: Device;
  blurDataURL: string;
};

export type VideoEntry = {
  name: string;
  mp4: string;
  webm: string;
  width: number;
  height: number;
  duration: number;
  poster: ImageEntry;
};

type Manifest = {
  projects: Record<string, ImageEntry[]>;
  me: ImageEntry[];
  videos: Record<string, VideoEntry[]>;
};

const data = manifest as Manifest;

export const projectImages = (slug: string) => data.projects[slug] ?? [];

export function projectImage(slug: string, name: string) {
  const entry = projectImages(slug).find((e) => e.name === name);
  if (!entry) throw new Error(`No image "${name}" for project "${slug}"`);
  return entry;
}

export const projectVideos = (slug: string) => data.videos[slug] ?? [];

export function meImage(name: string) {
  const entry = data.me.find((e) => e.name === name);
  if (!entry) throw new Error(`No portrait image "${name}": run npm run portrait && npm run images`);
  return entry;
}

/** URL for the closest generated width at or above `width`. */
export function imageUrl(entry: ImageEntry, width: number, format: "avif" | "webp" | "png" = "avif") {
  if (format === "png") return `${entry.src}.png`;
  const w = entry.widths.find((x) => x >= width) ?? entry.widths.at(-1)!;
  return `${entry.src}-${w}.${format}`;
}
