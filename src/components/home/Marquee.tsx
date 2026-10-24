import { TechLabel } from "@/components/media/TechIcon";
import { techIcon } from "@/content/tech";

/** M12: slow tech-stack strip, each tool with its mark; pauses on hover; static (wrapped) with reduced motion. */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-baseline gap-[clamp(2rem,5vw,5rem)] pr-[clamp(2rem,5vw,5rem)]" aria-hidden={hidden}>
      {items.map((item) => (
        <li key={item} className="wdth whitespace-nowrap text-h2 font-semibold" style={{ "--wdth": 112 } as React.CSSProperties}>
          <TechLabel icon={techIcon(item)} label={item} iconClassName="size-[0.85em]" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden border-y border-haze py-6" aria-label={label} role="region">
      <div className="marquee-track flex w-max" style={{ "--marquee-duration": `${items.length * 4}s` } as React.CSSProperties}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
