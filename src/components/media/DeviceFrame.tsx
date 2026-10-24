import type { Device } from "@/content/images";

/** Minimal frames (§7): a thin ink phone, a white browser window, nothing around photos. */
export function DeviceFrame({
  device,
  children,
  className = "",
}: {
  device: Device;
  children: React.ReactNode;
  className?: string;
}) {
  if (device === "phone") {
    return (
      <div
        className={`overflow-hidden rounded-[clamp(1.25rem,3vw,2.25rem)] border-[clamp(4px,0.6vw,7px)] border-ink bg-ink ${className}`}
      >
        {children}
      </div>
    );
  }
  if (device === "desktop") {
    return (
      <div className={`overflow-hidden border border-haze bg-paper ${className}`}>
        <div className="flex h-[clamp(14px,1.6vw,22px)] items-center gap-[0.35em] px-[0.6em] text-[clamp(5px,0.5vw,7px)]" aria-hidden>
          <span className="size-[1em] rounded-full bg-haze" />
          <span className="size-[1em] rounded-full bg-haze" />
          <span className="size-[1em] rounded-full bg-haze" />
        </div>
        {children}
      </div>
    );
  }
  return <div className={className}>{children}</div>;
}
