import type { SimpleIcon } from "simple-icons";

/** A brand mark as inline SVG in the current text colour. Decorative: the name is always beside it. */
export function TechIcon({ icon, className = "" }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" className={`shrink-0 ${className}`}>
      <path d={icon.path} />
    </svg>
  );
}

/** A tool's name with its mark in front, when it has one. */
export function TechLabel({ icon, label, iconClassName = "size-[0.9em]" }: { icon?: SimpleIcon; label: string; iconClassName?: string }) {
  return (
    <span className="inline-flex items-center gap-[0.45em]">
      {icon && <TechIcon icon={icon} className={iconClassName} />}
      {label}
    </span>
  );
}
