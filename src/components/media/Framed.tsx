import { Develop } from "@/components/media/Develop";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Picture } from "@/components/media/Picture";
import type { ImageEntry } from "@/content/images";

/** One project image in its device frame, developing in as it enters view. */
export function Framed({
  image,
  alt,
  sizes,
  mono = true,
  className = "",
}: {
  image: ImageEntry;
  alt: string;
  sizes: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <Develop mono={mono} className={className}>
      <DeviceFrame device={image.device}>
        <Picture image={image} alt={alt} sizes={sizes} />
      </DeviceFrame>
    </Develop>
  );
}

/** "admin-page2-academic-data" → "admin page 2, academic data"; timestamps say nothing. */
export function describe(project: string, name: string) {
  if (/^screenshot-\d/.test(name)) return `${project} screen`;
  const words = name
    .replace(/^\d+-/, "")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/-/g, " ");
  return `${project}: ${words}`;
}
